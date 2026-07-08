'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';

interface GoldenParticle {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  drift: number;
}

interface WarmGlow {
  x: number;
  y: number;
  radius: number;
  phase: number;
}

export default function HopeBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = assetPath('/images/themes/hope-bg.jpg');
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!imageLoaded || !imageRef.current) return;

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
    };
    resize();
    window.addEventListener('resize', resize);

    const img = imageRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 金色微粒
    const particles: GoldenParticle[] = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 0.8 + Math.random() * 1.5,
      phase: i * 1.9,
      speed: 0.15 + Math.random() * 0.25,
      drift: (Math.random() - 0.5) * 0.3,
    }));

    // 暖色光晕
    const glows: WarmGlow[] = Array.from({ length: 3 }, (_, i) => ({
      x: w * (0.3 + i * 0.2),
      y: h * (0.2 + i * 0.15),
      radius: 80 + Math.random() * 60,
      phase: i * 2.5,
    }));

    const cols = 16;
    const rows = 12;

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // ========== 第一层：动态背景（光之呼吸）==========
      const blockW = img.width / cols;
      const blockH = img.height / rows;

      // 呼吸效果 - 整体明暗脉动
      const breathe = Math.sin(time * 0.5) * 0.03 + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * blockW;
          const sy = r * blockH;

          // 轻微扭曲 + 光芒流转
          const flowX = Math.sin(r * 0.3 + time * 0.4) * 3;
          const flowY = Math.cos(c * 0.25 + time * 0.35) * 2;

          const dx = c * (width / cols) + flowX;
          const dy = r * (height / rows) + flowY;
          const dw = width / cols + 2;
          const dh = height / rows + 2;

          ctx.drawImage(img, sx, sy, blockW, blockH, dx, dy, dw, dh);
        }
      }

      // 全局呼吸明暗叠加
      ctx.fillStyle = `rgba(255, 200, 100, ${Math.sin(time * 0.5) * 0.02})`;
      ctx.fillRect(0, 0, width, height);

      // ========== 第二层：点缀元素 ==========

      // 暖色光晕
      glows.forEach((glow) => {
        const pulse = 0.06 + Math.sin(time * 0.4 + glow.phase) * 0.03;
        const rad = glow.radius + Math.sin(time * 0.3 + glow.phase) * 15;

        const grad = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, rad);
        grad.addColorStop(0, `rgba(255, 200, 100, ${pulse})`);
        grad.addColorStop(0.5, `rgba(255, 180, 80, ${pulse * 0.5})`);
        grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // 金色微粒
      particles.forEach((p) => {
        p.x += p.drift + Math.sin(time * p.speed + p.phase) * 0.2;
        p.y -= 0.1 + Math.sin(time * p.speed * 0.5 + p.phase) * 0.1;

        if (p.y < -5) p.y = height + 5;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        const flicker = 0.5 + Math.sin(time * 2 + p.phase) * 0.5;
        const alpha = 0.4 * flicker;

        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(255, 220, 150, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 200, ${alpha})`;
        ctx.fill();
        ctx.restore();
      });

      // 光线中闪过的亮点
      for (let i = 0; i < 6; i++) {
        const sx = ((Math.sin(time * 0.08 + i * 4.1) * 0.5 + 0.5) * 0.7 + 0.15) * width;
        const sy = ((Math.cos(time * 0.06 + i * 3.7) * 0.5 + 0.5) * 0.5 + 0.1) * height;
        const flash = Math.sin(time * 1.5 + i * 2.3) * 0.5 + 0.5;
        if (flash > 0.7) {
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 15);
          grad.addColorStop(0, `rgba(255, 255, 220, ${(flash - 0.7) * 0.8})`);
          grad.addColorStop(1, 'rgba(255, 255, 220, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [imageLoaded]);

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
      }}
    />
  );
}
