import { getAllJobs, updateJob, addToGallery, createNotification } from '../db';
import { generateAiImage } from '../ai/image-generator';
import { providerRegistry } from '../providers/registry';
import { logger } from '../logger';

export interface SchedulerRunResult {
  timestamp: string;
  processedCount: number;
  publishedCount: number;
  failedCount: number;
  details: Array<{
    jobId: string;
    title: string;
    status: string;
    error?: string;
  }>;
}

export async function executeScheduledJobs(): Promise<SchedulerRunResult> {
  const allJobs = await getAllJobs();
  const now = new Date().getTime();

  // Find jobs scheduled for now or in the past that are still pending or ready
  const eligibleJobs = allJobs.filter((job) => {
    if (job.status !== 'PENDING' && job.status !== 'READY') return false;
    const scheduleTime = new Date(job.scheduledFor).getTime();
    return scheduleTime <= now;
  });

  logger.scheduler.info(
    `Discovered ${eligibleJobs.length} eligible job(s) ready for execution (Total jobs in DB: ${allJobs.length})`
  );

  const details: SchedulerRunResult['details'] = [];
  let publishedCount = 0;
  let failedCount = 0;

  for (const job of eligibleJobs) {
    try {
      let imageUrl = job.imageUrl;

      // Step 1: Synthesize AI Image if not yet created
      if (!imageUrl) {
        logger.scheduler.info(`Job ${job.id}: Synthesizing pin image with prompt "${job.prompt.slice(0, 40)}..."`);
        await updateJob(job.id, { status: 'GENERATING' });
        const genResult = await generateAiImage({
          prompt: job.prompt,
          aspectRatio: job.aspectRatio || '2:3',
          stylePreset: job.stylePreset,
        });

        imageUrl = genResult.imageUrl;
        await updateJob(job.id, {
          imageUrl,
          enhancedPrompt: genResult.enhancedPrompt,
        });

        // Also add to gallery
        await addToGallery(genResult);
        logger.scheduler.debug(`Job ${job.id}: Image generated and archived to gallery`);
      }

      // Step 2: Publish via Provider
      await updateJob(job.id, { status: 'PUBLISHING' });
      const provider = providerRegistry.get(job.providerId) || providerRegistry.get('pinterest');

      if (!provider) {
        throw new Error(`Provider "${job.providerId}" not found in registry`);
      }

      const publishResult = await provider.publish({
        title: job.title,
        description: job.description,
        imageUrl: imageUrl,
        destinationUrl: job.destinationUrl,
        targetChannelId: job.boardName,
      });

      if (publishResult.success) {
        await updateJob(job.id, {
          status: 'PUBLISHED',
          externalPostId: publishResult.externalPostId,
          externalPostUrl: publishResult.externalPostUrl,
        });
        publishedCount++;
        logger.scheduler.success(`Job ${job.id} [${job.title}] published successfully`);
        details.push({
          jobId: job.id,
          title: job.title,
          status: 'PUBLISHED',
        });
      } else {
        await updateJob(job.id, {
          status: 'FAILED',
          errorMessage: publishResult.error,
          retryCount: job.retryCount + 1,
        });
        failedCount++;
        logger.scheduler.warn(`Job ${job.id} publication failed: ${publishResult.error}`);
        details.push({
          jobId: job.id,
          title: job.title,
          status: 'FAILED',
          error: publishResult.error,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await updateJob(job.id, {
        status: 'FAILED',
        errorMessage: errorMsg,
        retryCount: job.retryCount + 1,
      });
      failedCount++;
      logger.scheduler.error(`Job ${job.id} failed with critical exception: ${errorMsg}`);
      details.push({
        jobId: job.id,
        title: job.title,
        status: 'FAILED',
        error: errorMsg,
      });
    }
  }

  if (eligibleJobs.length > 0) {
    try {
      if (publishedCount > 0) {
        await createNotification({
          type: 'QUEUE',
          title: `Queue Published (${publishedCount} ${publishedCount === 1 ? 'Pin' : 'Pins'})`,
          message: `Successfully published ${publishedCount} scheduled pin(s) to Pinterest.`,
          link: '/queue',
        });
      }
      if (failedCount > 0) {
        await createNotification({
          type: 'ALERT',
          title: `Queue Failures (${failedCount})`,
          message: `${failedCount} pin(s) failed during scheduled execution. Check queue details.`,
          link: '/queue',
        });
      }
    } catch (e) {
      logger.scheduler.error('Failed to create scheduler notification:', e);
    }
  }

  return {
    timestamp: new Date().toISOString(),
    processedCount: eligibleJobs.length,
    publishedCount,
    failedCount,
    details,
  };
}
