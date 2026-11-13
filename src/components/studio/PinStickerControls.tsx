'use client';

import React from 'react';
import { Tag, Bookmark, ShoppingBag, X } from 'lucide-react';
import { PinStickerConfig } from '@/types/image';

interface PinStickerControlsProps {
  config: PinStickerConfig;
  onChange: (updated: PinStickerConfig) => void;
  onClose?: () => void;
}

const CTA_PRESETS = [
  'Tap to Shop 🛍️',
  'Recipe Inside 🥣',
  'Link in Bio 🔗',
  'Save for Later 📌',
  'New Collection ✨',
  'Read Tutorial 📖',
];

export const PinStickerControls: React.FC<PinStickerControlsProps> = ({
  config,
  onChange,
  onClose,
}) => {
  return (
    <div className="p-3.5 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-rose-400" />
          <span>Interactive Pin Badges &amp; Stickers</span>
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Pinterest Save Badge */}
        <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-red-500" />
              <span>Pinterest &quot;Save&quot; Pill</span>
            </span>
            <input
              type="checkbox"
              checked={config.showSaveBadge}
              onChange={(e) => onChange({ ...config, showSaveBadge: e.target.checked })}
              className="accent-rose-500 cursor-pointer rounded w-3.5 h-3.5"
            />
          </div>

          {config.showSaveBadge && (
            <div className="space-y-1.5 pt-1 animate-in fade-in">
              <label className="text-[10px] text-zinc-400">Badge Theme</label>
              <div className="grid grid-cols-2 gap-1">
                {(['red', 'white', 'glass', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ ...config, saveBadgeTheme: t })}
                    className={`py-1 px-1.5 rounded text-[10px] capitalize transition-colors cursor-pointer border ${
                      config.saveBadgeTheme === t
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Call To Action (CTA) Badge */}
        <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-brand-400" />
              <span>CTA Action Pill</span>
            </span>
            <input
              type="checkbox"
              checked={config.ctaBadge.enabled}
              onChange={(e) =>
                onChange({
                  ...config,
                  ctaBadge: { ...config.ctaBadge, enabled: e.target.checked },
                })
              }
              className="accent-brand-500 cursor-pointer rounded w-3.5 h-3.5"
            />
          </div>

          {config.ctaBadge.enabled && (
            <div className="space-y-1.5 pt-1 animate-in fade-in">
              <input
                type="text"
                value={config.ctaBadge.text}
                onChange={(e) =>
                  onChange({
                    ...config,
                    ctaBadge: { ...config.ctaBadge, text: e.target.value },
                  })
                }
                placeholder="E.g., Tap to Shop"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-white focus:outline-none focus:border-brand-500"
              />
              <div className="flex flex-wrap gap-1">
                {CTA_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...config,
                        ctaBadge: { ...config.ctaBadge, text: preset },
                      })
                    }
                    className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Price Tag / Promo Banner */}
        <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-400" />
              <span>Price / Promo Tag</span>
            </span>
            <input
              type="checkbox"
              checked={config.priceTag.enabled}
              onChange={(e) =>
                onChange({
                  ...config,
                  priceTag: { ...config.priceTag, enabled: e.target.checked },
                })
              }
              className="accent-emerald-500 cursor-pointer rounded w-3.5 h-3.5"
            />
          </div>

          {config.priceTag.enabled && (
            <div className="space-y-1.5 pt-1 animate-in fade-in">
              <input
                type="text"
                value={config.priceTag.text}
                onChange={(e) =>
                  onChange({
                    ...config,
                    priceTag: { ...config.priceTag, text: e.target.value },
                  })
                }
                placeholder="E.g., $29.99 or 50% OFF"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-1">
                {['$29.99', '50% OFF', 'Free Ship'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...config,
                        priceTag: { ...config.priceTag, text: p },
                      })
                    }
                    className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
