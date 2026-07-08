'use client';

import { useEffect, useRef } from 'react';

/**
 * Neural Synapse Background
 * ─────────────────────────
 * Algorithmic art: neurons as nodes, synaptic connections pulse between them.
 * Particles travel along connections simulating signal propagation.
 * Inspired by biological neural networks — the visual metaphor for "insights".
 *
 * Crafted with layered Perlin noise fields controlling node drift,
 * distance-based connection opacity, and traveling pulse particles
 * that create emergent brain-like patterns.
 */

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface SynapseParticle {
  fromIdx: number;
  toIdx: number;
  t: number;
  speed: number;
  life: number;
}

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const neuronsRef = useRef<Neuron[]>([]);
  const particlesRef = useRef<SynapseParticle[]>([]);
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = container.clientWidth;
    let h = container.clientHeight;
    canvas.width = w;
    canvas.height = h;

    // ─── 初始化神经元 ───
    const NEURON_COUNT = Math.min(Math.floor((w * h) / 18000), 60);
    const neurons: Neuron[] = [];
    const seed = 42;

    // 简易 seeded random
    let _s = seed;
    function srand() {
      _s = (_s * 16807 + 0) % 2147483647;
      return (_s - 1) / 2147483646;
    }

    for (let i = 0; i < NEURON_COUNT; i++) {
      neurons.push({
        x: srand() * w,
        y: srand() * h,
        vx: (srand() - 0.5) * 0.3,
        vy: (srand() - 0.5) * 0.3,
        radius: 2 + srand() * 2.5,
        pulsePhase: srand() * Math.PI * 2,
        pulseSpeed: 0.01 + srand() * 0.02,
      });
    }
    neuronsRef.current = neurons;

    // ─── 连接距离阈值 ───
    const CONNECTION_DIST = 160;
    const particles: SynapseParticle[] = [];
    particlesRef.current = particles;

    // ─── Perlin-like 简易噪声 ───
    function noise2D(x: number, y: number): number {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    }

    // ─── 动画循环 ───
    function animate() {
      frameRef.current++;
      ctx!.clearRect(0, 0, w, h);

      const t = frameRef.current * 0.005;

      // 更新神经元位置（噪声漂移）
      for (const n of neurons) {
        const angle = noise2D(n.x * 0.003 + t, n.y * 0.003) * Math.PI * 4;
        n.vx += Math.cos(angle) * 0.02;
        n.vy += Math.sin(angle) * 0.02;
        n.vx *= 0.98;
        n.vy *= 0.98;
        n.x += n.vx;
        n.y += n.vy;

        // 边界反弹
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));

        n.pulsePhase += n.pulseSpeed;
      }

      // ─── 绘制突触连接 ───
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const dx = neurons[i].x - neurons[j].x;
          const dy = neurons[i].y - neurons[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(neurons[i].x, neurons[i].y);
            ctx!.lineTo(neurons[j].x, neurons[j].y);
            ctx!.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();

            // 概率生成脉冲粒子
            if (Math.random() < 0.002 && particles.length < 30) {
              particles.push({
                fromIdx: i,
                toIdx: j,
                t: 0,
                speed: 0.005 + Math.random() * 0.01,
                life: 1,
              });
            }
          }
        }
      }

      // ─── 绘制脉冲粒子 ───
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed;
        p.life -= 0.008;

        if (p.t >= 1 || p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const from = neurons[p.fromIdx];
        const to = neurons[p.toIdx];
        const px = from.x + (to.x - from.x) * p.t;
        const py = from.y + (to.y - from.y) * p.t;

        const glow = ctx!.createRadialGradient(px, py, 0, px, py, 6);
        glow.addColorStop(0, `rgba(139, 92, 246, ${p.life * 0.9})`);
        glow.addColorStop(0.5, `rgba(99, 102, 241, ${p.life * 0.4})`);
        glow.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx!.beginPath();
        ctx!.arc(px, py, 6, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();

        // 亮点
        ctx!.beginPath();
        ctx!.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 200, 255, ${p.life * 0.8})`;
        ctx!.fill();
      }

      // ─── 绘制神经元 ───
      for (const n of neurons) {
        const pulse = 0.6 + 0.4 * Math.sin(n.pulsePhase);

        // 外发光
        const glow = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 4);
        glow.addColorStop(0, `rgba(99, 102, 241, ${0.12 * pulse})`);
        glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.radius * 4, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();

        // 核心
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.radius * pulse, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(129, 140, 248, ${0.5 * pulse})`;
        ctx!.fill();

        // 中心亮点
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.radius * 0.4 * pulse, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 210, 255, ${0.7 * pulse})`;
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    // Resize
    function onResize() {
      if (!container || !canvas) return;
      w = container.clientWidth;
      h = container.clientHeight;
      canvas.width = w;
      canvas.height = h;
    }

    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <canvas ref={canvasRef} className="w-full h-full" style={{ willChange: 'transform' }} />
    </div>
  );
}
