# Ring Builder — Project Handover & History

> Context for any future Claude session (or developer) picking this up. Written Sept 2026,
> reconstructed from the Cowork build session that stood up the live diamond API. Read this
> alongside `README.md` (the theme + builder are documented there under **Ring builder**).
> **No credentials are in this repo or this file** — only where they live.

---

## 1. The big picture — two halves of one system

The Burrows ring builder is **two pieces that talk to each other**:

1. **Front end (this repo, `ring-builder` branch):** a native builder built into the Shopify
   theme — `sections/ring-builder.liquid` + `assets/ring-builder.js` / `ring-builder.css`,
   on `templates/page.ring-builder.json`. Four steps: setting → metal & finger size →
   live diamond → review. It is the customer-facing UI.

2. **Back end (DigitalOcean droplet):** a small Node service, the **Builder API**, that queries
   **Nivoda live**, applies the **Burrows margin matrix**, and (eventually) creates the Shopify
   cart line. The theme's `ring-builder.js` calls it at `cfg.apiBase`
   (= `https://dashboard.burrowsjewellers.com.au/ring-builder/api`).

They were built in separate sessions; this handover exists because the chat that built the
**back end** was hard to find again. The code was recovered into this branch as the durable record.

---

## 2. Current live state (what works today)

- **Builder API** runs on the droplet under **PM2** as `ring-builder-api`, from `/opt/ring-builder-api/server.js`, listening on `127.0.0.1:3100`.
- It authenticates to **Nivoda PRODUCTION** (`https://integrations.nivoda.net/api/diamonds`), queries live stones, converts USD→AUD (live FX, 12 h cache, fallback 1.4437), applies the **margin matrix**, caches 10 min per shape+type.
- **nginx** on the droplet proxies `location /ring-builder/api/ → http://127.0.0.1:3100/api/` inside the `dashboard.burrowsjewellers.com.au` server block.
- A **standalone demo page** (separate from this theme) is also served at
  `https://dashboard.burrowsjewellers.com.au/ring-builder/` from `/var/www/ring-builder/index.html`
  via an `^~ /ring-builder/` nginx rule. This was the proof shown to Nivoda to obtain production
  API access. The theme builder is the real front end; the standalone page can be retired later.
- Endpoints working now: `GET /api/health` → `{ok:true}` and `GET /api/diamonds?shape=&type=` → live priced stones.

### Endpoints NOT built yet (the theme expects them)
- `GET /api/health` does **not** yet return `cart:true` (needs a Shopify Admin token).
- `POST /api/cart` **does not exist yet**.
- `GET /api/diamonds` ignores `minct/maxct/limit/offset/cert` and returns a fixed carat-band set
  (~10–12 stones). The theme treats this as "v1" and still works, but with no real filtering or
  pagination. See §5 for the v2 contract it wants.

---

## 3. Infrastructure & where things live

| Thing | Location |
|---|---|
| Droplet | `root@burrows-server`, public IP `170.64.193.208`, Ubuntu 22.04 |
| Builder API code | `/opt/ring-builder-api/server.js` (zero-dep Node 18+, margin matrix baked in) |
| Builder API env | `/opt/ring-builder-api/.env` (Nivoda prod creds + `PORT=3100`) — `chmod 600` |
| Process manager | PM2 process `ring-builder-api` (`pm2 logs ring-builder-api`, `pm2 restart …`) |
| nginx site | `/etc/nginx/sites-available/dashboard.burrowsjewellers.com.au` (backups `~/dashboard-nginx.bak-*`) |
| Standalone demo page | `/var/www/ring-builder/index.html` (durable — outside the dashboard build) |
| Dashboard SPA (separate app) | `/var/www/burrows-dashboard/frontend/dist` — **build folder; wiped on redeploy** |

**Gotcha that bit us:** we first put the demo page inside the dashboard's `dist/` folder; a dashboard
rebuild deleted it, and the dashboard SPA also owns a client-side `/ring-builder` "coming soon" route.
Fix: serve from `/var/www/ring-builder` with an `^~ /ring-builder/` nginx rule so it beats the SPA and
survives rebuilds. **Never put builder files inside `.../frontend/dist`.**

---

## 4. Credentials — where they live (never in git)

- **Nivoda STAGING** — public shared test creds (`testaccount@sample.com` / `staging-nivoda-22`,
  endpoint `intg-customer-staging.nivodaapi.net`). Not secret. Used to build the demo before prod access.
- **Nivoda PRODUCTION** — Mark's real feed login. Lives **only** in `/opt/ring-builder-api/.env` on the
  droplet, and in a local file `nivoda.txt` in Mark's Downloads. **Never commit these.**
- **Shopify Admin token** (for the future `/api/cart`) — not created yet. When made, it goes in the
  droplet `.env` only.

---

## 5. The Builder API contract the theme expects (v2)

Extracted from `assets/ring-builder.js`. `cfg.apiBase` = `…/ring-builder/api`.

### `GET {apiBase}/diamonds`
Query params the theme sends:
`shape` (UPPER e.g. ROUND), `type` (`lab`|`nat`), `minct`, `maxct`, `limit` (48), `offset`, `cert=1` (optional, certified-only).
**v2 response wanted:** `{ stones:[…], total:<int>, offset:<int> }`. The theme detects v2 by the presence
of numeric `total` + `offset`, and shows "Show more" / real counts. (v1 = just `{stones:[…]}`, no paging.)

**Stone object** — theme uses these fields (current API supplies the first row; add the rest for v2):
`ct, shape, col, cl, cut, lab, cert, retail` *(have)* · `id, item_id, image, video, polish, symmetry,
fluorescence, measurements, delivery` *(missing — add)*. `item_id`/`id` are needed so `/cart` can
re-fetch the exact stone from Nivoda.

### `GET {apiBase}/health`
Return `{ ok:true, cart:<bool> }`. `cart` must be **true only when a Shopify Admin token is present**.
The theme shows **Add to cart** only when `cart:true`; otherwise it shows an **Enquiry** button
(contact form prefilled with setting SKU + stone cert).

### `POST {apiBase}/cart`
Body the theme posts:
```json
{ "build":"RB-…", "type":"lab", "size":"O½",
  "mount":{ "id","ref","title","metal","price","variant_id","shape" },
  "stone":{ "id","item_id","cert","lab","retail" } }
```
Expected server behaviour: re-check the stone is still available with Nivoda; re-price server-side
(never trust the client price); create **one hidden Shopify product for the whole build** (setting +
stone), tagged `hidden-service` + `ring-builder`, published to the Online Store only; return
`{ variant_id, build, stone:{title} }`. The theme then calls Shopify `/cart/add.js` with that
`variant_id` + line properties (build id, setting, stone, finger size, lead time).
Error codes the theme handles: **409** or `{error:"stone_unavailable"}` → "just taken, pick another";
**501** → cart off, fall back to enquiry; anything else → generic retry.
Housekeeping: the API should archive unbought build-products after ~7 days.

---

## 6. Settings ("mounts") data model

Currently `assets/ring-mounts-sample.json` (Smiling Rocks prototype renders — **flagged do-not-publish**;
they stand in until the CAD catalogue exists). Or a Shopify collection (one product per design, one
variant per metal, `builder.*` metafields). Mount shape:
```
{ id, ref, title, style, shapes:[…], centre_min_ct, centre_max_ct,
  metals:[{ name, price, variant_id? }], renders:{ "<Metal>":{ "<Shape>":url } },
  lead_time, sample:true }
```
The 6 sample designs (HL, P, PP, SL, SP, SS) mirror the Smiling Rocks families we captured (halo,
solitaire, pavé variants), all six shapes, $1,438–$2,518 settings.

---

## 7. Diamonds & pricing (the margin matrix)

- Source: **Nivoda** GraphQL (`authenticate { username_and_password }` → token; `diamonds_by_query`).
- Price path (per stone): `USD (price/100) → ×FX → ×1.1 GST = AUD cost inc GST → apply margin bracket → charm-round`.
- **Margin matrix** = Burrows StockEntryCheatSheet v3.0 (June 2026): cost-bracket → markup %, with
  **lab-grown shifted 2 brackets toward higher markup**, then charm rounding (…$x95). It is **baked into
  `server.js`** (edit the `MATRIX` object + `pm2 restart` to change). Source of truth also lives in the
  `nivoda-diamond-pricing` Cowork skill (`assets/margin-matrix.json`).
- Note: production lab-grown prices came back low for small stones — worth a sanity check against real
  retail; a bracket tweak may be wanted.

---

## 8. Prioritised remaining work

**A. Match the Nivoda query to the user's selection (v2 `/api/diamonds`).** Honour `minct/maxct` (from the
mount's `centre_min_ct/max_ct` and the customer's carat filter), `cert`, `limit`, `offset`; return
`total`+`offset` for paging; add the richer stone fields (image, video, item_id, measurements, cut/
polish/symmetry, fluorescence). Today it returns fixed carat-band samples regardless of selection —
**this is the "queries don't match the selection" issue.**

**B. Shopify Add-to-Cart with a 25% deposit.** Build `POST /api/cart` + Shopify Admin token so
`/health` reports `cart:true`. **New requirement:** the cart should take a **25% deposit**, not the full
price. Options to weigh: create the hidden build-product priced at 25% of the total (with the balance
noted as due on completion via line properties/order notes), or use a deposit/partial-payment app or a
Shopify draft order. Decide the deposit mechanism, then price the hidden product/line accordingly and
make the balance unmistakable to staff and customer.

**C. CAD from the design spec.** A full CAD design brief for the modular "one shank, many heads"
signature setting (0.5–5 ct, 6 shapes, 3 metals) was written — it's the file
`Burrows_CAD_Design_Brief_Modular_Ring.docx` (Mark's Downloads). Next: confirm base style
(solitaire/pavé/halo), send to the CAD designer, and replace the sample Smiling Rocks renders with the
real catalogue (one product/design, `builder.*` metafields, renders named `Metal|Shape`).

**Smaller:** optional pretty subdomain `ringbuilder.burrowsjewellers.com.au` (DNS A → droplet + nginx
block + certbot) for a clean customer URL; retire the standalone demo page once the theme builder is the
canonical front end.

---

## 9. Artifact index

- **This repo, `ring-builder` branch** — the theme + native builder (`sections/ring-builder.liquid`,
  `assets/ring-builder.js/.css`, `ring-mounts-sample.json`, `templates/page.ring-builder.json`).
  `README.md` documents the theme; a `SPEC.md` for the builder lives in the local Cowork project folder
  (not in git).
- **Droplet** — `/opt/ring-builder-api/server.js` (Builder API). *(Not yet mirrored to git — worth adding
  a repo for it.)*
- **Local (Mark's Downloads)** — `ring-builder-server.js`, `ring-builder-index.html`,
  `RING-BUILDER-DEPLOY.md`, `Burrows_CAD_Design_Brief_Modular_Ring.docx`,
  `burrows-smiling-rocks-catalogue.xlsx` (1,392-row settings catalogue we scraped), `nivoda.txt` (prod
  creds — keep private).

---

## 10. Condensed history (how we got here)

1. Investigated the incumbent **VDB Ring Creator** (Shopify app proxy → a PHP backend on Cloudways).
   Found its data model: settings = parent *family* + shape-specific *heads*, encoded
   `STYLE-CARAT-METAL-SHAPE`. Confirmed shape-swap = sibling-SKU lookup.
2. Scraped the full **Smiling Rocks** settings catalogue via the builder's `rb-setting-list.php`
   (4,828 rows; vendor 12677 = Smiling Rocks; 465 designs × shapes/carats/metals). → `…catalogue.xlsx`.
3. Built a **prototype** (settings + sample diamonds), then wired in **live Nivoda staging**, hosted it
   to show Nivoda the use case → they granted **production** API access.
4. Built the **Builder API** (Node) and deployed it to the droplet (PM2 + nginx). Verified live
   production stones priced by the margin matrix.
5. Discovered the parallel **Shopify theme** `ring-builder` branch already contains a full native builder
   that calls this API and has the Add-to-Cart flow designed — the two tracks converge here.
6. Next: v2 query matching, 25% deposit cart, and CAD from the design brief (§8).
