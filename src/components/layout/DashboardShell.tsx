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
  const isLandingPage = pathname === '/';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load saved sidebar preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('postcraft_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('postcraft_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // If on the Public Landing Page (/): Full-Width Layout WITHOUT Sidebar
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col antialiased">
        <LandingHeader />
        <main className="flex-1 w-full">{children}</main>
        <AppFooter />
      </div>
    );
  }

  // If inside the App (/studio, /sheets, /queue, /gallery, /settings): Dashboard Layout WITH Sidebar
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-row antialiased">
      {/* Collapsible App Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <AppHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1">{children}</main>
        <AppFooter />
      </div>
    </div>
  );
};
