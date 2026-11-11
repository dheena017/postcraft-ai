import { NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';

export async function GET() {
  try {
    const provider = providerRegistry.get('pinterest');
    if (!provider) {
      return NextResponse.json({ error: 'Pinterest provider not found' }, { status: 404 });
    }

    const boards = await provider.getChannels();
    return NextResponse.json(boards);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch Pinterest boards';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
