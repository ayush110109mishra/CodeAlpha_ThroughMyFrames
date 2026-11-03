import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { frameService } from '../services/frameService';
import { MoodChip } from '../components/ui/MoodChip';
import { Button } from '../components/ui/Button';
import { Lightbox } from '../components/ui/Lightbox';
import { CommentBox, CommentItem } from '../components/ui/CommentBox';
import { FrameCard } from '../components/cards/FrameCard';
import { useToast } from '../components/ui/Toast';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

export function FrameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [frame, setFrame] = useState(null);
  const [allFrames, setAllFrames] = useState([]);
  const [authorFrames, setAuthorFrames] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFrame() {
      setIsLoading(true);
      const data = await frameService.getFrameById(id);
      if (!data) {
        navigate('/explore');
        return;
      }
      setFrame(data);
      setIsLiked(data.isLiked);
      setLikesCount(data.likes);
      setIsSaved(data.isSaved);

      // Load comments
      const comms = await frameService.getComments(id, data.comments);
      setComments(comms);

      // Load more frames
      const all = await frameService.getFrames();
      setAllFrames(all);
      const more = all.filter((f) => f.author.username === data.author.username && f.id !== id);
      setAuthorFrames(more.slice(0, 3));

      setIsLoading(false);
    }

    loadFrame();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    await frameService.toggleLike(frame.id);
  };

  const handleSave = async () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    await frameService.toggleSave(frame.id);
    showToast(nextState ? 'Saved to your collection' : 'Removed from collection', 'info');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Frame link copied to clipboard', 'success');
    }
  };

  const handleAddComment = async (text) => {
    const newComment = await frameService.addComment(frame.id, {
      content: text,
      author: {
        username: 'ayushmishra',
        name: 'Ayush Mishra',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
    });
    setComments((prev) => [newComment, ...prev]);
    showToast('Reflection shared', 'success');
  };

  // Keyboard navigation for Prev/Next
  const currentIndex = allFrames.findIndex((f) => f.id === id);
  const prevFrame = currentIndex > 0 ? allFrames[currentIndex - 1] : allFrames[allFrames.length - 1];
  const nextFrame = currentIndex < allFrames.length - 1 ? allFrames[currentIndex + 1] : allFrames[0];

  if (isLoading || !frame) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-muted">
        <Aperture className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

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
              to={`/frame/${prevFrame.id}`}
              className="p-2 rounded-full border border-line bg-surface hover:text-accent hover:border-accent text-muted transition-colors"
              title="Previous Frame"
              aria-label="Previous Frame"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          {nextFrame && (
            <Link
              to={`/frame/${nextFrame.id}`}
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
            className="group relative rounded-2xl overflow-hidden border border-line bg-surface shadow-warm-lg cursor-pointer max-h-[75vh] flex items-center justify-center bg-black/5"
          >
            <img
              src={frame.image}
              alt={frame.moment}
              onError={(e) => {
                const fallback = frame.fallbackImage || '/images/placeholder.jpg';
                if (e.target.src !== fallback) {
                  e.target.src = fallback;
                }
              }}
              className="w-full h-auto max-h-[75vh] object-contain transition-transform duration-700 group-hover:scale-[1.01]"
            />
            {/* Expand Overlay Button */}
            <div className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Action Bar (Like, Save, Share) */}
          <div className="flex items-center justify-between p-3.5 bg-surface border border-line rounded-card shadow-warm-sm">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 1.3 }}
                onClick={handleLike}
                className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-pill bg-bg border border-line hover:border-accent transition-all"
              >
                <Heart
                  className="w-4 h-4"
                  fill={isLiked ? 'var(--color-accent)' : 'none'}
                  stroke={isLiked ? 'var(--color-accent)' : 'currentColor'}
                />
                <span>{likesCount}</span>
              </motion.button>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-pill bg-bg border border-line hover:border-accent transition-all"
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={isSaved ? 'var(--color-accent)' : 'none'}
                  stroke={isSaved ? 'var(--color-accent)' : 'currentColor'}
                />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-line bg-bg hover:border-accent hover:text-accent transition-all text-muted"
              title="Share Frame"
              aria-label="Share Frame"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Moment, Meta, Camera Info & Comments */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mood & Location Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <MoodChip mood={frame.mood} size="md" />
            <span className="text-2xs px-3 py-1 rounded-pill bg-surface border border-line text-muted font-medium">
              {frame.category}
            </span>
            {frame.location && (
              <span className="inline-flex items-center gap-1 text-2xs px-3 py-1 rounded-pill bg-surface border border-line text-ink font-medium">
                <MapPin className="w-3 h-3 text-accent" />
                {frame.location}
              </span>
            )}
          </div>

          {/* Handwritten Moment Caption */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-muted font-mono font-semibold">
              The Moment Recorded
            </span>
            <p className="font-handwritten text-2xl sm:text-3xl text-ink leading-relaxed font-normal">
              "{frame.moment}"
            </p>
          </div>

          {/* Author Card */}
          <div className="p-4 rounded-card bg-surface border border-line flex items-center justify-between">
            <Link
              to={`/u/${frame.author?.username}`}
              className="flex items-center gap-3 hover:opacity-85 transition-opacity"
            >
              <img
                src={frame.author?.avatar}
                alt={frame.author?.name}
                className="w-11 h-11 rounded-full object-cover border border-line"
              />
              <div>
                <p className="text-xs font-semibold text-ink">
                  {frame.author?.name}
                </p>
                <p className="text-[11px] text-muted">
                  @{frame.author?.username}
                </p>
              </div>
            </Link>

            <Link to={`/u/${frame.author?.username}`}>
              <Button size="sm" variant="outline">
                Profile
              </Button>
            </Link>
          </div>

          {/* Camera EXIF Details */}
          {frame.camera && (
            <div className="p-4 rounded-card bg-surface border border-line space-y-3">
              <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-muted font-mono font-semibold border-b border-line/60 pb-2">
                <Camera className="w-3.5 h-3.5 text-accent" />
                <span>EXIF & Gear Metadata</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-2xs">
                <div>
                  <span className="text-muted block text-[10px]">Body</span>
                  <span className="text-ink font-medium">{frame.camera.body}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Lens</span>
                  <span className="text-ink font-medium">{frame.camera.lens}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Aperture</span>
                  <span className="text-ink font-medium">{frame.camera.aperture}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Shutter Speed</span>
                  <span className="text-ink font-medium">{frame.camera.shutterSpeed}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Focal Length</span>
                  <span className="text-ink font-medium">{frame.camera.focalLength}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">ISO</span>
                  <span className="text-ink font-medium">{frame.camera.iso}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reflections / Comments Section */}
          <div id="comments" className="space-y-4 pt-4 border-t border-line">
            <h3 className="font-serif text-lg font-medium text-ink">
              Reflections ({comments.length})
            </h3>

            {/* Comment Box */}
            <CommentBox onSubmit={handleAddComment} />

            {/* Comments List */}
            <div className="space-y-1 divide-y divide-line/60">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "More from this photographer" Section */}
      {authorFrames.length > 0 && (
        <section className="pt-12 border-t border-line space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl text-ink font-medium">
              More from {frame.author?.name}
            </h3>
            <Link
              to={`/u/${frame.author?.username}`}
              className="text-xs text-accent hover:underline font-medium"
            >
              View all frames
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorFrames.map((f) => (
              <FrameCard key={f.id} frame={f} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        currentFrame={frame}
      />
    </div>
  );
}

