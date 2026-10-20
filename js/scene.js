// Paint-by-area pictures. Two kinds of scene share one controller API:
//  - vector: an SVG whose <g data-group> areas each get a line-art copy (cream fill + ink)
//  - raster: a line-art image + coloured image + one soft mask per area (see art/gen-kesailta.mjs)
// Painting an area reveals its colours with a watercolour bloom from the tap point.
const INK = '#3b2f4a';
const PAPER = '#fffaf1';
const NS = 'http://www.w3.org/2000/svg';
const cache = new Map();
let mountCount = 0;

export const TINTS = [
  { id: 0, css: 'none' },
  { id: 1, hue: 32, css: 'hue-rotate(32deg)' },
  { id: 2, hue: 95, css: 'hue-rotate(95deg)' },
  { id: 3, hue: 160, css: 'hue-rotate(160deg)' },
  { id: 4, hue: 215, css: 'hue-rotate(215deg)' },
  { id: 5, hue: 285, css: 'hue-rotate(285deg)' },
  { id: 6, sat: 0.45, light: 1.18, css: 'saturate(.45) brightness(1.18)' },
  { id: 7, sat: 1.6, light: 0.88, css: 'saturate(1.6) brightness(.88)' },
];

function fetchCached(url, kind) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return kind === 'json' ? r.json() : r.text();
    }));
  }
  return cache.get(url);
}
function loadImage(src) {
  const key = `img:${src}`;
  if (!cache.has(key)) {
    cache.set(key, new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    }));
  }
  return cache.get(key);
}
export function preload(meta) {
  if (meta.type === 'raster') {
    return fetchCached(meta.dir + 'scene.json', 'json')
      .then(() => Promise.all(['line.webp', 'colour.webp'].map((f) => loadImage(meta.dir + f))))
      .catch(() => {});
  }
  return fetchCached(meta.file, 'text').catch(() => {});
}

const el = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

function filterDefs(n, displace) {
  return `
    <filter id="wc_${n}" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="${(0.03 * 46 / displace).toFixed(4)}" numOctaves="2" seed="${n}" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="${displace}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    ${TINTS.filter((t) => t.id).map((t) => `<filter id="tint${t.id}_${n}" color-interpolation-filters="sRGB">
      ${t.hue != null ? `<feColorMatrix type="hueRotate" values="${t.hue}"/>` : `<feColorMatrix type="saturate" values="${t.sat}"/>
      <feComponentTransfer><feFuncR type="linear" slope="${t.light}"/><feFuncG type="linear" slope="${t.light}"/><feFuncB type="linear" slope="${t.light}"/></feComponentTransfer>`}
    </filter>`).join('')}`;
}

// ---------------------------------------------------------------- vector scenes
const LEAF = new Set(['path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line', 'text', 'use']);

function toLineArt(g) {
  const line = g.cloneNode(true);
  for (const a of ['data-group', 'data-fi', 'data-en']) line.removeAttribute(a);
  line.setAttribute('class', 'lineart');
  for (const n of [...line.querySelectorAll('*')]) {
    n.removeAttribute('data-anim');
    n.removeAttribute('style');
    n.removeAttribute('id');
    if (n.tagName === 'g') {
      n.removeAttribute('opacity');
      n.removeAttribute('filter');
      continue;
    }
    if (!LEAF.has(n.tagName)) continue;
    if (n.hasAttribute('data-region')) {
      n.setAttribute('fill', PAPER);
      n.setAttribute('stroke', INK);
      n.setAttribute('stroke-opacity', '.9');
      n.setAttribute('stroke-width', '1.5');
      n.setAttribute('stroke-linejoin', 'round');
      n.removeAttribute('opacity');
      n.removeAttribute('filter');
    } else if (n.hasAttribute('data-ink')) {
      if (n.getAttribute('stroke') && n.getAttribute('stroke') !== 'none') n.setAttribute('stroke', INK);
      if (n.getAttribute('fill') && n.getAttribute('fill') !== 'none') n.setAttribute('fill', INK);
      n.setAttribute('opacity', '.55');
    } else {
      n.remove();
    }
  }
  return line;
}

function vectorColour(svg, g) {
  const reg = g.querySelector('[data-region]');
  let fill = reg?.getAttribute('fill') || '#ccc';
  const m = fill.match(/url\(#([^)]+)\)/);
  if (m) {
    const grad = svg.querySelector(`[id="${m[1]}"]`);
    const stops = grad ? grad.querySelectorAll('stop') : [];
    fill = stops.length ? stops[Math.floor(stops.length / 2)].getAttribute('stop-color') : '#ccc';
  }
  return fill;
}

// A picture variant is grown in the browser by the same generator that wrote the SVG (art/gen-*.mjs).
function generated(meta, v) {
  const key = `gen:${meta.id}:${v}`;
  if (!cache.has(key)) cache.set(key, import(new URL(`../art/gen-${meta.id}.mjs`, import.meta.url).href).then((m) => m.default(v)));
  return cache.get(key);
}

// Blurred shapes (feGaussianBlur) are re-filtered on every repaint, and any animated area repaints
// what lies under it each frame — so each blurred shape is drawn once into a bitmap and swapped in.
const PAINT_PROPS = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-opacity', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'];
const KEEP_ATTRS = /^(transform|opacity|class|style|data-.*)$/;

function refsOf(svg, node, out = new Map()) {
  for (const [, id] of node.outerHTML.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) {
    if (out.has(id)) continue;
    const d = svg.querySelector(`[id="${CSS.escape(id)}"]`);
    if (!d) continue;
    out.set(id, d);
    refsOf(svg, d, out);
  }
  return out;
}

async function bakeOne(svg, node, filter) {
  const bb = node.getBBox();
  if (!bb.width || !bb.height) return null;
  const frac = (a, d) => { const v = filter.getAttribute(a); return v == null ? d : v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v); };
  const x = bb.x + bb.width * frac('x', -0.1), y = bb.y + bb.height * frac('y', -0.1);
  const w = bb.width * frac('width', 1.2), h = bb.height * frac('height', 1.2);
  const std = parseFloat(filter.querySelector('feGaussianBlur')?.getAttribute('stdDeviation')) || 3;
  // blurry pixels upscale well, so ~8 pixels per blur radius is plenty even at full zoom
  const scale = Math.min(3, 8 / std, 2048 / Math.max(w, h));
  const cs = getComputedStyle(node);
  const clone = node.cloneNode(false);
  for (const a of ['transform', 'opacity', 'class', 'style']) clone.removeAttribute(a);
  for (const p of PAINT_PROPS) clone.style.setProperty(p, cs.getPropertyValue(p));
  const defs = [...refsOf(svg, node).values()].map((d) => d.outerHTML).join('');
  const doc = `<svg xmlns="${NS}" width="${Math.ceil(w * scale)}" height="${Math.ceil(h * scale)}" viewBox="${x} ${y} ${w} ${h}"><defs>${defs}</defs>${clone.outerHTML}</svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(doc)}`;
  await img.decode();
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * scale);
  cv.height = Math.ceil(h * scale);
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
  // a data URL (not blob:) so the PNG export, which loads the SVG as an image, still sees it
  return { x, y, w, h, href: cv.toDataURL('image/webp', 0.92) };
}

async function bakeBlurs(svg, cacheKey) {
  const nodes = [...svg.querySelectorAll('[filter]')].filter((e) => LEAF.has(e.tagName) && !e.closest('.lineart'));
  for (const [i, node] of nodes.entries()) {
    const filter = svg.querySelector(`[id="${CSS.escape(node.getAttribute('filter').slice(5, -1))}"]`);
    if (!filter?.querySelector('feGaussianBlur')) continue;
    const key = `bake:${cacheKey}:${i}`;
    if (!cache.has(key)) cache.set(key, bakeOne(svg, node, filter).catch(() => null));
    const b = await cache.get(key);
    if (!b) cache.delete(key); // e.g. measured while hidden — try again next mount
    if (!b || !node.isConnected) continue;
    const g = el('g');
    for (const a of [...node.attributes]) if (KEEP_ATTRS.test(a.name)) g.setAttribute(a.name, a.value);
    g.append(el('image', { href: b.href, x: b.x, y: b.y, width: b.w, height: b.h, preserveAspectRatio: 'none' }));
    node.replaceWith(g);
  }
}

async function buildVector(container, meta, n, variant = 0) {
  let text = variant ? await generated(meta, variant) : await fetchCached(meta.file, 'text');
  // unique ids per mount so several copies (thumbnail + canvas) can coexist
  text = text.replace(/\sid="([^"]+)"/g, ` id="$1_${n}"`).replace(/url\(#([^)]+)\)/g, `url(#$1_${n})`)
    .replace(/href="#([^"]+)"/g, `href="#$1_${n}"`);
  container.innerHTML = text;
  const svg = container.querySelector('svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('scene');
  const defs = svg.querySelector('defs') || svg.insertBefore(el('defs'), svg.firstChild);
  defs.insertAdjacentHTML('beforeend', filterDefs(n, 46));

  const groups = new Map();
  for (const g of svg.querySelectorAll('[data-group]')) {
    const key = g.dataset.group;
    const line = toLineArt(g);
    line.dataset.key = key;
    g.before(line);
    g.classList.add('colour');
    g.dataset.key = key;
    groups.set(key, { key, g, line, fi: g.dataset.fi, en: g.dataset.en, colour: vectorColour(svg, g), bbox: null });
  }
  // paused thumbnails paint once, so the blur costs nothing there
  if (!container.closest('.still')) bakeBlurs(svg, `${meta.id}:${variant}`);
  return {
    svg, defs, groups, W: 800, H: 600,
    hit(cx, cy) {
      const node = document.elementFromPoint(cx, cy)?.closest?.('[data-key]');
      return node && svg.contains(node) ? node.dataset.key : null;
    },
    seek(o, on) { o.line.classList.toggle('seek', on); },
    hover(o, on) { o.line?.classList.toggle('hover', on); },
  };
}

// ---------------------------------------------------------------- raster scenes
async function buildRaster(container, meta, n) {
  const man = await fetchCached(meta.dir + 'scene.json', 'json');
  const { w: W, h: H } = man;
  const href = (f) => meta.dir + f;
  const masks = man.areas.map((a) => `<mask id="am_${a.key}_${n}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <image href="${href(a.mask)}" x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" preserveAspectRatio="none"/></mask>`).join('');
  container.innerHTML = `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="scene raster">
    <defs>${filterDefs(n, 80)}${masks}</defs>
    <image href="${href(man.line)}" width="${W}" height="${H}" class="base"/>
    <image href="${href(man.colour)}" width="${W}" height="${H}" class="final"/>
    ${man.areas.map((a) => `<g class="colour" data-key="${a.key}"><image href="${href(man.colour)}" width="${W}" height="${H}" mask="url(#am_${a.key}_${n})"/></g>`).join('')}
    <g class="fx">${man.areas.map((a) => `<rect class="glow" data-for="${a.key}" width="${W}" height="${H}" fill="#ffd36e" mask="url(#am_${a.key}_${n})"/>`).join('')}</g>
  </svg>`;
  const svg = container.querySelector('svg');
  const defs = svg.querySelector('defs');
  const groups = new Map();
  for (const a of man.areas) {
    groups.set(a.key, {
      key: a.key, fi: a.fi, en: a.en, colour: '#e8a', line: null,
      g: svg.querySelector(`.colour[data-key="${a.key}"]`),
      glow: svg.querySelector(`.glow[data-for="${a.key}"]`),
      bbox: { x: a.x, y: a.y, width: a.w, height: a.h },
    });
  }

  // label map for hit-testing (and to sample swatch colours from the thumbnail)
  let labels = null;
  const lw = Math.ceil(W / man.labelScale), lh = Math.ceil(H / man.labelScale);
  const ready = Promise.all([loadImage(href(man.labels)), loadImage(href('thumb.webp')).catch(() => null)]).then(([img, thumb]) => {
    const cv = document.createElement('canvas');
    cv.width = lw; cv.height = lh;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, lw, lh).data;
    labels = new Uint8Array(lw * lh);
    for (let i = 0; i < labels.length; i++) labels[i] = Math.round(d[i * 4] / man.labelStep);
    if (!thumb) return;
    cx.drawImage(thumb, 0, 0, lw, lh);
    const t = cx.getImageData(0, 0, lw, lh).data;
    const sums = man.areas.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < labels.length; i++) {
      const s = sums[labels[i] - 1];
      if (s) { s[0] += t[i * 4]; s[1] += t[i * 4 + 1]; s[2] += t[i * 4 + 2]; s[3]++; }
    }
    man.areas.forEach((a, i) => {
      const [r, g, b, c] = sums[i];
      if (c) groups.get(a.key).colour = `rgb(${Math.round(r / c)},${Math.round(g / c)},${Math.round(b / c)})`;
    });
  });

  return {
    svg, defs, groups, W, H, ready,
    final: svg.querySelector('.final'),
    hitSvg(x, y) {
      if (!labels) return null;
      const lx = Math.floor(x / man.labelScale), ly = Math.floor(y / man.labelScale);
      if (lx < 0 || ly < 0 || lx >= lw || ly >= lh) return null;
      const v = labels[ly * lw + lx];
      return v ? man.areas[v - 1]?.key ?? null : null;
    },
    seek(o, on) { o.glow.classList.toggle('seek', on); },
    hover(o, on) { o.glow.classList.toggle('hover', on); },
    async snapshot(scale, painted, tints) {
      const [line, colour] = await Promise.all([loadImage(href(man.line)), loadImage(href(man.colour))]);
      const cv = document.createElement('canvas');
      cv.width = W * scale; cv.height = H * scale;
      const ctx = cv.getContext('2d');
      ctx.drawImage(line, 0, 0, cv.width, cv.height);
      const tmp = document.createElement('canvas');
      tmp.width = cv.width; tmp.height = cv.height;
      const t = tmp.getContext('2d');
      for (const a of man.areas) {
        if (!painted.has(a.key)) continue;
        if (painted.size === groups.size && a === man.areas[0]) ctx.drawImage(colour, 0, 0, cv.width, cv.height);
        const m = await loadImage(href(a.mask));
        t.globalCompositeOperation = 'source-over';
        t.filter = 'none';
        t.clearRect(0, 0, tmp.width, tmp.height);
        t.drawImage(m, a.x * scale, a.y * scale, a.w * scale, a.h * scale);
        // luminance mask -> alpha
        const id = t.getImageData(0, 0, tmp.width, tmp.height);
        for (let i = 0; i < id.data.length; i += 4) { id.data[i + 3] = id.data[i]; }
        t.putImageData(id, 0, 0);
        t.globalCompositeOperation = 'source-in';
        const tint = TINTS[tints[a.key] || 0];
        t.filter = tint.css;
        t.drawImage(colour, 0, 0, tmp.width, tmp.height);
        ctx.drawImage(tmp, 0, 0);
      }
      return new Promise((res) => cv.toBlob(res, 'image/png'));
    },
  };
}

// ---------------------------------------------------------------- shared controller
export async function mountScene(container, meta, sstate) {
  const n = ++mountCount;
  const S = meta.type === 'raster' ? await buildRaster(container, meta, n) : await buildVector(container, meta, n, sstate.variant || 0);
  const { svg, defs, groups } = S;
  const painted = new Set(sstate.painted.filter((k) => groups.has(k)));

  const apply = (key) => {
    const o = groups.get(key);
    const on = painted.has(key);
    o.g.style.visibility = on ? '' : 'hidden';
    o.g.classList.toggle('on', on);
    if (o.line) o.line.style.display = on ? 'none' : '';
    const t = sstate.tints[key];
    if (t) o.g.setAttribute('filter', `url(#tint${t}_${n})`);
    else o.g.removeAttribute('filter');
  };
  for (const key of groups.keys()) apply(key);
  // raster: once everything is painted, the full painting sits under the areas to hide seams
  const finish = () => { if (S.final) S.final.classList.toggle('show', painted.size === groups.size); };
  finish();

  const toSvg = (cx, cy) => {
    const p = new DOMPoint(cx, cy).matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  };
  let hovered = null;

  return {
    svg,
    groups,
    ready: S.ready || Promise.resolve(),
    total: groups.size,
    count: () => painted.size,
    isPainted: (k) => painted.has(k),
    remaining: () => [...groups.keys()].filter((k) => !painted.has(k)),
    toSvg,
    /** which area is under this screen point? */
    hit(cx, cy) {
      if (S.hitSvg) { const p = toSvg(cx, cy); return S.hitSvg(p.x, p.y); }
      return S.hit(cx, cy);
    },
    hover(key) {
      if (key === hovered) return;
      if (hovered) S.hover(groups.get(hovered), false);
      hovered = key && !painted.has(key) ? key : null;
      if (hovered) S.hover(groups.get(hovered), true);
    },
    /** watercolour reveal from (x,y) in svg units */
    paint(key, x, y) {
      const o = groups.get(key);
      if (!o || painted.has(key)) return Promise.resolve();
      if (hovered === key) this.hover(null);
      painted.add(key);
      sstate.painted = [...painted];
      const bb = o.bbox || o.g.getBBox();
      const far = Math.max(...[[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]
        .map(([px, py]) => Math.hypot(px - x, py - y))) * 1.08 + S.W * 0.06;
      const id = `m_${n}_${key}`;
      const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: -S.W * 0.2, y: -S.H * 0.2, width: S.W * 1.4, height: S.H * 1.4 });
      const c = el('circle', { cx: x, cy: y, r: 1, fill: '#fff', filter: `url(#wc_${n})` });
      mask.append(c);
      defs.append(mask);
      o.g.setAttribute('mask', `url(#${id})`);
      o.g.style.visibility = '';
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dur = reduce ? 150 : Math.min(1500, Math.max(700, (far / S.W) * 1900));
      const t0 = performance.now();
      return new Promise((resolve) => {
        const step = (now) => {
          const t = Math.min(1, Math.max(0, (now - t0) / dur));
          const e = 1 - (1 - t) ** 3;
          c.setAttribute('r', (4 + e * far).toFixed(1));
          if (o.line && t > 0.35) o.line.style.opacity = String(Math.max(0, 1 - (t - 0.35) / 0.65));
          if (t < 1) requestAnimationFrame(step);
          else {
            o.g.removeAttribute('mask');
            mask.remove();
            if (o.line) o.line.style.opacity = '';
            apply(key);
            finish();
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    },
    setTint(key, tint) {
      if (tint) sstate.tints[key] = tint;
      else delete sstate.tints[key];
      apply(key);
    },
    /** briefly glow every area that is still blank */
    highlightRemaining() {
      for (const k of groups.keys()) {
        if (painted.has(k)) continue;
        const o = groups.get(k);
        S.seek(o, false);
        void svg.getBoundingClientRect();
        S.seek(o, true);
        setTimeout(() => S.seek(o, false), 2700);
      }
    },
    /** PNG snapshot of the picture as painted so far */
    async toPNG(scale = 2) {
      if (S.snapshot) return S.snapshot(scale, painted, sstate.tints);
      const copy = svg.cloneNode(true);
      copy.querySelectorAll('.colour').forEach((g) => {
        if (g.style.visibility === 'hidden') g.remove();
        else g.removeAttribute('class');
      });
      copy.querySelectorAll('.lineart').forEach((l) => { if (l.style.display === 'none') l.remove(); });
      copy.setAttribute('width', S.W * scale);
      copy.setAttribute('height', S.H * scale);
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
      try {
        const img = await loadImage(url);
        const cv = document.createElement('canvas');
        cv.width = S.W * scale;
        cv.height = S.H * scale;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = PAPER;
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        return await new Promise((res) => cv.toBlob(res, 'image/png'));
      } finally {
        cache.delete(`img:${url}`);
        URL.revokeObjectURL(url);
      }
    },
  };
}
