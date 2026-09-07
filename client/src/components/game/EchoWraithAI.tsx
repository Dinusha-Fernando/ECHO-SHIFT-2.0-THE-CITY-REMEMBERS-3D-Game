"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useGameStore } from "../../lib/store";
import { PlayerState, DroneState } from "../../lib/types";

export default function EchoWraithAI() {
  const { match, playerId } = useGameStore();
  const players = match?.players || {};
  const drones = match?.drones || [];

  return (
    <group>
      {/* Aerial Security Drones */}
      {drones.map((drone) => (
        <SecurityDrone key={drone.id} drone={drone} />
      ))}

      {/* Rival Operatives and Echo Wraith */}
      {Object.values(players).map((p) => {
        if (p.id === playerId || !p.is_alive) return null;
        if (p.id.includes("wraith")) {
          return <WraithEntity key={p.id} entity={p} />;
        }
        return <RivalOperative key={p.id} operative={p} />;
      })}
    </group>
  );
}

function SecurityDrone({ drone }: { drone: DroneState }) {
  const groupRef = useRef<THREE.Group>(null);
  const rotorsRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.SpotLight>(null);

  const alertColors = {
    patrol: "#00e5ff",
    suspicious: "#ffb000",
    combat: "#ff3158",
    disabled: "#7d94b0"
  };
  const currentColor = alertColors[drone.alert_state] || "#00e5ff";

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, drone.position.x, delta * 6);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, drone.position.y, delta * 6);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, drone.position.z, delta * 6);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, drone.rotation.y, delta * 6);

    // Spin propellers
    if (rotorsRef.current && drone.alert_state !== "disabled") {
      rotorsRef.current.rotation.y += delta * 25;
    }
  });

  return (
    <group ref={groupRef} position={[drone.position.x, drone.position.y, drone.position.z]}>
      {/* Drone Chassis */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.35, 1.2]} />
        <meshStandardMaterial color="#0e1626" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 4 Rotor Arms & Propellers */}
      <group ref={rotorsRef}>
        {[
          [-0.7, 0.1, -0.7],
          [0.7, 0.1, -0.7],
          [-0.7, 0.1, 0.7],
          [0.7, 0.1, 0.7],
        ].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.2]} />
              <meshStandardMaterial color="#1a263d" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.5, 0.02, 0.08]} />
              <meshBasicMaterial color="#00e5ff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Drone Eye / Sensor Pod */}
      <mesh position={[0, -0.2, 0.4]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={currentColor} />
      </mesh>

      {/* Spotlight Conical Searchlight */}
      {drone.alert_state !== "disabled" && (
        <group position={[0, -0.25, 0]}>
          <spotLight
            ref={lightRef}
            intensity={4.5}
            distance={18}
            angle={0.45}
            penumbra={0.6}
            color={currentColor}
            castShadow
          />
          {/* Volumetric Visual Light Cone */}
          <mesh position={[0, -4.5, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[3.2, 9, 16, 1, true]} />
            <meshBasicMaterial
              color={currentColor}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* Tag */}
      <Text position={[0, 0.8, 0]} fontSize={0.3} color={currentColor} anchorX="center" anchorY="middle">
        {drone.name} [{drone.alert_state.toUpperCase()}]
      </Text>
    </group>
  );
}

function WraithEntity({ entity }: { entity: PlayerState }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, entity.position.x, delta * 8);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, entity.position.z, delta * 8);
    groupRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 4.0) * 0.25;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 2.5;
      coreRef.current.rotation.x += delta * 1.5;
      const glitchScale = 1.0 + (Math.random() - 0.5) * 0.15;
      coreRef.current.scale.set(glitchScale, glitchScale, glitchScale);
    }
  });

  return (
    <group ref={groupRef} position={[entity.position.x, 0.8, entity.position.z]}>
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#7c4dff" emissive="#7c4dff" emissiveIntensity={2.5} wireframe />
      </mesh>
      <mesh position={[0, 0.2, 0.4]}>
        <boxGeometry args={[0.4, 0.08, 0.1]} />
        <meshBasicMaterial color="#ff3158" />
      </mesh>
      {[-0.5, 0.5].map((off, i) => (
        <mesh key={i} position={[off, -0.4, 0]}>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshBasicMaterial color="#7c4dff" wireframe transparent opacity={0.6} />
        </mesh>
      ))}
      <Text position={[0, 1.8, 0]} fontSize={0.34} color="#ff3158" anchorX="center" anchorY="middle">
        ECHO WRAITH [ANOMALY]
      </Text>
      <group position={[0, 1.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.2, 0.12]} />
          <meshBasicMaterial color="#1c263d" />
        </mesh>
        <mesh position={[(entity.health / 120) * 0.6 - 0.6, 0, 0.01]}>
          <planeGeometry args={[(entity.health / 120) * 1.2, 0.1]} />
          <meshBasicMaterial color="#ff3158" />
        </mesh>
      </group>
    </group>
  );
}

function RivalOperative({ operative }: { operative: PlayerState }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, operative.position.x, delta * 10);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, operative.position.z, delta * 10);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, operative.rotation.y, delta * 10);
  });

  return (
    <group ref={groupRef} position={[operative.position.x, 0.5, operative.position.z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.55, 0.7, 0.35]} />
        <meshStandardMaterial color="#1a2336" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#0f1624" metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.48, -0.19]}>
        <boxGeometry args={[0.24, 0.07, 0.08]} />
        <meshBasicMaterial color={operative.color || "#ffb000"} />
      </mesh>
      <mesh position={[0.35, 0.9, -0.2]}>
        <boxGeometry args={[0.1, 0.12, 0.6]} />
        <meshStandardMaterial color="#0c101c" metalness={0.9} />
      </mesh>
      <mesh position={[-0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.7, 0.22]} />
        <meshStandardMaterial color="#0d1422" />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.7, 0.22]} />
        <meshStandardMaterial color="#0d1422" />
      </mesh>
      <Text position={[0, 2.0, 0]} fontSize={0.3} color={operative.color || "#ffb000"} anchorX="center" anchorY="middle">
        {operative.name}
      </Text>
      <group position={[0, 1.75, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.0, 0.1]} />
          <meshBasicMaterial color="#101625" />
        </mesh>
        <mesh position={[(operative.health / 100) * 0.5 - 0.5, 0, 0.01]}>
          <planeGeometry args={[(operative.health / 100) * 1.0, 0.08]} />
          <meshBasicMaterial color="#ffb000" />
        </mesh>
      </group>
    </group>
  );
}
