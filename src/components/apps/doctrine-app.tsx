"use client";

import { useDict } from "@/i18n";
import { DOCTRINE } from "@/lib/doctrine";

/** CryBel / Family / Manifest / DNA — frozen doctrine pages (EN only, per the law). */
export function DoctrineApp({ appId }: { appId: keyof typeof DOCTRINE }) {
  const d = useDict();
  const page = DOCTRINE[appId];

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">{d.apps[appId]}</h2>
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.24em] text-primary">
          {page.tagline}
        </p>
      </header>

      {page.sections.map((section, i) => {
        switch (section.kind) {
          case "p":
            return (
              <p key={i} className="text-[13.5px] leading-relaxed text-fg/90">
                {section.text}
              </p>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-primary/60 pl-4 text-[15px] italic leading-relaxed text-fg"
              >
                {section.text}
              </blockquote>
            );
          case "list":
            return (
              <ul key={i} className="flex list-disc flex-col gap-2 pl-5">
                {section.items.map((item) => (
                  <li key={item} className="text-[13px] leading-relaxed text-fg/90 marker:text-primary">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "table":
            return (
              <div key={i} className="overflow-hidden rounded-2xl ring-1 ring-line">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-2">
                      {section.cols.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row) => (
                      <tr key={row[0]} className="border-t border-line">
                        <td className="px-3 py-2 text-[12.5px] font-semibold">{row[0]}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-primary">{row[1]}</td>
                        <td className="px-3 py-2 text-[12px] text-muted">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
