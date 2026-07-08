'use client';

import { useEffect, useState } from 'react';
import DashboardBackground from '@/components/DashboardBackground';
import {
  load,
  getDataStats,
  getAllNodes,
  getAllNotes,
  getAllPapers,
  getAllSummaries,
} from '@/lib/db';
import { getAllInsights } from '@/lib/insights';
import { getAllPaths } from '@/lib/paths';
import { getStreakInfo, getContributionGrid, StreakInfo } from '@/lib/streak';
import { KnowledgeNode, Note, Paper } from '@/types';
import {
  BookOpen,
  Brain,
  Calendar,
  FileText,
  Flame,
  GraduationCap,
  Home,
  Lightbulb,
  Network,
  Route,
  Sparkles,
  Wind,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nodes: 0,
    notes: 0,
    papers: 0,
    insights: 0,
    paths: 0,
    summaries: 0,
  });
  const [recentNodes, setRecentNodes] = useState<KnowledgeNode[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [grid, setGrid] = useState<{ date: string; level: number }[][]>([]);

  useEffect(() => {
    async function init() {
      load().catch(() => {});
      const s = getDataStats();
      setStats({
        nodes: s.nodes || 0,
        notes: s.notes || 0,
        papers: s.papers || 0,
        insights: getAllInsights().length,
        paths: getAllPaths().length,
        summaries: getAllSummaries().length,
      });
      setRecentNodes(getAllNodes().slice(0, 5));
      setRecentNotes(getAllNotes().slice(0, 5));
      setStreak(getStreakInfo());
      setGrid(getContributionGrid(20));
      setLoading(false);
    }
    init();
  }, []);

  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen relative">
      <DashboardBackground />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-text-muted mb-2">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            欢迎回来
          </h1>
          <p className="text-text-secondary text-sm max-w-lg">
            今天的你也在进步。这里是你的个人知识中枢，所有学习足迹一目了然。
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          <StatCard icon={Brain} label="知识节点" value={stats.nodes} color="text-primary" bg="bg-primary/10" />
          <StatCard icon={FileText} label="笔记" value={stats.notes} color="text-success" bg="bg-success/10" />
          <StatCard icon={GraduationCap} label="论文" value={stats.papers} color="text-accent" bg="bg-accent/10" />
          <StatCard icon={Zap} label="灵感" value={stats.insights} color="text-warning" bg="bg-warning/10" />
          <StatCard icon={Route} label="路径" value={stats.paths} color="text-pink-400" bg="bg-pink-400/10" />
          <StatCard icon={Calendar} label="总结" value={stats.summaries} color="text-cyan-400" bg="bg-cyan-400/10" />
        </div>

        {/* Quick Access Grid */}
        <div className="mb-10">
          <h2 className="text-sm font-medium text-text-secondary mb-3">快捷入口</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <QuickAccess href="/knowledge" icon={Brain} label="知识系统" color="text-primary" />
            <QuickAccess href="/notes" icon={FileText} label="笔记" color="text-success" />
            <QuickAccess href="/papers" icon={GraduationCap} label="论文" color="text-accent" />
            <QuickAccess href="/insights" icon={Zap} label="灵感" color="text-warning" />
            <QuickAccess href="/paths" icon={Route} label="路径" color="text-pink-400" />
            <QuickAccess href="/topology" icon={Network} label="拓扑" color="text-cyan-400" />
            <QuickAccess href="/flow" icon={Wind} label="流场" color="text-violet-400" />
            <QuickAccess href="/feynman" icon={Lightbulb} label="费曼" color="text-amber-400" />
            <QuickAccess href="/daily" icon={Calendar} label="总结" color="text-emerald-400" />
            <QuickAccess href="/galaxy" icon={Sparkles} label="星图" color="text-indigo-400" />
            <QuickAccess href="/settings" icon={Home} label="设置" color="text-text-muted" />
          </div>
        </div>

        {/* Streak & Contribution */}
        {streak && streak.totalActiveDays > 0 && (
          <div className="mb-10">
            <div className="glass rounded-2xl p-5 border border-primary/10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">连续学习</h3>
                    <p className="text-xs text-text-muted">
                      当前 {streak.currentStreak} 天 · 最长 {streak.longestStreak} 天
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 sm:ml-auto">
                  <div className="text-center px-3 py-1.5 rounded-lg bg-surface border border-border">
                    <div className="text-lg font-bold text-primary">{streak.currentStreak}</div>
                    <div className="text-[10px] text-text-muted">当前连续</div>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-surface border border-border">
                    <div className="text-lg font-bold text-warning">{streak.longestStreak}</div>
                    <div className="text-[10px] text-text-muted">最长连续</div>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-surface border border-border">
                    <div className="text-lg font-bold text-success">{streak.totalActiveDays}</div>
                    <div className="text-[10px] text-text-muted">活跃天数</div>
                  </div>
                </div>
              </div>

              {/* Weekly activity bar */}
              <div className="flex items-end gap-1.5 h-12 mb-3">
                {streak.weeklyActivity.map((day) => {
                  const maxCount = Math.max(...streak.weeklyActivity.map((d) => d.count), 1);
                  const height = day.count > 0 ? Math.max((day.count / maxCount) * 100, 20) : 8;
                  const dayName = new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'narrow' });
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-sm transition-all ${
                          day.count > 0 ? 'bg-primary/60' : 'bg-surface'
                        }`}
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-[9px] text-text-muted">{dayName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Contribution grid */}
              <div className="flex gap-[3px] overflow-x-auto pb-1">
                {grid.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day, di) => {
                      const colors = [
                        'bg-surface',
                        'bg-primary/20',
                        'bg-primary/40',
                        'bg-primary/60',
                        'bg-primary',
                      ];
                      return (
                        <div
                          key={di}
                          className={`w-2.5 h-2.5 rounded-[2px] ${colors[day.level]}`}
                          title={`${day.date}: ${day.level} 级活跃`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily check */}
        <div className="max-w-2xl mb-10">
          <Link href="/daily">
            <div className="glass rounded-2xl p-5 card-hover border border-warning/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">每日总结</h3>
                    <p className="text-xs text-text-muted">记录今天的收获与反思</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:border-primary/30 transition-colors">
                  去记录
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        {loading ? (
          <div className="text-center py-12 text-text-muted">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            {/* Recent Nodes */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                最近知识节点
              </h3>
              {recentNodes.length === 0 ? (
                <p className="text-sm text-text-muted">暂无知识节点</p>
              ) : (
                <div className="space-y-1">
                  {recentNodes.map((node) => (
                    <Link
                      key={node.id}
                      href={`/knowledge?node=${node.id}`}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-surface-light transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: node.color || '#6366f1' }}
                      />
                      <span className="text-sm text-text-secondary truncate">
                        {node.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notes */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-success" />
                最近笔记
              </h3>
              {recentNotes.length === 0 ? (
                <p className="text-sm text-text-muted">暂无笔记</p>
              ) : (
                <div className="space-y-1">
                  {recentNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes?id=${note.id}`}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-surface-light transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-success/50 shrink-0" />
                      <span className="text-sm text-text-secondary truncate">
                        {note.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center card-hover">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}

function QuickAccess({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="glass rounded-xl p-3 card-hover flex flex-col items-center gap-2 text-center"
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-xs text-text-secondary">{label}</span>
    </Link>
  );
}
