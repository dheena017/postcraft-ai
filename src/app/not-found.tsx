import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <h2 className="text-lg font-semibold text-zinc-300">Page Not Found</h2>
        <p className="text-xs text-zinc-500">
          The page or creative canvas you requested does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/studio"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
          >
            Return to Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
