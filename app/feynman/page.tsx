'use client';

import { useEffect, useState, useMemo } from 'react';
import { PRESET_CARDS } from '@/lib/feynmanData';
import { FeynmanCard, FeynmanProgress, FEYNMAN_CATEGORIES } from '@/types/feynman';
import PageTransition from '@/components/PageTransition';
import {
  Bookmark,
  Brain,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
  Lightbulb,
  RotateCcw,
  Search,
  Star,
  X,
} from 'lucide-react';

export default function FeynmanPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedCard, setSelectedCard] = useState<FeynmanCard | null>(null);
  const [progress, setProgress] = useState<Record<string, FeynmanProgress>>({});
  const [showBack, setShowBack] = useState(false);

  // 从 localStorage 加载进度
  useEffect(() => {
    const saved = localStorage.getItem('feynman-progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // 保存进度
  const saveProgress = (newProgress: Record<string, FeynmanProgress>) => {
    setProgress(newProgress);
    localStorage.setItem('feynman-progress', JSON.stringify(newProgress));
  };

  const filteredCards = useMemo(() => {
    return PRESET_CARDS.filter((card) => {
      const matchSearch =
        !search ||
        card.concept.toLowerCase().includes(search.toLowerCase()) ||
        card.definition.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === '全部' || card.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  const getProgress = (cardId: string): FeynmanProgress => {
    return (
      progress[cardId] || {
        cardId,
        status: 'new',
        reviewCount: 0,
        lastReviewed: '',
        nextReview: '',
        isFavorite: false,
      }
    );
  };

  const handleReview = (cardId: string) => {
    const p = getProgress(cardId);
    const now = new Date().toISOString();
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.pow(2, p.reviewCount));

    const newProgress = {
      ...progress,
      [cardId]: {
        ...p,
        status: (p.reviewCount >= 3 ? 'mastered' : 'reviewing') as FeynmanProgress['status'],
        reviewCount: p.reviewCount + 1,
        lastReviewed: now,
        nextReview: nextReview.toISOString(),
      },
    };
    saveProgress(newProgress);
  };

  const toggleFavorite = (cardId: string) => {
    const p = getProgress(cardId);
    const newProgress = {
      ...progress,
      [cardId]: { ...p, isFavorite: !p.isFavorite },
    };
    saveProgress(newProgress);
  };

  const resetProgress = (cardId: string) => {
    const newProgress = { ...progress };
    delete newProgress[cardId];
    saveProgress(newProgress);
  };

  const stats = useMemo(() => {
    const total = PRESET_CARDS.length;
    const mastered = Object.values(progress).filter(
      (p) => p.status === 'mastered'
    ).length;
    const favorites = Object.values(progress).filter((p) => p.isFavorite).length;
    return { total, mastered, favorites };
  }, [progress]);

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy':
        return 'bg-success/20 text-success';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'hard':
        return 'bg-error/20 text-error';
      default:
        return 'bg-text-muted/20 text-text-muted';
    }
  };

  const difficultyLabel = (d: string) => {
    switch (d) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return d;
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative">

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            费曼卡片
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-xs text-text-muted">
              已掌握 {stats.mastered}/{stats.total}
            </div>
            <div className="w-24 h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索概念..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['全部', ...FEYNMAN_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {selectedCard ? (
          /* Card Detail View */
          <div className="surface p-5 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${difficultyColor(
                    selectedCard.difficulty
                  )}`}
                >
                  {difficultyLabel(selectedCard.difficulty)}
                </span>
                <span className="text-xs text-text-muted">
                  {selectedCard.category}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleFavorite(selectedCard.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    getProgress(selectedCard.id).isFavorite
                      ? 'text-error bg-error/10'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={
                      getProgress(selectedCard.id).isFavorite
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setShowBack(false);
                  }}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-6">
              {selectedCard.concept}
            </h2>

            {/* Card Content */}
            <div className="space-y-4">
              <CardSection
                icon={Lightbulb}
                title="定义"
                content={selectedCard.definition}
              />
              <CardSection
                icon={Star}
                title="生活实例"
                content={selectedCard.realLifeExample}
              />
              <CardSection
                icon={Bookmark}
                title="常见误区"
                content={
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCard.commonMistakes.map((m, i) => (
                      <li key={i} className="text-text-secondary">
                        {m}
                      </li>
                    ))}
                  </ul>
                }
              />
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-primary font-medium mb-1">
                  记忆口诀
                </p>
                <p className="text-sm text-text-secondary">
                  {selectedCard.memoryTrick}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleReview(selectedCard.id)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-primary-light transition-colors"
              >
                {getProgress(selectedCard.id).status === 'mastered'
                  ? '再次复习'
                  : '标记已复习'}
              </button>
              {getProgress(selectedCard.id).reviewCount > 0 && (
                <button
                  onClick={() => resetProgress(selectedCard.id)}
                  className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-sm hover:text-text-primary transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress */}
            {getProgress(selectedCard.id).reviewCount > 0 && (
              <div className="mt-4 text-center text-xs text-text-muted">
                已复习 {getProgress(selectedCard.id).reviewCount} 次
                {getProgress(selectedCard.id).nextReview && (
                  <span>
                    · 下次复习：
                    {new Date(
                      getProgress(selectedCard.id).nextReview
                    ).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const p = getProgress(card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedCard(card);
                    setShowBack(false);
                  }}
                  className="surface p-4 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${difficultyColor(
                          card.difficulty
                        )}`}
                      >
                        {difficultyLabel(card.difficulty)}
                      </span>
                      {p.status === 'mastered' && (
                        <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      )}
                    </div>
                    {p.isFavorite && (
                      <Heart className="w-4 h-4 text-error fill-error" />
                    )}
                  </div>
                  <h3 className="font-medium text-text-primary mb-2 group-hover:text-primary-light transition-colors">
                    {card.concept}
                  </h3>
                  <p className="text-xs text-text-muted line-clamp-2 mb-3">
                    {card.definition}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {card.category}
                    </span>
                    {p.reviewCount > 0 && (
                      <span className="text-xs text-success">
                        已复习 {p.reviewCount} 次
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredCards.length === 0 && !selectedCard && (
          <div className="surface p-7 text-center">
            <Brain className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">没有找到匹配的概念卡片</p>
          </div>
        )}
      </main>
    </div>
    </PageTransition>
  );
}

function CardSection({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-text-primary">{title}</span>
      </div>
      <div className="text-sm text-text-secondary">{content}</div>
    </div>
  );
}
