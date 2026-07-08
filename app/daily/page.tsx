'use client';

import { useEffect, useState, useMemo } from 'react';
import PageTransition from '@/components/PageTransition';
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Flame,
  Save,
  Smile,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';

interface DailySummary {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  highlights: string[];
  learned: string;
  tomorrowGoals: string;
  reflections: string;
  createdAt: string;
}

const MOOD_OPTIONS = [
  { value: 'great', label: '超棒', icon: '😄', color: 'text-success' },
  { value: 'good', label: '不错', icon: '🙂', color: 'text-primary' },
  { value: 'neutral', label: '一般', icon: '😐', color: 'text-text-muted' },
  { value: 'bad', label: '糟糕', icon: '😔', color: 'text-warning' },
  { value: 'terrible', label: '很差', icon: '😫', color: 'text-error' },
] as const;

export default function DailyPage() {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<DailySummary | null>(
    null
  );
  const [formData, setFormData] = useState({
    mood: 'good' as DailySummary['mood'],
    highlights: [''],
    learned: '',
    tomorrowGoals: '',
    reflections: '',
  });

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem('daily-summaries');
    if (saved) {
      try {
        setSummaries(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveSummaries = (newSummaries: DailySummary[]) => {
    setSummaries(newSummaries);
    localStorage.setItem('daily-summaries', JSON.stringify(newSummaries));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySummary = summaries.find((s) => s.date === todayStr);

  const handleSave = () => {
    const newSummary: DailySummary = {
      id: `daily_${Date.now()}`,
      date: todayStr,
      mood: formData.mood,
      highlights: formData.highlights.filter(Boolean),
      learned: formData.learned,
      tomorrowGoals: formData.tomorrowGoals,
      reflections: formData.reflections,
      createdAt: new Date().toISOString(),
    };

    const existing = summaries.findIndex((s) => s.date === todayStr);
    let newSummaries: DailySummary[];
    if (existing >= 0) {
      newSummaries = [...summaries];
      newSummaries[existing] = newSummary;
    } else {
      newSummaries = [newSummary, ...summaries];
    }
    saveSummaries(newSummaries);
    setShowForm(false);
    setFormData({
      mood: 'good',
      highlights: [''],
      learned: '',
      tomorrowGoals: '',
      reflections: '',
    });
  };

  const addHighlight = () => {
    setFormData({
      ...formData,
      highlights: [...formData.highlights, ''],
    });
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData({ ...formData, highlights: newHighlights });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index);
    setFormData({ ...formData, highlights: newHighlights });
  };

  // 热力图数据
  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    summaries.forEach((s) => {
      data[s.date] =
        MOOD_OPTIONS.findIndex((m) => m.value === s.mood) + 1;
    });
    return data;
  }, [summaries]);

  // 生成最近 12 周的日期
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setDate(startOfWeek.getDate() - 11 * 7);

    for (let w = 0; w < 12; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + w * 7 + d);
        week.push(date);
      }
      result.push(week);
    }
    return result;
  }, []);

  const getHeatColor = (dateStr: string) => {
    const level = heatmapData[dateStr];
    if (!level) return 'bg-surface';
    const colors = [
      'bg-success/20',
      'bg-success/40',
      'bg-success/60',
      'bg-success/80',
      'bg-success',
    ];
    return colors[level - 1] || 'bg-surface';
  };

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      if (heatmapData[str]) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [heatmapData]);

  return (
    <PageTransition>
    <div className="min-h-screen relative">

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            每日总结
          </h1>
          {!todaySummary && (
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedSummary(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              写今日总结
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <StatCard
            icon={Flame}
            label="连续记录"
            value={`${streak} 天`}
            color="text-warning"
          />
          <StatCard
            icon={CheckCircle}
            label="总计记录"
            value={`${summaries.length} 天`}
            color="text-success"
          />
          <StatCard
            icon={Star}
            label="本月记录"
            value={`${
              summaries.filter((s) => {
                const d = new Date(s.date);
                const now = new Date();
                return (
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                );
              }).length
            } 天`}
            color="text-primary"
          />
          <StatCard
            icon={TrendingUp}
            label="本周记录"
            value={`${
              summaries.filter((s) => {
                const d = new Date(s.date);
                const now = new Date();
                const diff = now.getTime() - d.getTime();
                return diff < 7 * 24 * 60 * 60 * 1000;
              }).length
            } 天`}
            color="text-accent"
          />
        </div>

        {/* Heatmap */}
        <div className="surface p-4 mb-10">
          <h2 className="text-sm font-medium text-text-secondary mb-4">
            学习热力图
          </h2>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((date, di) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = dateStr === todayStr;
                  return (
                    <div
                      key={di}
                      className={`w-3 h-3 rounded-sm ${getHeatColor(
                        dateStr
                      )} ${isToday ? 'ring-1 ring-primary' : ''}`}
                      title={`${dateStr}: ${
                        heatmapData[dateStr]
                          ? MOOD_OPTIONS[heatmapData[dateStr] - 1]?.label
                          : '无记录'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
            <span>差</span>
            <div className="flex gap-1">
              {['bg-surface', 'bg-success/20', 'bg-success/40', 'bg-success/60', 'bg-success/80', 'bg-success'].map(
                (c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                )
              )}
            </div>
            <span>好</span>
          </div>
        </div>

        {/* Today's Summary */}
        {todaySummary && !showForm && (
          <div className="surface p-4 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-text-primary">
                今日总结
              </h2>
              <button
                onClick={() => {
                  setFormData({
                    mood: todaySummary.mood,
                    highlights: todaySummary.highlights.length
                      ? todaySummary.highlights
                      : [''],
                    learned: todaySummary.learned,
                    tomorrowGoals: todaySummary.tomorrowGoals,
                    reflections: todaySummary.reflections,
                  });
                  setShowForm(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                编辑
              </button>
            </div>
            <SummaryCard summary={todaySummary} />
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="surface p-4 mb-10">
            <h2 className="text-lg font-medium text-text-primary mb-4">
              {todaySummary ? '编辑今日总结' : '写今日总结'}
            </h2>
            <div className="space-y-4">
              {/* Mood */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  今日心情
                </label>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() =>
                        setFormData({ ...formData, mood: m.value })
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.mood === m.value
                          ? 'bg-primary/20 text-primary'
                          : 'bg-surface text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  今日亮点
                </label>
                <div className="space-y-2">
                  {formData.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => updateHighlight(i, e.target.value)}
                        placeholder="记录一个亮点..."
                        className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
                      />
                      {formData.highlights.length > 1 && (
                        <button
                          onClick={() => removeHighlight(i)}
                          className="p-2 rounded-lg text-text-muted hover:text-error"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addHighlight}
                    className="text-xs text-primary hover:text-primary-light"
                  >
                    + 添加亮点
                  </button>
                </div>
              </div>

              {/* Learned */}
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  今天学到了什么
                </label>
                <textarea
                  value={formData.learned}
                  onChange={(e) =>
                    setFormData({ ...formData, learned: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 h-20 resize-none"
                  placeholder="记录今天学到的新知识..."
                />
              </div>

              {/* Tomorrow Goals */}
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  明日目标
                </label>
                <textarea
                  value={formData.tomorrowGoals}
                  onChange={(e) =>
                    setFormData({ ...formData, tomorrowGoals: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 h-16 resize-none"
                  placeholder="明天想完成什么？"
                />
              </div>

              {/* Reflections */}
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  反思
                </label>
                <textarea
                  value={formData.reflections}
                  onChange={(e) =>
                    setFormData({ ...formData, reflections: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 h-16 resize-none"
                  placeholder="有什么可以改进的地方？"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-light transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary text-sm hover:text-text-primary transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">
            历史记录
          </h2>
          {summaries.length === 0 ? (
            <div className="surface-raised p-6 text-center">
              <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">还没有记录，开始写第一篇总结吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {summaries
                .filter((s) => s.date !== todayStr)
                .map((summary) => (
                  <div
                    key={summary.id}
                    onClick={() =>
                      setSelectedSummary(
                        selectedSummary?.id === summary.id ? null : summary
                      )
                    }
                    className="surface p-3 cursor-pointer pressable"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {
                            MOOD_OPTIONS.find((m) => m.value === summary.mood)
                              ?.icon
                          }
                        </span>
                        <div>
                          <p className="text-sm text-text-primary">
                            {summary.date}
                          </p>
                          <p className="text-xs text-text-muted">
                            {summary.highlights.filter(Boolean).length} 个亮点
                            {summary.learned && ' · 有学习记录'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs ${
                          MOOD_OPTIONS.find((m) => m.value === summary.mood)
                            ?.color || ''
                        }`}
                      >
                        {
                          MOOD_OPTIONS.find((m) => m.value === summary.mood)
                            ?.label
                        }
                      </span>
                    </div>
                    {selectedSummary?.id === summary.id && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <SummaryCard summary={summary} />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </PageTransition>
  );
}

function SummaryCard({ summary }: { summary: DailySummary }) {
  return (
    <div className="space-y-3">
      {summary.highlights.filter(Boolean).length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-1">今日亮点</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.highlights.filter(Boolean).map((h, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
      {summary.learned && (
        <div>
          <p className="text-xs text-text-muted mb-1">所学</p>
          <p className="text-sm text-text-secondary">{summary.learned}</p>
        </div>
      )}
      {summary.tomorrowGoals && (
        <div>
          <p className="text-xs text-text-muted mb-1">明日目标</p>
          <p className="text-sm text-text-secondary">{summary.tomorrowGoals}</p>
        </div>
      )}
      {summary.reflections && (
        <div>
          <p className="text-xs text-text-muted mb-1">反思</p>
          <p className="text-sm text-text-secondary">{summary.reflections}</p>
        </div>
      )}
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
  value: string;
  color: string;
}) {
  return (
    <div className="surface p-3 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
