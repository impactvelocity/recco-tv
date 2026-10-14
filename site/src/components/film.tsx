"use client";

import { useState } from "react";
import { YOUTUBE_ID, YOUTUBE_URL } from "@/lib/content";
import { SectionHead } from "./ui";

export function Film() {
  // The YouTube player loads only after a click, so the page makes no YouTube requests until then.
  const [playing, setPlaying] = useState(false);

  return (
    <section id="film" className="scroll-mt-16 border-t border-line/60">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <SectionHead eyebrow="The film" title="Two minutes, one evening." accent="Then how it’s built.">
          A story about getting your evenings back, then a walk through the TV app, the agent and the AWS pipeline behind
          every card.
        </SectionHead>

        <div className="relative mt-12 aspect-video overflow-hidden rounded-[28px] border border-line bg-black shadow-[0_40px_120px_rgba(0,0,0,.6)]">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
              title="Recco: a Fire TV inbox you text like a friend"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 grid place-items-center bg-cover bg-center focus-visible:outline-none"
              style={{ backgroundImage: "url(/film/poster.jpg)" }}
              aria-label="Play the Recco film"
            >
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="animate-pulse-ring relative grid size-20 place-items-center rounded-full bg-orange text-white shadow-2xl transition duration-200 ease-tv group-hover:scale-110 group-focus-visible:outline-4 group-focus-visible:outline-amber md:size-24">
                <svg viewBox="0 0 24 24" className="ml-1 size-8 fill-current md:size-10">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="absolute bottom-5 left-6 text-left text-[14px] font-medium text-white/85 md:bottom-7 md:left-8">
                Recco · 2:12 · sound on
              </span>
            </button>
          )}
        </div>
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-[14px] text-muted underline decoration-line-hi underline-offset-4 hover:text-ink"
        >
          Watch on YouTube
        </a>
      </div>
    </section>
  );
}
