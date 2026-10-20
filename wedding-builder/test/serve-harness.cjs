/* Serves the theme folder on :8791 with /cart/add.js mocked (records the body in test/cart-adds.json) and
   /wedding-ring/api/* handled in-process by the wedding ring server (LIVE Infinity lookups; set FAKE_PRICE=1 to fake). */
const http = require('http');
const fs = require('fs');
const path = require('path');
const THEME = path.resolve(__dirname, '..', '..');
const SERVER = process.env.WR_SERVER || path.resolve(THEME, '..', 'name-necklace-builder', 'wedding-ring-server'); // a checkout of the necklace repo beside this one, or WR_SERVER=
const { createHandler } = require(path.join(SERVER, 'handler.js'));
const previewDir = path.join(__dirname, 'previews');
const fake = process.env.FAKE_PRICE === '1';
const api = createHandler({
  env: { PRICE_MODEL: 'rrp', PUBLIC_URL: 'http://localhost:8791/wedding-ring/api', CORS_ORIGINS: 'http://localhost:8791', CACHE_MIN: '10', STALE_HOURS: '24', RATE_PER_MIN: '600' },
  previewDir,
  fetch: fake ? async (url) => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ price: 1000 + (url.length % 97) * 10 }) }) : undefined,
  log: (...a) => console.log('[api]', ...a),
});
const adds = [];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.glb': 'model/gltf-binary' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/wedding-ring/')) return api(req, res);
  if (url.pathname === '/cart/add.js') {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
      const body = JSON.parse(b); adds.push(body); fs.writeFileSync(path.join(__dirname, 'cart-adds.json'), JSON.stringify(adds, null, 2));
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ items: body.items.map((i) => ({ id: i.id, quantity: i.quantity, properties: i.properties })) }));
    });
    return;
  }
  if (url.pathname === '/cart') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end('<h1 id="cartPage">Cart</h1>'); }
  const file = path.join(THEME, url.pathname === '/' ? 'wedding-builder/test/harness.html' : url.pathname.replace(/^\/test\//, 'wedding-builder/test/'));
  if (!file.startsWith(THEME) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found ' + url.pathname); }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(8791, '127.0.0.1', () => console.log('harness on http://localhost:8791/test/harness.html'));
