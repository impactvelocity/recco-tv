import type { ReactNode } from "react";
import { RECCO_NUMBER } from "@/lib/content";

export type Message =
  | { kind: "text"; text: string }
  | { kind: "link"; caption: string; host: string };

export function SmsBubble({ message, className = "" }: { message: Message; className?: string }) {
  if (message.kind === "link") {
    return (
      <div className={`ml-auto w-[78%] overflow-hidden rounded-2xl rounded-br-md bg-[#262b2b] ${className}`}>
        <div className="grid h-20 place-items-center bg-gradient-to-br from-[#3a2a4a] via-[#6b3a3a] to-[#c0612f]">
          <svg viewBox="0 0 24 24" className="size-7 fill-white/90">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div className="px-3 py-2">
          <div className="text-[13px] font-semibold leading-snug text-white">{message.caption}</div>
          <div className="text-[11px] text-white/55">{message.host}</div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`ml-auto w-fit max-w-[82%] rounded-2xl rounded-br-md bg-sms px-3.5 py-2 text-[14px] leading-snug text-white ${className}`}
    >
      {message.text}
    </div>
  );
}

/** A phone in a thread with the Recco number. */
export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-[240px] rounded-[38px] bg-[#0b0d0d] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,.55)] ring-1 ring-white/15 ${className}`}
    >
      <div className="relative flex h-[440px] flex-col overflow-hidden rounded-[30px] bg-black">
        <div className="flex items-center justify-between px-5 pt-3 text-[11px] font-semibold text-white">
          <span>9:04</span>
          <span className="h-5 w-20 rounded-full bg-[#111]" />
          <span className="h-2.5 w-5 rounded-[3px] border border-white/70" />
        </div>
        <div className="flex flex-col items-center gap-1 border-b border-white/10 pb-2.5 pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/app-icon.png" alt="" className="size-8 rounded-full" />
          <div className="text-[12px] font-semibold text-white">Recco</div>
          <div className="text-[10px] text-white/50">{RECCO_NUMBER}</div>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2 px-3 pb-3">{children}</div>
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[12px] text-white/40">
          Text message
          <span className="ml-auto grid size-5 place-items-center rounded-full bg-sms-hi">
            <svg viewBox="0 0 24 24" className="size-3 stroke-white" fill="none" strokeWidth={3} strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
