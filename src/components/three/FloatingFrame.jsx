import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

export function FloatingFrame({
  id,
  imageUrl,
  fallbackUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1.2, 1.5, 1],
  speed = 1,
  floatIntensity = 0.2,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  // Create texture safely with Three.js TextureLoader to guarantee fallback handling
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    
    // Attempt loading primary image, fallback to placeholder if error
    const fallback = fallbackUrl || '/images/placeholder.jpg';
    const tex = loader.load(
      imageUrl,
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
  }, [imageUrl, fallbackUrl]);

  // Floating gentle motion
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    
    meshRef.current.position.y =
      position[1] + Math.sin(t + position[0]) * floatIntensity;
    meshRef.current.position.x =
      position[0] + Math.cos(t * 0.7 + position[2]) * (floatIntensity * 0.4);

    // Subtle rotation oscillation
    meshRef.current.rotation.z =
      rotation[2] + Math.sin(t * 0.5) * 0.04;
    meshRef.current.rotation.y =
      rotation[1] + (hovered ? 0.15 : Math.sin(t * 0.4) * 0.05);

    // Scale on hover
    const targetScale = hovered ? 1.08 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(scale[0] * targetScale, scale[1] * targetScale, 1),
      0.1
    );
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
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
        navigate(`/frame/${id}`);
      }}
    >
      {/* Outer frame border (mat) */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.08, 1.08]} />
        <meshStandardMaterial
          color={hovered ? '#C2693E' : '#2A2724'}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Frame border highlight */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.04, 1.04]} />
        <meshStandardMaterial
          color="#FAF7F2"
          roughness={0.9}
        />
      </mesh>

      {/* Photo texture plane */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

