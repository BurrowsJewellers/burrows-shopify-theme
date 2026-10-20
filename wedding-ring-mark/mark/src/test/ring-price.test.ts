import { describe, expect, it } from "vitest";
import { buildSupplierUrl, parseSupplierPrice, priceSkuFor, validatePriceConfig } from "../lib/pricing/ring-price";

const base = { sku: "AC", size: "--", width: 6, thickness: 1.4, centreMaterial: "White Gold 9ct", sideMaterial: "White Gold 9ct" };

describe("ring pricing", () => {
  it("encodes the verified AC request exactly", () => {
    expect(buildSupplierUrl(validatePriceConfig(base))).toBe(
      "https://www.infinityorders.com.au/api/v1/pricePublic/461?SKU=AC&size=--&fingerSize=--&width=6&thickness=1.4&metalZones%5B0%5D%5Bid%5D=1&metalZones%5B0%5D%5Bmaterial%5D=White+Gold+9ct&metalZones%5B1%5D%5Bid%5D=2&metalZones%5B1%5D%5Bmaterial%5D=White+Gold+9ct&additionalData%5Bstore_id%5D=461",
    );
  });
  it("sends the same size in both fields and preserves + and fractions", () => {
    const u = new URL(buildSupplierUrl(validatePriceConfig({ ...base, size: "Z+11/2" })));
    expect(u.searchParams.get("size")).toBe("Z+11/2");
    expect(u.searchParams.get("fingerSize")).toBe("Z+11/2");
    expect(new URL(buildSupplierUrl(validatePriceConfig({ ...base, size: "T1/2" }))).searchParams.get("size")).toBe("T1/2");
  });
  it("prices two-tone rings with separate zone materials", () => {
    const u = new URL(buildSupplierUrl(validatePriceConfig({ ...base, centreMaterial: "Platinum 950", sideMaterial: "Yellow Gold 9ct" })));
    expect(u.searchParams.get("metalZones[0][material]")).toBe("Platinum 950");
    expect(u.searchParams.get("metalZones[1][material]")).toBe("Yellow Gold 9ct");
  });
  it("maps profiles to supplier SKUs where Infinity lists them", () => {
    expect(priceSkuFor("AC", "Court")).toBe("AC");
    expect(priceSkuFor("AC", "Flat")).toBe("AC-Flat");
    expect(priceSkuFor("FB", "Flat")).toBeNull(); // supplier lists no FB-Flat
    expect(priceSkuFor("AS", "Bevelled")).toBeNull();
  });
  it("rejects unsupported values and fields", () => {
    expect(() => validatePriceConfig({ ...base, sku: "ZZ" })).toThrow();
    expect(() => validatePriceConfig({ ...base, width: 6.2 })).toThrow();
    expect(() => validatePriceConfig({ ...base, width: 8, thickness: 1.4 })).toThrow(); // min 1.5 at 8mm
    expect(() => validatePriceConfig({ ...base, centreMaterial: "WG9" })).toThrow();
    expect(() => validatePriceConfig({ ...base, size: "A" })).toThrow();
    expect(() => validatePriceConfig({ ...base, storeId: "1" })).toThrow();
  });
  it("rejects invalid supplier prices", () => {
    expect(parseSupplierPrice({ price: 1865 })).toBe(1865);
    for (const b of [{ price: 0 }, { price: -5 }, { price: "1865" }, {}, null]) expect(() => parseSupplierPrice(b)).toThrow();
  });
});
