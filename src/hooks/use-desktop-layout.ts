import { useEffect, useState } from "react";
import { useShell } from "@/store/shell";

const QUERY = "(min-width: 900px)";

/**
 * Reference hook (src/hooks/use-desktop-layout.ts): desktop layout for
 * desktop ices on wide screens; phones and narrow windows always run the
 * Crydroid-style phone shell. Same law, different chrome.
 */
export function useDesktopLayout(): boolean {
  const ice = useShell((s) => s.settings.ice);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return ice !== "crydroid" && wide;
}
