// Browser-safe option data for the 3D ring personaliser (no three.js imports here).
export type Metal3D = { label: string; color: string; metalness: number; roughness: number };

// Physically-based metal colours (approximate real base reflectance).
export const METALS_3D: Record<string, Metal3D> = {
  "yellow-gold": { label: "Yellow Gold", color: "#e8c574", metalness: 1, roughness: 0.06 },
  "rose-gold": { label: "Rose Gold", color: "#f0b8a0", metalness: 1, roughness: 0.06 },
  "white-gold": { label: "White Gold", color: "#efece6", metalness: 1, roughness: 0.05 },
  platinum: { label: "Platinum", color: "#e3e4e6", metalness: 1, roughness: 0.06 },
  silver: { label: "Silver", color: "#f7f7f7", metalness: 1, roughness: 0.04 },
  titanium: { label: "Titanium", color: "#b3b1ab", metalness: 1, roughness: 0.22 },
  tantalum: { label: "Tantalum", color: "#7d8290", metalness: 1, roughness: 0.2 },
  zirconium: { label: "Black Zirconium", color: "#333336", metalness: 0.9, roughness: 0.25 },
  "grey-zirconium": { label: "Grey Zirconium", color: "#8e8f93", metalness: 1, roughness: 0.2 },
};

export const WIDTHS_MM = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];

export const FINISH_ROUGHNESS: Record<string, number> = {
  Polished: 0,
  Satin: 0.22,
  Brushed: 0.32,
  Matte: 0.45,
};

export type RingPattern = "plain" | "greek-key";

/** Verified visual layout for IN1004; photo category keys are not metal-zone data. */
/** Cross-section profile shown in each style's Infinity photo (confirmed by the store). */
const STYLE_PROFILES: Record<string, string> = { as2: "Bevelled" };

export function ringDesignDefaults(ringId: string, photoMetal: string) {
  const centreMetal = photoMetal === "gold" ? "yellow-gold"
    : Object.hasOwn(METALS_3D, photoMetal) ? photoMetal : "platinum";
  return {
    centreMetal,
    sideMetal: ringId === "in1004" ? "white-gold" : "yellow-gold",
    twoTone: ringId === "in1004",
    profile: STYLE_PROFILES[ringId] ?? "Court",
    pattern: (ringId === "in1004" ? "greek-key" : "plain") as RingPattern,
  };
}

/** Approximate inner diameter (mm) for Australian/UK letter sizes. */
export function innerDiameterMm(size: string, sizes: string[]): number {
  const i = Math.max(0, sizes.indexOf(size));
  return 15.6 + i * 0.4;
}
