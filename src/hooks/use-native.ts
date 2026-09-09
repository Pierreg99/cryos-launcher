import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useShell } from "@/store/shell";
import { navigateBack } from "@/lib/navigation";

/**
 * Native chrome integration (Capacitor) — active only on a real device:
 *  - Android hardware/gesture back → the session back-priority chain;
 *    when nothing is left to close, the app minimizes instead of exiting.
 *  - Status bar style/background follow the frost theme (dark/light).
 *  - The native splash hides as soon as the web boot screen can render.
 *
 * Plugins are imported dynamically so the web bundle stays untouched.
 */
export function useNativeChrome(): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const teardown: Array<() => void> = [];
    let cancelled = false;

    void (async () => {
      const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/status-bar"),
        import("@capacitor/splash-screen"),
      ]);
      if (cancelled) return;

      const back = await App.addListener("backButton", () => {
        if (!navigateBack()) void App.minimizeApp();
      });
      teardown.push(() => void back.remove());

      const applyStatus = () => {
        const dark = useShell.getState().settings.theme === "dark";
        StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => undefined);
        StatusBar.setBackgroundColor({ color: dark ? "#050b14" : "#edf2f8" }).catch(
          () => undefined,
        );
      };
      applyStatus();
      const unsubTheme = useShell.subscribe((state, prev) => {
        if (state.settings.theme !== prev.settings.theme) applyStatus();
      });
      teardown.push(unsubTheme);

      SplashScreen.hide().catch(() => undefined);
    })();

    return () => {
      cancelled = true;
      teardown.forEach((f) => f());
    };
  }, []);
}
