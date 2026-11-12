'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { QueueStatsSummary } from '@/components/queue/QueueStatsSummary';
import { QueueJobRow } from '@/components/queue/QueueJobRow';
import { ScheduledJob, JobStatus } from '@/types/job';
import { Play, Download, RefreshCw, Plus, Clock } from 'lucide-react';
import { logger } from '@/lib/logger';
import Link from 'next/link';

export default function QueuePage() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filter, setFilter] = useState<'ALL' | JobStatus>('ALL');
  const [search, setSearch] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
        logger.queue.debug(`Loaded ${data.length} queue items`);
      }
    } catch (err) {
      logger.queue.error('Error fetching queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Auto-poll queue every 20 seconds
    const interval = setInterval(fetchJobs, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScheduler = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/queue/run', { method: 'POST' });
      await res.json();
      await fetchJobs();
    } catch {
      alert('Error running scheduler');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export/zip', { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }

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
      const msg = err instanceof Error ? err.message : 'Export failed';
      alert(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to remove this scheduled job?')) return;
    try {
      await fetch(`/api/queue/${id}`, { method: 'DELETE' });
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      alert('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter !== 'ALL' && job.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.prompt.toLowerCase().includes(q) ||
        job.boardName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Automated Publishing Queue
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Monitors, synthesizes, and dispatches pins to Pinterest and future connected platforms at exact timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchJobs}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportZip}
            isLoading={isExporting}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export ZIP + CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleRunScheduler}
            isLoading={isRunning}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            Run Scheduler Now
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <QueueStatsSummary jobs={jobs} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Mobile Custom Select Dropdown */}
        <div className="block sm:hidden w-full">
          <Select
            value={filter}
            onChange={(val) => setFilter(val as 'ALL' | JobStatus)}
            options={[
              { value: 'ALL', label: `All Jobs (${jobs.length})` },
              { value: 'PENDING', label: 'Pending Processing' },
              { value: 'PUBLISHED', label: 'Published Pins' },
              { value: 'FAILED', label: 'Failed Jobs' },
            ]}
            size="sm"
          />
        </div>

        {/* Desktop Filter Tabs */}
        <div className="hidden sm:flex rounded-xl bg-zinc-950 p-1 border border-zinc-800/80 overflow-x-auto">
          {(['ALL', 'PENDING', 'PUBLISHED', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === status ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {status} {status === 'ALL' ? `(${jobs.length})` : ''}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt, title, or board..."
            className="w-full sm:w-64 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none"
          />
          <Link href="/studio?mode=sheets">
            <Button size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Import More
            </Button>
          </Link>
        </div>
      </div>

      {/* Jobs Table */}
      <Card className="p-0 overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">No scheduled tasks found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Import a Google Sheet or use the AI Studio to schedule automated pins to Pinterest.
            </p>
            <Link href="/studio?mode=sheets" className="inline-block pt-2">
              <Button size="sm" variant="primary">
                Import from Google Sheets
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-semibold w-16">Media</th>
                  <th className="py-3 px-4 font-semibold">Title &amp; Prompt</th>
                  <th className="py-3 px-4 font-semibold">Channel</th>
                  <th className="py-3 px-4 font-semibold">Scheduled Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredJobs.map((job) => (
                  <QueueJobRow key={job.id} job={job} onDelete={handleDeleteJob} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
