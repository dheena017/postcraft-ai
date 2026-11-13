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
  | 'luxury-editorial'
  | 'cozy-foodie'
  | 'boho-botanical'
  | 'dark-academia'
  | 'pastel-dream'
  | 'old-money'
  | 'botanical-greenhouse'
  | 'isometric-3d'
  | 'street-editorial'
  | 'custom';

export type StyleCategory = 'all' | 'aesthetic' | 'interior' | 'art' | 'fashion-lifestyle';

export interface StylePreset {
  id: StylePresetId;
  name: string;
  description: string;
  promptSuffix: string;
  negativePrompt: string;
  previewGradient: string;
  category: StyleCategory;
}

export type LightingPresetId =
  | 'auto'
  | 'golden-hour'
  | 'morning-sun'
  | 'moody-cinematic'
  | 'studio-softbox'
  | 'neon-twilight';

export interface LightingPreset {
  id: LightingPresetId;
  name: string;
  icon: string;
  description: string;
  promptModifier: string;
}

export type OverlayTheme = 'glass' | 'minimal-dark' | 'minimal-light' | 'editorial' | 'bold-banner';
export type OverlayPosition = 'top' | 'center' | 'bottom';

export interface PinOverlayConfig {
  enabled: boolean;
  headline: string;
  subtext?: string;
  theme: OverlayTheme;
  position: OverlayPosition;
}

export type CanvasFilterPreset =
  | 'none'
  | 'warm-sun'
  | 'moody-noir'
  | 'pastel-bloom'
  | 'vibrant-pop'
  | 'vintage-film'
  | 'cyber-neon';

export interface ImageAdjustments {
  brightness: number; // -50 to 50, default 0
  contrast: number;   // -50 to 50, default 0
  saturation: number; // -50 to 50, default 0
  warmth: number;     // -50 to 50, default 0
}

export interface PinStickerConfig {
  showSaveBadge: boolean;
  saveBadgeTheme: 'red' | 'white' | 'glass' | 'dark';
  ctaBadge: {
    enabled: boolean;
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  priceTag: {
    enabled: boolean;
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  watermark: {
    enabled: boolean;
    text: string;
  };
}

export type CanvasViewMode = 'studio' | 'pinterest-mockup' | 'split-compare' | 'ambient-glow';


export type AiProviderId = 'pollinations' | 'aihorde' | 'google' | 'native';

export type AiModelId = 
  // Pollinations AI High-Performance GPU Cluster
  | 'flux' 
  | 'flux-realism' 
  | 'flux-anime' 
  | 'flux-3d' 
  | 'midjourney' 
  | 'turbo' 
  | 'any-dark' 
  | 'flux-cablyai' 
  | 'seedream' 
  | 'zimage'
  | 'dreamshaper'
  | 'playground'
  // AI Horde Decentralized Open GPU Network
  | 'horde-sdxl'
  | 'horde-realism'
  | 'horde-deliberate'
  // Google Cloud Vision Generative AI
  | 'google-imagen'
  // Native Procedural Zero-Fail Generator
  | 'native-vector';

export type AiModelCategory = 
  | 'Photorealism' 
  | 'Artistic & Cinematic' 
  | '3D & Animation' 
  | 'High Speed'
  | 'Decentralized Grid'
  | 'Offline Vector';

export interface AiModelConfig {
  id: AiModelId;
  name: string;
  shortName: string;
  provider: AiProviderId;
  providerName: string;
  category: AiModelCategory;
  description: string;
  speed: string;
  badgeText: string;
  badgeColor: string;
  accentGradient: string;
  isFree: boolean;
  isRecommended?: boolean;
  isDefault?: boolean;
}

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: AspectRatio;
  stylePreset?: StylePresetId;
  lightingPreset?: LightingPresetId;
  negativePrompt?: string;
  seed?: number;
  enhancePrompt?: boolean;
  model?: AiModelId;
  provider?: AiProviderId;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  enhancedPrompt: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  seed: number;
  model?: AiModelId;
  provider?: AiProviderId;
  createdAt: string;
}

export type EnhancementMode =
  | 'viral-pinterest'
  | 'photorealistic-8k'
  | 'editorial-vogue'
  | 'moody-cinematic'
  | 'boho-minimalist'
  | 'creative-remix';

export interface PromptAnalysis {
  score: number; // 0-100
  level: 'Basic' | 'Moderate' | 'Good' | 'Viral Ready' | 'Masterpiece';
  wordCount: number;
  detectedNiche: string;
  strengths: string[];
  missingElements: string[];
  suggestions: string[];
}

export interface EnhancedPromptResult {
  originalPrompt: string;
  enhancedPrompt: string;
  mode: EnhancementMode;
  detectedNiche: string;
  addedModifiers: string[];
  negativePrompt: string;
  pinTitle: string;
  pinDescription: string;
  hashtags: string[];
  suggestedRemixes: { label: string; modifier: string }[];
}

