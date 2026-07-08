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
import { openInsightFAB } from './InsightFAB';
import MobileNav from './MobileNav';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/galaxy', label: '星图', icon: Sparkles },
  { href: '/wander', label: '漫游', icon: Compass },
  { href: '/knowledge', label: '知识系统', icon: Brain },
  { href: '/topology', label: '拓扑', icon: Network },
  { href: '/notes', label: '笔记', icon: FileText },
  { href: '/papers', label: '论文', icon: GraduationCap },
  { href: '/feynman', label: '费曼卡片', icon: Lightbulb },
  { href: '/insights', label: '灵感速记', icon: Zap },
  { href: '/review', label: '回顾', icon: RefreshCcw },
  { href: '/paths', label: '学习路径', icon: Route },
  { href: '/timeline', label: '时间线', icon: Clock },
  { href: '/analytics', label: '统计', icon: BarChart3 },
  { href: '/replay', label: '回放', icon: Video },
  { href: '/flow', label: '流场', icon: Wind },
  { href: '/daily', label: '每日总结', icon: Calendar },
  { href: '/settings', label: '设置', icon: Settings },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const openSearch = () => {
    openGlobalSearch();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] navbar-glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text-primary text-sm hidden sm:inline">
              个人知识系统
            </span>
          </Link>

          {/* Desktop Nav - horizontal scroll */}
          <div className="hidden md:flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-hide mx-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-sm transition-colors shrink-0 ${
                    isActive
                      ? 'bg-primary/20 text-primary-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-[60px] lg:max-w-none text-xs lg:text-sm">
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search Button + Mobile toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={openSearch}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">搜索</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-text-muted ml-1">
                Ctrl+K
              </kbd>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border glass">
          <div className="px-4 py-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <MobileNav onOpenMenu={() => setMobileOpen(!mobileOpen)} />
    </nav>
  );
}