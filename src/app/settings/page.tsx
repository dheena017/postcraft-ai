'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, ShieldCheck, Key, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { ProviderStatus } from '@/types/provider';

export default function SettingsPage() {
  const [accessToken, setAccessToken] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [defaultBoardId, setDefaultBoardId] = useState('');
  const [connectedAccountName, setConnectedAccountName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);

  useEffect(() => {
    // Load Pinterest config
    fetch('/api/providers/pinterest/auth')
      .then((res) => res.json())
      .then((data) => {
        setIsConnected(data.isConnected);
        setClientId(data.clientId || '');
        setDefaultBoardId(data.defaultBoardId || '');
        setConnectedAccountName(data.connectedAccountName || '');
      })
      .catch((err) => console.error(err));

    // Load Provider statuses
    fetch('/api/providers/status')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProviderStatuses(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSavePinterest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/providers/pinterest/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          clientId,
          clientSecret,
          defaultBoardId,
          connectedAccountName: connectedAccountName || (accessToken ? 'Connected User' : undefined),
        }),
      });

      if (!res.ok) throw new Error('Failed to update credentials');

      setIsConnected(Boolean(accessToken && accessToken.length > 5));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          Platform &amp; Provider Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your Pinterest API integration and view future multi-platform social publisher adapters.
        </p>
      </div>

      {/* Provider Ecosystem Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Publishing Providers Hub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providerStatuses.map((p) => (
            <Card
              key={p.id}
              className={`p-4 flex flex-col justify-between ${
                p.id === 'pinterest' ? 'border-brand-500/40 bg-brand-500/5' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-zinc-100">{p.name}</span>
                  <Badge
                    status={p.id === 'pinterest' && isConnected ? 'CONNECTED' : p.id === 'pinterest' ? 'READY' : 'PENDING'}
                    label={p.id === 'pinterest' ? (isConnected ? 'Active' : 'Simulation') : 'Future Ready'}
                  />
                </div>
                <p className="text-xs text-zinc-400">
                  {p.id === 'pinterest'
                    ? 'Primary direct publisher with board targeting & scheduled auto-dispatch.'
                    : 'Provider adapter slot ready for future API credentials.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
                <span>{p.id === 'pinterest' ? 'Active Provider' : 'Pluggable Slot'}</span>
                {p.id === 'pinterest' && <span className="text-brand-400 font-semibold">Core Engine</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pinterest Credentials Form */}
      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-400" />
              Pinterest API v5 Credentials
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Connect your Pinterest developer token to publish pins directly from your automated queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              {isConnected ? 'Live Account Connected' : 'Dry-Run Simulation Mode'}
            </span>
          </div>
        </div>

        {saveSuccess && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Settings saved successfully! Scheduled tasks will now dispatch via your configured Pinterest credentials.</span>
          </div>
        )}

        <form onSubmit={handleSavePinterest} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300">
              Pinterest User Access Token (Bearer)
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="pina_..."
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <span>Generate from the</span>
              <a
                href="https://developers.pinterest.com/apps/"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline inline-flex items-center gap-0.5"
              >
                Pinterest Developer Portal <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>under Apps &gt; Keys &gt; Generate Token.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Connected Account Label / Username</label>
              <input
                type="text"
                value={connectedAccountName}
                onChange={(e) => setConnectedAccountName(e.target.value)}
                placeholder="e.g. MyBrandOfficial"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Default Target Board ID (Optional)</label>
              <input
                type="text"
                value={defaultBoardId}
                onChange={(e) => setDefaultBoardId(e.target.value)}
                placeholder="e.g. 10987654321"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
            <p className="text-[11px] text-zinc-500">
              ⚡ Leave token blank to use zero-config dry-run simulation mode (safely test schedulers and export ZIP packages).
            </p>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />}
            >
              Save Credentials
            </Button>
          </div>
        </form>
      </Card>

      {/* AI Watermark Guarantee Card */}
      <Card className="border-emerald-500/20 bg-emerald-950/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              Free &amp; Unlimited AI Engine Guarantee
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              PostCraft AI routes all generation requests through high-speed open-source FLUX and SDXL models with strict anti-watermark negative parameters (`nologo=true`, watermark/logo exclusion filters). You enjoy unlimited image creation with zero subscriptions, credits, or watermarks.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
