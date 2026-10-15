// "Mökkikesä" — summer cottage by the lake, cozy picture-book style.
import { createScene, cloudPath, circ, spruceLine } from './lib.mjs';

const S = createScene({ id: 'mokki', title: 'Mökkikesä', titleEn: 'Cottage Summer', seed: 7 });
const { INK, R, C, E, add, ink, group, r, f, rnd } = S;

S.def(`<linearGradient id="mk-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5b5aa6"/><stop offset=".38" stop-color="#b98bc0"/>
    <stop offset=".72" stop-color="#f7b2a0"/><stop offset="1" stop-color="#ffd9a0"/></linearGradient>
  <radialGradient id="mk-sunGlow"><stop offset="0" stop-color="#fff4c9" stop-opacity=".95"/>
    <stop offset=".35" stop-color="#ffd38a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb38a" stop-opacity="0"/></radialGradient>
  <radialGradient id="mk-sun" cx=".45" cy=".4"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#ffcf6e"/></radialGradient>
  <linearGradient id="mk-lake" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f3b9a8"/><stop offset=".25" stop-color="#b996c4"/>
    <stop offset=".7" stop-color="#6b78b9"/><stop offset="1" stop-color="#46589e"/></linearGradient>
  <linearGradient id="mk-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fbf6a"/><stop offset="1" stop-color="#4f8a52"/></linearGradient>
  <linearGradient id="mk-grassBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#79a960"/><stop offset="1" stop-color="#5b9157"/></linearGradient>
  <linearGradient id="mk-roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4d4766"/><stop offset="1" stop-color="#2f2b44"/></linearGradient>
  <linearGradient id="mk-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c94a3c"/><stop offset="1" stop-color="#a5352f"/></linearGradient>
  <radialGradient id="mk-window" cx=".5" cy=".6"><stop offset="0" stop-color="#fff2b8"/><stop offset="1" stop-color="#ffbf5e"/></radialGradient>
  <radialGradient id="mk-leaf" cx=".35" cy=".3"><stop offset="0" stop-color="#b5d77a"/><stop offset="1" stop-color="#5f9a4e"/></radialGradient>
  <radialGradient id="mk-leafDark" cx=".35" cy=".3"><stop offset="0" stop-color="#8cc06a"/><stop offset="1" stop-color="#3f7a46"/></radialGradient>
  <clipPath id="mk-lakeClip"><rect x="0" y="338" width="800" height="200"/></clipPath>`);

const soft = `stroke="${INK}" stroke-opacity=".18" stroke-width="1.5"`;

// ---------- sky ----------
group('sky', 'Taivas', 'Sky', () => {
  R('M0 0H800V345H0Z', 'url(#mk-sky)');
  for (const [x, y, s] of [[260, 170, 1], [285, 158, .8], [300, 178, .65], [640, 95, .9]]) {
    ink(`<path d="M${x} ${y}q${6 * s} ${-7 * s} ${12 * s} 0q${6 * s} ${-7 * s} ${12 * s} 0" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="2" stroke-linecap="round" data-anim="bob"/>`);
  }
});
group('sun', 'Aurinko', 'Sun', () => {
  add(`<circle cx="560" cy="300" r="150" fill="url(#mk-sunGlow)" data-anim="glow"/>`);
  R('M560 258a42 42 0 1 1 0 84a42 42 0 1 1 0-84Z', 'url(#mk-sun)', 'stroke="#ffe7a6" stroke-width="2"');
});
[[140, 120, 1.3, '#f6d1d8'], [330, 70, .9, '#e9c5df'], [690, 150, 1.1, '#fbd8cf'], [450, 190, .7, '#fde0cf']].forEach(([x, y, s, c], i) => {
  group(`cloud${i}`, 'Pilvi', 'Cloud', () => R(cloudPath(x, y, s), c, `${soft} data-anim="drift"`));
});

// ---------- far hills + forest line ----------
group('hills', 'Kaukaiset kukkulat', 'Far hills', () =>
  R('M0 318C90 286 170 300 250 292S420 262 520 286 700 270 800 292V345H0Z', '#9a8cc6', 'opacity=".9"'));
group('hills2', 'Kukkulat', 'Hills', () =>
  R('M0 330C120 312 230 326 330 316S520 304 640 318 760 310 800 316V345H0Z', '#7d76b3'));
S.seed(11);
const forestD = spruceLine(S, 342, 18, 40, 22);
group('forest', 'Metsä', 'Forest', () => R(forestD, '#4f5c8f'));

// ---------- lake ----------
group('lake', 'Järvi', 'Lake', () => {
  R('M0 340H800V520H0Z', 'url(#mk-lake)');
  S.seed(11);
  add(`<path d="${spruceLine(S, 340, 18, 40, 22, true)}" fill="#4f5c8f" opacity=".28" clip-path="url(#mk-lakeClip)"/>`);
  for (let i = 0; i < 16; i++) {
    const y = 350 + i * 9 + i * i * .35;
    const w = 70 - i * 3.2 + r(-8, 8);
    add(`<rect x="${f(560 - w / 2 + r(-6, 6))}" y="${f(y)}" width="${f(w)}" height="${f(2.6 + i * .12)}" rx="2" fill="#ffe3a3" opacity="${f(.85 - i * .045)}" data-anim="shimmer" style="animation-delay:-${f(i * .37)}s"/>`);
  }
  S.seed(5);
  for (let i = 0; i < 26; i++) {
    const x = r(20, 780), y = r(360, 480), w = r(10, 34);
    if (Math.abs(x - 560) < 50) continue;
    add(`<path d="M${f(x)} ${f(y)}h${f(w)}" stroke="#fff" stroke-opacity="${f(r(.15, .4))}" stroke-width="2" stroke-linecap="round" data-anim="shimmer" style="animation-delay:-${f(i * .53)}s"/>`);
  }
});

group('shore', 'Ranta', 'Shore', () =>
  R('M0 392C60 378 140 372 220 386C280 396 300 412 310 430H0Z', 'url(#mk-grassBack)', `stroke="${INK}" stroke-opacity=".35" stroke-width="2"`));

// ---------- cottage ----------
const cg = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"`;
group('chimney', 'Savupiippu', 'Chimney', () => {
  add(`<g ${cg}>`);
  R('M178 300h18v40h-18Z', '#7a6a72');
  R('M174 294h26v9h-26Z', '#5d5060');
  add('</g>');
  for (const [x, y, rr, o, d] of [[192, 278, 9, .55, 0], [204, 258, 12, .45, 1], [222, 236, 15, .35, 2], [246, 214, 18, .25, 3]]) {
    add(`<circle cx="${x}" cy="${y}" r="${rr}" fill="#fff" opacity="${o}" data-anim="smoke" style="animation-delay:-${d * 1.1}s"/>`);
  }
});
group('walls', 'Mökin seinät', 'Cottage walls', () => {
  add(`<g ${cg}>`);
  R('M70 360H226V438H70Z', 'url(#mk-wall)');
  add('</g>');
  for (let y = 372; y < 438; y += 12) ink(`<path d="M72 ${y}H224" stroke="#7f2a26" stroke-opacity=".35" stroke-width="1.5"/>`);
});
group('gable', 'Pääty', 'Gable', () => R('M78 360L148 312L218 360Z', '#b8433a', cg));
group('roof', 'Katto', 'Roof', () => R('M52 366L148 296L244 366L234 372L148 310L62 372Z', 'url(#mk-roof)', cg));
group('trim', 'Valkoiset listat', 'White trim', () => {
  add(`<g ${cg}>`);
  R('M66 360h9v80h-9Z', '#f4ece0');
  R('M221 360h9v80h-9Z', '#f4ece0');
  for (const x of [86, 178]) {
    R(`M${x - 4} 376h40v34h-40Z`, '#f4ece0');
    R(`M${x - 6} 410h44v5h-44Z`, '#f4ece0');
  }
  add('</g>');
});
group('windows', 'Ikkunat', 'Windows', () => {
  add(`<g ${cg}>`);
  R('M148 330a10 10 0 1 1 0 20a10 10 0 1 1 0-20Z', 'url(#mk-window)', 'data-anim="flicker"');
  ink('<path d="M148 330v20M138 340h20" stroke-width="1.8"/>');
  for (const x of [86, 178]) {
    R(`M${x} 380h32v26h-32Z`, 'url(#mk-window)', 'data-anim="flicker"');
    ink(`<path d="M${x + 16} 380v26M${x} 393h32" stroke="#f4ece0" stroke-width="3"/>`);
  }
  add('</g>');
});
group('flowerbox', 'Kukkalaatikot', 'Flower boxes', () => {
  add(`<g ${cg}>`);
  for (const x of [86, 178]) {
    R(`M${x - 2} 415h36v8h-36Z`, '#8a5a3c');
    for (let k = 0; k < 5; k++) add(`<circle cx="${x + 2 + k * 7}" cy="413" r="3.2" fill="${['#ff8fa3', '#ffd166', '#ff8fa3', '#f6f1ff', '#ffd166'][k]}" stroke-width="1.2"/>`);
  }
  add('</g>');
});
group('door', 'Ovi', 'Door', () => {
  add(`<g ${cg}>`);
  R('M134 384h28v54h-28Z', '#5b8fb5');
  R('M138 388h20v18h-20Z', '#7db0d4', 'stroke-width="1.5"');
  add('</g>');
  ink(`<circle cx="156" cy="414" r="2" fill="${INK}"/>`);
});
group('steps', 'Portaat', 'Steps', () => {
  add(`<g ${cg}>`);
  R('M128 438h40v6h-40Z', '#a99a8f');
  R('M124 444h48v6h-48Z', '#8f8078');
  add('</g>');
});

// ---------- jetty + boat ----------
const jg = `stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;
group('posts', 'Laiturin tolpat', 'Jetty posts', () => {
  for (const x of [318, 362, 406, 446]) {
    add(`<rect x="${x - 3}" y="452" width="6" height="22" fill="#2f2b44" opacity=".25"/>`);
    R(`M${x - 4} 434h8v22h-8Z`, '#6e5040', jg);
  }
});
group('jetty', 'Laituri', 'Jetty', () => {
  R('M290 428L456 428L460 438L286 440Z', '#c8955f', jg);
  for (let x = 300; x < 456; x += 12) ink(`<path d="M${x} 428.5l-1 10.5" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2"/>`);
  R('M286 440L460 438L460 443L286 445Z', '#8e6243', jg);
});
group('boat', 'Soutuvene', 'Rowboat', () => {
  add(`<g data-anim="rock">`);
  add(`<ellipse cx="515" cy="472" rx="58" ry="5" fill="#2f2b44" opacity=".2"/>`);
  add(`<g ${jg}>`);
  R('M462 452C478 470 548 474 572 452Z', '#f4ece0');
  R('M462 452C478 462 548 464 572 452L568 448H466Z', '#d9534f');
  R('M466 448H568L566 444H468Z', '#8e6243');
  ink(`<path d="M492 446v6M542 446v6" stroke="${INK}" stroke-width="2"/>`);
  add('</g></g>');
  ink(`<path d="M466 449C462 446 460 442 456 438" fill="none" stroke="${INK}" stroke-width="1.5"/>`);
});
group('oar', 'Airo', 'Oar', () => R('M500 440L548 430L549 434L501 444Z', '#c8955f', `${jg} stroke-width="1.6"`));

// ---------- flag ----------
group('pole', 'Lipputanko', 'Flagpole', () => {
  R('M262 300h4v96h-4Z', '#f4ece0', jg);
  C(264, 298, 4, '#ffd166', jg);
});
group('flag', 'Suomen lippu', 'Finnish flag', () => {
  add('<g data-anim="wave">');
  R('M266 304C282 300 296 310 312 304V334C296 340 282 330 266 334Z', '#ffffff');
  add(`<path d="M266 314.5C282 311 296 321 312 315V323C296 329 282 319 266 322.5Z" fill="#2f5fb3"/>`);
  add(`<path d="M276 302.5C278 302 280 302.3 282 303V333C280 332.3 278 332 276 332.3Z" fill="#2f5fb3"/>`);
  ink(`<path d="M266 304C282 300 296 310 312 304V334C296 340 282 330 266 334Z" fill="none" stroke="${INK}" stroke-width="2"/>`);
  add('</g>');
});

// ---------- ducks ----------
const duck = (key, x, y, s) => group(key, 'Sorsa', 'Duck', () => {
  add(`<g transform="translate(${x} ${y}) scale(${s})"><g data-anim="paddle" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round">`);
  add(`<ellipse cx="0" cy="9" rx="16" ry="2.5" fill="#2f2b44" opacity=".2" stroke="none"/>`);
  R('M-14 2C-14 -6 6 -8 12 -2C16 2 12 8 0 8C-10 8 -14 6 -14 2Z', '#a07a5a');
  R('M6 -4C4 -14 14 -16 16 -9C17 -6 14 -4 12 -2Z', '#3f7a5a');
  R('M16 -10L22 -8L16 -6Z', '#ffb347');
  ink(`<circle cx="13" cy="-10" r="1.2" fill="${INK}" stroke="none"/>`);
  ink(`<path d="M-8 0C-4 -2 0 -1 3 2" fill="none" stroke-opacity=".5"/>`);
  add('</g></g>');
});
duck('duck0', 380, 392, 1);
duck('duck1', 410, 400, .8);

// ---------- rocks ----------
group('rock0', 'Kivi', 'Rock', () => {
  R('M232 452C236 432 268 428 282 446C288 456 276 462 254 462C238 462 230 460 232 452Z', '#a7a3b8', jg);
  add('<path d="M248 438C256 434 268 436 272 442" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>');
});
group('rock1', 'Kivi', 'Rock', () => R('M600 486C606 470 640 468 650 484C652 494 610 496 600 486Z', '#9a96ae', jg));

// ---------- meadow ----------
group('meadow', 'Niitty', 'Meadow', () => {
  R('M0 448C120 436 230 458 330 476C430 494 540 500 640 488C710 480 760 476 800 478V600H0Z', 'url(#mk-grass)', `stroke="${INK}" stroke-opacity=".4" stroke-width="2"`);
  S.seed(21);
  for (let i = 0; i < 70; i++) {
    const x = r(0, 800), y = r(500, 598);
    if (x > 170 && x < 262 && y > 520) continue;
    const h = r(8, 18);
    add(`<path d="M${f(x)} ${f(y)}q-3 ${f(-h * .6)} -6 ${f(-h)}M${f(x)} ${f(y)}q1 ${f(-h * .7)} 2 ${f(-h * 1.2)}M${f(x)} ${f(y)}q4 ${f(-h * .5)} 8 ${f(-h * .8)}" fill="none" stroke="#3f7a46" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>`);
  }
  S.seed(30);
  for (let i = 0; i < 22; i++) {
    const x = r(130, 640), y = r(520, 595);
    if (x > 170 && x < 262) continue;
    add(`<g transform="translate(${f(x)} ${f(y)})">` +
      [0, 72, 144, 216, 288].map((a) => `<ellipse rx="2.2" ry="4.2" transform="rotate(${a}) translate(0 -4)" fill="#fff" stroke="${INK}" stroke-opacity=".3" stroke-width=".8"/>`).join('') +
      `<circle r="2.3" fill="#ffc94d"/></g>`);
  }
});
group('path', 'Polku', 'Path', () =>
  R('M180 600C200 560 240 520 286 488C300 478 304 470 300 462C318 472 320 486 304 500C266 532 252 566 250 600Z', '#e2c08f', `stroke="${INK}" stroke-opacity=".35" stroke-width="2"`));

// ---------- birches ----------
const foliage = (cx, cy, n, spread, grad) => {
  for (let i = 0; i < n; i++) {
    const x = cx + r(-spread, spread), y = cy + r(-spread * .7, spread * .7), rr = r(15, 28);
    R(circ(f(x), f(y), f(rr)), grad, `stroke="${INK}" stroke-opacity=".35" stroke-width="2"`);
  }
};
const birch = (x, lean, top, w) => {
  const d = `M${x - w} 600C${x - w + lean * .3} 500 ${x - w * .6 + lean * .8} 380 ${x - w * .4 + lean} ${top}` +
    `L${x + w * .4 + lean} ${top}C${x + w * .6 + lean * .8} 380 ${x + w + lean * .3} 500 ${x + w} 600Z`;
  R(d, '#f7f2e8', `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"`);
  for (let y = top + 20; y < 590; y += r(18, 34)) {
    const t = (y - top) / (600 - top);
    const cx = x + lean * (1 - t) * .9;
    const ww = w * (.4 + t * .6);
    const side = rnd() > .5 ? 1 : -1;
    ink(`<path d="M${f(cx + side * ww)} ${f(y)}q${f(-side * ww * .6)} 2 ${f(-side * ww * r(.6, 1.1))} ${f(r(-2, 3))}" fill="none" stroke="${INK}" stroke-width="${f(r(2.5, 4))}" stroke-linecap="round" opacity=".85"/>`);
  }
};
S.seed(3);
group('leavesBack', 'Koivun lehvästö', 'Birch leaves', () => { add('<g data-anim="sway-slow">'); foliage(700, 95, 26, 110, 'url(#mk-leafDark)'); add('</g>'); });
group('birch0', 'Koivu', 'Birch', () => birch(690, -18, 120, 13));
group('birch1', 'Koivu', 'Birch', () => birch(748, 14, 60, 15));
S.seed(4);
group('leaves', 'Koivun lehdet', 'Birch leaves', () => {
  add('<g data-anim="sway-slow">');
  foliage(730, 120, 22, 95, 'url(#mk-leaf)');
  S.seed(9);
  for (let i = 0; i < 40; i++) {
    const x = r(600, 800), y = r(150, 260);
    add(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="4" ry="6.5" transform="rotate(${f(r(-40, 40))} ${f(x)} ${f(y)})" fill="${rnd() > .5 ? '#9cc96e' : '#6fa557'}" stroke="${INK}" stroke-opacity=".4" stroke-width="1"/>`);
  }
  add('</g>');
});

// ---------- lupines ----------
const lupine = (x, y, h, c1, c2) => {
  add(`<g data-anim="sway" style="animation-delay:-${f(rnd() * 3)}s">`);
  ink(`<path d="M${x} ${y}V${y - h}" stroke="#4f8a52" stroke-width="2.5"/>`);
  const n = Math.round(h / 7);
  for (let i = 0; i < n; i++) {
    const t = i / n, yy = y - 18 - i * (h - 18) / n, s = 1.3 - t * .8;
    R(`M${f(x - 7 * s)} ${f(yy)}a${f(7 * s)} ${f(4.5 * s)} 0 1 0 ${f(14 * s)} 0a${f(7 * s)} ${f(4.5 * s)} 0 1 0 ${f(-14 * s)} 0Z`, t > .6 ? c2 : c1, `stroke="${INK}" stroke-opacity=".5" stroke-width="1.2"`);
  }
  for (const a of [-50, -10, 30, 70, 110, 150, 190]) {
    const rad = a * Math.PI / 180;
    add(`<path d="M${x} ${y - 6}l${f(Math.cos(rad) * 13)} ${f(-Math.abs(Math.sin(rad)) * 8 - 2)}" stroke="#5a9a55" stroke-width="3" stroke-linecap="round"/>`);
  }
  add('</g>');
};
S.seed(8);
const lupineSpots = [[40, 590, 95], [70, 596, 120], [104, 588, 82], [330, 594, 90], [362, 598, 112], [395, 590, 76], [560, 596, 100], [592, 592, 78]];
const lupinePalettes = [['#8b6fd1', '#c7b3ff'], ['#e86fa8', '#ffc0dc'], ['#6f8fe0', '#b8ccff'], ['#f3f0ff', '#ffffff']];
lupineSpots.forEach(([x, y, h], i) => {
  const [a, b] = lupinePalettes[i % lupinePalettes.length];
  group(`lupine${i}`, 'Lupiini', 'Lupine', () => lupine(x, y, h, a, b));
});

S.build('mokki.svg');
