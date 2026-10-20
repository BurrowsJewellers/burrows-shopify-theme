// Mark's "Pay deposit" made Shopify Storefront checkout in a new window. On the website the same button adds the
// deposit to the shop's own cart, with his line item details plus the design link, the supplier SKU and a picture
// of the ring, then goes to the cart page. In staff mode (the dashboard's order review) it hands the design back to
// the dashboard window instead.
import { CONFIG } from "./config";
import { shadow } from "./host";
import { ORDER, STAFF, designUrl } from "./shop";

export const DEPOSIT_VARIANT_ID = `gid://shopify/ProductVariant/${CONFIG.depositVariantId}`;
export const DEPOSIT_AUD = CONFIG.depositAud;

/** What the patched buyRing passes along with his attributes. */
export type DesignExtra = {
  ringId: string;
  sku: string | null;
  priceConfig: unknown;
  price?: number;
  summary: [string, string][];
  query: URLSearchParams;
};

const STAFF_ORIGINS = ["https://dashboard.burrowsjewellers.com.au", "http://localhost:5173", "http://localhost:4000", "http://localhost:8791", "http://localhost:8792"];

/** The 3D view as a JPEG on his white card (the canvas keeps its last frame: preserveDrawingBuffer). */
function snapshot(px = 1000): string {
  const gl = shadow()?.querySelector("canvas");
  if (!gl || !gl.width || !gl.height) return "";
  try {
    const out = document.createElement("canvas");
    out.width = px; out.height = px;
    const ctx = out.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, px, px);
    const s = Math.min(px / gl.width, px / gl.height), w = gl.width * s, h = gl.height * s;
    ctx.drawImage(gl, (px - w) / 2, (px - h) / 2, w, h);
    return out.toDataURL("image/jpeg", 0.88);
  } catch { return ""; }
}

async function uploadPreview(dataUrl: string, label: string): Promise<string> {
  if (!dataUrl || dataUrl.length > 900_000) return "";
  try {
    const res = await fetch(`${CONFIG.apiBase}/preview`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: dataUrl, label }) });
    const j = (await res.json()) as { url?: unknown };
    return res.ok && typeof j.url === "string" ? j.url : "";
  } catch { return ""; }
}

export async function createDepositCart(attributes: { key: string; value: string }[], extra?: DesignExtra): Promise<string> {
  const link = extra ? designUrl(extra.ringId, extra.query) : CONFIG.pageUrl;
  const picture = snapshot();

  if (STAFF) {
    const opener = window.opener as Window | null;
    if (!opener) throw new Error("Open this page from the dashboard's order to save back to it.");
    const params = new URL(link).searchParams.toString();
    const msg = { type: "wr-design", order: ORDER, params, priceConfig: extra?.priceConfig, price: extra?.price, summary: extra?.summary ?? [], preview: picture, link };
    for (const o of STAFF_ORIGINS) { try { opener.postMessage(msg, o); } catch { /* not that origin */ } }
    throw new Error("Sent to the dashboard. You can close this tab.");
  }

  const preview = await uploadPreview(picture, attributes.find((a) => a.key === "Style")?.value ?? "ring");
  const properties: Record<string, string> = {};
  for (const a of attributes) properties[a.key] = a.value;
  if (extra?.sku) properties["_Supplier SKU"] = extra.sku;
  properties["Design link"] = link;
  if (preview) properties["_Preview"] = preview;
  const res = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ items: [{ id: CONFIG.depositVariantId, quantity: 1, properties }] }),
  });
  if (!res.ok) {
    let msg = "Could not add the deposit to your cart.";
    try { const j = (await res.json()) as { description?: string; message?: string }; msg = j.description || j.message || msg; } catch { /* keep */ }
    throw new Error(msg);
  }
  window.location.href = "/cart";
  return new Promise<string>(() => { /* the page is leaving for the cart */ });
}
