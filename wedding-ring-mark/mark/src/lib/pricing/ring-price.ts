// Pure, browser-safe pricing helpers: validation, supplier URL building and response parsing.
// Indicative supplier RRP only — never a binding quote; prices include GST (user confirmed).
import { SIGNATURE_SKU_OPTIONS, SKU_OPTIONS, SUPPLIER_SIZES } from "./sku-options";

const ALL_SKU_OPTIONS: Record<string, import("./sku-options").SkuOptions> = { ...SKU_OPTIONS, ...SIGNATURE_SKU_OPTIONS };

export type PriceConfig = {
  sku: string;
  size: string;
  width: number;
  thickness: number;
  centreMaterial: string;
  sideMaterial: string;
  /** Stone type for diamond-set styles; defaults to the supplier default. */
  stoneType?: string;
  /** Stone diameter in mm, where the style offers a choice. */
  stoneSize?: number;
};

/** Stone layout per diamond SKU (from Infinity's list API). Sizes in mm. */
export const STONE_SPECS: Record<string, { count: number; cut: string; sizes: number[]; defaultSize: number }> = {
  IN1915D: { count: 50, cut: "Brilliant", sizes: [1.3], defaultSize: 1.3 },
  IN6004D: { count: 6, cut: "Brilliant", sizes: [1.5, 1.7, 1.9, 2.3, 2.6, 2.9], defaultSize: 1.7 },
  IN6010D: { count: 33, cut: "Brilliant", sizes: [1.9], defaultSize: 1.9 },
};

/** Approximate per-stone carat for a round brilliant of this diameter (standard chart;
 *  Infinity publishes no table). The supplier prices by carat. */
const CARAT_BY_MM: Record<string, number> = { "1.3": 0.01, "1.5": 0.01, "1.7": 0.02, "1.9": 0.025, "2.3": 0.05, "2.6": 0.07, "2.9": 0.1 };
export function stoneCarat(sku: string, sizeMm: number): number {
  const fixed = skuOptions(sku)?.stone;
  if (fixed && fixed.size === sizeMm) return fixed.carat;
  return CARAT_BY_MM[String(sizeMm)] ?? fixed?.carat ?? 0.01;
}

/** Our ring id → supplier base SKU. Classics map to letter codes; signature ids are the lowercase SKU. */
export const PRICED_SKUS: Record<string, string> = {
  ab2: "AB",
  ac6: "AC",
  ad7: "AD",
  ag2: "AG",
  ah2: "AH",
  ak1: "AK",
  as2: "AS",
  ea: "EA",
  fb6: "FB",
  ...Object.fromEntries(Object.keys(SIGNATURE_SKU_OPTIONS).map((sku) => [sku.toLowerCase().replace(/d$/, ""), sku])),
};

/** Supplier SKU for the Flat profile, where Infinity lists one. */
export const FLAT_VARIANTS: Record<string, string> = {
  AB: "AB-Flat",
  AC: "AC-Flat",
  AD: "AD-Flat",
  AG: "AG-Flat",
  AH: "AH-Flat",
  AK: "AK-Flat",
  AS: "AS-Flat",
  EA: "EA-Flat",
};

/** Supplier only prices Court (base SKU) and Flat (-Flat); other profiles are not listed.
 *  Signature IN#### styles have a fixed profile, so they price as their own SKU regardless. */
export function priceSkuFor(sku: string, profile: string): string | null {
  if (sku.startsWith("IN")) return sku;
  if (profile === "Flat") return FLAT_VARIANTS[sku] ?? null;
  if (profile === "Court") return sku;
  return null;
}

export const SUPPLIER_STORE_ID = "461"; // Public configurator default — NOT a verified Burrows store ID.
export const SUPPLIER_ENDPOINT = `https://www.infinityorders.com.au/api/v1/pricePublic/${SUPPLIER_STORE_ID}`;

export function skuOptions(sku: string) {
  return ALL_SKU_OPTIONS[sku] ?? null;
}

/** Supplier thickness range at this width, if listed. */
export function thicknessRange(sku: string, width: number): { min: number; max: number } | null {
  const l = skuOptions(sku)?.thicknessLimits.find((x) => x.width === width);
  return l ? { min: l.min, max: l.max } : null;
}

/** True when the band the 3D personaliser shows can be priced at this width. */
export function thicknessAvailable(sku: string, width: number, thickness: number): boolean {
  const o = skuOptions(sku);
  if (!o || !o.widths.includes(width)) return false;
  const limit = o.thicknessLimits.find((l) => l.width === width);
  return !!limit && thickness >= limit.min && thickness <= limit.max;
}

export function validatePriceConfig(value: unknown): PriceConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a configuration object");
  const o = value as Record<string, unknown>;
  const allowed = ["sku", "size", "width", "thickness", "centreMaterial", "sideMaterial", "stoneType", "stoneSize"];
  if (Object.keys(o).some((k) => !allowed.includes(k))) throw new Error("Unexpected configuration field");
  const sku = o["sku"];
  if (typeof sku !== "string" || !ALL_SKU_OPTIONS[sku]) throw new Error("Unsupported SKU");
  const opts = ALL_SKU_OPTIONS[sku];
  const size = o["size"], width = o["width"], thickness = o["thickness"];
  const centreMaterial = o["centreMaterial"], sideMaterial = o["sideMaterial"];
  if (typeof size !== "string" || (size !== "--" && !SUPPLIER_SIZES.includes(size))) throw new Error("Invalid size");
  if (typeof width !== "number" || !opts.widths.includes(width)) throw new Error("Invalid width");
  if (typeof thickness !== "number" || !Number.isFinite(thickness)) throw new Error("Invalid thickness");
  const limit = opts.thicknessLimits.find((l) => l.width === width);
  if (!limit || thickness < limit.min || thickness > limit.max) throw new Error("Thickness not available at this width");
  if (typeof centreMaterial !== "string" || !opts.materials.includes(centreMaterial)) throw new Error("Invalid centre material");
  if (typeof sideMaterial !== "string" || !opts.materials.includes(sideMaterial)) throw new Error("Invalid side material");
  const stoneType = o["stoneType"];
  if (stoneType !== undefined) {
    if (typeof stoneType !== "string" || !opts.stone?.types.includes(stoneType)) throw new Error("Invalid stone");
    const stoneSize = o["stoneSize"];
    if (stoneSize !== undefined) {
      if (typeof stoneSize !== "number" || !STONE_SPECS[sku]?.sizes.includes(stoneSize)) throw new Error("Invalid stone size");
      return { sku, size, width, thickness, centreMaterial, sideMaterial, stoneType, stoneSize };
    }
    return { sku, size, width, thickness, centreMaterial, sideMaterial, stoneType };
  }
  return { sku, size, width, thickness, centreMaterial, sideMaterial };
}

export function buildSupplierUrl(c: PriceConfig): string {
  const p = new URLSearchParams();
  p.set("SKU", c.sku);
  p.set("size", c.size);
  p.set("fingerSize", c.size);
  p.set("width", String(c.width));
  p.set("thickness", String(c.thickness));
  // Zone 1 = centre metal, zone 2 = side metal; both carry the exact supplier label.
  p.set("metalZones[0][id]", "1");
  p.set("metalZones[0][material]", c.centreMaterial);
  p.set("metalZones[1][id]", "2");
  p.set("metalZones[1][material]", c.sideMaterial);
  const stone = skuOptions(c.sku)?.stone;
  if (stone) {
    p.set("stoneGroups[0][name]", stone.name);
    p.set("stoneGroups[0][stone]", c.stoneType ?? stone.type);
    const mm = c.stoneSize ?? stone.size;
    p.set("stoneGroups[0][size]", String(mm));
    p.set("stoneGroups[0][stoneCarat]", String(stoneCarat(c.sku, mm)));
  }
  p.set("additionalData[store_id]", SUPPLIER_STORE_ID);
  return `${SUPPLIER_ENDPOINT}?${p.toString()}`;
}

export function parseSupplierPrice(body: unknown): number {
  const price = body && typeof body === "object" ? (body as Record<string, unknown>)["price"] : undefined;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) throw new Error("Invalid supplier price");
  return price;
}

/** Union of metal grades the supplier lists across the priced range. */
export const SUPPLIER_MATERIALS: string[] = [
  ...new Set(Object.values(ALL_SKU_OPTIONS).flatMap((o) => o.materials)),
].sort();

/** Default supplier grade for each designer metal colour (customer can change it). */
export const DEFAULT_GRADE: Record<string, string> = {
  "yellow-gold": "Yellow Gold 9ct",
  "rose-gold": "Rose Gold 9ct",
  "white-gold": "White Gold 9ct",
  platinum: "Platinum 950",
  silver: "Sterling Silver 925",
  titanium: "Titanium",
  tantalum: "Tantalum",
  zirconium: "Zirconium Black",
  "grey-zirconium": "Zirconium Grey",
};

export const GRADES_FOR_METAL: Record<string, string[]> = Object.fromEntries(
  Object.entries(DEFAULT_GRADE).map(([metal, def]) => {
    const family = def.replace(/ \d+ct$| \d+$/, "");
    const list = SUPPLIER_MATERIALS.filter((m) =>
      metal === "zirconium" || metal === "grey-zirconium" ? m === def : metal === "platinum" ? m.startsWith("Platinum") || m.startsWith("Palladium") : m.startsWith(family));
    const ct = (m: string) => Number(m.match(/(\d+)ct$/)?.[1] ?? 0);
    return [metal, [...list].sort((a, b) => ct(a) - ct(b) || a.localeCompare(b))];
  }),
);
