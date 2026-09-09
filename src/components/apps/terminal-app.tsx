"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CornerDownLeft } from "lucide-react";
import { useDict } from "@/i18n";
import { CYCLE_WORDS } from "@/lib/live";

type Line = { kind: "in" | "out" | "err"; text: string };

const CRYFORM: Record<string, string> = {
  crawlen: "CeyLan",
  ubuntu: "crybuntu",
  debian: "crybian",
  arch: "CryArch",
  nix: "Crynux",
  android: "Crydroid",
  linux: "CryLinux",
  os: "cryOS",
};

const ICES = [
  "cryOS      umbrella   the law",
  "Crydroid   phone      Android lineage",
  "CryLinux   GNU        metadistribution",
  "CryArch    desktop    Arch, rolling frost",
  "crybuntu   desktop    Ubuntu, friendly thaw",
  "crybian    desktop    Debian, permafrost",
  "Crynux     desktop    Nix, declarative freeze",
];

const CREED = [
  "No emoji. Distill, do not clone.",
  "One law, many ices.",
  "Take the law. Leave the costume.",
  "Names stay frozen in both languages.",
  "Not a website with a dock sticker — a session.",
];

/** CryoLan — terminal mock: help, ices, creed, cryform, cycle, clear, about. */
export function TerminalApp() {
  const d = useDict();
  const [lines, setLines] = useState<Line[]>(() =>
    d.terminalApp.banner.map((text) => ({ kind: "out" as const, text })),
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const raw = input.trim();
    setInput("");
    if (!raw) return;
    const [cmd, ...rest] = raw.split(/\s+/);
    const arg = rest.join(" ");
    const next: Line[] = [{ kind: "in", text: raw }];

    switch (cmd?.toLowerCase()) {
      case "help":
        next.push({
          kind: "out",
          text: "commands: help, ices, creed, cryform <word>, cycle, about, clear",
        });
        break;
      case "ices":
        ICES.forEach((text) => next.push({ kind: "out", text }));
        break;
      case "creed":
        CREED.forEach((text) => next.push({ kind: "out", text }));
        break;
      case "cycle":
        CYCLE_WORDS.forEach((text) => next.push({ kind: "out", text }));
        break;
      case "cryform": {
        const word = arg.toLowerCase();
        if (!word) next.push({ kind: "err", text: "cryform: missing word (try `cryform crawlen`)" });
        else
          next.push({
            kind: "out",
            text: `${arg} → ${CRYFORM[word] ?? `cry${arg.replace(/^cry/i, "")}`}`,
          });
        break;
      }
      case "about":
        next.push({ kind: "out", text: "CryoLan 1.0 — fabric runtime of cryOS. Fully mocked." });
        break;
      case "clear":
        setLines([]);
        return;
      default:
        next.push({
          kind: "err",
          text: `${d.terminalApp.unknown}: ${cmd} (${d.terminalApp.tryHelp})`,
        });
    }
    setLines((prev) => [...prev, ...next].slice(-120));
  }

  return (
    <div className="flex h-full flex-col bg-[#070d16] font-mono text-[12px] leading-relaxed text-[#c9e4ff] dark:bg-transparent">
      <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {lines.map((line, i) => (
          <p
            key={i}
            className={
              line.kind === "in"
                ? "text-[#7cc4ff]"
                : line.kind === "err"
                  ? "text-[#ff9d7c]"
                  : "whitespace-pre-wrap text-[#c9e4ff]"
            }
          >
            {line.kind === "in" ? `cryolan> ${line.text}` : line.text}
          </p>
        ))}
      </div>
      <form
        onSubmit={submit}
        className="flex shrink-0 items-center gap-2 border-t border-[#1c2c44] px-4 py-3"
      >
        <span className="text-[#7cc4ff]">cryolan&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="CryoLan"
          placeholder={d.terminalApp.placeholder}
          className="w-full bg-transparent text-[#e8f4ff] caret-[#7cc4ff] outline-none placeholder:text-[#3d5a80] select-text"
        />
        <button
          type="submit"
          aria-label="Enter"
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-[#7cc4ff] transition-colors hover:bg-[#122036]"
        >
          <CornerDownLeft className="size-4" />
        </button>
      </form>
    </div>
  );
}
