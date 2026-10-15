// Tiny synthesized sound kit (no audio files): soft marimba notes + watercolor swish.
let ctx = null;
let master = null;
let enabled = true;

const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const hz = (semi, base = 523.25) => base * 2 ** (semi / 12);

function ensure() {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setEnabled(v) { enabled = v; }
export function unlock() { ensure(); }

function note(freq, t0 = 0, dur = 0.5, vol = 0.25, type = 'sine') {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + t0;
  const o = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  const g2 = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o2.type = 'sine';
  o2.frequency.value = freq * 4; // marimba-ish overtone
  g2.gain.value = 0.12;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  o2.connect(g2).connect(g);
  g.connect(master);
  o.start(t); o2.start(t);
  o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}

function noise(t0, dur, from, to, vol = 0.12) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + t0;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

export const sfx = {
  tap() { note(hz(12), 0, 0.12, 0.08); },
  key() { note(hz(7 + Math.floor(Math.random() * 3) * 2), 0, 0.1, 0.06); },
  correct(streak = 0) {
    const s = Math.min(streak, 6);
    note(hz(PENTA[s]), 0, 0.35, 0.22);
    note(hz(PENTA[s + 2]), 0.09, 0.45, 0.22);
    if (streak >= 2) note(hz(PENTA[s + 4]), 0.18, 0.6, 0.18);
  },
  wrong() { note(hz(-5), 0, 0.3, 0.16, 'triangle'); note(hz(-8), 0.12, 0.4, 0.14, 'triangle'); },
  drop() { note(hz(19), 0, 0.25, 0.12); note(hz(24), 0.05, 0.3, 0.08); },
  paint() {
    noise(0, 0.55, 600, 3000, 0.1);
    note(hz(PENTA[Math.floor(Math.random() * 5) + 3]), 0.15, 0.8, 0.12);
  },
  tint() { note(hz(16), 0, 0.2, 0.1); note(hz(21), 0.06, 0.25, 0.08); },
  nope() { note(hz(-12), 0, 0.2, 0.1, 'triangle'); },
  fanfare() {
    [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => note(hz(s), i * 0.09, 0.7, 0.18));
    noise(0.5, 1.2, 2000, 8000, 0.05);
  },
  levelUp() { [0, 7, 12, 19].forEach((s, i) => note(hz(s), i * 0.08, 0.5, 0.18)); },
};

export function buzz(ms = 12) {
  try { if (enabled) navigator.vibrate?.(ms); } catch { /* ignore */ }
}
