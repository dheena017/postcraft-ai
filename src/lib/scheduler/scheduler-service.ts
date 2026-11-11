import { getAllJobs, updateJob, addToGallery } from '../db';
import { generateAiImage } from '../ai/image-generator';
import { providerRegistry } from '../providers/registry';

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

  const details: SchedulerRunResult['details'] = [];
  let publishedCount = 0;
  let failedCount = 0;

  for (const job of eligibleJobs) {
    try {
      let imageUrl = job.imageUrl;

      // Step 1: Synthesize AI Image if not yet created
      if (!imageUrl) {
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
      details.push({
        jobId: job.id,
        title: job.title,
        status: 'FAILED',
        error: errorMsg,
      });
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
