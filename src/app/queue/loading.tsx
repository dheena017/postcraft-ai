import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function QueueLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton width={200} height={30} className="rounded-lg" />
            <Skeleton width={70} height={20} className="rounded-full" />
          </div>
          <Skeleton width={380} height={14} className="rounded-md" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton width={110} height={36} className="rounded-xl" />
          <Skeleton width={100} height={36} className="rounded-xl" />
          <Skeleton width={80} height={36} className="rounded-xl" />
          <Skeleton width={120} height={36} className="rounded-xl" />
        </div>
      </div>

      {/* 4 Stats Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton width={80} height={12} className="rounded-md" />
              <Skeleton width={24} height={24} className="rounded-lg" />
            </div>
            <Skeleton width={50} height={28} className="rounded-lg" />
          </div>
        ))}
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton width={70} height={34} className="rounded-xl" />
          <Skeleton width={80} height={34} className="rounded-xl" />
          <Skeleton width={80} height={34} className="rounded-xl" />
          <Skeleton width={70} height={34} className="rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={220} height={34} className="rounded-xl" />
          <Skeleton width={100} height={34} className="rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <Skeleton width={140} height={16} className="rounded-md" />
          <Skeleton width={60} height={16} className="rounded-md" />
        </div>
        <div className="divide-y divide-zinc-800/50">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton width={48} height={48} className="rounded-xl flex-shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-md">
                  <Skeleton width="90%" height={14} className="rounded-md" />
                  <Skeleton width="60%" height={12} className="rounded-md" />
                </div>
              </div>
              <Skeleton width={100} height={14} className="hidden sm:block rounded-md" />
              <Skeleton width={90} height={20} className="rounded-full" />
              <Skeleton width={60} height={28} className="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
