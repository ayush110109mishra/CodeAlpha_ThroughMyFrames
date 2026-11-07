import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { frameService } from '../services/frameService';
import { FrameCard } from '../components/cards/FrameCard';
import { ThoughtCard } from '../components/cards/ThoughtCard';
import { CollectionCard } from '../components/cards/CollectionCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Button } from '../components/ui/Button';
import { Lightbox } from '../components/ui/Lightbox';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Globe,
  UserCheck,
  UserPlus,
  Camera,
  Layers,
  Quote,
  Bookmark,
  Share2,
  Edit3,
  Aperture,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MetaSEO } from '../components/seo/MetaSEO';

export function ProfilePage() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'frames');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch User Profile
  const {
    data: profileUser,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user', username],
    queryFn: () => userService.getUserByUsername(username),
    retry: 1,
  });

  // Fetch User's Content (Frames, Thoughts, Collections, Saved)
  const {
    data: content = { frames: [], thoughts: [], collections: [], saved: [] },
    isLoading: isContentLoading,
    refetch: refetchContent,
  } = useQuery({
    queryKey: ['user-content', username],
    queryFn: () => userService.getUserContent(username),
    retry: 1,
  });

  // Follow Mutation with optimistic UI updates
  const followMutation = useMutation({
    mutationFn: () => userService.toggleFollow(username),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['user', username] });
      const previousUser = queryClient.getQueryData(['user', username]);

      if (previousUser) {
        const nextIsFollowing = !previousUser.isFollowing;
        const diff = nextIsFollowing ? 1 : -1;
        queryClient.setQueryData(['user', username], {
          ...previousUser,
          isFollowing: nextIsFollowing,
          followers: Math.max(0, (previousUser.followers || 0) + diff),
          followersCount: Math.max(0, (previousUser.followersCount || 0) + diff),
        });
      }

      return { previousUser };
    },
    onError: (err, _, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user', username], context.previousUser);
      }
      showToast(err.response?.data?.message || 'Could not update follow status', 'error');
    },
    onSuccess: (data) => {
      showToast(data.message || 'Follow status updated', 'info');
      queryClient.invalidateQueries({ queryKey: ['user', username] });
    },
  });

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow fellow wanderers', 'info');
      return;
    }
    followMutation.mutate();
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard', 'success');
    }
  };

  const displayUser =
    profileUser ||
    (username === 'ayushmishra' ? userService.getUserByUsernameSync('ayushmishra') : null);

  const isOwnProfile =
    currentUser && displayUser && currentUser.username === displayUser.username;

  if (isUserLoading || isContentLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-muted pt-24">
        <Aperture className="w-8 h-8 animate-spin text-accent" />
        <span className="text-xs font-mono uppercase tracking-wider">Loading journal profile...</span>
      </div>
    );
  }

  if (isUserError || !displayUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4 pt-24">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-medium text-ink">User Not Found</h2>
          <p className="text-xs text-muted max-w-sm">
            Could not find an active journal profile for @{username}. The server may be unreachable or the username might be incorrect.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchUser()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const avatarSrc = displayUser?.avatar
    ? displayUser.avatar.trim().startsWith('/') || displayUser.avatar.trim().startsWith('http')
      ? displayUser.avatar.trim()
      : `/images/${displayUser.avatar.trim()}`
    : '/images/honey.jpg';

  const tabs = [
    { id: 'frames', label: 'Frames', count: content.frames?.length || 0, icon: Camera },
    { id: 'thoughts', label: 'Thoughts', count: content.thoughts?.length || 0, icon: Quote },
    { id: 'collections', label: 'Collections', count: content.collections?.length || 0, icon: Layers },
    { id: 'saved', label: 'Saved', count: content.saved?.length || 0, icon: Bookmark },
  ];

  return (
    <div className="w-full pb-20">
      <MetaSEO
        title={`${displayUser.name} (@${displayUser.username})`}
        description={displayUser.bio || displayUser.headline || `${displayUser.name}'s visual journal on Through My Frames.`}
        image={avatarSrc}
        path={`/u/${username}`}
      />
      {/* Cover Image Banner */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 bg-bg overflow-hidden border-b border-line">
        <img
          src={displayUser.cover || '/images/placeholder.jpg'}
          alt={displayUser.name || 'Profile cover'}
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg';
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/30" />
      </div>

      {/* Main Profile Info Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          {/* Avatar + Identity */}
          <div className="flex items-end gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={avatarSrc}
                alt={displayUser.name || 'Profile photo'}
                onError={(e) => {
                  e.target.src = '/images/honey.jpg';
                }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-surface shadow-warm-lg bg-surface"
              />
            </div>

            <div className="space-y-1 mb-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                {displayUser.name}
              </h1>
              <p className="text-xs text-muted font-mono">@{displayUser.username}</p>
              <p className="text-2xs text-accent font-medium">
                {displayUser.headline || displayUser.role || 'Wanderer & Chronicler'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Follow, Edit Profile, Share */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleShareProfile}
              className="p-2.5 rounded-full border border-line bg-surface text-ink hover:text-accent hover:border-accent transition-colors shadow-warm-sm"
              title="Share Profile"
              aria-label="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {displayUser.isPhotographerOwner && (
              <Link to="/photographer">
                <Button variant="secondary" size="md">
                  Photographer Story
                </Button>
              </Link>
            )}

            {isOwnProfile ? (
              <Button
                variant="outline"
                size="md"
                icon={Edit3}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={displayUser.isFollowing ? 'outline' : 'primary'}
                size="md"
                icon={displayUser.isFollowing ? UserCheck : UserPlus}
                onClick={handleToggleFollow}
                isLoading={followMutation.isPending}
              >
                {displayUser.isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Bio and Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-line">
          <div className="md:col-span-8 space-y-3">
            <p className="text-xs sm:text-sm text-ink/90 leading-relaxed max-w-2xl font-sans">
              {displayUser.bio || 'Finding stillness between shutter clicks.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-2xs text-muted">
              {displayUser.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {displayUser.location}
                </span>
              )}
              {displayUser.website && (
                <a
                  href={displayUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-accent"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {displayUser.website.replace('https://', '').replace('http://', '')}
                </a>
              )}
              {displayUser.gearSummary && (
                <span className="text-muted/80">{displayUser.gearSummary}</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="md:col-span-4 flex items-center justify-around sm:justify-end gap-6 sm:gap-8 bg-surface p-4 rounded-2xl border border-line shadow-warm-sm">
            <div className="text-center">
              <span className="font-serif text-lg sm:text-xl font-medium text-ink block">
                {content.frames?.length || 0}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted font-mono">
                Frames
              </span>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-center">
              <span className="font-serif text-lg sm:text-xl font-medium text-ink block">
                {(displayUser.followers || 0).toLocaleString()}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted font-mono">
                Followers
              </span>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-center">
              <span className="font-serif text-lg sm:text-xl font-medium text-ink block">
                {displayUser.following || 0}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted font-mono">
                Following
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-line pb-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-pill text-xs font-medium transition-all',
                  isActive
                    ? 'bg-ink text-surface font-semibold shadow-warm-sm'
                    : 'text-muted hover:text-ink hover:bg-surface'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div>
          {activeTab === 'frames' && (
            <div>
              {content.frames?.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-dashed border-line rounded-card">
                  <Camera className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-xs text-muted">No photographs published in this journal yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.frames.map((f) => (
                    <FrameCard
                      key={f.id || f._id}
                      frame={f}
                      onOpenLightbox={(frame) => setActiveLightboxFrame(frame)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'thoughts' && (
            <div>
              {content.thoughts?.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-dashed border-line rounded-card">
                  <Quote className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-xs text-muted">No quiet thoughts recorded yet.</p>
                </div>
              ) : (
                <div className="masonry-grid">
                  {content.thoughts.map((t) => (
                    <div key={t.id || t._id} className="masonry-item">
                      <ThoughtCard thought={t} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'collections' && (
            <div>
              {content.collections?.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-dashed border-line rounded-card">
                  <Layers className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-xs text-muted">No curated collections created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {content.collections.map((col) => (
                    <CollectionCard key={col.id || col._id} collection={col} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              {content.saved?.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-dashed border-line rounded-card">
                  <Bookmark className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-xs text-muted">
                    No frames saved yet. Tap the bookmark icon on any photograph to save it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.saved.map((f) => (
                    <FrameCard
                      key={f.id || f._id}
                      frame={f}
                      onOpenLightbox={(frame) => setActiveLightboxFrame(frame)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={!!activeLightboxFrame}
        onClose={() => setActiveLightboxFrame(null)}
        currentFrame={activeLightboxFrame}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={() => {
          refetchUser();
          refetchContent();
        }}
      />
    </div>
  );
}
