'use client';

import React, { useState } from 'react';
import { History, Download, Trash2, RotateCcw, Star } from 'lucide-react';
import { ImageGenerationResult } from '@/types/image';

interface EnhancedHistoryFilmstripProps {
  history: ImageGenerationResult[];
  activeItem: ImageGenerationResult | null;
  onSelectItem: (item: ImageGenerationResult) => void;
  onLoadPromptAndSeed: (item: ImageGenerationResult) => void;
  onDeleteItem: (index: number) => void;
  onClearHistory: () => void;
  onQuickDownload: (item: ImageGenerationResult) => void;
}

export const EnhancedHistoryFilmstrip: React.FC<EnhancedHistoryFilmstripProps> = ({
  history,
  activeItem,
  onSelectItem,
  onLoadPromptAndSeed,
  onDeleteItem,
  onClearHistory,
  onQuickDownload,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [starredSet, setStarredSet] = useState<Set<number>>(new Set());

  if (history.length === 0) return null;

  const toggleStar = (e: React.MouseEvent, seed: number) => {
    e.stopPropagation();
    setStarredSet((prev) => {
      const next = new Set(prev);
      if (next.has(seed)) next.delete(seed);
      else next.add(seed);
      return next;
    });
  };

  return (
    <div className="w-full pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3 overflow-x-auto scrollbar-thin relative z-10">
      {/* Label and Count */}
      <div className="flex items-center gap-2 text-zinc-400 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            History ({history.length})
          </span>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[9px] text-zinc-500 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
          title="Clear session history"
        >
          Clear
        </button>
      </div>

      {/* Thumbnails Row */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {history.map((item, idx) => {
          const isSelected = activeItem?.imageUrl === item.imageUrl;
          const isStarred = starredSet.has(item.seed);

          return (
            <div
              key={idx}
              className="relative flex-shrink-0 group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <button
                type="button"
                onClick={() => onSelectItem(item)}
                className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer h-14 w-10 block ${
                  isSelected
                    ? 'ring-2 ring-brand-500 border-brand-500 scale-105 shadow-md shadow-brand-500/30'
                    : 'border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-600'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="h-full w-full object-cover"
                />

                {isStarred && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              {/* Hover Actions Bar */}
              {hoveredIdx === idx && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-950/95 border border-zinc-700/80 rounded-lg p-1 shadow-2xl backdrop-blur-md z-30 animate-in fade-in zoom-in-95">
                  {/* Load Prompt & Seed */}
                  <button
                    type="button"
                    onClick={() => onLoadPromptAndSeed(item)}
                    title="Load prompt & seed into Studio"
                    className="p-1 rounded text-zinc-400 hover:text-brand-300 hover:bg-zinc-800 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  {/* Favorite/Star */}
                  <button
                    type="button"
                    onClick={(e) => toggleStar(e, item.seed)}
                    title={isStarred ? 'Unfavorite' : 'Favorite pin'}
                    className={`p-1 rounded cursor-pointer ${
                      isStarred
                        ? 'text-amber-400 bg-amber-400/20'
                        : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                  </button>

                  {/* Quick Download */}
                  <button
                    type="button"
                    onClick={() => onQuickDownload(item)}
                    title="Quick Download HD"
                    className="p-1 rounded text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteItem(idx)}
                    title="Delete from history"
                    className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
