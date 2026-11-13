import { ImageGenerationRequest, ImageGenerationResult, AiModelId, AiProviderId } from '@/types/image';
import { ASPECT_RATIOS } from './presets';
import { enhancePrompt } from './prompt-enhancer';

// Map logical model ID to underlying neural gateway model identifier and provider
function resolveGatewayModel(modelId: AiModelId): { gatewayModel: string; provider: AiProviderId } {
  switch (modelId) {
    case 'flux':
      return { gatewayModel: 'flux', provider: 'pollinations' };
    case 'flux-realism':
      return { gatewayModel: 'flux-realism', provider: 'pollinations' };
    case 'flux-anime':
      return { gatewayModel: 'flux-anime', provider: 'pollinations' };
    case 'flux-3d':
      return { gatewayModel: 'flux-3d', provider: 'pollinations' };
    case 'flux-cablyai':
      return { gatewayModel: 'flux-cablyai', provider: 'pollinations' };
    case 'midjourney':
      return { gatewayModel: 'midjourney', provider: 'pollinations' };
    case 'turbo':
      return { gatewayModel: 'turbo', provider: 'pollinations' };
    case 'any-dark':
      return { gatewayModel: 'any-dark', provider: 'pollinations' };
    case 'seedream':
      return { gatewayModel: 'seedream', provider: 'pollinations' };
    case 'zimage':
      return { gatewayModel: 'zimage', provider: 'pollinations' };
    case 'dreamshaper':
      return { gatewayModel: 'dreamshaper', provider: 'pollinations' };
    case 'playground':
      return { gatewayModel: 'playground', provider: 'pollinations' };
    case 'horde-sdxl':
      return { gatewayModel: 'flux', provider: 'aihorde' };
    case 'horde-realism':
      return { gatewayModel: 'flux-realism', provider: 'aihorde' };
    case 'horde-deliberate':
      return { gatewayModel: 'deliberate', provider: 'aihorde' };
    case 'google-imagen':
      return { gatewayModel: 'flux-realism', provider: 'google' };
    case 'native-vector':
      return { gatewayModel: 'native', provider: 'native' };
    default:
      return { gatewayModel: 'flux', provider: 'pollinations' };
  }
}

// Procedural SVG Generator for Native Offline Zero-Fail Mode
function generateProceduralVectorImage(prompt: string, width: number, height: number, seed: number): string {
  const hues = [
    ['#4f46e5', '#06b6d4'],
    ['#ec4899', '#8b5cf6'],
    ['#f59e0b', '#ef4444'],
    ['#10b981', '#3b82f6'],
    ['#6366f1', '#a855f7'],
  ];
  const colorPair = hues[seed % hues.length];
  const cleanPrompt = prompt.slice(0, 80).replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPair[0]}"/>
        <stop offset="100%" stop-color="${colorPair[1]}"/>
      </linearGradient>
      <filter id="blur">
        <feGaussianBlur stdDeviation="80"/>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="#09090b"/>
    <circle cx="${width * 0.3}" cy="${height * 0.4}" r="${width * 0.45}" fill="url(#grad)" opacity="0.35" filter="url(#blur)"/>
    <circle cx="${width * 0.7}" cy="${height * 0.7}" r="${width * 0.35}" fill="${colorPair[1]}" opacity="0.25" filter="url(#blur)"/>
    <rect x="${width * 0.08}" y="${height * 0.08}" width="${width * 0.84}" height="${height * 0.84}" rx="28" fill="#18181b" fill-opacity="0.6" stroke="#27272a" stroke-width="2"/>
    <text x="${width * 0.5}" y="${height * 0.46}" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">PostCraft AI</text>
    <text x="${width * 0.5}" y="${height * 0.52}" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#e4e4e7" text-anchor="middle">${cleanPrompt}</text>
    <text x="${width * 0.5}" y="${height * 0.9}" font-family="monospace" font-size="13" fill="#71717a" text-anchor="middle">Seed: ${seed} · Native Vector Engine</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function generateAiImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
  const {
    prompt,
    aspectRatio = '2:3',
    stylePreset,
    lightingPreset = 'auto',
    negativePrompt,
    seed: requestedSeed,
    enhancePrompt: shouldEnhance = true,
    model = 'flux',
  } = request;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Image prompt cannot be empty');
  }

  // Determine dimensions based on Aspect Ratio
  const ratioConfig = ASPECT_RATIOS.find((r) => r.ratio === aspectRatio) || ASPECT_RATIOS[0];
  const { width, height } = ratioConfig;

  // Generate a random seed if none provided
  const seed = requestedSeed ?? Math.floor(Math.random() * 10000000);

  // Resolve target provider and gateway model
  const { gatewayModel, provider } = resolveGatewayModel(model);

  // Native Vector Zero-Fail Engine
  if (provider === 'native' || gatewayModel === 'native') {
    const nativeDataUrl = generateProceduralVectorImage(prompt, width, height, seed);
    return {
      imageUrl: nativeDataUrl,
      prompt: prompt.trim(),
      enhancedPrompt: prompt.trim(),
      width,
      height,
      aspectRatio,
      seed,
      model,
      provider,
      createdAt: new Date().toISOString(),
    };
  }

  // Enhance prompt and build anti-watermark parameters
  const { prompt: enhanced, negativePrompt: antiWatermarkNegative } = enhancePrompt(
    prompt,
    stylePreset,
    shouldEnhance,
    lightingPreset
  );

  // Combine any additional user negative prompt
  const finalNegative = negativePrompt 
    ? `${antiWatermarkNegative}, ${negativePrompt}` 
    : antiWatermarkNegative;

  // Generate with a +64px bottom padding (multiple of 64) to isolate provider watermark
  const encodedPrompt = encodeURIComponent(enhanced);
  const encodedNegative = encodeURIComponent(finalNegative);
  const generationHeight = height + 64;
  const directImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${generationHeight}&seed=${seed}&nologo=true&model=${gatewayModel}&negative=${encodedNegative}&enhance=true&quality=high`;

  return {
    imageUrl: directImageUrl,
    prompt: prompt.trim(),
    enhancedPrompt: enhanced,
    width,
    height,
    aspectRatio,
    seed,
    model,
    provider,
    createdAt: new Date().toISOString(),
  };
}
