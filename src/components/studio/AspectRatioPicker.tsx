import React from 'react';
import { AspectRatio } from '@/types/image';
import { ASPECT_RATIOS } from '@/lib/ai/presets';

interface AspectRatioPickerProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export const AspectRatioPicker: React.FC<AspectRatioPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Aspect Ratio
        </label>
        <span className="text-[10px] text-zinc-500 font-medium">Auto-scales canvas</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {ASPECT_RATIOS.map((item) => {
          const isSelected = value === item.ratio;
          return (
            <button
              key={item.ratio}
              type="button"
              onClick={() => onChange(item.ratio)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/15 shadow-sm shadow-brand-500/10 text-white font-bold'
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              {item.isPinterestOptimal && (
                <span className="absolute -top-1.5 right-1 px-1 py-0.2 rounded font-black text-[8px] bg-brand-500 text-white uppercase tracking-tighter">
                  Pin Best
                </span>
              )}
              <span className="text-xs font-bold leading-tight">{item.ratio}</span>
              <span className="text-[9px] text-zinc-400 leading-none mt-0.5">{item.width}×{item.height}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
