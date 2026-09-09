"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShell } from "@/store/shell";
import { Wallpaper } from "@/components/wallpaper";
import { DesktopIcons } from "@/components/desktop/desktop-icons";
import { DesktopClockWidget } from "@/components/desktop/desktop-clock-widget";
import { DesktopWindow } from "@/components/desktop/desktop-window";
import { DesktopTaskbar } from "@/components/desktop/desktop-taskbar";
import { DesktopAppMenu } from "@/components/desktop/desktop-app-menu";
import { CryCenter } from "@/components/desktop/desktop-crycenter";

/**
 * CryLinux desktop session (CryArch / crybuntu / crybian / Crynux):
 * wallpaper + desktop icons + live clock + window manager + dock/taskbar
 * + CryCenter (control center split from notifications).
 * Click the desktop to minimize all windows (per the session contract).
 */
export function DesktopSession() {
  const windows = useShell((s) => s.windows);
  const menuOpen = useShell((s) => s.menuOpen);
  const cryCenterOpen = useShell((s) => s.cryCenterOpen);
  const snapPreview = useShell((s) => s.snapPreview);
  const winMinimizeAll = useShell((s) => s.winMinimizeAll);
  const setMenu = useShell((s) => s.setMenu);
  const setCryCenter = useShell((s) => s.setCryCenter);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setCryCenter(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenu, setCryCenter]);

  // desktop panels never survive the session (lock, ice switch, …)
  useEffect(
    () => () => {
      const s = useShell.getState();
      if (s.menuOpen) s.setMenu(false);
      if (s.cryCenterOpen) s.setCryCenter(false);
      if (s.snapPreview) s.setSnapPreview(null);
    },
    [],
  );

  const ordered = [...windows].sort((a, b) => a.z - b.z);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          winMinimizeAll();
          setMenu(false);
          setCryCenter(false);
        }
      }}
    >
      <Wallpaper variant="session" />
      <DesktopIcons />
      <DesktopClockWidget />

      <AnimatePresence initial={false}>
        {ordered.map((win, i) => (
          <DesktopWindow key={win.id} win={win} layer={20 + i} />
        ))}
      </AnimatePresence>

      {/* live snap preview while dragging a window to an edge/corner */}
      {snapPreview !== null && (
        <motion.div
          className="pointer-events-none absolute z-[65] rounded-xl bg-primary/20 ring-2 ring-primary/60"
          initial={false}
          animate={{
            left: snapPreview.x,
            top: snapPreview.y,
            width: snapPreview.w,
            height: snapPreview.h,
            opacity: 1,
          }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          aria-hidden
        />
      )}

      <AnimatePresence initial={false}>
        {menuOpen && <DesktopAppMenu key="app-menu" />}
        {cryCenterOpen && <CryCenter key="crycenter" />}
      </AnimatePresence>

      <DesktopTaskbar />
    </motion.div>
  );
}
