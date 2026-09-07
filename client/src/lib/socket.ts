/**
 * ECHO//SHIFT - WebSocket Network Client
 */
import { useGameStore } from "./store";
import { audio } from "../components/audio/AudioManager";
import { MatchState, WeaponType, EchoRecord } from "./types";

class NetworkManager {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private updateInterval: any = null;
  private pendingUpdates: any = null;

  connect(matchId: string, playerId: string, name: string, role: string) {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const defaultWsBase = typeof window !== "undefined" ? `ws://${window.location.hostname}:8000` : "ws://localhost:8000";
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || defaultWsBase;
    const url = `${wsBase}/ws/match/${matchId}?player_id=${playerId}&name=${encodeURIComponent(name)}&role=${role}`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log("[NET] Connected to Sector 09 Match Server:", matchId);
        this.startSendingLoop();
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error("[NET] Failed to parse message:", e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.stopSendingLoop();
      };

      this.socket.onerror = (err) => {
        console.warn("[NET] WebSocket error:", err);
      };
    } catch (e) {
      console.warn("[NET] Could not connect WebSocket:", e);
    }
  }

  disconnect() {
    this.stopSendingLoop();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  queuePlayerUpdate(data: any) {
    this.pendingUpdates = {
      ...(this.pendingUpdates || {}),
      ...data
    };
  }

  sendShoot(targetPos: { x: number; y: number; z: number }, weapon: WeaponType = "rifle") {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "player_shoot",
        player_id: useGameStore.getState().playerId,
        data: { target_pos: targetPos, weapon }
      }));
    }
  }

  sendWeaponSwitch(weapon: WeaponType) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "weapon_switch",
        player_id: useGameStore.getState().playerId,
        data: { weapon }
      }));
    }
  }

  sendThrowGrenade(blastPos: { x: number; y: number; z: number }) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "throw_grenade",
        player_id: useGameStore.getState().playerId,
        data: { blast_pos: blastPos }
      }));
    }
  }

  sendModifyEcho(echoId: string, modType: "redirect" | "alarm" | "collapse") {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "modify_echo",
        player_id: useGameStore.getState().playerId,
        data: { echo_id: echoId, mod_type: modType }
      }));
    }
  }

  sendHackTerminal(terminalId: string) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "hack_terminal",
        player_id: useGameStore.getState().playerId,
        data: { terminal_id: terminalId }
      }));
    }
  }

  sendShift() {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "player_shift",
        player_id: useGameStore.getState().playerId,
        data: {}
      }));
    }
  }

  sendDeployDecoy(forwardDir: { x: number; z: number }) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "deploy_decoy",
        player_id: useGameStore.getState().playerId,
        data: { forward_dir: forwardDir }
      }));
    }
  }

  sendInteractCore() {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "interact_core",
        player_id: useGameStore.getState().playerId,
        data: {}
      }));
    }
  }

  sendAction(actionType: string, data: any = {}) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: actionType,
        player_id: useGameStore.getState().playerId,
        data
      }));
    }
  }

  sendModifyAnchor(echoId: string, anchorId: string, modType: "reroute" | "alarm" | "emp_trap") {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: "modify_anchor",
        player_id: useGameStore.getState().playerId,
        data: { echo_id: echoId, anchor_id: anchorId, mod_type: modType }
      }));
    }
  }

  private startSendingLoop() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
      if (this.socket && this.isConnected && this.pendingUpdates) {
        const store = useGameStore.getState();
        const payload = {
          type: "player_update",
          player_id: store.playerId,
          data: {
            ...this.pendingUpdates,
            shift_energy: store.shiftEnergy,
            ammo: store.ammo,
            active_weapon: store.currentWeapon,
            is_aiming: store.isAiming,
            is_firing: store.isFiring,
            is_shifting: store.isShifting
          }
        };
        this.socket.send(JSON.stringify(payload));
        this.pendingUpdates = null;
      }
    }, 50);
  }

  private stopSendingLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private handleMessage(msg: any) {
    const store = useGameStore.getState();

    switch (msg.type) {
      case "init_state":
      case "sync_snapshot":
        if (msg.match) {
          store.setMatch(msg.match as MatchState);
        }
        break;

      case "shot_fired":
        if (msg.target_pos) {
          store.addShotEvent({
            shooter_id: msg.shooter_id,
            target_pos: msg.target_pos,
            weapon: msg.weapon,
            damage_events: msg.damage_events
          });
          if (msg.shooter_id !== store.playerId) {
            if (msg.weapon === "smg") audio.playSMGShot();
            else if (msg.weapon === "shotgun") audio.playShotgunShot();
            else if (msg.weapon === "pistol") audio.playPistolShot();
            else audio.playShot();
          }
        }
        break;

      case "grenade_detonated":
        audio.playEMPGrenade();
        store.addGrenadeEvent({
          id: `grenade_${Date.now()}`,
          thrower_id: msg.thrower_id,
          blast_pos: msg.blast_pos,
          radius: msg.radius || 8.0,
          timestamp: Date.now()
        });
        break;

      case "terminal_hacked":
        audio.playTerminalHack();
        break;

      case "specter_ping":
        if (msg.scan_res) {
          if (msg.player_id === store.playerId) {
            store.setMemoryUsed(msg.scan_res.memory_used);
          }
        }
        break;

      case "anchor_modified":
        audio.playAnchorModify();
        if (store.match && msg.echo) {
          const updatedEchoes = store.match.active_echoes.map((e) =>
            e.id === msg.echo.id ? msg.echo : e
          );
          store.setMatch({
            ...store.match,
            active_echoes: updatedEchoes,
            fracture_level: msg.fracture_level ?? store.match.fracture_level
          });
        }
        break;

      case "echo_modified":
        audio.playEchoReplay();
        if (store.match && msg.echo) {
          const updatedEchoes = store.match.active_echoes.map((e) =>
            e.id === msg.echo.id ? msg.echo : e
          );
          store.setMatch({ ...store.match, active_echoes: updatedEchoes });
        }
        break;

      case "shift_activated":
        if (msg.player_id !== store.playerId) {
          audio.playShift();
        }
        break;

      case "core_captured":
        audio.playObjectiveSecured();
        audio.playDroneAlert();
        break;

      case "decoy_spawned":
        audio.playEchoReplay();
        break;
    }
  }
}

export const network = new NetworkManager();
