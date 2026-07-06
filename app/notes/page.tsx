'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { load, getAllNotes, getAllNodes, addNote, updateNote, deleteNote } from '@/lib/db';
import { Note, KnowledgeNode } from '@/types';
import {
  Edit3,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

export default function NotesPage() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    nodeId: '',
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
    setNotes(getAllNotes());
    setNodes(getAllNodes());
  }

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.title.trim()) return;
    await addNote({
      title: formData.title,
      content: formData.content,
      nodeId: formData.nodeId || undefined,
    });
    setFormData({ title: '', content: '', nodeId: '' });
    setShowForm(false);
    refreshData();
  };

  const handleUpdate = async () => {
    if (!editingNote || !formData.title.trim()) return;
    await updateNote(editingNote.id, {
      title: formData.title,
      content: formData.content,
      nodeId: formData.nodeId || undefined,
    });
    setEditingNote(null);
    setFormData({ title: '', content: '', nodeId: '' });
    refreshData();
  };

  const handleDelete = async (note: Note) => {
    if (!confirm(`确定要删除笔记 "${note.title}" 吗？`)) return;
    await deleteNote(note.id);
    refreshData();
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      nodeId: note.nodeId || '',
    });
    setShowForm(true);
  };

  const getNodeTitle = (nodeId?: string) => {
    if (!nodeId) return null;
    const node = nodes.find((n) => n.id === nodeId);
    return node?.title;
  };

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-6 h-6 text-success" />
            笔记
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingNote(null);
              setFormData({ title: '', content: '', nodeId: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/30 text-success hover:bg-success/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建笔记
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索笔记..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-muted">加载中...</div>
        ) : (
          <div className="space-y-4">
            {/* Add/Edit Form */}
            {showForm && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-primary">
                    {editingNote ? '编辑笔记' : '新建笔记'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingNote(null);
                    }}
                    className="p-1 rounded hover:bg-surface-light text-text-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      标题
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50"
                      placeholder="输入笔记标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      关联知识节点
                    </label>
                    <select
                      value={formData.nodeId}
                      onChange={(e) =>
                        setFormData({ ...formData, nodeId: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary focus:outline-none focus:border-primary/50"
                    >
                      <option value="">-- 选择节点 --</option>
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      内容
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 h-32 resize-none"
                      placeholder="输入笔记内容..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingNote ? handleUpdate : handleAdd}
                      className="px-4 py-2 rounded-lg bg-success text-white text-sm hover:bg-success/80 transition-colors"
                    >
                      {editingNote ? '保存' : '添加'}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingNote(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary text-sm hover:text-text-primary transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">
                  {search ? '没有找到匹配的笔记' : '暂无笔记'}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="glass rounded-2xl p-5 card-hover group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {note.title}
                      </h3>
                      {getNodeTitle(note.nodeId) && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {getNodeTitle(note.nodeId)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note)}
                        className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-3">
                    {note.content}
                  </p>
                  <div className="mt-3 text-xs text-text-muted">
                    {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}