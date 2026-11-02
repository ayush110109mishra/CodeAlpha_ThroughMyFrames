import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CurvedGallery } from './CurvedGallery';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export function GalleryCanvas({ frames = [] }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const rotationOffsetRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const currentRotation = useRef(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  const fogColor = isDark ? '#0F0E0D' : '#FAF7F2';

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    currentRotation.current = rotationOffsetRef.current;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    rotationOffsetRef.current = currentRotation.current + deltaX * 0.004;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    rotationOffsetRef.current -= e.deltaY * 0.0015;
  };

  const stepRotation = (direction) => {
    const step = 0.35;
    rotationOffsetRef.current += direction * step;
  };

  const handleSelectFrame = (id) => {
    navigate(`/frame/${id}`);
  };

  return (
    <div
      className="relative w-full h-[620px] sm:h-[700px] rounded-2xl overflow-hidden border border-line bg-surface select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[fogColor]} />
        <fog attach="fog" args={[fogColor, 5, 14]} />
        <ambientLight intensity={isDark ? 0.7 : 0.9} />
        <directionalLight position={[5, 10, 7]} intensity={1.2} />
        <directionalLight position={[-5, -5, -2]} intensity={0.3} color="#C2693E" />

        <Suspense fallback={null}>
          <CurvedGallery
            frames={frames}
            activeIndex={activeFrameIndex}
            onSelectFrame={handleSelectFrame}
            rotationOffsetRef={rotationOffsetRef}
          />
        </Suspense>
      </Canvas>

      {/* Top Instructions */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill glass-panel text-2xs font-mono uppercase tracking-wider text-muted">
          <Sparkles className="w-3 h-3 text-accent" /> Drag or scroll to rotate curved gallery
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill glass-panel text-2xs font-medium text-ink">
          Click frame to inspect
        </span>
      </div>

      {/* Prev / Next Carousel Controls */}
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            stepRotation(1);
          }}
          className="pointer-events-auto p-3 rounded-full glass-panel text-ink hover:text-accent hover:border-accent transition-all shadow-warm-md"
          aria-label="Rotate left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            stepRotation(-1);
          }}
          className="pointer-events-auto p-3 rounded-full glass-panel text-ink hover:text-accent hover:border-accent transition-all shadow-warm-md"
          aria-label="Rotate right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom hint bar */}
      <div className="absolute bottom-4 inset-x-4 flex items-center justify-center pointer-events-none z-10">
        <div className="glass-panel px-4 py-2 rounded-pill shadow-warm-sm flex items-center gap-2 text-2xs text-muted">
          <Eye className="w-3.5 h-3.5 text-accent" />
          <span>Interactive 3D Wall • Switch to Masonry Grid anytime above</span>
        </div>
      </div>
    </div>
  );
}

