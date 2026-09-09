"use client";

import { useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { NotificationsSection, QsGrid } from "@/components/qs-controls";

const CLOSE_DRAG = 70;

/**
 * Module 5 — Notification shade (phone CryCenter): quick-settings grid
 * and mock notifications, drag-to-close handle. Shared controls live in
 * qs-controls.tsx (also used by the desktop CryCenter).
 */
export function NotificationShade() {
  const d = useDict();
  const setShade = useShell((s) => s.setShade);
  const launchApp = useShell((s) => s.launchApp);

  const close = () => setShade(false);

  return (
    <motion.div
      className="absolute inset-0 z-[70]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* scrim */}
      <div className="absolute inset-0 bg-black/45" onClick={close} aria-hidden />

      {/* panel */}
      <motion.div
        className="absolute inset-x-0 top-0 flex max-h-[88%] flex-col rounded-b-[28px] bg-surface-solid/95 shadow-2xl shadow-black/50 ring-1 ring-line backdrop-blur-2xl"
        initial={{ y: "-102%" }}
        animate={{ y: 0 }}
        exit={{ y: "-102%" }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        role="dialog"
        aria-label={d.shade.notifications}
      >
        <ShadeHandle onClose={close} />

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              {d.shade.quickSettings}
            </h2>
            <button
              type="button"
              onClick={() => launchApp("settings")}
              aria-label={d.apps.settings}
              className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Settings2 className="size-4" />
            </button>
          </div>

          <QsGrid />
          <NotificationsSection />
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Drag the grabber down (or tap it) to close the shade. */
function ShadeHandle({ onClose }: { onClose: () => void }) {
  const d = useDict();
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
    const delta = Math.max(0, e.clientY - startY.current);
    if (delta > 6) dragged.current = true;
    setDy(delta);
  }
  function onUp() {
    startY.current = null;
    if (dy > CLOSE_DRAG) {
      onClose();
      return;
    }
    setDy(0);
  }

  return (
    <div
      className="flex h-9 shrink-0 cursor-grab touch-none items-start justify-center pt-[max(0.5rem,env(safe-area-inset-top))] active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={() => {
        if (!dragged.current) onClose();
      }}
      style={{ transform: dy > 0 ? `translateY(${dy * 0.55}px)` : undefined }}
      role="button"
      tabIndex={0}
      aria-label={d.os.closeHint}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClose();
      }}
    >
      <span className="h-1 w-10 rounded-full bg-fg/30" />
    </div>
  );
}