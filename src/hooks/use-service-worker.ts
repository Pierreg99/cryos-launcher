import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Registers the offline service worker — production builds only, so
 * `next dev` never serves stale caches. Failures are silent (the app is
 * fully functional without the SW; it only adds offline capability).
 */
export function useServiceWorker(): void {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (Capacitor.isNativePlatform()) return; // native shell serves assets locally
    navigator.serviceWorker.register("sw.js").catch(() => {
      // offline caching unavailable — non-fatal
    });
  }, []);
}
