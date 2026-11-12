/**
 * BodyScope 3D - Synthesized Physiological Acoustics (Web Audio API)
 * S1 ("Lub") and S2 ("Dub") Heart Valve Closure Acoustics with Thoracic Resonance
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this.volume = 0.8;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported in this browser:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play S1 ("Lub") valve sound - Mitral & Tricuspid valve closure
   */
  playS1() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Primary low-frequency myocardial thump (~55-65 Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

    // Dynamic acoustic envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.75 * this.volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    // Thoracic body low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Play S2 ("Dub") valve sound - Aortic & Pulmonic valve closure
   */
  playS2() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Slightly higher frequency, shorter, crisper closure (~85-95 Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(92, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.09);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.60 * this.volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (!this.muted && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }
}
