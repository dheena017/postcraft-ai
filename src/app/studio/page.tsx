'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AspectRatioPicker } from '@/components/studio/AspectRatioPicker';
import { StylePresetSelector } from '@/components/studio/StylePresetSelector';
import { SheetConnectorCard } from '@/components/sheets/SheetConnectorCard';
import { ColumnMappingForm } from '@/components/sheets/ColumnMappingForm';
import { SheetDataPreviewTable } from '@/components/sheets/SheetDataPreviewTable';
import { QuickPublishModal } from '@/components/studio/QuickPublishModal';
import { removeWatermark } from '@/lib/ai/clean-image';
import {
  Sparkles,
  Wand2,
  SlidersHorizontal,
  RefreshCw,
  FileSpreadsheet,
  CalendarPlus,
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  Maximize2,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';
import { AspectRatio, StylePresetId, ImageGenerationResult } from '@/types/image';
import { ParsedSheetRow, SheetMappingConfig } from '@/types/job';
import Link from 'next/link';

const INSPIRATION_PROMPTS = [
  'Aesthetic bohemian living room with cream boucle sofa and warm sunshine',
  'Minimalist iced matcha latte in ribbed glass with natural morning sunlight',
  'Moody Scandinavian kitchen with dark olive green shaker cabinets and brass hardware',
  'Autumn cozy capsule wardrobe flat lay with camel trench coat and leather boots',
  'Dreamy watercolor botanical illustration of eucalyptus branches and soft peonies',
];

function StudioContent() {
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get('mode');
  const [activeTab, setActiveTab] = useState<'single' | 'sheets'>(
    requestedMode === 'sheets' ? 'sheets' : 'single'
  );

  useEffect(() => {
    if (requestedMode === 'sheets') {
      setActiveTab('sheets');
    }
  }, [requestedMode]);

  // --- Single Mode State ---
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('2:3');
  const [stylePreset, setStylePreset] = useState<StylePresetId>('aesthetic-minimal');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageResult, setImageResult] = useState<ImageGenerationResult | null>(null);
  const [cleanImageUrl, setCleanImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Automatically remove watermark when imageResult changes
  useEffect(() => {
    if (imageResult?.imageUrl) {
      removeWatermark(imageResult.imageUrl, imageResult.width, imageResult.height).then((clean) => {
        setCleanImageUrl(clean);
      });
    } else {
      setCleanImageUrl('');
    }
  }, [imageResult]);

  const activeDisplayUrl = cleanImageUrl || imageResult?.imageUrl || '';

  // --- Sheets Mode State ---
  const [isParsingSheet, setIsParsingSheet] = useState(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<SheetMappingConfig>({
    promptCol: '',
    titleCol: '',
    descriptionCol: '',
    boardCol: '',
    linkCol: '',
    scheduleTimeCol: '',
  });
  const [rows, setRows] = useState<ParsedSheetRow[]>([]);
  const [rawCsv, setRawCsv] = useState<string | null>(null);
  const [batchAspectRatio, setBatchAspectRatio] = useState<AspectRatio>('2:3');
  const [batchStylePreset, setBatchStylePreset] = useState<StylePresetId>('aesthetic-minimal');
  const [syncSuccessCount, setSyncSuccessCount] = useState<number | null>(null);

  // --- Single Mode Handlers ---
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          stylePreset,
          negativePrompt: negativePrompt.trim() || undefined,
          enhancePrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = () => {
    const random = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
    setPrompt(random);
  };

  const handleDownloadClean = async () => {
    if (!imageResult) return;
    try {
      let downloadUrl = cleanImageUrl;
      if (!downloadUrl) {
        downloadUrl = await removeWatermark(imageResult.imageUrl, imageResult.width, imageResult.height);
      }

      if (downloadUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `postcraft_${imageResult.aspectRatio.replace(':', 'x')}_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `postcraft_${imageResult.aspectRatio.replace(':', 'x')}_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(imageResult.imageUrl, '_blank');
    }
  };

  // --- Sheets Mode Handlers ---
  const handleParseSheet = async (payload: { sheetUrl?: string; csvContent?: string }) => {
    setIsParsingSheet(true);
    setSyncSuccessCount(null);
    try {
      if (payload.csvContent) setRawCsv(payload.csvContent);

      const res = await fetch('/api/sheets/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse sheet data');

      setHeaders(data.headers || []);
      setMapping(data.mapping);
      setRows(data.rows || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error connecting spreadsheet';
      alert(msg);
    } finally {
      setIsParsingSheet(false);
    }
  };

  const handleMappingChange = async (updatedMapping: SheetMappingConfig) => {
    setMapping(updatedMapping);
    if (rawCsv) {
      try {
        const res = await fetch('/api/sheets/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvContent: rawCsv, mapping: updatedMapping }),
        });
        const data = await res.json();
        if (data.rows) setRows(data.rows);
      } catch {}
    }
  };

  const handleSyncToQueue = async () => {
    if (rows.length === 0) return;
    setIsSyncingQueue(true);
    try {
      const res = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows,
          aspectRatio: batchAspectRatio,
          stylePreset: batchStylePreset,
          providerId: 'pinterest',
          source: 'GOOGLE_SHEETS',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to queue jobs');

      setSyncSuccessCount(data.count || rows.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Queue synchronization failed';
      alert(msg);
    } finally {
      setIsSyncingQueue(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-row bg-zinc-950 overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 1. LEFT SIDE PANEL: Compact Controls, Mode Switcher & Form */}
      {/* ======================================================== */}
      <aside className="w-full lg:w-[370px] xl:w-[390px] flex-shrink-0 flex flex-col h-full border-r border-zinc-800/80 bg-zinc-950 z-10 overflow-hidden">
        {/* Left Panel Header & Mode Switcher */}
        <div className="flex-shrink-0 p-3 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <h2 className="text-xs font-bold text-white tracking-tight uppercase">
                Studio Controls
              </h2>
            </div>
            <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Watermark-Free
            </span>
          </div>

          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-900/90 p-0.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wand2 className="w-3 h-3 text-brand-400" />
              <span>Single Pin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'sheets'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
              <span>Sheets Sync</span>
              {rows.length > 0 && (
                <span className="text-[9px] px-1 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-400">
                  {rows.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Left Panel Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3.5 scrollbar-thin">
          {errorMessage && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
              ⚠️ {errorMessage}
            </div>
          )}

          {activeTab === 'single' ? (
            /* --- SINGLE PIN FORM --- */
            <form id="single-pin-form" onSubmit={handleGenerate} className="space-y-3.5">
              {/* Image Prompt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-400" />
                    Image Prompt
                  </label>
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="w-2.5 h-2.5" />
                    <span>Inspiration</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  placeholder="E.g., Aesthetic Scandinavian living room with beige linen sofa, olive tree, morning sunlight, cozy atmosphere..."
                  className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />

                {/* Quick Inspiration Chips */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {INSPIRATION_PROMPTS.slice(0, 2).map((insp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(insp)}
                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 truncate max-w-[170px] cursor-pointer"
                    >
                      💡 {insp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Picker */}
              <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />

              {/* Style Presets */}
              <StylePresetSelector value={stylePreset} onChange={setStylePreset} />

              {/* Advanced Settings Toggle */}
              <div className="pt-1 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>{showAdvanced ? 'Hide Advanced Options' : 'Advanced (Negative Prompt, Auto-Enhance)'}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-2 space-y-2 rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                    <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhancePrompt}
                        onChange={(e) => setEnhancePrompt(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500"
                      />
                      <span>Auto-apply high-definition aesthetic boosters</span>
                    </label>

                    <div>
                      <label className="text-[10px] font-medium text-zinc-400">Custom Negative Prompt</label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g. oversaturated, plastic, artificial lighting"
                        className="mt-0.5 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-200 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* --- BULK SHEETS CONTROLS --- */
            <div className="space-y-3.5">
              <SheetConnectorCard onParse={handleParseSheet} isLoading={isParsingSheet} />

              {headers.length > 0 && (
                <div className="space-y-3.5 animate-in fade-in">
                  <ColumnMappingForm headers={headers} mapping={mapping} onChange={handleMappingChange} />

                  <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 pb-1.5 border-b border-zinc-800">
                      Batch Output Settings
                    </h3>
                    <AspectRatioPicker value={batchAspectRatio} onChange={setBatchAspectRatio} />
                    <StylePresetSelector value={batchStylePreset} onChange={setBatchStylePreset} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Left Panel Fixed Bottom Footer Button (Always visible & compact!) */}
        <div className="flex-shrink-0 p-3 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
          {activeTab === 'single' ? (
            <Button
              type="submit"
              form="single-pin-form"
              variant="primary"
              size="md"
              className="w-full shadow-md shadow-brand-500/25 cursor-pointer font-bold py-2 text-xs"
              isLoading={isGenerating}
              leftIcon={
                isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )
              }
            >
              {isGenerating ? 'Synthesizing Clean Pin...' : 'Generate AI Image Now'}
            </Button>
          ) : (
            <Button
              size="md"
              variant="primary"
              onClick={handleSyncToQueue}
              disabled={rows.length === 0}
              isLoading={isSyncingQueue}
              leftIcon={<CalendarPlus className="w-4 h-4" />}
              className="w-full shadow-md shadow-brand-500/25 cursor-pointer font-bold py-2 text-xs"
            >
              {rows.length > 0
                ? `Schedule ${rows.length} Pins to Queue`
                : 'Connect Sheet First'}
            </Button>
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. RIGHT SIDE PANEL: Dedicated Canvas & Table Workspace   */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950/40 overflow-hidden min-w-0">
        {/* Right Panel Header Bar */}
        <div className="flex-shrink-0 h-16 border-b border-zinc-800/80 px-5 sm:px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              {activeTab === 'single' ? (
                <>
                  <LayoutGrid className="w-4 h-4 text-brand-400" />
                  <span>Live Creative Canvas &amp; Output</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Spreadsheet Campaign Preview</span>
                </>
              )}
            </h2>

            {activeTab === 'single' && imageResult && (
              <span className="hidden sm:inline-flex text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-zinc-900 text-zinc-300 border border-zinc-700/80">
                {imageResult.width} × {imageResult.height} ({imageResult.aspectRatio})
              </span>
            )}

            {activeTab === 'sheets' && rows.length > 0 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                {rows.length} Rows Ready
              </span>
            )}
          </div>

          {/* Right Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {activeTab === 'single' && imageResult && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsZoomed(true)}
                  leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
                  title="Expand Fullscreen"
                >
                  <span className="hidden sm:inline">Zoom</span>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownloadClean}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download HD
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsPublishModalOpen(true)}
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Publish to Pinterest
                </Button>
              </>
            )}

            {activeTab === 'sheets' && (
              <a
                href="/templates/sample-social-schedule.csv"
                download="sample-social-schedule.csv"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sample CSV</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Panel Main Workspace Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col min-h-0 relative">
          {activeTab === 'single' ? (
            /* --- SINGLE PIN CANVAS STAGE --- */
            <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-4 relative overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px]">
              {/* Anti-watermark guarantee pill */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Watermark-Free Engine</span>
              </div>

              {isGenerating ? (
                /* Generating State */
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-16 animate-in fade-in">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 animate-spin p-0.5">
                      <div className="w-full h-full bg-zinc-950 rounded-[14px]" />
                    </div>
                    <Sparkles className="w-6 h-6 text-brand-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      Synthesizing High-Resolution AI Image...
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Applying aesthetic filters &amp; watermark removal
                    </p>
                  </div>
                </div>
              ) : imageResult ? (
                /* Clean Image Preview Display */
                <div className="relative flex flex-col items-center justify-center h-full max-h-[calc(100vh-14rem)] w-full">
                  <div className="relative group rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black max-h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeDisplayUrl}
                      alt={imageResult.prompt}
                      className="max-h-[calc(100vh-16rem)] w-auto object-contain mx-auto rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                    />

                    {/* Hover Fullscreen Button */}
                    <button
                      onClick={() => setIsZoomed(true)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-md cursor-pointer"
                      title="Expand Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Canvas State */
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-16 text-zinc-500">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-zinc-200">Your AI Canvas is Ready</p>
                    <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed">
                      Enter any creative prompt in the left panel and click &quot;Generate AI Image Now&quot; to synthesize watermark-free pins.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- BULK SHEETS WORKSPACE --- */
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Success Notification Banner */}
              {syncSuccessCount !== null && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-4 animate-in fade-in flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-200">
                        Successfully Scheduled {syncSuccessCount} Pins!
                      </h4>
                      <p className="text-xs text-emerald-400/80">
                        Pins are queued and will automatically dispatch to Pinterest at their scheduled times.
                      </p>
                    </div>
                  </div>
                  <Link href="/queue">
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Queue
                    </Button>
                  </Link>
                </div>
              )}

              {rows.length > 0 ? (
                /* Full-Height Data Table Container */
                <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
                    <SheetDataPreviewTable rows={rows} />
                  </div>
                </div>
              ) : (
                /* Empty Sheets State */
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">
                      Connect Google Sheets or Upload CSV
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                      Use the left panel to paste your Google Spreadsheet share link or upload a CSV file with prompts, pin titles, and target boards.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      fetch('/templates/sample-social-schedule.csv')
                        .then((r) => r.text())
                        .then((csvText) => handleParseSheet({ csvContent: csvText }))
                        .catch(() => alert('Could not load sample template'));
                    }}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  >
                    Load Sample Schedule CSV
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Zoom Modal */}
      {isZoomed && imageResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-lg animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeDisplayUrl}
            alt={imageResult.prompt}
            className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl border border-zinc-800"
          />
        </div>
      )}

      {/* Quick Publish to Pinterest Modal */}
      {imageResult && (
        <QuickPublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          imageUrl={activeDisplayUrl}
          initialPrompt={imageResult.prompt}
        />
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
          Loading AI Creative Studio...
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
