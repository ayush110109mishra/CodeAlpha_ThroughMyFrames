import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

function CarouselItem({ frame, angle, radius, onSelect, isActive }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Calculate position on curved cylinder
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius - radius;
  const rotY = angle;

  // Safe texture loader
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const fallback = frame.fallbackImage || '/images/placeholder.jpg';
    const tex = loader.load(
      frame.image,
      undefined,
      undefined,
      () => {
        loader.load(fallback, (fallbackTex) => {
          if (meshRef.current) {
            tex.image = fallbackTex.image;
            tex.needsUpdate = true;
          }
        });
      }
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [frame.image, frame.fallbackImage]);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.08 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
  });

  return (
    <group
      ref={meshRef}
      position={[x, 0, z]}
      rotation={[0, rotY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        onSelect(frame.id);
      }}
    >
      {/* Outer Frame Frame/Border */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.56, 1.96]} />
        <meshStandardMaterial
          color={hovered ? '#C2693E' : '#1C1B19'}
          roughness={0.7}
        />
      </mesh>

      {/* Mat White Border */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshStandardMaterial color="#FAF7F2" roughness={0.9} />
      </mesh>

      {/* Frame photo image plane */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function CurvedGallery({ frames, activeIndex, onSelectFrame, rotationOffsetRef }) {
  const groupRef = useRef();
  const radius = 6.5;
  const count = frames.length || 1;
  const step = (Math.PI * 1.5) / count;

  useFrame(() => {
    if (!groupRef.current) return;
    // Smoothly interpolate rotation to current offset
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      rotationOffsetRef.current,
      0.08
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, -1]}>
      {frames.map((frame, i) => {
        const angle = (i - count / 2) * step;
        return (
          <CarouselItem
            key={frame.id}
            frame={frame}
            angle={angle}
            radius={radius}
            onSelect={onSelectFrame}
            isActive={i === activeIndex}
          />
        );
      })}
    </group>
  );
}

