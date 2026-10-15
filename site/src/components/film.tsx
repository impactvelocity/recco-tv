import { CREATOR, REPO_URL, YOUTUBE_ID } from "@/lib/content";
import { ButtonLink } from "./ui";

export function Film() {
  return (
    <section id="film" className="scroll-mt-20 px-3 pt-16 md:px-4 md:pt-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-[24px] border border-white/10 bg-night bg-[radial-gradient(70%_90%_at_100%_0%,rgba(211,99,45,.45),transparent_70%),radial-gradient(60%_80%_at_0%_100%,rgba(240,182,103,.18),transparent_70%)] p-3 shadow-[0_30px_80px_rgba(20,20,20,.18)] sm:p-5 md:p-6">
          <div className="relative aspect-video overflow-hidden rounded-[12px] bg-black shadow-[0_10px_30px_rgba(0,0,0,.4)] ring-1 ring-white/10">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&playsinline=1`}
              title="Recco: a Fire TV inbox you text like a friend"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-8 px-1">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/dylan.png"
              alt={CREATOR.name}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-full object-cover ring-2 ring-line ring-offset-2 ring-offset-paper"
            />
            <div className="min-w-0">
              <div className="font-semibold">{CREATOR.name}</div>
              <div className="text-sm text-ink-2">{CREATOR.role}</div>
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-wide">
                {CREATOR.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink-2 underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-muted"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ButtonLink href={REPO_URL} external>
            See the repo on GitHub
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
