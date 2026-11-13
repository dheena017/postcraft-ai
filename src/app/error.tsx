'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.client.error('App boundary caught unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="space-y-5 max-w-md p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white tracking-tight">Something went wrong</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error?.message && !error.message.includes('Cannot find module')
              ? error.message
              : 'An unexpected application state occurred. You can retry the action or return to the main studio.'}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>

          <Link href="/dashboard">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Home className="w-3.5 h-3.5 text-zinc-400" />}
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
