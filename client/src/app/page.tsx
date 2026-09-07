"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "../lib/store";
import MainMenu from "../components/menu/MainMenu";
import TacticalHUD from "../components/hud/TacticalHUD";
import EchoScannerUI from "../components/hud/EchoScannerUI";
import TacticalPDA from "../components/hud/TacticalPDA";
import MatchDebriefModal from "../components/hud/MatchDebriefModal";

// Dynamically import 3D Game Canvas to avoid SSR WebGL issues
const GameCanvas = dynamic(() => import("../components/game/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-cyber-bg flex items-center justify-center font-mono text-cyber-cyan space-x-3">
      <div className="w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
      <span>SYNCHRONIZING WITH SECTOR 09 SIMULATION...</span>
    </div>
  ),
});

export default function Home() {
  const { inGame } = useGameStore();

  if (!inGame) {
    return <MainMenu />;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-cyber-bg">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas />

      {/* Cyberpunk Tactical HUD Layer */}
      <TacticalHUD />

      {/* Interactive Echo Scanner Modal Overlay (Q) */}
      <EchoScannerUI />

      {/* Fullscreen Tactical PDA / Arsenal & Dossier (TAB) */}
      <TacticalPDA />

      {/* Match Extraction Debrief Modal */}
      <MatchDebriefModal />
    </main>
  );
}
