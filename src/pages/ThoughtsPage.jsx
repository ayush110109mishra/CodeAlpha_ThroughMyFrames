import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { thoughtService } from '../services/thoughtService';
import { ThoughtCard } from '../components/cards/ThoughtCard';
import { MoodChip } from '../components/ui/MoodChip';
import { Button } from '../components/ui/Button';
import { MOODS } from '../lib/constants';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Feather, AlertCircle, Palette } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { MetaSEO } from '../components/seo/MetaSEO';
import { motion, AnimatePresence } from 'framer-motion';

const THOUGHT_BACKGROUNDS = [
  {
    id: 'terracotta-dawn',
    name: 'Terracotta Dawn',
    value: 'linear-gradient(135deg, rgba(194, 105, 62, 0.12) 0%, rgba(233, 201, 168, 0.22) 100%)',
    preview: '#EED9C4',
  },
  {
    id: 'warm-parchment',
    name: 'Warm Parchment',
    value: 'linear-gradient(135deg, rgba(245, 240, 230, 0.8) 0%, rgba(235, 227, 214, 0.9) 100%)',
    preview: '#F0ECE1',
  },
  {
    id: 'dusty-sand',
    name: 'Dusty Sand',
    value: 'linear-gradient(135deg, rgba(210, 195, 175, 0.25) 0%, rgba(240, 230, 215, 0.35) 100%)',
    preview: '#DDD2C3',
  },
  {
    id: 'olive-mist',
    name: 'Olive Mist',
    value: 'linear-gradient(135deg, rgba(110, 125, 105, 0.12) 0%, rgba(160, 175, 155, 0.2) 100%)',
    preview: '#CFD7CA',
  },
  {
    id: 'night-whisper',
    name: 'Night Whisper',
    value: 'linear-gradient(135deg, rgba(40, 45, 55, 0.1) 0%, rgba(70, 75, 88, 0.18) 100%)',
    preview: '#C8CDD5',
  },
];

export function ThoughtsPage() {
  const [selectedMood, setSelectedMood] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newMood, setNewMood] = useState('Calm');
  const [newBackground, setNewBackground] = useState(THOUGHT_BACKGROUNDS[0].value);
  const [newTags, setNewTags] = useState('Meditation, Slow Living');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // TanStack Query for caching and asynchronous fetch lifecycle
  const {
    data: thoughts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['thoughts', selectedMood],
    queryFn: () => thoughtService.getThoughts({ mood: selectedMood }),
    retry: 1,
  });

  const handleOpenWriteModal = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to pen a reflection into the living journal', 'info');
      return;
    }
    setModalOpen(true);
  };

  const handleCreateThought = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setIsSubmitting(true);
    try {
      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await thoughtService.createThought({
        text: newText.trim(),
        mood: newMood,
        background: newBackground,
        tags: tagsArray,
      });

      queryClient.invalidateQueries({ queryKey: ['thoughts'] });
      setModalOpen(false);
      setNewText('');
      showToast('Your thought has been gently placed into the journal', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not post thought', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-12">
      <MetaSEO
        title="Living Thoughts — Reflections & Musings"
        description="Short writings, quiet epiphanies, and margin notes gathered along roadsides, railway sleepers, and midnight balconies."
        path="/thoughts"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-line">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
            <Feather className="w-3.5 h-3.5" /> Slow Observations & Musings
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
            Living Thoughts
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
            Short writings, quiet epiphanies, and margin notes gathered along roadsides, railway sleepers, and midnight balconies.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenWriteModal}
          className="shrink-0"
        >
          Write a Thought
        </Button>
      </div>

      {/* Mood Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {MOODS.map((mood) => (
          <MoodChip
            key={mood}
            mood={mood}
            active={selectedMood === mood}
            onClick={() => setSelectedMood(mood)}
          />
        ))}
      </div>

      {/* Thoughts Feed */}
      {isError ? (
        <div className="text-center py-16 bg-surface border border-red-500/20 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-ink">Unable to Load Thoughts</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              {error?.response?.data?.message || 'Could not connect to the backend server.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Connection
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-48 rounded-card bg-surface/50 border border-line animate-pulse"
            />
          ))}
        </div>
      ) : thoughts.length === 0 ? (
        <EmptyState
          title="No reflections under this mood"
          description="Be the first wanderer to pin a meditative observation into this mood channel."
          actionText="Write a Thought"
          onAction={handleOpenWriteModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {thoughts.map((thought) => (
            <ThoughtCard key={thought.id || thought._id} thought={thought} />
          ))}
        </div>
      )}

      {/* Modal: Write a Thought */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-warm-lg z-10 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div className="space-y-1">
                  <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold">
                    New Entry
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink">
                    Write a Thought
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full text-muted hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateThought} className="space-y-4">
                {/* Textarea with 500 Char Counter */}
                <div>
                  <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-1">
                    Your reflection (max 500 characters)
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="What did you notice today when you stopped hurrying?"
                    className="w-full p-3.5 bg-bg border border-line rounded-2xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-muted italic">
                      Take your time. A sentence is enough.
                    </span>
                    <span
                      className={`text-[11px] font-mono ${
                        newText.length > 450 ? 'text-amber-500 font-semibold' : 'text-muted'
                      }`}
                    >
                      {newText.length} / 500
                    </span>
                  </div>
                </div>

                {/* Background Presets Palette */}
                <div>
                  <label className="text-2xs uppercase font-mono tracking-wider text-muted flex items-center gap-1.5 mb-2">
                    <Palette className="w-3.5 h-3.5 text-accent" />
                    Background Palette
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {THOUGHT_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setNewBackground(bg.value)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all text-center ${
                          newBackground === bg.value
                            ? 'border-accent shadow-warm-sm scale-105'
                            : 'border-line hover:border-ink/30'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: bg.preview }}
                        />
                        <span className="text-[10px] text-muted truncate w-full">
                          {bg.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Chips */}
                <div>
                  <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-2">
                    Resonating Mood
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.filter((m) => m !== 'All').map((m) => (
                      <MoodChip
                        key={m}
                        mood={m}
                        active={newMood === m}
                        onClick={() => setNewMood(m)}
                      />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Stillness, Architecture, River"
                    className="w-full px-3.5 py-2 bg-bg border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-line">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmitting}
                    disabled={!newText.trim()}
                  >
                    Post to Journal
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
