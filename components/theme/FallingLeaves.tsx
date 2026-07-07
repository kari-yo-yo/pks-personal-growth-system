'use client';

import { useEffect, useRef } from 'react';

interface Leaf {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  swayPhase: number;
}

const LEAF_COLORS = ['#4ade80', '#22c55e', '#86efac', '#facc15', '#a3e635', '#bef264'];

export default function FallingLeaves({ count = 18 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const c = canvas;
    const context = ctx;
    let animationId: number;
    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w;
      c.height = h;
    }

    const leaves: Leaf[] = [];
    for (let i = 0; i < count; i++) {
      leaves.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 8 + 4,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        swayPhase: Math.random() * Math.PI * 2,
      });
    }

    function drawLeaf(x: number, y: number, size: number, rotation: number, color: string) {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.globalAlpha = 0.5;
      context.fillStyle = color;
      context.beginPath();
      context.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function draw() {
      context.clearRect(0, 0, w, h);

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];
        leaf.y += leaf.speedY;
        leaf.x += leaf.speedX + Math.sin(leaf.swayPhase) * 0.3;
        leaf.rotation += leaf.rotationSpeed;
        leaf.swayPhase += 0.01;

        if (leaf.y > h + 20) {
          leaf.y = -20;
          leaf.x = Math.random() * w;
        }
        if (leaf.x < -20) leaf.x = w + 20;
        if (leaf.x > w + 20) leaf.x = -20;

        drawLeaf(leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.color);
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
