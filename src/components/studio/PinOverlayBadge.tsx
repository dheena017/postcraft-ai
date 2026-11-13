import React from 'react';
import { PinOverlayConfig } from '@/types/image';

interface PinOverlayBadgeProps {
  config: PinOverlayConfig;
}

export const PinOverlayBadge: React.FC<PinOverlayBadgeProps> = ({ config }) => {
  if (!config.enabled || !config.headline.trim()) return null;

  const positionClasses = {
    top: 'top-6 inset-x-6',
    center: 'top-1/2 -translate-y-1/2 inset-x-6',
    bottom: 'bottom-6 inset-x-6',
  }[config.position || 'bottom'];

  const themeClasses = {
    glass: 'bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl',
    'minimal-light': 'bg-white/95 text-zinc-900 border border-zinc-200/80 shadow-2xl',
    'minimal-dark': 'bg-zinc-950/95 text-white border border-zinc-800 shadow-2xl',
    editorial: 'bg-black/75 backdrop-blur-lg border-y-2 border-amber-400 text-white shadow-2xl',
    'bold-banner': 'bg-gradient-to-r from-brand-600 via-rose-600 to-amber-600 text-white shadow-2xl',
  }[config.theme || 'glass'];

  return (
    <div className={`absolute ${positionClasses} pointer-events-none z-20 transition-all duration-300`}>
      <div className={`rounded-2xl p-4 text-center max-w-sm mx-auto ${themeClasses}`}>
        <h4 className="text-sm md:text-base font-black tracking-tight leading-snug drop-shadow-sm font-sans uppercase">
          {config.headline}
        </h4>
        {config.subtext && (
          <p className="text-[11px] font-semibold opacity-90 mt-1 tracking-wide uppercase">
            {config.subtext}
          </p>
        )}
      </div>
    </div>
  );
};

