// Generated from Infinity's public option list (projects.viscircle.com/infinity/api/list), snapshot 2026-10-10.
// Review before production; not a live catalogue. FB has no -Flat profile listed by the supplier.

export type SkuOptions = {
  /** Stone set priced with the ring (diamond "D" variants). Carat is per-stone default as Infinity's site uses. */
  stone?: { name: string; type: string; size: number; carat: number; types: string[] };
  widths: number[];
  /** Thickness limits per width, from the supplier's min/max table. */
  thicknessLimits: { width: number; min: number; max: number }[];
  materials: string[];
};

export const SKU_OPTIONS: Record<string, SkuOptions> = {
  "AB": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":2.6,"min":1.3,"max":2.5},{"width":2.7,"min":1.3,"max":2.5},{"width":2.8,"min":1.3,"max":2.5},{"width":2.9,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AC": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":2.6,"min":1.3,"max":2.5},{"width":2.7,"min":1.3,"max":2.5},{"width":2.8,"min":1.3,"max":2.5},{"width":2.9,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AD": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":2.6,"min":1.3,"max":2.5},{"width":2.7,"min":1.3,"max":2.5},{"width":2.8,"min":1.3,"max":2.5},{"width":2.9,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AG": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.2,"max":2.5},{"width":2.6,"min":1.2,"max":2.5},{"width":2.7,"min":1.2,"max":2.5},{"width":2.8,"min":1.2,"max":2.5},{"width":2.9,"min":1.2,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.2,"max":2.2},{"width":4,"min":1.2,"max":2.5},{"width":4.5,"min":1.2,"max":2.5},{"width":5,"min":1.2,"max":2.5},{"width":5.5,"min":1.2,"max":2.5},{"width":6,"min":1.3,"max":3},{"width":6.5,"min":1.3,"max":3},{"width":7,"min":1.3,"max":3},{"width":7.5,"min":1.4,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.5,"max":3},{"width":9.5,"min":1.5,"max":3},{"width":10,"min":1.5,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AH": {
    widths: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.4,"max":2},{"width":3,"min":1.4,"max":2},{"width":3.5,"min":1.4,"max":2.2},{"width":4,"min":1.5,"max":2.5},{"width":4.5,"min":1.5,"max":2.5},{"width":5,"min":1.5,"max":2.5},{"width":5.5,"min":1.5,"max":2.5},{"width":6,"min":1.6,"max":3},{"width":6.5,"min":1.6,"max":3},{"width":7,"min":1.7,"max":3},{"width":7.5,"min":1.7,"max":3},{"width":8,"min":1.8,"max":3},{"width":8.5,"min":1.8,"max":3},{"width":9,"min":1.9,"max":3},{"width":9.5,"min":1.9,"max":3},{"width":10,"min":2,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AK": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
    thicknessLimits: [{"width":2.5,"min":1.4,"max":2},{"width":3,"min":1.4,"max":2},{"width":3.5,"min":1.4,"max":2.2},{"width":4,"min":1.4,"max":2.5},{"width":4.5,"min":1.4,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.5,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.6,"max":3},{"width":8,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AS": {
    widths: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.4,"max":2},{"width":3,"min":1.4,"max":2},{"width":3.5,"min":1.4,"max":2.2},{"width":4,"min":1.4,"max":2.5},{"width":4.5,"min":1.4,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.5,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.6,"max":3},{"width":8,"min":1.6,"max":3},{"width":8.5,"min":1.7,"max":3},{"width":9,"min":1.7,"max":3},{"width":9.5,"min":1.8,"max":3},{"width":10,"min":1.8,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "EA": {
    widths: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "FB": {
    widths: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.4,"max":2},{"width":3,"min":1.4,"max":2},{"width":3.5,"min":1.4,"max":2.2},{"width":4,"min":1.5,"max":2.5},{"width":4.5,"min":1.5,"max":2.5},{"width":5,"min":1.5,"max":2.5},{"width":5.5,"min":1.5,"max":2.5},{"width":6,"min":1.6,"max":3},{"width":6.5,"min":1.6,"max":3},{"width":7,"min":1.7,"max":3},{"width":7.5,"min":1.7,"max":3},{"width":8,"min":1.8,"max":3},{"width":8.5,"min":1.8,"max":3},{"width":9,"min":1.9,"max":3},{"width":9.5,"min":1.9,"max":3},{"width":10,"min":2,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AB-Flat": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":2.6,"min":1.3,"max":2.5},{"width":2.7,"min":1.3,"max":2.5},{"width":2.8,"min":1.3,"max":2.5},{"width":2.9,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AC-Flat": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":2.6,"min":1.3,"max":2.5},{"width":2.7,"min":1.3,"max":2.5},{"width":2.8,"min":1.3,"max":2.5},{"width":2.9,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AD-Flat": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":2.6,"min":1.3,"max":2.5},{"width":2.7,"min":1.3,"max":2.5},{"width":2.8,"min":1.3,"max":2.5},{"width":2.9,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AG-Flat": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.2,"max":2.5},{"width":2.6,"min":1.2,"max":2.5},{"width":2.7,"min":1.2,"max":2.5},{"width":2.8,"min":1.2,"max":2.5},{"width":2.9,"min":1.2,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.2,"max":2.2},{"width":4,"min":1.2,"max":2.5},{"width":4.5,"min":1.2,"max":2.5},{"width":5,"min":1.2,"max":2.5},{"width":5.5,"min":1.2,"max":2.5},{"width":6,"min":1.3,"max":3},{"width":6.5,"min":1.3,"max":3},{"width":7,"min":1.3,"max":3},{"width":7.5,"min":1.4,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.5,"max":3},{"width":9.5,"min":1.5,"max":3},{"width":10,"min":1.5,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AH-Flat": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.4,"max":2},{"width":3,"min":1.4,"max":2},{"width":3.5,"min":1.4,"max":2.2},{"width":4,"min":1.5,"max":2.5},{"width":4.5,"min":1.5,"max":2.5},{"width":5,"min":1.5,"max":2.5},{"width":5.5,"min":1.5,"max":2.5},{"width":6,"min":1.6,"max":3},{"width":6.5,"min":1.6,"max":3},{"width":7,"min":1.7,"max":3},{"width":7.5,"min":1.7,"max":3},{"width":8,"min":1.8,"max":3},{"width":8.5,"min":1.8,"max":3},{"width":9,"min":1.9,"max":3},{"width":9.5,"min":1.9,"max":3},{"width":10,"min":2,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AK-Flat": {
    widths: [2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
    thicknessLimits: [{"width":2.5,"min":1.4,"max":2},{"width":3,"min":1.4,"max":2},{"width":3.5,"min":1.4,"max":2.2},{"width":4,"min":1.4,"max":2.5},{"width":4.5,"min":1.4,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.5,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.6,"max":3},{"width":8,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "AS-Flat": {
    widths: [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 2.5],
    thicknessLimits: [{"width":2.5,"min":1.4,"max":2},{"width":3,"min":1.4,"max":2},{"width":3.5,"min":1.4,"max":2.2},{"width":4,"min":1.4,"max":2.5},{"width":4.5,"min":1.4,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.5,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.6,"max":3},{"width":8,"min":1.6,"max":3},{"width":8.5,"min":1.7,"max":3},{"width":9,"min":1.7,"max":3},{"width":9.5,"min":1.8,"max":3},{"width":10,"min":1.8,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "EA-Flat": {
    widths: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width":2.5,"min":1.3,"max":2.5},{"width":3,"min":1.3,"max":2.5},{"width":3.5,"min":1.3,"max":2.5},{"width":4,"min":1.3,"max":2.5},{"width":4.5,"min":1.3,"max":2.5},{"width":5,"min":1.4,"max":2.5},{"width":5.5,"min":1.4,"max":2.5},{"width":6,"min":1.4,"max":3},{"width":6.5,"min":1.4,"max":3},{"width":7,"min":1.5,"max":3},{"width":7.5,"min":1.5,"max":3},{"width":8,"min":1.5,"max":3},{"width":8.5,"min":1.5,"max":3},{"width":9,"min":1.6,"max":3},{"width":9.5,"min":1.6,"max":3},{"width":10,"min":1.6,"max":3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
};

/** Finger sizes the supplier accepts (identical across the Classic range; plain format). */
export const SUPPLIER_SIZES: string[] = ["F", "F1/4", "F1/2", "F3/4", "G", "G1/4", "G1/2", "G3/4", "H", "H1/4", "H1/2", "H3/4", "I", "I1/4", "I1/2", "I3/4", "J", "J1/4", "J1/2", "J3/4", "K", "K1/4", "K1/2", "K3/4", "L", "L1/4", "L1/2", "L3/4", "M", "M1/4", "M1/2", "M3/4", "N", "N1/4", "N1/2", "N3/4", "O", "O1/4", "O1/2", "O3/4", "P", "P1/4", "P1/2", "P3/4", "Q", "Q1/4", "Q1/2", "Q3/4", "R", "R1/4", "R1/2", "R3/4", "S", "S1/4", "S1/2", "S3/4", "T", "T1/4", "T1/2", "T3/4", "U", "U1/4", "U1/2", "U3/4", "V", "V1/4", "V1/2", "V3/4", "W", "W1/4", "W1/2", "W3/4", "X", "X1/4", "X1/2", "X3/4", "Y", "Y1/4", "Y1/2", "Y3/4", "Z", "Z1/4", "Z1/2", "Z3/4", "Z+1", "Z+11/4", "Z+11/2", "Z+13/4", "Z+2", "Z+21/4", "Z+21/2", "Z+23/4", "Z+3", "Z+31/4", "Z+31/2", "Z+33/4", "Z+4", "Z+41/4", "Z+41/2", "Z+43/4", "Z+5", "Z+51/4", "Z+51/2", "Z+53/4", "Z+6", "Z+61/4", "Z+61/2", "Z+63/4", "Z+7", "Z+71/4", "Z+71/2", "Z+73/4", "Z+8", "Z+81/4", "Z+81/2", "Z+83/4", "Z+9", "Z+91/4", "Z+91/2", "Z+93/4", "Z+10"];

// Signature (IN####) styles — same supplier list API; widthOptions/minMaxThickness normalised to the shared shape.
export const SIGNATURE_SKU_OPTIONS: Record<string, SkuOptions> = {
  "IN1004": {
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 5, "min": 1, "max": 2.5}, {"width": 5.5, "min": 1, "max": 2.5}, {"width": 6, "min": 1, "max": 3}, {"width": 6.5, "min": 1, "max": 3}, {"width": 7, "min": 1, "max": 3}, {"width": 7.5, "min": 1.5, "max": 3}, {"width": 8, "min": 1.5, "max": 3}, {"width": 8.5, "min": 1.5, "max": 3}, {"width": 9, "min": 1.5, "max": 3}, {"width": 9.5, "min": 1.5, "max": 3}, {"width": 10, "min": 1.5, "max": 3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1008": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 4, "min": 1, "max": 2.5}, {"width": 4.5, "min": 1, "max": 2.5}, {"width": 5, "min": 1, "max": 2.5}, {"width": 5.5, "min": 1, "max": 2.5}, {"width": 6, "min": 1, "max": 3}, {"width": 6.5, "min": 1, "max": 3}, {"width": 7, "min": 1, "max": 3}, {"width": 7.5, "min": 1.5, "max": 3}, {"width": 8, "min": 1.5, "max": 3}, {"width": 8.5, "min": 1.5, "max": 3}, {"width": 9, "min": 1.5, "max": 3}, {"width": 9.5, "min": 1.5, "max": 3}, {"width": 10, "min": 1.5, "max": 3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1034": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1036": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.4, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.6, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.7, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.8, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1038": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1045": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 4, "min": 1, "max": 2.5}, {"width": 4.5, "min": 1, "max": 2.5}, {"width": 5, "min": 1, "max": 2.5}, {"width": 5.5, "min": 1, "max": 2.5}, {"width": 6, "min": 1, "max": 3}, {"width": 6.5, "min": 1, "max": 3}, {"width": 7, "min": 1, "max": 3}, {"width": 7.5, "min": 1.5, "max": 3}, {"width": 8, "min": 1.5, "max": 3}, {"width": 8.5, "min": 1.5, "max": 3}, {"width": 9, "min": 1.5, "max": 3}, {"width": 9.5, "min": 1.5, "max": 3}, {"width": 10, "min": 1.5, "max": 3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1046": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1, "width": 4}, {"max": 2.5, "min": 1, "width": 4.5}, {"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1049": {
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1058": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1074": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1, "width": 4}, {"max": 2.5, "min": 1, "width": 4.5}, {"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1080": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1107": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1108": {
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1243": {
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 5, "min": 1, "max": 2.5}, {"width": 5.5, "min": 1, "max": 2.5}, {"width": 6, "min": 1, "max": 3}, {"width": 6.5, "min": 1, "max": 3}, {"width": 7, "min": 1, "max": 3}, {"width": 7.5, "min": 1.5, "max": 3}, {"width": 8, "min": 1.5, "max": 3}, {"width": 8.5, "min": 1.5, "max": 3}, {"width": 9, "min": 1.5, "max": 3}, {"width": 9.5, "min": 1.5, "max": 3}, {"width": 10, "min": 1.5, "max": 3}],
    materials: ["Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1275": {
    widths: [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.2, "min": 1, "width": 3.5}, {"max": 2.5, "min": 1, "width": 4}, {"max": 2.5, "min": 1, "width": 4.5}, {"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1277": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 4, "min": 1, "max": 2.5}, {"width": 4.5, "min": 1, "max": 2.5}, {"width": 5, "min": 1, "max": 2.5}, {"width": 5.5, "min": 1, "max": 2.5}, {"width": 6, "min": 1, "max": 3}, {"width": 6.5, "min": 1, "max": 3}, {"width": 7, "min": 1, "max": 3}, {"width": 7.5, "min": 1.5, "max": 3}, {"width": 8, "min": 1.5, "max": 3}, {"width": 8.5, "min": 1.5, "max": 3}, {"width": 9, "min": 1.5, "max": 3}, {"width": 9.5, "min": 1.5, "max": 3}, {"width": 10, "min": 1.5, "max": 3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1344": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1345": {
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.5, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.6, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.6, "width": 7}, {"max": 3, "min": 1.7, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.8, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.8, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1379": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1381": {
    widths: [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.2, "min": 1.2, "width": 3.5}, {"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1382": {
    widths: [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.2, "min": 1.4, "width": 3.5}, {"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1388": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1394": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1398": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1, "width": 4}, {"max": 2.5, "min": 1, "width": 4.5}, {"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1432": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1610": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1, "width": 4}, {"max": 2.5, "min": 1, "width": 4.5}, {"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1617": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.5, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.6, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.6, "width": 7}, {"max": 3, "min": 1.7, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.8, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.8, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1760": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1765": {
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1849": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1, "width": 4}, {"max": 2.5, "min": 1, "width": 4.5}, {"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1886": {
    widths: [7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1914": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1918": {
    widths: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN6001": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN6002": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN6003": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 4}, {"max": 2.5, "min": 1.4, "width": 4.5}, {"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN6006": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1, "width": 4}, {"max": 2.5, "min": 1, "width": 4.5}, {"max": 2.5, "min": 1, "width": 5}, {"max": 2.5, "min": 1, "width": 5.5}, {"max": 3, "min": 1, "width": 6}, {"max": 3, "min": 1, "width": 6.5}, {"max": 3, "min": 1, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN6007": {
    widths: [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2, "min": 1.2, "width": 3}, {"max": 2.2, "min": 1.2, "width": 3.5}, {"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN8018": {
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.4, "width": 5}, {"max": 2.5, "min": 1.5, "width": 5.5}, {"max": 3, "min": 1.5, "width": 6}, {"max": 3, "min": 1.5, "width": 6.5}, {"max": 3, "min": 1.5, "width": 7}, {"max": 3, "min": 1.6, "width": 7.5}, {"max": 3, "min": 1.7, "width": 8}, {"max": 3, "min": 1.7, "width": 8.5}, {"max": 3, "min": 1.8, "width": 9}, {"max": 3, "min": 1.8, "width": 9.5}, {"max": 3, "min": 1.9, "width": 10}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN8021": {
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"max": 2.5, "min": 1.2, "width": 4}, {"max": 2.5, "min": 1.3, "width": 4.5}, {"max": 2.5, "min": 1.3, "width": 5}, {"max": 2.5, "min": 1.3, "width": 5.5}, {"max": 3, "min": 1.4, "width": 6}, {"max": 3, "min": 1.4, "width": 6.5}, {"max": 3, "min": 1.4, "width": 7}, {"max": 3, "min": 1.5, "width": 7.5}, {"max": 3, "min": 1.5, "width": 8}, {"max": 3, "min": 1.5, "width": 8.5}, {"max": 3, "min": 1.5, "width": 9}, {"max": 3, "min": 1.5, "width": 9.5}, {"max": 3, "min": 1.5, "width": 10}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN1915D": {
    stone: { name: "Stone 1", type: "Black Diamond", size: 1.3, carat: 0.01, types: ["Black Diamond", "Lab Grown Diamond", "Natural Diamond", "Sapphire", "Ruby"] },
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 5, "min": 1.4, "max": 2.5}, {"width": 5.5, "min": 1.5, "max": 2.5}, {"width": 6, "min": 1.5, "max": 3}, {"width": 6.5, "min": 1.5, "max": 3}, {"width": 7, "min": 1.5, "max": 3}, {"width": 7.5, "min": 1.6, "max": 3}, {"width": 8, "min": 1.7, "max": 3}, {"width": 8.5, "min": 1.7, "max": 3}, {"width": 9, "min": 1.8, "max": 3}, {"width": 9.5, "min": 1.8, "max": 3}, {"width": 10, "min": 1.9, "max": 3}],
    materials: ["Cobalt Chrome", "Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN6004D": {
    stone: { name: "Stone 1", type: "Black Diamond", size: 1.5, carat: 0.01, types: ["Black Diamond", "Lab Grown Diamond", "Natural Diamond", "Sapphire", "Ruby"] },
    widths: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 4, "min": 1.2, "max": 2.5}, {"width": 4.5, "min": 1.3, "max": 2.5}, {"width": 5, "min": 1.3, "max": 2.5}, {"width": 5.5, "min": 1.3, "max": 2.5}, {"width": 6, "min": 1.4, "max": 3}, {"width": 6.5, "min": 1.4, "max": 3}, {"width": 7, "min": 1.4, "max": 3}, {"width": 7.5, "min": 1.5, "max": 3}, {"width": 8, "min": 1.5, "max": 3}, {"width": 8.5, "min": 1.5, "max": 3}, {"width": 9, "min": 1.5, "max": 3}, {"width": 9.5, "min": 1.5, "max": 3}, {"width": 10, "min": 1.5, "max": 3}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
  "IN6010D": {
    stone: { name: "Stone 1", type: "Black Diamond", size: 1.9, carat: 0.01, types: ["Black Diamond", "Lab Grown Diamond", "Natural Diamond", "Sapphire", "Ruby"] },
    widths: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    thicknessLimits: [{"width": 5, "min": 1, "max": 2.5}, {"width": 5.5, "min": 1, "max": 2.5}, {"width": 6, "min": 1, "max": 3}, {"width": 6.5, "min": 1, "max": 3}, {"width": 7, "min": 1, "max": 3}, {"width": 7.5, "min": 1.5, "max": 3}, {"width": 8, "min": 1.5, "max": 3}, {"width": 8.5, "min": 1.5, "max": 3}, {"width": 9, "min": 1.5, "max": 3}, {"width": 9.5, "min": 1.5, "max": 3}, {"width": 10, "min": 1.5, "max": 3}],
    materials: ["Palladium 500", "Palladium 950", "Platinum 600", "Platinum 950", "Rose Gold 14ct", "Rose Gold 18ct", "Rose Gold 9ct", "Sterling Silver 925", "Tantalum", "Titanium", "White Gold 14ct", "White Gold 18ct", "White Gold 9ct", "Yellow Gold 14ct", "Yellow Gold 18ct", "Yellow Gold 9ct", "Zirconium Black", "Zirconium Grey"],
  },
};
