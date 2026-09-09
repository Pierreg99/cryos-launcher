import { useEffect } from "react";
import { useShell } from "@/store/shell";

/**
 * Applies the persisted theme to <html class="dark"> and mirrors it to a
 * plain localStorage key that the pre-paint inline script reads (no FOUC).
 */
export function useThemeSync(): void {
  const theme = useShell((s) => s.settings.theme);
  const locale = useShell((s) => s.settings.locale);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.lang = locale;
    try {
      localStorage.setItem("crydroid-theme", theme);
    } catch {
      // storage unavailable (private mode) — theme still applies for the session
    }
  }, [theme, locale]);
}
