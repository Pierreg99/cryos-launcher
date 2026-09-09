/**
 * Doctrine content for the CryBel / Family / Manifest / DNA apps.
 * Distilled from the cryOS reference (Pierreg99/cryOS). English only —
 * doctrine text stays frozen in both locales, per the law.
 */

export type DoctrineSection =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; cols: [string, string, string]; rows: [string, string, string][] }
  | { kind: "quote"; text: string };

export type DoctrinePage = {
  tagline: string;
  sections: DoctrineSection[];
};

export const DOCTRINE: Record<"bible" | "family" | "manifest" | "dna", DoctrinePage> = {
  bible: {
    tagline: "Naming bible + cryform",
    sections: [
      { kind: "quote", text: "CryBel names stay frozen in both languages." },
      {
        kind: "list",
        items: [
          "cryOS — lowercase product, uppercase OS",
          "Ice-names — CryArch, CryLinux, Crynux, Crydroid, Crywlen, CryBel, CrySys",
          "Thaw-names — crybuntu, crybian",
          "Cey- lattice — CeyLan / CryoLan",
          "Source words — crawlen stays in the bible, never on a box",
        ],
      },
      { kind: "p", text: "CrySys (grok-cryosys) is the authoring doctrine. CryBel is the naming bible. cryOS is what boots." },
    ],
  },
  family: {
    tagline: "Multi-distribution tree",
    sections: [
      {
        kind: "table",
        cols: ["Name", "Form", "Base"],
        rows: [
          ["cryOS", "umbrella", "the law"],
          ["Crydroid", "phone", "Android lineage"],
          ["CryLinux", "GNU", "metadistribution"],
          ["CryArch", "desktop", "Arch, rolling frost"],
          ["crybuntu", "desktop", "Ubuntu, friendly thaw"],
          ["crybian", "desktop", "Debian, permafrost"],
          ["Crynux", "desktop", "Nix, declarative freeze"],
          ["Crywlen", "fabric", "crawler"],
          ["CeyLan / CryoLan", "fabric", "language / runtime"],
        ],
      },
      { kind: "p", text: "Switch ice from CryCenter or Settings. The law does not change." },
    ],
  },
  manifest: {
    tagline: "The session contract",
    sections: [
      { kind: "quote", text: "The live app is not a marketing page. It is a session." },
      {
        kind: "list",
        items: [
          "Boot — hex mark, ice name, the law. Skip after the first beat, or wait.",
          "Lock — Super Wallpaper. Time. Date. Weather. Swipe up or tap to thaw.",
          "Crydroid — phone: launcher, full-screen activities, gesture home, recents.",
          "No emoji. Distill, do not clone. English and German.",
        ],
      },
    ],
  },
  dna: {
    tagline: "Source weather",
    sections: [
      {
        kind: "p",
        text: "MIUI, HyperOS, HarmonyOS 2, ColorOS, OxygenOS are source weather. Take the law. Leave the costume.",
      },
      {
        kind: "list",
        items: [
          "One launcher surface, one gesture grammar, many ices.",
          "Frost is a material, not a skin: depth, clarity, quiet motion.",
          "Everything virtualized — a session in the browser, never a sticker on a website.",
        ],
      },
    ],
  },
};
