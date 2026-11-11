'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  Clock,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';

export const LandingHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="focus:outline-none" title="PostCraft AI Home">
            <BrandLogo
              size="md"
              subtitle="Free AI Image Studio &amp; Social Publisher"
            />
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              href="#features"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#workflow"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#niches"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Inspiration
            </Link>
            <Link
              href="#comparison"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Compare
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <span className="h-4 w-px bg-zinc-800" />
            <Link
              href="/dashboard"
              prefetch={true}
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
              <span>Dashboard</span>
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/dashboard" prefetch={true}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<LayoutDashboard className="w-4 h-4 text-brand-400" />}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/studio" prefetch={true}>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-lg shadow-brand-500/30"
              >
                Launch Studio Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Dashboard
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800/90 bg-zinc-950/95 backdrop-blur-2xl px-4 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-brand-500/10 border border-brand-500/20 text-brand-300"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-400" />
              <span>App Dashboard</span>
            </Link>
            <Link
              href="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>AI Creative Studio</span>
            </Link>
            <Link
              href="/studio?mode=sheets"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Sheets Automation</span>
            </Link>
            <Link
              href="/queue"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Schedule Queue</span>
            </Link>
            <div className="border-t border-zinc-800/80 pt-3 flex flex-col space-y-2">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Features
              </Link>
              <Link
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                How It Works
              </Link>
              <Link
                href="#niches"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Inspiration Niches
              </Link>
              <Link
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Comparison Matrix
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Frequently Asked Questions
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/studio" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Launch Studio Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
