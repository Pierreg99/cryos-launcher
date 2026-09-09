"use client";

import { useDict } from "@/i18n";

/**
 * Module 4 — Gesture pill (visual). All pointer logic lives in the
 * native system-gesture layer (use-gestures.ts): tap = home,
 * hold ≥ 400 ms = recents, swipe up = home/drawer, swipe-up-hold = recents.
 * `data-gesture-pill` marks the hit target for that layer.
 */
export function GestureBar() {
  const d = useDict();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[65] flex h-7 items-center justify-center pb-[env(safe-area-inset-bottom)]">
      <div
        data-gesture-pill
        role="button"
        tabIndex={-1}
        aria-label={d.os.homeHint}
        title={d.os.recentsHint}
        className="pointer-events-auto flex h-full w-40 cursor-pointer items-center justify-center"
      >
        <span className="h-[5px] w-28 rounded-full bg-fg/45 transition-colors duration-200 hover:bg-fg/70" />
      </div>
    </div>
  );
}
