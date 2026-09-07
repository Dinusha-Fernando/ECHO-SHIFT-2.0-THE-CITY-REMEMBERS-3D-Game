"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../lib/store";

export default function WeaponSystem() {
  const { activeShots, activeGrenades } = useGameStore();

  return (
    <group>
      {/* Laser Tracers */}
      {activeShots.map((shot, i) => (
        <BulletTracer key={`${shot.shooter_id}_${i}`} shot={shot} />
      ))}

      {/* EMP Shockwave Expansions */}
      {activeGrenades.map((g) => (
        <EMPBlastEffect key={g.id} blast={g} />
      ))}
    </group>
  );
}

function BulletTracer({ shot }: { shot: any }) {
  const opacity = useRef(1.0);

  const weaponColor =
    shot.weapon === "smg"
      ? "#7c4dff"
      : shot.weapon === "shotgun"
      ? "#ffb000"
      : shot.weapon === "pistol"
      ? "#eaf6ff"
      : "#00e5ff";

  const lineObject = useMemo(() => {
    const start = new THREE.Vector3(0, 1.2, 19.5);
    const end = new THREE.Vector3(shot.target_pos.x, shot.target_pos.y, shot.target_pos.z);
    const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color: weaponColor, transparent: true, opacity: 1.0 });
    return new THREE.Line(geom, mat);
  }, [shot, weaponColor]);

  useFrame((state, delta) => {
    opacity.current -= delta * 5.0;
    if (lineObject.material) {
      (lineObject.material as THREE.LineBasicMaterial).opacity = Math.max(0, opacity.current);
    }
  });

  return <primitive object={lineObject} />;
}

function EMPBlastEffect({ blast }: { blast: any }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const scale = useRef(0.2);
  const opacity = useRef(1.0);

  useFrame((state, delta) => {
    if (!ringRef.current) return;
    scale.current += delta * 12.0;
    opacity.current -= delta * 1.4;

    ringRef.current.scale.set(scale.current, scale.current, 1);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    if (mat) {
      mat.opacity = Math.max(0, opacity.current);
    }
  });

  return (
    <group position={[blast.blast_pos.x, 0.2, blast.blast_pos.z]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={1.0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
