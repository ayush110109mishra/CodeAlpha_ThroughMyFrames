import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoaderScreen() {
  const [show, setShow] = useState(() => {
    // Check if shown this session
    try {
      const alreadyLoaded = sessionStorage.getItem('tmf_has_loaded');
      return !alreadyLoaded;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem('tmf_has_loaded', 'true');
      } catch (e) {}
    }, 1500); // Under 2 seconds

    return () => clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-[100000] bg-bg flex flex-col items-center justify-center pointer-events-auto"
      >
        {/* Shutter Blade Graphic */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <motion.svg
            viewBox="0 0 100 100"
            className="w-full h-full text-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            {/* Shutter circle rim */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-30"
            />
            {/* Aperture blades */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <line
                key={i}
                x1="50"
                y1="10"
                x2="85"
                y2="50"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${deg} 50 50)`}
                className="opacity-70"
              />
            ))}
          </motion.svg>

          {/* Aperture Center Pulse */}
          <motion.div
            animate={{
              scale: [1, 0.4, 1.8, 1],
              opacity: [0.8, 1, 0.2, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-6 h-6 rounded-full bg-accent/40 blur-[2px]"
          />
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <h2 className="font-serif text-lg tracking-widest uppercase text-ink">
            Through My Frames
          </h2>
          <p className="font-handwritten text-accent text-lg mt-1">
            Focusing light & moments...
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

