import React from 'react';
import { AspectRatio } from '@/types/image';
import { ASPECT_RATIOS } from '@/lib/ai/presets';

interface AspectRatioPickerProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export const AspectRatioPicker: React.FC<AspectRatioPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Aspect Ratio & Canvas Size
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ASPECT_RATIOS.map((item) => {
          const isSelected = value === item.ratio;
          return (
            <button
              key={item.ratio}
              type="button"
              onClick={() => onChange(item.ratio)}
              className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/10'
                  : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700'
              }`}
            >
              {item.isPinterestOptimal && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-500 text-white uppercase tracking-wider shadow-sm">
                  Pinterest Best
                </span>
              )}
              <span className="font-semibold text-sm text-zinc-100">{item.ratio}</span>
              <span className="text-[11px] text-zinc-400 mt-0.5">{item.width} x {item.height}</span>
              <span className="text-[10px] text-zinc-500 line-clamp-1 mt-1">{item.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
