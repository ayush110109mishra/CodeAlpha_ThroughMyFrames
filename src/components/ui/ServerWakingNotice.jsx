import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * ==============================================================================
 * Server Waking Notice Component
 * ==============================================================================
 * Displays a friendly toast when a backend request takes longer than 4 seconds,
 * typically caused by Render's free tier instance waking up from sleep mode (~30s).
 */

export function ServerWakingNotice() {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    const handleWaking = (e) => {
      setIsWaking(Boolean(e.detail?.waking));
    };

    window.addEventListener('server:waking', handleWaking);
    return () => window.removeEventListener('server:waking', handleWaking);
  }, []);

  return (
    <AnimatePresence>
      {isWaking && (
        <motion.aside
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-3 rounded-2xl bg-surface/95 backdrop-blur-md border border-accent/30 shadow-warm-lg text-ink flex items-center gap-3.5"
          role="status"
          aria-live="polite"
        >
          <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
          </div>
          <div className="space-y-0.5 text-left">
            <p className="text-xs font-medium text-ink flex items-center gap-1.5">
              <span>Waking up the living server</span>
              <Sparkles className="w-3 h-3 text-accent" />
            </p>
            <p className="text-[11px] text-muted leading-tight">
              Render's free tier sleeps when quiet. This takes about 30 seconds to breathe back to life.
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
