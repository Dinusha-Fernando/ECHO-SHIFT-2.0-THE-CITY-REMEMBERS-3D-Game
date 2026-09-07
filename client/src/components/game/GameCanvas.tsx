"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Sector09Scene from "./Sector09Scene";
import PlayerController from "./PlayerController";
import EchoRenderer from "./EchoRenderer";
import EchoWraithAI from "./EchoWraithAI";
import WeaponSystem from "./WeaponSystem";
import { useGameStore } from "../../lib/store";

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const { match, hasCore } = useGameStore();

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement === containerRef.current);
    };
    document.addEventListener("pointerlockchange", handleLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", handleLockChange);
    };
  }, []);

  const handleClick = () => {
    if (containerRef.current && document.pointerLockElement !== containerRef.current) {
      containerRef.current.requestPointerLock();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full h-full cursor-crosshair select-none overflow-hidden"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 2, 24], fov: 65, near: 0.1, far: 300 }}
        gl={{
          antialias: false,
          powerPreference: "default",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              console.warn("[WEBGL] Context lost. Preventing default to allow restoration.");
            },
            false
          );
          canvas.addEventListener(
            "webglcontextrestored",
            () => {
              console.log("[WEBGL] Context restored.");
            },
            false
          );
        }}
        className="w-full h-full"
      >
        <color attach="background" args={["#060912"]} />
        <fog attach="fog" args={["#070a14", 30, 110]} />

        {/* Sector 09 Environment */}
        <Sector09Scene coreRecovered={hasCore || (match?.chrono_core_recovered ?? false)} />

        {/* Active Operative Controller */}
        <PlayerController />

        {/* Temporal Echoes */}
        <EchoRenderer />

        {/* Rival Operatives and Echo Wraith AI */}
        <EchoWraithAI />

        {/* Weapon FX */}
        <WeaponSystem />
      </Canvas>

      {/* Pointer Lock Hint */}
      {!isLocked && (
        <div
          onClick={handleClick}
          className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2.5 glass-panel border border-cyber-cyan text-cyber-cyan font-mono text-xs tracking-wider uppercase animate-pulse cursor-pointer rounded-lg shadow-[0_0_25px_rgba(0,229,255,0.4)] pointer-events-auto z-40 hover:bg-cyber-cyan/20 transition-all"
        >
          CLICK TO ENGAGE TACTICAL COMBAT CONTROLS (ESC TO RELEASE)
        </div>
      )}
    </div>
  );
}
