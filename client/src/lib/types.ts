export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface EchoKeyframe {
  timestamp: number;
  position: Vector3D;
  rotation: Rotation3D;
  action: "idle" | "run" | "sprint" | "crouch" | "jump" | "shoot" | "interact" | "shift";
  metadata?: Record<string, any>;
}

export type EchoLevel = "stable" | "damaged" | "corrupted" | "fractured" | "apex";

export interface AnchorPoint {
  id: string;
  index: number;
  timestamp: number;
  position: Vector3D;
  action: string;
  is_modified?: boolean;
  modification_type?: string | null;
}

export interface ForensicsData {
  elapsed_str: string;
  direction: string;
  activities: string[];
  energy_signature: string;
  risk_level: "LOW" | "MODERATE" | "CRITICAL" | "APEX_ANOMALY";
  premonition_event?: string | null;
}

export interface EchoRecord {
  id: string;
  match_id: string;
  creator_id: string;
  creator_name: string;
  echo_type: "movement" | "combat" | "decoy" | "interaction";
  level?: EchoLevel;
  created_at: number;
  duration: number;
  keyframes: EchoKeyframe[];
  anchors?: AnchorPoint[];
  forensics?: ForensicsData;
  start_pos: Vector3D;
  end_pos: Vector3D;
  intel_value: number;
  is_active: boolean;
  color_hue: "cyan" | "magenta" | "amber" | "violet" | "gold";
  is_modified?: boolean;
  has_alarm?: boolean;
  direction_offset?: number;
  is_apex?: boolean;
  premonition_text?: string | null;
}

export type WeaponType = "rifle" | "smg" | "shotgun" | "pistol";

export interface WeaponDef {
  id: WeaponType;
  name: string;
  category: string;
  magSize: number;
  fireRateMs: number;
  damage: number;
  spread: number;
  description: string;
}

export interface DroneState {
  id: string;
  name: string;
  position: Vector3D;
  rotation: Rotation3D;
  alert_state: "patrol" | "suspicious" | "combat" | "disabled";
  target_id?: string | null;
  health: number;
  color: string;
}

export interface TerminalState {
  id: string;
  name: string;
  position: Vector3D;
  is_hacked: boolean;
  hacked_by?: string | null;
  intel_value: number;
}

export interface PlayerState {
  id: string;
  name: string;
  role: "Runner" | "Ghost" | "Hacker" | "Hunter" | "Engineer";
  active_weapon: WeaponType;
  position: Vector3D;
  rotation: Rotation3D;
  velocity: Vector3D;
  health: number;
  shield: number;
  shift_energy: number;
  memory_capacity?: number;
  memory_used?: number;
  ammo: number;
  reserve_ammo: number;
  emp_grenades: number;
  is_alive: boolean;
  is_shifting: boolean;
  is_aiming: boolean;
  is_firing: boolean;
  has_core: boolean;
  decryption_progress: number;
  intel_collected: number;
  kills: number;
  is_bot: boolean;
  color: string;
  last_seen: number;
}

export interface MatchState {
  match_id: string;
  status: "waiting" | "active" | "completed";
  map_name: string;
  created_at: number;
  elapsed_time: number;
  chrono_core_recovered: boolean;
  chrono_core_carrier?: string | null;
  extraction_available: boolean;
  extraction_countdown: number;
  extraction_completed: boolean;
  fracture_active?: boolean;
  fracture_level?: number;
  weather?: "rain" | "fog" | "storm" | "fracture_storm";
  players: Record<string, PlayerState>;
  active_echoes: EchoRecord[];
  drones: DroneState[];
  terminals: TerminalState[];
}

export interface DamageEvent {
  target_id: string;
  damage: number;
  target_health: number;
  target_shield: number;
  is_dead: boolean;
}

export interface ShotEvent {
  shooter_id: string;
  target_pos: Vector3D;
  weapon?: WeaponType;
  damage_events?: DamageEvent[];
}

export interface GrenadeEvent {
  id: string;
  thrower_id: string;
  blast_pos: Vector3D;
  radius: number;
  timestamp: number;
}
