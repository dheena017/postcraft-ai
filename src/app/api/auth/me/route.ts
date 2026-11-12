import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { UserSession } from '../login/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('postcraft_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    try {
      const user = JSON.parse(sessionCookie.value) as UserSession;
      return NextResponse.json({
        authenticated: true,
        user,
      });
    } catch {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }
  } catch (error) {
    logger.auth.error('Failed to verify session in /api/auth/me', error);
    return NextResponse.json(
      { authenticated: false, error: 'Session check failed' },
      { status: 500 }
    );
  }
}
