'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Hash, Globe, FileText, X } from 'lucide-react';
import { generatePinMetadataFromPrompt, detectPromptNiche } from '@/lib/ai/prompt-enhancer';

interface PinSeoDrawerProps {
  prompt: string;
  onClose?: () => void;
  onApplyTitle?: (title: string) => void;
}

export const PinSeoDrawer: React.FC<PinSeoDrawerProps> = ({
  prompt,
  onClose,
  onApplyTitle,
}) => {
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [destinationUrl, setDestinationUrl] = useState('https://yourwebsite.com/pin-link');
  const [copiedKit, setCopiedKit] = useState(false);

  // Generate SEO titles & tags whenever prompt changes using intelligent metadata engine
  useEffect(() => {
    if (!prompt.trim()) return;

    const { niche } = detectPromptNiche(prompt);
    const meta = generatePinMetadataFromPrompt(prompt, niche);

    // Generate 3 bespoke viral title variations
    const primarySubject = prompt.split(',')[0].trim().replace(/^A |An |The /i, '');
    const capitalized = primarySubject.charAt(0).toUpperCase() + primarySubject.slice(1);

    const t1 = meta.title;
    const t2 = `Viral ${capitalized} Inspo | 2026 Trend Report`;
    const t3 = `How to Style ${capitalized} (Aesthetic ${niche.name})`;

    setTitles([t1, t2, t3]);
    setSelectedTitle(t1);
    setDescription(meta.description);
    setHashtags(meta.hashtags);
  }, [prompt]);

  const handleCopyFullKit = () => {
    const kitText = `📌 Title: ${selectedTitle}\n\n📝 Description: ${description}\n\n🏷️ Hashtags: ${hashtags.join(' ')}\n\n🔗 Destination Link: ${destinationUrl}`;
    navigator.clipboard.writeText(kitText);
    setCopiedKit(true);
    setTimeout(() => setCopiedKit(false), 2200);
  };

  return (
    <div className="p-3.5 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pinterest SEO &amp; Traffic Optimization Kit</span>
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left Column: Viral Titles */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <FileText className="w-3 h-3 text-brand-400" />
            <span>High-CTR Pin Titles (Click to Choose)</span>
          </label>
          <div className="space-y-1.5">
            {titles.map((titleOption, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedTitle(titleOption);
                  if (onApplyTitle) onApplyTitle(titleOption);
                }}
                className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors cursor-pointer leading-snug ${
                  selectedTitle === titleOption
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-semibold ring-1 ring-emerald-500/30'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {titleOption}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Hashtags, Link & Copy Full Kit */}
        <div className="space-y-2">
          {/* Destination URL */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>Destination Link</span>
            </label>
            <input
              type="text"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Hashtag Cloud */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Hash className="w-3 h-3 text-amber-400" />
              <span>Trending Search Tags</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] border border-zinc-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copy Full Pin Kit Button */}
      <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
        <button
          type="button"
          onClick={handleCopyFullKit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          {copiedKit ? (
            <>
              <Check className="w-3.5 h-3.5 text-black" />
              <span>Full Pin SEO Kit Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Pin SEO Kit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
