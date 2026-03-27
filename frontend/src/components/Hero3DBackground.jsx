import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Stars } from '@react-three/drei';

/* ───────────────────────────────────────────────
   Premium Sports Car – built from basic geometries
   with PBR clearcoat materials for a showroom look
   ─────────────────────────────────────────────── */
const PremiumCarMesh = () => {
  const carRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Gentle showcase rotation — like a turntable
    carRef.current.rotation.y = Math.sin(t * 0.25) * 0.4 + Math.PI * 0.2;
    carRef.current.position.y = Math.sin(t * 0.6) * 0.05;
  });

  const bodyMat = {
    color: '#0a1628',
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.5,
  };

  const glassMat = {
    color: '#0f2847',
    metalness: 0.2,
    roughness: 0.02,
    transmission: 0.7,
    opacity: 0.85,
    transparent: true,
    ior: 1.52,
    thickness: 0.15,
    envMapIntensity: 1,
  };

  return (
    <group ref={carRef} scale={1.15}>
      {/* ── UNDERBODY ── */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[4, 0.12, 1.7]} />
        <meshPhysicalMaterial color="#030608" metalness={0.8} roughness={0.6} />
      </mesh>

      {/* ── MAIN BODY ── */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[3.8, 0.38, 1.6]} />
        <meshPhysicalMaterial {...bodyMat} />
      </mesh>

      {/* Front fender / hood taper */}
      <mesh position={[1.5, 0.18, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[1.2, 0.3, 1.55]} />
        <meshPhysicalMaterial {...bodyMat} />
      </mesh>

      {/* Rear body */}
      <mesh position={[-1.4, 0.15, 0]}>
        <boxGeometry args={[1, 0.32, 1.55]} />
        <meshPhysicalMaterial {...bodyMat} />
      </mesh>

      {/* ── CABIN ── */}
      <mesh position={[-0.1, 0.52, 0]}>
        <boxGeometry args={[1.6, 0.42, 1.38]} />
        <meshPhysicalMaterial
          color="#060d18"
          metalness={0.92}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={2}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[-0.15, 0.74, 0]}>
        <boxGeometry args={[1.3, 0.04, 1.3]} />
        <meshPhysicalMaterial color="#040a14" metalness={0.95} roughness={0.05} clearcoat={1} />
      </mesh>

      {/* ── WINDSHIELD ── */}
      <mesh position={[0.6, 0.55, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.75, 0.38, 1.32]} />
        <meshPhysicalMaterial {...glassMat} />
      </mesh>

      {/* Rear window */}
      <mesh position={[-0.75, 0.52, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.55, 0.35, 1.32]} />
        <meshPhysicalMaterial {...glassMat} />
      </mesh>

      {/* ── WHEELS ── */}
      {[
        [-1.2, -0.22, 0.85],
        [1.2, -0.22, 0.85],
        [-1.2, -0.22, -0.85],
        [1.2, -0.22, -0.85],
      ].map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
            <meshStandardMaterial color="#111" roughness={0.85} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.21, 8]} />
            <meshPhysicalMaterial color="#2a2a2a" metalness={0.95} roughness={0.1} clearcoat={0.8} />
          </mesh>
        </group>
      ))}

      {/* ── HEADLIGHTS (LED strip) ── */}
      <mesh position={[1.91, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.06, 1.3]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>
      <mesh position={[1.92, 0.08, 0.55]}>
        <boxGeometry args={[0.02, 0.04, 0.25]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.92, 0.08, -0.55]}>
        <boxGeometry args={[0.02, 0.04, 0.25]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight position={[2.2, 0.15, 0]} color="#93c5fd" intensity={4} distance={6} decay={2} />

      {/* ── TAILLIGHTS ── */}
      <mesh position={[-1.91, 0.15, 0.5]}>
        <boxGeometry args={[0.02, 0.08, 0.4]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
      <mesh position={[-1.91, 0.15, -0.5]}>
        <boxGeometry args={[0.02, 0.08, 0.4]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
      <mesh position={[-1.91, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.03, 0.6]} />
        <meshBasicMaterial color="#dc2626" opacity={0.5} transparent />
      </mesh>
      <pointLight position={[-2.2, 0.15, 0]} color="#ef4444" intensity={2.5} distance={4} decay={2} />

      {/* ── SIDE ACCENT STRIPS ── */}
      <mesh position={[0, 0.02, 0.81]}>
        <boxGeometry args={[3.4, 0.015, 0.015]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0, 0.02, -0.81]}>
        <boxGeometry args={[3.4, 0.015, 0.015]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.6} transparent />
      </mesh>

      {/* ── UNDERGLOW ── */}
      <pointLight position={[0, -0.4, 0]} color="#2563eb" intensity={1.5} distance={2.5} decay={2} />
      <pointLight position={[1, -0.4, 0]} color="#1d4ed8" intensity={1} distance={2} decay={2} />
      <pointLight position={[-1, -0.4, 0]} color="#1d4ed8" intensity={1} distance={2} decay={2} />

      {/* ── FRONT GRILLE ── */}
      <mesh position={[1.9, 0, 0]}>
        <boxGeometry args={[0.05, 0.2, 1.3]} />
        <meshPhysicalMaterial color="#080808" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* ── REAR SPOILER ── */}
      <mesh position={[-1.85, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.03, 1.5]} />
        <meshPhysicalMaterial color="#0a0a0a" metalness={0.9} roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[-1.82, 0.3, 0.5]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshPhysicalMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-1.82, 0.3, -0.5]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshPhysicalMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

/* ─── Floating atmospheric dust particles ─── */
const FloatingParticles = ({ count = 100 }) => {
  const meshRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#60a5fa"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
};

/* ─── Main Component ─── */
const Hero3DBackground = () => {
  return (
    <div className="hero-3d-container">
      <Canvas camera={{ position: [0, 1.8, 7], fov: 42 }} dpr={[1, 2]}>
        <fog attach="fog" args={['#050a18', 10, 28]} />

        {/* Studio-style lighting */}
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} color="#e0f2fe" castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#818cf8" />
        <spotLight position={[0, 12, 2]} angle={0.25} penumbra={1} intensity={0.6} color="#3b82f6" />
        {/* Rim light for dramatic edge highlighting */}
        <spotLight position={[-8, 5, -3]} angle={0.4} penumbra={0.8} intensity={0.8} color="#6366f1" />

        <Stars radius={80} depth={50} count={2500} factor={3} saturation={0.2} fade speed={0.8} />
        <FloatingParticles />
        <Environment preset="night" />

        {/* Car positioned upper-left — above hero text, in free space */}
        <group position={[-2.5, 2.2, -1]}>
          <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
            <PremiumCarMesh />
          </Float>
        </group>
      </Canvas>
    </div>
  );
};

export default Hero3DBackground;
