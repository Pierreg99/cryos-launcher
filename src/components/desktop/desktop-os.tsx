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

/**
 * CryLinux desktop session (CryArch / crybuntu / crybian / Crynux):
 * wallpaper + desktop icons + live clock + window manager + dock/taskbar.
 * Click the desktop to minimize all windows (per the session contract).
 */
export function DesktopSession() {
  const windows = useShell((s) => s.windows);
  const menuOpen = useShell((s) => s.menuOpen);
  const winMinimizeAll = useShell((s) => s.winMinimizeAll);
  const setMenu = useShell((s) => s.setMenu);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenu]);

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

      <AnimatePresence initial={false}>
        {menuOpen && <DesktopAppMenu key="app-menu" />}
      </AnimatePresence>

      <DesktopTaskbar />
    </motion.div>
  );
}
