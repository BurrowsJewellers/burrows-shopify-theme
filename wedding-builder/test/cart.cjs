/* Adds a shared design to the (mock) cart and prints what Shopify would receive. node test/cart.cjs (harness running) */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:8791/test/harness.html?ring=ah2&metal=rose-gold&grade=Rose+Gold+14ct&w=4&t=1.6&size=M&eng=M+%26+J+2027&font=roman&sizer=1&date=2027-03-20', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => { const b = document.querySelector('#addBtn'); return b && !b.disabled; }, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.click('#wrHead5'); await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(__dirname, 'shot-review2.png') });
  await page.click('#addBtn');
  await page.waitForURL('**/cart', { timeout: 30000 });
  const adds = JSON.parse(fs.readFileSync(path.join(__dirname, 'cart-adds.json'), 'utf8'));
  const item = adds[adds.length - 1].items[0];
  console.log(JSON.stringify(item, null, 1));
  const prev = item.properties._Preview; const id = prev.split('/').pop();
  const f = path.join(__dirname, 'previews', id); console.log('preview file:', fs.existsSync(f) ? fs.statSync(f).size + ' bytes' : 'MISSING');
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join(__dirname, 'preview-sample.jpg'));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
