"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "../../lib/store";
import { network } from "../../lib/socket";
import { audio } from "../audio/AudioManager";
import {
  Play,
  Shield,
  Zap,
  Radio,
  Crosshair,
  Terminal,
  BookOpen,
  Sliders,
  Compass,
  Server,
  Activity,
  AlertTriangle,
  Cpu,
  Eye,
  Lock,
  Volume2,
  VolumeX,
  Sparkles
} from "lucide-react";

// Dynamically import 3D Menu Canvas
const MenuCanvas = dynamic(() => import("./MenuCanvas"), {
  ssr: false,
});

export default function MainMenu() {
  const {
    playerName,
    setPlayerName,
    role,
    setRole,
    matchId,
    setMatchId,
    setInGame,
    menuTab,
    setMenuTab,
    graphicsQuality,
    setGraphicsQuality,
  } = useGameStore();

  const [masterVolume, setLocalMasterVolume] = useState(0.7);
  const [mouseSensitivity, setMouseSensitivity] = useState(1.0);
  const [selectedArchiveFile, setSelectedArchiveFile] = useState<number>(0);

  const rolesList: Array<{
    name: "Hunter" | "Ghost" | "Runner" | "Hacker" | "Engineer";
    title: string;
    desc: string;
    speed: string;
    stealth: string;
    memory: string;
    ability: string;
    color: string;
    accent: string;
  }> = [
    {
      name: "Hunter",
      title: "COMBAT TRACKER",
      desc: "Specialized in long-range ballistic tracing, thermal echo tracking, and rival operative takedowns.",
      speed: "100%",
      stealth: "MEDIUM",
      memory: "100 MB",
      ability: "Thermal Echo Ping & Ballistic Trajectory Predictor",
      color: "border-cyber-cyan text-cyber-cyan",
      accent: "#00e5ff",
    },
    {
      name: "Ghost",
      title: "STEALTH INFILTRATOR",
      desc: "Suppresses radar footprints, leaves dimmer temporal trails, and excels at close-range evasion.",
      speed: "105%",
      stealth: "MAXIMUM",
      memory: "120 MB",
      ability: "Temporal Trail Dimming & Silent Sprint Footsteps",
      color: "border-cyber-purple text-cyber-purple",
      accent: "#9d4edd",
    },
    {
      name: "Runner",
      title: "HIGH-MOBILITY SCOUT",
      desc: "Fastest operative in Sector 09, built for quick Chrono Core grabs and rapid vertical scaling.",
      speed: "120%",
      stealth: "LOW",
      memory: "90 MB",
      ability: "Overclocked Sprint Burst & Low Phase Cooldown",
      color: "border-cyber-amber text-cyber-amber",
      accent: "#ffb703",
    },
    {
      name: "Hacker",
      title: "SYSTEM BREAKER",
      desc: "Manipulates electronic terminals, disables drones, and extracts higher Intel from discovered Echoes.",
      speed: "95%",
      stealth: "HIGH",
      memory: "150 MB",
      ability: "Anchor Point Reroute & Instant Memory Decryption",
      color: "border-emerald-400 text-emerald-400",
      accent: "#10b981",
    },
    {
      name: "Engineer",
      title: "FIELD ARCHITECT",
      desc: "Fortifies choke points, deploys holographic decoys with longer duration, and recharges shields faster.",
      speed: "95%",
      stealth: "MEDIUM",
      memory: "110 MB",
      ability: "Twin Decoy Deployment & EMP Anchor Trap Rigging",
      color: "border-rose-400 text-rose-400",
      accent: "#f43f5e",
    }
  ];

  const archiveFiles = [
    {
      id: "ARCH-01",
      title: "THE CHRONOS INCIDENT",
      subtitle: "EVENT ZERO // 2094",
      content: `In 2094, defense syndicate NEXUS CORP initiated subterranean testing on the SHIFT CORE beneath Sector 09. The objective was instantaneous quantum temporal mapping. At 03:17:42, the core suffered a cataclysmic temporal breach.\n\nRather than recording time, reality began physically duplicating. Every movement, bullet trajectory, door cycle, and terminal login crystallized into permanent temporal fragments called Echoes. Physical time ceased to be linear in Sector 09.`,
      tag: "ORIGIN STORY",
    },
    {
      id: "ARCH-02",
      title: "THE THREE LAYERS OF REALITY",
      subtitle: "TEMPORAL TOPOLOGY // PROTOCOL 3.0",
      content: `Operatives operating in Sector 09 navigate three simultaneous states of existence:\n\n1. PRESENT: Cold, brutalist concrete, falling rain, reflective wet asphalt puddles, and active rival gunfire.\n2. MEMORY: Ghostly holographic recordings in cyan, amber, and violet glowing through the rain. Echoes replaying dead operatives' footsteps and anchor points.\n3. FRACTURE: When reality destabilizes, the sky shifts into violent chromatic violet/magenta, structures flicker, and Echoes gain lethal physical mass.`,
      tag: "SECTOR TOPOLOGY",
    },
    {
      id: "ARCH-03",
      title: "SPECTER FORENSICS & APEX ECHOES",
      subtitle: "INTELLIGENCE EXTRACTION // SPECTRUM",
      content: `The SPECTER Scanner analyzes residual radiation left by previous shifters. Echoes are classified into four degradation tiers: Stable (Cyan), Damaged (Amber), Corrupted (Rose), and Fractured (Violet).\n\nAdditionally, rare APEX ECHOES (Gold) broadcast premonitions from the future—forewarning operatives of impending drone bombardments, vault breaches, and lethal fracture pulses before they manifest.`,
      tag: "SURVEILLANCE",
    },
    {
      id: "ARCH-04",
      title: "THE ECHO WRAITH & MEMORY MIMIC",
      subtitle: "UNIDENTIFIED THREAT // SECTOR APEX",
      content: `The Echo Wraith is not a robot or a human. It is an autonomous temporal entity formed from aggregated grief and discarded combat data. In Sector 09, it has developed the 'Memory Mimic' protocol—replicating the exact callsign, tactical role, and movement paths of active operatives to lure survivors into deadly ambushes.`,
      tag: "HOSTILE ENTITY",
    },
    {
      id: "ARCH-05",
      title: "ANCHOR POINT MANIPULATION",
      subtitle: "TACTICAL TIMELINE ENGINEERING",
      content: `Echo paths contain Anchor Points—critical decision nodes where historical operatives took definitive actions. Using the SPECTER terminal, you can modify these anchors in real-time:\n\n• [REROUTE]: Divert the Echo's simulated trajectory into enemy sightlines.\n• [RIG ALARM]: Turn the anchor into an acoustic siren alerting patrol drones.\n• [EMP TRAP]: Arm the anchor to blast hostile electronics and shields when crossed.`,
      tag: "TACTICS",
    },
  ];

  const handleDeploy = () => {
    try {
      audio.startAmbient();
      audio.startRainAmbience();
      audio.playScanPing();
    } catch (e) {
      console.warn("[AUDIO] Audio auto-start suppressed by browser policy:", e);
    }
    setInGame(true);
    network.connect(matchId, useGameStore.getState().playerId, playerName, role);
  };

  const handleVolumeChange = (newVol: number) => {
    setLocalMasterVolume(newVol);
    audio.setMasterVolume(newVol);
  };

  return (
    <div className="relative w-full h-full bg-[#060912] flex flex-col justify-between p-6 md:p-8 select-none overflow-hidden pointer-events-auto">
      {/* 3D WebGL Background Scene */}
      <MenuCanvas />

      {/* Vignette & Cinematic Ambient Fog Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060912] via-transparent to-[#060912]/80 pointer-events-none z-[1]" />
      <div className="absolute inset-0 scanlines pointer-events-none z-[2]" />

      {/* Top Header Bar */}
      <header className="relative z-10 pointer-events-auto flex items-center justify-between border-b border-cyber-border/80 pb-5 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan shadow-[0_0_15px_rgba(0,229,255,0.25)]">
            <Radio className="w-7 h-7 animate-pulse text-cyber-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-3xl font-mono font-black tracking-widest text-cyber-text">
                ECHO<span className="text-cyber-cyan">{'//'}</span>SHIFT
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-cyber-cyan/20 text-cyber-cyan rounded border border-cyber-cyan/40 font-bold tracking-wider">
                2.0 CINEMATIC
              </span>
            </div>
            <p className="text-xs font-mono text-cyber-cyan/70 tracking-widest flex items-center space-x-2">
              <span>VANTA-9 {'//'} 03:17:42</span>
              <span className="text-cyber-muted">—</span>
              <span className="italic text-cyber-text font-semibold">“Every action leaves a memory.”</span>
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="flex items-center space-x-1.5 glass-panel p-1.5 rounded-xl border border-cyber-border/80">
          {[
            { id: "play", label: "PLAY // SECTOR 09", icon: Crosshair },
            { id: "operative", label: "OPERATIVE MATRIX", icon: Shield },
            { id: "archive", label: "ARCHIVE DOSSIERS", icon: BookOpen },
            { id: "settings", label: "SYSTEM CONFIG", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = menuTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                onClick={() => setMenuTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-cyber-cyan text-cyber-bg font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                    : "text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Server Status Pill */}
        <div className="flex items-center space-x-3 text-xs font-mono text-cyber-muted glass-panel px-4 py-2 rounded-lg border border-cyber-border/80">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>AUTHORITATIVE TICK: <strong className="text-emerald-400">25 Hz</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pointer-events-auto flex-1 flex items-center justify-center my-4 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* TAB 1: PLAY (DEPLOYMENT) */}
        {/* ========================================================================= */}
        {menuTab === "play" && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Sector Briefing Card */}
            <div className="md:col-span-7 glass-panel rounded-2xl p-6 md:p-7 border border-cyber-cyan/40 shadow-[0_0_35px_rgba(0,229,255,0.12)] space-y-5 backdrop-blur-xl">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyber-amber uppercase tracking-widest flex items-center space-x-1.5">
                    <Activity className="w-3 h-3 animate-spin text-cyber-amber" />
                    <span>ACTIVE QUARANTINE ZONE</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyber-cyan uppercase tracking-wider px-2 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/30">
                    MATCH ID: {matchId}
                  </span>
                </div>
                <h2 className="text-2xl font-mono font-black text-cyber-text tracking-wide">
                  SECTOR 09 — “THE DEAD DISTRICT”
                </h2>
                <p className="text-xs font-mono text-cyber-muted leading-relaxed">
                  Quarantined urban zone where the Chrono Core fractured. Rain-slicked concrete, flickering megacity towers, and physical Echoes roaming corridors.
                </p>
              </div>

              {/* Tactical Objectives */}
              <div className="space-y-2 border-t border-b border-cyber-border py-3.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyber-muted">PRIMARY MISSION:</span>
                  <span className="text-cyber-amber font-bold">EXTRACT CHRONO CORE [NORTH VAULT]</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyber-muted">SPECTER SCANNER (Q):</span>
                  <span className="text-cyber-cyan font-bold">REVEAL FORENSICS & REWRITE ANCHORS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyber-muted">LETHAL ANOMALIES:</span>
                  <span className="text-rose-400 font-bold">MEMORY-MIMIC ECHO WRAITHS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyber-muted">ENVIRONMENTAL THREAT:</span>
                  <span className="text-purple-400 font-bold">REALITY FRACTURE DESTABILIZATION</span>
                </div>
              </div>

              {/* Callsign & Match Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">
                    OPERATIVE CALLSIGN
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-cyber-surface/80 border border-cyber-border rounded-lg px-3 py-2 text-xs font-mono text-cyber-cyan focus:border-cyber-cyan outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">
                    TARGET ROOM CLUSTER
                  </label>
                  <input
                    type="text"
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    className="w-full bg-cyber-surface/80 border border-cyber-border rounded-lg px-3 py-2 text-xs font-mono text-cyber-cyan focus:border-cyber-cyan outline-none transition"
                  />
                </div>
              </div>

              {/* Quick Role Selector */}
              <div>
                <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1.5">
                  DEPLOYMENT ROLE
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {rolesList.map((r) => {
                    const isSelected = role === r.name;
                    return (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => setRole(r.name)}
                        className={`py-2 px-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-cyber-cyan text-cyber-bg border-cyber-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                            : "bg-cyber-surface/50 border-cyber-border text-cyber-muted hover:text-cyber-text"
                        }`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deploy Button */}
              <button
                id="deploy-btn"
                type="button"
                onClick={handleDeploy}
                className="w-full py-4 rounded-xl font-mono font-black text-sm tracking-widest uppercase bg-gradient-to-r from-cyber-cyan via-cyan-400 to-cyber-purple text-cyber-bg hover:shadow-[0_0_40px_rgba(0,229,255,0.7)] transition-all flex items-center justify-center space-x-3 cursor-pointer group"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                <span>DEPLOY TO SECTOR 09</span>
              </button>
            </div>

            {/* Operative Quick Specs Card */}
            <div className="md:col-span-5 glass-panel rounded-2xl p-6 border border-cyber-border space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <span className="text-xs font-mono text-cyber-muted">CHOSEN OPERATIVE</span>
                <span className="text-xs font-mono text-cyber-cyan font-bold uppercase tracking-wider">{role} CLASS</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-cyber-surface/60 border border-cyber-border space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase">PRIMARY WEAPON</span>
                  <div className="text-cyber-text font-bold">R-09 KINETIC PULSE RIFLE (30 RND)</div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyber-surface/60 border border-cyber-border space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase">SPECIAL TACTIC</span>
                  <div className="text-cyber-purple font-bold">0.8s DIMENSIONAL PHASE SHIFT [E]</div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyber-surface/60 border border-cyber-border space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase">TACTICAL FORENSICS</span>
                  <div className="text-cyber-cyan font-bold">SPECTER SCANNER & ANCHOR MANIPULATOR [Q]</div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyber-surface/60 border border-cyber-border space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase">DECEPTION TECH</span>
                  <div className="text-cyber-amber font-bold">SPRINT DECOY GENERATOR [X]</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-[11px] font-mono text-cyber-muted leading-relaxed">
                <strong className="text-cyber-cyan">TACTICAL ADVICE:</strong> Always inspect Echoes with <strong className="text-cyber-cyan">[Q]</strong> before pushing a corridor. Apex Echoes foretell the future.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OPERATIVE MATRIX (3D Character Showcase) */}
        {/* ========================================================================= */}
        {menuTab === "operative" && (
          <div className="w-full max-w-6xl h-full flex flex-col justify-between py-2">
            {/* Top Indicator */}
            <div className="flex items-center justify-between glass-panel px-5 py-2.5 rounded-xl border border-cyber-cyan/30 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4 text-cyber-cyan animate-pulse" />
                <span className="font-mono text-xs font-bold text-cyber-cyan tracking-widest">
                  3D HOLOGRAPHIC PEDESTAL ACTIVE // LIVE CHASSIS RENDERING
                </span>
              </div>
              <div className="font-mono text-xs text-cyber-muted">
                CLEARANCE LEVEL: <strong className="text-emerald-400">OMEGA-4</strong>
              </div>
            </div>

            {/* Bottom Operative Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {rolesList.map((r) => {
                const isSelected = role === r.name;
                return (
                  <div
                    key={r.name}
                    onClick={() => setRole(r.name)}
                    className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2.5 backdrop-blur-xl ${
                      isSelected
                        ? "border-cyber-cyan bg-cyber-surface/90 shadow-[0_0_25px_rgba(0,229,255,0.3)] scale-105"
                        : "border-cyber-border hover:border-cyber-cyan/40 hover:bg-cyber-surface/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${r.color}`}>
                          {r.name}
                        </span>
                        <span className="text-[10px] font-mono text-cyber-muted">
                          SPD: {r.speed}
                        </span>
                      </div>
                      <h3 className="text-xs font-mono font-bold text-cyber-text mt-2">{r.title}</h3>
                      <p className="text-[11px] font-mono text-cyber-muted mt-1 leading-relaxed line-clamp-3">
                        {r.desc}
                      </p>
                    </div>

                    <div className="space-y-1 border-t border-cyber-border pt-2 text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-cyber-muted">STEALTH:</span>
                        <span className="text-cyber-text font-bold">{r.stealth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyber-muted">BUFFER:</span>
                        <span className="text-cyber-cyan font-bold">{r.memory}</span>
                      </div>
                    </div>

                    <div className="border-t border-cyber-border pt-2">
                      <span className="text-[9px] font-mono text-cyber-muted uppercase">SIGNATURE:</span>
                      <p className="text-[11px] font-mono text-cyber-cyan font-bold leading-tight mt-0.5">
                        {r.ability}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ARCHIVE DOSSIERS (Classified Lore) */}
        {/* ========================================================================= */}
        {menuTab === "archive" && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 h-[480px]">
            {/* Left File Directory List */}
            <div className="md:col-span-5 glass-panel rounded-2xl p-4 border border-cyber-border space-y-2 overflow-y-auto backdrop-blur-xl">
              <div className="text-[10px] font-mono text-cyber-muted uppercase px-2 mb-2 tracking-widest">
                CLASSIFIED ARCHIVES // CLEARANCE OMEGA
              </div>
              {archiveFiles.map((file, idx) => {
                const isSelected = selectedArchiveFile === idx;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedArchiveFile(idx)}
                    className={`w-full text-left p-3 rounded-xl font-mono transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-cyber-cyan/15 border-cyber-cyan text-cyber-text shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                        : "bg-cyber-surface/40 border-cyber-border/60 text-cyber-muted hover:text-cyber-text hover:border-cyber-cyan/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyber-cyan font-bold">{file.id}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-border/40 text-cyber-muted">
                        {file.tag}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-cyber-text mt-1">{file.title}</div>
                    <div className="text-[10px] text-cyber-muted">{file.subtitle}</div>
                  </button>
                );
              })}
            </div>

            {/* Right Dossier View */}
            <div className="md:col-span-7 glass-panel rounded-2xl p-6 border border-cyber-cyan/40 flex flex-col justify-between backdrop-blur-xl">
              <div className="space-y-4">
                <div className="border-b border-cyber-border pb-3">
                  <span className="text-[10px] font-mono text-cyber-cyan uppercase tracking-widest">
                    {archiveFiles[selectedArchiveFile].id} {'//'} {archiveFiles[selectedArchiveFile].tag}
                  </span>
                  <h2 className="text-xl font-mono font-black text-cyber-text mt-1">
                    {archiveFiles[selectedArchiveFile].title}
                  </h2>
                  <div className="text-xs font-mono text-cyber-amber">
                    {archiveFiles[selectedArchiveFile].subtitle}
                  </div>
                </div>

                <div className="font-mono text-xs text-cyber-muted leading-relaxed whitespace-pre-line">
                  {archiveFiles[selectedArchiveFile].content}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border text-[10px] font-mono text-cyber-muted flex items-center justify-between">
                <span>SECURITY PROTOCOL: NEXUS CIPHER-256</span>
                <span className="text-emerald-400 font-bold">STATUS: DECRYPTED</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SYSTEM CONFIG (Settings & Controls) */}
        {/* ========================================================================= */}
        {menuTab === "settings" && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphics & Audio Settings */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border space-y-6 backdrop-blur-xl">
              <div className="border-b border-cyber-border pb-2">
                <h3 className="text-sm font-mono font-black text-cyber-cyan tracking-wider">
                  VISUAL & PERFORMANCE ENGINE
                </h3>
              </div>

              {/* Graphics Quality */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-cyber-muted uppercase">
                  GRAPHICS FIDELITY PRESET
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "ultra"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGraphicsQuality(lvl)}
                      className={`py-2 rounded-lg font-mono text-xs uppercase font-bold border transition-all cursor-pointer ${
                        graphicsQuality === lvl
                          ? "bg-cyber-cyan text-cyber-bg border-cyber-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                          : "bg-cyber-surface/40 border-cyber-border text-cyber-muted hover:text-cyber-text"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-cyber-muted">
                  Controls rain density, volumetric fog depth, and wet asphalt puddle reflections.
                </p>
              </div>

              {/* Audio Volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyber-muted uppercase">SYNTHESIZED AUDIO ENGINE</span>
                  <span className="text-cyber-cyan font-bold">{Math.round(masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer"
                />
              </div>

              {/* Mouse Sensitivity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyber-muted uppercase">COMBAT CAMERA SENSITIVITY</span>
                  <span className="text-cyber-amber font-bold">{mouseSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={mouseSensitivity}
                  onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-cyber-amber cursor-pointer"
                />
              </div>
            </div>

            {/* Tactical Keybindings List */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border space-y-4 backdrop-blur-xl">
              <div className="border-b border-cyber-border pb-2">
                <h3 className="text-sm font-mono font-black text-cyber-cyan tracking-wider">
                  TACTICAL KEYBINDING MATRIX
                </h3>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">MOVEMENT:</span>
                  <span className="text-cyber-cyan font-bold">W, A, S, D</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">TACTICAL SPRINT:</span>
                  <span className="text-cyber-cyan font-bold">LEFT SHIFT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">JUMP / VAULT:</span>
                  <span className="text-cyber-cyan font-bold">SPACEBAR</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">AIM DOWN SIGHTS (ADS):</span>
                  <span className="text-cyber-amber font-bold">RIGHT CLICK (MOUSE)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">PRIMARY WEAPON FIRE:</span>
                  <span className="text-rose-400 font-bold">LEFT CLICK (MOUSE)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">SPECTER FORENSICS SCAN:</span>
                  <span className="text-cyber-cyan font-bold">Q (ACOUSTIC CHIRP)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">EMERGENCY PHASE SHIFT:</span>
                  <span className="text-cyber-purple font-bold">E or F (0.8s INVULN)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyber-border/60">
                  <span className="text-cyber-muted">DEPLOY SPRINT DECOY:</span>
                  <span className="text-cyber-amber font-bold">X (4.0s CLONE)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-cyber-muted">CAMERA PERSPECTIVE:</span>
                  <span className="text-cyber-text font-bold">V (1ST / 3RD PERSON)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 flex items-center justify-between border-t border-cyber-border/80 pt-3 text-xs font-mono text-cyber-muted backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyber-cyan" />
          <span>LOCATION: VANTA-9 // SECTOR 09</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>MEMORY BUFFER PROTOCOL: ACTIVE</span>
          <span className="text-cyber-border">|</span>
          <span>NEXUS SECURITY AUTHORITATIVE CLUSTER</span>
        </div>
      </footer>
    </div>
  );
}
