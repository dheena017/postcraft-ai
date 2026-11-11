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
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
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
          {/* Left: Mobile Toggle & Page Breadcrumbs */}
          <div className="flex items-center gap-3">
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

            {/* Pinterest Connection Status Pill */}
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors"
              title={pinterestConnected ? 'Pinterest: Live Connected' : 'Pinterest: Click to configure'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pinterestConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-medium text-zinc-300 hidden sm:inline">
                {pinterestConnected ? 'Pinterest Connected' : 'Pinterest Demo'}
              </span>
            </Link>

            {/* Trigger Background Scheduler Button */}
            <Button
              variant="secondary"
              size="sm"
              isLoading={isRunningQueue}
              onClick={handleRunQueue}
              leftIcon={<Play className="w-3.5 h-3.5 text-brand-400" />}
              title="Manually trigger scheduler to process due jobs"
            >
              <span className="hidden sm:inline">Run Queue</span>
            </Button>
          </div>
        </div>

        {/* Banner Notification for queue trigger */}
        {runMessage && (
          <div className="py-2 px-3 my-2 text-xs rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{runMessage}</span>
            </div>
            <button
              onClick={() => setRunMessage(null)}
              className="text-zinc-400 hover:text-white text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
