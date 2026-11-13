import { AiModelConfig, AiModelId, AiProviderId } from '@/types/image';

export const DEFAULT_AI_MODEL: AiModelId = 'flux';

export interface AiProviderInfo {
  id: AiProviderId;
  name: string;
  badge: string;
  description: string;
  isFreeAndUnlimited: boolean;
  accentColor: string;
}

export const AI_PROVIDERS: AiProviderInfo[] = [
  {
    id: 'pollinations',
    name: 'Pollinations AI Mesh',
    badge: 'CLOUD GPU',
    description: 'Ultra-fast cloud GPU cluster with Black Forest Labs FLUX & SDXL models.',
    isFreeAndUnlimited: true,
    accentColor: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
  },
  {
    id: 'aihorde',
    name: 'AI Horde Open Grid',
    badge: 'DECENTRALIZED',
    description: 'Decentralized crowdsourced voluntary GPU network running open Stable Diffusion.',
    isFreeAndUnlimited: true,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'google',
    name: 'Google Imagen / Gemini',
    badge: 'ENTERPRISE AI',
    description: 'High-fidelity Google DeepMind neural generative vision pipeline.',
    isFreeAndUnlimited: true,
    accentColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'native',
    name: 'PostCraft Native Engine',
    badge: 'OFFLINE / ZERO-FAIL',
    description: 'Instant client-side procedural SVG & vector pin generator that never fails.',
    isFreeAndUnlimited: true,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
];

export const AVAILABLE_AI_MODELS: AiModelConfig[] = [
  // ==========================================
  // 1. PHOTOREALISM & COMMERCIAL
  // ==========================================
  {
    id: 'flux',
    name: 'FLUX.1 Schnell (Flagship)',
    shortName: 'FLUX Schnell',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'Photorealism',
    description: 'State-of-the-art open-weights diffusion model. Balanced lighting, pristine detail, and precise prompt adherence.',
    speed: '~4-5s',
    badgeText: 'FLAGSHIP',
    badgeColor: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
    accentGradient: 'from-brand-500 to-indigo-600',
    isFree: true,
    isRecommended: true,
    isDefault: true,
  },
  {
    id: 'flux-realism',
    name: 'FLUX Realism Studio',
    shortName: 'FLUX Realism',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'Photorealism',
    description: 'Tuned for hyper-realistic DSLR photography, natural skin pores, studio depth-of-field, and authentic product shots.',
    speed: '~5-7s',
    badgeText: 'PRO PHOTO',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    accentGradient: 'from-emerald-500 to-teal-600',
    isFree: true,
    isRecommended: true,
  },
  {
    id: 'playground',
    name: 'Playground v2.5 Aesthetic',
    shortName: 'Playground v2.5',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'Photorealism',
    description: 'Exceptional architectural interiors, commercial furniture, and balanced natural daylight aesthetic.',
    speed: '~5-6s',
    badgeText: 'INTERIOR PRO',
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    accentGradient: 'from-teal-500 to-cyan-600',
    isFree: true,
  },
  {
    id: 'horde-realism',
    name: 'Realistic Vision v5 (AI Horde)',
    shortName: 'Realistic Vision',
    provider: 'aihorde',
    providerName: 'AI Horde',
    category: 'Photorealism',
    description: 'Decentralized crowdsourced photographic checkpoint. Natural skin textures and analog camera lighting.',
    speed: '~6-9s',
    badgeText: 'OPEN GRID',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    accentGradient: 'from-emerald-600 to-green-700',
    isFree: true,
  },

  // ==========================================
  // 2. ARTISTIC, CINEMATIC & CONCEPTUAL
  // ==========================================
  {
    id: 'midjourney',
    name: 'Midjourney Aesthetic v6',
    shortName: 'Midjourney v6',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'Artistic & Cinematic',
    description: 'High editorial styling, rich color grading, award-winning compositions, and luxury lifestyle vibes.',
    speed: '~5-7s',
    badgeText: 'EDITORIAL',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    accentGradient: 'from-purple-500 to-pink-600',
    isFree: true,
    isRecommended: true,
  },
  {
    id: 'any-dark',
    name: 'Any-Dark Cinematic',
    shortName: 'Any-Dark',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'Artistic & Cinematic',
    description: 'Deep moody shadows, neon-noir cyberpunk, high-contrast chiaroscuro, and gothic atmospheric visuals.',
    speed: '~4-6s',
    badgeText: 'DARK NOIR',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    accentGradient: 'from-cyan-500 to-blue-700',
    isFree: true,
  },
  {
    id: 'seedream',
    name: 'ByteDance Seedream',
    shortName: 'Seedream',
    provider: 'pollinations',
    providerName: 'ByteDance / Polli',
    category: 'Artistic & Cinematic',
    description: 'Artistic digital paintings, dynamic marketing posters, bold color palettes, and balanced typography layouts.',
    speed: '~4-5s',
    badgeText: 'CREATIVE',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    accentGradient: 'from-rose-500 to-red-600',
    isFree: true,
  },
  {
    id: 'flux-cablyai',
    name: 'FLUX Creative Engine',
    shortName: 'FLUX Cably',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'Artistic & Cinematic',
    description: 'Fine-tuned for complex multi-subject prompts, surreal concepts, and imaginative storytelling compositions.',
    speed: '~5-7s',
    badgeText: 'SURREAL',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    accentGradient: 'from-violet-500 to-fuchsia-600',
    isFree: true,
  },
  {
    id: 'dreamshaper',
    name: 'DreamShaper v8 LCM',
    shortName: 'DreamShaper',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'Artistic & Cinematic',
    description: 'Fantasy art, character illustrations, and stylized concept art powered by Latent Consistency Models.',
    speed: '~3-4s',
    badgeText: 'FANTASY ART',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    accentGradient: 'from-indigo-500 to-purple-600',
    isFree: true,
  },
  {
    id: 'horde-deliberate',
    name: 'Deliberate v2 (AI Horde)',
    shortName: 'Deliberate v2',
    provider: 'aihorde',
    providerName: 'AI Horde',
    category: 'Artistic & Cinematic',
    description: 'Fine-tuned decentralized model with high versatility for portraits, surreal scenes, and digital art.',
    speed: '~6-8s',
    badgeText: 'COMMUNITY',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    accentGradient: 'from-amber-600 to-yellow-600',
    isFree: true,
  },

  // ==========================================
  // 3. 3D & ANIMATION
  // ==========================================
  {
    id: 'flux-3d',
    name: 'FLUX 3D & CGI',
    shortName: 'FLUX 3D',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: '3D & Animation',
    description: 'Pixar/Disney 3D animation style, isometric claymation, octane CGI lighting, and ambient occlusion.',
    speed: '~5-6s',
    badgeText: '3D RENDER',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    accentGradient: 'from-blue-500 to-sky-600',
    isFree: true,
    isRecommended: true,
  },
  {
    id: 'flux-anime',
    name: 'FLUX Anime & Manga',
    shortName: 'FLUX Anime',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: '3D & Animation',
    description: 'Vibrant Japanese anime aesthetic, Makoto Shinkai lighting, clean cel-shading, and manga illustrations.',
    speed: '~4-5s',
    badgeText: 'ANIME',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    accentGradient: 'from-pink-500 to-rose-500',
    isFree: true,
    isRecommended: true,
  },

  // ==========================================
  // 4. HIGH SPEED & INSTANT PROTOTYPING
  // ==========================================
  {
    id: 'turbo',
    name: 'SDXL Turbo Lightning',
    shortName: 'SDXL Turbo',
    provider: 'pollinations',
    providerName: 'Stability AI / Polli',
    category: 'High Speed',
    description: 'Sub-2-second instant latent generation. Ideal for rapid brainstorming, live drafting, and fast pins.',
    speed: '~1-2s',
    badgeText: 'INSTANT 1.5s',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    accentGradient: 'from-amber-400 to-orange-500',
    isFree: true,
    isRecommended: true,
  },
  {
    id: 'zimage',
    name: 'Z-Image Turbo',
    shortName: 'Z-Image',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    category: 'High Speed',
    description: 'High-speed stylized vector and flat-lay digital art engine, crisp lines, and vibrant modern colors.',
    speed: '~2-3s',
    badgeText: 'FAST VECTOR',
    badgeColor: 'text-lime-400 bg-lime-500/10 border-lime-500/30',
    accentGradient: 'from-lime-400 to-emerald-600',
    isFree: true,
  },

  // ==========================================
  // 5. DECENTRALIZED GRID (AI HORDE)
  // ==========================================
  {
    id: 'horde-sdxl',
    name: 'SDXL 1.0 (AI Horde Mesh)',
    shortName: 'Horde SDXL',
    provider: 'aihorde',
    providerName: 'AI Horde Network',
    category: 'Decentralized Grid',
    description: 'Decentralized open-weights Stable Diffusion XL running on anonymous voluntary community nodes.',
    speed: '~5-8s',
    badgeText: 'OPEN MESH',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    accentGradient: 'from-emerald-500 to-green-600',
    isFree: true,
  },

  // ==========================================
  // 6. ENTERPRISE AI & ZERO-FAIL FALLBACKS
  // ==========================================
  {
    id: 'google-imagen',
    name: 'Google Imagen 3 (Gemini)',
    shortName: 'Google Imagen',
    provider: 'google',
    providerName: 'Google Cloud AI',
    category: 'Photorealism',
    description: 'Google DeepMind state-of-the-art vision model with high aesthetic nuance and rich typographic rendering.',
    speed: '~4-6s',
    badgeText: 'GOOGLE AI',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    accentGradient: 'from-blue-600 to-indigo-600',
    isFree: true,
  },
  {
    id: 'native-vector',
    name: 'PostCraft Procedural Vector',
    shortName: 'Native Vector',
    provider: 'native',
    providerName: 'PostCraft Engine',
    category: 'Offline Vector',
    description: 'Zero-latency procedural SVG canvas generator. Guaranteed 100% uptime without external cloud dependencies.',
    speed: '< 50ms',
    badgeText: 'INSTANT OFFLINE',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    accentGradient: 'from-cyan-500 to-sky-600',
    isFree: true,
  },
];

export function getModelConfig(modelId?: string): AiModelConfig {
  const found = AVAILABLE_AI_MODELS.find((m) => m.id === modelId);
  return found || AVAILABLE_AI_MODELS[0];
}

export function getModelsByProvider(providerId: AiProviderId): AiModelConfig[] {
  return AVAILABLE_AI_MODELS.filter((m) => m.provider === providerId);
}
