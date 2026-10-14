# Edit pass: app font everywhere, phone-led scrolling, centered friend messages with posters,
# longer reveal, an install step, then the number and the connection. Run once: python3 -I patch-edits.py
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

# ------------------------------------------------------------ scenes B, C, D (HTML)
between("// B · Scrolling (7.75 – 16.35)", "// E–H · Setup + texting", r'''// B · Looking (7.75 – 16.35): browsing on the TV, then the phone takes over
const browsePosters = ["the-bear", "dune-2", "severance", "past-lives", "shrinking", "slow-horses", "ted-lasso", "abbott", "only-murders", "knives-out", "the-others", "shining", "king-of-queens"];
const rowNames = ["Trending now", "Because you watched", "New this week", "Top picks for you", "Popular on TV", "Award winners", "Continue browsing", "Critically acclaimed"];
const browseRows = rowNames.map((n, r) => `<div class="brow"><div class="blabel">${n}</div><div class="btiles" id="brow${r}">${Array.from({ length: 11 }, (_, i) => `<div class="btile" style="background-image:url(${P(browsePosters[(i * 3 + r * 5) % browsePosters.length])})"></div>`).join("")}</div></div>`).join("");
const threads = [["Jill", "haha that sitcom I told you about is SO funny", "3 wk"], ["Book club", "ok but what was the show called", "3 wk"], ["Steph", "Sent a video", "2 wk"], ["Mom", "your dad and I are hooked on that one show", "Sun"], ["Sarah", "you have to watch it, trust me", "Sat"], ["Dad", "that British spy one, forget the name", "Fri"], ["Jill", "did you start it yet??", "Thu"], ["Sam", "the one with the kitchen", "Wed"], ["Mom", "what's it called again, the office one", "Tue"], ["Steph", "ok you'll love this one", "Mon"], ["Sarah", "omg the finale", "Sep 28"], ["Dad", "watching it again tonight", "Sep 26"]];
const feedPosts = [
  ["the-bear", "kitchen.confidential", "the one-take episode. that's the post.", "212K", "4,102"],
  ["bg/fallDay", "cozy.hours", "fall reset: tea, blanket, zero plans", "88K", "1,240"],
  ["shining", "frightnight.club", "rating every horror movie I watched in October", "1.2M", "18K"],
  ["bg/summerDay", "slow.sundays", "POV: you said one episode", "46K", "903"],
  ["dune-2", "desert.cinema", "this scene lives in my head rent free", "530K", "7,811"],
  ["bg/winterNight", "snowday.diaries", "first snow, zero plans", "61K", "1,077"],
  ["only-murders", "podcast.brain", "3 mysteries to start tonight", "97K", "2,315"],
  ["past-lives", "film.notes", "the ending. I'm not okay.", "340K", "6,020"],
];
const postImg = (k) => (k.startsWith("bg/") ? `assets/${k.replace("bg/", "bg/")}.jpg` : P(k));
scene("sB", 7.75, 16.35, `<div class="browse"><div class="bgrid" id="bGrid" data-layout-allow-overlap>${browseRows}<div class="bfocus" id="bFocus"></div></div></div>
  <div class="bshade"></div><div class="bdim" id="bDim"></div>
  <div class="clock" id="bClock"><span id="bClockT">9:00</span><small>PM</small></div>
  <div class="bphone" id="bPhone" data-layout-allow-overlap><div class="ph-screen">
     <div class="ph-status"><span>9:12</span><span class="ph-isl"></span><span class="ph-bat"></span></div>
     <div class="mview"><div class="mscroll" id="bList" data-layout-allow-overlap>
       <div class="mlist-h">Messages</div><div class="msearch">${ic.search(18)}<span>show</span></div>
       ${threads.map(([n, t, d]) => `<div class="mrow"><div class="mav">${n[0]}</div><div class="mtx"><div class="mn"><b>${n}</b><span>${d}</span></div><div class="mt">${t}</div></div></div>`).join("")}
     </div></div>
     <div class="feed" id="bFeed" data-layout-allow-overlap><div class="fstrip" id="bStrip">${feedPosts.map(([img, who, cap, likes, comments]) => `<div class="fpost" style="background-image:url(${postImg(img)})"><div class="fgrad"></div>
       <div class="fact"><div><span class="fic">♥</span>${likes}</div><div><span class="fic">${ic.msg(30)}</span>${comments}</div><div><span class="fic">➦</span>Share</div></div>
       <div class="fmeta"><div class="fwho"><span class="fav">${who[0].toUpperCase()}</span>@${who}</div><div class="fcap">${cap}</div></div></div>`).join("")}</div>
       <div class="ftabs"><span>Following</span><b>For You</b></div></div>
  </div></div>
  <div class="bcap" data-layout-allow-overlap><div class="line" id="b1">${W("Ten minutes of looking.")}</div><div class="line" id="b2">${W("No time left for an episode.")}</div><div class="line accent" id="b3">${W("So I just keep scrolling.")}</div></div>`);

// C · Friends (16.35 – 20.85): their messages arrive with the shows they mean, then blur away
const friendMsgs = [
  ["Jill", "That sitcom is hilarious, you’d love it", "king-of-queens"],
  ["Mom", "Severance!! your dad and I are hooked", "severance"],
  ["Steph", "Sent a video: 3 comfort shows", "abbott"],
  ["Sarah", "you HAVE to watch The Bear", "the-bear"],
  ["Dad", "Slow Horses. Very British, very funny", "slow-horses"],
];
scene("sC", 16.35, 20.85, `<div class="still blurbg" style="background-image:url(assets/bg/fallNight.jpg)"></div><div class="cshade"></div>
  <div class="chat">${friendMsgs.map(([n, t, p], i) => `<div class="crow" id="cr${i}"><div class="fbav" id="ca${i}">${n[0]}</div><div class="cmsg" id="cm${i}"><div class="fbn">${n}</div><div class="fbt">${t}</div></div><div class="cposter" id="cp${i}" style="background-image:url(${P(p)})"></div></div>`).join("")}</div>`);

// D · Recco reveal (20.85 – 22.95), held through "Setup is easy."
bgVideo("fallDay", 20.85, 2.1, 0, "vwD");
scene("sD", 20.85, 22.95, `<div class="dshade"></div><div class="reveal"><div class="soNow" id="d1">${W("So now, I use")}</div><img id="dLogo" src="assets/img/recco-logo.png" alt="Recco" class="revlogo"><div class="revsub" id="d2">An inbox of things to watch, on Fire TV</div><div class="revease" id="d3">${W("Setup is easy.")}</div></div>`);

''')

# ------------------------------------------------------------ E: install step on the TV first
rep('''const tvStackE = `<div class="still" style="background-image:url(assets/bg/fallDay.jpg)"></div>''',
'''const storeBody = `<div class="store">
    <div class="st-crumb">Apps</div>
    <div class="st-main">
      <img class="st-icon" src="assets/img/app_icon.png" alt="">
      <div class="st-info">
        <div class="st-name">Recco</div>
        <div class="st-tag">An inbox of things to watch</div>
        <div class="st-meta">Free · Lifestyle · Fire TV</div>
        <div class="st-btn" id="eBtn"><div class="st-fill" id="eFill"></div><span class="st-l" id="eGet">Get</span><span class="st-l" id="eInst">Installing…</span><span class="st-l" id="eOpen">Open</span></div>
      </div>
    </div>
    <div class="st-shots"><div style="background-image:url(assets/bg/fallDay.jpg)"></div><div style="background-image:url(assets/bg/winterNight.jpg)"></div><div style="background-image:url(assets/bg/summerDay.jpg)"></div></div>
  </div>`;
const tvStackE = `<div class="still" style="background-image:url(assets/bg/fallDay.jpg)"></div>''')
rep('''card(RECS.stack, "hCard")}</div>` })}`;''', '''card(RECS.stack, "hCard")}</div>` })}
  <div class="screen" id="eStore">${storeBody}</div>`;''')
rep('''scene("sE", 22.4, 37.5,''', '''scene("sE", 22.95, 37.5,''')
# the number on the pairing screen can be highlighted
rep('''<div style="font-size:44px;color:var(--text2)">to <span style="color:var(--text);font-weight:700">(604) 555-0142</span></div>''',
    '''<div class="numline" id="${idp}-numline" style="font-size:44px;color:var(--text2)">to <span id="${idp}-num" style="color:var(--text);font-weight:700">(604) 555-0142</span></div>''')

# ------------------------------------------------------------ timeline for B through H
between("  // ---- B · Scrolling", "  // ---- I · My list is waiting", r'''  // ---- B · Looking on the TV, then the phone takes over
  sceneFade("sB", 7.75, 16.35);
  tl.set("#bGrid", { y: 0 }, 7.75);
  let lastRow = 0;
  [[8.0, 1, 0], [8.55, 2, 0], [9.1, 2, 1], [9.6, 3, 1], [10.15, 1, 2], [10.7, 4, 2], [11.3, 3, 3], [11.9, 1, 4], [12.5, 2, 5], [13.1, 0, 6]].forEach(([t, c, r]) => {
    tl.to("#bFocus", { x: c * 262, y: r * 484, duration: 0.22, ease: "power2.out" }, t);
    if (r !== lastRow && r >= 2) tl.to("#bGrid", { y: -(r - 1) * 484, duration: 0.35, ease: "power3.inOut" }, t);
    lastRow = r;
  });
  const clk = { m: 0 }, clkEl = S("#bClockT");
  tl.fromTo(clk, { m: 0 }, { m: 48, duration: 6.6, ease: "power1.in", onUpdate: () => { const m = Math.round(clk.m); clkEl.textContent = "9:" + String(m).padStart(2, "0"); } }, 7.9);
  inn("#bClock", 7.9, { opacity: 0, y: -20 }, 0.4);
  tl.to("#bClock", { scale: 1.25, duration: 0.5, ease: "power2.out" }, 12.2);
  // "I check my phone for that show a friend mentioned"
  inn("#bPhone", 9.35, { opacity: 0, y: 300, rotation: 8 }, 0.75, "back.out(1.2)");
  tl.fromTo("#bList", { y: 0 }, { y: -560, duration: 3.5, ease: "sine.inOut" }, 10.1);
  // "so I just keep scrolling": the phone takes the frame, the TV falls away
  tl.to("#bPhone", { x: -240, y: -70, scale: 1.14, duration: 0.7, ease: "power3.inOut" }, 13.85);
  tl.to("#bGrid", { filter: "blur(8px)", duration: 0.7 }, 13.85);
  tl.fromTo("#bDim", { opacity: 0 }, { opacity: 0.6, duration: 0.7 }, 13.85);
  tl.to("#bFocus", { opacity: 0, duration: 0.3 }, 13.85);
  tl.fromTo("#bFeed", { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }, 14.3);
  [14.75, 15.1, 15.4, 15.65, 15.85, 16.02, 16.17].forEach((t, i) => tl.to("#bStrip", { y: -792 * (i + 1), duration: i < 3 ? 0.3 : 0.17, ease: "power3.inOut" }, t));
  words("#b1", 7.95);
  out("#b1", 11.8, { opacity: 0, y: -16 }, 0.25);
  words("#b2", 12.05);
  out("#b2", 14.2, { opacity: 0, y: -16 }, 0.25);
  words("#b3", 14.45, 0.05, 0.5);

  // ---- C · Friends: each message brings its show, then it all blurs away
  sceneFade("sC", 16.35, 20.85);
  drift("sC", 16.35, 20.85, 1.04);
  [16.45, 16.83, 17.21, 17.59, 17.97].forEach((t, i) => {
    inn("#ca" + i, t, { opacity: 0, scale: 0.4 }, 0.45, "back.out(2.2)");
    inn("#cm" + i, t + 0.05, { opacity: 0, x: -50, scale: 0.9 }, 0.55, "back.out(1.7)");
    inn("#cp" + i, t + 0.25, { opacity: 0, scale: 0.4, rotation: i % 2 ? 14 : -14, x: -40 }, 0.65, "back.out(1.9)");
  });
  [0, 1, 2, 3, 4].forEach((i) => tl.to(["#cp" + i, "#cm" + i, "#ca" + i], { opacity: 0, filter: "blur(16px)", y: -36, duration: 0.85, ease: "power1.in" }, 19.0 + i * 0.18));

  // ---- D · Reveal, held through "Setup is easy."
  sceneFade("sD", 20.85, 22.95);
  drift("sD", 20.85, 22.95, 1.05);
  words("#d1", 20.9, 0.07, 0.5);
  inn("#dLogo", 21.55, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.6, "back.out(1.8)");
  inn("#d2", 21.8, { opacity: 0, y: 16 }, 0.45);
  words("#d3", 22.05, 0.08);

  // ---- E · Install on the TV, then the code, the number and the connection
  tl.fromTo("#sE", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 22.95);
  tl.to("#sE", { opacity: 0, scale: 0.985, duration: 0.3 }, 37.2);
  // the TV starts large and centered for the install
  tl.fromTo("#eTV", { opacity: 0, x: 248, y: 60, scale: 1.06 }, { opacity: 1, x: 248, y: 0, scale: 1.12, duration: 0.8, ease: "power4.out" }, 22.95);
  inn("#eK1", 23.0, { opacity: 0, y: 14 }, 0.4); words("#eH1", 23.0);
  tl.fromTo("#eBtn", { scale: 1 }, { scale: 0.93, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out" }, 23.55);
  tl.to("#eBtn", { backgroundColor: "#2A3236", color: "#FFF6E8", duration: 0.15 }, 23.7);
  tl.to("#eGet", { opacity: 0, duration: 0.12 }, 23.7);
  tl.fromTo("#eInst", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 23.75);
  tl.fromTo("#eFill", { scaleX: 0 }, { scaleX: 1, duration: 0.65, ease: "power1.inOut" }, 23.72);
  tl.to("#eInst, #eFill", { opacity: 0, duration: 0.12 }, 24.37);
  tl.to("#eBtn", { backgroundColor: "#FFF6E8", color: "#101518", duration: 0.15 }, 24.37);
  tl.fromTo("#eOpen", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 24.4);
  tl.fromTo("#eBtn", { scale: 1 }, { scale: 0.93, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, 24.58);
  tl.to("#eStore", { opacity: 0, duration: 0.3 }, 24.72);
  // the app opens on its pairing screen; the TV makes room for the phone
  tl.to("#eTV", { x: 0, scale: 1, duration: 0.75, ease: "power3.inOut" }, 24.75);
  inn("#ePhone", 24.95, { opacity: 0, y: 160, rotation: 6 }, 0.8, "back.out(1.3)");
  bob("#ePhone", 25.8, 37.2, 10, 1.8);
  out("#eH1", 24.75, { opacity: 0, y: -14 }, 0.22); words("#eH2", 24.95, 0.05);
  spin("#eC-spin", 22.95, 26.9);
  [0, 1, 2, 3, 4].forEach((i) => inn("#eC-d" + i, 24.85 + i * 0.07, { opacity: 0, y: 30, scale: 0.9 }, 0.45, "back.out(1.6)"));
  tl.fromTo("#eCode .digit", { scale: 1 }, { scale: 1.1, duration: 0.16, yoyo: true, repeat: 1, stagger: 0.05, ease: "power2.out", immediateRender: false }, 25.74);
  type("ePhone", "m1", 25.4, 25.95, 26.05);
  // "to the Recco number"
  tl.to("#eC-num", { color: "#F0B667", duration: 0.2 }, 26.3);
  tl.fromTo("#eC-numline", { scale: 1 }, { scale: 1.14, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" }, 26.3);
  tl.to("#ePhone .ph-num", { color: "#F0B667", duration: 0.2 }, 26.3);
  tl.to("#ePhone .ph-num", { color: "#8e8e93", duration: 0.4 }, 27.4);
  fadeSwap("#eCode", "#eConn", 26.6, 0.3);
  inn("#eK-chk", 26.7, { opacity: 0, scale: 0.3, rotation: -40 }, 0.55, "back.out(2.6)");
  // camera punches toward the first inbox slot each time a card lands
  tl.set("#sE-cam", { transformOrigin: "352px 512px" }, 22.95);
  [[29.55, 30.5], [32.75, 33.75], [35.65, 36.95]].forEach(([a, b]) => { tl.to("#sE-cam", { scale: 1.06, duration: 0.55, ease: "power3.out" }, a); tl.to("#sE-cam", { scale: 1, duration: 0.6, ease: "power2.inOut" }, b); });
  // F · text it anything
  out("#eK1", 26.95, { opacity: 0, y: -10 }, 0.25); inn("#eK2", 27.1, { opacity: 0, y: 14 }, 0.4);
  out("#eH2", 26.95, { opacity: 0, y: -14 }, 0.25); words("#eH3", 27.1);
  fadeSwap("#eConn", "#eInF", 27.3, 0.4);
  tl.set("#fPend", { opacity: 0 }, 26.9);
  type("ePhone", "m2", 27.4, 28.1, 28.2);
  inn("#fPend", 28.45, { opacity: 0, scale: 0.9 }, 0.35, "back.out(1.6)");
  spin("#fPend-spin", 28.45, 29.6);
  resolveCard("#fPend", "#fCard", 29.55);
  // G · Jill
  out("#eK2", 30.6, { opacity: 0, y: -10 }, 0.25); inn("#eK3", 30.8, { opacity: 0, y: 14 }, 0.4);
  out("#eH3", 30.6, { opacity: 0, y: -14 }, 0.25); words("#eH4", 30.8);
  type("ePhone", "m3", 30.75, 31.55, 31.7);
  tl.to("#eInF", { opacity: 0, duration: 0.18 }, 31.75); tl.fromTo("#eInG", { opacity: 0 }, { opacity: 1, duration: 0.22 }, 31.93);
  tl.set("#gPend", { opacity: 0 }, 30.6);
  inn("#gPend", 32.0, { opacity: 0, scale: 0.9 }, 0.3, "back.out(1.6)");
  spin("#gPend-spin", 31.95, 32.9);
  resolveCard("#gPend", "#gCard", 32.75);
  // H · Steph
  out("#eK3", 34.0, { opacity: 0, y: -10 }, 0.25); inn("#eK4", 34.2, { opacity: 0, y: 14 }, 0.4);
  out("#eH4", 34.0, { opacity: 0, y: -14 }, 0.25); words("#eH5", 34.2, 0.07);
  type("ePhone", "m4", 34.15, 34.6, 34.75);
  type("ePhone", "m5", 34.95, 35.25, 35.35);
  tl.to("#eInG", { opacity: 0, duration: 0.18 }, 34.85); tl.fromTo("#eInH", { opacity: 0 }, { opacity: 1, duration: 0.22 }, 35.03);
  tl.set("#hPend", { opacity: 0 }, 34.0);
  inn("#hPend", 35.1, { opacity: 0, scale: 0.9 }, 0.3, "back.out(1.6)");
  spin("#hPend-spin", 35.05, 35.8);
  resolveCard("#hPend", "#hCard", 35.65);
  tl.to("#hCard .fa", { rotation: -2, x: -30, duration: 0.5, ease: "back.out(2)" }, 36.25);
  tl.to("#hCard .fb", { rotation: -7, x: -60, duration: 0.5, ease: "back.out(2)" }, 36.25);
  tl.to("#hCard .fc", { rotation: 6, x: 30, duration: 0.5, ease: "back.out(2)" }, 36.25);
  tl.fromTo("#hCard .stackchip", { scale: 1 }, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 36.5);

''')

# ------------------------------------------------------------ fonts: the app's sans everywhere
rep('''@font-face { font-family: "Fraunces"; src: url(assets/fonts/Fraunces-normal.woff2) format("woff2"); font-weight: 100 900; font-style: normal; }
@font-face { font-family: "Fraunces"; src: url(assets/fonts/Fraunces-italic.woff2) format("woff2"); font-weight: 100 900; font-style: italic; }
''', '')
for old, new in [
    ('.line { font-family: "Fraunces", serif; font-weight: 600; font-size: 92px; line-height: 1.08; letter-spacing: -.02em;', '.line { font-family: "Inter", sans-serif; font-weight: 700; font-size: 88px; line-height: 1.08; letter-spacing: -.035em;'),
    ('.line.accent { color: #F0B667; font-style: italic; font-weight: 500; }', '.line.accent { color: #F0B667; }'),
    ('.ilab { font-family: "Fraunces", serif; font-size: 46px; font-weight: 600;', '.ilab { font-family: "Inter", sans-serif; font-size: 40px; font-weight: 600;'),
    ('font-family: "Fraunces", serif; font-size: 92px; font-weight: 500; font-style: italic; color: #F0B667; text-shadow', 'font-family: "Inter", sans-serif; font-size: 84px; font-weight: 700; letter-spacing: -.035em; color: #F0B667; text-shadow'),
    ('.soNow { font-family: "Fraunces", serif; font-size: 64px; font-style: italic; color: #FFF7E8; }', '.soNow { font-family: "Inter", sans-serif; font-size: 54px; font-weight: 500; letter-spacing: -.02em; color: #FFF7E8; }'),
    ('font-family: "Fraunces", serif; font-size: 72px; font-weight: 600; letter-spacing: -.02em; line-height: 1.05; white-space: nowrap; opacity: 0; }', 'font-family: "Inter", sans-serif; font-size: 62px; font-weight: 700; letter-spacing: -.03em; line-height: 1.08; white-space: nowrap; opacity: 0; }'),
    ('.chapt { font-family: "Fraunces", serif; font-size: 120px; font-weight: 600; letter-spacing: -.02em; }', '.chapt { font-family: "Inter", sans-serif; font-size: 112px; font-weight: 700; letter-spacing: -.04em; }'),
    ('.mline { font-family: "Fraunces", serif; font-style: italic; font-size: 54px; color: #C4CAC0; }', '.mline { font-family: "Inter", sans-serif; font-size: 46px; font-weight: 500; letter-spacing: -.02em; color: #C4CAC0; }'),
    ('.qp.ghost span { font-family: "Fraunces", serif; font-size: 160px;', '.qp.ghost span { font-family: "Inter", sans-serif; font-weight: 300; font-size: 160px;'),
    ('font-family: "Fraunces", serif; font-size: 52px; font-weight: 500; font-style: italic; color: #F0B667; }', 'font-family: "Inter", sans-serif; font-size: 46px; font-weight: 600; letter-spacing: -.02em; color: #F0B667; }'),
    ('.tagrow { font-family: "Fraunces", serif; font-size: 72px; font-weight: 600; letter-spacing: -.02em; }', '.tagrow { font-family: "Inter", sans-serif; font-size: 68px; font-weight: 700; letter-spacing: -.035em; }'),
    ('.tagready { font-family: "Fraunces", serif; font-size: 64px; font-style: italic; font-weight: 500; color: #F0B667; }', '.tagready { font-family: "Inter", sans-serif; font-size: 54px; font-weight: 600; letter-spacing: -.025em; color: #F0B667; }'),
    ('.bcap .line { position: absolute; left: 0; bottom: 0; font-size: 84px; opacity: 0; }', '.bcap .line { position: absolute; left: 0; bottom: 0; font-size: 74px; opacity: 0; }\n#b3 { max-width: 820px; }'),
]:
    rep(old, new)

# ------------------------------------------------------------ CSS: phone views, feed, centered chat, install screen
rep('''.mlist-h { font-size: 38px;''', '''.bphone .ph-status { position: relative; z-index: 3; background: #000; }
.mview { position: absolute; left: 0; right: 0; top: 52px; bottom: 0; overflow: hidden; }
.mscroll { position: absolute; left: 0; right: 0; top: 0; }
.bdim { position: absolute; inset: 0; background: #0a0c0d; opacity: 0; }
.feed { position: absolute; inset: 0; z-index: 2; background: #000; overflow: hidden; opacity: 0; }
.fstrip { position: absolute; left: 0; top: 0; width: 100%; }
.fpost { position: relative; width: 100%; height: 792px; background-size: cover; background-position: center; }
.fgrad { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75) 100%); }
.fact { position: absolute; right: 14px; bottom: 170px; display: flex; flex-direction: column; gap: 22px; align-items: center; font-size: 15px; font-weight: 600; color: #fff; text-align: center; }
.fact > div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.fic { font-size: 34px; line-height: 1; display: block; }
.fmeta { position: absolute; left: 18px; right: 80px; bottom: 44px; color: #fff; }
.fwho { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; }
.fav { width: 34px; height: 34px; border-radius: 50%; background: #E28A3B; color: #1D1410; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.fcap { font-size: 19px; line-height: 1.3; margin-top: 8px; }
.ftabs { position: absolute; left: 0; right: 0; top: 64px; display: flex; justify-content: center; gap: 22px; font-size: 19px; color: rgba(255,255,255,.7); font-weight: 600; }
.ftabs b { color: #fff; border-bottom: 3px solid #fff; padding-bottom: 4px; }
.chat { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.crow { width: 980px; display: flex; align-items: center; gap: 18px; }
.cmsg { flex: none; max-width: 660px; }
.cposter { width: 100px; height: 150px; border-radius: 12px; flex: none; margin-left: 10px; background-size: cover; background-position: center; box-shadow: 0 18px 40px rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,.14); }
.revease { font-size: 50px; font-weight: 700; letter-spacing: -.03em; color: #F0B667; margin-top: 6px; }
.numline { display: inline-block; }
.store { position: absolute; inset: 0; background: #101518; color: #FFF6E8; padding: 90px 120px; display: flex; flex-direction: column; gap: 64px; }
.st-crumb { font-size: 30px; font-weight: 600; color: rgba(255,246,232,.6); letter-spacing: .02em; }
.st-main { display: flex; gap: 72px; align-items: center; }
.st-icon { width: 420px; height: 420px; border-radius: 56px; box-shadow: 0 30px 80px rgba(0,0,0,.55); }
.st-info { display: flex; flex-direction: column; gap: 16px; }
.st-name { font-size: 112px; font-weight: 700; letter-spacing: -.04em; line-height: 1; }
.st-tag { font-size: 40px; color: rgba(255,246,232,.85); }
.st-meta { font-size: 28px; color: rgba(255,246,232,.55); }
.st-btn { position: relative; margin-top: 26px; width: 380px; height: 96px; border-radius: 18px; background: #FFF6E8; color: #101518; overflow: hidden; outline: 5px solid #F0B667; outline-offset: 5px; }
.st-fill { position: absolute; inset: 0; background: #F0B667; transform-origin: 0 50%; opacity: .9; }
.st-l { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 700; }
#eInst, #eOpen { opacity: 0; }
#eInst { color: #101518; }
.st-shots { display: flex; gap: 32px; }
.st-shots div { width: 480px; height: 270px; border-radius: 16px; background-size: cover; background-position: center; opacity: .85; }
.mlist-h { font-size: 38px;''')
rep('''.fbt { font-size: 32px; line-height: 1.25; color: #FFF7E8; padding: 18px 24px; border-radius: 26px 26px 26px 6px; background: rgba(41,54,45,.88); border: 1px solid rgba(255,247,232,.22); max-width: 560px; }''',
    '''.fbt { font-size: 32px; line-height: 1.25; color: #FFF7E8; padding: 18px 24px; border-radius: 26px 26px 26px 6px; background: rgba(41,54,45,.9); border: 1px solid rgba(255,247,232,.22); max-width: 660px; }''')

open(P, "w").write(s)
print("patched")
