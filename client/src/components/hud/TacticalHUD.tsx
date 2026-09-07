"use client";

import React from "react";
import { useGameStore } from "../../lib/store";
import Crosshair from "./Crosshair";
import MinimapRadar from "./MinimapRadar";
import { audio } from "../audio/AudioManager";
import { Shield, Zap, Heart, Crosshair as AimIcon, Radio, Volume2, VolumeX, Bomb, Database, Folder } from "lucide-react";

export default function TacticalHUD() {
  const {
    health,
    shield,
    shiftEnergy,
    memoryCapacity,
    memoryUsed,
    fractureActive,
    fractureLevel,
    temporalFreezeActive,
    currentWeapon,
    ammo,
    reserveAmmo,
    empGrenades,
    hasCore,
    decryptionProgress,
    match,
    isShifting,
    role,
    intel,
    kills,
    toggleScanner,
    toggleTabInventory,
  } = useGameStore();

  const [muted, setMuted] = React.useState(false);

  const toggleMute = () => {
    const isNowMuted = audio.toggleMute();
    setMuted(isNowMuted);
  };

  const isCoreRecovered = hasCore || (match?.chrono_core_recovered ?? false);
  const extractionCountdown = match?.extraction_countdown || 0;
  const isExtracting = extractionCountdown > 0;

  const weaponNames = {
    rifle: "R-09 PULSE RIFLE",
    smg: "SPECTER-9 SMG",
    shotgun: "SCATTER-12 HEAVY",
    pistol: "PULSE-45 SIDEARM",
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Dimensional Shift Visual Effect Overlay */}
      {isShifting && (
        <div className="absolute inset-0 bg-cyber-cyan/20 mix-blend-screen shift-vfx z-50 pointer-events-none" />
      )}

      {/* Signature Echo Activation Micro-Freeze Flash (GDD Section 7) */}
      {temporalFreezeActive && (
        <div className="absolute inset-0 bg-cyber-cyan/20 pointer-events-none mix-blend-screen border-8 border-cyber-cyan/70 z-50 animate-pulse" />
      )}

      {/* Top Center: Mission Objective Status */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 glass-panel rounded-md border-t-2 border-t-cyber-cyan flex items-center space-x-4 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
        <div className="flex items-center space-x-2">
          <Radio className={`w-4 h-4 ${isCoreRecovered ? "text-cyber-cyan animate-pulse" : "text-cyber-amber"}`} />
          <span className="text-xs font-mono text-cyber-muted uppercase tracking-wider">PRIMARY CONTRACT:</span>
        </div>
        <div className="text-sm font-mono font-bold">
          {!isCoreRecovered ? (
            <span className="text-cyber-amber text-glow-amber">
              {decryptionProgress > 0 ? `DECRYPTING VAULT: ${decryptionProgress}%` : "RECOVER CHRONO CORE // NORTH VAULT [0/1]"}
            </span>
          ) : isExtracting ? (
            <span className="text-cyber-danger animate-pulse text-glow-danger">
              EXTRACTION ZONE HOLD: {(15 - extractionCountdown).toFixed(1)}s
            </span>
          ) : (
            <span className="text-cyber-cyan text-glow-cyan">
              REACH SOUTH EXTRACTION HELIPAD [ACTIVE]
            </span>
          )}
        </div>
      </div>

      {/* Reality Fracture Alert Banner (GDD Section 17) */}
      {fractureActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-cyber-purple/40 border border-cyber-purple text-cyber-purple font-mono text-[11px] font-bold tracking-widest animate-pulse flex items-center space-x-2 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
          <span className="w-2 h-2 rounded-full bg-cyber-purple animate-ping" />
          <span>REALITY FRACTURE DETECTED // TEMPORAL INSTABILITY {Math.round(fractureLevel)}%</span>
        </div>
      )}

      {/* Decryption Progress Bar Overlay when holding E */}
      {decryptionProgress > 0 && !isCoreRecovered && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 w-64 glass-panel p-2 rounded border border-cyber-amber/60 flex flex-col space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-cyber-amber font-bold">
            <span>HOLDING [E] // DECRYPTING CORE</span>
            <span>{decryptionProgress}%</span>
          </div>
          <div className="w-full h-2 bg-cyber-bg rounded-full overflow-hidden border border-cyber-border">
            <div
              style={{ width: `${decryptionProgress}%` }}
              className="h-full bg-gradient-to-r from-cyber-amber to-cyber-cyan transition-all duration-75"
            />
          </div>
        </div>
      )}

      {/* Top Left: Operative Callout & Match Intel */}
      <div className="absolute top-4 left-4 glass-panel px-4 py-2.5 rounded border-l-2 border-l-cyber-cyan font-mono text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
          <span className="font-bold text-cyber-cyan tracking-wider">SECTOR 09: ACTIVE</span>
        </div>
        <div className="text-cyber-muted text-[11px]">
          ROLE: <span className="text-cyber-text font-bold">{role.toUpperCase()}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] pt-0.5">
          <span className="text-cyber-amber">INTEL: +{intel}</span>
          <span className="text-cyber-danger">KILLS: {kills}</span>
        </div>
      </div>

      {/* Top Right: Tactical Minimap */}
      <MinimapRadar />

      {/* Top Controls: Audio & Tactical PDA button */}
      <div className="absolute top-4 right-44 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={toggleTabInventory}
          className="px-3 py-2 glass-panel rounded border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 transition flex items-center space-x-1.5 text-xs font-mono"
          title="Open Tactical PDA [TAB]"
        >
          <Folder className="w-3.5 h-3.5" />
          <span>PDA [TAB]</span>
        </button>

        <button
          onClick={toggleMute}
          className="p-2 glass-panel rounded border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 transition"
          title="Toggle Audio"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Center Screen Crosshair */}
      <Crosshair />

      {/* Bottom Left: Operative Vitality & Shift Energy */}
      <div className="absolute bottom-6 left-6 glass-panel px-5 py-3 rounded-lg border-l-4 border-l-cyber-cyan w-72 space-y-2">
        {/* Health */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-cyber-muted">
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
              <span>VITALITY</span>
            </span>
            <span className="font-bold text-emerald-400">{Math.round(health)} / 100</span>
          </div>
          <div className="w-full h-2 bg-cyber-bg rounded-full overflow-hidden border border-cyber-border">
            <div
              style={{ width: `${Math.max(0, health)}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-cyber-cyan transition-all duration-150"
            />
          </div>
        </div>

        {/* Shield */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-cyber-muted">
              <Shield className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>KINETIC SHIELD</span>
            </span>
            <span className="font-bold text-cyber-cyan">{Math.round(shield)} / 100</span>
          </div>
          <div className="w-full h-1.5 bg-cyber-bg rounded-full overflow-hidden border border-cyber-border">
            <div
              style={{ width: `${Math.max(0, shield)}%` }}
              className="h-full bg-cyber-cyan transition-all duration-150"
            />
          </div>
        </div>

        {/* Shift Energy */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-cyber-purple">
              <Zap className="w-3.5 h-3.5 text-cyber-purple" />
              <span>SHIFT ENERGY</span>
            </span>
            <span className="font-bold text-cyber-purple">{Math.round(shiftEnergy)} / 100</span>
          </div>
          <div className="w-full h-2 bg-cyber-bg rounded-full overflow-hidden border border-cyber-purple/40">
            <div
              style={{ width: `${Math.max(0, shiftEnergy)}%` }}
              className="h-full bg-gradient-to-r from-cyber-purple to-cyber-cyan transition-all duration-150"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-cyber-muted pt-0.5">
            <span className={shiftEnergy >= 50 ? "text-cyber-cyan font-bold" : "text-cyber-muted"}>
              [F] SHIFT (50%)
            </span>
            <span className={shiftEnergy >= 30 ? "text-cyber-amber font-bold" : "text-cyber-muted"}>
              [X] DECOY (30%)
            </span>
          </div>
        </div>

        {/* Memory Buffer Capacity (GDD Section 16) */}
        <div className="space-y-1 pt-1 border-t border-cyber-border/40">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-cyber-cyan">
              <Database className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>MEMORY BUFFER</span>
            </span>
            <span className={`font-bold ${memoryUsed >= 80 ? "text-cyber-danger" : "text-cyber-cyan"}`}>
              {memoryUsed} / {memoryCapacity} MB
            </span>
          </div>
          <div className="w-full h-1.5 bg-cyber-bg rounded-full overflow-hidden border border-cyber-border">
            <div
              style={{ width: `${Math.min(100, (memoryUsed / memoryCapacity) * 100)}%` }}
              className={`h-full transition-all duration-150 ${
                memoryUsed >= 80 ? "bg-cyber-danger animate-pulse" : "bg-gradient-to-r from-cyber-cyan to-cyber-purple"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Right: Multi-Weapon Arsenal & Tactical Controls */}
      <div className="absolute bottom-6 right-6 glass-panel px-6 py-4 rounded-lg border-r-4 border-r-cyber-cyan text-right font-mono space-y-2">
        <div className="text-xs text-cyber-muted flex items-center justify-end space-x-2">
          <AimIcon className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>{weaponNames[currentWeapon]}</span>
        </div>

        {/* Ammo */}
        <div className="text-3xl font-black tracking-wider text-cyber-text">
          <span className={ammo <= 5 ? "text-cyber-danger animate-pulse" : "text-cyber-cyan"}>
            {ammo}
          </span>
          <span className="text-sm text-cyber-muted font-normal ml-2">/ {reserveAmmo}</span>
        </div>

        {/* Weapon Arsenal Strip */}
        <div className="flex items-center justify-end space-x-1.5 pt-1 text-[10px]">
          {(["rifle", "smg", "shotgun", "pistol"] as const).map((w, idx) => (
            <span
              key={w}
              className={`px-1.5 py-0.5 rounded border uppercase ${
                currentWeapon === w
                  ? "bg-cyber-cyan text-cyber-bg font-bold border-cyber-cyan"
                  : "bg-cyber-surface/60 text-cyber-muted border-cyber-border"
              }`}
            >
              [{idx + 1}] {w}
            </span>
          ))}
        </div>

        <div className="text-[11px] text-cyber-muted flex items-center justify-end space-x-3 pt-1 border-t border-cyber-border">
          <span className="text-cyber-amber font-bold">[G] EMP: {empGrenades}</span>
          <span>[R] RELOAD</span>
          <span className="text-cyber-cyan font-bold cursor-pointer pointer-events-auto" onClick={toggleScanner}>
            [Q] SCANNER
          </span>
        </div>
      </div>

      {/* Bottom Center: Quick Keybind Helper */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyber-muted/80 tracking-wide pointer-events-none">
        [WASD] MOVE | [1-4] WEAPONS | [L-CLICK] FIRE | [R-CLICK] AIM | [G] EMP GRENADE | [F] SHIFT | [Q] SCANNER | [TAB] PDA
      </div>
    </div>
  );
}
