import { NextRequest, NextResponse } from 'next/server';
import { createBulkJobs } from '@/lib/db';
import { ParsedSheetRow } from '@/types/job';
import { AspectRatio, StylePresetId, LightingPresetId, AiModelId } from '@/types/image';
import { smartExpandPrompt } from '@/lib/ai/prompt-enhancer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      rows, 
      providerId = 'pinterest', 
      aspectRatio = '2:3', 
      stylePreset = 'aesthetic-minimal',
      model = 'flux',
      defaultBoard,
      scheduleIntervalHours = 0,
      limitRows = 0,
      source = 'GOOGLE_SHEETS',
      enhancePrompt = false,
    } = body as {
      rows: ParsedSheetRow[];
      providerId?: string;
      aspectRatio?: AspectRatio;
      stylePreset?: StylePresetId;
      lightingPreset?: LightingPresetId;
      model?: AiModelId;
      defaultBoard?: string;
      scheduleIntervalHours?: number;
      limitRows?: number;
      source?: 'GOOGLE_SHEETS' | 'CSV_UPLOAD';
      enhancePrompt?: boolean;
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided to schedule.' }, { status: 400 });
    }

    // Apply row limiter if selected (e.g. test batch of first 3 or 5 rows)
    const effectiveRows = limitRows > 0 ? rows.slice(0, limitRows) : rows;

    const baseTime = new Date();

    const jobsToCreate = effectiveRows.map((r, index) => {
      // Calculate scheduled time:
      let scheduledFor = r.scheduleTime;
      if (scheduleIntervalHours > 0) {
        const scheduledDate = new Date(baseTime.getTime() + index * scheduleIntervalHours * 60 * 60 * 1000);
        scheduledFor = scheduledDate.toISOString();
      } else if (!scheduledFor) {
        scheduledFor = new Date().toISOString();
      }

      const board = (r.board && r.board.trim().length > 0 && r.board !== 'General Ideas')
        ? r.board
        : (defaultBoard?.trim() || r.board || 'General Ideas');

      const rawPrompt = r.prompt?.trim() || '';
      const finalPrompt = enhancePrompt && rawPrompt ? smartExpandPrompt(rawPrompt) : rawPrompt;

      return {
        source: source,
        prompt: finalPrompt,
        title: r.title,
        description: r.description,
        boardName: board,
        destinationUrl: r.link,
        aspectRatio: aspectRatio,
        stylePreset: stylePreset,
        model: model,
        providerId: providerId,
        scheduledFor: scheduledFor,
        status: 'PENDING' as const,
      };
    });

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
