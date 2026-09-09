import type { CSSProperties } from "react";

/** Concatenate conditional class names (tiny clsx substitute). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** CSSProperties extended with custom properties (no `any` casts needed). */
export type CSSVars = CSSProperties & Record<`--${string}`, string | number>;
