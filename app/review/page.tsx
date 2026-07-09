'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getDueReviewQueue,
  getReviewStats,
  getReviewState,
  processReview,
  updateReviewState,
  recordReviewSession,
  clearReviewStates,
  ReviewItem,
  ReviewDifficulty,
} from '@/lib/review';
import { load } from '@/lib/db';
import PageTransition from '@/components/PageTransition';
import {
  RotateCcw,
  Brain,
  FileText,
  GraduationCap,
  Zap,
  CheckCircle2,
  XCircle,
  ThumbsDown,
  ThumbsUp,
  Award,
  BarChart3,
  Trash2,
  Layers,
} from 'lucide-react';

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  node: { label: '知识节点', icon: Brain, color: 'text-primary' },
  note: { label: '笔记', icon: FileText, color: 'text-success' },
  paper: { label: '论文', icon: GraduationCap, color: 'text-accent' },
  insight: { label: '灵感', icon: Zap, color: 'text-warning' },
};

const difficultyConfig: Record<ReviewDifficulty, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  again: { label: '重来', icon: XCircle, color: 'text-error', bg: 'bg-error/10', border: 'border-error/30 hover:bg-error/20' },
  hard: { label: '困难', icon: ThumbsDown, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30 hover:bg-warning/20' },
  good: { label: '良好', icon: ThumbsUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30 hover:bg-success/20' },
  easy: { label: '简单', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30 hover:bg-primary/20' },
};

type PageView = 'home' | 'session' | 'summary';

export default function ReviewPage() {
  const [view, setView] = useState<PageView>('home');
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ total: 0, due: 0, newCount: 0, learning: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ itemId: string; difficulty: ReviewDifficulty }[]>([]);
  const [sessionStart, setSessionStart] = useState('');

  useEffect(() => {
    async function init() {
      load().catch(() => {});
      setStats(getReviewStats());
      setLoading(false);
    }
    init();
  }, []);

  const startSession = useCallback(() => {
    const due = getDueReviewQueue();
    if (due.length === 0) return;
    setQueue(due);
    setCurrentIndex(0);
    setFlipped(false);
    setResults([]);
    setSessionStart(new Date().toISOString());
    setView('session');
  }, []);

  const handleDifficulty = useCallback((difficulty: ReviewDifficulty) => {
    const item = queue[currentIndex];
    if (!item) return;

    // Get or create state
    let state = getReviewState(item.id);
    if (!state) {
      state = {
        id: item.id,
        interval: 0,
        repetition: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        lastReview: new Date().toISOString(),
        lastDifficulty: null,
      };
    }

    const newState = processReview(state, difficulty);
    updateReviewState(newState);

    const newResults = [...results, { itemId: item.id, difficulty }];
    setResults(newResults);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
    } else {
      // Session complete
      recordReviewSession(newResults);
      setView('summary');
    }
  }, [queue, currentIndex, results]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (view !== 'session') return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped) {
        if (e.key === '1') handleDifficulty('again');
        if (e.key === '2') handleDifficulty('hard');
        if (e.key === '3') handleDifficulty('good');
        if (e.key === '4') handleDifficulty('easy');
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view, flipped, handleDifficulty]);

  const handleClear = () => {
    if (confirm('确定要清空所有复习进度吗？此操作不可恢复！')) {
      clearReviewStates();
      setStats(getReviewStats());
    }
  };

  const current = queue[currentIndex];

  return (
    <PageTransition>
    <div className="min-h-screen relative">

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        {loading ? (
          <div className="text-center py-20 text-text-muted">加载中...</div>
        ) : view === 'home' ? (
          /* ========== Home View ========== */
          <div className="py-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-primary" />
              </div>
              <h1 className="heading-display text-3xl font-bold text-text-primary mb-2">智能回顾</h1>
              <p className="text-sm text-text-secondary max-w-lg mx-auto">
                基于间隔重复算法 (SM-2)，自动追踪你的知识掌握度，在最合适的时机推送复习。
              </p>
            </div>

            {/* Stats — inline pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full surface text-sm">
                <span className="font-bold text-text-primary">{stats.due}</span>
                <span className="text-text-muted">待复习</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full surface text-sm">
                <span className="font-bold text-primary">{stats.newCount}</span>
                <span className="text-text-muted">新卡片</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full surface text-sm">
                <span className="font-bold text-warning">{stats.learning}</span>
                <span className="text-text-muted">学习中</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full surface text-sm">
                <span className="font-bold text-success">{stats.mastered}</span>
                <span className="text-text-muted">已掌握</span>
              </span>
            </div>

            {/* Action */}
            {stats.due > 0 ? (
              <div className="text-center mb-8">
                <button
                  onClick={startSession}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  <Layers className="w-5 h-5" />
                  开始复习 ({stats.due} 张卡片)
                </button>
                <p className="text-xs text-text-muted mt-2">
                  按 1-4 快速评分 · 空格翻转卡片
                </p>
              </div>
            ) : (
              <div className="text-center mb-8">
                <div className="surface-raised p-6 max-w-md mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
                  <p className="text-text-primary font-medium mb-1">暂无待复习内容</p>
                  <p className="text-xs text-text-muted">今天的复习已完成，或知识库还没有内容</p>
                </div>
              </div>
            )}

            {/* Keyboard hints */}
            <div className="surface p-4 max-w-md mx-auto">
              <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                操作提示
              </h3>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-xs text-text-muted w-16 text-center">Space</kbd>
                  <span>翻转卡片（查看答案）</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-xs text-text-muted w-16 text-center">1</kbd>
                  <span>重来（重新学习）</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-xs text-text-muted w-16 text-center">2</kbd>
                  <span>困难（记忆模糊）</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-xs text-text-muted w-16 text-center">3</kbd>
                  <span>良好（正确回忆）</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-xs text-text-muted w-16 text-center">4</kbd>
                  <span>简单（轻松掌握）</span>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="text-center mt-6">
              <button
                onClick={handleClear}
                className="text-xs text-text-muted hover:text-error transition-colors flex items-center gap-1 mx-auto"
              >
                <Trash2 className="w-3 h-3" />
                清空复习进度
              </button>
            </div>
          </div>
        ) : view === 'session' && current ? (
          /* ========== Session View ========== */
          <div className="py-8 flex flex-col items-center">
            {/* Progress bar */}
            <div className="w-full max-w-2xl mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted">
                  {currentIndex + 1} / {queue.length}
                </span>
                <span className="text-xs text-text-muted">
                  {Math.round(((currentIndex) / queue.length) * 100)}% 完成
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentIndex / queue.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div
              className="w-full max-w-2xl cursor-pointer mb-8"
              style={{ perspective: '1000px' }}
              onClick={() => setFlipped((f) => !f)}
            >
              <div
                className="relative transition-transform duration-500 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '280px',
                }}
              >
                {/* Front */}
                <div
                  className="surface-raised p-5 sm:p-6 border border-primary/10 absolute inset-0"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {(() => {
                      const config = typeConfig[current.type];
                      const Icon = config.icon;
                      return (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border ${config.color} text-xs`}>
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </div>
                      );
                    })()}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-4">
                    {current.title}
                  </h2>
                  <p className="text-base text-text-secondary leading-relaxed mb-4">
                    {current.front}
                  </p>
                  <div className="flex items-center justify-center mt-8">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/60 border border-border text-xs text-text-muted">
                      <span>点击或按空格翻转</span>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="surface-raised p-5 sm:p-6 border border-success/10 absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success/10 border border-success/30 text-success text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      答案
                    </div>
                  </div>
                  <div
                    className="text-base text-text-secondary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto"
                  >
                    {current.back}
                  </div>
                  {current.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {current.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-surface border border-border text-text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Difficulty buttons */}
            {flipped && (
              <div className="w-full max-w-2xl">
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {(Object.entries(difficultyConfig) as [ReviewDifficulty, typeof difficultyConfig[ReviewDifficulty]][]).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDifficulty(key);
                        }}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3 sm:py-4 rounded-xl border transition-all duration-200 ${config.bg} ${config.border}`}
                      >
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                        <kbd className="text-xs px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
                          {Object.keys(difficultyConfig).indexOf(key) + 1}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========== Summary View ========== */
          <div className="py-8 flex flex-col items-center">
            <div className="w-full max-w-lg">
              <div className="surface-raised p-6 text-center border border-success/10 mb-6">
                <Award className="w-12 h-12 text-success mx-auto mb-4" />
                <h2 className="text-xl font-bold text-text-primary mb-2">复习完成</h2>
                <p className="text-sm text-text-secondary">
                  本次复习了 {results.length} 张卡片
                </p>
              </div>

              {/* Results breakdown */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {(['again', 'hard', 'good', 'easy'] as ReviewDifficulty[]).map((d) => {
                  const config = difficultyConfig[d];
                  const count = results.filter((r) => r.difficulty === d).length;
                  return (
                    <div key={d} className="surface p-2 text-center">
                      <div className={`text-lg font-bold ${config.color}`}>{count}</div>
                      <div className="text-xs text-text-muted">{config.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Accuracy */}
              <div className="surface p-3 text-center mb-6">
                <div className="text-sm text-text-secondary mb-1">正确率</div>
                {results.length > 0 ? (
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(
                      (results.filter((r) => r.difficulty === 'good' || r.difficulty === 'easy').length /
                        results.length) *
                        100
                    )}
                    %
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-text-muted">--</div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStats(getReviewStats());
                    setView('home');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm hover:bg-primary/20 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  返回首页
                </button>
                <button
                  onClick={startSession}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-sm hover:text-text-primary hover:border-primary/30 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  再来一轮
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </PageTransition>
  );
}
