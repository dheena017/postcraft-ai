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

    window.addEventListener('postcraft:nav-start', handleStart);
    window.addEventListener('postcraft:nav-end', handleDone);

    return () => {
      window.removeEventListener('postcraft:nav-start', handleStart);
      window.removeEventListener('postcraft:nav-end', handleDone);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none">
      <div className="h-full bg-gradient-to-r from-brand-500 via-rose-500 to-amber-400 animate-pulse transition-all duration-300 w-full shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
    </div>
  );
};

