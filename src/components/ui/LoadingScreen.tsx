'use client';

import React from 'react';
import { BrandLogoMark } from './BrandLogo';

export interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5 border-[1.5px]',
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={`inline-block rounded-full border-zinc-700/50 border-t-brand-500 border-r-rose-400 animate-spin ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading PostCraft AI...',
  submessage,
  fullScreen = true,
  size = 'md',
  className = '',
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md'
    : 'w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-950/60 rounded-2xl';

  return (
    <div className={`${containerClasses} ${className}`} role="status">
      <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto space-y-5 animate-in fade-in duration-300">
        {/* Animated Brand Glyph Container */}
        <div className="relative">
          {/* Subtle Ambient Pulse behind logo */}
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-brand-500/20 via-rose-500/15 to-amber-500/10 blur-xl animate-pulse" />
          
          {/* Brand Logo with gentle scale breath */}
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <BrandLogoMark size={size === 'sm' ? 'sm' : size === 'lg' ? 'xl' : 'lg'} />
          </div>

          {/* Orbiting Spinner Ring */}
          <div className="absolute -inset-2.5 rounded-2xl border border-brand-500/30 border-t-brand-500 border-l-transparent animate-spin pointer-events-none" />
        </div>

        {/* Informative Status Text */}
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center justify-center gap-1.5">
            {message}
          </h3>
          {submessage && (
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              {submessage}
            </p>
          )}
        </div>

        {/* Shimmering micro progress bar */}
        <div className="w-36 h-1 rounded-full bg-zinc-900 border border-zinc-800/80 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 via-rose-500 to-amber-400 animate-[shimmer_1.5s_infinite] w-full" />
        </div>
      </div>
    </div>
  );
};
