import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { frameService } from '../services/frameService';
import { MoodChip } from '../components/ui/MoodChip';
import { Button } from '../components/ui/Button';
import { Lightbox } from '../components/ui/Lightbox';
import { CommentBox, CommentItem } from '../components/ui/CommentBox';
import { FrameCard } from '../components/cards/FrameCard';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { formatDate } from '../lib/utils';
import {
  Heart,
  Bookmark,
  Share2,
  MapPin,
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Aperture,
  Sliders,
  Calendar,
  Trash2,
  FolderPlus,
  Edit3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { EditFrameModal } from '../components/frames/EditFrameModal';
import { AddToCollectionModal } from '../components/collections/AddToCollectionModal';
import { MetaSEO } from '../components/seo/MetaSEO';

export function FrameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [frame, setFrame] = useState(null);
  const [allFrames, setAllFrames] = useState([]);
  const [authorFrames, setAuthorFrames] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingFrame, setIsDeletingFrame] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  useEffect(() => {
    async function loadFrame() {
      setIsLoading(true);
      try {
        const data = await frameService.getFrameById(id);
        if (!data) {
          navigate('/explore');
          return;
        }
        setFrame(data);
        setIsLiked(Boolean(data.likedByMe || data.isLiked));
        setLikesCount(data.likesCount || data.likes || 0);
        setIsSaved(Boolean(data.savedByMe || data.isSaved));

        // Load comments
        if (data.comments && Array.isArray(data.comments)) {
          setComments(data.comments);
        } else {
          const comms = await frameService.getComments(id);
          setComments(comms || []);
        }

        // Load more frames
        const all = await frameService.getFrames();
        setAllFrames(all || []);
        const authorUsername = data.author?.username;
        if (all && authorUsername) {
          const more = all.filter(
            (f) =>
              f.author?.username === authorUsername &&
              f.id !== id &&
              f._id !== id
          );
          setAuthorFrames(more.slice(0, 3));
        }
      } catch (err) {
        showToast('Could not load frame details', 'error');
        navigate('/explore');
      } finally {
        setIsLoading(false);
      }
    }

    loadFrame();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to record your appreciation', 'info');
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likesCount;
    const nextState = !previousLiked;

    setIsLiked(nextState);
    setLikesCount(nextState ? previousCount + 1 : Math.max(0, previousCount - 1));

    try {
      const res = await frameService.toggleLike(frame.id || frame._id);
      if (typeof res?.likesCount === 'number') {
        setLikesCount(res.likesCount);
      }
    } catch (err) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      showToast('Could not register like', 'error');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to bookmark frames', 'info');
      return;
    }

    const previousSaved = isSaved;
    const nextState = !previousSaved;
    setIsSaved(nextState);

    try {
      await frameService.toggleSave(frame.id || frame._id);
      showToast(nextState ? 'Saved to your collection' : 'Removed from collection', 'info');
    } catch (err) {
      setIsSaved(previousSaved);
      showToast('Could not update saved frame', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Frame link copied to clipboard', 'success');
    }
  };

  const handleAddComment = async (text) => {
    try {
      const newComment = await frameService.addComment(frame.id || frame._id, {
        content: text,
      });
      setComments((prev) => [newComment, ...prev]);
      showToast('Reflection shared', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not post reflection', 'error');
    }
  };

  const handleDeleteComment = async (commentToDelete) => {
    if (!window.confirm('Are you sure you want to delete this reflection?')) return;
    try {
      await frameService.deleteComment(commentToDelete._id || commentToDelete.id);
      setComments((prev) =>
        prev.filter(
          (c) =>
            (c._id && c._id !== commentToDelete._id) ||
            (c.id && c.id !== commentToDelete.id)
        )
      );
      showToast('Reflection removed', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete reflection', 'error');
    }
  };

  const handleDeleteFrame = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this photograph and its reflections? This action cannot be undone.'
    );
    if (!confirmed) return;

    setIsDeletingFrame(true);
    try {
      await frameService.deleteFrame(frame.id || frame._id);
      showToast('Frame deleted from the gallery', 'info');
      navigate('/explore');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete frame', 'error');
      setIsDeletingFrame(false);
    }
  };

  const isOwner =
    currentUser &&
    frame?.author &&
    (currentUser._id === frame.author._id ||
      currentUser.username === frame.author.username ||
      currentUser.role === 'admin');

  // Keyboard navigation for Prev/Next
  const currentIndex = allFrames.findIndex((f) => f.id === id || f._id === id);
  const prevFrame = currentIndex > 0 ? allFrames[currentIndex - 1] : allFrames[allFrames.length - 1];
  const nextFrame =
    currentIndex < allFrames.length - 1 ? allFrames[currentIndex + 1] : allFrames[0];

  if (isLoading || !frame) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-muted">
        <Aperture className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const optimizedPhotoUrl = getOptimizedImageUrl(frame.image, { width: 1400 });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full space-y-12">
      {/* Top Breadcrumb & Next/Prev Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>

        <div className="flex items-center gap-2">
          {prevFrame && (
            <Link
              to={`/frame/${prevFrame.id || prevFrame._id}`}
              className="p-2 rounded-full border border-line bg-surface hover:text-accent hover:border-accent text-muted transition-colors"
              title="Previous Frame"
              aria-label="Previous Frame"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          {nextFrame && (
            <Link
              to={`/frame/${nextFrame.id || nextFrame._id}`}
              className="p-2 rounded-full border border-line bg-surface hover:text-accent hover:border-accent text-muted transition-colors"
              title="Next Frame"
              aria-label="Next Frame"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Photograph Frame */}
        <div className="lg:col-span-7 space-y-4">
          <div
            data-cursor="view"
            onClick={() => setLightboxOpen(true)}
            className="group relative rounded-3xl overflow-hidden bg-bg/50 border border-line shadow-warm-lg cursor-pointer photo-frame"
          >
            <img
              src={optimizedPhotoUrl}
              alt={frame.moment}
              onError={(e) => {
                const rawUrl = frame.image;
                const fallback = frame.fallbackImage || '/images/placeholder.jpg';
                if (rawUrl && e.target.src !== rawUrl && rawUrl !== fallback) {
                  e.target.src = rawUrl;
                } else if (e.target.src !== fallback) {
                  e.target.src = fallback;
                }
              }}
              className="w-full h-auto max-h-[75vh] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />

            {/* Expand Hover Badge */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                <Maximize2 className="w-3.5 h-3.5" /> Expand Lightbox
              </span>
            </div>

            {/* Top Mood Pill */}
            <div className="absolute top-4 left-4">
              <MoodChip mood={frame.mood} size="md" />
            </div>
          </div>

          {/* Action Ribbon: Like, Save, Share, Delete */}
          <div className="flex items-center justify-between p-3.5 bg-surface rounded-2xl border border-line shadow-warm-sm">
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all ${
                  isLiked
                    ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                    : 'bg-bg text-ink/80 hover:text-accent border border-line'
                }`}
              >
                <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
                <span>{likesCount} Likes</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleSave}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all ${
                  isSaved
                    ? 'bg-accent text-white shadow-warm-sm'
                    : 'bg-bg text-ink/80 hover:text-accent border border-line'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Add to Collection Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Please sign in to add this frame to your collections', 'info');
                    return;
                  }
                  setCollectionModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium bg-bg text-ink/80 hover:text-accent border border-line transition-all"
                title="Add to collection"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Collect</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full border border-line bg-bg text-ink/80 hover:text-accent hover:border-accent transition-colors"
                title="Share link"
                aria-label="Share frame"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Edit Own Frame Button */}
              {isOwner && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="p-2 rounded-full border border-line bg-bg text-ink/80 hover:text-accent hover:border-accent transition-colors"
                  title="Edit frame details"
                  aria-label="Edit frame details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              {/* Delete Own Frame Button */}
              {isOwner && (
                <button
                  onClick={handleDeleteFrame}
                  disabled={isDeletingFrame}
                  className="p-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                  title="Delete this frame"
                  aria-label="Delete this frame"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Moment, Metadata & Reflection Journal */}
        <div className="lg:col-span-5 space-y-8">
          {/* Handwritten Moment Journal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-muted font-semibold">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>{formatDate(frame.createdAt)}</span>
            </div>

            <h1 className="font-handwritten text-3xl sm:text-4xl text-ink leading-relaxed">
              "{frame.moment}"
            </h1>

            {frame.location && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface border border-line text-xs font-medium text-ink">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>{frame.location}</span>
              </div>
            )}
          </div>

          {/* Author Card */}
          <div className="p-4 bg-surface rounded-2xl border border-line shadow-warm-sm flex items-center justify-between">
            <Link
              to={`/u/${frame.author?.username}`}
              className="flex items-center gap-3 group"
            >
              <img
                src={frame.author?.avatar || '/images/honey.jpg'}
                alt={frame.author?.name}
                onError={(e) => {
                  e.target.src = '/images/honey.jpg';
                }}
                className="w-11 h-11 rounded-full object-cover border border-line group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-serif text-sm font-medium text-ink group-hover:text-accent transition-colors block">
                  {frame.author?.name}
                </span>
                <span className="text-2xs font-mono text-muted block">
                  @{frame.author?.username}
                </span>
              </div>
            </Link>

            <Link to={`/u/${frame.author?.username}`}>
              <Button variant="outline" size="sm">
                View Journal
              </Button>
            </Link>
          </div>

          {/* Technical Camera Card */}
          {frame.camera && (
            <div className="p-4 bg-surface rounded-2xl border border-line space-y-3">
              <div className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-muted font-semibold">
                <Sliders className="w-3.5 h-3.5 text-accent" />
                <span>Camera & Exposure</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-2xs text-muted block">Camera</span>
                  <span className="font-medium text-ink">{frame.camera.body || 'Mobile'}</span>
                </div>
                <div>
                  <span className="text-2xs text-muted block">Lens</span>
                  <span className="font-medium text-ink">{frame.camera.lens || 'Wide'}</span>
                </div>
                <div>
                  <span className="text-2xs text-muted block">Settings</span>
                  <span className="font-medium text-ink">
                    {frame.camera.settings || frame.camera.aperture || 'Natural Light'}
                  </span>
                </div>
                <div>
                  <span className="text-2xs text-muted block">Aspect</span>
                  <span className="font-medium text-ink">{frame.aspectRatio || '16/9'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Comments / Reflections Section */}
          <div id="comments" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-ink">
                Reflections ({comments.length})
              </h3>
            </div>

            <CommentBox onSubmit={handleAddComment} />

            <div className="space-y-1 divide-y divide-line/40">
              {comments.length === 0 ? (
                <p className="text-xs text-muted py-4 text-center">
                  No reflections shared yet. Be the first to leave a thought.
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment._id || comment.id}
                    comment={comment}
                    onDelete={handleDeleteComment}
                    currentUserId={currentUser?._id || currentUser?.id}
                    frameAuthorId={frame.author?._id || frame.author?.id}
                    isAdmin={currentUser?.role === 'admin'}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* More from this Photographer */}
      {authorFrames.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-line">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-ink">
              More by {frame.author?.name}
            </h2>
            <Link
              to={`/u/${frame.author?.username}`}
              className="text-xs text-accent hover:underline font-medium"
            >
              View Full Gallery →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorFrames.map((f) => (
              <FrameCard key={f.id || f._id} frame={f} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        currentFrame={frame}
      />

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        frame={frame}
      />

      {/* Edit Frame Modal */}
      <EditFrameModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        frame={frame}
        onUpdateSuccess={(updated) => setFrame((prev) => ({ ...prev, ...updated }))}
      />

      {/* MetaSEO */}
      <MetaSEO
        title={`"${frame.moment}" — ${frame.author?.name || 'Photograph'}`}
        description={frame.moment || 'Photograph from Through My Frames'}
        image={frame.image}
        path={`/frame/${id}`}
        article
      />
    </div>
  );
}
