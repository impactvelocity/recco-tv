# "And a really good show, that's the plan" plays on the TV browse grid instead of the room.
import re
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:90]
    s = s.replace(old, new)

rep('const rowNames = ["Trending now", "Because you watched", "New this week", "Top picks for you", "Popular on TV", "Award winners", "Continue browsing", "Critically acclaimed"];',
    'const rowNames = ["Trending now", "Because you watched", "New this week", "Top picks for you", "Popular on TV", "Award winners", "Comedies", "Thrillers", "Feel-good picks", "Continue browsing", "Critically acclaimed"];')
rep('<div class="bshade" id="bShade"></div>\n  <div class="bplan" id="bPlan">', '<div class="bshade" id="bShade" data-layout-allow-overlap></div>\n  <div class="bplan" id="bPlan" data-layout-allow-overlap>')
for cls in (".minilist", ".mlstrip", ".mltile", ".plan"):
    m = re.search(r"^%s \{[^\n]*\n" % re.escape(cls), s, re.M)
    assert m, cls
    s = s[:m.start()] + s[m.end():]
rep('document.querySelectorAll("#bGrid *, .bcap *,', 'document.querySelectorAll("#bGrid *, #bPlan *, .bcap *,')

# ---- A timeline
rep('''  tl.fromTo("#vwA", { scale: 1.0 }, { scale: 1.08, duration: T(7.75), ease: "none" }, 0);
  sceneFade("sA", 0, 7.75);
  drift("sA", 0, 7.75, 1.04);''', '''  tl.fromTo("#vwA", { scale: 1.0 }, { scale: 1.06, duration: T(6.1), ease: "none" }, 0);
  sceneFade("sA", 0, ${A_END});
  drift("sA", 0, ${A_END}, 1.03);''')
rep('''["${VO_INTRO + 2.64}", "${VO_INTRO + 3.1}", "${VO_INTRO + 3.83}", "${VO_INTRO + 4.47}"].forEach(''', '''["${VO_INTRO + 2.64}", "${VO_INTRO + 3.1}", "${VO_INTRO + 3.83}"].forEach(''')
rep('''bob("#ai" + i + " .iic", +t + 0.7, 7.75, 6, 0.9 + i * 0.1); });
  tl.to("#aItems", { y: -40, duration: 0.6, ease: "power2.inOut" }, ${VO_INTRO + 5.6});
  tl.fromTo("#aStrip", { y: 0 }, { y: -1400, duration: T(7.75) - T(${VO_INTRO + 4.47}), ease: "none" }, ${VO_INTRO + 4.47});
  words("#aPlan", ${VO_INTRO + 5.92}, 0.08);
''', '''bob("#ai" + i + " .iic", +t + 0.7, ${A_END}, 6, 0.9 + i * 0.1); });
''')

# ---- B timeline
rep('''  // ---- B · Browsing on the TV, then the phone takes the frame
  sceneFade("sB", 7.75, 16.35);
  tl.set("#bGrid", { y: 0 }, 7.75);
  tl.set("#bPhone", { scale: 1.12, transformOrigin: "50% 50%" }, 7.75);
  [[7.85, 0, 0], [8.15, 1, 0], [8.45, 2, 0], [8.75, 3, 0], [9.05, 2, 1], [9.3, 3, 1]].forEach(([t, c, r]) => tl.to("#bFocus", { x: c * 262, y: r * 484, duration: 0.22, ease: "power2.out" }, t));
''', '''  // ---- B · "and a really good show": hop along the top row, fling down through every row, land and pick one
  sceneFade("sB", ${B0}, 16.35);
  tl.set("#bPhone", { scale: 1.12, transformOrigin: "50% 50%" }, ${B0});
  const BP = ${JSON.stringify(browsePosters)}, bImg = (c, r) => "url(assets/posters/" + BP[(c * 3 + r * 5) % BP.length] + ".jpg)";
  const bHop = (t, c, r, scroll = false) => {
    tl.to("#bFocus", { x: c * 262, y: r * 484, duration: scroll ? 0.3 : 0.22, ease: "power2.out" }, t);
    tl.set("#bFocus", { backgroundImage: bImg(c, r) }, t + 0.06);
    if (scroll) tl.to("#bGrid", { y: -r * 484, duration: 0.3, ease: "power2.inOut" }, t);
  };
  tl.set("#bGrid", { y: 0 }, ${B0});
  tl.set("#bFocus", { x: 0, y: 0, backgroundImage: bImg(0, 0) }, ${B0});
  tl.fromTo("#bFocus", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1.06, duration: 0.3, ease: "back.out(2)" }, 5.55);
  bHop(5.68, 1, 0); bHop(5.82, 2, 0); bHop(5.96, 3, 0);
  // the fling: the focus lets go and the rows race past
  tl.to("#bFocus", { opacity: 0, duration: 0.08 }, 6.08);
  tl.to("#bGrid", { y: -7 * 484, duration: T(6.72) - T(6.1), ease: "power3.inOut" }, 6.1);
  tl.to("#bGrid", { filter: "blur(5px)", duration: 0.15, ease: "power1.in" }, 6.14);
  tl.to("#bGrid", { filter: "blur(0px)", duration: 0.18, ease: "power1.out" }, 6.52);
  tl.set("#bFocus", { x: 3 * 262, y: 7 * 484, scale: 0.92, backgroundImage: bImg(3, 7) }, 6.3);
  tl.to("#bFocus", { opacity: 1, scale: 1.06, duration: 0.25, ease: "back.out(2)" }, 6.68);
  // "That's the plan": press, the pick grows, the line lands
  tl.to("#bFocus", { scale: 0.98, duration: 0.1, ease: "power2.in" }, 6.88);
  tl.to("#bFocus", { scale: 1.14, duration: 0.45, ease: "back.out(2.2)" }, 6.98);
  tl.to("#bShade", { opacity: 1, duration: 0.4, ease: "power2.out" }, 6.9);
  words("#bPlan", 7.0, 0.08);
  out("#bPlan", 7.62, { opacity: 0, y: -16 }, 0.25);
  tl.to("#bShade", { opacity: 0, duration: 0.4 }, 7.65);
  tl.to("#bFocus", { scale: 1.06, duration: 0.3, ease: "power2.out" }, 7.7);
  // "but after ten minutes of looking": the focus keeps wandering
  bHop(7.85, 4, 7); bHop(8.1, 4, 8, true); bHop(8.35, 3, 8); bHop(8.6, 2, 8); bHop(8.85, 2, 9, true); bHop(9.1, 1, 9);
''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
