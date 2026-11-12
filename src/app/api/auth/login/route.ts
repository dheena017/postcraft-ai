import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'agency' | 'admin';
  avatarUrl: string;
  pinterestAccount?: string;
  createdAt: string;
}

const PRESET_USERS: Record<string, UserSession> = {
  creator: {
    id: 'usr_creator_01',
    name: 'Elena Rostova',
    email: 'elena.creator@postcraft.ai',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    pinterestAccount: '@elena_designs',
    createdAt: '2026-01-15T10:00:00Z',
  },
  agency: {
    id: 'usr_agency_02',
    name: 'Aesthetic Studios NYC',
    email: 'team@aestheticstudios.io',
    role: 'agency',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    pinterestAccount: '@aesthetic_nyc',
    createdAt: '2026-02-01T12:00:00Z',
  },
  admin: {
    id: 'usr_admin_00',
    name: 'Dev Operations',
    email: 'admin@postcraft.ai',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    pinterestAccount: '@postcraft_official',
    createdAt: '2025-12-01T08:00:00Z',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, persona } = body;

    logger.auth.info(`Login attempt initiated for: ${email || persona || 'guest'}`);

    let user: UserSession;

    // Check if demo persona instant login was selected
    if (persona && PRESET_USERS[persona]) {
      user = PRESET_USERS[persona];
    } else if (email) {
      // Custom credentials login
      const cleanEmail = email.trim().toLowerCase();
      const namePart = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      user = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        name: capitalized || 'Creative Creator',
        email: cleanEmail,
        role: 'creator',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        pinterestAccount: `@${cleanEmail.split('@')[0]}`,
        createdAt: new Date().toISOString(),
      };
    } else {
      user = PRESET_USERS.creator;
    }

    logger.auth.success(`User authenticated successfully: ${user.name} (${user.email}) [${user.role.toUpperCase()}]`);

    const response = NextResponse.json({
      success: true,
      message: 'Successfully authenticated',
      user,
    });

    // Set secure HTTP cookie
    response.cookies.set({
      name: 'postcraft_session',
      value: JSON.stringify(user),
      httpOnly: false, // Accessible to client auth provider
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    logger.auth.error('Authentication failure in /api/auth/login', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please verify credentials.' },
      { status: 500 }
    );
  }
}
