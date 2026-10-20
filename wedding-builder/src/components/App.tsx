// Gallery first, then the designer. A share link, a saved draft or staff mode open the designer straight away;
// everyone else picks a style from the gallery. The browser's back button returns to the gallery.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Ring } from "../data/rings";
import { defaultDesign, type Design } from "../lib/design";
import { useFromPrices, type BuilderConfig } from "../lib/api";
import { STAFF, startingDesign } from "../lib/session";
import { Gallery } from "./Gallery";
import { Designer } from "./Designer";

type View = { name: "gallery" } | { name: "designer"; design: Design; step: number; key: number };

const KEEP: (keyof Design)[] = ["size", "engraving", "font", "sizer", "date", "finish", "width", "thickness"];

export function App({ config }: { config: BuilderConfig }) {
  const [view, setView] = useState<View>(() => {
    const d = startingDesign();
    return d ? { name: "designer", design: d, step: 1, key: 0 } : { name: "gallery" };
  });
  const fromPrices = useFromPrices(config.apiBase, !STAFF);
  const last = useRef<Design | null>(view.name === "designer" ? view.design : null);
  const pushed = useRef(false);
  const keyRef = useRef(1);

  const scrollTop = () => {
    const el = document.getElementById("weddingRingBuilder");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: "smooth" });
  };

  const pick = useCallback((r: Ring) => {
    const keep: Partial<Design> = {};
    if (last.current) for (const k of KEEP) (keep as Record<string, unknown>)[k] = last.current[k];
    const design = defaultDesign(r.id, keep);
    try { window.history.pushState({ wr: "designer" }, ""); pushed.current = true; } catch { pushed.current = false; }
    setView({ name: "designer", design, step: 2, key: keyRef.current++ });
    scrollTop();
  }, []);

  const toGallery = useCallback(() => {
    if (pushed.current) { pushed.current = false; window.history.back(); return; }
    setView({ name: "gallery" });
    scrollTop();
  }, []);

  useEffect(() => {
    const onPop = () => {
      pushed.current = false;
      setView((v) => (v.name === "designer" ? { name: "gallery" } : v));
      scrollTop();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (view.name === "gallery") return <Gallery fromPrices={fromPrices} onPick={pick} />;
  return (
    <Designer
      key={view.key}
      config={config}
      initialDesign={view.design}
      initialStep={view.step}
      onChangeStyle={STAFF ? undefined : toGallery}
      onDesign={(d) => { last.current = d; }}
    />
  );
}
