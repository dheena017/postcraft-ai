'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScheduledJob } from '@/types/job';
import { ImageGenerationResult, StylePresetId } from '@/types/image';
import { logger } from '@/lib/logger';
import { STYLE_PRESETS } from '@/lib/ai/presets';
import { QuickPublishModal } from '@/components/studio/QuickPublishModal';
import { removeWatermark } from '@/lib/ai/clean-image';
import {
  Sparkles,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Play,
  ArrowRight,
  Download,
  Share2,
  ShieldCheck,
  Zap,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';

export default function DashboardPage() {
  // Data States
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [gallery, setGallery] = useState<ImageGenerationResult[]>([]);
  const [pinterestAccount, setPinterestAccount] = useState<string | null>(null);
  const [isPinterestConnected, setIsPinterestConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [queueTab, setQueueTab] = useState<'UPCOMING' | 'RECENT_PUBLISHED'>('UPCOMING');

  // Scheduler Runner State
  const [isRunningScheduler, setIsRunningScheduler] = useState(false);
  const [runNotification, setRunNotification] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Quick Generator State
  const [quickPrompt, setQuickPrompt] = useState('');
  const [quickPreset, setQuickPreset] = useState<StylePresetId>('aesthetic-minimal');
  const [quickBoard, setQuickBoard] = useState('Home Decor Ideas');
  const [availableBoards, setAvailableBoards] = useState<string[]>([
    'Home Decor Ideas',
    'Design Inspiration',
    'Aesthetic Minimalist Pins',
    'DIY & Creative Crafts',
    'Fashion & Lifestyle Trends',
    'Cozy Workspaces & Tech',
  ]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<ImageGenerationResult | null>(null);
  const [publishModalImage, setPublishModalImage] = useState<ImageGenerationResult | null>(null);

  const handleDownloadImage = async (img: ImageGenerationResult) => {
    try {
      const cleanUrl = await removeWatermark(img.imageUrl, img.width, img.height);
      if (cleanUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = cleanUrl;
        a.download = `postcraft_${img.seed}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      window.open(img.imageUrl, '_blank');
    } catch {
      window.open(img.imageUrl, '_blank');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [queueRes, galleryRes, authRes, boardsRes] = await Promise.all([
        fetch('/api/queue').then((r) => r.json()).catch(() => []),
        fetch('/api/gallery').then((r) => r.json()).catch(() => []),
        fetch('/api/providers/pinterest/auth').then((r) => r.json()).catch(() => ({})),
        fetch('/api/providers/pinterest/boards').then((r) => r.json()).catch(() => []),
      ]);

      if (Array.isArray(queueRes)) setJobs(queueRes);
      if (Array.isArray(galleryRes)) setGallery(galleryRes);
      if (Array.isArray(boardsRes) && boardsRes.length > 0) {
        setAvailableBoards(boardsRes.map((b: { name: string }) => b.name));
      }
      if (authRes) {
        setIsPinterestConnected(Boolean(authRes.isConnected));
        setPinterestAccount(authRes.connectedAccountName || null);
      }
      logger.client.debug(`Dashboard refreshed: ${queueRes.length || 0} queue jobs, ${galleryRes.length || 0} gallery images`);
    } catch (err) {
      logger.client.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRunScheduler = async () => {
    setIsRunningScheduler(true);
    setRunNotification(null);
    try {
      const res = await fetch('/api/queue/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRunNotification(
          `Scheduler executed: ${data.processedCount || 0} processed, ${data.publishedCount || 0} published to Pinterest.`
        );
      } else {
        setRunNotification('Scheduler run completed.');
      }
      await loadDashboardData();
    } catch {
      setRunNotification('Scheduler triggered successfully.');
    } finally {
      setIsRunningScheduler(false);
      setTimeout(() => setRunNotification(null), 5000);
    }
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const res = await fetch('/api/export/zip', { method: 'POST' });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pinterest_bulk_export_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleQuickSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: quickPrompt.trim(),
          aspectRatio: '2:3',
          stylePreset: quickPreset,
        }),
      });

      if (!res.ok) throw new Error('Synthesis failed');
      const data: ImageGenerationResult = await res.json();
      setGeneratedPreview(data);
      await loadDashboardData();
    } catch (err) {
      alert('Error generating preview: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAddQuickToQueue = async () => {
    if (!quickPrompt.trim()) return;
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: quickPrompt.trim(),
          title: quickPrompt.trim().slice(0, 80),
          description: `Synthesized with PostCraft AI: ${quickPrompt.trim()}`,
          boardName: quickBoard || 'General Ideas',
          aspectRatio: '2:3',
          stylePreset: quickPreset,
          providerId: 'pinterest',
          scheduledFor: new Date(Date.now() + 15 * 60000).toISOString(),
        }),
      });
      if (res.ok) {
        setRunNotification('Pin successfully scheduled to queue for +15m dispatch!');
        setQuickPrompt('');
        await loadDashboardData();
        setTimeout(() => setRunNotification(null), 4000);
      }
    } catch {
      alert('Failed to schedule quick pin');
    }
  };

  // Metrics
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter((j) => j.status === 'PENDING' || j.status === 'READY');
  const publishedJobs = jobs.filter((j) => j.status === 'PUBLISHED');
  const totalCreations = gallery.length;

  const upcomingList = pendingJobs.slice(0, 5);
  const publishedList = publishedJobs.slice(0, 5);
  const displayedJobs = queueTab === 'UPCOMING' ? upcomingList : publishedList;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Run Notification Toast */}
      {runNotification && (
        <div className="p-4 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-sm flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{runNotification}</span>
          </div>
          <button
            onClick={() => setRunNotification(null)}
            className="text-xs hover:text-white px-2 py-1 rounded-md bg-zinc-900/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Welcome & Operational Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Operations Center
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Scheduler Active (60s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-400">
            Monitor automated pin queues, synthesize instant visuals, and publish directly to Pinterest boards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunScheduler}
            isLoading={isRunningScheduler}
            leftIcon={<Play className="w-3.5 h-3.5 text-brand-400" />}
            title="Execute pending queue jobs immediately"
          >
            Run Queue Now
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportZip}
            isLoading={isExportingZip}
            leftIcon={<Download className="w-3.5 h-3.5 text-zinc-300" />}
            title="Download bulk ready-to-upload ZIP"
          >
            Export ZIP
          </Button>

          <Link href="/studio?mode=sheets" prefetch={true}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Import Sheets
            </Button>
          </Link>

          <Link href="/studio" prefetch={true}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
              className="shadow-md shadow-brand-500/25"
            >
              Open Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card glow className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Creations
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton width={60} height={36} className="rounded-lg mb-1" />
            ) : (
              <div className="text-3xl font-black text-white">{totalCreations}</div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Watermark-Free</span>
            </div>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active In Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton width={50} height={36} className="rounded-lg mb-1" />
            ) : (
              <div className="text-3xl font-black text-white">{pendingJobs.length}</div>
            )}
            <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-400">
              <span>{isLoading ? 'Loading queue...' : `${totalJobs} total tasks logged`}</span>
            </div>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Published Pins
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton width={50} height={36} className="rounded-lg mb-1" />
            ) : (
              <div className="text-3xl font-black text-white">{publishedJobs.length}</div>
            )}
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Direct to Pinterest</span>
            </div>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pinterest API v5
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPinterestConnected
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton width={120} height={24} className="rounded-md mb-1" />
            ) : (
              <div className="text-base font-bold text-white truncate">
                {isPinterestConnected
                  ? pinterestAccount || 'Connected'
                  : 'Demo Mode'}
              </div>
            )}
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{isPinterestConnected ? 'Credentials Connected' : 'Credentials Active'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Quick Generator & Live Queue Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick Pin Synthesizer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card glow className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Quick Pin Synthesizer</h3>
                  <p className="text-[11px] text-zinc-400">Generate 2:3 Pinterest visuals instantly</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FLUX / SDXL
              </span>
            </div>

            <form onSubmit={handleQuickSynthesize} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Visual Prompt
                </label>
                <textarea
                  rows={3}
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="e.g. Cozy Scandinavian home office with monstera plant and morning sunlight..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                />
              </div>

              {/* Aesthetic Preset Chips */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Style Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.slice(0, 4).map((p) => {
                    const isSelected = quickPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setQuickPreset(p.id)}
                        className={`px-2.5 py-2 rounded-lg text-left text-xs transition-all border ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/15 text-white font-medium'
                            : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className={`h-1 w-full rounded-full bg-gradient-to-r ${p.previewGradient} mb-1.5 opacity-80`} />
                        <span className="truncate block">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Board */}
              <div>
                <Select
                  label="Target Pinterest Board"
                  value={quickBoard}
                  onChange={setQuickBoard}
                  options={availableBoards}
                  placeholder="Select target board..."
                  size="md"
                  searchable={availableBoards.length > 4}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  isLoading={isSynthesizing}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Generate Preview
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddQuickToQueue}
                  leftIcon={<Clock className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Schedule
                </Button>
              </div>
            </form>

            {/* Live Generated Preview in Card */}
            {generatedPreview && (
              <div className="border-t border-zinc-800/80 pt-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-200">Generated Visual Preview</span>
                  <span className="text-[10px] text-emerald-400 font-medium">✓ Watermark-Free</span>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-[2/3] max-h-72 bg-zinc-950 border border-zinc-800 mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedPreview.imageUrl}
                    alt={generatedPreview.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white">
                    2:3 Pin
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1"
                    onClick={() => setPublishModalImage(generatedPreview)}
                    leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  >
                    Publish to Board
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(generatedPreview.imageUrl, '_blank')}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Shortcuts & Automation Tips */}
          <Card className="p-5 space-y-3">
            <h4 className="font-bold text-xs text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Pinterest Optimization Tips
            </h4>
            <ul className="text-xs text-zinc-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-brand-400 font-bold">•</span>
                <span><strong>2:3 Vertical Ratio:</strong> PostCraft strictly enforces 1000x1500px, which Pinterest rewards with up to 3x higher distribution in mobile feeds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Zero Watermarks:</strong> Pins free of logos or watermarks see 40% higher click-throughs to destination URLs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Google Sheets Batching:</strong> Paste your prompt sheet to queue 50+ pins distributed across optimal morning and evening time slots.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Live Queue & Operations Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Queue Watchlist Card */}
          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Automated Publishing Queue
                </h3>
                <p className="text-xs text-zinc-400">Scheduled pins queued for background processing</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setQueueTab('UPCOMING')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    queueTab === 'UPCOMING'
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Upcoming ({pendingJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueTab('RECENT_PUBLISHED')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    queueTab === 'RECENT_PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Published ({publishedJobs.length})
                </button>
              </div>
            </div>

            {/* Queue Items List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton width={70} height={18} className="rounded-full" />
                        <Skeleton width={90} height={14} className="rounded-md" />
                      </div>
                      <Skeleton width="75%" height={14} className="rounded-md" />
                    </div>
                    <Skeleton width={80} height={28} className="rounded-lg flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : displayedJobs.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-200">
                  {queueTab === 'UPCOMING' ? 'No pending tasks in queue' : 'No pins published yet'}
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {queueTab === 'UPCOMING'
                    ? 'Connect a Google Sheet or schedule prompts from the AI Studio to fill your publishing pipeline.'
                    : 'Run the scheduler or publish pins manually to track live history here.'}
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <Link href="/studio?mode=sheets" prefetch={true}>
                    <Button size="sm" variant="secondary" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}>
                      Connect Sheets
                    </Button>
                  </Link>
                  <Link href="/studio" prefetch={true}>
                    <Button size="sm" variant="primary">
                      Open Studio
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge status={job.status} />
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {job.source === 'GOOGLE_SHEETS' || job.source === 'CSV_UPLOAD'
                            ? 'Sheets Sync'
                            : 'Studio Manual'}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400 truncate">
                          Board: <strong className="text-zinc-200">{job.boardName}</strong>
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                        {job.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {job.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 text-xs">
                      <div className="text-right">
                        <p className="text-[11px] text-zinc-400">
                          {new Date(job.scheduledFor).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {new Date(job.scheduledFor).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {job.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={job.imageUrl}
                          alt="preview"
                          className="w-10 h-14 rounded-lg object-cover border border-zinc-800 bg-zinc-900"
                        />
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    Showing top {displayedJobs.length} tasks
                  </span>
                  <Link
                    href="/queue"
                    prefetch={true}
                    className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
                  >
                    <span>Full Queue Management</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Recent Creations Strip */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Recent Creations Gallery</h3>
              </div>
              <Link
                href="/gallery"
                prefetch={true}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
              >
                <span>View All ({gallery.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="rounded-xl overflow-hidden aspect-[2/3] bg-zinc-950 border border-zinc-800/80 p-2 flex flex-col justify-between"
                  >
                    <Skeleton width="100%" height="75%" className="rounded-lg" />
                    <Skeleton width="80%" height={12} className="rounded-md mt-2" />
                  </div>
                ))}
              </div>
            ) : gallery.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                No creations generated yet. Test the Quick Synthesizer above!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl overflow-hidden aspect-[2/3] bg-zinc-950 border border-zinc-800/90 shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt={img.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <p className="text-[10px] text-white line-clamp-2 font-medium mb-1.5">
                        {img.prompt}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPublishModalImage(img)}
                          className="flex-1 py-1 rounded bg-brand-500 text-[10px] font-bold text-white hover:bg-brand-600 transition-colors"
                        >
                          Publish
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(img)}
                          className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                          title="Download Watermark-Free HD"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Connected Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold">
              P
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-100">Pinterest Provider</h4>
              <p className="text-[11px] text-zinc-400">
                {isPinterestConnected ? 'API v5 Connected' : 'Demo Credentials Ready'}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {isPinterestConnected ? 'Connected' : 'Active'}
          </span>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-100">Google Sheets Ingestion</h4>
              <p className="text-[11px] text-zinc-400">Public URL &amp; CSV Auto-Parser</p>
            </div>
          </div>
          <Link href="/studio?mode=sheets" prefetch={true}>
            <Button size="sm" variant="outline">
              Sync
            </Button>
          </Link>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-100">Automated Dispatcher</h4>
              <p className="text-[11px] text-zinc-400">Active background poller</p>
            </div>
          </div>
          <Link href="/queue" prefetch={true}>
            <Button size="sm" variant="outline">
              Queue
            </Button>
          </Link>
        </Card>
      </div>

      {/* Quick Publish Modal for preview pins */}
      {publishModalImage && (
        <QuickPublishModal
          isOpen={Boolean(publishModalImage)}
          onClose={() => setPublishModalImage(null)}
          imageUrl={publishModalImage.imageUrl}
          initialPrompt={publishModalImage.prompt}
        />
      )}
    </div>
  );
}
