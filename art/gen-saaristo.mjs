// "Saaristo" — the archipelago at golden hour, the last and richest picture (~50 areas):
// a lighthouse and keeper's house on pink granite, a jetty with a rowboat, a wind-bent pine,
// a sailboat in the sun's glitter path, swans, a seal, gulls, a kid in a kayak, and sea thrift.
// Light: the sun sits low behind the scene (right of centre), so every form is backlit:
// a cool, darker body, a thin hot rim on its upper-right edge, and a wavy reflection in the sea.
import { createScene } from './lib.mjs';
import { lightKit } from './light.mjs';
import {
  ridge, ridgeY, smooth, closeDown, poly, blob, rng, noise1, mix, simplify, grassTufts, cumulus, rock,
  islandSilhouette, cloudStreak, glitter, pineForm, lerp,
  setVariant,
} from './organic.mjs';

/** Build the picture. variant 0 is the original; any other number grows new shapes for the same areas. */
export default function generate(variant = 0) {
  setVariant(variant);
  const S = createScene({ id: 'saaristo', title: 'Saaristo', titleEn: 'Archipelago', seed: 71 });
  const { INK, R, C, add, ink, group, f } = S;
  const HY = 330; // horizon
  const SUN = [520, 318];
  const RIM = '#ffe2a0';
  const COOL = '#2a2350';

  S.def(`<linearGradient id="sa-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#232a64"/><stop offset=".3" stop-color="#57499a"/><stop offset=".55" stop-color="#c06e98"/>
      <stop offset=".78" stop-color="#ff9a5a"/><stop offset=".9" stop-color="#ffb860"/><stop offset="1" stop-color="#ffd884"/></linearGradient>
    <radialGradient id="sa-sunGlow" cx=".5" cy=".5"><stop offset="0" stop-color="#fff4c8" stop-opacity="1"/><stop offset=".15" stop-color="#ffd690" stop-opacity=".75"/>
      <stop offset=".45" stop-color="#ffa070" stop-opacity=".3"/><stop offset="1" stop-color="#ff9a7a" stop-opacity="0"/></radialGradient>
    <radialGradient id="sa-halo"><stop offset="0" stop-color="#fffbe8" stop-opacity=".95"/><stop offset=".5" stop-color="#fff6d0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>
    <radialGradient id="sa-sun" cx=".5" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#fff6c8"/><stop offset="1" stop-color="#ffd27a"/></radialGradient>
    <linearGradient id="sa-cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d68a6"/><stop offset=".6" stop-color="#b98aaf"/><stop offset="1" stop-color="#f3a98e"/></linearGradient>
    <linearGradient id="sa-cloudHigh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f4488"/><stop offset=".7" stop-color="#8e6ca6"/><stop offset="1" stop-color="#e09098"/></linearGradient>
    <linearGradient id="sa-cloudBank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a8"/><stop offset=".6" stop-color="#f5a080"/><stop offset="1" stop-color="#c47898"/></linearGradient>
    <linearGradient id="sa-sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffc88e"/><stop offset=".08" stop-color="#f0a084"/><stop offset=".3" stop-color="#9a7cb0"/>
      <stop offset=".62" stop-color="#3f4f8a"/><stop offset="1" stop-color="#1f3a6a"/></linearGradient>
    <radialGradient id="sa-sunSea" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff0b8" stop-opacity=".9"/><stop offset=".4" stop-color="#ffc98a" stop-opacity=".35"/><stop offset="1" stop-color="#ffc98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="sa-granite" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4e3a5e"/><stop offset=".55" stop-color="#7e5670"/><stop offset="1" stop-color="#c88a7e"/></linearGradient>
    <linearGradient id="sa-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87278"/><stop offset=".4" stop-color="#6e5274"/><stop offset="1" stop-color="#352a4c"/></linearGradient>
    <linearGradient id="sa-boulder" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a6a7a"/><stop offset="1" stop-color="#3a2c50"/></linearGradient>
    <linearGradient id="sa-tower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a8cb4"/><stop offset=".65" stop-color="#d8cad8"/><stop offset="1" stop-color="#fff0dc"/></linearGradient>
    <linearGradient id="sa-red" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2a40"/><stop offset=".65" stop-color="#b83c3c"/><stop offset="1" stop-color="#ef7a52"/></linearGradient>
    <linearGradient id="sa-ochre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a87a3e"/><stop offset=".7" stop-color="#d9a24a"/><stop offset="1" stop-color="#ffcf7a"/></linearGradient>
    <radialGradient id="sa-lamp" cx=".5" cy=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffe48a"/><stop offset="1" stop-color="#ffb84d"/></radialGradient>
    <radialGradient id="sa-lampGlow"><stop offset="0" stop-color="#fff2b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <linearGradient id="sa-beamL" gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="-40" y2="0"><stop offset="0" stop-color="#fff2c0" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></linearGradient>
    <linearGradient id="sa-beamR" gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="840" y2="0"><stop offset="0" stop-color="#fff2c0" stop-opacity=".4"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></linearGradient>
    <linearGradient id="sa-trunk" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="40"><stop offset="0" stop-color="#4a3a48"/><stop offset=".45" stop-color="#7d4e42"/><stop offset="1" stop-color="#d0703a"/></linearGradient>
    <radialGradient id="sa-pad" cx=".65" cy=".2" r=".9"><stop offset="0" stop-color="#6a8250"/><stop offset=".6" stop-color="#3d5a3e"/><stop offset="1" stop-color="#26402f"/></radialGradient>
    <linearGradient id="sa-sail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0c8b4"/><stop offset="1" stop-color="#fff3d8"/></linearGradient>
    <linearGradient id="sa-swan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8a8cc"/><stop offset=".7" stop-color="#e8dceb"/><stop offset="1" stop-color="#fff0e0"/></linearGradient>
    <linearGradient id="sa-seal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a5670"/><stop offset=".7" stop-color="#8a8498"/><stop offset="1" stop-color="#c8b8b0"/></linearGradient>
    <linearGradient id="sa-pool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc08c"/><stop offset="1" stop-color="#8a6caa"/></linearGradient>
    <linearGradient id="sa-walls" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a2a2c"/><stop offset=".7" stop-color="#9a3a30"/><stop offset="1" stop-color="#d9673f"/></linearGradient>
    <linearGradient id="sa-boards" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5a48"/><stop offset="1" stop-color="#c89a6a"/></linearGradient>`);

  const { st, rim, shadow, reflection, ledges, lichen, ground, foliage, water, crescent } = lightKit(S, 'sa', { light: [0.78, -0.62] });

  // ---------------------------------------------------------------- sky
  group('sky', 'Iltataivas', 'Evening sky', () => {
    R(`M0 0H800V${HY + 2}H0Z`, 'url(#sa-sky)');
    const Rn = rng(2);
    let d = '';
    for (let i = 0; i < 9; i++) { const x = Rn() * 800, y = 20 + Rn() * 120, w = 40 + Rn() * 90; d += `M${f(x)} ${f(y)}q${f(w / 2)} -3 ${f(w)} 0`; }
    add(`<path d="${d}" fill="none" stroke="#f0b8c8" stroke-opacity=".25" stroke-width="2" stroke-linecap="round"/>`);
    add(`<circle cx="690" cy="38" r="1.6" fill="#fff6dc" data-anim="twinkle"/><circle cx="120" cy="60" r="1.2" fill="#fff6dc" data-anim="twinkle" style="animation-delay:-1s"/>`);
  });
  group('sun', 'Laskeva aurinko', 'Setting sun', () => {
    add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="320" fill="url(#sa-sunGlow)" data-anim="glow"/>`);
    add(`<circle cx="${SUN[0]}" cy="${SUN[1] + 4}" r="70" fill="url(#sa-halo)"/>`);
    R(`M${SUN[0] - 28} ${HY + 1}A28 28 0 1 1 ${SUN[0] + 28} ${HY + 1}Z`, 'url(#sa-sun)', 'stroke="#ffe7a6" stroke-width="1.5"');
  });
  const clouds = [
    [200, 78, 340, 24, 'sa-cloudHigh', 3], [610, 128, 400, 20, 'sa-cloudHigh', 5],
    [330, 206, 280, 15, 'sa-cloud', 8], [720, 236, 200, 11, 'sa-cloud', 13],
  ];
  clouds.forEach(([x, y, w, th, grad, seed], i) => group(`cloud${i}`, 'Iltapilvi', 'Sunset cloud', () => {
    const c = cloudStreak({ seed, x, y, w, th });
    add('<g data-anim="drift">');
    R(c.body, `url(#${grad})`, 'stroke="#9a76ad" stroke-width=".6" stroke-opacity=".35"');
    const heat = 1 - Math.min(1, Math.hypot(x - SUN[0], y - SUN[1]) / 520);
    add(`<path d="${c.under}" fill="${mix('#f7a98e', '#ffe2a8', heat)}" opacity="${f(0.6 + heat * 0.4)}"/>`);
    add('</g>');
  }));
  group('cloudBank', 'Kultainen pilvi', 'Golden cloud', () => {
    const c = cumulus({ seed: 21, x: 676, y: 296, w: 170, h: 54 });
    add('<g data-anim="drift">');
    R(c.body, 'url(#sa-cloudBank)', 'stroke="#d98a8a" stroke-width=".6" stroke-opacity=".4"');
    shadow(c.body, '#8a5a8a', 22, 0.45);
    rim(c.body, '#fff2c0', 2.5, 0.95);
    add(`<path d="${c.base}" fill="#b0708e" opacity=".45"/>`);
    add('</g>');
  });

  // ---------------------------------------------------------------- islands
  const farD = [
    islandSilhouette({ seed: 4, xa: 350, xb: 452, y0: HY, h: 4, treeMin: 2, treeMax: 6 }),
    islandSilhouette({ seed: 5, xa: 596, xb: 712, y0: HY, h: 2, treeMin: 3, treeMax: 8 }),
  ];
  const nearD = islandSilhouette({ seed: 6, xa: 640, xb: 840, y0: HY + 14, h: 9, treeMin: 10, treeMax: 30, kinds: { spruce: 4, pine: 3 } });
  group('islandsFar', 'Kaukaiset saaret', 'Distant islands', () => {
    for (const d of farD) R(d, '#c08aa0', 'stroke="#a8789a" stroke-width=".8"');
  });
  group('islandNear', 'Metsäsaari', 'Wooded island', () => {
    R(nearD, '#45406e', st('#45406e', 'far'));
    rim(nearD, RIM, 1.4, 0.9);
    add(`<rect x="742" y="${HY + 4}" width="8" height="6" fill="#45406e"/><rect x="744" y="${HY + 5.5}" width="4" height="3" fill="#ffd27a" data-anim="flicker"/>`);
  });
  group('sailboat2', 'Kaukainen purje', 'Distant sail', () => {
    R(`M694 ${HY + 6}h18l-3 3h-12Z`, '#3a2f4f', st('#3a2f4f', 'far'));
    R(`M703 ${HY - 16}V${HY + 5}H714Z`, '#fff0dc', st('#e8b49a', 'far'));
    R(`M702 ${HY - 13}V${HY + 5}H693Z`, '#ffe6cc', st('#e8b49a', 'far'));
  });

  // ---------------------------------------------------------------- shared geometry
  const skerryPts = ridge({ seed: 9, base: 420, peaks: [{ x: 300, h: 50, w: 190, k: 1.15 }, { x: 178, h: 30, w: 92 }, { x: 440, h: 16, w: 64 }], amp: 3, x0: 96, x1: 510, step: 4 });
  const skerryD = closeDown(smooth(skerryPts), skerryPts, 423);
  const LX = 300, LB = 380, LT = 252;
  const thw = (y) => 11 + (y - LT) / (LB - LT) * 7.5;
  const towerD = `M${LX - thw(LB)} ${LB + 1}Q${f(LX - 15.5)} 316 ${LX - thw(LT)} ${LT}L${LX + thw(LT)} ${LT}Q${f(LX + 15.5)} 316 ${f(LX + thw(LB))} ${LB + 1}Z`;
  const band = (y0, y1) => `M${f(LX - thw(y0) - 0.3)} ${y0}L${f(LX + thw(y0) + 0.3)} ${y0}L${f(LX + thw(y1) + 0.3)} ${y1}L${f(LX - thw(y1) - 0.3)} ${y1}Z`;
  const bandsD = [band(268, 290), band(320, 342)];
  const roofD = `M287 234Q300 214 313 234Z`;
  const bhY = ridgeY(skerryPts, 198) + 5;
  const bhWalls = `M170 ${f(bhY)}V${f(bhY - 30)}L198 ${f(bhY - 48)}L226 ${f(bhY - 30)}V${f(bhY)}Z`;
  const bhRoof = `M162 ${f(bhY - 27)}L198 ${f(bhY - 52)}L234 ${f(bhY - 27)}L229 ${f(bhY - 24)}L198 ${f(bhY - 45)}L167 ${f(bhY - 24)}Z`;
  const khY = ridgeY(skerryPts, 356) + 5;
  const khWalls = `M330 ${f(khY)}V${f(khY - 24)}L356 ${f(khY - 40)}L382 ${f(khY - 24)}V${f(khY)}Z`;
  const khRoof = `M325 ${f(khY - 21)}L356 ${f(khY - 44)}L387 ${f(khY - 21)}L383 ${f(khY - 18)}L356 ${f(khY - 38)}L329 ${f(khY - 18)}Z`;
  const BOAT = [536, 368];
  const hullD = `M${BOAT[0] - 26} ${BOAT[1] - 6}H${BOAT[0] + 26}L${BOAT[0] + 20} ${BOAT[1] + 1}Q${BOAT[0]} ${BOAT[1] + 4} ${BOAT[0] - 20} ${BOAT[1] + 1}Z`;
  const mainD = `M${BOAT[0] + 1} ${BOAT[1] - 58}L${BOAT[0] + 1} ${BOAT[1] - 9}L${BOAT[0] + 25} ${BOAT[1] - 10}Q${BOAT[0] + 14} ${BOAT[1] - 32} ${BOAT[0] + 1} ${BOAT[1] - 58}Z`;
  const jibD = `M${BOAT[0] - 1} ${BOAT[1] - 54}L${BOAT[0] - 1} ${BOAT[1] - 10}L${BOAT[0] - 22} ${BOAT[1] - 9}Q${BOAT[0] - 10} ${BOAT[1] - 30} ${BOAT[0] - 1} ${BOAT[1] - 54}Z`;
  const JY = 414; // jetty deck
  const deckD = `M466 ${JY}H612L616 ${JY + 6}H462Z`;
  const rowD = 'M600 440C612 452 664 454 682 440L678 434H604Z';

  // ---------------------------------------------------------------- sea
  group('sea', 'Meri', 'Sea', () => {
    R(`M0 ${HY}H800V600H0Z`, 'url(#sa-sea)');
    add(`<path d="M${SUN[0] - 280} ${HY}A280 130 0 0 0 ${SUN[0] + 280} ${HY}Z" fill="url(#sa-sunSea)"/>`);
    add(`<g transform="translate(0 ${2 * HY}) scale(1 -1)" opacity=".35">${farD.map((d) => `<path d="${d}" fill="#a07090"/>`).join('')}</g>`);
    reflection(`<path d="${nearD}" fill="#2f2c58"/>`, HY + 14, { depth: 34, amp: 2, seed: 3, opacity: 0.6, x0: 600 });
    water({ seed: 21, y0: HY + 6, y1: 600, rows: 30, gate: 0.2, calm: 0.2, skip: (x) => Math.abs(x - SUN[0]) < 30 }, { lit: '#ffd9b8', dark: '#1f2a5a' });
    // the sun's glitter path: brightest and densest down the middle
    add('<g data-anim="shimmer">');
    const gl = glitter({ seed: 11, cx: SUN[0], y0: HY + 2, y1: 600, w0: 14, w1: 190, n: 440 });
    for (const o of [0.35, 0.65, 1]) {
      const d = gl.filter((g) => g.o <= o && g.o > o - 0.35).map((g) => g.d).join('');
      add(`<path d="${d}" stroke="#fff3cc" stroke-opacity="${o}" stroke-width="${f(1.4 + o * 1.6)}" stroke-linecap="round"/>`);
    }
    add('</g>');
    // the skerry, jetty and boats mirrored and broken by the swell (dark, cool, anchored to the rock)
    reflection(`<path d="${skerryD}" fill="#3a2a50"/><path d="${towerD}" fill="#a898b8"/>${bandsD.map((d) => `<path d="${d}" fill="#7a3048"/>`).join('')}<path d="${bhWalls}" fill="#5a2a34"/><path d="${khWalls}" fill="#9a7a4a"/>`, 421, { depth: 170, amp: 4, seed: 5, opacity: 0.6, x0: 80, x1: 520 });
    reflection(`<path d="${deckD}" fill="#5a4048"/>${[480, 520, 560, 600].map((x) => `<path d="M${x - 3} ${JY + 6}h6v18h-6Z" fill="#3a2a38"/>`).join('')}<path d="${rowD}" fill="#8a3a3a"/>`, 440, { depth: 40, amp: 2.5, seed: 9, opacity: 0.5, x0: 460, x1: 700 });
    reflection(`<path d="${mainD}" fill="#f7d7b8"/><path d="${jibD}" fill="#f7d7b8"/><path d="${hullD}" fill="#3a2f4f"/>`, BOAT[1] + 1, { depth: 60, amp: 2.5, seed: 7, opacity: 0.45, x0: 490, x1: 590 });
    const N = noise1(31);
    let foam = '';
    for (let x = 104; x < 504; x += 10) { const w = 4 + 6 * (0.5 + 0.5 * N(x * 0.05, 2)); foam += `M${x} ${f(422 + N(x * 0.1, 2) * 1.5)}q${f(w / 2)} -1.6 ${f(w)} 0`; }
    add(`<path d="${foam}" fill="none" stroke="#fff4ea" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round" data-anim="shimmer"/>`);
  });
  group('buoy', 'Poiju', 'Buoy', () => {
    add('<g data-anim="rock">');
    const d = 'M682 424L690 396L698 424Z';
    add(`<ellipse cx="690" cy="426" rx="14" ry="3" fill="${COOL}" opacity=".35"/>`);
    R(d, '#d0403a', st('#d0403a', 'mid'));
    R('M684 418h12v3h-12Z', '#f6eadc', st('#c9b8a8', 1));
    R('M686 392L690 384L694 392Z', '#2a2a3a', st('#2a2a3a', 1));
    rim(d, RIM, 1.4, 0.9);
    add('</g>');
  });

  // ---------------------------------------------------------------- sailboat
  group('sailboat', 'Purjevene', 'Sailboat', () => {
    add('<g data-anim="rock">');
    R(hullD, '#2f2846', st('#2f2846', 'mid'));
    rim(hullD, RIM, 1.4, 1);
    ink(`<path d="M${BOAT[0]} ${BOAT[1] - 6}V${BOAT[1] - 62}" stroke="#3a2f4f" stroke-width="1.6"/>`);
    add('</g>');
  });
  group('sails', 'Purjeet', 'Sails', () => {
    add('<g data-anim="rock">');
    R(mainD, 'url(#sa-sail)', st('#e8b49a', 1.2));
    R(jibD, 'url(#sa-sail)', st('#e8b49a', 1.2));
    add(`<path d="${mainD}" fill="#ffd27a" opacity=".4"/>`);
    ink(`<path d="M${BOAT[0] + 2} ${BOAT[1] - 40}l14 -1M${BOAT[0] + 2} ${BOAT[1] - 26}l18 -1" stroke="#c89880" stroke-width="1" stroke-opacity=".7"/>`);
    add('</g>');
  });

  // ---------------------------------------------------------------- the lighthouse skerry
  group('skerry', 'Graniittiluoto', 'Granite skerry', () => {
    R(skerryD, 'url(#sa-granite)', st('#7e5670', 'mid'));
    shadow(skerryD, COOL, 26, 0.45);
    rim(skerryD, RIM, 2.4, 1);
    ledges(skerryPts, [[10, 150, 220], [18, 250, 330], [12, 380, 440], [26, 120, 170], [22, 340, 380]]);
    lichen(14, 60, 120, 480, 378, 418, (x, y) => y > ridgeY(skerryPts, x) + 3, ['#e09a4a', '#b9c08a', '#e8d8c0'], 0.6);
  });
  group('seaweed', 'Rakkolevä', 'Seaweed', () => {
    S.def(`<clipPath id="sa-skClip"><path d="${skerryD}"/></clipPath>`);
    const N = noise1(77);
    const top = [];
    for (let x = 96; x <= 510; x += 6) top.push([x, 415 + N(x * 0.08, 2) * 3]);
    const d = smooth(top) + 'L510 424L96 424Z';
    R(d, '#3e3424', `${st('#3e3424', 1)} clip-path="url(#sa-skClip)"`);
    add(`<path d="${smooth(top.map(([x, y]) => [x, y + 1]))}" fill="none" stroke="#8a7a3a" stroke-width="1.2" opacity=".7" clip-path="url(#sa-skClip)"/>`);
  });
  group('pineSmall', 'Pieni mänty', 'Little pine', () => {
    const pm = pineForm({ seed: 31, x: 128, y: ridgeY(skerryPts, 128) + 6, h: 70, w: 5, lean: 0.3, branches: 4, padR: [12, 18], reach: 0.4 });
    for (const b of pm.branches) R(b, 'url(#sa-trunk)', st('#7d4e42', 1));
    R(pm.trunk, 'url(#sa-trunk)', st('#7d4e42', 1.2));
    foliage(pm.pads.map((p) => ({ ...p })), { fill: 'url(#sa-pad)', base: '#3d5a3e', dark: '#1a2c24', rimColour: RIM, underK: 0.3 });
  });
  group('boathouse', 'Venevaja', 'Boathouse', () => {
    R(bhWalls, 'url(#sa-walls)', st('#9a3a30', 'mid'));
    for (let x = 176; x < 224; x += 6) ink(`<path d="M${x} ${f(bhY - 1)}V${f(bhY - 30 - Math.max(0, 18 - Math.abs(x - 198) * 18 / 28))}" stroke="${INK}" stroke-opacity=".22" stroke-width="1"/>`);
    R(`M186 ${f(bhY)}V${f(bhY - 22)}H210V${f(bhY)}Z`, '#4a2228', st('#4a2228', 1.3));
    shadow(bhWalls, COOL, 14, 0.45);
    rim(bhWalls, RIM, 1.8, 1);
    add(`<path d="M168 ${f(bhY + 1)}h60" stroke="#4a3a52" stroke-width="3" stroke-linecap="round"/>`);
  });
  group('boathouseRoof', 'Venevajan katto', 'Boathouse roof', () => {
    R(bhRoof, '#33294a', st('#33294a', 1.4));
    rim(bhRoof, RIM, 1.6, 1);
  });
  group('keeperHouse', 'Majakanvartijan talo', "Keeper's house", () => {
    ground(356, khY, 60, { h: 30, colour: COOL });
    R(khWalls, 'url(#sa-ochre)', st('#d9a24a', 'mid'));
    for (let x = 336; x < 380; x += 5) ink(`<path d="M${x} ${f(khY - 1)}V${f(khY - 24 - Math.max(0, 16 - Math.abs(x - 356) * 16 / 26))}" stroke="${INK}" stroke-opacity=".18" stroke-width="1"/>`);
    shadow(khWalls, COOL, 14, 0.45);
    rim(khWalls, RIM, 1.8, 1);
  });
  group('keeperRoof', 'Talon katto', 'House roof', () => {
    R(khRoof, '#a83a34', st('#a83a34', 1.3));
    rim(khRoof, RIM, 1.6, 1);
    R(`M368 ${f(khY - 40)}h6v10h-6Z`, '#6a5a6a', st('#6a5a6a', 1));
  });
  group('keeperWindows', 'Lämpimät ikkunat', 'Lit windows', () => {
    for (const x of [335, 367]) {
      add(`<rect x="${x - 4}" y="${f(khY - 22)}" width="18" height="16" fill="#ffd27a" opacity=".35" filter="url(#sa-soft3)"/>`);
      R(`M${x} ${f(khY - 18)}h10v10h-10Z`, 'url(#sa-lamp)', `${st('#c89a3a', 1.1)} data-anim="flicker"`);
      ink(`<path d="M${x + 5} ${f(khY - 18)}v10M${x} ${f(khY - 13)}h10" stroke="${INK}" stroke-width="1"/>`);
    }
  });
  group('flagpole', 'Lipputanko', 'Flagpole', () => {
    const gy = ridgeY(skerryPts, 404) + 4;
    R(`M402 ${f(gy)}V312h3V${f(gy)}Z`, '#e8dcd8', st('#b8a8b8', 1));
    C(403.5, 310, 2.6, '#ffd166', st('#d9a020', 1));
  });
  group('flag', 'Siniristilippu', 'Finnish flag', () => {
    add('<g data-anim="wave">');
    const d = 'M405 314C414 311 422 317 432 314V332C422 335 414 329 405 332Z';
    R(d, '#fff6ee', st('#c9c0d0', 1.1));
    add(`<path d="M405 320.5C414 318 422 324 432 321V325.5C422 328.5 414 322.5 405 325Z" fill="#2f5fb3"/><path d="M411 313V331.6C412.4 331.3 414 331 415.4 331.1V312.3C414 312.4 412.4 312.6 411 313Z" fill="#2f5fb3"/>`);
    rim(d, RIM, 1.2, 0.9);
    add('</g>');
  });
  group('lighthouse', 'Majakka', 'Lighthouse', () => {
    ground(LX, LB, 40, { h: 128, colour: COOL });
    R(towerD, 'url(#sa-tower)', st('#9a8cb4', 'mid'));
    shadow(towerD, '#3a2c5c', 12, 0.45);
    rim(towerD, RIM, 2, 1);
    R(`M${LX - 16} ${LT + 5}H${LX + 16}V${LT}H${LX - 16}Z`, '#33294a', st('#33294a', 1.2));
    ink(`<path d="M${LX - 14} ${LT}V${LT - 8}H${LX + 14}V${LT}M${LX - 7} ${LT}V${LT - 8}M${LX} ${LT}V${LT - 8}M${LX + 7} ${LT}V${LT - 8}" fill="none" stroke="${INK}" stroke-width="1.2"/>`);
  });
  group('bands', 'Majakan punaiset raidat', 'Red stripes', () => {
    for (const d of bandsD) { R(d, 'url(#sa-red)', st('#b83c3c', 1.4)); rim(d, RIM, 1.8, 0.9); }
    R(roofD, 'url(#sa-red)', st('#b83c3c', 1.4));
    ink(`<path d="M${LX} 222V212" stroke="${INK}" stroke-width="1.6"/>`);
    ink(`<circle cx="${LX}" cy="211" r="2" fill="${INK}"/>`);
  });
  group('lighthouseDoor', 'Majakan ovi ja ikkunat', 'Door and windows', () => {
    R(`M${LX - 5} ${LB + 1}V${LB - 14}Q${LX} ${LB - 20} ${LX + 5} ${LB - 14}V${LB + 1}Z`, '#3f5a6c', st('#3f5a6c', 1.2));
    for (const y of [304, 354]) R(`M${LX - 2.5} ${y}h5v8h-5Z`, '#ffd27a', `${st('#c89a3a', 1)} data-anim="flicker"`);
  });
  group('lantern', 'Majakan valo', 'Lighthouse lamp', () => {
    add(`<g data-anim="glow">`);
    add(`<path d="M${LX} 240L-40 186L-40 270Z" fill="url(#sa-beamL)"/>`);
    add(`<path d="M${LX} 240L840 216L840 252Z" fill="url(#sa-beamR)"/>`);
    add(`<circle cx="${LX}" cy="243" r="38" fill="url(#sa-lampGlow)"/>`);
    add('</g>');
    R(`M${LX - 9} 252V234H${LX + 9}V252Z`, 'url(#sa-lamp)', `${st('#e0a040', 1.2)} data-anim="flicker"`);
    ink(`<path d="M${LX - 3} 234V252M${LX + 3} 234V252" stroke="${INK}" stroke-width="1" stroke-opacity=".7"/>`);
  });

  // ---------------------------------------------------------------- jetty, fish boxes, lifebuoy, rowboat
  group('jetty', 'Laituri', 'Jetty', () => {
    for (const x of [480, 520, 560, 600]) R(`M${x - 3} ${JY + 6}h6v16h-6Z`, '#4a3440', st('#4a3440', 1.2));
    R(deckD, 'url(#sa-boards)', st('#9a7458', 'mid'));
    for (let x = 474; x < 612; x += 9) ink(`<path d="M${x} ${JY + 0.5}l-.5 5" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>`);
    R(`M462 ${JY + 6}H616V${JY + 10}H462Z`, '#5a4048', st('#5a4048', 1.1));
    R(`M610 ${JY + 8}V390h5V${JY + 8}Z`, '#5a4048', st('#5a4048', 1.1));
    rim(deckD, RIM, 1.4, 1);
  });
  group('fishBoxes', 'Kalalaatikot', 'Fish boxes', () => {
    for (const [x, y, w, c] of [[478, JY - 12, 22, '#4a7aa8'], [500, JY - 10, 18, '#e0a03a'], [486, JY - 22, 18, '#d0503a']]) {
      const d = `M${x} ${y}h${w}v${y === JY - 22 ? 10 : 12}h${-w}Z`;
      R(d, c, st(c, 1.2));
      shadow(d, COOL, 6, 0.4);
      rim(d, RIM, 1.2, 1);
    }
  });
  group('lifebuoy', 'Pelastusrengas', 'Lifebuoy', () => {
    const ring = 'M612.5 392a9 9 0 1 1 0 18a9 9 0 1 1 0 -18Z M612.5 396.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0 -9Z';
    R(ring, '#ff6a4a', `${st('#c8402f', 1.2)} fill-rule="evenodd"`);
    add(`<path d="M612.5 392v4.5M612.5 405.5v4.5M603.5 401h4.5M617 401h4.5" stroke="#ffffff" stroke-width="3"/>`);
    rim(ring, RIM, 1.2, 0.9);
  });
  group('rowboat', 'Soutuvene', 'Rowboat', () => {
    ink(`<path d="M604 438C600 428 606 420 612 420" fill="none" stroke="${INK}" stroke-width="1.2"/>`);
    add('<g data-anim="rock">');
    R(rowD, '#c84a3a', st('#c84a3a', 'mid'));
    R('M604 434H678L676 430H606Z', '#8a5a40', st('#8a5a40', 1));
    ink(`<path d="M628 430v6M656 430v6" stroke="${INK}" stroke-width="1.4"/>`);
    shadow(rowD, COOL, 8, 0.45);
    rim(rowD, RIM, 1.6, 1);
    add('</g>');
  });

  // ---------------------------------------------------------------- the kayak
  const KX = 694, KY = 480;
  group('kayak', 'Kajakki', 'Kayak', () => {
    add(`<path d="M${KX - 60} ${KY + 4}q30 -3 60 0q30 3 60 0M${KX + 50} ${KY + 8}q20 6 40 14M${KX + 50} ${KY}q24 -2 46 4" fill="none" stroke="#fff0dc" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round" data-anim="shimmer"/>`);
    const d = `M${KX - 50} ${KY}C${KX - 30} ${KY - 6} ${KX + 30} ${KY - 6} ${KX + 50} ${KY}C${KX + 30} ${KY + 6} ${KX - 30} ${KY + 6} ${KX - 50} ${KY}Z`;
    R(d, '#e0443a', st('#e0443a', 'mid'));
    R(`M${KX - 10} ${KY - 3}a12 3.4 0 1 0 24 0a12 3.4 0 1 0 -24 0Z`, '#2a2438', st('#2a2438', 1));
    shadow(d, COOL, 5, 0.4);
    rim(d, RIM, 1.4, 1);
  });
  group('kayaker', 'Melojalapsi', 'Kid paddling', () => {
    add('<g data-anim="bob">');
    ink(`<path d="M${KX - 30} ${KY + 10}L${KX + 34} ${KY - 34}" stroke="#4a3a40" stroke-width="2.4" stroke-linecap="round"/>`);
    R(`M${KX - 36} ${KY + 12}l8 -10l6 4l-8 10Z`, '#f2c14e', st('#c89a2e', 1));
    R(`M${KX + 30} ${KY - 38}l10 -2l-2 8l-8 2Z`, '#f2c14e', st('#c89a2e', 1));
    const vest = `M${KX - 6} ${KY - 3}C${KX - 8} ${KY - 16} ${KX - 4} ${KY - 26} ${KX + 2} ${KY - 26}C${KX + 8} ${KY - 26} ${KX + 12} ${KY - 16} ${KX + 10} ${KY - 3}Z`;
    R(vest, '#ffc23a', st('#d9962a', 1.3));
    const head = `M${KX + 2} ${KY - 42}a8 8 0 1 1 0 16a8 8 0 1 1 0 -16Z`;
    R(head, '#f2c8a8', st('#c89a7a', 1.2));
    R(`M${KX - 6} ${KY - 34}C${KX - 6} ${KY - 46} ${KX + 10} ${KY - 46} ${KX + 10} ${KY - 34}Z`, '#3f6fb4', st('#3f6fb4', 1.1));
    ink(`<circle cx="${KX - 1}" cy="${KY - 32}" r="1.2" fill="${INK}"/><path d="M${KX - 3} ${KY - 29}q2 1.5 4 0" fill="none" stroke="${INK}" stroke-width="1"/>`);
    shadow(vest, COOL, 6, 0.35);
    rim(vest, RIM, 1.4, 1);
    rim(head, RIM, 1.2, 1);
    add('</g>');
  });

  // ---------------------------------------------------------------- swans (whooper swans, upright necks)
  const swanBody = 'M-30 2C-32 -6 -24 -12 -10 -12C2 -12 10 -16 18 -24C24 -28 31 -26 32 -19C34 -11 30 -2 24 4C12 10 -18 10 -30 2Z';
  const swanNeck = 'M-24 -6C-26 -20 -24 -36 -24 -46C-24 -50 -28 -54 -33 -53L-44 -50C-44 -47 -38 -47 -34 -47C-31 -46 -30 -42 -30 -36C-30 -24 -32 -14 -30 -4Z';
  const swanBill = 'M-34 -53L-48 -50L-46 -46L-34 -47Z';
  const swan = (key, x, y, s, delay) => group(key, 'Laulujoutsen', 'Whooper swan', () => {
    const T = `translate(${x} ${y}) scale(${s})`;
    add(`<g transform="${T}"><path d="M-30 6q-30 6 -70 18M28 6q30 8 60 22" fill="none" stroke="#fff0dc" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round"/></g>`);
    add(`<g transform="${T}" opacity=".45"><g transform="scale(1 -1) translate(0 -6)"><path d="${swanBody}" fill="#8a7aa8"/><path d="${swanNeck}" fill="#8a7aa8"/></g></g>`);
    add(`<g transform="${T}"><g data-anim="paddle" style="animation-delay:-${delay}s">`);
    R(swanBody, 'url(#sa-swan)', st('#b8a8cc', 1.5));
    shadow(swanBody, '#4a3a6c', 12, 0.45);
    rim(swanBody, RIM, 1.6, 1);
    R(swanNeck, 'url(#sa-swan)', st('#b8a8cc', 1.4));
    shadow(swanNeck, '#4a3a6c', 4, 0.35);
    rim(swanNeck, RIM, 1.2, 1);
    R(swanBill, '#f2c14e', st('#c89a2e', 1));
    ink(`<path d="M-48 -50L-41 -50" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`);
    ink(`<circle cx="-31" cy="-50" r="1.1" fill="${INK}"/>`);
    ink(`<path d="M-10 -6C0 -10 10 -12 20 -20M-6 0C6 -2 16 -4 24 -10" fill="none" stroke="${INK}" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round"/>`);
    add('</g></g>');
  });
  swan('swan0', 420, 500, 1, 0);
  swan('swan1', 528, 530, 0.86, 2.5);

  // ---------------------------------------------------------------- foreground rocks (faceted granite)
  const facet = (pts) => poly(simplify(pts, 2.6), false);
  const rockRPts = ridge({ seed: 41, base: 640, peaks: [{ x: 740, h: 118, w: 200, k: 1.2 }, { x: 604, h: 52, w: 90 }], amp: 7, x0: 520, x1: 820, step: 5 });
  const rockRD = closeDown(facet(rockRPts), rockRPts, 610);
  const rockLPts = ridge({ seed: 43, base: 640, peaks: [{ x: 60, h: 186, w: 260, k: 1.1 }, { x: 236, h: 88, w: 150, k: 1.4 }], amp: 8, x0: -20, x1: 420, step: 5 });
  const rockLD = closeDown(facet(rockLPts), rockLPts, 610);
  const cracks = (pts, seed, xs) => {
    const Rn = rng(seed);
    let d = '';
    for (const x of xs) {
      let xx = x, yy = ridgeY(pts, x) + 6;
      d += `M${f(xx)} ${f(yy)}`;
      for (let k = 0; k < 4; k++) { xx += (Rn() - 0.4) * 6; yy += 6 + Rn() * 8; d += `L${f(xx)} ${f(yy)}`; }
    }
    ink(`<path d="${d}" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>`);
  };
  group('rockR', 'Rantakallio', 'Shore rock', () => {
    R(rockRD, 'url(#sa-rock)', st('#6e5274', 'near'));
    shadow(rockRD, COOL, 34, 0.5);
    rim(rockRD, RIM, 2.6, 1);
    ledges(rockRPts, [[14, 650, 720], [30, 570, 630], [44, 740, 800], [22, 760, 812]], { lit: '#ffc8a0', dark: '#20183a' });
    cracks(rockRPts, 46, [620, 690, 770]);
    lichen(44, 80, 540, 800, 520, 600, (x, y) => y > ridgeY(rockRPts, x) + 4, ['#e09a4a', '#b9c08a', '#e8d8c0'], 0.6);
  });
  group('pool', 'Kalliolammikko', 'Rock pool', () => {
    const d = blob({ seed: 9, cx: 726, cy: 560, r: 34, ry: 7, lobes: 5, scallop: 0.05, wobble: 0.12 });
    R(d, 'url(#sa-pool)', st('#6a4a86', 1.4));
    add(`<path d="M704 558h18M730 562h12" stroke="#fff3cc" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round" data-anim="shimmer"/>`);
  });
  group('seal', 'Hylje', 'Seal', () => {
    const gy = ridgeY(rockRPts, 600) + 10;
    add(`<g transform="translate(600 ${f(gy)})">`);
    const body = 'M-36 4C-36 -8 -20 -14 0 -14C14 -14 22 -18 30 -26C34 -30 41 -28 41 -22C41 -14 35 -6 27 -2C18 4 6 8 -10 8C-24 8 -36 10 -36 4Z';
    R('M-36 4L-48 -2L-45 6L-50 12L-36 8Z', '#5a5670', st('#5a5670', 1.2));
    R(body, 'url(#sa-seal)', st('#6a6680', 'near'));
    shadow(body, COOL, 10, 0.4);
    rim(body, RIM, 1.8, 1);
    R('M4 4C8 8 14 10 18 8C14 4 10 2 6 2Z', '#5a5670', st('#4a4660', 1));
    ink(`<circle cx="34" cy="-24" r="1.8" fill="${INK}"/><path d="M39 -20l6 -1M39 -19l6 1M38 -18l5 2" stroke="${INK}" stroke-width=".8" stroke-opacity=".6"/>`);
    add(`<path d="M-20 -6q4 2 8 0M-4 -8q4 2 8 0M-14 0q4 2 8 0" fill="none" stroke="#3a3650" stroke-opacity=".4" stroke-width="1.2"/>`);
    add('</g>');
  });
  group('thrift', 'Laukkaneilikat', 'Sea thrift', () => {
    const Rn = rng(51);
    for (const cx of [640, 700, 780]) {
      const gy = ridgeY(rockRPts, cx) + 10;
      let ros = '';
      for (let k = 0; k < 12; k++) { const a = Math.PI * (1.1 + k / 11 * 0.8), l = 10 + Rn() * 6; ros += `M${cx} ${f(gy)}q${f(Math.cos(a) * l * 0.5)} ${f(Math.sin(a) * l * 0.8)} ${f(Math.cos(a) * l)} ${f(Math.sin(a) * l * 0.6)}`; }
      add(`<path d="${ros}" fill="none" stroke="#6f8a3e" stroke-width="1.6" stroke-linecap="round"/>`);
      const heads = 5 + Math.floor(Rn() * 3);
      for (let i = 0; i < heads; i++) {
        const x = cx + (i - heads / 2) * 5 + (Rn() - 0.5) * 4, h = 18 + Rn() * 26;
        const hx = x + (Rn() - 0.5) * 6, hy = gy - h, r = 4 + Rn() * 2;
        add(`<g data-anim="sway" style="animation-delay:-${f(Rn() * 3)}s">`);
        ink(`<path d="M${f(x)} ${f(gy)}Q${f(x + (hx - x) * 0.3)} ${f(gy - h * 0.6)} ${f(hx)} ${f(hy)}" fill="none" stroke="#5f7a3a" stroke-width="1.2"/>`);
        const d = blob({ seed: Math.round(hx * 10 + i), cx: hx, cy: hy, r, ry: r * 0.92, lobes: 9, scallop: 0.2, wobble: 0.06, n: 40 });
        R(d, '#ee8ab4', st('#ee8ab4', 1));
        add(`<circle cx="${f(hx - 1)}" cy="${f(hy + 1)}" r="${f(r * 0.45)}" fill="#a84a7e" opacity=".35"/>`);
        rim(d, '#ffe8ee', 1.2, 0.9);
        add('</g>');
      }
    }
  });
  group('gulls', 'Lokit', 'Gulls', () => {
    for (const [x, y, s, dl] of [[420, 150, 1, 0], [450, 164, 0.8, 0.6], [640, 96, 0.9, 1.2], [372, 208, 0.65, 0.3]]) {
      const d = `M${f(x - 16 * s)} ${f(y - 2 * s)}Q${f(x - 7 * s)} ${f(y - 11 * s)} ${x} ${f(y)}Q${f(x + 7 * s)} ${f(y - 11 * s)} ${f(x + 16 * s)} ${f(y - 2 * s)}Q${f(x + 7 * s)} ${f(y - 5 * s)} ${x} ${f(y + 2.5 * s)}Q${f(x - 7 * s)} ${f(y - 5 * s)} ${f(x - 16 * s)} ${f(y - 2 * s)}Z`;
      R(d, '#e8e0ec', `${st('#8a7a9a', 1)} data-anim="bob" style="animation-delay:-${dl}s"`);
    }
    // one gull resting on the shore rock
    const gx = 770, gy = ridgeY(rockRPts, 770) + 4;
    add(`<g transform="translate(${gx} ${f(gy)})">`);
    const body = 'M-14 -6C-16 -14 -6 -18 4 -16C10 -15 14 -12 16 -8C10 -4 -6 -2 -14 -6Z';
    R(body, '#f2ecf0', st('#a898b0', 1.2));
    R('M-8 -14C-4 -18 6 -18 12 -12C6 -10 -2 -10 -8 -14Z', '#9a94ac', st('#7a7490', 1));
    R('M-14 -10C-18 -20 -10 -26 -6 -22C-4 -20 -6 -16 -8 -14Z', '#f2ecf0', st('#a898b0', 1.1));
    R('M-17 -20L-24 -19L-17 -18Z', '#f2c14e', st('#c89a2e', .8));
    ink(`<circle cx="-12" cy="-21" r=".9" fill="${INK}"/><path d="M-2 -4v6M2 -4v6" stroke="#e0a03a" stroke-width="1.4"/>`);
    rim(body, RIM, 1.2, 1);
    add('</g>');
  });
  group('rockL', 'Graniittikallio', 'Granite rock', () => {
    R(rockLD, 'url(#sa-rock)', st('#6e5274', 'near'));
    shadow(rockLD, COOL, 40, 0.5);
    rim(rockLD, RIM, 3, 1);
    ledges(rockLPts, [[16, 10, 90], [34, 120, 220], [58, 20, 100], [22, 240, 320], [80, 60, 170], [110, 0, 70]], { lit: '#ffc8a0', dark: '#20183a' });
    cracks(rockLPts, 48, [40, 110, 190, 270, 330]);
    lichen(46, 60, 0, 380, 450, 600, (x, y) => y > ridgeY(rockLPts, x) + 5, ['#e09a4a', '#b9c08a', '#e8d8c0'], 0.6);
  });
  group('boulders', 'Rantakivet', 'Boulders', () => {
    for (const [x, y, w, h, seed] of [[382, 592, 56, 30, 1], [436, 600, 40, 20, 2], [542, 600, 44, 22, 3], [94, 424, 28, 12, 4], [500, 424, 22, 10, 5], [572, 588, 30, 14, 6]]) {
      const d = rock({ seed, cx: x, cy: y, w, h });
      R(d, 'url(#sa-boulder)', st('#6e5274', 1.6));
      shadow(d, COOL, h * 0.5, 0.45);
      rim(d, RIM, 1.8, 1);
      add(`<path d="M${f(x - w * 0.45)} ${f(y + h * 0.08)}q${f(w * 0.45)} 4 ${f(w * 0.9)} 0" fill="none" stroke="#fff0dc" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round" data-anim="shimmer"/>`);
    }
  });
  group('juniper', 'Katajat', 'Junipers', () => {
    for (const [x, w, seed] of [[150, 26, 1], [206, 20, 2], [312, 18, 3]]) {
      const gy = ridgeY(rockLPts, x) + 8;
      const d = blob({ seed: seed * 19, cx: x, cy: gy - w * 0.35, r: w, ry: w * 0.55, lobes: 15, scallop: 0.34, wobble: 0.1 });
      ground(x, gy, w * 2, { h: w, colour: COOL });
      foliage([{ x, y: gy - w * 0.35, r: w, d }], { fill: '#3f5a5a', base: '#3f5a5a', dark: '#1a2a30', rimColour: RIM });
      add(`<path d="M${x - w * 0.6} ${gy - w * 0.5}h1M${x} ${gy - w * 0.7}h1M${x + w * 0.5} ${gy - w * 0.45}h1" stroke="#7a8ac0" stroke-width="3" stroke-linecap="round"/>`);
    }
  });
  group('heather', 'Kanerva', 'Heather', () => {
    const Rn = rng(71);
    for (const [x, w] of [[96, 22], [250, 26], [290, 18]]) {
      const y = ridgeY(rockLPts, x) + 8;
      const d = blob({ seed: x, cx: x, cy: y - 4, r: w, ry: 8, lobes: 13, scallop: 0.3, wobble: 0.08 });
      R(d, '#7a5a96', st('#7a5a96', 1.2));
      rim(d, '#f4c8e8', 1.4, 0.9);
      // upright sprigs, blooming at the tips
      let sp = '', bl = '';
      for (let i = 0; i < w; i++) {
        const sx = x + (Rn() - 0.5) * w * 1.7, sy = y - 4 - Rn() * 4, h = 8 + Rn() * 10;
        sp += `M${f(sx)} ${f(sy)}q${f((Rn() - 0.5) * 3)} ${f(-h * 0.6)} ${f((Rn() - 0.5) * 4)} ${f(-h)}`;
        for (let k = 0; k < 3; k++) bl += `M${f(sx + (Rn() - 0.5) * 2)} ${f(sy - h * (0.55 + k * 0.15))}h.1`;
      }
      add(`<path d="${sp}" fill="none" stroke="#5a6a3a" stroke-width="1.1" stroke-linecap="round"/><path d="${bl}" stroke="#f0a6dc" stroke-width="2.6" stroke-linecap="round"/>`);
    }
  });
  group('grass', 'Rantaheinä', 'Shore grass', () => {
    const Rn = rng(91);
    for (const [pts, x] of [[rockLPts, 30], [rockLPts, 176], [rockLPts, 338], [rockRPts, 676], [rockRPts, 740]]) {
      const gy = ridgeY(pts, x) + 8;
      const tips = [];
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (1.2 + 0.6 * i / (n - 1)) + (Rn() - 0.5) * 0.1, l = 18 + Rn() * 16;
        tips.push([x + Math.cos(a) * l * 0.8, gy + Math.sin(a) * l]);
      }
      const outline = [[x - 6, gy]];
      tips.forEach(([tx, ty], i) => { outline.push([tx, ty]); if (i < n - 1) outline.push([x + (i - n / 2 + 1) * 1.6, gy - 6]); });
      outline.push([x + 6, gy]);
      const d = poly(outline);
      R(d, '#c8a85a', st('#a8884a', 1.1));
      rim(d, RIM, 1.2, 1);
    }
  });
  group('bluebells', 'Kissankellot', 'Harebells', () => {
    const Rn = rng(81);
    for (const [x, h] of [[14, 50], [30, 62], [52, 44], [74, 56], [118, 40]]) {
      const y = ridgeY(rockLPts, x) + 14;
      const bend = 10 + Rn() * 6;
      const tx = x + bend, ty = y - h;
      add(`<g data-anim="sway" style="animation-delay:-${f(Rn() * 3)}s">`);
      // arched stem, the bell nodding at its tip
      ink(`<path d="M${x} ${y}Q${f(x - 4)} ${f(y - h * 1.1)} ${f(tx)} ${f(ty + 2)}" fill="none" stroke="#5f7a3a" stroke-width="1.2"/>`);
      const bell = (bx, by, s) => {
        const d = `M${f(bx)} ${f(by)}C${f(bx - 4 * s)} ${f(by + 1 * s)} ${f(bx - 5 * s)} ${f(by + 6 * s)} ${f(bx - 6 * s)} ${f(by + 9 * s)}Q${f(bx - 3 * s)} ${f(by + 8 * s)} ${f(bx)} ${f(by + 10 * s)}Q${f(bx + 3 * s)} ${f(by + 8 * s)} ${f(bx + 6 * s)} ${f(by + 9 * s)}C${f(bx + 5 * s)} ${f(by + 6 * s)} ${f(bx + 4 * s)} ${f(by + 1 * s)} ${f(bx)} ${f(by)}Z`;
        R(d, '#8a96e8', st('#7f8de0', 1));
        rim(d, '#e8e0ff', 1, 0.85);
      };
      bell(tx, ty + 2, 0.9);
      if (h > 50) { ink(`<path d="M${f(x + bend * 0.3)} ${f(y - h * 0.62)}q6 -4 9 2" fill="none" stroke="#5f7a3a" stroke-width="1"/>`); bell(x + bend * 0.3 + 9, y - h * 0.62 + 2, 0.65); }
      add('</g>');
    }
  });

  // ---------------------------------------------------------------- the pine
  const pine = pineForm({ seed: 12, x: 56, y: ridgeY(rockLPts, 56) + 14, h: 400, w: 16, lean: 0.2, branches: 9, padR: [28, 56], reach: 0.55 });
  group('pineTrunk', 'Männyn runko', 'Pine trunk', () => {
    for (const b of pine.branches) R(b, 'url(#sa-trunk)', st('#7d4e42', 1.3));
    R(pine.trunk, 'url(#sa-trunk)', st('#7d4e42', 'near'));
    shadow(pine.trunk, COOL, 9, 0.45);
    rim(pine.trunk, '#ffc078', 2, 1);
    ink(`<path d="${pine.bark.join('')}" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/>`);
  });
  group('pineNeedles', 'Männyn havut', 'Pine needles', () => {
    add('<g data-anim="sway-slow">');
    // each pad is a cluster of overlapping flat lobes with a dark under-layer
    const lobes = [];
    pine.pads.forEach((p, i) => {
      const Rn = rng(i * 7 + 3);
      for (let k = 0; k < 3; k++) {
        const r = p.r * (0.55 + 0.25 * Rn()), cx = p.x + (k - 1) * p.r * 0.45 + (Rn() - 0.5) * 6, cy = p.y - (k === 1 ? p.r * 0.12 : 0) + (Rn() - 0.5) * 4;
        lobes.push({ x: cx, y: cy, r, d: blob({ seed: i * 31 + k, cx, cy, r, ry: r * 0.42, lobes: 11, scallop: 0.26, wobble: 0.1 }) });
      }
    });
    lobes.sort((a, b) => a.y - b.y);
    foliage(lobes, { fill: 'url(#sa-pad)', base: '#3d5a3e', dark: '#1a2c24', rimColour: RIM, underK: 0.32 });
    // needle flicks along the sunlit tops only
    let nd = '';
    for (const p of lobes) {
      const Rn = rng(Math.round(p.x * 7 + p.y));
      for (let i = 0; i < p.r * 0.4; i++) {
        const a = Math.PI * (1.15 + 0.7 * Rn()), nx = p.x + Math.cos(a) * p.r * 0.85, ny = p.y + Math.sin(a) * p.r * 0.36;
        nd += `M${f(nx)} ${f(ny)}l${f(Math.cos(a) * 3)} ${f(-2 - Rn() * 3)}`;
      }
    }
    add(`<path d="${nd}" stroke="#a8c070" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`);
    add('</g>');
  });

  return S.build();
}
