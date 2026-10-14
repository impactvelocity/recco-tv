# Round 5c: the last flat spots. The phone fills with texts on "so you can text it anything", each poster gets a
# scan sweep before its OMDb badge, and the code editor TV pushes in slowly.
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

rep('${phone("oPhone", [{ id: "o1", text: "48217" }], { time: "8:58" })',
    '${phone("oPhone", [{ id: "o1", text: "48217" }, { id: "o2", text: "the one with the kitchen" }, { id: "o3", text: "Dad says Desk Nine is brilliant" }, { id: "o4", kind: "link", title: "3 cozy comedies for a night in", typeText: "filmtok.cx" }, { id: "o5", text: "something cozy for tonight" }], { time: "8:58" })')
rep('''<div class="qcard" id="q${i}"><div class="qp" style="background-image:url(${P(p)})"><div class="qbadge"''',
    '''<div class="qcard" id="q${i}"><div class="qp" style="background-image:url(${P(p)})"><div class="qscan" id="qs${i}"></div><div class="qbadge"''')
rep('<div class="qcard" id="q3"><div class="qp ghost"><span>?</span>', '<div class="qcard" id="q3"><div class="qp ghost"><span>?</span><div class="qscan bad" id="qs3"></div>')
rep('.oscrim {', '''.qp { overflow: hidden; }
.qscan { position: absolute; left: 0; right: 0; top: 0; height: 70px; background: linear-gradient(180deg, rgba(240,182,103,0), rgba(240,182,103,.65) 50%, rgba(240,182,103,0)); opacity: 0; }
.qscan.bad { background: linear-gradient(180deg, rgba(200,87,47,0), rgba(200,87,47,.7) 50%, rgba(200,87,47,0)); }
.oscrim {''')
rep('  // the agent\'s results float while the voice explains them', '''  // "so you can text it anything": the phone fills with texts of every kind
  [V(28.8), V(29.15), V(29.5), V(29.85)].forEach((t, i) => {
    const msg = S("#o" + (i + 2)), h = msg.firstElementChild.offsetHeight + 12;
    tl.fromTo(msg, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
    tl.fromTo(msg.firstElementChild, { scale: 0.7, transformOrigin: "100% 100%" }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" }, t);
  });
  // each title is scanned before its badge lands; the made-up one scans red
  [0, 1, 2].forEach((i) => tl.fromTo("#qs" + i, { y: -70, opacity: 1 }, { y: 200, opacity: 1, duration: 0.45, ease: "power1.inOut" }, V(31.85) + i * 0.25));
  [0, 1, 2].forEach((i) => tl.to("#qs" + i, { opacity: 0, duration: 0.1 }, V(32.2) + i * 0.25));
  tl.fromTo("#qs3", { y: -70, opacity: 1 }, { y: 200, opacity: 1, duration: 0.45, ease: "power1.inOut" }, V(33.35));
  tl.to("#qs3", { opacity: 0, duration: 0.1 }, V(33.7));
  // the agent's results float while the voice explains them''')
# the editor TV pushes in slowly while the code types and builds
rep('''  tl.fromTo("#oTV", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", immediateRender: false }, O0);''',
    '''  tl.fromTo("#oTV", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", immediateRender: false }, O0);
  tl.fromTo("#oTV", { scale: 1.12 }, { scale: 1.17, duration: T(V(5.4)) - T(O0 + 0.6), ease: "sine.inOut", immediateRender: false }, O0 + 0.6);''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
