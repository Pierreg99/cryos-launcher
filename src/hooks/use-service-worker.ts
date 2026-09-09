import { useEffect } from "react";

/**
 * Registers the offline service worker — production builds only, so
 * `next dev` never serves stale caches. Failures are silent (the app is
 * fully functional without the SW; it only adds offline capability).
 */
export function useServiceWorker(): void {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // offline caching unavailable — non-fatal
    });
  }, []);
}
