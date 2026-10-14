// tempo + energy profile of a music file
import { execFileSync } from "node:child_process";
const SR = 22050;
const buf = execFileSync("ffmpeg", ["-v", "error", "-i", process.argv[2], "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
const x = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const hop = 512, win = 1024, n = Math.floor((x.length - win) / hop);
// energy per hop (low-passed for kick-ish onsets) and full-band
const e = new Float32Array(n), lowE = new Float32Array(n);
let lp = 0; const a = 1 - Math.exp(-2 * Math.PI * 150 / SR);
const low = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { lp += a * (x[i] - lp); low[i] = lp; }
for (let f = 0; f < n; f++) { let s = 0, sl = 0; for (let k = 0; k < win; k++) { const v = x[f * hop + k]; s += v * v; sl += low[f * hop + k] ** 2; } e[f] = Math.sqrt(s / win); lowE[f] = Math.sqrt(sl / win); }
const flux = new Float32Array(n); for (let f = 1; f < n; f++) flux[f] = Math.max(0, e[f] - e[f - 1]) + 2 * Math.max(0, lowE[f] - lowE[f - 1]);
// tempo by autocorrelation of flux, 70–160 bpm
const fps = SR / hop; let best = 0, bestLag = 0;
for (let bpm = 70; bpm <= 160; bpm += 0.25) { const lag = fps * 60 / bpm; let s = 0; for (let f = 0; f + lag * 4 < n; f++) { const l = Math.round(lag); s += flux[f] * (flux[f + l] + 0.5 * flux[f + 2 * l]); } if (s > best) { best = s; bestLag = lag; } }
const bpm = 60 * fps / bestLag;
// phase: offset maximizing flux on the grid
let bp = 0, bph = 0; for (let ph = 0; ph < bestLag; ph += 0.25) { let s = 0; for (let t = ph; t < n; t += bestLag) s += flux[Math.round(t)] || 0; if (s > bp) { bp = s; bph = ph; } }
console.log("bpm", bpm.toFixed(2), "first beat", (bph / fps).toFixed(3), "s, beat", (60 / bpm).toFixed(4), "s");
// loudness per 4s
const out = []; for (let t = 0; t < x.length / SR; t += 4) { const s0 = Math.floor(t * fps), s1 = Math.min(n, Math.floor((t + 4) * fps)); let q = 0, ql = 0; for (let f = s0; f < s1; f++) { q += e[f] ** 2; ql += lowE[f] ** 2; } out.push(`${t}s:${(10 * Math.log10(q / (s1 - s0))).toFixed(0)}/${(10 * Math.log10(ql / (s1 - s0))).toFixed(0)}`); }
console.log(out.join("  "));
