import type { ReactNode } from "react";

export function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  // The wordmark is white on transparent; invert it for the light page.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/recco-logo.png" alt="Recco" className={`w-auto ${light ? "" : "invert"} ${className}`} />
  );
}

export function ButtonLink({
  href,
  children,
  variant = "dark",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light" | "outline" | "glass";
  external?: boolean;
}) {
  const look = {
    dark: "bg-ink text-white hover:bg-black",
    light: "bg-white text-ink hover:bg-cream",
    outline: "border border-line text-ink hover:border-ink/30 hover:bg-white",
    glass: "border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  }[variant];
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition duration-200 ease-tv focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange ${look}`}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function PlayIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <span className={`grid size-5 place-items-center rounded-full bg-amber text-[#2a1a10] ${className}`}>
      <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

export function Mic({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
