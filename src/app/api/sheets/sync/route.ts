import { NextRequest, NextResponse } from 'next/server';
import { createBulkJobs } from '@/lib/db';
import { ParsedSheetRow } from '@/types/job';
import { AspectRatio, StylePresetId } from '@/types/image';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      rows, 
      providerId = 'pinterest', 
      aspectRatio = '2:3', 
      stylePreset = 'aesthetic-minimal',
      source = 'GOOGLE_SHEETS' 
    } = body as {
      rows: ParsedSheetRow[];
      providerId?: string;
      aspectRatio?: AspectRatio;
      stylePreset?: StylePresetId;
      source?: 'GOOGLE_SHEETS' | 'CSV_UPLOAD';
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided to schedule.' }, { status: 400 });
    }

    const jobsToCreate = rows.map((r) => ({
      source: source,
      prompt: r.prompt,
      title: r.title,
      description: r.description,
      boardName: r.board || 'General Ideas',
      destinationUrl: r.link,
      aspectRatio: aspectRatio,
      stylePreset: stylePreset,
      providerId: providerId,
      scheduledFor: r.scheduleTime || new Date().toISOString(),
      status: 'PENDING' as const,
    }));

    const created = await createBulkJobs(jobsToCreate);

    return NextResponse.json({
      success: true,
      count: created.length,
      jobs: created,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to schedule rows';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
