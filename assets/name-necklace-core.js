/* GENERATED from the name-necklace-builder repo (shared/stl-io.js + shared/alloys.js + name-necklace-maker/src/nameplate.js, as build.js assembles them). Do not hand-edit; rebuild from that repo. */
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

/* Nameplate: name necklace geometry. Font -> outline -> union -> loops -> checks -> mesh.
   No DOM, runs in Node too. Units: millimetres, y up. Clipper works in integers at SCALE units per mm. */
const Nameplate = (() => {
  const CL = typeof ClipperLib !== 'undefined' ? ClipperLib : require('clipper-lib');
  const triangulate = typeof earcut !== 'undefined' ? earcut : require('earcut');
  const IO = typeof StlIO !== 'undefined' ? StlIO : require('../../shared/stl-io.js');

  // Limits to confirm with the casting house or laser cutter.
  const MIN_FEATURE = 0.5;     // mm: strokes narrower than this are flagged
  const MIN_LOOP_WALL = 0.6;   // mm: (outer - hole) / 2
  const LOOP_MIN_JOIN = 0.1;   // mm: a loop always overlaps the outline by at least this, so overlap 0 can't leave it touching at a point
  const MIN_JOIN_AREA = 0.002; // mm²: two neighbouring letters sharing less than this don't count as joined

  const SCALE = 1e5;           // Clipper units per mm (1 unit = 10 nm)
  const MAX_CHARS = 14;
  const SCANLINES = 200;
  const SPACE_GAP = 0.6;       // a run of spaces becomes one gap of this x the font's space advance
  const HEIGHTS = { small: 8, medium: 12, large: 16 };
  const HEIGHT_RANGE = [6, 25];
  const THICKNESSES = [0.8, 1.0, 1.2, 1.5, 2.0];
  const OVERLAP_RANGE = [0, 1];
  const LOOP_OUTER_RANGE = [2.5, 5];
  const LOOP_HOLE_RANGE = [1.0, 2.5];
  const SCALE_RANGE = [0.5, 2];
  const CURVE_RANGE = [-180, 180]; // degrees of arc the name bends through
  const DETAIL = { draft: 0.03, standard: 0.01, fine: 0.005 }; // curve tolerance, mm

  const FONTS = [
    { key: 'greatvibes', name: 'Great Vibes', file: 'greatvibes/GreatVibes-Regular.ttf', style: 'Formal script' },
    { key: 'allura', name: 'Allura', file: 'allura/Allura-Regular.ttf', style: 'Formal script' },
    { key: 'alexbrush', name: 'Alex Brush', file: 'alexbrush/AlexBrush-Regular.ttf', style: 'Brush script' },
    { key: 'pacifico', name: 'Pacifico', file: 'pacifico/Pacifico-Regular.ttf', style: 'Bold retro script' },
    { key: 'dancingscript', name: 'Dancing Script', file: 'dancingscript/DancingScript[wght].ttf', style: 'Casual script' },
    { key: 'luckiestguy', name: 'Luckiest Guy', file: 'luckiestguy/LuckiestGuy-Regular.ttf', style: 'Chunky display' },
  ];
  const fontMeta = (key) => FONTS.find((f) => f.key === key) || FONTS[0];

  const defaultLetter = () => ({ dx: 0, dy: 0, rot: 0, scale: 1 });
  function defaultDesign() {
    return {
      version: 1, text: 'Charlotte', font: 'greatvibes', height: 12, thickness: 1.2, overlap: 0.3,
      loops: { outer: 3.2, hole: 1.4, left: { on: true, dx: 0, dy: 0 }, right: { on: true, dx: 0, dy: 0 } },
      dots: 'keep', curve: 0, finish: 'polished', letters: [],
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

  // design: see defaultDesign(). opts: { detail: 'draft'|'standard'|'fine', fontName, checks: true }
  function build(font, design, opts = {}) {
    const tol = DETAIL[opts.detail] || DETAIL.standard;
    const fontName = opts.fontName || fontMeta(design.font).name;
    const chars = Array.from(design.text || '');
    const fail = (code, message, extra) => ({ ok: false, error: Object.assign({ code, message }, extra) });
    if (!chars.some((c) => !isSpace(c))) return fail('empty', 'Type a name to start.');
    if (chars.length > MAX_CHARS) return fail('too-long', `Names can be up to ${MAX_CHARS} characters.`);

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
        letters.push({ index: it.index, ch: it.ch, pen, afterSpace: pendingSpace, local: groups.flatMap((g) => g.paths), dotPaths: design.dots === 'remove' ? [] : dots.flatMap((g) => g.paths) });
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

    // 9. Loops, placed level with the outline's leftmost / rightmost point.
    const loops = [];
    const L = design.loops || {};
    const loopErr = loopWallError(L.outer, L.hole);
    if (!loopErr && textF.length) {
      // Only substantial pieces count, so a loop never hangs off an accent, an apostrophe or a dot.
      const textGroups = treeGroups(unionInt(text, { tree: true }));
      const big = Math.max(...textGroups.map((g) => g.area));
      const anchor = textGroups.filter((g) => g.area >= 0.15 * big).map((g) => toFloat(g.outer));
      const R = L.outer / 2, join = Math.max(design.overlap, LOOP_MIN_JOIN);
      const tb = bboxOf(anchor);
      // Height of the extreme point. A vertical edge counts as one extreme (use its middle); when separate
      // points tie (an S's two bowls often share their leftmost x), take the one nearest mid-height.
      const levelAt = (x) => {
        const mid = (tb.minY + tb.maxY) / 2, runs = [];
        for (const p of anchor) {
          const on = p.map(([px]) => Math.abs(px - x) <= 1e-3);
          const startAt = on.findIndex((v, i) => v && !on[(i - 1 + p.length) % p.length]);
          if (startAt < 0) { if (on[0]) runs.push(bboxOf([p])); continue; }
          for (let k = 0; k < p.length; k++) {
            const i = (startAt + k) % p.length;
            if (!on[i]) continue;
            if (!on[(i - 1 + p.length) % p.length]) runs.push([]);
            runs[runs.length - 1].push(p[i]);
          }
        }
        const levels = runs.map((r) => (Array.isArray(r) ? (Math.min(...r.map((q) => q[1])) + Math.max(...r.map((q) => q[1]))) / 2 : (r.minY + r.maxY) / 2));
        return levels.reduce((best, y) => (Math.abs(y - mid) < Math.abs(best - mid) ? y : best));
      };
      for (const side of ['left', 'right']) {
        const cfg = L[side];
        if (!cfg || !cfg.on) continue;
        const edge = side === 'left' ? tb.minX : tb.maxX;
        const cx = side === 'left' ? edge - R + join : edge + R - join;
        loops.push({ side, cx: cx + (cfg.dx || 0), cy: levelAt(edge) + (cfg.dy || 0), outer: L.outer, hole: L.hole });
      }
    }
    for (const lp of loops) {
      lp.outerPath = circle(lp.cx, lp.cy, lp.outer / 2, tol);
      lp.holePath = circle(lp.cx, lp.cy, lp.hole / 2, tol);
    }
    // Union the discs with the text, then subtract the holes so nothing can fill them.
    const tree = clip(text.concat(loops.map((lp) => toInt(lp.outerPath))), loops.map((lp) => toInt(lp.holePath)), CL.ClipType.ctDifference, { tree: true, strict: true });

    // 10. Pieces.
    const groups = treeGroups(tree).filter((g) => g.area > 1e-9);
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
      loose: [], thin: [], thinArea: 0,
    };

    // 11. Checks.
    result.loose = groups.slice(1).map((g, i) => describeLoose(result, g, i + 1));
    if (opts.checks !== false) Object.assign(result, thinCheck(groups, tol));
    return result;
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
  function thinCheck(groups, tol) {
    const w = MIN_FEATURE * SCALE, slack = 0.02 * SCALE;
    const all = groups.flatMap((g) => [g.outer, ...g.holes]);
    if (!all.length) return { thin: [], thinArea: 0 };
    const arcTol = Math.max(tol * 0.5, 0.002) * SCALE;
    const opened = offsetInt(offsetInt(all, -w / 2, arcTol), w / 2 + slack, arcTol);
    const diff = clip(all, opened, CL.ClipType.ctDifference, { tree: true });
    const minArea = 0.25 * MIN_FEATURE * MIN_FEATURE;
    const thin = [];
    let thinArea = 0;
    for (const g of treeGroups(diff)) {
      if (g.area < minArea) continue;
      thinArea += g.area;
      thin.push([toFloat(g.outer), ...g.holes.map(toFloat)]);
    }
    return { thin, thinArea };
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
      overlap: design.overlap, curve: design.curve || 0, finish: design.finish || 'polished', dots: design.dots, loops: design.loops, letters,
    });
  }

  return {
    MIN_FEATURE, MIN_LOOP_WALL, LOOP_MIN_JOIN, SCALE, MAX_CHARS, SCANLINES, HEIGHTS, HEIGHT_RANGE, THICKNESSES, OVERLAP_RANGE,
    LOOP_OUTER_RANGE, LOOP_HOLE_RANGE, SCALE_RANGE, CURVE_RANGE, DETAIL, FONTS,
    fontMeta, defaultDesign, defaultLetter, build, buildMesh, buildDisplay, loopWallError, hitTest, retainLetters,
    fileBase, designJSON, minGap, extentsAt, touchArea, flatten,
    toBinarySTL: IO.toBinarySTL, toAsciiSTL: IO.toAsciiSTL, zipOne: IO.zipOne, signedVolume: IO.signedVolume,
  };
})();
if (typeof module !== 'undefined') module.exports = Nameplate;
