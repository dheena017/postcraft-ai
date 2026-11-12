'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { LandingHeader } from './LandingHeader';
import { NotificationProvider } from '@/context/NotificationContext';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === '/' || pathname === '/privacy' || pathname === '/terms';
  const isStudioPage = pathname === '/studio';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pre-warm all primary routes for instant 0ms navigation transitions
  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/studio');
    router.prefetch('/queue');
    router.prefetch('/gallery');
    router.prefetch('/notifications');
  }, [router]);

  // When changing pages: reset scroll and close sidebar automatically
  useEffect(() => {
    setIsSidebarOpen(false);
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {}
  }, [pathname]);

  // Public Pages (/, /privacy, /terms): Full-Width Layout
  if (isPublicPage) {
    return (
      <NotificationProvider>
        <div className="min-h-screen bg-zinc-950 flex flex-col antialiased">
          <LandingHeader />
          <main className="flex-1 w-full">
            {children}
          </main>
          <AppFooter />
        </div>
      </NotificationProvider>
    );
  }

  // Inside the App: Separate Overlay Sidebar Drawer - page content underneath NEVER moves or shifts!
  return (
    <NotificationProvider>
      <div className="relative w-full h-screen bg-zinc-950 flex flex-col antialiased overflow-hidden">
        {/* Floating Separate Overlay Drawer */}
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area: 100% full width, completely stationary */}
        <div className="w-full flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <AppHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
          {/* Instant Page Container */}
          <main className={`flex-1 w-full flex flex-col min-h-0 ${isStudioPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};
