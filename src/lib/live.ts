import type { Locale } from "@/i18n";

function localeTag(locale: Locale): string {
  return locale === "de" ? "de-DE" : "en-GB";
}

/** HH:MM in 24h format, locale-aware. */
export function formatTime(now: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}

/** HH:MM:SS for the Clock app. */
export function formatTimeSeconds(now: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
}

/** Long date, e.g. "Tuesday, 9 September" / "Dienstag, 9. September". */
export function formatDate(now: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
}

/** Compact date for the desktop taskbar, e.g. "Tue, 9 Sep". */
export function formatShortDate(now: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(now);
}

export type FrostKind = "clear" | "rime" | "hoar" | "graupel";

/** Mock weather: the frost kind follows the hour of day. */
export function frostKind(now: Date): FrostKind {
  const h = now.getHours();
  if (h < 5) return "hoar";
  if (h < 11) return "rime";
  if (h < 17) return "clear";
  if (h < 21) return "graupel";
  return "hoar";
}

/** Mock temperature in °C — deterministic, cold, diurnal. */
export function tempC(now: Date): number {
  const h = now.getHours() + now.getMinutes() / 60;
  return Math.round(-3 + 5 * Math.sin(((h - 4) / 24) * Math.PI * 2));
}

/** Rotating doctrine phrases ("word of the cycle"), keyed by day of year. */
export const CYCLE_WORDS = [
  "One law, many ices.",
  "Distill, do not clone.",
  "Take the law. Leave the costume.",
  "Names stay frozen.",
  "The law does not change.",
  "Not a website. A session.",
] as const;

export function wordOfCycle(now: Date): string {
  const start = Date.UTC(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start) / 86_400_000);
  return CYCLE_WORDS[day % CYCLE_WORDS.length];
}

/** Mock battery: starts at 88 %, drains 1 % per 2 minutes of session, floor 12 %. */
export function batteryLevel(now: Date, bootedAt: number): number {
  const minutes = (now.getTime() - bootedAt) / 60_000;
  return Math.max(12, Math.min(88, 88 - Math.floor(minutes / 2)));
}
