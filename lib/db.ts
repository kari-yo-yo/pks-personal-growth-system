import {
  KnowledgeNode,
  Note,
  Paper,
  PaperProgress,
  PaperNote,
  Summary,
  Attachment,
  Relation,
  KnowledgePaper,
  PaperKnowledge,
  CollectionName,
  DataCollections,
} from '@/types';
import { loadFromGitHub } from './githubData';
import { syncToGitHub } from './githubSync';

// 内存缓存
interface Cache {
  nodes: Map<string, KnowledgeNode>;
  notes: Map<string, Note>;
  papers: Map<string, Paper>;
  paper_progress: Map<string, PaperProgress>;
  paper_notes: Map<string, PaperNote>;
  summaries: Map<string, Summary>;
  attachments: Map<string, Attachment>;
  relations: Map<string, Relation>;
  knowledge_paper: Map<string, KnowledgePaper>;
  paper_knowledge: Map<string, PaperKnowledge>;
}

const cache: Cache = {
  nodes: new Map(),
  notes: new Map(),
  papers: new Map(),
  paper_progress: new Map(),
  paper_notes: new Map(),
  summaries: new Map(),
  attachments: new Map(),
  relations: new Map(),
  knowledge_paper: new Map(),
  paper_knowledge: new Map(),
};

let loaded = false;
let loadingPromise: Promise<void> | null = null;

// 数据变更监听器
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

// 辅助函数：Map 转 Object
function mapToObject<T>(map: Map<string, T>): Record<string, T> {
  const obj: Record<string, T> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

// 辅助函数：Object 转 Map
function objectToMap<T>(obj: Record<string, T>): Map<string, T> {
  const map = new Map<string, T>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
}

/**
 * 初始化空数据
 */
function initializeEmptyData() {
  console.log('📝 初始化空数据');
  Object.keys(cache).forEach((key) => {
    (cache as any)[key].clear();
  });
}

/**
 * 从缓存获取所有数据
 */
export function getAllData(): Partial<DataCollections> {
  return {
    nodes: mapToObject(cache.nodes),
    notes: mapToObject(cache.notes),
    papers: mapToObject(cache.papers),
    paper_progress: mapToObject(cache.paper_progress),
    paper_notes: mapToObject(cache.paper_notes),
    summaries: mapToObject(cache.summaries),
    attachments: mapToObject(cache.attachments),
    relations: mapToObject(cache.relations),
    knowledge_paper: mapToObject(cache.knowledge_paper),
    paper_knowledge: mapToObject(cache.paper_knowledge),
  };
}

/**
 * 恢复数据到缓存
 */
function restoreToCache(data: Partial<DataCollections>) {
  if (data.nodes) cache.nodes = objectToMap(data.nodes);
  if (data.notes) cache.notes = objectToMap(data.notes);
  if (data.papers) cache.papers = objectToMap(data.papers);
  if (data.paper_progress) cache.paper_progress = objectToMap(data.paper_progress);
  if (data.paper_notes) cache.paper_notes = objectToMap(data.paper_notes);
  if (data.summaries) cache.summaries = objectToMap(data.summaries);
  if (data.attachments) cache.attachments = objectToMap(data.attachments);
  if (data.relations) cache.relations = objectToMap(data.relations);
  if (data.knowledge_paper) cache.knowledge_paper = objectToMap(data.knowledge_paper);
  if (data.paper_knowledge) cache.paper_knowledge = objectToMap(data.paper_knowledge);
}

/**
 * 加载数据：优先从 GitHub → 降级到空数据
 */
export async function load(): Promise<void> {
  if (loaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      // 1. 优先从 GitHub 加载
      console.log('🌐 尝试从 GitHub 加载数据...');
      const githubData = await loadFromGitHub();
      const hasData = Object.values(githubData).some(
        (v) => v && Object.keys(v).length > 0
      );

      if (hasData) {
        restoreToCache(githubData);
        console.log(
          `✅ 从 GitHub 加载: ${cache.nodes.size} 节点, ${cache.notes.size} 笔记, ${cache.papers.size} 论文`
        );
        loaded = true;
        loadingPromise = null;
        notify();
        return;
      }

      // 2. 降级：初始化空数据
      console.log('⚠️ GitHub 无数据，初始化空数据');
      initializeEmptyData();
      loaded = true;
      notify();
    } catch (error) {
      console.error('❌ 加载失败:', error);
      initializeEmptyData();
      loaded = true;
      notify();
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * 重新加载数据（强制刷新）
 */
export async function reload(): Promise<void> {
  loaded = false;
  await load();
}

/**
 * 检查是否已加载
 */
export function isLoaded(): boolean {
  return loaded;
}

/**
 * 保存数据：更新缓存并同步到 GitHub
 */
export async function saveCollection(
  collection: CollectionName
): Promise<boolean> {
  const data = mapToObject((cache as any)[collection]);
  return await syncToGitHub(collection, data);
}

/**
 * 保存所有数据到 GitHub
 */
export async function saveAll(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  for (const collection of Object.keys(cache) as CollectionName[]) {
    results[collection] = await saveCollection(collection);
    await sleep(300);
  }
  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== 节点 CRUD ====================

export function getAllNodes(): KnowledgeNode[] {
  return Array.from(cache.nodes.values()).sort((a, b) => a.order - b.order);
}

export function getNodeById(id: string): KnowledgeNode | undefined {
  return cache.nodes.get(id);
}

export function getChildNodes(parentId: string | null): KnowledgeNode[] {
  return getAllNodes().filter((n) => n.parentId === parentId);
}

export function getNodeTree(): KnowledgeNode[] {
  // 返回根节点（parentId 为 null 或不存在父节点的）
  return getAllNodes().filter(
    (n) => !n.parentId || !cache.nodes.has(n.parentId)
  );
}

export async function addNode(node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeNode> {
  const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const newNode: KnowledgeNode = {
    ...node,
    id,
    createdAt: now,
    updatedAt: now,
  };
  cache.nodes.set(id, newNode);
  await saveCollection('nodes');
  notify();
  return newNode;
}

export async function updateNode(
  id: string,
  updates: Partial<KnowledgeNode>
): Promise<KnowledgeNode | undefined> {
  const node = cache.nodes.get(id);
  if (!node) return undefined;
  const updated = { ...node, ...updates, updatedAt: new Date().toISOString() };
  cache.nodes.set(id, updated);
  await saveCollection('nodes');
  notify();
  return updated;
}

export async function deleteNode(id: string): Promise<boolean> {
  // 递归删除子节点
  const children = getChildNodes(id);
  for (const child of children) {
    await deleteNode(child.id);
  }
  // 删除关联笔记
  Array.from(cache.notes.entries()).forEach(([noteId, note]) => {
    if (note.nodeId === id) {
      cache.notes.delete(noteId);
    }
  });
  cache.nodes.delete(id);
  await saveCollection('nodes');
  await saveCollection('notes');
  notify();
  return true;
}

// ==================== 笔记 CRUD ====================

export function getAllNotes(): Note[] {
  return Array.from(cache.notes.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getNoteById(id: string): Note | undefined {
  return cache.notes.get(id);
}

export function getNotesByNodeId(nodeId: string): Note[] {
  return getAllNotes().filter((n) => n.nodeId === nodeId);
}

export async function addNote(
  note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Note> {
  const id = `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const newNote: Note = { ...note, id, createdAt: now, updatedAt: now };
  cache.notes.set(id, newNote);
  await saveCollection('notes');
  notify();
  return newNote;
}

export async function updateNote(
  id: string,
  updates: Partial<Note>
): Promise<Note | undefined> {
  const note = cache.notes.get(id);
  if (!note) return undefined;
  const updated = { ...note, ...updates, updatedAt: new Date().toISOString() };
  cache.notes.set(id, updated);
  await saveCollection('notes');
  notify();
  return updated;
}

export async function deleteNote(id: string): Promise<boolean> {
  cache.notes.delete(id);
  await saveCollection('notes');
  notify();
  return true;
}

// ==================== 论文 CRUD ====================

export function getAllPapers(): Paper[] {
  return Array.from(cache.papers.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPaperById(id: string): Paper | undefined {
  return cache.papers.get(id);
}

export async function addPaper(
  paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Paper> {
  const id = `paper_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const newPaper: Paper = { ...paper, id, createdAt: now, updatedAt: now };
  cache.papers.set(id, newPaper);
  await saveCollection('papers');
  notify();
  return newPaper;
}

export async function updatePaper(
  id: string,
  updates: Partial<Paper>
): Promise<Paper | undefined> {
  const paper = cache.papers.get(id);
  if (!paper) return undefined;
  const updated = { ...paper, ...updates, updatedAt: new Date().toISOString() };
  cache.papers.set(id, updated);
  await saveCollection('papers');
  notify();
  return updated;
}

export async function deletePaper(id: string): Promise<boolean> {
  cache.papers.delete(id);
  cache.paper_progress.delete(id);
  // 删除关联的 paper_notes
  Array.from(cache.paper_notes.entries()).forEach(([noteId, note]) => {
    if (note.paperId === id) {
      cache.paper_notes.delete(noteId);
    }
  });
  await saveCollection('papers');
  await saveCollection('paper_progress');
  await saveCollection('paper_notes');
  notify();
  return true;
}

// ==================== 论文进度 ====================

export function getPaperProgress(paperId: string): PaperProgress | undefined {
  return cache.paper_progress.get(paperId);
}

export async function updatePaperProgress(
  paperId: string,
  progress: Partial<PaperProgress>
): Promise<PaperProgress> {
  const existing = cache.paper_progress.get(paperId);
  const updated: PaperProgress = {
    paperId,
    status: 'unread',
    progress: 0,
    priority: 'medium',
    ...existing,
    ...progress,
  };
  cache.paper_progress.set(paperId, updated);
  await saveCollection('paper_progress');
  notify();
  return updated;
}

// ==================== 其他 getter ====================

export function getAllSummaries(): Summary[] {
  return Array.from(cache.summaries.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllRelations(): Relation[] {
  return Array.from(cache.relations.values());
}

export function getRelationsBySource(sourceId: string): Relation[] {
  return getAllRelations().filter((r) => r.sourceId === sourceId);
}

export function getRelationsByTarget(targetId: string): Relation[] {
  return getAllRelations().filter((r) => r.targetId === targetId);
}

// ==================== 数据恢复 ====================

/**
 * 从外部数据恢复（如从 GitHub 加载后恢复到缓存）
 */
export async function restoreData(data: Partial<DataCollections>): Promise<void> {
  restoreToCache(data);
  // 同步到 GitHub
  await saveAll();
  notify();
}

/**
 * 获取数据统计
 */
export function getDataStats(): Record<string, number> {
  return {
    nodes: cache.nodes.size,
    notes: cache.notes.size,
    papers: cache.papers.size,
    paper_progress: cache.paper_progress.size,
    paper_notes: cache.paper_notes.size,
    summaries: cache.summaries.size,
    attachments: cache.attachments.size,
    relations: cache.relations.size,
    knowledge_paper: cache.knowledge_paper.size,
    paper_knowledge: cache.paper_knowledge.size,
  };
}