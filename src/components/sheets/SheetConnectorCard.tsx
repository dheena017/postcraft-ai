'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileSpreadsheet, Upload, Link as LinkIcon, Download, Sparkles } from 'lucide-react';

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

  const handleLoadSample = async () => {
    try {
      const res = await fetch('/templates/sample-social-schedule.csv');
      const csvText = await res.text();
      onParse({ csvContent: csvText });
    } catch {
      alert('Could not load sample template');
    }
  };

  return (
    <Card className="space-y-6">
      {/* Header with Sample Template Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-400" />
            Connect Google Spreadsheet or CSV
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Bulk generate images from prompts and schedule multi-pin publishing campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleLoadSample}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          >
            Load Demo Data
          </Button>
          <a
            href="/templates/sample-social-schedule.csv"
            download="sample-social-schedule.csv"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template CSV</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800/80 max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'url' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Google Sheet Link
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'upload' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Upload CSV File
        </button>
      </div>

      {activeTab === 'url' ? (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300">Google Spreadsheet URL</label>
            <div className="mt-1 flex gap-2">
              <input
                type="url"
                required
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing"
                className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
              />
              <Button type="submit" isLoading={isLoading} leftIcon={<LinkIcon className="w-4 h-4" />}>
                Connect Sheet
              </Button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              💡 Tip: Set your Google Sheet share permissions to <strong className="text-zinc-400">&quot;Anyone with the link can view&quot;</strong> for instant zero-friction synchronization.
            </p>
          </div>
        </form>
      ) : (
        <div className="border-2 border-dashed border-zinc-700/80 hover:border-brand-500/60 rounded-2xl p-8 text-center transition-colors bg-zinc-950/40">
          <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-200">Drag & drop your CSV spreadsheet here</p>
          <p className="text-xs text-zinc-500 mt-1 mb-4">Columns: Prompt, Title, Description, Board, Link, Schedule_Time</p>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700">
              Browse Files
            </span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}
    </Card>
  );
};
