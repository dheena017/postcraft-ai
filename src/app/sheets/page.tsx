'use client';

import React, { useState } from 'react';
import { SheetConnectorCard } from '@/components/sheets/SheetConnectorCard';
import { ColumnMappingForm } from '@/components/sheets/ColumnMappingForm';
import { SheetDataPreviewTable } from '@/components/sheets/SheetDataPreviewTable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AspectRatioPicker } from '@/components/studio/AspectRatioPicker';
import { StylePresetSelector } from '@/components/studio/StylePresetSelector';
import { ParsedSheetRow, SheetMappingConfig } from '@/types/job';
import { AspectRatio, StylePresetId } from '@/types/image';
import { CalendarPlus, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SheetsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Batch Generation Settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('2:3');
  const [stylePreset, setStylePreset] = useState<StylePresetId>('aesthetic-minimal');
  const [syncSuccess, setSyncSuccess] = useState<number | null>(null);

  const handleParse = async (payload: { sheetUrl?: string; csvContent?: string }) => {
    setIsLoading(true);
    setSyncSuccess(null);
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
      setIsLoading(false);
    }
  };

  const handleMappingChange = async (updatedMapping: SheetMappingConfig) => {
    setMapping(updatedMapping);
    // Re-parse with new mapping if rawCsv is stored
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
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows,
          aspectRatio,
          stylePreset,
          providerId: 'pinterest',
          source: 'GOOGLE_SHEETS',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to queue jobs');

      setSyncSuccess(data.count || rows.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Queue synchronization failed';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          Google Sheets &amp; Bulk Automation Hub
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Connect your spreadsheet to generate batches of watermark-free pins and schedule automatic publication.
        </p>
      </div>

      {/* Success Notification Banner */}
      {syncSuccess !== null && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">
                Successfully Scheduled {syncSuccess} Pins!
              </h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                The images will be synthesized and published automatically at their scheduled times.
              </p>
            </div>
          </div>
          <Link href="/queue">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Scheduled Queue
            </Button>
          </Link>
        </div>
      )}

      {/* Step 1: Connector */}
      <SheetConnectorCard onParse={handleParse} isLoading={isLoading} />

      {/* Step 2: Mapping & Batch Settings (visible after sheet load) */}
      {headers.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ColumnMappingForm headers={headers} mapping={mapping} onChange={handleMappingChange} />

          <Card className="space-y-6">
            <h3 className="text-sm font-semibold text-zinc-200 pb-3 border-b border-zinc-800">
              Batch AI Image Synthesis Settings
            </h3>
            <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />
            <StylePresetSelector value={stylePreset} onChange={setStylePreset} />
          </Card>

          <SheetDataPreviewTable rows={rows} />

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-brand-500/30 bg-zinc-950/80 backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                Ready to schedule {rows.length} image prompts to Pinterest
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target Aspect Ratio: <strong className="text-brand-300">{aspectRatio} (Pinterest Optimal)</strong> • Style: <strong className="text-brand-300">{stylePreset}</strong>
              </p>
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={handleSyncToQueue}
              isLoading={isSubmitting}
              leftIcon={<CalendarPlus className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Add {rows.length} Pins to Scheduled Queue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
