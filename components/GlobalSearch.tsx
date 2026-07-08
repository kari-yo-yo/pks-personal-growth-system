'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  FileText,
  GraduationCap,
  Lightbulb,
  Search,
  Calendar,
  X,
  ArrowRight,
} from 'lucide-react';
import { load, getAllNodes, getAllNotes, getAllPapers } from '@/lib/db';
import { KnowledgeNode, Note, Paper } from '@/types';
import { PRESET_CARDS } from '@/lib/feynmanData';

// 全局状态：跨组件通信（兼容 Electron / SSR）
let _searchOpenSignal = 0;
const _searchListeners: Array<() => void> = [];

export function openGlobalSearch() {
  _searchOpenSignal++;
  _searchListeners.forEach((fn) => fn());
}

export function onSearchOpenSignal(fn: () => void) {
  _searchListeners.push(fn);
  return () => {
    const idx = _searchListeners.indexOf(fn);
    if (idx >= 0) _searchListeners.splice(idx, 1);
  };
}

interface SearchResult {
  type: 'node' | 'note' | 'paper' | 'feynman' | 'daily';
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  icon: React.ElementType;
  category?: string;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 加载数据
  useEffect(() => {
    if (open && !loaded) {
      load().then(() => setLoaded(true));
    }
  }, [open, loaded]);

  // Ctrl+K 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 监听打开信号
  useEffect(() => {
    return onSearchOpenSignal(() => setOpen(true));
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  // 搜索逻辑
  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const items: SearchResult[] = [];

    // 搜索知识节点（需要 load 完成）
    if (loaded) {
      const nodes = getAllNodes();
      nodes
        .filter(
          (n) =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.description || '').toLowerCase().includes(q) ||
            (n.tags || []).some((t) => t.toLowerCase().includes(q))
        )
        .forEach((n) => {
          items.push({
            type: 'node',
            id: n.id,
            title: n.title,
            description: n.description,
            href: `/knowledge?node=${n.id}`,
            icon: Brain,
          });
        });

      // 搜索笔记
      const notes = getAllNotes();
      notes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content?.toLowerCase().includes(q)
        )
        .slice(0, 10)
        .forEach((n) => {
          const nodeTitle = n.nodeId
            ? nodes.find((nd) => nd.id === n.nodeId)?.title
            : undefined;
          items.push({
            type: 'note',
            id: n.id,
            title: n.title,
            subtitle: nodeTitle,
            description: (n.content || '').substring(0, 100),
            href: `/notes`,
            icon: FileText,
            category: nodeTitle,
          });
        });

      // 搜索论文
      const papers = getAllPapers();
      papers
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.authors || []).some((a) => a.toLowerCase().includes(q)) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(q))
        )
        .forEach((p) => {
          items.push({
            type: 'paper',
            id: p.id,
            title: p.title,
            subtitle: (p.authors || []).join(', '),
            description: p.abstract?.substring(0, 100),
            href: `/papers`,
            icon: GraduationCap,
            category: p.venue || p.year?.toString(),
          });
        });
    }

    // 搜索费曼卡片（静态数据，无需 load）
    PRESET_CARDS.filter(
      (c) =>
        c.concept.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    ).forEach((c) => {
      items.push({
        type: 'feynman',
        id: c.id,
        title: c.concept,
        subtitle: c.category,
        description: c.definition.substring(0, 100),
        href: '/feynman',
        icon: Lightbulb,
        category: c.category,
      });
    });

    return items;
  }, [query, loaded]);

  // 按类型分组
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((item) => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item);
    });
    return groups;
  }, [results]);

  const handleSelect = (item: SearchResult) => {
    setOpen(false);
    setQuery('');
    router.push(item.href);
  };

  const typeLabels: Record<string, string> = {
    node: '知识节点',
    note: '笔记',
    paper: '论文',
    feynman: '费曼卡片',
  };

  const typeOrder = ['node', 'note', 'paper', 'feynman'];

  // 当前选中的结果索引
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    },
    [results, selectedIndex, handleSelect]
  );

  // 计算当前索引在分组中的位置
  let flatIndex = 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={() => { setOpen(false); setQuery(''); }}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 搜索面板 */}
      <div
        className="relative w-full max-w-xl mx-4 glass rounded-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 80px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.1)',
        }}
      >
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索知识节点、笔记、论文、费曼卡片..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted text-sm outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="清除"
              className="p-1 rounded text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text-muted">
            ESC
          </kbd>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[50vh] overflow-y-auto">
          {!query.trim() && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-muted mb-1">
                输入关键词开始搜索
              </p>
              <p className="text-xs text-text-muted">
                支持 Ctrl+K 快速唤起
              </p>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-muted">
                没有找到与 &quot;{query}&quot; 相关的结果
              </p>
            </div>
          )}

          {typeOrder.map((type) => {
            const items = grouped[type];
            if (!items?.length) return null;

            return (
              <div key={type}>
                {/* 分组标题 */}
                <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 border-b border-border/50">
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                    {typeLabels[type] || type}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {items.length}
                  </span>
                </div>

                {/* 结果列表 */}
                {items.map((item) => {
                  const currentIndex = flatIndex;
                  flatIndex++;

                  const isSelected = selectedIndex === currentIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/10'
                          : 'hover:bg-surface-light'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-primary/20'
                            : 'bg-surface border border-border'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected
                              ? 'text-primary'
                              : 'text-text-muted'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm truncate ${
                              isSelected
                                ? 'text-text-primary'
                                : 'text-text-secondary'
                            }`}
                          >
                            {item.title}
                          </p>
                          {item.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-muted shrink-0">
                              {item.category}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-text-muted truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected
                            ? 'text-primary'
                            : 'text-text-muted opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 底部快捷键提示 */}
        {query.trim() && results.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface/30">
            <div className="flex items-center gap-3 text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-surface border border-border">
                  ↑↓
                </kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-surface border border-border">
                  ↵
                </kbd>
                打开
              </span>
            </div>
            <span className="text-[10px] text-text-muted">
              {results.length} 个结果
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
