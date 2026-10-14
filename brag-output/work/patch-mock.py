# Mock posters and titles everywhere, and "a really good show" becomes the browse scene.
import sys
p = "composition/src/build.mjs"
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"expected {count} of {old[:70]!r}, found {n}")
    s = s.replace(old, new)

# ---- data: mock titles (same as docs/diagram/app-stages.html)
rep('koq: { title: "The King of Queens", type: "Series", year: "1998–2007", imdb: "7.4", rt: "65%", runtime: "22 min", genre: "Sitcom", poster: "king-of-queens", from: "Jill", msg: "Jill says it’s hilarious", time: "now", synopsis: "A Queens delivery driver and his wife share their home, and their big TV, with her eccentric father." }',
    'koq: { title: "Two-Car Garage", type: "Series", year: "1998–2007", imdb: "7.4", rt: "65%", runtime: "22 min", genre: "Sitcom", poster: "two-car-garage", from: "Jill", msg: "Jill says it’s hilarious", time: "now", synopsis: "A delivery driver and his wife share their house, and the garage TV, with her stubborn father." }')
rep('title: "Slow Horses", type: "Series", year: "2022–", imdb: "8.2", rt: "98%", poster: "slow-horses"', 'title: "Desk Nine", type: "Series", year: "2022–", imdb: "8.2", rt: "98%", poster: "desk-nine"')
rep('title: "The Bear", type: "Series", year: "2022–", imdb: "8.5", rt: "99%", poster: "the-bear", from: "Sarah", also: ["D"], fromLabel: "Sarah & Dad", msg: "you HAVE to watch The Bear,',
    'title: "Back of House", type: "Series", year: "2022–", imdb: "8.5", rt: "99%", poster: "back-of-house", from: "Sarah", also: ["D"], fromLabel: "Sarah & Dad", msg: "you HAVE to watch Back of House,')
rep('title: "Severance", type: "Series", year: "2022–", imdb: "8.7", rt: "97%", poster: "severance", from: "Mom", also: ["S"], fromLabel: "Mom & Sarah", msg: "Severance!! your dad',
    'title: "Floor Thirteen", type: "Series", year: "2022–", imdb: "8.7", rt: "97%", poster: "floor-thirteen", from: "Mom", also: ["S"], fromLabel: "Mom & Sarah", msg: "Floor Thirteen!! your dad')
rep('title: "Past Lives", type: "Film", year: "2023", imdb: "7.8", rt: "95%", poster: "past-lives"', 'title: "Second Summer", type: "Film", year: "2023", imdb: "7.8", rt: "95%", poster: "second-summer"')
rep('title: "Shrinking", type: "Series", year: "2023–", imdb: "8.0", rt: "91%", poster: "shrinking", from: "Mom", msg: "Harrison Ford is in it!! we laughed the whole time"',
    'title: "Room 104", type: "Series", year: "2023–", imdb: "8.0", rt: "91%", poster: "room-104", from: "Mom", msg: "the school one!! we laughed the whole time"')
rep('title: "Dune: Part Two", type: "Film", year: "2024", imdb: "8.5", rt: "92%", poster: "dune-2", from: "Me", msg: "note to self: watch before Part Three comes out"',
    'title: "Away Game", type: "Film", year: "2024", imdb: "8.5", rt: "92%", poster: "away-game", from: "Me", msg: "note to self: save this for a rainy Sunday"')
rep('title: "Knives Out", type: "Film", year: "2019", imdb: "7.9", rt: "97%", runtime: "2h 10m", genre: "Mystery", poster: "knives-out",',
    'title: "Floor Thirteen", type: "Series", year: "2022–", imdb: "8.7", rt: "97%", runtime: "50 min", genre: "Thriller", poster: "floor-thirteen",')
rep('synopsis: "A detective untangles the death of a crime novelist, one lying relative at a time."', 'synopsis: "A new hire finds a floor that isn’t on any of the building’s plans, and a lift that only goes there at night."')
rep('title: "Ted Lasso", type: "Series", year: "2020–", imdb: "8.7", rt: "", poster: "ted-lasso"', 'title: "Couch Time", type: "Series", year: "2020–", imdb: "8.7", rt: "", poster: "couch-time"')
rep('items: ["abbott", "ted-lasso", "only-murders"]', 'items: ["room-104", "away-game", "couch-time"]')

# ---- B · phone feed and C · friends
rep('["the-bear", "kitchen.confidential"', '["back-of-house", "kitchen.confidential"')
rep('["shining", "frightnight.club", "rating every horror movie I watched in October"', '["floor-thirteen", "latenight.club", "rating every thriller I watched in October"')
rep('["dune-2", "desert.cinema"', '["away-game", "matchday.cinema"')
rep('["only-murders", "podcast.brain", "3 mysteries to start tonight"', '["room-104", "comfort.tv", "3 comedies to start tonight"')
rep('["past-lives", "film.notes"', '["second-summer", "film.notes"')
rep('["Jill", "That sitcom is hilarious, you’d love it", "king-of-queens"]', '["Jill", "That sitcom is hilarious, you’d love it", "two-car-garage"]')
rep('["Mom", "Severance!! your dad and I are hooked", "severance"]', '["Mom", "Floor Thirteen!! your dad and I are hooked", "floor-thirteen"]')
rep('["Steph", "Sent a video: 3 comfort shows", "abbott"]', '["Steph", "Sent a video: 3 comfort shows", "room-104"]')
rep('["Sarah", "you HAVE to watch The Bear", "the-bear"]', '["Sarah", "you HAVE to watch Back of House", "back-of-house"]')
rep('["Dad", "Slow Horses. Very British, very funny", "slow-horses"]', '["Dad", "Desk Nine. Very British, very funny", "desk-nine"]')

# ---- D+E phone texts, O inputs and OMDb check
rep('text: "Dad says Slow Horses is brilliant"', 'text: "Dad says Desk Nine is brilliant"')
rep('text: "Jill says King of Queens is hilarious"', 'text: "Jill says Two-Car Garage is hilarious"')
rep('<div class="sms obub" id="oIn0">Slow Horses</div>', '<div class="sms obub" id="oIn0">Desk Nine</div>')
rep('const oPosters = [["the-others", "The Others", "2001"], ["shining", "The Shining", "1980"], ["knives-out", "Knives Out", "2019"]];',
    'const oPosters = [["floor-thirteen", "Floor Thirteen", "2022"], ["away-game", "Away Game", "2024"], ["second-summer", "Second Summer", "2023"]];')
rep('<div class="ov">The Others · The Shining · Knives Out</div>', '<div class="ov">Floor Thirteen · Away Game · Second Summer</div>')

open(p, "w", encoding="utf-8").write(s)
print("ok")
