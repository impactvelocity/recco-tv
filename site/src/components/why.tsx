import type { ReactNode } from "react";
import { HACKATHON_URL, REPO_URL } from "@/lib/content";
import { Logo } from "./ui";

function Bubble({ children }: { children: ReactNode }) {
  return (
    <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-sms px-4 py-2.5 text-[15px] leading-snug text-white">
      {children}
    </div>
  );
}

const REASONS: { bubble: ReactNode; title: string; body: string }[] = [
  {
    bubble: <Bubble>Floor Thirteen</Bubble>,
    title: "Nothing to install",
    body: "Any phone, in the messages app you already have.",
  },
  {
    bubble: <Bubble>Jill says Two-Car Garage is hilarious</Bubble>,
    title: "Catch it in the moment",
    body: "At dinner or mid-scroll. Send it before you forget.",
  },
  {
    bubble: (
      <div className="ml-auto w-[90%] overflow-hidden rounded-2xl rounded-br-md bg-[#1d2120]">
        <div className="h-10 bg-gradient-to-br from-[#3a2a4a] via-[#6b3a3a] to-[#c0612f]" />
        <div className="px-3.5 py-2 text-[14px] font-medium text-white">3 cozy comedies for a night in</div>
      </div>
    ),
    title: "Send it anything",
    body: "A title, a link, a list, or a half-remembered plot.",
  },
  {
    bubble: (
      <div>
        <Bubble>movies for a rainy night</Bubble>
        <div className="mt-1 text-right text-[11px] text-muted">Delivered</div>
      </div>
    ),
    title: "No replies, no pings",
    body: "Recco never texts back. The list waits on the TV.",
  },
];

export function Why() {
  return (
    <section id="why" className="scroll-mt-14 px-4 pt-32 md:px-6 md:pt-48">
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <h2 className="text-balance text-[40px] font-medium leading-[1.05] tracking-[-0.035em] md:text-[64px]">Why a text?</h2>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-2 md:text-lg">
            Recommendations already arrive in your messages. Recco meets them there, and keeps your phone out of the evening.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <div key={r.title} className="flex flex-col rounded-[20px] bg-paper-2 p-5">
              <div className="flex min-h-36 flex-col justify-center rounded-2xl bg-white p-4 shadow-[0_1px_0_rgba(20,20,20,.04)]">{r.bubble}</div>
              <h3 className="mt-6 text-[20px] font-medium tracking-[-0.015em]">{r.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Demo() {
  return (
    <section id="demo" className="scroll-mt-20 px-3 py-32 md:px-4 md:py-48">
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-[40px] font-medium leading-[1.05] tracking-[-0.035em] md:text-[64px]">Running on Fire TV</h2>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-2 md:text-lg">
            The real app on the Vega Virtual Device
          </p>
        </div>
        <div className="mt-12 rounded-[24px] border border-white/10 bg-night bg-[radial-gradient(70%_90%_at_0%_0%,rgba(211,99,45,.4),transparent_70%),radial-gradient(60%_80%_at_100%_100%,rgba(240,182,103,.16),transparent_70%)] p-3 shadow-[0_30px_80px_rgba(20,20,20,.18)] sm:p-5 md:p-6">
          <video
            className="block aspect-[1200/584] w-full rounded-[12px] bg-black ring-1 ring-white/10"
            src="/demo/recco-tv-demo.mp4"
            poster="/demo/recco-tv-demo-poster.jpg"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            aria-label="Recco running on the Vega Virtual Device"
          />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-16 text-center md:px-8 md:py-20">
      <Logo className="mx-auto h-10" />
      <p className="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-relaxed text-ink-2">
        An inbox of things to watch, on Fire TV. Built for the Amazon Developer Hackathon with React Native for Vega and AWS.
      </p>
      <div className="mt-6 flex justify-center gap-6 text-[14px]">
        {[
          ["GitHub", REPO_URL],
          ["Hackathon", HACKATHON_URL],
        ].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="text-ink-2 underline decoration-line underline-offset-4 hover:text-ink hover:decoration-muted">
            {label}
          </a>
        ))}
      </div>
      <p className="mt-10 text-[12.5px] text-muted">The illustrations use made-up shows, names and numbers. MIT licensed.</p>
    </footer>
  );
}
