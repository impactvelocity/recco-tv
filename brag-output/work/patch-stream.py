# The "ten minutes searching" browse becomes a generic streaming-app home screen (featured film + category rows)
# on a TV in the room. Focus highlights the tile in place; rows scroll sideways and the page scrolls down, like a
# real TV app. When the phone comes up, the TV stays behind, smaller and faded.
import sys
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

# the room stays put behind A and B (no drift), so B's TV sits in the same picture and the reveal matches it exactly
rep('bgStill("winterNight", 0, R(6.0), "vwA");', 'bgStill("winterNight", 0, R(23.3), "vwA");')
rep('  tl.fromTo("#vwA", { scale: 1.0 }, { scale: 1.06, duration: 6.0, ease: "none" }, 0);\n', '')

# ---- markup: a streaming home screen (1920x1080, shown inside the TV)
cut("const rowNames = [", "const threads = [", r'''// rows of the home screen: each row starts at a different poster so neighbours differ
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
  <div class="snav"><span class="slogo"></span><span class="on">Home</span><span>Movies</span><span>Shows</span><span>My List</span><span class="sgap"></span>${ic.search(30)}<span class="sprof">D</span></div>
</div>`;
''')
rep('scene("sB", B0, B_END, `<div class="browse"><div class="bgrid" id="bGrid" data-layout-allow-overlap>${browseRows}<div class="bfocus" id="bFocus"></div></div></div>\n  <div class="bdim" id="bDim"></div>',
    'scene("sB", B0, B_END, `<div class="bstage" id="bStage"></div>\n  ${tvFrame("bTV", streamScreen, { x: 268, y: 178, w: 1360 })}\n  <div class="bdim" id="bDim"></div>')
rep('.bdim { position: absolute; inset: 0; background: #0a0c0d; opacity: 0; }', r'''.bdim { position: absolute; inset: 0; background: #0a0c0d; opacity: 0; }
.bstage { position: absolute; inset: 0; background: radial-gradient(ellipse 75% 70% at 50% 55%, rgba(6,10,18,.35), rgba(6,10,18,.72)); }
.sapp { position: absolute; inset: 0; background: #0b0d11; overflow: hidden; font-family: "Inter", sans-serif; color: #fff; }
.spage { position: absolute; left: 0; top: 0; width: 1920px; }
.shero { position: absolute; left: 0; top: 0; width: 1920px; height: 860px; }
.sheroimg { position: absolute; right: 0; top: 0; width: 1240px; height: 821px; background-size: cover; background-position: center; }
.sherofade { position: absolute; inset: 0; background: linear-gradient(90deg, #0b0d11 34%, rgba(11,13,17,.75) 50%, rgba(11,13,17,0) 75%), linear-gradient(0deg, #0b0d11 4%, rgba(11,13,17,0) 40%); }
.sheroinfo { position: absolute; left: 90px; top: 190px; width: 760px; }
.skick { font-size: 22px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #F0B667; }
.stitle { font-size: 92px; font-weight: 800; letter-spacing: -.035em; line-height: 1; margin-top: 16px; }
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
.stile i { position: absolute; left: 12px; bottom: 12px; height: 6px; border-radius: 3px; background: #E28A3B; box-shadow: 0 0 0 999px rgba(0,0,0,0); }
.snav { position: absolute; left: 0; right: 0; top: 0; height: 120px; display: flex; align-items: center; gap: 44px; padding: 0 90px; font-size: 28px; font-weight: 600; color: #aab1bc; background: linear-gradient(180deg, rgba(11,13,17,.9), rgba(11,13,17,0)); }
.snav .on { color: #fff; }
.snav .sgap { flex: 1; }
.slogo { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #E28A3B, #C8572F); }
.sprof { width: 48px; height: 48px; border-radius: 50%; background: #8FBDE8; color: #10233A; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }''')
rep('.clock { position: absolute; top: 70px; right: 110px;', '.clock { position: absolute; top: 46px; right: 110px;')

# ---- timeline: replace the old browse block (grid + floating focus card) with tile focus
cut('  const BP = ${JSON.stringify(browsePosters)}, bImg', '  // "ten minutes searching": the clock runs', r'''  // the TV comes up in the room for "a really good show"
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
    if (cur) tl.to(cur, FOFF, t); else tl.to("#bPlay", { backgroundColor: "rgba(255,255,255,.18)", color: "#fff", duration: 0.2 }, t);
    const id = "#bT" + r + "_" + c;
    tl.to(id, FON, t);
    if (r !== curRow) tl.to("#bPage", { y: pageY(r), duration: 0.45, ease: "power2.inOut" }, t);
    const off = rowOff[r] || 0, want = Math.max(0, c - 4);
    if (want !== off) { tl.to("#bR" + r, { x: -want * SCW, duration: 0.35, ease: "power2.inOut" }, t); rowOff[r] = want; }
    cur = id; curRow = r;
  };
  // first the featured film's Play button, then down into the rows
  tl.fromTo("#bPlay", { backgroundColor: "rgba(255,255,255,.18)", color: "#fff" }, { backgroundColor: "rgba(255,255,255,1)", color: "#0b0d11", duration: 0.2, immediateRender: false }, ${R(5.45)});
  tl.fromTo("#bPlay", { scale: 1 }, { scale: 1.06, duration: 0.2, ease: "power2.out", immediateRender: false }, ${R(5.45)});
  tl.to("#bPlay", { scale: 1, duration: 0.2 }, ${R(6.0)});
  ${JSON.stringify([[6.0,0,0],[6.3,0,1],[6.6,0,2],[6.9,0,3],[7.25,1,3],[7.55,1,4],[7.85,1,5],[8.15,1,6],[8.5,2,6],[8.8,2,5],[9.1,2,4],[9.45,3,4],[9.75,3,5],[10.05,3,6],[10.4,4,6],[10.7,4,7],[11.0,4,8]].map(([t, r, c]) => [R(t), r, c]))}.forEach(([t, r, c]) => focusTile(t, r, c));
''')
rep('''  tl.to("#bGrid", { opacity: 0.16, filter: "blur(10px)", duration: 0.7, ease: "power2.inOut" }, ${R(11.2)});
  tl.fromTo("#bDim", { opacity: 0 }, { opacity: 0.5, duration: 0.7 }, ${R(11.2)});
  tl.to("#bFocus", { opacity: 0, duration: 0.3 }, ${R(11.2)});''',
'''  // the TV stays behind the phone, smaller and faded
  tl.to("#bTV", { scale: 0.84, y: -16, opacity: 0.38, duration: 0.8, ease: "power2.inOut" }, ${R(11.2)});
  tl.fromTo("#bDim", { opacity: 0 }, { opacity: 0.25, duration: 0.7 }, ${R(11.2)});''')
rep('// B · Looking: the browse runs', '// B · Looking: a streaming home screen on the TV runs')
open(p, "w", encoding="utf-8").write(s)
print("ok")
