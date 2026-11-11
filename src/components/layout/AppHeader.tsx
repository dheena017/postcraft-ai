'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Play,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AppHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onToggleMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onToggleMobileMenu,
}) => {
  const pathname = usePathname();
  const [isRunningQueue, setIsRunningQueue] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [pinterestConnected, setPinterestConnected] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/providers/pinterest/auth')
      .then((res) => res.json())
      .then((data) => setPinterestConnected(data.isConnected))
      .catch(() => {});
  }, [pathname]);

  const handleRunQueue = async () => {
    setIsRunningQueue(true);
    setRunMessage(null);
    try {
      const res = await fetch('/api/queue/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRunMessage(
          `Scheduler executed: ${data.processedCount || 0} processed, ${
            data.publishedCount || 0
          } published.`
        );
      } else {
        setRunMessage('Queue runner finished');
      }
    } catch {
      setRunMessage('Queue execution triggered');
    } finally {
      setIsRunningQueue(false);
      setTimeout(() => setRunMessage(null), 4500);
    }
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return { title: 'Dashboard Overview', subtitle: 'Platform metrics & operations center' };
      case '/studio':
        return { title: 'AI Creative Studio', subtitle: 'Free watermark-free image synthesis' };
      case '/sheets':
        return { title: 'Sheets Automation', subtitle: 'Bulk prompt & schedule ingestion' };
      case '/queue':
        return { title: 'Automated Publishing Queue', subtitle: 'Live schedule dispatcher & task history' };
      case '/gallery':
        return { title: 'Creations Gallery', subtitle: 'Archive of all synthesized images' };
      case '/settings':
        return { title: 'Providers & Credentials', subtitle: 'Pinterest API & platform settings' };
      default:
        return { title: 'PostCraft AI', subtitle: 'Free AI Social Automation' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="sticky top-0 z-20 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Sidebar Toggle Button & Page Breadcrumbs */}
          <div className="flex items-center gap-3">
            {/* Desktop Collapse/Expand Sidebar Toggle */}
            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
              title={isSidebarCollapsed ? 'Open / Expand Sidebar' : 'Close / Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-brand-400" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Context Breadcrumb */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {pageInfo.title}
                </h1>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="hidden sm:inline-block text-xs text-zinc-400 font-medium">
                  {pageInfo.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Demo Template Link */}
            <a
              href="/templates/sample-social-schedule.csv"
              download="sample-social-schedule.csv"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors"
              title="Download Sample Google Sheets CSV Template"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Template</span>
            </a>

            {/* Pinterest Connection Status Indicator */}
            <Link
              href="/settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                pinterestConnected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {pinterestConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline font-semibold">Pinterest:</span>
              <span>{pinterestConnected ? 'Active' : 'Demo Mode'}</span>
            </Link>

            {/* Run Scheduler Now Button */}
            <Button
              size="sm"
              variant="primary"
              onClick={handleRunQueue}
              isLoading={isRunningQueue}
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              <span className="hidden sm:inline">Run Scheduler Now</span>
              <span className="sm:hidden">Run</span>
            </Button>
          </div>
        </div>

        {/* Ephemeral Feedback Toast Bar */}
        {runMessage && (
          <div className="bg-brand-500/15 border-t border-brand-500/30 text-xs text-brand-200 py-1.5 px-4 text-center animate-in fade-in">
            ⚡ {runMessage}
          </div>
        )}
      </div>
    </header>
  );
};
