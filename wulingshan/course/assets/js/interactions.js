/* ============================================================
   interactions.js — Day 1 页面级交互
   P11 星点连线 / P13 学习循环点亮 / P14 P18 计时器 / P19 句子回引
   ============================================================ */

/* ---------- P11 当一次古人 · 星点连线 ---------- */
(function () {
  const slide = document.getElementById('slide-stars');
  if (!slide) return;

  const svg = slide.querySelector('#starsSvg');
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1340, H = 670;
  const COUNT = 26;

  let stars = [];
  let picked = null; // 已选中的起点星

  function regen() {
    svg.innerHTML = '';
    picked = null;
    stars = [];
    // 泊松式散布：拒绝离已有星太近的点，避免团簇
    let guard = 0;
    while (stars.length < COUNT && guard < 4000) {
      guard++;
      const x = 60 + Math.random() * (W - 120);
      const y = 55 + Math.random() * (H - 110);
      if (stars.some((s) => (s.x - x) ** 2 + (s.y - y) ** 2 < 110 * 110)) continue;
      stars.push({ x, y, r: 3 + Math.random() * 4.5 });
    }

    const lineLayer = document.createElementNS(NS, 'g');
    lineLayer.id = 'starLines';
    svg.appendChild(lineLayer);

    stars.forEach((s, i) => {
      const halo = document.createElementNS(NS, 'circle');
      halo.setAttribute('cx', s.x);
      halo.setAttribute('cy', s.y);
      halo.setAttribute('r', s.r * 4.5);
      halo.setAttribute('fill', 'rgba(255,255,255,0.06)');
      svg.appendChild(halo);

      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', s.x);
      dot.setAttribute('cy', s.y);
      dot.setAttribute('r', s.r);
      dot.setAttribute('fill', 'rgba(235,242,255,0.95)');
      dot.style.cursor = 'pointer';
      dot.dataset.idx = i;

      // 命中区放大，方便点选
      const hit = document.createElementNS(NS, 'circle');
      hit.setAttribute('cx', s.x);
      hit.setAttribute('cy', s.y);
      hit.setAttribute('r', 26);
      hit.setAttribute('fill', 'transparent');
      hit.style.cursor = 'pointer';
      hit.addEventListener('pointerdown', () => pick(i, dot));

      svg.appendChild(dot);
      svg.appendChild(hit);
      s.dot = dot;
    });
  }

  function pick(i, dot) {
    if (picked === null) {
      picked = i;
      dot.setAttribute('fill', '#ffb454');
      dot.setAttribute('r', stars[i].r + 2.5);
      return;
    }
    if (picked === i) { // 再点一次取消
      dot.setAttribute('fill', 'rgba(235,242,255,0.95)');
      dot.setAttribute('r', stars[i].r);
      picked = null;
      return;
    }
    const a = stars[picked], b = stars[i];
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', 'rgba(255,180,84,0.75)');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    svg.querySelector('#starLines').appendChild(line);

    a.dot.setAttribute('fill', 'rgba(235,242,255,0.95)');
    a.dot.setAttribute('r', a.r);
    picked = null;
  }

  slide.querySelector('#starsRegen').addEventListener('click', regen);
  slide.querySelector('#starsClear').addEventListener('click', () => {
    const layer = svg.querySelector('#starLines');
    if (layer) layer.innerHTML = '';
    if (picked !== null) {
      stars[picked].dot.setAttribute('fill', 'rgba(235,242,255,0.95)');
      stars[picked].dot.setAttribute('r', stars[picked].r);
      picked = null;
    }
  });

  let seeded = false;
  slide.addEventListener('slideenter', () => {
    if (!seeded) { regen(); seeded = true; }
  });
})();

/* ---------- P13 学习循环 · 逐步点亮 ---------- */
(function () {
  const slide = document.getElementById('slide-loop');
  if (!slide) return;

  const btn = slide.querySelector('#loopNext');
  const rows = Array.from(slide.querySelectorAll('.bike-row'));
  let step = -1;

  function apply() {
    for (let i = 0; i < 4; i++) {
      const on = i <= step;
      slide.querySelector('#node' + i).classList.toggle('lit', on);
      slide.querySelector('#arc' + i).classList.toggle('lit', i < step);
      rows[i].classList.toggle('lit', on);
    }
    if (step >= 3) {
      // 四步全亮后，点亮回环弧线，按钮变重来
      slide.querySelector('#arc3').classList.add('lit');
      btn.textContent = '重新来一圈';
    } else {
      btn.textContent = step < 0 ? '点亮第一步' : '点亮下一步';
    }
  }

  btn.addEventListener('click', () => {
    step = step >= 3 ? -1 : step + 1;
    apply();
  });

  slide.addEventListener('slideenter', () => { step = -1; apply(); });
})();

/* ---------- 通用倒计时构造器 ---------- */
function makeCountdown(displayEl, totalSec, onDone) {
  let remain = totalSec;
  let ticking = null;

  function render() {
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    displayEl.textContent = m + ':' + String(s).padStart(2, '0');
    displayEl.classList.toggle('warn', remain <= 10 && remain > 0);
  }

  function stop() {
    if (ticking) { clearInterval(ticking); ticking = null; }
  }

  return {
    start() {
      if (ticking) return;
      ticking = setInterval(() => {
        remain--;
        render();
        if (remain <= 0) {
          stop();
          if (onDone) onDone();
        }
      }, 1000);
    },
    pause: stop,
    running: () => !!ticking,
    reset(sec) {
      stop();
      remain = sec !== undefined ? sec : totalSec;
      render();
    },
  };
}

/* ---------- P14 挑战站 · 10 分钟倒计时 ---------- */
(function () {
  const slide = document.getElementById('slide-challenge');
  if (!slide) return;

  const display = slide.querySelector('#challengeTime');
  const startBtn = slide.querySelector('#challengeStart');
  const timer = makeCountdown(display, 600, () => {
    startBtn.textContent = '开始';
    display.textContent = '时间到';
  });

  startBtn.addEventListener('click', () => {
    if (timer.running()) {
      timer.pause();
      startBtn.textContent = '继续';
    } else {
      timer.start();
      startBtn.textContent = '暂停';
    }
  });
  slide.querySelector('#challengeReset').addEventListener('click', () => {
    timer.reset();
    startBtn.textContent = '开始';
  });
  slide.addEventListener('slideleave', () => {
    timer.pause();
    startBtn.textContent = '继续';
  });
})();

/* ---------- P18 喂AI游戏 · 3 轮 90 秒 ---------- */
(function () {
  const slide = document.getElementById('slide-feed');
  if (!slide) return;

  const display = slide.querySelector('#feedTime');
  const roundEl = slide.querySelector('#feedRound');
  const startBtn = slide.querySelector('#feedStart');
  let round = 1;

  const timer = makeCountdown(display, 90, () => {
    display.textContent = '本轮结束';
    if (round < 3) {
      round++;
      roundEl.textContent = '第 ' + round + ' / 3 轮';
      startBtn.textContent = '开始本轮';
    } else {
      roundEl.textContent = '三轮完成';
      startBtn.textContent = '重新开始';
      round = 0; // 下次点开始时从头来
    }
  });

  startBtn.addEventListener('click', () => {
    if (timer.running()) {
      timer.pause();
      startBtn.textContent = '继续';
      return;
    }
    if (round === 0) {
      round = 1;
      roundEl.textContent = '第 1 / 3 轮';
    }
    timer.reset(90);
    timer.start();
    startBtn.textContent = '暂停';
  });
  slide.querySelector('#feedReset').addEventListener('click', () => {
    round = 1;
    roundEl.textContent = '第 1 / 3 轮';
    timer.reset(90);
    startBtn.textContent = '开始本轮';
  });
  slide.addEventListener('slideleave', () => timer.pause());
})();

/* ---------- 猫狗标注游戏 ---------- */
(function () {
  const slide = document.getElementById('slide-catdog');
  if (!slide) return;

  const cards = Array.from(slide.querySelectorAll('.pet-card'));
  const bins = Array.from(slide.querySelectorAll('.bin'));
  const verdict = slide.querySelector('#cdVerdict');
  const note = slide.querySelector('.game-note');
  let placedCount = 0;

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

  // 底部一排家位
  const CARD = 150, GAP = 44;
  const totalW = cards.length * CARD + (cards.length - 1) * GAP;
  const startX = (1920 - totalW) / 2;
  const HOME_Y = 745;
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
        if (cx > b.x && cx < b.x + b.w && cy > b.y && cy < b.y + b.h) { landedBin = bin; break; }
      }

      if (!landedBin) { placeHome(card, false); return; }

      if (landedBin.dataset.kind === card.dataset.kind) {
        // 答对：卡片缩进篮子，缩略图上墙
        card.classList.add('done');
        const thumb = document.createElement('img');
        thumb.src = card.querySelector('img').src;
        landedBin.querySelector('.bin-thumbs').appendChild(thumb);
        const n = landedBin.querySelectorAll('.bin-thumbs img').length;
        landedBin.querySelector('.bin-count').textContent = n + ' / 3';
        placedCount++;
        if (placedCount >= cards.length) {
          verdict.classList.add('show');
          note.classList.add('hide');
        }
      } else {
        // 答错：篮子摇头，卡片弹回
        landedBin.classList.remove('wrong');
        void landedBin.offsetWidth;
        landedBin.classList.add('wrong');
        setTimeout(() => landedBin.classList.remove('wrong'), 450);
        placeHome(card, false);
      }
    });
  });

  function resetAll() {
    placedCount = 0;
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
  }
  slide.querySelector('#cdReset').addEventListener('click', resetAll);

  let laidOut = false;
  slide.addEventListener('slideenter', () => {
    requestAnimationFrame(() => {
      cards.forEach((card) => {
        if (!card.classList.contains('done')) placeHome(card, true);
        // 入场动画结束后解除 fx，让拖拽的 transform 生效
        setTimeout(() => card.classList.remove('fx'), laidOut ? 0 : 2400);
      });
      laidOut = true;
    });
  });
})();

/* ---------- 越喂越聪明（数据量滑块） ---------- */
(function () {
  const slide = document.getElementById('slide-scale');
  if (!slide) return;

  const STOPS = [
    { amount: '10',   acc: 55, desc: '基本靠猜，跟抛硬币差不多' },
    { amount: '100',  acc: 68, desc: '开始有点感觉了，但经常认错' },
    { amount: '1000', acc: 81, desc: '大部分时候能认对了' },
    { amount: '1万',  acc: 92, desc: '很少出错了' },
    { amount: '10万', acc: 97, desc: '比很多大人认得还准' },
  ];

  const range = slide.querySelector('#scaleRange');
  const amountEl = slide.querySelector('#scaleAmount');
  const accEl = slide.querySelector('#scaleAcc');
  const descEl = slide.querySelector('#scaleDesc');
  const fill = slide.querySelector('#scaleFill');

  function apply() {
    const s = STOPS[+range.value];
    amountEl.textContent = s.amount;
    accEl.textContent = s.acc + '%';
    descEl.textContent = s.desc;
    fill.style.width = s.acc + '%';
  }
  range.addEventListener('input', apply);
  slide.addEventListener('slideenter', apply);
})();

/* ---------- 深度学习 · 分层点亮 ---------- */
(function () {
  const slide = document.getElementById('slide-deep');
  if (!slide) return;

  const layers = Array.from(slide.querySelectorAll('.layer'));
  const btn = slide.querySelector('#deepNext');
  let step = -1;

  function apply() {
    layers.forEach((l, i) => l.classList.toggle('lit', i <= step));
    if (step >= layers.length - 1) btn.textContent = '再看一遍';
    else if (step < 0) btn.textContent = '照片进来了';
    else btn.textContent = '下一层';
  }
  btn.addEventListener('click', () => {
    step = step >= layers.length - 1 ? -1 : step + 1;
    apply();
  });
  slide.addEventListener('slideenter', () => { step = -1; apply(); });
})();

/* ---------- P19 回引 P8 拼出的句子 ---------- */
(function () {
  const slide = document.getElementById('slide-data');
  if (!slide) return;

  const quote = slide.querySelector('#echoQuote');
  slide.addEventListener('slideenter', () => {
    let sentence = '';
    try { sentence = localStorage.getItem('day1-p8-sentence') || ''; } catch (e) { /* file:// 下可能不可用 */ }
    if (sentence) {
      quote.innerHTML = '「大自然解决问题的方式是：' + sentence + '」<small>—— 这是上午你们自己拼出来的句子</small>';
    } else {
      quote.innerHTML = '「大自然解决问题的方式是：试很多次、留下有用的、一代一代改」<small>—— 还记得上午拼的句子吗？</small>';
    }
  });
})();
