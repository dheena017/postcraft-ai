import { STYLE_PRESETS } from './presets';
import { StylePresetId } from '@/types/image';

export function enhancePrompt(
  rawPrompt: string,
  styleId?: StylePresetId,
  shouldEnhance: boolean = true
): { prompt: string; negativePrompt: string } {
  const cleanPrompt = rawPrompt.trim();
  const selectedStyle = STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];

  // Base anti-watermark negative prompt that strictly removes watermarks, stock photo tags, etc.
  const baseNegative = 'watermark, logo, text, label, stamp, copyright, signature, blurry, low quality, pixelated, jpeg artifacts, distorted, poorly drawn';
  const combinedNegative = selectedStyle.negativePrompt 
    ? `${baseNegative}, ${selectedStyle.negativePrompt}` 
    : baseNegative;

  if (!shouldEnhance) {
    return {
      prompt: cleanPrompt,
      negativePrompt: combinedNegative,
    };
  }

  // Combine user prompt with style enhancements
  const enhanced = `${cleanPrompt}, ${selectedStyle.promptSuffix}`;

  return {
    prompt: enhanced,
    negativePrompt: combinedNegative,
  };
}
