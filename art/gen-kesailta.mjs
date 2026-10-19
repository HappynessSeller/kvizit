// "Kesäilta" — raster scene built from a line-art PNG and its coloured version.
// The two images are close but not pixel-aligned, so instead of sampling colours we
// split the *line art* into enclosed regions, group them into named areas with rough
// polygons, and export one soft mask per area. In the game, painting an area reveals
// the coloured painting through that mask.
//
//   node art/gen-kesailta.mjs [--debug [--polys]]
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const SRC_LINE = new URL('./scene_1.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const SRC_COLOUR = new URL('./scene_1_colored.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const OUT = new URL('../scenes/kesailta/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const DEBUG = process.argv.includes('--debug');
const DEBUG_POLYS = process.argv.includes('--polys'); // with --debug: draw the AREAS polygons too
const MASK_SCALE = 2; // masks at half resolution
const LABEL_SCALE = 4; // hit-test map at quarter resolution

// Areas in priority order: where polygons overlap, the earlier area wins.
// Small regions go to the area covering most of their pixels. Big open regions (sky,
// lake, meadow) are split along the polygons, but the seams snap to the nearest drawn
// strokes: `seam` (default 40 px) is how far from its polygon edge an area may be pulled.
const AREAS = [
  ['sun', 'Aurinko', 'Sun', ['M955 240H1100V337H955Z']],
  ['flag', 'Suomen lippu', 'Finnish flag', ['M676 128L848 140L848 292L680 262Z']],
  ['pole', 'Lipputanko', 'Flagpole', ['M662 112H692V712H662Z']],
  ['saunaPier', 'Saunan laituri', 'Sauna jetty', ['M1170 448H1330V512H1170Z']],
  ['sauna', 'Rantasauna', 'Lakeside sauna', ['M1225 380L1290 296L1345 296L1430 378L1425 462L1230 462Z']],
  ['rocks', 'Rantakivet', 'Shore rocks', ['M1112 418L1228 410L1228 488L1112 492Z', 'M1300 395H1448V508H1300Z']],
  ['chimney', 'Savupiippu', 'Chimney', ['M383 158H464V236H383Z']],
  ['windows', 'Ikkunat', 'Windows', ['M262 262H352V358H262Z', 'M198 392H292V492H198Z', 'M343 392H442V492H343Z', 'M512 398H598V492H512Z']],
  ['flowerbox', 'Kukkalaatikot', 'Flower boxes', ['M195 484H302V552H195Z', 'M336 484H448V556H336Z', 'M510 484H608V552H510Z']],
  ['roof', 'Katto', 'Roof', ['M300 176L392 186L660 360L672 388L494 388L300 202Z']],
  ['walls', 'Mökin seinät', 'Cottage walls', ['M185 330L300 204L496 376L496 612L185 612Z', 'M494 374L642 390L642 612L494 612Z']],
  ['stones', 'Kivijalka', 'Stone base', ['M222 590H505V652H222Z']],
  ['steps', 'Portaat', 'Steps', ['M588 488H742V668H588Z']],
  ['boat', 'Soutuvene', 'Rowboat', ['M1026 568H1212V692H1026Z']],
  ['jetty', 'Laituri', 'Jetty', ['M733 672L900 556L1030 560L1036 600L960 712L930 712L733 694Z']],
  ['ducks', 'Sorsat', 'Ducks', ['M1250 600H1348V672H1250Z', 'M1356 638H1428V694H1356Z']],
  ['bushes', 'Pensaat', 'Bushes', ['M150 560L235 555L305 600L305 660L250 695L150 695Z', 'M496 600L560 580L640 600L690 660L680 692L500 692Z', 'M700 588L760 574L822 606L822 650L700 655Z'], { seam: 20 }],
  ['leaves', 'Koivun lehdet', 'Birch leaves', ['M0 0H592V128L420 122L350 162L292 192L228 192L200 132L0 178Z']],
  ['forest', 'Kuusimetsä', 'Spruce forest', ['M540 212H1448V470H1180V412H540Z']],
  ['lake', 'Järvi', 'Lake', ['M640 380H1448V745L1150 740L1100 704L1000 726L900 706L800 692L700 652L640 560Z']],
  ['birches', 'Koivut', 'Birches', ['M0 0H205L238 140L218 250L192 560L180 690L0 690Z'], { seam: 30 }],
  ['lupinesL', 'Lupiinit', 'Lupines', ['M0 680H245V1086H0Z']],
  ['flowersL', 'Kukkaniitty', 'Flower meadow', ['M245 760L320 728L385 740L400 790L450 760L505 760L520 825L575 825L610 885L650 890L680 960L640 1086L245 1086Z']],
  ['lupinesR', 'Lupiinit rannalla', 'Lupines by the shore', ['M1150 745H1448V1086H1150Z']],
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
const OPEN = new Set(['sky', 'lake', 'meadow', 'path', 'flowersL', 'flowersR', 'lupinesL', 'lupinesR', 'birches', 'bushes', 'jetty']);
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
// --- rasterise the polygons once: full priority order, and open areas only ---
const polyAll = new Int16Array(N), polyOpen = new Int16Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  polyAll[y * W + x] = areaAt(x + 0.5, y + 0.5);
  polyOpen[y * W + x] = areaAt(x + 0.5, y + 0.5, true);
}

// small regions go to the area that covers most of their pixels
const BIG = 30000;
const votes = comps.map(() => new Map());
for (let p = 0; p < N; p++) {
  const c = comp[p];
  if (c < 0 || comps[c].n >= BIG) continue;
  const m = votes[c];
  m.set(polyAll[p], (m.get(polyAll[p]) || 0) + 1);
}
const compArea = comps.map((c, i) => (c.n < BIG ? [...votes[i]].sort((a, b) => b[1] - a[1])[0][0] : -1));

// distance to the nearest line pixel (chamfer 3-4, ~3 per pixel)
const dist = new Int32Array(N);
for (let p = 0; p < N; p++) dist[p] = isLine[p] ? 0 : 1 << 20;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = y * W + x;
  let d = dist[p];
  if (x > 0) d = Math.min(d, dist[p - 1] + 3);
  if (y > 0) {
    d = Math.min(d, dist[p - W] + 3);
    if (x > 0) d = Math.min(d, dist[p - W - 1] + 4);
    if (x < W - 1) d = Math.min(d, dist[p - W + 1] + 4);
  }
  dist[p] = d;
}
for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
  const p = y * W + x;
  let d = dist[p];
  if (x < W - 1) d = Math.min(d, dist[p + 1] + 3);
  if (y < H - 1) {
    d = Math.min(d, dist[p + W] + 3);
    if (x < W - 1) d = Math.min(d, dist[p + W + 1] + 4);
    if (x > 0) d = Math.min(d, dist[p + W - 1] + 4);
  }
  dist[p] = d;
}

// how far each open area may reach past its polygon (up to its `seam`, in pixels)
const SEAM = 40;
const seamOf = AREAS.map((a) => a[4]?.seam ?? SEAM);
// Two neighbours share the smaller of their seams, so a wide area (lake) can't swallow a
// small one (bushes). canClaim(a, p): may area a take pixel p?
const reach = new Map(); // area -> Uint8Array, distance past its polygon + 1 (0 = too far)
{
  const q = new Int32Array(N);
  for (let a = 0; a < AREAS.length; a++) {
    if (!OPEN.has(AREAS[a][0])) continue;
    const r = new Uint8Array(N);
    let h = 0, t = 0;
    for (let p = 0; p < N; p++) if (polyOpen[p] === a) { r[p] = 1; q[t++] = p; }
    while (h < t) {
      const p = q[h++], x = p % W;
      if (r[p] > seamOf[a]) continue;
      for (const n of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W]) {
        if (n >= 0 && n < N && !r[n]) { r[n] = r[p] + 1; q[t++] = n; }
      }
    }
    reach.set(a, r);
  }
}
const canClaim = (a, p) => {
  const o = polyOpen[p];
  if (o === a) return true;
  const r = reach.get(a);
  return !!r && r[p] > 0 && r[p] - 1 <= Math.min(seamOf[a], seamOf[o]);
};
// a pixel is contested when some other open area can claim it
const contested = new Uint8Array(N);
for (const a of reach.keys()) for (let p = 0; p < N; p++) if (polyOpen[p] !== a && canClaim(a, p)) contested[p] = 1;

// --- label every pixel ---
// Small regions are labelled whole. Inside big open regions, uncontested pixels are seeds;
// contested pixels near polygon edges are flooded from the seeds, far-from-line pixels
// first, so the fronts meet on the drawn strokes instead of a straight cut. An area only
// floods pixels within its reach, so one seed can't take over a whole field.
const label = new Int16Array(N).fill(-1);
const queue = new Int32Array(N);
let qh = 0, qt = 0;
// Height is distance to the nearest line, capped: away from strokes all pixels are level and
// the fronts advance evenly (meeting near the polygon edge); near strokes, lines are ridges.
const MAXD = 36; // ~12 px
const buckets = Array.from({ length: MAXD + 1 }, () => []);
const bucketOf = (p) => MAXD - Math.min(MAXD, dist[p]);
for (let p = 0; p < N; p++) {
  if (isLine[p]) continue;
  const c = comp[p];
  if (compArea[c] >= 0) label[p] = compArea[c];
  else if (!contested[p]) label[p] = polyOpen[p];
  else continue;
  buckets[bucketOf(p)].push(p);
}
for (let b = 0; b <= MAXD; b++) {
  const bucket = buckets[b];
  for (let i = 0; i < bucket.length; i++) { // FIFO, so fronts on a level stretch move evenly
    const p = bucket[i];
    const x = p % W, l = label[p];
    if (!reach.has(l)) continue;
    for (const n of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W]) {
      if (n < 0 || n >= N || isLine[n] || label[n] !== -1 || !canClaim(l, n)) continue;
      label[n] = l;
      // never flood "uphill" into an already-passed bucket
      buckets[Math.max(b, bucketOf(n))].push(n);
    }
  }
}
// pixels no seed could reach (a pocket cut off by strokes) keep their polygon's label
for (let p = 0; p < N; p++) if (!isLine[p] && label[p] === -1) label[p] = polyOpen[p];

// line pixels take the nearest region's label (BFS)
for (let p = 0; p < N; p++) if (label[p] !== -1) queue[qt++] = p;
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
  const outlines = DEBUG_POLYS ? AREAS.map(([, , , ds]) => ds.map((d) =>
    `<path d="${d}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>`).join('')).join('') : '';
  const svgLabels = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${outlines}${areasOut.map((o) =>
    `<text x="${o.x + o.w / 2}" y="${o.y + o.h / 2}" font-size="26" font-family="sans-serif" font-weight="bold" fill="#fff" stroke="#000" stroke-width="1" text-anchor="middle">${o.key}</text>`).join('')}</svg>`);
  await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: svgLabels }]).png().toFile(new URL('./kesailta-debug.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
}
console.log(`kesailta: ${areasOut.length} areas, ${comps.length} regions`);
