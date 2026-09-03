# Burrows Jewellers — Shopify theme

A from-scratch Shopify Online Store 2.0 theme for burrowsjewellers.com.au, built from the July 2026 "Website Redesign (Claude)" design draft. It replaces the Turbo (Out of the Sandbox) theme.

## How it's set up

- **Base:** Shopify's Skeleton theme (no jQuery, no vendor bundles). All CSS lives in `assets/base.css` plus per-section `{% stylesheet %}` blocks; all JS in `assets/theme.js` (dependency-free).
- **Design tokens:** colours and fonts are theme settings (Theme settings → Colours / Typography) and exposed as CSS variables in `snippets/css-variables.liquid`.
- **Backgrounds:** the site is cream by default. Theme settings → Colours → "Shop page background" switches collection, product, search and cart pages to white (the default), because product photos are shot on white. Implemented as `body.shop-white` in `layout/theme.liquid` plus the overrides at the end of `assets/base.css`.
- **Logo:** the Burrows white logo ships with the theme as `assets/logo-white.png` (navy knocked out to transparency). Theme settings → Logo can override it with an uploaded image or a URL.
- **Store details** (phone, address, booking URL, map, socials) are theme settings, so they're edited once and used everywhere.
- **Every section is editable** in the theme customiser — copy, links, images, buttons. Image pickers fall back to a placeholder URL until a real photo is chosen.
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

The product page shows the ring's size as a label plus a navy pill ("Ring size — O½", from `custom.ring_size_variant`, falling back to `custom.ring_size_product`, then to the variant's Size option) with a note pointing customers to contact the store for a different size; rings with no size on file show a "Contact us about sizing" link instead. Both links open the contact page with the message prefilled (ring name, design number, SKU, current size, product link and a "Size I need:" line) via a `?message=` query parameter that `assets/theme.js` reads on the contact page. The size is recorded as a `Ring size` line property on add to cart, so cart lines and orders show it. There is **no online resizing purchase** (Mark removed it, 3 Sep): the hidden Ring resizing product (handle `ring-resizing`) is unused, and the cart only runs legacy housekeeping that removes or quantity-matches any stray resizing service lines from older carts.

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
