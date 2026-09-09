import type { NextConfig } from "next";

/**
 * Two build modes:
 *  - default:            server build (`next build` + `next start`)
 *  - NEXT_STATIC_EXPORT: full static export to `out/` for Capacitor /
 *                        any static host (`npm run build:static`)
 */
const staticExport = process.env.NEXT_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(staticExport
    ? { output: "export" as const, images: { unoptimized: true }, trailingSlash: false }
    : {}),
};

export default nextConfig;
