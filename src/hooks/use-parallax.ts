import { useEffect, type RefObject } from "react";

/**
 * Pointer-driven wallpaper parallax. Writes unitless --px/--py (-1..1)
 * CSS variables on `targetRef` (the wallpaper root); layers multiply by
 * their own --depth in CSS. rAF-lerped, zero React re-renders → 60 fps.
 */
export function useParallax(
  sourceRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const src = sourceRef.current;
    const tgt = targetRef.current;
    if (!src || !tgt || !enabled) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let active = false;

    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      tgt.style.setProperty("--px", cx.toFixed(3));
      tgt.style.setProperty("--py", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
        raf = requestAnimationFrame(loop);
      } else {
        active = false;
      }
    };

    const kick = () => {
      if (!active) {
        active = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = src.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      kick();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };

    src.addEventListener("pointermove", onMove, { passive: true });
    src.addEventListener("pointerleave", onLeave);
    return () => {
      src.removeEventListener("pointermove", onMove);
      src.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      tgt.style.setProperty("--px", "0");
      tgt.style.setProperty("--py", "0");
    };
  }, [sourceRef, targetRef, enabled]);
}
