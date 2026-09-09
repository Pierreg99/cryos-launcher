"use client";

import { forwardRef } from "react";
import { useShell, type DragSource } from "@/store/shell";
import { DOCK_SIZE, type Dock as DockLayout } from "@/lib/apps";
import { cn } from "@/lib/utils";
import { useSlotDrag, type DragApi } from "@/hooks/use-slot-drag";
import { AppIcon } from "@/components/app-icon";
import type { DragState } from "@/components/home-screen";

type DockProps = {
  dock: DockLayout;
  drag: DragState | null;
  api: DragApi;
};

/** Module 3 — Dock: five favourite apps, drag & drop with the grid. */
export const Dock = forwardRef<HTMLDivElement, DockProps>(function Dock(
  { dock, drag, api },
  ref,
) {
  return (
    <div className="mx-4 mb-1.5 mt-1 shrink-0 px-3 pb-2 pt-2.5">
      <div
        ref={ref}
        className="flex items-center justify-between rounded-[26px] bg-surface px-3 py-2 ring-1 ring-line backdrop-blur-xl"
        style={{ touchAction: "none" }}
      >
        {dock.slice(0, DOCK_SIZE).map((appId, index) => (
          <DockSlot key={index} index={index} appId={appId} drag={drag} api={api} />
        ))}
      </div>
    </div>
  );
});

function DockSlot({
  index,
  appId,
  drag,
  api,
}: {
  index: number;
  appId: DockLayout[number];
  drag: DragState | null;
  api: DragApi;
}) {
  const launchApp = useShell((s) => s.launchApp);

  const from: DragSource = { zone: "dock", index };
  const handlers = useSlotDrag(
    from,
    appId ? { kind: "app", appId } : null,
    api,
    () => {
      if (appId) launchApp(appId);
    },
  );

  const isSource = drag !== null && drag.from.zone === "dock" && drag.from.index === index;
  const isOver =
    drag !== null &&
    !isSource &&
    drag.over !== null &&
    drag.over.zone === "dock" &&
    drag.over.index === index;

  return (
    <div
      {...handlers}
      data-drag-slot
      className={cn(
        "grid size-14 cursor-pointer touch-none place-items-center rounded-2xl transition-colors duration-100",
        isOver && "bg-primary/20 ring-2 ring-primary/60",
        drag !== null && appId === null && !isOver && "border border-dashed border-fg/25",
      )}
    >
      {appId && <AppIcon appId={appId} size="sm" showLabel={false} dimmed={isSource} />}
    </div>
  );
}
