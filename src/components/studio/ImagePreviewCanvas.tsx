'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share2, Sparkles, Maximize2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { QuickPublishModal } from './QuickPublishModal';
import { ImageGenerationResult } from '@/types/image';
import { removeWatermark, preloadImage } from '@/lib/ai/clean-image';

interface ImagePreviewCanvasProps {
  imageResult: ImageGenerationResult | null;
  isGenerating: boolean;
}

export const ImagePreviewCanvas: React.FC<ImagePreviewCanvasProps> = ({
  imageResult,
  isGenerating,
}) => {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [cleanImageUrl, setCleanImageUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);

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

  const activeUrl = cleanImageUrl || imageResult?.imageUrl || '';

  const handleDownload = async () => {
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

  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-[460px] rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 md:p-6 overflow-hidden">
        {/* Anti-watermark guarantee badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Watermark-Free & Unlimited</span>
        </div>

        {/* Aspect Ratio Badge */}
        {imageResult && (
          <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900/80 text-zinc-300 border border-zinc-700/80 backdrop-blur-md">
            {imageResult.width} x {imageResult.height} ({imageResult.aspectRatio})
          </div>
        )}

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 animate-spin p-0.5">
                <div className="w-full h-full bg-zinc-950 rounded-[14px]" />
              </div>
              <Sparkles className="w-6 h-6 text-brand-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">Synthesizing High-Resolution AI Image...</p>
              <p className="text-xs text-zinc-500 mt-1">Applying aesthetic filters and anti-watermark enhancements</p>
            </div>
          </div>
        ) : imageResult ? (
          <div className="flex flex-col items-center w-full max-w-md">
            <div
              className="relative group w-full rounded-2xl overflow-hidden border border-zinc-800/90 shadow-2xl shadow-black bg-zinc-900/50"
              style={{
                aspectRatio: `${imageResult.width} / ${imageResult.height}`,
                minHeight: isImageLoading ? '360px' : undefined,
              }}
            >
              {isImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-sm z-10 animate-in fade-in">
                  <Sparkles className="w-8 h-8 text-brand-400 animate-spin mb-2" />
                  <p className="text-xs text-zinc-300 font-medium">Rendering HD preview...</p>
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeUrl}
                alt={imageResult.prompt}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                className={`w-full h-auto max-h-[540px] object-contain mx-auto transition-all duration-300 group-hover:scale-[1.01] ${
                  isImageLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
                }`}
              />

              {/* Hover overlay with zoom button */}
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-md"
                title="Expand Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Action Bar below image */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 w-full">
              <Button
                variant="primary"
                onClick={() => setIsPublishModalOpen(true)}
                leftIcon={<Share2 className="w-4 h-4" />}
                className="flex-1 min-w-[170px]"
              >
                Publish to Pinterest
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownload}
                leftIcon={<Download className="w-4 h-4" />}
                className="flex-1 min-w-[140px]"
              >
                Download HD
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-16 text-zinc-500">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-300">Your AI Canvas is Ready</p>
              <p className="text-xs text-zinc-500 max-w-xs mt-1">
                Enter any prompt or choose a style preset on the left, then click Generate to create watermark-free visuals.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomed && imageResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeUrl}
            alt={imageResult.prompt}
            className="max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl border border-zinc-800"
          />
        </div>
      )}

      {/* Quick Publish Modal */}
      {imageResult && (
        <QuickPublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          imageUrl={activeUrl}
          initialPrompt={imageResult.prompt}
        />
      )}
    </>
  );
};
