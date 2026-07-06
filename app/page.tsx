'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { load, getDataStats, getAllNodes, getAllNotes, getAllPapers } from '@/lib/db';
import { KnowledgeNode, Note, Paper } from '@/types';
import {
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  Lightbulb,
  Plus,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nodes: 0,
    notes: 0,
    papers: 0,
  });
  const [recentNodes, setRecentNodes] = useState<KnowledgeNode[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  useEffect(() => {
    async function init() {
      await load();
      const s = getDataStats();
      setStats({
        nodes: s.nodes,
        notes: s.notes,
        papers: s.papers,
      });
      setRecentNodes(getAllNodes().slice(0, 5));
      setRecentNotes(getAllNotes().slice(0, 5));
      setLoading(false);
    }
    init();
  }, []);

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Welcome */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            欢迎回来~ 今天的你也在进步哦
          </h1>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            点击卡片进入各系统，左侧导航栏查看完整层级，用 + 按钮快速记录灵感吧~
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
          <StatCard icon={Brain} label="知识节点" value={stats.nodes} color="text-primary" />
          <StatCard icon={FileText} label="笔记" value={stats.notes} color="text-success" />
          <StatCard icon={GraduationCap} label="论文" value={stats.papers} color="text-accent" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto">
          <ActionCard
            href="/notes"
            icon={FileText}
            title="笔记导入"
            subtitle="write"
            description="拖拽上传自动归档"
          />
          <ActionCard
            href="/knowledge"
            icon={Lightbulb}
            title="费曼卡片"
            subtitle="think"
            description="一句话讲清楚"
          />
        </div>

        {/* Daily Summary */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">今日尚未总结</h3>
                  <p className="text-xs text-text-muted">点击此处记录今天的收获与反思</p>
                </div>
              </div>
              <Link
                href="/notes"
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:text-text-primary hover:border-primary/30 transition-colors"
              >
                去总结
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {loading ? (
          <div className="text-center py-12 text-text-muted">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Recent Nodes */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                最近知识节点
              </h3>
              {recentNodes.length === 0 ? (
                <p className="text-sm text-text-muted">暂无知识节点</p>
              ) : (
                <div className="space-y-2">
                  {recentNodes.map((node) => (
                    <Link
                      key={node.id}
                      href={`/knowledge?node=${node.id}`}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-surface-light transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary/50" />
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
                <div className="space-y-2">
                  {recentNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes?id=${note.id}`}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-surface-light transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-success/50" />
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
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  subtitle,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="glass rounded-2xl p-5 card-hover flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-text-primary">{title}</h3>
          <span className="text-xs text-text-muted bg-surface px-1.5 py-0.5 rounded">
            {subtitle}
          </span>
        </div>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </Link>
  );
}