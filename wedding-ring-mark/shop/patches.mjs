// The only changes made to Mark's code, applied at build time to mark/src/components/RingDesigner.tsx (his file on
// disk stays exactly as in his repo). Each `find` must occur exactly once, or the build stops: if Mark changes one
// of these lines, the build says which patch to look at instead of silently doing something else.
//
// For customers the page is his, unchanged, except that: the share link and the order's design link point at the
// website; Pay deposit sends the design to the shop's cart (shop/cart.ts) with the supplier SKU and the design link.
// Everything else here only applies in staff mode (?staff=1, the dashboard's order review).

const QUERY = `new URLSearchParams({
        metal: centreMetal, tone: twoTone ? "2" : "1", ...(twoTone ? { side: sideMetal } : {}),
        w: String(width), t: thick.toFixed(1), profile, finish, size,
        ...(engraving.trim() ? { eng: engraving.trim(), font: engravingFontId } : {}),
        ...(stone ? { stone } : {}),
        ...(grade ? { grade } : {}), ...(twoTone && sideGrade ? { sgrade: sideGrade } : {}),
        ...(stoneSpec && stoneSpec.sizes.length > 1 ? { ssize: String(stoneSize) } : {}),
        ...(wantSizer ? { sizer: "1" } : {}), ...(requiredDate ? { date: requiredDate } : {}),
      })`;

export const RING_DESIGNER_PATCHES = [
  {
    why: "Share link: the website's designer page instead of his /rings/<id> route",
    find: "const url = `${window.location.origin}/rings/${ring.id}?${q.toString()}`;",
    replace: "const url = __shop.designUrl(ring.id, q);",
  },
  {
    why: "Pay deposit: pass the design along (the shop cart adapter adds the SKU and design link; staff mode sends it to the dashboard)",
    find: "const checkoutUrl = await createDepositCart(attrs);",
    replace: `const checkoutUrl = await createDepositCart(attrs, { ringId: ring.id, sku: priceSku, priceConfig, price: price.status === "ok" ? price.price : undefined, summary: summaryRows, query: ${QUERY} });`,
  },
  {
    why: "Order links carry the grade, stone size, sizer and date his share link leaves out, so staff reopen exactly what was ordered",
    find: 'const [gradeChoice, setGrade] = useState<string>("");',
    replace: 'const [gradeChoice, setGrade] = useState<string>(__shop.extra.grade ?? "");',
  },
  {
    find: 'const [sideGradeChoice, setSideGrade] = useState<string>("");',
    replace: 'const [sideGradeChoice, setSideGrade] = useState<string>(__shop.extra.sgrade ?? "");',
  },
  {
    find: "const [stoneSizeChoice, setStoneSize] = useState<number>(0);",
    replace: "const [stoneSizeChoice, setStoneSize] = useState<number>(__shop.extra.ssize ?? 0);",
  },
  {
    find: "const [wantSizer, setWantSizer] = useState(false);",
    replace: "const [wantSizer, setWantSizer] = useState(__shop.extra.sizer);",
  },
  {
    find: 'const [requiredDate, setRequiredDate] = useState("");',
    replace: "const [requiredDate, setRequiredDate] = useState(__shop.extra.date);",
  },
  {
    why: "Staff: keep any supplier width from the order (customers: his 3-8 mm clamp)",
    find: "const [width, setWidth] = useState(Math.min(8, Math.max(3, num(shared.w, 6))));",
    replace: "const [width, setWidth] = useState(__shop.STAFF ? num(shared.w, 6) : Math.min(8, Math.max(3, num(shared.w, 6))));",
  },
  {
    why: "Staff: quarter sizes",
    find: 'const [size, setSize] = useState(pick(shared.size, FINGER_SIZES, "P"));',
    replace: 'const [size, setSize] = useState(pick(shared.size, __shop.STAFF ? __shop.SUPPLIER_SIZES : FINGER_SIZES, "P"));',
  },
  {
    find: "innerDiameterMm={innerDiameterMm(size, FINGER_SIZES)}",
    replace: "innerDiameterMm={innerDiameterMm(__shop.letter(size), FINGER_SIZES)}",
  },
  {
    find: "{FINGER_SIZES.map((s) => (\n              <option key={s} value={s}>{s}</option>",
    replace: "{(__shop.STAFF ? __shop.SUPPLIER_SIZES : FINGER_SIZES).map((s) => (\n              <option key={s} value={s}>{s}</option>",
  },
  {
    why: "Staff: the width slider covers every supplier width in 0.1 mm steps",
    find: "min={WIDTHS_MM[0]}\n            max={WIDTHS_MM[WIDTHS_MM.length - 1]}\n            step={0.5}",
    replace: "min={__shop.STAFF && __shop.widths(priceSku).length ? __shop.widths(priceSku)[0] : WIDTHS_MM[0]}\n            max={__shop.STAFF && __shop.widths(priceSku).length ? __shop.widths(priceSku)[__shop.widths(priceSku).length - 1] : WIDTHS_MM[WIDTHS_MM.length - 1]}\n            step={__shop.STAFF ? 0.1 : 0.5}",
  },
  {
    why: "Staff: the supplier SKU in Your ring",
    find: "  const summary = useMemo(",
    replace: '  if (__shop.STAFF) summaryRows.push(["Supplier SKU", priceSku ?? "none"]);\n  const summary = useMemo(',
  },
  {
    why: "Staff: a 'Staff review' tag on the preview",
    find: '<span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground">',
    replace: '{__shop.STAFF && <span className="pointer-events-none absolute rounded-full bg-background/80 px-3 py-1 text-xs text-foreground" style={{ left: 12, top: 12 }}>Staff review{__shop.ORDER ? ` · ${__shop.ORDER}` : ""}</span>}<span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground">',
  },
  {
    why: "Staff: the deposit button reads Save to order",
    find: '{buying ? "Preparing checkout…" : `Pay $${DEPOSIT_AUD} deposit`}',
    replace: '{__shop.STAFF ? (buying ? "Saving…" : "Save to order") : buying ? "Preparing checkout…" : `Pay $${DEPOSIT_AUD} deposit`}',
  },
];

export function applyPatches(code, patches, file) {
  let out = code;
  for (const p of patches) {
    const n = out.split(p.find).length - 1;
    if (n !== 1) throw new Error(`[wedding-ring-mark] patch not applied to ${file}: expected 1 match, found ${n}.\n  find: ${p.find.slice(0, 160)}\n  (Mark's code changed here; update shop/patches.mjs)`);
    out = out.replace(p.find, () => p.replace);
  }
  return out;
}
