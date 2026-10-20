// The design: what the customer has chosen, the rules that make it valid, and the views of it the page needs
// (summary rows, the price request, the share link, the cart properties). Pure functions, no React.
import { findRing, RINGS, type Ring } from "../data/rings";
import { FLAT_STYLES, RING_MODELS } from "../data/ring-models";
import { FINGER_SIZES, PROFILES } from "./ring-options";
import { FINISH_ROUGHNESS, METALS_3D, ringDesignDefaults } from "./ring-3d-options";
import { cleanEngraving, ENGRAVING_FONTS, engravingFont } from "./engraving";
import { DEFAULT_GRADE, GRADES_FOR_METAL, PRICED_SKUS, priceSkuFor, skuOptions, STONE_SPECS, thicknessAvailable, thicknessRange, type PriceConfig } from "./pricing/ring-price";

export type Design = {
  ring: string;
  twoTone: boolean;
  metal: string;
  side: string;
  grade: string;
  sideGrade: string;
  width: number;
  thickness: number;
  profile: string;
  finish: string;
  size: string;
  engraving: string;
  font: string;
  stone: string;
  stoneSize: number;
  sizer: boolean;
  date: string;
};

export const FINISHES = Object.keys(FINISH_ROUGHNESS);
export const METAL_IDS = Object.keys(METALS_3D);
export const WIDTH_MIN = 3, WIDTH_MAX = 8, WIDTH_STEP = 0.5;
export const DEFAULT_THICKNESS = 1.6;

/** Customer-facing names for the two Classic fits (internal values stay Court/Flat for supplier SKUs). */
export const FIT_LABELS: Record<string, string> = { Court: "Comfit", Flat: "Standard" };

export const STONE_COLOURS: Record<string, string> = {
  "Black Diamond": "#1c1c20",
  "Lab Grown Diamond": "#f4f8ff",
  "Natural Diamond": "#f4f8ff",
  Sapphire: "#1f4fb8",
  Ruby: "#a3132a",
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const pick = (v: string | undefined | null, list: readonly string[], d: string) => (v && list.includes(v) ? v : d);

/** A fresh design for a style, with the photo's metal and the style's own layout defaults. */
export function defaultDesign(ringId: string, keep?: Partial<Design>): Design {
  const ring = findRing(ringId) ?? RINGS[0]!;
  const d = ringDesignDefaults(ring.id, Object.keys(ring.metals)[0] ?? "");
  return {
    ring: ring.id,
    twoTone: d.twoTone,
    metal: d.centreMetal,
    side: d.sideMetal,
    grade: "",
    sideGrade: "",
    width: 6,
    thickness: DEFAULT_THICKNESS,
    profile: d.profile,
    finish: "Polished",
    size: "P",
    engraving: "",
    font: "script",
    stone: "",
    stoneSize: 0,
    sizer: false,
    date: "",
    ...keep,
  };
}

/** Everything the page derives from a design: the effective (clamped) values and the supplier pricing bits. */
export function derive(design: Design) {
  const ring = findRing(design.ring) ?? RINGS[0]!;
  const isClassic = ring.range === "classic";
  const hasModel = !!RING_MODELS[ring.id];
  const classicFlat = hasModel && FLAT_STYLES.has(ring.id);
  const flatDefault = ring.id === "as2" ? "Flat" : "Court"; // AS-2's photo is the flat profile
  const styleDefaults = ringDesignDefaults(ring.id, Object.keys(ring.metals)[0] ?? "");
  const profile = hasModel
    ? classicFlat
      ? design.profile === "Flat" || design.profile === "Court" ? design.profile : flatDefault
      : styleDefaults.profile
    : pick(design.profile, PROFILES, "Court");
  const twoTone = isClassic ? false : design.twoTone;
  const pattern = styleDefaults.pattern;
  const metal = pick(design.metal, METAL_IDS, styleDefaults.centreMetal);
  const side = pick(design.side, METAL_IDS, styleDefaults.sideMetal);
  const width = clamp(Math.round(design.width / WIDTH_STEP) * WIDTH_STEP, WIDTH_MIN, WIDTH_MAX);

  const baseSku = PRICED_SKUS[ring.id];
  const priceSku = baseSku ? priceSkuFor(baseSku, profile) : null;
  const tRange = (priceSku && thicknessRange(priceSku, width)) || { min: 1.2, max: 3 };
  const thickness = round1(clamp(design.thickness, tRange.min, tRange.max));
  const widthPriced = !!priceSku && thicknessAvailable(priceSku, width, thickness);
  const stoneOpts = priceSku ? skuOptions(priceSku)?.stone : undefined;
  const stone = stoneOpts ? (stoneOpts.types.includes(design.stone) ? design.stone : stoneOpts.type) : "";
  const stoneSpec = priceSku ? STONE_SPECS[priceSku] : undefined;
  const stoneSize = stoneSpec ? (stoneSpec.sizes.includes(design.stoneSize) ? design.stoneSize : stoneSpec.defaultSize) : 0;
  const stoneLabel = stone && stoneSpec ? `${stoneSpec.count} × ${stoneSize}mm ${stoneSpec.cut.toLowerCase()}-cut ${stone}` : stone;
  const grades = GRADES_FOR_METAL[metal] ?? [];
  const sideGrades = GRADES_FOR_METAL[side] ?? [];
  const grade = grades.includes(design.grade) ? design.grade : DEFAULT_GRADE[metal] ?? "";
  const sideGrade = sideGrades.includes(design.sideGrade) ? design.sideGrade : DEFAULT_GRADE[side] ?? "";
  const finish = pick(design.finish, FINISHES, "Polished");
  const size = pick(design.size, FINGER_SIZES, "P");
  const engraving = cleanEngraving(design.engraving).trim();
  const font = engravingFont(design.font);

  const priceConfig: PriceConfig | null = priceSku && widthPriced && grade && (!twoTone || sideGrade)
    ? { sku: priceSku, size, width, thickness, centreMaterial: grade, sideMaterial: twoTone ? sideGrade : grade, ...(stone ? { stoneType: stone, ...(stoneSpec && stoneSpec.sizes.length > 1 ? { stoneSize } : {}) } : {}) }
    : null;
  /** Why there is no price, in the customer's words; "" when there is one to fetch. */
  const unpriced = !baseSku ? "Priced on enquiry" : !priceSku ? "Not priced for this profile" : !widthPriced ? "Width not listed for this style" : "";

  return {
    ring, isClassic, hasModel, classicFlat, profile, twoTone, pattern, metal, side, width, thickness, tRange, widthPriced,
    baseSku, priceSku, stoneOpts, stone, stoneSpec, stoneSize, stoneLabel, grades, sideGrades, grade, sideGrade, finish, size,
    engraving, font, priceConfig, unpriced,
    metalLabel: METALS_3D[metal]?.label ?? metal,
    sideLabel: METALS_3D[side]?.label ?? side,
    fitLabel: classicFlat ? FIT_LABELS[profile] ?? profile : profile,
  };
}
export type Derived = ReturnType<typeof derive>;

export const fmtDate = (d: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "");

/** The "Your ring" rows, in order. */
export function summaryRows(design: Design, d: Derived): [string, string][] {
  const rows: [string, string][] = [["Style", d.ring.displayName ? `${d.ring.displayName} · ${d.ring.name}` : d.ring.name]];
  if (d.pattern === "greek-key") rows.push(["Pattern", "Greek key"]);
  if (d.twoTone) {
    rows.push(["Centre metal", d.baseSku ? d.grade : d.metalLabel], ["Side metal", d.baseSku ? d.sideGrade : d.sideLabel]);
  } else {
    rows.push(["Metal", d.baseSku ? d.grade : d.metalLabel]);
  }
  rows.push(["Width", `${d.width.toFixed(1)} mm`], ["Thickness", `${d.thickness.toFixed(1)} mm`]);
  if (d.stone) rows.push(["Stones", d.stoneLabel]);
  if (!d.hasModel || d.classicFlat) rows.push([d.classicFlat ? "Fit" : "Profile", d.fitLabel]);
  rows.push(["Finish", d.finish]);
  rows.push(["Finger size", design.sizer ? `${d.size} (free sizer requested)` : d.size]);
  if (design.date) rows.push(["Date required", fmtDate(design.date)]);
  if (d.engraving) rows.push(["Engraving", `“${d.engraving}”`], ["Engraving font", d.font.label]);
  return rows;
}

/** Line item properties for the deposit line. Keys starting with _ are hidden from the customer, shown in admin. */
export function cartProperties(design: Design, d: Derived, extra: { price?: string; link?: string; preview?: string }): Record<string, string> {
  const p: Record<string, string> = {
    Style: d.ring.displayName ? `${d.ring.name} ${d.ring.displayName}` : d.ring.name,
    Width: `${d.width.toFixed(1)}mm`,
    Thickness: `${d.thickness.toFixed(1)}mm`,
    "Centre metal": d.baseSku ? d.grade : d.metalLabel,
  };
  if (d.twoTone) p["Side metal"] = d.baseSku ? d.sideGrade : d.sideLabel;
  p[d.classicFlat ? "Fit" : "Profile"] = d.classicFlat ? `${d.fitLabel} (${d.profile})` : d.profile;
  p["Finish"] = d.finish;
  p["Finger size"] = design.sizer ? `${d.size} (free ring sizer requested — confirm size)` : d.size;
  if (design.date) p["Date required"] = fmtDate(design.date);
  if (d.stone) p["Stones"] = d.stoneLabel;
  if (d.engraving) { p["Engraving"] = d.engraving; p["Engraving font"] = d.font.label; }
  if (extra.price) p["Quoted price (incl GST)"] = extra.price;
  if (d.priceSku) p["_Supplier SKU"] = d.priceSku;
  if (extra.link) p["Design link"] = extra.link;
  if (extra.preview) p["_Preview"] = extra.preview;
  return p;
}

// URL state: short keys so a share link stays readable. Only values that differ from the style's defaults are written.
const Q = {
  ring: "ring", tone: "tone", metal: "metal", side: "side", grade: "grade", sgrade: "sgrade", w: "w", t: "t", profile: "profile",
  finish: "finish", size: "size", eng: "eng", font: "font", stone: "stone", ssize: "ssize", sizer: "sizer", date: "date",
} as const;

export function designToParams(design: Design, d: Derived): URLSearchParams {
  const q = new URLSearchParams();
  q.set(Q.ring, d.ring.id);
  if (!d.isClassic) q.set(Q.tone, d.twoTone ? "2" : "1");
  q.set(Q.metal, d.metal);
  if (d.twoTone) q.set(Q.side, d.side);
  if (d.baseSku && d.grades.length > 1) q.set(Q.grade, d.grade);
  if (d.twoTone && d.baseSku && d.sideGrades.length > 1) q.set(Q.sgrade, d.sideGrade);
  q.set(Q.w, String(d.width));
  q.set(Q.t, d.thickness.toFixed(1));
  if (!d.hasModel || d.classicFlat) q.set(Q.profile, d.profile);
  if (d.finish !== "Polished") q.set(Q.finish, d.finish);
  q.set(Q.size, d.size);
  if (d.engraving) { q.set(Q.eng, d.engraving); q.set(Q.font, d.font.id); }
  if (d.stoneOpts && d.stone) q.set(Q.stone, d.stone);
  if (d.stoneSpec && d.stoneSpec.sizes.length > 1) q.set(Q.ssize, String(d.stoneSize));
  if (design.sizer) q.set(Q.sizer, "1");
  if (design.date) q.set(Q.date, design.date);
  return q;
}

const num = (v: string | null, d: number) => { const n = Number(v); return v && Number.isFinite(n) ? n : d; };

/** A design from a share link or the page URL; null when the URL carries no design. Every value is re-validated by derive(). */
export function designFromParams(q: URLSearchParams): Design | null {
  const ring = findRing(q.get(Q.ring));
  if (!ring) return null;
  const base = defaultDesign(ring.id);
  const tone = q.get(Q.tone);
  return {
    ...base,
    twoTone: tone ? tone === "2" : base.twoTone,
    metal: pick(q.get(Q.metal), METAL_IDS, base.metal),
    side: pick(q.get(Q.side), METAL_IDS, base.side),
    grade: (q.get(Q.grade) ?? "").slice(0, 40),
    sideGrade: (q.get(Q.sgrade) ?? "").slice(0, 40),
    width: num(q.get(Q.w), base.width),
    thickness: num(q.get(Q.t), base.thickness),
    profile: pick(q.get(Q.profile), PROFILES, base.profile),
    finish: pick(q.get(Q.finish), FINISHES, base.finish),
    size: pick(q.get(Q.size), FINGER_SIZES, base.size),
    engraving: cleanEngraving(q.get(Q.eng) ?? ""),
    font: pick(q.get(Q.font), ENGRAVING_FONTS.map((f) => f.id), base.font),
    stone: (q.get(Q.stone) ?? "").slice(0, 40),
    stoneSize: num(q.get(Q.ssize), 0),
    sizer: q.get(Q.sizer) === "1",
    date: /^\d{4}-\d{2}-\d{2}$/.test(q.get(Q.date) ?? "") ? q.get(Q.date)! : "",
  };
}

export { RINGS, type Ring };
