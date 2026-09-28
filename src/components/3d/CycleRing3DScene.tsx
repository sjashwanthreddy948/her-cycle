import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface CycleRing3DSceneProps {
  currentCycleDay?: number;
  totalCycleLength?: number;
  interactive?: boolean;
}

const PHASE_COLORS = {
  menstrual: '#F43F5E',
  follicular: '#EC4899',
  ovulation: '#F59E0B',
  luteal: '#8B5CF6',
};

// Torus Segment Component
const TorusSegment: React.FC<{
  color: string;
  startAngle: number;
  arcLength: number;
  radius?: number;
  tube?: number;
}> = ({ color, startAngle, arcLength, radius = 1.6, tube = 0.14 }) => {
  return (
    <group rotation={[0, 0, startAngle]}>
      <mesh>
        <torusGeometry args={[radius, tube, 32, 64, arcLength]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.15}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

// Soft Ambient Particle Cloud
const FloatingParticles: React.FC<{ count?: number }> = ({ count = 35 }) => {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 6;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 6;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FDA4AF"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Interactive Ring Assembly
const RingAssembly: React.FC<{
  currentCycleDay: number;
  totalCycleLength: number;
}> = ({ currentCycleDay, totalCycleLength }) => {
  const groupRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  // Phase fractions based on standard physiological durations
  const radius = 1.6;
  const menstrualDays = 5;
  const follicularDays = 8; // days 6-13
  const ovulationDays = 3;  // days 14-16
  const lutealDays = Math.max(1, totalCycleLength - 16);

  const angleMenstrual = (menstrualDays / totalCycleLength) * Math.PI * 2;
  const angleFollicular = (follicularDays / totalCycleLength) * Math.PI * 2;
  const angleOvulation = (ovulationDays / totalCycleLength) * Math.PI * 2;
  const angleLuteal = (lutealDays / totalCycleLength) * Math.PI * 2;

  // Day marker position on torus (offset by -PI/2 so Day 1 starts at top)
  const dayFraction = totalCycleLength > 0 ? (Math.max(1, currentCycleDay) - 0.5) / totalCycleLength : 0;
  const markerAngle = -Math.PI / 2 + dayFraction * Math.PI * 2;
  const markerX = Math.cos(markerAngle) * radius;
  const markerY = -Math.sin(markerAngle) * radius; // In Three.js y is up

  useFrame((state) => {
    if (!groupRef.current) return;

    // React to pointer / mouse tilt
    const { pointer } = state;
    targetRotation.current.x = -pointer.y * 0.25;
    targetRotation.current.y = pointer.x * 0.35;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.current.x,
      0.05
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.current.y,
      0.05
    );

    // Floating breathing motion
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.05;

    // Pulse marker glow
    if (markerRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      markerRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 4 Segmented Torus in Phase Colors */}
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* Menstrual Phase (Day 1 - 5) */}
        <TorusSegment
          color={PHASE_COLORS.menstrual}
          startAngle={0}
          arcLength={angleMenstrual}
          radius={radius}
        />
        {/* Follicular Phase */}
        <TorusSegment
          color={PHASE_COLORS.follicular}
          startAngle={angleMenstrual}
          arcLength={angleFollicular}
          radius={radius}
        />
        {/* Ovulation Phase */}
        <TorusSegment
          color={PHASE_COLORS.ovulation}
          startAngle={angleMenstrual + angleFollicular}
          arcLength={angleOvulation}
          radius={radius}
        />
        {/* Luteal Phase */}
        <TorusSegment
          color={PHASE_COLORS.luteal}
          startAngle={angleMenstrual + angleFollicular + angleOvulation}
          arcLength={angleLuteal}
          radius={radius}
        />
      </group>

      {/* Glowing Day Marker */}
      {currentCycleDay > 0 && (
        <group position={[markerX, markerY, 0.15]}>
          <mesh ref={markerRef}>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#F43F5E"
              emissiveIntensity={1.8}
              roughness={0.1}
            />
          </mesh>
          <pointLight color="#F43F5E" intensity={1.5} distance={1.2} />
        </group>
      )}

      {/* Soft Ambient Inner Glow Disc */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[1.35, 48]} />
        <meshBasicMaterial
          color="#FFF5F7"
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
};

export const CycleRing3DScene: React.FC<CycleRing3DSceneProps> = ({
  currentCycleDay = 12,
  totalCycleLength = 28,
}) => {
  const [tabVisible, setTabVisible] = useState(true);

  // Pause rendering when the tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      setTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        dpr={[1, 2]} // Cap devicePixelRatio at 2
        frameloop={tabVisible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 4]} intensity={1.2} color="#FFF0F5" />
        <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#8B5CF6" />
        <pointLight position={[0, 0, 3]} intensity={0.6} color="#FB7185" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <RingAssembly
            currentCycleDay={currentCycleDay}
            totalCycleLength={totalCycleLength}
          />
        </Float>

        <FloatingParticles count={35} />
      </Canvas>
    </div>
  );
};

export default CycleRing3DScene;
