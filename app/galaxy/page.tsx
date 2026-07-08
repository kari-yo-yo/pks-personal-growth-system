'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  load,
  getAllNodes,
  getAllNotes,
  getNotesByNodeId,
  getNodeById,
  getRelationsBySource,
  getRelationsByTarget,
} from '@/lib/db';
import { KnowledgeNode } from '@/types';
import { Sparkles, FileText, X } from 'lucide-react';

// 动态导入 GalaxyVisualization，避免 SSR 问题
const GalaxyVisualization = dynamic(
  () => import('@/components/GalaxyVisualization'),
  { ssr: false, loading: () => <GalaxyLoader /> }
);

function GalaxyLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '500px', background: '#050510' }}>
      <div className="text-center">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
        <p className="text-sm text-text-muted">正在加载银河星图...</p>
      </div>
    </div>
  );
}

export default function GalaxyPage() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      await load();
      setNodes(getAllNodes());
      setLoading(false);
    }
    init();
  }, []);

  // 计算每个节点的笔记数量
  const notesPerNode = useMemo(() => {
    const counts: Record<string, number> = {};
    const allNotes = getAllNotes();
    allNotes.forEach((note) => {
      if (note.nodeId) {
        counts[note.nodeId] = (counts[note.nodeId] || 0) + 1;
      }
    });
    return counts;
  }, [loading, nodes]);

  const handleSelectNode = (id: string) => {
    setSelectedId(id);
    const node = getNodeById(id);
    setSelectedNode(node || null);
    setSelectedNotes(node ? getNotesByNodeId(id) : []);
  };

  const handleClose = () => {
    setSelectedId(null);
    setSelectedNode(null);
    setSelectedNotes([]);
  };

  // 获取选中节点的关联关系
  const relations = useMemo(() => {
    if (!selectedId) return [];
    return [
      ...getRelationsBySource(selectedId),
      ...getRelationsByTarget(selectedId),
    ];
  }, [selectedId]);

  if (loading) {
    return (
      <div className="min-h-screen relative" style={{ background: '#050510' }}>
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <GalaxyLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#050510' }}>

      {/* 全屏 3D 星图 */}
      <div className="relative" style={{ height: 'calc(100vh - 56px)', marginTop: '56px' }}>
        <h1 className="absolute top-4 left-4 text-xl font-bold text-text-primary z-10">银河星图</h1>
        <GalaxyVisualization
          nodes={nodes}
          notesPerNode={notesPerNode}
          selectedId={selectedId}
          onSelectNode={handleSelectNode}
          className="w-full h-full"
        />

        {/* 选中节点信息面板 */}
        {selectedNode && (
          <div
            className="absolute right-4 top-20 w-80 glass rounded-2xl p-5 z-10"
            style={{ maxHeight: '60vh', overflowY: 'auto' }}
          >
            <h2 className="text-sm font-medium text-text-secondary mb-3">节点详情</h2>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary truncate">
                  {selectedNode.title}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {notesPerNode[selectedNode.id] || 0} 条笔记
                  {relations.length > 0 && ` · ${relations.length} 个关联`}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-surface-light text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 节点信息 */}
            <div className="space-y-2 mb-4">
              {selectedNode.description && (
                <p className="text-sm text-text-secondary">
                  {selectedNode.description}
                </p>
              )}
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedNode.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 关联笔记 */}
            {selectedNotes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  关联笔记
                </h4>
                <div className="space-y-1.5">
                  {selectedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="py-2 px-3 rounded-lg bg-surface border border-border"
                    >
                      <p className="text-sm text-text-primary truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                        {note.content.substring(0, 80)}
                        {note.content.length > 80 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedNotes.length === 0 && (
              <p className="text-xs text-text-muted py-4 text-center">
                该节点暂无关联笔记
              </p>
            )}

            {/* 关联关系 */}
            {relations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-secondary mb-2">
                  关联关系
                </h4>
                <div className="space-y-1">
                  {relations.map((rel) => (
                    <div
                      key={rel.id}
                      className="py-1.5 px-3 rounded-lg bg-surface text-xs text-text-muted"
                    >
                      {rel.type === 'parent' && '↑ '}
                      {rel.type === 'next' && '→ '}
                      {rel.type === 'prerequisite' && '◆ '}
                      {rel.type}{' '}
                      {rel.description || rel.targetId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
