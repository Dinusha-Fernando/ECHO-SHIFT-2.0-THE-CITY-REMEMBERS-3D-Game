"use client";

import React from "react";
import { useGameStore } from "../../lib/store";

export default function MinimapRadar() {
  const { match, playerId, hasCore } = useGameStore();

  const me = match?.players[playerId];
  const myPos = me?.position || { x: 0, y: 0, z: 20 };

  // Radar size 140x140px, representing 100x100m in Sector 09
  // Range: x in [-50, 50], z in [-50, 50]
  const mapCoord = (x: number, z: number) => {
    const radarRadius = 60; // radius of map area
    const scale = radarRadius / 50;
    const rx = 70 + x * scale;
    const ry = 70 + z * scale;
    return { left: `${Math.max(8, Math.min(132, rx))}px`, top: `${Math.max(8, Math.min(132, ry))}px` };
  };

  const myScreen = mapCoord(myPos.x, myPos.z);
  const coreScreen = mapCoord(0, -28);
  const extractScreen = mapCoord(0, 28);

  return (
    <div className="absolute top-4 right-4 w-36 h-36 rounded-full glass-panel border border-cyber-cyan/40 p-2 overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.15)] select-none">
      {/* Compass markers */}
      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyber-cyan/70">N</span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyber-cyan/70">S</span>
      <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyber-cyan/70">W</span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyber-cyan/70">E</span>

      {/* Center cross line */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-[1px] bg-cyber-cyan/10" />
        <div className="absolute h-full w-[1px] bg-cyber-cyan/10" />
      </div>

      {/* Radar sweep line */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyber-cyan/10 to-transparent animate-spin duration-[4000ms]" />

      {/* Chrono Core marker at North */}
      {!hasCore && !(match?.chrono_core_recovered) && (
        <div
          style={coreScreen}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyber-amber rounded-sm shadow-[0_0_6px_#ffb000] animate-pulse"
          title="Chrono Core Vault"
        />
      )}

      {/* Extraction Pad marker at South */}
      <div
        style={extractScreen}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-cyber-cyan rounded-full flex items-center justify-center"
        title="Extraction Pad"
      >
        <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full" />
      </div>

      {/* Other Players / Bots */}
      {match && Object.values(match.players).map((p) => {
        if (p.id === playerId || !p.is_alive) return null;
        const pos = mapCoord(p.position.x, p.position.z);
        const isWraith = p.id.includes("wraith");
        return (
          <div
            key={p.id}
            style={pos}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
              isWraith ? "bg-cyber-purple shadow-[0_0_6px_#7c4dff]" : "bg-cyber-danger shadow-[0_0_6px_#ff3158]"
            }`}
          />
        );
      })}

      {/* Echo blips */}
      {match?.active_echoes.map((e) => {
        const pos = mapCoord(e.start_pos.x, e.start_pos.z);
        return (
          <div
            key={e.id}
            style={pos}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyber-cyan/80 rounded-full animate-ping"
          />
        );
      })}

      {/* Local Player dot */}
      <div
        style={myScreen}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyber-cyan rounded-full shadow-[0_0_8px_#00e5ff] border border-white"
      />
    </div>
  );
}
