"use client";

import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { DESKTOP_PINNED } from "@/lib/apps";
import { useViewport } from "@/components/viewport-context";
import { AppIcon } from "@/components/app-icon";

/** Desktop icons — the pinned ices/apps, column flow at the top-left. */
export function DesktopIcons() {
  const d = useDict();
  const winOpen = useShell((s) => s.winOpen);
  const viewportRef = useViewport();

  const open = (appId: (typeof DESKTOP_PINNED)[number]) => {
    const r = viewportRef.current?.getBoundingClientRect();
    winOpen(appId, r ? { w: r.width, h: r.height } : undefined);
  };

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 grid grid-flow-col grid-rows-3 gap-1">
      {DESKTOP_PINNED.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => open(id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="pointer-events-auto flex w-[88px] cursor-pointer flex-col items-center gap-1.5 rounded-xl p-2 transition-all hover:bg-white/10 active:scale-95"
            aria-label={d.apps[id]}
          >
            <AppIcon appId={id} />
          </button>
      ))}
    </div>
  );
}
