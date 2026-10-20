// Entry point: mounts the gallery + designer into the section's [data-wr-app] element, reading its config from the
// <script type="application/json" data-wr-config> block that sections/wedding-ring-builder.liquid writes.
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import type { BuilderConfig } from "./lib/api";
import "./styles.css";

function readConfig(): BuilderConfig {
  const el = document.querySelector<HTMLScriptElement>("script[data-wr-config]");
  let raw: Partial<BuilderConfig> = {};
  try { raw = el ? (JSON.parse(el.textContent || "{}") as Partial<BuilderConfig>) : {}; } catch { raw = {}; }
  return {
    apiBase: String(raw.apiBase || "https://dashboard.burrowsjewellers.com.au/wedding-ring/api").replace(/\/$/, ""),
    depositVariantId: Number(raw.depositVariantId) || 0,
    depositAud: Number(raw.depositAud) || 200,
    cartEnabled: raw.cartEnabled !== false && Number(raw.depositVariantId) > 0,
    contactUrl: String(raw.contactUrl || "/pages/contact"),
    bookingUrl: String(raw.bookingUrl || ""),
    bookingLabel: String(raw.bookingLabel || ""),
    phone: String(raw.phone || ""),
    leadTime: String(raw.leadTime || ""),
    proofNote: String(raw.proofNote || ""),
    depositNote: String(raw.depositNote || ""),
    priceNote: String(raw.priceNote || ""),
    pageUrl: String(raw.pageUrl || ""),
  };
}

function mount() {
  const host = document.querySelector<HTMLElement>("[data-wr-app]");
  if (!host) return;
  const config = readConfig();
  host.removeAttribute("aria-busy");
  host.innerHTML = "";
  createRoot(host).render(<App config={config} />);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
