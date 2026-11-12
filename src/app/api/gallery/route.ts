import { NextResponse } from 'next/server';
import { getGallery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const images = await getGallery();
    return NextResponse.json(images);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch gallery';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
