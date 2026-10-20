# Wedding ring builder (Mark's designer)

`/pages/wedding-ring-builder` and `/pages/wedding-ring-catalogue` show Mark's wedding ring designer exactly as he
built it in Lovable (repo `BurrowsJewellers/ring-magic-studio`, preview https://rings.burrowsjewellers.com.au/).
Between the shop's header and footer the page is his. The only additions are ordering and the dashboard's staff mode.

## How it is put together

- `mark/src/` is his repo's `src/`, copied unchanged (`mark/COMMIT` says which commit). Never edit it here.
- `shop/` is the adapter, standing in for what his Lovable app got elsewhere:
  - `router.tsx`: replaces `@tanstack/react-router`; there is no router on Shopify, so his links become links to the website's pages
    (catalogue tile → `/pages/wedding-ring-builder?ring=<id>`).
  - `cart.ts`: his "Pay $200 deposit" adds the deposit to the shop's own cart (`/cart/add.js`) with his line item details,
    plus `Design link`, `_Supplier SKU` and `_Preview` (a picture of the 3D ring), then goes to `/cart`. In staff mode it sends
    the design back to the dashboard instead.
  - `price.ts`: his price hook, asking the wedding ring API on the droplet (`…/wedding-ring/api/price`), with the same request
    and reply as his `/api/wedding-ring-price`.
  - `dialog.tsx`: the size guide dialog opens inside the shadow root, so it keeps his styles.
  - `main.tsx`: mounts his page in a shadow root on the section, so his styles apply exactly and the theme's CSS can't
    reach in (or his reach out). The `View` setting picks his home page or his catalogue; `?ring=<id>` shows his ring page.
  - `patches.mjs`: the only changes to his code, applied at build time to `RingDesigner.tsx` (his file stays as it is).
    Each must match his code exactly once or the build stops and names the patch. For customers: the share link and the
    order's design link point at the website, and the deposit button passes the design to `cart.ts`. Everything else is
    staff mode only (`?staff=1&order=CO-…`, opened by the dashboard's Custom Orders): a "Staff review" tag, every supplier
    width (0.1 mm steps) and quarter size, the supplier SKU in Your ring, "Save to order".
  - `vite.config.ts` also points his photos and 3D models (Lovable-hosted `/images/…`, `/models/…`, `*.asset.json`) at the
    copies on Shopify Files (`shop/cdn-manifest.json`, `shop/cdn-direct.json`), and drops a duplicate `ea` entry in his list.
- `sections/wedding-ring-builder.liquid` adds no styles: Mark's fonts, the mount point and the settings.

## When Mark changes his design

```
npm install
npm run sync -- main     # copies his latest src into mark/src
npm run build            # writes ../assets/wedding-ring-builder.js
```

If his new photos or models are not on Shopify Files yet, the build stops and names them (upload them, add them to
`shop/cdn-manifest.json`). If he changed a line a patch relies on, the build names the patch. Commit `mark/`, the
bundle and any adapter change together; Shopify picks up the bundle with the theme.

## Testing

`npm test` runs Mark's price, bevel and design-default tests (his other tests need his Lovable `public/` files).
`node test/serve.cjs` serves a stand-in Shopify page on :8792 (the theme's CSS loaded, mock cart, the real price API code).
`node test/compare.cjs` renders his live preview and ours and saves both (pixel-diff them); `node test/flow.cjs` checks the
catalogue, the size guide, the cart line, reopening an order's design link, and staff mode.
