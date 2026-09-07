"use client";

import React from "react";
import { useGameStore } from "../../lib/store";
import { network } from "../../lib/socket";
import { audio } from "../audio/AudioManager";
import { Radio, Play, ShieldAlert, Cpu, X, Sparkles, CornerDownRight, Volume2, Bomb } from "lucide-react";

export default function EchoScannerUI() {
  const {
    scannerActive,
    toggleScanner,
    match,
    selectedEcho,
    setSelectedEcho,
    selectedAnchorId,
    setSelectedAnchorId,
    replayingEchoId,
    setReplayingEchoId,
    collectIntel,
    shiftEnergy,
    memoryCapacity,
    memoryUsed,
  } = useGameStore();

  if (!scannerActive) return null;

  const echoes = match?.active_echoes || [];
  const currentEcho = selectedEcho || echoes[0] || null;

  const handleReplay = (echoId: string) => {
    setReplayingEchoId(replayingEchoId === echoId ? null : echoId);
    audio.playEchoReplay();
  };

  const handleExtractIntel = (amount: number) => {
    collectIntel(amount);
    audio.playObjectiveSecured();
  };

  const handleModifyAnchor = (echoId: string, anchorId: string, modType: "reroute" | "alarm" | "emp_trap") => {
    network.sendAction("modify_anchor", { echo_id: echoId, anchor_id: anchorId, mod_type: modType });
    audio.playAnchorModify();
  };

  const handleModifyEcho = (echoId: string, modType: "redirect" | "alarm" | "collapse") => {
    network.sendModifyEcho(echoId, modType);
    audio.playEchoReplay();
  };

  const handleDeployDecoy = () => {
    network.sendDeployDecoy({ x: 0, z: -1 });
    audio.playEchoReplay();
  };

  return (
    <div className="absolute inset-0 bg-cyber-bg/85 backdrop-blur-lg z-40 flex items-center justify-center p-6 select-none animate-fade-in font-mono">
      <div className="w-full max-w-5xl glass-panel rounded-2xl border-2 border-cyber-cyan/60 p-7 shadow-[0_0_60px_rgba(0,229,255,0.25)] flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center space-x-3">
            <Radio className="w-7 h-7 text-cyber-cyan animate-pulse" />
            <div>
              <h2 className="text-xl font-black text-cyber-cyan tracking-wider flex items-center space-x-2">
                <span>SPECTER // TEMPORAL FORENSICS & RECON TERMINAL</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40">
                  GDD 2.0
                </span>
              </h2>
              <p className="text-xs text-cyber-muted">
                ACOUSTIC RADAR ACTIVE {'//'} DETECTED ANOMALIES: {echoes.length} {'//'} MEMORY BUFFER: {memoryUsed} / {memoryCapacity} MB
              </p>
            </div>
          </div>
          <button
            onClick={toggleScanner}
            className="p-2 text-cyber-muted hover:text-cyber-text hover:bg-cyber-border rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Grid: Left list, Right Forensics Dossier */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-h-[440px] overflow-hidden">
          {/* Column 1: Detected Echo Distortions List (5 Cols) */}
          <div className="md:col-span-5 space-y-2.5 overflow-y-auto pr-1">
            <span className="text-xs text-cyber-muted uppercase tracking-wider block pb-1">
              DISCOVERED DISTORTIONS ({echoes.length})
            </span>
            {echoes.map((echo) => {
              const isSelected = currentEcho?.id === echo.id;
              const isReplaying = replayingEchoId === echo.id;
              const isApex = echo.is_apex || echo.level === "apex";

              return (
                <div
                  key={echo.id}
                  onClick={() => {
                    setSelectedEcho(echo);
                    if (echo.anchors && echo.anchors.length > 0) {
                      setSelectedAnchorId(echo.anchors[0].id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col space-y-2 ${
                    isSelected
                      ? isApex
                        ? "border-amber-400 bg-amber-950/40 shadow-[0_0_20px_rgba(255,176,0,0.3)]"
                        : "border-cyber-cyan bg-cyber-surface/90 shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                      : "border-cyber-border bg-cyber-surface/40 hover:border-cyber-cyan/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isApex
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400"
                          : echo.level === "fractured"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500"
                          : echo.level === "damaged"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500"
                      }`}
                    >
                      {echo.level?.toUpperCase() || "STABLE"}
                    </span>
                    <span className="text-xs text-cyber-amber font-bold">+{echo.intel_value} INTEL</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-cyber-text truncate">{echo.creator_name}</h3>
                    <p className="text-[11px] text-cyber-muted">
                      {echo.forensics?.elapsed_str || `${echo.duration.toFixed(1)}s duration`} {'//'} {echo.forensics?.direction || "STATIONARY"}
                    </p>
                  </div>

                  {/* Replay button */}
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplay(echo.id);
                      }}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-bold flex items-center justify-center space-x-1.5 transition ${
                        isReplaying
                          ? "bg-cyber-danger text-white animate-pulse"
                          : "bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      <span>{isReplaying ? "STOPPING" : "REPLAY 3D"}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExtractIntel(echo.intel_value);
                      }}
                      className="px-3 py-1 rounded text-[11px] font-bold bg-cyber-amber/20 text-cyber-amber hover:bg-cyber-amber/30 transition flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>INTEL</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Forensics Dossier & Anchor Point Manipulation (7 Cols) */}
          <div className="md:col-span-7 space-y-4 overflow-y-auto pr-1">
            {currentEcho ? (
              <div className="space-y-4">
                {/* Forensics Dossier Card */}
                <div className="p-4 rounded-xl glass-panel border border-cyber-border space-y-3">
                  <div className="flex items-center justify-between border-b border-cyber-border pb-2">
                    <span className="text-xs text-cyber-muted tracking-wider uppercase flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
                      <span>FORENSICS DOSSIER // {currentEcho.id}</span>
                    </span>
                    <span className="text-xs font-bold text-cyber-amber">
                      RISK: {currentEcho.forensics?.risk_level || "MODERATE"}
                    </span>
                  </div>

                  {/* Apex Premonition Alert Banner (GDD Section 10) */}
                  {(currentEcho.is_apex || currentEcho.premonition_text) && (
                    <div className="p-3 rounded-lg bg-amber-950/60 border-2 border-amber-400 text-amber-200 text-xs space-y-1 shadow-[0_0_20px_rgba(255,176,0,0.2)]">
                      <div className="font-bold flex items-center space-x-1.5 text-amber-300">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                        <span>APEX ECHO // FUTURE PREMONITION DETECTED</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {currentEcho.premonition_text || "Chrono Engine foresaw an anomaly in this corridor."}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-cyber-muted text-[10px]">TIME OCCURRED:</span>
                      <p className="font-bold text-cyber-text">{currentEcho.forensics?.elapsed_str || "02:14 AGO"}</p>
                    </div>
                    <div>
                      <span className="text-cyber-muted text-[10px]">TRAJECTORY HEADING:</span>
                      <p className="font-bold text-cyber-cyan">{currentEcho.forensics?.direction || "NORTHBOUND"}</p>
                    </div>
                    <div>
                      <span className="text-cyber-muted text-[10px]">ENERGY SIGNATURE:</span>
                      <p className="font-bold text-cyber-purple">{currentEcho.forensics?.energy_signature || "TACHYON-9"}</p>
                    </div>
                    <div>
                      <span className="text-cyber-muted text-[10px]">ACTIVITIES RECORDED:</span>
                      <p className="font-bold text-cyber-text">
                        {currentEcho.forensics?.activities?.join(" -> ") || "MOVEMENT"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Anchor Points Editor (GDD Section 14) */}
                <div className="p-4 rounded-xl glass-panel border border-cyber-cyan/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-cyber-border pb-2">
                    <span className="text-xs text-cyber-cyan font-bold tracking-wider uppercase flex items-center space-x-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyber-cyan" />
                      <span>ANCHOR POINT MANIPULATION</span>
                    </span>
                    <span className="text-[10px] text-cyber-muted">COST: 15% SHIFT ENERGY</span>
                  </div>

                  {/* Anchor Point Pills */}
                  <div className="flex flex-wrap gap-2">
                    {currentEcho.anchors && currentEcho.anchors.length > 0 ? (
                      currentEcho.anchors.map((anc) => {
                        const isAncSelected = (selectedAnchorId || currentEcho.anchors?.[0]?.id) === anc.id;
                        return (
                          <button
                            key={anc.id}
                            onClick={() => setSelectedAnchorId(anc.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              isAncSelected
                                ? "bg-cyber-cyan text-cyber-bg border-cyber-cyan shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                                : anc.is_modified
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/60"
                                : "bg-cyber-surface/60 text-cyber-muted border-cyber-border hover:border-cyber-cyan/40"
                            }`}
                          >
                            [ANC-{anc.index + 1}] {anc.action.toUpperCase()}
                            {anc.is_modified && " *"}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-cyber-muted">No Anchor Points registered on this trail.</span>
                    )}
                  </div>

                  {/* Modification Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => {
                        const targetAncId = selectedAnchorId || currentEcho.anchors?.[0]?.id;
                        if (targetAncId) handleModifyAnchor(currentEcho.id, targetAncId, "reroute");
                      }}
                      className="py-2 px-2 rounded text-[11px] font-bold bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/30 transition text-center"
                    >
                      REROUTE (90°)
                    </button>
                    <button
                      onClick={() => {
                        const targetAncId = selectedAnchorId || currentEcho.anchors?.[0]?.id;
                        if (targetAncId) handleModifyAnchor(currentEcho.id, targetAncId, "alarm");
                      }}
                      className="py-2 px-2 rounded text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition text-center"
                    >
                      RIG ALARM
                    </button>
                    <button
                      onClick={() => {
                        const targetAncId = selectedAnchorId || currentEcho.anchors?.[0]?.id;
                        if (targetAncId) handleModifyAnchor(currentEcho.id, targetAncId, "emp_trap");
                      }}
                      className="py-2 px-2 rounded text-[11px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition text-center"
                    >
                      EMP TRAP
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-cyber-muted text-xs">
                SELECT AN ECHO FROM THE LEFT TO RUN FORENSICS
              </div>
            )}
          </div>
        </div>

        {/* Footer Quick Controls */}
        <div className="border-t border-cyber-border pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-cyber-muted">
            <Cpu className="w-4 h-4 text-cyber-purple" />
            <span>
              SHIFT ENERGY: <strong className="text-cyber-purple">{Math.round(shiftEnergy)} / 100</strong>
            </span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDeployDecoy}
              disabled={shiftEnergy < 30}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition flex items-center space-x-2 ${
                shiftEnergy >= 30
                  ? "bg-cyber-amber/20 border border-cyber-amber/60 text-cyber-amber hover:bg-cyber-amber/30"
                  : "opacity-40 border border-cyber-border text-cyber-muted cursor-not-allowed"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>DEPLOY SPRINT DECOY (30%)</span>
            </button>

            <button
              onClick={toggleScanner}
              className="px-5 py-2 rounded text-xs font-bold bg-cyber-cyan text-cyber-bg hover:bg-cyan-300 transition"
            >
              RESUME COMBAT [Q]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
