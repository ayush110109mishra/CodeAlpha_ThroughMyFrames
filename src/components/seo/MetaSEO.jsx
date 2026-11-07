import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * ==============================================================================
 * MetaSEO Component
 * ==============================================================================
 * Manages document head metadata dynamically per route for SEO, Open Graph,
 * and Twitter Card rich sharing previews.
 */

const DEFAULT_TITLE = 'Through My Frames 2.0 — Photos. Places. Thoughts.';
const DEFAULT_DESC =
  'A quiet, curious art-journal and 3D gallery where people explore photographs, places, reflections, and thoughts.';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';

export function MetaSEO({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  path = '',
  article = false,
}) {
  const fullTitle = title
    ? `${title} | Through My Frames 2.0`
    : DEFAULT_TITLE;

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${path}`
    : `https://through-my-frames.vercel.app${path}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
