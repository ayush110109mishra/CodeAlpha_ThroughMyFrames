import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { frameService } from '../services/frameService';
import { thoughtService } from '../services/thoughtService';
import { Button } from '../components/ui/Button';
import { MoodChip } from '../components/ui/MoodChip';
import { Shuffle, ArrowLeft, MapPin, Sparkles, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaSEO } from '../components/seo/MetaSEO';
import { getOptimizedImageUrl } from '../lib/cloudinary';

export function MomentPage() {
  const [currentMoment, setCurrentMoment] = useState(null);
  const [isThought, setIsThought] = useState(false);
  const [isTodayMoment, setIsTodayMoment] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load: Fetch deterministic Moment of the Day from GET /api/moment/today
  useEffect(() => {
    async function loadTodayMoment() {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/moment/today');
        const payload = response.data || response;
        if (payload && payload.data) {
          setCurrentMoment(payload.data);
          setIsThought(Boolean(payload.isThought));
          setIsTodayMoment(true);
        } else {
          // Fallback to random frame if endpoint payload structure differs
          fetchAnotherMoment();
        }
      } catch (err) {
        console.warn('Could not fetch moment of today, falling back to random:', err);
        fetchAnotherMoment();
      } finally {
        setIsLoading(false);
      }
    }

    loadTodayMoment();
  }, []);

  // "Another moment" uses /api/frames/random
  const fetchAnotherMoment = async () => {
    setIsLoading(true);
    setIsTodayMoment(false);
    try {
      const pickFrame = Math.random() > 0.25;
      if (pickFrame) {
        const frame = await frameService.getRandomFrame(currentMoment?.id);
        setCurrentMoment(frame);
        setIsThought(false);
      } else {
        const thought = await thoughtService.getRandomThought(currentMoment?.id);
        setCurrentMoment(thought);
        setIsThought(true);
      }
    } catch (err) {
      console.error('Error fetching random moment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const photoUrl = currentMoment?.image
    ? getOptimizedImageUrl(currentMoment.image, { width: 1200 })
    : null;

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full select-none overflow-hidden">
      <MetaSEO
        title={isTodayMoment ? 'Moment of the Day' : 'Serendipity & Moments'}
        description="A deterministic daily contemplation chosen for all wanderers across the globe."
        path="/moment"
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-6 border-b border-line z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>

        <div className="flex items-center gap-3">
          {isTodayMoment && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
              <Calendar className="w-3.5 h-3.5" /> Moment of the Day
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={Shuffle}
            onClick={fetchAnotherMoment}
            isLoading={isLoading}
          >
            Another Moment
          </Button>
        </div>
      </div>

      {/* Main Full-Screen Display Area */}
      <div className="my-auto py-8 sm:py-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentMoment && (
            <motion.div
              key={currentMoment.id || currentMoment._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl flex flex-col items-center text-center space-y-8"
            >
              {/* Mood Chip & Meta */}
              <div className="flex items-center gap-2">
                <MoodChip mood={currentMoment.mood} size="md" />
                {!isThought && currentMoment.location && (
                  <span className="inline-flex items-center gap-1 text-2xs px-3 py-1 rounded-pill bg-surface border border-line text-muted font-medium">
                    <MapPin className="w-3 h-3 text-accent" />
                    {currentMoment.location}
                  </span>
                )}
                {isTodayMoment && (
                  <span className="sm:hidden inline-flex items-center gap-1 text-2xs px-2.5 py-0.5 rounded-pill bg-accent/15 text-accent font-mono uppercase tracking-wider font-semibold">
                    Today's Pick
                  </span>
                )}
              </div>

              {/* Large Photograph if frame */}
              {!isThought && (
                <div className="relative w-full max-h-[50vh] sm:max-h-[58vh] rounded-3xl overflow-hidden border border-line bg-surface shadow-warm-lg flex items-center justify-center">
                  <img
                    src={photoUrl || currentMoment.image}
                    alt={currentMoment.moment || 'Moment'}
                    onError={(e) => {
                      const rawUrl = currentMoment.image;
                      const fallback = currentMoment.fallbackImage || '/images/placeholder.jpg';
                      if (rawUrl && e.target.src !== rawUrl && rawUrl !== fallback) {
                        e.target.src = rawUrl;
                      } else if (e.target.src !== fallback) {
                        e.target.src = fallback;
                      }
                    }}
                    className="w-full h-auto max-h-[55vh] object-contain"
                  />
                </div>
              )}

              {/* Caption or Thought Text in Large Handwritten / Serif Font */}
              <div className="max-w-2xl px-4 space-y-3">
                <p
                  className={
                    isThought
                      ? 'font-serif text-2xl sm:text-4xl text-ink leading-relaxed font-normal italic'
                      : 'font-handwritten text-3xl sm:text-5xl text-ink leading-relaxed'
                  }
                >
                  "{isThought ? currentMoment.text : currentMoment.moment}"
                </p>

                {/* Author attribution */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                  <img
                    src={currentMoment.author?.avatar || '/images/honey.jpg'}
                    alt={currentMoment.author?.name || 'Author'}
                    onError={(e) => {
                      e.target.src = '/images/honey.jpg';
                    }}
                    className="w-5 h-5 rounded-full object-cover border border-line"
                  />
                  <span>{currentMoment.author?.name}</span>
                </div>
              </div>

              {/* Inspect Frame Button if photo */}
              {!isThought && (
                <Link to={`/frame/${currentMoment.id || currentMoment._id}`}>
                  <Button variant="outline" size="sm" iconRight={Eye}>
                    Inspect Frame Details
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-2xs text-muted font-mono z-20">
        {isTodayMoment
          ? 'This moment is held constant throughout today for all visitors worldwide.'
          : 'Press "Another Moment" to let serendipity guide your gaze.'}
      </div>
    </div>
  );
}
