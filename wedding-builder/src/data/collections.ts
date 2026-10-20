// The gallery's collections: how the 53 styles group for the filter chips. A style can sit in more than one
// (IN1004 is a Greek key pattern and two-tone). Classified from Infinity's photos; keep in step with rings.ts.
import { RINGS, type Ring } from "./rings";

export type Collection = { id: string; label: string; blurb: string };

export const COLLECTIONS: Collection[] = [
  { id: "plain", label: "Plain", blurb: "Classic bands in nine profiles, round to flat." },
  { id: "patterned", label: "Patterned", blurb: "Grooves, lines, textures and hammered finishes." },
  { id: "two-tone", label: "Two-tone", blurb: "Two metals in one band." },
  { id: "diamond", label: "Diamond-set", blurb: "Bands set with diamonds." },
];

const MEMBERS: Record<string, string[]> = {
  plain: ["ab2", "ad7", "ah2", "ac6", "fb6", "ag2", "as2", "ak1", "ea"],
  patterned: [
    "in1004", "in1049", "in1074", "in1076", "in1080", "in1107", "in1108", "in1243", "in1275", "in1277", "in1344", "in1381",
    "in1382", "in1388", "in1394", "in1398", "in1432", "in1617", "in1760", "in1765", "in1886", "in1914", "in1918", "in6002",
    "in6003", "in6006", "in8018", "in8021",
  ],
  "two-tone": ["in1004", "in1008", "in1034", "in1036", "in1038", "in1045", "in1046", "in1049", "in1058", "in1345", "in1379", "in1610", "in1849", "in6001", "in6004", "in6007"],
  diamond: ["in1915", "in6004", "in6010"],
};

const SETS: Record<string, Set<string>> = Object.fromEntries(Object.entries(MEMBERS).map(([k, v]) => [k, new Set(v)]));

export function collectionsFor(ringId: string): string[] {
  return COLLECTIONS.filter((c) => SETS[c.id]!.has(ringId)).map((c) => c.id);
}

/** Rings in a collection ("" = all), in gallery order: plain first, then patterned, two-tone, diamond-set; Infinity's
 *  order within each. A ring in several collections appears once, under the first. */
export function ringsIn(collection: string): Ring[] {
  if (collection) return RINGS.filter((r) => SETS[collection]?.has(r.id));
  const seen = new Set<string>();
  const out: Ring[] = [];
  for (const c of COLLECTIONS) for (const r of RINGS) if (SETS[c.id]!.has(r.id) && !seen.has(r.id)) { seen.add(r.id); out.push(r); }
  for (const r of RINGS) if (!seen.has(r.id)) { seen.add(r.id); out.push(r); }
  return out;
}

/** The photo a tile shows: the yellow gold one where Infinity has it, else the first. */
export const tilePhoto = (r: Ring): string => r.metals["gold"] ?? Object.values(r.metals)[0] ?? "";
