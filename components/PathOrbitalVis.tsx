'use client';

import { useEffect, useRef } from 'react';
import { LearningPath } from '@/types';

/**
 * Orbital Path Visualization
 * ───────────────────────────
 * Algorithmic art: learning path nodes as orbital stations,
 * connected by curved trajectory lines with flowing energy particles.
 * Inspired by orbital mechanics — each node is a celestial body
 * on a learning orbit, particles traverse the path carrying knowledge energy.
 *
 * Crafted with sinusoidal path curves, bezier-interpolated connections,
 * pulsing node halos that reflect completion status, and traveling
 * luminous particles that accelerate through completed segments.
 */

interface PathPoint {
  x: number;
  y: number;
  nodeIndex: number;
  status: string;
}

interface EnergyParticle {
  segmentFrom: number;
  t: number;
  speed: number;
  alpha: number;
  size: number;
}

export default function PathOrbitalVis({
  path,
  activeNodeIndex,
  onNodeClick,
}: {
  path: LearningPath;
  activeNodeIndex?: number;
  onNodeClick?: (nodeOrder: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  const pointsRef = useRef<PathPoint[]>([]);
  const particlesRef = useRef<EnergyParticle[]>([]);
  const hoverRef = useRef<number>(-1);
  const clickHandlerRef = useRef<((idx: number) => void) | undefined>(undefined);

  clickHandlerRef.current = onNodeClick;

  useEffect(() => {
    const _canvas = canvasRef.current;
    const _container = containerRef.current;
    if (!_canvas || !_container) return;

    const canvas = _canvas;
    const container = _container;
    const ctx = canvas.getContext('2d')!;

    let w = container.clientWidth;
    let h = container.clientHeight;
    canvas.width = w;
    canvas.height = h;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const nodes = path.nodes;
    if (nodes.length === 0) return;

    // ─── 计算节点位置 — 正弦曲线路径 ───
    const nodeCount = nodes.length;
    const marginX = 60;
    const marginY = 40;
    const usableW = w - marginX * 2;
    const usableH = h - marginY * 2;
    const points: PathPoint[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const t = nodeCount === 1 ? 0.5 : i / (nodeCount - 1);
      const x = marginX + t * usableW;
      // 正弦波偏移 — 中心路径上下波动
      const waveOffset = Math.sin(t * Math.PI * 2 + Math.PI / 4) * (usableH * 0.2);
      const y = marginY + usableH / 2 + waveOffset;
      points.push({ x, y, nodeIndex: i, status: nodes[i].status });
    }
    pointsRef.current = points;

    // ─── 能量粒子 ───
    const particles: EnergyParticle[] = [];
    const PARTICLE_COUNT = Math.min(nodeCount * 2, 12);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seg = i % Math.max(nodeCount - 1, 1);
      particles.push({
        segmentFrom: seg,
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        alpha: 0.5 + Math.random() * 0.5,
        size: 1.5 + Math.random() * 1.5,
      });
    }
    particlesRef.current = particles;

    // ─── 主色 ───
    const color = path.color || '#6366f1';
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // ─── 动画 ───
    function animate() {
      if (!ctx) return;
      frameRef.current++;
      ctx.clearRect(0, 0, w, h);

      const time = frameRef.current * 0.02;

      // ─── 绘制路径曲线 ───
      for (let i = 0; i < points.length - 1; i++) {
        const from = points[i];
        const to = points[i + 1];

        // 贝塞尔控制点
        const cpx1 = from.x + (to.x - from.x) * 0.33;
        const cpy1 = from.y;
        const cpx2 = from.x + (to.x - from.x) * 0.66;
        const cpy2 = to.y;

        const isCompleted = from.status === 'completed' && to.status === 'completed';
        const isActive = from.status === 'in_progress' || to.status === 'in_progress' || to.status === 'available';

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, to.x, to.y);
        ctx.strokeStyle = isCompleted
          ? `rgba(${r}, ${g}, ${b}, 0.5)`
          : isActive
            ? `rgba(${r}, ${g}, ${b}, 0.25)`
            : `rgba(${r}, ${g}, ${b}, 0.1)`;
        ctx.lineWidth = isCompleted ? 2.5 : 1.5;
        ctx.stroke();

        // 完成段发光
        if (isCompleted) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, to.x, to.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
          ctx.lineWidth = 8;
          ctx.stroke();
        }
      }

      // ─── 粒子沿路径流动 ───
      for (const p of particles) {
        p.t += p.speed;
        if (p.t > 1) {
          p.t -= 1;
          p.segmentFrom = (p.segmentFrom + 1) % Math.max(points.length - 1, 1);
        }

        const segIdx = p.segmentFrom;
        if (segIdx >= points.length - 1) continue;

        const from = points[segIdx];
        const to = points[segIdx + 1];

        // 贝塞尔插值
        const t = p.t;
        const mt = 1 - t;
        const px = mt * mt * mt * from.x + 3 * mt * mt * t * (from.x + (to.x - from.x) * 0.33) + 3 * mt * t * t * (from.x + (to.x - from.x) * 0.66) + t * t * t * to.x;
        const py = mt * mt * mt * from.y + 3 * mt * mt * t * from.y + 3 * mt * t * t * to.y + t * t * t * to.y;

        // 仅在已完成或进行中段绘制
        const segActive = from.status === 'completed' || to.status === 'completed' || to.status === 'in_progress';
        if (!segActive) continue;

        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.8})`);
        glow.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.3})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // 亮核
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 220, 255, ${p.alpha * 0.9})`;
        ctx.fill();
      }

      // ─── 绘制节点 ───
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const node = nodes[i];
        const pulse = 0.7 + 0.3 * Math.sin(time + i * 0.8);
        const isActive = i === activeNodeIndex;
        const isHovered = i === hoverRef.current;

        let baseRadius = 6;
        let nodeAlpha = 0.4;
        let glowAlpha = 0.06;

        if (node.status === 'completed') {
          baseRadius = 7;
          nodeAlpha = 0.9;
          glowAlpha = 0.15;
        } else if (node.status === 'in_progress') {
          baseRadius = 8;
          nodeAlpha = 0.7;
          glowAlpha = 0.12 * pulse;
        } else if (node.status === 'available') {
          baseRadius = 6;
          nodeAlpha = 0.5;
          glowAlpha = 0.08;
        } else {
          // locked
          baseRadius = 5;
          nodeAlpha = 0.2;
          glowAlpha = 0.03;
        }

        const radius = (isActive || isHovered) ? baseRadius * 1.4 : baseRadius;

        // 外发光
        const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius * 5);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowAlpha * pulse})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // 节点体
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${nodeAlpha * pulse})`;
        ctx.fill();

        // 中心亮点
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 230, 255, ${nodeAlpha * 0.8})`;
        ctx.fill();

        // 完成标记 — 外环
        if (node.status === 'completed') {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 序号
        ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.9})`;
        ctx.font = `${radius * 0.9}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), pt.x, pt.y);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    // ─── 鼠标交互 ───
    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found = -1;
      for (let i = 0; i < points.length; i++) {
        const dx = mx - points[i].x;
        const dy = my - points[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          found = i;
          break;
        }
      }
      hoverRef.current = found;
      canvas.style.cursor = found >= 0 ? 'pointer' : 'default';
    }

    function onClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (let i = 0; i < points.length; i++) {
        const dx = mx - points[i].x;
        const dy = my - points[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          clickHandlerRef.current?.(i);
          break;
        }
      }
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    function onResize() {
      if (!container || !canvas) return;
      w = container.clientWidth;
      h = container.clientHeight;
      const d = window.devicePixelRatio || 1;
      canvas.width = w * d;
      canvas.height = h * d;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(d, d);

      // 重新计算节点位置
      const usableW = w - marginX * 2;
      const usableH = h - marginY * 2;
      for (let i = 0; i < points.length; i++) {
        const t = nodeCount === 1 ? 0.5 : i / (nodeCount - 1);
        points[i].x = marginX + t * usableW;
        const waveOffset = Math.sin(t * Math.PI * 2 + Math.PI / 4) * (usableH * 0.2);
        points[i].y = marginY + usableH / 2 + waveOffset;
      }
    }

    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [path, activeNodeIndex]);

  return (
    <div ref={containerRef} className="w-full cursor-pointer" style={{ height: Math.max(220, path.nodes.length * 30) }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
