"use client";

import React from "react";
import { useGameStore } from "../../lib/store";
import { network } from "../../lib/socket";
import { Award, ShieldCheck, Database, Zap, ArrowRight } from "lucide-react";

export default function MatchDebriefModal() {
  const { showDebrief, setShowDebrief, setInGame, hasCore, intel, kills } = useGameStore();

  if (!showDebrief) return null;

  const handleReturnToLobby = () => {
    setShowDebrief(false);
    setInGame(false);
    network.disconnect();
  };

  return (
    <div className="absolute inset-0 bg-cyber-bg/90 backdrop-blur-lg z-50 flex items-center justify-center p-6 select-none animate-fade-in">
      <div className="w-full max-w-xl glass-panel rounded-2xl border-2 border-cyber-cyan p-8 shadow-[0_0_80px_rgba(0,229,255,0.25)] flex flex-col space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-cyber-border pb-6">
          <div className="inline-flex p-3 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan mb-2">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-mono font-black text-cyber-cyan tracking-widest uppercase text-glow-cyan">
            {hasCore ? "EXTRACTION SUCCESSFUL" : "SECTOR SURVIVAL DEBRIEF"}
          </h1>
          <p className="text-sm font-mono text-cyber-muted">
            NEXUS CONTRACT // SECTOR 09 — THE DEAD DISTRICT
          </p>
        </div>

        {/* Rewards Matrix */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyber-muted">
              <Database className="w-4 h-4 text-cyber-amber" />
              <span>CLASSIFIED INTEL</span>
            </div>
            <div className="text-2xl font-mono font-black text-cyber-amber">
              +{intel + (hasCore ? 150 : 50)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyber-muted">
              <Award className="w-4 h-4 text-cyber-cyan" />
              <span>OPERATIVE XP</span>
            </div>
            <div className="text-2xl font-mono font-black text-cyber-cyan">
              +{kills * 200 + (hasCore ? 1200 : 400)} XP
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyber-muted">
              <Zap className="w-4 h-4 text-cyber-purple" />
              <span>CHRONO CORE STATUS</span>
            </div>
            <div className={`text-lg font-mono font-bold ${hasCore ? "text-emerald-400" : "text-cyber-muted"}`}>
              {hasCore ? "SECURED [NEXUS VAULT]" : "SIGNAL LOST"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyber-muted">
              <span>RIVAL THREATS CLEARED</span>
            </div>
            <div className="text-2xl font-mono font-black text-cyber-danger">
              {kills} ELIMINATIONS
            </div>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={handleReturnToLobby}
          className="w-full py-4 rounded-xl font-mono font-black text-sm tracking-widest uppercase bg-gradient-to-r from-cyber-cyan to-cyan-400 text-cyber-bg hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition flex items-center justify-center space-x-2"
        >
          <span>RETURN TO NEXUS TERMINAL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
