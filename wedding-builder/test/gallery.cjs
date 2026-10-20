/* Gallery flow in Chromium against the harness: gallery → tile → designer (step 2) → Change style → gallery → draft skips it. */
const { chromium } = require('playwright');
const path = require('path');
const out = (n) => path.join(__dirname, n);
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const assert = require('assert');
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  // In the sandbox the browser cannot reach the CDN directly (the egress proxy's CA), so CDN requests are fetched by
  // Node (which can) and handed to the page; cached under test/cdn-cache/. Set CDN_VIA_NODE=0 to let the browser go direct.
  const fs = require('fs');
  const cacheDir = path.join(__dirname, 'cdn-cache');
  const viaNode = process.env.CDN_VIA_NODE !== '0';
  const cdnRoute = async (route) => {
    const u = route.request().url();
    const key = path.join(cacheDir, require('crypto').createHash('sha1').update(u).digest('hex'));
    try {
      let body, type;
      if (fs.existsSync(key)) { body = fs.readFileSync(key); type = fs.readFileSync(key + '.type', 'utf8'); }
      else {
        const r = await fetch(u); if (!r.ok) return route.fulfill({ status: r.status });
        body = Buffer.from(await r.arrayBuffer()); type = r.headers.get('content-type') || 'application/octet-stream';
        fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(key, body); fs.writeFileSync(key + '.type', type);
      }
      return route.fulfill({ status: 200, headers: { 'content-type': type, 'access-control-allow-origin': '*' }, body });
    } catch (e) { return route.abort(); }
  };
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  if (viaNode) await ctx.route(/https:\/\/cdn\.shopify\.com\//, cdnRoute);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const url = process.env.URL || 'http://localhost:8791/test/harness.html';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#gallery .wr-g__tile', { timeout: 30000 });
  const tiles = await page.$$('#gallery .wr-g__tile');
  console.log('tiles:', tiles.length);
  assert.strictEqual(tiles.length, 53);
  assert.strictEqual(await page.$('#barPrice'), null, 'no designer yet');
  // wait for from-prices (the harness server may be fetching them live)
  for (let i = 0; i < 120; i++) { const t = await page.textContent('#gallery .wr-g__tile:first-child .wr-g__from'); if (/from \$/.test(t)) break; await page.waitForTimeout(1000); }
  const froms = await page.$$eval('#gallery .wr-g__from', (els) => els.map((e) => e.textContent));
  console.log('from prices:', froms.slice(0, 6).join(' | '), '… priced:', froms.filter((t) => /from \$/.test(t)).length, 'enquiry:', froms.filter((t) => /enquiry/.test(t)).length, 'other:', froms.filter((t) => !/from \$|enquiry/.test(t)).length);
  await page.screenshot({ path: out('shot-gallery.png'), fullPage: false });
  // chips
  await page.click('[data-collection="diamond"]');
  await page.waitForTimeout(200);
  console.log('diamond tiles:', (await page.$$('#gallery .wr-g__tile')).length);
  assert.strictEqual((await page.$$('#gallery .wr-g__tile')).length, 3);
  await page.click('[data-collection="two-tone"]');
  await page.waitForTimeout(200);
  console.log('two-tone tiles:', (await page.$$('#gallery .wr-g__tile')).length);
  await page.screenshot({ path: out('shot-gallery-twotone.png'), fullPage: false });
  // pick a style
  await page.click('#gallery .wr-g__tile[data-ring="in1036"]');
  await page.waitForSelector('#barPrice', { timeout: 30000 });
  await page.waitForTimeout(3500);
  const open2 = await page.getAttribute('#wrHead2', 'aria-expanded');
  const chosen = await page.textContent('#chosenStyle .wr__chosen-text b');
  console.log('designer opened; step 2 open:', open2, '| chosen:', chosen, '| bar:', await page.textContent('#barPrice'), '| step1 header:', await page.textContent('#wrHead1 .wr__h-v'));
  assert.strictEqual(open2, 'true');
  assert.strictEqual(chosen, 'IN1036');
  await page.screenshot({ path: out('shot-after-pick.png'), fullPage: false });
  // set a size + engraving, then change style and check they carry over
  await page.click('#wrHead4');
  await page.waitForTimeout(200);
  await page.click('#sizeChips .wr__chip:has-text("T")');
  await page.fill('#engIn', 'Always');
  await page.waitForTimeout(400);
  await page.click('#wrHead1');
  await page.waitForTimeout(200);
  await page.click('#changeStyle');
  await page.waitForSelector('#gallery .wr-g__tile', { timeout: 10000 });
  console.log('back in gallery via Change style; url:', page.url().replace(/^.*\//, '/'));
  await page.click('#gallery .wr-g__tile[data-ring="ac6"]');
  await page.waitForSelector('#barPrice', { timeout: 30000 });
  await page.waitForTimeout(3000);
  const kept = await page.textContent('#wrHead4 .wr__h-v');
  console.log('after second pick, step 4 says:', kept);
  assert.ok(/Size T/.test(kept) && /Always/.test(kept), 'size and engraving carried over');
  // browser back → gallery
  await page.goBack();
  await page.waitForSelector('#gallery .wr-g__tile', { timeout: 10000 });
  console.log('browser back → gallery ok');
  // reload → the draft skips the gallery
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice', { timeout: 30000 });
  assert.strictEqual(await page.$('#gallery'), null);
  console.log('reload with draft → designer directly, style:', await page.textContent('#wrHead1 .wr__h-v'));
  // share link → designer directly
  await page.goto(url + '?ring=in1915&metal=zirconium&w=6&t=1.6&size=P', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice', { timeout: 30000 });
  assert.strictEqual(await page.$('#gallery'), null);
  console.log('share link → designer directly, style:', await page.textContent('#wrHead1 .wr__h-v'));
  // staff mode keeps the small pickers
  await page.goto(url + '?staff=1&order=CO-0001&ring=ab2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice', { timeout: 30000 });
  assert.ok(await page.$('.wr__rings'), 'staff sees the pickers');
  assert.strictEqual(await page.$('#changeStyle'), null);
  console.log('staff mode: pickers present, no Change style');
  // mobile gallery
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  if (viaNode) await m.route(/https:\/\/cdn\.shopify\.com\//, cdnRoute);
  const mp = await m.newPage();
  await mp.goto(url, { waitUntil: 'domcontentloaded' });
  await mp.waitForSelector('#gallery .wr-g__tile', { timeout: 30000 });
  await mp.waitForTimeout(2500);
  await mp.screenshot({ path: out('shot-gallery-mobile.png'), fullPage: false, animations: 'disabled', timeout: 60000 });
  await mp.click('#gallery .wr-g__tile[data-ring="ea"]');
  await mp.waitForSelector('#barPrice', { timeout: 30000 });
  await mp.waitForTimeout(3500);
  await mp.screenshot({ path: out('shot-after-pick-mobile.png'), fullPage: false, animations: 'disabled', timeout: 60000 });
  // a model that fails to load must not blank the page
  const b = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  await b.route(/\.glb(\?|$)/, (route) => route.abort());
  if (viaNode) await b.route(/https:\/\/cdn\.shopify\.com\/s\//, cdnRoute);
  const bp = await b.newPage();
  await bp.goto(url + '?ring=ac6', { waitUntil: 'domcontentloaded' });
  await bp.waitForSelector('#stageFallback', { timeout: 30000 });
  await bp.waitForTimeout(2500);
  console.log('model blocked → fallback shown, bar:', await bp.textContent('#barPrice'), '| steps still there:', !!(await bp.$('#wrHead3')));
  assert.ok(await bp.$('#wrHead3'));
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.filter((e) => !/favicon/.test(e)).length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
