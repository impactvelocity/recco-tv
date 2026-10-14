import { INBOX, REPO_URL, THEMES } from "@/lib/content";
import { Phone, SmsBubble, type Message } from "./phone";
import { TvBackground, TvFrame, TvInbox } from "./tv";
import { ButtonLink } from "./ui";

const winterNight = THEMES[0];

const HERO_TEXTS: Message[] = [
  { kind: "text", text: "Jill says Two-Car Garage is hilarious" },
  { kind: "link", caption: "3 cozy comedies for a night in", host: "filmtok.cx · from Steph" },
  { kind: "text", text: "movies for a stormy night" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <a href="#top" aria-label="Recco home" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/recco-logo.png" alt="Recco" className="h-8 w-auto" />
        </a>
        <div className="hidden items-center gap-8 text-[14px] font-medium text-ink-2 md:flex">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#anything" className="hover:text-ink">Send it anything</a>
          <a href="#agent" className="hover:text-ink">The agent</a>
          <a href="#seasons" className="hover:text-ink">Seasons</a>
          <a href="#privacy" className="hover:text-ink">Privacy</a>
        </div>
        <a
          href="#film"
          className="rounded-full bg-amber px-4 py-2 text-[14px] font-semibold text-[#2a1a10] transition hover:bg-[#f5c788]"
        >
          Watch the film
        </a>
      </nav>
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-16">
      {/* The TV app's own background: season still, looping video, vignette. */}
      <div className="absolute inset-0 -z-10">
        <TvBackground theme={winterNight} video />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/30 to-bg" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-rise mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.06] px-4 py-1.5 text-[13px] font-medium text-ink-2 backdrop-blur">
            <span className="size-1.5 rounded-full bg-amber" />
            <span className="sm:hidden">Fire TV · Amazon hackathon</span>
            <span className="hidden sm:inline">Built for Fire TV · Amazon Developer Hackathon</span>
          </div>
          <h1 className="animate-rise text-balance text-5xl font-bold leading-[0.98] tracking-[-0.035em] [animation-delay:80ms] sm:text-6xl md:text-7xl">
            An inbox of things to watch, <span className="text-amber">on&nbsp;Fire&nbsp;TV.</span>
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-2 [animation-delay:160ms] md:text-xl">
            Text a show to one number. When you sit down to watch, Recco has the list, who recommended each one,
            and what they said. Then just tell Alexa which one.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap justify-center gap-3 [animation-delay:240ms]">
            <ButtonLink href="#film">
              <svg viewBox="0 0 24 24" className="size-4 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch the 2-minute film
            </ButtonLink>
            <ButtonLink href={REPO_URL} variant="ghost" external>
              Read the code
            </ButtonLink>
          </div>
        </div>

        <div className="animate-rise relative mx-auto mt-16 max-w-5xl [animation-delay:320ms] md:mt-20">
          <TvFrame>
            <TvInbox theme={winterNight} cards={INBOX} focusedId="cozy" />
          </TvFrame>
          <div className="absolute -bottom-10 -left-4 hidden origin-bottom-left scale-[.85] md:block lg:-left-16 lg:scale-100">
            <Phone className="animate-float">
              {HERO_TEXTS.map((m, i) => (
                <SmsBubble key={i} message={m} className="animate-rise" />
              ))}
            </Phone>
          </div>
        </div>
      </div>
    </section>
  );
}

const EVENING = [
  { time: "9:00", line: "Tea, snacks, and an hour and a half before bed for a really good show." },
  { time: "9:10", line: "But most nights, I spend ten minutes searching." },
  { time: "9:50", line: "Then I remember Megan mentioned a show, so I grab my phone to find it… forty minutes later, I’m still scrolling." },
  { time: "9:58", line: "Now there’s no time for anything. Not exactly me time." },
];

export function Evening() {
  return (
    <section className="relative border-t border-line/60 bg-bg-deep">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">Most nights</div>
            <h2 className="mt-4 text-5xl font-bold tracking-[-0.03em] md:text-6xl">
              9pm<span className="text-amber">.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
              The best shows come from people: a friend at dinner, a TikTok, a stray thought. By the time you sit down,
              they’re buried in a dozen threads, and the phone that has them is the thing that eats the evening.
            </p>
          </div>
          <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[39px] before:top-6 before:w-px before:bg-line">
            {EVENING.map((e, i) => (
              <li key={e.time} className="relative flex gap-5">
                <span
                  className={`relative z-10 w-20 shrink-0 rounded-full border py-1.5 text-center text-[15px] font-semibold tabular-nums ${
                    i === EVENING.length - 1 ? "border-orange/50 bg-orange/15 text-[#f3b08c]" : "border-line bg-panel text-ink"
                  }`}
                >
                  {e.time}
                  <span className="ml-0.5 text-[10px] text-muted">PM</span>
                </span>
                <p className="pt-1 text-lg leading-relaxed text-ink-2">{e.line}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-24 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">So now I use Recco</p>
          <p className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">
            An inbox for my TV that I <span className="text-amber">text like a friend.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
