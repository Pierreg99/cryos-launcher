import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MarkSlug } from "@/lib/crybel";

/**
 * DistroMark — the cryOS hex mark with a per-ice inner glyph.
 * Pure SVG, inherits currentColor (mirrors the reference component).
 */

const HEX = "M24 3.5 L41.8 13.75 V34.25 L24 44.5 L6.2 34.25 V13.75 Z";

const GLYPHS: Record<MarkSlug, ReactNode> = {
  // cryOS / Crydroid — frost flake
  cryos: (
    <>
      <path d="M24 15.5 V32.5" />
      <path d="M16.6 19.8 L31.4 28.2" />
      <path d="M31.4 19.8 L16.6 28.2" />
      <circle cx="24" cy="24" r="2.1" fill="currentColor" stroke="none" />
    </>
  ),
  crydroid: (
    <>
      <path d="M24 15.5 V32.5" />
      <path d="M16.6 19.8 L31.4 28.2" />
      <path d="M31.4 19.8 L16.6 28.2" />
      <circle cx="24" cy="24" r="2.1" fill="currentColor" stroke="none" />
    </>
  ),
  // CryArch — mountain, rolling frost
  cryarch: (
    <>
      <path d="M24 15 L34.5 33 H13.5 Z" />
      <path d="M20.5 33 L24 26.5 L27.5 33" />
    </>
  ),
  // crybuntu — ring of three, friendly thaw
  crybuntu: (
    <>
      <circle cx="24" cy="24" r="7.5" />
      <circle cx="24" cy="14.5" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="28.8" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="32.2" cy="28.8" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
  // crybian — swirl, permafrost
  crybian: (
    <>
      <path d="M29.5 24a5.5 5.5 0 1 1-5.5-5.5 9.5 9.5 0 1 0 9.5 9.5" />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  // Crynux — declarative asterisk
  crynux: (
    <>
      <path d="M24 14.5 V33.5" />
      <path d="M15.8 19.2 L32.2 28.8" />
      <path d="M32.2 19.2 L15.8 28.8" />
      <path d="M24 20.2 L27.3 22.1 L27.3 25.9 L24 27.8 L20.7 25.9 L20.7 22.1 Z" />
    </>
  ),
};

export function DistroMark({
  slug = "cryos",
  className,
}: {
  slug?: MarkSlug;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-8", className)}
      aria-hidden
    >
      <path d={HEX} />
      {GLYPHS[slug]}
    </svg>
  );
}
