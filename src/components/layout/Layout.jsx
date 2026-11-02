import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { CustomCursor } from '../ui/CustomCursor';
import { LoaderScreen } from '../ui/LoaderScreen';
import { ToastProvider } from '../ui/Toast';
import { useLenis } from '../../hooks/useLenis';

export function Layout({ children }) {
  // Initialize Lenis smooth scroll
  useLenis();

  return (
    <ToastProvider>
      <div className="relative min-h-screen flex flex-col bg-bg text-ink selection:bg-accent-soft/30 selection:text-ink">
        {/* Subtle Film Grain Texture Overlay */}
        <div className="film-grain" aria-hidden="true" />

        {/* Custom cursor for desktop */}
        <CustomCursor />

        {/* Initial First-Visit Camera Shutter Loader Screen */}
        <LoaderScreen />

        {/* Primary Navbar */}
        <Navbar />

        {/* Main Content with Route Transitions */}
        <div className="flex-1">
          <PageTransition>{children}</PageTransition>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </ToastProvider>
  );
}

