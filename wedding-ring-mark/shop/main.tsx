// Entry: mounts Mark's page inside a shadow root on the section's [data-wr-app] element, so his styles (Tailwind,
// his colours and fonts) apply exactly and the shop theme's CSS can't reach in, nor his reach out.
// view "designer": his home page ("Design Your Wedding Ring" + the designer), or with ?ring=<id> his ring page
// (that style's name as the heading + the designer with the shared design); view "catalogue": his collection page.
import { createRoot } from "react-dom/client";
import css from "../mark/src/styles.css?inline";
import { Route as HomeRoute } from "../mark/src/routes/index";
import { Route as CatalogueRoute } from "../mark/src/routes/catalogue";
import { Route as RingRoute } from "../mark/src/routes/rings.$ringId";
import { RINGS } from "../mark/src/data/rings";
import { CONFIG } from "./config";
import { setHost } from "./host";
import { setRouteState } from "./router";

/** His stylesheet, retargeted at the shadow root: :root and body rules apply to the host. */
function shadowCss(src: string): { inside: string; global: string } {
  // @property only registers from document-level stylesheets, so those go to <head> (they only name --tw-* vars).
  const props: string[] = [];
  const inside = src
    .replace(/@property\s+--[\w-]+\s*\{[^}]*\}/g, (m) => { props.push(m); return ""; })
    .replace(/:root\b/g, ":host")
    .replace(/(^|[},;\s])body(\s*[{,])/g, "$1:host$2")
    .replace(/(^|[},;\s])html(\s*[{,])/g, "$1:host$2");
  return { inside, global: props.join("\n") };
}

function mount() {
  const host = document.querySelector<HTMLElement>("[data-wr-app]");
  if (!host || host.shadowRoot) return;
  const shadow = host.attachShadow({ mode: "open" });
  const { inside, global } = shadowCss(css);
  if (global && !document.getElementById("wr-props")) {
    const g = document.createElement("style"); g.id = "wr-props"; g.textContent = global; document.head.appendChild(g);
  }
  const style = document.createElement("style");
  // all:initial first: inherited text settings (the theme's font size, letter spacing, colour) would otherwise flow in
  // from the page. It sits in a cascade layer declared before his, so his own layered :host rules (from his body/html
  // styles) win over it; an unlayered rule would beat every rule of his.
  style.textContent = `@layer wr-reset{:host{all:initial;display:block}}\n${inside}`;
  const app = document.createElement("div");
  const portal = document.createElement("div");
  portal.setAttribute("data-wr-portal", "");
  shadow.append(style, app, portal);
  setHost(host, shadow);
  host.removeAttribute("aria-busy");
  host.querySelector("[data-wr-fallback]")?.remove();

  let Page = HomeRoute.component;
  if (CONFIG.view === "catalogue") Page = CatalogueRoute.component;
  else {
    const q = new URLSearchParams(location.search);
    const ring = RINGS.find((r) => r.id === q.get("ring"));
    if (ring) {
      const search: Record<string, unknown> = {};
      for (const [k, v] of q) search[k] = v;
      setRouteState({ loaderData: { ring }, search: RingRoute.options.validateSearch(search) });
      Page = RingRoute.component;
    }
  }
  createRoot(app).render(<Page />);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
