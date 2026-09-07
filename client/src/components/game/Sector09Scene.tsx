"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useGameStore } from "../../lib/store";

export default function Sector09Scene({ coreRecovered }: { coreRecovered: boolean }) {
  const coreRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const conduitRef = useRef<THREE.Group>(null);
  const rainRef = useRef<THREE.Points>(null);
  const { match, fractureActive, fractureLevel } = useGameStore();

  const rainCount = 1800;
  const rainPositions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 140;
      pos[i * 3 + 1] = Math.random() * 45;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    return pos;
  }, []);

  const puddles = useMemo(() => {
    return [
      { pos: [-4, 0.02, 6], scale: [3.8, 2.4] },
      { pos: [8, 0.02, -5], scale: [4.5, 3.2] },
      { pos: [-12, 0.02, -18], scale: [5.2, 3.8] },
      { pos: [14, 0.02, 14], scale: [4.0, 2.8] },
      { pos: [-2, 0.02, -14], scale: [4.6, 3.4] },
      { pos: [6, 0.02, 22], scale: [4.8, 3.6] },
      { pos: [-16, 0.02, 8], scale: [3.5, 2.6] },
      { pos: [0, 0.02, -3], scale: [5.5, 4.2] },
    ];
  }, []);

  const scorchMarks = useMemo(() => {
    return [
      { pos: [-7, 0.015, -4], radius: 1.8 },
      { pos: [10, 0.015, -12], radius: 2.2 },
      { pos: [-18, 0.015, -15], radius: 2.0 },
      { pos: [2, 0.015, 12], radius: 2.5 },
    ];
  }, []);

  const glassClusters = useMemo(() => {
    const shards = [];
    for (let i = 0; i < 24; i++) {
      shards.push({
        pos: [
          -22 + (Math.random() - 0.5) * 6,
          0.03,
          -2 + (Math.random() - 0.5) * 6
        ] as [number, number, number],
        rot: Math.random() * Math.PI,
        size: 0.15 + Math.random() * 0.2
      });
    }
    return shards;
  }, []);

  const buildings = useMemo(() => {
    return [
      { pos: [-35, 18, -15], size: [16, 36, 20], color: "#0c1322", neon: "#00e5ff", label: "NEXUS SEC-09" },
      { pos: [-32, 14, 15], size: [14, 28, 18], color: "#0a101d", neon: "#7c4dff", label: "VANTA METRO" },
      { pos: [35, 22, -15], size: [18, 44, 22], color: "#0c1322", neon: "#7c4dff", label: "CORE LABS" },
      { pos: [32, 16, 18], size: [15, 32, 16], color: "#090e1a", neon: "#00e5ff", label: "DATABANK" },
      { pos: [-18, 25, -45], size: [18, 50, 16], color: "#080c16", neon: "#00e5ff", label: "SECTOR WALL" },
      { pos: [18, 30, -45], size: [18, 60, 16], color: "#080c16", neon: "#ffb000", label: "NEXUS HQ" },
      { pos: [-24, 12, 42], size: [14, 24, 14], color: "#0a101c", neon: "#ff3158", label: "OUTPOST-W" },
      { pos: [24, 12, 42], size: [14, 24, 14], color: "#0a101c", neon: "#ff3158", label: "OUTPOST-E" },
    ];
  }, []);

  const coverObjects = useMemo(() => {
    return [
      { pos: [-6, 1.0, -10], size: [4, 2, 2], rot: 0.2 },
      { pos: [8, 1.0, -12], size: [3, 2, 4], rot: -0.4 },
      { pos: [-10, 1.0, 5], size: [5, 2, 2], rot: 0.1 },
      { pos: [10, 1.0, 8], size: [4, 2, 3], rot: -0.3 },
      { pos: [0, 1.0, 12], size: [6, 2, 2], rot: 0.0 },
      { pos: [-14, 1.5, -20], size: [3, 3, 3], rot: 0.5 },
      { pos: [14, 1.5, -20], size: [3, 3, 3], rot: -0.2 },
    ];
  }, []);

  useFrame((state, delta) => {
    if (coreRef.current && !coreRecovered) {
      coreRef.current.rotation.y += delta * 1.6;
      coreRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2.5) * 0.22;
    }

    if (conduitRef.current) {
      const speed = fractureActive ? 2.4 : 0.45;
      conduitRef.current.rotation.z += delta * speed;
      conduitRef.current.rotation.y += delta * (speed * 0.6);
    }

    if (beaconRef.current) {
      const freq = fractureActive ? 8.0 : 4.2;
      const s = 1.0 + Math.sin(state.clock.elapsedTime * freq) * 0.18;
      beaconRef.current.scale.set(s, 1, s);
    }

    // Dynamic Rain simulation
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      const fallSpeed = fractureActive ? 48 : 34;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= delta * fallSpeed;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 45;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const ambientColor = fractureActive ? "#2b0a42" : "#304058";
  const mainNeonColor = fractureActive ? "#ff007f" : "#00e5ff";

  return (
    <group>
      {/* Fog - switches to eerie violet during Fracture */}
      <fog attach="fog" args={[fractureActive ? "#180424" : "#070A12", 20, 85]} />

      {/* Ambient & Directional Lighting */}
      <ambientLight intensity={fractureActive ? 0.45 : 0.32} color={ambientColor} />
      <directionalLight
        position={[25, 45, 25]}
        intensity={fractureActive ? 0.4 : 0.7}
        color={fractureActive ? "#b388ff" : "#8ec5fc"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 8, 0]} intensity={fractureActive ? 4.5 : 2.8} distance={45} color={mainNeonColor} />
      <pointLight position={[0, 6, -28]} intensity={3.5} distance={28} color="#ffb000" />
      <pointLight position={[0, 10, 28]} intensity={4.0} distance={35} color="#00e5ff" />
      <pointLight position={[-20, 2, 0]} intensity={3.0} distance={22} color={fractureActive ? "#ff3158" : "#7c4dff"} />

      {/* Procedural Falling Rain Particles */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={rainCount}
            array={rainPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color={fractureActive ? "#d1c4e9" : "#a7c7e7"}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Main Wet Asphalt Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#070a12" roughness={0.7} metalness={0.35} />
      </mesh>

      {/* Reflective Wet Puddles with high specular gloss (GDD Section 28) */}
      {puddles.map((p, idx) => (
        <mesh
          key={`puddle_${idx}`}
          rotation={[-Math.PI / 2, 0, idx * 0.4]}
          position={p.pos as [number, number, number]}
        >
          <ringGeometry args={[0, 1, 32]} />
          <meshStandardMaterial
            color="#020408"
            roughness={0.06}
            metalness={0.92}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}

      {/* Scorch & Burn Marks (Environmental Storytelling) */}
      {scorchMarks.map((sc, idx) => (
        <mesh
          key={`scorch_${idx}`}
          rotation={[-Math.PI / 2, 0, idx * 0.8]}
          position={sc.pos as [number, number, number]}
        >
          <circleGeometry args={[sc.radius, 24]} />
          <meshBasicMaterial color="#020305" transparent opacity={0.65} />
        </mesh>
      ))}

      {/* Broken Glass Fragments on pavement */}
      {glassClusters.map((gl, idx) => (
        <mesh
          key={`glass_${idx}`}
          position={gl.pos}
          rotation={[0, gl.rot, 0]}
        >
          <boxGeometry args={[gl.size, 0.02, gl.size * 0.6]} />
          <meshStandardMaterial
            color="#cceeff"
            roughness={0.05}
            metalness={0.9}
            emissive="#00e5ff"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}

      {/* Warm Interior Windows on Buildings (Section 5: Contrast) */}
      <group>
        <mesh position={[-35, 20, -4.9]}>
          <planeGeometry args={[6, 2]} />
          <meshBasicMaterial color="#ffaa33" />
        </mesh>
        <mesh position={[-35, 26, -4.9]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial color="#ffaa33" />
        </mesh>
        <mesh position={[35, 24, -3.9]}>
          <planeGeometry args={[6, 2.5]} />
          <meshBasicMaterial color="#ff8800" />
        </mesh>
        <mesh position={[35, 30, -3.9]}>
          <planeGeometry args={[7, 2]} />
          <meshBasicMaterial color="#ffaa33" />
        </mesh>
      </group>

      {/* Neon Cyber Road Markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[4, 80]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.01, 0]}>
        <planeGeometry args={[4, 80]} />
        <meshBasicMaterial color="#7c4dff" transparent opacity={0.15} />
      </mesh>

      {/* SUBTERRANEAN METRO TUNNEL ENTRANCE (West -22, 0, 0) */}
      <group position={[-22, 0, 0]}>
        {/* Stairwell trench */}
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[7, 2.5, 14]} />
          <meshStandardMaterial color="#04060b" roughness={0.9} />
        </mesh>
        {/* Tunnel entrance arch */}
        <mesh position={[0, 1.8, -7]}>
          <boxGeometry args={[7.2, 3.8, 1]} />
          <meshStandardMaterial color="#101726" metalness={0.8} />
        </mesh>
        {/* Fluorescent tube lighting */}
        <mesh position={[-2.8, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 12]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
        <mesh position={[2.8, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 12]} />
          <meshBasicMaterial color="#7c4dff" />
        </mesh>
        <Text
          position={[0, 3.8, -6.8]}
          fontSize={0.65}
          color="#00e5ff"
          anchorX="center"
          anchorY="middle"
        >
          METRO // SUB-LEVEL 02
        </Text>
      </group>

      {/* INTERACTIVE DATA TERMINALS */}
      {/* Terminal 1: Plaza Relay */}
      <group position={[-8, 0, -4]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.8, 1.6, 0.6]} />
          <meshStandardMaterial color="#0c121f" metalness={0.8} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 1.2, 0.31]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
        <Text position={[0, 1.9, 0]} fontSize={0.24} color="#00e5ff" anchorX="center" anchorY="middle">
          [E] HACK TERMINAL (+50 INTEL)
        </Text>
      </group>

      {/* Terminal 2: Sub-Level Relay */}
      <group position={[-18, 0, -16]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.8, 1.6, 0.6]} />
          <meshStandardMaterial color="#0c121f" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.2, 0.31]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshBasicMaterial color="#ffb000" />
        </mesh>
        <Text position={[0, 1.9, 0]} fontSize={0.24} color="#ffb000" anchorX="center" anchorY="middle">
          [E] OVERCLOCK POWER SWITCH
        </Text>
      </group>

      {/* Central Plaza Fractured Shift Core Conduit */}
      <group position={[0, 3.5, 0]} ref={conduitRef}>
        <mesh>
          <torusGeometry args={[3.2, 0.35, 16, 48]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.8} wireframe />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.25, 16, 48]} />
          <meshStandardMaterial color="#7c4dff" emissive="#7c4dff" emissiveIntensity={1.5} wireframe />
        </mesh>
      </group>

      {/* Elevated Skybridge spanning across Sector 09 */}
      <group position={[0, 6, -8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[44, 0.6, 6]} />
          <meshStandardMaterial color="#101726" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.8, 2.9]}>
          <boxGeometry args={[44, 0.1, 0.1]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
        <mesh position={[0, 0.8, -2.9]}>
          <boxGeometry args={[44, 0.1, 0.1]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
        <mesh position={[-16, -3, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 6]} />
          <meshStandardMaterial color="#1c263d" />
        </mesh>
        <mesh position={[16, -3, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 6]} />
          <meshStandardMaterial color="#1c263d" />
        </mesh>
      </group>

      {/* Access Ramps to Skybridge */}
      <mesh position={[-21, 3, -8]} rotation={[0, 0, -Math.PI / 8]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.4, 5]} />
        <meshStandardMaterial color="#121a2b" />
      </mesh>
      <mesh position={[21, 3, -8]} rotation={[0, 0, Math.PI / 8]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.4, 5]} />
        <meshStandardMaterial color="#121a2b" />
      </mesh>

      {/* Chrono Core Primary Objective (Vault at Z = -28) */}
      <group position={[0, 0, -28]}>
        <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[3.2, 3.8, 0.8, 8]} />
          <meshStandardMaterial color="#141c2e" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.6, 2.9, 32]} />
          <meshBasicMaterial color={coreRecovered ? "#7d94b0" : "#ffb000"} side={THREE.DoubleSide} />
        </mesh>

        {!coreRecovered && (
          <group ref={coreRef} position={[0, 1.2, 0]}>
            <mesh>
              <octahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial color="#ffb000" emissive="#ffb000" emissiveIntensity={2.5} wireframe />
            </mesh>
            <mesh scale={[0.4, 0.4, 0.4]}>
              <dodecahedronGeometry args={[0.7, 0]} />
              <meshBasicMaterial color="#00e5ff" />
            </mesh>
          </group>
        )}

        <Text
          position={[0, 3.2, 0]}
          fontSize={0.6}
          color={coreRecovered ? "#7d94b0" : "#ffb000"}
          anchorX="center"
          anchorY="middle"
        >
          {coreRecovered ? "[CHRONO CORE EXTRACTED]" : "HOLD [E] TO DECRYPT CHRONO CORE"}
        </Text>
      </group>

      {/* Extraction Helipad Landing Zone (Z = 28) */}
      <group position={[0, 0, 28]}>
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[5.5, 5.8, 0.2, 8]} />
          <meshStandardMaterial color="#101827" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.8, 5.2, 32]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={beaconRef} position={[0, 18, 0]}>
          <cylinderGeometry args={[0.3, 0.6, 36, 16]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.35} />
        </mesh>
        <Text position={[0, 3.0, 0]} fontSize={0.7} color="#00e5ff" anchorX="center" anchorY="middle">
          EXTRACTION HELIPAD // ZONE SEC-09
        </Text>
      </group>

      {/* Cyberpunk Skyscrapers */}
      {buildings.map((b, i) => (
        <group key={i} position={b.pos as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size as [number, number, number]} />
            <meshStandardMaterial color={b.color} roughness={0.7} metalness={0.3} />
          </mesh>
          <mesh position={[0, (b.size[1] / 2) - 0.5, 0]}>
            <boxGeometry args={[b.size[0] + 0.2, 0.5, b.size[2] + 0.2]} />
            <meshBasicMaterial color={b.neon} />
          </mesh>
          <Text
            position={[0, (b.size[1] / 2) - 3, (b.size[2] / 2) + 0.2]}
            fontSize={1.4}
            color={b.neon}
            anchorX="center"
            anchorY="middle"
          >
            {b.label}
          </Text>
        </group>
      ))}

      {/* Tactical Cover Crates */}
      {coverObjects.map((c, i) => (
        <mesh
          key={i}
          position={c.pos as [number, number, number]}
          rotation={[0, c.rot, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={c.size as [number, number, number]} />
          <meshStandardMaterial color="#1a253b" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

    </group>
  );
}
