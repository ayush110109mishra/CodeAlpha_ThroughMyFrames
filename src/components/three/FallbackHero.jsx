import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

export function FallbackHero({ featuredFrames = [] }) {
  const collageFrames = featuredFrames.slice(0, 4);

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-soft/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative 2D Floating Cards */}
      <div className="relative w-full max-w-5xl h-[420px] sm:h-[480px] my-4 flex items-center justify-center">
        {collageFrames.map((frame, index) => {
          const positions = [
            { x: -180, y: -40, rotate: -6, zIndex: 10, scale: 0.9 },
            { x: 190, y: -20, rotate: 7, zIndex: 20, scale: 0.95 },
            { x: -90, y: 80, rotate: 4, zIndex: 30, scale: 0.92 },
            { x: 100, y: 90, rotate: -5, zIndex: 25, scale: 0.88 },
          ];
          const pos = positions[index] || positions[0];

          return (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: 1,
                y: [pos.y, pos.y - 8, pos.y],
                rotate: [pos.rotate, pos.rotate + 1, pos.rotate],
              }}
              transition={{
                y: { duration: 4 + index, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 5 + index, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.6, delay: index * 0.15 },
              }}
              className="absolute w-52 sm:w-64 bg-surface p-2.5 rounded-card border border-line shadow-warm-lg"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`,
                zIndex: pos.zIndex,
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-bg">
                <img
                  src={frame.image}
                  alt={frame.moment}
                  onError={(e) => {
                    const fallback = frame.fallbackImage || '/images/placeholder.jpg';
                    if (e.target.src !== fallback) {
                      e.target.src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-handwritten text-xs text-ink/80 mt-2 line-clamp-1">
                "{frame.moment}"
              </p>
            </motion.div>
          );
        })}

        {/* Hero Center Overlay Content */}
        <div className="relative z-40 text-center max-w-xl px-4 py-8 rounded-2xl glass-panel shadow-warm-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold mb-3">
              <Sparkles className="w-3 h-3" /> Through My Frames 2.0
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-ink mb-3 leading-tight">
              Photos. Places. Thoughts.
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6 font-sans">
              A quiet, curious art-journal and immersive living space where light meets memory.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/explore">
                <Button size="md" variant="primary" iconRight={ArrowRight}>
                  Enter the Gallery
                </Button>
              </Link>
              <Link to="/wander">
                <Button size="md" variant="secondary" icon={Compass}>
                  Wander Journeys
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

