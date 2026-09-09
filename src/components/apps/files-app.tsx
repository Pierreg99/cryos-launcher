"use client";

import { useState } from "react";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { useDict } from "@/i18n";
import { cn } from "@/lib/utils";

type Entry = { name: string; size: string };
type Tree = { name: string; entries: Entry[] };

const TREE: Tree[] = [
  {
    name: "Doctrine",
    entries: [
      { name: "manifest.md", size: "4 KB" },
      { name: "dna.md", size: "3 KB" },
      { name: "creed.txt", size: "1 KB" },
    ],
  },
  {
    name: "Ices",
    entries: [
      { name: "crydroid.ice", size: "12 KB" },
      { name: "cryarch.ice", size: "11 KB" },
      { name: "crybuntu.ice", size: "11 KB" },
      { name: "crybian.ice", size: "10 KB" },
      { name: "crynux.ice", size: "9 KB" },
    ],
  },
  {
    name: "CryPaper",
    entries: [
      { name: "notes-01.cpw", size: "2 KB" },
      { name: "super-wallpaper.cpw", size: "8 KB" },
    ],
  },
  {
    name: "System",
    entries: [
      { name: "boot.cfg", size: "1 KB" },
      { name: "radios.cfg", size: "1 KB" },
    ],
  },
];

const TOTAL = TREE.reduce((n, f) => n + f.entries.length, 0);

/** Files — CryIndex walker (read-only mock tree). */
export function FilesApp() {
  const d = useDict();
  const [open, setOpen] = useState<string[]>(["Doctrine"]);
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = (name: string) =>
    setOpen((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <div className="flex h-full flex-col px-3 py-3">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {TREE.map((folder) => {
          const isOpen = open.includes(folder.name);
          return (
            <div key={folder.name} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(folder.name)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-surface-2"
                aria-expanded={isOpen}
              >
                <ChevronRight
                  className={cn(
                    "size-4 text-muted transition-transform duration-200",
                    isOpen && "rotate-90",
                  )}
                />
                <Folder className="size-4 text-primary" strokeWidth={1.75} />
                <span className="text-[13px] font-semibold">{folder.name}</span>
                <span className="ml-auto font-mono text-[10px] text-muted">
                  {folder.entries.length}
                </span>
              </button>
              {isOpen && (
                <div className="ml-6 border-l border-line pl-2">
                  {folder.entries.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      onClick={() => setSelected(entry.name)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-2",
                        selected === entry.name && "bg-primary/12 ring-1 ring-primary/40",
                      )}
                    >
                      <FileText className="size-3.5 text-muted" strokeWidth={1.75} />
                      <span className="font-mono text-xs">{entry.name}</span>
                      <span className="ml-auto font-mono text-[10px] text-muted">{entry.size}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="shrink-0 border-t border-line pt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {d.filesApp.footer} · {TOTAL} {d.filesApp.entries}
      </p>
    </div>
  );
}
