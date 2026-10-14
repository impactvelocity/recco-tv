# Round 2 timeline for scene O (see patch-pipeline.py for the markup).
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
start = "  // ---- O · How it's built: one map, filled in as the voice names each piece\n"
end_marker = '  tl.to("#oTV .tvglass", { borderRadius: 0, duration: 0.9 }, V(41.0));\n'
a = s.index(start); b = s.index(end_marker, a) + len(end_marker)
new = r'''  // ---- O · How it's built
  const V = (x) => ${VO2_AT} + x;
  const O0 = 48.95, FULLO = { x: 248, y: -74, scale: 1.6271 };
  // phone on the left and the TV app on the right, both centred on y 600; the steps run top-down between them
  const TVMID = { x: 948, y: -14, scale: 0.34 }, PHMID = { x: -58, y: -3, scale: 0.62 };
  tl.fromTo("#sO", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, O0);
  const edgeIn = (id, t, d = 0.45) => tl.fromTo(id, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" }, t);
  const flowOn = (i, t, until) => { tl.fromTo("#o-f" + i, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, t); tl.fromTo("#o-f" + i, { strokeDashoffset: 0 }, { strokeDashoffset: -48 * Math.round((T(until) - T(t)) * 2.2), duration: T(until) - T(t), ease: "none" }, t); };
  const OP = ${JSON.stringify(Object.fromEntries(Object.entries(OPTS).map(([k, [x, y]]) => [k, [x - 9, y - 9]])))};
  const pk = (id, keys, t, hop = 0.32) => { tl.set(id, { opacity: 1 }, t); keys.forEach((k, i) => { const [x, y] = OP[k]; if (i === 0) tl.set(id, { x, y }, t); else tl.to(id, { x, y, duration: T(t + i * hop) - T(t + (i - 1) * hop), ease: "none" }, t + (i - 1) * hop); }); tl.to(id, { opacity: 0, duration: 0.15 }, t + (keys.length - 1) * hop); };
  const cap = (outH, inH, t) => { if (outH) out(outH, t, { opacity: 0, y: -14 }, 0.25); words(inH, t + 0.15, 0.05); };
  // a step settles in under the one before it, and takes the highlight
  const RING_ON = "0 0 0 3px rgba(226,138,59,.95), 0 24px 60px rgba(0,0,0,.4)", RING_OFF = "0 0 0 0px rgba(226,138,59,0), 0 24px 60px rgba(0,0,0,.4)";
  let lit = null;
  const nodeIn = (id, t) => {
    tl.fromTo(id, { opacity: 0, y: -18, scale: 0.96, boxShadow: RING_OFF }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, t);
    tl.fromTo(id + " .nic", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", immediateRender: false }, t + 0.12);
    light(id, t + 0.2);
  };
  const light = (id, t) => { if (lit) tl.to(lit, { boxShadow: RING_OFF, duration: 0.35 }, t); if (id) tl.to(id, { boxShadow: RING_ON, duration: 0.35 }, t); lit = id; };
  // everything the map will show starts hidden
  tl.set("#o-e0, #o-e1, #o-e2, #o-e3, #o-e4, #o-e5, #o-e6", { strokeDashoffset: 1 }, O0);
  tl.set(".node, #oLive, .obub, .obot, .qrow.small .qcard, .pchip, #o-lcheck, #o-q0, #o-q1, #o-q2", { opacity: 0 }, O0);
  tl.set("#qb0, #qb1, #qb2, #qx", { opacity: 0 }, O0);

  // A · built for the hackathon: the big TV shows the TV app's own code, which builds and launches
  tl.set("#oTV", { x: 248, y: 0, scale: 1.12 }, O0);
  tl.fromTo("#oTV", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", immediateRender: false }, O0);
  tl.set("#oIn, #oCode", { opacity: 0 }, O0);
  tl.set("#oC-d0, #oC-d1, #oC-d2, #oC-d3, #oC-d4", { opacity: 0 }, O0);
  ${JSON.stringify(CODE.map((l) => l.length > 0))}.forEach((has, i) => { if (has) tl.fromTo("#oL" + i, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.14, ease: "none" }, O0 + 0.35 + i * 0.105); else tl.set("#oL" + i, { clipPath: "inset(0 0% 0 0)" }, O0 + 0.35 + i * 0.105); });
  cap(null, "#oH0", O0 + 0.05);
  inn("#oSticker", V(0.9), { opacity: 0, scale: 0.6, rotation: -20 }, 0.55, "back.out(1.7)");
  tl.set("#oSticker", { rotation: -7 }, V(0.9) + 0.56);
  // "React Native for Vega": the imports light up
  cap("#oH0", "#oH1", V(2.75));
  tl.fromTo("#oL1, #oL2", { backgroundColor: "rgba(240,182,103,0)" }, { backgroundColor: "rgba(240,182,103,.2)", duration: 0.35, stagger: 0.15 }, V(3.4));
  inn("#oChip", V(4.07), { opacity: 0, y: 20, scale: 0.9 }, 0.45, "back.out(1.7)");
  // build, then launch
  tl.to("#oT0", { opacity: 1, duration: 0.15 }, V(4.3));
  tl.to("#oT1", { opacity: 1, duration: 0.15 }, V(4.75));
  tl.to("#oT2", { opacity: 1, duration: 0.15 }, V(5.05));
  cap("#oH1", "#oH2", V(5.2));
  tl.to("#oEd", { opacity: 0, scale: 1.05, duration: 0.4, ease: "power2.in" }, V(5.45));
  tl.fromTo("#oCode", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, V(5.6));
  spin("#oC-spin", V(5.6), V(10.4));
  [0, 1, 2, 3, 4].forEach((i) => tl.fromTo("#oC-d" + i, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)", immediateRender: false }, V(6.67) + i * 0.1));
  // the TV slides right, the phone texts the code from the left, a line links them, the inbox opens
  tl.to("#oTV", { x: 486, scale: 1, duration: 0.7, ease: "power3.inOut" }, V(7.2));
  tl.to("#oChip, #oSticker", { opacity: 0, y: -10, duration: 0.3 }, V(7.2));
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

  // B · phone left, TV app right; the steps come in top-down between them
  cap("#oH3", "#oH4", V(10.7));
  tl.to("#oTV", { ...TVMID, duration: 0.9, ease: "power3.inOut" }, V(10.7));
  tl.to("#oPhone", { ...PHMID, duration: 0.9, ease: "power3.inOut" }, V(10.7));
  tl.set("#oX-dune, #oX-lasso, #oCards .av + .av", { opacity: 0 }, V(10.95));
  tl.set("#oX-dune, #oX-lasso, #oX-shrink, #oCards .av + .av", { opacity: 1 }, V(40.95));
  edgeIn("#o-e0", V(11.3), 0.6); nodeIn("#o-zernio", V(11.6));
  cap("#oH4", "#oH5", V(12.4));
  edgeIn("#o-e1", V(12.95), 0.3); nodeIn("#o-lambda", V(13.15));
  inn("#o-lcheck", V(13.7), { opacity: 0, scale: 0.5 }, 0.35, "back.out(1.6)");
  edgeIn("#o-e2", V(15.6), 0.3); nodeIn("#o-sqs", V(15.8));
  [0, 1, 2].forEach((i) => inn("#o-q" + i, V(16.2) + i * 0.15, { opacity: 0, x: -16 }, 0.3));
  tl.fromTo("#o-sqs .qbars i", { scaleX: 1 }, { scaleX: 0.55, duration: 0.226, yoyo: true, repeat: 9, stagger: 0.113, ease: "sine.inOut", immediateRender: false }, V(17.1));
  const row1 = ["phone", "e0a", "e0b", "zernio", "lambda", "sqs"];
  [V(12.0), V(14.2), V(15.3), V(16.5), V(17.6), V(18.7)].forEach((t, i) => pk("#o-pk" + i, row1, t));
  flowOn(0, V(13.9), V(41.0)); flowOn(1, V(14.0), V(41.0)); flowOn(2, V(16.4), V(41.0));
  // "updates in real time": a card lands on the TV app
  cap("#oH5", "#oH6", V(17.5));
  light(null, V(17.5));
  oorder.unshift("pNew");
  oorder.forEach((id, i) => { if (i > 0) tl.to(OX(id), { x: osx(i), y: osy(i), duration: 0.5, ease: "power3.inOut" }, V(17.9)); });
  tl.fromTo(OX("pNew"), { opacity: 0, y: -90, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, V(17.9));
  spin("#oX-pNew-spin", V(17.9), V(19.0));
  inn("#oLive", V(18.3), { opacity: 0, scale: 0.6 }, 0.35, "back.out(1.6)");
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.8, repeat: 1, ease: "power1.out" }, V(18.4));
  tl.set("#oX-shrink", { opacity: 0 }, V(18.5));
  oorder[0] = "stack";
  tl.set(OX("stack"), { x: 0, y: 0, zIndex: 6 }, V(18.75));
  tl.to(OX("pNew"), { opacity: 0, duration: 0.25 }, V(18.75));
  tl.fromTo(OX("stack"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, V(18.75));
  // C · the agent, under the queue
  cap("#oH6", "#oH7", V(19.35));
  edgeIn("#o-e3", V(19.7), 0.3); nodeIn("#o-agent", V(19.9));
  cap("#oH7", "#oH8", V(22.1));
  // a name, a link, a search: they leave the phone and drop into the agent
  [["#oIn0", V(22.63), 650], ["#oIn1", V(23.43), 726], ["#oIn2", V(23.97), 802]].forEach(([id, t, top]) => {
    inn(id, t, { opacity: 0, x: -30 }, 0.4, "power3.out");
    tl.to(id, { x: NCX - 410 - 150, y: NCY(3) - top - 26, scale: 0.2, opacity: 0, duration: 0.6, ease: "power2.in" }, t + 0.55);
  });
  tl.fromTo("#o-agent .nic", { scale: 1 }, { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, V(26.4));
  cap("#oH8", "#oH9", V(26.45));
  // the friend, the titles, the links come out of it to the right
  [["#oOut0", V(27.23), 520], ["#oOut1", V(27.78), 614], ["#oOut2", V(28.49), 708]].forEach(([id, t, top]) => {
    inn(id, t, { opacity: 0, x: -120, y: NCY(3) - top - 40, scale: 0.6 }, 0.6, "power3.out");
    tl.fromTo(id + " .oic", { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.25);
  });
  ${JSON.stringify(NCY(3))};
  // D · checked in OMDb, right beside the agent
  cap("#oH9", "#oH10", V(31.05));
  tl.to(".obot", { opacity: 0, x: 20, duration: 0.3 }, V(31.0));
  [0, 1, 2, 3].forEach((i) => inn("#q" + i, V(31.3) + i * 0.12, { opacity: 0, y: 30, scale: 0.94 }, 0.5, "power3.out"));
  [0, 1, 2].forEach((i) => { const t = V(32.2) + i * 0.25; inn("#qb" + i, t, { opacity: 0, scale: 0.6 }, 0.35, "back.out(1.6)"); tl.fromTo("#q" + i + " .qp", { scale: 1 }, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, t); });
  inn("#qx", V(33.7), { opacity: 0, scale: 0.7 }, 0.35, "back.out(1.6)");
  tl.fromTo("#q3 .qp", { x: 0 }, { x: -8, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut" }, V(33.75));
  tl.to("#q3", { opacity: 0.45, duration: 0.4 }, V(34.2));
  // E · saved, then pushed out to the TV app on the right
  cap("#oH10", "#oH11", V(34.85));
  tl.to(".qrow.small .qcard", { opacity: 0, y: 16, duration: 0.3 }, V(34.8));
  edgeIn("#o-e4", V(34.9), 0.3); nodeIn("#o-ddb", V(35.05));
  cap("#oH11", "#oH12", V(36.3));
  edgeIn("#o-e5", V(36.3), 0.3); nodeIn("#o-appsync", V(36.45));
  edgeIn("#o-e6", V(37.0), 0.6);
  const row2 = ["sqs", "agent", "ddb", "appsync", "e6a", "e6b", "tv"];
  [V(36.95), V(37.9), V(38.85)].forEach((t, i) => pk("#o-pk" + (5 + i), row2, t));
  flowOn(3, V(37.2), V(41.0)); flowOn(4, V(37.3), V(41.0)); flowOn(5, V(37.4), V(41.0)); flowOn(6, V(37.6), V(41.0));
  tl.fromTo("#oLive span", { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.7, repeat: 1, ease: "power1.out", immediateRender: false }, V(38.9));
  // F · private by design: the map steps back, the two promises come forward
  cap("#oH12", "#oH13", V(38.85));
  light(null, V(38.85));
  tl.to("#oScrim", { opacity: 1, duration: 0.5, ease: "power2.out" }, V(38.85));
  inn("#rP0", V(39.0), { opacity: 0, y: 40, scale: 0.97 }, 0.55, "power3.out");
  pop("#rP0 .pic", V(39.15));
  const scramble = ["+1 (604) 555-0189", "+1 (6#4) 5$5-0%89", "+7 f6#a 9!5-c2?9", "7f3a·9c2!·e#b4", "7f3a·9c21·e0b4"], numEl = S("#rNum"), sc = { p: 0 };
  tl.fromTo(sc, { p: 0 }, { p: 1, duration: 0.7, ease: "none", onUpdate: () => { numEl.textContent = scramble[Math.min(scramble.length - 1, Math.floor(sc.p * scramble.length))]; } }, V(39.6));
  cap("#oH13", "#oH14", V(40.3));
  inn("#rP1", V(40.45), { opacity: 0, y: 40, scale: 0.97 }, 0.55, "power3.out");
  pop("#rP1 .pic", V(40.6));
  tl.to("#rLast", { opacity: 0, x: 20, duration: 0.4 }, V(41.3));
  // into the inbox: the map clears and the TV app grows to fill the frame; the seasons continue it
  tl.to(".node, .edges, #oPhone, .privacy, #oLive, #oH14, #oScrim", { opacity: 0, duration: 0.4 }, V(41.0));
  tl.to("#oTV", { ...FULLO, duration: 0.9, ease: "power3.inOut" }, V(41.0));
  tl.to("#oTV .tvglass", { borderRadius: 0, duration: 0.9 }, V(41.0));
'''
new = new.replace('  ${JSON.stringify(NCY(3))};\n', '')
s = s[:a] + new + s[b:]
# NCX / NCY are build-time values: inline them in the timeline script
s = s.replace("tl.to(id, { x: NCX - 410 - 150, y: NCY(3) - top - 26,", "tl.to(id, { x: ${NCX} - 410 - 150, y: ${NCY(3)} - top - 26,")
s = s.replace("inn(id, t, { opacity: 0, x: -120, y: NCY(3) - top - 40, scale: 0.6 }", "inn(id, t, { opacity: 0, x: -120, y: ${NCY(3)} - top - 40, scale: 0.6 }")
open(p, "w", encoding="utf-8").write(s)
print("timeline ok")
