import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collectionService } from '../services/collectionService';
import { FrameCard } from '../components/cards/FrameCard';
import { Lightbox } from '../components/ui/Lightbox';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Layers, Calendar, User } from 'lucide-react';
import { formatDate } from '../lib/utils';

export function CollectionDetailPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await collectionService.getCollectionById(id);
      setCollection(data);
    }
    load();
    window.scrollTo(0, 0);
  }, [id]);

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-muted">
        <Layers className="w-8 h-8 animate-pulse text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full space-y-12">
      {/* Back Button */}
      <div className="pb-4 border-b border-line">
        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> All Collections
        </Link>
      </div>

      {/* Collection Header Banner */}
      <div className="space-y-4 max-w-3xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
          Album • {collection.frames?.length || collection.count} Frames
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
          {collection.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          {collection.description}
        </p>

        <div className="flex items-center gap-3 pt-2 text-xs text-muted">
          <Link
            to={`/u/${collection.author?.username}`}
            className="flex items-center gap-2 hover:text-ink transition-colors"
          >
            <img
              src={collection.author?.avatar}
              alt={collection.author?.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-medium">{collection.author?.name}</span>
          </Link>
          <span>•</span>
          <span>Curated {formatDate(collection.curatedAt)}</span>
        </div>
      </div>

      {/* Frames Grid inside Collection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collection.frames?.map((frame) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            onOpenLightbox={(f) => setActiveLightboxFrame(f)}
          />
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={!!activeLightboxFrame}
        onClose={() => setActiveLightboxFrame(null)}
        currentFrame={activeLightboxFrame}
      />
    </div>
  );
}

