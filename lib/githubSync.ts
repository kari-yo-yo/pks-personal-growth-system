import { CollectionName } from '@/types';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'kari-yo-yo/lunwen';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 * 同步数据到 GitHub
 * 使用 Contents API 先获取 SHA 再更新文件
 */
export async function syncToGitHub(
  collection: CollectionName,
  data: Record<string, any>
): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️ GITHUB_TOKEN 未设置，跳过同步到 GitHub');
    return false;
  }

  const path = `data/${collection}.json`;
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;

  try {
    // 1. 获取当前文件 SHA（乐观锁）
    const getRes = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'personal-knowledge-system',
      },
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    } else if (getRes.status !== 404) {
      console.error(`❌ 获取 ${collection} SHA 失败:`, getRes.status, await getRes.text());
      return false;
    }

    // 2. 创建或更新文件
    const body: Record<string, string> = {
      message: `Update ${collection} [${new Date().toISOString()}]`,
      content,
      branch: GITHUB_BRANCH,
    };

    if (sha) {
      body.sha = sha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'personal-knowledge-system',
      },
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      // 如果是 409 冲突，可能是并发更新导致
      if (putRes.status === 409) {
        console.error(`❌ 同步 ${collection} 冲突(409)，请稍后重试:`, errorText);
      } else {
        console.error(`❌ 同步 ${collection} 失败:`, putRes.status, errorText);
      }
      return false;
    }

    console.log(`✅ 同步到 GitHub: ${collection} (${Object.keys(data).length} 条记录)`);
    return true;
  } catch (error) {
    console.error(`❌ 同步 ${collection} 异常:`, error);
    return false;
  }
}

/**
 * 批量同步多个集合到 GitHub（串行执行避免冲突）
 */
export async function syncAllToGitHub(
  dataMap: Partial<Record<CollectionName, Record<string, any>>>
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const [collection, data] of Object.entries(dataMap)) {
    if (data && Object.keys(data).length > 0) {
      results[collection] = await syncToGitHub(collection as CollectionName, data);
      // 添加短暂延迟避免触发速率限制
      await sleep(300);
    }
  }

  return results;
}

/**
 * 检查 GitHub 同步配置是否可用
 */
export function isGitHubSyncEnabled(): boolean {
  return !!GITHUB_TOKEN && !!GITHUB_REPO;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}