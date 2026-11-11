'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
  Sparkles,
  FileSpreadsheet,
  Clock,
  Image as ImageIcon,
  Settings,
  LayoutDashboard,
  Globe,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
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
        { label: 'Privacy Policy', href: '/privacy', icon: ShieldCheck },
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
      <div
        className={`p-4 border-b border-zinc-800/80 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="overflow-hidden focus:outline-none"
          title="PostCraft AI Dashboard"
        >
          <BrandLogo
            size="md"
            showText={!isCollapsed}
            showSubtitle={!isCollapsed}
            subtitle="Free AI Studio & Publisher"
          />
        </Link>

        {/* Mobile close button */}
        {isOpenMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Close sidebar"
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
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} truncate`}>
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

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          {item.badge}
                        </span>
                      )}

                      {item.count !== undefined && item.count > 0 && (
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
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Expand / Collapse Toggle Bar */}
      {onToggleCollapse && (
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/70">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800/60 transition-colors w-full ${
              isCollapsed ? 'justify-center p-2' : 'justify-center gap-2 py-2 text-xs font-medium'
            }`}
            title={isCollapsed ? 'Open / Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Open Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-zinc-400 hover:text-brand-400" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      )}
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
