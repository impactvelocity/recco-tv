// Recco soundtrack: music + SFX in D major, ducked under the voiceover, mixed to one file.
// Run: node synth.mjs <vo-intro.mp3> <vo-built.mp3> <out.wav>
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [, , VO1, VO2, OUT] = process.argv;
const SR = 44100, DUR = 103.5, N = Math.round(SR * DUR);
const VO1_AT = 0.6, VO2_AT = 50.0;
const BAR = (60 / 72) * 4, BEAT = BAR / 4;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const idx = (t) => Math.round(t * SR);

// ------------------------------------------------------------ buses
const mk = () => [new Float32Array(N), new Float32Array(N)];
const ep = mk(), pad = mk(), bass = mk(), perc = mk(), sfx = mk();
const add = (bus, i, l, r) => { if (i >= 0 && i < N) { bus[0][i] += l; bus[1][i] += r; } };

// seeded noise
let seed = 1234567;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };

// ------------------------------------------------------------ voices
function epNote(m, t, vel, len = 3.2) {
  const f = hz(m), s = idx(t), n = idx(len + 1.2), pan = 0.5 + 0.25 * Math.sin(m * 1.7);
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    const env = Math.min(1, x / 0.006) * Math.exp(-x / 1.6) * (x > len ? Math.exp(-(x - len) / 0.25) : 1);
    const trem = 1 + 0.12 * Math.sin(2 * Math.PI * 4.2 * (t + x));
    const v = (Math.sin(2 * Math.PI * f * x) + 0.28 * Math.sin(2 * Math.PI * 2 * f * x) * Math.exp(-x / 0.4) + 0.08 * Math.sin(2 * Math.PI * 3 * f * x) * Math.exp(-x / 0.15)) * env * vel * trem;
    add(ep, s + k, v * (1 - pan), v * pan);
  }
}
function padChord(ms, t0, t1, vel) {
  const s = idx(t0), e = idx(t1 + 1.6);
  for (const m of ms) {
    const f = hz(m);
    for (let i = s; i < e && i < N; i++) {
      const x = (i - s) / SR, len = t1 - t0;
      const env = Math.min(1, x / 1.2) * (x > len ? Math.exp(-(x - len) / 0.5) : 1);
      const ph = 2 * Math.PI * f * (i / SR);
      const l = (Math.sin(ph * 0.998) + 0.5 * Math.sin(ph * 2.003)) * env * vel;
      const r = (Math.sin(ph * 1.002) + 0.5 * Math.sin(ph * 1.997)) * env * vel;
      add(pad, i, l, r);
    }
  }
}
function bassNote(m, t, vel, len) {
  const f = hz(m), s = idx(t), n = idx(len + 0.3);
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    const env = Math.min(1, x / 0.02) * Math.exp(-x / 2.2) * (x > len ? Math.exp(-(x - len) / 0.08) : 1);
    const v = (Math.sin(2 * Math.PI * f * x) + 0.15 * Math.sin(4 * Math.PI * f * x)) * env * vel;
    add(bass, s + k, v, v);
  }
}
function kick(t, vel) {
  const s = idx(t), n = idx(0.35);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const x = k / SR, f = 50 + 70 * Math.exp(-x / 0.03);
    ph += 2 * Math.PI * f / SR;
    const v = Math.sin(ph) * Math.exp(-x / 0.12) * vel;
    add(perc, s + k, v, v);
  }
}
function shaker(t, vel) {
  const s = idx(t), n = idx(0.09);
  let hp = 0, prev = 0;
  for (let k = 0; k < n; k++) {
    const x = k / SR, w = rnd();
    hp = 0.85 * (hp + w - prev); prev = w;
    const v = hp * Math.min(1, x / 0.004) * Math.exp(-x / 0.025) * vel;
    add(perc, s + k, v * 0.8, v);
  }
}
function pluck(m, t, vel, tau = 0.45, pan = 0.5) {
  const f = hz(m), s = idx(t), n = idx(tau * 5);
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    const v = (Math.sin(2 * Math.PI * f * x) + 0.25 * Math.sin(2 * Math.PI * 4 * f * x) * Math.exp(-x / 0.05)) * Math.min(1, x / 0.003) * Math.exp(-x / tau) * vel;
    add(sfx, s + k, v * (1 - pan) * 2 * 0.5 + v * 0.25, v * pan * 2 * 0.5 + v * 0.25);
  }
}
function bell(m, t, vel) {
  const f = hz(m), s = idx(t), n = idx(4);
  const parts = [[1, 1, 2.6], [2.0, 0.45, 1.6], [2.76, 0.3, 1.0], [5.4, 0.12, 0.5]];
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    let v = 0;
    for (const [r, a, d] of parts) v += a * Math.sin(2 * Math.PI * f * r * x) * Math.exp(-x / d);
    v *= Math.min(1, x / 0.002) * vel;
    add(sfx, s + k, v, v);
  }
}
function swoosh(t, vel, dur = 0.4) {
  const s = idx(t), n = idx(dur);
  let lp = 0, bp = 0, l2 = 0, l3 = 0;
  const a2 = 1 - Math.exp(-2 * Math.PI * 3000 / SR);
  for (let k = 0; k < n; k++) {
    const x = k / n, fc = 500 + 1800 * x, a = 1 - Math.exp(-2 * Math.PI * fc / SR);
    const w = rnd(); lp += a * (w - lp); bp += a * (lp - bp);
    l2 += a2 * ((lp - bp) - l2); l3 += a2 * (l2 - l3);
    const v = l3 * 2.5 * Math.sin(Math.PI * x) ** 2 * vel;
    add(sfx, s + k, v * (1 - x * 0.6), v * (0.4 + x * 0.6));
  }
}
function tick(t, vel) {
  const s = idx(t), n = idx(0.05);
  for (let k = 0; k < n; k++) { const x = k / SR; const v = Math.sin(2 * Math.PI * hz(86) * x) * Math.exp(-x / 0.012) * vel; add(sfx, s + k, v, v); }
}
function thud(t, vel) {
  const s = idx(t), n = idx(0.3); let ph = 0;
  for (let k = 0; k < n; k++) { const x = k / SR; ph += 2 * Math.PI * (70 + 60 * Math.exp(-x / 0.05)) / SR; const v = Math.sin(ph) * Math.exp(-x / 0.08) * vel; add(sfx, s + k, v, v); }
}

// ------------------------------------------------------------ arrangement
const P1 = [ // [epVoicing, bass]
  [[50, 57, 61, 64, 66], 38], // Dmaj9
  [[47, 54, 57, 61, 62], 35], // Bm9
  [[43, 50, 54, 59, 62], 31], // Gmaj7
  [[45, 52, 55, 62, 64], 33], // A7sus
];
const P2 = [
  [[55, 62, 66, 69, 71], 31], // Gmaj9 (up)
  [[57, 64, 69, 71, 73], 33], // Aadd9
  [[54, 61, 66, 69, 73], 30], // F#m7
  [[59, 66, 69, 73, 74], 35], // Bm7
];
const roll = (ms, t, vel) => ms.forEach((m, i) => epNote(m, t + i * 0.035, vel * (i === 0 ? 0.8 : 1)));

// Part one: warm intro, thin during the scroll, full again from the reveal
for (let b = 0; b * BAR < 47.6; b++) {
  const t = b * BAR, [ch, bn] = P1[b % 4];
  const scroll = t >= 7.4 && t < 21.0;
  padChord(ch.map((m) => m - 12).slice(1), t, t + BAR, scroll ? 0.05 : 0.035);
  if (!scroll) {
    roll(ch, t, 0.11);
    epNote(ch[ch.length - 1] + 12, t + BEAT * 2.5, 0.05, 1.2);
    bassNote(bn, t, 0.22, BAR * 0.9);
  }
}
// the reveal lands on Dmaj9 with a bell
roll(P1[0][0], 21.62, 0.13); bassNote(38, 21.62, 0.24, 2.4); bell(74, 21.62, 0.16); bell(81, 21.66, 0.08);
// tagline: hold Dmaj9 to the end of part one
roll(P1[0][0], 44.45, 0.12); bassNote(38, 44.45, 0.22, 3.0); bell(78, 44.45, 0.1);

// Part two: brighter, light pulse while the build is explained
const P2_AT = 47.9;
for (let b = 0; P2_AT + b * BAR < 99.1; b++) {
  const t = P2_AT + b * BAR, [ch, bn] = P2[b % 4];
  padChord(ch.map((m) => m - 12).slice(1), t, t + BAR, 0.03);
  roll(ch, t, 0.085);
  bassNote(bn, t, 0.2, BAR * 0.45); bassNote(bn, t + BEAT * 2, 0.16, BAR * 0.4);
  if (t >= 50.0) {
    kick(t, 0.32); kick(t + BEAT * 2, 0.26);
    for (let e = 0; e < 8; e++) shaker(t + e * BEAT / 2, e % 2 ? 0.05 : 0.03);
    for (let e = 0; e < 8; e++) pluck(ch[(e * 2) % ch.length] + 12, t + e * BEAT / 2, 0.018, 0.25, e % 2 ? 0.7 : 0.3);
  }
}
// ending: resolve on Dmaj9
roll([50, 57, 61, 64, 66, 69], 99.15, 0.12); bassNote(38, 99.15, 0.22, 4); padChord([45, 50, 54, 57], 99.15, 103.0, 0.035);
bell(74, 101.4, 0.13); bell(78, 101.45, 0.06);

// ------------------------------------------------------------ SFX (same key, soft)
const send = (t) => { swoosh(t - 0.05, 0.06); pluck(78, t + 0.05, 0.05, 0.3); };
const pending = (t) => { tick(t, 0.05); pluck(69, t, 0.035, 0.25); };
const ready = (t) => { pluck(81, t, 0.06, 0.5, 0.4); pluck(86, t + 0.09, 0.05, 0.6, 0.6); };
const connected = (t) => [74, 78, 81].forEach((m, i) => pluck(m, t + i * 0.08, 0.06, 0.6));
for (let t = 7.9; t < 14.6; t += 0.5) tick(t, 0.025 + 0.015 * ((t - 7.9) / 6.7));
send(25.9); connected(26.2);
send(28.05); pending(28.3); ready(29.55);
send(31.7); pending(31.95); ready(32.75);
send(34.75); send(35.35); pending(35.1); ready(35.65);
[0, 1, 2].forEach((i) => pluck([74, 78, 81][i], 36.25 + i * 0.06, 0.035, 0.4));
swoosh(39.6, 0.07, 0.5); pluck(81, 40.45, 0.045, 0.5); pluck(76, 40.55, 0.04, 0.6);
bell(74, 50.05, 0.06);
send(58.85); connected(59.75);
[[60.85, 74], [61.45, 76], [62.55, 78], [64.85, 81], [67.64, 83]].forEach(([t, m]) => pluck(m, t, 0.04, 0.35));
pluck(86, 63.7, 0.035, 0.3);
[[82.2, 81], [82.45, 83], [82.7, 86]].forEach(([t, m]) => pluck(m, t, 0.04, 0.35)); thud(83.7, 0.12);
[[94.65, 86], [95.45, 88], [96.15, 90], [96.8, 93], [97.75, 98]].forEach(([t, m]) => [0, 1, 2].forEach((i) => pluck(m - 12 + [0, 7, 12][i], t + i * 0.04, 0.022, 0.6)));
pluck(81, 99.64, 0.04, 0.5); pluck(76, 99.74, 0.035, 0.6);

// ------------------------------------------------------------ processing
// pad lowpass: dark during the scroll
const padCut = (t) => (t >= 7.6 && t < 21.4 ? 380 : 1600);
for (const ch of pad) { let y = 0; for (let i = 0; i < N; i++) { const a = 1 - Math.exp(-2 * Math.PI * padCut(i / SR) / SR); y += a * (ch[i] - y); ch[i] = y; } }

// Schroeder reverb on EP + SFX
function reverb(inL, inR, wet) {
  const outL = new Float32Array(N), outR = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422, 1277, 1356], aps = [225, 556];
  for (const [src, dst, off] of [[inL, outL, 0], [inR, outR, 23]]) {
    const acc = new Float32Array(N);
    for (const d0 of combs) {
      const d = d0 + off, buf = new Float32Array(d); let p = 0, lp = 0;
      for (let i = 0; i < N; i++) { const o = buf[p]; lp = o * 0.6 + lp * 0.4; buf[p] = src[i] + lp * 0.82; acc[i] += o; p = (p + 1) % d; }
    }
    let x = acc;
    for (const d0 of aps) {
      const d = d0 + off, buf = new Float32Array(d), y = new Float32Array(N); let p = 0;
      for (let i = 0; i < N; i++) { const b = buf[p]; y[i] = -x[i] + b; buf[p] = x[i] + b * 0.5; p = (p + 1) % d; }
      x = y;
    }
    for (let i = 0; i < N; i++) dst[i] = x[i] * wet / combs.length;
  }
  return [outL, outR];
}
const send2 = mk();
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) send2[c][i] = ep[c][i] + sfx[c][i] * 1.2 + pad[c][i] * 0.5;
const [rvL, rvR] = reverb(send2[0], send2[1], 0.9);

// voiceover
function decode(file) {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}
const vo = new Float32Array(N);
for (const [f, at] of [[VO1, VO1_AT], [VO2, VO2_AT]]) { const d = decode(f), s = idx(at); for (let i = 0; i < d.length && s + i < N; i++) vo[s + i] += d[i]; }

// duck: envelope follower on the voice, look-ahead 60ms
const duck = new Float32Array(N);
{
  let env = 0; const la = idx(0.06), atk = Math.exp(-1 / (SR * 0.015)), rel = Math.exp(-1 / (SR * 0.35));
  for (let i = 0; i < N; i++) { const x = Math.abs(vo[Math.min(N - 1, i + la)]); env = x > env ? atk * env + (1 - atk) * x : rel * env + (1 - rel) * x; duck[i] = 1 - 0.74 * Math.min(1, env / 0.06); }
}

// mix
const MUSIC = 0.5, SFX_DUCK = 0.5;
const L = new Float32Array(N), R = new Float32Array(N);
let fadeIn = idx(0.5), fadeOut = idx(DUR - 2.0);
for (let i = 0; i < N; i++) {
  const g = Math.min(1, i / fadeIn) * (i > fadeOut ? Math.max(0, 1 - (i - fadeOut) / (N - fadeOut)) : 1);
  const d = duck[i], ds = 1 - (1 - d) * SFX_DUCK;
  const mL = (ep[0][i] + pad[0][i] + bass[0][i] + perc[0][i] + rvL[i]) * d + sfx[0][i] * ds;
  const mR = (ep[1][i] + pad[1][i] + bass[1][i] + perc[1][i] + rvR[i]) * d + sfx[1][i] * ds;
  L[i] = vo[i] + mL * MUSIC * g;
  R[i] = vo[i] + mR * MUSIC * g;
}

// stats: music vs voice
const rms = (a, s, e) => { let q = 0; for (let i = s; i < e; i++) q += a[i] * a[i]; return Math.sqrt(q / (e - s)); };
const db = (x) => (20 * Math.log10(x + 1e-12)).toFixed(1);
const musicOnly = new Float32Array(N); for (let i = 0; i < N; i++) musicOnly[i] = L[i] - vo[i];
console.log("voice 28-30s", db(rms(vo, idx(28), idx(30))), "music under it", db(rms(musicOnly, idx(28), idx(30))));
console.log("music alone 0.1-0.55s", db(rms(musicOnly, idx(0.1), idx(0.55))), "intro gap 47.9-50", db(rms(musicOnly, idx(48), idx(50))));
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
console.log("peak", db(peak));

// write float WAV, stereo
const data = Buffer.alloc(N * 8);
for (let i = 0; i < N; i++) { data.writeFloatLE(L[i], i * 8); data.writeFloatLE(R[i], i * 8 + 4); }
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
writeFileSync(OUT, Buffer.concat([h, data]));
console.log("wrote", OUT);
