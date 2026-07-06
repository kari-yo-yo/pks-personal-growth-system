'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import DataRecoveryPanel from '@/components/DataRecoveryPanel';
import { load, getDataStats, saveAll } from '@/lib/db';
import { isGitHubSyncEnabled } from '@/lib/githubSync';
import {
  Cloud,
  Database,
  GitBranch,
  HardDrive,
  RefreshCw,
  Save,
  Shield,
} from 'lucide-react';
import ThemePanel from '@/components/ThemePanel';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function init() {
      await load();
      setStats(getDataStats());
      setSyncEnabled(isGitHubSyncEnabled());
      setLoading(false);
    }
    init();
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const results = await saveAll();
      const success = Object.values(results).filter(Boolean).length;
      alert(`同步完成: ${success}/${Object.keys(results).length} 个集合成功`);
    } catch (error) {
      console.error('同步失败:', error);
      alert('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold text-text-primary mb-8">设置</h1>

        {loading ? (
          <div className="text-center py-12 text-text-muted">加载中...</div>
        ) : (
          <div className="space-y-8">
            {/* 数据概览 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                数据概览
              </h2>
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(stats).map(([key, count]) => (
                    <div
                      key={key}
                      className="px-4 py-3 rounded-xl bg-surface border border-border"
                    >
                      <div className="text-2xl font-semibold text-text-primary">
                        {count}
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {getCollectionLabel(key)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 主题设置 */}
            <section className="glass rounded-2xl p-6">
              <ThemePanel />
            </section>

            {/* GitHub 同步状态 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-success" />
                GitHub 同步
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-3">
                    <Cloud
                      className={`w-5 h-5 ${
                        syncEnabled ? 'text-success' : 'text-text-muted'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        GitHub 同步
                      </p>
                      <p className="text-xs text-text-muted">
                        {syncEnabled
                          ? '已配置，数据将同步到 GitHub'
                          : '未配置 GITHUB_TOKEN，数据仅本地存储'}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs ${
                      syncEnabled
                        ? 'bg-success/10 text-success'
                        : 'bg-text-muted/10 text-text-muted'
                    }`}
                  >
                    {syncEnabled ? '已启用' : '未启用'}
                  </div>
                </div>

                {syncEnabled && (
                  <button
                    onClick={handleSyncAll}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {syncing ? '同步中...' : '立即同步到 GitHub'}
                  </button>
                )}
              </div>
            </section>

            {/* 数据恢复 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-warning" />
                数据恢复与修复
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                从 GitHub 恢复数据、检查数据完整性、自动修复数据问题。
              </p>
              <DataRecoveryPanel />
            </section>

            {/* 存储信息 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-accent" />
                存储配置
              </h2>
              <div className="space-y-3">
                <ConfigRow
                  label="GitHub 仓库"
                  value={process.env.NEXT_PUBLIC_GITHUB_REPO || 'kari-yo-yo/lunwen'}
                />
                <ConfigRow
                  label="数据分支"
                  value={process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main'}
                />
                <ConfigRow
                  label="Raw URL"
                  value="https://raw.githubusercontent.com/kari-yo-yo/lunwen/main/data"
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm text-text-primary font-mono">{value}</span>
    </div>
  );
}

function getCollectionLabel(key: string): string {
  const labels: Record<string, string> = {
    nodes: '知识节点',
    notes: '笔记',
    papers: '论文',
    paper_progress: '阅读进度',
    paper_notes: '论文笔记',
    summaries: '总结',
    attachments: '附件',
    relations: '关联',
    knowledge_paper: '知识-论文',
    paper_knowledge: '论文-知识',
  };
  return labels[key] || key;
}