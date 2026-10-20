// The style gallery: the page opens here. Collection chips, then every style as a tile with Infinity's photo, the
// name and a "from $" price (9ct yellow gold at the narrowest width, as the designer first shows it). Clicking a
// tile opens the designer with that style.
import { useMemo, useState } from "react";
import { COLLECTIONS, ringsIn, tilePhoto } from "../data/collections";
import { RINGS, type Ring } from "../data/rings";
import { defaultDesign, derive } from "../lib/design";
import { money, type FromPricesState } from "../lib/api";

/** The supplier SKU a style prices under when first opened (the profile its photo shows). */
export const gallerySku = (r: Ring): string | null => derive(defaultDesign(r.id)).priceSku;

export function fromLabel(r: Ring, fp: FromPricesState): { text: string; cls: string } {
  const sku = gallerySku(r);
  if (!sku) return { text: "Priced on enquiry", cls: "wr-g__from--enq" };
  if (fp.status === "loading") return { text: "…", cls: "wr-g__from--wait" };
  if (fp.status === "unavailable") return { text: "", cls: "wr-g__from--none" }; // the API is down: no figures, no false promises
  const p = fp.prices[sku];
  if (!p) return { text: "Priced on enquiry", cls: "wr-g__from--enq" }; // Infinity's configurator cannot price it (IN1275)
  return { text: `from ${money(p.price)}`, cls: "" };
}

export function Gallery({ fromPrices, onPick, initialCollection = "" }: { fromPrices: FromPricesState; onPick: (ring: Ring) => void; initialCollection?: string }) {
  const [collection, setCollection] = useState(initialCollection);
  const rings = useMemo(() => ringsIn(collection), [collection]);
  const counts = useMemo(() => Object.fromEntries(COLLECTIONS.map((c) => [c.id, ringsIn(c.id).length])), []);
  const blurb = COLLECTIONS.find((c) => c.id === collection)?.blurb ?? `${RINGS.length} styles by Infinity Rings, each made to order in your metal, width and size.`;

  return (
    <div className="wr-g" id="gallery">
      <div className="wr-g__top">
        <h2 className="wr-g__h">Choose a style</h2>
        <p className="wr-g__blurb">{blurb}</p>
        <div className="wr-g__chips" role="tablist" aria-label="Collections">
          <button type="button" role="tab" aria-selected={collection === ""} className={`wr__chip${collection === "" ? " on" : ""}`} onClick={() => setCollection("")}>All <small>{RINGS.length}</small></button>
          {COLLECTIONS.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={collection === c.id} className={`wr__chip${collection === c.id ? " on" : ""}`} onClick={() => setCollection(c.id)} data-collection={c.id}>
              {c.label} <small>{counts[c.id]}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="wr-g__grid" role="list">
        {rings.map((r, i) => {
          const from = fromLabel(r, fromPrices);
          return (
            <button key={r.id} type="button" role="listitem" className="wr-g__tile" onClick={() => onPick(r)} data-ring={r.id} aria-label={`${r.displayName ?? r.name}, ${from.text}. Design this ring`}>
              <span className="wr-g__img"><img src={tilePhoto(r)} alt="" loading={i < 8 ? "eager" : "lazy"} decoding="async" width={400} height={400} /></span>
              <span className="wr-g__name">{r.displayName ?? r.name}</span>
              {r.displayName && <span className="wr-g__code">{r.name}</span>}
              <span className={`wr-g__from ${from.cls}`}>{from.text}</span>
              <span className="wr-g__cta" aria-hidden="true">Design this ring</span>
            </button>
          );
        })}
      </div>
      <p className="wr-g__foot">
        "From" prices are indicative and include GST: 9ct yellow gold at the style's narrowest width, size P. Every style is also made in white and rose gold, platinum, palladium, silver, titanium, tantalum and zirconium; the price updates as you design.
      </p>
    </div>
  );
}
