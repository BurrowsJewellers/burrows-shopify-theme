// Infinity Rings catalogue (authorised stockist imagery). Photos are served from Shopify Files (see wedding-builder/README.md).
export type Ring = { id: string; name: string; displayName?: string; metals: Record<string, string>; range?: string };

export const RINGS: Ring[] = [
  // Infinity Classic range (plain wedding bands), ordered round to flat, shown first
  { id: "ab2", name: "AB-2", displayName: "Classic Round", range: "classic", metals: { gold: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AB-2-yellow-gold.jpg?v=1792467268", platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AB-2-classic-wedding-band.jpg?v=1792467268" } },
  { id: "ad7", name: "AD-7", displayName: "Half Round", range: "classic", metals: { platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AD-7-classic-wedding-ring-australia.jpg?v=1792467287" } },
  { id: "ah2", name: "AH-2", displayName: "Half Round w Bevelled Edge", range: "classic", metals: { "rose-gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AH-2-rose-gold.jpg?v=1792467270", platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AH-2-classic-wedding-ring-australia.jpg?v=1792467287" } },
  { id: "ac6", name: "AC-6", displayName: "Flat Round", range: "classic", metals: { gold: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AC-6-yellow-gold.jpg?v=1792467268", platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AC-6-mens-classic-wedding-ring.jpg?v=1792467243" } },
  { id: "fb6", name: "FB-6", displayName: "Flat Round with Reverse Bezel", range: "classic", metals: { tantalum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-FB-6-tantalum.jpg?v=1792467288", platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-FB-6-classic-wedding-ring-australia.jpg?v=1792467287" } },
  { id: "ag2", name: "AG-2", displayName: "Flat", range: "classic", metals: { platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AG-2-classic-wedding-ring.jpg?v=1792467223" } },
  { id: "as2", name: "AS-2", displayName: "Flat w Bevelled Edge", range: "classic", metals: { gold: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AS-2-yellow-gold.jpg?v=1792467287", platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AS-2-classic-wedding-ring-australia.jpg?v=1792467223" } },
  { id: "ak1", name: "AK-1", displayName: "Knife Edge", range: "classic", metals: { platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-AK-1-mens-classic-wedding-ring.jpg?v=1792467223" } },
  { id: "ea", name: "EA", displayName: "Concave", range: "classic", metals: { gold: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-EA-yellow-gold.jpg?v=1792467287", platinum: "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-EA-mens-classic-wedding-ring.jpg?v=1792467223" } },

  // Infinity Signature designs
  {
    id: "in1004",
    name: "IN1004",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1004-gold.jpg?v=1792466549",
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1004-titanium.jpg?v=1792467223"
    }
  },
  {
    id: "in1008",
    name: "IN1008",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1008-gold.png?v=1792467223",
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1008-tantalum.jpg?v=1792467223"
    }
  },
  {
    id: "in1034",
    name: "IN1034",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1034-gold.png?v=1792467268"
    }
  },
  {
    id: "in1036",
    name: "IN1036",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1036-gold.jpg?v=1792467287",
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1036-platinum.jpg?v=1792467243",
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1036-titanium.jpg?v=1792467223"
    }
  },
  {
    id: "in1038",
    name: "IN1038",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1038-gold.png?v=1792467243",
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1038-platinum.png?v=1792467287",
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1038-silver.jpg?v=1792467288"
    }
  },
  {
    id: "in1045",
    name: "IN1045",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1045-gold.jpg?v=1792467288",
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1045-platinum.png?v=1792467268",
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1045-titanium.png?v=1792467268"
    }
  },
  {
    id: "in1046",
    name: "IN1046",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1046-gold.jpg?v=1792467243",
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1046-platinum.png?v=1792467268",
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1046-silver.jpg?v=1792467287",
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1046-titanium.png?v=1792467268",
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1046-zirconium.png?v=1792467223"
    }
  },
  {
    id: "in1049",
    name: "IN1049",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1049-gold.jpg?v=1792467223"
    }
  },
  {
    id: "in1058",
    name: "IN1058",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1058-gold.png?v=1792467223"
    }
  },
  {
    id: "in1074",
    name: "IN1074",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1074-gold.jpg?v=1792467243",
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1074-zirconium.png?v=1792467287"
    }
  },
  {
    id: "in1076",
    name: "IN1076",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1076-gold.jpg?v=1792467243",
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1076-titanium.jpg?v=1792467223"
    }
  },
  {
    id: "in1080",
    name: "IN1080",
    metals: {
      "gold": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1080-gold.jpg?v=1792467243"
    }
  },
  {
    id: "in1107",
    name: "IN1107",
    metals: {
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1107-titanium.png?v=1792467269"
    }
  },
  {
    id: "in1108",
    name: "IN1108",
    metals: {
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1108-titanium.jpg?v=1792467243"
    }
  },
  {
    id: "in1243",
    name: "IN1243",
    metals: {
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1243-titanium.png?v=1792467243"
    }
  },
  {
    id: "in1275",
    name: "IN1275",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1275-platinum.png?v=1792467243",
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1275-titanium.jpg?v=1792467243"
    }
  },
  {
    id: "in1277",
    name: "IN1277",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1277-platinum.png?v=1792467287",
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1277-silver.jpg?v=1792467243",
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1277-tantalum.jpg?v=1792467268",
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1277-titanium.png?v=1792467269"
    }
  },
  {
    id: "in1344",
    name: "IN1344",
    metals: {
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1344-titanium.jpg?v=1792467223"
    }
  },
  {
    id: "in1345",
    name: "IN1345",
    metals: {
      "titanium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1345-titanium.png?v=1792467223"
    }
  },
  {
    id: "in1379",
    name: "IN1379",
    metals: {
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1379-silver.jpg?v=1792467268"
    }
  },
  {
    id: "in1381",
    name: "IN1381",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1381-platinum.jpg?v=1792467223"
    }
  },
  {
    id: "in1382",
    name: "IN1382",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1382-platinum.jpg?v=1792467243",
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1382-silver.jpg?v=1792467268",
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1382-tantalum.png?v=1792467269"
    }
  },
  {
    id: "in1388",
    name: "IN1388",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1388-platinum.png?v=1792467287"
    }
  },
  {
    id: "in1394",
    name: "IN1394",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1394-platinum.jpg?v=1792467288",
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1394-silver.jpg?v=1792467243",
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1394-zirconium.png?v=1792467269"
    }
  },
  {
    id: "in1398",
    name: "IN1398",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1398-platinum.png?v=1792467269"
    }
  },
  {
    id: "in1432",
    name: "IN1432",
    metals: {
      "platinum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1432-platinum.jpg?v=1792467268",
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1432-silver.jpg?v=1792467243",
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1432-tantalum.jpg?v=1792467268"
    }
  },
  {
    id: "in1610",
    name: "IN1610",
    metals: {
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1610-zirconium.png?v=1792467243"
    }
  },
  {
    id: "in1617",
    name: "IN1617",
    metals: {
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1617-silver.jpg?v=1792467287"
    }
  },
  {
    id: "in1760",
    name: "IN1760",
    metals: {
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1760-silver.jpg?v=1792467223",
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1760-tantalum.png?v=1792467243"
    }
  },
  {
    id: "in1765",
    name: "IN1765",
    metals: {
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1765-zirconium.png?v=1792467269"
    }
  },
  {
    id: "in1849",
    name: "IN1849",
    metals: {
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1849-tantalum.png?v=1792467224",
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1849-zirconium.png?v=1792467268"
    }
  },
  {
    id: "in1886",
    name: "IN1886",
    metals: {
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1886-zirconium.jpg?v=1792467243"
    }
  },
  {
    id: "in1914",
    name: "IN1914",
    metals: {
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1914-silver.jpg?v=1792467243",
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1914-zirconium.png?v=1792467268"
    }
  },
  {
    id: "in1915",
    displayName: "Diamond Band · 50 Stones",
    name: "IN1915",
    metals: {
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1915-zirconium.jpg?v=1792467243"
    }
  },
  {
    id: "in1918",
    name: "IN1918",
    metals: {
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in1918-zirconium.jpg?v=1792467243"
    }
  },
  {
    id: "in6001",
    name: "IN6001",
    metals: {
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in6001-tantalum.jpg?v=1792467223"
    }
  },
  {
    id: "in6002",
    name: "IN6002",
    metals: {
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in6002-tantalum.jpg?v=1792467223"
    }
  },
  {
    id: "in6003",
    name: "IN6003",
    metals: {
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in6003-tantalum.jpg?v=1792467287"
    }
  },
  {
    id: "in6004",
    displayName: "Diamond Band · 6 Stones",
    name: "IN6004",
    metals: {
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in6004-tantalum.jpg?v=1792467287"
    }
  },
  {
    id: "in6006",
    name: "IN6006",
    metals: {
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in6006-tantalum.jpg?v=1792467223"
    }
  },
  {
    id: "in6007",
    name: "IN6007",
    metals: {
      "tantalum": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in6007-tantalum.jpg?v=1792467287"
    }
  },
  {
    id: "in6010",
    displayName: "Diamond Band · 33 Stones",
    name: "IN6010",
    metals: {
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in6010-zirconium.jpg?v=1792467243"
    }
  },
  {
    id: "in8018",
    name: "IN8018",
    metals: {
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in8018-silver.jpg?v=1792467223",
      "zirconium": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in8018-zirconium.jpg?v=1792467223"
    }
  },
  {
    id: "in8021",
    name: "IN8021",
    metals: {
      "silver": "https://cdn.shopify.com/s/files/1/0687/1557/7649/files/wr-in8021-silver.jpg?v=1792467287"
    }
  },
];

export const CLASSIC_RINGS = RINGS.filter((r) => r.range === "classic");
export const SIGNATURE_RINGS = RINGS.filter((r) => r.range !== "classic");
export function findRing(id: string | null | undefined): Ring | undefined { return id ? RINGS.find((r) => r.id === id) : undefined; }
