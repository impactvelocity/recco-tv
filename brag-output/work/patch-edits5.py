# Round 5: no flicker into "me time", an article link, a smooth hand-off into part two, a steady hackathon sticker,
# a logo-first launch screen, a cleaner agent spinner, and the seasons montage framed on a TV in the matching room.
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

# ---- 55s flicker + part-two hand-off: the room under "me time" starts a beat early (decoded before the cut),
# stays still, and runs until part two has faded in over it
rep('bgStill("winterNight", R(55.4), R(66.6) - R(55.4), "vwI");', 'bgStill("winterNight", R(54.0), R(67.6) - R(54.0), "vwI");')
rep('  tl.fromTo("#vwI", { scale: 1.0 }, { scale: 1.06, duration: 11.2, ease: "none" }, ${R(55.4)});\n', '')
rep('.kshade { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(16,22,22,.85), rgba(16,22,22,.55)); }',
    '.kshade { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(8,12,22,.82), rgba(8,12,22,.6)); }')

# ---- "a link": an article preview, laid out differently from Steph's video link
rep('''    if (m.kind === "link") {''', '''    if (m.kind === "article") {
      return `<div class="msg me" id="${m.id}"><div class="linkb art"><div class="athumb" style="background-image:url(assets/posters/${m.img}.jpg)"><span>10</span></div><div class="ameta"><div class="akick">${m.domain}</div><div class="lt">${m.title}</div></div></div></div>`;
    }
    if (m.kind === "link") {''')
rep('{ id: "m6", kind: "link", title: "Best films you probably missed", domain: "reelhub.cx", typeText: "reelhub.cx/best-films" }',
    '{ id: "m6", kind: "article", title: "10 mysteries to watch this weekend", domain: "screenlist.cx", img: "fog-house", typeText: "screenlist.cx/10-mysteries" }')
rep('msg: "a link: best films you probably missed"', 'msg: "a link: 10 mysteries to watch this weekend"')
rep('.lmeta { padding: 10px 14px 12px; }', '''.linkb.art { width: 270px; display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 16px; background: #2c2c2e; }
.athumb { position: relative; width: 74px; height: 74px; flex: none; border-radius: 10px; background-size: cover; background-position: center 35%; }
.athumb span { position: absolute; left: 6px; bottom: 2px; font-size: 30px; font-weight: 800; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.7); }
.ameta { min-width: 0; } .akick { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #F0B667; margin-bottom: 3px; }
.lmeta { padding: 10px 14px 12px; }''')

# ---- the hackathon sticker settles at its tilt in one move
rep('''  inn("#oSticker", V(0.9), { opacity: 0, scale: 0.6, rotation: -20 }, 0.55, "back.out(1.7)");
  tl.set("#oSticker", { rotation: -7 }, V(0.9) + 0.56);''',
    '''  tl.fromTo("#oSticker", { opacity: 0, scale: 0.6, rotation: -20 }, { opacity: 1, scale: 1, rotation: -7, duration: 0.55, ease: "back.out(1.7)" }, V(0.9));''')

# ---- first launch: the logo fades in alone in the middle, then rises to reveal the code and the words under it
rep('''  tl.fromTo("#oCode", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, V(5.6));''',
'''  tl.fromTo("#oCode", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, V(5.6));
  const ocCol = S("#oCode .center-col"), ocLogo = ocCol.querySelector("img"), ocRest = [...ocCol.children].filter((e) => e !== ocLogo && !e.querySelector(".digit"));
  const ocDy = 540 - (ocLogo.offsetTop + ocLogo.offsetHeight / 2);
  tl.set(ocLogo, { y: ocDy, scale: 1.6 }, O0);
  tl.set(ocRest, { opacity: 0, y: 24 }, O0);
  tl.to(ocLogo, { y: 0, scale: 1, duration: 0.6, ease: "power3.inOut" }, V(6.2));
  tl.to(ocRest, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }, V(6.45));''')

# ---- the agent at work: its icon steps aside for a spinner inside the same tile
rep('.aring { position: absolute; left: 14px; top: 50%; width: 72px; height: 72px; margin-top: -36px; border-radius: 50%; border: 3px solid rgba(240,182,103,.18); border-top-color: #F0B667; border-right-color: #F0B667; opacity: 0;',
    '.aring { position: absolute; left: 32px; top: 50%; width: 36px; height: 36px; margin-top: -18px; border-radius: 50%; border: 4px solid rgba(240,182,103,.22); border-top-color: #F0B667; opacity: 0;')
rep('''  tl.fromTo("#o-agent .nic", { scale: 1 }, { scale: 1.12, duration: 0.45, yoyo: true, repeat: 2 * Math.floor((T(AW1) - T(AW0)) / 0.9) - 1, ease: "sine.inOut", immediateRender: false }, AW0);''',
    '''  tl.to("#o-agent .nic svg", { opacity: 0, scale: 0.6, duration: 0.2 }, AW0);
  tl.to("#o-agent .nic svg", { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.8)" }, AW1);''')

# ---- seasons montage: on a TV in the matching room; the focus is the card's own highlight in each theme's colour
rep('const vS = seasonOrder.map((t, i) => { const a = i === 0 ? seasonT[0] : seasonT[i] - 0.05,', 'const vS = seasonOrder.map((t, i) => { const a = i === 0 ? 90.0 : seasonT[i] - 0.05,')
rep('const seasonVidIds = vS.map(([t, s, d], i) => (i === 0 ? bgStill(t, s, d) : bgVideo(t, s, d, 0)));',
    '''// behind the TV: the same room as the app's background (the new stills where there are any, the loops otherwise)
const NEW_STILLS = ["winterNight", "fallDay", "summerNight", "springDay"];
const seasonVidIds = vS.map(([t, s, d]) => (NEW_STILLS.includes(t) ? bgStill(t, s, d) : bgVideo(t, s, d, 0)));''')
rep('''scene("sS", 90.96, S_END, `<div class="fullscale" id="sScale">${seasonOrder.map((t, i) => screen({ theme: t, id: `sScr${i}`, still: false, body: grid(seasonCards), cls: "season" })).join("")}<div class="sring" id="sRing"></div></div>''',
    '''scene("sS", 90.96, S_END, `${tvFrame("sTV", seasonOrder.map((t, i) => screen({ theme: t, id: `sScr${i}`, still: true, body: grid(seasonCards), cls: "season" })).join(""), { x: 258, y: 128, w: 1380 })}''')
a = s.index('  tl.set("#sRing", { scale: 1.06, opacity: 0, x: 0, y: 0, borderColor: focusCols[0] }, 90.96);')
b = s.index('  tl.fromTo("#uEnd", { opacity: 0 }')
s = s[:a] + '''  // focus walks the cards: the focused card lifts and takes the theme's focus outline in every season's copy
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
''' + s[b:]
# part two's TV grows into exactly that TV, and its dark stage lifts to show the room
rep('''  tl.to("#oTV", { ...FULLO, duration: 0.9, ease: "power3.inOut" }, V(41.0));
  tl.to("#oTV .tvglass", { borderRadius: 0, duration: 0.9 }, V(41.0));''',
    '''  tl.to("#oTV", { x: 248, y: -86, scale: 1380 / 1180, duration: 0.9, ease: "power3.inOut" }, V(41.0));
  tl.to("#sO .stage", { opacity: 0, duration: 0.8, ease: "power1.inOut" }, V(41.0));''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
