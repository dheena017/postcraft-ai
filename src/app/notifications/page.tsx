'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Sparkles,
  Clock,
  Share2,
  AlertTriangle,
  Info,
  FileSpreadsheet,
  ArrowRight,
  Check,
  PlusCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import { Button } from '@/components/ui/Button';

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    if (days < 7) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

function getNotificationDetails(type: NotificationType) {
  switch (type) {
    case 'STUDIO':
      return {
        icon: Sparkles,
        label: 'AI Studio',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/25',
        badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      };
    case 'QUEUE':
      return {
        icon: Clock,
        label: 'Queue Scheduler',
        color: 'text-brand-400',
        bg: 'bg-brand-500/10 border-brand-500/25',
        badgeBg: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
      };
    case 'PIN':
      return {
        icon: Share2,
        label: 'Pinterest',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/25',
        badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      };
    case 'ALERT':
      return {
        icon: AlertTriangle,
        label: 'System Alert',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/25',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    case 'SHEET':
      return {
        icon: FileSpreadsheet,
        label: 'Google Sheets',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/25',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'SYSTEM':
    default:
      return {
        icon: Info,
        label: 'System Info',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/25',
        badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      };
  }
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    sendTestNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'studio' | 'queue' | 'alerts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Tab filter
      if (activeTab === 'unread' && notif.read) return false;
      if (activeTab === 'studio' && notif.type !== 'STUDIO') return false;
      if (activeTab === 'queue' && notif.type !== 'QUEUE' && notif.type !== 'PIN') return false;
      if (activeTab === 'alerts' && notif.type !== 'ALERT' && notif.type !== 'SYSTEM' && notif.type !== 'SHEET') return false;

      // Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          notif.title.toLowerCase().includes(query) ||
          notif.message.toLowerCase().includes(query) ||
          notif.type.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const handleCreateTest = async () => {
    setIsSendingTest(true);
    const mockTypes: Array<{ type: NotificationType; title: string; message: string; link: string }> = [
      {
        type: 'STUDIO',
        title: 'Studio Render Succeeded',
        message: 'High-res Pinterest aesthetic graphic generated successfully in 2:3 aspect ratio.',
        link: '/gallery',
      },
      {
        type: 'QUEUE',
        title: 'Queue Execution Completed',
        message: 'Scheduled post was pushed to Pinterest board "Design Inspiration".',
        link: '/queue',
      },
      {
        type: 'ALERT',
        title: 'API Rate Monitor',
        message: 'Free tier generation quota healthy. 100% capacity available.',
        link: '/dashboard',
      },
    ];

    const pick = mockTypes[Math.floor(Math.random() * mockTypes.length)];
    await sendTestNotification(pick.title, pick.message);
    setIsSendingTest(false);
  };

  const studioCount = notifications.filter((n) => n.type === 'STUDIO').length;
  const queueCount = notifications.filter((n) => n.type === 'QUEUE' || n.type === 'PIN').length;
  const alertsCount = notifications.filter((n) => n.type === 'ALERT' || n.type === 'SYSTEM' || n.type === 'SHEET').length;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-zinc-800/80 shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Live real-time feed for AI studio renders, Pinterest automated publishing, scheduled queue tasks, and account alerts.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Send Test Notification Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCreateTest}
            isLoading={isSendingTest}
            leftIcon={<PlusCircle className="w-3.5 h-3.5 text-brand-400" />}
            title="Create a test notification"
          >
            <span>Trigger Test</span>
          </Button>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
              title="Mark all notifications as read"
            >
              <span>Mark all read</span>
            </Button>
          )}

          {/* Clear all */}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all notifications?')) {
                  clearAll();
                }
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-400" />}
              title="Clear all notifications"
            >
              <span className="hidden sm:inline">Clear all</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Total Alerts</p>
            <p className="text-lg font-bold text-white mt-0.5">{notifications.length}</p>
          </div>
          <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-400">
            <Bell className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Unread</p>
            <p className="text-lg font-bold text-rose-400 mt-0.5">{unreadCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Studio Generations</p>
            <p className="text-lg font-bold text-purple-400 mt-0.5">{studioCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Queue & Pinterest</p>
            <p className="text-lg font-bold text-brand-400 mt-0.5">{queueCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Share2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/35 shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35 shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/35 shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            Studio ({studioCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/35 shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            Queue & Pinterest ({queueCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            System & Alerts ({alertsCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brand-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Notification Feed */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            <p className="text-xs text-zinc-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center text-zinc-400">
              <Bell className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-sm font-semibold text-white">No notifications found</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              {searchQuery
                ? `No alerts matching "${searchQuery}". Try a different keyword.`
                : activeTab === 'unread'
                ? "You're all caught up! You have no unread notifications."
                : 'There are no notifications in this category right now.'}
            </p>
            <div className="pt-2 flex items-center gap-2">
              {searchQuery && (
                <Button size="sm" variant="secondary" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateTest}
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Send Test Notification
              </Button>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = getNotificationDetails(notif.type);
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                className={`group relative p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  notif.read
                    ? 'bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/60 hover:border-zinc-700/60'
                    : 'bg-zinc-900/80 border-brand-500/25 hover:border-brand-500/40 shadow-sm shadow-brand-500/5'
                }`}
              >
                {/* Left side: Icon + Content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Category Icon */}
                  <div
                    className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 sm:mt-0 ${config.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.badgeBg}`}>
                        {config.label}
                      </span>
                      <h3
                        className={`text-sm font-semibold tracking-tight truncate ${
                          notif.read ? 'text-zinc-300' : 'text-white'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500">
                      <span>{formatRelativeTime(notif.createdAt)}</span>
                      <span>•</span>
                      <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Action Link + Mark/Delete Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60 w-full sm:w-auto justify-end">
                  {/* Target Action Link */}
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-brand-400 hover:text-white bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/25 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {/* Mark as read / unread toggle */}
                  <button
                    type="button"
                    onClick={() => markAsRead(notif.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      notif.read
                        ? 'text-zinc-500 hover:text-zinc-300 border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800'
                        : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                    }`}
                    title={notif.read ? 'Mark as read' : 'Mark as read'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove Notification */}
                  <button
                    type="button"
                    onClick={() => removeNotification(notif.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 border border-zinc-800 bg-zinc-900/40 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Center Info & Live Feed Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Automated Notification Dispatcher</h4>
            <p className="text-[11px] text-zinc-400">
              PostCraft AI automatically registers notifications whenever Pinterest publishes jobs, scheduled queue tasks complete, or AI images are generated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/queue"
            className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-xl transition-colors whitespace-nowrap"
          >
            Manage Queue
          </Link>
          <Link
            href="/studio"
            className="px-3 py-1.5 text-xs font-semibold text-brand-300 hover:text-white bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/35 rounded-xl transition-colors whitespace-nowrap"
          >
            Open Studio
          </Link>
        </div>
      </div>
    </div>
  );
}

