import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS, APP_INFO } from '../../lib/constants';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';
import {
  Sun,
  Moon,
  Plus,
  Menu,
  X,
  Camera,
  User,
  Compass,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'glass-panel py-3 shadow-warm-sm border-b border-line'
            : isHomePage
            ? 'bg-transparent py-5'
            : 'bg-bg/80 backdrop-blur-md py-4 border-b border-line/50'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
            aria-label="Through My Frames - Home"
          >
            <div className="w-8 h-8 rounded-pill bg-accent/15 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-medium tracking-tight text-ink">
                Through My Frames
              </span>
              <span className="text-[10px] tracking-widest uppercase text-muted font-mono -mt-1 hidden sm:block">
                Photos. Places. Thoughts.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-pill text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent/15 text-accent font-semibold'
                      : 'text-ink/80 hover:text-accent hover:bg-surface/60'
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Action Tools: Upload CTA, Theme Toggle, Profile, Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Create/Upload Frame Button */}
            <Link to="/upload" className="hidden sm:inline-flex">
              <Button size="sm" variant="primary" icon={Plus}>
                Create Frame
              </Button>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-line bg-surface/80 text-ink hover:text-accent hover:border-accent transition-all focus:outline-none focus:ring-2 focus:ring-accent shadow-warm-sm"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-ink" />
              )}
            </button>

            {/* Profile Avatar / Login */}
            <Link
              to="/u/ayushmisra"
              className="hidden sm:flex items-center p-0.5 rounded-full border border-line hover:border-accent transition-colors"
              title="View Profile (Ayush Misra)"
            >
              <img
                src="/images/honey.jpg"
                alt="Ayush Misra"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
                className="w-7 h-7 rounded-full object-cover"
              />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full border border-line bg-surface text-ink hover:text-accent transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-surface border-l border-line z-50 p-6 flex flex-col justify-between md:hidden shadow-warm-lg"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-line">
                  <span className="font-serif text-lg font-medium text-ink">
                    Menu
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-muted hover:text-ink"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 mt-6">
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        cn(
                          'px-4 py-3 rounded-card text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-accent/15 text-accent font-semibold'
                            : 'text-ink/80 hover:text-accent hover:bg-bg'
                        )
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                  <NavLink
                    to="/upload"
                    className="px-4 py-3 rounded-card text-sm font-medium text-accent hover:bg-accent/10 flex items-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Create Frame
                  </NavLink>
                  <NavLink
                    to="/u/ayushmisra"
                    className="px-4 py-3 rounded-card text-sm font-medium text-ink hover:bg-bg flex items-center gap-2"
                  >
                    <User className="w-4 h-4" /> Photographer Profile
                  </NavLink>
                </div>
              </div>

              <div className="pt-6 border-t border-line text-2xs text-muted">
                <p className="font-serif text-ink font-medium text-xs mb-1">
                  Through My Frames 2.0
                </p>
                <p>Curated by Ayush Misra</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

