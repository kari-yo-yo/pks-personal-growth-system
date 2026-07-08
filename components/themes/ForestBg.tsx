'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Leaf {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  speedY: number;
  speedX: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  alpha: number;
  color: string;
}

interface Firefly {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
  speedX: number;
  speedY: number;
}

export default function ForestBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    timeRef.current += 0.016;
    const t = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a1a0f');
    bgGrad.addColorStop(0.5, '#0f2a1a');
    bgGrad.addColorStop(1, '#0a1a0a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Light spots (sunlight through canopy) - CSS-like radial gradients on canvas
    const lightSpotPositions = [
      { x: width * 0.2, y: height * 0.1, r: 120 },
      { x: width * 0.55, y: height * 0.05, r: 150 },
      { x: width * 0.8, y: height * 0.15, r: 100 },
      { x: width * 0.35, y: height * 0.25, r: 80 },
      { x: width * 0.7, y: height * 0.08, r: 130 },
    ];

    lightSpotPositions.forEach((spot, i) => {
      const sway = Math.sin(t * 0.15 + i * 1.3) * 20;
      const brightAlpha = 0.04 + Math.sin(t * 0.2 + i * 0.7) * 0.02;

      const grad = ctx.createRadialGradient(
        spot.x + sway, spot.y, 0,
        spot.x + sway, spot.y, spot.r
      );
      grad.addColorStop(0, `rgba(180, 220, 120, ${brightAlpha})`);
      grad.addColorStop(0.3, `rgba(160, 200, 100, ${brightAlpha * 0.5})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(spot.x + sway - spot.r, spot.y - spot.r, spot.r * 2, spot.r * 2);
    });

    // 3. Falling leaves
    const leafCount = 15;
    const leafColors = [
      'hsla(120, 40%, 45%, ALPHA)',
      'hsla(100, 50%, 50%, ALPHA)',
      'hsla(80, 55%, 40%, ALPHA)',
      'hsla(45, 60%, 50%, ALPHA)',
      'hsla(30, 55%, 45%, ALPHA)',
    ];

    for (let i = 0; i < leafCount; i++) {
      const seed = i * 67.3;
      const x = (seed * 13.1) % width;
      const y = ((seed * 7.9) % (height + 100)) - 50;
      const lw = 8 + (seed % 7);
      const lh = 4 + (seed % 4);
      const rot = t * (0.3 + (seed % 5) * 0.1) + seed * 0.1;
      const alpha = 0.25 + (seed % 4) * 0.08;
      const sway = Math.sin(t * 0.4 + i * 0.9) * 15;
      const fallY = (y + t * (20 + (seed % 10) * 2)) % (height + 100);
      const colorIdx = seed % leafColors.length;
      const color = leafColors[colorIdx].replace('ALPHA', alpha.toString());

      ctx.save();
      ctx.translate(x + sway, fallY);
      ctx.rotate(rot);

      // Leaf shape as ellipse
      ctx.beginPath();
      ctx.ellipse(0, 0, lw, lh, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Leaf vein line
      ctx.beginPath();
      ctx.moveTo(-lw * 0.6, 0);
      ctx.lineTo(lw * 0.6, 0);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }

    // 4. Firefly particles
    const fireflyCount = 12;
    for (let i = 0; i < fireflyCount; i++) {
      const seed = i * 101.3;
      const fx = (seed * 17.3) % width;
      const fy = ((seed * 11.7) % height);
      const fr = 1.5 + (seed % 3) * 0.5;
      const fpulse = 0.3 + Math.sin(t * 0.8 + i * 0.6) * 0.25;
      const fAlpha = Math.max(0, fpulse);
      const driftX = Math.sin(t * 0.15 + i * 1.3) * 30;
      const driftY = Math.sin(t * 0.12 + i * 0.9) * 20;

      // Glow
      const glow = ctx.createRadialGradient(
        fx + driftX, fy + driftY, 0,
        fx + driftX, fy + driftY, fr * 8
      );
      glow.addColorStop(0, `rgba(180, 255, 100, ${fAlpha * 0.6})`);
      glow.addColorStop(0.3, `rgba(150, 230, 80, ${fAlpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(fx + driftX, fy + driftY, fr * 8, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(fx + driftX, fy + driftY, fr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 255, 120, ${fAlpha})`;
      ctx.fill();
    }
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