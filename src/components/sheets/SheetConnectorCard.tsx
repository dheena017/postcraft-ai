'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { FileSpreadsheet, Upload, Link as LinkIcon, FileText, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SAMPLE_TEMPLATES } from '@/lib/sheets/sample-templates';

interface SheetConnectorCardProps {
  onParse: (payload: { sheetUrl?: string; csvContent?: string }) => void;
  isLoading: boolean;
}

export const SheetConnectorCard: React.FC<SheetConnectorCardProps> = ({ onParse, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'paste'>('upload');
  const [sheetUrl, setSheetUrl] = useState('');
  const [pastedCsv, setPastedCsv] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onParse({ csvContent: content });
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedCsv.trim()) return;
    onParse({ csvContent: pastedCsv.trim() });
  };

  const handleLoadTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = SAMPLE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      onParse({ csvContent: template.csvContent });
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-3">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-brand-400" />
            Connect Spreadsheet
          </h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Batch schedule multi-pin campaigns from Google Sheets or CSV
          </p>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          Auto-Map
        </span>
      </div>

      {/* Segmented Mode Tabs (3 Options) */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-950 p-0.5 border border-zinc-800/80 text-center">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-1 px-1 rounded-md text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
            activeTab === 'upload' ? 'bg-zinc-800 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Upload CSV
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`py-1 px-1 rounded-md text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
            activeTab === 'url' ? 'bg-zinc-800 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Google Sheet
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`py-1 px-1 rounded-md text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
            activeTab === 'paste' ? 'bg-zinc-800 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Paste Raw CSV
        </button>
      </div>

      {/* Tab 1: Upload CSV */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border border-dashed rounded-xl p-3 text-center transition-all bg-zinc-950/40 ${
            isDragging
              ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
              : 'border-zinc-800 hover:border-brand-500/60'
          }`}
        >
          <Upload className={`w-4 h-4 mx-auto mb-1 ${isDragging ? 'text-brand-400 animate-bounce' : 'text-zinc-400'}`} />
          <p className="text-[11px] font-medium text-zinc-200">
            {isDragging ? 'Drop your CSV file here!' : 'Drag & drop CSV spreadsheet here'}
          </p>
          <p className="text-[9px] text-zinc-500 mt-0.5">Supports comma-separated or tab-separated tables</p>
          <label className="cursor-pointer inline-block mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700 shadow-xs">
              <Upload className="w-3 h-3" />
              Browse Files
            </span>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv,text/plain" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Tab 2: Google Sheet Link */}
      {activeTab === 'url' && (
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
            💡 Share setting must be set to &quot;Anyone with the link can view&quot;.
          </p>
        </form>
      )}

      {/* Tab 3: Paste CSV */}
      {activeTab === 'paste' && (
        <form onSubmit={handlePasteSubmit} className="space-y-1.5">
          <textarea
            rows={3}
            value={pastedCsv}
            onChange={(e) => setPastedCsv(e.target.value)}
            required
            placeholder={`Prompt,Title,Board,Link\n"Aesthetic cozy kitchen","Cozy Kitchen Ideas","Home Decor","https://example.com"`}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950 px-2.5 py-1.5 text-[11px] font-mono text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none resize-none"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            className="w-full text-xs font-semibold py-1.5"
          >
            Parse &amp; Load Pasted CSV
          </Button>
        </form>
      )}

      {/* 1-Click Instant Starter Templates */}
      <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Or Try 1-Click Starter Campaigns:</span>
          </label>
          <span className="text-[9px] text-zinc-500">Instant Load</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {SAMPLE_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleLoadTemplate(tmpl.id)}
                disabled={isLoading}
                title={`Load ${tmpl.title} sample dataset`}
                className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                    : 'border-zinc-800 bg-zinc-950/70 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-xs flex-shrink-0">{tmpl.icon}</span>
                  <div className="truncate">
                    <p className="text-[10px] font-semibold text-zinc-200 truncate leading-tight">
                      {tmpl.title}
                    </p>
                    <p className="text-[8px] text-zinc-500 truncate leading-tight">
                      {tmpl.category}
                    </p>
                  </div>
                </div>
                <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 flex-shrink-0">
                  {tmpl.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
