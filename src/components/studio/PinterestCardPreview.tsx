'use client';

import React from 'react';
import { Share2, MoreHorizontal, ArrowUpRight, Heart, BookmarkCheck } from 'lucide-react';

interface PinterestCardPreviewProps {
  imageUrl: string;
  title?: string;
  prompt: string;
  filterStyle?: string;
  domain?: string;
  aspectRatio?: string;
}

export const PinterestCardPreview: React.FC<PinterestCardPreviewProps> = ({
  imageUrl,
  title,
  prompt,
  filterStyle = 'none',
  domain = 'postcraft.ai',
  aspectRatio = '2:3',
}) => {
  const displayTitle = title?.trim() || prompt.slice(0, 60) || 'Aesthetic Pinterest Pin';

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-sm w-full mx-auto animate-in fade-in">
      {/* Simulated Pinterest Feed Badge */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span>Mobile Feed Simulator (100% Native Aspect Ratio)</span>
      </div>

      {/* Outer Card with Authentic Pinterest Styling */}
      <div className="w-full bg-zinc-900/90 rounded-3xl p-3 border border-zinc-800 shadow-2xl space-y-3">
        {/* The Pin Image Container */}
        <div className="relative group rounded-2xl overflow-hidden bg-black shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={prompt}
            style={{ filter: filterStyle !== 'none' ? filterStyle : undefined }}
            className="w-full h-auto object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
          />

          {/* Authentic Top Pinterest Save Button Overlay */}
          <div className="absolute top-3 left-3 z-10">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e60023] hover:bg-[#b8001b] text-white font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <span>Save</span>
            </button>
          </div>

          {/* Top-Right Quick Share & Options */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 cursor-pointer">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bottom Destination Link Pill */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-zinc-900 text-[11px] font-semibold backdrop-blur-md shadow-md">
              <ArrowUpRight className="w-3 h-3 text-zinc-700" />
              <span>{domain}</span>
            </div>
          </div>
        </div>

        {/* Pin Details underneath image in Pinterest Feed */}
        <div className="px-1 space-y-2">
          {/* Pin Title */}
          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
            {displayTitle}
          </h3>

          {/* Creator Profile Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 flex items-center justify-center text-white text-[10px] font-bold shadow">
                P
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-200">PostCraft Creator</p>
                <p className="text-[9px] text-zinc-400">12.4k followers</p>
              </div>
            </div>

            <button
              type="button"
              className="text-[11px] font-semibold px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
            >
              Follow
            </button>
          </div>

          {/* Engagement Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3 text-emerald-400" />
              <span>98% High Save Score</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" />
              <span>Trending in Feed</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
