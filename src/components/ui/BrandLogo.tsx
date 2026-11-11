'use client';

import React from 'react';
import Link from 'next/link';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}

const SIZE_CONFIGS = {
  xs: { box: 'w-6 h-6', svg: 24, text: 'text-sm', badge: 'text-[9px] px-1 py-0.2', sub: 'text-[9px]' },
  sm: { box: 'w-8 h-8', svg: 32, text: 'text-base', badge: 'text-[9px] px-1 py-0.5', sub: 'text-[10px]' },
  md: { box: 'w-10 h-10', svg: 40, text: 'text-lg', badge: 'text-[10px] px-1.5 py-0.5', sub: 'text-[11px]' },
  lg: { box: 'w-12 h-12', svg: 48, text: 'text-xl', badge: 'text-[11px] px-2 py-0.5', sub: 'text-xs' },
  xl: { box: 'w-16 h-16', svg: 64, text: 'text-2xl', badge: 'text-xs px-2.5 py-1', sub: 'text-sm' },
};

export const BrandLogoMark: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const cfg = SIZE_CONFIGS[size];

  return (
    <div
      className={`${cfg.box} rounded-xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ${className}`}
    >
      <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center p-1 relative overflow-hidden">
        {/* Soft Ambient Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-rose-500/5 to-amber-500/10 pointer-events-none" />

        {/* Unique Craft P & Sparkle SVG Glyph */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="markPGrad" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="50%" stop-color="#ffe4e6" />
              <stop offset="100%" stop-color="#fda4af" />
            </linearGradient>
            <linearGradient id="markSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="100%" stop-color="#f59e0b" />
            </linearGradient>
            <filter id="markGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#f43f5e" flood-opacity="0.5" />
            </filter>
          </defs>

          {/* Stylized Craft "P" with Needle Stem */}
          <path
            d="M12 11C12 9.89543 12.8954 9 14 9H25C30.5228 9 35 13.4772 35 19C35 24.5228 30.5228 29 25 29H19V36.2C19 37.1 18.2 37.8 17.3 37.5L13 36.1C12.4 35.9 12 35.4 12 34.8V11Z"
            fill="url(#markPGrad)"
            filter="url(#markGlow)"
          />

          {/* Aperture Cutout */}
          <path
            d="M19 14.5H24.5C27 14.5 29 16.5 29 19C29 21.5 27 23.5 24.5 23.5H19V14.5Z"
            fill="#09090b"
          />

          {/* Golden Radiant AI Star (✦) inside the loop */}
          <path
            d="M24.5 16.2C24.5 17.6 25.5 18.8 26.9 18.8C25.5 18.8 24.5 20 24.5 21.4C24.5 20 23.5 18.8 22.1 18.8C23.5 18.8 24.5 17.6 24.5 16.2Z"
            fill="url(#markSparkleGrad)"
          />

          {/* Mini Spark Top Right */}
          <path
            d="M37 6.5C37 7.6 37.9 8.5 39 8.5C37.9 8.5 37 9.4 37 10.5C37 9.4 36.1 8.5 35 8.5C36.1 8.5 37 7.6 37 6.5Z"
            fill="#fbbf24"
          />
        </svg>
      </div>
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  subtitle = 'Free AI Studio & Publisher',
  href,
  className = '',
  onClick,
}) => {
  const cfg = SIZE_CONFIGS[size];

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`} onClick={onClick}>
      <BrandLogoMark size={size} />

      {showText && (
        <div className="truncate text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black text-white tracking-tight ${cfg.text}`}>
              PostCraft
            </span>
            <span
              className={`rounded-md font-extrabold bg-gradient-to-r from-brand-500/20 to-rose-500/20 text-brand-300 border border-brand-500/30 ${cfg.badge}`}
            >
              AI
            </span>
          </div>
          {showSubtitle && (
            <p className={`text-zinc-500 font-medium truncate mt-1 ${cfg.sub}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};

