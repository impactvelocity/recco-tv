# The phone's feed ("and suddenly… so I just keep scrolling") plays the user's clip, cropped to the phone screen
# (assets/video/feed.mp4: source 1.8–11.4s at 1.6x, crop following the dog, the cat, the street).
import sys, re
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

# data: one overlay per clip instead of the still posts
a = s.index("const feedPosts = ["); b = s.index("\n", s.index("const postImg = "))
s = s[:a] + '''// one caption per clip in assets/video/feed.mp4; the clip swipes at 1.22s and 4.34s
const FEED_AT = 11.68, FEED_SWIPES = [1.22, 4.34];
const feedMeta = [
  ["golden.hours", "bubble day. he has never been happier", "212K", "4,102"],
  ["marmalade.cat", "he knows exactly what he did", "1.2M", "18K"],
  ["slow.travel", "save this for your next trip", "530K", "7,811"],
];''' + s[b:]

# markup: the clip, a gradient, and the three overlays
a = s.index('<div class="feed" id="bFeed" data-layout-allow-overlap><div class="fstrip" id="bStrip">')
b = s.index('<div class="ftabs">', a)
s = s[:a] + '''<div class="feed" id="bFeed" data-layout-allow-overlap><video class="clip fvid" id="bFeedVid" src="assets/video/feed.mp4" muted playsinline data-start="${+T(FEED_AT).toFixed(3)}" data-duration="${+(T(16.35) - T(FEED_AT)).toFixed(3)}" data-track-index="3"></video><div class="fgrad"></div>
       ${feedMeta.map(([who, cap, likes, comments], i) => `<div class="fpost" id="bMeta${i}"><div class="fact"><div><span class="fic"><svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.7 1.2 5.4 3.1C13.7 6.2 15.3 5 17.4 5 21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg></span>${likes}</div><div><span class="fic">${ic.msg(30)}</span>${comments}</div><div><span class="fic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l7 7-7 7"/><path d="M21 12H10a7 7 0 0 0-7 7"/></svg></span>Share</div></div>
       <div class="fmeta"><div class="fwho"><span class="fav">${who[0].toUpperCase()}</span>@${who}</div><div class="fcap">${cap}</div></div></div>`).join("")}
       ''' + s[b:]
rep('.fpost { position: relative; width: 100%; height: 792px; background-size: cover; background-position: center; }',
    '.fvid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }\n.fpost { position: absolute; inset: 0; opacity: 0; }')
rep('.fstrip { position: absolute; left: 0; top: 0; width: 100%; }\n', '')

# timeline: the messages search is shorter; on "and suddenly" the feed takes over and plays through the scene
rep('tl.fromTo("#bList", { y: 0 }, { y: -listMax, duration: T(13.6) - T(10.3), ease: "sine.inOut" }, 10.3);',
    'tl.fromTo("#bList", { y: 0 }, { y: -listMax, duration: T(11.65) - T(10.3), ease: "sine.inOut" }, 10.3);')
rep('tl.fromTo("#bFeed", { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }, 14.3);',
    '''tl.fromTo("#bFeed", { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }, ${FEED_AT});
  // the captions change with the clip's own swipes
  const fsw = ${JSON.stringify(FEED_SWIPES)}.map((d) => ${FEED_AT} + (d - 0.15) / 1.25);
  tl.set("#bMeta0", { opacity: 1, yPercent: 0 }, ${FEED_AT});
  fsw.forEach((t, i) => { tl.to("#bMeta" + i, { yPercent: -35, opacity: 0, duration: 0.25, ease: "power2.in" }, t); tl.fromTo("#bMeta" + (i + 1), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, t + 0.12); });''')
rep('tl.to("#bList", { opacity: 0, duration: 0.1 }, 14.66);', 'tl.to("#bList", { opacity: 0, duration: 0.1 }, ${FEED_AT} + 0.3);')
rep('  [14.75, 15.1, 15.4, 15.65, 15.85, 16.02, 16.17].forEach((t, i) => tl.to("#bStrip", { y: -792 * (i + 1), duration: i < 3 ? 0.3 : 0.17, ease: "power3.inOut" }, t));\n', '')
open(p, "w", encoding="utf-8").write(s)
print("ok")
