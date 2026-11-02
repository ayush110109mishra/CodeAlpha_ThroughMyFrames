import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorState, setCursorState] = useState('default'); // 'default', 'hover', 'view'
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on non-touch desktop devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const onMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target.closest('[data-cursor]');
      if (target) {
        setCursorState(target.getAttribute('data-cursor') || 'view');
      } else {
        const isClickable = e.target.closest('button, a, input, textarea, [role="button"]');
        setCursorState(isClickable ? 'hover' : 'default');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isView = cursorState === 'view';
  const isHover = cursorState === 'hover';

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-center justify-center font-sans"
      animate={{
        x: mousePosition.x - (isView ? 36 : isHover ? 16 : 6),
        y: mousePosition.y - (isView ? 36 : isHover ? 16 : 6),
        width: isView ? 72 : isHover ? 32 : 12,
        height: isView ? 72 : isHover ? 32 : 12,
        backgroundColor: isView
          ? 'rgba(194, 105, 62, 0.9)'
          : isHover
          ? 'rgba(194, 105, 62, 0.25)'
          : 'var(--color-accent)',
        borderRadius: 999,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        damping: 28,
        stiffness: 350,
        mass: 0.4,
      }}
    >
      {isView && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-[11px] font-semibold uppercase tracking-wider select-none"
        >
          View
        </motion.span>
      )}
    </motion.div>
  );
}

