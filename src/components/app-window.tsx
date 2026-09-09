"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { APPS, type AppId } from "@/lib/apps";
import { cn } from "@/lib/utils";
import { AppContent } from "@/components/apps/app-content";

/**
 * Full-screen activity mock — opens over the launcher when an app is
 * launched (grid, dock, drawer, folder, recents). Always mounted; the
 * inner AnimatePresence animates enter/exit around `openApp`.
 */
export function AppWindow() {
  const d = useDict();
  const openApp = useShell((s) => s.openApp);
  const goHome = useShell((s) => s.goHome);

  return (
    <AnimatePresence initial={false}>
      {openApp !== null && (
        <motion.div
          key="app-window"
          className="absolute inset-0 z-50 flex flex-col bg-background"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.19, ease: [0.32, 0.72, 0, 1] }}
          role="dialog"
          aria-label={d.apps[openApp]}
        >
          <AppWindowInner appId={openApp} onBack={goHome} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AppWindowInner({ appId, onBack }: { appId: AppId; onBack: () => void }) {
  const d = useDict();
  const app = APPS[appId];
  const Glyph = app.icon;

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-line px-2.5 pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={onBack}
          aria-label={d.os.backHint}
          className="grid size-9 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span
          className={cn("grid size-6 place-items-center rounded-md bg-gradient-to-br", app.tint)}
        >
          <Glyph className="size-3.5 text-white" strokeWidth={2} />
        </span>
        <h1 className="text-sm font-semibold tracking-wide">{d.apps[app.id]}</h1>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.24em] text-muted">
          cryOS
        </span>
      </header>

      <div
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-12"
        style={{ touchAction: "pan-y" }}
      >
        <AppContent appId={app.id} />
      </div>
    </>
  );
}
