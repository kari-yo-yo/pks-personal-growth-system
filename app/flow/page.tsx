'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/config';
import PageTransition from '@/components/PageTransition';
import {
  Download,
  ExternalLink,
  Info,
  Palette,
  RefreshCw,
  Sparkles,
  Wind,
} from 'lucide-react';

export default function FlowPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setIframeLoaded(false);
    }
  };

  const handleOpenStandalone = () => {
    window.open(assetPath('/art/synaptic-diffusion.html'), '_blank');
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative">

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wind className="w-6 h-6 text-primary" />
            <h1 className="heading-display text-3xl font-bold text-text-primary">突触扩散</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
              生成艺术
            </span>
          </div>
          <p className="text-text-secondary text-sm max-w-2xl">
            基于多层 Perlin 噪声向量场与注意力加权粒子系统的算法生成艺术。
            每一次刷新都是独一无二的神经突触图景——知识的脉冲在噪声场中扩散、衰减、重生。
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-primary hover:bg-surface-light transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重新生成
          </button>
          <button
            onClick={handleOpenStandalone}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-primary hover:bg-surface-light transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            全屏打开
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors ${
              showInfo
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface border-border text-text-primary hover:bg-surface-light'
            }`}
          >
            <Info className="w-4 h-4" />
            创作理念
          </button>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="mb-6 surface p-5 border border-primary/10">
            <div className="flex items-start gap-4">
              <Palette className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-3 text-sm text-text-secondary">
                <p>
                  <span className="text-text-primary font-medium">突触扩散</span>
                  （Synaptic Diffusion）是一种将深度学习注意力机制概念融入生成算法的计算美学运动。
                  粒子代表知识脉冲，在多层 Perlin 噪声构建的向量场中流动。
                </p>
                <p>
                  每个粒子携带不同的
                  <span className="text-text-primary">注意力权重</span>
                  （attentionWeight），高权重粒子沿主流动线稳定前进，低权重粒子则在噪声中随机游走——
                  这正是神经网络中注意力门控机制的算法隐喻。
                </p>
                <p>
                  颜色由速度映射到 HSB 空间：高速粒子呈现炽热的琥珀与洋红，低速粒子沉入靛蓝与紫罗兰。
                  轨迹的透明度叠加形成密度图，揭示出噪声场中隐藏的吸引子与排斥域。
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs text-text-muted">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    技术栈：p5.js · 多层 Perlin 噪声 · 粒子系统 · 种子随机性
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Container */}
        <div className="surface border border-border overflow-hidden">
          {!iframeLoaded && (
            <div className="flex items-center justify-center h-[600px] text-text-muted text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              加载生成引擎...
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={assetPath('/art/synaptic-diffusion.html')}
            className={`w-full h-[600px] border-0 ${iframeLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setIframeLoaded(true)}
            title="突触扩散生成艺术"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-xs text-text-muted text-center">
          提示：在全屏模式下可使用侧边栏参数调节噪声倍频、流速与粒子数量，实时探索不同的突触图景。
        </p>
      </main>
    </div>
    </PageTransition>
  );
}
