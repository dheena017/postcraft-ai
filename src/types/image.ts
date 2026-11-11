export type AspectRatio = '2:3' | '1:1' | '16:9' | '9:16';

export interface AspectRatioConfig {
  label: string;
  ratio: AspectRatio;
  width: number;
  height: number;
  description: string;
  isPinterestOptimal?: boolean;
}

export type StylePresetId = 
  | 'aesthetic-minimal'
  | 'photorealistic-8k'
  | 'watercolor-art'
  | 'interior-design'
  | 'modern-infographic'
  | 'vintage-retro'
  | 'cyberpunk-neon'
  | 'luxury-editorial';

export interface StylePreset {
  id: StylePresetId;
  name: string;
  description: string;
  promptSuffix: string;
  negativePrompt: string;
  previewGradient: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: AspectRatio;
  stylePreset?: StylePresetId;
  negativePrompt?: string;
  seed?: number;
  enhancePrompt?: boolean;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  enhancedPrompt: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  seed: number;
  createdAt: string;
}
