import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collectionService } from '../services/collectionService';
import { CollectionCard } from '../components/cards/CollectionCard';
import { Button } from '../components/ui/Button';
import { Layers, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { CreateCollectionModal } from '../components/collections/CreateCollectionModal';
import { MetaSEO } from '../components/seo/MetaSEO';

export function CollectionsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const {
    data: collections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionService.getCollections(),
    retry: 1,
  });

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to curate a new collection', 'info');
      return;
    }
    setCreateModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-12">
      <MetaSEO
        title="Curated Collections — Thematic Albums"
        description="Thematic groupings of photographs bound by emotional resonance, color palette, and geological stillness."
        path="/collections"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-line">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
            <Layers className="w-3.5 h-3.5" /> Curated Albums
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
            Collections
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
            Thematic groupings of frames bound by emotional resonance, color palette, and geological stillness.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenCreateModal}
          className="shrink-0"
        >
          Create Collection
        </Button>
      </div>

      {/* Error state */}
      {isError ? (
        <div className="text-center py-16 bg-surface border border-red-500/20 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-ink">Unable to Load Collections</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              {error?.response?.data?.message || 'Could not connect to the backend server.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Connection
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-surface/50 border border-line animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-line rounded-3xl p-8 space-y-3">
          <p className="text-xs text-muted">No curated albums found.</p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
            Curate First Collection
          </Button>
        </div>
      ) : (
        /* Collections Grid with Stack Hover Effect */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {collections.map((col) => (
            <CollectionCard key={col.id || col._id} collection={col} />
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
