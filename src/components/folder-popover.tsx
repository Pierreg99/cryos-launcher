"use client";

import { motion } from "framer-motion";
import { useDict } from "@/i18n";
import { useShell, type DragSource } from "@/store/shell";
import type { AppId, GridFolder } from "@/lib/apps";
import { useSlotDrag, type DragApi } from "@/hooks/use-slot-drag";
import { AppIcon } from "@/components/app-icon";
import type { DragState } from "@/components/home-screen";

/**
 * Module 3 — Folder popover: tap to launch, long-press/drag to pull an
 * app out onto the grid or dock (shares the HomeScreen drag state).
 * Single motion root so AnimatePresence can animate the exit.
 */
export function FolderPopover({
  folderId,
  drag,
  api,
}: {
  folderId: string;
  drag: DragState | null;
  api: DragApi;
}) {
  const d = useDict();
  const grid = useShell((s) => s.grid);
  const closeFolder = useShell((s) => s.closeFolder);

  const slot = grid.find(
    (item): item is GridFolder =>
      item !== null && item.kind === "folder" && item.id === folderId,
  );
  if (!slot) return null;

  return (
    <motion.div
      className="absolute inset-0 z-[58] grid place-items-center bg-black/30 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={closeFolder}
      role="dialog"
      aria-label={slot.name || d.folder.defaultName}
    >
      <motion.div
        className="mx-6 w-full max-w-[320px]"
        initial={{ scale: 0.86, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-3xl bg-surface-solid/95 p-5 shadow-2xl shadow-black/40 ring-1 ring-line backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide">
              {slot.name || d.folder.defaultName}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {slot.appIds.length} apps
            </span>
          </div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-4" style={{ touchAction: "none" }}>
            {slot.appIds.map((appId, index) => (
              <FolderItem
                key={appId}
                appId={appId}
                index={index}
                folderId={folderId}
                drag={drag}
                api={api}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FolderItem({
  appId,
  index,
  folderId,
  drag,
  api,
}: {
  appId: AppId;
  index: number;
  folderId: string;
  drag: DragState | null;
  api: DragApi;
}) {
  const launchApp = useShell((s) => s.launchApp);
  const from: DragSource = { zone: "folder", folderId, index };
  const handlers = useSlotDrag(from, { kind: "app", appId }, api, () => launchApp(appId));
  const isSource =
    drag !== null &&
    drag.from.zone === "folder" &&
    drag.from.folderId === folderId &&
    drag.from.index === index;

  return (
    <div {...handlers} data-drag-slot className="grid cursor-pointer touch-none place-items-center rounded-2xl py-1">
      <AppIcon appId={appId} dimmed={isSource} />
    </div>
  );
}
