import React from 'react';
import { PinOverlayConfig, OverlayTheme, OverlayPosition } from '@/types/image';
import { Type } from 'lucide-react';

interface TextOverlayControlsProps {
  config: PinOverlayConfig;
  onChange: (config: PinOverlayConfig) => void;
}

const THEMES: { id: OverlayTheme; label: string }[] = [
  { id: 'glass', label: 'Dark Glass' },
  { id: 'minimal-light', label: 'Clean White' },
  { id: 'minimal-dark', label: 'Solid Charcoal' },
  { id: 'editorial', label: 'Vogue Editorial' },
  { id: 'bold-banner', label: 'Bottom Ribbon' },
];

const POSITIONS: { id: OverlayPosition; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
];

export const TextOverlayControls: React.FC<TextOverlayControlsProps> = ({ config, onChange }) => {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-3 transition-all">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 cursor-pointer">
          <Type className="w-3.5 h-3.5 text-brand-400" />
          <span>Pin Typography Overlay</span>
        </label>

        <button
          type="button"
          onClick={() => onChange({ ...config, enabled: !config.enabled })}
          className={`relative inline-flex h-4.5 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            config.enabled ? 'bg-brand-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              config.enabled ? 'translate-x-3.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {config.enabled && (
        <div className="space-y-2.5 pt-1 text-xs animate-in fade-in">
          {/* Headline Text */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-400">
              Headline Title
            </label>
            <input
              type="text"
              value={config.headline}
              onChange={(e) => onChange({ ...config, headline: e.target.value })}
              placeholder="E.g., 10 Scandinavian Decor Ideas"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Subtext / Domain */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-400">
              Branding / Domain / Tagline
            </label>
            <input
              type="text"
              value={config.subtext || ''}
              onChange={(e) => onChange({ ...config, subtext: e.target.value })}
              placeholder="E.g., yourblog.com • Save for later"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Theme Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-400">
              Badge Theme
            </label>
            <div className="grid grid-cols-3 gap-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onChange({ ...config, theme: theme.id })}
                  className={`py-1 px-1.5 rounded-md border text-[10px] font-medium truncate transition-colors cursor-pointer ${
                    config.theme === theme.id
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300 font-bold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-400">
              Card Position
            </label>
            <div className="grid grid-cols-3 gap-1">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onChange({ ...config, position: pos.id })}
                  className={`py-1 px-1.5 rounded-md border text-[10px] font-medium truncate transition-colors cursor-pointer ${
                    config.position === pos.id
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300 font-bold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

