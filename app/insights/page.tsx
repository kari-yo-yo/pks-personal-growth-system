'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { openInsightFAB } from '@/components/InsightFAB';
import {
  getAllInsights,
  togglePin,
  deleteInsight,
  subscribeInsights,
  getAllTags,
  COLORS,
} from '@/lib/insights';
import { Insight, InsightColor } from '@/types';
import {
  Pin,
  PinOff,
  Trash2,
  Zap,
  Filter,
  Plus,
} from 'lucide-react';

const NeuralBackground = dynamic(() => import('@/components/NeuralBackground'), {
  ssr: false,
});

// ─── 工具函数 ───

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function groupByDate(insights: Insight[]): Map<string, Insight[]> {
  const groups = new Map<string, Insight[]>();
  for (const ins of insights) {
    const d = new Date(ins.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ins);
  }
  return groups;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (dateStr === todayStr) return '今天';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterdayStr) return '昨天';
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
}

const MOOD_EMOJI: Record<string, string> = {
  '💡 灵感': '💡',
  '🔥 突破': '🔥',
  '🤔 思考': '🤔',
  '📖 收获': '📖',
  '⚠️ 疑问': '⚠️',
  '🎯 计划': '🎯',
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setInsights(getAllInsights());
    setTags(getAllTags());
    return subscribeInsights(() => {
      setInsights(getAllInsights());
      setTags(getAllTags());
    });
  }, []);

  const filtered = useMemo(() => {
    if (!filterTag) return insights;
    return insights.filter((i) => i.tags.includes(filterTag));
  }, [insights, filterTag]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleTogglePin = (id: string) => {
    togglePin(id);
  };

  const handleDelete = (id: string) => {
    deleteInsight(id);
  };

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of insights) {
      counts[i.mood] = (counts[i.mood] || 0) + 1;
    }
    return counts;
  }, [insights]);

  return (
    <div className="min-h-screen relative">
      <Navigation />

      {/* Neural Background */}
      <div className="fixed inset-0 z-0">
        <NeuralBackground />
      </div>

      <main className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1.5">
            灵感速记
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            随时记录脑海中闪现的灵感碎片，让每个想法都被捕获
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              共 {insights.length} 条灵感
            </span>
            {insights.filter((i) => i.pinned).length > 0 && (
              <span className="text-xs text-primary">
                {insights.filter((i) => i.pinned).length} 条置顶
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Mood distribution */}
            <div className="hidden sm:flex items-center gap-1.5">
              {Object.entries(moodCounts).slice(0, 4).map(([mood, count]) => (
                <span key={mood} className="text-xs text-text-muted" title={`${mood}: ${count}`}>
                  {MOOD_EMOJI[mood]} {count}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${
                showFilters ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-primary hover:bg-surface-light'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        {showFilters && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6 animate-fade-in">
            <button
              onClick={() => setFilterTag(null)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                !filterTag
                  ? 'bg-primary/20 text-primary-light'
                  : 'bg-surface text-text-secondary hover:bg-surface-light'
              }`}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  tag === filterTag
                    ? 'bg-primary/20 text-primary-light'
                    : 'bg-surface text-text-secondary hover:bg-surface-light'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Pinned Section */}
        {insights.filter((i) => i.pinned).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-sm font-medium text-text-primary">置顶</h2>
            </div>
            <div className="space-y-2">
              {insights
                .filter((i) => i.pinned)
                .map((ins) => (
                  <InsightCard
                    key={ins.id}
                    insight={ins}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {grouped.size === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-30">💭</div>
            <p className="text-text-muted text-sm mb-4">还没有灵感记录</p>
            <button
              onClick={() => openInsightFAB()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-sm text-text-secondary hover:text-text-primary hover:border-primary/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              记录第一条灵感
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {formatDateLabel(date)}
                  </h2>
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-text-muted">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((ins) => (
                    <InsightCard
                      key={ins.id}
                      insight={ins}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Insight Card ───

function InsightCard({
  insight,
  onTogglePin,
  onDelete,
}: {
  insight: Insight;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const colorObj = COLORS.find((c) => c.key === insight.color) || COLORS[0];

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all hover:translate-y-[-1px] ${colorObj.bg} ${colorObj.border}`}
      style={{
        boxShadow: insight.pinned ? `0 0 20px ${insight.color === 'indigo' ? 'rgba(99,102,241,0.08)' : insight.color === 'amber' ? 'rgba(245,158,11,0.08)' : insight.color === 'emerald' ? 'rgba(34,197,94,0.08)' : insight.color === 'rose' ? 'rgba(244,63,94,0.08)' : insight.color === 'cyan' ? 'rgba(6,182,212,0.08)' : 'rgba(139,92,246,0.08)'}` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Mood emoji */}
        <span className="text-lg shrink-0 mt-0.5">{insight.mood.split(' ')[0]}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
            {insight.content}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] text-text-muted">
              {formatRelativeTime(insight.createdAt)}
            </span>
            <span className={`text-[11px] ${colorObj.text}`}>
              {insight.mood.split(' ')[1]}
            </span>
            {insight.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-surface/50 text-text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onTogglePin(insight.id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            title={insight.pinned ? '取消置顶' : '置顶'}
          >
            {insight.pinned ? (
              <PinOff className="w-3.5 h-3.5" />
            ) : (
              <Pin className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => onDelete(insight.id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
