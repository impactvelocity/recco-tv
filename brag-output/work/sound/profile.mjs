import { execFileSync } from "node:child_process";
const SR = 22050, [, , file, from, to, step] = process.argv;
const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
const x = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const out = []; for (let t = +from; t < +to; t += +step) { let q = 0; const s = Math.floor(t * SR), e = Math.min(x.length, Math.floor((t + +step) * SR)); for (let i = s; i < e; i++) q += x[i] * x[i]; out.push(`${t.toFixed(1)}:${(10 * Math.log10(q / Math.max(1, e - s))).toFixed(0)}`); }
console.log(out.join(" "));
