'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { load } from '@/lib/db';
import { getDailyActivity } from '@/lib/analytics';
import { getAllPaths } from '@/lib/paths';
import { RotateCcw, Sparkles } from 'lucide-react';

export default function ReplayPage() {
  const [ready, setReady] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const stats = useMemo(() => {
    const daily = getDailyActivity(7);
    const week = daily.reduce(
      (acc, d) => {
        acc.nodes += d.nodes;
        acc.notes += d.notes;
        acc.papers += d.papers;
        acc.insights += d.insights;
        return acc;
      },
      { nodes: 0, notes: 0, papers: 0, insights: 0 }
    );
    const paths = getAllPaths().map((p) => ({
      title: p.title,
      total: p.nodes.length,
      completed: p.nodes.filter((n) => n.status === 'completed').length,
      color: p.color || '#6366f1',
    }));
    return { week, paths };
  }, [replayKey]);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    params.set('nodes', stats.week.nodes.toString());
    params.set('notes', stats.week.notes.toString());
    params.set('papers', stats.week.papers.toString());
    params.set('insights', stats.week.insights.toString());
    params.set('paths', JSON.stringify(stats.paths));
    return `/replay/index.html?${params.toString()}`;
  }, [stats]);

  useEffect(() => {
    load().catch(() => {});
    setReady(true);
  }, []);

  const totalEvents =
    stats.week.nodes +
    stats.week.notes +
    stats.week.papers +
    stats.week.insights;

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">突触回放</h1>
          </div>
          <p className="text-sm text-text-secondary">
            将你的学习轨迹转化为动态视觉叙事。
          </p>
        </div>

        {/* Video container */}
        <div className="glass rounded-2xl overflow-hidden border border-border mb-6">
          <div className="relative aspect-video bg-[#0a0a0f]">
            {ready ? (
              <iframe
                key={replayKey}
                src={iframeSrc}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-muted">加载中...</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 flex items-center gap-3 border-t border-border">
            <button
              onClick={() => setReplayKey((k) => k + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary-light text-sm hover:bg-primary/20 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重新播放
            </button>
            <span className="text-xs text-text-muted">
              基于本周 {totalEvents} 项活动生成
            </span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ReplayStat label="知识节点" value={stats.week.nodes} color="#6366f1" />
          <ReplayStat label="笔记" value={stats.week.notes} color="#10b981" />
          <ReplayStat label="论文" value={stats.week.papers} color="#f59e0b" />
          <ReplayStat label="灵感" value={stats.week.insights} color="#ec4899" />
        </div>
      </main>
    </div>
  );
}

function ReplayStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-text-muted mt-1">{label}</div>
    </div>
  );
}
