import type { ReactNode } from "react";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-[12.5px] font-semibold uppercase tracking-[0.14em] text-amber ${className}`}>{children}</div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  accent,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-[-0.025em] md:text-5xl">
        {title}
        {accent && <span className="text-amber"> {accent}</span>}
      </h2>
      {children && <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-2">{children}</p>}
    </div>
  );
}

export function Chip({ children, aws = false }: { children: ReactNode; aws?: boolean }) {
  return (
    <span
      className={
        aws
          ? "inline-flex rounded-full border border-orange/30 bg-orange/12 px-3 py-1 text-[13px] font-medium text-[#f3b08c]"
          : "inline-flex rounded-full border border-line bg-white/[0.04] px-3 py-1 text-[13px] font-medium text-ink-2"
      }
    >
      {children}
    </span>
  );
}

export function NumberBadge({ n }: { n: number }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber text-[15px] font-bold text-[#2a1a10]">
      {n}
    </span>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[26px] border border-line bg-panel/80 backdrop-blur-sm ${className}`}>{children}</div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition duration-200 ease-tv focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-amber";
  const look =
    variant === "primary"
      ? "bg-amber text-[#2a1a10] hover:bg-[#f5c788]"
      : "border border-line bg-white/[0.05] text-ink hover:border-line-hi hover:bg-white/[0.09]";
  return (
    <a href={href} className={`${base} ${look}`} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
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
