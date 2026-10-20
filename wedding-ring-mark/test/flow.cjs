/* Behaviour on our build: catalogue photos load and tiles link to the designer; size guide dialog opens styled and
   closes; IN1915 reference photo; Pay deposit -> /cart/add.js with his properties + design link, SKU and picture
   -> /cart; share link points at the website; staff mode extras + Save to order message to the opener. */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), assert = require('assert');
const cacheDir = path.join(__dirname, 'net-cache');
async function viaNode(route) {
  const u = route.request().url(), key = path.join(cacheDir, require('crypto').createHash('sha1').update(u).digest('hex'));
  try { let body, type; if (fs.existsSync(key)) { body = fs.readFileSync(key); type = fs.readFileSync(key + '.type', 'utf8'); } else { const r = await fetch(u); body = Buffer.from(await r.arrayBuffer()); type = r.headers.get('content-type') || ''; if (r.ok) { fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(key, body); fs.writeFileSync(key + '.type', type); } } return route.fulfill({ status: 200, headers: { 'content-type': type, 'access-control-allow-origin': '*' }, body }); } catch (e) { return route.abort(); }
}
const B = 'http://localhost:8792';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-AU', permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.route(/^https:\/\//, viaNode);
  const errs = []; const watch = (p, n) => { p.on('pageerror', (e) => errs.push(`${n}: ${e.message}`)); p.on('console', (m) => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(`${n} console: ${m.text().slice(0, 160)}`); }); };
  const R = (s) => `[data-wr-app] ${s}`;
  // The sandbox's software GPU makes his 3D scene slow enough that synthetic mouse input can stall; buttons are pressed
  // with the element's own click() (same handler, same React event).
  const press = (pg, sel) => pg.locator(sel).first().evaluate((el) => el.click());

  // catalogue
  const cat = await ctx.newPage(); watch(cat, 'catalogue');
  await cat.goto(`${B}/pages/wedding-ring-catalogue`, { waitUntil: 'domcontentloaded' });
  await cat.waitForSelector(R('main h1'));
  await cat.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
  await cat.waitForTimeout(3000);
  const imgs = await cat.evaluate(() => [...document.querySelector('[data-wr-app]').shadowRoot.querySelectorAll('main img')].map((i) => ({ ok: i.complete && i.naturalWidth > 0, src: i.src })));
  const tiles = await cat.evaluate(() => [...document.querySelector('[data-wr-app]').shadowRoot.querySelectorAll('main a')].map((a) => a.getAttribute('href')));
  console.log('catalogue:', imgs.length, 'photos,', imgs.filter((i) => i.ok).length, 'loaded; tiles', tiles.length, 'first', tiles[0], 'last', tiles[tiles.length - 1]);
  assert.strictEqual(imgs.length, 53); assert.ok(imgs.every((i) => i.ok), 'every catalogue photo loads: ' + imgs.filter((i) => !i.ok).map((i) => i.src).slice(0, 3));
  assert.ok(tiles.every((h) => /\/pages\/wedding-ring-builder\?ring=[a-z0-9]+$/.test(h)));
  await cat.locator(R('main a')).nth(3).click();
  await cat.waitForURL(/ring=ac6/); await cat.waitForSelector(R('main h1'));
  console.log('tile click ->', cat.url().replace(B, ''), '| heading:', (await cat.locator(R('main h1')).first().innerText()).replace(/\s+/g, ' '));

  // designer: dropdown has 53 unique styles, size guide, IN1915
  const p = await ctx.newPage(); watch(p, 'designer');
  await p.goto(`${B}/pages/wedding-ring-builder`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector(R('main select'));
  const opts = await p.locator(R('main select')).first().locator('option').count();
  console.log('style options:', opts); assert.strictEqual(opts, 53);
  await p.locator(R('button:has-text("Size guide")')).click();
  await p.waitForSelector(R('[role="dialog"]'), { timeout: 5000 });
  const dlg = await p.evaluate(() => { const d = document.querySelector('[data-wr-app]').shadowRoot.querySelector('[role="dialog"]'); const cs = getComputedStyle(d); return { pos: cs.position, bg: cs.backgroundColor, rows: d.querySelectorAll('tbody tr').length }; });
  console.log('size guide dialog:', dlg);
  assert.strictEqual(dlg.pos, 'fixed');
  await p.locator(R('[role="dialog"] table')).click(); await p.waitForTimeout(300);
  assert.ok(await p.locator(R('[role="dialog"]')).count(), 'a click inside the dialog keeps it open');
  await p.screenshot({ path: path.join(__dirname, 'compare', 'ours-size-guide.png') });
  await p.keyboard.press('Escape'); await p.waitForFunction(() => !document.querySelector('[data-wr-app]').shadowRoot.querySelector('[role="dialog"]'), null, { timeout: 10000 }).catch(() => {});
  assert.strictEqual(await p.locator(R('[role="dialog"]')).count(), 0, 'Escape closes it');
  await p.locator(R('button:has-text("Size guide")')).click(); await p.waitForSelector(R('[role="dialog"]'));
  await press(p, R('[role="dialog"] button:has(svg)')); await p.waitForFunction(() => !document.querySelector('[data-wr-app]').shadowRoot.querySelector('[role="dialog"]'), null, { timeout: 10000 }).catch(() => {});
  assert.strictEqual(await p.locator(R('[role="dialog"]')).count(), 0, 'the close button closes it');
  console.log('size guide: opens styled, stays open on a click inside, closes on Escape and on ×');
  await p.locator(R('main select')).first().selectOption('in1915'); await p.waitForTimeout(800);
  console.log('IN1915:', (await p.locator(R('figcaption')).first().innerText()).split('\n')[0]);

  // design something and pay the deposit
  await p.locator(R('main select')).first().selectOption('in1004'); await p.waitForTimeout(500);
  await press(p, R('button:has-text("18ct")'));
  await p.locator(R('input[type="text"]')).fill('Always');
  await p.locator(R('main select')).nth(1).selectOption('R');
  await p.locator(R('input[type="date"]')).fill('2027-03-14');
  await p.locator(R('input[type="checkbox"]')).check();
  await p.waitForFunction(() => /\$\d/.test(document.querySelector('[data-wr-app]').shadowRoot.textContent.match(/Supplier RRP\s*([^\s]+)/)?.[1] || ''), null, { timeout: 30000 });
  const priceTxt = await p.evaluate(() => document.querySelector('[data-wr-app]').shadowRoot.textContent.match(/Supplier RRP\s*(\$[\d,]+)/)[1]);
  await press(p, R('button:has-text("Save or share this design")')); await p.waitForTimeout(500);
  const shared = await p.evaluate(() => navigator.clipboard.readText());
  console.log('price', priceTxt, '| share link:', shared.replace(B, ''));
  assert.ok(shared.startsWith(`${B}/pages/wedding-ring-builder?ring=in1004&`));
  if (fs.existsSync(path.join(__dirname, 'cart-adds.json'))) fs.unlinkSync(path.join(__dirname, 'cart-adds.json'));
  await press(p, R('button:has-text("Pay $200 deposit")'));
  await p.waitForURL(/\/cart$/, { timeout: 30000 });
  const add = JSON.parse(fs.readFileSync(path.join(__dirname, 'cart-adds.json'), 'utf8')).pop();
  const props = add.items[0].properties;
  console.log('cart line: variant', add.items[0].id, '\n', Object.entries(props).map(([k, v]) => `   ${k}: ${String(v).replace(B, '').slice(0, 110)}`).join('\n'));
  assert.strictEqual(add.items[0].id, 56711642382641);
  assert.ok(props['_Supplier SKU'] === 'IN1004' && /ring=in1004/.test(props['Design link']) && /grade=Yellow\+Gold\+18ct/.test(props['Design link']) && /\/preview\/[0-9a-f]+\.jpg$/.test(props['_Preview']) && props['Quoted price (incl GST)'] === priceTxt && props['Engraving'] === 'Always' && /^R \(free ring sizer/.test(props['Finger size']) && props['Date required'] === '14 March 2027');

  // reopen the order's design link: everything comes back, including the grade, sizer and date
  const back = await ctx.newPage(); watch(back, 'reopen');
  await back.goto(props['Design link'], { waitUntil: 'domcontentloaded' });
  await back.waitForFunction(() => /Supplier RRP\s*\$/.test(document.querySelector('[data-wr-app]')?.shadowRoot?.textContent || ''), null, { timeout: 30000 });
  const rows = await back.evaluate(() => [...document.querySelector('[data-wr-app]').shadowRoot.querySelectorAll('dl > div')].map((d) => d.innerText.replace(/\n/g, ': ')));
  console.log('reopened design:', rows.join(' | '));
  assert.ok(rows.some((r) => /Yellow Gold 18ct/.test(r)) && rows.some((r) => /R \(free sizer/.test(r)) && rows.some((r) => /14 March 2027/.test(r)));

  // staff mode, opened by a "dashboard" window
  const dash = await ctx.newPage(); await dash.goto(`${B}/cart`);
  await dash.evaluate(() => { window.got = []; window.addEventListener('message', (e) => window.got.push(e.data)); });
  const staffUrl = `${B}/pages/wedding-ring-builder?staff=1&order=CO-0002&` + new URL(props['Design link']).searchParams.toString();
  const [st] = await Promise.all([ctx.waitForEvent('page'), dash.evaluate((u) => window.open(u, 'editor'), staffUrl)]); watch(st, 'staff');
  await st.waitForFunction(() => /Supplier RRP\s*\$/.test(document.querySelector('[data-wr-app]')?.shadowRoot?.textContent || ''), null, { timeout: 30000 });
  const sizes = await st.locator(R('main select')).nth(1).locator('option').count();
  const slider = await st.evaluate(() => { const r = document.querySelector('[data-wr-app]').shadowRoot.querySelector('input[type=range]'); return { min: r.min, max: r.max, step: r.step }; });
  const tag = await st.locator(R('span:has-text("Staff review")')).first().innerText();
  const btn = await st.locator(R('button:has-text("Save to order")')).count();
  const skuRow = await st.evaluate(() => document.querySelector('[data-wr-app]').shadowRoot.textContent.includes('Supplier SKUIN1004'));
  console.log('staff: sizes', sizes, '| width slider', slider, '| tag', tag, '| Save to order', btn, '| SKU row', skuRow);
  assert.ok(sizes > 100 && btn === 1 && skuRow && slider.step === '0.1');
  await st.screenshot({ path: path.join(__dirname, 'compare', 'ours-staff.png') });
  await press(st, R('button:has-text("Save to order")')); await st.waitForTimeout(1500);
  const got = await dash.evaluate(() => window.got.map((m) => ({ type: m.type, order: m.order, params: m.params, sku: m.priceConfig && m.priceConfig.sku, summary: (m.summary || []).length, preview: (m.preview || '').length })));
  console.log('dashboard got:', JSON.stringify(got));
  assert.ok(got.length === 1 && got[0].type === 'wr-design' && got[0].order === 'CO-0002' && /^ring=in1004&/.test(got[0].params) && got[0].sku === 'IN1004' && got[0].preview > 1000);
  console.log('errors:', errs.length ? errs : 'none');
  await browser.close(); process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
