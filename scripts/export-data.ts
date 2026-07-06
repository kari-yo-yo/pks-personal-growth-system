import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

/**
 * 从 Vercel KV 导出所有数据到本地 JSON 文件
 * 用于迁移到 GitHub 存储
 */
async function exportAllData() {
  console.log('🚀 开始从 Vercel KV 导出数据...');

  try {
    // 获取所有键
    const keys = await kv.keys('*');
    console.log(`📋 找到 ${keys.length} 个键`);

    const allData: Record<string, any> = {};

    // 读取所有数据
    for (const key of keys) {
      try {
        allData[key] = await kv.get(key);
      } catch (e) {
        console.warn(`⚠️ 读取键 ${key} 失败:`, e);
      }
    }

    // 按集合分类
    const collections: Record<string, Record<string, any>> = {
      nodes: {},
      notes: {},
      papers: {},
      paper_progress: {},
      paper_notes: {},
      summaries: {},
      attachments: {},
      relations: {},
      knowledge_paper: {},
      paper_knowledge: {},
    };

    for (const [key, value] of Object.entries(allData)) {
      let categorized = false;
      for (const colName of Object.keys(collections)) {
        if (key.startsWith(`${colName}:`)) {
          const id = key.replace(`${colName}:`, '');
          collections[colName][id] = value;
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        // 未分类的数据放入 misc
        if (!collections['misc']) {
          collections['misc'] = {};
        }
        collections['misc'][key] = value;
      }
    }

    // 确保 data 目录存在
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 写入各集合文件
    let totalRecords = 0;
    for (const [name, content] of Object.entries(collections)) {
      const count = Object.keys(content).length;
      totalRecords += count;
      const filePath = path.join(dataDir, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`✅ ${name}.json: ${count} 条记录`);
    }

    // 写入元数据
    const metadata = {
      exportedAt: new Date().toISOString(),
      totalKeys: keys.length,
      totalRecords,
      collections: Object.fromEntries(
        Object.entries(collections).map(([k, v]) => [k, Object.keys(v).length])
      ),
    };
    fs.writeFileSync(
      path.join(dataDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('\n🎉 数据导出完成!');
    console.log(`📊 总计: ${totalRecords} 条记录 (${keys.length} 个键)`);
    console.log(`📁 文件位置: ${dataDir}`);
    console.log('\n下一步: 将 data/ 目录推送到 GitHub 仓库');
  } catch (error) {
    console.error('❌ 导出失败:', error);
    process.exit(1);
  }
}

exportAllData();