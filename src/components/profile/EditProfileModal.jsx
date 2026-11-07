import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Camera, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { frameService } from '../../services/frameService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export function EditProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [headline, setHeadline] = useState(user?.headline || user?.role || '');
  const [avatar, setAvatar] = useState(user?.avatar || '/images/honey.jpg');
  const [cover, setCover] = useState(user?.cover || '');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await frameService.uploadImage(file);
      setAvatar(res.url);
      showToast('Avatar uploaded', 'success');
    } catch (err) {
      showToast('Avatar upload failed', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await frameService.uploadImage(file);
      setCover(res.url);
      showToast('Cover image uploaded', 'success');
    } catch (err) {
      showToast('Cover upload failed', 'error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        name,
        username,
        bio,
        location,
        website,
        headline,
        avatar,
        cover,
      });

      updateUser(updated);
      showToast('Your profile has been updated', 'success');
      if (onProfileUpdated) onProfileUpdated(updated);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative bg-surface border border-line rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-warm-lg z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-ink">
              Edit Sanctuary Profile
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            {/* Cover & Avatar Upload Areas */}
            <div className="space-y-3">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Cover Photograph & Avatar
              </label>

              {/* Cover Banner */}
              <div className="relative h-28 sm:h-32 rounded-2xl overflow-hidden border border-line bg-bg group">
                {cover ? (
                  <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                    No Cover Image
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs gap-1.5 font-medium">
                  {isUploadingCover ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-4 h-4" /> Change Cover
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFile}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Avatar Picture */}
              <div className="flex items-center gap-4 pt-1">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-surface shadow-warm-sm bg-bg group shrink-0">
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-xs text-muted">
                  <span className="text-ink font-medium block">Profile Photo</span>
                  Click avatar or cover to upload new photography (JPG, PNG, WebP)
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-bg border border-line rounded-pill text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-bg border border-line rounded-pill text-xs text-ink focus:outline-none focus:border-accent font-mono"
              />
            </div>

            {/* Tagline / Headline */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Title / Artistic Tagline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Visual Storyteller & Essayist"
                className="w-full px-3.5 py-2 bg-bg border border-line rounded-pill text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Bio / Philosophy
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Share a quiet glimpse into your journey..."
                className="w-full p-3 bg-bg border border-line rounded-2xl text-xs text-ink focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Location & Website Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lucknow, India"
                  className="w-full px-3.5 py-2 bg-bg border border-line rounded-pill text-xs text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                  Website / Portfolio
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-bg border border-line rounded-pill text-xs text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving || isUploadingAvatar || isUploadingCover}
                icon={Check}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
