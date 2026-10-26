/* ============================================================
   deck.js — 舞台缩放 / 翻页 / 进度 HUD
   每页切换时向页面广播 slideenter / slideleave 事件，
   交互组件（boids、拖拽）据此启停。
   ============================================================ */

(function () {
  const STAGE_W = 1920;
  const STAGE_H = 1080;

  const stage = document.getElementById('stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progressFill = document.querySelector('.progress-fill');
  const pageNo = document.querySelector('.page-no');
  let current = -1;

  /* ---------- 等比缩放 ---------- */
  function fit() {
    const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    stage.style.transform = `scale(${s})`;
    window.deckScale = s;
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- 翻页 ---------- */
  function show(i) {
    const n = slides.length;
    i = Math.max(0, Math.min(n - 1, i));
    if (i === current) return;

    if (current >= 0) {
      const prev = slides[current];
      prev.classList.remove('active');
      prev.dispatchEvent(new CustomEvent('slideleave', { bubbles: true }));
    }

    current = i;
    const next = slides[current];
    next.classList.add('active');
    next.dispatchEvent(new CustomEvent('slideenter', { bubbles: true }));

    if (progressFill) progressFill.style.width = ((i + 1) / n) * 100 + '%';
    if (pageNo) {
      const pad = (x) => String(x).padStart(2, '0');
      pageNo.innerHTML = `<b>${pad(i + 1)}</b> / ${pad(n)}`;
    }
    history.replaceState(null, '', '#' + (i + 1));
  }

  window.deckNext = () => show(current + 1);
  window.deckPrev = () => show(current - 1);

  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); show(current + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); show(current - 1); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
  });

  document.querySelectorAll('.nav-zone.prev').forEach((el) =>
    el.addEventListener('click', () => show(current - 1)));
  document.querySelectorAll('.nav-zone.next').forEach((el) =>
    el.addEventListener('click', () => show(current + 1)));

  /* ---------- 初始页（支持 #N 深链） ---------- */
  // 等所有脚本就绪后再触发首个 slideenter，否则后续脚本的监听器还没挂上。
  // setTimeout(0) 不可靠：解析器可能在脚本之间让出，导致定时器提前触发。
  function initShow() {
    const fromHash = parseInt(location.hash.slice(1), 10);
    show(Number.isFinite(fromHash) ? fromHash - 1 : 0);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShow);
  } else {
    setTimeout(initShow, 0);
  }
})();
