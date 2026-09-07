"""
ECHO//SHIFT - Echo Engine
Handles temporal recording, Echo generation, playback tracks, and deep Echo manipulation.
"""
import time
import math
import random
from typing import Dict, List, Optional
from models import Vector3D, Rotation3D, EchoKeyframe, EchoRecord, AnchorPoint, ForensicsData, EchoLevel

class EchoEngine:
    def __init__(self):
        self.player_trails: Dict[str, List[EchoKeyframe]] = {}
        self.match_echoes: Dict[str, List[EchoRecord]] = {}
        self.max_buffer_len = 150

    def _build_anchors_from_keyframes(self, keyframes: List[EchoKeyframe]) -> List[AnchorPoint]:
        if not keyframes:
            return []
        anchors = []
        n = len(keyframes)
        # Sample 4 points: start, 1/3, 2/3, end
        indices = [0, max(1, n // 3), max(2, (2 * n) // 3), n - 1]
        indices = sorted(list(set(indices)))
        
        for idx_num, kf_idx in enumerate(indices):
            kf = keyframes[kf_idx]
            anc = AnchorPoint(
                index=idx_num,
                timestamp=kf.timestamp,
                position=kf.position.model_copy(),
                action=kf.action,
                is_modified=False
            )
            anchors.append(anc)
        return anchors

    def _generate_forensics(self, creator_name: str, keyframes: List[EchoKeyframe], echo_type: str, level: EchoLevel, premonition: Optional[str] = None) -> ForensicsData:
        activities = []
        for kf in keyframes:
            if kf.action not in activities:
                activities.append(kf.action.upper())
        
        start_p = keyframes[0].position if keyframes else Vector3D()
        end_p = keyframes[-1].position if keyframes else Vector3D()
        dx = end_p.x - start_p.x
        dz = end_p.z - start_p.z
        
        direction = "STATIONARY"
        if abs(dx) > abs(dz):
            direction = "EASTBOUND" if dx > 0 else "WESTBOUND"
        elif abs(dz) >= abs(dx) and (abs(dx) > 1 or abs(dz) > 1):
            direction = "SOUTHBOUND" if dz > 0 else "NORTHBOUND"

        risk_map = {
            "stable": "LOW",
            "damaged": "MODERATE",
            "corrupted": "CRITICAL",
            "fractured": "CRITICAL",
            "apex": "APEX_ANOMALY"
        }

        return ForensicsData(
            elapsed_str=f"0{random.randint(1, 4)}:{random.randint(10, 59)} AGO",
            direction=direction,
            activities=activities or ["RECON"],
            energy_signature="TACHYON-9 FRACTURE" if level != "apex" else "CHRONOS PRE-RECOGNITION",
            risk_level=risk_map.get(level, "MODERATE"),
            premonition_event=premonition
        )

    def record_frame(self, match_id: str, player_id: str, player_name: str, pos: Vector3D, rot: Rotation3D, action: str = "idle"):
        if player_id not in self.player_trails:
            self.player_trails[player_id] = []
        
        now = time.time()
        frame = EchoKeyframe(
            timestamp=now,
            position=pos,
            rotation=rot,
            action=action
        )
        self.player_trails[player_id].append(frame)

        if len(self.player_trails[player_id]) > self.max_buffer_len:
            self.player_trails[player_id].pop(0)

        # Commit historical Echo fragment occasionally
        if len(self.player_trails[player_id]) >= 40 and random.random() < 0.015:
            self.commit_echo_from_buffer(match_id, player_id, player_name, echo_type="movement")

    def commit_echo_from_buffer(self, match_id: str, player_id: str, player_name: str, echo_type: str = "movement") -> Optional[EchoRecord]:
        buffer = self.player_trails.get(player_id, [])
        if len(buffer) < 15:
            return None
        
        keyframes_slice = [kf.model_copy() for kf in buffer[-40:]]
        start_t = keyframes_slice[0].timestamp
        duration = keyframes_slice[-1].timestamp - start_t
        
        for kf in keyframes_slice:
            kf.timestamp = round(kf.timestamp - start_t, 3)

        anchors = self._build_anchors_from_keyframes(keyframes_slice)
        level: EchoLevel = "stable" if echo_type == "movement" else ("damaged" if echo_type == "combat" else "fractured")
        forensics = self._generate_forensics(player_name, keyframes_slice, echo_type, level)

        echo = EchoRecord(
            match_id=match_id,
            creator_id=player_id,
            creator_name=player_name,
            echo_type=echo_type,
            level=level,
            duration=duration,
            keyframes=keyframes_slice,
            anchors=anchors,
            forensics=forensics,
            start_pos=keyframes_slice[0].position,
            end_pos=keyframes_slice[-1].position,
            intel_value=45 if echo_type == "combat" else 25,
            color_hue="cyan" if level == "stable" else ("amber" if level == "damaged" else "violet")
        )

        if match_id not in self.match_echoes:
            self.match_echoes[match_id] = []
        
        self.match_echoes[match_id].append(echo)
        if len(self.match_echoes[match_id]) > 20:
            self.match_echoes[match_id].pop(0)

        return echo

    def modify_anchor(self, match_id: str, echo_id: str, anchor_id: str, mod_type: str) -> Optional[EchoRecord]:
        """Modify a specific Anchor Point on an Echo (Section 14 of GDD)."""
        echoes = self.match_echoes.get(match_id, [])
        target_echo = next((e for e in echoes if e.id == echo_id), None)
        if not target_echo:
            return None

        anchor = next((a for a in target_echo.anchors if a.id == anchor_id), None)
        if not anchor:
            if target_echo.anchors:
                anchor = target_echo.anchors[0]
            else:
                return None

        anchor.is_modified = True
        anchor.modification_type = mod_type
        target_echo.is_modified = True

        if mod_type == "reroute":
            # Shift anchor and downstream keyframes by 90-degree lateral displacement
            anchor.position.x += 6.0
            target_echo.direction_offset += math.pi / 2
            for kf in target_echo.keyframes:
                if kf.timestamp >= anchor.timestamp:
                    kf.position.x += 6.0
            target_echo.color_hue = "amber"

        elif mod_type == "alarm":
            target_echo.has_alarm = True
            target_echo.color_hue = "magenta"

        elif mod_type == "emp_trap":
            target_echo.level = "corrupted"
            target_echo.color_hue = "violet"

        return target_echo

    def modify_echo(self, match_id: str, echo_id: str, mod_type: str, value: float = 0.0) -> Optional[EchoRecord]:
        """Manipulate an existing Echo (Section 6 & 14 of GDD)."""
        echoes = self.match_echoes.get(match_id, [])
        target_echo = next((e for e in echoes if e.id == echo_id), None)
        if not target_echo:
            return None

        target_echo.is_modified = True

        if mod_type == "redirect":
            angle = value or (math.pi / 2)
            target_echo.direction_offset += angle
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            origin_x = target_echo.start_pos.x
            origin_z = target_echo.start_pos.z

            for kf in target_echo.keyframes:
                dx = kf.position.x - origin_x
                dz = kf.position.z - origin_z
                rx = dx * cos_a - dz * sin_a
                rz = dx * sin_a + dz * cos_a
                kf.position.x = round(origin_x + rx, 2)
                kf.position.z = round(origin_z + rz, 2)
                kf.rotation.y = round(kf.rotation.y + angle, 3)

            target_echo.end_pos = target_echo.keyframes[-1].position
            target_echo.color_hue = "amber"

            # Rebuild anchors after trajectory shift
            target_echo.anchors = self._build_anchors_from_keyframes(target_echo.keyframes)

        elif mod_type == "alarm":
            target_echo.has_alarm = True
            target_echo.color_hue = "magenta"

        elif mod_type == "collapse":
            target_echo.is_active = False

        return target_echo

    def create_decoy_echo(self, match_id: str, player_id: str, player_name: str, current_pos: Vector3D, forward_dir: Vector3D) -> EchoRecord:
        keyframes = []
        speed = 8.5
        duration = 4.0
        steps = 20
        dt = duration / steps

        px, py, pz = current_pos.x, current_pos.y, current_pos.z
        dx, dz = forward_dir.x, forward_dir.z
        mag = math.sqrt(dx*dx + dz*dz) or 1.0
        dx /= mag
        dz /= mag
        rot_y = math.atan2(dx, dz)

        for i in range(steps + 1):
            t = i * dt
            kf = EchoKeyframe(
                timestamp=round(t, 2),
                position=Vector3D(
                    x=round(px + dx * speed * t, 2),
                    y=round(py, 2),
                    z=round(pz + dz * speed * t, 2)
                ),
                rotation=Rotation3D(x=0, y=round(rot_y, 3), z=0),
                action="sprint" if i < steps - 2 else "idle"
            )
            keyframes.append(kf)

        anchors = self._build_anchors_from_keyframes(keyframes)
        forensics = self._generate_forensics(f"{player_name} [DECOY]", keyframes, "decoy", "damaged")

        decoy = EchoRecord(
            match_id=match_id,
            creator_id=player_id,
            creator_name=f"{player_name} [DECOY]",
            echo_type="decoy",
            level="damaged",
            duration=duration,
            keyframes=keyframes,
            anchors=anchors,
            forensics=forensics,
            start_pos=keyframes[0].position,
            end_pos=keyframes[-1].position,
            intel_value=15,
            color_hue="amber"
        )

        if match_id not in self.match_echoes:
            self.match_echoes[match_id] = []
        self.match_echoes[match_id].append(decoy)
        return decoy

    def get_match_echoes(self, match_id: str) -> List[EchoRecord]:
        return self.match_echoes.get(match_id, [])

    def seed_initial_sector_echoes(self, match_id: str):
        if match_id in self.match_echoes and len(self.match_echoes[match_id]) > 0:
            return

        self.match_echoes[match_id] = []

        # 1. Stable Echo: Operative NYX-09 (Cyan)
        t1_frames = []
        for i in range(25):
            t = i * 0.4
            t1_frames.append(EchoKeyframe(
                timestamp=round(t, 2),
                position=Vector3D(x=-18 + i * 1.0, y=0.5, z=14 - i * 0.8),
                rotation=Rotation3D(x=0, y=1.2, z=0),
                action="run" if i < 20 else "interact"
            ))
        e1 = EchoRecord(
            match_id=match_id,
            creator_id="op_runner_nyx",
            creator_name="NYX-09 [SURVIVOR]",
            echo_type="movement",
            level="stable",
            duration=10.0,
            keyframes=t1_frames,
            anchors=self._build_anchors_from_keyframes(t1_frames),
            forensics=self._generate_forensics("NYX-09", t1_frames, "movement", "stable"),
            start_pos=t1_frames[0].position,
            end_pos=t1_frames[-1].position,
            intel_value=30,
            color_hue="cyan"
        )

        # 2. Damaged Echo: Operative VEX-04 (Amber)
        t2_frames = []
        for i in range(20):
            t = i * 0.5
            t2_frames.append(EchoKeyframe(
                timestamp=round(t, 2),
                position=Vector3D(x=14 - i * 0.9, y=0.5, z=-10 - i * 0.5),
                rotation=Rotation3D(x=0, y=-0.9, z=0),
                action="shoot" if (i % 3 == 0) else "sprint"
            ))
        e2 = EchoRecord(
            match_id=match_id,
            creator_id="op_ghost_vex",
            creator_name="VEX-04 [KIA // SECTOR 09]",
            echo_type="combat",
            level="damaged",
            duration=10.0,
            keyframes=t2_frames,
            anchors=self._build_anchors_from_keyframes(t2_frames),
            forensics=self._generate_forensics("VEX-04", t2_frames, "combat", "damaged"),
            start_pos=t2_frames[0].position,
            end_pos=t2_frames[-1].position,
            intel_value=45,
            color_hue="amber"
        )

        # 3. Corrupted / Fractured Echo: KESTREL-02 (Violet)
        t3_frames = []
        for i in range(24):
            t = i * 0.35
            # Repeating stutter pattern around metro stairs
            offset = math.sin(i * 1.5) * 1.2
            t3_frames.append(EchoKeyframe(
                timestamp=round(t, 2),
                position=Vector3D(x=-20.0 + offset, y=0.5, z=-2.0 + (i * 0.4)),
                rotation=Rotation3D(x=0, y=0.0, z=0),
                action="shift" if (i % 4 == 0) else "run"
            ))
        e3 = EchoRecord(
            match_id=match_id,
            creator_id="op_hunter_kestrel",
            creator_name="KESTREL-02 [TIMELINE FRACTURE]",
            echo_type="interaction",
            level="fractured",
            duration=8.4,
            keyframes=t3_frames,
            anchors=self._build_anchors_from_keyframes(t3_frames),
            forensics=self._generate_forensics("KESTREL-02", t3_frames, "interaction", "fractured"),
            start_pos=t3_frames[0].position,
            end_pos=t3_frames[-1].position,
            intel_value=60,
            color_hue="violet"
        )

        # 4. APEX ECHO: Future Premonition (Gold/White) - GDD Sections 9 & 10
        t4_frames = []
        for i in range(18):
            t = i * 0.4
            t4_frames.append(EchoKeyframe(
                timestamp=round(t, 2),
                position=Vector3D(x=0.0 + (math.cos(i * 0.4) * 4.0), y=1.2, z=-22.0 - (i * 0.4)),
                rotation=Rotation3D(x=0, y=3.14, z=0),
                action="shift"
            ))
        premonition_desc = "PREMONITION // T+02:15: Heavy drone airstrike targets North Conduit; Vault containment barrier will fracture."
        e4 = EchoRecord(
            match_id=match_id,
            creator_id="chronos_engine_apex",
            creator_name="CHRONOS APEX ENTITY [FUTURE EVENT]",
            echo_type="interaction",
            level="apex",
            is_apex=True,
            premonition_text=premonition_desc,
            duration=7.2,
            keyframes=t4_frames,
            anchors=self._build_anchors_from_keyframes(t4_frames),
            forensics=self._generate_forensics("CHRONOS APEX", t4_frames, "interaction", "apex", premonition_desc),
            start_pos=t4_frames[0].position,
            end_pos=t4_frames[-1].position,
            intel_value=100,
            color_hue="gold"
        )

        self.match_echoes[match_id].extend([e1, e2, e3, e4])
