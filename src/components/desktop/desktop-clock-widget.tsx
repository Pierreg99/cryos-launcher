"use client";

import { Snowflake } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { useNow } from "@/hooks/use-now";
import { formatShortDate, formatTime, frostKind, tempC } from "@/lib/live";
import { useViewport } from "@/components/viewport-context";

/** Live clock + frost weather widget on the desktop (opens the Clock app). */
export function DesktopClockWidget() {
  const d = useDict();
  const now = useNow(15_000);
  const locale = useShell((s) => s.settings.locale);
  const winOpen = useShell((s) => s.winOpen);
  const viewportRef = useViewport();

  return (
    <button
      type="button"
      onClick={() => {
        const r = viewportRef.current?.getBoundingClientRect();
        winOpen("clock", r ? { w: r.width, h: r.height } : undefined);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={d.desktop.clockHint}
      title={d.desktop.clockHint}
      className="absolute right-5 top-4 z-10 cursor-pointer rounded-2xl bg-surface/70 px-5 py-4 text-right ring-1 ring-line backdrop-blur-xl transition-colors hover:bg-surface"
    >
      <span className="block text-4xl font-medium leading-none tracking-tight tabular-nums status-ink">
        {now ? formatTime(now, locale) : "--:--"}
      </span>
      <span className="mt-1.5 block text-xs text-fg/85 status-ink">
        {now ? formatShortDate(now, locale) : "\u00A0"}
      </span>
      <span className="mt-2 flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
        <Snowflake className="size-3 text-primary" strokeWidth={2} />
        {now ? `${d.weather[frostKind(now)]} · ${tempC(now)}°C` : "\u00A0"}
      </span>
    </button>
  );
}
