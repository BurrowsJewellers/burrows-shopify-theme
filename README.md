# Burrows Jewellers — Shopify theme

A from-scratch Shopify Online Store 2.0 theme for burrowsjewellers.com.au, built from the July 2026 "Website Redesign (Claude)" design draft. It replaces the Turbo (Out of the Sandbox) theme.

## How it's set up

- **Base:** Shopify's Skeleton theme (no jQuery, no vendor bundles). All CSS lives in `assets/base.css` plus per-section `{% stylesheet %}` blocks; all JS in `assets/theme.js` (dependency-free).
- **Design tokens:** colours and fonts are theme settings (Theme settings → Colours / Typography) and exposed as CSS variables in `snippets/css-variables.liquid`.
- **Store details** (phone, address, booking URL, map, socials) are theme settings, so they're edited once and used everywhere.
- **Every home-page section is editable** in the theme customiser — copy, links, images, buttons. Image pickers fall back to a placeholder URL until a real photo is chosen.
- **Navigation** is driven by Shopify menus (Online Store → Navigation). Each mega-menu column is a menu; the header block chooses which.

## Deploying

The repo is connected to the store through Shopify's GitHub integration. Every push to `main` updates the unpublished "burrows-shopify-theme/main" theme in Online Store → Themes. Nothing goes live until someone publishes that theme in the Shopify admin.

## Local checks

```
npm i -g @shopify/cli
shopify theme check
```

## Status

- [x] Phase 1 — foundation, header/nav, footer, home page
- [ ] Phase 2 — collection + product pages (incl. custom template suffixes)
- [ ] Phase 3 — cart, search, accounts, blog, pages, integrations (GTM, Klaviyo, Calendly, Stamped, ring creator)
- [ ] Phase 4 — QA, cutover
