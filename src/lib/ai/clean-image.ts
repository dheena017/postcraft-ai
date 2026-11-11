/**
 * Utility to strip watermarks from AI-generated images.
 * Uses an off-screen HTML5 Canvas to crop the bottom watermark bar added by external providers.
 */
export async function removeWatermark(
  imageUrl: string,
  targetWidth?: number,
  targetHeight?: number
): Promise<string> {
  if (typeof window === 'undefined' || !imageUrl) {
    return imageUrl;
  }

  // If already a clean data URL or blob URL, return as is
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Timeout safety fallback
    const timer = setTimeout(() => {
      resolve(imageUrl);
    }, 8000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        // Pollinations places its logo in the bottom ~38-42px.
        // We crop out the bottom 42px.
        const cropBottom = Math.max(42, Math.round(origH * 0.035));
        const outW = targetWidth || origW;
        const outH = targetHeight || (origH - cropBottom);

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Draw and crop off the bottom watermark area
        ctx.drawImage(
          img,
          0,
          0,
          origW,
          origH - cropBottom,
          0,
          0,
          outW,
          outH
        );

        const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(cleanDataUrl);
      } catch (err) {
        console.warn('Canvas watermark crop failed:', err);
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}

