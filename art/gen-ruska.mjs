// "Ruska" — a misty autumn morning in the Lapland fells: ruska colours on the slopes, a laavu
// (lean-to) with a campfire and a sooty coffee pot, a fox, mushrooms, berries and lichen.
// Light: low morning sun from the left. Warm rims on left edges, long cool shade to the right,
// and mist lying between the planes.
import { createScene } from './lib.mjs';
import { lightKit } from './light.mjs';
import {
  ridge, ridgeY, smooth, closeDown, contourBand, treeline, poly, spruceForm, birchForm, crownBlobs, leafScatter,
  cumulus, rock, ripples, grassTufts, clumped, blob, rng, noise1, lerp, mix,
  setVariant,
} from './organic.mjs';

/** Build the picture. variant 0 is the original; any other number grows new shapes for the same areas. */
export default function generate(variant = 0) {
  setVariant(variant);
  const S = createScene({ id: 'ruska', title: 'Ruska', titleEn: 'Autumn Colours', seed: 17 });
  const { INK, R, C, add, ink, group, f } = S;
  const { st, rim, shadow, reflection, lichen, edge, ground, smoke, foliage, mottle, water } = lightKit(S, 'rk', { light: [-0.88, -0.47] });
  const HY = 362;
  const SUN = [86, 196];
  const SHADE = '#3a3a78';
  const GOLD = '#ffdf9a';

  S.def(`<linearGradient id="rk-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9bb0d4"/><stop offset=".45" stop-color="#d6d6e4"/><stop offset=".8" stop-color="#f6dcc8"/><stop offset="1" stop-color="#ffe2bc"/></linearGradient>
    <radialGradient id="rk-haze" cx=".1" cy=".33" r=".7"><stop offset="0" stop-color="#ffe6b8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe6b8" stop-opacity="0"/></radialGradient>
    <radialGradient id="rk-sunGlow"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".2" stop-color="#ffe6b0" stop-opacity=".6"/><stop offset="1" stop-color="#ffd6a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="rk-sun" cx=".45" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe8a8"/></radialGradient>
    <linearGradient id="rk-fellFar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8d0e6"/><stop offset=".5" stop-color="#bab4d8"/><stop offset="1" stop-color="#a09cc8"/></linearGradient>
    <linearGradient id="rk-fellMid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c88a5c"/><stop offset=".6" stop-color="#9c6248"/><stop offset="1" stop-color="#7a4a44"/></linearGradient>
    <linearGradient id="rk-lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e6f0"/><stop offset=".5" stop-color="#9fb2d8"/><stop offset="1" stop-color="#6a82b8"/></linearGradient>
    <linearGradient id="rk-heath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0a24c"/><stop offset=".5" stop-color="#b07e3a"/><stop offset="1" stop-color="#7a5430"/></linearGradient>
    <linearGradient id="rk-path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8d2a0"/><stop offset="1" stop-color="#cfae78"/></linearGradient>
    <linearGradient id="rk-spruce" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a7a5a"/><stop offset=".5" stop-color="#2f5a4a"/><stop offset="1" stop-color="#1f3d38"/></linearGradient>
    <linearGradient id="rk-logs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b48456"/><stop offset="1" stop-color="#7a5236"/></linearGradient>
    <radialGradient id="rk-gold" cx=".25" cy=".3" r=".9"><stop offset="0" stop-color="#ffe88a"/><stop offset=".6" stop-color="#f2b33a"/><stop offset="1" stop-color="#c8801e"/></radialGradient>
    <radialGradient id="rk-rowan" cx=".25" cy=".3" r=".9"><stop offset="0" stop-color="#ffab6a"/><stop offset=".6" stop-color="#e2583a"/><stop offset="1" stop-color="#a83226"/></radialGradient>
    <radialGradient id="rk-fire" cx=".5" cy=".8"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#ffb347"/><stop offset="1" stop-color="#e2583a"/></radialGradient>
    <radialGradient id="rk-fireGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <linearGradient id="rk-fox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f59a4a"/><stop offset=".6" stop-color="#e2702a"/><stop offset="1" stop-color="#b8521e"/></linearGradient>
    <linearGradient id="rk-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#f6f2ff" stop-opacity=".75"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`);

  // mist: a few soft banks of different lengths lying low in the valley
  const mist = (y, h, x0 = -20, x1 = 820, op = 0.8, seed = 1) => {
    const Rn = rng(seed);
    add('<g data-anim="drift">');
    for (let x = x0; x < x1;) {
      const w = 120 + Rn() * 220;
      add(`<ellipse cx="${f(x + w / 2)}" cy="${f(y + (Rn() - 0.5) * h * 0.5)}" rx="${f(w / 2)}" ry="${f(h * (0.35 + Rn() * 0.3))}" fill="#fbf6ff" opacity="${f(op * (0.45 + Rn() * 0.4))}" filter="url(#rk-soft8)"/>`);
      x += w * (0.6 + Rn() * 0.5);
    }
    add('</g>');
  };

  // ---------------------------------------------------------------- sky
  group('sky', 'Aamutaivas', 'Morning sky', () => {
    R(`M0 0H800V${HY + 2}H0Z`, 'url(#rk-sky)');
    add(`<rect width="800" height="${HY}" fill="url(#rk-haze)"/>`);
    // geese heading south in a loose V
    const Rn = rng(3);
    for (let i = 0; i < 11; i++) {
      const k = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
      const x = 470 - k * 15 + Rn() * 4, y = 70 + side * k * 8 + Rn() * 3, s = 1 - k * 0.06;
      ink(`<path d="M${f(x)} ${f(y)}q${f(6 * s)} ${f(-6 * s)} ${f(11 * s)} 0q${f(5 * s)} ${f(-6 * s)} ${f(11 * s)} 0" fill="none" stroke="#3a3354" stroke-width="1.8" stroke-linecap="round" data-anim="bob" style="animation-delay:-${f(i * 0.25)}s"/>`);
    }
  });
  group('sun', 'Aamuaurinko', 'Morning sun', () => {
    add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="230" fill="url(#rk-sunGlow)" data-anim="glow"/>`);
    R(`M${SUN[0]} ${SUN[1] - 26}a26 26 0 1 1 0 52a26 26 0 1 1 0-52Z`, 'url(#rk-sun)', 'stroke="#ffe7a6" stroke-width="1.6"');
  });
  [[330, 120, 170, 44, 4], [690, 180, 130, 34, 9]].forEach(([x, y, w, h, seed], i) => group(`cloud${i}`, 'Pilvi', 'Cloud', () => {
    const c = cumulus({ seed, x, y, w, h });
    add('<g data-anim="drift">');
    R(c.body, '#fbf6f4', st('#d9cfe0', 1.2));
    shadow(c.body, '#9a98c8', h * 0.4, 0.45);
    rim(c.body, '#fff0c8', 2, 0.9);
    add('</g>');
  }));

  // ---------------------------------------------------------------- fells
  const farPts = ridge({ seed: 31, base: 336, peaks: [{ x: 570, h: 128, w: 400, k: 1.9 }, { x: 790, h: 70, w: 170, k: 1.6 }, { x: 330, h: 46, w: 160 }], amp: 6, x0: 160 });
  const farD = closeDown(smooth(farPts), farPts, 340);
  const midPeaks = [{ x: 170, h: 132, w: 260, k: 1.4 }, { x: 400, h: 64, w: 150 }, { x: 760, h: 40, w: 140 }];
  const midPts = ridge({ seed: 33, base: 356, peaks: midPeaks, amp: 6 });
  const midD = closeDown(smooth(midPts), midPts, 360);
  const calmMid = ridge({ seed: 33, base: 356, peaks: midPeaks, amp: 1.5, oct: 1 });
  group('fellFar', 'Kaukainen tunturi', 'Distant fell', () => {
    R(farD, 'url(#rk-fellFar)', `stroke="${edge('#aaa6d2', 0.35)}" stroke-width="1.1"`);
    shadow(farD, '#6a68a8', 40, 0.25);
    rim(farD, '#fff0d8', 2, 0.8);
    // gullies on the shaded flank
    const Rn = rng(32), N = noise1(32);
    let d = '';
    for (let x = 580; x < 780; x += 16 + Rn() * 18) {
      let xx = x, yy = ridgeY(farPts, x) + 6;
      d += `M${f(xx)} ${f(yy)}`;
      for (let k = 0; k < 5; k++) { yy += 7 + Rn() * 5; xx += 1.5 + N(yy * 0.05 + x, 2) * 3; d += `L${f(xx)} ${f(yy)}`; }
    }
    add(`<path d="${d}" fill="none" stroke="#7a78b0" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round"/>`);
    mist(334, 26, 160, 820, 0.8, 2);
  });
  group('snowcap', 'Ensilumi', 'First snow', () => {
    const d = contourBand(farPts, { seed: 34, xa: 440, xb: 700, top: -1, depth: 12, rough: 1.2, step: 4 });
    R(d, '#fbfaff', st('#c9c6e4', 1.2));
    shadow(d, '#a8a6d8', 10, 0.4);
  });
  group('fellMid', 'Ruskatunturi', 'Autumn fell', () => {
    R(midD, 'url(#rk-fellMid)', st('#9c6248', 1.6));
    shadow(midD, SHADE, 34, 0.3);
    rim(midD, GOLD, 2.6, 0.9);
    // dwarf-birch scrub texture
    const Rn = rng(35);
    let d = '';
    for (let i = 0; i < 90; i++) {
      const x = Rn() * 800, top = ridgeY(midPts, x), y = top + 6 + Rn() * (354 - top - 6);
      if (y > 354) continue;
      d += `M${f(x)} ${f(y)}q2 -3 4 0q2 -3 4 0`;
    }
    add(`<path d="${d}" fill="none" stroke="#6a3a30" stroke-width="1.3" stroke-linecap="round" opacity=".4"/>`);
  });
  const strata = [
    ['ruskaRed', 'Punainen ruska', 'Red autumn leaves', '#d6452e', [[60, 16], [150, 34], [250, 22], [600, 10], [380, 40]]],
    ['ruskaOrange', 'Oranssi ruska', 'Orange autumn leaves', '#ee8a2e', [[100, 44], [210, 14], [330, 24], [700, 12], [460, 30]]],
    ['ruskaYellow', 'Keltainen ruska', 'Yellow autumn leaves', '#efc040', [[30, 56], [180, 60], [280, 48], [520, 30], [760, 18]]],
  ];
  strata.forEach(([key, fi, en, colour, spots], si) => group(key, fi, en, () => {
    const Rn = rng(50 + si);
    spots.forEach(([x, off], i) => {
      const y = ridgeY(calmMid, x) + off, r = 18 + Rn() * 14;
      if (y > HY - 6) return;
      const d = blob({ seed: 60 + si * 10 + i, cx: x, cy: y, r, ry: r * 0.42, lobes: 11, scallop: 0.3, wobble: 0.14 });
      R(d, colour, st(colour, 1.1));
      shadow(d, mix(colour, '#3a1a2a', 0.5), r * 0.4, 0.35);
      rim(d, '#fff3c0', 1.4, 0.7);
      // loose speckles of the same colour spilling down the slope
      let sp = '';
      for (let k = 0; k < 14; k++) { const sx = x + (Rn() - 0.5) * r * 3.2, sy = y + (Rn() - 0.2) * r * 0.9, rr = 1.5 + Rn() * 2.5; sp += `M${f(sx - rr)} ${f(sy)}a${f(rr)} ${f(rr * 0.6)} 0 1 0 ${f(rr * 2)} 0a${f(rr)} ${f(rr * 0.6)} 0 1 0 ${f(-rr * 2)} 0`; }
      add(`<path d="${sp}" fill="${colour}" opacity=".75"/>`);
    });
  }));
  const forestPts = treeline({ seed: 23, y0: HY, minH: 10, maxH: 30, gap: 8, kinds: { spruce: 4, round: 2, pine: 1 } });
  const forestD = closeDown(poly(forestPts, false), forestPts, HY + 3);
  S.def(`<clipPath id="rk-forestClip"><path d="${forestD}"/></clipPath>`);
  group('forest', 'Kuusimetsä', 'Spruce forest', () => {
    R(forestD, '#2f5a4a', st('#2f5a4a', 1.1));
    const birches = treeline({ seed: 24, y0: HY, minH: 7, maxH: 22, gap: 10, kinds: { round: 1 } });
    add(`<path d="${closeDown(poly(birches, false), birches, HY + 3)}" fill="#efb43a" opacity=".9" clip-path="url(#rk-forestClip)"/>`);
    rim(forestD, GOLD, 1.4, 0.8);
    mist(356, 22, -20, 820, 0.9, 3);
  });

  // ---------------------------------------------------------------- lake
  const heathPts = ridge({ seed: 71, base: 430, peaks: [{ x: 90, h: 22, w: 220 }, { x: 700, h: 14, w: 200 }], amp: 4, scale: 0.008, step: 8 });
  group('lake', 'Tunturijärvi', 'Fell lake', () => {
    R(`M0 ${HY}H800V450H0Z`, 'url(#rk-lake)');
    reflection(`<path d="${farD}" fill="#9a98c8"/><path d="${midD}" fill="#8a5a48"/><path d="${forestD}" fill="#2f5040"/>`, HY + 1, { depth: 80, amp: 2, seed: 5, opacity: 0.5 });
    water({ seed: 6, y0: HY + 6, y1: 448, rows: 14, gate: 0.3, calm: 0.1 }, { lit: '#ffffff' });
    mist(HY + 10, 26, -20, 820, 0.85, 4);
  });

  // ---------------------------------------------------------------- heath
  const onPath = (x, y) => { const t = (600 - y) / 150; return Math.abs(x - lerp(380, 520, Math.pow(t, 1.3))) < 30 + 30 * (1 - t); };
  const heathD = closeDown(smooth(heathPts), heathPts, 600);
  group('heath', 'Kangas', 'Heath', () => {
    R(heathD, 'url(#rk-heath)', st('#b07e3a', 2));
    rim(heathD, GOLD, 3, 0.9);
    for (const [x, y, rx, seed, c] of [[140, 470, 90, 1, '#b5543a'], [690, 470, 80, 2, '#a8483a'], [600, 580, 90, 3, '#d9d4b0'], [60, 590, 70, 4, '#c96a3a']]) {
      add(`<path d="${blob({ seed, cx: x, cy: y, r: rx, ry: rx * 0.25, lobes: 13, scallop: 0.22, wobble: 0.1 })}" fill="${c}" opacity=".4"/>`);
    }
    mottle({ seed: 15, n: 40, y0: 446, y1: 600, accept: (x, y) => !onPath(x, y) && y > ridgeY(heathPts, x) + 8, colours: ['#4a5a2a', '#7a3a2a', '#c99a4a', '#5f6a34'], size: [16, 40], op: 0.35 });
    const colours = ['#e2733d', '#f0a03c', '#c4472f', '#e8c04a'];
    for (const [x, y, u] of clumped({ seed: 12, n: 80, x0: 0, x1: 800, y0: 446, y1: 598, accept: (x, y) => !onPath(x, y) && y > ridgeY(heathPts, x) + 6 })) {
      const s = 0.6 + (y - 446) / 150 * 0.7;
      add(`<path d="M0 ${f(-6 * s)}Q${f(4 * s)} 0 0 ${f(6 * s)}Q${f(-4 * s)} 0 0 ${f(-6 * s)}Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(u * 360)})" fill="${colours[Math.floor(u * 997) % 4]}" opacity=".9"/>`);
    }
    add(`<path d="${grassTufts({ seed: 13, n: 80, y0: 446, y1: 600, size: [5, 16], accept: (x, y) => !onPath(x, y) && y > ridgeY(heathPts, x) + 6 })}" fill="none" stroke="#6b5326" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>`);
  });
  group('path', 'Polku', 'Path', () => {
    const d = 'M330 600C356 560 420 520 470 494C490 484 500 476 506 470L530 472C526 482 512 494 494 508C454 540 432 572 440 600Z';
    R(d, 'url(#rk-path)', st('#cfae78', 1.6));
    const Rn = rng(14);
    let p = '';
    for (let i = 0; i < 24; i++) { const t = Rn(), y = 476 + t * 120, x = lerp(512, 386, Math.pow(t, 0.8)) + (Rn() - 0.5) * 30 * t; p += `M${f(x)} ${f(y)}h${f(1.5 + t * 3)}`; }
    add(`<path d="${p}" stroke="#a8875a" stroke-width="2" stroke-linecap="round" opacity=".6"/>`);
  });

  // ---------------------------------------------------------------- spruces behind the laavu
  const spruce = (key, seed, x, y, h, w) => group(key, 'Kuusi', 'Spruce', () => {
    ground(x, y, w * 0.6, { h, colour: SHADE, op: 0.28 });
    const sp = spruceForm({ seed, x, y, h, w, tiers: 8 });
    R(sp.body, 'url(#rk-spruce)', st('#2f5a4a', 1.8));
    rim(sp.body, '#c8e08a', 2, 0.7);
  });
  spruce('spruce0', 21, 664, 478, 168, 74);
  spruce('spruce1', 22, 722, 470, 120, 56);

  // ---------------------------------------------------------------- laavu + campfire
  const laavuIn = 'M492 474V424L596 412V472Z';
  const laavuSide = 'M596 412L632 432V474L596 472Z';
  const laavuRoof = 'M482 420L600 404L640 428L634 434L600 412L488 426Z';
  group('laavu', 'Laavu', 'Lean-to shelter', () => {
    R(laavuIn, '#4a3428', st('#4a3428', 1.6));
    for (let y = 432; y < 472; y += 7) add(`<path d="M494 ${y}L594 ${f(y - 9 + (y - 432) * 0.05)}" stroke="#6e4a34" stroke-width="2.2" opacity=".7"/>`);
    // warm firelight on the back wall
    add(`<path d="${laavuIn}" fill="url(#rk-fireGlow)" opacity=".9"/>`);
    ground(560, 476, 150, { h: 60 });
    R(laavuSide, 'url(#rk-logs)', st('#7a5236', 1.6));
    for (let k = 1; k < 7; k++) ink(`<path d="M596 ${f(412 + k * 9)}L632 ${f(432 + k * 6.5)}" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>`);
    let ends = '';
    for (let k = 0; k < 7; k++) { const y = 416 + k * 8.6; ends += `M${f(593)} ${f(y)}a4 3.6 0 1 0 8 0a4 3.6 0 1 0 -8 0`; }
    add(`<path d="${ends}" fill="#e2b886" stroke="#7a5236" stroke-width="1"/>`);
    R('M490 474V426h7v48Z', '#8a5e3c', st('#8a5e3c', 1.3));
    R('M592 474V414h7v60Z', '#8a5e3c', st('#8a5e3c', 1.3));
    shadow(laavuSide, SHADE, 10, 0.3);
  });
  group('laavuRoof', 'Laavun katto', 'Shelter roof', () => {
    R(laavuRoof, '#6a5a52', st('#5a4a44', 1.6));
    rim(laavuRoof, GOLD, 2, 0.9);
    add(`<path d="M488 427L600 413L630 432" fill="none" stroke="#2b1d3a" stroke-opacity=".3" stroke-width="3"/>`);
  });
  group('bench', 'Penkki ja taljat', 'Bench and furs', () => {
    R('M500 462h86v8h-86Z', 'url(#rk-logs)', st('#7a5236', 1.3));
    // reindeer hides draped over the bench, legs hanging down
    const hide = (x, y, w, c) => `M${x - w} ${y}C${x - w * 0.6} ${y - 6} ${x + w * 0.6} ${y - 6} ${x + w} ${y}L${x + w * 0.9} ${y + 12}L${x + w * 0.7} ${y + 6}L${x + w * 0.2} ${y + 9}L${x - w * 0.2} ${y + 7}L${x - w * 0.7} ${y + 12}L${x - w * 0.9} ${y + 5}Z`;
    R(hide(530, 460, 22, 0), '#ece2d0', st('#c9b8a0', 1.2));
    R(hide(568, 459, 17, 0), '#9a7458', st('#7a5a42', 1.2));
    add(`<path d="M512 462q8 3 16 0M552 461q7 3 13 0" fill="none" stroke="#7a6a5a" stroke-width="1" opacity=".5"/>`);
  });
  group('backpack', 'Rinkka', 'Backpack', () => {
    const d = 'M604 498C600 476 606 464 622 462C638 464 644 476 640 498Z';
    ground(622, 498, 38, { h: 36 });
    R(d, '#3f7fb0', st('#3f7fb0', 1.6));
    R('M608 482C612 474 632 474 636 482V494H608Z', '#2f6a9a', st('#2f6a9a', 1.2));
    R('M612 462C612 452 632 452 632 462', '#e2583a', st('#c8402f', 1.4));
    shadow(d, SHADE, 8, 0.3);
    rim(d, GOLD, 1.6, 0.9);
    ink(`<path d="M614 470v10M630 470v10" stroke="${INK}" stroke-width="1.2" stroke-opacity=".6"/>`);
  });
  group('campfire', 'Nuotio', 'Campfire', () => {
    add(`<circle cx="548" cy="500" r="48" fill="url(#rk-fireGlow)" data-anim="glow"/>`);
    for (const [x, y] of [[524, 508], [534, 512], [548, 514], [562, 512], [572, 507]]) R(blob({ seed: x, cx: x, cy: y, r: 7, ry: 4.5, lobes: 4, scallop: 0.05, wobble: 0.12 }), '#9a96ae', st('#9a96ae', 1.1));
    R('M528 504L566 496L568 501L530 509Z', '#6e4a34', st('#6e4a34', 1.2));
    R('M532 496L568 506L564 510L528 501Z', '#7a5236', st('#7a5236', 1.2));
    add('<g data-anim="flicker">');
    R('M536 502C532 488 542 482 546 468C550 480 560 484 560 500C556 508 540 508 536 502Z', 'url(#rk-fire)', st('#e2583a', 1.2));
    add(`<path d="M544 500C542 492 546 488 548 482C551 490 554 492 553 500Z" fill="#fff6c8"/>`);
    add('</g>');
    smoke(548, 470, { h: 110, w: 6, lean: 30, colour: '#f2f0f8', seed: 5 });
    add(`<ellipse cx="548" cy="512" rx="70" ry="16" fill="#ffc870" opacity=".25" filter="url(#rk-soft8)" data-anim="flicker"/>`);
  });
  group('pot', 'Nokipannu', 'Coffee pot', () => {
    ink(`<path d="M512 512L540 452M584 512L556 452M540 452H556" fill="none" stroke="#5a3a2c" stroke-width="2.4" stroke-linecap="round"/>`);
    ink(`<path d="M548 452V462" stroke="${INK}" stroke-width="1.2"/>`);
    const d = 'M538 478C536 468 540 462 548 462C556 462 560 468 558 478Z';
    R(d, '#3a3440', st('#3a3440', 1.4));
    R('M558 470L566 466L564 470L558 474Z', '#3a3440', st('#3a3440', 1));
    rim(d, '#ffb070', 1.6, 0.8);
  });

  // ---------------------------------------------------------------- rock with reindeer lichen
  const rockD = rock({ seed: 3, cx: 250, cy: 520, w: 120, h: 50 });
  group('rock', 'Kivi', 'Boulder', () => {
    ground(250, 528, 120, { h: 50, colour: SHADE });
    R(rockD, '#a8a4bc', st('#a8a4bc', 2));
    shadow(rockD, SHADE, 22, 0.35);
    rim(rockD, GOLD, 3, 0.9);
    lichen(7, 26, 190, 310, 470, 530, () => true, ['#e0954a', '#9aa86a', '#e8e2d0'], 0.6);
  });
  group('reindeerLichen', 'Poronjäkälä', 'Reindeer lichen', () => {
    const Rn = rng(8);
    for (const [cx, cy, n] of [[200, 528, 7], [312, 534, 6], [92, 560, 5], [714, 532, 6]]) {
      for (let i = 0; i < n; i++) {
        const x = cx + (Rn() - 0.5) * 40, y = cy + (Rn() - 0.5) * 8, r = 6 + Rn() * 5;
        const d = blob({ seed: Math.floor(x * 13 + y), cx: x, cy: y, r, ry: r * 0.7, lobes: 8, scallop: 0.35, wobble: 0.1, n: 48 });
        R(d, '#e6e6d4', st('#bdbfa8', 1));
        add(`<path d="${d}" fill="#ffffff" opacity=".5" transform="translate(-1.2 -1.2)"/>`);
      }
    }
  });

  // ---------------------------------------------------------------- dwarf birch scrub
  group('scrub', 'Vaivaiskoivut', 'Dwarf birches', () => {
    for (const [x, y, w, seed] of [[700, 520, 46, 1], [770, 540, 40, 2], [36, 512, 40, 3], [420, 452, 30, 4]]) {
      const d = blob({ seed: seed * 7, cx: x, cy: y, r: w, ry: w * 0.42, lobes: 12, scallop: 0.28, wobble: 0.12 });
      R(d, '#d2502f', st('#d2502f', 1.4));
      shadow(d, '#6a1d2a', w * 0.4, 0.35);
      rim(d, '#ffd08a', 2, 0.8);
      add(leafScatter({ seed: seed * 11, cx: x, cy: y - 2, rx: w * 0.9, ry: w * 0.35, n: 24, size: 3, colours: ['#f08a3a', '#ffb050', '#b8382a'] }));
    }
  });

  // ---------------------------------------------------------------- golden birch (right) and rowan (left)
  group('birchTrunk', 'Koivun runko', 'Birch trunk', () => {
    const b = birchForm({ seed: 4, x: 768, top: 120, w: 13, lean: -18, ink: INK, base: 612 });
    R(b.trunk, '#f7f2e8', st('#cfc6d8', 2.2));
    shadow(b.trunk, '#8a86b8', 8, 0.4);
    for (const m of [...b.marks, ...b.twigs]) ink(m);
  });
  group('birchCrown', 'Koivun kultalehdet', 'Golden birch leaves', () => {
    add('<g data-anim="sway-slow">');
    for (const bl of crownBlobs({ seed: 51, cx: 740, cy: 150, rx: 110, ry: 110, n: 13, size: [20, 34], lobes: 9, hang: 60 })) {
      R(bl.d, 'url(#rk-gold)', st('#e3a12e', 1.8));
      shadow(bl.d, '#8a4a1e', bl.r * 0.5, 0.3);
      rim(bl.d, '#fff3b0', 2.2, 0.85);
    }
    add(leafScatter({ seed: 52, cx: 740, cy: 160, rx: 120, ry: 130, n: 110, size: 4.5, colours: ['#ffd35e', '#f2b23a', '#ffe48a', '#e8962a'] }));
    add('</g>');
  });
  group('fallingLeaves', 'Putoavat lehdet', 'Falling leaves', () => {
    const Rn = rng(77);
    for (let i = 0; i < 12; i++) {
      const x = 600 + Rn() * 190, y = 230 + Rn() * 140;
      R(`M${f(x)} ${f(y)}c4 -6 10 -6 12 0c-2 6 -8 6 -12 0Z`, ['#f0a03c', '#e8c04a', '#e2733d'][i % 3], `${st('#c8701e', 1)} data-anim="fall" style="animation-delay:-${f(i * 0.7)}s"`);
    }
  });
  group('rowanTrunk', 'Pihlajan runko', 'Rowan trunk', () => {
    const N = noise1(5);
    const L = [], Rr = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, y = 604 - t * 250, cx = 46 + N(t * 2, 2) * 8 + t * 10, w = 14 - t * 9;
      L.push([cx - w, y]); Rr.push([cx + w, y]);
    }
    const d = smooth([...L, ...Rr.reverse()], true);
    R(d, '#7a6052', st('#7a6052', 2));
    rim(d, GOLD, 2, 0.8);
    ink(`<path d="M54 470q-24 -30 -44 -40M60 420q26 -20 46 -56M52 520q-6 -10 -12 -14" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`);
  });
  group('rowanCrown', 'Pihlajan lehdet', 'Rowan leaves', () => {
    add('<g data-anim="sway-slow">');
    for (const bl of crownBlobs({ seed: 61, cx: 60, cy: 330, rx: 100, ry: 80, n: 11, size: [20, 32], lobes: 9, hang: 30 })) {
      R(bl.d, 'url(#rk-rowan)', st('#c8442e', 1.8));
      shadow(bl.d, '#6a1d2a', bl.r * 0.5, 0.3);
      rim(bl.d, '#ffd8a0', 2.2, 0.85);
    }
    add(leafScatter({ seed: 62, cx: 60, cy: 330, rx: 110, ry: 90, n: 80, size: 4.5, colours: ['#ff9b5e', '#e2573a', '#ffb070', '#c4472f'] }));
    add('</g>');
  });
  group('rowanBerries', 'Pihlajanmarjat', 'Rowan berries', () => {
    const Rn = rng(62);
    for (const [cx, cy] of [[22, 352], [86, 322], [74, 372], [124, 350], [40, 300]]) {
      for (let i = 0; i < 8; i++) {
        const a = Rn() * Math.PI * 2, d = Math.sqrt(Rn()) * 10;
        const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7;
        C(x, y, 3.8, '#d42a2a', st('#a01a1a', 1));
        add(`<circle cx="${f(x - 1.2)}" cy="${f(y - 1.2)}" r="1.2" fill="#ffd0b0" opacity=".9"/>`);
      }
    }
  });

  // ---------------------------------------------------------------- the fox
  const fox = {
    body: 'M-18 40C-24 10 -14 -14 4 -18C16 -20 24 -6 20 12C18 26 14 38 10 42Z',
    chest: 'M8 -14C16 -6 18 8 12 24C6 16 2 0 8 -14Z',
    head: 'M0 -20C-3 -34 8 -44 20 -40L36 -33C38 -29 32 -25 25 -26C20 -21 12 -18 4 -18Z',
    cheek: 'M20 -29C26 -27 31 -29 36 -33C32 -25 25 -23 17 -24Z',
    earA: 'M3 -34L0 -52L12 -40Z', earB: 'M12 -39L18 -54L22 -38Z',
    tail: 'M-16 30C-34 34 -34 52 -12 54C8 56 26 52 34 44C30 38 22 42 12 44C-2 46 -12 42 -10 32Z',
    tip: 'M34 44C30 38 22 42 16 43C20 48 28 50 36 48C38 46 37 44 34 44Z',
  };
  const FX = 'translate(318 500) scale(1.05)';
  group('fox', 'Kettu', 'Fox', () => {
    ground(318, 546, 70, { h: 60, colour: SHADE });
    add(`<g transform="${FX}">`);
    R(fox.body, 'url(#rk-fox)', st('#e2702a', 1.8));
    shadow(fox.body, '#7a2a1e', 10, 0.35);
    R(fox.chest, '#fff7ee', st('#d9cfc0', 1.3));
    R(fox.earA, '#e2702a', st('#b8521e', 1.4));
    R(fox.earB, '#d8662a', st('#b8521e', 1.4));
    R(fox.head, 'url(#rk-fox)', st('#e2702a', 1.8));
    R(fox.cheek, '#fff7ee', st('#d9cfc0', 1.2));
    rim(fox.body, GOLD, 2.2, 0.9);
    rim(fox.head, GOLD, 1.8, 0.9);
    ink(`<path d="M4 -46L8 -40M15 -48L18 -41" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`);
    ink(`<path d="M18 -35q3 -2 5 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`);
    ink(`<circle cx="36" cy="-33" r="2.2" fill="${INK}"/>`);
    // front legs: orange above, dark socks tapering to small paws
    R('M7 18C6 28 6 36 5 44C8 46 12 46 14 44C13 36 14 28 15 20Z', '#e2702a', st('#b8521e', 1.2));
    R('M5 36C5 40 4 43 4 45C8 47 12 47 14 45C14 42 13 39 13 36Z', '#4a2a22', st('#3a221c', 1));
    add('</g>');
  });
  group('foxTail', 'Ketun häntä', 'Fox tail', () => {
    add(`<g transform="${FX}"><g data-anim="sway-slow" style="transform-origin:10% 50%">`);
    R(fox.tail, 'url(#rk-fox)', st('#e2702a', 1.8));
    R(fox.tip, '#fff7ee', st('#d9cfc0', 1.3));
    shadow(fox.tail, '#7a2a1e', 6, 0.35);
    rim(fox.tail, GOLD, 2, 0.9);
    add('</g></g>');
  });

  // ---------------------------------------------------------------- mushrooms + berries
  const moss = (x, y, w) => add(`<path d="${blob({ seed: Math.round(x * 3 + y), cx: x, cy: y, r: w, ry: w * 0.3, lobes: 13, scallop: 0.3, wobble: 0.1 })}" fill="#7a9a3e" stroke="#4f6a2a" stroke-width=".8"/>`);
  const fly = (x, y, s) => {
    ground(x, y, 34 * s, { h: 40 * s, colour: SHADE, op: 0.25 });
    moss(x + 2, y + 1, 26 * s);
    add(`<g transform="translate(${x} ${y}) scale(${s})">`);
    const stem = 'M-6 0C-7 -10 -5 -20 -4 -26H4C5 -20 7 -10 6 0Z', cap = 'M-24 -24C-22 -44 22 -44 24 -24C12 -20 -12 -20 -24 -24Z';
    R(stem, '#fbf3e4', st('#d9cfc0', 1.6));
    R('M-8 -16C-4 -13 4 -13 8 -16L7 -12C3 -10 -3 -10 -7 -12Z', '#fbf3e4', st('#d9cfc0', 1.2));
    R(cap, '#e03a2f', st('#b8221f', 1.8));
    shadow(cap, '#6a1020', 8, 0.3);
    rim(cap, '#ffd0a0', 1.8, 0.9);
    for (const [dx, dy, rr] of [[-12, -32, 3.2], [2, -36, 3.6], [13, -29, 2.8], [-3, -27, 2.4], [16, -36, 2]]) add(`<circle cx="${dx}" cy="${dy}" r="${rr}" fill="#fffaf0"/>`);
    add('</g>');
  };
  group('flyAgaric', 'Kärpässienet', 'Fly agarics', () => { fly(170, 566, 0.72); fly(196, 576, 0.5); });
  group('chanterelle', 'Kantarellit', 'Chanterelles', () => {
    moss(644, 578, 34);
    for (const [x, y, s] of [[640, 574, 0.7], [656, 580, 0.55], [626, 582, 0.5]]) {
      const d = `M${x - 4 * s} ${y}C${x - 3 * s} ${y - 8 * s} ${x - 14 * s} ${y - 14 * s} ${x - 16 * s} ${y - 20 * s}C${x - 6 * s} ${y - 24 * s} ${x + 6 * s} ${y - 24 * s} ${x + 16 * s} ${y - 20 * s}C${x + 14 * s} ${y - 14 * s} ${x + 3 * s} ${y - 8 * s} ${x + 4 * s} ${y}Z`;
      R(d, '#f4b23a', st('#c8801e', 1.4));
      rim(d, '#fff0b0', 1.4, 0.9);
    }
  });
  group('porcini', 'Herkkutatti', 'Porcini', () => {
    ground(560, 590, 34, { h: 30, colour: SHADE });
    moss(560, 590, 30);
    const stem = 'M550 590C548 580 549 573 553 568H567C571 573 572 580 570 590Z', cap = 'M541 570C542 552 578 552 579 570C567 574 553 574 541 570Z';
    R(stem, '#f3e3c4', st('#d9c4a0', 1.6));
    R(cap, '#8a5a34', st('#6a4024', 1.8));
    shadow(cap, '#3a2010', 8, 0.3);
    rim(cap, GOLD, 2, 0.9);
  });
  group('blueberries', 'Mustikat', 'Blueberries', () => {
    const Rn = rng(81);
    for (let i = 0; i < 12; i++) {
      const x = 470 + (Rn() - 0.5) * 100, y = 560 + (Rn() - 0.5) * 30;
      add(`<path d="M${f(x)} ${f(y)}c6 -8 14 -8 16 0c-6 6 -12 6 -16 0Z" fill="${['#5f9a4e', '#c4472f', '#7fae5a'][i % 3]}" stroke="#2f5f34" stroke-width=".8"/>`);
    }
    for (let i = 0; i < 10; i++) {
      const x = 470 + (Rn() - 0.5) * 84, y = 566 + (Rn() - 0.5) * 24;
      C(x, y, 4.6, '#3b4f9a', st('#2a3a7a', 1.1));
      add(`<circle cx="${f(x - 1.5)}" cy="${f(y - 1.5)}" r="1.4" fill="#c8d4ff" opacity=".8"/>`);
    }
  });
  group('lingonberries', 'Puolukat', 'Lingonberries', () => {
    const Rn = rng(82);
    for (let i = 0; i < 10; i++) {
      const x = 96 + (Rn() - 0.5) * 70, y = 584 + (Rn() - 0.5) * 20;
      add(`<path d="M${f(x)} ${f(y)}c5 -6 11 -6 13 0c-5 5 -9 5 -13 0Z" fill="#3f7a46" stroke="#2f5f34" stroke-width=".8"/>`);
    }
    for (let i = 0; i < 12; i++) {
      const x = 96 + (Rn() - 0.5) * 60, y = 586 + (Rn() - 0.5) * 18;
      C(x, y, 3.6, '#e0302a', st('#a01a1a', 1));
      add(`<circle cx="${f(x - 1.2)}" cy="${f(y - 1.2)}" r="1.1" fill="#ffd0c0" opacity=".9"/>`);
    }
  });

  return S.build();
}
