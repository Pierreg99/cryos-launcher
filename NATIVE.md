# cryOS as a native app (Capacitor / Android)

The whole cryOS session — Crydroid phone launcher and, on tablets/foldables
in wide mode, the CryLinux desktop — ships as **one installable Android
app**. This is the native build that the original brief kept out of scope
until explicitly released; it is now released and scaffolded.

> Status in this workspace: the Capacitor project is complete and synced
> (`android/`, appId `os.cryos.crydroid`, app name `cryOS`, branded icons
> and splashes generated). **No APK was compiled here** — this sandbox has
> no JDK/Android SDK. Compile on your machine or CI as described below.

## Prerequisites (your machine / CI)

- Node.js ≥ 20 (Capacitor 7 line; Capacitor 8 would need Node ≥ 22)
- JDK 21
- Android SDK Platform 35 + build-tools (Android Studio Koala or newer is
  the easiest route), `ANDROID_HOME` set
- A device/emulator with Android 6.0+ (minSdk 23)

## Build & run

```bash
npm install
npm run build:app        # static export (out/) + cap sync android
npm run open:android     # opens Android Studio → Run ▶
```

Headless (CLI only):

```bash
cd android
./gradlew assembleDebug                     # APK at android/app/build/outputs/apk/debug/
./gradlew installDebug                      # straight onto a connected device
./gradlew bundleRelease && jarsigner …      # or set up signing in build.gradle for an AAB
```

Every web change → re-run `npm run build:app` (re-export + re-sync), then
rebuild in Gradle. `npm run dev` is unaffected (Capacitor never touches
dev mode; the service worker also stays off in dev).

## What is wired natively

| Concern | Behaviour |
|---|---|
| Hardware/gesture **back** | Runs the exact session back-chain (`src/lib/navigation.ts`): folder → shade → drawer → recents → open app → app menu → CryCenter → front-most desktop window. Nothing left to close → the app **minimizes** instead of exiting. |
| **Status bar** | Style + background follow the frost theme live (dark `#050b14` / light `#edf2f8`); toggling dark mode in the shade/CryCenter/Settings restyles it instantly. |
| **Splash** | Native splash is a 300 ms frost-night hex-mark handoff into the web boot sequence (the real, skippable boot). |
| **Icons** | Legacy + adaptive launcher icons and portrait/landscape splashes in all densities, generated from `public/icon.svg` via `@capacitor/assets` (sources in `assets/`). |
| **Safe areas** | The UI already pads with `env(safe-area-inset-*)`; splash runs fullscreen/immersive. |
| **Service worker** | Registration is skipped inside the native shell (assets are local); the SW keeps powering the web/PWA deployment. |
| **Persistence** | `localStorage` inside the WebView — grid, dock, settings, ice and notes survive app restarts. |

## Regenerating branded assets

```bash
npm run build:static   # only needed if web changed
npx capacitor-assets generate --android
```

Source images live in `assets/` (`icon-only.png`, `icon-foreground.png`,
`icon-background.png`, `splash.png`, `splash-dark.png`) and were rendered
from the hex mark; replace them to reskin.

## Notes & limitations

- `android/` is committed (standard Capacitor practice); its template
  `.gitignore` keeps Gradle outputs, `local.properties` and APKs out.
- Release signing is intentionally not configured (no keystore belongs in
  a repo) — add `signingConfigs` to `android/app/build.gradle` or use
  Play App Signing.
- iOS: the same project supports `npx cap add ios` on a macOS machine with
  Xcode; nothing here is Android-only except the platform folder itself.
  (Out of the approved scope for now.)
- No native plugins beyond app/status-bar/splash-screen are used; there
  is no native code to maintain — the law stays in the web layer.
