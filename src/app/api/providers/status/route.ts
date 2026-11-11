import { NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';

export async function GET() {
  try {
    const statuses = await providerRegistry.getStatuses();
    return NextResponse.json(statuses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch provider status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
