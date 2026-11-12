'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '@/types/notification';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  sendTestNotification: (customTitle?: string, customMessage?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll every 15 seconds for fresh notifications
    const interval = setInterval(fetchNotifications, 15000);

    // Cross-tab and in-window event sync
    const handleSync = () => fetchNotifications();
    window.addEventListener('postcraft:notifications-refresh', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('postcraft:notifications-refresh', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchNotifications]);

  const dispatchUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('postcraft:notifications-refresh'));
    }
  };

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      dispatchUpdate();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      dispatchUpdate();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
      fetchNotifications();
    }
  };

  const removeNotification = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    const wasUnread = target && !target.read;

    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      dispatchUpdate();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    // Optimistic UI update
    setNotifications([]);
    setUnreadCount(0);

    try {
      await fetch('/api/notifications?all=true', {
        method: 'DELETE',
      });
      dispatchUpdate();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      fetchNotifications();
    }
  };

  const sendTestNotification = async (
    customTitle = 'Live Notification Test',
    customMessage = 'This is a real-time notification alert dispatched to PostCraft AI.'
  ) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SYSTEM',
          title: customTitle,
          message: customMessage,
          link: '/notifications',
        }),
      });
      if (res.ok) {
        await fetchNotifications();
        dispatchUpdate();
      }
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

