import { AWS_SERVICES, OTHER_STACK, REPO_URL } from "@/lib/content";
import { ButtonLink, Chip, Panel, SectionHead } from "./ui";

const PROMISES = [
  ["Your number is never stored", "Phone numbers are kept as a salted hash plus the last four digits, so the TV can say “the phone ending 0189”."],
  ["First names only", "Friends are a first name. No contacts access, no audio, no accounts or passwords."],
  ["No reply texts", "Recco never texts you back. Mistakes are fixed on the TV with the remote."],
  ["Outside services see only what they need", "The title lookup sees titles. The link readers see the links you send. The model sees the text."],
];

export function Privacy() {
  return (
    <section id="privacy" className="scroll-mt-16 border-t border-line/60 bg-bg-deep">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionHead eyebrow="Private by design" title="Your phone stays off." accent="Your number stays yours.">
            The moment you pick up your phone to find a recommendation, you start scrolling. Recco never asks you to look at
            it at watch time, and keeps as little about you as it can.
          </SectionHead>
          <Panel className="mt-10 p-6">
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">What Recco keeps</div>
            <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[14px]">
              <span className="rounded-lg border border-line px-3 py-1.5 text-muted line-through decoration-orange/70">
                +1 (604) 555-0189
              </span>
              <svg viewBox="0 0 24 24" className="size-4 text-amber" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              <span className="rounded-lg border border-line-hi bg-amber/10 px-3 py-1.5 text-amber">7f3a·9c21·e0b4…</span>
              <span className="rounded-lg border border-line px-3 py-1.5 text-ink-2">ending 0189</span>
            </div>
            <p className="mt-3 text-[12.5px] text-muted">Illustrative hash.</p>
          </Panel>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROMISES.map(([title, body]) => (
            <Panel key={title} className="p-6">
              <h3 className="text-lg font-bold tracking-[-0.01em]">{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{body}</p>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BuiltWith() {
  return (
    <section className="border-t border-line/60">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-28">
        <SectionHead eyebrow="Built on AWS" title="One CDK stack," accent="one region.">
          A React Native for Vega app on the TV, and a serverless pipeline behind it. The whole stack is defined in AWS CDK
          and runs in us-east-2.
        </SectionHead>
        <div className="mt-10 flex flex-wrap gap-2">
          {AWS_SERVICES.map((s) => (
            <Chip key={s} aws>
              {s}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {OTHER_STACK.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line/60">
      <div className="absolute inset-0 -z-10 bg-[url(/bg/hero-room.jpg)] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg via-bg/70 to-bg" />
      <div className="mx-auto max-w-7xl px-4 py-28 text-center md:px-8 md:py-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/recco-logo.png" alt="Recco" className="mx-auto h-20 w-auto md:h-28" />
        <p className="mx-auto mt-8 max-w-xl text-balance text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
          From a friend, a link, or you. <span className="text-amber">Ready when you are.</span>
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="#film">Watch the film</ButtonLink>
          <ButtonLink href={REPO_URL} variant="ghost" external>
            Read the code on GitHub
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-bg-deep">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-[13px] text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <span>
          <b className="text-ink-2">Recco</b> · a Fire TV app built with React Native for Vega and Amazon Bedrock AgentCore
        </span>
        <span>Amazon Developer Hackathon · Fire TV track · MIT licensed</span>
      </div>
      <p className="mx-auto max-w-7xl px-4 pb-8 text-[12px] text-muted/70 md:px-8">
        Shows, posters, names, links and the phone number on this page are made up for the demo.
      </p>
    </footer>
  );
}
