/* GENERATED from the name-necklace-builder repo (shared/stl-io.js + shared/alloys.js + shared/chains.js + name-necklace-maker/src/nameplate.js, as build.js assembles them). Do not hand-edit; rebuild from that repo. */
/* StlIO: STL and ZIP writers (the same file as in BurrowsJewellers/ring-builder). No DOM. Units: millimetres. */
const StlIO = (() => {
  function signedVolume(pos, idx) {
    let v = 0;
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const ax = pos[a], ay = pos[a + 1], az = pos[a + 2];
      const bx = pos[b], by = pos[b + 1], bz = pos[b + 2];
      const cx = pos[c], cy = pos[c + 1], cz = pos[c + 2];
      v += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
    }
    return v / 6;
  }

  function facetNormal(pos, a, b, c) {
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    return [nx / l, ny / l, nz / l];
  }

  // Binary STL. The 80-byte header must not begin with "solid" or some readers treat it as ASCII.
  function toBinarySTL(mesh, header) {
    const { positions: pos, indices: idx } = mesh;
    const nT = idx.length / 3;
    const buf = new ArrayBuffer(84 + 50 * nT);
    const dv = new DataView(buf);
    let h = (header || 'Binary STL, units: mm').slice(0, 80);
    if (/^solid/i.test(h)) h = ('STL ' + h).slice(0, 80);
    for (let i = 0; i < h.length; i++) dv.setUint8(i, h.charCodeAt(i) & 0x7f);
    dv.setUint32(80, nT, true);
    let o = 84;
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const n = facetNormal(pos, a, b, c);
      dv.setFloat32(o, n[0], true); dv.setFloat32(o + 4, n[1], true); dv.setFloat32(o + 8, n[2], true);
      o += 12;
      for (const v of [a, b, c]) {
        dv.setFloat32(o, pos[v], true); dv.setFloat32(o + 4, pos[v + 1], true); dv.setFloat32(o + 8, pos[v + 2], true);
        o += 12;
      }
      dv.setUint16(o, 0, true);
      o += 2;
    }
    return new Uint8Array(buf);
  }

  function toAsciiSTL(mesh, name) {
    const { positions: pos, indices: idx } = mesh;
    const f = (x) => x.toExponential(6);
    const nm = (name || 'ring').replace(/\s+/g, '_');
    const out = ['solid ' + nm];
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const n = facetNormal(pos, a, b, c);
      out.push(`  facet normal ${f(n[0])} ${f(n[1])} ${f(n[2])}`, '    outer loop');
      for (const v of [a, b, c]) out.push(`      vertex ${f(pos[v])} ${f(pos[v + 1])} ${f(pos[v + 2])}`);
      out.push('    endloop', '  endfacet');
    }
    out.push('endsolid ' + nm, '');
    return new TextEncoder().encode(out.join('\n'));
  }

  // Minimal single-file ZIP (stored, no compression).
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(u8) {
    let c = 0xffffffff;
    for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function zipOne(name, data, date) {
    const d = date || new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const day = ((Math.max(1980, d.getFullYear()) - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const nameBytes = new TextEncoder().encode(name);
    const crc = crc32(data), size = data.length, nl = nameBytes.length;
    const local = 30 + nl, central = 46 + nl;
    const out = new Uint8Array(local + size + central + 22);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true); dv.setUint16(8, 0, true);
    dv.setUint16(10, time, true); dv.setUint16(12, day, true); dv.setUint32(14, crc, true);
    dv.setUint32(18, size, true); dv.setUint32(22, size, true); dv.setUint16(26, nl, true); dv.setUint16(28, 0, true);
    out.set(nameBytes, 30); out.set(data, local);
    let o = local + size;
    dv.setUint32(o, 0x02014b50, true); dv.setUint16(o + 4, 20, true); dv.setUint16(o + 6, 20, true); dv.setUint16(o + 8, 0, true);
    dv.setUint16(o + 10, 0, true); dv.setUint16(o + 12, time, true); dv.setUint16(o + 14, day, true); dv.setUint32(o + 16, crc, true);
    dv.setUint32(o + 20, size, true); dv.setUint32(o + 24, size, true); dv.setUint16(o + 28, nl, true);
    dv.setUint16(o + 30, 0, true); dv.setUint16(o + 32, 0, true); dv.setUint16(o + 34, 0, true); dv.setUint16(o + 36, 0, true);
    dv.setUint32(o + 38, 0, true); dv.setUint32(o + 42, 0, true); out.set(nameBytes, o + 46);
    o += central;
    dv.setUint32(o, 0x06054b50, true); dv.setUint16(o + 4, 0, true); dv.setUint16(o + 6, 0, true);
    dv.setUint16(o + 8, 1, true); dv.setUint16(o + 10, 1, true); dv.setUint32(o + 12, central, true);
    dv.setUint32(o + 16, local + size, true); dv.setUint16(o + 20, 0, true);
    return out;
  }

  return { toBinarySTL, toAsciiSTL, zipOne, crc32, signedVolume, facetNormal };
})();
if (typeof module !== 'undefined') module.exports = StlIO;

/* Alloys offered for name necklaces. Not secret: the page uses them for weights, the price server for cost.
   fineness = share of the precious metal by weight. metal = the spot price that sets the cost (ISO 4217 codes).
   Densities in g/cm³. Those marked 'palloys' are from Palloys' casting alloy chart; 'typical' ones are common
   trade figures to check against that chart (white and rose vary by recipe). */
const Alloys = (() => {
  const TROY_OUNCE_G = 31.1034768;
  const ALLOYS = [
    { key: '9y', name: '9ct yellow gold', group: '9ct', colour: 'Yellow', metal: 'XAU', fineness: 0.375, density: 11.3, source: 'typical' },
    { key: '9w', name: '9ct white gold', group: '9ct', colour: 'White', metal: 'XAU', fineness: 0.375, density: 11.6, source: 'typical' },
    { key: '9r', name: '9ct rose gold', group: '9ct', colour: 'Rose', metal: 'XAU', fineness: 0.375, density: 11.2, source: 'typical' },
    { key: '14y', name: '14ct yellow gold', group: '14ct', colour: 'Yellow', metal: 'XAU', fineness: 0.585, density: 13.4, source: 'palloys' },
    { key: '14w', name: '14ct white gold', group: '14ct', colour: 'White', metal: 'XAU', fineness: 0.585, density: 14.0, source: 'typical' },
    { key: '14r', name: '14ct rose gold', group: '14ct', colour: 'Rose', metal: 'XAU', fineness: 0.585, density: 13.3, source: 'typical' },
    { key: '18y', name: '18ct yellow gold', group: '18ct', colour: 'Yellow', metal: 'XAU', fineness: 0.75, density: 15.5, source: 'typical' },
    { key: '18w', name: '18ct white gold', group: '18ct', colour: 'White', metal: 'XAU', fineness: 0.75, density: 16.1, source: 'palloys' },
    { key: '18r', name: '18ct rose gold', group: '18ct', colour: 'Rose', metal: 'XAU', fineness: 0.75, density: 15.2, source: 'typical' },
    { key: 'ag925', name: 'Sterling silver', group: 'Sterling silver', colour: null, metal: 'XAG', fineness: 0.925, density: 10.39, source: 'palloys' },
    { key: 'pt950', name: 'Platinum 950', group: 'Platinum 950', colour: null, metal: 'XPT', fineness: 0.95, density: 20.7, source: 'typical' },
  ];
  const byKey = (key) => ALLOYS.find((a) => a.key === key) || null;
  const weightGrams = (volumeMm3, alloy) => (volumeMm3 / 1000) * alloy.density;
  return { TROY_OUNCE_G, ALLOYS, byKey, weightGrams };
})();
if (typeof module !== 'undefined') module.exports = Alloys;

/* Chains offered with a name necklace. Not secret: the page uses them for the drawing and the weight, the price
   server for the cost. Each style comes in three gauges (Fine, Medium, Heavy); Medium is the gauge every style
   had at first, so its price did not move when the others were added. The weight per centimetre comes from the
   link geometry (wire diameter, link outside size) and the alloy's density, so a chain is priced the same way as
   the plate: metal weight x cost per gram x markup. Fine and Heavy are Medium scaled by width; check every gauge
   against a real chain off the shelf and correct the link sizes here if they drift.
     width  the chain's width as the trade names it ("1.2 mm cable")
     wire   the wire diameter
     link   the link's outside length and width (a belcher link is round)
     pitch  how far the chain advances per link: links interlock, so it is the link length less two wire widths */
const Chains = (() => {
  const GAUGES = [
    { key: 'fine', name: 'Fine' },
    { key: 'medium', name: 'Medium' },
    { key: 'heavy', name: 'Heavy' },
  ];
  const STYLES = [
    { key: 'cable', name: 'Cable', note: 'Fine oval links, the classic for a nameplate', gauges: {
      fine: { width: 1.0, wire: 0.25, link: [1.83, 1.0] },
      medium: { width: 1.2, wire: 0.30, link: [2.2, 1.2] },
      heavy: { width: 1.6, wire: 0.40, link: [2.93, 1.6] },
    } },
    { key: 'belcher', name: 'Belcher', note: 'Round links, a little heavier', gauges: {
      fine: { width: 1.3, wire: 0.35, link: [1.3, 1.3] },
      medium: { width: 1.5, wire: 0.40, link: [1.5, 1.5] },
      heavy: { width: 2.0, wire: 0.53, link: [2.0, 2.0] },
    } },
    { key: 'curb', name: 'Curb', note: 'Flat twisted links that lie close', gauges: {
      fine: { width: 1.5, wire: 0.38, link: [2.17, 1.5] },
      medium: { width: 1.8, wire: 0.45, link: [2.6, 1.8] },
      heavy: { width: 2.2, wire: 0.55, link: [3.18, 2.2] },
    } },
  ];
  // A bare style carries its Medium figures too, so code that predates gauges keeps working.
  for (const s of STYLES) Object.assign(s, s.gauges.medium);
  const LENGTHS_CM = [40, 45, 50];
  const DEFAULT = { style: 'cable', gauge: 'medium', lengthCm: 45 };
  // Alloys a chain comes in: every cast alloy except platinum.
  const EXCLUDED_ALLOYS = ['pt950'];
  const byKey = (key) => STYLES.find((s) => s.key === key) || null;
  const gaugeByKey = (key) => GAUGES.find((g) => g.key === key) || null;
  // One style in one gauge: { key, name, note, gauge, gaugeName, width, wire, link }, or null for an unknown pair.
  function spec(style, gauge = DEFAULT.gauge) {
    const s = typeof style === 'string' ? byKey(style) : style, g = gaugeByKey(gauge);
    if (!s || !g || !s.gauges[g.key]) return null;
    return Object.assign({ key: s.key, name: s.name, note: s.note, gauge: g.key, gaugeName: g.name }, s.gauges[g.key]);
  }
  // Ramanujan's approximation of an ellipse's perimeter, here the wire's centre line.
  const perimeter = (a, b) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  // Wire volume in one link, mm³. s is a spec (a bare style counts as its Medium gauge).
  const linkVolume = (s) => perimeter((s.link[0] - s.wire) / 2, (s.link[1] - s.wire) / 2) * Math.PI * (s.wire / 2) ** 2;
  const pitch = (s) => s.link[0] - 2 * s.wire;
  const volumePerCm = (s) => linkVolume(s) * (10 / pitch(s));
  // Grams of a length of chain in an alloy (alloy as in alloys.js, with a density in g/cm³).
  const weightGrams = (s, lengthCm, alloy) => (volumePerCm(s) * lengthCm / 1000) * alloy.density;
  const chainAlloys = (alloys) => alloys.filter((a) => !EXCLUDED_ALLOYS.includes(a.key));
  return { STYLES, GAUGES, LENGTHS_CM, DEFAULT, EXCLUDED_ALLOYS, byKey, gaugeByKey, spec, linkVolume, pitch, volumePerCm, weightGrams, chainAlloys };
})();
if (typeof module !== 'undefined') module.exports = Chains;

/* Nameplate: name necklace geometry. Font -> outline -> union -> loops -> checks -> mesh.
   No DOM, runs in Node too. Units: millimetres, y up. Clipper works in integers at SCALE units per mm. */
const Nameplate = (() => {
  const CL = typeof ClipperLib !== 'undefined' ? ClipperLib : require('clipper-lib');
  const triangulate = typeof earcut !== 'undefined' ? earcut : require('earcut');
  const IO = typeof StlIO !== 'undefined' ? StlIO : require('../../shared/stl-io.js');

  // Limits from our CAD designer's review (Oct 2026). Strokes narrower than the minimum are flagged, and
  // reinforcement widens them to it: 0.8 mm as cast, 1.0 mm from 16 mm high up (long, delicate letters bend in
  // wear). Casting clean-up can take up to 0.2 mm, so less than this doesn't last. The bold fonts are already wider.
  const MIN_FEATURE = 0.8;       // mm
  const MIN_FEATURE_LARGE = 1.0; // mm, for names LARGE_FROM high and up
  const LARGE_FROM = 16;         // mm
  const minFeatureFor = (height) => (height >= LARGE_FROM - 1e-9 ? MIN_FEATURE_LARGE : MIN_FEATURE);
  const REINFORCE_STEP = 0.1;  // mm: each reinforcement pass widens the thin parts by this much per side
  const REINFORCE_PASSES = 8;  // enough for a hairline to reach the minimum
  const REINFORCE_SMOOTH = 0.04; // mm: closing radius that rounds off the joins after widening
  const MIN_LOOP_WALL = 0.6;   // mm: (outer - hole) / 2. Loops are wire, not lettering: they have their own minimum.
  // Standard loops by chain thickness (CAD review): 0.7 mm wire with a 1.0 mm hole takes a fine or medium chain's
  // jump ring; a heavy chain gets 0.8 mm wire with a 1.4 mm hole. Customers don't choose; staff can override.
  const LOOP_SIZES = { fine: { outer: 2.4, hole: 1.0 }, medium: { outer: 2.4, hole: 1.0 }, heavy: { outer: 3.0, hole: 1.4 } };
  const loopSizeFor = (gauge) => Object.assign({}, LOOP_SIZES[gauge] || LOOP_SIZES.medium);
  const LOOP_HEIGHT = 0.67;    // loops sit two-thirds of the way up the end letters, so a flat pendant doesn't flip
  const LOOP_MIN_JOIN = 0.1;   // mm: a loop always overlaps the outline by at least this, so overlap 0 can't leave it touching at a point
  const MIN_JOIN_AREA = 0.002; // mm²: two neighbouring letters sharing less than this don't count as joined
  const MAX_JOIN_MOVE = 4;     // mm: auto-join moves a dot, accent or stray stroke at most this far onto its letter
  const CRUMB = 1e-4;          // mm²: a piece smaller than this is a numerical speck from the union (where a joined dot meets its stem), not metal

  const SCALE = 1e5;           // Clipper units per mm (1 unit = 10 nm)
  const MAX_CHARS = 14;
  const SCANLINES = 200;
  const SPACE_GAP = 0.6;       // a run of spaces becomes one gap of this x the font's space advance
  const HEIGHTS = { small: 8, medium: 12, large: 16 };
  const HEIGHT_RANGE = [6, 25];
  const THICKNESSES = [0.8, 1.0, 1.2, 1.5, 2.0];
  const OVERLAP_RANGE = [0.1, 1]; // mm; 0.1 like LOOP_MIN_JOIN: at 0 letters only touch at a point and cast apart
  const LOOP_OUTER_RANGE = [2.4, 5];
  const LOOP_HOLE_RANGE = [1.0, 2.5];
  const SCALE_RANGE = [0.5, 2];
  const CURVE_RANGE = [-180, 180]; // degrees of arc the name bends through
  const DETAIL = { draft: 0.03, standard: 0.01, fine: 0.005 }; // curve tolerance, mm

  // The fonts, in the order the page lists them (formal to bold). A retired font is no longer offered to customers
  // but still builds, so orders made in it can be reviewed and revised.
  const FONTS = [
    { key: 'greatvibes', name: 'Great Vibes', file: 'greatvibes/GreatVibes-Regular.ttf', style: 'Formal script' },
    { key: 'allura', name: 'Allura', file: 'allura/Allura-Regular.ttf', style: 'Formal script' },
    { key: 'parisienne', name: 'Parisienne', file: 'parisienne/Parisienne-Regular.ttf', style: 'Formal script' },
    { key: 'alexbrush', name: 'Alex Brush', file: 'alexbrush/AlexBrush-Regular.ttf', style: 'Brush script' },
    { key: 'norican', name: 'Norican', file: 'norican/Norican-Regular.ttf', style: 'Bold elegant script' },
    { key: 'dancingscript', name: 'Dancing Script', file: 'dancingscript/DancingScript[wght].ttf', style: 'Casual script' },
    { key: 'cookie', name: 'Cookie', file: 'cookie/Cookie-Regular.ttf', style: 'Soft handwriting' },
    { key: 'playball', name: 'Playball', file: 'playball/Playball-Regular.ttf', style: 'Sporty script' },
    { key: 'damion', name: 'Damion', file: 'damion/Damion-Regular.ttf', style: 'Bold casual script' },
    { key: 'pacifico', name: 'Pacifico', file: 'pacifico/Pacifico-Regular.ttf', style: 'Bold retro script' },
    { key: 'leckerlione', name: 'Leckerli One', file: 'leckerlione/LeckerliOne-Regular.ttf', style: 'Chunky script' },
    { key: 'luckiestguy', name: 'Luckiest Guy', file: 'luckiestguy/LuckiestGuy-Regular.ttf', style: 'Chunky display', retired: true },
  ];
  const fontMeta = (key) => FONTS.find((f) => f.key === key) || FONTS[0];

  const defaultLetter = () => ({ dx: 0, dy: 0, rot: 0, scale: 1 });
  function defaultDesign() {
    return {
      version: 1, text: 'Charlotte', font: 'greatvibes', height: 12, thickness: 1.2, overlap: 0.3,
      loops: { outer: 2.4, hole: 1.0, left: { on: true, dx: 0, dy: 0 }, right: { on: true, dx: 0, dy: 0 } },
      dots: 'keep', curve: 0, finish: 'polished', reinforce: true, letters: [],
    };
  }
  const isSpace = (ch) => /\s/.test(ch);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---------- small geometry helpers ---------- */

  const toInt = (path) => path.map(([x, y]) => ({ X: Math.round(x * SCALE), Y: Math.round(y * SCALE) }));
  const toFloat = (path) => path.map((p) => [p.X / SCALE, p.Y / SCALE]);
  const intArea = (path) => CL.Clipper.Area(path);

  function bboxOf(paths) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of paths) for (const [x, y] of p) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
  }
  const mapPaths = (paths, f) => paths.map((p) => p.map(([x, y]) => f(x, y)));

  function distToSeg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / Math.sqrt(l2);
  }

  // Adaptive subdivision: split until the curve's midpoint is within tol of the chord.
  // Cubics always split once first, since an S-curve's midpoint can sit on its chord.
  function subdivide(f, t0, a, t1, b, tol, depth, minDepth, push) {
    const tm = (t0 + t1) / 2, m = f(tm);
    if (depth >= minDepth && (depth >= 16 || distToSeg(m, a, b) <= tol)) { push(b); return; }
    subdivide(f, t0, a, tm, m, tol, depth + 1, minDepth, push);
    subdivide(f, tm, m, t1, b, tol, depth + 1, minDepth, push);
  }

  // opentype path commands (y down) -> closed contours (y up), duplicates and closing points dropped.
  function flatten(cmds, tol) {
    const out = [];
    let cur = null, sx = 0, sy = 0, px = 0, py = 0;
    const push = (p) => cur.push(p);
    const start = () => { if (!cur) { cur = [[px, py]]; sx = px; sy = py; } };
    const close = () => { if (cur && cur.length > 2) out.push(cur); cur = null; };
    for (const c of cmds) {
      if (c.type === 'M') { close(); px = c.x; py = c.y; start(); }
      else if (c.type === 'L') { start(); px = c.x; py = c.y; push([px, py]); }
      else if (c.type === 'Q') {
        start();
        const x0 = px, y0 = py;
        const f = (t) => { const u = 1 - t; return [u * u * x0 + 2 * u * t * c.x1 + t * t * c.x, u * u * y0 + 2 * u * t * c.y1 + t * t * c.y]; };
        subdivide(f, 0, [x0, y0], 1, [c.x, c.y], tol, 0, 0, push);
        px = c.x; py = c.y;
      } else if (c.type === 'C') {
        start();
        const x0 = px, y0 = py;
        const f = (t) => {
          const u = 1 - t, a = u * u * u, b = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t;
          return [a * x0 + b * c.x1 + d * c.x2 + e * c.x, a * y0 + b * c.y1 + d * c.y2 + e * c.y];
        };
        subdivide(f, 0, [x0, y0], 1, [c.x, c.y], tol, 0, 1, push);
        px = c.x; py = c.y;
      } else if (c.type === 'Z') { close(); px = sx; py = sy; }
    }
    close();
    return out.map((contour) => {
      const pts = [];
      for (const [x, y] of contour) {
        const last = pts[pts.length - 1];
        if (!last || Math.abs(last[0] - x) > 1e-9 || Math.abs(last[1] + y) > 1e-9) pts.push([x, -y]);
      }
      const f0 = pts[0], fl = pts[pts.length - 1];
      if (pts.length > 1 && Math.abs(f0[0] - fl[0]) <= 1e-9 && Math.abs(f0[1] - fl[1]) <= 1e-9) pts.pop();
      return pts;
    }).filter((p) => p.length > 2);
  }

  function clip(subject, clipPaths, type, { tree = false, strict = false } = {}) {
    const c = new CL.Clipper();
    c.StrictlySimple = strict;
    c.AddPaths(subject, CL.PolyType.ptSubject, true);
    if (clipPaths && clipPaths.length) c.AddPaths(clipPaths, CL.PolyType.ptClip, true);
    const out = tree ? new CL.PolyTree() : new CL.Paths();
    c.Execute(type, out, CL.PolyFillType.pftNonZero, CL.PolyFillType.pftNonZero);
    return out;
  }
  const unionInt = (paths, opts) => clip(paths, null, CL.ClipType.ctUnion, opts);

  function offsetInt(paths, delta, arcTol) {
    const co = new CL.ClipperOffset(2, arcTol);
    co.AddPaths(paths, CL.JoinType.jtRound, CL.EndType.etClosedPolygon);
    const out = new CL.Paths();
    co.Execute(out, delta);
    return out;
  }

  // PolyTree -> [{ outer, holes }] with outers CCW (positive area) and holes CW. One group per solid piece.
  function treeGroups(tree) {
    const groups = [];
    const addOuter = (node) => {
      const g = { outer: node.Contour(), holes: [] };
      if (intArea(g.outer) < 0) g.outer = g.outer.slice().reverse();
      for (const h of node.Childs()) {
        let hc = h.Contour();
        if (intArea(hc) > 0) hc = hc.slice().reverse();
        g.holes.push(hc);
        for (const inner of h.Childs()) addOuter(inner);
      }
      g.area = (intArea(g.outer) + g.holes.reduce((s, h) => s + intArea(h), 0)) / (SCALE * SCALE);
      groups.push(g);
    };
    for (const n of tree.Childs()) addOuter(n);
    return groups;
  }

  // Contours that meet at a single point (StrictlySimple splits them there) would share a vertical edge in the
  // STL, which slicers read as non-manifold. Pull every shared vertex 0.2 µm into its own material, so the
  // contours no longer touch. Holes run clockwise, so the material is on the left of every ring.
  const PINCH_NUDGE = 20; // Clipper units: 0.2 µm, still distinct after float32 rounding at 1 m
  function separateTouching(groups) {
    const seen = new Map();
    for (const g of groups) for (const ring of [g.outer, ...g.holes]) for (const p of ring) {
      const k = p.X + ',' + p.Y;
      seen.set(k, (seen.get(k) || 0) + 1);
    }
    const shared = new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
    if (!shared.size) return;
    const nudge = (ring) => ring.map((v, i) => {
      if (!shared.has(v.X + ',' + v.Y)) return v;
      const a = ring[(i - 1 + ring.length) % ring.length], b = ring[(i + 1) % ring.length];
      const e1x = v.X - a.X, e1y = v.Y - a.Y, e2x = b.X - v.X, e2y = b.Y - v.Y;
      const l1 = Math.hypot(e1x, e1y) || 1, l2 = Math.hypot(e2x, e2y) || 1;
      let nx = -e1y / l1 - e2y / l2, ny = e1x / l1 + e2x / l2;
      let l = Math.hypot(nx, ny);
      if (l < 1e-6) { nx = -e1y / l1; ny = e1x / l1; l = 1; }
      return { X: v.X + Math.round((PINCH_NUDGE * nx) / l), Y: v.Y + Math.round((PINCH_NUDGE * ny) / l) };
    });
    for (const g of groups) {
      g.outer = nudge(g.outer);
      g.holes = g.holes.map(nudge);
      g.area = (intArea(g.outer) + g.holes.reduce((s, h) => s + intArea(h), 0)) / (SCALE * SCALE);
    }
  }

  function circle(cx, cy, r, tol) {
    const n = Math.max(48, Math.ceil(Math.PI / Math.acos(Math.max(-1, 1 - Math.min(tol, r) / r))));
    const rr = r * Math.sqrt((2 * Math.PI) / (n * Math.sin((2 * Math.PI) / n))); // same area as the true circle
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (2 * Math.PI * (i + 0.5)) / n; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    return pts;
  }

  function pointInPaths(paths, x, y) { // even-odd
    let inside = false;
    for (const p of paths) {
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const [xi, yi] = p[i], [xj, yj] = p[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
    }
    return inside;
  }

  // Leftmost and rightmost x of a shape along a horizontal line, or null if the line misses it.
  function extentsAt(paths, y) {
    let lo = Infinity, hi = -Infinity;
    for (const p of paths) {
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const a = p[j], b = p[i];
        if ((a[1] <= y) !== (b[1] <= y)) {
          const x = a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
          if (x < lo) lo = x; if (x > hi) hi = x;
        }
      }
    }
    return lo <= hi ? [lo, hi] : null;
  }

  // Smallest horizontal gap from prev to cur over the height band they share (negative = overlapping).
  function minGap(prev, cur) {
    const lo = Math.max(prev.bbox.minY, cur.bbox.minY), hi = Math.min(prev.bbox.maxY, cur.bbox.maxY);
    let best = Infinity;
    if (hi > lo) {
      for (let k = 0; k < SCANLINES; k++) {
        const y = lo + ((k + 0.5) / SCANLINES) * (hi - lo);
        const a = extentsAt(prev.paths, y), b = extentsAt(cur.paths, y);
        if (a && b && b[0] - a[1] < best) best = b[0] - a[1];
      }
    }
    return Number.isFinite(best) ? best : cur.bbox.minX - prev.bbox.maxX;
  }

  // Area shared by two shapes after moving the second one dx along x, in mm².
  function touchArea(a, b, dx) {
    const out = clip(a.map(toInt), b.map((p) => toInt(p.map(([x, y]) => [x + dx, y]))), CL.ClipType.ctIntersection);
    return out.reduce((s, p) => s + intArea(p), 0) / (SCALE * SCALE);
  }

  // Split long edges so they bend smoothly when curved (a chord of length L on radius r bows out by L²/8r).
  function densify(path, maxSeg) {
    const out = [];
    for (let i = 0; i < path.length; i++) {
      const a = path[i], b = path[(i + 1) % path.length];
      out.push(a);
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / maxSeg);
      for (let k = 1; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
    }
    return out;
  }

  // Arc warp for a curve of `degrees` (positive: ends rise, a smile; negative: an arch). The middle line of the
  // name keeps its length; the arc is limited so its radius is at least the name's height, so nothing folds over.
  function curveFor(letters, degrees, tol) {
    const b = bboxOf(letters.flatMap((l) => l.paths.concat(l.dotPaths)));
    const W = b.maxX - b.minX, h = b.maxY - b.minY;
    const maxDegrees = Math.min(CURVE_RANGE[1], Math.floor(((W / h) * 180) / Math.PI));
    const want = clamp(degrees, -maxDegrees, maxDegrees);
    const none = { warp: null, degrees: 0, limited: false, maxDegrees, angleAt: () => 0 };
    if (Math.abs(want) < 0.01 || !(W > 0)) return Object.assign(none, { limited: Math.abs(degrees) > maxDegrees });
    const phi = (Math.abs(want) * Math.PI) / 180, R = W / phi, sign = Math.sign(want);
    const xc = (b.minX + b.maxX) / 2, yc = (b.minY + b.maxY) / 2;
    return {
      degrees: want, limited: Math.abs(degrees) > maxDegrees, maxDegrees,
      maxSeg: Math.max(0.05, Math.sqrt(8 * (R - h / 2) * tol)),
      angleAt: (x) => (sign * (x - xc)) / R,
      warp(x, y) {
        const t = (x - xc) / R, rad = R - sign * (y - yc);
        return [xc + rad * Math.sin(t), yc + sign * (R - rad * Math.cos(t))];
      },
    };
  }

  /* ---------- glyph outlines ---------- */

  const glyphCache = new WeakMap(); // font -> Map(key -> groups in mm)
  function glyphGroups(font, glyph, tolFU, k) {
    let cache = glyphCache.get(font);
    if (!cache) { cache = new Map(); glyphCache.set(font, cache); }
    const key = `${glyph.index}|${tolFU.toPrecision(6)}|${k.toPrecision(9)}`;
    if (cache.has(key)) return cache.get(key);
    const contours = flatten(glyph.getPath(0, 0, font.unitsPerEm).commands, tolFU);
    const ints = contours.map((c) => toInt(c.map(([x, y]) => [x * k, y * k])));
    const groups = treeGroups(unionInt(ints, { tree: true })).map((g) => {
      const paths = [toFloat(g.outer), ...g.holes.map(toFloat)];
      return { paths, area: g.area, bbox: bboxOf(paths) };
    });
    if (cache.size > 600) cache.clear();
    cache.set(key, groups);
    return groups;
  }

  // An island is an i/j dot if it is small and sits in the upper half of the letter's main body.
  function splitDots(groups) {
    if (groups.length < 2) return { keep: groups, dots: [] };
    const main = groups.reduce((m, g) => (g.area > m.area ? g : m));
    const mid = main.bbox.minY + 0.5 * (main.bbox.maxY - main.bbox.minY);
    const keep = [], dots = [];
    for (const g of groups) {
      if (g !== main && g.area < 0.35 * main.area && g.bbox.minY > mid) dots.push(g); else keep.push(g);
    }
    return { keep, dots };
  }

  /* ---------- the pipeline ---------- */

  function loopWallError(outer, hole) {
    const wall = (outer - hole) / 2;
    if (wall + 1e-9 < MIN_LOOP_WALL) {
      return `The loop wall is ${wall.toFixed(2).replace(/0$/, '')} mm. Make the outer bigger or the hole smaller (minimum ${MIN_LOOP_WALL} mm).`;
    }
    return null;
  }

  function missingMessage(chars, fontName) {
    const list = chars.length === 1 ? chars[0] : chars.slice(0, -1).join(', ') + ' and ' + chars[chars.length - 1];
    return chars.length === 1
      ? `${list} isn't in ${fontName}. Choose another font or remove it.`
      : `${list} aren't in ${fontName}. Choose another font or remove them.`;
  }

  // Closest pair of points between two sets of float paths (vertex to segment, both ways): { d, pa, pb }.
  function nearestPair(a, b) {
    let best = { d: Infinity, pa: null, pb: null };
    const scan = (P, Q, swap) => {
      for (const p of P) for (const pt of p) for (const q of Q) {
        for (let i = 0; i < q.length; i++) {
          const s = q[i], e = q[(i + 1) % q.length], ex = e[0] - s[0], ey = e[1] - s[1], l2 = ex * ex + ey * ey;
          const t = l2 ? clamp(((pt[0] - s[0]) * ex + (pt[1] - s[1]) * ey) / l2, 0, 1) : 0;
          const cx = s[0] + t * ex, cy = s[1] + t * ey, d = Math.hypot(pt[0] - cx, pt[1] - cy);
          if (d < best.d) best = swap ? { d, pa: [cx, cy], pb: pt } : { d, pa: pt, pb: [cx, cy] };
        }
      }
    };
    scan(a, b, false);
    scan(b, a, true);
    return best;
  }
  // Heights where a vertical line at x crosses a set of float paths.
  function yHits(paths, x) {
    const ys = [];
    for (const p of paths) for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const a = p[j], b = p[i];
      if ((a[0] <= x) !== (b[0] <= x)) ys.push(a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0]));
    }
    return ys;
  }
  // How far `a` can drop straight down before it meets `b` (Infinity if nothing of b lies below it).
  function dropGap(a, b) {
    const ba = bboxOf(a), bb = bboxOf(b), lo = Math.max(ba.minX, bb.minX), hi = Math.min(ba.maxX, bb.maxX);
    let best = Infinity;
    for (let k = 0; hi > lo && k < 120; k++) {
      const x = lo + ((k + 0.5) / 120) * (hi - lo), ya = yHits(a, x), yb = yHits(b, x);
      if (!ya.length || !yb.length) continue;
      const bottom = Math.min(...ya), below = yb.filter((y) => y <= bottom + 1e-9);
      if (below.length) best = Math.min(best, bottom - Math.max(...below));
    }
    return best;
  }
  const sharedArea = (a, b) => (a.length && b.length ? clip(a.map(toInt), b.map(toInt), CL.ClipType.ctIntersection).reduce((s, p) => s + Math.abs(intArea(p)), 0) / (SCALE * SCALE) : 0);

  // Step 7c of build. Every glyph island (a letter's main stroke, each extra stroke, each kept dot or accent) is a
  // part; parts sharing more than MIN_JOIN_AREA are connected. The cluster with the most metal is the anchor.
  // Each other cluster, smallest first, moves along the shortest line to its own letters' parts in the anchor
  // (so a dot lands on its own stem) by the gap plus `depth`, and up to 0.5 mm further if two thin strokes
  // would only graze, then joins the anchor. Never a whole letter, and at most MAX_JOIN_MOVE. A graze
  // that StrictlySimple would keep as one piece still counts as apart, since the curve or the casting can open
  // it. Returns what moved:
  // [{ index, ch, kind: 'dot' | 'part' | 'body', mm }] (index and ch of the moved cluster's first letter).
  function autoJoin(letters, depth) {
    const parts = [];
    letters.forEach((l) => {
      l.pathGroups.forEach((idx, gi) => parts.push({ l, key: 'paths', idx, kind: gi === l.mainGroup ? 'body' : 'part' }));
      l.dotGroups.forEach((idx) => parts.push({ l, key: 'dotPaths', idx, kind: 'dot' }));
    });
    if (parts.length < 2) return [];
    const pathsOf = (p) => p.idx.map((i) => p.l[p.key][i]);
    const areaOf = (paths) => Math.abs(paths.reduce((s, q) => s + intArea(toInt(q)), 0)) / (SCALE * SCALE);
    const near = (a, b) => a.minX <= b.maxX + 1e-6 && b.minX <= a.maxX + 1e-6 && a.minY <= b.maxY + 1e-6 && b.minY <= a.maxY + 1e-6;
    for (const p of parts) { p.bbox = bboxOf(pathsOf(p)); p.area = areaOf(pathsOf(p)); }
    // Union-find over parts.
    const up = parts.map((_, i) => i);
    const find = (i) => (up[i] === i ? i : (up[i] = find(up[i])));
    // Strokes of two different letters count as joined on any overlap: spacing (step 6) put them together and
    // the union makes them one piece, even where the touch is a sliver at a pointed terminal (Parisienne K's leg on
    // an "a"). A dot, an accent or a letter's own stroke has to really overlap, or it is moved in properly.
    const minShared = (a, b) => (a.l !== b.l && a.kind !== 'dot' && b.kind !== 'dot' ? 0 : MIN_JOIN_AREA);
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      if (find(i) !== find(j) && near(parts[i].bbox, parts[j].bbox) && sharedArea(pathsOf(parts[i]), pathsOf(parts[j])) > minShared(parts[i], parts[j])) up[find(i)] = find(j);
    }
    const joins = [];
    for (let guard = 0; guard < parts.length; guard++) {
      const comps = new Map();
      parts.forEach((p, i) => { const r = find(i); if (!comps.has(r)) comps.set(r, []); comps.get(r).push(i); });
      if (comps.size < 2) break;
      const list = [...comps.values()].map((ids) => ({ ids, area: ids.reduce((s, i) => s + parts[i].area, 0) }));
      list.sort((a, b) => b.area - a.area);
      // A cluster moves only when every letter in it already has a part in the anchor, so islands move (a dot,
      // an accent, a stray stroke, or two of them touching each other) but never a whole letter: one that didn't
      // join its neighbour is a spacing problem and stays where it is (the piece is then reported loose).
      const anchor = list[0];
      const inAnchor = new Set(anchor.ids.map((i) => parts[i].l));
      const movable = list.slice(1).filter((c) => c.ids.every((i) => !parts[i].stuck && inAnchor.has(parts[i].l)));
      if (!movable.length) break;
      const mover = movable[movable.length - 1];
      const moverLetters = new Set(mover.ids.map((i) => parts[i].l));
      const target = anchor.ids.filter((i) => moverLetters.has(parts[i].l)).flatMap((i) => pathsOf(parts[i]));
      const own = mover.ids.flatMap((i) => pathsOf(parts[i]));
      let { d, pa, pb } = nearestPair(own, target);
      // A dot or accent drops straight down onto its letter when that is nearly as short as the nearest way in,
      // so the two dots of an umlaut each land on their own spot rather than sliding together.
      const drop = dropGap(own, target);
      if (d > 1e-4 && drop <= MAX_JOIN_MOVE && drop <= 1.5 * d + 0.3) { d = drop; pa = [0, 0]; pb = [0, -1]; }
      else if (!(d > 1e-4)) {
        // Grazing already: head from the cluster's centre to the nearest point of the target instead.
        const b = bboxOf(own), c = [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2];
        ({ pb } = nearestPair([[c]], target)); pa = c; d = 0;
      }
      if (d > MAX_JOIN_MOVE) { mover.ids.forEach((i) => { parts[i].stuck = true; }); continue; } // too far to be its own mark
      const len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1, ux = (pb[0] - pa[0]) / len, uy = (pb[1] - pa[1]) / len;
      let step = 0;
      for (let extra = 0; extra <= 0.5 + 1e-9; extra += 0.05) {
        step = d + depth + extra;
        const s = step;
        if (sharedArea(mapPaths(own, (x, y) => [x + ux * s, y + uy * s]), target) > MIN_JOIN_AREA) break;
      }
      for (const i of mover.ids) {
        const p = parts[i];
        p.idx.forEach((k) => { p.l[p.key][k] = p.l[p.key][k].map(([x, y]) => [x + ux * step, y + uy * step]); });
        p.bbox = bboxOf(pathsOf(p));
        up[find(i)] = find(anchor.ids[0]);
      }
      const first = parts[mover.ids[0]];
      joins.push({ index: first.l.index, ch: first.l.ch, kind: first.kind, mm: +step.toFixed(3) });
    }
    for (const l of letters) l.bbox = bboxOf(l.paths);
    return joins;
  }

  // design: see defaultDesign(). opts: { detail: 'draft'|'standard'|'fine', fontName, checks: true }
  function build(font, design, opts = {}) {
    // Letters always overlap a little: at 0 they only touch at a point and would cast apart.
    design = Object.assign({}, design, { overlap: clamp(Number(design.overlap) || 0, OVERLAP_RANGE[0], OVERLAP_RANGE[1]) });
    const tol = DETAIL[opts.detail] || DETAIL.standard;
    const fontName = opts.fontName || fontMeta(design.font).name;
    const chars = Array.from(design.text || '');
    const fail = (code, message, extra) => ({ ok: false, error: Object.assign({ code, message }, extra) });
    if (!chars.some((c) => !isSpace(c))) return fail('empty', 'Type a name to start.');
    if (chars.length > MAX_CHARS) return fail('too-long', `Names can be up to ${MAX_CHARS} characters.`);
    // One word per necklace: a second word would be a separate piece, and there is no editor to join it.
    if (/\s/.test((design.text || '').trim())) return fail('space', 'One word per necklace. Take out the space.');

    // 1. Glyphs, one per character so per-letter edits line up with the name.
    const items = chars.map((ch, index) => (isSpace(ch) ? { index, ch, space: true } : { index, ch, glyph: font.charToGlyph(ch) }));
    const missing = [...new Set(items.filter((it) => it.glyph && it.glyph.index === 0).map((it) => it.ch))];
    if (missing.length) return fail('missing-glyph', missingMessage(missing, fontName), { chars: missing });

    // Provisional font-units -> mm scale from the glyph metrics, so curves flatten at the right tolerance in mm.
    let yMin = Infinity, yMax = -Infinity;
    for (const it of items) if (it.glyph) {
      const m = it.glyph.getMetrics();
      if (Number.isFinite(m.yMin) && Number.isFinite(m.yMax) && m.yMax > m.yMin) { yMin = Math.min(yMin, m.yMin); yMax = Math.max(yMax, m.yMax); }
    }
    if (!(yMax > yMin)) return fail('empty', 'These characters have no outline to make.');
    const k0 = design.height / (yMax - yMin);

    // 2-3. Flatten and clean each glyph; take out i/j dots if asked.
    const letters = [];
    let pen = 0, prevGlyph = null, pendingSpace = false;
    for (const it of items) {
      if (it.space) { if (letters.length) pendingSpace = true; prevGlyph = null; continue; }
      if (prevGlyph) pen += font.getKerningValue(prevGlyph, it.glyph) * k0;
      // Dots are kept apart from the letter body: spacing ignores them, and "Remove" drops them.
      let groups = glyphGroups(font, it.glyph, tol / k0, k0), dots = [];
      if (it.ch === 'i' || it.ch === 'j') ({ keep: groups, dots } = splitDots(groups));
      if (groups.length) {
        // Which paths make up which island, so step 7c can move an island that stands apart (index lists into
        // l.paths and l.dotPaths; every later transform keeps the paths in order).
        const kept = design.dots === 'remove' ? [] : dots;
        const indexGroups = (gs) => { let n = 0; return gs.map((g) => g.paths.map(() => n++)); };
        const mainGroup = groups.reduce((m, g, i) => (g.area > groups[m].area ? i : m), 0);
        letters.push({ index: it.index, ch: it.ch, pen, afterSpace: pendingSpace, local: groups.flatMap((g) => g.paths), dotPaths: kept.flatMap((g) => g.paths), mainGroup, pathGroups: indexGroups(groups), dotGroups: indexGroups(kept) });
        pendingSpace = false;
      }
      pen += it.glyph.advanceWidth * k0;
      prevGlyph = it.glyph;
    }
    if (!letters.length) return fail('empty', 'These characters have no outline to make.');

    // 4. Scale so the outline is exactly the chosen height.
    const hb = bboxOf(letters.flatMap((l) => l.local.concat(l.dotPaths)));
    const r = design.height / (hb.maxY - hb.minY);
    const spaceGap = SPACE_GAP * font.charToGlyph(' ').advanceWidth * k0 * r;
    for (const l of letters) {
      l.local = mapPaths(l.local, (x, y) => [x * r, (y - hb.minY) * r]);
      l.dotPaths = mapPaths(l.dotPaths, (x, y) => [x * r, (y - hb.minY) * r]);
      l.pen *= r;
    }

    // 5. Per-letter rotate and scale about the letter's own box centre, then place at the pen position.
    for (const l of letters) {
      const adj = Object.assign(defaultLetter(), (design.letters || [])[l.index]);
      l.adj = adj;
      const b = bboxOf(l.local), cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
      const s = clamp(adj.scale, SCALE_RANGE[0], SCALE_RANGE[1]), a = (adj.rot * Math.PI) / 180;
      const ca = Math.cos(a) * s, sa = Math.sin(a) * s;
      const tf = (x, y) => { const u = x - cx, v = y - cy; return [cx + u * ca - v * sa + l.pen, cy + u * sa + v * ca]; };
      l.paths = mapPaths(l.local, tf);
      l.dotPaths = mapPaths(l.dotPaths, tf);
      l.bbox = bboxOf(l.paths);
    }

    // 5b. A letter drawn in separate strokes (Great Vibes K and Q, Allura F and T, Leckerli One K, P and R,
    // Parisienne F, K and T...) is joined into one piece first, the way step 7c joins an island: otherwise, next to a
    // hyphen or a capital mid-name ("Ava-Rose", "McKenzie"), its strokes can each join a different neighbour and
    // never each other, and the name casts in two. i/j dots and accents are left to step 7c.
    const prejoins = [];
    for (const l of letters) {
      if (l.pathGroups.length < 2) continue;
      const dotGroups = l.dotGroups;
      l.dotGroups = [];
      prejoins.push(...autoJoin([l], Math.max(design.overlap, LOOP_MIN_JOIN)));
      l.dotGroups = dotGroups;
    }

    // 6. Auto spacing: every neighbouring pair overlaps by exactly `overlap` at its closest point.
    const shiftLetter = (l, d) => {
      if (!d) return;
      l.paths = mapPaths(l.paths, (x, y) => [x + d, y]);
      l.dotPaths = mapPaths(l.dotPaths, (x, y) => [x + d, y]);
      l.bbox.minX += d; l.bbox.maxX += d;
    };
    // Guard: two hairline terminals can slide past each other without touching. If a pair doesn't
    // actually intersect at the set overlap, use the nearest overlap that joins it (smaller first).
    const pairs = [];
    let carried = 0;
    for (let i = 1; i < letters.length; i++) {
      const A = letters[i - 1], B = letters[i];
      shiftLetter(B, carried);
      const gap0 = minGap(A, B);
      let used = B.afterSpace ? -spaceGap : design.overlap;
      if (!B.afterSpace && design.overlap > 0 && touchArea(A.paths, B.paths, -used - gap0) <= MIN_JOIN_AREA) {
        const tries = [];
        for (let o = design.overlap - 0.05; o > 0.025; o -= 0.05) tries.push(o);
        for (let o = design.overlap + 0.05; o <= design.overlap + 0.5 + 1e-9; o += 0.05) tries.push(o);
        const hit = tries.find((o) => touchArea(A.paths, B.paths, -o - gap0) > MIN_JOIN_AREA);
        if (hit !== undefined) used = +hit.toFixed(2);
      }
      const d = -used - gap0;
      shiftLetter(B, d);
      carried += d;
      pairs.push({ a: A.index, b: B.index, overlap: B.afterSpace ? null : used, adjusted: !B.afterSpace && used !== design.overlap });
    }

    // 7. Per-letter move. An i/j dot can also move on its own, so it can be brought down to touch its letter.
    for (const l of letters) {
      const { dx, dy } = l.adj, dot = l.adj.dot || {};
      if (dx || dy) {
        l.paths = mapPaths(l.paths, (x, y) => [x + dx, y + dy]);
        l.bbox = bboxOf(l.paths);
      }
      const ddx = (dx || 0) + (dot.dx || 0), ddy = (dy || 0) + (dot.dy || 0);
      if (ddx || ddy) l.dotPaths = mapPaths(l.dotPaths, (x, y) => [x + ddx, y + ddy]);
    }

    // 7c. Auto-join. An island of a letter (an i/j dot, an accent, a stroke drawn apart as in some script
    // capitals) that doesn't already overlap the name moves straight toward the nearest point of its own letter
    // until it overlaps it by the letter overlap, so the piece always casts whole without any hand editing.
    const joins = prejoins.concat(autoJoin(letters, Math.max(design.overlap, LOOP_MIN_JOIN)));

    // 7b. Curve: bend the finished name along an arc. The warp is continuous and one-to-one, so every join
    // and every loose piece stays exactly as it was on the flat name.
    const curve = curveFor(letters, design.curve || 0, tol);
    if (curve.warp) {
      for (const l of letters) {
        const b = l.bbox;
        l.angle = curve.angleAt((b.minX + b.maxX) / 2);
        l.paths = l.paths.map((p) => densify(p, curve.maxSeg).map(([x, y]) => curve.warp(x, y)));
        l.dotPaths = l.dotPaths.map((p) => densify(p, curve.maxSeg).map(([x, y]) => curve.warp(x, y)));
        l.bbox = bboxOf(l.paths);
      }
    }

    // 8. Union all letters; StrictlySimple so no two contours meet at a single point.
    const allLetterPaths = letters.flatMap((l) => l.paths.concat(l.dotPaths)).map(toInt);
    const text = unionInt(allLetterPaths, { strict: true });
    const textF = text.map(toFloat);

    // 9. Reinforcement, when the design asks for it: the lettering's thin parts are widened to the minimum
    // (minFeatureFor(height)). Loops are added after, so their wire keeps its own size and holes stay open.
    const minW = minFeatureFor(design.height);
    let textInt = text, reinforced = null;
    if (design.reinforce) {
      const all = treeGroups(unionInt(text, { tree: true })).filter((g) => g.area > CRUMB).flatMap((g) => [g.outer, ...g.holes]);
      const r = reinforceThin(all, tol, minW);
      reinforced = { passes: r.passes, addedArea: r.addedArea };
      if (r.passes) textInt = r.paths;
    }

    // 9b. Loops on the upper part of the end letters (see placeLoop). Holes are cut last, so nothing fills them.
    const L = design.loops || {};
    const loopErr = loopWallError(L.outer, L.hole);
    const bodies = letters.filter((l) => l.paths.length && !isSpace(l.ch)).map((l) => ({ paths: l.paths, bbox: bboxOf(l.paths), angle: l.angle || 0 }));
    const loops = loopErr ? [] : loopsFor(textInt, bodies, L, design.overlap, tol);
    const tree = withLoops(textInt, loops);

    // 10. Pieces.
    const groups = treeGroups(tree).filter((g) => g.area > CRUMB);
    separateTouching(groups);
    groups.sort((a, b) => b.area - a.area);
    for (const g of groups) g.bbox = bboxOf([toFloat(g.outer)]);
    const area = groups.reduce((s, g) => s + g.area, 0);
    const bbox = groups.length ? bboxOf(groups.map((g) => toFloat(g.outer))) : { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const result = {
      ok: true, error: null, font: design.font, fontName, tol,
      curve: { degrees: curve.degrees, limited: curve.limited, maxDegrees: curve.maxDegrees },
      letters: letters.map((l) => ({ index: l.index, ch: l.ch, angle: l.angle || 0, paths: l.paths.concat(l.dotPaths), body: l.paths, dotPaths: l.dotPaths, bbox: bboxOf(l.paths.concat(l.dotPaths)), adj: l.adj })),
      pairs, loops, loopError: loopErr, groups, pieces: groups.length, area, bbox,
      width: bbox.maxX - bbox.minX, height: bbox.maxY - bbox.minY,
      loose: [], thin: [], thinArea: 0, reinforced, joins, minFeature: minW,
      // what areaWithLoops needs to try another loop size on the same lettering
      _lettering: { textInt, bodies, overlap: design.overlap },
    };

    // 11. Checks.
    result.loose = groups.slice(1).map((g, i) => describeLoose(result, g, i + 1));
    if (opts.checks !== false) Object.assign(result, thinCheck(groups, tol, minW, loops));
    return result;
  }

  // The loops for a design's loop settings on finished lettering (integer paths) whose letter bodies are known.
  function loopsFor(textInt, bodies, L, overlap, tol) {
    const loops = [];
    if (!textInt.length || !bodies.length) return loops;
    const join = Math.max(overlap, LOOP_MIN_JOIN);
    for (const side of ['left', 'right']) {
      const cfg = L[side];
      if (!cfg || !cfg.on) continue;
      const end = bodies.reduce((m, l) => (side === 'left' ? (l.bbox.minX < m.bbox.minX ? l : m) : (l.bbox.maxX > m.bbox.maxX ? l : m)));
      const c = placeLoop(side, end, textInt, L.outer / 2, L.hole / 2, join, tol);
      if (c) loops.push({ side, cx: c[0] + (cfg.dx || 0), cy: c[1] + (cfg.dy || 0), outer: L.outer, hole: L.hole });
    }
    for (const lp of loops) {
      lp.outerPath = circle(lp.cx, lp.cy, lp.outer / 2, tol);
      lp.holePath = circle(lp.cx, lp.cy, lp.hole / 2, tol);
    }
    return loops;
  }
  const withLoops = (textInt, loops) => clip(textInt.concat(loops.map((lp) => toInt(lp.outerPath))), loops.map((lp) => toInt(lp.holePath)), CL.ClipType.ctDifference, { tree: true, strict: true });
  // The plate's area (mm²) if it had other loops (e.g. the standard size for another chain thickness): the same
  // lettering, the loops placed again. For pricing every chain thickness from one build.
  function areaWithLoops(result, L) {
    const x = result && result._lettering;
    if (!x || loopWallError(L.outer, L.hole)) return result ? result.area : 0;
    const tree = withLoops(x.textInt, loopsFor(x.textInt, x.bodies, L, x.overlap, result.tol));
    return treeGroups(tree).filter((g) => g.area > CRUMB).reduce((sum, g) => sum + g.area, 0);
  }

  // Where a loop goes on one end of the name. In the end letter's own frame (a curved name tilts its end letters):
  // two-thirds of the way up the letter (LOOP_HEIGHT), the disc slides in along the letter's horizontal until it
  // overlaps the outline by as much as it would a straight edge at the join depth, so every font gets a sound
  // joint, and never so far that the hole reaches metal. Returns the disc's centre [x, y], or null.
  function placeLoop(side, end, textInt, R, rHole, join, tol) {
    const a = end.angle || 0, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
    const S = (p) => p[0] * ux + p[1] * uy, T = (p) => p[0] * vx + p[1] * vy;
    const pts = end.paths.flat();
    if (!pts.length) return null;
    const tMin = Math.min(...pts.map(T)), tMax = Math.max(...pts.map(T));
    const dir = side === 'left' ? -1 : 1;
    const textF = textInt.map(toFloat);
    // The outermost metal along the line t = level: crossings of every outline edge with it.
    const edgeAt = (level) => {
      let best = null;
      for (const ring of textF) for (let i = 0; i < ring.length; i++) {
        const p = ring[i], q = ring[(i + 1) % ring.length], tp = T(p), tq = T(q);
        if ((tp - level) * (tq - level) > 0 || tp === tq) continue;
        const k = (level - tp) / (tq - tp), sv = S(p) + k * (S(q) - S(p));
        if (best === null || dir * sv > dir * best) best = sv;
      }
      return best;
    };
    // Two-thirds up; if nothing reaches that line (a gap in the letter), step toward the middle until something does.
    const want = tMin + LOOP_HEIGHT * (tMax - tMin), mid = (tMin + tMax) / 2;
    let level = want, sEdge = edgeAt(level);
    for (let k = 1; sEdge === null && k <= 40; k++) { level = want + (mid - want) * (k / 40); sEdge = edgeAt(level); }
    if (sEdge === null) return null;
    const at = (sv) => [sv * ux + level * vx, sv * uy + level * vy];
    // Only the metal near the loop matters: cut it out once.
    const near = clip(textInt, [toInt(circle(...at(sEdge), 4 * R + 2, tol))], CL.ClipType.ctIntersection);
    const overlap = (sv, r) => {
      const hit = clip(near, [toInt(circle(...at(sv), r, Math.min(tol, 0.01)))], CL.ClipType.ctIntersection);
      return hit.reduce((sum, p) => sum + intArea(p), 0) / (SCALE * SCALE);
    };
    // A disc overlapping a straight edge by the join depth j covers this much: the target.
    const j = Math.min(join, R);
    const target = R * R * Math.acos((R - j) / R) - (R - j) * Math.sqrt(2 * R * j - j * j);
    // Outside: the disc clear of everything near; inside: centre on the edge. Bisect between them.
    let out = sEdge + dir * (R + 4 * R + 2), inn = sEdge;
    for (let k = 0; k < 30; k++) {
      const m = (out + inn) / 2;
      if (overlap(m, R) >= target) inn = m; else out = m;
    }
    let sv = inn;
    // The hole must stay clear of the metal: if it touches, back out until it doesn't.
    if (overlap(sv, rHole + 0.02) > 1e-6) {
      let o2 = sEdge + dir * (R + 4 * R + 2), i2 = sv;
      for (let k = 0; k < 30; k++) {
        const m = (o2 + i2) / 2;
        if (overlap(m, rHole + 0.02) > 1e-6) i2 = m; else o2 = m;
      }
      sv = o2;
    }
    return at(sv);
  }

  // Which letter or loop a loose piece came from, so the page can select it.
  function describeLoose(result, g, gi) {
    const pt = interiorPoint(g);
    const owners = [];
    if (pt) {
      for (const l of result.letters) {
        if (pointInPaths(l.dotPaths, pt[0], pt[1])) owners.push({ type: 'dot', index: l.index, ch: l.ch });
        else if (pointInPaths(l.body, pt[0], pt[1])) owners.push({ type: 'letter', index: l.index, ch: l.ch });
      }
      for (const lp of result.loops) if (Math.hypot(pt[0] - lp.cx, pt[1] - lp.cy) <= lp.outer / 2) owners.push({ type: 'loop', side: lp.side });
    }
    // A piece holding whole letters (a word after a space) is named by those letters.
    const inside = result.letters.filter((l) => l.bbox.minX >= g.bbox.minX - 0.05 && l.bbox.maxX <= g.bbox.maxX + 0.05 && l.bbox.minY >= g.bbox.minY - 0.05 && l.bbox.maxY <= g.bbox.maxY + 0.05);
    if (inside.length > 1) {
      return { group: gi, owners: inside.map((l) => ({ type: 'letter', index: l.index, ch: l.ch })), label: `“${inside.map((l) => l.ch).join('')}”`, area: g.area };
    }
    const o = owners[0];
    let label = 'a loose piece';
    if (o && o.type === 'loop') label = `the ${o.side} loop`;
    else if (o && o.type === 'dot') label = `the dot on ${o.ch}`;
    else if (o) {
      const l = result.letters.find((x) => x.index === o.index);
      if (o.ch === "'" || o.ch === '’') label = 'the apostrophe';
      else if (/[̀-ͯ]/.test(o.ch.normalize('NFD')) && g.bbox.minY > (l.bbox.minY + l.bbox.maxY) / 2) label = `the accent on ${o.ch}`;
      else label = `part of ${o.ch}`;
    }
    return { group: gi, owners, label, area: g.area };
  }

  function interiorPoint(g) {
    const { flat, holeIdx } = flatRings(g);
    const tri = triangulate(flat, holeIdx, 2);
    let best = 0, pt = null;
    for (let t = 0; t < tri.length; t += 3) {
      const a = tri[t] * 2, b = tri[t + 1] * 2, c = tri[t + 2] * 2;
      const ar = Math.abs((flat[b] - flat[a]) * (flat[c + 1] - flat[a + 1]) - (flat[c] - flat[a]) * (flat[b + 1] - flat[a + 1]));
      if (ar > best) { best = ar; pt = [(flat[a] + flat[b] + flat[c]) / 3 / SCALE, (flat[a + 1] + flat[b + 1] + flat[c + 1]) / 3 / SCALE]; }
    }
    return pt;
  }

  // Morphological opening: shrink by w/2, grow back by w/2. What the opening loses is narrower than w.
  // A small extra growth hides polygonisation slivers. Leftovers smaller than a quarter of a w x w square are
  // corner nicks, pointed terminals and small steps where letters meet, not strokes, so they are ignored.
  // Works on integer paths (outers and holes together); returns the thin parts as integer groups.
  function thinParts(all, tol, minW = MIN_FEATURE) {
    const w = minW * SCALE, slack = 0.02 * SCALE;
    if (!all.length) return [];
    const arcTol = Math.max(tol * 0.5, 0.002) * SCALE;
    const opened = offsetInt(offsetInt(all, -w / 2, arcTol), w / 2 + slack, arcTol);
    const diff = clip(all, opened, CL.ClipType.ctDifference, { tree: true });
    const minArea = 0.25 * minW * minW;
    return treeGroups(diff).filter((g) => g.area >= minArea);
  }
  // The loops are wire with their own minimum (MIN_LOOP_WALL), so what the opening finds inside a loop's disc
  // (and the neck where it meets the letter) isn't lettering and isn't flagged.
  function thinCheck(groups, tol, minW = MIN_FEATURE, loops = []) {
    const thin = [];
    let thinArea = 0;
    let parts = thinParts(groups.flatMap((g) => [g.outer, ...g.holes]), tol, minW);
    if (loops.length && parts.length) {
      const discs = loops.map((lp) => toInt(circle(lp.cx, lp.cy, lp.outer / 2 + minW / 2, tol)));
      const rest = clip(parts.flatMap((g) => [g.outer, ...g.holes]), discs, CL.ClipType.ctDifference, { tree: true });
      parts = treeGroups(rest).filter((g) => g.area >= 0.25 * minW * minW);
    }
    for (const g of parts) {
      thinArea += g.area;
      thin.push([toFloat(g.outer), ...g.holes.map(toFloat)]);
    }
    return { thin, thinArea };
  }

  // Reinforcement (design.reinforce): a variable offset. At every point of the outline the local stroke width is
  // measured with a short inward ray; where it is under the minimum the point moves outward by half the
  // shortfall, and that amount is widened a little and faded along the edge so the widened part blends into
  // the stroke. Edges stay parallel curves of the original, so the result is smooth; hairline terminals end in
  // a small round. A thin-part check afterwards catches anything the rays missed (oblique junctions) and
  // widens it the plain way, and a tiny closing rounds off the joins. Returns integer paths.
  function reinforceThin(all, tol, minW = MIN_FEATURE) {
    const w = minW, maxSeg = 0.08, margin = 0.02, grow = 0.2, fade = 0.4;
    const arcTol = Math.max(tol * 0.5, 0.002) * SCALE;
    const areaOf = (paths) => paths.reduce((a, p) => a + intArea(p), 0) / (SCALE * SCALE);
    const before = areaOf(all);
    // Only the parts the thin check flags are widened: the rays also see sharp corners and serifs as "thin",
    // and those are fine to cast. A point counts when it sits within reach of a flagged part.
    const flagged = thinParts(all, tol, w);
    if (!flagged.length) return { paths: all, passes: 0, addedArea: 0 };
    const mask = offsetInt(flagged.flatMap((g) => [g.outer, ...g.holes]), 0.25 * SCALE, arcTol);
    const inMask = (x, y) => { const pt = { X: Math.round(x * SCALE), Y: Math.round(y * SCALE) }; for (const m of mask) if (CL.Clipper.PointInPolygon(pt, m) !== 0) return true; return false; };
    // Dense float rings: the fade needs points along every edge, not only at the corners.
    const rings = all.map((p) => {
      const pts = [];
      for (let i = 0; i < p.length; i++) {
        const a = p[i], b = p[(i + 1) % p.length];
        const ax = a.X / SCALE, ay = a.Y / SCALE, bx = b.X / SCALE, by = b.Y / SCALE;
        const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / maxSeg));
        for (let k = 0; k < n; k++) pts.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]);
      }
      return pts;
    });
    // Edges in a grid of w-sized cells: a ray only needs the edges within w of its start.
    const cell = w, grid = new Map();
    const gkey = (gx, gy) => gx * 1e6 + gy;
    rings.forEach((pts, ri) => pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const e = { x1: p[0], y1: p[1], x2: q[0], y2: q[1], ri, i };
      const x0 = Math.floor(Math.min(p[0], q[0]) / cell), x1 = Math.floor(Math.max(p[0], q[0]) / cell);
      const y0 = Math.floor(Math.min(p[1], q[1]) / cell), y1 = Math.floor(Math.max(p[1], q[1]) / cell);
      for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const k = gkey(gx, gy); let arr = grid.get(k); if (!arr) grid.set(k, arr = []); arr.push(e); }
    }));
    const nearEdges = (x, y) => {
      const out = [], gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const arr = grid.get(gkey(gx + dx, gy + dy)); if (arr) for (const e of arr) out.push(e); }
      return out;
    };
    const hit = (px, py, dx, dy, e) => {
      const ex = e.x2 - e.x1, ey = e.y2 - e.y1, den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) return Infinity;
      const wx = e.x1 - px, wy = e.y1 - py;
      const s = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
      return s > 1e-6 && u >= -1e-9 && u <= 1 + 1e-9 ? s : Infinity;
    };
    const FAN = [-0.35, 0, 0.35];
    const moved = [];
    let movedCount = 0;
    rings.forEach((pts, ri) => {
      const n = pts.length, nx = new Float64Array(n), ny = new Float64Array(n), delta = new Float64Array(n), seg = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const a = pts[(i + n - 1) % n], p = pts[i], b = pts[(i + 1) % n];
        // Material is on the left of every ring (outers CCW, holes CW), so outward is to the right.
        const e1x = p[0] - a[0], e1y = p[1] - a[1], e2x = b[0] - p[0], e2y = b[1] - p[1];
        const l1 = Math.hypot(e1x, e1y) || 1, l2 = Math.hypot(e2x, e2y) || 1;
        seg[i] = l2;
        const n1x = e1y / l1, n1y = -e1x / l1, n2x = e2y / l2, n2y = -e2x / l2;
        let vx = n1x + n2x, vy = n1y + n2y;
        const vl = Math.hypot(vx, vy);
        if (vl < 1e-9) { vx = n2x; vy = n2y; } else { vx /= vl; vy /= vl; }
        nx[i] = vx; ny[i] = vy;
        let t = Infinity;
        const near = nearEdges(p[0], p[1]);
        for (const ang of FAN) {
          const c = Math.cos(ang), sn = Math.sin(ang), dx = -(vx * c - vy * sn), dy = -(vx * sn + vy * c);
          for (const e of near) {
            if (e.ri === ri && (e.i === i || e.i === (i + n - 1) % n)) continue;
            const h = hit(p[0], p[1], dx, dy, e);
            if (h < t) t = h;
          }
        }
        delta[i] = t < w && inMask(p[0], p[1]) ? (w - t) / 2 + margin : 0;
      }
      // Along the ring: extend the thin zone a little (max), then fade it (average).
      const filt = (src, radius, useMax) => {
        const dst = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          let acc = src[i], cnt = 1, d = 0;
          for (let k = 1; k < n; k++) { d += seg[(i + k - 1) % n]; if (d > radius) break; const v = src[(i + k) % n]; if (useMax) acc = Math.max(acc, v); else { acc += v; cnt++; } }
          d = 0;
          for (let k = 1; k < n; k++) { d += seg[(i - k + n) % n]; if (d > radius) break; const v = src[(i - k + n) % n]; if (useMax) acc = Math.max(acc, v); else { acc += v; cnt++; } }
          dst[i] = useMax ? acc : acc / cnt;
        }
        return dst;
      };
      const d2 = filt(filt(delta, grow, true), fade, false);
      const ring = [];
      for (let i = 0; i < n; i++) {
        const d = Math.min(d2[i], w);
        if (d > 0) movedCount++;
        ring.push({ X: Math.round((pts[i][0] + nx[i] * d) * SCALE), Y: Math.round((pts[i][1] + ny[i] * d) * SCALE) });
      }
      moved.push(ring);
    });
    if (!movedCount) return { paths: all, passes: 0, addedArea: 0 };
    let paths = CL.Clipper.CleanPolygons(unionInt(all.concat(moved)), 0.004 * SCALE).filter((p) => p.length > 2);
    // A tiny closing rounds off the joins. The offsets leave edges as short as 10 nm; their cap triangles flip in
    // 32-bit floats (STL, preview), so points closer than 2 µm merge, far below anything a casting shows. The
    // check runs on the smoothed outline (what is cast), and anything still thin is widened again.
    const r = REINFORCE_SMOOTH * SCALE;
    const smooth = (ps) => CL.Clipper.CleanPolygons(offsetInt(offsetInt(ps, r, arcTol), -r, arcTol), 0.002 * SCALE).filter((p) => p.length > 2);
    paths = smooth(paths);
    let passes = 1, thin = thinParts(paths, tol, w);
    while (thin.length && passes < REINFORCE_PASSES) {
      paths = smooth(unionInt(paths.concat(offsetInt(thin.flatMap((g) => [g.outer, ...g.holes]), REINFORCE_STEP * SCALE, arcTol))));
      thin = thinParts(paths, tol, w);
      passes++;
    }
    return { paths, passes, addedArea: Math.max(0, areaOf(paths) - before) };
  }

  /* ---------- mesh ---------- */

  function flatRings(g) {
    const rings = [g.outer, ...g.holes];
    const flat = [], holeIdx = [];
    let n = 0;
    rings.forEach((ring, ri) => {
      if (ri > 0) holeIdx.push(n);
      for (const p of ring) { flat.push(p.X, p.Y); n++; }
    });
    return { rings, flat, holeIdx, n };
  }

  // Triangulate one piece's face. Earcut gets integer coordinates (exact orientation tests) and no Steiner points,
  // so the cap triangles reuse the contour vertices and the walls join them exactly.
  function capTriangles(flat, holeIdx) {
    const tri = triangulate(flat, holeIdx.length ? holeIdx : null, 2);
    let signed = 0;
    for (let t = 0; t < tri.length; t += 3) {
      const a = tri[t] * 2, b = tri[t + 1] * 2, c = tri[t + 2] * 2;
      signed += (flat[b] - flat[a]) * (flat[c + 1] - flat[a + 1]) - (flat[c] - flat[a]) * (flat[b + 1] - flat[a + 1]);
    }
    if (signed < 0) for (let t = 0; t < tri.length; t += 3) { const x = tri[t + 1]; tri[t + 1] = tri[t + 2]; tri[t + 2] = x; }
    return tri; // counter-clockwise seen from +Z
  }

  // Watertight solid: each piece extruded to thickness T, sitting on Z = 0, origin at the bottom-left of the box.
  function buildMesh(result, T) {
    const ox = result.bbox.minX, oy = result.bbox.minY;
    const pos = [], idx = [];
    for (const g of result.groups) {
      const { rings, flat, holeIdx, n } = flatRings(g);
      const base = pos.length / 3;
      for (const z of [0, T]) for (let i = 0; i < n; i++) pos.push(flat[2 * i] / SCALE - ox, flat[2 * i + 1] / SCALE - oy, z);
      const tri = capTriangles(flat, holeIdx);
      for (let t = 0; t < tri.length; t += 3) {
        const a = base + tri[t], b = base + tri[t + 1], c = base + tri[t + 2];
        idx.push(n + a, n + b, n + c); // top, normal +Z
        idx.push(a, c, b);             // bottom, normal -Z
      }
      let start = base;
      for (const ring of rings) {
        const m = ring.length;
        for (let k = 0; k < m; k++) {
          const i = start + k, j = start + ((k + 1) % m);
          idx.push(i, j, j + n, i, j + n, i + n);
        }
        start += m;
      }
    }
    const positions = new Float64Array(pos), indices = new Uint32Array(idx);
    const volume = IO.signedVolume(positions, indices);
    const expected = result.area * T;
    return { positions, indices, volume, expected, volumeOk: Math.abs(volume - expected) <= 1e-6 * expected, triangles: indices.length / 3 };
  }

  // Preview mesh in world coordinates: flat caps, walls smooth along curves and creased at corners.
  function buildDisplay(result, T) {
    const pos = [], nor = [], idx = [];
    const crease = Math.cos((35 * Math.PI) / 180);
    for (const g of result.groups) {
      const { rings, flat, holeIdx, n } = flatRings(g);
      const tri = capTriangles(flat, holeIdx);
      for (const [z, nz] of [[T, 1], [0, -1]]) {
        const base = pos.length / 3;
        for (let i = 0; i < n; i++) { pos.push(flat[2 * i] / SCALE, flat[2 * i + 1] / SCALE, z); nor.push(0, 0, nz); }
        for (let t = 0; t < tri.length; t += 3) {
          if (nz > 0) idx.push(base + tri[t], base + tri[t + 1], base + tri[t + 2]);
          else idx.push(base + tri[t], base + tri[t + 2], base + tri[t + 1]);
        }
      }
      for (const ring of rings) {
        const m = ring.length;
        const P = ring.map((p) => [p.X / SCALE, p.Y / SCALE]);
        const en = []; // outward normal of edge k -> k+1 (interior is on the left)
        for (let k = 0; k < m; k++) {
          const a = P[k], b = P[(k + 1) % m], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
          en.push([dy / l, -dx / l]);
        }
        const vn = (k, e) => { // normal at vertex k for edge e (e is k or k-1)
          const o = e === k ? en[(k - 1 + m) % m] : en[(k + 1) % m];
          const me = en[e];
          if (me[0] * o[0] + me[1] * o[1] < crease) return me;
          const x = me[0] + o[0], y = me[1] + o[1], l = Math.hypot(x, y) || 1;
          return [x / l, y / l];
        };
        for (let k = 0; k < m; k++) {
          const j = (k + 1) % m, a = P[k], b = P[j], na = vn(k, k), nb = vn(j, k);
          const base = pos.length / 3;
          pos.push(a[0], a[1], 0, b[0], b[1], 0, b[0], b[1], T, a[0], a[1], T);
          nor.push(na[0], na[1], 0, nb[0], nb[1], 0, nb[0], nb[1], 0, na[0], na[1], 0);
          idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }
      }
    }
    return { positions: new Float32Array(pos), normals: new Float32Array(nor), indices: new Uint32Array(idx) };
  }

  /* ---------- design helpers for the page ---------- */

  function hitTest(result, x, y) {
    for (const lp of result.loops) {
      const d = Math.hypot(x - lp.cx, y - lp.cy);
      if (d <= lp.outer / 2 + 0.2) return { type: 'loop', side: lp.side };
    }
    for (const l of result.letters) {
      if (l.dotPaths.length && pointInPaths(l.dotPaths, x, y)) return { type: 'dot', index: l.index };
    }
    for (let i = result.letters.length - 1; i >= 0; i--) {
      const l = result.letters[i];
      if (pointInPaths(l.body, x, y)) return { type: 'letter', index: l.index };
    }
    // Small dots are hard to hit: accept a click within 0.4 mm of one.
    for (const l of result.letters) {
      if (!l.dotPaths.length) continue;
      const b = bboxOf(l.dotPaths);
      if (x >= b.minX - 0.4 && x <= b.maxX + 0.4 && y >= b.minY - 0.4 && y <= b.maxY + 0.4) return { type: 'dot', index: l.index };
    }
    // Close misses on thin strokes: nearest letter box within 0.4 mm.
    let best = null, bd = 0.4;
    for (const l of result.letters) {
      const b = l.bbox;
      const dx = Math.max(b.minX - x, 0, x - b.maxX), dy = Math.max(b.minY - y, 0, y - b.maxY), d = Math.hypot(dx, dy);
      if (d === 0) {
        // inside the box but not on ink: take it only if no other box contains the point
        const others = result.letters.filter((o) => o !== l && x >= o.bbox.minX && x <= o.bbox.maxX && y >= o.bbox.minY && y <= o.bbox.maxY);
        if (!others.length) return { type: 'letter', index: l.index };
      } else if (d < bd) { bd = d; best = { type: 'letter', index: l.index }; }
    }
    return best;
  }

  // Keep adjustments for characters before the first change; reset the rest.
  function retainLetters(oldText, newText, letters) {
    const a = Array.from(oldText), b = Array.from(newText);
    let p = 0;
    while (p < a.length && p < b.length && a[p] === b[p]) p++;
    return (letters || []).slice(0, p);
  }

  const fmtNum = (v, d) => String(+v.toFixed(d));
  function fileBase(design) {
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const c = Math.round(design.curve || 0), bend = c ? `-curve${c > 0 ? c : 'arch' + -c}` : '';
    return `name-${slug(design.text.trim())}-${slug(design.font)}-${fmtNum(design.height, 2)}mm-${design.thickness.toFixed(1)}mm${bend}`;
  }

  // The order-ready design record (later: a Shopify line item property).
  function designJSON(design) {
    const letters = Array.from(design.text).map((_, i) => Object.assign(defaultLetter(), (design.letters || [])[i]));
    return JSON.stringify({
      version: design.version || 1, text: design.text, font: design.font, height: design.height, thickness: design.thickness,
      overlap: design.overlap, curve: design.curve || 0, finish: design.finish || 'polished', reinforce: !!design.reinforce, dots: design.dots, loops: design.loops, letters,
    });
  }

  return {
    MIN_FEATURE, MIN_FEATURE_LARGE, LARGE_FROM, minFeatureFor, LOOP_SIZES, loopSizeFor, LOOP_HEIGHT, areaWithLoops, REINFORCE_STEP, MIN_LOOP_WALL, LOOP_MIN_JOIN, SCALE, MAX_CHARS, SCANLINES, HEIGHTS, HEIGHT_RANGE, THICKNESSES, OVERLAP_RANGE,
    LOOP_OUTER_RANGE, LOOP_HOLE_RANGE, SCALE_RANGE, CURVE_RANGE, DETAIL, FONTS,
    fontMeta, defaultDesign, defaultLetter, build, buildMesh, buildDisplay, loopWallError, hitTest, retainLetters,
    fileBase, designJSON, minGap, extentsAt, touchArea, flatten,
    toBinarySTL: IO.toBinarySTL, toAsciiSTL: IO.toAsciiSTL, zipOne: IO.zipOne, signedVolume: IO.signedVolume,
  };
})();
if (typeof module !== 'undefined') module.exports = Nameplate;
