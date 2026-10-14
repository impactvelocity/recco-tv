import type { ReactNode } from "react";
import { INBOX, PAIRING_CODE, RECCO_NUMBER, THEMES } from "@/lib/content";
import { SmsBubble } from "./phone";
import { fitWidth, PlaceholderCard, Poster, TvBackground, TvCard, TvFrame, TvInbox } from "./tv";
import { Check, Mic, NumberBadge, SectionHead } from "./ui";

const fallNight = THEMES[2];
const fallDay = THEMES[1];

function Step({ n, kicker, title, body, children }: { n: number; kicker: string; title: string; body: string; children: ReactNode }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[26px] border border-line bg-panel/80">
      <div className="p-7 pb-5 md:p-8 md:pb-6">
        <div className="flex items-center gap-3">
          <NumberBadge n={n} />
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-amber">{kicker}</span>
        </div>
        <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em]">{title}</h3>
        <p className="mt-2.5 leading-relaxed text-ink-2">{body}</p>
      </div>
      <div className="flex flex-1 flex-col justify-center px-5 pb-7 md:px-6 md:pb-8">{children}</div>
    </article>
  );
}

function Pairing() {
  return (
    <div className="relative">
      <div className="@container relative aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10">
        <TvBackground theme={fallDay} />
        <div className="absolute inset-0 bg-[#555740]/40" />
        <div className="relative flex h-full flex-col items-center justify-center gap-[2.5cqw] text-center">
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
            to <b className="text-[#FFF7E8]">{RECCO_NUMBER}</b>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-line bg-[#1a1f1e] px-3.5 py-2 text-[13px] font-medium shadow-xl">
        <Check /> Connected to the phone ending 0189
      </div>
    </div>
  );
}

const KINDS: { label: string; hint: string; msg: Parameters<typeof SmsBubble>[0]["message"] }[] = [
  { label: "A friend’s pick", hint: "Name who said it", msg: { kind: "text", text: "Dad says Desk Nine is brilliant" } },
  { label: "A link", hint: "TikTok, YouTube, articles", msg: { kind: "link", caption: "3 cozy comedies for a night in", host: "filmtok.cx · from Steph" } },
  { label: "A mood or a search", hint: "Recco picks a few", msg: { kind: "text", text: "movies for a stormy night" } },
  { label: "Just a title", hint: "A note to yourself", msg: { kind: "text", text: "Floor Thirteen" } },
];

function TextKinds() {
  return (
    <div className="space-y-3 rounded-2xl bg-black/60 p-4 ring-1 ring-white/10">
      {KINDS.map((k) => (
        <div key={k.label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3">
          <div>
            <div className="text-[13.5px] font-semibold">{k.label}</div>
            <div className="text-[12px] text-muted">{k.hint}</div>
          </div>
          <SmsBubble message={k.msg} className="!w-full !max-w-none" />
        </div>
      ))}
    </div>
  );
}

function Agent() {
  return (
    <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="max-w-[9.5rem] truncate text-[12px] text-[#8fb6ff] underline">filmtok.cx/@steph/74…</div>
          <div className="w-fit rounded-xl rounded-bl-sm bg-sms px-3 py-1.5 text-[13px] text-white">Steph sent this</div>
        </div>
        <div className="relative grid size-14 shrink-0 place-items-center rounded-full border border-amber/40 sm:size-20 bg-gradient-to-br from-[#5a2e18] to-[#2a1a10] shadow-[0_0_40px_rgba(211,99,45,.35)]">
          <svg viewBox="0 0 24 24" className="size-7 text-amber" fill="currentColor">
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
          </svg>
        </div>
        <div className="flex shrink-0 -space-x-3">
          {["room-104", "away-game", "couch-time"].map((p) => (
            <div key={p} className="relative">
              <div className="@container w-11" style={fitWidth(44)}>
                <Poster slug={p} w={44} h={66} radius={5} />
              </div>
              <Check className="absolute -bottom-1.5 -right-1 size-4 ring-2 ring-panel" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["read_post", "find_titles", "list_friends", "save_cards"].map((t) => (
          <code key={t} className="rounded-md border border-line bg-white/[0.04] px-2 py-0.5 text-[11.5px] text-ink-2">
            {t}
          </code>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
        {[
          ["Friend", "Steph"],
          ["Shows", "Room 104, Away Game, Couch Time"],
          ["Her words", "“my three comfort shows”"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-white/[0.03] p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber">{k}</div>
            <div className="mt-1 leading-snug text-ink">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadsIn() {
  const garage = INBOX[1];
  return (
    <div className="relative pb-2">
      <div className="w-[78%] opacity-70">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber">
          Right away <span className="font-medium normal-case tracking-normal text-muted">a placeholder</span>
        </div>
        <div className="@container overflow-hidden rounded-xl" style={fitWidth(557)}>
          <PlaceholderCard theme={fallNight} />
        </div>
      </div>
      <div className="relative -mt-[34%] ml-auto w-[82%]">
        <div className="mb-2 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-amber">
          Seconds later <span className="font-medium normal-case tracking-normal text-muted">the real card</span>
        </div>
        <div className="@container overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(0,0,0,.55)] ring-2 ring-[#E28A3B]" style={fitWidth(557)}>
          <TvCard card={garage} theme={fallNight} />
        </div>
      </div>
    </div>
  );
}

function Library() {
  return (
    <div>
      <TvFrame>
        <TvInbox theme={fallNight} cards={INBOX} focusedId="cozy" />
      </TvFrame>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Jill", "Mom", "Steph", "Recco’s picks", "From me"].map((n) => (
          <span key={n} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.04] py-1 pl-1 pr-3 text-[13px]">
            <span className="grid size-5 place-items-center rounded-full bg-orange/80 text-[10px] font-bold">{n === "Recco’s picks" ? "✦" : n === "From me" ? "Me" : n[0]}</span>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function AskAlexa() {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-[rgba(18,28,30,.96)] p-5 pb-10 ring-1 ring-white/10">
        <div className="flex gap-4">
          <div className="@container w-24 shrink-0" style={fitWidth(200)}>
            <Poster slug="two-car-garage" w={200} h={300} radius={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold tracking-[-0.02em]">Two-Car Garage</div>
            <div className="mt-1 text-[12.5px] text-[#C4CAC0]">Series · 1998–2007 · 22 min · Sitcom</div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#C4CAC0]">
              A delivery driver and his wife share their house, and the garage TV, with her stubborn father.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[12.5px] text-[#C4CAC0]">
              <span className="grid size-5 place-items-center rounded-full bg-[#C8572F] text-[10px] font-bold text-white">J</span>
              <span>
                <b className="text-ink">Jill</b> · now — “Jill says it’s hilarious”
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 text-[12px] font-semibold">
          <span className="rounded-lg px-3 py-1.5 outline-2 outline-[#E28A3B] bg-[#121c1e]">✓ Mark Watched</span>
          <span className="rounded-lg border border-white/15 px-3 py-1.5 text-ink-2">Remove</span>
          <span className="rounded-lg border border-white/15 px-3 py-1.5 text-ink-2">‹ Back</span>
        </div>
      </div>
      <div className="relative -mt-5 mx-auto flex w-fit items-center gap-3 rounded-full border border-amber/40 bg-[#1c1712] py-2.5 pl-2.5 pr-6 shadow-[0_20px_50px_rgba(0,0,0,.5)]">
        <span className="grid size-10 place-items-center rounded-full bg-orange">
          <Mic className="size-5 text-white" />
        </span>
        <span>
          <span className="block text-[12px] text-muted">Then just say</span>
          <span className="block text-[17px] font-semibold">“Alexa, watch Two-Car Garage”</span>
        </span>
      </div>
    </div>
  );
}

export function Steps() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-line/60 bg-bg-deep">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <SectionHead eyebrow="How it works" title="From a text to the couch," accent="in six steps.">
          No phone app, no password, and Recco never texts back. Capture is a text message. Everything else happens on the
          TV, with the remote and your voice.
        </SectionHead>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Step n={1} kicker="Sign up" title="Connect your phone" body="First launch shows a five-digit code. Text it to the Recco number and the TV is yours.">
            <Pairing />
          </Step>
          <Step n={2} kicker="Send texts" title="Text it anything" body="A friend’s pick, a link, a mood, or a half-remembered title. Free form, the way you’d text a friend.">
            <TextKinds />
          </Step>
          <Step n={3} kicker="Recco agent" title="The agent does the work" body="It reads the text or the post, works out the show, who sent it and what they said. Every title is checked, never invented.">
            <Agent />
          </Step>
          <Step n={4} kicker="Loading in" title="A card loads in" body="A placeholder lands on the TV the moment you hit send, then turns into the finished card.">
            <LoadsIn />
          </Step>
          <Step n={5} kicker="Your library" title="Build your recco library" body="Every show, who recommended it and their words, waiting on the TV. One link with three shows becomes a stack.">
            <Library />
          </Step>
          <Step n={6} kicker="Watch it" title="Ask Alexa to watch it" body="Pick a card with the remote and say the line on screen. The phone can stay in the other room.">
            <AskAlexa />
          </Step>
        </div>
      </div>
    </section>
  );
}
