'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Lock,
  Share2,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 11, 2026';

  const sections = [
    {
      id: 'overview',
      icon: ShieldCheck,
      title: '1. Overview & Core Philosophy',
      content: (
        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>
            At <strong className="text-white">PostCraft AI</strong>, we respect your privacy and are committed to safeguarding your personal information, social credentials, and creative assets. PostCraft AI operates as a free, open-access AI visual creation studio and automated social publisher.
          </p>
          <p>
            This Privacy Policy explains what information is collected when you use our web platform, how third-party integrations (specifically the Pinterest API v5 and Google Sheets) are utilized, and how your credentials and synthesized media are securely handled.
          </p>
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs">
            <strong>Key Principle:</strong> PostCraft AI does not monetize, sell, lease, or distribute your private prompts, generation history, or connected social tokens to third-party advertising networks.
          </div>
        </div>
      ),
    },
    {
      id: 'collection',
      icon: Lock,
      title: '2. Information We Collect & Process',
      content: (
        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <p>Depending on how you interact with PostCraft AI, we may process the following types of information:</p>
          <ul className="space-y-2.5 list-disc list-inside text-zinc-400">
            <li>
              <strong className="text-zinc-200">Creative Prompts &amp; Preferences:</strong> Text prompts, aspect ratio selections (e.g., 2:3 vertical), negative prompts, and aesthetic style presets submitted to our AI studio.
            </li>
            <li>
              <strong className="text-zinc-200">Google Sheets &amp; CSV Ingestion Data:</strong> When you connect a public Google Spreadsheet link or upload a CSV file, our scheduler reads the provided rows containing pin titles, descriptions, destination URLs, and publishing times.
            </li>
            <li>
              <strong className="text-zinc-200">Pinterest Account Metadata:</strong> When you connect your Pinterest account, we receive an authorized OAuth 2.0 access token, your public account username, and board names/IDs necessary to publish pins on your behalf.
            </li>
            <li>
              <strong className="text-zinc-200">Local Configuration:</strong> UI preferences such as sidebar collapse states, active provider settings, and locally scheduled queue logs.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'pinterest-api',
      icon: Share2,
      title: '3. Pinterest API v5 Compliance & Usage',
      content: (
        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>
            PostCraft AI interfaces directly with the official <strong className="text-white">Pinterest API v5</strong>. In accordance with Pinterest Developer Policies:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Boards Read (`boards:read`)
              </span>
              <p className="text-[12px] text-zinc-400">
                Only used to display your boards dropdown so you can pick where to publish pins.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pins Write (`pins:write`)
              </span>
              <p className="text-[12px] text-zinc-400">
                Only used to publish the specific images and titles explicitly queued or created by you.
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 pt-2">
            We never inspect private boards without your permission, read direct messages, access payment methods, or modify pins that were not created through PostCraft AI.
          </p>
        </div>
      ),
    },
    {
      id: 'ai-ip',
      icon: Sparkles,
      title: '4. AI Image Generation & Intellectual Property',
      content: (
        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>
            Images synthesized through PostCraft AI utilize high-efficiency open-source diffusion models (FLUX.1 and SDXL) with strict negative prompt filtering to suppress brand watermarks, copyright stamps, and low-fidelity artifacts.
          </p>
          <ul className="space-y-2 list-disc list-inside text-zinc-400 text-xs">
            <li>
              <strong className="text-zinc-200">User Ownership:</strong> You retain complete creative freedom over all synthesized visual outputs generated via your prompts.
            </li>
            <li>
              <strong className="text-zinc-200">Zero Watermarks:</strong> We do not inject logos, branding stamps, or metadata watermarks into your final images.
            </li>
            <li>
              <strong className="text-zinc-200">Commercial &amp; Social Freedom:</strong> You are free to publish, schedule, download, monetize, or archive your synthesized visuals across Pinterest and other channels.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sheets-data',
      icon: FileSpreadsheet,
      title: '5. Google Sheets & External Links',
      content: (
        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>
            When utilizing the Sheets Automation feature, you provide a shareable public link or CSV. PostCraft AI reads only the designated columns (Prompt, Title, Description, Destination Link, Schedule Time).
          </p>
          <p className="text-xs text-zinc-400">
            We do not modify, overwrite, or delete rows in your source Google Spreadsheet. Data is ingested into your queue locally and evaluated by the background dispatcher.
          </p>
        </div>
      ),
    },
    {
      id: 'storage-deletion',
      icon: Trash2,
      title: '6. Data Retention, Control & Deletion',
      content: (
        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>You have full autonomy over your data at all times:</p>
          <ul className="space-y-2 list-disc list-inside text-zinc-400 text-xs">
            <li>
              <strong className="text-zinc-200">Disconnect Pinterest:</strong> You can disconnect your Pinterest account anytime in Settings with a single click, instantly revoking active sessions.
            </li>
            <li>
              <strong className="text-zinc-200">Clear Scheduled Tasks:</strong> You can purge, cancel, or delete tasks in your Schedule Queue.
            </li>
            <li>
              <strong className="text-zinc-200">Local Storage Purge:</strong> Resetting your browser local storage removes all cached UI preferences and local logs.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'contact',
      icon: ExternalLink,
      title: '7. Policy Updates & Contact Information',
      content: (
        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>
            We may periodically update this Privacy Policy to reflect platform enhancements or changes in third-party API terms. Revisions will be reflected with an updated date at the top of this document.
          </p>
          <p className="text-xs text-zinc-400">
            If you have questions regarding this policy, security inquiries, or API compliance details, please review our official documentation or open an issue on our repository.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/25">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>Legal &amp; API Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          How PostCraft AI protects your creative data, handles Pinterest API v5 credentials, and guarantees 100% watermark-free ownership.
        </p>
        <div className="flex items-center justify-center gap-3 text-xs text-zinc-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Last Updated: {lastUpdated}
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">Active &amp; Enforced</span>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2 border-zinc-800/80 bg-zinc-950/70">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Zero Data Selling</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your prompts, queue jobs, and social credentials are never monetized or distributed.
          </p>
        </Card>

        <Card className="p-5 space-y-2 border-zinc-800/80 bg-zinc-950/70">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">100% Asset Ownership</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            You hold complete copyright and commercial rights to all images generated without watermarks.
          </p>
        </Card>

        <Card className="p-5 space-y-2 border-zinc-800/80 bg-zinc-950/70">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Pinterest API v5 Safe</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Authorized OAuth 2.0 access used strictly for the boards and pins you explicitly command.
          </p>
        </Card>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              id={section.id}
              className="p-6 sm:p-8 space-y-4 border-zinc-800/90 bg-zinc-900/40 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {section.title}
                </h2>
              </div>
              {section.content}
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA / Navigation Return */}
      <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Ready to create viral Pinterest visuals?</h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          Start synthesizing 2:3 vertical visuals in the studio or open the automated scheduler with zero subscriptions.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/studio">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Launch AI Studio
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              Open Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

