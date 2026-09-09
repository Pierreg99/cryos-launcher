/**
 * CryBel — the naming bible (distro registry).
 * Names stay frozen in both locales. Distilled from the cryOS reference.
 */

export type IceSlug = "crydroid" | "cryarch" | "crybuntu" | "crybian" | "crynux";
export type IceKind = "phone" | "desktop";
export type MarkSlug = "cryos" | IceSlug;

export type Distro = {
  slug: IceSlug;
  /** Frozen name — never translated. */
  name: string;
  kind: IceKind;
  /** Frozen base tagline (EN, doctrine). */
  base: string;
  /** Per-ice accent ("same law, different chrome"), readable in both themes. */
  accent: string;
};

export const DISTROS: Record<IceSlug, Distro> = {
  crydroid: {
    slug: "crydroid",
    name: "Crydroid",
    kind: "phone",
    base: "Android lineage",
    accent: "#7cc4ff",
  },
  cryarch: {
    slug: "cryarch",
    name: "CryArch",
    kind: "desktop",
    base: "Arch, rolling frost",
    accent: "#58b0ee",
  },
  crybuntu: {
    slug: "crybuntu",
    name: "crybuntu",
    kind: "desktop",
    base: "Ubuntu, friendly thaw",
    accent: "#e8a04c",
  },
  crybian: {
    slug: "crybian",
    name: "crybian",
    kind: "desktop",
    base: "Debian, permafrost",
    accent: "#9db4d6",
  },
  crynux: {
    slug: "crynux",
    name: "Crynux",
    kind: "desktop",
    base: "Nix, declarative freeze",
    accent: "#57c9ad",
  },
};

/** Reference alias. */
export const DISTRO_BY_SLUG = DISTROS;

export const ICE_SLUGS: IceSlug[] = ["crydroid", "cryarch", "crybuntu", "crybian", "crynux"];

export const DESKTOP_ICES: IceSlug[] = ICE_SLUGS.filter((s) => DISTROS[s].kind === "desktop");

/** Boot shows the cryOS mark for the phone ice (reference behaviour). */
export function markSlugFor(ice: IceSlug): MarkSlug {
  return ice === "crydroid" ? "cryos" : ice;
}
