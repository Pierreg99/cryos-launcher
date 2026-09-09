"use client";

import { useState, type ReactNode } from "react";
import { Lock, RotateCcw } from "lucide-react";
import { DISTROS, ICE_SLUGS } from "@/lib/crybel";
import { DistroMark } from "@/components/distro-mark";
import { markSlugFor } from "@/lib/crybel";
import { useDict, LOCALES, type Locale } from "@/i18n";
import { useShell, type Settings, type ThemeMode, type LockStyle } from "@/store/shell";
import { WALLPAPERS, type WallpaperId } from "@/lib/wallpapers";
import { cn, type CSSVars } from "@/lib/utils";

/**
 * Settings — the one app with real, persisted controls: theme (global
 * dark: classes), language, wallpaper, boot duration, lock style, radios,
 * parallax, brightness, layout reset, lock now.
 */
export function SettingsApp() {
  const d = useDict();
  const s = useShell((st) => st.settings);
  const setSetting = useShell((st) => st.setSetting);
  const resetLayout = useShell((st) => st.resetLayout);
  const lockNow = useShell((st) => st.lockNow);
  const [resetDone, setResetDone] = useState(false);
  const t = d.settingsApp;

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <Section title={t.ice}>
        <div className="flex flex-col gap-0.5 px-1.5 py-1">
          {ICE_SLUGS.map((slug) => {
            const distro = DISTROS[slug];
            const active = s.ice === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setSetting("ice", slug)}
                aria-pressed={active}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left ring-1 transition-colors",
                  active
                    ? "bg-primary/12 ring-primary/50"
                    : "ring-transparent hover:bg-surface-2",
                )}
              >
                <DistroMark slug={markSlugFor(slug)} className="size-6 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{distro.name}</span>
                  <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                    {distro.base}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-muted">
                  {distro.kind === "phone" ? t.kindPhone : t.kindDesktop}
                </span>
              </button>
            );
          })}
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] italic text-muted">{t.iceHint}</p>
        </div>
      </Section>

      <Section title={t.appearance}>
        <Row label={t.theme}>
          <Segmented
            options={[
              { value: "dark" as ThemeMode, label: t.dark },
              { value: "light" as ThemeMode, label: t.light },
            ]}
            value={s.theme}
            onChange={(v) => setSetting("theme", v)}
          />
        </Row>
        <Row label={t.language}>
          <Segmented
            options={LOCALES.map((l) => ({ value: l, label: l.toUpperCase() }))}
            value={s.locale}
            onChange={(v) => setSetting("locale", v as Locale)}
          />
        </Row>
        <Row label={t.wallpaper} stacked>
          <div className="mt-2 flex gap-2">
            {WALLPAPERS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSetting("wallpaper", w.id as WallpaperId)}
                aria-label={d.wallpapers[w.nameKey]}
                className={cn(
                  "relative h-20 flex-1 cursor-pointer overflow-hidden rounded-xl ring-1 transition-all",
                  s.wallpaper === w.id
                    ? "ring-2 ring-primary"
                    : "ring-line hover:ring-primary/40",
                )}
              >
                <WallpaperThumb id={w.id} />
                <span className="absolute inset-x-0 bottom-0 bg-black/45 py-0.5 text-center text-[9px] font-medium uppercase tracking-wider text-white">
                  {d.wallpapers[w.nameKey]}
                </span>
              </button>
            ))}
          </div>
        </Row>
        <ToggleRow
          label={t.parallax}
          checked={s.parallax}
          onChange={(v) => setSetting("parallax", v)}
        />
        <Row label={`${t.brightness} · ${s.brightness}%`} stacked>
          <input
            type="range"
            min={40}
            max={100}
            step={5}
            value={s.brightness}
            onChange={(e) => setSetting("brightness", Number(e.target.value))}
            className="mt-2 w-full cursor-pointer"
            aria-label={t.brightness}
          />
        </Row>
      </Section>

      <Section title={t.system}>
        <Row label={`${t.bootDuration} · ${(s.bootMs / 1000).toFixed(1)}${t.secondsShort}`} stacked>
          <input
            type="range"
            min={800}
            max={6000}
            step={200}
            value={s.bootMs}
            onChange={(e) => setSetting("bootMs", Number(e.target.value))}
            className="mt-2 w-full cursor-pointer"
            aria-label={t.bootDuration}
          />
        </Row>
        <Row label={t.lockStyle}>
          <Segmented
            options={[
              { value: "none" as LockStyle, label: t.lockNone },
              { value: "pin" as LockStyle, label: t.lockPin },
            ]}
            value={s.lockStyle}
            onChange={(v) => setSetting("lockStyle", v)}
          />
        </Row>
      </Section>

      <Section title={t.radios}>
        <ToggleRow label={t.wifi} checked={s.wifi} onChange={(v) => setSetting("wifi", v)} />
        <ToggleRow
          label={t.bluetooth}
          checked={s.bluetooth}
          onChange={(v) => setSetting("bluetooth", v)}
        />
        <ToggleRow
          label={t.airplane}
          checked={s.airplane}
          onChange={(v) => setSetting("airplane", v)}
        />
      </Section>

      <Section title={t.layout}>
        <button
          type="button"
          onClick={() => {
            resetLayout();
            setResetDone(true);
            window.setTimeout(() => setResetDone(false), 1600);
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-3 text-left ring-1 ring-line transition-colors hover:bg-primary/10"
        >
          <RotateCcw className="size-4 text-muted" />
          <span className="text-[13px] font-medium">{resetDone ? t.resetDone : t.resetLayout}</span>
        </button>
        <button
          type="button"
          onClick={lockNow}
          className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-3 text-left ring-1 ring-line transition-colors hover:bg-primary/10"
        >
          <Lock className="size-4 text-muted" />
          <span className="text-[13px] font-medium">{t.lockNow}</span>
        </button>
      </Section>

      <Section title={t.about}>
        <p className="px-3.5 pb-1 font-mono text-[11px] leading-relaxed text-muted">
          {t.aboutLine}
          <br />
          {DISTROS[s.ice].name} · one law, many ices · v0.2.0
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.26em] text-primary">
        {title}
      </h2>
      <div className="flex flex-col gap-1 rounded-2xl bg-surface/60 p-1.5 ring-1 ring-line backdrop-blur-xl">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
  stacked = false,
}: {
  label: string;
  children: ReactNode;
  stacked?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-3.5 py-2.5",
        stacked ? "flex flex-col" : "flex items-center justify-between gap-3",
      )}
    >
      <span className="text-[13px] font-medium">{label}</span>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-left"
    >
      <span className="text-[13px] font-medium">{label}</span>
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-200",
          checked ? "bg-primary" : "bg-fg/20",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-200",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-surface-2 p-0.5 ring-1 ring-line">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors",
            value === o.value ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function WallpaperThumb({ id }: { id: WallpaperId }) {
  // miniature static preview using the same CSS layer classes
  const layers: Record<WallpaperId, string[]> = {
    aurora: ["wp-aurora-base", "wp-aurora-g1", "wp-aurora-g2"],
    hex: ["wp-hex-base", "wp-hex-grid", "wp-hex-glow"],
    glacier: ["wp-glacier-base", "wp-glacier-r1", "wp-glacier-r2"],
  };
  return (
    <span className="absolute inset-0" style={{ "--depth": 0 } as CSSVars} aria-hidden>
      {layers[id].map((cls) => (
        <span key={cls} className={cn("wp-static", cls)} />
      ))}
    </span>
  );
}

/* keep the Settings type referenced for future typed helpers */
export type SettingsKey = keyof Settings;
