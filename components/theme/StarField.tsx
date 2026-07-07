'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  twinkleSpeed: number;
}

interface Constellation {
  stars: number[];
  alpha: number;
}

export default function StarField({ count = 300 }: { count?: number }) {
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

    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        targetAlpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    // 构建星座：将距离相近的星星连线
    const constellations: Constellation[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && Math.random() > 0.85) {
          constellations.push({
            stars: [i, j],
            alpha: Math.random() * 0.15 + 0.05,
          });
        }
      }
    }

    let time = 0;

    function draw() {
      time += 1;
      context.clearRect(0, 0, w, h);

      // 画星座连线
      for (let i = 0; i < constellations.length; i++) {
        const con = constellations[i];
        const s1 = stars[con.stars[0]];
        const s2 = stars[con.stars[1]];
        context.beginPath();
        context.moveTo(s1.x, s1.y);
        context.lineTo(s2.x, s2.y);
        const pulseAlpha = con.alpha * (0.7 + 0.3 * Math.sin(time * 0.005 + i));
        context.strokeStyle = `rgba(139, 92, 246, ${pulseAlpha})`;
        context.lineWidth = 0.5;
        context.stroke();
      }

      // 画星星
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.alpha += (s.targetAlpha - s.alpha) * s.twinkleSpeed;
        if (Math.abs(s.alpha - s.targetAlpha) < 0.01) {
          s.targetAlpha = Math.random() * 0.8 + 0.2;
        }

        context.beginPath();
        context.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        context.fill();

        // 大星星加微光晕
        if (s.size > 1.5) {
          context.beginPath();
          context.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
          const gradient = context.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${s.alpha * 0.2})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          context.fillStyle = gradient;
          context.fill();
        }
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
