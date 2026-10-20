// What the page URL and this browser say about the visit: staff mode (the dashboard's order review) and the draft.
import { defaultDesign, derive, designFromParams, designToParams, type Design } from "./design";

// Staff mode: the dashboard's Custom Orders tab opens this page with ?staff=1&order=<id> (and the design in the
// query string). Every supplier size and width is offered, the supplier figures are shown, and "Save to order"
// hands the design back to the dashboard window that opened the page instead of adding a deposit to the cart.
export const STAFF_ORIGINS = ["https://dashboard.burrowsjewellers.com.au", "http://localhost:5173", "http://localhost:4000", "http://localhost:8791"];
export const pageQuery = () => { try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); } };
export const STAFF = pageQuery().get("staff") === "1";
export const STAFF_ORDER = (pageQuery().get("order") || "").slice(0, 40);

// The draft: the design as last left, kept in this browser for a week so a reload or a return visit picks it up.
export const DRAFT_KEY = "wr-draft-v1";
export const DRAFT_DAYS = 7;
export function loadDraft(): Design | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { at?: number; q?: string };
    if (!j.q || !j.at || Date.now() - j.at > DRAFT_DAYS * 86_400_000) return null;
    return designFromParams(new URLSearchParams(j.q));
  } catch { return null; }
}
export function saveDraft(design: Design) {
  try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: Date.now(), q: designToParams(design, derive(design)).toString() })); } catch { /* storage off */ }
}
export function clearDraft() {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

/** The design the visit starts with, or null when the gallery should show first: a share link (?ring=…) wins,
 *  then a draft from the last week (never in staff mode, where the order's design is in the link). */
export function startingDesign(): Design | null {
  try {
    const fromUrl = designFromParams(pageQuery(), { staff: STAFF });
    if (fromUrl) return fromUrl;
    if (STAFF) return defaultDesign("ab2");
    return loadDraft();
  } catch { return null; }
}
