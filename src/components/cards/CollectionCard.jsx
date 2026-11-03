import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';

export function CollectionCard({ collection }) {
  const [imgSrc, setImgSrc] = useState(collection.cover);

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group block"
    >
      <div className="relative pt-4 px-2">
        {/* Layer 3 (Deepest back layer) */}
        <div className="absolute inset-x-5 top-0 bottom-4 bg-line/80 dark:bg-line/40 rounded-card -rotate-3 transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:-translate-y-2" />

        {/* Layer 2 (Middle layer) */}
        <div className="absolute inset-x-3.5 top-2 bottom-2 bg-surface/90 border border-line rounded-card rotate-2 transition-transform duration-500 ease-out group-hover:rotate-4 group-hover:-translate-y-1 shadow-warm-sm" />

        {/* Layer 1 (Front Card) */}
        <div className="relative bg-surface rounded-card border border-line overflow-hidden shadow-warm-md transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <div className="relative aspect-[4/3] overflow-hidden bg-bg/40">
            <img
              src={imgSrc}
              alt={collection.title}
              onError={() => {
                const fallback = collection.fallbackImage || '/images/placeholder.jpg';
                if (imgSrc !== fallback) {
                  setImgSrc(fallback);
                }
              }}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                <Layers className="w-3.5 h-3.5 text-accent" />
                {collection.frameIds?.length || collection.count} Frames
              </span>
            </div>
          </div>

          <div className="p-4 bg-surface">
            <h3 className="font-serif text-lg font-medium text-ink group-hover:text-accent transition-colors">
              {collection.title}
            </h3>
            <p className="text-2xs text-muted mt-1 line-clamp-2 leading-relaxed">
              {collection.description}
            </p>

            <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-2xs">
              <div className="flex items-center gap-2">
                <img
                  src={collection.author?.avatar}
                  alt={collection.author?.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-muted font-medium">
                  {collection.author?.name}
                </span>
              </div>
              <span className="text-accent inline-flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
                Open Album <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

