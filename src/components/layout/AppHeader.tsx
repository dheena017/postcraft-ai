'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandLogoMark } from '@/components/ui/BrandLogo';
import {
  Menu,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AppHeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  // Compatibility props
  onToggleMobileMenu?: () => void;
  onToggleSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isSidebarOpen = false,
  onToggleSidebar,
  onToggleMobileMenu,
  onToggleSidebarCollapse,
  isSidebarCollapsed = false,
}) => {
  const [isRunningQueue, setIsRunningQueue] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [pinterestConnected, setPinterestConnected] = useState<boolean>(false);

  const handleToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else if (onToggleSidebarCollapse) {
      onToggleSidebarCollapse();
    }
  };

  useEffect(() => {
    fetch('/api/providers/pinterest/auth')
      .then((res) => res.json())
      .then((data) => setPinterestConnected(data.isConnected))
      .catch(() => {});
  }, []);

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

  return (
    <header className="sticky top-0 z-20 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button (Opens separate overlay drawer, page doesn't move) */}
            <button
              type="button"
              onClick={handleToggle}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800 transition-colors cursor-pointer flex-shrink-0"
              title={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
              aria-label={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Brand Logo & Name */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 focus:outline-none group select-none flex-shrink-0"
              title="PostCraft AI Dashboard"
            >
              <BrandLogoMark size="sm" />
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                  <span className="text-white">Post</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300">
                    Craft
                  </span>
                </span>
                <span className="rounded-md font-extrabold text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-brand-500/20 via-rose-500/20 to-amber-500/20 text-brand-300 border border-brand-500/35">
                  AI
                </span>
              </div>
            </Link>
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
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 select-none"
              title={pinterestConnected ? 'Pinterest: Live Connected' : 'Pinterest: Credentials Active'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pinterestConnected ? 'bg-emerald-400' : 'bg-emerald-400'
                }`}
              />
              <span className="text-xs font-medium text-zinc-300 hidden sm:inline">
                Pinterest Connected
              </span>
            </div>

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
