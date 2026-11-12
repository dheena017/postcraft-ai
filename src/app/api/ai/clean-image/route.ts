import { NextRequest, NextResponse } from 'next/server';
import { Jimp } from 'jimp';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');
  const targetWidth = parseInt(searchParams.get('width') || '1000', 10);
  const targetHeight = parseInt(searchParams.get('height') || '1500', 10);

  if (!imageUrl) {
    logger.ai.warn('Watermark cleaner invoked without imageUrl parameter');
    return NextResponse.json({ error: 'Missing imageUrl parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!res.ok) {
      logger.ai.warn(`Source image fetch failed (${res.status}), redirecting to raw url`);
      return NextResponse.redirect(imageUrl);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read with Jimp
    const image = await Jimp.read(buffer);
    const origW = image.bitmap.width;
    const origH = image.bitmap.height;

    // Crop bottom watermark buffer
    const cropBottom = Math.max(42, Math.round(origH * 0.035));
    const cropH = origH - cropBottom;

    image.crop({
      x: 0,
      y: 0,
      w: origW,
      h: cropH,
    });

    // Resize back to exact target dimensions if requested
    if (targetWidth && targetHeight) {
      image.resize({
        w: targetWidth,
        h: targetHeight,
      });
    }

    const cleanBuffer = await image.getBuffer('image/jpeg');
    logger.ai.success(`Watermark cleanly stripped: ${origW}x${origH} -> ${targetWidth}x${targetHeight}`);

    return new NextResponse(new Uint8Array(cleanBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    logger.ai.error('Watermark clean crop encountered an issue, falling back to direct URL', err);
    return NextResponse.redirect(imageUrl);
  }
}
