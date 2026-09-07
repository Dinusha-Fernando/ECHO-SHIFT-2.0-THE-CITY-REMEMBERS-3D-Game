"""
ECHO//SHIFT - Server Data Models and Schemas
"""
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
import time
import uuid

class Vector3D(BaseModel):
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0

class Rotation3D(BaseModel):
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0

EchoLevel = Literal["stable", "damaged", "corrupted", "fractured", "apex"]

class AnchorPoint(BaseModel):
    id: str = Field(default_factory=lambda: f"anc_{uuid.uuid4().hex[:6]}")
    index: int = 0
    timestamp: float = 0.0
    position: Vector3D = Field(default_factory=Vector3D)
    action: str = "walk"
    is_modified: bool = False
    modification_type: Optional[str] = None # "reroute", "alarm", "emp_trap"

class ForensicsData(BaseModel):
    elapsed_str: str = "01:24 AGO"
    direction: str = "NORTH"
    activities: List[str] = Field(default_factory=list)
    energy_signature: str = "TACHYON-9 FRACTURE"
    risk_level: Literal["LOW", "MODERATE", "CRITICAL", "APEX_ANOMALY"] = "MODERATE"
    premonition_event: Optional[str] = None

class EchoKeyframe(BaseModel):
    timestamp: float
    position: Vector3D
    rotation: Rotation3D
    action: Literal["idle", "run", "sprint", "crouch", "jump", "shoot", "interact", "shift"] = "idle"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EchoRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"echo_{uuid.uuid4().hex[:8]}")
    match_id: str
    creator_id: str
    creator_name: str
    echo_type: Literal["movement", "combat", "decoy", "interaction"] = "movement"
    level: EchoLevel = "stable"
    created_at: float = Field(default_factory=time.time)
    duration: float = 0.0
    keyframes: List[EchoKeyframe] = Field(default_factory=list)
    anchors: List[AnchorPoint] = Field(default_factory=list)
    forensics: Optional[ForensicsData] = None
    start_pos: Vector3D = Field(default_factory=Vector3D)
    end_pos: Vector3D = Field(default_factory=Vector3D)
    intel_value: int = 25
    is_active: bool = True
    color_hue: str = "cyan" # cyan, amber, violet, crimson, gold
    # Advanced Echo Manipulation & Anchor Points
    is_modified: bool = False
    has_alarm: bool = False
    direction_offset: float = 0.0
    is_apex: bool = False
    premonition_text: Optional[str] = None

class DroneState(BaseModel):
    id: str
    name: str = "NEXUS DRONE-01"
    position: Vector3D = Field(default_factory=Vector3D)
    rotation: Rotation3D = Field(default_factory=Rotation3D)
    target_position: Vector3D = Field(default_factory=Vector3D)
    alert_state: Literal["patrol", "suspicious", "combat", "disabled"] = "patrol"
    target_id: Optional[str] = None
    health: float = 80.0
    disabled_until: float = 0.0
    color: str = "#00E5FF" # cyan for patrol, amber for suspicious, danger for combat

class TerminalState(BaseModel):
    id: str
    name: str
    position: Vector3D
    is_hacked: bool = False
    hacked_by: Optional[str] = None
    intel_value: int = 50

class PlayerState(BaseModel):
    id: str
    name: str
    role: Literal["Runner", "Ghost", "Hacker", "Hunter", "Engineer"] = "Hunter"
    active_weapon: Literal["rifle", "smg", "shotgun", "pistol"] = "rifle"
    position: Vector3D = Field(default_factory=Vector3D)
    rotation: Rotation3D = Field(default_factory=Rotation3D)
    velocity: Vector3D = Field(default_factory=Vector3D)
    health: float = 100.0
    shield: float = 100.0
    shift_energy: float = 100.0
    memory_capacity: int = 100 # Max memory buffer (MB)
    memory_used: int = 20     # Current memory footprint
    ammo: int = 30
    reserve_ammo: int = 120
    emp_grenades: int = 2
    is_alive: bool = True
    is_shifting: bool = False
    is_aiming: bool = False
    is_firing: bool = False
    has_core: bool = False
    decryption_progress: float = 0.0
    intel_collected: int = 0
    kills: int = 0
    is_bot: bool = False
    color: str = "#00E5FF"
    last_seen: float = Field(default_factory=time.time)

class MatchState(BaseModel):
    match_id: str
    status: Literal["waiting", "active", "completed"] = "active"
    map_name: str = "Sector 09 — The Dead District"
    created_at: float = Field(default_factory=time.time)
    elapsed_time: float = 0.0
    chrono_core_recovered: bool = False
    chrono_core_carrier: Optional[str] = None
    extraction_available: bool = False
    extraction_countdown: float = 0.0
    extraction_completed: bool = False
    fracture_active: bool = False
    fracture_level: float = 0.0 # 0.0 to 100.0 temporal instability
    weather: Literal["rain", "fog", "storm", "fracture_storm"] = "rain"
    players: Dict[str, PlayerState] = Field(default_factory=dict)
    active_echoes: List[EchoRecord] = Field(default_factory=list)
    drones: List[DroneState] = Field(default_factory=list)
    terminals: List[TerminalState] = Field(default_factory=list)

class ClientMessage(BaseModel):
    type: Literal[
        "join", 
        "player_update", 
        "player_shoot", 
        "player_shift", 
        "weapon_switch",
        "throw_grenade",
        "deploy_decoy", 
        "modify_echo",
        "modify_anchor",
        "specter_scan",
        "investigate_echo",
        "trigger_fracture",
        "hack_terminal",
        "interact_core", 
        "trigger_extraction",
        "chat"
    ]
    player_id: str
    data: Dict[str, Any] = Field(default_factory=dict)
