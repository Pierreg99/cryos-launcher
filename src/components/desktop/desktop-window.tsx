"use client";

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Copy, Minus, Square, X } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell, type WinState } from "@/store/shell";
import { APPS } from "@/lib/apps";
import {
  MIN_H,
  MIN_W,
  TASKBAR_H,
  snapGeometry,
  snapZoneFor,
  type SnapZone,
} from "@/lib/desktop";
import { clamp, cn } from "@/lib/utils";
import { useViewport } from "@/components/viewport-context";
import { AppContent } from "@/components/apps/app-content";

type Dir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type DragState = {
  mode: "move" | "resize";
  dir: Dir | null;
  x0: number;
  y0: number;
  g: { x: number; y: number; w: number; h: number };
  snap: SnapZone | null;
};

const HANDLES: { dir: Dir; cls: string }[] = [
  { dir: "n", cls: "inset-x-3 -top-1 h-2 cursor-ns-resize" },
  { dir: "s", cls: "inset-x-3 -bottom-1 h-2 cursor-ns-resize" },
  { dir: "w", cls: "inset-y-3 -left-1 w-2 cursor-ew-resize" },
  { dir: "e", cls: "inset-y-3 -right-1 w-2 cursor-ew-resize" },
  { dir: "nw", cls: "-left-1 -top-1 size-3.5 cursor-nwse-resize" },
  { dir: "se", cls: "-bottom-1 -right-1 size-3.5 cursor-nwse-resize" },
  { dir: "ne", cls: "-right-1 -top-1 size-3.5 cursor-nesw-resize" },
  { dir: "sw", cls: "-bottom-1 -left-1 size-3.5 cursor-nesw-resize" },
];

/**
 * Window manager window — drag by the title bar, 8-way edge/corner
 * resize, minimize / maximize-restore / close, double-click title to
 * maximize. Single instance per app (enforced by the store).
 */
export function DesktopWindow({ win, layer }: { win: WinState; layer: number }) {
  const d = useDict();
  const winFocus = useShell((s) => s.winFocus);
  const winMove = useShell((s) => s.winMove);
  const winResize = useShell((s) => s.winResize);
  const winMinimize = useShell((s) => s.winMinimize);
  const winToggleMax = useShell((s) => s.winToggleMax);
  const winClose = useShell((s) => s.winClose);
  const setSnapPreview = useShell((s) => s.setSnapPreview);
  const viewportRef = useViewport();

  const app = APPS[win.appId];
  const Glyph = app.icon;
  const drag = useRef<DragState | null>(null);

  const begin = (
    e: ReactPointerEvent<HTMLElement>,
    mode: "move" | "resize",
    dir: Dir | null,
  ) => {
    if (e.button === 2) return;
    if (mode === "move" && (e.target as Element).closest("button")) return;
    e.stopPropagation();

    let g = { x: win.x, y: win.y, w: win.w, h: win.h };
    if (win.max) {
      if (mode !== "move") return; // maximized windows do not resize by edge
      // drag-out of maximize: restore under the pointer, OS-style
      const r = viewportRef.current?.getBoundingClientRect();
      if (r) {
        g = {
          x: clamp(e.clientX - r.left - win.w / 2, 0, Math.max(0, r.width - win.w)),
          y: clamp(e.clientY - r.top - 18, 0, Math.max(0, r.height - TASKBAR_H - 40)),
          w: win.w,
          h: win.h,
        };
        winToggleMax(win.id);
        winResize(win.id, { x: g.x, y: g.y });
      }
    }

    drag.current = { mode, dir, x0: e.clientX, y0: e.clientY, g, snap: null };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // best-effort capture
    }
    winFocus(win.id);
  };

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const st = drag.current;
    if (!st) return;
    const dx = e.clientX - st.x0;
    const dy = e.clientY - st.y0;

    if (st.mode === "move") {
      const r = viewportRef.current?.getBoundingClientRect();
      if (!r) return;
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const zone = snapZoneFor(px, py, r.width, r.height);
      if (zone !== null) {
        if (st.snap !== zone) {
          st.snap = zone;
          setSnapPreview(snapGeometry(zone, r.width, r.height));
        }
        return; // window freezes while the preview shows the snap target
      }
      if (st.snap !== null) {
        st.snap = null;
        setSnapPreview(null);
      }
      winMove(
        win.id,
        clamp(st.g.x + dx, -(st.g.w - 120), Math.max(8, r.width - 120)),
        clamp(st.g.y + dy, 0, Math.max(8, r.height - TASKBAR_H - 40)),
      );
      return;
    }

    const dir = st.dir ?? "se";
    let { x, y, w, h } = st.g;
    if (dir.includes("e")) w = Math.max(MIN_W, st.g.w + dx);
    if (dir.includes("s")) h = Math.max(MIN_H, st.g.h + dy);
    if (dir.includes("w")) {
      w = Math.max(MIN_W, st.g.w - dx);
      x = st.g.x + (st.g.w - w);
    }
    if (dir.includes("n")) {
      h = Math.max(MIN_H, st.g.h - dy);
      y = st.g.y + (st.g.h - h);
    }
    winResize(win.id, { x, y, w, h });
  };

  const onUp = () => {
    const st = drag.current;
    drag.current = null;
    if (!st) return;
    if (st.snap !== null) {
      const r = viewportRef.current?.getBoundingClientRect();
      if (r) winResize(win.id, snapGeometry(st.snap, r.width, r.height));
      setSnapPreview(null);
    }
  };

  return (
    <motion.div
      className={cn(
        "absolute flex flex-col rounded-xl bg-surface-solid/97 shadow-2xl shadow-black/45 ring-1 ring-line",
        win.min && "pointer-events-none",
      )}
      style={
        win.max
          ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR_H}px)`, zIndex: layer }
          : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: layer }
      }
      initial={{ opacity: 0, scale: 0.965 }}
      animate={{ opacity: win.min ? 0 : 1, scale: win.min ? 0.94 : 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
      onPointerDown={() => winFocus(win.id)}
      role="dialog"
      aria-label={d.apps[win.appId]}
    >
      {/* title bar */}
      <div
        onPointerDown={(e) => begin(e, "move", null)}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={() => winToggleMax(win.id)}
        className={cn(
          "flex h-9 shrink-0 touch-none items-center gap-2 rounded-t-xl border-b border-line bg-surface-2/70 pl-2.5 pr-1",
          win.max ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
      >
        <span
          className={cn("grid size-5 shrink-0 place-items-center rounded-[6px] bg-gradient-to-br", app.tint)}
        >
          <Glyph className="size-3 text-white" strokeWidth={2} />
        </span>
        <span className="truncate text-xs font-semibold">{d.apps[win.appId]}</span>
        <div className="ml-auto flex shrink-0 items-center">
          <WinButton label={d.desktop.minimize} onClick={() => winMinimize(win.id)}>
            <Minus className="size-3.5" />
          </WinButton>
          <WinButton
            label={win.max ? d.desktop.restore : d.desktop.maximize}
            onClick={() => winToggleMax(win.id)}
          >
            {win.max ? <Copy className="size-3" /> : <Square className="size-3" />}
          </WinButton>
          <WinButton label={d.desktop.close} onClick={() => winClose(win.id)}>
            <X className="size-3.5" />
          </WinButton>
        </div>
      </div>

      {/* content */}
      <div
        className="no-scrollbar min-h-0 flex-1 overflow-hidden overflow-y-auto rounded-b-xl"
        style={{ touchAction: "pan-y" }}
      >
        <AppContent appId={win.appId} />
      </div>

      {/* resize handles */}
      {!win.max &&
        HANDLES.map((h) => (
          <div
            key={h.dir}
            className={cn("absolute z-10 touch-none", h.cls)}
            onPointerDown={(e) => begin(e, "resize", h.dir)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-hidden
          />
        ))}
    </motion.div>
  );
}

function WinButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="grid size-7 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </button>
  );
}
