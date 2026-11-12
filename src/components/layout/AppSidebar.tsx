'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
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
  Loader2,
  User,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

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
  const { user, isAuthenticated } = useAuth();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Unified close handler
  const handleClose = useCallback(() => {
    onClose?.();
    onCloseMobile?.();
  }, [onClose, onCloseMobile]);

  const isVisible = isOpen || isOpenMobile;

  // Clear navigating highlight on route change
  useEffect(() => {
    setNavigatingHref(null);
  }, [pathname]);

  // Aggressively pre-warm all routes on mount
  useEffect(() => {
    const routes = [
      '/dashboard',
      '/studio',
      '/queue',
      '/gallery',
      '/notifications',
      '/login',
      '/privacy',
      '/',
    ];
    routes.forEach((r) => {
      try {
        router.prefetch(r);
      } catch {}
    });
  }, [router]);

  // Close with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

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

    // Fetch when sidebar becomes visible
    if (isVisible) {
      fetchQueueCount();
    }

    const handleSync = () => fetchQueueCount();
    window.addEventListener('postcraft:queue-updated', handleSync);
    const interval = setInterval(fetchQueueCount, 45000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('postcraft:queue-updated', handleSync);
    };
  }, [isVisible]);

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      handleClose();
      return;
    }

    // Trigger visual notification of navigation start
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('postcraft:nav-start'));
    }

    // Immediate active highlight
    setNavigatingHref(href);

    // Fast concurrent route transition
    startTransition(() => {
      router.push(href);
    });

    // Close the sidebar immediately
    handleClose();
  };

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    count?: number;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      group: 'Workspace',
      items: [
        { label: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'AI Creative Studio', href: '/studio', icon: Sparkles },
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
      group: 'Account',
      items: [
        {
          label: isAuthenticated && user ? `Profile (${user.role})` : 'Sign In / Account',
          href: '/login',
          icon: User,
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
      {/* Dimmed Background Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-150 ${
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Floating Separate Overlay Sidebar Drawer */}
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
            onClick={(e) => handleNavigate(e, '/dashboard')}
            onMouseEnter={() => router.prefetch('/dashboard')}
            className="overflow-hidden focus:outline-none"
            title="PostCraft AI Dashboard"
          >
            <BrandLogo
              size="md"
              showText={true}
              showSubtitle={true}
              subtitle="Free AI Studio &amp; Publisher"
            />
          </Link>

          {/* Close X Button */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800 transition-colors cursor-pointer"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {group.group}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isCurrent = pathname === item.href;
                const isNavigatingThis = navigatingHref === item.href;
                const isActive = isCurrent || isNavigatingThis;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch(item.href)}
                    onMouseDown={() => router.prefetch(item.href)}
                    onTouchStart={() => router.prefetch(item.href)}
                    onClick={(e) => handleNavigate(e, item.href)}
                    className={`flex items-center rounded-xl transition-all group justify-between px-3.5 py-2.5 text-xs sm:text-sm font-medium active:scale-[0.98] ${
                      isActive
                        ? 'bg-brand-500/15 text-white border border-brand-500/35 shadow-sm shadow-brand-500/10'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="relative">
                        {isNavigatingThis && !isCurrent ? (
                          <Loader2 className="w-5 h-5 text-brand-400 animate-spin flex-shrink-0" />
                        ) : (
                          <Icon
                            className={`w-5 h-5 transition-colors flex-shrink-0 ${
                              isActive
                                ? 'text-brand-400'
                                : 'text-zinc-500 group-hover:text-zinc-300'
                            }`}
                          />
                        )}
                      </div>
                      <span className="truncate font-medium">{item.label}</span>
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
                              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
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
