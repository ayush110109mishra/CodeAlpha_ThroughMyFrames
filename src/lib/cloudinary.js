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

  // If this is a Cloudinary URL, replace any existing transformations and apply requested optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transformation = `f_${format},q_${quality},w_${width},c_limit`;

    const uploadIndex = url.indexOf('/upload/');
    const prefix = url.substring(0, uploadIndex + '/upload/'.length);
    const rest = url.substring(uploadIndex + '/upload/'.length);

    // If rest has a version tag (e.g., /upload/[existing_transform/]?v12345/folder/photo.jpg),
    // replace any existing transformation segment before the version tag
    const versionMatch = rest.match(/(?:^|\/)(v\d+\/.+)$/);
    if (versionMatch) {
      return `${prefix}${transformation}/${versionMatch[1]}`;
    }

    // If no version tag, discard existing transformation segments (key_value tokens like c_limit, w_800)
    const segments = rest.split('/');
    let assetIndex = 0;
    while (
      assetIndex < segments.length &&
      /^(?:[a-z]{1,4}_[a-zA-Z0-9_-]+,?)+$/.test(segments[assetIndex])
    ) {
      assetIndex++;
    }
    const assetPath = segments.slice(assetIndex).join('/');
    return `${prefix}${transformation}/${assetPath}`;
  }

  // If this is an Unsplash URL, adapt Unsplash query parameters
  if (url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=format&fit=crop&w=${width}&q=80`;
  }

  // Local assets (e.g. /images/...) are returned as-is
  return url;
}
