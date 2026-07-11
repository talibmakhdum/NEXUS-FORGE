// Cyberpunk Synth Sound Engine using Web Audio API
import { logError } from './error-logger';

let audioContext: AudioContext | null = null;
let isAudioAvailable = true;

function getAudioContext(): AudioContext | null {
  if (!isAudioAvailable) return null;

  try {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        isAudioAvailable = false;
        return null;
      }
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {
        // Audio context suspended — non-critical
      });
    }
    return audioContext;
  } catch (error) {
    isAudioAvailable = false;
    logError({
      error: error instanceof Error ? error : 'Failed to initialize AudioContext',
      component: 'sounds.ts:getAudioContext',
      severity: 'warning',
    });
    return null;
  }
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sawtooth', volume = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return; // Audio not available — skip silently

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    gain.gain.value = volume;

    // Envelope
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (error) {
    logError({
      error: error instanceof Error ? error : 'Failed to play tone',
      component: 'sounds.ts:playTone',
      severity: 'info',
      context: { freq, duration, type },
    });
  }
}

export const sounds = {
  place: () => {
    playTone(880, 0.12, 'square', 0.2);
    setTimeout(() => playTone(1240, 0.08, 'sawtooth', 0.15), 40);
  },
  move: () => {
    playTone(420, 0.25, 'sawtooth', 0.25);
    setTimeout(() => playTone(680, 0.18, 'square', 0.2), 80);
  },
  capture: () => {
    playTone(180, 0.4, 'sawtooth', 0.4);
    setTimeout(() => playTone(95, 0.6, 'sawtooth', 0.3), 120);
  },
  lineWin: () => {
    // Triumphant ascending arpeggio for 5-in-a-row victory
    playTone(523, 0.15, 'sawtooth', 0.35);  // C5
    setTimeout(() => playTone(659, 0.15, 'sawtooth', 0.35), 80);   // E5
    setTimeout(() => playTone(784, 0.15, 'sawtooth', 0.35), 160);  // G5
    setTimeout(() => playTone(1047, 0.5, 'square', 0.4), 240);     // C6
  },
  nexusCapture: () => {
    playTone(140, 0.7, 'sawtooth', 0.5);
    setTimeout(() => playTone(70, 1.2, 'sawtooth', 0.4), 200);
  },
  energyGain: () => {
    playTone(1240, 0.1, 'square', 0.25);
    setTimeout(() => playTone(1480, 0.15, 'sawtooth', 0.2), 60);
  },
  forge: () => {
    playTone(520, 0.2, 'sawtooth', 0.3);
    setTimeout(() => playTone(780, 0.25, 'square', 0.25), 90);
  },
  /**
   * Test if audio is available in the current environment.
   * Call this on user interaction to unlock audio on mobile.
   */
  unlock: () => {
    const ctx = getAudioContext();
    if (ctx?.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  },
};
