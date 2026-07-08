'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';

interface IceCrystal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  fallSpeed: number;
  swayPhase: number;
  opacity: number;
}

interface StarPoint {
  x: number;
  y: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

export default function AuroraBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = assetPath('/images/themes/aurora-bg.jpg');
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

    // Ice crystals
    const crystals: IceCrystal[] = Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 2 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.2 + Math.random() * 0.4,
      fallSpeed: 0.2 + Math.random() * 0.5,
      swayPhase: i * 2.7,
      opacity: 0.15 + Math.random() * 0.35,
    }));

    // Stars
    const stars: StarPoint[] = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.6,
      size: 0.5 + Math.random() * 1.5,
      twinklePhase: i * 1.5,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
    }));

    const cols = 20;
    const rows = 14;

    const drawHexagon = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.restore();
    };

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Layer 1: Aurora wave mesh distortion
      const blockW = img.width / cols;
      const blockH = img.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * blockW;
          const sy = r * blockH;

          // Aurora wave — slow, sweeping vertical offset
          const auroraX = Math.sin(r * 0.15 + time * 0.06) * 8 + Math.cos(c * 0.1 + time * 0.04) * 4;
          const auroraY = Math.sin(c * 0.2 + time * 0.05) * 5 + Math.cos(r * 0.12 + time * 0.03) * 3;

          const dx = c * (width / cols) + auroraX;
          const dy = r * (height / rows) + auroraY;
          const dw = width / cols + 3;
          const dh = height / rows + 3;

          ctx.drawImage(img, sx, sy, blockW, blockH, dx, dy, dw, dh);
        }
      }

      // Aurora color overlay band
      const auroraY = height * 0.15 + Math.sin(time * 0.08) * height * 0.05;
      const auroraH = height * 0.35;
      const auroraGrad = ctx.createLinearGradient(0, auroraY, 0, auroraY + auroraH);
      const auroraAlpha = 0.04 + Math.sin(time * 0.15) * 0.02;
      auroraGrad.addColorStop(0, 'rgba(52, 211, 153, 0)');
      auroraGrad.addColorStop(0.2, `rgba(52, 211, 153, ${auroraAlpha})`);
      auroraGrad.addColorStop(0.5, `rgba(129, 140, 248, ${auroraAlpha * 0.8})`);
      auroraGrad.addColorStop(0.8, `rgba(52, 211, 153, ${auroraAlpha * 0.5})`);
      auroraGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, auroraY, width, auroraH);

      // Layer 2: Ice crystals
      crystals.forEach((c) => {
        c.y += c.fallSpeed;
        c.rotation += c.rotSpeed * 0.01;
        c.x += Math.sin(time * 0.3 + c.swayPhase) * 0.3;

        if (c.y > height + 20) {
          c.y = -20;
          c.x = Math.random() * width;
        }

        ctx.globalAlpha = c.opacity;
        drawHexagon(c.x, c.y, c.size, c.rotation);
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.6)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Layer 3: Stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
        const alpha = 0.2 + twinkle * 0.6;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 244, 240, ${alpha})`;
        ctx.fill();

        // Glow on larger stars
        if (star.size > 1) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
          glow.addColorStop(0, `rgba(110, 231, 183, ${alpha * 0.15})`);
          glow.addColorStop(1, 'rgba(110, 231, 183, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
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
