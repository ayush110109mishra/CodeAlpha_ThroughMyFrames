import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripService } from '../services/tripService';
import { TripCard } from '../components/cards/TripCard';
import { MapPin, Compass, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function WanderPage() {
  const [selectedTripId, setSelectedTripId] = useState(null);

  const {
    data: trips = [],
    isLoading,
  } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripService.getTrips(),
  });

  const selectedTrip = trips.find((t) => (t.id || t._id) === selectedTripId) || trips[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full space-y-16">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
          <Compass className="w-3.5 h-3.5" /> Slow Journeys & Geography
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink">
          Wander
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
          Traversing sacred rivers, high cold desert ridges, and forgotten hamlets. Each journey is mapped as a continuum of light and human spirit.
        </p>
      </div>

      {/* Styled Illustrated Map Section with Interactive Pins */}
      <div className="relative rounded-3xl border border-line bg-surface p-6 sm:p-10 shadow-warm-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-line gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-ink">
              Cartography of Light
            </h2>
            <p className="text-2xs text-muted">
              Select any pin on the map to inspect its field notes and coordinates.
            </p>
          </div>

          {selectedTrip && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-accent/15 text-accent text-xs font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedTrip.place}</span>
            </div>
          )}
        </div>

        {/* Map Canvas Canvas Area */}
        <div className="relative w-full h-[320px] sm:h-[440px] my-6 rounded-2xl bg-bg border border-line flex items-center justify-center overflow-hidden">
          {/* Subtle Stylized SVG Topography / Compass lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-30 text-line pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            {/* Topographic organic curves */}
            <circle cx="50%" cy="50%" r="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="280" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
          </svg>

          {/* Map Compass Rose Watermark */}
          <div className="absolute right-6 top-6 opacity-20 pointer-events-none">
            <Compass className="w-24 h-24 text-ink" />
          </div>

          {/* Interactive Trip Pins */}
          {trips.map((trip) => {
            const tripId = trip.id || trip._id;
            const currentSelectedId = selectedTrip?.id || selectedTrip?._id;
            const isSelected = currentSelectedId === tripId;
            return (
              <button
                key={tripId}
                onClick={() => setSelectedTripId(tripId)}
                className="absolute z-20 group transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                style={{
                  left: `${trip.coordinates?.x || 50}%`,
                  top: `${trip.coordinates?.y || 50}%`,
                }}
                aria-label={`Select ${trip.title}`}
              >
                {/* Pulse ring for active pin */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full bg-accent/30 animate-ping pointer-events-none" />
                )}

                <div
                  className={`relative p-2.5 rounded-full transition-all duration-300 shadow-warm-md flex items-center justify-center ${
                    isSelected
                      ? 'bg-accent text-white scale-125'
                      : 'bg-surface text-ink border border-line hover:border-accent hover:text-accent'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>

                {/* Floating tooltip pin label */}
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap px-2.5 py-0.5 rounded-pill glass-panel text-[11px] font-medium text-ink shadow-warm-sm opacity-90 group-hover:opacity-100 transition-opacity">
                  {trip.place.split(',')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Trip Quick Preview Banner */}
        {selectedTrip && (
          <div className="bg-bg/70 p-5 rounded-2xl border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-2xs font-mono uppercase tracking-wider text-muted">
                {selectedTrip.dates}
              </span>
              <h3 className="font-serif text-lg font-medium text-ink">
                {selectedTrip.title}
              </h3>
              <p className="text-xs text-muted max-w-2xl line-clamp-2">
                {selectedTrip.story}
              </p>
            </div>
            <a
              href={`#trip-${selectedTrip.id}`}
              className="inline-flex items-center gap-1 text-xs text-accent font-medium hover:underline shrink-0"
            >
              Jump to Story <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Detailed Journeys List */}
      <div className="space-y-8">
        <h2 className="font-serif text-2xl font-medium text-ink">
          Field Records & Diaries
        </h2>

        <div className="space-y-10">
          {trips.map((trip) => (
            <div key={trip.id} id={`trip-${trip.id}`}>
              <TripCard trip={trip} onSelectTrip={() => setSelectedTrip(trip)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

