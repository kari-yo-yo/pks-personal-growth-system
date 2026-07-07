import { restoreToCache, getAllData } from './db';
import { FullBackup } from './export';

export interface ImportResult {
  success: boolean;
  message: string;
  counts?: Record<string, number>;
}

export function validateBackup(data: unknown): data is FullBackup {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'string') return false;
  if (typeof d.exportedAt !== 'string') return false;
  if (typeof d.db !== 'object' || d.db === null) return false;
  if (!Array.isArray(d.insights)) return false;
  if (!Array.isArray(d.paths)) return false;
  return true;
}

export function importFullJSON(jsonString: string, mode: 'merge' | 'replace'): ImportResult {
  try {
    const data = JSON.parse(jsonString);

    if (!validateBackup(data)) {
      return { success: false, message: '无效的备份文件格式' };
    }

    const backup = data as FullBackup;
    const current = getAllData();
    const result: Record<string, number> = {};

    if (mode === 'replace') {
      restoreToCache(backup.db);
      // Insights and paths are stored in localStorage, handled separately
    } else {
      // Merge: only add items that don't exist
      for (const [collection, items] of Object.entries(backup.db)) {
        if (!items || typeof items !== 'object') continue;
        const currentCollection = (current as Record<string, Record<string, unknown>>)[collection];
        const merged = { ...(currentCollection || {}), ...items };
        (backup.db as Record<string, unknown>)[collection] = merged;
      }
      restoreToCache(backup.db);
    }

    // Handle insights
    if (backup.insights?.length) {
      try {
        const existing = JSON.parse(localStorage.getItem('pks_insights') || '[]');
        const existingIds = new Set(existing.map((i: { id: string }) => i.id));
        const newInsights = mode === 'replace'
          ? backup.insights
          : backup.insights.filter((i) => !existingIds.has(i.id));
        const merged = mode === 'replace' ? newInsights : [...existing, ...newInsights];
        localStorage.setItem('pks_insights', JSON.stringify(merged));
        result.insights = newInsights.length;
      } catch {
        // ignore localStorage errors
      }
    }

    // Handle paths
    if (backup.paths?.length) {
      try {
        const existing = JSON.parse(localStorage.getItem('pks_paths') || '[]');
        const existingIds = new Set(existing.map((p: { id: string }) => p.id));
        const newPaths = mode === 'replace'
          ? backup.paths
          : backup.paths.filter((p) => !existingIds.has(p.id));
        const merged = mode === 'replace' ? newPaths : [...existing, ...newPaths];
        localStorage.setItem('pks_paths', JSON.stringify(merged));
        result.paths = newPaths.length;
      } catch {
        // ignore localStorage errors
      }
    }

    // Count imported db items
    for (const [key, items] of Object.entries(backup.db)) {
      if (items && typeof items === 'object') {
        result[key] = Object.keys(items).length;
      }
    }

    return {
      success: true,
      message: mode === 'replace' ? '数据已替换' : '数据已合并',
      counts: result,
    };
  } catch {
    return { success: false, message: 'JSON 解析失败' };
  }
}

export function clearAllData(): ImportResult {
  try {
    // Clear localStorage items
    localStorage.removeItem('pks_insights');
    localStorage.removeItem('pks_paths');
    localStorage.removeItem('pks_themes');

    // Clear db cache
    restoreToCache({});

    return { success: true, message: '所有本地数据已清空' };
  } catch (error) {
    return { success: false, message: '清空失败: ' + (error as Error).message };
  }
}
