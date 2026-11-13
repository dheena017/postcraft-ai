'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ModelSelector } from '@/components/studio/ModelSelector';
import { AspectRatioPicker } from '@/components/studio/AspectRatioPicker';
import { StylePresetSelector } from '@/components/studio/StylePresetSelector';
import { LightingSelector } from '@/components/studio/LightingSelector';
import { TextOverlayControls } from '@/components/studio/TextOverlayControls';
import { AdvancedOptionsDrawer } from '@/components/studio/AdvancedOptionsDrawer';
import { SheetConnectorCard } from '@/components/sheets/SheetConnectorCard';
import { ColumnMappingForm } from '@/components/sheets/ColumnMappingForm';
import { SheetDataPreviewTable } from '@/components/sheets/SheetDataPreviewTable';
import { QuickPublishModal } from '@/components/studio/QuickPublishModal';
import { CanvasToolbar } from '@/components/studio/CanvasToolbar';
import { ColorPaletteSwatches } from '@/components/studio/ColorPaletteSwatches';
import { PinterestCardPreview } from '@/components/studio/PinterestCardPreview';
import { SplitCompareView } from '@/components/studio/SplitCompareView';
import { PinStickerControls } from '@/components/studio/PinStickerControls';
import { PinSeoDrawer } from '@/components/studio/PinSeoDrawer';
import { PromptRemixChips } from '@/components/studio/PromptRemixChips';
import { PromptEnhancerControls } from '@/components/studio/PromptEnhancerControls';
import { ExportDropdown } from '@/components/studio/ExportDropdown';
import { EnhancedHistoryFilmstrip } from '@/components/studio/EnhancedHistoryFilmstrip';
import { removeWatermark, preloadImage } from '@/lib/ai/clean-image';
import { exportCompositePin, getFilterString } from '@/lib/ai/canvas-export';
import {
  INSPIRATION_CATEGORIES,
} from '@/lib/ai/presets';
import { SAMPLE_TEMPLATES } from '@/lib/sheets/sample-templates';
import StudioLoading from './loading';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  FileSpreadsheet,
  CalendarPlus,
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  Maximize2,
  LayoutGrid,
  Copy,
  Check,
  Dices,
  X,
  Clock,
  Bookmark,
  ShieldCheck,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AspectRatio,
  StylePresetId,
  LightingPresetId,
  PinOverlayConfig,
  ImageGenerationResult,
  AiModelId,
  CanvasFilterPreset,
  ImageAdjustments,
  PinStickerConfig,
  CanvasViewMode,
} from '@/types/image';
import { getModelConfig } from '@/lib/ai/models';
import { ParsedSheetRow, SheetMappingConfig } from '@/types/job';
import { logger } from '@/lib/logger';
import Link from 'next/link';

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
  const [lightingPreset, setLightingPreset] = useState<LightingPresetId>('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('Synthesizing High-Resolution AI Image...');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<ImageGenerationResult | null>(null);
  const [cleanImageUrl, setCleanImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [customSeed, setCustomSeed] = useState<number | null>(null);
  const [model, setModel] = useState<AiModelId>('flux');

  // Text Overlay State
  const [overlayConfig, setOverlayConfig] = useState<PinOverlayConfig>({
    enabled: false,
    headline: '',
    subtext: '',
    theme: 'glass',
    position: 'bottom',
  });

  // Categorized Inspiration Pills
  const [activeInspirationCategory, setActiveInspirationCategory] = useState<string>('trending');

  // Session History Filmstrip
  const [generationHistory, setGenerationHistory] = useState<ImageGenerationResult[]>([]);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Creative Canvas Live Enhancements
  const [viewMode, setViewMode] = useState<CanvasViewMode>('studio');
  const [activeFilter, setActiveFilter] = useState<CanvasFilterPreset>('none');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
  });
  const [stickers, setStickers] = useState<PinStickerConfig>({
    showSaveBadge: true,
    saveBadgeTheme: 'red',
    ctaBadge: {
      enabled: false,
      text: 'Tap to Shop 🛍️',
      position: 'bottom-left',
    },
    priceTag: {
      enabled: false,
      text: '$29.99',
      position: 'top-right',
    },
    watermark: {
      enabled: false,
      text: '@postcraft.ai',
    },
  });
  const [isSeoDrawerOpen, setIsSeoDrawerOpen] = useState(false);
  const [isStickersDrawerOpen, setIsStickersDrawerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const activeFilterStyle = getFilterString(activeFilter, adjustments);

  // Automatically remove watermark and preload image when imageResult changes
  useEffect(() => {
    if (imageResult?.imageUrl) {
      if (cleanImageUrl && (cleanImageUrl.includes(encodeURIComponent(imageResult.imageUrl)) || cleanImageUrl === imageResult.imageUrl)) {
        setIsImageLoading(false);
        return;
      }
      setIsImageLoading(true);
      removeWatermark(imageResult.imageUrl, imageResult.width, imageResult.height)
        .then(async (clean) => {
          await preloadImage(clean, imageResult.imageUrl);
          setCleanImageUrl(clean);
        })
        .catch(() => {
          setCleanImageUrl(imageResult.imageUrl);
        })
        .finally(() => {
          setIsImageLoading(false);
        });
    } else {
      setCleanImageUrl('');
      setIsImageLoading(false);
    }
  }, [imageResult, cleanImageUrl]);

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
  const [batchLightingPreset, setBatchLightingPreset] = useState<LightingPresetId>('auto');
  const [batchModel, setBatchModel] = useState<AiModelId>('flux');
  const [batchDefaultBoard, setBatchDefaultBoard] = useState('Home Decor Ideas');
  const [batchStaggerInterval, setBatchStaggerInterval] = useState(3);
  const [batchRowLimit, setBatchRowLimit] = useState(0);
  const [batchEnhancePrompt, setBatchEnhancePrompt] = useState(true);
  const [syncSuccessCount, setSyncSuccessCount] = useState<number | null>(null);

  const handleApplyStagger = (hours: number) => {
    setBatchStaggerInterval(hours);
    if (rows.length === 0 || hours === 0) return;
    const base = new Date();
    setRows((prev) =>
      prev.map((r, i) => {
        const scheduled = new Date(base.getTime() + i * hours * 60 * 60 * 1000);
        return {
          ...r,
          scheduleTime: scheduled.toISOString(),
        };
      })
    );
  };

  const handleDeleteRow = (rowIndex: number) => {
    setRows((prev) => prev.filter((r) => r.rowIndex !== rowIndex));
  };

  const handleDeleteRows = (rowIndices: number[]) => {
    setRows((prev) => prev.filter((r) => !rowIndices.includes(r.rowIndex)));
  };

  const handleUpdateRow = (rowIndex: number, updated: Partial<ParsedSheetRow>) => {
    setRows((prev) => prev.map((r) => (r.rowIndex === rowIndex ? { ...r, ...updated } : r)));
  };

  const handleAddRow = (newRowData: Omit<ParsedSheetRow, 'rowIndex'>) => {
    setRows((prev) => {
      const nextIndex = prev.length > 0 ? Math.max(...prev.map((r) => r.rowIndex)) + 1 : 1;
      return [...prev, { ...newRowData, rowIndex: nextIndex }];
    });
  };

  const handleDuplicateRow = (rowIndex: number) => {
    setRows((prev) => {
      const target = prev.find((r) => r.rowIndex === rowIndex);
      if (!target) return prev;
      const nextIndex = Math.max(...prev.map((r) => r.rowIndex)) + 1;
      const scheduled = new Date(new Date(target.scheduleTime).getTime() + 60 * 60 * 1000).toISOString();
      const cloned: ParsedSheetRow = {
        ...target,
        rowIndex: nextIndex,
        title: target.title ? `${target.title} (Copy)` : 'New Pin (Copy)',
        scheduleTime: scheduled,
      };
      return [...prev, cloned];
    });
  };

  const handleMoveRow = (rowIndex: number, direction: 'up' | 'down') => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.rowIndex === rowIndex);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleClearAll = () => {
    setRows([]);
    setHeaders([]);
    setRawCsv(null);
  };

  const handleLoadDefaultDemo = () => {
    const defaultTmpl = SAMPLE_TEMPLATES[0];
    if (defaultTmpl) {
      handleParseSheet({ csvContent: defaultTmpl.csvContent });
    }
  };

  // --- Single Mode Handlers ---
  const handleGenerate = async (e?: React.FormEvent, overrideSeed?: number) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    const modelCfg = getModelConfig(model);
    setGenerationStage(`Synthesizing pin prompt with ${modelCfg.shortName} (${aspectRatio})...`);

    const chosenSeed = overrideSeed ?? (customSeed ?? undefined);
    logger.studio.info(
      `Synthesizing pin prompt: "${prompt.trim().slice(0, 50)}..." [ratio: ${aspectRatio}, preset: ${stylePreset}, lighting: ${lightingPreset}]`
    );

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          stylePreset,
          lightingPreset,
          negativePrompt: negativePrompt.trim() || undefined,
          seed: chosenSeed,
          enhancePrompt,
          model,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGenerationStage('Removing watermarks & preparing Ultra-HD preview...');
      const cleanUrl = await removeWatermark(data.imageUrl, data.width, data.height);

      // Preload image so frontend never shows a blank/black void or broken alt-text box
      await preloadImage(cleanUrl, data.imageUrl);

      logger.studio.success(`Image synthesis finished: ${data.width}x${data.height} (Seed: ${data.seed})`);
      setCleanImageUrl(cleanUrl);
      setImageResult(data);
      setIsImageLoading(false);
      setGenerationHistory((prev) => [data, ...prev.filter((item) => item.imageUrl !== data.imageUrl)].slice(0, 8));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      logger.studio.error(`Generation failed: ${msg}`, err);
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistory = async (item: ImageGenerationResult) => {
    if (imageResult?.imageUrl === item.imageUrl) return;
    setIsImageLoading(true);
    setImageResult(item);
    try {
      const clean = await removeWatermark(item.imageUrl, item.width, item.height);
      await preloadImage(clean, item.imageUrl);
      setCleanImageUrl(clean);
    } catch {
      setCleanImageUrl(item.imageUrl);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleLoadPromptAndSeed = (item: ImageGenerationResult) => {
    setPrompt(item.prompt);
    if (item.aspectRatio) setAspectRatio(item.aspectRatio);
    if (item.seed) setCustomSeed(item.seed);
    if (item.model) setModel(item.model);
    handleSelectHistory(item);
  };

  const handleDeleteHistoryItem = (index: number) => {
    setGenerationHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearHistory = () => {
    setGenerationHistory([]);
  };

  const handleRegenerateVariation = () => {
    const newSeed = Math.floor(Math.random() * 99999999);
    setCustomSeed(newSeed);
    handleGenerate(undefined, newSeed);
  };

  const handleExportPin = async (
    format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
    scale: number = 1
  ) => {
    if (!imageResult) return;
    setIsExporting(true);
    try {
      const sourceUrl = cleanImageUrl || imageResult.imageUrl;
      const downloadUrl = await exportCompositePin(sourceUrl, {
        overlay: overlayConfig,
        filter: activeFilter,
        adjustments,
        stickers,
        targetWidth: imageResult.width,
        targetHeight: imageResult.height,
        format,
        scale,
      });

      const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `postcraft_${imageResult.aspectRatio.replace(':', 'x')}_${scale}x_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      logger.studio.error('Failed to export composite pin', err);
      window.open(imageResult.imageUrl, '_blank');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!activeDisplayUrl) return;
    try {
      const sourceUrl = cleanImageUrl || (imageResult ? imageResult.imageUrl : activeDisplayUrl);
      const targetUrl = await exportCompositePin(sourceUrl, {
        overlay: overlayConfig,
        filter: activeFilter,
        adjustments,
        stickers,
        targetWidth: imageResult?.width || 1000,
        targetHeight: imageResult?.height || 1500,
        format: 'image/png',
        scale: 1,
      });

      const res = await fetch(targetUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch {
      // Fallback: copy prompt or link
      await navigator.clipboard.writeText(activeDisplayUrl);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
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
      const effectiveRows = batchRowLimit > 0 ? rows.slice(0, batchRowLimit) : rows;
      const res = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: effectiveRows,
          aspectRatio: batchAspectRatio,
          stylePreset: batchStylePreset,
          lightingPreset: batchLightingPreset,
          model: batchModel,
          defaultBoard: batchDefaultBoard,
          scheduleIntervalHours: batchStaggerInterval,
          limitRows: batchRowLimit,
          providerId: 'pinterest',
          source: 'GOOGLE_SHEETS',
          enhancePrompt: batchEnhancePrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to queue jobs');

      setSyncSuccessCount(data.count || effectiveRows.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Queue synchronization failed';
      alert(msg);
    } finally {
      setIsSyncingQueue(false);
    }
  };

  const currentCategoryObj =
    INSPIRATION_CATEGORIES.find((c) => c.id === activeInspirationCategory) ||
    INSPIRATION_CATEGORIES[0];

  return (
    <div className="h-full w-full flex flex-row bg-zinc-950 overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 1. LEFT SIDE PANEL: Compact Controls, Mode Switcher & Form */}
      {/* ======================================================== */}
      <aside className="w-full lg:w-[420px] xl:w-[440px] flex-shrink-0 flex flex-col h-full border-r border-zinc-800/80 bg-zinc-950 z-10 overflow-hidden">
        {/* Left Panel Header & Mode Switcher */}
        <div className="flex-shrink-0 p-3 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <h2 className="text-xs font-bold text-white tracking-tight uppercase">
                Studio Controls
              </h2>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">v2.0 Pro</span>
          </div>

          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-900/90 p-0.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-colors duration-75 active:scale-95 cursor-pointer ${
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
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-colors duration-75 active:scale-95 cursor-pointer ${
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
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-4 scrollbar-thin">
          {errorMessage && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
              ⚠️ {errorMessage}
            </div>
          )}

          {activeTab === 'single' ? (
            /* --- SINGLE PIN FORM --- */
            <form id="single-pin-form" onSubmit={handleGenerate} className="space-y-4">
              {/* Image Prompt with Advanced Prompt Enhancer Suite */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-400" />
                    <span>Image Prompt &amp; AI Enhancer</span>
                  </label>
                </div>

                {/* State-of-the-art Multi-Mode Prompt Enhancer Suite */}
                <PromptEnhancerControls
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  disabled={isGenerating}
                />

                <div className="relative">
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                    placeholder="E.g., Aesthetic Scandinavian living room with beige linen sofa, olive tree, morning sunlight, cozy atmosphere..."
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 py-2 pr-7 text-xs text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                  />
                  {prompt && (
                    <button
                      type="button"
                      onClick={() => setPrompt('')}
                      className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      title="Clear Prompt"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 1-Click Aesthetic Prompt Remix Chips */}
                <PromptRemixChips
                  currentPrompt={prompt}
                  onAppendModifier={(mod) =>
                    setPrompt((prev) => (prev ? `${prev.trim()}${mod}` : mod.replace(/^[,\s]+/, '')))
                  }
                />

                {/* Categorized Inspiration Chips */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                    {INSPIRATION_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveInspirationCategory(cat.id)}
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap transition-colors duration-75 active:scale-95 cursor-pointer ${
                          activeInspirationCategory === cat.id
                            ? 'bg-zinc-800 text-white border border-zinc-600'
                            : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 border border-zinc-850'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {currentCategoryObj.chips.map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPrompt(chip.prompt)}
                        className="text-[10px] px-2 py-1 rounded-md bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/80 transition-colors duration-75 active:scale-95 cursor-pointer flex items-center gap-1 font-medium"
                      >
                        <span>💡</span>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Diffusion Model Selector */}
              <ModelSelector value={model} onChange={setModel} />

              {/* Aspect Ratio Picker with proportional shapes */}
              <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />

              {/* Style Presets with Category Filter */}
              <StylePresetSelector value={stylePreset} onChange={setStylePreset} />

              {/* Lighting & Atmosphere Mood Selector */}
              <LightingSelector value={lightingPreset} onChange={setLightingPreset} />

              {/* Pin Typography / Headline Overlay */}
              <TextOverlayControls config={overlayConfig} onChange={setOverlayConfig} />

              {/* Advanced Options & Fine-Tuning */}
              <AdvancedOptionsDrawer
                negativePrompt={negativePrompt}
                onNegativePromptChange={setNegativePrompt}
                seed={customSeed}
                onSeedChange={setCustomSeed}
                enhancePrompt={enhancePrompt}
                onEnhancePromptChange={setEnhancePrompt}
                model={model}
                onModelChange={setModel}
              />
            </form>
          ) : (
            /* --- BULK SHEETS CONTROLS --- */
            <div className="space-y-3.5">
              {rows.length > 0 ? (
                /* Connected Sheet Compact Status Bar */
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-emerald-200 truncate">
                        {rows.length} Rows Connected
                      </p>
                      <p className="text-[10px] text-emerald-400/80 truncate">
                        Ready for batch scheduling
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRows([]);
                      setHeaders([]);
                      setRawCsv(null);
                    }}
                    className="text-[10px] font-semibold px-2 py-1 rounded-md bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-colors cursor-pointer flex-shrink-0"
                  >
                    Change Sheet
                  </button>
                </div>
              ) : (
                /* Connect Sheet Card */
                <SheetConnectorCard onParse={handleParseSheet} isLoading={isParsingSheet} />
              )}

              {/* Column Mapping (When Sheet Loaded) */}
              {headers.length > 0 && (
                <ColumnMappingForm
                  headers={headers}
                  mapping={mapping}
                  onChange={handleMappingChange}
                />
              )}

              {/* Batch Output Settings */}
              <div className="space-y-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
                    <span>Batch Campaign Settings</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-semibold px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700">
                    {rows.length > 0 ? (batchRowLimit > 0 ? `First ${batchRowLimit} of ${rows.length}` : `${rows.length} Pins`) : 'All Pins'}
                  </span>
                </div>

                {/* Batch Model Selector */}
                <ModelSelector
                  value={batchModel}
                  onChange={setBatchModel}
                  label="Batch Synthesis Engine"
                  compact
                />

                {/* Aspect Ratio Picker */}
                <AspectRatioPicker value={batchAspectRatio} onChange={setBatchAspectRatio} />

                {/* Style Presets with Category Filter & Search */}
                <StylePresetSelector value={batchStylePreset} onChange={setBatchStylePreset} />

                {/* Lighting Mood for Batch */}
                <LightingSelector value={batchLightingPreset} onChange={setBatchLightingPreset} />

                {/* Target Pinterest Board */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-brand-400" />
                      <span>Target Pinterest Board</span>
                    </label>
                    <span className="text-[9px] text-zinc-500">Default fallback</span>
                  </div>
                  <input
                    type="text"
                    value={batchDefaultBoard}
                    onChange={(e) => setBatchDefaultBoard(e.target.value)}
                    placeholder="E.g., Home Decor Ideas"
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none"
                  />
                  {/* Quick Board Pills */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['Home Decor Ideas', 'Aesthetic Recipes', 'Fashion & Outfits', 'Daily Motivation'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBatchDefaultBoard(b)}
                        className={`text-[9px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          batchDefaultBoard === b
                            ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 font-semibold'
                            : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drip Scheduling Pacing */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>Drip Scheduling Pacing</span>
                    </label>
                    <span className="text-[9px] text-emerald-400/90 font-medium">Staggered dispatch</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { hours: 0, label: 'Immediate' },
                      { hours: 1, label: 'Every 1h' },
                      { hours: 3, label: 'Every 3h (Best)' },
                      { hours: 6, label: 'Every 6h' },
                      { hours: 12, label: 'Every 12h' },
                      { hours: 24, label: 'Daily (24h)' },
                    ].map((item) => (
                      <button
                        key={item.hours}
                        type="button"
                        onClick={() => handleApplyStagger(item.hours)}
                        className={`py-1 px-1.5 rounded-lg border text-center text-[10px] transition-colors cursor-pointer ${
                          batchStaggerInterval === item.hours
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold ring-1 ring-emerald-500/40'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Batch Limiter & Test Run */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-brand-400" />
                      <span>Batch Processing Scope</span>
                    </label>
                    <span className="text-[9px] text-zinc-500">Test or Full</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { limit: 0, label: rows.length > 0 ? `All (${rows.length})` : 'All Rows' },
                      { limit: 3, label: 'First 3 (Test)' },
                      { limit: 5, label: 'First 5' },
                      { limit: 10, label: 'First 10' },
                    ].map((item) => (
                      <button
                        key={item.limit}
                        type="button"
                        onClick={() => setBatchRowLimit(item.limit)}
                        className={`py-1 px-1 rounded-lg border text-center text-[10px] transition-colors cursor-pointer ${
                          batchRowLimit === item.limit
                            ? 'border-brand-500 bg-brand-500/20 text-brand-300 font-bold ring-1 ring-brand-500/40'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Prompt Optimization Toggle & Anti-Watermark Shield */}
                <div className="pt-2 border-t border-zinc-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] text-zinc-300 font-medium">
                        Smart Prompt Magic Auto-Enrich
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={batchEnhancePrompt}
                      onChange={(e) => setBatchEnhancePrompt(e.target.checked)}
                      className="accent-brand-500 rounded cursor-pointer w-3.5 h-3.5"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>100% Neural Watermark Removal Active (Zero artifacts)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Left Panel Fixed Bottom Footer Button */}
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
          ) : rows.length > 0 ? (
            <Button
              size="md"
              variant="primary"
              onClick={handleSyncToQueue}
              isLoading={isSyncingQueue}
              leftIcon={<CalendarPlus className="w-4 h-4" />}
              className="w-full shadow-md shadow-brand-500/25 cursor-pointer font-bold py-2 text-xs"
            >
              Schedule {batchRowLimit > 0 ? Math.min(batchRowLimit, rows.length) : rows.length} Pins to Queue
            </Button>
          ) : (
            <Button
              size="md"
              variant="primary"
              onClick={handleLoadDefaultDemo}
              isLoading={isParsingSheet}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              className="w-full shadow-md shadow-brand-500/25 cursor-pointer font-bold py-2 text-xs"
            >
              Try 1-Click Demo Campaign (5 Pins)
            </Button>
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. RIGHT SIDE PANEL: Dedicated Canvas & Table Workspace   */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950/40 overflow-hidden min-w-0">
        {/* Right Panel Header Bar */}
        <div className="flex-shrink-0 h-16 border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              {activeTab === 'single' ? (
                <>
                  <LayoutGrid className="w-4 h-4 text-brand-400" />
                  <span>Live Creative Canvas</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Spreadsheet Campaign Preview</span>
                </>
              )}
            </h2>

            {activeTab === 'single' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700/80">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span>{getModelConfig(model).shortName}</span>
                <span className="text-amber-400 font-mono text-[10px]">({getModelConfig(model).speed})</span>
              </span>
            )}

            {activeTab === 'single' && imageResult && (
              <span className="hidden md:inline-flex text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-zinc-900 text-zinc-300 border border-zinc-700/80">
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
          <div className="flex items-center gap-2">
            {activeTab === 'single' && imageResult && (
              <>
                {/* Reroll Variation */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateVariation}
                  disabled={isGenerating}
                  leftIcon={<Dices className="w-3.5 h-3.5 text-amber-400" />}
                  title="Synthesize New Variation"
                >
                  <span className="hidden md:inline">Variation</span>
                </Button>

                {/* Copy Image */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyImage}
                  leftIcon={
                    copiedSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                  title="Copy Composite Pin to Clipboard"
                >
                  <span className="hidden md:inline">
                    {copiedSuccess ? 'Copied!' : 'Copy'}
                  </span>
                </Button>

                {/* Zoom Fullscreen */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsZoomed(true)}
                  leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
                  title="Expand Fullscreen"
                >
                  <span className="hidden sm:inline">Zoom</span>
                </Button>

                {/* Multi-Format HD Export Dropdown */}
                <ExportDropdown
                  onExport={handleExportPin}
                  onCopyImage={handleCopyImage}
                  isExporting={isExporting}
                />

                {/* Publish to Pinterest */}
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
        <div className="flex-1 p-4 sm:p-5 overflow-hidden flex flex-col min-h-0 relative">
          {activeTab === 'single' ? (
            /* --- SINGLE PIN CANVAS STAGE --- */
            <div className={`flex-1 flex flex-col items-center justify-between rounded-2xl border border-zinc-800/80 p-4 relative overflow-hidden transition-all ${
              viewMode === 'ambient-glow'
                ? 'bg-gradient-to-b from-zinc-950 via-zinc-900 to-black'
                : 'bg-zinc-900/20 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px]'
            }`}>
              {/* Live Canvas Toolbar */}
              {imageResult && (
                <div className="w-full mb-3">
                  <CanvasToolbar
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    adjustments={adjustments}
                    onAdjustmentsChange={setAdjustments}
                    stickers={stickers}
                    onStickersChange={setStickers}
                    isSeoDrawerOpen={isSeoDrawerOpen}
                    onToggleSeoDrawer={() => {
                      setIsSeoDrawerOpen(!isSeoDrawerOpen);
                      if (isStickersDrawerOpen) setIsStickersDrawerOpen(false);
                    }}
                    isStickersDrawerOpen={isStickersDrawerOpen}
                    onToggleStickersDrawer={() => {
                      setIsStickersDrawerOpen(!isStickersDrawerOpen);
                      if (isSeoDrawerOpen) setIsSeoDrawerOpen(false);
                    }}
                    hasPreviousItem={generationHistory.length > 1}
                  />

                  {/* Badges & Stickers Drawer */}
                  {isStickersDrawerOpen && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                      <PinStickerControls
                        config={stickers}
                        onChange={setStickers}
                        onClose={() => setIsStickersDrawerOpen(false)}
                      />
                    </div>
                  )}

                  {/* Pin SEO & Copy Kit Drawer */}
                  {isSeoDrawerOpen && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                      <PinSeoDrawer
                        prompt={imageResult.prompt}
                        onClose={() => setIsSeoDrawerOpen(false)}
                        onApplyTitle={(title) =>
                          setOverlayConfig((prev) => ({
                            ...prev,
                            headline: title,
                            enabled: true,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Main Display Area */}
              <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 relative">
                {isGenerating ? (
                  /* Generating State */
                  <div className="flex flex-col items-center justify-center text-center space-y-4 py-16 animate-in fade-in">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 animate-spin p-0.5 shadow-lg shadow-brand-500/20">
                        <div className="w-full h-full bg-zinc-950 rounded-[14px]" />
                      </div>
                      <Sparkles className="w-6 h-6 text-brand-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <p className="text-sm font-semibold text-zinc-200">
                        {generationStage}
                      </p>
                      <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Applying aesthetic filters &amp; watermark removal</span>
                      </p>
                    </div>
                  </div>
                ) : imageResult ? (
                  /* 1. Pinterest Feed Mobile Card View */
                  viewMode === 'pinterest-mockup' ? (
                    <PinterestCardPreview
                      imageUrl={activeDisplayUrl}
                      prompt={imageResult.prompt}
                      title={overlayConfig.headline}
                      filterStyle={activeFilterStyle}
                    />
                  ) : /* 2. Before/After Split Comparison View */
                  viewMode === 'split-compare' && generationHistory.length > 1 ? (
                    <SplitCompareView
                      currentResult={imageResult}
                      previousResult={generationHistory[1]}
                      currentFilterStyle={activeFilterStyle}
                    />
                  ) : (
                    /* 3. Studio / Ambient Glow Live Creative Canvas View */
                    <div className="relative flex flex-col items-center justify-center h-full max-h-[calc(100vh-17rem)] w-full">
                      {/* Ambient Glow Aura */}
                      {viewMode === 'ambient-glow' && (
                        <div
                          className="absolute inset-0 max-w-xs mx-auto rounded-3xl opacity-40 blur-3xl pointer-events-none transition-all duration-700 -z-10"
                          style={{
                            backgroundImage: `url(${activeDisplayUrl})`,
                            backgroundSize: 'cover',
                          }}
                        />
                      )}

                      <div
                        className="relative group rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black max-h-full"
                        style={{
                          aspectRatio: imageResult ? `${imageResult.width} / ${imageResult.height}` : undefined,
                          minHeight: isImageLoading ? '360px' : undefined,
                          minWidth: isImageLoading ? '240px' : undefined,
                        }}
                      >
                        {isImageLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-sm z-10 animate-in fade-in">
                            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mb-2" />
                            <p className="text-xs text-zinc-300 font-medium">Rendering HD preview...</p>
                          </div>
                        )}

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeDisplayUrl}
                          alt={imageResult.prompt}
                          onLoad={() => setIsImageLoading(false)}
                          onError={() => setIsImageLoading(false)}
                          style={{
                            filter: activeFilterStyle !== 'none' ? activeFilterStyle : undefined,
                          }}
                          className={`max-h-[calc(100vh-19rem)] w-auto object-contain mx-auto rounded-2xl transition-all duration-300 group-hover:scale-[1.008] ${
                            isImageLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
                          }`}
                        />

                        {/* Interactive Sticker: Pinterest "Save" Badge (Top-Left) */}
                        {stickers.showSaveBadge && (
                          <div className="absolute top-3 left-3 z-20 transition-transform group-hover:scale-105 pointer-events-none">
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg backdrop-blur-md ${
                                stickers.saveBadgeTheme === 'white'
                                  ? 'bg-white text-zinc-900 border border-zinc-200'
                                  : stickers.saveBadgeTheme === 'glass'
                                  ? 'bg-black/60 text-white border border-white/20'
                                  : stickers.saveBadgeTheme === 'dark'
                                  ? 'bg-zinc-950 text-white border border-zinc-800'
                                  : 'bg-[#e60023] text-white shadow-red-900/40'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" />
                              <span>Save</span>
                            </div>
                          </div>
                        )}

                        {/* Interactive Sticker: CTA Badge */}
                        {stickers.ctaBadge.enabled && stickers.ctaBadge.text.trim() && (
                          <div
                            className={`absolute z-20 pointer-events-none transition-transform ${
                              stickers.ctaBadge.position === 'top-right'
                                ? 'top-3 right-12'
                                : stickers.ctaBadge.position === 'top-left'
                                ? 'top-12 left-3'
                                : stickers.ctaBadge.position === 'bottom-right'
                                ? 'bottom-3 right-3'
                                : 'bottom-3 left-3'
                            }`}
                          >
                            <div className="px-3 py-1 rounded-full bg-zinc-950/90 text-white font-bold text-xs border border-white/25 shadow-xl backdrop-blur-md flex items-center gap-1.5">
                              <span>{stickers.ctaBadge.text}</span>
                            </div>
                          </div>
                        )}

                        {/* Interactive Sticker: Price Tag */}
                        {stickers.priceTag.enabled && stickers.priceTag.text.trim() && (
                          <div
                            className={`absolute z-20 pointer-events-none transition-transform ${
                              stickers.priceTag.position === 'bottom-left'
                                ? 'bottom-3 left-3'
                                : stickers.priceTag.position === 'bottom-right'
                                ? 'bottom-3 right-3'
                                : stickers.priceTag.position === 'top-left'
                                ? 'top-3 left-16'
                                : 'top-3 right-12'
                            }`}
                          >
                            <div className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-black text-xs shadow-xl tracking-tight">
                              <span>{stickers.priceTag.text}</span>
                            </div>
                          </div>
                        )}

                        {/* Creator Watermark */}
                        {stickers.watermark.enabled && stickers.watermark.text.trim() && (
                          <div className="absolute bottom-1 inset-x-0 text-center pointer-events-none z-10">
                            <span className="text-[10px] text-white/60 font-mono tracking-wider">
                              {stickers.watermark.text}
                            </span>
                          </div>
                        )}

                        {/* Live Text / Typography Overlay Card */}
                        {overlayConfig.enabled && overlayConfig.headline.trim() && (
                          <div
                            className={`absolute pointer-events-none transition-all ${
                              overlayConfig.position === 'top'
                                ? 'top-4 inset-x-4'
                                : overlayConfig.position === 'center'
                                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%]'
                                : 'bottom-4 inset-x-4'
                            } ${
                              overlayConfig.theme === 'glass'
                                ? 'bg-zinc-950/80 backdrop-blur-md border border-white/20 text-white shadow-2xl p-3.5 rounded-xl text-center'
                                : overlayConfig.theme === 'minimal-light'
                                ? 'bg-white/95 text-zinc-900 border border-zinc-200 shadow-2xl p-3.5 rounded-xl text-center'
                                : overlayConfig.theme === 'minimal-dark'
                                ? 'bg-zinc-950/95 text-white border border-zinc-800 shadow-2xl p-3.5 rounded-xl text-center'
                                : overlayConfig.theme === 'editorial'
                                ? 'bg-stone-900/95 text-amber-100 border border-amber-500/30 font-serif shadow-2xl p-3.5 rounded-xl text-center tracking-wide'
                                : 'bg-brand-600 text-white font-black uppercase tracking-tight shadow-2xl py-3 px-4 text-center rounded-lg'
                            }`}
                          >
                            <div className="text-xs sm:text-sm font-extrabold leading-snug drop-shadow-sm">
                              {overlayConfig.headline}
                            </div>
                            {overlayConfig.subtext && (
                              <div className="text-[9px] sm:text-[10px] opacity-80 mt-1 uppercase tracking-wider font-semibold">
                                {overlayConfig.subtext}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Hover Fullscreen Button */}
                        <button
                          onClick={() => setIsZoomed(true)}
                          className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-md cursor-pointer z-30"
                          title="Expand Fullscreen"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Brand Color Palette Swatches Bar */}
                      <div className="mt-3 w-full max-w-sm">
                        <ColorPaletteSwatches
                          prompt={imageResult.prompt}
                          imageUrl={activeDisplayUrl}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  /* Empty Canvas State */
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-16 text-zinc-500">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-zinc-200">Your AI Canvas is Ready</p>
                      <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed">
                        Pick an aesthetic style, lighting mood, or click &quot;Surprise Me&quot; to synthesize watermark-free Pinterest pins.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Session History Filmstrip */}
              {generationHistory.length > 0 && (
                <EnhancedHistoryFilmstrip
                  history={generationHistory}
                  activeItem={imageResult}
                  onSelectItem={handleSelectHistory}
                  onLoadPromptAndSeed={handleLoadPromptAndSeed}
                  onDeleteItem={handleDeleteHistoryItem}
                  onClearHistory={handleClearHistory}
                  onQuickDownload={(item) => handleExportPin('image/jpeg', 1)}
                />
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
                    <SheetDataPreviewTable
                      rows={rows}
                      onDeleteRow={handleDeleteRow}
                      onDeleteRows={handleDeleteRows}
                      onUpdateRow={handleUpdateRow}
                      onAddRow={handleAddRow}
                      onDuplicateRow={handleDuplicateRow}
                      onMoveRow={handleMoveRow}
                      onClearAll={handleClearAll}
                      defaultBoard={batchDefaultBoard}
                    />
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
                      Use the left panel to paste your Google Spreadsheet share link, upload a CSV file, or launch one of our 1-click starter campaigns.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleLoadDefaultDemo}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                    >
                      Load Home Decor Demo (5 Pins)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const foodTmpl = SAMPLE_TEMPLATES.find((t) => t.id === 'food-drinks');
                        if (foodTmpl) handleParseSheet({ csvContent: foodTmpl.csvContent });
                      }}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Load Aesthetic Cafe Demo (5 Pins)
                    </Button>
                  </div>
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
    <Suspense fallback={<StudioLoading />}>
      <StudioContent />
    </Suspense>
  );
}
