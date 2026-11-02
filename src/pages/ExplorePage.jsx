import React, { useState, useEffect, useMemo } from 'react';
import { FilterBar } from '../components/ui/FilterBar';
import { FrameCard } from '../components/cards/FrameCard';
import { GalleryCanvas } from '../components/three/GalleryCanvas';
import { Lightbox } from '../components/ui/Lightbox';
import { EmptyState } from '../components/ui/EmptyState';
import { FrameCardSkeleton } from '../components/ui/SkeletonLoader';
import { frameService } from '../services/frameService';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera } from 'lucide-react';

export function ExplorePage() {
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // Default to grid on initial, user can toggle 3D wall
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFrames() {
      setIsLoading(true);
      const data = await frameService.getFrames({
        mood: selectedMood,
        category: selectedCategory,
        search: searchQuery,
      });
      setFrames(data);
      setIsLoading(false);
    }

    fetchFrames();
  }, [selectedMood, selectedCategory, searchQuery]);

  const handleSurpriseMe = async () => {
    const random = await frameService.getRandomFrame();
    if (random) {
      navigate(`/frame/${random.id}`);
    }
  };

  const handleResetFilters = () => {
    setSelectedMood('All');
    setSelectedCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Discovery Wall
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
          Explore Frames
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xl">
          Filter by state of mind, camera perspectives, or places visited across quiet horizons.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-surface/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-line shadow-warm-sm">
        <FilterBar
          selectedMood={selectedMood}
          onSelectMood={setSelectedMood}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSurpriseMe={handleSurpriseMe}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          showViewToggle={!isMobile}
        />
      </div>

      {/* Content Rendering: 3D Wall vs Masonry Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <FrameCardSkeleton key={i} />
          ))}
        </div>
      ) : frames.length === 0 ? (
        <EmptyState
          title="No frames match your exploration"
          description="Try selecting a different mood, clearing the search query, or resetting filters."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : viewMode === '3d' && !isMobile ? (
        <div className="space-y-4">
          <GalleryCanvas frames={frames} />
        </div>
      ) : (
        <div className="masonry-grid">
          {frames.map((frame) => (
            <div key={frame.id} className="masonry-item">
              <FrameCard
                frame={frame}
                onOpenLightbox={(f) => setActiveLightboxFrame(f)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for inspecting high resolution photos */}
      <Lightbox
        isOpen={!!activeLightboxFrame}
        onClose={() => setActiveLightboxFrame(null)}
        currentFrame={activeLightboxFrame}
        total={frames.length}
        currentIndex={frames.findIndex((f) => f.id === activeLightboxFrame?.id)}
        onPrev={() => {
          const idx = frames.findIndex((f) => f.id === activeLightboxFrame?.id);
          const prevIdx = (idx - 1 + frames.length) % frames.length;
          setActiveLightboxFrame(frames[prevIdx]);
        }}
        onNext={() => {
          const idx = frames.findIndex((f) => f.id === activeLightboxFrame?.id);
          const nextIdx = (idx + 1) % frames.length;
          setActiveLightboxFrame(frames[nextIdx]);
        }}
      />
    </div>
  );
}

