// Twitter set: a cover (the big idea, one drawing) and a cheat sheet (all 28 lessons).
// Both 1080x1350 (4:5), rendered at 2x. node tw.js -> out/tw-cover.html, out/tw-sheet.html
const fs = require('fs');
const path = require('path');
const { terrain, gauss } = require('./terrain');

const g = (x, y, sx, sy, a, rot = 0) => ({ x, y, sx, sy, a, rot });
const SYMBOLS = fs.readFileSync(path.join(__dirname, 'out', 'index.html'), 'utf8').match(/<svg width="0" height="0"[\s\S]*?<\/svg>/)[0];
const tokens = fs.readFileSync(path.join(__dirname, 'page.css'), 'utf8').match(/:root \{[\s\S]*?\n\}/)[0];
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap">`;

// Lesson wording here is our summary; the page says so.
const GROUPS = [
  { key: 'path', name: 'Path & risk', items: ['Take risks. By 35 it shows.', 'Skip the conventional path.', 'Burn your parents’ plan.', 'More hard things, more success.'] },
  { key: 'mind', name: 'Mind', items: ['Chase obsession.', 'Set psychopath-level standards.', 'Hear disagreement calmly.', 'Turn off news and politics.', 'Visit a retirement home.'] },
  { key: 'money', name: 'Money', items: ['Learn how money works.', 'Money is a resource for freedom.', 'Read finance books. Invest early.', 'Read <i>The Bitcoin Standard</i>.', 'City while young. Suburbs later.'] },
  { key: 'work', name: 'Work', items: ['Get off the corporate ladder.', 'Corporations only pretend to care.', 'Learn skills people need.', 'Business is psychology.', 'Write online for opportunities.', 'Build online under a nickname.', 'Flow beats productivity.'] },
  { key: 'body', name: 'Body', items: ['Keep dopamine in check.', 'Games become a time suck.', 'Exercise daily, outdoors.', 'Give up alcohol.'] },
  { key: 'people', name: 'People', items: ['Kids are where freedom begins.', 'Outgrow friends, gently.', 'See your parents more.'] },
];

const BASE_CSS = `
${tokens}
* { box-sizing: border-box; }
body { margin: 0; background: var(--sheet); }
.card { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: var(--sheet); color: var(--ink); font-family: var(--f-sans); font-kerning: normal; -webkit-font-smoothing: antialiased; }
.card::before { content: ""; position: absolute; inset: 22px; border: 1.5px solid var(--ink); z-index: 9; pointer-events: none; }
.terr { position: absolute; mix-blend-mode: multiply; }
.t-open { fill: var(--open); } .t-open-rough { fill: var(--open-rough); } .t-veg1 { fill: var(--veg1); } .t-veg2 { fill: var(--veg2); } .t-veg3 { fill: var(--veg3); }
.t-stream { fill: none; stroke: var(--water); stroke-width: 1.8; } .t-contour { fill: none; stroke: var(--contour); stroke-width: 1.1; } .t-index { stroke-width: 2.2; }
.t-rock { fill: var(--ink); } .t-road-case { fill: none; stroke: var(--ink); stroke-width: 11; } .t-road { fill: none; stroke: var(--road-fill); stroke-width: 7.5; }
.top { position: absolute; left: 56px; right: 56px; top: 50px; display: flex; justify-content: space-between; font-stretch: 75%; font-weight: 700; font-size: 22px; letter-spacing: .12em; text-transform: uppercase; z-index: 2; }
.halo { text-shadow: -2px -2px 0 var(--sheet), 2px -2px 0 var(--sheet), -2px 2px 0 var(--sheet), 2px 2px 0 var(--sheet), 0 -3px 0 var(--sheet), 0 3px 0 var(--sheet), -3px 0 0 var(--sheet), 3px 0 0 var(--sheet), 0 0 6px var(--sheet); }
.foot { position: absolute; left: 56px; right: 56px; bottom: 46px; font-stretch: 87%; font-size: 18px; line-height: 1.35; z-index: 2; }
.foot b { font-stretch: 75%; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; font-size: 15px; margin-right: 10px; }
`;

// ---------- cheat sheet ----------
function sheet() {
  const t = terrain({ id: 'card', W: 1036, H: 360, seed: '38-tw-sheet', cell: 4, taperY: 0.12, taperX: 0.04, relief: 0.4, interval: 0.1, freq: 1 / 240,
    hills: [g(700, 170, 200, 105, 1.0, -0.3)],
    veg: { level: 0.66, max: 2, bias: (x, y) => 0.32 * Math.exp(-(((x - 1010) / 70) ** 2 + ((y - 220) / 130) ** 2) / 2) - (x < 900 ? 0.6 : 0) },
    boulders: { n: 10, dots: true, field: (x, y) => x > 880 }, minContour: 300 });
  let n = 0;
  const col = gs => gs.map(gr => `
      <section class="grp">
        <h2><svg class="p" viewBox="0 0 24 24"><use href="#p-${gr.key}"/></svg>${gr.name}</h2>
        <ol>${gr.items.map(it => `<li><span class="ring">${++n}</span><span class="txt">${it}</span></li>`).join('')}</ol>
      </section>`).join('');
  const left = col(GROUPS.slice(0, 3)), right = col(GROUPS.slice(3));
  return `${FONTS}
<style>${BASE_CSS}
.terr { left: 22px; top: 22px; width: 1036px; height: 360px; }
h1 { position: absolute; left: 50px; top: 104px; margin: 0; font-stretch: 125%; font-weight: 900; font-size: 172px; line-height: .82; letter-spacing: -.035em; color: var(--op); mix-blend-mode: multiply; z-index: 2; }
.sub { position: absolute; left: 56px; top: 270px; margin: 0; color: var(--op-ink); font-weight: 650; font-size: 42px; line-height: 1.08; letter-spacing: -.01em; z-index: 2; }
.cols { position: absolute; left: 56px; right: 56px; top: 392px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 44px; z-index: 2; }
.grp + .grp { margin-top: 22px; }
.grp h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; padding-bottom: 8px; border-bottom: 2px solid var(--ink); font-stretch: 75%; font-weight: 800; font-size: 23px; letter-spacing: .12em; text-transform: uppercase; }
.grp .p { width: 26px; height: 26px; color: var(--ink); flex: none; }
.grp ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; }
.grp li { display: grid; grid-template-columns: 40px 1fr; gap: 12px; align-items: center; min-height: 38px; }
.ring { width: 38px; height: 38px; border: 3px solid var(--op); border-radius: 50%; display: grid; place-items: center; color: var(--op-ink); font-stretch: 75%; font-weight: 800; font-size: 17px; font-variant-numeric: tabular-nums; mix-blend-mode: multiply; }
.txt { font-stretch: 90%; font-weight: 560; font-size: 28.5px; line-height: 1.12; letter-spacing: -.005em; }
.txt i { font-style: italic; font-weight: 560; }
</style>
${SYMBOLS}
<div class="card">
  <svg class="terr" viewBox="0 0 1036 360">${t.svg}</svg>
  <div class="top halo"><span>Tim Denning’s essay, in one image</span><span>28 lessons</span></div>
  <h1>I’M 38.</h1>
  <p class="sub halo">If You’re in Your 20’s or 30’s, Read This.</p>
  <div class="cols"><div>${left}</div><div>${right}</div></div>
  <p class="foot"><b>Source</b>Tim Denning, “I’m 38. If You’re in Your 20’s or 30’s, Read This.” X Article, Jan 2026. Lesson wording is a summary.</p>
</div>`;
}

// ---------- cover: the big idea ----------
function cover() {
  const W = 1036, H = 640;
  const start = [70, 540], top = [930, 110], low = [930, 552];
  const t = terrain({ id: 'card', W, H, seed: '38-tw-cover', cell: 4, taperY: 0.08, taperX: 0.06, relief: 0.36, interval: 0.09, freq: 1 / 230,
    hills: [g(500, 330, 200, 160, 1.15, -0.3)],
    veg: { level: 0.74, max: 2, bias: (x, y) => 0.42 * Math.exp(-(((x - 430) / 110) ** 2 + ((y - 290) / 100) ** 2) / 2) },
    boulders: { n: 16, dots: true, field: (x, y) => Math.hypot(x - 500, y - 330) < 250 && y < 480 }, minContour: 260,
    road: { pts: [start, [240, 578], [520, 586], [780, 574], low] } });
  const R = t.road;
  const ri = k => { const x = Math.sin(k * 12.9898) * 43758.5453; return x - Math.floor(x); };
  let crowd = '';
  for (let k = 0; k < 46; k++) {
    const p = R.at(0.12 + 0.86 * Math.pow(ri(k + 1), 0.8));
    const off = (ri(k + 5) - 0.5) * 12;
    crowd += `<use href="#rn" x="${(p.x - 5 + off * 0.2).toFixed(1)}" y="${(p.y - 21 + off).toFixed(1)}" width="10" height="21"/>`;
  }
  const ang = Math.atan2(top[1] - start[1], top[0] - start[0]);
  const s0 = [start[0] + Math.cos(ang) * 36, start[1] + Math.sin(ang) * 36], s1 = [top[0] - Math.cos(ang) * 30, top[1] - Math.sin(ang) * 30];
  const drawing = `
    ${t.svg}
    <path d="M${top[0]} 40V${H - 34}" class="d35"/>
    <g class="crowd">${crowd}</g>
    <path class="op-line" d="M${s0[0].toFixed(1)} ${s0[1].toFixed(1)}L${s1[0].toFixed(1)} ${s1[1].toFixed(1)}"/>
    <path class="op-line" d="M${start[0]} ${start[1] - 26}l22.5 39h-45z"/>
    <circle class="op-line" cx="${top[0]}" cy="${top[1]}" r="22"/>
    <circle class="ink-ring" cx="${low[0]}" cy="${low[1]}" r="22"/>
    <text class="lab k" x="${top[0]}" y="30" text-anchor="middle">AGE 35</text>
    <text class="lab k op" x="${top[0] - 40}" y="${top[1] - 32}" text-anchor="end">TOOK RISKS</text>
    <text class="lab" x="${top[0] - 40}" y="${top[1] - 2}" text-anchor="end">steep, rough, direct</text>
    <text class="lab k" x="${low[0] - 38}" y="${low[1] - 64}" text-anchor="end">PLAYED SAFE</text>
    <text class="lab" x="${low[0] - 38}" y="${low[1] - 34}" text-anchor="end">flat, crowded, the long way</text>
    <text class="lab k" x="${start[0] - 26}" y="${start[1] + 62}">YOUR 20s</text>`;
  return `${FONTS}
<style>${BASE_CSS}
.head { position: absolute; left: 56px; right: 56px; top: 116px; z-index: 2; }
.q { margin: 0; color: var(--op-ink); font-stretch: 100%; font-weight: 750; font-size: 63px; line-height: 1.06; letter-spacing: -.02em; text-indent: -.4em; text-wrap: balance; }
.by { margin: 22px 0 0; font-size: 24px; font-weight: 500; }
.by b { font-weight: 700; }
.terr { left: 22px; top: 470px; width: ${W}px; height: ${H}px; }
.d35 { stroke: var(--ink); stroke-width: 2; stroke-dasharray: 3 7; stroke-linecap: round; }
.crowd { fill: var(--ink); }
.op-line { fill: none; stroke: var(--op); stroke-width: 5; }
.ink-ring { fill: none; stroke: var(--ink); stroke-width: 2.5; }
.lab { font-family: var(--f-sans); font-stretch: 90%; font-weight: 600; font-size: 25px; fill: var(--ink); paint-order: stroke; stroke: var(--sheet); stroke-width: 7px; stroke-linejoin: round; }
.lab.k { font-stretch: 75%; font-weight: 800; font-size: 25px; letter-spacing: .1em; }
.lab.op { fill: var(--op-ink); }
.next { position: absolute; left: 56px; right: 56px; bottom: 96px; margin: 0; font-stretch: 112%; font-weight: 800; font-size: 30px; letter-spacing: -.005em; z-index: 2; }
</style>
${SYMBOLS}
<div class="card">
  <div class="top halo"><span>Tim Denning, at 38</span><span>The big idea</span></div>
  <div class="head">
    <p class="q">“When you turn 35 you’ll see the difference between those who took risks and those who didn’t.”</p>
    <p class="by">From <b>“I’m 38. If You’re in Your 20’s or 30’s, Read This.”</b></p>
  </div>
  <svg class="terr" viewBox="0 0 ${W} ${H}">${drawing}</svg>
  <p class="next">All 28 lessons are in the next image.</p>
  <p class="foot"><b>Source</b>Tim Denning, X Article, Jan 2026. Drawing is ours, not to scale.</p>
</div>`;
}

fs.writeFileSync(path.join(__dirname, 'out', 'tw-sheet.html'), sheet());
fs.writeFileSync(path.join(__dirname, 'out', 'tw-cover.html'), cover());
console.log('tw ok');
