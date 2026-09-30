import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Soil layers data
const LAYERS = [
  { name: 'Topsoil',    depth: 0.5, color: '#4a2f1a', darkColor: '#3d2514', label: 'Organic Matter' },
  { name: 'Subsoil',   depth: 0.6, color: '#6b4226', darkColor: '#5a3520', label: 'Clay + Minerals' },
  { name: 'Bedrock',   depth: 0.7, color: '#8b6914', darkColor: '#7a5c10', label: 'Parent Material' },
];

// Soil cross-section box
function SoilLayer({ y, depth, color, index }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(clock.getElapsedTime() * 0.3 + index) * 0.03;
    }
  });

  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <boxGeometry args={[3.5, depth, 1.5]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
    </mesh>
  );
}

// Root system
function Roots() {
  const ref = useRef();
  const lines = useMemo(() => {
    const arr = [];
    const makeRoot = (startX, depth, spread) => {
      const pts = [];
      let x = startX, y = 0;
      for (let i = 0; i <= 12; i++) {
        pts.push(new THREE.Vector3(x, y, 0));
        y -= depth / 12;
        x += (Math.random() - 0.5) * spread;
      }
      return pts;
    };
    for (let i = 0; i < 12; i++) {
      arr.push(makeRoot((Math.random() - 0.5) * 1.5, 1.6 + Math.random() * 0.4, 0.3));
    }
    return arr;
  }, []);

  const geometries = useMemo(() =>
    lines.map(pts => new THREE.BufferGeometry().setFromPoints(pts)),
    [lines]
  );

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.4) * 0.03;
  });

  return (
    <group ref={ref} position={[0, 0.1, 0.1]}>
      {geometries.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial color="#6b3a2a" linewidth={1.5} transparent opacity={0.8} />
        </line>
      ))}
    </group>
  );
}

// Water moisture droplets
function MoistureParticles() {
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = -Math.random() * 1.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.001;
      if (pos[i * 3 + 1] > 0) pos[i * 3 + 1] = -1.8;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#60a5fa" transparent opacity={0.7} />
    </points>
  );
}

// Scene
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      <pointLight position={[-2, 1, 2]} intensity={0.4} color="#10b981" />

      {/* Layer boxes */}
      <SoilLayer y={-0.15} depth={0.45} color="#5a3520" index={0} />
      <SoilLayer y={-0.60} depth={0.55} color="#6b4226" index={1} />
      <SoilLayer y={-1.10} depth={0.60} color="#7a5a14" index={2} />

      {/* Top surface */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[3.5, 0.08, 1.5]} />
        <meshStandardMaterial color="#2d5a1b" roughness={0.95} />
      </mesh>

      <Roots />
      <MoistureParticles />
    </>
  );
}

export default function SoilLayers3D({ height = '200px' }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.5], fov: 55 }}
      style={{ width: '100%', height, borderRadius: '12px' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
