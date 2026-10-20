import { describe, expect, it } from "vitest";
import { bevelProfilePoints } from "../lib/ring-bevel-profile";

describe("AS-2 bevel cross-section", () => {
  it.each([3, 6, 8])("has no flat radial end face at %s mm width", (width) => {
    const points = bevelProfilePoints(9, width, 1.6, -1, 1);
    for (const edge of [-width / 2, width / 2]) {
      const endRadii = points.filter(([, y]) => y === edge).map(([r]) => r);
      expect(endRadii.length).toBeGreaterThan(0);
      expect(endRadii.every((r) => r === 9)).toBe(true);
    }
    expect(points.filter(([r]) => r === 10.6)).toHaveLength(4);
  });
  it("preserves coincident boundaries when split into metal zones", () => {
    const left = bevelProfilePoints(9, 6, 1.6, -1, -0.65);
    const centre = bevelProfilePoints(9, 6, 1.6, -0.65, 0.65);
    expect(left.filter(([, y]) => y === -1.95)).toEqual(expect.arrayContaining(centre.filter(([, y]) => y === -1.95)));
  });
});