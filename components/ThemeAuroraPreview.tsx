'use client';

import { useEffect, useRef } from 'react';

/**
 * Theme Aurora Preview
 * ──────────────────────
 * Algorithmic art: each theme renders a unique miniature aurora.
 * Layered noise bands flow horizontally, their color sampled from
 * the theme's palette. Particles drift upward like bioluminescent
 * spores. The effect is a living color fingerprint — two themes
 * never produce the same visual.
 *
 * Crafted with sinusoidal wave stacking, perlin-like noise modulation,
 * vertical gradient compositing, and floating luminous particles.
 */

interface Particle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
  phase: number;
}

export default function ThemeAuroraPreview({
  primary,
  accent,
  background,
  isSelected,
  onClick,
}: {
  primary: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
  background: string;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 280;
    const h = 160;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const _ctx = canvas.getContext('2d');
    if (!_ctx) return;
    const ctx = _ctx;
    ctx.scale(dpr, dpr);

    // 简易 hash for deterministic randomness per theme
    const seed = (primary.r * 1000 + primary.g * 100 + primary.b);
    let _s = seed;
    function srand() {
      _s = (_s * 16807 + 7) % 2147483647;
      return (_s - 1) / 2147483646;
    }

    // 初始化粒子
    const particles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: srand() * w,
        y: srand() * h,
        vy: -(0.15 + srand() * 0.25),
        vx: (srand() - 0.5) * 0.2,
        size: 1 + srand() * 2,
        alpha: 0.3 + srand() * 0.5,
        phase: srand() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    function noise(x: number): number {
      const n = Math.sin(x * 12.9898 + seed * 0.01) * 43758.5453;
      return n - Math.floor(n);
    }

    function animate() {
      frameRef.current++;
      ctx.clearRect(0, 0, w, h);

      // 背景渐变
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, background);
      bgGrad.addColorStop(1, background);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const t = frameRef.current * 0.008;

      // ─── 极光波段层 ───
      const bandCount = 5;
      for (let i = 0; i < bandCount; i++) {
        const bandY = h * 0.3 + (i / bandCount) * h * 0.5;
        const bandAlpha = 0.04 + 0.03 * Math.sin(t + i * 1.2);
        const mix = i / bandCount;
        const br = Math.round(primary.r + (accent.r - primary.r) * mix);
        const bg = Math.round(primary.g + (accent.g - primary.g) * mix);
        const bb = Math.round(primary.b + (accent.b - primary.b) * mix);

        ctx.beginPath();
        ctx.moveTo(0, bandY);

        for (let x = 0; x <= w; x += 2) {
          const nx = x / w;
          const wave1 = Math.sin(nx * Math.PI * 3 + t + i * 0.8) * 15;
          const wave2 = Math.sin(nx * Math.PI * 5 + t * 1.3 + i * 1.5) * 8;
          const wave3 = (noise(nx * 10 + t * 0.5 + i) - 0.5) * 12;
          const y = bandY + wave1 + wave2 + wave3;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, bandY - 20, 0, bandY + 40);
        grad.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, 0)`);
        grad.addColorStop(0.4, `rgba(${br}, ${bg}, ${bb}, ${bandAlpha})`);
        grad.addColorStop(1, `rgba(${br}, ${bg}, ${bb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ─── 粒子 ───
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(t + p.phase) * 0.1;
        p.phase += 0.01;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = srand() * w;
        }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        glow.addColorStop(0, `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${p.alpha * 0.6})`);
        glow.addColorStop(0.5, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${p.alpha * 0.2})`);
        glow.addColorStop(1, `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // 亮核
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.fill();
      }

      // ─── 顶部光晕 ───
      const topGlow = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, w * 0.6);
      topGlow.addColorStop(0, `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.08)`);
      topGlow.addColorStop(1, `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0)`);
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [primary, accent, background]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      className={`rounded-xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-primary/60 scale-[1.02]'
          : 'hover:scale-[1.01] hover:ring-1 hover:ring-white/10'
      }`}
    />
  );
}
