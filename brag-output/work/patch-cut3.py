# Third edit pass. Part one: illustrated items without boxes, no "Ten minutes" title, messages that stream
# up from the centre, logo-only reveal, no Connected screen, no trailing periods. Part two: the chapter
# cards go, the hackathon line is cut from the VO, the blurry glow background becomes the dimmed room,
# and the five build scenes are replaced by one map that fills in as the voice names each piece.
# Run once: python3 -I patch-cut3.py
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

# ------------------------------------------------------------ clock
rep('''const T = (t) => (t <= 0.6 ? t : t <= 47.81 ? 0.6 + (t - 0.6) * 1.25 : t <= 50 ? 59.6125 + (t - 47.81) : 61.8025 + (t - 50) * 1.25);
const DURATION = +T(103.5).toFixed(2);
const VO_INTRO = 0.6; // old-clock start of the story VO
const VO_BUILT = 50.0; // old-clock start of the build VO (real clock: T(50) = 61.8s)''',
'''const T = (t) => (t <= 0.6 ? t : 0.6 + (t - 0.6) * 1.25);
const DURATION = +T(99.74).toFixed(2);
const VO_INTRO = 0.6; // old-clock start of the story VO
const VO2_AT = 49.0; // old-clock start of the build VO, trimmed to begin at "The TV app…" (real clock: T(49) = 61.1s)
const V = (x) => +(VO2_AT + (x - 2.76)).toFixed(3); // x = a word's time in the untrimmed 1.25x transcript
const VO_BUILT = VO2_AT - 2.76; // so older `VO_BUILT + x` cues still line up''')

# ------------------------------------------------------------ A · items without boxes, new TV image, no periods
rep('''<div class="line big" id="a1">${W("9pm.")}</div>
    <div class="line" id="a2">${W("Kids are down.")}</div>
    <div class="line accent" id="a3">${W("This is my time.")}</div>''',
    '''<div class="line big" id="a1">${W("9pm")}</div>
    <div class="line" id="a2">${W("Kids are down")}</div>
    <div class="line accent" id="a3">${W("This is my time")}</div>''')
rep('''["intro-show.webp", "A really good show"]''', '''["intro-show.webp", "A great show"]''')
rep('''<div class="plan" id="aPlan">${W("That’s the plan.")}</div>''', '''<div class="plan" id="aPlan">${W("That’s the plan")}</div>''')
i = s.find(".items { position: absolute;"); j = s.find(".ilab {")
s = s[:i] + '''.items { position: absolute; left: 140px; right: 140px; top: 250px; display: flex; gap: 36px; }
.item .iic img { width: 300px; height: 300px; object-fit: contain; display: block; filter: drop-shadow(0 24px 40px rgba(0,0,0,.5)); }
.item { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; opacity: 0; }
''' + s[j:]
rep('''.ilab { font-family: "Inter", sans-serif; font-size: 38px;''', '''.ilab { font-family: "Inter", sans-serif; font-size: 40px;''')

# ------------------------------------------------------------ B · just the looking, no title; no periods
rep('''  <div class="bshade"></div><div class="bdim" id="bDim"></div>''', '''  <div class="bdim" id="bDim"></div>''')
rep('''<div class="bcap" data-layout-allow-overlap><div class="line" id="b1">${W("Ten minutes of looking.")}</div><div class="line" id="b2">${W("No time left for an episode.")}</div><div class="line accent" id="b3">${W("So I just keep scrolling.")}</div></div>''',
    '''<div class="bcap" data-layout-allow-overlap><div class="line" id="b2">${W("No time left for an episode")}</div><div class="line accent" id="b3">${W("So I just keep scrolling")}</div></div>''')
rep('''  [[7.9, 1, 0], [8.25, 2, 0], [8.6, 3, 0], [8.95, 2, 1], [9.25, 3, 1]].forEach''',
    '''  [[7.85, 0, 0], [8.15, 1, 0], [8.45, 2, 0], [8.75, 3, 0], [9.05, 2, 1], [9.3, 3, 1]].forEach''')
rep('''  words("#b1", 7.95);
  out("#b1", 11.8, { opacity: 0, y: -16 }, 0.25);
  words("#b2", 12.05);''', '''  words("#b2", 12.05);''')

# ------------------------------------------------------------ C · messages stream up from the centre, then fade
rep('''<div class="chat"><div class="chatcol">${friendMsgs.map(([n, t, p], i) => `<div class="crow" id="cr${i}">''',
    '''<div class="chat"><div class="chatcol">${friendMsgs.map(([n, t, p], i) => `<div class="crow" id="cr${i}" data-layout-allow-overlap>''')
between("  // ---- C · Friends", "  // ---- D+E", r'''  // ---- C · Friends: each message lands in the centre and pushes the earlier ones up, then they all fade
  sceneFade("sC", 16.35, 20.85);
  drift("sC", 16.35, 20.85, 1.04);
  const ROW = 118, MID = 488;
  [16.45, 16.83, 17.21, 17.59, 17.97].forEach((t, k) => {
    tl.fromTo("#cr" + k, { opacity: 0, y: MID + 90, scale: 0.9 }, { opacity: 1, y: MID, scale: 1, duration: 0.5, ease: "back.out(1.5)", immediateRender: false }, t);
    for (let i = 0; i < k; i++) tl.to("#cr" + i, { y: MID - (k - i) * ROW, duration: 0.45, ease: "power3.inOut" }, t);
    inn("#cp" + k, t + 0.2, { opacity: 0, scale: 0.4, rotation: k % 2 ? 14 : -14 }, 0.55, "back.out(1.9)");
  });
  [0, 1, 2, 3, 4].forEach((i) => tl.to("#cr" + i, { opacity: 0, y: "-=24", duration: 0.6, ease: "power1.in" }, 19.3 + i * 0.1));

''')
rep('''.chat { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.chatcol { display: flex; flex-direction: column; align-items: flex-start; gap: 18px; }
.crow { display: flex; align-items: center; gap: 18px; }
.chat .fbt { font-size: 34px; max-width: 780px; }
.chat .fbn { font-size: 21px; }''',
'''.chat { position: absolute; inset: 0; }
.chatcol { position: absolute; left: 50%; top: 0; bottom: 0; width: 980px; margin-left: -490px; }
.crow { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 16px; opacity: 0; }
.chat .fbav { width: 48px; height: 48px; font-size: 22px; }
.chat .fbt { font-size: 30px; max-width: 760px; padding: 12px 20px; white-space: nowrap; }
.chat .fbn { font-size: 19px; margin: 0 0 4px 8px; }''')
rep('''.cposter { width: 110px; height: 165px;''', '''.cposter { width: 70px; height: 105px;''')

# ------------------------------------------------------------ D+E · logo only; the dimmed room behind; no Connected
rep('''<div class="revealwrap" id="eReveal"><div class="dshade"></div><div class="reveal"><div class="soNow" id="d1">${W("So now, I use")}</div><img id="dLogo" src="assets/img/recco-logo.png" alt="Recco" class="revlogo"><div class="revsub" id="d2">An inbox of things to watch, on Fire TV</div><div class="revease" id="d3">${W("Setup is easy.")}</div></div></div>''',
    '''<div class="stage" id="eStage"><div class="stagev"></div></div>
  <div class="revealwrap" id="eReveal"><div class="dshade"></div><div class="reveal"><img id="dLogo" src="assets/img/recco-logo.png" alt="Recco" class="revlogo"></div></div>''')
rep('''  words("#d1", 20.9, 0.07, 0.5);
  inn("#dLogo", 21.55, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.6, "back.out(1.8)");
  inn("#d2", 21.8, { opacity: 0, y: 16 }, 0.45);
  words("#d3", 22.05, 0.08);''',
'''  inn("#dLogo", 21.4, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.7, "back.out(1.8)");
  tl.set("#eStage", { opacity: 0 }, 20.85);
  tl.to("#eStage", { opacity: 1, duration: 0.6 }, 23.4);''')
rep('''  ${screen({ theme: "fallNight", id: "eConn", still: false, hdr: false, body: connectedBody("eK") })}\n''', '')
rep('''  tl.set("#eStill, #eCode, #eConn, #eIn", { opacity: 0 }, 20.85);''', '''  tl.set("#eStill, #eCode, #eIn", { opacity: 0 }, 20.85);''')
rep('''  tl.fromTo("#eConn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 26.6);
  tl.to("#eCode", { opacity: 0, duration: 0.3 }, 26.6);
  inn("#eK-chk", 26.7, { opacity: 0, scale: 0.3, rotation: -40 }, 0.55, "back.out(2.6)");''',
'''  // linked: the pairing screen gives way to the inbox
  tl.to("#eCode", { opacity: 0, duration: 0.35 }, 26.6);''')
rep('''  tl.to("#eConn", { opacity: 0, duration: 0.35 }, 27.35);
  tl.set("#eStore", { yPercent: 100 }, 25.4);
  tl.fromTo("#eIn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 27.3);
  order.forEach((id, i) => tl.fromTo(X(id), { opacity: 0, y: sy(i) + 60 }, { opacity: 1, y: sy(i), duration: 0.5, ease: "power3.out", immediateRender: false }, 27.4 + i * 0.06));''',
'''  tl.set("#eStore", { yPercent: 100 }, 25.4);
  tl.fromTo("#eIn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 26.6);
  order.forEach((id, i) => tl.fromTo(X(id), { opacity: 0, y: sy(i) + 60 }, { opacity: 1, y: sy(i), duration: 0.5, ease: "power3.out", immediateRender: false }, 26.7 + i * 0.06));''')
for a, b in [
    ('${W("Install Recco on Fire TV.")}', '${W("Install Recco on Fire TV")}'),
    ('${W("Text the code to the Recco number.")}', '${W("Text the code to the Recco number")}'),
    ('${W("The Recco agent looks it up.")}', '${W("The Recco agent looks it up")}'),
    ('${W("Jill says a sitcom is hilarious.")}', '${W("Jill says a sitcom is hilarious")}'),
    ('${W("Steph sends a video with three shows.")}', '${W("Steph sends a video with three shows")}'),
    ('${W("One link, three reccos.")}', '${W("One link, three reccos")}'),
    ('${W("in the other room.")}', '${W("in the other room")}'),
    ('${W("From a friend, a link, or you.")}', '${W("From a friend, a link, or you")}'),
    ('${W("Ready when you are.")}', '${W("Ready when you are")}'),
    ('${W("Just tell Alexa what to watch.")}', '${W("Just tell Alexa what to watch")}'),
]:
    rep(a, b)

# ------------------------------------------------------------ K holds until part two starts
rep('''bgVideo("fallNight", 37.8, 10.1, 0, "vwI");''', '''bgVideo("fallNight", 37.8, 11.15, 0, "vwI");''')
rep('''scene("sK", 44.4, 47.9, `''', '''scene("sK", 44.4, 48.95, `''')
rep('''  sceneFade("sK", 44.4, 47.9);
  drift("sK", 44.4, 47.9, 1.05);''', '''  sceneFade("sK", 44.4, 48.95);
  drift("sK", 44.4, 48.95, 1.04);''')
rep('''{ scale: 1.06, duration: T(47.9) - T(37.8), ease: "none" }, 37.8);''', '''{ scale: 1.06, duration: T(48.95) - T(37.8), ease: "none" }, 37.8);''')

# ------------------------------------------------------------ part two: one scene that builds the map
between("// L · Chapter card", "// S + T · Inbox and the seasons", r'''// O · How it's built (48.95 – 88.19): one map that fills in as the voice names each piece.
// The TV starts big (the app), slides over for the phone (pairing), then both shrink into the corners of the map.
// At the end the mini TV grows back to full frame, and the seasons scene continues on the same pixels.
const ONODES = [
  { k: "zernio", t: "Zernio", s: "SMS in", icon: ic.msg(), x: 560, y: 270 },
  { k: "lambda", t: "AWS Lambda", s: "Checks each text", icon: ic.bolt(), x: 1010, y: 270 },
  { k: "sqs", t: "Amazon SQS", s: "Queued, nothing lost", icon: ic.queue(), x: 1460, y: 270 },
  { k: "agent", t: "Recco agent", s: "AgentCore Runtime", icon: ic.spark(), x: 1460, y: 610 },
  { k: "ddb", t: "DynamoDB", s: "Keeps the record", icon: ic.db(), x: 1010, y: 610 },
  { k: "appsync", t: "AppSync Events", s: "Pushes every update", icon: ic.wave(), x: 560, y: 610 },
];
const NW = 350, NH = 150;
const node = (n, p) => `<div class="node" id="${p}-${n.k}" style="left:${n.x}px;top:${n.y}px;width:${NW}px;height:${NH}px"><div class="nic">${n.icon}</div><div class="ntx"><div class="nt">${n.t}</div><div class="ns">${n.s}</div></div>${n.k === "lambda" ? `<div class="nbadge" id="${p}-lcheck">${ic.check(20, 3.5)}</div>` : ""}${n.k === "sqs" ? `<div class="qbars" id="${p}-q">${[0, 1, 2].map((i) => `<i id="${p}-q${i}"></i>`).join("")}</div>` : ""}</div>`;
const OEDGES = ["M 336 338 L 560 345", "M 910 345 L 1010 345", "M 1360 345 L 1460 345", "M 1635 420 L 1635 610", "M 1460 685 L 1360 685", "M 1010 685 L 910 685", "M 560 685 L 440 690"];
const OPTS = { phone: [330, 338], zernio: [735, 345], lambda: [1185, 345], sqs: [1635, 345], agent: [1635, 685], ddb: [1185, 685], appsync: [735, 685], tv: [440, 690] };
const oCards = [
  ["koq", card(RECS.koq, "oX-koq")], ["slow", card(RECS.slow, "oX-slow")], ["bear", card(RECS.bear, "oX-bear")], ["sev", card(RECS.sev, "oX-sev")], ["past", card(RECS.past, "oX-past")], ["shrink", card(RECS.shrink, "oX-shrink")], ["dune", card(RECS.dune, "oX-dune")], ["lasso", card(RECS.lasso, "oX-lasso")],
  ["pNew", pendingCard("Steph", "oX-pNew")], ["stack", card(RECS.stack, "oX-stack")],
];
const tvStackO = `<div class="still" style="background-image:url(assets/bg/fallNight.jpg)"></div>
  ${screen({ theme: "fallNight", id: "oCode", still: false, hdr: false, body: codeBody("oC") })}
  ${screen({ theme: "fallNight", id: "oIn", still: false, body: `<div class="cardlayer" id="oCards">${oCards.map(([, h]) => h).join("")}</div>` })}`;
const oPosters = [["the-others", "The Others", "2001"], ["shining", "The Shining", "1980"], ["knives-out", "Knives Out", "2019"]];
scene("sO", 48.95, 88.19, `<div class="stage"><div class="stagev"></div></div>
  <div class="capblock">
    <div class="capk" id="oK1">The TV app</div><div class="capk" id="oK2">How a text arrives</div><div class="capk" id="oK3">The Recco agent</div><div class="capk" id="oK4">Real titles only</div><div class="capk" id="oK5">Saved and pushed live</div><div class="capk" id="oK6">Private by design</div>
    <div class="caph" id="oH1">${W("Built with React Native for Vega")}</div>
    <div class="caph" id="oH2">${W("First launch shows a five-digit code")}</div>
    <div class="caph" id="oH3">${W("Text it, and phone and TV are linked")}</div>
    <div class="caph" id="oH4">${W("Texts come in through Zernio")}</div>
    <div class="caph" id="oH5">${W("Lambda checks it, SQS queues it")}</div>
    <div class="caph" id="oH6">${W("The app updates in real time")}</div>
    <div class="caph" id="oH7">${W("Running on AgentCore")}</div>
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
  <div class="dlabel" id="oLblP" style="left:268px;top:470px">Your phone</div>
  <div class="dlabel" id="oLblT" style="left:268px;top:812px">Fire TV</div>
  <div class="live olive" id="oLive"><span></span>Live</div>
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
  <div class="chip vega" id="oChip"><span class="cdot"></span>React Native for Vega</div>
  ${phone("oPhone", [{ id: "o1", text: "48217" }], { time: "8:58" })}
  <div class="linkline" id="oLink"><div class="lldot" id="oDot"></div></div>`);

''')

# ------------------------------------------------------------ seasons: night first, shifted, hard start from the zoom
rep('''const seasonOrder = ["fallDay", "fallNight", "winterDay", "summerDay", "summerNight", "winterNight"];
const seasonCards = [card(RECS.stack), card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past)];
const vS = [
  ["fallDay", 91.95, 3.55], ["fallNight", 94.6, 1.6], ["winterDay", 95.4, 1.4], ["summerDay", 96.1, 1.4], ["summerNight", 96.75, 1.75], ["winterNight", 97.7, 5.8],
];''',
'''const seasonOrder = ["fallNight", "fallDay", "winterDay", "summerDay", "summerNight", "winterNight"];
const seasonCards = [card(RECS.stack), card(RECS.koq), card(RECS.slow), card(RECS.bear), card(RECS.sev), card(RECS.past), card(RECS.shrink), card(RECS.dune), card(RECS.lasso)];
const vS = [
  ["fallNight", 88.19, 3.55], ["fallDay", 90.84, 1.6], ["winterDay", 91.64, 1.4], ["summerDay", 92.34, 1.4], ["summerNight", 92.99, 1.75], ["winterNight", 93.94, 5.8],
];''')
rep('''scene("sS", 91.95, 99.15, `''', '''scene("sS", 88.19, 95.39, `''')
rep('''scene("sU", 99.15, 103.5, `''', '''scene("sU", 95.39, 99.74, `''')

# ------------------------------------------------------------ timeline: drop the orbs and L–R, add the map
rep('''  [["#orb0", 1400, 120, 1150, 420, 9.1], ["#orb1", -200, 620, 120, 380, 11.3], ["#orb2", 760, 820, 980, 560, 13.7]].forEach(([id, x0, y0, x1, y1, half]) => {
    tl.set(id, { x: x0, y: y0 }, 0);
    tl.to(id, { x: x1, y: y1, duration: half, yoyo: true, repeat: Math.max(0, Math.floor(${DURATION} / half) - 1), ease: "sine.inOut" }, 0);
  });
''', '')
rep('''"#bGrid *, .bcap *, #iScr .grid *, #iD-drawer *, #uF-card *, #uEnd *, #eTV *, #eReveal *"''',
    '''"#bGrid *, .bcap *, #iScr .grid *, #iD-drawer *, #uF-card *, #uEnd *, #eTV *, #eReveal *, #oTV *, #oPhone *, .crow *"''')
between("  // ---- L · Chapter", "  // ---- S + T · Inbox, then the seasons", r'''  // ---- O · How it's built: one map, filled in as the voice names each piece
  const V = (x) => ${VO2_AT} + (x - 2.76);
  const O0 = 48.95, FULLO = { x: 248, y: -74, scale: 1.6271 };
  const TVMINI = { x: -444, y: 82, scale: 0.2797 }, PHMINI = { x: -1357, y: -260, scale: 0.32 };
  tl.fromTo("#sO", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, O0);
  const nodeIn = (id, t) => { inn(id, t, { opacity: 0, y: 50, scale: 0.8 }, 0.6, "back.out(1.9)"); pop(id + " .nic", t + 0.12); };
  const edgeIn = (id, t, d = 0.45) => tl.fromTo(id, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" }, t);
  const flowOn = (i, t, until) => { tl.fromTo("#o-f" + i, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, t); tl.fromTo("#o-f" + i, { strokeDashoffset: 0 }, { strokeDashoffset: -48 * Math.round((T(until) - T(t)) * 2.2), duration: T(until) - T(t), ease: "none" }, t); };
  const OP = ${JSON.stringify(Object.fromEntries(Object.entries(OPTS).map(([k, [x, y]]) => [k, [x - 9, y - 9]])))};
  const pk = (id, keys, t) => { tl.set(id, { opacity: 1 }, t); keys.forEach((k, i) => { const [x, y] = OP[k]; if (i === 0) tl.set(id, { x, y }, t); else tl.to(id, { x, y, duration: T(t + i * 0.42) - T(t + (i - 1) * 0.42), ease: "power1.inOut" }, t + (i - 1) * 0.42); }); tl.to(id, { opacity: 0, duration: 0.15 }, t + (keys.length - 1) * 0.42); };
  const cap = (outK, inK, outH, inH, t) => { if (outK) out(outK, t, { opacity: 0, y: -10 }, 0.25); if (inK) inn(inK, t + 0.15, { opacity: 0, y: 14 }, 0.4); if (outH) out(outH, t, { opacity: 0, y: -14 }, 0.25); words(inH, t + 0.15, 0.05); };
  // everything the map will show starts hidden
  tl.set("#o-e0, #o-e1, #o-e2, #o-e3, #o-e4, #o-e5, #o-e6", { strokeDashoffset: 1 }, O0);
  tl.set(".node, #oLblP, #oLblT, #oLive, .obub, .obot, .qrow.small .qcard, .pchip, #o-lcheck, #o-q0, #o-q1, #o-q2", { opacity: 0 }, O0);
  tl.set("#qb0, #qb1, #qb2, #qx", { opacity: 0 }, O0);
  // A · the TV app, big and centred, on its pairing screen
  tl.set("#oTV", { x: 248, y: 0, scale: 1.12 }, O0);
  tl.fromTo("#oTV", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", immediateRender: false }, O0);
  tl.set("#oIn", { opacity: 0 }, O0);
  tl.set("#oC-d0, #oC-d1, #oC-d2, #oC-d3, #oC-d4", { opacity: 0 }, O0);
  cap(null, "#oK1", null, "#oH1", O0 + 0.05);
  inn("#oChip", V(4.07), { opacity: 0, y: 20, scale: 0.9 }, 0.45, "back.out(1.7)");
  spin("#oC-spin", O0, V(10.4));
  cap(null, null, "#oH1", "#oH2", V(5.2));
  [0, 1, 2, 3, 4].forEach((i) => tl.fromTo("#oC-d" + i, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)", immediateRender: false }, V(6.67) + i * 0.1));
  // the TV slides over, the phone texts the code, a line links them, the inbox opens
  tl.to("#oTV", { x: 0, scale: 1, duration: 0.7, ease: "power3.inOut" }, V(7.2));
  tl.to("#oChip", { opacity: 0, y: -10, duration: 0.3 }, V(7.2));
  inn("#oPhone", V(7.45), { opacity: 0, y: 160, rotation: 6 }, 0.7, "back.out(1.3)");
  cap(null, null, "#oH2", "#oH3", V(7.55));
  type("oPhone", "o1", V(8.1), V(8.7), V(8.85));
  tl.fromTo("#oLink", { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, V(9.2));
  tl.fromTo("#oDot", { x: 0 }, { x: -110, duration: 0.6, ease: "power2.inOut" }, V(9.2));
  const OCOLW = 585.33, OROWH = 442, osx = (i) => (i % 3) * OCOLW, osy = (i) => Math.floor(i / 3) * OROWH;
  const oorder = ["koq", "slow", "bear", "sev", "past", "shrink", "dune", "lasso"], OX = (id) => "#oX-" + id;
  ["pNew", "stack"].forEach((id) => tl.set(OX(id), { opacity: 0, x: 0, y: 0 }, O0));
  oorder.forEach((id, i) => tl.set(OX(id), { opacity: 0, x: osx(i), y: osy(i) }, O0));
  tl.to("#oCode", { opacity: 0, duration: 0.35 }, V(9.95));
  tl.fromTo("#oIn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, V(9.95));
  oorder.forEach((id, i) => tl.fromTo(OX(id), { opacity: 0, y: osy(i) + 60 }, { opacity: 1, y: osy(i), duration: 0.5, ease: "power3.out", immediateRender: false }, V(10.0) + i * 0.05));
  tl.to("#oLink", { opacity: 0, duration: 0.3 }, V(10.55));
  // B · both devices shrink into the corners of the map; the pipeline appears between them
  cap("#oK1", "#oK2", "#oH3", "#oH4", V(10.7));
  tl.to("#oTV", { ...TVMINI, duration: 0.8, ease: "power3.inOut" }, V(10.7));
  tl.to("#oPhone", { ...PHMINI, duration: 0.8, ease: "power3.inOut" }, V(10.7));
  inn("#oLblP", V(11.35), { opacity: 0, y: 10 }, 0.4); inn("#oLblT", V(11.35), { opacity: 0, y: 10 }, 0.4);
  edgeIn("#o-e0", V(11.3)); nodeIn("#o-zernio", V(11.46));
  cap(null, null, "#oH4", "#oH5", V(12.4));
  edgeIn("#o-e1", V(12.85)); nodeIn("#o-lambda", V(13.21));
  inn("#o-lcheck", V(13.68), { opacity: 0, scale: 0.3 }, 0.4, "back.out(2.2)");
  edgeIn("#o-e2", V(15.45)); nodeIn("#o-sqs", V(16.09));
  [0, 1, 2].forEach((i) => inn("#o-q" + i, V(16.35) + i * 0.2, { opacity: 0, x: -24 }, 0.3));
  tl.fromTo("#o-sqs .qbars i", { scaleX: 1 }, { scaleX: 0.55, duration: 0.226, yoyo: true, repeat: 9, stagger: 0.113, ease: "sine.inOut", immediateRender: false }, V(17.1));
  const row1 = ["phone", "zernio", "lambda", "sqs"];
  [V(12.0), V(14.2), V(15.3), V(16.5), V(17.6), V(18.7)].forEach((t, i) => pk("#o-pk" + i, row1, t));
  flowOn(0, V(13.9), V(41.0)); flowOn(1, V(14.0), V(41.0)); flowOn(2, V(16.4), V(41.0));
  // "updates in real time": a card lands on the little TV
  cap(null, null, "#oH5", "#oH6", V(17.5));
  oorder.unshift("pNew");
  oorder.forEach((id, i) => { if (i > 0) tl.to(OX(id), { x: osx(i), y: osy(i), duration: 0.5, ease: "power3.inOut" }, V(17.9)); });
  tl.fromTo(OX("pNew"), { opacity: 0, y: -90, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)", immediateRender: false }, V(17.9));
  spin("#oX-pNew-spin", V(17.9), V(19.0));
  inn("#oLive", V(18.3), { opacity: 0, scale: 0.6 }, 0.35, "back.out(2)");
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.8, repeat: 1, ease: "power1.out" }, V(18.4));
  oorder[0] = "stack";
  tl.set(OX("stack"), { x: 0, y: 0, zIndex: 6 }, V(18.75));
  tl.to(OX("pNew"), { opacity: 0, duration: 0.25 }, V(18.75));
  tl.fromTo(OX("stack"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, V(18.75));
  // C · the agent
  cap("#oK2", "#oK3", "#oH6", "#oH7", V(19.35));
  edgeIn("#o-e3", V(19.6)); nodeIn("#o-agent", V(19.95));
  tl.fromTo("#o-agent", { boxShadow: "0 0 0 0 rgba(226,138,59,0)" }, { boxShadow: "0 0 0 5px rgba(226,138,59,.9)", duration: 0.35, yoyo: true, repeat: 1 }, V(21.4));
  cap(null, null, "#oH7", "#oH8", V(22.1));
  [["#oIn0", V(22.63)], ["#oIn1", V(23.43)], ["#oIn2", V(23.97)]].forEach(([id, t], i) => {
    inn(id, t, { opacity: 0, y: 30, scale: 0.8 }, 0.4, "back.out(1.8)");
    tl.to(id, { x: 1635 - 700, y: 685 - 500, scale: 0.15, opacity: 0, duration: 0.55, ease: "power2.in" }, t + 0.5);
  });
  tl.fromTo("#o-agent .nic", { scale: 1 }, { scale: 1.2, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, V(26.4));
  cap(null, null, "#oH8", "#oH9", V(26.45));
  [["#oOut0", V(27.23), 110], ["#oOut1", V(27.78), 650], ["#oOut2", V(28.49), 1320]].forEach(([id, t, lx]) => {
    inn(id, t, { opacity: 0, x: 1635 - lx - 245, y: 685 - 862, scale: 0.2 }, 0.65, "back.out(1.3)");
    pop(id + " .oic", t + 0.35);
  });
  // D · checked in OMDb
  cap("#oK3", "#oK4", "#oH9", "#oH10", V(31.05));
  tl.to(".obot", { opacity: 0, y: 20, duration: 0.3 }, V(31.0));
  [0, 1, 2, 3].forEach((i) => inn("#q" + i, V(31.3) + i * 0.1, { opacity: 0, y: 80, rotation: [-6, 4, -3, 5][i], scale: 0.85 }, 0.6, "back.out(1.5)"));
  [0, 1, 2].forEach((i) => { const t = V(32.2) + i * 0.25; inn("#qb" + i, t, { opacity: 0, scale: 0.4 }, 0.45, "back.out(2.4)"); tl.fromTo("#q" + i + " .qp", { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, t); });
  inn("#qx", V(33.7), { opacity: 0, scale: 0.5 }, 0.4, "back.out(2.4)");
  tl.fromTo("#q3 .qp", { x: 0 }, { x: -10, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut" }, V(33.75));
  tl.to("#q3", { opacity: 0.45, duration: 0.4 }, V(34.2));
  // E · saved, then pushed to the TV
  cap("#oK4", "#oK5", "#oH10", "#oH11", V(34.85));
  tl.to(".qrow.small .qcard", { opacity: 0, y: 20, duration: 0.3 }, V(34.8));
  edgeIn("#o-e4", V(34.9)); nodeIn("#o-ddb", V(35.0));
  cap(null, null, "#oH11", "#oH12", V(36.3));
  edgeIn("#o-e5", V(36.35)); nodeIn("#o-appsync", V(36.45));
  edgeIn("#o-e6", V(37.1));
  const row2 = ["agent", "ddb", "appsync", "tv"];
  [V(36.95), V(37.7), V(38.4)].forEach((t, i) => pk("#o-pk" + (5 + i), row2, t));
  flowOn(3, V(37.2), V(41.0)); flowOn(4, V(37.3), V(41.0)); flowOn(5, V(37.4), V(41.0)); flowOn(6, V(37.6), V(41.0));
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.7, repeat: 1, ease: "power1.out", immediateRender: false }, V(38.5));
  // F · private by design
  cap("#oK5", "#oK6", "#oH12", "#oH13", V(38.85));
  inn("#rP0", V(39.0), { opacity: 0, y: 60, scale: 0.9 }, 0.55, "back.out(1.6)");
  pop("#rP0 .pic", V(39.15));
  const scramble = ["+1 (604) 555-0189", "+1 (6#4) 5$5-0%89", "+7 f6#a 9!5-c2?9", "7f3a·9c2!·e#b4", "7f3a·9c21·e0b4"], numEl = S("#rNum"), sc = { p: 0 };
  tl.fromTo(sc, { p: 0 }, { p: 1, duration: 0.7, ease: "none", onUpdate: () => { numEl.textContent = scramble[Math.min(scramble.length - 1, Math.floor(sc.p * scramble.length))]; } }, V(39.6));
  cap(null, null, "#oH13", "#oH14", V(40.3));
  inn("#rP1", V(40.45), { opacity: 0, y: 60, scale: 0.9 }, 0.55, "back.out(1.6)");
  pop("#rP1 .pic", V(40.6));
  tl.to("#rLast", { opacity: 0, x: 20, duration: 0.4 }, V(41.3));
  // into the inbox: the map clears and the little TV grows to fill the frame; the seasons scene continues it
  tl.to(".node, .edges, .dlabel, #oPhone, .privacy, #oLive, #oK6, #oH14", { opacity: 0, duration: 0.4 }, V(41.0));
  tl.to("#oTV", { ...FULLO, duration: 0.9, ease: "power3.inOut" }, V(41.0));
  tl.to("#oTV .tvglass", { borderRadius: 0, duration: 0.9 }, V(41.0));

''')

# S/U timeline: shift every scene-clock literal from the old chapter layout
i = s.find("  // ---- S + T · Inbox, then the seasons"); j = s.find("document.fonts.ready.then")
blk = s[i:j]
blk = re.sub(r"\b(9\d\.\d+|10\d\.\d+)\b", lambda m: f"{float(m.group(1)) - 3.76:.2f}", blk)
s = s[:i] + blk + s[j:]
rep('''  tl.fromTo("#sS", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 88.19);
  tl.fromTo("#sScale", { scale: 1.05 }, { scale: 1.0, duration: T(95.39) - T(88.19), ease: "power1.out" }, 88.19);''',
'''  tl.set("#sS", { opacity: 1 }, 88.19);
  tl.fromTo("#sScr0 .themepill", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 88.45);''')
rep('''  tl.fromTo("#sScr0 .grid .card", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, 88.19);\n''', '')

# ------------------------------------------------------------ CSS + root
rep('''#root { width: 100%; height: 100%; position: relative; overflow: hidden; font-family: "Inter", sans-serif; color: #FFF6E8; background: #141c1c url(assets/bg/pres.png) center / cover; }''',
    '''#root { width: 100%; height: 100%; position: relative; overflow: hidden; font-family: "Inter", sans-serif; color: #FFF6E8; background: #141c1c; }''')
i = s.find(".orb { position: absolute;"); j = s.find("#orb2 {"); j = s.find("\n", j) + 1
s = s[:i] + '''.stage { position: absolute; inset: 0; background: #141c1c url(assets/bg/stage-night.jpg) center / cover; }
.stagev { position: absolute; inset: 0; background: url(assets/bg/vignette-fallNight.png) 0 0 / 100% 100%; }
.dlabel { position: absolute; width: 240px; margin-left: -120px; text-align: center; font-size: 24px; font-weight: 600; color: #C4CAC0; }
.olive { left: 372px; top: 584px; right: auto; }
.obub { position: absolute; left: 600px; top: 470px; opacity: 0; }
.obot { position: absolute; top: 820px; width: 490px; opacity: 0; }
.qrow.small { top: 790px; gap: 36px; }
.qrow.small .qcard { width: 150px; gap: 6px; }
.qrow.small .qp { width: 150px; height: 225px; border-radius: 12px; box-shadow: 0 18px 40px rgba(0,0,0,.45); }
.qrow.small .qp.ghost span { font-size: 80px; }
.qrow.small .qt { font-size: 20px; }
.qrow.small .qm { font-size: 15px; }
.qrow.small .qbadge { left: 8px; bottom: 8px; font-size: 14px; padding: 4px 9px 4px 7px; gap: 5px; }
.qrow.small .qx { left: 8px; right: 8px; bottom: 8px; font-size: 13px; padding: 5px 6px; gap: 5px; }
''' + s[j:]
rep('''.pres.glow { background: url(assets/bg/pres-glow.png) center / cover; }\n''', '')
rep('''      <div class="orb" id="orb0"></div><div class="orb" id="orb1"></div><div class="orb" id="orb2"></div>\n''', '')

open(P, "w").write(s)
print("patched")
