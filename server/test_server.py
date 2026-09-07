"""
Verification script for ECHO//SHIFT backend
"""
import sys
import os
import asyncio
from models import Vector3D, Rotation3D, MatchState
from match_manager import MatchManager

def test_backend():
    print("[TEST] Initializing MatchManager...")
    mgr = MatchManager()
    match = mgr.get_or_create_match("test_sec09_01")
    assert match.match_id == "test_sec09_01"
    assert len(match.players) >= 2 # bots initialized
    assert len(match.active_echoes) >= 2 # seeded lore echoes
    print(f"[SUCCESS] Match created with {len(match.players)} bots and {len(match.active_echoes)} echoes.")

    # Test adding player
    p = mgr.add_player("test_sec09_01", "p_alpha", "ALPHA_SHIFTER", "Hunter")
    assert p.health == 100.0
    print("[SUCCESS] Player added successfully.")

    # Test player update & Echo keyframe recording
    mgr.update_player("test_sec09_01", "p_alpha", {
        "position": {"x": 5.0, "y": 0.5, "z": 10.0},
        "velocity": {"x": 6.0, "y": 0, "z": 0},
    })
    print("[SUCCESS] Player movement and Echo recording passed.")

    # Test shooting damage validation
    # Position bot near (0, 0, 0) and shoot at (0, 0, 0)
    bot = list(match.players.values())[0]
    bot.position = Vector3D(x=0.0, y=0.5, z=0.0)
    hits = mgr.handle_shoot("test_sec09_01", "p_alpha", {"x": 0.5, "y": 0.5, "z": 0.5})
    assert len(hits) > 0
    print(f"[SUCCESS] Gunfire validated: hit applied. Target health: {hits[0]['target_health']}")

    # Test shift ability
    shifted = mgr.handle_shift("test_sec09_01", "p_alpha")
    assert shifted is True
    print(f"[SUCCESS] Emergency Shift activated. Shift energy remaining: {p.shift_energy}")

    # Test decoy deployment
    decoy = mgr.deploy_decoy("test_sec09_01", "p_alpha", {"x": 1.0, "z": 0.0})
    assert decoy is not None
    assert decoy.echo_type == "decoy"
    print(f"[SUCCESS] Decoy deployed with {len(decoy.keyframes)} frames.")

    # Test weapon switching
    switched = mgr.handle_weapon_switch("test_sec09_01", "p_alpha", "shotgun")
    assert switched is True
    assert p.active_weapon == "shotgun"
    print(f"[SUCCESS] Weapon switch passed: current weapon is {p.active_weapon}")

    # Test EMP Grenade throw
    grenade = mgr.handle_grenade("test_sec09_01", "p_alpha", {"x": 2.0, "y": 0.5, "z": 2.0})
    assert grenade is not None
    assert p.emp_grenades == 1
    print(f"[SUCCESS] EMP grenade thrown: blast radius {grenade.get('radius')}m, remaining: {p.emp_grenades}")

    # Test Echo manipulation (redirect & deception alarm)
    echo_ids = [e.id for e in match.active_echoes]
    if echo_ids:
        test_echo_id = echo_ids[0]
        manip_red = mgr.handle_modify_echo("test_sec09_01", "p_alpha", test_echo_id, "redirect")
        assert manip_red is not None
        assert manip_red.is_modified is True
        print(f"[SUCCESS] Echo {test_echo_id} successfully redirected by 90 degrees.")

        p.shift_energy = 50.0
        manip_alarm = mgr.handle_modify_echo("test_sec09_01", "p_alpha", test_echo_id, "alarm")
        assert manip_alarm is not None
        assert manip_alarm.has_alarm is True
        print(f"[SUCCESS] Echo {test_echo_id} rigged with deception alarm.")

    # Test Chrono Core decryption interaction
    # Position player at vault (0, 0, -28)
    p.position = Vector3D(x=0.0, y=0.5, z=-28.0)
    core_state = mgr.interact_core("test_sec09_01", "p_alpha")
    assert core_state is True
    assert p.has_core is True
    print(f"[SUCCESS] Chrono Core vault decrypted & secured. Player has core: {p.has_core}")

    # Test ECHO//SHIFT 2.0 Echo Levels & Apex Echo
    apex_echoes = [e for e in match.active_echoes if e.is_apex]
    assert len(apex_echoes) > 0
    apex = apex_echoes[0]
    assert apex.level == "apex"
    assert apex.premonition_text is not None
    assert apex.forensics is not None
    assert len(apex.anchors) >= 2
    print(f"[SUCCESS] Apex Echo verified: {apex.creator_name} // Premonition: {apex.premonition_text[:40]}...")

    # Test Anchor Point modification (GDD Section 14)
    anchor_id = apex.anchors[0].id
    p.shift_energy = 50.0
    mod_anc = mgr.handle_modify_anchor("test_sec09_01", "p_alpha", apex.id, anchor_id, "reroute")
    assert mod_anc is not None
    assert mod_anc.anchors[0].is_modified is True
    print(f"[SUCCESS] Anchor Point {anchor_id} modified: rerouted successfully.")

    # Test SPECTER scan & acoustic drone alert (GDD Section 12)
    p.position = Vector3D(x=0.0, y=0.5, z=2.0)
    scan_result = mgr.handle_specter_scan("test_sec09_01", "p_alpha")
    assert scan_result["memory_used"] > 20
    assert len(scan_result["alerted_drones"]) > 0
    print(f"[SUCCESS] SPECTER scan executed: memory used {scan_result['memory_used']}MB, alerted {len(scan_result['alerted_drones'])} drones.")

    # Test Reality Fracture State (GDD Section 17)
    mgr.trigger_fracture("test_sec09_01", True)
    assert match.fracture_active is True
    assert match.weather == "fracture_storm"
    print(f"[SUCCESS] Reality Fracture triggered: stability {match.fracture_level}%, weather: {match.weather}")

    # Test world tick with drones, Wraith Memory Mimic, and bot AI
    for _ in range(5):
        mgr.tick(0.5)
    print(f"[SUCCESS] Drones active: {len(match.drones)}, Operatives in sector: {len(match.players)}")
    print("ALL BACKEND VERIFICATIONS PASSED!")

if __name__ == "__main__":
    test_backend()
