import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Pre-paint theme script — prevents FOUC.
 * Reads the mirrored theme key written by useThemeSync() and applies the
 * `dark` class before first paint. Default is dark (frost OS).
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("crydroid-theme");if(t!=="light"&&t!=="dark"){t="dark";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`;

export const metadata: Metadata = {
  title: "cryOS — Crydroid Launcher",
  description:
    "Fully virtualized cryOS preview. One law, many ices. Crydroid phone launcher simulation.",
  applicationName: "cryOS",
  keywords: ["cryOS", "Crydroid", "launcher", "simulation", "virtualized"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050b14" },
    { media: "(prefers-color-scheme: light)", color: "#edf2f8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-background font-display text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
