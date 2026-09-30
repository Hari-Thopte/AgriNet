import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

// ── BRICS country positions (lat/lon → spherical) ───────────────────────────
const BRICS = [
  { name: 'Brazil',       lat: -15, lon: -47, color: '#10b981' },
  { name: 'Russia',       lat:  55, lon:  37, color: '#3b82f6' },
  { name: 'India',        lat:  28, lon:  77, color: '#f59e0b' },
  { name: 'China',        lat:  39, lon: 116, color: '#ef4444' },
  { name: 'South Africa', lat: -26, lon:  28, color: '#8b5cf6' },
];

function latLonToVec3(lat, lon, r = 1.05) {
  const phi   = (90  - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

function Globe() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.12;
  });

  return (
    <group ref={ref}>
      {/* Ocean sphere */}
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#0c4a6e"
          roughness={0.4}
          metalness={0.1}
          distort={0.08}
          speed={1.5}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.06, 32, 32]}>
        <meshBasicMaterial color="#10b981" transparent opacity={0.04} side={THREE.BackSide} />
      </Sphere>

      {/* BRICS country markers */}
      {BRICS.map(c => {
        const pos = latLonToVec3(c.lat, c.lon);
        return (
          <group key={c.name}>
            {/* Dot */}
            <mesh position={pos}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={1.2} />
            </mesh>
            {/* Pulse ring */}
            <mesh position={pos}>
              <ringGeometry args={[0.035, 0.055, 24]} />
              <meshBasicMaterial color={c.color} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}

      {/* Connection arcs as line segments */}
      {BRICS.map((a, i) =>
        BRICS.slice(i + 1).map(b => (
          <ArcLine key={`${a.name}-${b.name}`} from={latLonToVec3(a.lat, a.lon)} to={latLonToVec3(b.lat, b.lon)} color={a.color} />
        ))
      )}
    </group>
  );
}

function ArcLine({ from, to, color }) {
  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 30; i++) {
      const t   = i / 30;
      const mid = new THREE.Vector3().lerpVectors(from, to, t);
      mid.normalize().multiplyScalar(1.2 + 0.15 * Math.sin(Math.PI * t));
      arr.push(mid);
    }
    return arr;
  }, [from, to]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.25} />
    </line>
  );
}

function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi   = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r     = 1.5 + Math.random() * 1.5;
      pos[i * 3]     = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.cos(theta);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#10b981" transparent opacity={0.7} />
    </points>
  );
}

function FloatingLeaf() {
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={0.8}>
      <mesh position={[1.8, 0.5, 0]} rotation={[0.3, 0.5, 0.2]}>
        <torusGeometry args={[0.12, 0.04, 8, 32]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} roughness={0.3} metalness={0.5} />
      </mesh>
    </Float>
  );
}

export default function GlobeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />
      <Stars radius={80} depth={50} count={3000} factor={3} saturation={0.5} fade speed={0.5} />
      <Globe />
      <Particles />
      <FloatingLeaf />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}
