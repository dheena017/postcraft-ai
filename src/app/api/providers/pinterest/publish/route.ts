import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, imageUrl, destinationUrl, targetChannelId } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const provider = providerRegistry.get('pinterest');
    if (!provider) {
      return NextResponse.json({ error: 'Pinterest provider not found' }, { status: 404 });
    }

    const result = await provider.publish({
      title: title || 'New AI Creation',
      description: description || '',
      imageUrl,
      destinationUrl,
      targetChannelId: targetChannelId || 'board_default_1',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Publish to Pinterest failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
