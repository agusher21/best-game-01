// Tiny WebAudio synth: every sound is an oscillator or two, made on the
// spot, so the game ships no audio files and makes no network request.
// Everything is guarded: in a headless run (or a muted browser) the calls
// simply do nothing instead of throwing.
export function createAudio() {
  let ctx = null;
  let master = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.16;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, when, dur, type, vol, slideTo) {
    if (!ensure()) return;
    try {
      const t0 = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      // Sound is garnish: never let it break the game.
    }
  }

  return {
    // Call from the first real gesture so the context is allowed to start.
    unlock() {
      if (ensure() && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    click() {
      tone(660, 0, 0.07, 'triangle', 0.5);
    },
    collect(combo) {
      const base = 520 + Math.min(combo, 20) * 18;
      tone(base, 0, 0.12, 'sine', 0.7);
      tone(base * 1.5, 0.07, 0.16, 'sine', 0.6);
    },
    star() {
      tone(784, 0, 0.1, 'sine', 0.6);
      tone(988, 0.08, 0.1, 'sine', 0.6);
      tone(1319, 0.16, 0.22, 'sine', 0.6);
    },
    hit() {
      tone(160, 0, 0.35, 'sawtooth', 0.7, 55);
      tone(90, 0, 0.3, 'sine', 0.8, 40);
    },
    level() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.18, 'triangle', 0.6));
    },
    win() {
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.6));
    },
  };
}
