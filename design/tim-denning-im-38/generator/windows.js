// Terrain windows for each part of the sheet. Desktop drawings are 1192 wide
// (neatline to neatline at 1240), phone drawings 420 wide.
const { terrain, gauss, sample, iso, r1 } = require('./terrain');

const DW = 1192, MW = 420;
const g = (x, y, sx, sy, a, rot = 0) => ({ x, y, sx, sy, a, rot });
const bump = (x0, y0, sx, sy, a) => (x, y) => gauss(x, y, { x: x0, y: y0, sx, sy, a });
const sum = (...fs) => (x, y) => fs.reduce((s, f) => s + f(x, y), 0);
const box = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const any = (...fs) => (x, y) => fs.some(f => f(x, y));
// keeps fills out of a rectangle (e.g. under a headline) with a soft edge
const clear = (x0, y0, x1, y1, a = 0.7) => (x, y) => {
  const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1);
  return -a * Math.exp(-(dx * dx + dy * dy) / (2 * 40 * 40));
};

const svg = (W, H, cls, body, aspect = 'xMidYMid slice', extra = '') =>
  `<svg class="${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="${aspect}" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;

// an irregular pond traced from a noise-roughened bump
function pond(id, cx, cy, rx, ry, seed) {
  const { createNoise2D, alea } = require('./terrain');
  const n = createNoise2D(alea(seed));
  const W = cx + rx * 2, H = cy + ry * 2;
  const gr = sample(W, H, 3, (x, y) => gauss(x, y, { x: cx, y: cy, sx: rx / 1.6, sy: ry / 1.6, a: 1 }) + 0.22 * n(x / 38, y / 38) - 0.5);
  const [c] = iso(gr, [0], { tol: 0.8, minArea: 200, smooth: true });
  return c ? c.d : '';
}

function hero() {
  const d = terrain({ id: 'hero-d', W: DW, H: 620, seed: '38-hero', cell: 5, taperY: 0.1, relief: 0.42, interval: 0.095, freq: 1 / 300,
    hills: [g(640, 240, 215, 150, 1.05, -0.35), g(1010, 520, 100, 60, 0.42), g(250, 120, 130, 70, 0.28), g(880, 420, 70, 50, 0.3)],
    veg: { level: 0.66, bias: sum(bump(1150, 230, 120, 200, 0.32), bump(1080, 600, 160, 80, 0.2), clear(0, 60, 860, 360)) },
    open: { level: 0.72, bias: sum(bump(860, 560, 150, 60, 0.36), clear(0, 40, 860, 380, 0.8), clear(0, 420, 760, 640, 0.5)) },
    stream: { pts: [[300, -10], [330, 110], [290, 250], [210, 380], [120, 470], [30, 520], [-10, 540]] },
    boulders: { n: 40, dots: true }, avoid: any(box(0, 0, 1192, 60), box(0, 440, 840, 640), box(0, 40, 860, 330), box(0, 330, 640, 500)),
    cliff: { pts: [[720, 400], [770, 424], [830, 430]] },
    trail: { pts: [[1200, 280], [1080, 310], [980, 350], [900, 420], [860, 520], [880, 640]] },
    road: { pts: [[700, 640], [820, 560], [940, 480], [1060, 410], [1200, 350]], label: 'THE CONVENTIONAL PATH', labelAt: '30%' } });
  const m = terrain({ id: 'hero-m', W: MW, H: 900, seed: '38-hero-m', cell: 4, taperY: 0.06, relief: 0.4, interval: 0.1, freq: 1 / 220,
    hills: [g(300, 150, 120, 85, 1.0, -0.4), g(90, 800, 90, 60, 0.4), g(360, 690, 60, 50, 0.3)],
    veg: { level: 0.66, bias: sum(bump(430, 420, 80, 120, 0.3), bump(40, 850, 120, 70, 0.25), clear(0, 40, 420, 260)) },
    open: { level: 0.74, bias: sum(bump(330, 840, 100, 60, 0.3), clear(0, 40, 420, 300, 0.8), clear(0, 560, 420, 760, 0.6)) },
    stream: { pts: [[-10, 300], [80, 340], [140, 420], [170, 520], [150, 600], [100, 680], [60, 780], [-10, 840]] },
  });
  return svg(DW, 620, 't t-d', d.svg, 'xMidYMin slice') + svg(MW, 900, 't t-m', m.svg, 'xMinYMin slice');
}

function rough() {
  // scars sit over light ground on the left; the boulder field and the cliff carry the right
  const leg = (x1, y1, x2, y2, r) => { const L = Math.hypot(x2 - x1, y2 - y1), k = (L - r - 5) / L; return `<path class="op-stroke" d="M${x1} ${y1}L${r1(x1 + (x2 - x1) * k)} ${r1(y1 + (y2 - y1) * k)}"/><circle class="op-stroke" cx="${x2}" cy="${y2}" r="${r}"/>`; };
  const d = terrain({ id: 'rough-d', W: DW, H: 430, seed: '38-rough', cell: 6, taperY: 0.16, relief: 0.45, interval: 0.11,
    hills: [g(300, 250, 160, 90, 0.5), g(940, 190, 170, 90, 0.75, 0.3)],
    veg: { level: 0.58, max: 2, tint: -0.06, bias: sum(bump(620, 225, 420, 130, 0.5), bump(1150, 90, 100, 70, -0.3)) },
    boulders: { n: 90, anywhere: true, field: (x, y) => x > 920 && Math.hypot(x - 1010, y - 84) > 40 },
    cliff: { pts: [[800, 330], [860, 350], [930, 354], [990, 340]] } });
  const m = terrain({ id: 'rough-m', W: MW, H: 760, seed: '38-rough-m', cell: 5, taperY: 0.12, relief: 0.45, interval: 0.11,
    hills: [g(330, 380, 100, 140, 0.55)],
    veg: { level: 0.58, max: 2, tint: -0.06, bias: bump(220, 430, 230, 260, 0.5) },
    boulders: { n: 30, anywhere: true, field: (x, y) => y > 716 || (x > 300 && y < 160 && Math.hypot(x - 340, y - 132) > 34) },
    cliff: { pts: [[250, 708], [310, 722], [380, 718]] } });
  return svg(DW, 430, 't t-d', d.svg + `<g class="leg-end">${leg(60, 395, 1010, 84, 16)}</g><path class="op-stroke leg-run" d="M60 395L1300 -11"/>`) + svg(MW, 760, 't t-m', m.svg + leg(30, 735, 340, 132, 12));
}

const STRIP_H = { path: 190, mind: 140, work: 210, money: 150, body: 230, people: 160 };
function strip(key, seed, opts) {
  const H = STRIP_H[key];
  const d = terrain({ id: `${seed}-d`, W: DW, H, seed, cell: 5, taperY: 0.26, relief: 0.62, interval: 0.11, freq: 1 / 170,
    hills: opts.hills || [], veg: opts.veg === false ? null : { level: opts.veg ?? 0.64, bias: opts.vegBias },
    open: opts.open === false ? null : { level: opts.open ?? 0.72, bias: opts.openBias },
    boulders: { n: opts.rocks ?? 12, dots: true }, avoid: (x, y) => Math.abs(y - H / 2) < 24 && x < 460, road: opts.road, stream: opts.stream, marsh: opts.marsh, trail: opts.trail,
    cliff: opts.cliff, minContour: 160 });
  const hm = Math.round(H * 0.8);
  const sy = hm / H;
  const scalePts = o => o && { ...o, pts: o.pts.map(([x, y]) => [x * MW / DW * 1.6 - 120, y * sy]) };
  const m = terrain({ id: `${seed}-m`, W: MW, H: hm, seed: seed + '-m', cell: 4, taperY: 0.26, relief: 0.62, interval: 0.11, freq: 1 / 120,
    hills: (opts.hills || []).map(h => ({ ...h, x: h.x * MW / DW * 1.6 - 120, y: h.y * sy, sx: h.sx * 0.6, sy: h.sy * sy })),
    veg: opts.veg === false ? null : { level: opts.veg ?? 0.64 }, open: opts.open === false ? null : { level: opts.open ?? 0.72 },
    boulders: { n: 6, dots: true }, avoid: (x, y) => Math.abs(y - hm / 2) < 22, road: opts.road && { ...scalePts(opts.road), label: undefined, ...(opts.m?.road || {}) }, stream: opts.m?.stream || scalePts(opts.stream),
    marsh: opts.m?.marsh || (opts.marsh && { x: opts.marsh.x * MW / DW * 1.6 - 120, y: opts.marsh.y * sy, w: opts.marsh.w * 0.6, h: opts.marsh.h * sy }),
    cliff: scalePts(opts.cliff), minContour: 120 });
  return { h: H, hm, svg: svg(DW, H, 't t-d', d.svg, 'xMinYMid slice') + svg(MW, hm, 't t-m', m.svg) };
}

function strips() {
  return {
    // the conventional path crosses the sheet on a diagonal
    path: strip('path', '38-strip-path', { hills: [g(260, 100, 80, 40, 0.5), g(980, 120, 110, 44, 0.55)],
      road: { pts: [[-10, 186], [220, 170], [480, 140], [720, 104], [960, 60], [1200, 24]], label: 'THE CONVENTIONAL PATH', labelAt: '42%' } }),
    mind: strip('mind', '38-strip-mind', { hills: [g(700, 70, 90, 34, 0.5)], open: false, veg: 0.68,
      stream: { pts: [[-10, 30], [220, 56], [430, 50], [700, 100], [980, 90], [1200, 120]] }, marsh: { x: 440, y: 44, w: 220, h: 70 },
      m: { stream: { pts: [[-10, 16], [140, 24], [300, 18], [430, 28]] }, marsh: { x: 230, y: 76, w: 150, h: 30 } } }),
    work: strip('work', '38-strip-work', { hills: [g(260, 110, 100, 60, 0.75), g(940, 90, 120, 50, 0.6)], veg: 0.6,
      cliff: { pts: [[200, 150], [260, 162], [330, 160]] }, rocks: 22,
      trail: { pts: [[1200, 30], [1000, 70], [820, 120], [620, 140], [420, 180], [200, 192], [-10, 196]] } }),
    money: strip('money', '38-strip-money', { hills: [g(620, 80, 140, 40, 0.6)], open: 0.6, veg: 0.74, openBias: bump(820, 70, 260, 50, 0.15) }),
    body: strip('body', '38-strip-body', { hills: [g(820, 110, 120, 60, 0.7), g(300, 150, 80, 40, 0.45)], veg: 0.54, open: false,
      stream: { pts: [[1200, 10], [1010, 60], [880, 150], [700, 190], [460, 196], [200, 206], [-10, 210]] } }),
    people: strip('people', '38-strip-people', { hills: [g(360, 80, 100, 40, 0.5)], open: 0.66, veg: 0.66,
      road: { pts: [[-10, 150], [240, 120], [520, 100], [820, 60], [1200, 10]] }, m: { road: { pts: [[-10, 120], [160, 110], [300, 102], [430, 90]] } } }),
  };
}

function featured(seed, i) {
  // the quote sits over the left two thirds, so fills stay to the right; each window gets its own feature
  const textClear = clear(0, 0, 820, 400, 0.6);
  const feats = [
    { hills: [g(980, 200, 140, 90, 0.7)], stream: { pts: [[1200, 80], [1110, 130], [1050, 210], [1025, 280], [1016, 300]] }, pond: [1010, 322, 46, 26] },
    { hills: [g(520, 180, 260, 120, 0.75, 0.2), g(1020, 260, 90, 60, 0.4)], openBias: bump(1040, 190, 140, 90, 0.4) },
    { hills: [g(900, 180, 160, 100, 0.85, -0.3)], cliff: { pts: [[840, 300], [900, 316], [970, 312], [1030, 296]] } },
    { hills: [g(420, 200, 220, 110, 0.7, 0.3), g(1000, 150, 120, 70, 0.5)], stream: { pts: [[1200, 330], [1060, 300], [960, 360], [880, 410]] } },
  ][i % 4];
  const d = terrain({ id: `${seed}-d`, W: DW, H: 400, seed, cell: 6, taperY: 0.3, relief: 0.5, interval: 0.1, freq: 1 / 240,
    hills: feats.hills, veg: { level: 0.66, max: 2, bias: sum(bump(1100, 200, 160, 160, 0.14), textClear) },
    open: feats.openBias ? { level: 0.72, bias: sum(feats.openBias, textClear) } : null,
    cliff: feats.cliff, stream: feats.stream, pond: feats.pond && pond('fp' + i, ...feats.pond, seed + ':pond'),
    boulders: { n: 16, dots: true }, avoid: box(0, 0, 1000, 400), minContour: 260 });
  const m = terrain({ id: `${seed}-m`, W: MW, H: 460, seed: seed + '-m', cell: 4, taperY: 0.26, relief: 0.4, interval: 0.13, freq: 1 / 160,
    hills: [g(360, 200 + (i % 2 ? 60 : -20), 90, 90, 0.6, 0.3 * i)], minContour: 220 });
  return svg(DW, 400, 't t-d', d.svg) + svg(MW, 460, 't t-m', m.svg);
}

function finish() {
  const d = terrain({ id: 'finish-d', W: DW, H: 330, seed: '38-finish', cell: 6, taperY: 0.26, relief: 0.45, interval: 0.1,
    hills: [g(560, 150, 170, 90, 0.7)], veg: { level: 0.66, bias: sum(bump(1100, 130, 140, 110, 0.2), clear(0, 0, 760, 330, 0.5)) },
    open: { level: 0.7, bias: sum(bump(900, 260, 160, 60, 0.3), clear(0, 0, 760, 330, 0.7)) },
    pond: pond('fd', 980, 190, 110, 60, '38-pond'), marsh: { x: 1070, y: 230, w: 110, h: 60 },
    boulders: { n: 12, dots: true }, avoid: box(0, 0, 760, 330), minContour: 240 });
  const m = terrain({ id: 'finish-m', W: MW, H: 400, seed: '38-finish-m', cell: 4, taperY: 0.24, relief: 0.45, interval: 0.1,
    hills: [g(320, 120, 100, 70, 0.6)], veg: { level: 0.7, bias: clear(0, 60, 420, 400, 0.5) },
    pond: pond('fm', 350, 372, 62, 22, '38-pond-m'), minContour: 140 });
  return svg(DW, 330, 't t-d', d.svg) + svg(MW, 400, 't t-m', m.svg);
}

// The route-choice drawing: the straight line over the hill vs. the road around it.
function routeChoice() {
  function draw({ W, H, id, seed, cell, hill, start, end, road, iso35, small }) {
    // keep rocks out of the AGE 35 circle and from under its label
    const P0 = [start[0] + (end[0] - start[0]) * iso35.op, start[1] + (end[1] - start[1]) * iso35.op];
    const nearP = (x, y) => Math.hypot(x - P0[0], y - P0[1]) < 34
      || (small ? x > P0[0] - 190 && x < P0[0] - 14 && y > P0[1] - 66 && y < P0[1] - 18 : x > P0[0] + 16 && x < P0[0] + 230 && y > P0[1] - 20 && y < P0[1] + 32);
    const t = terrain({ id, W, H, seed, cell, avoid: nearP, taperY: 0.08, taperX: 0.05, relief: 0.38, interval: 0.09, freq: 1 / (small ? 170 : 260),
      hills: hill, veg: { level: 0.76, bias: (x, y) => gauss(x, y, { ...hill[0], sx: hill[0].sx * 0.55, sy: hill[0].sy * 0.6, x: hill[0].x - hill[0].sx * 0.25, a: 0.4 }) },
      open: { level: 0.8, bias: (x, y) => gauss(x, y, { x: start[0] + (small ? 60 : 130), y: start[1] - 20, sx: small ? 80 : 150, sy: small ? 50 : 60, a: 0.36 }) },
      boulders: { n: small ? 14 : 30, dots: true, field: (x, y) => Math.hypot(x - hill[0].x, y - hill[0].y) < hill[0].sx * 1.6 },
      road: { pts: road, label: 'THE CONVENTIONAL PATH', labelAt: small ? '74%' : '76%', dy: small ? -8 : -10 }, minContour: small ? 120 : 200 });
    const R = t.road;
    const at = R.at(iso35.road);
    const P = [start[0] + (end[0] - start[0]) * iso35.op, start[1] + (end[1] - start[1]) * iso35.op];
    let crowd = '';
    const ri = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const N = small ? 26 : 52;
    for (let k = 0; k < N; k++) {
      const u = iso35.road - 0.2 * Math.pow(ri(k + 1), 0.7) + 0.04 * (ri(k + 7) - 0.5);
      const p = R.at(Math.max(0.03, u));
      const off = (ri(k + 3) - 0.5) * (small ? 10 : 14);
      const nx = Math.cos(p.ang + Math.PI / 2), ny = Math.sin(p.ang + Math.PI / 2);
      const s = small ? 0.8 : 1;
      crowd += `<use href="#rn" x="${r1(p.x + nx * off - 4 * s)}" y="${r1(p.y + ny * off - 15 * s)}" width="${8 * s}" height="${17 * s}"/>`;
    }
    const tri = (x, y, s) => `M${x} ${r1(y - s)}L${r1(x + s * 0.866)} ${r1(y + s / 2)}L${r1(x - s * 0.866)} ${r1(y + s / 2)}Z`;
    const ang = Math.atan2(end[1] - start[1], end[0] - start[0]);
    const sx = start[0] + Math.cos(ang) * 30, sy = start[1] + Math.sin(ang) * 30;
    const ex = end[0] - Math.cos(ang) * 33, ey = end[1] - Math.sin(ang) * 33;
    const fs = small ? 13 : 15;
    const ringR = small ? 30 : 40;
    const mid = [(P[0] + at.x) / 2 + (small ? 70 : 150), (P[1] + at.y) / 2 + (small ? -10 : 20)];
    const isoD = `M${r1(P[0])} ${r1(P[1])}Q${r1(mid[0])} ${r1(mid[1])} ${r1(at.x)} ${r1(at.y)}`;
    const tagX = 0.25 * P[0] + 0.5 * mid[0] + 0.25 * at.x, tagY = 0.25 * P[1] + 0.5 * mid[1] + 0.25 * at.y;
    const lbl = (x, y, lines, anchor = 'start', cls = 'rc-label') => `<text class="${cls}" x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}">${lines.map((l, i) => `<tspan x="${r1(x)}" dy="${i ? '1.2em' : 0}"${i === 0 && cls === 'rc-label' ? ' class="rc-k"' : ''}>${l}</tspan>`).join('')}</text>`;
    const ov = `
      <path class="iso" d="${isoD}"/>
      <g class="iso-tag" transform="translate(${r1(tagX)} ${r1(tagY)})"><rect x="-29" y="-12" width="58" height="24"/><text y="5" text-anchor="middle">AGE 35</text></g>
      <g class="crowd">${crowd}</g>
      <path class="op-stroke op-route" d="M${r1(sx)} ${r1(sy)}L${r1(P[0] - Math.cos(ang) * 22)} ${r1(P[1] - Math.sin(ang) * 22)}M${r1(P[0] + Math.cos(ang) * 22)} ${r1(P[1] + Math.sin(ang) * 22)}L${r1(ex)} ${r1(ey)}"/>
      <path class="op-stroke" d="${tri(start[0], start[1], 22)}"/>
      <circle class="op-stroke" cx="${end[0]}" cy="${end[1]}" r="20"/>
      <circle class="op-stroke" cx="${end[0]}" cy="${end[1]}" r="27"/>
      <circle class="op-stroke" cx="${r1(P[0])}" cy="${r1(P[1])}" r="16"/>
      <circle class="ink-ring" cx="${r1(at.x)}" cy="${r1(at.y)}" r="${ringR}"/>
    `;
    let labels;
    if (!small) {
      labels = lbl(P[0] + 26, P[1] + 2, ['TOOK RISKS · AT 35', 'Steep, rough, direct'])
        + lbl(at.x + ringR + 14, at.y - 52, ['PLAYED SAFE · AT 35', 'Flat, crowded, the long way round'])
        + lbl(at.x - ringR - 12, at.y - 50, ['“regrets which ages you faster”'], 'end', 'rc-op')
        + lbl(start[0] - 4, start[1] + 44, ['START · YOUR 20s'])
        + lbl(end[0] - 40, end[1] + 6, ['38 · TIM'], 'end');
    } else {
      labels = lbl(P[0] - 24, P[1] - 34, ['TOOK RISKS · AT 35', 'Steep, rough, direct'], 'end')
        + lbl(at.x - ringR - 12, at.y - 66, ['PLAYED SAFE · AT 35', 'Flat, crowded,', 'the long way round'], 'end')
        + lbl(at.x - ringR - 12, at.y + 4, ['“regrets which', 'ages you faster”'], 'end', 'rc-op')
        + lbl(start[0] + 30, start[1] + 8, ['START · YOUR 20s'])
        + lbl(end[0] - 36, end[1] + 6, ['38 · TIM'], 'end');
    }
    return svg(W, H, small ? 'rc rc-m' : 'rc rc-d', t.svg + ov + labels, 'xMidYMid meet');
  }
  const d = draw({ W: DW, H: 700, id: 'route-d', seed: '38-route', cell: 5,
    hill: [g(600, 330, 175, 135, 1.1, -0.3), g(420, 210, 90, 60, 0.35)], start: [140, 575], end: [1060, 95],
    road: [[140, 575], [300, 626], [560, 640], [820, 612], [985, 522], [1068, 380], [1086, 230], [1060, 95]],
    iso35: { op: 0.72, road: 0.34 } });
  const m = draw({ W: MW, H: 880, id: 'route-m', seed: '38-route-m', cell: 4, small: true,
    hill: [g(205, 440, 95, 130, 1.1, 0.2), g(120, 300, 60, 50, 0.3)], start: [70, 810], end: [340, 70],
    road: [[70, 810], [220, 850], [350, 790], [396, 620], [398, 420], [384, 240], [340, 70]],
    iso35: { op: 0.72, road: 0.33 } });
  return d + m;
}

module.exports = { hero, rough, strips, featured, finish, routeChoice, STRIP_H };
