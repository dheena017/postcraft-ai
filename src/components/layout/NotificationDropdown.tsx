'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Clock,
  Share2,
  AlertTriangle,
  Info,
  FileSpreadsheet,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { AppNotification, NotificationType } from '@/types/notification';

function formatTimeAgo(isoString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'STUDIO':
      return <Sparkles className="w-4 h-4 text-purple-400" />;
    case 'QUEUE':
      return <Clock className="w-4 h-4 text-brand-400" />;
    case 'PIN':
      return <Share2 className="w-4 h-4 text-rose-400" />;
    case 'ALERT':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'SHEET':
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    case 'SYSTEM':
    default:
      return <Info className="w-4 h-4 text-cyan-400" />;
  }
}

function getNotificationBg(type: NotificationType) {
  switch (type) {
    case 'STUDIO':
      return 'bg-purple-500/10 border-purple-500/20';
    case 'QUEUE':
      return 'bg-brand-500/10 border-brand-500/20';
    case 'PIN':
      return 'bg-rose-500/10 border-rose-500/20';
    case 'ALERT':
      return 'bg-amber-500/10 border-amber-500/20';
    case 'SHEET':
      return 'bg-emerald-500/10 border-emerald-500/20';
    case 'SYSTEM':
    default:
      return 'bg-cyan-500/10 border-cyan-500/20';
  }
}

export const NotificationDropdown: React.FC = () => {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) {
      markAsRead(n.id);
    }
    setIsOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const previewNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-zinc-800 text-white border-zinc-700 shadow-md'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80 border-zinc-800 bg-zinc-900/40'
        }`}
        title="Open Notifications"
      >
        <Bell className="w-4 h-4" />
        
        {/* Unread Badge indicator */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-brand-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-zinc-950 animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-brand-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* List of preview notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60 scrollbar-thin">
            {previewNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-700/40 mx-auto flex items-center justify-center text-zinc-400 mb-2">
                  <Bell className="w-5 h-5 text-zinc-500" />
                </div>
                <p className="text-xs font-medium text-zinc-300">All caught up!</p>
                <p className="text-[11px] text-zinc-500 mt-1">No notifications at the moment.</p>
              </div>
            ) : (
              previewNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 ${
                    notif.read
                      ? 'bg-transparent hover:bg-zinc-800/40 opacity-75 hover:opacity-100'
                      : 'bg-zinc-800/30 hover:bg-zinc-800/70'
                  }`}
                >
                  {/* Notification Icon */}
                  <div
                    className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${getNotificationBg(
                      notif.type
                    )}`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          notif.read ? 'text-zinc-300' : 'text-white'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-brand-400 group-hover:underline">
                        <span>View detail</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Unread Dot or Mark Check */}
                  <div className="flex items-center self-center flex-shrink-0">
                    {!notif.read ? (
                      <span
                        className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20"
                        title="Unread"
                      />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div className="p-2 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-2">
            <Link
              href="/notifications"
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 text-center text-xs font-medium text-brand-400 hover:text-brand-300 hover:bg-zinc-800/80 rounded-xl transition-colors"
            >
              See all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

