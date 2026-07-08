'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Home,
  Lightbulb,
  Menu,
  Network,
  RefreshCcw,
  Route,
  Search,
  Settings,
  Sparkles,
  Video,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { openGlobalSearch } from './GlobalSearch';
import MobileNav from './MobileNav';

/* ── Primary nav items (always visible on desktop) ── */
const primaryNav = [
  { href: '/', label: '首页', icon: Home },
  { href: '/knowledge', label: '知识', icon: Brain },
  { href: '/notes', label: '笔记', icon: FileText },
  { href: '/feynman', label: '费曼', icon: Lightbulb },
  { href: '/galaxy', label: '星图', icon: Sparkles },
  { href: '/daily', label: '总结', icon: Calendar },
];

/* ── Secondary nav items (in "more" dropdown / mobile drawer) ── */
const secondaryNav = [
  { href: '/papers', label: '论文', icon: GraduationCap },
  { href: '/insights', label: '灵感速记', icon: Zap },
  { href: '/topology', label: '拓扑', icon: Network },
  { href: '/paths', label: '学习路径', icon: Route },
  { href: '/flow', label: '流场', icon: Wind },
  { href: '/wander', label: '漫游', icon: Compass },
  { href: '/timeline', label: '时间线', icon: Clock },
  { href: '/analytics', label: '统计', icon: BarChart3 },
  { href: '/replay', label: '回放', icon: Video },
  { href: '/review', label: '回顾', icon: RefreshCcw },
  { href: '/settings', label: '设置', icon: Settings },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  const isPrimaryActive = primaryNav.some((i) => i.href === pathname);
  const isSecondaryActive = secondaryNav.some((i) => i.href === pathname);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] navbar-glass border-b border-[var(--color-border)]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 pressable rounded-lg">
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-semibold text-[var(--color-text-primary)] text-sm hidden sm:inline heading-display">
              个人知识系统
            </span>
          </Link>

          {/* Desktop Primary Nav */}
          <div className="hidden md:flex items-center gap-0.5 mx-4">
            {primaryNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`pressable flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                className={`pressable flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isSecondaryActive
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                }`}
                aria-label="更多功能"
                aria-expanded={moreOpen}
              >
                <span className="hidden lg:inline">更多</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 surface-raised py-1 z-[200]">
                  {secondaryNav.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'text-[var(--color-primary-light)] bg-[var(--color-primary)]/10'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Search + Mobile toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={openGlobalSearch}
              className="pressable flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
              aria-label="搜索"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">搜索</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] ml-1">
                Ctrl+K
              </kbd>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] pressable"
              aria-label="打开菜单"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] navbar-glass">
          <div className="px-4 py-2 space-y-0.5 max-h-[60vh] overflow-y-auto">
            {[...primaryNav, ...secondaryNav].map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <MobileNav onOpenMenu={() => setMobileOpen(!mobileOpen)} />
    </nav>
  );
}
