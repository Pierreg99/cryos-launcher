"use client";

import type { ReactNode } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useHydrated } from "@/hooks/use-hydrated";
import { useShell } from "@/store/shell";

/**
 * Device routing:
 *  - Crydroid (or any ice on a narrow screen): 19.5:9 phone frame on wide
 *    screens, edge-to-edge fullscreen on phones.
 *  - desktop ices (CryArch / crybuntu / crybian / Crynux) on wide screens:
 *    full-bleed desktop — the browser window is the monitor.
 * Before hydration a neutral background renders (no frame flash).
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const ready = useHydrated();
  const ice = useShell((s) => s.settings.ice);
  const wide = useMediaQuery("(min-width: 900px)");

  if (!ready) {
    return <div className="fixed inset-0 overflow-hidden bg-background" />;
  }

  if (ice !== "crydroid" && wide) {
    return (
      <div className="fixed inset-0 h-[100dvh] overflow-hidden bg-background">{children}</div>
    );
  }

  if (!wide) {
    return (
      <div className="fixed inset-0 h-[100dvh] overflow-hidden bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="dark:bg-[radial-gradient(80%_60%_at_50%_0%,#101c2e_0%,#070d17_55%,#04070d_100%)] flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(80%_60%_at_50%_0%,#dbe7f4_0%,#c3d5e8_55%,#a9c1da_100%)] p-6">
      <div className="flex flex-col items-center">
        <div className="relative aspect-[9/19.5] h-[min(860px,90dvh)] rounded-[3.1rem] border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-950 p-[10px] shadow-[0_50px_120px_-24px_rgba(15,50,105,0.55)]">
          <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-background">
            {/* camera punch-hole */}
            <div className="pointer-events-none absolute left-1/2 top-2.5 z-[95] size-2.5 -translate-x-1/2 rounded-full bg-zinc-950 ring-1 ring-white/10" />
            {children}
          </div>
        </div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400">
          Crydroid · cryOS preview
        </p>
      </div>
    </div>
  );
}
