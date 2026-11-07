import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, MapPin, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { MoodChip } from '../ui/MoodChip';
import { MOODS, CATEGORIES } from '../../lib/constants';
import { apiClient } from '../../services/api';
import { useToast } from '../ui/Toast';

export function EditFrameModal({ isOpen, onClose, frame, onUpdateSuccess }) {
  const { showToast } = useToast();

  const [moment, setMoment] = useState('');
  const [mood, setMood] = useState('Calm');
  const [category, setCategory] = useState('Travel');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (frame && isOpen) {
      setMoment(frame.moment || '');
      setMood(frame.mood || 'Calm');
      setCategory(frame.category || 'Travel');
      setLocation(frame.location || '');
    }
  }, [frame, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moment.trim()) {
      showToast('Moment caption cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const frameId = frame.id || frame._id;
      const res = await apiClient.put(`/frames/${frameId}`, {
        moment: moment.trim(),
        mood,
        category,
        location: location.trim(),
      });

      const updated = res.data || res;
      showToast('Photograph details updated', 'success');
      onClose();
      if (onUpdateSuccess) onUpdateSuccess(updated);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update frame', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !frame) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.95, y: 12 }}
        className="relative w-full max-w-lg bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-warm-lg z-10 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Curator Controls
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink">
              Edit Frame Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Moment / Caption */}
          <div>
            <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-1.5">
              Moment Caption (max 280 characters) *
            </label>
            <textarea
              rows={3}
              maxLength={280}
              required
              value={moment}
              onChange={(e) => setMoment(e.target.value)}
              placeholder="The memory or contemplative note attached to this view..."
              className="w-full p-3.5 bg-bg border border-line rounded-2xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-[11px] font-mono text-muted">
                {moment.length} / 280
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-2xs uppercase font-mono tracking-wider text-muted flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kyoto, Japan"
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>

          {/* Mood Selection */}
          <div>
            <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-2">
              Resonating Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.filter((m) => m !== 'All').map((m) => (
                <MoodChip
                  key={m}
                  mood={m}
                  active={mood === m}
                  onClick={() => setMood(m)}
                />
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-2xs uppercase font-mono tracking-wider text-muted flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-accent" /> Category
            </label>
            <div className="flex flex-wrap gap-2">
              {['Travel', 'Street', 'Nature', 'Sky', 'Portrait', 'Thoughts'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium border transition-all ${
                    category === cat
                      ? 'bg-ink text-surface border-ink shadow-warm-sm'
                      : 'bg-bg text-muted border-line hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-line">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!moment.trim()}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
