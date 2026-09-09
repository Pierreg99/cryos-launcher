"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { Lock, Search } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { APP_IDS, APPS } from "@/lib/apps";
import { DISTROS, markSlugFor } from "@/lib/crybel";
import { TASKBAR_H } from "@/lib/desktop";
import { useViewport } from "@/components/viewport-context";
import { DistroMark } from "@/components/distro-mark";
import { AppIcon } from "@/components/app-icon";

/** Start menu — searchable app grid + ice identity + lock session. */
export function DesktopAppMenu() {
  const d = useDict();
  const ice = useShell((s) => s.settings.ice);
  const winOpen = useShell((s) => s.winOpen);
  const lockNow = useShell((s) => s.lockNow);
  const viewportRef = useViewport();
  const [query, setQuery] = useState("");

  const apps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APP_IDS.filter((id) => !q || d.apps[id].toLowerCase().includes(q)).sort((a, b) =>
      d.apps[a].localeCompare(d.apps[b]),
    );
  }, [query, d]);

  const distro = DISTROS[ice];

  return (
    <motion.div
      className="absolute left-3 z-[60] flex max-h-[72%] w-[430px] flex-col overflow-hidden rounded-2xl bg-surface-solid/95 shadow-2xl shadow-black/50 ring-1 ring-line backdrop-blur-2xl"
      style={{ bottom: TASKBAR_H + 8 } as CSSProperties}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.17, ease: [0.32, 0.72, 0, 1] }}
      onPointerDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={d.desktop.appMenu}
    >
      <div className="shrink-0 p-3 pb-2">
        <div className="flex items-center gap-2.5 rounded-full bg-surface-2 px-4 py-2 ring-1 ring-line focus-within:ring-primary/60">
          <Search className="size-4 shrink-0 text-muted" strokeWidth={2} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={d.drawer.search}
            aria-label={d.drawer.search}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted select-text"
          />
        </div>
      </div>

      <div className="no-scrollbar grid min-h-0 grid-cols-4 content-start gap-1.5 overflow-y-auto px-3 pb-3">
        {apps.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              const r = viewportRef.current?.getBoundingClientRect();
              winOpen(id, r ? { w: r.width, h: r.height } : undefined);
            }}
            aria-label={d.apps[id]}
            className="grid cursor-pointer place-items-center rounded-xl p-2 transition-all hover:bg-surface-2 active:scale-95"
          >
            <AppIcon appId={id} />
          </button>
        ))}
        {apps.length === 0 && (
          <p className="col-span-4 py-8 text-center text-sm text-muted">{d.drawer.empty}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2.5 border-t border-line px-3.5 py-2.5">
        <DistroMark slug={markSlugFor(ice)} className="size-6 text-primary" />
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold">{distro.name}</span>
          <span className="block truncate font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
            {distro.base}
          </span>
        </span>
        <button
          type="button"
          onClick={lockNow}
          aria-label={d.desktop.lock}
          title={d.desktop.lock}
          className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-muted ring-1 ring-line transition-colors hover:bg-primary/15 hover:text-primary"
        >
          <Lock className="size-3.5" />
          {d.desktop.lock}
        </button>
      </div>
    </motion.div>
  );
}
