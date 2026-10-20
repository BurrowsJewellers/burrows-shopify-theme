// The section's settings (sections/wedding-ring-builder.liquid writes them as JSON next to the mount point).
export type ShopConfig = {
  view: "designer" | "catalogue";
  apiBase: string;
  depositVariantId: number;
  depositAud: number;
  pageUrl: string; // the designer page, absolute
  catalogueUrl: string; // the catalogue page, absolute
};

function read(): ShopConfig {
  let raw: Partial<ShopConfig> = {};
  try {
    const el = document.querySelector<HTMLScriptElement>("script[data-wr-config]");
    raw = el ? (JSON.parse(el.textContent || "{}") as Partial<ShopConfig>) : {};
  } catch { raw = {}; }
  const origin = typeof location !== "undefined" ? location.origin : "https://burrowsjewellers.com.au";
  return {
    view: raw.view === "catalogue" ? "catalogue" : "designer",
    apiBase: String(raw.apiBase || "https://dashboard.burrowsjewellers.com.au/wedding-ring/api").replace(/\/$/, ""),
    depositVariantId: Number(raw.depositVariantId) || 56711642382641,
    depositAud: Number(raw.depositAud) || 200,
    pageUrl: String(raw.pageUrl || `${origin}/pages/wedding-ring-builder`),
    catalogueUrl: String(raw.catalogueUrl || `${origin}/pages/wedding-ring-catalogue`),
  };
}

export const CONFIG = read();
