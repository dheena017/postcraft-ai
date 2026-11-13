import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Skeleton width={56} height={56} className="rounded-2xl" />
          <Skeleton width={180} height={24} className="rounded-lg" />
          <Skeleton width={260} height={14} className="rounded-md" />
        </div>

        <div className="space-y-3 pt-2">
          <Skeleton width="100%" height={40} className="rounded-xl" />
          <Skeleton width="100%" height={48} className="rounded-xl" />
          <Skeleton width="100%" height={48} className="rounded-xl" />
        </div>
      </div>
    </div>
  );
}
