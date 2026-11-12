'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ImageGenerationResult } from '@/types/image';
import { Download, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { QuickPublishModal } from '@/components/studio/QuickPublishModal';
import { removeWatermark } from '@/lib/ai/clean-image';
import { logger } from '@/lib/logger';
import Link from 'next/link';

export default function GalleryPage() {
  const [images, setImages] = useState<ImageGenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForPublish, setSelectedForPublish] = useState<ImageGenerationResult | null>(null);
  const [ratioFilter, setRatioFilter] = useState('ALL');

  const filteredImages = ratioFilter === 'ALL'
    ? images
    : images.filter((img) => img.aspectRatio === ratioFilter);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(data);
          logger.client.debug(`Loaded ${data.length} images from creations gallery`);
        }
      })
      .catch((err) => logger.client.error('Failed to load gallery items', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownload = async (img: ImageGenerationResult) => {
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

      const response = await fetch(cleanUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `postcraft_${img.seed}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(img.imageUrl, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Creations Gallery
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Visual archive of all watermark-free AI images generated in your studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              value={ratioFilter}
              onChange={setRatioFilter}
              options={[
                { value: 'ALL', label: `All Ratios (${images.length})` },
                { value: '2:3', label: '2:3 Vertical' },
                { value: '1:1', label: '1:1 Square' },
                { value: '9:16', label: '9:16 Story' },
                { value: '16:9', label: '16:9 Landscape' },
              ]}
              size="sm"
              placeholder="Filter by Ratio"
            />
          </div>

          <Link href="/studio">
            <Button size="sm" variant="primary" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Create New Image
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <Card className="py-20 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">No creations saved yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Head over to the AI Creative Studio or import a spreadsheet to start producing pins.
          </p>
          <div className="pt-2">
            <Link href="/studio">
              <Button size="sm" variant="primary">
                Open AI Studio
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((img, i) => (
            <Card key={i} className="group p-3 flex flex-col justify-between overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 aspect-[2/3] mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-zinc-300 backdrop-blur-md">
                  {img.aspectRatio}
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-200 font-medium line-clamp-2" title={img.prompt}>
                  {img.prompt}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {new Date(img.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/60">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedForPublish(img)}
                    leftIcon={<Share2 className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs"
                  >
                    Publish
                  </Button>
                  <button
                    onClick={() => handleDownload(img)}
                    className="p-2 rounded-xl border border-zinc-700/80 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Download HD Image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Publish Modal for historical item */}
      {selectedForPublish && (
        <QuickPublishModal
          isOpen={Boolean(selectedForPublish)}
          onClose={() => setSelectedForPublish(null)}
          imageUrl={selectedForPublish.imageUrl}
          initialPrompt={selectedForPublish.prompt}
        />
      )}
    </div>
  );
}
