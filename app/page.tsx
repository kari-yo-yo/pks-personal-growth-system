'use client';

import { useEffect, useState } from 'react';
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
import { KnowledgeNode, Note } from '@/types';
import {
  BookOpen,
  Brain,
  Calendar,
  FileText,
  Flame,
  GraduationCap,
  Lightbulb,
  Network,
  Route,
  Sparkles,
  Wind,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nodes: 0, notes: 0, papers: 0, insights: 0, paths: 0, summaries: 0,
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
      setRecentNodes(getAllNodes().slice(0, 6));
      setRecentNotes(getAllNotes().slice(0, 6));
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

  const total = stats.nodes + stats.notes + stats.papers + stats.insights + stats.paths + stats.summaries;

  return (
    <PageTransition>
      <main className="pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">

        {/* ── Hero: Greeting ── */}
        <header className="pt-8 sm:pt-12 mb-12 stagger-enter" style={{ '--stagger-i': 0 } as React.CSSProperties}>
          <p className="text-sm text-[var(--color-text-muted)] mb-3 font-medium tracking-wide uppercase">
            {today}
          </p>
          <h1 className="heading-display text-4xl sm:text-5xl text-[var(--color-text-primary)] mb-3">
            欢迎回来
          </h1>
          <p className="body-text text-base">
            今天的你也在进步。这里是你的个人知识中枢，所有学习足迹一目了然。
          </p>
        </header>

        {/* ── Stats: Inline pill row (no cards) ── */}
        <section
          className="mb-12 stagger-enter"
          style={{ '--stagger-i': 1 } as React.CSSProperties}
          aria-label="学习统计"
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span className="heading-section text-sm text-[var(--color-text-muted)] mr-1">共</span>
            <span className="text-2xl font-bold text-[var(--color-primary)] heading-display tabular-nums">
              {total}
            </span>
            <span className="heading-section text-sm text-[var(--color-text-muted)] mr-3">条记录</span>

            <StatPill icon={Brain} label="节点" value={stats.nodes} color="--color-primary" />
            <StatPill icon={FileText} label="笔记" value={stats.notes} color="--color-success" />
            <StatPill icon={GraduationCap} label="论文" value={stats.papers} color="--color-accent" />
            <StatPill icon={Zap} label="灵感" value={stats.insights} color="--color-warning" />
            <StatPill icon={Route} label="路径" value={stats.paths} color="--color-primary-light" />
            <StatPill icon={Calendar} label="总结" value={stats.summaries} color="--color-accent" />
          </div>
        </section>

        {/* ── Quick Access: Horizontal link list (no card grid) ── */}
        <section
          className="mb-12 stagger-enter"
          style={{ '--stagger-i': 2 } as React.CSSProperties}
          aria-label="快捷入口"
        >
          <div className="flex flex-wrap gap-1">
            <QuickLink href="/knowledge" icon={Brain} label="知识系统" />
            <QuickLink href="/notes" icon={FileText} label="笔记" />
            <QuickLink href="/papers" icon={GraduationCap} label="论文" />
            <QuickLink href="/insights" icon={Zap} label="灵感速记" />
            <QuickLink href="/paths" icon={Route} label="学习路径" />
            <QuickLink href="/topology" icon={Network} label="拓扑" />
            <QuickLink href="/flow" icon={Wind} label="流场" />
            <QuickLink href="/feynman" icon={Lightbulb} label="费曼卡片" />
            <QuickLink href="/daily" icon={Calendar} label="每日总结" />
            <QuickLink href="/galaxy" icon={Sparkles} label="星图" />
            <QuickLink href="/wander" icon={TrendingUp} label="漫游" />
          </div>
        </section>

        {/* ── Streak & Contribution ── */}
        {streak && streak.totalActiveDays > 0 && (
          <section
            className="mb-12 stagger-enter"
            style={{ '--stagger-i': 3 } as React.CSSProperties}
            aria-label="学习连续性"
          >
            <div className="surface-raised p-5 sm:p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--color-warning) 15%, var(--color-surface))' }}
                  >
                    <Flame className="w-5 h-5 text-[var(--color-warning)]" />
                  </div>
                  <div>
                    <h2 className="heading-section text-base text-[var(--color-text-primary)]">
                      连续学习
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      当前 {streak.currentStreak} 天 · 最长 {streak.longestStreak} 天 · 共 {streak.totalActiveDays} 天活跃
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly activity bars */}
              <div className="flex items-end gap-1.5 h-10 mb-4">
                {streak.weeklyActivity.map((day) => {
                  const maxCount = Math.max(...streak.weeklyActivity.map((d) => d.count), 1);
                  const height = day.count > 0 ? Math.max((day.count / maxCount) * 100, 20) : 6;
                  const dayName = new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'narrow' });
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-full"
                        style={{
                          height: `${height}px`,
                          background: day.count > 0
                            ? 'color-mix(in srgb, var(--color-primary) 60%, var(--color-surface))'
                            : 'var(--color-surface)',
                          transition: 'height 300ms var(--ease-out-quart)',
                        }}
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">{dayName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Contribution grid */}
              <div className="flex gap-[3px] overflow-x-auto pb-1 scrollbar-hide">
                {grid.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day, di) => {
                      const opacities = [0, 0.2, 0.4, 0.6, 1];
                      return (
                        <div
                          key={di}
                          className="w-2.5 h-2.5 rounded-[2px]"
                          style={{
                            background: day.level > 0
                              ? `color-mix(in srgb, var(--color-primary) ${opacities[day.level] * 100}%, var(--color-surface))`
                              : 'var(--color-surface)',
                          }}
                          title={`${day.date}: ${day.level} 级活跃`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Daily Summary CTA ── */}
        <section
          className="mb-12 stagger-enter"
          style={{ '--stagger-i': 4 } as React.CSSProperties}
        >
          <Link href="/daily" className="block group">
            <div className="surface pressable p-4 sm:p-5 flex items-center justify-between"
              style={{ borderColor: 'color-mix(in srgb, var(--color-warning) 20%, var(--color-border))' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--color-warning) 12%, var(--color-surface))' }}
                >
                  <BookOpen className="w-4 h-4 text-[var(--color-warning)]" />
                </div>
                <div>
                  <h2 className="heading-section text-sm text-[var(--color-text-primary)]">每日总结</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">记录今天的收获与反思</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </Link>
        </section>

        {/* ── Recent Activity: Two-column list (no identical cards) ── */}
        {loading ? (
          <div className="text-center py-16 text-[var(--color-text-muted)]">加载中...</div>
        ) : (
          <section
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl stagger-enter"
            style={{ '--stagger-i': 5 } as React.CSSProperties}
            aria-label="最近动态"
          >
            {/* Recent Nodes — clean list, no card shell */}
            <div>
              <h2 className="heading-section text-sm text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[var(--color-primary)]" />
                最近知识节点
              </h2>
              {recentNodes.length === 0 ? (
                <EmptyState message="暂无知识节点，从知识系统开始创建" />
              ) : (
                <ul className="space-y-0.5">
                  {recentNodes.map((node) => (
                    <li key={node.id}>
                      <Link
                        href={`/knowledge?node=${node.id}`}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors group"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: node.color || 'var(--color-primary)' }}
                        />
                        <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors truncate flex-1">
                          {node.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Notes — clean list, no card shell */}
            <div>
              <h2 className="heading-section text-sm text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-success)]" />
                最近笔记
              </h2>
              {recentNotes.length === 0 ? (
                <EmptyState message="暂无笔记，记下你的第一条想法" />
              ) : (
                <ul className="space-y-0.5">
                  {recentNotes.map((note) => (
                    <li key={note.id}>
                      <Link
                        href={`/notes?id=${note.id}`}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors group"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: 'color-mix(in srgb, var(--color-success) 50%, var(--color-surface))' }}
                        />
                        <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors truncate flex-1">
                          {note.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </PageTransition>
  );
}

/* ── StatPill: inline stat (replaces StatCard) ── */
function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="stat-pill pressable">
      <Icon className="w-3.5 h-3.5" style={{ color: `var(${color})` }} />
      <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{value}</span>
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}

/* ── QuickLink: text-based link (replaces QuickAccess card) ── */
function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

/* ── EmptyState: high-contrast empty message ── */
function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-[var(--color-text-secondary)] py-4 px-1 border-l-2 border-[var(--color-border)] pl-3">
      {message}
    </p>
  );
}
