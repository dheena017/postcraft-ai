import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSettings();
    const hasToken = Boolean(settings.pinterest.accessToken && settings.pinterest.accessToken.length > 5);
    
    return NextResponse.json({
      isConnected: hasToken,
      connectedAccountName: settings.pinterest.connectedAccountName || (hasToken ? 'Connected User' : null),
      clientId: settings.pinterest.clientId || '',
      defaultBoardId: settings.pinterest.defaultBoardId || '',
      hasToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get auth status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, clientId, clientSecret, defaultBoardId, connectedAccountName } = body;

    await updateSettings({
      pinterest: {
        accessToken: accessToken?.trim() || undefined,
        clientId: clientId?.trim() || undefined,
        clientSecret: clientSecret?.trim() || undefined,
        defaultBoardId: defaultBoardId?.trim() || undefined,
        connectedAccountName: connectedAccountName?.trim() || (accessToken ? 'Active Account' : undefined),
      },
    });

    return NextResponse.json({ success: true, message: 'Pinterest credentials saved successfully.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update Pinterest auth';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
