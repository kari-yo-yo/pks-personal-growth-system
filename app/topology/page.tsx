'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import TopologyCanvas from '@/components/TopologyCanvas';
import {
  load,
  getAllNodes,
  getAllRelations,
  getNotesByNodeId,
} from '@/lib/db';
import { buildTopology, TopologyGraph, TopoNode } from '@/lib/topology';
import {
  GitBranch,
  Layers,
  MapPin,
  Network,
  RefreshCw,
  Zap,
} from 'lucide-react';

export default function TopologyPage() {
  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState<TopologyGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<TopoNode | null>(null);

  const loadTopology = async () => {
    setLoading(true);
    // Trigger background load without blocking
    load().catch(() => {});
    // Use whatever data is already available in cache
    const nodes = getAllNodes();
    const relations = getAllRelations();
    const notesPerNode: Record<string, number> = {};
    for (const node of nodes) {
      notesPerNode[node.id] = getNotesByNodeId(node.id).length;
    }
    const g = buildTopology(nodes, relations, notesPerNode);
    setGraph(g);
    setSelectedNode(null);
    setLoading(false);
  };

  useEffect(() => {
    loadTopology();
  }, []);

  const stats = useMemo(() => {
    if (!graph) return null;
    const typeCounts: Record<string, number> = {};
    for (const e of graph.edges) {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    }
    return {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      typeCounts,
    };
  }, [graph]);

  return (
    <div className="min-h-screen relative flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col md:flex-row pt-14 relative z-10">
        {/* Sidebar */}
        <aside className="w-full md:w-72 glass border-r border-border flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-text-primary">知识拓扑</h1>
            </div>
            <p className="text-xs text-text-secondary">
              力导向网络可视化知识节点关联
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-2">
                <StatBox icon={MapPin} label="节点" value={stats.nodeCount} />
                <StatBox icon={GitBranch} label="连接" value={stats.edgeCount} />
              </div>
            )}

            {/* Edge types */}
            {stats && stats.edgeCount > 0 && (
              <div>
                <h3 className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  关系类型
                </h3>
                <div className="space-y-1.5">
                  {Object.entries(stats.typeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-surface"
                    >
                      <span className="text-text-secondary">{getTypeLabel(type)}</span>
                      <span className="text-text-primary font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected node detail */}
            {selectedNode && (
              <div className="glass rounded-xl p-3 border border-primary/20">
                <h3 className="text-xs font-medium text-primary mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  选中节点
                </h3>
                <p className="text-sm font-medium text-text-primary mb-1">
                  {selectedNode.title}
                </p>
                <div className="space-y-1 text-xs text-text-secondary">
                  <p>层级: L{selectedNode.level}</p>
                  <p>笔记: {selectedNode.noteCount} 篇</p>
                  <div className="flex items-center gap-2 pt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedNode.color }}
                    />
                    <span>质量: {selectedNode.mass.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div>
              <h3 className="text-xs font-medium text-text-secondary mb-2">操作</h3>
              <div className="space-y-2">
                <button
                  onClick={loadTopology}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-text-primary hover:bg-surface-light transition-colors text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新布局
                </button>
              </div>
            </div>

            {/* Legend */}
            <div>
              <h3 className="text-xs font-medium text-text-secondary mb-2">图例</h3>
              <div className="space-y-1.5 text-xs text-text-secondary">
                <LegendItem color="#6366f1" label="层级 0 (根节点)" />
                <LegendItem color="#8b5cf6" label="层级 1" />
                <LegendItem color="#ec4899" label="层级 2" />
                <LegendItem color="#f59e0b" label="层级 3+" />
                <p className="pt-1 text-text-muted">节点大小 = 笔记数量</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <div className="flex-1 relative min-h-[400px] md:min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                <p className="text-sm text-text-muted">构建拓扑网络...</p>
              </div>
            </div>
          ) : graph && graph.nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <Network className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">暂无知识节点</p>
                <p className="text-xs text-text-secondary mt-1">
                  在「知识系统」中添加节点后，拓扑图将自动显示
                </p>
              </div>
            </div>
          ) : graph ? (
            <TopologyCanvas
              graph={graph}
              onNodeSelect={setSelectedNode}
              selectedNodeId={selectedNode?.id || null}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="px-3 py-2 rounded-xl bg-surface border border-border text-center">
      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
      <div className="text-lg font-bold text-text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    parent: '父子',
    reference: '引用',
    related: '关联',
    prerequisite: '前置',
    next: '后续',
  };
  return labels[type] || type;
}
