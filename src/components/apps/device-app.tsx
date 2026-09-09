"use client";

import { useState } from "react";
import { Waypoints } from "lucide-react";
import { useDict } from "@/i18n";
import { cn } from "@/lib/utils";

type MockDevice = { name: string; kind: string; connected: boolean };

const INITIAL: MockDevice[] = [
  { name: "CryWatch", kind: "wearable", connected: true },
  { name: "CryTab", kind: "slate", connected: false },
  { name: "CryBuds", kind: "audio", connected: false },
  { name: "CryDeck", kind: "desktop", connected: true },
];

/** Device — Super Device bus (visual mock only). */
export function DeviceApp() {
  const d = useDict();
  const [devices, setDevices] = useState<MockDevice[]>(INITIAL);

  const toggle = (name: string) =>
    setDevices((prev) =>
      prev.map((dev) => (dev.name === name ? { ...dev, connected: !dev.connected } : dev)),
    );

  const online = devices.filter((dev) => dev.connected).length;

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center gap-3 rounded-2xl bg-surface/60 px-4 py-3.5 ring-1 ring-line backdrop-blur-xl">
        <Waypoints className="size-5 text-primary" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-semibold">{d.deviceApp.bus}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {d.deviceApp.scanning} · {online}/{devices.length}
          </p>
        </div>
      </div>

      {devices.map((dev) => (
        <button
          key={dev.name}
          type="button"
          role="switch"
          aria-checked={dev.connected}
          onClick={() => toggle(dev.name)}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3.5 ring-1 transition-colors",
            dev.connected
              ? "bg-primary/12 ring-primary/40"
              : "bg-surface/50 ring-line hover:bg-surface-2",
          )}
        >
          <span className="text-left">
            <span className="block text-[13px] font-semibold">{dev.name}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {dev.kind}
            </span>
          </span>
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-wider",
              dev.connected ? "text-primary" : "text-muted",
            )}
          >
            {dev.connected ? d.deviceApp.connected : d.deviceApp.disconnected}
          </span>
        </button>
      ))}

      <p className="mt-2 text-center text-xs italic text-muted">{d.deviceApp.mockNote}</p>
    </div>
  );
}
