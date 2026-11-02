import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles, Compass, Moon, Heart, Feather } from 'lucide-react';

const moodIcons = {
  Calm: Feather,
  Nostalgic: Moon,
  Wanderlust: Compass,
  Curious: Sparkles,
  Grateful: Heart,
};

export function MoodChip({ mood, active = false, onClick, className, size = 'sm' }) {
  const Icon = moodIcons[mood] || Sparkles;

  const sizeStyles = {
    sm: 'text-2xs px-3 py-1 gap-1.5',
    md: 'text-xs px-4 py-1.5 gap-2',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-pill font-medium transition-all duration-200 border',
        active
          ? 'bg-accent text-white border-accent shadow-warm-sm scale-105'
          : 'bg-surface/80 text-muted border-line hover:border-accent hover:text-ink hover:bg-surface',
        sizeStyles[size],
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{mood}</span>
    </button>
  );
}

