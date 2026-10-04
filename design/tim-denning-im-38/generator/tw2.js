// Simpler Twitter variants. 1080x1350 each. node tw2.js -> out/s-*.html
const fs = require('fs');
const path = require('path');

const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap">`;
const BASE = `
:root { --paper: #FBFBF8; --ink: #191A17; --op: #BB29BB; --op-ink: #8E1D90; --mute: #5E5F59; --f: "Archivo", "Helvetica Neue", Arial, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); }
.card { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: var(--paper); color: var(--ink); font-family: var(--f); -webkit-font-smoothing: antialiased; font-kerning: normal; padding: 72px 72px 64px; display: flex; flex-direction: column; }
.kick { font-stretch: 75%; font-weight: 700; font-size: 23px; letter-spacing: .12em; text-transform: uppercase; }
.big { margin: 26px 0 0; font-stretch: 125%; font-weight: 900; font-size: 150px; line-height: .84; letter-spacing: -.035em; color: var(--op); }
.sub { margin: 22px 0 0; font-weight: 650; font-size: 40px; line-height: 1.1; letter-spacing: -.01em; }
.foot { margin-top: auto; font-stretch: 87%; font-size: 19px; line-height: 1.35; color: var(--mute); }
`;

// all 28, our summaries, grouped by subject so neighbours relate
const ALL = [
  'Take risks. By 35 it shows.', 'Skip the conventional path.', 'Burn your parents’ plan.', 'More hard things, more success.',
  'Chase obsession.', 'Set psychopath-level standards.', 'Hear disagreement calmly.', 'Turn off news and politics.', 'Visit a retirement home.',
  'Learn how money works.', 'Money is a resource for freedom.', 'Read finance books. Invest early.', 'Read <i>The Bitcoin Standard</i>.', 'City while young. Suburbs later.',
  'Get off the corporate ladder.', 'Corporations pretend to care.', 'Learn skills people need.', 'Business is psychology.', 'Write online for opportunities.', 'Build online under a nickname.', 'Flow beats productivity.',
  'Keep dopamine in check.', 'Games become a time suck.', 'Exercise daily, outdoors.', 'Give up alcohol.',
  'Kids are where freedom begins.', 'Outgrow friends, gently.', 'See your parents more.',
];

// A: the same 28, stripped to a plain numbered list
function plainList() {
  const col = (a, off) => a.map((t, i) => `<li><b>${off + i + 1}</b><span>${t}</span></li>`).join('');
  return `${FONTS}<style>${BASE}
.kick { font-size: 30px; letter-spacing: .08em; }
.head { margin: 24px 0 0; font-stretch: 108%; font-weight: 900; font-size: 88px; line-height: .94; letter-spacing: -.03em; color: var(--op); white-space: nowrap; }
.list { margin-top: 62px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 36px; }
ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 29px; }
li { display: grid; grid-template-columns: 44px 1fr; align-items: baseline; font-stretch: 88%; font-size: 29.5px; font-weight: 500; line-height: 1.15; }
li b { color: var(--op-ink); font-stretch: 75%; font-weight: 800; font-size: 24px; font-variant-numeric: tabular-nums; }
</style>
<div class="card">
  <div class="kick">28 lessons from Tim Denning’s essay</div>
  <h1 class="head">What to actually do<br>in your 20s and 30s.</h1>
  <div class="list"><ol>${col(ALL.slice(0, 14), 0)}</ol><ol>${col(ALL.slice(14), 14)}</ol></div>
</div>`;
}

// B: ten of the 28, big enough to read in the feed
const TEN = [
  ['Take risks.', 'By 35 you’ll see who did.'],
  ['Raise your standards.', 'So high people think you’re a psychopath.'],
  ['Skip the conventional path.', 'Full of boredom and competition.'],
  ['Chase obsession.', 'The fastest way to high performance.'],
  ['Get off the corporate ladder.', 'Build something online.'],
  ['Learn how money works.', 'Or you’ll always work for it.'],
  ['Business is psychology.', 'Understand people.'],
  ['Give up alcohol.', 'It steals your energy.'],
  ['Kids are the start of freedom.', 'Not the end.'],
  ['See your parents more.', 'Soon they’ll be gone.'],
];
function ten() {
  return `${FONTS}<style>${BASE}
.big { font-size: 128px; }
.sub { font-size: 36px; }
ol { list-style: none; margin: 44px 0 0; padding: 0; display: grid; gap: 18px; }
li { display: grid; grid-template-columns: 62px 1fr; align-items: baseline; }
li b { color: var(--op-ink); font-stretch: 75%; font-weight: 800; font-size: 30px; font-variant-numeric: tabular-nums; }
li span { font-size: 37px; line-height: 1.12; font-weight: 700; letter-spacing: -.01em; }
li span em { font-style: normal; font-weight: 400; color: var(--mute); }
</style>
<div class="card">
  <div class="kick">10 of Tim Denning’s 28 lessons</div>
  <h1 class="big">I’M 38.</h1>
  <p class="sub">If You’re in Your 20’s or 30’s, Read This.</p>
  <ol>${TEN.map(([a, b], i) => `<li><b>${i + 1}</b><span>${a} <em>${b}</em></span></li>`).join('')}</ol>
  <p class="foot">From Tim Denning’s essay (X Article, Jan 2026). Wording is mine, not his.</p>
</div>`;
}

// C: the big idea, with the drawing cut down to two lines
function idea() {
  return `${FONTS}<style>${BASE}
.q { margin: 40px 0 0; color: var(--op-ink); font-weight: 750; font-size: 66px; line-height: 1.06; letter-spacing: -.02em; text-indent: -.4em; padding-left: .4em; margin-left: -.4em; text-wrap: balance; }
.by { margin: 22px 0 0; font-size: 25px; color: var(--mute); }
svg { display: block; margin-top: 56px; width: 100%; height: auto; overflow: visible; }
.l { fill: none; stroke-width: 7; stroke-linecap: round; }
.t { font-family: var(--f); font-weight: 750; font-size: 30px; }
.tk { font-stretch: 75%; font-weight: 800; font-size: 24px; letter-spacing: .12em; }
.next { margin-top: auto; font-stretch: 112%; font-weight: 800; font-size: 34px; }
.foot { margin-top: 10px; }
</style>
<div class="card">
  <div class="kick">Tim Denning, at 38</div>
  <p class="q">“When you turn 35 you’ll see the difference between those who took risks and those who didn’t.”</p>
  <p class="by">From his essay “I’m 38. If You’re in Your 20’s or 30’s, Read This.”</p>
  <svg viewBox="0 0 936 470" aria-hidden="true">
    <path d="M780 18V452" stroke="#191A17" stroke-width="2.5" stroke-dasharray="4 10" stroke-linecap="round"/>
    <text class="tk" x="780" y="0" text-anchor="middle" fill="#191A17">AGE 35</text>
    <path class="l" d="M40 390L780 70" stroke="#BB29BB"/>
    <path class="l" d="M40 390C260 392 520 394 780 390" stroke="#191A17"/>
    <circle cx="40" cy="390" r="13" fill="#191A17"/>
    <circle cx="780" cy="70" r="15" fill="#BB29BB"/>
    <circle cx="780" cy="390" r="15" fill="#191A17"/>
    <text class="t" x="806" y="80" fill="#8E1D90">Took risks</text>
    <text class="t" x="806" y="400" fill="#191A17">Played safe</text>
    <text class="tk" x="40" y="446" fill="#191A17">YOUR 20s</text>
  </svg>
  <p class="next">All 28 lessons are in the next image.</p>
  <p class="foot">Drawing is mine, not to scale.</p>
</div>`;
}

const out = path.join(__dirname, 'out');
fs.writeFileSync(path.join(out, 's-a-list.html'), plainList());
fs.writeFileSync(path.join(out, 's-b-ten.html'), ten());
fs.writeFileSync(path.join(out, 's-c-idea.html'), idea());
console.log('ok');
