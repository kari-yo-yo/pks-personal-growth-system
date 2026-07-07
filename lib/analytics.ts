import {
  getAllNodes,
  getAllNotes,
  getAllPapers,
  getAllSummaries,
  getAllRelations,
} from './db';
import { getAllInsights } from './insights';
import { getAllPaths } from './paths';

export interface DailyActivity {
  date: string;
  nodes: number;
  notes: number;
  papers: number;
  insights: number;
  paths: number;
  summaries: number;
  total: number;
}

export interface ModuleDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TagFrequency {
  tag: string;
  count: number;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface KnowledgeTreeStats {
  maxDepth: number;
  avgDepth: number;
  leafNodes: number;
  rootNodes: number;
  totalRelations: number;
}

export interface PathProgress {
  title: string;
  total: number;
  completed: number;
  inProgress: number;
  color: string;
}

export function getDailyActivity(days = 30): DailyActivity[] {
  const result: DailyActivity[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      nodes: 0,
      notes: 0,
      papers: 0,
      insights: 0,
      paths: 0,
      summaries: 0,
      total: 0,
    });
  }

  const dateMap = new Map<string, DailyActivity>();
  for (const item of result) {
    dateMap.set(item.date, item);
  }

  for (const node of getAllNodes()) {
    const date = node.createdAt.split('T')[0];
    const item = dateMap.get(date);
    if (item) { item.nodes++; item.total++; }
  }
  for (const note of getAllNotes()) {
    const date = note.createdAt.split('T')[0];
    const item = dateMap.get(date);
    if (item) { item.notes++; item.total++; }
  }
  for (const paper of getAllPapers()) {
    const date = paper.createdAt.split('T')[0];
    const item = dateMap.get(date);
    if (item) { item.papers++; item.total++; }
  }
  for (const insight of getAllInsights()) {
    const date = insight.createdAt.split('T')[0];
    const item = dateMap.get(date);
    if (item) { item.insights++; item.total++; }
  }
  for (const path of getAllPaths()) {
    const date = path.createdAt.split('T')[0];
    const item = dateMap.get(date);
    if (item) { item.paths++; item.total++; }
  }
  for (const summary of getAllSummaries()) {
    const date = summary.createdAt.split('T')[0];
    const item = dateMap.get(date);
    if (item) { item.summaries++; item.total++; }
  }

  return result;
}

export function getModuleDistribution(): ModuleDistribution[] {
  return [
    { name: '知识节点', value: getAllNodes().length, color: '#6366f1' },
    { name: '笔记', value: getAllNotes().length, color: '#10b981' },
    { name: '论文', value: getAllPapers().length, color: '#f59e0b' },
    { name: '灵感', value: getAllInsights().length, color: '#ec4899' },
    { name: '路径', value: getAllPaths().length, color: '#8b5cf6' },
    { name: '总结', value: getAllSummaries().length, color: '#06b6d4' },
  ].filter((m) => m.value > 0);
}

export function getTagFrequencies(limit = 20): TagFrequency[] {
  const counts = new Map<string, number>();

  for (const node of getAllNodes()) {
    for (const tag of node.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  for (const note of getAllNotes()) {
    for (const tag of note.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  for (const paper of getAllPapers()) {
    for (const tag of paper.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  for (const insight of getAllInsights()) {
    for (const tag of insight.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getHourlyActivity(): HourlyActivity[] {
  const counts = new Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));

  const extractHour = (createdAt: string) => {
    try {
      return new Date(createdAt).getHours();
    } catch {
      return -1;
    }
  };

  for (const node of getAllNodes()) {
    const h = extractHour(node.createdAt);
    if (h >= 0) counts[h].count++;
  }
  for (const note of getAllNotes()) {
    const h = extractHour(note.createdAt);
    if (h >= 0) counts[h].count++;
  }
  for (const insight of getAllInsights()) {
    const h = extractHour(insight.createdAt);
    if (h >= 0) counts[h].count++;
  }

  return counts;
}

export function getKnowledgeTreeStats(): KnowledgeTreeStats {
  const nodes = getAllNodes();
  const relations = getAllRelations();

  if (nodes.length === 0) {
    return { maxDepth: 0, avgDepth: 0, leafNodes: 0, rootNodes: 0, totalRelations: 0 };
  }

  // Build parent map
  const childrenMap = new Map<string, string[]>();
  for (const node of nodes) {
    if (!childrenMap.has(node.id)) childrenMap.set(node.id, []);
    if (node.parentId) {
      if (!childrenMap.has(node.parentId)) childrenMap.set(node.parentId, []);
      childrenMap.get(node.parentId)!.push(node.id);
    }
  }

  // Calculate depth for each node
  const depthMap = new Map<string, number>();
  function calcDepth(nodeId: string): number {
    if (depthMap.has(nodeId)) return depthMap.get(nodeId)!;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.parentId) {
      depthMap.set(nodeId, 0);
      return 0;
    }
    const d = calcDepth(node.parentId) + 1;
    depthMap.set(nodeId, d);
    return d;
  }

  for (const node of nodes) {
    calcDepth(node.id);
  }

  const depths = Array.from(depthMap.values());
  const maxDepth = Math.max(...depths);
  const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
  const leafNodes = nodes.filter((n) => (childrenMap.get(n.id)?.length || 0) === 0).length;
  const rootNodes = nodes.filter((n) => !n.parentId).length;

  return {
    maxDepth,
    avgDepth: Math.round(avgDepth * 10) / 10,
    leafNodes,
    rootNodes,
    totalRelations: relations.length,
  };
}

export function getPathProgress(): PathProgress[] {
  return getAllPaths().map((path) => {
    const total = path.nodes.length;
    const completed = path.nodes.filter((n) => n.status === 'completed').length;
    const inProgress = path.nodes.filter((n) => n.status === 'in_progress').length;
    return {
      title: path.title,
      total,
      completed,
      inProgress,
      color: path.color || '#6366f1',
    };
  });
}

export function getWeeklyTrend(): { week: string; count: number }[] {
  const now = new Date();
  const weeks: { week: string; count: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const year = d.getFullYear();
    const weekNum = Math.ceil(
      ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
    );
    weeks.push({ week: `${year}-W${weekNum}`, count: 0 });
  }

  const allEvents = [
    ...getAllNodes().map((n) => n.createdAt),
    ...getAllNotes().map((n) => n.createdAt),
    ...getAllPapers().map((p) => p.createdAt),
    ...getAllInsights().map((i) => i.createdAt),
    ...getAllPaths().map((p) => p.createdAt),
    ...getAllSummaries().map((s) => s.createdAt),
  ];

  for (const createdAt of allEvents) {
    const d = new Date(createdAt);
    const year = d.getFullYear();
    const weekNum = Math.ceil(
      ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
    );
    const key = `${year}-W${weekNum}`;
    const entry = weeks.find((w) => w.week === key);
    if (entry) entry.count++;
  }

  return weeks;
}
