import { describe, expect, it } from "vitest";
import { cartProperties, defaultDesign, derive, designFromParams, designToParams, summaryRows } from "../lib/design";
import { RINGS } from "../data/rings";
import { RING_MODELS } from "../data/ring-models";

describe("catalogue", () => {
  it("has 53 unique styles, each with a model and a photo on the Shopify CDN", () => {
    expect(RINGS.length).toBe(53);
    expect(new Set(RINGS.map((r) => r.id)).size).toBe(53);
    for (const r of RINGS) {
      expect(RING_MODELS[r.id], r.id).toBeDefined();
      expect(RING_MODELS[r.id]!.url).toMatch(/^https:\/\/cdn\.shopify\.com\/3d\/models\/[0-9a-f]+\/wr-[a-z0-9]+\.glb$/);
      for (const url of Object.values(r.metals)) expect(url).toMatch(/^https:\/\/cdn\.shopify\.com\/s\/files\//);
    }
  });
});

describe("design", () => {
  it("defaults follow the style's photo metal and layout", () => {
    const d = derive(defaultDesign("in1004"));
    expect(d.twoTone).toBe(true);
    expect(d.metal).toBe("yellow-gold");
    expect(d.side).toBe("white-gold");
    expect(d.pattern).toBe("greek-key");
    expect(d.priceConfig?.sku).toBe("IN1004");
  });
  it("classics switch between Court and Flat SKUs and never price other profiles", () => {
    const court = derive(defaultDesign("ac6"));
    expect(court.priceSku).toBe("AC");
    expect(court.fitLabel).toBe("Comfit");
    const flat = derive({ ...defaultDesign("ac6"), profile: "Flat" });
    expect(flat.priceSku).toBe("AC-Flat");
    expect(flat.fitLabel).toBe("Standard");
    const odd = derive({ ...defaultDesign("ac6"), profile: "Bevelled" });
    expect(odd.profile).toBe("Court"); // falls back to the style's default
  });
  it("clamps thickness into the supplier's range for the width", () => {
    const d = derive({ ...defaultDesign("ab2"), width: 6, thickness: 0.5 });
    expect(d.thickness).toBe(1.4);
    const e = derive({ ...defaultDesign("ab2"), width: 6, thickness: 9 });
    expect(e.thickness).toBe(3);
  });
  it("a width the style is not made in gives no price request and a reason", () => {
    const d = derive({ ...defaultDesign("in6010"), width: 3 });
    expect(d.priceConfig).toBeNull();
    expect(d.unpriced).toBe("Width not listed for this style");
  });
  it("IN1076 is priced on enquiry", () => {
    const d = derive(defaultDesign("in1076"));
    expect(d.priceConfig).toBeNull();
    expect(d.unpriced).toBe("Priced on enquiry");
  });
  it("diamond styles carry the stone choice and size", () => {
    const d = derive({ ...defaultDesign("in6004"), stone: "Ruby", stoneSize: 2.3 });
    expect(d.priceConfig).toMatchObject({ sku: "IN6004D", stoneType: "Ruby", stoneSize: 2.3 });
    expect(d.stoneLabel).toBe("6 × 2.3mm brilliant-cut Ruby");
    const bad = derive({ ...defaultDesign("in6004"), stone: "Emerald", stoneSize: 9 });
    expect(bad.stone).toBe("Black Diamond"); // the supplier default for this SKU
    expect(bad.stoneSize).toBe(1.7);
  });
  it("round-trips through the URL", () => {
    const design = { ...defaultDesign("ab2"), metal: "yellow-gold", grade: "Yellow Gold 18ct", width: 5, thickness: 1.6, profile: "Flat", finish: "Brushed", size: "R", engraving: "Forever yours 10.10.2026", font: "roman", sizer: true, date: "2027-03-20" };
    const q = designToParams(design, derive(design));
    expect(q.get("ring")).toBe("ab2");
    expect(q.get("grade")).toBe("Yellow Gold 18ct");
    const back = designFromParams(q)!;
    expect(derive(back).priceConfig).toEqual(derive(design).priceConfig);
    expect(back.engraving).toBe("Forever yours 10.10.2026");
    expect(back.font).toBe("roman");
    expect(back.sizer).toBe(true);
    expect(back.date).toBe("2027-03-20");
    expect(derive(back).finish).toBe("Brushed");
  });
  it("ignores rubbish in the URL", () => {
    expect(designFromParams(new URLSearchParams("ring=nope"))).toBeNull();
    const d = derive(designFromParams(new URLSearchParams("ring=ab2&metal=lead&w=99&t=-1&size=ZZ&finish=Glossy&font=comic&date=yesterday&eng=%3Cscript%3E"))!);
    expect(d.metal).toBe("yellow-gold");
    expect(d.width).toBe(8);
    expect(d.size).toBe("P");
    expect(d.finish).toBe("Polished");
    expect(d.font.id).toBe("script");
    expect(d.engraving).toBe("script");
  });
  it("summary and cart properties say the same thing", () => {
    const design = { ...defaultDesign("in6004"), stone: "Ruby", stoneSize: 2.3, engraving: "M & J", sizer: true };
    const d = derive(design);
    const rows = Object.fromEntries(summaryRows(design, d));
    expect(rows["Stones"]).toBe("6 × 2.3mm brilliant-cut Ruby");
    expect(rows["Finger size"]).toBe("P (free sizer requested)");
    const props = cartProperties(design, d, { price: "$4,500", link: "https://x/y?ring=in6004", preview: "https://api/preview/a.jpg" });
    expect(props["Style"]).toBe("IN6004 Diamond Band · 6 Stones");
    expect(props["Stones"]).toBe("6 × 2.3mm brilliant-cut Ruby");
    expect(props["Engraving"]).toBe("M & J");
    expect(props["Quoted price (incl GST)"]).toBe("$4,500");
    expect(props["_Supplier SKU"]).toBe("IN6004D");
    expect(props["_Preview"]).toBe("https://api/preview/a.jpg");
    expect(props["Design link"]).toBe("https://x/y?ring=in6004");
    expect(props["Finger size"]).toContain("free ring sizer requested");
  });
});

describe("staff mode", () => {
  it("accepts quarter sizes and any supplier width; customers get neither", () => {
    const design = { ...defaultDesign("ac6"), size: "P1/2", width: 2.7 };
    const staff = derive(design, { staff: true });
    expect(staff.size).toBe("P1/2");
    expect(staff.width).toBe(2.7);
    expect(staff.priceConfig).toMatchObject({ sku: "AC", size: "P1/2", width: 2.7 });
    expect(staff.supplierWidths).toContain(10);
    const cust = derive(design);
    expect(cust.size).toBe("P");
    expect(cust.width).toBe(3);
    const q = designToParams(design, staff);
    expect(designFromParams(q, { staff: true })!.size).toBe("P1/2");
    expect(derive(designFromParams(q)!).size).toBe("P");
  });
});
