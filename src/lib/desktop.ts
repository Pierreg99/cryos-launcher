import type { AppId } from "@/lib/apps";

/** Desktop-mode constants shared by taskbar, windows and the window store. */
export const TASKBAR_H = 52;
export const MIN_W = 260;
export const MIN_H = 180;

/** Opening size per app (clamped to the viewport on open). */
export const WIN_DEFAULTS: Record<AppId, { w: number; h: number }> = {
  bible: { w: 540, h: 520 },
  family: { w: 580, h: 540 },
  manifest: { w: 540, h: 480 },
  dna: { w: 540, h: 460 },
  device: { w: 430, h: 540 },
  files: { w: 470, h: 540 },
  notes: { w: 540, h: 430 },
  terminal: { w: 620, h: 400 },
  clock: { w: 410, h: 560 },
  settings: { w: 450, h: 620 },
};

/* ------------------------------------------------------------------ */
/* Window snapping — pure geometry so it is testable headlessly.        */
/* ------------------------------------------------------------------ */

export type SnapZone = "left" | "right" | "top" | "nw" | "ne" | "sw" | "se";
export type SnapRect = { x: number; y: number; w: number; h: number };

/** Edge width (px) that arms half-screen snaps. */
export const SNAP_EDGE = 20;
/** Corner box (px) that arms quadrant snaps. */
export const SNAP_CORNER = 64;

/**
 * Which snap zone a viewport-relative pointer position arms, or null.
 * The taskbar strip at the bottom is owned by the taskbar, not by snaps.
 */
export function snapZoneFor(px: number, py: number, vw: number, vh: number): SnapZone | null {
  const usableH = vh - TASKBAR_H;
  if (py > usableH) return null; // taskbar strip
  if (px < SNAP_CORNER && py < SNAP_CORNER) return "nw";
  if (px > vw - SNAP_CORNER && py < SNAP_CORNER) return "ne";
  if (px < SNAP_CORNER && py > usableH - SNAP_CORNER) return "sw";
  if (px > vw - SNAP_CORNER && py > usableH - SNAP_CORNER) return "se";
  if (py < SNAP_EDGE) return "top";
  if (px < SNAP_EDGE) return "left";
  if (px > vw - SNAP_EDGE) return "right";
  return null;
}

/** Target geometry for a snap zone (rounded, taskbar-aware). */
export function snapGeometry(zone: SnapZone, vw: number, vh: number): SnapRect {
  const usableH = Math.max(MIN_H, vh - TASKBAR_H);
  const halfW = Math.round(vw / 2);
  const halfH = Math.round(usableH / 2);
  switch (zone) {
    case "left":
      return { x: 0, y: 0, w: halfW, h: usableH };
    case "right":
      return { x: halfW, y: 0, w: vw - halfW, h: usableH };
    case "top":
      return { x: 0, y: 0, w: vw, h: usableH };
    case "nw":
      return { x: 0, y: 0, w: halfW, h: halfH };
    case "ne":
      return { x: halfW, y: 0, w: vw - halfW, h: halfH };
    case "sw":
      return { x: 0, y: halfH, w: halfW, h: usableH - halfH };
    case "se":
      return { x: halfW, y: halfH, w: vw - halfW, h: usableH - halfH };
  }
}
