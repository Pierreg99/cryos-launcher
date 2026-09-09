import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/i18n";
import {
  cloneGrid,
  DEFAULT_DOCK,
  DEFAULT_GRID,
  GRID_SIZE,
  type AppId,
  type Dock,
  type Grid,
  type GridApp,
  type GridFolder,
  type GridItem,
} from "@/lib/apps";
import type { WallpaperId } from "@/lib/wallpapers";
import { DISTROS, type IceSlug } from "@/lib/crybel";
import { TASKBAR_H, WIN_DEFAULTS, type SnapRect } from "@/lib/desktop";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Stage = "boot" | "lock" | "pin" | "session";
export type Overlay = "none" | "drawer" | "recents";
export type LockStyle = "none" | "pin";
export type ThemeMode = "dark" | "light";
export type RecentEntry = { key: string; appId: AppId; ts: number };

/** Desktop-mode window (session-only, not persisted). */
export type WinState = {
  id: string;
  appId: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  min: boolean;
  max: boolean;
  z: number;
};

export type ViewportSize = { w: number; h: number };

export type Settings = {
  locale: Locale;
  /** The booted ice — switch from Settings; the law does not change. */
  ice: IceSlug;
  theme: ThemeMode;
  wallpaper: WallpaperId;
  /** Boot sequence duration in ms (configurable, skip via tap). */
  bootMs: number;
  lockStyle: LockStyle;
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  parallax: boolean;
  /** 40..100 — applied as a real brightness veil over the screen. */
  brightness: number;
};

export type DragSource =
  | { zone: "grid"; index: number }
  | { zone: "dock"; index: number }
  | { zone: "folder"; folderId: string; index: number };

export type DropTarget =
  | { zone: "grid"; index: number }
  | { zone: "dock"; index: number }
  | null;

export type DropPayload = { from: DragSource; to: DropTarget };

const MIN_VIEW_W = 320;
const MIN_VIEW_H = 240;

const DEFAULT_SETTINGS: Settings = {
  locale: "en",
  ice: "crydroid",
  theme: "dark",
  wallpaper: "aurora",
  bootMs: 2600,
  lockStyle: "none",
  wifi: true,
  bluetooth: false,
  airplane: false,
  parallax: true,
  brightness: 100,
};

export type ShellState = {
  /* session state (not persisted) */
  stage: Stage;
  overlay: Overlay;
  openApp: AppId | null;
  shadeOpen: boolean;
  folderOpen: string | null;
  recents: RecentEntry[];
  bootedAt: number;
  /** desktop mode (session-only) */
  windows: WinState[];
  winSeq: number;
  menuOpen: boolean;
  cryCenterOpen: boolean;
  /** live snap-preview rectangle while dragging a window to an edge */
  snapPreview: SnapRect | null;
  /* persisted state */
  settings: Settings;
  grid: Grid;
  dock: Dock;
  dismissed: string[];
  notes: string;
  /* actions */
  toLock: () => void;
  requestUnlock: () => void;
  acceptPin: () => void;
  cancelPin: () => void;
  lockNow: () => void;
  launchApp: (appId: AppId) => void;
  resumeApp: (appId: AppId) => void;
  goHome: () => void;
  showRecents: () => void;
  hideRecents: () => void;
  closeRecent: (key: string) => void;
  clearRecents: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setShade: (open: boolean) => void;
  openFolder: (id: string) => void;
  closeFolder: () => void;
  drop: (payload: DropPayload) => void;
  resetLayout: () => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setNotes: (notes: string) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: (ids: string[]) => void;
  winOpen: (appId: AppId, vp?: ViewportSize) => void;
  winClose: (id: string) => void;
  winFocus: (id: string) => void;
  winMinimize: (id: string) => void;
  winToggleMax: (id: string) => void;
  winMove: (id: string, x: number, y: number) => void;
  winResize: (id: string, patch: Partial<Pick<WinState, "x" | "y" | "w" | "h">>) => void;
  winMinimizeAll: () => void;
  setMenu: (open: boolean) => void;
  setCryCenter: (open: boolean) => void;
  setSnapPreview: (rect: SnapRect | null) => void;
};

type PersistedShell = Pick<
  ShellState,
  "settings" | "grid" | "dock" | "dismissed" | "notes"
>;

/* ------------------------------------------------------------------ */
/* Drop logic — pure, immutable grid/dock mutations                    */
/* ------------------------------------------------------------------ */

function firstEmpty(grid: Grid): number {
  return grid.findIndex((item) => item === null);
}

function findFolderSlot(grid: Grid, folderId: string): number {
  return grid.findIndex(
    (item): boolean => item !== null && item.kind === "folder" && item.id === folderId,
  );
}

function extractDragged(
  state: ShellState,
  grid: Grid,
  dock: Dock,
  from: DragSource,
): { dragged: GridItem | null; folderOpen: string | null } {
  let folderOpen: string | null = state.folderOpen;
  if (from.zone === "grid") {
    const dragged = grid[from.index];
    grid[from.index] = null;
    return { dragged, folderOpen };
  }
  if (from.zone === "dock") {
    const appId = dock[from.index];
    dock[from.index] = null;
    return { dragged: appId ? { kind: "app", appId } : null, folderOpen };
  }
  // from an open folder
  const slot = findFolderSlot(grid, from.folderId);
  const folder = slot >= 0 ? grid[slot] : null;
  if (!folder || folder.kind !== "folder") return { dragged: null, folderOpen };
  const appIds = [...folder.appIds];
  const removed = appIds.splice(from.index, 1)[0];
  const dragged: GridItem | null = removed ? { kind: "app", appId: removed } : null;
  if (appIds.length === 0) {
    grid[slot] = null;
    if (folderOpen === from.folderId) folderOpen = null;
  } else if (appIds.length === 1) {
    grid[slot] = { kind: "app", appId: appIds[0] };
    if (folderOpen === from.folderId) folderOpen = null;
  } else {
    grid[slot] = { ...folder, appIds };
  }
  return { dragged, folderOpen };
}

function restoreDragged(
  grid: Grid,
  dock: Dock,
  from: DragSource,
  dragged: GridItem,
  folderOpen: string | null,
): { grid: Grid; dock: Dock; folderOpen: string | null } | null {
  if (from.zone === "grid") {
    grid[from.index] = dragged;
    return { grid, dock, folderOpen };
  }
  if (from.zone === "dock" && dragged.kind === "app") {
    dock[from.index] = dragged.appId;
    return { grid, dock, folderOpen };
  }
  if (from.zone === "folder" && dragged.kind === "app") {
    const slot = findFolderSlot(grid, from.folderId);
    const folder = slot >= 0 ? grid[slot] : null;
    if (folder && folder.kind === "folder") {
      folder.appIds.splice(Math.min(from.index, folder.appIds.length), 0, dragged.appId);
      return { grid, dock, folderOpen: from.folderId };
    }
    const empty = firstEmpty(grid);
    if (empty >= 0) {
      grid[empty] = dragged;
      return { grid, dock, folderOpen };
    }
  }
  return null; // nowhere to restore — treat as cancelled no-op
}

function applyDrop(
  state: ShellState,
  from: DragSource,
  to: DropTarget,
): Pick<ShellState, "grid" | "dock" | "folderOpen"> {
  const grid = cloneGrid(state.grid);
  const dock: Dock = [...state.dock];
  const { dragged, folderOpen } = extractDragged(state, grid, dock, from);
  const unchanged = { grid: state.grid, dock: state.dock, folderOpen: state.folderOpen };
  if (!dragged) return unchanged;

  if (to === null) {
    return restoreDragged(grid, dock, from, dragged, folderOpen) ?? unchanged;
  }

  if (to.zone === "dock") {
    if (dragged.kind !== "app") {
      // folders cannot live in the dock — bounce back to the origin slot
      return restoreDragged(grid, dock, from, dragged, folderOpen) ?? unchanged;
    }
    const existing = dock[to.index];
    dock[to.index] = dragged.appId;
    if (existing && existing !== dragged.appId) {
      if (from.zone === "grid") {
        grid[from.index] = { kind: "app", appId: existing };
      } else if (from.zone === "dock") {
        dock[from.index] = existing; // swap within dock
      } else {
        const empty = firstEmpty(grid);
        if (empty >= 0) grid[empty] = { kind: "app", appId: existing };
      }
    }
    return { grid, dock, folderOpen };
  }

  // to.zone === "grid"
  const target = grid[to.index];
  if (target === null) {
    grid[to.index] = dragged;
    return { grid, dock, folderOpen };
  }

  if (target.kind === "app") {
    if (dragged.kind === "app") {
      grid[to.index] = {
        kind: "folder",
        id: `f-${Date.now().toString(36)}`,
        name: "",
        appIds: [dragged.appId, target.appId],
      };
      return { grid, dock, folderOpen };
    }
    // dragged folder onto an app → absorb the app
    grid[to.index] = { ...dragged, appIds: [...dragged.appIds, target.appId] };
    return { grid, dock, folderOpen };
  }

  // target is a folder
  if (dragged.kind === "app") {
    if (target.appIds.includes(dragged.appId) || target.appIds.length >= GRID_SIZE) {
      return restoreDragged(grid, dock, from, dragged, folderOpen) ?? unchanged;
    }
    grid[to.index] = { ...target, appIds: [...target.appIds, dragged.appId] };
    return { grid, dock, folderOpen };
  }
  // folder onto folder → merge
  grid[to.index] = { ...target, appIds: [...target.appIds, ...dragged.appIds] };
  return { grid, dock, folderOpen };
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const useShell = create<ShellState>()(
  persist(
    (set) => ({
      stage: "boot",
      overlay: "none",
      openApp: null,
      shadeOpen: false,
      folderOpen: null,
      recents: [],
      bootedAt: Date.now(),
      windows: [],
      winSeq: 0,
      menuOpen: false,
      cryCenterOpen: false,
      snapPreview: null,
      settings: DEFAULT_SETTINGS,
      grid: DEFAULT_GRID,
      dock: DEFAULT_DOCK,
      dismissed: [],
      notes: "",

      toLock: () => set({ stage: "lock" }),

      requestUnlock: () =>
        set((s) => ({
          stage: s.settings.lockStyle === "pin" ? "pin" : "session",
          overlay: "none",
          openApp: null,
          shadeOpen: false,
          folderOpen: null,
        })),

      acceptPin: () => set({ stage: "session" }),
      cancelPin: () => set({ stage: "lock" }),

      lockNow: () =>
        set({
          stage: "lock",
          overlay: "none",
          openApp: null,
          shadeOpen: false,
          folderOpen: null,
          menuOpen: false,
          cryCenterOpen: false,
        }),

      launchApp: (appId) => {
        const ts = Date.now();
        set((s) => ({
          stage: "session",
          openApp: appId,
          overlay: "none",
          shadeOpen: false,
          folderOpen: null,
          recents: [
            { key: `${appId}-${ts}`, appId, ts },
            ...s.recents.filter((r) => r.appId !== appId),
          ].slice(0, 6),
        }));
      },

      resumeApp: (appId) => set({ openApp: appId, overlay: "none", shadeOpen: false }),

      goHome: () =>
        set({ openApp: null, overlay: "none", shadeOpen: false, folderOpen: null }),

      showRecents: () =>
        set({ overlay: "recents", shadeOpen: false, folderOpen: null }),

      hideRecents: () => set({ overlay: "none" }),

      closeRecent: (key) =>
        set((s) => {
          const closed = s.recents.find((r) => r.key === key);
          return {
            recents: s.recents.filter((r) => r.key !== key),
            openApp: closed && s.openApp === closed.appId ? null : s.openApp,
          };
        }),

      clearRecents: () => set({ recents: [] }),

      openDrawer: () => set({ overlay: "drawer", shadeOpen: false, folderOpen: null }),
      closeDrawer: () => set((s) => (s.overlay === "drawer" ? { overlay: "none" } : {})),

      setShade: (open) => set(open ? { shadeOpen: true, folderOpen: null } : { shadeOpen: false }),

      openFolder: (id) => set({ folderOpen: id }),
      closeFolder: () => set({ folderOpen: null }),

      drop: ({ from, to }) => set((s) => applyDrop(s, from, to)),

      resetLayout: () =>
        set({ grid: cloneGrid(DEFAULT_GRID), dock: [...DEFAULT_DOCK], folderOpen: null }),

      setSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      setNotes: (notes) => set({ notes }),

      dismissNotification: (id) =>
        set((s) => (s.dismissed.includes(id) ? {} : { dismissed: [...s.dismissed, id] })),

      clearNotifications: (ids) =>
        set((s) => ({ dismissed: Array.from(new Set([...s.dismissed, ...ids])) })),

      /* ---------------- desktop window manager ---------------- */

      winOpen: (appId, vp) =>
        set((s) => {
          const winSeq = s.winSeq + 1;
          const existing = s.windows.find((w) => w.appId === appId);
          if (existing) {
            return {
              winSeq,
              menuOpen: false,
              windows: s.windows.map((w) =>
                w.id === existing.id ? { ...w, min: false, z: winSeq } : w,
              ),
            };
          }
          const def = WIN_DEFAULTS[appId];
          const n = s.windows.length % 6;
          let w = def.w;
          let h = def.h;
          let x = 56 + n * 30;
          let y = 44 + n * 26;
          if (vp) {
            const usableH = Math.max(MIN_VIEW_H, vp.h - TASKBAR_H);
            w = Math.min(w, Math.max(MIN_VIEW_W, vp.w - 24));
            h = Math.min(h, Math.max(MIN_VIEW_H, usableH - 24));
            x = Math.min(x, Math.max(8, vp.w - w - 16));
            y = Math.min(y, Math.max(8, usableH - h - 16));
          }
          return {
            winSeq,
            menuOpen: false,
            windows: [
              ...s.windows,
              { id: `w-${appId}-${winSeq}`, appId, x, y, w, h, min: false, max: false, z: winSeq },
            ],
          };
        }),

      winClose: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

      winFocus: (id) =>
        set((s) => {
          const winSeq = s.winSeq + 1;
          return {
            winSeq,
            windows: s.windows.map((w) => (w.id === id ? { ...w, min: false, z: winSeq } : w)),
          };
        }),

      winMinimize: (id) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, min: true } : w)) })),

      winToggleMax: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, max: !w.max, min: false } : w)),
        })),

      winMove: (id, x, y) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),

      winResize: (id, patch) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),

      winMinimizeAll: () =>
        set((s) => ({ windows: s.windows.map((w) => ({ ...w, min: true })) })),

      setMenu: (open) => set({ menuOpen: open }),

      setCryCenter: (open) => set({ cryCenterOpen: open }),

      setSnapPreview: (rect) => set({ snapPreview: rect }),
    }),
    {
      name: "crydroid-shell-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s): PersistedShell => ({
        settings: s.settings,
        grid: s.grid,
        dock: s.dock,
        dismissed: s.dismissed,
        notes: s.notes,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<PersistedShell> | undefined;
        if (!p) return current;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...(p.settings ?? {}) },
          grid:
            Array.isArray(p.grid) && p.grid.length === GRID_SIZE
              ? p.grid
              : current.grid,
          dock: Array.isArray(p.dock) ? p.dock : current.dock,
          dismissed: Array.isArray(p.dismissed) ? p.dismissed : current.dismissed,
          notes: typeof p.notes === "string" ? p.notes : current.notes,
        };
      },
    },
  ),
);

/* Convenience typed aliases + distro access re-exported for components. */
export type { GridItem, GridApp, GridFolder, Grid, Dock, AppId };
export { DISTROS };
