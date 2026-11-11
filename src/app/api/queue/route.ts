import { NextRequest, NextResponse } from 'next/server';
import { getAllJobs, createJob } from '@/lib/db';

export async function GET() {
  try {
    const jobs = await getAllJobs();
    return NextResponse.json(jobs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch queue jobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, title, description, boardName, destinationUrl, aspectRatio, stylePreset, providerId, scheduledFor } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const newJob = await createJob({
      source: 'MANUAL',
      prompt: prompt.trim(),
      title: (title || prompt).trim().slice(0, 100),
      description: (description || prompt).trim(),
      boardName: boardName || 'General Ideas',
      destinationUrl,
      aspectRatio: aspectRatio || '2:3',
      stylePreset: stylePreset || 'aesthetic-minimal',
      providerId: providerId || 'pinterest',
      scheduledFor: scheduledFor || new Date().toISOString(),
      status: 'PENDING',
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create queue job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
