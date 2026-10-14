# Round 4: one steady browse rhythm across "a really good show" and "ten minutes of looking";
# pipeline packets stop at the furthest step already on screen.
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

a = s.index('  const bHop = (t, c, r, scroll = false) => {')
b = s.index('  const clk = { m: 0 }, clkEl = S("#bClockT");')
s = s[:a] + '''  // one rhythm for the whole browse: the focus hops, and when it drops a row the grid scrolls with it in the same tween
  let bRow = 0;
  const bHop = (t, c, r) => {
    const d = r !== bRow ? 0.3 : 0.22;
    tl.to("#bFocus", { x: c * 262, y: r * 484, duration: d, ease: "power2.inOut" }, t);
    if (r !== bRow) tl.to("#bGrid", { y: -r * 484, duration: d, ease: "power2.inOut" }, t);
    tl.set("#bFocus", { backgroundImage: bImg(c, r) }, t + 0.06);
    bRow = r;
  };
  tl.set("#bGrid", { y: 0 }, ${B0});
  tl.set("#bFocus", { x: 0, y: 0, backgroundImage: bImg(0, 0) }, ${B0});
  tl.fromTo("#bFocus", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1.06, duration: 0.3, ease: "back.out(2)" }, 5.55);
  // "and a really good show"
  bHop(5.72, 1, 0); bHop(5.92, 2, 0); bHop(6.12, 2, 1); bHop(6.34, 3, 1); bHop(6.56, 3, 2);
  // "That's the plan": a press on the pick, the line lands, then the same rhythm carries on
  tl.to("#bFocus", { scale: 0.98, duration: 0.1, ease: "power2.in" }, 6.86);
  tl.to("#bFocus", { scale: 1.1, duration: 0.4, ease: "back.out(1.8)" }, 6.96);
  tl.to("#bShade", { opacity: 1, duration: 0.4, ease: "power2.out" }, 6.9);
  words("#bPlan", 7.0, 0.08);
  out("#bPlan", 7.62, { opacity: 0, y: -16 }, 0.25);
  tl.to("#bShade", { opacity: 0, duration: 0.4 }, 7.65);
  tl.to("#bFocus", { scale: 1.06, duration: 0.3, ease: "power2.out" }, 7.7);
  // "but after ten minutes of looking"
  bHop(7.85, 4, 2); bHop(8.07, 4, 3); bHop(8.29, 3, 3); bHop(8.51, 3, 4); bHop(8.73, 2, 4); bHop(8.95, 2, 5); bHop(9.17, 1, 5);
''' + s[b:]

# packets: only travel as far as the steps already drawn
rep('''  const pk = (id, keys, t, hop = 0.32) => { tl.set(id, { opacity: 1 }, t);''',
'''  const APPEAR = { phone: 0, e0a: V(11.3), e0b: V(11.5), zernio: V(11.6), lambda: V(13.15), sqs: V(15.8), agent: V(19.9), ddb: V(35.05), appsync: V(36.45), e6a: V(37.25), e6b: V(37.45), tv: V(37.6) };
  const pk = (id, all, t, hop = 0.32) => { const keys = []; for (const [i, k] of all.entries()) { if (i > 0 && APPEAR[k] > t + (i - 1) * hop) break; keys.push(k); } tl.set(id, { opacity: 1 }, t);''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
