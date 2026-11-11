import { ImageGenerationRequest, ImageGenerationResult, AspectRatio } from '@/types/image';
import { ASPECT_RATIOS } from './presets';
import { enhancePrompt } from './prompt-enhancer';

export async function generateAiImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
  const { prompt, aspectRatio = '2:3', stylePreset, negativePrompt, seed: requestedSeed, enhancePrompt: shouldEnhance = true } = request;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Image prompt cannot be empty');
  }

  // Determine dimensions based on Aspect Ratio
  const ratioConfig = ASPECT_RATIOS.find((r) => r.ratio === aspectRatio) || ASPECT_RATIOS[0];
  const { width, height } = ratioConfig;

  // Generate a random seed if none provided
  const seed = requestedSeed ?? Math.floor(Math.random() * 10000000);

  // Enhance prompt and build anti-watermark parameters
  const { prompt: enhanced, negativePrompt: antiWatermarkNegative } = enhancePrompt(prompt, stylePreset, shouldEnhance);

  // Combine any additional user negative prompt
  const finalNegative = negativePrompt 
    ? `${antiWatermarkNegative}, ${negativePrompt}` 
    : antiWatermarkNegative;

  // Generate with a +42px bottom padding to isolate the provider watermark,
  // allowing our engine to cleanly trim it off with zero loss of the artwork's native dimensions.
  const encodedPrompt = encodeURIComponent(enhanced);
  const encodedNegative = encodeURIComponent(finalNegative);
  const generationHeight = height + 42;
  const directImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${generationHeight}&seed=${seed}&nologo=true&model=flux&negative=${encodedNegative}`;

  return {
    imageUrl: directImageUrl,
    prompt: prompt.trim(),
    enhancedPrompt: enhanced,
    width,
    height,
    aspectRatio,
    seed,
    createdAt: new Date().toISOString(),
  };
}
