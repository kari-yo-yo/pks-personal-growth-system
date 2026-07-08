export interface KnowledgeNode {
  id: string;
  title: string;
  description?: string;
  parentId?: string | null;
  level: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  color?: string;
  icon?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  nodeId?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: string[];
  summary?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  url?: string;
  pdfUrl?: string;
  venue?: string;
  year?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  doi?: string;
  bibtex?: string;
}

export interface PaperProgress {
  paperId: string;
  status: 'unread' | 'reading' | 'completed' | 'reviewed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface PaperNote {
  id: string;
  paperId: string;
  content: string;
  section?: string;
  page?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Summary {
  id: string;
  date: string;
  content: string;
  achievements?: string[];
  reflections?: string[];
  plans?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  noteId?: string;
  createdAt: string;
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'parent' | 'reference' | 'related' | 'prerequisite' | 'next';
  description?: string;
  createdAt: string;
}

export interface KnowledgePaper {
  nodeId: string;
  paperId: string;
  relevance: number;
  notes?: string;
  createdAt: string;
}

export interface PaperKnowledge {
  paperId: string;
  nodeId: string;
  relevance: number;
  notes?: string;
  createdAt: string;
}

export interface DataCollections {
  nodes: Record<string, KnowledgeNode>;
  notes: Record<string, Note>;
  papers: Record<string, Paper>;
  paper_progress: Record<string, PaperProgress>;
  paper_notes: Record<string, PaperNote>;
  summaries: Record<string, Summary>;
  attachments: Record<string, Attachment>;
  relations: Record<string, Relation>;
  knowledge_paper: Record<string, KnowledgePaper>;
  paper_knowledge: Record<string, PaperKnowledge>;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  nodeCount: number;
  noteCount: number;
  paperCount: number;
  paperProgressCount: number;
  relationCount: number;
}

export type CollectionName = keyof DataCollections;

// ==================== 灵感速记 ====================

export type InsightMood = '💡 灵感' | '🔥 突破' | '🤔 思考' | '📖 收获' | '⚠️ 疑问' | '🎯 计划';

export type InsightColor = 'indigo' | 'amber' | 'emerald' | 'rose' | 'cyan' | 'violet';

export interface Insight {
  id: string;
  content: string;
  mood: InsightMood;
  color: InsightColor;
  tags: string[];
  createdAt: string;
  pinned: boolean;
}

// ==================== 学习路径 ====================

export type PathNodeStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface PathNode {
  nodeId: string;       // 关联 knowledge node id，可选
  title: string;
  description?: string;
  status: PathNodeStatus;
  order: number;
  resources?: string[]; // 论文/笔记引用 id
}

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  category: string;
  nodes: PathNode[];
  createdAt: string;
  updatedAt: string;
  color?: string;
  archived: boolean;
}

// Theme system removed - ready for rebuild