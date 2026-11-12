'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export const UserProfileMenu: React.FC = () => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={openLoginModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        title="Sign in or test demo creator profiles"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const roleColors = {
    creator: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    agency: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    admin: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 sm:pr-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all select-none cursor-pointer"
        title={`Account: ${user.name} (${user.email})`}
      >
        {/* User Avatar with status dot */}
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-7 h-7 rounded-lg object-cover border border-purple-500/40 bg-zinc-800"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
        </div>

        {/* Name and Role Pill */}
        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="text-xs font-bold text-white max-w-[110px] truncate">
            {user.name}
          </span>
          <span className="text-[10px] text-zinc-400 capitalize mt-0.5">
            {user.role}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-2 shadow-2xl z-30 animate-in fade-in duration-150">
          {/* Header Info */}
          <div className="p-2.5 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">{user.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border ${
                  roleColors[user.role]
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
            {user.pinterestAccount && (
              <p className="text-[10px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                <span>📌</span>
                <span>{user.pinterestAccount}</span>
              </p>
            )}
          </div>

          {/* Action List */}
          <div className="py-1 space-y-0.5 text-xs">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span>Dashboard Overview</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
