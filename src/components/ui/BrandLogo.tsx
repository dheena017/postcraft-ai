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
  xs: { box: 'w-6 h-6', text: 'text-sm', badge: 'text-[9px] px-1 py-0.2', sub: 'text-[9px]' },
  sm: { box: 'w-8 h-8', text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5', sub: 'text-[10px]' },
  md: { box: 'w-10 h-10', text: 'text-lg', badge: 'text-[10px] px-1.5 py-0.5', sub: 'text-[11px]' },
  lg: { box: 'w-12 h-12', text: 'text-xl', badge: 'text-[11px] px-2 py-0.5', sub: 'text-xs' },
  xl: { box: 'w-16 h-16', text: 'text-2xl', badge: 'text-xs px-2.5 py-1', sub: 'text-sm' },
};

export const BrandLogoMark: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const cfg = SIZE_CONFIGS[size];

  return (
    <div
      className={`relative ${cfg.box} rounded-xl group-hover:scale-105 transition-all duration-300 flex-shrink-0 select-none ${className}`}
    >
      {/* Outer Dynamic Radial Ambient Glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-300 -z-10" />

      {/* High-Definition Vector SVG Glyph */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="markBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff1a53" />
            <stop offset="45%" stop-color="#f43f5e" />
            <stop offset="85%" stop-color="#fb923c" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>

          <radialGradient id="markGlassGrad" cx="30%" cy="20%" r="90%">
            <stop offset="0%" stop-color="#1c1917" stop-opacity="0.95" />
            <stop offset="60%" stop-color="#0c0a09" stop-opacity="0.98" />
            <stop offset="100%" stop-color="#000000" stop-opacity="1" />
          </radialGradient>

          <linearGradient id="markStemGrad" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="25%" stop-color="#ffe4e6" />
            <stop offset="60%" stop-color="#f43f5e" />
            <stop offset="100%" stop-color="#be123c" />
          </linearGradient>

          <linearGradient id="markLoopGrad" x1="0%" y1="10%" x2="100%" y2="90%">
            <stop offset="0%" stop-color="#ff4365" />
            <stop offset="40%" stop-color="#f43f5e" />
            <stop offset="80%" stop-color="#fb923c" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>

          <linearGradient id="markSparkleCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="50%" stop-color="#fef08a" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>

          <filter id="markNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#f43f5e" flood-opacity="0.5" />
          </filter>
          <filter id="markStarGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#fbbf24" flood-opacity="0.8" />
          </filter>
        </defs>

        {/* Deep Obsidian Rounded Base with Glass Shimmer */}
        <rect x="2.5" y="2.5" width="43" height="43" rx="12" fill="url(#markGlassGrad)" />
        <rect x="2.5" y="2.5" width="43" height="43" rx="12" stroke="url(#markBorderGrad)" stroke-width="1.8" />

        {/* Specular Glint Highlight */}
        <path
          d="M4 14C4 8.47715 8.47715 4 14 4H34C37 4 39.5 5.2 41.3 7.2C38.5 6.2 34 5.8 28 6.5C18 7.6 10 13 6.5 21C5.2 19 4 16.5 4 14Z"
          fill="white"
          fill-opacity="0.09"
        />

        {/* Dimensional Craft "P" Monogram */}
        <g filter="url(#markNeonGlow)">
          <path
            d="M20 9.5H26.5C32.8513 9.5 38 14.4249 38 20.5C38 26.5751 32.8513 31.5 26.5 31.5H20V9.5Z"
            fill="url(#markLoopGrad)"
          />

          <path
            d="M11.5 11.5C11.5 10.3954 12.3954 9.5 13.5 9.5H20.5V31.5H16.8C16.1 31.5 15.4 31.9 15 32.5L11.8 37.3C11.4 37.9 11.5 36.8 11.5 36.2V11.5Z"
            fill="url(#markStemGrad)"
          />

          <path
            d="M20.5 15.5H26C28.7614 15.5 31 17.7386 31 20.5C31 23.2614 28.7614 25.5 26 25.5H20.5V15.5Z"
            fill="#0c0a09"
          />
        </g>

        {/* Radiant Generative AI Spark (✦) */}
        <path
          d="M25.5 16C25.5 18.2 26.8 19.5 29 20.5C26.8 21.5 25.5 22.8 25.5 25C25.5 22.8 24.2 21.5 22 20.5C24.2 19.5 25.5 18.2 25.5 16Z"
          fill="url(#markSparkleCore)"
          filter="url(#markStarGlow)"
        />

        <circle cx="25.5" cy="20.5" r="0.9" fill="#ffffff" />

        {/* Accent Creative Sparkle */}
        <path
          d="M37.5 7C37.5 8.3 38.4 9.2 39.7 9.2C38.4 9.2 37.5 10.1 37.5 11.4C37.5 10.1 36.6 9.2 35.3 9.2C36.6 9.2 37.5 8.3 37.5 7Z"
          fill="#fef08a"
          filter="url(#markStarGlow)"
        />
      </svg>
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
            <span className={`font-black tracking-tight ${cfg.text}`}>
              <span className="text-white">Post</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300">
                Craft
              </span>
            </span>
            <span
              className={`rounded-md font-extrabold bg-gradient-to-r from-brand-500/20 via-rose-500/20 to-amber-500/20 text-brand-300 border border-brand-500/35 shadow-sm shadow-brand-500/20 ${cfg.badge}`}
            >
              AI
            </span>
          </div>
          {showSubtitle && (
            <p className={`text-zinc-400/90 font-medium tracking-tight truncate mt-1 ${cfg.sub}`}>
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
