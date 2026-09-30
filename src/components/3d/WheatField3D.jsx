import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Animated wheat stalk
function WheatStalk({ position, phase }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // Gentle swaying
    ref.current.rotation.z = Math.sin(t * 0.8 + phase) * 0.12 + Math.sin(t * 1.5 + phase * 2) * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.6 + phase) * 0.04;
  });

  const segments = 5;
  return (
    <group ref={ref} position={position}>
      {/* Stalk segments */}
      {Array.from({ length: segments }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.18, 0]}>
          <cylinderGeometry args={[0.012 - i * 0.001, 0.015 - i * 0.001, 0.18, 6]} />
          <meshStandardMaterial
            color={`hsl(${90 + i * 5}, ${60 - i * 5}%, ${35 + i * 4}%)`}
            roughness={0.8}
          />
        </mesh>
      ))}
      {/* Wheat head - grain cluster */}
      {[-0.06, 0, 0.06].map((ox, j) => (
        <mesh key={j} position={[ox, segments * 0.18 + 0.1, 0]} rotation={[0, 0, ox * 2]}>
          <capsuleGeometry args={[0.02, 0.12, 4, 8]} />
          <meshStandardMaterial
            color="#d4af37"
            roughness={0.6}
            metalness={0.1}
            emissive="#8b6914"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

// Soil ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
      <planeGeometry args={[20, 20, 1, 1]} />
      <meshStandardMaterial color="#3d2b1f" roughness={1} metalness={0} />
    </mesh>
  );
}

// Sun
function Sun() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.15;
  });
  return (
    <Float speed={0.5} floatIntensity={0.3}>
      <group ref={ref} position={[3, 3, -2]}>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2} />
        </mesh>
        {/* Rays */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0]} rotation={[0, 0, angle]}>
              <cylinderGeometry args={[0.012, 0.003, 0.3, 4]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.7} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

// Cloud
function Cloud({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * 0.3) * 0.3;
  });
  return (
    <group ref={ref} position={position}>
      {[
        [0, 0, 0, 0.25],
        [-0.28, -0.06, 0, 0.18],
        [0.28, -0.06, 0, 0.18],
        [0.12, 0.08, 0, 0.16],
        [-0.12, 0.08, 0, 0.16],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 12]} />
          <meshStandardMaterial color="white" roughness={1} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// Full wheat field scene
function Scene() {
  const stalks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      arr.push({
        id: i,
        x: (Math.random() - 0.5) * 6,
        z: (Math.random() - 0.5) * 5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <>
      <Stars radius={50} depth={30} count={1000} factor={2} fade speed={0.3} />
      <ambientLight intensity={0.7} color="#e0f0ff" />
      <directionalLight position={[4, 6, 2]} intensity={1.5} color="#fff8e7" castShadow />
      <pointLight position={[-3, 3, -2]} intensity={0.5} color="#10b981" />
      <Sun />
      <Cloud position={[-2.5, 2.5, -2]} />
      <Cloud position={[1.8, 2.2, -3]} />
      <Ground />
      {stalks.map(s => (
        <WheatStalk key={s.id} position={[s.x, -0.02, s.z]} phase={s.phase} />
      ))}
    </>
  );
}

export default function WheatField3D({ height = '220px' }) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 4], fov: 55 }}
      style={{ width: '100%', height }}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <Scene />
    </Canvas>
  );
}
