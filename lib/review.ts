import { KnowledgeNode, Note, Paper } from '@/types';
import { getAllNodes, getAllNotes, getAllPapers } from '@/lib/db';
import { getAllInsights } from './insights';

// ==================== Types ====================

export type ReviewItemType = 'node' | 'note' | 'paper' | 'insight';
export type ReviewDifficulty = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  title: string;
  front: string;     // 卡片正面（提示/问题）
  back: string;      // 卡片背面（答案/内容）
  tags: string[];
  color: string;
}

export interface ReviewState {
  id: string;           // reviewItemId
  interval: number;     // 当前间隔天数
  repetition: number;   // 重复次数
  easeFactor: number;   // 难度因子 (>= 1.3)
  nextReview: string;   // ISO date
  lastReview: string;   // ISO date
  lastDifficulty: ReviewDifficulty | null;
}

export interface ReviewSession {
  queue: ReviewItem[];
  currentIndex: number;
  results: { itemId: string; difficulty: ReviewDifficulty }[];
  startedAt: string;
}

// ==================== SM-2 Algorithm ====================

const MIN_EASE = 1.3;
const INTERVALS = [1, 3, 7, 14, 30, 60]; // 天

function easeDelta(difficulty: ReviewDifficulty): number {
  switch (difficulty) {
    case 'again': return -0.3;
    case 'hard': return -0.15;
    case 'good': return 0;
    case 'easy': return 0.15;
  }
}

function nextInterval(difficulty: ReviewDifficulty, currentInterval: number, repetition: number): number {
  if (difficulty === 'again') return 1;
  if (difficulty === 'hard') return Math.max(1, Math.floor(currentInterval * 1.2));
  if (difficulty === 'easy') {
    if (repetition <= 1) return 4;
    return Math.floor(currentInterval * 2.5);
  }
  // 'good'
  if (repetition <= 1) return INTERVALS[0] || 1;
  if (repetition <= 2) return INTERVALS[1] || 3;
  return Math.floor(currentInterval * 2);
}

export function processReview(
  state: ReviewState,
  difficulty: ReviewDifficulty
): ReviewState {
  const newEase = Math.max(MIN_EASE, state.easeFactor + easeDelta(difficulty));
  const newRepetition = difficulty === 'again' ? 0 : state.repetition + 1;
  const newInterval = nextInterval(difficulty, state.interval, newRepetition);
  const now = new Date().toISOString();
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    id: state.id,
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: newEase,
    nextReview: nextDate.toISOString(),
    lastReview: now,
    lastDifficulty: difficulty,
  };
}

// ==================== Storage ====================

const REVIEW_STATE_KEY = 'pks_review_states';

export function getReviewStates(): Record<string, ReviewState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REVIEW_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveReviewStates(states: Record<string, ReviewState>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(states));
  } catch { /* ignore */ }
}

export function getReviewState(itemId: string): ReviewState | null {
  const states = getReviewStates();
  return states[itemId] || null;
}

export function updateReviewState(state: ReviewState) {
  const states = getReviewStates();
  states[state.id] = state;
  saveReviewStates(states);
}

// ==================== Build review items ====================

function nodeToReviewItem(node: KnowledgeNode): ReviewItem {
  return {
    id: `node-${node.id}`,
    type: 'node',
    title: node.title,
    front: `知识节点「${node.title}」的主要内容是什么？`,
    back: node.description || node.title,
    tags: node.tags || [],
    color: node.color || '#6366f1',
  };
}

function noteToReviewItem(note: Note): ReviewItem {
  return {
    id: `note-${note.id}`,
    type: 'note',
    title: note.title || '无标题',
    front: `笔记「${note.title || '无标题'}」记录了什么？`,
    back: note.summary || (note.content ? note.content.slice(0, 300) : ''),
    tags: note.tags || [],
    color: '#10b981',
  };
}

function paperToReviewItem(paper: Paper): ReviewItem {
  return {
    id: `paper-${paper.id}`,
    type: 'paper',
    title: paper.title,
    front: `论文「${paper.title}」的核心贡献是什么？`,
    back: paper.abstract || `作者: ${(paper.authors || []).join(', ')}\n年份: ${paper.year || '未知'}`,
    tags: paper.tags || [],
    color: '#f59e0b',
  };
}

function insightToReviewItem(insight: { id: string; content: string; mood: string; tags: string[] }): ReviewItem {
  return {
    id: `insight-${insight.id}`,
    type: 'insight',
    title: insight.mood,
    front: `你有过这样的灵感吗？`,
    back: insight.content,
    tags: insight.tags || [],
    color: '#f43f5e',
  };
}

export function getAllReviewItems(): ReviewItem[] {
  const items: ReviewItem[] = [];
  getAllNodes().forEach(n => items.push(nodeToReviewItem(n)));
  getAllNotes().forEach(n => items.push(noteToReviewItem(n)));
  getAllPapers().forEach(p => items.push(paperToReviewItem(p)));
  getAllInsights().forEach(i => items.push(insightToReviewItem(i)));
  return items;
}

// ==================== Queue generation ====================

export function getDueReviewQueue(): ReviewItem[] {
  const allItems = getAllReviewItems();
  const states = getReviewStates();
  const now = new Date();

  return allItems.filter(item => {
    const state = states[item.id];
    if (!state) return true; // new item
    return new Date(state.nextReview) <= now;
  });
}

export function getDueCount(): number {
  return getDueReviewQueue().length;
}

export function getReviewStats(): {
  total: number;
  due: number;
  newCount: number;
  learning: number;
  mastered: number;
} {
  const all = getAllReviewItems();
  const due = getDueReviewQueue();
  const states = getReviewStates();

  let newCount = 0;
  let learning = 0;
  let mastered = 0;

  Object.values(states).forEach(s => {
    if (s.repetition === 0) newCount++;
    else if (s.interval >= 30) mastered++;
    else learning++;
  });

  newCount += Math.max(0, all.length - Object.keys(states).length);

  return {
    total: all.length,
    due: due.length,
    newCount,
    learning,
    mastered,
  };
}

// ==================== Review history ====================

const REVIEW_HISTORY_KEY = 'pks_review_history';

export function getReviewHistory(): {
  date: string;
  reviewed: number;
  correct: number;
}[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVIEW_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordReviewSession(results: { itemId: string; difficulty: ReviewDifficulty }[]) {
  if (typeof window === 'undefined') return;
  const history = getReviewHistory();
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = history.find(h => h.date === today);
  const correct = results.filter(r => r.difficulty === 'good' || r.difficulty === 'easy').length;

  if (todayEntry) {
    todayEntry.reviewed += results.length;
    todayEntry.correct += correct;
  } else {
    history.unshift({ date: today, reviewed: results.length, correct });
  }

  // Keep last 90 days
  try {
    localStorage.setItem(REVIEW_HISTORY_KEY, JSON.stringify(history.slice(0, 90)));
  } catch { /* ignore */ }
}

export function clearReviewStates() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REVIEW_STATE_KEY);
  localStorage.removeItem(REVIEW_HISTORY_KEY);
}
