import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { DragSource, DropTarget, GridItem } from "@/store/shell";

/**
 * Long-press / immediate-drag controller for launcher icons (grid slots,
 * dock slots, folder items). One shared drag state lives in HomeScreen;
 * slots only report begin/move/end and handle their own tap.
 */

export type DragApi = {
  start: (from: DragSource, item: GridItem, clientX: number, clientY: number) => void;
  move: (clientX: number, clientY: number) => void;
  end: (cancel: boolean) => void;
};

export type SlotDragHandlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
};

const LONG_PRESS_MS = 380;
const DRAG_SLOP = 10;
const TAP_MAX_MS = 500;

export function useSlotDrag(
  from: DragSource,
  item: GridItem | null,
  api: DragApi,
  onTap: () => void,
): SlotDragHandlers {
  const st = useRef({
    id: null as number | null,
    x0: 0,
    y0: 0,
    t0: 0,
    timer: 0 as ReturnType<typeof setTimeout> | 0,
    dragged: false,
  });

  const activate = (clientX: number, clientY: number) => {
    const s = st.current;
    if (s.dragged || !item) return;
    s.dragged = true;
    if (s.timer) clearTimeout(s.timer);
    s.timer = 0;
    api.start(from, item, clientX, clientY);
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(8);
      }
    } catch {
      // haptics are best-effort
    }
  };

  const finish = (cancel: boolean) => {
    const s = st.current;
    if (s.timer) clearTimeout(s.timer);
    if (s.dragged) api.end(cancel);
    s.id = null;
    s.timer = 0;
    s.dragged = false;
  };

  return {
    onPointerDown: (e) => {
      const s = st.current;
      if (s.id !== null || !item || e.button === 2) return;
      s.id = e.pointerId;
      s.x0 = e.clientX;
      s.y0 = e.clientY;
      s.t0 = performance.now();
      s.dragged = false;
      s.timer = setTimeout(() => activate(e.clientX, e.clientY), LONG_PRESS_MS);
    },
    onPointerMove: (e) => {
      const s = st.current;
      if (s.id !== e.pointerId) return;
      if (!s.dragged && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > DRAG_SLOP) {
        activate(e.clientX, e.clientY);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // best-effort capture
        }
      }
      if (s.dragged) api.move(e.clientX, e.clientY);
    },
    onPointerUp: (e) => {
      const s = st.current;
      if (s.id !== e.pointerId) return;
      const wasDrag = s.dragged;
      const dt = performance.now() - s.t0;
      const small = Math.hypot(e.clientX - s.x0, e.clientY - s.y0) <= DRAG_SLOP;
      finish(false);
      if (!wasDrag && small && dt < TAP_MAX_MS) onTap();
    },
    onPointerCancel: () => finish(true),
  };
}
