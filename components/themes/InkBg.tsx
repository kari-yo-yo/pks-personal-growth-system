'use client';

import { useRef, useEffect, useCallback } from 'react';

interface InkBlob {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  phase: number;
  growRate: number;
  targetRadius: number;
}

interface MountainSilhouette {
  points: { x: number; y: number }[];
  x: number;
  y: number;
  alpha: number;
  speed: number;
}

interface MistParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speedX: number;
  speedY: number;
}

interface WaterfallStreak {
  x: number;
  y: number;
  length: number;
  alpha: number;
  speed: number;
  width: number;
}

export default function InkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    timeRef.current += 0.016;
    const t = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0a08');
    bgGrad.addColorStop(0.5, '#151510');
    bgGrad.addColorStop(1, '#0a0805');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Rice paper texture (subtle noise)
    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 4;
      imageData.data[i] = 10 + noise;
      imageData.data[i + 1] = 10 + noise;
      imageData.data[i + 2] = 8 + noise;
      imageData.data[i + 3] = 6 + Math.random() * 4;
    }
    ctx.putImageData(imageData, 0, 0);

    // 3. Floating mountain silhouettes
    const mountains: MountainSilhouette[] = [
      {
        points: [
          { x: 0, y: 0.4 }, { x: 0.08, y: 0.15 }, { x: 0.15, y: 0.35 },
          { x: 0.22, y: 0.12 }, { x: 0.3, y: 0.3 }, { x: 0.38, y: 0.18 },
          { x: 0.45, y: 0.4 },
        ],
        x: 0, y: height * 0.65, alpha: 0.04, speed: 0.02,
      },
      {
        points: [
          { x: 0.4, y: 0.45 }, { x: 0.5, y: 0.2 }, { x: 0.58, y: 0.4 },
          { x: 0.65, y: 0.25 }, { x: 0.72, y: 0.42 },
        ],
        x: width * 0.1, y: height * 0.7, alpha: 0.03, speed: 0.015,
      },
      {
        points: [
          { x: 0.7, y: 0.4 }, { x: 0.78, y: 0.22 }, { x: 0.85, y: 0.38 },
          { x: 0.92, y: 0.28 }, { x: 1.0, y: 0.45 },
        ],
        x: width * 0.2, y: height * 0.6, alpha: 0.035, speed: 0.01,
      },
    ];

    mountains.forEach((m, mi) => {
      const driftY = Math.sin(t * m.speed + mi * 1.2) * 5;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y + driftY);

      m.points.forEach((p) => {
        ctx.lineTo(m.x + p.x * width * 0.8, m.y + p.y * height * 0.3 + driftY);
      });

      ctx.lineTo(m.x + width * 0.8, m.y + height * 0.4 + driftY);
      ctx.lineTo(m.x, m.y + height * 0.4 + driftY);
      ctx.closePath();

      ctx.fillStyle = `rgba(40, 38, 30, ${m.alpha})`;
      ctx.fill();
    });

    // 4. Waterfall vertical streaks
    const streakCount = 8;
    for (let i = 0; i < streakCount; i++) {
      const seed = i * 43.7;
      const sx = width * (0.3 + (seed % 40) * 0.01);
      const streakAlpha = 0.03 + Math.sin(t * 0.1 + i * 0.8) * 0.015 + (seed % 5) * 0.005;
      const streakLen = 60 + (seed % 60);
      const streakY = ((seed * 7.3 + t * 15 * (1 + (seed % 3) * 0.3)) % (height + streakLen)) - streakLen;
      const streakW = 0.5 + (seed % 3) * 0.3;

      ctx.beginPath();
      ctx.moveTo(sx, streakY);
      ctx.lineTo(sx, streakY + streakLen);
      ctx.strokeStyle = `rgba(200, 195, 180, ${Math.max(0, streakAlpha)})`;
      ctx.lineWidth = streakW;
      ctx.stroke();
    }

    // 5. Ink diffusion blobs
    const inkCount = 5;
    for (let i = 0; i < inkCount; i++) {
      const seed = i * 97.3;
      const ix = (seed * 23.1) % width;
      const iy = ((seed * 17.9) % height);
      const baseRadius = 20 + (seed % 30);
      const pulse = Math.sin(t * 0.08 + i * 1.3) * 0.3 + 0.7;
      const currentRadius = baseRadius * pulse;
      const inkAlpha = 0.02 + Math.sin(t * 0.05 + i * 0.9) * 0.01;

      // Diffused edge
      const grad = ctx.createRadialGradient(ix, iy, 0, ix, iy, currentRadius);
      grad.addColorStop(0, `rgba(30, 28, 22, ${inkAlpha * 10})`);
      grad.addColorStop(0.3, `rgba(40, 35, 25, ${inkAlpha * 5})`);
      grad.addColorStop(0.6, `rgba(50, 45, 35, ${inkAlpha * 2})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ix, iy, currentRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Mist particles
    const mistCount = 15;
    for (let i = 0; i < mistCount; i++) {
      const seed = i * 31.7;
      const mx = ((seed * 19.3 + t * 3 * (1 + (seed % 3) * 0.2)) % (width + 50)) - 25;
      const my = ((seed * 13.7) % height);
      const mr = 2 + (seed % 4);
      const mistAlpha = 0.02 + Math.sin(t * 0.1 + i * 0.5) * 0.01;

      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 175, 160, ${Math.max(0, mistAlpha)})`;
      ctx.fill();
    }

    // 7. Red seal stamp accent - subtle reference to ink wash painting
    const sealX = width * 0.88;
    const sealY = height * 0.85;
    const sealAlpha = 0.04 + Math.sin(t * 0.03) * 0.01;
    const sealSize = 28;

    ctx.save();
    ctx.translate(sealX, sealY);
    ctx.rotate(-0.08);

    // Seal border
    ctx.strokeStyle = `rgba(180, 50, 40, ${sealAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-sealSize, -sealSize * 0.7, sealSize * 2, sealSize * 1.4);

    // Seal text approximation (simple marks)
    ctx.fillStyle = `rgba(180, 50, 40, ${sealAlpha * 0.8})`;
    for (let i = 0; i < 4; i++) {
      const cx = -sealSize * 0.5 + (i % 2) * sealSize;
      const cy = -sealSize * 0.3 + Math.floor(i / 2) * sealSize * 0.6;
      ctx.fillRect(cx - 3, cy - 5, 6, 10);
      ctx.fillRect(cx - 5, cy - 3, 10, 6);
    }
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      draw(ctx, canvas.width, canvas.height);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}