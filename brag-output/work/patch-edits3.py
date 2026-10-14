# Round 3: static winter-night room everywhere but the end, calmer/cleaner friends scene, made-up link domains,
# and the pipeline: no SQS bars, a working agent, outputs and title checks under the agent.
import sys, re
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

# ---------------------------------------------------------------- static backgrounds
rep('''  videos.push(`<div class="vwrap" ${wrapId ? `id="${wrapId}"` : ""}>${parts.join("")}</div>`);
  return parts[0].match(/id="([^"]+)"/)[1];
};''', '''  videos.push(`<div class="vwrap" ${wrapId ? `id="${wrapId}"` : ""}>${parts.join("")}</div>`);
  return parts[0].match(/id="([^"]+)"/)[1];
};
// a still room behind a scene (everything but the seasons montage is static)
const bgStill = (theme, start, dur, wrapId = "") => {
  vcount++;
  const id = `s${vcount}-${theme}`;
  videos.push(`<div class="vwrap" ${wrapId ? `id="${wrapId}"` : ""}><div class="clip bgs" id="${id}" style="background-image:url(assets/bg/${theme}.jpg)" data-start="${+T(start).toFixed(3)}" data-duration="${+(T(start + dur) - T(start)).toFixed(3)}" data-track-index="0"></div></div>`);
  return id;
};''')
rep('bgVideo("fallNight", 0, 6.1, 0, "vwA");', 'bgStill("winterNight", 0, 6.1, "vwA");')
rep('bgVideo("fallNight", 20.3, 3.9, 0, "vwD");', 'bgStill("winterNight", 20.3, 3.9, "vwD");')
rep('bgVideo("fallNight", 37.8, 11.15, 0, "vwI");', 'bgStill("winterNight", 37.8, 11.15, "vwI");')
rep('scene("sC", 16.35, 20.85, `<div class="still blurbg" id="cBg" style="background-image:url(assets/bg/fallNight.jpg)">',
    'scene("sC", 16.35, 20.85, `<div class="still blurbg" id="cBg" style="background-image:url(assets/bg/winterNight.jpg)">')
rep('''const tvStackE = `<div class="still" id="eStill" style="background-image:url(assets/bg/fallNight.jpg)"></div>
  ${screen({ theme: "fallNight", id: "eCode", still: false, hdr: false, body: codeBody("eC") })}
  ${screen({ theme: "fallNight", id: "eIn",''', '''const tvStackE = `<div class="still" id="eStill" style="background-image:url(assets/bg/winterNight.jpg)"></div>
  ${screen({ theme: "winterNight", id: "eCode", still: false, hdr: false, body: codeBody("eC") })}
  ${screen({ theme: "winterNight", id: "eIn",''')
rep('${screen({ theme: "fallNight", id: "iScr", still: false,', '${screen({ theme: "winterNight", id: "iScr", still: false,')
rep('''const tvStackO = `<div class="still" style="background-image:url(assets/bg/fallNight.jpg)"></div>
  ${screen({ theme: "fallNight", id: "oCode",''', '''const tvStackO = `<div class="still" style="background-image:url(assets/bg/winterNight.jpg)"></div>
  ${screen({ theme: "winterNight", id: "oCode",''')
rep('${screen({ theme: "fallNight", id: "oIn",', '${screen({ theme: "winterNight", id: "oIn",')
rep('.stage { position: absolute; inset: 0; background: #141c1c url(assets/bg/stage-night.jpg) center / cover; }', '.stage { position: absolute; inset: 0; background: #0d1626 url(assets/bg/stage-winter.jpg) center / cover; }')
rep('.stagev { position: absolute; inset: 0; background: url(assets/bg/vignette-fallNight.png) 0 0 / 100% 100%; }', '.stagev { position: absolute; inset: 0; background: url(assets/bg/vignette-winterNight.png) 0 0 / 100% 100%; }')
rep('.bgv { position: absolute;', '.bgs { position: absolute; inset: 0; background-size: cover; background-position: center; }\n.bgv { position: absolute;')
# the montage picks up from the winter-night inbox (a still), then the season videos as before
rep('const seasonOrder = ["fallNight", "fallDay", "winterDay", "summerDay", "summerNight", "winterNight"];', 'const seasonOrder = ["winterNight", "fallDay", "winterDay", "summerDay", "summerNight", "winterNight"];')
rep('const seasonVidIds = vS.map(([t, s, d]) => bgVideo(t, s, d, 0));', 'const seasonVidIds = vS.map(([t, s, d], i) => (i === 0 ? bgStill(t, s, d) : bgVideo(t, s, d, 0)));')

# ---------------------------------------------------------------- made-up link domains
rep('<div class="lu">tiktok.com</div>', '<div class="lu">filmtok.cx</div>')
rep('typeText: "tiktok.com/@steph/video/74…"', 'typeText: "filmtok.cx/@steph/v/74…"')
rep('type: "TikTok", count: "3 shows"', 'type: "FilmTok", count: "3 shows"')
rep('poster: "second-summer", from: "YouTube",', 'poster: "second-summer", from: "Sam",')
rep('<div class="sms obub" id="oIn1">${ic.link(24)} youtu.be/best-films-2023</div>', '<div class="sms obub" id="oIn1">${ic.link(24)} reelhub.cx/best-films</div>')

# ---------------------------------------------------------------- C · friends: a centred stack, posters in one column
rep('''  ["Steph", "Sent a video: 3 comfort shows", "room-104"],''', '''  ["Steph", "Sent a video: 3 comfort shows", ["room-104", "couch-time", "third-floor-mystery"]],''')
rep('''<div class="cposter" id="cp${i}" style="background-image:url(${P(p)})"></div></div>`).join("")}</div></div>`);''',
    '''<div class="cslot" id="cp${i}">${(Array.isArray(p) ? p : [p]).map((q, j, all) => `<div class="cposter" style="background-image:url(${P(q)});${all.length > 1 ? `left:${j * 34}px;transform:rotate(${(j - 1) * 7}deg);z-index:${3 - Math.abs(j - 1)}` : ""}"></div>`).join("")}</div></div>`).join("")}</div></div>`);''')
rep('.chatcol { position: absolute; left: 50%; top: 0; bottom: 0; width: 980px; margin-left: -490px; }', '.chatcol { position: absolute; left: 50%; top: 0; bottom: 0; width: 1040px; margin-left: -520px; }')
rep('.crow { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 16px; opacity: 0; }', '.crow { position: absolute; left: 0; top: 0; width: 1040px; height: 132px; display: flex; align-items: center; gap: 18px; opacity: 0; }')
rep('.cmsg { flex: none; max-width: 660px; }', '.cmsg { flex: 1; min-width: 0; }\n.cslot { position: relative; width: 158px; height: 132px; flex: none; }')
rep('.cposter { width: 70px; height: 105px; border-radius: 12px; flex: none; margin-left: 10px; background-size: cover; background-position: center; box-shadow: 0 18px 40px rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,.14); }',
    '.cposter { position: absolute; left: 36px; top: 0; width: 88px; height: 132px; border-radius: 12px; background-size: cover; background-position: center; box-shadow: 0 18px 40px rgba(0,0,0,.55); border: 1px solid rgba(255,255,255,.16); }')
rep('''  const ROW = 118, MID = 488;
  [16.45, 16.83, 17.21, 17.59, 17.97].forEach((t, k) => {
    tl.fromTo("#cr" + k, { opacity: 0, y: MID + 60, scale: 0.97 }, { opacity: 1, y: MID, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, t);
    for (let i = 0; i < k; i++) tl.to("#cr" + i, { y: MID - (k - i) * ROW, duration: 0.55, ease: "power2.inOut" }, t);
    inn("#cp" + k, t + 0.15, { opacity: 0, scale: 0.85, rotation: k % 2 ? 3 : -3 }, 0.5, "power3.out");''',
'''  // the stack stays centred as it grows: each new message slides in at the bottom and the rest ease up
  const ROW = 152, RH = 132, rowY = (i, n) => 540 - ((n - 1) * ROW + RH) / 2 + i * ROW;
  [16.45, 16.83, 17.21, 17.59, 17.97].forEach((t, k) => {
    tl.fromTo("#cr" + k, { opacity: 0, y: rowY(k, k + 1) + 50 }, { opacity: 1, y: rowY(k, k + 1), duration: 0.6, ease: "power3.out", immediateRender: false }, t);
    for (let i = 0; i < k; i++) tl.to("#cr" + i, { y: rowY(i, k + 1), duration: 0.6, ease: "power2.inOut" }, t);
    inn("#cp" + k, t + 0.18, { opacity: 0, x: 24, scale: 0.94 }, 0.5, "power3.out");''')

# ---------------------------------------------------------------- pipeline
# SQS: no bars
rep('''${n.k === "sqs" ? `<div class="qbars" id="${p}-q">${[0, 1, 2].map((i) => `<i id="${p}-q${i}"></i>`).join("")}</div>` : ""}''',
    '''${n.k === "agent" ? `<div class="aring" id="${p}-aring"></div><div class="awork">${["Reading the text…", "Finding the shows…", "Checking each title…"].map((w, i) => `<span id="${p}-aw${i}">${w}</span>`).join("")}</div>` : ""}''')
rep('''  [0, 1, 2].forEach((i) => inn("#o-q" + i, V(16.2) + i * 0.15, { opacity: 0, x: -16 }, 0.3));
  tl.fromTo("#o-sqs .qbars i", { scaleX: 1 }, { scaleX: 0.55, duration: 0.226, yoyo: true, repeat: 9, stagger: 0.113, ease: "sine.inOut", immediateRender: false }, V(17.1));
''', '')
rep('tl.set(".node, #oLive, .obub, .obot, .qrow.small .qcard, .pchip, #o-lcheck, #o-q0, #o-q1, #o-q2", { opacity: 0 }, O0);',
    'tl.set(".node, #oLive, .obub, .obot, .qrow.small .qcard, .pchip, #o-lcheck, #o-aring, .awork span", { opacity: 0 }, O0);')
# outputs and the title check sit under the agent
rep('''  <div class="ochip obot" id="oOut0" style="top:520px"><div class="oic">${ic.user(24)}</div><div><div class="ok">Friend</div><div class="ov">Steph</div></div></div>
  <div class="ochip obot" id="oOut1" style="top:614px"><div class="oic">${ic.film(24)}</div><div><div class="ok">Titles</div><div class="ov">3 films</div></div></div>
  <div class="ochip obot" id="oOut2" style="top:708px"><div class="oic">${ic.link(24)}</div><div><div class="ok">Links</div><div class="ov">youtu.be/best-…</div></div></div>''',
'''  <div class="ochip obot" id="oOut0" style="left:610px"><div class="oic">${ic.user(24)}</div><div><div class="ok">Friend</div><div class="ov">Steph</div></div></div>
  <div class="ochip obot" id="oOut1" style="left:850px"><div class="oic">${ic.film(24)}</div><div><div class="ok">Titles</div><div class="ov">3 films</div></div></div>
  <div class="ochip obot" id="oOut2" style="left:1090px"><div class="oic">${ic.link(24)}</div><div><div class="ok">Links</div><div class="ov">reelhub.cx</div></div></div>''')
rep('.obot { position: absolute; left: 1150px; width: 280px; padding: 14px 18px; gap: 14px; border-radius: 20px; opacity: 0; }',
    '.obot { position: absolute; top: 760px; width: 220px; padding: 14px 18px; gap: 14px; border-radius: 20px; opacity: 0; }')
rep('.qrow.small { left: 1150px; right: auto; top: 400px; width: 280px; flex-wrap: wrap; gap: 18px 22px; justify-content: flex-start; }',
    '.qrow.small { left: 610px; right: auto; top: 734px; width: 700px; gap: 22px; justify-content: center; }')
rep('''  [["#oOut0", V(27.23), 520], ["#oOut1", V(27.78), 614], ["#oOut2", V(28.49), 708]].forEach(([id, t, top]) => {
    inn(id, t, { opacity: 0, x: -120, y: ${NCY(3)} - top - 40, scale: 0.6 }, 0.6, "power3.out");''',
'''  [["#oOut0", V(27.23), 610], ["#oOut1", V(27.78), 850], ["#oOut2", V(28.49), 1090]].forEach(([id, t, left]) => {
    inn(id, t, { opacity: 0, x: ${NCX} - left - 110, y: -70, scale: 0.6 }, 0.6, "power3.out");''')
rep('tl.to(".obot", { opacity: 0, x: 20, duration: 0.3 }, V(31.0));', 'tl.to(".obot", { opacity: 0, y: 16, duration: 0.3 }, V(31.0));')
rep('''[0, 1, 2, 3].forEach((i) => inn("#q" + i, V(31.3) + i * 0.12, { opacity: 0, y: 30, scale: 0.94 }, 0.5, "power3.out"));''',
    '''[0, 1, 2, 3].forEach((i) => inn("#q" + i, V(31.3) + i * 0.12, { opacity: 0, y: -40, scale: 0.9 }, 0.5, "power3.out"));''')
# the agent at work: it grows, a ring spins round its icon and its status line cycles, from the first input to the last output
rep('''  tl.fromTo("#o-agent .nic", { scale: 1 }, { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, V(26.4));
''', '''  const AW0 = V(22.6), AW1 = V(30.6);
  tl.to("#o-agent", { scale: 1.1, duration: 0.5, ease: "power2.out" }, AW0);
  tl.to("#o-agent", { scale: 1, duration: 0.5, ease: "power2.inOut" }, AW1);
  tl.to("#o-aring", { opacity: 1, duration: 0.3 }, AW0);
  tl.to("#o-aring", { opacity: 0, duration: 0.3 }, AW1);
  spin("#o-aring", AW0, AW1 + 0.3);
  tl.fromTo("#o-agent .nic", { scale: 1 }, { scale: 1.12, duration: 0.45, yoyo: true, repeat: 2 * Math.floor((T(AW1) - T(AW0)) / 0.9) - 1, ease: "sine.inOut", immediateRender: false }, AW0);
  tl.to("#o-agent .ns", { opacity: 0, duration: 0.2 }, AW0);
  [[V(22.6), V(25.0)], [V(25.0), V(28.0)], [V(28.0), V(30.6)]].forEach(([a, b], i) => { tl.fromTo("#o-aw" + i, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, immediateRender: false }, a + 0.05); tl.to("#o-aw" + i, { opacity: 0, y: -8, duration: 0.2 }, b - 0.2); });
  tl.to("#o-agent .ns", { opacity: 1, duration: 0.25 }, AW1);
''')
rep('.nbadge {', '''.aring { position: absolute; left: 14px; top: 50%; width: 72px; height: 72px; margin-top: -36px; border-radius: 50%; border: 3px solid rgba(240,182,103,.18); border-top-color: #F0B667; border-right-color: #F0B667; opacity: 0; }
.awork { position: absolute; left: 94px; bottom: 15px; height: 22px; font-size: 18px; color: #F0B667; white-space: nowrap; }
.awork span { position: absolute; left: 0; top: 0; opacity: 0; }
.nbadge {''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
