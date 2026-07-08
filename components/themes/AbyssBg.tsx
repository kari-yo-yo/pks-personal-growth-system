'use client';

import { useEffect, useRef } from 'react';

interface GlowPoint {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  brightness: number;
}

interface LightBeam {
  x: number;
  angle: number;
  width: number;
  length: number;
  phase: number;
  speed: number;
  opacity: number;
}

export default function AbyssBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const pointsRef = useRef<GlowPoint[]>([]);
  const beamsRef = useRef<LightBeam[]>([]);
  const initRef = useRef(false);

  useEffect(() => {
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

      // Reinitialize on resize
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (!initRef.current) {
        pointsRef.current = Array.from({ length: 30 }, (_, i) => ({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 1 + Math.random() * 3,
          phase: i * 2.1,
          speed: 0.15 + Math.random() * 0.25,
          brightness: 0.2 + Math.random() * 0.6,
        }));

        beamsRef.current = Array.from({ length: 3 }, (_, i) => ({
          x: w * (0.2 + i * 0.3),
          angle: -0.15 + Math.random() * 0.3,
          width: 40 + Math.random() * 80,
          length: h * (0.5 + Math.random() * 0.5),
          phase: i * 1.7,
          speed: 0.03 + Math.random() * 0.02,
          opacity: 0.02 + Math.random() * 0.03,
        }));
        initRef.current = true;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#06080e');
      bgGrad.addColorStop(0.5, '#080c18');
      bgGrad.addColorStop(1, '#06080e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Light beams from above
      beamsRef.current.forEach((beam) => {
        const pulse = beam.opacity * (0.6 + Math.sin(time * beam.speed + beam.phase) * 0.4);
        const sway = Math.sin(time * 0.02 + beam.phase) * 20;

        ctx.save();
        ctx.translate(beam.x + sway, 0);
        ctx.rotate(beam.angle + Math.sin(time * 0.01 + beam.phase) * 0.05);

        const beamGrad = ctx.createLinearGradient(0, 0, 0, beam.length);
        beamGrad.addColorStop(0, `rgba(56, 189, 248, ${pulse})`);
        beamGrad.addColorStop(0.3, `rgba(56, 189, 248, ${pulse * 0.4})`);
        beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-beam.width / 2, 0);
        ctx.lineTo(beam.width / 2, 0);
        ctx.lineTo(beam.width * 1.5, beam.length);
        ctx.lineTo(-beam.width, beam.length);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // Floating glow points (bioluminescence)
      pointsRef.current.forEach((p) => {
        const breathe = (Math.sin(time * p.speed + p.phase) * 0.5 + 0.5) * p.brightness;
        const driftX = Math.sin(time * 0.05 + p.phase) * 15;
        const driftY = Math.cos(time * 0.03 + p.phase * 1.3) * 10;
        const x = p.x + driftX;
        const y = p.y + driftY;

        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 8);
        glow.addColorStop(0, `rgba(56, 189, 248, ${breathe * 0.3})`);
        glow.addColorStop(0.5, `rgba(56, 189, 248, ${breathe * 0.08})`);
        glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125, 211, 252, ${breathe})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

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
