'use client';

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { getContextualRemixChips } from '@/lib/ai/prompt-enhancer';

interface PromptRemixChipsProps {
  currentPrompt: string;
  onAppendModifier: (modifier: string) => void;
}

export const PromptRemixChips: React.FC<PromptRemixChipsProps> = ({
  currentPrompt,
  onAppendModifier,
}) => {
  // Dynamically compute context-tailored remix modifiers based on current prompt
  const remixChips = useMemo(() => {
    return getContextualRemixChips(currentPrompt);
  }, [currentPrompt]);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex-shrink-0">
        <Sparkles className="w-3 h-3 text-brand-400 animate-pulse" />
        <span>Remix:</span>
      </div>
      <div className="flex items-center gap-1.5 flex-nowrap">
        {remixChips.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onAppendModifier(preset.modifier)}
            className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:text-white hover:border-brand-500/50 hover:bg-zinc-800/90 transition-all duration-75 active:scale-95 whitespace-nowrap cursor-pointer flex items-center gap-1 font-medium group"
          >
            <span className="text-brand-400 text-[10px] group-hover:rotate-45 transition-transform">+</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
