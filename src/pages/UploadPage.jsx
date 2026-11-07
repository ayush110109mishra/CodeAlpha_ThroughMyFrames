import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { frameService } from '../services/frameService';
import { thoughtService } from '../services/thoughtService';
import { FrameCard } from '../components/cards/FrameCard';
import { ThoughtCard } from '../components/cards/ThoughtCard';
import { MoodChip } from '../components/ui/MoodChip';
import { Button } from '../components/ui/Button';
import { MOODS, CATEGORIES } from '../lib/constants';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Sparkles,
  MapPin,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MetaSEO } from '../components/seo/MetaSEO';

const frameSchema = z.object({
  moment: z
    .string()
    .min(5, 'Please provide at least a short sentence')
    .max(280, 'Moment caption cannot exceed 280 characters'),
  location: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
});

export function UploadPage() {
  const [mode, setMode] = useState('photo'); // 'photo' | 'thought'
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [imagePreview, setImagePreview] = useState(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  );
  const [uploadedPublicId, setUploadedPublicId] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(frameSchema),
    defaultValues: {
      moment:
        '5:45 AM. The dew clung to stone balustrades while the first sunbeam ignited the horizon.',
      location: 'Pushkar, Rajasthan',
      category: 'Travel',
    },
  });

  const watchedMoment = watch('moment') || '';
  const watchedLocation = watch('location') || '';
  const watchedCategory = watch('category') || 'Travel';

  // Process and upload image to backend Cloudinary endpoint
  const handleUploadFile = async (file) => {
    if (!file) return;

    // Validate type and size
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Please upload a JPEG, PNG, or WebP image', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB', 'error');
      return;
    }

    // Set instant local preview
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setIsUploadingImage(true);

    try {
      const result = await frameService.uploadImage(file);
      setUploadedImageUrl(result.url);
      setUploadedPublicId(result.publicId || null);
      showToast('Image uploaded and optimized for gallery view', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Image upload failed';
      showToast(`Upload failed: ${msg}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (mode === 'photo') {
        if (!uploadedImageUrl) {
          showToast('Please select and upload a photograph first', 'error');
          setIsSubmitting(false);
          return;
        }

        const newFrame = await frameService.createFrame({
          image: uploadedImageUrl,
          cloudinaryPublicId: uploadedPublicId,
          fallbackImage: '/images/placeholder.jpg',
          moment: data.moment,
          mood: selectedMood,
          category: data.category,
          location: data.location || 'Undisclosed Location',
          camera: {
            body: 'Mobile Photography',
            lens: 'Wide Angle',
            settings: 'Natural Light',
          },
        });

        showToast('Frame created and published into the living gallery!', 'success');
        navigate(`/frame/${newFrame.id || newFrame._id}`);
      } else {
        await thoughtService.createThought({
          text: data.moment,
          mood: selectedMood,
          tags: [data.category || 'Living Journal'],
        });
        showToast('Thought published to the living journal!', 'success');
        navigate('/thoughts');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not publish frame. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview objects
  const previewFrame = {
    id: 'preview',
    image: imagePreview,
    moment: watchedMoment,
    mood: selectedMood,
    category: watchedCategory,
    location: watchedLocation,
    likes: 0,
    comments: [],
    author: user || {
      username: 'ayushmishra',
      name: 'Ayush Mishra',
      avatar: '/images/honey.jpg',
    },
  };

  const previewThought = {
    id: 'preview-thought',
    text: watchedMoment,
    mood: selectedMood,
    tags: [watchedCategory || 'Preview'],
    background:
      'linear-gradient(135deg, rgba(194, 105, 62, 0.08) 0%, rgba(233, 201, 168, 0.18) 100%)',
    createdAt: new Date().toISOString(),
    author: user || {
      username: 'ayushmishra',
      name: 'Ayush Mishra',
      avatar: '/images/honey.jpg',
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-10">
      <MetaSEO
        title="Publish Frame — Creation Studio"
        description="Share a visual photograph or quiet contemplation into the living journal."
        path="/upload"
      />

      {/* Page Header */}
      <div className="space-y-3 pb-6 border-b border-line">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Creation Studio
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
          Create Frame or Thought
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xl">
          Share a visual frame or a quiet contemplation. No hurry, no algorithms.
        </p>

        {/* Mode Selector Toggle */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('photo')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-medium transition-all border',
              mode === 'photo'
                ? 'bg-accent text-white border-accent shadow-warm-sm'
                : 'bg-surface text-muted border-line hover:text-ink'
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Photo Frame
          </button>
          <button
            type="button"
            onClick={() => setMode('thought')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-medium transition-all border',
              mode === 'thought'
                ? 'bg-accent text-white border-accent shadow-warm-sm'
                : 'bg-surface text-muted border-line hover:text-ink'
            )}
          >
            <FileText className="w-3.5 h-3.5" /> Thought Only
          </button>
        </div>
      </div>

      {/* Two Column Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-7 space-y-6 bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-warm-sm"
        >
          {/* Photo Dropzone (if photo mode) */}
          {mode === 'photo' && (
            <div className="space-y-2">
              <label className="text-2xs uppercase font-mono tracking-wider text-muted block font-semibold">
                Photograph (Drag & Drop or Browse)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-bg/50',
                  isDragging ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-line hover:border-accent'
                )}
              >
                <label className="cursor-pointer flex flex-col items-center justify-center w-full">
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center py-4 text-accent">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-xs font-medium">Uploading & optimizing image...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-accent mb-2" />
                      <span className="text-xs text-ink font-medium">
                        Click or drag photo here
                      </span>
                      <span className="text-[11px] text-muted mt-1">
                        Supports JPG, PNG, WebP (Max 5MB)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Moment Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-2xs uppercase font-mono tracking-wider text-muted font-semibold">
                {mode === 'photo' ? 'Moment Caption (Handwritten style)' : 'Living Thought'}
              </label>
              <span
                className={cn(
                  'text-[11px] font-mono',
                  watchedMoment.length > 260 ? 'text-amber-500 font-bold' : 'text-muted'
                )}
              >
                {watchedMoment.length} / 280
              </span>
            </div>
            <textarea
              {...register('moment')}
              rows={4}
              maxLength={280}
              placeholder={
                mode === 'photo'
                  ? 'Describe the stillness, light, or poetry of this moment...'
                  : 'Record a contemplative thought, observation, or quote...'
              }
              className="w-full p-3.5 bg-bg border border-line rounded-2xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none font-sans"
            />
            {errors.moment && (
              <p className="text-[11px] text-red-500 mt-1">{errors.moment.message}</p>
            )}
          </div>

          {/* Atmospheric Mood Tag */}
          <div className="space-y-2">
            <label className="text-2xs uppercase font-mono tracking-wider text-muted block font-semibold">
              State of Mind (Mood)
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood;
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={cn(
                      'px-3 py-1.5 rounded-pill text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-accent text-white border-accent shadow-warm-sm'
                        : 'bg-bg text-muted border-line hover:text-ink hover:border-muted'
                    )}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-2xs uppercase font-mono tracking-wider text-muted block font-semibold">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className={cn(
                    'px-3 py-1.5 rounded-pill text-xs font-medium cursor-pointer transition-all border',
                    watchedCategory === cat
                      ? 'bg-ink text-surface border-ink'
                      : 'bg-bg text-muted border-line hover:text-ink'
                  )}
                >
                  <input
                    type="radio"
                    value={cat}
                    {...register('category')}
                    className="hidden"
                  />
                  {cat}
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-[11px] text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Location Input (photo mode only) */}
          {mode === 'photo' && (
            <div className="space-y-1">
              <label className="text-2xs uppercase font-mono tracking-wider text-muted block font-semibold">
                Location Visited
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('location')}
                  placeholder="e.g. Manikarnika Ghat, Varanasi"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            isLoading={isSubmitting || isUploadingImage}
            icon={Check}
          >
            {mode === 'photo' ? 'Publish Frame' : 'Publish Thought'}
          </Button>
        </form>

        {/* Right Preview */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <span className="text-2xs uppercase font-mono tracking-wider text-muted font-semibold">
              Live Preview
            </span>
            <span className="text-[11px] text-accent font-medium">WYSIWYG</span>
          </div>

          {mode === 'photo' ? (
            <div className="max-w-md mx-auto">
              <FrameCard frame={previewFrame} priority />
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <ThoughtCard thought={previewThought} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
