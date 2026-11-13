/**
 * Utility to strip watermarks from AI-generated images.
 * Uses our server-side Jimp cropping engine via /api/ai/clean-image
 * to ensure 100% watermark-free images with zero CORS taint issues.
 */
export async function removeWatermark(
  imageUrl: string,
  targetWidth?: number,
  targetHeight?: number
): Promise<string> {
  if (!imageUrl) return '';

  // If already a clean local/data/blob URL, return as is
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:') || imageUrl.startsWith('/api/ai/clean-image')) {
    return imageUrl;
  }

  const w = targetWidth || 896;
  const h = targetHeight || 1344;

  // Return server-side clean image endpoint
  return `/api/ai/clean-image?url=${encodeURIComponent(imageUrl)}&width=${w}&height=${h}`;
}

/**
 * Preloads an image into the browser's decoded image cache.
 * Resolves once the image is completely loaded into memory.
 * If the primary URL fails, attempts the fallbackUrl.
 * Includes a safety timeout so it never hangs indefinitely.
 */
export function preloadImage(
  primaryUrl: string,
  fallbackUrl?: string,
  timeoutMs = 30000
): Promise<string> {
  if (typeof window === 'undefined' || !primaryUrl) {
    return Promise.resolve(primaryUrl || '');
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (finalUrl: string) => {
      if (!settled) {
        settled = true;
        resolve(finalUrl);
      }
    };

    const timer = setTimeout(() => {
      finish(primaryUrl);
    }, timeoutMs);

    const img = new window.Image();
    img.onload = () => {
      clearTimeout(timer);
      finish(primaryUrl);
    };
    img.onerror = () => {
      if (fallbackUrl && fallbackUrl !== primaryUrl) {
        const fallbackImg = new window.Image();
        fallbackImg.onload = () => {
          clearTimeout(timer);
          finish(fallbackUrl);
        };
        fallbackImg.onerror = () => {
          clearTimeout(timer);
          finish(primaryUrl);
        };
        fallbackImg.src = fallbackUrl;
      } else {
        clearTimeout(timer);
        finish(primaryUrl);
      }
    };
    img.src = primaryUrl;
  });
}

