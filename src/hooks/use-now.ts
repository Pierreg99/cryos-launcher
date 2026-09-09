import { useEffect, useState } from "react";

/**
 * Ticking clock. Returns null until mounted (SSR-safe: no hydration
 * mismatch), then a Date refreshed every `intervalMs`.
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);

  return now;
}
