import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const RED = "#db1125";

function WireSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += d * 0.2;
    ref.current.rotation.x += d * 0.06;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.6, 2]} />
      <meshBasicMaterial color={RED} wireframe transparent opacity={0.55} />
    </mesh>
  );
}

function Orbit({
  radius,
  rotation,
  speed,
  opacity = 0.5,
  thickness = 0.005,
}: {
  radius: number;
  rotation: [number, number, number];
  speed: [number, number, number];
  opacity?: number;
  thickness?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.x += d * speed[0];
    ref.current.rotation.y += d * speed[1];
    ref.current.rotation.z += d * speed[2];
  });
  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, thickness, 12, 128]} />
      <meshBasicMaterial color={RED} transparent opacity={opacity} />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0, 0.1, 4.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} />
      <pointLight position={[-3, 2, 3]} intensity={1.2} color={RED} />
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.45}>
        <WireSphere />
        <Orbit radius={0.9} rotation={[0, 0, 0]} speed={[0.25, 0, 0.15]} opacity={0.55} />
        <Orbit
          radius={1.15}
          rotation={[Math.PI / 2.5, Math.PI / 6, 0]}
          speed={[0, 0.3, 0.1]}
          opacity={0.35}
          thickness={0.004}
        />
      </Float>
    </Canvas>
  );
}
