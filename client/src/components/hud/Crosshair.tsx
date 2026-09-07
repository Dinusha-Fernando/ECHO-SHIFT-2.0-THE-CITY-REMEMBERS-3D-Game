"use client";

import React from "react";
import { useGameStore } from "../../lib/store";

export default function Crosshair() {
  const { isAiming, isFiring } = useGameStore();

  const spread = isAiming ? 12 : 22;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Center dot */}
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-75 ${
        isFiring ? "bg-cyber-cyan scale-150 shadow-[0_0_8px_#00e5ff]" : "bg-cyber-text/80"
      }`} />

      {/* Crosshair ticks */}
      {/* Top */}
      <div
        style={{ transform: `translateY(-${spread}px)` }}
        className="absolute w-0.5 h-3 bg-cyber-cyan/70 transition-transform duration-75"
      />
      {/* Bottom */}
      <div
        style={{ transform: `translateY(${spread}px)` }}
        className="absolute w-0.5 h-3 bg-cyber-cyan/70 transition-transform duration-75"
      />
      {/* Left */}
      <div
        style={{ transform: `translateX(-${spread}px)` }}
        className="absolute w-3 h-0.5 bg-cyber-cyan/70 transition-transform duration-75"
      />
      {/* Right */}
      <div
        style={{ transform: `translateX(${spread}px)` }}
        className="absolute w-3 h-0.5 bg-cyber-cyan/70 transition-transform duration-75"
      />

      {/* ADS Ring */}
      {isAiming && (
        <div className="absolute w-14 h-14 border border-cyber-cyan/40 rounded-full animate-pulse" />
      )}
    </div>
  );
}
