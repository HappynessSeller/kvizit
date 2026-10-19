// Shared helpers for scene generators.
// A scene is an 800x600 SVG made of top-level <g data-group> "areas". The game shows
// every area as blank line art first; spending a paint drop on an area reveals it.
//   - elements with data-region  -> paintable shapes (cream fill + ink outline in line art)
//   - elements with data-ink     -> kept as ink lines in line art (e.g. bark marks, birds)
//   - everything else            -> hidden until the area is painted
//   - data-anim on any element   -> idle animation that starts once the area is painted
import { variant } from './organic.mjs';

export const INK = '#3b2f4a';

/**
 * Ground-plane perspective for props. A thing standing on the ground at screen height y shrinks
 * linearly to nothing at the horizon HY. Calibrate once with a known object (e.g. a 2 m door that is
 * doorPx tall standing at doorY) and size every prop from real-world metres:
 *   const P = perspective(HY, { y: 420, px: 48, m: 2 });  P.px(y, 0.45) → height of a 45 cm fox at y
 * Small creatures may be exaggerated a little for a picture book, but by the same factor everywhere.
 */
export function perspective(HY, ref) {
  const k = ref.px / ref.m / (ref.y - HY); // px per metre per px below the horizon
  return {
    s: (y) => Math.max(0.02, (y - HY) / (ref.y - HY)),
    px: (y, metres) => metres * k * Math.max(0.5, y - HY),
  };
}

export function createScene({ id, title, titleEn, seed = 7 }) {
  let s = seed + variant() * 7919;
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
    seed: (n) => { s = n + variant() * 7919; },
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
    /** the finished SVG text */
    build() {
      if (strayCount) throw new Error(`${strayCount} elements outside any group`);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" data-scene="${id}" data-title="${title}" data-title-en="${titleEn}">
<defs>
${defs.join('\n')}
</defs>
${out.join('\n')}
</svg>
`;
      api.stats = `${groups.length} areas, ${regionId} regions, ${(svg.length / 1024).toFixed(1)} KB`;
      return svg;
    },
  };
  return api;
}
