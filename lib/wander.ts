import { KnowledgeNode, Note, Paper, Insight } from '@/types';
import { getAllNodes } from './db';
import { getAllNotes } from './db';
import { getAllPapers } from './db';
import { getAllInsights } from './insights';

export type WanderItemType = 'node' | 'note' | 'paper' | 'insight';

export interface WanderItem {
  id: string;
  type: WanderItemType;
  title: string;
  content: string;
  tags: string[];
  color?: string;
  date: string;
  meta?: Record<string, string | number | undefined>;
}

const HISTORY_KEY = 'pks_wander_history';
const MAX_HISTORY = 50;

function nodeToWanderItem(node: KnowledgeNode): WanderItem {
  return {
    id: node.id,
    type: 'node',
    title: node.title,
    content: node.description || '',
    tags: node.tags || [],
    color: node.color || '#6366f1',
    date: node.updatedAt || node.createdAt,
    meta: {
      level: node.level,
      icon: node.icon,
    },
  };
}

function safeSlice(s: string | undefined | null, max: number): string {
  if (!s || typeof s !== 'string') return '';
  try { return s.slice(0, max); } catch { return ''; }
}

function noteToWanderItem(note: Note): WanderItem {
  return {
    id: note.id,
    type: 'note',
    title: note.title || '无标题',
    content: note.summary || safeSlice(note.content, 200),
    tags: note.tags || [],
    color: '#10b981',
    date: note.updatedAt || note.createdAt,
    meta: {
      nodeId: note.nodeId,
    },
  };
}

function paperToWanderItem(paper: Paper): WanderItem {
  return {
    id: paper.id,
    type: 'paper',
    title: paper.title,
    content: paper.abstract || `作者: ${(paper.authors || []).join(', ')}`,
    tags: paper.tags || [],
    color: '#f59e0b',
    date: paper.updatedAt || paper.createdAt,
    meta: {
      authors: (paper.authors || []).join(', '),
      year: paper.year,
      venue: paper.venue,
    },
  };
}

function insightToWanderItem(insight: Insight): WanderItem {
  return {
    id: insight.id,
    type: 'insight',
    title: insight.mood,
    content: insight.content,
    tags: insight.tags || [],
    color: insight.color === 'indigo' ? '#6366f1' :
           insight.color === 'amber' ? '#f59e0b' :
           insight.color === 'emerald' ? '#10b981' :
           insight.color === 'rose' ? '#f43f5e' :
           insight.color === 'cyan' ? '#06b6d4' :
           insight.color === 'violet' ? '#8b5cf6' : '#6366f1',
    date: insight.createdAt,
    meta: {
      pinned: insight.pinned ? 'true' : 'false',
    },
  };
}

export function getAllWanderItems(): WanderItem[] {
  const items: WanderItem[] = [];
  items.push(...getAllNodes().map(nodeToWanderItem));
  items.push(...getAllNotes().map(noteToWanderItem));
  items.push(...getAllPapers().map(paperToWanderItem));
  items.push(...getAllInsights().map(insightToWanderItem));
  return items.sort(() => Math.random() - 0.5);
}

export function getRandomWanderItem(excludeIds: string[] = []): WanderItem | null {
  const items = getAllWanderItems().filter((item) => !excludeIds.includes(item.id));
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export function getRelatedWanderItems(item: WanderItem, limit = 3): WanderItem[] {
  const all = getAllWanderItems().filter((i) => i.id !== item.id);
  const scored = all.map((i) => {
    let score = 0;
    // Tag overlap
    const sharedTags = i.tags.filter((t) => item.tags.includes(t));
    score += sharedTags.length * 3;
    // Same type bonus
    if (i.type === item.type) score += 1;
    // Time proximity
    try {
      const d1 = new Date(i.date).getTime();
      const d2 = new Date(item.date).getTime();
      const daysDiff = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
      if (daysDiff < 7) score += 2;
      else if (daysDiff < 30) score += 1;
    } catch { /* ignore */ }
    return { item: i, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

export function getWanderHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWanderHistory(itemId: string) {
  if (typeof window === 'undefined') return;
  try {
    const history = getWanderHistory();
    const filtered = history.filter((id) => id !== itemId);
    filtered.unshift(itemId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
  } catch { /* ignore */ }
}

export function clearWanderHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

export function getWanderStats(): {
  totalItems: number;
  byType: Record<WanderItemType, number>;
} {
  const items = getAllWanderItems();
  return {
    totalItems: items.length,
    byType: {
      node: items.filter((i) => i.type === 'node').length,
      note: items.filter((i) => i.type === 'note').length,
      paper: items.filter((i) => i.type === 'paper').length,
      insight: items.filter((i) => i.type === 'insight').length,
    },
  };
}
