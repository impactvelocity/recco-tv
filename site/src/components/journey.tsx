"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { INBOX, PAIRING_CODE, RECCO_NUMBER, THEMES } from "@/lib/content";
import { Poster, Ratings, TvBackground, TvInbox, u } from "./tv";
import { Check, Mic } from "./ui";

const [winterNight, fallDay, fallNight] = THEMES;

type Chapter = { label: string; title: string; body: string; visual: ReactNode };

const CHAPTERS: Chapter[] = [
  {
    label: "TV time",
    title: "The hardest part is picking",
    body: "Nine o’clock, an hour and a half to watch something good. You remember Megan mentioned a show, so you pick up your phone to find it. Forty minutes later, you’re still scrolling.",
    visual: <Scrolling />,
  },
  {
    label: "Connect",
    title: "Connect your number",
    body: "Open Recco on Fire TV and text the code on screen. That’s the whole setup: no app, no account, no password.",
    visual: <Connect />,
  },
  {
    label: "Text it",
    title: "Text it like a friend",
    body: "A show, a link, a mood. Recco works out the title, who recommended it and what they said, and files it for you.",
    visual: <TextIt />,
  },
  {
    label: "Your inbox",
    title: "Sit down to your reccos",
    body: "Every show is on the TV with who sent it and their words. Three shows from one link land together as a stack.",
    visual: <Inbox />,
  },
  {
    label: "Ask Alexa",
    title: "Then just tell Alexa",
    body: "Pick one with the remote and say the line on screen. Your phone stays in the other room.",
    visual: <Alexa />,
  },
];

export function Journey() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="scroll-mt-14 px-4 pt-28 md:px-6 md:pt-40">
      <h2 className="mx-auto max-w-3xl text-balance text-center text-[40px] font-medium leading-[1.05] tracking-[-0.035em] md:text-[64px]">
        From a text to the couch
      </h2>

      <div className="mx-auto mt-16 grid max-w-[1200px] gap-10 md:mt-24 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Chapters" className="hidden lg:block">
          <ol className="sticky top-28 space-y-1">
            {CHAPTERS.map((c, i) => (
              <li key={c.label}>
                <a
                  href={`#ch-${i + 1}`}
                  className={`block py-1.5 text-[17px] transition-colors duration-300 ${i === active ? "text-ink" : "text-muted/70 hover:text-ink-2"}`}
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-28 md:space-y-40">
          {CHAPTERS.map((c, i) => (
            <article
              key={c.label}
              id={`ch-${i + 1}`}
              data-i={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="scroll-mt-28"
            >
              <h3 className="text-balance text-[34px] font-medium leading-[1.05] tracking-[-0.03em] md:text-[48px]">{c.title}</h3>
              <p className="mt-4 max-w-xl text-pretty text-[17px] leading-relaxed text-ink-2">{c.body}</p>
              <div className="mt-8 md:mt-10">{c.visual}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative aspect-[16/10] overflow-hidden rounded-[20px] bg-night ${className}`}>{children}</div>;
}

function Scrolling() {
  return (
    <Card>
      {/* A frame from the film: 9:10pm, still looking for the show Megan mentioned. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/journey/scrolling.jpg" alt="A phone full of message threads in front of the TV at 9:10pm" className="h-full w-full object-cover" />
    </Card>
  );
}

function Connect() {
  return (
    <Card className="grid place-items-center">
      <TvBackground theme={fallDay} />
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
      <div className="relative w-[78%] max-w-[620px]">
        <div className="@container relative aspect-video overflow-hidden rounded-xl shadow-[0_30px_80px_rgba(0,0,0,.5)] ring-1 ring-white/15">
          <TvBackground theme={fallDay} />
          <div className="absolute inset-0 bg-[#555740]/40" />
          <div className="relative flex h-full flex-col items-center justify-center gap-[2.5cqw] text-center text-cream">
            <div className="text-[3.4cqw] text-[#D5CFB9]">On your phone, text</div>
            <div className="flex gap-[1.6cqw]">
              {PAIRING_CODE.split("").map((d, i) => (
                <span
                  key={i}
                  className="grid h-[19cqw] w-[14cqw] place-items-center rounded-[2cqw] border-2 border-white/15 bg-[rgba(41,54,45,.96)] text-[12cqw] font-bold"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="text-[3.6cqw] text-[#D5CFB9]">
              to <b className="text-cream">{RECCO_NUMBER}</b>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-5 -right-4 hidden w-44 rounded-2xl bg-[#111] p-3 shadow-2xl ring-1 ring-white/10 sm:block md:-right-10">
          <div className="text-[11px] text-white/50">To: Recco</div>
          <div className="ml-auto mt-2 w-fit rounded-2xl rounded-br-md bg-sms px-4 py-1.5 text-[20px] font-bold tracking-wide text-white">
            {PAIRING_CODE}
          </div>
          <div className="mt-1 text-right text-[10px] text-white/45">Delivered</div>
        </div>
        <div className="absolute -bottom-4 left-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-ink shadow-xl">
          <Check /> Connected to the phone ending 0189
        </div>
      </div>
    </Card>
  );
}

/** One run of texts on the phone and the card it becomes on the TV. */
type Step = {
  day: string;
  time: string;
  texts: { text?: string; link?: { caption: string; host: string; image: string } }[];
  card: { title: string; meta: string; said: string; from: string; avatar: string; when: string; posters: string[] };
};

const STEPS: Step[] = [
  {
    day: "Tuesday",
    time: "7:42 PM",
    texts: [{ text: "Jill says Two-Car Garage is hilarious" }],
    card: { title: "Two-Car Garage", meta: "Series · 1998–2007", said: "Jill says it’s hilarious", from: "Jill", avatar: "J", when: "Tue", posters: ["two-car-garage"] },
  },
  {
    day: "Thursday",
    time: "12:15 PM",
    texts: [{ link: { caption: "3 cozy comedies for a night in", host: "filmtok.cx", image: "couch-time" } }, { text: "Steph sent this" }],
    card: { title: "3 cozy comedies for a night in", meta: "3 shows · FilmTok", said: "Steph sent this", from: "Steph", avatar: "S", when: "Thu", posters: ["room-104", "couch-time", "away-game"] },
  },
  {
    day: "Today",
    time: "6:03 PM",
    texts: [{ text: "movies for a stormy night" }],
    card: { title: "Stormy Night Movies", meta: "3 picks · each one checked", said: "movies for a stormy night", from: "Recco’s picks", avatar: "✦", when: "now", posters: ["fog-house", "will-reading", "third-floor-mystery"] },
  },
];

/** When each text and card pops in (ms after the section is in view): texts first, then their card. */
const TIMING = STEPS.map((s, i) => {
  const start = 250 + i * 1100;
  return { texts: s.texts.map((_, j) => start + j * 280), card: start + s.texts.length * 280 + 320 };
});

function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

const reveal = (seen: boolean, delay: number, anim = "animate-pop") => ({
  className: seen ? `${anim} motion-reduce:animate-none` : "opacity-0 motion-reduce:opacity-100",
  style: { animationDelay: `${delay}ms` },
});

function TextIt() {
  const t = fallNight;
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="@container relative isolate overflow-hidden rounded-[20px] bg-night" style={{ color: t.text }}>
      <TvBackground theme={t} />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      <div className="relative grid items-center justify-items-center gap-10 px-6 py-10 @2xl:grid-cols-[auto_minmax(0,1fr)] @2xl:justify-items-stretch @2xl:gap-10 @2xl:px-10 @4xl:gap-14 @4xl:px-14 @4xl:py-14">
        <Phone seen={seen} />
        <div className="w-full min-w-0 max-w-[460px]">
          <div className="mb-4 flex items-center gap-2 text-[13px] font-medium" style={{ color: t.text2 }}>
            <span className="size-1.5 rounded-full" style={{ background: t.accent2 }} /> On your TV, sorted
          </div>
          <div className="space-y-3">
            {STEPS.map(({ card: c }, i) => {
              const r = reveal(seen, TIMING[i].card, "animate-rise");
              return (
                <div
                  key={c.title}
                  className={`flex items-center gap-4 rounded-[18px] p-3 ring-1 ring-white/10 backdrop-blur-xl ${r.className}`}
                  style={{
                    ...r.style,
                    background: `rgba(${t.surface},.8)`,
                    boxShadow: "0 20px 50px rgba(0,0,0,.35)",
                  }}
                >
                  <PosterStack posters={c.posters} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold leading-snug tracking-[-0.01em]">{c.title}</div>
                    <div className="mt-0.5 text-[12.5px]" style={{ color: t.text2 }}>
                      {c.meta}
                    </div>
                    <div
                      className="mt-2.5 w-fit max-w-full rounded-[12px_12px_12px_4px] px-3 py-1.5 text-[13.5px] leading-snug"
                      style={{
                        background: `linear-gradient(135deg, ${t.tint[0]}, ${t.tint[1]})`,
                      }}
                    >
                      {c.said}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[12.5px]" style={{ color: t.text2 }}>
                      <span
                        className="grid size-[18px] shrink-0 place-items-center rounded-full text-[9.5px] font-bold"
                        style={{ background: t.accent, color: t.text }}
                      >
                        {c.avatar}
                      </span>
                      <b className="font-semibold" style={{ color: t.text }}>
                        {c.from}
                      </b>
                      · {c.when}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PosterStack({ posters }: { posters: string[] }) {
  const stack = posters.length > 1;
  return (
    <div className="relative h-[92px] w-[78px] shrink-0">
      {posters.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p}
          src={`/posters/${p}.jpg`}
          alt=""
          loading="lazy"
          className="absolute top-1 h-[84px] w-[56px] rounded-[7px] object-cover shadow-[0_10px_24px_rgba(0,0,0,.5)]"
          style={{ left: stack ? i * 11 : 11, transform: stack ? `rotate(${[-7, 0, 7][i]}deg)` : undefined, zIndex: i }}
        />
      ))}
    </div>
  );
}

/** An iPhone in light mode, open to the SMS thread with the Recco number. */
function Phone({ seen }: { seen: boolean }) {
  const ios = { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", var(--font-inter), sans-serif' };
  return (
    // Drawn at 300px and zoomed down in narrow layouts, so the whole thread always fits.
    <div className="relative w-[300px] shrink-0 [zoom:0.9] @4xl:[zoom:1]" style={ios}>
      {/* Side buttons sit just outside the frame. */}
      <span className="absolute -left-[3px] top-[17%] h-[4.5%] w-[4px] rounded-l-[2px] bg-[#3b3b3e]" />
      <span className="absolute -left-[3px] top-[25%] h-[8.5%] w-[4px] rounded-l-[2px] bg-[#3b3b3e]" />
      <span className="absolute -left-[3px] top-[35.5%] h-[8.5%] w-[4px] rounded-l-[2px] bg-[#3b3b3e]" />
      <span className="absolute -right-[3px] top-[27%] h-[13%] w-[4px] rounded-r-[2px] bg-[#3b3b3e]" />

      <div className="relative aspect-[71.5/147] rounded-[46px] bg-[linear-gradient(150deg,#6b6b70,#2c2c2f_22%,#1c1c1e_60%,#55555a)] p-[3px] shadow-[0_50px_100px_-20px_rgba(0,0,0,.8),0_30px_60px_-30px_rgba(0,0,0,.6)]">
        <div className="h-full rounded-[43px] bg-black p-[9px]">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] bg-white text-black">
            {/* Status bar and conversation header share the frosted top. */}
            <div className="relative z-10 border-b border-black/[0.08] bg-[#f6f6f7]">
              <div className="grid h-[44px] grid-cols-[1fr_88px_1fr] items-center pt-[2px] text-[15px] font-semibold">
                <span className="text-center">6:04</span>
                <span className="h-[26px] rounded-full bg-black" />
                <span className="flex items-center justify-center gap-[5px]">
                  <svg viewBox="0 0 18 12" className="h-[10px] w-[16px] fill-current">
                    <rect x="0" y="8" width="3" height="4" rx="1" />
                    <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                    <rect x="10" y="3" width="3" height="9" rx="1" />
                    <rect x="15" y="0" width="3" height="12" rx="1" />
                  </svg>
                  <svg viewBox="0 0 16 12" className="h-[10px] w-[14px] fill-current">
                    <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.3-1.3A10.6 10.6 0 0 0 8 .5C5.2.5 2.6 1.6.7 3.5L2 4.8a8.7 8.7 0 0 1 6-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.3A6.6 6.6 0 0 0 8 4.1c-1.8 0-3.5.7-4.7 1.9l1.3 1.3C5.5 6.5 6.7 6 8 6zm0 3.5c-.6 0-1.1.2-1.5.6L8 11.6l1.5-1.5c-.4-.4-.9-.6-1.5-.6z" />
                  </svg>
                  <svg viewBox="0 0 27 13" className="h-[11px] w-[24px]">
                    <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" strokeOpacity=".35" />
                    <rect x="2" y="2" width="15" height="9" rx="2" fill="currentColor" />
                    <path d="M24 4.5v4c.9-.3 1.5-1.1 1.5-2s-.6-1.7-1.5-2z" fill="currentColor" fillOpacity=".4" />
                  </svg>
                </span>
              </div>
              <div className="relative flex flex-col items-center gap-1 pb-2.5 pt-0.5">
                <svg
                  viewBox="0 0 12 20"
                  className="absolute left-3.5 top-3 h-[18px] w-[11px] fill-none stroke-[#0a84ff] stroke-[2.6]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 2 2 10l8 8" />
                </svg>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/app-icon.png" alt="" className="size-[42px] rounded-full" />
                <div className="flex items-center gap-0.5 text-[11px] font-medium">
                  Recco
                  <svg
                    viewBox="0 0 8 12"
                    className="h-[8px] w-[5px] fill-none stroke-[#8e8e93] stroke-[2]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m2 2 4 4-4 4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* The thread, scrolled to the latest text. */}
            <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-3 pb-1">
              {STEPS.map((s, i) => (
                <div key={s.day}>
                  <div
                    style={reveal(seen, TIMING[i].texts[0]).style}
                    className={`pb-1.5 pt-3 text-center text-[10.5px] text-[#8e8e93] ${reveal(seen, 0).className}`}
                  >
                    <b className="font-semibold">{s.day}</b> {s.time}
                  </div>
                  <div className="space-y-[3px]">
                    {s.texts.map((m, j) => {
                      const r = reveal(seen, TIMING[i].texts[j]);
                      const last = j === s.texts.length - 1;
                      return m.link ? (
                        <div
                          key={j}
                          style={r.style}
                          className={`ml-auto w-[76%] origin-bottom-right overflow-hidden rounded-[17px] bg-[#e9e9eb] ${r.className}`}
                        >
                          <div className="relative h-[86px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/posters/${m.link.image}.jpg`} alt="" className="h-full w-full object-cover object-[50%_30%]" />
                            <span className="absolute inset-0 grid place-items-center bg-black/15">
                              <span className="grid size-8 place-items-center rounded-full bg-black/45 backdrop-blur">
                                <svg viewBox="0 0 24 24" className="ml-0.5 size-4 fill-white">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </span>
                            </span>
                          </div>
                          <div className="px-3 py-2">
                            <div className="text-[12.5px] font-semibold leading-snug">{m.link.caption}</div>
                            <div className="text-[11px] text-[#8e8e93]">{m.link.host}</div>
                          </div>
                        </div>
                      ) : (
                        <div key={j} style={r.style} className={`flex origin-bottom-right justify-end ${r.className}`}>
                          <div
                            className={`relative max-w-[76%] rounded-[17px] bg-sms px-3 py-[7px] text-[14px] leading-[1.3] text-white ${last ? "sms-tail" : ""}`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div
                style={reveal(seen, TIMING[2].texts[0] + 300).style}
                className={`pr-1 pt-1 text-right text-[10.5px] font-medium text-[#8e8e93] ${reveal(seen, 0).className}`}
              >
                Delivered
              </div>
            </div>

            {/* Compose bar and home indicator. */}
            <div className="flex items-center gap-2 px-3 pt-2">
              <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#e9e9eb]">
                <svg viewBox="0 0 16 16" className="size-3.5 stroke-[#7c7c80] stroke-2" strokeLinecap="round">
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </span>
              <div className="flex h-[32px] min-w-0 flex-1 items-center justify-between rounded-full border border-[#d1d1d6] pl-3 pr-2.5 text-[13.5px] text-[#b4b4b9]">
                Text Message
                <Mic className="size-4 text-[#9a9a9f]" />
              </div>
            </div>
            <div className="flex justify-center pb-2 pt-4">
              <span className="h-[5px] w-[100px] rounded-full bg-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inbox() {
  return (
    <div className="overflow-hidden rounded-[20px] bg-night shadow-[0_30px_80px_rgba(20,20,20,.18)]">
      <TvInbox theme={winterNight} cards={INBOX} focusedId="cozy" video />
    </div>
  );
}

/** The detail drawer over a blurred inbox, at the design's 1920×1080 sizes. */
function Alexa() {
  const t = fallNight;
  const garage = INBOX[1];
  return (
    <div className="relative">
      <div className="@container relative aspect-video overflow-hidden rounded-[20px] bg-night" style={{ color: t.text }}>
        <div className="absolute inset-0 scale-105 blur-[3px]">
          <TvInbox theme={t} cards={INBOX} />
        </div>
        <div className="absolute inset-0 bg-black/45" />
        <div
          className="absolute flex flex-col"
          style={{
            right: u(24),
            top: u(24),
            bottom: u(24),
            width: u(760),
            padding: `${u(48)} ${u(52)}`,
            gap: u(30),
            borderRadius: u(28),
            background: `rgba(${t.surface},.96)`,
            boxShadow: "0 40px 120px rgba(0,0,0,.6)",
          }}
        >
          <div className="flex" style={{ gap: u(28) }}>
            <Poster slug="two-car-garage" w={200} h={300} radius={16} />
            <div className="flex flex-col" style={{ gap: u(12) }}>
              <div className="font-bold" style={{ fontSize: u(46), lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                {garage.title}
              </div>
              <div style={{ fontSize: u(19), color: t.text2 }}>Series · 1998–2007 · 22 min · Sitcom</div>
              <Ratings imdb={garage.imdb} rt={garage.rt} color={t.text} />
            </div>
          </div>
          <p style={{ fontSize: u(26), lineHeight: 1.5, color: t.text2 }}>
            A delivery driver and his wife share their house, and the garage TV, with her stubborn father.
          </p>
          <div style={{ height: 1, background: "rgba(255,255,255,.1)" }} />
          <div className="flex items-start" style={{ gap: u(16) }}>
            <span className="grid shrink-0 place-items-center rounded-full font-bold" style={{ width: u(40), height: u(40), fontSize: u(20), background: t.accent }}>
              J
            </span>
            <div>
              <div style={{ fontSize: u(19), color: t.text2 }}>
                <b style={{ color: t.text }}>Jill</b> · now
              </div>
              <div style={{ fontSize: u(22) }}>Jill says it’s hilarious</div>
            </div>
          </div>
          <div className="mt-auto flex items-center" style={{ gap: u(18), padding: u(18), borderRadius: u(16), background: "rgba(255,255,255,.06)" }}>
            <span className="grid shrink-0 place-items-center rounded-full" style={{ width: u(44), height: u(44), background: t.accent2, color: t.onAccent }}>
              <Mic className="size-[55%]" />
            </span>
            <div>
              <div style={{ fontSize: u(19), color: t.text2 }}>To watch, say</div>
              <div style={{ fontSize: u(25), fontWeight: 500 }}>“Alexa, watch Two-Car Garage”</div>
            </div>
          </div>
          <div className="flex" style={{ gap: u(14), fontSize: u(23), fontWeight: 600 }}>
            {["✓ Mark Watched", "Remove", "‹ Back"].map((b, i) => (
              <span
                key={b}
                style={{
                  padding: `${u(14)} ${u(24)}`,
                  borderRadius: u(14),
                  border: "1px solid rgba(255,255,255,.18)",
                  outline: i === 0 ? `${u(3)} solid ${t.focus}` : undefined,
                  background: i === 0 ? `rgb(${t.surface})` : undefined,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-6 shadow-[0_20px_50px_rgba(20,20,20,.25)] md:-bottom-8 md:left-10 md:py-3 md:pl-3 md:pr-8">
        <span className="grid size-10 place-items-center rounded-full bg-orange text-white md:size-12">
          <Mic className="size-5 md:size-6" />
        </span>
        <span>
          <span className="block text-[12px] text-muted">Then just say</span>
          <span className="block text-[16px] font-semibold md:text-[20px]">“Alexa, watch Two-Car Garage”</span>
        </span>
      </div>
    </div>
  );
}
