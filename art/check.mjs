// Build-time sanity checks for the vector scenes, run by build.mjs on several variants.
//   holes:   every pixel of the painted picture must be covered (no see-through gaps between layers)
//   regions: in the line art (the page a child colours), every area must be big enough to tap and
//            no outlined region may shrink to confetti
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');

const SKIP = ['mask', 'clipPath', 'linearGradient', 'radialGradient', 'filter', 'pattern'];
const SHAPES = ['path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line', 'use'];

/** transparent pixels in the painted picture at 800×600: { n, bbox } */
export async function holes(svg) {
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] < 250) { n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  return { n, bbox: n ? [x0, y0, x1, y1] : null };
}

/**
 * Visible px² of every region and every area in the line art (regions stacked in document order, as
 * the game draws them; non-region shapes are hidden there). Returns { regions: [{ group, area }], groups: { key: area } }.
 */
export async function regionAreas(svg) {
  const i = svg.indexOf('</defs>') + 7;
  const head = svg.slice(0, i).replace('<svg ', '<svg shape-rendering="crispEdges" ');
  let skip = 0, group = '';
  const info = [];
  const body = svg.slice(i).replace(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g, (m, close, tag, at, self) => {
    if (SKIP.includes(tag)) { if (close) skip--; else if (!self) skip++; return m; }
    if (skip > 0) return m;
    if (tag === 'g' && !close) {
      const g = at.match(/data-group="([^"]+)"/);
      if (g) group = g[1];
      return '<g' + at.replace(/\s(opacity|filter|style|mask|clip-path)="[^"]*"/g, '') + self + '>';
    }
    if (close || !SHAPES.includes(tag)) return m;
    const r = at.match(/data-region="(\d+)"/);
    if (!r) return self ? '' : m;
    const id = +r[1] + 1;
    info[id] = group;
    at = at.replace(/\s(fill|stroke|stroke-width|stroke-opacity|opacity|filter|style|stroke-linejoin|mask|clip-path)="[^"]*"/g, '');
    return `<${tag}${at} fill="rgb(${id >> 16 & 255},${id >> 8 & 255},${id & 255})" stroke="none"${self}>`;
  });
  const { data } = await sharp(Buffer.from(head + body), { density: 72 }).raw().toBuffer({ resolveWithObject: true });
  const cnt = new Map();
  for (let p = 0; p < data.length; p += 3) { const id = data[p] << 16 | data[p + 1] << 8 | data[p + 2]; cnt.set(id, (cnt.get(id) || 0) + 1); }
  const regions = [], groups = {};
  for (let id = 1; id < info.length; id++) {
    if (info[id] === undefined) continue;
    const area = cnt.get(id) || 0;
    regions.push({ group: info[id], area });
    groups[info[id]] = (groups[info[id]] || 0) + area;
  }
  return { regions, groups };
}

/** run every check on one SVG; returns a list of problems (empty = fine) */
export async function checkScene(svg, { minArea = 150, minRegion = 8 } = {}) {
  const out = [];
  const h = await holes(svg);
  if (h.n) out.push(`${h.n} transparent px in ${h.bbox.join(',')}`);
  const { regions, groups } = await regionAreas(svg);
  for (const [g, a] of Object.entries(groups)) if (a < minArea) out.push(`area ${g} is only ${a}px² in the line art`);
  const tiny = {};
  // a region hidden completely is harmless; one that peeks out as a speck is clutter on the page
  for (const r of regions) if (r.area > 0 && r.area < minRegion) (tiny[r.group] ||= []).push(r.area);
  for (const [g, as] of Object.entries(tiny)) out.push(`area ${g} has ${as.length} confetti region(s) (${as.join(',')}px²)`);
  return out;
}
