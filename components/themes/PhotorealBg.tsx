'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface DrawEffect {
  (ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void;
}

interface PhotorealBgProps {
  imageSrc: string;
  fallbackGradient: string;
  drawEffect: DrawEffect;
  overlayOpacity?: number;
  blendMode?: string;
}

export default function PhotorealBg({
  imageSrc,
  fallbackGradient,
  drawEffect,
  overlayOpacity = 0.6,
  blendMode = 'screen',
}: PhotorealBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgReady, setImgReady] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 预加载图片
  useEffect(() => {
    setImgReady(false);
    setImgError(false);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgError(true);
  }, [imageSrc]);

  const runEffect = useCallback(drawEffect, [drawEffect]);

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
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      runEffect(ctx, w, h, now * 0.001);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [runEffect]);

  const showImage = imgReady && !imgError;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 实景图 - 加载完成后淡入 */}
      {showImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1500ms]"
          style={{
            backgroundImage: `url(${imageSrc})`,
            opacity: 1,
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
      <div className="absolute inset-0 bg-black/40" />
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
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
