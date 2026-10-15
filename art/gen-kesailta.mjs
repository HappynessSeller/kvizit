// "Kesäilta" — raster scene built from a line-art PNG and its coloured version.
// The two images are close but not pixel-aligned, so instead of sampling colours we
// split the *line art* into enclosed regions, group them into named areas with rough
// polygons, and export one soft mask per area. In the game, painting an area reveals
// the coloured painting through that mask.
//
//   node art/gen-kesailta.mjs [--debug]
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const SRC_LINE = new URL('./scene_1.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const SRC_COLOUR = new URL('./scene_1_colored.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const OUT = new URL('../scenes/kesailta/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const DEBUG = process.argv.includes('--debug');
const MASK_SCALE = 2; // masks at half resolution
const LABEL_SCALE = 4; // hit-test map at quarter resolution

// Areas in priority order: a region belongs to the first area whose polygon holds it.
// Small regions go by their centre point; big open regions (sky, lake, meadow) are
// split pixel by pixel.
const AREAS = [
  ['sun', 'Aurinko', 'Sun', ['M955 240H1100V337H955Z']],
  ['flag', 'Suomen lippu', 'Finnish flag', ['M676 128L848 140L848 292L680 262Z']],
  ['pole', 'Lipputanko', 'Flagpole', ['M660 108H694V712H660Z']],
  ['saunaPier', 'Saunan laituri', 'Sauna jetty', ['M1170 448H1330V512H1170Z']],
  ['sauna', 'Rantasauna', 'Lakeside sauna', ['M1228 290H1428V463H1228Z']],
  ['rocks', 'Rantakivet', 'Shore rocks', ['M1112 418L1228 410L1228 488L1112 492Z', 'M1300 395H1448V508H1300Z']],
  ['chimney', 'Savupiippu', 'Chimney', ['M383 158H464V236H383Z']],
  ['windows', 'Ikkunat', 'Windows', ['M262 262H352V358H262Z', 'M198 392H292V492H198Z', 'M343 392H442V492H343Z', 'M512 398H598V492H512Z']],
  ['flowerbox', 'Kukkalaatikot', 'Flower boxes', ['M182 482H304V556H182Z', 'M332 482H452V560H332Z', 'M508 482H612V556H508Z']],
  ['roof', 'Katto', 'Roof', ['M300 176L392 186L660 360L672 388L494 388L300 202Z']],
  ['walls', 'Mökin seinät', 'Cottage walls', ['M208 302L300 204L496 376L496 612L208 612Z', 'M494 374L642 390L642 612L494 612Z']],
  ['stones', 'Kivijalka', 'Stone base', ['M222 590H505V652H222Z']],
  ['steps', 'Portaat', 'Steps', ['M588 488H742V668H588Z']],
  ['boat', 'Soutuvene', 'Rowboat', ['M1026 568H1212V692H1026Z']],
  ['jetty', 'Laituri', 'Jetty', ['M733 672L900 556L1030 560L1036 600L960 712L930 712L733 694Z']],
  ['ducks', 'Sorsat', 'Ducks', ['M1250 600H1348V672H1250Z', 'M1356 638H1428V694H1356Z']],
  ['leaves', 'Koivun lehdet', 'Birch leaves', ['M0 0H592V128L420 122L350 162L292 192L228 192L200 132L0 178Z']],
  ['forest', 'Kuusimetsä', 'Spruce forest', ['M540 212H1448V298H1228V412H540Z']],
  ['lake', 'Järvi', 'Lake', ['M640 380H1448V706L1100 704L1000 726L900 706L800 692L700 652L640 560Z']],
  ['bushes', 'Pensaat', 'Bushes', ['M150 552H232V668H150Z', 'M496 572H700V700H496Z', 'M688 552H812V652H688Z']],
  ['birches', 'Koivut', 'Birches', ['M0 100H238L218 250L192 560L152 1000L0 1000Z']],
  ['lupinesL', 'Lupiinit', 'Lupines', ['M0 680H245V1086H0Z']],
  ['flowersL', 'Kukkaniitty', 'Flower meadow', ['M245 765H665V1086H245Z']],
  ['lupinesR', 'Lupiinit rannalla', 'Lupines by the shore', ['M1150 715H1448V1086H1150Z']],
  ['flowersR', 'Päivänkakkarat', 'Daisies', ['M930 815H1150V1086H930Z']],
  ['path', 'Hiekkapolku', 'Sandy path', ['M720 690L860 700L1000 820L1040 900L960 1000L990 1086L640 1086L760 950L800 830L740 750Z']],
  ['meadow', 'Nurmikko', 'Lawn', ['M0 560H1448V1086H0Z']],
  ['sky', 'Taivas', 'Sky', ['M0 0H1448V600H0Z']],
];

// --- tiny polygon parser for "M x y H x V y L x y Z" paths ---
function parsePoly(d) {
  const t = d.match(/[MLHVZ]|-?\d+(\.\d+)?/g);
  const pts = [];
  let i = 0, x = 0, y = 0, cmd = '';
  while (i < t.length) {
    if (/[MLHVZ]/.test(t[i])) cmd = t[i++];
    if (cmd === 'Z') continue;
    if (cmd === 'H') x = +t[i++];
    else if (cmd === 'V') y = +t[i++];
    else { x = +t[i++]; y = +t[i++]; }
    pts.push([x, y]);
  }
  return pts;
}
function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const polys = AREAS.map(([, , , ds]) => ds.map(parsePoly));
// big open regions (sky, water, grass) may only be split between these areas
const OPEN = new Set(['sky', 'lake', 'meadow', 'path', 'flowersL', 'flowersR', 'lupinesL', 'lupinesR', 'birches', 'leaves', 'jetty']);
const areaAt = (x, y, openOnly = false) => {
  for (let a = 0; a < polys.length; a++) {
    if (openOnly && !OPEN.has(AREAS[a][0])) continue;
    if (polys[a].some((p) => inPoly(p, x, y))) return a;
  }
  return polys.length - 1;
};

// --- load line art ---
const { data, info } = await sharp(SRC_LINE).grayscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
const isLine = new Uint8Array(N);
for (let i = 0; i < N; i++) isLine[i] = data[i] < 140 ? 1 : 0;

// --- connected components of non-line pixels (4-connected) ---
const comp = new Int32Array(N).fill(-1);
const comps = [];
const stack = new Int32Array(N);
for (let s = 0; s < N; s++) {
  if (isLine[s] || comp[s] !== -1) continue;
  const id = comps.length;
  let sp = 0, n = 0, sx = 0, sy = 0;
  stack[sp++] = s;
  comp[s] = id;
  while (sp) {
    const p = stack[--sp];
    const x = p % W, y = (p / W) | 0;
    n++; sx += x; sy += y;
    if (x > 0 && !isLine[p - 1] && comp[p - 1] === -1) { comp[p - 1] = id; stack[sp++] = p - 1; }
    if (x < W - 1 && !isLine[p + 1] && comp[p + 1] === -1) { comp[p + 1] = id; stack[sp++] = p + 1; }
    if (y > 0 && !isLine[p - W] && comp[p - W] === -1) { comp[p - W] = id; stack[sp++] = p - W; }
    if (y < H - 1 && !isLine[p + W] && comp[p + W] === -1) { comp[p + W] = id; stack[sp++] = p + W; }
  }
  comps.push({ n, cx: sx / n, cy: sy / n });
}
const BIG = 30000;
const compArea = comps.map((c) => (c.n < BIG ? areaAt(c.cx, c.cy) : -1));

// --- label every pixel; line pixels take the nearest region's label (BFS) ---
const label = new Int16Array(N).fill(-1);
const queue = new Int32Array(N);
let qh = 0, qt = 0;
for (let p = 0; p < N; p++) {
  if (isLine[p]) continue;
  const c = comp[p];
  label[p] = compArea[c] >= 0 ? compArea[c] : areaAt(p % W, (p / W) | 0, true);
  queue[qt++] = p;
}
while (qh < qt) {
  const p = queue[qh++];
  const x = p % W, y = (p / W) | 0, l = label[p];
  for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
    if (q >= 0 && label[q] === -1) { label[q] = l; queue[qt++] = q; }
  }
}

mkdirSync(OUT + 'm', { recursive: true });

// --- per-area cropped soft masks (half resolution) ---
const mw = Math.ceil(W / MASK_SCALE), mh = Math.ceil(H / MASK_SCALE);
const areasOut = [];
for (let a = 0; a < AREAS.length; a++) {
  const small = new Uint8Array(mw * mh);
  let x0 = mw, y0 = mh, x1 = -1, y1 = -1;
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    let hits = 0, tot = 0;
    for (let dy = 0; dy < MASK_SCALE; dy++) for (let dx = 0; dx < MASK_SCALE; dx++) {
      const X = x * MASK_SCALE + dx, Y = y * MASK_SCALE + dy;
      if (X >= W || Y >= H) continue;
      tot++;
      if (label[Y * W + X] === a) hits++;
    }
    const v = tot ? Math.round((hits / tot) * 255) : 0;
    small[y * mw + x] = v;
    if (v) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  }
  const [key, fi, en] = AREAS[a];
  if (x1 < 0) { console.warn(`area ${key} is empty — skipped`); continue; }
  const pad = 3;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(mw - 1, x1 + pad); y1 = Math.min(mh - 1, y1 + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const crop = Buffer.alloc(cw * ch);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) crop[y * cw + x] = small[(y + y0) * mw + x + x0];
  await sharp(crop, { raw: { width: cw, height: ch, channels: 1 } }).blur(0.8).png({ compressionLevel: 9, palette: false }).toFile(`${OUT}m/${key}.png`);
  areasOut.push({ key, fi, en, idx: a, mask: `m/${key}.png`, x: x0 * MASK_SCALE, y: y0 * MASK_SCALE, w: cw * MASK_SCALE, h: ch * MASK_SCALE });
}

// --- quarter-res label map for tapping ---
const lw = Math.ceil(W / LABEL_SCALE), lh = Math.ceil(H / LABEL_SCALE);
const lab = Buffer.alloc(lw * lh);
const keyIdx = new Map(areasOut.map((o, i) => [o.idx, i]));
for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
  const l = label[Math.min(H - 1, y * LABEL_SCALE + 2) * W + Math.min(W - 1, x * LABEL_SCALE + 2)];
  lab[y * lw + x] = keyIdx.has(l) ? (keyIdx.get(l) + 1) * 8 : 0;
}
await sharp(lab, { raw: { width: lw, height: lh, channels: 1 } }).png({ compressionLevel: 9 }).toFile(OUT + 'labels.png');

const manifest = {
  id: 'kesailta', type: 'raster', w: W, h: H,
  line: 'line.webp', colour: 'colour.webp', labels: 'labels.png', labelScale: LABEL_SCALE, labelStep: 8,
  areas: areasOut.map(({ idx, ...o }) => o),
};
writeFileSync(OUT + 'scene.json', JSON.stringify(manifest, null, 1));

// web images
await sharp(SRC_LINE).grayscale().webp({ quality: 78 }).toFile(OUT + 'line.webp');
await sharp(SRC_COLOUR).resize(W, H, { fit: 'fill' }).webp({ quality: 80 }).toFile(OUT + 'colour.webp');
await sharp(SRC_COLOUR).resize(480).webp({ quality: 75 }).toFile(OUT + 'thumb.webp');

if (DEBUG) {
  const pal = AREAS.map((_, i) => [(i * 97) % 255, (i * 57 + 80) % 255, (i * 151 + 40) % 255]);
  const rgb = Buffer.alloc(N * 3);
  for (let p = 0; p < N; p++) {
    const c = pal[label[p]] || [255, 0, 0];
    const k = isLine[p] ? 0.25 : 1;
    rgb[p * 3] = c[0] * k; rgb[p * 3 + 1] = c[1] * k; rgb[p * 3 + 2] = c[2] * k;
  }
  const svgLabels = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${areasOut.map((o) =>
    `<text x="${o.x + o.w / 2}" y="${o.y + o.h / 2}" font-size="26" font-family="sans-serif" font-weight="bold" fill="#fff" stroke="#000" stroke-width="1" text-anchor="middle">${o.key}</text>`).join('')}</svg>`);
  await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: svgLabels }]).png().toFile(new URL('./kesailta-debug.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
}
console.log(`kesailta: ${areasOut.length} areas, ${comps.length} regions`);
