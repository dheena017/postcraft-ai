'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ParsedSheetRow } from '@/types/job';
import { smartExpandPrompt } from '@/lib/ai/prompt-enhancer';
import { removeWatermark, preloadImage } from '@/lib/ai/clean-image';
import {
  Calendar,
  Hash,
  ExternalLink,
  Search,
  Trash2,
  X,
  CheckCircle2,
  Wand2,
  Edit2,
  Download,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  Sparkles,
  Clock,
  Layers,
  FolderPlus,
  Eye,
  Tag,
  AlertCircle,
  Link as LinkIcon,
  Filter,
  Plus,
  Copy,
  RefreshCw,
  Image as ImageIcon,
  Shuffle,
  ShieldCheck,
  TrendingUp,
  Sliders,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Globe,
} from 'lucide-react';

interface SheetDataPreviewTableProps {
  rows: ParsedSheetRow[];
  onDeleteRow?: (rowIndex: number) => void;
  onDeleteRows?: (rowIndices: number[]) => void;
  onUpdateRow?: (rowIndex: number, updated: Partial<ParsedSheetRow>) => void;
  onAddRow?: (newRow: Omit<ParsedSheetRow, 'rowIndex'>) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  onMoveRow?: (rowIndex: number, direction: 'up' | 'down') => void;
  onClearAll?: () => void;
  defaultBoard?: string;
}

type SortField = 'rowIndex' | 'prompt' | 'title' | 'board' | 'scheduleTime' | 'seo';
type SortDirection = 'asc' | 'desc';
type ValidationFilter = 'all' | 'needs_attention' | 'missing_link' | 'missing_title' | 'high_seo';

// Helper: Calculate Pinterest SEO score (0 - 100)
function calculatePinSeoScore(row: ParsedSheetRow): { score: number; label: string; color: string } {
  let score = 20; // baseline

  // Title checks
  const title = (row.title || '').trim();
  if (title.length > 0) score += 20;
  if (title.length >= 25 && title.length <= 80) score += 15; // Optimal title length

  // Prompt/Description checks
  const prompt = (row.prompt || '').trim();
  if (prompt.length >= 50) score += 20;
  if (prompt.includes('#') || prompt.length >= 100) score += 10;

  // Destination link check
  if (row.link && row.link.trim().startsWith('http')) score += 15;

  let label = 'Low SEO';
  let color = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  if (score >= 80) {
    label = 'Excellent SEO';
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (score >= 55) {
    label = 'Good SEO';
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return { score, label, color };
}

// Helper: Generate niche-targeted Pinterest trending hashtags
function generateTrendingHashtags(text: string): string {
  const lower = text.toLowerCase();
  const tags = new Set<string>();

  if (lower.includes('room') || lower.includes('decor') || lower.includes('sofa') || lower.includes('interior') || lower.includes('living')) {
    ['#HomeDecor', '#InteriorDesign', '#AestheticHome', '#CozyLiving', '#RoomInspo'].forEach((t) => tags.add(t));
  } else if (lower.includes('recipe') || lower.includes('food') || lower.includes('cake') || lower.includes('dinner') || lower.includes('healthy')) {
    ['#EasyRecipes', '#FoodieInspo', '#HealthyEating', '#DeliciousFood', '#QuickMeals'].forEach((t) => tags.add(t));
  } else if (lower.includes('fashion') || lower.includes('outfit') || lower.includes('style') || lower.includes('dress') || lower.includes('shoes')) {
    ['#OutfitInspo', '#AestheticFashion', '#StyleGuide', '#StreetwearVibes', '#Lookbook'].forEach((t) => tags.add(t));
  } else if (lower.includes('travel') || lower.includes('beach') || lower.includes('mountain') || lower.includes('hotel') || lower.includes('city')) {
    ['#TravelInspo', '#WanderlustVibes', '#BucketListPlaces', '#AestheticTravel'].forEach((t) => tags.add(t));
  } else if (lower.includes('radar') || lower.includes('tactical') || lower.includes('cyber') || lower.includes('tech') || lower.includes('future')) {
    ['#CyberpunkAesthetics', '#TechDesign', '#SciFiVisuals', '#FuturisticUI'].forEach((t) => tags.add(t));
  } else {
    ['#PinterestInspo', '#AestheticVibes', '#TrendingIdeas', '#DailyInspo'].forEach((t) => tags.add(t));
  }

  return Array.from(tags).join(' ');
}

// Helper: Generate a catchy Pinterest Title from prompt if missing
function generateTitleFromPrompt(prompt: string): string {
  const clean = prompt.replace(/[^\w\s]/gi, ' ').trim();
  const words = clean.split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return 'Aesthetic Inspiration';
  const topWords = words.slice(0, 5).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return `${topWords.join(' ')} Inspiration`;
}

export const SheetDataPreviewTable: React.FC<SheetDataPreviewTableProps> = ({
  rows,
  onDeleteRow,
  onDeleteRows,
  onUpdateRow,
  onAddRow,
  onDuplicateRow,
  onMoveRow,
  onClearAll,
  defaultBoard = 'General Ideas',
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<string>('ALL');
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>('all');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('rowIndex');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Multi-Selection State
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Edit Modal State
  const [editingRow, setEditingRow] = useState<ParsedSheetRow | null>(null);
  const [editFormData, setEditFormData] = useState<{
    prompt: string;
    title: string;
    board: string;
    scheduleTime: string;
    link: string;
  }>({
    prompt: '',
    title: '',
    board: '',
    scheduleTime: '',
    link: '',
  });

  // Add Pin Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<{
    prompt: string;
    title: string;
    board: string;
    scheduleTime: string;
    link: string;
  }>({
    prompt: '',
    title: '',
    board: defaultBoard,
    scheduleTime: '',
    link: '',
  });

  // Preview Modal State
  const [previewingRow, setPreviewingRow] = useState<ParsedSheetRow | null>(null);
  const [previewSampleImage, setPreviewSampleImage] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  // Bulk Edit Board Modal State
  const [isBulkBoardModalOpen, setIsBulkBoardModalOpen] = useState(false);
  const [bulkBoardName, setBulkBoardName] = useState('');

  // UTM Parameters Modal State
  const [isUtmModalOpen, setIsUtmModalOpen] = useState(false);
  const [utmSource, setUtmSource] = useState('pinterest');
  const [utmMedium, setUtmMedium] = useState('social');
  const [utmCampaign, setUtmCampaign] = useState('batch_campaign');

  // Toast / feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Extract all unique boards
  const uniqueBoards = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const b = r.board && r.board.trim() && r.board !== 'General Ideas' ? r.board : defaultBoard;
      if (b) set.add(b);
    });
    return Array.from(set);
  }, [rows, defaultBoard]);

  // Validation breakdown counts
  const validationCounts = useMemo(() => {
    let missingLink = 0;
    let missingTitle = 0;
    let needsAttention = 0;
    let highSeo = 0;

    rows.forEach((r) => {
      const seo = calculatePinSeoScore(r);
      const isMissingLink = !r.link || !r.link.trim().startsWith('http');
      const isMissingTitle = !r.title || r.title.trim().length === 0;

      if (isMissingLink) missingLink++;
      if (isMissingTitle) missingTitle++;
      if (isMissingLink || isMissingTitle || seo.score < 60) needsAttention++;
      if (seo.score >= 80) highSeo++;
    });

    return { missingLink, missingTitle, needsAttention, highSeo };
  }, [rows]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (rows.length === 0) return null;
    const sortedDates = [...rows]
      .map((r) => new Date(r.scheduleTime).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b);

    const firstDate = sortedDates[0] ? new Date(sortedDates[0]) : null;
    const lastDate = sortedDates[sortedDates.length - 1] ? new Date(sortedDates[sortedDates.length - 1]) : null;

    let avgIntervalMinutes = 0;
    if (sortedDates.length > 1) {
      const totalSpan = sortedDates[sortedDates.length - 1] - sortedDates[0];
      avgIntervalMinutes = Math.round(totalSpan / (sortedDates.length - 1) / (1000 * 60));
    }

    const avgSeoScore = Math.round(
      rows.reduce((acc, r) => acc + calculatePinSeoScore(r).score, 0) / rows.length
    );

    return {
      total: rows.length,
      boardCount: uniqueBoards.length,
      firstDate,
      lastDate,
      avgIntervalMinutes,
      avgSeoScore,
    };
  }, [rows, uniqueBoards]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Rows
  const processedRows = useMemo(() => {
    const result = rows.filter((r) => {
      const effectiveBoard = r.board && r.board.trim() && r.board !== 'General Ideas' ? r.board : defaultBoard;
      const seo = calculatePinSeoScore(r);

      // Validation Filter
      if (validationFilter === 'needs_attention') {
        const isProblem = !r.link || !r.title || seo.score < 60;
        if (!isProblem) return false;
      } else if (validationFilter === 'missing_link') {
        if (r.link && r.link.trim().startsWith('http')) return false;
      } else if (validationFilter === 'missing_title') {
        if (r.title && r.title.trim().length > 0) return false;
      } else if (validationFilter === 'high_seo') {
        if (seo.score < 80) return false;
      }

      // Board filter
      if (selectedBoardFilter !== 'ALL' && effectiveBoard !== selectedBoardFilter) {
        return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        r.prompt.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        effectiveBoard.toLowerCase().includes(q) ||
        (r.link && r.link.toLowerCase().includes(q))
      );
    });

    // Sort
    result.sort((a, b) => {
      const effectiveBoardA = a.board && a.board.trim() && a.board !== 'General Ideas' ? a.board : defaultBoard;
      const effectiveBoardB = b.board && b.board.trim() && b.board !== 'General Ideas' ? b.board : defaultBoard;

      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'rowIndex':
          valA = a.rowIndex;
          valB = b.rowIndex;
          break;
        case 'prompt':
          valA = a.prompt.toLowerCase();
          valB = b.prompt.toLowerCase();
          break;
        case 'title':
          valA = (a.title || '').toLowerCase();
          valB = (b.title || '').toLowerCase();
          break;
        case 'board':
          valA = effectiveBoardA.toLowerCase();
          valB = effectiveBoardB.toLowerCase();
          break;
        case 'scheduleTime':
          valA = new Date(a.scheduleTime).getTime();
          valB = new Date(b.scheduleTime).getTime();
          break;
        case 'seo':
          valA = calculatePinSeoScore(a).score;
          valB = calculatePinSeoScore(b).score;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [rows, searchTerm, selectedBoardFilter, validationFilter, sortField, sortDirection, defaultBoard]);

  // Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIndices.size === processedRows.length && processedRows.length > 0) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(processedRows.map((r) => r.rowIndex)));
    }
  };

  const handleToggleSelectRow = (rowIndex: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (selectedIndices.size === 0) return;
    if (confirm(`Remove ${selectedIndices.size} selected pin(s) from campaign queue?`)) {
      if (onDeleteRows) {
        onDeleteRows(Array.from(selectedIndices));
      } else if (onDeleteRow) {
        selectedIndices.forEach((idx) => onDeleteRow(idx));
      }
      setSelectedIndices(new Set());
      showFeedback(`Deleted ${selectedIndices.size} pins`);
    }
  };

  const handleBulkApplyBoard = () => {
    if (!bulkBoardName.trim() || selectedIndices.size === 0 || !onUpdateRow) return;
    selectedIndices.forEach((idx) => {
      onUpdateRow(idx, { board: bulkBoardName.trim() });
    });
    setIsBulkBoardModalOpen(false);
    setBulkBoardName('');
    showFeedback(`Updated board for ${selectedIndices.size} pins to "${bulkBoardName.trim()}"`);
  };

  const handleBulkShiftSchedule = (hours: number) => {
    if (selectedIndices.size === 0 || !onUpdateRow) return;
    selectedIndices.forEach((idx) => {
      const row = rows.find((r) => r.rowIndex === idx);
      if (row) {
        const current = new Date(row.scheduleTime).getTime();
        const shifted = new Date(current + hours * 60 * 60 * 1000).toISOString();
        onUpdateRow(idx, { scheduleTime: shifted });
      }
    });
    showFeedback(`Shifted schedule for ${selectedIndices.size} pin(s) by ${hours > 0 ? `+${hours}` : hours}h`);
  };

  // Anti-Spam Schedule Humanizer (+/- 7-15 min jitter to prevent algorithmic rate-limiting)
  const handleHumanizeSchedule = () => {
    if (!onUpdateRow || rows.length === 0) return;
    const targetRows = selectedIndices.size > 0 ? rows.filter((r) => selectedIndices.has(r.rowIndex)) : rows;
    targetRows.forEach((r) => {
      const jitterMinutes = Math.floor(Math.random() * 21) - 10; // -10 to +10 minutes
      const current = new Date(r.scheduleTime).getTime();
      const randomized = new Date(current + jitterMinutes * 60 * 1000).toISOString();
      onUpdateRow(r.rowIndex, { scheduleTime: randomized });
    });
    showFeedback(`Humanized schedule with natural anti-spam jitter across ${targetRows.length} pin(s)`);
  };

  // Bulk Append Trending Hashtags
  const handleBulkAppendHashtags = () => {
    if (!onUpdateRow || rows.length === 0) return;
    const targetRows = selectedIndices.size > 0 ? rows.filter((r) => selectedIndices.has(r.rowIndex)) : rows;
    let count = 0;
    targetRows.forEach((r) => {
      const hashtags = generateTrendingHashtags(r.prompt + ' ' + (r.title || ''));
      if (!r.prompt.includes('#')) {
        onUpdateRow(r.rowIndex, { prompt: `${r.prompt.trim()}\n\n${hashtags}` });
        count++;
      }
    });
    showFeedback(`Appended trending hashtags to ${count} pin(s)`);
  };

  // Bulk Auto-Generate Missing Titles
  const handleBulkGenerateTitles = () => {
    if (!onUpdateRow || rows.length === 0) return;
    const targetRows = selectedIndices.size > 0 ? rows.filter((r) => selectedIndices.has(r.rowIndex)) : rows;
    let count = 0;
    targetRows.forEach((r) => {
      if (!r.title || r.title.trim().length === 0) {
        const generated = generateTitleFromPrompt(r.prompt);
        onUpdateRow(r.rowIndex, { title: generated });
        count++;
      }
    });
    showFeedback(`Auto-generated catchy titles for ${count} pin(s)`);
  };

  // Apply UTM Parameters to Destination Links
  const handleApplyUtmParams = () => {
    if (!onUpdateRow) return;
    const targetRows = selectedIndices.size > 0 ? rows.filter((r) => selectedIndices.has(r.rowIndex)) : rows;
    let count = 0;
    targetRows.forEach((r) => {
      if (r.link && r.link.trim().startsWith('http')) {
        try {
          const url = new URL(r.link.trim());
          url.searchParams.set('utm_source', utmSource.trim() || 'pinterest');
          url.searchParams.set('utm_medium', utmMedium.trim() || 'social');
          url.searchParams.set('utm_campaign', utmCampaign.trim() || 'batch_campaign');
          onUpdateRow(r.rowIndex, { link: url.toString() });
          count++;
        } catch {}
      }
    });
    setIsUtmModalOpen(false);
    showFeedback(`Appended UTM tracking parameters to ${count} link(s)`);
  };

  const handleBulkEnhancePrompts = () => {
    if (selectedIndices.size === 0 || !onUpdateRow) return;
    let count = 0;
    selectedIndices.forEach((idx) => {
      const row = rows.find((r) => r.rowIndex === idx);
      if (row && row.prompt) {
        const enriched = smartExpandPrompt(row.prompt);
        onUpdateRow(idx, { prompt: enriched });
        count++;
      }
    });
    showFeedback(`AI enhanced ${count} pin prompts with aesthetic Pinterest keywords`);
  };

  // Duplicate Row
  const handleDuplicate = (rowIndex: number) => {
    if (onDuplicateRow) {
      onDuplicateRow(rowIndex);
      showFeedback(`Duplicated pin #${rowIndex}`);
    } else {
      const target = rows.find((r) => r.rowIndex === rowIndex);
      if (!target || !onAddRow) return;
      const scheduled = new Date(new Date(target.scheduleTime).getTime() + 60 * 60 * 1000).toISOString();
      onAddRow({
        prompt: target.prompt,
        title: target.title ? `${target.title} (Copy)` : 'New Pin (Copy)',
        description: target.description || '',
        board: target.board || defaultBoard,
        scheduleTime: scheduled,
        link: target.link,
        raw: target.raw || {},
      });
      showFeedback(`Duplicated pin #${rowIndex} to queue`);
    }
  };

  // CSV Export
  const handleExportCsv = (rowsToExport: ParsedSheetRow[]) => {
    if (rowsToExport.length === 0) return;
    const header = ['rowIndex', 'prompt', 'title', 'board', 'scheduleTime', 'link'];
    const csvContent = [
      header.join(','),
      ...rowsToExport.map((r) => {
        const effectiveBoard = r.board && r.board.trim() && r.board !== 'General Ideas' ? r.board : defaultBoard;
        return [
          r.rowIndex,
          `"${(r.prompt || '').replace(/"/g, '""')}"`,
          `"${(r.title || '').replace(/"/g, '""')}"`,
          `"${(effectiveBoard || '').replace(/"/g, '""')}"`,
          `"${r.scheduleTime || ''}"`,
          `"${(r.link || '').replace(/"/g, '""')}"`,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campaign_pins_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback(`Exported ${rowsToExport.length} pins to CSV`);
  };

  // Single Row AI Prompt Enhance
  const handleSingleEnhancePrompt = (rowIndex: number, currentPrompt: string) => {
    if (!onUpdateRow) return;
    const enhanced = smartExpandPrompt(currentPrompt);
    onUpdateRow(rowIndex, { prompt: enhanced });
    showFeedback(`Prompt #${rowIndex} enriched with AI aesthetic keywords`);
  };

  // Edit Modal Open & Save
  const handleOpenEdit = (row: ParsedSheetRow) => {
    const effectiveBoard = rBoard(row);
    setEditingRow(row);
    let dtValue = '';
    try {
      const d = new Date(row.scheduleTime);
      if (!isNaN(d.getTime())) {
        const offset = d.getTimezoneOffset() * 60000;
        dtValue = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      }
    } catch {}

    setEditFormData({
      prompt: row.prompt,
      title: row.title || '',
      board: effectiveBoard,
      scheduleTime: dtValue,
      link: row.link || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingRow || !onUpdateRow) return;
    let isoScheduleTime = editingRow.scheduleTime;
    if (editFormData.scheduleTime) {
      try {
        isoScheduleTime = new Date(editFormData.scheduleTime).toISOString();
      } catch {}
    }

    onUpdateRow(editingRow.rowIndex, {
      prompt: editFormData.prompt.trim(),
      title: editFormData.title.trim(),
      board: editFormData.board.trim(),
      scheduleTime: isoScheduleTime,
      link: editFormData.link.trim() || undefined,
    });

    setEditingRow(null);
    showFeedback(`Pin #${editingRow.rowIndex} updated successfully`);
  };

  // Add New Pin Handlers
  const handleOpenAddModal = () => {
    const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
    const offset = defaultTime.getTimezoneOffset() * 60000;
    const dtValue = new Date(defaultTime.getTime() - offset).toISOString().slice(0, 16);

    setAddFormData({
      prompt: '',
      title: '',
      board: defaultBoard,
      scheduleTime: dtValue,
      link: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewPin = () => {
    if (!addFormData.prompt.trim() || !onAddRow) return;
    let isoSchedule = new Date().toISOString();
    if (addFormData.scheduleTime) {
      try {
        isoSchedule = new Date(addFormData.scheduleTime).toISOString();
      } catch {}
    }

    onAddRow({
      prompt: addFormData.prompt.trim(),
      title: addFormData.title.trim() || 'New Campaign Pin',
      description: addFormData.prompt.trim(),
      board: addFormData.board.trim() || defaultBoard,
      scheduleTime: isoSchedule,
      link: addFormData.link.trim() || undefined,
      raw: {},
    });

    setIsAddModalOpen(false);
    showFeedback('Added new pin to campaign queue!');
  };

  // Helper for effective board
  const rBoard = (r: ParsedSheetRow) =>
    r.board && r.board.trim() && r.board !== 'General Ideas' ? r.board : defaultBoard;

  // Test Generate Sample Image in Preview Modal
  const handleTestGenerateSample = async (promptToGenerate: string) => {
    if (!promptToGenerate) return;
    setIsGeneratingSample(true);
    setPreviewSampleImage(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToGenerate,
          aspectRatio: '2:3',
          stylePreset: 'aesthetic-minimal',
          lightingPreset: 'auto',
          enhancePrompt: true,
          model: 'flux',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate preview');

      const cleanUrl = await removeWatermark(data.imageUrl, data.width, data.height);
      await preloadImage(cleanUrl, data.imageUrl);
      setPreviewSampleImage(cleanUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Preview generation failed';
      alert(msg);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  return (
    <Card className="space-y-3.5 p-4 bg-zinc-950/90 border-zinc-800 shadow-xl">
      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <div className="space-y-3 pb-3 border-b border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2 tracking-tight">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Campaign Queue Preview</span>
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{rows.length} Total Pins</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Review, edit, duplicate, enhance, audit SEO, and organize campaign pins before batch queue dispatch.
            </p>
          </div>

          {/* Quick Header Actions: Add Pin, Clear All, Export CSV */}
          <div className="flex items-center gap-2 flex-wrap">
            {onAddRow && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleOpenAddModal}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Add Pin
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportCsv(processedRows)}
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
              className="text-xs border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850"
            >
              Export CSV
            </Button>

            {onClearAll && rows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all campaign pins?')) {
                    onClearAll();
                    showFeedback('Cleared all pins');
                  }
                }}
                className="text-[11px] font-medium text-zinc-500 hover:text-red-400 px-2 py-1.5 rounded-lg border border-transparent hover:border-red-500/30 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Clear all campaign rows"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Metric Summary Ribbon with SEO Score */}
        {summaryStats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Scope</span>
                <span className="text-zinc-200 font-semibold truncate block">{summaryStats.total} Pins Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
              <FolderPlus className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Boards</span>
                <span className="text-zinc-200 font-semibold truncate block">{summaryStats.boardCount} Destination(s)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
              <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Cadence</span>
                <span className="text-zinc-200 font-semibold truncate block">
                  {summaryStats.avgIntervalMinutes > 0 ? `Every ~${summaryStats.avgIntervalMinutes}m` : 'Simultaneous'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Avg SEO Score</span>
                <span className="text-cyan-300 font-semibold truncate block">{summaryStats.avgSeoScore}/100</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/70 col-span-2 sm:col-span-1">
              <Calendar className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Window</span>
                <span className="text-zinc-200 font-semibold truncate block">
                  {summaryStats.firstDate
                    ? summaryStats.firstDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : '-'}
                  {summaryStats.lastDate && summaryStats.firstDate && summaryStats.lastDate.getDate() !== summaryStats.firstDate.getDate()
                    ? ` - ${summaryStats.lastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                    : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{feedbackMessage}</span>
          </div>
        )}

        {/* 2. ADVANCED TOOLBAR: VALIDATION FILTERS & SEARCH */}
        <div className="space-y-2 pt-1">
          {/* Quick Quality & Validation Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              type="button"
              onClick={() => setValidationFilter('all')}
              className={`px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                validationFilter === 'all'
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 font-bold'
                  : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              All Pins ({rows.length})
            </button>

            <button
              type="button"
              onClick={() => setValidationFilter('needs_attention')}
              className={`px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                validationFilter === 'needs_attention'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Needs Attention ({validationCounts.needsAttention})</span>
            </button>

            <button
              type="button"
              onClick={() => setValidationFilter('missing_title')}
              className={`px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                validationFilter === 'missing_title'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                  : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Missing Title ({validationCounts.missingTitle})
            </button>

            <button
              type="button"
              onClick={() => setValidationFilter('missing_link')}
              className={`px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                validationFilter === 'missing_link'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                  : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Missing Link ({validationCounts.missingLink})
            </button>

            <button
              type="button"
              onClick={() => setValidationFilter('high_seo')}
              className={`px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                validationFilter === 'high_seo'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                  : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>High SEO 80+ ({validationCounts.highSeo})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompts, pin titles, boards, links..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-brand-500 focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Automation Tools Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Anti-Spam Humanize Jitter */}
              <button
                type="button"
                onClick={handleHumanizeSchedule}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors text-[11px] font-medium cursor-pointer"
                title="Randomize post times by +/- 10 mins to simulate human organic pinning and prevent spam flags"
              >
                <Shuffle className="w-3 h-3 text-amber-400" />
                <span>Anti-Spam Jitter</span>
              </button>

              {/* UTM Builder */}
              <button
                type="button"
                onClick={() => setIsUtmModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors text-[11px] font-medium cursor-pointer"
                title="Append Google Analytics UTM tags to all destination links"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>UTM Builder</span>
              </button>

              {/* Board Filter Dropdown */}
              <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                <Filter className="w-3 h-3 text-zinc-500" />
                <select
                  value={selectedBoardFilter}
                  onChange={(e) => setSelectedBoardFilter(e.target.value)}
                  className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer py-1"
                >
                  <option value="ALL">All Boards ({rows.length})</option>
                  {uniqueBoards.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MULTI-ROW BATCH ACTIONS TOOLBAR (Appears when >= 1 row selected) */}
        {selectedIndices.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-300 px-2 py-0.5 rounded-md bg-brand-500/20 border border-brand-500/30">
                {selectedIndices.size} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedIndices(new Set())}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
              >
                Deselect
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Bulk AI Enhance */}
              <button
                type="button"
                onClick={handleBulkEnhancePrompts}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700/80 transition-colors text-[11px] font-medium cursor-pointer"
                title="Enrich selected prompts with AI aesthetic keywords"
              >
                <Wand2 className="w-3 h-3 text-amber-400" />
                <span>AI Polish</span>
              </button>

              {/* Bulk Auto-Hashtags */}
              <button
                type="button"
                onClick={handleBulkAppendHashtags}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-zinc-700/80 transition-colors text-[11px] font-medium cursor-pointer"
                title="Append viral Pinterest hashtags to selected pins"
              >
                <Flame className="w-3 h-3 text-emerald-400" />
                <span>+ Hashtags</span>
              </button>

              {/* Bulk Generate Titles */}
              <button
                type="button"
                onClick={handleBulkGenerateTitles}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-zinc-700/80 transition-colors text-[11px] font-medium cursor-pointer"
                title="Auto-generate titles from prompts for missing items"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Auto-Titles</span>
              </button>

              {/* Bulk Change Board */}
              <button
                type="button"
                onClick={() => setIsBulkBoardModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition-colors text-[11px] font-medium cursor-pointer"
                title="Change board for all selected pins"
              >
                <Tag className="w-3 h-3 text-brand-400" />
                <span>Change Board</span>
              </button>

              {/* Quick Shift Schedule +1h */}
              <button
                type="button"
                onClick={() => handleBulkShiftSchedule(1)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition-colors text-[11px] font-medium cursor-pointer"
                title="Push scheduled time forward by +1 hour"
              >
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>+1h</span>
              </button>

              {/* Export Selected */}
              <button
                type="button"
                onClick={() =>
                  handleExportCsv(rows.filter((r) => selectedIndices.has(r.rowIndex)))
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition-colors text-[11px] font-medium cursor-pointer"
                title="Export selected pins to CSV"
              >
                <Download className="w-3 h-3 text-zinc-400" />
                <span>Export</span>
              </button>

              {/* Delete Selected */}
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-colors text-[11px] font-semibold cursor-pointer"
                title="Remove selected pins from queue"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Delete ({selectedIndices.size})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. MAIN DATA TABLE */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin rounded-xl border border-zinc-800/80 bg-zinc-950">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-md text-zinc-400 border-b border-zinc-800 z-10 font-semibold select-none">
            <tr>
              {/* Select All Checkbox */}
              <th className="py-2.5 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={selectedIndices.size === processedRows.length ? 'Deselect All' : 'Select All'}
                >
                  {selectedIndices.size > 0 && selectedIndices.size === processedRows.length ? (
                    <CheckSquare className="w-4 h-4 text-brand-400" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                </button>
              </th>

              {/* # (Row Number) */}
              <th
                onClick={() => handleSort('rowIndex')}
                className="py-2.5 px-2 w-12 text-zinc-500 hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>#</span>
                  {sortField === 'rowIndex' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-400" /> : <ChevronDown className="w-3 h-3 text-brand-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-60" />
                  )}
                </div>
              </th>

              {/* Image Prompt */}
              <th
                onClick={() => handleSort('prompt')}
                className="py-2.5 px-3 min-w-[260px] hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Image Prompt</span>
                  {sortField === 'prompt' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-400" /> : <ChevronDown className="w-3 h-3 text-brand-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-60" />
                  )}
                </div>
              </th>

              {/* Pin Title */}
              <th
                onClick={() => handleSort('title')}
                className="py-2.5 px-3 min-w-[160px] hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pin Title</span>
                  {sortField === 'title' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-400" /> : <ChevronDown className="w-3 h-3 text-brand-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-60" />
                  )}
                </div>
              </th>

              {/* Target Board */}
              <th
                onClick={() => handleSort('board')}
                className="py-2.5 px-3 min-w-[130px] hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Target Board</span>
                  {sortField === 'board' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-400" /> : <ChevronDown className="w-3 h-3 text-brand-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-60" />
                  )}
                </div>
              </th>

              {/* SEO Score */}
              <th
                onClick={() => handleSort('seo')}
                className="py-2.5 px-2 w-20 text-center hover:text-zinc-200 cursor-pointer transition-colors"
                title="Pinterest Pin SEO Quality Score"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>SEO</span>
                  {sortField === 'seo' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-400" /> : <ChevronDown className="w-3 h-3 text-brand-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-60" />
                  )}
                </div>
              </th>

              {/* Scheduled Time */}
              <th
                onClick={() => handleSort('scheduleTime')}
                className="py-2.5 px-3 min-w-[150px] hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Scheduled Time</span>
                  {sortField === 'scheduleTime' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-400" /> : <ChevronDown className="w-3 h-3 text-brand-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-60" />
                  )}
                </div>
              </th>

              {/* URL */}
              <th className="py-2.5 px-3 w-16 text-center">URL</th>

              {/* Actions */}
              <th className="py-2.5 px-3 w-36 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {processedRows.map((row) => {
              const effectiveBoard = rBoard(row);
              const isSelected = selectedIndices.has(row.rowIndex);
              const seo = calculatePinSeoScore(row);

              return (
                <tr
                  key={row.rowIndex}
                  className={`transition-colors group ${
                    isSelected ? 'bg-brand-500/10 hover:bg-brand-500/15' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectRow(row.rowIndex)}
                      className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500" />
                      )}
                    </button>
                  </td>

                  {/* # Index with Move Up/Down Controls */}
                  <td className="py-2.5 px-2 text-zinc-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{row.rowIndex}</span>
                      {onMoveRow && (
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onMoveRow(row.rowIndex, 'up')}
                            className="text-zinc-500 hover:text-white cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveRow(row.rowIndex, 'down')}
                            className="text-zinc-500 hover:text-white cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Image Prompt */}
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-100 line-clamp-2 leading-relaxed">
                        {row.prompt}
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleSingleEnhancePrompt(row.rowIndex, row.prompt)}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-300/90 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 transition-colors cursor-pointer"
                          title="Auto-enhance prompt with AI aesthetic keywords"
                        >
                          <Wand2 className="w-2.5 h-2.5 text-amber-400" />
                          <span>AI Polish</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const tags = generateTrendingHashtags(row.prompt);
                            if (onUpdateRow && !row.prompt.includes('#')) {
                              onUpdateRow(row.rowIndex, { prompt: `${row.prompt.trim()}\n\n${tags}` });
                              showFeedback(`Appended trending hashtags to pin #${row.rowIndex}`);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-300/90 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 transition-colors cursor-pointer"
                          title="Add trending hashtags"
                        >
                          <Flame className="w-2.5 h-2.5 text-emerald-400" />
                          <span>+Tags</span>
                        </button>

                        <span className="text-[10px] text-zinc-500 font-mono">
                          {row.prompt.length} chars
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Pin Title */}
                  <td className="py-2.5 px-3 text-zinc-300">
                    {row.title && row.title.trim() ? (
                      <p className="line-clamp-2 font-medium text-zinc-200 leading-snug">
                        {row.title}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-600 italic">No Title</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateRow) {
                              const gen = generateTitleFromPrompt(row.prompt);
                              onUpdateRow(row.rowIndex, { title: gen });
                              showFeedback(`Generated title for pin #${row.rowIndex}`);
                            }
                          }}
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          title="Generate title from prompt"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Generate</span>
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Target Board */}
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900/90 text-[11px] font-medium text-zinc-300 border border-zinc-800 shadow-xs">
                      <Tag className="w-2.5 h-2.5 text-zinc-500" />
                      <span className="truncate max-w-[120px]">{effectiveBoard}</span>
                    </span>
                  </td>

                  {/* SEO Score Badge */}
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${seo.color}`}
                      title={`${seo.label} (${seo.score}/100)`}
                    >
                      {seo.score}
                    </span>
                  </td>

                  {/* Scheduled Time */}
                  <td className="py-2.5 px-3 text-zinc-400">
                    <div className="space-y-0.5 font-mono text-[11px]">
                      <span className="flex items-center gap-1.5 whitespace-nowrap text-zinc-300 font-semibold">
                        <Calendar className="w-3 h-3 text-brand-400" />
                        {new Date(row.scheduleTime).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Destination Link */}
                  <td className="py-2.5 px-3 text-center">
                    {row.link ? (
                      <a
                        href={row.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 border border-brand-500/20 transition-colors"
                        title={row.link}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-zinc-600 font-mono">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview Pin */}
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewingRow(row);
                          setPreviewSampleImage(null);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Preview Pin Card"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Pin */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(row.rowIndex)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Duplicate Pin (+1h offset)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Row */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors cursor-pointer"
                        title="Edit Row"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Row */}
                      {onDeleteRow && (
                        <button
                          type="button"
                          onClick={() => onDeleteRow(row.rowIndex)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                          title="Remove Pin from Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {processedRows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-zinc-500 text-xs">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-zinc-600" />
                    <p className="font-medium text-zinc-400">
                      No campaign pins match the current filter or search criteria.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedBoardFilter('ALL');
                        setValidationFilter('all');
                      }}
                      className="text-xs text-brand-400 hover:underline font-semibold cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: EDIT ROW                                      */}
      {/* ======================================================== */}
      {editingRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setEditingRow(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-400" />
                <h4 className="text-sm font-bold text-white">Edit Campaign Pin #{editingRow.rowIndex}</h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Image Prompt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300">Image Generation Prompt</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const tags = generateTrendingHashtags(editFormData.prompt);
                        setEditFormData((prev) => ({ ...prev, prompt: `${prev.prompt.trim()}\n\n${tags}` }));
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-300 hover:text-emerald-200"
                    >
                      <Flame className="w-2.5 h-2.5" />
                      <span>+Hashtags</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const enriched = smartExpandPrompt(editFormData.prompt);
                        setEditFormData((prev) => ({ ...prev, prompt: enriched }));
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200"
                    >
                      <Wand2 className="w-2.5 h-2.5" />
                      <span>AI Enhance</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={editFormData.prompt}
                  onChange={(e) => setEditFormData({ ...editFormData, prompt: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none resize-none"
                  placeholder="Enter detailed aesthetic prompt..."
                />
              </div>

              {/* Pin Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300">Pin Title</label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = generateTitleFromPrompt(editFormData.prompt);
                      setEditFormData((prev) => ({ ...prev, title: gen }));
                    }}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Generate from Prompt</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  placeholder="Catchy Pinterest title..."
                />
              </div>

              {/* Target Board */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Target Pinterest Board</label>
                <input
                  type="text"
                  value={editFormData.board}
                  onChange={(e) => setEditFormData({ ...editFormData, board: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  placeholder="Board name (e.g. Home Decor, Fashion Inspo)..."
                />
              </div>

              {/* Scheduled Time & Destination Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Scheduled Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={editFormData.scheduleTime}
                    onChange={(e) => setEditFormData({ ...editFormData, scheduleTime: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Destination Link (Optional)</label>
                  <input
                    type="url"
                    value={editFormData.link}
                    onChange={(e) => setEditFormData({ ...editFormData, link: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                    placeholder="https://yourblog.com/post"
                  />
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button size="sm" variant="outline" onClick={() => setEditingRow(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: ADD NEW PIN                                   */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Add New Pin to Campaign</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Image Prompt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300">Image Generation Prompt *</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!addFormData.prompt.trim()) return;
                      const enriched = smartExpandPrompt(addFormData.prompt);
                      setAddFormData((prev) => ({ ...prev, prompt: enriched }));
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200"
                  >
                    <Wand2 className="w-2.5 h-2.5" />
                    <span>AI Enhance</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={addFormData.prompt}
                  onChange={(e) => setAddFormData({ ...addFormData, prompt: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none resize-none"
                  placeholder="E.g., Minimalist Japandi bedroom with light wood bed, linen bedding, soft morning light..."
                  required
                />
              </div>

              {/* Pin Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300">Pin Title</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!addFormData.prompt.trim()) return;
                      const gen = generateTitleFromPrompt(addFormData.prompt);
                      setAddFormData((prev) => ({ ...prev, title: gen }));
                    }}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Generate Title</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={addFormData.title}
                  onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  placeholder="E.g., 10 Japandi Bedroom Ideas You'll Love"
                />
              </div>

              {/* Target Board */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Target Pinterest Board</label>
                <input
                  type="text"
                  value={addFormData.board}
                  onChange={(e) => setAddFormData({ ...addFormData, board: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  placeholder="Target board name..."
                />
              </div>

              {/* Scheduled Time & Destination Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Scheduled Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={addFormData.scheduleTime}
                    onChange={(e) => setAddFormData({ ...addFormData, scheduleTime: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Destination Link (Optional)</label>
                  <input
                    type="url"
                    value={addFormData.link}
                    onChange={(e) => setAddFormData({ ...addFormData, link: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-500 focus:outline-none"
                    placeholder="https://yourblog.com/japandi"
                  />
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveNewPin}
                disabled={!addFormData.prompt.trim()}
              >
                Add Pin to Queue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: PIN PREVIEW CARD                              */}
      {/* ======================================================== */}
      {previewingRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => {
            setPreviewingRow(null);
            setPreviewSampleImage(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Pinterest Card Mockup</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewingRow(null);
                  setPreviewSampleImage(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mockup Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  Pin #{previewingRow.rowIndex}
                </span>
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-400" />
                  {new Date(previewingRow.scheduleTime).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Sample Image Generated Live on Demand */}
              {previewSampleImage ? (
                <div className="relative rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSampleImage}
                    alt={previewingRow.prompt}
                    className="w-full h-auto max-h-[300px] object-cover rounded-xl"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[9px] text-emerald-400 font-semibold border border-emerald-500/30 backdrop-blur-md">
                    Live Sample Synthesized
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-5 text-center space-y-2">
                  <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    Image will be generated automatically on dispatch schedule.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestGenerateSample(previewingRow.prompt)}
                    isLoading={isGeneratingSample}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    className="text-xs border-zinc-700 bg-zinc-900"
                  >
                    {isGeneratingSample ? 'Synthesizing...' : 'Test Generate Sample'}
                  </Button>
                </div>
              )}

              <div>
                <h3 className="text-base font-extrabold text-white leading-tight">
                  {previewingRow.title || 'Untitled Campaign Pin'}
                </h3>
                <p className="text-xs text-zinc-300 mt-2 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 leading-relaxed font-mono whitespace-pre-line">
                  {previewingRow.prompt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Tag className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-semibold">
                    {rBoard(previewingRow)}
                  </span>
                </div>
                {previewingRow.link && (
                  <a
                    href={previewingRow.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-400 hover:underline"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Destination Link</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  handleDuplicate(previewingRow.rowIndex);
                  setPreviewingRow(null);
                }}
                leftIcon={<Copy className="w-3.5 h-3.5" />}
              >
                Duplicate Pin
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setPreviewingRow(null);
                  setPreviewSampleImage(null);
                }}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: BULK CHANGE BOARD                             */}
      {/* ======================================================== */}
      {isBulkBoardModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsBulkBoardModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-400" />
                <h4 className="text-sm font-bold text-white">Bulk Change Board</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkBoardModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Set target Pinterest board for all <strong className="text-white">{selectedIndices.size}</strong> selected pins:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={bulkBoardName}
                onChange={(e) => setBulkBoardName(e.target.value)}
                placeholder="Enter board name (e.g. Modern Architecture)..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-brand-500 focus:outline-none"
                autoFocus
              />

              {uniqueBoards.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-zinc-500 block">Or pick existing board:</span>
                  <div className="flex flex-wrap gap-1">
                    {uniqueBoards.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBulkBoardName(b)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button size="sm" variant="outline" onClick={() => setIsBulkBoardModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleBulkApplyBoard} disabled={!bulkBoardName.trim()}>
                Apply to {selectedIndices.size} Pins
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL: UTM CAMPAIGN TAG BUILDER                      */}
      {/* ======================================================== */}
      {isUtmModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsUtmModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">UTM Tracking Link Builder</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsUtmModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Automatically append Google Analytics UTM tracking parameters to{' '}
              <strong className="text-white">
                {selectedIndices.size > 0 ? `${selectedIndices.size} selected` : 'all'}
              </strong>{' '}
              destination URLs:
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Campaign Name (utm_campaign)</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="e.g. holiday_sale_2026"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Campaign Source (utm_source)</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="pinterest"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Campaign Medium (utm_medium)</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="social"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button size="sm" variant="outline" onClick={() => setIsUtmModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleApplyUtmParams}>
                Apply UTM Tags
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
