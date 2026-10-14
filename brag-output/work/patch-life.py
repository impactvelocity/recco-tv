# Round 5b: fewer flat stretches. A slow camera follows the pipeline step by step (captions held still),
# bigger packets, the agent's outputs float, "nothing to install" leans into the phone, "my phone stays off"
# gets a phone going dark, and the Alexa drawer gets a gentle push-in.
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

rep('  const O0 = 48.95, FULLO = { x: 248, y: -74, scale: 1.6271 };', '  const O0 = 48.95;')

# ---- packets: bigger and brighter
rep('.packet { position: absolute; left: 0; top: 0; width: 18px; height: 18px; border-radius: 50%; background: #FFF6E8; box-shadow: 0 0 0 6px rgba(240,182,103,.35), 0 0 24px #F0B667;',
    '.packet { position: absolute; left: 0; top: 0; width: 22px; height: 22px; border-radius: 50%; background: #FFF6E8; box-shadow: 0 0 0 7px rgba(240,182,103,.4), 0 0 34px 6px #F0B667;')
rep('[k, [x - 9, y - 9]]', '[k, [x - 11, y - 11]]')

# ---- pipeline camera (captions get the inverse move so they stay put)
rep('  // into the inbox: the map clears', '''  // a slow camera follows the active step; it is back to neutral before the TV hands off to the seasons
  // (vertical moves stay small so the top step never slides under the captions)
  const CAM = [[V(11.3), 1.04, 0, 30, 1.4], [V(15.6), 1.04, 0, 0, 1.2], [V(17.6), 1.05, -50, 10, 1.2], [V(19.6), 1.06, 0, -15, 1.4], [V(26.3), 1.05, 0, -22, 1.4], [V(31.0), 1.04, 0, -25, 1.0], [V(34.7), 1.04, 0, -25, 1.2], [V(36.9), 1.04, -40, -10, 1.2], [V(38.6), 1, 0, 0, 0.9]];
  tl.set("#sO-cam", { transformOrigin: "960px 540px" }, O0);
  tl.set("#sO .capblock", { transformOrigin: "850px 470px" }, O0);
  CAM.forEach(([t, sc, x, y, d]) => {
    tl.to("#sO-cam", { scale: sc, x, y, duration: d, ease: "sine.inOut" }, t);
    tl.to("#sO .capblock", { scale: 1 / sc, x: -x / sc, y: -y / sc, duration: d, ease: "sine.inOut" }, t);
  });
  // the agent's results float while the voice explains them
  [["#oOut0", V(27.9)], ["#oOut1", V(28.4)], ["#oOut2", V(29.1)]].forEach(([id, t], i) => bob(id, t, V(30.9), 5, 0.8 + i * 0.07));
  // into the inbox: the map clears''')

# ---- "nothing to install": lean into the phone, the TV steps back
rep('''  out("#eH5", ${R(45.7)}, { opacity: 0, y: -14 }, 0.25); words("#eH7", ${R(45.9)}, 0.05);''',
    '''  out("#eH5", ${R(45.7)}, { opacity: 0, y: -14 }, 0.25); words("#eH7", ${R(45.9)}, 0.05);
  tl.to("#ePhone", { scale: 1.1, duration: 0.6, ease: "power2.inOut" }, ${R(45.9)});
  tl.to("#eTV", { opacity: 0.55, duration: 0.6 }, ${R(45.9)});
  tl.to("#ePhone", { scale: 1, duration: 0.6, ease: "power2.inOut" }, ${R(48.55)});
  tl.to("#eTV", { opacity: 1, duration: 0.6 }, ${R(48.55)});''')

# ---- "my phone stays off": a phone slides in and goes dark; then the drawer gets a slow push-in
rep('''+ drawer(RECS.will, "iD") })}</div>`);''', '''+ drawer(RECS.will, "iD") })}</div>
  <div class="dnd" id="iDnd" data-layout-allow-overlap><div class="dndphone"><div class="dndscr"><div class="dndt">9:30</div><div class="dndd">Tuesday</div></div><div class="dndoff" id="iDndOff"><svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></div></div><div class="dndlab" id="iDndLab">Phone off</div></div>`);''')
rep('.revlogo {', '''.dnd { position: absolute; right: 130px; bottom: 80px; z-index: 8; display: flex; flex-direction: column; align-items: center; gap: 14px; opacity: 0; }
.dndphone { position: relative; width: 150px; height: 300px; border-radius: 30px; background: #0b0b0c; box-shadow: 0 30px 70px rgba(0,0,0,.6), inset 0 0 0 2px #2a2a2c; }
.dndscr { position: absolute; inset: 8px; border-radius: 23px; background: linear-gradient(160deg, #3d5a80, #c8572f); display: flex; flex-direction: column; align-items: center; padding-top: 40px; color: #fff; font-family: "Inter", sans-serif; }
.dndt { font-size: 44px; font-weight: 700; } .dndd { font-size: 16px; opacity: .85; }
.dndoff { position: absolute; inset: 8px; border-radius: 23px; background: #000; display: flex; align-items: center; justify-content: center; color: #8FBDE8; opacity: 0; }
.dndlab { font-family: "Inter", sans-serif; font-size: 24px; font-weight: 600; color: #FFF6E8; background: rgba(13,28,43,.88); padding: 8px 18px; border-radius: 999px; opacity: 0; }
.revlogo {''')
rep('''  focusCard("#iC0", ${R(56.0)});''', '''  focusCard("#iC0", ${R(56.0)});
  inn("#iDnd", ${R(56.45)}, { opacity: 0, y: 120 }, 0.5, "power3.out");
  tl.to("#iDndOff", { opacity: 1, duration: 0.35 }, ${R(57.0)});
  tl.fromTo("#iDndOff svg", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, ${R(57.1)});
  inn("#iDndLab", ${R(57.15)}, { opacity: 0, y: 10 }, 0.3);
  tl.to("#iDnd", { opacity: 0, y: 120, duration: 0.45, ease: "power2.in" }, ${R(58.3)});''')
rep('''  tl.fromTo("#iD-drawer", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, ${R(60.9)});''',
    '''  tl.fromTo("#iD-drawer", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, ${R(60.9)});
  tl.fromTo("#iScale", { scale: 1 }, { scale: 1.05, duration: 2.7, ease: "sine.inOut", immediateRender: false }, ${R(60.9)});''')
rep('document.querySelectorAll("#bTV *, .bcap *,', 'document.querySelectorAll("#bTV *, #iDnd *, #sTV *, .bcap *,')
open(p, "w", encoding="utf-8").write(s)
print("ok")
