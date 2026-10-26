/* ============================================================
   boids.js — 集群涌现实时模拟（P5b）
   每只个体只遵守三条局部规则：分离 / 对齐 / 聚拢，
   只看最近的 K 个邻居（滑块可调）。点击画面投放"老鹰"。
   ============================================================ */

(function () {
  const slide = document.getElementById('slide-boids');
  if (!slide) return;

  const canvas = slide.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const W = (canvas.width = 1920);
  const H = (canvas.height = 1080);

  const slider = slide.querySelector('#neighborRange');
  const kLabel = slide.querySelector('#kValue');
  const resetBtn = slide.querySelector('#boidsReset');

  const COUNT = 280;
  const MAX_SPEED = 3.4;
  const MAX_FORCE = 0.062;
  const SEP_DIST = 30;
  const EDGE_MARGIN = 90;
  const PREDATOR_RANGE = 240;
  const PREDATOR_LIFE = 380; // 帧

  let K = parseInt(slider.value, 10);
  let boids = [];
  let predators = [];
  let running = false;
  let rafId = null;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function seed() {
    boids = [];
    // 从三个"起飞点"释放，开场更像真实群落汇合
    const origins = [
      [W * 0.25, H * 0.7],
      [W * 0.5, H * 0.35],
      [W * 0.75, H * 0.65],
    ];
    for (let i = 0; i < COUNT; i++) {
      const [ox, oy] = origins[i % origins.length];
      const angle = rand(0, Math.PI * 2);
      boids.push({
        x: ox + rand(-70, 70),
        y: oy + rand(-70, 70),
        vx: Math.cos(angle) * rand(1.4, MAX_SPEED),
        vy: Math.sin(angle) * rand(1.4, MAX_SPEED),
        amber: Math.random() < 0.08, // 少数个体带主题色，增加画面层次
      });
    }
    predators = [];
  }

  /* ---------- 单帧行为 ---------- */
  function step() {
    // 每只找最近 K 个邻居（O(n²)，280 只在 1080p 下足够流畅）
    for (const b of boids) {
      const dists = [];
      for (const o of boids) {
        if (o === b) continue;
        const dx = o.x - b.x, dy = o.y - b.y;
        dists.push({ o, d2: dx * dx + dy * dy });
      }
      dists.sort((p, q) => p.d2 - q.d2);
      const neighbors = dists.slice(0, K);

      let sepX = 0, sepY = 0, aliX = 0, aliY = 0, cohX = 0, cohY = 0;
      let sepN = 0;
      for (const { o, d2 } of neighbors) {
        const d = Math.sqrt(d2) || 0.01;
        if (d < SEP_DIST) {
          sepX += (b.x - o.x) / d;
          sepY += (b.y - o.y) / d;
          sepN++;
        }
        aliX += o.vx; aliY += o.vy;
        cohX += o.x; cohY += o.y;
      }

      let fx = 0, fy = 0;
      const n = neighbors.length;
      if (n > 0) {
        // 对齐
        aliX /= n; aliY /= n;
        fx += steer(b, aliX, aliY) * 1.0;
        fy += steerY(b, aliX, aliY) * 1.0;
        // 聚拢
        cohX = cohX / n - b.x; cohY = cohY / n - b.y;
        fx += steer(b, cohX, cohY) * 0.72;
        fy += steerY(b, cohX, cohY) * 0.72;
      }
      if (sepN > 0) {
        fx += steer(b, sepX, sepY) * 1.65;
        fy += steerY(b, sepX, sepY) * 1.65;
      }

      // 躲避老鹰（压倒一切的恐惧）
      for (const p of predators) {
        const dx = b.x - p.x, dy = b.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < PREDATOR_RANGE * PREDATOR_RANGE) {
          const d = Math.sqrt(d2) || 0.01;
          const w = 1 - d / PREDATOR_RANGE;
          fx += (dx / d) * w * 0.9;
          fy += (dy / d) * w * 0.9;
        }
      }

      // 软边界：越界越深，回推力越大（防止整群飞出画面）
      if (b.x < EDGE_MARGIN) fx += (EDGE_MARGIN - b.x) * 0.004;
      if (b.x > W - EDGE_MARGIN) fx -= (b.x - (W - EDGE_MARGIN)) * 0.004;
      if (b.y < EDGE_MARGIN) fy += (EDGE_MARGIN - b.y) * 0.004;
      if (b.y > H - EDGE_MARGIN) fy -= (b.y - (H - EDGE_MARGIN)) * 0.004;

      // 微小扰动，避免群体固化成整齐网格
      fx += (Math.random() - 0.5) * 0.03;
      fy += (Math.random() - 0.5) * 0.03;

      b.vx += fx; b.vy += fy;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > MAX_SPEED) { b.vx = (b.vx / sp) * MAX_SPEED; b.vy = (b.vy / sp) * MAX_SPEED; }
      if (sp < 1.2 && sp > 0) { b.vx = (b.vx / sp) * 1.2; b.vy = (b.vy / sp) * 1.2; }
    }

    for (const b of boids) { b.x += b.vx; b.y += b.vy; }

    // 老鹰追群体质心
    for (const p of predators) {
      let cx = 0, cy = 0;
      for (const b of boids) { cx += b.x; cy += b.y; }
      cx /= boids.length; cy /= boids.length;
      const dx = cx - p.x, dy = cy - p.y;
      const d = Math.hypot(dx, dy) || 0.01;
      p.vx = p.vx * 0.94 + (dx / d) * 4.6 * 0.06;
      p.vy = p.vy * 0.94 + (dy / d) * 4.6 * 0.06;
      p.x += p.vx * 4.2;
      p.y += p.vy * 4.2;
      p.life--;
    }
    predators = predators.filter((p) => p.life > 0);
  }

  // 期望方向 -> 受限转向力（x 分量）
  function steer(b, tx, ty) {
    const m = Math.hypot(tx, ty) || 0.01;
    const dx = (tx / m) * MAX_SPEED - b.vx;
    return clampForce(dx, (ty / m) * MAX_SPEED - b.vy)[0];
  }
  function steerY(b, tx, ty) {
    const m = Math.hypot(tx, ty) || 0.01;
    const dy = (ty / m) * MAX_SPEED - b.vy;
    return clampForce((tx / m) * MAX_SPEED - b.vx, dy)[1];
  }
  function clampForce(x, y) {
    const m = Math.hypot(x, y);
    if (m > MAX_FORCE) return [(x / m) * MAX_FORCE, (y / m) * MAX_FORCE];
    return [x, y];
  }

  /* ---------- 渲染 ---------- */
  function draw() {
    // 半透明覆盖产生拖尾
    ctx.fillStyle = 'rgba(7, 13, 24, 0.28)';
    ctx.fillRect(0, 0, W, H);

    for (const b of boids) {
      const angle = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(angle);
      ctx.fillStyle = b.amber ? 'rgba(255, 180, 84, 0.95)' : 'rgba(208, 224, 250, 0.88)';
      ctx.beginPath();
      ctx.moveTo(7.5, 0);
      ctx.lineTo(-5.5, 3.6);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-5.5, -3.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (const p of predators) {
      const angle = Math.atan2(p.vy, p.vx);
      const fade = Math.min(1, p.life / 60);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.globalAlpha = fade;
      ctx.shadowColor = 'rgba(255, 140, 60, 0.9)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#ff9a3c';
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(-16, 12);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-16, -12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function loop() {
    if (!running) return;
    step();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  /* ---------- 交互 ---------- */
  slider.addEventListener('input', () => {
    K = parseInt(slider.value, 10);
    kLabel.textContent = K;
  });

  resetBtn.addEventListener('click', () => {
    seed();
    ctx.fillStyle = '#070d18';
    ctx.fillRect(0, 0, W, H);
  });

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const s = window.deckScale || 1;
    predators.push({
      x: (e.clientX - rect.left) / s,
      y: (e.clientY - rect.top) / s,
      vx: 0, vy: 0,
      life: PREDATOR_LIFE,
    });
  });

  /* ---------- 随幻灯片启停 ---------- */
  slide.addEventListener('slideenter', () => {
    if (running) return;
    running = true;
    seed();
    ctx.fillStyle = '#070d18';
    ctx.fillRect(0, 0, W, H);
    loop();
  });
  slide.addEventListener('slideleave', () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  });
})();
