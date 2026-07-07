'use client';

import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import { load } from '@/lib/db';
import {
  getDailyActivity,
  getModuleDistribution,
  getTagFrequencies,
  getHourlyActivity,
  getKnowledgeTreeStats,
  getPathProgress,
  getWeeklyTrend,
  DailyActivity,
  ModuleDistribution,
  TagFrequency,
  HourlyActivity,
  KnowledgeTreeStats,
  PathProgress,
} from '@/lib/analytics';
import {
  BarChart3,
  Brain,
  GitBranch,
  Leaf,
  Layers,
  TrendingUp,
  TreePine,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<DailyActivity[]>([]);
  const [modules, setModules] = useState<ModuleDistribution[]>([]);
  const [tags, setTags] = useState<TagFrequency[]>([]);
  const [hourly, setHourly] = useState<HourlyActivity[]>([]);
  const [treeStats, setTreeStats] = useState<KnowledgeTreeStats | null>(null);
  const [paths, setPaths] = useState<PathProgress[]>([]);
  const [weekly, setWeekly] = useState<{ week: string; count: number }[]>([]);

  const trendCanvasRef = useRef<HTMLCanvasElement>(null);
  const pieCanvasRef = useRef<HTMLCanvasElement>(null);
  const tagCanvasRef = useRef<HTMLCanvasElement>(null);
  const hourCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function init() {
      load().catch(() => {});
      setDaily(getDailyActivity(30));
      setModules(getModuleDistribution());
      setTags(getTagFrequencies(15));
      setHourly(getHourlyActivity());
      setTreeStats(getKnowledgeTreeStats());
      setPaths(getPathProgress());
      setWeekly(getWeeklyTrend());
      setLoading(false);
    }
    init();
  }, []);

  // Draw weekly trend line chart
  useEffect(() => {
    if (loading || weekly.length === 0) return;
    const canvas = trendCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...weekly.map((d) => d.count), 1);
    const dataPoints = weekly.map((d, i) => ({
      x: padding.left + (i / (weekly.length - 1)) * chartW,
      y: padding.top + chartH - (d.count / maxVal) * chartH,
      count: d.count,
    }));

    // Grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(dataPoints[0].x, padding.top + chartH);
    dataPoints.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(dataPoints[dataPoints.length - 1].x, padding.top + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
    grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    dataPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Points
    dataPoints.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      // X labels every 3rd
      if (i % 3 === 0 || i === weekly.length - 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.count.toString(), p.x, p.y - 8);
      }
    });

    // Y axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxVal * (4 - i)) / 4);
      const y = padding.top + (chartH * i) / 4;
      ctx.fillText(val.toString(), padding.left - 8, y + 3);
    }
  }, [loading, weekly]);

  // Draw module distribution pie chart
  useEffect(() => {
    if (loading || modules.length === 0) return;
    const canvas = pieCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.75;
    const innerRadius = radius * 0.55;

    const total = modules.reduce((a, b) => a + b.value, 0);
    let startAngle = -Math.PI / 2;

    modules.forEach((m) => {
      const angle = (m.value / total) * Math.PI * 2;
      const endAngle = startAngle + angle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = m.color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('总计', centerX, centerY + 10);
  }, [loading, modules]);

  // Draw tag frequency horizontal bar chart
  useEffect(() => {
    if (loading || tags.length === 0) return;
    const canvas = tagCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = tags.length * 28 + 20;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const maxCount = Math.max(...tags.map((t) => t.count), 1);
    const labelW = 80;
    const barMaxW = w - labelW - 50;

    tags.forEach((tag, i) => {
      const y = 10 + i * 28;
      const barW = (tag.count / maxCount) * barMaxW;

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(tag.tag, labelW - 8, y + 14);

      // Bar
      ctx.fillStyle = '#6366f1';
      roundRect(ctx, labelW, y + 4, barW, 16, 4);
      ctx.fill();

      // Count
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tag.count.toString(), labelW + barW + 8, y + 14);
    });
  }, [loading, tags]);

  // Draw hourly activity heatmap-style bars
  useEffect(() => {
    if (loading || hourly.length === 0) return;
    const canvas = hourCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const maxCount = Math.max(...hourly.map((h) => h.count), 1);
    const barW = (w - 40) / 24;
    const maxBarH = h - 40;

    hourly.forEach((hour, i) => {
      const x = 20 + i * barW;
      const barH = (hour.count / maxCount) * maxBarH;
      const y = h - 20 - barH;

      const intensity = hour.count / maxCount;
      ctx.fillStyle = `hsla(240, 70%, ${40 + intensity * 30}%, ${0.4 + intensity * 0.6})`;
      roundRect(ctx, x + 1, y, barW - 2, barH, 2);
      ctx.fill();

      // Hour label every 3
      if (i % 3 === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${i}`, x + barW / 2, h - 5);
      }
    });
  }, [loading, hourly]);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">统计洞察</h1>
          </div>
          <p className="text-sm text-text-secondary">
            数据驱动的学习分析，看清你的知识增长轨迹与学习习惯。
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-text-muted">加载统计数据...</div>
        ) : (
          <>
            {/* Weekly Trend */}
            <div className="glass rounded-2xl p-5 mb-6">
              <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                12周趋势
              </h2>
              <canvas
                ref={trendCanvasRef}
                className="w-full"
                style={{ height: 200 }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Module Distribution */}
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-medium text-text-primary mb-4">模块分布</h2>
                <div className="flex items-center gap-6">
                  <canvas
                    ref={pieCanvasRef}
                    className="shrink-0"
                    style={{ width: 160, height: 160 }}
                  />
                  <div className="space-y-2">
                    {modules.map((m) => (
                      <div key={m.name} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        <span className="text-text-secondary">{m.name}</span>
                        <span className="text-text-primary font-mono ml-auto">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Knowledge Tree Stats */}
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-success" />
                  知识树结构
                </h2>
                {treeStats && treeStats.maxDepth > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <TreeStat label="最大深度" value={treeStats.maxDepth} icon={Layers} />
                    <TreeStat label="平均深度" value={treeStats.avgDepth} icon={BarChart3} />
                    <TreeStat label="根节点" value={treeStats.rootNodes} icon={TreePine} />
                    <TreeStat label="叶子节点" value={treeStats.leafNodes} icon={Leaf} />
                    <TreeStat label="关联数" value={treeStats.totalRelations} icon={GitBranch} />
                    <TreeStat label="总节点" value={treeStats.leafNodes + treeStats.rootNodes} icon={Brain} />
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">暂无知识节点数据</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Tag Frequency */}
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-medium text-text-primary mb-4">热门标签</h2>
                {tags.length > 0 ? (
                  <canvas
                    ref={tagCanvasRef}
                    className="w-full"
                    style={{ height: tags.length * 28 + 20 }}
                  />
                ) : (
                  <p className="text-sm text-text-muted">暂无标签数据</p>
                )}
              </div>

              {/* Hourly Activity */}
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-medium text-text-primary mb-4">活跃时段</h2>
                <canvas
                  ref={hourCanvasRef}
                  className="w-full"
                  style={{ height: 140 }}
                />
                <p className="text-[10px] text-text-muted mt-2 text-center">0时 - 23时</p>
              </div>
            </div>

            {/* Path Progress */}
            {paths.length > 0 && (
              <div className="glass rounded-2xl p-5 mb-6">
                <h2 className="text-sm font-medium text-text-primary mb-4">学习路径进度</h2>
                <div className="space-y-4">
                  {paths.map((path) => {
                    const pct = path.total > 0 ? (path.completed / path.total) * 100 : 0;
                    return (
                      <div key={path.title}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-text-secondary">{path.title}</span>
                          <span className="text-text-muted">
                            {path.completed}/{path.total} ({Math.round(pct)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: path.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Activity Table */}
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-medium text-text-primary mb-4">近30日活动</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-muted border-b border-border">
                      <th className="text-left py-2 px-2">日期</th>
                      <th className="text-center py-2 px-2">节点</th>
                      <th className="text-center py-2 px-2">笔记</th>
                      <th className="text-center py-2 px-2">论文</th>
                      <th className="text-center py-2 px-2">灵感</th>
                      <th className="text-center py-2 px-2">路径</th>
                      <th className="text-center py-2 px-2">总结</th>
                      <th className="text-center py-2 px-2 font-medium">合计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily
                      .filter((d) => d.total > 0)
                      .slice(0, 10)
                      .map((d) => (
                        <tr key={d.date} className="border-b border-border/50 hover:bg-surface-light/50">
                          <td className="py-2 px-2 text-text-secondary">{d.date}</td>
                          <td className="text-center py-2 px-2 text-text-muted">{d.nodes || '-'}</td>
                          <td className="text-center py-2 px-2 text-text-muted">{d.notes || '-'}</td>
                          <td className="text-center py-2 px-2 text-text-muted">{d.papers || '-'}</td>
                          <td className="text-center py-2 px-2 text-text-muted">{d.insights || '-'}</td>
                          <td className="text-center py-2 px-2 text-text-muted">{d.paths || '-'}</td>
                          <td className="text-center py-2 px-2 text-text-muted">{d.summaries || '-'}</td>
                          <td className="text-center py-2 px-2 text-primary font-medium">{d.total}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {daily.filter((d) => d.total > 0).length === 0 && (
                  <p className="text-sm text-text-muted py-4 text-center">近30日暂无活动记录</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function TreeStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
      <div className="text-lg font-bold text-text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
