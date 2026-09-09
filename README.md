# Burrows Jewellers — Shopify theme

A from-scratch Shopify Online Store 2.0 theme for burrowsjewellers.com.au, built from the July 2026 "Website Redesign (Claude)" design draft. It replaces the Turbo (Out of the Sandbox) theme.

## How it's set up

- **Base:** Shopify's Skeleton theme (no jQuery, no vendor bundles). All CSS lives in `assets/base.css` plus per-section `{% stylesheet %}` blocks; all JS in `assets/theme.js` (dependency-free).
- **Design tokens:** colours and fonts are theme settings (Theme settings → Colours / Typography) and exposed as CSS variables in `snippets/css-variables.liquid`.
- **Backgrounds:** the site is cream by default. Theme settings → Colours → "Shop page background" switches collection, product, search and cart pages to white (the default), because product photos are shot on white. Implemented as `body.shop-white` in `layout/theme.liquid` plus the overrides at the end of `assets/base.css`.
- **Logo:** the Burrows white logo ships with the theme as `assets/logo-white.png` (navy knocked out to transparency). Theme settings → Logo can override it with an uploaded image or a URL.
- **Store details** (phone, address, booking URL, map, socials) are theme settings, so they're edited once and used everywhere.
- **Every section is editable** in the theme customiser — copy, links, images, buttons. Image pickers fall back to a placeholder URL until a real photo is chosen.
- **Header breakpoints:** full desktop bar (phone number, 88px logo) from 1600px; phone number hidden and the bar tightened from 1280–1599px; compacted further (smaller nav type, 64px logo, tighter booking button) from 1200–1279px; burger menu below 1200px (the six-item menu can't fit beside the logo, icons and booking button on narrower windows). Content sections keep their own 1024px mobile breakpoint. Search, account and cart icons are always visible at every width.
- **Navigation** is driven by Shopify menus (Online Store → Navigation). Each mega-menu column is a menu; the header block chooses which. Footer columns use the `footer-shop`, `footer-services` and `footer-information` menus.

## Templates

| Template | Notes |
| --- | --- |
| `index` | Hero, trust bar, workshop, ring anatomy, wedding builder, category grid, brand strip, testimonials, visit us, newsletter |
| `collection` + `collection.<suffix>` | One JSON template per custom collection (Pandora, Thomas Sabo, engagement rings, watch brands…) carrying the brand copy and FAQs from the old site. A suffix template exists for every collection that had one on Turbo, so no collection falls back to the old theme. |
| `product` | Default product page. `product.no-buy` (call / contact instead of cart), `product.add-diamond` and `product.add-diamond-button` (hand off to the ring builder), `product.engagement-rings-custom`, `product.dropship-template` (warehouse notice). |
| `page.*` | `about`, `brands`, `contact`, `custom-design`, `diamond-knowledge`, `ring-builder` (Nivoda app block), `services`, `wedding-ring-builder` (iframe builder + FAQ). Plain pages use the prose layout. |
| `cart`, `search`, `404`, `blog`, `article`, `list-collections`, `password`, `gift_card` | Restyled. |

## Ring sizing

The product page shows the ring's size as a label plus a navy pill ("Ring size — O½", from `custom.ring_size_variant`, falling back to `custom.ring_size_product`, then to the variant's Size option) with a note pointing customers to contact the store for a different size; rings with no size on file show a "Contact us about sizing" link instead. Both links — and the "Contact us" button on the `product.no-buy` template (Pandora etc.) — open the contact page with `?sku=&design=` query parameters, which `assets/theme.js` copies into the contact form's optional SKU and Design number fields (`contact[SKU]`, `contact[Design number]`, switchable in the Contact form section) so the customer writes their own message. Every buyable product template also has a "Contact us about this piece" button (`contact_link` block, under the booking link) that does the same, so enquiries arrive with the SKU and design number for reference. The size is recorded as a `Ring size` line property on add to cart, so cart lines and orders show it. There is **no online resizing purchase** (Mark removed it, 3 Sep): the hidden Ring resizing product (handle `ring-resizing`) is unused, and the cart only runs legacy housekeeping that removes or quantity-matches any stray resizing service lines from older carts.

## Ring builder (branch `ring-builder`)

Our own builder, replacing the Nivoda Connect app block: `sections/ring-builder.liquid` + `assets/ring-builder.js` / `ring-builder.css`, placed on `templates/page.ring-builder.json`. Four steps — setting, metal & finger size, live diamond, review. Full spec and prerequisites: `SPEC.md` in the `ring-builder` project folder.

- **Mounts** are Shopify products now (collection `ring-mounts`, automated on product type "Ring mount"; metafield definitions `builder.style`, `builder.shapes`, `builder.centre_min_ct`, `builder.centre_max_ct`, `builder.lead_time` are pinned on the product form). The six sample designs were loaded as products `mount-sample-*` (tags `hidden-service`, `builder`, `sample-design`) so the flow can be tested end to end; delete them when the real catalogue lands. The section's "Source" setting also still offers: *Sample designs* (`assets/ring-mounts-sample.json`, stand-ins until the CAD designer's catalogue arrives — the images are the prototype's Smiling Rocks renders and must not go live) or *Products in a collection* (one product per design, one variant per metal, `builder.*` metafields and render images named by alt text `Metal|Shape`; details in the comment at the top of the section).
- **Diamonds** come from the Builder API on the droplet (`https://dashboard.burrowsjewellers.com.au/ring-builder/api`, Node service in `/opt/ring-builder-api`), which queries Nivoda live and applies the Burrows margin matrix. The section sends `minct/maxct/cert/limit` for the v2 API and filters client-side as well, so it works against the v1 API too (which only returns ~10 stones per shape).
- **Review step**: "Add to cart" appears when the Builder API reports `cart: true` on `/api/health` (i.e. it has a Shopify Admin token). The theme POSTs the build to `/api/cart`; the API re-checks the stone with Nivoda, prices it server-side, creates **the diamond as a hidden Shopify product** (type "Diamond", SKU = certificate number, tagged `hidden-service` + `ring-builder`, published to the Online Store only) and returns its variant id; the theme then adds two lines to the normal cart — the setting's own variant and the diamond — sharing the build ID, setting, stone, finger size and lead time as line properties. (For sample designs with no real variant the API makes one combined "Ring build" product instead.) Builds nobody buys are archived after 7 days by the API. Without the token the customer sends an enquiry instead — the contact form's SKU and Design number fields are prefilled with the setting/metal/size and the stone's certificate.
- The design is mirrored in the URL (`?mount=…&shape=…&metal=…&size=…&stone=…`) so it can be shared or saved; "Copy a link to this design" uses that.
- `snippets/ring-builder-capture.liquid` (Klaviyo save-design popup) still targets the old `/apps/ring-creator/` path and needs re-pointing once the flow is final.

## Integrations

All switchable under Theme settings → Integrations: Google Tag Manager, Google Customer Reviews badge, Calendly booking tracking (Meta Pixel / GA4 / dataLayer), and the Klaviyo persona / saved-design capture popup on the ring builder (`snippets/ring-builder-capture.liquid`, ported verbatim). App embeds carried over from the old theme in `config/settings_data.json`: Klaviyo, Shopify Inbox, Microsoft Clarity, Instafeed, countdown timers. Product pages and the ring builder page accept app blocks (`@app`) for Stamped reviews, Afterpay messaging, Nivoda and similar.

## Deploying

The repo is connected to the store through Shopify's GitHub integration. Every push to `main` updates the unpublished "burrows-shopify-theme/main" theme in Online Store → Themes. Nothing goes live until someone publishes that theme in the Shopify admin.

Three things to know about the sync:

- Only files changed in a commit are re-synced, and a file that fails Shopify's validation is dropped silently. If a change doesn't appear, run `shopify theme check` on the file or push it again with a trivial edit.
- Binary assets (currently just `assets/logo-white.png`) were uploaded straight to the theme via the Admin API rather than through Git.
- The sync is two-way: saving in the theme customiser commits back to this repo (as `shopify[bot]`, with every JSON template pretty-printed). Always pull before pushing.

## Local checks

```
npm i -g @shopify/cli
shopify theme check
```

## Status

- [x] Phase 1 — foundation, header/nav, footer, home page
- [x] Phase 2 — collection + product pages (incl. all custom template suffixes)
- [x] Phase 3 — cart, search, blog, pages, integrations
- [ ] Phase 4 — review feedback, real photography and reviews, QA on phones, cutover

Known open items: the Nivoda ring builder app block renders but looked blank in theme preview (check it in the customiser); home-page images and testimonials are still placeholder content.
