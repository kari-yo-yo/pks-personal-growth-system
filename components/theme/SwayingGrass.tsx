'use client';

import { useEffect, useRef } from 'react';

interface GrassBlade {
  x: number;
  y: number;
  height: number;
  width: number;
  lean: number;
  swaySpeed: number;
  swayPhase: number;
  color: string;
}

const GRASS_COLORS = ['#14532d', '#166534', '#15803d', '#22c55e', '#4ade80'];

export default function SwayingGrass({ count = 60 }: { count?: number }) {
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

    const blades: GrassBlade[] = [];
    for (let i = 0; i < count; i++) {
      blades.push({
        x: Math.random() * w,
        y: h,
        height: Math.random() * 40 + 20,
        width: Math.random() * 2 + 1,
        lean: (Math.random() - 0.5) * 10,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayPhase: Math.random() * Math.PI * 2,
        color: GRASS_COLORS[Math.floor(Math.random() * GRASS_COLORS.length)],
      });
    }

    function draw() {
      context.clearRect(0, 0, w, h);

      for (let i = 0; i < blades.length; i++) {
        const b = blades[i];
        b.swayPhase += b.swaySpeed;
        const sway = Math.sin(b.swayPhase) * 8 + b.lean;

        const tipX = b.x + sway;
        const tipY = b.y - b.height;

        context.beginPath();
        context.moveTo(b.x - b.width / 2, b.y);
        context.quadraticCurveTo(b.x + sway * 0.3, b.y - b.height * 0.5, tipX, tipY);
        context.quadraticCurveTo(b.x + sway * 0.3, b.y - b.height * 0.5, b.x + b.width / 2, b.y);
        context.closePath();

        context.fillStyle = b.color;
        context.globalAlpha = 0.25;
        context.fill();
      }

      context.globalAlpha = 1;
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
        bottom: 0,
        left: 0,
        width: '100%',
        height: '120px',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
