// Final simple version for X: one 4:5 image, ten lessons. node tw3.js -> out/tw-final.html
const fs = require('fs');
const path = require('path');

// His first three, in his order; the rest are our picks. Lines are paraphrased; several follow-ups are his words.
const TEN = [
  ['Take risks.', 'By 35 you’ll see who did.'],
  ['Kids are the start of freedom.', 'Not the end.'],
  ['Chase obsession.', 'It’s the fastest way up.'],
  ['Raise your standards.', 'So high people think you’re a psychopath.'],
  ['Skip the conventional path.', 'Full of boredom.'],
  ['Get off the corporate ladder.', 'Build online.'],
  ['Learn how money works.', 'Or work for it forever.'],
  ['Business is psychology.', 'So is life.'],
  ['Give up alcohol.', 'It steals your energy.'],
  ['See your parents more.', 'Soon they’ll be gone.'],
];

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap">
<style>
:root { --paper: #FBFBF8; --ink: #191A17; --op: #BB29BB; --op-ink: #8E1D90; --mute: #5E5F59; --f: "Archivo", "Helvetica Neue", Arial, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); }
.card { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: var(--paper); color: var(--ink); font-family: var(--f); -webkit-font-smoothing: antialiased; font-kerning: normal; padding: 70px 72px 60px; display: flex; flex-direction: column; }
.kick { font-stretch: 75%; font-weight: 700; font-size: 30px; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 24px 0 0; font-stretch: 108%; font-weight: 900; font-size: 88px; line-height: .94; letter-spacing: -.03em; color: var(--op); white-space: nowrap; }
ul { list-style: none; margin: 58px 0 0; padding: 0; display: grid; gap: 30px; }
li { position: relative; padding-left: 50px; font-stretch: 94%; font-size: 40px; line-height: 1.14; letter-spacing: -.008em; text-wrap: pretty; }
li::before { content: ""; position: absolute; left: 0; top: .24em; width: 26px; height: 26px; border: 3.5px solid var(--op); border-radius: 50%; }
li b { font-weight: 700; }
li span { font-weight: 400; color: var(--mute); }
.foot { margin-top: auto; font-stretch: 87%; font-size: 23px; line-height: 1.35; color: var(--mute); }
</style>
<div class="card">
  <div class="kick">10 lessons from Tim Denning’s essay</div>
  <h1>What to actually do<br>in your 20s.</h1>
  <ul>${TEN.map(([a, b]) => `<li><b>${a}</b> <span>${b}</span></li>`).join('')}</ul>
  <p class="foot">Paraphrased from Tim Denning’s X Article, Jan 2026.</p>
</div>`;
fs.writeFileSync(path.join(__dirname, 'out', 'tw-final.html'), html);
console.log('ok');
