import { NextRequest, NextResponse } from 'next/server';
import { generateAiImage } from '@/lib/ai/image-generator';
import { addToGallery, createNotification } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { prompt, aspectRatio, stylePreset, lightingPreset, negativePrompt, seed, enhancePrompt, model } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      logger.api.warn('POST /api/ai/generate rejected: prompt is required');
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const shortPrompt = prompt.length > 60 ? `${prompt.slice(0, 57)}...` : prompt;
    logger.ai.info(`Initiating synthesis: "${shortPrompt}" [model: ${model || 'flux'}, preset: ${stylePreset || 'default'}, lighting: ${lightingPreset || 'auto'}, ratio: ${aspectRatio || '2:3'}]`);

    const result = await generateAiImage({
      prompt,
      aspectRatio,
      stylePreset,
      lightingPreset,
      negativePrompt,
      seed,
      enhancePrompt,
      model,
    });

    const elapsed = Date.now() - startTime;
    logger.ai.success(`Image synthesis complete in ${elapsed}ms`, {
      seed: result.seed,
      model: result.model || model || 'flux',
      dimensions: `${result.width}x${result.height}`,
      preset: stylePreset,
    });

    // Save to local gallery history
    await addToGallery(result);
    logger.db.debug(`Persisted generation (seed: ${result.seed}, model: ${result.model || 'flux'}) to gallery repository`);

    // Create Studio Generation Notification
    try {
      const truncatedPrompt = prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt;
      await createNotification({
        type: 'STUDIO',
        title: 'New AI Graphic Generated',
        message: `Image synthesized with ${result.model || model || 'flux'}: "${truncatedPrompt}" (${aspectRatio || '2:3'})`,
        link: '/gallery',
      });
    } catch (e) {
      logger.notifications.warn('Failed to dispatch in-app notification for generation', e);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;
    logger.ai.error(`API /api/ai/generate error after ${elapsed}ms`, error);
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
