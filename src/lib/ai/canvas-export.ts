import {
  PinOverlayConfig,
  CanvasFilterPreset,
  ImageAdjustments,
  PinStickerConfig,
} from '@/types/image';

export function getFilterString(filter?: CanvasFilterPreset, adj?: ImageAdjustments): string {
  const parts: string[] = [];

  // Adjustments
  const b = 100 + (adj?.brightness ?? 0);
  const c = 100 + (adj?.contrast ?? 0);
  const s = 100 + (adj?.saturation ?? 0);
  if (b !== 100) parts.push(`brightness(${b}%)`);
  if (c !== 100) parts.push(`contrast(${c}%)`);
  if (s !== 100) parts.push(`saturate(${s}%)`);
  if (adj?.warmth) {
    if (adj.warmth > 0) {
      parts.push(`sepia(${adj.warmth * 0.4}%)`);
    } else {
      parts.push(`hue-rotate(${Math.abs(adj.warmth) * 0.4}deg)`);
    }
  }

  // Preset Filters
  switch (filter) {
    case 'warm-sun':
      parts.push('sepia(20%) saturate(125%) contrast(105%) brightness(102%)');
      break;
    case 'moody-noir':
      parts.push('contrast(135%) brightness(92%) saturate(80%)');
      break;
    case 'pastel-bloom':
      parts.push('brightness(108%) contrast(95%) saturate(118%)');
      break;
    case 'vibrant-pop':
      parts.push('saturate(145%) contrast(112%) brightness(102%)');
      break;
    case 'vintage-film':
      parts.push('sepia(32%) contrast(108%) brightness(96%) saturate(90%)');
      break;
    case 'cyber-neon':
      parts.push('hue-rotate(20deg) contrast(125%) saturate(135%)');
      break;
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

export interface ExportPinOptions {
  overlay?: PinOverlayConfig;
  filter?: CanvasFilterPreset;
  adjustments?: ImageAdjustments;
  stickers?: PinStickerConfig;
  targetWidth?: number;
  targetHeight?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  scale?: number;
}

/**
 * Draws the source image, aesthetic filters, stickers, and typography overlay onto a canvas,
 * returning a high-resolution Data URL.
 */
export async function exportCompositePin(
  imageUrl: string,
  optionsOrOverlay: PinOverlayConfig | ExportPinOptions,
  legacyWidth: number = 1000,
  legacyHeight: number = 1500
): Promise<string> {
  // Normalize arguments
  const options: ExportPinOptions =
    'enabled' in optionsOrOverlay
      ? {
          overlay: optionsOrOverlay,
          targetWidth: legacyWidth,
          targetHeight: legacyHeight,
          format: 'image/jpeg',
          scale: 1,
        }
      : optionsOrOverlay;

  const baseWidth = options.targetWidth || 1000;
  const baseHeight = options.targetHeight || 1500;
  const scale = options.scale || 1;
  const targetWidth = baseWidth * scale;
  const targetHeight = baseHeight * scale;
  const format = options.format || 'image/jpeg';
  const overlay = options.overlay;
  const filterStr = getFilterString(options.filter, options.adjustments);
  const stickers = options.stickers;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      // Apply CSS filter to image drawing if present
      if (filterStr && filterStr !== 'none') {
        try {
          ctx.filter = filterStr;
        } catch {
          // ignore if filter not supported
        }
      }

      // Draw base image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      ctx.filter = 'none'; // reset filter for overlays & stickers

      // 1. Draw Stickers
      if (stickers) {
        // Save Badge
        if (stickers.showSaveBadge) {
          const badgeW = 96 * scale;
          const badgeH = 38 * scale;
          const badgeX = 28 * scale;
          const badgeY = 28 * scale;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 19 * scale);

          if (stickers.saveBadgeTheme === 'white') {
            ctx.fillStyle = '#ffffff';
          } else if (stickers.saveBadgeTheme === 'glass') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          } else if (stickers.saveBadgeTheme === 'dark') {
            ctx.fillStyle = '#09090b';
          } else {
            ctx.fillStyle = '#e60023'; // Pinterest Brand Red
          }
          ctx.fill();

          ctx.fillStyle = stickers.saveBadgeTheme === 'white' ? '#18181b' : '#ffffff';
          ctx.font = `bold ${15 * scale}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Save', badgeX + badgeW / 2, badgeY + badgeH / 2);
          ctx.restore();
        }

        // CTA Badge
        if (stickers.ctaBadge?.enabled && stickers.ctaBadge.text.trim()) {
          const text = stickers.ctaBadge.text.trim();
          ctx.save();
          ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`;
          const metrics = ctx.measureText(text);
          const ctaW = metrics.width + 36 * scale;
          const ctaH = 36 * scale;

          let ctaX = 28 * scale;
          let ctaY = targetHeight - ctaH - 28 * scale;

          if (stickers.ctaBadge.position === 'top-right') {
            ctaX = targetWidth - ctaW - 28 * scale;
            ctaY = 28 * scale;
          } else if (stickers.ctaBadge.position === 'bottom-right') {
            ctaX = targetWidth - ctaW - 28 * scale;
            ctaY = targetHeight - ctaH - 28 * scale;
          } else if (stickers.ctaBadge.position === 'top-left') {
            ctaX = 28 * scale;
            ctaY = 28 * scale;
          }

          ctx.beginPath();
          ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 18 * scale);
          ctx.fillStyle = 'rgba(24, 24, 27, 0.88)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, ctaX + ctaW / 2, ctaY + ctaH / 2);
          ctx.restore();
        }

        // Price Tag
        if (stickers.priceTag?.enabled && stickers.priceTag.text.trim()) {
          const priceText = stickers.priceTag.text.trim();
          ctx.save();
          ctx.font = `900 ${16 * scale}px system-ui, -apple-system, sans-serif`;
          const metrics = ctx.measureText(priceText);
          const tagW = metrics.width + 26 * scale;
          const tagH = 34 * scale;

          let tagX = targetWidth - tagW - 28 * scale;
          let tagY = 28 * scale;
          if (stickers.priceTag.position === 'bottom-right') {
            tagY = targetHeight - tagH - 28 * scale;
          } else if (stickers.priceTag.position === 'bottom-left') {
            tagX = 28 * scale;
            tagY = targetHeight - tagH - 28 * scale;
          } else if (stickers.priceTag.position === 'top-left') {
            tagX = 28 * scale;
            tagY = 28 * scale;
          }

          ctx.beginPath();
          ctx.roundRect(tagX, tagY, tagW, tagH, 8 * scale);
          ctx.fillStyle = '#10b981'; // Emerald
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(priceText, tagX + tagW / 2, tagY + tagH / 2);
          ctx.restore();
        }

        // Creator Watermark / Handle
        if (stickers.watermark?.enabled && stickers.watermark.text.trim()) {
          ctx.save();
          const handle = stickers.watermark.text.trim();
          ctx.font = `600 ${12 * scale}px monospace`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(handle, targetWidth / 2, targetHeight - 12 * scale);
          ctx.restore();
        }
      }

      // 2. Draw Typography Overlay Card
      if (overlay && overlay.enabled && overlay.headline?.trim()) {
        const headline = overlay.headline.trim();
        const subtext = (overlay.subtext || '').trim();

        const cardWidth = targetWidth * 0.88;
        const cardX = (targetWidth - cardWidth) / 2;
        const padding = targetWidth * 0.04;
        const estimatedHeight = subtext ? targetWidth * 0.22 : targetWidth * 0.16;

        let cardY = targetHeight * 0.06;
        if (overlay.position === 'center') {
          cardY = (targetHeight - estimatedHeight) / 2;
        } else if (overlay.position === 'bottom') {
          cardY = targetHeight - estimatedHeight - targetHeight * 0.06;
        }

        ctx.save();
        const radius = 18 * scale;

        if (overlay.theme === 'bold-banner') {
          ctx.fillStyle = '#e60023';
        } else if (overlay.theme === 'minimal-light') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        } else if (overlay.theme === 'minimal-dark') {
          ctx.fillStyle = 'rgba(15, 15, 18, 0.96)';
        } else if (overlay.theme === 'editorial') {
          ctx.fillStyle = 'rgba(28, 25, 23, 0.92)';
        } else {
          ctx.fillStyle = 'rgba(10, 10, 12, 0.80)';
        }

        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, estimatedHeight, radius);
        ctx.fill();

        if (overlay.theme === 'editorial') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 3 * scale;
          ctx.stroke();
        } else if (overlay.theme === 'minimal-light') {
          ctx.strokeStyle = 'rgba(220, 220, 225, 0.8)';
          ctx.lineWidth = 2 * scale;
          ctx.stroke();
        } else if (overlay.theme !== 'bold-banner') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2 * scale;
          ctx.stroke();
        }

        let textColor = '#ffffff';
        let subColor = 'rgba(255, 255, 255, 0.75)';
        let fontFace = 'system-ui, -apple-system, sans-serif';

        if (overlay.theme === 'minimal-light') {
          textColor = '#18181b';
          subColor = '#52525b';
        } else if (overlay.theme === 'editorial') {
          textColor = '#fef3c7';
          subColor = '#fcd34d';
          fontFace = 'Georgia, serif';
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const headlineFontSize = Math.round(targetWidth * 0.046);
        ctx.font = `bold ${headlineFontSize}px ${fontFace}`;
        ctx.fillStyle = textColor;

        const textCenterY = subtext
          ? cardY + padding + headlineFontSize * 0.7
          : cardY + estimatedHeight / 2;

        ctx.fillText(headline, targetWidth / 2, textCenterY, cardWidth - padding * 2);

        if (subtext) {
          const subFontSize = Math.round(targetWidth * 0.026);
          ctx.font = `600 ${subFontSize}px ${fontFace}`;
          ctx.fillStyle = subColor;
          const subY = textCenterY + headlineFontSize * 0.9 + subFontSize * 0.5;
          ctx.fillText(subtext.toUpperCase(), targetWidth / 2, subY, cardWidth - padding * 2);
        }

        ctx.restore();
      }

      const quality = format === 'image/png' ? undefined : 0.95;
      resolve(canvas.toDataURL(format, quality));
    };

    img.onerror = () => {
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}
