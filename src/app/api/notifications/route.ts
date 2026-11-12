import { NextRequest, NextResponse } from 'next/server';
import {
  getAllNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/lib/db';
import { NotificationType } from '@/types/notification';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notifications = await getAllNotifications();
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
      totalCount: notifications.length,
    });
  } catch (error) {
    logger.notifications.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', notifications: [], unreadCount: 0, totalCount: 0 },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, title, message, link } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const validTypes: NotificationType[] = ['SYSTEM', 'STUDIO', 'QUEUE', 'PIN', 'ALERT', 'SHEET'];
    const notifType: NotificationType = validTypes.includes(type) ? type : 'SYSTEM';

    const newNotification = await createNotification({
      type: notifType,
      title,
      message,
      link,
    });

    logger.notifications.info(`Notification dispatched: [${notifType}] "${title}"`);
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    logger.notifications.error('Failed to create notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, all, read } = body;

    if (all) {
      const updatedCount = await markAllNotificationsRead();
      logger.notifications.debug(`Marked ${updatedCount} notifications as read`);
      return NextResponse.json({ success: true, updatedCount });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const isRead = typeof read === 'boolean' ? read : true;
    const success = await markNotificationRead(id, isRead);

    return NextResponse.json({ success });
  } catch (error) {
    logger.notifications.error('Failed to update notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      const deletedCount = await clearAllNotifications();
      logger.notifications.info(`Cleared ${deletedCount} notifications from history`);
      return NextResponse.json({ success: true, deletedCount });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const success = await deleteNotification(id);
    return NextResponse.json({ success });
  } catch (error) {
    logger.notifications.error('Failed to delete notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
