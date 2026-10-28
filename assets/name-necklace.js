/* Burrows Name Necklace Builder : sections/name-necklace-builder.liquid
   The geometry lives in assets/name-necklace-core.js (Nameplate, Alloys, Chains, StlIO: generated from the
   name-necklace-builder repo, never hand-edited).
   Five sections, one open at a time (name, style, metal, chain, review) and a price bar that always shows the
   total and Add to cart. The stage shows the necklace to scale on a neck, with a close-up of the plate in the
   corner (three.js when it has loaded, a flat metal drawing until then). There is no letter editor: the core
   joins i/j dots, accents and stray strokes onto their letter, and reinforces thin strokes to the casting
   minimum. Every change rebuilds the plate at once without reinforcement (fast, so typing stays smooth); half a
   second after the last change it is rebuilt reinforced and checked, and that is the version that is ordered.
   Prices come from {api}/quote; Add to cart goes through {api}/build (hidden Shopify product at the quoted
   price) then /cart/add.js.
   Staff mode (?build=<id>&t=<token>, opened from the dashboard's Custom Orders): the paid design loads from the
   API, every thickness and a letter editor are offered, the quote carries the cost figures, and "Save to order"
   hands the design back to the dashboard window instead of adding to the cart. See the staff section below. */
(function () {
  'use strict';

  const CDN = {
    opentype: { test: () => typeof opentype !== 'undefined', src: 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js' },
    clipper: { test: () => typeof ClipperLib !== 'undefined', src: 'https://cdn.jsdelivr.net/npm/clipper-lib@6.4.2/clipper.js' },
    earcut: { test: () => typeof earcut !== 'undefined', src: 'https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js' },
    three: { test: () => typeof THREE !== 'undefined', src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js' },
  };
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }
  const ensure = (key) => (CDN[key].test() ? Promise.resolve() : loadScript(CDN[key].src));

  function init() {
    const root = document.querySelector('[data-name-necklace]');
    if (!root) return;
    let cfg;
    try { cfg = JSON.parse(root.querySelector('[data-nn-config]').textContent); } catch (e) { return; }
    const loading = root.querySelector('#loading');
    const fail = (msg) => { loading.innerHTML = ''; loading.textContent = msg; loading.classList.add('err'); };

    // 1. Geometry libraries, then the core if the deferred copy could not run (it needs the libraries first).
    // 2. Fonts from the API, in parallel with three.js (optional: the close-up draws the plate flat without it).
    const libs = Promise.all(['opentype', 'clipper', 'earcut'].map(ensure))
      .then(() => (typeof Nameplate !== 'undefined' || !cfg.coreUrl ? null : loadScript(cfg.coreUrl)));
    const three = libs.then(() => ensure('three')).then(() => true, () => false);
    libs.then(() => {
      if (typeof Nameplate === 'undefined' || typeof Alloys === 'undefined' || typeof Chains === 'undefined') throw new Error('core');
      return loadFonts(cfg);
    }).then((fonts) => start(root, cfg, fonts, three)).catch((err) => {
      console.warn('Name necklace builder:', err);
      fail("The designer couldn't load. Check the internet connection and refresh the page" + (cfg.phone ? ', or call us on ' + cfg.phone + '.' : '.'));
    });
  }

  /* ---------- fonts ---------- */
  // The TTFs come from the API (fontsBase/<file>), parsed for geometry and registered for the font picker.
  // The raw files are kept too, for the build workers to parse their own copies. A retired font (no longer offered)
  // is only loaded in staff mode, where an order made in it can still be reviewed.
  const faceName = (f) => 'NP ' + f.name;
  function loadFonts(cfg) {
    const base = String(cfg.fontsBase || '').replace(/\/$/, '');
    const parsed = {}, raw = {};
    const staff = /[?&]build=/.test(location.search);
    return Promise.all(Nameplate.FONTS.filter((f) => staff || !f.retired).map((f) => {
      const file = f.file.split('/').pop();
      return fetch(base + '/' + encodeURIComponent(file), { mode: 'cors' })
        .then((res) => { if (!res.ok) throw new Error('font ' + file + ' ' + res.status); return res.arrayBuffer(); })
        .then((buf) => {
          raw[f.key] = buf.slice(0);
          parsed[f.key] = opentype.parse(buf);
          try { const face = new FontFace(faceName(f), buf); document.fonts.add(face); face.load().catch(() => {}); } catch (e) { /* the list falls back to the UI font */ }
        });
    })).then(() => ({ parsed, raw }));
  }

  function start(root, cfg, fonts, threeReady) {
    const parsed = fonts.parsed, rawFonts = fonts.raw;
    const $ = (id) => root.querySelector('#' + id);
    const app = root.querySelector('[data-nn-app]');
    const N = Nameplate;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const fmtBytes = (b) => (b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1e3) + ' KB');
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const editable = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') && !['radio', 'checkbox', 'range'].includes(el.type);
    const getFont = (key) => parsed[key] || parsed[N.FONTS[0].key];
    const showStl = !!cfg.showStl && !!$('saveBtn');
    const apiBase = String(cfg.apiBase || '').replace(/\/$/, '');
    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    // Prices: a whole-dollar total reads $90 (the API rounds necklace totals up to the next $5); anything with cents
    // keeps both places ($61.52). money2 always shows cents, for the staff cost table.
    const money2 = (v) => '$' + v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const money = (v) => (Math.abs(v - Math.round(v)) < 0.005 ? '$' + Math.round(v).toLocaleString('en-AU') : money2(v));
    // Staff mode: the dashboard opens the page with the build id and its token (the same token that unlocks the STL).
    const query = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
    const STAFF = query.get('build') && query.get('t') ? { build: String(query.get('build')).slice(0, 40), t: String(query.get('t')).slice(0, 80), meta: null } : null;
    const ORDER_ORIGINS = ['https://dashboard.burrowsjewellers.com.au', 'http://localhost:5173', 'http://localhost:4000'];
    if (STAFF) root.classList.add('nn--staff');

    /* ---------- state ---------- */
    const DEFAULT_CURVE = 70; // degrees: the name lifts at the ends, as it hangs on a chain
    const DEFAULT_THICKNESS = 1.5; // mm: 'Normal'
    const FINAL_DELAY = 500; // ms after the last change before the reinforced, checked rebuild
    let design = N.defaultDesign();
    design.curve = DEFAULT_CURVE;
    design.thickness = DEFAULT_THICKNESS;
    design.reinforce = true; // always: the core widens anything under the casting minimum
    const settings = { detail: 'standard', format: 'binary', metal: 'yellow' };
    let alloy = Alloys.byKey(cfg.defaultAlloy) || Alloys.byKey('ag925') || Alloys.ALLOYS[0];
    // result: the last good build. final: it is the reinforced, checked build of the current design (what is
    // ordered), not the quick pass. designSeq counts design changes, so late builds can be told apart.
    let result = null, final = false, mesh = null, buildError = null, finalTimer = 0, spaceNote = false, designSeq = 0;
    const undoStack = [];
    let lastPush = { tag: null, t: 0 };
    let queueLift = () => {}; // keeps the chat bubble clear of the price bar (set up with the price bar, below)

    function pushUndo(tag) {
      const now = performance.now();
      if (tag && tag === lastPush.tag && now - lastPush.t < 1200) { lastPush.t = now; return; }
      undoStack.push(JSON.stringify(design));
      if (undoStack.length > 50) undoStack.shift();
      lastPush = { tag, t: now };
      $('undoBtn').disabled = false;
    }
    function undo() {
      if (!undoStack.length) return;
      design = JSON.parse(undoStack.pop());
      design.reinforce = true;
      standardLoops();
      lastPush = { tag: null, t: 0 };
      $('undoBtn').disabled = !undoStack.length;
      syncControls();
      schedule();
      say('Undone.');
    }

    /* ---------- controls ---------- */
    const fontList = $('fontList');
    // Customers get the fonts on offer; staff also get retired ones, so an order made in one shows its font.
    for (const f of N.FONTS.filter((x) => STAFF || !x.retired)) {
      const lab = document.createElement('label');
      const style = f.retired ? f.style + ' · retired' : f.style;
      lab.innerHTML = `<input type="radio" name="font" value="${f.key}" aria-label="${esc(f.name)}, ${esc(style.toLowerCase())}"><span class="fname" style="font-family:'${faceName(f)}', cursive">${esc(f.name)}</span><span class="fstyle">${esc(style)}</span>`;
      fontList.appendChild(lab);
    }
    // Three plate thicknesses with plain names (the server accepts the wider list in the core; the page offers these).
    // Staff get every thickness the server makes.
    const THICKNESS_NAMES = { 0.8: 'Fine', 1: 'Thin', 1.2: 'Light', 1.5: 'Normal', 2: 'Thick' };
    const THICKNESS_CHOICES = (STAFF ? N.THICKNESSES.map((t) => [t, THICKNESS_NAMES[t] || '']) : [[1.0, 'Thin'], [1.5, 'Normal'], [2.0, 'Thick']]).filter(([t]) => N.THICKNESSES.includes(t));
    const thickSeg = $('thickSeg');
    for (const [t, name] of THICKNESS_CHOICES) {
      const lab = document.createElement('label');
      lab.innerHTML = `<input type="radio" name="thickness" value="${t}"><span>${esc(name || t.toFixed(1) + ' mm')}${name ? ` <small>${t.toFixed(1)}</small>` : ''}</span>`;
      thickSeg.appendChild(lab);
    }
    const radios = (name) => root.querySelectorAll(`input[name="${name}"]`);
    const setRadio = (name, value) => radios(name).forEach((el) => { el.checked = el.value === String(value); });
    const presetFor = (h) => Object.keys(N.HEIGHTS).find((k) => N.HEIGHTS[k] === h) || 'custom';
    const OV_MIN = N.OVERLAP_RANGE[0], OV_MAX = N.OVERLAP_RANGE[1];

    function syncControls() {
      const name = $('nameIn');
      if (name.value !== design.text) name.value = design.text;
      updateCounter();
      setRadio('font', design.font);
      fontList.querySelectorAll('label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked));
      setRadio('height', presetFor(design.height));
      $('heightIn').value = design.height;
      $('heightRow').hidden = presetFor(design.height) !== 'custom';
      $('ovRange').value = design.overlap; $('ovIn').value = design.overlap.toFixed(2);
      setRadio('thickness', design.thickness);
      $('curveRange').value = design.curve || 0; $('curveIn').value = design.curve || 0;
      syncLoopInputs();
      $('loopWarn').hidden = true;
      setRadio('dots', design.dots);
      setRadio('finish', design.finish || 'polished');
      preview.setFinish(design.finish || 'polished');
    }
    function updateCounter() {
      const n = Array.from($('nameIn').value).length, c = $('counter');
      c.textContent = `${n}/${N.MAX_CHARS}`;
      c.classList.toggle('full', n >= N.MAX_CHARS);
    }
    function renderNameWarn() {
      const warn = $('nameWarn');
      if (buildError) { warn.textContent = buildError.message; warn.hidden = false; }
      else if (spaceNote) { warn.textContent = 'One word per necklace, so spaces are left out.'; warn.hidden = false; }
      else warn.hidden = true;
    }

    $('nameIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); }); // Enter shouldn't add to cart
    $('nameIn').addEventListener('input', () => {
      const el = $('nameIn');
      // One word per necklace: a typed or pasted space is dropped (the caret stays where it was).
      let text = el.value;
      spaceNote = /\s/.test(text);
      if (spaceNote) {
        const at = el.selectionStart, before = text.slice(0, at).replace(/\s+/g, '').length;
        text = text.replace(/\s+/g, '');
        el.value = text;
        try { el.setSelectionRange(before, before); } catch (e) { /* not focused */ }
      }
      const chars = Array.from(text);
      if (chars.length > N.MAX_CHARS) { text = chars.slice(0, N.MAX_CHARS).join(''); el.value = text; }
      updateCounter();
      renderNameWarn();
      if (text === design.text) return;
      pushUndo('text');
      design.letters = [];
      design.text = text;
      schedule();
    });
    radios('font').forEach((el) => el.addEventListener('change', () => {
      pushUndo(); design.font = el.value;
      fontList.querySelectorAll('label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked));
      schedule();
    }));
    radios('height').forEach((el) => el.addEventListener('change', () => {
      $('heightRow').hidden = el.value !== 'custom';
      if (el.value === 'custom') { $('heightIn').focus(); return; }
      pushUndo(); design.height = N.HEIGHTS[el.value]; $('heightIn').value = design.height; schedule();
    }));
    $('heightIn').addEventListener('input', () => {
      const v = parseFloat($('heightIn').value);
      if (!Number.isFinite(v) || v < N.HEIGHT_RANGE[0] || v > N.HEIGHT_RANGE[1]) return;
      pushUndo('height'); design.height = v; setRadio('height', presetFor(v)); schedule();
    });
    $('heightIn').addEventListener('change', () => {
      const v = parseFloat($('heightIn').value);
      if (Number.isFinite(v)) { const c = clamp(v, N.HEIGHT_RANGE[0], N.HEIGHT_RANGE[1]); if (c !== design.height) { pushUndo('height'); design.height = c; schedule(); } }
      $('heightIn').value = design.height; setRadio('height', presetFor(design.height));
    });
    const setOverlap = (v) => { pushUndo('overlap'); design.overlap = Math.round(clamp(v, OV_MIN, OV_MAX) * 100) / 100; schedule(); };
    $('ovRange').addEventListener('input', () => { $('ovIn').value = (+$('ovRange').value).toFixed(2); setOverlap(+$('ovRange').value); });
    $('ovIn').addEventListener('input', () => { const v = parseFloat($('ovIn').value); if (Number.isFinite(v)) { $('ovRange').value = clamp(v, OV_MIN, OV_MAX); setOverlap(v); } });
    $('ovIn').addEventListener('change', () => { $('ovIn').value = design.overlap.toFixed(2); });
    const setCurve = (v) => { pushUndo('curve'); design.curve = Math.round(clamp(v, 0, N.CURVE_RANGE[1])); schedule(); };
    $('curveRange').addEventListener('input', () => { $('curveIn').value = $('curveRange').value; setCurve(+$('curveRange').value); });
    $('curveIn').addEventListener('input', () => { const v = parseFloat($('curveIn').value); if (Number.isFinite(v)) { $('curveRange').value = clamp(v, 0, 180); setCurve(v); } });
    $('curveIn').addEventListener('change', () => { $('curveIn').value = design.curve || 0; });
    radios('thickness').forEach((el) => el.addEventListener('change', () => { pushUndo(); design.thickness = +el.value; schedule(); }));
    {
      const group = $('loopL').closest('fieldset');
      if (!STAFF) group.style.display = 'none'; // customers don't choose loops (see standardLoops)
      else { const note = document.createElement('p'); note.className = 'nn__note'; note.id = 'loopStd'; group.appendChild(note); }
    }
    $('loopL').addEventListener('change', () => { pushUndo(); design.loops.left.on = $('loopL').checked; schedule(); });
    $('loopR').addEventListener('change', () => { pushUndo(); design.loops.right.on = $('loopR').checked; schedule(); });
    function loopInput() {
      const o = parseFloat($('loopOuter').value), h = parseFloat($('loopHole').value), warn = $('loopWarn');
      if (!Number.isFinite(o) || !Number.isFinite(h)) return;
      let msg = null;
      if (o < N.LOOP_OUTER_RANGE[0] || o > N.LOOP_OUTER_RANGE[1]) msg = `Outer Ø runs from ${N.LOOP_OUTER_RANGE[0]} to ${N.LOOP_OUTER_RANGE[1]} mm.`;
      else if (h < N.LOOP_HOLE_RANGE[0] || h > N.LOOP_HOLE_RANGE[1]) msg = `Hole Ø runs from ${N.LOOP_HOLE_RANGE[0].toFixed(1)} to ${N.LOOP_HOLE_RANGE[1]} mm.`;
      else msg = N.loopWallError(o, h);
      warn.textContent = msg ? msg + ` Using ${design.loops.outer} / ${design.loops.hole} mm until then.` : '';
      warn.hidden = !msg;
      if (msg || (o === design.loops.outer && h === design.loops.hole)) return;
      pushUndo('loopsize'); design.loops.outer = o; design.loops.hole = h; design.loops.custom = true; syncLoopInputs(); schedule();
    }
    $('loopOuter').addEventListener('input', loopInput);
    $('loopHole').addEventListener('input', loopInput);
    radios('finish').forEach((el) => el.addEventListener('change', () => { pushUndo(); design.finish = el.value; preview.setFinish(el.value); renderSummary(); renderChoices(); saveDraft(); }));
    radios('dots').forEach((el) => el.addEventListener('change', () => { pushUndo(); design.dots = el.value; schedule(); }));
    radios('detail').forEach((el) => el.addEventListener('change', () => { settings.detail = el.value; schedule(); }));
    radios('format').forEach((el) => el.addEventListener('change', () => { settings.format = el.value; renderStats(); }));

    /* ---------- sections: one open at a time ---------- */
    const blocks = [...root.querySelectorAll('[data-block]')];
    const blockOf = (n) => blocks.find((b) => +b.dataset.block === n);
    const steps = root.querySelector('[data-nn-steps]');
    let openN = 1;
    function setStep(n) {
      steps.querySelectorAll('li').forEach((li) => {
        const k = +li.dataset.step;
        li.classList.toggle('on', k === n); li.classList.toggle('done', !!n && k < n);
        const b = li.querySelector('button'); if (b) b.setAttribute('aria-current', k === n ? 'step' : 'false');
      });
    }
    // n = 0 closes them all. Scrolls the opened header into view when it ends up off screen.
    function openBlock(n, { scroll = true } = {}) {
      openN = n;
      for (const b of blocks) {
        const on = +b.dataset.block === n;
        b.classList.toggle('is-open', on);
        b.querySelector('.nn__h-btn').setAttribute('aria-expanded', String(on));
        b.querySelector('.nn__body').hidden = !on;
      }
      setStep(n);
      if (n === 5) renderSummary();
      if (renderSize && n) renderSize(); // the stage may have changed size on a phone
      queueLift(); // the price bar may have moved
      const b = blockOf(n);
      if (scroll && b) {
        const r = b.getBoundingClientRect(), headerH = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 90) + 8;
        if (r.top < headerH || r.top > window.innerHeight * 0.7) b.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
    blocks.forEach((b) => {
      const n = +b.dataset.block;
      b.querySelector('.nn__h-btn').addEventListener('click', () => openBlock(openN === n ? 0 : n, { scroll: openN !== n }));
    });
    root.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => openBlock(+b.dataset.next)));
    steps.querySelectorAll('li').forEach((li) => { const b = li.querySelector('button') || li; b.addEventListener('click', () => openBlock(+li.dataset.step)); });

    /* ---------- metal (alloy picker) ---------- */
    // Two small choices instead of eleven buttons: the metal (silver, yellow / white / rose gold, platinum), then
    // the gold purity (9ct / 14ct / 18ct) which only appears once a gold is chosen.
    const colourOf = (a) => (a.colour === 'Rose' ? 'rose' : a.colour === 'Yellow' ? 'yellow' : 'white');
    const METALS = [
      { id: 'silver', label: 'Sterling silver', sw: ['#E3E6E8', '#9EA5A9'], key: 'ag925' },
      { id: 'yellow', label: 'Yellow gold', sw: ['#F1CB7A', '#B88A2E'], colour: 'Yellow' },
      { id: 'white', label: 'White gold', sw: ['#DEE2E4', '#98A0A5'], colour: 'White' },
      { id: 'rose', label: 'Rose gold', sw: ['#EBB59B', '#B46F4E'], colour: 'Rose' },
      { id: 'platinum', label: 'Platinum', sw: ['#D7DCDF', '#86909A'], key: 'pt950' },
    ].filter((m) => m.key ? Alloys.byKey(m.key) : Alloys.ALLOYS.some((a) => a.colour === m.colour));
    const PURITIES = [...new Set(Alloys.ALLOYS.filter((a) => a.colour).map((a) => a.group))]; // 9ct, 14ct, 18ct
    const PURITY_NOTE = { '9ct': 'Hard-wearing, best value', '14ct': 'Richer colour, still tough', '18ct': 'Richest colour, softer' };
    const metalOf = (a) => (a.key === 'ag925' ? 'silver' : a.key === 'pt950' ? 'platinum' : colourOf(a));
    const goldKey = (colour, group) => { const a = Alloys.ALLOYS.find((x) => x.colour === colour && x.group === group); return a ? a.key : null; };
    // One picker (metal tiles + gold purity) for a container; onChange(alloy) when the choice changes.
    function makeMetalPicker(el, { exclude = [], onChange, label = 'Metal' }) {
      const metals = METALS.filter((m) => !(m.key && exclude.includes(m.key)));
      let purity = PURITIES.includes('9ct') ? '9ct' : PURITIES[0], current = null;
      el.innerHTML = `<div class="nn__metal-tiles" role="radiogroup" aria-label="${esc(label)}">${metals.map((m) => `<button type="button" class="nn__tile" role="radio" aria-checked="false" data-metal="${m.id}" style="--sw:${m.sw[0]};--sw2:${m.sw[1]}"><i aria-hidden="true"></i><span>${esc(m.label)}</span></button>`).join('')}</div>
        <div class="nn__purity" data-purity hidden><span class="nn__purity-l">Gold purity</span><div class="nn__chips" role="radiogroup" aria-label="Gold purity">${PURITIES.map((g) => `<button type="button" class="nn__chip" role="radio" aria-checked="false" data-purity-key="${esc(g)}">${esc(g)}</button>`).join('')}</div><span class="nn__purity-note" data-purity-note></span></div>`;
      el.querySelectorAll('.nn__tile').forEach((b) => b.addEventListener('click', () => {
        const m = metals.find((x) => x.id === b.dataset.metal);
        if (m) set(m.key || goldKey(m.colour, purity) || goldKey(m.colour, PURITIES[0]));
      }));
      el.querySelectorAll('[data-purity-key]').forEach((b) => b.addEventListener('click', () => {
        purity = b.dataset.purityKey;
        if (current && current.colour) set(goldKey(current.colour, purity) || current.key);
      }));
      function set(key, silent) {
        const a = Alloys.byKey(key);
        if (!a || exclude.includes(a.key)) return;
        current = a;
        if (a.colour) purity = a.group;
        const metal = metalOf(a);
        el.querySelectorAll('.nn__tile').forEach((b) => { const on = b.dataset.metal === metal; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
        el.querySelector('[data-purity]').hidden = !a.colour;
        el.querySelectorAll('[data-purity-key]').forEach((b) => { const on = b.dataset.purityKey === purity; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
        el.querySelector('[data-purity-note]').textContent = a.colour ? (PURITY_NOTE[purity] || '') : '';
        if (!silent) onChange(a);
      }
      return { set, get alloy() { return current; } };
    }
    const platePicker = makeMetalPicker($('alloyChips'), { label: 'Metal', onChange: (a) => applyAlloy(a) });
    function applyAlloy(a) {
      alloy = a;
      settings.metal = colourOf(a);
      preview.setMetal(settings.metal);
      drawCloseupFlat();
      renderSize();
      renderStats();
      renderSummary();
      renderChoices();
      priceChanged();
    }
    const setAlloy = (key) => platePicker.set(key);

    /* ---------- chain ---------- */
    // Every necklace comes with a chain: a style (cable, belcher, curb) in a thickness (fine, medium, heavy), a
    // length and its own metal (no platinum). The server prices it on its weight like the plate; gaugePrices
    // (from the last quote: the whole necklace's total with each thickness) labels the thickness buttons. A price server from before gauges (no gauge in its
    // reply) only makes Medium, so the thickness row hides and Medium is used.
    const chain = { style: Chains.byKey(Chains.DEFAULT.style), gauge: Chains.DEFAULT.gauge || 'medium', lengthCm: Chains.DEFAULT.lengthCm, alloy: Alloys.byKey('ag925') || Alloys.ALLOYS[0] };
    let gaugePrices = null, gaugePricesFresh = false, gaugesOn = true;
    const chainStylesEl = $('chainStyles'), chainGaugesEl = $('chainGauges'), chainLengthsEl = $('chainLengths');
    const chainSpec = () => (Chains.spec ? Chains.spec(chain.style, chain.gauge) : chain.style) || chain.style;
    const chainMetal = () => metalOf(chain.alloy);
    const chainName = () => { const sp = chainSpec(); return `${chain.lengthCm} cm ${(sp.gaugeName || 'medium').toLowerCase()} ${sp.width.toFixed(1)} mm ${chain.style.name.toLowerCase()} chain`; };
    const chainText = () => `${chainName()}, ${chain.alloy.name}`;
    function chainChanged() {
      gaugePricesFresh = false;
      renderChainTiles();
      renderChainGauges();
      renderChainLengths();
      renderSize();
      renderSummary();
      renderChoices();
      priceChanged();
    }
    const chainPicker = makeMetalPicker($('chainAlloyChips'), { exclude: Chains.EXCLUDED_ALLOYS, label: 'Chain metal', onChange: (a) => { chain.alloy = a; chainChanged(); } });
    function setChainStyle(key) { const st = Chains.byKey(key); if (!st || st === chain.style) return; chain.style = st; chainChanged(); }
    function setChainGauge(key) {
      if (key === chain.gauge || !(Chains.spec && Chains.spec(chain.style, key))) return;
      chain.gauge = key;
      if (standardLoops()) { syncLoopInputs(); schedule(); }
      chainChanged();
    }
    // The chain loops (CAD review, Oct 2026) follow the chain's thickness: a 2.4 mm loop with a 1.0 mm hole for
    // fine and medium chains, 3.0 / 1.4 mm for heavy (N.loopSizeFor). Customers always get both, unmoved, and see
    // no loop options; the server enforces the same. Staff keep a size they typed (loops.custom). True if changed.
    function standardLoops() {
      const before = JSON.stringify(design.loops), std = N.loopSizeFor(chain.gauge);
      if (!STAFF) design.loops = { outer: std.outer, hole: std.hole, left: { on: true, dx: 0, dy: 0 }, right: { on: true, dx: 0, dy: 0 } };
      else if (!design.loops.custom) Object.assign(design.loops, std);
      return JSON.stringify(design.loops) !== before;
    }
    function syncLoopInputs() {
      $('loopL').checked = design.loops.left.on; $('loopR').checked = design.loops.right.on;
      $('loopOuter').value = design.loops.outer; $('loopHole').value = design.loops.hole;
      const std = N.loopSizeFor(chain.gauge), note = $('loopStd');
      if (note) note.textContent = `Standard for a ${chain.gauge} chain: ${std.outer.toFixed(1)} mm, ${std.hole.toFixed(1)} mm hole.${design.loops.custom ? ' These loops were set by hand.' : ''}`;
    }
    function setChainLength(cm) { if (!Chains.LENGTHS_CM.includes(cm) || cm === chain.lengthCm) return; chain.lengthCm = cm; chainChanged(); }
    // A straight run of links across a tile, spaced at the pitch (6.5 px per mm), with a gentle sag.
    const tileRun = (sp) => { const pts = [], step = Chains.pitch(sp) * 6.5; for (let x = 6; x <= 114; x += step) pts.push([x, 13 + 2.2 * Math.sin((x / 120) * Math.PI)]); return pts; };
    function renderChainTiles() {
      chainStylesEl.innerHTML = Chains.STYLES.map((st) => {
        const sp = (Chains.spec && Chains.spec(st, chain.gauge)) || st;
        return `<button type="button" class="nn__ctile${st === chain.style ? ' on' : ''}" role="radio" aria-checked="${st === chain.style}" data-chain-style="${st.key}" title="${esc(st.note)}">
          <svg viewBox="0 0 120 26" aria-hidden="true">${linkDefs('t' + st.key, chainMetal())}${linkRun(sp, tileRun(sp), 6.5, 'url(#nnLink-t' + st.key + ')', 0.55)}</svg>
          <span class="nn__ctile-n">${esc(st.name)}</span></button>`;
      }).join('');
      chainStylesEl.querySelectorAll('[data-chain-style]').forEach((b) => b.addEventListener('click', () => setChainStyle(b.dataset.chainStyle)));
    }
    function renderChainGauges() {
      const group = chainGaugesEl.closest('fieldset');
      if (group) group.hidden = !gaugesOn || !Chains.GAUGES;
      if (!gaugesOn || !Chains.GAUGES) return;
      chainGaugesEl.innerHTML = Chains.GAUGES.map((g) => {
        const sp = Chains.spec(chain.style, g.key), on = g.key === chain.gauge, p = gaugePrices && gaugePrices[g.key];
        return `<button type="button" class="nn__chip nn__gchip${on ? ' on' : ''}" role="radio" aria-checked="${on}" data-gauge="${g.key}"><span>${esc(g.name)} <b>${sp.width.toFixed(1)} mm</b></span>${p ? `<small class="${gaugePricesFresh ? '' : 'stale'}">${money(p)}</small>` : ''}</button>`;
      }).join('');
      chainGaugesEl.querySelectorAll('[data-gauge]').forEach((b) => b.addEventListener('click', () => setChainGauge(b.dataset.gauge)));
    }
    function renderChainLengths() {
      chainLengthsEl.innerHTML = Chains.LENGTHS_CM.map((cm) => `<button type="button" class="nn__chip${cm === chain.lengthCm ? ' on' : ''}" role="radio" aria-checked="${cm === chain.lengthCm}" data-chain-cm="${cm}">${cm} cm</button>`).join('');
      chainLengthsEl.querySelectorAll('[data-chain-cm]').forEach((b) => b.addEventListener('click', () => setChainLength(+b.dataset.chainCm)));
    }

    /* ---------- close-up (three.js, front on) ---------- */
    const stage = $('stage'), closeupView = $('closeupView'), closeupSvg = $('closeupSvg');
    const noPreview = { ok: false, set() {}, setMetal() {}, setFinish() {}, snapshot() { return ''; } };
    let preview = noPreview;
    // The metal look shared by the close-up and the staff 3D view: a soft studio environment, a key light, the metal
    // material and the three finishes.
    function metalStudio(renderer, scene) {
      // Soft studio environment for metal reflections, drawn on a canvas (same as the ring tool), brighter around
      // the horizon: the face looks straight at the middle of this map, and a dark horizon made silver look grey.
      const c = document.createElement('canvas'); c.width = 512; c.height = 256;
      const g = c.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 0, 256);
      grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.4, '#dfe4e2'); grd.addColorStop(0.5, '#aab1ae'); grd.addColorStop(0.62, '#6a716f'); grd.addColorStop(1, '#202423');
      g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
      g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(40, 50, 110, 46); g.fillRect(290, 36, 150, 34);
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(190, 150, 70, 18); g.fillRect(450, 120, 40, 60);
      const tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping; tex.encoding = THREE.sRGBEncoding;
      const pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromEquirectangular(tex).texture;
      tex.dispose(); pm.dispose();
      const key = new THREE.DirectionalLight(0xffffff, 0.55); key.position.set(30, 60, 25); scene.add(key);

      const COLORS = { yellow: 0xF0B550, rose: 0xE8A080, white: 0xE3E7EA };
      const mat = new THREE.MeshStandardMaterial({ color: COLORS.yellow, metalness: 1, roughness: 0.28 });
      // Brushed: fine streaks along the length of the name, drawn on a canvas and used as roughness and bump.
      // r128 has no anisotropic metal, so the streaks carry the look. Satin is an even, soft roughness.
      const brushTex = (() => {
        const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
        const gg = cv.getContext('2d');
        gg.fillStyle = 'rgb(140,140,140)'; gg.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 2600; i++) {
          const v = 90 + Math.floor(Math.random() * 120), y = Math.random() * 512, x = Math.random() * 512, len = 60 + Math.random() * 380;
          gg.strokeStyle = `rgba(${v},${v},${v},0.45)`; gg.lineWidth = Math.random() < 0.8 ? 1 : 2;
          gg.beginPath(); gg.moveTo(x, y); gg.lineTo(x + len, y); gg.stroke();
          if (x + len > 512) { gg.beginPath(); gg.moveTo(x - 512, y); gg.lineTo(x + len - 512, y); gg.stroke(); }
        }
        const t = new THREE.CanvasTexture(cv);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return t;
      })();
      const FINISHES = {
        polished: { roughness: 0.18, map: null, bump: 0 },
        brushed: { roughness: 0.78, map: brushTex, bump: 0.012 },
        satin: { roughness: 0.6, map: null, bump: 0 },
      };
      return {
        key, mat,
        setMetal(m) { mat.color.setHex(COLORS[m] || COLORS.white); },
        setFinish(f) {
          const F = FINISHES[f] || FINISHES.polished;
          mat.roughness = F.roughness; mat.roughnessMap = F.map; mat.bumpMap = F.map; mat.bumpScale = F.bump;
          mat.needsUpdate = true;
        },
      };
    }
    // three.js arrives after the page is up (it is the biggest download); until then the close-up is drawn flat.
    function createPreview(host) {
      if (typeof THREE === 'undefined') return noPreview;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false }); }
      catch (e) { return noPreview; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');

      const scene = new THREE.Scene();
      const studio = metalStudio(renderer, scene), mat = studio.mat;
      // Front light: a soft hotspot upper left, so the flat face reads as polished metal.
      const front = new THREE.PointLight(0xffffff, 1, 0, 2); scene.add(front);

      const mesh3 = new THREE.Mesh(new THREE.BufferGeometry(), mat);
      scene.add(mesh3);
      const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      let box = null, raf = 0;
      const size = () => ({ W: host.clientWidth, H: host.clientHeight });
      const draw = () => { raf = 0; try { renderer.render(scene, cam); } catch (e) { /* context lost */ } };
      const request = () => { if (!raf) raf = requestAnimationFrame(draw); };
      // Fit the plate to the close-up with a margin, the hotspot above and left of it, scaled to its size.
      function frame() {
        const { W, H } = size();
        if (!W || !H || !box) return;
        const w = Math.max(box.maxX - box.minX, 1), h = Math.max(box.maxY - box.minY, 1);
        const s = Math.min((0.86 * W) / w, (0.72 * H) / h), cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
        cam.left = -W / (2 * s); cam.right = W / (2 * s); cam.top = H / (2 * s); cam.bottom = -H / (2 * s);
        cam.position.set(cx, cy, 200); cam.lookAt(cx, cy, 0); cam.updateProjectionMatrix();
        front.position.set(cx - w * 0.28, cy + w * 0.2, w * 0.55);
      }
      function resize() {
        const { W, H } = size();
        if (!W || !H) return;
        renderer.setSize(W, H, false);
        frame(); request();
      }
      const api = {
        ok: true,
        set(d, T, bbox) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(d.positions, 3));
          geo.setAttribute('normal', new THREE.BufferAttribute(d.normals, 3));
          // Flat mapping, one texture tile per 16 mm, so brushing runs along the name.
          const uv = new Float32Array((d.positions.length / 3) * 2);
          for (let i = 0, j = 0; i < d.positions.length; i += 3, j += 2) { uv[j] = d.positions[i] / 16; uv[j + 1] = d.positions[i + 1] / 16; }
          geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          geo.setIndex(new THREE.BufferAttribute(d.indices, 1));
          mesh3.geometry.dispose();
          mesh3.geometry = geo;
          box = { ...bbox, T };
          frame(); request();
        },
        setMetal(m) { studio.setMetal(m); request(); },
        setFinish(f) { studio.setFinish(f); request(); },
        // A square picture of the plate, face on, for the product in the cart. Rendered at a fixed size into the
        // same canvas (CSS keeps it stretched to the close-up, so nothing moves on screen), copied out at once,
        // then the close-up size is put back. Returns a JPEG data URL, or '' if anything is missing.
        snapshot(px = 1000, bgInner = '#2b3566', bgOuter = '#0b0e2a') {
          if (!box) return '';
          try {
            const w = box.maxX - box.minX, h = box.maxY - box.minY;
            const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
            const span = Math.max(w, h * 1.4, 8) * 1.15;
            const sc = new THREE.OrthographicCamera(-span / 2, span / 2, span / 2, -span / 2, 0.1, 1000);
            sc.position.set(cx, cy, 200); sc.lookAt(cx, cy, 0); sc.updateProjectionMatrix();
            const pr = renderer.getPixelRatio();
            front.position.set(cx - w * 0.28, cy + w * 0.2, w * 0.55);
            renderer.setPixelRatio(1); renderer.setSize(px, px, false);
            renderer.render(scene, sc);
            const out = document.createElement('canvas'); out.width = px; out.height = px;
            const gg = out.getContext('2d');
            // The same navy display case as the stage, lit from the top like the page.
            const bg = gg.createRadialGradient(px / 2, px * 0.3, px * 0.05, px / 2, px * 0.3, px * 0.95);
            bg.addColorStop(0, bgInner); bg.addColorStop(0.45, '#171d50'); bg.addColorStop(1, bgOuter);
            gg.fillStyle = bg; gg.fillRect(0, 0, px, px);
            gg.drawImage(renderer.domElement, 0, 0, px, px);
            renderer.setPixelRatio(pr); resize(); draw();
            return out.toDataURL('image/jpeg', 0.88);
          } catch (e) { try { resize(); } catch (e2) { /* ignore */ } return ''; }
        },
      };
      if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
      else window.addEventListener('resize', resize);
      renderer.domElement.addEventListener('webglcontextrestored', request);
      resize();
      return api;
    }
    function attachPreview() {
      preview = createPreview(closeupView);
      if (!preview.ok) return; // the flat drawing stays
      closeupView.classList.add('gl');
      preview.setMetal(settings.metal);
      preview.setFinish(design.finish || 'polished');
      if (result) preview.set(N.buildDisplay(result, design.thickness), design.thickness, result.bbox);
    }
    /* ---------- staff 3D view ---------- */
    // The plate in perspective on a navy case, as the old STL maker showed it: drag to turn it any way (front, edge,
    // back), scroll or pinch to zoom, double-click to go back to the starting angle. It turns slowly on its own until
    // it is touched. It follows every rebuild, metal and finish; it only draws while it is open.
    function createViewer3d(host) {
      const msg = host.querySelector('#view3dMsg'), dims = host.querySelector('#view3dDims');
      let v = null, on = false, dirty = true, tried = false;
      const say = (t) => { msg.textContent = t; msg.hidden = !t; };
      function make() {
        if (typeof THREE === 'undefined') return null;
        let renderer;
        try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.setClearColor(0x000000, 0);
        const cv = renderer.domElement;
        cv.className = 'nn__3d-gl'; cv.setAttribute('aria-label', 'The nameplate in 3D: drag to turn, scroll to zoom'); cv.setAttribute('role', 'img');
        host.insertBefore(cv, host.firstChild);
        const scene = new THREE.Scene();
        const studio = metalStudio(renderer, scene);
        studio.key.intensity = 1.1; // no front hotspot here: the key light does the modelling
        const mesh = new THREE.Mesh(new THREE.BufferGeometry(), studio.mat);
        scene.add(mesh);
        const cam = new THREE.PerspectiveCamera(30, 1, 1, 3000);
        // Orbit around the plate's centre: azimuth, polar angle, distance. The start is a little right of and below
        // front on, so the face catches the bright top of the studio and the edge shows.
        const START = { az: Math.atan2(0.3, 0.92), pol: Math.acos(-0.22 / Math.hypot(0.3, 0.22, 0.92)) };
        // z is the zoom as a share of the distance that fits the plate, so it survives a resize.
        const o = { az: START.az, pol: START.pol, z: 1, fit: 100, target: new THREE.Vector3(), spin: !reduceMotion };
        const zoom = (f) => { o.z = Math.min(Math.max(o.z * f, 0.3), 4); };
        let metal = '', finish = '', raf = 0;
        function place() {
          const sp = Math.sin(o.pol);
          const r = o.fit * o.z;
          cam.position.set(o.target.x + r * sp * Math.sin(o.az), o.target.y + r * Math.cos(o.pol), o.target.z + r * sp * Math.cos(o.az));
          cam.lookAt(o.target);
        }
        function frame(box) {
          const w = Math.max(box.maxX - box.minX, 1), h = Math.max(box.maxY - box.minY, 1);
          o.fit = (Math.max(w / cam.aspect, h) * 0.5) / Math.tan((cam.fov * Math.PI) / 360) * 1.35;
        }
        function resize() {
          const W = host.clientWidth, H = host.clientHeight;
          if (!W || !H) return;
          renderer.setSize(W, H, false);
          cam.aspect = W / H; cam.updateProjectionMatrix();
          if (result) frame(result.bbox);
        }
        function tick() {
          raf = 0;
          if (!on) return;
          if (settings.metal !== metal) { metal = settings.metal; studio.setMetal(metal); }
          const f = design.finish || 'polished';
          if (f !== finish) { finish = f; studio.setFinish(f); }
          if (o.spin) o.az += 0.0045;
          place();
          try { renderer.render(scene, cam); } catch (e) { /* context lost */ }
          raf = requestAnimationFrame(tick);
        }
        // Pointer: one finger or the mouse turns, two fingers pinch to zoom.
        const pts = new Map();
        let pinch = 0;
        const stop = () => { o.spin = false; };
        cv.addEventListener('pointerdown', (e) => { stop(); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
        cv.addEventListener('pointermove', (e) => {
          const p = pts.get(e.pointerId);
          if (!p) return;
          if (pts.size === 1) {
            o.az -= (e.clientX - p.x) * 0.008;
            o.pol = Math.min(Math.max(o.pol - (e.clientY - p.y) * 0.008, 0.05), Math.PI - 0.05);
          }
          p.x = e.clientX; p.y = e.clientY;
          if (pts.size === 2) {
            const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinch && d) zoom(pinch / d);
            pinch = d;
          }
        });
        const up = (e) => { pts.delete(e.pointerId); pinch = 0; };
        cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
        cv.addEventListener('wheel', (e) => { e.preventDefault(); stop(); zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
        cv.addEventListener('dblclick', () => { o.az = START.az; o.pol = START.pol; o.z = 1; o.spin = !reduceMotion; });
        if (window.ResizeObserver) new ResizeObserver(resize).observe(host); else window.addEventListener('resize', resize);
        return {
          set(d, T, box) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(d.positions, 3));
            geo.setAttribute('normal', new THREE.BufferAttribute(d.normals, 3));
            const uv = new Float32Array((d.positions.length / 3) * 2);
            for (let i = 0, j = 0; i < d.positions.length; i += 3, j += 2) { uv[j] = d.positions[i] / 16; uv[j + 1] = d.positions[i + 1] / 16; }
            geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
            geo.setIndex(new THREE.BufferAttribute(d.indices, 1));
            mesh.geometry.dispose();
            mesh.geometry = geo;
            o.target.set((box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2, T / 2);
            resize(); frame(box);
          },
          run() { if (!raf) raf = requestAnimationFrame(tick); },
          resize,
        };
      }
      function refresh() {
        if (!v || !result) return;
        v.set(N.buildDisplay(result, design.thickness), design.thickness, result.bbox);
        dirty = false;
        dims.textContent = `${result.width.toFixed(2)} × ${result.height.toFixed(2)} mm · ${design.thickness.toFixed(1)} mm thick${final ? '' : ' · updating'}`;
      }
      return {
        show(yes) {
          on = yes;
          if (!yes) return;
          if (!v && !tried) {
            say('Loading 3D…');
            threeReady.then(() => {
              tried = true;
              v = make();
              if (!v) { say("3D can't run in this browser (WebGL is off or three.js didn't load)."); return; }
              say('');
              if (on) { v.resize(); refresh(); v.run(); }
            });
            return;
          }
          if (!v) return;
          v.resize();
          if (dirty) refresh();
          v.run();
        },
        update() { dirty = true; if (on && v) refresh(); },
      };
    }
    // The flat close-up: the plate's outline filled with a metal gradient, scaled to the close-up.
    const FLAT_STOPS = { yellow: ['#F6DFA6', '#E2B35A', '#B9893A'], rose: ['#F5D2C2', '#DFA084', '#B47258'], white: ['#F4F6F7', '#CDD1D2', '#9CA3A6'] };
    function drawCloseupFlat() {
      if (!result || preview.ok) return;
      const b = result.bbox, w = Math.max(b.maxX - b.minX, 1), h = Math.max(b.maxY - b.minY, 1), pad = 0.12;
      const vw = w * (1 + 2 * pad), vh = Math.max(h * 1.6, vw * 0.5);
      const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2, st = FLAT_STOPS[settings.metal] || FLAT_STOPS.white;
      const d = result.groups.flatMap((g) => [g.outer, ...g.holes]).map((p) => 'M' + p.map((q) => (q.X / N.SCALE).toFixed(3) + ',' + (-q.Y / N.SCALE).toFixed(3)).join('L') + 'Z').join('');
      closeupSvg.setAttribute('viewBox', `${(cx - vw / 2).toFixed(2)} ${(-cy - vh / 2).toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`);
      closeupSvg.innerHTML = `<defs><linearGradient id="nnFlat" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${st[0]}"/><stop offset="0.55" stop-color="${st[1]}"/><stop offset="1" stop-color="${st[2]}"/></linearGradient></defs><path d="${d}" fill="url(#nnFlat)" fill-rule="evenodd" stroke="rgba(0,0,0,.3)" stroke-width="${(w / 400).toFixed(3)}"/>`;
    }

    /* ---------- rebuild, off the main thread ---------- */
    // Every change asks for a quick pass (no reinforcement, no thin check) straight away, and for the reinforced,
    // checked pass once the changes stop. Only the checked pass of the current design can be ordered.
    // The geometry runs in two Web Workers so typing and scrolling never wait for it: one for quick passes, one
    // for the reinforced pass (a second or two on a phone), so a long reinforced build never holds up the next
    // quick one. Each worker takes one design at a time; a design asked for while it is busy waits, and a newer
    // one replaces it. If a worker can't start, that pass runs here instead.
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const lanes = {}, finalWaiters = [];
    let quickShownId = -1;
    function makeWorker() {
      if (!window.Worker || !window.Blob || !window.URL || !URL.createObjectURL || !cfg.coreUrl) return null;
      try {
        const libs = [CDN.opentype.src, CDN.clipper.src, CDN.earcut.src, new URL(cfg.coreUrl, location.href).href];
        const code = `importScripts(${libs.map((u) => JSON.stringify(u)).join(', ')});
          const fonts = {};
          onmessage = (e) => {
            const m = e.data;
            if (m.fonts) { for (const k in m.fonts) fonts[k] = opentype.parse(m.fonts[k]); return; }
            try { postMessage({ id: m.id, r: Nameplate.build(fonts[m.design.font] || fonts[Object.keys(fonts)[0]], m.design, m.opts) }); }
            catch (err) { postMessage({ id: m.id, error: String((err && err.message) || err) }); }
          };`;
        const w = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
        w.postMessage({ fonts: rawFonts }); // copied, so the page keeps its own
        return w;
      } catch (e) { return null; }
    }
    function lane(kind) {
      if (kind in lanes) return lanes[kind];
      const w = makeWorker();
      if (!w) return (lanes[kind] = null);
      const L = lanes[kind] = { w, job: null, next: null };
      const giveUp = () => { // the worker failed: this pass runs here from now on
        lanes[kind] = null;
        try { w.terminate(); } catch (e) { /* gone */ }
        const pending = [L.job, L.next].filter(Boolean);
        L.job = L.next = null;
        pending.forEach((j) => runHere(kind, j));
      };
      w.onmessage = (e) => {
        const m = e.data, job = L.job;
        if (!job || m.id !== job.id) return;
        L.job = null;
        if (m.error) { console.warn('Name necklace builder: worker build failed, building here', m.error); runHere(kind, job); }
        else applyBuild(m.r, kind === 'final', m.id);
        if (L.next && lanes[kind] === L) { const n = L.next; L.next = null; send(L, n); }
      };
      w.onerror = (e) => { if (e && e.preventDefault) e.preventDefault(); console.warn('Name necklace builder: worker unavailable, building here', e && e.message); giveUp(); };
      return L;
    }
    function send(L, job) { L.job = job; L.w.postMessage({ id: job.id, design: job.design, opts: job.opts }); }
    function runHere(kind, job) {
      let r;
      try { r = N.build(getFont(job.design.font), job.design, job.opts); }
      catch (e) { console.warn('Name necklace builder:', e); r = { ok: false, error: { code: 'error', message: 'Something went wrong drawing this design. Please try again.' } }; }
      applyBuild(r, kind === 'final', job.id);
    }
    function requestBuild(kind) {
      const isFinal = kind === 'final';
      const job = { id: designSeq, design: isFinal ? clone(design) : Object.assign(clone(design), { reinforce: false }), opts: { detail: settings.detail, checks: isFinal } };
      const L = lane(kind);
      if (!L) { runHere(kind, job); return; }
      if (L.job) L.next = job; else send(L, job);
    }
    // A design change: quick pass now, the reinforced pass after the pause, and a new price.
    let raf = 0;
    function schedule() {
      final = false;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        designSeq++;
        requestBuild('quick');
        clearTimeout(finalTimer);
        finalTimer = setTimeout(() => { finalTimer = 0; requestBuild('final'); }, FINAL_DELAY);
        priceChanged();
      });
    }
    // Resolves once the reinforced, checked build of the current design is showing (Add to cart, STL download).
    function whenFinal() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; designSeq++; priceChanged(); }
      if (final && !finalTimer) return Promise.resolve();
      clearTimeout(finalTimer); finalTimer = 0;
      const L = lanes.final, inFlight = L && ((L.job && L.job.id === designSeq) || (L.next && L.next.id === designSeq));
      const p = new Promise((resolve) => finalWaiters.push(resolve));
      if (!inFlight) requestBuild('final');
      return p;
    }
    function applyBuild(r, isFinal, id) {
      if (isFinal && id !== designSeq) return; // the design has changed since: a newer one is on its way
      if (!isFinal && (id < quickShownId || (final && id === designSeq))) return; // older, or the checked one is already up
      if (!isFinal) quickShownId = id;
      if (!r.ok) {
        buildError = r.error;
        if (isFinal) final = true;
        renderNameWarn();
        renderChoices();
        renderSaveState();
      } else {
        buildError = null;
        renderNameWarn();
        result = r; final = isFinal && id === designSeq;
        mesh = N.buildMesh(r, design.thickness);
        if (!mesh.volumeOk) console.warn('Nameplate: mesh volume does not match outline area x thickness', mesh.volume, mesh.expected);
        preview.set(N.buildDisplay(r, design.thickness), design.thickness, r.bbox);
        drawCloseupFlat();
        if (editor) editor.onBuild();
        const c = r.curve, cr = $('curveReadout');
        cr.innerHTML = !c.degrees ? '<b>Flat</b>' : `<b>${Math.abs(c.degrees)}°</b>`;
        if (c.limited) cr.innerHTML += ` · limited to ${c.maxDegrees}° for a name this short, so the letters don't fold`;
        $('dims').textContent = `${r.width.toFixed(1)} × ${r.height.toFixed(1)} mm`;
        renderChecks();
        renderStats();
        renderSize();
        renderSummary();
        renderChoices();
        renderSaveState();
      }
      if (isFinal) finalWaiters.splice(0).forEach((resolve) => resolve());
    }

    // What stops an order, and which section fixes it.
    function blocker() {
      if (buildError) return { block: 1, msg: buildError.message };
      if (!result) return { block: 1, msg: 'Type a name to start.' };
      if (result.loose.length) return { block: 2, msg: $('looseWarn').textContent || "This name doesn't hold together in this font." };
      if (final && result.thin.length) return { block: 2, msg: $('thinWarn').textContent };
      return null;
    }
    function renderChecks() {
      const looseWarn = $('looseWarn'), thinWarn = $('thinWarn'), note = $('reinforceNote');
      const loose = result.loose.length;
      if (loose) {
        const what = [...new Set(result.loose.map((l) => l.label))];
        looseWarn.textContent = `This name doesn't hold together in this font: ${what.join(', ')} would cast as a separate piece. Try another font, or more letter overlap under Style, More options.`;
      }
      looseWarn.hidden = !loose;
      const thin = final && result.thin.length > 0;
      thinWarn.textContent = thin ? 'This font is too fine at this height to cast. Try a bigger height or another font.' : '';
      thinWarn.hidden = !thin;
      note.hidden = !(final && !thin && result.reinforced && result.reinforced.passes > 0);
    }

    // Weight for the chosen metal only (the server's figure replaces it once the quote arrives).
    function renderStats() {
      if (!mesh) return;
      const grams = Alloys.weightGrams(mesh.volume, alloy);
      $('weightLine').textContent = `About ${grams.toFixed(2)} g in ${alloy.name}. Outline area × thickness × the alloy's density.`;
      if (!showStl) return;
      const tris = mesh.triangles;
      const bytes = settings.format === 'binary' ? 84 + 50 * tris : tris * 240.5;
      $('stats').innerHTML = `<b>${tris.toLocaleString()}</b> triangles · ${settings.format === 'binary' ? '' : '≈ '}${fmtBytes(bytes)} · ${mesh.volume.toFixed(1)} mm³${final ? '' : ' (updating)'}`;
    }

    /* ---------- review summary and the collapsed headers ---------- */
    const fontName = () => N.fontMeta(design.font).name;
    const thicknessText = () => { const c = THICKNESS_CHOICES.find(([t]) => t === design.thickness); return `${c ? c[1] + ' ' : ''}${design.thickness.toFixed(1)} mm`; };
    const curveText = () => { const c = result && result.curve.degrees; return !c ? 'Straight' : `${Math.abs(c)}° curve`; };
    const loopsText = () => { const L = design.loops; return L.left.on && L.right.on ? 'Left and right' : L.left.on ? 'Left only' : L.right.on ? 'Right only' : 'None'; };
    const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
    function renderSummary() {
      const rows = [
        ['Name', design.text], ['Font', fontName()],
        ['Size', result ? `${result.width.toFixed(1)} × ${result.height.toFixed(1)} mm` : `${design.height} mm high`],
        ['Thickness', thicknessText()], ['Curve', curveText()], ['Chain loops', loopsText()],
        ['Metal', alloy.name], ['Chain', cap(chainText())], ['Finish', cap(design.finish || 'polished')],
      ];
      $('summary').innerHTML = rows.map(([k, v]) => `<div class="nn__summary-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('');
    }
    const choiceEl = (n) => { const b = blockOf(n); return b && b.querySelector('[data-choice]'); };
    function renderChoices() {
      const set = (n, text) => { const el = choiceEl(n); if (el) el.textContent = text; };
      const sp = chainSpec(), short = THICKNESS_CHOICES.find(([t]) => t === design.thickness);
      set(1, design.text ? `“${design.text}”` : '');
      set(2, [fontName(), `${design.height} mm`, result && result.curve.degrees ? `${Math.abs(result.curve.degrees)}°` : 'flat', short ? short[1] : `${design.thickness} mm`].join(' · '));
      set(3, alloy.name);
      set(4, [chain.style.name, gaugesOn && sp.gaugeName ? `${sp.gaugeName} ${sp.width.toFixed(1)} mm` : `${sp.width.toFixed(1)} mm`, `${chain.lengthCm} cm`, chain.alloy.name].join(' · '));
      set(5, price ? money(price.price) : '');
    }

    /* ---------- on a neck: the necklace to scale on a neckline ---------- */
    // Everything is drawn in millimetres and scaled to the stage. With a photo configured in the section
    // (cfg.neckImage plus the two points where the chain comes over the shoulders and the collarbone notch, as
    // percentages of the photo), the real distance between the chain points sets the scale; otherwise a line
    // drawing of a neckline is used. The chain length sets how far below the notch the plate hangs: 40 cm sits
    // at the base of the neck, 45 cm just below the collarbones, 50 cm a little lower.
    const sizeSvg = $('sizeSvg'), sizeBar = $('sizeBar');
    const DROP_MM = { 40: 4, 45: 24, 50: 46 };
    const platePath = () => {
      if (!result) return '';
      const b = result.bbox, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
      return result.groups.flatMap((g) => [g.outer, ...g.holes]).map((p) => 'M' + p.map((q) => (q.X / N.SCALE - cx).toFixed(3) + ',' + (cy - q.Y / N.SCALE).toFixed(3)).join('L') + 'Z').join('');
    };
    // Metal colours: a polished face (light, mid, highlight, mid, dark) and the darker tone of the plate's edge.
    const METAL_STOPS = {
      yellow: { face: ['#FBEBB8', '#E6BB5E', '#FFF1C4', '#D9A94A', '#A9792E'], edge: '#8E6424', link: ['#FFF3CC', '#E3B757', '#9E7029'] },
      rose: { face: ['#FAE0D2', '#E4A88C', '#FFEBE0', '#D89474', '#A9684E'], edge: '#8F5640', link: ['#FFEEE4', '#E2A287', '#9C6349'] },
      white: { face: ['#FBFCFC', '#D3D7D9', '#FFFFFF', '#C2C7CA', '#8F979B'], edge: '#788085', link: ['#FFFFFF', '#D6DADC', '#8E969A'] },
    };
    // Gradients for a chain's links in a metal (ids suffixed so tiles and the neck view can each have their own).
    function linkDefs(id, metal) { const m = METAL_STOPS[metal] || METAL_STOPS.white; return `<defs><radialGradient id="nnLink-${id}" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="${m.link[0]}"/><stop offset="0.5" stop-color="${m.link[1]}"/><stop offset="1" stop-color="${m.link[2]}"/></radialGradient></defs>`; }
    const metalDefs = () => {
      const m = METAL_STOPS[settings.metal] || METAL_STOPS.white, f = m.face;
      return `<defs><linearGradient id="nnMetal" x1="0" y1="0" x2="0.55" y2="1"><stop offset="0" stop-color="${f[0]}"/><stop offset="0.32" stop-color="${f[1]}"/><stop offset="0.5" stop-color="${f[2]}"/><stop offset="0.68" stop-color="${f[3]}"/><stop offset="1" stop-color="${f[4]}"/></linearGradient>
        <filter id="nnContact" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="0.22"/></filter>
        <filter id="nnAmbient" x="-40%" y="-40%" width="180%" height="220%"><feGaussianBlur stdDeviation="1.1"/></filter>
        <filter id="nnSoft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="0.07"/></filter>
        <filter id="nnChainBlur" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="0.5"/></filter></defs>` + linkDefs('neck', chainMetal());
    };
    // The plate on skin: a warm shadow that darkens the photo (multiply) instead of painting grey over it - a
    // tight contact shadow plus a wide faint one - then the plate's edge a touch below, then the polished face.
    const plateOnSkin = (d) => `<g style="mix-blend-mode:multiply"><path d="${d}" fill="#6b3a24" fill-rule="evenodd" opacity=".28" transform="translate(0.35,1.1)" filter="url(#nnAmbient)"/><path d="${d}" fill="#5a2e1c" fill-rule="evenodd" opacity=".4" transform="translate(0.12,0.38)" filter="url(#nnContact)"/></g>
      <g filter="url(#nnSoft)"><path d="${d}" fill="${(METAL_STOPS[settings.metal] || METAL_STOPS.white).edge}" fill-rule="evenodd" transform="translate(0.1,0.28)"/><path d="${d}" fill="url(#nnMetal)" fill-rule="evenodd"/></g>`;
    const label = (x, y, text) => `<text class="sz-l" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">${esc(text)}</text>`;
    // Where the chain hooks on: each loop's hole, in mm from the plate's centre (svg axes, y down), as the casting
    // has it. A side whose loop is off (staff only) falls back to the plate's end, level with its middle.
    const hookPoints = () => {
      const b = result.bbox, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2, half = result.width / 2 - 1.6;
      const at = (side) => { const lp = result.loops.find((l) => l.side === side); return lp ? { x: lp.cx - cx, y: cy - lp.cy, r: lp.outer / 2, hole: lp.hole / 2 } : { x: side === 'left' ? -half : half, y: 0, r: 0, hole: 0 }; };
      return { left: at('left'), right: at('right') };
    };
    // A jump ring through the hole, threaded on the chain's last link: an oval along the way the chain leaves,
    // its near end inside the hole. Drawn over the plate so the chain reads as hooked on, not tucked under.
    const jumpRing = (hx, hy, ux, uy, hk, pxmm) => {
      if (!hk.r) return '';
      const st = chainSpec(), wire = Math.max(0.35, Math.min(0.7, st.wire || 0.5));
      const len = hk.hole + hk.r + 0.6, rx = (len / 2) * pxmm, ry = Math.max(0.55, hk.hole * 0.8) * pxmm;
      const mx = hx + ux * (len / 2 - hk.hole * 0.6) * pxmm, my = hy + uy * (len / 2 - hk.hole * 0.6) * pxmm, ang = (Math.atan2(uy, ux) * 180) / Math.PI;
      return `<ellipse cx="${mx.toFixed(2)}" cy="${my.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" transform="rotate(${ang.toFixed(1)} ${mx.toFixed(2)} ${my.toFixed(2)})" fill="none" stroke="url(#nnLink-neck)" stroke-width="${(wire * pxmm).toFixed(2)}"/>`;
    };
    // One side of the chain, from the shoulder anchor (ax, ay) to the hook at (hx, hy): it ends on the far side of
    // the jump ring, coming in from above and outside so it never crosses the lettering. Returns [chain, ring].
    const hookedChain = (ax, ay, hx, hy, hk, out, pxmm, onSkin) => {
      const len = hk.r ? hk.hole + hk.r + 0.6 : 0;
      // the way the chain leaves the hook: outward and up, toward the shoulder
      let ux = Math.sign(out) * 0.8, uy = -0.6; const l = Math.hypot(ux, uy); ux /= l; uy /= l;
      const ex = hx + ux * len * pxmm, ey = hy + uy * len * pxmm;
      const P = chainCurve(ax, ay, ex, ey, out);
      return [chainSvg(P, pxmm, onSkin), jumpRing(hx, hy, ux, uy, hk, pxmm)];
    };
    // The chain leaves the anchor (the neck's edge) heading straight down, as if coming round from behind, then
    // sweeps in to the loop.
    const chainCurve = (ax, ay, lx, ly, out) => { const d = ly - ay; return [[ax, ay], [ax + out * 0.3, ay + d * 0.42], [lx - out * 4, ly - d * 0.35], [lx, ly]]; };
    const bez = (P, t) => { const u = 1 - t; return [u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0], u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]]; };
    // The links of one chain (a style in a gauge) laid along a list of points already spaced at the pitch, in the
    // drawing's units per mm. Cable: oval links, every second one on its edge. Belcher: round links the same way.
    // Curb: every link twisted to lie flat, so a row of overlapping ovals with a slight alternate tilt.
    function linkRun(st, pts, pxmm, fill, swMin, fadeFrom) {
      const edge = 0.5 * st.wire * pxmm * 0.85, sw = Math.max(swMin, st.wire * pxmm * 0.38);
      let out = '';
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], c = pts[i];
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
        const op = fadeFrom ? Math.min(1, (i + 1) / fadeFrom) : 1;
        const at = `transform="rotate(${ang.toFixed(1)} ${c[0].toFixed(2)} ${c[1].toFixed(2)})"${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}`;
        if (st.key === 'curb') {
          const rx = (st.link[0] / 2) * pxmm, ry = (st.link[1] / 2) * pxmm * 0.72, tilt = i % 2 ? 14 : -14;
          out += `<ellipse cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" transform="rotate(${(ang + tilt).toFixed(1)} ${c[0].toFixed(2)} ${c[1].toFixed(2)})" fill="none" stroke="${fill}" stroke-width="${(sw * 1.9).toFixed(2)}"${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}/>`;
        } else {
          const flat = i % 2 === 0, rx = ((st.link[0] - st.wire) / 2) * pxmm, ry = ((st.link[1] - st.wire) / 2) * pxmm;
          out += `<ellipse cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" rx="${rx.toFixed(2)}" ry="${(flat ? ry : edge).toFixed(2)}" ${at} fill="${flat ? 'none' : fill}" stroke="${fill}" stroke-width="${(flat ? sw * 1.5 : sw).toFixed(2)}"/>`;
        }
      }
      return out;
    }
    const chainSvg = (P, pxmm, onSkin) => {
      const st = chainSpec(), pitch = Chains.pitch(st) * pxmm;
      // walk the curve at even spacing
      const pts = []; let prev = bez(P, 0), acc = 0; pts.push(prev);
      for (let i = 1; i <= 400; i++) { const t = i / 400, q = bez(P, t); acc += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; if (acc >= pitch) { pts.push(q); acc = 0; } }
      const path = `M${P[0][0].toFixed(2)},${P[0][1].toFixed(2)}C${P.slice(1).map((q) => q[0].toFixed(2) + ',' + q[1].toFixed(2)).join(' ')}`;
      // One soft warm shadow under the whole chain (fading in with it), rather than a hard one under every link.
      const out = onSkin ? `<g style="mix-blend-mode:multiply"><path d="${path}" fill="none" stroke="#5a2e1c" stroke-width="${(st.width * 0.75 * pxmm).toFixed(2)}" stroke-linecap="round" opacity=".3" transform="translate(${(0.15 * pxmm).toFixed(2)},${(0.55 * pxmm).toFixed(2)})" filter="url(#nnChainBlur)"/></g>` : '';
      // The first links fade in: the chain is coming round from behind the neck.
      return out + '<g>' + linkRun(st, pts, pxmm, 'url(#nnLink-neck)', 0.3, 7) + '</g>';
    };
    // Line illustration of a neckline, in mm (figure centre x = 160, notch at y = 104).
    const NECK = { x0: 50, y0: 0, w: 220, h: 190, anchors: [[113, 77], [207, 77]], notch: [160, 104] };
    const neckArt = () => `<g fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M112 0 C118 14 134 26 160 27 C186 26 202 14 208 0"/>
      <path d="M126 22 C126 44 124 62 114 76 C98 94 62 98 30 114 C14 122 6 132 4 156 L4 240"/>
      <path d="M194 22 C194 44 196 62 206 76 C222 94 258 98 290 114 C306 122 314 132 316 156 L316 240"/>
      <path d="M154 104 C132 98 104 94 80 100" stroke-opacity=".5"/>
      <path d="M166 104 C188 98 216 94 240 100" stroke-opacity=".5"/>
      <path d="M156 103 C158 107 162 107 164 103" stroke-opacity=".4"/></g>`;
    // The photo, if any: loaded once so its proportions are known.
    const photo = { url: cfg.neckImage || '', w: 0, h: 0, failed: false };
    if (photo.url) { const im = new Image(); im.onload = () => { photo.w = im.naturalWidth; photo.h = im.naturalHeight; renderSize(); }; im.onerror = () => { photo.failed = true; renderSize(); }; im.src = photo.url; }
    const stageSize = () => ({ W: stage.clientWidth, H: stage.clientHeight });
    function renderSize() {
      if (!result || !sizeSvg) return;
      const { W, H } = stageSize();
      if (!W || !H) return;
      sizeSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const pw = result.width, pad = 24;
      const hudT = stage.querySelector('.nn__hud--top'), hudB = stage.querySelector('.nn__hud--bottom');
      const top = (hudT ? hudT.offsetHeight : 40) + 24, bottom = (hudB ? hudB.offsetHeight : 40) + 24;
      const capY = H - bottom - 30;
      let s = metalDefs();
      const nk = cfg.neck || {};
      if (photo.url && photo.w && !photo.failed) {
        // Fill the stage with the photo (no bars), positioned so the notch sits a little above centre and the
        // plate has room below it; then everything is placed in stage pixels.
        const sc = Math.max(W / photo.w, H / photo.h), iw = photo.w * sc, ih = photo.h * sc;
        const nn0 = nk.notch || [50, 52];
        const ix = Math.min(0, Math.max(W - iw, W / 2 - (nn0[0] / 100) * iw));
        const iy = Math.min(0, Math.max(H - ih, H * 0.42 - (nn0[1] / 100) * ih));
        const pt = (p) => [ix + (p[0] / 100) * iw, iy + (p[1] / 100) * ih];
        const L = pt(nk.left || [35, 38]), R = pt(nk.right || [65, 38]), Nn = pt(nk.notch || [50, 52]);
        const pxmm = Math.hypot(R[0] - L[0], R[1] - L[1]) / (nk.widthMm || 105);
        const py = Nn[1] + (DROP_MM[chain.lengthCm] || DROP_MM[45]) * pxmm, px = Nn[0];
        const hk = hookPoints();
        const left = hookedChain(L[0], L[1], px + hk.left.x * pxmm, py + hk.left.y * pxmm, hk.left, -pxmm, pxmm, true);
        const right = hookedChain(R[0], R[1], px + hk.right.x * pxmm, py + hk.right.y * pxmm, hk.right, pxmm, pxmm, true);
        s += `<image href="${esc(photo.url)}" x="${ix.toFixed(1)}" y="${iy.toFixed(1)}" width="${iw.toFixed(1)}" height="${ih.toFixed(1)}" preserveAspectRatio="none"/>`;
        s += `<rect x="0" y="${(H - 110).toFixed(0)}" width="${W}" height="110" fill="url(#nnFade)"/>`;
        s = s.replace('</defs>', `<linearGradient id="nnFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0e2a" stop-opacity="0"/><stop offset="1" stop-color="#0b0e2a" stop-opacity=".85"/></linearGradient></defs>`);
        s += left[0] + right[0];
        s += `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${pxmm.toFixed(4)})">${plateOnSkin(platePath())}</g>`;
        s += left[1] + right[1];
      } else {
        const sc = Math.min((W - pad * 2) / NECK.w, (capY - 16 - top) / NECK.h);
        const ox = (W - NECK.w * sc) / 2 - NECK.x0 * sc, oy = top - NECK.y0 * sc;
        const py = NECK.notch[1] + (DROP_MM[chain.lengthCm] || DROP_MM[45]);
        const [a, b] = NECK.anchors, hk = hookPoints();
        const left = hookedChain(a[0], a[1], 160 + hk.left.x, py + hk.left.y, hk.left, -1, 1, false);
        const right = hookedChain(b[0], b[1], 160 + hk.right.x, py + hk.right.y, hk.right, 1, 1, false);
        s += `<g transform="translate(${ox.toFixed(1)},${oy.toFixed(1)}) scale(${sc})">${neckArt()}`;
        s += left[0] + right[0];
        s += `<g transform="translate(160,${py})"><path d="${platePath()}" fill="url(#nnMetal)" fill-rule="evenodd"/></g>${left[1] + right[1]}</g>`;
      }
      // The caption names the chain; on a narrow stage it drops the width and the metal so it fits.
      const sp = chainSpec(), gn = gaugesOn && sp.gaugeName ? sp.gaugeName.toLowerCase() + ' ' : '';
      s += label(W / 2, capY, W < 520 ? `${chain.lengthCm} cm ${gn}${chain.style.name.toLowerCase()} chain · to scale` : `${cap(chainName())} in ${chain.alloy.name} · shown to scale`);
      sizeSvg.innerHTML = s;
      sizeBar.innerHTML = `<span class="nn__sz-l">Chain</span>` + Chains.LENGTHS_CM.map((c) => `<button type="button" class="nn__sz${chain.lengthCm === c ? ' on' : ''}" data-chain="${c}">${c} cm</button>`).join('');
    }
    if (window.ResizeObserver) new ResizeObserver(() => renderSize()).observe(stage);
    else window.addEventListener('resize', () => renderSize());
    sizeBar.addEventListener('click', (e) => { const b = e.target.closest('button[data-chain]'); if (!b) return; setChainLength(+b.dataset.chain); });

    document.addEventListener('keydown', (e) => {
      if (!((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z')) return;
      if (editable(e.target)) return; // let text fields undo their own typing
      if (!root.contains(e.target) && e.target !== document.body) return;
      e.preventDefault(); undo();
    });
    $('undoBtn').addEventListener('click', undo);

    if (showStl) {
      $('copyJson').addEventListener('click', async () => {
        const json = N.designJSON(design);
        try { await navigator.clipboard.writeText(json); say('Design JSON copied.'); }
        catch (e) {
          const ta = document.createElement('textarea'); ta.value = json; document.body.appendChild(ta); ta.select();
          const done = document.execCommand && document.execCommand('copy'); ta.remove();
          say(done ? 'Design JSON copied.' : "Couldn't copy here. Your browser blocked the clipboard.", !done);
        }
      });
    }

    /* ---------- price ---------- */
    // The price server rebuilds the design (reinforced), applies the metal price list and the markup, and sends
    // back just the final price. Every change asks again after a short pause; the old price shows as "from"
    // until the new one lands. The total shows in the price bar, itemised in Review.
    const PRICE_URL = apiBase + '/quote';
    const priceOut = $('priceOut'), barPrice = $('barPrice'), stagePrice = $('stagePrice');
    let priceTimer = 0, priceSeq = 0, price = null; // price: the last quote { price, weightGrams, alloy, plate, chain } or null
    const priceWaiters = []; // resolved when a quote lands (Save to order waits for the current price)
    const whenPriced = () => (price ? Promise.resolve() : new Promise((resolve) => { priceWaiters.push(resolve); setTimeout(resolve, 12000); }));
    const chainPayload = () => (gaugesOn ? { style: chain.style.key, gauge: chain.gauge, lengthCm: chain.lengthCm, alloy: chain.alloy.key } : { style: chain.style.key, lengthCm: chain.lengthCm, alloy: chain.alloy.key });
    // The total shows in the price bar and, so it stays in view while the necklace is changed, on the stage too.
    const setBar = (html, cls) => { barPrice.className = 'nn__bar-price' + (cls ? ' ' + cls : ''); barPrice.innerHTML = html; if (stagePrice) { stagePrice.className = 'nn__stage-price' + (cls ? ' ' + cls : ''); stagePrice.innerHTML = html; } };
    async function requestPrice() {
      if (buildError) {
        price = null; priceOut.className = 'nn__price err'; priceOut.textContent = 'Fix the name to see a price.';
        setBar('—', 'err'); renderChoices(); renderSaveState(); return;
      }
      const seq = ++priceSeq;
      priceOut.classList.add('stale');
      renderSaveState();
      try {
        const res = await fetch(PRICE_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ design: JSON.parse(N.designJSON(design)), alloy: alloy.key, chain: chainPayload(), staff: STAFF ? { build: STAFF.build, t: STAFF.t } : undefined }) });
        const b = await res.json().catch(() => ({}));
        if (seq !== priceSeq) return; // a newer request is on its way
        if (!res.ok) {
          price = null; priceOut.className = 'nn__price err';
          priceOut.textContent = res.status === 429 ? 'Please wait a moment and try again.' : (b.error || `The price service answered ${res.status}.`);
          setBar('—', 'err');
          return;
        }
        // A server from before gauges answers without one: only Medium can be made there.
        if (b.chain && !b.chain.gauge && gaugesOn) { gaugesOn = false; chain.gauge = 'medium'; renderChainTiles(); renderChainGauges(); renderSize(); renderSummary(); }
        price = { price: b.price, weightGrams: b.weightGrams, alloy: b.alloy, alloyName: b.alloyName, plate: b.plate, chain: b.chain, staff: b.staff || null, metalPriceAt: b.metalPriceAt };
        if (STAFF) renderStaffFigures();
        if (b.gaugePrices) { gaugePrices = b.gaugePrices; gaugePricesFresh = true; renderChainGauges(); }
        priceOut.className = 'nn__price';
        const ch = b.chain;
        const chainWords = ch ? `${ch.lengthCm} cm ${ch.gaugeName ? ch.gaugeName.toLowerCase() + ' ' : ''}${ch.styleName.toLowerCase()}, ${ch.alloyName}` : '';
        // One total; underneath, what it is for (no part prices, weights or metal-price dates: the customer buys a necklace).
        const parts = ch ? `Nameplate · ${esc(b.alloyName)}<br>Chain · ${esc(chainWords)}` : `Nameplate · ${esc(b.alloyName)}`;
        priceOut.innerHTML = `${money(b.price)}<small>${parts}</small>`;
        setBar(money(b.price));
        renderChoices();
      } catch (err) {
        if (seq !== priceSeq) return;
        price = null; priceOut.className = 'nn__price err';
        priceOut.textContent = "Couldn't reach the price service. Check the connection and try again.";
        setBar('—', 'err');
      } finally { if (seq === priceSeq) { renderSaveState(); priceWaiters.splice(0).forEach((resolve) => resolve()); } }
    }
    function priceChanged() { // keep the price current as the design changes
      if (price && !buildError) {
        priceOut.className = 'nn__price stale'; priceOut.innerHTML = `<span class="from">from</span>${money(price.price)}`;
        setBar(`<span class="from">from</span>${money(price.price)}`, 'stale');
      } else if (!buildError) {
        priceOut.className = 'nn__price stale'; priceOut.textContent = 'Working out the price…';
        setBar('Working it out…', 'stale');
      }
      price = null;
      renderChoices();
      renderSaveState();
      saveDraft();
      clearTimeout(priceTimer);
      priceTimer = setTimeout(requestPrice, 700);
    }

    /* ---------- add to cart ---------- */
    // {api}/build rebuilds the design with the checks on, writes the STL and makes one hidden Shopify product at the
    // quoted price. The theme adds that variant with the design details as line item properties.
    const addBtn = $('addBtn'), status = $('status');
    let cartState = cfg.cartEnabled ? 'checking' : 'off'; // 'checking' | 'on' | 'off'
    let adding = false, picturesOn = false; // picturesOn: the server takes a design picture with the build
    if (cfg.cartEnabled) {
      fetch(apiBase + '/health').then((r) => r.json()).then((j) => { cartState = j && j.cart ? 'on' : 'off'; picturesOn = !!(j && j.pictures); renderSaveState(); }).catch(() => { cartState = 'on'; renderSaveState(); }); // unsure: let /build decide
    }
    function say(text, isErr) { status.textContent = text || ''; status.classList.toggle('err', !!isErr); }
    // A blocked design keeps the button live: pressing it opens the section that fixes it.
    function renderSaveState() {
      const blocked = !!blocker();
      if (STAFF) {
        addBtn.textContent = adding ? 'Saving…' : 'Save to order';
        addBtn.disabled = adding || (!blocked && !price);
      } else if (cartState === 'off') {
        addBtn.textContent = 'Enquire about this design';
        addBtn.disabled = adding;
      } else {
        addBtn.textContent = adding ? 'Adding to cart…' : 'Add to cart';
        addBtn.disabled = adding || cartState === 'checking' || (!blocked && !price);
      }
      if (showStl) { $('saveBtn').disabled = !result || !!buildError; $('saveConfirm').hidden = true; }
    }
    const enquiryHref = () => {
      const q = new URLSearchParams();
      q.set('design', `Name necklace · ${design.text} · ${fontName()} · ${design.height} mm · ${alloy.name} · ${design.finish || 'polished'} · ${chainText()}`);
      return String(cfg.contactUrl || '/pages/contact') + '?' + q.toString() + '#contact';
    };
    const stlAbsolute = (u) => (/^https?:\/\//i.test(u) ? u : apiBase + String(u).replace(/^\/api(?=\/)/, ''));
    function showBlocker(b) {
      openBlock(b.block);
      if (b.block === 2) {
        // The fix is a font, a height or the overlap: say so where the warning lives too.
        say(b.msg, true);
        $('nameIn').blur();
      } else {
        renderNameWarn();
        say(b.msg, true);
        setTimeout(() => $('nameIn').focus({ preventScroll: true }), 0);
      }
    }
    async function addToCart() {
      if (adding) return;
      adding = true; say(''); renderSaveState();
      await whenFinal();
      adding = false;
      const b = blocker();
      if (b) { renderSaveState(); showBlocker(b); return; }
      if (cartState === 'off') { renderSaveState(); location.href = enquiryHref(); return; }
      if (!price) { renderSaveState(); say('One moment, the price is still being worked out.'); return; }
      adding = true; renderSaveState();
      let st = 0, j = {};
      // The picture of the design goes with the build so the hidden product (and so the cart) has an image.
      let picture = '';
      if (picturesOn) { try { picture = preview.snapshot(1000); } catch (e) { picture = ''; } }
      try {
        const payload = { design: JSON.parse(N.designJSON(design)), alloy: alloy.key, chain: chainPayload() };
        if (picture && picture.length < 800000) payload.preview = picture;
        const res = await fetch(apiBase + '/build', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        st = res.status; j = await res.json().catch(() => ({}));
      } catch (e) { st = 0; }
      if (st === 200 && j.variant_id) {
        const ch = j.chain;
        const props = {
          'Build': j.build, 'Name': design.text, 'Font': fontName(), 'Height': `${design.height} mm`, 'Thickness': thicknessText(),
          'Metal': j.alloyName || alloy.name,
          'Chain': ch ? cap(`${ch.lengthCm} cm ${ch.gaugeName ? ch.gaugeName.toLowerCase() + ' ' : ''}${ch.widthMm ? (+ch.widthMm).toFixed(1) + ' mm ' : ''}${String(ch.styleName).toLowerCase()} chain, ${ch.alloyName}`) : cap(chainText()),
          'Finish': cap(design.finish || 'polished'), 'Lead time': cfg.leadTime || '',
          // Underscore: Shopify keeps these off the cart, checkout and customer emails; staff see them on the order.
          '_Thin joints': result.reinforced && result.reinforced.passes > 0 ? `Reinforced to ${result.minFeature || N.MIN_FEATURE} mm` : '',
          '_STL': stlAbsolute(j.stl_url || ''),
        };
        if (!props['Lead time']) delete props['Lead time'];
        if (!props['_Thin joints']) delete props['_Thin joints'];
        try {
          const r = await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: j.variant_id, quantity: 1, properties: props }] }) });
          if (!r.ok) throw new Error('cart ' + r.status);
          clearDraft();
          location.href = '/cart';
          return;
        } catch (e) {
          adding = false; renderSaveState();
          say("The cart didn't take it. Please try again" + (cfg.phone ? ' or call us on ' + cfg.phone + '.' : '.'), true);
          return;
        }
      }
      adding = false; renderSaveState();
      if (st === 422 && (j.code === 'thin' || j.code === 'loose')) {
        const w = $(j.code === 'thin' ? 'thinWarn' : 'looseWarn');
        w.textContent = j.error || w.textContent; w.hidden = false;
        showBlocker({ block: 2, msg: j.error || 'This design could not be made.' });
      } else if (st === 422) {
        const w = $('nameWarn'); w.textContent = j.error || 'This design could not be made. Check the name and try again.'; w.hidden = false;
        openBlock(1); say(j.error || 'Check the name.', true);
      } else if (st === 501) { cartState = 'off'; renderSaveState(); status.innerHTML = `Online ordering isn't switched on yet. <a class="nn__link" href="${esc(enquiryHref())}">Send us an enquiry</a> and we will quote it for you.`; status.classList.add('err'); }
      else if (st === 429) say('Please wait a moment and try again.', true);
      else say("That didn't go through. Please try again" + (cfg.phone ? ' or call us on ' + cfg.phone + '.' : '.'), true);
    }
    $('controls').addEventListener('submit', (e) => { e.preventDefault(); if (STAFF) saveToOrder(); else addToCart(); });

    /* ---------- chat bubble ---------- */
    // Shopify's chat bubble sits in the bottom-right corner, where the price bar keeps Add to cart. While the bar is
    // down there the bubble is lifted just clear of it (the CSS reads --nn-chat-lift); otherwise it stays put.
    const priceBarEl = $('priceBar');
    let liftRaf = 0, liftPx = -1;
    function liftChat() {
      liftRaf = 0;
      const r = priceBarEl.getBoundingClientRect(), vh = window.innerHeight;
      const px = r.top < vh && r.bottom > vh - 100 ? Math.max(0, Math.round(vh - r.top - 12)) : 0;
      if (px !== liftPx) { liftPx = px; document.documentElement.style.setProperty('--nn-chat-lift', px + 'px'); }
    }
    queueLift = () => { if (!liftRaf) liftRaf = requestAnimationFrame(liftChat); };
    window.addEventListener('scroll', queueLift, { passive: true });
    window.addEventListener('resize', queueLift);
    if (window.ResizeObserver) { const ro = new ResizeObserver(queueLift); ro.observe(priceBarEl); ro.observe($('controls')); }

    /* ---------- STL download (testing only) ---------- */
    if (showStl) {
      const btn = $('saveBtn');
      function save() {
        $('saveConfirm').hidden = true;
        if (!mesh || buildError || !final) return;
        const base = N.fileBase(design);
        const bytes = settings.format === 'binary'
          ? N.toBinarySTL(mesh, `Nameplate ${base}, binary STL, units mm`)
          : N.toAsciiSTL(mesh, base);
        const url = URL.createObjectURL(new Blob([bytes], { type: 'model/stl' }));
        const a = document.createElement('a');
        a.href = url; a.download = base + '.stl';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        say(`Downloading ${base}.stl`);
      }
      btn.addEventListener('click', async () => {
        await whenFinal();
        if (result && result.loose.length) {
          $('saveConfirm').hidden = false;
          say('This design has a loose piece. Save anyway?', true);
          $('saveAnyway').focus();
          return;
        }
        save();
      });
      $('saveAnyway').addEventListener('click', save);
      $('saveCancel').addEventListener('click', () => { $('saveConfirm').hidden = true; say(''); });
    }

    /* ---------- keep the design across a reload ---------- */
    // The design and the choices are kept in this browser (localStorage), so a reload, a closed tab or a slip on
    // the back button does not lose them. Only the name and the options; forgotten after a week or once the
    // necklace is in the cart.
    const DRAFT_KEY = 'nn-draft-v1', DRAFT_DAYS = 7;
    function saveDraft() {
      if (STAFF) return; // the order's design lives on the API, not in this browser
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: Date.now(), design: JSON.parse(N.designJSON(design)), alloy: alloy.key, chain: { style: chain.style.key, gauge: chain.gauge, lengthCm: chain.lengthCm, alloy: chain.alloy.key } }));
      } catch (e) { /* storage off or full: nothing lost but the convenience */ }
    }
    function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ } }
    // Takes only what the page itself could have made; anything odd falls back to the default.
    function restoreDraft() {
      let d;
      try { d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (e) { return false; }
      if (!d || !d.design || !(Date.now() - d.at < DRAFT_DAYS * 86400e3)) return false;
      const s = d.design, base = N.defaultDesign();
      if (typeof s.text !== 'string' || !s.text.trim() || !N.FONTS.some((f) => f.key === s.font)) return false;
      if (N.fontMeta(s.font).retired) s.font = base.font; // a draft in a font no longer offered starts over in the default
      const num = (v, lo, hi, dflt) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : dflt);
      const L = s.loops || {};
      design = Object.assign(base, {
        text: Array.from(s.text).slice(0, N.MAX_CHARS).join(''), font: s.font,
        height: num(s.height, N.HEIGHT_RANGE[0], N.HEIGHT_RANGE[1], base.height),
        thickness: THICKNESS_CHOICES.some(([t]) => t === s.thickness) ? s.thickness : DEFAULT_THICKNESS,
        overlap: num(s.overlap, OV_MIN, OV_MAX, base.overlap), curve: num(s.curve, 0, N.CURVE_RANGE[1], DEFAULT_CURVE),
        dots: s.dots === 'remove' ? 'remove' : 'keep', finish: ['polished', 'brushed', 'satin'].includes(s.finish) ? s.finish : 'polished', reinforce: true,
        loops: { outer: num(L.outer, N.LOOP_OUTER_RANGE[0], N.LOOP_OUTER_RANGE[1], base.loops.outer), hole: num(L.hole, N.LOOP_HOLE_RANGE[0], N.LOOP_HOLE_RANGE[1], base.loops.hole), left: { on: !(L.left && L.left.on === false), dx: 0, dy: 0 }, right: { on: !(L.right && L.right.on === false), dx: 0, dy: 0 } },
        letters: [],
      });
      if (Alloys.byKey(d.alloy)) alloy = Alloys.byKey(d.alloy);
      const c = d.chain || {};
      if (Chains.byKey(c.style)) chain.style = Chains.byKey(c.style);
      if (typeof c.gauge === 'string' && Chains.spec && Chains.spec(chain.style, c.gauge)) chain.gauge = c.gauge;
      if (Chains.LENGTHS_CM.includes(c.lengthCm)) chain.lengthCm = c.lengthCm;
      if (Alloys.byKey(c.alloy) && !Chains.EXCLUDED_ALLOYS.includes(c.alloy)) chain.alloy = Alloys.byKey(c.alloy);
      return true;
    }

    /* ---------- staff mode: the dashboard's order review ---------- */
    // The dashboard's Custom Orders tab opens this page with ?build=<id>&t=<token>. The paid design (letters and
    // all) loads from the API; the stage gains a "Letters" view where single letters can be moved, turned and
    // scaled (click to select, drag to move, arrows nudge; the Style section has the exact numbers); every
    // thickness is offered; Review shows the cost figures the quote carries for that token; and the price bar's
    // button hands the design back to the dashboard window that opened the page (postMessage nn-revision), which
    // reprices it on the server and writes the revised STL. Nothing is added to the cart and no draft is kept.
    let editor = null;
    function renderStaffFigures() {}
    async function saveToOrder() {}
    let loadOrder = () => Promise.resolve();
    if (STAFF) {
      const inner = root.querySelector('.nn__inner');
      const bar = document.createElement('div');
      bar.className = 'nn__orderbar'; bar.id = 'orderBar';
      bar.innerHTML = `<div class="nn__orderbar-row"><b>Order review</b><span id="orderText">Loading ${esc(STAFF.build)}…</span></div>
        <label class="nn__orderbar-note"><span>Note for the order</span><input type="text" id="orderNote" class="nn__text" maxlength="300" placeholder="What changed and why, e.g. letters were too close, spaced the C and l"></label>`;
      inner.insertBefore(bar, app);
      const orderText = bar.querySelector('#orderText'), orderNote = bar.querySelector('#orderNote');
      orderNote.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });

      // --- load the paid design
      loadOrder = async () => {
        let meta;
        try {
          const res = await fetch(`${apiBase}/build/${encodeURIComponent(STAFF.build)}?t=${encodeURIComponent(STAFF.t)}`);
          if (!res.ok) throw new Error(res.status === 403 ? 'wrong token' : res.status === 404 ? 'no such build' : 'HTTP ' + res.status);
          meta = await res.json();
        } catch (e) {
          orderText.textContent = `Could not load ${STAFF.build} (${e.message}). Open this page from the dashboard's order.`;
          bar.classList.add('err');
          return;
        }
        STAFF.meta = meta;
        const d = meta.design || {};
        const base = N.defaultDesign();
        design = Object.assign(base, d, { reinforce: true, letters: Array.isArray(d.letters) ? d.letters : [] });
        if (!N.FONTS.some((f) => f.key === design.font)) design.font = base.font;
        if (!N.THICKNESSES.includes(design.thickness)) design.thickness = DEFAULT_THICKNESS;
        if (typeof design.curve !== 'number') design.curve = DEFAULT_CURVE;
        if (Alloys.byKey(meta.alloy)) alloy = Alloys.byKey(meta.alloy);
        const c = meta.chain || {};
        if (Chains.byKey(c.style)) chain.style = Chains.byKey(c.style);
        if (typeof c.gauge === 'string' && Chains.spec && Chains.spec(chain.style, c.gauge)) chain.gauge = c.gauge;
        if (Chains.LENGTHS_CM.includes(c.lengthCm)) chain.lengthCm = c.lengthCm;
        if (Alloys.byKey(c.alloy) && !Chains.EXCLUDED_ALLOYS.includes(c.alloy)) chain.alloy = Alloys.byKey(c.alloy);
        const order = meta.order && meta.order.order_name ? `order ${meta.order.order_name}` : (meta.paid ? 'paid' : 'unpaid');
        orderText.textContent = `${STAFF.build} · ${design.text} · ${alloy.name} · ${order} · ${meta.paid ? 'paid' : 'quoted'} ${money(meta.price || 0)}${meta.parent ? ` · revision of ${meta.parent}` : ''}`;
        if (meta.note) orderNote.value = String(meta.note).slice(0, 300);
      };

      // --- the letters view on the stage
      const editView = document.createElement('div');
      editView.className = 'nn__edit'; editView.id = 'editView'; editView.hidden = true;
      editView.innerHTML = `<svg class="nn__edit-svg" id="editSvg" tabindex="0" role="img" aria-label="The nameplate, letter by letter"></svg>
        <div class="nn__tools" id="toolRail" role="radiogroup" aria-label="Drag tool">
          <button type="button" data-tool="move" aria-pressed="true">Move <kbd>M</kbd></button>
          <button type="button" data-tool="rotate" aria-pressed="false">Rotate <kbd>R</kbd></button>
          <button type="button" data-tool="scale" aria-pressed="false">Scale <kbd>S</kbd></button>
        </div>
        <div class="nn__edit-dims" id="editDims"></div>`;
      stage.insertBefore(editView, stage.querySelector('.nn__hud--top'));
      const editSvg = editView.querySelector('#editSvg'), toolRail = editView.querySelector('#toolRail'), editDims = editView.querySelector('#editDims');
      // --- the 3D view on the stage: the plate as it will be cast, in the chosen metal and finish, turned with the
      // mouse or a finger. Made the first time it is opened (three.js has loaded by then, or it says so).
      const view3d = document.createElement('div');
      view3d.className = 'nn__3d'; view3d.id = 'view3d'; view3d.hidden = true;
      view3d.innerHTML = `<div class="nn__3d-msg" id="view3dMsg" hidden></div><div class="nn__edit-dims nn__3d-dims" id="view3dDims"></div>`;
      stage.insertBefore(view3d, stage.querySelector('.nn__hud--top'));
      const viewer3d = createViewer3d(view3d);
      const sizeView = $('sizeView'), hint = $('hint');
      const seg = document.createElement('div');
      seg.className = 'nn__viewseg'; seg.setAttribute('role', 'radiogroup'); seg.setAttribute('aria-label', 'Stage view');
      seg.innerHTML = `<button type="button" data-view="neck" aria-pressed="true">On a neck</button><button type="button" data-view="letters" aria-pressed="false">Letters</button><button type="button" data-view="3d" aria-pressed="false">3D</button>`;
      stage.querySelector('.nn__hud-left').insertBefore(seg, hint);
      let view = 'neck';
      function setView(v) {
        view = v;
        seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
        editView.hidden = v !== 'letters';
        view3d.hidden = v !== '3d';
        sizeView.hidden = v !== 'neck';
        $('sizeBar').hidden = v !== 'neck';
        hint.textContent = v === 'letters' ? 'Click a letter · drag to move · Shift-click for more · arrows nudge'
          : v === '3d' ? 'Drag to turn · scroll to zoom · double-click to reset' : 'Shown to scale';
        if (v === 'letters') { ed.fit(); ed.render(); }
        viewer3d.show(v === '3d');
      }
      seg.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

      // The editor: mm on the plate <-> pixels on the stage.
      const SC = N.SCALE, F = (p) => p.map((q) => [q.X / SC, q.Y / SC]);
      const ed = { s: 4, cx: 0, cy: 0, selection: [], hover: null, tool: 'move', drag: null };
      const toScreen = (x, y) => { const { W, H } = stageSize(); return [(x - ed.cx) * ed.s + W / 2, (ed.cy - y) * ed.s + H / 2]; };
      const toWorld = (e) => { const r = editSvg.getBoundingClientRect(), { W, H } = stageSize(); const px = e.clientX - r.left, py = e.clientY - r.top; return { x: (px - W / 2) / ed.s + ed.cx, y: ed.cy - (py - H / 2) / ed.s }; };
      const pathD = (paths) => paths.map((p) => 'M' + p.map(([x, y]) => toScreen(x, y).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join('');
      const sameSel = (a, b) => a.type === b.type && (a.type === 'loop' ? a.side === b.side : a.index === b.index);
      const isSelected = (h) => ed.selection.some((x) => sameSel(x, h));
      const letterOf = (i) => result && result.letters.find((l) => l.index === i);
      const loopOf = (side) => result && result.loops.find((l) => l.side === side);
      const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
      const normDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
      ed.fit = () => {
        if (!result) return;
        const { W, H } = stageSize();
        if (!W || !H) return;
        const b = result.bbox, w = Math.max(b.maxX - b.minX, 1), h = Math.max(b.maxY - b.minY, 1);
        ed.s = Math.min((0.78 * W) / w, (0.5 * H) / h);
        ed.cx = (b.minX + b.maxX) / 2; ed.cy = (b.minY + b.maxY) / 2;
      };
      function selectionBox() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const sel of ed.selection) {
          let b = null;
          if (sel.type === 'letter') { const l = letterOf(sel.index); if (l) b = l.bbox; }
          else if (sel.type === 'dot') { const l = letterOf(sel.index); if (l && l.dotPaths.length) { b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }; for (const p of l.dotPaths) for (const [x, y] of p) { b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x); b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y); } } }
          else { const lp = loopOf(sel.side); if (lp) { const r = lp.outer / 2; b = { minX: lp.cx - r, maxX: lp.cx + r, minY: lp.cy - r, maxY: lp.cy + r }; } }
          if (!b) continue;
          minX = Math.min(minX, b.minX); minY = Math.min(minY, b.minY); maxX = Math.max(maxX, b.maxX); maxY = Math.max(maxY, b.maxY);
        }
        return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
      }
      ed.render = () => {
        if (view !== 'letters') return;
        if (!result) { editSvg.innerHTML = ''; editDims.textContent = ''; return; }
        const { W, H } = stageSize();
        editSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        const st = FLAT_STOPS[settings.metal] || FLAT_STOPS.white;
        let s = `<defs><linearGradient id="nnEditFill" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${st[0]}"/><stop offset="0.55" stop-color="${st[1]}"/><stop offset="1" stop-color="${st[2]}"/></linearGradient></defs>`;
        for (const g of result.groups) s += `<path class="ed-fill" fill-rule="evenodd" d="${pathD([F(g.outer), ...g.holes.map(F)])}"/>`;
        // the plate's box with its size, and a 5 mm ruler along the bottom
        const b = result.bbox, [x0, y0] = toScreen(b.minX, b.maxY), [x1, y1] = toScreen(b.maxX, b.minY);
        s += `<rect class="ed-box" x="${(x0 - 4).toFixed(1)}" y="${(y0 - 4).toFixed(1)}" width="${(x1 - x0 + 8).toFixed(1)}" height="${(y1 - y0 + 8).toFixed(1)}"/>`;
        let ticks = '';
        for (let mm = 0; mm <= result.width + 1e-6; mm++) { const major = mm % 5 === 0; if (major || ed.s >= 4) ticks += `M${(x0 + mm * ed.s).toFixed(1)} ${(y1 + 10).toFixed(1)}v${major ? 7 : 4}`; }
        s += `<path class="ed-dim" d="${ticks}M${x0.toFixed(1)} ${(y1 + 10).toFixed(1)}H${x1.toFixed(1)}"/>`;
        for (const t of result.thin) s += `<path class="ed-thin" fill-rule="evenodd" d="${pathD(t)}"/>`;
        for (const lz of result.loose) { const g = result.groups[lz.group]; if (g) s += `<path class="ed-loose" fill-rule="evenodd" d="${pathD([F(g.outer), ...g.holes.map(F)])}"/>`; }
        if (ed.hover && !isSelected(ed.hover)) {
          if (ed.hover.type === 'letter') { const l = letterOf(ed.hover.index); if (l) s += `<path class="ed-hover" fill-rule="evenodd" d="${pathD(l.body)}"/>`; }
          else if (ed.hover.type === 'dot') { const l = letterOf(ed.hover.index); if (l) s += `<path class="ed-hover" fill-rule="evenodd" d="${pathD(l.dotPaths)}"/>`; }
          else { const lp = loopOf(ed.hover.side); if (lp) s += `<path class="ed-hover" fill-rule="evenodd" d="${pathD([lp.outerPath, lp.holePath])}"/>`; }
        }
        for (const sel of ed.selection) {
          if (sel.type === 'letter') {
            const l = letterOf(sel.index); if (!l) continue;
            const [a0, b0] = toScreen(l.bbox.minX, l.bbox.maxY), [a1, b1] = toScreen(l.bbox.maxX, l.bbox.minY);
            s += `<path class="ed-sel" fill-rule="evenodd" d="${pathD(l.body)}"/><rect class="ed-selbox" x="${(a0 - 3).toFixed(1)}" y="${(b0 - 3).toFixed(1)}" width="${(a1 - a0 + 6).toFixed(1)}" height="${(b1 - b0 + 6).toFixed(1)}"/>`;
          } else if (sel.type === 'dot') { const l = letterOf(sel.index); if (l && l.dotPaths.length) s += `<path class="ed-sel" fill-rule="evenodd" d="${pathD(l.dotPaths)}"/>`; }
          else { const lp = loopOf(sel.side); if (lp) s += `<path class="ed-sel" fill-rule="evenodd" d="${pathD([lp.outerPath, lp.holePath])}"/>`; }
        }
        if (ed.selection.length && ed.tool !== 'move') { const sb = selectionBox(); if (sb) { const [px, py] = toScreen((sb.minX + sb.maxX) / 2, (sb.minY + sb.maxY) / 2); s += `<circle class="ed-pivot" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3"/>`; } }
        editSvg.innerHTML = s;
        editDims.textContent = `${result.width.toFixed(2)} × ${result.height.toFixed(2)} mm · ${design.thickness.toFixed(1)} mm thick${final ? '' : ' · updating'}`;
        renderLetterPanel();
      };
      ed.onBuild = () => {
        ed.selection = ed.selection.filter((sel) => (sel.type === 'loop' ? !!loopOf(sel.side) : sel.type === 'dot' ? !!(letterOf(sel.index) && letterOf(sel.index).dotPaths.length) : !!letterOf(sel.index)));
        viewer3d.update();
        if (view === 'letters') { if (!ed.drag) { const b = result.bbox, [x0, y0] = toScreen(b.minX, b.maxY), [x1, y1] = toScreen(b.maxX, b.minY), { W, H } = stageSize(); if (x0 < 10 || y0 < 60 || x1 > W - 10 || y1 > H - 60 || x1 - x0 < W * 0.3) ed.fit(); } ed.render(); }
      };
      editor = ed;
      if (window.ResizeObserver) new ResizeObserver(() => { if (view === 'letters') { ed.fit(); ed.render(); } }).observe(stage);

      // --- editing: the adjustment record of a selected item (a letter, its dot, or a loop)
      function adjOf(sel) {
        if (sel.type === 'loop') return design.loops[sel.side];
        const L = design.letters;
        while (L.length <= sel.index) L.push(null);
        if (!L[sel.index]) L[sel.index] = N.defaultLetter();
        if (sel.type === 'dot') return L[sel.index].dot || (L[sel.index].dot = { dx: 0, dy: 0 });
        return L[sel.index];
      }
      // Apply a tool to every selected item from a snapshot, so drags don't drift.
      function applyTool(base, tool, amount) {
        design = clone(base);
        for (const sel of ed.selection) {
          const a = adjOf(sel);
          if (tool === 'move') {
            // On a curved name a letter's own moves happen before the bend: turn the screen move into its slant.
            const l = sel.type === 'loop' ? null : letterOf(sel.index), ang = l ? l.angle || 0 : 0;
            const mx = amount.dx * Math.cos(ang) + amount.dy * Math.sin(ang), my = -amount.dx * Math.sin(ang) + amount.dy * Math.cos(ang);
            a.dx = round((a.dx || 0) + mx, 3); a.dy = round((a.dy || 0) + my, 3);
          } else if (sel.type === 'letter' && tool === 'rotate') a.rot = round(normDeg((a.rot || 0) + amount), 2);
          else if (sel.type === 'letter' && tool === 'scale') a.scale = round(clamp((a.scale || 1) * amount, N.SCALE_RANGE[0], N.SCALE_RANGE[1]), 4);
        }
      }
      editSvg.addEventListener('pointerdown', (e) => {
        if (!result || e.button > 0) return;
        e.preventDefault();
        editSvg.focus({ preventScroll: true });
        const p = toWorld(e), hit = N.hitTest(result, p.x, p.y);
        if (!hit) { if (!e.shiftKey) { ed.selection = []; ed.render(); } return; }
        if (e.shiftKey) {
          if (isSelected(hit)) { ed.selection = ed.selection.filter((x) => !sameSel(x, hit)); ed.render(); return; }
          ed.selection.push(hit);
        } else if (!isSelected(hit)) ed.selection = [hit];
        const b = selectionBox();
        ed.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: p, base: clone(design), moved: false, c: b ? { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 } : p };
        editSvg.setPointerCapture(e.pointerId);
        editSvg.classList.add('dragging');
        ed.render();
      });
      editSvg.addEventListener('pointermove', (e) => {
        if (!result) return;
        const p = toWorld(e);
        if (!ed.drag) {
          const h = N.hitTest(result, p.x, p.y);
          editSvg.classList.toggle('over', !!h);
          if ((h && (!ed.hover || !sameSel(h, ed.hover))) || (!h && ed.hover)) { ed.hover = h; ed.render(); }
          return;
        }
        if (!ed.drag.moved && Math.hypot(e.clientX - ed.drag.x0, e.clientY - ed.drag.y0) < 3) return;
        if (!ed.drag.moved) { pushUndo(); ed.drag.moved = true; }
        if (ed.tool !== 'move' && !ed.selection.some((x) => x.type === 'letter')) { say('Dots and loops only move. Choose Move.'); return; }
        if (ed.tool === 'move') applyTool(ed.drag.base, 'move', { dx: p.x - ed.drag.p0.x, dy: p.y - ed.drag.p0.y });
        else if (ed.tool === 'rotate') { const a0 = Math.atan2(ed.drag.p0.y - ed.drag.c.y, ed.drag.p0.x - ed.drag.c.x), a1 = Math.atan2(p.y - ed.drag.c.y, p.x - ed.drag.c.x); applyTool(ed.drag.base, 'rotate', normDeg(((a1 - a0) * 180) / Math.PI)); }
        else { const d0 = Math.hypot(ed.drag.p0.x - ed.drag.c.x, ed.drag.p0.y - ed.drag.c.y) || 1, d1 = Math.hypot(p.x - ed.drag.c.x, p.y - ed.drag.c.y); applyTool(ed.drag.base, 'scale', d1 / d0); }
        schedule();
      });
      const endDrag = () => { if (!ed.drag) return; ed.drag = null; editSvg.classList.remove('dragging'); ed.render(); };
      editSvg.addEventListener('pointerup', endDrag);
      editSvg.addEventListener('pointercancel', endDrag);
      editSvg.addEventListener('pointerleave', () => { if (!ed.drag && ed.hover) { ed.hover = null; editSvg.classList.remove('over'); ed.render(); } });
      function setTool(t) { ed.tool = t; toolRail.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === t))); ed.render(); }
      toolRail.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));
      editSvg.addEventListener('keydown', (e) => {
        if (!result) return;
        const k = e.key.toLowerCase();
        if (k === 'm' || k === 'r' || k === 's') { setTool({ m: 'move', r: 'rotate', s: 'scale' }[k]); e.preventDefault(); return; }
        if (k === 'escape') { ed.selection = []; ed.render(); return; }
        if (!ed.selection.length) return;
        const step = e.shiftKey ? 0.5 : 0.1;
        const d = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, step], arrowdown: [0, -step] }[k];
        if (!d) return;
        e.preventDefault(); pushUndo('nudge');
        applyTool(design, 'move', { dx: d[0], dy: d[1] });
        schedule();
      });

      // --- the Style section's letter panel: the numbers behind the selected letter
      const panel = document.createElement('fieldset');
      panel.className = 'nn__group nn__letters'; panel.id = 'letterPanel';
      panel.innerHTML = `<legend class="nn__label">Letters <small>staff · select on the stage's Letters view</small></legend>
        <p class="nn__note" id="letterSel">Nothing selected. Switch the stage to Letters and click a letter.</p>
        <div class="nn__pair nn__pair--4" id="letterNums" hidden>
          <label for="ltDx">Across</label><input type="number" id="ltDx" class="nn__num" step="0.1" min="-50" max="50"><span class="nn__unit">mm</span>
          <label for="ltDy">Up</label><input type="number" id="ltDy" class="nn__num" step="0.1" min="-50" max="50"><span class="nn__unit">mm</span>
          <label for="ltRot">Turn</label><input type="number" id="ltRot" class="nn__num" step="1" min="-180" max="180"><span class="nn__unit">°</span>
          <label for="ltScale">Scale</label><input type="number" id="ltScale" class="nn__num" step="0.01" min="${N.SCALE_RANGE[0]}" max="${N.SCALE_RANGE[1]}"><span class="nn__unit">×</span>
        </div>
        <div class="nn__row">
          <button type="button" class="nn__mini" id="ltReset" hidden>Reset this letter</button>
          <button type="button" class="nn__mini" id="ltResetAll">Reset all letters</button>
        </div>`;
      const thickGroup = $('thickSeg').closest('fieldset');
      thickGroup.parentNode.insertBefore(panel, thickGroup.nextSibling);
      const ltSel = panel.querySelector('#letterSel'), ltNums = panel.querySelector('#letterNums'), ltReset = panel.querySelector('#ltReset');
      const chars = () => Array.from(design.text);
      function renderLetterPanel() {
        const one = ed.selection.length === 1 && ed.selection[0].type === 'letter' ? ed.selection[0] : null;
        ltNums.hidden = !one; ltReset.hidden = !one;
        if (!one) { ltSel.textContent = ed.selection.length ? `${ed.selection.length} items selected: drag them together, or arrows nudge.` : 'Nothing selected. Switch the stage to Letters and click a letter.'; return; }
        const a = (design.letters[one.index]) || {};
        ltSel.textContent = `Letter ${one.index + 1}: “${chars()[one.index] || ''}”`;
        const setIf = (id, v) => { const el = panel.querySelector('#' + id); if (document.activeElement !== el) el.value = v; };
        setIf('ltDx', round(a.dx || 0, 2)); setIf('ltDy', round(a.dy || 0, 2)); setIf('ltRot', round(a.rot || 0, 1)); setIf('ltScale', round(a.scale == null ? 1 : a.scale, 3));
      }
      const numInput = (id, key, lo, hi) => panel.querySelector('#' + id).addEventListener('input', () => {
        const one = ed.selection.length === 1 && ed.selection[0].type === 'letter' ? ed.selection[0] : null;
        const v = parseFloat(panel.querySelector('#' + id).value);
        if (!one || !Number.isFinite(v) || v < lo || v > hi) return;
        pushUndo('lt' + key); adjOf(one)[key] = key === 'scale' ? round(v, 4) : round(v, 3); schedule();
      });
      numInput('ltDx', 'dx', -50, 50); numInput('ltDy', 'dy', -50, 50); numInput('ltRot', 'rot', -180, 180); numInput('ltScale', 'scale', N.SCALE_RANGE[0], N.SCALE_RANGE[1]);
      ltReset.addEventListener('click', () => { const one = ed.selection[0]; if (!one || one.type !== 'letter') return; pushUndo(); design.letters[one.index] = null; schedule(); });
      panel.querySelector('#ltResetAll').addEventListener('click', () => { if (!design.letters.some(Boolean)) return; pushUndo(); design.letters = []; schedule(); });
      $('heightIn').step = '0.1'; $('curveIn').step = '1'; $('curveRange').step = '1';
      $('paneAdvanced').open = true;

      // --- the cost figures in Review (the quote carries them for this token)
      const fig = document.createElement('div');
      fig.className = 'nn__staff'; fig.id = 'staffFigures'; fig.hidden = true;
      $('summary').parentNode.insertBefore(fig, $('summary').nextSibling);
      renderStaffFigures = () => {
        const st = price && price.staff;
        if (!st) { fig.hidden = true; return; }
        const row = (name, p) => p ? `<tr><td>${esc(name)}</td><td>${p.weightGrams.toFixed(2)} g</td><td>${money2(p.perGram)}/g</td><td>${money2(p.costExGst)}</td><td>×${p.multiplier.toFixed(2)}</td><td>${money2(p.priceIncGst)}</td></tr>` : '';
        const paid = STAFF.meta && typeof STAFF.meta.price === 'number' ? STAFF.meta.price : null;
        const diff = paid == null || !price ? '' : price.price === paid ? 'Same price as paid.' : `${price.price > paid ? 'Up' : 'Down'} ${money(Math.abs(price.price - paid))} on the ${money(paid)} paid.`;
        fig.innerHTML = `<div class="nn__label">Staff · cost and markup</div>
          <table class="nn__staff-t"><thead><tr><th></th><th>Weight</th><th>Metal</th><th>Cost ex GST</th><th>Markup</th><th>Price inc</th></tr></thead>
          <tbody>${row('Nameplate', st.plate)}${row('Chain', st.chain)}</tbody></table>
          <p class="nn__note">${diff ? esc(diff) + ' ' : ''}Metal prices ${st.metalPriceAt ? 'of ' + esc(new Date(st.metalPriceAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })) : ''}. Not shown to customers.</p>`;
        fig.hidden = false;
      };

      // --- hand the design back to the dashboard
      saveToOrder = async () => {
        if (adding) return;
        adding = true; say('Checking the design…'); renderSaveState();
        await whenFinal();
        const b = blocker();
        if (b) { adding = false; renderSaveState(); showBlocker(b); return; }
        await whenPriced();
        if (!price) { adding = false; renderSaveState(); say('The price has not come back yet. Try again in a moment.', true); return; }
        let picture = '';
        try { picture = preview.snapshot(1000); } catch (e) { picture = ''; }
        const msg = { type: 'nn-revision', build: STAFF.build, design: JSON.parse(N.designJSON(design)), alloy: alloy.key, chain: chainPayload(), note: orderNote.value.trim().slice(0, 300), preview: picture && picture.length < 800000 ? picture : '', price: price.price };
        const opener = window.opener;
        adding = false; renderSaveState();
        if (!opener) { say("Open this page from the dashboard's order to save back to it.", true); return; }
        let sent = 0;
        for (const o of ORDER_ORIGINS) { try { opener.postMessage(msg, o); sent++; } catch (e) { /* not that origin */ } }
        say(sent ? 'Sent to the dashboard: it is repricing and writing the new STL. You can close this tab.' : 'Could not reach the dashboard window.', !sent);
      };
    }

    /* ---------- boot ---------- */
    function boot() {
      app.setAttribute('aria-busy', 'false');
      $('loading').hidden = true;
      if (!STAFF) restoreDraft();
      standardLoops();
      setAlloy(alloy.key);
      chainPicker.set(chain.alloy.key, true);
      renderChainTiles();
      renderChainGauges();
      renderChainLengths();
      syncControls();
      openBlock(STAFF ? 2 : 1, { scroll: false });
      schedule();
      renderSaveState();
      queueLift();
      threeReady.then(attachPreview); // with or without three.js: without it the close-up stays a flat drawing
    }
    if (STAFF) loadOrder().then(boot, boot); else boot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
