"use client";

import { useState } from "react";
import { INBOX, THEMES } from "@/lib/content";
import { TvFrame, TvInbox } from "./tv";
import { SectionHead } from "./ui";

export function Seasons() {
  const [index, setIndex] = useState(0);
  const theme = THEMES[index];

  return (
    <section
      id="seasons"
      className="relative scroll-mt-16 overflow-hidden border-t border-line/60 transition-colors duration-700"
      style={{ backgroundColor: theme.canvas }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={theme.key}
        src={`/bg/${theme.key}.jpg`}
        alt=""
        className="animate-rise pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/50 to-bg" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead eyebrow="Calm, not a storefront" title="A room for every" accent="season.">
            The inbox sits over a muted, looping scene picked by season and time of day. Auto follows the clock, from bright
            summer days to snowy winter nights.
          </SectionHead>
          <div role="tablist" aria-label="TV theme" className="flex flex-wrap gap-2">
            {THEMES.map((t, i) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium transition duration-200 ease-tv"
                style={
                  i === index
                    ? { background: t.segOn, color: t.segOnFg, borderColor: t.segOn }
                    : { borderColor: "rgba(255,247,232,.14)", color: "#CFC9B4", background: "rgba(255,255,255,.04)" }
                }
              >
                <span className="size-2.5 rounded-full" style={{ background: t.focus }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <TvFrame>
            <TvInbox theme={theme} cards={INBOX} focusedId="garage" video />
          </TvFrame>
        </div>
      </div>
    </section>
  );
}
