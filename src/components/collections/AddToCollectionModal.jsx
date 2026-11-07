import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Check, Plus, Layers, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { collectionService } from '../../services/collectionService';
import { useToast } from '../ui/Toast';
import { CreateCollectionModal } from './CreateCollectionModal';

export function AddToCollectionModal({ isOpen, onClose, frame }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const frameId = frame ? frame.id || frame._id : null;

  const loadCollections = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await collectionService.getCollections({ author: user.username });
      setCollections(data || []);
    } catch (err) {
      console.warn('Could not load user collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen, user]);

  const handleToggle = async (collection) => {
    if (!frameId) return;

    const colId = collection.id || collection._id;
    setTogglingId(colId);

    try {
      const res = await collectionService.toggleFrame(colId, frameId);
      showToast(res.message || 'Collection updated', 'success');

      // Update local collection frame list
      setCollections((prev) =>
        prev.map((c) => {
          if ((c.id || c._id) === colId) {
            const hasFrame = c.frames?.some((f) => (f.id || f._id || f) === frameId);
            return {
              ...c,
              frames: hasFrame
                ? c.frames.filter((f) => (f.id || f._id || f) !== frameId)
                : [...(c.frames || []), frameId],
            };
          }
          return c;
        })
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update collection', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
          className="relative w-full max-w-md bg-surface border border-line rounded-3xl p-6 sm:p-7 shadow-warm-lg z-10 space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div className="space-y-0.5">
              <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5" /> Curate Albums
              </span>
              <h3 className="font-serif text-xl font-medium text-ink">
                Add to Collection
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

          {/* List of user's collections */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span>Opening your albums...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <Layers className="w-8 h-8 text-muted mx-auto" />
              <p className="text-xs text-muted max-w-xs mx-auto">
                You haven't created any collections yet. Curate your first album to organize your favorite moments.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setCreateModalOpen(true)}
              >
                Create First Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {collections.map((col) => {
                const colId = col.id || col._id;
                const isSelected = col.frames?.some(
                  (f) =>
                    (typeof f === 'string' && f === frameId) ||
                    (f && (f.id === frameId || f._id === frameId))
                ) || col.frameIds?.includes(frame.customId || frameId);
                const isToggling = togglingId === colId;

                return (
                  <button
                    key={colId}
                    type="button"
                    onClick={() => handleToggle(col)}
                    disabled={isToggling}
                    className="w-full p-3 rounded-2xl bg-bg border border-line hover:border-accent/40 flex items-center justify-between transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={col.cover}
                        alt={col.title}
                        className="w-10 h-10 rounded-xl object-cover border border-line shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-serif font-medium text-ink group-hover:text-accent transition-colors">
                          {col.title}
                        </h4>
                        <span className="text-[10px] font-mono text-muted">
                          {col.frames?.length || col.count || 0} frames
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-accent border-accent text-white'
                          : 'border-line text-transparent group-hover:border-accent/40'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Bottom create new collection trigger */}
          {collections.length > 0 && (
            <div className="pt-3 border-t border-line flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={() => setCreateModalOpen(true)}
              >
                New Collection
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Nested Create Collection Modal */}
      <CreateCollectionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          loadCollections();
        }}
      />
    </>
  );
}
