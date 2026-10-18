// "Mökkikesä" — a bright midsummer afternoon at the cottage: red mökki on the lake bank,
// a sauna and jetty, a rowboat, a duck family, a birch and a band of lupines.
// Light: high sun from the upper left. Crisp cast shadows fall down-right, shade is cool blue.
// First picture of the game, so ~20 big, friendly areas.
import { createScene } from './lib.mjs';
import { lightKit } from './light.mjs';
import {
  smooth, closeDown, poly, blob, rng, noise1, mix, cumulus, islandSilhouette, ripples, grassTufts, clumped,
  birchForm, crownBlobs, leafScatter, ridgeY, simplify, lerp,
  setVariant,
} from './organic.mjs';

/** Build the picture. variant 0 is the original; any other number grows new shapes for the same areas. */
export default function generate(variant = 0) {
  setVariant(variant);
  const S = createScene({ id: 'mokki', title: 'Mökkikesä', titleEn: 'Cottage Summer', seed: 7 });
  const { INK, R, add, ink, group, f } = S;
  const { st, rim, shadow, reflection, edge, ground, smoke, foliage, mottle, water } = lightKit(S, 'mk', { light: [-0.55, -0.83] });
  const HY = 300;
  const SUN = [112, 74];
  const SHADE = '#2f3f7a';
  const LIT = '#fff6d8';

  S.def(`<linearGradient id="mk-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f86d6"/><stop offset=".6" stop-color="#7fb6ea"/><stop offset="1" stop-color="#cfe6f6"/></linearGradient>
    <radialGradient id="mk-sunGlow"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".25" stop-color="#fff2c0" stop-opacity=".5"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
    <radialGradient id="mk-sun" cx=".45" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fff0a8"/></radialGradient>
    <linearGradient id="mk-lake" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a9d0ee"/><stop offset=".25" stop-color="#5f9ed6"/><stop offset=".7" stop-color="#2f6cb0"/><stop offset="1" stop-color="#1f4f8f"/></linearGradient>
    <linearGradient id="mk-meadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccc5a"/><stop offset=".5" stop-color="#6fae48"/><stop offset="1" stop-color="#3f7f3a"/></linearGradient>
    <linearGradient id="mk-front" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2553e"/><stop offset="1" stop-color="#c8402f"/></linearGradient>
    <linearGradient id="mk-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#93303a"/><stop offset="1" stop-color="#7a2a3a"/></linearGradient>
    <linearGradient id="mk-roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d6684"/><stop offset="1" stop-color="#3a405e"/></linearGradient>
    <linearGradient id="mk-window" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f0ff"/><stop offset=".5" stop-color="#7fb0d9"/><stop offset="1" stop-color="#3d6a9a"/></linearGradient>
    <linearGradient id="mk-logs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a6a44"/><stop offset="1" stop-color="#6e4a34"/></linearGradient>
    <linearGradient id="mk-boards" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2c08a"/><stop offset="1" stop-color="#b98a58"/></linearGradient>
    <linearGradient id="mk-path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ead2a2"/><stop offset="1" stop-color="#d6b47c"/></linearGradient>
    <linearGradient id="mk-farHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb4c8"/><stop offset="1" stop-color="#7aa3b6"/></linearGradient>
    <linearGradient id="mk-lupP" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5a3fae"/><stop offset=".6" stop-color="#8f6fe0"/><stop offset="1" stop-color="#d8ccff"/></linearGradient>
    <linearGradient id="mk-lupK" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c2387a"/><stop offset=".6" stop-color="#ec74ae"/><stop offset="1" stop-color="#ffd0e6"/></linearGradient>
    <linearGradient id="mk-lupB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3f5fc4"/><stop offset=".6" stop-color="#7a98ec"/><stop offset="1" stop-color="#d8e2ff"/></linearGradient>
    <linearGradient id="mk-lupW" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c9c0e6"/><stop offset=".6" stop-color="#f1ecff"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
    <radialGradient id="mk-leaf" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#b6dc6e"/><stop offset=".6" stop-color="#6fae48"/><stop offset="1" stop-color="#3f7a3e"/></radialGradient>
    <linearGradient id="mk-boat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe2"/><stop offset="1" stop-color="#cdbfae"/></linearGradient>`);

  // ---------------------------------------------------------------- sky
  group('sky', 'Kesätaivas', 'Summer sky', () => {
    R(`M0 0H800V${HY + 2}H0Z`, 'url(#mk-sky)');
    const Rn = rng(4);
    for (let i = 0; i < 4; i++) {
      const x = 300 + Rn() * 380, y = 40 + Rn() * 90, s = 0.7 + Rn() * 0.5;
      ink(`<path d="M${f(x)} ${f(y)}q${f(6 * s)} ${f(-6 * s)} ${f(12 * s)} 0q${f(6 * s)} ${f(-6 * s)} ${f(12 * s)} 0" fill="none" stroke="#2b3a5a" stroke-width="1.8" stroke-linecap="round" data-anim="bob" style="animation-delay:-${f(i * 0.7)}s"/>`);
    }
  });
  group('sun', 'Aurinko', 'Sun', () => {
    add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="150" fill="url(#mk-sunGlow)" data-anim="glow"/>`);
    R(`M${SUN[0]} ${SUN[1] - 30}a30 30 0 1 1 0 60a30 30 0 1 1 0-60Z`, 'url(#mk-sun)', 'stroke="#ffe7a6" stroke-width="2"');
  });
  [[430, 124, 190, 62, 3], [640, 66, 120, 40, 6]].forEach(([x, y, w, h, seed], i) => group(`cloud${i}`, 'Poutapilvi', 'Fluffy cloud', () => {
    const c = cumulus({ seed, x, y, w, h });
    add('<g data-anim="drift">');
    R(c.body, '#ffffff', 'stroke="#c9d8f0" stroke-width=".8" stroke-opacity=".6"');
    shadow(c.body, '#9fb3dc', h * 0.4, 0.55);
    add(`<path d="${c.base}" fill="#b4c4e6" opacity=".55"/>`);
    if (c.hi) add(`<path d="${c.hi}" fill="#ffffff" opacity=".9"/>`);
    add('</g>');
  }));

  // ---------------------------------------------------------------- far shore
  const farHill = islandSilhouette({ seed: 11, xa: -40, xb: 840, y0: HY, h: 46, treeMin: 3, treeMax: 8, kinds: { spruce: 3, round: 2 } });
  const nearShore = islandSilhouette({ seed: 12, xa: -40, xb: 860, y0: HY + 4, h: 12, treeMin: 12, treeMax: 32, kinds: { spruce: 4, round: 3, pine: 1 } });
  group('farShore', 'Vastaranta', 'Far shore', () => {
    R(farHill, 'url(#mk-farHill)', `stroke="${edge('#7aa3b6', 0.3)}" stroke-width=".9"`);
    R(nearShore, '#3f7a62', st('#3f7a62', 1));
    rim(nearShore, '#b9e08a', 1.4, 0.8);
    // birch trunks catching the light along the shore
    const Rn = rng(13);
    let d = '';
    for (let i = 0; i < 22; i++) { const x = Rn() * 800; d += `M${f(x)} ${HY + 4}v${f(-4 - Rn() * 7)}`; }
    add(`<path d="${d}" stroke="#eef4e8" stroke-width="1.4" opacity=".75"/>`);
    add(`<rect x="560" y="${HY - 3}" width="9" height="7" fill="#c8402f"/><path d="M558 ${HY - 3}l6.5 -4l6.5 4Z" fill="#3a405e"/>`);
  });

  // ---------------------------------------------------------------- lake
  const shore = [[-10, 410], [120, 418], [230, 430], [330, 450], [470, 492], [610, 508], [820, 498]];
  const shoreY = (x) => ridgeY(shore, x);
  group('lake', 'Järvi', 'Lake', () => {
    R(`M0 ${HY}H800V600H0Z`, 'url(#mk-lake)');
    reflection(`<path d="${nearShore}" fill="#2f5a4f"/><path d="${farHill}" fill="#6b92a8"/>`, HY + 4, { depth: 60, amp: 2.5, seed: 3, opacity: 0.55 });
    water({ seed: 5, y0: HY + 8, y1: 520, rows: 26, gate: 0.2 }, { lit: '#ffffff', dark: '#1f4f8f' });
    // sun sparkles under the sun only
    const Rn = rng(8);
    let sp = '';
    for (let i = 0; i < 26; i++) { const t = Rn(), x = SUN[0] + (Rn() - 0.5) * (30 + t * 120), y = HY + 8 + t * 110; sp += `M${f(x - 3 - t * 3)} ${f(y)}h${f(6 + t * 6)}M${f(x)} ${f(y - 2 - t * 2)}v${f(4 + t * 4)}`; }
    add(`<path d="${sp}" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" opacity=".85" data-anim="twinkle"/>`);
  });

  // ---------------------------------------------------------------- meadow (behind the buildings)
  const meadowD = smooth(shore) + 'L820 600L-10 600Z';
  group('meadow', 'Niitty', 'Meadow', () => {
    R(meadowD, 'url(#mk-meadow)', st('#6fae48', 2));
    rim(meadowD, '#d8f2a0', 3, 0.9);
    // mown stripes and clumps of grass, bigger towards the viewer
    mottle({ seed: 23, n: 34, y0: 440, y1: 600, accept: (x, y) => y > shoreY(x) + 8, colours: ['#4f8f3a', '#b9e07a', '#3f7a3a'], op: 0.28 });
    add(`<path d="${grassTufts({ seed: 21, n: 90, y0: 430, y1: 600, size: [6, 18], accept: (x, y) => y > shoreY(x) + 6 })}" fill="none" stroke="#3f7a3a" stroke-opacity=".65" stroke-width="1.6" stroke-linecap="round"/>`);
    for (const [x, y, u] of clumped({ seed: 22, n: 34, x0: 0, x1: 640, y0: 450, y1: 560, threshold: 0.1, accept: (x, y) => y > shoreY(x) + 10 })) {
      const s = 0.6 + (y - 450) / 110 * 0.6;
      add(`<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse rx="2" ry="4.4" transform="rotate(${a}) translate(0 -4.2)" fill="#ffffff"/>`).join('')}<circle r="2.4" fill="#ffc94d"/></g>`);
    }
    // shore stones
    for (const [x, y, w] of [[300, 452, 22], [446, 488, 16], [700, 506, 26], [20, 414, 18]]) {
      const d = blob({ seed: x, cx: x, cy: y, r: w, ry: w * 0.45, lobes: 4, scallop: 0.05, wobble: 0.12 });
      add(`<path d="${d}" fill="#a8a6b8" stroke="${edge('#a8a6b8')}" stroke-width="1.2"/>`);
    }
  });

  // ---------------------------------------------------------------- cottage (three-quarter view)
  const front = 'M78 422V352L124 312L170 352V422Z';
  const side = 'M170 422V352L276 360V418Z';
  const roof = 'M120 307L238 315L284 362L172 355Z';
  const verge = 'M120 307L72 354L80 357L124 316Z';
  const castHouse = 'M170 422L276 418L338 432L238 440Z';
  group('walls', 'Mökin seinät', 'Cottage walls', () => {
    add(`<path d="${castHouse}" fill="${SHADE}" opacity=".32"/>`);
    R(front, 'url(#mk-front)', st('#c8402f', 2));
    R(side, 'url(#mk-side)', st('#93303a', 2));
    for (let x = 86; x < 168; x += 7) ink(`<path d="M${x} 421V${f(Math.max(352 - Math.max(0, 46 - Math.abs(x - 124)) * 40 / 46 + 1, 316))}" stroke="${INK}" stroke-opacity=".18" stroke-width="1"/>`);
    for (let x = 178; x < 274; x += 7) ink(`<path d="M${x} ${f(421 - (x - 170) * 0.04)}V${f(353 + (x - 170) * 0.075)}" stroke="${INK}" stroke-opacity=".2" stroke-width="1"/>`);
    rim(front, LIT, 2.5, 0.7);
    add(`<path d="M170 352L276 360L276 368L170 362Z" fill="${SHADE}" opacity=".3"/>`);
    // grey stone footing
    const foot = 'M74 420H172L278 416V424L172 430H74Z';
    R(foot, '#a8a4b4', st('#8a8698', 1.4));
    const Rn = rng(17);
    let stones = '';
    for (let x = 78; x < 274; x += 9 + Rn() * 5) { const y = x < 172 ? 425 : 425 - (x - 172) * 0.04; stones += `M${f(x)} ${f(y)}h${f(5 + Rn() * 3)}`; }
    ink(`<path d="${stones}" stroke="${INK}" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round"/>`);
    shadow(foot, SHADE, 6, 0.3);
  });
  group('roof', 'Katto', 'Roof', () => {
    R(roof, 'url(#mk-roof)', st('#3a405e', 2));
    R(verge, '#4a5274', st('#3a405e', 1.6));
    for (let k = 1; k < 9; k++) {
      const t = k / 9;
      const x0 = lerp(120, 238, t), y0 = lerp(307, 315, t), x1 = lerp(172, 284, t), y1 = lerp(355, 362, t);
      ink(`<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2"/>`);
      add(`<path d="M${f(x0 - 1.5)} ${f(y0 + 0.5)}L${f(x1 - 1.5)} ${f(y1)}" stroke="#a9b4d8" stroke-opacity=".5" stroke-width="1"/>`);
    }
    rim(roof, '#d6def8', 2.5, 0.8);
    // chimney with a lazy wisp of smoke
    R('M200 300h14v20l-14 -1Z', '#8a7a86', st('#8a7a86', 1.4));
    R('M197 296h20v6h-20Z', '#6a5a6a', st('#6a5a6a', 1.2));
    smoke(207, 294, { h: 90, w: 6, lean: 34, seed: 3 });
  });
  group('trim', 'Valkoiset ikkunat', 'White windows', () => {
    const win = (pts, panes) => {
      R(poly(pts), '#f6f0e4', st('#d9cfc0', 1.6));
      const [a, b, c, d] = pts, inset = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
      const g = [inset(a, c, 0.14), inset(b, d, 0.14), inset(c, a, 0.14), inset(d, b, 0.14)];
      R(poly(g), 'url(#mk-window)', st('#3d6a9a', 1.2));
      const m1 = inset(g[0], g[1], 0.5), m2 = inset(g[3], g[2], 0.5), m3 = inset(g[0], g[3], 0.5), m4 = inset(g[1], g[2], 0.5);
      add(`<path d="M${f(m1[0])} ${f(m1[1])}L${f(m2[0])} ${f(m2[1])}M${f(m3[0])} ${f(m3[1])}L${f(m4[0])} ${f(m4[1])}" stroke="#f6f0e4" stroke-width="3"/>`);
      ink(`<path d="M${f(m1[0])} ${f(m1[1])}L${f(m2[0])} ${f(m2[1])}M${f(m3[0])} ${f(m3[1])}L${f(m4[0])} ${f(m4[1])}" stroke="${INK}" stroke-width="1"/>`);
      add(`<path d="M${f(g[0][0] + 2)} ${f(g[0][1] + 8)}l7 -7" stroke="#ffffff" stroke-width="2" opacity=".8"/>`);
      // lace curtains tied back at the sides
      const cw = (g[1][0] - g[0][0]) * 0.22, ch = (g[3][1] - g[0][1]) * 0.75;
      add(`<path d="M${f(g[0][0])} ${f(g[0][1])}h${f(cw)}q${f(-cw * 0.2)} ${f(ch * 0.6)} ${f(-cw * 0.8)} ${f(ch)}Z M${f(g[1][0])} ${f(g[1][1])}h${f(-cw)}q${f(cw * 0.2)} ${f(ch * 0.6)} ${f(cw * 0.8)} ${f(ch)}Z" fill="#ffffff" opacity=".85"/>`);
    };
    const flowerBox = (x, y, w) => {
      R(`M${x} ${y}h${w}l-2 8h${-w + 4}Z`, '#8a5a3c', st('#8a5a3c', 1.3));
      const Rn = rng(x);
      let fl = '';
      const cols = ['#ff6f91', '#ffd166', '#ffffff', '#ff9ec4'];
      for (let i = 0; i < w / 5; i++) {
        const fx = x + 3 + i * 5 + Rn() * 2, fy = y - 2 - Rn() * 4;
        fl += `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(2.2 + Rn())}" fill="${cols[i % 4]}"/>`;
      }
      add(`<path d="M${x + 1} ${y}q${w / 4} -6 ${w / 2} -2q${w / 4} -5 ${w / 2 - 1} 2Z" fill="#4f8f3a"/>${fl}`);
    };
    win([[100, 362], [148, 362], [148, 398], [100, 398]]);
    win([[118, 330], [130, 330], [130, 344], [118, 344]]);
    win([[232, 372], [262, 374], [262, 400], [232, 399]]);
  flowerBox(98, 400, 52);
  flowerBox(230, 402, 34);
    // corner boards and barge board
    R('M166 352h8v70h-8Z', '#f6f0e4', st('#d9cfc0', 1.2));
    R('M74 352h8v70h-8Z', '#f6f0e4', st('#d9cfc0', 1.2));
    R('M124 312L170 352L166 356L124 319L82 356L78 352Z', '#f6f0e4', st('#d9cfc0', 1.2));
  });
  group('porch', 'Ovi ja portaat', 'Door and steps', () => {
    R('M186 420V372L212 373V420Z', '#3f6f9a', st('#3f6f9a', 1.6));
    R('M191 378l16 .5v14l-16 -.4Z', '#7db0d4', st('#3f6f9a', 1));
    ink(`<circle cx="208" cy="400" r="1.8" fill="${INK}"/>`);
    R('M180 420h40l4 6h-48Z', '#b9a99a', st('#9a8a7c', 1.4));
    R('M174 426h54l4 6h-62Z', '#a8988a', st('#9a8a7c', 1.4));
    add(`<path d="M220 420l4 6M228 426l4 6" stroke="${SHADE}" stroke-opacity=".35" stroke-width="3"/>`);
  });

  group('bushes', 'Pensaat', 'Bushes', () => {
    for (const [x, y, r, seed] of [[84, 428, 22, 1], [150, 432, 18, 2], [262, 426, 20, 3], [300, 430, 14, 4]]) {
      const blobs = [{ x, y: y - r * 0.4, r, d: blob({ seed: seed * 13, cx: x, cy: y - r * 0.4, r, ry: r * 0.72, lobes: 9, scallop: 0.18, wobble: 0.1 }) }];
      ground(x, y + 2, r * 2, { h: r });
      foliage(blobs, { fill: 'url(#mk-leaf)', base: '#4f8f3a', dark: '#1f4a34', rimColour: '#e6f6a8' });
      add(`<path d="M${x - r * 0.5} ${y - r * 0.6}h1M${x + r * 0.2} ${y - r * 0.9}h1M${x + r * 0.5} ${y - r * 0.4}h1" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round"/>`);
    }
  });

  // ---------------------------------------------------------------- sauna, jetty, boat
  group('sauna', 'Rantasauna', 'Lakeside sauna', () => {
    const walls = 'M334 450V414H404V452Z';
    ground(372, 452, 76, { h: 40 });
    R(walls, 'url(#mk-logs)', st('#6e4a34', 1.8));
    for (let y = 420; y < 452; y += 6) ink(`<path d="M335 ${y}H403" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>`);
    for (let y = 418; y < 452; y += 6) add(`<circle cx="333" cy="${y}" r="2.6" fill="#c89a6a" stroke="${INK}" stroke-opacity=".4" stroke-width=".8"/>`);
    const r = 'M326 416L369 396L412 416L408 419L369 401L330 419Z';
    R(r, '#4a5274', st('#3a405e', 1.4));
    rim(r, '#d6def8', 1.8, 0.8);
    R('M350 452V428h14v24Z', '#4a3428', st('#4a3428', 1.2));
    R('M374 424h18v12h-18Z', '#ffe9a8', st('#c8a050', 1.2));
    R('M388 402h8v-12h-8Z', '#6a5a6a', st('#6a5a6a', 1.2));
    smoke(392, 386, { h: 70, w: 5, lean: 26, seed: 7 });
    rim(walls, LIT, 2, 0.5);
  });
  group('jetty', 'Laituri', 'Jetty', () => {
    reflection(`<path d="M404 450H566V458H404Z" fill="#7a5a40"/>${[430, 470, 510, 550].map((x) => `<path d="M${x - 3} 456h6v16h-6Z" fill="#4a3428"/>`).join('')}`, 468, { depth: 26, amp: 2, seed: 9, opacity: 0.45, x0: 400, x1: 580 });
    for (const x of [430, 470, 510, 550]) R(`M${x - 3} 456h6v14h-6Z`, '#6e4a34', st('#6e4a34', 1.3));
    const deck = 'M404 450H566L570 456H400Z';
    R(deck, 'url(#mk-boards)', st('#b98a58', 1.6));
    for (let x = 414; x < 566; x += 10) ink(`<path d="M${x} 450.5l-.6 5" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>`);
    R('M400 456H570V461H400Z', '#8a6040', st('#8a6040', 1.2));
    rim(deck, LIT, 1.6, 0.8);
  });
  const hull = 'M584 476C596 492 664 494 690 476L686 470H588Z';
  group('boat', 'Soutuvene', 'Rowboat', () => {
    reflection(`<path d="${hull}" fill="#c8402f"/>`, 484, { depth: 20, amp: 2, seed: 10, opacity: 0.4, x0: 570, x1: 700 });
    add('<g data-anim="rock">');
    R(hull, 'url(#mk-boat)', st('#cdbfae', 1.8));
    R('M586 474C600 484 662 486 688 474L686 470H588Z', '#c8402f', st('#a8302a', 1.4));
    R('M590 470H684L682 466H592Z', '#8a6040', st('#8a6040', 1.2));
    ink(`<path d="M616 466v8M656 466v8" stroke="${INK}" stroke-width="1.6"/>`);
    shadow(hull, SHADE, 8, 0.25);
    ink(`<path d="M586 472C576 468 570 462 566 458" fill="none" stroke="${INK}" stroke-width="1.3"/>`);
    R('M620 462L668 452L669 456L621 466Z', '#e2c08a', st('#b98a58', 1.2));
    add('</g>');
  });

  // ---------------------------------------------------------------- ducks
  group('ducks', 'Sorsaperhe', 'Duck family', () => {
    const duck = (x, y, s, mum) => {
      add(`<g transform="translate(${x} ${y}) scale(${s})"><g data-anim="paddle" style="animation-delay:-${f(x / 100)}s">`);
      add(`<ellipse cx="0" cy="8" rx="17" ry="2.4" fill="${SHADE}" opacity=".25"/>`);
      const body = 'M-15 2C-15 -7 6 -9 12 -3C16 1 12 8 0 8C-10 8 -15 6 -15 2Z';
      const head = 'M6 -4C4 -15 15 -17 17 -10C18 -7 15 -5 12 -2Z';
      R(body, mum ? '#a6825e' : '#d8b84a', st(mum ? '#a6825e' : '#d8b84a', 1.3));
      R(head, mum ? '#3f7a5a' : '#e6c858', st(mum ? '#3f7a5a' : '#c8a83a', 1.3));
      R('M17 -11L23 -9L17 -7Z', '#ff9f3a', st('#d97a1a', 1));
      ink(`<circle cx="13" cy="-11" r="1.1" fill="${INK}"/>`);
      rim(body, LIT, 1.5, 0.7);
      add(`<path d="M-17 7q8 3 16 0" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="1.3"/>`);
      add('</g></g>');
    };
    duck(640, 410, 1.1, true);
    duck(682, 416, 0.55, false);
    duck(704, 420, 0.5, false);
    duck(726, 418, 0.52, false);
  });

  // ---------------------------------------------------------------- flag
  group('flag', 'Siniristilippu', 'Finnish flag', () => {
    R('M292 446V290h4V446Z', '#f6f0e4', st('#d9cfc0', 1.3));
    R('M294 284a4 4 0 1 1 0.1 0Z', '#ffd166', st('#d9a020', 1));
    ground(294, 446, 8, { h: 150, colour: SHADE, op: 0.2 });
    add('<g data-anim="wave">');
    const flag = 'M296 296C312 292 328 302 346 296V330C328 336 312 326 296 330Z';
    R(flag, '#ffffff', st('#c9d0e0', 1.4));
    add(`<path d="M296 307C312 303 328 313 346 307V317C328 323 312 313 296 317Z" fill="#2f5fb3"/>`);
    add(`<path d="M308 294.5C310 294.2 314 294.4 318 295.5V329C314 328 310 328 308 328.4Z" fill="#2f5fb3"/>`);
    shadow(flag, '#7a8ab8', 6, 0.3);
    add('</g>');
  });

  // ---------------------------------------------------------------- path
  group('path', 'Polku', 'Path', () => {
    const d = 'M282 600C280 560 244 520 222 488C210 468 202 448 198 434L220 434C230 452 254 478 286 506C330 544 370 574 396 600Z';
    R(d, 'url(#mk-path)', st('#d6b47c', 1.8));
    const Rn = rng(31);
    let p = '', peb = '';
    for (let i = 0; i < 30; i++) { const t = Rn(), y = 440 + t * 155, x = lerp(209, 336, Math.pow(t, 1.4)) + (Rn() - 0.5) * 30 * t; p += `M${f(x)} ${f(y)}h${f(1.5 + t * 3)}`; }
    for (let i = 0; i < 26; i++) {
      const t = i / 25, y = 436 + t * 164, side = i % 2 ? 1 : -1;
      const cx = lerp(209, 336, Math.pow(t, 1.4)), hw = 12 + t * 38;
      const x = cx + side * hw + (Rn() - 0.5) * 6, r = 1.5 + t * 3.5;
      peb += `M${f(x - r)} ${f(y)}a${f(r)} ${f(r * 0.65)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r * 0.65)} 0 1 0 ${f(-r * 2)} 0`;
    }
    add(`<path d="${p}" stroke="#a8875a" stroke-width="2.2" stroke-linecap="round" opacity=".6"/>`);
    add(`<path d="${peb}" fill="#b8b2c0" stroke="#8a8494" stroke-width=".8"/>`);
  });

  // ---------------------------------------------------------------- birch
  group('birchTrunk', 'Koivun runko', 'Birch trunk', () => {
    const b = birchForm({ seed: 14, x: 728, top: 70, w: 17, lean: -26, ink: INK, base: 612 });
    ground(724, 604, 44, { h: 300 });
    R(b.trunk, '#f7f2e8', st('#cfc6d8', 2.4));
    shadow(b.trunk, '#7d86b0', 9, 0.4);
    for (const m of [...b.marks, ...b.twigs]) ink(m);
  });
  group('birchLeaves', 'Koivun lehvästö', 'Birch leaves', () => {
    add('<g data-anim="sway-slow">');
    const blobs = crownBlobs({ seed: 15, cx: 708, cy: 112, rx: 170, ry: 110, n: 14, size: [22, 38], lobes: 9, hang: 50 });
    foliage(blobs, {
      fill: 'url(#mk-leaf)', base: '#5f9a4e', dark: '#24503a', rimColour: '#e6f6a8',
      scatter: leafScatter({ seed: 16, cx: 708, cy: 130, rx: 175, ry: 140, n: 90, size: 4.5, colours: ['#b6dc6e', '#8cc05a', '#d9f08a'] }),
    });
    add('</g>');
  });

  // ---------------------------------------------------------------- lupines across the foreground
  const lupineSpike = (x, y, h, w, seed) => {
    const N = noise1(seed);
    const L = [], Rt = [];
    // scalloped outline: one bump per whorl of florets, a rounded bud at the tip
    const whorls = Math.round(h / 9);
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, yy = y - t * h;
      const env = Math.pow(1 - Math.pow(t, 1.8), 0.55) * 0.85 + 0.15 * (1 - t);
      const bump = 0.74 + 0.26 * Math.pow(Math.abs(Math.sin(Math.PI * t * whorls)), 0.6);
      const lean = N(t * 1.5, 2) * 6 * t;
      L.push([x + lean - w * env * bump, yy]); Rt.push([x + lean + w * env * bump, yy]);
    }
    const tip = [x + N(1.5, 2) * 6, y - h - 3];
    return { d: poly(simplify([...L, tip, ...Rt.reverse()], 0.25)), top: tip };
  };
  group('lupines', 'Lupiinit', 'Lupines', () => {
    const Rn = rng(41);
    const pals = [['#4a2f9e', '#9a7cf0', '#ece4ff'], ['#a82a66', '#ee78b0', '#ffe4f0'], ['#2f4fb8', '#7f9cf0', '#e4ecff'], ['#9a90c8', '#efeaff', '#ffffff']];
    const plants = [];
    for (const [a, b, cnt] of [[-6, 150, 7], [392, 500, 5], [552, 648, 5]]) {
      for (let i = 0; i < cnt; i++) {
        plants.push({ x: lerp(a, b, (i + 0.2 + Rn() * 0.6) / cnt), y: 600 + Rn() * 14, h: 84 + Rn() * 96, lean: (Rn() - 0.5) * 16, pal: pals[Math.floor(Rn() * 4)] });
      }
    }
    plants.sort((p, q) => p.y - q.y);
    const ell = (x, y, rx, ry) => `M${f(x - rx)} ${f(y)}a${f(rx)} ${f(ry)} 0 1 0 ${f(rx * 2)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-rx * 2)} 0`;
    plants.forEach((p, i) => {
      const stemTop = p.y - p.h * 0.34, L = p.h * 0.66, sx = p.x + p.lean * 0.5;
      add(`<g data-anim="sway" style="animation-delay:-${f(Rn() * 3)}s">`);
      ink(`<path d="M${f(p.x)} ${f(p.y)}Q${f(p.x + p.lean * 0.2)} ${f((p.y + stemTop) / 2)} ${f(sx)} ${f(stemTop)}" fill="none" stroke="#3f7a3a" stroke-width="3"/>`);
      const w = 11 + Rn() * 3;
      const sp = lupineSpike(sx, stemTop, L, w, 40 + i);
      R(sp.d, p.pal[1], st(p.pal[0], 1.4));
      // whorls of pea-flowers: deep at the bottom, pale above, green buds at the tip
      const whorls = Math.round(L / 6.5);
      for (let k = 0; k < whorls; k++) {
        const t = (k + 0.5) / whorls, yy = stemTop - t * L;
        const hw = w * (Math.pow(1 - Math.pow(t, 1.8), 0.55) * 0.85 + 0.15 * (1 - t));
        const cx = sx + (t * t) * (sp.top[0] - sx);
        if (t > 0.86) { add(`<path d="${ell(cx, yy, hw * 0.55, hw * 0.45)}" fill="#9cc860" stroke="#5f8a3a" stroke-width=".6"/>`); continue; }
        const col = t < 0.55 ? mix(p.pal[0], p.pal[1], t / 0.55) : mix(p.pal[1], p.pal[2], (t - 0.55) / 0.3);
        let back = '', front = '', banner = '';
        for (const j of [-0.95, -0.35, 0.35, 0.95]) {
          const fx = cx + j * hw * 0.72, fy = yy + Math.abs(j) * 2, rx = hw * 0.56, ry = hw * 0.4;
          if (Math.abs(j) > 0.5) back += ell(fx, fy, rx, ry); else front += ell(fx, fy, rx, ry);
          banner += ell(fx - rx * 0.1, fy - ry * 0.7, rx * 0.62, ry * 0.5);
        }
        add(`<path d="${back}" fill="${mix(col, '#2a1d4a', 0.25)}"/><path d="${front}" fill="${col}"/><path d="${banner}" fill="${mix(col, '#ffffff', 0.55)}" opacity=".9"/>`);
      }
      rim(sp.d, '#ffffff', 1.6, 0.35);
      add('</g>');
    });
    // big palmate leaves in front of the stands
    for (const p of plants) {
      for (let k = 0; k < 1; k++) {
        const cx = p.x + (Rn() - 0.5) * 30, cy = p.y - 12 - Rn() * 14, len = 17 + Rn() * 7;
        let lf = '', vein = '';
        for (let a = 0; a < 9; a++) {
          const ang = Math.PI * (1.02 + a / 8 * 0.96), ex = cx + Math.cos(ang) * len, ey = cy + Math.sin(ang) * len * 0.7;
          const nx = -Math.sin(ang) * len * 0.3, ny = Math.cos(ang) * len * 0.22;
          lf += `M${f(cx)} ${f(cy)}Q${f((cx + ex) / 2 + nx)} ${f((cy + ey) / 2 + ny)} ${f(ex)} ${f(ey)}Q${f((cx + ex) / 2 - nx)} ${f((cy + ey) / 2 - ny)} ${f(cx)} ${f(cy)}Z`;
          vein += `M${f(cx)} ${f(cy)}L${f(ex)} ${f(ey)}`;
        }
        add(`<path d="${lf}" fill="#5fa04a" stroke="#2f5f34" stroke-width=".8"/><path d="${vein}" stroke="#9cc870" stroke-width=".7" opacity=".7"/>`);
      }
    }
  });

  return S.build();
}
