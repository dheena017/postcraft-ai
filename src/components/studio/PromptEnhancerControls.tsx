'use client';

import React, { useState, useMemo } from 'react';
import {
  Wand2,
  Dices,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  Check,
  Copy,
  Flame,
} from 'lucide-react';
import { EnhancementMode, PromptAnalysis } from '@/types/image';
import {
  smartExpandPrompt,
  analyzePrompt,
  getRandomInspiration,
} from '@/lib/ai/prompt-enhancer';

interface PromptEnhancerControlsProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onAppendModifier?: (modifier: string) => void;
  disabled?: boolean;
}

const MODES: { id: EnhancementMode; label: string; icon: string; shortDesc: string }[] = [
  { id: 'viral-pinterest', label: 'Viral Pinterest', icon: '🌟', shortDesc: 'Trending aesthetic & mobile hooks' },
  { id: 'photorealistic-8k', label: '8K Photoreal', icon: '📸', shortDesc: 'Hasselblad optics & authentic raw textures' },
  { id: 'editorial-vogue', label: 'Vogue Editorial', icon: '📰', shortDesc: 'High-fashion luxury magazine art direction' },
  { id: 'moody-cinematic', label: 'Moody Cinematic', icon: '🎬', shortDesc: 'Chiaroscuro shadows & 35mm film still' },
  { id: 'boho-minimalist', label: 'Boho Japandi', icon: '🌿', shortDesc: 'Wabi-sabi textures & calm earthy neutrals' },
  { id: 'creative-remix', label: 'Creative Remix', icon: '🎲', shortDesc: 'Striking avant-garde aesthetic fusion' },
];

export const PromptEnhancerControls: React.FC<PromptEnhancerControlsProps> = ({
  prompt,
  onPromptChange,
  disabled = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<EnhancementMode>('viral-pinterest');
  const [previousPrompt, setPreviousPrompt] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [showAnalysisPopover, setShowAnalysisPopover] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Real-time quality & virality analysis
  const analysis: PromptAnalysis = useMemo(() => {
    return analyzePrompt(prompt);
  }, [prompt]);

  // Color mapping based on score
  const scoreBadgeStyle = useMemo(() => {
    if (analysis.score >= 85) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25',
        badge: 'bg-emerald-500 text-white',
        text: 'Masterpiece',
      };
    }
    if (analysis.score >= 70) {
      return {
        bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25',
        badge: 'bg-cyan-500 text-zinc-950',
        text: 'Viral Ready',
      };
    }
    if (analysis.score >= 50) {
      return {
        bg: 'bg-brand-500/15 border-brand-500/30 text-brand-300 hover:bg-brand-500/25',
        badge: 'bg-brand-500 text-white',
        text: 'Good',
      };
    }
    return {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25',
      badge: 'bg-amber-500 text-zinc-950',
      text: 'Basic',
    };
  }, [analysis.score]);

  const handleEnhance = () => {
    if (!prompt.trim()) {
      handleSurprise();
      return;
    }
    setIsEnhancing(true);
    setPreviousPrompt(prompt);

    setTimeout(() => {
      const enriched = smartExpandPrompt(prompt, selectedMode);
      onPromptChange(enriched);
      setIsEnhancing(false);
    }, 200);
  };

  const handleSurprise = () => {
    setPreviousPrompt(prompt || null);
    const random = getRandomInspiration();
    onPromptChange(random);
  };

  const handleUndo = () => {
    if (previousPrompt !== null) {
      onPromptChange(previousPrompt);
      setPreviousPrompt(null);
    }
  };

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentModeInfo = MODES.find((m) => m.id === selectedMode) || MODES[0];

  return (
    <div className="space-y-1.5">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        {/* Left Side: Quality Score & Niche Indicator */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAnalysisPopover((prev) => !prev)}
            title="Click to view Prompt Analysis & Virality Diagnostics"
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${scoreBadgeStyle.bg}`}
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{analysis.score}%</span>
            </span>
            <span className="text-[9px] font-normal opacity-80">
              ({analysis.detectedNiche !== 'None' ? analysis.detectedNiche : scoreBadgeStyle.text})
            </span>
            <Info className="w-2.5 h-2.5 opacity-60" />
          </button>

          {/* Analysis Popover */}
          {showAnalysisPopover && (
            <div className="absolute left-0 top-full mt-1.5 z-40 w-72 p-3 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md text-[11px] space-y-2.5 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prompt Quality Score: {analysis.score}/100</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAnalysisPopover(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Rating: {analysis.level}</span>
                  <span>{analysis.wordCount} words</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      analysis.score >= 80
                        ? 'bg-emerald-500'
                        : analysis.score >= 60
                        ? 'bg-brand-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Detected Strengths:
                  </span>
                  <div className="space-y-0.5">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="flex items-center gap-1 text-zinc-300 text-[10px]">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing recommendations */}
              {analysis.missingElements.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Boost Suggestions:
                  </span>
                  <ul className="space-y-0.5 text-zinc-400 text-[10px] list-disc list-inside">
                    {analysis.missingElements.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-1 border-t border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleEnhance();
                    setShowAnalysisPopover(false);
                  }}
                  className="w-full py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-center text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-Enhance to 90%+</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Action Suite */}
        <div className="flex items-center gap-1">
          {/* Mode Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsModeDropdownOpen((prev) => !prev)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 flex items-center gap-1 transition-colors cursor-pointer font-medium"
              title="Change Prompt Enhancement Style Mode"
            >
              <span>{currentModeInfo.icon}</span>
              <span className="hidden sm:inline">{currentModeInfo.label}</span>
              <ChevronDown className="w-2.5 h-2.5 text-zinc-500" />
            </button>

            {isModeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-40 w-56 p-1 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md text-xs space-y-0.5 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 mb-0.5">
                  Enhancement Mode
                </div>
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setSelectedMode(mode.id);
                      setIsModeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                      selectedMode === mode.id
                        ? 'bg-brand-500/20 text-brand-300 font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium leading-none">{mode.label}</div>
                      <div className="text-[9px] text-zinc-500 truncate mt-0.5">{mode.shortDesc}</div>
                    </div>
                    {selectedMode === mode.id && <Check className="w-3 h-3 text-brand-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Surprise Me / Randomize */}
          <button
            type="button"
            disabled={disabled}
            onClick={handleSurprise}
            title="Randomize Viral Inspiration Prompt"
            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 flex items-center gap-1 transition-colors duration-75 active:scale-95 cursor-pointer font-medium"
          >
            <Dices className="w-3 h-3 text-amber-400" />
            <span>Surprise</span>
          </button>

          {/* Undo / Revert if enhanced */}
          {previousPrompt !== null && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleUndo}
              title="Undo Enhancement and Revert Prompt"
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-0.5 transition-colors cursor-pointer font-medium"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Undo</span>
            </button>
          )}

          {/* Copy Prompt */}
          {prompt && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy prompt to clipboard"
              className="text-[10px] p-1 rounded-md bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}

          {/* Primary AI Enhance Button */}
          <button
            type="button"
            disabled={disabled || isEnhancing}
            onClick={handleEnhance}
            title={`Enhance with ${currentModeInfo.label} aesthetic details`}
            className="text-[10px] px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 hover:text-white hover:bg-brand-500/30 border border-brand-500/40 flex items-center gap-1 transition-all duration-75 active:scale-95 cursor-pointer font-semibold shadow-sm shadow-brand-500/10 group"
          >
            <Wand2 className={`w-3 h-3 text-brand-400 ${isEnhancing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>{isEnhancing ? 'Enhancing...' : 'AI Expand'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
