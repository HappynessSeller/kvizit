// "Revontulet" — winter night in Lapland: aurora, snowy fells, a log cabin, reindeer and a snowman.
import { createScene, circ, spruceLine, sprucePath } from './lib.mjs';

const S = createScene({ id: 'revontulet', title: 'Revontulet', titleEn: 'Northern Lights', seed: 29 });
const { INK, R, C, E, add, ink, group, r, f, rnd } = S;
const line = (w = 2) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

S.def(`<linearGradient id="rv-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#121735"/><stop offset=".5" stop-color="#253369"/><stop offset="1" stop-color="#4a5fa0"/></linearGradient>
  <linearGradient id="rv-a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dffc8" stop-opacity="0"/><stop offset=".55" stop-color="#5ff0b0" stop-opacity=".85"/><stop offset="1" stop-color="#2fd18f" stop-opacity=".15"/></linearGradient>
  <linearGradient id="rv-a2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe8ff" stop-opacity="0"/><stop offset=".6" stop-color="#52d6e8" stop-opacity=".75"/><stop offset="1" stop-color="#3aa8d8" stop-opacity=".1"/></linearGradient>
  <linearGradient id="rv-a3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ee6" stop-opacity="0"/><stop offset=".6" stop-color="#c88cff" stop-opacity=".7"/><stop offset="1" stop-color="#8f7cff" stop-opacity=".1"/></linearGradient>
  <radialGradient id="rv-moonGlow"><stop offset="0" stop-color="#fffbe0" stop-opacity=".6"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
  <linearGradient id="rv-fellBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3cff0"/><stop offset="1" stop-color="#8e9fd2"/></linearGradient>
  <linearGradient id="rv-fell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3eafb"/><stop offset="1" stop-color="#aebde6"/></linearGradient>
  <linearGradient id="rv-ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa6dc"/><stop offset="1" stop-color="#c3d3f2"/></linearGradient>
  <linearGradient id="rv-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7ff"/><stop offset="1" stop-color="#c9d6f2"/></linearGradient>
  <linearGradient id="rv-snow2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dbe4f8"/></linearGradient>
  <radialGradient id="rv-window" cx=".5" cy=".6"><stop offset="0" stop-color="#fff2b8"/><stop offset="1" stop-color="#ffb347"/></radialGradient>
  <radialGradient id="rv-lantern"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>`);

// ---------- sky ----------
group('sky', 'Yötaivas', 'Night sky', () => {
  R('M0 0H800V380H0Z', 'url(#rv-sky)');
  S.seed(5);
  for (let i = 0; i < 70; i++) {
    const x = r(0, 800), y = r(0, 300), rr = r(.8, 2.2);
    add(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#fffbe6" data-anim="twinkle" style="animation-delay:-${f(r(0, 3))}s"/>`);
  }
});
group('stars', 'Isot tähdet', 'Bright stars', () => {
  for (const [x, y, s] of [[90, 60, 1], [300, 40, .8], [520, 90, .9], [700, 50, 1.1], [180, 170, .7], [610, 200, .7]]) {
    R(`M${x} ${y - 9 * s}L${x + 2.4 * s} ${y - 2.4 * s}L${x + 9 * s} ${y}L${x + 2.4 * s} ${y + 2.4 * s}L${x} ${y + 9 * s}L${x - 2.4 * s} ${y + 2.4 * s}L${x - 9 * s} ${y}L${x - 2.4 * s} ${y - 2.4 * s}Z`, '#fff6c8', `${line(1.2)} data-anim="twinkle" style="animation-delay:-${f(x / 300)}s"`);
  }
});
group('moon', 'Kuu', 'Moon', () => {
  add(`<circle cx="660" cy="110" r="70" fill="url(#rv-moonGlow)" data-anim="glow"/>`);
  R('M672 78A34 34 0 1 0 690 140A28 28 0 1 1 672 78Z', '#fff4c4', line(1.8));
});

// aurora ribbons
const ribbon = (y0, amp, h, phase) => {
  let top = `M-20 ${y0}`, bottom = '';
  const pts = [];
  for (let x = -20; x <= 820; x += 60) pts.push([x, y0 + Math.sin(x / 140 + phase) * amp]);
  top = `M${pts[0][0]} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i], [px, py] = pts[i - 1];
    top += `Q${f(px + 30)} ${f(py + (y - py) * .5 - 8)} ${x} ${f(y)}`;
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const [x, y] = pts[i];
    bottom += `L${x} ${f(y + h + Math.sin(x / 90 + phase) * 10)}`;
  }
  return top + bottom + 'Z';
};
group('aurora0', 'Vihreät revontulet', 'Green aurora', () => R(ribbon(70, 40, 120, 0), 'url(#rv-a1)', `stroke="#b8ffe0" stroke-opacity=".5" stroke-width="1.5" data-anim="aurora"`));
group('aurora1', 'Turkoosit revontulet', 'Teal aurora', () => R(ribbon(130, 30, 90, 2), 'url(#rv-a2)', `stroke="#bff3ff" stroke-opacity=".45" stroke-width="1.5" data-anim="aurora" style="animation-delay:-3s"`));
group('aurora2', 'Violetit revontulet', 'Violet aurora', () => R(ribbon(30, 25, 70, 4), 'url(#rv-a3)', `stroke="#f2d4ff" stroke-opacity=".45" stroke-width="1.5" data-anim="aurora" style="animation-delay:-6s"`));

// ---------- fells ----------
group('fellBack', 'Kaukainen tunturi', 'Distant fell', () =>
  R('M-10 360C80 320 160 250 250 230C310 218 350 230 400 260C460 296 520 330 600 350L600 384H-10Z', 'url(#rv-fellBack)', line(1.6)));
group('fell', 'Luminen tunturi', 'Snowy fell', () => {
  R('M380 384C450 330 520 280 610 262C660 252 700 258 740 276C770 290 790 300 810 310V384Z', 'url(#rv-fell)', line(1.8));
  add(`<path d="M610 262C630 290 600 320 620 350M700 262C690 300 720 330 700 370" fill="none" stroke="#8e9fd2" stroke-opacity=".6" stroke-width="2"/>`);
});
S.seed(31);
const forest = spruceLine(S, 388, 14, 32, 17);
group('forest', 'Luminen metsä', 'Snowy forest', () => R(forest, '#2d4a5e', line(1.3)));

// ---------- frozen lake ----------
group('ice', 'Jäätynyt järvi', 'Frozen lake', () => {
  R('M0 386H800V460C640 470 520 462 400 466C260 470 120 466 0 470Z', 'url(#rv-ice)', line(1.6));
  add(`<path d="M120 410C200 404 280 412 360 406M460 424C540 418 600 426 700 418M60 444C140 440 220 446 300 440" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>`);
  add(`<path d="M120 398C260 392 420 400 640 394" fill="none" stroke="#5ff0b0" stroke-opacity=".25" stroke-width="10" stroke-linecap="round" data-anim="shimmer"/>`);
});

// ---------- cabin ----------
const cg = line(2.2);
group('cabinWalls', 'Hirsimökki', 'Log cabin', () => {
  R('M120 360H272V446H120Z', '#8a5a3c', cg);
  for (let y = 372; y < 446; y += 11) ink(`<path d="M122 ${y}H270" stroke="${INK}" stroke-opacity=".35" stroke-width="1.5"/>`);
  for (let y = 366; y < 446; y += 11) { ink(`<circle cx="118" cy="${y}" r="4.5" fill="none" stroke="${INK}" stroke-opacity=".45" stroke-width="1.4"/>`); ink(`<circle cx="274" cy="${y}" r="4.5" fill="none" stroke="${INK}" stroke-opacity=".45" stroke-width="1.4"/>`); }
});
group('cabinRoof', 'Lumikatto', 'Snowy roof', () => {
  R('M100 366L196 300L292 366Z', '#5a3a2c', cg);
  R('M92 368C100 356 120 340 140 330L196 292L252 330C272 340 292 356 300 368C290 376 280 366 270 372C258 364 246 376 232 368C220 376 208 366 196 372C184 366 172 376 160 368C148 376 136 366 124 372C112 366 102 376 92 368Z', '#f8faff', line(2));
});
group('chimney', 'Savupiippu', 'Chimney', () => {
  R('M226 300h18v28h-18Z', '#7a6a72', cg);
  R('M222 292C226 286 244 286 248 292L248 300H222Z', '#f8faff', line(1.8));
  for (const [x, y, rr, d] of [[238, 276, 8, 0], [248, 254, 11, 1.4], [262, 230, 14, 2.8]]) add(`<circle cx="${x}" cy="${y}" r="${rr}" fill="#dfe6f8" opacity=".55" data-anim="smoke" style="animation-delay:-${d}s"/>`);
});
group('cabinWindows', 'Lämpimät ikkunat', 'Warm windows', () => {
  for (const x of [136, 226]) {
    add(`<circle cx="${x + 16}" cy="${396}" r="34" fill="url(#rv-lantern)" opacity=".7" data-anim="flicker"/>`);
    R(`M${x} 380h32v30h-32Z`, 'url(#rv-window)', `${cg} data-anim="flicker"`);
    ink(`<path d="M${x + 16} 380v30M${x} 395h32" stroke="${INK}" stroke-width="2.5"/>`);
  }
});
group('cabinDoor', 'Ovi', 'Door', () => {
  R('M184 392h26v54h-26Z', '#3f6fa8', cg);
  ink(`<circle cx="205" cy="420" r="2" fill="${INK}"/>`);
  R('M178 446h38v6h-38Z', '#a99a8f', line(1.8));
});
group('lantern', 'Lyhty', 'Lantern', () => {
  R('M318 380h4v76h-4Z', '#5a3a2c', line(1.6));
  add(`<circle cx="320" cy="372" r="30" fill="url(#rv-lantern)" data-anim="glow"/>`);
  R('M311 362h18v20h-18Z', 'url(#rv-window)', `${line(1.8)} data-anim="flicker"`);
  R('M308 356L320 348L332 356Z', '#2f2b44', line(1.6));
});

// ---------- snow ground ----------
group('snowBack', 'Lumikinos', 'Snowdrift', () =>
  R('M0 452C100 440 220 446 330 456C440 466 560 456 680 450C740 447 780 448 800 450V520H0Z', 'url(#rv-snow)', line(1.8)));

// spruces with snow
const spruce = (key, x, y, h, w) => group(key, 'Luminen kuusi', 'Snowy spruce', () => {
  R(sprucePath(x, y, h, w), '#2a5546', line(1.8));
  const tiers = 4;
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers, yy = y - h + h * .9 * t, hw = w * (.3 + .7 * t) / 2;
    R(`M${f(x - hw * .95)} ${f(yy - 1)}C${f(x - hw * .5)} ${f(yy - 9)} ${f(x + hw * .5)} ${f(yy - 9)} ${f(x + hw * .95)} ${f(yy - 1)}C${f(x + hw * .4)} ${f(yy - 4)} ${f(x - hw * .4)} ${f(yy - 4)} ${f(x - hw * .95)} ${f(yy - 1)}Z`, '#f8faff', line(1.4));
  }
  R(`M${x - 7} ${y - h - 2}C${x - 4} ${y - h - 10} ${x + 4} ${y - h - 10} ${x + 7} ${y - h - 2}Z`, '#f8faff', line(1.2));
});
spruce('spruce0', 40, 520, 170, 84);
spruce('spruce1', 92, 500, 120, 60);
spruce('spruce2', 720, 515, 160, 80);
spruce('spruce3', 668, 492, 100, 52);

// reindeer
const reindeer = (key, x, y, s, flip) => group(key, 'Poro', 'Reindeer', () => {
  add(`<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">`);
  add(`<ellipse cx="0" cy="44" rx="40" ry="5" fill="#3b2f4a" opacity=".12"/>`);
  R('M-30 6C-34 -8 -20 -16 0 -16C18 -16 30 -10 32 2C34 12 26 18 10 18C-10 18 -28 18 -30 6Z', '#8a6248', line(2));
  R('M-24 12L-26 44H-20L-16 16Z', '#7a5440', line(1.8));
  R('M-10 14L-12 44H-6L-2 16Z', '#6e4a38', line(1.8));
  R('M14 14L14 44H20L22 14Z', '#7a5440', line(1.8));
  R('M24 10L28 44H34L32 8Z', '#6e4a38', line(1.8));
  R('M22 -10C28 -20 30 -30 34 -36L46 -30C42 -22 40 -10 34 0Z', '#8a6248', line(2));
  R('M26 -8C30 -4 34 4 30 10C24 6 22 0 22 -6Z', '#f3ece4', line(1.5));
  R('M34 -38C40 -46 54 -46 58 -38C60 -32 52 -28 44 -28C38 -28 32 -32 34 -38Z', '#8a6248', line(2));
  ink(`<circle cx="44" cy="-38" r="2" fill="${INK}"/>`);
  ink(`<circle cx="58" cy="-37" r="2.6" fill="#e0302a"/>`);
  R('M-30 4C-38 2 -40 -6 -34 -8C-32 -2 -30 0 -30 4Z', '#f3ece4', line(1.4));
  add('</g>');
});
const antlers = (key, x, y, s, flip) => group(key, 'Sarvet', 'Antlers', () => {
  add(`<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">`);
  R('M38 -44C34 -56 30 -66 22 -74C26 -74 30 -70 32 -66C32 -74 30 -80 26 -86C32 -84 36 -76 36 -68C38 -62 40 -54 42 -46Z', '#d9c39a', line(1.6));
  R('M46 -44C48 -56 52 -66 60 -74C56 -74 52 -70 50 -66C50 -74 54 -80 58 -86C52 -84 48 -76 48 -68C46 -62 44 -54 42 -46Z', '#d9c39a', line(1.6));
  add('</g>');
});
reindeer('reindeer0', 410, 450, 1, false);
antlers('antlers0', 410, 450, 1, false);
reindeer('reindeer1', 540, 444, .8, true);
antlers('antlers1', 540, 444, .8, true);

// sled + snowman
group('sled', 'Pulkka', 'Sled', () => {
  R('M330 520C330 506 340 500 356 500H410C420 500 426 506 424 514C422 522 414 526 404 526H344C336 526 330 524 330 520Z', '#e0302a', line(2));
  ink(`<path d="M352 508H404" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`);
  ink(`<path d="M424 512C440 500 452 496 470 500" fill="none" stroke="${INK}" stroke-width="2"/>`);
});
group('snowman', 'Lumiukko', 'Snowman', () => {
  add('<g transform="translate(56 0)">');
  C(560, 540, 34, '#ffffff', line(2.2));
  C(560, 488, 25, '#ffffff', line(2.2));
  C(560, 448, 19, '#ffffff', line(2.2));
  for (const y of [478, 492, 506]) ink(`<circle cx="560" cy="${y}" r="2.6" fill="${INK}"/>`);
  ink(`<circle cx="553" cy="444" r="2.4" fill="${INK}"/><circle cx="567" cy="444" r="2.4" fill="${INK}"/>`);
  ink(`<path d="M552 457q8 5 16 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`);
  ink(`<path d="M536 486L510 470M584 486L610 466M512 471l-6-8M608 467l4-9" fill="none" stroke="#5a3a2c" stroke-width="3" stroke-linecap="round"/>`);
  add('</g>');
});
group('carrot', 'Porkkananenä', 'Carrot nose', () => R('M616 449L638 453L616 455Z', '#ff8c2e', line(1.4)));
group('scarf', 'Kaulaliina', 'Scarf', () => {
  add('<g transform="translate(56 0)">');
  R('M541 462C552 470 568 470 579 462L582 470C568 480 552 480 538 470Z', '#e86fa8', line(1.8));
  R('M568 472L576 496L566 498L560 474Z', '#e86fa8', line(1.8));
  add('</g>');
});
group('hat', 'Pipo', 'Beanie', () => {
  add('<g transform="translate(56 0)">');
  R('M543 438C542 420 578 420 577 438Z', '#5b8fd4', line(1.8));
  R('M540 436H580V442H540Z', '#fffaf2', line(1.6));
  C(560, 418, 5.5, '#fffaf2', line(1.6));
  add('</g>');
});

// front snow + falling snow
group('snowFront', 'Pehmeä lumi', 'Soft snow', () => {
  R('M0 520C120 506 240 512 360 526C480 540 620 530 800 514V600H0Z', 'url(#rv-snow2)', line(2));
  S.seed(44);
  for (let i = 0; i < 9; i++) {
    const x = 180 + i * 34, y = 560 + Math.sin(i) * 8;
    add(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="4" ry="6" fill="#b9c7ea" opacity=".7" transform="rotate(${-60} ${f(x)} ${f(y)})"/>`);
  }
  S.seed(45);
  add('<g data-anim="snow">');
  // two identical copies 610px apart so the falling loop is seamless
  const flakes = Array.from({ length: 40 }, () => [r(0, 800), r(0, 610), r(1.2, 3), r(.5, .95)]);
  for (const dy of [0, 610]) for (const [x, y, rr, o] of flakes) add(`<circle cx="${f(x)}" cy="${f(y + dy)}" r="${f(rr)}" fill="#fff" opacity="${f(o)}"/>`);
  add('</g>');
});

S.build('revontulet.svg');
