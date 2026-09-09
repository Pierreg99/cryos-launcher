"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";
import { cn, type CSSVars } from "@/lib/utils";
import { DistroMark } from "@/components/distro-mark";
import { DISTROS, markSlugFor } from "@/lib/crybel";

/**
 * Module 1 — Boot sequence: hex mark, ice name, the law, loading bar.
 * Duration is configurable (settings.bootMs); skippable via tap after the
 * first beat (420 ms), mirroring the reference boot-screen.
 */
export function BootScreen() {
  const d = useDict();
  const toLock = useShell((s) => s.toLock);
  const bootMs = useShell((s) => s.settings.bootMs);
  const ice = useShell((s) => s.settings.ice);
  const [ready, setReady] = useState(false);
  const locked = useRef(false);

  useEffect(() => {
    locked.current = false;
    const beat = window.setTimeout(() => setReady(true), 420);
    const done = window.setTimeout(() => {
      locked.current = true;
      toLock();
    }, bootMs);
    return () => {
      window.clearTimeout(beat);
      window.clearTimeout(done);
    };
  }, [bootMs, toLock]);

  const skip = () => {
    if (ready && !locked.current) {
      locked.current = true;
      toLock();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-[90] flex cursor-pointer flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      onClick={skip}
      role="button"
      tabIndex={0}
      aria-label={d.os.skip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") skip();
      }}
    >
      <div className="flex flex-col items-center animate-fade-in">
        <DistroMark slug={markSlugFor(ice)} className="size-16 animate-hex-pulse text-primary" />
        <p className="mt-8 text-5xl font-medium tracking-tight">cryOS</p>
        <p className="mt-3 font-mono text-xs tracking-[0.18em] text-primary">
          {DISTROS[ice].name}
        </p>
        <p className="mt-6 text-xl italic text-muted">{d.boot.epigraph}</p>
      </div>

      <div className="absolute inset-x-16 bottom-20 mx-auto h-px max-w-xs overflow-hidden bg-surface-2">
        <span
          className={cn("block h-full bg-primary animate-boot-bar")}
          style={{ "--boot-dur": `${bootMs}ms` } as CSSVars}
        />
      </div>

      <p
        className={cn(
          "absolute bottom-10 font-mono text-[10px] uppercase tracking-[0.24em] text-muted transition-opacity duration-500",
          ready ? "opacity-80" : "opacity-0",
        )}
        aria-hidden={!ready}
      >
        {d.os.skip}
      </p>
    </motion.div>
  );
}
