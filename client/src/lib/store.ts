import { create } from "zustand";
import { MatchState, EchoRecord, PlayerState, Vector3D, Rotation3D, DamageEvent, ShotEvent, WeaponType, GrenadeEvent } from "./types";

interface GameStore {
  // Operative state
  playerId: string;
  playerName: string;
  role: "Runner" | "Ghost" | "Hacker" | "Hunter" | "Engineer";
  setPlayerName: (name: string) => void;
  setRole: (role: "Runner" | "Ghost" | "Hacker" | "Hunter" | "Engineer") => void;

  // Real-time status
  inGame: boolean;
  setInGame: (val: boolean) => void;
  matchId: string;
  setMatchId: (id: string) => void;
  
  // Local operative stats
  health: number;
  shield: number;
  shiftEnergy: number;
  memoryCapacity: number;
  memoryUsed: number;
  setMemoryUsed: (val: number) => void;
  currentWeapon: WeaponType;
  setWeapon: (w: WeaponType) => void;
  ammo: number;
  reserveAmmo: number;
  empGrenades: number;
  isAiming: boolean;
  isFiring: boolean;
  isShifting: boolean;
  hasCore: boolean;
  decryptionProgress: number;
  setDecryptionProgress: (p: number) => void;
  intel: number;
  kills: number;
  
  // Scanner & Forensics & Anchor Points
  scannerActive: boolean;
  toggleScanner: () => void;
  selectedEcho: EchoRecord | null;
  setSelectedEcho: (echo: EchoRecord | null) => void;
  selectedAnchorId: string | null;
  setSelectedAnchorId: (id: string | null) => void;
  replayingEchoId: string | null;
  setReplayingEchoId: (id: string | null) => void;

  // Reality Fracture & Weather
  fractureActive: boolean;
  fractureLevel: number;
  setFractureState: (active: boolean, level: number) => void;
  temporalFreezeActive: boolean;
  triggerTemporalFreeze: () => void;

  // 3D Main Menu & Navigation
  menuTab: "play" | "operative" | "archive" | "settings";
  setMenuTab: (tab: "play" | "operative" | "archive" | "settings") => void;
  graphicsQuality: "low" | "medium" | "high" | "ultra";
  setGraphicsQuality: (g: "low" | "medium" | "high" | "ultra") => void;

  // Tactical PDA Inventory
  tabInventoryOpen: boolean;
  toggleTabInventory: () => void;
  
  // Full world sync
  match: MatchState | null;
  setMatch: (match: MatchState) => void;
  
  // Transient effects
  recentDamage: DamageEvent | null;
  setRecentDamage: (dmg: DamageEvent | null) => void;
  activeShots: ShotEvent[];
  addShotEvent: (shot: ShotEvent) => void;
  activeGrenades: GrenadeEvent[];
  addGrenadeEvent: (grenade: GrenadeEvent) => void;
  
  // Debrief
  showDebrief: boolean;
  setShowDebrief: (val: boolean) => void;

  // Actions
  updateStats: (partial: Partial<PlayerState> & { isAiming?: boolean; isFiring?: boolean; isShifting?: boolean }) => void;
  triggerEmergencyShift: () => void;
  fireShot: () => boolean;
  throwGrenade: () => boolean;
  reloadWeapon: () => void;
  collectIntel: (amount: number) => void;
}

const WEAPON_MAGS: Record<WeaponType, number> = {
  rifle: 30,
  smg: 40,
  shotgun: 8,
  pistol: 15,
};

export const useGameStore = create<GameStore>((set, get) => ({
  playerId: `shifter_${Math.floor(1000 + Math.random() * 9000)}`,
  playerName: "SHIFTER-07",
  role: "Hunter",
  setPlayerName: (name) => set({ playerName: name }),
  setRole: (role) => set({ role }),

  inGame: false,
  setInGame: (inGame) => set({ inGame }),
  matchId: "sec09_alpha",
  setMatchId: (matchId) => set({ matchId }),

  health: 100,
  shield: 100,
  shiftEnergy: 100,
  memoryCapacity: 100,
  memoryUsed: 25,
  setMemoryUsed: (val) => set({ memoryUsed: val }),
  currentWeapon: "rifle",
  setWeapon: (w) => set({ currentWeapon: w, ammo: WEAPON_MAGS[w] }),
  ammo: 30,
  reserveAmmo: 120,
  empGrenades: 2,
  isAiming: false,
  isFiring: false,
  isShifting: false,
  hasCore: false,
  decryptionProgress: 0,
  setDecryptionProgress: (decryptionProgress) => set({ decryptionProgress }),
  intel: 45,
  kills: 0,

  scannerActive: false,
  toggleScanner: () => set((state) => ({ scannerActive: !state.scannerActive })),
  selectedEcho: null,
  setSelectedEcho: (echo) => set({ selectedEcho: echo }),
  selectedAnchorId: null,
  setSelectedAnchorId: (id) => set({ selectedAnchorId: id }),
  replayingEchoId: null,
  setReplayingEchoId: (id) => set({ replayingEchoId: id }),

  fractureActive: false,
  fractureLevel: 0,
  setFractureState: (active, level) => set({ fractureActive: active, fractureLevel: level }),
  temporalFreezeActive: false,
  triggerTemporalFreeze: () => {
    set({ temporalFreezeActive: true });
    setTimeout(() => set({ temporalFreezeActive: false }), 250);
  },

  menuTab: "play",
  setMenuTab: (menuTab) => set({ menuTab }),
  graphicsQuality: "high",
  setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),

  tabInventoryOpen: false,
  toggleTabInventory: () => set((state) => ({ tabInventoryOpen: !state.tabInventoryOpen })),

  match: null,
  setMatch: (match) => {
    if (match.status === "completed" && !get().showDebrief) {
      set({ showDebrief: true });
    }
    const me = match.players[get().playerId];
    if (me) {
      set({
        health: me.health,
        shield: me.shield,
        shiftEnergy: me.shift_energy,
        memoryCapacity: me.memory_capacity || 100,
        memoryUsed: me.memory_used || get().memoryUsed,
        hasCore: me.has_core,
        intel: me.intel_collected,
        kills: me.kills,
        decryptionProgress: me.decryption_progress || get().decryptionProgress
      });
    }
    if (match.fracture_active !== undefined) {
      set({
        fractureActive: match.fracture_active,
        fractureLevel: match.fracture_level || 0
      });
    }
    set({ match });
  },

  recentDamage: null,
  setRecentDamage: (recentDamage) => set({ recentDamage }),
  activeShots: [],
  addShotEvent: (shot) => set((state) => ({
    activeShots: [...state.activeShots.slice(-15), shot]
  })),
  activeGrenades: [],
  addGrenadeEvent: (grenade) => set((state) => ({
    activeGrenades: [...state.activeGrenades.slice(-10), grenade]
  })),

  showDebrief: false,
  setShowDebrief: (showDebrief) => set({ showDebrief }),

  updateStats: (partial) => set((state) => ({ ...state, ...partial })),

  triggerEmergencyShift: () => {
    const { shiftEnergy, isShifting } = get();
    if (shiftEnergy >= 50 && !isShifting) {
      set({ isShifting: true, shiftEnergy: shiftEnergy - 50 });
      setTimeout(() => {
        set({ isShifting: false });
      }, 800);
    }
  },

  fireShot: () => {
    const { ammo, isShifting } = get();
    if (isShifting || ammo <= 0) return false;
    set({ ammo: ammo - 1, isFiring: true });
    setTimeout(() => set({ isFiring: false }), 80);
    return true;
  },

  throwGrenade: () => {
    const { empGrenades } = get();
    if (empGrenades <= 0) return false;
    set({ empGrenades: empGrenades - 1 });
    return true;
  },

  reloadWeapon: () => {
    const { ammo, reserveAmmo, currentWeapon } = get();
    const mag = WEAPON_MAGS[currentWeapon];
    if (ammo >= mag || reserveAmmo <= 0) return;
    const needed = mag - ammo;
    const load = Math.min(needed, reserveAmmo);
    set({
      ammo: ammo + load,
      reserveAmmo: reserveAmmo - load
    });
  },

  collectIntel: (amount) => set((state) => ({ intel: state.intel + amount })),
}));
