import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';

export function Lightbox({ isOpen, onClose, currentFrame, onPrev, onNext, total, currentIndex }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !currentFrame) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/80 z-20">
          <div className="flex items-center gap-3 text-xs tracking-wider">
            {total && (
              <span className="font-mono bg-white/10 px-3 py-1 rounded-pill">
                {(currentIndex ?? 0) + 1} / {total}
              </span>
            )}
            {currentFrame.location && (
              <span className="inline-flex items-center gap-1.5 opacity-80">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                {currentFrame.location}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close lightbox (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Button */}
        {onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-20 hidden sm:flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Previous frame"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-20 hidden sm:flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Next frame"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Main Content Modal */}
        <motion.div
          key={currentFrame.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative max-w-5xl max-h-[85vh] flex flex-col items-center z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Framed Image */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black max-h-[72vh] flex items-center justify-center border border-white/10">
            <img
              src={currentFrame.image}
              alt={currentFrame.moment || 'Frame'}
              onError={(e) => {
                const fallback = currentFrame.fallbackImage || '/images/placeholder.jpg';
                if (e.target.src !== fallback) {
                  e.target.src = fallback;
                }
              }}
              className="max-h-[72vh] w-auto object-contain select-none"
            />
          </div>

          {/* Caption / Moment in handwritten style */}
          {currentFrame.moment && (
            <div className="mt-4 text-center max-w-2xl px-4">
              <p className="font-handwritten text-xl sm:text-2xl text-white/95 leading-relaxed drop-shadow-md">
                "{currentFrame.moment}"
              </p>
              <div className="flex items-center justify-center gap-3 mt-2 text-2xs text-white/60">
                <span className="text-accent font-medium">{currentFrame.mood}</span>
                <span>•</span>
                <span>{currentFrame.author?.name}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

