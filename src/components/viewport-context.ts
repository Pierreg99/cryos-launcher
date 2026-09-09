import { createContext, useContext, type RefObject } from "react";

/** Provides the OS viewport element ref (coordinate origin for gestures/ghosts). */
export const ViewportContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useViewport(): RefObject<HTMLDivElement | null> {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw new Error("useViewport must be used inside <ViewportContext.Provider>");
  return ctx;
}
