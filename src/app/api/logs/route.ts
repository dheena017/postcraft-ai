import { NextRequest, NextResponse } from 'next/server';
import { logger, LogLevel, LogSource, LogEntry } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceParam = (searchParams.get('source') || 'all') as LogSource | 'all';
    const levelParam = (searchParams.get('level') || 'all') as LogLevel | 'all';
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '250', 10);

    const allLogs = logger.getHistory();

    const filteredLogs = logger.getHistory({
      source: sourceParam,
      level: levelParam,
      search,
      limit: isNaN(limit) ? 250 : limit,
    });

    // Compute live stats
    const stats = {
      total: allLogs.length,
      backend: allLogs.filter((l) => l.source === 'backend').length,
      frontend: allLogs.filter((l) => l.source === 'frontend').length,
      errors: allLogs.filter((l) => l.level === 'error').length,
      warnings: allLogs.filter((l) => l.level === 'warn').length,
    };

    return NextResponse.json({
      success: true,
      logs: filteredLogs,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let entries: Partial<LogEntry>[] = [];

    if (Array.isArray(body)) {
      entries = body;
    } else if (body && Array.isArray(body.logs)) {
      entries = body.logs;
    } else if (body && typeof body === 'object') {
      entries = [body];
    }

    let processed = 0;
    for (const entry of entries) {
      if (entry && typeof entry.message === 'string') {
        logger.recordRemoteLog({
          id: entry.id,
          timestamp: entry.timestamp,
          epoch: entry.epoch,
          level: entry.level || 'info',
          scope: entry.scope || 'FRONTEND',
          message: entry.message,
          data: entry.data,
          source: (entry.source === 'backend' ? 'backend' : 'frontend'),
        });
        processed++;
      }
    }

    return NextResponse.json({ success: true, count: processed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to ingest client logs';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceParam = (searchParams.get('source') || 'all') as LogSource | 'all';

    logger.clearHistory(sourceParam);

    return NextResponse.json({
      success: true,
      message: `Logs cleared successfully (${sourceParam}).`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to clear logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
