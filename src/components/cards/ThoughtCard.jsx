import React from 'react';
import { Link } from 'react-router-dom';
import { MoodChip } from '../ui/MoodChip';
import { formatDate } from '../../lib/utils';
import { Quote } from 'lucide-react';

export function ThoughtCard({ thought }) {
  return (
    <article
      style={{ background: thought.background }}
      className="p-6 rounded-card border border-line shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between gap-4 backdrop-blur-sm relative overflow-hidden group"
    >
      {/* Decorative subtle quotation watermark */}
      <Quote className="absolute right-3 top-3 w-12 h-12 text-ink/5 pointer-events-none transition-transform duration-500 group-hover:scale-110" />

      {/* Header with Mood Chip */}
      <div className="flex items-center justify-between z-10">
        <MoodChip mood={thought.mood} size="sm" />
        <span className="text-[11px] text-muted font-mono">
          {formatDate(thought.createdAt)}
        </span>
      </div>

      {/* Thought Content */}
      <div className="z-10 my-1">
        <p className="font-serif text-base sm:text-lg text-ink leading-relaxed font-normal">
          "{thought.text}"
        </p>
      </div>

      {/* Tags if any */}
      {thought.tags && thought.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 z-10">
          {thought.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-pill bg-surface/70 text-muted border border-line/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Footer */}
      <div className="pt-3 border-t border-line/50 flex items-center justify-between z-10">
        <Link
          to={`/u/${thought.author?.username}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src={thought.author?.avatar}
            alt={thought.author?.name}
            className="w-6 h-6 rounded-full object-cover border border-line"
          />
          <div className="flex flex-col">
            <span className="text-2xs font-medium text-ink">
              {thought.author?.name}
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}

