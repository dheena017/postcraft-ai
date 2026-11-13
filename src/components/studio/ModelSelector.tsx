'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AiModelId } from '@/types/image';
import { AVAILABLE_AI_MODELS, AI_PROVIDERS, getModelConfig } from '@/lib/ai/models';
import {
  Sparkles,
  ChevronDown,
  Check,
  Zap,
  Camera,
  Palette,
  Box,
  Flame,
  Search,
  Globe,
  Cpu,
} from 'lucide-react';

interface ModelSelectorProps {
  value: AiModelId;
  onChange: (model: AiModelId) => void;
  label?: string;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  label = 'AI Diffusion Model',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeProvider, setActiveProvider] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedModel = getModelConfig(value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Keyboard escape handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter models based on search and active provider
  const filteredModels = AVAILABLE_AI_MODELS.filter((m) => {
    const matchesProvider = activeProvider === 'all' || m.provider === activeProvider;
    if (!matchesProvider) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.shortName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.badgeText.toLowerCase().includes(q) ||
      m.providerName.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });

  // Group filtered models by category
  const categories = Array.from(new Set(filteredModels.map((m) => m.category)));

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Photorealism':
        return <Camera className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Artistic & Cinematic':
        return <Palette className="w-3.5 h-3.5 text-purple-400" />;
      case '3D & Animation':
        return <Box className="w-3.5 h-3.5 text-blue-400" />;
      case 'High Speed':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'Decentralized Grid':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Offline Vector':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-brand-400" />
          <span>{label}</span>
        </label>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {AVAILABLE_AI_MODELS.length} Models · Free
        </span>
      </div>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border transition-colors duration-75 active:scale-[0.99] text-left cursor-pointer ${
          compact ? 'p-2' : 'p-2.5'
        } ${
          isOpen
            ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500 shadow-sm shadow-brand-500/20'
            : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${selectedModel.accentGradient} text-white shadow-xs`}
          >
            {getCategoryIcon(selectedModel.category)}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight truncate">
                {selectedModel.name}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${selectedModel.badgeColor} uppercase tracking-wider flex-shrink-0`}
              >
                {selectedModel.badgeText}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5 flex items-center gap-1.5">
              <span>{selectedModel.providerName}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{selectedModel.speed}</span>
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-brand-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/98 backdrop-blur-xl shadow-2xl p-2.5 space-y-2.5 max-h-[420px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Search filter */}
            <div className="relative flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 17 models & providers (e.g. photo, anime, turbo, horde)..."
                className="w-full rounded-lg bg-zinc-950/80 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex-shrink-0 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveProvider('all')}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeProvider === 'all'
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All ({AVAILABLE_AI_MODELS.length})
              </button>
              {AI_PROVIDERS.map((prov) => {
                const count = AVAILABLE_AI_MODELS.filter((m) => m.provider === prov.id).length;
                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setActiveProvider(prov.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      activeProvider === prov.id
                        ? 'bg-brand-500 text-white shadow-xs'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {prov.name.split(' ')[0]} ({count})
                  </button>
                );
              })}
            </div>

            {/* Models list grouped by Category */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
              {categories.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  No matching models found. Try clearing the search or provider filter.
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category} className="space-y-1">
                    <div className="px-2 py-0.5 flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </div>

                    <div className="space-y-1">
                      {filteredModels
                        .filter((m) => m.category === category)
                        .map((model) => {
                          const isSelected = model.id === value;
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                onChange(model.id);
                                setIsOpen(false);
                              }}
                              className={`w-full group flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors duration-75 active:scale-[0.99] cursor-pointer border ${
                                isSelected
                                  ? 'bg-brand-500/15 border-brand-500/80 text-white shadow-xs ring-1 ring-brand-500'
                                  : 'border-transparent hover:bg-zinc-800/80 hover:border-zinc-700/60 text-zinc-300'
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br ${model.accentGradient} text-white shadow-xs`}
                              >
                                {getCategoryIcon(model.category)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-xs font-bold text-white truncate">
                                      {model.name}
                                    </span>
                                    <span
                                      className={`text-[8px] font-extrabold px-1 py-0.2 rounded border ${model.badgeColor} uppercase tracking-wider flex-shrink-0`}
                                    >
                                      {model.badgeText}
                                    </span>
                                  </div>

                                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 flex-shrink-0">
                                    {model.speed}
                                  </span>
                                </div>

                                <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 line-clamp-2">
                                  {model.description}
                                </p>

                                <div className="flex items-center gap-2 mt-1 text-[9px] text-zinc-500">
                                  <span className="font-medium text-zinc-400">{model.providerName}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400/90 font-semibold">100% Free &amp; Unlimited</span>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="flex-shrink-0 self-center pl-1 text-brand-400">
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick summary footer */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 px-1">
              <span>{filteredModels.length} of {AVAILABLE_AI_MODELS.length} Models Shown</span>
              <span className="text-emerald-400 font-semibold">4 Neural Providers Connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
