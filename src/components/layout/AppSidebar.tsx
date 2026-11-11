'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  FileSpreadsheet,
  Clock,
  Image as ImageIcon,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  ExternalLink,
  X,
} from 'lucide-react';

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [pinterestConnected, setPinterestConnected] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/providers/pinterest/auth')
      .then((res) => res.json())
      .then((data) => setPinterestConnected(data.isConnected))
      .catch(() => {});

    fetch('/api/queue')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const pending = data.filter(
            (j) => j.status === 'PENDING' || j.status === 'READY'
          ).length;
          setPendingCount(pending);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navGroups = [
    {
      group: 'Workspace',
      items: [
        { label: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'AI Creative Studio', href: '/studio', icon: Sparkles, badge: 'Free' },
        { label: 'Sheets Automation', href: '/sheets', icon: FileSpreadsheet },
        {
          label: 'Schedule Queue',
          href: '/queue',
          icon: Clock,
          count: pendingCount,
        },
        { label: 'Creations Gallery', href: '/gallery', icon: ImageIcon },
      ],
    },
    {
      group: 'Configuration',
      items: [
        { label: 'Providers & Settings', href: '/settings', icon: Settings },
      ],
    },
    {
      group: 'Public Portal',
      items: [
        { label: 'Landing Page', href: '/', icon: Globe },
      ],
    },
  ];

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-20' : 'w-64 md:w-72'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 border-b border-zinc-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group overflow-hidden"
          title="PostCraft AI Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-brand-400 to-rose-300 text-lg">
                P
              </span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">
                  PostCraft
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium truncate">
                Free AI Studio &amp; Publisher
              </p>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 truncate">
                {group.group}
              </div>
            ) : (
              <div className="h-2 border-t border-zinc-800/60 my-2 mx-1" />
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl transition-all group ${
                    isCollapsed
                      ? 'justify-center p-3'
                      : 'justify-between px-3.5 py-2.5 text-xs sm:text-sm font-medium'
                  } ${
                    isActive
                      ? 'bg-brand-500/15 text-white border border-brand-500/30 shadow-sm shadow-brand-500/10'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70 border border-transparent'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="relative">
                      <Icon
                        className={`w-5 h-5 transition-colors flex-shrink-0 ${
                          isActive
                            ? 'text-brand-400'
                            : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}
                      />
                      {isCollapsed && item.count !== undefined && item.count > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-zinc-950" />
                      )}
                    </div>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      {item.badge}
                    </span>
                  )}

                  {!isCollapsed && item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Status & Info Area */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 bg-zinc-950/70">
        {/* Pinterest Connection Card */}
        <Link
          href="/settings"
          onClick={onCloseMobile}
          title={isCollapsed ? (pinterestConnected ? 'Pinterest: Live Connected' : 'Pinterest: Demo Mode') : undefined}
          className={`flex items-center rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:border-zinc-700 transition-colors group ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-between p-2.5'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                pinterestConnected
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-amber-400 shadow-sm shadow-amber-400/50'
              }`}
            />
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                  Pinterest
                  <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {pinterestConnected ? 'API v5 Connected' : 'Demo Mode'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                pinterestConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {pinterestConnected ? 'Live' : 'Demo'}
            </span>
          )}
        </Link>

        {/* Free Guarantee badge */}
        {!isCollapsed ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-[11px] leading-tight truncate">
              <span className="font-semibold block truncate">100% Free &amp; Unlimited</span>
              <span className="text-[10px] text-emerald-400/80 truncate">No watermarks or paywalls</span>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            title="100% Free & Unlimited (No Watermarks)"
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}

        {/* Collapse / Expand Toggle Button (Desktop) */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors border border-zinc-800/60 mt-1"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-zinc-400" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium">
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 z-30 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
