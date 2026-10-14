# HyperFrames can't time a <video> inside a timed scene, so the feed clip and its captions live in a top-level
# container laid exactly over the phone screen (below its status bar), mirroring the phone's scale and the scene fade.
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

a = s.index('<div class="feed" id="bFeed" data-layout-allow-overlap><video')
b = s.index('<div class="ftabs"><span>Following</span><b>For You</b></div></div>', a)
inner = s[a:b]
end = '<div class="ftabs"><span>Following</span><b>For You</b></div></div>'
s = s[:a] + '<div class="feed" id="bFeed" data-layout-allow-overlap></div>' + s[b + len(end):]
feed_html = inner.replace('<div class="feed" id="bFeed" data-layout-allow-overlap>', '') + '<div class="ftabs"><span>Following</span><b>For You</b></div>'
rep('// ---------------------------------------------------------------- scenes\nconst scenes = [];',
    '// ---------------------------------------------------------------- scenes\nconst scenes = [];\nconst overlays = []; // top-level layers drawn over the scenes')
rep('''const feedMeta = [''', '''const feedMeta = [''')
# register the overlay right after scene B is declared
i = s.index('scene("sB", B0, 16.35,')
j = s.index('`);\n', i) + 4
s = s[:j] + 'overlays.push(`<div class="feedwrap" id="bFeedWrap" data-layout-allow-overlap>' + feed_html + '</div>`);\n' + s[j:]
rep('      ${scenes.join("\\n      ")}', '      ${scenes.join("\\n      ")}\n      ${overlays.join("\\n      ")}')
rep('.ftabs { position: absolute; left: 0; right: 0; top: 64px;', '.ftabs { position: absolute; left: 0; right: 0; top: 14px;')
rep('.fvid { position: absolute;', '.feedwrap { position: absolute; left: 774px; top: 196px; width: 372px; height: 740px; z-index: 10; overflow: hidden; border-radius: 0 0 48px 48px; background: #000; color: #fff; font-family: "Inter", sans-serif; transform-origin: 186px 344px; opacity: 0; }\n.fvid { position: absolute;')
rep('''    tl.fromTo("#bFeed", { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }, ${FEED_AT});''',
    '''    tl.fromTo("#bFeed", { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }, ${FEED_AT});''', 0)
rep('''tl.fromTo("#bFeed", { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }, ${FEED_AT});''',
    '''tl.fromTo("#bFeed", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${FEED_AT});
  // the feed layer sits over the phone screen and follows the phone: same scale, same scene fade
  tl.set("#bFeedWrap", { scale: 1.12 }, ${B0});
  tl.fromTo("#bFeedWrap", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: false }, ${FEED_AT});
  tl.to("#bFeedWrap", { scale: 1.2, duration: 0.5, ease: "power2.inOut" }, 14.4);
  tl.to("#bFeedWrap", { opacity: 0, duration: 0.3, ease: "power1.in" }, 16.05);''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
