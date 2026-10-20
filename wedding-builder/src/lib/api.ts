// Talks to the wedding ring API on the droplet (price lookups, order pictures) and to the theme's own cart.
import { useEffect, useRef, useState } from "react";
import type { PriceConfig } from "./pricing/ring-price";

export type BuilderConfig = {
  apiBase: string;
  depositVariantId: number;
  depositAud: number;
  cartEnabled: boolean;
  contactUrl: string;
  bookingUrl: string;
  bookingLabel: string;
  phone: string;
  leadTime: string;
  proofNote: string;
  depositNote: string;
  priceNote: string;
  pageUrl: string;
};

export type PriceState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; price: number; checkedAt: string; basis: string }
  | { status: "unavailable" };

/** Debounced (350 ms), abortable, request-ID guarded price lookup. The previous price is kept while a new one loads. */
export function useRingPrice(apiBase: string, config: PriceConfig | null): PriceState {
  const [state, setState] = useState<PriceState>({ status: "idle" });
  const reqId = useRef(0);
  const key = config ? JSON.stringify(config) : "";
  useEffect(() => {
    const id = ++reqId.current;
    if (!config) { setState({ status: "idle" }); return; }
    setState({ status: "loading" });
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBase}/price`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: key,
          signal: ctrl.signal,
        });
        const body = (await res.json()) as { price?: unknown; checkedAt?: unknown; basis?: unknown };
        if (id !== reqId.current) return;
        if (!res.ok || typeof body.price !== "number" || !(body.price > 0) || typeof body.checkedAt !== "string") throw new Error();
        setState({ status: "ok", price: body.price, checkedAt: body.checkedAt, basis: typeof body.basis === "string" ? body.basis : "" });
      } catch {
        if (id === reqId.current && !ctrl.signal.aborted) setState({ status: "unavailable" });
      }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, apiBase]);
  return state;
}

export type FromPrices = Record<string, { price: number; width: number; thickness: number }>;
export type FromPricesState = { status: "loading" } | { status: "ok"; prices: FromPrices; checkedAt: string | null } | { status: "unavailable" };

/** The gallery's "from $" figures: one request per page view (the API's answer is cacheable for five minutes). If the
 *  server is still gathering them (just restarted), it is asked again a few times, ten seconds apart. */
export function useFromPrices(apiBase: string, enabled = true): FromPricesState {
  const [state, setState] = useState<FromPricesState>({ status: "loading" });
  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async (attempt: number) => {
      try {
        const res = await fetch(`${apiBase}/from-prices`, { signal: ctrl.signal, cache: attempt ? "no-store" : "default" });
        const j = (await res.json()) as { prices?: unknown; checkedAt?: unknown; refreshing?: unknown };
        if (!res.ok || !j.prices || typeof j.prices !== "object") throw new Error();
        const prices: FromPrices = {};
        for (const [sku, v] of Object.entries(j.prices as Record<string, { price?: unknown; width?: unknown; thickness?: unknown }>)) {
          if (typeof v?.price === "number" && v.price > 0) prices[sku] = { price: v.price, width: Number(v.width) || 0, thickness: Number(v.thickness) || 0 };
        }
        if (Object.keys(prices).length === 0 && j.refreshing && attempt < 6) { timer = setTimeout(() => void load(attempt + 1), 10_000); return; }
        setState({ status: "ok", prices, checkedAt: typeof j.checkedAt === "string" ? j.checkedAt : null });
      } catch {
        if (!ctrl.signal.aborted) setState({ status: "unavailable" });
      }
    };
    void load(0);
    return () => { ctrl.abort(); if (timer) clearTimeout(timer); };
  }, [apiBase, enabled]);
  return state;
}

export const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
/** "$1,890" rather than "A$1,890" (Intl adds the A on some platforms). */
export const money = (n: number) => aud.format(n).replace(/^A\$/, "$");

/** The order picture: the WebGL canvas composited on the stage's navy, as a JPEG data URL (about 1000 px square). */
export function snapshot(gl: HTMLCanvasElement | null, px = 1000): string {
  if (!gl || !gl.width || !gl.height) return "";
  const out = document.createElement("canvas");
  out.width = px; out.height = px;
  const ctx = out.getContext("2d");
  if (!ctx) return "";
  const g = ctx.createRadialGradient(px / 2, px * 0.28, 0, px / 2, px * 0.28, px * 0.9);
  g.addColorStop(0, "#2b3566"); g.addColorStop(0.45, "#171d50"); g.addColorStop(1, "#0b0e2a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, px, px);
  // keep the canvas's aspect, centred
  const s = Math.min(px / gl.width, px / gl.height);
  const w = gl.width * s, h = gl.height * s;
  ctx.drawImage(gl, (px - w) / 2, (px - h) / 2, w, h);
  return out.toDataURL("image/jpeg", 0.88);
}

/** Saves the order picture on the droplet; returns its public URL, or "" when that fails (the order still goes through). */
export async function uploadPreview(apiBase: string, dataUrl: string, label: string): Promise<string> {
  if (!dataUrl || dataUrl.length > 900_000) return "";
  try {
    const res = await fetch(`${apiBase}/preview`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: dataUrl, label }) });
    const j = (await res.json()) as { url?: unknown };
    return res.ok && typeof j.url === "string" ? j.url : "";
  } catch {
    return "";
  }
}

/** Adds the deposit variant to the theme cart with the design as line item properties, then goes to the cart. */
export async function addDepositToCart(variantId: number, properties: Record<string, string>): Promise<void> {
  const res = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ items: [{ id: variantId, quantity: 1, properties }] }),
  });
  if (!res.ok) {
    let msg = "Could not add the deposit to your cart.";
    try { const j = (await res.json()) as { description?: string; message?: string }; msg = j.description || j.message || msg; } catch { /* keep msg */ }
    throw new Error(msg);
  }
}
