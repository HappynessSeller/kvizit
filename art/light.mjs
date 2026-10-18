// Lighting kit shared by the vector scenes. One light direction per picture drives every
// rim highlight, shadow and cast shadow, so the whole scene is lit consistently (see art/PHILOSOPHY.md).
import { smooth, noise1, clumped, blob, mix, rng, waterLines } from './organic.mjs';

const PLANE = { far: 0.9, mid: 1.6, near: 2.6 };

/**
 * @param S       scene api from createScene
 * @param prefix  id prefix for defs (unique per scene)
 * @param light   vector pointing towards the light, e.g. [0.78, -0.62] = upper right
 */
export function lightKit(S, prefix, { light = [0.78, -0.62], ink = '#2b1d3a' } = {}) {
  const { add, f } = S;
  const [lx, ly] = light;
  S.def(`<filter id="${prefix}-soft3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="${prefix}-soft8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>`);
  let n = 0;
  const uid = (k) => `${prefix}-${k}${n++}`;

  /** outline in a darker shade of the fill */
  const edge = (hex, k = 0.55) => mix(hex, ink, k);
  /** stroke attrs; `w` is a width or a depth plane: 'far' | 'mid' | 'near' */
  const st = (hex, w = 1.6) => `stroke="${edge(hex)}" stroke-width="${PLANE[w] ?? w}" stroke-linejoin="round" stroke-linecap="round"`;

  // the shape minus itself shifted by (dx, dy): a crescent along one side of the form
  const crescent = (d, colour, dx, dy, op = 1, soft = 0) => {
    const id = uid('m');
    const blur = soft ? ` filter="url(#${prefix}-soft${soft})"` : '';
    S.def(`<mask id="${id}" maskUnits="userSpaceOnUse" x="-300" y="-300" width="1400" height="1200"><path d="${d}" fill="#fff"/><path d="${d}" fill="#000" transform="translate(${f(dx)} ${f(dy)})"${blur}/></mask>`);
    add(`<path d="${d}" fill="${colour}" opacity="${op}" mask="url(#${id})"/>`);
  };
  /** sunlit edge facing the light */
  const rim = (d, colour = '#ffd59a', k = 3, op = 0.9) => crescent(d, colour, -lx * k * 1.15, -ly * k * 1.15, op);
  /** shadowed body turned away from the light (soft terminator) */
  const shadow = (d, colour = '#3b2f5c', k = 12, op = 0.4) => crescent(d, colour, lx * k * 1.2, ly * k * 1.2, op, k > 14 ? 8 : 3);

  /**
   * Grounding for anything that stands: a dark contact shadow plus a long soft shadow thrown away
   * from the light (longer when the sun is low).
   */
  const ground = (x, y, w, { h = w, colour = '#2b1d3a', op = 0.3 } = {}) => {
    const len = h * Math.max(0.15, 1 - Math.abs(ly)) * 1.6;
    const sx = x - Math.sign(lx || 1) * len * 0.5;
    add(`<ellipse cx="${f(sx)}" cy="${f(y + 1)}" rx="${f(w * 0.5 + len * 0.5)}" ry="${f(Math.max(2.5, w * 0.1))}" fill="${colour}" opacity="${f(op * 0.8)}" filter="url(#${prefix}-soft3)"/>`);
    add(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w * 0.45)}" ry="${f(Math.max(1.6, w * 0.05))}" fill="${colour}" opacity="${f(op * 1.3)}"/>`);
  };
  /** legacy: a shape squashed onto the ground */
  const cast = (d, { x, y, sx = 1, sy = 0.25, skew = 0, colour = '#2b1d3a', op = 0.22 }) =>
    add(`<path d="${d}" fill="${colour}" opacity="${op}" transform="translate(${x} ${y}) skewX(${skew}) scale(${sx} ${sy}) translate(${-x} ${-y})" filter="url(#${prefix}-soft3)"/>`);

  /** a tapering wisp of smoke that drifts with the wind and fades out */
  const smoke = (x, y, { h = 70, w = 7, lean = 22, colour = '#ffffff', op = 0.75, seed = 1 } = {}) => {
    const id = uid('sm');
    S.def(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y)}" x2="0" y2="${f(y - h)}"><stop offset="0" stop-color="${colour}" stop-opacity="${op}"/><stop offset=".6" stop-color="${colour}" stop-opacity="${f(op * 0.45)}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></linearGradient>`);
    const N = noise1(seed);
    const L = [], R = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const cx = x + lean * Math.pow(t, 1.4) + N(t * 3, 2) * w * 0.8;
      const cy = y - h * t;
      const ww = w * (0.3 + 1.4 * t) * (1 + 0.2 * Math.sin(t * 9 + seed));
      L.push([cx - ww, cy]); R.push([cx + ww, cy]);
    }
    add(`<g data-anim="sway-slow"><path d="${smooth([...L, ...R.reverse()], true)}" fill="url(#${id})"/></g>`);
  };

  /** union clip of several paths (keeps leaf confetti inside a crown) */
  const clipUnion = (ds) => {
    const id = uid('cu');
    S.def(`<clipPath id="${id}">${ds.map((d) => `<path d="${d}"/>`).join('')}</clipPath>`);
    return id;
  };

  /**
   * Foliage clusters: a dark under-layer offset down behind every blob, then the blobs with a
   * shadowed underside and a lit rim, then optional leaf texture clipped inside the crown.
   */
  const foliage = (blobs, { fill, base, dark, rimColour, scatter = '', underK = 0.28 }) => {
    for (const b of blobs) add(`<path d="${b.d}" fill="${dark}" transform="translate(${f(-lx * b.r * 0.12)} ${f(b.r * underK)})"/>`);
    for (const b of blobs) {
      S.R(b.d, fill, st(base, 1.8));
      shadow(b.d, dark, b.r * 0.55, 0.45);
      rim(b.d, rimColour, 2.2, 0.85);
    }
    if (scatter) add(`<g clip-path="url(#${clipUnion(blobs.map((b) => b.d))})">${scatter}</g>`);
  };

  /** mottled clumps of colour over a ground plane */
  const mottle = ({ seed, n = 30, x0 = 0, x1 = 800, y0, y1, accept = () => true, colours, size = [18, 46], op = 0.3 }) => {
    const Rn = rng(seed);
    for (const [x, y, u] of clumped({ seed, n, x0, x1, y0, y1, threshold: 0, scale: 0.012, accept })) {
      const t = (y - y0) / (y1 - y0), r = (size[0] + (size[1] - size[0]) * Rn()) * (0.6 + t * 0.8);
      add(`<path d="${blob({ seed: Math.floor(u * 1e6), cx: x, cy: y, r, ry: r * 0.3, lobes: 9, scallop: 0.25, wobble: 0.12, n: 48 })}" fill="${colours[Math.floor(u * 97) % colours.length]}" opacity="${op}"/>`);
    }
  };

  /** water surface lines: arcs that grow with depth, light crests and dark troughs */
  const water = (opts, { lit = '#ffffff', dark = null, anim = true } = {}) => {
    for (const { d, w, o } of waterLines(opts)) add(`<path d="${d}" fill="none" stroke="${lit}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"${anim ? ' data-anim="shimmer"' : ''}/>`);
    if (dark) for (const { d, w, o } of waterLines({ ...opts, seed: opts.seed + 50, gate: (opts.gate ?? 0.15) + 0.1 })) add(`<path d="${d}" fill="none" stroke="${dark}" stroke-opacity="${o * 0.6}" stroke-width="${w * 1.2}" stroke-linecap="round"/>`);
  };

  // wavy reflection: content (a <g> in defs) mirrored about the waterline, cut into strips and
  // fading out with depth
  const reflection = (content, axis, { depth = 70, amp = 3, seed = 1, opacity = 0.5, x0 = 0, x1 = 800 } = {}) => {
    const id = uid('r');
    S.def(`<g id="${id}">${content}</g>
  <linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="${axis}" x2="0" y2="${axis + depth}"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="${id}m" maskUnits="userSpaceOnUse" x="${x0}" y="${axis}" width="${x1 - x0}" height="${depth}"><rect x="${x0}" y="${axis}" width="${x1 - x0}" height="${depth}" fill="url(#${id}f)"/></mask>`);
    const N = noise1(seed);
    add(`<g opacity="${opacity}" mask="url(#${id}m)">`);
    for (let y = axis, k = 0; y < axis + depth; k++) {
      const t = (y - axis) / depth, h = 2.6 + t * 6;
      S.def(`<clipPath id="${id}c${k}"><rect x="${x0}" y="${f(y)}" width="${x1 - x0}" height="${f(h + 0.4)}"/></clipPath>`);
      const dx = N(y * 0.21, 2) * amp * (0.4 + t * 1.6);
      add(`<g clip-path="url(#${id}c${k})"><use href="#${id}" transform="translate(${f(dx)} ${2 * axis}) scale(1 -1)"/></g>`);
      y += h;
    }
    add('</g>');
  };

  /** stepped ledges along a ridge: shadow under each joint, lit lip above */
  const ledges = (pts, list, { lit = '#ffd2a8', dark = '#3b2a55' } = {}) => {
    for (const [o, xa, xb] of list) {
      const seg = pts.filter(([x]) => x >= xa && x <= xb);
      if (seg.length < 3) continue;
      const at = (dy) => smooth(seg.map(([x, y]) => [x, y + o + dy]));
      add(`<path d="${at(4)}" fill="none" stroke="${dark}" stroke-opacity=".26" stroke-width="7" stroke-linecap="round"/>`);
      add(`<path d="${at(-1.5)}" fill="none" stroke="${lit}" stroke-opacity=".5" stroke-width="1.8" stroke-linecap="round"/>`);
      S.ink(`<path d="${at(0)}" fill="none" stroke="${ink}" stroke-opacity=".3" stroke-width="1.4" stroke-linecap="round"/>`);
    }
  };

  /** clumped lichen / moss speckles */
  const lichen = (seed, count, x0, x1, y0, y1, accept, colours = ['#e0954a', '#a9b48a', '#d9c8b8'], op = 0.45) => {
    for (const [x, y, u] of clumped({ seed, n: count, x0, x1, y0, y1, threshold: 0.12, scale: 0.03, accept })) {
      const c = colours[u < 0.5 ? 0 : u < 0.8 ? 1 : 2];
      add(`<path d="${blob({ seed: Math.floor(u * 1e6), cx: x, cy: y, r: 1.5 + u * 3, ry: 1 + u * 1.5, lobes: 6, scallop: 0.3, wobble: 0.15, n: 24 })}" fill="${c}" opacity="${op}"/>`);
    }
  };

  return { edge, st, crescent, rim, shadow, ground, cast, smoke, clipUnion, foliage, mottle, water, reflection, ledges, lichen };
}
