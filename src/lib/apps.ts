import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Clock3,
  FileStack,
  Layers,
  PenLine,
  ScrollText,
  Settings2,
  SquareTerminal,
  Blend,
  Waypoints,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* App registry — mirrors the cryOS reference repo (src/lib/apps.ts).  */
/* ------------------------------------------------------------------ */

export const APP_IDS = [
  "bible",
  "family",
  "device",
  "files",
  "notes",
  "terminal",
  "clock",
  "manifest",
  "dna",
  "settings",
] as const;

export type AppId = (typeof APP_IDS)[number];

export type AppCategory = "doctrine" | "system" | "everyday";

export type AppDef = {
  id: AppId;
  icon: LucideIcon;
  category: AppCategory;
  /** Literal Tailwind gradient stops for the icon tile (must stay static for the scanner). */
  tint: string;
};

export const APPS: Record<AppId, AppDef> = {
  bible: { id: "bible", icon: BookOpen, category: "doctrine", tint: "from-sky-500 to-blue-700" },
  family: { id: "family", icon: Layers, category: "doctrine", tint: "from-cyan-500 to-teal-700" },
  device: { id: "device", icon: Waypoints, category: "system", tint: "from-indigo-500 to-violet-700" },
  files: { id: "files", icon: FileStack, category: "system", tint: "from-orange-500 to-amber-700" },
  notes: { id: "notes", icon: PenLine, category: "everyday", tint: "from-yellow-400 to-amber-600" },
  terminal: { id: "terminal", icon: SquareTerminal, category: "system", tint: "from-zinc-600 to-zinc-900" },
  clock: { id: "clock", icon: Clock3, category: "everyday", tint: "from-cyan-600 to-sky-800" },
  manifest: { id: "manifest", icon: ScrollText, category: "doctrine", tint: "from-blue-500 to-indigo-700" },
  dna: { id: "dna", icon: Blend, category: "doctrine", tint: "from-fuchsia-500 to-purple-700" },
  settings: { id: "settings", icon: Settings2, category: "system", tint: "from-slate-500 to-slate-800" },
};

export const APP_CATEGORIES: AppCategory[] = ["doctrine", "system", "everyday"];

/* ------------------------------------------------------------------ */
/* Home-screen layout model (persisted via localStorage).              */
/* ------------------------------------------------------------------ */

export type GridApp = { kind: "app"; appId: AppId };
export type GridFolder = { kind: "folder"; id: string; name: string; appIds: AppId[] };
export type GridItem = GridApp | GridFolder;

/** 4 columns × 5 rows = 20 slots. */
export const GRID_COLS = 4;
export const GRID_ROWS = 5;
export const GRID_SIZE = GRID_COLS * GRID_ROWS;
export const DOCK_SIZE = 5;

/** A grid is a fixed-length array of items or null (empty slot). */
export type Grid = (GridItem | null)[];
/** The dock holds bare app ids or null. */
export type Dock = (AppId | null)[];

function appSlot(appId: AppId): GridApp {
  return { kind: "app", appId };
}

export const DEFAULT_GRID: Grid = [
  appSlot("bible"),
  appSlot("family"),
  appSlot("device"),
  appSlot("files"),
  appSlot("notes"),
  appSlot("terminal"),
  appSlot("clock"),
  appSlot("manifest"),
  appSlot("dna"),
  appSlot("settings"),
  ...Array<null>(GRID_SIZE - 10).fill(null),
];

export const DEFAULT_DOCK: Dock = ["bible", "family", "device", "notes", "settings"];

/** Desktop icons + taskbar pins (mirrors the reference repo). */
export const DESKTOP_PINNED: AppId[] = ["bible", "family", "files", "terminal", "device", "settings"];

export function cloneGrid(grid: Grid): Grid {
  return grid.map((item) => {
    if (item === null) return null;
    if (item.kind === "folder") return { ...item, appIds: [...item.appIds] };
    return { ...item };
  });
}
