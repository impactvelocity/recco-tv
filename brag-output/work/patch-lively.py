# Applies the "more lively" pass to composition/src/build.mjs. Run once: python3 -I patch-lively.py
import sys

P = "composition/src/build.mjs"
s = open(P).read()

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        sys.exit(f"expected {count} match(es), found {n}: {a[:90]!r}")
    s = s.replace(a, b)

# ------------------------------------------------------------ build-time helpers
rep('''// captions
const kicker''', '''// captions
// words split for a rise-in reveal: <span class="w"><span class="wi">word</span></span>
const W = (text) => text.split(" ").map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(" ");
const kicker''')

# every scene gets a camera wrapper
rep('''data-track-index="2" ${extra}>${html}</section>`);''', '''data-track-index="2" ${extra}><div class="cam" id="${id}-cam">${html}</div></section>`);''')

# ------------------------------------------------------------ word-split headlines
for old, new in [
    ('<div class="line big" id="a1">9pm.</div>', '<div class="line big" id="a1">${W("9pm.")}</div>'),
    ('<div class="line" id="a2">Kids are down.</div>', '<div class="line" id="a2">${W("Kids are down.")}</div>'),
    ('<div class="line accent" id="a3">This is my time.</div>', '<div class="line accent" id="a3">${W("This is my time.")}</div>'),
    ('<div class="plan" id="aPlan">That’s the plan.</div>', '<div class="plan" id="aPlan">${W("That’s the plan.")}</div>'),
    ('<div class="line" id="b1">Ten minutes of looking.</div><div class="line" id="b2">No time left for an episode.</div><div class="line accent" id="b3">So I just keep scrolling.</div>',
     '<div class="line" id="b1">${W("Ten minutes of looking.")}</div><div class="line" id="b2">${W("No time left for an episode.")}</div><div class="line accent" id="b3">${W("So I just keep scrolling.")}</div>'),
    ('<div class="line" id="c1">My best shows come from friends.</div><div class="line accent" id="c2">I just never remember what they told me.</div>',
     '<div class="line" id="c1">${W("My best shows come from friends.")}</div><div class="line accent" id="c2">${W("I just never remember what they told me.")}</div>'),
    ('<div class="soNow" id="d1">So now, I use</div>', '<div class="soNow" id="d1">${W("So now, I use")}</div>'),
    ('<div class="caph" id="eH1">Install Recco on Fire TV.</div>', '<div class="caph" id="eH1">${W("Install Recco on Fire TV.")}</div>'),
    ('<div class="caph" id="eH2">Text the code to the Recco number.</div>', '<div class="caph" id="eH2">${W("Text the code to the Recco number.")}</div>'),
    ('<div class="caph" id="eH3">The Recco agent looks it up.</div>', '<div class="caph" id="eH3">${W("The Recco agent looks it up.")}</div>'),
    ('<div class="caph" id="eH4">Jill says a sitcom is hilarious.</div>', '<div class="caph" id="eH4">${W("Jill says a sitcom is hilarious.")}</div>'),
    ('<div class="caph" id="eH5">One link, three reccos.</div>', '<div class="caph" id="eH5">${W("One link, three reccos.")}</div>'),
    ('<div class="line" id="j1">And my phone stays</div><div class="line accent" id="j2">in the other room.</div>',
     '<div class="line" id="j1">${W("And my phone stays")}</div><div class="line accent" id="j2">${W("in the other room.")}</div>'),
    ('<div class="tagrow"><span id="k1">From a friend,</span> <span id="k2">a link,</span> <span id="k3">or you.</span></div>',
     '<div class="tagrow">${W("From a friend, a link, or you.")}</div>'),
    ('<div class="tagready" id="k4">Ready when you are.</div>', '<div class="tagready" id="k4">${W("Ready when you are.")}</div>'),
    ('<div class="chapt" id="l1">How Recco is built</div>', '<div class="chapt" id="l1">${W("How Recco is built")}</div>'),
    ('<div class="caph" id="nH1">Built with React Native for Vega.</div>', '<div class="caph" id="nH1">${W("Built with React Native for Vega.")}</div>'),
    ('<div class="caph" id="nH2">First launch shows a five-digit code.</div>', '<div class="caph" id="nH2">${W("First launch shows a five-digit code.")}</div>'),
    ('<div class="caph" id="nH3">Text it, and phone and TV are linked.</div>', '<div class="caph" id="nH3">${W("Text it, and phone and TV are linked.")}</div>'),
    ('<div class="qcap" id="qCap">Every title is checked against a real movie database.</div>', '<div class="qcap" id="qCap">${W("Every title is checked against a real movie database.")}</div>'),
    ('<div class="tagready">Just tell Alexa what to watch.</div></div>`);', '<div class="tagready" id="uTag">${W("Just tell Alexa what to watch.")}</div></div>`);'),
]:
    rep(old, new)

# ------------------------------------------------------------ B: more rows for the final rush
rep('const rowNames = ["Trending now", "Because you watched", "New this week", "Top picks for you", "Popular on TV", "Award winners", "Continue browsing"];',
    'const rowNames = ["Trending now", "Because you watched", "New this week", "Top picks for you", "Popular on TV", "Award winners", "Continue browsing", "Critically acclaimed", "Comedies", "Thrillers", "Watch it again", "Hidden gems", "Late night picks"];')

# ------------------------------------------------------------ diagram: flowing dashes + more packets
rep('''const diagram = (p) => `<svg class="edges" width="1920" height="1080" viewBox="0 0 1920 1080">${EDGES.map((e, i) => `<path id="${p}-e${i}" d="${edgePath(e)}" pathLength="1"/>`).join("")}</svg>
  ${NODES.map((n) => node(n, p)).join("")}
  ${[0, 1, 2].map((i) => `<div class="packet" id="${p}-pk${i}"></div>`).join("")}`;''',
'''const diagram = (p) => `<svg class="edges" width="1920" height="1080" viewBox="0 0 1920 1080">${EDGES.map((e, i) => `<path id="${p}-e${i}" d="${edgePath(e)}" pathLength="1"/>`).join("")}${EDGES.map((e, i) => `<path class="flow" id="${p}-f${i}" d="${edgePath(e)}"/>`).join("")}</svg>
  ${NODES.map((n) => node(n, p)).join("")}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<div class="packet" id="${p}-pk${i}"></div>`).join("")}`;''')

# P: halo behind the agent core
rep('<div class="agent" id="pAgent"><div class="ring" id="pRing"></div>', '<div class="agent" id="pAgent"><div class="halo" id="pHalo"></div><div class="ring" id="pRing"></div>')

# Q: typed search
rep('<div class="qsearch" id="qS">${ic.search(28)} top films for a stormy night</div>',
    '<div class="qsearch" id="qS">${ic.search(28)} <span class="qtyped">${[..."top films for a stormy night"].map((c) => `<i>${c === " " ? "&nbsp;" : c}</i>`).join("")}</span></div>')

# R: one number field that scrambles into a hash
rep('<div class="pnum"><span id="rNum">+1 (604) 555-0189</span><span id="rHash">7f3a·9c21·e0b4</span></div>',
    '<div class="pnum"><span id="rNum">+1 (604) 555-0189</span></div>')

# S: a focus ring that hops across the cards on the beat
rep('''cls: "season" })).join("")}</div>`);''', '''cls: "season" })).join("")}<div class="sring" id="sRing"></div></div>`);''')

# orbs behind everything (only visible on the dark presentation scenes)
rep('''      ${videos.join("\\n      ")}''', '''      <div class="orb" id="orb0"></div><div class="orb" id="orb1"></div><div class="orb" id="orb2"></div>
      ${videos.join("\\n      ")}''')

# ------------------------------------------------------------ timeline helpers
rep('''const sceneFade = (id, s, e) => { tl.fromTo("#" + id, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "none" }, s); tl.to("#" + id, { opacity: 0, duration: 0.3, ease: "none" }, e - 0.3); };''',
'''const sceneFade = (id, s, e) => { tl.fromTo("#" + id, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, s); tl.to("#" + id, { opacity: 0, scale: 0.985, duration: 0.3, ease: "power1.in" }, e - 0.3); };
// slow camera drift on a scene's inner wrapper
const drift = (id, s, e, to = 1.035) => tl.fromTo("#" + id + "-cam", { scale: 1 }, { scale: to, duration: e - s, ease: "none" }, s);
// headline: words rise in one after another
const words = (sel, t, stagger = 0.06, dur = 0.6) => { tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: 0.01 }, t); tl.fromTo(sel + " .wi", { yPercent: 115, rotation: 5 }, { yPercent: 0, rotation: 0, duration: dur, stagger, ease: "power4.out" }, t); };
// icon pop inside a node or card
const pop = (sel, t) => tl.fromTo(sel, { scale: 0.4, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.6)" }, t);
// gentle floating, a finite number of half-cycles
const bob = (sel, s, e, amp = 8, half = 1.6) => tl.fromTo(sel, { y: 0 }, { y: -amp, duration: half, yoyo: true, repeat: Math.max(0, Math.floor((e - s) / half) - 1), ease: "sine.inOut", immediateRender: false }, s);''')

# ------------------------------------------------------------ A
rep('''  inn("#a1", ${VO_INTRO}, { opacity: 0, y: 40 }, 0.5);
  inn("#a2", ${VO_INTRO + 0.36}, { opacity: 0, y: 30 }, 0.5);
  inn("#a3", ${VO_INTRO + 1.46}, { opacity: 0, y: 30 }, 0.5);''',
'''  drift("sA", 0, 7.75, 1.04);
  words("#a1", ${VO_INTRO}, 0.06, 0.7);
  words("#a2", ${VO_INTRO + 0.36});
  words("#a3", ${VO_INTRO + 1.46});''')
rep('''.forEach((t, i) => inn("#ai" + i, +t, { opacity: 0, y: 40, scale: 0.9 }, 0.5, "back.out(1.6)"));''',
'''.forEach((t, i) => { inn("#ai" + i, +t, { opacity: 0, y: 60, scale: 0.85, rotation: i % 2 ? 3 : -3 }, 0.6, "back.out(1.8)"); pop("#ai" + i + " .iic", +t + 0.1); bob("#ai" + i + " .iic", +t + 0.7, 7.75, 6, 0.9 + i * 0.1); });''')
rep('''  inn("#aPlan", ${VO_INTRO + 5.92}, { opacity: 0, y: 30 }, 0.5);''', '''  words("#aPlan", ${VO_INTRO + 5.92}, 0.08);''')

# ------------------------------------------------------------ B: row-by-row browsing, then the rush
rep('''  tl.fromTo("#bGrid", { y: 0 }, { y: -1150, duration: 8.6, ease: "power1.in" }, 7.75);
  [[8.0, 1, 0], [8.7, 2, 0], [9.4, 2, 1], [10.1, 3, 1], [10.9, 1, 2], [11.6, 4, 2], [12.4, 3, 3], [13.2, 1, 4], [13.9, 2, 5], [14.6, 0, 6]].forEach(([t, c, r]) => tl.to("#bFocus", { x: c * 262, y: r * 484, duration: 0.25, ease: "power2.out" }, t));''',
'''  tl.set("#bGrid", { y: 0 }, 7.75);
  let lastRow = 0;
  [[8.0, 1, 0], [8.55, 2, 0], [9.1, 2, 1], [9.6, 3, 1], [10.15, 1, 2], [10.7, 4, 2], [11.3, 3, 3], [11.9, 1, 4], [12.5, 2, 5], [13.1, 0, 6], [13.65, 2, 7], [14.2, 1, 8]].forEach(([t, c, r]) => {
    tl.to("#bFocus", { x: c * 262, y: r * 484, duration: 0.22, ease: "power2.out" }, t);
    if (r !== lastRow && r >= 2) tl.to("#bGrid", { y: -(r - 1) * 484, duration: 0.35, ease: "power3.inOut" }, t);
    lastRow = r;
  });
  tl.to("#bGrid", { y: -(11 * 484), duration: 1.6, ease: "power2.in" }, 14.75);
  tl.to("#bFocus", { opacity: 0, duration: 0.2 }, 14.75);''')
rep('''  inn("#b1", 7.95, { opacity: 0, y: 24 }, 0.5);''', '''  words("#b1", 7.95);''')
rep('''  inn("#b2", 12.3, { opacity: 0, y: 24 }, 0.5);''', '''  words("#b2", 12.3);''')
rep('''  inn("#b3", 14.8, { opacity: 0, y: 24 }, 0.4);''', '''  words("#b3", 14.8, 0.05, 0.5);''')
rep('''  tl.to(".btile", { filter: "blur(5px)", duration: 1.0, ease: "power1.in" }, 15.0);''', '''  tl.to("#bGrid", { filter: "blur(6px)", duration: 1.0, ease: "power1.in" }, 15.1);''')

# ------------------------------------------------------------ C
rep('''  [16.45, 16.75, 17.05, 17.35, 17.65].forEach((t, i) => { inn("#fb" + i, t, { opacity: 0, y: 40, scale: 0.92 }, 0.55, "back.out(1.5)");''',
'''  drift("sC", 16.35, 20.85, 1.05);
  [16.45, 16.75, 17.05, 17.35, 17.65].forEach((t, i) => { inn("#fb" + i, t, { opacity: 0, y: 50, x: i % 2 ? 60 : -40, scale: 0.85 }, 0.6, "back.out(1.7)");''')
rep('''  inn("#c1", 16.45, { opacity: 0, y: 30 }, 0.55);''', '''  words("#c1", 16.45);''')
rep('''  inn("#c2", 18.9, { opacity: 0, y: 30 }, 0.55);''', '''  words("#c2", 18.9, 0.05);''')

# ------------------------------------------------------------ D
rep('''  inn("#d1", 20.9, { opacity: 0, y: 20 }, 0.4);
  inn("#dLogo", 22.12 - 0.5, { opacity: 0, scale: 0.85, filter: "blur(8px)" }, 0.55, "power3.out");''',
'''  drift("sD", 20.85, 22.4, 1.04);
  words("#d1", 20.9, 0.07, 0.5);
  inn("#dLogo", 21.55, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.6, "back.out(1.8)");''')

# ------------------------------------------------------------ E: punch-ins, floating phone, word captions
rep('''  inn("#eTV", 22.45, { opacity: 0, y: 60, scale: 0.96 }, 0.7);
  inn("#ePhone", 22.7, { opacity: 0, y: 120, rotation: 4 }, 0.7);
  inn("#eK1", 22.5, { opacity: 0, y: 14 }, 0.4); inn("#eH1", 22.6, { opacity: 0, y: 20 }, 0.5);
  out("#eH1", 24.55, { opacity: 0, y: -14 }, 0.22); inn("#eH2", 24.75, { opacity: 0, y: 20 }, 0.4);''',
'''  inn("#eTV", 22.45, { opacity: 0, y: 80, scale: 0.92 }, 0.8, "power4.out");
  inn("#ePhone", 22.7, { opacity: 0, y: 160, rotation: 6 }, 0.8, "back.out(1.3)");
  bob("#ePhone", 23.6, 37.2, 10, 1.8);
  inn("#eK1", 22.5, { opacity: 0, y: 14 }, 0.4); words("#eH1", 22.6);
  out("#eH1", 24.55, { opacity: 0, y: -14 }, 0.22); words("#eH2", 24.75, 0.05);
  // camera punches toward the first inbox slot each time a card lands
  tl.set("#sE-cam", { transformOrigin: "352px 512px" }, 22.4);
  [[29.55, 30.5], [32.75, 33.75], [35.65, 36.95]].forEach(([a, b]) => { tl.to("#sE-cam", { scale: 1.06, duration: 0.55, ease: "power3.out" }, a); tl.to("#sE-cam", { scale: 1, duration: 0.6, ease: "power2.inOut" }, b); });''')
rep('''  out("#eH2", 26.9, { opacity: 0, y: -14 }, 0.25); inn("#eH3", 27.1, { opacity: 0, y: 20 }, 0.45);''',
    '''  out("#eH2", 26.9, { opacity: 0, y: -14 }, 0.25); words("#eH3", 27.1);''')
rep('''  out("#eH3", 30.6, { opacity: 0, y: -14 }, 0.25); inn("#eH4", 30.8, { opacity: 0, y: 20 }, 0.45);''',
    '''  out("#eH3", 30.6, { opacity: 0, y: -14 }, 0.25); words("#eH4", 30.8);''')
rep('''  out("#eH4", 34.0, { opacity: 0, y: -14 }, 0.25); inn("#eH5", 34.2, { opacity: 0, y: 20 }, 0.45);''',
    '''  out("#eH4", 34.0, { opacity: 0, y: -14 }, 0.25); words("#eH5", 34.2, 0.07);''')
rep('''  inn("#eK-chk", 26.35, { opacity: 0, scale: 0.4 }, 0.45, "back.out(2)");''', '''  inn("#eK-chk", 26.3, { opacity: 0, scale: 0.3, rotation: -40 }, 0.55, "back.out(2.6)");''')
rep('''  tl.to("#sE", { opacity: 0, duration: 0.3 }, 37.2);''', '''  tl.to("#sE", { opacity: 0, scale: 0.985, duration: 0.3 }, 37.2);''')
rep('''  tl.fromTo("#sE", { opacity: 0 }, { opacity: 1, duration: 0.35 }, 22.4);''', '''  tl.fromTo("#sE", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 22.4);''')

# ------------------------------------------------------------ I: cards ripple in, push toward King of Queens, drawer
rep('''  tl.fromTo("#iScale", { scale: 1.04 }, { scale: 1.0, duration: 5, ease: "power1.out" }, 37.5);''',
'''  tl.set("#iScale", { transformOrigin: "50% 35%" }, 37.5);
  tl.fromTo("#iScale", { scale: 1.06 }, { scale: 1.0, duration: 0.9, ease: "power2.out" }, 37.5);
  tl.fromTo("#iScr .grid .card", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, 37.5);
  tl.to("#iScale", { scale: 1.07, duration: 0.7, ease: "power2.inOut" }, 38.75);
  tl.to("#iScale", { scale: 1.0, duration: 0.5, ease: "power3.out" }, 39.55);''')
rep('''  focusCard("#iC0", 37.9);''', '''  focusCard("#iC0", 38.0);''')

# ------------------------------------------------------------ J, K
rep('''  inn("#j1", 42.6, { opacity: 0, y: 24 }, 0.5);
  inn("#j2", 43.25, { opacity: 0, y: 24 }, 0.5);''', '''  words("#j1", 42.6);
  words("#j2", 43.25);''')
rep('''  inn("#kLogo", 44.45, { opacity: 0, scale: 0.9, filter: "blur(8px)" }, 0.6);
  inn("#k1", ${VO_INTRO + 44.22}, { opacity: 0, y: 20 }, 0.4);
  inn("#k2", ${VO_INTRO + 44.96}, { opacity: 0, y: 20 }, 0.4);
  inn("#k3", ${VO_INTRO + 45.42}, { opacity: 0, y: 20 }, 0.4);
  inn("#k4", ${VO_INTRO + 45.86}, { opacity: 0, y: 20 }, 0.5);''',
'''  drift("sK", 44.4, 47.9, 1.05);
  inn("#kLogo", 44.4, { opacity: 0, scale: 0.75, rotation: -3, filter: "blur(8px)" }, 0.7, "back.out(1.7)");
  // each phrase lands on its word: friend, link, you
  const kw = document.querySelectorAll(".tagrow .wi");
  [${VO_INTRO + 44.22}, ${VO_INTRO + 44.47}, ${VO_INTRO + 44.53}, ${VO_INTRO + 44.96}, ${VO_INTRO + 45.04}, ${VO_INTRO + 45.42}, ${VO_INTRO + 45.58}].forEach((t, i) => tl.fromTo(kw[i], { yPercent: 115, rotation: 5 }, { yPercent: 0, rotation: 0, duration: 0.5, ease: "power4.out" }, t));
  words("#k4", ${VO_INTRO + 45.86}, 0.07);''')

# ------------------------------------------------------------ L, M
rep('''  inn("#l1", 48.15, { opacity: 0, y: 30 }, 0.55);''', '''  drift("sL", 47.9, 50.0, 1.05);
  words("#l1", 48.15, 0.09, 0.7);''')
rep('''  inn("#mLogo", 50.05, { opacity: 0, y: 20 }, 0.5);''', '''  drift("sM", 50.0, 52.75, 1.04);
  inn("#mLogo", 50.05, { opacity: 0, y: 30, scale: 0.8 }, 0.6, "back.out(1.8)");''')
for k, t in [("mB", "1.15"), ("mS", "1.53"), ("mSh", "1.84")]:
    rep(f'''  inn("#{k}", ${{VO_BUILT + {t}}}, {{ opacity: 0, y: 30, scale: 0.9 }}, 0.4, "back.out(1.8)");''',
        f'''  inn("#{k}", ${{VO_BUILT + {t}}}, {{ opacity: 0, y: 70, scale: 0.6, rotation: -8 }}, 0.5, "back.out(2.4)");''')

# ------------------------------------------------------------ N
rep('''  inn("#nTV", 52.8, { opacity: 0, y: 60, scale: 0.96 }, 0.7);
  inn("#nK1", 52.85, { opacity: 0, y: 14 }, 0.4); inn("#nH1", 52.95, { opacity: 0, y: 20 }, 0.5);''',
'''  drift("sN", 52.75, 60.7, 1.03);
  inn("#nTV", 52.8, { opacity: 0, y: 80, scale: 0.92 }, 0.8, "power4.out");
  inn("#nK1", 52.85, { opacity: 0, y: 14 }, 0.4); words("#nH1", 52.95);''')
rep('''inn("#nH2", ${VO_BUILT + 5.4}, { opacity: 0, y: 20 }, 0.45);''', '''words("#nH2", ${VO_BUILT + 5.4}, 0.05);''')
rep('''  inn("#nPhone", ${VO_BUILT + 7.4}, { opacity: 0, y: 120, rotation: 4 }, 0.6);''', '''  inn("#nPhone", ${VO_BUILT + 7.4}, { opacity: 0, y: 160, rotation: 6 }, 0.7, "back.out(1.3)");''')
rep('''inn("#nH3", ${VO_BUILT + 7.7}, { opacity: 0, y: 20 }, 0.45);''', '''words("#nH3", ${VO_BUILT + 7.7}, 0.05);''')
rep('''  inn("#nK-chk", ${VO_BUILT + 9.9}, { opacity: 0, scale: 0.4 }, 0.45, "back.out(2)");''', '''  inn("#nK-chk", ${VO_BUILT + 9.85}, { opacity: 0, scale: 0.3, rotation: -40 }, 0.55, "back.out(2.6)");''')

# ------------------------------------------------------------ O: livelier nodes, flowing edges, packet stream
rep('''  const nodeIn = (id, t) => inn(id, t, { opacity: 0, y: 30, scale: 0.94 }, 0.5, "back.out(1.5)");''',
'''  drift("sO", 60.7, 69.35, 1.03);
  const nodeIn = (id, t) => { inn(id, t, { opacity: 0, y: 50, scale: 0.8 }, 0.6, "back.out(1.9)"); pop(id + " .nic", t + 0.12); };
  const flowOn = (p, i, t, until) => { tl.fromTo("#" + p + "-f" + i, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, t); tl.fromTo("#" + p + "-f" + i, { strokeDashoffset: 0 }, { strokeDashoffset: -48 * Math.round((until - t) * 2.2), duration: until - t, ease: "none" }, t); };''')
rep('''  pk("#o-pk0", [cxy("phone"), cxy("zernio"), cxy("lambda"), cxy("sqs")], 62.0);
  pk("#o-pk1", [cxy("phone"), cxy("zernio"), cxy("lambda"), cxy("sqs")], 64.4);''',
'''  const row1 = [cxy("phone"), cxy("zernio"), cxy("lambda"), cxy("sqs")];
  [62.0, 64.4, 65.5, 66.4, 67.3, 68.2].forEach((t, i) => pk("#o-pk" + i, row1, t));
  flowOn("o", 0, 61.7, 69.35); flowOn("o", 1, 62.75, 69.35); flowOn("o", 2, 65.05, 69.35);''')
rep('''  nodeIn("#o-tv", ${VO_BUILT + 17.64});''', '''  nodeIn("#o-tv", ${VO_BUILT + 17.64});
  tl.fromTo("#o-sqs .qbars i", { scaleX: 1 }, { scaleX: 0.55, duration: 0.226, yoyo: true, repeat: 11, stagger: 0.113, ease: "sine.inOut", immediateRender: false }, 66.6);''')

# ------------------------------------------------------------ P: breathing agent, inputs fly in, outputs burst out
rep('''  inn("#pAgent", ${VO_BUILT + 19.6}, { opacity: 0, scale: 0.8 }, 0.7, "back.out(1.4)");
  tl.fromTo("#pRing", { rotation: 0 }, { rotation: 140, duration: 11.5, ease: "none" }, 69.35);
  tl.fromTo("#pRing2", { rotation: 0 }, { rotation: -100, duration: 11.5, ease: "none" }, 69.35);''',
'''  drift("sP", 69.35, 81.1, 1.03);
  inn("#pAgent", ${VO_BUILT + 19.6}, { opacity: 0, scale: 0.5, rotation: -30 }, 0.9, "back.out(1.6)");
  tl.fromTo("#pRing", { rotation: 0 }, { rotation: 300, duration: 11.75, ease: "none" }, 69.35);
  tl.fromTo("#pRing2", { rotation: 0 }, { rotation: -220, duration: 11.75, ease: "none" }, 69.35);
  tl.fromTo("#pAgent .acore svg", { rotation: 0 }, { rotation: 180, duration: 11.75, ease: "none" }, 69.35);
  tl.fromTo("#pHalo", { scale: 0.92, opacity: 0.55 }, { scale: 1.08, opacity: 1, duration: 0.904, yoyo: true, repeat: 10, ease: "sine.inOut" }, 70.4);
  // where things are, in scene pixels (measured once, before the timeline is registered)
  const ctr = (el) => { let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el; while (n && n.id !== "sP-cam") { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return [x, y]; };
  const [ax, ay] = ctr(S("#pAgent"));''')
rep('''  tl.to("#pIn0, #pIn1, #pIn2", { x: 260, opacity: 0, scale: 0.6, duration: 0.6, stagger: 0.12, ease: "power2.in" }, ${VO_BUILT + 26.2});''',
'''  ["#pIn0", "#pIn1", "#pIn2"].forEach((id, i) => { const [x, y] = ctr(S(id)); tl.to(id, { x: ax - x, y: ay - y, scale: 0.15, opacity: 0, duration: 0.6, ease: "power2.in" }, ${VO_BUILT + 26.2} + i * 0.12); });''')
rep('''  inn("#pOut0", ${VO_BUILT + 27.23}, { opacity: 0, x: -50 }, 0.45);
  inn("#pOut1", ${VO_BUILT + 27.78}, { opacity: 0, x: -50 }, 0.45);
  inn("#pOut2", ${VO_BUILT + 28.49}, { opacity: 0, x: -50 }, 0.45);''',
'''  [["#pOut0", ${VO_BUILT + 27.23}], ["#pOut1", ${VO_BUILT + 27.78}], ["#pOut2", ${VO_BUILT + 28.49}]].forEach(([id, t]) => { const [x, y] = ctr(S(id)); inn(id, t, { opacity: 0, x: ax - x, y: ay - y, scale: 0.2 }, 0.65, "back.out(1.3)"); pop(id + " .oic", t + 0.35); });''')

# ------------------------------------------------------------ Q: typed search, tumbling posters, pops, shake
rep('''  inn("#qS", 81.15, { opacity: 0, y: -20 }, 0.45);
  [0, 1, 2, 3].forEach((i) => inn("#q" + i, 81.3 + i * 0.12, { opacity: 0, y: 50 }, 0.55));
  [0, 1, 2].forEach((i) => inn("#qb" + i, ${VO_BUILT + 32.2} + i * 0.25, { opacity: 0, scale: 0.5 }, 0.4, "back.out(2)"));
  inn("#qx", ${VO_BUILT + 33.7}, { opacity: 0, scale: 0.6 }, 0.4, "back.out(2)");''',
'''  drift("sQ", 81.1, 84.95, 1.03);
  inn("#qS", 81.15, { opacity: 0, y: -20 }, 0.4);
  const qc = document.querySelectorAll("#qS .qtyped i");
  tl.fromTo(qc, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.6 / qc.length, ease: "none" }, 81.3);
  [0, 1, 2, 3].forEach((i) => inn("#q" + i, 81.45 + i * 0.1, { opacity: 0, y: 120, rotation: [-6, 4, -3, 5][i], scale: 0.85 }, 0.7, "back.out(1.5)"));
  [0, 1, 2].forEach((i) => { const t = ${VO_BUILT + 32.2} + i * 0.25; inn("#qb" + i, t, { opacity: 0, scale: 0.4 }, 0.45, "back.out(2.4)"); tl.fromTo("#q" + i + " .qp", { scale: 1 }, { scale: 1.05, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, t); });
  inn("#qx", ${VO_BUILT + 33.7}, { opacity: 0, scale: 0.5 }, 0.4, "back.out(2.4)");
  tl.fromTo("#q3 .qp", { x: 0 }, { x: -12, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut" }, ${VO_BUILT + 33.75});''')
rep('''  inn("#qCap", 81.6, { opacity: 0, y: 16 }, 0.5);''', '''  words("#qCap", 81.7, 0.05);''')

# ------------------------------------------------------------ R: flows, packet stream, icon pops, scramble
rep('''  inn("#rK", 85.0, { opacity: 0, y: 14 }, 0.4);''', '''  drift("sR", 84.95, 91.95, 1.03);
  inn("#rK", 85.0, { opacity: 0, y: 14 }, 0.4);
  [0, 1, 2, 3].forEach((i) => flowOn("r", i, 84.95, 91.95));
  flowOn("r", 4, ${VO_BUILT + 35.1}, 91.95); flowOn("r", 5, ${VO_BUILT + 36.5}, 91.95); flowOn("r", 6, ${VO_BUILT + 36.6}, 91.95);
  pop("#r-ddb .nic", ${VO_BUILT + 35.0}); pop("#r-appsync .nic", ${VO_BUILT + 36.45}); pop("#r-tv .nic", ${VO_BUILT + 38.2});''')
rep('''  pk("#r-pk0", [cxy("agent"), cxy("ddb"), cxy("appsync"), cxy("tv")], ${VO_BUILT + 36.9});
  pk("#r-pk1", [cxy("sqs"), cxy("agent"), cxy("ddb"), cxy("appsync"), cxy("tv")], 85.1);''',
'''  pk("#r-pk0", [cxy("sqs"), cxy("agent"), cxy("ddb")], 85.1);
  const row2 = [cxy("agent"), cxy("ddb"), cxy("appsync"), cxy("tv")];
  [86.9, 87.8, 88.7, 89.6, 90.5].forEach((t, i) => pk("#r-pk" + (i + 1), row2, t));''')
rep('''  inn("#rP0", ${VO_BUILT + 38.92}, { opacity: 0, y: 40 }, 0.5);
  tl.set("#rHash", { opacity: 0 }, 84.95);
  tl.to("#rNum", { opacity: 0, filter: "blur(6px)", duration: 0.35 }, ${VO_BUILT + 39.75});
  tl.fromTo("#rHash", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.35, immediateRender: false }, ${VO_BUILT + 39.85});
  inn("#rP1", ${VO_BUILT + 40.42}, { opacity: 0, y: 40 }, 0.5);''',
'''  inn("#rP0", ${VO_BUILT + 38.92}, { opacity: 0, y: 60, scale: 0.9 }, 0.55, "back.out(1.6)");
  pop("#rP0 .pic", ${VO_BUILT + 39.1});
  const scramble = ["+1 (604) 555-0189", "+1 (6#4) 5$5-0%89", "+7 f6#a 9!5-c2?9", "7f3a·9c2!·e#b4", "7f3a·9c21·e0b4"], numEl = S("#rNum"), sc = { p: 0 };
  tl.fromTo(sc, { p: 0 }, { p: 1, duration: 0.7, ease: "none", onUpdate: () => { numEl.textContent = scramble[Math.min(scramble.length - 1, Math.floor(sc.p * scramble.length))]; } }, ${VO_BUILT + 39.6});
  inn("#rP1", ${VO_BUILT + 40.42}, { opacity: 0, y: 60, scale: 0.9 }, 0.55, "back.out(1.6)");
  pop("#rP1 .pic", ${VO_BUILT + 40.6});''')

# ------------------------------------------------------------ S/T: focus ring hops on the beat, color follows the theme
rep('''  const seasonT = [91.95, 94.65, 95.45, 96.15, 96.8, 97.75];''',
'''  const seasonT = [91.95, 94.65, 95.45, 96.15, 96.8, 97.75];
  tl.fromTo("#sScr0 .grid .card", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, 91.95);
  const focusCols = ${JSON.stringify(seasonOrder.map((t) => THEMES[t].focus))};
  tl.set("#sRing", { scale: 1.06, opacity: 0, borderColor: focusCols[0] }, 91.95);
  tl.to("#sRing", { opacity: 1, duration: 0.25 }, 92.33);
  const hops = [[92.33, 0, 0], [93.24, 1, 0], [94.14, 2, 0], [95.05, 2, 1], [95.95, 1, 1], [96.86, 0, 1], [97.76, 0, 0], [98.66, 1, 0]];
  let prev = -1;
  hops.forEach(([t, c, r], i) => {
    const k = r * 3 + c + 1;
    if (i > 0) tl.to("#sRing", { x: c * 585.33, y: r * 442, duration: 0.3, ease: "power3.out" }, t); else tl.set("#sRing", { x: 0, y: 0 }, t);
    tl.to(".season .grid .card:nth-child(" + k + ")", { scale: 1.06, duration: 0.25, ease: "power2.out" }, t);
    if (prev > 0) tl.to(".season .grid .card:nth-child(" + prev + ")", { scale: 1, duration: 0.25, ease: "power2.out" }, t);
    prev = k;
  });
  [1, 2, 3, 4, 5].forEach((i) => tl.to("#sRing", { borderColor: focusCols[i], duration: 0.3 }, seasonT[i]));''')
rep('''  tl.fromTo("#sS", { opacity: 0 }, { opacity: 1, duration: 0.35 }, 91.95);''', '''  tl.fromTo("#sS", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 91.95);''')

# ------------------------------------------------------------ U
rep('''  tl.fromTo("#uScale", { scale: 1.04 }, { scale: 1.0, duration: 2.2, ease: "power1.out" }, 99.15);''',
'''  tl.fromTo("#uScale", { scale: 1.04 }, { scale: 1.0, duration: 2.2, ease: "power1.out" }, 99.15);
  inn("#uF-card", 99.2, { opacity: 0, x: 260 }, 0.7, "power4.out");
  inn("#uF-card .fposter", 99.3, { opacity: 0, x: 120, rotation: 3 }, 0.8, "power4.out");''')
rep('''  inn("#uEnd .endlogo", 101.4, { opacity: 0, scale: 0.92 }, 0.6);
  inn("#uEnd .tagready", 101.75, { opacity: 0, y: 20 }, 0.5);''',
'''  inn("#uEnd .endlogo", 101.3, { opacity: 0, scale: 0.75, rotation: -3, filter: "blur(8px)" }, 0.7, "back.out(1.7)");
  words("#uTag", 101.7, 0.07);''')

# ------------------------------------------------------------ orbs: slow drift across the whole piece
rep('''function build() {
''', '''function build() {
  [["#orb0", 1400, 120, 1150, 420, 9.1], ["#orb1", -200, 620, 120, 380, 11.3], ["#orb2", 760, 820, 980, 560, 13.7]].forEach(([id, x0, y0, x1, y1, half]) => {
    tl.set(id, { x: x0, y: y0 }, 0);
    tl.to(id, { x: x1, y: y1, duration: half, yoyo: true, repeat: Math.floor(${DURATION} / half) - 1, ease: "sine.inOut" }, 0);
  });
''')

# ------------------------------------------------------------ CSS
rep('''.vwrap { position: absolute;''', '''.cam { position: absolute; inset: 0; }
.w { display: inline-block; overflow: hidden; vertical-align: top; padding: 0.1em 0.08em 0.18em; margin: -0.1em -0.08em -0.18em; }
.wi { display: inline-block; transform-origin: 0% 100%; }
.orb { position: absolute; left: 0; top: 0; width: 900px; height: 900px; margin: -450px 0 0 -450px; background: url(assets/bg/orb.png) center / 100% 100%; opacity: .32; z-index: 0; }
#orb1 { width: 1100px; height: 1100px; margin: -550px 0 0 -550px; opacity: .22; }
#orb2 { width: 700px; height: 700px; margin: -350px 0 0 -350px; opacity: .26; }
.flow { fill: none; stroke: #FFF6E8; stroke-width: 4; stroke-dasharray: 10 14; stroke-linecap: round; opacity: 0; }
.halo { position: absolute; inset: 70px; border-radius: 50%; box-shadow: 0 0 140px 40px rgba(226,138,59,.32); }
.qtyped i { font-style: normal; }
.sring { position: absolute; left: 96px; top: 168px; width: 557px; height: 414px; border-radius: 20px; border: 4px solid #F0B667; box-shadow: 0 0 0 1px rgba(0,0,0,.2), 0 30px 80px rgba(0,0,0,.35); z-index: 6; pointer-events: none; }
.vwrap { position: absolute;''')
# tagrow spans are now word wrappers; keep the row's spacing natural
rep('''.tagrow { font-family: "Fraunces", serif; font-size: 72px; font-weight: 600; letter-spacing: -.02em; display: flex; gap: 22px; }
.tagrow span { display: inline-block; }''', '''.tagrow { font-family: "Fraunces", serif; font-size: 72px; font-weight: 600; letter-spacing: -.02em; }''')

open(P, "w").write(s)
print("patched")
