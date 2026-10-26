/* ============================================================
   drag.js — 拼图时刻词卡拖拽（P8）
   词卡在托盘内有固定"家位"，拖到句中空位吸附落位；
   拖出空位即释放。三个空位填满时显示拼出的句子。
   ============================================================ */

(function () {
  const slide = document.getElementById('slide-puzzle');
  if (!slide) return;

  const layer = slide.querySelector('.content');
  const tray = slide.querySelector('.tray');
  const chips = Array.from(slide.querySelectorAll('.chip'));
  const slots = Array.from(slide.querySelectorAll('.slot'));
  const result = slide.querySelector('.result');
  const resetLink = slide.querySelector('.reset-link');

  // 舞台坐标转换：clientXY -> 1920x1080 舞台内坐标
  function toStage(clientX, clientY) {
    const rect = layer.getBoundingClientRect();
    const s = window.deckScale || 1;
    return [(clientX - rect.left) / s, (clientY - rect.top) / s];
  }
  function rectInStage(el) {
    const rect = el.getBoundingClientRect();
    const base = layer.getBoundingClientRect();
    const s = window.deckScale || 1;
    return {
      x: (rect.left - base.left) / s,
      y: (rect.top - base.top) / s,
      w: rect.width / s,
      h: rect.height / s,
    };
  }

  /* ---------- 初始布局：托盘内两行排布 ---------- */
  function layoutHomes() {
    const trayRect = rectInStage(tray);
    const gap = 34;
    // 先测量每张卡的自然宽度
    const widths = chips.map((c) => rectInStage(c).w);
    const perRow = 3;
    const rows = [chips.slice(0, perRow), chips.slice(perRow)];
    const rowH = 96;
    const rowGapY = (200 - rowH * 2) / 3; // 托盘高 200

    rows.forEach((row, ri) => {
      const totalW = row.reduce((acc, c, i) => acc + widths[chips.indexOf(c)], 0)
        + gap * (row.length - 1);
      let x = trayRect.x + (trayRect.w - totalW) / 2;
      const y = trayRect.y + rowGapY + ri * (rowH + rowGapY);
      row.forEach((chip) => {
        const w = widths[chips.indexOf(chip)];
        chip.dataset.homeX = x;
        chip.dataset.homeY = y;
        x += w + gap;
      });
    });
  }

  function placeAtHome(chip, instant) {
    if (instant) chip.style.transition = 'none';
    chip.style.left = chip.dataset.homeX + 'px';
    chip.style.top = chip.dataset.homeY + 'px';
    if (instant) {
      void chip.offsetWidth; // 强制重排后恢复过渡
      chip.style.transition = '';
    }
  }

  function slotCenter(slot) {
    const r = rectInStage(slot);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2, r };
  }

  function freeSlotOf(chip) {
    if (chip.dataset.slot === undefined || chip.dataset.slot === '') return;
    const slot = slots[+chip.dataset.slot];
    slot.classList.remove('filled');
    delete slot.dataset.chip;
    chip.dataset.slot = '';
    chip.classList.remove('placed');
  }

  function checkComplete() {
    const filled = slots.every((s) => s.dataset.chip !== undefined);
    if (filled) {
      const words = slots.map((s) => chips[+s.dataset.chip].textContent.trim());
      result.textContent = '「大自然解决问题的方式是：' + words.join('、') + '」—— 记住这句话，我们今天还会回来。';
      result.classList.add('show');
      // P19 会把这句话调回屏幕
      try { localStorage.setItem('day1-p8-sentence', words.join('、')); } catch (e) { /* file:// 下可能不可用 */ }
    } else {
      result.classList.remove('show');
    }
  }

  /* ---------- 拖拽 ---------- */
  let active = null;
  let offX = 0, offY = 0;

  chips.forEach((chip, idx) => {
    chip.dataset.idx = idx;
    chip.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      active = chip;
      chip.setPointerCapture(e.pointerId);
      chip.classList.add('dragging');
      const [sx, sy] = toStage(e.clientX, e.clientY);
      const r = rectInStage(chip);
      offX = sx - r.x;
      offY = sy - r.y;
      freeSlotOf(chip);
      checkComplete();
    });

    chip.addEventListener('pointermove', (e) => {
      if (active !== chip) return;
      const [sx, sy] = toStage(e.clientX, e.clientY);
      chip.style.left = sx - offX + 'px';
      chip.style.top = sy - offY + 'px';

      // 空位悬停高亮
      const cx = sx - offX + rectInStage(chip).w / 2;
      const cy = sy - offY + rectInStage(chip).h / 2;
      slots.forEach((slot) => {
        const c = slotCenter(slot);
        const inside = cx > c.r.x && cx < c.r.x + c.r.w && cy > c.r.y && cy < c.r.y + c.r.h;
        slot.classList.toggle('hover', inside && slot.dataset.chip === undefined);
      });
    });

    chip.addEventListener('pointerup', () => {
      if (active !== chip) return;
      active = null;
      chip.classList.remove('dragging');

      const r = rectInStage(chip);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;

      let landed = null;
      for (const slot of slots) {
        if (slot.dataset.chip !== undefined) continue;
        const c = slotCenter(slot);
        if (cx > c.r.x && cx < c.r.x + c.r.w && cy > c.r.y && cy < c.r.y + c.r.h) {
          landed = slot;
          break;
        }
      }

      slots.forEach((s) => s.classList.remove('hover'));

      if (landed) {
        const c = slotCenter(landed);
        chip.style.left = c.x - r.w / 2 + 'px';
        chip.style.top = c.y - r.h / 2 + 'px';
        chip.classList.add('placed');
        chip.dataset.slot = slots.indexOf(landed);
        landed.dataset.chip = chip.dataset.idx;
        landed.classList.add('filled');
      } else {
        placeAtHome(chip, false);
      }
      checkComplete();
    });
  });

  function resetAll() {
    chips.forEach((chip) => {
      freeSlotOf(chip);
      placeAtHome(chip, false);
    });
    checkComplete();
  }
  resetLink.addEventListener('click', resetAll);

  /* ---------- 进入页面时布局 ---------- */
  let laidOut = false;
  slide.addEventListener('slideenter', () => {
    // 等一帧让 display:block 生效后再测量
    requestAnimationFrame(() => {
      layoutHomes();
      chips.forEach((chip) => {
        if (chip.dataset.slot === undefined || chip.dataset.slot === '') {
          placeAtHome(chip, !laidOut ? true : false);
        }
      });
      laidOut = true;
    });
  });

  window.addEventListener('resize', () => {
    if (!slide.classList.contains('active')) return;
    layoutHomes();
    chips.forEach((chip) => {
      if (chip.dataset.slot === undefined || chip.dataset.slot === '') placeAtHome(chip, true);
    });
  });
})();
