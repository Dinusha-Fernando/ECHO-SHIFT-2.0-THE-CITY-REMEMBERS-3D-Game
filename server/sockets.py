"""
ECHO//SHIFT - WebSocket Hub
Real-time delta synchronization between operatives, server authority, and broadcast loop.
"""
import asyncio
import json
import time
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from match_manager import MatchManager

ws_router = APIRouter()
match_manager = MatchManager()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.socket_meta: Dict[WebSocket, tuple] = {}
        self.tick_task: asyncio.Task = None

    async def connect(self, websocket: WebSocket, match_id: str, player_id: str, name: str, role: str = "Hunter"):
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = set()
        self.active_connections[match_id].add(websocket)
        self.socket_meta[websocket] = (match_id, player_id)

        match_manager.add_player(match_id, player_id, name, role)
        match = match_manager.get_or_create_match(match_id)
        await websocket.send_text(json.dumps({
            "type": "init_state",
            "player_id": player_id,
            "match": match.model_dump()
        }))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.socket_meta:
            match_id, player_id = self.socket_meta[websocket]
            if match_id in self.active_connections:
                self.active_connections[match_id].discard(websocket)
                if not self.active_connections[match_id]:
                    del self.active_connections[match_id]
            match_manager.remove_player(match_id, player_id)
            del self.socket_meta[websocket]

    async def broadcast(self, match_id: str, message: dict):
        if match_id not in self.active_connections:
            return
        payload = json.dumps(message)
        dead_sockets = []
        for ws in self.active_connections[match_id]:
            try:
                await ws.send_text(payload)
            except Exception:
                dead_sockets.append(ws)
        for ws in dead_sockets:
            self.disconnect(ws)

manager = ConnectionManager()

@ws_router.websocket("/ws/match/{match_id}")
async def match_websocket_endpoint(
    websocket: WebSocket, 
    match_id: str, 
    player_id: str = "op_default", 
    name: str = "SHIFTER",
    role: str = "Hunter"
):
    await manager.connect(websocket, match_id, player_id, name, role)
    try:
        while True:
            text = await websocket.receive_text()
            msg = json.loads(text)
            msg_type = msg.get("type")
            data = msg.get("data", {})

            if msg_type == "player_update":
                match_manager.update_player(match_id, player_id, data)

            elif msg_type == "player_shoot":
                target_pos = data.get("target_pos", {})
                weapon = data.get("weapon", "rifle")
                damage_events = match_manager.handle_shoot(match_id, player_id, target_pos, weapon)
                await manager.broadcast(match_id, {
                    "type": "shot_fired",
                    "shooter_id": player_id,
                    "target_pos": target_pos,
                    "weapon": weapon,
                    "damage_events": damage_events
                })

            elif msg_type == "weapon_switch":
                weapon = data.get("weapon", "rifle")
                match = match_manager.get_or_create_match(match_id)
                if player_id in match.players:
                    match.players[player_id].active_weapon = weapon
                await manager.broadcast(match_id, {
                    "type": "weapon_switched",
                    "player_id": player_id,
                    "weapon": weapon
                })

            elif msg_type == "throw_grenade":
                blast_pos = data.get("blast_pos", {})
                result = match_manager.handle_grenade(match_id, player_id, blast_pos)
                if result:
                    await manager.broadcast(match_id, {
                        "type": "grenade_detonated",
                        "thrower_id": player_id,
                        "blast_pos": blast_pos,
                        "radius": result.get("radius", 8.0)
                    })

            elif msg_type == "player_shift":
                success = match_manager.handle_shift(match_id, player_id)
                if success:
                    await manager.broadcast(match_id, {
                        "type": "shift_activated",
                        "player_id": player_id,
                        "timestamp": time.time()
                    })

            elif msg_type == "deploy_decoy":
                forward_dir = data.get("forward_dir", {})
                decoy = match_manager.deploy_decoy(match_id, player_id, forward_dir)
                if decoy:
                    await manager.broadcast(match_id, {
                        "type": "decoy_spawned",
                        "decoy": decoy.model_dump()
                    })

            elif msg_type == "modify_echo":
                echo_id = data.get("echo_id")
                mod_type = data.get("mod_type", "redirect")
                modified = match_manager.handle_modify_echo(match_id, player_id, echo_id, mod_type)
                if modified:
                    await manager.broadcast(match_id, {
                        "type": "echo_modified",
                        "echo": modified.model_dump()
                    })

            elif msg_type == "hack_terminal":
                term_id = data.get("terminal_id")
                success = match_manager.handle_hack_terminal(match_id, player_id, term_id)
                if success:
                    await manager.broadcast(match_id, {
                        "type": "terminal_hacked",
                        "terminal_id": term_id,
                        "hacked_by": player_id
                    })

            elif msg_type == "specter_scan":
                scan_res = match_manager.handle_specter_scan(match_id, player_id)
                await manager.broadcast(match_id, {
                    "type": "specter_ping",
                    "player_id": player_id,
                    "scan_res": scan_res
                })

            elif msg_type == "modify_anchor":
                echo_id = data.get("echo_id")
                anchor_id = data.get("anchor_id")
                mod_type = data.get("mod_type", "reroute")
                modified = match_manager.handle_modify_anchor(match_id, player_id, echo_id, anchor_id, mod_type)
                if modified:
                    await manager.broadcast(match_id, {
                        "type": "anchor_modified",
                        "echo": modified.model_dump(),
                        "fracture_level": match_manager.matches[match_id].fracture_level
                    })

            elif msg_type == "trigger_fracture":
                active = data.get("active", True)
                fracture_active = match_manager.trigger_fracture(match_id, active)
                await manager.broadcast(match_id, {
                    "type": "fracture_state_changed",
                    "fracture_active": fracture_active,
                    "fracture_level": match_manager.matches[match_id].fracture_level,
                    "weather": match_manager.matches[match_id].weather
                })

            elif msg_type == "interact_core":
                success = match_manager.interact_core(match_id, player_id)
                if success:
                    await manager.broadcast(match_id, {
                        "type": "core_captured",
                        "carrier_id": player_id
                    })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

async def server_tick_loop():
    dt = 0.04
    while True:
        try:
            match_manager.tick(dt)
            for match_id in list(manager.active_connections.keys()):
                match = match_manager.matches.get(match_id)
                if match:
                    await manager.broadcast(match_id, {
                        "type": "sync_snapshot",
                        "match": match.model_dump()
                    })
        except Exception:
            pass
        await asyncio.sleep(dt)
