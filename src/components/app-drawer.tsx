"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { APP_IDS, APPS, APP_CATEGORIES, type AppCategory } from "@/lib/apps";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/app-icon";

/**
 * Module 6 — App drawer: all installed mock apps, live search,
 * alphabetical order with letter headers, category chips.
 */
export function AppDrawer() {
  const d = useDict();
  const launchApp = useShell((s) => s.launchApp);
  const closeDrawer = useShell((s) => s.closeDrawer);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AppCategory | "all">("all");

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APP_IDS.filter((id) => {
      if (category !== "all" && APPS[id].category !== category) return false;
      if (q && !d.apps[id].toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => d.apps[a].localeCompare(d.apps[b]));
  }, [query, category, d]);

  const sections = useMemo(() => {
    if (category !== "all" || query.trim()) return [{ letter: null, ids: sorted }];
    const out: { letter: string | null; ids: typeof sorted }[] = [];
    for (const id of sorted) {
      const letter = d.apps[id][0].toUpperCase();
      const last = out[out.length - 1];
      if (last && last.letter === letter) last.ids.push(id);
      else out.push({ letter, ids: [id] });
    }
    return out;
  }, [sorted, category, query, d]);

  const chips: (AppCategory | "all")[] = ["all", ...APP_CATEGORIES];

  return (
    <motion.div
      className="absolute inset-0 z-[45] flex flex-col bg-background/45 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-label={d.drawer.search}
    >
      {/* close handle */}
      <div className="flex shrink-0 justify-center pt-2">
        <button
          type="button"
          onClick={closeDrawer}
          aria-label={d.drawer.close}
          className="flex h-8 w-24 cursor-pointer items-start justify-center rounded-full"
        >
          <span className="h-1 w-10 rounded-full bg-fg/40" />
        </button>
      </div>

      {/* search */}
      <div className="shrink-0 px-5 pt-1">
        <div className="flex items-center gap-2.5 rounded-full bg-surface px-4 py-2.5 ring-1 ring-line backdrop-blur-xl focus-within:ring-primary/60">
          <Search className="size-4 shrink-0 text-muted" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeDrawer();
              if (e.key === "Enter" && sorted[0]) launchApp(sorted[0]);
            }}
            placeholder={d.drawer.search}
            aria-label={d.drawer.search}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted select-text"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={d.os.closeHint}
              className="cursor-pointer text-muted hover:text-fg"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* category chips */}
      <div className="flex shrink-0 gap-2 px-5 py-3">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
              category === c
                ? "bg-primary text-primary-fg"
                : "bg-surface text-muted ring-1 ring-line hover:text-fg",
            )}
          >
            {c === "all" ? d.drawer.all : d.categories[c]}
          </button>
        ))}
      </div>

      {/* app list */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-14">
        {sorted.length === 0 && (
          <p className="pt-16 text-center text-sm text-muted">{d.drawer.empty}</p>
        )}
        {sections.map((section, si) => (
          <section key={section.letter ?? `s-${si}`}>
            {section.letter && (
              <h3 className="px-2 pb-2 pt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                {section.letter}
              </h3>
            )}
            <div className="grid grid-cols-4 gap-x-1 gap-y-4">
              {section.ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => launchApp(id)}
                  aria-label={d.apps[id]}
                  className="grid cursor-pointer place-items-center rounded-2xl py-1 transition-transform active:scale-90"
                >
                  <AppIcon appId={id} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
}
