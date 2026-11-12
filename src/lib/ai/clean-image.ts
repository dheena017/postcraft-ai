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

  const w = targetWidth || 1000;
  const h = targetHeight || 1500;

  // Return server-side clean image endpoint
  return `/api/ai/clean-image?url=${encodeURIComponent(imageUrl)}&width=${w}&height=${h}`;
}
