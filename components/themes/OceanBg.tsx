'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobblePhase: number;
  opacity: number;
}

interface LightSpot {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
}

export default function OceanBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animRef = useRef<number>(0);

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = assetPath('/images/themes/ocean-bg.jpg');
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => console.error('Ocean image failed');
  }, []);

  // Canvas 动画
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

    // 初始化气泡
    const bubbles: Bubble[] = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * w,
      y: h + Math.random() * 200,
      radius: 4 + Math.random() * 12,
      speed: 0.3 + Math.random() * 0.4,
      wobblePhase: i * 1.7,
      opacity: 0.15 + Math.random() * 0.15,
    }));

    // 初始化光斑
    const lightSpots: LightSpot[] = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 30 + Math.random() * 50,
      phase: i * 2.1,
      speed: 0.3 + Math.random() * 0.2,
    }));

    const cols = 20;
    const rows = 15;

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // ========== 第一层：动态背景（网格波浪扭曲）==========
      const blockW = img.width / cols;
      const blockH = img.height / rows;
      const scaleX = width / img.width;
      const scaleY = height / img.height;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * blockW;
          const sy = r * blockH;

          // 波浪偏移 - 让图片动起来
          const waveX =
            Math.sin(r * 0.4 + time * 0.8) * 6 +
            Math.sin(c * 0.3 + time * 0.5) * 4;
          const waveY =
            Math.cos(c * 0.35 + time * 0.6) * 5 +
            Math.sin(r * 0.25 + time * 0.4) * 3;

          const dx = c * (width / cols) + waveX;
          const dy = r * (height / rows) + waveY;
          const dw = width / cols + 2;
          const dh = height / rows + 2;

          ctx.drawImage(img, sx, sy, blockW, blockH, dx, dy, dw, dh);
        }
      }

      // 波光粼粼（动态闪光点）
      for (let i = 0; i < 12; i++) {
        const px = ((Math.sin(time * 0.15 + i * 3.1) * 0.5 + 0.5) * 0.8 + 0.1) * width;
        const py = ((Math.cos(time * 0.12 + i * 2.7) * 0.5 + 0.5) * 0.6 + 0.2) * height;
        const rad = 20 + Math.sin(time + i) * 8;
        const alpha = 0.06 + Math.sin(time * 0.8 + i * 1.3) * 0.04;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, rad);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.5, `rgba(200, 240, 255, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========== 第二层：点缀元素（气泡 + 光斑）==========

      // 气泡
      bubbles.forEach((bubble, i) => {
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(time * 0.5 + bubble.wobblePhase) * 0.3;

        if (bubble.y < -30) {
          bubble.y = height + 30;
          bubble.x = Math.random() * width;
        }

        const flicker = 0.7 + Math.sin(time * 2 + i) * 0.3;
        const op = bubble.opacity * flicker;

        // 气泡主体
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 245, 255, ${op})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 气泡填充
        const bGrad = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.radius
        );
        bGrad.addColorStop(0, `rgba(220, 250, 255, ${op * 0.3})`);
        bGrad.addColorStop(1, `rgba(180, 230, 255, ${op * 0.05})`);
        ctx.fillStyle = bGrad;
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.arc(
          bubble.x - bubble.radius * 0.35,
          bubble.y - bubble.radius * 0.35,
          bubble.radius * 0.25,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${op * 0.8})`;
        ctx.fill();
      });

      // 光斑
      lightSpots.forEach((spot) => {
        spot.x += Math.sin(time * spot.speed + spot.phase) * 0.4;
        spot.y += Math.cos(time * spot.speed * 0.8 + spot.phase * 1.3) * 0.25;
        const rad = spot.radius + Math.sin(time * 0.3 + spot.phase) * 8;
        const alpha = 0.08 + Math.sin(time * 0.4 + spot.phase) * 0.04;

        const grad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, rad);
        grad.addColorStop(0, `rgba(180, 235, 255, ${alpha})`);
        grad.addColorStop(0.5, `rgba(140, 210, 255, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, rad, 0, Math.PI * 2);
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
        willChange: 'transform',
      }}
    />
  );
}
