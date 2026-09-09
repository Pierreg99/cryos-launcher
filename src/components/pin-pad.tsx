"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Delete, Lock } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { Wallpaper } from "@/components/wallpaper";

/**
 * Module 2 (optional) — PIN pad mock. Purely visual: any 4 digits thaw
 * the session. No real auth, no stored secret.
 */
export function PinPad() {
  const d = useDict();
  const acceptPin = useShell((s) => s.acceptPin);
  const cancelPin = useShell((s) => s.cancelPin);
  const [pin, setPin] = useState("");
  const accepted = useRef(false);

  function press(digit: string) {
    if (accepted.current) return;
    setPin((p) => {
      const next = (p + digit).slice(0, 4);
      if (next.length === 4) {
        accepted.current = true;
        window.setTimeout(() => acceptPin(), 260);
      }
      return next;
    });
  }

  function backspace() {
    if (accepted.current) return;
    setPin((p) => p.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <motion.div
      className="absolute inset-0 z-[80] flex flex-col items-center bg-background/55 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onKeyDown={(e) => {
        if (e.key === "Escape") cancelPin();
        if (/^[0-9]$/.test(e.key)) press(e.key);
        if (e.key === "Backspace") backspace();
      }}
      tabIndex={0}
      role="dialog"
      aria-label={d.lock.pinTitle}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Wallpaper variant="lock" />
      </div>

      <button
        type="button"
        onClick={cancelPin}
        aria-label={d.os.backHint}
        className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-fg"
      >
        <ChevronDown className="size-5" />
      </button>

      <Lock className="mt-[max(5rem,12vh)] size-7 text-primary" strokeWidth={1.5} />
      <p className="mt-4 text-lg font-medium">{d.lock.pinTitle}</p>

      <div className="mt-7 flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            animate={{
              scale: i < pin.length ? [1, 1.35, 1] : 1,
              backgroundColor: i < pin.length ? "var(--primary)" : "transparent",
            }}
            transition={{ duration: 0.22 }}
            className="size-3.5 rounded-full ring-1 ring-primary"
          />
        ))}
      </div>

      <div className="mt-auto grid w-full max-w-[280px] grid-cols-3 gap-x-5 gap-y-4 px-6 pb-4">
        {keys.map((k, i) =>
          k === "" ? (
            <span key={`empty-${i}`} aria-hidden />
          ) : k === "del" ? (
            <button
              key="del"
              type="button"
              onClick={backspace}
              aria-label={d.lock.pinClear}
              className="grid size-16 place-self-center place-items-center rounded-full text-muted transition-transform active:scale-90"
            >
              <Delete className="size-6" strokeWidth={1.5} />
            </button>
          ) : (
            <motion.button
              key={k}
              type="button"
              onPointerDown={() => press(k)}
              whileTap={{ scale: 0.92 }}
              className="grid size-16 place-self-center place-items-center rounded-full bg-surface-2 text-2xl font-light tabular-nums ring-1 ring-line transition-colors hover:bg-primary/15"
            >
              {k}
            </motion.button>
          ),
        )}
      </div>

      <AnimatePresence>
        {pin.length === 4 && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pb-[max(1.5rem,env(safe-area-inset-bottom))] font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
          >
            thawing…
          </motion.p>
        )}
      </AnimatePresence>
      {pin.length < 4 && (
        <p className="pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-muted">
          {d.lock.pinHint}
        </p>
      )}
    </motion.div>
  );
}
