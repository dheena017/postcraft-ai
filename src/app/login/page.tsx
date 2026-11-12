'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Building2,
  Terminal,
  Eye,
  EyeOff,
  Zap,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [tab, setTab] = useState<'quick' | 'email'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleQuickLogin = async (persona: 'creator' | 'agency' | 'admin') => {
    setStatusMessage('Authenticating...');
    const success = await login({ persona });
    if (success) {
      setStatusMessage('Authenticated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } else {
      setStatusMessage('Authentication error');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatusMessage('Signing in...');
    const success = await login({ email, password });
    if (success) {
      setStatusMessage('Signed in successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } else {
      setStatusMessage('Failed to sign in. Please verify credentials.');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 flex flex-col justify-between overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-600/25 via-indigo-600/15 to-transparent blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-pink-600/20 via-brand-600/15 to-transparent blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="focus:outline-none">
          <BrandLogo size="md" subtitle="AI Pin Generation Studio" />
        </Link>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>Explore App</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Center Main Login Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row items-center gap-12 my-auto">
        {/* Left Side: Brand Value Pillars */}
        <div className="flex-1 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500/15 to-pink-500/15 text-purple-300 border border-purple-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Watermark-Free AI Image Generation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Supercharge your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
              creative workflow
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg">
            Create vertical 2:3 pins, automate bulk prompts via Google Sheets, and publish directly to Pinterest boards without watermarks or subscription locks.
          </p>

          {/* Feature Highlights Checklist */}
          <div className="space-y-3 pt-2">
            {[
              'Direct synthesis with high-speed FLUX.1 & SDXL models',
              'Smart automated negative watermark & text suppression',
              'Scheduled background queue with live console logger',
              'One-click multi-board publishing via Pinterest OAuth',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: The Glassmorphic Login Card */}
        <div className="w-full max-w-md">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black/95 p-6 sm:p-8 shadow-[0_0_80px_-20px_rgba(168,85,247,0.35)] backdrop-blur-2xl">
            {/* Header */}
            <div className="text-center space-y-1.5 mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Welcome to PostCraft
              </h2>
              <p className="text-xs text-zinc-400">
                Sign in with demo personas or your custom creator account
              </p>
            </div>

            {/* Segmented Tab */}
            <div className="flex p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 mb-5">
              <button
                type="button"
                onClick={() => setTab('quick')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'quick'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Sign-In</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('email')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'email'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email &amp; Password</span>
              </button>
            </div>

            {/* Quick Personas Tab */}
            {tab === 'quick' ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleQuickLogin('creator')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-purple-500/40 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          Elena Rostova
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          CREATOR
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">@elena_designs • Pinterest Linked</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleQuickLogin('agency')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-indigo-500/40 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          Aesthetic Studios NYC
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                          AGENCY
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">Multi-board automated publishing</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-pink-500/40 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-pink-500/30 bg-pink-500/10 flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                          Dev Operations
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/25">
                          ADMIN
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">Full system &amp; terminal log access</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            ) : (
              /* Email / Password Form */
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@yourbrand.com"
                      required
                      className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-9 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Status Alert */}
            {statusMessage && (
              <div className="mt-4 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2 justify-center animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Footer Notice */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant session ready</span>
              </div>
              <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
                Privacy policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-zinc-500 border-t border-zinc-900 bg-zinc-950/80">
        PostCraft AI &bull; Free AI Image Studio &amp; Watermark-Free Social Engine
      </footer>
    </div>
  );
}
