'use client';

import { useEffect, useState } from 'react';
import {
  load,
  getAllPapers,
  addPaper,
  updatePaper,
  deletePaper,
  getPaperProgress,
  updatePaperProgress,
} from '@/lib/db';
import { Paper, PaperProgress } from '@/types';
import PageTransition from '@/components/PageTransition';
import {
  BookOpen,
  Edit3,
  ExternalLink,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

export default function PapersPage() {
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    url: '',
    year: '',
    venue: '',
  });

  useEffect(() => {
    async function init() {
      await load();
      refreshData();
      setLoading(false);
    }
    init();
  }, []);

  function refreshData() {
    setPapers(getAllPapers());
  }

  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!formData.title.trim()) return;
    await addPaper({
      title: formData.title,
      authors: formData.authors.split(',').map((a) => a.trim()).filter(Boolean),
      abstract: formData.abstract || undefined,
      url: formData.url || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      venue: formData.venue || undefined,
    });
    setFormData({ title: '', authors: '', abstract: '', url: '', year: '', venue: '' });
    setShowForm(false);
    refreshData();
  };

  const handleUpdate = async () => {
    if (!editingPaper || !formData.title.trim()) return;
    await updatePaper(editingPaper.id, {
      title: formData.title,
      authors: formData.authors.split(',').map((a) => a.trim()).filter(Boolean),
      abstract: formData.abstract || undefined,
      url: formData.url || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      venue: formData.venue || undefined,
    });
    setEditingPaper(null);
    setFormData({ title: '', authors: '', abstract: '', url: '', year: '', venue: '' });
    refreshData();
  };

  const handleDelete = async (paper: Paper) => {
    if (!confirm(`确定要删除论文 "${paper.title}" 吗？`)) return;
    await deletePaper(paper.id);
    refreshData();
  };

  const startEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title,
      authors: paper.authors.join(', '),
      abstract: paper.abstract || '',
      url: paper.url || '',
      year: paper.year?.toString() || '',
      venue: paper.venue || '',
    });
    setShowForm(true);
  };

  const getProgress = (paperId: string): PaperProgress | undefined => {
    return getPaperProgress(paperId);
  };

  const statusColors: Record<string, string> = {
    unread: 'bg-text-muted',
    reading: 'bg-warning',
    completed: 'bg-success',
    reviewed: 'bg-primary',
  };

  const statusLabels: Record<string, string> = {
    unread: '未读',
    reading: '阅读中',
    completed: '已完成',
    reviewed: '已复习',
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative">

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-display text-3xl font-bold text-text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-accent" />
            论文
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">整理和管理你的论文库</p>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingPaper(null);
              setFormData({ title: '', authors: '', abstract: '', url: '', year: '', venue: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加论文
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索论文标题或作者..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-muted">加载中...</div>
        ) : (
          <div className="space-y-4">
            {/* Add/Edit Form */}
            {showForm && (
              <div className="surface p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-primary">
                    {editingPaper ? '编辑论文' : '添加论文'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingPaper(null);
                    }}
                    className="p-1 rounded hover:bg-surface-light text-text-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-text-secondary mb-1">标题</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
                      placeholder="论文标题"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-text-secondary mb-1">作者（逗号分隔）</label>
                    <input
                      type="text"
                      value={formData.authors}
                      onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
                      placeholder="作者1, 作者2, ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">年份</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">会议/期刊</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
                      placeholder="NeurIPS, ICML, ..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-text-secondary mb-1">链接</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
                      placeholder="https://arxiv.org/..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-text-secondary mb-1">摘要</label>
                    <textarea
                      value={formData.abstract}
                      onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 h-24 resize-none"
                      placeholder="论文摘要..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={editingPaper ? handleUpdate : handleAdd}
                    className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/80 transition-colors"
                  >
                    {editingPaper ? '保存' : '添加'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingPaper(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary text-sm hover:text-text-primary transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Papers List */}
            {filteredPapers.length === 0 ? (
              <div className="surface p-7 text-center">
                <GraduationCap className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">
                  {search ? '没有找到匹配的论文' : '暂无论文'}
                </p>
                {!search && (
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingPaper(null);
                      setFormData({ title: '', authors: '', abstract: '', url: '', year: '', venue: '' });
                    }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加第一篇论文
                  </button>
                )}
              </div>
            ) : (
              filteredPapers.map((paper) => {
                const progress = getProgress(paper.id);
                return (
                  <div
                    key={paper.id}
                    className="surface p-4 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-text-primary">
                            {paper.title}
                          </h3>
                          {paper.url && (
                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-light"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {paper.authors.join(', ')}
                          {paper.year && ` · ${paper.year}`}
                          {paper.venue && ` · ${paper.venue}`}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(paper)}
                          className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(paper)}
                          className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {paper.abstract && (
                      <p className="text-sm text-text-secondary line-clamp-2 mt-2">
                        {paper.abstract}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mt-3 flex items-center gap-3">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          statusColors[progress?.status || 'unread']
                        }`}
                      />
                      <span className="text-xs text-text-muted">
                        {statusLabels[progress?.status || 'unread']}
                      </span>
                      {progress && (
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
    </PageTransition>
  );
}