import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { RINGS, type Ring } from "../data/rings";
import { RING_MODELS, FLAT_STYLES } from "../data/ring-models";
import { METALS, PROFILES, FINGER_SIZES } from "../lib/ring-options";
import { METALS_3D, WIDTHS_MM, FINISH_ROUGHNESS, innerDiameterMm, ringDesignDefaults } from "../lib/ring-3d-options";
import { ENGRAVING_FONTS, ENGRAVING_MAX, cleanEngraving, engravingFont } from "../lib/engraving";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { DEFAULT_GRADE, GRADES_FOR_METAL, PRICED_SKUS, priceSkuFor, skuOptions, STONE_SPECS, thicknessAvailable, thicknessRange } from "../lib/pricing/ring-price";
import { DEPOSIT_AUD, createDepositCart } from "../lib/shopify-cart";
import { SizeGuide } from "./SizeGuide";

export type SharedDesign = Partial<Record<"metal" | "side" | "tone" | "w" | "t" | "profile" | "finish" | "size" | "eng" | "font" | "stone", string>>;

const STONE_COLOURS: Record<string, string> = {
  "Black Diamond": "#1c1c20",
  "Lab Grown Diamond": "#f4f8ff",
  "Natural Diamond": "#f4f8ff",
  Sapphire: "#1f4fb8",
  Ruby: "#a3132a",
};
import { useRingPrice } from "../lib/pricing/use-ring-price";

const DEFAULT_THICKNESS_MM = 1.6;
const num = (v: string | undefined, d: number) => { const n = Number(v); return v && Number.isFinite(n) ? n : d; };
const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

const Ring3D = lazy(() => import("./Ring3D"));
const FINISHES_3D = Object.keys(FINISH_ROUGHNESS);

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-foreground/40"
      )}
    >
      {children}
    </Button>
  );
}

function MetalPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(METALS_3D).map(([id, m]) => (
          <Pill key={id} active={value === id} onClick={() => onChange(id)}>
            <span className="inline-block h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: m.color }} />
            {m.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function GradePicker({ label, grades, value, onChange }: { label: string; grades: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {grades.map((g) => {
          const short = g.match(/(\d+ct)$/)?.[1] ?? g;
          return <Pill key={g} active={value === g} onClick={() => onChange(g)}>{short}</Pill>;
        })}
      </div>
    </div>
  );
}

const Loading = () => (
  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Loading 3D ring…</div>
);

// Customer-facing names for the two Classic fits (internal values stay Court/Flat for supplier SKUs).
const PROFILE_LABELS: Record<string, string> = { Court: "Comfit", Flat: "Standard" };

/** Cross-section sketch: Comfit has a rounded inside, Standard a flat inside. */
function FitDiagram({ comfit }: { comfit: boolean }) {
  const d = comfit
    ? "M4 6 Q20 0 36 6 L36 14 Q20 22 4 14 Z"
    : "M4 6 Q20 0 36 6 L36 18 L4 18 Z";
  return (
    <svg viewBox="0 0 40 30" className="h-24 w-full text-primary" aria-hidden="true">
      <text x="20" y="3.5" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 2.6 }}>OUTSIDE</text>
      <g transform="translate(0 4)">
        <path d={d} className="fill-current" />
        <rect x="2" y="21" width="36" height="4" rx="1" className="fill-muted" />
      </g>
      <text x="20" y="29.5" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 2.6 }}>FINGER SIDE</text>
    </svg>
  );
}

export function RingDesigner({ initialRingId, shared }: { initialRingId?: string; shared?: SharedDesign }) {
  const initial = RINGS.find((r) => r.id === initialRingId) ?? RINGS[0];
  if (!initial) return null;
  return <RingDesignerControls initial={initial} shared={shared ?? {}} />;
}

function RingDesignerControls({ initial, shared }: { initial: Ring; shared: SharedDesign }) {
  const defaults = ringDesignDefaults(initial.id, Object.keys(initial.metals)[0] ?? "");
  const [ring, setRing] = useState<Ring>(initial);
  const pick = (v: string | undefined, list: string[], d: string) => (v && list.includes(v) ? v : d);
  const metalIds = Object.keys(METALS_3D);
  const [twoToneChoice, setTwoTone] = useState(shared.tone ? shared.tone === "2" : defaults.twoTone);
  const [centreMetal, setCentreMetal] = useState(pick(shared.metal, metalIds, defaults.centreMetal));
  const [sideMetal, setSideMetal] = useState(pick(shared.side, metalIds, defaults.sideMetal));
  const [width, setWidth] = useState(Math.min(8, Math.max(3, num(shared.w, 6))));
  const [thickness, setThickness] = useState(Math.min(3, Math.max(1, num(shared.t, DEFAULT_THICKNESS_MM))));
  const [profileChoice, setProfile] = useState(pick(shared.profile, [...PROFILES], defaults.profile));
  // Infinity's own 3D models have a fixed profile, except the eight Classic
  // styles the supplier also prices with a "-Flat" SKU — those may switch.
  const hasModel = !!RING_MODELS[ring.id];
  const classicFlat = hasModel && FLAT_STYLES.has(ring.id);
  const flatDefault = ring.id === "as2" ? "Flat" : "Court"; // AS-2's photo is the flat profile
  const profile = hasModel
    ? classicFlat
      ? profileChoice === "Flat" || profileChoice === "Court" ? profileChoice : flatDefault
      : defaults.profile
    : profileChoice;
  const [finish, setFinish] = useState(pick(shared.finish, FINISHES_3D, "Polished"));
  const [size, setSize] = useState(pick(shared.size, FINGER_SIZES, "P"));
  const [engraving, setEngraving] = useState(cleanEngraving(shared.eng ?? ""));
  const [engravingFontId, setEngravingFontId] = useState<string>(pick(shared.font, ENGRAVING_FONTS.map((f) => f.id), "script"));
  const [stoneChoice, setStone] = useState<string>(shared.stone ?? "");
  const [copied, setCopied] = useState(false);
  const [wantSizer, setWantSizer] = useState(false);
  const [requiredDate, setRequiredDate] = useState("");
  const fmtDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  const isClassic = ring.range === "classic";
  const twoTone = isClassic ? false : twoToneChoice;
  const pattern = ringDesignDefaults(ring.id, Object.keys(ring.metals)[0] ?? "").pattern;
  const profileLabel = (p: string) => (classicFlat ? PROFILE_LABELS[p] ?? p : p);

  const baseSku = PRICED_SKUS[ring.id];
  const priceSku = baseSku ? priceSkuFor(baseSku, profile) : null;
  const tRange = (priceSku && thicknessRange(priceSku, width)) || { min: 1.2, max: 3 };
  const thick = Math.min(tRange.max, Math.max(tRange.min, thickness));
  const widthPriced = !!priceSku && thicknessAvailable(priceSku, width, thick);
  const stoneOpts = priceSku ? skuOptions(priceSku)?.stone : undefined;
  const stone = stoneOpts ? (stoneOpts.types.includes(stoneChoice) ? stoneChoice : stoneOpts.type) : "";
  const stoneSpec = priceSku ? STONE_SPECS[priceSku] : undefined;
  const [stoneSizeChoice, setStoneSize] = useState<number>(0);
  const stoneSize = stoneSpec ? (stoneSpec.sizes.includes(stoneSizeChoice) ? stoneSizeChoice : stoneSpec.defaultSize) : 0;
  const stoneLabel = stone && stoneSpec ? `${stoneSpec.count} × ${stoneSize}mm ${stoneSpec.cut.toLowerCase()}-cut ${stone}` : stone;
  const grades = GRADES_FOR_METAL[centreMetal] ?? [];
  const sideGrades = GRADES_FOR_METAL[sideMetal] ?? [];
  const [gradeChoice, setGrade] = useState<string>("");
  const grade = grades.includes(gradeChoice) ? gradeChoice : DEFAULT_GRADE[centreMetal] ?? "";
  const [sideGradeChoice, setSideGrade] = useState<string>("");
  const sideGrade = sideGrades.includes(sideGradeChoice) ? sideGradeChoice : DEFAULT_GRADE[sideMetal] ?? "";
  const priceConfig = priceSku && widthPriced && grade && (!twoTone || sideGrade)
    ? { sku: priceSku, size, width, thickness: thick, centreMaterial: grade, sideMaterial: twoTone ? sideGrade : grade, ...(stone ? { stoneType: stone, ...(stoneSpec && stoneSpec.sizes.length > 1 ? { stoneSize } : {}) } : {}) }
    : null;
  const price = useRingPrice(priceConfig);

  const summaryRows: [string, string][] = [
    ["Style", ring.name],
    ...(pattern === "greek-key" ? [["Pattern", "Greek key"] as [string, string]] : []),
    ...(twoTone
      ? ([
          ["Centre metal", METALS_3D[centreMetal]?.label ?? centreMetal],
          ["Side metal", METALS_3D[sideMetal]?.label ?? sideMetal],
        ] as [string, string][])
      : ([["Metal", METALS_3D[centreMetal]?.label ?? centreMetal]] as [string, string][])),
    ...(baseSku && !twoTone ? ([["Metal grade", grade]] as [string, string][]) : []),
    ...(baseSku && twoTone ? ([["Centre grade", grade], ["Side grade", sideGrade]] as [string, string][]) : []),
    ["Width", `${width.toFixed(1)}mm`],
    ["Thickness", `${thick.toFixed(1)}mm`],
    ...(stone ? ([["Stones", stoneLabel]] as [string, string][]) : []),
    ...(!hasModel || classicFlat ? ([[classicFlat ? "Fit" : "Profile", profileLabel(profile)]] as [string, string][]) : []),
    ["Finish", finish],
    ["Finger size", wantSizer ? `${size} (free sizer requested)` : size],
    ...(requiredDate ? ([["Date required", fmtDate(requiredDate)]] as [string, string][]) : []),
    ...(engraving.trim() ? ([["Engraving", `“${engraving.trim()}”`], ["Engraving font", engravingFont(engravingFontId).label]] as [string, string][]) : []),
  ];
  const summary = useMemo(() => summaryRows.map(([k, v]) => `${k}: ${v}`).join("\n"), [JSON.stringify(summaryRows)]);

  const mailto = `mailto:workshop@burrowsjewellers.com.au?subject=${encodeURIComponent(
    `Ring enquiry — ${ring.name}`
  )}&body=${encodeURIComponent(
    `Hello Burrows Jewellers,\n\nI'd like to enquire about this ring:\n\n${summary}\n\nName:\nPhone:\n\n(Configured with the online ring designer)`
  )}`;

  const shareDesign = async () => {
    const q = new URLSearchParams({
      metal: centreMetal, tone: twoTone ? "2" : "1", ...(twoTone ? { side: sideMetal } : {}),
      w: String(width), t: thick.toFixed(1), profile, finish, size,
      ...(engraving.trim() ? { eng: engraving.trim(), font: engravingFontId } : {}),
      ...(stone ? { stone } : {}),
    });
    const url = `${window.location.origin}/rings/${ring.id}?${q.toString()}`;
    try {
      if (navigator.share) await navigator.share({ title: `My ${ring.name} design`, url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* user cancelled share */ }
  };

  const canBuy = !!priceConfig && size !== "--" && price.status === "ok";
  const buyRing = async () => {
    if (!priceConfig || buying) return;
    setBuying(true);
    setBuyError("");
    try {
      const attrs: { key: string; value: string }[] = [
        { key: "Style", value: ring.name },
        { key: "Width", value: `${width.toFixed(1)}mm` },
        { key: "Thickness", value: `${thick.toFixed(1)}mm` },
        { key: "Centre metal", value: grade },
        ...(twoTone ? [{ key: "Side metal", value: sideGrade }] : []),
        { key: classicFlat ? "Fit" : "Profile", value: classicFlat ? `${profileLabel(profile)} (${profile})` : profile },
        { key: "Finish", value: finish },
        { key: "Finger size", value: wantSizer ? `${size} (free ring sizer requested — confirm size)` : size },
        ...(requiredDate ? [{ key: "Date required", value: fmtDate(requiredDate) }] : []),
        ...(stone ? [{ key: "Stones", value: stoneLabel }] : []),
        ...(engraving.trim()
          ? [{ key: "Engraving", value: engraving.trim() }, { key: "Engraving font", value: engravingFont(engravingFontId).label }]
          : []),
        ...(price.status === "ok" ? [{ key: "Quoted price (incl GST)", value: aud.format(price.price) }] : []),
      ];
      const checkoutUrl = await createDepositCart(attrs);
      window.open(checkoutUrl, "_blank", "noopener");
    } catch (e) {
      setBuyError(e instanceof Error ? e.message : "Checkout unavailable — please enquire instead");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-2">
      {/* Preview */}
      <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
        {ring.id === "in1915" ? (
          <figure className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={ring.metals.zirconium}
              alt="IN1915 reference photo in black zirconium with black diamonds"
              width={599}
              height={599}
              className="aspect-square w-full object-contain"
            />
            <figcaption className="space-y-2 border-t border-border p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Reference photo: black zirconium with black diamonds.
              </p>
              <p>
                This photo does not change with your selections. Your chosen options are listed in
                Your Ring below.
              </p>
              <p>
                Interactive 3D preview is temporarily unavailable for IN1915. The ring specification
                remains 50 brilliant-cut stones, 1.3mm each.
              </p>
            </figcaption>
          </figure>
        ) : (
          <div className="relative aspect-square min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="absolute inset-0 min-w-0">
              <ClientOnly fallback={<Loading />}>
                <Suspense fallback={<Loading />}>
                  <Ring3D
                    widthMm={width}
                    thicknessMm={thick}
                    stoneColor={stone ? STONE_COLOURS[stone] : undefined}
                    innerDiameterMm={innerDiameterMm(size, FINGER_SIZES)}
                    profile={profile}
                    finish={finish}
                    centreMetal={centreMetal}
                    sideMetal={sideMetal}
                    twoTone={twoTone}
                    pattern={pattern}
                    ringId={ring.id}
                    engravingText={engraving.trim()}
                    engravingFont={engravingFont(engravingFontId).css}
                  />
                </Suspense>
              </ClientOnly>
            </div>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground">
              {width.toFixed(1)}mm
            </span>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="min-w-0 space-y-7">
        <div>
          <Label>Ring style</Label>
          <select
            value={ring.id}
            onChange={(e) => {
              const next = RINGS.find((r) => r.id === e.target.value);
              if (!next) return;
              setRing(next);
              const nextDefaults = ringDesignDefaults(next.id, Object.keys(next.metals)[0] ?? "");
              setCentreMetal(nextDefaults.centreMetal);
              setSideMetal(nextDefaults.sideMetal);
              setTwoTone(nextDefaults.twoTone);
              setProfile(nextDefaults.profile);
            }}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
          >
            <optgroup label="Classic Wedding Bands">
              {RINGS.filter((r) => r.range === "classic").map((r) => (
                <option key={r.id} value={r.id}>{r.displayName ? `${r.displayName} · ${r.name}` : r.name}</option>
              ))}
            </optgroup>
            <optgroup label="Signature Designs">
              {RINGS.filter((r) => r.range !== "classic").map((r) => (
                <option key={r.id} value={r.id}>{r.displayName ? `${r.displayName} · ${r.name}` : r.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {!isClassic && (
          <div>
            <Label>Metal layout</Label>
            <div className="flex flex-wrap gap-2">
              <Pill active={!twoTone} onClick={() => setTwoTone(false)}>Single metal</Pill>
              <Pill active={twoTone} onClick={() => setTwoTone(true)}>Centre &amp; side metals</Pill>
            </div>
          </div>
        )}

        <MetalPicker label={twoTone ? "Centre metal" : "Metal"} value={centreMetal} onChange={setCentreMetal} />
        {baseSku && grades.length > 1 && (
          <GradePicker label={twoTone ? "Centre metal grade" : "Metal grade"} grades={grades} value={grade} onChange={setGrade} />
        )}
        {twoTone && <MetalPicker label="Side metal" value={sideMetal} onChange={setSideMetal} />}
        {twoTone && baseSku && sideGrades.length > 1 && (
          <GradePicker label="Side metal grade" grades={sideGrades} value={sideGrade} onChange={setSideGrade} />
        )}

        <div>
          <Label>Width — {width.toFixed(1)}mm</Label>
          <input
            type="range"
            min={WIDTHS_MM[0]}
            max={WIDTHS_MM[WIDTHS_MM.length - 1]}
            step={0.5}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Ring width"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>3mm</span><span>8mm</span>
          </div>
        </div>

        <div>
          <Label>Thickness — {thick.toFixed(1)}mm</Label>
          <input
            type="range"
            min={tRange.min}
            max={tRange.max}
            step={0.1}
            value={thick}
            onChange={(e) => setThickness(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Ring thickness"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{tRange.min.toFixed(1)}mm · lighter</span><span>{tRange.max.toFixed(1)}mm · heavier</span>
          </div>
        </div>

        {stoneOpts && (
          <div>
            <Label>Stones</Label>
            {stoneSpec && (
              <p className="mb-2 text-sm text-muted-foreground">{stoneSpec.count} {stoneSpec.cut.toLowerCase()}-cut stones{stoneSpec.sizes.length === 1 ? `, ${stoneSize}mm each` : ""}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {stoneOpts.types.map((t) => (
                <Pill key={t} active={stone === t} onClick={() => setStone(t)}>
                  <span className="inline-block h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: STONE_COLOURS[t] }} />
                  {t}
                </Pill>
              ))}
            </div>
            {stoneSpec && stoneSpec.sizes.length > 1 && (
              <div className="mt-4">
                <Label>Stone size</Label>
                <div className="flex flex-wrap gap-2">
                  {stoneSpec.sizes.map((mm) => (
                    <Pill key={mm} active={stoneSize === mm} onClick={() => setStoneSize(mm)}>{mm}mm</Pill>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(!hasModel || classicFlat) && (
          <div>
            <Label>{classicFlat ? "Fit" : "Profile"}</Label>
            {classicFlat ? (
              <div className="grid grid-cols-2 gap-3">
                {["Flat", "Court"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProfile(p)}
                    aria-pressed={profile === p}
                    className={`rounded-xl border p-3 text-left transition-colors ${profile === p ? "border-primary bg-secondary ring-1 ring-primary" : "border-border bg-card hover:border-primary/50"}`}
                  >
                    <FitDiagram comfit={p === "Court"} />
                    <p className="mt-2 text-sm font-medium text-foreground">{profileLabel(p)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p === "Court"
                        ? "Rounded inside. Slides over the knuckle easily and feels lighter to wear."
                        : "Flat inside. The traditional fit, sitting snug against the finger."}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...PROFILES].map((p) => (
                  <Pill key={p} active={profile === p} onClick={() => setProfile(p)}>{p}</Pill>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <Label>Finish</Label>
          <div className="flex flex-wrap gap-2">
            {FINISHES_3D.map((f) => (
              <Pill key={f} active={finish === f} onClick={() => setFinish(f)}>{f}</Pill>
            ))}
          </div>
        </div>

        <div>
          <Label>Engraving (inside the band, no extra cost)</Label>
          <input
            type="text"
            value={engraving}
            maxLength={ENGRAVING_MAX}
            onChange={(e) => { setEngraving(cleanEngraving(e.target.value)); }}
            placeholder="e.g. Forever yours · 10.10.2026"
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">{engraving.length}/{ENGRAVING_MAX} characters</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ENGRAVING_FONTS.map((f) => (
              <Pill key={f.id} active={engravingFontId === f.id} onClick={() => setEngravingFontId(f.id)}>
                <span style={{ fontFamily: f.css }}>{f.label}</span>
              </Pill>
            ))}
          </div>
        </div>


        <div>
          <div className="flex items-baseline justify-between">
            <Label>Finger size</Label>
            <SizeGuide />
          </div>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
          >
            {FINGER_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label className="mt-3 flex items-start gap-2 text-sm text-foreground">
            <input type="checkbox" checked={wantSizer} onChange={(e) => setWantSizer(e.target.checked)} className="mt-0.5 accent-primary" />
            <span>Not sure of your size? Post me a free ring sizer. <span className="text-muted-foreground">We'll confirm your size before your ring is made.</span></span>
          </label>
        </div>

        <div>
          <Label>Wedding date or date required</Label>
          <input
            type="date"
            value={requiredDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setRequiredDate(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">Optional. Each ring is made to order, so this helps us plan to have it ready in time.</p>
        </div>

        <div className="rounded-xl border border-border bg-secondary p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your ring</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {summaryRows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {baseSku && (
            <div className="mt-4 border-t border-border pt-4 text-sm" aria-live="polite">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Supplier RRP</span>
                <span className="text-lg font-medium">
                  {!priceSku ? "Not priced for this profile"
                    : !widthPriced ? "Width not listed for this style"
                    : price.status === "ok" ? aud.format(price.price)
                    : price.status === "unavailable" ? "Price unavailable" : "Checking…"}
                </span>
              </div>
              {price.status === "ok" && (
                <p className="mt-1 text-xs text-muted-foreground">Checked {new Date(price.checkedAt).toLocaleString("en-AU")}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">Indicative retail price. Includes GST. Finishes and engraving at no extra cost.</p>
              {size === "--" && <p className="mt-1 text-xs text-muted-foreground">Select your ring size for a final quote</p>}
            </div>
          )}
          <Button onClick={buyRing} disabled={!canBuy || buying} className="mt-5 w-full">
            {buying ? "Preparing checkout…" : `Pay $${DEPOSIT_AUD} deposit`}
          </Button>
          {buyError && <p className="mt-2 text-center text-xs text-destructive">{buyError}</p>}
          {size === "--" && <p className="mt-2 text-center text-xs text-muted-foreground">Select your ring size to purchase</p>}
          <a
            href={mailto}
            className="mt-3 block rounded-md border border-input bg-card px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Enquire about this ring
          </a>
          <Button variant="outline" onClick={shareDesign} className="mt-3 w-full">
            {copied ? "Link copied — paste it anywhere" : "Save or share this design"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Made to order. The ${DEPOSIT_AUD} deposit secures your order and comes off the final price — we'll confirm everything in store before crafting begins.</p>
        </div>
      </div>
    </div>
  );
}
