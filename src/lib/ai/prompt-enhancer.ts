import { STYLE_PRESETS, LIGHTING_PRESETS, INSPIRATION_CATEGORIES } from './presets';
import {
  StylePresetId,
  LightingPresetId,
  EnhancementMode,
  PromptAnalysis,
  EnhancedPromptResult,
} from '@/types/image';

// ---------------------------------------------------------------------------
// Niche Knowledge Bases for Context-Aware Enhancement
// ---------------------------------------------------------------------------
interface NicheDefinition {
  keywords: string[];
  name: string;
  subjectEnhancers: string[];
  lightingEnhancers: string[];
  cameraEnhancers: string[];
  stylingEnhancers: string[];
  negativeEnhancers: string;
  remixChips: { label: string; modifier: string }[];
  seoKeywords: string[];
}

const NICHE_DEFINITIONS: Record<string, NicheDefinition> = {
  interior: {
    name: 'Interior & Architecture',
    keywords: [
      'room', 'decor', 'interior', 'kitchen', 'living', 'bedroom', 'bathroom', 'scandinavian',
      'boho', 'minimalist', 'furniture', 'dining', 'sofa', 'loft', 'apartment', 'house',
      'homestyle', 'architecture', 'shelf', 'desk', 'office', 'entryway', 'patio', 'balcony',
    ],
    subjectEnhancers: [
      'scandinavian oak wood and tactile linen textures',
      'curated aesthetic home staging with potted olive tree',
      'organic travertine stone and ceramic decor accents',
      'neutral warm beige and soft limewash plaster walls',
      'bespoke modular furniture with clean architectural lines',
    ],
    lightingEnhancers: [
      'soft morning sunlight streaming through sheer linen drapery',
      'warm ambient indirect lighting with soft architectural shadows',
      'airy diffused north-facing window illumination',
      'golden afternoon rays casting dappled leaf shadows across the floor',
    ],
    cameraEnhancers: [
      'wide-angle interior architectural photography',
      'shot on Sony A7R V with 24-70mm lens at f/8 for razor-sharp room depth',
      'Architectural Digest magazine editorial interior composition',
      'eye-level symmetrical room perspective with clean vertical lines',
    ],
    stylingEnhancers: [
      'Kinfolk inspired serene aesthetic',
      'uncluttered harmonious layout with generous breathing room',
      'curated coffee table books and sculptural ceramic vessels',
    ],
    negativeEnhancers: 'clutter, distorted perspective, oversaturated walls, dark dingy corners, fisheye distortion, crooked walls',
    remixChips: [
      { label: 'Japandi Wood', modifier: ', natural light oak wood, serene Japandi styling' },
      { label: 'Morning Sun', modifier: ', warm morning sunlight pouring through linen curtains' },
      { label: 'Limewash Walls', modifier: ', textural neutral limewash plaster wall finish' },
      { label: 'Olive Tree', modifier: ', potted sculptural olive tree in rustic terracotta urn' },
      { label: 'Travertine Table', modifier: ', organic curved travertine marble coffee table' },
      { label: 'Arch Digest', modifier: ', Architectural Digest featured interior photography' },
    ],
    seoKeywords: ['HomeDecorIdeas', 'InteriorInspo', 'AestheticHome', 'ScandinavianDecor', 'RoomMakeover'],
  },

  food: {
    name: 'Food & Culinary',
    keywords: [
      'food', 'recipe', 'coffee', 'matcha', 'breakfast', 'pasta', 'pastry', 'dessert',
      'cake', 'cocktail', 'salad', 'soup', 'dinner', 'bakery', 'latte', 'dish', 'meal',
      'culinary', 'pizza', 'smoothie', 'cookie', 'bread', 'sourdough', 'brunch', 'tea',
    ],
    subjectEnhancers: [
      'appetizing professional food styling with fresh artisanal ingredients',
      'handcrafted speckled ceramic tableware and delicate linen napkin backdrop',
      'glistening fresh organic garnish and macro food textures',
      'mouth-watering gourmet culinary presentation',
      'delicate steam wisps and velvety silky sauce drizzle',
    ],
    lightingEnhancers: [
      'soft side natural dining window light with gentle directional falloff',
      'warm golden bistro afternoon ambient glow',
      'delicate culinary specular highlights and soft bokeh shadows',
      'diffused daylight highlighting fresh droplets and textures',
    ],
    cameraEnhancers: [
      'overhead flatlay composition with balanced visual weight',
      'shot on Canon 50mm f/1.4 lens with creamy shallow depth of field',
      'Bon Appétit magazine editorial food photography',
      '45-degree intimate macro angle showcasing exquisite food layer details',
    ],
    stylingEnhancers: [
      'rustic wooden board staging with scattered sea salt flakes and thyme',
      'Pinterest viral recipe aesthetic with vibrant natural colors',
      'slow-food artisanal bistro ambiance',
    ],
    negativeEnhancers: 'unappetizing, plastic food, dull colors, oversaturated yellow, messy sauce splatters, blurry focus, artificial sheen',
    remixChips: [
      { label: 'Flatlay Styling', modifier: ', top-down flatlay composition, rustic ceramic tableware' },
      { label: 'Morning Coffee', modifier: ', steaming silky latte art in handcrafted pottery mug' },
      { label: 'Fresh Garnish', modifier: ', fresh herb garnish with glistening macro water droplets' },
      { label: 'Bistro Light', modifier: ', warm Parisian cafe window light, soft bokeh' },
      { label: 'Artisanal Bread', modifier: ', crusty sourdough with rich open crumb texture' },
      { label: 'Bon Appétit', modifier: ', Bon Appétit magazine editorial food shoot' },
    ],
    seoKeywords: ['FoodieFavorites', 'RecipeInspiration', 'EasyRecipes', 'AestheticFood', 'BakingInspo'],
  },

  fashion_portrait: {
    name: 'Fashion & Style',
    keywords: [
      'outfit', 'model', 'fashion', 'portrait', 'girl', 'woman', 'man', 'wear', 'coat',
      'jacket', 'dress', 'streetwear', 'aesthetic pose', 'shoes', 'sneaker', 'sunglasses',
      'jewelry', 'runway', 'clothing', 'ootd', 'wardrobe', 'vintage dress', 'denim',
    ],
    subjectEnhancers: [
      'effortless high-fashion street style coordination',
      'haute couture tailoring with rich tactile fabric draping and movement',
      'natural refined posture with sophisticated effortless confidence',
      'crisp silk, cashmere, and heavyweight cotton textural details',
    ],
    lightingEnhancers: [
      'golden hour rim light with soft diffused face fill',
      'moody Parisian afternoon outdoor overcast lighting',
      'editorial studio beauty dish illumination with soft sculpted shadows',
      'cinematic backlight creating a delicate luminous silhouette glow',
    ],
    cameraEnhancers: [
      'shot on Hasselblad 85mm portrait lens at f/1.8',
      'stunning editorial Vogue cover photo composition',
      'subtle organic film grain with creamy subject bokeh',
      'medium full-body fashion editorial framing with urban architectural backdrop',
    ],
    stylingEnhancers: [
      'timeless neutral color palette with bold minimalist accessories',
      'effortlessly tousled hair and luminous natural makeup',
      'Pinterest viral OOTD capsule wardrobe aesthetic',
    ],
    negativeEnhancers: 'bad anatomy, deformed fingers, extra limbs, plastic doll skin, uncanny valley, crossed eyes, blurry face, stiff pose',
    remixChips: [
      { label: 'Vogue Editorial', modifier: ', Vogue magazine high fashion editorial photography' },
      { label: 'Golden Hour Rim', modifier: ', golden hour backlit halo lighting, lens flare' },
      { label: 'Minimalist OOTD', modifier: ', minimalist capsule wardrobe, clean street style' },
      { label: '35mm Film Grain', modifier: ', shot on 35mm Kodak Portra 400 film, authentic grain' },
      { label: 'Parisian Chic', modifier: ', effortless Parisian chic street style, Haussmann backdrop' },
      { label: 'Luxury Tailoring', modifier: ', immaculate Italian wool tailoring, brass button accents' },
    ],
    seoKeywords: ['OOTDInspo', 'FashionTrends', 'CapsuleWardrobe', 'StreetStyle', 'OutfitAesthetic'],
  },

  beauty_wellness: {
    name: 'Beauty & Skincare',
    keywords: [
      'skincare', 'beauty', 'makeup', 'cosmetics', 'serum', 'cream', 'lotion', 'spa',
      'wellness', 'bath', 'glowing skin', 'facial', 'perfume', 'self-care', 'lips',
      'nails', 'haircare', 'soap', 'candle', 'routine', 'glow',
    ],
    subjectEnhancers: [
      'dewy luminous glass skin with authentic radiant texture',
      'luxurious frosted glass cosmetic bottle with droplets of fresh water',
      'botanical eucalyptus and clean minimalist marble vanity staging',
      'clean botanical self-care aesthetic with natural ingredients',
    ],
    lightingEnhancers: [
      'ultra-soft diffused cosmetic vanity lighting',
      'clean daylight bounce creating radiant gentle specular highlights',
      'serene morning spa ambience with warm gentle tones',
    ],
    cameraEnhancers: [
      'macro beauty photography with razor-sharp droplet details',
      'shot on 100mm f/2.8 macro lens for crisp botanical & skin fidelity',
      'Allure magazine beauty editorial composition',
    ],
    stylingEnhancers: [
      'minimalist pastel background with clean organic textures',
      'water ripple reflections and glistening product textures',
    ],
    negativeEnhancers: 'airbrushed fake skin, pores erased, greasy shine, muddy makeup, clumpy mascara, artificial CGI, blotchy',
    remixChips: [
      { label: 'Glass Skin Glow', modifier: ', radiant dewy glass skin texture, natural flush' },
      { label: 'Water Droplets', modifier: ', crisp macro water droplets on frosted glass bottle' },
      { label: 'Marble Vanity', modifier: ', white Carrara marble vanity with dried eucalyptus' },
      { label: 'Spa Aesthetic', modifier: ', tranquil luxury spa sanctuary atmosphere, warm towels' },
      { label: 'Pastel Clean', modifier: ', clean minimalist soft pastel packaging aesthetic' },
    ],
    seoKeywords: ['SkincareRoutine', 'GlowUp', 'CleanBeauty', 'SelfCareSunday', 'AestheticWellness'],
  },

  travel_landscape: {
    name: 'Travel & Nature',
    keywords: [
      'travel', 'landscape', 'mountain', 'beach', 'ocean', 'lake', 'forest', 'sunset',
      'sunrise', 'island', 'city', 'road', 'view', 'nature', 'vacation', 'sea', 'canyon',
      'wanderlust', 'coast', 'resort', 'waterfall', 'desert', 'hiking', 'scenic',
    ],
    subjectEnhancers: [
      'breathtaking scenic vista with sweeping natural grandeur',
      'atmospheric mountain mist drifting across pine valleys',
      'pristine turquoise coastal waters and golden sand ripples',
      'curated wanderlust travel destination composition',
      'majestic geological rock formations and untouched wilderness',
    ],
    lightingEnhancers: [
      'radiant golden hour sun flare cresting the mountain ridge',
      'dramatic cinematic twilight with warm atmospheric haze',
      'majestic volumetric god rays piercing dramatic storm clouds',
      'crystalline blue-hour glow reflecting on calm water surfaces',
    ],
    cameraEnhancers: [
      'shot on 16-35mm wide angle landscape lens for epic spatial scale',
      'National Geographic award-winning landscape composition',
      'infinite depth of field with crystal-clear horizon detail',
      'leading lines drawing the eye toward distant majestic peaks',
    ],
    stylingEnhancers: [
      'authentic travel documentary photography',
      'serene contemplation of nature with vibrant natural earth tones',
    ],
    negativeEnhancers: 'overprocessed HDR, cartoon skies, nuclear green grass, tourist crowds, muddy foreground, jpeg artifacts',
    remixChips: [
      { label: 'Golden Hour Vista', modifier: ', sweeping golden hour mountain vista, warm sun flare' },
      { label: 'Turquoise Coast', modifier: ', crystal clear Mediterranean turquoise waters, rocky cliffs' },
      { label: 'Misty Forest', modifier: ', atmospheric morning fog rolling through evergreen pines' },
      { label: 'Desert Sunset', modifier: ', warm terracotta desert dunes under pastel dusk sky' },
      { label: 'NatGeo 8K', modifier: ', National Geographic award-winning landscape photography' },
    ],
    seoKeywords: ['TravelGoals', 'Wanderlust', 'TravelBucketList', 'ScenicViews', 'AdventureAwaits'],
  },

  product_mockup: {
    name: 'Product & Branding',
    keywords: [
      'product', 'mockup', 'packaging', 'brand', 'box', 'bottle', 'jar', 'label',
      'stationery', 'candle', 'mug', 'canvas', 'pouch', 'merchandise', 'flatlay',
      'tote', 'business card', 'branding', 'pack', 'container',
    ],
    subjectEnhancers: [
      'premium minimalist commercial product presentation',
      'tastefully placed organic props like travertine stone and dried botanicals',
      'ample clean negative space thoughtfully reserved for Pinterest typography',
      'luxury unboxing aesthetic with tactile cardstock texture',
    ],
    lightingEnhancers: [
      'clean dual-softbox commercial studio lighting',
      'sculpted soft shadows casting elegant diagonal patterns',
      'balanced neutral daylight studio environment',
    ],
    cameraEnhancers: [
      'straight-on 90-degree commercial catalog photography',
      'shot on 70mm lens at f/5.6 for pin-sharp product edge clarity',
      'Behance featured branding mockup composition',
    ],
    stylingEnhancers: [
      'sleek modern aesthetic suitable for high-converting marketing pins',
      'harmonious color-coordinated background styling',
    ],
    negativeEnhancers: 'harsh reflections, crooked angles, low resolution logo, distracting background clutter, poor contrast',
    remixChips: [
      { label: 'Studio Softbox', modifier: ', clean dual softbox studio lighting, soft shadows' },
      { label: 'Travertine Props', modifier: ', styled with raw travertine stone pedestals and palm fronds' },
      { label: 'Typography Space', modifier: ', generous negative space designed for bold typography overlay' },
      { label: 'Commercial 8K', modifier: ', commercial product advertising photography, 8k crisp details' },
    ],
    seoKeywords: ['ProductPhotography', 'BrandDesign', 'MockupDesign', 'SmallBusinessInspo', 'PackagingDesign'],
  },

  cozy_lifestyle: {
    name: 'Cozy & Hygge',
    keywords: [
      'cozy', 'hygge', 'autumn', 'winter', 'book', 'tea', 'candle', 'rain', 'fireplace',
      'wool', 'blanket', 'knit', 'morning', 'cafe', 'warm', 'chill', 'study', 'journal',
      'pajamas', 'slippers', 'cottage', 'cabin', 'snuggle',
    ],
    subjectEnhancers: [
      'inviting hygge lifestyle setting with chunky knit merino wool blanket',
      'steaming handcrafted ceramic mug with delicate froth',
      'ambient flickering beeswax candle and vintage brass accents',
      'peaceful slow-living Sunday morning atmosphere',
    ],
    lightingEnhancers: [
      'warm amber candlelight combined with gloomy rainy window daylight',
      'soft golden lamp glow illuminating rich wooden textures',
      'dreamy gentle shadows and comforting warm 2700K color temperature',
    ],
    cameraEnhancers: [
      'shot on 35mm f/1.8 lens with cozy intimate perspective',
      'Kinfolk magazine slow-living lifestyle photography',
      'authentic warmth with subtle analog film grain',
    ],
    stylingEnhancers: [
      'curated stack of antique linen books and dried cinnamon sticks',
      'cottagecore and dark academia aesthetic nuances',
    ],
    negativeEnhancers: 'cold clinical lighting, sterile environment, fluorescent glare, sharp neon, harsh contrast',
    remixChips: [
      { label: 'Rainy Day Hygge', modifier: ', rainy window backdrop, steaming mug, chunky knit blanket' },
      { label: 'Candlelight Glow', modifier: ', warm flickering beeswax candlelight, amber shadows' },
      { label: 'Autumn Leaves', modifier: ', warm autumn color palette with golden oak leaves' },
      { label: 'Kinfolk Living', modifier: ', Kinfolk magazine slow-living lifestyle aesthetic' },
    ],
    seoKeywords: ['CozyVibes', 'HyggeHome', 'AutumnAesthetic', 'SlowLiving', 'WarmAndCozy'],
  },
};

// Default fallback modifiers when no specific niche is detected
const DEFAULT_NICHE: NicheDefinition = {
  name: 'Aesthetic Lifestyle',
  keywords: [],
  subjectEnhancers: [
    'ultra-detailed aesthetic composition with harmonious visual balance',
    'tactile organic textures and refined editorial styling',
    'Pinterest viral visual hook optimized for mobile engagement',
    'subtle authentic nuances and crisp high-resolution definition',
  ],
  lightingEnhancers: [
    'soft natural cinematic lighting with warm diffused atmosphere',
    'golden hour rim illumination with gentle flattering fill',
    'delicate chiaroscuro play between highlights and soft shadows',
  ],
  cameraEnhancers: [
    'shot on 35mm f/1.8 lens with natural depth of field',
    'Kinfolk magazine editorial styling and art direction',
    'crisp Hasselblad medium format photography details',
  ],
  stylingEnhancers: [
    'timeless aesthetic with elegant color coordination',
    'clean negative space suitable for graphic text overlay',
  ],
  negativeEnhancers: 'watermark, logo, text, label, stamp, copyright, signature, blurry, low quality, pixelated, jpeg artifacts, distorted, poorly drawn',
  remixChips: [
    { label: '35mm Film', modifier: ', shot on 35mm lens, natural film grain, Kodak Portra aesthetic' },
    { label: 'Golden Hour', modifier: ', bathed in golden hour sunlight, warm amber rim lighting' },
    { label: 'Editorial 8K', modifier: ', high fashion editorial magazine photography, 8k crisp details' },
    { label: 'Boho Minimal', modifier: ', serene bohemian minimalist aesthetic, earthy neutral tones' },
    { label: 'Moody Cinematic', modifier: ', cinematic moody shadows, dramatic film noir lighting, 35mm' },
    { label: 'Pastel Dream', modifier: ', soft pastel color palette, dreamy airy lighting, gentle bokeh' },
  ],
  seoKeywords: ['PinterestAesthetic', 'VisualInspiration', 'TrendingAesthetic', 'MoodBoard', 'DailyInspo'],
};

// ---------------------------------------------------------------------------
// Mode Modifiers for Stylistic Directives
// ---------------------------------------------------------------------------
const MODE_DIRECTIVES: Record<EnhancementMode, { suffix: string; label: string }> = {
  'viral-pinterest': {
    suffix: 'Pinterest trending viral aesthetic, bright airy composition, clean negative space, striking visual hook, high engagement',
    label: 'Viral Pinterest',
  },
  'photorealistic-8k': {
    suffix: 'photorealistic raw photography, shot on Hasselblad H6D-100c, 85mm f/1.4 lens, natural skin and material textures, authentic depth of field, 8k resolution',
    label: '8K Photorealistic',
  },
  'editorial-vogue': {
    suffix: 'high-end luxury editorial photography, Vogue magazine art direction, dramatic and elegant composition, opulent styling, museum-grade aesthetic',
    label: 'Vogue Editorial',
  },
  'moody-cinematic': {
    suffix: 'cinematic 35mm film still, dramatic chiaroscuro shadows, Kodak Vision3 500T color grading, evocative storytelling mood, anamorphic lens blur',
    label: 'Moody Cinematic',
  },
  'boho-minimalist': {
    suffix: 'serene bohemian Japandi minimalism, wabi-sabi organic textures, earthy palette of beige, terracotta and sage, warm quiet luxury',
    label: 'Boho Minimalist',
  },
  'creative-remix': {
    suffix: 'unexpected creative aesthetic fusion, striking chromatic balance, award-winning contemporary art direction, vivid tactile contrast',
    label: 'Creative Remix',
  },
};

// ---------------------------------------------------------------------------
// Helper: Detect the primary niche of a prompt
// ---------------------------------------------------------------------------
export function detectPromptNiche(prompt: string): { key: string; niche: NicheDefinition } {
  const lower = prompt.toLowerCase();
  let bestMatchKey = 'default';
  let bestMatchScore = 0;

  for (const [key, niche] of Object.entries(NICHE_DEFINITIONS)) {
    let score = 0;
    for (const kw of niche.keywords) {
      if (lower.includes(kw)) {
        score += kw.length > 5 ? 2 : 1; // Prioritize longer, more specific keywords
      }
    }
    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatchKey = key;
    }
  }

  return {
    key: bestMatchKey,
    niche: bestMatchKey !== 'default' ? NICHE_DEFINITIONS[bestMatchKey] : DEFAULT_NICHE,
  };
}

// ---------------------------------------------------------------------------
// Helper: Clean, deduplicate, and join prompt segments
// ---------------------------------------------------------------------------
function cleanAndDeduplicatePrompt(basePrompt: string, additions: string[]): string {
  const cleanBase = basePrompt
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/^[, ]+|[, ]+$/g, '')
    .trim();

  const existingTokens = cleanBase.toLowerCase().split(/[\s,]+/);

  const filteredAdditions: string[] = [];
  for (const item of additions) {
    const cleanItem = item.trim().replace(/^[, ]+|[, ]+$/g, '');
    if (!cleanItem) continue;

    // Check if item's primary words are already substantially included
    const itemWords = cleanItem.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const overlapCount = itemWords.filter((w) => existingTokens.includes(w)).length;

    // If more than 60% of words exist in base prompt, skip to prevent redundancy
    if (itemWords.length > 0 && overlapCount / itemWords.length > 0.6) {
      continue;
    }

    filteredAdditions.push(cleanItem);
  }

  if (filteredAdditions.length === 0) {
    return cleanBase;
  }

  return `${cleanBase}, ${filteredAdditions.join(', ')}`;
}

// ---------------------------------------------------------------------------
// 1. Core Generator: enhancePrompt (Compatible with Image Generator pipeline)
// ---------------------------------------------------------------------------
export function enhancePrompt(
  rawPrompt: string,
  styleId?: StylePresetId,
  shouldEnhance: boolean = true,
  lightingId?: LightingPresetId
): { prompt: string; negativePrompt: string } {
  const cleanPrompt = rawPrompt.trim();
  const selectedStyle = STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];
  const selectedLighting = LIGHTING_PRESETS.find((l) => l.id === lightingId);
  const { niche } = detectPromptNiche(cleanPrompt);

  // Base anti-watermark negative prompt that strictly removes watermarks, stock photo tags, etc.
  const baseNegative =
    'watermark, logo, text, label, stamp, copyright, signature, blurry, low quality, pixelated, jpeg artifacts, distorted, poorly drawn';
  
  const nicheNegative = niche.negativeEnhancers;
  const styleNegative = selectedStyle.negativePrompt;
  
  const combinedNegativeParts = [baseNegative];
  if (nicheNegative) combinedNegativeParts.push(nicheNegative);
  if (styleNegative) combinedNegativeParts.push(styleNegative);
  const combinedNegative = Array.from(new Set(combinedNegativeParts.join(', ').split(',').map((s) => s.trim()))).join(', ');

  if (!shouldEnhance) {
    let unenhanced = cleanPrompt;
    if (selectedLighting && selectedLighting.promptModifier) {
      unenhanced += `, ${selectedLighting.promptModifier}`;
    }
    return {
      prompt: unenhanced,
      negativePrompt: combinedNegative,
    };
  }

  // Combine user prompt with style enhancements & lighting
  const parts = [cleanPrompt];
  if (selectedStyle.promptSuffix) {
    parts.push(selectedStyle.promptSuffix);
  }
  if (selectedLighting && selectedLighting.promptModifier) {
    parts.push(selectedLighting.promptModifier);
  }

  return {
    prompt: parts.join(', '),
    negativePrompt: combinedNegative,
  };
}

// ---------------------------------------------------------------------------
// 2. Smart Expand Prompt (Multi-mode & Niche-Aware)
// ---------------------------------------------------------------------------
export function smartExpandPrompt(
  rawPrompt: string,
  mode: EnhancementMode = 'viral-pinterest'
): string {
  const trimmed = rawPrompt.trim();
  if (!trimmed) {
    return getRandomInspiration();
  }

  const { niche } = detectPromptNiche(trimmed);
  const modeObj = MODE_DIRECTIVES[mode] || MODE_DIRECTIVES['viral-pinterest'];

  // Randomize selections to produce fresh output on repeated clicks
  const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const selectedSubject = pickRandom(niche.subjectEnhancers);
  const selectedLighting = pickRandom(niche.lightingEnhancers);
  const selectedCamera = pickRandom(niche.cameraEnhancers);

  const additions = [
    selectedSubject,
    selectedLighting,
    selectedCamera,
    modeObj.suffix,
  ];

  return cleanAndDeduplicatePrompt(trimmed, additions);
}

// ---------------------------------------------------------------------------
// 3. Full Rich Expansion: expandPromptFull
// ---------------------------------------------------------------------------
export function expandPromptFull(
  rawPrompt: string,
  options: {
    mode?: EnhancementMode;
    styleId?: StylePresetId;
    lightingId?: LightingPresetId;
  } = {}
): EnhancedPromptResult {
  const mode = options.mode || 'viral-pinterest';
  const trimmed = rawPrompt.trim() || getRandomInspiration();
  const { niche } = detectPromptNiche(trimmed);
  const modeObj = MODE_DIRECTIVES[mode];

  // Pick random aesthetic enhancements
  const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const subjectMod = pickRandom(niche.subjectEnhancers);
  const lightingMod = pickRandom(niche.lightingEnhancers);
  const cameraMod = pickRandom(niche.cameraEnhancers);

  const addedModifiers = [subjectMod, lightingMod, cameraMod, modeObj.suffix];
  const enhancedPrompt = cleanAndDeduplicatePrompt(trimmed, addedModifiers);

  // Negative prompt
  const baseNegative = 'watermark, logo, text, label, stamp, copyright, signature, blurry, low quality, pixelated, jpeg artifacts, distorted, poorly drawn';
  const negativePrompt = `${baseNegative}, ${niche.negativeEnhancers}`;

  // Generate Pin SEO metadata
  const pinMeta = generatePinMetadataFromPrompt(trimmed, niche);

  return {
    originalPrompt: trimmed,
    enhancedPrompt,
    mode,
    detectedNiche: niche.name,
    addedModifiers,
    negativePrompt,
    pinTitle: pinMeta.title,
    pinDescription: pinMeta.description,
    hashtags: pinMeta.hashtags,
    suggestedRemixes: niche.remixChips,
  };
}

// ---------------------------------------------------------------------------
// 4. Prompt Quality & Virality Analyzer (Real-time Diagnostic)
// ---------------------------------------------------------------------------
export function analyzePrompt(rawPrompt: string): PromptAnalysis {
  const trimmed = rawPrompt.trim();
  if (!trimmed) {
    return {
      score: 0,
      level: 'Basic',
      wordCount: 0,
      detectedNiche: 'None',
      strengths: [],
      missingElements: ['Subject concept', 'Lighting directive', 'Camera angle / Lens', 'Aesthetic mood / Style'],
      suggestions: ['Type your core subject or click "Surprise Me" for trending inspiration.'],
    };
  }

  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const { niche } = detectPromptNiche(trimmed);

  let score = 25; // Baseline for having input
  const strengths: string[] = [];
  const missingElements: string[] = [];
  const suggestions: string[] = [];

  // Subject clarity
  if (wordCount >= 3) {
    score += 15;
    strengths.push('Defined core subject');
  } else {
    missingElements.push('Descriptive subject details');
    suggestions.push('Add specific details about the subject (e.g., materials, props, setting).');
  }

  // Lighting check
  const lightingTerms = ['light', 'sun', 'golden hour', 'ambient', 'shadow', 'glow', 'moody', 'bright', 'diffused', 'backlit', 'candle'];
  if (lightingTerms.some((t) => lower.includes(t))) {
    score += 20;
    strengths.push('Lighting atmosphere specified');
  } else {
    missingElements.push('Lighting direction');
    suggestions.push('Add lighting nuances like "warm morning sunlight" or "soft ambient studio glow".');
  }

  // Camera & Optics check
  const cameraTerms = ['lens', 'mm', 'shot on', 'angle', 'flatlay', 'close up', 'macro', 'depth of field', 'f/', 'wide', 'bokeh', 'focus'];
  if (cameraTerms.some((t) => lower.includes(t))) {
    score += 20;
    strengths.push('Camera optics / Lens depth defined');
  } else {
    missingElements.push('Optics / Camera framing');
    suggestions.push('Include lens styling like "shot on 35mm lens" or "shallow depth of field".');
  }

  // Aesthetic / Mood check
  const moodTerms = ['aesthetic', 'minimalist', 'vintage', 'editorial', 'magazine', 'cozy', 'hygge', 'scandinavian', 'boho', 'clean', 'vogue', '8k', 'cinematic'];
  if (moodTerms.some((t) => lower.includes(t))) {
    score += 20;
    strengths.push('Visual mood & aesthetic styling declared');
  } else {
    missingElements.push('Editorial styling / Aesthetic mood');
    suggestions.push('Tag with an aesthetic like "editorial magazine" or "serene scandinavian minimalism".');
  }

  // Clamp score
  score = Math.min(100, Math.max(10, score));

  let level: PromptAnalysis['level'] = 'Basic';
  if (score >= 90) level = 'Masterpiece';
  else if (score >= 75) level = 'Viral Ready';
  else if (score >= 55) level = 'Good';
  else if (score >= 35) level = 'Moderate';

  return {
    score,
    level,
    wordCount,
    detectedNiche: niche.name,
    strengths,
    missingElements,
    suggestions,
  };
}

// ---------------------------------------------------------------------------
// 5. Dynamic Contextual Remix Chips
// ---------------------------------------------------------------------------
export function getContextualRemixChips(rawPrompt: string): { label: string; modifier: string }[] {
  const { niche } = detectPromptNiche(rawPrompt || '');
  return niche.remixChips;
}

// ---------------------------------------------------------------------------
// 6. Pinterest SEO Metadata Generator
// ---------------------------------------------------------------------------
export function generatePinMetadataFromPrompt(
  prompt: string,
  providedNiche?: NicheDefinition
): { title: string; description: string; hashtags: string[] } {
  const clean = prompt.trim() || 'Aesthetic Creation';
  const niche = providedNiche || detectPromptNiche(clean).niche;

  // Extract clean subject by taking the first clause before commas
  const primarySubject = clean.split(',')[0].trim().replace(/^A |An |The /i, '');
  const capitalizedSubject = primarySubject.charAt(0).toUpperCase() + primarySubject.slice(1);

  // Title variations for high CTR
  const titles = [
    `${capitalizedSubject} Ideas & Inspiration | ${niche.name}`,
    `Viral ${capitalizedSubject} Aesthetic | Pinterest Inspo`,
    `The Ultimate Guide to ${capitalizedSubject} Aesthetic`,
    `${capitalizedSubject} | Modern & Aesthetic Design Trends`,
  ];
  const title = titles[Math.floor(Math.random() * titles.length)];

  // Description formatted for Pinterest SEO
  const description = `Discover stunning ${capitalizedSubject.toLowerCase()} inspiration crafted with high-end aesthetic details, natural lighting, and curated styling. Perfect for your ${niche.name.toLowerCase()} mood board! Save this pin for your next creative project or lifestyle upgrade.`;

  const hashtags = niche.seoKeywords.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

  return {
    title,
    description,
    hashtags,
  };
}

// ---------------------------------------------------------------------------
// 7. Random Inspiration Generator (Enriched Database)
// ---------------------------------------------------------------------------
export function getRandomInspiration(): string {
  const allChips = INSPIRATION_CATEGORIES.flatMap((c) => c.chips);
  const random = allChips[Math.floor(Math.random() * allChips.length)];
  return random
    ? random.prompt
    : 'Aesthetic Scandinavian living room with beige linen sofa, olive tree, morning sunlight, cozy atmosphere';
}
