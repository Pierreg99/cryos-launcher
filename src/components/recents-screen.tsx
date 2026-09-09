"use client";

import { useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Snowflake, X } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell, type RecentEntry } from "@/store/shell";
import { APPS } from "@/lib/apps";
import { cn } from "@/lib/utils";

const DISMISS_DY = -96;

/**
 * Module 4 — Recents: horizontal card stack of frozen app snapshots.
 * Tap card = resume, swipe card up = dismiss, pill/home = back out.
 */
export function RecentsScreen() {
  const d = useDict();
  const recents = useShell((s) => s.recents);
  const clearRecents = useShell((s) => s.clearRecents);

  return (
    <motion.div
      className="absolute inset-0 z-[60] bg-background/45 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-label={d.recents.clearAll}
    >
      {recents.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 pb-16">
          <Snowflake className="size-10 text-primary/70" strokeWidth={1.25} />
          <p className="text-sm font-medium">{d.recents.empty}</p>
          <p className="max-w-[240px] text-center text-xs text-muted">{d.recents.emptyHint}</p>
        </div>
      ) : (
        <div className="no-scrollbar flex h-full snap-x snap-mandatory items-center gap-5 overflow-x-auto px-[14%] pb-14">
          <AnimatePresence initial={false}>
            {recents.map((entry, i) => (
              <RecentCard key={entry.key} entry={entry} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {recents.length > 0 && (
        <button
          type="button"
          onClick={clearRecents}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface px-5 py-2 text-xs font-semibold tracking-wide ring-1 ring-line backdrop-blur-xl transition-colors hover:bg-primary/15"
        >
          {d.recents.clearAll}
        </button>
      )}
    </motion.div>
  );
}

function RecentCard({ entry, index }: { entry: RecentEntry; index: number }) {
  const d = useDict();
  const resumeApp = useShell((s) => s.resumeApp);
  const closeRecent = useShell((s) => s.closeRecent);
  const app = APPS[entry.appId];
  const Glyph = app.icon;

  const startY = useRef<number | null>(null);
  const [dy, setDy] = useState(0);
  const dragged = useRef(false);

  function onDown(e: PointerEvent<HTMLDivElement>) {
    startY.current = e.clientY;
    dragged.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // best-effort
    }
  }
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (startY.current === null) return;
    const delta = e.clientY - startY.current;
    if (Math.abs(delta) > 8) dragged.current = true;
    setDy(Math.min(0, delta));
  }
  function onUp() {
    startY.current = null;
    if (dy < DISMISS_DY) {
      closeRecent(entry.key);
      return;
    }
    setDy(0);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1, y: dy * 0.9 }}
      exit={{ opacity: 0, y: "-115%", scale: 0.9, transition: { duration: 0.22 } }}
      transition={{ duration: 0.22, delay: index * 0.03, ease: [0.32, 0.72, 0, 1] }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={() => {
        if (!dragged.current) resumeApp(entry.appId);
      }}
      style={{ opacity: 1 - Math.abs(dy) / 320 }}
      className={cn(
        "relative flex h-[72%] w-[74%] shrink-0 snap-center touch-none flex-col overflow-hidden rounded-3xl bg-surface-solid shadow-2xl shadow-black/40 ring-1 ring-line",
        dy < DISMISS_DY * 0.5 ? "cursor-grabbing" : "cursor-pointer",
      )}
      role="button"
      aria-label={d.apps[entry.appId]}
    >
      <div className="flex h-11 items-center gap-2.5 border-b border-line px-3.5">
        <span
          className={cn(
            "grid size-6 place-items-center rounded-md bg-gradient-to-br",
            app.tint,
          )}
        >
          <Glyph className="size-3.5 text-white" strokeWidth={2} />
        </span>
        <span className="text-[13px] font-semibold">{d.apps[entry.appId]}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeRecent(entry.key);
          }}
          aria-label={d.recents.closeCard}
          className="ml-auto grid size-7 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* frozen snapshot mock */}
      <div className={cn("relative flex-1 bg-gradient-to-br p-5", app.tint, "opacity-100")}>
        <div className="absolute inset-0 bg-background/82" />
        <div className="relative flex h-full flex-col">
          <Glyph className="size-10 text-muted/40" strokeWidth={1.25} />
          <div className="mt-6 space-y-2.5">
            <span className="block h-2 w-4/5 rounded-full bg-fg/10" />
            <span className="block h-2 w-3/5 rounded-full bg-fg/10" />
            <span className="block h-2 w-2/3 rounded-full bg-fg/10" />
          </div>
          <span className="mt-auto font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
            {d.recents.snapshot}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
