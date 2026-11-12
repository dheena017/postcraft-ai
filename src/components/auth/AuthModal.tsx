'use client';

import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BrandLogoMark } from '../ui/BrandLogo';

export const AuthModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, isLoading } = useAuth();
  const [tab, setTab] = useState<'quick' | 'email'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleQuickLogin = async (persona: 'creator' | 'agency' | 'admin') => {
    setStatusMessage('Authenticating profile...');
    const success = await login({ persona });
    if (success) {
      setStatusMessage('Welcome back!');
      setTimeout(() => {
        setStatusMessage(null);
        closeLoginModal();
      }, 600);
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
      setStatusMessage('Signed in successfully!');
      setTimeout(() => {
        setStatusMessage(null);
        closeLoginModal();
      }, 600);
    } else {
      setStatusMessage('Failed to authenticate with those credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 p-6 sm:p-8 shadow-[0_0_80px_-20px_rgba(168,85,247,0.35)] backdrop-blur-2xl">
        {/* Colorful glowing ambient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-56 h-56 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600/20 via-brand-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/20">
            <BrandLogoMark size="md" />
          </div>
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300">
            Sign in to PostCraft AI
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs">
            Unlock watermark-free Pinterest image synthesis and scheduled auto-publishing
          </p>
        </div>

        {/* Tab Switcher */}
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Access</span>
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
            <span>Custom Account</span>
          </button>
        </div>

        {/* Quick Instant Personas */}
        {tab === 'quick' ? (
          <div className="space-y-2.5">
            <p className="text-[11px] font-medium text-zinc-400 mb-1">Select a pre-configured profile:</p>

            {/* Creator Profile */}
            <button
              onClick={() => handleQuickLogin('creator')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-purple-500/40 transition-all group text-left"
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

            {/* Agency Profile */}
            <button
              onClick={() => handleQuickLogin('agency')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-indigo-500/40 transition-all group text-left"
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

            {/* Admin Profile */}
            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-pink-500/40 transition-all group text-left"
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
          /* Custom Email/Password Form */
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
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
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-9 pr-10 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
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
              className="w-full mt-2 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in to Account'}</span>
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

        {/* Security Footer Notice */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local &amp; OAuth 2.0 Secure</span>
          </div>
          <span className="text-zinc-500">PostCraft AI v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

