// Generative helpers for the vector scenes (see art/PHILOSOPHY.md).
// Everything takes its own seed so tweaking one form never reshuffles the rest of a picture.
// Forms return SVG path data (strings) or point lists; the scene decides what is a region.

const f = (n) => Math.round(n * 10) / 10;
const TAU = Math.PI * 2;

// A picture "variant" shifts every seed at once: same areas, freshly grown shapes. 0 = the original.
let VARIANT = 0;
export const setVariant = (v) => { VARIANT = v | 0; };
export const variant = () => VARIANT;

export function rng(seed) {
  let a = ((seed + VARIANT * 7919) * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1D fractal value noise in [-1, 1]: n(x, octaves) */
export function noise1(seed) {
  const R = rng(seed);
  const t = Float64Array.from({ length: 1024 }, () => R() * 2 - 1);
  const v = (x) => {
    const i = Math.floor(x), fr = x - i, u = fr * fr * (3 - 2 * fr);
    const a = t[i & 1023], b = t[(i + 1) & 1023];
    return a + (b - a) * u;
  };
  return (x, oct = 3, gain = 0.5) => {
    let s = 0, amp = 1, fq = 1, norm = 0;
    for (let o = 0; o < oct; o++) { s += amp * v(x * fq + o * 31.7); norm += amp; amp *= gain; fq *= 2.03; }
    return s / norm;
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** mix two #rrggbb colours */
export function mix(c1, c2, t) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------- paths
/** Catmull-Rom spline through points as cubic béziers */
export function smooth(pts, closed = false, k = 1 / 6) {
  const n = pts.length;
  const P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) * k)} ${f(p1[1] + (p2[1] - p0[1]) * k)} ` +
      `${f(p2[0] - (p3[0] - p1[0]) * k)} ${f(p2[1] - (p3[1] - p1[1]) * k)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

/** Ramer–Douglas–Peucker */
export function simplify(pts, eps = 0.4) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplify(pts.slice(idx), eps)];
}

/** simplify a closed loop (split in two so the endpoints never coincide) */
export function simplifyClosed(pts, eps = 0.4) {
  const h = Math.floor(pts.length / 2);
  return [...simplify(pts.slice(0, h + 1), eps).slice(0, -1), ...simplify([...pts.slice(h), pts[0]], eps).slice(0, -1)];
}

export const poly = (pts, closed = true) =>
  'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + (closed ? 'Z' : '');

/** close an open top-edge (left→right) down to a flat bottom */
export const closeDown = (topD, pts, bottom) =>
  `${topD}L${f(pts[pts.length - 1][0])} ${bottom}L${f(pts[0][0])} ${bottom}Z`;

// ---------------------------------------------------------------- terrain
/**
 * Ridgeline: soft cosine-power bumps (rounded fells) + fractal noise wear.
 * peaks: [{ x, h, w, k }]  (k < 2 → broad shoulders, k > 2 → pointier)
 */
export function ridge({ seed, base, peaks = [], amp = 6, scale = 0.012, oct = 4, x0 = -20, x1 = 820, step = 6 }) {
  const N = noise1(seed);
  const pts = [];
  for (let x = x0; x <= x1 + 0.01; x += step) {
    let y = base;
    for (const p of peaks) {
      const d = (x - p.x) / p.w;
      if (Math.abs(d) < 1) y -= p.h * Math.pow(Math.cos(d * Math.PI / 2), p.k ?? 1.6);
    }
    // wear is stronger on the slopes than on the valley floor
    y += N(x * scale, oct) * amp * (0.35 + 0.65 * smoothstep(base, base - 60, y));
    pts.push([x, y]);
  }
  return pts;
}
export const ridgeY = (pts, x) => {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return lerp(y0, y1, (x - x0) / (x1 - x0));
    }
  }
  return pts[pts.length - 1][1];
};

/**
 * A band hugging a ridge: from ridge+top(x) to ridge+bottom(x) between xa..xb, tapering at the ends.
 * Used for snow caps and autumn colour that follow the contour of a fell.
 */
export function contourBand(ridgePts, { seed, xa, xb, top = 0, depth = 20, rough = 0.5, step = 5, taperTop = true }) {
  const N = noise1(seed);
  const up = [], down = [];
  for (let x = xa; x <= xb + 0.01; x += step) {
    const t = (x - xa) / (xb - xa);
    const taper = Math.pow(Math.sin(t * Math.PI), 0.6);
    const y = ridgeY(ridgePts, x);
    const d = depth * taper * (1 + rough * N(x * 0.035, 3));
    const t0 = taperTop ? top * taper : top;
    up.push([x, y + t0]);
    down.push([x, y + t0 + Math.max(0.5, d)]);
  }
  return smooth([...up, ...down.reverse()], true);
}

/**
 * Treeline skyline: a population of individual trees rasterised into one silhouette.
 * kinds: weights for 'spruce' | 'pine' | 'round'
 */
export function treeline({ seed, y0, minH, maxH, gap = 9, x0 = -12, x1 = 812, kinds = { spruce: 1 }, clump = 0.012, mirror = false, eps = 0.35, clearings = 0.6 }) {
  const R = rng(seed), N = noise1(seed + 7), G = noise1(seed + 13);
  const res = 2; // samples per px
  const W = Math.round((x1 - x0) * res) + 1;
  const sky = new Float64Array(W).fill(0); // height above base
  const put = (x, h) => {
    const i = Math.round((x - x0) * res);
    if (i >= 0 && i < W && h > sky[i]) sky[i] = h;
  };
  const kindList = Object.entries(kinds);
  const total = kindList.reduce((s, [, w]) => s + w, 0);
  const pickKind = () => { let u = R() * total; for (const [k, w] of kindList) if ((u -= w) <= 0) return k; return kindList[0][0]; };
  for (let x = x0; x < x1;) {
    // clearings: stretches with only low scrub
    if (G(x * 0.01, 2) < -clearings) { x += gap * (0.8 + R()); continue; }
    const stand = 0.5 + 0.5 * N(x * clump, 3);
    const h = lerp(minH, maxH, stand) * (0.72 + 0.5 * R());
    const kind = pickKind();
    if (kind === 'spruce') {
      const hw = h * (0.19 + 0.07 * R()), tier = Math.max(3, h * 0.16), ph = R();
      for (let d = 0; d <= h; d += 0.5) {
        // rounded leader, soft drooping tiers rather than a sawtooth
        const cone = hw * Math.pow(d / h, 0.85) + (d < h * 0.12 ? hw * 0.1 * Math.sin(Math.PI * d / (h * 0.12)) : 0);
        const saw = Math.pow((d / tier + ph) % 1, 0.55);
        const w = cone * (0.74 + 0.26 * saw);
        for (let dx = -w; dx <= w; dx += 0.5) put(x + dx, h - d);
      }
    } else if (kind === 'pine') {
      const cw = h * (0.22 + 0.1 * R()), ch = h * 0.32;
      for (let dx = -cw; dx <= cw; dx += 0.5) {
        const u = dx / cw;
        put(x + dx, h - ch * (1 - Math.sqrt(1 - u * u)) * 0.9 - (1 - Math.cos(u * 9 + seed)) * 1.2);
      }
      for (let dx = -0.8; dx <= 0.8; dx += 0.5) put(x + dx, h - ch);
    } else {
      // leafy dome: rounded crown with a couple of soft lumps
      const cw = h * (0.2 + 0.08 * R()), ph = R() * 6;
      for (let dx = -cw; dx <= cw; dx += 0.5) {
        const u = dx / cw;
        put(x + dx, h * (0.25 + 0.75 * Math.pow(1 - u * u, 0.6)) + Math.sin(u * 5 + ph) * h * 0.04);
      }
    }
    x += gap * (0.45 + 0.9 * R()) * (h / maxH + 0.4);
  }
  // soften the skyline a touch so tips read as needles, not crystals
  const soft = new Float64Array(W);
  for (let i = 0; i < W; i++) {
    let sum = 0, k = 0;
    for (let j = -2; j <= 2; j++) { const v = sky[Math.min(W - 1, Math.max(0, i + j))]; sum += v * (3 - Math.abs(j)); k += 3 - Math.abs(j); }
    soft[i] = Math.max(sum / k, sky[i] * 0.86);
  }
  const pts = [];
  for (let i = 0; i < W; i++) {
    const x = x0 + i / res;
    pts.push([x, mirror ? y0 + soft[i] * 0.9 : y0 - soft[i]]);
  }
  return simplify(pts, eps);
}

// ---------------------------------------------------------------- organic shapes
/** scalloped foliage blob / noise-deformed circle */
export function blob({ seed, cx, cy, r, ry = r, lobes = 7, scallop = 0.16, wobble = 0.12, n = 120, eps = 0.25 }) {
  const R = rng(seed);
  const harm = [2, 3, 5].map((k) => [k, (R() * 2 - 1) * wobble / k * 2, R() * TAU]);
  const ph = R() * TAU;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    let s = 1 - scallop + scallop * Math.sqrt(Math.abs(Math.sin(lobes * a / 2 + ph)));
    for (const [k, amp, p] of harm) s += amp * Math.sin(k * a + p);
    pts.push([cx + Math.cos(a) * r * s, cy + Math.sin(a) * ry * s]);
  }
  return poly(simplifyClosed(pts, eps));
}

/** smooth pebble / rock with a flatter base */
export function rock({ seed, cx, cy, w, h }) {
  const R = rng(seed);
  const pts = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI; // top half, left → right
    const j = 0.82 + 0.3 * R();
    pts.push([cx + Math.cos(a) * w / 2 * (i === 0 || i === n - 1 ? 1 : j), cy + Math.sin(a) * h * j]);
  }
  pts.push([cx + w * 0.42, cy + h * 0.12], [cx - w * 0.4, cy + h * 0.14]);
  return smooth(pts, true);
}

/** cumulus: billows stacked in tiers on a flat base. Returns { body, hi, base } */
export function cumulus({ seed, x, y, w, h }) {
  const R = rng(seed);
  const circles = [];
  const n = 5 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) { // base row: small, flattened
    const t = (i + 0.5) / n;
    const r = h * (0.28 + 0.22 * Math.sin(t * Math.PI)) * (0.8 + 0.4 * R());
    circles.push([x - w / 2 + w * t + (R() - 0.5) * w / n * 0.4, y - r * 0.5, r]);
  }
  const m = 2 + Math.floor(R() * 2);
  for (let i = 0; i < m; i++) { // billows on top, off-centre
    const t = 0.25 + 0.5 * (i + R() * 0.6) / m;
    const r = h * (0.42 + 0.3 * R());
    circles.push([x - w / 2 + w * t, y - h * 0.32 - r * 0.45, r]);
  }
  circles.push([x - w * (0.05 + 0.12 * R()), y - h * 0.62, h * (0.32 + 0.12 * R())]); // crown
  const outline = (cs, base, shrink = 1, dy = 0) => {
    const pts = [];
    for (let xx = x - w; xx <= x + w; xx += 1) {
      let top = Infinity;
      for (const [cx, cy, r0] of cs) {
        const r = r0 * shrink, dx = xx - cx;
        if (Math.abs(dx) < r) top = Math.min(top, cy + dy - Math.sqrt(r * r - dx * dx));
      }
      if (top < base) pts.push([xx, top]);
    }
    return pts;
  };
  const top = outline(circles, y);
  const a = top[0], b = top[top.length - 1];
  const body = poly(simplify(top, 0.3), false) + `C${f(b[0] + 6)} ${f(y + 2)} ${f(b[0] - 4)} ${f(y + 4)} ${f(b[0] - 14)} ${f(y + 4)}` +
    `L${f(a[0] + 14)} ${f(y + 4)}C${f(a[0] + 4)} ${f(y + 4)} ${f(a[0] - 6)} ${f(y + 2)} ${f(a[0])} ${f(a[1])}Z`;
  const hiTop = outline(circles, y - h * 0.22, 0.8, -h * 0.06);
  const hi = hiTop.length > 4 ? poly(simplify(hiTop, 0.3), false) + `Q${f(x)} ${f(y - h * 0.1)} ${f(hiTop[0][0])} ${f(hiTop[0][1])}Z` : '';
  // the flat, shaded underside
  const base = `M${f(a[0] + 8)} ${f(y + 4)}Q${f(x)} ${f(y - h * 0.26)} ${f(b[0] - 8)} ${f(y + 4)}Z`;
  return { body, hi, base };
}

// ---------------------------------------------------------------- trees
/**
 * Foreground spruce: stacked drooping tiers, left and right jittered independently.
 * Returns { body, caps[] (snow pillows per tier), tiers }
 */
export function spruceForm({ seed, x, y, h, w, tiers = 7, trunk = 0.07 }) {
  const R = rng(seed);
  const top = y - h, crownBot = y - h * trunk, crownH = crownBot - top;
  const T = [];
  for (let i = 0; i < tiers; i++) {
    const t1 = (i + 1) / tiers;
    const yb = top + crownH * Math.pow(t1, 0.92);
    const yt = i === 0 ? top : T[i - 1].yb - (T[i - 1].yb - T[i - 1].yt) * 0.32;
    const hw = (w / 2) * (0.16 + 0.84 * Math.pow(t1, 0.9));
    T.push({ yt, yb, side: [-1, 1].map((s) => ({ hw: hw * (0.88 + 0.24 * R()), droop: (yb - yt) * (0.12 + 0.18 * R()), inner: 0.38 + 0.14 * R() })) });
  }
  // build each side as quadratic segments from the tip down
  const sidePts = (si) => {
    const s = si ? 1 : -1;
    const segs = [];
    T.forEach((t, i) => {
      const sd = t.side[si];
      const ox = x + s * sd.hw, oy = t.yb + sd.droop;
      // out along the upper edge of the branch, sagging slightly
      segs.push({ c: [x + s * sd.hw * 0.55, t.yt + (t.yb - t.yt) * 0.62], p: [ox, oy], outer: true });
      // tuck back in under the branch
      const ix = i === tiers - 1 ? x + s * w * trunk * 0.9 : x + s * sd.hw * sd.inner;
      const iy = i === tiers - 1 ? crownBot : T[i + 1].yt;
      segs.push({ c: [ox - s * sd.hw * 0.18, oy - 1], p: [ix, iy] });
    });
    return segs;
  };
  const L = sidePts(0), Rt = sidePts(1);
  const tw = Math.max(2.5, w * trunk * 0.9);
  let d = `M${f(x)} ${f(top - 3)}`;
  for (const s of Rt) d += `Q${f(s.c[0])} ${f(s.c[1])} ${f(s.p[0])} ${f(s.p[1])}`;
  d += `L${f(x + tw)} ${f(y)}L${f(x - tw)} ${f(y)}L${f(x - tw)} ${f(crownBot)}`;
  for (let i = L.length - 1; i >= 0; i--) {
    const prev = i ? L[i - 1].p : [x, top - 3];
    d += `Q${f(L[i].c[0])} ${f(L[i].c[1])} ${f(prev[0])} ${f(prev[1])}`;
  }
  d += 'Z';

  // snow pillows resting on the upper edge of each tier
  const q = (a, c, b, u) => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
  const caps = T.map((t, i) => {
    const edge = (segs, sx) => {
      const start = i === 0 ? [x, top - 3] : segs[i * 2 - 1].p;
      const s = segs[i * 2];
      return Array.from({ length: 7 }, (_, k) => q(start, s.c, s.p, 0.08 + k / 6 * 0.9));
    };
    const l = edge(L), r = edge(Rt);
    const th = Math.max(2.4, (t.yb - t.yt) * 0.28);
    const topE = [...l.reverse().map(([px, py], k) => [px, py - th * Math.sin((k + 1) / 8 * Math.PI) * 0.9 - 0.6]),
      ...r.map(([px, py], k) => [px, py - th * Math.sin((7 - k) / 8 * Math.PI) * 0.9 - 0.6])];
    const botE = [...r.reverse().map(([px, py], k) => [px, py + th * (0.25 + 0.35 * ((k % 2) ? 1 : 0))]),
      ...l.reverse().map(([px, py], k) => [px, py + th * (0.25 + 0.35 * ((k % 2) ? 0 : 1))])];
    return smooth([...topE, ...botE], true);
  });
  return { body: d, caps, tiers: T };
}

/**
 * Birch: noise-wobbled tapering trunk, lenticels that crowd towards the dark base,
 * branch scars ("eyes") and a few twigs reaching into the crown.
 */
export function birchForm({ seed, x, base = 600, top, w, lean = 0, ink = '#3b2f4a' }) {
  const R = rng(seed), N = noise1(seed + 3);
  const H = base - top;
  const cx = (t) => x + lean * Math.pow(t, 1.3) + N(t * 2.2, 2) * w * 0.5 + Math.sin(t * Math.PI * 1.6) * w * 0.9;
  const hw = (t) => w * (1 - 0.68 * Math.pow(t, 0.9));
  const L = [], Rr = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26, yy = base - t * H;
    L.push([cx(t) - hw(t) * (1 + N(t * 9 + 5, 2) * 0.06), yy]);
    Rr.push([cx(t) + hw(t) * (1 + N(t * 9 + 9, 2) * 0.06), yy]);
  }
  L[0][1] = Rr[0][1] = base + 2;
  const trunk = smooth([...L, ...Rr.reverse()], true, 1 / 7);
  const at = (t) => [cx(t), base - t * H, hw(t)];

  const marks = [];
  // lenticels: horizontal dark dashes, denser and heavier near the base
  for (let t = 0.03; t < 0.97;) {
    const [mx, my, mw] = at(t);
    // lenticels: thin dark bands reaching in from either edge, heavier towards the base
    const side = R() < 0.5 ? -1 : 1;
    const len = mw * (0.5 + 0.9 * R());
    const sx = mx + side * mw * 0.98, ex = sx - side * len;
    const sw = (1 + 1.6 * R()) * (1.3 - t * 0.7);
    marks.push(`<path d="M${f(sx)} ${f(my)}Q${f((sx + ex) / 2)} ${f(my + 1.2)} ${f(ex)} ${f(my + R() * 2 - 1)}" fill="none" stroke="${ink}" stroke-width="${f(sw)}" stroke-linecap="round"/>`);
    t += (0.022 + 0.05 * R()) * (0.6 + t);
  }
  // black fissured base
  const [bx, , bw] = at(0.0), [, by2, bw2] = at(0.1);
  marks.push(`<path d="M${f(bx - bw)} ${base}L${f(bx - bw2 * 0.95)} ${f(by2 + 6)}Q${f(bx - bw * 0.2)} ${f(by2 + 14)} ${f(bx + bw2 * 0.2)} ${f(by2)}L${f(bx + bw2 * 0.5)} ${f(by2 + 10)}L${f(bx + bw2 * 0.95)} ${f(by2 + 4)}L${f(bx + bw)} ${base}Z" fill="${ink}" stroke="none" opacity=".8"/>`);
  // branch scars
  for (let k = 0; k < 3; k++) {
    const t = 0.3 + 0.5 * R();
    const [mx, my, mw] = at(t);
    const s = R() < 0.5 ? -1 : 1;
    marks.push(`<path d="M${f(mx + s * mw)} ${f(my - 5)}L${f(mx + s * mw * 0.2)} ${f(my)}L${f(mx + s * mw)} ${f(my + 5)}" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>`);
  }
  // twigs reaching up and out into the crown
  const twigs = [];
  for (let k = 0; k < 5; k++) {
    const t = 0.6 + 0.36 * (k / 4);
    const [mx, my, mw] = at(t);
    const s = k % 2 ? 1 : -1;
    const len = (24 + 30 * R()) * (1.2 - t * 0.6);
    twigs.push(`<path d="M${f(mx + s * mw * 0.6)} ${f(my)}Q${f(mx + s * len * 0.35)} ${f(my - len * 0.2)} ${f(mx + s * len * 0.75)} ${f(my - len * 0.85)}" fill="none" stroke="${ink}" stroke-width="${f(Math.max(1.2, mw * 0.45))}" stroke-linecap="round"/>`);
  }
  return { trunk, marks, twigs, top: at(1) };
}

/**
 * Crown as clusters of scalloped blobs. Clusters sit on a ring so the middle keeps sky holes;
 * `sprays` adds drooping, elongated hangers along the lower edge (birch).
 */
export function crownBlobs({ seed, cx, cy, rx, ry, n = 6, size = [26, 40], lobes = 7, hang = 0, sprays = 0 }) {
  const R = rng(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + R() * 0.8;
    const rad = 0.45 + 0.55 * Math.sqrt(R());
    const r = lerp(size[0], size[1], R());
    const px = cx + Math.cos(a) * rx * rad * 0.78;
    const py = cy + Math.sin(a) * ry * rad * 0.72 + (Math.sin(a) > 0 ? hang * R() : 0);
    out.push({ x: px, y: py, r, d: blob({ seed: seed * 31 + i, cx: px, cy: py, r, ry: r * (0.78 + 0.14 * R()), lobes, scallop: 0.16, wobble: 0.1 }) });
  }
  for (let i = 0; i < sprays; i++) {
    const a = Math.PI * (0.15 + 0.7 * (i + R() * 0.5) / sprays);
    const r = lerp(size[0], size[1], R()) * 0.5;
    const px = cx + Math.cos(a) * rx * 0.85, py = cy + Math.sin(a) * ry * 0.75 + r * 1.2;
    out.push({ x: px, y: py, r, spray: true, d: blob({ seed: seed * 37 + i, cx: px, cy: py, r: r * 0.6, ry: r * 1.7, lobes: 9, scallop: 0.28, wobble: 0.12 }) });
  }
  // back to front: upper blobs first so lower ones overlap them
  return out.sort((a, b) => a.y - b.y);
}

/** a loose scatter of small leaves inside an ellipse; clumped by noise */
export function leafScatter({ seed, cx, cy, rx, ry, n = 60, size = 5, colours }) {
  const R = rng(seed), N = noise1(seed + 11);
  let s = '';
  let placed = 0, tries = 0;
  while (placed < n && tries++ < n * 20) {
    const a = R() * TAU, rr = Math.sqrt(R());
    const x = cx + Math.cos(a) * rx * rr, y = cy + Math.sin(a) * ry * rr;
    if (N(x * 0.05 + y * 0.03, 2) < -0.15) continue;
    const sz = size * (0.7 + 0.6 * R()), rot = R() * 360;
    const c = colours[Math.floor(R() * colours.length)];
    s += `<path d="M0 ${f(-sz)}Q${f(sz * 0.7)} 0 0 ${f(sz)}Q${f(-sz * 0.7)} 0 0 ${f(-sz)}Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" fill="${c}"/>`;
    placed++;
  }
  return s;
}

// ---------------------------------------------------------------- sky + water
/**
 * Aurora curtain: thousands of vertical rays on a folding baseline, binned by brightness.
 * Returns { env (outline region), base (lower edge), rays: [{d, o}] }
 */
export function auroraCurtain({ seed, x0 = -30, x1 = 830, y, sway = 40, fold = 0.006, height = 140, step = 2.2, bins = 5 }) {
  const N1 = noise1(seed), N2 = noise1(seed + 5), N3 = noise1(seed + 9);
  const R = rng(seed + 1);
  const baseY = (x) => y + N1(x * fold, 3) * sway + Math.sin(x * 0.009 + seed) * sway * 0.35;
  const ends = (x) => smoothstep(x0, x0 + 110, x) * smoothstep(x1, x1 - 110, x);
  const slow = (x) => height * (0.45 + 0.55 * (0.5 + 0.5 * N2(x * 0.006, 2))) * (0.08 + 0.92 * ends(x));
  const hgt = (x) => slow(x) * (0.72 + 0.28 * N3(x * 0.08, 2));
  const buckets = Array.from({ length: bins }, () => '');
  for (let x = x0; x <= x1; x += step) {
    const b = baseY(x), h = hgt(x) * (0.85 + 0.3 * R());
    const bright = Math.min(0.999, Math.max(0, 0.5 + 0.5 * N3(x * 0.045 + 3, 3) + (R() - 0.5) * 0.25));
    const bi = Math.floor(bright * bins);
    const rw = step * (0.6 + 0.6 * R());
    // ray tapering to a hair-thin tip so the curtain frays out upwards
    buckets[bi] += `M${f(x)} ${f(b + 3)}L${f(x + rw * 0.45)} ${f(b + 3 - h)}L${f(x + rw * 0.55)} ${f(b + 3 - h)}L${f(x + rw)} ${f(b + 3)}Z`;
  }
  // calm outline for the colouring page: slow folds only
  const topPts = [], botPts = [];
  for (let x = x0; x <= x1; x += 16) { topPts.push([x, baseY(x) - slow(x) * 0.8]); botPts.push([x, baseY(x) + 2 + 4 * ends(x)]); }
  const env = smooth([...topPts, ...botPts.reverse()], true);
  const basePts = [];
  for (let x = x0 + 70; x <= x1 - 70; x += 12) basePts.push([x, baseY(x) + 3]);
  return {
    env,
    top: y - sway * 1.35 - height,
    bottom: y + sway * 1.35 + 6,
    base: smooth(basePts),
    rays: buckets.map((d, i) => ({ d, o: Math.round((0.12 + 0.62 * Math.pow((i + 0.5) / bins, 1.4)) * 100) / 100 })).filter((r) => r.d),
  };
}

/** star field with power-law brightness, denser along a band (Milky Way) */
export function starField({ seed, n = 200, x0 = 0, x1 = 800, y0 = 0, y1 = 360, band = null }) {
  const R = rng(seed);
  const stars = [];
  while (stars.length < n) {
    const x = lerp(x0, x1, R()), y = lerp(y0, y1, R());
    if (band) {
      const d = Math.abs((y - band.y - (x - 400) * band.slope)) / band.w;
      if (R() > 0.35 + 0.65 * Math.exp(-d * d)) continue;
    }
    const b = Math.pow(R(), 5);
    stars.push([x, y, 0.45 + 2.2 * b, 0.35 + 0.65 * Math.pow(R(), 0.5) * (0.4 + 0.6 * b)]);
  }
  return stars;
}

/** ripple lines on water: perspective spacing, gated by noise; returns path data */
export function ripples({ seed, y0, y1, x0 = 0, x1 = 800, rows = 18, gate = 0.15, minLen = 6, skip = null }) {
  const N = noise1(seed);
  let d = '';
  for (let k = 0; k < rows; k++) {
    const t = (k + 0.5) / rows;
    const y = y0 + (y1 - y0) * Math.pow(t, 1.6);
    const scale = 0.4 + t * 1.4;
    let start = null;
    for (let x = x0; x <= x1; x += 2) {
      const on = N(x * 0.02 / scale + k * 17.3, 2) > gate && !(skip && skip(x, y));
      if (on && start === null) start = x;
      if ((!on || x >= x1) && start !== null) {
        if (x - start >= minLen * scale) d += `M${f(start)} ${f(y)}h${f(x - start)}`;
        start = null;
      }
    }
  }
  return d;
}

/**
 * Water lines bucketed by depth: [{ d, w, o }] far to near. Segments are gentle arcs whose length and
 * weight grow towards the viewer; some rows are left calm so the surface reads as mirror bands.
 */
export function waterLines({ seed, y0, y1, x0 = 0, x1 = 800, rows = 22, gate = 0.15, calm = 0.25, skip = null }) {
  const N = noise1(seed), C = noise1(seed + 1);
  const buckets = [['', 0.8, 0.45], ['', 1.5, 0.5], ['', 2.6, 0.55]];
  for (let k = 0; k < rows; k++) {
    const t = (k + 0.5) / rows;
    if (C(t * 4, 2) < -calm) continue;
    const y = y0 + (y1 - y0) * Math.pow(t, 1.7);
    const scale = 0.3 + t * 2.2;
    const b = buckets[t < 0.3 ? 0 : t < 0.65 ? 1 : 2];
    let start = null;
    for (let x = x0; x <= x1; x += 2) {
      const on = N(x * 0.016 / scale + k * 17.3, 2) > gate && !(skip && skip(x, y));
      if (on && start === null) start = x;
      if ((!on || x >= x1) && start !== null) {
        const len = x - start;
        if (len >= 4 * scale) b[0] += `M${f(start)} ${f(y)}q${f(len / 2)} ${f(-0.8 * scale)} ${f(len)} 0`;
        start = null;
      }
    }
  }
  return buckets.filter((b) => b[0]).map(([d, w, o]) => ({ d, w, o }));
}

/**
 * Tufts of grass scattered with perspective (bigger towards the viewer) and clumping.
 * Returns a single stroked-path data string.
 */
export function grassTufts({ seed, n = 80, x0 = 0, x1 = 800, y0, y1, size = [6, 16], accept = () => true }) {
  const R = rng(seed), N = noise1(seed + 2);
  let d = '';
  let placed = 0, tries = 0;
  while (placed < n && tries++ < n * 30) {
    const x = lerp(x0, x1, R()), y = lerp(y0, y1, R());
    if (N(x * 0.02 + y * 0.013, 2) < -0.1 || !accept(x, y)) continue;
    const t = (y - y0) / (y1 - y0);
    const h = lerp(size[0], size[1], t) * (0.7 + 0.5 * R());
    const blades = 3 + Math.floor(R() * 3);
    for (let b = 0; b < blades; b++) {
      const a = (b / (blades - 1) - 0.5) * 1.3 + (R() - 0.5) * 0.3;
      const bh = h * (0.7 + 0.4 * R()) * (1 - Math.abs(a) * 0.3);
      d += `M${f(x + a * 2)} ${f(y)}q${f(a * bh * 0.2)} ${f(-bh * 0.6)} ${f(a * bh * 0.7)} ${f(-bh)}`;
    }
    placed++;
  }
  return d;
}

/** positions clumped by noise (for flowers, leaves on the ground, ...) */
export function clumped({ seed, n, x0, x1, y0, y1, threshold = 0.05, scale = 0.018, accept = () => true }) {
  const R = rng(seed), N = noise1(seed + 4);
  const out = [];
  let tries = 0;
  while (out.length < n && tries++ < n * 60) {
    const x = lerp(x0, x1, R()), y = lerp(y0, y1, R());
    if (N(x * scale + y * scale * 0.7 + 50, 3) < threshold || !accept(x, y)) continue;
    out.push([x, y, R()]);
  }
  return out;
}

// ---------------------------------------------------------------- golden-hour kit (Saaristo)
/** outline colour for a fill: the same hue pushed towards deep ink, so edges read as paint, not wire */
export const edge = (hex, k = 0.55) => mix(hex, '#2b1d3a', k);

/** low island: a dome with a treeline growing on it, fading out at the shores */
export function islandSilhouette({ seed, xa, xb, y0, h, treeMin = 4, treeMax = 14, kinds = { spruce: 3, pine: 2, round: 1 } }) {
  const tl = treeline({ seed, y0: 0, minH: treeMin, maxH: treeMax, gap: 6, x0: xa - 10, x1: xb + 10, kinds });
  const pts = [];
  for (let x = xa; x <= xb; x += 1) {
    const t = (x - xa) / (xb - xa);
    const dome = h * Math.pow(Math.sin(Math.PI * t), 0.6);
    const keep = smoothstep(0.04, 0.16, t) * smoothstep(0.96, 0.84, t);
    pts.push([x, y0 - dome + ridgeY(tl, x) * keep]);
  }
  return closeDown(poly(simplify(pts, 0.3), false), pts, y0 + 1);
}

/** long sunset cloud: ragged top, flat lit underside */
export function cloudStreak({ seed, x, y, w, th }) {
  const N = noise1(seed);
  const top = [], bot = [], lit = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64, xx = x - w / 2 + w * t;
    const env = Math.pow(Math.sin(Math.PI * t), 0.7);
    const billow = Math.pow(Math.max(0, N(t * 3.3 + 9, 2)), 1.5) * 1.6;
    top.push([xx, y - th * Math.pow(env, 1.3) * (0.5 + 0.5 * (0.5 + 0.5 * N(t * 7, 3)) + billow)]);
    const b = y + th * 0.24 * env * (0.7 + 0.3 * N(t * 9 + 4, 2));
    bot.push([xx, b]);
    lit.push([xx, b - th * 0.28 * env]);
  }
  return {
    body: smooth([...top, ...[...bot].reverse()], true),
    under: smooth([...lit, ...[...bot].reverse()], true),
  };
}

/** sun glitter: a column of short dashes widening towards the viewer */
export function glitter({ seed, cx, y0, y1, w0, w1, n = 240 }) {
  const R = rng(seed), N = noise1(seed + 3);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = Math.pow(R(), 1.3);
    const y = y0 + (y1 - y0) * t;
    const spread = lerp(w0, w1, t);
    const g = (R() + R() + R() - 1.5) / 1.5;
    const x = cx + g * spread;
    if (N(x * 0.03 + y * 0.2, 2) < -0.25) continue;
    const len = (2 + 14 * t) * (0.4 + R()) * (1 - Math.abs(g) * 0.6);
    out.push({ d: `M${f(x - len / 2)} ${f(y)}h${f(len)}`, w: f(0.8 + 2.2 * t), o: 1 - Math.abs(g) * 0.7 });
  }
  return out;
}

/**
 * Wind-bent Scots pine: a crooked tapering spine, a few long branches and flat
 * cloud-like foliage pads at their ends. Returns { trunk, branches[], pads[], bark[] }.
 */
export function pineForm({ seed, x, y, h, w = 16, lean = 0.35, branches = 6, padR = [36, 58], reach = 1 }) {
  const R = rng(seed), N = noise1(seed + 1);
  const n = 16, spine = [];
  let px = x, py = y, a = -Math.PI / 2;
  for (let i = 0; i <= n; i++) {
    spine.push([px, py]);
    const t = i / n;
    // crooked: a couple of real kinks where the wind broke the leader long ago
    a += N(t * 3.1, 2) * 0.34 + lean * 0.09 * smoothstep(0.15, 0.6, t) - lean * 0.07 * smoothstep(0.65, 1, t);
    px += Math.cos(a) * h / n;
    py += Math.sin(a) * h / n;
  }
  const hw = (t) => w * (1 - 0.72 * Math.pow(t, 0.8));
  const L = [], Rt = [];
  spine.forEach(([sx, sy], i) => {
    const t = i / n;
    const [nx, ny] = spine[Math.min(n, i + 1)], [qx, qy] = spine[Math.max(0, i - 1)];
    let dx = nx - qx, dy = ny - qy; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const ww = hw(t) * (1 + 0.9 * Math.max(0, 1 - t / 0.09)); // root flare gripping the rock
    L.push([sx + dy * ww, sy - dx * ww]);
    Rt.push([sx - dy * ww, sy + dx * ww]);
  });
  const trunk = smooth([...L, ...Rt.reverse()], true, 1 / 7);

  const brs = [], pads = [];
  for (let k = 0; k < branches; k++) {
    const t = 0.42 + 0.5 * (k / (branches - 1)) + (R() - 0.5) * 0.05;
    const i = Math.round(t * n);
    const [sx, sy] = spine[i];
    const side = k % 3 === 1 ? -1 : 1; // most branches stream downwind
    const len = (60 + 70 * R()) * (1.15 - t * 0.5) * (side < 0 ? 0.6 : 1) * reach;
    const ex = sx + side * len, ey = sy - len * (0.12 + 0.25 * R());
    const bw = hw(t) * 0.55;
    const cx = sx + side * len * 0.5, cy = sy - len * 0.02 + 6;
    brs.push(`M${f(sx)} ${f(sy - bw)}Q${f(cx)} ${f(cy - bw)} ${f(ex)} ${f(ey - 1.5)}L${f(ex)} ${f(ey + 1.5)}Q${f(cx)} ${f(cy + bw * 0.6)} ${f(sx)} ${f(sy + bw)}Z`);
    const r = lerp(padR[0], padR[1], R()) * (1.1 - t * 0.35);
    pads.push({ x: ex + side * r * 0.2, y: ey - r * 0.12, r });
  }
  const [tx, ty] = spine[n];
  pads.push({ x: tx + 6, y: ty + 4, r: padR[1] * 0.85 });
  const padShapes = pads.map((p, i) => ({
    ...p,
    d: blob({ seed: seed * 17 + i, cx: p.x, cy: p.y, r: p.r, ry: p.r * 0.4, lobes: 11, scallop: 0.24, wobble: 0.1 }),
    hi: blob({ seed: seed * 19 + i, cx: p.x + p.r * 0.12, cy: p.y - p.r * 0.14, r: p.r * 0.72, ry: p.r * 0.2, lobes: 9, scallop: 0.3, wobble: 0.12 }),
  })).sort((p, q) => q.y - p.y);

  // bark plates: short curved strokes across the trunk
  const bark = [];
  for (let i = 1; i < n * 0.7; i++) {
    const t = i / n, [sx, sy] = spine[i], ww = hw(t);
    if (R() < 0.35) continue;
    const o = (R() - 0.5) * ww;
    bark.push(`M${f(sx + o - ww * 0.35)} ${f(sy + R() * 6)}q${f(ww * 0.35)} 2 ${f(ww * 0.7)} 0`);
  }
  return { trunk, branches: brs, pads: padShapes, bark, spine };
}
