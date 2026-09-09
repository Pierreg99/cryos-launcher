# Expansion Plan — cryOS after phase 4

State of play: phone launcher (modules 1–6), CryLinux desktop (phase 2),
snap + CryCenter + offline PWA (phase 3), Capacitor native project
(phase 4), GitHub Pages deployment. Everything below is **planned, not
built** — each phase needs its own go-ahead per the stop rules.

## Phase 5 — Release engineering (recommended next)

| Item | What | Effort |
|---|---|---|
| CI: web deploy | GitHub Actions: on push to `main` → `build:pages` → upload-pages-artifact → Pages (replaces manual gh-pages pushes) | S |
| CI: APK artifacts | Actions job with JDK 21 + SDK 35: `gradlew assembleDebug` on tags, upload APK artifact; optional signed release via repository-secret keystore | M |
| Lighthouse CI | budget assertions (perf ≥ 90, a11y ≥ 95) on every PR — closes the unverified-Lighthouse gap with real numbers | S |
| Smoke in CI | `npm run typecheck && npm run smoke && npm run build` as required check | S |

## Phase 6 — Interaction polish pack

- Snap keyboard shortcuts (Super+Arrow grammar) + maximize-button layouts
  flyout (Windows 11-style quadrant picker)
- Per-ice wallpapers + accent-aware wallpaper tinting (aurora in thaw-orange
  for crybuntu, permafrost pale for crybian …)
- Desktop right-click context menu (wallpaper / refresh /Settings / lock)
- Folder rename UI (name field is already persisted in the store)
- Multiple home pages with horizontal swipe + page-dots
- Back-arrow visual preview during edge swipe (Android 13 grammar)
- Keyboard navigation pass (focus rings, arrow-key grid traversal)

## Phase 7 — World building (feature-creep items, now scoped)

- **CryMarket** — app-store mock: curated list, install/uninstall flow that
  actually mutates the drawer + home grid (persisted), update badges
- Widget system — user-placeable clock/weather/word-of-cycle widgets in the
  home grid slot model (store already models slots)
- Live-wallpaper shader — WebGL frost/aurora layer behind the CSS engine
  (toggleable, battery-friendly fallback)
- CryCenter on phone as split mode (control center ⇄ notifications pages)

## Phase 8 — Platform reach

- iOS: `npx cap add ios` on macOS + Xcode (web layer is ready; needs an Apple
  dev environment, safe-area audit pass)
- Desktop PWA install prompts (beforeinstallpick UX) + window-controls-overlay
  display mode for installed desktop windows
- Play Store listing prep: signed AAB, data-safety sheet (all data local),
  screenshots from the phone frame mode

## Standing exclusions (per original brief)

Real backends (weather API, real notifications), multi-user/auth — these
stay out unless a separate prompt releases them. The law does not change:
no emoji, EN/DE, CryBel names frozen, distill — do not clone.

## Suggested order

5 → 6 → 7 → 8. Phase 5 first because CI turns every later phase into a
push instead of a manual ritual, and finally produces the Lighthouse
numbers the acceptance criteria asked for.
