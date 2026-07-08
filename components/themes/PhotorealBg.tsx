'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface DrawEffect {
  (ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void;
}

export interface BreathingConfig {
  period: number;      // seconds for one full breath cycle
  minBrightness: number; // 0-1, e.g. 0.92
  maxBrightness: number; // 0-1, e.g. 1.08
  minSaturate?: number;
  maxSaturate?: number;
}

interface PhotorealBgProps {
  imageSrc: string;
  fallbackGradient: string;
  drawEffect: DrawEffect;
  overlayOpacity?: number;
  blendMode?: string;
  breathing?: BreathingConfig;
  bottomFade?: boolean;
  darkOverlay?: number;  // 0-1, default 0.4
}

export default function PhotorealBg({
  imageSrc,
  fallbackGradient,
  drawEffect,
  overlayOpacity = 0.6,
  blendMode = 'screen',
  breathing,
  bottomFade = true,
  darkOverlay = 0.4,
}: PhotorealBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [imgReady, setImgReady] = useState(false);
  const [imgError, setImgError] = useState(false);
  const breathingTimeRef = useRef(0);

  // Preload image
  useEffect(() => {
    setImgReady(false);
    setImgError(false);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgError(true);
  }, [imageSrc]);

  const runEffect = useCallback(drawEffect, [drawEffect]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf: number;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min((now - last) * 0.001, 0.05);
      last = now;
      const t = now * 0.001;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);
      runEffect(ctx, w, h, t);

      // Update breathing CSS filter
      if (breathing && bgRef.current) {
        breathingTimeRef.current += dt;
        const phase = (breathingTimeRef.current % breathing.period) / breathing.period;
        const sine = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
        const brightness = breathing.minBrightness + sine * (breathing.maxBrightness - breathing.minBrightness);
        const saturate = breathing.minSaturate !== undefined && breathing.maxSaturate !== undefined
          ? breathing.minSaturate + sine * (breathing.maxSaturate - breathing.minSaturate)
          : 1;
        bgRef.current.style.filter = `brightness(${brightness.toFixed(3)}) saturate(${saturate.toFixed(3)})`;
      } else if (bgRef.current) {
        bgRef.current.style.filter = 'none';
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [runEffect, breathing]);

  const showImage = imgReady && !imgError;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 实景图 - 加载完成后显示 */}
      {showImage && (
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1500ms]"
          style={{
            backgroundImage: `url(${imageSrc})`,
            opacity: 1,
            willChange: breathing ? 'filter' : undefined,
          }}
        />
      )}
      {/* 降级：纯色/渐变背景 */}
      {(!showImage || imgError) && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ background: fallbackGradient }}
        />
      )}
      {/* 暗色遮罩，保证内容可读 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: `rgba(0,0,0,${darkOverlay})` }}
      />
      {/* 动态叠加 Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: blendMode as any,
          opacity: overlayOpacity,
          pointerEvents: 'none',
        }}
      />
      {/* 底部暗化渐变，确保底部文字可读 */}
      {bottomFade && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
          }}
        />
      )}
    </div>
  );
}
