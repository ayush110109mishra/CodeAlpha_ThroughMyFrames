import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function PageTransition({ children }) {
  const { pathname } = useLocation();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (prefersReduced) {
    return <main>{children}</main>;
  }

  return (
    <motion.main
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[calc(100vh-200px)] flex flex-col"
    >
      {children}
    </motion.main>
  );
}

