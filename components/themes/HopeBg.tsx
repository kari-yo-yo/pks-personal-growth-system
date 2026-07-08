'use client';

import { useRef, useEffect, useCallback } from 'react';
import { safeReplace } from '@/lib/safeAccess';

interface GoldenParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
  speedX: number;
  speedY: number;
  driftAmpX: number;
  driftAmpY: number;
}

interface WarmOrb {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
  color1: string;
  color2: string;
}

export default function HopeBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    timeRef.current += 0.016;
    const t = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1a1208');
    bgGrad.addColorStop(0.5, '#2a1a10');
    bgGrad.addColorStop(1, '#1a0a08');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Sun rays - conic-gradient from top-right
    const rayCenterX = width * 0.85;
    const rayCenterY = height * 0.08;

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + t * 0.015;
      const rayLength = width * (0.5 + 0.3 * Math.sin(i * 0.5 + t * 0.02));
      const alpha = 0.015 + Math.sin(i * 1.1) * 0.008;

      ctx.save();
      ctx.translate(rayCenterX, rayCenterY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(rayLength, -2);
      ctx.lineTo(rayLength, 2);
      ctx.closePath();
      ctx.fillStyle = `rgba(245, 189, 50, ${Math.max(0, alpha)})`;
      ctx.fill();
      ctx.restore();
    }

    // 3. Warm glow orbs (pink sandbar tropical feel)
    const orbs: WarmOrb[] = [
      {
        x: width * 0.25, y: height * 0.6, radius: width * 0.35,
        alpha: 0.12, pulseSpeed: 0.3, phase: 0,
        color1: 'rgba(245, 158, 11, ALPHA)',
        color2: 'rgba(251, 146, 60, ALPHA)',
      },
      {
        x: width * 0.7, y: height * 0.45, radius: width * 0.25,
        alpha: 0.10, pulseSpeed: 0.25, phase: 1.5,
        color1: 'rgba(251, 191, 36, ALPHA)',
        color2: 'rgba(245, 158, 11, ALPHA)',
      },
      {
        x: width * 0.5, y: height * 0.8, radius: width * 0.3,
        alpha: 0.08, pulseSpeed: 0.35, phase: 3.0,
        color1: 'rgba(236, 72, 153, ALPHA)',
        color2: 'rgba(251, 146, 60, ALPHA)',
      },
      {
        x: width * 0.1, y: height * 0.2, radius: width * 0.2,
        alpha: 0.07, pulseSpeed: 0.2, phase: 4.5,
        color1: 'rgba(253, 230, 138, ALPHA)',
        color2: 'rgba(245, 158, 11, ALPHA)',
      },
    ];

    orbs.forEach((orb) => {
      const pulse = Math.sin(t * orb.pulseSpeed + orb.phase) * 0.3 + 0.7;
      const currentAlpha = orb.alpha * pulse;
      const driftX = Math.sin(t * 0.05 + orb.phase) * 15;
      const driftY = Math.cos(t * 0.04 + orb.phase) * 10;

      const grad = ctx.createRadialGradient(
        orb.x + driftX, orb.y + driftY, 0,
        orb.x + driftX, orb.y + driftY, orb.radius
      );
      const c1 = safeReplace(orb.color1, 'ALPHA', (currentAlpha * 0.8).toString());
      const c2 = safeReplace(orb.color2, 'ALPHA', (currentAlpha * 0.3).toString());
      grad.addColorStop(0, c1);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(orb.x + driftX - orb.radius, orb.y + driftY - orb.radius, orb.radius * 2, orb.radius * 2);
    });

    // 4. Golden particles floating
    const particleCount = 35;
    for (let i = 0; i < particleCount; i++) {
      const seed = i * 53.7;
      const px = ((seed * 17.3) % width);
      const py = ((seed * 11.9) % height);
      const pr = 1 + (seed % 3) * 0.5;
      const pulse = 0.3 + Math.sin(t * (0.3 + (seed % 5) * 0.05) + i * 0.7) * 0.25;
      const alpha = Math.max(0, pulse);
      const driftX = Math.sin(t * 0.1 + i * 0.8) * 25;
      const driftY = Math.cos(t * 0.08 + i * 0.6) * 15 + t * 5 % 30 - 15;

      // Glow
      const glow = ctx.createRadialGradient(
        px + driftX, py + driftY, 0,
        px + driftX, py + driftY, pr * 5
      );
      glow.addColorStop(0, `rgba(253, 224, 71, ${alpha * 0.5})`);
      glow.addColorStop(0.5, `rgba(251, 191, 36, ${alpha * 0.2})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px + driftX, py + driftY, pr * 5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(px + driftX, py + driftY, pr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253, 230, 138, ${alpha})`;
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