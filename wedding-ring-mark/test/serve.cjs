/* Local stand-in for the Shopify page: the theme's base.css + critical.css (to prove the shadow root keeps them out),
   the section's markup and config, a mock /cart/add.js (records to test/cart-adds.json), and the wedding ring API
   in-process (live Infinity prices; FAKE_PRICE=1 to fake). Pages: /pages/wedding-ring-builder, /pages/wedding-ring-catalogue. */
const http = require('http'), fs = require('fs'), path = require('path');
const THEME = path.resolve(__dirname, '..', '..');
const SERVER = process.env.WR_SERVER || path.resolve(THEME, '..', '..', 'nn', 'repo2', 'wedding-ring-server');
const { createHandler } = require(path.join(SERVER, 'handler.js'));
const fake = process.env.FAKE_PRICE === '1';
const api = createHandler({
  env: { PRICE_MODEL: 'rrp', PUBLIC_URL: 'http://localhost:8792/wedding-ring/api', CORS_ORIGINS: 'http://localhost:8792', RATE_PER_MIN: '600', FROM_PRICES: 'off' },
  previewDir: path.join(__dirname, 'previews'),
  fetch: fake ? async (u) => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ price: 1000 + (u.length % 97) * 10 }) }) : undefined,
  log: () => {},
});
const adds = [];
const page = (view) => {
  const sec = fs.readFileSync(path.join(THEME, 'sections', 'wedding-ring-builder.liquid'), 'utf8');
  const body = sec.slice(sec.indexOf('<link rel="preconnect"'), sec.indexOf('{%- comment -%} The built bundle'))
    .replace(/\{\{ settings\.store_phone_display \}\}/g, '03 5023 2357')
    .replace(/<script type="application\/json" data-wr-config>[\s\S]*?<\/script>/, `<script type="application/json" data-wr-config>${JSON.stringify({ view, apiBase: 'http://localhost:8792/wedding-ring/api', depositVariantId: 56711642382641, depositAud: 200, pageUrl: 'http://localhost:8792/pages/wedding-ring-builder', catalogueUrl: 'http://localhost:8792/pages/wedding-ring-catalogue' })}</script>`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>harness</title>
<style>:root{--navy:#0f1233;--ink:#171d50;--body:#484b66;--muted:#7f829b;--cream:#f6f1e7;--gold:#d6af35;--gold-dark:#8f7420;--font-heading:'Cormorant Garamond',Georgia,serif;--font-body:'Manrope',system-ui,sans-serif;--header-height:100px}</style>
<link rel="stylesheet" href="/assets/critical.css"><link rel="stylesheet" href="/assets/base.css">
</head><body><header id="shopHeader" style="height:100px;background:#171d50;color:#fff;display:flex;align-items:center;padding:0 56px;font-family:Georgia,serif;font-size:28px">BURROWS (shop header)</header>
<main class="main-content"><section class="shopify-section section-wedding-ring-builder">${body}</section><script src="/assets/wedding-ring-builder.js" type="module"></script></main>
<footer style="height:200px;background:#171d50;color:#fff;padding:40px">shop footer</footer></body></html>`;
};
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/wedding-ring/')) return api(req, res);
  if (url.pathname === '/cart/add.js') {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { adds.push(JSON.parse(b)); fs.writeFileSync(path.join(__dirname, 'cart-adds.json'), JSON.stringify(adds, null, 2)); res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"items":[]}'); });
    return;
  }
  if (url.pathname === '/cart') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end('<h1 id="cartPage">Cart</h1>'); }
  if (url.pathname === '/pages/wedding-ring-builder' || url.pathname === '/pages/wedding-ring-catalogue') {
    res.writeHead(200, { 'content-type': 'text/html' }); return res.end(page(url.pathname.endsWith('catalogue') ? 'catalogue' : 'designer'));
  }
  const file = path.join(THEME, url.pathname);
  if (!file.startsWith(THEME) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(8792, '127.0.0.1', () => console.log('harness on http://localhost:8792/pages/wedding-ring-builder'));
