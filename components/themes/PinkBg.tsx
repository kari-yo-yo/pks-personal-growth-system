'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';

interface Petal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  fallSpeed: number;
  swayPhase: number;
  opacity: number;
  color: string;
}

interface SoftGlow {
  x: number;
  y: number;
  radius: number;
  phase: number;
}

export default function PinkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = assetPath('/images/themes/pink-bg.jpg');
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

    // 花瓣
    const petals: Petal[] = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 3 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      fallSpeed: 0.15 + Math.random() * 0.25,
      swayPhase: i * 2.1,
      opacity: 0.4 + Math.random() * 0.3,
      color: ['#ffb6c1', '#ffc0cb', '#ffaeb9', '#ffd1dc'][i % 4],
    }));

    // 粉色柔光
    const glows: SoftGlow[] = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 40 + Math.random() * 50,
      phase: i * 2.7,
    }));

    const cols = 18;
    const rows = 14;

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // ========== 第一层：动态背景（花海起伏）==========
      const blockW = img.width / cols;
      const blockH = img.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * blockW;
          const sy = r * blockH;

          // 花海起伏 - 波浪式偏移
          const waveX =
            Math.sin(r * 0.35 + time * 0.6) * 4 +
            Math.sin(c * 0.25 + time * 0.4) * 2;
          const waveY =
            Math.cos(c * 0.3 + time * 0.5) * 5 +
            Math.sin(r * 0.2 + time * 0.35) * 3;

          const dx = c * (width / cols) + waveX;
          const dy = r * (height / rows) + waveY;
          const dw = width / cols + 2;
          const dh = height / rows + 2;

          ctx.drawImage(img, sx, sy, blockW, blockH, dx, dy, dw, dh);
        }
      }

      // ========== 第二层：点缀元素 ==========

      // 粉色柔光
      glows.forEach((glow) => {
        glow.x += Math.sin(time * 0.1 + glow.phase) * 0.2;
        glow.y += Math.cos(time * 0.08 + glow.phase * 1.3) * 0.15;
        const rad = glow.radius + Math.sin(time * 0.2 + glow.phase) * 10;
        const alpha = 0.05 + Math.sin(time * 0.25 + glow.phase) * 0.03;

        const grad = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, rad);
        grad.addColorStop(0, `rgba(255, 180, 210, ${alpha})`);
        grad.addColorStop(0.5, `rgba(255, 160, 190, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(255, 180, 210, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // 花瓣飘落
      petals.forEach((petal) => {
        petal.y += petal.fallSpeed;
        petal.x += Math.sin(time * 0.3 + petal.swayPhase) * 0.35;
        petal.rotation += petal.rotSpeed;

        if (petal.y > height + 10) {
          petal.y = -10;
          petal.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.globalAlpha = petal.opacity;
        ctx.fillStyle = petal.color;

        // 绘制花瓣（椭圆）
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 细碎光点如花粉飘散
      for (let i = 0; i < 15; i++) {
        const px = ((Math.sin(time * 0.1 + i * 4.3) * 0.5 + 0.5) * 0.9 + 0.05) * width;
        const py = ((Math.cos(time * 0.08 + i * 3.9) * 0.5 + 0.5) * 0.9 + 0.05) * height;
        const flicker = 0.5 + Math.sin(time * 1.2 + i * 2.1) * 0.5;
        const alpha = 0.15 * flicker;

        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 235, ${alpha})`;
        ctx.fill();
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
        willChange: 'transform',
      }}
    />
  );
}
