'use client';

import { useEffect, useRef } from 'react';

interface Nebula {
  x: number;
  y: number;
  r: number;
  color: string;
  driftX: number;
  driftY: number;
  pulse: number;
  pulseSpeed: number;
}

const NEBULA_COLORS = [
  '139, 92, 246',  // violet
  '6, 182, 212',   // cyan
  '99, 102, 241',  // indigo
  '236, 72, 153',  // pink
];

export default function NebulaEffect({ count = 5 }: { count?: number }) {
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

    const nebulas: Nebula[] = [];
    for (let i = 0; i < count; i++) {
      nebulas.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 200 + 100,
        color: NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)],
        driftX: (Math.random() - 0.5) * 0.1,
        driftY: (Math.random() - 0.5) * 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.005 + 0.002,
      });
    }

    function draw() {
      context.clearRect(0, 0, w, h);

      for (let i = 0; i < nebulas.length; i++) {
        const n = nebulas[i];
        n.x += n.driftX;
        n.y += n.driftY;
        n.pulse += n.pulseSpeed;

        if (n.x < -n.r) n.x = w + n.r;
        if (n.x > w + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = h + n.r;
        if (n.y > h + n.r) n.y = -n.r;

        const pulseR = n.r * (0.9 + 0.1 * Math.sin(n.pulse));
        const alpha = 0.04 + 0.02 * Math.sin(n.pulse);

        const gradient = context.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulseR);
        gradient.addColorStop(0, `rgba(${n.color}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${n.color}, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        context.beginPath();
        context.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
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
