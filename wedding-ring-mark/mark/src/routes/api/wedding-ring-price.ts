import { createFileRoute } from "@tanstack/react-router";
import { buildSupplierUrl, parseSupplierPrice, validatePriceConfig } from "@/lib/pricing/ring-price";

// Indicative supplier RRP lookup. Supplier host and store ID are fixed here; the browser
// only sends {sku,size,width,thickness,material}. Best-effort per-IP rate limit (per worker isolate).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const Route = createFileRoute("/api/wedding-ring-price")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (rateLimited(ip)) return json({ error: "Too many requests" }, 429);
        let config;
        try {
          config = validatePriceConfig(await request.json());
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Invalid request" }, 400);
        }
        try {
          const res = await fetch(buildSupplierUrl(config), {
            headers: { accept: "application/json" },
            signal: AbortSignal.timeout(8000),
          });
          if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) throw new Error("bad response");
          const price = parseSupplierPrice(await res.json());
          return json({ price, currency: "AUD", checkedAt: new Date().toISOString() });
        } catch {
          return json({ error: "Price unavailable" }, 502);
        }
      },
    },
  },
});
