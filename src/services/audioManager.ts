/**
 * Procedural Web Audio Engine for SKYBIRD
 * Synthesizes adaptive aerodynamic audio, cyber bird cries, wing swooshes,
 * ambient wind, tension drones, thunder, lightning, jet explosions,
 * countdown blips, and victorious cash out fanfares.
 */

import { SoundConfig } from '../types';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Continuous sound loops
  private windNode: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;

  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  private thrusterNode: AudioBufferSourceNode | null = null;
  private thrusterFilter: BiquadFilterNode | null = null;
  private thrusterGain: GainNode | null = null;

  private config: SoundConfig = {
    masterVolume: 0.9,
    musicVolume: 0.75,
    sfxVolume: 0.95,
    muted: false
  };

  private lastFlapTime = 0;
  private lastMilestonePassed = 1;
  private isAudioUnlocked = false;

  constructor() {
    // Setup global gesture listener to instantly unlock and resume AudioContext on modern browsers
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.ensureContext();
        this.resume();
        if (this.ctx && this.ctx.state === 'running') {
          this.isAudioUnlocked = true;
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('pointerdown', unlock);
        }
      };

      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('pointerdown', unlock, { passive: true });
    }
  }

  /** Ensure AudioContext is initialized and routing graph is connected */
  public ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;

        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.updateVolumes();
      } catch (err) {
        console.warn('Web Audio API not supported or blocked:', err);
        return null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isAudioUnlocked = true;
      }).catch(() => {
        // Will unlock on next user gesture
      });
    }

    return this.ctx;
  }

  public init() {
    this.ensureContext();
  }

  public resume() {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public isUnlocked(): boolean {
    return this.isAudioUnlocked || (this.ctx?.state === 'running');
  }

  public setConfig(newConfig: Partial<SoundConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.updateVolumes();
  }

  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  public toggleMute(): boolean {
    this.config.muted = !this.config.muted;
    this.ensureContext();
    this.resume();
    this.updateVolumes();
    return this.config.muted;
  }

  private updateVolumes() {
    if (!this.masterGain || !this.musicGain || !this.sfxGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const masterVal = this.config.muted ? 0 : this.config.masterVolume;

    this.masterGain.gain.setValueAtTime(masterVal, now);
    this.musicGain.gain.setValueAtTime(this.config.musicVolume, now);
    this.sfxGain.gain.setValueAtTime(this.config.sfxVolume, now);
  }

  // ==========================================
  // --- BIRD & FLIGHT PROCEDURAL SOUNDS ---
  // ==========================================

  /**
   * Futuristic Cyber Bird Cry (Grito / Pio Cibernético do Pássaro)
   * Plays a high-tech robotic falcon chirp during takeoff or milestone bursts
   */
  public playBirdCry(type: 'takeoff' | 'milestone' | 'high_altitude' = 'takeoff') {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const modOsc = ctx.createOscillator();
    const modGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    if (type === 'takeoff') {
      // Ascending fierce cyber screech
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

      osc2.frequency.setValueAtTime(1200, now);
      osc2.frequency.exponentialRampToValueAtTime(3600, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(2100, now + 0.35);

      // Vibrato modulation
      modOsc.frequency.setValueAtTime(45, now);
      modGain.gain.setValueAtTime(180, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.18);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28 * this.config.sfxVolume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      modOsc.connect(modGain);
      modGain.connect(osc1.frequency);
      modGain.connect(osc2.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      modOsc.start(now);
      osc1.start(now);
      osc2.start(now);

      modOsc.stop(now + 0.4);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else {
      // Milestone triumphant chirp
      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(1400, now);
      osc1.frequency.exponentialRampToValueAtTime(2800, now + 0.1);
      osc1.frequency.exponentialRampToValueAtTime(1900, now + 0.22);

      osc2.frequency.setValueAtTime(2100, now);
      osc2.frequency.exponentialRampToValueAtTime(4200, now + 0.1);

      gain.gain.setValueAtTime(0.22 * this.config.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    }
  }

  /**
   * Cyber Bird Wing Flap / Swoosh
   * Aerodynamic wing beat synchronized with dynamic flight
   */
  public playBirdFlap(throttleMs = 280) {
    const nowMs = performance.now();
    if (nowMs - this.lastFlapTime < throttleMs) return;
    this.lastFlapTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.13);
    filter.Q.setValueAtTime(2.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    noise.start(now);
  }

  /**
   * Takeoff rocket ignition & cyber bird leap
   */
  public playTakeoff() {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;
    this.playBirdCry('takeoff');

    // Low thruster surge
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.65);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.65);

    gain.gain.setValueAtTime(0.35 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  // ==========================================
  // --- CONTINUOUS AMBIENT FLIGHT SYSTEM ---
  // ==========================================

  /** Continuous ambient flight wind & multiplier tension loop */
  public startFlightAmbient() {
    const ctx = this.ensureContext();
    if (!ctx || this.windNode) return;
    this.resume();

    this.lastMilestonePassed = 1;
    const now = ctx.currentTime;

    // 1. Wind & Atmospheric Friction Noise (Brown/Pink noise buffer)
    const bufferSize = Math.floor(ctx.sampleRate * 2.5);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = data[i];
      data[i] *= 4.0;
    }

    this.windNode = ctx.createBufferSource();
    this.windNode.buffer = buffer;
    this.windNode.loop = true;

    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(320, now);

    this.windGain = ctx.createGain();
    this.windGain.gain.setValueAtTime(0.22 * this.config.sfxVolume, now);

    this.windNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.sfxGain!);

    this.windNode.start();

    // 2. Continuous Synth Tension Drone (Harmonic Oscillators)
    this.droneOsc1 = ctx.createOscillator();
    this.droneOsc2 = ctx.createOscillator();
    this.droneOsc3 = ctx.createOscillator();
    this.droneFilter = ctx.createBiquadFilter();
    this.droneGain = ctx.createGain();

    this.droneOsc1.type = 'sawtooth';
    this.droneOsc2.type = 'sine';
    this.droneOsc3.type = 'triangle';

    this.droneOsc1.frequency.setValueAtTime(65.41, now); // C2
    this.droneOsc2.frequency.setValueAtTime(130.81, now); // C3
    this.droneOsc3.frequency.setValueAtTime(196.00, now); // G3

    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(380, now);

    this.droneGain.gain.setValueAtTime(0.14 * this.config.musicVolume, now);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneOsc3.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.musicGain!);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.droneOsc3.start();
  }

  /** Update aerodynamic speed & pitch based on live multiplier */
  public updateFlightIntensity(multiplier: number, altitudeStage: string) {
    const ctx = this.ensureContext();
    if (!ctx || !this.windFilter || !this.windGain || !this.droneOsc1) return;
    const now = ctx.currentTime;

    // Check for milestone chirps
    const milestoneSteps = [2.0, 5.0, 10.0, 25.0, 50.0, 100.0];
    for (const m of milestoneSteps) {
      if (multiplier >= m && this.lastMilestonePassed < m) {
        this.lastMilestonePassed = m;
        this.playBirdCry('milestone');
        break;
      }
    }

    // Scale wind filter cutoff and volume
    const normalizedMult = Math.min(40, multiplier);
    const targetFreq = Math.min(6500, 320 + Math.pow(normalizedMult, 1.25) * 85);
    this.windFilter.frequency.setTargetAtTime(targetFreq, now, 0.15);

    const targetWindGain = Math.min(0.55, 0.18 + (normalizedMult / 40) * 0.35) * this.config.sfxVolume;
    this.windGain.gain.setTargetAtTime(targetWindGain, now, 0.15);

    // Scale tension harmonic drone frequencies
    const baseFreq = 65.41 * Math.pow(1.08, Math.min(24, Math.log2(Math.max(1, multiplier)) * 4));
    this.droneOsc1.frequency.setTargetAtTime(baseFreq, now, 0.15);

    if (this.droneOsc2) {
      this.droneOsc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.15);
    }
    if (this.droneOsc3) {
      this.droneOsc3.frequency.setTargetAtTime(baseFreq * 3, now, 0.15);
    }

    if (this.droneFilter) {
      const droneCutoff = Math.min(2400, 380 + normalizedMult * 45);
      this.droneFilter.frequency.setTargetAtTime(droneCutoff, now, 0.15);
    }
  }

  /** Stop continuous flight ambient */
  public stopFlightAmbient() {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    if (this.windGain) {
      try {
        this.windGain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      } catch {}
    }
    if (this.droneGain) {
      try {
        this.droneGain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      } catch {}
    }

    setTimeout(() => {
      try {
        if (this.windNode) {
          this.windNode.stop();
          this.windNode.disconnect();
          this.windNode = null;
        }
        if (this.droneOsc1) {
          this.droneOsc1.stop();
          this.droneOsc1.disconnect();
          this.droneOsc1 = null;
        }
        if (this.droneOsc2) {
          this.droneOsc2.stop();
          this.droneOsc2.disconnect();
          this.droneOsc2 = null;
        }
        if (this.droneOsc3) {
          this.droneOsc3.stop();
          this.droneOsc3.disconnect();
          this.droneOsc3 = null;
        }
      } catch {
        // cleanup safe
      }
    }, 300);
  }

  // ==========================================
  // --- ENVIRONMENTAL & GAME EVENT SOUNDS ---
  // ==========================================

  /** Thunder & Lightning crackle */
  public playThunder() {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.85);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + 0.75);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    noise.start(now);
  }

  /** Jet flyby and mid-air explosion */
  public playAircraftExplosion() {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;

    // Jet whoosh
    const jetOsc = ctx.createOscillator();
    jetOsc.type = 'sawtooth';
    jetOsc.frequency.setValueAtTime(420, now);
    jetOsc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

    const jetGain = ctx.createGain();
    jetGain.gain.setValueAtTime(0.22 * this.config.sfxVolume, now);
    jetGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    jetOsc.connect(jetGain);
    jetGain.connect(this.sfxGain!);
    jetOsc.start(now);
    jetOsc.stop(now + 0.35);

    // Metallic explosion impact
    const bufferSize = Math.floor(ctx.sampleRate * 0.65);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now + 0.08);
    filter.Q.setValueAtTime(2.2, now + 0.08);

    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0.5 * this.config.sfxVolume, now + 0.08);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    noise.connect(filter);
    filter.connect(boomGain);
    boomGain.connect(this.sfxGain!);

    noise.start(now + 0.08);
  }

  /** Cash Out Triumph Chime & Arpeggio */
  public playCashOut() {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3 * this.config.sfxVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  /** Crash impact and descending tone */
  public playCrash() {
    this.stopFlightAmbient();
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;

    // Sub-bass heavy thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.55);

    oscGain.gain.setValueAtTime(0.75 * this.config.sfxVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.6);

    // Harsh noise shatter
    const bufferSize = Math.floor(ctx.sampleRate * 0.55);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.14));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.45);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65 * this.config.sfxVolume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain!);

    noise.start(now);
  }

  /** Countdown beep */
  public playCountdown(isFinal = false) {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'square' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);

    gain.gain.setValueAtTime(0.24 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.28 : 0.14));

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.32 : 0.16));
  }

  /** UI click button sound */
  public playButtonClick() {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.18 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /** Notification chime */
  public playNotification() {
    const ctx = this.ensureContext();
    if (!ctx || this.config.muted) return;
    this.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.22 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.26);
  }
}

export const audioManager = new AudioManager();
