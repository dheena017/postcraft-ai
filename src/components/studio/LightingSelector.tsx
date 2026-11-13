import React from 'react';
import { LightingPresetId } from '@/types/image';
import { LIGHTING_PRESETS } from '@/lib/ai/presets';

interface LightingSelectorProps {
  value: LightingPresetId;
  onChange: (id: LightingPresetId) => void;
}

export const LightingSelector: React.FC<LightingSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Lighting &amp; Atmosphere
        </label>
        <span className="text-[10px] text-zinc-500 font-medium">Mood Filter</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {LIGHTING_PRESETS.map((preset) => {
          const isSelected = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              title={preset.description}
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-xl border text-left transition-colors duration-75 active:scale-95 cursor-pointer ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/15 shadow-sm text-white font-semibold ring-1 ring-brand-500'
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <span className="text-xs leading-none flex-shrink-0">{preset.icon}</span>
              <span className="text-[11px] truncate leading-tight flex-1">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

