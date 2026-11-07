import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FilterBar } from '../components/ui/FilterBar';
import { FrameCard } from '../components/cards/FrameCard';
import { Lightbox } from '../components/ui/Lightbox';
import { EmptyState } from '../components/ui/EmptyState';
import { FrameCardSkeleton } from '../components/ui/SkeletonLoader';
import { Button } from '../components/ui/Button';
import { frameService } from '../services/frameService';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, AlertCircle, Users, Compass, LogIn, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { MetaSEO } from '../components/seo/MetaSEO';

// Lazy-load Three.js 3D Gallery Canvas to isolate bundle weight
const GalleryCanvas = lazy(() =>
  import('../components/three/GalleryCanvas').then((m) => ({ default: m.GalleryCanvas }))
);

const PAGE_SIZE = 12;

export function ExplorePage() {
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [feedMode, setFeedMode] = useState('all'); // 'all' | 'following'
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Reset pagination when filter criteria change
  useEffect(() => {
    setPage(1);
    setFrames([]);
    setHasMore(true);
  }, [selectedMood, selectedCategory, searchQuery, feedMode]);

  // Fetch frames for current page & filters
  useEffect(() => {
    let isCurrent = true;

    async function loadFrames() {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setIsError(false);

      try {
        const data = await frameService.getFrames({
          mood: selectedMood,
          category: selectedCategory,
          search: searchQuery,
          feed: feedMode === 'following' ? 'following' : undefined,
          page,
          limit: PAGE_SIZE,
        });

        if (!isCurrent) return;

        const newBatch = Array.isArray(data) ? data : [];
        if (page === 1) {
          setFrames(newBatch);
        } else {
          setFrames((prev) => {
            // Deduplicate by ID
            const existingIds = new Set(prev.map((f) => f.id || f._id));
            const uniqueIncoming = newBatch.filter((f) => !existingIds.has(f.id || f._id));
            return [...prev, ...uniqueIncoming];
          });
        }

        // If returned items are fewer than PAGE_SIZE, no further pages exist
        setHasMore(newBatch.length === PAGE_SIZE);
      } catch (err) {
        if (!isCurrent) return;
        setIsError(true);
        setErrorMessage(
          err.response?.data?.message ||
            'Could not connect to the backend API. Please make sure the server is running on port 5000.'
        );
      } finally {
        if (isCurrent) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    // Skip fetch if viewing following feed while unauthenticated
    if (feedMode === 'following' && !isAuthenticated) {
      setIsLoading(false);
      setFrames([]);
      return;
    }

    loadFrames();

    return () => {
      isCurrent = false;
    };
  }, [selectedMood, selectedCategory, searchQuery, feedMode, page, isAuthenticated]);

  const handleSurpriseMe = async () => {
    const random = await frameService.getRandomFrame();
    if (random) {
      navigate(`/frame/${random.id || random._id}`);
    }
  };

  const handleResetFilters = () => {
    setSelectedMood('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setFeedMode('all');
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-8">
      <MetaSEO
        title="Explore Frames — Living Discovery Gallery"
        description="Filter photographs by mood, camera perspectives, and places visited across quiet horizons."
        path="/explore"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Discovery Wall
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
            Explore Frames
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl font-sans">
            Filter by state of mind, camera perspectives, or places visited across quiet horizons.
          </p>
        </div>

        {/* Feed Switcher: All vs Following */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-pill border border-line shadow-warm-sm self-start md:self-auto">
          <button
            onClick={() => setFeedMode('all')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all',
              feedMode === 'all'
                ? 'bg-ink text-surface shadow-warm-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            <Compass className="w-3.5 h-3.5" /> All Frames
          </button>
          <button
            onClick={() => setFeedMode('following')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all',
              feedMode === 'following'
                ? 'bg-ink text-surface shadow-warm-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            <Users className="w-3.5 h-3.5" /> Following
          </button>
        </div>
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

      {/* Unauthenticated Following Feed Prompt */}
      {feedMode === 'following' && !isAuthenticated ? (
        <div className="text-center py-16 bg-surface border border-line rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-ink">Sign in to view your following feed</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Follow fellow photographers and wanderers to curate a calm, chronological stream of their latest captures.
            </p>
          </div>
          <Link to="/login?redirect=/explore">
            <Button variant="primary" size="md" icon={LogIn}>
              Sign In
            </Button>
          </Link>
        </div>
      ) : isError ? (
        /* Clear Error State with Retry Button */
        <div className="text-center py-16 bg-surface border border-red-500/20 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-ink">Unable to Load Gallery</h3>
            <p className="text-xs text-muted max-w-md mx-auto">{errorMessage}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPage(1);
            }}
          >
            Retry Connection
          </Button>
        </div>
      ) : isLoading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <FrameCardSkeleton key={i} />
          ))}
        </div>
      ) : frames.length === 0 ? (
        <EmptyState
          title={
            feedMode === 'following'
              ? 'No frames from photographers you follow'
              : 'No frames match your exploration'
          }
          description={
            feedMode === 'following'
              ? 'Start exploring public journals and tap Follow on wanderers whose perspectives inspire you.'
              : 'Try selecting a different mood, clearing the search query, or resetting filters.'
          }
          actionText={feedMode === 'following' ? 'Explore All Frames' : 'Reset All Filters'}
          onAction={handleResetFilters}
        />
      ) : viewMode === '3d' && !isMobile ? (
        <Suspense
          fallback={
            <div className="h-96 rounded-3xl bg-surface border border-line flex items-center justify-center text-muted text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          }
        >
          <div className="space-y-4">
            <GalleryCanvas frames={frames} />
            <p className="text-2xs text-muted font-mono text-center">
              Click and drag to rotate. Scroll to zoom. Click any frame to inspect details.
            </p>
          </div>
        </Suspense>
      ) : (
        <div className="space-y-12">
          {/* Grid of frames */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {frames.map((frame, index) => (
              <FrameCard
                key={frame.id || frame._id}
                frame={frame}
                priority={index < 3}
                onOpenLightbox={(f) => setActiveLightboxFrame(f)}
              />
            ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                size="md"
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
                iconRight={ChevronDown}
              >
                Load More Frames
              </Button>
            </div>
          )}

          {!hasMore && frames.length > 0 && (
            <p className="text-center text-2xs font-mono text-muted py-4">
              You have reached the end of the current horizon.
            </p>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={!!activeLightboxFrame}
        onClose={() => setActiveLightboxFrame(null)}
        currentFrame={activeLightboxFrame}
      />
    </div>
  );
}
