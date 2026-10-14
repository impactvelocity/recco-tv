# Round 2: the hackathon opener shows the TV app's code, and the pipeline becomes a simple top-down column
# between the phone (left) and the TV app (right).
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
def cut(start, end):
    """replace s[start_marker : end_marker) with a placeholder and return it"""
    global s
    a = s.index(start); b = s.index(end, a)
    return a, b

# ---------------------------------------------------------------- layout data
a, b = cut("const ONODES = [", "const oCards = [")
s = s[:a] + r'''const NW = 340, NH = 84, NX = 790, NY0 = 204, NGAP = 132, NCX = NX + NW / 2;
const ONODES = [
  { k: "zernio", t: "Zernio", s: "SMS in", icon: ic.msg() },
  { k: "lambda", t: "AWS Lambda", s: "Checks each text", icon: ic.bolt() },
  { k: "sqs", t: "Amazon SQS", s: "Queued safely", icon: ic.queue() },
  { k: "agent", t: "Recco agent", s: "AgentCore Runtime", icon: ic.spark() },
  { k: "ddb", t: "DynamoDB", s: "Keeps the record", icon: ic.db() },
  { k: "appsync", t: "AppSync Events", s: "Pushes updates", icon: ic.wave() },
].map((n, i) => ({ ...n, x: NX, y: NY0 + i * NGAP }));
const NCY = (i) => NY0 + i * NGAP + NH / 2;
const node = (n, p) => `<div class="node" id="${p}-${n.k}" style="left:${n.x}px;top:${n.y}px;width:${NW}px;height:${NH}px"><div class="nic">${n.icon}</div><div class="ntx"><div class="nt">${n.t}</div><div class="ns">${n.s}</div></div>${n.k === "lambda" ? `<div class="nbadge" id="${p}-lcheck">${ic.check(20, 3.5)}</div>` : ""}${n.k === "sqs" ? `<div class="qbars" id="${p}-q">${[0, 1, 2].map((i) => `<i id="${p}-q${i}"></i>`).join("")}</div>` : ""}</div>`;
// phone (left, centred at y 600) → down the column → the TV app (right, centred at y 600)
const PH_R = 385, TV_L = 1452, MIDY = 600, ELB0 = 590, ELB6 = 1290;
const OEDGES = [
  `M ${PH_R} ${MIDY} L ${ELB0} ${MIDY} L ${ELB0} ${NCY(0)} L ${NX} ${NCY(0)}`,
  ...[0, 1, 2, 3, 4].map((i) => `M ${NCX} ${NY0 + i * NGAP + NH} L ${NCX} ${NY0 + (i + 1) * NGAP}`),
  `M ${NX + NW} ${NCY(5)} L ${ELB6} ${NCY(5)} L ${ELB6} ${MIDY} L ${TV_L} ${MIDY}`,
];
const OPTS = { phone: [PH_R, MIDY], e0a: [ELB0, MIDY], e0b: [ELB0, NCY(0)], ...Object.fromEntries(ONODES.map((n, i) => [n.k, [NCX, NCY(i)]])), e6a: [ELB6, NCY(5)], e6b: [ELB6, MIDY], tv: [TV_L, MIDY] };
// the TV app's code, shown on the big TV while the voice says what it is built with
const CODE = [
  `<b>import</b> React, {memo, useState} <b>from</b> <s>'react'</s>;`,
  `<b>import</b> {Pressable, View} <b>from</b> <s>'react-native'</s>;`,
  `<b>import</b> LinearGradient <b>from</b> <s>'@amazon-devices/react-linear-gradient'</s>;`,
  `<b>import</b> {FocusRing} <b>from</b> <s>'./FocusRing'</s>;`,
  ``,
  `<em>// One inbox tile. Focus lifts it: a ring, a shadow, scale 1.06.</em>`,
  `<b>export const</b> <u>InboxTile</u> = memo(({item, onPress}: Props) =&gt; {`,
  `  <b>const</b> [focused, setFocused] = useState(<b>false</b>);`,
  `  <b>return</b> (`,
  `    &lt;<u>Pressable</u>`,
  `      <i>hasTVPreferredFocus</i>`,
  `      <i>aria-label</i>={item.title}`,
  `      <i>onFocus</i>={() =&gt; setFocused(<b>true</b>)}`,
  `      <i>onPress</i>={() =&gt; onPress(item)}&gt;`,
  `      &lt;<u>Poster</u> <i>uri</i>={item.poster} /&gt;`,
  `      &lt;<u>FocusRing</u> <i>visible</i>={focused} /&gt;`,
  `    &lt;/<u>Pressable</u>&gt;`,
  `  );`,
  `});`,
];
const TERM = [`<span class="tp">~/recco/apps/tv $</span> npm run build:debug`, `<span class="tok">✓</span> Built tv_aarch64.vpkg`, `<span class="tp">~/recco/apps/tv $</span> vega device launch-app -a com.recco.tv.main`];
const editorBody = () => `<div class="ide">
    <div class="ide-bar"><span class="ide-dot"></span><span class="ide-dot"></span><span class="ide-dot"></span><span class="ide-tab on">InboxTile.tsx</span><span class="ide-tab">App.tsx</span><span class="ide-tab">FocusRing.tsx</span></div>
    <div class="ide-side"><div class="ide-proj">RECCO / apps / tv</div>${["src", "· App.tsx", "· components", "  InboxTile.tsx", "  FocusRing.tsx", "  Header.tsx", "· screens", "  Inbox.tsx", "manifest.toml"].map((f, i) => `<div class="ide-f ${i === 3 ? "on" : ""}">${f.replace(/ /g, "&nbsp;")}</div>`).join("")}</div>
    <div class="ide-code">${CODE.map((l, i) => `<div class="cl ${i === 1 || i === 2 ? "rn" : ""}" id="oL${i}"><span class="ln">${i + 1}</span><span class="ct">${l.replace(/^( +)/, (m) => "&nbsp;".repeat(m.length)) || "&nbsp;"}</span></div>`).join("")}</div>
    <div class="ide-term"><div class="ide-th">TERMINAL</div>${TERM.map((l, i) => `<div class="tl" id="oT${i}">${l}</div>`).join("")}</div>
  </div>`;
''' + s[b:]

rep('''  ${screen({ theme: "fallNight", id: "oCode", still: false, hdr: false, body: codeBody("oC") })}''',
    '''  ${screen({ theme: "fallNight", id: "oCode", still: false, hdr: false, body: codeBody("oC") })}
  <div class="screen" id="oEd">${editorBody()}</div>''')

# ---------------------------------------------------------------- scene markup
rep('''scene("sO", 48.95, 90.96, `<div class="stage"><div class="stagev"></div></div>
  <div class="capblock">''', '''scene("sO", 48.95, 90.96, `<div class="stage"><div class="stagev"></div></div>
  <div class="capblock" style="z-index:7">''')
rep('''  <div class="dlabel" id="oLblP" style="left:140px;top:446px">Your phone</div>
  <div class="dlabel" id="oLblT" style="left:1660px;top:810px">Fire TV</div>
''', '')
rep('''  <div class="ochip obot" id="oOut0" style="left:110px"><div class="oic">${ic.user(26)}</div><div><div class="ok">Friend</div><div class="ov">Steph</div></div></div>
  <div class="ochip obot" id="oOut1" style="left:650px"><div class="oic">${ic.film(26)}</div><div><div class="ok">Titles</div><div class="ov">The Fog House · Snowbound · The Will Reading</div></div></div>
  <div class="ochip obot" id="oOut2" style="left:1320px"><div class="oic">${ic.link(26)}</div><div><div class="ok">Links</div><div class="ov">youtu.be/best-films-2023</div></div></div>
  <div class="qrow small">''', '''  <div class="ochip obot" id="oOut0" style="top:520px"><div class="oic">${ic.user(24)}</div><div><div class="ok">Friend</div><div class="ov">Steph</div></div></div>
  <div class="ochip obot" id="oOut1" style="top:614px"><div class="oic">${ic.film(24)}</div><div><div class="ok">Titles</div><div class="ov">3 films</div></div></div>
  <div class="ochip obot" id="oOut2" style="top:708px"><div class="oic">${ic.link(24)}</div><div><div class="ok">Links</div><div class="ov">youtu.be/best-…</div></div></div>
  <div class="qrow small">''')
rep('''  <div class="privacy">''', '''  <div class="oscrim" id="oScrim"></div>
  <div class="privacy">''')
rep('''<div class="live" id="oLive" style="left:1790px;top:592px;right:auto">''', '''<div class="live" id="oLive" style="left:1756px;top:468px;right:auto">''')
rep('''  <div class="chip vega" id="oChip"><span class="cdot"></span>React Native for Vega</div>''',
    '''  <div class="chip vega" id="oChip"><span class="cdot"></span>React Native for Vega</div>
  <div class="hsticker" id="oSticker">Hackathon build</div>''')

# ---------------------------------------------------------------- CSS
rep('''.obub { position: absolute; left: 280px; top: 470px; opacity: 0; }
.obot { position: absolute; top: 850px; width: 490px; opacity: 0; }
.qrow.small { top: 846px; gap: 36px; }
.qrow.small .qcard { width: 120px; gap: 4px; }
.qrow.small .qp { width: 120px; height: 180px; border-radius: 12px; box-shadow: 0 18px 40px rgba(0,0,0,.45); }
.qrow.small .qp.ghost span { font-size: 80px; }
.qrow.small .qt { font-size: 18px; }
.qrow.small .qm { font-size: 14px; }''', '''.obub { position: absolute; left: 410px; opacity: 0; font-size: 24px; padding: 12px 18px; border-radius: 22px 22px 6px 22px; max-width: 360px; white-space: nowrap; }
#oIn0 { top: 650px; } #oIn1 { top: 726px; } #oIn2 { top: 802px; }
.obot { position: absolute; left: 1150px; width: 280px; padding: 14px 18px; gap: 14px; border-radius: 20px; opacity: 0; }
.obot .oic { width: 44px; height: 44px; border-radius: 12px; }
.obot .ok { font-size: 14px; } .obot .ov { font-size: 22px; white-space: nowrap; }
.qrow.small { left: 1150px; right: auto; top: 400px; width: 280px; flex-wrap: wrap; gap: 18px 22px; justify-content: flex-start; }
.qrow.small .qcard { width: 128px; gap: 2px; }
.qrow.small .qp { width: 128px; height: 192px; border-radius: 12px; box-shadow: 0 18px 40px rgba(0,0,0,.45); }
.qrow.small .qp.ghost span { font-size: 80px; }
.qrow.small .qt { font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.qrow.small .qm { font-size: 13px; }
.oscrim { position: absolute; inset: 0; z-index: 5; background: rgba(12,16,16,.78); opacity: 0; }
.hsticker { position: absolute; left: 226px; top: 196px; z-index: 6; padding: 14px 26px; border-radius: 16px; background: #F0B667; color: #1D1410; font-size: 28px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; box-shadow: 0 18px 40px rgba(0,0,0,.45); transform: rotate(-7deg); opacity: 0; }
.ide { position: absolute; inset: 0; background: #0f1516; font-family: Menlo, "SF Mono", monospace; color: #DCE3DF; }
.ide-bar { position: absolute; left: 0; right: 0; top: 0; height: 70px; display: flex; align-items: center; gap: 12px; padding-left: 28px; background: #0a0f10; border-bottom: 1px solid #1f2a2b; }
.ide-dot { width: 18px; height: 18px; border-radius: 50%; background: #2e3a3b; }
.ide-dot:first-child { background: #C8572F; } .ide-dot:nth-child(2) { background: #F0B667; } .ide-dot:nth-child(3) { background: #6FA86A; margin-right: 30px; }
.ide-tab { height: 70px; display: flex; align-items: center; padding: 0 28px; font-size: 24px; color: #7d8a87; border-right: 1px solid #1f2a2b; }
.ide-tab.on { color: #FFF6E8; background: #0f1516; box-shadow: inset 0 3px 0 #E28A3B; }
.ide-side { position: absolute; left: 0; top: 70px; bottom: 0; width: 330px; padding: 26px 0; background: #0b1112; border-right: 1px solid #1f2a2b; font-size: 22px; color: #8b9794; }
.ide-proj { padding: 0 26px 18px; font-size: 18px; letter-spacing: .1em; color: #5f6c69; }
.ide-f { padding: 7px 26px; white-space: nowrap; } .ide-f.on { color: #FFF6E8; background: rgba(226,138,59,.16); }
.ide-code { position: absolute; left: 330px; right: 0; top: 92px; font-size: 27px; line-height: 37px; white-space: nowrap; }
.cl { display: flex; padding-right: 30px; clip-path: inset(0 100% 0 0); }
.cl .ln { width: 86px; flex: none; text-align: right; padding-right: 28px; color: #4c5957; }
.cl b { font-weight: 400; color: #E28A3B; } .cl s { text-decoration: none; color: #A9CF8A; } .cl em { font-style: normal; color: #6b7a77; } .cl u { text-decoration: none; color: #8FBDE8; } .cl i { font-style: normal; color: #F0B667; }
.cl.rn { border-radius: 6px; }
.ide-term { position: absolute; left: 330px; right: 0; bottom: 0; height: 196px; padding: 18px 30px; background: #0a0f10; border-top: 1px solid #1f2a2b; font-size: 24px; line-height: 40px; }
.ide-th { font-size: 16px; letter-spacing: .12em; color: #5f6c69; line-height: 26px; margin-bottom: 4px; }
.tl { opacity: 0; white-space: nowrap; } .tp { color: #6FA86A; } .tok { color: #6FA86A; font-weight: 700; }''')
open(p, "w", encoding="utf-8").write(s)
print("markup ok")
