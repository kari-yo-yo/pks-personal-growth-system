'use client';

import { useEffect, useRef } from 'react';

interface AuroraBand {
  y: number;
  height: number;
  speed: number;
  phase: number;
  amplitude: number;
  color1: string;
  color2: string;
}

interface StarPoint {
  x: number;
  y: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  speed: number;
  brightness: number;
}

export default function AuroraBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const initRef = useRef(false);
  const bandsRef = useRef<AuroraBand[]>([]);
  const starsRef = useRef<StarPoint[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);

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
    };

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Aurora bands — soft, wide curtains of light
    const bands: AuroraBand[] = [
      { y: 0.12, height: 0.22, speed: 0.04, phase: 0, amplitude: 30, color1: '#34d399', color2: '#818cf8' },
      { y: 0.18, height: 0.18, speed: 0.05, phase: 1.2, amplitude: 25, color1: '#6ee7b7', color2: '#a78bfa' },
      { y: 0.08, height: 0.15, speed: 0.03, phase: 2.5, amplitude: 35, color1: '#2dd4bf', color2: '#8b5cf6' },
    ];

    // Stars
    const stars: StarPoint[] = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.7,
      size: 0.4 + Math.random() * 1.5,
      twinklePhase: i * 1.5,
      twinkleSpeed: 0.4 + Math.random() * 1.2,
    }));

    // Fireflies — soft glowing particles
    const fireflies: Firefly[] = Array.from({ length: 15 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      size: 2 + Math.random() * 3,
      phase: i * 2.9,
      speed: 0.2 + Math.random() * 0.3,
      brightness: 0.15 + Math.random() * 0.3,
    }));

    bandsRef.current = bands;
    starsRef.current = stars;
    firefliesRef.current = fireflies;
    initRef.current = true;

    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Deep night sky gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#030810');
      bgGrad.addColorStop(0.4, '#060c18');
      bgGrad.addColorStop(0.7, '#040a14');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ── Aurora bands: soft, undulating curtains ──
      bandsRef.current.forEach((band) => {
        const bandY = band.y * height + Math.sin(time * 0.06 + band.phase) * 15;
        const bandH = band.height * height;

        ctx.save();
        ctx.globalAlpha = 1;

        // Draw aurora as a series of vertical strips with sine-wave displacement
        const stripCount = 60;
        const stripWidth = width / stripCount + 2;

        for (let i = 0; i < stripCount; i++) {
          const x = (i / stripCount) * width;
          const wave = Math.sin(i * 0.08 + time * band.speed + band.phase) * band.amplitude;
          const wave2 = Math.sin(i * 0.05 + time * band.speed * 0.7 + band.phase * 1.3) * band.amplitude * 0.5;
          const totalWave = wave + wave2;

          // Vertical opacity falloff
          const vertProgress = Math.abs((x - width * 0.5) / (width * 0.5));
          const edgeFade = 1 - vertProgress * vertProgress;

          // Strip gradient (top to bottom of aurora band)
          const stripGrad = ctx.createLinearGradient(x, bandY + totalWave * 0.3, x, bandY + bandH + totalWave * 0.5);
          const alpha = 0.06 * edgeFade * (0.6 + Math.sin(time * band.speed * 2 + band.phase + i * 0.1) * 0.4);
          stripGrad.addColorStop(0, 'rgba(52, 211, 153, 0)');
          stripGrad.addColorStop(0.3, `rgba(52, 211, 153, ${alpha})`);
          stripGrad.addColorStop(0.5, `rgba(110, 140, 248, ${alpha * 0.8})`);
          stripGrad.addColorStop(0.7, `rgba(52, 211, 153, ${alpha * 0.5})`);
          stripGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');

          ctx.fillStyle = stripGrad;
          ctx.fillRect(x - stripWidth / 2, bandY + totalWave * 0.3, stripWidth, bandH + totalWave * 0.2);
        }

        ctx.restore();
      });

      // ── Soft aurora glow overlay ──
      const glowY = height * 0.15 + Math.sin(time * 0.05) * height * 0.04;
      const glowGrad = ctx.createRadialGradient(width * 0.5, glowY, 0, width * 0.5, glowY, width * 0.6);
      const glowAlpha = 0.025 + Math.sin(time * 0.08) * 0.01;
      glowGrad.addColorStop(0, `rgba(52, 211, 153, ${glowAlpha})`);
      glowGrad.addColorStop(0.5, `rgba(129, 140, 248, ${glowAlpha * 0.5})`);
      glowGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // ── Stars ──
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
        const alpha = 0.15 + twinkle * 0.55;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 240, 230, ${alpha})`;
        ctx.fill();

        if (star.size > 1) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 5);
          glow.addColorStop(0, `rgba(110, 231, 183, ${alpha * 0.12})`);
          glow.addColorStop(1, 'rgba(110, 231, 183, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ── Fireflies: soft glowing motes ──
      firefliesRef.current.forEach((f) => {
        f.x += f.vx + Math.sin(time * 0.15 + f.phase) * 0.2;
        f.y += f.vy + Math.cos(time * 0.1 + f.phase * 1.3) * 0.15;

        // Wrap around gently
        if (f.x < -30) f.x = width + 30;
        if (f.x > width + 30) f.x = -30;
        if (f.y < -30) f.y = height + 30;
        if (f.y > height + 30) f.y = -30;

        const breathe = f.brightness * (0.4 + Math.sin(time * f.speed + f.phase) * 0.6);

        // Outer glow
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 6);
        glow.addColorStop(0, `rgba(110, 231, 183, ${breathe * 0.25})`);
        glow.addColorStop(0.5, `rgba(110, 231, 183, ${breathe * 0.06})`);
        glow.addColorStop(1, 'rgba(110, 231, 183, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 245, 220, ${breathe * 0.6})`;
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
