import { KnowledgeNode, Relation } from '@/types';

export interface TopoNode {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  level: number;
  noteCount: number;
  mass: number;
}

export interface TopoEdge {
  source: string;
  target: string;
  type: Relation['type'];
  strength: number;
  particles: EdgeParticle[];
}

export interface EdgeParticle {
  t: number; // 0 ~ 1 interpolation
  speed: number;
  size: number;
}

export interface TopologyGraph {
  nodes: TopoNode[];
  edges: TopoEdge[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

const LEVEL_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
];

const TYPE_STRENGTH: Record<Relation['type'], number> = {
  parent: 0.8,
  reference: 0.5,
  related: 0.4,
  prerequisite: 0.6,
  next: 0.7,
};

export function buildTopology(
  nodes: KnowledgeNode[],
  relations: Relation[],
  notesPerNode: Record<string, number>
): TopologyGraph {
  const width = 1200;
  const height = 800;

  // 创建拓扑节点
  const topoNodes: TopoNode[] = nodes.map((n, i) => {
    const noteCount = notesPerNode[n.id] || 0;
    const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
    const radius = 150 + Math.random() * 100;
    return {
      id: n.id,
      title: n.title,
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      radius: 6 + Math.min(noteCount * 1.5, 12),
      color: n.color || LEVEL_COLORS[Math.min(n.level, LEVEL_COLORS.length - 1)],
      level: n.level,
      noteCount,
      mass: 1 + noteCount * 0.2,
    };
  });

  const nodeMap = new Map(topoNodes.map((n) => [n.id, n]));

  // 创建拓扑边
  const topoEdges: TopoEdge[] = relations
    .filter((r) => nodeMap.has(r.sourceId) && nodeMap.has(r.targetId))
    .map((r) => ({
      source: r.sourceId,
      target: r.targetId,
      type: r.type,
      strength: TYPE_STRENGTH[r.type] || 0.3,
      particles: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        size: 1 + Math.random() * 1.5,
      })),
    }));

  // 运行若干步力导向模拟以稳定布局
  const iterations = 120;
  for (let i = 0; i < iterations; i++) {
    simulateStep(topoNodes, topoEdges, width, height, i < iterations - 1);
  }

  // 计算边界
  const xs = topoNodes.map((n) => n.x);
  const ys = topoNodes.map((n) => n.y);
  const bounds = {
    minX: Math.min(...xs) - 50,
    minY: Math.min(...ys) - 50,
    maxX: Math.max(...xs) + 50,
    maxY: Math.max(...ys) + 50,
  };

  return { nodes: topoNodes, edges: topoEdges, bounds };
}

function simulateStep(
  nodes: TopoNode[],
  edges: TopoEdge[],
  width: number,
  height: number,
  applyTemp: boolean
) {
  const repulsion = 8000;
  const springLength = 120;
  const centerGravity = 0.03;
  const damping = 0.85;
  const temperature = applyTemp ? 0.5 : 0.05;

  // 斥力
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = repulsion / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx -= fx / a.mass;
      a.vy -= fy / a.mass;
      b.vx += fx / b.mass;
      b.vy += fy / b.mass;
    }
  }

  // 边引力
  for (const edge of edges) {
    const a = nodes.find((n) => n.id === edge.source);
    const b = nodes.find((n) => n.id === edge.target);
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = (dist - springLength) * edge.strength * 0.02;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    a.vx += fx / a.mass;
    a.vy += fy / a.mass;
    b.vx -= fx / b.mass;
    b.vy -= fy / b.mass;
  }

  // 中心引力
  const cx = width / 2;
  const cy = height / 2;
  for (const node of nodes) {
    node.vx += (cx - node.x) * centerGravity * 0.01;
    node.vy += (cy - node.y) * centerGravity * 0.01;
  }

  // 更新位置
  for (const node of nodes) {
    node.vx *= damping;
    node.vy *= damping;
    node.x += node.vx * temperature;
    node.y += node.vy * temperature;
  }
}

export function stepSimulation(
  nodes: TopoNode[],
  edges: TopoEdge[],
  width: number,
  height: number
) {
  simulateStep(nodes, edges, width, height, false);
}
