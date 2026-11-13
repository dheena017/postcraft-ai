'use client';

import React, { useState } from 'react';
import { Columns2, ArrowLeftRight } from 'lucide-react';
import { ImageGenerationResult } from '@/types/image';

interface SplitCompareViewProps {
  currentResult: ImageGenerationResult;
  previousResult: ImageGenerationResult;
  currentFilterStyle?: string;
}

export const SplitCompareView: React.FC<SplitCompareViewProps> = ({
  currentResult,
  previousResult,
  currentFilterStyle = 'none',
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-2 space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between w-full px-2 text-xs text-zinc-400">
        <span className="flex items-center gap-1 font-semibold text-zinc-300">
          <Columns2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Before / After Interactive Comparison</span>
        </span>
        <span className="text-[10px] text-zinc-400">Drag slider horizontally</span>
      </div>

      {/* Comparison Canvas Container */}
      <div
        className="relative group w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 select-none cursor-ew-resize"
        style={{
          aspectRatio: `${currentResult.width} / ${currentResult.height}`,
          maxHeight: 'calc(100vh - 20rem)',
        }}
        onMouseMove={(e) => {
          if (e.buttons === 1) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            setSliderPos((x / rect.width) * 100);
          }
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
            setSliderPos((x / rect.width) * 100);
          }
        }}
      >
        {/* Layer 1: Previous (Before) Image underneath */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previousResult.imageUrl}
          alt="Previous pin variation"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Layer 2: Current (After) Image with clip path */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentResult.imageUrl}
            alt="Current pin variation"
            style={{
              filter: currentFilterStyle !== 'none' ? currentFilterStyle : undefined,
              width: `${(100 / sliderPos) * 100}%`,
              maxWidth: 'none',
            }}
            className="h-full object-contain"
          />
        </div>

        {/* Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center text-white shadow-lg">
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Corner Badges */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-md z-20 pointer-events-none">
          Current (New)
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/70 text-zinc-300 text-[10px] font-bold backdrop-blur-md z-20 pointer-events-none">
          Previous (Seed: {previousResult.seed})
        </div>
      </div>
    </div>
  );
};
