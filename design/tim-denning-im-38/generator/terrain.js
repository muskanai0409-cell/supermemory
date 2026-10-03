// Terrain for the map, baked at build time from fixed seeds.
// Draws to ISOM-style layers: yellow open land, three greens, brown contours,
// blue water, black rock and roads. Output is plain SVG markup.
const { contours } = require('d3-contour');
const { createNoise2D } = require('simplex-noise');
const alea = require('alea');

const r1 = v => Math.round(v * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

function fbm(n, x, y, oct = 4, lac = 2.03, gain = 0.5) {
  let a = 1, f = 1, s = 0, norm = 0;
  for (let i = 0; i < oct; i++) { s += a * n(x * f + i * 17.31, y * f - i * 9.13); norm += a; a *= gain; f *= lac; }
  return s / norm;
}
const gauss = (x, y, b) => {
  const c = Math.cos(b.rot || 0), s = Math.sin(b.rot || 0);
  const ux = x - b.x, uy = y - b.y;
  const dx = (ux * c + uy * s) / b.sx, dy = (-ux * s + uy * c) / b.sy;
  return b.a * Math.exp(-(dx * dx + dy * dy) / 2);
};

function area(p) { let s = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) s += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return s / 2; }

function dp(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let idx = -1, md = 0;
    const [ax, ay] = pts[a], [bx, by] = pts[b]; const L = Math.hypot(bx - ax, by - ay);
    for (let i = a + 1; i < b; i++) {
      const d = L < 1e-6 ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
        : Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L;
      if (d > md) { md = d; idx = i; }
    }
    if (md > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function chaikin(p, closed = true) {
  const out = []; const n = p.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = p[i], b = p[(i + 1) % n];
    out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
  }
  if (!closed) { out.unshift(p[0]); out.push(p[n - 1]); }
  return out;
}

// Compact path data: relative, implicit lineto, quantised to 1/Q px.
let Q = 1;
function enc(p, close) {
  let d = '', px = 0, py = 0, n = 0;
  for (const [fx, fy] of p) {
    const x = Math.round(fx * Q) / Q, y = Math.round(fy * Q) / Q;
    if (!n) d = `M${x} ${y}`;
    else {
      const dx = +(x - px).toFixed(1), dy = +(y - py).toFixed(1);
      if (!dx && !dy) continue;
      d += (n === 1 ? 'l' : dx < 0 ? '' : ' ') + dx + (dy < 0 ? '' : ' ') + dy;
    }
    px = x; py = y; n++;
  }
  return close ? d + 'z' : d;
}
const ringD = p => enc(p, true);
const lineD = p => enc(p, false);

// Sample fn on a grid that overhangs the drawing so every ring closes off-sheet.
function sample(W, H, cell, fn) {
  const pad = 2;
  const nx = Math.ceil(W / cell) + 1 + 2 * pad, ny = Math.ceil(H / cell) + 1 + 2 * pad;
  const v = new Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const edge = i === 0 || j === 0 || i === nx - 1 || j === ny - 1;
    v[j * nx + i] = edge ? -1e6 : fn((i - pad) * cell, (j - pad) * cell);
  }
  return { nx, ny, v, cell, pad };
}
// Contours get Chaikin curves; vegetation keeps straighter, drawn-looking edges.
function iso(g, thresholds, { tol = 0.6, minArea = 40, smooth = true } = {}) {
  const res = contours().size([g.nx, g.ny]).thresholds(thresholds).smooth(true)(g.v);
  return res.map(c => {
    let d = '';
    for (const poly of c.coordinates) for (const ring of poly) {
      let pts = ring.map(([x, y]) => [(x - g.pad - 0.5) * g.cell, (y - g.pad - 0.5) * g.cell]);
      pts.pop();
      if (Math.abs(area(pts)) < minArea) continue;
      pts = dp(pts.concat([pts[0]]), tol); pts.pop();
      if (pts.length < 3) continue;
      d += ringD(smooth ? chaikin(pts) : pts);
    }
    return { value: c.value, d };
  }).filter(c => c.d);
}

// Catmull-Rom through points -> polyline samples (for drawing and measuring)
function spline(points, steps = 24) {
  const P = [points[0], ...points, points[points.length - 1]];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
function measure(pl) {
  const cum = [0];
  for (let i = 1; i < pl.length; i++) cum.push(cum[i - 1] + Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1]));
  const total = cum[cum.length - 1];
  const at = t => {
    const L = clamp(t, 0, 1) * total; let i = 1; while (i < cum.length - 1 && cum[i] < L) i++;
    const f = (L - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    const a = pl[i - 1], b = pl[i];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang };
  };
  return { total, at };
}

/**
 * One window of terrain.
 * opts: id, W,H, seed, cell, taperY/taperX, relief, freq, hills [{x,y,sx,sy,a,rot}], interval,
 *       veg {level, bias, max, tint}, open {level, bias}, boulders {n, field, dots, anywhere}, avoid(x,y),
 *       road {pts, label, labelAt, dy}, stream {pts}, trail {pts}, marsh {x,y,w,h}, cliff {pts}, pond
 */
function terrain(o) {
  Q = /-m$|^card$/.test(o.id) ? 10 : 1;
  const { W, H } = o;
  const rnd = alea(o.seed + ':r');
  const nH = createNoise2D(alea(o.seed + ':h'));
  const nV = createNoise2D(alea(o.seed + ':v'));
  const nT = createNoise2D(alea(o.seed + ':t'));
  const nO = createNoise2D(alea(o.seed + ':o'));
  const nO2 = createNoise2D(alea(o.seed + ':o2'));
  const nM = createNoise2D(alea(o.seed + ':m'));
  const cell = o.cell || 6;
  const ty = o.taperY ?? 0.32, tx = o.taperX ?? 0;
  const win = (x, y) => {
    let w = 1;
    if (ty) w *= smoothstep(0, ty, y / H) * smoothstep(0, ty, 1 - y / H);
    if (tx) w *= smoothstep(0, tx, x / W) * smoothstep(0, tx, 1 - x / W);
    return w;
  };
  const relief = o.relief ?? 0.5, fs = o.freq ?? 1 / 260;
  // Edges flatten toward `base`, which sits between contour levels, so rings close before the edge.
  const base = o.base ?? relief * 0.78;
  const height = (x, y) => {
    let h = relief * (0.5 + 0.5 * fbm(nH, x * fs, y * fs, 4));
    for (const b of o.hills || []) h += gauss(x, y, b);
    return base + win(x, y) * (h - base);
  };
  const parts = [];
  const vegScale = o.veg?.scale ?? 1 / 210, openScale = o.open?.scale ?? 1 / 300;
  const vegField = (x, y) => (0.5 + 0.5 * fbm(nV, x * vegScale, y * vegScale, 3)) * win(x, y) + (o.veg?.bias ? o.veg.bias(x, y) : 0);
  const openField = (x, y) => (0.5 + 0.5 * fbm(nO, x * openScale, y * openScale, 3)) * win(x, y) + (o.open?.bias ? o.open.bias(x, y) : 0);
  const fillOpts = { tol: 1.7, minArea: 500, smooth: false };

  // open land: full yellow, plus rough open as its own neighbouring class (not a halo)
  if (o.open) {
    const lv = o.open.level ?? 0.68;
    const og = sample(W, H, cell + 2, (x, y) => openField(x, y) - lv);
    const [open] = iso(og, [0], fillOpts);
    const roughField = (x, y) => (0.5 + 0.5 * fbm(nO2, x / 230, y / 230, 3)) * win(x, y) + (o.open.bias ? o.open.bias(x, y) * 0.8 : 0);
    const rg = sample(W, H, cell + 2, (x, y) => Math.min(roughField(x, y) - (lv + 0.08), lv - 0.03 - openField(x, y)));
    const [rough] = iso(rg, [0], fillOpts);
    if (rough) parts.push(`<path class="t-open-rough" d="${rough.d}"/>`);
    if (open) parts.push(`<path class="t-open" d="${open.d}"/>`);
  }
  // vegetation: one mask, one flat tint per patch, so neighbouring patches differ instead of nesting
  if (o.veg) {
    const lv = o.veg.level ?? 0.62;
    const tint = (x, y) => 0.5 + 0.5 * fbm(nT, x / 150, y / 150, 2) + (o.veg.tint || 0);
    const cuts = o.veg.max === 2 ? [0.5, 9] : [0.46, 0.7];
    const bands = [t => cuts[0] - t, t => Math.min(t - cuts[0], cuts[1] - t), t => t - cuts[1]];
    ['t-veg1', 't-veg2', 't-veg3'].forEach((cls, k) => {
      const vg = sample(W, H, cell + 2, (x, y) => Math.min(vegField(x, y) - lv, bands[k](tint(x, y)) * 0.6));
      const [c] = iso(vg, [0], { ...fillOpts, minArea: 300 });
      if (c) parts.push(`<path class="${cls}" d="${c.d}"/>`);
    });
  }
  // water
  if (o.pond) parts.push(`<path class="t-water-fill" d="${o.pond}"/>`);
  if (o.marsh) {
    const m = o.marsh; let d = '';
    for (let yy = m.y; yy < m.y + m.h; yy += 6) {
      let run = null;
      for (let xx = m.x; xx <= m.x + m.w; xx += 2) {
        const k = gauss(xx, yy, { x: m.x + m.w / 2, y: m.y + m.h / 2, sx: m.w / 2.6, sy: m.h / 2.6, a: 1 }) + 0.35 * nM(xx / 40, yy / 40);
        const inside = k > 0.45 && xx < m.x + m.w;
        if (inside && run === null) run = xx;
        if (!inside && run !== null) {
          for (let s = run + ((yy / 6) % 2) * 5; s < xx - 4; s += 13) d += `M${Math.round(s)} ${Math.round(yy)}h${Math.min(8, Math.round(xx - s - 2))}`;
          run = null;
        }
      }
    }
    parts.push(`<path class="t-marsh" d="${d}"/>`);
  }
  if (o.stream) {
    const pl = spline(o.stream.pts);
    const wob = pl.map(([x, y]) => [x + 5 * nV(x / 40, y / 40), y + 5 * nV(y / 40 + 9, x / 40)]);
    parts.push(`<path class="t-stream" d="${lineD(dp(wob, 0.5))}"/>`);
  }
  // contours
  const g = sample(W, H, cell, height);
  const interval = o.interval ?? 0.1;
  const start = o.contourStart ?? base + interval * 0.5;
  const ths = []; for (let t = start; t < 4; t += interval) ths.push(t);
  const cs = iso(g, ths, { tol: 0.5, minArea: o.minContour ?? 220 });
  let thin = '', thick = '';
  cs.forEach(c => { const k = Math.round((c.value - start) / interval); if ((k + 1) % 5 === 0) thick += c.d; else thin += c.d; });
  parts.push(`<path class="t-contour" d="${thin}"/>`);
  if (thick) parts.push(`<path class="t-contour t-index" d="${thick}"/>`);

  // rock: cliff line with tags on the downhill side
  let cliffPl = null;
  if (o.cliff) {
    cliffPl = spline(o.cliff.pts, 12); let tags = '';
    const m = measure(cliffPl);
    for (let s = 0.04; s < 1; s += 0.11) { const p = m.at(s); const nx = Math.cos(p.ang + Math.PI / 2), ny = Math.sin(p.ang + Math.PI / 2); tags += `M${r1(p.x)} ${r1(p.y)}l${r1(nx * 6)} ${r1(ny * 6)}`; }
    parts.push(`<path class="t-cliff" d="${lineD(cliffPl)}"/><path class="t-cliff-tag" d="${tags}"/>`);
  }
  // boulders: near-upright triangles where the ground is steep or near a cliff; dots for single boulders
  if (o.boulders) {
    let tri = '', dots = '';
    const field = o.boulders.field;
    const steep = (x, y) => Math.hypot(height(x + 4, y) - height(x - 4, y), height(x, y + 4) - height(x, y - 4));
    const nearCliff = (x, y) => cliffPl && cliffPl.some(p => Math.hypot(p[0] - x, p[1] - y) < 46);
    let placed = 0, tries = 0;
    while (placed < o.boulders.n && tries++ < o.boulders.n * 120) {
      const x = 12 + rnd() * (W - 24), y = 12 + rnd() * (H - 24);
      if (field && !field(x, y)) continue;
      if (win(x, y) < 0.35) continue;
      if (o.avoid && o.avoid(x, y)) continue;
      if (!o.boulders.anywhere && !(steep(x, y) > (o.boulders.steep ?? 0.016) || nearCliff(x, y))) continue;
      if (o.boulders.dots && rnd() < 0.3) dots += `M${r1(x - 1.9)} ${r1(y)}a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0-3.8 0`;
      else {
        const s = 3.6 + rnd() * 1.2, a = -Math.PI / 2 + (rnd() - 0.5) * 0.7;
        tri += 'M' + [0, 1, 2].map(k => `${r1(x + s * Math.cos(a + k * 2.094))} ${r1(y + s * Math.sin(a + k * 2.094))}`).join('L') + 'Z';
      }
      placed++;
    }
    parts.push(`<path class="t-rock" d="${tri}${dots}"/>`);
  }
  // trail (small path, dashed black)
  if (o.trail) parts.push(`<path class="t-trail" d="${lineD(dp(spline(o.trail.pts), 0.4))}"/>`);
  // the conventional path: a wide road with black casings
  let roadSvg = '', road = null;
  if (o.road) {
    const pl = spline(o.road.pts, 30);
    road = measure(pl);
    const d = lineD(dp(pl, 0.3));
    const id = `${o.id}-road`;
    roadSvg = `<path id="${id}" class="t-road-case" d="${d}"/><path class="t-road" d="${d}"/>`;
    if (o.road.label) {
      roadSvg += `<text class="t-road-label" dy="${o.road.dy ?? -9}"><textPath href="#${id}" startOffset="${o.road.labelAt ?? '50%'}" text-anchor="middle">${o.road.label}</textPath></text>`;
    }
  }
  parts.push(roadSvg);
  return { svg: parts.join(''), road, height, win };
}

module.exports = { iso, sample, dp, chaikin, terrain, spline, measure, lineD, ringD, gauss, alea, createNoise2D, r1 };
