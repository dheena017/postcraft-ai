'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
  Sparkles,
  Clock,
  Image as ImageIcon,
  LayoutDashboard,
  Globe,
  ShieldCheck,
  X,
  Bell,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen = false,
  onClose,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const { unreadCount } = useNotifications();

  // Unified close handler
  const handleClose = () => {
    onClose?.();
    onCloseMobile?.();
  };

  const isVisible = isOpen || isOpenMobile;

  // Escape key closes the overlay sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose?.();
        onCloseMobile?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose, onCloseMobile]);

  useEffect(() => {
    const fetchQueueCount = () => {
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
    };

    fetchQueueCount();
    const interval = setInterval(fetchQueueCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navGroups = [
    {
      group: 'Workspace',
      items: [
        { label: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'AI Creative Studio', href: '/studio', icon: Sparkles, badge: 'Free' },
        {
          label: 'Schedule Queue',
          href: '/queue',
          icon: Clock,
          count: pendingCount,
        },
        { label: 'Creations Gallery', href: '/gallery', icon: ImageIcon },
        {
          label: 'Notifications',
          href: '/notifications',
          icon: Bell,
          count: unreadCount,
        },
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

  return (
    <>
      {/* Dimmed Background Overlay Backdrop (Click outside to close) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-150 ${
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Floating Separate Overlay Sidebar Drawer (Page underneath NEVER moves!) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 h-full bg-zinc-950 border-r border-zinc-800/80 shadow-2xl flex flex-col select-none overscroll-contain transition-transform duration-150 ease-out ${
          isVisible ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-label="Navigation Sidebar"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <Link
            href="/dashboard"
            prefetch={true}
            onClick={handleClose}
            className="overflow-hidden focus:outline-none"
            title="PostCraft AI Dashboard"
          >
            <BrandLogo
              size="md"
              showText={true}
              showSubtitle={true}
              subtitle="Free AI Studio & Publisher"
            />
          </Link>

          {/* Close Sidebar Button */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer border border-zinc-800/60"
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 truncate">
                {group.group}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch(item.href)}
                    onClick={handleClose}
                    className={`flex items-center rounded-xl transition-colors group justify-between px-3.5 py-2.5 text-xs sm:text-sm font-medium ${
                      isActive
                        ? 'bg-brand-500/15 text-white border border-brand-500/30 shadow-sm shadow-brand-500/10'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="relative">
                        <Icon
                          className={`w-5 h-5 transition-colors flex-shrink-0 ${
                            isActive
                              ? 'text-brand-400'
                              : 'text-zinc-500 group-hover:text-zinc-300'
                          }`}
                        />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

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
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
