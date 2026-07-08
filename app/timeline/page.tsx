'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  getTimelineEvents,
  groupEventsByDate,
  getTimelineStats,
  TimelineEvent,
  TimelineEventType,
} from '@/lib/timeline';
import { load } from '@/lib/db';
import {
  Brain,
  Calendar,
  Clock,
  FileText,
  Filter,
  GraduationCap,
  Route,
  TrendingUp,
  Zap,
} from 'lucide-react';

const TYPE_FILTERS: { type: TimelineEventType; label: string; color: string; icon: React.ElementType }[] = [
  { type: 'node', label: '知识节点', color: '#6366f1', icon: Brain },
  { type: 'note', label: '笔记', color: '#10b981', icon: FileText },
  { type: 'paper', label: '论文', color: '#f59e0b', icon: GraduationCap },
  { type: 'insight', label: '灵感', color: '#ec4899', icon: Zap },
  { type: 'path', label: '路径', color: '#8b5cf6', icon: Route },
  { type: 'summary', label: '总结', color: '#06b6d4', icon: Calendar },
];

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TimelineEventType | 'all'>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function init() {
      load().catch(() => {});
      const allEvents = getTimelineEvents();
      setEvents(allEvents);
      setLoading(false);
    }
    init();
  }, []);

  // Canvas background: flowing particles along a vertical axis
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const c = canvas;
    const context = ctx;

    let animId: number;
    const resize = () => {
      c.width = c.offsetWidth * window.devicePixelRatio;
      c.height = c.offsetHeight * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
      hue: number;
    }

    const particles: Particle[] = [];
    const spawnRate = 0.4;
    const centerX = () => c.offsetWidth * 0.15;

    function spawnParticle() {
      const hue = Math.random() > 0.5 ? 240 : 180 + Math.random() * 60;
      particles.push({
        x: centerX() + (Math.random() - 0.5) * 40,
        y: -10,
        vy: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 2,
        alpha: 0,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        hue,
      });
    }

    function draw() {
      const w = c.offsetWidth;
      const h = c.offsetHeight;
      context.clearRect(0, 0, w, h);

      // Draw faint timeline axis
      context.beginPath();
      context.moveTo(centerX(), 0);
      context.lineTo(centerX(), h);
      context.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      context.lineWidth = 1;
      context.setLineDash([4, 8]);
      context.stroke();
      context.setLineDash([]);

      // Spawn
      if (Math.random() < spawnRate) spawnParticle();

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.y += p.vy;

        // Fade in/out
        if (p.life < 30) p.alpha = p.life / 30;
        else if (p.life > p.maxLife - 60) p.alpha = (p.maxLife - p.life) / 60;
        else p.alpha = 1;

        // Drift
        p.x += Math.sin(p.life * 0.02 + p.y * 0.005) * 0.3;

        if (p.life >= p.maxLife || p.y > h + 10) {
          particles.splice(i, 1);
          continue;
        }

        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha * 0.5})`;
        context.fill();

        // Trail
        context.beginPath();
        context.moveTo(p.x, p.y);
        context.lineTo(p.x, p.y - p.vy * 8);
        context.strokeStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha * 0.15})`;
        context.lineWidth = p.size * 0.5;
        context.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => e.type === activeFilter);
  }, [events, activeFilter]);

  const grouped = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents]);
  const stats = useMemo(() => getTimelineStats(events), [events]);

  return (
    <div className="min-h-screen relative">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />


      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">知识时间线</h1>
          </div>
          <p className="text-sm text-text-secondary">
            追溯每一步成长的足迹，从知识节点到灵感闪光，所有学习活动一目了然。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="总事件" value={stats.total} icon={TrendingUp} color="#6366f1" />
          <StatCard label="本周" value={stats.thisWeek} icon={Clock} color="#10b981" />
          <StatCard label="本月" value={stats.thisMonth} icon={Calendar} color="#f59e0b" />
          <StatCard label="知识节点" value={stats.counts.node} icon={Brain} color="#8b5cf6" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-primary/20 text-primary-light border border-primary/30'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Filter className="w-3 h-3 inline mr-1" />
            全部
          </button>
          {TYPE_FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.type;
            return (
              <button
                key={f.type}
                onClick={() => setActiveFilter(isActive ? 'all' : f.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white border'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
                style={
                  isActive
                    ? { backgroundColor: f.color + '30', borderColor: f.color + '60', color: f.color }
                    : undefined
                }
              >
                <Icon className="w-3 h-3" />
                {f.label} ({stats.counts[f.type]})
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="text-center py-20 text-text-muted">加载时间线...</div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">暂无时间线事件</p>
            <p className="text-xs text-text-secondary mt-1">
              开始记录知识、笔记或灵感，时间线将自动呈现你的成长轨迹
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-border"
              style={{ left: 'calc(15% - 0.5px)' }}
            />

            {grouped.map((group) => (
              <div key={group.date} className="mb-8">
                {/* Date header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-[15%] flex justify-end pr-4">
                    <span className="text-xs font-medium text-text-muted whitespace-nowrap">
                      {group.date}
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20" />
                </div>

                {/* Events */}
                <div className="space-y-3">
                  {group.events.map((event) => (
                    <TimelineItem key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const timeStr = event.timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const typeConfig = TYPE_FILTERS.find((t) => t.type === event.type);

  return (
    <div className="flex items-start gap-4">
      {/* Time */}
      <div className="w-[15%] flex justify-end pr-4 pt-3">
        <span className="text-[10px] text-text-muted font-mono">{timeStr}</span>
      </div>

      {/* Dot */}
      <div className="relative flex flex-col items-center pt-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: event.color,
            boxShadow: `0 0 0 2px ${event.color}40`,
          }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0">
        <Link href={event.link}>
          <div className="glass rounded-xl p-4 card-hover border border-border/50 hover:border-border transition-colors">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: event.color + '15' }}
              >
                {typeConfig && (
                  <typeConfig.icon className="w-4 h-4" style={{ color: event.color }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-text-primary truncate">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                    {event.description}
                  </p>
                )}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(event.metadata).map(
                      ([key, value]) =>
                        value !== undefined && (
                          <span
                            key={key}
                            className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text-muted"
                          >
                            {key}: {value}
                          </span>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}
