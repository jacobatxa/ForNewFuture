/* ============================================================
   interactions-v2.js — Day1 v2 专用（不改动 interactions.js）
   - 舞台幕色 data-act
   - 户外 8 分钟计时
   - 猫狗：4 组轮流 + 更强成功反馈
   ============================================================ */

/* ---------- 当前页幕色 → 舞台 CSS 变量 ---------- */
(function () {
  const stage = document.getElementById('stage');
  if (!stage) return;
  document.querySelectorAll('.slide').forEach((slide) => {
    slide.addEventListener('slideenter', () => {
      const act = slide.dataset.act || '1';
      stage.dataset.act = act;
    });
  });
})();

/* ---------- 通用倒计时 ---------- */
function makeCountdown(opts) {
  const { display, startBtn, resetBtn, seconds, onTick, onDone } = opts;
  let left = seconds;
  let timer = null;
  let running = false;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + String(r).padStart(2, '0');
  }
  function render() {
    if (display) display.textContent = fmt(left);
    if (onTick) onTick(left);
  }
  function stop() {
    running = false;
    clearInterval(timer);
    timer = null;
    if (startBtn) startBtn.textContent = '开始';
  }
  function tick() {
    left -= 1;
    render();
    if (left <= 0) {
      stop();
      left = 0;
      render();
      if (onDone) onDone();
    }
  }
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (running) {
        stop();
        return;
      }
      if (left <= 0) left = seconds;
      running = true;
      startBtn.textContent = '暂停';
      timer = setInterval(tick, 1000);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stop();
      left = seconds;
      render();
    });
  }
  render();
  return { reset: () => { stop(); left = seconds; render(); } };
}

/* ---------- 户外任务 8 分钟 ---------- */
(function () {
  const slide = document.getElementById('slide-outdoor');
  if (!slide) return;
  const display = slide.querySelector('#outdoorTime');
  const startBtn = slide.querySelector('#outdoorStart');
  makeCountdown({ display, startBtn, seconds: 8 * 60 });
})();

/* ---------- 猫狗标注 · 4 组轮流 ---------- */
(function () {
  const slide = document.getElementById('slide-catdog-v2');
  if (!slide) return;

  const cards = Array.from(slide.querySelectorAll('.pet-card'));
  const bins = Array.from(slide.querySelectorAll('.bin'));
  const verdict = slide.querySelector('#cdVerdict');
  const note = slide.querySelector('.game-note');
  const turnEl = slide.querySelector('#cdTurn');
  const pop = slide.querySelector('#cdPop');
  const scorePills = Array.from(slide.querySelectorAll('.score-pill'));
  const GROUP_NAMES = ['第 1 组', '第 2 组', '第 3 组', '第 4 组'];

  let turn = 0; // 0..3
  let scores = [0, 0, 0, 0];
  let placedCount = 0;

  function refreshTurn() {
    turnEl.innerHTML = '现在轮到 <em>' + GROUP_NAMES[turn] + '</em> 拖一张';
    scorePills.forEach((p, i) => {
      p.classList.toggle('on', i === turn);
      p.querySelector('b').textContent = scores[i];
    });
  }

  function toStage(clientX, clientY) {
    const rect = slide.getBoundingClientRect();
    const s = window.deckScale || 1;
    return [(clientX - rect.left) / s, (clientY - rect.top) / s];
  }
  function rectInStage(el) {
    const rect = el.getBoundingClientRect();
    const base = slide.getBoundingClientRect();
    const s = window.deckScale || 1;
    return {
      x: (rect.left - base.left) / s,
      y: (rect.top - base.top) / s,
      w: rect.width / s,
      h: rect.height / s,
    };
  }

  const CARD = 140, GAP = 36;
  const totalW = cards.length * CARD + (cards.length - 1) * GAP;
  const startX = (1920 - totalW) / 2;
  const HOME_Y = 780;
  cards.forEach((c, i) => {
    c.dataset.homeX = startX + i * (CARD + GAP);
    c.dataset.homeY = HOME_Y;
  });

  function placeHome(card, instant) {
    if (instant) card.style.transition = 'none';
    card.style.left = card.dataset.homeX + 'px';
    card.style.top = card.dataset.homeY + 'px';
    if (instant) {
      void card.offsetWidth;
      card.style.transition = '';
    }
  }

  function flashPop(text, ok) {
    pop.textContent = text;
    pop.style.color = ok ? 'var(--ok)' : 'var(--bad)';
    pop.classList.add('show');
    setTimeout(() => pop.classList.remove('show'), 700);
  }

  let active = null, offX = 0, offY = 0;

  cards.forEach((card) => {
    card.addEventListener('pointerdown', (e) => {
      if (card.classList.contains('done')) return;
      e.preventDefault();
      active = card;
      card.setPointerCapture(e.pointerId);
      card.classList.add('dragging');
      const [sx, sy] = toStage(e.clientX, e.clientY);
      const r = rectInStage(card);
      offX = sx - r.x;
      offY = sy - r.y;
    });

    card.addEventListener('pointermove', (e) => {
      if (active !== card) return;
      const [sx, sy] = toStage(e.clientX, e.clientY);
      card.style.left = sx - offX + 'px';
      card.style.top = sy - offY + 'px';
      const cx = sx - offX + CARD / 2;
      const cy = sy - offY + CARD / 2;
      bins.forEach((bin) => {
        const b = rectInStage(bin);
        const inside = cx > b.x && cx < b.x + b.w && cy > b.y && cy < b.y + b.h;
        bin.classList.toggle('hover', inside);
      });
    });

    card.addEventListener('pointerup', () => {
      if (active !== card) return;
      active = null;
      card.classList.remove('dragging');
      bins.forEach((b) => b.classList.remove('hover'));

      const r = rectInStage(card);
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      let landedBin = null;
      for (const bin of bins) {
        const b = rectInStage(bin);
        if (cx > b.x && cx < b.x + b.w && cy > b.y && cy < b.y + b.h) {
          landedBin = bin;
          break;
        }
      }
      if (!landedBin) {
        placeHome(card, false);
        return;
      }

      if (landedBin.dataset.kind === card.dataset.kind) {
        card.classList.add('done');
        const thumb = document.createElement('img');
        thumb.src = card.querySelector('img').src;
        landedBin.querySelector('.bin-thumbs').appendChild(thumb);
        const n = landedBin.querySelectorAll('.bin-thumbs img').length;
        landedBin.querySelector('.bin-count').textContent = n + ' / 3';
        landedBin.classList.add('ok-flash');
        setTimeout(() => landedBin.classList.remove('ok-flash'), 500);
        scores[turn] += 1;
        placedCount++;
        flashPop('对！', true);
        turn = (turn + 1) % 4;
        refreshTurn();
        if (placedCount >= cards.length) {
          verdict.classList.add('show');
          note.classList.add('hide');
          turnEl.innerHTML = '全部放对啦 · 看看下面那句话';
        }
      } else {
        landedBin.classList.remove('wrong');
        void landedBin.offsetWidth;
        landedBin.classList.add('wrong');
        setTimeout(() => landedBin.classList.remove('wrong'), 450);
        flashPop('再试', false);
        placeHome(card, false);
        // 答错也换组，保持节奏
        turn = (turn + 1) % 4;
        refreshTurn();
      }
    });
  });

  function resetAll() {
    placedCount = 0;
    scores = [0, 0, 0, 0];
    turn = 0;
    verdict.classList.remove('show');
    note.classList.remove('hide');
    bins.forEach((bin) => {
      bin.querySelector('.bin-thumbs').innerHTML = '';
      bin.querySelector('.bin-count').textContent = '0 / 3';
    });
    cards.forEach((card) => {
      card.classList.remove('done');
      placeHome(card, true);
    });
    refreshTurn();
  }
  slide.querySelector('#cdReset').addEventListener('click', resetAll);

  let laidOut = false;
  slide.addEventListener('slideenter', () => {
    requestAnimationFrame(() => {
      cards.forEach((card) => {
        if (!card.classList.contains('done')) placeHome(card, true);
        setTimeout(() => card.classList.remove('fx'), laidOut ? 0 : 2400);
      });
      laidOut = true;
      refreshTurn();
    });
  });
})();

/* scale / deep / feed / stars / loop / challenge / echo
   继续复用 assets/js/interactions.js（同 ID），此处不重复绑定 */
