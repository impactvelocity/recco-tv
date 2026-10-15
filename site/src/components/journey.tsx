"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { INBOX, PAIRING_CODE, RECCO_NUMBER, THEMES } from "@/lib/content";
import { fitWidth, Poster, Ratings, TvBackground, TvInbox, u } from "./tv";
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

type Sent = { when: string; text?: string; link?: { caption: string; host: string } };

/** The thread on the phone. Each group becomes one entry on the TV. */
const THREAD: Sent[][] = [
  [{ when: "Tue 7:42 PM", text: "Jill says Two-Car Garage is hilarious" }],
  [{ when: "Thu 12:15 PM", link: { caption: "3 cozy comedies for a night in", host: "filmtok.cx" } }, { when: "", text: "Steph sent this" }],
  [{ when: "Today 6:03 PM", text: "movies for a stormy night" }],
];

const SORTED: { title: string; from: string; avatar: string; note: string; tag: string; posters: string[] }[] = [
  { title: "Two-Car Garage", from: "Jill", avatar: "J", note: "“hilarious”", tag: "Sitcom · 1998", posters: ["two-car-garage"] },
  { title: "3 cozy comedies", from: "Steph", avatar: "S", note: "One post, three shows", tag: "Stack of 3", posters: ["room-104", "couch-time", "away-game"] },
  { title: "Stormy Night Movies", from: "Recco’s picks", avatar: "✦", note: "Each one checked", tag: "Stack of 3", posters: ["fog-house", "will-reading", "third-floor-mystery"] },
];

function TextIt() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[20px] bg-[linear-gradient(140deg,#fbeedb_0%,#f6d2a8_55%,#efa66b_100%)] md:grid-cols-2">
      {/* The phone: a plain thread with the Recco number. */}
      <div className="flex justify-center px-6 pt-10 md:px-10 md:py-12">
        <div className="w-full max-w-[320px] overflow-hidden rounded-t-[36px] bg-white shadow-[0_30px_70px_rgba(140,60,10,.25)] md:rounded-[36px]">
          <div className="flex flex-col items-center gap-1 border-b border-line/70 pb-3 pt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/app-icon.png" alt="" className="size-10 rounded-full" />
            <div className="text-[13px] font-semibold">Recco</div>
          </div>
          <div className="space-y-2 px-4 pb-6 pt-3">
            {THREAD.flat().map((m, i) => (
              <div key={i}>
                {m.when && <div className="py-2 text-center text-[11px] text-muted">{m.when}</div>}
                {m.link ? (
                  <div className="ml-auto w-[80%] overflow-hidden rounded-2xl rounded-br-md bg-paper-2">
                    <div className="grid h-20 place-items-center bg-gradient-to-br from-[#3a2a4a] via-[#6b3a3a] to-[#c0612f]">
                      <svg viewBox="0 0 24 24" className="size-6 fill-white/90">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="px-3 py-2">
                      <div className="text-[13px] font-semibold leading-snug">{m.link.caption}</div>
                      <div className="text-[11px] text-muted">{m.link.host}</div>
                    </div>
                  </div>
                ) : (
                  <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-sms px-3.5 py-2 text-[14px] leading-snug text-white">
                    {m.text}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-0.5 text-right text-[11px] text-muted">Delivered</div>
          </div>
        </div>
      </div>

      {/* What lands on the TV. */}
      <div className="flex flex-col justify-center gap-3 bg-night p-6 md:rounded-none md:p-10">
        <div className="mb-1 flex items-center gap-2 text-[13px] text-white/55">
          <span className="size-1.5 rounded-full bg-amber" /> On your TV, sorted
        </div>
        {SORTED.map((c) => (
          <div key={c.title} className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
            <div className="relative h-[66px] w-[60px] shrink-0">
              {c.posters.map((p, i) => (
                <div
                  key={p}
                  className="@container absolute top-0 w-11"
                  style={{ ...fitWidth(44), left: c.posters.length > 1 ? i * 8 : 8, transform: c.posters.length > 1 ? `rotate(${[-6, 0, 6][i]}deg)` : undefined, zIndex: i }}
                >
                  <Poster slug={p} w={44} h={66} radius={6} />
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[16px] font-semibold text-cream">{c.title}</div>
              <div className="mt-1 flex items-center gap-2 text-[13px] text-white/60">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-orange text-[10px] font-bold text-white">{c.avatar}</span>
                <span className="truncate">
                  <b className="font-medium text-white/85">{c.from}</b> · {c.note}
                </span>
              </div>
            </div>
            <span className="hidden shrink-0 rounded-full bg-amber/15 px-2.5 py-1 text-[11.5px] font-medium text-amber sm:block">{c.tag}</span>
          </div>
        ))}
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
