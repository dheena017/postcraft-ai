import React from 'react';
import { StylePresetId } from '@/types/image';
import { STYLE_PRESETS } from '@/lib/ai/presets';

interface StylePresetSelectorProps {
  value: StylePresetId;
  onChange: (id: StylePresetId) => void;
}

export const StylePresetSelector: React.FC<StylePresetSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Aesthetic Style Filter (Watermark-Free)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {STYLE_PRESETS.map((preset) => {
          const isSelected = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/15 shadow-md shadow-brand-500/10 ring-1 ring-brand-500'
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700'
              }`}
            >
              {/* Subtle aesthetic gradient banner */}
              <div
                className={`h-1.5 w-full rounded-full bg-gradient-to-r ${preset.previewGradient} mb-2 opacity-80 group-hover:opacity-100 transition-opacity`}
              />
              <span className="font-medium text-xs text-zinc-100 block truncate">{preset.name}</span>
              <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{preset.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
