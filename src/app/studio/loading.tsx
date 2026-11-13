import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudioLoading() {
  return (
    <div className="h-full flex flex-col min-h-0 bg-zinc-950 p-4 sm:p-6 space-y-4 animate-in fade-in duration-300">
      {/* Studio Top Control Strip Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton width={130} height={22} className="rounded-md" />
            <Skeleton width={70} height={18} className="rounded-full" />
          </div>
          <Skeleton width={280} height={14} className="rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton width={110} height={34} className="rounded-xl" />
          <Skeleton width={120} height={34} className="rounded-xl" />
          <Skeleton width={90} height={34} className="rounded-xl" />
        </div>
      </div>

      {/* Main Studio Grid: Controls & Canvas Preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto">
        {/* Left Studio Controls Panel Skeleton */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          {/* Prompt Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton width={110} height={14} className="rounded-md" />
              <Skeleton width={70} height={14} className="rounded-md" />
            </div>
            <Skeleton width="100%" height={100} className="rounded-xl" />
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <Skeleton width={90} height={14} className="rounded-md" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} width="100%" height={36} className="rounded-xl" />
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <Skeleton width={80} height={14} className="rounded-md" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} width="100%" height={48} className="rounded-xl" />
              ))}
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <Skeleton width={120} height={14} className="rounded-md" />
            <Skeleton width="100%" height={44} className="rounded-xl" />
          </div>

          {/* Primary Action Button */}
          <Skeleton width="100%" height={48} className="rounded-xl" />
        </div>

        {/* Right Studio Canvas Preview Skeleton */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-6 min-h-[500px] justify-between">
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
            <div className="flex items-center gap-3">
              <Skeleton width={100} height={20} className="rounded-md" />
              <Skeleton width={80} height={18} className="rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton width={32} height={32} className="rounded-lg" />
              <Skeleton width={32} height={32} className="rounded-lg" />
            </div>
          </div>

          {/* Central Canvas Placeholder */}
          <div className="my-auto py-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-56 sm:w-72 aspect-[2/3] rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col items-center justify-center p-6 space-y-3">
              <Skeleton width={56} height={56} className="rounded-2xl" />
              <Skeleton width={140} height={16} className="rounded-md" />
              <Skeleton width={100} height={12} className="rounded-md" />
            </div>
          </div>

          {/* Bottom Canvas Controls */}
          <div className="pt-4 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Skeleton width={100} height={36} className="rounded-xl" />
              <Skeleton width={110} height={36} className="rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Skeleton width={120} height={36} className="rounded-xl" />
              <Skeleton width={110} height={36} className="rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
