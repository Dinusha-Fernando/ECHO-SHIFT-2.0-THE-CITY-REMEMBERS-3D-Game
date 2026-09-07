/**
 * ECHO//SHIFT - Procedural Web Audio Engine
 * 100% synthesized sound effects & dynamic cyberpunk ambient audio
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;

  private ensureContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // 1. Kinetic Pulse Rifle firing sound
  playShot() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Transient pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(2.5, t);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);

    // Subtle noise burst
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.08);
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
  }

  // 1b. Specter-9 SMG firing sound
  playSMGShot() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 1c. Scatter-12 Heavy Shotgun blast
  playShotgunShot() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.35);

    // Heavy blast noise
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
  }

  // 1d. Pulse-45 Sidearm
  playPistolShot() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.11);
    gain.gain.setValueAtTime(0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  // 1e. EMP Grenade detonation shockwave
  playEMPGrenade() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.6);
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.75);
  }

  // 1f. Computer Terminal Hack SFX
  playTerminalHack() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    [600, 900, 1200, 1600].forEach((freq, idx) => {
      const stepT = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, stepT);
      gain.gain.setValueAtTime(0.3, stepT);
      gain.gain.exponentialRampToValueAtTime(0.001, stepT + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(stepT);
      osc.stop(stepT + 0.05);
    });
  }

  // 1g. Security Drone Alert Siren
  playDroneAlert() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.setValueAtTime(750, t + 0.12);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // 2. Emergency Dimensional Shift sound (0.8s phase shift whoosh)
  playShift() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.8);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  // 3. Tactical Echo Scanner Ping (Cyber Sonar Chime)
  playScanPing() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.setValueAtTime(1480, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.6);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.75);
  }

  // 4. Echo Replay / Temporal Glitch
  playEchoReplay() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const stepT = t + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(300 + i * 250, stepT);
      gain.gain.setValueAtTime(0.35, stepT);
      gain.gain.exponentialRampToValueAtTime(0.001, stepT + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(stepT);
      osc.stop(stepT + 0.06);
    }
  }

  // 5. Objective Secure Chime (Chrono Core retrieved)
  playObjectiveSecured() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const stepT = t + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, stepT);
      gain.gain.setValueAtTime(0.5, stepT);
      gain.gain.exponentialRampToValueAtTime(0.001, stepT + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(stepT);
      osc.stop(stepT + 0.45);
    });
  }

  // 6. Tactical Footstep
  playFootstep() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // 7. Ambient Cyberpunk Drone
  startAmbient() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.masterGain || this.ambientOsc1) return;

      const t = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.01, t);
      this.ambientGain.gain.linearRampToValueAtTime(0.18, t + 3.0);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(220, t);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = "sawtooth";
      this.ambientOsc1.frequency.setValueAtTime(55, t); // A1 note

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = "sine";
      this.ambientOsc2.frequency.setValueAtTime(82.41, t); // E2 note

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch (e) {
      console.warn("[AUDIO] Ambient audio initialization skipped:", e);
    }
  }

  stopAmbient() {
    if (this.ambientGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.001, t + 1.0);
      setTimeout(() => {
        try {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
          this.ambientOsc1 = null;
          this.ambientOsc2 = null;
        } catch (e) {}
      }, 1100);
    }
  }

  // 8. ECHO//SHIFT 2.0 - Signature Echo Activation (Reverse Temporal Sweep & Micro-Freeze)
  playEchoActivationFreeze() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Reverse pitch sweep (rising exponentially into temporal snap)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.22);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.22);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.32);

    // High crystalline temporal chime
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = "sine";
    chime.frequency.setValueAtTime(1760, t + 0.2);
    chime.frequency.exponentialRampToValueAtTime(440, t + 0.5);
    chimeGain.gain.setValueAtTime(0.4, t + 0.2);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    chime.connect(chimeGain);
    chimeGain.connect(this.masterGain);
    chime.start(t + 0.2);
    chime.stop(t + 0.6);
  }

  // 9. SPECTER Scanner Acoustic Chirp (GDD Section 12)
  playSpecterAcousticChirp() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.linearRampToValueAtTime(1760, t + 0.12);
    osc.frequency.linearRampToValueAtTime(1320, t + 0.24);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 10. Anchor Point modification confirmation
  playAnchorModify() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1046.5, t); // C6
    osc.frequency.setValueAtTime(1318.5, t + 0.08); // E6
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // 11. Reality Fracture distortion warble (GDD Section 17)
  playFractureDistortion() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfoGain = this.ctx.createGain();

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(18, t); // 18Hz tremolo
    lfoGain.gain.setValueAtTime(60, t);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, t);

    lfo.connect(osc.frequency);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 1.3);
    osc.stop(t + 1.3);
  }

  // 12. Ambient Procedural Rain (Brown/Pink noise filter)
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;

  startRainAmbience() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.masterGain || this.rainNode) return;

      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
        lastOut = data[i];
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, t);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.01, t);
      this.rainGain.gain.linearRampToValueAtTime(0.12, t + 2.0);

      noise.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);

      noise.start();
      this.rainNode = noise;
    } catch (e) {
      console.warn("[AUDIO] Rain audio skipped:", e);
    }
  }

  stopRainAmbience() {
    if (this.rainGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.rainGain.gain.linearRampToValueAtTime(0.001, t + 1.0);
      setTimeout(() => {
        try {
          (this.rainNode as any)?.stop();
          this.rainNode = null;
          this.rainGain = null;
        } catch (e) {}
      }, 1100);
    }
  }

  setMasterVolume(vol: number) {
    this.ensureContext();
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const audio = new SoundEngine();
