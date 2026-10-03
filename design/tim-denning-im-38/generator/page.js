(() => {
  if (!document.documentElement.lang) document.documentElement.lang = 'en';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // ---- course legs: straight purple lines that stop short of each circle ----
  const main = document.querySelector('.course-main');
  const legs = main && main.querySelector('.legs path');
  function drawLegs() {
    if (!legs) return;
    const box = main.getBoundingClientRect();
    const pts = [...main.querySelectorAll('[data-cp]')].map(el => {
      const r = el.getBoundingClientRect();
      const tri = el.classList.contains('tri');
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + (tri ? r.height * 0.6 : r.height / 2), r: tri ? r.width * 0.42 : r.width / 2 };
    });
    let d = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < a.r + b.r + 30) continue;   // too short to read as a leg
      const ux = dx / L, uy = dy / L;
      d += `M${(a.x + ux * (a.r + 6)).toFixed(1)} ${(a.y + uy * (a.r + 6)).toFixed(1)}L${(b.x - ux * (b.r + 6)).toFixed(1)} ${(b.y - uy * (b.r + 6)).toFixed(1)}`;
    }
    legs.setAttribute('d', d);
  }
  let raf = 0;
  const queue = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawLegs); };
  if (main) {
    drawLegs();
    if ('ResizeObserver' in window) new ResizeObserver(queue).observe(main);
    window.addEventListener('resize', queue);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  }

  // ---- your age, on either scale bar ----
  const outs = [...document.querySelectorAll('[data-age-out]')];
  const bars = [...document.querySelectorAll('.scale-bar')];
  function sentence(a) {
    if (a < 35) { const n = 35 - a; return `You’re ${a}. You have ${n} ${n === 1 ? 'year' : 'years'} until 35, when Tim says the difference shows.`; }
    if (a === 35) return 'You’re 35. By Tim’s account, this is the year the difference shows.';
    if (a < 38) return `You’re ${a}. By Tim’s account, the difference already shows. He wrote this at 38.`;
    if (a === 38) return 'You’re 38, the age Tim was when he wrote this.';
    return 'You’re 39, a year older than Tim was when he wrote this.';
  }
  function setAge(a, save, focusBar) {
    bars.forEach(bar => {
      bar.querySelectorAll('.yr').forEach(b => {
        const on = +b.dataset.age === a;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && bar === focusBar) b.focus();
      });
      const you = bar.querySelector('.you');
      if (you) { you.hidden = false; you.style.left = ((a - 20 + 0.5) / 20 * 100) + '%'; }
    });
    outs.forEach(o => { o.textContent = sentence(a); o.classList.add('set'); });
    if (save) { try { localStorage.setItem('im38-age', String(a)); } catch (e) {} }
  }
  bars.forEach(bar => {
    const pick = e => {
      const r = bar.getBoundingClientRect();
      setAge(20 + Math.max(0, Math.min(19, Math.floor((e.clientX - r.left) / r.width * 20))), true, bar.contains(document.activeElement) ? bar : null);
    };
    // a touch only picks on a tap or a sideways drag, so a vertical page swipe over the bar never sets an age
    let sx = 0, sy = 0, drag = false;
    bar.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      try { bar.setPointerCapture(e.pointerId); } catch (_) {}
      sx = e.clientX; sy = e.clientY; drag = e.pointerType !== 'touch';
      if (drag) pick(e);
    });
    bar.addEventListener('pointermove', e => {
      if (!(bar.hasPointerCapture && bar.hasPointerCapture(e.pointerId))) return;
      if (!drag && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) drag = true;
      if (drag) pick(e);
    });
    bar.addEventListener('pointerup', e => { if (e.pointerType === 'touch' && !drag) pick(e); });
    bar.addEventListener('click', e => { const b = e.target.closest('.yr'); if (b && e.detail === 0) setAge(+b.dataset.age, true); });
    bar.addEventListener('keydown', e => {
      const cur = +(e.target.dataset && e.target.dataset.age || 0); if (!cur) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      const a = step ? cur + step : e.key === 'Home' ? 20 : e.key === 'End' ? 39 : (e.key === ' ' || e.key === 'Enter') ? cur : 0;
      if (a) { e.preventDefault(); setAge(Math.max(20, Math.min(39, a)), true, bar); }
    });
  });
  try { const s = +localStorage.getItem('im38-age'); if (s >= 20 && s <= 39) setAge(s, false); } catch (e) {}

  // ---- the clue card follows the reader ----
  const card = document.querySelector('.card');
  const rows = new Map([...document.querySelectorAll('.card tr[data-n]')].map(r => [r.dataset.n, r]));
  const ctls = [...document.querySelectorAll('.ctl[data-n]')];
  let current = null, ticking = false;
  function mark(c) {
    const row = c ? rows.get(c.dataset.n) : null;
    if (row === current) return;
    if (current) current.classList.remove('here');
    document.querySelectorAll('.ctl.is-here').forEach(x => x.classList.remove('is-here'));
    current = row;
    if (!row) return;
    c.classList.add('is-here'); row.classList.add('here');
    if (getComputedStyle(card).position === 'sticky') {
      const top = row.offsetTop + row.offsetParent.offsetTop, h = card.clientHeight;
      if (top < card.scrollTop + 60 || top > card.scrollTop + h - 60) card.scrollTo({ top: top - h / 2, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
  }
  function track() {
    ticking = false;
    const y = (parseFloat(getComputedStyle(ctls[0]).scrollMarginTop) || innerHeight * 0.38) + 32; let cur = null;
    for (const c of ctls) { if (c.getBoundingClientRect().top <= y) cur = c; else break; }
    if (cur && cur.getBoundingClientRect().bottom < 0) cur = null;
    mark(cur);
  }
  if (card) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(track); } }, { passive: true });
    track();
  }
})();
