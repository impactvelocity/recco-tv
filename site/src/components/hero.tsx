import { REPO_URL } from "@/lib/content";
import { StreamBackground } from "./stream";
import { ButtonLink, Logo, PlayIcon } from "./ui";


export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-paper/80 backdrop-blur-xl">
      <nav className="flex h-14 items-center justify-between px-5 md:px-8">
        <a href="#top" aria-label="Recco home">
          <Logo className="h-7" />
        </a>
        <div className="-mr-3 flex items-center gap-1 text-[14px]">
          <a href="#how" className="rounded-full px-3 py-1.5 text-ink-2 hover:text-ink">
            How it works
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="rounded-full px-3 py-1.5 text-ink-2 hover:text-ink">
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" className="px-3 pt-14 md:px-4">
      <div className="relative isolate flex h-[min(86svh,860px)] min-h-[560px] items-end overflow-hidden rounded-[20px] bg-night">
        {/* The winter-night room, looping from Cloudflare Stream. */}
        <StreamBackground className="animate-drift" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-tr md:from-black/70 md:via-black/15 md:to-transparent" />

        {/* A couple of texts on their way to the TV. */}
        <div className="pointer-events-none absolute right-[8%] top-[18%] hidden w-72 space-y-3 lg:block">
          <div className="animate-rise ml-auto w-fit rounded-2xl rounded-br-md bg-sms px-4 py-2.5 text-[15px] text-white shadow-2xl [animation-delay:500ms]">
            Jill says Two-Car Garage is hilarious
          </div>
          <div className="animate-rise ml-auto w-fit rounded-2xl rounded-br-md bg-sms px-4 py-2.5 text-[15px] text-white shadow-2xl [animation-delay:900ms]">
            movies for a stormy night
          </div>
          <div className="animate-rise text-right text-[12px] text-white/60 [animation-delay:1100ms]">Delivered</div>
        </div>

        <div className="w-full max-w-2xl p-6 pb-8 text-white md:p-12 md:pb-14">
          <h1 className="animate-rise text-balance text-[44px] font-medium leading-[1.02] tracking-[-0.035em] md:text-[72px]">
            An inbox of things to watch, on Fire TV
          </h1>
          <p className="animate-rise mt-5 max-w-md text-pretty text-[17px] leading-relaxed text-white/80 [animation-delay:100ms] md:text-lg">
            Text Recco the shows people tell you about. They’re waiting on your TV when you sit down.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap gap-2.5 [animation-delay:200ms]">
            <ButtonLink href="#film" variant="light">
              <PlayIcon /> Watch the film
            </ButtonLink>
            <ButtonLink href="#how" variant="glass">
              How it works
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
