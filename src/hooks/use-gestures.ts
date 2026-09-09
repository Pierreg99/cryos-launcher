import { useEffect, useRef, type RefObject } from "react";

/**
 * System gesture layer (Android gesture-nav grammar), one native pointer
 * tracker bound to the OS viewport:
 *
 *  - bottom edge / gesture pill: swipe up → home (or drawer when already
 *    home), hold ≥ 400 ms (or swipe-up-and-hold) → recents, pill tap → home
 *  - left / right screen edge: inward swipe ≥ 56 px → back
 *  - top edge (status bar): swipe down ≥ 56 px → notification shade
 *
 * Native listeners + pointer capture keep reaction < 100 ms; preventDefault
 * is only issued once a gesture fires (suppresses the compat click).
 */

export type GestureCallbacks = {
  onBottomSwipeUp: () => void;
  onBottomHold: () => void;
  onPillTap: () => void;
  onEdgeBack: (side: "left" | "right") => void;
  onTopSwipeDown: () => void;
};

const BOTTOM_ZONE = 30;
const TOP_ZONE = 32;
const EDGE_ZONE = 16;
const SLOP = 8;
const SWIPE_UP_MIN = 64;
const HOLD_RECENTS_MIN_RATIO = 0.35;
const HOLD_MS = 400;
const EDGE_BACK_MIN = 56;
const TOP_DOWN_MIN = 56;

export function useSystemGestures(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  callbacks: GestureCallbacks,
): void {
  const cb = useRef(callbacks);
  cb.current = callbacks;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    type Mode = "none" | "bottom" | "top" | "left" | "right";
    let mode: Mode = "none";
    let id: number | null = null;
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let dragging = false;
    let fired = false;
    let onPill = false;

    const reset = () => {
      mode = "none";
      id = null;
      dragging = false;
      fired = false;
      onPill = false;
    };

    const onDown = (e: PointerEvent) => {
      if (id !== null || e.button === 2) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const target = e.target as Element | null;
      const pill = target?.closest?.("[data-gesture-pill]") != null;
      // launcher icons own their pointers (long-press drag & drop)
      if (!pill && target?.closest?.("[data-drag-slot]") != null) return;

      if (pill || y > r.height - BOTTOM_ZONE) mode = "bottom";
      else if (y < TOP_ZONE) mode = "top";
      else if (x < EDGE_ZONE) mode = "left";
      else if (x > r.width - EDGE_ZONE) mode = "right";
      else return;

      id = e.pointerId;
      x0 = e.clientX;
      y0 = e.clientY;
      t0 = performance.now();
      dragging = false;
      fired = false;
      onPill = pill;
    };

    const onMove = (e: PointerEvent) => {
      if (id !== e.pointerId) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;

      if (!dragging && Math.hypot(dx, dy) > SLOP) {
        dragging = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // capture is best-effort
        }
      }
      if (!dragging || fired) return;

      if (
        mode === "bottom" &&
        dy < -el.clientHeight * HOLD_RECENTS_MIN_RATIO &&
        performance.now() - t0 > HOLD_MS
      ) {
        fired = true;
        cb.current.onBottomHold();
      } else if (mode === "top" && dy > TOP_DOWN_MIN) {
        fired = true;
        cb.current.onTopSwipeDown();
      } else if (mode === "left" && dx > EDGE_BACK_MIN && Math.abs(dx) > Math.abs(dy)) {
        fired = true;
        cb.current.onEdgeBack("left");
      } else if (mode === "right" && dx < -EDGE_BACK_MIN && Math.abs(dx) > Math.abs(dy)) {
        fired = true;
        cb.current.onEdgeBack("right");
      }

      if (fired) e.preventDefault();
    };

    const onUp = (e: PointerEvent) => {
      if (id !== e.pointerId) return;
      const dy = e.clientY - y0;
      const dt = performance.now() - t0;

      if (fired) {
        e.preventDefault();
        reset();
        return;
      }
      if (mode === "bottom") {
        if (dragging && dy < -SWIPE_UP_MIN) {
          cb.current.onBottomSwipeUp();
        } else if (onPill && !dragging && dt >= HOLD_MS) {
          cb.current.onBottomHold();
        } else if (onPill && !dragging) {
          cb.current.onPillTap();
        }
      }
      reset();
    };

    const onCancel = (e: PointerEvent) => {
      if (id === e.pointerId) reset();
    };

    el.addEventListener("pointerdown", onDown, { passive: false });
    el.addEventListener("pointermove", onMove, { passive: false });
    el.addEventListener("pointerup", onUp, { passive: false });
    el.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
    };
  }, [ref, enabled]);
}
