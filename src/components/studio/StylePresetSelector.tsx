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
        <span className="text-[10px] text-zinc-500 font-medium">8 Styles</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {STYLE_PRESETS.map((preset) => {
          const isSelected = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              title={preset.description}
              className={`group flex items-center gap-2 rounded-xl border py-2 px-2.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/15 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500 text-white font-semibold'
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gradient-to-r ${preset.previewGradient} shadow-xs ring-1 ring-white/20`}
              />
              <span className="text-xs truncate leading-tight flex-1">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
