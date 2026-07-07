import {
  getAllNodes,
  getAllNotes,
  getAllPapers,
  getAllSummaries,
} from './db';
import { getAllInsights } from './insights';
import { getAllPaths } from './paths';

export type TimelineEventType =
  | 'node'
  | 'note'
  | 'paper'
  | 'insight'
  | 'path'
  | 'summary';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: Date;
  link: string;
  color: string;
  icon: string;
  metadata?: Record<string, string | number | undefined>;
}

const TYPE_CONFIG: Record<
  TimelineEventType,
  { color: string; icon: string; label: string }
> = {
  node: { color: '#6366f1', icon: 'Brain', label: '知识节点' },
  note: { color: '#10b981', icon: 'FileText', label: '笔记' },
  paper: { color: '#f59e0b', icon: 'GraduationCap', label: '论文' },
  insight: { color: '#ec4899', icon: 'Zap', label: '灵感' },
  path: { color: '#8b5cf6', icon: 'Route', label: '路径' },
  summary: { color: '#06b6d4', icon: 'Calendar', label: '总结' },
};

export function getTimelineEvents(): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Knowledge nodes
  for (const node of getAllNodes()) {
    events.push({
      id: `node-${node.id}`,
      type: 'node',
      title: node.title,
      description: node.description,
      timestamp: new Date(node.createdAt),
      link: `/knowledge?node=${node.id}`,
      ...TYPE_CONFIG.node,
      metadata: {
        level: node.level,
        tags: (node.tags || []).join(', ') || undefined,
      },
    });
  }

  // Notes
  for (const note of getAllNotes()) {
    events.push({
      id: `note-${note.id}`,
      type: 'note',
      title: note.title,
      description:
        note.summary ||
        (note.content.length > 80
          ? note.content.slice(0, 80) + '...'
          : note.content),
      timestamp: new Date(note.createdAt),
      link: `/notes?id=${note.id}`,
      ...TYPE_CONFIG.note,
      metadata: {
        tags: (note.tags || []).join(', ') || undefined,
      },
    });
  }

  // Papers
  for (const paper of getAllPapers()) {
    events.push({
      id: `paper-${paper.id}`,
      type: 'paper',
      title: paper.title,
      description: paper.authors?.join(', ') || paper.abstract?.slice(0, 100),
      timestamp: new Date(paper.createdAt),
      link: `/papers?id=${paper.id}`,
      ...TYPE_CONFIG.paper,
      metadata: {
        year: paper.year,
        venue: paper.venue,
      },
    });
  }

  // Insights
  for (const insight of getAllInsights()) {
    events.push({
      id: `insight-${insight.id}`,
      type: 'insight',
      title: insight.content.slice(0, 60) + (insight.content.length > 60 ? '...' : ''),
      description: insight.mood,
      timestamp: new Date(insight.createdAt),
      link: `/insights`,
      ...TYPE_CONFIG.insight,
      metadata: {
        tags: (insight.tags || []).join(', ') || undefined,
        pinned: insight.pinned ? '已置顶' : undefined,
      },
    });
  }

  // Learning paths
  for (const path of getAllPaths()) {
    events.push({
      id: `path-${path.id}`,
      type: 'path',
      title: path.title,
      description: path.description,
      timestamp: new Date(path.createdAt),
      link: `/paths?id=${path.id}`,
      ...TYPE_CONFIG.path,
      metadata: {
        category: path.category,
        nodes: path.nodes.length,
      },
    });
  }

  // Daily summaries
  for (const summary of getAllSummaries()) {
    events.push({
      id: `summary-${summary.id}`,
      type: 'summary',
      title: `每日总结 · ${summary.date}`,
      description:
        summary.content.length > 100
          ? summary.content.slice(0, 100) + '...'
          : summary.content,
      timestamp: new Date(summary.createdAt),
      link: `/daily?id=${summary.id}`,
      ...TYPE_CONFIG.summary,
      metadata: {
        achievements: summary.achievements?.length || 0,
        plans: summary.plans?.length || 0,
      },
    });
  }

  // Sort by timestamp descending (newest first)
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function groupEventsByDate(events: TimelineEvent[]): {
  date: string;
  events: TimelineEvent[];
}[] {
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const dateStr = event.timestamp.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    if (!groups.has(dateStr)) {
      groups.set(dateStr, []);
    }
    groups.get(dateStr)!.push(event);
  }

  return Array.from(groups.entries()).map(([date, events]) => ({
    date,
    events,
  }));
}

export function getTimelineStats(events: TimelineEvent[]) {
  const counts: Record<TimelineEventType, number> = {
    node: 0,
    note: 0,
    paper: 0,
    insight: 0,
    path: 0,
    summary: 0,
  };

  for (const e of events) {
    counts[e.type]++;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    total: events.length,
    counts,
    thisWeek: events.filter((e) => e.timestamp >= sevenDaysAgo).length,
    thisMonth: events.filter((e) => e.timestamp >= thirtyDaysAgo).length,
  };
}
