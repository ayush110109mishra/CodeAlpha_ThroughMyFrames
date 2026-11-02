import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Camera, Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
      <div className="w-20 h-20 rounded-full bg-accent-soft/20 flex items-center justify-center text-accent mb-6">
        <Camera className="w-10 h-10" />
      </div>

      <span className="font-mono text-2xs uppercase tracking-widest text-accent font-semibold mb-2">
        Error 404 • Out of Frame
      </span>

      <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink mb-3">
        Moment Lost to the Mist
      </h1>

      <p className="font-handwritten text-2xl text-accent max-w-md mb-4">
        "Some views cannot be recovered; they exist only in the quiet of what was."
      </p>

      <p className="text-xs text-muted max-w-sm mb-8 leading-relaxed">
        The route or frame you are looking for has moved, faded into twilight, or never was.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={ArrowLeft}>
            Return Home
          </Button>
        </Link>
        <Link to="/explore">
          <Button variant="secondary" size="md" icon={Compass}>
            Explore All Frames
          </Button>
        </Link>
      </div>
    </div>
  );
}

