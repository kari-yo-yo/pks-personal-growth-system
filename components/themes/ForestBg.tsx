'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';

interface Leaf {
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

interface LightSpot {
  x: number;
  y: number;
  radius: number;
  phase: number;
}

interface Firefly {
  x: number;
  y: number;
  phase: number;
  speed: number;
}

export default function ForestBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = assetPath('/images/themes/forest-bg.jpg');
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

    // 落叶
    const leaves: Leaf[] = Array.from({ length: 10 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      fallSpeed: 0.2 + Math.random() * 0.3,
      swayPhase: i * 1.9,
      opacity: 0.3 + Math.random() * 0.3,
      color: ['#7cb342', '#8bc34a', '#aed581', '#689f38'][i % 4],
    }));

    // 林间光斑
    const lightSpots: LightSpot[] = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.7,
      radius: 25 + Math.random() * 40,
      phase: i * 2.3,
    }));

    // 萤火虫
    const fireflies: Firefly[] = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      phase: i * 3.1,
      speed: 0.2 + Math.random() * 0.3,
    }));

    const cols = 18;
    const rows = 14;

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // ========== 第一层：动态背景（风吹林动网格扭曲）==========
      const blockW = img.width / cols;
      const blockH = img.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * blockW;
          const sy = r * blockH;

          // 风吹偏移 - 树冠摇曳
          const windX =
            Math.sin(r * 0.3 + time * 0.5) * 5 +
            Math.sin(c * 0.2 + time * 0.3) * 3;
          const windY =
            Math.cos(c * 0.25 + time * 0.4) * 4 +
            Math.sin(r * 0.2 + time * 0.35) * 2;

          // 底部（树干）偏移小，顶部（树冠）偏移大
          const treeFactor = r / rows;
          const dx = c * (width / cols) + windX * treeFactor;
          const dy = r * (height / rows) + windY * treeFactor;
          const dw = width / cols + 2;
          const dh = height / rows + 2;

          ctx.drawImage(img, sx, sy, blockW, blockH, dx, dy, dw, dh);
        }
      }

      // ========== 第二层：点缀元素 ==========

      // 林间光斑
      lightSpots.forEach((spot) => {
        spot.x += Math.sin(time * 0.15 + spot.phase) * 0.3;
        spot.y += Math.cos(time * 0.12 + spot.phase * 1.5) * 0.2;
        const rad = spot.radius + Math.sin(time * 0.25 + spot.phase) * 6;
        const alpha = 0.06 + Math.sin(time * 0.3 + spot.phase) * 0.03;

        const grad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, rad);
        grad.addColorStop(0, `rgba(255, 250, 200, ${alpha})`);
        grad.addColorStop(0.5, `rgba(255, 245, 180, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // 落叶
      leaves.forEach((leaf) => {
        leaf.y += leaf.fallSpeed;
        leaf.x += Math.sin(time * 0.4 + leaf.swayPhase) * 0.4;
        leaf.rotation += leaf.rotSpeed;

        if (leaf.y > height + 10) {
          leaf.y = -10;
          leaf.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.globalAlpha = leaf.opacity;
        ctx.fillStyle = leaf.color;

        // 绘制叶子形状（椭圆）
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 萤火虫
      fireflies.forEach((ff) => {
        ff.x += Math.sin(time * ff.speed + ff.phase) * 0.3;
        ff.y += Math.cos(time * ff.speed * 0.7 + ff.phase * 1.2) * 0.2;
        const flicker = 0.5 + Math.sin(time * 3 + ff.phase) * 0.5;
        const alpha = 0.3 * flicker;

        const grad = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, 8);
        grad.addColorStop(0, `rgba(200, 255, 100, ${alpha})`);
        grad.addColorStop(1, 'rgba(200, 255, 100, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

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
