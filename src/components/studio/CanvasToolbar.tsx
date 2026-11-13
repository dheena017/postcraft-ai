'use client';

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Smartphone,
  LayoutGrid,
  Columns2,
  SunMedium,
  RotateCcw,
  Tag,
  FileText,
} from 'lucide-react';
import {
  CanvasFilterPreset,
  ImageAdjustments,
  CanvasViewMode,
  PinStickerConfig,
} from '@/types/image';

interface CanvasToolbarProps {
  viewMode: CanvasViewMode;
  onViewModeChange: (mode: CanvasViewMode) => void;
  activeFilter: CanvasFilterPreset;
  onFilterChange: (filter: CanvasFilterPreset) => void;
  adjustments: ImageAdjustments;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
  stickers: PinStickerConfig;
  onStickersChange: (stickers: PinStickerConfig) => void;
  isSeoDrawerOpen: boolean;
  onToggleSeoDrawer: () => void;
  isStickersDrawerOpen: boolean;
  onToggleStickersDrawer: () => void;
  hasPreviousItem: boolean;
}

const FILTER_PRESETS: { id: CanvasFilterPreset; label: string; icon: string }[] = [
  { id: 'none', label: 'Original', icon: '✨' },
  { id: 'warm-sun', label: 'Golden Hour', icon: '🌅' },
  { id: 'moody-noir', label: 'Moody Noir', icon: '🎬' },
  { id: 'pastel-bloom', label: 'Pastel Dream', icon: '🌸' },
  { id: 'vibrant-pop', label: 'Vibrant Pop', icon: '⚡' },
  { id: 'vintage-film', label: '35mm Film', icon: '🎞️' },
  { id: 'cyber-neon', label: 'Cyber Glow', icon: '🔮' },
];

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  viewMode,
  onViewModeChange,
  activeFilter,
  onFilterChange,
  adjustments,
  onAdjustmentsChange,
  stickers,
  onStickersChange,
  isSeoDrawerOpen,
  onToggleSeoDrawer,
  isStickersDrawerOpen,
  onToggleStickersDrawer,
  hasPreviousItem,
}) => {
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleResetAdjustments = () => {
    onAdjustmentsChange({ brightness: 0, contrast: 0, saturation: 0, warmth: 0 });
    onFilterChange('none');
  };

  const hasCustomAdjustments =
    activeFilter !== 'none' ||
    adjustments.brightness !== 0 ||
    adjustments.contrast !== 0 ||
    adjustments.saturation !== 0 ||
    adjustments.warmth !== 0;

  return (
    <div className="w-full flex flex-col gap-2 relative z-20">
      {/* Top Floating Glass Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-zinc-950/85 border border-zinc-800/90 backdrop-blur-md shadow-xl text-xs">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => onViewModeChange('studio')}
            title="Studio Canvas Mode"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
              viewMode === 'studio'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-3 h-3 text-brand-400" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('pinterest-mockup')}
            title="Pinterest Mobile Card Feed Mockup"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
              viewMode === 'pinterest-mockup'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">Feed Mockup</span>
          </button>

          {hasPreviousItem && (
            <button
              type="button"
              onClick={() => onViewModeChange('split-compare')}
              title="Compare Before & After with Previous Variation"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                viewMode === 'split-compare'
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Columns2 className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewModeChange('ambient-glow')}
            title="Ambient Glow Showcase"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
              viewMode === 'ambient-glow'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SunMedium className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Ambient</span>
          </button>
        </div>

        {/* Center: Aesthetic Filter Preset Pills */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none">
          {FILTER_PRESETS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeFilter === f.id
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Right Tools: Sliders, Stickers, and SEO Drawer Toggle */}
        <div className="flex items-center gap-1">
          {/* Fine-Tune Sliders Toggle */}
          <button
            type="button"
            onClick={() => setShowAdjustments(!showAdjustments)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              showAdjustments || hasCustomAdjustments
                ? 'border-brand-500/60 bg-brand-500/20 text-brand-300'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Fine-tune Brightness, Contrast & Warmth"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">Tune</span>
            {hasCustomAdjustments && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            )}
          </button>

          {/* Stickers & Badges Toggle */}
          <button
            type="button"
            onClick={onToggleStickersDrawer}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              isStickersDrawerOpen || stickers.showSaveBadge || stickers.ctaBadge?.enabled || stickers.priceTag?.enabled
                ? 'border-rose-500/60 bg-rose-500/20 text-rose-300'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Add Pinterest Save Badges, CTA Stickers & Price Ribbons"
          >
            <Tag className="w-3 h-3" />
            <span className="hidden sm:inline">Badges &amp; Stickers</span>
          </button>

          {/* Pin SEO Assistant Drawer Toggle */}
          <button
            type="button"
            onClick={onToggleSeoDrawer}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              isSeoDrawerOpen
                ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 font-bold'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
            }`}
            title="AI Pin Title, SEO Keywords & Description"
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">Pin SEO</span>
          </button>
        </div>
      </div>

      {/* Expandable Fine-Tune Adjustments Drawer */}
      {showAdjustments && (
        <div className="p-3.5 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-brand-400" />
              <span>Canvas Visual Color Grading</span>
            </span>
            <button
              type="button"
              onClick={handleResetAdjustments}
              className="text-[10px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Brightness</span>
                <span className="font-mono">{adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={adjustments.brightness}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, brightness: Number(e.target.value) })
                }
                className="w-full accent-brand-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Contrast</span>
                <span className="font-mono">{adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={adjustments.contrast}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, contrast: Number(e.target.value) })
                }
                className="w-full accent-brand-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Saturation</span>
                <span className="font-mono">{adjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="50"
                value={adjustments.saturation}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, saturation: Number(e.target.value) })
                }
                className="w-full accent-brand-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Warmth */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Warmth</span>
                <span className="font-mono">{adjustments.warmth}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={adjustments.warmth}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, warmth: Number(e.target.value) })
                }
                className="w-full accent-brand-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
