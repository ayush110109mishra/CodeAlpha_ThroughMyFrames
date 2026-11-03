import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroCanvas } from '../components/three/HeroCanvas';
import { FrameCard } from '../components/cards/FrameCard';
import { ThoughtCard } from '../components/cards/ThoughtCard';
import { TripCard } from '../components/cards/TripCard';
import { CollectionCard } from '../components/cards/CollectionCard';
import { Lightbox } from '../components/ui/Lightbox';
import { Button } from '../components/ui/Button';
import { frameService } from '../services/frameService';
import { thoughtService } from '../services/thoughtService';
import { tripService } from '../services/tripService';
import { collectionService } from '../services/collectionService';
import {
  ArrowRight,
  Sparkles,
  Compass,
  BookOpen,
  Camera,
  Layers,
  Heart,
  Quote,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  const [frames, setFrames] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [collections, setCollections] = useState([]);
  const [momentFrame, setMomentFrame] = useState(null);
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [allFrames, allThoughts, allTrips, allCollections] = await Promise.all([
        frameService.getFrames(),
        thoughtService.getThoughts(),
        tripService.getTrips(),
        collectionService.getCollections(),
      ]);

      setFrames(allFrames);
      setThoughts(allThoughts.slice(0, 3));
      setTrips(allTrips.slice(0, 2));
      setCollections(allCollections.slice(0, 3));
      setMomentFrame(allFrames[0]); // Taj Mahal as initial moment
    }

    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-24 sm:gap-32 pb-20">
      {/* 1. 3D R3F Hero Section */}
      <section className="relative">
        <HeroCanvas frames={frames} />
      </section>

      {/* 2. Featured Frames Section */}
      <section id="featured-frames" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-1.5 text-accent text-2xs uppercase tracking-widest font-mono font-semibold mb-2">
              <Camera className="w-3.5 h-3.5" /> Recent Observations
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-ink font-medium">
              Featured Frames
            </h2>
            <p className="text-xs text-muted mt-1 max-w-md">
              Moments where light, architecture, and silence paused together.
            </p>
          </div>
          <Link to="/explore">
            <Button variant="secondary" size="sm" iconRight={ArrowRight}>
              Explore Full Gallery
            </Button>
          </Link>
        </div>

        {/* Frames Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {frames.slice(0, 6).map((frame) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              onOpenLightbox={(f) => setActiveLightboxFrame(f)}
            />
          ))}
        </div>
      </section>

      {/* 3. Moment of the Day Teaser */}
      {momentFrame && (
        <section id="moment-of-day" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="relative rounded-3xl overflow-hidden border border-line bg-surface p-6 sm:p-12 shadow-warm-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 relative aspect-[4/3] rounded-2xl overflow-hidden bg-bg/40">
                <img
                  src={momentFrame.image}
                  alt={momentFrame.moment}
                  onError={(e) => {
                    const fallback = momentFrame.fallbackImage || '/images/placeholder.jpg';
                    if (e.target.src !== fallback) {
                      e.target.src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-pill bg-black/60 backdrop-blur-md text-white text-2xs font-mono uppercase tracking-wider">
                    Moment of the Day
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-2xs uppercase tracking-widest font-mono text-accent font-semibold block mb-2">
                    {momentFrame.location} • {momentFrame.mood}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink leading-tight mb-4">
                    The First Dawn Blush
                  </h3>
                  <p className="font-handwritten text-2xl sm:text-3xl text-accent/90 leading-snug">
                    "{momentFrame.moment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-line/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={momentFrame.author?.avatar}
                      alt={momentFrame.author?.name}
                      className="w-8 h-8 rounded-full object-cover border border-line"
                    />
                    <div>
                      <p className="text-xs font-medium text-ink">
                        {momentFrame.author?.name}
                      </p>
                      <p className="text-[11px] text-muted">
                        Visual Chronicler
                      </p>
                    </div>
                  </div>

                  <Link to="/moment">
                    <Button variant="primary" size="sm" iconRight={ArrowRight}>
                      Experience Fullscreen
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Wander (Travel Journeys) Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-1.5 text-accent text-2xs uppercase tracking-widest font-mono font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" /> Slow Travel
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-ink font-medium">
              Wander Journeys
            </h2>
            <p className="text-xs text-muted mt-1 max-w-md">
              Unfolding stories, river currents, and footsteps across sacred terrain.
            </p>
          </div>
          <Link to="/wander">
            <Button variant="secondary" size="sm" iconRight={ArrowRight}>
              View All Journeys
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      {/* 5. Living Thoughts Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-1.5 text-accent text-2xs uppercase tracking-widest font-mono font-semibold mb-2">
              <Quote className="w-3.5 h-3.5" /> Living Musings
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-ink font-medium">
              Thoughts & Reflections
            </h2>
            <p className="text-xs text-muted mt-1 max-w-md">
              Words written on tea-stained margins and train windows.
            </p>
          </div>
          <Link to="/thoughts">
            <Button variant="secondary" size="sm" iconRight={ArrowRight}>
              Read All Thoughts
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {thoughts.map((thought) => (
            <ThoughtCard key={thought.id} thought={thought} />
          ))}
        </div>
      </section>

      {/* 6. Collections Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-1.5 text-accent text-2xs uppercase tracking-widest font-mono font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" /> Curated Albums
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-ink font-medium">
              Photo Collections
            </h2>
            <p className="text-xs text-muted mt-1 max-w-md">
              Thematic groupings tied together by light, texture, and quiet resonance.
            </p>
          </div>
          <Link to="/collections">
            <Button variant="secondary" size="sm" iconRight={ArrowRight}>
              View All Collections
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* 7. Meet The Photographer Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl border border-line bg-surface p-8 sm:p-14 relative overflow-hidden shadow-warm-lg">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5 relative">
              <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-warm-md border border-line">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85"
                  alt="Ayush Mishra"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
                Behind the Viewfinder
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink font-medium leading-tight">
                Ayush Mishra
              </h2>
              <p className="font-handwritten text-xl sm:text-2xl text-accent">
                "Photography is fundamentally an act of quiet reverence."
              </p>
              <p className="text-xs text-muted leading-relaxed font-sans max-w-xl">
                Lifting the viewfinder is my way of whispering to a frantic world: wait. Look how this morning light loves the river mist. Through My Frames began not as a portfolio, but as an art-journal where moments are preserved with the gentleness they deserve.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link to="/photographer">
                  <Button variant="primary" size="md" iconRight={ArrowRight}>
                    Read Personal Story & Gear
                  </Button>
                </Link>
                <Link to="/u/ayushmishra">
                  <Button variant="secondary" size="md">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox for full frame view */}
      <Lightbox
        isOpen={!!activeLightboxFrame}
        onClose={() => setActiveLightboxFrame(null)}
        currentFrame={activeLightboxFrame}
      />
    </div>
  );
}

