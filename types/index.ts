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