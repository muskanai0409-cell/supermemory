// Share card: 1080x1350 (4:5) summary of the whole essay. node card.js -> out/card.html
const fs = require('fs');
const path = require('path');
const { THEMES, LESSONS } = require('./content');
const { terrain } = require('./terrain');

const g = (x, y, sx, sy, a, rot = 0) => ({ x, y, sx, sy, a, rot });
const t = terrain({ id: 'card', W: 1032, H: 470, seed: '38-card', cell: 4, taperY: 0.08, taperX: 0.04, relief: 0.42, interval: 0.095, freq: 1 / 240,
  hills: [g(600, 200, 190, 130, 1.05, -0.35), g(930, 400, 80, 50, 0.4)],
  veg: { level: 0.66, bias: (x, y) => (x < 840 && y < 300 ? -0.6 : 0) + 0.3 * Math.exp(-(((x - 1000) / 90) ** 2 + ((y - 160) / 140) ** 2) / 2) - 0.3 * Math.exp(-(((x - 420) / 240) ** 2 + ((y - 220) / 160) ** 2) / 2) },
  open: { level: 0.8, bias: (x, y) => 0.34 * Math.exp(-(((x - 800) / 120) ** 2 + ((y - 420) / 50) ** 2) / 2) - (x < 840 && y < 380 ? 0.6 : 0) },
  stream: { pts: [[250, -10], [280, 100], [240, 220], [150, 330], [40, 400], [-10, 420]] },
  boulders: { n: 26, dots: true, field: (x, y) => !(x < 700 && y < 260) },
  road: { pts: [[560, 480], [700, 420], [840, 350], [960, 300], [1040, 270]], label: 'THE CONVENTIONAL PATH', labelAt: '50%' } });

const pics = ['path', 'mind', 'work', 'money', 'body', 'people'];
const SYMBOLS = fs.readFileSync(path.join(__dirname, 'out', 'index.html'), 'utf8').match(/<svg width="0" height="0"[\s\S]*?<\/svg>/)[0];
const css = fs.readFileSync(path.join(__dirname, 'page.css'), 'utf8').match(/:root \{[\s\S]*?\n\}/)[0];
const half = Math.ceil(LESSONS.length / 2);
const col = (from, to) => LESSONS.slice(from, to).map((l, i) => `<li><span class="n">${from + i + 1}</span><svg class="p" viewBox="0 0 24 24"><use href="#p-${l.theme}"/></svg><span class="c">${l.card}</span></li>`).join('');

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Overpass:wght@700;800&display=swap">
<style>
${css}
* { box-sizing: border-box; }
body { margin: 0; background: var(--sheet); }
.card { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: var(--sheet); color: var(--ink); font-family: var(--f-sans);
  background-image: repeating-linear-gradient(101deg, transparent 0 151px, var(--north) 151px 152px); }
.card::before { content: ""; position: absolute; inset: 24px; border: 1.5px solid var(--ink); z-index: 5; pointer-events: none; }
.terr { position: absolute; left: 24px; top: 24px; width: 1032px; height: 470px; mix-blend-mode: multiply; }
.t-open { fill: var(--open); } .t-open-rough { fill: var(--open-rough); } .t-veg1 { fill: var(--veg1); } .t-veg2 { fill: var(--veg2); } .t-veg3 { fill: var(--veg3); }
.t-stream { fill: none; stroke: var(--water); stroke-width: 1.5; } .t-contour { fill: none; stroke: var(--contour); stroke-width: .9; } .t-index { stroke-width: 1.8; }
.t-rock { fill: var(--ink); } .t-road-case { fill: none; stroke: var(--ink); stroke-width: 8; } .t-road { fill: none; stroke: var(--road-fill); stroke-width: 5.4; }
.t-road-label { font-family: var(--f-road); font-weight: 800; font-size: 12px; letter-spacing: .16em; fill: var(--ink); paint-order: stroke; stroke: var(--sheet); stroke-width: 3.5px; }
.top { position: absolute; left: 56px; right: 56px; top: 54px; display: flex; justify-content: space-between; font-stretch: 75%; font-weight: 650; font-size: 15px; letter-spacing: .1em; text-transform: uppercase; z-index: 2; }
.top span { background: var(--sheet); padding: 1px 6px; margin: 0 -6px; }
h1 { position: absolute; left: 50px; top: 104px; margin: 0; font-stretch: 125%; font-weight: 900; font-size: 196px; line-height: .82; letter-spacing: -.035em; color: var(--op); mix-blend-mode: multiply; z-index: 2; }
.sub { position: absolute; left: 56px; top: 290px; margin: 0; width: 640px; color: var(--op-ink); font-weight: 650; font-size: 44px; line-height: 1.06; letter-spacing: -.01em; z-index: 2;
  text-shadow: 0 0 2px var(--sheet), 0 0 3px var(--sheet), 0 0 6px var(--sheet); }
.by { position: absolute; left: 56px; top: 410px; margin: 0; font-size: 19px; z-index: 2; }
.by span { background: var(--sheet); padding: 2px 8px; margin-left: -8px; }
.clue { position: absolute; left: 56px; right: 56px; top: 520px; border: 1.5px solid var(--ink); background: var(--sheet); z-index: 2; }
.clue-h { display: flex; justify-content: space-between; background: var(--op); color: var(--sheet); padding: 10px 14px; font-stretch: 112%; font-weight: 800; font-size: 17px; letter-spacing: .06em; text-transform: uppercase; }
.cols { display: grid; grid-template-columns: 1fr 1fr; }
.cols ol { margin: 0; padding: 0; list-style: none; }
.cols ol + ol { border-left: 1.5px solid var(--ink); }
.cols li { display: grid; grid-template-columns: 40px 36px 1fr; align-items: center; height: 46px; border-top: 1px solid var(--ink); font-stretch: 82%; font-size: 19px; font-weight: 500; }
.cols li:nth-child(3n+1):not(:first-child) { border-top-width: 2px; }
.n { text-align: center; font-weight: 700; color: var(--op-ink); font-variant-numeric: tabular-nums; border-right: 1px solid var(--ink); height: 100%; display: grid; place-items: center; }
.p { width: 20px; height: 20px; justify-self: center; color: var(--ink); }
.c { padding: 0 10px 0 4px; border-left: 1px solid var(--ink); height: 100%; display: flex; align-items: center; }
.foot { position: absolute; left: 56px; right: 56px; bottom: 50px; display: flex; justify-content: space-between; align-items: end; gap: 24px; font-stretch: 87%; font-size: 16px; line-height: 1.35; z-index: 2; }
.foot b { font-stretch: 75%; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-size: 13px; display: block; }
.inks { display: flex; } .inks i { width: 30px; height: 16px; border: 1px solid var(--ink); border-right-width: 0; } .inks i:last-child { border-right-width: 1px; }
</style>
${SYMBOLS}
<div class="card">
  <svg class="terr" viewBox="0 0 1032 470">${t.svg}</svg>
  <div class="top"><span>Orienteering map · Class 20–39</span><span>${LESSONS.length} controls</span></div>
  <h1>I’M 38.</h1>
  <p class="sub">If You’re in Your 20’s or 30’s, Read This.</p>
  <p class="by"><span>Tim Denning’s essay as one course. Purple: his words. Black: ours.</span></p>
  <div class="clue">
    <div class="clue-h"><span>The whole essay on one card</span><span>Start → Finish</span></div>
    <div class="cols"><ol>${col(0, half)}</ol><ol>${col(half, LESSONS.length)}</ol></div>
  </div>
  <div class="foot">
    <div><b>Source</b>“I’m 38. If You’re in Your 20’s or 30’s, Read This.” Tim Denning, X Article, 20 Jan 2026. Card wording is our summary. Unofficial.</div>
    <div class="inks" aria-hidden="true"><i style="background:var(--ink)"></i><i style="background:var(--contour)"></i><i style="background:var(--open)"></i><i style="background:var(--veg2)"></i><i style="background:var(--water)"></i><i style="background:var(--op)"></i></div>
  </div>
</div>`;
fs.writeFileSync(path.join(__dirname, 'out', 'card.html'), html);
console.log('card ok');
