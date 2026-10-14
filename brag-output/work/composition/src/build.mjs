// Generates index.html for the Recco demo video.
// Run: node src/build.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// Cue times below are authored on the old clock (voiceover at 1.25x: story VO at 0.6s, build VO at 50s).
// T0() maps them onto the first 1.0x voiceover; WARP() then retimes that onto the current voiceover: the new part-one
// VO (vo-intro-v2.mp3, at 0.6s), and part two 5.9s later than before. Anchors pair a word in the old VO with the same
// moment in the new one. T = WARP∘T0 places every cue; R(seconds) is its inverse, for cues written in real seconds.
const T0 = (t) => (t <= 0.6 ? t : 0.6 + (t - 0.6) * 1.25);
const T0i = (y) => (y <= 0.6 ? y : 0.6 + (y - 0.6) / 1.25);
const WA = [[0, 0], [25.9, 23.25], [26.12, 23.45], [28.93, 29.34], [31.59, 31.25], [33.75, 33.74], [38.28, 37.48], [40.6, 39.88], [42.6, 42.2], [45.39, 44.44], [46.6, 45.65], [60.4, 66.3]];
const lerpMap = (pts, x) => { if (x <= pts[0][0]) return pts[0][1] + (x - pts[0][0]); for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); } const [xn, yn] = pts[pts.length - 1]; return yn + (x - xn); };
const WARP = (x) => lerpMap(WA, x);
const T = (t) => WARP(T0(t));
const R = (y) => +T0i(lerpMap(WA.map(([a, b]) => [b, a]), y)).toFixed(4);
const DURATION = +T(101.5).toFixed(2);
const VO_INTRO = 0.6; // old-clock start of the story VO
const VO2_AT = 49.0; // old-clock start of the build VO (real clock: T(49) = 61.1s)
const V = (x) => +(VO2_AT + x).toFixed(3); // x = a word's time in the 1.25x transcript
const VO_BUILT = VO2_AT;

// ---------------------------------------------------------------- themes (from Recco TV v3.dc.html)
const THEMES = {
  fallDay: { label: "Fall · Day", focus: "#F0B667", segOn: "#F0B667", segOnFg: "#2A1A10", segOff: "rgba(255,247,232,.8)", canvas: "#555740", s: "41,54,45", border: "rgba(255,247,232,.22)", accent: "#D3632D", accent2: "#F0B667", onAccent: "#2A1A10", text: "#FFF7E8", text2: "#D5CFB9", tint: "linear-gradient(135deg,rgba(211,99,45,.42),rgba(240,182,103,.22))" },
  fallNight: { label: "Fall · Night", focus: "#E28A3B", segOn: "#E28A3B", segOnFg: "#1D1410", segOff: "rgba(255,246,232,.8)", canvas: "#1D2929", s: "18,28,30", border: "rgba(255,246,232,.2)", accent: "#C8572F", accent2: "#E28A3B", onAccent: "#1D1410", text: "#FFF6E8", text2: "#C4CAC0", tint: "linear-gradient(135deg,rgba(200,87,47,.42),rgba(226,138,59,.22))" },
  summerDay: { label: "Summer · Day", focus: "#F2D34F", segOn: "#D7683D", segOnFg: "#FFFDF7", segOff: "rgba(255,253,247,.85)", canvas: "#5EA7B6", s: "25,76,86", border: "rgba(255,253,247,.25)", accent: "#D7683D", accent2: "#F2D34F", onAccent: "#194C56", text: "#FFFDF7", text2: "#D5ECEA", tint: "linear-gradient(135deg,rgba(215,104,61,.5),rgba(231,211,174,.25))" },
  summerNight: { label: "Summer · Night", focus: "#F0A64B", segOn: "#83BCD4", segOnFg: "#0B2938", segOff: "rgba(248,252,252,.85)", canvas: "#174D68", s: "11,41,56", border: "rgba(131,188,212,.28)", accent: "#83BCD4", accent2: "#F0A64B", onAccent: "#0B2938", text: "#F8FCFC", text2: "#BDD9DF", tint: "linear-gradient(135deg,rgba(131,188,212,.4),rgba(31,91,114,.35))" },
  winterDay: { label: "Winter · Day", focus: "#8CC8D8", segOn: "#8CC8D8", segOnFg: "#263642", segOff: "rgba(255,253,248,.85)", canvas: "#71889B", s: "38,54,66", border: "rgba(244,246,243,.25)", accent: "#516B7B", accent2: "#8CC8D8", onAccent: "#263642", text: "#FFFDF8", text2: "#D9E1E4", tint: "linear-gradient(135deg,rgba(94,117,108,.55),rgba(175,200,216,.3))" },
  winterNight: { label: "Winter · Night", focus: "#8FBDE8", segOn: "#8FBDE8", segOnFg: "#10233A", segOff: "rgba(248,251,253,.8)", canvas: "#152A43", s: "13,28,43", border: "rgba(175,201,232,.25)", accent: "#789ECC", accent2: "#8FBDE8", onAccent: "#10233A", text: "#F8FBFD", text2: "#BBCAD6", tint: "linear-gradient(135deg,rgba(120,158,204,.4),rgba(175,201,232,.2))" },
};
const themeVars = (k) => {
  const t = THEMES[k];
  return `--canvas:${t.canvas};--surface:rgba(${t.s},.8);--surfaceSolid:rgba(${t.s},.72);--surface2:rgba(${t.s},.96);--surface2solid:rgb(${t.s});--border:${t.border};--accent:${t.accent};--accent2:${t.accent2};--onAccent:${t.onAccent};--text:${t.text};--textB:${t.text};--text2:${t.text2};--textBubble:${t.text};--tint:${t.tint};--focus:${t.focus};--segOn:${t.segOn};--segOnFg:${t.segOnFg};--segOff:${t.segOff}`;
};

// ---------------------------------------------------------------- data
const P = (slug) => `assets/posters/${slug}.jpg`;
const RECS = {
  koq: { title: "Two-Car Garage", type: "Series", year: "1998–2007", imdb: "7.4", rt: "65%", runtime: "22 min", genre: "Sitcom", poster: "two-car-garage", from: "Jill", msg: "Jill says it’s hilarious", time: "now", synopsis: "A delivery driver and his wife share their house, and the garage TV, with her stubborn father." },
  slow: { title: "Desk Nine", type: "Series", year: "2022–", imdb: "8.2", rt: "98%", poster: "desk-nine", from: "Dad", msg: "Dad says it’s brilliant", time: "1m ago" },
  bear: { title: "Back of House", type: "Series", year: "2022–", imdb: "8.5", rt: "99%", poster: "back-of-house", from: "Sarah", also: ["D"], fromLabel: "Sarah & Dad", msg: "you HAVE to watch Back of House, the one-take kitchen episode is insane", time: "5h ago" },
  sev: { title: "Floor Thirteen", type: "Series", year: "2022–", imdb: "8.7", rt: "97%", poster: "floor-thirteen", from: "Mom", also: ["S"], fromLabel: "Mom & Sarah", msg: "Floor Thirteen!! your dad and I are hooked", time: "Tue" },
  past: { title: "Second Summer", type: "Film", year: "2023", imdb: "7.8", rt: "95%", poster: "second-summer", from: "Sam", msg: "Best films of 2023 you probably missed", time: "Sun" },
  shrink: { title: "Snowbound", type: "Film", year: "1980", imdb: "8.4", rt: "83%", poster: "snowbound", from: "Mom", msg: "too scary for your dad, perfect for you", time: "Tue" },
  dune: { title: "Sandfall: Part Two", type: "Film", year: "2024", imdb: "8.5", rt: "92%", poster: "sandfall-part-two", from: "Me", msg: "note to self: watch before Part Three comes out", time: "Mon" },
  knives: { title: "The Will Reading", type: "Film", year: "2019", imdb: "7.9", rt: "97%", runtime: "2h 10m", genre: "Mystery", poster: "will-reading", from: "You", fromLabel: "Recco’s picks", msg: "you asked for top films for a stormy night", time: "8:52 PM", synopsis: "A detective untangles a family’s inheritance, one lying relative at a time." },
  lasso: { title: "Away Game", type: "Series", year: "2020–", imdb: "8.7", rt: "", poster: "away-game", from: "Sam", msg: "the feel-good one. just trust me", time: "Sat" },
  fog: { title: "The Fog House", type: "Film", year: "2001", imdb: "7.6", rt: "84%", poster: "fog-house", from: "You", msg: "a link: 10 mysteries to watch this weekend", time: "now" },
  will: { title: "The Will Reading", type: "Film", year: "2019", imdb: "7.9", rt: "97%", runtime: "2h 10m", genre: "Mystery", poster: "will-reading", from: "Megan", msg: "Megan says it’s so good", time: "now", synopsis: "A detective untangles a family’s inheritance, one lying relative at a time." },
  rain: { stack: true, title: "Movies for a rainy night", type: "Recco’s picks", count: "3 films", from: "You", msg: "movies for a rainy night", time: "now", items: ["snowbound", "floor-thirteen", "sandfall-part-two"] },
  stack: { stack: true, title: "3 cozy comedies for a night in", type: "FilmTok", count: "3 shows", from: "Steph", msg: "my three comfort shows when it’s cold out", time: "now", items: ["room-104", "couch-time", "third-floor-mystery"] },
};

// ---------------------------------------------------------------- icons
const ic = {
  gear: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  stack: (s = 13) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>`,
  mic: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>`,
  check: (s = 22, w = 3) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>`,
  checkCircle: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>`,
  trash: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>`,
  back: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>`,
  next: (s = 38) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  cup: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c0 1.5 1.5 1.5 1.5 3M12 3c0 1.5 1.5 1.5 1.5 3"/></svg>`,
  cookie: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="9" r=".9" fill="currentColor"/><circle cx="14.5" cy="10.5" r=".9" fill="currentColor"/><circle cx="10" cy="14.5" r=".9" fill="currentColor"/><circle cx="15" cy="15" r=".9" fill="currentColor"/></svg>`,
  paw: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="16" rx="4.5" ry="3.8"/><circle cx="6" cy="10.5" r="1.8"/><circle cx="9.5" cy="6.5" r="1.8"/><circle cx="14.5" cy="6.5" r="1.8"/><circle cx="18" cy="10.5" r="1.8"/></svg>`,
  tv: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m10 8.5 4 2-4 2z" fill="currentColor"/></svg>`,
  phone: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>`,
  bolt: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>`,
  inbox: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h5l1.5 3h5l1.5-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/></svg>`,
  queue: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1.2"/><rect x="3" y="10" width="18" height="4" rx="1.2"/><rect x="3" y="16" width="18" height="4" rx="1.2"/></svg>`,
  spark: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>`,
  db: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg>`,
  wave: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12a7 7 0 0 1 14 0"/><path d="M8.5 12a3.5 3.5 0 0 1 7 0"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 13v7"/></svg>`,
  msg: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>`,
  link: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>`,
  search: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  user: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  film: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>`,
  lock: (s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  x: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
};

// ---------------------------------------------------------------- TV UI components
const ratings = (r, big = false) => {
  const fs = big ? 25 : 19, cw = big ? 34 : 27, chh = big ? 18 : 14, dot = big ? 20 : 16;
  return `<div class="ratings" style="font-size:${fs}px"><span class="r1"><span class="imdb" style="width:${cw}px;height:${chh}px"></span>${r.imdb}</span>${r.rt ? `<span class="r1"><span class="rt" style="width:${dot}px;height:${dot}px"></span>${r.rt}</span>` : ""}</div>`;
};
const avatar = (ch, size = 24, extra = "") => `<div class="av" style="width:${size}px;height:${size}px;font-size:${Math.round(size / 2)}px;${extra}"><span>${ch}</span></div>`;
const senderLine = (r) => {
  const others = (r.also || []).map((o) => avatar(o, 24, "margin-left:3px;background:var(--surface2solid);border:1px solid rgba(255,255,255,.18)")).join("");
  return `<div class="sender"><div style="display:flex">${avatar(r.from[0])}${others}</div><span class="sname">${r.fromLabel || r.from}</span><span class="stime">· ${r.time}</span></div>`;
};
function card(r, id = "") {
  if (r.stack) {
    const [a, b, c] = r.items;
    return `<div class="card" ${id ? `id="${id}"` : ""}>
      <div class="ccol"><div class="ctitle">${r.title}</div>
        <div class="cmeta"><span class="stackchip">${ic.stack()}${r.count}</span><span>${r.type}</span></div>
        <div class="cbot"><div class="bwrap"><div class="bubble">${r.msg}</div></div>${senderLine(r)}</div></div>
      <div class="fan"><div class="fp fc" style="background-image:url(${P(c)})"></div><div class="fp fb" style="background-image:url(${P(b)})"></div><div class="fp fa" style="background-image:url(${P(a)})"></div></div>
    </div>`;
  }
  return `<div class="card" ${id ? `id="${id}"` : ""}>
    <div class="ccol"><div class="ctitle">${r.title}</div>
      <div class="cmeta"><span>${r.type} · ${r.year}</span></div>${ratings(r)}
      <div class="cbot"><div class="bwrap"><div class="bubble">${r.msg}</div></div>${senderLine(r)}</div></div>
    <div class="poster" style="background-image:url(${P(r.poster)})"></div>
  </div>`;
}
const pendingCard = (from, id) => `<div class="card pending" id="${id}">
    <div class="ccol"><div class="ctitle">Looking it up…</div><div class="cmeta"><span>Recco agent</span></div>
      <div class="cbot">${senderLine({ from, time: "now" })}</div></div>
    <div class="poster pposter"><div class="spin" id="${id}-spin"></div></div>
  </div>`;
const header = (tab = "inbox") => `<div class="hdr">
    <div class="tabs"><div class="seg ${tab === "featured" ? "on" : ""}">Featured</div><div class="seg ${tab === "inbox" ? "on" : ""}">Inbox</div></div>
    <img class="logo" src="assets/img/recco-logo.png" alt="Recco">
    <div class="gear">${ic.gear}</div>
  </div>`;
// a 1920x1080 TV screen. still = paint the theme still behind the UI (for framed TVs)
function screen({ theme, id = "", still = true, body = "", tab = "inbox", hdr = true, cls = "" }) {
  return `<div class="screen ${cls}" ${id ? `id="${id}"` : ""} ${cls === "season" || id === "iScr" ? "data-layout-allow-overlap" : ""} style="${themeVars(theme)}">
    ${still ? `<div class="still" style="background-image:url(assets/bg/${theme}.jpg)"></div>` : ""}
    <div class="vign" style="background-image:url(assets/bg/vignette-${theme}.png)"></div>
    ${hdr ? header(tab) : ""}
    ${body}
  </div>`;
}
const grid = (cards) => `<div class="grid">${cards.join("")}</div>`;
const digitBoxes = (code, idp) => `<div class="digits">${[...code].map((d, i) => `<div class="digit" id="${idp}-d${i}">${d}</div>`).join("")}</div>`;
const codeBody = (idp) => `<div class="dim"></div><div class="center-col">
    <img src="assets/img/recco-logo.png" alt="Recco" style="height:84px;width:auto">
    <div style="font-size:30px;color:var(--text2);margin-top:20px">On your phone, text</div>
    ${digitBoxes("48217", idp)}
    <div class="numline" id="${idp}-numline" style="font-size:44px;color:var(--text2)">to <span id="${idp}-num" style="color:var(--text);font-weight:700">(604) 555-0142</span></div>
    <div style="font-size:28px;line-height:1.45;color:var(--text2);max-width:900px">That connects this TV to your phone. After that, text Recco any show you hear about and it shows up here.</div>
    <div class="waitpill"><div class="spin sm" id="${idp}-spin"></div>Waiting for your text…</div>
  </div>`;
const connectedBody = (idp) => `<div class="dim"></div><div class="center-col">
    <img src="assets/img/recco-logo.png" alt="Recco" style="height:84px;width:auto">
    <div style="display:flex;align-items:center;gap:36px;margin-top:20px"><div class="bigcheck" id="${idp}-chk">${ic.check(64, 3)}</div><div style="font-size:128px;font-weight:700;letter-spacing:-.03em;line-height:1">Connected</div></div>
    <div style="font-size:36px;color:var(--text2)">to the phone ending 0189</div>
  </div>`;
function drawer(r, idp) {
  return `<div class="scrim" id="${idp}-scrim"></div><div class="drawer" id="${idp}-drawer" data-layout-allow-overlap>
    <div style="display:flex;gap:28px;align-items:flex-start">
      <div class="dposter" style="background-image:url(${P(r.poster)})"></div>
      <div style="display:flex;flex-direction:column;gap:14px;min-width:0;padding-top:6px">
        <div style="font-size:46px;line-height:1.05;font-weight:700;letter-spacing:-.02em">${r.title}</div>
        <div style="font-size:23px;color:var(--text2)">${r.type} · ${r.year} · ${r.runtime} · ${r.genre}</div>
        ${ratings(r, true)}
      </div>
    </div>
    <div style="font-size:26px;line-height:1.5">${r.synopsis}</div>
    <div style="height:1px;background:var(--border)"></div>
    <div style="display:flex;gap:14px;align-items:flex-start">${avatar(r.from[0], 40, "margin-top:2px")}<div style="display:flex;flex-direction:column;gap:6px"><div style="font-size:19px;color:var(--text2)"><span style="font-weight:600;color:var(--textB)">${r.from}</span> · ${r.time}</div><div style="font-size:22px;line-height:1.35">${r.msg}</div></div></div>
    <div style="margin-top:auto;display:flex;flex-direction:column;gap:18px">
      <div class="alexa" id="${idp}-alexa"><div class="mic" id="${idp}-mic">${ic.mic()}</div><div><div style="font-size:19px;color:var(--text2)">To watch, say</div><div style="font-size:25px;font-weight:500;line-height:1.2;white-space:nowrap">“Alexa, watch ${r.title}”</div></div></div>
      <div style="display:flex;gap:12px">
        <div class="dbtn focused">${ic.checkCircle}<span>Mark Watched</span></div>
        <div class="dbtn">${ic.trash}<span>Remove</span></div>
        <div class="dbtn" style="flex:none;color:var(--text2)">${ic.back()}<span>Back</span></div>
      </div>
    </div>
  </div>`;
}
function featured(r, idp) {
  return `<div class="feat-wrap">
    <div style="display:flex;align-items:center;gap:40px">
      <div class="arrow">${ic.back(38)}</div>
      <div class="featcard" id="${idp}-card" data-layout-allow-overlap>
        <div class="fposter" style="background-image:url(${P(r.poster)})"></div>
        <div style="display:flex;flex-direction:column;gap:22px;min-width:0;flex:1;align-self:stretch">
          <div style="font-size:68px;font-weight:700;line-height:1;letter-spacing:-.025em">${r.title}</div>
          <div style="font-size:25px;color:var(--text2)">${r.type} · ${r.year} · ${r.runtime} · ${r.genre}</div>
          ${ratings(r, true)}
          <div style="font-size:26px;line-height:1.45">${r.synopsis}</div>
          <div style="height:1px;background:var(--border)"></div>
          <div style="display:flex;gap:14px;align-items:flex-start">${avatar("R", 40, "margin-top:2px")}<div style="display:flex;flex-direction:column;gap:6px"><div style="font-size:20px;color:var(--text2)"><span style="font-weight:600;color:var(--textB)">${r.fromLabel}</span> · ${r.time}</div><div style="font-size:25px;line-height:1.35">${r.msg}</div></div></div>
          <div class="alexa" id="${idp}-alexa" style="margin-top:auto;align-self:flex-start"><div class="mic" id="${idp}-mic">${ic.mic()}</div><div><div style="font-size:19px;color:var(--text2)">To watch, say</div><div style="font-size:26px;font-weight:500;line-height:1.2;white-space:nowrap">“Alexa, watch ${r.title}”</div></div></div>
        </div>
      </div>
      <div class="arrow">${ic.next()}</div>
    </div>
    <div style="display:flex;gap:14px">${[0, 1, 2, 3, 4, 5].map((i) => `<div class="fdot" style="background:${i === 2 ? "var(--focus)" : "rgba(255,255,255,.7)"}"></div>`).join("")}</div>
  </div>`;
}

// ---------------------------------------------------------------- phone
// msgs: [{id, kind:'me'|'link', text, title?}] — bubbles grow in; typing per message
function phone(id, msgs, { time = "9:04" } = {}) {
  const bubbles = msgs.map((m) => {
    if (m.kind === "article") {
      return `<div class="msg me" id="${m.id}"><div class="linkb art"><div class="athumb" style="background-image:url(assets/posters/${m.img}.jpg)"><span>10</span></div><div class="ameta"><div class="akick">${m.domain}</div><div class="lt">${m.title}</div></div></div></div>`;
    }
    if (m.kind === "link") {
      return `<div class="msg me" id="${m.id}"><div class="linkb"><div class="lthumb"><div class="play"></div></div><div class="lmeta"><div class="lt">${m.title}</div><div class="lu">${m.domain ?? "filmtok.cx"}</div></div></div></div>`;
    }
    return `<div class="msg me" id="${m.id}"><div class="bub">${m.text}</div></div>`;
  }).join("");
  const typed = msgs.map((m) => `<span class="typed" id="${m.id}-typed">${[...(m.typeText ?? m.text)].map((c) => `<i>${c === " " ? "&nbsp;" : c}</i>`).join("")}</span>`).join("");
  return `<div class="phone" id="${id}">
    <div class="ph-screen">
      <div class="ph-status"><span>${time}</span><span class="ph-isl"></span><span class="ph-bat"></span></div>
      <div class="ph-head"><div class="ph-av"><img src="assets/img/recco-logo.png" alt=""></div><div class="ph-name">Recco</div><div class="ph-num">(604) 555-0142 · Text Message</div></div>
      <div class="ph-thread"><div class="ph-day">Today ${time} PM</div>${bubbles}</div>
      <div class="ph-input"><div class="ph-field"><span class="ph-ph" id="${id}-ph">Text Message</span>${typed}</div><div class="ph-send" id="${id}-send">↑</div></div>
    </div>
  </div>`;
}

// TV device frame with a scaled 1920x1080 screen stack inside
const tvFrame = (id, inner, { x = 120, y = 250, w = 1152 } = {}) => {
  const s = w / 1920, h = Math.round(1080 * s);
  return `<div class="tvwrap" id="${id}" style="left:${x}px;top:${y}px;width:${w + 24}px;height:${h + 24}px">
    <div class="tvglass" style="width:${w}px;height:${h}px"><div class="tvscale" style="transform:scale(${s})">${inner}</div></div>
    <div class="tvfoot"></div>
  </div>`;
};

// captions
// words split for a rise-in reveal: <span class="w"><span class="wi">word</span></span>
const W = (text) => text.split(" ").map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(" ");
const kicker = (t, id = "") => `<div class="kicker" ${id ? `id="${id}"` : ""}>${t}</div>`;

// ---------------------------------------------------------------- scenes
const scenes = [];
const overlays = []; // top-level layers drawn over the scenes
const videos = [];
const scene = (id, start, end, html, extra = "") => scenes.push(`<section class="clip scene" id="${id}" data-start="${+T(start).toFixed(3)}" data-duration="${+(T(end) - T(start)).toFixed(3)}" data-track-index="2" ${extra}><div class="cam" id="${id}-cam">${html}</div></section>`);
let vcount = 0;
const bgVideo = (theme, start, dur, mediaStart = 0, wrapId = "") => {
  const s0 = T(start), total = T(start + dur) - s0, parts = [];
  for (let off = 0; off < total - 0.001; off += 10) {
    vcount++;
    parts.push(`<video class="clip bgv" id="v${vcount}-${theme}" src="assets/bg/${theme}.mp4" muted playsinline data-start="${+(s0 + off).toFixed(3)}" data-duration="${+Math.min(10, total - off).toFixed(3)}" data-media-start="${off === 0 ? mediaStart : 0}" data-track-index="0"></video>`);
  }
  videos.push(`<div class="vwrap" ${wrapId ? `id="${wrapId}"` : ""}>${parts.join("")}</div>`);
  return parts[0].match(/id="([^"]+)"/)[1];
};
// a still room behind a scene (everything but the seasons montage is static)
const bgStill = (theme, start, dur, wrapId = "") => {
  vcount++;
  const id = `s${vcount}-${theme}`;
  videos.push(`<div class="vwrap" ${wrapId ? `id="${wrapId}"` : ""}><div class="clip bgs" id="${id}" style="background-image:url(assets/bg/${theme}.jpg)" data-start="${+T(start).toFixed(3)}" data-duration="${+(T(start + dur) - T(start)).toFixed(3)}" data-track-index="0"></div></div>`);
  return id;
};

// A · Evening: "9pm. Tea, snacks, and an hour and a half before bed, for a really good show" (cut to the browse on "show")
const A_END = R(5.45), B0 = R(5.15);
// a clock face: the hands run from 9:00 to 10:30 while a wedge fills the hour and a half
const clockSvg = `<svg width="300" height="300" viewBox="0 0 300 300" style="filter:drop-shadow(0 24px 40px rgba(0,0,0,.5))">
  <circle cx="150" cy="150" r="118" fill="#FFF6E8" stroke="#E28A3B" stroke-width="10"/>
  <circle id="aSweep" cx="150" cy="150" r="54" fill="none" stroke="rgba(240,182,103,.6)" stroke-width="108" pathLength="1" stroke-dasharray="0 1" transform="rotate(180 150 150)"/>
  ${Array.from({ length: 12 }, (_, i) => `<line x1="150" y1="44" x2="150" y2="${i % 3 ? 54 : 62}" stroke="#2A1A10" stroke-width="${i % 3 ? 4 : 7}" stroke-linecap="round" transform="rotate(${i * 30} 150 150)"/>`).join("")}
  <line id="aHour" x1="150" y1="150" x2="88" y2="150" stroke="#2A1A10" stroke-width="12" stroke-linecap="round"/>
  <line id="aMin" x1="150" y1="150" x2="150" y2="66" stroke="#2A1A10" stroke-width="8" stroke-linecap="round"/>
  <circle cx="150" cy="150" r="10" fill="#C8572F"/>
</svg>`;
bgStill("winterNight", 0, R(23.3), "vwA");
scene("sA", 0, A_END, `<div class="shade-left"></div>
  <div class="storycol"><div class="line big" id="a1">${W("9pm")}</div></div>
  <div class="items" id="aItems">
    ${[["intro-tea.webp", "Tea"], ["intro-snack.webp", "Snacks"]].map(([f, l], i) => `<div class="item" id="ai${i}"><div class="iic"><img src="assets/img/${f}" alt=""></div><div class="ilab">${l}</div></div>`).join("")}
    <div class="item" id="ai2"><div class="iic">${clockSvg}</div><div class="ilab">1½ hours till bed</div></div>
  </div>`);

// B · Looking: a streaming home screen on the TV runs from "a really good show" through "ten minutes searching"; "Megan mentioned a show"
// brings up the phone, "forty minutes later" turns it into the feed, until "not exactly me time"
const B_END = R(23.25);
const browsePosters = ["two-car-garage", "desk-nine", "back-of-house", "floor-thirteen", "second-summer", "room-104", "away-game", "couch-time", "sandfall-part-two", "will-reading", "fog-house", "snowbound", "third-floor-mystery"];
// rows of the home screen: each row starts at a different poster so neighbours differ
const SROWS = ["Continue watching", "Trending now", "New this week", "Because you watched Away Game", "Comedies", "Award winners"];
const SCOLS = 14, STW = 210, STH = 315, SGAP = 22, SCW = STW + SGAP, SX0 = 90, SROW0 = 690, SROWH = 405;
const sTile = (r, c) => browsePosters[(c * 3 + r * 5) % browsePosters.length];
const streamScreen = `<div class="sapp">
  <div class="spage" id="bPage">
    <div class="shero"><div class="sheroimg" style="background-image:url(assets/posters/hero-sandfall.jpg)"></div><div class="sherofade"></div>
      <div class="sheroinfo"><div class="skick">Film · New this week</div><div class="stitle">Sandfall: Part Two</div><div class="smeta"><span class="sbadge">4K</span>2024 · Sci-fi · 2h 46m</div><div class="sdesc">The desert is pouring off the edge of a broken ring, and two strangers have one night to cross it.</div>
        <div class="sbtns"><span class="sbtn" id="bPlay">▶&nbsp; Play</span><span class="sbtn ghost">More info</span></div></div></div>
    ${SROWS.map((n, r) => `<div class="srow" style="top:${SROW0 + r * SROWH}px"><div class="slabel">${n}</div><div class="stiles" id="bR${r}">${Array.from({ length: SCOLS }, (_, c) => `<div class="stile" id="bT${r}_${c}" style="left:${c * SCW}px;background-image:url(${P(sTile(r, c))})">${r === 0 ? `<i style="width:${[62, 30, 80, 45, 15, 70, 52, 25, 90, 40, 66, 20, 55, 35][c]}%"></i>` : ""}</div>`).join("")}</div></div>`).join("")}
  </div>
  <div class="snav" id="bNav"><span class="slogo"></span><span class="on">Home</span><span>Movies</span><span>Shows</span><span>My List</span><span class="sgap"></span>${ic.search(30)}<span class="sprof">D</span></div>
</div>`;
const threads = [["Jill", "haha that sitcom I told you about is SO funny", "3 wk"], ["Book club", "ok but what was the show called", "3 wk"], ["Steph", "Sent a video", "2 wk"], ["Mom", "your dad and I are hooked on that one show", "Sun"], ["Sarah", "you have to watch it, trust me", "Sat"], ["Dad", "that British spy one, forget the name", "Fri"], ["Jill", "did you start it yet??", "Thu"], ["Sam", "the one with the kitchen", "Wed"], ["Mom", "what's it called again, the office one", "Tue"], ["Steph", "ok you'll love this one", "Mon"], ["Megan", "you NEED to watch this show", "Sep 30"], ["Sarah", "omg the finale", "Sep 28"], ["Dad", "watching it again tonight", "Sep 26"]];
// one caption per clip in assets/video/feed.mp4 (8.5s); the clip swipes at 1.25s, 4.47s and 7.04s
const FEED_REAL = 14.76, FEED_AT = R(FEED_REAL), FEED_SWIPES = [1.25, 4.47, 7.04];
const feedMeta = [
  ["golden.hours", "bubble day. he has never been happier", "212K", "4,102"],
  ["marmalade.cat", "he knows exactly what he did", "1.2M", "18K"],
  ["slow.travel", "save this for your next trip", "530K", "7,811"],
  ["coast.drives", "the long way home", "88K", "1,240"],
];
scene("sB", B0, B_END, `<div class="bstage" id="bStage"></div>
  ${tvFrame("bTV", streamScreen, { x: 268, y: 178, w: 1360 })}
  <div class="bdim" id="bDim"></div>
  <div class="clock" id="bClock"><span id="bClockT">9:00</span><small>PM</small></div>
  <div class="bphone" id="bPhone" data-layout-allow-overlap><div class="ph-screen">
     <div class="ph-status"><span>9:12</span><span class="ph-isl"></span><span class="ph-bat"></span></div>
     <div class="mview"><div class="mscroll" id="bList" data-layout-allow-overlap>
       <div class="mlist-h">Messages</div><div class="msearch">${ic.search(18)}<span>Megan</span></div>
       ${threads.map(([n, t, d]) => `<div class="mrow" ${n === "Megan" ? 'id="bMeg"' : ""}><div class="mav">${n[0]}</div><div class="mtx"><div class="mn"><b>${n}</b><span>${d}</span></div><div class="mt">${t}</div></div></div>`).join("")}
     </div></div>
     <div class="feed" id="bFeed" data-layout-allow-overlap></div>
  </div></div>
  <div class="bcap" data-layout-allow-overlap><div class="line" id="b2">${W("No time for anything")}</div><div class="line" id="b3">${W("So I scroll some more")}</div><div class="line accent" id="b4">${W("Not exactly me time")}</div></div>`);
overlays.push(`<div class="feedwrap" id="bFeedWrap" data-layout-allow-overlap><video class="clip fvid" id="bFeedVid" src="assets/video/feed.mp4" muted playsinline data-start="${FEED_REAL}" data-duration="${+(T(B_END) - FEED_REAL).toFixed(3)}" data-track-index="3"></video><div class="fgrad"></div>
       ${feedMeta.map(([who, cap, likes, comments], i) => `<div class="fpost" id="bMeta${i}"><div class="fact"><div><span class="fic"><svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.7 1.2 5.4 3.1C13.7 6.2 15.3 5 17.4 5 21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg></span>${likes}</div><div><span class="fic">${ic.msg(30)}</span>${comments}</div><div><span class="fic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l7 7-7 7"/><path d="M21 12H10a7 7 0 0 0-7 7"/></svg></span>Share</div></div>
       <div class="fmeta"><div class="fwho"><span class="fav">${who[0].toUpperCase()}</span>@${who}</div><div class="fcap">${cap}</div></div></div>`).join("")}
       <div class="ftabs"><span>Following</span><b>For You</b></div></div>`);

// D+E · Reveal → install → pairing → inbox (20.85 – 37.8), one continuous scene.
// The TV frame starts scaled so its screen covers the whole frame (invisible until the app page slides up),
// shrinks into view for the install, slides left for the phone, then zooms back out into the next scene.
// the same fall-night room as scene C: C un-blurs onto it, so "So now I use Recco" stays in one room
bgStill("winterNight", 20.3, 3.9, "vwD");
const RV_FLY = [["Jill’s pick"], ["a link"], ["rainy night"]];
const shot = (inner, w) => `<div class="shot" style="width:${w}px;height:${Math.round(w * 9 / 16)}px"><div class="shotscale" style="transform:scale(${(w / 1920).toFixed(4)})">${inner}</div></div>`;
const storeBody = `<div class="store">
    <div class="st-art" style="background-image:url(assets/img/app_icon.png)"></div><div class="st-fade"></div>
    <div class="st-top"><span class="st-brand">Appstore</span><span class="st-crumb">Apps › Entertainment › Recco</span></div>
    <div class="st-hero">
      <img class="st-icon" src="assets/img/app_icon.png" alt="">
      <div class="st-info">
        <div class="st-name">Recco</div>
        <div class="st-tag">An inbox of things to watch</div>
        <div class="st-pills"><span>Free</span><span>Fire TV</span><span>Works with Alexa</span></div>
        <div class="st-desc">Text a show to one number. When you sit down to watch, your list is on the TV with who recommended it and what they said.</div>
        <div class="st-actions"><div class="st-btn" id="eBtn"><div class="st-fill" id="eFill"></div><span class="st-l" id="eGet">Get</span><span class="st-l" id="eInst">Installing…</span><span class="st-l" id="eOpen">Open</span></div><div class="st-btn2">Details</div></div>
      </div>
      ${shot(screen({ theme: "fallDay", body: grid([card(RECS.stack), card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past)]) }), 744)}
    </div>
    <div class="st-row"><div class="st-rowh">Screens</div><div class="st-thumbs">
      ${shot(screen({ theme: "winterNight", tab: "featured", body: featured(RECS.knives, "stF") }), 400)}
      ${shot(screen({ theme: "fallNight", body: grid([card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past), card(RECS.shrink)]) }), 400)}
      ${shot(screen({ theme: "summerDay", body: grid([card(RECS.bear), card(RECS.sev), card(RECS.past), card(RECS.shrink), card(RECS.dune), card(RECS.lasso)]) }), 400)}
    </div></div>
  </div>`;
// the live inbox: every card absolutely placed, so GSAP can slide them into new slots
const liveCards = [
  ["bear", card(RECS.bear, "eX-bear")], ["sev", card(RECS.sev, "eX-sev")], ["past", card(RECS.past, "eX-past")], ["shrink", card(RECS.shrink, "eX-shrink")], ["dune", card(RECS.dune, "eX-dune")], ["lasso", card(RECS.lasso, "eX-lasso")],
  ["pDad", pendingCard("Dad", "eX-pDad")], ["slow", card(RECS.slow, "eX-slow")],
  ["pJill", pendingCard("Jill", "eX-pJill")], ["koq", card(RECS.koq, "eX-koq")],
  ["pSteph", pendingCard("Steph", "eX-pSteph")], ["stack", card(RECS.stack, "eX-stack")],
  ["pLink", pendingCard("You", "eX-pLink")], ["fog", card(RECS.fog, "eX-fog")],
  ["pMeg", pendingCard("Megan", "eX-pMeg")], ["will", card(RECS.will, "eX-will")],
  ["pRain", pendingCard("You", "eX-pRain")], ["rain", card(RECS.rain, "eX-rain")],
];
const tvStackE = `<div class="still" id="eStill" style="background-image:url(assets/bg/winterNight.jpg)"></div>
  ${screen({ theme: "winterNight", id: "eCode", still: false, hdr: false, body: codeBody("eC") })}
  ${screen({ theme: "winterNight", id: "eIn", still: false, body: `<div class="cardlayer" id="eCards">${liveCards.map(([, h]) => h).join("")}</div>` })}
  <div class="screen" id="eStore">${storeBody}</div>`;
const phoneE = phone("ePhone", [
  { id: "m1", text: "48217" },
  { id: "m2", text: "Dad says Desk Nine is brilliant" },
  { id: "m3", text: "Jill says Two-Car Garage is hilarious" },
  { id: "m4", kind: "link", title: "3 cozy comedies for a night in", typeText: "filmtok.cx/@steph/v/74…" },
  { id: "m5", text: "Steph sent this" },
  { id: "m6", kind: "article", title: "10 mysteries to watch this weekend", domain: "screenlist.cx", img: "fog-house", typeText: "screenlist.cx/10-mysteries" },
  { id: "m7", text: "Megan says The Will Reading is so good" },
  { id: "m8", text: "movies for a rainy night" },
]);
scene("sE", 20.85, R(55.5), `<div class="stage" id="eStage"><div class="stagev"></div></div>
  <div class="revealwrap" id="eReveal"><div class="dshade"></div><div class="reveal"><img id="dLogo" src="assets/img/recco-logo.png" alt="Recco" class="revlogo"></div><div class="revsub" id="dSub">${W("An inbox for your TV you text like a friend")}</div>
    <div class="rvphonewrap" id="rvPhoneWrap"><div class="rvphonescale">${phone("rvPhone", [{ id: "rv1", text: "Jill says Two-Car Garage is hilarious" }, { id: "rv2", kind: "link", title: "3 cozy comedies for a night in", typeText: "filmtok.cx/@steph" }, { id: "rv3", text: "movies for a rainy night" }], { time: "9:00" }).replace('class="phone" id="rvPhone"', 'class="phone" id="rvPhone" style="left:0;top:0"')}</div></div>
    ${tvFrame("rvTV", screen({ theme: "winterNight", id: "rvScr", body: grid([card(RECS.koq, "rvC0"), card(RECS.stack, "rvC1"), card(RECS.rain, "rvC2")]) }), { x: 780, y: 470, w: 820 })}
    ${RV_FLY.map(([label], i) => `<div class="rvfly" id="rvF${i}">${label}</div>`).join("")}
  </div>
  <div class="capblock">
    <div class="caph" id="eH1">${W("Install Recco on Fire TV")}</div>
    <div class="caph" id="eH2">${W("Text the code to the Recco number")}</div>
    <div class="caph" id="eH3">${W("The Recco agent looks it up")}</div>
    <div class="caph" id="eH4">${W("Jill says a sitcom is hilarious")}</div>
    <div class="caph" id="eH6">${W("Steph sends a video with three shows")}</div>
    <div class="caph" id="eH5">${W("One link, three reccos")}</div>
    <div class="caph" id="eH7">${W("Nothing to install. Just text it")}</div>
    <div class="caph" id="eH8">${W("Send it anything")}</div>
    <div class="caph" id="eH9">${W("It just works")}</div>
  </div>
  ${tvFrame("eTV", tvStackE, { x: 110, y: 270, w: 1180 })}
  ${phoneE}`);

// I · My list is waiting (37.5 – 42.55): full-bleed TV, fall night
bgStill("winterNight", R(54.0), R(67.6) - R(54.0), "vwI");
scene("sI", R(55.5), R(63.85), `<div class="fullscale" id="iScale">${screen({ theme: "winterNight", id: "iScr", still: false, body: grid([card(RECS.rain, "iC0"), card(RECS.will, "iC1"), card(RECS.fog, "iC2"), card(RECS.stack), card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past)]) + drawer(RECS.will, "iD") })}</div>
  <div class="dnd" id="iDnd" data-layout-allow-overlap><div class="dndphone"><div class="dndscr"><div class="dndt">9:30</div><div class="dndd">Tuesday</div></div><div class="dndoff" id="iDndOff"><svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></div></div><div class="dndlab" id="iDndLab">Phone off</div></div>`);

// K · Tagline (44.4 – 47.9)
scene("sK", R(63.7), 49.6, `<div class="kshade"></div><div class="endcard">
    <img src="assets/img/recco-logo.png" alt="Recco" class="endlogo" id="kLogo">
    <div class="tagrow">${W("From a friend, a link, or you")}</div>
    <div class="tagready" id="k4">${W("Ready when you are")}</div>
  </div>`);

// O · How it's built (48.95 – 90.96): one map that fills in as the voice names each piece.
// The TV starts big, slides right for the phone (pairing), then the phone shrinks to the left edge and the
// TV to the right edge; the pipeline flows between them. At the end the little TV grows back to full frame.
const NW = 340, NH = 84, NX = 790, NY0 = 204, NGAP = 132, NCX = NX + NW / 2;
const ONODES = [
  { k: "zernio", t: "Zernio", s: "SMS in", icon: ic.msg() },
  { k: "lambda", t: "AWS Lambda", s: "Checks each text", icon: ic.bolt() },
  { k: "sqs", t: "Amazon SQS", s: "Queued safely", icon: ic.queue() },
  { k: "agent", t: "Recco agent", s: "AgentCore Runtime", icon: ic.spark() },
  { k: "ddb", t: "DynamoDB", s: "Keeps the record", icon: ic.db() },
  { k: "appsync", t: "AppSync Events", s: "Pushes updates", icon: ic.wave() },
].map((n, i) => ({ ...n, x: NX, y: NY0 + i * NGAP }));
const NCY = (i) => NY0 + i * NGAP + NH / 2;
const node = (n, p) => `<div class="node" id="${p}-${n.k}" style="left:${n.x}px;top:${n.y}px;width:${NW}px;height:${NH}px"><div class="nic">${n.icon}</div><div class="ntx"><div class="nt">${n.t}</div><div class="ns">${n.s}</div></div>${n.k === "lambda" ? `<div class="nbadge" id="${p}-lcheck">${ic.check(20, 3.5)}</div>` : ""}${n.k === "agent" ? `<div class="aring" id="${p}-aring"></div><div class="awork">${["Reading the text…", "Finding the shows…", "Checking each title…"].map((w, i) => `<span id="${p}-aw${i}">${w}</span>`).join("")}</div>` : ""}</div>`;
// phone (left, centred at y 600) → down the column → the TV app (right, centred at y 600)
const PH_R = 385, TV_L = 1452, MIDY = 600, ELB0 = 590, ELB6 = 1290;
const OEDGES = [
  `M ${PH_R} ${MIDY} L ${ELB0} ${MIDY} L ${ELB0} ${NCY(0)} L ${NX} ${NCY(0)}`,
  ...[0, 1, 2, 3, 4].map((i) => `M ${NCX} ${NY0 + i * NGAP + NH} L ${NCX} ${NY0 + (i + 1) * NGAP}`),
  `M ${NX + NW} ${NCY(5)} L ${ELB6} ${NCY(5)} L ${ELB6} ${MIDY} L ${TV_L} ${MIDY}`,
];
const OPTS = { phone: [PH_R, MIDY], e0a: [ELB0, MIDY], e0b: [ELB0, NCY(0)], ...Object.fromEntries(ONODES.map((n, i) => [n.k, [NCX, NCY(i)]])), e6a: [ELB6, NCY(5)], e6b: [ELB6, MIDY], tv: [TV_L, MIDY] };
// the TV app's code, shown on the big TV while the voice says what it is built with
const CODE = [
  `<b>import</b> React, {memo, useState} <b>from</b> <s>'react'</s>;`,
  `<b>import</b> {Pressable, View} <b>from</b> <s>'react-native'</s>;`,
  `<b>import</b> LinearGradient <b>from</b> <s>'@amazon-devices/react-linear-gradient'</s>;`,
  `<b>import</b> {FocusRing} <b>from</b> <s>'./FocusRing'</s>;`,
  ``,
  `<em>// One inbox tile. Focus lifts it: a ring, a shadow, scale 1.06.</em>`,
  `<b>export const</b> <u>InboxTile</u> = memo(({item, onPress}: Props) =&gt; {`,
  `  <b>const</b> [focused, setFocused] = useState(<b>false</b>);`,
  `  <b>return</b> (`,
  `    &lt;<u>Pressable</u>`,
  `      <i>hasTVPreferredFocus</i>`,
  `      <i>aria-label</i>={item.title}`,
  `      <i>onFocus</i>={() =&gt; setFocused(<b>true</b>)}`,
  `      <i>onPress</i>={() =&gt; onPress(item)}&gt;`,
  `      &lt;<u>Poster</u> <i>uri</i>={item.poster} /&gt;`,
  `      &lt;<u>FocusRing</u> <i>visible</i>={focused} /&gt;`,
  `    &lt;/<u>Pressable</u>&gt;`,
  `  );`,
  `});`,
];
const TERM = [`<span class="tp">~/recco/apps/tv $</span> npm run build:debug`, `<span class="tok">✓</span> Built tv_aarch64.vpkg`, `<span class="tp">~/recco/apps/tv $</span> vega device launch-app -a com.recco.tv.main`];
const editorBody = () => `<div class="ide">
    <div class="ide-bar"><span class="ide-dot"></span><span class="ide-dot"></span><span class="ide-dot"></span><span class="ide-tab on">InboxTile.tsx</span><span class="ide-tab">App.tsx</span><span class="ide-tab">FocusRing.tsx</span></div>
    <div class="ide-side"><div class="ide-proj">RECCO / apps / tv</div>${["src", "· App.tsx", "· components", "  InboxTile.tsx", "  FocusRing.tsx", "  Header.tsx", "· screens", "  Inbox.tsx", "manifest.toml"].map((f, i) => `<div class="ide-f ${i === 3 ? "on" : ""}">${f.replace(/ /g, "&nbsp;")}</div>`).join("")}</div>
    <div class="ide-code">${CODE.map((l, i) => `<div class="cl ${i === 1 || i === 2 ? "rn" : ""}" id="oL${i}"><span class="ln">${i + 1}</span><span class="ct">${l.replace(/^( +)/, (m) => "&nbsp;".repeat(m.length)) || "&nbsp;"}</span><span class="cv" id="oV${i}"></span></div>`).join("")}</div>
    <div class="ide-term"><div class="ide-th">TERMINAL</div>${TERM.map((l, i) => `<div class="tl" id="oT${i}">${l}</div>`).join("")}</div>
  </div>`;
const oCards = [
  ["koq", card(RECS.koq, "oX-koq")], ["slow", card(RECS.slow, "oX-slow")], ["bear", card(RECS.bear, "oX-bear")], ["sev", card(RECS.sev, "oX-sev")], ["past", card(RECS.past, "oX-past")], ["shrink", card(RECS.shrink, "oX-shrink")], ["dune", card(RECS.dune, "oX-dune")], ["lasso", card(RECS.lasso, "oX-lasso")],
  ["pNew", pendingCard("Steph", "oX-pNew")], ["stack", card(RECS.stack, "oX-stack")],
];
const tvStackO = `<div class="still" style="background-image:url(assets/bg/winterNight.jpg)"></div>
  ${screen({ theme: "winterNight", id: "oCode", still: false, hdr: false, body: codeBody("oC") })}
  <div class="screen" id="oEd">${editorBody()}</div>
  ${screen({ theme: "winterNight", id: "oIn", still: false, body: `<div class="cardlayer" id="oCards">${oCards.map(([, h]) => h).join("")}</div>` })}`;
const oPosters = [["fog-house", "The Fog House", "2001"], ["snowbound", "Snowbound", "1980"], ["will-reading", "The Will Reading", "2019"]];
scene("sO", 48.95, 90.96, `<div class="stage"><div class="stagev"></div></div>
  <div class="capblock" style="z-index:7">
    <div class="caph" id="oH0">${W("Built for the Build, Ship, Shape hackathon")}</div>
    <div class="caph" id="oH1">${W("The TV app, in React Native for Vega")}</div>
    <div class="caph" id="oH2">${W("First launch shows a five-digit code")}</div>
    <div class="caph" id="oH3">${W("Text it, and phone and TV are linked")}</div>
    <div class="caph" id="oH4">${W("Texts come in through Zernio")}</div>
    <div class="caph" id="oH5">${W("Lambda checks it, SQS queues it")}</div>
    <div class="caph" id="oH6">${W("The app updates in real time")}</div>
    <div class="caph" id="oH7">${W("The Recco agent, on AgentCore")}</div>
    <div class="caph" id="oH8">${W("A name, a link, or a search")}</div>
    <div class="caph" id="oH9">${W("The friend, the titles and the links")}</div>
    <div class="caph" id="oH10">${W("Every title is checked in OMDb")}</div>
    <div class="caph" id="oH11">${W("DynamoDB keeps the record")}</div>
    <div class="caph" id="oH12">${W("AppSync Events pushes every update")}</div>
    <div class="caph" id="oH13">${W("Your number is never stored")}</div>
    <div class="caph" id="oH14">${W("Friends are first names only")}</div>
  </div>
  <svg class="edges" width="1920" height="1080" viewBox="0 0 1920 1080">${OEDGES.map((d, i) => `<path id="o-e${i}" d="${d}" pathLength="1"/>`).join("")}${OEDGES.map((d, i) => `<path class="flow" id="o-f${i}" d="${d}"/>`).join("")}</svg>
  ${ONODES.map((n) => node(n, "o")).join("")}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<div class="packet" id="o-pk${i}"></div>`).join("")}
  <div class="sms obub" id="oIn0">Desk Nine</div>
  <div class="sms obub" id="oIn1">${ic.link(24)} reelhub.cx/best-films</div>
  <div class="sms obub" id="oIn2">top films for a stormy night</div>
  <div class="ochip obot" id="oOut0" style="left:610px"><div class="oic">${ic.user(24)}</div><div><div class="ok">Friend</div><div class="ov">Steph</div></div></div>
  <div class="ochip obot" id="oOut1" style="left:850px"><div class="oic">${ic.film(24)}</div><div><div class="ok">Titles</div><div class="ov">3 films</div></div></div>
  <div class="ochip obot" id="oOut2" style="left:1090px"><div class="oic">${ic.link(24)}</div><div><div class="ok">Links</div><div class="ov">reelhub.cx</div></div></div>
  <div class="qrow small">${oPosters.map(([p, t, y], i) => `<div class="qcard" id="q${i}"><div class="qp" style="background-image:url(${P(p)})"><div class="qscan" id="qs${i}"></div><div class="qbadge" id="qb${i}">${ic.check(16, 3.5)} In OMDb</div></div><div class="qt">${t}</div><div class="qm">Film · ${y}</div></div>`).join("")}
    <div class="qcard" id="q3"><div class="qp ghost"><span>?</span><div class="qscan bad" id="qs3"></div><div class="qx" id="qx">${ic.x(18)} Not added</div></div><div class="qt" style="opacity:.5">Made-up title</div><div class="qm">Not in OMDb</div></div>
  </div>
  <div class="oscrim" id="oScrim"></div>
  <div class="privacy">
    <div class="pchip" id="rP0"><div class="pic">${ic.lock()}</div><div class="pnum"><span id="rNum">+1 (604) 555-0189</span></div><div class="plab">Your number is never stored</div></div>
    <div class="pchip" id="rP1"><div class="pic">${ic.user(26)}</div><div class="pnum"><span>Jill</span><span class="last" id="rLast">Anderson</span></div><div class="plab">Friends are first names only</div></div>
  </div>
  ${tvFrame("oTV", tvStackO, { x: 110, y: 270, w: 1180 })}
  <div class="live" id="oLive" style="left:1756px;top:468px;right:auto"><span></span>Live</div>
  <div class="chip vega" id="oChip"><span class="cdot"></span>React Native for Vega</div>
  <div class="hsticker" id="oSticker">Hackathon build</div>
  ${phone("oPhone", [{ id: "o1", text: "48217" }, { id: "o2", text: "the one with the kitchen" }, { id: "o3", text: "Dad says Desk Nine is brilliant" }, { id: "o4", kind: "link", title: "3 cozy comedies for a night in", typeText: "filmtok.cx" }, { id: "o5", text: "something cozy for tonight" }], { time: "8:58" }).replace('class="phone" id="oPhone"', 'class="phone" id="oPhone" style="left:100px"')}
  <div class="linkline" id="oLink" style="left:500px;width:96px;transform-origin:0% 50%"><div class="lldot" id="oDot" style="left:-8px;right:auto"></div></div>`);

// S · The inbox through the seasons (90.96 – 101.5), ending on the logo
const seasonOrder = ["winterNight", "fallDay", "winterDay", "summerDay", "summerNight", "winterNight"];
const seasonCards = [card(RECS.stack), card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past), card(RECS.shrink), card(RECS.dune), card(RECS.lasso)];
const seasonT = [90.96, 92.4, 93.8, 95.2, 96.6, 97.9], S_END = 101.5;
const vS = seasonOrder.map((t, i) => { const a = i === 0 ? 90.0 : seasonT[i] - 0.05, b = i < 5 ? seasonT[i + 1] + 0.5 : S_END; return [t, a, +(b - a).toFixed(3)]; });
// behind the TV: the same room as the app's background (the new stills where there are any, the loops otherwise)
const NEW_STILLS = ["winterNight", "fallDay", "summerNight", "springDay"];
const seasonVidIds = vS.map(([t, s, d]) => (NEW_STILLS.includes(t) ? bgStill(t, s, d) : bgVideo(t, s, d, 0)));
scene("sS", 90.96, S_END, `${tvFrame("sTV", seasonOrder.map((t, i) => screen({ theme: t, id: `sScr${i}`, still: true, body: grid(seasonCards), cls: "season" })).join(""), { x: 258, y: 128, w: 1380 })}
  <div class="uend" id="uEnd" data-layout-allow-overlap style="${themeVars("winterNight")}"><img src="assets/img/recco-logo.png" alt="Recco" class="endlogo"></div>`);

// ---------------------------------------------------------------- timeline script (global seconds)
const script = `
const WA = ${JSON.stringify(WA)};
const lerpMap = ${lerpMap};
const T0 = ${T0};
const WARP = ${WARP};
const T = ${T};
const master = gsap.timeline({ paused: true });
const at = (p) => (typeof p === "number" ? T(p) : p);
const tl = { fromTo: (a, b, c, p) => master.fromTo(a, b, c, at(p)), to: (a, b, p) => master.to(a, b, at(p)), set: (a, b, p) => master.set(a, b, at(p)) };
const S = (sel) => document.querySelector(sel);
const inn = (sel, t, from = { opacity: 0, y: 30 }, dur = 0.6, ease = "power3.out") => { const to = { opacity: 1, duration: dur, ease }; for (const k of ["x", "y", "rotation"]) if (k in from) to[k] = 0; if ("scale" in from) to.scale = 1; if ("filter" in from) to.filter = "blur(0px)"; return tl.fromTo(sel, from, to, t); };
const out = (sel, t, to = { opacity: 0 }, dur = 0.35) => tl.to(sel, { ...to, duration: dur, ease: "power2.in" }, t);
const sceneFade = (id, s, e) => { tl.fromTo("#" + id, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, s); tl.to("#" + id, { opacity: 0, scale: 0.985, duration: 0.3, ease: "power1.in" }, e - 0.3); };
// slow camera drift on a scene's inner wrapper
const drift = (id, s, e, to = 1.035) => tl.fromTo("#" + id + "-cam", { scale: 1 }, { scale: to, duration: T(e) - T(s), ease: "none" }, s);
// headline: words rise in one after another
const words = (sel, t, stagger = 0.06, dur = 0.6) => { tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: 0.01 }, t); tl.fromTo(sel + " .wi", { yPercent: 115, rotation: 5 }, { yPercent: 0, rotation: 0, duration: dur, stagger, ease: "power4.out" }, t); };
// icon pop inside a node or card
const pop = (sel, t) => tl.fromTo(sel, { scale: 0.4, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.6)" }, t);
// gentle floating, a finite number of half-cycles
const bob = (sel, s, e, amp = 8, half = 1.6) => tl.fromTo(sel, { y: 0 }, { y: -amp, duration: half, yoyo: true, repeat: Math.max(0, Math.floor((T(e) - T(s)) / half) - 1), ease: "sine.inOut", immediateRender: false }, s);
const spin = (sel, s, e) => tl.fromTo(sel, { rotation: 0 }, { rotation: 360 * Math.max(1, Math.round(T(e) - T(s))), duration: T(e) - T(s), ease: "none" }, s);
// typing: reveal characters of #id-typed between t0 and t1, then clear at send
const type = (pid, mid, t0, t1, send) => {
  const chars = document.querySelectorAll("#" + mid + "-typed i");
  tl.set("#" + pid + "-ph", { opacity: 0 }, t0);
  tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: (T(t1) - T(t0)) / chars.length, ease: "none" }, t0);
  tl.to("#" + mid + "-typed", { opacity: 0, duration: 0.08 }, send);
  tl.fromTo("#" + pid + "-send", { scale: 1 }, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 }, send - 0.05);
  const msg = S("#" + mid), h = msg.firstElementChild.offsetHeight + 12;
  tl.fromTo(msg, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.32, ease: "power3.out" }, send);
  tl.fromTo(msg.firstElementChild, { scale: 0.7, transformOrigin: "100% 100%" }, { scale: 1, duration: 0.42, ease: "back.out(1.8)" }, send);
};
const fadeSwap = (a, b, t, d = 0.4) => { tl.to(a, { opacity: 0, duration: d, ease: "power1.inOut" }, t); tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: d, ease: "power1.inOut" }, t); };
const focusCard = (sel, t, on = true) => tl.to(sel, { scale: on ? 1.06 : 1, outlineColor: on ? "#E28A3B" : "rgba(226,138,59,0)", backgroundColor: on ? "rgba(18,28,30,.72)" : "rgba(18,28,30,.8)", boxShadow: on ? "0 40px 90px rgba(0,0,0,.6)" : "0 0 0 rgba(0,0,0,0)", zIndex: on ? 5 : 1, duration: 0.25, ease: "power2.out" }, t);
const resolveCard = (pend, real, t) => { tl.to(pend, { opacity: 0, duration: 0.25 }, t); tl.fromTo(real, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1.06, duration: 0.5, ease: "back.out(1.6)" }, t); };

function build() {
  // intentional layering: captions over the browse grid, the drawer over the inbox, the end card over Featured
  document.querySelectorAll("#bTV *, #iDnd *, #sTV *, .bcap *, #iScr .grid *, #iD-drawer *, #uF-card *, #uEnd *, #eTV *, #eReveal *, #oTV *, #oPhone *, .crow *").forEach((e) => e.setAttribute("data-layout-allow-overlap", ""));
  // ---- A · Evening
  sceneFade("sA", 0, ${A_END});
  drift("sA", 0, ${A_END}, 1.03);
  words("#a1", ${R(0.7)}, 0.06, 0.7);
  out("#a1", ${R(1.95)}, { opacity: 0, y: -20 }, 0.35);
  // tea, snacks, and an hour and a half before bed
  [${R(2.1)}, ${R(2.6)}, ${R(3.55)}].forEach((t, i) => { inn("#ai" + i, t, { opacity: 0, y: 60, scale: 0.85, rotation: i % 2 ? 3 : -3 }, 0.6, "back.out(1.8)"); pop("#ai" + i + " .iic", t + 0.1); bob("#ai" + i + " .iic", t + 0.7, ${A_END}, 6, 0.9 + i * 0.1); });
  tl.set("#aHour, #aMin", { svgOrigin: "150 150" }, 0);
  tl.fromTo("#aSweep", { strokeDasharray: "0 1" }, { strokeDasharray: "0.125 1", duration: 1.4, ease: "power1.inOut" }, ${R(3.75)});
  tl.fromTo("#aHour", { rotation: 0 }, { rotation: 45, duration: 1.4, ease: "power1.inOut" }, ${R(3.75)});
  tl.fromTo("#aMin", { rotation: 0 }, { rotation: 540, duration: 1.4, ease: "power1.inOut" }, ${R(3.75)});

  // ---- B · browsing on the TV ("for a really good show… ten minutes searching"), then the phone
  sceneFade("sB", ${B0}, ${B_END});
  tl.set("#bPhone", { scale: 1.12, transformOrigin: "50% 50%" }, ${B0});
  // the TV comes up in the room for "a really good show"
  tl.fromTo("#bTV", { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", immediateRender: false }, ${B0});
  // focus lives on the tiles themselves: the focused one lifts with a white ring; rows slide sideways to keep it in view,
  // and the page scrolls down a row at a time, like a TV app's home screen
  const SCW = ${SCW}, SROW0 = ${SROW0}, SROWH = ${SROWH};
  const FON = { scale: 1.12, zIndex: 3, boxShadow: "0 0 0 5px rgba(255,255,255,1), 0 26px 50px rgba(0,0,0,.65)", duration: 0.2, ease: "power2.out" };
  const FOFF = { scale: 1, zIndex: 1, boxShadow: "0 0 0 0px rgba(255,255,255,0), 0 0 0 rgba(0,0,0,0)", duration: 0.2, ease: "power2.out" };
  const pageY = (r) => (r === 0 ? 0 : -(SROW0 + r * SROWH - 330));
  const rowOff = {};
  let cur = null, curRow = -1;
  const focusTile = (t, r, c) => {
    if (cur) tl.to(cur, { ...FOFF }, t); else tl.to("#bPlay", { backgroundColor: "rgba(255,255,255,.18)", color: "#fff", duration: 0.2 }, t);
    const id = "#bT" + r + "_" + c;
    tl.to(id, { ...FON }, t);
    if (r !== curRow) tl.to("#bPage", { y: pageY(r), duration: 0.45, ease: "power2.inOut" }, t);
    if (r >= 1 && curRow < 1) tl.to("#bNav", { opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, t); // the nav tucks away once the page scrolls
    const off = rowOff[r] || 0, want = Math.max(0, c - 4);
    if (want !== off) { tl.to("#bR" + r, { x: -want * SCW, duration: 0.35, ease: "power2.inOut" }, t); rowOff[r] = want; }
    cur = id; curRow = r;
  };
  // first the featured film's Play button, then down into the rows
  tl.fromTo("#bPlay", { backgroundColor: "rgba(255,255,255,.18)", color: "#fff" }, { backgroundColor: "rgba(255,255,255,1)", color: "#0b0d11", duration: 0.2, immediateRender: false }, ${R(5.45)});
  tl.fromTo("#bPlay", { scale: 1 }, { scale: 1.06, duration: 0.2, ease: "power2.out", immediateRender: false }, ${R(5.45)});
  tl.to("#bPlay", { scale: 1, duration: 0.2 }, ${R(6.0)});
  ${JSON.stringify([[6.0,0,0],[6.3,0,1],[6.6,0,2],[6.9,0,3],[7.25,1,3],[7.55,1,4],[7.85,1,5],[8.15,1,6],[8.5,2,6],[8.8,2,5],[9.1,2,4],[9.45,3,4],[9.75,3,5],[10.05,3,6],[10.4,4,6],[10.7,4,7],[11.0,4,8]].map(([t, r, c]) => [R(t), r, c]))}.forEach(([t, r, c]) => focusTile(t, r, c));
  // "ten minutes searching": the clock runs 9:00 → 9:10; "forty minutes later" → 9:50; then it creeps to 9:58
  const clk = { m: 0 }, clkEl = S("#bClockT"), clkSet = () => { clkEl.textContent = "9:" + String(Math.round(clk.m)).padStart(2, "0"); };
  inn("#bClock", ${R(7.4)}, { opacity: 0, y: -20 }, 0.4);
  tl.fromTo(clk, { m: 0 }, { m: 10, duration: 3.1, ease: "none", onUpdate: clkSet }, ${R(7.45)});
  tl.to(clk, { m: 50, duration: 2.0, ease: "power2.inOut", onUpdate: clkSet }, ${R(14.8)});
  tl.to(clk, { m: 58, duration: 4.8, ease: "power1.out", onUpdate: clkSet }, ${R(17.7)});
  tl.to("#bClock", { scale: 1.25, duration: 0.5, ease: "power2.out" }, ${R(17.75)});
  // "Then I remember Megan mentioned a show": the shows fall away, the phone rises into the centre
  // the TV stays behind the phone, smaller and faded
  tl.to("#bTV", { scale: 0.84, y: -16, opacity: 0.38, duration: 0.8, ease: "power2.inOut" }, ${R(11.2)});
  tl.fromTo("#bDim", { opacity: 0 }, { opacity: 0.25, duration: 0.7 }, ${R(11.2)});
  inn("#bPhone", ${R(11.3)}, { opacity: 0, y: 320, rotation: 8 }, 0.85, "back.out(1.2)");
  // "so I grab my phone to find it": the messages scroll down to Megan's thread
  const listMax = Math.max(0, S("#bList").offsetHeight - 700);
  tl.fromTo("#bList", { y: 0 }, { y: -listMax, duration: 1.9, ease: "sine.inOut" }, ${R(12.0)});
  tl.fromTo("#bMeg", { backgroundColor: "rgba(240,182,103,0)" }, { backgroundColor: "rgba(240,182,103,.25)", duration: 0.3 }, ${R(13.8)});
  // "and forty minutes later, I'm still scrolling": the feed
  tl.fromTo("#bFeed", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${FEED_AT});
  // the feed layer sits over the phone screen and follows the phone: same scale, same scene fade
  tl.set("#bFeedWrap", { scale: 1.12 }, ${B0});
  tl.fromTo("#bFeedWrap", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: false }, ${FEED_AT});
  tl.to("#bPhone, #bFeedWrap", { scale: 1.2, duration: 0.5, ease: "power2.inOut" }, ${R(19.75)});
  tl.to("#bFeedWrap", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${R(22.9)});
  tl.to("#bList", { opacity: 0, duration: 0.1 }, ${R(15.0)});
  // the captions change with the clip's own swipes
  const fsw = ${JSON.stringify(FEED_SWIPES.map((d) => R(FEED_REAL + d - 0.15)))};
  tl.set("#bMeta0", { opacity: 1, yPercent: 0 }, ${FEED_AT});
  fsw.forEach((t, i) => { tl.to("#bMeta" + i, { yPercent: -35, opacity: 0, duration: 0.25, ease: "power2.in" }, t); tl.fromTo("#bMeta" + (i + 1), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, t + 0.12); });
  // "Now there's no time for anything. So I scroll some more. Not exactly me time."
  words("#b2", ${R(17.75)});
  out("#b2", ${R(19.55)}, { opacity: 0, y: -16 }, 0.25);
  words("#b3", ${R(19.8)}, 0.05, 0.5);
  out("#b3", ${R(21.45)}, { opacity: 0, y: -16 }, 0.25);
  words("#b4", ${R(21.7)}, 0.06);

  // ---- D+E · Reveal → install → pairing → inbox, one continuous scene
  const FULL = { x: 248, y: -74, scale: 1.6271 }; // the TV's screen exactly covers the 1920×1080 frame
  tl.fromTo("#sE", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 20.85);
  tl.fromTo("#eReveal", { scale: 1 }, { scale: 1.05, duration: T(23.0) - T(20.85), ease: "none" }, 20.85);
  // "So now I use Recco": the logo lands with the line, no wait
  inn("#dLogo", ${R(23.3)}, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.6, "back.out(1.8)");
  // "It's an inbox for my TV that I text like a friend": the logo lifts, a phone and a small TV come in,
  // and three texts fly from the phone into the TV, each one landing as a card
  tl.to("#dLogo", { y: -330, scale: 0.6, duration: 0.6, ease: "power3.inOut" }, ${R(24.8)});
  tl.set("#rvC0, #rvC1, #rvC2", { opacity: 0 }, 0);
  inn("#rvPhoneWrap", ${R(25.15)}, { opacity: 0, y: 80 }, 0.6, "power3.out");
  inn("#rvTV", ${R(25.25)}, { opacity: 0, y: 80 }, 0.6, "power3.out");
  const rvSend = (mid, t) => {
    const msg = S("#" + mid), h = msg.firstElementChild.offsetHeight + 12;
    tl.fromTo(msg, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
    tl.fromTo(msg.firstElementChild, { scale: 0.7, transformOrigin: "100% 100%" }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" }, t);
  };
  ${JSON.stringify([0, 1, 2].map((i) => [R(25.55 + i * 0.5), R(25.75 + i * 0.5), R(26.2 + i * 0.5), 952 + i * 250 - 470, 642 - 787]))}.forEach(([send, fly, land, dx, dy], i) => {
    rvSend("rv" + (i + 1), send);
    tl.set("#rvF" + i, { opacity: 1, x: 0, y: 0, scale: 1 }, fly);
    tl.to("#rvF" + i, { x: dx, duration: 0.55, ease: "power1.in" }, fly);
    tl.to("#rvF" + i, { y: dy, duration: 0.55, ease: "power2.out" }, fly);
    tl.to("#rvF" + i, { scale: 0.5, opacity: 0, duration: 0.15, ease: "power1.in" }, land - 0.06);
    tl.fromTo("#rvC" + i, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)", immediateRender: false }, land);
  });
  // "It's an inbox for my TV that I text like a friend"
  words("#dSub", ${R(25.4)}, 0.05);
  tl.set("#eStage", { opacity: 0 }, 20.85);
  tl.to("#eStage", { opacity: 1, duration: 0.6 }, 23.4);
  // the TV is already here at full frame, see-through until the app page slides up inside it
  tl.set("#eTV", { ...FULL, backgroundColor: "rgba(10,12,12,0)" }, 20.85);
  tl.set("#eTV .tvglass", { backgroundColor: "rgba(0,0,0,0)", borderRadius: 0 }, 20.85);
  tl.set("#eStill, #eCode, #eIn", { opacity: 0 }, 20.85);
  tl.set("#eStore", { yPercent: 100 }, 20.85);
  tl.to("#eStore", { yPercent: 0, duration: 0.55, ease: "power3.out" }, 22.9);
  tl.to("#eReveal", { opacity: 0, duration: 0.3 }, 23.05);
  tl.set("#eStill", { opacity: 1 }, 23.2);
  // the frame shrinks into the TV; the room video behind gives way to the dark stage
  tl.set("#eTV", { backgroundColor: "#0a0c0c" }, 23.3);
  tl.set("#eTV .tvglass", { backgroundColor: "#000" }, 23.3);
  tl.to("#eTV", { x: 248, y: 0, scale: 1.12, duration: 0.8, ease: "power3.inOut" }, 23.3);
  tl.to("#eTV .tvglass", { borderRadius: 10, duration: 0.8 }, 23.3);
  tl.to("#vwD", { opacity: 0, duration: 0.6 }, 23.4); words("#eH1", 23.4);
  // Get → Installing → Open
  tl.fromTo("#eBtn", { scale: 1 }, { scale: 0.93, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out" }, 23.95);
  tl.to("#eGet", { opacity: 0, duration: 0.12 }, 24.05);
  tl.fromTo("#eInst", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 24.1);
  tl.fromTo("#eFill", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power1.inOut" }, 24.08);
  tl.to("#eInst, #eFill", { opacity: 0, duration: 0.12 }, 24.68);
  tl.fromTo("#eOpen", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 24.72);
  tl.fromTo("#eBtn", { scale: 1 }, { scale: 0.93, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, 24.88);
  // the app opens on its pairing screen; the TV slides left to make room for the phone
  tl.set("#eCode", { opacity: 1 }, 24.9);
  tl.to("#eStore", { opacity: 0, duration: 0.3 }, 25.0);
  tl.to("#eTV", { x: 0, scale: 1, duration: 0.7, ease: "power3.inOut" }, 25.0);
  inn("#ePhone", 25.15, { opacity: 0, y: 160, rotation: 6 }, 0.8, "back.out(1.3)");
  bob("#ePhone", 26.0, ${R(54.4)}, 10, 1.8);
  out("#eH1", 25.0, { opacity: 0, y: -14 }, 0.22); words("#eH2", 25.2, 0.05);
  spin("#eC-spin", 20.85, 27.0);
  [0, 1, 2, 3, 4].forEach((i) => inn("#eC-d" + i, 25.1 + i * 0.07, { opacity: 0, y: 30, scale: 0.9 }, 0.45, "back.out(1.6)"));
  tl.fromTo("#eCode .digit", { scale: 1 }, { scale: 1.1, duration: 0.16, yoyo: true, repeat: 1, stagger: 0.05, ease: "power2.out", immediateRender: false }, 25.8);
  type("ePhone", "m1", 25.45, 25.95, 26.05);
  // "to the Recco number"
  tl.to("#eC-num", { color: "#F0B667", duration: 0.2 }, 26.25);
  tl.fromTo("#eC-numline", { scale: 1 }, { scale: 1.14, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" }, 26.25);
  tl.to("#ePhone .ph-num", { color: "#F0B667", duration: 0.2 }, 26.25);
  tl.to("#ePhone .ph-num", { color: "#8e8e93", duration: 0.4 }, 27.3);
  // linked: the pairing screen gives way to the inbox
  tl.to("#eCode", { opacity: 0, duration: 0.35 }, 26.6);
  // "Now I can text it anything": the inbox opens, and stays open
  out("#eH2", 27.0, { opacity: 0, y: -14 }, 0.25); words("#eH3", 27.15);
  const COLW = 585.33, ROWH = 442, sx = (i) => (i % 3) * COLW, sy = (i) => Math.floor(i / 3) * ROWH;
  const order = ["bear", "sev", "past", "shrink", "dune", "lasso"];
  const X = (id) => "#eX-" + id;
  ["pDad", "slow", "pJill", "koq", "pSteph", "stack", "pLink", "fog", "pMeg", "will", "pRain", "rain"].forEach((id) => tl.set(X(id), { opacity: 0, x: 0, y: 0 }, 20.85));
  order.forEach((id, i) => tl.set(X(id), { opacity: 0, x: sx(i), y: sy(i) }, 20.85));
  tl.set("#eStore", { yPercent: 100 }, 25.4);
  tl.fromTo("#eIn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 26.6);
  order.forEach((id, i) => tl.fromTo(X(id), { opacity: 0, y: sy(i) + 60 }, { opacity: 1, y: sy(i), duration: 0.5, ease: "power3.out", immediateRender: false }, 26.7 + i * 0.06));
  // a text arrives: the loading card drops into the first slot and everything else slides over
  const insert = (pid, t) => {
    order.unshift(pid);
    order.forEach((id, i) => { if (i > 0) tl.to(X(id), { x: sx(i), y: sy(i), duration: 0.55, ease: "power3.inOut" }, t); });
    tl.set(X(pid), { zIndex: 3 }, t);
    tl.fromTo(X(pid), { opacity: 0, y: -90, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)", immediateRender: false }, t);
  };
  // the agent is done: the real card takes the loading card's slot, lights up, then settles
  const resolve = (pid, rid, t) => {
    const i = order.indexOf(pid); order[i] = rid;
    tl.set(X(rid), { x: sx(i), y: sy(i), zIndex: 6, outlineColor: "#E28A3B", backgroundColor: "rgba(18,28,30,.72)", boxShadow: "0 40px 90px rgba(0,0,0,.6)" }, t);
    tl.to(X(pid), { opacity: 0, duration: 0.25 }, t);
    tl.fromTo(X(rid), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1.06, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, t);
    tl.to(X(rid), { scale: 1, outlineColor: "rgba(226,138,59,0)", backgroundColor: "rgba(18,28,30,.8)", boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.4, ease: "power2.inOut" }, t + 0.9);
    tl.set(X(rid), { zIndex: 1 }, t + 1.3);
    tl.set(X(pid), { zIndex: 1 }, t + 0.3);
  };
  // Dad
  type("ePhone", "m2", 27.65, 28.2, 28.3);
  insert("pDad", 28.5); spin("#eX-pDad-spin", 28.5, 30.1); resolve("pDad", "slow", 29.95);
  // Jill
  out("#eH3", 30.6, { opacity: 0, y: -14 }, 0.25); words("#eH4", 30.8);
  type("ePhone", "m3", 30.85, 31.6, 31.75);
  insert("pJill", 31.95); spin("#eX-pJill-spin", 31.95, 33.4); resolve("pJill", "koq", 33.3);
  // Steph: a link, then her note
  out("#eH4", 34.05, { opacity: 0, y: -14 }, 0.25); words("#eH6", 34.2, 0.05);
  type("ePhone", "m4", 34.2, 34.65, 34.8);
  type("ePhone", "m5", 35.0, 35.3, 35.4);
  insert("pSteph", 35.6); spin("#eX-pSteph-spin", 35.6, 36.4); resolve("pSteph", "stack", 36.3);
  out("#eH6", 36.25, { opacity: 0, y: -14 }, 0.22); words("#eH5", 36.4, 0.07);
  tl.to("#eX-stack .fa", { rotation: -2, x: -30, duration: 0.5, ease: "back.out(2)" }, 36.8);
  tl.to("#eX-stack .fb", { rotation: -7, x: -60, duration: 0.5, ease: "back.out(2)" }, 36.8);
  tl.to("#eX-stack .fc", { rotation: 6, x: 30, duration: 0.5, ease: "back.out(2)" }, 36.8);
  tl.fromTo("#eX-stack .stackchip", { scale: 1 }, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 37.0);
  tl.to("#eX-stack .fa, #eX-stack .fb, #eX-stack .fc", { rotation: 0, x: 0, duration: 0.4, ease: "power2.inOut" }, 37.35);
  // "Texting is great because there's nothing to install. I can send it anything:"
  out("#eH5", ${R(45.7)}, { opacity: 0, y: -14 }, 0.25); words("#eH7", ${R(45.9)}, 0.05);
  tl.to("#ePhone", { scale: 1.1, duration: 0.6, ease: "power2.inOut" }, ${R(45.9)});
  tl.to("#eTV", { opacity: 0.55, duration: 0.6 }, ${R(45.9)});
  tl.to("#ePhone", { scale: 1, duration: 0.6, ease: "power2.inOut" }, ${R(48.55)});
  tl.to("#eTV", { opacity: 1, duration: 0.6 }, ${R(48.55)});
  out("#eH7", ${R(48.5)}, { opacity: 0, y: -14 }, 0.25); words("#eH8", ${R(48.7)});
  // "a link,"
  type("ePhone", "m6", ${R(49.35)}, ${R(49.85)}, ${R(49.95)});
  insert("pLink", ${R(50.1)}); spin("#eX-pLink-spin", ${R(50.1)}, ${R(51.3)}); resolve("pLink", "fog", ${R(51.15)});
  // "a friend's pick,"
  type("ePhone", "m7", ${R(50.55)}, ${R(51.3)}, ${R(51.4)});
  insert("pMeg", ${R(51.55)}); spin("#eX-pMeg-spin", ${R(51.55)}, ${R(52.7)}); resolve("pMeg", "will", ${R(52.55)});
  // "or 'movies for a rainy night.'"
  type("ePhone", "m8", ${R(52.0)}, ${R(52.55)}, ${R(52.65)});
  insert("pRain", ${R(52.8)}); spin("#eX-pRain-spin", ${R(52.8)}, ${R(54.1)}); resolve("pRain", "rain", ${R(53.95)});
  // "It just works."
  out("#eH8", ${R(53.85)}, { opacity: 0, y: -14 }, 0.25); words("#eH9", ${R(54.05)});
  // "So when it's me time": phone and captions clear, the TV fills the frame, the next scene continues it
  tl.to("#ePhone", { opacity: 0, y: 160, duration: 0.4, ease: "power2.in" }, ${R(54.6)});
  out("#eH9", ${R(54.65)}, { opacity: 0, y: -14 }, 0.3);
  tl.to("#eTV", { ...FULL, duration: 0.8, ease: "power3.inOut" }, ${R(54.7)});
  tl.to("#eTV .tvglass", { borderRadius: 0, duration: 0.8 }, ${R(54.7)});

  // ---- I · "So when it's me time, my phone stays off, and my inbox is full of reccos… tell Alexa which one"
  tl.set("#sI", { opacity: 1 }, ${R(55.5)});
  tl.to("#sI", { opacity: 0, scale: 0.985, duration: 0.3, ease: "power1.in" }, ${R(63.6)});
  tl.set("#iD-scrim, #iD-drawer", { opacity: 0 }, 0);
  focusCard("#iC0", ${R(56.0)});
  inn("#iDnd", ${R(56.45)}, { opacity: 0, y: 120 }, 0.5, "power3.out");
  tl.to("#iDndOff", { opacity: 1, duration: 0.35 }, ${R(57.0)});
  tl.fromTo("#iDndOff svg", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, ${R(57.1)});
  inn("#iDndLab", ${R(57.15)}, { opacity: 0, y: 10 }, 0.3);
  tl.to("#iDnd", { opacity: 0, y: 120, duration: 0.45, ease: "power2.in" }, ${R(58.3)});
  focusCard("#iC0", ${R(58.0)}, false); focusCard("#iC1", ${R(58.0)});
  focusCard("#iC1", ${R(58.8)}, false); focusCard("#iC2", ${R(58.8)});
  focusCard("#iC2", ${R(59.6)}, false); focusCard("#iC1", ${R(59.6)});
  tl.fromTo("#iD-scrim", { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, ${R(60.9)});
  tl.fromTo("#iD-drawer", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, ${R(60.9)});
  tl.fromTo("#iScale", { scale: 1 }, { scale: 1.05, duration: 2.7, ease: "sine.inOut", immediateRender: false }, ${R(60.9)});
  tl.fromTo("#iD-alexa", { backgroundColor: "rgba(255,255,255,.06)", scale: 1 }, { backgroundColor: "rgba(226,138,59,.28)", scale: 1.03, duration: 0.4, ease: "power2.out" }, ${R(62.25)});
  tl.fromTo("#iD-mic", { boxShadow: "0 0 0 0 rgba(226,138,59,.7)" }, { boxShadow: "0 0 0 18px rgba(226,138,59,0)", duration: 0.8, repeat: 2, ease: "power1.out" }, ${R(62.3)});

  // ---- K · Tagline (no voice): a short breath before part two
  tl.fromTo("#sK", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, ${R(63.7)});
  drift("sK", ${R(63.7)}, 48.95, 1.04);
  inn("#kLogo", ${R(63.8)}, { opacity: 0, scale: 0.75, rotation: -3, filter: "blur(8px)" }, 0.7, "back.out(1.7)");
  words(".tagrow", ${R(64.25)}, 0.07);
  words("#k4", ${R(64.95)}, 0.07);

  // ---- O · How it's built
  const V = (x) => ${VO2_AT} + x;
  const O0 = 48.95;
  // phone on the left and the TV app on the right, both centred on y 600; the steps run top-down between them
  const TVMID = { x: 948, y: -14, scale: 0.34 }, PHMID = { x: -58, y: -3, scale: 0.62 };
  tl.fromTo("#sO", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, O0);
  const edgeIn = (id, t, d = 0.45) => tl.fromTo(id, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" }, t);
  const flowOn = (i, t, until) => { tl.fromTo("#o-f" + i, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, t); tl.fromTo("#o-f" + i, { strokeDashoffset: 0 }, { strokeDashoffset: -48 * Math.round((T(until) - T(t)) * 2.2), duration: T(until) - T(t), ease: "none" }, t); };
  const OP = ${JSON.stringify(Object.fromEntries(Object.entries(OPTS).map(([k, [x, y]]) => [k, [x - 11, y - 11]])))};
  const APPEAR = { phone: 0, e0a: V(11.3), e0b: V(11.5), zernio: V(11.6), lambda: V(13.15), sqs: V(15.8), agent: V(19.9), ddb: V(35.05), appsync: V(36.45), e6a: V(37.25), e6b: V(37.45), tv: V(37.6) };
  const pk = (id, all, t, hop = 0.32) => { const keys = []; for (const [i, k] of all.entries()) { if (i > 0 && APPEAR[k] > t + (i - 1) * hop) break; keys.push(k); } tl.set(id, { opacity: 1 }, t); keys.forEach((k, i) => { const [x, y] = OP[k]; if (i === 0) tl.set(id, { x, y }, t); else tl.to(id, { x, y, duration: T(t + i * hop) - T(t + (i - 1) * hop), ease: "none" }, t + (i - 1) * hop); }); tl.to(id, { opacity: 0, duration: 0.15 }, t + (keys.length - 1) * hop); };
  const cap = (outH, inH, t) => { if (outH) out(outH, t, { opacity: 0, y: -14 }, 0.25); words(inH, t + 0.15, 0.05); };
  // a step settles in under the one before it, and takes the highlight
  const RING_ON = "0 0 0 3px rgba(226,138,59,.95), 0 24px 60px rgba(0,0,0,.4)", RING_OFF = "0 0 0 0px rgba(226,138,59,0), 0 24px 60px rgba(0,0,0,.4)";
  let lit = null;
  const nodeIn = (id, t) => {
    tl.fromTo(id, { opacity: 0, y: -18, scale: 0.96, boxShadow: RING_OFF }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, t);
    tl.fromTo(id + " .nic", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", immediateRender: false }, t + 0.12);
    light(id, t + 0.2);
  };
  const light = (id, t) => { if (lit) tl.to(lit, { boxShadow: RING_OFF, duration: 0.35 }, t); if (id) tl.to(id, { boxShadow: RING_ON, duration: 0.35 }, t); lit = id; };
  // everything the map will show starts hidden
  tl.set("#o-e0, #o-e1, #o-e2, #o-e3, #o-e4, #o-e5, #o-e6", { strokeDashoffset: 1 }, O0);
  tl.set(".node, #oLive, .obub, .obot, .qrow.small .qcard, .pchip, #o-lcheck, #o-aring, .awork span", { opacity: 0 }, O0);
  tl.set("#qb0, #qb1, #qb2, #qx", { opacity: 0 }, O0);

  // A · built for the hackathon: the big TV shows the TV app's own code, which builds and launches
  tl.set("#oTV", { x: 248, y: 0, scale: 1.12 }, O0);
  tl.fromTo("#oTV", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", immediateRender: false }, O0);
  tl.fromTo("#oTV", { scale: 1.12 }, { scale: 1.17, duration: T(V(5.4)) - T(O0 + 0.6), ease: "sine.inOut", immediateRender: false }, O0 + 0.6);
  tl.set("#oIn, #oCode", { opacity: 0 }, O0);
  tl.set("#oC-d0, #oC-d1, #oC-d2, #oC-d3, #oC-d4", { opacity: 0 }, O0);
  ${JSON.stringify(CODE.map((l) => l.length > 0))}.forEach((has, i) => { tl.fromTo("#oV" + i, { scaleX: 1 }, { scaleX: 0, duration: has ? 0.14 : 0.01, ease: "none" }, O0 + 0.35 + i * 0.105); });
  cap(null, "#oH0", O0 + 0.05);
  tl.fromTo("#oSticker", { opacity: 0, scale: 0.6, rotation: -20 }, { opacity: 1, scale: 1, rotation: -7, duration: 0.55, ease: "back.out(1.7)" }, V(0.9));
  // "React Native for Vega": the imports light up
  cap("#oH0", "#oH1", V(2.75));
  tl.fromTo("#oL1, #oL2", { backgroundColor: "rgba(240,182,103,0)" }, { backgroundColor: "rgba(240,182,103,.2)", duration: 0.35, stagger: 0.15 }, V(3.4));
  inn("#oChip", V(4.07), { opacity: 0, y: 20, scale: 0.9 }, 0.45, "back.out(1.7)");
  // build, then launch
  tl.to("#oT0", { opacity: 1, duration: 0.15 }, V(4.3));
  tl.to("#oT1", { opacity: 1, duration: 0.15 }, V(4.75));
  tl.to("#oT2", { opacity: 1, duration: 0.15 }, V(5.05));
  cap("#oH1", "#oH2", V(5.2));
  tl.to("#oEd", { opacity: 0, scale: 1.05, duration: 0.4, ease: "power2.in" }, V(5.45));
  tl.fromTo("#oCode", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, V(5.6));
  const ocCol = S("#oCode .center-col"), ocLogo = ocCol.querySelector("img"), ocRest = [...ocCol.children].filter((e) => e !== ocLogo && !e.querySelector(".digit"));
  const ocDy = 540 - (ocLogo.offsetTop + ocLogo.offsetHeight / 2);
  tl.set(ocLogo, { y: ocDy, scale: 1.6 }, O0);
  tl.set(ocRest, { opacity: 0, y: 24 }, O0);
  tl.to(ocLogo, { y: 0, scale: 1, duration: 0.6, ease: "power3.inOut" }, V(6.2));
  tl.to(ocRest, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }, V(6.45));
  spin("#oC-spin", V(5.6), V(10.4));
  [0, 1, 2, 3, 4].forEach((i) => tl.fromTo("#oC-d" + i, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)", immediateRender: false }, V(6.67) + i * 0.1));
  // the TV slides right, the phone texts the code from the left, a line links them, the inbox opens
  tl.to("#oTV", { x: 486, scale: 1, duration: 0.7, ease: "power3.inOut" }, V(7.2));
  tl.to("#oChip, #oSticker", { opacity: 0, y: -10, duration: 0.3 }, V(7.2));
  inn("#oPhone", V(7.45), { opacity: 0, y: 160, rotation: -6 }, 0.7, "back.out(1.3)");
  cap("#oH2", "#oH3", V(7.55));
  type("oPhone", "o1", V(8.1), V(8.7), V(8.85));
  tl.fromTo("#oLink", { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, V(9.2));
  tl.fromTo("#oDot", { x: 0 }, { x: 96, duration: 0.6, ease: "power2.inOut" }, V(9.2));
  const OCOLW = 585.33, OROWH = 442, osx = (i) => (i % 3) * OCOLW, osy = (i) => Math.floor(i / 3) * OROWH;
  const oorder = ["koq", "slow", "bear", "sev", "past", "shrink", "dune", "lasso"], OX = (id) => "#oX-" + id;
  ["pNew", "stack"].forEach((id) => tl.set(OX(id), { opacity: 0, x: 0, y: 0 }, O0));
  oorder.forEach((id, i) => tl.set(OX(id), { opacity: 0, x: osx(i), y: osy(i) }, O0));
  tl.to("#oCode", { opacity: 0, duration: 0.35 }, V(9.95));
  tl.fromTo("#oIn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, V(9.95));
  oorder.forEach((id, i) => tl.fromTo(OX(id), { opacity: 0, y: osy(i) + 60 }, { opacity: 1, y: osy(i), duration: 0.5, ease: "power3.out", immediateRender: false }, V(10.0) + i * 0.05));
  tl.to("#oLink", { opacity: 0, duration: 0.3 }, V(10.55));

  // B · phone left, TV app right; the steps come in top-down between them
  cap("#oH3", "#oH4", V(10.7));
  tl.to("#oTV", { ...TVMID, duration: 0.9, ease: "power3.inOut" }, V(10.7));
  tl.to("#oPhone", { ...PHMID, duration: 0.9, ease: "power3.inOut" }, V(10.7));
  tl.set("#oX-dune, #oX-lasso, #oCards .av + .av", { opacity: 0 }, V(10.95));
  tl.set("#oX-dune, #oX-lasso, #oX-shrink, #oCards .av + .av", { opacity: 1 }, V(40.95));
  edgeIn("#o-e0", V(11.3), 0.6); nodeIn("#o-zernio", V(11.6));
  cap("#oH4", "#oH5", V(12.4));
  edgeIn("#o-e1", V(12.95), 0.3); nodeIn("#o-lambda", V(13.15));
  inn("#o-lcheck", V(13.7), { opacity: 0, scale: 0.5 }, 0.35, "back.out(1.6)");
  edgeIn("#o-e2", V(15.6), 0.3); nodeIn("#o-sqs", V(15.8));
  const row1 = ["phone", "e0a", "e0b", "zernio", "lambda", "sqs"];
  [V(12.0), V(14.2), V(15.3), V(16.5), V(17.6), V(18.7)].forEach((t, i) => pk("#o-pk" + i, row1, t));
  flowOn(0, V(13.9), V(41.0)); flowOn(1, V(14.0), V(41.0)); flowOn(2, V(16.4), V(41.0));
  // "updates in real time": a card lands on the TV app
  cap("#oH5", "#oH6", V(17.5));
  light(null, V(17.5));
  oorder.unshift("pNew");
  oorder.forEach((id, i) => { if (i > 0) tl.to(OX(id), { x: osx(i), y: osy(i), duration: 0.5, ease: "power3.inOut" }, V(17.9)); });
  tl.fromTo(OX("pNew"), { opacity: 0, y: -90, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, V(17.9));
  spin("#oX-pNew-spin", V(17.9), V(19.0));
  inn("#oLive", V(18.3), { opacity: 0, scale: 0.6 }, 0.35, "back.out(1.6)");
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.8, repeat: 1, ease: "power1.out" }, V(18.4));
  tl.set("#oX-shrink", { opacity: 0 }, V(18.5));
  oorder[0] = "stack";
  tl.set(OX("stack"), { x: 0, y: 0, zIndex: 6 }, V(18.75));
  tl.to(OX("pNew"), { opacity: 0, duration: 0.25 }, V(18.75));
  tl.fromTo(OX("stack"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, V(18.75));
  // C · the agent, under the queue
  cap("#oH6", "#oH7", V(19.35));
  edgeIn("#o-e3", V(19.7), 0.3); nodeIn("#o-agent", V(19.9));
  cap("#oH7", "#oH8", V(22.1));
  // a name, a link, a search: they leave the phone and drop into the agent
  [["#oIn0", V(22.63), 650], ["#oIn1", V(23.43), 726], ["#oIn2", V(23.97), 802]].forEach(([id, t, top]) => {
    inn(id, t, { opacity: 0, x: -30 }, 0.4, "power3.out");
    tl.to(id, { x: ${NCX} - 410 - 150, y: ${NCY(3)} - top - 26, scale: 0.2, opacity: 0, duration: 0.6, ease: "power2.in" }, t + 0.55);
  });
  const AW0 = V(22.6), AW1 = V(30.6);
  tl.to("#o-agent", { scale: 1.1, duration: 0.5, ease: "power2.out" }, AW0);
  tl.to("#o-agent", { scale: 1, duration: 0.5, ease: "power2.inOut" }, AW1);
  tl.to("#o-aring", { opacity: 1, duration: 0.3 }, AW0);
  tl.to("#o-aring", { opacity: 0, duration: 0.3 }, AW1);
  spin("#o-aring", AW0, AW1 + 0.3);
  tl.to("#o-agent .nic svg", { opacity: 0, scale: 0.6, duration: 0.2 }, AW0);
  tl.to("#o-agent .nic svg", { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.8)" }, AW1);
  tl.to("#o-agent .ns", { opacity: 0, duration: 0.2 }, AW0);
  [[V(22.6), V(25.0)], [V(25.0), V(28.0)], [V(28.0), V(30.6)]].forEach(([a, b], i) => { tl.fromTo("#o-aw" + i, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, immediateRender: false }, a + 0.05); tl.to("#o-aw" + i, { opacity: 0, y: -8, duration: 0.2 }, b - 0.2); });
  tl.to("#o-agent .ns", { opacity: 1, duration: 0.25 }, AW1);
  cap("#oH8", "#oH9", V(26.45));
  // the friend, the titles, the links come out of it to the right
  [["#oOut0", V(27.23), 610], ["#oOut1", V(27.78), 850], ["#oOut2", V(28.49), 1090]].forEach(([id, t, left]) => {
    inn(id, t, { opacity: 0, x: ${NCX} - left - 110, y: -70, scale: 0.6 }, 0.6, "power3.out");
    tl.fromTo(id + " .oic", { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.25);
  });
  // D · checked in OMDb, right beside the agent
  cap("#oH9", "#oH10", V(31.05));
  tl.to(".obot", { opacity: 0, y: 16, duration: 0.3 }, V(31.0));
  [0, 1, 2, 3].forEach((i) => inn("#q" + i, V(31.3) + i * 0.12, { opacity: 0, y: -40, scale: 0.9 }, 0.5, "power3.out"));
  [0, 1, 2].forEach((i) => { const t = V(32.2) + i * 0.25; inn("#qb" + i, t, { opacity: 0, scale: 0.6 }, 0.35, "back.out(1.6)"); tl.fromTo("#q" + i + " .qp", { scale: 1 }, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, t); });
  inn("#qx", V(33.7), { opacity: 0, scale: 0.7 }, 0.35, "back.out(1.6)");
  tl.fromTo("#q3 .qp", { x: 0 }, { x: -8, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut" }, V(33.75));
  tl.to("#q3", { opacity: 0.45, duration: 0.4 }, V(34.2));
  // E · saved, then pushed out to the TV app on the right
  cap("#oH10", "#oH11", V(34.85));
  tl.to(".qrow.small .qcard", { opacity: 0, y: 16, duration: 0.3 }, V(34.8));
  edgeIn("#o-e4", V(34.9), 0.3); nodeIn("#o-ddb", V(35.05));
  cap("#oH11", "#oH12", V(36.3));
  edgeIn("#o-e5", V(36.3), 0.3); nodeIn("#o-appsync", V(36.45));
  edgeIn("#o-e6", V(37.0), 0.6);
  const row2 = ["sqs", "agent", "ddb", "appsync", "e6a", "e6b", "tv"];
  [V(36.95), V(37.9), V(38.85)].forEach((t, i) => pk("#o-pk" + (5 + i), row2, t));
  flowOn(3, V(37.2), V(41.0)); flowOn(4, V(37.3), V(41.0)); flowOn(5, V(37.4), V(41.0)); flowOn(6, V(37.6), V(41.0));
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.7, repeat: 1, ease: "power1.out", immediateRender: false }, V(38.9));
  // F · private by design: the map steps back, the two promises come forward
  cap("#oH12", "#oH13", V(38.85));
  light(null, V(38.85));
  tl.to("#oScrim", { opacity: 1, duration: 0.5, ease: "power2.out" }, V(38.85));
  inn("#rP0", V(39.0), { opacity: 0, y: 40, scale: 0.97 }, 0.55, "power3.out");
  pop("#rP0 .pic", V(39.15));
  const scramble = ["+1 (604) 555-0189", "+1 (6#4) 5$5-0%89", "+7 f6#a 9!5-c2?9", "7f3a·9c2!·e#b4", "7f3a·9c21·e0b4"], numEl = S("#rNum"), sc = { p: 0 };
  tl.fromTo(sc, { p: 0 }, { p: 1, duration: 0.7, ease: "none", onUpdate: () => { numEl.textContent = scramble[Math.min(scramble.length - 1, Math.floor(sc.p * scramble.length))]; } }, V(39.6));
  cap("#oH13", "#oH14", V(40.3));
  inn("#rP1", V(40.45), { opacity: 0, y: 40, scale: 0.97 }, 0.55, "power3.out");
  pop("#rP1 .pic", V(40.6));
  tl.to("#rLast", { opacity: 0, x: 20, duration: 0.4 }, V(41.3));
  // a slow camera follows the active step; it is back to neutral before the TV hands off to the seasons
  // (vertical moves stay small so the top step never slides under the captions)
  const CAM = [[V(11.3), 1.04, 0, 30, 1.4], [V(15.6), 1.04, 0, 0, 1.2], [V(17.6), 1.05, -50, 10, 1.2], [V(19.6), 1.06, 0, -15, 1.4], [V(26.3), 1.05, 0, -22, 1.4], [V(31.0), 1.04, 0, -25, 1.0], [V(34.7), 1.04, 0, -25, 1.2], [V(36.9), 1.04, -40, -10, 1.2], [V(38.6), 1, 0, 0, 0.9]];
  tl.set("#sO-cam", { transformOrigin: "960px 540px" }, O0);
  tl.set("#sO .capblock", { transformOrigin: "850px 470px" }, O0);
  CAM.forEach(([t, sc, x, y, d]) => {
    tl.to("#sO-cam", { scale: sc, x, y, duration: d, ease: "sine.inOut" }, t);
    tl.to("#sO .capblock", { scale: 1 / sc, x: -x / sc, y: -y / sc, duration: d, ease: "sine.inOut" }, t);
  });
  // "so you can text it anything": the phone fills with texts of every kind
  [V(28.8), V(29.15), V(29.5), V(29.85)].forEach((t, i) => {
    const msg = S("#o" + (i + 2)), h = msg.firstElementChild.offsetHeight + 12;
    tl.fromTo(msg, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
    tl.fromTo(msg.firstElementChild, { scale: 0.7, transformOrigin: "100% 100%" }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" }, t);
  });
  // each title is scanned before its badge lands; the made-up one scans red
  [0, 1, 2].forEach((i) => tl.fromTo("#qs" + i, { y: -70, opacity: 1 }, { y: 200, opacity: 1, duration: 0.45, ease: "power1.inOut" }, V(31.85) + i * 0.25));
  [0, 1, 2].forEach((i) => tl.to("#qs" + i, { opacity: 0, duration: 0.1 }, V(32.2) + i * 0.25));
  tl.fromTo("#qs3", { y: -70, opacity: 1 }, { y: 200, opacity: 1, duration: 0.45, ease: "power1.inOut" }, V(33.35));
  tl.to("#qs3", { opacity: 0, duration: 0.1 }, V(33.7));
  // the agent's results float while the voice explains them
  [["#oOut0", V(27.9)], ["#oOut1", V(28.4)], ["#oOut2", V(29.1)]].forEach(([id, t], i) => bob(id, t, V(30.9), 5, 0.8 + i * 0.07));
  // into the inbox: the map clears and the TV app grows to fill the frame; the seasons continue it
  tl.to(".node, .edges, #oPhone, .privacy, #oLive, #oH14, #oScrim", { opacity: 0, duration: 0.4 }, V(41.0));
  tl.to("#oTV", { x: 248, y: -86, scale: 1380 / 1180, duration: 0.9, ease: "power3.inOut" }, V(41.0));
  tl.to("#sO .stage", { opacity: 0, duration: 0.8, ease: "power1.inOut" }, V(41.0));

  // ---- S · the seasons, slowly, then the logo
  tl.set("#sS", { opacity: 1 }, 90.96);
  ${JSON.stringify(seasonVidIds)}.forEach((id, i) => { if (i > 0) tl.fromTo("#" + id, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, ${JSON.stringify(vS.map((v) => v[1]))}[i] + 0.05); });
  const seasonT = ${JSON.stringify(seasonT)};
  const focusCols = ${JSON.stringify(seasonOrder.map((t) => THEMES[t].focus))};
  // focus walks the cards: the focused card lifts and takes the theme's focus outline in every season's copy
  const SOFF = { scale: 1, outlineColor: "rgba(0,0,0,0)", boxShadow: "0 0 0 rgba(0,0,0,0)", zIndex: 1, duration: 0.25, ease: "power2.out" };
  let prev = 0;
  [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1], [0, 0], [1, 0], [2, 0]].forEach(([c, r], j) => {
    const t = 91.3 + j * 0.9, k = r * 3 + c + 1;
    focusCols.forEach((col, i) => {
      if (prev) tl.to("#sScr" + i + " .grid .card:nth-child(" + prev + ")", { ...SOFF }, t);
      tl.to("#sScr" + i + " .grid .card:nth-child(" + k + ")", { scale: 1.06, outlineColor: col, boxShadow: "0 34px 80px rgba(0,0,0,.55)", zIndex: 5, duration: 0.25, ease: "power2.out" }, t);
    });
    prev = k;
  });
  [1, 2, 3, 4, 5].forEach((i) => { tl.fromTo("#sScr" + i, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, seasonT[i]); tl.to("#sScr" + (i - 1), { opacity: 0, duration: 0.5, ease: "power1.inOut" }, seasonT[i]); });
  tl.fromTo("#uEnd", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.inOut" }, 98.6);
  inn("#uEnd .endlogo", 98.85, { opacity: 0, scale: 0.75, rotation: -3, filter: "blur(8px)" }, 0.7, "back.out(1.7)");
}

document.fonts.ready.then(() => {
  build();
  master.seek(0);
  window.__timelines["main"] = master;
  if (window.__hfForceTimelineRebind) window.__hfForceTimelineRebind();
});
`;

// ---------------------------------------------------------------- CSS
const css = `
@font-face { font-family: "Inter"; src: url(assets/fonts/Inter-normal.woff2) format("woff2"); font-weight: 100 900; font-style: normal; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; background: #141c1c; }
#root { width: 100%; height: 100%; position: relative; overflow: hidden; font-family: "Inter", sans-serif; color: #FFF6E8; background: #141c1c; }
.cam { position: absolute; inset: 0; }
.w { display: inline-block; overflow: hidden; vertical-align: top; padding: 0.1em 0.08em 0.18em; margin: -0.1em -0.08em -0.18em; }
.wi { display: inline-block; transform-origin: 0% 100%; }
.stage { position: absolute; inset: 0; background: #0d1626 url(assets/bg/stage-winter.jpg) center / cover; }
.stagev { position: absolute; inset: 0; background: url(assets/bg/vignette-winterNight.png) 0 0 / 100% 100%; }
.dlabel { position: absolute; width: 240px; margin-left: -120px; text-align: center; font-size: 24px; font-weight: 600; color: #C4CAC0; }
.obub { position: absolute; left: 410px; opacity: 0; font-size: 24px; padding: 12px 18px; border-radius: 22px 22px 6px 22px; max-width: 360px; white-space: nowrap; }
#oIn0 { top: 650px; } #oIn1 { top: 726px; } #oIn2 { top: 802px; }
.obot { position: absolute; top: 760px; width: 220px; padding: 14px 18px; gap: 14px; border-radius: 20px; opacity: 0; }
.obot .oic { width: 44px; height: 44px; border-radius: 12px; }
.obot .ok { font-size: 14px; } .obot .ov { font-size: 22px; white-space: nowrap; }
.qrow.small { left: 610px; right: auto; top: 734px; width: 700px; gap: 22px; justify-content: center; }
.qrow.small .qcard { width: 128px; gap: 2px; }
.qrow.small .qp { width: 128px; height: 192px; border-radius: 12px; box-shadow: 0 18px 40px rgba(0,0,0,.45); }
.qrow.small .qp.ghost span { font-size: 80px; }
.qrow.small .qt { font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.qrow.small .qm { font-size: 13px; }
.qp { overflow: hidden; }
.qscan { position: absolute; left: 0; right: 0; top: 0; height: 70px; background: linear-gradient(180deg, rgba(240,182,103,0), rgba(240,182,103,.65) 50%, rgba(240,182,103,0)); opacity: 0; }
.qscan.bad { background: linear-gradient(180deg, rgba(200,87,47,0), rgba(200,87,47,.7) 50%, rgba(200,87,47,0)); }
.oscrim { position: absolute; inset: 0; z-index: 5; background: rgba(12,16,16,.78); opacity: 0; }
.hsticker { position: absolute; left: 226px; top: 196px; z-index: 6; padding: 14px 26px; border-radius: 16px; background: #F0B667; color: #1D1410; font-size: 28px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; box-shadow: 0 18px 40px rgba(0,0,0,.45); transform: rotate(-7deg); opacity: 0; }
.ide { position: absolute; inset: 0; background: #0f1516; font-family: Menlo, "SF Mono", monospace; color: #DCE3DF; }
.ide-bar { position: absolute; left: 0; right: 0; top: 0; height: 70px; display: flex; align-items: center; gap: 12px; padding-left: 28px; background: #0a0f10; border-bottom: 1px solid #1f2a2b; }
.ide-dot { width: 18px; height: 18px; border-radius: 50%; background: #2e3a3b; }
.ide-dot:first-child { background: #C8572F; } .ide-dot:nth-child(2) { background: #F0B667; } .ide-dot:nth-child(3) { background: #6FA86A; margin-right: 30px; }
.ide-tab { height: 70px; display: flex; align-items: center; padding: 0 28px; font-size: 24px; color: #7d8a87; border-right: 1px solid #1f2a2b; }
.ide-tab.on { color: #FFF6E8; background: #0f1516; box-shadow: inset 0 3px 0 #E28A3B; }
.ide-side { position: absolute; left: 0; top: 70px; bottom: 0; width: 330px; padding: 26px 0; background: #0b1112; border-right: 1px solid #1f2a2b; font-size: 22px; color: #8b9794; }
.ide-proj { padding: 0 26px 18px; font-size: 18px; letter-spacing: .1em; color: #5f6c69; }
.ide-f { padding: 7px 26px; white-space: nowrap; } .ide-f.on { color: #FFF6E8; background: rgba(226,138,59,.16); }
.ide-code { position: absolute; left: 330px; right: 0; top: 92px; font-size: 27px; line-height: 37px; white-space: nowrap; }
.cl { position: relative; display: flex; padding-right: 30px; }
.cv { position: absolute; left: 86px; top: 0; bottom: 0; right: -40px; background: #0f1516; transform-origin: 100% 50%; }
.cl .ln { width: 86px; flex: none; text-align: right; padding-right: 28px; color: #6f7d7a; }
.cl b { font-weight: 400; color: #E28A3B; } .cl s { text-decoration: none; color: #A9CF8A; } .cl em { font-style: normal; color: #6b7a77; } .cl u { text-decoration: none; color: #8FBDE8; } .cl i { font-style: normal; color: #F0B667; }
.cl.rn { border-radius: 6px; }
.ide-term { position: absolute; left: 330px; right: 0; bottom: 0; height: 196px; padding: 18px 30px; background: #0a0f10; border-top: 1px solid #1f2a2b; font-size: 24px; line-height: 40px; }
.ide-th { font-size: 16px; letter-spacing: .12em; color: #5f6c69; line-height: 26px; margin-bottom: 4px; }
.tl { opacity: 0; white-space: nowrap; } .tp { color: #6FA86A; } .tok { color: #6FA86A; font-weight: 700; }
.qrow.small .qbadge { left: 8px; bottom: 8px; font-size: 14px; padding: 4px 9px 4px 7px; gap: 5px; }
.qrow.small .qx { left: 8px; right: 8px; bottom: 8px; font-size: 13px; padding: 5px 6px; gap: 5px; }
.flow { fill: none; stroke: #FFF6E8; stroke-width: 4; stroke-dasharray: 10 14; stroke-linecap: round; opacity: 0; }
.halo { position: absolute; inset: 70px; border-radius: 50%; box-shadow: 0 0 140px 40px rgba(226,138,59,.32); }
.qtyped i { font-style: normal; }
.sring { position: absolute; left: 96px; top: 168px; width: 557px; height: 414px; border-radius: 20px; border: 4px solid #F0B667; box-shadow: 0 0 0 1px rgba(0,0,0,.2), 0 30px 80px rgba(0,0,0,.35); z-index: 6; pointer-events: none; }
.vwrap { position: absolute; inset: 0; z-index: 0; transform-origin: 60% 50%; }
.bgs { position: absolute; inset: 0; background-size: cover; background-position: center; }
.bgv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.scene { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
.still { position: absolute; inset: 0; background-size: cover; background-position: center; }

/* story type */
.storycol { position: absolute; left: 140px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: 6px; max-width: 1100px; }
.line { font-family: "Inter", sans-serif; font-weight: 700; font-size: 88px; line-height: 1.08; letter-spacing: -.035em; color: #FFF6E8; text-shadow: 0 4px 40px rgba(0,0,0,.35); }
.line.big { font-size: 150px; }
.line.accent { color: #F0B667; }
.shade-left { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 90% at 15% 55%, rgba(16,22,22,.82), rgba(16,22,22,.35) 60%, rgba(16,22,22,.1)); }
.items { position: absolute; left: 140px; right: 140px; top: 250px; display: flex; gap: 36px; }
.item .iic img { width: 300px; height: 300px; object-fit: contain; display: block; filter: drop-shadow(0 24px 40px rgba(0,0,0,.5)); }
.item { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; opacity: 0; }
.ilab { font-family: "Inter", sans-serif; font-size: 40px; font-weight: 600; color: #FFF6E8; letter-spacing: -.01em; }

/* browse */
.browse { position: absolute; inset: 0; background: #0d1112; overflow: hidden; }
.bgrid { position: absolute; left: 120px; top: 70px; display: flex; flex-direction: column; gap: 70px; }
.brow { display: flex; flex-direction: column; gap: 18px; }
.blabel { font-size: 30px; font-weight: 600; color: rgba(255,255,255,.75); }
.btiles { display: flex; gap: 22px; }
.btile { width: 240px; height: 360px; border-radius: 14px; background-size: cover; background-position: center; flex: none; filter: saturate(.55) brightness(.7); }
.bfocus { position: absolute; left: 0; top: 54px; width: 240px; height: 360px; border-radius: 14px; background-size: cover; background-position: center; box-shadow: 0 0 0 5px rgba(255,255,255,.92), 0 0 0 10px rgba(0,0,0,.35), 0 34px 70px rgba(0,0,0,.65); opacity: 0; }
.bshade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,10,11,.92), rgba(8,10,11,.7) 34%, rgba(8,10,11,0) 62%); opacity: 0; }
.bplan { position: absolute; left: 120px; bottom: 120px; font-family: "Inter", sans-serif; font-size: 96px; font-weight: 700; letter-spacing: -.035em; color: #F0B667; text-shadow: 0 4px 40px rgba(0,0,0,.5); opacity: 0; }
.bshade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10,12,13,.9) 0%, rgba(10,12,13,.62) 30%, rgba(10,12,13,0) 58%); }
.clock { position: absolute; top: 46px; right: 110px; display: flex; align-items: baseline; gap: 10px; padding: 14px 30px; border-radius: 999px; background: rgba(18,28,30,.85); border: 1px solid rgba(255,246,232,.25); font-size: 54px; font-weight: 700; font-variant-numeric: tabular-nums; transform-origin: 100% 0; }
.clock small { font-size: 26px; font-weight: 600; color: #C4CAC0; }
.bcap { position: absolute; left: 120px; top: 0; bottom: 0; width: 600px; }
.bcap .line { position: absolute; left: 0; top: 420px; width: 600px; font-size: 64px; line-height: 1.1; opacity: 0; }
.bphone { position: absolute; left: 760px; top: 130px; width: 400px; height: 820px; border-radius: 60px; background: #0b0b0c; padding: 14px; box-shadow: 0 40px 100px rgba(0,0,0,.6), inset 0 0 0 2px #2a2a2c; }
.bphone .ph-status { position: relative; z-index: 3; background: #000; }
.mview { position: absolute; left: 0; right: 0; top: 52px; bottom: 0; overflow: hidden; }
.mscroll { position: absolute; left: 0; right: 0; top: 0; }
.bdim { position: absolute; inset: 0; background: #0a0c0d; opacity: 0; }
.bstage { position: absolute; inset: 0; background: radial-gradient(ellipse 75% 70% at 50% 55%, rgba(6,10,18,.35), rgba(6,10,18,.72)); }
.sapp { position: absolute; inset: 0; background: #0b0d11; overflow: hidden; font-family: "Inter", sans-serif; color: #fff; }
.spage { position: absolute; left: 0; top: 0; width: 1920px; }
.shero { position: absolute; left: 0; top: 0; width: 1920px; height: 860px; }
.sheroimg { position: absolute; right: 0; top: 0; width: 1240px; height: 821px; background-size: cover; background-position: center; }
.sherofade { position: absolute; inset: 0; background: linear-gradient(90deg, #0b0d11 34%, rgba(11,13,17,.75) 50%, rgba(11,13,17,0) 75%), linear-gradient(0deg, #0b0d11 4%, rgba(11,13,17,0) 40%); }
.sheroinfo { position: absolute; left: 90px; top: 190px; width: 760px; }
.skick { font-size: 22px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #F0B667; }
.stitle { font-size: 88px; font-weight: 800; letter-spacing: -.035em; line-height: 1; margin-top: 16px; white-space: nowrap; }
.smeta { display: flex; align-items: center; gap: 14px; font-size: 26px; color: #c9ced6; margin-top: 22px; }
.sbadge { font-size: 17px; font-weight: 800; padding: 3px 8px; border-radius: 6px; border: 2px solid #c9ced6; }
.sdesc { font-size: 26px; line-height: 1.4; color: #dfe3ea; margin-top: 18px; }
.sbtns { display: flex; gap: 18px; margin-top: 30px; }
.sbtn { padding: 16px 34px; border-radius: 10px; font-size: 28px; font-weight: 700; background: rgba(255,255,255,.18); color: #fff; }
.sbtn.ghost { background: rgba(255,255,255,.1); }
.srow { position: absolute; left: ${SX0}px; right: 0; height: ${SROWH}px; }
.slabel { font-size: 30px; font-weight: 700; margin-bottom: 16px; }
.stiles { position: relative; height: ${STH}px; }
.stile { position: absolute; top: 0; width: ${STW}px; height: ${STH}px; border-radius: 12px; background-size: cover; background-position: center; box-shadow: 0 0 0 0 rgba(255,255,255,0); }
.stile i { position: absolute; left: 12px; bottom: 12px; height: 6px; border-radius: 3px; background: #E28A3B; }
.snav { position: absolute; left: 0; right: 0; top: 0; height: 120px; display: flex; align-items: center; gap: 44px; padding: 0 90px; font-size: 28px; font-weight: 600; color: #aab1bc; background: linear-gradient(180deg, rgba(11,13,17,.9), rgba(11,13,17,0)); }
.snav .on { color: #fff; }
.snav .sgap { flex: 1; }
.slogo { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #E28A3B, #C8572F); }
.sprof { width: 48px; height: 48px; border-radius: 50%; background: #8FBDE8; color: #10233A; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }
.feed { position: absolute; inset: 0; z-index: 2; background: #000; overflow: hidden; opacity: 0; }
.feedwrap { position: absolute; left: 774px; top: 196px; width: 372px; height: 740px; z-index: 10; overflow: hidden; border-radius: 0 0 48px 48px; background: #000; color: #fff; font-family: "Inter", sans-serif; transform-origin: 186px 344px; opacity: 0; }
.fvid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fpost { position: absolute; inset: 0; opacity: 0; }
.fgrad { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75) 100%); }
.fact { position: absolute; right: 14px; bottom: 170px; display: flex; flex-direction: column; gap: 22px; align-items: center; font-size: 15px; font-weight: 600; color: #fff; text-align: center; }
.fact > div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.fic { font-size: 34px; line-height: 1; display: block; }
.fmeta { position: absolute; left: 18px; right: 80px; bottom: 44px; color: #fff; }
.fwho { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; }
.fav { width: 34px; height: 34px; border-radius: 50%; background: #E28A3B; color: #1D1410; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.fcap { font-size: 19px; line-height: 1.3; margin-top: 8px; }
.ftabs { position: absolute; left: 0; right: 0; top: 14px; display: flex; justify-content: center; gap: 22px; font-size: 19px; color: rgba(255,255,255,.7); font-weight: 600; }
.ftabs b { color: #fff; border-bottom: 3px solid #fff; padding-bottom: 4px; }
.chat { position: absolute; inset: 0; }
.chatcol { position: absolute; left: 50%; top: 0; bottom: 0; width: 1040px; margin-left: -520px; }
.crow { position: absolute; left: 0; top: 0; width: 1040px; height: 132px; display: flex; align-items: center; gap: 18px; opacity: 0; }
.chat .fbav { width: 48px; height: 48px; font-size: 22px; }
.chat .fbt { display: inline-block; font-size: 30px; max-width: 760px; padding: 12px 20px; white-space: nowrap; }
.chat .fbn { font-size: 19px; margin: 0 0 4px 8px; }
.cmsg { flex: 1; min-width: 0; }
.cslot { position: relative; width: 158px; height: 132px; flex: none; }
.cposter { position: absolute; left: 36px; top: 0; width: 88px; height: 132px; border-radius: 12px; background-size: cover; background-position: center; box-shadow: 0 18px 40px rgba(0,0,0,.55); border: 1px solid rgba(255,255,255,.16); }
.revease { font-size: 50px; font-weight: 700; letter-spacing: -.03em; color: #F0B667; margin-top: 6px; }
.numline { display: inline-block; }
.store { position: absolute; inset: 0; background: #0f1418; color: #FFF6E8; overflow: hidden; }
.st-art { position: absolute; right: -160px; top: -140px; width: 1180px; height: 1180px; border-radius: 240px; background-size: cover; background-position: center; opacity: .3; }
.st-fade { position: absolute; inset: 0; background: linear-gradient(90deg, #0f1418 38%, rgba(15,20,24,.86) 62%, rgba(15,20,24,.45) 100%), linear-gradient(0deg, #0f1418 10%, rgba(15,20,24,0) 50%); }
.st-top { position: absolute; left: 80px; top: 54px; display: flex; gap: 24px; align-items: center; font-size: 26px; color: rgba(255,246,232,.6); }
.st-brand { font-size: 22px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #F0B667; }
.st-hero { position: absolute; left: 80px; top: 140px; right: 80px; display: flex; gap: 48px; align-items: flex-start; }
.st-icon { width: 280px; height: 280px; border-radius: 48px; box-shadow: 0 30px 70px rgba(0,0,0,.55); flex: none; }
.st-info { width: 640px; flex: none; display: flex; flex-direction: column; gap: 14px; }
.st-name { font-size: 96px; font-weight: 700; letter-spacing: -.04em; line-height: 1; }
.st-tag { font-size: 34px; color: rgba(255,246,232,.88); }
.st-pills { display: flex; gap: 10px; margin-top: 4px; }
.st-pills span { font-size: 20px; font-weight: 600; padding: 6px 16px; border-radius: 999px; border: 1px solid rgba(255,246,232,.3); color: rgba(255,246,232,.85); }
.st-desc { font-size: 26px; line-height: 1.4; color: rgba(255,246,232,.8); margin-top: 6px; }
.st-actions { display: flex; gap: 18px; align-items: center; margin-top: 18px; }
.st-btn { position: relative; width: 300px; height: 84px; border-radius: 16px; background: #FFF6E8; color: #101518; overflow: hidden; outline: 4px solid #F0B667; outline-offset: 5px; flex: none; }
.st-btn2 { height: 84px; padding: 0 34px; border-radius: 16px; border: 1px solid rgba(255,246,232,.35); display: flex; align-items: center; font-size: 30px; font-weight: 600; color: rgba(255,246,232,.85); }
.st-fill { position: absolute; inset: 0; background: #F0B667; transform-origin: 0 50%; opacity: .9; }
.st-l { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 700; }
#eInst, #eOpen { opacity: 0; }
#eInst { color: #101518; }
.st-row { position: absolute; left: 80px; right: 80px; top: 650px; display: flex; flex-direction: column; gap: 18px; }
.st-rowh { font-size: 26px; font-weight: 700; letter-spacing: .02em; color: rgba(255,246,232,.7); }
.st-thumbs { display: flex; gap: 32px; }
.shot { position: relative; overflow: hidden; border-radius: 14px; background: #000; box-shadow: 0 24px 60px rgba(0,0,0,.5); flex: none; }
.shotscale { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
.cardlayer { position: absolute; left: 96px; top: 168px; right: 96px; bottom: 0; }
.cardlayer .card { position: absolute; left: 0; top: 0; width: calc((100% - 56px) / 3); }
.revealwrap { position: absolute; inset: 0; }
.mlist-h { font-size: 38px; font-weight: 700; padding: 20px 22px 10px; color: #fff; }
.msearch { margin: 0 18px 10px; display: flex; gap: 10px; align-items: center; padding: 10px 14px; border-radius: 12px; background: #1c1c1e; color: #8e8e93; font-size: 19px; }
.msearch span { color: #fff; }
.mlist { display: flex; flex-direction: column; }
.mrow { display: flex; gap: 14px; padding: 14px 20px; border-bottom: 1px solid #222; }
.mav { width: 50px; height: 50px; border-radius: 50%; flex: none; background: linear-gradient(#9aa0a6, #6b7075); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 22px; color: #fff; }
.mtx { min-width: 0; flex: 1; }
.mn { display: flex; justify-content: space-between; font-size: 19px; color: #fff; } .mn span { color: #8e8e93; font-size: 16px; }
.mt { font-size: 17px; color: #8e8e93; line-height: 1.3; margin-top: 3px; }

/* friends */
.blurbg { filter: blur(22px) brightness(.75); transform: scale(1.1); }
.cshade { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(16,22,22,.8), rgba(16,22,22,.5)); }
.storycol.c { max-width: 860px; }
.storycol.c .line { font-size: 84px; }
.fbub { position: absolute; display: flex; gap: 16px; align-items: flex-end; opacity: 0; }
.fbav { width: 56px; height: 56px; border-radius: 50%; background: #E28A3B; color: #1D1410; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 26px; flex: none; }
.fbn { font-size: 20px; color: #D5CFB9; margin: 0 0 6px 8px; font-weight: 600; }
.fbt { font-size: 32px; line-height: 1.25; color: #FFF7E8; padding: 18px 24px; border-radius: 26px 26px 26px 6px; background: rgba(41,54,45,.9); border: 1px solid rgba(255,247,232,.22); max-width: 660px; }

/* reveal */
.dshade { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(16,22,22,.62), rgba(16,22,22,.28)); }
.reveal { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; }
.soNow { font-family: "Inter", sans-serif; font-size: 54px; font-weight: 500; letter-spacing: -.02em; color: #FFF7E8; }
.revsub { position: absolute; left: 0; right: 0; top: 300px; text-align: center; font-family: "Inter", sans-serif; font-size: 50px; font-weight: 600; letter-spacing: -.02em; color: #FFF6E8; text-shadow: 0 4px 30px rgba(0,0,0,.45); opacity: 0; }
.rvphonewrap { position: absolute; left: 330px; top: 452px; width: 200px; height: 397px; opacity: 0; }
.rvphonescale { position: absolute; left: 0; top: 0; width: 416px; height: 826px; transform: scale(.48); transform-origin: 0 0; }
.rvfly { position: absolute; left: 400px; top: 768px; padding: 9px 18px; border-radius: 20px 20px 5px 20px; background: #1A7A33; color: #fff; font-family: "Inter", sans-serif; font-size: 21px; font-weight: 600; white-space: nowrap; opacity: 0; z-index: 5; box-shadow: 0 12px 30px rgba(0,0,0,.4); }
.dnd { position: absolute; right: 130px; bottom: 80px; z-index: 8; display: flex; flex-direction: column; align-items: center; gap: 14px; opacity: 0; }
.dndphone { position: relative; width: 150px; height: 300px; border-radius: 30px; background: #0b0b0c; box-shadow: 0 30px 70px rgba(0,0,0,.6), inset 0 0 0 2px #2a2a2c; }
.dndscr { position: absolute; inset: 8px; border-radius: 23px; background: linear-gradient(160deg, #3d5a80, #c8572f); display: flex; flex-direction: column; align-items: center; padding-top: 40px; color: #fff; font-family: "Inter", sans-serif; }
.dndt { font-size: 44px; font-weight: 700; } .dndd { font-size: 16px; opacity: .85; }
.dndoff { position: absolute; inset: 8px; border-radius: 23px; background: #000; display: flex; align-items: center; justify-content: center; color: #8FBDE8; opacity: 0; }
.dndlab { font-family: "Inter", sans-serif; font-size: 24px; font-weight: 600; color: #FFF6E8; background: rgba(13,28,43,.88); padding: 8px 18px; border-radius: 999px; opacity: 0; }
.revlogo { height: 230px; width: auto; filter: drop-shadow(0 10px 40px rgba(0,0,0,.4)); }
.revsub { font-size: 36px; color: #FFF7E8; font-weight: 500; }

/* presentation canvas */
.pres { position: absolute; inset: 0; }
.capblock { position: absolute; left: 110px; top: 70px; width: 1200px; height: 170px; }
.capk { position: absolute; left: 0; top: 0; font-size: 24px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #F0B667; opacity: 0; }
.caph { position: absolute; left: 0; top: 14px; font-family: "Inter", sans-serif; font-size: 62px; font-weight: 700; letter-spacing: -.03em; line-height: 1.08; white-space: nowrap; opacity: 0; }
.kicker { font-size: 24px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #F0B667; }

/* TV frame */
.tvwrap { position: absolute; padding: 12px; border-radius: 22px; background: #0a0c0c; box-shadow: 0 50px 120px rgba(0,0,0,.6), inset 0 0 0 2px #262b2b; }
.tvglass { position: relative; overflow: hidden; border-radius: 10px; background: #000; }
.tvscale { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
.tvfoot { position: absolute; left: 50%; bottom: -26px; width: 260px; height: 14px; margin-left: -130px; border-radius: 0 0 10px 10px; background: #0a0c0c; }

/* TV screen (design: Recco TV v3) */
.screen { position: absolute; inset: 0; width: 1920px; height: 1080px; color: var(--text); font-family: "Inter", sans-serif; overflow: hidden; }
.screen .vign { position: absolute; inset: 0; background-size: 100% 100%; }
.screen .dim { position: absolute; inset: 0; background: var(--canvas); opacity: .4; }
.season { background: transparent; }
.hdr { position: absolute; inset: 0 0 auto 0; height: 140px; }
.tabs { position: absolute; top: 48px; left: 50%; margin-left: -177px; display: flex; gap: 4px; background: var(--surface); border-radius: 999px; padding: 6px; border: 1px solid var(--border); }
.seg { padding: 14px 40px; border-radius: 999px; font-size: 26px; font-weight: 600; letter-spacing: -.01em; color: var(--segOff); }
.seg.on { background: var(--segOn); color: var(--segOnFg); }
.logo { position: absolute; top: 54px; left: 96px; height: 64px; width: auto; }
.gear { position: absolute; top: 56px; right: 96px; width: 60px; height: 60px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
.grid { position: absolute; top: 140px; left: 48px; right: 48px; bottom: 0; padding: 28px 48px 56px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; align-content: start; }
.gridover { position: absolute; top: 140px; left: 48px; right: 48px; bottom: 0; padding: 28px 48px 56px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; align-content: start; pointer-events: none; }
.gridover .card { opacity: 0; }
.card { display: flex; gap: 20px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); padding: 18px; height: 414px; outline: 4px solid rgba(0,0,0,0); position: relative; }
.gridover .card { background: var(--surfaceSolid); outline-color: var(--focus); box-shadow: 0 40px 90px rgba(0,0,0,.6); z-index: 5; }
.ccol { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.ctitle { font-size: 30px; font-weight: 700; line-height: 1.1; letter-spacing: -.01em; }
.cmeta { font-size: 19px; color: var(--text2); display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.stackchip { display: inline-flex; align-items: center; gap: 6px; color: var(--textB); background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.08); font-weight: 600; font-size: 16px; padding: 3px 10px; border-radius: 999px; line-height: 1.3; }
.ratings { display: flex; align-items: center; gap: 18px; color: var(--textB); font-weight: 600; }
.r1 { display: flex; align-items: center; gap: 7px; }
.imdb { display: inline-block; background: #F5C518; border-radius: 4px; }
.rt { border-radius: 50%; background: #FA320A; display: inline-block; }
.cbot { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: flex-end; gap: 10px; margin-top: 4px; }
.bwrap { flex: 1; min-height: 0; display: flex; align-items: flex-end; }
.bubble { display: inline-block; max-width: 100%; max-height: 100%; overflow: hidden; background: var(--tint); border-radius: 18px 18px 18px 4px; padding: 14px 18px; font-size: 24px; line-height: 1.3; color: var(--textBubble); }
.sender { display: flex; align-items: center; gap: 8px; font-size: 19px; color: var(--text2); padding-left: 4px; }
.sname { font-weight: 600; color: var(--textB); white-space: nowrap; }
.stime { white-space: nowrap; }
.av { border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--textB); background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.08); }
.poster { width: 252px; height: 378px; border-radius: 14px; flex: none; background-size: cover; background-position: center; box-shadow: 0 16px 40px rgba(0,0,0,.45); }
.fan { width: 252px; height: 378px; position: relative; flex: none; isolation: isolate; }
.fp { position: absolute; width: 200px; height: 300px; border-radius: 14px; background-size: cover; background-position: center; box-shadow: 0 16px 40px rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,.12); }
.fc { left: 44px; top: 48px; z-index: 1; rotate: 10deg; }
.fb { left: 8px; top: 40px; z-index: 2; rotate: -7deg; }
.fa { left: 26px; top: 30px; z-index: 3; }
.card.pending { border: 2px dashed var(--border); background: var(--surface); }
.pposter { display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.08); box-shadow: none; }
.spin { width: 72px; height: 72px; border-radius: 50%; border: 7px solid rgba(255,255,255,.18); border-top-color: var(--accent2); }
.spin.sm { width: 30px; height: 30px; border-width: 4px; }
.center-col { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 28px; padding: 0 200px; }
.digits { display: flex; gap: 20px; }
.digit { width: 170px; height: 210px; border-radius: 24px; background: var(--surface2); border: 2px solid var(--border); box-shadow: 0 16px 40px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; font-size: 150px; font-weight: 700; line-height: 1; }
.waitpill { display: flex; align-items: center; gap: 16px; margin-top: 8px; font-size: 25px; font-weight: 600; background: var(--surface2); border: 1px solid var(--border); border-radius: 999px; padding: 14px 28px 14px 18px; box-shadow: 0 12px 30px rgba(0,0,0,.35); }
.bigcheck { width: 120px; height: 120px; border-radius: 50%; background: var(--accent2); display: flex; align-items: center; justify-content: center; color: var(--onAccent); box-shadow: 0 20px 60px rgba(0,0,0,.4); flex: none; }
.scrim { position: absolute; inset: 0; z-index: 20; background: rgba(0,0,0,.45); backdrop-filter: blur(12px); }
.drawer { position: absolute; z-index: 21; top: 24px; right: 24px; width: 760px; height: 1032px; background: var(--surface2); border: 1px solid var(--border); border-radius: 28px; padding: 48px 52px; display: flex; flex-direction: column; gap: 34px; box-shadow: 0 40px 120px rgba(0,0,0,.6); overflow: hidden; }
.dposter { width: 200px; height: 300px; border-radius: 16px; flex: none; background-size: cover; background-position: center; box-shadow: 0 20px 50px rgba(0,0,0,.5); }
.alexa { display: flex; align-items: center; gap: 18px; background: rgba(255,255,255,.06); border-radius: 16px; padding: 18px 22px; }
.mic { width: 44px; height: 44px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; color: var(--textB); background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.08); }
.dbtn { font-size: 23px; font-weight: 600; border: 1px solid var(--border); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: center; gap: 10px; flex: 1; }
.dbtn.focused { outline: 3px solid var(--focus); background: var(--surface2solid); }
.feat-wrap { position: absolute; top: 150px; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 36px; }
.arrow { width: 84px; height: 84px; border-radius: 50%; background: var(--surface2); border: 2px solid var(--border); box-shadow: 0 12px 30px rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; }
.featcard { width: 1440px; display: flex; gap: 56px; background: var(--surfaceSolid); border-radius: 28px; padding: 44px; align-items: center; outline: 4px solid var(--focus); box-shadow: 0 40px 100px rgba(0,0,0,.5); }
.fposter { width: 380px; height: 570px; border-radius: 20px; flex: none; background-size: cover; background-position: center; box-shadow: 0 30px 60px rgba(0,0,0,.5); }
.fdot { width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,.5); }
.themepill { position: absolute; right: 186px; top: 60px; width: 260px; text-align: center; padding: 12px 0; border-radius: 999px; background: var(--surface2); border: 1px solid var(--border); font-size: 26px; font-weight: 600; color: var(--text); }
.fullscale { position: absolute; inset: 0; transform-origin: 50% 45%; }

/* phone (SMS to Recco) */
.phone { position: absolute; left: 1430px; top: 190px; width: 390px; height: 800px; border-radius: 60px; background: #0b0b0c; padding: 13px; box-shadow: 0 40px 100px rgba(0,0,0,.6), inset 0 0 0 2px #2a2a2c; }
.ph-screen { position: relative; width: 100%; height: 100%; border-radius: 48px; background: #000; overflow: hidden; font-family: "Inter", sans-serif; color: #fff; }
.ph-status { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; font-size: 17px; font-weight: 600; }
.ph-isl { width: 110px; height: 32px; border-radius: 20px; background: #111; margin-top: 2px; }
.ph-bat { width: 28px; height: 13px; border-radius: 4px; border: 2px solid #fff; }
.ph-head { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 6px 0 14px; border-bottom: 1px solid #1f1f22; background: #0e0e10; }
.ph-av { width: 62px; height: 62px; border-radius: 50%; background: #D3632D; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.ph-av img { width: 54px; height: auto; }
.ph-name { font-size: 18px; font-weight: 600; }
.ph-num { font-size: 13px; color: #8e8e93; }
.ph-thread { position: absolute; left: 0; right: 0; top: 190px; bottom: 82px; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 14px 10px; overflow: hidden; }
.ph-day { text-align: center; font-size: 13px; color: #8e8e93; margin-bottom: 12px; }
.msg { height: 0; opacity: 0; display: flex; justify-content: flex-end; align-items: flex-start; }
.bub { max-width: 270px; background: #1A7A33; color: #fff; font-size: 19px; line-height: 1.3; padding: 10px 15px; border-radius: 20px 20px 6px 20px; }
.linkb { width: 250px; border-radius: 18px; overflow: hidden; background: #1c1c1e; }
.lthumb { height: 118px; background: linear-gradient(135deg, #3a2b4e, #c8572f); display: flex; align-items: center; justify-content: center; }
.play { width: 0; height: 0; border-left: 30px solid rgba(255,255,255,.9); border-top: 18px solid transparent; border-bottom: 18px solid transparent; margin-left: 8px; }
.linkb.art { width: 270px; display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 16px; background: #2c2c2e; }
.athumb { position: relative; width: 74px; height: 74px; flex: none; border-radius: 10px; background-size: cover; background-position: center 35%; }
.athumb span { position: absolute; left: 6px; bottom: 2px; font-size: 30px; font-weight: 800; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.7); }
.ameta { min-width: 0; } .akick { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #F0B667; margin-bottom: 3px; }
.lmeta { padding: 10px 14px 12px; } .lt { font-size: 16px; font-weight: 600; line-height: 1.25; } .lu { font-size: 13px; color: #8e8e93; margin-top: 3px; }
.ph-input { position: absolute; left: 0; right: 0; bottom: 0; height: 82px; display: flex; align-items: center; gap: 10px; padding: 0 14px 18px; background: #000; }
.ph-field { position: relative; flex: 1; height: 44px; border-radius: 22px; border: 1px solid #3a3a3c; }
.ph-ph { position: absolute; left: 16px; top: 11px; font-size: 17px; color: #6e6e73; }
.typed { position: absolute; left: 16px; top: 11px; right: 10px; font-size: 17px; white-space: nowrap; overflow: hidden; }
.typed i { font-style: normal; opacity: 0; }
.ph-send { width: 36px; height: 36px; border-radius: 50%; background: #1A7A33; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; }

/* chapter cards */
.chapter { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; text-align: center; }
.chapt { font-family: "Inter", sans-serif; font-size: 112px; font-weight: 700; letter-spacing: -.04em; }
.rule { width: 420px; height: 3px; background: #E28A3B; transform-origin: 50% 50%; }
.mline { font-family: "Inter", sans-serif; font-size: 46px; font-weight: 500; letter-spacing: -.02em; color: #C4CAC0; }
.bss { display: flex; gap: 34px; font-size: 128px; font-weight: 800; letter-spacing: -.03em; line-height: 1; }
.bss span { display: inline-block; }
.bss span:nth-child(2) { color: #F0B667; }
.chip { position: absolute; display: flex; align-items: center; gap: 14px; padding: 14px 26px; border-radius: 999px; background: rgba(18,28,30,.92); border: 1px solid rgba(226,138,59,.6); font-size: 28px; font-weight: 600; box-shadow: 0 20px 50px rgba(0,0,0,.45); }
.chip.vega { left: 1430px; top: 100px; }
.cdot { width: 14px; height: 14px; border-radius: 50%; background: #E28A3B; }
.linkline { position: absolute; left: 1314px; top: 590px; width: 116px; height: 4px; background: repeating-linear-gradient(90deg, #E28A3B 0 12px, transparent 12px 20px); transform-origin: 100% 50%; opacity: 0; }
.lldot { position: absolute; right: -8px; top: -8px; width: 20px; height: 20px; border-radius: 50%; background: #F0B667; }

/* diagram */
.dtitle { position: absolute; left: 110px; top: 110px; }
.edges { position: absolute; inset: 0; }
.edges path { fill: none; stroke: #E28A3B; stroke-width: 4; stroke-dasharray: 1; stroke-linecap: round; }
.node { position: absolute; z-index: 2; display: flex; align-items: center; gap: 14px; padding: 0 20px; border-radius: 26px; background: rgba(24,36,38,.96); border: 1px solid rgba(255,246,232,.22); box-shadow: 0 24px 60px rgba(0,0,0,.4); }
.nic { width: 60px; height: 60px; border-radius: 16px; flex: none; display: flex; align-items: center; justify-content: center; background: rgba(226,138,59,.18); color: #F0B667; }
.nt { font-size: 25px; white-space: nowrap; font-weight: 700; letter-spacing: -.01em; }
.ns { font-size: 18px; white-space: nowrap; color: #C4CAC0; margin-top: 4px; }
.aring { position: absolute; left: 32px; top: 50%; width: 36px; height: 36px; margin-top: -18px; border-radius: 50%; border: 4px solid rgba(240,182,103,.22); border-top-color: #F0B667; opacity: 0; }
.awork { position: absolute; left: 94px; bottom: 15px; height: 22px; font-size: 18px; color: #F0B667; white-space: nowrap; }
.awork span { position: absolute; left: 0; top: 0; opacity: 0; }
.nbadge { position: absolute; top: -16px; right: -16px; width: 44px; height: 44px; border-radius: 50%; background: #F0B667; color: #1D1410; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,.4); }
.live { position: absolute; top: -18px; right: 22px; display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; background: #E28A3B; color: #1D1410; font-size: 18px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.live span { width: 10px; height: 10px; border-radius: 50%; background: #1D1410; display: block; }
.qbars { position: absolute; right: 22px; top: 50%; margin-top: -30px; display: flex; flex-direction: column; gap: 6px; }
.qbars i { display: block; width: 36px; height: 14px; border-radius: 4px; background: #F0B667; opacity: 0; }
.packet { position: absolute; left: 0; top: 0; width: 22px; height: 22px; border-radius: 50%; background: #FFF6E8; box-shadow: 0 0 0 7px rgba(240,182,103,.4), 0 0 34px 6px #F0B667; opacity: 0; z-index: 1; }

/* agent */
.agent { position: absolute; left: 760px; top: 340px; width: 400px; height: 400px; }
.ring { position: absolute; inset: 0; border-radius: 50%; border: 3px dashed rgba(240,182,103,.55); }
.ring.r2 { inset: 40px; border: 2px solid rgba(240,182,103,.25); border-top-color: #E28A3B; }
.acore { position: absolute; inset: 80px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #3a2a20, #1b2324); border: 1px solid rgba(255,246,232,.25); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #F0B667; box-shadow: 0 30px 80px rgba(0,0,0,.5), 0 0 80px rgba(226,138,59,.25); }
.at { font-size: 28px; font-weight: 700; color: #FFF6E8; }
.inputs { position: absolute; left: 110px; top: 330px; width: 560px; display: flex; flex-direction: column; gap: 34px; align-items: flex-end; }
.sms { display: flex; align-items: center; gap: 12px; background: #1A7A33; color: #fff; font-size: 32px; font-weight: 500; line-height: 1.25; padding: 18px 26px; border-radius: 30px 30px 8px 30px; max-width: 560px; }
.outputs { position: absolute; left: 1250px; top: 330px; width: 600px; display: flex; flex-direction: column; gap: 30px; }
.ochip { display: flex; align-items: center; gap: 20px; padding: 20px 26px; border-radius: 24px; background: rgba(24,36,38,.96); border: 1px solid rgba(255,246,232,.22); }
.oic { width: 56px; height: 56px; border-radius: 16px; background: rgba(226,138,59,.18); color: #F0B667; display: flex; align-items: center; justify-content: center; flex: none; }
.ok { font-size: 18px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #F0B667; }
.ov { font-size: 28px; font-weight: 600; margin-top: 4px; }

/* verified */
.qsearch { position: absolute; left: 50%; top: 110px; width: 760px; margin-left: -380px; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 20px 30px; border-radius: 999px; background: rgba(24,36,38,.96); border: 1px solid rgba(255,246,232,.25); font-size: 34px; font-weight: 500; color: #FFF6E8; }
.qrow { position: absolute; left: 0; right: 0; top: 240px; display: flex; justify-content: center; gap: 50px; }
.qcard { width: 320px; display: flex; flex-direction: column; gap: 12px; }
.qp { position: relative; width: 320px; height: 480px; border-radius: 20px; background-size: cover; background-position: center; box-shadow: 0 30px 70px rgba(0,0,0,.5); }
.qp.ghost { background: rgba(255,255,255,.04); border: 3px dashed rgba(255,246,232,.3); box-shadow: none; display: flex; align-items: center; justify-content: center; }
.qp.ghost span { font-family: "Inter", sans-serif; font-weight: 300; font-size: 160px; color: rgba(255,246,232,.3); }
.qbadge { position: absolute; left: 16px; bottom: 16px; display: flex; align-items: center; gap: 8px; padding: 8px 16px 8px 12px; border-radius: 999px; background: #F0B667; color: #1D1410; font-size: 22px; font-weight: 800; }
.qx { position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 999px; background: #C8572F; color: #FFF6E8; font-size: 20px; font-weight: 700; }
.qt { font-size: 32px; font-weight: 700; }
.qm { font-size: 22px; color: #C4CAC0; }
.qcap { position: absolute; left: 0; right: 0; bottom: 90px; text-align: center; font-family: "Inter", sans-serif; font-size: 46px; font-weight: 600; letter-spacing: -.02em; color: #F0B667; }

/* privacy */
.privacy { position: absolute; z-index: 6; left: 50%; width: 1060px; margin-left: -530px; top: 400px; display: flex; flex-direction: column; gap: 28px; }
.pchip { flex: 1; display: flex; align-items: center; gap: 22px; padding: 22px 30px; border-radius: 24px; background: rgba(200,87,47,.16); border: 1px solid rgba(226,138,59,.55); }
.pic { width: 56px; height: 56px; border-radius: 16px; flex: none; background: #E28A3B; color: #1D1410; display: flex; align-items: center; justify-content: center; }
.pnum { position: relative; width: 330px; flex: none; height: 40px; font-size: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pnum span { position: absolute; left: 0; top: 0; white-space: nowrap; }
.pnum span.last { left: 76px; color: #C4CAC0; text-decoration: line-through; text-decoration-color: #E28A3B; }
.plab { font-size: 28px; color: #FFF6E8; font-weight: 500; white-space: nowrap; }

/* end cards */
.kshade { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(8,12,22,.82), rgba(8,12,22,.6)); }
.endcard, .uend { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; text-align: center; }
.uend { background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(13,28,43,.93), rgba(13,28,43,.99)); }
.endlogo { height: 220px; width: auto; filter: drop-shadow(0 10px 40px rgba(0,0,0,.4)); }
.tagrow { font-family: "Inter", sans-serif; font-size: 68px; font-weight: 700; letter-spacing: -.035em; }
.tagready { font-family: "Inter", sans-serif; font-size: 54px; font-weight: 600; letter-spacing: -.025em; color: #F0B667; }
`;

// ---------------------------------------------------------------- page
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Recco demo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>${css}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DURATION}" data-width="1920" data-height="1080">
      ${videos.join("\n      ")}
      ${scenes.join("\n      ")}
      ${overlays.join("\n      ")}
      <audio id="soundtrack" src="assets/audio/mix.wav" data-start="0" data-duration="${DURATION}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>${script}</script>
  </body>
</html>
`;
writeFileSync(join(ROOT, "index.html"), html);
console.log(`index.html written: ${scenes.length} scenes, ${videos.length} video clips, ${DURATION}s`);
