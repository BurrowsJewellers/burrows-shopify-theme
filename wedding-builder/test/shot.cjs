/* Opens the harness in Chromium, exercises the designer, saves screenshots. node test/shot.js */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const out = (n) => path.join(__dirname, n);
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('requestfailed', (r) => errors.push('failed ' + r.url().slice(0, 100)));
  page.on('response', (r) => { if (r.status() >= 400) errors.push('http ' + r.status() + ' ' + r.url().slice(0, 100)); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const url = process.env.URL || 'http://localhost:8791/test/harness.html';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice', { timeout: 30000 });
  await page.waitForTimeout(4000);
  const bar = await page.textContent('#barPrice');
  console.log('bar price (default AB-2):', bar);
  await page.screenshot({ path: out('shot-style.png'), fullPage: false });
  // metal step
  await page.click('#wrHead2');
  await page.waitForTimeout(300);
  await page.click('[data-metal="yellow-gold"]');
  await page.waitForTimeout(2500);
  console.log('bar after yellow gold:', await page.textContent('#barPrice'), '| chips:', await page.$$eval('#gradeChips .wr__chip', (els) => els.map((e) => e.textContent).join(',')));
  await page.click('#gradeChips .wr__chip:nth-child(3)');
  await page.waitForTimeout(2500);
  console.log('bar after 18ct:', await page.textContent('#barPrice'));
  await page.screenshot({ path: out('shot-metal.png') });
  // shape
  await page.click('#wrHead3');
  await page.waitForTimeout(300);
  await page.$eval('#widthRange', (el) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, '5'); el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(300);
  await page.click('[data-fit="Flat"]');
  await page.waitForTimeout(2500);
  console.log('bar after 5mm flat:', await page.textContent('#barPrice'), '| head3:', await page.textContent('#wrHead3 .wr__h-v'));
  await page.screenshot({ path: out('shot-shape.png') });
  // size & engraving
  await page.click('#wrHead4');
  await page.waitForTimeout(300);
  await page.click('#sizeChips .wr__chip:has-text("R")');
  await page.fill('#engIn', 'Forever yours 10.10.2026');
  await page.waitForTimeout(1500);
  const focused = await page.evaluate(() => document.activeElement && document.activeElement.id);
  console.log('focus kept in engraving input:', focused === 'engIn');
  await page.screenshot({ path: out('shot-engrave.png') });
  // review
  await page.click('#wrHead5');
  await page.waitForTimeout(2500);
  console.log('summary:', await page.$$eval('#summary .wr__summary-row', (els) => els.map((e) => e.textContent).join(' | ')));
  console.log('review price:', await page.textContent('#priceOut'));
  console.log('url:', page.url());
  await page.screenshot({ path: out('shot-review.png') });
  // reload keeps the design
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice');
  await page.waitForTimeout(3000);
  console.log('after reload head1:', await page.textContent('#wrHead1 .wr__h-v'), '| head4:', await page.textContent('#wrHead4 .wr__h-v'));
  // add to cart
  const btnDisabled = await page.$eval('#addBtn', (b) => b.disabled);
  console.log('deposit button enabled:', !btnDisabled);
  if (!btnDisabled) {
    await page.click('#addBtn');
    await page.waitForURL('**/cart', { timeout: 20000 });
    const adds = JSON.parse(fs.readFileSync(out('cart-adds.json'), 'utf8'));
    console.log('cart add:', JSON.stringify(adds[adds.length - 1], null, 1));
  }
  // a signature two-tone ring + a diamond ring + IN1915 photo
  await page.goto(url + '?ring=in1004&tone=2&metal=yellow-gold&side=white-gold&w=6&t=1.6&size=P', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice'); await page.waitForTimeout(5000);
  console.log('IN1004 two-tone:', await page.textContent('#barPrice'), '|', await page.textContent('#wrHead2 .wr__h-v'));
  await page.screenshot({ path: out('shot-in1004.png') });
  await page.goto(url + '?ring=in6004&metal=white-gold&grade=White+Gold+18ct&w=5&t=1.8&size=P&stone=Ruby&ssize=2.3', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice'); await page.waitForTimeout(5000);
  await page.click('#wrHead2'); await page.waitForTimeout(500);
  console.log('IN6004 ruby:', await page.textContent('#barPrice'), '|', await page.textContent('#wrHead2 .wr__h-v'));
  await page.screenshot({ path: out('shot-in6004.png') });
  await page.goto(url + '?ring=in1915&metal=zirconium', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice'); await page.waitForTimeout(3000);
  console.log('IN1915:', await page.textContent('#barPrice'));
  await page.screenshot({ path: out('shot-in1915.png') });
  await page.goto(url + '?ring=in1076', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#barPrice'); await page.waitForTimeout(3000);
  console.log('IN1076 (enquiry):', await page.textContent('#barPrice'), 'btn disabled:', await page.$eval('#addBtn', (b) => b.disabled));
  // mobile
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await m.goto(url + '?ring=ac6&metal=yellow-gold', { waitUntil: 'domcontentloaded' });
  await m.waitForSelector('#barPrice'); await m.waitForTimeout(4000);
  await m.screenshot({ path: out('shot-mobile.png'), fullPage: false });
  await m.click('#wrHead2'); await m.waitForTimeout(600);
  await m.screenshot({ path: out('shot-mobile-metal.png'), fullPage: true });
  console.log('errors:', errors.length ? errors.slice(0, 8).join('\n') : 'none');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
