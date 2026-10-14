import { EXAMPLES, GUARDS, PIPELINE, STATS, TOOLS } from "@/lib/content";
import { Chip, Panel, SectionHead } from "./ui";

export function SendAnything() {
  return (
    <section id="anything" className="scroll-mt-16 border-t border-line/60">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <SectionHead eyebrow="Send it anything" title="Nothing to install." accent="It works on any phone.">
          Say who told you, paste a link, or describe a mood. The agent turns a name, a link or a vague search into real,
          checked titles.
        </SectionHead>

        <div className="mt-14 grid gap-x-10 gap-y-3 lg:grid-cols-2">
          {EXAMPLES.map((e) => (
            <div
              key={e.text}
              className="group grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-transparent p-3 transition hover:border-line hover:bg-panel/60"
            >
              <div className="max-w-full justify-self-end rounded-2xl rounded-br-md bg-sms px-4 py-2.5 text-[15px] leading-snug text-white [overflow-wrap:anywhere]">
                {e.text}
              </div>
              <svg viewBox="0 0 24 24" className="size-5 text-amber/70 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              <div>
                <div className="font-semibold">{e.result}</div>
                <div className="text-[14px] text-muted">{e.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RUN = [
  ["read_post(filmtok.cx/v/7Kq2RxZ)", "Caption and transcript name three shows"],
  ["find_titles × 3", "Room 104, Couch Time and Away Game each match"],
  ["list_friends()", "Steph is already a friend, so the cards go under Steph"],
  ["save_cards(3 cards)", "One stack, “Steph’s Cold Night Picks”, with her words as the note"],
];

export function Agent() {
  return (
    <section id="agent" className="relative scroll-mt-16 overflow-hidden border-t border-line/60 bg-bg-deep">
      <div className="pointer-events-none absolute -right-40 top-40 size-[640px] rounded-full bg-orange/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <SectionHead eyebrow="Under the hood" title="Inside the" accent="Recco agent.">
          Every step between the text you send and the card on your TV, and the services that run each one. Texts and posts
          are untrusted input: the agent reads them as data, and the rules that matter are enforced in code.
        </SectionHead>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <ol className="relative space-y-3">
            {PIPELINE.map((s, i) => (
              <li key={s.title} className="relative flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-orange/50 bg-orange/15 text-[14px] font-bold text-[#f3b08c]">
                    {i + 1}
                  </span>
                  {i < PIPELINE.length - 1 && <span className="mt-2 w-px flex-1 bg-gradient-to-b from-orange/40 to-line" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold tracking-[-0.015em]">
                    {s.title.startsWith("save_cards") ? (
                      <>
                        <code className="font-mono text-amber">save_cards</code>
                        {s.title.slice("save_cards".length)}
                      </>
                    ) : (
                      s.title
                    )}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-2">{s.body}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.uses.map((x) => (
                      <Chip key={x.name} aws={x.aws}>
                        {x.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[26px] border border-orange/40 bg-gradient-to-br from-[#c2582a] to-[#8f3a18] p-6 shadow-[0_30px_80px_rgba(211,99,45,.25)]">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                  <svg viewBox="0 0 24 24" className="size-5 fill-white">
                    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
                  </svg>
                </span>
                <span className="text-xl font-bold">Recco Agent</span>
              </div>
              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14px]">
                {[
                  ["Model", "Claude Haiku 5.5 via Vercel AI Gateway"],
                  ["Code", "Vercel AI SDK, four tools"],
                  ["Runs on", "Amazon Bedrock AgentCore Runtime"],
                  ["Input", "Texts and posts are read as data, never as instructions"],
                  ["Limits", "10 steps and 40 seconds per text"],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-white/65">{k}</dt>
                    <dd className="font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                One text, step by step
              </div>
              <div className="px-5 pt-4">
                <div className="w-fit max-w-full rounded-2xl rounded-br-md bg-sms px-3.5 py-2 text-[14px] text-white">
                  Steph says these are perfect for a cold night <span className="underline">filmtok.cx/v/7Kq2RxZ</span>
                </div>
              </div>
              <ol className="divide-y divide-line px-5 py-2">
                {RUN.map(([call, result], i) => (
                  <li key={call} className="grid gap-1 py-3 sm:grid-cols-[1fr_1.1fr] sm:gap-4">
                    <code className="font-mono text-[13px] text-amber">
                      <span className="mr-2 text-muted">{i + 1}</span>
                      {call}
                    </code>
                    <span className="text-[13.5px] text-ink-2">{result}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <Panel key={t.name} className="p-6">
              <code className="font-mono text-[15px] font-semibold text-amber">{t.name}</code>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{t.body}</p>
              <p className="mt-4 text-[12.5px] text-muted">{t.via}</p>
            </Panel>
          ))}
        </div>

        <div className="mt-16 rounded-[28px] border border-line-hi bg-gradient-to-br from-[#2a1d14] to-panel p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_2fr] lg:items-center">
            <div>
              <h3 className="text-3xl font-bold tracking-[-0.025em]">
                It never makes up a show<span className="text-amber">.</span>
              </h3>
              <p className="mt-3 leading-relaxed text-ink-2">
                <code className="font-mono text-amber">save_cards</code> is plain TypeScript, not the model. The checks
                that matter don’t live in a prompt.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {GUARDS.map((g) => (
                <div key={g.label} className="rounded-2xl border border-line bg-black/20 p-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{g.label}</div>
                  <div className="mt-1.5 font-medium leading-snug">{g.rule}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-muted">
          Full diagrams:
          <a className="text-ink-2 underline decoration-line-hi underline-offset-4 hover:text-ink" href="/diagrams/how-recco-works.jpg" target="_blank">
            How Recco works
          </a>
          <a className="text-ink-2 underline decoration-line-hi underline-offset-4 hover:text-ink" href="/diagrams/recco-agent-flow.jpg" target="_blank">
            Inside the agent
          </a>
          <a className="text-ink-2 underline decoration-line-hi underline-offset-4 hover:text-ink" href="/diagrams/app-stages.jpg" target="_blank">
            Six steps
          </a>
        </div>
      </div>
    </section>
  );
}

export function Measured() {
  return (
    <section className="border-t border-line/60">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-28">
        <SectionHead eyebrow="Measured on AWS" title="Fast enough that" accent="you don’t notice.">
          Warm numbers from the deployed stack in us-east-2. A cold start, the first text after an idle stretch, takes about
          six seconds to show the placeholder.
        </SectionHead>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STATS.map((s) => (
            <Panel key={s.label} className="flex flex-col p-6">
              <div className="text-5xl font-bold tracking-[-0.04em] tabular-nums">
                {s.value}
                <span className="ml-1 text-2xl text-amber">{s.unit}</span>
              </div>
              <p className="mt-3 text-[14.5px] leading-snug text-ink-2">{s.label}</p>
              <p className="mt-auto pt-4 text-[12.5px] text-muted">{s.budget}</p>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
