# Retime for the voiceover at its natural speed (1.0x instead of 1.25x), and use the illustrated
# intro items. All cue times in build.mjs stay in the old 1.25x clock; T() maps them onto the new one.
# Run once: python3 -I patch-retime.py
import sys

P = "composition/src/build.mjs"
s = open(P).read()

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        sys.exit(f"expected {count} match(es), found {n}: {a[:90]!r}")
    s = s.replace(a, b)

# ------------------------------------------------------------ the clock mapping
rep('''const DURATION = 103.5;
const VO_INTRO = 0.6; // global start of the story VO
const VO_BUILT = 50.0; // global start of the build VO''',
'''// Cue times below are authored on the old clock (voiceover at 1.25x: story VO at 0.6s, build VO at 50s).
// T() maps them onto the real clock (voiceover at 1.0x): speech stretches by 1.25, the chapter gap keeps its length.
const T = (t) => (t <= 0.6 ? t : t <= 47.81 ? 0.6 + (t - 0.6) * 1.25 : t <= 50 ? 59.6125 + (t - 47.81) : 61.8025 + (t - 50) * 1.25);
const DURATION = +T(103.5).toFixed(2);
const VO_INTRO = 0.6; // old-clock start of the story VO
const VO_BUILT = 50.0; // old-clock start of the build VO (real clock: T(50) = 61.8s)''')

rep('''data-start="${start}" data-duration="${+(end - start).toFixed(3)}" data-track-index="2" ${extra}><div class="cam"''',
    '''data-start="${+T(start).toFixed(3)}" data-duration="${+(T(end) - T(start)).toFixed(3)}" data-track-index="2" ${extra}><div class="cam"''')

# background loops are 10s files: split longer windows into back-to-back clips inside one wrapper
i = s.find("const bgVideo = ")
j = s.find("};", i) + 2
s = s[:i] + '''const bgVideo = (theme, start, dur, mediaStart = 0, wrapId = "") => {
  const s0 = T(start), total = T(start + dur) - s0, parts = [];
  for (let off = 0; off < total - 0.001; off += 10) {
    vcount++;
    parts.push(`<video class="clip bgv" id="v${vcount}-${theme}" src="assets/bg/${theme}.mp4" muted playsinline data-start="${+(s0 + off).toFixed(3)}" data-duration="${+Math.min(10, total - off).toFixed(3)}" data-media-start="${off === 0 ? mediaStart : 0}" data-track-index="0"></video>`);
  }
  videos.push(`<div class="vwrap" ${wrapId ? `id="${wrapId}"` : ""}>${parts.join("")}</div>`);
  return parts[0].match(/id="([^"]+)"/)[1];
};''' + s[j:]

rep('''bgVideo("fallNight", 37.5, 10.0, 0, "vwI");
bgVideo("fallNight", 47.5, 0.4, 0);''', '''bgVideo("fallNight", 37.5, 10.4, 0, "vwI");''')

# ------------------------------------------------------------ the timeline: positions go through T
rep('''const tl = gsap.timeline({ paused: true });''',
'''const T = ${T};
const master = gsap.timeline({ paused: true });
const at = (p) => (typeof p === "number" ? T(p) : p);
const tl = { fromTo: (a, b, c, p) => master.fromTo(a, b, c, at(p)), to: (a, b, p) => master.to(a, b, at(p)), set: (a, b, p) => master.set(a, b, at(p)) };''')
rep('''  tl.seek(0);
  window.__timelines["main"] = tl;''', '''  master.seek(0);
  window.__timelines["main"] = master;''')

# window-length tweens follow their windows on the real clock
rep('''{ scale: to, duration: e - s, ease: "none" }, s);''', '''{ scale: to, duration: T(e) - T(s), ease: "none" }, s);''')
rep('''repeat: Math.max(0, Math.floor((e - s) / half) - 1), ease: "sine.inOut", immediateRender: false }, s);''',
    '''repeat: Math.max(0, Math.floor((T(e) - T(s)) / half) - 1), ease: "sine.inOut", immediateRender: false }, s);''')
rep('''{ rotation: 360 * Math.max(1, Math.round(e - s)), duration: e - s, ease: "none" }, s);''',
    '''{ rotation: 360 * Math.max(1, Math.round(T(e) - T(s))), duration: T(e) - T(s), ease: "none" }, s);''')
rep('''stagger: (t1 - t0) / chars.length''', '''stagger: (T(t1) - T(t0)) / chars.length''')
rep('''{ scale: 1.08, duration: 7.75, ease: "none" }, 0);''', '''{ scale: 1.08, duration: T(7.75), ease: "none" }, 0);''')
rep('''{ m: 48, duration: 6.6, ease: "power1.in",''', '''{ m: 48, duration: T(14.5) - T(7.9), ease: "power1.in",''')
rep('''{ scale: 1.06, duration: 10.4, ease: "none" }, 37.5);''', '''{ scale: 1.06, duration: T(47.9) - T(37.5), ease: "none" }, 37.5);''')
rep('''duration: 11.75, ease: "none" }, 69.35);''', '''duration: T(81.1) - T(69.35), ease: "none" }, 69.35);''', count=3)
rep('''duration: 0.904, yoyo: true, repeat: 10, ease: "sine.inOut" }, 70.4);''', '''duration: 0.904, yoyo: true, repeat: Math.max(0, Math.floor((T(81.1) - T(70.4)) / 0.904) - 1), ease: "sine.inOut" }, 70.4);''')
rep('''{ scale: 1.0, duration: 7.2, ease: "power1.out" }, 91.95);''', '''{ scale: 1.0, duration: T(99.15) - T(91.95), ease: "power1.out" }, 91.95);''')
rep('''{ y: -listMax, duration: 3.5, ease: "sine.inOut" }, 10.1);''', '''{ y: -listMax, duration: T(13.6) - T(10.1), ease: "sine.inOut" }, 10.1);''')

# ------------------------------------------------------------ intro items: the illustrations
rep('''${[["cup", "Tea"], ["cookie", "A snack"], ["paw", "My dog"], ["tv", "A really good show"]].map(([k, l], i) => `<div class="item" id="ai${i}"><div class="iic">${ic[k]}</div><div class="ilab">${l}</div></div>`).join("")}''',
    '''${[["intro-tea.webp", "Tea"], ["intro-snack.webp", "A snack"], ["intro-dog.webp", "My dog"], ["intro-show.webp", "A really good show"]].map(([f, l], i) => `<div class="item" id="ai${i}"><div class="iic"><img src="assets/img/${f}" alt=""></div><div class="ilab">${l}</div></div>`).join("")}''')
rep('''.items { position: absolute; left: 140px; right: 140px; top: 330px; display: flex; gap: 36px; }''',
    '''.items { position: absolute; left: 140px; right: 140px; top: 240px; display: flex; gap: 36px; }
.item .iic img { width: 250px; height: 250px; object-fit: contain; display: block; }''')
rep('''.item { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 22px; padding: 34px 32px;''',
    '''.item { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 24px 24px 30px;''')
rep('''.ilab { font-family: "Inter", sans-serif; font-size: 40px;''', '''.ilab { font-family: "Inter", sans-serif; font-size: 38px;''')

open(P, "w").write(s)
print("patched")

s = open(P).read()
rep('''{ strokeDashoffset: -48 * Math.round((until - t) * 2.2), duration: until - t, ease: "none" }, t); };''',
    '''{ strokeDashoffset: -48 * Math.round((T(until) - T(t)) * 2.2), duration: T(until) - T(t), ease: "none" }, t); };''')
rep('''else tl.to(id, { x, y, duration: 0.42, ease: "power1.inOut" }, t + (i - 1) * 0.42); });''',
    '''else tl.to(id, { x, y, duration: T(t + i * 0.42) - T(t + (i - 1) * 0.42), ease: "power1.inOut" }, t + (i - 1) * 0.42); });''')
open(P, "w").write(s)
print("patched helpers")
