import React from 'react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '../../lib/constants';
import { Camera, Heart, ArrowUp, Instagram, Compass, BookOpen } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-surface border-t border-line text-ink pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-line">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-pill bg-accent/15 flex items-center justify-center text-accent">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tight">
                Through My Frames
              </span>
            </Link>
            <p className="font-handwritten text-accent text-2xl">
              "Photos. Places. Thoughts."
            </p>
            <p className="text-xs text-muted max-w-md leading-relaxed">
              A quiet, curious art-journal and immersive 3D gallery where moments are held with reverence. Exploring the light between ancient stones, mountain silence, and unhurried afternoons.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-2xs uppercase tracking-widest text-muted font-mono font-semibold">
              Journals & Galleries
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="text-ink/80 hover:text-accent transition-colors">
                  Explore 3D Gallery
                </Link>
              </li>
              <li>
                <Link to="/wander" className="text-ink/80 hover:text-accent transition-colors">
                  Wander Journeys
                </Link>
              </li>
              <li>
                <Link to="/thoughts" className="text-ink/80 hover:text-accent transition-colors">
                  Living Thoughts
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-ink/80 hover:text-accent transition-colors">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link to="/moment" className="text-ink/80 hover:text-accent transition-colors">
                  Moment of the Day
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: The Photographer & Connect */}
          <div className="space-y-3">
            <h4 className="text-2xs uppercase tracking-widest text-muted font-mono font-semibold">
              The Photographer
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/photographer" className="text-ink/80 hover:text-accent transition-colors font-medium">
                  Ayush Misra's Story
                </Link>
              </li>
              <li>
                <Link to="/photographer#gear" className="text-ink/80 hover:text-accent transition-colors">
                  Camera Gear & Philosophy
                </Link>
              </li>
              <li>
                <Link to="/photographer#contact" className="text-ink/80 hover:text-accent transition-colors">
                  Inquiries & Prints
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-ink/80 hover:text-accent transition-colors">
                  Submit a Frame
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-muted">
          <p>
            © {APP_INFO.year} {APP_INFO.name}. Crafted with care and slow observation.
          </p>
          <div className="flex items-center gap-4">
            <span>Built by Ayush Misra</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-ink transition-colors p-1"
              aria-label="Scroll back to top"
            >
              Back to top <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

