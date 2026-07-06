import { CollectionName, DataCollections } from '@/types';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/kari-yo-yo/lunwen/main/data';

const COLLECTIONS: CollectionName[] = [
  'nodes',
  'notes',
  'papers',
  'paper_progress',
  'paper_notes',
  'summaries',
  'attachments',
  'relations',
  'knowledge_paper',
  'paper_knowledge',
];

/**
 * 从 GitHub Raw 加载单个数据集合
 */
export async function loadCollectionFromGitHub(
  collection: CollectionName
): Promise<Record<string, any>> {
  try {
    const url = `${GITHUB_RAW_URL}/${collection}.json`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
      },
      // 避免缓存问题
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ GitHub 上未找到 ${collection}.json，返回空数据`);
        return {};
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return {};
    }

    const data = JSON.parse(text);
    console.log(`✅ 从 GitHub 加载 ${collection}: ${Object.keys(data).length} 条记录`);
    return data;
  } catch (error) {
    console.error(`❌ 加载 ${collection} 失败:`, error);
    return {};
  }
}

/**
 * 从 GitHub 加载所有数据集合
 */
export async function loadFromGitHub(): Promise<Partial<DataCollections>> {
  const data: Partial<DataCollections> = {};

  for (const collection of COLLECTIONS) {
    data[collection] = await loadCollectionFromGitHub(collection);
  }

  const totalRecords = Object.values(data).reduce(
    (sum, col) => sum + Object.keys(col || {}).length,
    0
  );
  console.log(`📦 GitHub 数据加载完成，共 ${totalRecords} 条记录`);

  return data;
}

/**
 * 检查 GitHub 上是否有数据
 */
export async function hasGitHubData(): Promise<boolean> {
  try {
    const nodesData = await loadCollectionFromGitHub('nodes');
    return Object.keys(nodesData).length > 0;
  } catch {
    return false;
  }
}

/**
 * 获取数据加载统计
 */
export async function getGitHubDataStats(): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};

  for (const collection of COLLECTIONS) {
    const data = await loadCollectionFromGitHub(collection);
    stats[collection] = Object.keys(data).length;
  }

  return stats;
}