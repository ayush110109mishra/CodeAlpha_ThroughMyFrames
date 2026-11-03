import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Bookmark, MapPin, MessageCircle } from 'lucide-react';
import { MoodChip } from '../ui/MoodChip';
import { frameService } from '../../services/frameService';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';

export function FrameCard({ frame, onOpenLightbox, priority = false }) {
  const [isLiked, setIsLiked] = useState(frame.isLiked || false);
  const [likesCount, setLikesCount] = useState(frame.likes || 0);
  const [isSaved, setIsSaved] = useState(frame.isSaved || false);
  const [imgSrc, setImgSrc] = useState(frame.image);
  const { showToast } = useToast();

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    await frameService.toggleLike(frame.id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    await frameService.toggleSave(frame.id);
    showToast(nextState ? 'Frame saved to collection' : 'Frame removed from saved', 'info');
  };

  const handleImageError = () => {
    const fallback = frame.fallbackImage || '/images/placeholder.jpg';
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <article className="group bg-surface rounded-card border border-line overflow-hidden photo-frame flex flex-col transition-all duration-300">
      {/* Frame Visual Area */}
      <div
        data-cursor="view"
        className="relative overflow-hidden bg-bg/50 cursor-pointer"
        onClick={() => {
          if (onOpenLightbox) {
            onOpenLightbox(frame);
          }
        }}
      >
        <Link to={`/frame/${frame.id}`} className="block">
          <img
            src={imgSrc}
            alt={frame.moment || `Photograph from ${frame.location}`}
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="pointer-events-auto">
            <MoodChip mood={frame.mood} size="sm" />
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={handleSave}
              className={cn(
                'p-2 rounded-full backdrop-blur-md transition-all',
                isSaved
                  ? 'bg-accent text-white shadow-warm-sm'
                  : 'bg-black/30 hover:bg-black/50 text-white/90'
              )}
              aria-label={isSaved ? 'Unsave frame' : 'Save frame'}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Location pill */}
        {frame.location && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-black/40 backdrop-blur-md text-white text-[11px] font-medium tracking-wide">
              <MapPin className="w-3 h-3 text-accent" />
              {frame.location}
            </span>
          </div>
        )}
      </div>

      {/* Frame Details & Moment */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-surface">
        {/* Moment handwritten excerpt */}
        <Link to={`/frame/${frame.id}`} className="block group-hover:text-accent transition-colors">
          <p className="font-handwritten text-lg sm:text-xl text-ink leading-snug line-clamp-2">
            "{frame.moment}"
          </p>
        </Link>

        {/* Footer Meta Row: Author, Likes, Comments */}
        <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs">
          <Link
            to={`/u/${frame.author?.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={frame.author?.avatar}
              alt={frame.author?.name}
              className="w-6 h-6 rounded-full object-cover border border-line"
            />
            <span className="text-[12px] font-medium text-ink truncate max-w-[110px]">
              {frame.author?.name}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-muted">
            {/* Like button with pop */}
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1 transition-colors text-[11px]',
                isLiked ? 'text-accent font-semibold' : 'hover:text-accent'
              )}
              aria-label="Like frame"
            >
              <Heart
                className="w-3.5 h-3.5"
                fill={isLiked ? 'currentColor' : 'none'}
              />
              <span>{likesCount}</span>
            </motion.button>

            {/* Comment count link */}
            <Link
              to={`/frame/${frame.id}#comments`}
              className="flex items-center gap-1 hover:text-accent transition-colors text-[11px]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{frame.comments?.length || 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

