import { useShell, type WinState } from "@/store/shell";

/**
 * Single back-priority chain — used by the phone edge-swipe gesture and
 * by the Android hardware/gesture back button (via use-native.ts).
 *
 * Order: folder → shade → drawer → recents → open app → app menu →
 * CryCenter → front-most desktop window. Returns true when the back
 * action was handled inside the session (false → caller decides, e.g.
 * minimize the native app).
 */
export function navigateBack(): boolean {
  const s = useShell.getState();
  if (s.stage !== "session") return false;

  if (s.folderOpen) {
    s.closeFolder();
    return true;
  }
  if (s.shadeOpen) {
    s.setShade(false);
    return true;
  }
  if (s.overlay === "drawer") {
    s.closeDrawer();
    return true;
  }
  if (s.overlay === "recents") {
    s.hideRecents();
    return true;
  }
  if (s.openApp) {
    s.goHome();
    return true;
  }
  if (s.menuOpen) {
    s.setMenu(false);
    return true;
  }
  if (s.cryCenterOpen) {
    s.setCryCenter(false);
    return true;
  }

  // desktop mode: close the front-most (highest-z, not minimized) window
  const top = s.windows
    .filter((w) => !w.min)
    .reduce<WinState | null>((acc, w) => (acc === null || w.z > acc.z ? w : acc), null);
  if (top !== null) {
    s.winClose(top.id);
    return true;
  }

  return false;
}
