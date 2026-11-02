import React from 'react';
import { MOODS, CATEGORIES } from '../../lib/constants';
import { MoodChip } from './MoodChip';
import { Search, Shuffle, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export function FilterBar({
  selectedMood,
  onSelectMood,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSurpriseMe,
  viewMode,
  onToggleViewMode,
  showViewToggle = true,
}) {
  return (
    <div className="w-full space-y-4">
      {/* Top row: Search input + Surprise Me + 3D/Grid View toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search frames, locations, thoughts..."
            className="w-full pl-10 pr-9 py-2.5 bg-surface border border-line rounded-pill text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-warm-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onSurpriseMe && (
            <Button
              variant="secondary"
              size="sm"
              icon={Shuffle}
              onClick={onSurpriseMe}
              title="Pick a random frame"
            >
              Surprise me
            </Button>
          )}

          {showViewToggle && onToggleViewMode && (
            <div className="flex items-center p-1 bg-surface border border-line rounded-pill shadow-warm-sm">
              <button
                type="button"
                onClick={() => onToggleViewMode('3d')}
                className={cn(
                  'px-3 py-1 rounded-pill text-2xs font-medium transition-all',
                  viewMode === '3d'
                    ? 'bg-accent text-white shadow-warm-sm'
                    : 'text-muted hover:text-ink'
                )}
              >
                3D Wall
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('grid')}
                className={cn(
                  'px-3 py-1 rounded-pill text-2xs font-medium transition-all',
                  viewMode === 'grid'
                    ? 'bg-accent text-white shadow-warm-sm'
                    : 'text-muted hover:text-ink'
                )}
              >
                Masonry Grid
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mood filter chips row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
        <span className="text-2xs uppercase tracking-wider text-muted font-medium mr-1 shrink-0">
          Mood:
        </span>
        {MOODS.map((mood) => (
          <MoodChip
            key={mood}
            mood={mood}
            active={selectedMood === mood}
            onClick={() => onSelectMood(mood)}
          />
        ))}
      </div>

      {/* Category selector row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-2xs uppercase tracking-wider text-muted font-medium mr-1 shrink-0">
          Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-pill font-medium transition-colors shrink-0 text-2xs border',
                isActive
                  ? 'bg-ink text-surface border-ink'
                  : 'bg-transparent text-muted border-transparent hover:text-ink hover:border-line'
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

