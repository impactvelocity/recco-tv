# Fourth edit pass: "Snack"; the fourth intro item is an endless poster list; no uppercase pre-titles;
# no grid bounce in "my list is waiting"; the "other room" scene folds into a longer hold; the hackathon
# line is back in the VO (no title card); the map reads left-to-right (phone → pipeline → TV);
# the seasons run slower, with no theme badge and no Featured scene; the end is the logo alone.
# Run once: python3 -I patch-cut4.py
import re, sys

P = "composition/src/build.mjs"
s = open(P).read()

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        sys.exit(f"expected {count} match(es), found {n}: {a[:90]!r}")
    s = s.replace(a, b)

def between(start, end, new):
    global s
    i, j = s.find(start), s.find(end)
    if i < 0 or j < 0 or j < i:
        sys.exit(f"markers not found: {start!r} .. {end!r}")
    s = s[:i] + new + s[j:]

# ------------------------------------------------------------ clock: untrimmed build VO again, longer tail
rep('''const DURATION = +T(99.74).toFixed(2);''', '''const DURATION = +T(101.5).toFixed(2);''')
rep('''const VO2_AT = 49.0; // old-clock start of the build VO, trimmed to begin at "The TV app…" (real clock: T(49) = 61.1s)
const V = (x) => +(VO2_AT + (x - 2.76)).toFixed(3); // x = a word's time in the untrimmed 1.25x transcript
const VO_BUILT = VO2_AT - 2.76; // so older `VO_BUILT + x` cues still line up''',
'''const VO2_AT = 49.0; // old-clock start of the build VO (real clock: T(49) = 61.1s)
const V = (x) => +(VO2_AT + x).toFixed(3); // x = a word's time in the 1.25x transcript
const VO_BUILT = VO2_AT;''')

# ------------------------------------------------------------ A · "Snack", and the fourth item is the endless list
rep('''${[["intro-tea.webp", "Tea"], ["intro-snack.webp", "A snack"], ["intro-dog.webp", "My dog"], ["intro-show.webp", "A great show"]].map(([f, l], i) => `<div class="item" id="ai${i}"><div class="iic"><img src="assets/img/${f}" alt=""></div><div class="ilab">${l}</div></div>`).join("")}''',
    '''${[["intro-tea.webp", "Tea"], ["intro-snack.webp", "Snack"], ["intro-dog.webp", "My dog"]].map(([f, l], i) => `<div class="item" id="ai${i}"><div class="iic"><img src="assets/img/${f}" alt=""></div><div class="ilab">${l}</div></div>`).join("")}
    <div class="item" id="ai3"><div class="iic"><div class="minilist"><div class="mlstrip" id="aStrip">${Array.from({ length: 16 }, (_, i) => `<div class="mltile" style="background-image:url(${P(["the-bear", "dune-2", "severance", "past-lives", "shrinking", "slow-horses", "ted-lasso", "abbott", "only-murders", "knives-out", "the-others", "shining", "king-of-queens"][(i * 5) % 13])})"></div>`).join("")}</div></div></div><div class="ilab">A great show</div></div>''')
rep('''.ilab { font-family: "Inter", sans-serif; font-size: 40px;''', '''.minilist { width: 300px; height: 300px; position: relative; overflow: hidden; border-radius: 26px; -webkit-mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent); mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent); }
.mlstrip { position: absolute; left: 10px; top: 0; width: 280px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.mltile { width: 135px; height: 202px; border-radius: 10px; background-size: cover; background-position: center; box-shadow: 0 8px 20px rgba(0,0,0,.4); }
.ilab { font-family: "Inter", sans-serif; font-size: 40px;''')
rep('''  tl.to("#aItems", { y: -40, duration: 0.6, ease: "power2.inOut" }, ${VO_INTRO + 5.6});''',
    '''  tl.to("#aItems", { y: -40, duration: 0.6, ease: "power2.inOut" }, ${VO_INTRO + 5.6});
  tl.fromTo("#aStrip", { y: 0 }, { y: -1400, duration: T(7.75) - T(${VO_INTRO + 4.47}), ease: "none" }, ${VO_INTRO + 4.47});''')

# ------------------------------------------------------------ E · no pre-titles
rep('''    <div class="capk" id="eK1">Setup</div><div class="capk" id="eK2">Text it anything</div><div class="capk" id="eK3">From a friend</div><div class="capk" id="eK4">From a link</div>\n''', '')
s = re.sub(r'\s*(inn|out)\("#eK\d"[^;]*;', '', s)
rep('''out("#eK4, #eH5", 36.95,''', '''out("#eH5", 36.95,''')
rep('''.caph { position: absolute; left: 0; top: 46px;''', '''.caph { position: absolute; left: 0; top: 14px;''')

# ------------------------------------------------------------ I · no grid bounce, holds through "the other room"
rep('''scene("sI", 37.5, 42.55, `''', '''scene("sI", 37.5, 44.4, `''')
rep('''  tl.to("#sI", { opacity: 0, scale: 0.985, duration: 0.3, ease: "power1.in" }, 42.25);
  tl.set("#iScale", { transformOrigin: "50% 35%" }, 37.8);
  tl.to("#iScale", { scale: 1.04, duration: 0.7, ease: "power2.inOut" }, 38.75);
  tl.to("#iScale", { scale: 1.0, duration: 0.5, ease: "power3.out" }, 39.55);''',
'''  tl.to("#sI", { opacity: 0, scale: 0.985, duration: 0.3, ease: "power1.in" }, 44.1);''')
i = s.find("// J · Phone stays in the other room"); j = s.find("// K · Tagline")
s = s[:i] + s[j:]
rep('''  sceneFade("sJ", 42.55, 44.4);
  words("#j1", 42.6);
  words("#j2", 43.25);
''', '')

# ------------------------------------------------------------ O · the map, left to right
between("// O · How it's built", "// S + T · Inbox and the seasons", r'''// O · How it's built (48.95 – 90.96): one map that fills in as the voice names each piece.
// The TV starts big, slides right for the phone (pairing), then the phone shrinks to the left edge and the
// TV to the right edge; the pipeline flows between them. At the end the little TV grows back to full frame.
const ONODES = [
  { k: "zernio", t: "Zernio", s: "SMS in", icon: ic.msg(), x: 440, y: 230 },
  { k: "lambda", t: "AWS Lambda", s: "Checks each text", icon: ic.bolt(), x: 780, y: 230 },
  { k: "sqs", t: "Amazon SQS", s: "Queued safely", icon: ic.queue(), x: 1120, y: 230 },
  { k: "agent", t: "Recco agent", s: "AgentCore Runtime", icon: ic.spark(), x: 780, y: 430 },
  { k: "ddb", t: "DynamoDB", s: "Keeps the record", icon: ic.db(), x: 780, y: 630 },
  { k: "appsync", t: "AppSync Events", s: "Pushes updates", icon: ic.wave(), x: 1120, y: 630 },
];
const NW = 280, NH = 150;
const node = (n, p) => `<div class="node" id="${p}-${n.k}" style="left:${n.x}px;top:${n.y}px;width:${NW}px;height:${NH}px"><div class="nic">${n.icon}</div><div class="ntx"><div class="nt">${n.t}</div><div class="ns">${n.s}</div></div>${n.k === "lambda" ? `<div class="nbadge" id="${p}-lcheck">${ic.check(20, 3.5)}</div>` : ""}${n.k === "sqs" ? `<div class="qbars" id="${p}-q">${[0, 1, 2].map((i) => `<i id="${p}-q${i}"></i>`).join("")}</div>` : ""}</div>`;
const OEDGES = ["M 206 305 L 440 305", "M 720 305 L 780 305", "M 1060 305 L 1120 305", "M 1260 380 L 1260 505 L 1060 505", "M 920 580 L 920 630", "M 1060 705 L 1120 705", "M 1400 705 L 1490 705"];
const OPTS = { phone: [206, 305], zernio: [580, 305], lambda: [920, 305], sqs: [1260, 305], bend: [1260, 505], agent: [920, 505], ddb: [920, 705], appsync: [1260, 705], tv: [1490, 705] };
const oCards = [
  ["koq", card(RECS.koq, "oX-koq")], ["slow", card(RECS.slow, "oX-slow")], ["bear", card(RECS.bear, "oX-bear")], ["sev", card(RECS.sev, "oX-sev")], ["past", card(RECS.past, "oX-past")], ["shrink", card(RECS.shrink, "oX-shrink")], ["dune", card(RECS.dune, "oX-dune")], ["lasso", card(RECS.lasso, "oX-lasso")],
  ["pNew", pendingCard("Steph", "oX-pNew")], ["stack", card(RECS.stack, "oX-stack")],
];
const tvStackO = `<div class="still" style="background-image:url(assets/bg/fallNight.jpg)"></div>
  ${screen({ theme: "fallNight", id: "oCode", still: false, hdr: false, body: codeBody("oC") })}
  ${screen({ theme: "fallNight", id: "oIn", still: false, body: `<div class="cardlayer" id="oCards">${oCards.map(([, h]) => h).join("")}</div>` })}`;
const oPosters = [["the-others", "The Others", "2001"], ["shining", "The Shining", "1980"], ["knives-out", "Knives Out", "2019"]];
scene("sO", 48.95, 90.96, `<div class="stage"><div class="stagev"></div></div>
  <div class="capblock">
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
  <div class="dlabel" id="oLblP" style="left:140px;top:446px">Your phone</div>
  <div class="dlabel" id="oLblT" style="left:1660px;top:810px">Fire TV</div>
  <div class="sms obub" id="oIn0">Slow Horses</div>
  <div class="sms obub" id="oIn1">${ic.link(24)} youtu.be/best-films-2023</div>
  <div class="sms obub" id="oIn2">top films for a stormy night</div>
  <div class="ochip obot" id="oOut0" style="left:110px"><div class="oic">${ic.user(26)}</div><div><div class="ok">Friend</div><div class="ov">Steph</div></div></div>
  <div class="ochip obot" id="oOut1" style="left:650px"><div class="oic">${ic.film(26)}</div><div><div class="ok">Titles</div><div class="ov">The Others · The Shining · Knives Out</div></div></div>
  <div class="ochip obot" id="oOut2" style="left:1320px"><div class="oic">${ic.link(26)}</div><div><div class="ok">Links</div><div class="ov">youtu.be/best-films-2023</div></div></div>
  <div class="qrow small">${oPosters.map(([p, t, y], i) => `<div class="qcard" id="q${i}"><div class="qp" style="background-image:url(${P(p)})"><div class="qbadge" id="qb${i}">${ic.check(16, 3.5)} In OMDb</div></div><div class="qt">${t}</div><div class="qm">Film · ${y}</div></div>`).join("")}
    <div class="qcard" id="q3"><div class="qp ghost"><span>?</span><div class="qx" id="qx">${ic.x(18)} Not added</div></div><div class="qt" style="opacity:.5">Made-up title</div><div class="qm">Not in OMDb</div></div>
  </div>
  <div class="privacy">
    <div class="pchip" id="rP0"><div class="pic">${ic.lock()}</div><div class="pnum"><span id="rNum">+1 (604) 555-0189</span></div><div class="plab">Your number is never stored</div></div>
    <div class="pchip" id="rP1"><div class="pic">${ic.user(26)}</div><div class="pnum"><span>Jill</span><span class="last" id="rLast">Anderson</span></div><div class="plab">Friends are first names only</div></div>
  </div>
  ${tvFrame("oTV", tvStackO, { x: 110, y: 270, w: 1180 })}
  <div class="live" id="oLive" style="left:1790px;top:592px;right:auto"><span></span>Live</div>
  <div class="chip vega" id="oChip"><span class="cdot"></span>React Native for Vega</div>
  ${phone("oPhone", [{ id: "o1", text: "48217" }], { time: "8:58" }).replace('class="phone" id="oPhone"', 'class="phone" id="oPhone" style="left:100px"')}
  <div class="linkline" id="oLink" style="left:500px;width:96px;transform-origin:0% 50%"><div class="lldot" id="oDot" style="left:-8px;right:auto"></div></div>`);

''')
between("  // ---- O · How it's built", "  // ---- S + T · Inbox, then the seasons", r'''  // ---- O · How it's built: one map, filled in as the voice names each piece
  const V = (x) => ${VO2_AT} + x;
  const O0 = 48.95, FULLO = { x: 248, y: -74, scale: 1.6271 };
  const TVMINI = { x: 988, y: 91, scale: 0.2797 }, PHMINI = { x: -155, y: -285, scale: 0.32 };
  tl.fromTo("#sO", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, O0);
  const nodeIn = (id, t) => { inn(id, t, { opacity: 0, y: 50, scale: 0.8 }, 0.6, "back.out(1.9)"); pop(id + " .nic", t + 0.12); };
  const edgeIn = (id, t, d = 0.45) => tl.fromTo(id, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" }, t);
  const flowOn = (i, t, until) => { tl.fromTo("#o-f" + i, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, t); tl.fromTo("#o-f" + i, { strokeDashoffset: 0 }, { strokeDashoffset: -48 * Math.round((T(until) - T(t)) * 2.2), duration: T(until) - T(t), ease: "none" }, t); };
  const OP = ${JSON.stringify(Object.fromEntries(Object.entries(OPTS).map(([k, [x, y]]) => [k, [x - 9, y - 9]])))};
  const pk = (id, keys, t) => { tl.set(id, { opacity: 1 }, t); keys.forEach((k, i) => { const [x, y] = OP[k]; if (i === 0) tl.set(id, { x, y }, t); else tl.to(id, { x, y, duration: T(t + i * 0.4) - T(t + (i - 1) * 0.4), ease: "power1.inOut" }, t + (i - 1) * 0.4); }); tl.to(id, { opacity: 0, duration: 0.15 }, t + (keys.length - 1) * 0.4); };
  const cap = (outH, inH, t) => { if (outH) out(outH, t, { opacity: 0, y: -14 }, 0.25); words(inH, t + 0.15, 0.05); };
  // everything the map will show starts hidden
  tl.set("#o-e0, #o-e1, #o-e2, #o-e3, #o-e4, #o-e5, #o-e6", { strokeDashoffset: 1 }, O0);
  tl.set(".node, #oLblP, #oLblT, #oLive, .obub, .obot, .qrow.small .qcard, .pchip, #o-lcheck, #o-q0, #o-q1, #o-q2", { opacity: 0 }, O0);
  tl.set("#qb0, #qb1, #qb2, #qx", { opacity: 0 }, O0);
  // A · the TV app, big and centred, on its pairing screen
  tl.set("#oTV", { x: 248, y: 0, scale: 1.12 }, O0);
  tl.fromTo("#oTV", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", immediateRender: false }, O0);
  tl.set("#oIn", { opacity: 0 }, O0);
  tl.set("#oC-d0, #oC-d1, #oC-d2, #oC-d3, #oC-d4", { opacity: 0.22 }, O0);
  cap(null, "#oH0", O0 + 0.05);
  cap("#oH0", "#oH1", V(2.75));
  inn("#oChip", V(4.07), { opacity: 0, y: 20, scale: 0.9 }, 0.45, "back.out(1.7)");
  spin("#oC-spin", O0, V(10.4));
  cap("#oH1", "#oH2", V(5.2));
  [0, 1, 2, 3, 4].forEach((i) => tl.fromTo("#oC-d" + i, { opacity: 0.22, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)", immediateRender: false }, V(6.67) + i * 0.1));
  // the TV slides right, the phone texts the code from the left, a line links them, the inbox opens
  tl.to("#oTV", { x: 486, scale: 1, duration: 0.7, ease: "power3.inOut" }, V(7.2));
  tl.to("#oChip", { opacity: 0, y: -10, duration: 0.3 }, V(7.2));
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
  // B · the phone goes to the left edge, the TV to the right; the pipeline appears between them
  cap("#oH3", "#oH4", V(10.7));
  tl.to("#oTV", { ...TVMINI, duration: 0.8, ease: "power3.inOut" }, V(10.7));
  tl.to("#oPhone", { ...PHMINI, duration: 0.8, ease: "power3.inOut" }, V(10.7));
  inn("#oLblP", V(11.35), { opacity: 0, y: 10 }, 0.4); inn("#oLblT", V(11.35), { opacity: 0, y: 10 }, 0.4);
  tl.set("#oX-dune, #oX-lasso, #oCards .av + .av", { opacity: 0 }, V(10.95));
  tl.set("#oX-dune, #oX-lasso, #oX-shrink, #oCards .av + .av", { opacity: 1 }, V(40.95));
  edgeIn("#o-e0", V(11.3)); nodeIn("#o-zernio", V(11.46));
  cap("#oH4", "#oH5", V(12.4));
  edgeIn("#o-e1", V(12.85)); nodeIn("#o-lambda", V(13.21));
  inn("#o-lcheck", V(13.68), { opacity: 0, scale: 0.3 }, 0.4, "back.out(2.2)");
  edgeIn("#o-e2", V(15.45)); nodeIn("#o-sqs", V(16.09));
  [0, 1, 2].forEach((i) => inn("#o-q" + i, V(16.35) + i * 0.2, { opacity: 0, x: -24 }, 0.3));
  tl.fromTo("#o-sqs .qbars i", { scaleX: 1 }, { scaleX: 0.55, duration: 0.226, yoyo: true, repeat: 9, stagger: 0.113, ease: "sine.inOut", immediateRender: false }, V(17.1));
  const row1 = ["phone", "zernio", "lambda", "sqs"];
  [V(12.0), V(14.2), V(15.3), V(16.5), V(17.6), V(18.7)].forEach((t, i) => pk("#o-pk" + i, row1, t));
  flowOn(0, V(13.9), V(41.0)); flowOn(1, V(14.0), V(41.0)); flowOn(2, V(16.4), V(41.0));
  // "updates in real time": a card lands on the little TV
  cap("#oH5", "#oH6", V(17.5));
  oorder.unshift("pNew");
  oorder.forEach((id, i) => { if (i > 0) tl.to(OX(id), { x: osx(i), y: osy(i), duration: 0.5, ease: "power3.inOut" }, V(17.9)); });
  tl.fromTo(OX("pNew"), { opacity: 0, y: -90, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)", immediateRender: false }, V(17.9));
  spin("#oX-pNew-spin", V(17.9), V(19.0));
  inn("#oLive", V(18.3), { opacity: 0, scale: 0.6 }, 0.35, "back.out(2)");
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.8, repeat: 1, ease: "power1.out" }, V(18.4));
  tl.set("#oX-shrink", { opacity: 0 }, V(18.5));
  oorder[0] = "stack";
  tl.set(OX("stack"), { x: 0, y: 0, zIndex: 6 }, V(18.75));
  tl.to(OX("pNew"), { opacity: 0, duration: 0.25 }, V(18.75));
  tl.fromTo(OX("stack"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, V(18.75));
  // C · the agent, under the pipeline
  cap("#oH6", "#oH7", V(19.35));
  edgeIn("#o-e3", V(19.6), 0.55); nodeIn("#o-agent", V(20.0));
  tl.fromTo("#o-agent", { boxShadow: "0 0 0 0 rgba(226,138,59,0)" }, { boxShadow: "0 0 0 5px rgba(226,138,59,.9)", duration: 0.35, yoyo: true, repeat: 1 }, V(21.4));
  cap("#oH7", "#oH8", V(22.1));
  [["#oIn0", V(22.63)], ["#oIn1", V(23.43)], ["#oIn2", V(23.97)]].forEach(([id, t]) => {
    inn(id, t, { opacity: 0, y: 30, scale: 0.8 }, 0.4, "back.out(1.8)");
    tl.to(id, { x: 920 - 280 - 110, y: 505 - 470 - 30, scale: 0.15, opacity: 0, duration: 0.55, ease: "power2.in" }, t + 0.5);
  });
  tl.fromTo("#o-agent .nic", { scale: 1 }, { scale: 1.2, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, V(26.4));
  cap("#oH8", "#oH9", V(26.45));
  [["#oOut0", V(27.23), 110], ["#oOut1", V(27.78), 650], ["#oOut2", V(28.49), 1320]].forEach(([id, t, lx]) => {
    inn(id, t, { opacity: 0, x: 920 - lx - 245, y: 505 - 898, scale: 0.2 }, 0.65, "back.out(1.3)");
    pop(id + " .oic", t + 0.35);
  });
  // D · checked in OMDb
  cap("#oH9", "#oH10", V(31.05));
  tl.to(".obot", { opacity: 0, y: 20, duration: 0.3 }, V(31.0));
  [0, 1, 2, 3].forEach((i) => inn("#q" + i, V(31.3) + i * 0.1, { opacity: 0, y: 80, rotation: [-6, 4, -3, 5][i], scale: 0.85 }, 0.6, "back.out(1.5)"));
  [0, 1, 2].forEach((i) => { const t = V(32.2) + i * 0.25; inn("#qb" + i, t, { opacity: 0, scale: 0.4 }, 0.45, "back.out(2.4)"); tl.fromTo("#q" + i + " .qp", { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, t); });
  inn("#qx", V(33.7), { opacity: 0, scale: 0.5 }, 0.4, "back.out(2.4)");
  tl.fromTo("#q3 .qp", { x: 0 }, { x: -10, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut" }, V(33.75));
  tl.to("#q3", { opacity: 0.45, duration: 0.4 }, V(34.2));
  // E · saved, then pushed out to the TV on the right
  cap("#oH10", "#oH11", V(34.85));
  tl.to(".qrow.small .qcard", { opacity: 0, y: 20, duration: 0.3 }, V(34.8));
  edgeIn("#o-e4", V(34.9), 0.3); nodeIn("#o-ddb", V(35.0));
  cap("#oH11", "#oH12", V(36.3));
  edgeIn("#o-e5", V(36.35)); nodeIn("#o-appsync", V(36.45));
  edgeIn("#o-e6", V(37.1));
  const row2 = ["sqs", "bend", "agent", "ddb", "appsync", "tv"];
  [V(36.95), V(37.9), V(38.85)].forEach((t, i) => pk("#o-pk" + (5 + i), row2, t));
  flowOn(3, V(37.2), V(41.0)); flowOn(4, V(37.3), V(41.0)); flowOn(5, V(37.4), V(41.0)); flowOn(6, V(37.6), V(41.0));
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.7, repeat: 1, ease: "power1.out", immediateRender: false }, V(38.9));
  // F · private by design
  cap("#oH12", "#oH13", V(38.85));
  inn("#rP0", V(39.0), { opacity: 0, y: 60, scale: 0.9 }, 0.55, "back.out(1.6)");
  pop("#rP0 .pic", V(39.15));
  const scramble = ["+1 (604) 555-0189", "+1 (6#4) 5$5-0%89", "+7 f6#a 9!5-c2?9", "7f3a·9c2!·e#b4", "7f3a·9c21·e0b4"], numEl = S("#rNum"), sc = { p: 0 };
  tl.fromTo(sc, { p: 0 }, { p: 1, duration: 0.7, ease: "none", onUpdate: () => { numEl.textContent = scramble[Math.min(scramble.length - 1, Math.floor(sc.p * scramble.length))]; } }, V(39.6));
  cap("#oH13", "#oH14", V(40.3));
  inn("#rP1", V(40.45), { opacity: 0, y: 60, scale: 0.9 }, 0.55, "back.out(1.6)");
  pop("#rP1 .pic", V(40.6));
  tl.to("#rLast", { opacity: 0, x: 20, duration: 0.4 }, V(41.3));
  // into the inbox: the map clears and the little TV grows to fill the frame; the seasons continue it
  tl.to(".node, .edges, .dlabel, #oPhone, .privacy, #oLive, #oH14", { opacity: 0, duration: 0.4 }, V(41.0));
  tl.to("#oTV", { ...FULLO, duration: 0.9, ease: "power3.inOut" }, V(41.0));
  tl.to("#oTV .tvglass", { borderRadius: 0, duration: 0.9 }, V(41.0));

''')

# ------------------------------------------------------------ S · seasons to the end, no badge, logo close
between("// S + T · Inbox and the seasons", "// ---------------------------------------------------------------- timeline script", r'''// S · The inbox through the seasons (90.96 – 101.5), ending on the logo
const seasonOrder = ["fallNight", "fallDay", "winterDay", "summerDay", "summerNight", "winterNight"];
const seasonCards = [card(RECS.stack), card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past), card(RECS.shrink), card(RECS.dune), card(RECS.lasso)];
const seasonT = [90.96, 92.4, 93.8, 95.2, 96.6, 97.9], S_END = 101.5;
const vS = seasonOrder.map((t, i) => { const a = i === 0 ? seasonT[0] : seasonT[i] - 0.05, b = i < 5 ? seasonT[i + 1] + 0.5 : S_END; return [t, a, +(b - a).toFixed(3)]; });
const seasonVidIds = vS.map(([t, s, d]) => bgVideo(t, s, d, 0));
scene("sS", 90.96, S_END, `<div class="fullscale" id="sScale">${seasonOrder.map((t, i) => screen({ theme: t, id: `sScr${i}`, still: false, body: grid(seasonCards), cls: "season" })).join("")}<div class="sring" id="sRing"></div></div>
  <div class="uend" id="uEnd" data-layout-allow-overlap style="${themeVars("winterNight")}"><img src="assets/img/recco-logo.png" alt="Recco" class="endlogo"></div>`);

''')
between("  // ---- S + T · Inbox, then the seasons", "}\n\ndocument.fonts.ready.then", r'''  // ---- S · the seasons, slowly, then the logo
  tl.set("#sS", { opacity: 1 }, 90.96);
  ${JSON.stringify(seasonVidIds)}.forEach((id, i) => { if (i > 0) tl.fromTo("#" + id, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, ${JSON.stringify(vS.map((v) => v[1]))}[i] + 0.05); });
  const seasonT = ${JSON.stringify(seasonT)};
  const focusCols = ${JSON.stringify(seasonOrder.map((t) => THEMES[t].focus))};
  tl.set("#sRing", { scale: 1.06, opacity: 0, x: 0, y: 0, borderColor: focusCols[0] }, 90.96);
  tl.to("#sRing", { opacity: 1, duration: 0.25 }, 91.3);
  let prev = -1;
  [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1], [0, 0], [1, 0], [2, 0]].forEach(([c, r], i) => {
    const t = 91.3 + i * 0.9, k = r * 3 + c + 1;
    if (i > 0) tl.to("#sRing", { x: c * 585.33, y: r * 442, duration: 0.3, ease: "power3.out" }, t);
    tl.to(".season .grid .card:nth-child(" + k + ")", { scale: 1.06, duration: 0.25, ease: "power2.out" }, t);
    if (prev > 0) tl.to(".season .grid .card:nth-child(" + prev + ")", { scale: 1, duration: 0.25, ease: "power2.out" }, t);
    prev = k;
  });
  [1, 2, 3, 4, 5].forEach((i) => { tl.to("#sRing", { borderColor: focusCols[i], duration: 0.3 }, seasonT[i]); tl.fromTo("#sScr" + i, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, seasonT[i]); tl.to("#sScr" + (i - 1), { opacity: 0, duration: 0.5, ease: "power1.inOut" }, seasonT[i]); });
  tl.to("#sRing", { opacity: 0, duration: 0.3 }, 98.6);
  tl.fromTo("#uEnd", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.inOut" }, 98.6);
  inn("#uEnd .endlogo", 98.85, { opacity: 0, scale: 0.75, rotation: -3, filter: "blur(8px)" }, 0.7, "back.out(1.7)");
''')

# ------------------------------------------------------------ CSS for the new map metrics
rep('''.node { position: absolute; z-index: 2; display: flex; align-items: center; gap: 22px; padding: 0 28px;''', '''.node { position: absolute; z-index: 2; display: flex; align-items: center; gap: 16px; padding: 0 22px;''')
rep('''.nic { width: 76px; height: 76px; border-radius: 22px;''', '''.nic { width: 64px; height: 64px; border-radius: 18px;''')
rep('''.nt { font-size: 32px;''', '''.nt { font-size: 28px;''')
rep('''.ns { font-size: 21px;''', '''.ns { font-size: 19px;''')
rep('.obub { position: absolute; left: 600px; top: 440px; opacity: 0; }', '.obub { position: absolute; left: 280px; top: 470px; opacity: 0; }')
rep('.obot { position: absolute; top: 840px; width: 490px; opacity: 0; }', '.obot { position: absolute; top: 850px; width: 490px; opacity: 0; }')
rep('.qrow.small { top: 806px; gap: 36px; }', '.qrow.small { top: 846px; gap: 36px; }')
rep('.qrow.small .qcard { width: 136px; gap: 4px; }', '.qrow.small .qcard { width: 120px; gap: 4px; }')
rep('.qrow.small .qp { width: 136px; height: 204px;', '.qrow.small .qp { width: 120px; height: 180px;')
rep('.privacy { position: absolute; left: 110px; right: 110px; top: 846px;', '.privacy { position: absolute; left: 110px; right: 110px; top: 850px;')
rep('''.uend .tagready { color: #8FBDE8; }\n''', '')

open(P, "w").write(s)
print("patched")
