import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Moon,
  Sun,
  Menu,
  X,
  Plus,
  User,
  Bookmark,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { NAV_LINKS } from '../../lib/constants';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const allowSignup =
    (import.meta.env.VITE_ALLOW_SIGNUP || import.meta.env.ALLOW_SIGNUP || 'true') !== 'false';

  // Dark/Light theme toggle
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Scroll detection for backdrop blur intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    showToast('You have been logged out safely', 'info');
    navigate('/');
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md',
          scrolled
            ? 'bg-surface/85 border-b border-line shadow-warm-sm py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Identity / Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="Through My Frames - Return to Home"
          >
            <div className="w-8 h-8 rounded-pill bg-accent/15 flex items-center justify-center text-accent group-hover:scale-105 transition-transform duration-300">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-serif text-lg sm:text-xl font-medium tracking-tight text-ink group-hover:text-accent transition-colors">
              Through My Frames
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface/70 border border-line rounded-pill px-3 py-1 shadow-warm-sm backdrop-blur-md">
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

          {/* Action Tools: Upload CTA, Theme Toggle, Profile Menu, Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Create/Upload Frame Button */}
            <Link
              to={isAuthenticated ? '/upload' : '/login?redirect=/upload'}
              className="hidden sm:inline-flex"
            >
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

            {/* Authenticated User Avatar Menu OR Login / Signup Links */}
            {isAuthenticated && user ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center p-0.5 rounded-full border border-line hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                  title={`${user.name} (@${user.username})`}
                  aria-label="User account menu"
                >
                  <img
                    src={user.avatar || '/images/honey.jpg'}
                    alt={user.name}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-line shadow-warm-lg py-2 z-50 text-xs"
                    >
                      <div className="px-4 py-2 border-b border-line">
                        <p className="font-medium text-ink truncate">{user.name}</p>
                        <p className="text-2xs text-muted font-mono truncate">
                          @{user.username}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/u/${user.username}`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ink hover:text-accent hover:bg-bg transition-colors"
                        >
                          <User className="w-4 h-4 text-muted" />
                          My Profile
                        </Link>
                        <Link
                          to={`/u/${user.username}?tab=saved`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ink hover:text-accent hover:bg-bg transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-muted" />
                          Saved Frames
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-line">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm" icon={LogIn}>
                    Log in
                  </Button>
                </Link>
                {allowSignup && (
                  <Link to="/signup">
                    <Button variant="outline" size="sm" icon={UserPlus}>
                      Sign up
                    </Button>
                  </Link>
                )}
              </div>
            )}

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
                  <span className="font-serif text-lg font-medium text-ink">Menu</span>
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
                      onClick={() => setMobileMenuOpen(false)}
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
                    to={isAuthenticated ? '/upload' : '/login?redirect=/upload'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-card text-sm font-medium text-accent hover:bg-accent/10 flex items-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Create Frame
                  </NavLink>

                  {isAuthenticated && user ? (
                    <>
                      <NavLink
                        to={`/u/${user.username}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-card text-sm font-medium text-ink hover:bg-bg flex items-center gap-2"
                      >
                        <User className="w-4 h-4" /> My Profile (@{user.username})
                      </NavLink>
                      <NavLink
                        to={`/u/${user.username}?tab=saved`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-card text-sm font-medium text-ink hover:bg-bg flex items-center gap-2"
                      >
                        <Bookmark className="w-4 h-4" /> Saved Frames
                      </NavLink>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-3 rounded-card text-sm font-medium text-red-600 hover:bg-red-500/10 flex items-center gap-2 text-left"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </>
                  ) : (
                    <div className="pt-4 border-t border-line flex flex-col gap-2 mt-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 rounded-pill border border-line text-xs font-medium text-ink hover:text-accent"
                      >
                        Log in
                      </Link>
                      {allowSignup && (
                        <Link
                          to="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full text-center py-2.5 rounded-pill bg-accent text-white text-xs font-medium hover:bg-accent/90"
                        >
                          Sign up
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-line text-2xs text-muted">
                <p className="font-serif text-ink font-medium text-xs mb-1">
                  Through My Frames 2.0
                </p>
                <p>Curated by Ayush Mishra</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
