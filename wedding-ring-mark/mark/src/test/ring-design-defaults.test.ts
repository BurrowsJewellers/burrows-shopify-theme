import { describe, expect, it } from "vitest";
import { ringDesignDefaults } from "../lib/ring-3d-options";

describe("Photo-matched ring defaults", () => {
  it("opens IN1004 with a gold Greek-key centre and white-gold rails", () => {
    expect(ringDesignDefaults("in1004", "gold")).toMatchObject({
      centreMetal: "yellow-gold", sideMetal: "white-gold", twoTone: true, pattern: "greek-key",
    });
  });
  it("does not carry the signature pattern or rails onto a Classic band", () => {
    expect(ringDesignDefaults("ab2", "platinum")).toMatchObject({
      centreMetal: "platinum", twoTone: false, pattern: "plain",
    });
  });
});