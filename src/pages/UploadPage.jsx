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
import { UploadCloud, Image, FileText, Sparkles, MapPin, Check } from 'lucide-react';
import { cn } from '../lib/utils';

// Zod schema
const frameSchema = z.object({
  moment: z.string().min(5, 'Please provide at least a short sentence').max(280, 'Max 280 characters'),
  location: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
});

export function UploadPage() {
  const [mode, setMode] = useState('photo'); // 'photo' | 'thought'
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(frameSchema),
    defaultValues: {
      moment: '5:45 AM. The dew clung to stone balustrades while the first sunbeam ignited the horizon.',
      location: 'Pushkar, Rajasthan',
      category: 'Travel',
    },
  });

  const watchedMoment = watch('moment') || '';
  const watchedLocation = watch('location') || '';
  const watchedCategory = watch('category') || 'Travel';

  // Handle local file drop / selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (mode === 'photo') {
        const newFrame = await frameService.createFrame({
          image: imagePreview,
          fallbackImage: '/images/placeholder.jpg',
          moment: data.moment,
          mood: selectedMood,
          category: data.category,
          location: data.location || 'Undisclosed Location',
          camera: {
            body: 'Sony A7 IV',
            lens: 'FE 35mm f/1.4 GM',
            aperture: 'f/2.8',
            shutterSpeed: '1/320s',
            iso: '100',
            focalLength: '35mm',
          },
          author: {
            username: 'ayushmisra',
            name: 'Ayush Misra',
            avatar: '/images/honey.jpg',
          },
        });
        showToast('Frame created and published into the gallery!', 'success');
        navigate(`/frame/${newFrame.id}`);
      } else {
        await thoughtService.createThought({
          text: data.moment,
          mood: selectedMood,
          tags: ['Living Journal'],
        });
        showToast('Thought published to the living journal!', 'success');
        navigate('/thoughts');
      }
    } catch (err) {
      showToast('Could not publish frame. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock frame for live preview
  const previewFrame = {
    id: 'preview',
    image: imagePreview,
    moment: watchedMoment,
    mood: selectedMood,
    category: watchedCategory,
    location: watchedLocation,
    likes: 0,
    comments: [],
    author: {
      username: 'ayushmisra',
      name: 'Ayush Misra',
      avatar: '/images/honey.jpg',
    },
  };

  const previewThought = {
    id: 'preview-thought',
    text: watchedMoment,
    mood: selectedMood,
    tags: ['Preview'],
    background: 'linear-gradient(135deg, rgba(194, 105, 62, 0.08) 0%, rgba(233, 201, 168, 0.18) 100%)',
    createdAt: new Date().toISOString(),
    author: {
      username: 'ayushmisra',
      name: 'Ayush Misra',
      avatar: '/images/honey.jpg',
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-10">
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
            <Image className="w-3.5 h-3.5" /> Photo Frame
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
                Photograph (Drop or Select)
              </label>
              <label className="relative border-2 border-dashed border-line hover:border-accent rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-bg/50">
                <UploadCloud className="w-8 h-8 text-accent mb-2" />
                <span className="text-xs text-ink font-medium">
                  Click or drag photo here
                </span>
                <span className="text-[11px] text-muted mt-1">
                  Supports JPG, PNG, WebP (high resolution recommended)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Moment Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-2xs uppercase font-mono tracking-wider text-muted font-semibold">
                {mode === 'photo' ? 'Moment Caption (Handwritten style)' : 'Living Thought'}
              </label>
              <span className="text-[11px] font-mono text-muted">
                {watchedMoment.length} / 280
              </span>
            </div>
            <textarea
              {...register('moment')}
              rows={4}
              maxLength={280}
              placeholder={
                mode === 'photo'
                  ? 'Describe the temperature, the scent of dust, the silence between shutter clicks...'
                  : 'Write a contemplation on space, travel, time, or light...'
              }
              className="w-full p-3.5 bg-bg border border-line rounded-2xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all"
            />
            {errors.moment && (
              <p className="text-[11px] text-red-500">{errors.moment.message}</p>
            )}
          </div>

          {/* Mood Chips Selector */}
          <div className="space-y-2">
            <label className="text-2xs uppercase font-mono tracking-wider text-muted font-semibold block">
              State of Mind (Mood)
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.filter((m) => m !== 'All').map((mood) => (
                <MoodChip
                  key={mood}
                  mood={mood}
                  active={selectedMood === mood}
                  onClick={() => setSelectedMood(mood)}
                />
              ))}
            </div>
          </div>

          {/* Category Select (if photo mode) */}
          {mode === 'photo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-2xs uppercase font-mono tracking-wider text-muted font-semibold block">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3.5 py-2.5 bg-bg border border-line rounded-pill text-xs text-ink focus:outline-none focus:border-accent"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Input */}
              <div className="space-y-1">
                <label className="text-2xs uppercase font-mono tracking-wider text-muted font-semibold block">
                  Location (optional)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-accent absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('location')}
                    placeholder="e.g. Varanasi, Ganga Ghats"
                    className="w-full pl-9 pr-3.5 py-2 bg-bg border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-line flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
            >
              Publish Frame
            </Button>
          </div>
        </form>

        {/* Right Live Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-2xs uppercase tracking-widest font-mono text-muted font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Live Interactive Preview</span>
          </div>

          <div className="sticky top-28">
            {mode === 'photo' ? (
              <FrameCard frame={previewFrame} />
            ) : (
              <ThoughtCard thought={previewThought} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

