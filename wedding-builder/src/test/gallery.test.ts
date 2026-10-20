import { describe, expect, it } from "vitest";
import { COLLECTIONS, collectionsFor, ringsIn, tilePhoto } from "../data/collections";
import { RINGS } from "../data/rings";
import { fromLabel, gallerySku } from "../components/Gallery";

describe("gallery collections", () => {
  it("every style sits in at least one collection, every member is a real style", () => {
    for (const r of RINGS) expect(collectionsFor(r.id).length, r.id).toBeGreaterThan(0);
    const ids = new Set(RINGS.map((r) => r.id));
    for (const c of COLLECTIONS) for (const r of ringsIn(c.id)) expect(ids.has(r.id), `${c.id}: ${r.id}`).toBe(true);
  });
  it("'All' lists each style once, plain bands first; the chips add up to at least the catalogue", () => {
    const all = ringsIn("");
    expect(all.length).toBe(RINGS.length);
    expect(new Set(all.map((r) => r.id)).size).toBe(RINGS.length);
    expect(all.slice(0, 9).every((r) => r.range === "classic")).toBe(true);
    expect(ringsIn("plain").length).toBe(9);
    expect(ringsIn("diamond").map((r) => r.id).sort()).toEqual(["in1915", "in6004", "in6010"]);
    expect(collectionsFor("in1004")).toEqual(["patterned", "two-tone"]);
    expect(COLLECTIONS.reduce((n, c) => n + ringsIn(c.id).length, 0)).toBeGreaterThanOrEqual(RINGS.length);
  });
  it("tiles prefer the yellow gold photo", () => {
    expect(tilePhoto(RINGS.find((r) => r.id === "ab2")!)).toMatch(/yellow-gold/);
    expect(tilePhoto(RINGS.find((r) => r.id === "ad7")!)).toMatch(/AD-7/);
  });
});

describe("from prices", () => {
  it("every style but IN1076 prices under the SKU the designer first opens with", () => {
    for (const r of RINGS) {
      const sku = gallerySku(r);
      if (r.id === "in1076") expect(sku).toBeNull();
      else expect(sku, r.id).toBeTruthy();
    }
    expect(gallerySku(RINGS.find((r) => r.id === "as2")!)).toBe("AS-Flat"); // AS-2's photo is the flat profile
    expect(gallerySku(RINGS.find((r) => r.id === "in1915")!)).toBe("IN1915D");
  });
  it("labels: from $, enquiry, waiting, missing", () => {
    const ac6 = RINGS.find((r) => r.id === "ac6")!;
    const ok = { status: "ok" as const, prices: { AC: { price: 965, width: 3, thickness: 1.6 } }, checkedAt: null };
    expect(fromLabel(ac6, ok).text).toBe("from $965");
    expect(fromLabel(RINGS.find((r) => r.id === "ab2")!, ok).text).toBe("Priced on enquiry");
    expect(fromLabel(RINGS.find((r) => r.id === "in1076")!, ok).text).toBe("Priced on enquiry");
    expect(fromLabel(ac6, { status: "loading" }).text).toBe("…");
    expect(fromLabel(ac6, { status: "unavailable" }).text).toBe("");
  });
});
