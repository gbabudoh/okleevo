"use client";

// ─── Web Audio API Ringtone Synthesizer ──────────────────────────────────────
// Creates loud, zero-latency, cross-platform ringtones without external mp3 dependencies.

let audioCtx: AudioContext | null = null;
let activeInterval: ReturnType<typeof setInterval> | null = null;
let isRinging = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
  Plays a single pulse pair (e.g., dual-frequency chime)
 */
function playTonePulse(freq1: number, freq2: number, durationSeconds: number, volume: number = 0.35) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(freq1, now);
    osc2.frequency.setValueAtTime(freq2, now);

    // Envelope for crisp, pleasant ringtone chime
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + durationSeconds);
    osc2.stop(now + durationSeconds);
  } catch (e) {
    console.warn('[Ringtone] AudioContext error:', e);
  }
}

/**
 * Play a loud, distinct incoming call ringtone (VoIP chime loop)
 */
export function startIncomingRingtone() {
  if (isRinging) return;
  isRinging = true;

  // Immediate first pulse pair (Double chime: high-low beep)
  const triggerBeeps = () => {
    // Beep 1
    playTonePulse(523.25, 659.25, 0.25, 0.4); // C5 + E5
    // Beep 2 shortly after
    setTimeout(() => {
      if (isRinging) {
        playTonePulse(659.25, 783.99, 0.35, 0.45); // E5 + G5
      }
    }, 280);
  };

  triggerBeeps();
  // Repeat every 1.8 seconds while incoming call popup is active
  activeInterval = setInterval(triggerBeeps, 1800);
}

/**
 * Stop incoming call ringtone instantly
 */
export function stopIncomingRingtone() {
  isRinging = false;
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
}

/**
 * Play outgoing dialing tone (caller side)
 */
let isDialing = false;
let dialingInterval: ReturnType<typeof setInterval> | null = null;

export function startOutgoingRingtone() {
  if (isDialing) return;
  isDialing = true;

  const triggerDialTone = () => {
    // Gentle UK/US standard dial pulse (440Hz + 480Hz)
    playTonePulse(440, 480, 1.2, 0.15);
  };

  triggerDialTone();
  dialingInterval = setInterval(triggerDialTone, 3000);
}

export function stopOutgoingRingtone() {
  isDialing = false;
  if (dialingInterval) {
    clearInterval(dialingInterval);
    dialingInterval = null;
  }
}
