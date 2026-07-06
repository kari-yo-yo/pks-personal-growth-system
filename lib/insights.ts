import { Insight, InsightMood, InsightColor } from '@/types';

const STORAGE_KEY = 'pks_insights';
const listeners = new Set<() => void>();

export function subscribeInsights(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

function loadFromStorage(): Insight[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(insights: Insight[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(insights));
  } catch {
    console.warn('insights: localStorage write failed');
  }
}

export function getAllInsights(): Insight[] {
  return loadFromStorage().sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function addInsight(
  content: string,
  mood: InsightMood = '💡 灵感',
  color: InsightColor = 'indigo',
  tags: string[] = []
): Insight {
  const id = `ins_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const insight: Insight = {
    id,
    content: content.trim(),
    mood,
    color,
    tags,
    createdAt: new Date().toISOString(),
    pinned: false,
  };
  const insights = [...loadFromStorage(), insight];
  persist(insights);
  notify();
  return insight;
}

export function updateInsight(
  id: string,
  updates: Partial<Omit<Insight, 'id' | 'createdAt'>>
): Insight | undefined {
  const insights = loadFromStorage();
  const idx = insights.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  insights[idx] = { ...insights[idx], ...updates };
  persist(insights);
  notify();
  return insights[idx];
}

export function togglePin(id: string): Insight | undefined {
  const insights = loadFromStorage();
  const idx = insights.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  insights[idx].pinned = !insights[idx].pinned;
  persist(insights);
  notify();
  return insights[idx];
}

export function deleteInsight(id: string): boolean {
  const insights = loadFromStorage();
  const filtered = insights.filter((i) => i.id !== id);
  if (filtered.length === insights.length) return false;
  persist(filtered);
  notify();
  return true;
}

export function getInsightsByTag(tag: string): Insight[] {
  return getAllInsights().filter((i) => i.tags.includes(tag));
}

export function getAllTags(): string[] {
  const insights = loadFromStorage();
  const tagSet = new Set<string>();
  insights.forEach((i) => i.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export const MOODS: InsightMood[] = [
  '💡 灵感',
  '🔥 突破',
  '🤔 思考',
  '📖 收获',
  '⚠️ 疑问',
  '🎯 计划',
];

export const COLORS: { key: InsightColor; label: string; bg: string; border: string; text: string }[] = [
  { key: 'indigo', label: '靛蓝', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  { key: 'amber', label: '琥珀', bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
  { key: 'emerald', label: '翠绿', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { key: 'rose', label: '玫瑰', bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400' },
  { key: 'cyan', label: '青色', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  { key: 'violet', label: '紫罗兰', bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-400' },
];
