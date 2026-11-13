import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function NotificationsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton width={220} height={30} className="rounded-lg" />
            <Skeleton width={60} height={20} className="rounded-full" />
          </div>
          <Skeleton width={360} height={14} className="rounded-md" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton width={110} height={36} className="rounded-xl" />
          <Skeleton width={90} height={36} className="rounded-xl" />
          <Skeleton width={80} height={36} className="rounded-xl" />
        </div>
      </div>

      {/* Channel Filters Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <Skeleton width={80} height={14} className="rounded-md" />
            <Skeleton width={40} height={20} className="rounded-md" />
          </div>
        ))}
      </div>

      {/* Tabs & Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton width={80} height={34} className="rounded-xl" />
          <Skeleton width={80} height={34} className="rounded-xl" />
          <Skeleton width={90} height={34} className="rounded-xl" />
        </div>
        <Skeleton width={240} height={34} className="rounded-xl" />
      </div>

      {/* Notification Rows Skeleton */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-4"
          >
            <Skeleton width={40} height={40} className="rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton width={180} height={16} className="rounded-md" />
                <Skeleton width={70} height={12} className="rounded-md" />
              </div>
              <Skeleton width="90%" height={14} className="rounded-md" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton width={60} height={16} className="rounded-full" />
                <Skeleton width={80} height={12} className="rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
