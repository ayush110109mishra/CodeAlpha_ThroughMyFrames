import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Camera } from 'lucide-react';
import { Button } from '../ui/Button';

export function TripCard({ trip, onSelectTrip }) {
  const [imgSrc, setImgSrc] = useState(trip.cover);

  return (
    <article className="group bg-surface rounded-card border border-line overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col md:flex-row">
      {/* Cover Image */}
      <div className="relative md:w-5/12 overflow-hidden bg-bg/50 aspect-[16/10] md:aspect-auto">
        <img
          src={imgSrc}
          alt={trip.title}
          onError={() => {
            if (trip.fallbackImage && imgSrc !== trip.fallbackImage) {
              setImgSrc(trip.fallbackImage);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-black/50 backdrop-blur-md text-white text-[11px] font-medium">
            <Camera className="w-3 h-3 text-accent" />
            {trip.frames?.length || 3} Frames
          </span>
        </div>
      </div>

      {/* Trip Story & Details */}
      <div className="p-6 md:w-7/12 flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-2xs text-muted mb-2">
            <span className="inline-flex items-center gap-1 font-medium text-accent">
              <MapPin className="w-3 h-3" />
              {trip.place}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {trip.dates}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl text-ink font-medium leading-snug group-hover:text-accent transition-colors">
            {trip.title}
          </h3>

          <p className="text-xs text-muted leading-relaxed mt-2 line-clamp-3">
            {trip.story}
          </p>

          {/* Highlights */}
          {trip.highlights && (
            <div className="mt-4 space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                Moments recorded:
              </span>
              <ul className="text-2xs text-ink/80 space-y-1 list-disc list-inside">
                {trip.highlights.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="line-clamp-1">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            iconRight={ArrowRight}
            onClick={() => onSelectTrip?.(trip)}
            className="w-full sm:w-auto"
          >
            Explore Journey
          </Button>
        </div>
      </div>
    </article>
  );
}

