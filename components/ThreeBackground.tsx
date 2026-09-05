"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Random float generator
const randomFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

function ParticleSwarm() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random points in a sphere
  const sphere = useMemo(() => {
    const numPoints = 1500;
    const positions = new Float32Array(numPoints * 3);
    for (let i = 0; i < numPoints; i++) {
      const theta = randomFloat(0, Math.PI * 2);
      const phi = Math.acos(randomFloat(-1, 1));
      const radius = randomFloat(1, 15);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x -= delta / 10;
      pointsRef.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={pointsRef}
        positions={sphere}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#06b6d4" // Cyan 500
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-background">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ParticleSwarm />
      </Canvas>
    </div>
  );
}
