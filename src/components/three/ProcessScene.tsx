import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const RED = "#db1125";
const INK = "#1a1a1f";

const VASE_HEIGHT = 2.4;
const VASE_BASE_Y = -1.2;
const LAYER_THICKNESS = 0.018; // ~ visible printed layer

function Vase({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), VASE_BASE_Y),
    [],
  );
  const layerMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: INK,
      metalness: 0.25,
      roughness: 0.65,
      clippingPlanes: [clipPlane],
      clipShadows: true,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uLayer = { value: LAYER_THICKNESS };
      shader.uniforms.uGlowY = { value: VASE_BASE_Y };
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vWorldPos;`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed,1.0)).xyz;`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>\nuniform float uLayer;\nuniform float uGlowY;\nvarying vec3 vWorldPos;`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>\n
        float band = mod(vWorldPos.y, uLayer) / uLayer;
        float groove = smoothstep(0.0, 0.18, band) * smoothstep(1.0, 0.82, band);
        gl_FragColor.rgb *= mix(0.78, 1.05, groove);
        float dGlow = clamp(1.0 - (uGlowY - vWorldPos.y) / (uLayer * 2.5), 0.0, 1.0);
        gl_FragColor.rgb += vec3(0.86, 0.07, 0.14) * dGlow * 0.55;
        `,
      );
      (m.userData as { shader?: THREE.WebGLProgramParametersWithUniforms }).shader = shader;
    };
    return m;
  }, [clipPlane]);

  const points = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = t * VASE_HEIGHT;
      const r = 0.55 + 0.3 * Math.sin(t * Math.PI * 1.15);
      pts.push(new THREE.Vector2(Math.max(0.05, r), y));
    }
    return pts;
  }, []);

  useFrame((_, d) => {
    const p = THREE.MathUtils.clamp(progress.get(), 0, 1);
    if (groupRef.current) groupRef.current.rotation.y += d * 0.25;
    const curY = VASE_BASE_Y + p * VASE_HEIGHT;
    clipPlane.constant = curY;
    const shader = (layerMat.userData as { shader?: THREE.WebGLProgramParametersWithUniforms })
      .shader;
    if (shader) shader.uniforms.uGlowY.value = curY;
    if (ringRef.current) {
      ringRef.current.position.y = p * VASE_HEIGHT;
      ringRef.current.visible = p > 0.01 && p < 0.99;
      const r = 0.55 + 0.3 * Math.sin(p * Math.PI * 1.15);
      ringRef.current.scale.set(r / 0.7, r / 0.7, 1);
    }
  });

  return (
    <group ref={groupRef} position={[0, VASE_BASE_Y, 0]}>
      {/* outline (wireframe of full vase) */}
      <mesh>
        <latheGeometry args={[points, 48]} />
        <meshBasicMaterial color={RED} wireframe transparent opacity={0.22} />
      </mesh>
      {/* filled portion — clipped at the current print height + layer striping */}
      <mesh ref={fillRef} material={layerMat}>
        <latheGeometry args={[points, 96]} />
      </mesh>
      {/* glowing print layer ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.014, 8, 96]} />
        <meshBasicMaterial color={RED} />
      </mesh>
    </group>
  );
}

function Nozzle({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.Group>(null);
  const filamentRef = useRef<THREE.Mesh>(null);
  useFrame((state, d) => {
    if (!ref.current) return;
    const p = progress.get();
    const layerR = 0.55 + 0.3 * Math.sin(p * Math.PI * 1.15);
    const targetY = VASE_BASE_Y + p * VASE_HEIGHT + 0.22;
    ref.current.position.y += (targetY - ref.current.position.y) * Math.min(1, d * 5);
    const t = state.clock.elapsedTime;
    // ride along the current layer ring (counter-rotating with vase)
    ref.current.position.x = Math.cos(t * 2.0) * layerR;
    ref.current.position.z = Math.sin(t * 2.0) * layerR;
    if (filamentRef.current) {
      const dy = ref.current.position.y - (VASE_BASE_Y + p * VASE_HEIGHT);
      filamentRef.current.scale.y = Math.max(0.02, dy);
      filamentRef.current.position.y = -dy / 2 - 0.05;
    }
  });
  return (
    <group ref={ref} position={[0, 1.5, 0]}>
      <mesh>
        <boxGeometry args={[0.45, 0.18, 0.3]} />
        <meshStandardMaterial color={"#2a2a2f"} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <coneGeometry args={[0.08, 0.16, 12]} />
        <meshStandardMaterial color={"#1a1a1a"} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* hot tip glow */}
      <mesh position={[0, -0.28, 0]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color={RED} />
      </mesh>
      {/* extruded filament stream */}
      <mesh ref={filamentRef} position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1, 8]} />
        <meshBasicMaterial color={RED} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Gantry() {
  return (
    <group>
      {/* build plate */}
      <mesh position={[0, VASE_BASE_Y - 0.02, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.05, 32]} />
        <meshStandardMaterial color={"#1a1a1f"} metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, VASE_BASE_Y - 0.06, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.015, 32]} />
        <meshBasicMaterial color={RED} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function EnableClipping() {
  const { gl } = useThree();
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);
  return null;
}

export function ProcessScene({ progress }: { progress: MotionValue<number> }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [2.4, 0.6, 4.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <EnableClipping />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={0.9} />
      <Gantry />
      <Vase progress={progress} />
      <Nozzle progress={progress} />
    </Canvas>
  );
}
