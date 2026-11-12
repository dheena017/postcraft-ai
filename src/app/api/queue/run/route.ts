import { NextResponse } from 'next/server';
import { executeScheduledJobs } from '@/lib/scheduler/scheduler-service';
import { logger } from '@/lib/logger';

export async function POST() {
  logger.scheduler.info('Queue runner cycle triggered');
  try {
    const result = await executeScheduledJobs();
    logger.scheduler.success(
      `Queue execution cycle completed: ${result.processedCount} processed, ${result.publishedCount} published, ${result.failedCount} errors`
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.scheduler.error('Scheduler execution encountered critical failure', error);
    const message = error instanceof Error ? error.message : 'Scheduler execution failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
