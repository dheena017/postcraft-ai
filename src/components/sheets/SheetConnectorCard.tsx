'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { FileSpreadsheet, Upload, Link as LinkIcon } from 'lucide-react';

interface SheetConnectorCardProps {
  onParse: (payload: { sheetUrl?: string; csvContent?: string }) => void;
  isLoading: boolean;
}

export const SheetConnectorCard: React.FC<SheetConnectorCardProps> = ({ onParse, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [sheetUrl, setSheetUrl] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) return;
    onParse({ sheetUrl: sheetUrl.trim() });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onParse({ csvContent: content });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-2.5">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800/80">
        <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-brand-400" />
          Connect Spreadsheet
        </h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          Batch schedule multi-pin campaigns from Google Sheets or CSV
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-zinc-950 p-0.5 border border-zinc-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            activeTab === 'url' ? 'bg-zinc-800 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Google Sheet Link
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            activeTab === 'upload' ? 'bg-zinc-800 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Upload CSV File
        </button>
      </div>

      {activeTab === 'url' ? (
        <form onSubmit={handleUrlSubmit} className="space-y-1.5">
          <div className="flex gap-1.5">
            <input
              type="url"
              required
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="flex-1 rounded-lg border border-zinc-700/80 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<LinkIcon className="w-3.5 h-3.5" />}
              className="px-3 text-xs font-semibold"
            >
              Connect
            </Button>
          </div>
          <p className="text-[10px] text-zinc-500">
            💡 Share setting must be &quot;Anyone with the link can view&quot;.
          </p>
        </form>
      ) : (
        <div className="border border-dashed border-zinc-800 hover:border-brand-500/60 rounded-xl p-3 text-center transition-colors bg-zinc-950/40">
          <Upload className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
          <p className="text-[11px] font-medium text-zinc-300">Drag & drop CSV spreadsheet here</p>
          <label className="cursor-pointer inline-block mt-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700">
              Browse Files
            </span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
};
