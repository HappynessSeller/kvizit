// Save game in localStorage (one save per browser).
const KEY = 'kvizit.save.v1';

export const SCENES = [
  { id: 'mokki', type: 'vector', file: 'scenes/mokki.svg', fi: 'Mökkikesä', en: 'Cottage Summer' },
  { id: 'kesailta', type: 'raster', dir: 'scenes/kesailta/', fi: 'Kesäilta', en: 'Summer Evening' },
  { id: 'ruska', type: 'vector', file: 'scenes/ruska.svg', fi: 'Ruska', en: 'Autumn Colours' },
  { id: 'revontulet', type: 'vector', file: 'scenes/revontulet.svg', fi: 'Revontulet', en: 'Northern Lights' },
  { id: 'saaristo', type: 'vector', file: 'scenes/saaristo.svg', fi: 'Saaristo', en: 'Archipelago' },
];

// Bump when vector scenes are redrawn with new areas. Old progress in REDRAWN scenes is cleared,
// the drops spent on it are refunded, and pictures that were finished stay unlocked.
const ART_VERSION = 3;
const REDRAWN = { 2: ['mokki', 'ruska', 'revontulet'], 3: ['ruska', 'revontulet', 'saaristo'] };

const fresh = () => ({
  v: 1,
  artV: ART_VERSION,
  name: '',
  lang: 'fi',
  sound: true,
  drops: 0,
  totalDrops: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  rounds: 0,
  levels: { kerto: 1, jako: 1, plusmiinus: 1, murto: 1, mitat: 1, sanat: 1 },
  topicStats: {},
  scenes: {},
  current: 'mokki',
  lastDay: '',
  dayStreak: 0,
  bonusDay: '',
});

let state = fresh();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      state = { ...fresh(), ...saved, artV: saved.artV || 1 };
    }
    state.levels = { ...fresh().levels, ...state.levels };
    migrateArt();
  } catch { /* private mode etc. — play without saving */ }
  return state;
}

function migrateArt() {
  if (state.artV >= ART_VERSION) return;
  // pictures the player could already open stay open, whatever gets reset below
  const open = SCENES.filter((sc) => isUnlocked(sc.id)).map((sc) => sc.id);
  while (state.artV < ART_VERSION) {
    state.artV++;
    for (const id of REDRAWN[state.artV] || []) {
      const old = state.scenes[id];
      if (!old) continue;
      const n = old.painted?.length || 0;
      state.drops += n;
      state.refunded = (state.refunded || 0) + n;
      state.scenes[id] = { painted: [], tints: {}, done: false, variant: 0 };
    }
  }
  for (const id of open) sceneState(id).unlocked = true;
  save();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function reset() {
  state = fresh();
  save();
  return state;
}

/** Clear paint drops and pictures; keep the name, settings, maths levels and stats. */
export function resetProgress() {
  const f = fresh();
  Object.assign(state, { drops: f.drops, totalDrops: f.totalDrops, scenes: f.scenes, current: f.current });
  save();
  return state;
}

export const get = () => state;

export function sceneState(id) {
  if (!state.scenes[id]) state.scenes[id] = { painted: [], tints: {}, done: false, variant: 0 };
  return state.scenes[id];
}

export function isUnlocked(id) {
  const i = SCENES.findIndex((s) => s.id === id);
  return i === 0 || !!state.scenes[SCENES[i - 1].id]?.done || !!state.scenes[id]?.unlocked;
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Called on launch: keeps the "days in a row" counter. */
export function touchDay() {
  const t = today();
  if (state.lastDay === t) return;
  const y = new Date(Date.now() - 864e5);
  const ys = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  state.dayStreak = state.lastDay === ys ? state.dayStreak + 1 : 1;
  state.lastDay = t;
  save();
}
