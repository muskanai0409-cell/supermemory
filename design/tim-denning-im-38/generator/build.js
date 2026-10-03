// Builds the single-file artifact page into out/index.html
const fs = require('fs');
const path = require('path');
const { THEMES, LESSONS, SCARS } = require('./content');
const W = require('./windows');

const esc = s => s.replace(/&(?!amp;)/g, '&amp;').replace(/</g, '&lt;');
const N = LESSONS.length;
const X_URL = 'https://x.com/Tim_Denning/status/2013552215097778231';
const SUB_URL = 'https://timdenning.substack.com/p/im-38-if-youre-in-your-20s-or-30s';

// deterministic wander for control circles in the track
const wander = i => { const x = Math.sin((i + 3) * 78.233) * 43758.5453; return x - Math.floor(x); };
// first sentence bold, the rest regular
const splitHead = s => { const m = s.match(/^(.+?[.?!][”’]?)\s+(.+)$/); return m ? `<strong>${esc(m[1])}</strong> ${esc(m[2])}` : `<strong>${esc(s)}</strong>`; };

const strips = W.strips();
let featCount = 0;

// ---------- symbols ----------
const SYMBOLS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="p-path" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter"><path d="M12 22.5V13.2L5.2 6.4M12 13.2l6.8-6.8"/><path d="M4.4 11V5.6h5.4M19.6 11V5.6h-5.4"/></g></symbol>
  <symbol id="p-mind" viewBox="0 0 24 24"><path d="M2.5 2.2h19" stroke="currentColor" stroke-width="2.6" fill="none"/><circle cx="12" cy="13.6" r="2.6" fill="currentColor"/><path d="M8.8 17h6.4v6.5H8.8z" fill="currentColor"/></symbol>
  <symbol id="p-work" viewBox="0 0 24 24"><path d="M8.6 8.4V5h6.8v3.4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M2.5 8.4h19v13h-19z" fill="currentColor"/><path d="M2.5 13.6h19" stroke="var(--sheet)" stroke-width="1.5"/></symbol>
  <symbol id="p-money" viewBox="0 0 24 24"><g fill="currentColor"><path d="M2.5 17.8h14v4.6h-14zM6.5 11.8h14v4.6h-14zM4 5.8h14v4.6H4z"/></g><g stroke="var(--sheet)" stroke-width="1.1"><path d="M2.5 20.1h14M6.5 14.1h14M4 8.1h14"/></g></symbol>
  <symbol id="p-body" viewBox="0 0 24 24"><circle cx="15.6" cy="3.9" r="2.5" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8l-2.8 6.4" stroke-width="3.6"/><path d="M13.8 8.6l3.4 3.2 2.8-1.2M13.3 8.9l-3.8 1.2-1.9-2.6M11.2 14.4l4 2.7-.7 5.2M11.2 14.4l-2.9 3.6-4.3.9" stroke-width="2.3"/></g></symbol>
  <symbol id="p-people" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="7.4" cy="4.3" r="2.5"/><path d="M4.8 7.8h5.2v7.8H4.8zM5 15.4h2v7H5zM7.8 15.4h2v7h-2z"/><circle cx="17.4" cy="10.6" r="2"/><path d="M15.3 13.4h4.2v5.2h-4.2zM15.5 18.4h1.6v4h-1.6zM17.7 18.4h1.6v4h-1.6z"/></g><path d="M10 10.2l5.4 4.3" stroke="currentColor" stroke-width="1.7" fill="none"/></symbol>
  <symbol id="rn" viewBox="0 0 8 17"><circle cx="4" cy="2.1" r="2.1"/><path d="M1.5 4.8h5v6.6h-5zM1.8 11.2h1.9v5.8H1.8zM4.3 11.2h1.9v5.8H4.3z"/></symbol>
</svg>`;
const pic = (t, cls = '') => `<svg class="pic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#p-${t}"/></svg>`;

// ---------- scale bar in years (used twice: hero and finish) ----------
const yrs = Array.from({ length: 20 }, (_, i) => 20 + i);
const scaleBar = (idPrefix, labelId) => `
    <div class="scale-bar" role="radiogroup" aria-labelledby="${labelId}">
      ${yrs.map(y => `<button type="button" class="yr" data-age="${y}"${idPrefix ? ` id="${idPrefix}${y}"` : ''} role="radio" aria-checked="false" tabindex="${y === 20 ? 0 : -1}" aria-label="${y}"><span></span></button>`).join('')}
      <span class="you" hidden aria-hidden="true"></span>
    </div>`;

// ---------- hero ----------
const HERO = `
<header class="hero">
  <div class="terrain" aria-hidden="true">${W.hero()}</div>
  <div class="hero-top"><span class="ko">Orienteering map · Age class 20–39</span><span class="ko">Sheet 1 of 1</span></div>
  <div class="hero-grid">
    <div class="hero-title">
      <h1 class="op display">I’M 38.</h1>
      <p class="sub">If You’re in Your 20’s or 30’s, Read This.</p>
      <p class="byline"><span class="ko">Tim Denning’s essay, drawn as an orienteering course. It began as an X&nbsp;thread and a Substack post in January 2025 and ran as an X&nbsp;Article on 20&nbsp;January&nbsp;2026.</span></p>
    </div>
    <dl class="coursebox">
      <div class="cb-h"><dt class="vh">Class</dt><dd>Class 20–39</dd></div>
      <div><dt>Controls</dt><dd>${N}</dd></div>
      <div><dt>Set by</dt><dd>Tim Denning, 38</dd></div>
      <div><dt>Start</dt><dd>Wherever you are</dd></div>
      <div><dt>Ink<span class="vh">, purple</span></dt><dd><span class="swatch-op"></span>His words, verbatim</dd></div>
      <div><dt><span class="vh">Ink, black</span></dt><dd><span class="swatch-ink"></span>Our notes</dd></div>
    </dl>
  </div>
  <div class="scale" id="age-scale">
    <div class="scale-marks" aria-hidden="true">
      <span class="mk mk-38"><span class="ko">38 · Tim, writing this</span></span>
      <span class="mk mk-35"><span class="ko">35 · the difference shows</span></span>
    </div>
    ${scaleBar('age-', 'scale-cap')}
    <div class="scale-nums" aria-hidden="true">${yrs.map(y => `<span${[20, 25, 30, 35, 39].includes(y) ? ' class="on ko"' : ''}>${y}</span>`).join('')}</div>
    <p class="scale-cap" id="scale-cap"><span class="ko">Scale · 1 segment = 1 year · Your age</span></p>
    <p class="age-out" aria-live="polite"><span class="ko" data-age-out>Pick your age to see where you stand.</span></p>
  </div>
</header>`;

// ---------- key ----------
const KEY = `
<section class="key" aria-labelledby="key-h">
  <h2 class="label" id="key-h">How to read this map</h2>
  <ul role="list">
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><rect x="1" y="1" width="38" height="22" fill="var(--sheet)" stroke="var(--ink)" stroke-width="1"/></svg><span>Easy going</span></li>
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><rect x="1" y="1" width="19" height="22" fill="var(--open)"/><rect x="20" y="1" width="19" height="22" fill="var(--open-rough)"/></svg><span>Open ground, exposed</span></li>
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><rect x="1" y="1" width="12" height="22" fill="var(--veg1)"/><rect x="14" y="1" width="12" height="22" fill="var(--veg2)"/><rect x="27" y="1" width="12" height="22" fill="var(--veg3)"/></svg><span>Hard going. Darker is harder.</span></li>
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 18c8-9 28-9 36 0M8 20c6-5 18-5 24 0M2 10c10-9 26-9 36 0" fill="none" stroke="var(--contour)" stroke-width="1.1"/></svg><span>Climb</span></li>
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M8 17l4.5-8 4.5 8z" fill="var(--ink)"/><circle cx="24" cy="14" r="2.2" fill="var(--ink)"/><path d="M2 21c12-3 24 0 36-4" fill="none" stroke="var(--water)" stroke-width="1.5"/></svg><span>Rock and water</span></li>
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M1 15c10-6 26-6 38-2" fill="none" stroke="var(--ink)" stroke-width="7.5"/><path d="M1 15c10-6 26-6 38-2" fill="none" stroke="var(--road-fill)" stroke-width="5"/></svg><span>The conventional path</span></li>
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 21L16 10" stroke="var(--op)" stroke-width="2" class="mb"/><circle cx="27" cy="9" r="7.5" fill="none" stroke="var(--op)" stroke-width="2" class="mb"/></svg><span>Tim’s route. One circle per lesson.</span></li>
    <li><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M10 3.5l8 13.8H2z" fill="none" stroke="var(--op)" stroke-width="2" class="mb"/><circle cx="30" cy="12" r="5.5" fill="none" stroke="var(--op)" stroke-width="2" class="mb"/><circle cx="30" cy="12" r="9" fill="none" stroke="var(--op)" stroke-width="2" class="mb"/></svg><span>Start and finish</span></li>
  </ul>
</section>`;

// ---------- tally + setter's note ----------
const counts = {};
LESSONS.forEach(l => { counts[l.theme] = (counts[l.theme] || 0) + 1; });
const order = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || Object.keys(THEMES).indexOf(a) - Object.keys(THEMES).indexOf(b));
const OVERVIEW = `
<section class="overview">
  <div class="tally">
    <p class="label">Course notes</p>
    <h2 class="h2">${N} of his lessons, by subject</h2>
    <ul class="tally-rows" role="list">
      ${order.map(t => `<li><span class="t-name">${THEMES[t].long}</span><span class="t-glyphs" aria-hidden="true">${Array.from({ length: counts[t] }, () => pic(t)).join('')}</span><span class="t-n">${counts[t]}</span></li>`).join('')}
    </ul>
    <p class="note">One figure per lesson, each counted once by its main subject. The sorting is ours.</p>
  </div>
  <div class="setter">
    <p class="label">Course setter’s note</p>
    <p>Tim Denning wrote this at 38 for anyone in their 20s or 30s. Each lesson opens with a blunt line or two. On this map every lesson is a control, a circle you have to reach. Run them all and you have his advice.</p>
    <p>His words are printed in purple, exactly as he wrote them. We drew the ${N} lessons we could trace to his published text, so the essay may hold a few more. Where we could not confirm his exact words, the lesson is in black.</p>
  </div>
</section>`;

// ---------- rough ground ----------
const ROUGH = `
<section class="rough" aria-labelledby="rough-h">
  <div class="terrain" aria-hidden="true">${W.rough()}</div>
  <div class="rough-in">
    <p class="label"><span class="ko">Rough ground</span></p>
    <h2 class="h2" id="rough-h"><span class="ko">Why listen to a 38-year-old</span></h2>
    <p class="rough-lead"><span class="ko">Not much fazes me anymore.</span></p>
    <p class="rough-lead small"><span class="ko">I’ve been part of so much drama –</span></p>
    <ul class="scars" role="list">${SCARS.map((s, i) => `<li style="--dy:${(((i * 37) % 23) - 11) * 0.5}px;--dx:${(i * 37) % 19}px"><span class="ko">${esc(s)}</span></li>`).join('')}</ul>
    <p class="note"><span class="ko">His list, in his order and his words. He gives no dates. The purple line goes straight through.</span></p>
  </div>
</section>`;

// ---------- route choice ----------
const ROUTE = `
<section class="route" id="route" aria-labelledby="route-h">
  <div class="route-head">
    <p class="label">Route choice</p>
    <h2 class="h2" id="route-h">The difference shows at 35</h2>
  </div>
  <figure class="route-fig">
    <div class="route-draw" role="img" aria-label="Drawing of two routes from a start triangle, your 20s, to a finish circle, Tim at 38. Took risks: a purple route runs straight over a steep hill, steep, rough and direct. Played safe: the conventional path loops the long way round it, flat and crowded with people. A dashed line marks age 35. By then the purple route is past the summit and the crowd is still on the flat road, beside his words “regrets which ages you faster.”">${W.routeChoice()}</div>
    <figcaption class="note">Not to scale. In orienteering, masters classes start at age 35.</figcaption>
  </figure>
  <blockquote class="route-quote" cite="${SUB_URL}">
    <p class="rq-head">“${esc(LESSONS[0].head)}</p>
    <p class="rq-body">How old you feel comes down to how you lived. Not taking risks leads to regrets which ages you faster.”</p>
  </blockquote>
</section>`;

// ---------- the course ----------
let ctl = '';
const groupRange = g => { const s = LESSONS.findIndex(l => l.group === g); let e = s; while (e + 1 < N && !LESSONS[e + 1].group) e++; return [s + 1, e + 1]; };
LESSONS.forEach((l, i) => {
  const n = i + 1;
  if (l.group) {
    const [s, e] = groupRange(l.group);
    const st = strips[l.group];
    ctl += `<li class="strip" style="--h:${st.h}px;--hm:${st.hm}px"><div class="terrain" aria-hidden="true">${st.svg}</div><h3 class="strip-label"><span class="ko">${THEMES[l.group].long} · controls ${s}–${e}</span></h3></li>`;
  }
  const cx = Math.round(6 + wander(i) * 26), cxm = Math.round(wander(i + 40) * 7);
  let headHtml, featTerrain = '', pre = false;
  if (l.featured) {
    const [a, b] = l.head.split(l.featured);
    pre = !!a.trim();
    headHtml = `${pre ? `<p class="head">${esc(a.trim())}</p>` : ''}<p class="feat op">${esc(l.featured)}</p>${b.trim() ? `<p class="head head-after">${esc(b.trim())}</p>` : ''}`;
    featTerrain = `<div class="terrain" aria-hidden="true">${W.featured('38-feat-' + featCount, featCount)}</div>`;
    featCount++;
  } else {
    headHtml = `<p class="head${l.para ? ' para' : ''}">${l.para ? esc(l.head) : splitHead(l.head)}</p>`;
  }
  const short = !l.body && !l.note && !l.featured && !l.link;
  const cls = ['ctl', l.featured && 'featured', pre && 'pre', short && 'short'].filter(Boolean).join(' ');
  ctl += `
  <li class="${cls}" id="c${n}" data-n="${n}" style="--cx:${cx}px;--cxm:${cxm}px">
    ${featTerrain}
    <span class="ring" data-cp aria-hidden="true"></span>
    <span class="num" aria-hidden="true">${n}</span>
    <div class="ctl-text">
      <span class="vh">Control ${n}. </span>
      ${headHtml}
      ${l.body ? `<p class="body">${esc(l.body)}</p>` : ''}
      ${l.note ? `<p class="note">${esc(l.note)}</p>` : ''}
      ${l.link ? `<p class="note"><a href="${l.link}">Drawn in full above.</a></p>` : ''}
    </div>
  </li>`;
});

const FIGURE = `<svg class="fig" viewBox="0 0 44 70" aria-hidden="true" focusable="false"><g fill="var(--ink)"><circle cx="22" cy="8" r="6"/><path d="M15.5 16.5h13l1.8 21h-5.3l-.5 30h-4.6l-.4-17.5-.4 17.5H14.5l-.5-30H9z"/></g><path d="M27 19l9-13.5" stroke="var(--ink)" stroke-width="4.6" stroke-linecap="round"/><path d="M15.6 19.5L11.5 36" stroke="var(--ink)" stroke-width="4.6" stroke-linecap="round"/></svg>`;

const CARD = `
<aside class="card" aria-labelledby="card-h">
  <p class="label" id="card-h">His lessons on one card</p>
  <table>
    <caption class="card-h">Class 20–39 · ${N} controls</caption>
    <tbody>
      <tr class="card-se"><td><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3l7 12H3z" fill="none" stroke="var(--op)" stroke-width="2"/></svg></td><td colspan="2">Start · Wherever you are</td></tr>
      ${LESSONS.map((l, i) => `<tr data-n="${i + 1}"><th scope="row" class="cn">${i + 1}</th><td class="ci">${pic(l.theme)}<span class="vh">${THEMES[l.theme].name}</span></td><td class="ct"><a href="#c${i + 1}">${l.cardHtml || esc(l.card)}</a></td></tr>`).join('')}
      <tr class="card-se"><td><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4.5" fill="none" stroke="var(--op)" stroke-width="2"/><circle cx="10" cy="10" r="8" fill="none" stroke="var(--op)" stroke-width="2"/></svg></td><td colspan="2">Finish · Tim, at 38</td></tr>
    </tbody>
  </table>
  <p class="note">Card wording is ours. His wording is on the map.</p>
</aside>`;

const COURSE = `
<section class="course" aria-labelledby="course-h">
  <div class="course-main">
    <svg class="legs" aria-hidden="true" focusable="false"><path/></svg>
    <div class="course-head">
      <p class="label">The course</p>
      <h2 class="h2" id="course-h">${N} controls, start to finish</h2>
      <p class="note">Controls 1–3 are his first three lessons, in his order. We grouped the rest by subject. […] marks where we trimmed a quote.</p>
    </div>
    <ol class="ctls" role="list">
      <li class="ctl start"><span class="tri" data-cp aria-hidden="true"><svg viewBox="0 0 48 44"><path d="M24 3l21 37H3z"/></svg></span><div class="ctl-text"><p class="label">Start</p><p class="note">Wherever you are, 20–39.</p></div></li>
      ${ctl}
      <li class="ctl finish" id="finish">
        <div class="terrain" aria-hidden="true">${W.finish()}</div>
        <span class="fin" data-cp aria-hidden="true"></span>
        <div class="ctl-text">
          <p class="label"><span class="ko">Finish</span></p>
          <div class="fin-row">${FIGURE}<p class="fin-cap"><span class="ko">Tim, at 38, looking back down the course at&nbsp;you.</span></p></div>
          <div class="scale scale-mini">
            <p class="scale-cap" id="scale-cap-2"><span class="ko">Your age</span></p>
            ${scaleBar('', 'scale-cap-2')}
            <div class="scale-nums" aria-hidden="true">${yrs.map(y => `<span${[20, 25, 30, 35, 39].includes(y) ? ' class="on ko"' : ''}>${y}</span>`).join('')}</div>
          </div>
          <p class="age-out"><span class="ko" data-age-out>Pick your age to see where you stand.</span></p>
          <p class="fin-links"><span class="ko">Read the original: <a href="${X_URL}" target="_blank" rel="noopener">X Article</a> · <a href="${SUB_URL}" target="_blank" rel="noopener">Substack</a></span></p>
        </div>
      </li>
    </ol>
  </div>
  ${CARD}
</section>`;

const FOOT = `
<footer class="foot">
  <div class="colourbar" aria-hidden="true">
    ${[['var(--ink)', 'Black'], ['var(--contour)', 'Brown'], ['var(--open)', 'Yellow'], ['var(--open-rough)', 'Yellow 50'], ['var(--veg1)', 'Green 20'], ['var(--veg2)', 'Green 50'], ['var(--veg3)', 'Green 100'], ['var(--water)', 'Blue'], ['var(--op)', 'Purple']].map(([c, n]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}
  </div>
  <div class="titleblock">
    <p class="tb-title">I’m 38, Mapped</p>
    <dl>
      <div><dt>Course</dt><dd>“I’m 38. If You’re in Your 20’s or 30’s, Read This.” by Tim&nbsp;Denning</dd></div>
      <div><dt>First run</dt><dd>X thread and Substack, January 2025 · X Article, 20&nbsp;January&nbsp;2026</dd></div>
      <div><dt>Scale</dt><dd>1 : one life</dd></div>
      <div><dt>Map</dt><dd>Unofficial. Not affiliated with Tim Denning. Lesson text is quoted from his public posts.</dd></div>
    </dl>
    <p class="tb-links"><a href="${X_URL}" target="_blank" rel="noopener">X Article</a> · <a href="${SUB_URL}" target="_blank" rel="noopener">Substack</a></p>
  </div>
</footer>`;

const CSS = fs.readFileSync(path.join(__dirname, 'page.css'), 'utf8');
const JS = fs.readFileSync(path.join(__dirname, 'page.js'), 'utf8');

const html = `<title>I’m 38, Mapped</title>
<meta name="description" content="An orienteering map of Tim Denning’s essay “I’m 38. If You’re in Your 20’s or 30’s, Read This.”">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Overpass:wght@800&text=THECONVIALP%20&display=swap">
<style>
${CSS}
</style>
${SYMBOLS}
<main class="table" lang="en">
<article class="sheet">
  ${HERO}
  ${KEY}
  ${OVERVIEW}
  ${ROUGH}
  ${ROUTE}
  ${COURSE}
  ${FOOT}
</article>
</main>
<script>
${JS}
</script>
`;
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'index.html'), html);
console.log('bytes', html.length, 'featured', featCount);
