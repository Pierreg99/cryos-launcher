"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useHydrated } from "@/hooks/use-hydrated";
import { useThemeSync } from "@/hooks/use-theme";
import { useSystemGestures } from "@/hooks/use-gestures";
import { useDesktopLayout } from "@/hooks/use-desktop-layout";
import { useShell } from "@/store/shell";
import { DISTROS } from "@/lib/crybel";
import type { CSSVars } from "@/lib/utils";
import { ViewportContext } from "@/components/viewport-context";
import { BootScreen } from "@/components/boot-screen";
import { LockScreen } from "@/components/lock-screen";
import { PinPad } from "@/components/pin-pad";
import { Session } from "@/components/session";
import { DesktopSession } from "@/components/desktop/desktop-os";

/**
 * Stage machine: boot → lock → (pin) → session.
 * Hosts the viewport ref, the per-ice accent ("same law, different
 * chrome") and the global system-gesture layer (phone grammar only —
 * the desktop session manages its own pointers).
 */
export function LauncherOS() {
  const ready = useHydrated();
  const stage = useShell((s) => s.stage);
  const ice = useShell((s) => s.settings.ice);
  const desktop = useDesktopLayout();
  const viewportRef = useRef<HTMLDivElement>(null);

  useThemeSync();

  useSystemGestures(viewportRef, ready && stage === "session" && !desktop, {
    onBottomSwipeUp: () => {
      const s = useShell.getState();
      if (s.shadeOpen || s.overlay !== "none" || s.openApp || s.folderOpen) {
        s.goHome();
      } else {
        s.openDrawer(); // Android grammar: swipe up on home opens the drawer
      }
    },
    onBottomHold: () => {
      useShell.getState().showRecents();
    },
    onPillTap: () => {
      useShell.getState().goHome();
    },
    onEdgeBack: () => {
      const s = useShell.getState();
      if (s.folderOpen) return s.closeFolder();
      if (s.shadeOpen) return s.setShade(false);
      if (s.overlay === "drawer") return s.closeDrawer();
      if (s.overlay === "recents") return s.hideRecents();
      if (s.openApp) return s.goHome();
    },
    onTopSwipeDown: () => {
      useShell.getState().setShade(true);
    },
  });

  // keep the document language in sync with the persisted locale
  const locale = useShell((s) => s.settings.locale);
  useEffect(() => {
    if (ready) document.documentElement.lang = locale;
  }, [locale, ready]);

  // per-ice accent: Crydroid keeps the default frost-blue token
  const accentStyle =
    ice === "crydroid" ? undefined : ({ "--primary": DISTROS[ice].accent } as CSSVars);

  return (
    <ViewportContext.Provider value={viewportRef}>
      <div
        ref={viewportRef}
        data-viewport
        style={accentStyle}
        className="relative h-full w-full touch-manipulation overflow-hidden bg-background font-display text-fg select-none"
      >
        {ready && (
          <>
            <AnimatePresence initial={false}>
              {stage === "boot" && <BootScreen key="boot" />}
              {stage === "lock" && <LockScreen key="lock" />}
              {stage === "pin" && <PinPad key="pin" />}
            </AnimatePresence>
            {stage === "session" &&
              (desktop ? <DesktopSession key="desktop" /> : <Session key="session" />)}
          </>
        )}
      </div>
    </ViewportContext.Provider>
  );
}
