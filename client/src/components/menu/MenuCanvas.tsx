"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../lib/store";

// Role-specific color mapping
const ROLE_COLORS: Record<string, { primary: string; secondary: string; light: string }> = {
  Hunter: { primary: "#00e5ff", secondary: "#0077b6", light: "#00e5ff" },
  Ghost: { primary: "#9d4edd", secondary: "#5a189a", light: "#c77dff" },
  Runner: { primary: "#ffb703", secondary: "#fb8500", light: "#ffd166" },
  Hacker: { primary: "#10b981", secondary: "#047857", light: "#34d399" },
  Engineer: { primary: "#f43f5e", secondary: "#be123c", light: "#fb7185" },
};

// 3D Procedural Operative for Showcase Pedestal
function OperativeModel({ role }: { role: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = ROLE_COLORS[role] || ROLE_COLORS.Hunter;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
      // Gentle breathing idle bob
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Pedestal Platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.1, 32]} />
        <meshStandardMaterial color="#0b1120" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Holographic Ring under operative */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.25, 48]} />
        <meshBasicMaterial color={colors.primary} side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      {/* Operative Body - Torso */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.65, 0.8, 0.35]} />
        <meshStandardMaterial color="#131d2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Chest Armor Plate */}
      <mesh position={[0, 1.2, 0.19]} castShadow>
        <boxGeometry args={[0.55, 0.45, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Chrono Battery on Spine */}
      <mesh position={[0, 1.15, -0.21]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 1.15, -0.28]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
        <meshBasicMaterial color={colors.primary} />
      </mesh>

      {/* Tactical Helmet */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[0.42, 0.44, 0.45]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Glowing HUD Visor */}
      <mesh position={[0, 1.78, 0.22]}>
        <boxGeometry args={[0.34, 0.14, 0.06]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={2.5}
          roughness={0.1}
        />
      </mesh>

      {/* Limbs: Legs */}
      <mesh position={[-0.2, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.09, 0.9, 16]} />
        <meshStandardMaterial color="#0b1120" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.2, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.09, 0.9, 16]} />
        <meshStandardMaterial color="#0b1120" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Limbs: Arms */}
      <mesh position={[-0.42, 1.05, 0]} rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.75, 16]} />
        <meshStandardMaterial color="#0b1120" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.42, 1.05, 0]} rotation={[0, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.75, 16]} />
        <meshStandardMaterial color="#0b1120" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Tactical Pulse Rifle held slung forward */}
      <group position={[0.25, 0.95, 0.3]} rotation={[0.4, 0.3, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.14, 0.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Rifle Barrel */}
        <mesh position={[0, 0.02, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.2, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} />
        </mesh>
        {/* Rifle Energy Rail */}
        <mesh position={[0, 0.08, 0.05]}>
          <boxGeometry args={[0.02, 0.02, 0.45]} />
          <meshBasicMaterial color={colors.primary} />
        </mesh>
      </group>

      {/* Role Spotlight */}
      <pointLight position={[0, 2.5, 1.2]} color={colors.light} intensity={1.8} distance={8} />
    </group>
  );
}

// Procedural Megacity Buildings & Street
function MegacityEnvironment() {
  // Buildings grid
  const buildings = useMemo(() => {
    const items: Array<{
      pos: [number, number, number];
      size: [number, number, number];
      color: string;
      windowColor: string;
    }> = [];

    // Left skyline
    for (let i = 0; i < 8; i++) {
      const h = 18 + (i % 4) * 8;
      items.push({
        pos: [-14 - (i % 3) * 4, h / 2, -30 + i * 10],
        size: [8, h, 8],
        color: "#070c18",
        windowColor: i % 2 === 0 ? "#ffd166" : "#00e5ff",
      });
    }

    // Right skyline
    for (let i = 0; i < 8; i++) {
      const h = 22 + (i % 3) * 9;
      items.push({
        pos: [14 + (i % 3) * 4, h / 2, -30 + i * 10],
        size: [8, h, 8],
        color: "#080e1c",
        windowColor: i % 2 === 0 ? "#00e5ff" : "#ffd166",
      });
    }

    // Far background monoliths
    items.push({ pos: [0, 30, -50], size: [28, 60, 10], color: "#050812", windowColor: "#00e5ff" });
    items.push({ pos: [-24, 25, -45], size: [16, 50, 8], color: "#060a14", windowColor: "#ffd166" });
    items.push({ pos: [24, 25, -45], size: [16, 50, 8], color: "#060a14", windowColor: "#00e5ff" });

    return items;
  }, []);

  return (
    <group>
      {/* Ground Street with Wet Reflective Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#060912"
          roughness={0.08}
          metalness={0.92}
        />
      </mesh>

      {/* Wet Puddles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2]}>
        <circleGeometry args={[4.5, 32]} />
        <meshStandardMaterial color="#001824" roughness={0.02} metalness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.01, -4]}>
        <circleGeometry args={[3.2, 32]} />
        <meshStandardMaterial color="#001824" roughness={0.02} metalness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.01, -8]}>
        <circleGeometry args={[3.8, 32]} />
        <meshStandardMaterial color="#001824" roughness={0.02} metalness={0.98} />
      </mesh>

      {/* Buildings */}
      {buildings.map((b, idx) => (
        <group key={idx} position={b.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Window Glow Dots */}
          <mesh position={[0, 0, b.size[2] / 2 + 0.05]}>
            <planeGeometry args={[b.size[0] * 0.7, b.size[1] * 0.8]} />
            <meshBasicMaterial
              color={b.windowColor}
              wireframe
              transparent
              opacity={0.12}
            />
          </mesh>
        </group>
      ))}

      {/* Holographic Neon Billboards */}
      <mesh position={[-9, 12, -12]} rotation={[0, 0.35, 0]}>
        <planeGeometry args={[7, 2.5]} />
        <meshBasicMaterial color="#00e5ff" wireframe />
      </mesh>
      <mesh position={[9, 14, -10]} rotation={[0, -0.4, 0]}>
        <planeGeometry args={[6, 2]} />
        <meshBasicMaterial color="#ffb703" wireframe />
      </mesh>
      <mesh position={[0, 20, -35]}>
        <planeGeometry args={[16, 3]} />
        <meshBasicMaterial color="#7c4dff" wireframe />
      </mesh>

      {/* Street Lighting Posts */}
      <pointLight position={[-4, 4.5, 0]} color="#00e5ff" intensity={1.5} distance={15} />
      <pointLight position={[4, 4.5, -10]} color="#ffd166" intensity={1.5} distance={15} />
      <pointLight position={[0, 8, -25]} color="#7c4dff" intensity={2.0} distance={30} />
    </group>
  );
}

// Procedural Falling Rain Particles for Menu
function MenuRain() {
  const rainCount = 450;
  const positions = useMemo(() => {
    const arr = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = Math.random() * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
    }
    return arr;
  }, [rainCount]);

  const rainGeoRef = useRef<THREE.BufferGeometry>(null);

  useFrame((_, delta) => {
    if (!rainGeoRef.current) return;
    const pos = rainGeoRef.current.attributes.position.array as Float32Array;
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3 + 1] -= delta * 24;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 22 + Math.random() * 4;
      }
    }
    rainGeoRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={rainGeoRef}>
        <bufferAttribute
          attach="attributes-position"
          count={rainCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5f3fc"
        size={0.12}
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Cinematic Camera Controller for Menu
function MenuCamera({ tab }: { tab: string }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (tab === "operative") {
      // Focus in on the operative showcase pedestal
      state.camera.position.x = Math.sin(t * 0.15) * 1.5;
      state.camera.position.y = 1.6 + Math.sin(t * 0.3) * 0.08;
      state.camera.position.z = 4.2;
      state.camera.lookAt(0, 1.2, 0);
    } else {
      // Cinematic sweeping street camera
      state.camera.position.x = Math.sin(t * 0.1) * 3.5;
      state.camera.position.y = 2.8 + Math.cos(t * 0.15) * 0.4;
      state.camera.position.z = 10 + Math.sin(t * 0.08) * 1.5;
      state.camera.lookAt(0, 3.5, -15);
    }
  });

  return null;
}

export default function MenuCanvas() {
  const { menuTab, role } = useGameStore();

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 3, 10], fov: 58, near: 0.1, far: 200 }}
        gl={{
          antialias: false,
          powerPreference: "default",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
            },
            false
          );
        }}
        className="w-full h-full"
      >
        <color attach="background" args={["#060912"]} />
        <fog attach="fog" args={["#070a14", 12, 60]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.4} color="#0c192e" />
        <directionalLight position={[-10, 20, 10]} intensity={0.6} color="#00e5ff" />
        <directionalLight position={[10, 15, -10]} intensity={0.5} color="#ffd166" />

        {/* Megacity Scene */}
        <MegacityEnvironment />

        {/* Falling Rain */}
        <MenuRain />

        {/* Operative Showcase Pedestal (shown when on operative tab) */}
        {menuTab === "operative" && <OperativeModel role={role} />}

        {/* Dynamic Camera */}
        <MenuCamera tab={menuTab} />
      </Canvas>
    </div>
  );
}
