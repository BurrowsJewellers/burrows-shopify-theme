/* Burrows Name Necklace Builder : sections/name-necklace-builder.liquid
   Ported from name-necklace-builder/name-necklace-maker/src/page.html (the UI script). The geometry lives in
   assets/name-necklace-core.js (Nameplate, Alloys, StlIO: generated, never hand-edited). Function names follow
   the upstream page so the two can be diffed.
   Step 1 name → Step 2 style → Step 3 metal → Step 4 review: live price from {api}/quote, Add to cart through
   {api}/build (hidden Shopify product at the quoted price) then /cart/add.js. */
(function () {
  'use strict';

  const CDN = {
    opentype: { test: () => typeof opentype !== 'undefined', src: 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js' },
    clipper: { test: () => typeof ClipperLib !== 'undefined', src: 'https://cdn.jsdelivr.net/npm/clipper-lib@6.4.2/clipper.js' },
    earcut: { test: () => typeof earcut !== 'undefined', src: 'https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js' },
    three: { test: () => typeof THREE !== 'undefined', src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js' },
    orbit: { test: () => typeof THREE !== 'undefined' && !!THREE.OrbitControls, src: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js' },
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
    // 2. Fonts from the API, in parallel with three.js (optional: the 2D editor works without it).
    const libs = Promise.all(['opentype', 'clipper', 'earcut'].map(ensure))
      .then(() => (typeof Nameplate !== 'undefined' || !cfg.coreUrl ? null : loadScript(cfg.coreUrl)));
    const three = libs.then(() => ensure('three')).then(() => ensure('orbit')).then(() => true, () => false);
    libs.then(() => {
      if (typeof Nameplate === 'undefined' || typeof Alloys === 'undefined') throw new Error('core');
      return loadFonts(cfg);
    }).then((fonts) => start(root, cfg, fonts, three)).catch((err) => {
      console.warn('Name necklace builder:', err);
      fail("The designer couldn't load. Check the internet connection and refresh the page" + (cfg.phone ? ', or call us on ' + cfg.phone + '.' : '.'));
    });
  }

  /* ---------- fonts ---------- */
  // The six TTFs come from the API (fontsBase/<file>), parsed for geometry and registered for the font picker.
  const faceName = (f) => 'NP ' + f.name;
  function loadFonts(cfg) {
    const base = String(cfg.fontsBase || '').replace(/\/$/, '');
    const parsed = {};
    return Promise.all(Nameplate.FONTS.map((f) => {
      const file = f.file.split('/').pop();
      return fetch(base + '/' + encodeURIComponent(file), { mode: 'cors' })
        .then((res) => { if (!res.ok) throw new Error('font ' + file + ' ' + res.status); return res.arrayBuffer(); })
        .then((buf) => {
          parsed[f.key] = opentype.parse(buf);
          try { const face = new FontFace(faceName(f), buf); document.fonts.add(face); face.load().catch(() => {}); } catch (e) { /* the list falls back to the UI font */ }
        });
    })).then(() => parsed);
  }

  function start(root, cfg, parsed, threeReady) {
    const $ = (id) => root.querySelector('#' + id);
    const app = root.querySelector('[data-nn-app]');
    const N = Nameplate;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const fmtBytes = (b) => (b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1e3) + ' KB');
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const editable = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') && !['radio', 'checkbox', 'range'].includes(el.type);
    const getFont = (key) => parsed[key] || parsed[N.FONTS[0].key];
    const showStl = !!cfg.showStl && !!$('saveBtn');
    const apiBase = String(cfg.apiBase || '').replace(/\/$/, '');

    /* ---------- state ---------- */
    let design = N.defaultDesign();
    const settings = { detail: 'standard', format: 'binary', view: '2d', tool: 'move', metal: 'yellow' };
    let alloy = Alloys.byKey(cfg.defaultAlloy) || Alloys.byKey('ag925') || Alloys.ALLOYS[0];
    let selection = [];   // { type: 'letter', index } | { type: 'dot', index } (an i/j dot) | { type: 'loop', side }
    let result = null, mesh = null, buildError = null, hover = null;
    const undoStack = [];
    let lastPush = { tag: null, t: 0 };

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
      lastPush = { tag: null, t: 0 };
      $('undoBtn').disabled = !undoStack.length;
      syncControls();
      update({ fit: true });
      say('Undone.');
    }

    /* ---------- controls ---------- */
    const fontList = $('fontList');
    for (const f of N.FONTS) {
      const lab = document.createElement('label');
      lab.innerHTML = `<input type="radio" name="font" value="${f.key}" aria-label="${esc(f.name)}, ${esc(f.style.toLowerCase())}"><span class="fname" style="font-family:'${faceName(f)}', cursive">${esc(f.name)}</span><span class="fstyle">${esc(f.style)}</span>`;
      fontList.appendChild(lab);
    }
    const thickSeg = $('thickSeg');
    for (const t of N.THICKNESSES) {
      const lab = document.createElement('label');
      lab.innerHTML = `<input type="radio" name="thickness" value="${t}"><span>${t.toFixed(1)}</span>`;
      thickSeg.appendChild(lab);
    }
    const radios = (name) => root.querySelectorAll(`input[name="${name}"]`);
    const setRadio = (name, value) => radios(name).forEach((el) => { el.checked = el.value === String(value); });
    const presetFor = (h) => Object.keys(N.HEIGHTS).find((k) => N.HEIGHTS[k] === h) || 'custom';

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
      $('loopL').checked = design.loops.left.on; $('loopR').checked = design.loops.right.on;
      $('loopOuter').value = design.loops.outer; $('loopHole').value = design.loops.hole;
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

    $('nameIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); }); // Enter shouldn't add to cart
    $('nameIn').addEventListener('input', () => {
      const el = $('nameIn');
      let text = el.value.replace(/[\r\n\t]/g, ' ');
      const chars = Array.from(text);
      if (chars.length > N.MAX_CHARS) { text = chars.slice(0, N.MAX_CHARS).join(''); el.value = text; }
      updateCounter();
      if (text === design.text) return;
      pushUndo('text');
      design.letters = N.retainLetters(design.text, text, design.letters);
      design.text = text;
      selection = selection.filter((s) => s.type === 'loop' || s.index < Array.from(text).length);
      schedule({ fit: true });
    });
    radios('font').forEach((el) => el.addEventListener('change', () => {
      pushUndo(); design.font = el.value;
      fontList.querySelectorAll('label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked));
      schedule({ fit: true });
    }));
    radios('height').forEach((el) => el.addEventListener('change', () => {
      $('heightRow').hidden = el.value !== 'custom';
      if (el.value === 'custom') { $('heightIn').focus(); return; }
      pushUndo(); design.height = N.HEIGHTS[el.value]; $('heightIn').value = design.height; schedule({ fit: true });
    }));
    $('heightIn').addEventListener('input', () => {
      const v = parseFloat($('heightIn').value);
      if (!Number.isFinite(v) || v < N.HEIGHT_RANGE[0] || v > N.HEIGHT_RANGE[1]) return;
      pushUndo('height'); design.height = v; setRadio('height', presetFor(v)); schedule({ fit: true });
    });
    $('heightIn').addEventListener('change', () => {
      const v = parseFloat($('heightIn').value);
      if (Number.isFinite(v)) { const c = clamp(v, N.HEIGHT_RANGE[0], N.HEIGHT_RANGE[1]); if (c !== design.height) { pushUndo('height'); design.height = c; schedule({ fit: true }); } }
      $('heightIn').value = design.height; setRadio('height', presetFor(design.height));
    });
    const setOverlap = (v) => { pushUndo('overlap'); design.overlap = Math.round(clamp(v, 0, 1) * 100) / 100; schedule({ fit: true }); };
    $('ovRange').addEventListener('input', () => { $('ovIn').value = (+$('ovRange').value).toFixed(2); setOverlap(+$('ovRange').value); });
    $('ovIn').addEventListener('input', () => { const v = parseFloat($('ovIn').value); if (Number.isFinite(v)) { $('ovRange').value = clamp(v, 0, 1); setOverlap(v); } });
    $('ovIn').addEventListener('change', () => { $('ovIn').value = design.overlap.toFixed(2); });
    const setCurve = (v) => { pushUndo('curve'); design.curve = Math.round(clamp(v, N.CURVE_RANGE[0], N.CURVE_RANGE[1])); schedule({ fit: true }); };
    $('curveRange').addEventListener('input', () => { $('curveIn').value = $('curveRange').value; setCurve(+$('curveRange').value); });
    $('curveIn').addEventListener('input', () => { const v = parseFloat($('curveIn').value); if (Number.isFinite(v)) { $('curveRange').value = clamp(v, -180, 180); setCurve(v); } });
    $('curveIn').addEventListener('change', () => { $('curveIn').value = design.curve || 0; });
    radios('thickness').forEach((el) => el.addEventListener('change', () => { pushUndo(); design.thickness = +el.value; schedule(); }));
    $('loopL').addEventListener('change', () => { pushUndo(); design.loops.left.on = $('loopL').checked; schedule({ fit: true }); });
    $('loopR').addEventListener('change', () => { pushUndo(); design.loops.right.on = $('loopR').checked; schedule({ fit: true }); });
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
      pushUndo('loopsize'); design.loops.outer = o; design.loops.hole = h; schedule();
    }
    $('loopOuter').addEventListener('input', loopInput);
    $('loopHole').addEventListener('input', loopInput);
    radios('finish').forEach((el) => el.addEventListener('change', () => { pushUndo(); design.finish = el.value; preview.setFinish(el.value); renderSummary(); }));
    radios('dots').forEach((el) => el.addEventListener('change', () => { pushUndo(); design.dots = el.value; schedule(); }));
    radios('detail').forEach((el) => el.addEventListener('change', () => { settings.detail = el.value; schedule(); }));
    radios('format').forEach((el) => el.addEventListener('change', () => { settings.format = el.value; renderStats(); }));

    /* ---------- steps ---------- */
    const steps = root.querySelector('[data-nn-steps]');
    function setStep(n) {
      steps.querySelectorAll('li').forEach((li) => { const k = +li.dataset.step; li.classList.toggle('on', k === n); li.classList.toggle('done', k < n); });
    }
    steps.querySelectorAll('li').forEach((li) => li.addEventListener('click', () => {
      const n = +li.dataset.step, block = root.querySelector(`[data-block="${n}"]`);
      setStep(n);
      if (block) block.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }));
    root.querySelectorAll('[data-block]').forEach((b) => b.addEventListener('focusin', () => setStep(+b.dataset.block)));

    /* ---------- metal (alloy chips) ---------- */
    // One row per group: sterling silver, 9ct, 14ct, 18ct, platinum. Yellow / white / rose sit together on a row.
    const colourOf = (a) => (a.colour === 'Rose' ? 'rose' : a.colour === 'Yellow' ? 'yellow' : 'white');
    const SWATCH = { yellow: '#E7B85A', rose: '#DFA084', white: '#CDD1D2' };
    const chipsEl = $('alloyChips');
    {
      const order = ['Sterling silver', '9ct', '14ct', '18ct', 'Platinum 950'];
      const groups = order.filter((g) => Alloys.ALLOYS.some((a) => a.group === g)).concat([...new Set(Alloys.ALLOYS.map((a) => a.group))].filter((g) => !order.includes(g)));
      for (const g of groups) {
        const list = Alloys.ALLOYS.filter((a) => a.group === g);
        const row = document.createElement('div');
        row.className = 'nn__alloy-row';
        const many = list.length > 1;
        row.innerHTML = `<span class="g">${esc(many ? g + ' gold' : g)}</span><div class="nn__chips">${list.map((a) => `<button type="button" class="nn__chip" role="radio" aria-checked="false" data-alloy="${a.key}" style="--sw:${SWATCH[colourOf(a)]}"><i aria-hidden="true"></i>${esc(many ? a.colour : a.name)}</button>`).join('')}</div>`;
        chipsEl.appendChild(row);
      }
      chipsEl.querySelectorAll('.nn__chip').forEach((b) => b.addEventListener('click', () => setAlloy(b.dataset.alloy)));
    }
    function setAlloy(key) {
      const a = Alloys.byKey(key);
      if (!a) return;
      alloy = a;
      chipsEl.querySelectorAll('.nn__chip').forEach((b) => { const on = b.dataset.alloy === key; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
      settings.metal = colourOf(a);
      preview.setMetal(settings.metal);
      if (!preview.ok) renderOverlay();
      renderStats();
      renderSummary();
      priceChanged();
    }

    /* ---------- preview (three.js) ---------- */
    const stage = $('stage'), overlay = $('overlay'), stageMsg = $('stageMsg');
    const view = { cx: 0, cy: 6, s: 10 }; // 2D view: centre (mm) and pixels per mm
    const stageSize = () => ({ W: stage.clientWidth, H: stage.clientHeight });
    const toScreen = (x, y) => { const { W, H } = stageSize(); return [W / 2 + (x - view.cx) * view.s, H / 2 - (y - view.cy) * view.s]; };
    const toWorld = (e) => {
      const r = overlay.getBoundingClientRect(), { W, H } = stageSize();
      return { x: view.cx + (e.clientX - r.left - W / 2) / view.s, y: view.cy - (e.clientY - r.top - H / 2) / view.s };
    };

    const noPreview = { ok: false, set() {}, setMetal() {}, setFinish() {}, setView() {}, frame2d() {}, frame3d() {}, refit3d() {}, snapshot() { return ''; } };
    let preview = noPreview;
    // three.js arrives after the page is up (it is the biggest download); until then the overlay draws the plate.
    function createPreview() {
      const none = noPreview;
      if (typeof THREE === 'undefined') return none;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
      catch (e) { return none; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setClearColor(0x000000, 0);
      stage.prepend(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');

      const scene = new THREE.Scene();
      // Soft studio environment for metal reflections, drawn on a canvas (same as the ring tool).
      const c = document.createElement('canvas'); c.width = 512; c.height = 256;
      const g = c.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 0, 256);
      // Brighter around the horizon than the ring tool: the 2D view looks straight at the face, which reflects
      // the middle of this map, so a dark horizon made silver look grey on the navy stage.
      grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.4, '#dfe4e2'); grd.addColorStop(0.5, '#aab1ae'); grd.addColorStop(0.62, '#6a716f'); grd.addColorStop(1, '#202423');
      g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
      g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(40, 50, 110, 46); g.fillRect(290, 36, 150, 34);
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(190, 150, 70, 18); g.fillRect(450, 120, 40, 60);
      const tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping; tex.encoding = THREE.sRGBEncoding;
      const pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromEquirectangular(tex).texture;
      tex.dispose(); pm.dispose();
      const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(30, 60, 25); scene.add(key);
      // Front light for the 2D view: a soft hotspot upper left, so the flat face reads as polished metal.
      const front = new THREE.PointLight(0xffffff, 0, 0, 2); scene.add(front);

      const COLORS = { yellow: 0xF0B550, rose: 0xE8A080, white: 0xE3E7EA };
      const mat = new THREE.MeshStandardMaterial({ color: COLORS.yellow, metalness: 1, roughness: 0.28 });
      // Brushed: fine streaks along the length of the name, drawn on a canvas and used as roughness and bump.
      // r128 has no anisotropic metal, so the streaks carry the look. Satin is an even, soft roughness.
      const brushTex = (() => {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = 'rgb(140,140,140)'; g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 2600; i++) {
          const v = 90 + Math.floor(Math.random() * 120), y = Math.random() * 512, x = Math.random() * 512, len = 60 + Math.random() * 380;
          g.strokeStyle = `rgba(${v},${v},${v},0.45)`; g.lineWidth = Math.random() < 0.8 ? 1 : 2;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke();
          if (x + len > 512) { g.beginPath(); g.moveTo(x - 512, y); g.lineTo(x + len - 512, y); g.stroke(); }
        }
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return t;
      })();
      const FINISHES = {
        polished: { roughness: 0.18, map: null, bump: 0 },
        brushed: { roughness: 0.78, map: brushTex, bump: 0.012 },
        satin: { roughness: 0.6, map: null, bump: 0 },
      };
      const mesh3 = new THREE.Mesh(new THREE.BufferGeometry(), mat);
      scene.add(mesh3);

      const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      const persp = new THREE.PerspectiveCamera(30, 1, 1, 3000);
      let active = ortho, box = null, framed3d = false;
      let controls = null;
      if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(persp, renderer.domElement);
        controls.enableDamping = true; controls.enablePan = false; controls.enabled = false;
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        controls.autoRotate = !reduce; controls.autoRotateSpeed = 1.1;
        controls.addEventListener('start', () => { controls.autoRotate = false; });
      }
      const resize = () => {
        const { W, H } = stageSize();
        if (!W || !H) return;
        renderer.setSize(W, H, false);
        persp.aspect = W / H; persp.updateProjectionMatrix();
        api.frame2d();
      };
      const api = {
        ok: true,
        set(d, T) {
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
          box = { ...result.bbox, T };
        },
        setMetal(m) { mat.color.setHex(COLORS[m] || COLORS.white); },
        setFinish(f) {
          const F = FINISHES[f] || FINISHES.polished;
          mat.roughness = F.roughness; mat.roughnessMap = F.map; mat.bumpMap = F.map; mat.bumpScale = F.bump;
          mat.needsUpdate = true;
        },
        setView(v) {
          active = v === '3d' ? persp : ortho;
          if (controls) controls.enabled = v === '3d';
          front.intensity = v === '3d' ? 0 : 1;
          key.intensity = v === '3d' ? 1.1 : 0.55;
          if (v === '3d' && !framed3d) api.frame3d();
        },
        frame2d() {
          const { W, H } = stageSize();
          ortho.left = -W / (2 * view.s); ortho.right = W / (2 * view.s);
          ortho.top = H / (2 * view.s); ortho.bottom = -H / (2 * view.s);
          ortho.position.set(view.cx, view.cy, 200); ortho.lookAt(view.cx, view.cy, 0);
          ortho.updateProjectionMatrix();
          // Hotspot above and left of the plate, scaled to its size so every name gets the same sheen.
          const w = box ? box.maxX - box.minX : 40;
          front.position.set(view.cx - w * 0.28, view.cy + w * 0.2, w * 0.55);
          front.intensity = active === ortho ? 1 : 0;
        },
        frame3d() {
          if (!box) return;
          framed3d = true;
          const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2, w = box.maxX - box.minX, h = box.maxY - box.minY;
          const fit = Math.max(w / persp.aspect, h) * 0.5 / Math.tan((persp.fov * Math.PI) / 360) * 1.35;
          if (controls) { controls.target.set(cx, cy, box.T / 2); controls.minDistance = fit * 0.3; controls.maxDistance = fit * 4; }
          // A little below centre, so the face reflects the bright upper half of the studio environment.
          persp.position.set(cx + fit * 0.3, cy - fit * 0.22, box.T / 2 + fit * 0.92);
          persp.lookAt(cx, cy, box.T / 2);
        },
        refit3d() { framed3d = false; if (active === persp) api.frame3d(); },
        // A square picture of the plate, face on, for the product in the cart. Rendered into the same canvas at
        // a fixed size (the CSS keeps it stretched to the stage, so nothing moves on screen), copied out at once,
        // then the normal size is put back. Returns a JPEG data URL, or '' if anything is missing.
        snapshot(px = 1000, bgInner = '#2b3566', bgOuter = '#0b0e2a') {
          if (!box) return '';
          try {
            const w = box.maxX - box.minX, h = box.maxY - box.minY;
            const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
            const span = Math.max(w, h * 1.4, 8) * 1.15;
            const cam = new THREE.OrthographicCamera(-span / 2, span / 2, span / 2, -span / 2, 0.1, 1000);
            cam.position.set(cx, cy, 200); cam.lookAt(cx, cy, 0); cam.updateProjectionMatrix();
            const fi = front.intensity, ki = key.intensity, fp = front.position.clone(), pr = renderer.getPixelRatio();
            front.position.set(cx - w * 0.28, cy + w * 0.2, w * 0.55); front.intensity = 1; key.intensity = 0.55;
            renderer.setPixelRatio(1); renderer.setSize(px, px, false);
            renderer.render(scene, cam);
            const out = document.createElement('canvas'); out.width = px; out.height = px;
            const g = out.getContext('2d');
            // Same navy display case as the stage, lit from the top like the page.
            const grd = g.createRadialGradient(px / 2, px * 0.3, px * 0.05, px / 2, px * 0.3, px * 0.95);
            grd.addColorStop(0, bgInner); grd.addColorStop(0.45, '#171d50'); grd.addColorStop(1, bgOuter);
            g.fillStyle = grd; g.fillRect(0, 0, px, px);
            g.drawImage(renderer.domElement, 0, 0, px, px);
            front.position.copy(fp); front.intensity = fi; key.intensity = ki;
            renderer.setPixelRatio(pr); resize(); renderer.render(scene, active);
            return out.toDataURL('image/jpeg', 0.88);
          } catch (e) { try { resize(); } catch (e2) { /* ignore */ } return ''; }
        },
      };
      if (window.ResizeObserver) new ResizeObserver(() => { resize(); fitIfNeeded(); renderOverlay(); }).observe(stage);
      else window.addEventListener('resize', () => { resize(); renderOverlay(); });
      resize();
      (function loop() { requestAnimationFrame(loop); if (controls && controls.enabled) controls.update(); renderer.render(scene, active); })();
      return api;
    }
    function attachPreview() {
      preview = createPreview();
      const threeD = root.querySelector('input[name="view"][value="3d"]');
      if (!preview.ok) {
        threeD.disabled = true;
        stageMsg.textContent = 'The 3D view could not load. You can still design and order in the 2D view.';
        stageMsg.hidden = false;
        stageMsg.style.placeItems = 'end center';
        stageMsg.style.paddingBottom = '56px';
        return;
      }
      threeD.disabled = false;
      stageMsg.hidden = true;
      preview.setMetal(settings.metal);
      preview.setFinish(design.finish || 'polished');
      if (result) { preview.set(N.buildDisplay(result, design.thickness), design.thickness); fit(); preview.refit3d(); preview.setView(settings.view); }
      renderOverlay();
    }
    if (!window.ResizeObserver) window.addEventListener('resize', () => { fitIfNeeded(); renderOverlay(); });
    else new ResizeObserver(() => { if (!preview.ok) { fitIfNeeded(); renderOverlay(); } }).observe(stage);

    // Fit the plate to about 80% of the stage width, clear of the tool rail.
    function fit() {
      if (!result) return;
      const { W, H } = stageSize();
      if (!W || !H) return;
      const rail = $('toolRail').getBoundingClientRect(), st = stage.getBoundingClientRect();
      const railRight = settings.view === '2d' ? rail.right - st.left + 10 : 0;
      const usable = Math.max(80, W - railRight - 60); // room on the right for the height label
      const b = result.bbox, w = Math.max(b.maxX - b.minX, 1), h = Math.max(b.maxY - b.minY, 1);
      view.s = Math.min((0.8 * W) / w, (0.92 * usable) / w, (0.55 * H) / h);
      const leftPx = railRight + (usable - w * view.s) / 2;
      view.cx = b.minX + (W / 2 - leftPx) / view.s; // puts the plate's left edge at leftPx
      view.cy = (b.minY + b.maxY) / 2;
      preview.frame2d();
    }
    // After an edit, refit only when the plate has drifted out of view.
    function fitIfNeeded() {
      if (!result) return;
      const { W, H } = stageSize();
      const [x0, y0] = toScreen(result.bbox.minX, result.bbox.maxY), [x1, y1] = toScreen(result.bbox.maxX, result.bbox.minY);
      if (x0 < 8 || y0 < 50 || x1 > W - 8 || y1 > H - 50 || x1 - x0 < W * 0.3) fit();
    }

    /* ---------- overlay (selection, checks, dimensions) ---------- */
    const pathD = (paths) => paths.map((p) => 'M' + p.map(([x, y]) => toScreen(x, y).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join('');
    const SC = N.SCALE, F = (p) => p.map((q) => [q.X / SC, q.Y / SC]);
    const sameSel = (a, b) => a.type === b.type && (a.type === 'loop' ? a.side === b.side : a.index === b.index);
    const isSelected = (h) => selection.some((s) => sameSel(s, h));
    const letterOf = (i) => result && result.letters.find((l) => l.index === i);
    const loopOf = (side) => result && result.loops.find((l) => l.side === side);

    function boxOf(paths) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of paths) for (const [x, y] of p) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
      return { minX, minY, maxX, maxY };
    }
    function selectionBox() {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const s of selection) {
        let b = null;
        if (s.type === 'letter') { const l = letterOf(s.index); if (l) b = l.bbox; }
        else if (s.type === 'dot') { const l = letterOf(s.index); if (l && l.dotPaths.length) b = boxOf(l.dotPaths); }
        else { const lp = loopOf(s.side); if (lp) { const r = lp.outer / 2; b = { minX: lp.cx - r, maxX: lp.cx + r, minY: lp.cy - r, maxY: lp.cy + r }; } }
        if (!b) continue;
        minX = Math.min(minX, b.minX); minY = Math.min(minY, b.minY); maxX = Math.max(maxX, b.maxX); maxY = Math.max(maxY, b.maxY);
      }
      return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
    }

    function renderOverlay() {
      if (!result) { overlay.innerHTML = ''; return; }
      const { W, H } = stageSize();
      overlay.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const two = settings.view === '2d';
      let s = '<defs><pattern id="warnHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="hatch-b" width="6" height="6"/><rect class="hatch-a" width="3" height="6"/></pattern></defs>';
      if (!preview.ok) {
        // No WebGL (or three.js still on its way): draw the plate with a metal gradient so 2D editing works.
        const stops = { yellow: ['#F6DFA6', '#E2B35A', '#B9893A'], rose: ['#F5D2C2', '#DFA084', '#B47258'], white: ['#F4F6F7', '#CDD1D2', '#9CA3A6'] }[settings.metal];
        s += `<defs><linearGradient id="metalFill" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${stops[0]}"/><stop offset="0.55" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[2]}"/></linearGradient></defs>`;
        for (const g of result.groups) s += `<path class="ov-fill" fill-rule="evenodd" d="${pathD([F(g.outer), ...g.holes.map(F)])}"/>`;
      }
      if (two) {
        // Faint bounding box with its dimensions, like the ring tool's cross-section.
        const b = result.bbox, [x0, y0] = toScreen(b.minX, b.maxY), [x1, y1] = toScreen(b.maxX, b.minY);
        const dy = y0 - 12, dx = Math.min(x1 + 12, W - 44);
        s += `<rect class="ov-box" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${(y1 - y0).toFixed(1)}"/>`;
        // mm rulers on both dimension lines: a tick every 1 mm (dropped when too dense), longer every 5 mm.
        // The height ruler counts up from the bottom of the plate.
        const minor = view.s >= 4;
        let ticks = '';
        for (let mm = 0; mm <= result.width + 1e-6; mm++) {
          const major = mm % 5 === 0;
          if (major || minor) ticks += `M${(x0 + mm * view.s).toFixed(1)} ${dy}V${dy + (major ? 5 : 3)}`;
        }
        for (let mm = 0; mm <= result.height + 1e-6; mm++) {
          const major = mm % 5 === 0, y = y1 - mm * view.s;
          if (major || minor) ticks += `M${dx} ${y.toFixed(1)}H${dx + (major ? 6 : 3)}`;
          if (major && mm > 0 && result.height - mm > 1.5) s += `<text class="ruler-t" x="${dx + 9}" y="${(y + 3.5).toFixed(1)}">${mm}</text>`;
        }
        s += `<path class="dim" d="${ticks}"/>`;
        s += `<path class="dim" d="M${x0} ${dy}H${x1}M${x0} ${dy - 4}V${dy + 4}M${x1} ${dy - 4}V${dy + 4}"/>`;
        s += `<text class="dim-t" x="${(x0 + x1) / 2}" y="${dy - 6}" text-anchor="middle">${result.width.toFixed(2)}</text>`;
        s += `<path class="dim" d="M${dx} ${y0}V${y1}M${dx - 4} ${y0}H${dx + 4}M${dx - 4} ${y1}H${dx + 4}"/>`;
        s += `<text class="dim-t" x="${dx + 9}" y="${y0 + 4}">${result.height.toFixed(2)}</text>`;
      }
      if (two) {
        // Check highlights are flat 2D shapes; in 3D they would float free of the turning model.
        for (const t of result.thin) s += `<path class="ov-thin" fill-rule="evenodd" d="${pathD(t)}"/>`;
        for (const lz of result.loose) {
          const g = result.groups[lz.group], d = pathD([F(g.outer), ...g.holes.map(F)]);
          s += `<path class="ov-loose-edge" d="${d}"/><path class="ov-loose" fill-rule="evenodd" d="${d}"/>`;
        }
        if (hover && !isSelected(hover)) {
          if (hover.type === 'letter') { const l = letterOf(hover.index); if (l) s += `<path class="ov-hover" fill-rule="evenodd" d="${pathD(l.body)}"/>`; }
          else if (hover.type === 'dot') { const l = letterOf(hover.index); if (l) s += `<path class="ov-hover" fill-rule="evenodd" d="${pathD(l.dotPaths)}"/>`; }
          else { const lp = loopOf(hover.side); if (lp) s += `<path class="ov-hover" fill-rule="evenodd" d="${pathD([lp.outerPath, lp.holePath])}"/>`; }
        }
        for (const sel of selection) {
          if (sel.type === 'letter') {
            const l = letterOf(sel.index); if (!l) continue;
            const [x0, y0] = toScreen(l.bbox.minX, l.bbox.maxY), [x1, y1] = toScreen(l.bbox.maxX, l.bbox.minY);
            s += `<path class="ov-sel" fill-rule="evenodd" d="${pathD(l.body)}"/><rect class="ov-selbox" x="${(x0 - 3).toFixed(1)}" y="${(y0 - 3).toFixed(1)}" width="${(x1 - x0 + 6).toFixed(1)}" height="${(y1 - y0 + 6).toFixed(1)}"/>`;
          } else if (sel.type === 'dot') {
            const l = letterOf(sel.index); if (!l || !l.dotPaths.length) continue;
            s += `<path class="ov-sel" fill-rule="evenodd" d="${pathD(l.dotPaths)}"/>`;
          } else {
            const lp = loopOf(sel.side); if (!lp) continue;
            s += `<path class="ov-sel" fill-rule="evenodd" d="${pathD([lp.outerPath, lp.holePath])}"/>`;
          }
        }
        // Loop guides: while a loop is selected, lines through both loop centres and their height difference.
        if (selection.some((x) => x.type === 'loop') && result.loops.length) {
          const b = result.bbox, xa = toScreen(b.minX - 1, 0)[0], xb = toScreen(b.maxX + 1, 0)[0];
          const L = loopOf('left'), R = loopOf('right'), level = !!(L && R && Math.abs(L.cy - R.cy) < 0.005);
          for (const lp of result.loops) { const y = toScreen(0, lp.cy)[1].toFixed(1); s += `<path class="ov-guide${level ? ' level' : ''}" d="M${xa} ${y}H${xb}"/>`; }
          if (L && R) {
            const ty = Math.min(toScreen(0, L.cy)[1], toScreen(0, R.cy)[1]) - 7;
            s += `<text class="ov-guide-t" x="${((xa + xb) / 2).toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle">${level ? 'Loops level' : `${Math.abs(L.cy - R.cy).toFixed(2)} mm apart`}</text>`;
          }
        }
        if (selection.length && settings.tool !== 'move') {
          const b = selectionBox();
          if (b) { const [px, py] = toScreen((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2); s += `<circle class="ov-pivot" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3"/>`; }
        }
      }
      overlay.innerHTML = s;
    }

    /* ---------- rebuild ---------- */
    function update({ fit: doFit = false, light = false } = {}) {
      const r = N.build(getFont(design.font), design, { detail: settings.detail, checks: !light });
      const warn = $('nameWarn');
      if (!r.ok) {
        buildError = r.error;
        warn.textContent = r.error.message; warn.hidden = false;
        renderSaveState();
        return;
      }
      buildError = null; warn.hidden = true;
      if (light && result) { r.thin = result.thin; r.thinArea = result.thinArea; } // keep the last thin overlay while dragging
      result = r;
      mesh = N.buildMesh(r, design.thickness);
      if (!mesh.volumeOk) console.warn('Nameplate: mesh volume does not match outline area x thickness', mesh.volume, mesh.expected);
      selection = selection.filter((s) => (s.type === 'loop' ? !!loopOf(s.side) : s.type === 'dot' ? !!(letterOf(s.index) && letterOf(s.index).dotPaths.length) : !!letterOf(s.index)));
      preview.set(N.buildDisplay(r, design.thickness), design.thickness);
      if (doFit) { fit(); if (preview.refit3d) preview.refit3d(); } else if (!drag) fitIfNeeded();
      const c = r.curve, cr = $('curveReadout');
      cr.innerHTML = !c.degrees ? '<b>Flat</b>' : `<b>${Math.abs(c.degrees)}°</b> ${c.degrees > 0 ? 'smile' : 'arch'}`;
      if (c.limited) cr.innerHTML += ` · limited to ${c.maxDegrees}° for a name this short, so the letters don't fold`;
      $('dims').textContent = `Width ${r.width.toFixed(2)} · Height ${r.height.toFixed(2)} · Thickness ${design.thickness.toFixed(2)} mm`;
      renderOverlay();
      renderChecks();
      renderStats();
      renderSummary();
      renderSaveState();
      if (!light) priceChanged();
    }
    let raf = 0, pending = {};
    function schedule(opts = {}) {
      pending = { fit: pending.fit || opts.fit, light: (pending.light !== false) && !!opts.light };
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; const o = pending; pending = {}; update(o); });
    }

    function renderChecks() {
      const issues = $('issues'), loose = result.loose.length;
      issues.innerHTML = '';
      const looseWarn = $('looseWarn'), thinWarn = $('thinWarn');
      if (loose) {
        const what = result.loose.map((l) => l.label);
        looseWarn.textContent = `${loose} loose piece${loose > 1 ? 's' : ''}. ${loose > 1 ? 'They' : 'It'} would fall off when cast (${[...new Set(what)].join(', ')}). Join ${loose > 1 ? 'them' : 'it'} up in the editor before ordering.`;
        if (result.loose.some((l) => l.owners.some((o) => o.type === 'dot'))) looseWarn.textContent += ' Drag the dot down onto its letter, or remove dots under More options.';
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'nn__issue'; b.textContent = `${loose} loose piece${loose > 1 ? 's' : ''}`;
        b.title = 'Select the loose pieces';
        b.addEventListener('click', () => selectOwners(result.loose.flatMap((l) => l.owners)));
        issues.appendChild(b);
      }
      looseWarn.hidden = !loose;
      if (result.thin.length) {
        thinWarn.textContent = `Some strokes are thinner than ${N.MIN_FEATURE} mm. They may not fill when cast; try a heavier font or a bigger height.`;
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'nn__issue'; b.textContent = 'Thin strokes';
        b.title = 'Select the letters with thin strokes';
        b.addEventListener('click', () => {
          const hits = [];
          for (const t of result.thin) {
            const [x, y] = t[0][0];
            let best = null, bd = Infinity;
            for (const l of result.letters) { const bb = l.bbox, d = Math.hypot(Math.max(bb.minX - x, 0, x - bb.maxX), Math.max(bb.minY - y, 0, y - bb.maxY)); if (d < bd) { bd = d; best = l; } }
            if (best && bd < 0.5) hits.push({ type: 'letter', index: best.index });
          }
          selectOwners(hits);
        });
        issues.appendChild(b);
      }
      thinWarn.hidden = !result.thin.length;
    }
    function selectOwners(owners) {
      const out = [];
      for (const o of owners) { const h = o.type === 'loop' ? { type: 'loop', side: o.side } : { type: o.type, index: o.index }; if (!out.some((s) => sameSel(s, h))) out.push(h); }
      if (settings.view !== '2d') setView('2d');
      selection = out;
      renderOverlay();
      stage.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Weight for the chosen metal only (the server's figure replaces it once the quote arrives).
    function renderStats() {
      if (!mesh) return;
      const grams = Alloys.weightGrams(mesh.volume, alloy);
      $('weightLine').textContent = `About ${grams.toFixed(2)} g in ${alloy.name}. Outline area × thickness × the alloy's density.`;
      if (!showStl) return;
      const tris = mesh.triangles;
      const bytes = settings.format === 'binary' ? 84 + 50 * tris : tris * 240.5;
      $('stats').innerHTML = `<b>${tris.toLocaleString()}</b> triangles · ${settings.format === 'binary' ? '' : '≈ '}${fmtBytes(bytes)} · ${mesh.volume.toFixed(1)} mm³`;
    }

    /* ---------- review summary ---------- */
    const fontName = () => N.fontMeta(design.font).name;
    const curveText = () => { const c = result && result.curve.degrees; return !c ? 'Straight' : `${Math.abs(c)}° ${c > 0 ? 'smile' : 'arch'}`; };
    const loopsText = () => { const L = design.loops; return L.left.on && L.right.on ? 'Left and right' : L.left.on ? 'Left only' : L.right.on ? 'Right only' : 'None'; };
    const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
    function renderSummary() {
      const rows = [
        ['Name', design.text], ['Font', fontName()],
        ['Size', result ? `${result.width.toFixed(1)} × ${result.height.toFixed(1)} mm` : `${design.height} mm high`],
        ['Thickness', `${design.thickness.toFixed(1)} mm`], ['Curve', curveText()], ['Chain loops', loopsText()],
        ['Metal', alloy.name], ['Finish', cap(design.finish || 'polished')],
      ];
      $('summary').innerHTML = rows.map(([k, v]) => `<div class="nn__summary-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('');
    }

    /* ---------- editing ---------- */
    function adjOf(sel) {
      if (sel.type === 'loop') return design.loops[sel.side];
      const L = design.letters;
      while (L.length <= sel.index) L.push(null);
      if (!L[sel.index]) L[sel.index] = N.defaultLetter();
      if (sel.type === 'dot') return L[sel.index].dot || (L[sel.index].dot = { dx: 0, dy: 0 });
      return L[sel.index];
    }
    const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
    const normDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

    // Apply a change to every selected item, from a snapshot (absolute) so drags don't drift.
    function applyTool(base, tool, amount) {
      design = clone(base);
      for (const sel of selection) {
        const a = adjOf(sel);
        if (tool === 'move') {
          // On a curved name a letter's own moves happen before the bend, so turn the screen move into its slant.
          const l = sel.type === 'loop' ? null : letterOf(sel.index), ang = l ? l.angle : 0;
          const mx = amount.dx * Math.cos(ang) + amount.dy * Math.sin(ang), my = -amount.dx * Math.sin(ang) + amount.dy * Math.cos(ang);
          a.dx = round((a.dx || 0) + mx, 3); a.dy = round((a.dy || 0) + my, 3);
        }
        else if (sel.type === 'letter' && tool === 'rotate') a.rot = round(normDeg((a.rot || 0) + amount), 2);
        else if (sel.type === 'letter' && tool === 'scale') a.scale = round(clamp((a.scale || 1) * amount, N.SCALE_RANGE[0], N.SCALE_RANGE[1]), 4);
      }
    }

    let drag = null;
    overlay.addEventListener('pointerdown', (e) => {
      if (settings.view !== '2d' || !result || e.button > 0) return;
      e.preventDefault();
      // Take focus off the form so arrow keys nudge the selection instead of moving a caret.
      if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) document.activeElement.blur();
      overlay.focus({ preventScroll: true });
      const p = toWorld(e), hit = N.hitTest(result, p.x, p.y);
      if (!hit) { if (!e.shiftKey) { selection = []; renderOverlay(); } return; }
      if (e.shiftKey) {
        if (isSelected(hit)) { selection = selection.filter((s) => !sameSel(s, hit)); renderOverlay(); return; }
        selection.push(hit);
      } else if (!isSelected(hit)) selection = [hit];
      const b = selectionBox();
      // One loop dragged on its own snaps level with the other one.
      const only = selection.length === 1 && selection[0].type === 'loop' ? loopOf(selection[0].side) : null;
      const other = only && loopOf(only.side === 'left' ? 'right' : 'left');
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: p, base: clone(design), moved: false, c: b ? { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 } : p, snap: only && other ? { from: only.cy, to: other.cy } : null };
      overlay.setPointerCapture(e.pointerId);
      overlay.classList.add('dragging');
      renderOverlay();
    });
    overlay.addEventListener('pointermove', (e) => {
      if (!result || settings.view !== '2d') return;
      const p = toWorld(e);
      if (!drag) {
        const h = N.hitTest(result, p.x, p.y);
        overlay.classList.toggle('over', !!h);
        if ((h && (!hover || !sameSel(h, hover))) || (!h && hover)) { hover = h; renderOverlay(); }
        return;
      }
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 3) return;
      if (!drag.moved) { pushUndo(); drag.moved = true; }
      const tool = settings.tool;
      if (tool !== 'move' && !selection.some((s) => s.type === 'letter')) { say('Dots and loops only move. Press M for Move.'); return; }
      if (tool === 'move') {
        let dy = p.y - drag.p0.y;
        if (drag.snap && !e.altKey && Math.abs(drag.snap.from + dy - drag.snap.to) < 6 / view.s) dy = drag.snap.to - drag.snap.from; // hold Alt to place freely
        applyTool(drag.base, 'move', { dx: p.x - drag.p0.x, dy });
      }
      else if (tool === 'rotate') {
        const a0 = Math.atan2(drag.p0.y - drag.c.y, drag.p0.x - drag.c.x), a1 = Math.atan2(p.y - drag.c.y, p.x - drag.c.x);
        applyTool(drag.base, 'rotate', normDeg(((a1 - a0) * 180) / Math.PI));
      } else {
        const d0 = Math.hypot(drag.p0.x - drag.c.x, drag.p0.y - drag.c.y) || 1, d1 = Math.hypot(p.x - drag.c.x, p.y - drag.c.y);
        applyTool(drag.base, 'scale', d1 / d0);
      }
      schedule({ light: true });
    });
    const endDrag = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      overlay.classList.remove('dragging');
      if (moved) schedule();
    };
    overlay.addEventListener('pointerup', endDrag);
    overlay.addEventListener('pointercancel', endDrag);
    overlay.addEventListener('pointerleave', () => { if (!drag && hover) { hover = null; overlay.classList.remove('over'); renderOverlay(); } });

    function setTool(t) {
      settings.tool = t;
      overlay.dataset.tool = t;
      root.querySelectorAll('#toolRail button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === t)));
      renderOverlay();
    }
    root.querySelectorAll('#toolRail button').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));

    function setView(v) {
      settings.view = v;
      setRadio('view', v);
      stage.classList.toggle('view3d', v === '3d');
      $('toolRail').hidden = v === '3d'; // in 3D the rail would sit over the model; the hint says how to edit instead
      $('hint').textContent = v === '3d' ? 'Drag to turn · scroll to zoom · switch to 2D to edit letters' : 'Click a letter to adjust it · Shift-click for more';
      preview.setView(v);
      if (v === '2d') fit();
      renderOverlay();
    }
    radios('view').forEach((el) => el.addEventListener('change', () => setView(el.value)));

    document.addEventListener('keydown', (e) => {
      const inField = editable(e.target);
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z') {
        if (inField) return; // let text fields undo their own typing
        if (!root.contains(e.target) && e.target !== document.body) return;
        e.preventDefault(); undo(); return;
      }
      if (inField || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') { if (selection.length) { selection = []; renderOverlay(); } return; }
      if (settings.view !== '2d') return;
      // Single-key shortcuts only while the editor is in use, so they never fight the rest of the page.
      if (!root.contains(e.target) && e.target !== document.body) return;
      const k = e.key.toLowerCase();
      if (k === 'm' || k === 'r' || k === 's') { setTool({ m: 'move', r: 'rotate', s: 'scale' }[k]); return; }
      if (!selection.length || !e.key.startsWith('Arrow')) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return; // arrows keep their native job in form controls
      e.preventDefault();
      const big = e.shiftKey, dir = e.key.slice(5); // Up Down Left Right
      pushUndo('nudge');
      const base = clone(design);
      if (settings.tool === 'move') {
        const st = big ? 1 : 0.1;
        applyTool(base, 'move', { dx: dir === 'Left' ? -st : dir === 'Right' ? st : 0, dy: dir === 'Up' ? st : dir === 'Down' ? -st : 0 });
      } else if (settings.tool === 'rotate') {
        const st = big ? 5 : 1;
        applyTool(base, 'rotate', dir === 'Left' || dir === 'Up' ? st : -st); // counter-clockwise on Left / Up
      } else {
        const st = big ? 0.05 : 0.01;
        applyTool(base, 'scale', dir === 'Right' || dir === 'Up' ? 1 + st : 1 - st);
      }
      schedule();
    });

    $('undoBtn').addEventListener('click', undo);
    $('resetBtn').addEventListener('click', () => { $('resetConfirm').hidden = false; $('resetYes').focus(); });
    $('resetNo').addEventListener('click', () => { $('resetConfirm').hidden = true; });
    $('resetYes').addEventListener('click', () => {
      $('resetConfirm').hidden = true;
      pushUndo();
      design.letters = [];
      for (const side of ['left', 'right']) { design.loops[side].dx = 0; design.loops[side].dy = 0; }
      selection = [];
      schedule({ fit: true });
      say('Letters and loops are back to their automatic places.');
    });

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
    // The price server rebuilds the design, applies the metal price list and the markup, and sends back just the
    // final price. Every change asks again after a short pause; the old price shows as "from" until the new one lands.
    const PRICE_URL = apiBase + '/quote';
    const priceOut = $('priceOut');
    let priceTimer = 0, priceSeq = 0, price = null; // price: the last quote { price, weightGrams, alloy } or null
    const money = (v) => 'A$' + v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    async function requestPrice() {
      if (buildError) { price = null; priceOut.className = 'nn__price err'; priceOut.textContent = 'Fix the name above to see a price.'; renderSaveState(); return; }
      const seq = ++priceSeq;
      priceOut.classList.add('stale');
      renderSaveState();
      try {
        const res = await fetch(PRICE_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ design: JSON.parse(N.designJSON(design)), alloy: alloy.key }) });
        const b = await res.json().catch(() => ({}));
        if (seq !== priceSeq) return; // a newer request is on its way
        if (!res.ok) {
          price = null; priceOut.className = 'nn__price err';
          priceOut.textContent = res.status === 429 ? 'Please wait a moment and try again.' : (b.error || `The price service answered ${res.status}.`);
          return;
        }
        const when = b.metalPriceAt ? new Date(b.metalPriceAt) : null;
        const basis = !when ? '' : b.metalPriceLive
          ? ` · metal price at ${when.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}`
          : ` · metal prices of ${when.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        price = { price: b.price, weightGrams: b.weightGrams, alloy: b.alloy, alloyName: b.alloyName };
        priceOut.className = 'nn__price';
        priceOut.innerHTML = `${money(b.price)}<small>${b.weightGrams.toFixed(2)} g in ${esc(b.alloyName)}${esc(basis)}</small>`;
      } catch (err) {
        if (seq !== priceSeq) return;
        price = null; priceOut.className = 'nn__price err';
        priceOut.textContent = "Couldn't reach the price service. Check the connection and try again.";
      } finally { if (seq === priceSeq) renderSaveState(); }
    }
    function priceChanged() { // keep the price current as the design changes
      if (price && !buildError) { priceOut.className = 'nn__price stale'; priceOut.innerHTML = `<span class="from">from</span>${money(price.price)}`; }
      else if (!buildError) { priceOut.className = 'nn__price stale'; priceOut.textContent = 'Working out the price…'; }
      price = null;
      renderSaveState();
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
    function renderSaveState() {
      const ready = !!result && !buildError;
      if (cartState === 'off') {
        addBtn.textContent = 'Enquire about this design';
        addBtn.disabled = !ready || adding;
      } else {
        addBtn.textContent = adding ? 'Adding to cart…' : price ? `Add to cart · ${money(price.price)}` : 'Add to cart';
        addBtn.disabled = !ready || !price || adding || cartState === 'checking';
      }
      if (showStl) { $('saveBtn').disabled = !ready; $('saveConfirm').hidden = true; }
    }
    const enquiryHref = () => {
      const q = new URLSearchParams();
      q.set('design', `Name necklace · ${design.text} · ${fontName()} · ${design.height} mm · ${alloy.name} · ${design.finish || 'polished'}`);
      return String(cfg.contactUrl || '/pages/contact') + '?' + q.toString() + '#contact';
    };
    const stlAbsolute = (u) => (/^https?:\/\//i.test(u) ? u : apiBase + String(u).replace(/^\/api(?=\/)/, ''));
    const previewPicture = () => (preview && preview.ok ? preview.snapshot(1000) : '');
    async function addToCart() {
      if (!result || buildError || adding) return;
      if (cartState === 'off') { location.href = enquiryHref(); return; }
      if (result.loose.length) { $('looseWarn').hidden = false; $('looseWarn').scrollIntoView({ block: 'center', behavior: 'smooth' }); say('Join up the loose pieces first.', true); return; }
      adding = true; say(''); renderSaveState();
      let st = 0, j = {};
      // The picture of the design goes with the build so the hidden product (and so the cart) has an image.
      let picture = '';
      if (picturesOn) { try { picture = previewPicture(); } catch (e) { picture = ''; } }
      try {
        const payload = { design: JSON.parse(N.designJSON(design)), alloy: alloy.key };
        if (picture && picture.length < 800000) payload.preview = picture;
        const res = await fetch(apiBase + '/build', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        st = res.status; j = await res.json().catch(() => ({}));
      } catch (e) { st = 0; }
      if (st === 200 && j.variant_id) {
        const props = {
          'Build': j.build, 'Name': design.text, 'Font': fontName(), 'Height': `${design.height} mm`, 'Thickness': `${design.thickness.toFixed(1)} mm`,
          'Metal': j.alloyName || alloy.name, 'Finish': cap(design.finish || 'polished'), 'Lead time': cfg.leadTime || '',
          // Underscore: Shopify keeps the link off the cart, checkout and customer emails; staff see it on the order.
          '_STL': stlAbsolute(j.stl_url || ''),
        };
        if (!props['Lead time']) delete props['Lead time'];
        try {
          const r = await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: j.variant_id, quantity: 1, properties: props }] }) });
          if (!r.ok) throw new Error('cart ' + r.status);
          location.href = '/cart';
          return;
        } catch (e) {
          adding = false; renderSaveState();
          say("The cart didn't take it. Please try again" + (cfg.phone ? ' or call us on ' + cfg.phone + '.' : '.'), true);
          return;
        }
      }
      adding = false; renderSaveState();
      if (st === 422 && j.code === 'loose') { const w = $('looseWarn'); w.textContent = j.error || w.textContent; w.hidden = false; w.scrollIntoView({ block: 'center', behavior: 'smooth' }); say('Join up the loose pieces first.', true); }
      else if (st === 422) { const w = $('nameWarn'); w.textContent = j.error || 'This design could not be made. Check the name and try again.'; w.hidden = false; w.scrollIntoView({ block: 'center', behavior: 'smooth' }); say('Check the name.', true); }
      else if (st === 501) { cartState = 'off'; renderSaveState(); status.innerHTML = `Online ordering isn't switched on yet. <a class="nn__link" href="${esc(enquiryHref())}">Send us an enquiry</a> and we will quote it for you.`; status.classList.add('err'); }
      else if (st === 429) say('Please wait a moment and try again.', true);
      else say("That didn't go through. Please try again" + (cfg.phone ? ' or call us on ' + cfg.phone + '.' : '.'), true);
    }
    $('controls').addEventListener('submit', (e) => { e.preventDefault(); addToCart(); });

    /* ---------- STL download (testing only) ---------- */
    if (showStl) {
      const btn = $('saveBtn');
      function save() {
        $('saveConfirm').hidden = true;
        if (!mesh || buildError) return;
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
      btn.addEventListener('click', () => {
        if (result && result.loose.length) {
          $('saveConfirm').hidden = false;
          say('Check the loose pieces first, or save anyway.', true);
          $('saveAnyway').focus();
          return;
        }
        save();
      });
      $('saveAnyway').addEventListener('click', save);
      $('saveCancel').addEventListener('click', () => { $('saveConfirm').hidden = true; say(''); });
    }

    /* ---------- boot ---------- */
    app.setAttribute('aria-busy', 'false');
    $('loading').hidden = true;
    setAlloy(alloy.key);
    syncControls();
    setTool('move');
    update({ fit: true });
    renderSaveState();
    threeReady.then(attachPreview); // with or without three.js: without it the overlay keeps drawing the plate
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
