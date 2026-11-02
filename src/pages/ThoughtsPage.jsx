import React, { useState, useEffect } from 'react';
import { thoughtService } from '../services/thoughtService';
import { ThoughtCard } from '../components/cards/ThoughtCard';
import { MoodChip } from '../components/ui/MoodChip';
import { Button } from '../components/ui/Button';
import { MOODS } from '../lib/constants';
import { useToast } from '../components/ui/Toast';
import { Quote, Plus, X, Sparkles, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThoughtsPage() {
  const [thoughts, setThoughts] = useState([]);
  const [selectedMood, setSelectedMood] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newMood, setNewMood] = useState('Calm');
  const [newTags, setNewTags] = useState('Meditation, Slow Living');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadThoughts() {
      const data = await thoughtService.getThoughts({ mood: selectedMood });
      setThoughts(data);
    }
    loadThoughts();
  }, [selectedMood]);

  const handleCreateThought = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setIsSubmitting(true);
    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const created = await thoughtService.createThought({
      text: newText.trim(),
      mood: newMood,
      tags: tagsArray,
    });

    setThoughts((prev) => [created, ...prev]);
    setIsSubmitting(false);
    setModalOpen(false);
    setNewText('');
    showToast('Your thought has been gently placed into the journal', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-12">
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
          onClick={() => setModalOpen(true)}
          className="shrink-0"
        >
          Write a Thought
        </Button>
      </div>

      {/* Mood Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-2xs uppercase tracking-wider text-muted font-mono font-medium mr-1 shrink-0">
          State:
        </span>
        {MOODS.map((mood) => (
          <MoodChip
            key={mood}
            mood={mood}
            active={selectedMood === mood}
            onClick={() => setSelectedMood(mood)}
          />
        ))}
      </div>

      {/* Masonry Layout for Text Cards */}
      <div className="masonry-grid">
        {thoughts.map((thought) => (
          <div key={thought.id} className="masonry-item">
            <ThoughtCard thought={thought} />
          </div>
        ))}
      </div>

      {/* "Write a Thought" Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-warm-lg z-10 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div className="flex items-center gap-2 text-ink">
                  <Feather className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-lg font-medium">
                    Write a Thought
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full text-muted hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateThought} className="space-y-4">
                {/* Textarea */}
                <div>
                  <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-1">
                    Your reflection (max 280 chars)
                  </label>
                  <textarea
                    rows={4}
                    maxLength={280}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="What did you notice today when you stopped hurrying?"
                    className="w-full p-3.5 bg-bg border border-line rounded-2xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[11px] font-mono text-muted">
                      {newText.length} / 280
                    </span>
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

