// What the build-time patches in Mark's RingDesigner call (imported there as __shop). Customers never see a change:
// everything here is either a different address (the website instead of his Lovable site) or only active in staff
// mode (?staff=1, opened by the dashboard's Custom Orders).
import { SUPPLIER_SIZES as SIZES } from "../mark/src/lib/pricing/sku-options";
import { skuOptions } from "../mark/src/lib/pricing/ring-price";
import { CONFIG } from "./config";

const q = (() => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } })();

export const STAFF = q.get("staff") === "1";
export const ORDER = (q.get("order") || "").slice(0, 40);
export const SUPPLIER_SIZES: string[] = SIZES;

/** Every width the supplier lists for this SKU (staff mode), ascending. */
export const widths = (sku: string | null | undefined): number[] => {
  const w = sku ? skuOptions(sku)?.widths : undefined;
  return w && w.length ? [...w].sort((a, b) => a - b) : [];
};

/** "P1/4" -> "P": the 3D preview sizes by whole letters. */
export const letter = (size: string): string => size.replace(/\d\/\d$/, "");

/** His share link, pointing at the website's designer page instead of his /rings/<id> route. */
export const designUrl = (ringId: string, query: URLSearchParams): string => {
  const out = new URLSearchParams({ ring: ringId });
  for (const [k, v] of query) out.set(k, v);
  return `${CONFIG.pageUrl}?${out.toString()}`;
};

/** Values his share link does not carry but an order's design link does (so staff reopen exactly what was ordered). */
const num = (v: string | null) => { const n = Number(v); return v != null && v !== "" && Number.isFinite(n) ? n : undefined; };
export const extra = {
  grade: (q.get("grade") || "").slice(0, 40) || undefined,
  sgrade: (q.get("sgrade") || "").slice(0, 40) || undefined,
  ssize: num(q.get("ssize")),
  sizer: q.get("sizer") === "1",
  date: /^\d{4}-\d{2}-\d{2}$/.test(q.get("date") || "") ? (q.get("date") as string) : "",
};
