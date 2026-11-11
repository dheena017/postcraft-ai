'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Sparkles,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Share2,
  CheckCircle2,
  Layers,
  Wand2,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface NicheDemo {
  id: string;
  name: string;
  tag: string;
  boardName: string;
  pinTitle: string;
  pinDescription: string;
  prompt: string;
  imageUrl: string;
  aestheticPreset: string;
}

const NICHE_DEMOS: NicheDemo[] = [
  {
    id: 'decor',
    name: 'Home & Living',
    tag: 'Interior Aesthetics',
    boardName: 'Home Decor Ideas',
    pinTitle: '10 Scandinavian Living Room Decor Ideas for Small Spaces',
    pinDescription: 'Cozy minimalist apartment styling with natural morning light, beige linen textures, and warm timber accents.',
    prompt: 'Aesthetic Scandinavian living room with warm wooden furniture, morning sunlight, cozy beige linen couch, award-winning interior photography, 8k resolution',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
    aestheticPreset: 'Aesthetic Minimalist',
  },
  {
    id: 'food',
    name: 'Food & Recipes',
    tag: 'Culinary Viral',
    boardName: 'Healthy Meal Prep',
    pinTitle: 'Easy 15-Minute Artisanal Berry Sourdough Toast & Honey',
    pinDescription: 'Crispy sourdough topped with whipped ricotta, fresh blackberries, golden organic honey, and mint leaves.',
    prompt: 'Artisanal sourdough toast with whipped ricotta, organic berries, dripping golden honey, cozy morning kitchen counter, food magazine photography',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
    aestheticPreset: 'Vibrant Pop Food',
  },
  {
    id: 'fashion',
    name: 'Fashion & Style',
    tag: 'Style Inspo',
    boardName: 'Autumn Capsule Wardrobe',
    pinTitle: 'Minimalist Autumn Capsule Wardrobe: 7 Timeless Essentials',
    pinDescription: 'Oatmeal cashmere knitwear, tailored camel wool coat, leather boots, and neutral layering tips for modern style.',
    prompt: 'Flatlay aesthetic autumn capsule wardrobe, camel wool trench coat, cream cashmere sweater, leather accessories, warm coffee cup, Vogue editorial',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    aestheticPreset: 'Moody Editorial',
  },
  {
    id: 'wellness',
    name: 'Mindful Wellness',
    tag: 'Self-Care Rituals',
    boardName: 'Daily Wellness & Habits',
    pinTitle: '5 Morning Rituals That Will Transform Your Focus & Clarity',
    pinDescription: 'Ceremonial matcha preparation, calm journaling space, incense glow, and gentle natural lighting for mindful mornings.',
    prompt: 'Japanese ceremonial matcha bowl with bamboo whisk, gentle steam, minimal stone table, soft morning sunlight, calming zen aesthetic',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    aestheticPreset: 'Pastel Dream',
  },
];

const FAQS = [
  {
    q: 'Is PostCraft AI really 100% free with zero watermarks?',
    a: 'Yes, completely! PostCraft AI runs on open-source, high-efficiency AI image synthesis models (FLUX.1 and SDXL) with negative watermark suppression. You can generate unlimited high-resolution 2:3 vertical images, download them directly, or publish to your Pinterest boards with no watermarks, logos, or subscription fees.',
  },
  {
    q: 'How does Google Sheets and CSV automation work?',
    a: 'You simply provide the shareable link of any public Google Spreadsheet or upload a CSV file containing columns for your prompt, pin title, destination URL, and scheduled time. PostCraft AI automatically parses the rows, maps the columns, and adds all jobs to your background publishing queue.',
  },
  {
    q: 'Can I publish directly to my personal or business Pinterest account?',
    a: 'Yes! PostCraft AI integrates with the official Pinterest API v5. You can connect your Pinterest account in Settings, select any of your boards, and have pins published automatically at scheduled times or instantly from the AI Creative Studio.',
  },
  {
    q: 'Why does PostCraft AI specialize in the 2:3 aspect ratio?',
    a: 'Pinterest’s algorithm specifically prioritizes vertical 2:3 images (1000x1500px). Standard landscape or square images receive up to 60% less screen real estate in mobile feeds. PostCraft AI locks your output to native 2:3 Pinterest dimensions so every visual looks native and commands maximum feed attention.',
  },
  {
    q: 'Can I download my pins in bulk without posting directly?',
    a: 'Yes. With the Bulk ZIP Exporter feature in your Queue or Dashboard, you can download an organized ZIP archive containing all your generated high-resolution images alongside a metadata CSV, ready for manual scheduling or multi-platform archiving.',
  },
  {
    q: 'Do I need to sign up or input a credit card to use this?',
    a: 'No sign-up and no credit card required. You can start creating pins right now in the AI Studio, view platform metrics on the Dashboard, or connect spreadsheets without ever hitting a paywall.',
  },
];

export default function LandingPage() {
  const [activeNiche, setActiveNiche] = useState<NicheDemo>(NICHE_DEMOS[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[450px] h-[260px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/3 w-[350px] h-[220px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/25 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>100% Free • Unlimited Syntheses • Zero Watermarks</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Synthesize AI Images. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-rose-400 to-amber-300">
              Publish Directly to Pinterest.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-normal">
            Automate your Pinterest growth on autopilot. Turn simple text prompts or connected Google Spreadsheets into high-converting 2:3 vertical visuals, scheduled and published with zero watermarks.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/studio" prefetch={true}>
              <Button
                size="lg"
                variant="primary"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="shadow-xl shadow-brand-500/25 text-base px-8 py-4"
              >
                Launch AI Studio (Free)
              </Button>
            </Link>
            <Link href="/dashboard" prefetch={true}>
              <Button
                size="lg"
                variant="secondary"
                leftIcon={<LayoutDashboard className="w-5 h-5 text-brand-400" />}
                className="text-base px-7 py-4"
              >
                Open Dashboard
              </Button>
            </Link>
            <Link href="/studio?mode=sheets" prefetch={true}>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<FileSpreadsheet className="w-5 h-5 text-emerald-400" />}
                className="text-base px-7 py-4"
              >
                Connect Sheets
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Sign-up / No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Native 2:3 Pinterest Ratio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated Background Scheduler</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official Pinterest API v5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Niche Simulator Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-black/80 space-y-8">
          {/* Niche Category Tab Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-1">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Interactive Pin Simulator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Explore Popular Viral Niches
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {NICHE_DEMOS.map((niche) => {
                const isActive = activeNiche.id === niche.id;
                return (
                  <button
                    key={niche.id}
                    type="button"
                    onClick={() => setActiveNiche(niche)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {niche.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Demonstration Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Prompt to Pin Breakdown */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                  {activeNiche.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  From a single prompt to a scheduled, viral pin.
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  PostCraft AI transforms your concept into an ultra-high resolution 2:3 vertical pin with no watermark, applies aesthetic composition presets, and schedules publication to your Pinterest board.
                </p>
              </div>

              {/* Step By Step Interactive Pipeline Badges */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-200 block">Input Prompt:</span>
                    <span className="text-zinc-400 italic font-mono text-[11px]">
                      &quot;{activeNiche.prompt}&quot;
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-200">AI Synthesis:</span>
                    <span className="text-zinc-400 ml-1.5">
                      1000x1500px Native 2:3 Vertical (FLUX/SDXL, strict zero-watermark filter)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-200">Automated Dispatch:</span>
                    <span className="text-zinc-400 ml-1.5">
                      Scheduled to board &quot;{activeNiche.boardName}&quot; with live link
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Studio Shortcut */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/studio" prefetch={true}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open in Creative Studio
                  </Button>
                </Link>
                <Link href="/dashboard" prefetch={true}>
                  <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Live Simulated Pin Card */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-700/80 bg-zinc-950 p-4 shadow-2xl relative group">
                <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-zinc-900 border border-zinc-800 mb-4 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeNiche.imageUrl}
                    alt={activeNiche.pinTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500 text-white shadow-md">
                    📌 2:3 Pinterest
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/80 text-emerald-300 backdrop-blur-md border border-emerald-500/30">
                    ✓ Watermark-Free
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-medium bg-zinc-900/90 text-zinc-300 border border-zinc-700">
                    {activeNiche.aestheticPreset}
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="font-bold text-sm text-zinc-100 leading-snug">
                    {activeNiche.pinTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {activeNiche.pinDescription}
                  </p>
                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80 text-[11px]">
                    <span className="text-zinc-500">Board: <strong className="text-zinc-300">{activeNiche.boardName}</strong></span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready to Publish
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Powerhouse Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered Exclusively for Social Growth Creators
          </h2>
          <p className="text-sm text-zinc-400">
            Everything you need to automate your social visual content pipeline from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glow className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Zero Watermark Guarantee</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Powered by high-speed open-source FLUX and SDXL models. Generate unlimited high-resolution visuals without subscription gates or brand watermarks.
            </p>
            <div className="pt-2">
              <Link href="/studio" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Open AI Studio &rarr;
              </Link>
            </div>
          </Card>

          <Card glow className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Google Sheets Automation</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Link any public Google Spreadsheet or CSV containing prompts, pin titles, boards, and scheduled times. PostCraft queues and dispatches them automatically.
            </p>
            <div className="pt-2">
              <Link href="/studio?mode=sheets" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Connect Sheets &rarr;
              </Link>
            </div>
          </Card>

          <Card glow className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Direct Pinterest API v5</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Native Pinterest API v5 integration with official board publishing, backed by an extensible architecture ready for Instagram, Twitter, and TikTok.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                View In Dashboard &rarr;
              </Link>
            </div>
          </Card>

          <Card glow className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Background Schedule Daemon</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Automatic background runner regularly evaluates scheduled pins and publishes them at designated timestamps, preventing account rate limits.
            </p>
            <div className="pt-2">
              <Link href="/queue" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                View Queue Tasks &rarr;
              </Link>
            </div>
          </Card>

          <Card glow className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">2:3 Aspect Ratio Standard</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Locked to the 1000x1500px gold standard favored by Pinterest mobile feeds for optimal click-through rates, save ratios, and viral discovery.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1">
                Explore Dashboard &rarr;
              </Link>
            </div>
          </Card>

          <Card glow className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Bulk ZIP Pin Exporter</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Export generated batches with full metadata as a consolidated ZIP file. Perfect for multi-platform scheduling, backups, and client deliverables.
            </p>
            <div className="pt-2">
              <Link href="/queue" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Export Options &rarr;
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-zinc-800/80 rounded-3xl bg-zinc-950/60 p-8 sm:p-14 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">How It Works in 3 Simple Steps</h2>
            <p className="text-xs sm:text-sm text-zinc-400">Streamline your Pinterest workflow from idea to viral pin in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-brand-400 font-bold flex items-center justify-center mx-auto sm:mx-0">
                1
              </div>
              <h4 className="font-semibold text-base text-zinc-100">Input Prompts or Sheets</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Type interactive prompts into the studio with aesthetic style filters or paste a Google Spreadsheet link.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-brand-400 font-bold flex items-center justify-center mx-auto sm:mx-0">
                2
              </div>
              <h4 className="font-semibold text-base text-zinc-100">AI Synthesizes Pin Visuals</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                High-resolution 2:3 Pinterest aspect ratio images are generated without logos, text watermarks, or quality loss.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-brand-400 font-bold flex items-center justify-center mx-auto sm:mx-0">
                3
              </div>
              <h4 className="font-semibold text-base text-zinc-100">Automated Scheduled Publishing</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pins are posted to your selected Pinterest boards at exact scheduled times or exported as a Pinterest bulk ZIP archive.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link href="/studio" prefetch={true}>
              <Button size="lg" variant="primary" rightIcon={<Zap className="w-4 h-4" />}>
                Start Creating Free
              </Button>
            </Link>
            <Link href="/dashboard" prefetch={true}>
              <Button size="lg" variant="secondary" leftIcon={<LayoutDashboard className="w-4 h-4 text-brand-400" />}>
                Visit Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix Table */}
      <section id="comparison" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Why Creators Switch</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            How PostCraft AI Compares
          </h2>
          <p className="text-sm text-zinc-400">
            Purpose-built for Pinterest creators, eliminating subscriptions and manual bottlenecks.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-300">
              <tr>
                <th className="p-4 font-semibold">Feature &amp; Metric</th>
                <th className="p-4 font-bold text-brand-400 bg-brand-500/10">PostCraft AI</th>
                <th className="p-4 font-semibold text-zinc-400">Canva Pro</th>
                <th className="p-4 font-semibold text-zinc-400">Midjourney / Paid AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              <tr>
                <td className="p-4 font-medium text-white">Pricing &amp; Subscriptions</td>
                <td className="p-4 font-bold text-emerald-400 bg-brand-500/5">100% Free Forever</td>
                <td className="p-4 text-zinc-400">$13 - $15 / month</td>
                <td className="p-4 text-zinc-400">$10 - $60 / month</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Brand Watermarks</td>
                <td className="p-4 font-bold text-emerald-400 bg-brand-500/5">Zero Watermarks</td>
                <td className="p-4 text-zinc-400">Restricted on Free</td>
                <td className="p-4 text-zinc-400">No (Paid tiers only)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Native 2:3 Pinterest Ratio</td>
                <td className="p-4 font-bold text-emerald-400 bg-brand-500/5">Native 1000x1500px</td>
                <td className="p-4 text-zinc-400">Manual Resize</td>
                <td className="p-4 text-zinc-400">Requires aspect flag</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Google Sheets Batch Ingestion</td>
                <td className="p-4 font-bold text-emerald-400 bg-brand-500/5">1-Click Auto Sync</td>
                <td className="p-4 text-zinc-400">Complex Bulk Create</td>
                <td className="p-4 text-zinc-400">Not Supported</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Direct Pinterest Board Publish</td>
                <td className="p-4 font-bold text-emerald-400 bg-brand-500/5">Official API v5</td>
                <td className="p-4 text-zinc-400">Available (Pro only)</td>
                <td className="p-4 text-zinc-400">Not Supported</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Automated Background Scheduler</td>
                <td className="p-4 font-bold text-emerald-400 bg-brand-500/5">Built-in Daemon</td>
                <td className="p-4 text-zinc-400">Manual queue</td>
                <td className="p-4 text-zinc-400">Not Supported</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-400">
            Everything you need to know about PostCraft AI and automated Pinterest workflows.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-zinc-100 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center flex-shrink-0 ml-4">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Impact Bottom Call to Action */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-brand-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-brand-500/10 blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Get Started In Seconds
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to automate your Pinterest visual pipeline?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              No subscription fee, zero watermarks, and instant automated scheduling. Launch the AI Creative Studio or jump directly into your Dashboard now.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/studio" prefetch={true}>
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Launch AI Studio (Free)
                </Button>
              </Link>
              <Link href="/dashboard" prefetch={true}>
                <Button size="lg" variant="secondary" leftIcon={<LayoutDashboard className="w-5 h-5 text-brand-400" />}>
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
