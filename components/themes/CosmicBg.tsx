'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';

interface Star {
  x: number;
  y: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  life: number;
  maxLife: number;
}

export default function CosmicBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = assetPath('/images/themes/cosmic-bg.jpg');
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

    // 星星
    const stars: Star[] = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 0.5 + Math.random() * 2,
      twinklePhase: i * 1.3,
      twinkleSpeed: 0.5 + Math.random() * 2,
    }));

    // 流星
    const shootingStars: ShootingStar[] = [
      { x: 0, y: 0, vx: -3, vy: 1.5, active: false, life: 0, maxLife: 60 },
      { x: 0, y: 0, vx: -2.5, vy: 1, active: false, life: 0, maxLife: 50 },
    ];

    const cols = 14;
    const rows = 10;

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // ========== 第一层：动态背景（星空缓慢流动）==========
      const blockW = img.width / cols;
      const blockH = img.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * blockW;
          const sy = r * blockH;

          // 星空缓慢漂移
          const driftX = Math.sin(r * 0.2 + time * 0.08) * 3;
          const driftY = Math.cos(c * 0.15 + time * 0.06) * 2;

          const dx = c * (width / cols) + driftX;
          const dy = r * (height / rows) + driftY;
          const dw = width / cols + 2;
          const dh = height / rows + 2;

          ctx.drawImage(img, sx, sy, blockW, blockH, dx, dy, dw, dh);
        }
      }

      // 银河脉动叠加
      const galaxyAlpha = 0.04 + Math.sin(time * 0.3) * 0.02;
      const galaxyGrad = ctx.createLinearGradient(0, 0, width, height * 0.6);
      galaxyGrad.addColorStop(0, 'rgba(200, 180, 220, 0)');
      galaxyGrad.addColorStop(0.3, `rgba(210, 190, 230, ${galaxyAlpha * 0.5})`);
      galaxyGrad.addColorStop(0.5, `rgba(220, 200, 240, ${galaxyAlpha})`);
      galaxyGrad.addColorStop(0.7, `rgba(210, 190, 230, ${galaxyAlpha * 0.7})`);
      galaxyGrad.addColorStop(1, 'rgba(200, 180, 220, 0)');
      ctx.fillStyle = galaxyGrad;
      ctx.fillRect(0, 0, width, height * 0.7);

      // ========== 第二层：点缀元素 ==========

      // 星星闪烁
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
        const alpha = 0.3 + twinkle * 0.7;
        const size = star.size * (0.8 + twinkle * 0.2);

        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 250, 240, ${alpha})`;
        ctx.fill();

        // 星光晕
        if (star.size > 1.2) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 4);
          glow.addColorStop(0, `rgba(255, 250, 240, ${alpha * 0.2})`);
          glow.addColorStop(1, 'rgba(255, 250, 240, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 流星
      shootingStars.forEach((ss, i) => {
        // 随机激活
        if (!ss.active && Math.random() < 0.002) {
          ss.active = true;
          ss.x = width * (0.6 + Math.random() * 0.3);
          ss.y = height * (0.05 + Math.random() * 0.15);
          ss.life = ss.maxLife;
        }

        if (ss.active) {
          ss.x += ss.vx;
          ss.y += ss.vy;
          ss.life--;

          const progress = ss.life / ss.maxLife;
          const alpha = Math.sin(progress * Math.PI) * 0.9;

          // 流星尾迹
          const tailLength = 30 + alpha * 20;
          const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * tailLength, ss.y - ss.vy * tailLength);
          grad.addColorStop(0, `rgba(255, 255, 240, ${alpha})`);
          grad.addColorStop(0.5, `rgba(255, 255, 240, ${alpha * 0.3})`);
          grad.addColorStop(1, 'rgba(255, 255, 240, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - ss.vx * tailLength, ss.y - ss.vy * tailLength);
          ctx.stroke();

          // 流星头部
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          if (ss.life <= 0 || ss.x < -50 || ss.y > height + 50) {
            ss.active = false;
          }
        }
      });

      // 星云光晕
      const nebulaAlpha = 0.03 + Math.sin(time * 0.2) * 0.015;
      const nebulaGrad = ctx.createRadialGradient(width * 0.3, height * 0.25, 0, width * 0.3, height * 0.25, width * 0.4);
      nebulaGrad.addColorStop(0, `rgba(180, 160, 220, ${nebulaAlpha})`);
      nebulaGrad.addColorStop(1, 'rgba(180, 160, 220, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

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
