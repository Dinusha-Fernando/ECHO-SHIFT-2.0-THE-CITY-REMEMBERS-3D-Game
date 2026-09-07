"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useGameStore } from "../../lib/store";
import { EchoRecord, EchoKeyframe } from "../../lib/types";

export default function EchoRenderer() {
  const { match, scannerActive, replayingEchoId, setSelectedEcho, setSelectedAnchorId, selectedAnchorId } = useGameStore();
  const echoes = match?.active_echoes || [];

  return (
    <group>
      {echoes.map((echo) => (
        <EchoInstance
          key={echo.id}
          echo={echo}
          scannerActive={scannerActive}
          isReplaying={replayingEchoId === echo.id || echo.echo_type === "decoy"}
          onSelect={() => setSelectedEcho(echo)}
          onSelectAnchor={(ancId) => {
            setSelectedEcho(echo);
            setSelectedAnchorId(ancId);
          }}
          selectedAnchorId={selectedAnchorId}
        />
      ))}
    </group>
  );
}

function EchoInstance({
  echo,
  scannerActive,
  isReplaying,
  onSelect,
  onSelectAnchor,
  selectedAnchorId,
}: {
  echo: EchoRecord;
  scannerActive: boolean;
  isReplaying: boolean;
  onSelect: () => void;
  onSelectAnchor: (ancId: string) => void;
  selectedAnchorId: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const playbackTime = useRef(0);

  const colorMap: Record<string, string> = {
    cyan: "#00e5ff",
    magenta: "#ff007f",
    amber: "#ffb000",
    violet: "#a855f7",
    gold: "#ffd700",
  };
  const themeColor = colorMap[echo.color_hue || "cyan"] || (echo.is_apex ? "#ffd700" : "#00e5ff");

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Subtle frame skipping / jitter for non-stable echoes (GDD Section 8 & 9)
    const isGlitching = echo.level === "damaged" || echo.level === "corrupted" || echo.level === "fractured";
    const jitterX = isGlitching && Math.random() < 0.2 ? (Math.random() - 0.5) * 0.12 : 0;
    const jitterZ = isGlitching && Math.random() < 0.2 ? (Math.random() - 0.5) * 0.12 : 0;

    if (auraRef.current) {
      auraRef.current.rotation.y += delta * 1.5;
      const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 3.5) * 0.15;
      auraRef.current.scale.set(pulse, pulse, pulse);
    }

    if (isReplaying && echo.keyframes.length > 1) {
      playbackTime.current += delta;
      if (playbackTime.current > echo.duration) {
        playbackTime.current = 0; // loop playback
      }

      const t = playbackTime.current;
      let prevKf = echo.keyframes[0];
      let nextKf = echo.keyframes[echo.keyframes.length - 1];

      for (let i = 0; i < echo.keyframes.length - 1; i++) {
        if (t >= echo.keyframes[i].timestamp && t <= echo.keyframes[i + 1].timestamp) {
          prevKf = echo.keyframes[i];
          nextKf = echo.keyframes[i + 1];
          break;
        }
      }

      const segmentSpan = nextKf.timestamp - prevKf.timestamp || 0.001;
      const alpha = Math.max(0, Math.min(1, (t - prevKf.timestamp) / segmentSpan));

      const px = THREE.MathUtils.lerp(prevKf.position.x, nextKf.position.x, alpha) + jitterX;
      const py = THREE.MathUtils.lerp(prevKf.position.y, nextKf.position.y, alpha);
      const pz = THREE.MathUtils.lerp(prevKf.position.z, nextKf.position.z, alpha) + jitterZ;

      groupRef.current.position.set(px, py, pz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        prevKf.rotation.y,
        nextKf.rotation.y,
        alpha
      );
    } else {
      groupRef.current.position.set(
        echo.start_pos.x + jitterX,
        echo.start_pos.y,
        echo.start_pos.z + jitterZ
      );
    }
  });

  return (
    <group>
      {/* 3D Moving / Static Echo Body */}
      <group ref={groupRef} onClick={onSelect}>
        {/* Volumetric Silhouette & Scanline Wireframe (GDD Section 8) */}
        <group>
          {/* Inner Solid Silhouette */}
          <mesh position={[0, 0.9, 0]}>
            <capsuleGeometry args={[0.22, 0.75, 4, 8]} />
            <meshStandardMaterial
              color={themeColor}
              emissive={themeColor}
              emissiveIntensity={echo.is_apex ? 1.8 : 0.6}
              transparent
              opacity={scannerActive ? 0.75 : 0.45}
            />
          </mesh>

          {/* Outer Scanline Wireframe Shell */}
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.55, 1.25, 0.38]} />
            <meshBasicMaterial
              color={themeColor}
              wireframe
              transparent
              opacity={scannerActive ? 0.9 : 0.4}
            />
          </mesh>

          {/* Head Sphere */}
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshBasicMaterial
              color={themeColor}
              wireframe
              transparent
              opacity={scannerActive ? 0.95 : 0.5}
            />
          </mesh>

          {/* Rotating Base Pedestal Ring */}
          <mesh ref={auraRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.65, 24]} />
            <meshBasicMaterial
              color={themeColor}
              transparent
              opacity={scannerActive ? 0.8 : 0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* Floating Scanner Hologram Header */}
        {scannerActive && (
          <group position={[0, 2.3, 0]}>
            <Text
              fontSize={0.28}
              color={themeColor}
              anchorX="center"
              anchorY="middle"
            >
              {echo.is_apex
                ? `[APEX PREMONITION] ${echo.creator_name}`
                : `[ECHO // ${echo.level?.toUpperCase() || "STABLE"}] ${echo.creator_name}`}
            </Text>
            <Text
              position={[0, -0.28, 0]}
              fontSize={0.2}
              color="#a7c7e7"
              anchorX="center"
              anchorY="middle"
            >
              {echo.forensics?.elapsed_str
                ? `${echo.forensics.elapsed_str} // ${echo.forensics.direction} // INTEL: +${echo.intel_value}`
                : `DUR: ${echo.duration.toFixed(1)}s // INTEL: +${echo.intel_value}`}
            </Text>
          </group>
        )}
      </group>

      {/* 3D Anchor Points Rendered along the trajectory (GDD Section 14) */}
      {scannerActive &&
        echo.anchors &&
        echo.anchors.map((anc) => {
          const isSelected = selectedAnchorId === anc.id;
          return (
            <group
              key={anc.id}
              position={[anc.position.x, anc.position.y + 0.6, anc.position.z]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectAnchor(anc.id);
              }}
            >
              {/* Anchor Node Diamond */}
              <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                <octahedronGeometry args={[isSelected ? 0.35 : 0.22]} />
                <meshStandardMaterial
                  color={anc.is_modified ? "#ffb000" : isSelected ? "#00e5ff" : themeColor}
                  emissive={anc.is_modified ? "#ffb000" : isSelected ? "#00e5ff" : themeColor}
                  emissiveIntensity={isSelected ? 1.5 : 0.8}
                  wireframe
                />
              </mesh>
              {/* Ground connection line */}
              <mesh position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.6]} />
                <meshBasicMaterial color={themeColor} transparent opacity={0.5} />
              </mesh>
              {/* Label */}
              <Text position={[0, 0.45, 0]} fontSize={0.18} color={themeColor} anchorX="center" anchorY="middle">
                {`[ANC-${anc.index + 1}]`}
              </Text>
            </group>
          );
        })}
    </group>
  );
}
