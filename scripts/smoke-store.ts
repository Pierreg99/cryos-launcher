/**
 * Headless smoke test for the shell store (no browser available here).
 * Run: npm run smoke
 */
import "./memory-storage";
import { DEFAULT_DOCK, DEFAULT_GRID, GRID_SIZE, type AppId } from "@/lib/apps";
import { DESKTOP_ICES, DISTROS, ICE_SLUGS, markSlugFor } from "@/lib/crybel";
import {
  MIN_H,
  MIN_W,
  SNAP_CORNER,
  SNAP_EDGE,
  TASKBAR_H,
  snapGeometry,
  snapZoneFor,
} from "@/lib/desktop";
import { useShell, type GridFolder } from "@/store/shell";
import { dictFor } from "@/i18n";

let failures = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
}

const s = () => useShell.getState();

function slotApp(i: number): AppId | null {
  const it = s().grid[i];
  return it && it.kind === "app" ? it.appId : null;
}

function slotFolder(i: number): GridFolder | null {
  const it = s().grid[i];
  return it && it.kind === "folder" ? it : null;
}

function appIds(): AppId[] {
  return s()
    .grid.flatMap((item) =>
      item === null ? [] : item.kind === "app" ? [item.appId] : item.appIds,
    )
    .sort();
}

const ALL_INITIAL: AppId[] = appIds();

/* ---------------------------------------------------------------- */
section("boot / lock / session stage machine");

check("starts at boot", s().stage === "boot");
s().toLock();
check("toLock -> lock", s().stage === "lock");
s().requestUnlock();
check("lockStyle none -> session", s().stage === "session");
s().setSetting("lockStyle", "pin");
s().lockNow();
s().requestUnlock();
check("lockStyle pin -> pin stage", s().stage === "pin");
s().cancelPin();
check("cancelPin -> lock", s().stage === "lock");
s().requestUnlock();
s().acceptPin();
check("acceptPin -> session", s().stage === "session");
s().setSetting("lockStyle", "none");

/* ---------------------------------------------------------------- */
section("app launch + recents");

s().launchApp("clock");
check("launchApp sets openApp", s().openApp === "clock");
check("launchApp pushes recents", s().recents[0]?.appId === "clock");
s().launchApp("files");
s().launchApp("clock");
check(
  "recents dedupe + most recent first",
  s().recents[0]?.appId === "clock" && s().recents[1]?.appId === "files",
);
check("recents length 2", s().recents.length === 2);
for (const id of ["notes", "dna", "device", "family", "bible"] as AppId[]) s().launchApp(id);
check("recents capped at 6", s().recents.length === 6);
s().showRecents();
check("showRecents overlay", s().overlay === "recents");
s().resumeApp("clock");
check("resumeApp clears overlay", s().overlay === "none" && s().openApp === "clock");
const clockKey = s().recents.find((r) => r.appId === "clock")?.key ?? "";
s().closeRecent(clockKey);
check("closeRecent removes entry", s().recents.every((r) => r.key !== clockKey));
s().clearRecents();
check("clearRecents empties list", s().recents.length === 0);
s().goHome();
check("goHome clears openApp", s().openApp === null);

/* ---------------------------------------------------------------- */
section("grid drag & drop");

check("grid starts with 10 apps", ALL_INITIAL.length === 10);

// move within grid (slot 5 = terminal -> moved away first)
s().drop({ from: { zone: "grid", index: 5 }, to: { zone: "grid", index: 15 } });
check("move: source emptied", s().grid[5] === null);
check("move: target holds terminal", slotApp(15) === "terminal");
check("move: no apps lost", appIds().join() === ALL_INITIAL.join());

// move onto occupied slot -> folder (bible at 0 onto family at 1)
s().drop({ from: { zone: "grid", index: 0 }, to: { zone: "grid", index: 1 } });
check("drop on app creates folder", slotFolder(1) !== null);
check("folder holds both apps", slotFolder(1)?.appIds.length === 2);
check("folder creation keeps app count", appIds().join() === ALL_INITIAL.join());

// drop app onto folder -> merge (device at 2 into folder at 1)
s().drop({ from: { zone: "grid", index: 2 }, to: { zone: "grid", index: 1 } });
check("app merges into folder", slotFolder(1)?.appIds.length === 3);
check("merge keeps app count", appIds().join() === ALL_INITIAL.join());

// drag out of folder (3 -> 2, folder survives and stays open)
{
  const merged = slotFolder(1);
  if (merged) {
    s().openFolder(merged.id);
    const draggedOut = merged.appIds[0];
    s().drop({ from: { zone: "folder", folderId: merged.id, index: 0 }, to: { zone: "grid", index: 0 } });
    check("drag out places app on grid", slotApp(0) === draggedOut);
    check("folder survives with 2 apps", slotFolder(1)?.appIds.length === 2);
    check("folder stays open while >1 apps", s().folderOpen === merged.id);

    // drag out until the folder collapses to a plain app slot
    const two = slotFolder(1);
    if (two) {
      s().drop({ from: { zone: "folder", folderId: two.id, index: 0 }, to: { zone: "grid", index: 2 } });
      check("2-app folder collapses to app slot", slotApp(1) !== null && slotFolder(1) === null);
      check("folder closed on collapse", s().folderOpen === null);
    }
  }
}
check("drag-out keeps app count", appIds().join() === ALL_INITIAL.join());

// folder into folder -> merge
s().resetLayout();
s().drop({ from: { zone: "grid", index: 0 }, to: { zone: "grid", index: 1 } });
s().drop({ from: { zone: "grid", index: 2 }, to: { zone: "grid", index: 3 } });
s().drop({ from: { zone: "grid", index: 1 }, to: { zone: "grid", index: 3 } });
check("folder merges into folder", slotFolder(3)?.appIds.length === 4);
check("source slot freed after folder merge", s().grid[1] === null);
check("folder merge keeps app count", appIds().join() === ALL_INITIAL.join());

/* ---------------------------------------------------------------- */
section("dock drag & drop");

s().resetLayout();
check("dock default", s().dock.join() === DEFAULT_DOCK.join());

// grid app -> occupied dock slot = swap (notes at grid 4 <-> bible at dock 0)
s().drop({ from: { zone: "grid", index: 4 }, to: { zone: "dock", index: 0 } });
check("grid app lands in dock", s().dock[0] === "notes");
check("displaced dock app returns to source slot", slotApp(4) === "bible");

// dock -> dock swap
s().drop({ from: { zone: "dock", index: 0 }, to: { zone: "dock", index: 1 } });
check("dock swap a", s().dock[0] === "family");
check("dock swap b", s().dock[1] === "notes");

// dock -> grid empty slot
s().drop({ from: { zone: "dock", index: 1 }, to: { zone: "grid", index: 19 } });
check("dock app moves to grid", slotApp(19) === "notes");
check("dock slot emptied", s().dock[1] === null);

// folder cannot live in the dock
s().resetLayout();
s().drop({ from: { zone: "grid", index: 0 }, to: { zone: "grid", index: 1 } });
const dockBefore = s().dock.join();
s().drop({ from: { zone: "grid", index: 1 }, to: { zone: "dock", index: 0 } });
check("folder rejected from dock", s().dock.join() === dockBefore);
check("folder still on grid", slotFolder(1) !== null);
check("no apps lost after dock rejection", appIds().join() === ALL_INITIAL.join());

/* ---------------------------------------------------------------- */
section("cancel (drop outside) restores state");

s().resetLayout();
const snapshot = JSON.stringify({ grid: s().grid, dock: s().dock });
s().drop({ from: { zone: "grid", index: 3 }, to: null });
check(
  "cancelled drop is a no-op",
  JSON.stringify({ grid: s().grid, dock: s().dock }) === snapshot,
);

/* ---------------------------------------------------------------- */
section("persistence surface");

check("grid size constant", s().grid.length === GRID_SIZE);
const persistApi = useShell.persist;
check("persist api attached", typeof persistApi?.getOptions === "function");
const partialize = persistApi.getOptions().partialize;
const partial = (partialize ? partialize(s()) : {}) as Record<string, unknown>;
check("partialize includes settings", "settings" in partial);
check("partialize includes grid", "grid" in partial);
check("partialize includes dock", "dock" in partial);
check("partialize includes notes", "notes" in partial);
check("partialize excludes stage", !("stage" in partial));
check("partialize excludes recents", !("recents" in partial));
check("partialize excludes openApp", !("openApp" in partial));

// round-trip through the real storage adapter
s().setSetting("wallpaper", "glacier");
s().resetLayout();
s().drop({ from: { zone: "grid", index: 0 }, to: { zone: "grid", index: 9 } });
// writes are synchronous with the JSON storage adapter
const raw = localStorage.getItem("crydroid-shell-v1");
check("state written to storage", typeof raw === "string" && raw.length > 0);
type PersistedPayload = { state?: Record<string, unknown> };
const parsed = (raw ? JSON.parse(raw) : null) as PersistedPayload | null;
const state = parsed?.state ?? {};
check("persisted payload has settings", typeof state.settings === "object" && state.settings !== null);
check("persisted payload omits stage", !("stage" in state));
check("persisted payload omits recents", !("recents" in state));
const persistedGrid = state.grid as typeof DEFAULT_GRID | undefined;
check("persisted grid reflects last drop", persistedGrid?.[0] === null && persistedGrid?.[9] !== null);

/* ---------------------------------------------------------------- */
section("settings, notifications, i18n");

s().setSetting("theme", "light");
check("theme toggle", s().settings.theme === "light");
s().setSetting("theme", "dark");
s().setSetting("locale", "de");
check("locale toggle", dictFor(s().settings.locale).os.skip === "Tippen zum Überspringen");
s().setSetting("locale", "en");
check("en dict", dictFor("en").os.skip === "Tap to skip");
check(
  "dict shapes match",
  Object.keys(dictFor("en")).join() === Object.keys(dictFor("de")).join(),
);
s().setSetting("bootMs", 4200);
check("boot duration configurable", s().settings.bootMs === 4200);

const ids = dictFor("en").notif.map((n) => n.id);
s().dismissNotification(ids[0]);
check("notification dismissed", s().dismissed.includes(ids[0]));
s().dismissNotification(ids[0]);
check("dismiss is idempotent", s().dismissed.filter((i) => i === ids[0]).length === 1);
s().clearNotifications(ids);
check("clear all notifications", ids.every((id) => s().dismissed.includes(id)));

s().setNotes("frost holds");
check("notes persisted field", s().notes === "frost holds");

s().resetLayout();
check("resetLayout restores grid", JSON.stringify(s().grid) === JSON.stringify(DEFAULT_GRID));
check("resetLayout restores dock", s().dock.join() === DEFAULT_DOCK.join());
check("resetLayout keeps settings", s().settings.bootMs === 4200);

/* ---------------------------------------------------------------- */
section("ice model + switching");

check("five ices registered", ICE_SLUGS.length === 5);
check("four desktop ices", DESKTOP_ICES.length === 4);
check("names frozen", DISTROS.crybuntu.name === "crybuntu" && DISTROS.cryarch.name === "CryArch");
check("kinds", DISTROS.crydroid.kind === "phone" && DESKTOP_ICES.every((s2) => DISTROS[s2].kind === "desktop"));
check("boot mark for phone is cryos", markSlugFor("crydroid") === "cryos");
check("boot mark for desktop ice is itself", markSlugFor("crynux") === "crynux");
check("accents readable hex", ICE_SLUGS.every((s2) => /^#[0-9a-f]{6}$/i.test(DISTROS[s2].accent)));
s().setSetting("ice", "cryarch");
check("ice switch persists in settings", s().settings.ice === "cryarch");
s().setSetting("ice", "crydroid");

/* ---------------------------------------------------------------- */
section("desktop window manager");

const VP = { w: 1280, h: 800 };
check("no windows initially", s().windows.length === 0);
s().setMenu(true);
s().winOpen("files", VP);
check("winOpen creates window", s().windows.length === 1);
check("opening closes the menu", s().menuOpen === false);
const filesWin = s().windows[0];
check("window sized from defaults", filesWin.appId === "files" && filesWin.w > 0 && filesWin.h > 0);
check("window inside viewport", filesWin.x >= 0 && filesWin.y >= 0 && filesWin.x + filesWin.w <= VP.w && filesWin.y + filesWin.h <= VP.h - TASKBAR_H + 1);

const z1 = filesWin.z;
s().winOpen("terminal", VP);
s().winOpen("files", VP);
check("single instance per app", s().windows.filter((w) => w.appId === "files").length === 1);
check("reopen raises z above others", (s().windows.find((w) => w.appId === "files")?.z ?? 0) > (s().windows.find((w) => w.appId === "terminal")?.z ?? 0));
check("z increased from initial open", (s().windows.find((w) => w.appId === "files")?.z ?? 0) > z1);

const f2 = s().windows.find((w) => w.appId === "files");
if (f2) {
  s().winMinimize(f2.id);
  check("minimize sets min", s().windows.find((w) => w.id === f2.id)?.min === true);
  s().winFocus(f2.id);
  check("focus restores minimized", s().windows.find((w) => w.id === f2.id)?.min === false);
  s().winToggleMax(f2.id);
  check("toggle max", s().windows.find((w) => w.id === f2.id)?.max === true);
  s().winToggleMax(f2.id);
  check("toggle max back", s().windows.find((w) => w.id === f2.id)?.max === false);
  s().winMove(f2.id, 120, 80);
  check("move applied", s().windows.find((w) => w.id === f2.id)?.x === 120 && s().windows.find((w) => w.id === f2.id)?.y === 80);
  s().winResize(f2.id, { w: MIN_W, h: MIN_H });
  check("resize applied", s().windows.find((w) => w.id === f2.id)?.w === MIN_W);
}

s().winMinimizeAll();
check("minimize all", s().windows.length > 0 && s().windows.every((w) => w.min));
s().winClose(s().windows[0].id);
check("close removes window", s().windows.every((w) => w.id !== filesWin.id) || s().windows.length === 1);
const before = s().windows.length;
s().winClose("nonexistent");
check("close unknown id is a no-op", s().windows.length === before);

// clamped open on a tiny viewport
s().winOpen("settings", { w: 300, h: 300 });
const tiny = s().windows[s().windows.length - 1];
check("tiny viewport clamps window", tiny.w >= MIN_W || tiny.w <= 300);
check("tiny window starts on-screen", tiny.x >= 0 && tiny.y >= 0);

s().setMenu(true);
check("menu toggles open", s().menuOpen === true);
s().setMenu(false);
check("menu toggles closed", s().menuOpen === false);

// windows are session-only (never persisted)
const partialize2 = useShell.persist.getOptions().partialize;
const partial2 = (partialize2 ? partialize2(s()) : {}) as Record<string, unknown>;
check("windows not persisted", !("windows" in partial2));
check("menu not persisted", !("menuOpen" in partial2));

/* ---------------------------------------------------------------- */
section("window snapping (pure geometry)");

const VW = 1280;
const VH = 800;
const USABLE = VH - TASKBAR_H;
check("center arms no snap", snapZoneFor(VW / 2, VH / 2, VW, VH) === null);
check("left edge arms left", snapZoneFor(SNAP_EDGE - 4, VH / 2, VW, VH) === "left");
check("right edge arms right", snapZoneFor(VW - SNAP_EDGE + 4, VH / 2, VW, VH) === "right");
check("top edge arms top", snapZoneFor(VW / 2, SNAP_EDGE - 4, VW, VH) === "top");
check("top-left corner arms nw", snapZoneFor(8, 8, VW, VH) === "nw");
check("top-right corner arms ne", snapZoneFor(VW - 8, 8, VW, VH) === "ne");
check("bottom-left corner arms sw", snapZoneFor(8, USABLE - 8, VW, VH) === "sw");
check("bottom-right corner arms se", snapZoneFor(VW - 8, USABLE - 8, VW, VH) === "se");
check("taskbar strip arms nothing", snapZoneFor(8, VH - 4, VW, VH) === null);
check("corner beats edge", snapZoneFor(12, 40, VW, VH) === "nw");

const left = snapGeometry("left", VW, VH);
check("left half geometry", left.x === 0 && left.y === 0 && left.w === VW / 2 && left.h === USABLE);
const right = snapGeometry("right", VW, VH);
check("right half geometry", right.x === VW / 2 && right.w === VW - VW / 2 && right.h === USABLE);
const top = snapGeometry("top", VW, VH);
check("top geometry = full usable area", top.w === VW && top.h === USABLE);
const se = snapGeometry("se", VW, VH);
check("se quadrant geometry", se.x === VW / 2 && se.y === Math.round(USABLE / 2) && se.w === VW - VW / 2);
const halves = [snapGeometry("left", VW, VH), snapGeometry("right", VW, VH)];
check("halves tile the usable area", halves[0].w + halves[1].w === VW);
const quads = ["nw", "ne", "sw", "se"].map((z) => snapGeometry(z as "nw", VW, VH));
check("quadrants within usable area", quads.every((q) => q.y + q.h <= USABLE && q.x + q.w <= VW));

/* ---------------------------------------------------------------- */
section("CryCenter + snap preview state");

check("cryCenter starts closed", s().cryCenterOpen === false);
s().setCryCenter(true);
check("cryCenter opens", s().cryCenterOpen === true);
s().setMenu(true);
s().lockNow();
check("lock closes cryCenter", s().cryCenterOpen === false);
check("lock closes app menu", s().menuOpen === false);
check("lock returns to lock stage", s().stage === "lock");
s().requestUnlock();

const rect = { x: 1, y: 2, w: 300, h: 200 };
s().setSnapPreview(rect);
const preview = s().snapPreview;
check("snap preview stored", preview !== null && preview.w === 300);
s().setSnapPreview(null);
check("snap preview cleared", s().snapPreview === null);

const partialize3 = useShell.persist.getOptions().partialize;
const partial3 = (partialize3 ? partialize3(s()) : {}) as Record<string, unknown>;
check("cryCenter not persisted", !("cryCenterOpen" in partial3));
check("snapPreview not persisted", !("snapPreview" in partial3));

/* ---------------------------------------------------------------- */
console.log(
  failures === 0 ? "\nAll smoke checks passed." : `\n${failures} smoke check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
