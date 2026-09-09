import { useEffect, useState } from "react";
import { useShell } from "@/store/shell";

/**
 * Gates the UI until the persisted zustand store has rehydrated from
 * localStorage (skipHydration: true). Prevents SSR/client mismatches —
 * the server always renders the neutral pre-hydration shell.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void useShell.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
