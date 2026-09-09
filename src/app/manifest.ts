import type { MetadataRoute } from "next";

// required for `output: "export"` (Capacitor/static hosting)
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "cryOS — Crydroid Launcher",
    short_name: "cryOS",
    description:
      "Fully virtualized cryOS preview. One law, many ices. Crydroid phone launcher simulation — boot, lock, home, gestures, shade, drawer.",
    start_url: "./", // relative: works at domain root, GitHub Pages sub-path and inside Capacitor
    display: "standalone",
    orientation: "portrait",
    background_color: "#050b14",
    theme_color: "#050b14",
    icons: [
      {
        src: "./icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
