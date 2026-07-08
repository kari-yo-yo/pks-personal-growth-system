import { DataCollections, ValidationResult, KnowledgeNode, Note, Paper, Relation } from '@/types';

/**
 * 验证数据完整性
 * 检查孤立节点、孤立笔记、关联关系等问题
 */
export function validateDataIntegrity(data: Partial<DataCollections>): ValidationResult {
  const issues: string[] = [];

  const nodes = data.nodes || {};
  const notes = data.notes || {};
  const papers = data.papers || {};
  const paperProgress = data.paper_progress || {};
  const relations = data.relations || {};

  const nodeIds = new Set(Object.keys(nodes));
  const noteIds = new Set(Object.keys(notes));
  const paperIds = new Set(Object.keys(papers));

  // 1. 检查孤立节点（parentId 不存在）
  for (const [id, node] of Object.entries(nodes)) {
    const n = node as KnowledgeNode;
    if (n.parentId && !nodeIds.has(n.parentId)) {
      issues.push(`孤立节点: "${n.title}" (${id}) 的父节点 ${n.parentId} 不存在`);
    }
    // 检查循环引用
    if (n.parentId === id) {
      issues.push(`循环引用: 节点 "${n.title}" (${id}) 的父节点是自己`);
    }
  }

  // 2. 检查孤立笔记（nodeId 不存在）
  for (const [id, note] of Object.entries(notes)) {
    const nt = note as Note;
    if (nt.nodeId && !nodeIds.has(nt.nodeId)) {
      issues.push(`孤立笔记: "${nt.title}" (${id}) 关联的节点 ${nt.nodeId} 不存在`);
    }
  }

  // 3. 检查孤立论文进度（paperId 不存在）
  for (const [id, progress] of Object.entries(paperProgress)) {
    const pp = progress as { paperId?: string };
    if (pp.paperId && !paperIds.has(pp.paperId)) {
      issues.push(`孤立进度: 进度记录 (${id}) 关联的论文 ${pp.paperId} 不存在`);
    }
  }

  // 4. 检查关系完整性
  for (const [id, relation] of Object.entries(relations)) {
    const r = relation as Relation;
    if (!nodeIds.has(r.sourceId) && !noteIds.has(r.sourceId) && !paperIds.has(r.sourceId)) {
      issues.push(`孤立关系: 关系 (${id}) 的源对象 ${r.sourceId} 不存在`);
    }
    if (!nodeIds.has(r.targetId) && !noteIds.has(r.targetId) && !paperIds.has(r.targetId)) {
      issues.push(`孤立关系: 关系 (${id}) 的目标对象 ${r.targetId} 不存在`);
    }
    if (r.sourceId === r.targetId) {
      issues.push(`自引用关系: 关系 (${id}) 源和目标相同`);
    }
  }

  // 5. 检查重复标题（节点）
  const nodeTitles = new Map<string, string[]>();
  for (const [id, node] of Object.entries(nodes)) {
    const title = (node as KnowledgeNode).title;
    if (title) {
      if (!nodeTitles.has(title)) {
        nodeTitles.set(title, []);
      }
      const ids = nodeTitles.get(title);
      if (ids) ids.push(id);
    }
  }
  for (const [title, ids] of Array.from(nodeTitles.entries())) {
    if (ids.length > 1) {
      issues.push(`重复节点标题: "${title}" 出现在 ${ids.length} 个节点中 (${ids.join(', ')})`);
    }
  }

  // 6. 检查空的标题/名称
  for (const [id, node] of Object.entries(nodes)) {
    if (!(node as KnowledgeNode).title?.trim()) {
      issues.push(`空标题节点: ID ${id} 没有标题`);
    }
  }
  for (const [id, note] of Object.entries(notes)) {
    if (!(note as Note).title?.trim()) {
      issues.push(`空标题笔记: ID ${id} 没有标题`);
    }
  }
  for (const [id, paper] of Object.entries(papers)) {
    if (!(paper as Paper).title?.trim()) {
      issues.push(`空标题论文: ID ${id} 没有标题`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    nodeCount: Object.keys(nodes).length,
    noteCount: Object.keys(notes).length,
    paperCount: Object.keys(papers).length,
    paperProgressCount: Object.keys(paperProgress).length,
    relationCount: Object.keys(relations).length,
  };
}

/**
 * 修复常见的数据问题
 */
export function autoFixData(data: Partial<DataCollections>): {
  fixed: Partial<DataCollections>;
  fixes: string[];
} {
  const fixes: string[] = [];
  const fixed: Partial<DataCollections> = {
    nodes: { ...data.nodes },
    notes: { ...data.notes },
    papers: { ...data.papers },
    paper_progress: { ...data.paper_progress },
    paper_notes: { ...data.paper_notes },
    summaries: { ...data.summaries },
    attachments: { ...data.attachments },
    relations: { ...data.relations },
    knowledge_paper: { ...data.knowledge_paper },
    paper_knowledge: { ...data.paper_knowledge },
  };

  const nodeIds = new Set(Object.keys(fixed.nodes || {}));

  // 修复孤立节点的 parentId
  if (fixed.nodes) {
    for (const [id, node] of Object.entries(fixed.nodes)) {
      const n = node as KnowledgeNode;
      if (n.parentId && !nodeIds.has(n.parentId)) {
        fixes.push(`将节点 "${n.title}" 的父节点 ${n.parentId} 设为 null（原父节点不存在）`);
        fixed.nodes[id] = { ...n, parentId: null };
      }
      if (n.parentId === id) {
        fixes.push(`将节点 "${n.title}" 的父节点设为自己，已修复为 null`);
        fixed.nodes[id] = { ...n, parentId: null };
      }
    }
  }

  // 修复孤立笔记的 nodeId
  if (fixed.notes) {
    for (const [id, note] of Object.entries(fixed.notes)) {
      const nt = note as Note;
      if (nt.nodeId && !nodeIds.has(nt.nodeId)) {
        fixes.push(`将笔记 "${nt.title}" 的节点关联 ${nt.nodeId} 移除（原节点不存在）`);
        fixed.notes[id] = { ...nt, nodeId: undefined };
      }
    }
  }

  return { fixed, fixes };
}