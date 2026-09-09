"use client";

import { useRef } from "react";
import { useShell } from "@/store/shell";
import { useParallax } from "@/hooks/use-parallax";
import { useViewport } from "@/components/viewport-context";
import { WALLPAPER_BY_ID } from "@/lib/wallpapers";
import { cn, type CSSVars } from "@/lib/utils";

/**
 * Wallpaper engine — static CSS layers + pointer parallax (Module 3).
 * Layers are pure CSS (globals.css), no image downloads. A brightness
 * veil implements the real brightness setting.
 */
export function Wallpaper({
  variant = "session",
  className,
}: {
  variant?: "session" | "lock";
  className?: string;
}) {
  const wallpaperId = useShell((s) => s.settings.wallpaper);
  const parallaxEnabled = useShell((s) => s.settings.parallax);
  const brightness = useShell((s) => s.settings.brightness);

  const def = WALLPAPER_BY_ID[wallpaperId];
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useViewport();
  useParallax(viewportRef, rootRef, parallaxEnabled && variant === "session");

  const veil = brightness < 100 ? (100 - brightness) / 190 : 0; // max ~32 % dim

  return (
    <div
      ref={rootRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {def.layers.map((layer) => (
        <div
          key={layer.cls}
          className={cn(parallaxEnabled ? "wp-layer" : "wp-static", layer.cls)}
          style={parallaxEnabled ? ({ "--depth": layer.depth } as CSSVars) : undefined}
        />
      ))}
      {variant === "lock" && (
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/85" />
      )}
      {veil > 0 && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: veil }}
        />
      )}
    </div>
  );
}
