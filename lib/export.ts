import { getAllData } from './db';
import { getAllInsights } from './insights';
import { getAllPaths } from './paths';
import { DataCollections } from '@/types';

export interface FullBackup {
  version: string;
  exportedAt: string;
  db: Partial<DataCollections>;
  insights: ReturnType<typeof getAllInsights>;
  paths: ReturnType<typeof getAllPaths>;
}

export function exportFullJSON(): string {
  const backup: FullBackup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    db: getAllData(),
    insights: getAllInsights(),
    paths: getAllPaths(),
  };
  return JSON.stringify(backup, null, 2);
}

export function exportNodesMarkdown(): string {
  const { nodes } = getAllData();
  if (!nodes || Object.keys(nodes).length === 0) return '# 知识节点\n\n暂无数据。\n';

  let md = '# 知识节点导出\n\n';
  md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  for (const node of Object.values(nodes)) {
    md += `## ${node.title}\n\n`;
    if (node.description) md += `${node.description}\n\n`;
    md += `- **层级**: L${node.level}\n`;
    if (node.tags?.length) md += `- **标签**: ${node.tags.join(', ')}\n`;
    if (node.parentId) md += `- **父节点**: ${node.parentId}\n`;
    md += `- **创建时间**: ${new Date(node.createdAt).toLocaleString('zh-CN')}\n\n`;
    md += `---\n\n`;
  }

  return md;
}

export function exportNotesMarkdown(): string {
  const { notes } = getAllData();
  if (!notes || Object.keys(notes).length === 0) return '# 笔记\n\n暂无数据。\n';

  let md = '# 笔记导出\n\n';
  md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  for (const note of Object.values(notes)) {
    md += `## ${note.title}\n\n`;
    if (note.summary) md += `> ${note.summary}\n\n`;
    if (note.content) md += `${note.content}\n\n`;
    if (note.tags?.length) md += `- **标签**: ${note.tags.join(', ')}\n`;
    md += `- **创建时间**: ${new Date(note.createdAt).toLocaleString('zh-CN')}\n\n`;
    md += `---\n\n`;
  }

  return md;
}

export function exportPapersMarkdown(): string {
  const { papers } = getAllData();
  if (!papers || Object.keys(papers).length === 0) return '# 论文\n\n暂无数据。\n';

  let md = '# 论文导出\n\n';
  md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  for (const paper of Object.values(papers)) {
    md += `## ${paper.title}\n\n`;
    if (paper.authors?.length) md += `- **作者**: ${paper.authors.join(', ')}\n`;
    if (paper.year) md += `- **年份**: ${paper.year}\n`;
    if (paper.venue) md += `- **发表处**: ${paper.venue}\n`;
    if (paper.url) md += `- **链接**: ${paper.url}\n`;
    if (paper.tags?.length) md += `- **标签**: ${paper.tags.join(', ')}\n`;

    if (paper.abstract) md += `\n### 摘要\n\n${paper.abstract}\n`;
    md += `\n---\n\n`;
  }

  return md;
}

export function exportInsightsMarkdown(): string {
  const insights = getAllInsights();
  if (insights.length === 0) return '# 灵感速记\n\n暂无数据。\n';

  let md = '# 灵感速记导出\n\n';
  md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  for (const insight of insights) {
    md += `## ${new Date(insight.createdAt).toLocaleString('zh-CN')}\n\n`;
    if (insight.mood) md += `> 心情: ${insight.mood}\n\n`;
    md += `${insight.content}\n\n`;
    if (insight.tags?.length) md += `- **标签**: ${insight.tags.join(', ')}\n`;
    md += `---\n\n`;
  }

  return md;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    unread: '未读',
    reading: '阅读中',
    completed: '已完成',
    important: '重要',
  };
  return labels[status] || status;
}

export function downloadFile(content: string, filename: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
