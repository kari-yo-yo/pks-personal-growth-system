'use client';

import { useState } from 'react';
import { loadFromGitHub } from '@/lib/githubData';
import { validateDataIntegrity, autoFixData } from '@/lib/dataValidation';
import { restoreData, getDataStats } from '@/lib/db';
import { ValidationResult } from '@/types';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileSearch,
  RefreshCw,
  Shield,
  Wrench,
} from 'lucide-react';

export default function DataRecoveryPanel() {
  const [validating, setValidating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [fixResult, setFixResult] = useState<string[] | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  // 检查数据完整性
  const handleValidate = async () => {
    setValidating(true);
    setResult(null);
    setFixResult(null);
    try {
      const data = await loadFromGitHub();
      const validation = validateDataIntegrity(data);
      setResult(validation);
      setStats(getDataStats());
    } catch (error) {
      console.error('校验失败:', error);
    } finally {
      setValidating(false);
    }
  };

  // 从 GitHub 恢复
  const handleRestore = async () => {
    setRestoring(true);
    try {
      const data = await loadFromGitHub();
      await restoreData(data);
      setStats(getDataStats());
      alert('✅ 数据恢复完成');
    } catch (error) {
      console.error('恢复失败:', error);
      alert('❌ 恢复失败，请查看控制台');
    } finally {
      setRestoring(false);
    }
  };

  // 自动修复
  const handleAutoFix = async () => {
    setFixing(true);
    try {
      const data = await loadFromGitHub();
      const { fixed, fixes } = autoFixData(data);
      if (fixes.length > 0) {
        await restoreData(fixed);
        setFixResult(fixes);
        // 重新校验
        const validation = validateDataIntegrity(fixed);
        setResult(validation);
      } else {
        setFixResult(['没有发现问题需要修复']);
      }
      setStats(getDataStats());
    } catch (error) {
      console.error('修复失败:', error);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作按钮 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleValidate}
          disabled={validating}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-light transition-all disabled:opacity-50"
        >
          <FileSearch className="w-4 h-4 text-primary" />
          <span className="text-sm">
            {validating ? '检查中...' : '检查数据完整性'}
          </span>
        </button>

        <button
          onClick={handleRestore}
          disabled={restoring}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-light transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-success" />
          <span className="text-sm">
            {restoring ? '恢复中...' : '从 GitHub 恢复'}
          </span>
        </button>

        <button
          onClick={handleAutoFix}
          disabled={fixing}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-light transition-all disabled:opacity-50"
        >
          <Wrench className="w-4 h-4 text-warning" />
          <span className="text-sm">
            {fixing ? '修复中...' : '自动修复'}
          </span>
        </button>
      </div>

      {/* 统计信息 */}
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

      {/* 校验结果 */}
      {result && (
        <div
          className={`rounded-xl border p-4 ${
            result.isValid
              ? 'bg-success/10 border-success/30'
              : 'bg-error/10 border-error/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {result.isValid ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-error" />
            )}
            <span
              className={`font-medium ${
                result.isValid ? 'text-success' : 'text-error'
              }`}
            >
              {result.isValid ? '数据完整性检查通过' : '发现数据问题'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            <StatBadge label="节点" value={result.nodeCount} />
            <StatBadge label="笔记" value={result.noteCount} />
            <StatBadge label="论文" value={result.paperCount} />
            <StatBadge label="进度" value={result.paperProgressCount} />
            <StatBadge label="关系" value={result.relationCount} />
          </div>

          {!result.isValid && result.issues.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-text-secondary mb-2">
                以下问题需要修复：
              </p>
              <div className="max-h-60 overflow-auto space-y-1">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-error/90 py-1 px-2 rounded bg-error/5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 修复结果 */}
      {fixResult && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-warning" />
            <span className="font-medium text-warning">自动修复结果</span>
          </div>
          <div className="space-y-1">
            {fixResult.map((fix, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-text-secondary py-1 px-2 rounded bg-warning/5"
              >
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-success" />
                <span>{fix}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center py-2 px-3 rounded-lg bg-background/50">
      <div className="text-lg font-semibold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
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