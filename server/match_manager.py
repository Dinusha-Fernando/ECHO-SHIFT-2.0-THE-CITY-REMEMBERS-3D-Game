"""
ECHO//SHIFT - Match Manager
Authoritative room coordinator, bot AI, aerial drone simulation, multi-weapon damage, and extraction timer.
"""
import time
import math
import random
from typing import Dict, List, Optional
from models import MatchState, PlayerState, DroneState, TerminalState, Vector3D, Rotation3D, EchoRecord
from echo_engine import EchoEngine

class MatchManager:
    def __init__(self):
        self.matches: Dict[str, MatchState] = {}
        self.echo_engine = EchoEngine()
        self.chrono_core_pos = Vector3D(x=0.0, y=0.8, z=-28.0)
        self.extraction_pos = Vector3D(x=0.0, y=0.2, z=28.0)
        self.last_tick_time = time.time()

    def get_or_create_match(self, match_id: str) -> MatchState:
        if match_id not in self.matches:
            match = MatchState(match_id=match_id)
            self.matches[match_id] = match
            self.echo_engine.seed_initial_sector_echoes(match_id)
            match.active_echoes = self.echo_engine.get_match_echoes(match_id)
            self._spawn_initial_bots(match_id)
            self._spawn_initial_drones(match_id)
            self._spawn_initial_terminals(match_id)
        return self.matches[match_id]

    def _spawn_initial_bots(self, match_id: str):
        match = self.matches[match_id]
        bot1 = PlayerState(
            id=f"bot_kestrel_{match_id[:4]}",
            name="KESTREL // HUNTER",
            role="Hunter",
            position=Vector3D(x=-18.0, y=0.5, z=-5.0),
            health=100.0,
            shield=80.0,
            is_bot=True,
            color="#FFB000"
        )
        bot2 = PlayerState(
            id=f"bot_wraith_{match_id[:4]}",
            name="ECHO WRAITH [ANOMALY]",
            role="Ghost",
            position=Vector3D(x=15.0, y=0.5, z=10.0),
            health=120.0,
            shield=50.0,
            is_bot=True,
            color="#7C4DFF"
        )
        match.players[bot1.id] = bot1
        match.players[bot2.id] = bot2

    def _spawn_initial_drones(self, match_id: str):
        match = self.matches[match_id]
        drone1 = DroneState(
            id=f"drone_plaza_{match_id[:4]}",
            name="NEXUS SEC-DRONE [PLAZA]",
            position=Vector3D(x=0.0, y=6.5, z=0.0),
            alert_state="patrol",
            health=80.0,
            color="#00E5FF"
        )
        drone2 = DroneState(
            id=f"drone_metro_{match_id[:4]}",
            name="NEXUS SEC-DRONE [METRO]",
            position=Vector3D(x=-15.0, y=6.5, z=-10.0),
            alert_state="patrol",
            health=80.0,
            color="#00E5FF"
        )
        match.drones = [drone1, drone2]

    def _spawn_initial_terminals(self, match_id: str):
        match = self.matches[match_id]
        match.terminals = [
            TerminalState(id="term_hotel", name="HOTEL LOBBY DATAPOINT", position=Vector3D(x=-18.0, y=0.5, z=5.0), intel_value=50),
            TerminalState(id="term_metro", name="METRO POWER SWITCH", position=Vector3D(x=-15.0, y=0.5, z=-15.0), intel_value=60),
            TerminalState(id="term_office", name="NEXUS DATA CONSOLE", position=Vector3D(x=18.0, y=0.5, z=-10.0), intel_value=75),
        ]

    def add_player(self, match_id: str, player_id: str, name: str, role: str = "Hunter") -> PlayerState:
        match = self.get_or_create_match(match_id)
        if player_id in match.players:
            player = match.players[player_id]
            player.last_seen = time.time()
            return player
        
        spawn_x = random.choice([-8.0, 8.0, 0.0])
        spawn_z = 22.0
        player = PlayerState(
            id=player_id,
            name=name,
            role=role,
            active_weapon="rifle",
            position=Vector3D(x=spawn_x, y=0.5, z=spawn_z),
            rotation=Rotation3D(x=0, y=3.14, z=0),
            health=100.0,
            shield=100.0,
            shift_energy=100.0,
            emp_grenades=2,
            is_bot=False,
            color="#00E5FF"
        )
        match.players[player_id] = player
        return player

    def remove_player(self, match_id: str, player_id: str):
        if match_id in self.matches and player_id in self.matches[match_id].players:
            del self.matches[match_id].players[player_id]

    def update_player(self, match_id: str, player_id: str, data: dict):
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return
        
        p = match.players[player_id]
        p.last_seen = time.time()

        if "position" in data:
            pos = data["position"]
            p.position = Vector3D(x=pos.get("x", p.position.x), y=pos.get("y", p.position.y), z=pos.get("z", p.position.z))
        if "rotation" in data:
            rot = data["rotation"]
            p.rotation = Rotation3D(x=rot.get("x", p.rotation.x), y=rot.get("y", p.rotation.y), z=rot.get("z", p.rotation.z))
        if "velocity" in data:
            vel = data["velocity"]
            p.velocity = Vector3D(x=vel.get("x", 0), y=vel.get("y", 0), z=vel.get("z", 0))
        if "health" in data:
            p.health = max(0.0, float(data["health"]))
        if "shield" in data:
            p.shield = max(0.0, float(data["shield"]))
        if "shift_energy" in data:
            p.shift_energy = max(0.0, min(100.0, float(data["shift_energy"])))
        if "ammo" in data:
            p.ammo = int(data["ammo"])
        if "active_weapon" in data:
            p.active_weapon = data["active_weapon"]
        if "is_aiming" in data:
            p.is_aiming = bool(data["is_aiming"])
        if "is_firing" in data:
            p.is_firing = bool(data["is_firing"])
        if "is_shifting" in data:
            p.is_shifting = bool(data["is_shifting"])

        action = "idle"
        speed = math.sqrt(p.velocity.x**2 + p.velocity.z**2)
        if p.is_shifting:
            action = "shift"
        elif p.is_firing:
            action = "shoot"
        elif speed > 5.5:
            action = "sprint"
        elif speed > 0.5:
            action = "run"

        self.echo_engine.record_frame(match_id, player_id, p.name, p.position, p.rotation, action)
        match.active_echoes = self.echo_engine.get_match_echoes(match_id)

    def handle_shoot(self, match_id: str, shooter_id: str, target_pos: dict, weapon: str = "rifle") -> List[dict]:
        match = self.get_or_create_match(match_id)
        if shooter_id not in match.players:
            return []
        
        shooter = match.players[shooter_id]
        if not shooter.is_alive or shooter.ammo <= 0:
            return []
        
        shooter.ammo -= 1
        damage_events = []
        shot_tx = target_pos.get("x", 0)
        shot_tz = target_pos.get("z", 0)

        # Weapon damage profiles
        damage_map = {
            "rifle": 24.0,
            "smg": 15.0,
            "shotgun": 68.0, # high close-range blast
            "pistol": 20.0
        }
        base_dmg = damage_map.get(weapon, 24.0)

        # Check players and bots
        for pid, target in match.players.items():
            if pid == shooter_id or not target.is_alive or target.is_shifting:
                continue

            dist = math.sqrt((target.position.x - shot_tx)**2 + (target.position.z - shot_tz)**2)
            hit_radius = 2.4 if weapon != "shotgun" else 3.5
            if dist < hit_radius:
                dmg = base_dmg
                actual_dmg = dmg
                if target.shield > 0:
                    absorbed = min(target.shield, dmg)
                    target.shield -= absorbed
                    actual_dmg -= absorbed
                if actual_dmg > 0:
                    target.health = max(0.0, target.health - actual_dmg)

                if target.health <= 0:
                    target.is_alive = False
                    shooter.kills += 1
                    shooter.intel_collected += 50
                    self.echo_engine.commit_echo_from_buffer(match_id, target.id, target.name, echo_type="combat")

                damage_events.append({
                    "target_id": target.id,
                    "damage": dmg,
                    "target_health": target.health,
                    "target_shield": target.shield,
                    "is_dead": not target.is_alive
                })

        # Check drones
        for drone in match.drones:
            if drone.alert_state == "disabled":
                continue
            dist = math.sqrt((drone.position.x - shot_tx)**2 + (drone.position.z - shot_tz)**2)
            if dist < 3.0:
                drone.health = max(0.0, drone.health - base_dmg)
                if drone.health <= 0:
                    drone.alert_state = "disabled"
                    drone.color = "#7d94b0"
                    shooter.intel_collected += 30
                else:
                    drone.alert_state = "combat"
                    drone.target_id = shooter_id
                    drone.color = "#FF3158"

        return damage_events

    def handle_weapon_switch(self, match_id: str, player_id: str, weapon: str) -> bool:
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return False
        match.players[player_id].active_weapon = weapon
        return True

    def handle_grenade(self, match_id: str, thrower_id: str, blast_pos: dict) -> dict:
        """EMP grenade detonation: stuns drones and damages shields."""
        match = self.get_or_create_match(match_id)
        if thrower_id not in match.players:
            return {}
        p = match.players[thrower_id]
        if p.emp_grenades <= 0:
            return {}
        p.emp_grenades -= 1

        bx = blast_pos.get("x", 0)
        bz = blast_pos.get("z", 0)
        radius = 8.0

        # Disable nearby drones for 8 seconds
        for drone in match.drones:
            dist = math.sqrt((drone.position.x - bx)**2 + (drone.position.z - bz)**2)
            if dist <= radius + 3.0:
                drone.alert_state = "disabled"
                drone.color = "#7d94b0"
                drone.disabled_until = time.time() + 8.0

        # Drain shields of nearby hostiles
        for pid, target in match.players.items():
            if pid == thrower_id or not target.is_alive:
                continue
            dist = math.sqrt((target.position.x - bx)**2 + (target.position.z - bz)**2)
            if dist <= radius:
                target.shield = max(0.0, target.shield - 60.0)

        return {"thrower_id": thrower_id, "blast_pos": blast_pos, "radius": radius}

    def handle_hack_terminal(self, match_id: str, player_id: str, terminal_id: str) -> bool:
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return False
        p = match.players[player_id]

        for term in match.terminals:
            if term.id == terminal_id and not term.is_hacked:
                dist = math.sqrt((p.position.x - term.position.x)**2 + (p.position.z - term.position.z)**2)
                if dist <= 4.0:
                    term.is_hacked = True
                    term.hacked_by = player_id
                    p.intel_collected += term.intel_value
                    # Temporarily disable drones
                    for drone in match.drones:
                        drone.alert_state = "disabled"
                        drone.color = "#7d94b0"
                        drone.disabled_until = time.time() + 6.0
                    return True
        return False

    def handle_specter_scan(self, match_id: str, player_id: str) -> dict:
        """SPECTER Scanner: acoustic ping that maps anomalies but risks drone detection (Section 12)."""
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return {}
        p = match.players[player_id]
        p.memory_used = min(p.memory_capacity, p.memory_used + 10)
        
        # Acoustic chirp alerts drones within 25m
        alerted_drones = []
        for drone in match.drones:
            if drone.alert_state == "disabled":
                continue
            dist = math.sqrt((drone.position.x - p.position.x)**2 + (drone.position.z - p.position.z)**2)
            if dist <= 25.0:
                drone.alert_state = "suspicious"
                drone.color = "#FFB000"
                drone.target_position = p.position.model_copy()
                alerted_drones.append(drone.id)
        
        return {
            "player_id": player_id,
            "memory_used": p.memory_used,
            "memory_capacity": p.memory_capacity,
            "alerted_drones": alerted_drones,
            "scan_origin": p.position.model_dump()
        }

    def handle_modify_anchor(self, match_id: str, player_id: str, echo_id: str, anchor_id: str, mod_type: str) -> Optional[EchoRecord]:
        """Modify specific anchor point on an Echo (Section 14)."""
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return None
        p = match.players[player_id]
        if p.shift_energy >= 15.0:
            p.shift_energy -= 15.0
            modified = self.echo_engine.modify_anchor(match_id, echo_id, anchor_id, mod_type)
            if modified:
                match.fracture_level = min(100.0, match.fracture_level + 15.0)
                if match.fracture_level >= 50.0:
                    match.fracture_active = True
                    match.weather = "fracture_storm"
                match.active_echoes = self.echo_engine.get_match_echoes(match_id)
                return modified
        return None

    def trigger_fracture(self, match_id: str, active: bool = True) -> bool:
        """Trigger or clear city-wide Reality Fracture state (Section 17)."""
        match = self.get_or_create_match(match_id)
        match.fracture_active = active
        match.fracture_level = 75.0 if active else 0.0
        match.weather = "fracture_storm" if active else "rain"
        return match.fracture_active

    def handle_modify_echo(self, match_id: str, player_id: str, echo_id: str, mod_type: str) -> Optional[EchoRecord]:
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return None
        p = match.players[player_id]
        if p.shift_energy >= 20.0:
            p.shift_energy -= 20.0
            modified = self.echo_engine.modify_echo(match_id, echo_id, mod_type)
            if modified:
                match.fracture_level = min(100.0, match.fracture_level + 10.0)
                if match.fracture_level >= 50.0:
                    match.fracture_active = True
                    match.weather = "fracture_storm"
            match.active_echoes = self.echo_engine.get_match_echoes(match_id)
            return modified
        return None

    def handle_shift(self, match_id: str, player_id: str) -> bool:
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return False
        p = match.players[player_id]
        if p.shift_energy >= 50.0 and not p.is_shifting:
            p.shift_energy -= 50.0
            p.is_shifting = True
            self.echo_engine.commit_echo_from_buffer(match_id, player_id, p.name, echo_type="movement")
            match.active_echoes = self.echo_engine.get_match_echoes(match_id)
            return True
        return False

    def deploy_decoy(self, match_id: str, player_id: str, forward_dir: dict) -> Optional[EchoRecord]:
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return None
        p = match.players[player_id]
        if p.shift_energy >= 30.0:
            p.shift_energy -= 30.0
            fw = Vector3D(x=forward_dir.get("x", 0), y=0, z=forward_dir.get("z", 1))
            decoy = self.echo_engine.create_decoy_echo(match_id, player_id, p.name, p.position, fw)
            match.active_echoes = self.echo_engine.get_match_echoes(match_id)
            return decoy
        return None

    def interact_core(self, match_id: str, player_id: str) -> bool:
        match = self.get_or_create_match(match_id)
        if player_id not in match.players:
            return False
        p = match.players[player_id]
        
        dist = math.sqrt((p.position.x - self.chrono_core_pos.x)**2 + (p.position.z - self.chrono_core_pos.z)**2)
        if dist <= 4.2 and not match.chrono_core_recovered:
            match.chrono_core_recovered = True
            match.chrono_core_carrier = player_id
            p.has_core = True
            p.intel_collected += 150
            match.extraction_available = True
            self.echo_engine.commit_echo_from_buffer(match_id, player_id, p.name, echo_type="interaction")
            match.active_echoes = self.echo_engine.get_match_echoes(match_id)
            # Alert all drones to carrier
            for drone in match.drones:
                if drone.alert_state != "disabled":
                    drone.alert_state = "combat"
                    drone.target_id = player_id
                    drone.color = "#FF3158"
            return True
        return False

    def tick(self, dt: float):
        now = time.time()
        for match_id, match in self.matches.items():
            if match.status != "active":
                continue
            
            match.elapsed_time += dt

            # Fracture decay
            if match.fracture_level > 0:
                match.fracture_level = max(0.0, match.fracture_level - dt * 0.6)
                if match.fracture_level < 35.0 and match.fracture_active:
                    match.fracture_active = False
                    match.weather = "rain"

            # Update bots & energy
            for pid, p in list(match.players.items()):
                if p.shift_energy < 100.0:
                    p.shift_energy = min(100.0, p.shift_energy + 4.0 * dt)

                if p.is_bot and p.is_alive:
                    self._update_bot_ai(match, p, dt)

            # Update drones
            self._update_drones(match, dt)

            # Extraction countdown
            if match.extraction_available and not match.extraction_completed:
                extracting_players = [
                    p for p in match.players.values()
                    if p.is_alive and math.sqrt((p.position.x - self.extraction_pos.x)**2 + (p.position.z - self.extraction_pos.z)**2) <= 6.0
                ]
                if extracting_players:
                    match.extraction_countdown += dt
                    if match.extraction_countdown >= 15.0:
                        match.extraction_completed = True
                        match.status = "completed"
                else:
                    match.extraction_countdown = max(0.0, match.extraction_countdown - dt * 0.5)

    def _update_drones(self, match: MatchState, dt: float):
        now = time.time()
        for i, drone in enumerate(match.drones):
            if drone.disabled_until > now:
                drone.alert_state = "disabled"
                drone.color = "#7d94b0"
                continue
            elif drone.alert_state == "disabled":
                drone.alert_state = "patrol"
                drone.color = "#00E5FF"

            # Drone patrol orbit
            t = match.elapsed_time * 0.4 + i * 3.14
            radius = 16.0 if i == 0 else 12.0
            cx = 0.0 if i == 0 else -14.0
            cz = 0.0 if i == 0 else -10.0

            drone.position.x = cx + math.cos(t) * radius
            drone.position.z = cz + math.sin(t) * radius
            drone.position.y = 6.5 + math.sin(t * 2.0) * 0.4
            drone.rotation.y = t + math.pi / 2

            # Check if player in spotlight cone
            carrier_id = match.chrono_core_carrier
            if carrier_id and carrier_id in match.players:
                drone.alert_state = "combat"
                drone.target_id = carrier_id
                drone.color = "#FF3158"
            else:
                # Detect nearby standing players
                detected = False
                for p in match.players.values():
                    if not p.is_alive or p.is_bot or p.is_shifting:
                        continue
                    dist = math.sqrt((drone.position.x - p.position.x)**2 + (drone.position.z - p.position.z)**2)
                    if dist < 12.0:
                        detected = True
                        drone.alert_state = "suspicious" if dist > 6.0 else "combat"
                        drone.color = "#FFB000" if dist > 6.0 else "#FF3158"
                        break
                if not detected:
                    drone.alert_state = "patrol"
                    drone.color = "#00E5FF"

    def _update_bot_ai(self, match: MatchState, bot: PlayerState, dt: float):
        t = match.elapsed_time * 0.5
        radius = 12.0
        
        if "wraith" in bot.id:
            # Memory Mimic: occasionally adopt disguise of a real player (Section 19)
            human_players = [pl for pl in match.players.values() if not pl.is_bot and pl.is_alive]
            if human_players and int(match.elapsed_time) % 20 < 10:
                mimic_target = human_players[0]
                bot.name = f"{mimic_target.name} [MIMIC]"
                bot.color = mimic_target.color
            else:
                bot.name = "ECHO WRAITH [ANOMALY]"
                bot.color = "#7C4DFF"

            target_x = math.sin(t) * 14.0
            target_z = math.sin(t * 2.0) * 8.0
        else:
            target_x = math.cos(t * 0.7) * radius
            target_z = -10.0 + math.sin(t * 0.7) * 10.0

        dx = target_x - bot.position.x
        dz = target_z - bot.position.z
        dist = math.sqrt(dx*dx + dz*dz)

        if dist > 0.5:
            move_speed = 3.5
            bot.position.x += (dx / dist) * move_speed * dt
            bot.position.z += (dz / dist) * move_speed * dt
            bot.rotation.y = math.atan2(dx, dz)
            bot.velocity.x = (dx / dist) * move_speed
            bot.velocity.z = (dz / dist) * move_speed
        else:
            bot.velocity.x = 0
            bot.velocity.z = 0

        self.echo_engine.record_frame(
            match.match_id, 
            bot.id, 
            bot.name, 
            bot.position, 
            bot.rotation, 
            "run" if dist > 0.5 else "idle"
        )
