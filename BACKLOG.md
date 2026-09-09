# Backlog

Ideas noted during the build that exceed the current module scope
(per the stop rules: noted, not implemented).

## Done in phase 2 (after explicit go-ahead)

- [x] **CryLinux desktop mode** — second virtual device mode: taskbar/dock,
      window manager (drag / 8-way resize / min / max / close / focus),
      desktop icons, start menu, live clock widget, ice switching
      (Crydroid / CryArch / crybuntu / crybian / Crynux) with per-ice
      accent + mark glyph.

## Explicitly out of scope (need separate approval)

- [ ] Real backend connections (weather API, real notifications).
- [ ] Native Android build (Capacitor/Cordova wrapper) — mentioned, not built.
- [ ] Multi-user / auth system.

## In-scope extensions (feature creep, deferred)

- [ ] CryCenter split panel on desktop (control center + notifications).
- [ ] Window snapping / tiling (half-screen edges, corner quadrants).
- [ ] Multiple windows per app (currently single instance, Android-style).
- [ ] Per-ice wallpapers + accent-aware wallpaper tinting.
- [ ] Desktop right-click context menu (wallpaper, refresh, settings).
- [ ] Service worker for full offline PWA caching (manifest exists).
- [ ] Multiple home pages with horizontal swipe + wallpaper page-parallax.
- [ ] User-configurable widget system (currently one fixed widget slot).
- [ ] Live-wallpaper shader (WebGL frost/aurora).
- [ ] Folder rename UI (folder names are stored, default label shown).
- [ ] Drag from app drawer onto the home grid.
- [ ] Android-style back-arrow visual preview during edge swipe.
- [ ] Haptics beyond `navigator.vibrate(8)` (pattern feedback per gesture).
- [ ] App Store mock ("CryMarket").
- [ ] CryCenter split panel (notifications vs. control center), per reference.
- [ ] Battery charging state + battery-saver tile.
- [ ] Lock-screen shortcuts (camera/torch mock) and notification preview on lock.
- [ ] Landscape orientation support inside the phone frame.
- [ ] iOS Safari verification pass (edge gestures vs. system gestures,
      100dvh chrome behaviour) — blocker-report candidate if issues appear.
- [ ] Lighthouse CI run (sandbox has no Chrome; build is static, JS ≈ 169 kB
      First Load, no external resources — score ≥ 90 expected but unverified).
- [ ] Keyboard navigation pass (focus rings, arrow-key grid traversal).

## Noted during review

- [ ] Recents card content is a stylized "frozen snapshot", not a real DOM
      snapshot of the app (cost-conscious choice).
- [ ] `user-scalable: false` for app feel — revisit for accessibility.
