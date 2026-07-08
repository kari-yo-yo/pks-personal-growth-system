'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Pin, Trash2, Tag } from 'lucide-react';
import {
  addInsight,
  togglePin,
  deleteInsight,
  subscribeInsights,
  MOODS,
  COLORS,
} from '@/lib/insights';
import { Insight, InsightMood, InsightColor } from '@/types';

// ─── 跨组件通信 ───
let _insightOpenSignal = 0;
const _insightListeners: Array<() => void> = [];

export function openInsightFAB() {
  _insightOpenSignal++;
  _insightListeners.forEach((fn) => fn());
}

export function onInsightOpenSignal(fn: () => void) {
  _insightListeners.push(fn);
  return () => {
    const idx = _insightListeners.indexOf(fn);
    if (idx >= 0) _insightListeners.splice(idx, 1);
  };
}

export default function InsightFAB() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<InsightMood>('💡 灵感');
  const [color, setColor] = useState<InsightColor>('indigo');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState<Insight | null>(null);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return onInsightOpenSignal(() => setOpen(true));
  }, []);

  // Ctrl+Shift+N 快捷键
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = useCallback(() => {
    if (!content.trim()) return;
    const insight = addInsight(content, mood, color, tags);
    setJustAdded(insight);
    setSaved(true);
    setContent('');
    setTags([]);
    setTagInput('');
    setMood('💡 灵感');
    setColor('indigo');

    setTimeout(() => {
      setSaved(false);
      setJustAdded(null);
      setOpen(false);
    }, 1200);
  }, [content, mood, color, tags]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const colorObj = COLORS.find((c) => c.key === color) || COLORS[0];

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="记录灵感"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
        title="记录灵感 (Ctrl+Shift+N)"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

          {/* Modal */}
          <div className="relative z-10 w-full sm:max-w-lg mx-0 sm:mx-4 mb-0 sm:mb-0 rounded-t-3xl sm:rounded-2xl border animate-slide-up overflow-hidden"
            style={{
              background: 'rgba(19, 19, 31, 0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: colorObj.key === 'indigo' ? 'rgba(99,102,241,0.3)' : colorObj.key === 'amber' ? 'rgba(245,158,11,0.3)' : colorObj.key === 'emerald' ? 'rgba(34,197,94,0.3)' : colorObj.key === 'rose' ? 'rgba(244,63,94,0.3)' : colorObj.key === 'cyan' ? 'rgba(6,182,212,0.3)' : 'rgba(139,92,246,0.3)',
              boxShadow: `0 0 40px ${colorObj.key === 'indigo' ? 'rgba(99,102,241,0.15)' : colorObj.key === 'amber' ? 'rgba(245,158,11,0.15)' : colorObj.key === 'emerald' ? 'rgba(34,197,94,0.15)' : colorObj.key === 'rose' ? 'rgba(244,63,94,0.15)' : colorObj.key === 'cyan' ? 'rgba(6,182,212,0.15)' : 'rgba(139,92,246,0.15)'}`,
            }}
          >
            {/* Grip bar (mobile) */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-text-primary text-sm">灵感速记</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="min-w-[44px] min-h-[44px] rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {saved && justAdded ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="text-3xl mb-2">{justAdded.mood.split(' ')[0]}</div>
                  <p className="text-sm text-success font-medium">灵感已捕获</p>
                </div>
              ) : (
                <>
                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="记录此刻的灵感..."
                    rows={4}
                    className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted border border-border focus:outline-none focus:border-primary/50 resize-none transition-colors"
                  />

                  {/* Mood Selector */}
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">心情</label>
                    <div className="flex flex-wrap gap-1.5">
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            mood === m
                              ? 'bg-primary/20 text-primary-light ring-1 ring-primary/30'
                              : 'bg-surface text-text-secondary hover:bg-surface-light'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">标记色</label>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c.key}
                          onClick={() => setColor(c.key)}
                          aria-label="选择颜色"
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            color === c.key ? 'scale-110' : 'hover:scale-110'
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-full block"
                            style={{
                              backgroundColor:
                                c.key === 'indigo' ? '#6366f1' : c.key === 'amber' ? '#f59e0b' : c.key === 'emerald' ? '#22c55e' : c.key === 'rose' ? '#f43f5e' : c.key === 'cyan' ? '#06b6d4' : '#8b5cf6',
                              outline: color === c.key ? '2px solid var(--color-background)' : 'none',
                              outlineOffset: '2px',
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs text-text-muted mb-2 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      标签（可选）
                    </label>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary-light text-xs"
                          >
                            {t}
                            <button
                              onClick={() => handleRemoveTag(t)}
                              aria-label={`标签: ${t}`}
                              className="min-w-[44px] min-h-[44px] hover:text-error transition-colors flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKey}
                      placeholder="输入标签后回车"
                      className="w-full bg-surface rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted border border-border focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!saved && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <span className="text-[10px] text-text-muted">Ctrl+Enter 提交 · Esc 关闭</span>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                >
                  捕获灵感
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
