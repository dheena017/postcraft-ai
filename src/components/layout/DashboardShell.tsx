'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { LandingHeader } from './LandingHeader';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/privacy' || pathname === '/terms';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load saved sidebar collapse preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('postcraft_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  // When changing pages: reset scroll and close mobile menu automatically
  useEffect(() => {
    setIsMobileMenuOpen(false);
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {}
  }, [pathname]);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('postcraft_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Public Pages (/, /privacy, /terms): Full-Width Layout with smooth page transition
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col antialiased">
        <LandingHeader />
        <main key={pathname} className="page-transition flex-1 w-full">
          {children}
        </main>
        <AppFooter />
      </div>
    );
  }

  // Inside the App: Dashboard Layout with In-Sidebar Controls & smooth page transitions
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-row antialiased">
      {/* App Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <AppHeader
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        {/* Animated Page Transition Container */}
        <main key={pathname} className="page-transition flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
