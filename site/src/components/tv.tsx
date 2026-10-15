// A browser rebuild of the Fire TV inbox (the real app is React Native for Vega and
// can't render here). Sizes are the design's 1920×1080 px values, scaled to the
// container with cqw, so the mock stays crisp at any width.

import type { CSSProperties, ReactNode } from "react";
import type { Card, Theme } from "@/lib/content";

/**
 * Design px → container-relative length. The canvas is 1920 wide unless a wrapper
 * sets `--k` (see `fitWidth`), e.g. to show one 557px card at full container width.
 */
export const u = (n: number) => `calc(${n} * var(--k, 100cqw / 1920))`;

/** Style for an `@container` wrapper whose width maps to `designWidth` design px. */
export const fitWidth = (designWidth: number) => ({ "--k": `calc(100cqw / ${designWidth})` }) as CSSProperties;

const surface = (t: Theme, a: number) => `rgba(${t.surface},${a})`;

export function Ratings({ imdb, rt, scale = 1, color }: { imdb?: string; rt?: string; scale?: number; color?: string }) {
  if (!imdb && !rt) return null;
  const s = (n: number) => u(n * scale);
  return (
    <div className="flex items-center" style={{ gap: s(14), fontSize: s(19), fontWeight: 600, color }}>
      {imdb && (
        <span className="inline-flex items-center" style={{ gap: s(7) }}>
          {/* Plain marks, not third-party logos (hackathon rule). */}
          <span style={{ width: s(26), height: s(14), borderRadius: s(3), background: "#F5C518" }} />
          {imdb}
        </span>
      )}
      {rt && (
        <span className="inline-flex items-center" style={{ gap: s(7) }}>
          <span style={{ width: s(15), height: s(15), borderRadius: 999, background: "#FA320A" }} />
          {rt}
        </span>
      )}
    </div>
  );
}

export function Avatars({ names, theme, size }: { names: string[]; theme: Theme; size: number }) {
  return (
    <span className="inline-flex shrink-0">
      {names.slice(0, 3).map((n, i) => (
        <span
          key={n}
          className="inline-grid place-items-center rounded-full font-bold"
          style={{
            width: u(size),
            height: u(size),
            fontSize: u(size * 0.5),
            marginLeft: i ? u(-7) : 0,
            background: theme.accent,
            color: theme.text,
            boxShadow: names.length > 1 ? `0 0 0 ${u(2)} ${theme.canvas}` : undefined,
          }}
        >
          {n[0]}
        </span>
      ))}
    </span>
  );
}

function senderLabel(names: string[]) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

export function Bubble({ theme, children, size = 24 }: { theme: Theme; children: ReactNode; size?: number }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.tint[0]}, ${theme.tint[1]})`,
        color: theme.text,
        borderRadius: `${u(18)} ${u(18)} ${u(18)} ${u(4)}`,
        padding: `${u(12)} ${u(16)}`,
        fontSize: u(size),
        lineHeight: 1.3,
      }}
    >
      <div className="line-clamp-3">{children}</div>
    </div>
  );
}

export function Poster({ slug, w, h, radius = 14, style }: { slug: string; w: number; h: number; radius?: number; style?: CSSProperties }) {
  return (
    // Plain <img>: sized in cqw inside a scaled mock, so next/image's fixed widths don't fit.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/posters/${slug}.jpg`}
      alt=""
      loading="lazy"
      className="block object-cover"
      style={{ width: u(w), height: u(h), borderRadius: u(radius), boxShadow: "0 16px 40px rgba(0,0,0,.45)", ...style }}
    />
  );
}

export function TvCard({ card, theme, focused = false }: { card: Card; theme: Theme; focused?: boolean }) {
  return (
    <div
      className="relative flex overflow-hidden"
      style={{
        height: u(414),
        padding: u(18),
        gap: u(20),
        borderRadius: u(20),
        background: focused ? surface(theme, 0.72) : surface(theme, 0.8),
        backdropFilter: `blur(${focused ? 24 : 30}px)`,
        outline: focused ? `${u(4)} solid ${theme.focus}` : undefined,
        transform: focused ? "scale(1.06)" : undefined,
        boxShadow: focused ? "0 40px 90px rgba(0,0,0,.6)" : undefined,
        zIndex: focused ? 5 : undefined,
        transition: "transform .22s var(--ease-tv), box-shadow .22s var(--ease-tv)",
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: u(10) }}>
        <div className="font-bold" style={{ fontSize: u(30), lineHeight: 1.1, letterSpacing: "-0.01em", color: theme.text }}>
          {card.title}
        </div>
        {card.stack ? (
          <div className="flex items-center" style={{ gap: u(10), fontSize: u(17), color: theme.text2 }}>
            <span
              className="inline-flex items-center font-bold"
              style={{ gap: u(6), padding: `${u(3)} ${u(10)}`, borderRadius: 999, background: "rgba(255,255,255,.12)", color: theme.text }}
            >
              <StackGlyph size={16} /> {card.stack.count} shows
            </span>
            {card.stack.source}
          </div>
        ) : (
          <>
            <div style={{ fontSize: u(19), color: theme.text2 }}>{card.meta}</div>
            <Ratings imdb={card.imdb} rt={card.rt} color={theme.text} />
          </>
        )}
        <div className="mt-auto">
          <Bubble theme={theme}>{card.message}</Bubble>
        </div>
        <div className="flex min-w-0 items-center" style={{ gap: u(8), fontSize: u(19), color: theme.text2 }}>
          <Avatars names={card.from} theme={theme} size={24} />
          <span className="truncate" style={{ color: theme.text, fontWeight: 600 }}>
            {senderLabel(card.from)}
          </span>
          <span className="shrink-0">· {card.time}</span>
        </div>
      </div>
      {card.stack ? (
        <div className="relative shrink-0 isolate" style={{ width: u(240), height: u(378) }}>
          {card.stack.posters.map((p, i) => (
            <Poster
              key={p}
              slug={p}
              w={200}
              h={300}
              style={{
                position: "absolute",
                left: u(20),
                top: u(38),
                transform: `rotate(${[10, -7, 0][i]}deg) translateX(${u([22, -14, 0][i])})`,
                zIndex: i,
              }}
            />
          ))}
        </div>
      ) : (
        card.poster && <Poster slug={card.poster} w={252} h={378} />
      )}
    </div>
  );
}

export function StackGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: u(size), height: u(size) }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="12" height="13" rx="2" />
      <path d="M8 5h10a2 2 0 0 1 2 2v11" />
    </svg>
  );
}

/** The home header: logo, Featured / Inbox tabs, settings gear. */
function Header({ theme }: { theme: Theme }) {
  return (
    <div className="absolute inset-x-0 flex items-center justify-between" style={{ top: u(48), padding: `0 ${u(96)}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/recco-logo.png" alt="" style={{ height: u(64) }} />
      <div
        className="absolute left-1/2 flex -translate-x-1/2"
        style={{ padding: u(6), borderRadius: 999, background: surface(theme, 0.8), border: "1px solid rgba(255,255,255,.1)" }}
      >
        {["Featured", "Inbox"].map((tab) => (
          <span
            key={tab}
            style={{
              padding: `${u(14)} ${u(40)}`,
              borderRadius: 999,
              fontSize: u(26),
              fontWeight: 600,
              background: tab === "Inbox" ? theme.segOn : undefined,
              color: tab === "Inbox" ? theme.segOnFg : theme.text2,
            }}
          >
            {tab}
          </span>
        ))}
      </div>
      <span
        className="grid place-items-center rounded-full"
        style={{ width: u(60), height: u(60), background: surface(theme, 0.8), color: theme.accent2 }}
      >
        <svg viewBox="0 0 24 24" style={{ width: u(28), height: u(28) }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
      </span>
    </div>
  );
}

export function TvBackground({ theme, video }: { theme: Theme; video?: boolean }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: theme.canvas }} />
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/bg/${theme.key}.jpg)` }} />
      {video && (
        <video
          key={theme.key}
          className="absolute inset-0 h-full w-full object-cover"
          src={`/bg/${theme.key}.mp4`}
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 90% 90% at 50% 40%, transparent 30%, ${theme.canvas} 100%)` }}
      />
    </>
  );
}

/** The inbox screen at 16:9. `slots` replaces cards by index (e.g. a placeholder). */
export function TvInbox({
  theme,
  cards,
  focusedId,
  video,
  slots,
}: {
  theme: Theme;
  cards: Card[];
  focusedId?: string;
  video?: boolean;
  slots?: Record<number, ReactNode>;
}) {
  return (
    <div className="@container relative aspect-video w-full overflow-hidden" style={{ color: theme.text }}>
      <TvBackground theme={theme} video={video} />
      <Header theme={theme} />
      <div
        className="absolute inset-x-0 grid grid-cols-3"
        style={{ top: u(168), padding: `0 ${u(96)}`, gap: u(28) }}
      >
        {cards.slice(0, 6).map((c, i) => (
          <div key={c.id}>{slots?.[i] ?? <TvCard card={c} theme={theme} focused={c.id === focusedId} />}</div>
        ))}
      </div>
    </div>
  );
}
