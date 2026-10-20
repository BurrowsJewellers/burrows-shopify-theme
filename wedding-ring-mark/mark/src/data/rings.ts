// Generated from Infinity Rings catalogue (authorised stockist imagery)
import ab2Asset from "../assets/rings/classic/AB-2-classic-wedding-band.jpg.asset.json";
import ac6Asset from "../assets/rings/classic/AC-6-mens-classic-wedding-ring.jpg.asset.json";
import ad7Asset from "../assets/rings/classic/AD-7-classic-wedding-ring-australia.jpg.asset.json";
import ag2Asset from "../assets/rings/classic/AG-2-classic-wedding-ring.jpg.asset.json";
import ah2Asset from "../assets/rings/classic/AH-2-classic-wedding-ring-australia.jpg.asset.json";
import ak1Asset from "../assets/rings/classic/AK-1-mens-classic-wedding-ring.jpg.asset.json";
import as2Asset from "../assets/rings/classic/AS-2-classic-wedding-ring-australia.jpg.asset.json";
import eaAsset from "../assets/rings/classic/EA-mens-classic-wedding-ring.jpg.asset.json";
import fb6Asset from "../assets/rings/classic/FB-6-classic-wedding-ring-australia.jpg.asset.json";

import ab2Gold from "../assets/rings/classic/AB-2-yellow-gold.jpg";
import ac6Gold from "../assets/rings/classic/AC-6-yellow-gold.jpg";
import as2Gold from "../assets/rings/classic/AS-2-yellow-gold.jpg";
import eaGold from "../assets/rings/classic/EA-yellow-gold.jpg";
import ah2Rose from "../assets/rings/classic/AH-2-rose-gold.jpg";
import fb6Tantalum from "../assets/rings/classic/FB-6-tantalum.jpg";

const ab2 = ab2Asset.url;
const ac6 = ac6Asset.url;
const ad7 = ad7Asset.url;
const ag2 = ag2Asset.url;
const ah2 = ah2Asset.url;
const ak1 = ak1Asset.url;
const as2 = as2Asset.url;
const ea = eaAsset.url;
const fb6 = fb6Asset.url;

export type RingMetal = { metal: string; image: string };
export type Ring = { id: string; name: string; displayName?: string; metals: Record<string, string>; range?: string };

export const RINGS: Ring[] = [
  // Infinity Classic range (plain wedding bands) — ordered round → flat, shown first
  { id: "ab2", name: "AB-2", displayName: "Classic Round", range: "classic", metals: { gold: ab2Gold, platinum: ab2 } },
  { id: "ad7", name: "AD-7", displayName: "Half Round", range: "classic", metals: { platinum: ad7 } },
  { id: "ah2", name: "AH-2", displayName: "Half Round w Bevelled Edge", range: "classic", metals: { "rose-gold": ah2Rose, platinum: ah2 } },
  { id: "ac6", name: "AC-6", displayName: "Flat Round", range: "classic", metals: { gold: ac6Gold, platinum: ac6 } },
  { id: "fb6", name: "FB-6", displayName: "Flat Round with Reverse Bezel", range: "classic", metals: { tantalum: fb6Tantalum, platinum: fb6 } },
  { id: "ag2", name: "AG-2", displayName: "Flat", range: "classic", metals: { platinum: ag2 } },
  { id: "as2", name: "AS-2", displayName: "Flat w Bevelled Edge", range: "classic", metals: { gold: as2Gold, platinum: as2 } },
  { id: "ak1", name: "AK-1", displayName: "Knife Edge", range: "classic", metals: { platinum: ak1 } },
  { id: "ea", name: "EA", displayName: "Concave", range: "classic", metals: { gold: eaGold, platinum: ea } },

  {
    "id": "in1004",
    "name": "IN1004",
    "metals": {
      "gold": "/images/cd4663b4-in1004-gold.jpg",
      "titanium": "/images/1d2e1669-in1004-titanium.jpg"
    }
  },
  {
    "id": "in1008",
    "name": "IN1008",
    "metals": {
      "gold": "/images/4aee832e-in1008-gold.png",
      "tantalum": "/images/24e2dba6-in1008-tantalum.jpg"
    }
  },
  {
    "id": "in1034",
    "name": "IN1034",
    "metals": {
      "gold": "/images/9280e366-in1034-gold.png"
    }
  },
  {
    "id": "in1036",
    "name": "IN1036",
    "metals": {
      "gold": "/images/e33ab025-in1036-gold.jpg",
      "platinum": "/images/8a5d2ddb-in1036-platinum.jpg",
      "titanium": "/images/2ca7d9ef-in1036-titanium.jpg"
    }
  },
  {
    "id": "in1038",
    "name": "IN1038",
    "metals": {
      "gold": "/images/8c0a7aeb-in1038-gold.png",
      "platinum": "/images/f5b86bbc-in1038-platinum.png",
      "silver": "/images/fb75ef5b-in1038-silver.jpg"
    }
  },
  {
    "id": "in1045",
    "name": "IN1045",
    "metals": {
      "gold": "/images/f3f0d1c9-in1045-gold.jpg",
      "platinum": "/images/98098035-in1045-platinum.png",
      "titanium": "/images/a1b9356e-in1045-titanium.png"
    }
  },
  {
    "id": "in1046",
    "name": "IN1046",
    "metals": {
      "gold": "/images/7b8691f2-in1046-gold.jpg",
      "platinum": "/images/a041e765-in1046-platinum.png",
      "silver": "/images/d25a4b09-in1046-silver.jpg",
      "titanium": "/images/9dc802bd-in1046-titanium.png",
      "zirconium": "/images/35ef2b59-in1046-zirconium.png"
    }
  },
  {
    "id": "in1049",
    "name": "IN1049",
    "metals": {
      "gold": "/images/390fd2e4-in1049-gold.jpg"
    }
  },
  {
    "id": "in1058",
    "name": "IN1058",
    "metals": {
      "gold": "/images/1cd280dc-in1058-gold.png"
    }
  },
  {
    "id": "in1074",
    "name": "IN1074",
    "metals": {
      "gold": "/images/6d154563-in1074-gold.jpg",
      "zirconium": "/images/f70de32c-in1074-zirconium.png"
    }
  },
  {
    "id": "in1076",
    "name": "IN1076",
    "metals": {
      "gold": "/images/74a9b89d-in1076-gold.jpg",
      "titanium": "/images/4a4041a7-in1076-titanium.jpg"
    }
  },
  {
    "id": "in1080",
    "name": "IN1080",
    "metals": {
      "gold": "/images/70e0ecf1-in1080-gold.jpg"
    }
  },
  {
    "id": "in1107",
    "name": "IN1107",
    "metals": {
      "titanium": "/images/c3217379-in1107-titanium.png"
    }
  },
  {
    "id": "in1108",
    "name": "IN1108",
    "metals": {
      "titanium": "/images/666b5126-in1108-titanium.jpg"
    }
  },
  {
    "id": "in1243",
    "name": "IN1243",
    "metals": {
      "titanium": "/images/7f370b52-in1243-titanium.png"
    }
  },
  {
    "id": "in1275",
    "name": "IN1275",
    "metals": {
      "platinum": "/images/7d6895af-in1275-platinum.png",
      "titanium": "/images/8b9f236b-in1275-titanium.jpg"
    }
  },
  {
    "id": "in1277",
    "name": "IN1277",
    "metals": {
      "platinum": "/images/d6a30f98-in1277-platinum.png",
      "silver": "/images/8331a792-in1277-silver.jpg",
      "tantalum": "/images/ac4ab036-in1277-tantalum.jpg",
      "titanium": "/images/98c4c33b-in1277-titanium.png"
    }
  },
  {
    "id": "in1344",
    "name": "IN1344",
    "metals": {
      "titanium": "/images/317f8c25-in1344-titanium.jpg"
    }
  },
  {
    "id": "in1345",
    "name": "IN1345",
    "metals": {
      "titanium": "/images/0189cebd-in1345-titanium.png"
    }
  },
  {
    "id": "in1379",
    "name": "IN1379",
    "metals": {
      "silver": "/images/c1d59df7-in1379-silver.jpg"
    }
  },
  {
    "id": "in1381",
    "name": "IN1381",
    "metals": {
      "platinum": "/images/3427069e-in1381-platinum.jpg"
    }
  },
  {
    "id": "in1382",
    "name": "IN1382",
    "metals": {
      "platinum": "/images/844abef9-in1382-platinum.jpg",
      "silver": "/images/987977ac-in1382-silver.jpg",
      "tantalum": "/images/c2e2fdcd-in1382-tantalum.png"
    }
  },
  {
    "id": "in1388",
    "name": "IN1388",
    "metals": {
      "platinum": "/images/dc92177c-in1388-platinum.png"
    }
  },
  {
    "id": "in1394",
    "name": "IN1394",
    "metals": {
      "platinum": "/images/dfb5668c-in1394-platinum.jpg",
      "silver": "/images/8353b916-in1394-silver.jpg",
      "zirconium": "/images/b2685aaa-in1394-zirconium.png"
    }
  },
  {
    "id": "in1398",
    "name": "IN1398",
    "metals": {
      "platinum": "/images/bc2c2bfc-in1398-platinum.png"
    }
  },
  {
    "id": "in1432",
    "name": "IN1432",
    "metals": {
      "platinum": "/images/af4e9ebd-in1432-platinum.jpg",
      "silver": "/images/5c9f90dd-in1432-silver.jpg",
      "tantalum": "/images/9957631c-in1432-tantalum.jpg"
    }
  },
  {
    "id": "in1610",
    "name": "IN1610",
    "metals": {
      "zirconium": "/images/81ed2e72-in1610-zirconium.png"
    }
  },
  {
    "id": "in1617",
    "name": "IN1617",
    "metals": {
      "silver": "/images/dc30428f-in1617-silver.jpg"
    }
  },
  {
    "id": "in1760",
    "name": "IN1760",
    "metals": {
      "silver": "/images/2b974d07-in1760-silver.jpg",
      "tantalum": "/images/710cf887-in1760-tantalum.png"
    }
  },
  {
    "id": "in1765",
    "name": "IN1765",
    "metals": {
      "zirconium": "/images/cb305e78-in1765-zirconium.png"
    }
  },
  {
    "id": "in1849",
    "name": "IN1849",
    "metals": {
      "tantalum": "/images/1aa0aba2-in1849-tantalum.png",
      "zirconium": "/images/cfea0937-in1849-zirconium.png"
    }
  },
  {
    "id": "in1886",
    "name": "IN1886",
    "metals": {
      "zirconium": "/images/76b7e2b3-in1886-zirconium.jpg"
    }
  },
  {
    "id": "in1914",
    "name": "IN1914",
    "metals": {
      "silver": "/images/5cc0ba35-in1914-silver.jpg",
      "zirconium": "/images/b7949c35-in1914-zirconium.png"
    }
  },
  {
    "id": "in1915",
    "displayName": "Diamond Band · 50 Stones",
    "name": "IN1915",
    "metals": {
      "zirconium": "/images/875244c7-in1915-zirconium.jpg"
    }
  },
  {
    "id": "in1918",
    "name": "IN1918",
    "metals": {
      "zirconium": "/images/6c9a6e40-in1918-zirconium.jpg"
    }
  },
  {
    "id": "in6001",
    "name": "IN6001",
    "metals": {
      "tantalum": "/images/04359000-in6001-tantalum.jpg"
    }
  },
  {
    "id": "in6002",
    "name": "IN6002",
    "metals": {
      "tantalum": "/images/29f4dfe9-in6002-tantalum.jpg"
    }
  },
  {
    "id": "in6003",
    "name": "IN6003",
    "metals": {
      "tantalum": "/images/d5302e3c-in6003-tantalum.jpg"
    }
  },
  {
    "id": "in6004",
    "displayName": "Diamond Band · 6 Stones",
    "name": "IN6004",
    "metals": {
      "tantalum": "/images/eb7d0620-in6004-tantalum.jpg"
    }
  },
  {
    "id": "in6006",
    "name": "IN6006",
    "metals": {
      "tantalum": "/images/3dc9e35c-in6006-tantalum.jpg"
    }
  },
  {
    "id": "in6007",
    "name": "IN6007",
    "metals": {
      "tantalum": "/images/de78bb42-in6007-tantalum.jpg"
    }
  },
  {
    "id": "in6010",
    "displayName": "Diamond Band · 33 Stones",
    "name": "IN6010",
    "metals": {
      "zirconium": "/images/61b9929a-in6010-zirconium.jpg"
    }
  },
  {
    "id": "in8018",
    "name": "IN8018",
    "metals": {
      "silver": "/images/3d45e00e-in8018-silver.jpg",
      "zirconium": "/images/30a1a381-in8018-zirconium.jpg"
    }
  },
  {
    "id": "in8021",
    "name": "IN8021",
    "metals": {
      "silver": "/images/f5bf13e9-in8021-silver.jpg"
    }
  },
  { id: "ea", name: "EA", displayName: "Concave", range: "classic", metals: { gold: eaGold, platinum: ea } }

];
