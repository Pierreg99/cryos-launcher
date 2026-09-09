import type { NextConfig } from "next";

/**
 * Two build modes:
 *  - default:            server build (`next build` + `next start`)
 *  - NEXT_STATIC_EXPORT: full static export to `out/` for Capacitor /
 *                        any static host (`npm run build:static`)
 */
const staticExport = process.env.NEXT_STATIC_EXPORT === "1";
/** Sub-path hosting (GitHub Pages: /cryos-launcher). Empty = domain root. */
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(basePath ? { basePath } : {}),
  ...(staticExport
    ? { output: "export" as const, images: { unoptimized: true }, trailingSlash: false }
    : {}),
};

export default nextConfig;
