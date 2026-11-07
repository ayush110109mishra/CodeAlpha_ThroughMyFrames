import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collectionService } from '../services/collectionService';
import { FrameCard } from '../components/cards/FrameCard';
import { Lightbox } from '../components/ui/Lightbox';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Layers, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { MetaSEO } from '../components/seo/MetaSEO';

export function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [collection, setCollection] = useState(null);
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await collectionService.getCollectionById(id);
        setCollection(data);
      } catch (err) {
        showToast('Collection could not be found', 'error');
        navigate('/collections');
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const isOwner =
    currentUser &&
    collection?.author &&
    (currentUser._id === collection.author._id ||
      currentUser.username === collection.author.username ||
      currentUser.role === 'admin');

  const handleDeleteCollection = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this collection album? The photographs inside will remain intact in their respective galleries.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await collectionService.deleteCollection(collection.id || collection._id);
      showToast('Collection album deleted', 'info');
      navigate('/collections');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete collection', 'error');
      setIsDeleting(false);
    }
  };

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-muted">
        <Layers className="w-8 h-8 animate-pulse text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full space-y-12">
      <MetaSEO
        title={`${collection.title} — Curated Collection`}
        description={collection.description || `Curated album featuring ${collection.frames?.length || collection.count} moments.`}
        image={collection.cover}
        path={`/collections/${id}`}
      />

      {/* Back Button & Actions */}
      <div className="pb-4 border-b border-line flex items-center justify-between">
        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> All Collections
        </Link>

        {isOwner && (
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            isLoading={isDeleting}
            onClick={handleDeleteCollection}
          >
            Delete Collection
          </Button>
        )}
      </div>

      {/* Collection Header Banner */}
      <div className="space-y-4 max-w-3xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
          Album • {collection.frames?.length || collection.count || 0} Frames
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
            {collection.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2 text-xs text-muted">
          <Link
            to={`/u/${collection.author?.username}`}
            className="flex items-center gap-2 hover:text-ink transition-colors"
          >
            <img
              src={collection.author?.avatar || '/images/honey.jpg'}
              alt={collection.author?.name || 'Author'}
              onError={(e) => {
                e.target.src = '/images/honey.jpg';
              }}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-medium">{collection.author?.name}</span>
          </Link>
          <span>•</span>
          <span>Curated {formatDate(collection.curatedAt || collection.createdAt)}</span>
        </div>
      </div>

      {/* Frames Grid inside Collection */}
      {collection.frames?.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-line rounded-3xl p-8 space-y-2">
          <p className="text-xs text-muted">
            This collection has no photographs yet. Explore the gallery to add frames to this album.
          </p>
          <Link to="/explore">
            <Button variant="secondary" size="sm">
              Explore Frames
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.frames?.map((frame) => (
            <FrameCard
              key={frame.id || frame._id}
              frame={frame}
              onOpenLightbox={(f) => setActiveLightboxFrame(f)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={!!activeLightboxFrame}
        onClose={() => setActiveLightboxFrame(null)}
        currentFrame={activeLightboxFrame}
      />
    </div>
  );
}
