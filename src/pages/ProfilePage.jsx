import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { frameService } from '../services/frameService';
import { FrameCard } from '../components/cards/FrameCard';
import { ThoughtCard } from '../components/cards/ThoughtCard';
import { CollectionCard } from '../components/cards/CollectionCard';
import { Button } from '../components/ui/Button';
import { Lightbox } from '../components/ui/Lightbox';
import { useToast } from '../components/ui/Toast';
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
} from 'lucide-react';
import { cn } from '../lib/utils';

export function ProfilePage() {
  const { username } = useParams();
  
  // Instant synchronous initialization - ZERO loading delay!
  const [user, setUser] = useState(() => userService.getUserByUsernameSync(username));
  const [content, setContent] = useState(() => userService.getUserContentSync(username));
  const [savedFrames, setSavedFrames] = useState([]);
  const [activeTab, setActiveTab] = useState('frames'); // 'frames', 'thoughts', 'collections', 'saved'
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(user?.followers || 0);
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const u = userService.getUserByUsernameSync(username);
    if (u) {
      setUser(u);
      setIsFollowing(u.isFollowing);
      setFollowersCount(u.followers);
      setContent(userService.getUserContentSync(u.username));
    }

    async function loadSaved() {
      const saved = await frameService.getSavedFrames();
      setSavedFrames(saved);
    }
    loadSaved();
    window.scrollTo(0, 0);
  }, [username]);

  const handleToggleFollow = async () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    await userService.toggleFollow(user.username);
    showToast(nextState ? `Following @${user.username}` : `Unfollowed @${user.username}`, 'info');
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard', 'success');
    }
  };

  const displayUser = user || userService.getUserByUsernameSync('ayushmisra');

  const avatarSrc = displayUser?.avatar
    ? displayUser.avatar.trim().startsWith('/') || displayUser.avatar.trim().startsWith('http')
      ? displayUser.avatar.trim()
      : `/images/${displayUser.avatar.trim()}`
    : '/images/honey.jpg';

  const tabs = [
    { id: 'frames', label: 'Frames', count: content?.frames?.length || 0, icon: Camera },
    { id: 'thoughts', label: 'Thoughts', count: content?.thoughts?.length || 0, icon: Quote },
    { id: 'collections', label: 'Collections', count: content?.collections?.length || 0, icon: Layers },
    { id: 'saved', label: 'Saved', count: savedFrames.length, icon: Bookmark },
  ];

  return (
    <div className="w-full pb-20">
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
                alt={displayUser.name || 'Ayush Misra'}
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
              <p className="text-2xs text-accent font-medium">{displayUser.role}</p>
            </div>
          </div>

          {/* Action Buttons: Follow & Share */}
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

            <Button
              variant={isFollowing ? 'outline' : 'primary'}
              size="md"
              icon={isFollowing ? UserCheck : UserPlus}
              onClick={handleToggleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>

        {/* Bio and Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-line">
          <div className="md:col-span-8 space-y-3">
            <p className="text-xs sm:text-sm text-ink/90 leading-relaxed max-w-2xl font-sans">
              {displayUser.bio}
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
                  {displayUser.website.replace('https://', '')}
                </a>
              )}
              {displayUser.gearSummary && (
                <span className="text-muted/80">
                  {displayUser.gearSummary}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="md:col-span-4 flex items-center justify-around sm:justify-end gap-6 sm:gap-8 bg-surface p-4 rounded-2xl border border-line shadow-warm-sm">
            <div className="text-center">
              <span className="font-serif text-lg sm:text-xl font-medium text-ink block">
                {content?.frames?.length || 0}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted font-mono">
                Frames
              </span>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-center">
              <span className="font-serif text-lg sm:text-xl font-medium text-ink block">
                {followersCount.toLocaleString()}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(content?.frames || []).map((f) => (
                <FrameCard
                  key={f.id}
                  frame={f}
                  onOpenLightbox={(frame) => setActiveLightboxFrame(frame)}
                />
              ))}
            </div>
          )}

          {activeTab === 'thoughts' && (
            <div className="masonry-grid">
              {(content?.thoughts || []).map((t) => (
                <div key={t.id} className="masonry-item">
                  <ThoughtCard thought={t} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(content?.collections || []).map((col) => (
                <CollectionCard key={col.id} collection={col} />
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              {savedFrames.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-dashed border-line rounded-card">
                  <Bookmark className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-xs text-muted">
                    No frames saved yet. Tap the bookmark icon on any photograph to save it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedFrames.map((f) => (
                    <FrameCard
                      key={f.id}
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
    </div>
  );
}
