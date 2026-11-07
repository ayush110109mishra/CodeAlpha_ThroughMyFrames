/**
 * ==============================================================================
 * Cloudinary Delivery URL Optimizer
 * ==============================================================================
 * WHY OPTIMIZATION MATTERS:
 * Raw high-resolution photography can easily exceed 5MB - 10MB per image.
 * Cloudinary allows on-the-fly transformations via URL parameters:
 * - `f_auto`: Automatically serves next-gen formats (AVIF, WebP) based on browser support.
 * - `q_auto`: Strips invisible color metadata while preserving crisp visual fidelity.
 * - `w_<width>,c_limit`: Scales image down to fit card/screen boundaries, avoiding massive downloads.
 */

export function getOptimizedImageUrl(url, { width = 1200, quality = 'auto', format = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return '/images/placeholder.jpg';

  // If this is a Cloudinary URL, inject transformations
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transformation = `f_${format},q_${quality},w_${width},c_limit`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  // If this is an Unsplash URL, adapt Unsplash query parameters
  if (url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=format&fit=crop&w=${width}&q=80`;
  }

  // Local assets (e.g. /images/...) are returned as-is
  return url;
}
