import { NextRequest, NextResponse } from 'next/server';
import { generateAiImage } from '@/lib/ai/image-generator';
import { addToGallery } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, aspectRatio, stylePreset, negativePrompt, seed, enhancePrompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await generateAiImage({
      prompt,
      aspectRatio,
      stylePreset,
      negativePrompt,
      seed,
      enhancePrompt,
    });

    // Save to local gallery history
    await addToGallery(result);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('API /api/ai/generate error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
