"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useShell } from "@/store/shell";
import { Wallpaper } from "@/components/wallpaper";
import { HomeScreen } from "@/components/home-screen";
import { GestureBar } from "@/components/gesture-bar";
import { AppWindow } from "@/components/app-window";
import { AppDrawer } from "@/components/app-drawer";
import { RecentsScreen } from "@/components/recents-screen";
import { NotificationShade } from "@/components/notification-shade";

/**
 * The unlocked session: wallpaper + home + overlays.
 * z-order: home(10) < drawer(45) < app(50) < folder(58) < recents(60)
 *          < gesture pill(65) < shade(70).
 */
export function Session() {
  const overlay = useShell((s) => s.overlay);
  const shadeOpen = useShell((s) => s.shadeOpen);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Wallpaper variant="session" />
      <HomeScreen />

      <AnimatePresence initial={false}>
        {overlay === "drawer" && <AppDrawer key="drawer" />}
        {overlay === "recents" && <RecentsScreen key="recents" />}
      </AnimatePresence>

      {/* always mounted — animates its own enter/exit around openApp */}
      <AppWindow />

      <GestureBar />

      <AnimatePresence initial={false}>
        {shadeOpen && <NotificationShade key="shade" />}
      </AnimatePresence>
    </motion.div>
  );
}
