'use client';

import React from 'react';
import './globals.css';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center p-4">
        <div className="space-y-4 max-w-md text-center p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800">
          <h2 className="text-xl font-bold text-white">Application Exception</h2>
          <p className="text-xs text-zinc-400">
            A critical system error occurred. Click below to recover the application session.
          </p>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
