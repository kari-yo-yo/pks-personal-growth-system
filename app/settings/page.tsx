'use client';

import { useEffect, useRef, useState } from 'react';
import DataRecoveryPanel from '@/components/DataRecoveryPanel';
import { load, getDataStats, saveAll } from '@/lib/db';
import { isGitHubSyncEnabled } from '@/lib/githubSync';
import {
  exportFullJSON,
  exportNodesMarkdown,
  exportNotesMarkdown,
  exportPapersMarkdown,
  exportInsightsMarkdown,
  downloadFile,
} from '@/lib/export';
import { importFullJSON, clearAllData } from '@/lib/import';
import {
  Cloud,
  Database,
  Download,
  FileJson,
  FileText,
  GitBranch,
  HardDrive,
  Import,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportJSON = () => {
    const json = exportFullJSON();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `pks-backup-${date}.json`);
  };

  const handleExportMD = (type: 'nodes' | 'notes' | 'papers' | 'insights') => {
    const exporters: Record<string, () => string> = {
      nodes: exportNodesMarkdown,
      notes: exportNotesMarkdown,
      papers: exportPapersMarkdown,
      insights: exportInsightsMarkdown,
    };
    const md = exporters[type]();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(md, `pks-${type}-${date}.md`, 'text/markdown');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const result = importFullJSON(content, importMode);
      setImportResult(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
      if (result.success) {
        setStats(getDataStats());
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有本地数据吗？此操作不可恢复！')) {
      const result = clearAllData();
      alert(result.message);
      setStats(getDataStats());
    }
  };

  return (
    <div className="min-h-screen relative">

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

            {/* 数据导出 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                数据导出
              </h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-sm"
                  >
                    <FileJson className="w-4 h-4" />
                    完整备份 (JSON)
                  </button>
                  <button
                    onClick={() => handleExportMD('nodes')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    知识节点 (MD)
                  </button>
                  <button
                    onClick={() => handleExportMD('notes')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-text-primary transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    笔记 (MD)
                  </button>
                  <button
                    onClick={() => handleExportMD('papers')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    论文 (MD)
                  </button>
                  <button
                    onClick={() => handleExportMD('insights')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    灵感 (MD)
                  </button>
                </div>
                <p className="text-xs text-text-muted">
                  JSON 备份包含所有模块数据，Markdown 导出便于阅读和分享。
                </p>
              </div>
            </section>

            {/* 数据导入 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-success" />
                数据导入
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="radio"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="accent-primary"
                    />
                    合并模式（保留现有数据）
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="radio"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-primary"
                    />
                    替换模式（覆盖现有数据）
                  </label>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/30 text-success hover:bg-success/20 transition-colors text-sm"
                >
                  <Import className="w-4 h-4" />
                  选择备份文件导入
                </button>
                {importResult && (
                  <p className="text-sm px-3 py-2 rounded-lg bg-surface border border-border">
                    {importResult}
                  </p>
                )}
              </div>
            </section>

            {/* 危险操作 */}
            <section className="glass rounded-2xl p-6 border border-error/20">
              <h2 className="text-lg font-medium text-error mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                危险操作
              </h2>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-error/5 border border-error/10">
                <div>
                  <p className="text-sm font-medium text-text-primary">清空所有本地数据</p>
                  <p className="text-xs text-text-muted">此操作不可恢复，请确保已备份</p>
                </div>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl bg-error/10 border border-error/30 text-error hover:bg-error/20 transition-colors text-sm"
                >
                  清空数据
                </button>
              </div>
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