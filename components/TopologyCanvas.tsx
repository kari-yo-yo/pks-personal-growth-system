'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { TopologyGraph, TopoNode, TopoEdge, stepSimulation } from '@/lib/topology';

interface Props {
  graph: TopologyGraph;
  onNodeSelect?: (node: TopoNode | null) => void;
  selectedNodeId?: string | null;
}

export default function TopologyCanvas({ graph, onNodeSelect, selectedNodeId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<TopoNode[]>(graph.nodes.map((n) => ({ ...n })));
  const edgesRef = useRef<TopoEdge[]>(graph.edges.map((e) => ({
    ...e,
    particles: e.particles.map((p) => ({ ...p })),
  })));
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1, targetZoom: 1 });
  const dragRef = useRef<{ nodeId: string | null; lastX: number; lastY: number; panning: boolean }>({
    nodeId: null,
    lastX: 0,
    lastY: 0,
    panning: false,
  });
  const animRef = useRef<number>(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const dimsRef = useRef({ width: 0, height: 0 });

  // Initialize camera to center the graph
  useEffect(() => {
    const bounds = graph.bounds;
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    cameraRef.current.x = cx;
    cameraRef.current.y = cy;
  }, [graph]);

  const worldToScreen = useCallback((wx: number, wy: number, cam: { x: number; y: number; zoom: number }, w: number, h: number) => {
    return {
      x: (wx - cam.x) * cam.zoom + w / 2,
      y: (wy - cam.y) * cam.zoom + h / 2,
    };
  }, []);

  const screenToWorld = useCallback((sx: number, sy: number, cam: { x: number; y: number; zoom: number }, w: number, h: number) => {
    return {
      x: (sx - w / 2) / cam.zoom + cam.x,
      y: (sy - h / 2) / cam.zoom + cam.y,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    dimsRef.current = { width, height };

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const cam = cameraRef.current;
    cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const gridSize = 50 * cam.zoom;
    const offsetX = ((width / 2 - cam.x * cam.zoom) % gridSize + gridSize) % gridSize;
    const offsetY = ((height / 2 - cam.y * cam.zoom) % gridSize + gridSize) % gridSize;
    for (let x = offsetX - gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = offsetY - gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    // Draw edges
    for (const edge of edges) {
      const a = nodes.find((n) => n.id === edge.source);
      const b = nodes.find((n) => n.id === edge.target);
      if (!a || !b) continue;
      const pa = worldToScreen(a.x, a.y, cam, width, height);
      const pb = worldToScreen(b.x, b.y, cam, width, height);

      const isSelected = selectedNodeId && (a.id === selectedNodeId || b.id === selectedNodeId);
      const isHovered = hoveredNodeId && (a.id === hoveredNodeId || b.id === hoveredNodeId);
      const alpha = isSelected ? 0.6 : isHovered ? 0.4 : 0.15;

      ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();

      // Flow particles on edge
      for (const p of edge.particles) {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        const px = pa.x + (pb.x - pa.x) * p.t;
        const py = pa.y + (pb.y - pa.y) * p.t;
        const glow = isSelected ? 0.9 : 0.5;
        ctx.fillStyle = `rgba(165, 180, 252, ${glow * (1 - Math.abs(p.t - 0.5) * 2)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * cam.zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const p = worldToScreen(node.x, node.y, cam, width, height);
      const r = node.radius * cam.zoom;
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeId;

      // Pulse halo for selected/hovered
      if (isSelected || isHovered) {
        const pulse = (Date.now() % 2000) / 2000;
        const haloR = r + 8 + pulse * 12;
        const gradient = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, haloR);
        gradient.addColorStop(0, `${node.color}40`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node glow
      const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2);
      glowGradient.addColorStop(0, `${node.color}30`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 2, 0, Math.PI * 2);
      ctx.fill();

      // Node body
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Border
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      if (cam.zoom > 0.6 || isSelected || isHovered) {
        ctx.fillStyle = isSelected || isHovered ? '#e2e8f0' : '#94a3b8';
        ctx.font = `${isSelected ? '600' : '400'} ${11 + (isSelected ? 1 : 0)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.title, p.x, p.y + r + 6);
      }
    }

    // Draw connection count badge for selected node
    if (selectedNodeId) {
      const sel = nodes.find((n) => n.id === selectedNodeId);
      if (sel) {
        const sp = worldToScreen(sel.x, sel.y, cam, width, height);
        const connCount = edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId).length;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.lineWidth = 1;
        const badgeW = 60;
        const badgeH = 20;
        const badgeX = sp.x - badgeW / 2;
        const badgeY = sp.y - sel.radius * cam.zoom - 28;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#a5b4fc';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${connCount} 连接`, sp.x, badgeY + badgeH / 2);
      }
    }
  }, [graph, worldToScreen, selectedNodeId, hoveredNodeId]);

  // Animation loop
  useEffect(() => {
    let lastTime = 0;
    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      // Run physics simulation
      const { width, height } = dimsRef.current;
      if (width > 0 && height > 0) {
        stepSimulation(nodesRef.current, edgesRef.current, width, height);
      }

      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Mouse handlers
  const getNodeAt = useCallback((sx: number, sy: number) => {
    const cam = cameraRef.current;
    const { width, height } = dimsRef.current;
    const w = screenToWorld(sx, sy, cam, width, height);
    for (const node of nodesRef.current) {
      const dx = w.x - node.x;
      const dy = w.y - node.y;
      if (dx * dx + dy * dy < (node.radius + 4) * (node.radius + 4)) {
        return node;
      }
    }
    return null;
  }, [screenToWorld]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAt(x, y);
    if (node) {
      dragRef.current = { nodeId: node.id, lastX: x, lastY: y, panning: false };
      onNodeSelect?.(node);
    } else {
      dragRef.current = { nodeId: null, lastX: x, lastY: y, panning: true };
    }
  }, [getNodeAt, onNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const drag = dragRef.current;

    if (drag.nodeId) {
      const cam = cameraRef.current;
      const { width, height } = dimsRef.current;
      const dx = (x - drag.lastX) / cam.zoom;
      const dy = (y - drag.lastY) / cam.zoom;
      const node = nodesRef.current.find((n) => n.id === drag.nodeId);
      if (node) {
        node.x += dx;
        node.y += dy;
        node.vx = 0;
        node.vy = 0;
      }
      drag.lastX = x;
      drag.lastY = y;
    } else if (drag.panning) {
      const cam = cameraRef.current;
      const dx = (x - drag.lastX) / cam.zoom;
      const dy = (y - drag.lastY) / cam.zoom;
      cam.x -= dx;
      cam.y -= dy;
      drag.lastX = x;
      drag.lastY = y;
    } else {
      const node = getNodeAt(x, y);
      setHoveredNodeId(node?.id || null);
    }
  }, [getNodeAt]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { nodeId: null, lastX: 0, lastY: 0, panning: false };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    cam.targetZoom = Math.max(0.3, Math.min(3, cam.targetZoom * delta));
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAt(x, y);
    if (!node) {
      onNodeSelect?.(null);
    }
  }, [getNodeAt, onNodeSelect]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />
    </div>
  );
}
