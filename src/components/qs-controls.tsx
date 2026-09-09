"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bluetooth,
  Layers,
  Moon,
  Plane,
  Snowflake,
  Sun,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useDict, type MockNotification } from "@/i18n";
import { useShell } from "@/store/shell";
import { APPS } from "@/lib/apps";
import { cn } from "@/lib/utils";

/**
 * Shared control surfaces — the phone notification shade and the desktop
 * CryCenter render the same quick-settings grid and notification list
 * (one law, many ices).
 */

export function QsTile({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex cursor-pointer flex-col items-start gap-2 rounded-2xl px-3.5 py-3 text-left ring-1 transition-colors duration-150",
        active
          ? "bg-primary/18 text-primary ring-primary/50"
          : "bg-surface-2 text-muted ring-line hover:text-fg",
      )}
    >
      <Icon className="size-[18px]" strokeWidth={2} />
      <span className="text-[10.5px] font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}

/** WLAN · Bluetooth · dark mode (real theme state) · airplane · parallax · brightness. */
export function QsGrid() {
  const d = useDict();
  const settings = useShell((s) => s.settings);
  const setSetting = useShell((s) => s.setSetting);

  return (
    <div className="grid grid-cols-3 gap-2">
      <QsTile
        label={d.tiles.wifi}
        active={settings.wifi && !settings.airplane}
        onClick={() => setSetting("wifi", !settings.wifi)}
        icon={settings.wifi ? Wifi : WifiOff}
      />
      <QsTile
        label={d.tiles.bluetooth}
        active={settings.bluetooth && !settings.airplane}
        onClick={() => setSetting("bluetooth", !settings.bluetooth)}
        icon={Bluetooth}
      />
      <QsTile
        label={d.tiles.darkMode}
        active={settings.theme === "dark"}
        onClick={() => setSetting("theme", settings.theme === "dark" ? "light" : "dark")}
        icon={settings.theme === "dark" ? Moon : Sun}
      />
      <QsTile
        label={d.tiles.airplane}
        active={settings.airplane}
        onClick={() => setSetting("airplane", !settings.airplane)}
        icon={Plane}
      />
      <QsTile
        label={d.tiles.parallax}
        active={settings.parallax}
        onClick={() => setSetting("parallax", !settings.parallax)}
        icon={Layers}
      />
      <div className="flex flex-col justify-center gap-1.5 rounded-2xl bg-surface-2 px-3 py-2 ring-1 ring-line">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <Sun className="size-3" />
          {d.shade.brightness}
        </span>
        <input
          type="range"
          min={40}
          max={100}
          step={5}
          value={settings.brightness}
          onChange={(e) => setSetting("brightness", Number(e.target.value))}
          aria-label={d.shade.brightness}
          className="w-full cursor-pointer"
        />
      </div>
    </div>
  );
}

/** Notifications header (count + clear-all) + swipe-dismissable list + empty state. */
export function NotificationsSection() {
  const d = useDict();
  const dismissed = useShell((s) => s.dismissed);
  const clearNotifications = useShell((s) => s.clearNotifications);
  const visible = d.notif.filter((n) => !dismissed.includes(n.id));

  return (
    <div>
      <div className="mb-2 mt-5 flex items-center justify-between px-1">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
          {d.shade.notifications}
          {visible.length > 0 && ` · ${visible.length}`}
        </h2>
        {visible.length > 0 && (
          <button
            type="button"
            onClick={() => clearNotifications(visible.map((n) => n.id))}
            aria-label={d.shade.clearAll}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <Snowflake className="size-7 text-muted/60" strokeWidth={1.5} />
          <p className="text-xs text-muted">{d.shade.noNotifications}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {visible.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

export function NotificationRow({ notification: n }: { notification: MockNotification }) {
  const d = useDict();
  const dismissNotification = useShell((s) => s.dismissNotification);
  const app = APPS[n.appId];
  const Glyph = app.icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 240, transition: { duration: 0.18 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragDirectionLock
      onDragEnd={(_, info) => {
        if (info.offset.x > 90 || info.velocity.x > 500) dismissNotification(n.id);
      }}
      className="relative flex cursor-grab items-start gap-3 rounded-2xl bg-surface-2 p-3 ring-1 ring-line active:cursor-grabbing"
    >
      <span
        className={cn("grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br", app.tint)}
      >
        <Glyph className="size-4 text-white" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13px] font-semibold">{n.title}</span>
          <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-muted">
            {n.ago}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted">{n.body}</span>
      </span>
      <button
        type="button"
        onClick={() => dismissNotification(n.id)}
        aria-label={d.shade.dismiss}
        className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
      >
        <X className="size-3.5" />
      </button>
    </motion.li>
  );
}
