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
