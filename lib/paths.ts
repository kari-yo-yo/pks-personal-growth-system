import { LearningPath, PathNode, PathNodeStatus } from '@/types';

const STORAGE_KEY = 'pks_learning_paths';
const listeners = new Set<() => void>();

export function subscribePaths(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

function loadFromStorage(): LearningPath[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(paths: LearningPath[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch {
    console.warn('paths: localStorage write failed');
  }
}

// ─── 预设学习路径 ───

const PRESET_PATHS: LearningPath[] = [
  {
    id: 'path_attention',
    title: '注意力机制入门到精通',
    description: '从 Self-Attention 基础概念到 Transformer 架构的完整学习路线',
    category: '深度学习',
    color: '#6366f1',
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    nodes: [
      { nodeId: '', title: '注意力直觉理解', description: '为什么需要注意力？人类视觉注意力的生物学启发', status: 'completed', order: 0 },
      { nodeId: '', title: 'Scaled Dot-Product Attention', description: 'Q/K/V 矩阵运算、缩放因子、注意力权重分布', status: 'completed', order: 1 },
      { nodeId: '', title: 'Multi-Head Attention', description: '多头注意力的并行计算、子空间表示', status: 'in_progress', order: 2 },
      { nodeId: '', title: 'Positional Encoding', description: '正弦/余弦位置编码、相对位置编码', status: 'available', order: 3 },
      { nodeId: '', title: 'Self-Attention 完整实现', description: '从零实现 Self-Attention，理解每一行代码', status: 'locked', order: 4 },
      { nodeId: '', title: 'Transformer Encoder', description: '编码器架构：Feed-Forward、LayerNorm、残差连接', status: 'locked', order: 5 },
      { nodeId: '', title: 'Transformer Decoder', description: '解码器架构：掩码注意力、交叉注意力', status: 'locked', order: 6 },
      { nodeId: '', title: '经典论文精读', description: 'Attention Is All You Need 逐段解读', status: 'locked', order: 7 },
    ],
  },
  {
    id: 'path_channel',
    title: '通道增强机制',
    description: '探索 SENet、CBAM、ECA 等通道注意力变体的演进路线',
    category: '深度学习',
    color: '#8b5cf6',
    archived: false,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
    nodes: [
      { nodeId: '', title: '通道注意力动机', description: '为什么关注通道？特征图的通道维度含义', status: 'completed', order: 0 },
      { nodeId: '', title: 'SENet: Squeeze-and-Excitation', description: '全局池化 + FC 层建模通道依赖', status: 'in_progress', order: 1 },
      { nodeId: '', title: 'CBAM: 卷积块注意力', description: '通道注意力 + 空间注意力的串联融合', status: 'available', order: 2 },
      { nodeId: '', title: 'ECA: 高效通道注意力', description: '1D 卷积替代 FC，自适应核大小', status: 'locked', order: 3 },
      { nodeId: '', title: '对比实验与选型', description: '不同通道注意力在分类/检测任务上的表现对比', status: 'locked', order: 4 },
    ],
  },
  {
    id: 'path_ml_foundations',
    title: '机器学习数学基础',
    description: '线性代数、概率论、优化理论的核心概念梳理',
    category: '数学基础',
    color: '#06b6d4',
    archived: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    nodes: [
      { nodeId: '', title: '向量空间与线性变换', description: '向量空间、基变换、特征值分解', status: 'completed', order: 0 },
      { nodeId: '', title: '概率分布与贝叶斯', description: '条件概率、贝叶斯定理、先验与后验', status: 'completed', order: 1 },
      { nodeId: '', title: '梯度下降与凸优化', description: 'SGD、Adam、学习率调度、收敛性分析', status: 'in_progress', order: 2 },
      { nodeId: '', title: '信息论基础', description: '熵、交叉熵、KL 散度在 ML 中的应用', status: 'available', order: 3 },
      { nodeId: '', title: '正则化与泛化', description: 'L1/L2 正则、Dropout、BatchNorm 的统一视角', status: 'locked', order: 4 },
      { nodeId: '', title: '矩阵微积分', description: '矩阵求导法则、链式法则的矩阵形式', status: 'locked', order: 5 },
    ],
  },
];

// ─── CRUD ───

export function getAllPaths(): LearningPath[] {
  const stored = loadFromStorage();
  if (stored !== null && stored.length > 0) {
    return stored
      .filter((p) => !p.archived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  return PRESET_PATHS;
}

export function getPathById(id: string): LearningPath | undefined {
  return getAllPaths().find((p) => p.id === id);
}

export function addPath(path: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): LearningPath {
  const all = loadFromStorage() || PRESET_PATHS;
  const id = `path_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const newPath: LearningPath = {
    ...path,
    id,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };
  all.push(newPath);
  persist(all);
  notify();
  return newPath;
}

export function updatePath(
  id: string,
  updates: Partial<Omit<LearningPath, 'id' | 'createdAt'>>
): LearningPath | undefined {
  const all = loadFromStorage() || PRESET_PATHS;
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  persist(all);
  notify();
  return all[idx];
}

export function deletePath(id: string): boolean {
  const all = loadFromStorage() || PRESET_PATHS;
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  persist(all);
  notify();
  return true;
}

// ─── 路径节点操作 ───

export function updatePathNodeStatus(
  pathId: string,
  nodeOrder: number,
  status: PathNodeStatus
): LearningPath | undefined {
  const path = getPathById(pathId);
  if (!path) return undefined;

  const nodes = [...path.nodes];
  const nodeIdx = nodes.findIndex((n) => n.order === nodeOrder);
  if (nodeIdx === -1) return undefined;

  nodes[nodeIdx].status = status;

  // 自动解锁下一个节点
  if (status === 'completed') {
    const next = nodes.find((n) => n.order === nodeOrder + 1);
    if (next && next.status === 'locked') {
      next.status = 'available';
    }
  }

  return updatePath(pathId, { nodes });
}

export function addPathNode(
  pathId: string,
  node: Omit<PathNode, 'order'>
): LearningPath | undefined {
  const path = getPathById(pathId);
  if (!path) return undefined;
  const nodes = [...path.nodes];
  const maxOrder = nodes.reduce((max, n) => Math.max(max, n.order), -1);
  nodes.push({ ...node, order: maxOrder + 1 });
  return updatePath(pathId, { nodes });
}

export function getPathProgress(path: LearningPath): number {
  if (path.nodes.length === 0) return 0;
  const completed = path.nodes.filter((n) => n.status === 'completed').length;
  return Math.round((completed / path.nodes.length) * 100);
}

export function getPathStats(paths: LearningPath[]) {
  const totalNodes = paths.reduce((sum, p) => sum + p.nodes.length, 0);
  const completedNodes = paths.reduce(
    (sum, p) => sum + p.nodes.filter((n) => n.status === 'completed').length,
    0
  );
  return { totalPaths: paths.length, totalNodes, completedNodes };
}

export const PATH_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#f43f5e'];
