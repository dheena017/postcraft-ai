import React from 'react';
import { StylePresetId } from '@/types/image';
import { STYLE_PRESETS } from '@/lib/ai/presets';

interface StylePresetSelectorProps {
  value: StylePresetId;
  onChange: (id: StylePresetId) => void;
}

export const StylePresetSelector: React.FC<StylePresetSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Aesthetic Style Filter
        </label>
        <span className="text-[10px] text-zinc-500 font-medium">8 Presets</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {STYLE_PRESETS.map((preset) => {
          const isSelected = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              title={`${preset.name}: ${preset.description}`}
              className={`group relative overflow-hidden rounded-lg border py-1.5 px-2 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/15 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500 text-white'
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div
                className={`h-1 w-full rounded-full bg-gradient-to-r ${preset.previewGradient} mb-1 opacity-80 group-hover:opacity-100`}
              />
              <span className="font-semibold text-[11px] block truncate leading-tight">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
