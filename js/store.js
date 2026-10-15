// Save game in localStorage (one save per browser).
const KEY = 'kvizit.save.v1';

export const SCENES = [
  { id: 'mokki', type: 'vector', file: 'scenes/mokki.svg', fi: 'Mökkikesä', en: 'Cottage Summer' },
  { id: 'kesailta', type: 'raster', dir: 'scenes/kesailta/', fi: 'Kesäilta', en: 'Summer Evening' },
  { id: 'ruska', type: 'vector', file: 'scenes/ruska.svg', fi: 'Ruska', en: 'Autumn Colours' },
  { id: 'revontulet', type: 'vector', file: 'scenes/revontulet.svg', fi: 'Revontulet', en: 'Northern Lights' },
];

const fresh = () => ({
  v: 1,
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
    if (raw) state = { ...fresh(), ...JSON.parse(raw) };
    state.levels = { ...fresh().levels, ...state.levels };
  } catch { /* private mode etc. — play without saving */ }
  return state;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function reset() {
  state = fresh();
  save();
  return state;
}

export const get = () => state;

export function sceneState(id) {
  if (!state.scenes[id]) state.scenes[id] = { painted: [], tints: {}, done: false };
  return state.scenes[id];
}

export function isUnlocked(id) {
  const i = SCENES.findIndex((s) => s.id === id);
  return i === 0 || !!state.scenes[SCENES[i - 1].id]?.done;
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
