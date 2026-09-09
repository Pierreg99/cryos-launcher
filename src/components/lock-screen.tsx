"use client";

import { useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { ChevronUp, Snowflake } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { useNow } from "@/hooks/use-now";
import { formatDate, formatTime, frostKind, tempC } from "@/lib/live";
import { DistroMark } from "@/components/distro-mark";
import { DISTROS, markSlugFor } from "@/lib/crybel";
import { Wallpaper } from "@/components/wallpaper";

/**
 * Module 2 — Lock screen: super wallpaper, clock, date, weather.
 * Swipe up (dy < -72) or tap to thaw. Pointer logic mirrors the
 * reference lock-screen 1:1; framer only handles enter/exit.
 */
export function LockScreen() {
  const now = useNow(1000);
  const d = useDict();
  const locale = useShell((s) => s.settings.locale);
  const ice = useShell((s) => s.settings.ice);
  const requestUnlock = useShell((s) => s.requestUnlock);

  const startY = useRef<number | null>(null);
  const [dy, setDy] = useState(0);

  function onDown(e: PointerEvent<HTMLDivElement>) {
    startY.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // best-effort
    }
  }
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (startY.current == null) return;
    setDy(Math.min(0, e.clientY - startY.current));
  }
  function onUp() {
    if (dy < -72) requestUnlock();
    startY.current = null;
    setDy(0);
  }

  const lift = Math.abs(dy);

  return (
    <motion.div
      className="absolute inset-0 z-[80] flex cursor-pointer touch-none flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -48 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={() => {
        if (lift < 4) requestUnlock();
      }}
      role="button"
      tabIndex={0}
      aria-label={d.os.tap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") requestUnlock();
      }}
      style={{ transform: `translateY(${dy * 0.4}px)`, opacity: 1 - lift / 420 }}
    >
      {/* super wallpaper (lock variant) */}
      <Wallpaper variant="lock" />

      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-[max(4.5rem,env(safe-area-inset-top))]">
        <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary status-ink">
          {DISTROS[ice].name}
        </p>
        <p className="mt-6 text-8xl font-medium leading-none tracking-tight tabular-nums status-ink">
          {now ? formatTime(now, locale) : "\u00A0"}
        </p>
        <p className="mt-4 text-lg text-fg/90 status-ink">
          {now ? formatDate(now, locale) : "\u00A0"}
        </p>
        <p className="mt-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted">
          <Snowflake className="size-3.5 text-primary" strokeWidth={1.75} />
          {now ? `${d.weather[frostKind(now)]} · ${tempC(now)}°C` : "\u00A0"}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <DistroMark slug={markSlugFor(ice)} className="size-8 text-primary" />
        <p className="mt-5 text-xl italic text-primary status-ink">{d.boot.epigraph}</p>
        <ChevronUp
          className="mt-8 size-5 animate-chevron-bob text-muted"
          strokeWidth={1.75}
        />
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          {d.os.swipe}
        </p>
      </div>
    </motion.div>
  );
}
