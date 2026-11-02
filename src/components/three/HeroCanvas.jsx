import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FloatingFrame } from './FloatingFrame';
import { FallbackHero } from './FallbackHero';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTheme } from '../../hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

// Camera rig that handles both mouse parallax and GSAP scroll push-through
function CameraRig({ scrollProgressRef }) {
  const { camera, pointer } = useThree();
  const vec = useRef(new THREE.Vector3());

  useFrame(() => {
    // Scroll progress pushes camera forward through the floating frames
    const scrollZ = (scrollProgressRef.current || 0) * -10;
    
    // Parallax mouse movement
    const targetX = pointer.x * 0.8;
    const targetY = pointer.y * 0.6;
    const targetZ = 5 + scrollZ;

    camera.position.lerp(vec.current.set(targetX, targetY, targetZ), 0.05);
    camera.lookAt(0, 0, targetZ - 6);
  });

  return null;
}

// Scene with lighting, depth fog, and positioned floating frames
function HeroScene({ frames, isDark, scrollProgressRef }) {
  const fogColor = isDark ? '#0F0E0D' : '#FAF7F2';

  // 6 floating frames positioned in 3D depth
  const frameConfigs = [
    { pos: [-2.6, 1.2, 0.5], rot: [0.05, 0.2, -0.05], scale: [1.3, 1.6, 1], speed: 0.8 },
    { pos: [2.5, 0.8, -1.5], rot: [-0.04, -0.22, 0.06], scale: [1.4, 1.5, 1], speed: 0.9 },
    { pos: [-1.8, -1.4, -3.2], rot: [0.08, 0.15, 0.04], scale: [1.5, 1.2, 1], speed: 1.1 },
    { pos: [2.0, -1.0, -5.0], rot: [-0.06, -0.18, -0.05], scale: [1.6, 1.3, 1], speed: 0.7 },
    { pos: [-2.2, 1.8, -7.5], rot: [0.04, 0.25, 0.08], scale: [1.7, 1.4, 1], speed: 1.0 },
    { pos: [1.5, 1.5, -9.5], rot: [-0.05, -0.2, -0.06], scale: [1.8, 1.5, 1], speed: 0.85 },
  ];

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 4, 18]} />

      {/* Atmospheric Soft Lighting */}
      <ambientLight intensity={isDark ? 0.6 : 0.85} />
      <directionalLight position={[6, 8, 5]} intensity={isDark ? 0.8 : 1.1} color="#FFF5EA" />
      <directionalLight position={[-6, -4, -2]} intensity={0.3} color="#C2693E" />

      {/* Camera Rig with Parallax + Scroll push */}
      <CameraRig scrollProgressRef={scrollProgressRef} />

      {/* Floating frames */}
      {frames.slice(0, 6).map((frame, index) => {
        const conf = frameConfigs[index] || frameConfigs[0];
        return (
          <FloatingFrame
            key={frame.id}
            id={frame.id}
            imageUrl={frame.image}
            fallbackUrl={frame.fallbackImage}
            position={conf.pos}
            rotation={conf.rot}
            scale={conf.scale}
            speed={conf.speed}
            floatIntensity={0.15}
          />
        );
      })}
    </>
  );
}

export function HeroCanvas({ frames = [] }) {
  const containerRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const prefersReduced = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isDark } = useTheme();

  // Test WebGL availability safely
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // GSAP ScrollTrigger to move camera and fade text
  useEffect(() => {
    if (prefersReduced || isMobile || !containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });

    // IntersectionObserver to pause rendering when scrolled past hero
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);

    return () => {
      trigger.kill();
      observer.disconnect();
    };
  }, [prefersReduced, isMobile]);

  // Graceful 2D Fallback on mobile, reduced motion, or WebGL absence
  if (prefersReduced || isMobile || !hasWebGL) {
    return <FallbackHero featuredFrames={frames} />;
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen min-h-[680px] overflow-hidden">
      {/* 3D R3F Canvas */}
      {isVisible && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="absolute inset-0 z-0 select-none"
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <HeroScene
              frames={frames}
              isDark={isDark}
              scrollProgressRef={scrollProgressRef}
            />
          </Suspense>
        </Canvas>
      )}

      {/* Floating Foreground Hero Overlay Text */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center text-center px-4">
        <div className="pointer-events-auto max-w-2xl px-6 py-8 rounded-3xl glass-panel shadow-warm-lg backdrop-blur-md">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold mb-4">
            Through My Frames 2.0
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-ink mb-4 leading-tight">
            Photos. Places. Thoughts.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed max-w-lg mx-auto mb-7">
            A quiet, curious art-journal where light meets memory. Drift through floating moments or wander into stories crafted with slow reverence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#featured-frames"
              className="inline-flex items-center justify-center font-medium rounded-pill transition-all duration-200 text-xs px-5 py-2.5 gap-2 bg-accent text-white hover:bg-accent-hover shadow-warm-sm"
            >
              Enter the Gallery
            </a>
            <a
              href="#moment-of-day"
              className="inline-flex items-center justify-center font-medium rounded-pill transition-all duration-200 text-xs px-5 py-2.5 gap-2 bg-surface text-ink border border-line hover:border-accent hover:text-accent shadow-warm-sm"
            >
              Moment of the Day
            </a>
          </div>
        </div>

        {/* Scroll down prompt */}
        <div className="absolute bottom-6 flex flex-col items-center gap-2 text-muted animate-bounce pointer-events-none">
          <span className="text-[10px] uppercase font-mono tracking-widest">
            Scroll to drift through
          </span>
          <div className="w-4 h-7 rounded-pill border border-line flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

