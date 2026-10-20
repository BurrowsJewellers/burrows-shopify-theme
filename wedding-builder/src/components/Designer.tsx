// The designer: the ring on the stage (left) and five numbered steps (right), one open at a time, with a price bar
// that stays on screen. Same layout language as the name necklace builder.
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CLASSIC_RINGS, SIGNATURE_RINGS, type Ring } from "../data/rings";
import { FINGER_SIZES, PROFILES } from "../lib/ring-options";
import { METALS_3D, innerDiameterMm } from "../lib/ring-3d-options";
import { ENGRAVING_FONTS, ENGRAVING_MAX, cleanEngraving } from "../lib/engraving";
import { addDepositToCart, money, snapshot, uploadPreview, useRingPrice, type BuilderConfig } from "../lib/api";
import { cartProperties, defaultDesign, derive, designFromParams, designToParams, FINISHES, FIT_LABELS, METAL_IDS, STONE_COLOURS, summaryRows, WIDTH_MAX, WIDTH_MIN, WIDTH_STEP, type Design } from "../lib/design";

const Ring3D = lazy(() => import("./Ring3D"));

const STEPS = ["Style", "Metal", "Shape", "Size & engraving", "Review"] as const;

/** Metal swatch colours for the tiles (the 3D colours are tuned for lighting, these read better as flat discs). */
const SWATCH: Record<string, [string, string]> = {
  "yellow-gold": ["#e9c873", "#b8912e"],
  "rose-gold": ["#f0bea3", "#c1836a"],
  "white-gold": ["#f1efe9", "#b9b6ad"],
  platinum: ["#e9eaec", "#a9abb0"],
  silver: ["#f8f8f8", "#b5b5b5"],
  titanium: ["#c4c2bc", "#8a8880"],
  tantalum: ["#9298a6", "#5a5f6b"],
  zirconium: ["#4a4a50", "#1e1e22"],
  "grey-zirconium": ["#a4a5aa", "#6b6c70"],
};

function Loading({ text = "Loading the 3D ring…" }: { text?: string }) {
  return <div className="wr__loading"><span className="wr__spin" />{text}</div>;
}

/** Cross-section sketch: Comfit has a rounded inside, Standard a flat inside. */
function FitDiagram({ comfit }: { comfit: boolean }) {
  const d = comfit ? "M4 6 Q20 0 36 6 L36 14 Q20 22 4 14 Z" : "M4 6 Q20 0 36 6 L36 18 L4 18 Z";
  return (
    <svg viewBox="0 0 40 30" className="wr__fit-svg" aria-hidden="true">
      <text x="20" y="3.5" textAnchor="middle" className="wr__fit-cap" style={{ fontSize: 2.6 }}>OUTSIDE</text>
      <g transform="translate(0 4)">
        <path d={d} className="wr__fit-band" />
        <rect x="2" y="21" width="36" height="4" rx="1" className="wr__fit-finger" />
      </g>
      <text x="20" y="29.5" textAnchor="middle" className="wr__fit-cap" style={{ fontSize: 2.6 }}>FINGER SIDE</text>
    </svg>
  );
}

function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return <button type="button" className={`wr__chip${on ? " on" : ""}`} aria-pressed={on} onClick={onClick} title={title}>{children}</button>;
}

function MetalTiles({ label, value, onChange, idPrefix }: { label: string; value: string; onChange: (v: string) => void; idPrefix: string }) {
  return (
    <fieldset className="wr__group">
      <legend className="wr__label">{label}</legend>
      <div className="wr__metal-tiles" role="radiogroup" aria-label={label} id={`${idPrefix}Tiles`}>
        {METAL_IDS.map((id) => {
          const m = METALS_3D[id]!;
          const [a, b] = SWATCH[id] ?? [m.color, m.color];
          return (
            <button key={id} type="button" role="radio" aria-checked={value === id} className={`wr__tile${value === id ? " on" : ""}`} onClick={() => onChange(id)} data-metal={id}>
              <i style={{ "--sw": a, "--sw2": b } as React.CSSProperties} />
              {m.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function GradeChips({ label, grades, value, onChange, id }: { label: string; grades: string[]; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="wr__purity" id={id}>
      <span className="wr__purity-l">{label}</span>
      <div className="wr__chips">
        {grades.map((g) => {
          const short = g.match(/(\d+ct)$/)?.[1] ?? g.replace(/^(Platinum|Palladium) /, "$1 ");
          return <Chip key={g} on={value === g} onClick={() => onChange(g)} title={g}>{short}</Chip>;
        })}
      </div>
    </div>
  );
}

function RingTile({ ring, on, onClick }: { ring: Ring; on: boolean; onClick: () => void }) {
  const img = Object.values(ring.metals)[0] ?? "";
  return (
    <button type="button" role="radio" aria-checked={on} className={`wr__ring${on ? " on" : ""}`} onClick={onClick} data-ring={ring.id}>
      <span className="wr__ring-img"><img src={img} alt="" loading="lazy" width={300} height={300} /></span>
      <span className="wr__ring-name">{ring.displayName ?? ring.name}</span>
      {ring.displayName && <span className="wr__ring-code">{ring.name}</span>}
    </button>
  );
}

export function Designer({ config }: { config: BuilderConfig }) {
  const [design, setDesign] = useState<Design>(() => {
    try { return designFromParams(new URLSearchParams(window.location.search)) ?? defaultDesign(CLASSIC_RINGS[0]!.id); } catch { return defaultDesign(CLASSIC_RINGS[0]!.id); }
  });
  const d = useMemo(() => derive(design), [design]);
  const set = useCallback((patch: Partial<Design>) => setDesign((prev) => ({ ...prev, ...patch })), []);
  const price = useRingPrice(config.apiBase, d.priceConfig);
  const lastPrice = useRef<number | null>(null);
  if (price.status === "ok") lastPrice.current = price.price;

  const [open, setOpen] = useState(1);
  const [status, setStatus] = useState<{ text: string; err?: boolean }>({ text: "" });
  const [busy, setBusy] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const glRef = useRef<HTMLCanvasElement | null>(null);
  const onCanvas = useCallback((c: HTMLCanvasElement | null) => { glRef.current = c; }, []);
  const onLoaded = useCallback(() => setModelReady(true), []);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The URL carries the design, so a reload or a shared link brings it back.
  const params = useMemo(() => designToParams(design, d).toString(), [design, d]);
  useEffect(() => {
    const t = setTimeout(() => {
      try { window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params}${window.location.hash}`); } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [params]);
  const shareUrl = `${config.pageUrl || window.location.origin + window.location.pathname}?${params}`;

  const goTo = (n: number) => {
    setOpen(n);
    const el = blockRefs.current[n];
    if (el && window.matchMedia("(max-width: 1023px)").matches) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const chooseRing = (r: Ring) => {
    const next = defaultDesign(r.id, { size: design.size, engraving: design.engraving, font: design.font, sizer: design.sizer, date: design.date, finish: design.finish, width: design.width, thickness: design.thickness });
    setModelReady(false);
    setDesign(next);
  };

  const rows = summaryRows(design, d);
  const priceText = (() => {
    if (d.unpriced) return { text: d.unpriced, cls: "err" };
    if (price.status === "ok") return { text: money(price.price), cls: "" };
    if (price.status === "unavailable") return { text: "Price unavailable right now", cls: "err" };
    if (lastPrice.current != null) return { text: money(lastPrice.current), cls: "stale" };
    return { text: "Checking…", cls: "stale" };
  })();
  const canBuy = config.cartEnabled && !!d.priceConfig && price.status === "ok" && !busy;

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `My ${d.ring.name} wedding ring`, url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); setStatus({ text: "Link copied. Paste it anywhere to come back to this design." }); }
    } catch { /* cancelled */ }
  };

  const buy = async () => {
    if (!canBuy || price.status !== "ok") return;
    setBusy(true);
    setStatus({ text: "Saving your design…" });
    try {
      let preview = "";
      try { preview = await uploadPreview(config.apiBase, snapshot(glRef.current), `${d.ring.name} ${d.grade}`); } catch { preview = ""; }
      const props = cartProperties(design, d, { price: money(price.price), link: shareUrl, preview });
      setStatus({ text: "Adding the deposit to your cart…" });
      await addDepositToCart(config.depositVariantId, props);
      window.location.href = "/cart";
    } catch (e) {
      setStatus({ text: `${e instanceof Error ? e.message : "Something went wrong."} Call us on ${config.phone} and we will take it from here.`, err: true });
      setBusy(false);
    }
  };

  const enquiryHref = (() => {
    const summary = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
    const u = new URL(config.contactUrl || "/pages/contact", window.location.origin);
    u.searchParams.set("subject", `Wedding ring enquiry: ${d.ring.name}`);
    u.searchParams.set("design", `${summary}\n${shareUrl}`);
    return u.pathname + u.search;
  })();

  const choice = (n: number): string => {
    switch (n) {
      case 1: return d.ring.displayName ? `${d.ring.displayName} · ${d.ring.name}` : d.ring.name;
      case 2: return d.twoTone ? `${d.grade} + ${d.sideGrade}` : d.baseSku ? d.grade : d.metalLabel;
      case 3: return `${d.width.toFixed(1)} × ${d.thickness.toFixed(1)} mm · ${d.fitLabel} · ${d.finish}`;
      case 4: return `Size ${d.size}${d.engraving ? ` · “${d.engraving}”` : ""}`;
      default: return "";
    }
  };

  // A plain render function (not a component), so the inputs inside keep focus across renders.
  const block = (n: number, title: string, children: React.ReactNode, className = "") => (
    <div key={n} className={`wr__block${open === n ? " is-open" : ""} ${className}`} data-block={n} ref={(el) => { blockRefs.current[n] = el; }}>
      <h2 className="wr__h">
        <button type="button" className="wr__h-btn" id={`wrHead${n}`} aria-expanded={open === n} aria-controls={`wrBody${n}`} onClick={() => goTo(open === n ? 0 : n)}>
          <span className="wr__h-n">{n}</span><span className="wr__h-t">{title}</span><span className="wr__h-v">{choice(n)}</span><i className="wr__h-c" aria-hidden="true" />
        </button>
      </h2>
      <div className="wr__body" id={`wrBody${n}`} role="region" aria-labelledby={`wrHead${n}`} hidden={open !== n}>{children}</div>
    </div>
  );

  const sizeIndex = FINGER_SIZES.indexOf(d.size);

  return (
    <>
      <ol className="wr__steps" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className={open === i + 1 ? "on" : open > i + 1 ? "done" : ""}>
            <button type="button" aria-controls={`wrBody${i + 1}`} onClick={() => goTo(i + 1)}><span>{i + 1}</span>{s}</button>
          </li>
        ))}
      </ol>
      <div className="wr__app">
        <div className="wr__stage" id="stage">
          {d.ring.id === "in1915" ? (
            <figure className="wr__photo">
              <img src={d.ring.metals["zirconium"]} alt="IN1915 reference photo in black zirconium with black diamonds" width={599} height={599} />
              <figcaption>Reference photo in black zirconium with black diamonds. The 3D preview is not available for this style; your choices are listed in Review.</figcaption>
            </figure>
          ) : (
            <div className="wr__gl">
              <Suspense fallback={<Loading />}>
                <Ring3D
                  key={d.ring.id}
                  widthMm={d.width}
                  thicknessMm={d.thickness}
                  stoneColor={d.stone ? STONE_COLOURS[d.stone] : undefined}
                  innerDiameterMm={innerDiameterMm(d.size, FINGER_SIZES)}
                  profile={d.profile}
                  finish={d.finish}
                  centreMetal={d.metal}
                  sideMetal={d.side}
                  twoTone={d.twoTone}
                  pattern={d.pattern}
                  ringId={d.ring.id}
                  engravingText={d.engraving}
                  engravingFont={d.font.css}
                  onCanvas={onCanvas}
                  onLoaded={onLoaded}
                />
              </Suspense>
              {!modelReady && d.hasModel && <Loading />}
            </div>
          )}
          <div className="wr__hud wr__hud--top">
            <div className="wr__hud-left">
              <span className="wr__hint">{d.ring.id === "in1915" ? "Reference photo" : "Drag to turn"}</span>
            </div>
            <div className="wr__hud-right">
              <span className={`wr__stage-price ${priceText.cls}`} id="stagePrice" aria-live="polite">{d.unpriced && open < 5 ? "" : priceText.text}</span>
            </div>
          </div>
          <div className="wr__hud wr__hud--bottom">
            <span className="wr__hint wr__hint--dim">{d.ring.displayName ? `${d.ring.displayName} · ${d.ring.name}` : d.ring.name} · {d.width.toFixed(1)} mm wide</span>
            <button type="button" className="wr__mini" onClick={share}>Save or share</button>
          </div>
        </div>

        <form className="wr__panel" autoComplete="off" noValidate onSubmit={(e) => { e.preventDefault(); void buy(); }}>
          {block(1, "Style", <>
            <fieldset className="wr__group">
              <legend className="wr__label">Classic wedding bands</legend>
              <div className="wr__rings" role="radiogroup" aria-label="Classic wedding bands">
                {CLASSIC_RINGS.map((r) => <RingTile key={r.id} ring={r} on={d.ring.id === r.id} onClick={() => chooseRing(r)} />)}
              </div>
            </fieldset>
            <fieldset className="wr__group">
              <legend className="wr__label">Signature designs</legend>
              <div className="wr__rings" role="radiogroup" aria-label="Signature designs">
                {SIGNATURE_RINGS.map((r) => <RingTile key={r.id} ring={r} on={d.ring.id === r.id} onClick={() => chooseRing(r)} />)}
              </div>
            </fieldset>
            <p className="wr__note">Every style is made to order by Infinity Rings, Australian made, in your metal, width and size.</p>
            <button type="button" className="wr__next" onClick={() => goTo(2)}>Next: Metal</button>
          </>)}

          {block(2, "Metal", <>
            {!d.isClassic && (
              <fieldset className="wr__group">
                <legend className="wr__label">Metal layout</legend>
                <div className="wr__seg" id="toneSeg">
                  <label><input type="radio" name="tone" checked={!d.twoTone} onChange={() => set({ twoTone: false })} /><span>Single metal</span></label>
                  <label><input type="radio" name="tone" checked={d.twoTone} onChange={() => set({ twoTone: true })} /><span>Centre &amp; side metals</span></label>
                </div>
              </fieldset>
            )}
            <div className="wr__alloys">
              <MetalTiles label={d.twoTone ? "Centre metal" : "Metal"} value={d.metal} onChange={(v) => set({ metal: v, grade: "" })} idPrefix="metal" />
              {d.baseSku && d.grades.length > 1 && <GradeChips id="gradeChips" label={d.twoTone ? "Centre grade" : "Grade"} grades={d.grades} value={d.grade} onChange={(v) => set({ grade: v })} />}
            </div>
            {d.twoTone && (
              <div className="wr__alloys">
                <MetalTiles label="Side metal" value={d.side} onChange={(v) => set({ side: v, sideGrade: "" })} idPrefix="side" />
                {d.baseSku && d.sideGrades.length > 1 && <GradeChips id="sideGradeChips" label="Side grade" grades={d.sideGrades} value={d.sideGrade} onChange={(v) => set({ sideGrade: v })} />}
              </div>
            )}
            {d.stoneOpts && (
              <fieldset className="wr__group">
                <legend className="wr__label">Stones</legend>
                {d.stoneSpec && <p className="wr__note">{d.stoneSpec.count} {d.stoneSpec.cut.toLowerCase()}-cut stones{d.stoneSpec.sizes.length === 1 ? `, ${d.stoneSize} mm each` : ""}.</p>}
                <div className="wr__chips" id="stoneChips">
                  {d.stoneOpts.types.map((t) => (
                    <Chip key={t} on={d.stone === t} onClick={() => set({ stone: t })}>
                      <i className="wr__dot" style={{ background: STONE_COLOURS[t] ?? "#ddd" }} />{t}
                    </Chip>
                  ))}
                </div>
                {d.stoneSpec && d.stoneSpec.sizes.length > 1 && (
                  <div className="wr__purity">
                    <span className="wr__purity-l">Stone size</span>
                    <div className="wr__chips">{d.stoneSpec.sizes.map((mm) => <Chip key={mm} on={d.stoneSize === mm} onClick={() => set({ stoneSize: mm })}>{mm} mm</Chip>)}</div>
                  </div>
                )}
              </fieldset>
            )}
            <button type="button" className="wr__next" onClick={() => goTo(3)}>Next: Shape</button>
          </>)}

          {block(3, "Shape", <>
            <div className="wr__group">
              <label className="wr__label" htmlFor="widthRange">Width <small>{d.width.toFixed(1)} mm</small></label>
              <div className="wr__slider">
                <input type="range" id="widthRange" min={WIDTH_MIN} max={WIDTH_MAX} step={WIDTH_STEP} value={d.width} onChange={(e) => set({ width: Number(e.target.value) })} aria-label="Ring width in millimetres" />
                <span className="wr__readout"><b>{d.width.toFixed(1)}</b> mm</span>
              </div>
              <p className="wr__note">3 mm is fine and delicate, 8 mm is a wide, substantial band. 4 to 6 mm is the most common.</p>
              {!d.widthPriced && d.priceSku && <p className="wr__warn">This style is not made at {d.width.toFixed(1)} mm. Choose another width to see a price.</p>}
            </div>
            <div className="wr__group">
              <label className="wr__label" htmlFor="thickRange">Thickness <small>{d.thickness.toFixed(1)} mm</small></label>
              <div className="wr__slider">
                <input type="range" id="thickRange" min={d.tRange.min} max={d.tRange.max} step={0.1} value={d.thickness} onChange={(e) => set({ thickness: Number(e.target.value) })} aria-label="Band thickness in millimetres" />
                <span className="wr__readout"><b>{d.thickness.toFixed(1)}</b> mm</span>
              </div>
              <p className="wr__note">{d.tRange.min.toFixed(1)} mm is lighter, {d.tRange.max.toFixed(1)} mm heavier. The range follows what this style is made in at this width.</p>
            </div>
            {d.classicFlat ? (
              <fieldset className="wr__group">
                <legend className="wr__label">Fit</legend>
                <div className="wr__fits" role="radiogroup" aria-label="Fit">
                  {["Court", "Flat"].map((p) => (
                    <button key={p} type="button" role="radio" aria-checked={d.profile === p} className={`wr__fit${d.profile === p ? " on" : ""}`} onClick={() => set({ profile: p })} data-fit={p}>
                      <FitDiagram comfit={p === "Court"} />
                      <b>{FIT_LABELS[p]}</b>
                      <span>{p === "Court" ? "Rounded inside. Slides over the knuckle easily and feels lighter to wear." : "Flat inside. The traditional fit, sitting snug against the finger."}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : !d.hasModel ? (
              <fieldset className="wr__group">
                <legend className="wr__label">Profile</legend>
                <div className="wr__chips">{PROFILES.map((p) => <Chip key={p} on={d.profile === p} onClick={() => set({ profile: p })}>{p}</Chip>)}</div>
              </fieldset>
            ) : null}
            <fieldset className="wr__group">
              <legend className="wr__label">Finish</legend>
              <div className="wr__seg" id="finishSeg">
                {FINISHES.map((f) => <label key={f}><input type="radio" name="finish" checked={d.finish === f} onChange={() => set({ finish: f })} /><span>{f}</span></label>)}
              </div>
              <p className="wr__note">Finishes and engraving are included in the price.</p>
            </fieldset>
            <button type="button" className="wr__next" onClick={() => goTo(4)}>Next: Size &amp; engraving</button>
          </>)}

          {block(4, "Size & engraving", <>
            <fieldset className="wr__group">
              <legend className="wr__label">Finger size <small>Australian letter sizes</small></legend>
              <div className="wr__chips wr__chips--sizes" id="sizeChips" role="radiogroup" aria-label="Finger size">
                {FINGER_SIZES.map((s) => <Chip key={s} on={d.size === s} onClick={() => set({ size: s })}>{s}</Chip>)}
              </div>
              <details className="wr__more">
                <summary className="wr__label">Size guide<span className="wr__pm" aria-hidden="true" /></summary>
                <div className="wr__more-body">
                  <p className="wr__note">Inside diameter for each size, as a guide. Your size is confirmed on your finger in store before the ring is made, so pick your nearest size here.</p>
                  <div className="wr__sizes">
                    {FINGER_SIZES.map((s, i) => <span key={s} className={i === sizeIndex ? "on" : ""}><b>{s}</b>{innerDiameterMm(s, FINGER_SIZES).toFixed(1)} mm</span>)}
                  </div>
                </div>
              </details>
              <label className="wr__check">
                <input type="checkbox" checked={design.sizer} onChange={(e) => set({ sizer: e.target.checked })} />
                <span>Not sure of your size? Post me a free ring sizer. <small>We confirm your size before your ring is made.</small></span>
              </label>
            </fieldset>
            <div className="wr__group">
              <label className="wr__label" htmlFor="engIn">Engraving <small>inside the band, included</small></label>
              <div className="wr__namefield">
                <input type="text" id="engIn" className="wr__text" value={design.engraving} maxLength={ENGRAVING_MAX} placeholder="e.g. Forever yours · 10.10.2026" spellCheck={false} onChange={(e) => set({ engraving: cleanEngraving(e.target.value) })} />
                <span className={`wr__counter${design.engraving.length >= ENGRAVING_MAX ? " full" : ""}`} aria-live="polite">{design.engraving.length}/{ENGRAVING_MAX}</span>
              </div>
              <div className="wr__font-list" role="radiogroup" aria-label="Engraving font">
                {ENGRAVING_FONTS.map((f) => (
                  <label key={f.id} className={design.font === f.id ? "on" : ""}>
                    <input type="radio" name="font" checked={design.font === f.id} onChange={() => set({ font: f.id })} />
                    <span className="fname" style={{ fontFamily: f.css }}>{design.engraving.trim() || "Forever yours"}</span>
                    <span className="fstyle">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="wr__group">
              <label className="wr__label" htmlFor="dateIn">Wedding date or date required <small>optional</small></label>
              <input type="date" id="dateIn" className="wr__text wr__text--date" value={design.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => set({ date: e.target.value })} />
              <p className="wr__note">Each ring is made to order, so this helps us plan to have it ready in time.</p>
            </div>
            <button type="button" className="wr__next" onClick={() => goTo(5)}>Next: Review</button>
          </>)}

          {block(5, "Review", <>
            <div className="wr__summary" id="summary">
              {rows.map(([k, v]) => <div key={k} className="wr__summary-row"><span>{k}</span><span>{v}</span></div>)}
            </div>
            <div className="wr__total">
              <span className="wr__label">{config.priceNote || "Indicative price · AUD incl. GST"}</span>
              <p className={`wr__price ${priceText.cls}`} id="priceOut" aria-live="polite">{priceText.text}</p>
              {price.status === "ok" && <p className="wr__note">Checked {new Date(price.checkedAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}. Finishes and engraving included.</p>}
            </div>
            {config.leadTime && <p className="wr__note wr__note--ok">{config.leadTime}</p>}
            {config.depositNote && <p className="wr__note wr__note--ok">{config.depositNote}</p>}
            {config.proofNote && <p className="wr__note wr__note--proof">{config.proofNote}</p>}
            {d.unpriced && <p className="wr__warn">{d.unpriced === "Priced on enquiry" ? "This style is priced on enquiry. Send us your design and we will quote it within a day." : d.unpriced + "."}</p>}
            <div className="wr__actions">
              {config.bookingUrl && <a className="btn btn--outline-dark btn--lg" href={config.bookingUrl} target="_blank" rel="noopener">{config.bookingLabel || "Book a fitting"}</a>}
              <button type="button" className="btn btn--outline-dark btn--lg" onClick={share}>Save or share this design</button>
            </div>
            <p className="wr__note" id="enquiry"><a className="wr__link" href={enquiryHref}>Prefer to ask us about it first? Send an enquiry</a>{config.phone ? ` or call ${config.phone}.` : ""}</p>
          </>, "wr__block--review")}

          <div className="wr__bar" id="priceBar">
            <div className="wr__bar-row">
              <div className="wr__bar-total">
                <span className="wr__bar-l">{d.unpriced ? "Price" : "Indicative · incl. GST"}</span>
                <span className={`wr__bar-price ${priceText.cls}`} id="barPrice" aria-live="polite">{priceText.text}</span>
              </div>
              <button type="submit" className="btn btn--gold" id="addBtn" disabled={!canBuy}>{busy ? "One moment…" : `Pay $${config.depositAud} deposit`}</button>
            </div>
            <p className={`wr__status${status.err ? " err" : ""}`} id="status" role="status" aria-live="polite">{status.text}</p>
          </div>
        </form>
      </div>
    </>
  );
}
