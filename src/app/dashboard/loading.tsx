import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Operational Command Bar Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton width={120} height={20} className="rounded-full" />
            <Skeleton width={100} height={20} className="rounded-full" />
          </div>
          <Skeleton width={260} height={32} className="rounded-lg" />
          <Skeleton width={420} height={18} className="rounded-md" />
        </div>

        {/* Action Controls Skeleton */}
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton width={120} height={36} className="rounded-xl" />
          <Skeleton width={110} height={36} className="rounded-xl" />
          <Skeleton width={120} height={36} className="rounded-xl" />
          <Skeleton width={120} height={36} className="rounded-xl" />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton width={100} height={14} className="rounded-md" />
              <Skeleton width={36} height={36} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton width={64} height={28} className="rounded-lg" />
              <Skeleton width={130} height={12} className="rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Synthesis Generator */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
            <div className="space-y-1.5">
              <Skeleton width={160} height={20} className="rounded-md" />
              <Skeleton width={220} height={12} className="rounded-md" />
            </div>
            <Skeleton width={60} height={22} className="rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton width={100} height={14} className="rounded-md" />
              <Skeleton width="100%" height={88} className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton width={80} height={14} className="rounded-md" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} width="100%" height={38} className="rounded-xl" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton width={110} height={14} className="rounded-md" />
              <Skeleton width="100%" height={40} className="rounded-xl" />
            </div>

            <Skeleton width="100%" height={44} className="rounded-xl" />
          </div>
        </div>

        {/* Right: Automated Queue Stream */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
              <div className="space-y-1.5">
                <Skeleton width={180} height={20} className="rounded-md" />
                <Skeleton width={200} height={12} className="rounded-md" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton width={80} height={28} className="rounded-lg" />
                <Skeleton width={80} height={28} className="rounded-lg" />
              </div>
            </div>

            {/* Queue rows */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-3.5 rounded-xl border border-zinc-800/70 bg-zinc-950/60 flex items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton width={70} height={18} className="rounded-full" />
                      <Skeleton width={90} height={14} className="rounded-md" />
                    </div>
                    <Skeleton width="80%" height={14} className="rounded-md" />
                  </div>
                  <Skeleton width={80} height={28} className="rounded-lg flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/70 flex justify-between items-center">
            <Skeleton width={160} height={14} className="rounded-md" />
            <Skeleton width={100} height={30} className="rounded-xl" />
          </div>
        </div>
      </div>

      {/* Recent Visual Creations Gallery Preview Skeleton */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
          <div className="space-y-1.5">
            <Skeleton width={200} height={20} className="rounded-md" />
            <Skeleton width={260} height={12} className="rounded-md" />
          </div>
          <Skeleton width={110} height={32} className="rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-xl bg-zinc-950/70 border border-zinc-800/70 p-3 space-y-3">
              <Skeleton width="100%" height={200} className="rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton width="85%" height={14} className="rounded-md" />
                <Skeleton width="50%" height={12} className="rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
