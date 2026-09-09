"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useShell, type DragSource, type DropTarget } from "@/store/shell";
import { DOCK_SIZE, GRID_COLS, GRID_ROWS, type GridItem } from "@/lib/apps";
import { clamp } from "@/lib/utils";
import type { DragApi } from "@/hooks/use-slot-drag";
import { useViewport } from "@/components/viewport-context";
import { StatusBar } from "@/components/status-bar";
import { WidgetSlot } from "@/components/widget-slot";
import { AppGrid } from "@/components/app-grid";
import { Dock } from "@/components/dock";
import { FolderPopover } from "@/components/folder-popover";
import { SlotItem } from "@/components/app-icon";

export type DragState = {
  from: DragSource;
  item: GridItem;
  /** viewport-relative pointer position */
  x: number;
  y: number;
  over: DropTarget;
};

type Rects = { grid: DOMRect | null; dock: DOMRect | null; vp: DOMRect | null };

/**
 * Module 3 — Home screen: status bar, widgets slot, app grid, dock.
 * Owns the single drag state shared by grid / dock / folder popover and
 * renders the drag ghost in viewport coordinates.
 */
export function HomeScreen() {
  const grid = useShell((s) => s.grid);
  const dock = useShell((s) => s.dock);
  const folderOpen = useShell((s) => s.folderOpen);
  const viewportRef = useViewport();

  const gridRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const rects = useRef<Rects>({ grid: null, dock: null, vp: null });
  const [drag, setDrag] = useState<DragState | null>(null);

  const computeOver = useCallback((cx: number, cy: number): DropTarget => {
    const { grid: g, dock: dk } = rects.current;
    if (dk && cy >= dk.top && cy <= dk.bottom && cx >= dk.left && cx <= dk.right) {
      const idx = Math.floor(((cx - dk.left) / dk.width) * DOCK_SIZE);
      return { zone: "dock", index: clamp(idx, 0, DOCK_SIZE - 1) };
    }
    if (g && cy >= g.top - 10 && cy <= g.bottom + 10 && cx >= g.left && cx <= g.right) {
      const cw = g.width / GRID_COLS;
      const ch = g.height / GRID_ROWS;
      const col = clamp(Math.floor((cx - g.left) / cw), 0, GRID_COLS - 1);
      const row = clamp(Math.floor((cy - g.top) / ch), 0, GRID_ROWS - 1);
      return { zone: "grid", index: row * GRID_COLS + col };
    }
    return null;
  }, []);

  const api = useMemo<DragApi>(
    () => ({
      start(from, item, cx, cy) {
        rects.current = {
          grid: gridRef.current?.getBoundingClientRect() ?? null,
          dock: dockRef.current?.getBoundingClientRect() ?? null,
          vp: viewportRef.current?.getBoundingClientRect() ?? null,
        };
        const vp = rects.current.vp;
        setDrag({
          from,
          item,
          x: cx - (vp?.left ?? 0),
          y: cy - (vp?.top ?? 0),
          over: computeOver(cx, cy),
        });
      },
      move(cx, cy) {
        const vp = rects.current.vp;
        setDrag((d) =>
          d === null
            ? d
            : {
                ...d,
                x: cx - (vp?.left ?? 0),
                y: cy - (vp?.top ?? 0),
                over: computeOver(cx, cy),
              },
        );
      },
      end(cancel) {
        setDrag((d) => {
          if (d !== null) {
            useShell.getState().drop({ from: d.from, to: cancel ? null : d.over });
          }
          return null;
        });
      },
    }),
    [computeOver, viewportRef],
  );

  return (
    <div className="absolute inset-0 z-10 flex flex-col">
      <StatusBar />
      <WidgetSlot />
      <AppGrid ref={gridRef} grid={grid} drag={drag} api={api} />
      <Dock ref={dockRef} dock={dock} drag={drag} api={api} />
      {/* spacer for the gesture pill strip */}
      <div className="h-6 shrink-0 pb-[env(safe-area-inset-bottom)]" aria-hidden />

      <AnimatePresence initial={false}>
        {folderOpen !== null && (
          <FolderPopover key="folder" folderId={folderOpen} drag={drag} api={api} />
        )}
      </AnimatePresence>

      {/* drag ghost */}
      {drag !== null && (
        <div
          className="pointer-events-none absolute z-[62] drop-shadow-2xl"
          style={{
            left: drag.x,
            top: drag.y,
            transform: "translate(-50%, -58%) scale(1.08) rotate(1.5deg)",
          }}
        >
          <SlotItem item={drag.item} />
        </div>
      )}
    </div>
  );
}
