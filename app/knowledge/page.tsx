'use client';

import { useEffect, useState } from 'react';
import KnowledgeTree from '@/components/KnowledgeTree';
import {
  load,
  getAllNodes,
  getNotesByNodeId,
  addNode,
  updateNode,
  deleteNode,
} from '@/lib/db';
import { KnowledgeNode } from '@/types';
import PageTransition from '@/components/PageTransition';
import {
  Brain,
  Edit3,
  FileText,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

export default function KnowledgePage() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [nodeNotes, setNodeNotes] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNode, setEditingNode] = useState<KnowledgeNode | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    async function init() {
      await load();
      refreshNodes();
      setLoading(false);
    }
    init();
  }, []);

  function refreshNodes() {
    const all = getAllNodes();
    setNodes(all);
  }

  const handleSelectNode = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setNodeNotes(getNotesByNodeId(node.id));
  };

  const handleAdd = async () => {
    if (!formData.title.trim()) return;
    await addNode({
      title: formData.title,
      description: formData.description,
      parentId: selectedNode?.id || null,
      level: (selectedNode?.level || 0) + 1,
      order: nodes.length,
    });
    setFormData({ title: '', description: '' });
    setShowAddForm(false);
    refreshNodes();
  };

  const handleUpdate = async () => {
    if (!editingNode || !formData.title.trim()) return;
    await updateNode(editingNode.id, {
      title: formData.title,
      description: formData.description,
    });
    setEditingNode(null);
    setFormData({ title: '', description: '' });
    refreshNodes();
    if (selectedNode?.id === editingNode.id) {
      const updated = nodes.find((n) => n.id === editingNode.id);
      if (updated) setSelectedNode(updated);
    }
  };

  const handleDelete = async (node: KnowledgeNode) => {
    if (!confirm(`确定要删除节点 "${node.title}" 及其所有子节点和关联笔记吗？`)) return;
    await deleteNode(node.id);
    setSelectedNode(null);
    refreshNodes();
  };

  const startEdit = (node: KnowledgeNode) => {
    setEditingNode(node);
    setFormData({ title: node.title, description: node.description || '' });
    setShowAddForm(false);
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative">

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            知识系统
          </h1>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingNode(null);
              setFormData({ title: '', description: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加节点
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-muted">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Knowledge Tree */}
            <div className="lg:col-span-1">
              <div className="surface p-3">
                <h2 className="text-sm font-medium text-text-secondary mb-3">
                  知识树
                </h2>
                <KnowledgeTree
                  nodes={nodes}
                  selectedId={selectedNode?.id}
                  onSelect={handleSelectNode}
                  className="max-h-[60vh]"
                />
              </div>
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Add/Edit Form */}
              {(showAddForm || editingNode) && (
                <div className="surface p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-text-primary">
                      {editingNode ? '编辑节点' : '添加节点'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingNode(null);
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
                        placeholder="输入节点标题"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">
                        描述
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 h-20 resize-none"
                        placeholder="输入节点描述（可选）"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingNode ? handleUpdate : handleAdd}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-light transition-colors"
                      >
                        {editingNode ? '保存' : '添加'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingNode(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary text-sm hover:text-text-primary transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Node Detail */}
              {selectedNode ? (
                <div className="surface p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-medium text-text-primary">
                        {selectedNode.title}
                      </h2>
                      {selectedNode.description && (
                        <p className="text-sm text-text-secondary mt-1">
                          {selectedNode.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(selectedNode)}
                        className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedNode)}
                        className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Associated Notes */}
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      关联笔记 ({nodeNotes.length})
                    </h3>
                    {nodeNotes.length === 0 ? (
                      <p className="text-sm text-text-muted py-4">
                        该节点下暂无笔记
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {nodeNotes.map((note) => (
                          <div
                            key={note.id}
                            className="py-2 px-3 rounded-lg bg-surface border border-border"
                          >
                            <p className="text-sm text-text-primary">
                              {note.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="surface p-7 text-center">
                  <Brain className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">选择一个知识节点查看详情</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
    </PageTransition>
  );
}