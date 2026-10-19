// "Revontulet" — a winter night in a Lapland yard: the aurora overhead, a snowy log cabin with warm
// windows, a woodshed, reindeer by the fence, bullfinches at the feeder, an owl, a snow hare,
// a kick-sled, a pulkka and a snowman.
// Light: the aurora above (cool green rims on every top edge, deep blue shade below) and warm pools
// of lamplight from the windows and the lantern. The most detailed picture so far (~40 areas).
import { createScene } from './lib.mjs';
import { lightKit } from './light.mjs';
import {
  ridge, ridgeY, smooth, closeDown, contourBand, treeline, poly, spruceForm, auroraCurtain, starField, noise1, rng,
  blob, lerp, grassTufts,
  setVariant,
} from './organic.mjs';

/** Build the picture. variant 0 is the original; any other number grows new shapes for the same areas. */
export default function generate(variant = 0) {
  setVariant(variant);
  const S = createScene({ id: 'revontulet', title: 'Revontulet', titleEn: 'Northern Lights', seed: 29 });
  const { INK, R, C, add, ink, group, r, f } = S;
  const { st, rim, shadow, reflection, crescent, ground, smoke } = lightKit(S, 'rv', { light: [-0.3, -0.95], ink: '#141a3a' });
  const line = (w = 2) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const AUR = '#b8ffe0';   // aurora rim light
  const SHADE = '#1f2a66'; // night shade
  const WARM = '#ffd27a';  // lamplight

  S.def(`<linearGradient id="rv-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1030"/><stop offset=".45" stop-color="#1c2a5c"/><stop offset=".8" stop-color="#34508f"/><stop offset="1" stop-color="#5a78b4"/></linearGradient>
    <linearGradient id="rv-milky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d4ff" stop-opacity="0"/><stop offset=".5" stop-color="#c9d4ff" stop-opacity=".16"/><stop offset="1" stop-color="#c9d4ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="rv-a1env" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5ff2a8" stop-opacity=".55"/><stop offset=".5" stop-color="#2fd18f" stop-opacity=".18"/><stop offset="1" stop-color="#7b6cff" stop-opacity="0"/></linearGradient>
    <linearGradient id="rv-a2env" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5ce1e6" stop-opacity=".5"/><stop offset=".6" stop-color="#3aa8d8" stop-opacity=".15"/><stop offset="1" stop-color="#3aa8d8" stop-opacity="0"/></linearGradient>
    <linearGradient id="rv-a3env" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e48cff" stop-opacity=".5"/><stop offset=".6" stop-color="#a77cff" stop-opacity=".14"/><stop offset="1" stop-color="#a77cff" stop-opacity="0"/></linearGradient>
    <radialGradient id="rv-starGlow"><stop offset="0" stop-color="#fff6c8" stop-opacity=".45"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>
    <radialGradient id="rv-moonGlow"><stop offset="0" stop-color="#fffbe0" stop-opacity=".55"/><stop offset=".4" stop-color="#fffbe0" stop-opacity=".12"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
    <radialGradient id="rv-moon" cx=".4" cy=".35"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#f3e3a6"/></radialGradient>
    <linearGradient id="rv-fellBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8ac2"/><stop offset="1" stop-color="#56609a"/></linearGradient>
    <linearGradient id="rv-fell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a4b0e0"/><stop offset="1" stop-color="#6e7ab4"/></linearGradient>
    <linearGradient id="rv-ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f86c4"/><stop offset=".5" stop-color="#93abe0"/><stop offset="1" stop-color="#c3d3f2"/></linearGradient>
    <linearGradient id="rv-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8c0ea"/><stop offset="1" stop-color="#7e88c0"/></linearGradient>
    <linearGradient id="rv-snow2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4cbef"/><stop offset="1" stop-color="#8a94cc"/></linearGradient>
    <linearGradient id="rv-spruce" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f4a44"/><stop offset=".6" stop-color="#2c5f52"/><stop offset="1" stop-color="#1b3d3a"/></linearGradient>
    <radialGradient id="rv-window" cx=".5" cy=".6"><stop offset="0" stop-color="#fff2b8"/><stop offset="1" stop-color="#ffb347"/></radialGradient>
    <radialGradient id="rv-lantern"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    <radialGradient id="rv-iceGlow" cx=".5" cy=".5"><stop offset="0" stop-color="#5ff2a8" stop-opacity=".35"/><stop offset="1" stop-color="#5ff2a8" stop-opacity="0"/></radialGradient>
    <clipPath id="rv-iceClip"><path d="M0 386H800V462H0Z"/></clipPath>`);

  const AURORA_STOPS = {
    'rv-a1': '<stop offset="0" stop-color="#d4ffe9"/><stop offset=".08" stop-color="#5ff2a8"/><stop offset=".55" stop-color="#2fd18f" stop-opacity=".55"/><stop offset=".85" stop-color="#7b6cff" stop-opacity=".3"/><stop offset="1" stop-color="#b06cff" stop-opacity="0"/>',
    'rv-a2': '<stop offset="0" stop-color="#d9fbff"/><stop offset=".1" stop-color="#5ce1e6"/><stop offset=".6" stop-color="#3aa8d8" stop-opacity=".45"/><stop offset="1" stop-color="#5a6cff" stop-opacity="0"/>',
    'rv-a3': '<stop offset="0" stop-color="#ffd6f3"/><stop offset=".12" stop-color="#e48cff"/><stop offset=".6" stop-color="#a77cff" stop-opacity=".4"/><stop offset="1" stop-color="#ff7cb8" stop-opacity="0"/>',
  };

  // ---------- sky ----------
  const milky = { y: 120, slope: -0.42, w: 46 };
  group('sky', 'Yötaivas', 'Night sky', () => {
    R('M0 0H800V390H0Z', 'url(#rv-sky)');
    // Milky Way: a soft diagonal band of light
    const ang = f(Math.atan(milky.slope) * 180 / Math.PI);
    add(`<rect x="-520" y="-90" width="1040" height="180" fill="url(#rv-milky)" transform="translate(400 ${milky.y}) rotate(${ang})"/>`);
    add(`<rect x="-520" y="-34" width="1040" height="68" fill="url(#rv-milky)" transform="translate(400 ${milky.y + 6}) rotate(${ang})"/>`);
    const stars = starField({ seed: 5, n: 260, y1: 330, band: milky });
    // faint stars in one path, bright ones twinkle on their own
    let faint = '';
    for (const [x, y, rr, o] of stars) {
      if (rr < 1.2) faint += `M${f(x - rr)} ${f(y)}a${f(rr)} ${f(rr)} 0 1 0 ${f(rr * 2)} 0a${f(rr)} ${f(rr)} 0 1 0 ${f(-rr * 2)} 0`;
      else add(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#fffbe6" opacity="${f(o)}" data-anim="twinkle" style="animation-delay:-${f((x * 7 + y) % 30 / 10)}s"/>`);
    }
    add(`<path d="${faint}" fill="#e8ecff" opacity=".7"/>`);
  });

  // aurora curtains: rays on a folding baseline (violet highest, green lowest)
  const curtain = (key, fi, en, opts, grad, edge, delay) => group(key, fi, en, () => {
    const c = auroraCurtain(opts);
    // colour by altitude, so every ray fades from a bright lower hem to violet nothing
    const stops = AURORA_STOPS[grad];
    S.def(`<linearGradient id="${grad}-u" gradientUnits="userSpaceOnUse" x1="0" y1="${f(c.bottom)}" x2="0" y2="${f(c.top)}">${stops}</linearGradient>`);
    add(`<g data-anim="aurora" style="animation-delay:-${delay}s">`);
    R(c.env, `url(#${grad}env)`);
    for (const ray of c.rays) add(`<path d="${ray.d}" fill="url(#${grad}-u)" opacity="${ray.o}"/>`);
    add(`<path d="${c.base}" fill="none" stroke="${edge}" stroke-width="4" stroke-opacity=".45" stroke-linecap="round" filter="url(#rv-soft3)"/>`);
    add('</g>');
  });
  curtain('aurora2', 'Violetit revontulet', 'Violet aurora', { seed: 41, y: 92, sway: 26, height: 70, x0: 120, x1: 830, fold: 0.008 }, 'rv-a3', '#ffd6f3', 6);
  curtain('aurora1', 'Turkoosit revontulet', 'Teal aurora', { seed: 23, y: 168, sway: 34, height: 110, x0: -30, x1: 560, fold: 0.007 }, 'rv-a2', '#d9fbff', 3);
  curtain('aurora0', 'Vihreät revontulet', 'Green aurora', { seed: 7, y: 238, sway: 44, height: 165, fold: 0.0055 }, 'rv-a1', '#d4ffe9', 0);

  // bright stars come after the curtains: they shine through the aurora, and in the line art the
  // curtains are solid shapes that would otherwise swallow them
  group('stars', 'Isot tähdet', 'Bright stars', () => {
    for (const [x, y, s0] of [[70, 50, 1], [300, 30, .8], [470, 120, .75], [560, 40, 1.05], [190, 170, .7], [760, 190, .7]]) {
      const s = s0 * 1.3;
      add(`<circle cx="${x}" cy="${y}" r="${f(18 * s)}" fill="url(#rv-starGlow)" data-anim="twinkle" style="animation-delay:-${f(x / 300)}s"/>`);
      R(`M${x} ${f(y - 10 * s)}Q${f(x + 1.8 * s)} ${f(y - 1.8 * s)} ${f(x + 10 * s)} ${y}Q${f(x + 1.8 * s)} ${f(y + 1.8 * s)} ${x} ${f(y + 10 * s)}Q${f(x - 1.8 * s)} ${f(y + 1.8 * s)} ${f(x - 10 * s)} ${y}Q${f(x - 1.8 * s)} ${f(y - 1.8 * s)} ${x} ${f(y - 10 * s)}Z`, '#fff6c8', `${line(1.2)} data-anim="twinkle" style="animation-delay:-${f(x / 300)}s"`);
    }
  });

  group('moon', 'Kuu', 'Moon', () => {
    add(`<circle cx="690" cy="74" r="90" fill="url(#rv-moonGlow)" data-anim="glow"/>`);
    R('M698 46A30 30 0 1 0 718 98A25 25 0 1 1 698 46Z', 'url(#rv-moon)', line(1.8));
    add(`<circle cx="676" cy="70" r="3.5" fill="#e6d28e" opacity=".6"/><circle cx="684" cy="88" r="2.4" fill="#e6d28e" opacity=".55"/><circle cx="672" cy="84" r="1.8" fill="#e6d28e" opacity=".5"/>`);
  });

  S.def(`<linearGradient id="rv-logs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5236"/><stop offset="1" stop-color="#5a3a2c"/></linearGradient>
    <linearGradient id="rv-logsSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a3028"/><stop offset="1" stop-color="#3a2622"/></linearGradient>
    <linearGradient id="rv-roofSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0e8f0"/><stop offset="1" stop-color="#8e9ad0"/></linearGradient>
    <radialGradient id="rv-pool" cx=".5" cy=".3"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset=".4" stop-color="#ffc060" stop-opacity=".45"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <linearGradient id="rv-deer" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a7258"/><stop offset="1" stop-color="#6e4a38"/></linearGradient>
    <radialGradient id="rv-flake"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".7"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <linearGradient id="rv-snowman" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2ff"/><stop offset="1" stop-color="#9aa4d4"/></linearGradient>`);

  // ---------------------------------------------------------------- fells, forest, lake
  const HY = 392;
  const farPts = ridge({ seed: 3, base: HY - 6, peaks: [{ x: 600, h: 160, w: 300, k: 1.5 }, { x: 330, h: 70, w: 160 }], amp: 7 });
  const farD = closeDown(smooth(farPts), farPts, HY);
  const nearPts = ridge({ seed: 9, base: HY - 2, peaks: [{ x: 140, h: 104, w: 240, k: 1.6 }, { x: 780, h: 64, w: 160 }], amp: 6 });
  const nearD = closeDown(smooth(nearPts), nearPts, HY);
  const gullies = (pts, seed, xa, xb, colour) => {
    const N = noise1(seed), Rn = rng(seed);
    let d = '';
    for (let x = xa; x < xb; x += 16 + Rn() * 22) {
      let yy = ridgeY(pts, x) + 4, xx = x;
      d += `M${f(xx)} ${f(yy)}`;
      const len = 14 + Rn() * 34;
      for (let k = 0; k < 6; k++) { yy += len / 6; xx += N(yy * 0.05 + x, 2) * 3 + 1; d += `L${f(xx)} ${f(yy)}`; }
    }
    add(`<path d="${d}" fill="none" stroke="${colour}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>`);
  };
  group('fellFar', 'Kaukainen tunturi', 'Distant fell', () => {
    R(farD, 'url(#rv-fellBack)', st('#8e9fd2', 1.2));
    shadow(farD, SHADE, 40, 0.3);
    rim(farD, AUR, 2.2, 0.8);
    gullies(farPts, 13, 620, 800, '#6f80bb');
  });
  group('fellNear', 'Luminen tunturi', 'Snowy fell', () => {
    R(nearD, 'url(#rv-fell)', st('#a6b6e2', 1.4));
    shadow(nearD, SHADE, 34, 0.28);
    rim(nearD, AUR, 2.6, 0.85);
    gullies(nearPts, 17, 150, 300, '#8a9ad0');
  });
  const forestPts = treeline({ seed: 31, y0: HY, minH: 10, maxH: 30, gap: 8, kinds: { spruce: 5, pine: 1 } });
  const forestD = closeDown(poly(forestPts, false), forestPts, HY + 3);
  group('forest', 'Luminen metsä', 'Snowy forest', () => {
    R(forestD, '#22424f', st('#22424f', 1.1));
    add(`<path d="${poly(forestPts.map(([x, y]) => [x, y + 0.8]), false)}" fill="none" stroke="${AUR}" stroke-width="1.6" stroke-opacity=".55" stroke-dasharray="3 5"/>`);
  });
  group('ice', 'Jäätynyt järvi', 'Frozen lake', () => {
    R(`M0 ${HY}H800V490H0Z`, 'url(#rv-ice)', st('#93abe0', 1.4));
    add(`<ellipse cx="420" cy="${HY + 18}" rx="380" ry="24" fill="url(#rv-iceGlow)" data-anim="shimmer"/>`);
    reflection(`<path d="${forestD}" fill="#22424f"/><path d="${nearD}" fill="#8a9ad0"/>`, HY + 2, { depth: 40, amp: 1, seed: 4, opacity: 0.35 });
    const Rn = rng(77), N = noise1(78);
    let d = '';
    for (let i = 0; i < 9; i++) {
      let x = 30 + Rn() * 740, y = HY + 10 + Rn() * 40, a = (Rn() - 0.5) * 0.6;
      d += `M${f(x)} ${f(y)}`;
      for (let k = 0; k < 6; k++) { a += N(x * 0.05 + i, 2) * 0.8; x += Math.cos(a) * 9; y += Math.sin(a) * 2.5; d += `L${f(x)} ${f(y)}`; }
    }
    add(`<path d="${d}" fill="none" stroke="#f4f8ff" stroke-opacity=".6" stroke-width="1.2" stroke-linejoin="round"/>`);
  });

  // ---------------------------------------------------------------- the yard
  const yardPts = ridge({ seed: 51, base: 470, peaks: [{ x: 60, h: 34, w: 200 }, { x: 760, h: 22, w: 180 }], amp: 4, scale: 0.008, step: 10 });
  const yardD = closeDown(smooth(yardPts), yardPts, 600);
  group('snowBack', 'Pihan lumi', 'Snowy yard', () => {
    R(yardD, 'url(#rv-snow)', st('#c3d0f0', 1.8));
    rim(yardD, AUR, 3, 0.8);
    const Rn = rng(52);
    let d = '';
    for (let i = 0; i < 18; i++) { const x = 20 + Rn() * 760, y = 480 + Rn() * 70, w = 18 + Rn() * 40; d += `M${f(x)} ${f(y)}q${f(w / 2)} -3 ${f(w)} 0`; }
    add(`<path d="${d}" fill="none" stroke="#a9b8e2" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`);
    // trodden paths: cabin door → woodshed → fence gate
    add(`<path d="M276 482C320 500 380 500 420 490M300 488C330 520 380 560 420 600" fill="none" stroke="#6e78b0" stroke-width="12" stroke-linecap="round" opacity=".35"/>`);
  });

  // spruces at the back of the yard
  const spruce = (key, seed, x, y, h, w, tiers) => group(key, 'Luminen kuusi', 'Snowy spruce', () => {
    const sp = spruceForm({ seed, x, y, h, w, tiers });
    add(`<ellipse cx="${x}" cy="${y}" rx="${f(w * 0.6)}" ry="6" fill="#8fa0d0" opacity=".45"/>`);
    R(sp.body, 'url(#rv-spruce)', st('#2c5f52', 1.8));
    shadow(sp.body, '#0f1f2a', w * 0.25, 0.35);
    sp.caps.forEach((d) => { R(d, '#d8e0f8', st('#9aa6d8', 1.2)); rim(d, AUR, 1.4, 0.8); });
  });
  spruce('spruce1', 8, 96, 486, 168, 74, 7);
  spruce('spruce3', 15, 712, 472, 132, 62, 6);

  // fence along the back right
  group('fence', 'Aita', 'Fence', () => {
    let posts = '';
    const xs = [];
    for (let x = 452; x <= 800; x += 38) xs.push(x);
    R(`M440 452L800 446V454L440 460Z`, '#7a5a44', st('#7a5a44', 1.3));
    R(`M440 468L800 462V470L440 476Z`, '#7a5a44', st('#7a5a44', 1.3));
    // all posts are one shape, so a post half-hidden behind a spruce or reindeer is never a sliver
    let postD = '';
    for (const x of xs) {
      const y = ridgeY(yardPts, x) + 8;
      postD += `M${x - 3} ${f(y)}V436l3 -4l3 4V${f(y)}Z`;
      posts += `M${x - 5} 434q5 -6 10 0Z`;
    }
    R(postD, '#8a6a52', st('#8a6a52', 1.3));
    add(`<path d="${posts}" fill="#f4f9ff"/>`);
    add(`<path d="M440 451.5L800 445.5" stroke="#f4f9ff" stroke-width="3" stroke-linecap="round"/>`);
  });

  // ---------------------------------------------------------------- woodshed
  const shedWalls = 'M342 480V430H420V478Z';
  group('woodshed', 'Puuvaja', 'Woodshed', () => {
    R(shedWalls, '#3a2a26', st('#3a2a26', 1.6));
    for (let x = 348; x < 420; x += 8) ink(`<path d="M${x} 431V479" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>`);
    R('M338 482V428h8v54Z', '#6e4a38', st('#6e4a38', 1.2));
    R('M416 480V428h8v52Z', '#6e4a38', st('#6e4a38', 1.2));
  });
  group('firewood', 'Halkopino', 'Firewood stack', () => {
    const d = 'M348 478V446H414V478Z';
    R(d, '#a8784e', st('#7a5236', 1.4));
    let ends = '', rings = '';
    const Rn = rng(5);
    for (let y = 451; y < 478; y += 8) for (let x = 352 + ((y / 8) % 2) * 4; x < 412; x += 9) {
      const r0 = 3.4 + Rn() * 0.8;
      ends += `M${f(x - r0)} ${f(y)}a${f(r0)} ${f(r0)} 0 1 0 ${f(r0 * 2)} 0a${f(r0)} ${f(r0)} 0 1 0 ${f(-r0 * 2)} 0`;
      rings += `M${f(x - 1.4)} ${f(y)}a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0`;
    }
    add(`<path d="${ends}" fill="#e8c28e" stroke="#8a6040" stroke-width="1"/>`);
    add(`<path d="${rings}" fill="none" stroke="#b8885a" stroke-width=".8"/>`);
    add(`<path d="M348 448H414" stroke="${SHADE}" stroke-opacity=".5" stroke-width="5"/>`);
  });
  group('shedRoof', 'Vajan lumikatto', 'Shed roof', () => {
    const d = 'M330 432L346 418H422L436 430C430 438 420 432 412 437C402 432 392 438 382 434C372 438 362 432 352 437C344 432 336 438 330 432Z';
    R(d, 'url(#rv-roofSnow)', st('#b9c8ec', 1.6));
    rim(d, AUR, 2, 0.8);
  });

  // ---------------------------------------------------------------- the cabin
  const front = 'M120 474V404L164 368L208 404V474Z';
  const side = 'M208 474V404L318 412V470Z';
  const roofSide = 'M158 360L274 368L328 414L204 406Z';
  const roofFront = 'M158 360L104 410L118 414L164 372Z';
  group('cabinWalls', 'Hirsimökki', 'Log cabin', () => {
    R(front, 'url(#rv-logs)', st('#7a5236', 2));
    R(side, 'url(#rv-logsSide)', st('#4a3028', 2));
    for (let y = 412; y < 474; y += 8) {
      ink(`<path d="M${f(Math.max(122, 164 - (y - 368) * 44 / 36))} ${y}H${f(Math.min(206, 164 + (y - 368) * 44 / 36))}" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2"/>`);
      ink(`<path d="M210 ${y}L316 ${f(y + 8 - (y - 404) * 0.06)}" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2"/>`);
    }
    for (let y = 408; y < 474; y += 8) add(`<circle cx="208" cy="${y}" r="3.6" fill="#b8885a" stroke="${INK}" stroke-opacity=".5" stroke-width=".8"/>`);
    rim(front, AUR, 2, 0.5);
  });
  group('cabinRoof', 'Lumikatto', 'Snowy roof', () => {
    R(roofSide, 'url(#rv-roofSnow)', st('#b9c8ec', 2));
    R(roofFront, '#eef6ff', st('#b9c8ec', 1.6));
    rim(roofSide, AUR, 3, 0.9);
    // lumpy snow overhang + icicles along the eave
    const Rn = rng(5);
    let lump = '', ice = '';
    for (let t = 0; t <= 1; t += 0.08) {
      const x = lerp(204, 328, t), y = lerp(406, 414, t);
      lump += `M${f(x - 6)} ${f(y)}q6 ${f(4 + Rn() * 3)} 12 0Z`;
      if (t < 0.97) ice += `M${f(x - 1.6)} ${f(y + 2)}L${f(x)} ${f(y + 6 + Rn() * 12)}L${f(x + 1.6)} ${f(y + 2)}Z`;
    }
    add(`<path d="${lump}" fill="#f4f9ff"/>`);
    add(`<path d="${ice}" fill="#e6f1ff" stroke="#9fb4e0" stroke-width=".7"/>`);
  });
  group('chimney', 'Savupiippu', 'Chimney', () => {
    R('M256 356h18v30l-18 -1Z', '#7a6a72', st('#7a6a72', 1.6));
    R('M252 348C256 342 274 342 278 348L278 356H252Z', '#f4f9ff', st('#b9c8ec', 1.4));
    smoke(266, 346, { h: 120, w: 7, lean: 44, colour: '#dfe6f8', op: 0.6, seed: 9 });
  });
  group('cabinWindows', 'Lämpimät ikkunat', 'Warm windows', () => {
    // lamplight spilling onto the snow
    add(`<ellipse cx="200" cy="500" rx="130" ry="34" fill="url(#rv-pool)" data-anim="flicker"/>`);
    add(`<path d="M144 478L184 478L196 510L128 510Z" fill="#ffd27a" opacity=".38" filter="url(#rv-soft3)"/>`);
    add(`<path d="M228 478L256 478L276 506L214 506Z" fill="#ffd27a" opacity=".32" filter="url(#rv-soft3)"/>`);
    for (const pts of [[[142, 414], [186, 414], [186, 446], [142, 446]], [[226, 422], [256, 424], [256, 450], [226, 449]]]) {
      add(`<path d="${poly(pts)}" fill="${WARM}" opacity=".35" transform="translate(0 0)" filter="url(#rv-soft8)"/>`);
      R(poly(pts), 'url(#rv-window)', `${st('#c8902a', 1.6)} data-anim="flicker"`);
      const [a, b, c, d] = pts;
      ink(`<path d="M${f((a[0] + b[0]) / 2)} ${f((a[1] + b[1]) / 2)}L${f((c[0] + d[0]) / 2)} ${f((c[1] + d[1]) / 2)}M${f((a[0] + d[0]) / 2)} ${f((a[1] + d[1]) / 2)}L${f((b[0] + c[0]) / 2)} ${f((b[1] + c[1]) / 2)}" stroke="${INK}" stroke-width="2.2"/>`);
      add(`<path d="M${a[0] - 3} ${a[1] - 3}H${b[0] + 3}" stroke="#f4f9ff" stroke-width="4" stroke-linecap="round"/>`);
    }
  });
  group('cabinDoor', 'Ovi', 'Door', () => {
    R('M268 470V424L294 426V470Z', '#3f6fa8', st('#3f6fa8', 1.6));
    R('M273 432l16 1v10l-16 -1Z', '#7db0d4', st('#3f6fa8', 1));
    ink(`<circle cx="290" cy="450" r="1.8" fill="${INK}"/>`);
    R('M262 470h38l4 6h-46Z', '#a99a8f', st('#8a7a70', 1.4));
    add(`<path d="M260 469h42" stroke="#f4f9ff" stroke-width="3" stroke-linecap="round"/>`);
  });

  // ---------------------------------------------------------------- reindeer
  const deer = {
    body: 'M-36 4C-38 -10 -26 -18 -8 -18C4 -18 12 -25 24 -23C35 -21 39 -10 37 2C35 15 26 20 10 20C-8 22 -28 18 -36 4Z',
    legs: [
      'M-30 10C-34 20 -26 26 -28 32L-27 42H-21L-20 31C-18 25 -19 18 -18 12Z',
      'M-16 14C-19 22 -13 27 -15 33L-14 42H-8L-8 32C-6 26 -6 20 -5 15Z',
      'M10 16L12 30L11 42H17L18 29L19 16Z',
      'M24 12L27 29L25 42H31L33 28L32 10Z',
    ],
    hooves: 'M-28 41h8v3h-8ZM-15 41h8v3h-8ZM10 41h8v3h-8ZM24 41h8v3h-8Z',
    neck: 'M22 -18C26 -28 31 -36 38 -42L52 -35C47 -25 43 -12 35 -2Z',
    mane: 'M27 -16C35 -14 41 -4 39 8L36 5L35 11L32 6L30 11L28 5L26 8C24 0 24 -8 27 -16Z',
    head: 'M36 -44C42 -52 54 -52 60 -46C66 -42 70 -36 68 -31C66 -27 58 -27 52 -29C46 -29 38 -33 36 -40Z',
    ear: 'M40 -46L32 -52L42 -49Z',
    tail: 'M-36 2C-42 0 -44 -6 -39 -9C-37 -4 -35 -2 -36 2Z',
    antL: 'M42 -48C36 -60 32 -72 22 -82C27 -82 31 -77 33 -72C33 -82 30 -90 25 -96C32 -93 37 -84 37 -74C40 -66 43 -58 46 -50Z',
    antR: 'M50 -48C53 -60 58 -72 68 -80C63 -80 58 -76 56 -72C57 -82 61 -90 66 -96C59 -93 54 -84 53 -74C51 -66 49 -58 47 -50Z',
  };
  const reindeer = (key, x, y, s, flip) => group(key, 'Poro', 'Reindeer', () => {
    ground(x, y + 44 * s, 76 * s, { h: 60 * s, colour: SHADE, op: 0.35 });
    add(`<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">`);
    // near legs and far legs as two shapes, so a leg half-hidden behind a tree is never a speck
    R(deer.legs[0] + deer.legs[2], '#6e4a38', st('#5a3a2c', 1.5));
    R(deer.legs[1] + deer.legs[3], '#5a3a2c', st('#5a3a2c', 1.5));
    add(`<path d="${deer.hooves}" fill="#2a1d22"/>`);
    add(`<path d="M-30 30l6 0M-16 31l6 0M10 30l7 0M25 29l7 0" stroke="#e6dccc" stroke-width="2.4" opacity=".8"/>`);
    R(deer.body + deer.tail, 'url(#rv-deer)', st('#6e4a38', 1.8));
    shadow(deer.body, SHADE, 12, 0.4);
    rim(deer.body, AUR, 2, 0.85);
    add(`<path d="M-30 12C-14 16 8 16 30 10" fill="none" stroke="#e6dccc" stroke-width="3" opacity=".55"/>`);
    R(deer.neck, '#8a6248', st('#6e4a38', 1.8));
    R(deer.mane, '#f3ece4', st('#c9bcb0', 1.3));
    // the ear is part of the head shape (on its own it would be a speck behind the antlers)
    R(deer.ear + deer.head, '#8a6248', st('#6e4a38', 1.8));
    add(`<path d="${deer.ear}" fill="#7a5440"/>`);
    rim(deer.head, AUR, 1.6, 0.85);
    add(`<path d="${deer.tail}" fill="#f3ece4"/>`); // the white rump tuft, part of the body shape
    ink(`<circle cx="47" cy="-42" r="2" fill="${INK}"/>`);
    ink(`<ellipse cx="66" cy="-33" rx="2.4" ry="2" fill="#2a1d22"/>`);
    R(deer.antL, '#cdb48a', st('#a8906a', 1.4));
    R(deer.antR, '#e6d2aa', st('#a8906a', 1.4));
    rim(deer.antR, AUR, 1.2, 0.8);
    add('</g>');
  });
  reindeer('reindeer1', 700, 470, 0.78, true);
  reindeer('reindeer0', 520, 486, 1, false);

  // ---------------------------------------------------------------- bird feeder + bullfinches
  group('feeder', 'Lintulauta ja punatulkut', 'Bird feeder and bullfinches', () => {
    R('M452 540V446h6v94Z', '#7a5a44', st('#7a5a44', 1.3));
    ground(455, 540, 14, { h: 90, colour: SHADE });
    R('M432 446h46v6h-46Z', '#8a6a52', st('#7a5a44', 1.3));
    const roof = 'M426 430L455 414L484 430C478 436 468 430 460 434C452 430 444 436 436 432C432 434 428 434 426 430Z';
    R('M436 430h38v16h-38Z', '#4a3a36', st('#3a2a26', 1.2));
    R(roof, '#dfe6fa', st('#9aa6d8', 1.4));
    rim(roof, AUR, 1.6, 0.8);
    add(`<path d="M440 445h30" stroke="#d9b870" stroke-width="2.4" stroke-dasharray="2 2"/>`);
    // two bullfinches: one on the tray, one on the roof ridge
    const bird = (x, y, s, flip) => {
      add(`<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">`);
      R('M-9 0C-10 -8 -2 -12 4 -10C9 -8 10 -2 8 2C5 6 -6 6 -9 0Z', '#e2483a', st('#a83226', 1.2));
      R('M-6 -6C-4 -12 4 -14 8 -9C6 -5 -2 -4 -6 -6Z', '#6a6e80', st('#4a4e60', 1.1));
      // black cap and tail in one ink-dark shape each side of the body
      R('M4 -12C6 -16 12 -15 12 -10C11 -7 7 -7 5 -9ZM-9 -2L-17 -5L-15 2Z', '#1f1d2a', st('#1f1d2a', 1));
      ink(`<path d="M12 -11l3 1l-3 1" fill="${INK}"/>`);
      add('</g>');
    };
    bird(444, 442, 1, false);
    bird(468, 412, 0.9, true);
  });

  // ---------------------------------------------------------------- lantern + kick-sled
  group('lantern', 'Lyhty', 'Lantern', () => {
    add('<g transform="translate(46 0)">');
    add(`<ellipse cx="346" cy="532" rx="70" ry="20" fill="url(#rv-pool)" data-anim="glow"/>`);
    R('M344 532V464h4v68Z', '#3a2a26', st('#3a2a26', 1.2));
    add(`<circle cx="346" cy="456" r="30" fill="url(#rv-lantern)" data-anim="glow"/>`);
    R('M338 446h16v20h-16Z', 'url(#rv-window)', `${st('#c8902a', 1.4)} data-anim="flicker"`);
    R('M334 446L346 436L358 446Z', '#2f2b44', st('#2f2b44', 1.2));
    add(`<path d="M332 445C338 440 352 440 360 445" stroke="#dfe6fa" stroke-width="3" stroke-linecap="round"/>`);
    add('</g>');
  });
  group('kicksled', 'Potkukelkka', 'Kick-sled', () => {
    add('<g transform="translate(-80 -2)">');
    add(`<path d="M220 514H306" stroke="${SHADE}" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>`);
    // runners curl up at the front (left) and run back under the rider's feet
    ink(`<path d="M214 506C206 506 206 512 214 512H312" fill="none" stroke="#5a6070" stroke-width="2.6" stroke-linecap="round"/>`);
    // seat legs, then the two backrest posts leaning back up to the handlebar
    ink(`<path d="M236 511V479M258 511V479M262 511L272 444M268 511L278 444M270 444H286" fill="none" stroke="#5a6070" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`);
    const seat = 'M226 470H268L264 480H230Z';
    R(seat, '#d9443a', st('#a83226', 1.4));
    // the backrest panel sits between the posts, at the back of the seat
    R('M263 471L266 450L276 450L273 471Z', '#d9443a', st('#a83226', 1.3));
    rim(seat, AUR, 1.4, 0.7);
    crescent(seat, WARM, 2.5, 2, 0.8);
    add('</g>');
  });

  // ---------------------------------------------------------------- front snow and what stands in it
  const frontPts = ridge({ seed: 61, base: 548, peaks: [{ x: 90, h: 18, w: 200 }, { x: 760, h: 22, w: 180 }], amp: 5, scale: 0.007, step: 10 });
  const frontD = closeDown(smooth(frontPts), frontPts, 600);
  group('snowFront', 'Pehmeä lumi', 'Soft snow', () => {
    R(frontD, 'url(#rv-snow2)', st('#c3d0f0', 2));
    rim(frontD, AUR, 3, 0.8);
    const Rn = rng(46);
    let g = '';
    for (let i = 0; i < 50; i++) { const x = Rn() * 800, y = 556 + Rn() * 42; g += `M${f(x)} ${f(y)}h1.6`; }
    add(`<path d="${g}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>`);
    // hare tracks hopping across
    const N = noise1(44);
    let tr = '';
    for (let i = 0; i < 9; i++) {
      const t = i / 8, x = 170 + t * 360 + N(t * 3, 2) * 16, y = 590 - t * 20;
      tr += `M${f(x)} ${f(y)}a2.4 3.6 0 1 0 0.1 0M${f(x + 7)} ${f(y - 1)}a2.4 3.6 0 1 0 0.1 0M${f(x + 3)} ${f(y + 8)}a1.6 2 0 1 0 0.1 0`;
    }
    add(`<path d="${tr}" fill="#b4c3ea" opacity=".8"/>`);
    S.seed(45);
    add('<g data-anim="snow">');
    // diamond dust: on a clear, very cold night the air itself freezes into glinting crystals that drift
    // down under the stars (falling snowflakes would need clouds). Two copies 610px apart loop seamlessly.
    const flakes = Array.from({ length: 34 }, () => [r(0, 800), r(0, 610), r(1.4, 3.2), r(.5, .95)]);
    for (const dy of [0, 610]) for (const [x, y, rr, o] of flakes) add(`<circle cx="${f(x)}" cy="${f(y + dy)}" r="${f(rr)}" fill="url(#rv-flake)" opacity="${f(o)}"/>`);
    add('</g>');
  });
  group('sled', 'Pulkka', 'Sled', () => {
    add('<g transform="translate(110 0)">');
    // a pulkka: deep tub with a curled front lip
    const d = 'M382 572C380 560 388 552 404 552H458C472 552 480 546 484 538C490 542 490 554 482 564C476 574 466 580 452 580H396C388 580 383 577 382 572Z';
    ground(430, 580, 100, { h: 20, colour: SHADE, op: 0.35 });
    R(d, '#e0302a', st('#a01a1a', 2));
    rim(d, '#ffb0a0', 1.8, 0.8);
    ink(`<path d="M402 562H454" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`);
    ink(`<path d="M484 548C498 548 504 566 520 574C532 580 546 578 552 574C558 569 552 563 545 566C538 570 541 578 552 579" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`);
    add('</g>');
  });
  const SM = [300, 0];
  // modelled at full size, drawn at 0.7× about its base: about 2 m tall for where it stands
  const SMT = `translate(${SM[0]} 580) scale(0.7) translate(${-SM[0]} -580)`;
  group('snowman', 'Lumiukko', 'Snowman', () => {
    ground(SM[0], 580, 50, { h: 100, colour: SHADE, op: 0.35 });
    add(`<g transform="${SMT}">`);
    for (const [cy, rr] of [[548, 32], [500, 23], [462, 17]]) {
      const d = `M${SM[0]} ${cy - rr}a${rr} ${rr} 0 1 1 0 ${rr * 2}a${rr} ${rr} 0 1 1 0 ${-rr * 2}Z`;
      R(d, 'url(#rv-snowman)', st('#c3d0f0', 2));
      shadow(d, SHADE, rr * 0.5, 0.3);
      rim(d, AUR, 2, 0.8);
    }
    for (const y of [490, 503, 516]) ink(`<circle cx="${SM[0]}" cy="${y}" r="2.6" fill="${INK}"/>`);
    ink(`<circle cx="${SM[0] - 6}" cy="458" r="2.2" fill="${INK}"/><circle cx="${SM[0] + 6}" cy="458" r="2.2" fill="${INK}"/>`);
    ink(`<path d="M${SM[0] - 7} 470q7 5 14 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`);
    ink(`<path d="M${SM[0] - 22} 498L${SM[0] - 48} 482M${SM[0] + 22} 498L${SM[0] + 48} 478M${SM[0] - 46} 483l-6-8M${SM[0] + 46} 479l4-9" fill="none" stroke="#5a3a2c" stroke-width="3" stroke-linecap="round"/>`);
    R(`M${SM[0] + 2} 463L${SM[0] + 24} 467L${SM[0] + 2} 469Z`, '#ff8c2e', st('#d9661a', 1.3));
    add('</g>');
  });
  group('clothes', 'Pipo ja kaulaliina', 'Beanie and scarf', () => {
    add(`<g transform="${SMT}">`);
    R(`M${SM[0] - 18} 476C${SM[0] - 8} 484 ${SM[0] + 8} 484 ${SM[0] + 18} 476L${SM[0] + 20} 484C${SM[0] + 8} 494 ${SM[0] - 8} 494 ${SM[0] - 21} 484Z`, '#e86fa8', st('#c04a88', 1.6));
    R(`M${SM[0] + 8} 486L${SM[0] + 16} 510L${SM[0] + 6} 512L${SM[0]} 488Z`, '#e86fa8', st('#c04a88', 1.6));
    add(`<path d="M${SM[0] - 14} 482l4 3M${SM[0] - 4} 486l4 1M${SM[0] + 6} 486l4 -1" stroke="#ffffff" stroke-width="2" opacity=".7"/>`);
    R(`M${SM[0] - 16} 452C${SM[0] - 17} 432 ${SM[0] + 17} 432 ${SM[0] + 16} 452Z`, '#5b8fd4', st('#3f6fb4', 1.6));
    R(`M${SM[0] - 19} 450H${SM[0] + 19}V457H${SM[0] - 19}Z`, '#fffaf2', st('#c9c0b0', 1.4));
    C(SM[0], 432, 5.5, '#fffaf2', st('#c9c0b0', 1.3));
    add('</g>');
  });
  group('hare', 'Metsäjänis', 'Snow hare', () => {
    ground(202, 590, 56, { h: 30, colour: SHADE, op: 0.35 });
    add('<g transform="translate(200 578)">');
    const body = 'M-26 12C-30 -4 -16 -18 2 -16C18 -14 26 -4 24 8C22 14 18 14 14 12C2 16 -20 18 -26 12Z';
    const head = 'M12 -14C10 -24 20 -30 28 -24C33 -20 32 -12 26 -10C20 -8 14 -10 12 -14Z';
    const earA = 'M16 -24C12 -38 14 -48 18 -50C22 -46 22 -36 20 -24Z', earB = 'M22 -24C22 -38 26 -46 30 -46C32 -40 28 -32 25 -23Z';
    R(earA, '#f4f6ff', st('#b9c4e0', 1.3)); R(earB, '#eef2ff', st('#b9c4e0', 1.3));
    R(body, '#f8faff', st('#b9c4e0', 1.6));
    shadow(body, SHADE, 10, 0.35);
    R(head, '#f8faff', st('#b9c4e0', 1.5));
    rim(body, AUR, 1.6, 0.8);
    ink(`<path d="M16 -50l2 6M28 -46l1 5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`);
    ink(`<circle cx="24" cy="-19" r="2" fill="${INK}"/>`);
    ink(`<circle cx="31" cy="-15" r="1.3" fill="#e08aa0"/>`);
    add('</g>');
  });

  // ---------------------------------------------------------------- framing spruces + the owl
  spruce('spruce0', 3, 30, 604, 280, 130, 9);
  spruce('spruce2', 12, 768, 604, 300, 136, 9);
  group('owl', 'Pöllö', 'Owl', () => {
    add('<g transform="translate(756 404)">');
    const body = 'M-12 18C-16 4 -14 -10 0 -12C14 -10 16 4 12 18C6 22 -6 22 -12 18Z';
    R(body, '#b9a48a', st('#8a7458', 1.5));
    shadow(body, SHADE, 6, 0.3);
    R('M-13 -8C-14 -20 14 -20 13 -8C10 -2 -10 -2 -13 -8Z', '#c9b49a', st('#8a7458', 1.4));
    R('M-12 -18L-10 -24L-5 -18ZM12 -18L10 -24L5 -18Z', '#8a7458', st('#6a5440', 1));
    C(-5, -10, 4.6, '#ffd84a', st('#c8a020', 1.1));
    C(5, -10, 4.6, '#ffd84a', st('#c8a020', 1.1));
    ink(`<circle cx="-5" cy="-10" r="2.2" fill="${INK}"/><circle cx="5" cy="-10" r="2.2" fill="${INK}"/>`);
    ink(`<path d="M-1.5 -5L0 -2L1.5 -5Z" fill="#7a5a30"/>`);
    add(`<path d="M-6 4q3 2 6 0M0 10q3 2 6 0M-8 12q3 2 6 0" fill="none" stroke="#7a6448" stroke-width="1.2"/>`);
    ink(`<path d="M-8 20v3M-4 20v3M4 20v3M8 20v3" stroke="#e0a030" stroke-width="1.8" stroke-linecap="round"/>`);
    add('</g>');
  });

  return S.build();
}
