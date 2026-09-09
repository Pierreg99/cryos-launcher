"use client";

import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { useNow } from "@/hooks/use-now";
import { formatDate, formatTimeSeconds } from "@/lib/live";

/** Clock — analog frost, live second hand. */
export function ClockApp() {
  const d = useDict();
  const now = useNow(1000);
  const locale = useShell((s) => s.settings.locale);

  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const hourAngle = hours * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-8">
      <svg viewBox="0 0 200 200" className="size-60" role="img" aria-label={d.clockApp.analog}>
        <circle cx="100" cy="100" r="94" className="fill-surface-2 stroke-line" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="86" className="fill-none stroke-line" strokeWidth="0.75" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 74 : 79;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.sin(a)}
              y1={100 - r1 * Math.cos(a)}
              x2={100 + 84 * Math.sin(a)}
              y2={100 - 84 * Math.cos(a)}
              className={i % 3 === 0 ? "stroke-fg" : "stroke-muted"}
              strokeWidth={i % 3 === 0 ? 3 : 1.5}
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1="100" y1="100"
          x2={100 + 46 * Math.sin((hourAngle * Math.PI) / 180)}
          y2={100 - 46 * Math.cos((hourAngle * Math.PI) / 180)}
          className="stroke-fg" strokeWidth="5" strokeLinecap="round"
        />
        <line
          x1="100" y1="100"
          x2={100 + 66 * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={100 - 66 * Math.cos((minuteAngle * Math.PI) / 180)}
          className="stroke-fg" strokeWidth="3" strokeLinecap="round"
        />
        <line
          x1={100 - 14 * Math.sin((secondAngle * Math.PI) / 180)}
          y1={100 + 14 * Math.cos((secondAngle * Math.PI) / 180)}
          x2={100 + 72 * Math.sin((secondAngle * Math.PI) / 180)}
          y2={100 - 72 * Math.cos((secondAngle * Math.PI) / 180)}
          className="stroke-primary" strokeWidth="1.5" strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="4" className="fill-primary" />
      </svg>

      <div className="text-center">
        <p className="font-mono text-3xl tabular-nums tracking-tight">
          {now ? formatTimeSeconds(now, locale) : "--:--:--"}
        </p>
        <p className="mt-2 text-sm text-muted">{now ? formatDate(now, locale) : "\u00A0"}</p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.26em] text-primary">
          {d.clockApp.analog}
        </p>
      </div>
    </div>
  );
}
