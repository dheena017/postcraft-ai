import { NextRequest, NextResponse } from 'next/server';
import {
  expandPromptFull,
  analyzePrompt,
  getContextualRemixChips,
} from '@/lib/ai/prompt-enhancer';
import { EnhancementMode, StylePresetId, LightingPresetId } from '@/types/image';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      mode = 'viral-pinterest',
      stylePreset,
      lightingPreset,
    }: {
      prompt?: string;
      mode?: EnhancementMode;
      stylePreset?: StylePresetId;
      lightingPreset?: LightingPresetId;
    } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required for enhancement.' },
        { status: 400 }
      );
    }

    const trimmed = prompt.trim();
    logger.ai.info(`Enhancing prompt [mode: ${mode}]: "${trimmed.slice(0, 45)}..."`);

    // Run full rich enhancement
    const result = expandPromptFull(trimmed, {
      mode,
      styleId: stylePreset,
      lightingId: lightingPreset,
    });

    // Run quality & virality analysis on the newly enhanced prompt
    const analysis = analyzePrompt(result.enhancedPrompt);
    const contextualChips = getContextualRemixChips(trimmed);

    logger.ai.success(
      `Enhanced prompt successfully [score: ${analysis.score}%, niche: ${result.detectedNiche}]`
    );

    return NextResponse.json({
      success: true,
      originalPrompt: result.originalPrompt,
      enhancedPrompt: result.enhancedPrompt,
      mode: result.mode,
      detectedNiche: result.detectedNiche,
      addedModifiers: result.addedModifiers,
      negativePrompt: result.negativePrompt,
      pinTitle: result.pinTitle,
      pinDescription: result.pinDescription,
      hashtags: result.hashtags,
      suggestedRemixes: contextualChips,
      analysis,
    });
  } catch (error) {
    logger.ai.error('Error enhancing prompt', error);
    const message = error instanceof Error ? error.message : 'Failed to enhance prompt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
