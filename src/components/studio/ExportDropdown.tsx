'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Copy, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface ExportDropdownProps {
  onExport: (format: 'image/jpeg' | 'image/png' | 'image/webp', scale?: number) => void;
  onCopyImage: () => void;
  isExporting?: boolean;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExport,
  onCopyImage,
  isExporting = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex items-center rounded-lg shadow-sm">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onExport('image/jpeg', 1)}
          isLoading={isExporting}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="rounded-r-none border-r-0"
        >
          Download HD
        </Button>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center h-8 px-1.5 rounded-r-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
          title="More Export Options"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-md z-50 p-1.5 text-xs animate-in fade-in space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Export Formats
          </div>

          {/* JPEG */}
          <button
            type="button"
            onClick={() => {
              onExport('image/jpeg', 1);
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-200 hover:text-white text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-brand-400" />
              <span>JPEG (Pinterest Standard)</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">1x</span>
          </button>

          {/* PNG */}
          <button
            type="button"
            onClick={() => {
              onExport('image/png', 1);
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-200 hover:text-white text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>PNG (Lossless Quality)</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Lossless</span>
          </button>

          {/* WebP */}
          <button
            type="button"
            onClick={() => {
              onExport('image/webp', 1);
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-200 hover:text-white text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>WebP (High Speed)</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Web</span>
          </button>

          {/* 2x Ultra HD Upscale */}
          <div className="border-t border-zinc-800 my-1 pt-1">
            <button
              type="button"
              onClick={() => {
                onExport('image/jpeg', 2);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-brand-500/20 text-brand-300 font-semibold text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2x Ultra HD (2000×3000)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                2x
              </span>
            </button>
          </div>

          {/* Copy to Clipboard */}
          <div className="border-t border-zinc-800 my-1 pt-1">
            <button
              type="button"
              onClick={() => {
                onCopyImage();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-300 hover:text-white text-left cursor-pointer transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Image to Clipboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
