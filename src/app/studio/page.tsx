'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AspectRatioPicker } from '@/components/studio/AspectRatioPicker';
import { StylePresetSelector } from '@/components/studio/StylePresetSelector';
import { ImagePreviewCanvas } from '@/components/studio/ImagePreviewCanvas';
import { Sparkles, Wand2, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { AspectRatio, StylePresetId, ImageGenerationResult } from '@/types/image';

const INSPIRATION_PROMPTS = [
  'Aesthetic bohemian living room with cream boucle sofa and warm sunshine',
  'Minimalist iced matcha latte in ribbed glass with natural morning sunlight',
  'Moody Scandinavian kitchen with dark olive green shaker cabinets and brass hardware',
  'Autumn cozy capsule wardrobe flat lay with camel trench coat and leather boots',
  'Dreamy watercolor botanical illustration of eucalyptus branches and soft peonies',
];

export default function StudioPage() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('2:3');
  const [stylePreset, setStylePreset] = useState<StylePresetId>('aesthetic-minimal');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageResult, setImageResult] = useState<ImageGenerationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          stylePreset,
          negativePrompt: negativePrompt.trim() || undefined,
          enhancePrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = () => {
    const random = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
    setPrompt(random);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            AI Creative Studio
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Free & No Watermarks
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Generate viral Pinterest pins (2:3 aspect ratio) & multi-channel social imagery in seconds.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSurpriseMe}
          leftIcon={<Wand2 className="w-3.5 h-3.5 text-amber-400" />}
        >
          Prompt Inspiration
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Grid: Prompt Controls (Left) vs Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Prompt Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    Image Prompt
                  </label>
                  <span className="text-[11px] text-zinc-500">Be descriptive for best results</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                    placeholder="E.g., Aesthetic Scandinavian living room with beige linen sofa, olive tree, morning sunlight, cozy atmosphere..."
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>

                {/* Quick Inspiration Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {INSPIRATION_PROMPTS.slice(0, 3).map((insp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(insp)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors truncate max-w-[280px]"
                    >
                      💡 {insp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Picker */}
              <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />

              {/* Style Presets */}
              <StylePresetSelector value={stylePreset} onChange={setStylePreset} />

              {/* Advanced Settings Toggle */}
              <div className="pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Negative Prompt, Auto-Enhance)'}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 rounded-xl bg-zinc-950/60 p-4 border border-zinc-800">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhancePrompt}
                        onChange={(e) => setEnhancePrompt(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500"
                      />
                      <span>Auto-apply high-definition photographic aesthetic boosters</span>
                    </label>

                    <div>
                      <label className="text-xs font-medium text-zinc-400">Custom Negative Prompt</label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g. oversaturated, plastic, artificial lighting"
                        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:border-brand-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Watermarks, logos, and low quality artifacts are already automatically blocked.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isGenerating}
                leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              >
                {isGenerating ? 'Synthesizing Watermark-Free Image...' : 'Generate AI Image Now'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Canvas Column (5 cols) */}
        <div className="lg:col-span-5">
          <ImagePreviewCanvas imageResult={imageResult} isGenerating={isGenerating} />
        </div>
      </div>
    </div>
  );
}
