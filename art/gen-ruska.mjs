// "Ruska" — Lapland autumn: fells in autumn colours, a kota by the lake, a fox and mushrooms.
import { createScene, cloudPath, circ, spruceLine, sprucePath } from './lib.mjs';

const S = createScene({ id: 'ruska', title: 'Ruska', titleEn: 'Autumn Colours', seed: 17 });
const { INK, R, C, E, add, ink, group, r, f, rnd, pick } = S;
const line = (w = 2) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

S.def(`<linearGradient id="rk-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7fa6d9"/><stop offset=".55" stop-color="#bcd0ea"/><stop offset="1" stop-color="#f7dcc0"/></linearGradient>
  <radialGradient id="rk-sunGlow"><stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset=".4" stop-color="#ffe2a8" stop-opacity=".45"/><stop offset="1" stop-color="#ffd6a0" stop-opacity="0"/></radialGradient>
  <radialGradient id="rk-sun" cx=".45" cy=".4"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#ffe08a"/></radialGradient>
  <linearGradient id="rk-fellBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a99cc8"/><stop offset="1" stop-color="#8c86b8"/></linearGradient>
  <linearGradient id="rk-fell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98f6a"/><stop offset="1" stop-color="#a8664a"/></linearGradient>
  <linearGradient id="rk-lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3d6ee"/><stop offset=".5" stop-color="#7d9fd0"/><stop offset="1" stop-color="#5677b5"/></linearGradient>
  <linearGradient id="rk-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a24e"/><stop offset="1" stop-color="#8f6a32"/></linearGradient>
  <linearGradient id="rk-shore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a25a"/><stop offset="1" stop-color="#8d7a3e"/></linearGradient>
  <radialGradient id="rk-gold" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe07a"/><stop offset="1" stop-color="#e8a531"/></radialGradient>
  <radialGradient id="rk-rowan" cx=".35" cy=".3"><stop offset="0" stop-color="#ff9b5e"/><stop offset="1" stop-color="#d4502f"/></radialGradient>
  <clipPath id="rk-lakeClip"><rect x="0" y="352" width="800" height="110"/></clipPath>`);

// ---------- sky ----------
group('sky', 'Taivas', 'Sky', () => {
  R('M0 0H800V360H0Z', 'url(#rk-sky)');
  // geese flying south
  for (const [x, y, s, d] of [[200, 90, 1, 0], [218, 100, .9, .2], [236, 110, .8, .4], [218, 80, .9, .3], [236, 70, .8, .5], [254, 60, .7, .6]]) {
    ink(`<path d="M${x} ${y}q${6 * s} ${-6 * s} ${11 * s} 0q${5 * s} ${-6 * s} ${11 * s} 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" data-anim="bob" style="animation-delay:-${d}s"/>`);
  }
});
group('sun', 'Aurinko', 'Sun', () => {
  add(`<circle cx="620" cy="140" r="120" fill="url(#rk-sunGlow)" data-anim="glow"/>`);
  C(620, 140, 34, 'url(#rk-sun)', 'stroke="#ffe7a6" stroke-width="2"');
});
[[120, 150, 1.1, '#fbe6e0'], [420, 90, .8, '#f3e4f2'], [720, 230, .9, '#fde9d8']].forEach(([x, y, s, c], i) =>
  group(`cloud${i}`, 'Pilvi', 'Cloud', () => R(cloudPath(x, y, s), c, `stroke="${INK}" stroke-opacity=".2" stroke-width="1.5" data-anim="drift"`)));

// ---------- fells ----------
group('fellBack', 'Kaukainen tunturi', 'Distant fell', () =>
  R('M-10 330C60 300 120 230 210 190C260 168 300 168 345 190C420 228 470 290 560 320L560 362H-10Z', 'url(#rk-fellBack)', line(1.6)));
group('snowcap', 'Lumihuippu', 'Snowy top', () =>
  R('M232 182C262 166 300 166 330 182C318 192 306 186 296 196C284 186 272 198 262 190C252 198 242 190 232 182Z', '#f6f4ff', line(1.4)));
group('fell', 'Ruskatunturi', 'Autumn fell', () =>
  R('M330 362C400 320 470 250 560 222C610 207 650 210 700 230C750 250 780 280 810 300V362Z', 'url(#rk-fell)', line(1.8)));
group('ruskaSlope', 'Ruskan värit', 'Autumn colours', () => {
  S.seed(41);
  for (let i = 0; i < 16; i++) {
    const x = r(420, 790), y = r(250, 350);
    if (y < 330 - (x - 420) * 0.25 && x < 560) continue;
    const w = r(16, 34), h = r(8, 16);
    R(`M${f(x - w)} ${f(y)}c${f(w * .3)} ${f(-h)} ${f(w * 1.4)} ${f(-h)} ${f(w * 2)} 0c${f(-w * .4)} ${f(h * .6)} ${f(-w * 1.6)} ${f(h * .6)} ${f(-w * 2)} 0Z`,
      pick(['#e2733d', '#f0a03c', '#c4472f', '#e8c04a']), line(1.2));
  }
});
S.seed(23);
const forest = spruceLine(S, 364, 14, 34, 18);
group('forest', 'Kuusimetsä', 'Spruce forest', () => R(forest, '#3f6b5a', line(1.4)));

// ---------- lake ----------
group('lake', 'Tunturijärvi', 'Fell lake', () => {
  R('M0 360H800V470H0Z', 'url(#rk-lake)');
  S.seed(23);
  add(`<path d="${spruceLine(S, 362, 14, 34, 18, true)}" fill="#3f6b5a" opacity=".3" clip-path="url(#rk-lakeClip)"/>`);
  add(`<path d="M560 362C610 380 650 378 700 370" fill="none" stroke="#c98f6a" stroke-opacity=".35" stroke-width="8" stroke-linecap="round"/>`);
  for (let i = 0; i < 12; i++) {
    const y = 370 + i * 7;
    add(`<rect x="${f(600 - 28 + r(-8, 8))}" y="${y}" width="${f(56 - i * 3)}" height="2.5" rx="1.2" fill="#fff6d6" opacity="${f(.8 - i * .05)}" data-anim="shimmer" style="animation-delay:-${f(i * .4)}s"/>`);
  }
  S.seed(6);
  for (let i = 0; i < 20; i++) {
    const x = r(20, 780), y = r(380, 460), w = r(10, 30);
    add(`<path d="M${f(x)} ${f(y)}h${f(w)}" stroke="#fff" stroke-opacity="${f(r(.2, .45))}" stroke-width="2" stroke-linecap="round" data-anim="shimmer" style="animation-delay:-${f(i * .5)}s"/>`);
  }
});
group('island', 'Saari', 'Island', () => {
  R('M470 404C490 392 540 390 566 400C556 410 490 412 470 404Z', '#7d8a4a', line(1.6));
  add(`<path d="${sprucePath(500, 400, 34, 18)}" fill="#335a4a" stroke="${INK}" stroke-width="1.2"/>`);
  add(`<path d="${sprucePath(522, 398, 44, 22)}" fill="#3f6b5a" stroke="${INK}" stroke-width="1.2"/>`);
  add(`<path d="${sprucePath(542, 402, 28, 16)}" fill="#335a4a" stroke="${INK}" stroke-width="1.2"/>`);
});

// ---------- left shore + kota ----------
group('shore', 'Ranta', 'Shore', () =>
  R('M0 404C70 394 150 396 220 410C260 418 290 432 300 452L0 470Z', 'url(#rk-shore)', line(1.8)));
group('kota', 'Kota', 'Lapp hut', () => {
  add('<g transform="translate(176 12)">');
  R('M64 418L104 340L144 418Z', '#8a6248', line(2.2));
  ink(`<path d="M84 380L124 380M76 398L132 398" stroke="${INK}" stroke-opacity=".4" stroke-width="1.5"/>`);
  ink(`<path d="M98 346L94 332M110 346L116 330M104 340V328" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`);
  add('</g>');
});
group('kotaDoor', 'Kodan ovi', 'Hut door', () => { add('<g transform="translate(176 12)">'); R('M94 418L94 396C94 388 114 388 114 396L114 418Z', '#d94f3a', line(1.8)); add('</g>'); });
group('smoke', 'Savu', 'Smoke', () => {
  add('<g transform="translate(176 12)">');
  R('M100 318C94 300 112 296 106 282C102 270 116 262 112 248C120 262 118 270 122 280C126 292 112 300 116 316Z', '#eef0f6', `${line(1.4)} opacity=".9" data-anim="sway"`);
  for (const [x, y, rr, d] of [[108, 236, 8, 0], [116, 220, 11, 1.2], [128, 202, 14, 2.4]]) add(`<circle cx="${x}" cy="${y}" r="${rr}" fill="#fff" opacity=".5" data-anim="smoke" style="animation-delay:-${d}s"/>`);
  add('</g>');
});
group('campfire', 'Nuotio', 'Campfire', () => {
  add('<g transform="translate(170 16)">');
  R('M168 436L206 426L210 432L172 442Z', '#7a5134', line(1.6));
  R('M170 428L208 438L204 444L166 434Z', '#8f6040', line(1.6));
  add('<g data-anim="flicker">');
  R('M178 430C176 418 184 412 186 402C190 412 196 416 198 428C194 434 182 434 178 430Z', '#ffb347', line(1.6));
  add(`<path d="M184 428C183 422 187 418 188 414C190 420 193 422 192 428Z" fill="#ffe08a"/>`);
  add('</g></g>');
});

// ---------- foreground ground ----------
group('ground', 'Kangas', 'Heath', () => {
  R('M0 470C120 452 260 444 380 452C520 462 640 470 800 458V600H0Z', 'url(#rk-ground)', line(2));
  S.seed(12);
  for (let i = 0; i < 46; i++) {
    const x = r(0, 800), y = r(480, 596);
    const c = pick(['#e2733d', '#f0a03c', '#c4472f', '#e8c04a', '#b5552f']);
    add(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="5" ry="3" transform="rotate(${f(r(-60, 60))} ${f(x)} ${f(y)})" fill="${c}" stroke="${INK}" stroke-opacity=".35" stroke-width=".8"/>`);
  }
  for (let i = 0; i < 30; i++) {
    const x = r(0, 800), y = r(490, 598), h = r(6, 14);
    add(`<path d="M${f(x)} ${f(y)}q-2 ${f(-h * .6)} -4 ${f(-h)}M${f(x)} ${f(y)}q2 ${f(-h * .6)} 5 ${f(-h * .9)}" fill="none" stroke="#6b5326" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="round"/>`);
  }
});
group('path', 'Polku', 'Path', () =>
  R('M330 600C350 560 400 520 430 496C446 484 450 470 440 458C470 466 474 484 458 500C430 528 410 566 420 600Z', '#e6cf9e', line(1.6)));

// ---------- trees ----------
const birch = (x, lean, top, w) => {
  const d = `M${x - w} 600C${x - w + lean * .3} 520 ${x - w * .6 + lean * .8} 400 ${x - w * .4 + lean} ${top}` +
    `L${x + w * .4 + lean} ${top}C${x + w * .6 + lean * .8} 400 ${x + w + lean * .3} 520 ${x + w} 600Z`;
  R(d, '#f7f2e8', line(2.2));
  for (let y = top + 20; y < 590; y += r(18, 32)) {
    const t = (y - top) / (600 - top), cx = x + lean * (1 - t) * .9, ww = w * (.4 + t * .6), side = rnd() > .5 ? 1 : -1;
    ink(`<path d="M${f(cx + side * ww)} ${f(y)}q${f(-side * ww * .6)} 2 ${f(-side * ww * r(.6, 1))} ${f(r(-2, 3))}" fill="none" stroke="${INK}" stroke-width="${f(r(2.5, 4))}" stroke-linecap="round" opacity=".85"/>`);
  }
};
const crown = (cx, cy, n, spread, grad) => {
  for (let i = 0; i < n; i++) {
    const x = cx + r(-spread, spread), y = cy + r(-spread * .6, spread * .6), rr = r(14, 26);
    R(circ(f(x), f(y), f(rr)), grad, `stroke="${INK}" stroke-opacity=".35" stroke-width="2"`);
  }
};
S.seed(51);
group('birchCrown', 'Koivun kultaiset lehdet', 'Golden birch leaves', () => {
  add('<g data-anim="sway-slow">'); crown(690, 120, 22, 90, 'url(#rk-gold)'); add('</g>');
});
group('birch0', 'Koivu', 'Birch', () => birch(670, -12, 140, 12));
group('birch1', 'Koivu', 'Birch', () => birch(735, 10, 90, 14));
group('fallingLeaves', 'Putoavat lehdet', 'Falling leaves', () => {
  S.seed(77);
  for (let i = 0; i < 14; i++) {
    const x = r(560, 790), y = r(170, 300);
    R(`M${f(x)} ${f(y)}c4 -6 10 -6 12 0c-2 6 -8 6 -12 0Z`, pick(['#f0a03c', '#e8c04a', '#e2733d']), `stroke="${INK}" stroke-opacity=".5" stroke-width="1" data-anim="fall" style="animation-delay:-${f(i * .65)}s"`);
  }
});

// rowan (pihlaja) on the left
group('rowanTrunk', 'Pihlajan runko', 'Rowan trunk', () =>
  R('M40 600C46 540 54 470 62 410L74 410C72 470 76 540 84 600Z', '#6e5040', line(2)));
S.seed(61);
group('rowanCrown', 'Pihlajan lehdet', 'Rowan leaves', () => {
  add('<g data-anim="sway-slow">'); crown(66, 360, 18, 64, 'url(#rk-rowan)'); add('</g>');
});
group('rowanBerries', 'Pihlajanmarjat', 'Rowan berries', () => {
  S.seed(62);
  for (const [cx, cy] of [[40, 380], [92, 350], [76, 400], [24, 336]]) {
    for (let i = 0; i < 7; i++) C(cx + r(-10, 10), cy + r(-7, 7), 4.2, '#d42a2a', line(1.2));
  }
});

// spruces
const spruce = (key, x, y, h, w, c) => group(key, 'Kuusi', 'Spruce', () => R(sprucePath(x, y, h, w), c, line(1.8)));
spruce('spruce0', 150, 540, 150, 70, '#2f5a4a');
spruce('spruce1', 205, 505, 100, 48, '#3b6b56');
spruce('spruce2', 560, 520, 130, 60, '#2f5a4a');

// rocks
group('rock0', 'Sammaleinen kivi', 'Mossy rock', () => {
  R('M470 560C474 532 520 524 540 546C550 560 536 572 504 572C482 572 468 570 470 560Z', '#a7a3b8', line(2));
  R('M482 540C494 528 522 528 532 540C520 544 494 546 482 540Z', '#8fbf6a', line(1.4));
});
group('rock1', 'Kivi', 'Rock', () => R('M260 470C266 456 296 454 304 468C306 478 266 480 260 470Z', '#9a96ae', line(1.8)));

// mushrooms
const fly = (key, x, y, s) => group(key, 'Kärpässieni', 'Fly agaric', () => {
  add(`<g transform="translate(${x} ${y}) scale(${s})">`);
  R('M-6 0C-7 -10 -5 -20 -4 -26H4C5 -20 7 -10 6 0Z', '#fbf3e4', line(1.8));
  R('M-24 -24C-22 -44 22 -44 24 -24C12 -20 -12 -20 -24 -24Z', '#e03a2f', line(2));
  for (const [dx, dy, rr] of [[-12, -32, 3.2], [2, -36, 3.6], [13, -29, 2.8], [-3, -27, 2.4]]) add(`<circle cx="${dx}" cy="${dy}" r="${rr}" fill="#fff" stroke="${INK}" stroke-width="1"/>`);
  add('</g>');
});
fly('fly0', 300, 540, 1);
fly('fly1', 338, 556, .7);
group('chanterelle', 'Kantarellit', 'Chanterelles', () => {
  for (const [x, y, s] of [[620, 560, 1], [644, 568, .8], [600, 572, .75]]) {
    R(`M${x - 4 * s} ${y}C${x - 3 * s} ${y - 8 * s} ${x - 14 * s} ${y - 14 * s} ${x - 16 * s} ${y - 20 * s}C${x - 6 * s} ${y - 24 * s} ${x + 6 * s} ${y - 24 * s} ${x + 16 * s} ${y - 20 * s}C${x + 14 * s} ${y - 14 * s} ${x + 3 * s} ${y - 8 * s} ${x + 4 * s} ${y}Z`, '#f4b23a', line(1.6));
  }
});
group('bolete', 'Herkkutatti', 'Porcini', () => {
  R('M392 576C390 560 392 548 396 540H414C418 548 420 560 418 576Z', '#f3e3c4', line(1.8));
  R('M380 544C382 520 428 520 430 544C414 548 396 548 380 544Z', '#8a5a34', line(2));
});

// berries
group('blueberries', 'Mustikat', 'Blueberries', () => {
  S.seed(81);
  for (let i = 0; i < 10; i++) {
    const x = 700 + r(-50, 50), y = 540 + r(-20, 20);
    R(`M${f(x)} ${f(y)}c6 -8 14 -8 16 0c-6 6 -12 6 -16 0Z`, pick(['#5f9a4e', '#c4472f', '#7fae5a']), line(1.1));
  }
  for (let i = 0; i < 9; i++) C(700 + r(-44, 44), 548 + r(-16, 18), 4.5, '#3b4f9a', line(1.2));
});
group('lingonberries', 'Puolukat', 'Lingonberries', () => {
  S.seed(82);
  for (let i = 0; i < 8; i++) {
    const x = 230 + r(-34, 34), y = 572 + r(-12, 12);
    R(`M${f(x)} ${f(y)}c5 -6 11 -6 13 0c-5 5 -9 5 -13 0Z`, '#3f7a46', line(1));
  }
  for (let i = 0; i < 10; i++) C(230 + r(-30, 30), 574 + r(-10, 12), 3.6, '#e0302a', line(1.1));
});

// fox
group('foxTail', 'Ketun häntä', 'Fox tail', () => {
  add('<g data-anim="sway" style="transform-origin:10% 80%">');
  R('M540 470C580 476 610 456 606 430C620 452 616 488 580 496C562 500 546 492 540 484Z', '#e8762f', line(2));
  R('M600 436C612 450 612 470 600 482C596 470 600 450 600 436Z', '#fff7ee', line(1.6));
  add('</g>');
});
group('fox', 'Kettu', 'Fox', () => {
  R('M502 500C498 470 506 446 528 440C550 446 558 470 554 500Z', '#e8762f', line(2));
  R('M518 452C514 470 516 488 520 500H536C540 488 542 470 538 452C532 448 524 448 518 452Z', '#fff7ee', line(1.6));
  R('M512 400L504 376L524 392Z', '#ef8538', line(1.8));
  R('M544 400L552 376L532 392Z', '#ef8538', line(1.8));
  ink(`<path d="M510 384L516 392M546 384L540 392" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`);
  R('M506 412C506 396 516 388 528 388C540 388 550 396 550 412C550 428 540 440 528 444C516 440 506 428 506 412Z', '#ef8538', line(2));
  R('M510 418C514 430 520 438 528 442C536 438 542 430 546 418C540 426 534 428 528 428C522 428 516 426 510 418Z', '#fff7ee', line(1.5));
  ink(`<circle cx="520" cy="410" r="2.6" fill="${INK}"/>`);
  ink(`<circle cx="536" cy="410" r="2.6" fill="${INK}"/>`);
  ink(`<path d="M525 426q3 3 6 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`);
  ink(`<ellipse cx="528" cy="423" rx="3" ry="2.2" fill="${INK}"/>`);
  ink(`<path d="M514 500v-10M542 500v-10" stroke="${INK}" stroke-width="2"/>`);
});

S.build('ruska.svg');
