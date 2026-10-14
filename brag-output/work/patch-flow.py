# Continuity pass: browse → phone on "I check my phone"; the reveal and the install in one scene with a
# better app page; one continuous inbox where each text inserts a loading card; the TV zooms into the
# full-frame inbox for "my list is waiting". Cue times stay on the old clock (T() maps them).
# Run once: python3 -I patch-flow.py
import sys

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

# ------------------------------------------------------------ data
rep('''  stack: { stack: true, title: "3 cozy comedies for a night in",''',
    '''  lasso: { title: "Ted Lasso", type: "Series", year: "2020–", imdb: "8.7", rt: "", poster: "ted-lasso", from: "Sam", msg: "the feel-good one. just trust me", time: "Sat" },
  stack: { stack: true, title: "3 cozy comedies for a night in",''')

# ------------------------------------------------------------ scenes D + E (HTML)
between("// D · Recco reveal", "// I · My list is waiting", r'''// D+E · Reveal → install → pairing → inbox (20.85 – 37.8), one continuous scene.
// The TV frame starts scaled so its screen covers the whole frame (invisible until the app page slides up),
// shrinks into view for the install, slides left for the phone, then zooms back out into the next scene.
bgVideo("fallDay", 20.85, 3.35, 0, "vwD");
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
];
const tvStackE = `<div class="still" id="eStill" style="background-image:url(assets/bg/fallNight.jpg)"></div>
  ${screen({ theme: "fallNight", id: "eCode", still: false, hdr: false, body: codeBody("eC") })}
  ${screen({ theme: "fallNight", id: "eConn", still: false, hdr: false, body: connectedBody("eK") })}
  ${screen({ theme: "fallNight", id: "eIn", still: false, body: `<div class="cardlayer" id="eCards">${liveCards.map(([, h]) => h).join("")}</div>` })}
  <div class="screen" id="eStore">${storeBody}</div>`;
const phoneE = phone("ePhone", [
  { id: "m1", text: "48217" },
  { id: "m2", text: "Dad says Slow Horses is brilliant" },
  { id: "m3", text: "Jill says King of Queens is hilarious" },
  { id: "m4", kind: "link", title: "3 cozy comedies for a night in", typeText: "tiktok.com/@steph/video/74…" },
  { id: "m5", text: "Steph sent this" },
]);
scene("sE", 20.85, 37.8, `<div class="revealwrap" id="eReveal"><div class="dshade"></div><div class="reveal"><div class="soNow" id="d1">${W("So now, I use")}</div><img id="dLogo" src="assets/img/recco-logo.png" alt="Recco" class="revlogo"><div class="revsub" id="d2">An inbox of things to watch, on Fire TV</div><div class="revease" id="d3">${W("Setup is easy.")}</div></div></div>
  <div class="capblock">
    <div class="capk" id="eK1">Setup</div><div class="capk" id="eK2">Text it anything</div><div class="capk" id="eK3">From a friend</div><div class="capk" id="eK4">From a link</div>
    <div class="caph" id="eH1">${W("Install Recco on Fire TV.")}</div>
    <div class="caph" id="eH2">${W("Text the code to the Recco number.")}</div>
    <div class="caph" id="eH3">${W("The Recco agent looks it up.")}</div>
    <div class="caph" id="eH4">${W("Jill says a sitcom is hilarious.")}</div>
    <div class="caph" id="eH6">${W("Steph sends a video with three shows.")}</div>
    <div class="caph" id="eH5">${W("One link, three reccos.")}</div>
  </div>
  ${tvFrame("eTV", tvStackE, { x: 110, y: 270, w: 1180 })}
  ${phoneE}`);

''')
rep('''bgVideo("fallNight", 37.5, 10.4, 0, "vwI");''', '''bgVideo("fallNight", 37.8, 10.1, 0, "vwI");''')

# ------------------------------------------------------------ timeline B
between("  // ---- B · Looking on the TV, then the phone takes over", "  // ---- C · Friends", r'''  // ---- B · Browsing on the TV, then the phone takes the frame
  sceneFade("sB", 7.75, 16.35);
  tl.set("#bGrid", { y: 0 }, 7.75);
  tl.set("#bPhone", { scale: 1.12, transformOrigin: "50% 50%" }, 7.75);
  [[7.9, 1, 0], [8.25, 2, 0], [8.6, 3, 0], [8.95, 2, 1], [9.25, 3, 1]].forEach(([t, c, r]) => tl.to("#bFocus", { x: c * 262, y: r * 484, duration: 0.22, ease: "power2.out" }, t));
  const clk = { m: 0 }, clkEl = S("#bClockT");
  tl.fromTo(clk, { m: 0 }, { m: 48, duration: T(14.5) - T(7.9), ease: "power1.in", onUpdate: () => { const m = Math.round(clk.m); clkEl.textContent = "9:" + String(m).padStart(2, "0"); } }, 7.9);
  inn("#bClock", 7.9, { opacity: 0, y: -20 }, 0.4);
  tl.to("#bClock", { scale: 1.25, duration: 0.5, ease: "power2.out" }, 12.2);
  // "I check my phone": the shows fall away, the phone rises into the centre
  tl.to("#bGrid", { opacity: 0.16, filter: "blur(10px)", duration: 0.7, ease: "power2.inOut" }, 9.35);
  tl.fromTo("#bDim", { opacity: 0 }, { opacity: 0.5, duration: 0.7 }, 9.35);
  tl.to("#bFocus", { opacity: 0, duration: 0.3 }, 9.35);
  inn("#bPhone", 9.4, { opacity: 0, y: 320, rotation: 8 }, 0.85, "back.out(1.2)");
  const listMax = Math.max(0, S("#bList").offsetHeight - 700);
  tl.fromTo("#bList", { y: 0 }, { y: -listMax, duration: T(13.6) - T(10.3), ease: "sine.inOut" }, 10.3);
  // "so I just keep scrolling": messages give way to the feed
  tl.fromTo("#bFeed", { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }, 14.3);
  tl.to("#bPhone", { scale: 1.2, duration: 0.5, ease: "power2.inOut" }, 14.4);
  tl.to("#bList", { opacity: 0, duration: 0.1 }, 14.66);
  [14.75, 15.1, 15.4, 15.65, 15.85, 16.02, 16.17].forEach((t, i) => tl.to("#bStrip", { y: -792 * (i + 1), duration: i < 3 ? 0.3 : 0.17, ease: "power3.inOut" }, t));
  words("#b1", 7.95);
  out("#b1", 11.8, { opacity: 0, y: -16 }, 0.25);
  words("#b2", 12.05);
  out("#b2", 14.2, { opacity: 0, y: -16 }, 0.25);
  words("#b3", 14.45, 0.05, 0.5);

''')

# ------------------------------------------------------------ timeline D + E
between("  // ---- D · Reveal, held through", "  // ---- I · My list is waiting", r'''  // ---- D+E · Reveal → install → pairing → inbox, one continuous scene
  const FULL = { x: 248, y: -74, scale: 1.6271 }; // the TV's screen exactly covers the 1920×1080 frame
  tl.fromTo("#sE", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 20.85);
  tl.fromTo("#eReveal", { scale: 1 }, { scale: 1.05, duration: T(23.0) - T(20.85), ease: "none" }, 20.85);
  words("#d1", 20.9, 0.07, 0.5);
  inn("#dLogo", 21.55, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.6, "back.out(1.8)");
  inn("#d2", 21.8, { opacity: 0, y: 16 }, 0.45);
  words("#d3", 22.05, 0.08);
  // the TV is already here at full frame, see-through until the app page slides up inside it
  tl.set("#eTV", { ...FULL, backgroundColor: "rgba(10,12,12,0)" }, 20.85);
  tl.set("#eTV .tvglass", { backgroundColor: "rgba(0,0,0,0)", borderRadius: 0 }, 20.85);
  tl.set("#eStill, #eCode, #eConn, #eIn", { opacity: 0 }, 20.85);
  tl.set("#eStore", { yPercent: 100 }, 20.85);
  tl.to("#eStore", { yPercent: 0, duration: 0.55, ease: "power3.out" }, 22.9);
  tl.to("#eReveal", { opacity: 0, duration: 0.3 }, 23.05);
  tl.set("#eStill", { opacity: 1 }, 23.2);
  // the frame shrinks into the TV; the room video behind gives way to the dark stage
  tl.set("#eTV", { backgroundColor: "#0a0c0c" }, 23.3);
  tl.set("#eTV .tvglass", { backgroundColor: "#000" }, 23.3);
  tl.to("#eTV", { x: 248, y: 0, scale: 1.12, duration: 0.8, ease: "power3.inOut" }, 23.3);
  tl.to("#eTV .tvglass", { borderRadius: 10, duration: 0.8 }, 23.3);
  tl.to("#vwD", { opacity: 0, duration: 0.6 }, 23.4);
  inn("#eK1", 23.4, { opacity: 0, y: 14 }, 0.4); words("#eH1", 23.4);
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
  bob("#ePhone", 26.0, 36.9, 10, 1.8);
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
  tl.fromTo("#eConn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 26.6);
  inn("#eK-chk", 26.7, { opacity: 0, scale: 0.3, rotation: -40 }, 0.55, "back.out(2.6)");
  // "Now I can text it anything": the inbox opens, and stays open
  out("#eK1", 27.0, { opacity: 0, y: -10 }, 0.25); inn("#eK2", 27.15, { opacity: 0, y: 14 }, 0.4);
  out("#eH2", 27.0, { opacity: 0, y: -14 }, 0.25); words("#eH3", 27.15);
  const COLW = 585.33, ROWH = 442, sx = (i) => (i % 3) * COLW, sy = (i) => Math.floor(i / 3) * ROWH;
  const order = ["bear", "sev", "past", "shrink", "dune", "lasso"];
  const X = (id) => "#eX-" + id;
  ["pDad", "slow", "pJill", "koq", "pSteph", "stack"].forEach((id) => tl.set(X(id), { opacity: 0, x: 0, y: 0 }, 20.85));
  order.forEach((id, i) => tl.set(X(id), { opacity: 0, x: sx(i), y: sy(i) }, 20.85));
  tl.to("#eConn", { opacity: 0, duration: 0.35 }, 27.35);
  tl.fromTo("#eIn", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 27.3);
  order.forEach((id, i) => tl.fromTo(X(id), { opacity: 0, y: sy(i) + 60 }, { opacity: 1, y: sy(i), duration: 0.5, ease: "power3.out", immediateRender: false }, 27.4 + i * 0.06));
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
  out("#eK2", 30.6, { opacity: 0, y: -10 }, 0.25); inn("#eK3", 30.8, { opacity: 0, y: 14 }, 0.4);
  out("#eH3", 30.6, { opacity: 0, y: -14 }, 0.25); words("#eH4", 30.8);
  type("ePhone", "m3", 30.85, 31.6, 31.75);
  insert("pJill", 31.95); spin("#eX-pJill-spin", 31.95, 33.4); resolve("pJill", "koq", 33.3);
  // Steph: a link, then her note
  out("#eK3", 34.05, { opacity: 0, y: -10 }, 0.25); inn("#eK4", 34.2, { opacity: 0, y: 14 }, 0.4);
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
  // "when it's my time": phone and captions clear, the TV fills the frame, the next scene continues it
  tl.to("#ePhone", { opacity: 0, y: 160, duration: 0.4, ease: "power2.in" }, 36.9);
  out("#eK4, #eH5", 36.95, { opacity: 0, y: -14 }, 0.3);
  tl.to("#eTV", { ...FULL, duration: 0.8, ease: "power3.inOut" }, 37.0);
  tl.to("#eTV .tvglass", { borderRadius: 0, duration: 0.8 }, 37.0);

''')

# ------------------------------------------------------------ timeline I: continue from the zoom, no re-entry
rep('''  sceneFade("sI", 37.5, 42.55);
  tl.set("#iScale", { transformOrigin: "50% 35%" }, 37.5);
  tl.fromTo("#iScale", { scale: 1.06 }, { scale: 1.0, duration: 0.9, ease: "power2.out" }, 37.5);
  tl.fromTo("#iScr .grid .card", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, 37.5);
  tl.to("#iScale", { scale: 1.07, duration: 0.7, ease: "power2.inOut" }, 38.75);
  tl.to("#iScale", { scale: 1.0, duration: 0.5, ease: "power3.out" }, 39.55);
  tl.set("#iD-scrim, #iD-drawer", { opacity: 0 }, 37.5);''',
'''  tl.set("#sI", { opacity: 1 }, 37.8);
  tl.to("#sI", { opacity: 0, scale: 0.985, duration: 0.3, ease: "power1.in" }, 42.25);
  tl.set("#iScale", { transformOrigin: "50% 35%" }, 37.8);
  tl.to("#iScale", { scale: 1.04, duration: 0.7, ease: "power2.inOut" }, 38.75);
  tl.to("#iScale", { scale: 1.0, duration: 0.5, ease: "power3.out" }, 39.55);
  tl.set("#iD-scrim, #iD-drawer", { opacity: 0 }, 37.8);''')
rep('''{ scale: 1.06, duration: T(47.9) - T(37.5), ease: "none" }, 37.5);''', '''{ scale: 1.06, duration: T(47.9) - T(37.8), ease: "none" }, 37.8);''')

# layered things the layout check should not flag
rep('''"#bGrid *, .bcap *, #iScr .grid *, #iD-drawer *, #uF-card *, #uEnd *, #eStore *, #eCode *"''',
    '''"#bGrid *, .bcap *, #iScr .grid *, #iD-drawer *, #uF-card *, #uEnd *, #eTV *, #eReveal *"''')

# ------------------------------------------------------------ CSS
rep('''.bphone { position: absolute; right: 230px; top: 210px; width: 400px; height: 820px;''',
    '''.bphone { position: absolute; left: 760px; top: 130px; width: 400px; height: 820px;''')
rep('''.bshade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10,12,13,.92) 0%, rgba(10,12,13,.55) 45%, rgba(10,12,13,.1) 100%); }''',
    '''.bshade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10,12,13,.9) 0%, rgba(10,12,13,.62) 30%, rgba(10,12,13,0) 58%); }''')
rep('''.bcap { position: absolute; left: 140px; bottom: 120px; width: 1100px; height: 220px; }
.bcap .line { position: absolute; left: 0; bottom: 0; font-size: 74px; opacity: 0; }
#b3 { max-width: 820px; }''',
    '''.bcap { position: absolute; left: 120px; top: 0; bottom: 0; width: 600px; }
.bcap .line { position: absolute; left: 0; top: 420px; width: 600px; font-size: 64px; line-height: 1.1; opacity: 0; }''')
i = s.find(".store { position: absolute;")
j = s.find(".mlist-h { font-size: 38px;")
if i < 0 or j < 0 or j < i:
    sys.exit("store css block not found")
s = s[:i] + '''.store { position: absolute; inset: 0; background: #0f1418; color: #FFF6E8; overflow: hidden; }
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
''' + s[j:]

open(P, "w").write(s)
print("patched")
