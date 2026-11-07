import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoodChip } from '../ui/MoodChip';
import { formatDate } from '../../lib/utils';
import { Quote, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { thoughtService } from '../../services/thoughtService';
import { useQueryClient } from '@tanstack/react-query';

export function ThoughtCard({ thought, onDeleteSuccess }) {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner =
    currentUser &&
    thought.author &&
    (currentUser._id === thought.author._id ||
      currentUser.username === thought.author.username ||
      currentUser.role === 'admin');

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this reflection from the living journal?'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await thoughtService.deleteThought(thought.id || thought._id);
      showToast('Reflection gently lifted from the journal', 'info');
      queryClient.invalidateQueries({ queryKey: ['thoughts'] });
      if (onDeleteSuccess) onDeleteSuccess(thought.id || thought._id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete reflection', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      style={{ background: thought.background }}
      className="p-6 rounded-card border border-line shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between gap-4 backdrop-blur-sm relative overflow-hidden group"
    >
      {/* Decorative subtle quotation watermark */}
      <Quote className="absolute right-3 top-3 w-12 h-12 text-ink/5 pointer-events-none transition-transform duration-500 group-hover:scale-110" />

      {/* Header with Mood Chip & Delete Button for Owner */}
      <div className="flex items-center justify-between z-10">
        <MoodChip mood={thought.mood} size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted font-mono">
            {formatDate(thought.createdAt)}
          </span>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 rounded-full text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-accent"
              title="Delete this thought"
              aria-label="Delete this thought"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
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
            src={thought.author?.avatar || '/images/honey.jpg'}
            alt={thought.author?.name || 'Author'}
            onError={(e) => {
              e.target.src = '/images/honey.jpg';
            }}
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
