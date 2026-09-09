import { useShell } from "@/store/shell";
import type { AppId } from "@/lib/apps";

/**
 * EN/DE dictionary — mirrors the reference repo's `@/i18n` (useDict).
 * Doctrine quotes and ice names stay frozen in both locales.
 */

export type Locale = "en" | "de";
export const LOCALES: Locale[] = ["en", "de"];

export type MockNotification = {
  id: string;
  appId: AppId;
  title: string;
  body: string;
  ago: string;
};

const en = {
  os: {
    skip: "Tap to skip",
    tap: "Tap to thaw",
    swipe: "Swipe up to thaw",
    homeHint: "Home — tap the pill, swipe up from the bottom edge",
    recentsHint: "Recents — hold the pill or swipe up and hold",
    backHint: "Back",
    closeHint: "Close",
  },
  boot: {
    epigraph: "One law, many ices.",
  },
  lock: {
    pinTitle: "Enter PIN to thaw",
    pinHint: "Mock lock — any 4 digits thaw the session",
    pinClear: "Clear digit",
  },
  home: {
    wordOfCycle: "Word of the cycle",
  },
  weather: {
    clear: "Clear frost",
    rime: "Rime drift",
    hoar: "Hoar silence",
    graupel: "Graupel showers",
    mockLabel: "CryIndex weather · mock",
  },
  drawer: {
    search: "Search apps",
    all: "All",
    empty: "No apps match the query",
    close: "Close drawer",
  },
  categories: {
    doctrine: "Doctrine",
    system: "System",
    everyday: "Everyday",
  },
  recents: {
    clearAll: "Clear all",
    empty: "No recent apps",
    emptyHint: "Open an app — it will freeze here.",
    closeCard: "Dismiss app",
    snapshot: "snapshot · frozen",
  },
  shade: {
    notifications: "Notifications",
    quickSettings: "Quick settings",
    clearAll: "Clear all",
    noNotifications: "No notifications. All frozen.",
    brightness: "Brightness",
    dismiss: "Dismiss notification",
  },
  tiles: {
    wifi: "WLAN",
    bluetooth: "Bluetooth",
    darkMode: "Dark mode",
    airplane: "Airplane",
    parallax: "Parallax",
  },
  settingsApp: {
    ice: "Ice",
    iceHint: "Switch ice — the law does not change.",
    kindPhone: "phone",
    kindDesktop: "desktop",
    appearance: "Appearance",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",
    wallpaper: "Wallpaper",
    parallax: "Wallpaper parallax",
    brightness: "Brightness",
    system: "System",
    bootDuration: "Boot duration",
    lockStyle: "Lock screen",
    lockNone: "Swipe",
    lockPin: "PIN (mock)",
    radios: "Radios",
    wifi: "WLAN",
    bluetooth: "Bluetooth",
    airplane: "Airplane mode",
    layout: "Layout",
    resetLayout: "Reset home layout",
    resetDone: "Layout reset",
    lockNow: "Lock now",
    about: "About",
    aboutLine: "cryOS preview · fully virtualized",
    secondsShort: "s",
  },
  desktop: {
    appMenu: "App menu",
    startHint: "Open app menu",
    minimize: "Minimize",
    maximize: "Maximize",
    restore: "Restore",
    close: "Close",
    minimizeAll: "Minimize all windows (click the desktop)",
    taskbar: "Taskbar",
    clockHint: "Open Clock",
    running: "Running",
    lock: "Lock session",
  },
  wallpapers: {
    aurora: "Aurora",
    hexLattice: "Hex lattice",
    glacier: "Glacier",
  },
  folder: {
    defaultName: "Folder",
    close: "Close folder",
  },
  apps: {
    bible: "CryBel",
    family: "Family",
    device: "Device",
    files: "Files",
    notes: "CryPaper",
    terminal: "CryoLan",
    clock: "Clock",
    manifest: "Manifest",
    dna: "DNA",
    settings: "Settings",
  } as Record<AppId, string>,
  notesApp: {
    hint: "Notes that hold. Stored on this device.",
    chars: "chars",
  },
  terminalApp: {
    placeholder: "cryolan> type help",
    banner: [
      "CryoLan 1.0 — cryOS fabric runtime (mock)",
      "Type `help` for commands. Names stay frozen.",
    ],
    unknown: "cryolan: unknown command",
    tryHelp: "try `help`",
  },
  filesApp: {
    footer: "CryIndex walker · read-only preview",
    entries: "entries",
  },
  deviceApp: {
    bus: "Super Device bus",
    scanning: "mesh online · scanning",
    connected: "Connected",
    disconnected: "Not connected",
    mockNote: "The mesh is mocked. No radios were harmed.",
  },
  clockApp: {
    analog: "Analog frost",
  },
  notif: [
    {
      id: "n1",
      appId: "terminal",
      title: "CryIndex rebuilt",
      body: "1,284 entries re-frozen. Doctrine tree consistent.",
      ago: "12m",
    },
    {
      id: "n2",
      appId: "family",
      title: "crybuntu synced",
      body: "Friendly thaw completed. 3 packages held back by the law.",
      ago: "47m",
    },
    {
      id: "n3",
      appId: "bible",
      title: "Name frozen",
      body: "Crydroid entered the bible. Spelling locked in EN and DE.",
      ago: "2h",
    },
    {
      id: "n4",
      appId: "device",
      title: "CryWatch paired",
      body: "Super Device bus: wearable joined the mesh.",
      ago: "5h",
    },
  ] as MockNotification[],
};

const de: typeof en = {
  os: {
    skip: "Tippen zum Überspringen",
    tap: "Tippen zum Auftauen",
    swipe: "Zum Auftauen nach oben wischen",
    homeHint: "Home — Pill antippen oder vom unteren Rand nach oben wischen",
    recentsHint: "Recents — Pill halten oder nach oben wischen und halten",
    backHint: "Zurück",
    closeHint: "Schließen",
  },
  boot: {
    epigraph: "Ein Gesetz, viele Eise.",
  },
  lock: {
    pinTitle: "PIN zum Auftauen eingeben",
    pinHint: "Mock-Sperre — beliebige 4 Ziffern tauen die Sitzung auf",
    pinClear: "Ziffer löschen",
  },
  home: {
    wordOfCycle: "Wort des Zyklus",
  },
  weather: {
    clear: "Klarer Frost",
    rime: "Reifdrift",
    hoar: "Reifstille",
    graupel: "Graupelschauer",
    mockLabel: "CryIndex-Wetter · Mock",
  },
  drawer: {
    search: "Apps suchen",
    all: "Alle",
    empty: "Keine Apps gefunden",
    close: "Drawer schließen",
  },
  categories: {
    doctrine: "Doktrin",
    system: "System",
    everyday: "Alltag",
  },
  recents: {
    clearAll: "Alle löschen",
    empty: "Keine letzten Apps",
    emptyHint: "Öffne eine App — sie friert hier ein.",
    closeCard: "App entfernen",
    snapshot: "Schnappschuss · gefroren",
  },
  shade: {
    notifications: "Benachrichtigungen",
    quickSettings: "Schnelleinstellungen",
    clearAll: "Alle löschen",
    noNotifications: "Keine Benachrichtigungen. Alles gefroren.",
    brightness: "Helligkeit",
    dismiss: "Benachrichtigung entfernen",
  },
  tiles: {
    wifi: "WLAN",
    bluetooth: "Bluetooth",
    darkMode: "Dunkel",
    airplane: "Flugmodus",
    parallax: "Parallax",
  },
  settingsApp: {
    ice: "Ice",
    iceHint: "Ice wechseln — das Gesetz ändert sich nicht.",
    kindPhone: "Phone",
    kindDesktop: "Desktop",
    appearance: "Darstellung",
    theme: "Design",
    dark: "Dunkel",
    light: "Hell",
    language: "Sprache",
    wallpaper: "Wallpaper",
    parallax: "Wallpaper-Parallax",
    brightness: "Helligkeit",
    system: "System",
    bootDuration: "Boot-Dauer",
    lockStyle: "Sperrbildschirm",
    lockNone: "Wischen",
    lockPin: "PIN (Mock)",
    radios: "Funk",
    wifi: "WLAN",
    bluetooth: "Bluetooth",
    airplane: "Flugmodus",
    layout: "Layout",
    resetLayout: "Home-Layout zurücksetzen",
    resetDone: "Layout zurückgesetzt",
    lockNow: "Jetzt sperren",
    about: "Über",
    aboutLine: "cryOS-Vorschau · voll virtualisiert",
    secondsShort: "s",
  },
  desktop: {
    appMenu: "App-Menü",
    startHint: "App-Menü öffnen",
    minimize: "Minimieren",
    maximize: "Maximieren",
    restore: "Wiederherstellen",
    close: "Schließen",
    minimizeAll: "Alle Fenster minimieren (Desktop anklicken)",
    taskbar: "Taskleiste",
    clockHint: "Clock öffnen",
    running: "Läuft",
    lock: "Sitzung sperren",
  },
  wallpapers: {
    aurora: "Aurora",
    hexLattice: "Hex-Gitter",
    glacier: "Gletscher",
  },
  folder: {
    defaultName: "Ordner",
    close: "Ordner schließen",
  },
  apps: {
    bible: "CryBel",
    family: "Family",
    device: "Device",
    files: "Files",
    notes: "CryPaper",
    terminal: "CryoLan",
    clock: "Clock",
    manifest: "Manifest",
    dna: "DNA",
    settings: "Settings",
  },
  notesApp: {
    hint: "Notizen, die halten. Auf diesem Gerät gespeichert.",
    chars: "Zeichen",
  },
  terminalApp: {
    placeholder: "cryolan> help eingeben",
    banner: [
      "CryoLan 1.0 — cryOS Fabric-Runtime (Mock)",
      "`help` zeigt die Befehle. Namen bleiben gefroren.",
    ],
    unknown: "cryolan: unbekannter Befehl",
    tryHelp: "versuche `help`",
  },
  filesApp: {
    footer: "CryIndex-Walker · schreibgeschützte Vorschau",
    entries: "Einträge",
  },
  deviceApp: {
    bus: "Super Device Bus",
    scanning: "Mesh online · scannt",
    connected: "Verbunden",
    disconnected: "Nicht verbunden",
    mockNote: "Das Mesh ist ein Mock. Keine Funkmodule wurden verletzt.",
  },
  clockApp: {
    analog: "Analoger Frost",
  },
  notif: [
    {
      id: "n1",
      appId: "terminal",
      title: "CryIndex neu aufgebaut",
      body: "1.284 Einträge neu gefroren. Doktrin-Baum konsistent.",
      ago: "12 Min.",
    },
    {
      id: "n2",
      appId: "family",
      title: "crybuntu synchronisiert",
      body: "Freundliches Tauwetter abgeschlossen. 3 Pakete vom Gesetz zurückgehalten.",
      ago: "47 Min.",
    },
    {
      id: "n3",
      appId: "bible",
      title: "Name gefroren",
      body: "Crydroid in die Bibel aufgenommen. Schreibweise in EN und DE gesperrt.",
      ago: "2 Std.",
    },
    {
      id: "n4",
      appId: "device",
      title: "CryWatch gekoppelt",
      body: "Super Device Bus: Wearable ist dem Mesh beigetreten.",
      ago: "5 Std.",
    },
  ],
};

const DICT = { en, de } as const;

export type Dict = (typeof DICT)["en"];

export function dictFor(locale: Locale): Dict {
  return DICT[locale];
}

/** React hook — returns the dictionary for the persisted locale. */
export function useDict(): Dict {
  const locale = useShell((s) => s.settings.locale);
  return DICT[locale];
}
