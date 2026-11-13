import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1.5">
          <Skeleton width={220} height={30} className="rounded-lg" />
          <Skeleton width={380} height={14} className="rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton width={180} height={38} className="rounded-xl" />
        </div>
      </div>

      {/* Grid of 8 Image Card Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div
            key={n}
            className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between space-y-3"
          >
            {/* Image Placeholder with Aspect 2/3 */}
            <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-zinc-950 border border-zinc-800/60 flex items-center justify-center">
              <Skeleton width="100%" height="100%" className="rounded-none" />
              <div className="absolute top-2.5 left-2.5">
                <Skeleton width={60} height={18} className="rounded-full" />
              </div>
            </div>

            {/* Caption & Metadata */}
            <div className="space-y-1.5 px-1">
              <Skeleton width="90%" height={14} className="rounded-md" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton width={70} height={12} className="rounded-md" />
                <Skeleton width={50} height={12} className="rounded-md" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2">
              <Skeleton width="50%" height={32} className="rounded-lg" />
              <Skeleton width="50%" height={32} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
