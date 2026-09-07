"use client";

import React from "react";
import { useGameStore } from "../../lib/store";
import {
  Compass,
  Database,
  Crosshair,
  Shield,
  Zap,
  Bomb,
  X,
  FileText,
  MapPin,
  Cpu
} from "lucide-react";

export default function TacticalPDA() {
  const {
    tabInventoryOpen,
    toggleTabInventory,
    role,
    currentWeapon,
    setWeapon,
    ammo,
    reserveAmmo,
    empGrenades,
    intel,
    kills,
    hasCore,
    match,
  } = useGameStore();

  if (!tabInventoryOpen) return null;

  const weapons = [
    { id: "rifle", name: "R-09 PULSE RIFLE", role: "Assault Rifle", mag: 30, rpm: "600 RPM", dmg: "24 DMG" },
    { id: "smg", name: "SPECTER-9 SMG", role: "Submachine Gun", mag: 40, rpm: "900 RPM", dmg: "15 DMG" },
    { id: "shotgun", name: "SCATTER-12 HEAVY", role: "Shotgun", mag: 8, rpm: "120 RPM", dmg: "68 DMG" },
    { id: "pistol", name: "PULSE-45 SIDEARM", role: "Sidearm", mag: 15, rpm: "450 RPM", dmg: "20 DMG" },
  ];

  return (
    <div className="absolute inset-0 bg-cyber-bg/85 backdrop-blur-lg z-45 flex items-center justify-center p-6 select-none animate-fade-in">
      <div className="w-full max-w-5xl glass-panel rounded-2xl border-2 border-cyber-cyan p-7 shadow-[0_0_60px_rgba(0,229,255,0.25)] flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center space-x-3">
            <Cpu className="w-7 h-7 text-cyber-cyan animate-pulse" />
            <div>
              <h1 className="text-xl font-mono font-black text-cyber-cyan tracking-wider">
                TACTICAL PDA // OPERATIVE INVENTORY & INTEL DOSSIER
              </h1>
              <p className="text-xs font-mono text-cyber-muted">
                SECTOR 09 TELEMETRY // NEXUS OPERATIVE CLEARANCE LEVEL 04
              </p>
            </div>
          </div>
          <button
            onClick={toggleTabInventory}
            className="p-2 text-cyber-muted hover:text-cyber-text hover:bg-cyber-border rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Column 1: Loadout & Equipment Slots (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-xs font-mono uppercase text-cyber-muted tracking-widest flex items-center space-x-2">
              <Crosshair className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>EQUIPPED ARSENAL (KEYS 1-4)</span>
            </h2>

            <div className="space-y-2">
              {weapons.map((w, idx) => {
                const isActive = currentWeapon === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setWeapon(w.id as any)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between font-mono text-xs ${
                      isActive
                        ? "border-cyber-cyan bg-cyber-surface/90 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                        : "border-cyber-border bg-cyber-surface/40 hover:border-cyber-cyan/40 text-cyber-muted"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyber-border rounded font-bold text-cyber-cyan">
                          [{idx + 1}]
                        </span>
                        <span className="font-bold text-cyber-text">{w.name}</span>
                      </div>
                      <span className="text-[10px] text-cyber-muted">{w.role}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyber-cyan font-bold block">{w.dmg}</span>
                      <span className="text-[10px] text-cyber-muted">{w.rpm}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tactical Gear */}
            <h2 className="text-xs font-mono uppercase text-cyber-muted tracking-widest pt-2 flex items-center space-x-2">
              <Bomb className="w-3.5 h-3.5 text-cyber-amber" />
              <span>TACTICAL GEAR</span>
            </h2>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-3 glass-panel rounded-lg border border-cyber-border space-y-1">
                <span className="text-cyber-muted text-[10px]">EMP GRENADES [G]</span>
                <p className="text-lg font-bold text-cyber-cyan">{empGrenades} / 2</p>
                <p className="text-[10px] text-cyber-muted">Stuns drones 8s, drains shields</p>
              </div>
              <div className="p-3 glass-panel rounded-lg border border-cyber-border space-y-1">
                <span className="text-cyber-muted text-[10px]">SHIFT DRIVE [F]</span>
                <p className="text-lg font-bold text-cyber-purple">0.8s PHASE</p>
                <p className="text-[10px] text-cyber-muted">Dimensional invulnerability</p>
              </div>
            </div>
          </div>

          {/* Column 2: Sector Map & Classified Intel (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-xs font-mono uppercase text-cyber-muted tracking-widest flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-cyber-amber" />
              <span>SECTOR 09 TACTICAL GRID & RECOVERED DOSSIERS</span>
            </h2>

            {/* Tactical Sector Schematic */}
            <div className="relative h-44 rounded-xl border border-cyber-border bg-cyber-bg/90 p-4 font-mono text-xs flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-start text-[11px]">
                <div>
                  <span className="text-cyber-amber font-bold">[NORTH] CHRONO CORE VAULT</span>
                  <p className="text-[10px] text-cyber-muted">Grid: (0, -28) // {hasCore ? "SECURED BY YOU" : "LOCKED"}</p>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">[SOUTH] EXTRACTION HELIPAD</span>
                  <p className="text-[10px] text-cyber-muted">Grid: (0, 28) // {match?.extraction_available ? "ACTIVE" : "STANDBY"}</p>
                </div>
              </div>

              {/* Grid visual lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-full h-[1px] bg-cyber-cyan" />
                <div className="absolute h-full w-[1px] bg-cyber-cyan" />
              </div>

              <div className="flex justify-between items-end text-[11px] pt-4">
                <div>
                  <span className="text-cyber-purple font-bold">[WEST] METRO TUNNEL</span>
                  <p className="text-[10px] text-cyber-muted">Sub-level access & generator</p>
                </div>
                <div>
                  <span className="text-cyber-cyan font-bold">[EAST] CORE DATA LABS</span>
                  <p className="text-[10px] text-cyber-muted">High-rise sniper walkways</p>
                </div>
              </div>
            </div>

            {/* Memory Fragments & Classified Lore */}
            <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-cyber-amber">
                <span className="flex items-center space-x-1.5 font-bold">
                  <Database className="w-3.5 h-3.5" />
                  <span>INTEL BALANCE: {intel} DATA POINTS</span>
                </span>
                <span className="text-cyber-muted text-[10px]">MEMORY FRAGMENT #001 UNLOCKED</span>
              </div>
              <p className="text-cyber-muted leading-relaxed text-[11px]">
                “The temporal fracture was not a malfunction. NEXUS did not invent the Shift Core—they uncovered it beneath the city bedrock. The Echoes were already recording us before VANTA-9 was even built.”
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-cyber-border pt-4 flex items-center justify-between font-mono text-xs text-cyber-muted">
          <span>PRESS [TAB] OR [ESC] TO CLOSE TACTICAL PDA</span>
          <button
            onClick={toggleTabInventory}
            className="px-5 py-2 rounded font-bold bg-cyber-cyan text-cyber-bg hover:bg-cyan-300 transition"
          >
            RETURN TO COMBAT
          </button>
        </div>
      </div>
    </div>
  );
}
