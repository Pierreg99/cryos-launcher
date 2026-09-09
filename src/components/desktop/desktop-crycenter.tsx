"use client";

import { motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { DISTROS, ICE_SLUGS, markSlugFor } from "@/lib/crybel";
import { TASKBAR_H } from "@/lib/desktop";
import { cn, type CSSVars } from "@/lib/utils";
import { DistroMark } from "@/components/distro-mark";
import { NotificationsSection, QsGrid } from "@/components/qs-controls";

/**
 * CryCenter (desktop) — split from notifications, per the session
 * contract: control center (quick settings, ice switcher, lock) over the
 * notification list. Anchored above the taskbar, bottom-right.
 */
export function CryCenter() {
  const d = useDict();
  const ice = useShell((s) => s.settings.ice);
  const setSetting = useShell((s) => s.setSetting);
  const setCryCenter = useShell((s) => s.setCryCenter);
  const lockNow = useShell((s) => s.lockNow);

  return (
    <motion.div
      className="absolute right-3 z-[60] flex max-h-[76%] w-[380px] flex-col overflow-hidden rounded-2xl bg-surface-solid/95 shadow-2xl shadow-black/50 ring-1 ring-line backdrop-blur-2xl"
      style={{ bottom: TASKBAR_H + 8 } as CSSVars}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.17, ease: [0.32, 0.72, 0, 1] }}
      onPointerDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="CryCenter"
    >
      {/* header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line px-4 py-3">
        <DistroMark slug={markSlugFor(ice)} className="size-5 text-primary" />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.26em]">CryCenter</h2>
        <span className="ml-1 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
          {DISTROS[ice].base}
        </span>
        <button
          type="button"
          onClick={() => setCryCenter(false)}
          aria-label={d.os.closeHint}
          className="ml-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3">
        {/* control center */}
        <QsGrid />

        {/* ice switcher — switch ice from CryCenter or Settings */}
        <div className="mt-4">
          <h3 className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            {d.settingsApp.ice}
          </h3>
          <div className="flex items-center justify-between gap-1 rounded-2xl bg-surface-2 px-2 py-2 ring-1 ring-line">
            {ICE_SLUGS.map((slug) => {
              const distro = DISTROS[slug];
              const active = ice === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSetting("ice", slug)}
                  aria-pressed={active}
                  title={`${distro.name} — ${distro.base}`}
                  aria-label={distro.name}
                  className={cn(
                    "grid size-10 cursor-pointer place-items-center rounded-xl transition-all active:scale-90",
                    active
                      ? "bg-primary/15 ring-1 ring-primary/60"
                      : "text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  <DistroMark
                    slug={markSlugFor(slug)}
                    className={cn("size-6", active && "text-primary")}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* lock */}
        <button
          type="button"
          onClick={lockNow}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-surface-2 px-4 py-2.5 text-[12px] font-semibold text-muted ring-1 ring-line transition-colors hover:bg-primary/15 hover:text-primary"
        >
          <Lock className="size-4" />
          {d.desktop.lock}
        </button>

        {/* notifications (split, below the controls) */}
        <NotificationsSection />
      </div>
    </motion.div>
  );
}
