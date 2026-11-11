import { NextResponse } from 'next/server';
import { executeScheduledJobs } from '@/lib/scheduler/scheduler-service';

export async function POST() {
  try {
    const result = await executeScheduledJobs();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error running scheduler:', error);
    const message = error instanceof Error ? error.message : 'Scheduler execution failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
