// Shared helpers for scene generators.
// A scene is an 800x600 SVG made of top-level <g data-group> "areas". The game shows
// every area as blank line art first; spending a paint drop on an area reveals it.
//   - elements with data-region  -> paintable shapes (cream fill + ink outline in line art)
//   - elements with data-ink     -> kept as ink lines in line art (e.g. bark marks, birds)
//   - everything else            -> hidden until the area is painted
//   - data-anim on any element   -> idle animation that starts once the area is painted
import { writeFileSync, mkdirSync } from 'node:fs';

export const INK = '#3b2f4a';

export function createScene({ id, title, titleEn, seed = 7 }) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out = [];
  const defs = [];
  let regionId = 0;
  let inGroup = null;
  const groups = [];
  let strayCount = 0;

  const attrs = (o = {}) =>
    Object.entries(o).map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${v}"`)).join('');

  const api = {
    INK,
    rnd,
    r: (a, b) => a + rnd() * (b - a),
    f: (n) => Math.round(n * 10) / 10,
    pick: (arr) => arr[Math.floor(rnd() * arr.length)],
    seed: (n) => { s = n; },
    def: (str) => defs.push(str),
    add: (str) => {
      if (!inGroup) strayCount++;
      out.push(str);
    },
    /** paintable path */
    R(d, fill, extra = '') {
      api.add(`<path d="${d}" fill="${fill}" data-region="${regionId++}" ${extra}/>`);
    },
    /** paintable arbitrary element: tag + attribute string */
    RE(tag, attr, fill, extra = '') {
      api.add(`<${tag} ${attr} fill="${fill}" data-region="${regionId++}" ${extra}/>`);
    },
    /** paintable circle / ellipse helpers */
    C(cx, cy, rr, fill, extra = '') {
      api.RE('circle', `cx="${api.f(cx)}" cy="${api.f(cy)}" r="${api.f(rr)}"`, fill, extra);
    },
    E(cx, cy, rx, ry, fill, extra = '') {
      api.RE('ellipse', `cx="${api.f(cx)}" cy="${api.f(cy)}" rx="${api.f(rx)}" ry="${api.f(ry)}"`, fill, extra);
    },
    /** line work that stays visible in the line art */
    ink(str) {
      api.add(str.replace(/^<(\w+)/, '<$1 data-ink="1"'));
    },
    /** an area of the picture */
    group(key, fi, en, fn, opts = {}) {
      if (inGroup) throw new Error(`nested group ${key} in ${inGroup}`);
      if (groups.some((g) => g.key === key)) throw new Error(`duplicate group ${key}`);
      inGroup = key;
      const before = regionId;
      out.push(`<g data-group="${key}" data-fi="${fi}" data-en="${en}"${attrs(opts.attrs)}>`);
      fn();
      out.push('</g>');
      inGroup = null;
      if (regionId === before) throw new Error(`group ${key} has no paintable region`);
      groups.push({ key, fi, en });
    },
    build(path) {
      if (strayCount) throw new Error(`${strayCount} elements outside any group`);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" data-scene="${id}" data-title="${title}" data-title-en="${titleEn}">
<defs>
${defs.join('\n')}
</defs>
${out.join('\n')}
</svg>
`;
      mkdirSync(new URL('../scenes/', import.meta.url), { recursive: true });
      writeFileSync(new URL(`../scenes/${path}`, import.meta.url), svg);
      console.log(`${id}: ${groups.length} areas, ${regionId} regions, ${(svg.length / 1024).toFixed(1)} KB`);
      return svg;
    },
  };
  return api;
}

/** cloud-ish blob path (used by several scenes) */
export function cloudPath(x, y, s) {
  return `M${x} ${y}c${-30 * s} 0 ${-34 * s} ${-26 * s} ${-8 * s} ${-30 * s}` +
    `c${4 * s} ${-22 * s} ${40 * s} ${-26 * s} ${52 * s} ${-8 * s}` +
    `c${14 * s} ${-18 * s} ${48 * s} ${-10 * s} ${46 * s} ${12 * s}` +
    `c${24 * s} ${-2 * s} ${30 * s} ${26 * s} ${6 * s} ${26 * s}Z`;
}

/** circle as a path (so it can be a region via R) */
export const circ = (cx, cy, rr) =>
  `M${cx} ${cy - rr}a${rr} ${rr} 0 1 1 0 ${rr * 2}a${rr} ${rr} 0 1 1 0 ${-rr * 2}Z`;

/** layered spruce silhouette along a baseline */
export function spruceLine(api, y0, minH, maxH, step, mirror = false) {
  const { r, f } = api;
  let d = `M0 ${y0}`;
  let x = 0;
  while (x < 800) {
    const h = r(minH, maxH);
    const w = step * r(0.7, 1.2);
    const tip = mirror ? y0 + h : y0 - h;
    const yA = mirror ? y0 + h * 0.35 : y0 - h * 0.35, yB = mirror ? y0 + h * 0.68 : y0 - h * 0.68;
    d += `L${f(x + w * 0.1)} ${f(yA)}L${f(x + w * 0.22)} ${f(yA)}L${f(x + w * 0.3)} ${f(yB)}L${f(x + w * 0.38)} ${f(yB)}` +
      `L${f(x + w * 0.5)} ${f(tip)}` +
      `L${f(x + w * 0.62)} ${f(yB)}L${f(x + w * 0.7)} ${f(yB)}L${f(x + w * 0.78)} ${f(yA)}L${f(x + w * 0.9)} ${f(yA)}L${f(x + w)} ${y0}`;
    x += w;
  }
  return d + `L800 ${y0}Z`;
}

/** a single stylised spruce (tiers) with base at (x,y) */
export function sprucePath(x, y, h, w) {
  const tiers = 4;
  const crown = h * 0.9;
  const pts = [];
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers;
    pts.push([w * (0.3 + 0.7 * t) / 2, y - h + crown * t]);
  }
  const R = (n) => Math.round(n * 10) / 10;
  let d = `M${R(x)} ${R(y - h)}`;
  pts.forEach(([hw, yy], i) => {
    d += `L${R(x + hw)} ${R(yy)}`;
    if (i < tiers - 1) d += `L${R(x + hw * 0.45)} ${R(yy - 2)}`;
  });
  const tw = Math.max(3, w * 0.07);
  d += `L${R(x + tw)} ${R(y - h + crown)}L${R(x + tw)} ${R(y)}L${R(x - tw)} ${R(y)}L${R(x - tw)} ${R(y - h + crown)}`;
  [...pts].reverse().forEach(([hw, yy], i) => {
    if (i > 0) d += `L${R(x - hw * 0.45)} ${R(yy - 2)}`;
    d += `L${R(x - hw)} ${R(yy)}`;
  });
  return d + 'Z';
}
