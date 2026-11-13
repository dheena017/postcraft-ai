'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Copy, Check, Sparkles } from 'lucide-react';

interface ColorPaletteSwatchesProps {
  imageUrl?: string;
  prompt?: string;
}

// Generate aesthetic harmonic palettes based on prompt or image hash
function getHarmonicPalette(prompt: string = ''): string[] {
  const p = prompt.toLowerCase();
  if (p.includes('linen') || p.includes('resort') || p.includes('straw') || p.includes('summer')) {
    return ['#F8F9FA', '#E9ECEF', '#D4A373', '#A98467', '#2B2D42'];
  }
  if (p.includes('neon') || p.includes('cyber') || p.includes('dark')) {
    return ['#0F172A', '#06B6D4', '#8B5CF6', '#EC4899', '#F43F5E'];
  }
  if (p.includes('boho') || p.includes('botanical') || p.includes('plant')) {
    return ['#F4F1DE', '#E07A5F', '#3D405B', '#81B29A', '#F2CC8F'];
  }
  if (p.includes('food') || p.includes('recipe') || p.includes('cozy') || p.includes('coffee')) {
    return ['#FFF3E0', '#FFB74D', '#E65100', '#6D4C41', '#3E2723'];
  }
  if (p.includes('fashion') || p.includes('luxury') || p.includes('editorial')) {
    return ['#FAFAFA', '#E4E4E7', '#C5A880', '#52525B', '#09090B'];
  }

  // Fallback balanced palette
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    ['#F8FAFC', '#E2E8F0', '#94A3B8', '#475569', '#0F172A'],
    ['#FEF3C7', '#FDE68A', '#F59E0B', '#B45309', '#78350F'],
    ['#FCE7F3', '#FBCFE8', '#F472B6', '#DB2777', '#831843'],
    ['#ECFDF5', '#A7F3D0', '#34D399', '#059669', '#064E3B'],
    ['#EFF6FF', '#BFDBFE', '#60A5FA', '#2563EB', '#1E3A8A'],
  ];
  return palettes[Math.abs(hash) % palettes.length];
}

export const ColorPaletteSwatches: React.FC<ColorPaletteSwatchesProps> = ({ prompt = '' }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setColors(getHarmonicPalette(prompt));
  }, [prompt]);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(colors.join(', '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800/90 backdrop-blur-md text-xs shadow-md">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-brand-400" />
          <span>Brand Palette</span>
        </div>

        {/* Color Swatch Dots */}
        <div className="flex items-center gap-1.5 ml-1">
          {colors.map((hex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleCopy(hex)}
              title={`Click to copy ${hex}`}
              className="relative group w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 focus:outline-none cursor-pointer shadow-sm"
              style={{ backgroundColor: hex }}
            >
              {copiedHex === hex ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full text-[9px] text-emerald-400 font-bold">
                  ✓
                </span>
              ) : (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-zinc-950 text-[9px] text-zinc-200 border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-mono">
                  {hex}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Copy All Button */}
      <button
        type="button"
        onClick={handleCopyAll}
        className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-zinc-800/60 transition-colors cursor-pointer"
      >
        {copiedAll ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Copied All</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy All</span>
          </>
        )}
      </button>
    </div>
  );
};
