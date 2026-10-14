# Round 2: new mock posters, plain rating marks, calmer friend messages, smoother "So now I use Recco".
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f"expected {count} of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

# ---- posters: one per show
rep('title: "Room 104", type: "Series", year: "2023–", imdb: "8.0", rt: "91%", poster: "room-104", from: "Mom", msg: "the school one!! we laughed the whole time"',
    'title: "Snowbound", type: "Film", year: "1980", imdb: "8.4", rt: "83%", poster: "snowbound", from: "Mom", msg: "too scary for your dad, perfect for you"')
rep('title: "Away Game", type: "Film", year: "2024", imdb: "8.5", rt: "92%", poster: "away-game", from: "Me", msg: "note to self: save this for a rainy Sunday"',
    'title: "Sandfall: Part Two", type: "Film", year: "2024", imdb: "8.5", rt: "92%", poster: "sandfall-part-two", from: "Me", msg: "note to self: watch before Part Three comes out"')
rep('title: "Floor Thirteen", type: "Series", year: "2022–", imdb: "8.7", rt: "97%", runtime: "50 min", genre: "Thriller", poster: "floor-thirteen",',
    'title: "The Will Reading", type: "Film", year: "2019", imdb: "7.9", rt: "97%", runtime: "2h 10m", genre: "Mystery", poster: "will-reading",')
rep('synopsis: "A new hire finds a floor that isn’t on any of the building’s plans, and a lift that only goes there at night."',
    'synopsis: "A detective untangles a family’s inheritance, one lying relative at a time."')
rep('title: "Couch Time", type: "Series", year: "2020–", imdb: "8.7", rt: "", poster: "couch-time"', 'title: "Away Game", type: "Series", year: "2020–", imdb: "8.7", rt: "", poster: "away-game"')
rep('items: ["room-104", "away-game", "couch-time"]', 'items: ["room-104", "couch-time", "third-floor-mystery"]')
rep('["floor-thirteen", "latenight.club", "rating every thriller I watched in October"', '["snowbound", "frightnight.club", "rating every horror movie I watched in October"')
rep('["away-game", "matchday.cinema"', '["sandfall-part-two", "desert.cinema"')
rep('["room-104", "comfort.tv", "3 comedies to start tonight"', '["third-floor-mystery", "podcast.brain", "3 mysteries to start tonight"')
rep('const browsePosters = ["two-car-garage", "desk-nine", "back-of-house", "floor-thirteen", "second-summer", "room-104", "away-game", "couch-time"];',
    'const browsePosters = ["two-car-garage", "desk-nine", "back-of-house", "floor-thirteen", "second-summer", "room-104", "away-game", "couch-time", "sandfall-part-two", "will-reading", "fog-house", "snowbound", "third-floor-mystery"];')
rep('const oPosters = [["floor-thirteen", "Floor Thirteen", "2022"], ["away-game", "Away Game", "2024"], ["second-summer", "Second Summer", "2023"]];',
    'const oPosters = [["fog-house", "The Fog House", "2001"], ["snowbound", "Snowbound", "1980"], ["will-reading", "The Will Reading", "2019"]];')
rep('<div class="ov">Floor Thirteen · Away Game · Second Summer</div>', '<div class="ov">The Fog House · Snowbound · The Will Reading</div>')

# ---- ratings: a plain yellow rectangle and a plain red circle (no third-party marks)
rep('''  const fs = big ? 25 : 19, chip = big ? 13 : 11, dot = big ? 20 : 16;
  return `<div class="ratings" style="font-size:${fs}px"><span class="r1"><span class="imdb" style="font-size:${chip}px">IMDb</span>${r.imdb}</span>${r.rt ? `<span class="r1"><span class="rt" style="width:${dot}px;height:${dot}px"><i></i></span>${r.rt}</span>` : ""}</div>`;''',
'''  const fs = big ? 25 : 19, cw = big ? 34 : 27, chh = big ? 18 : 14, dot = big ? 20 : 16;
  return `<div class="ratings" style="font-size:${fs}px"><span class="r1"><span class="imdb" style="width:${cw}px;height:${chh}px"></span>${r.imdb}</span>${r.rt ? `<span class="r1"><span class="rt" style="width:${dot}px;height:${dot}px"></span>${r.rt}</span>` : ""}</div>`;''')
rep('.imdb { background: #F5C518; color: #111; font-weight: 800; letter-spacing: .02em; padding: 3px 5px; border-radius: 4px; line-height: 1; }',
    '.imdb { display: inline-block; background: #F5C518; border-radius: 4px; }')
rep('.rt { border-radius: 50%; background: #FA320A; box-shadow: inset 0 -3px 0 rgba(0,0,0,.25); position: relative; display: inline-block; }\n', '.rt { border-radius: 50%; background: #FA320A; display: inline-block; }\n')
import re
m = re.search(r"^\.rt i \{[^\n]*\n", s, re.M); assert m; s = s[:m.start()] + s[m.end():]

# ---- C · friends: messages glide in instead of bouncing
rep('''    tl.fromTo("#cr" + k, { opacity: 0, y: MID + 130, scale: 0.9 }, { opacity: 1, y: MID, scale: 1, duration: 0.5, ease: "back.out(1.5)", immediateRender: false }, t);
    for (let i = 0; i < k; i++) tl.to("#cr" + i, { y: MID - (k - i) * ROW, duration: 0.45, ease: "power3.inOut" }, t);
    inn("#cp" + k, t + 0.2, { opacity: 0, scale: 0.4, rotation: k % 2 ? 14 : -14 }, 0.55, "back.out(1.9)");''',
'''    tl.fromTo("#cr" + k, { opacity: 0, y: MID + 60, scale: 0.97 }, { opacity: 1, y: MID, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, t);
    for (let i = 0; i < k; i++) tl.to("#cr" + i, { y: MID - (k - i) * ROW, duration: 0.55, ease: "power2.inOut" }, t);
    inn("#cp" + k, t + 0.15, { opacity: 0, scale: 0.85, rotation: k % 2 ? 3 : -3 }, 0.5, "power3.out");''')

open(p, "w", encoding="utf-8").write(s)
print("ok")
