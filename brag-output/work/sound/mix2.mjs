// Voiceover + a music bed, ducked under the voice. No sound effects.
// The song is shorter than the video, so at a bar line under the voice it crossfades back a few bars; from there it
// plays straight through, and its own ending lands on the end card. Defaults are for "Sunny Day Promise"
// (132.75 bpm, first beat 0.064s, 120s): back 7 bars at bar 17 (~30.8s), so its final hit lands ~130s.
// "Bright and Bouncy": BEAT=0.8276 FIRST=0.528 SPLICE_BAR=12 BACK_BARS=4.
// Run: node mix2.mjs <vo-intro.mp3> <vo-built.mp3> <music> <out.wav>   (env: DUR, VO1_AT, VO2_AT, MUSIC_GAIN, BEAT, FIRST, SPLICE_BAR, BACK_BARS)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [, , VO1, VO2, MUSIC, OUT] = process.argv;
const SR = 48000, DUR = +(process.env.DUR ?? 132.62), N = Math.round(SR * DUR);
const VO1_AT = +(process.env.VO1_AT ?? 0.6), VO2_AT = +(process.env.VO2_AT ?? 67.0);
const BEAT = +(process.env.BEAT ?? 60 / 132.75), FIRST = +(process.env.FIRST ?? 0.064), BAR = 4 * BEAT; // from analyze.mjs
const SPLICE = FIRST + +(process.env.SPLICE_BAR ?? 17) * BAR; // a bar line under the voice
const BACK_GUESS = +(process.env.BACK_BARS ?? 7) * BAR; // jump back this many bars: the song gets that much longer
const XF = BEAT; // one-beat equal-power crossfade
const BASE = +(process.env.MUSIC_GAIN ?? 0.3), DUCK_DEPTH = 0.72; // bed level in the gaps; extra cut under the voice (~-11 dB)
const idx = (t) => Math.round(t * SR);

function decode(file, ch) {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", String(ch), "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 29 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}
const m = decode(MUSIC, 2), mLen = m.length / 2;
const mono = (i) => (i >= 0 && i < mLen ? (m[2 * i] + m[2 * i + 1]) / 2 : 0);

// refine the jump: cross-correlate onset envelopes around the splice (±0.12s)
function onsetEnv(t0, len) {
  const hop = 256, n = Math.floor((len * SR) / hop), e = new Float32Array(n);
  let prev = 0;
  for (let f = 0; f < n; f++) { let s = 0; for (let k = 0; k < hop; k++) { const v = mono(idx(t0) + f * hop + k); s += v * v; } const r = Math.sqrt(s / hop); e[f] = Math.max(0, r - prev); prev = r; }
  return e;
}
const ref = onsetEnv(SPLICE - 6, 12);
let best = -1, BACK = BACK_GUESS;
for (let d = -0.12; d <= 0.12; d += 256 / SR) {
  const cand = onsetEnv(SPLICE - BACK_GUESS + d - 6, 12);
  let s = 0; for (let i = 0; i < ref.length; i++) s += ref[i] * cand[i];
  if (s > best) { best = s; BACK = BACK_GUESS + d; }
}
console.log("splice", SPLICE.toFixed(3), "back", BACK.toFixed(3), "(guess", BACK_GUESS.toFixed(3) + ") → song ends at", (mLen / SR + BACK).toFixed(2));

// music bed laid out on the video timeline: the song, then after the splice the song BACK seconds earlier
const bedL = new Float32Array(N), bedR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR, u = (t - (SPLICE - XF / 2)) / XF;
  const w2 = u <= 0 ? 0 : u >= 1 ? 1 : Math.sin((u * Math.PI) / 2), w1 = u <= 0 ? 1 : u >= 1 ? 0 : Math.cos((u * Math.PI) / 2);
  let l = 0, r = 0;
  if (w1 > 0 && i < mLen) { l += m[2 * i] * w1; r += m[2 * i + 1] * w1; }
  if (w2 > 0) { const j = idx(t - BACK); if (j >= 0 && j < mLen) { l += m[2 * j] * w2; r += m[2 * j + 1] * w2; } }
  bedL[i] = l; bedR[i] = r;
}

// voiceover
const vo = new Float32Array(N);
for (const [f, at] of [[VO1, VO1_AT], [VO2, VO2_AT]]) { const d = decode(f, 1), s = idx(at); for (let i = 0; i < d.length && s + i < N; i++) vo[s + i] += d[i]; }

// duck: envelope follower on the voice with 80ms look-ahead, slow release so the bed doesn't pump between words
const duck = new Float32Array(N);
{
  let env = 0; const la = idx(0.08), atk = Math.exp(-1 / (SR * 0.03)), rel = Math.exp(-1 / (SR * 0.6));
  for (let i = 0; i < N; i++) { const x = Math.abs(vo[Math.min(N - 1, i + la)]); env = x > env ? atk * env + (1 - atk) * x : rel * env + (1 - rel) * x; duck[i] = 1 - DUCK_DEPTH * Math.min(1, env / 0.05); }
}

const L = new Float32Array(N), R = new Float32Array(N);
const fadeIn = idx(0.3), fadeOut = idx(DUR - 0.5);
for (let i = 0; i < N; i++) {
  const g = BASE * duck[i] * Math.min(1, i / fadeIn) * (i > fadeOut ? Math.max(0, 1 - (i - fadeOut) / (N - fadeOut)) : 1);
  L[i] = vo[i] + bedL[i] * g; R[i] = vo[i] + bedR[i] * g;
}

const rms = (a, s, e) => { let q = 0; for (let i = s; i < e; i++) q += a[i] * a[i]; return 20 * Math.log10(Math.sqrt(q / (e - s)) + 1e-12); };
const bedOnly = new Float32Array(N); for (let i = 0; i < N; i++) bedOnly[i] = L[i] - vo[i];
console.log("voice 33-35s", rms(vo, idx(33), idx(35)).toFixed(1), "| bed under voice", rms(bedOnly, idx(33), idx(35)).toFixed(1), "| bed in the 64-66s gap", rms(bedOnly, idx(64), idx(66)).toFixed(1));

const data = Buffer.alloc(N * 8);
for (let i = 0; i < N; i++) { data.writeFloatLE(L[i], i * 8); data.writeFloatLE(R[i], i * 8 + 4); }
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
writeFileSync(OUT, Buffer.concat([h, data]));
console.log("wrote", OUT);
