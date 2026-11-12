'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogoMark } from '@/components/ui/BrandLogo';
import {
  Menu,
  X,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileMenu } from './UserProfileMenu';

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
}) => {
  const router = useRouter();

  const handlePreload = () => {
    try {
      router.prefetch('/dashboard');
      router.prefetch('/studio');
      router.prefetch('/queue');
      router.prefetch('/gallery');
      router.prefetch('/notifications');
      router.prefetch('/login');
    } catch {}
  };

  const handleToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else if (onToggleSidebarCollapse) {
      onToggleSidebarCollapse();
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              onMouseEnter={handlePreload}
              onTouchStart={handlePreload}
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
              prefetch={true}
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
            {/* Notification Bell Popover Trigger */}
            <NotificationDropdown />

            {/* User Profile & Sign-in Dropdown */}
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
