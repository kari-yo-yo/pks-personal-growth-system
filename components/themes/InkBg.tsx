'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';

interface InkCloud {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
}

interface MistLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  phase: number;
  speed: number;
}

interface Bird {
  x: number;
  y: number;
  phase: number;
  speed: number;
}

export default function InkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = assetPath('/images/themes/ink-bg.jpg');
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

    // 墨韵扩散
    const inkClouds: InkCloud[] = Array.from({ length: 3 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.6,
      radius: 60 + Math.random() * 80,
      phase: i * 3.1,
      speed: 0.05 + Math.random() * 0.05,
    }));

    // 云雾层
    const mistLayers: MistLayer[] = Array.from({ length: 3 }, (_, i) => ({
      x: -50,
      y: h * (0.2 + i * 0.2),
      width: w + 100,
      height: 80 + Math.random() * 60,
      phase: i * 2.3,
      speed: 0.02 + Math.random() * 0.02,
    }));

    // 飞鸟
    const birds: Bird[] = Array.from({ length: 2 }, (_, i) => ({
      x: -20,
      y: h * (0.1 + Math.random() * 0.2),
      phase: i * 5.1,
      speed: 0.3 + Math.random() * 0.2,
    }));

    const cols = 16;
    const rows = 12;

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // ========== 第一层：动态背景（墨韵流动）==========
      const blockW = img.width / cols;
      const blockH = img.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * blockW;
          const sy = r * blockH;

          // 墨韵流动 - 缓慢晕染偏移
          const inkX =
            Math.sin(r * 0.2 + time * 0.15) * 4 +
            Math.sin(c * 0.15 + time * 0.1) * 2;
          const inkY =
            Math.cos(c * 0.18 + time * 0.12) * 3 +
            Math.sin(r * 0.12 + time * 0.08) * 2;

          const dx = c * (width / cols) + inkX;
          const dy = r * (height / rows) + inkY;
          const dw = width / cols + 2;
          const dh = height / rows + 2;

          ctx.drawImage(img, sx, sy, blockW, blockH, dx, dy, dw, dh);
        }
      }

      // ========== 第二层：点缀元素 ==========

      // 墨韵扩散
      inkClouds.forEach((cloud) => {
        const pulse = 0.04 + Math.sin(time * cloud.speed + cloud.phase) * 0.02;
        const rad = cloud.radius + Math.sin(time * cloud.speed * 0.5 + cloud.phase) * 15;

        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, rad);
        grad.addColorStop(0, `rgba(30, 30, 30, ${pulse})`);
        grad.addColorStop(0.5, `rgba(50, 50, 50, ${pulse * 0.5})`);
        grad.addColorStop(1, 'rgba(80, 80, 80, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // 云雾缓缓飘移
      mistLayers.forEach((mist) => {
        mist.x += mist.speed;
        if (mist.x > width) mist.x = -mist.width;

        const alpha = 0.03 + Math.sin(time * 0.1 + mist.phase) * 0.015;
        const grad = ctx.createLinearGradient(mist.x, mist.y, mist.x + mist.width, mist.y);
        grad.addColorStop(0, 'rgba(200, 200, 195, 0)');
        grad.addColorStop(0.3, `rgba(190, 190, 185, ${alpha})`);
        grad.addColorStop(0.7, `rgba(190, 190, 185, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(200, 200, 195, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(mist.x, mist.y, mist.width, mist.height);
      });

      // 飞鸟剪影
      birds.forEach((bird) => {
        bird.x += bird.speed;
        bird.y += Math.sin(time * 0.3 + bird.phase) * 0.1;

        if (bird.x > width + 20) {
          bird.x = -20;
          bird.y = height * (0.05 + Math.random() * 0.15);
        }

        const alpha = 0.15;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        const wingY = Math.sin(time * 2 + bird.phase) * 3;
        ctx.beginPath();
        ctx.moveTo(bird.x - 6, bird.y + wingY);
        ctx.quadraticCurveTo(bird.x - 2, bird.y - 1 + wingY * 0.3, bird.x, bird.y);
        ctx.quadraticCurveTo(bird.x + 2, bird.y - 1 + wingY * 0.3, bird.x + 6, bird.y + wingY);
        ctx.stroke();

        ctx.restore();
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
