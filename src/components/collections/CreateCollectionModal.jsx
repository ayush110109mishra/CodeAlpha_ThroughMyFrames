import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { frameService } from '../../services/frameService';
import { collectionService } from '../../services/collectionService';
import { useToast } from '../ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

export function CreateCollectionModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState('');
  const [userFrames, setUserFrames] = useState([]);
  const [isLoadingFrames, setIsLoadingFrames] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    async function loadUserFrames() {
      setIsLoadingFrames(true);
      try {
        const frames = await frameService.getFrames({ author: user.username });
        setUserFrames(frames || []);
        if (frames && frames.length > 0) {
          setSelectedCover(frames[0].image);
        }
      } catch (err) {
        console.warn('Could not load user frames for collection cover:', err);
      } finally {
        setIsLoadingFrames(false);
      }
    }

    loadUserFrames();
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a collection title', 'error');
      return;
    }

    const coverUrl = selectedCover || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

    setIsSubmitting(true);
    try {
      const newCol = await collectionService.createCollection({
        title: title.trim(),
        description: description.trim(),
        cover: coverUrl,
      });

      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showToast('Curated collection created', 'success');
      onClose();
      if (onSuccess) onSuccess(newCol);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create collection', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative w-full max-w-lg bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-warm-lg z-10 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Curate New Album
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink">
              Create Collection
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
          {/* Title */}
          <div>
            <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-1.5">
              Collection Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Whispers of the High Pass"
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A few words on the aesthetic spirit and stillness binding these frames..."
              className="w-full p-3.5 bg-bg border border-line rounded-2xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Cover Picker from own frames */}
          <div>
            <label className="text-2xs uppercase font-mono tracking-wider text-muted block mb-2">
              Select Cover from Your Frames
            </label>

            {isLoadingFrames ? (
              <div className="h-24 rounded-2xl bg-bg/50 animate-pulse border border-line flex items-center justify-center text-xs text-muted">
                Loading your photographs...
              </div>
            ) : userFrames.length === 0 ? (
              <div className="p-4 rounded-2xl bg-bg border border-line text-center space-y-2">
                <ImageIcon className="w-6 h-6 text-muted mx-auto" />
                <p className="text-xs text-muted">
                  You haven't published any frames yet. A scenic editorial cover will be used.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 max-h-36 overflow-y-auto p-1 border border-line rounded-2xl bg-bg">
                {userFrames.map((frame) => {
                  const isSelected = selectedCover === frame.image;
                  return (
                    <button
                      key={frame.id || frame._id}
                      type="button"
                      onClick={() => setSelectedCover(frame.image)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-accent shadow-warm-md scale-95'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={frame.image}
                        alt={frame.moment}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-accent/30 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
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
              disabled={!title.trim()}
            >
              Create Collection
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
