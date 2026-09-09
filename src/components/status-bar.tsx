"use client";

import { Bell, Bluetooth, Plane, Wifi, WifiOff } from "lucide-react";
import { DISTROS } from "@/lib/crybel";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { useNow } from "@/hooks/use-now";
import { batteryLevel, formatTime } from "@/lib/live";
import { cn } from "@/lib/utils";

/**
 * Module 5 — Status bar: ice name, unread bell, clock, radios, battery.
 * Tap opens the shade; drag-down is handled by the system gesture layer.
 */
export function StatusBar() {
  const d = useDict();
  const now = useNow(15_000);
  const locale = useShell((s) => s.settings.locale);
  const wifi = useShell((s) => s.settings.wifi);
  const bluetooth = useShell((s) => s.settings.bluetooth);
  const airplane = useShell((s) => s.settings.airplane);
  const bootedAt = useShell((s) => s.bootedAt);
  const dismissed = useShell((s) => s.dismissed);
  const setShade = useShell((s) => s.setShade);
  const ice = useShell((s) => s.settings.ice);

  const unread = d.notif.filter((n) => !dismissed.includes(n.id)).length;
  const battery = now ? batteryLevel(now, bootedAt) : null;

  return (
    <div
      className="relative z-30 flex h-9 shrink-0 cursor-pointer items-center justify-between px-5 pt-[env(safe-area-inset-top)] text-fg"
      onClick={() => setShade(true)}
      role="button"
      tabIndex={0}
      aria-label={d.shade.quickSettings}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setShade(true);
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.26em] status-ink">
          {DISTROS[ice].name}
        </span>
        {unread > 0 && (
          <span className="relative">
            <Bell className="size-3.5 status-ink" strokeWidth={1.75} />
            <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-primary" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium tabular-nums status-ink">
          {now ? formatTime(now, locale) : "\u00A0\u00A0\u00A0\u00A0\u00A0"}
        </span>
        {airplane ? (
          <Plane className="size-3.5 status-ink" strokeWidth={1.75} />
        ) : (
          <>
            {wifi ? (
              <Wifi className="size-3.5 status-ink" strokeWidth={1.75} />
            ) : (
              <WifiOff className="size-3.5 text-muted" strokeWidth={1.75} />
            )}
            {bluetooth && <Bluetooth className="size-3.5 status-ink" strokeWidth={1.75} />}
            <SignalBars />
          </>
        )}
        <BatteryGauge level={battery} />
      </div>
    </div>
  );
}

export function SignalBars() {
  const bars = [3, 5, 7, 9];
  return (
    <span className="flex items-end gap-[2px]" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={h}
          className={cn(
            "w-[2.5px] rounded-[1px] bg-current status-ink",
            i === 3 && "opacity-40",
          )}
          style={{ height: h }}
        />
      ))}
    </span>
  );
}

export function BatteryGauge({ level }: { level: number | null }) {
  const pct = level ?? 88;
  return (
    <span className="flex items-center gap-1" aria-hidden>
      <span className="text-[10px] font-medium tabular-nums status-ink">{pct}</span>
      <span className="relative flex h-[11px] w-[22px] items-center rounded-[3px] ring-1 ring-fg/60 status-ink">
        <span
          className="absolute inset-y-[1.5px] left-[1.5px] rounded-[1.5px] bg-current transition-[width] duration-700"
          style={{ width: `calc(${pct}% - 3px)` }}
        />
        <span className="absolute -right-[3px] h-[4px] w-[1.5px] rounded-r-[1px] bg-current opacity-60" />
      </span>
    </span>
  );
}
