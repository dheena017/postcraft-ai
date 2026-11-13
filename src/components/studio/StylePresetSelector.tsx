'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StylePresetId, StyleCategory } from '@/types/image';
import { STYLE_PRESETS } from '@/lib/ai/presets';
import {
  Palette,
  ChevronDown,
  Search,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

interface StylePresetSelectorProps {
  value: StylePresetId;
  onChange: (id: StylePresetId) => void;
  label?: string;
  compact?: boolean;
  className?: string;
}

const CATEGORIES: { id: StyleCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'aesthetic', label: 'Aesthetic' },
  { id: 'interior', label: 'Interior' },
  { id: 'fashion-lifestyle', label: 'Lifestyle' },
  { id: 'art', label: 'Art & 3D' },
];

export const StylePresetSelector: React.FC<StylePresetSelectorProps> = ({
  value,
  onChange,
  label = 'Aesthetic Style Filter',
  compact = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedPreset = STYLE_PRESETS.find((p) => p.id === value) || STYLE_PRESETS[0];

  // Close dropdown on click outside
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
    } else if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Keyboard Escape handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter presets by active category & search query
  const filteredPresets = STYLE_PRESETS.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.promptSuffix.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {/* Top Header Label & Counter */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-brand-400" />
          <span>{label}</span>
        </label>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          {STYLE_PRESETS.length} of {STYLE_PRESETS.length} Styles
        </span>
      </div>

      {/* Main Trigger Button (Custom Select) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
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
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${selectedPreset.previewGradient} text-white shadow-xs ring-1 ring-white/20`}
          >
            <Sparkles className="w-3.5 h-3.5 text-white/90 drop-shadow" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight truncate">
                {selectedPreset.name}
              </span>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded border bg-zinc-800/80 border-zinc-700 text-zinc-300 uppercase tracking-wider flex-shrink-0">
                {selectedPreset.category === 'fashion-lifestyle' ? 'Lifestyle' : selectedPreset.category}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
              {selectedPreset.description}
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-brand-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover Flyout */}
      {isOpen && (
        <div className="relative z-40">
          <div className="absolute top-1 left-0 right-0 w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/98 backdrop-blur-xl shadow-2xl p-2.5 space-y-2.5 max-h-[420px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Quick Search */}
            <div className="relative flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles (e.g. boho, retro, 8k, food)..."
                className="w-full rounded-lg bg-zinc-950/80 border border-zinc-800 pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex-shrink-0 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const count =
                  cat.id === 'all'
                    ? STYLE_PRESETS.length
                    : STYLE_PRESETS.filter((p) => p.category === cat.id).length;
                const isCatActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      isCatActive
                        ? 'bg-brand-500 text-white shadow-xs'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Preset Buttons Grid (Matching User Screenshot) */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
              <div className="grid grid-cols-2 gap-1.5">
                {filteredPresets.map((preset) => {
                  const isSelected = value === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onChange(preset.id);
                        setIsOpen(false);
                      }}
                      title={preset.description}
                      className={`group flex items-center gap-2 rounded-xl border py-2 px-2.5 text-left transition-colors duration-75 active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500 text-white font-semibold'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {/* Radio / Circle indicator matching screenshot */}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/20'
                            : 'border-zinc-700 bg-zinc-900/80 group-hover:border-zinc-500'
                        }`}
                      >
                        {isSelected ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${preset.previewGradient} opacity-60`}
                          />
                        )}
                      </div>

                      {/* Style Name */}
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs truncate leading-tight block ${
                            isSelected
                              ? 'text-white font-bold'
                              : 'text-zinc-200 group-hover:text-white font-medium'
                          }`}
                        >
                          {preset.name}
                        </span>
                      </div>

                      {/* Active Checkmark */}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredPresets.length === 0 && (
                <div className="py-6 text-center text-xs text-zinc-500 space-y-1">
                  <p>No styles match &quot;{searchQuery}&quot;</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-brand-400 hover:underline text-[11px] font-medium cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 px-1">
              <span>
                {filteredPresets.length} of {STYLE_PRESETS.length} Styles Shown
              </span>
              <span className="text-brand-400/90 font-semibold">
                Instant Pinterest Aesthetic
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StylePresetSelector;
