/* Burrows Ring Builder — sections/ring-builder.liquid
   Step 1 setting → Step 2 metal & size → Step 3 diamond (Builder API / Nivoda) → Step 4 review.
   No dependencies. State lives in `state` and is mirrored to the URL so a design can be shared. */
(function () {
  'use strict';
  var root = document.querySelector('[data-ring-builder]');
  if (!root) return;
  var app = root.querySelector('[data-rb-app]');
  var stepsEl = root.querySelector('[data-rb-steps]');
  var cfg;
  try { cfg = JSON.parse(root.querySelector('[data-rb-config]').textContent); } catch (e) { return; }

  var SHAPES = ['Round', 'Oval', 'Emerald', 'Pear', 'Princess', 'Cushion'];
  var COLOURS = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
  var CLARITY = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1'];
  var CT_STEPS = [0.3, 0.4, 0.5, 0.7, 0.9, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5];

  var mounts = [];
  var apiCart = null; // true once /api/health reports the cart endpoint is switched on
  var depositPct = 0; // >0 when the API takes a deposit rather than the full price
  var state = { step: 1, style: 'all', mount: null, shape: 'Round', metal: null, size: '', type: cfg.defaultType || 'lab', stone: null,
    filters: { minct: 0.3, maxct: 5, colours: [], clarities: [], certified: !!cfg.certifiedOnly, sort: 'price' } };
  var stoneCache = {};

  /* ---------- helpers ---------- */
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-AU'); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var cap = function (s) { s = String(s || '').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
  var GRADES = { ID: 'Ideal', EIGHTX: 'Ideal', EX: 'Excellent', VG: 'Very good', GD: 'Good', G: 'Good', F: 'Fair', FR: 'Fair', P: 'Poor', PR: 'Poor' };
  var grade = function (v) { if (!v) return ''; var k = String(v).toUpperCase(); return GRADES[k] || cap(v); };
  /* Line drawings of each centre shape — the card image until Nivoda supplies a photo, and the fallback after. */
  var SHAPE_ART = {
    Round: '<circle cx="50" cy="50" r="40"/><path d="M50 10 78 22 90 50 78 78 50 90 22 78 10 50 22 22Z"/><path d="M50 10v80M10 50h80M22 22l56 56M78 22 22 78"/><circle cx="50" cy="50" r="16"/>',
    Oval: '<ellipse cx="50" cy="50" rx="30" ry="42"/><ellipse cx="50" cy="50" rx="14" ry="22"/><path d="M50 8v84M20 50h60M28 22l44 56M72 22 28 78"/>',
    Emerald: '<path d="M30 10h40l14 14v52L70 90H30L16 76V24Z"/><path d="M36 20h28l10 10v40L64 80H36L26 70V30Z"/><path d="M42 32h16l6 6v24l-6 6H42l-6-6V38Z"/><path d="M16 24 26 30M84 24 74 30M16 76l10-6M84 76 74 70"/>',
    Pear: '<path d="M50 6C30 32 14 46 14 62a36 36 0 0 0 72 0C86 46 70 32 50 6Z"/><path d="M50 30c-10 14-20 22-20 32a20 20 0 0 0 40 0c0-10-10-18-20-32Z"/><path d="M50 6v92M14 62h72"/>',
    Princess: '<path d="M12 12h76v76H12Z"/><path d="M50 12 88 50 50 88 12 50Z"/><path d="M30 30h40v40H30Z"/><path d="M12 12l76 76M88 12 12 88"/>',
    Cushion: '<path d="M32 10h36c14 0 22 8 22 22v36c0 14-8 22-22 22H32c-14 0-22-8-22-22V32c0-14 8-22 22-22Z"/><path d="M38 26h24c8 0 12 4 12 12v24c0 8-4 12-12 12H38c-8 0-12-4-12-12V38c0-8 4-12 12-12Z"/><path d="M50 10v80M10 50h80M18 18l64 64M82 18 18 82"/>'
  };
  function shapeArt(shape) {
    var d = SHAPE_ART[cap(shape)] || SHAPE_ART.Round;
    return '<svg class="rb__shape" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">' + d + '</svg>';
  }
  function chip(label, on, cls, onClick) {
    var b = el('button', 'rb__chip' + (on ? ' on' : '') + (cls ? ' ' + cls : ''), esc(label));
    b.type = 'button'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }
  function toast(msg) {
    var t = el('div', 'rb__toast', esc(msg)); document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  function scrollTop() { root.scrollIntoView({ block: 'start', behavior: 'smooth' }); }

  function absUrl(u) { u = u || ''; if (u.indexOf('//') === 0) return 'https:' + u; if (u.indexOf('/') === 0) return location.origin + u; return u; }
  function renderFor(m, metal, shape) {
    var r = m.renders || {};
    var byMetal = r[metal] || {};
    if (typeof byMetal === 'string') return byMetal;
    return byMetal[shape] || byMetal['default'] || r[metal + '|' + shape] || r[metal] || r['default'] || (function () {
      for (var k in r) { var v = r[k]; if (typeof v === 'string') return v; for (var s in v) return v[s]; }
      return '';
    })();
  }
  function metalOf(m, name) { return (m.metals || []).filter(function (x) { return x.name === name; })[0] || (m.metals || [])[0]; }
  function fromPrice(m) { return Math.min.apply(null, (m.metals || []).map(function (x) { return +x.price || 0; }).filter(Boolean)); }

  /* ---------- URL state ---------- */
  function readUrl() {
    var p = new URLSearchParams(location.search);
    if (p.get('mount')) { var m = mounts.filter(function (x) { return x.id === p.get('mount'); })[0]; if (m) { state.mount = m; state.step = 2; } }
    if (p.get('shape')) state.shape = cap(p.get('shape'));
    if (p.get('metal')) state.metal = p.get('metal');
    if (p.get('size')) state.size = p.get('size');
    if (p.get('type') === 'nat' && cfg.showNatural) state.type = 'nat';
    if (p.get('stone') && state.mount) { state.pendingStone = p.get('stone'); state.step = 3; }
    if (p.get('step')) state.step = Math.min(+p.get('step') || state.step, state.mount ? 4 : 1);
  }
  function writeUrl() {
    if (!window.history || !history.replaceState) return;
    var u = new URL(location.href); var q = u.searchParams;
    ['mount', 'shape', 'metal', 'size', 'type', 'stone', 'step'].forEach(function (k) { q.delete(k); });
    if (state.mount) { q.set('mount', state.mount.id); q.set('shape', state.shape); if (state.metal) q.set('metal', state.metal); if (state.size) q.set('size', state.size); }
    if (state.type !== 'lab') q.set('type', state.type);
    if (state.stone) q.set('stone', state.stone.cert || state.stone.id);
    if (state.step > 1) q.set('step', state.step);
    history.replaceState({}, '', u.toString());
  }

  /* ---------- steps bar ---------- */
  function setStep(n) {
    state.step = n;
    Array.prototype.forEach.call(stepsEl.children, function (li) {
      var i = +li.getAttribute('data-step');
      li.className = i === n ? 'on' : (i < n ? 'done' : '');
      li.onclick = i < n ? function () { go(i); } : null;
    });
    writeUrl();
  }
  function go(n) {
    if (n === 1) screenGrid();
    else if (n === 2) screenDetail();
    else if (n === 3) screenStones();
    else screenReview();
  }

  /* ---------- step 1: settings ---------- */
  function screenGrid() {
    setStep(1); app.innerHTML = '';
    var styles = ['all'].concat(mounts.map(function (m) { return m.style; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }));
    if (styles.length > 2) {
      var f = el('div', 'rb__filters');
      styles.forEach(function (st) { f.appendChild(chip(st === 'all' ? 'All designs' : cap(st), state.style === st, 'rb__chip--sm', function () { state.style = st; screenGrid(); })); });
      app.appendChild(f);
    }
    if (mounts.length && mounts[0].sample && cfg.sampleNote) { var sn = el('div', 'rb__note--sample', esc(cfg.sampleNote)); sn.style.display = 'block'; sn.style.textAlign = 'center'; app.appendChild(sn); }
    var g = el('div', 'rb__grid');
    var list = mounts.filter(function (m) { return state.style === 'all' || m.style === state.style; });
    if (!list.length) { app.appendChild(el('div', 'rb__empty', 'No designs in this style yet.')); return; }
    list.forEach(function (m) {
      var metal = m.metals[0] ? m.metals[0].name : '';
      var card = el('button', 'rb__card'); card.type = 'button';
      var img = el('img'); img.src = renderFor(m, metal, m.shapes && m.shapes.indexOf('Round') > -1 ? 'Round' : (m.shapes || [])[0]); img.alt = m.title; img.loading = 'lazy'; card.appendChild(img);
      var body = el('div', 'rb__cardbody');
      body.appendChild(el('div', 'rb__cardtitle', esc(m.title)));
      body.appendChild(el('div', 'rb__cardmeta', esc((m.shapes || []).length ? 'For ' + m.shapes.join(', ').toLowerCase() + ' centres' : '')));
      var fp = fromPrice(m); if (fp) body.appendChild(el('div', 'rb__cardprice', 'Setting from ' + money(fp) + ' <small>· ' + esc(m.metals.map(function (x) { return x.name; }).join(', ')) + '</small>'));
      card.appendChild(body);
      card.addEventListener('click', function () {
        state.mount = m; state.shape = (m.shapes || SHAPES).indexOf(state.shape) > -1 ? state.shape : (m.shapes || SHAPES)[0];
        state.metal = metalOf(m, state.metal).name; state.stone = null; screenDetail(); scrollTop();
      });
      g.appendChild(card);
    });
    app.appendChild(g);
  }

  /* ---------- step 2: metal & size ---------- */
  function screenDetail() {
    var m = state.mount; if (!m) return screenGrid();
    setStep(2); app.innerHTML = '';
    if (!state.metal) state.metal = m.metals[0].name;
    var back = el('button', 'rb__back', '&larr; All designs'); back.type = 'button'; back.addEventListener('click', function () { screenGrid(); }); app.appendChild(back);
    var d = el('div', 'rb__detail');
    var stage = el('div', 'rb__stage'); var img = el('img'); img.alt = m.title; stage.appendChild(img); d.appendChild(stage);
    var panel = el('div', 'rb__panel');
    panel.appendChild(el('h2', null, esc(m.title)));
    var price = el('div', 'rb__price'); panel.appendChild(price);
    var shapes = m.shapes && m.shapes.length ? m.shapes : SHAPES;
    var shapeOpt = el('div', 'rb__opt'); var shapeLabel = el('div', 'rb__label'); shapeOpt.appendChild(shapeLabel); var shapeChips = el('div', 'rb__chips'); shapeOpt.appendChild(shapeChips); panel.appendChild(shapeOpt);
    var metalOpt = el('div', 'rb__opt'); var metalLabel = el('div', 'rb__label'); metalOpt.appendChild(metalLabel); var metalChips = el('div', 'rb__chips'); metalOpt.appendChild(metalChips); panel.appendChild(metalOpt);
    var sizeOpt = el('div', 'rb__opt'); sizeOpt.appendChild(el('div', 'rb__label', 'Finger size'));
    var sizeRow = el('div', 'rb__sizerow'); var sel = el('select', 'rb__select'); sel.setAttribute('aria-label', 'Finger size');
    sel.appendChild(new Option('Choose later', '')); (cfg.sizes || []).forEach(function (s) { s = s.trim(); if (s) sel.appendChild(new Option(s, s)); }); sel.value = state.size || '';
    sel.addEventListener('change', function () { state.size = sel.value; writeUrl(); });
    sizeRow.appendChild(sel);
    if (cfg.sizeGuideUrl) { var sg = el('a', 'rb__link', 'Not sure? Ring size guide'); sg.href = cfg.sizeGuideUrl; sg.target = '_blank'; sg.rel = 'noopener'; sizeRow.appendChild(sg); }
    else sizeRow.appendChild(el('span', 'rb__note', 'Not sure of the size? Choose later — we size it with you.'));
    sizeOpt.appendChild(sizeRow); panel.appendChild(sizeOpt);
    panel.appendChild(el('div', 'rb__lead', esc(m.lead_time || cfg.leadTime)));
    var cta = el('button', 'btn btn--gold btn--lg', 'Choose a diamond &rarr;'); cta.type = 'button'; cta.addEventListener('click', function () { screenStones(); scrollTop(); }); panel.appendChild(cta);
    d.appendChild(panel); app.appendChild(d);

    function sync() {
      var mt = metalOf(m, state.metal); state.metal = mt.name;
      img.src = renderFor(m, mt.name, state.shape);
      price.innerHTML = money(mt.price) + '<small>setting · AUD incl. GST</small>';
      shapeLabel.innerHTML = 'Centre shape &mdash; <b>' + esc(state.shape) + '</b>';
      shapeChips.innerHTML = ''; SHAPES.forEach(function (sh) { var has = shapes.indexOf(sh) > -1; shapeChips.appendChild(chip(sh, sh === state.shape, has ? '' : 'dis', has ? function () { state.shape = sh; state.stone = null; sync(); } : null)); });
      metalLabel.innerHTML = 'Metal &mdash; <b>' + esc(mt.name) + '</b>';
      metalChips.innerHTML = ''; m.metals.forEach(function (x) { metalChips.appendChild(chip(x.name, x.name === mt.name, '', function () { state.metal = x.name; sync(); })); });
      writeUrl();
    }
    sync();
  }

  /* ---------- step 3: diamonds ---------- */
  var PAGE = 48; // Nivoda allows at most 50 per query
  function fetchStones(shape, type, offset) {
    var key = shape + '|' + type + '|' + (state.filters.certified ? 'c' : 'a') + '|' + offset;
    if (stoneCache[key]) return Promise.resolve(stoneCache[key]);
    var f = state.filters, m = state.mount;
    var q = 'shape=' + encodeURIComponent(shape.toUpperCase()) + '&type=' + type
      + '&minct=' + (m ? m.centre_min_ct : 0.3) + '&maxct=' + (m ? m.centre_max_ct : 5) + '&limit=' + PAGE + '&offset=' + offset + (f.certified ? '&cert=1' : '');
    return fetch(cfg.apiBase.replace(/\/$/, '') + '/diamonds?' + q).then(function (r) { if (!r.ok) throw new Error('feed'); return r.json(); })
      .then(function (j) {
        var stones = (j.stones || []).map(function (s) { s.shape = cap(s.shape || shape); return s; });
        // v1 API ignores offset/limit and returns ~10 stones; v2 reports total/offset so we know if there are more.
        var paged = typeof j.total === 'number' && typeof j.offset === 'number';
        // A full page means there may be more, whatever the reported total says (Nivoda's count can equal the page size).
        var out = { stones: stones, total: paged ? Math.max(j.total, j.offset + stones.length) : stones.length, hasMore: paged ? stones.length >= PAGE : false };
        stoneCache[key] = out; return out;
      });
  }
  function applyFilters(list) {
    var f = state.filters, m = state.mount;
    var out = list.filter(function (s) {
      if (f.certified && (!s.lab || s.lab === 'NONE')) return false;
      if (+s.ct < f.minct - 0.005 || +s.ct > f.maxct + 0.005) return false;
      if (m && (+s.ct < +m.centre_min_ct - 0.005 || +s.ct > +m.centre_max_ct + 0.005)) return false;
      if (f.colours.length && f.colours.indexOf(s.col) < 0) return false;
      if (f.clarities.length && f.clarities.indexOf(s.cl) < 0) return false;
      return true;
    });
    out.sort(f.sort === 'ct' ? function (a, b) { return a.ct - b.ct || a.retail - b.retail; } : f.sort === 'ct-desc' ? function (a, b) { return b.ct - a.ct || a.retail - b.retail; } : function (a, b) { return a.retail - b.retail; });
    return out;
  }
  function certLink(s) {
    if (!s.cert) return '';
    if (s.lab === 'GIA') return 'https://www.gia.edu/report-check?reportno=' + encodeURIComponent(s.cert);
    if (s.lab === 'IGI') return 'https://www.igi.org/verify.php?r=' + encodeURIComponent(s.cert);
    return '';
  }
  function stoneTitle(s) { return (+s.ct).toFixed(2) + 'ct ' + s.shape + ' · ' + s.col + ' ' + s.cl + (s.cut ? ' · ' + grade(s.cut) + ' cut' : ''); }

  function screenStones() {
    if (!state.mount) return screenGrid();
    setStep(3); app.innerHTML = '';
    var back = el('button', 'rb__back', '&larr; Back to the setting'); back.type = 'button'; back.addEventListener('click', function () { screenDetail(); }); app.appendChild(back);
    if (cfg.showNatural) {
      var tabs = el('div', 'rb__tabs');
      [['lab', 'Lab-grown'], ['nat', 'Natural']].forEach(function (t) { tabs.appendChild(chip(t[1] + ' diamonds', state.type === t[0], '', function () { state.type = t[0]; state.stone = null; screenStones(); })); });
      app.appendChild(tabs);
    }
    var f = state.filters;
    var tb = el('div', 'rb__toolbar');
    var left = el('div', 'rb__toolbar-row');
    // carat range
    var ctOpt = el('div', 'rb__opt'); ctOpt.appendChild(el('div', 'rb__label', 'Carat'));
    var rng = el('div', 'rb__range'); var minS = el('select', 'rb__select'), maxS = el('select', 'rb__select'); minS.setAttribute('aria-label', 'Minimum carat'); maxS.setAttribute('aria-label', 'Maximum carat');
    var lo = +state.mount.centre_min_ct || 0.3, hi = +state.mount.centre_max_ct || 5;
    CT_STEPS.filter(function (c) { return c >= lo && c <= hi; }).forEach(function (c) { minS.appendChild(new Option(c.toFixed(2) + ' ct', c)); maxS.appendChild(new Option(c.toFixed(2) + ' ct', c)); });
    minS.value = String(Math.max(lo, f.minct)); maxS.value = String(Math.min(hi, f.maxct)); if (!minS.value) minS.selectedIndex = 0; if (!maxS.value) maxS.selectedIndex = maxS.options.length - 1;
    minS.addEventListener('change', function () { f.minct = +minS.value; if (f.maxct < f.minct) { f.maxct = f.minct; maxS.value = minS.value; } draw(); });
    maxS.addEventListener('change', function () { f.maxct = +maxS.value; if (f.minct > f.maxct) { f.minct = f.maxct; minS.value = maxS.value; } draw(); });
    rng.appendChild(minS); rng.appendChild(el('span', 'rb__note', 'to')); rng.appendChild(maxS); ctOpt.appendChild(rng); left.appendChild(ctOpt);
    // colour
    var colOpt = el('div', 'rb__opt'); colOpt.appendChild(el('div', 'rb__label', 'Colour')); var colChips = el('div', 'rb__chips'); colOpt.appendChild(colChips); left.appendChild(colOpt);
    // clarity
    var clOpt = el('div', 'rb__opt'); clOpt.appendChild(el('div', 'rb__label', 'Clarity')); var clChips = el('div', 'rb__chips'); clOpt.appendChild(clChips); left.appendChild(clOpt);
    tb.appendChild(left);
    var right = el('div', 'rb__toolbar-row');
    var sortOpt = el('div', 'rb__opt'); sortOpt.appendChild(el('div', 'rb__label', 'Sort')); var sortS = el('select', 'rb__select'); sortS.setAttribute('aria-label', 'Sort');
    [['price', 'Price: low to high'], ['ct', 'Carat: small to large'], ['ct-desc', 'Carat: large to small']].forEach(function (o) { sortS.appendChild(new Option(o[1], o[0])); }); sortS.value = f.sort;
    sortS.addEventListener('change', function () { f.sort = sortS.value; draw(); }); sortOpt.appendChild(sortS); right.appendChild(sortOpt);
    var certOpt = el('div', 'rb__opt'); certOpt.appendChild(el('div', 'rb__label', 'Certificate')); var certChips = el('div', 'rb__chips'); certOpt.appendChild(certChips); right.appendChild(certOpt);
    tb.appendChild(right); app.appendChild(tb);
    var count = el('p', 'rb__count'); app.appendChild(count);
    var holder = el('div'); app.appendChild(holder);
    app.appendChild(el('p', 'rb__note', esc(cfg.feedNote)));

    function drawChips() {
      colChips.innerHTML = ''; COLOURS.forEach(function (c) { colChips.appendChild(chip(c, f.colours.indexOf(c) > -1, 'rb__chip--sm', function () { var i = f.colours.indexOf(c); i > -1 ? f.colours.splice(i, 1) : f.colours.push(c); draw(); })); });
      clChips.innerHTML = ''; CLARITY.forEach(function (c) { clChips.appendChild(chip(c, f.clarities.indexOf(c) > -1, 'rb__chip--sm', function () { var i = f.clarities.indexOf(c); i > -1 ? f.clarities.splice(i, 1) : f.clarities.push(c); draw(); })); });
      certChips.innerHTML = ''; certChips.appendChild(chip('Certified only', f.certified, 'rb__chip--sm', function () { f.certified = !f.certified; stoneCache = {}; load(); }));
    }
    var all = [], loaded = 0, total = 0, hasMore = false, more = el('div', 'rb__more');
    app.insertBefore(more, app.lastChild);
    function draw() {
      drawChips();
      var list = applyFilters(all);
      var kind = (state.type === 'lab' ? 'lab-grown' : 'natural') + ' ' + state.shape.toLowerCase();
      count.textContent = list.length ? (list.length + ' ' + kind + ' diamond' + (list.length === 1 ? '' : 's') + (total > all.length ? ' shown of ' + total.toLocaleString('en-AU') + ' available' : (hasMore ? ' shown — more available' : ' available now'))) : '';
      more.innerHTML = '';
      if (hasMore) { var mb = el('button', 'btn btn--outline-dark', 'Show more diamonds'); mb.type = 'button'; mb.addEventListener('click', function () { mb.disabled = true; mb.textContent = 'Loading…'; loadPage(loaded); }); more.appendChild(mb); }
      holder.innerHTML = '';
      if (!list.length) { holder.appendChild(el('div', 'rb__empty', all.length ? 'Nothing matches those filters — try widening the carat range or colour.' : 'No ' + (state.type === 'lab' ? 'lab-grown' : 'natural') + ' ' + state.shape.toLowerCase() + ' diamonds in the feed right now. Try the other type, or call us on ' + esc(cfg.phone) + '.')); return; }
      var g = el('div', 'rb__stones');
      list.forEach(function (s) {
        var c = el('button', 'rb__stone' + (state.stone && state.stone.cert === s.cert ? ' on' : '')); c.type = 'button';
        var media = el('div', 'rb__stone-media');
        if (s.image) { var im = el('img'); im.src = s.image; im.alt = ''; im.loading = 'lazy'; im.addEventListener('error', function () { media.innerHTML = shapeArt(s.shape); }); media.appendChild(im); } else media.innerHTML = shapeArt(s.shape);
        c.appendChild(media);
        c.appendChild(el('div', 'ct', (+s.ct).toFixed(2) + ' ct'));
        c.appendChild(el('div', 'spec', esc(s.col + ' colour · ' + s.cl + (s.cut ? ' · ' + grade(s.cut) + ' cut' : ''))));
        c.appendChild(el('div', 'price', money(s.retail)));
        if (s.lab && s.lab !== 'NONE') c.appendChild(el('div', 'cert', esc(s.lab + ' ' + (s.cert || '')))); else c.appendChild(el('div', 'tag', 'Uncertified'));
        c.addEventListener('click', function () { openStone(s); });
        g.appendChild(c);
      });
      holder.appendChild(g);
    }
    function loadPage(offset) {
      var shape = state.shape, type = state.type;
      return fetchStones(shape, type, offset).then(function (r) {
        if (shape !== state.shape || type !== state.type) return;
        var seen = {}; all.forEach(function (s) { seen[s.cert || s.id] = 1; });
        r.stones.forEach(function (s) { if (!seen[s.cert || s.id]) { all.push(s); seen[s.cert || s.id] = 1; } });
        loaded = offset + r.stones.length; total = r.total; hasMore = r.hasMore;
        draw();
      });
    }
    function load() {
      holder.innerHTML = ''; holder.appendChild(el('div', 'rb__loading', '<span class="rb__spin"></span>Finding ' + esc(state.shape.toLowerCase()) + ' diamonds…')); count.textContent = ''; more.innerHTML = '';
      all = []; loaded = 0; total = 0; hasMore = false;
      loadPage(0).then(function () {
        if (state.pendingStone) { var s = all.filter(function (x) { return x.cert === state.pendingStone; })[0]; state.pendingStone = null; if (s) { state.stone = s; screenReview(); } }
      }).catch(function () { holder.innerHTML = ''; holder.appendChild(el('div', 'rb__empty', 'The live diamond feed is taking a moment. Please try again shortly, or call us on ' + esc(cfg.phone) + '.')); });
    }
    load();
  }

  var dlg = null;
  function openStone(s) {
    if (dlg) dlg.remove();
    dlg = el('dialog', 'rb__dialog');
    var wrap = el('div', 'rb__dlg');
    var media = el('div', 'rb__dlg-media');
    var frame = el('div', 'rb__dlg-frame'); media.appendChild(frame);
    function showPhoto() {
      frame.innerHTML = '';
      if (s.image) { var im = el('img'); im.src = s.image; im.alt = (+s.ct).toFixed(2) + 'ct ' + s.shape + ' diamond'; im.addEventListener('error', function () { frame.innerHTML = shapeArt(s.shape); }); frame.appendChild(im); }
      else frame.innerHTML = shapeArt(s.shape) + '<div class="none">Photo and video come with the certificate — ask us and we\'ll send them.</div>';
    }
    function showVideo() {
      // Nivoda's viewer renders at the size in the URL (default 500/500); ask for the size of the frame so nothing overflows.
      var w = Math.max(300, Math.round(frame.clientWidth || 480));
      var src = s.video.replace(/\/video\/\d+\/\d+/, '/video/' + w + '/' + w);
      frame.innerHTML = '';
      var fr = el('iframe'); fr.src = src; fr.title = '360° video of the diamond'; fr.setAttribute('scrolling', 'no'); fr.allow = 'autoplay'; fr.loading = 'eager';
      frame.appendChild(fr);
    }
    showPhoto();
    if (s.video && s.image) {
      var tabs = el('div', 'rb__dlg-tabs');
      var tPhoto = chip('Photo', true, 'rb__chip--sm'), tVideo = chip('360° video', false, 'rb__chip--sm');
      tPhoto.addEventListener('click', function () { tPhoto.classList.add('on'); tVideo.classList.remove('on'); showPhoto(); });
      tVideo.addEventListener('click', function () { tVideo.classList.add('on'); tPhoto.classList.remove('on'); showVideo(); });
      tabs.appendChild(tPhoto); tabs.appendChild(tVideo); media.appendChild(tabs);
    } else if (s.video && !s.image) { showVideo(); }
    wrap.appendChild(media);
    var body = el('div', 'rb__dlg-body');
    body.appendChild(el('h3', null, esc((+s.ct).toFixed(2) + 'ct ' + s.shape)));
    body.appendChild(el('div', 'rb__price', money(s.retail) + '<small>AUD incl. GST</small>'));
    var specs = el('dl', 'rb__specs');
    var rows = [['Type', state.type === 'lab' ? 'Lab-grown' : 'Natural'], ['Colour', s.col], ['Clarity', s.cl], ['Cut', s.cut ? grade(s.cut) : '—']].concat(s.polish ? [['Polish', grade(s.polish)]] : []).concat(s.symmetry ? [['Symmetry', grade(s.symmetry)]] : []).concat(s.fluorescence ? [['Fluorescence', cap(s.fluorescence)]] : []).concat([ ['Certificate', s.lab && s.lab !== 'NONE' ? s.lab + ' ' + (s.cert || '') : 'Uncertified']]);
    if (s.measurements) rows.push(['Measurements', s.measurements]);
    if (s.delivery) rows.push(['Delivery to us', s.delivery]);
    rows.forEach(function (r) { specs.appendChild(el('dt', null, esc(r[0]))); specs.appendChild(el('dd', null, esc(r[1]))); });
    body.appendChild(specs);
    var cl = certLink(s); if (cl) { var a = el('a', 'rb__link', 'Check the ' + esc(s.lab) + ' report'); a.href = cl; a.target = '_blank'; a.rel = 'noopener'; body.appendChild(a); }
    var actions = el('div', 'rb__actions');
    var choose = el('button', 'btn btn--gold', 'Choose this diamond'); choose.type = 'button';
    choose.addEventListener('click', function () { state.stone = s; dlg.close(); screenReview(); scrollTop(); });
    actions.appendChild(choose); body.appendChild(actions);
    wrap.appendChild(body);
    var x = el('button', 'rb__dlg-close', '&times;'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', function () { dlg.close(); });
    dlg.appendChild(wrap); dlg.appendChild(x);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  /* ---------- step 4: review ---------- */
  function screenReview() {
    var m = state.mount, s = state.stone; if (!m) return screenGrid(); if (!s) return screenStones();
    setStep(4); app.innerHTML = '';
    var back = el('button', 'rb__back', '&larr; Back to diamonds'); back.type = 'button'; back.addEventListener('click', function () { screenStones(); }); app.appendChild(back);
    var mt = metalOf(m, state.metal); var total = (+mt.price || 0) + (+s.retail || 0);
    var r = el('div', 'rb__review');
    var left = el('div', 'rb__card rb__card--review');
    var hero = el('div', 'rb__hero'); var im = el('img'); im.src = renderFor(m, mt.name, state.shape); im.alt = m.title; hero.appendChild(im);
    hero.appendChild(el('div', null, '<h3>' + esc(m.title) + '</h3><div class="rb__note">' + esc(state.shape + ' · ' + mt.name + (state.size ? ' · size ' + state.size : ' · size to be confirmed')) + '</div>'));
    left.appendChild(hero);
    left.appendChild(el('div', 'rb__row', '<span>Setting<small>' + esc(mt.sku || m.ref || m.id) + ' · ' + esc(mt.name) + '</small></span><span>' + money(mt.price) + '</span>'));
    left.appendChild(el('div', 'rb__row', '<span>' + esc((state.type === 'lab' ? 'Lab-grown ' : 'Natural ') + stoneTitle(s)) + '<small>' + esc(s.lab && s.lab !== 'NONE' ? s.lab + ' certificate ' + s.cert : 'Uncertified') + '</small></span><span>' + money(s.retail) + '</span>'));
    left.appendChild(el('div', 'rb__total', '<span class="rb__label">Ring total · AUD incl. GST</span><b>' + money(total) + '</b>'));
    var canCart = cfg.cartEnabled && apiCart === true;
    if (canCart && depositPct > 0) {
      var dep = Math.round(total * depositPct / 100);
      left.appendChild(el('div', 'rb__row', '<span>Pay today<small>' + depositPct + '% deposit to secure the diamond and start the setting</small></span><span>' + money(dep) + '</span>'));
      left.appendChild(el('div', 'rb__row', '<span>Balance on completion<small>Before collection or dispatch</small></span><span>' + money(total - dep) + '</span>'));
    }
    left.appendChild(el('p', 'rb__note', esc(m.lead_time || cfg.leadTime) + '. The diamond is live supplier stock, so we confirm it the moment you order.'));
    r.appendChild(left);

    var right = el('div', 'rb__next');
    right.appendChild(el('h3', null, cfg.cartEnabled ? 'Ready when you are' : 'Next step'));
    right.appendChild(el('ol', null, '<li>We secure this exact diamond with the supplier.</li><li>The setting is made to order in your size and metal.</li><li>The stone is set, checked in store, and ready to collect or ship' + (canCart && depositPct > 0 ? ' once the balance is settled' : '') + '.</li>'));
    var actions = el('div', 'rb__actions');
    var q = new URLSearchParams(); q.set('sku', (mt.sku || m.ref || m.id) + ' · ' + mt.name + (state.size ? ' · ' + state.size : '')); q.set('design', (s.lab && s.lab !== 'NONE' ? s.lab + ' ' : 'Stone ') + (s.cert || ''));
    var enquiryHref = cfg.contactUrl + '?' + q.toString() + '#contact';
    if (canCart) {
      var add = el('button', 'btn btn--gold btn--lg', depositPct > 0 ? 'Pay ' + depositPct + '% deposit' : 'Add to cart'); add.type = 'button';
      add.addEventListener('click', function () { addToCart(add, m, mt, s, enquiryHref); }); actions.appendChild(add);
    } else {
      var enq = el('a', 'btn btn--gold btn--lg', 'Enquire about this ring'); enq.href = enquiryHref; actions.appendChild(enq);
    }
    if (cfg.bookingUrl) { var bk = el('a', 'btn btn--outline-dark btn--lg', esc(cfg.bookingLabel || 'Book a consultation')); bk.href = cfg.bookingUrl; bk.target = '_blank'; bk.rel = 'noopener'; actions.appendChild(bk); }
    right.appendChild(actions);
    if (canCart) { var enqLink = el('a', 'rb__link', 'Prefer to ask us about it first? Send an enquiry'); enqLink.href = enquiryHref; enqLink.style.alignSelf = 'flex-start'; right.appendChild(enqLink); }
    var copy = el('button', 'rb__link rb__copy', 'Copy a link to this design'); copy.type = 'button'; copy.style.background = 'none'; copy.style.border = '0'; copy.style.borderBottom = '1px solid var(--gold-2)'; copy.style.cursor = 'pointer'; copy.style.font = 'inherit'; copy.style.fontSize = '13px'; copy.style.padding = '0';
    copy.addEventListener('click', function () { writeUrl(); var u = location.href; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('Link copied'); }, function () { window.prompt('Copy this link', u); }); });
    right.appendChild(copy);
    right.appendChild(el('p', 'rb__note', 'Prefer to talk it through? Call ' + esc(cfg.phone) + ' — we\'re happy to help.'));
    var restart = el('button', 'rb__back', 'Start again'); restart.type = 'button'; restart.addEventListener('click', function () { state.mount = null; state.stone = null; state.size = ''; screenGrid(); scrollTop(); }); right.appendChild(restart);
    r.appendChild(right); app.appendChild(r);
  }

  /* Cart: the Builder API re-checks the stone with Nivoda, creates one hidden Shopify product for the build
     (setting + stone, priced server-side) and returns its variant id; we add that one line to the normal cart. */
  function addToCart(btn, m, mt, s, enquiryHref) {
    btn.disabled = true; btn.textContent = 'Checking the stone…';
    var build = 'RB-' + Date.now().toString(36).toUpperCase();
    var payload = { build: build, type: state.type, size: state.size || '',
      mount: { id: m.id, ref: mt.sku || m.ref || m.id, title: m.title, metal: mt.name, price: +mt.price || 0, variant_id: mt.variant_id || null, shape: state.shape, image: absUrl(renderFor(m, mt.name, state.shape)) },
      stone: { id: s.id, item_id: s.item_id, cert: s.cert, lab: s.lab, retail: s.retail } };
    var status = 0;
    fetch(cfg.apiBase.replace(/\/$/, '') + '/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { status = r.status; return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        if (status === 409 || j.error === 'stone_unavailable') { throw { kind: 'gone' }; }
        if (status === 501) { throw { kind: 'off' }; }
        if (status !== 200 || !j.variant_id) { throw { kind: 'fail', detail: j.detail }; }
        btn.textContent = 'Adding to cart…';
        var props = { 'Ring build': j.build || build, 'Setting': m.title + ' · ' + mt.name, 'Centre stone': (j.stone && j.stone.title) || stoneTitle(s), 'Finger size': state.size || 'To be confirmed', 'Lead time': m.lead_time || cfg.leadTime };
        if (j.deposit_pct > 0) { props['Ring total'] = money(j.ring_total); props['Deposit'] = j.deposit_pct + '% · ' + money(j.charge); props['Balance on completion'] = money(j.balance); }
        // Real setting variant + the diamond the API just created = two lines sharing the build number.
        // Sample designs (no variant) come back as one combined line.
        var items = [];
        if (!j.combined && j.mount_variant_id) items.push({ id: j.mount_variant_id, quantity: 1, properties: props });
        items.push({ id: j.variant_id, quantity: 1, properties: props });
        return fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items }) })
          .then(function (r) { if (!r.ok) throw { kind: 'fail' }; location.href = '/cart'; });
      })
      .catch(function (e) {
        btn.disabled = false; btn.textContent = depositPct > 0 ? 'Pay ' + depositPct + '% deposit' : 'Add to cart';
        if (e && e.kind === 'gone') { toast('That diamond has just been taken — please choose another.'); state.stone = null; setTimeout(function () { screenStones(); scrollTop(); }, 1600); return; }
        if (e && e.kind === 'off') { toast('Online ordering isn\'t switched on yet — send us an enquiry instead.'); if (enquiryHref) location.href = enquiryHref; return; }
        toast('That didn\'t go through — please try again or call us on ' + cfg.phone + '.');
      });
  }

  /* ---------- boot ---------- */
  if (cfg.cartEnabled) {
    fetch(cfg.apiBase.replace(/\/$/, '') + '/health').then(function (r) { return r.json(); }).then(function (j) { apiCart = !!(j && j.cart); depositPct = (j && +j.deposit_pct) || 0; if (state.step === 4) screenReview(); }).catch(function () { apiCart = false; });
  }
  function boot(list) {
    mounts = (list || []).filter(function (m) { return m && m.metals && m.metals.length; });
    if (!mounts.length) { app.innerHTML = ''; app.appendChild(el('div', 'rb__empty', 'No designs are set up yet.')); return; }
    readUrl();
    if (state.mount && !state.metal) state.metal = state.mount.metals[0].name;
    go(state.step);
  }
  var inline = root.querySelector('[data-rb-mounts]');
  if (cfg.mountsSource === 'collection' && inline) {
    try { boot(JSON.parse(inline.textContent)); } catch (e) { boot([]); }
  } else {
    fetch(cfg.sampleUrl).then(function (r) { return r.json(); }).then(function (j) { boot(j.mounts || j); }).catch(function () { boot([]); });
  }
})();
