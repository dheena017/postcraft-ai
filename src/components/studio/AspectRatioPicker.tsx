import React from 'react';
import { AspectRatio } from '@/types/image';
import { ASPECT_RATIOS } from '@/lib/ai/presets';

interface AspectRatioPickerProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export const AspectRatioPicker: React.FC<AspectRatioPickerProps> = ({ value, onChange }) => {
  const getShapeIcon = (ratio: AspectRatio, isSelected: boolean) => {
    const borderClass = isSelected ? 'border-brand-400 bg-brand-400/20' : 'border-zinc-500 bg-zinc-800/60';
    switch (ratio) {
      case '2:3':
        return <div className={`w-3 h-4.5 rounded-[3px] border-[1.5px] ${borderClass} mb-1`} />;
      case '1:1':
        return <div className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] ${borderClass} mb-1`} />;
      case '9:16':
        return <div className={`w-2.5 h-4.5 rounded-[3px] border-[1.5px] ${borderClass} mb-1`} />;
      case '16:9':
        return <div className={`w-4.5 h-2.5 rounded-[3px] border-[1.5px] ${borderClass} mb-1`} />;
      default:
        return null;
    }
  };

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
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-colors duration-75 active:scale-95 cursor-pointer group ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/15 shadow-sm shadow-brand-500/10 text-white font-bold ring-1 ring-brand-500'
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              {getShapeIcon(item.ratio, isSelected)}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold leading-tight">{item.ratio}</span>
                {item.isPinterestOptimal && (
                  <span className="px-1 py-0.2 rounded font-extrabold text-[8px] bg-brand-500 text-white tracking-tight uppercase leading-none">
                    Best
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 leading-none mt-1">
                {item.width}×{item.height}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
