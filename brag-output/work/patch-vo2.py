# New part-one voiceover (vo-intro-v2.mp3) and script. A piecewise retime (WARP) moves every existing cue onto the
# new VO; scenes the new script changes are rewritten with cues in real seconds via R(). Part two shifts 5.9s later.
import sys, re
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
def cut(a_marker, b_marker, new):
    global s
    a = s.index(a_marker); b = s.index(b_marker, a)
    s = s[:a] + new + s[b:]

# ---------------------------------------------------------------- clocks
rep('''// Cue times below are authored on the old clock (voiceover at 1.25x: story VO at 0.6s, build VO at 50s).
// T() maps them onto the real clock (voiceover at 1.0x): speech stretches by 1.25, the chapter gap keeps its length.
const T = (t) => (t <= 0.6 ? t : 0.6 + (t - 0.6) * 1.25);''',
'''// Cue times below are authored on the old clock (voiceover at 1.25x: story VO at 0.6s, build VO at 50s).
// T0() maps them onto the first 1.0x voiceover; WARP() then retimes that onto the current voiceover: the new part-one
// VO (vo-intro-v2.mp3, at 0.6s), and part two 5.9s later than before. Anchors pair a word in the old VO with the same
// moment in the new one. T = WARP∘T0 places every cue; R(seconds) is its inverse, for cues written in real seconds.
const T0 = (t) => (t <= 0.6 ? t : 0.6 + (t - 0.6) * 1.25);
const T0i = (y) => (y <= 0.6 ? y : 0.6 + (y - 0.6) / 1.25);
const WA = [[0, 0], [25.9, 23.25], [26.12, 23.45], [28.93, 29.34], [31.59, 31.25], [33.75, 33.74], [38.28, 37.48], [40.6, 39.88], [42.6, 42.2], [45.39, 44.44], [46.6, 45.65], [60.4, 66.3]];
const lerpMap = (pts, x) => { if (x <= pts[0][0]) return pts[0][1] + (x - pts[0][0]); for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); } const [xn, yn] = pts[pts.length - 1]; return yn + (x - xn); };
const WARP = (x) => lerpMap(WA, x);
const T = (t) => WARP(T0(t));
const R = (y) => +T0i(lerpMap(WA.map(([a, b]) => [b, a]), y)).toFixed(4);''')
rep('const script = `\nconst T = ${T};', 'const script = `\nconst WA = ${JSON.stringify(WA)};\nconst lerpMap = ${lerpMap};\nconst T0 = ${T0};\nconst WARP = ${WARP};\nconst T = ${T};')

# ---------------------------------------------------------------- data
rep('''  stack: { stack: true, title: "3 cozy comedies for a night in",''', '''  fog: { title: "The Fog House", type: "Film", year: "2001", imdb: "7.6", rt: "84%", poster: "fog-house", from: "You", msg: "a link: best films you probably missed", time: "now" },
  will: { title: "The Will Reading", type: "Film", year: "2019", imdb: "7.9", rt: "97%", runtime: "2h 10m", genre: "Mystery", poster: "will-reading", from: "Megan", msg: "Megan says it’s so good", time: "now", synopsis: "A detective untangles a family’s inheritance, one lying relative at a time." },
  rain: { stack: true, title: "Movies for a rainy night", type: "Recco’s picks", count: "3 films", from: "You", msg: "movies for a rainy night", time: "now", items: ["snowbound", "floor-thirteen", "sandfall-part-two"] },
  stack: { stack: true, title: "3 cozy comedies for a night in",''')
rep('<div class="lu">filmtok.cx</div>', '<div class="lu">${m.domain ?? "filmtok.cx"}</div>')

# ---------------------------------------------------------------- A · "9pm. Tea, snacks, and an hour and a half before bed…"
cut("// A · Evening (0 – 5.6).", "// B · Looking", '''// A · Evening: "9pm. Tea, snacks, and an hour and a half before bed, for a really good show" (cut to the browse on "show")
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
bgStill("winterNight", 0, R(6.0), "vwA");
scene("sA", 0, A_END, `<div class="shade-left"></div>
  <div class="storycol"><div class="line big" id="a1">${W("9pm")}</div></div>
  <div class="items" id="aItems">
    ${[["intro-tea.webp", "Tea"], ["intro-snack.webp", "Snacks"]].map(([f, l], i) => `<div class="item" id="ai${i}"><div class="iic"><img src="assets/img/${f}" alt=""></div><div class="ilab">${l}</div></div>`).join("")}
    <div class="item" id="ai2"><div class="iic">${clockSvg}</div><div class="ilab">1½ hours till bed</div></div>
  </div>`);

''')

# ---------------------------------------------------------------- B · searching, then the phone
rep('''// B · Looking (5.45 – 16.35): "a really good show" scrolls the TV through every row and picks one ("That's the plan"),
// "ten minutes of looking" keeps browsing, then the phone takes over''',
'''// B · Looking: the browse runs from "a really good show" through "ten minutes searching"; "Megan mentioned a show"
// brings up the phone, "forty minutes later" turns it into the feed, until "not exactly me time"
const B_END = R(23.25);''')
rep('''["Steph", "ok you'll love this one", "Mon"], ["Sarah", "omg the finale", "Sep 28"], ["Dad", "watching it again tonight", "Sep 26"]];''',
    '''["Steph", "ok you'll love this one", "Mon"], ["Megan", "you NEED to watch this show", "Sep 30"], ["Sarah", "omg the finale", "Sep 28"], ["Dad", "watching it again tonight", "Sep 26"]];''')
rep('''// one caption per clip in assets/video/feed.mp4; the clip swipes at 1.22s and 4.34s
const FEED_AT = 11.68, FEED_SWIPES = [1.22, 4.34];''', '''// one caption per clip in assets/video/feed.mp4 (8.5s); the clip swipes at 1.25s, 4.47s and 7.04s
const FEED_REAL = 14.76, FEED_AT = R(FEED_REAL), FEED_SWIPES = [1.25, 4.47, 7.04];''')
rep('''  ["slow.travel", "save this for your next trip", "530K", "7,811"],
];''', '''  ["slow.travel", "save this for your next trip", "530K", "7,811"],
  ["coast.drives", "the long way home", "88K", "1,240"],
];''')
rep('scene("sB", B0, 16.35, `', 'scene("sB", B0, B_END, `')
rep('''  <div class="bshade" id="bShade" data-layout-allow-overlap></div>
  <div class="bplan" id="bPlan" data-layout-allow-overlap>${W("That’s the plan")}</div>
''', '')
rep('<div class="msearch">${ic.search(18)}<span>show</span></div>', '<div class="msearch">${ic.search(18)}<span>Megan</span></div>')
rep('''${threads.map(([n, t, d]) => `<div class="mrow">''', '''${threads.map(([n, t, d]) => `<div class="mrow" ${n === "Megan" ? 'id="bMeg"' : ""}>''')
rep('''<div class="bcap" data-layout-allow-overlap><div class="line" id="b2">${W("No time left for an episode")}</div><div class="line accent" id="b3">${W("So I just keep scrolling")}</div></div>`);''',
    '''<div class="bcap" data-layout-allow-overlap><div class="line" id="b2">${W("No time for anything")}</div><div class="line" id="b3">${W("So I scroll some more")}</div><div class="line accent" id="b4">${W("Not exactly me time")}</div></div>`);''')
rep('data-start="${+T(FEED_AT).toFixed(3)}" data-duration="${+(T(16.35) - T(FEED_AT)).toFixed(3)}"', 'data-start="${FEED_REAL}" data-duration="${+(T(B_END) - FEED_REAL).toFixed(3)}"')

# ---------------------------------------------------------------- C · friends: not in the new script
cut("// C · Friends (16.35", "// D+E · Reveal", "")

# ---------------------------------------------------------------- D+E · reveal subtitle, the texting beat
rep('<img id="dLogo" src="assets/img/recco-logo.png" alt="Recco" class="revlogo"></div></div>',
    '<img id="dLogo" src="assets/img/recco-logo.png" alt="Recco" class="revlogo"><div class="revsub" id="dSub">${W("An inbox for your TV you text like a friend")}</div></div></div>')
rep('.revlogo {', '.revsub { font-family: "Inter", sans-serif; font-size: 50px; font-weight: 600; letter-spacing: -.02em; color: #FFF6E8; text-shadow: 0 4px 30px rgba(0,0,0,.45); opacity: 0; }\n.revlogo {')
rep('''  ["pSteph", pendingCard("Steph", "eX-pSteph")], ["stack", card(RECS.stack, "eX-stack")],
];''', '''  ["pSteph", pendingCard("Steph", "eX-pSteph")], ["stack", card(RECS.stack, "eX-stack")],
  ["pLink", pendingCard("You", "eX-pLink")], ["fog", card(RECS.fog, "eX-fog")],
  ["pMeg", pendingCard("Megan", "eX-pMeg")], ["will", card(RECS.will, "eX-will")],
  ["pRain", pendingCard("You", "eX-pRain")], ["rain", card(RECS.rain, "eX-rain")],
];''')
rep('''  { id: "m5", text: "Steph sent this" },
]);''', '''  { id: "m5", text: "Steph sent this" },
  { id: "m6", kind: "link", title: "Best films you probably missed", domain: "reelhub.cx", typeText: "reelhub.cx/best-films" },
  { id: "m7", text: "Megan says The Will Reading is so good" },
  { id: "m8", text: "movies for a rainy night" },
]);''')
rep('scene("sE", 20.85, 37.8, `', 'scene("sE", 20.85, R(55.6), `')
rep('''    <div class="caph" id="eH5">${W("One link, three reccos")}</div>''', '''    <div class="caph" id="eH5">${W("One link, three reccos")}</div>
    <div class="caph" id="eH7">${W("Nothing to install. Just text it")}</div>
    <div class="caph" id="eH8">${W("Send it anything")}</div>
    <div class="caph" id="eH9">${W("It just works")}</div>''')

# ---------------------------------------------------------------- I · me time, and K
rep('bgStill("winterNight", 37.8, 11.15, "vwI");', 'bgStill("winterNight", R(55.4), R(66.6) - R(55.4), "vwI");')
rep('scene("sI", 37.8, 44.4, `<div class="fullscale" id="iScale">${screen({ theme: "winterNight", id: "iScr", still: false, body: grid([card(RECS.stack, "iC0"), card(RECS.koq, "iC1"), card(RECS.slow, "iC2"), card(RECS.bear), card(RECS.sev), card(RECS.past), card(RECS.shrink), card(RECS.dune), card(RECS.lasso)]) + drawer(RECS.koq, "iD") })}</div>`);',
    'scene("sI", R(55.5), R(63.85), `<div class="fullscale" id="iScale">${screen({ theme: "winterNight", id: "iScr", still: false, body: grid([card(RECS.rain, "iC0"), card(RECS.will, "iC1"), card(RECS.fog, "iC2"), card(RECS.stack), card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past)]) + drawer(RECS.will, "iD") })}</div>`);')
rep('scene("sK", 44.4, 48.95, `', 'scene("sK", R(63.7), 48.95, `')

# ---------------------------------------------------------------- timeline: A
cut("  // ---- A · Evening\n", "  // ---- B · browsing on the TV", r'''  // ---- A · Evening
  tl.fromTo("#vwA", { scale: 1.0 }, { scale: 1.06, duration: 6.0, ease: "none" }, 0);
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

''')

# ---------------------------------------------------------------- timeline: B
BPATH_JS = '${JSON.stringify([[1,0],[2,0],[2,1],[3,1],[3,2],[4,2],[4,3],[3,3],[3,4],[2,4],[2,5],[1,5],[1,6],[2,6],[2,7],[3,7],[3,8],[4,8],[4,9],[3,9],[2,9]].map(([c, r], k) => [R(5.55 + k * 0.27), c, r]))}'
cut("  // ---- B · browsing on the TV", "  // ---- C · Friends", r'''  // ---- B · browsing on the TV ("for a really good show… ten minutes searching"), then the phone
  sceneFade("sB", ${B0}, ${B_END});
  tl.set("#bPhone", { scale: 1.12, transformOrigin: "50% 50%" }, ${B0});
  const BP = ${JSON.stringify(browsePosters)}, bImg = (c, r) => "url(assets/posters/" + BP[(c * 3 + r * 5) % BP.length] + ".jpg)";
  // one rhythm for the whole browse: the focus hops, and when it drops a row the grid scrolls with it in the same tween
  let bRow = 0;
  const bHop = (t, c, r) => {
    const d = r !== bRow ? 0.3 : 0.22;
    tl.to("#bFocus", { x: c * 262, y: r * 484, duration: d, ease: "power2.inOut" }, t);
    if (r !== bRow) tl.to("#bGrid", { y: -r * 484, duration: d, ease: "power2.inOut" }, t);
    tl.set("#bFocus", { backgroundImage: bImg(c, r) }, t + 0.06);
    bRow = r;
  };
  tl.set("#bGrid", { y: 0 }, ${B0});
  tl.set("#bFocus", { x: 0, y: 0, backgroundImage: bImg(0, 0) }, ${B0});
  tl.fromTo("#bFocus", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1.06, duration: 0.3, ease: "back.out(2)" }, ${R(5.3)});
  ''' + BPATH_JS + r'''.forEach(([t, c, r]) => bHop(t, c, r));
  // "ten minutes searching": the clock runs 9:00 → 9:10; "forty minutes later" → 9:50; then it creeps to 9:58
  const clk = { m: 0 }, clkEl = S("#bClockT"), clkSet = () => { clkEl.textContent = "9:" + String(Math.round(clk.m)).padStart(2, "0"); };
  inn("#bClock", ${R(7.4)}, { opacity: 0, y: -20 }, 0.4);
  tl.fromTo(clk, { m: 0 }, { m: 10, duration: 3.1, ease: "none", onUpdate: clkSet }, ${R(7.45)});
  tl.to(clk, { m: 50, duration: 2.0, ease: "power2.inOut", onUpdate: clkSet }, ${R(14.8)});
  tl.to(clk, { m: 58, duration: 4.8, ease: "power1.out", onUpdate: clkSet }, ${R(17.7)});
  tl.to("#bClock", { scale: 1.25, duration: 0.5, ease: "power2.out" }, ${R(17.75)});
  // "Then I remember Megan mentioned a show": the shows fall away, the phone rises into the centre
  tl.to("#bGrid", { opacity: 0.16, filter: "blur(10px)", duration: 0.7, ease: "power2.inOut" }, ${R(11.2)});
  tl.fromTo("#bDim", { opacity: 0 }, { opacity: 0.5, duration: 0.7 }, ${R(11.2)});
  tl.to("#bFocus", { opacity: 0, duration: 0.3 }, ${R(11.2)});
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

''')
cut("  // ---- C · Friends", "  // ---- D+E · Reveal", "")

# ---------------------------------------------------------------- timeline: D+E
rep('''  inn("#dLogo", 21.4, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.7, "back.out(1.8)");''',
    '''  inn("#dLogo", 21.4, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.7, "back.out(1.8)");
  // "It's an inbox for my TV that I text like a friend"
  words("#dSub", ${R(25.1)}, 0.05);''')
rep('  bob("#ePhone", 26.0, 36.9, 10, 1.8);', '  bob("#ePhone", 26.0, ${R(54.4)}, 10, 1.8);')
rep('  ["pDad", "slow", "pJill", "koq", "pSteph", "stack"].forEach((id) => tl.set(X(id), { opacity: 0, x: 0, y: 0 }, 20.85));',
    '  ["pDad", "slow", "pJill", "koq", "pSteph", "stack", "pLink", "fog", "pMeg", "will", "pRain", "rain"].forEach((id) => tl.set(X(id), { opacity: 0, x: 0, y: 0 }, 20.85));')
rep('''  // "when it's my time": phone and captions clear, the TV fills the frame, the next scene continues it
  tl.to("#ePhone", { opacity: 0, y: 160, duration: 0.4, ease: "power2.in" }, 36.9);
  out("#eH5", 36.95, { opacity: 0, y: -14 }, 0.3);
  tl.to("#eTV", { ...FULL, duration: 0.8, ease: "power3.inOut" }, 37.0);
  tl.to("#eTV .tvglass", { borderRadius: 0, duration: 0.8 }, 37.0);''',
'''  // "Texting is great because there's nothing to install. I can send it anything:"
  out("#eH5", ${R(45.7)}, { opacity: 0, y: -14 }, 0.25); words("#eH7", ${R(45.9)}, 0.05);
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
  tl.to("#eTV .tvglass", { borderRadius: 0, duration: 0.8 }, ${R(54.7)});''')

# ---------------------------------------------------------------- timeline: I and K
cut("  // ---- I · My list is waiting\n", "  // ---- O · How it's built", r'''  // ---- I · "So when it's me time, my phone stays off, and my inbox is full of reccos… tell Alexa which one"
  tl.set("#sI", { opacity: 1 }, ${R(55.5)});
  tl.to("#sI", { opacity: 0, scale: 0.985, duration: 0.3, ease: "power1.in" }, ${R(63.6)});
  tl.set("#iD-scrim, #iD-drawer", { opacity: 0 }, 0);
  focusCard("#iC0", ${R(56.0)});
  focusCard("#iC0", ${R(58.0)}, false); focusCard("#iC1", ${R(58.0)});
  focusCard("#iC1", ${R(58.8)}, false); focusCard("#iC2", ${R(58.8)});
  focusCard("#iC2", ${R(59.6)}, false); focusCard("#iC1", ${R(59.6)});
  tl.fromTo("#iD-scrim", { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, ${R(60.9)});
  tl.fromTo("#iD-drawer", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, ${R(60.9)});
  tl.fromTo("#iD-alexa", { backgroundColor: "rgba(255,255,255,.06)", scale: 1 }, { backgroundColor: "rgba(226,138,59,.28)", scale: 1.03, duration: 0.4, ease: "power2.out" }, ${R(62.25)});
  tl.fromTo("#iD-mic", { boxShadow: "0 0 0 0 rgba(226,138,59,.7)" }, { boxShadow: "0 0 0 18px rgba(226,138,59,0)", duration: 0.8, repeat: 2, ease: "power1.out" }, ${R(62.3)});
  tl.fromTo("#vwI", { scale: 1.0 }, { scale: 1.06, duration: 11.2, ease: "none" }, ${R(55.4)});

  // ---- K · Tagline (no voice): a short breath before part two
  sceneFade("sK", ${R(63.7)}, 48.95);
  drift("sK", ${R(63.7)}, 48.95, 1.04);
  inn("#kLogo", ${R(63.8)}, { opacity: 0, scale: 0.75, rotation: -3, filter: "blur(8px)" }, 0.7, "back.out(1.7)");
  words(".tagrow", ${R(64.25)}, 0.07);
  words("#k4", ${R(64.95)}, 0.07);

''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
