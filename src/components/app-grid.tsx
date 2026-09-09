"use client";

import { forwardRef } from "react";
import { useShell, type DragSource } from "@/store/shell";
import { type Grid, type GridItem } from "@/lib/apps";
import { cn } from "@/lib/utils";
import { useSlotDrag, type DragApi } from "@/hooks/use-slot-drag";
import { SlotItem } from "@/components/app-icon";
import type { DragState } from "@/components/home-screen";

type AppGridProps = {
  grid: Grid;
  drag: DragState | null;
  api: DragApi;
};

/** Module 3 — Home-screen app grid: 4×5 slots, drag & drop, folders. */
export const AppGrid = forwardRef<HTMLDivElement, AppGridProps>(function AppGrid(
  { grid, drag, api },
  ref,
) {
  return (
    <div
      ref={ref}
      className="mx-1 grid min-h-0 flex-1 grid-cols-4 grid-rows-5 px-1"
      style={{ touchAction: "none" }}
    >
      {grid.map((item, index) => (
        <GridSlot key={index} index={index} item={item} drag={drag} api={api} />
      ))}
    </div>
  );
});

function GridSlot({
  index,
  item,
  drag,
  api,
}: {
  index: number;
  item: GridItem | null;
  drag: DragState | null;
  api: DragApi;
}) {
  const launchApp = useShell((s) => s.launchApp);
  const openFolder = useShell((s) => s.openFolder);

  const from: DragSource = { zone: "grid", index };
  const handlers = useSlotDrag(from, item, api, () => {
    if (!item) return;
    if (item.kind === "app") launchApp(item.appId);
    else openFolder(item.id);
  });

  const isSource =
    drag !== null &&
    ((drag.from.zone === "grid" && drag.from.index === index) ||
      (drag.from.zone === "folder" &&
        item?.kind === "folder" &&
        item.id === drag.from.folderId));
  const isOver =
    drag !== null &&
    !isSource &&
    drag.over !== null &&
    drag.over.zone === "grid" &&
    drag.over.index === index;

  return (
    <div className="grid place-items-center py-1.5">
      <div
        {...handlers}
        data-drag-slot
        className={cn(
          "relative flex h-[76px] w-full max-w-[84px] cursor-pointer touch-none items-center justify-center rounded-2xl transition-colors duration-100",
          isOver && "bg-primary/20 ring-2 ring-primary/60",
          drag !== null && item === null && !isOver && "border border-dashed border-fg/25",
        )}
      >
        {item !== null && <SlotItem item={item} dimmed={isSource} />}
      </div>
    </div>
  );
}