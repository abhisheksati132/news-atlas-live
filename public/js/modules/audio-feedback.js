/**
 * NewsAtlas Audio-Haptic Procedural Feedback Engine
 * Synthesizes lightweight, zero-dependency tactical sound design via Web Audio API.
 * Follows Apple & Linear audio-haptic principles: subtle, non-intrusive micro-cues.
 */

class AudioHapticsEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.volume = 0.15; // Subtle master volume (15%)

    // Check user preference and reduced-motion setting
    const stored = localStorage.getItem('newsatlas_audio_enabled');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Opt-in or respect stored state; if reduced motion is preferred, disable by default
    this.enabled = stored === 'true' && !prefersReducedMotion;

    this._boundInit = this._initContext.bind(this);
    window.addEventListener('click', this._boundInit, { once: true });
    window.addEventListener('keydown', this._boundInit, { once: true });
  }

  _initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  _resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleAudio(forceState) {
    if (typeof forceState === 'boolean') {
      this.enabled = forceState;
    } else {
      this.enabled = !this.enabled;
    }
    localStorage.setItem('newsatlas_audio_enabled', String(this.enabled));
    if (this.enabled) {
      this._initContext();
      this._resumeContext();
      this.play('select');
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  play(soundType = 'tick') {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    this._resumeContext();

    const t = this.ctx.currentTime;

    try {
      switch (soundType) {
        case 'tick': {
          // Subtle mechanical click (8ms)
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1400, t);
          osc.frequency.exponentialRampToValueAtTime(400, t + 0.008);

          gain.gain.setValueAtTime(this.volume * 0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.009);
          break;
        }

        case 'select': {
          // Tactical confirmation frequency chirp (35ms)
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.exponentialRampToValueAtTime(1760, t + 0.035);

          gain.gain.setValueAtTime(this.volume * 0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.036);
          break;
        }

        case 'preset': {
          // Resonant layout switch tone (55ms)
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(520, t);
          osc1.frequency.exponentialRampToValueAtTime(780, t + 0.05);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(260, t);
          osc2.frequency.exponentialRampToValueAtTime(390, t + 0.05);

          gain.gain.setValueAtTime(this.volume * 0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.056);
          osc2.stop(t + 0.056);
          break;
        }

        case 'toggle': {
          // Mode toggle pip (20ms)
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.exponentialRampToValueAtTime(900, t + 0.02);

          gain.gain.setValueAtTime(this.volume * 0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.021);
          break;
        }

        default:
          break;
      }
    } catch {
      // AudioContext error handling - fail silently
    }
  }
}

export const audioHaptics = new AudioHapticsEngine();
if (typeof window !== 'undefined') {
  window.audioHaptics = audioHaptics;
}
