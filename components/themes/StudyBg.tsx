'use client';

import { useEffect, useRef } from 'react';

interface DustParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  phase: number;
  brightness: number;
}

interface WarmGlow {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
}

export default function StudyBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dustRef = useRef<DustParticle[]>([]);
  const glowsRef = useRef<WarmGlow[]>([]);
  const initRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = window.innerWidth;
      const h = window.innerHeight;

      if (!initRef.current) {
        dustRef.current = Array.from({ length: 20 }, (_, i) => ({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 0.8 + Math.random() * 1.2,
          speedX: -0.1 + Math.random() * 0.2,
          speedY: -0.05 + Math.random() * 0.1,
          phase: i * 3.3,
          brightness: 0.3 + Math.random() * 0.5,
        }));

        glowsRef.current = Array.from({ length: 3 }, (_, i) => ({
          x: w * (0.15 + i * 0.35),
          y: h * (0.2 + Math.random() * 0.4),
          radius: 150 + Math.random() * 200,
          phase: i * 2.7,
          speed: 0.08 + Math.random() * 0.06,
        }));
        initRef.current = true;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Warm background gradient
      const bgGrad = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, Math.max(w, h));
      bgGrad.addColorStop(0, '#1e1810');
      bgGrad.addColorStop(0.5, '#1a1510');
      bgGrad.addColorStop(1, '#12100c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Warm glows (like sunlight through window)
      glowsRef.current.forEach((glow) => {
        const pulse = 0.03 + Math.sin(time * glow.speed + glow.phase) * 0.015;
        const drift = Math.sin(time * 0.02 + glow.phase) * 30;
        const gx = glow.x + drift;
        const gy = glow.y + Math.cos(time * 0.015 + glow.phase) * 20;
        const r = glow.radius + Math.sin(time * glow.speed * 0.5 + glow.phase) * 40;

        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
        grad.addColorStop(0, `rgba(212, 160, 84, ${pulse})`);
        grad.addColorStop(0.4, `rgba(192, 120, 48, ${pulse * 0.3})`);
        grad.addColorStop(1, 'rgba(192, 120, 48, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gx, gy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dust particles floating in warm light
      dustRef.current.forEach((p) => {
        p.x += p.speedX + Math.sin(time * 0.03 + p.phase) * 0.15;
        p.y += p.speedY + Math.cos(time * 0.02 + p.phase) * 0.1;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const flicker = p.brightness * (0.5 + Math.sin(time * 0.8 + p.phase) * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 192, 138, ${flicker})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -10,
        willChange: 'transform',
      }}
    />
  );
}
