"use client";

import { useDict } from "@/i18n";
import { APPS, type AppId, type GridFolder } from "@/lib/apps";
import { cn } from "@/lib/utils";

export type IconSize = "sm" | "md";

const TILE: Record<IconSize, string> = {
  sm: "size-10 rounded-[13px]",
  md: "size-14 rounded-[18px]",
};

const GLYPH: Record<IconSize, string> = {
  sm: "size-5",
  md: "size-6",
};

/** App icon tile — gradient frost tile + lucide glyph + optional label. */
export function AppIcon({
  appId,
  size = "md",
  showLabel = true,
  dimmed = false,
  className,
}: {
  appId: AppId;
  size?: IconSize;
  showLabel?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const d = useDict();
  const app = APPS[appId];
  const Glyph = app.icon;
  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-1.5", className)}>
      <div
        className={cn(
          "grid shrink-0 place-items-center bg-gradient-to-br shadow-lg shadow-black/20 ring-1 ring-white/15 transition-opacity",
          app.tint,
          TILE[size],
          dimmed && "opacity-20",
        )}
      >
        <Glyph className={cn("text-white drop-shadow-sm", GLYPH[size])} strokeWidth={1.9} />
      </div>
      {showLabel && (
        <span className="icon-label max-w-[72px] truncate text-center text-[11px] font-medium text-fg">
          {d.apps[appId]}
        </span>
      )}
    </div>
  );
}

/** Folder tile — 2×2 mini-grid of its first four apps. */
export function FolderTile({
  folder,
  dimmed = false,
}: {
  folder: GridFolder;
  dimmed?: boolean;
}) {
  const d = useDict();
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div
        className={cn(
          "grid size-14 grid-cols-2 place-items-center gap-[3px] rounded-[18px] bg-surface p-1.5 shadow-lg shadow-black/15 ring-1 ring-line backdrop-blur-xl transition-opacity",
          dimmed && "opacity-20",
        )}
      >
        {folder.appIds.slice(0, 4).map((id) => {
          const Glyph = APPS[id].icon;
          return (
            <span
              key={id}
              className={cn(
                "grid size-5 place-items-center rounded-[6px] bg-gradient-to-br",
                APPS[id].tint,
              )}
            >
              <Glyph className="size-3 text-white" strokeWidth={2} />
            </span>
          );
        })}
      </div>
      <span className="icon-label max-w-[72px] truncate text-center text-[11px] font-medium text-fg">
        {folder.name || d.folder.defaultName}
      </span>
    </div>
  );
}

/** Renders whatever lives in a grid slot. */
export function SlotItem({
  item,
  dimmed = false,
}: {
  item: NonNullable<import("@/lib/apps").GridItem>;
  dimmed?: boolean;
}) {
  return item.kind === "app" ? (
    <AppIcon appId={item.appId} dimmed={dimmed} />
  ) : (
    <FolderTile folder={item} dimmed={dimmed} />
  );
}
