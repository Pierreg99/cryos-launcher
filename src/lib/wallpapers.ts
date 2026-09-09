/**
 * Wallpaper engine — pure CSS layers (no image downloads, offline-safe).
 * Each layer carries a parallax depth in px; the Wallpaper component
 * feeds --px/--py (unitless, -1..1) from useParallax().
 */

export type WallpaperId = "aurora" | "hex" | "glacier";

export type WallpaperLayer = {
  /** CSS class defined in globals.css */
  cls: string;
  /** Parallax depth in px (0 = static) */
  depth: number;
  /** Extra slow-drift animation class (inner element) */
  drift?: boolean;
};

export type WallpaperDef = {
  id: WallpaperId;
  nameKey: "aurora" | "hexLattice" | "glacier";
  layers: WallpaperLayer[];
};

export const WALLPAPERS: WallpaperDef[] = [
  {
    id: "aurora",
    nameKey: "aurora",
    layers: [
      { cls: "wp-aurora-base", depth: 4 },
      { cls: "wp-aurora-g1", depth: 14 },
      { cls: "wp-aurora-g2", depth: 22 },
      { cls: "wp-aurora-g3", depth: 9 },
    ],
  },
  {
    id: "hex",
    nameKey: "hexLattice",
    layers: [
      { cls: "wp-hex-base", depth: 4 },
      { cls: "wp-hex-grid", depth: 12 },
      { cls: "wp-hex-glow", depth: 20 },
    ],
  },
  {
    id: "glacier",
    nameKey: "glacier",
    layers: [
      { cls: "wp-glacier-base", depth: 3 },
      { cls: "wp-glacier-sun", depth: 10 },
      { cls: "wp-glacier-r1", depth: 16 },
      { cls: "wp-glacier-r2", depth: 26 },
    ],
  },
];

export const WALLPAPER_BY_ID: Record<WallpaperId, WallpaperDef> = Object.fromEntries(
  WALLPAPERS.map((w) => [w.id, w]),
) as Record<WallpaperId, WallpaperDef>;
