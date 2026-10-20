# Wedding ring builder (source)

The builder on `/pages/wedding-ring-builder`: a gallery of Infinity Rings' 53 styles (collection chips, photos,
"from $" prices), then the designer for the chosen style — personalised in 3D, priced live, secured with a $200
deposit in the normal cart. This folder is the **source**; the theme loads the **built** files
`assets/wedding-ring-builder.js` and `assets/wedding-ring-builder.css` from `sections/wedding-ring-builder.liquid`.
Shopify's GitHub sync ignores this folder, so it lives in the repo without reaching the theme.

It began life as Mark's Lovable project (`BurrowsJewellers/ring-magic-studio`, Oct 2026). The 3D ring (Infinity's own
GLB models with width/thickness morph targets, metal zones, stones, the engraving sleeve, the light tent), the option
snapshot and the pricing rules are his code; the page around them was rebuilt to match the name necklace builder and
the theme, and the Lovable app, its routes and its Storefront-API checkout were dropped. Lovable is no longer connected;
edit here.

## Editing

```
cd wedding-builder
npm install          # once
npm run build        # writes ../assets/wedding-ring-builder.js and .css
npm test             # vitest: pricing rules, catalogue, URL round-trip
npm run typecheck
```

Commit the built assets together with the source change. Push to `main` and Shopify picks the assets up like any
other theme file.

| Where | What |
|---|---|
| `src/components/App.tsx` | gallery first, then the designer; a share link, a draft or staff mode skip the gallery; browser back returns to it |
| `src/components/Gallery.tsx` | the style gallery: collection chips, tiles with photo, name and "from $" (from the API's `/from-prices`) |
| `src/data/collections.ts` | which styles sit in Plain / Patterned / Two-tone / Diamond-set (classified from the photos) |
| `src/components/Designer.tsx` | the designer: five steps, stage, price bar, add to cart, share link; step 1 shows the chosen style with "Change style" |
| `src/components/StageBoundary.tsx` | keeps the page up when a 3D model fails to load (photo + note instead) |
| `src/lib/session.ts` | staff mode flags, the localStorage draft, which design a visit starts with |
| `src/components/Ring3D.tsx` | the 3D ring (react-three-fiber) |
| `src/lib/design.ts` | the design and its rules: defaults, clamping, summary rows, cart properties, URL state |
| `src/lib/api.ts` | price lookups, order picture upload, `/cart/add.js` |
| `src/lib/pricing/ring-price.ts`, `sku-options.ts` | Infinity's option snapshot and request rules (shared with the server, see below) |
| `src/data/rings.ts`, `ring-models.ts` | the 53 styles, their photos and models on Shopify Files, per-model calibration |
| `src/styles.css` | the section's styles (same shapes as `assets/name-necklace.css`) |
| `test/` | a local harness: `node test/serve-harness.cjs` then open http://localhost:8791/test/harness.html (mock `/cart/add.js`, real Infinity prices through the server code); `node test/shot.cjs` / `node test/cart.cjs` / `node test/gallery.cjs` (gallery → designer → back, drafts, staff mode, a blocked model) drive it with Playwright |

## How it fits together

- **Config** comes from the section as `<script type="application/json" data-wr-config>`: API base, deposit variant id
  and amount, copy, booking URL, phone, the page URL for share links. `src/main.tsx` reads it and mounts into
  `[data-wr-app]`.
- **Prices**: the page posts `{sku, size, width, thickness, centreMaterial, sideMaterial, stoneType?, stoneSize?}` to
  `<api>/price`; the wedding ring API on the droplet (`name-necklace-builder/wedding-ring-server`) validates it against
  the same option snapshot and asks Infinity's configurator. Prices are indicative RRP incl. GST for now; the
  trade-price × markup-ladder model is built into the server and switched on from its `.env` once Mark settles the trade
  price source. Nothing on the page changes for that.
- **Deposit**: "Pay $200 deposit" takes a JPEG of the 3D view, saves it through `<api>/preview`, then POSTs the deposit
  variant to `/cart/add.js` with the design as line item properties (Style, Width, Thickness, Centre/Side metal,
  Fit/Profile, Finish, Finger size, Date required, Stones, Engraving + font, Quoted price, Design link, and hidden
  `_Supplier SKU` and `_Preview`), and goes to `/cart`. The button is off until a price has arrived; styles without a
  supplier price (IN1076) are enquiry only.
- **URL state**: every change is mirrored into the query string (`?ring=in6004&metal=…`), so a reload keeps the design
  and "Save or share" copies a link that restores it.
- **Models and photos** are in Shopify Files (`wr-<id>.glb`, `wr-<name>.jpg|png`); their CDN URLs are baked into
  `src/data/*.ts`. To replace one, upload the new file and change the URL there. GLBs must be uploaded as 3D models
  (`fileCreate` with `MODEL_3D` through a staged upload); use the `originalSource` URL, which serves the file unchanged
  with CORS.

## Keeping the server in step

`src/lib/pricing/sku-options.ts` is Infinity's option list (snapshot 2026-10-10). The server reads the same data from
`wedding-ring-server/sku-options.json`. After changing the TS file, regenerate the JSON:

```
node -e "const fs=require('fs');let s=fs.readFileSync('src/lib/pricing/sku-options.ts','utf8');s=s.replace(/^export type[\s\S]*?^};/m,'').replace(/^export const (\w+)(: [^=]+)? =/mg,'exports.$1 =');const m={};new Function('exports',s)(m);fs.writeFileSync('sku-options.json',JSON.stringify({SKU_OPTIONS:m.SKU_OPTIONS,SIGNATURE_SKU_OPTIONS:m.SIGNATURE_SKU_OPTIONS,SUPPLIER_SIZES:m.SUPPLIER_SIZES}))"
```

and commit it to `name-necklace-builder/wedding-ring-server/`.

## Known limits

- IN1915's GLB has 46 stones against Infinity's 50-stone spec, so that style shows its reference photo instead of 3D.
- The size guide's diameters are `15.6 + 0.4 × index` mm (an approximation); sizes are confirmed in store.
- Classic styles price as Court (Comfit) or `-Flat` (Standard) only; FB-6 has no Flat listing.
- Finger sizes offered are whole letters H to Z+4; the supplier also lists quarter sizes.
