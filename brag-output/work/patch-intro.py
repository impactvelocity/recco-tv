# "So now I use Recco": the logo lands on the line (no wait), then "an inbox for my TV that I text like a friend"
# plays out: the logo lifts, a phone and a small TV slide in, and three texts fly from the phone into the TV as cards.
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

# ---- markup: the demo inside the reveal
rep('''<div class="revsub" id="dSub">${W("An inbox for your TV you text like a friend")}</div></div></div>''',
'''</div><div class="revsub" id="dSub">${W("An inbox for your TV you text like a friend")}</div>
    <div class="rvphonewrap" id="rvPhoneWrap"><div class="rvphonescale">${phone("rvPhone", [{ id: "rv1", text: "Jill says Two-Car Garage is hilarious" }, { id: "rv2", kind: "link", title: "3 cozy comedies for a night in", typeText: "filmtok.cx/@steph" }, { id: "rv3", text: "movies for a rainy night" }], { time: "9:00" }).replace('class="phone" id="rvPhone"', 'class="phone" id="rvPhone" style="left:0;top:0"')}</div></div>
    ${tvFrame("rvTV", screen({ theme: "winterNight", id: "rvScr", body: grid([card(RECS.koq, "rvC0"), card(RECS.stack, "rvC1"), card(RECS.rain, "rvC2")]) }), { x: 780, y: 470, w: 820 })}
    ${RV_FLY.map(([label], i) => `<div class="rvfly" id="rvF${i}">${label}</div>`).join("")}
  </div>''')
# fly labels and where each lands (centre of card slot i in the small TV)
rep('''const shot = (inner, w) =>''', '''const RV_FLY = [["Jill’s pick"], ["a link"], ["rainy night"]];
const shot = (inner, w) =>''')
rep('.revsub { font-family: "Inter", sans-serif; font-size: 50px;', '.revsub { position: absolute; left: 0; right: 0; top: 300px; text-align: center; font-family: "Inter", sans-serif; font-size: 50px;')
rep('.revlogo {', '''.rvphonewrap { position: absolute; left: 330px; top: 452px; width: 200px; height: 397px; opacity: 0; }
.rvphonescale { position: absolute; left: 0; top: 0; width: 416px; height: 826px; transform: scale(.48); transform-origin: 0 0; }
.rvfly { position: absolute; left: 400px; top: 768px; padding: 9px 18px; border-radius: 20px 20px 5px 20px; background: #1A7A33; color: #fff; font-family: "Inter", sans-serif; font-size: 21px; font-weight: 600; white-space: nowrap; opacity: 0; z-index: 5; box-shadow: 0 12px 30px rgba(0,0,0,.4); }
.revlogo {''')

# ---- timeline
rep('''  inn("#dLogo", 21.4, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.7, "back.out(1.8)");''',
'''  // "So now I use Recco": the logo lands with the line, no wait
  inn("#dLogo", ${R(23.3)}, { opacity: 0, scale: 0.7, rotation: -4, filter: "blur(8px)" }, 0.6, "back.out(1.8)");
  // "It's an inbox for my TV that I text like a friend": the logo lifts, a phone and a small TV come in,
  // and three texts fly from the phone into the TV, each one landing as a card
  tl.to("#dLogo", { y: -330, scale: 0.6, duration: 0.6, ease: "power3.inOut" }, ${R(24.8)});
  tl.set("#rvC0, #rvC1, #rvC2", { opacity: 0 }, 0);
  inn("#rvPhoneWrap", ${R(25.15)}, { opacity: 0, y: 80 }, 0.6, "power3.out");
  inn("#rvTV", ${R(25.25)}, { opacity: 0, y: 80 }, 0.6, "power3.out");
  const rvSend = (mid, t) => {
    const msg = S("#" + mid), h = msg.firstElementChild.offsetHeight + 12;
    tl.fromTo(msg, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
    tl.fromTo(msg.firstElementChild, { scale: 0.7, transformOrigin: "100% 100%" }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" }, t);
  };
  ${JSON.stringify([0, 1, 2].map((i) => [R(25.55 + i * 0.5), R(25.75 + i * 0.5), R(26.2 + i * 0.5), 952 + i * 250 - 470, 642 - 787]))}.forEach(([send, fly, land, dx, dy], i) => {
    rvSend("rv" + (i + 1), send);
    tl.set("#rvF" + i, { opacity: 1, x: 0, y: 0, scale: 1 }, fly);
    tl.to("#rvF" + i, { x: dx, duration: 0.55, ease: "power1.in" }, fly);
    tl.to("#rvF" + i, { y: dy, duration: 0.55, ease: "power2.out" }, fly);
    tl.to("#rvF" + i, { scale: 0.5, opacity: 0, duration: 0.15, ease: "power1.in" }, land - 0.06);
    tl.fromTo("#rvC" + i, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)", immediateRender: false }, land);
  });''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
