import React, { useState, useEffect } from 'react';
import { collectionService } from '../services/collectionService';
import { CollectionCard } from '../components/cards/CollectionCard';
import { Layers, Sparkles } from 'lucide-react';

export function CollectionsPage() {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    async function loadCollections() {
      const data = await collectionService.getCollections();
      setCollections(data);
    }
    loadCollections()
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-12">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-line">
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

      {/* Collections Grid with Stack Hover Effect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {collections.map((col) => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </div>
  );
}

