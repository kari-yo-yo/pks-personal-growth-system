'use client';

import { useEffect, useState, useCallback } from 'react';
import WanderBackground from '@/components/WanderBackground';
import {
  getRandomWanderItem,
  getRelatedWanderItems,
  addToWanderHistory,
  getWanderHistory,
  getWanderStats,
  WanderItem,
  WanderItemType,
} from '@/lib/wander';
import { load } from '@/lib/db';
import {
  Brain,
  FileText,
  GraduationCap,
  Zap,
  Shuffle,
  ArrowRight,
  Tag,
  Calendar,
  Sparkles,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

const typeConfig: Record<
  WanderItemType,
  { label: string; icon: React.ElementType; color: string; bg: string; path: string }
> = {
  node: {
    label: '知识节点',
    icon: Brain,
    color: 'text-primary',
    bg: 'bg-primary/10',
    path: '/knowledge',
  },
  note: {
    label: '笔记',
    icon: FileText,
    color: 'text-success',
    bg: 'bg-success/10',
    path: '/notes',
  },
  paper: {
    label: '论文',
    icon: GraduationCap,
    color: 'text-accent',
    bg: 'bg-accent/10',
    path: '/papers',
  },
  insight: {
    label: '灵感',
    icon: Zap,
    color: 'text-warning',
    bg: 'bg-warning/10',
    path: '/insights',
  },
};

export default function WanderPage() {
  const [current, setCurrent] = useState<WanderItem | null>(null);
  const [related, setRelated] = useState<WanderItem[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, byType: { node: 0, note: 0, paper: 0, insight: 0 } });
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  const pickNext = useCallback(() => {
    const history = getWanderHistory();
    const item = getRandomWanderItem(history);
    if (item) {
      addToWanderHistory(item.id);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(item);
        setRelated(getRelatedWanderItems(item, 3));
        setAnimating(false);
      }, 300);
    } else {
      setCurrent(null);
      setRelated([]);
    }
  }, []);

  useEffect(() => {
    async function init() {
      load().catch(() => {});
      setStats(getWanderStats());
      pickNext();
      setLoading(false);
    }
    init();
  }, [pickNext]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        pickNext();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pickNext]);

  const themeColor = current?.color || '#6366f1';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WanderBackground themeColor={themeColor} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/60 border border-border mb-3">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-text-secondary">知识漫游</span>
          </div>
          <p className="text-xs text-text-muted">
            共 {stats.totalItems} 个知识碎片 · 按空格键继续漫游
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-text-muted text-sm">加载中...</div>
          </div>
        ) : stats.totalItems === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary mb-1">知识库还是空的</p>
              <p className="text-xs text-text-muted mb-4">先去添加一些知识内容吧</p>
              <Link
                href="/knowledge"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm hover:bg-primary/20 transition-colors"
              >
                <Brain className="w-4 h-4" />
                去添加知识
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Main Card */}
            <div className="flex-1 flex items-center justify-center mb-8">
              <div
                className={`w-full max-w-2xl transition-all duration-300 ${
                  animating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                }`}
              >
                {current && (
                  <div className="glass rounded-2xl p-6 sm:p-8 border border-primary/10 relative overflow-hidden">
                    {/* Color accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: current.color || '#6366f1' }}
                    />

                    {/* Type badge */}
                    <div className="flex items-center gap-2 mb-4">
                      {(() => {
                        const config = typeConfig[current.type];
                        const Icon = config.icon;
                        return (
                          <Link href={`${config.path}?id=${current.id}`}>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg} ${config.color} text-xs font-medium hover:opacity-80 transition-opacity`}>
                              <Icon className="w-3.5 h-3.5" />
                              {config.label}
                            </div>
                          </Link>
                        );
                      })()}
                      <span className="text-[10px] text-text-muted ml-auto flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(current.date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 leading-snug">
                      {current.title}
                    </h2>

                    {/* Content */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-5 whitespace-pre-wrap">
                      {current.content || '暂无内容'}
                    </p>

                    {/* Tags */}
                    {current.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {current.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] text-text-muted"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    {current.meta && Object.keys(current.meta).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {Object.entries(current.meta).map(([key, value]) =>
                          value !== undefined ? (
                            <span
                              key={key}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-surface border border-border text-text-muted"
                            >
                              {key}: {String(value)}
                            </span>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* Action */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`${typeConfig[current.type].path}?id=${current.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm hover:bg-primary/20 transition-colors"
                      >
                        查看详情
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={pickNext}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-text-secondary text-sm hover:border-primary/30 hover:text-text-primary transition-colors"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        下一个
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related items */}
            {related.length > 0 && (
              <div className="mb-8">
                <p className="text-xs text-text-muted mb-3 text-center">你可能也感兴趣</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map((item) => {
                    const config = typeConfig[item.type];
                    const Icon = config.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          addToWanderHistory(item.id);
                          setAnimating(true);
                          setTimeout(() => {
                            setCurrent(item);
                            setRelated(getRelatedWanderItems(item, 3));
                            setAnimating(false);
                          }, 300);
                        }}
                        className="glass rounded-xl p-4 text-left card-hover border border-border hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center`}>
                            <Icon className={`w-3 h-3 ${config.color}`} />
                          </div>
                          <span className={`text-[10px] ${config.color}`}>{config.label}</span>
                        </div>
                        <h4 className="text-sm font-medium text-text-primary truncate mb-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-text-muted line-clamp-2">
                          {item.content}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom hint */}
            <div className="text-center pb-4">
              <p className="text-[10px] text-text-muted">按空格键随机探索下一个知识碎片</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
