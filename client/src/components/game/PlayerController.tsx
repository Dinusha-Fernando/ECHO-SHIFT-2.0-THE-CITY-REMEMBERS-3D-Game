"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../lib/store";
import { network } from "../../lib/socket";
import { audio } from "../audio/AudioManager";

export default function PlayerController() {
  const { camera } = useThree();
  const rifleRef = useRef<THREE.Group>(null);

  const {
    shiftEnergy,
    isShifting,
    isAiming,
    currentWeapon,
    setWeapon,
    empGrenades,
    throwGrenade,
    hasCore,
    decryptionProgress,
    setDecryptionProgress,
    triggerEmergencyShift,
    fireShot,
    reloadWeapon,
    toggleScanner,
    toggleTabInventory,
    updateStats,
    match,
    temporalFreezeActive,
    triggerTemporalFreeze,
    fractureActive
  } = useGameStore();

  const playerGroupRef = useRef<THREE.Group>(null);
  const position = useRef(new THREE.Vector3(0, 0.5, 20));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const keys = useRef<Record<string, boolean>>({});
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0.2);
  const isFirstPerson = useRef(false);
  const footstepTimer = useRef(0);
  const decryptTimer = useRef(0);
  const discoveredEchoes = useRef<Set<string>>(new Set());
  const [muzzleFlash, setMuzzleFlash] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : "";
      keys.current[code] = true;
      keys.current[key] = true;

      // Weapon Switching: 1, 2, 3, 4
      if (code === "Digit1" || key === "1") {
        setWeapon("rifle");
        network.sendWeaponSwitch("rifle");
      } else if (code === "Digit2" || key === "2") {
        setWeapon("smg");
        network.sendWeaponSwitch("smg");
      } else if (code === "Digit3" || key === "3") {
        setWeapon("shotgun");
        network.sendWeaponSwitch("shotgun");
      } else if (code === "Digit4" || key === "4") {
        setWeapon("pistol");
        network.sendWeaponSwitch("pistol");
      }

      // Throw EMP Grenade: G
      if (code === "KeyG" || key === "g") {
        if (empGrenades > 0) {
          const success = throwGrenade();
          if (success) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const blast = position.current.clone().add(dir.multiplyScalar(18));
            network.sendThrowGrenade({ x: blast.x, y: 0.2, z: blast.z });
          }
        }
      }

      // Emergency Shift: E or F
      if (code === "KeyF" || key === "f") {
        if (shiftEnergy >= 50 && !isShifting) {
          triggerEmergencyShift();
          network.sendShift();
          audio.playShift();
        }
      }

      // Tactical Scanner (SPECTER): Q (GDD Section 12)
      if (code === "KeyQ" || key === "q") {
        toggleScanner();
        audio.playSpecterAcousticChirp();
        network.sendAction("specter_scan", {});
      }

      // Deploy Decoy: X
      if (code === "KeyX" || key === "x") {
        const fw = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);
        network.sendDeployDecoy({ x: fw.x, z: fw.z });
      }

      // Reload: R
      if (code === "KeyR" || key === "r") {
        reloadWeapon();
      }

      // First/Third person toggle: V
      if (code === "KeyV" || key === "v") {
        isFirstPerson.current = !isFirstPerson.current;
      }

      // Tactical PDA / Inventory: Tab
      if (code === "Tab" || key === "tab") {
        e.preventDefault();
        toggleTabInventory();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : "";
      keys.current[code] = false;
      keys.current[key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement || e.buttons > 0) {
        cameraYaw.current -= (e.movementX || 0) * 0.0024;
        cameraPitch.current = Math.max(
          -0.55,
          Math.min(0.85, cameraPitch.current - (e.movementY || 0) * 0.0022)
        );
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        updateStats({ isAiming: true, is_aiming: true });
      } else if (e.button === 0) {
        const shotSuccess = fireShot();
        if (shotSuccess) {
          if (currentWeapon === "smg") audio.playSMGShot();
          else if (currentWeapon === "shotgun") audio.playShotgunShot();
          else if (currentWeapon === "pistol") audio.playPistolShot();
          else audio.playShot();

          setMuzzleFlash(true);
          setTimeout(() => setMuzzleFlash(false), 50);

          const dir = new THREE.Vector3();
          camera.getWorldDirection(dir);
          const target = position.current.clone().add(dir.multiplyScalar(45));
          network.sendShoot({ x: target.x, y: target.y, z: target.z }, currentWeapon);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        updateStats({ isAiming: false, is_aiming: false });
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [shiftEnergy, isShifting, currentWeapon, empGrenades, camera]);

  useFrame((state, delta) => {
    if (!playerGroupRef.current) return;

    // Movement calculation
    const moveDir = new THREE.Vector3();
    if (keys.current["KeyW"] || keys.current["w"] || keys.current["ArrowUp"]) moveDir.z -= 1;
    if (keys.current["KeyS"] || keys.current["s"] || keys.current["ArrowDown"]) moveDir.z += 1;
    if (keys.current["KeyA"] || keys.current["a"] || keys.current["ArrowLeft"]) moveDir.x -= 1;
    if (keys.current["KeyD"] || keys.current["d"] || keys.current["ArrowRight"]) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0;
    const isSprinting = keys.current["ShiftLeft"] || keys.current["ShiftRight"] || keys.current["shift"];
    const isCrouching = keys.current["ControlLeft"] || keys.current["KeyC"] || keys.current["c"] || keys.current["control"];

    let baseSpeed = 5.2;
    if (isSprinting && !isAiming) baseSpeed = 8.8;
    if (isCrouching) baseSpeed = 2.8;
    if (isAiming) baseSpeed = 3.2;
    if (isShifting) baseSpeed = 11.5;

    if (isMoving) {
      moveDir.normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, moveDir.x * baseSpeed, delta * 12);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, moveDir.z * baseSpeed, delta * 12);

      footstepTimer.current += delta * (isSprinting ? 2.8 : 1.8);
      if (footstepTimer.current >= 1.0) {
        audio.playFootstep();
        footstepTimer.current = 0;
      }
    } else {
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, 0, delta * 15);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, 0, delta * 15);
    }

    if ((keys.current["Space"] || keys.current[" "]) && isGrounded.current) {
      velocity.current.y = 7.5;
      isGrounded.current = false;
    }

    if (!isGrounded.current) {
      velocity.current.y -= 19.8 * delta;
      position.current.y += velocity.current.y * delta;
      if (position.current.y <= 0.5) {
        position.current.y = 0.5;
        velocity.current.y = 0;
        isGrounded.current = true;
      }
    }

    position.current.x = Math.max(-48, Math.min(48, position.current.x + velocity.current.x * delta));
    position.current.z = Math.max(-48, Math.min(48, position.current.z + velocity.current.z * delta));

    playerGroupRef.current.position.copy(position.current);
    playerGroupRef.current.rotation.y = cameraYaw.current;

    // Chrono Core Vault Decryption Interaction: holding E within 3.8m
    const distToCore = Math.sqrt(position.current.x ** 2 + (position.current.z - (-28)) ** 2);
    if (distToCore <= 3.8 && !hasCore && !(match?.chrono_core_recovered)) {
      if (keys.current["KeyE"] || keys.current["e"]) {
        decryptTimer.current = Math.min(2.5, decryptTimer.current + delta);
        const progress = Math.round((decryptTimer.current / 2.5) * 100);
        setDecryptionProgress(progress);
        if (progress >= 100) {
          network.sendInteractCore();
        }
      } else {
        decryptTimer.current = Math.max(0, decryptTimer.current - delta * 2);
        setDecryptionProgress(Math.round((decryptTimer.current / 2.5) * 100));
      }
    }

    // Terminal Hacking: press E when near any unhacked terminal
    if (match?.terminals && (keys.current["KeyE"] || keys.current["e"])) {
      for (const term of match.terminals) {
        if (!term.is_hacked) {
          const d = Math.sqrt((position.current.x - term.position.x) ** 2 + (position.current.z - term.position.z) ** 2);
          if (d <= 3.5) {
            network.sendHackTerminal(term.id);
            break;
          }
        }
      }
    }

    // Echo Discovery Micro-Freeze (GDD Section 7)
    const activeEchoes = match?.active_echoes || [];
    for (const echo of activeEchoes) {
      const d = Math.sqrt(
        (position.current.x - echo.start_pos.x) ** 2 +
        (position.current.z - echo.start_pos.z) ** 2
      );
      if (d <= 4.2 && !discoveredEchoes.current.has(echo.id)) {
        discoveredEchoes.current.add(echo.id);
        triggerTemporalFreeze();
        audio.playEchoActivationFreeze();
        break;
      }
    }

    // Camera follow & dynamics
    const target = position.current.clone().add(new THREE.Vector3(0, isCrouching ? 1.0 : 1.5, 0));
    const camOffset = new THREE.Vector3();

    if (isFirstPerson.current) {
      camOffset.set(0, 0.2, 0);
    } else {
      const shoulderX = isAiming ? 0.75 : 0.6;
      const shoulderY = isAiming ? 0.1 : 0.3;
      const distance = isAiming ? 2.2 : 3.8;

      camOffset.set(
        shoulderX,
        shoulderY + Math.sin(cameraPitch.current) * distance,
        Math.cos(cameraPitch.current) * distance
      );
      camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);
    }

    // Temporal camera shake during micro-freeze or Fracture
    if (temporalFreezeActive || fractureActive) {
      const shakeAmt = temporalFreezeActive ? 0.08 : 0.03;
      camOffset.x += (Math.random() - 0.5) * shakeAmt;
      camOffset.y += (Math.random() - 0.5) * shakeAmt;
    }

    camera.position.copy(target.clone().add(camOffset));
    camera.lookAt(target.clone().add(new THREE.Vector3(0, isAiming ? 0.1 : 0, 0)));

    network.queuePlayerUpdate({
      position: { x: position.current.x, y: position.current.y, z: position.current.z },
      rotation: { x: 0, y: cameraYaw.current, z: 0 },
      velocity: { x: velocity.current.x, y: velocity.current.y, z: velocity.current.z },
    });
  });

  return (
    <group ref={playerGroupRef} position={[0, 0.5, 20]}>
      <group visible={!isFirstPerson.current}>
        {/* Torso Armor */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.55, 0.7, 0.35]} />
          <meshStandardMaterial
            color={isShifting ? "#00e5ff" : "#131b2c"}
            roughness={0.4}
            metalness={0.8}
            transparent={isShifting}
            opacity={isShifting ? 0.45 : 1.0}
            wireframe={isShifting}
          />
        </mesh>

        {/* Tactical Helmet with Visor */}
        <group position={[0, 1.45, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color="#0d1422"
              roughness={0.2}
              metalness={0.9}
              transparent={isShifting}
              opacity={isShifting ? 0.5 : 1.0}
            />
          </mesh>
          <mesh position={[0, 0.03, -0.19]}>
            <boxGeometry args={[0.25, 0.07, 0.08]} />
            <meshBasicMaterial color={isShifting ? "#7c4dff" : "#00e5ff"} />
          </mesh>
        </group>

        {/* Back Shift Thruster Pack */}
        <group position={[0, 0.95, 0.22]}>
          <mesh castShadow>
            <boxGeometry args={[0.36, 0.45, 0.15]} />
            <meshStandardMaterial color="#1a2436" metalness={0.7} />
          </mesh>
          <mesh position={[-0.1, -0.18, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.15]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
          <mesh position={[0.1, -0.18, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.15]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
        </group>

        {/* Active Weapon Mesh */}
        <group
          ref={rifleRef}
          position={[0.35, isAiming ? 1.05 : 0.85, isAiming ? -0.45 : -0.2]}
          rotation={[isAiming ? 0 : 0.2, 0, 0]}
        >
          {/* Weapon body based on selected weapon */}
          {currentWeapon === "rifle" && (
            <mesh castShadow>
              <boxGeometry args={[0.1, 0.14, 0.65]} />
              <meshStandardMaterial color="#0b0f1a" metalness={0.9} roughness={0.2} />
            </mesh>
          )}
          {currentWeapon === "smg" && (
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.16, 0.45]} />
              <meshStandardMaterial color="#1c162b" metalness={0.8} />
            </mesh>
          )}
          {currentWeapon === "shotgun" && (
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.15, 0.75]} />
              <meshStandardMaterial color="#1f1812" metalness={0.9} />
            </mesh>
          )}
          {currentWeapon === "pistol" && (
            <mesh castShadow>
              <boxGeometry args={[0.07, 0.12, 0.25]} />
              <meshStandardMaterial color="#0d1422" metalness={0.9} />
            </mesh>
          )}

          {/* Muzzle Flash */}
          {muzzleFlash && (
            <mesh position={[0, 0.02, -0.6]}>
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshBasicMaterial color={currentWeapon === "smg" ? "#7c4dff" : "#00e5ff"} />
            </mesh>
          )}

          {/* Laser Guide when Aiming */}
          {isAiming && (
            <mesh position={[0, 0.02, -20]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 40, 6]} />
              <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
            </mesh>
          )}
        </group>

        {/* Legs */}
        <mesh position={[-0.15, 0.35, 0]} castShadow>
          <boxGeometry args={[0.18, 0.7, 0.22]} />
          <meshStandardMaterial color="#0e1524" roughness={0.6} />
        </mesh>
        <mesh position={[0.15, 0.35, 0]} castShadow>
          <boxGeometry args={[0.18, 0.7, 0.22]} />
          <meshStandardMaterial color="#0e1524" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
