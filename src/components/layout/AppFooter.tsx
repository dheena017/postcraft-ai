import React from 'react';
import Link from 'next/link';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';
import { BrandLogoMark } from '../ui/BrandLogo';

export const AppFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <BrandLogoMark size="xs" />
          <span className="font-bold text-zinc-200">PostCraft AI</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Free &amp; Unlimited (Zero Watermarks)
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
            <span>Dashboard</span>
          </Link>
          <Link href="/studio" className="hover:text-zinc-300 transition-colors">
            AI Studio
          </Link>
          <Link href="/sheets" className="hover:text-zinc-300 transition-colors">
            Google Sheets
          </Link>
          <Link href="/queue" className="hover:text-zinc-300 transition-colors">
            Queue Scheduler
          </Link>
          <Link href="/gallery" className="hover:text-zinc-300 transition-colors">
            Creations Gallery
          </Link>
          <Link href="/settings" className="hover:text-zinc-300 transition-colors">
            Providers &amp; Settings
          </Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};
