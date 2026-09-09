"use client";

import { Snowflake } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { useNow } from "@/hooks/use-now";
import { formatDate, formatTime, frostKind, tempC, wordOfCycle } from "@/lib/live";

/**
 * Module 3 — Widgets slot: clock widget + weather mock + word of the cycle.
 * (A user-configurable widget system is backlog; this is the fixed slot.)
 */
export function WidgetSlot() {
  const d = useDict();
  const now = useNow(1000);
  const locale = useShell((s) => s.settings.locale);

  return (
    <div className="shrink-0 px-5 pb-1 pt-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[56px] font-medium leading-none tracking-tight tabular-nums status-ink">
            {now ? formatTime(now, locale) : "--:--"}
          </p>
          <p className="mt-2 truncate text-sm text-fg/85 status-ink">
            {now ? formatDate(now, locale) : "\u00A0"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line backdrop-blur-xl">
          <span className="flex items-center gap-1.5">
            <Snowflake className="size-4 text-primary" strokeWidth={1.75} />
            <span className="text-xl font-medium tabular-nums">
              {now ? `${tempC(now)}°` : "–"}
            </span>
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {now ? d.weather[frostKind(now)] : "\u00A0"}
          </span>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted/80">
            {d.weather.mockLabel}
          </span>
        </div>
      </div>

      <p className="mt-4 truncate text-center text-xs italic tracking-wide text-muted status-ink">
        <span className="not-italic opacity-50">— </span>
        {now ? wordOfCycle(now) : d.home.wordOfCycle}
        <span className="not-italic opacity-50"> —</span>
      </p>
    </div>
  );
}
