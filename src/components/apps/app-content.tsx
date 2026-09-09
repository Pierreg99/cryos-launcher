"use client";

import type { AppId } from "@/lib/apps";
import { SettingsApp } from "@/components/apps/settings-app";
import { ClockApp } from "@/components/apps/clock-app";
import { TerminalApp } from "@/components/apps/terminal-app";
import { NotesApp } from "@/components/apps/notes-app";
import { FilesApp } from "@/components/apps/files-app";
import { DeviceApp } from "@/components/apps/device-app";
import { DoctrineApp } from "@/components/apps/doctrine-app";

/** Shared app renderer — phone full-screen activities and desktop windows. */
export function AppContent({ appId }: { appId: AppId }) {
  switch (appId) {
    case "settings":
      return <SettingsApp />;
    case "clock":
      return <ClockApp />;
    case "terminal":
      return <TerminalApp />;
    case "notes":
      return <NotesApp />;
    case "files":
      return <FilesApp />;
    case "device":
      return <DeviceApp />;
    case "bible":
    case "family":
    case "manifest":
    case "dna":
      return <DoctrineApp appId={appId} />;
  }
}
