'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const NavigationProgressBar: React.FC = () => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Finish loading animation when path changes
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleDone = () => setIsNavigating(false);

    // Auto-detect clicks on internal navigation links
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !target.getAttribute('download') &&
        target.target !== '_blank'
      ) {
        const url = new URL(href, window.location.origin);
        if (url.pathname !== window.location.pathname) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    window.addEventListener('postcraft:nav-start', handleStart);
    window.addEventListener('postcraft:nav-end', handleDone);

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      window.removeEventListener('postcraft:nav-start', handleStart);
      window.removeEventListener('postcraft:nav-end', handleDone);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
      <div className="h-full bg-gradient-to-r from-brand-500 via-rose-500 to-amber-400 animate-pulse transition-all duration-300 w-full shadow-[0_0_10px_rgba(230,0,35,0.7)]" />
    </div>
  );
};

