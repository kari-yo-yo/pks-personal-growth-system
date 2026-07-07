'use client';

import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
  alpha: number;
}

export default function Bubbles({ count = 25 }: { count?: number }) {
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

    const bubbles: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 6 + 2,
        speed: Math.random() * 0.4 + 0.1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        alpha: Math.random() * 0.15 + 0.05,
      });
    }

    function draw() {
      context.clearRect(0, 0, w, h);

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        const x = b.x + Math.sin(b.wobble) * 20;

        if (b.y < -20) {
          b.y = h + 20;
          b.x = Math.random() * w;
        }

        context.beginPath();
        context.arc(x, b.y, b.r, 0, Math.PI * 2);
        context.strokeStyle = `rgba(56, 189, 248, ${b.alpha})`;
        context.lineWidth = 1;
        context.stroke();

        // Highlight
        context.beginPath();
        context.arc(x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
        context.fillStyle = `rgba(224, 242, 254, ${b.alpha * 0.5})`;
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
