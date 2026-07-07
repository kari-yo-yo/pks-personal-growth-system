'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

export default function WanderBackground({ themeColor = '#6366f1' }: { themeColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const colorRef = useRef(themeColor);

  useEffect(() => {
    colorRef.current = themeColor;
  }, [themeColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const c = canvas;
    const context = ctx;

    let animationId: number;
    let w = 0;
    let h = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      const count = Math.min(Math.floor((w * h) / 25000), 80);
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        });
      }
      particlesRef.current = particles;
    }

    function hexToRgb(hex: string) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 99, g: 102, b: 241 };
    }

    function draw() {
      const c = canvas;
      const context = ctx;
      if (!c || !context) return;

      context.clearRect(0, 0, w, h);

      const rgb = hexToRgb(colorRef.current);
      const particles = particlesRef.current;
      const centerX = w / 2;
      const centerY = h / 2;

      // Update & draw connections first
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(q.x, q.y);
            context.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            context.lineWidth = 0.5;
            context.stroke();
          }
        }
      }

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gentle drift toward center
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const distToCenter = Math.sqrt(dx * dx + dy * dy);
        if (distToCenter > 0) {
          p.vx += (dx / distToCenter) * 0.002;
          p.vy += (dy / distToCenter) * 0.002;
        }

        // Mouse repulsion
        const mdx = p.x - mouseRef.current.x;
        const mdy = p.y - mouseRef.current.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 150 && mDist > 0) {
          const force = (1 - mDist / 150) * 0.5;
          p.vx += (mdx / mDist) * force;
          p.vy += (mdy / mDist) * force;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Pulse
        p.pulse += p.pulseSpeed;
        const pulseFactor = Math.sin(p.pulse) * 0.3 + 0.7;
        const r = p.radius * pulseFactor;

        // Draw glow
        const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        context.beginPath();
        context.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();

        // Draw core
        context.beginPath();
        context.arc(p.x, p.y, r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha + 0.2})`;
        context.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
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
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
