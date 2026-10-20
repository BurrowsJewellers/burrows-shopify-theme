/** Engraving fonts offered in the personaliser (loaded via Google Fonts in __root). */
export const ENGRAVING_FONTS = [
  { id: "script", label: "Script", css: "'Great Vibes', cursive" },
  { id: "serif", label: "Classic serif", css: "'Cormorant Garamond', serif" },
  { id: "roman", label: "Roman capitals", css: "'Cinzel', serif" },
  { id: "modern", label: "Modern", css: "'Jost', sans-serif" },
] as const;

export type EngravingFontId = (typeof ENGRAVING_FONTS)[number]["id"];

export const ENGRAVING_MAX = 30;

/** Keep printable text only and cap the length. */
export function cleanEngraving(text: string): string {
  return text.replace(/[^\p{L}\p{N} .,&'’♥+\-:/#()!?]/gu, "").slice(0, ENGRAVING_MAX);
}

export function engravingFont(id: string) {
  return ENGRAVING_FONTS.find((f) => f.id === id) ?? ENGRAVING_FONTS[0];
}
