/* Renders Mark's live preview and our build side by side and saves the <main> of each (desktop 1440, phone 390),
   for the designer and the catalogue. Our page is the local harness (test/serve.cjs) with the theme CSS loaded. */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'compare'); fs.mkdirSync(OUT, { recursive: true });
const cacheDir = path.join(__dirname, 'net-cache');
async function viaNode(route) {
  const req = route.request(), u = req.url();
  if (req.method() !== 'GET') { try { const r = await fetch(u, { method: req.method(), headers: req.headers(), body: req.postDataBuffer() || undefined }); const b = Buffer.from(await r.arrayBuffer()); const h = {}; r.headers.forEach((v, k) => { if (!/encoding|length/i.test(k)) h[k] = v; }); return route.fulfill({ status: r.status, headers: h, body: b }); } catch (e) { return route.abort(); } }
  const key = path.join(cacheDir, require('crypto').createHash('sha1').update(u).digest('hex'));
  try {
    let body, type, st = 200;
    if (fs.existsSync(key)) { body = fs.readFileSync(key); type = fs.readFileSync(key + '.type', 'utf8'); }
    else { const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } }); st = r.status; body = Buffer.from(await r.arrayBuffer()); type = r.headers.get('content-type') || ''; if (r.ok && !/(rings\.|\/\/)burrowsjewellers\.com\.au/.test(u)) { fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(key, body); fs.writeFileSync(key + '.type', type); } }
    return route.fulfill({ status: st, headers: { 'content-type': type, 'access-control-allow-origin': '*' }, body });
  } catch (e) { return route.abort(); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const BASE = process.env.OURS || 'http://localhost:8792';
  const shots = [
    ['designer', 'https://rings.burrowsjewellers.com.au/', BASE + '/pages/wedding-ring-builder'],
    ['ring-ac6', 'https://rings.burrowsjewellers.com.au/rings/ac6', BASE + '/pages/wedding-ring-builder?ring=ac6'],
    ['catalogue', 'https://rings.burrowsjewellers.com.au/catalogue', BASE + '/pages/wedding-ring-catalogue'],
  ];
  const errs = [];
  for (const [vpName, vp, mobile] of [['desktop', { width: 1440, height: 1000 }, false], ['phone', { width: 390, height: 844 }, true]]) {
    for (const [name, mark, ours] of shots) {
      for (const [who, url] of [['mark', mark], ['ours', ours]]) {
        const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, locale: 'en-AU', timezoneId: 'Australia/Melbourne' });
        await ctx.route(/^https:\/\//, viaNode);
        const p = await ctx.newPage();
        p.on('pageerror', (e) => errs.push(`${who} ${name}: ${e.message}`));
        await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const sel = who === 'ours' ? '[data-wr-app] main' : 'main'; await p.waitForSelector(sel, { timeout: 60000 });
        // his live preview opens on IN1004 (an older publish); show the same style on ours for a like-for-like picture
        if (who === 'ours' && name === 'designer') { await p.locator('[data-wr-app] select').first().selectOption('in1004'); }
        // let fonts, photos, the 3D model and the price settle; scroll through so lazy photos load
        await p.waitForTimeout(6000);
        await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
        await p.waitForTimeout(5000);
        // the shop's sticky header would sit over the top of our element shot: hide it (it is not part of his page)
        if (who === 'ours') await p.evaluate(() => document.querySelectorAll('.shopify-section-group-header-group, #shopHeader').forEach((e) => { e.style.visibility = 'hidden'; }));
        // the price timestamp differs by the second: hide it in both
        await p.evaluate(() => { const walk = (root) => root.querySelectorAll('p').forEach((el) => { if (/^Checked /.test(el.textContent || '')) el.style.visibility = 'hidden'; }); walk(document); const h = document.querySelector('[data-wr-app]'); if (h && h.shadowRoot) walk(h.shadowRoot); });
        await p.locator(sel).first().screenshot({ path: path.join(OUT, `${vpName}-${name}-${who}.png`), animations: 'disabled', timeout: 60000 });
        await ctx.close();
      }
    }
  }
  console.log('errors:', errs.length ? errs : 'none');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
