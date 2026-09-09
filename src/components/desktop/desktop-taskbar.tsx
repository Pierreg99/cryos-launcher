"use client";

import {
  Bluetooth,
  Moon,
  Plane,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { APPS, DESKTOP_PINNED, type AppId } from "@/lib/apps";
import { DISTROS, markSlugFor } from "@/lib/crybel";
import { TASKBAR_H } from "@/lib/desktop";
import { batteryLevel, formatShortDate, formatTime } from "@/lib/live";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
import { useViewport } from "@/components/viewport-context";
import { DistroMark } from "@/components/distro-mark";
import { BatteryGauge, SignalBars } from "@/components/status-bar";

/**
 * Desktop taskbar/dock: start (distro mark → app menu), pinned + running
 * apps with focus/minimized indicators, tray (theme quick-toggle, radios,
 * battery, clock).
 */
export function DesktopTaskbar() {
  const d = useDict();
  const now = useNow(15_000);
  const locale = useShell((s) => s.settings.locale);
  const ice = useShell((s) => s.settings.ice);
  const windows = useShell((s) => s.windows);
  const menuOpen = useShell((s) => s.menuOpen);
  const setMenu = useShell((s) => s.setMenu);
  const winOpen = useShell((s) => s.winOpen);
  const winFocus = useShell((s) => s.winFocus);
  const winMinimize = useShell((s) => s.winMinimize);
  const theme = useShell((s) => s.settings.theme);
  const wifi = useShell((s) => s.settings.wifi);
  const bluetooth = useShell((s) => s.settings.bluetooth);
  const airplane = useShell((s) => s.settings.airplane);
  const bootedAt = useShell((s) => s.bootedAt);
  const setSetting = useShell((s) => s.setSetting);
  const viewportRef = useViewport();

  const vpSize = () => {
    const r = viewportRef.current?.getBoundingClientRect();
    return r ? { w: r.width, h: r.height } : undefined;
  };

  const focused = windows
    .filter((w) => !w.min)
    .reduce<typeof windows[number] | null>(
      (top, w) => (top === null || w.z > top.z ? w : top),
      null,
    );

  const ids: AppId[] = Array.from(
    new Set<AppId>([...DESKTOP_PINNED, ...windows.map((w) => w.appId)]),
  );

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[70] flex items-center gap-1 border-t border-line bg-surface-solid/85 px-2 backdrop-blur-2xl"
      style={{ height: TASKBAR_H }}
      onPointerDown={(e) => e.stopPropagation()}
      role="toolbar"
      aria-label={d.desktop.taskbar}
    >
      {/* start */}
      <button
        type="button"
        onClick={() => setMenu(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label={d.desktop.startHint}
        title={d.desktop.startHint}
        className={cn(
          "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 transition-colors hover:bg-surface-2",
          menuOpen && "bg-surface-2",
        )}
      >
        <DistroMark slug={markSlugFor(ice)} className="size-5 text-primary" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
          {DISTROS[ice].name}
        </span>
      </button>

      <span className="mx-1 h-6 w-px shrink-0 bg-line" aria-hidden />

      {/* pinned + running apps */}
      <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {ids.map((id) => {
          const win = windows.find((w) => w.appId === id);
          const isFocused = focused?.appId === id;
          const Glyph = APPS[id].icon;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (!win) winOpen(id, vpSize());
                else if (win.min || !isFocused) winFocus(win.id);
                else winMinimize(win.id);
              }}
              title={d.apps[id]}
              aria-label={d.apps[id]}
              className={cn(
                "relative grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-gradient-to-br transition-all active:scale-90",
                APPS[id].tint,
                isFocused && "ring-1 ring-primary/70",
                win?.min && "opacity-55",
              )}
            >
              <Glyph className="size-4 text-white drop-shadow-sm" strokeWidth={2} />
              {win && (
                <span
                  className={cn(
                    "absolute bottom-[2px] h-[3px] rounded-full bg-primary transition-all",
                    isFocused ? "w-5" : "w-2.5",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* tray */}
      <div className="flex shrink-0 items-center gap-1.5 text-muted">
        <button
          type="button"
          onClick={() => setSetting("theme", theme === "dark" ? "light" : "dark")}
          aria-label={d.tiles.darkMode}
          title={d.tiles.darkMode}
          className="grid size-8 cursor-pointer place-items-center rounded-lg transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
        {airplane ? (
          <Plane className="size-4" aria-label={d.tiles.airplane} />
        ) : (
          <span className="flex items-center gap-1.5">
            {wifi ? (
              <Wifi className="size-4" />
            ) : (
              <WifiOff className="size-4 opacity-55" aria-label={d.tiles.wifi} />
            )}
            {bluetooth && <Bluetooth className="size-4" />}
            <SignalBars />
          </span>
        )}
        <BatteryGauge level={now ? batteryLevel(now, bootedAt) : null} />
        <button
          type="button"
          onClick={() => winOpen("clock", vpSize())}
          aria-label={d.desktop.clockHint}
          title={d.desktop.clockHint}
          className="flex cursor-pointer flex-col items-end rounded-lg px-2 py-1 leading-tight transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <span className="text-xs font-semibold tabular-nums">
            {now ? formatTime(now, locale) : "--:--"}
          </span>
          <span className="text-[9px] tabular-nums">
            {now ? formatShortDate(now, locale) : "\u00A0"}
          </span>
        </button>
      </div>
    </div>
  );
}
