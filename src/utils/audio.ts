// Audio synthesizer utilities using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Pleasant dual-tone major third chime (C5 & E5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now);
    osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  } catch {
    // Graceful fallback if audio is disabled by browser policies
  }
}

export function playTimerCompleteChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  } catch {
    // Ignore
  }
}

// Ambient Noise Generator (Soft gentle rain / pink noise generator)
let ambientNode: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function toggleAmbientSound(enable: boolean, volume = 0.04): boolean {
  try {
    const ctx = getAudioContext();

    if (!enable) {
      if (ambientGain) {
        ambientGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        setTimeout(() => {
          if (ambientNode) {
            ambientNode.disconnect();
            ambientNode = null;
          }
        }, 500);
      }
      return false;
    }

    // Generate gentle brown/pink noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like soft rainfall / gentle wind
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(0);

    ambientNode = whiteNoise;
    ambientGain = gain;
    return true;
  } catch {
    return false;
  }
}
