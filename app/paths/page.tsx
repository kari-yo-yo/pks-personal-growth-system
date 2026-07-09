'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  getAllPaths,
  getPathProgress,
  getPathStats,
  updatePathNodeStatus,
  subscribePaths,
} from '@/lib/paths';
import { LearningPath, PathNodeStatus } from '@/types';
import PageTransition from '@/components/PageTransition';
import {
  Route,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  ChevronRight,
  Trash2,
  BarChart3,
} from 'lucide-react';

const PathOrbitalVis = dynamic(() => import('@/components/PathOrbitalVis'), {
  ssr: false,
});

// ─── 状态配置 ───

const STATUS_CONFIG: Record<PathNodeStatus, { icon: React.ElementType; label: string; color: string }> = {
  completed: { icon: CheckCircle2, label: '已完成', color: 'text-emerald-400' },
  in_progress: { icon: PlayCircle, label: '进行中', color: 'text-primary' },
  available: { icon: Circle, label: '待开始', color: 'text-text-muted' },
  locked: { icon: Lock, label: '未解锁', color: 'text-text-muted/40' },
};

export default function PathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  useEffect(() => {
    setPaths(getAllPaths());
    return subscribePaths(() => setPaths(getAllPaths()));
  }, []);

  // 自动选中第一条路径
  useEffect(() => {
    if (!selectedPathId && paths.length > 0) {
      setSelectedPathId(paths[0].id);
    }
  }, [paths, selectedPathId]);

  const selectedPath = useMemo(
    () => paths.find((p) => p.id === selectedPathId),
    [paths, selectedPathId]
  );

  const stats = useMemo(() => getPathStats(paths), [paths]);

  const handleNodeClick = (nodeOrder: number) => {
    if (!selectedPath) return;
    const node = selectedPath.nodes.find((n) => n.order === nodeOrder);
    if (!node) return;

    if (node.status === 'available') {
      updatePathNodeStatus(selectedPath.id, nodeOrder, 'in_progress');
    } else if (node.status === 'in_progress') {
      updatePathNodeStatus(selectedPath.id, nodeOrder, 'completed');
    }
  };

  const handleMarkComplete = (pathId: string, nodeOrder: number) => {
    updatePathNodeStatus(pathId, nodeOrder, 'completed');
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative">

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        {/* Header — utility style, no hero fluff */}
        <div className="mb-8 animate-fade-in">
          <h1 className="heading-display text-2xl font-bold text-text-primary mb-1">学习路径</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">规划和管理你的学习计划</p>
          <p className="text-sm text-text-secondary">
            结构化管理学习进度，逐步解锁知识节点
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8 text-xs text-text-muted">
          <span>{stats.totalPaths} 条路径</span>
          <span>{stats.completedNodes}/{stats.totalNodes} 节点完成</span>
        </div>

        {/* Layout: sidebar list + detail */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Path List — sidebar */}
          <div className="md:w-64 shrink-0 space-y-2">
            {paths.map((p) => {
              const progress = getPathProgress(p);
              const isActive = selectedPathId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPathId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-surface-light border-primary/30'
                      : 'bg-surface/50 border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color || '#6366f1' }}
                    />
                    <span className="text-sm font-medium text-text-primary truncate">
                      {p.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: p.color || '#6366f1',
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">{progress}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail — workspace */}
          <div className="flex-1 min-w-0">
            {!selectedPath ? (
              <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-xl">
                <div className="text-center">
                  <Route className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
                  <p className="text-sm text-text-muted">选择一条路径查看详情</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Path header */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedPath.color || '#6366f1' }}
                    />
                    <h2 className="text-lg font-semibold text-text-primary">
                      {selectedPath.title}
                    </h2>
                  </div>
                  {selectedPath.description && (
                    <p className="text-sm text-text-secondary ml-6">
                      {selectedPath.description}
                    </p>
                  )}
                </div>

                {/* Orbital Visualization */}
                <PathOrbitalVis
                  path={selectedPath}
                  onNodeClick={handleNodeClick}
                />

                {/* Node List */}
                <div className="space-y-1">
                  {selectedPath.nodes.map((node) => {
                    const config = STATUS_CONFIG[node.status];
                    const StatusIcon = config.icon;
                    const progress = getPathProgress(selectedPath);
                    const nodeProgress = Math.round(
                      (selectedPath.nodes.filter((n) => n.order <= node.order && n.status === 'completed').length /
                        selectedPath.nodes.length) *
                        100
                    );

                    return (
                      <div
                        key={node.order}
                        className="group flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-surface-light/50 transition-colors"
                      >
                        {/* Status + number */}
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <StatusIcon className={`w-4 h-4 ${config.color}`} />
                          <span className="text-xs text-text-muted w-5 text-right">
                            {node.order + 1}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              node.status === 'locked'
                                ? 'text-text-muted/50'
                                : node.status === 'completed'
                                  ? 'text-text-primary/70'
                                  : 'text-text-primary'
                            }`}
                          >
                            {node.title}
                          </p>
                          {node.description && (
                            <p className="text-xs text-text-muted mt-0.5 truncate">
                              {node.description}
                            </p>
                          )}
                        </div>

                        {/* Action */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {(node.status === 'available' || node.status === 'in_progress') && (
                            <button
                              onClick={() => handleMarkComplete(selectedPath.id, node.order)}
                              className="p-1 rounded text-text-muted hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                              title="标记完成"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress summary */}
                <div className="flex items-center justify-between px-3 py-3 border-t border-border">
                  <span className="text-xs text-text-muted">
                    {selectedPath.nodes.filter((n) => n.status === 'completed').length}/{selectedPath.nodes.length} 完成
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${getPathProgress(selectedPath)}%`,
                          backgroundColor: selectedPath.color || '#6366f1',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-primary">
                      {getPathProgress(selectedPath)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </PageTransition>
  );
}
