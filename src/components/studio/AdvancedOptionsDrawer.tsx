import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, Dices, Sparkles } from 'lucide-react';
import { AiModelId } from '@/types/image';
import { ModelSelector } from './ModelSelector';

interface AdvancedOptionsDrawerProps {
  negativePrompt: string;
  onNegativePromptChange: (val: string) => void;
  seed: number | null;
  onSeedChange: (seed: number | null) => void;
  enhancePrompt: boolean;
  onEnhancePromptChange: (val: boolean) => void;
  model?: AiModelId;
  onModelChange?: (model: AiModelId) => void;
}

const QUICK_NEGATIVE_TAGS = [
  'watermark, logo',
  'blurry, noisy',
  'deformed, ugly',
  'cartoon, 3d render',
  'oversaturated',
  'dark, underexposed',
];

export const AdvancedOptionsDrawer: React.FC<AdvancedOptionsDrawerProps> = ({
  negativePrompt,
  onNegativePromptChange,
  seed,
  onSeedChange,
  enhancePrompt,
  onEnhancePromptChange,
  model,
  onModelChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTag = (tag: string) => {
    if (!negativePrompt) {
      onNegativePromptChange(tag);
      return;
    }
    if (!negativePrompt.includes(tag)) {
      onNegativePromptChange(`${negativePrompt}, ${tag}`);
    }
  };

  const handleRollSeed = () => {
    onSeedChange(Math.floor(Math.random() * 99999999));
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-850/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5 text-zinc-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Advanced Fine-Tuning &amp; Seed
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500">
          {seed !== null && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 font-mono">
              Seed: {seed}
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 space-y-3 text-xs border-t border-zinc-800/60 animate-in fade-in">
          {/* AI Model Selector */}
          {model && onModelChange && (
            <div className="pt-2">
              <ModelSelector
                value={model}
                onChange={onModelChange}
                compact
                label="Fine-Tune Synthesis Engine"
              />
            </div>
          )}

          {/* Seed Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-zinc-400">
                Reproducible Seed
              </label>
              <button
                type="button"
                onClick={handleRollSeed}
                className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
              >
                <Dices className="w-3 h-3" />
                <span>Roll Random</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={seed ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : null;
                  onSeedChange(val);
                }}
                placeholder="Random seed (leave empty for auto)"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none font-mono"
              />
              {seed !== null && (
                <button
                  type="button"
                  onClick={() => onSeedChange(null)}
                  className="px-2 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-[10px] cursor-pointer"
                  title="Reset to Random"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Auto Enhance Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] text-zinc-300">
                Aesthetic Prompt Auto-Enrichment
              </span>
            </div>
            <input
              type="checkbox"
              checked={enhancePrompt}
              onChange={(e) => onEnhancePromptChange(e.target.checked)}
              className="accent-brand-500 rounded cursor-pointer w-3.5 h-3.5"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-zinc-400">
                Negative Prompt (Exclude)
              </label>
              {negativePrompt && (
                <button
                  type="button"
                  onClick={() => onNegativePromptChange('')}
                  className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              placeholder="E.g., dark, distorted, extra limbs, ugly, text..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none resize-none"
            />
            {/* Quick negative pills */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {QUICK_NEGATIVE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

