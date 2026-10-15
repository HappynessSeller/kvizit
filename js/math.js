// Question generators for a Finnish 4th grader (OPS 2014, vuosiluokat 3–6).
// Each topic has 5 levels. A question looks like:
// { prompt, kind: 'num'|'choice', answer, choices?, decimal?, pre?, post?, visual?, explain }

let L = 'fi';
const tx = (fi, en) => (L === 'en' ? en : fi);

const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Finnish number formatting: comma decimals, space groups from 10 000 up */
export function fmt(n, decimals) {
  let s = decimals != null ? n.toFixed(decimals) : String(Math.round(n * 1000) / 1000);
  let [i, d] = s.split('.');
  if (Math.abs(n) >= 10000) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return d ? `${i},${d}` : i;
}
const eur = (cents) => `${cents % 100 ? fmt(cents / 100, 2) : cents / 100} €`;
const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
const box = '<span class="qbox">?</span>';
const b = (s) => `<b>${s}</b>`;
/** Finnish adessive for a name: Aino → Ainolla, Helmi → Helmillä */
const lla = (name) => name + (/[aou]/i.test(name) ? 'lla' : 'llä');

const NAMES = ['Aino', 'Eetu', 'Helmi', 'Onni', 'Venla', 'Leo', 'Ella', 'Väinö', 'Sofia', 'Eino', 'Lilja', 'Niilo'];

// ---------- helpers for multiple-choice ----------
function choiceQ(prompt, correct, distractors, extra = {}) {
  const uniq = [...new Set(distractors.filter((d) => d !== correct))].slice(0, 3);
  const choices = shuffle([correct, ...uniq]);
  return { prompt, kind: 'choice', choices, answer: choices.indexOf(correct), ...extra };
}

// ---------- visuals ----------
function pieSVG(n, k, color = '#e86fa8') {
  const cx = 60, cy = 60, rr = 52;
  let s = `<svg viewBox="0 0 120 120" class="qvis-pie" aria-hidden="true">`;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + rr * Math.cos(a0), y0 = cy + rr * Math.sin(a0);
    const x1 = cx + rr * Math.cos(a1), y1 = cy + rr * Math.sin(a1);
    const large = 1 / n > 0.5 ? 1 : 0;
    s += `<path d="M${cx} ${cy}L${x0.toFixed(2)} ${y0.toFixed(2)}A${rr} ${rr} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z" fill="${i < k ? color : '#fffaf2'}" stroke="#3b2f4a" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  return s + '</svg>';
}
function barSVG(n, k, color = '#6f8fe0') {
  const w = 200 / n;
  let s = `<svg viewBox="-4 -4 208 48" class="qvis-bar" aria-hidden="true">`;
  for (let i = 0; i < n; i++) s += `<rect x="${(i * w).toFixed(2)}" y="0" width="${w.toFixed(2)}" height="40" rx="3" fill="${i < k ? color : '#fffaf2'}" stroke="#3b2f4a" stroke-width="2.5"/>`;
  return s + '</svg>';
}
function rectSVG(w, h, unit) {
  const sc = Math.min(160 / w, 90 / h);
  const W = w * sc, H = h * sc;
  let grid = '';
  for (let i = 1; i < w; i++) grid += `<path d="M${(i * sc).toFixed(1)} 0V${H.toFixed(1)}" stroke="#3b2f4a" stroke-opacity=".15"/>`;
  for (let j = 1; j < h; j++) grid += `<path d="M0 ${(j * sc).toFixed(1)}H${W.toFixed(1)}" stroke="#3b2f4a" stroke-opacity=".15"/>`;
  return `<svg viewBox="-40 -26 ${W + 80} ${H + 52}" class="qvis-rect" aria-hidden="true">
    <rect width="${W}" height="${H}" rx="3" fill="#c7e3a8" stroke="#3b2f4a" stroke-width="2.5"/>${grid}
    <text x="${W / 2}" y="-8" text-anchor="middle">${w} ${unit}</text>
    <text x="${W + 8}" y="${H / 2 + 6}">${h} ${unit}</text></svg>`;
}
function clockSVG(h, m) {
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  let ticks = '';
  for (let i = 0; i < 12; i++) ticks += `<path d="M50 9V${i % 3 ? 14 : 17}" stroke="#3b2f4a" stroke-width="${i % 3 ? 2 : 3}" transform="rotate(${i * 30} 50 50)" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 100 100" class="qvis-clock" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="#fffaf2" stroke="#3b2f4a" stroke-width="3"/>${ticks}
    <path d="M50 50V27" stroke="#3b2f4a" stroke-width="5" stroke-linecap="round" transform="rotate(${ha} 50 50)"/>
    <path d="M50 50V16" stroke="#e86fa8" stroke-width="3.5" stroke-linecap="round" transform="rotate(${ma} 50 50)"/>
    <circle cx="50" cy="50" r="4" fill="#3b2f4a"/></svg>`;
}

// ---------- topics ----------
const gen = {
  kerto(lv) {
    let a, c;
    if (lv === 1) { a = pick([1, 2, 5, 10]); c = ri(1, 10); }
    else if (lv === 2) { a = pick([2, 3, 4, 5, 10]); c = ri(2, 10); }
    else if (lv === 3) { a = pick([6, 7, 8, 9]); c = ri(2, 10); }
    else if (lv === 4) { a = ri(3, 9); c = ri(3, 10); }
    else {
      if (Math.random() < 0.5) {
        const x = ri(12, 49), y = ri(2, 9), t = Math.floor(x / 10) * 10, o = x % 10;
        return { prompt: `${x} × ${y} = ${box}`, kind: 'num', answer: x * y,
          explain: `${x} × ${y} = ${t} × ${y} + ${o} × ${y} = ${t * y} + ${o * y} = ${b(x * y)}` };
      }
      const x = ri(2, 99), m = pick([10, 100]);
      return { prompt: `${x} × ${m} = ${box}`, kind: 'num', answer: x * m,
        explain: tx(`Kun kerrot luvulla ${m}, lisää loppuun ${m === 10 ? 'yksi nolla' : 'kaksi nollaa'}: ${b(fmt(x * m))}`,
          `Multiplying by ${m} adds ${m === 10 ? 'one zero' : 'two zeros'}: ${b(fmt(x * m))}`) };
    }
    const [p, q] = Math.random() < 0.5 ? [a, c] : [c, a];
    const prod = p * q;
    if (lv >= 4 && Math.random() < 0.4) {
      return { prompt: `${p} × ${box} = ${prod}`, kind: 'num', answer: q,
        explain: tx(`${prod} : ${p} = ${b(q)}, koska ${p} × ${q} = ${prod}`, `${prod} ÷ ${p} = ${b(q)}, because ${p} × ${q} = ${prod}`) };
    }
    let explain;
    const lo = Math.min(p, q), hi = Math.max(p, q);
    if (lo === 1) explain = tx(`Kun luku kerrotaan yhdellä, se pysyy samana: ${b(prod)}`, `Any number times 1 stays the same: ${b(prod)}`);
    else if (lo === 10 || hi === 10) explain = tx(`Kun kerrot kymmenellä, lisää loppuun nolla: ${lo === 10 ? hi : lo} → ${b(prod)}`, `Times 10: add a zero to the end: ${lo === 10 ? hi : lo} → ${b(prod)}`);
    else if (lo <= 4) explain = `${p} × ${q} = ${Array(lo).fill(hi).join(' + ')} = ${b(prod)}`;
    else if (lo === 5) explain = tx(`${hi} × 5 on puolet luvusta ${hi} × 10 = ${hi * 10} → ${b(prod)}`, `${hi} × 5 is half of ${hi} × 10 = ${hi * 10} → ${b(prod)}`);
    else explain = tx(`${hi} × ${lo - 1} = ${hi * (lo - 1)}, ja vielä yksi ${hi}: ${hi * (lo - 1)} + ${hi} = ${b(prod)}`,
      `${hi} × ${lo - 1} = ${hi * (lo - 1)}, plus one more ${hi}: ${b(prod)}`);
    return { prompt: `${p} × ${q} = ${box}`, kind: 'num', answer: prod, explain };
  },

  jako(lv) {
    if (lv === 4) {
      const d = ri(2, 9), q = ri(2, 9), rem = ri(1, d - 1), n = d * q + rem;
      const fmtR = (x, y) => `${x} ${tx('j.', 'r')} ${y}`;
      const correct = fmtR(q, rem);
      const ds = [fmtR(q, rem === d - 1 ? rem - 1 : rem + 1), fmtR(q + 1, rem), fmtR(q - 1, rem + 1 < d ? rem + 1 : 1), fmtR(q + 1, Math.max(0, rem - 1))];
      return choiceQ(`${n} : ${d} = ?`, correct, shuffle(ds), {
        hint: tx('j. = jakojäännös (paljonko jää yli)', 'r = remainder (what is left over)'),
        explain: tx(`${q} × ${d} = ${q * d}, ja ${n} − ${q * d} = ${rem}. Vastaus: ${b(correct)}`, `${q} × ${d} = ${q * d}, and ${n} − ${q * d} = ${rem}. Answer: ${b(correct)}`),
      });
    }
    if (lv === 5) {
      if (Math.random() < 0.6) {
        const d = ri(2, 6), q = ri(11, Math.floor(99 / d)), n = d * q;
        const t = Math.floor(n / (d * 10)) * d * 10, o = n - t;
        return { prompt: `${n} : ${d} = ${box}`, kind: 'num', answer: q,
          explain: t && o ? `${n} : ${d} = ${t} : ${d} + ${o} : ${d} = ${t / d} + ${o / d} = ${b(q)}` : `${q} × ${d} = ${n} → ${b(q)}` };
      }
      const x = ri(2, 90), m = pick([10, 100]);
      return { prompt: `${fmt(x * m)} : ${m} = ${box}`, kind: 'num', answer: x,
        explain: tx(`Kun jaat luvulla ${m}, poista lopusta ${m === 10 ? 'yksi nolla' : 'kaksi nollaa'}: ${b(x)}`, `Dividing by ${m} removes ${m === 10 ? 'one zero' : 'two zeros'}: ${b(x)}`) };
    }
    const d = lv === 1 ? pick([2, 5, 10]) : ri(2, 10);
    const q = ri(lv === 1 ? 1 : 2, 10), n = d * q;
    const because = tx(`, koska ${q} × ${d} = ${n}`, `, because ${q} × ${d} = ${n}`);
    if (lv === 3 && Math.random() < 0.6) {
      if (Math.random() < 0.5) return { prompt: `${box} : ${d} = ${q}`, kind: 'num', answer: n, explain: `${q} × ${d} = ${b(n)}` };
      return { prompt: `${n} : ${box} = ${q}`, kind: 'num', answer: d, explain: `${n} : ${q} = ${b(d)}${because}` };
    }
    return { prompt: `${n} : ${d} = ${box}`, kind: 'num', answer: q, explain: `${n} : ${d} = ${b(q)}${because}` };
  },

  plusmiinus(lv) {
    const add = Math.random() < 0.5;
    let a, c;
    if (lv === 1) { if (add) { a = ri(11, 70); c = ri(11, 99 - a); } else { a = ri(30, 99); c = ri(11, a - 5); } }
    else if (lv === 2) { if (add) { a = ri(10, 80) * 10; c = ri(10, 99 - a / 10) * 10; } else { a = ri(30, 99) * 10; c = ri(10, a / 10 - 5) * 10; } }
    else if (lv === 3) { if (add) { a = ri(120, 800); c = ri(100, 999 - a); } else { a = ri(300, 999); c = ri(100, a - 50); } }
    else if (lv === 4) { if (add) { a = ri(1000, 7000); c = ri(300, 9999 - a); } else { a = ri(2000, 9999); c = ri(300, a - 500); } }
    else {
      const t = ri(0, 2);
      if (t === 0) { const total = pick([100, 200, 500, 1000]); const x = ri(Math.ceil(total * 0.2), Math.floor(total * 0.85));
        return { prompt: `${box} + ${x} = ${fmt(total)}`, kind: 'num', answer: total - x, explain: `${fmt(total)} − ${x} = ${b(total - x)}` }; }
      if (t === 1) { const x = ri(300, 999), y = ri(100, x - 50);
        return { prompt: `${x} − ${box} = ${x - y}`, kind: 'num', answer: y, explain: `${x} − ${x - y} = ${b(y)}` }; }
      const x = ri(100, 500), y = ri(50, 400), z = ri(30, x + y - 50);
      return { prompt: `${x} + ${y} − ${z} = ${box}`, kind: 'num', answer: x + y - z, explain: `${x} + ${y} = ${x + y}, ${x + y} − ${z} = ${b(x + y - z)}` };
    }
    const res = add ? a + c : a - c;
    let explain;
    if (add && res < 1000) {
      const h = Math.floor(a / 100) * 100 + Math.floor(c / 100) * 100, rest = (a % 100) + (c % 100);
      explain = h ? `${Math.floor(a / 100) * 100} + ${Math.floor(c / 100) * 100} = ${h}, ${a % 100} + ${c % 100} = ${rest} → ${b(res)}`
        : `${Math.floor(a / 10) * 10} + ${Math.floor(c / 10) * 10} = ${Math.floor(a / 10) * 10 + Math.floor(c / 10) * 10}, ${a % 10} + ${c % 10} = ${(a % 10) + (c % 10)} → ${b(res)}`;
    } else if (add) explain = tx(`Tarkistus: ${fmt(res)} − ${fmt(c)} = ${fmt(a)} ✓ Vastaus ${b(fmt(res))}`, `Check: ${fmt(res)} − ${fmt(c)} = ${fmt(a)} ✓ Answer ${b(fmt(res))}`);
    else explain = tx(`Tarkistus: ${fmt(res)} + ${fmt(c)} = ${fmt(a)} ✓ Vastaus ${b(fmt(res))}`, `Check: ${fmt(res)} + ${fmt(c)} = ${fmt(a)} ✓ Answer ${b(fmt(res))}`);
    return { prompt: `${fmt(a)} ${add ? '+' : '−'} ${fmt(c)} = ${box}`, kind: 'num', answer: res, explain };
  },

  murto(lv) {
    if (lv === 1) {
      const n = ri(2, 8), k = ri(1, n - 1);
      const correct = frac(k, n);
      const ds = [frac(n - k, n), frac(k, n + 1), frac(k + 1, n), frac(k, n + 2), frac(Math.max(1, k - 1), n)]
        .filter((x) => x !== correct);
      const vis = Math.random() < 0.6 ? pieSVG(n, k) : barSVG(n, k);
      return choiceQ(tx('Kuinka suuri osa on väritetty?', 'What part is coloured?'), correct, shuffle(ds), {
        visual: vis, explain: tx(`Osia on ${n}, väritettyjä ${k}: ${correct}`, `There are ${n} parts and ${k} are coloured: ${correct}`) });
    }
    if (lv === 2 || lv === 3) {
      const n = pick(lv === 2 ? [2, 3, 4, 5, 10] : [3, 4, 5, 6, 8, 10]), q = ri(2, 10), tot = n * q;
      const k = lv === 2 ? 1 : ri(2, n - 1);
      return { prompt: tx(`Paljonko on ${frac(k, n)} luvusta ${tot}?`, `What is ${frac(k, n)} of ${tot}?`), kind: 'num', answer: k * q,
        explain: k === 1 ? `${tot} : ${n} = ${b(q)}` : `${tot} : ${n} = ${q}, ${k} × ${q} = ${b(k * q)}` };
    }
    if (lv === 4) {
      let a1, b1, a2, b2, rule;
      if (Math.random() < 0.6) { b1 = b2 = ri(4, 12); a1 = ri(1, b1 - 1); do { a2 = ri(1, b1 - 1); } while (a2 === a1); rule = 'den'; }
      else { a1 = a2 = ri(1, 4); b1 = ri(a1 + 1, 10); do { b2 = ri(a1 + 1, 10); } while (b2 === b1); rule = 'num'; }
      const v1 = a1 / b1, v2 = a2 / b2;
      const correct = v1 < v2 ? '&lt;' : '&gt;';
      const q = choiceQ(`${frac(a1, b1)} ${box} ${frac(a2, b2)}`, correct, ['&lt;', '&gt;', '='], {
        explain: rule === 'den'
          ? tx('Kun nimittäjät ovat samat, se jolla on suurempi osoittaja on suurempi.', 'Same denominators: the bigger numerator is bigger.')
          : tx('Kun osoittajat ovat samat, pienempi nimittäjä tarkoittaa isompia paloja.', 'Same numerators: a smaller denominator means bigger pieces.'),
      });
      q.choices = ['&lt;', '=', '&gt;'];
      q.answer = q.choices.indexOf(correct);
      return q;
    }
    // lv 5: fraction add/sub with same denominator, or tenths
    const t = ri(0, 2);
    if (t === 0) {
      const n = ri(5, 12), x = ri(1, n - 2), y = ri(1, n - 1 - x);
      const add = Math.random() < 0.6;
      const [p, q] = add ? [x, y] : [x + y, y];
      const res = add ? x + y : x;
      return { prompt: `${frac(p, n)} ${add ? '+' : '−'} ${frac(q, n)} = ${frac(box, n)}`, kind: 'num', answer: res,
        explain: tx(`Nimittäjä pysyy samana, lasketaan osoittajat: ${p} ${add ? '+' : '−'} ${q} = ${b(res)}`, `The denominator stays, work out the numerators: ${p} ${add ? '+' : '−'} ${q} = ${b(res)}`) };
    }
    if (t === 1) {
      const x = ri(1, 8), y = ri(1, 9 - x), add = Math.random() < 0.6;
      const [p, q] = add ? [x, y] : [x + y, y];
      const res = add ? x + y : x;
      return { prompt: `${fmt(p / 10, 1)} ${add ? '+' : '−'} ${fmt(q / 10, 1)} = ${box}`, kind: 'num', answer: res / 10, decimal: true,
        explain: tx(`${p} kymmenesosaa ${add ? '+' : '−'} ${q} kymmenesosaa = ${res} kymmenesosaa = ${b(fmt(res / 10, 1))}`, `${p} tenths ${add ? '+' : '−'} ${q} tenths = ${res} tenths = ${b(fmt(res / 10, 1))}`) };
    }
    const x = ri(1, 9);
    return { prompt: `${fmt(x / 10, 1)} = ${frac(box, 10)}`, kind: 'num', answer: x,
      explain: tx(`0,${x} on ${x} kymmenesosaa = ${frac(x, 10)}`, `0.${x} is ${x} tenths = ${frac(x, 10)}`) };
  },

  mitat(lv) {
    const conv = (big, small, k, max) => {
      const x = ri(2, max);
      if (Math.random() < 0.6) return { prompt: `${x} ${big} = ${box}`, post: small, kind: 'num', answer: x * k, explain: `1 ${big} = ${fmt(k)} ${small} → ${x} × ${fmt(k)} = ${b(fmt(x * k))} ${small}` };
      return { prompt: `${fmt(x * k)} ${small} = ${box}`, post: big, kind: 'num', answer: x, explain: `${fmt(k)} ${small} = 1 ${big} → ${fmt(x * k)} : ${fmt(k)} = ${b(x)} ${big}` };
    };
    const H = tx('h', 'h');
    if (lv === 1) return pick([() => conv('m', 'cm', 100, 9), () => conv(H, 'min', 60, 5), () => conv('cm', 'mm', 10, 20), () => conv('€', tx('snt', 'c'), 100, 9)])();
    if (lv === 2) return pick([() => conv('kg', 'g', 1000, 9), () => conv('km', 'm', 1000, 9), () => conv('l', 'dl', 10, 15), () => conv('min', 's', 60, 5), () => conv(tx('vrk', 'days'), H, 24, 4)])();
    if (lv === 3) {
      const [big, small, k] = pick([['m', 'cm', 100], [H, 'min', 60], ['kg', 'g', 1000], ['km', 'm', 1000], ['l', 'dl', 10]]);
      const x = ri(1, 5), y = k === 10 ? ri(1, 9) : k === 60 ? ri(1, 11) * 5 : k === 100 ? ri(5, 95) : ri(1, 19) * 50;
      return { prompt: `${x} ${big} ${y} ${small} = ${box}`, post: small, kind: 'num', answer: x * k + y,
        explain: `${x} ${big} = ${fmt(x * k)} ${small}, ${fmt(x * k)} + ${y} = ${b(fmt(x * k + y))} ${small}` };
    }
    if (lv === 4) {
      const h = ri(7, 20), m = ri(0, 11) * 5;
      const ts = (hh, mm) => `${((hh % 24) + 24) % 24}.${String(mm).padStart(2, '0')}`;
      if (Math.random() < 0.5) {
        const add = ri(2, 15) * 5 + (Math.random() < 0.3 ? 60 : 0);
        const tot = h * 60 + m + add;
        const correct = ts(Math.floor(tot / 60), tot % 60);
        const alt = (d) => { const t2 = tot + d; return ts(Math.floor(t2 / 60), ((t2 % 60) + 60) % 60); };
        const addTxt = add >= 60 ? `${Math.floor(add / 60)} h ${add % 60} min` : `${add} min`;
        return choiceQ(tx(`Kello on ${ts(h, m)}. Mitä kello on ${addTxt} kuluttua?`, `It is ${ts(h, m)}. What time is it ${addTxt} later?`), correct,
          shuffle([alt(-10), alt(10), alt(60), alt(-60), alt(-5)]), {
            visual: clockSVG(h, m),
            explain: tx(`${ts(h, m)} + ${addTxt} = ${b(correct)}`, `${ts(h, m)} + ${addTxt} = ${b(correct)}`) });
      }
      const dur = ri(4, 22) * 5, start = h * 60 + m, end = start + dur;
      return { prompt: tx(`Elokuva alkaa klo ${ts(h, m)} ja loppuu klo ${ts(Math.floor(end / 60), end % 60)}. Kuinka kauan se kestää?`,
        `A film starts at ${ts(h, m)} and ends at ${ts(Math.floor(end / 60), end % 60)}. How long is it?`), post: 'min', kind: 'num', answer: dur,
        explain: tx(`Lasketaan eteenpäin: ${ts(h, m)} → ${ts(Math.floor(end / 60), end % 60)} on ${b(dur)} min`, `Count forward: ${ts(h, m)} → ${ts(Math.floor(end / 60), end % 60)} is ${b(dur)} min`) };
    }
    const w = ri(2, 9), h = ri(2, 6);
    if (Math.random() < 0.5) return { prompt: tx('Laske suorakulmion piiri.', 'Find the perimeter of the rectangle.'), visual: rectSVG(w, h, 'cm'), post: 'cm', kind: 'num', answer: 2 * (w + h),
      explain: tx(`Piiri = kaikki sivut yhteen: ${w} + ${h} + ${w} + ${h} = ${b(2 * (w + h))} cm`, `Perimeter = all sides added: ${w} + ${h} + ${w} + ${h} = ${b(2 * (w + h))} cm`) };
    return { prompt: tx('Laske suorakulmion pinta-ala.', 'Find the area of the rectangle.'), visual: rectSVG(w, h, 'cm'), post: 'cm²', kind: 'num', answer: w * h,
      explain: tx(`Pinta-ala = ${w} × ${h} = ${b(w * h)} cm² (ruutuja on ${w * h})`, `Area = ${w} × ${h} = ${b(w * h)} cm² (${w * h} squares)`) };
  },

  sanat(lv) {
    const n1 = pick(NAMES);
    let n2 = pick(NAMES); while (n2 === n1) n2 = pick(NAMES);
    if (lv === 1) {
      return pick([
        () => { const a = ri(12, 60), c = ri(8, 39);
          return { prompt: tx(`${n1} keräsi ${a} mustikkaa ja ${n2} ${c} mustikkaa. Montako mustikkaa he keräsivät yhteensä?`, `${n1} picked ${a} blueberries and ${n2} picked ${c}. How many did they pick altogether?`), kind: 'num', answer: a + c, explain: `${a} + ${c} = ${b(a + c)}` }; },
        () => { const a = ri(30, 90), c = ri(5, a - 10);
          return { prompt: tx(`${lla(n1)} on ${a} tarraa. Hän antaa ${c} tarraa kaverilleen. Montako tarraa hänelle jää?`, `${n1} has ${a} stickers and gives ${c} to a friend. How many are left?`), kind: 'num', answer: a - c, explain: `${a} − ${c} = ${b(a - c)}` }; },
        () => { const a = ri(120, 400), c = ri(40, 150);
          return { prompt: tx(`Kirjassa on ${a + c} sivua. ${n1} on lukenut ${a} sivua. Montako sivua on vielä jäljellä?`, `A book has ${a + c} pages. ${n1} has read ${a}. How many pages are left?`), kind: 'num', answer: c, explain: `${a + c} − ${a} = ${b(c)}` }; },
      ])();
    }
    if (lv === 2) {
      return pick([
        () => { const a = ri(3, 9), c = ri(3, 9);
          return { prompt: tx(`Pussissa on ${a} munkkia. ${n1} ostaa ${c} pussia. Montako munkkia hänellä on?`, `A bag has ${a} doughnuts. ${n1} buys ${c} bags. How many doughnuts?`), kind: 'num', answer: a * c, explain: `${c} × ${a} = ${b(a * c)}` }; },
        () => { const a = ri(4, 9), c = ri(3, 8);
          return { prompt: tx(`Luokassa on ${c} pöytäriviä ja jokaisessa rivissä ${a} pulpettia. Montako pulpettia luokassa on?`, `A classroom has ${c} rows with ${a} desks each. How many desks?`), kind: 'num', answer: a * c, explain: `${c} × ${a} = ${b(a * c)}` }; },
        () => { const a = ri(2, 6), c = ri(3, 9);
          return { prompt: tx(`Pyörässä on 2 rengasta. Pihalla on ${c} pyörää ja ${a} autoa (4 rengasta). Montako rengasta yhteensä?`, `A bike has 2 wheels. There are ${c} bikes and ${a} cars (4 wheels). How many wheels altogether?`), kind: 'num', answer: 2 * c + 4 * a, explain: `${c} × 2 + ${a} × 4 = ${2 * c} + ${4 * a} = ${b(2 * c + 4 * a)}` }; },
      ])();
    }
    if (lv === 3) {
      return pick([
        () => { const k = ri(3, 8), q = ri(3, 9);
          return { prompt: tx(`${k * q} karkkia jaetaan tasan ${k} lapselle. Montako karkkia kukin saa?`, `${k * q} sweets are shared equally between ${k} children. How many does each get?`), kind: 'num', answer: q, explain: `${k * q} : ${k} = ${b(q)}` }; },
        () => { const k = ri(4, 8), q = ri(3, 9), rem = ri(1, k - 1);
          return { prompt: tx(`${n1} pakkaa ${k * q + rem} kananmunaa kennoihin. Kennoon mahtuu ${k} munaa. Montako täyttä kennoa tulee?`, `${n1} packs ${k * q + rem} eggs into boxes of ${k}. How many full boxes?`), kind: 'num', answer: q, explain: tx(`${k * q + rem} : ${k} = ${q} j. ${rem}, joten täysiä kennoja on ${b(q)}`, `${k * q + rem} ÷ ${k} = ${q} r ${rem}, so ${b(q)} full boxes`) }; },
        () => { const k = ri(3, 6), q = ri(4, 12);
          return { prompt: tx(`${k} kaverin pizzalasku on ${k * q} €. He maksavat sen tasan. Paljonko kukin maksaa?`, `${k} friends share a pizza bill of ${k * q} €. How much does each pay?`), post: '€', kind: 'num', answer: q, explain: `${k * q} : ${k} = ${b(q)} €` }; },
      ])();
    }
    if (lv === 4) {
      return pick([
        () => { const a = ri(5, 40) * 10, c = ri(5, 30) * 10;
          return { prompt: tx(`Pulla maksaa ${eur(a)} ja mehu ${eur(c)}. Paljonko ne maksavat yhteensä?`, `A bun costs ${eur(a)} and a juice ${eur(c)}. What do they cost together?`), post: '€', kind: 'num', answer: (a + c) / 100, decimal: true, explain: `${eur(a)} + ${eur(c)} = ${b(eur(a + c))}` }; },
        () => { const pay = pick([500, 1000, 2000]), c = ri(15, pay / 10 - 5) * 10;
          return { prompt: tx(`${n1} ostaa kirjan, joka maksaa ${eur(c)}. Hän maksaa ${pay / 100} euron setelillä. Paljonko hän saa takaisin?`, `${n1} buys a book for ${eur(c)} and pays with a ${eur(pay)} note. How much change?`), post: '€', kind: 'num', answer: (pay - c) / 100, decimal: true, explain: `${eur(pay)} − ${eur(c)} = ${b(eur(pay - c))}` }; },
        () => { const k = ri(2, 5), a = ri(3, 18) * 10;
          return { prompt: tx(`Yksi pulla maksaa ${eur(a)}. Paljonko maksaa ${k} pullaa?`, `One bun costs ${eur(a)}. What do ${k} buns cost?`), post: '€', kind: 'num', answer: (k * a) / 100, decimal: true, explain: `${k} × ${eur(a)} = ${b(eur(k * a))}` }; },
      ])();
    }
    return pick([
      () => { const k = ri(2, 4), p = ri(2, 4), pay = k * p >= 10 ? 20 : pick([10, 20]);
        return { prompt: tx(`${n1} ostaa ${k} jäätelöä, jotka maksavat ${p} € kappale. Hän maksaa ${pay} eurolla. Paljonko hän saa takaisin?`, `${n1} buys ${k} ice creams at ${p} € each and pays with ${pay} €. How much change?`), post: '€', kind: 'num', answer: pay - k * p, explain: `${k} × ${p} = ${k * p} €, ${pay} − ${k * p} = ${b(pay - k * p)} €` }; },
      () => { const a = ri(15, 35), off = ri(4, 12), on = ri(5, 15);
        return { prompt: tx(`Bussissa on ${a} matkustajaa. Pysäkillä ${off} jää pois ja ${on} nousee kyytiin. Montako matkustajaa bussissa nyt on?`, `A bus has ${a} passengers. At a stop ${off} get off and ${on} get on. How many now?`), kind: 'num', answer: a - off + on, explain: `${a} − ${off} + ${on} = ${b(a - off + on)}` }; },
      () => { const per = ri(3, 6), days = 7, have = ri(5, 15);
        return { prompt: tx(`${n1} lukee ${per} sivua joka päivä viikon ajan. Hän oli jo lukenut ${have} sivua. Montako sivua hän on lukenut viikon lopussa?`, `${n1} reads ${per} pages every day for a week, and had already read ${have}. How many pages by the end of the week?`), kind: 'num', answer: per * days + have, explain: `${days} × ${per} = ${per * days}, ${per * days} + ${have} = ${b(per * days + have)}` }; },
      () => { const kids = ri(3, 6), each = ri(2, 4), pack = pick([6, 8, 10]);
        const need = kids * each, packs = Math.ceil(need / pack);
        return { prompt: tx(`${kids} lasta saa kukin ${each} pullaa. Pullia myydään ${pack} kappaleen pusseissa. Montako pussia pitää ostaa?`, `${kids} children get ${each} buns each. Buns come in bags of ${pack}. How many bags are needed?`), kind: 'num', answer: packs, explain: tx(`${kids} × ${each} = ${need} pullaa. ${packs} pussia = ${packs * pack} pullaa riittää → ${b(packs)}`, `${kids} × ${each} = ${need} buns. ${packs} bags = ${packs * pack} buns → ${b(packs)}`) }; },
    ])();
  },
};

export const TOPICS = [
  { id: 'kerto', fi: 'Kertolasku', en: 'Multiplication', icon: '×', color: '#e86fa8', bg: '#ffe1ee' },
  { id: 'jako', fi: 'Jakolasku', en: 'Division', icon: '÷', color: '#8b6fd1', bg: '#ebe3ff' },
  { id: 'plusmiinus', fi: 'Plus ja miinus', en: 'Plus & minus', icon: '±', color: '#4f9a6a', bg: '#dff2df' },
  { id: 'murto', fi: 'Murtoluvut', en: 'Fractions', icon: '½', color: '#e8894f', bg: '#ffe7d4' },
  { id: 'mitat', fi: 'Mitat ja aika', en: 'Measures & time', icon: '⏱', color: '#4f86c6', bg: '#dceaff' },
  { id: 'sanat', fi: 'Sanatehtävät', en: 'Word problems', icon: '€', color: '#c9a227', bg: '#fff1c4' },
  { id: 'sekoitus', fi: 'Sekoitus', en: 'Mix', icon: '✦', color: '#3b2f4a', bg: '#f1e6f5' },
];

export const LEVEL_NAMES = {
  kerto: [['Kertotaulut 1, 2, 5, 10', 'Tables 1, 2, 5, 10'], ['Kertotaulut 2–5', 'Tables 2–5'], ['Kertotaulut 6–9', 'Tables 6–9'], ['Kaikki taulut + puuttuva luku', 'All tables + missing number'], ['Isommat luvut', 'Bigger numbers']],
  jako: [['Jaetaan 2, 5, 10', 'Divide by 2, 5, 10'], ['Kertotaulujen jakolaskut', 'Table divisions'], ['Puuttuva luku', 'Missing number'], ['Jakojäännös', 'Remainders'], ['Isommat luvut', 'Bigger numbers']],
  plusmiinus: [['Lukualue 100', 'Up to 100'], ['Kymmenet tuhanteen', 'Tens to 1000'], ['Lukualue 1000', 'Up to 1000'], ['Lukualue 10 000', 'Up to 10 000'], ['Puuttuva luku', 'Missing number']],
  murto: [['Mikä osa?', 'Which part?'], ['Yksikkömurtoluku luvusta', 'Unit fraction of a number'], ['Murtoluku luvusta', 'Fraction of a number'], ['Vertailu', 'Comparing'], ['Laskut ja kymmenesosat', 'Sums & tenths']],
  mitat: [['m, cm, h, min', 'm, cm, h, min'], ['kg, g, km, l, dl', 'kg, g, km, l, dl'], ['Yhdistetyt mitat', 'Mixed units'], ['Kellonajat', 'Clock times'], ['Piiri ja pinta-ala', 'Perimeter & area']],
  sanat: [['Yhteen ja vähennys', 'Add & subtract'], ['Kertolasku', 'Multiplication'], ['Jakolasku', 'Division'], ['Rahalaskut', 'Money'], ['Kaksivaiheiset', 'Two-step']],
};

const MAIN = ['kerto', 'jako', 'plusmiinus', 'murto', 'mitat', 'sanat'];

/**
 * Make a question. `levels` maps topic -> level (1–5); `seen` is a Set of prompts already used this round.
 */
export function makeQuestion(topic, levels, lang, seen = new Set()) {
  L = lang;
  for (let tries = 0; tries < 30; tries++) {
    const t = topic === 'sekoitus' ? pick(MAIN) : topic;
    const lv = Math.max(1, Math.min(5, levels[t] || 1));
    const q = gen[t](lv);
    q.topic = t;
    q.level = lv;
    const key = q.prompt + (q.visual || '');
    if (seen.has(key) && tries < 29) continue;
    seen.add(key);
    return q;
  }
}

/** Parse what the child typed (Finnish comma or dot) and compare. */
export function checkNum(q, input) {
  const v = parseFloat(String(input).replace(',', '.'));
  return Number.isFinite(v) && Math.abs(v - q.answer) < 1e-9;
}

export function answerText(q) {
  if (q.kind === 'choice') return q.choices[q.answer];
  return fmt(q.answer, q.post === '€' && !Number.isInteger(q.answer) ? 2 : undefined);
}
