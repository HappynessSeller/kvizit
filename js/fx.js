// Visual effects: confetti / petal bursts and sparkles. All respect reduced motion.
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let canvas, ctx, parts = [], raf = 0;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  ctx = canvas.getContext('2d');
  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);
}

const PALETTE = ['#e86fa8', '#ffd166', '#8b6fd1', '#6f8fe0', '#8fbf6a', '#f7b2a0', '#ffffff'];

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0);
  for (const p of parts) {
    p.vy += p.g;
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx + Math.sin(p.life * 0.05 + p.seed) * p.wobble;
    p.y += p.vy;
    p.rot += p.vr;
    p.life--;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life / 40);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    if (p.shape === 0) { ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (p.shape === 1) { ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
    else {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2, b = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a) * p.s, Math.sin(a) * p.s);
        ctx.lineTo(Math.cos(b) * p.s * 0.45, Math.sin(b) * p.s * 0.45);
      }
      ctx.fill();
    }
    ctx.restore();
  }
  if (parts.length) raf = requestAnimationFrame(tick);
  else { raf = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}

export function confetti({ x = innerWidth / 2, y = innerHeight / 3, count = 120, spread = 1, colors = PALETTE, rain = false } = {}) {
  if (reduce()) return;
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    const a = rain ? Math.PI / 2 : Math.random() * Math.PI * 2;
    const sp = rain ? Math.random() * 2 : (3 + Math.random() * 9) * spread;
    parts.push({
      x: rain ? Math.random() * innerWidth : x, y: rain ? -20 - Math.random() * innerHeight * 0.5 : y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (rain ? 0 : 4),
      g: rain ? 0.05 : 0.18, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      s: 5 + Math.random() * 7, c: colors[i % colors.length], shape: i % 3,
      life: rain ? 260 + Math.random() * 120 : 110 + Math.random() * 70, wobble: rain ? 1.2 : 0.4, seed: Math.random() * 9,
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

/** little paint splash at a screen point */
export function splash(x, y, color) {
  if (reduce()) return;
  const host = document.createElement('div');
  host.className = 'splash';
  host.style.left = `${x}px`;
  host.style.top = `${y}px`;
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('i');
    const a = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
    const r = 26 + Math.random() * 30;
    d.style.setProperty('--x', `${Math.cos(a) * r}px`);
    d.style.setProperty('--y', `${Math.sin(a) * r}px`);
    d.style.setProperty('--s', (0.5 + Math.random() * 0.9).toFixed(2));
    d.style.background = i % 3 ? color : '#fff';
    host.append(d);
  }
  document.body.append(host);
  setTimeout(() => host.remove(), 900);
}

/** fly an element-sized drop icon from one screen point to another */
export function fly(fromEl, toEl, html, { duration = 700, onEnd } = {}) {
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
  const n = document.createElement('div');
  n.className = 'flyer';
  n.innerHTML = html;
  document.body.append(n);
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  if (reduce()) { n.remove(); onEnd?.(); return; }
  const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 80, my = Math.min(y0, y1) - 80;
  const frames = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1;
    frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1.4 - t * 0.6})`, opacity: t > 0.92 ? 0.4 : 1 });
  }
  n.animate(frames, { duration, easing: 'cubic-bezier(.5,0,.6,1)' }).finished.then(() => { n.remove(); onEnd?.(); });
}
