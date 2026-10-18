import * as store from './store.js';
import { SCENES } from './store.js';
import { TOPICS, LEVEL_NAMES, makeQuestion, checkNum, answerText } from './math.js';
import { mountScene, preload, TINTS } from './scene.js';
import { sfx, buzz, setEnabled as setSound, unlock as unlockAudio } from './audio.js';
import { confetti, splash, fly } from './fx.js';

// ------------------------------------------------------------------ strings
const STR = {
  fi: {
    helloBubble: 'Hei! Minä olen Huhu-pöllö. Lasketaan yhdessä ja maalataan kauniita kuvia! Mikä sinun nimesi on?',
    nameLabel: 'Nimi', namePh: 'Kirjoita nimesi', start: 'Aloitetaan!',
    greet: (n) => (n ? `Hei, ${n}!` : 'Hei!'), settings: 'Asetukset', back: 'Takaisin', close: 'Sulje', quit: 'Lopeta',
    paint: 'Maalaa', play: 'Laske ja ansaitse värejä', playSub: 'Jokainen oikea vastaus = 1 väri', gallery: 'Taidegalleria',
    chooseTopic: 'Mitä lasketaan?', level: 'Taso', erase: 'Pyyhi', check: 'Tarkista', continue: 'Jatka',
    goPaint: 'Maalaamaan!', again: 'Uusi kierros', home: 'Kotiin',
    seek: 'Etsi', saveImg: 'Tallenna kuva', earnMore: 'Laske lisää', tintTitle: 'Vaihda sävyä',
    zoomIn: 'Lähennä', zoomOut: 'Loitonna', zoomFit: 'Koko kuva', admire: 'Ihaile kuvaa',
    language: 'Kieli', sound: 'Äänet', parents: 'Vanhemmille',
    parentsInfo: 'Taso nousee automaattisesti, kun kierros menee hyvin, ja laskee, jos tehtävät ovat liian vaikeita. Voit myös valita tason itse.',
    reset: 'Aloita alusta', resetQ: 'Poistetaanko kaikki värit, kuvat ja tasot? Tätä ei voi perua.', yes: 'Kyllä, poista', no: 'Peruuta',
    cheat: '+10 väriä!', resetProgress: 'Nollaa edistyminen', resetProgressQ: 'Poistetaanko kaikki värit ja maalatut kuvat? Nimi ja laskutasot säilyvät.', resetProgressYes: 'Kyllä, nollaa',
    refund: (n) => `Kuvat on piirretty uudelleen! Sait takaisin ${n} väriä, jotka olit jo käyttänyt.`, ok: 'Jes!',
    regen: 'Uusi versio tästä kuvasta', regenOrig: 'Alkuperäinen kuva', variantNow: (v) => (v ? `Kuvan versio ${v} (testi)` : 'Alkuperäinen kuva'), regenNo: 'Tästä kuvasta ei voi tehdä uutta versiota.',
    quitQ: 'Lopetetaanko kierros? Ansaitut värit säilyvät.', quitYes: 'Lopeta', quitNo: 'Jatketaan',
    areas: (a, b) => `${a} / ${b} aluetta maalattu`, doneScene: 'Valmis taulu!',
    hintTap: 'Napauta tyhjää aluetta maalataksesi sen.', hintCost: 'Yksi alue = 1', hintEmpty: 'Värit loppuivat! Laske tehtäviä, niin saat lisää.',
    hintDone: 'Kuva on valmis! Napauta aluetta vaihtaaksesi sen sävyä.', needDrops: 'Tarvitset värejä!',
    stats: (r, c, a) => `Kierroksia ${r} · oikein ${c}/${a}`,
    daily: (n) => `Päivän ensimmäinen kierros: <b>+${n}</b> bonusväriä!`, streak: (n) => `${n} päivää putkeen`,
    good: ['Hienoa!', 'Mahtavaa!', 'Oikein!', 'Upeaa!', 'Huippua!', 'Loistavaa!', 'Jes!', 'Taitava!', 'Nappiin!'],
    streakBonus: (n) => `${n} oikein putkeen! +1 lisäväri!`, tryAgain: 'Ei aivan… kokeile vielä kerran!',
    oops: ['Melkein! Katsotaan yhdessä.', 'Ei haittaa – nyt opitaan!', 'Hups! Tässä vinkki.'],
    correctIs: (a) => `Oikea vastaus on ${a}.`, startLines: ['Aloitetaan! Sinä pystyt tähän.', 'Valmiina? Mennään!', 'Rauhassa vain – mietitään yhdessä.'],
    retryLine: 'Tämä tehtävä tuli uudestaan. Nyt osaat!',
    res3: 'Täydellistä!', res2: 'Hienoa työtä!', res1: 'Hyvä yritys!',
    resFirst: (a, b) => `Oikein ensimmäisellä yrityksellä: ${a}/${b}`, resStreak: (n) => `Pisin putki: ${n}`,
    resPerfect: 'Kaikki oikein: +3 bonusväriä', resDaily: (n) => `Päivän bonus: +${n}`,
    lvUp: (t, n) => `Taso nousi! ${t} → taso ${n} ✨`, lvDown: (t, n) => `${t}: harjoitellaan tasolla ${n}`,
    painted: (x) => `${x} maalattu!`, next: (x) => `Seuraavaksi: ${x}`, allDone: 'Kaikki kuvat on maalattu! Olet todellinen taiteilija. Voit yhä vaihtaa sävyjä ja tallentaa kuvia.',
    doneText: (x) => `Taulu „${x}” on nyt galleriassa.`, locked: (x) => `Maalaa ensin: ${x}`, inGallery: 'Valmis', soon: 'Tulossa pian',
    quizTopic: (t, l) => `${t} · taso ${l}`, mixTopic: (t) => `Sekoitus · ${t}`,
  },
  en: {
    helloBubble: "Hi! I'm Huhu the owl. Let's do maths together and paint beautiful pictures! What's your name?",
    nameLabel: 'Name', namePh: 'Type your name', start: "Let's go!",
    greet: (n) => (n ? `Hi, ${n}!` : 'Hi!'), settings: 'Settings', back: 'Back', close: 'Close', quit: 'Quit',
    paint: 'Paint', play: 'Solve & earn paint', playSub: 'Every right answer = 1 paint drop', gallery: 'Art gallery',
    chooseTopic: 'What shall we practise?', level: 'Level', erase: 'Erase', check: 'Check', continue: 'Continue',
    goPaint: 'Go paint!', again: 'Another round', home: 'Home',
    seek: 'Find', saveImg: 'Save picture', earnMore: 'Earn more', tintTitle: 'Change shade',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out', zoomFit: 'Whole picture', admire: 'Admire it',
    language: 'Language', sound: 'Sounds', parents: 'For parents',
    parentsInfo: 'Levels go up automatically after a good round and down if it gets too hard. You can also pick a level yourself.',
    reset: 'Start over', resetQ: 'Delete all paint, pictures and levels? This cannot be undone.', yes: 'Yes, delete', no: 'Cancel',
    cheat: '+10 drops!', resetProgress: 'Reset progress', resetProgressQ: 'Remove all paint drops and painted pictures? Your name and maths levels are kept.', resetProgressYes: 'Yes, reset',
    refund: (n) => `The pictures have been redrawn! You got back the ${n} drops you had used.`, ok: 'Yay!',
    regen: 'New version of this picture', regenOrig: 'Original picture', variantNow: (v) => (v ? `Picture version ${v} (test)` : 'Original picture'), regenNo: 'This picture has no other versions.',
    quitQ: 'Stop this round? You keep the paint you earned.', quitYes: 'Stop', quitNo: 'Keep going',
    areas: (a, b) => `${a} / ${b} areas painted`, doneScene: 'Finished painting!',
    hintTap: 'Tap a blank area to paint it.', hintCost: 'One area = 1', hintEmpty: 'Out of paint! Solve some problems to earn more.',
    hintDone: 'The picture is finished! Tap an area to change its shade.', needDrops: 'You need paint!',
    stats: (r, c, a) => `Rounds ${r} · correct ${c}/${a}`,
    daily: (n) => `First round of the day: <b>+${n}</b> bonus drops!`, streak: (n) => `${n} days in a row`,
    good: ['Great!', 'Awesome!', 'Correct!', 'Brilliant!', 'Super!', 'Well done!', 'Yes!', 'Clever!', 'Spot on!'],
    streakBonus: (n) => `${n} in a row! +1 bonus drop!`, tryAgain: 'Not quite… try once more!',
    oops: ["Almost! Let's look together.", "No worries – now we learn!", 'Oops! Here is a hint.'],
    correctIs: (a) => `The answer is ${a}.`, startLines: ["Let's start! You can do this.", 'Ready? Go!', "Take your time – we'll think together."],
    retryLine: 'This one came back. You know it now!',
    res3: 'Perfect!', res2: 'Great work!', res1: 'Good try!',
    resFirst: (a, b) => `Right on the first try: ${a}/${b}`, resStreak: (n) => `Longest streak: ${n}`,
    resPerfect: 'All correct: +3 bonus drops', resDaily: (n) => `Daily bonus: +${n}`,
    lvUp: (t, n) => `Level up! ${t} → level ${n} ✨`, lvDown: (t, n) => `${t}: practising at level ${n}`,
    painted: (x) => `${x} painted!`, next: (x) => `Next: ${x}`, allDone: 'Every picture is painted! You are a true artist. You can still change shades and save pictures.',
    doneText: (x) => `“${x}” is now in your gallery.`, locked: (x) => `First paint: ${x}`, inGallery: 'Finished', soon: 'Coming soon',
    quizTopic: (t, l) => `${t} · level ${l}`, mixTopic: (t) => `Mix · ${t}`,
  },
};

let S = store.load();
const t = (k, ...a) => {
  const v = STR[S.lang]?.[k] ?? STR.fi[k];
  return typeof v === 'function' ? v(...a) : v;
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const name = (o) => o[S.lang] || o.fi;
const sceneMeta = (id) => SCENES.find((s) => s.id === id) || SCENES[0];
const DROP = '<svg><use href="#i-drop"/></svg>';

function applyStrings() {
  document.documentElement.lang = S.lang;
  $$('[data-t]').forEach((n) => { n.textContent = t(n.dataset.t); });
  $$('[data-t-aria]').forEach((n) => { const v = t(n.dataset.tAria); n.setAttribute('aria-label', v); n.title = v; });
  $$('[data-ph]').forEach((n) => { n.placeholder = t(n.dataset.ph); });
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === S.lang)));
}

function updateDrops(bump = false) {
  $$('.drops-n').forEach((n) => { n.textContent = S.drops; });
  if (bump) $$('.chip.drops').forEach((c) => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
}

// ------------------------------------------------------------------ screens
let current = null;
const onShow = {};
function go(screen, opts) {
  const run = () => {
    $$('.screen').forEach((s) => { s.hidden = s.id !== `s-${screen}`; });
    current = screen;
    onShow[screen]?.(opts);
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && current && !reduce) document.startViewTransition(run);
  else run();
}
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) { sfx.tap(); go(g.dataset.go); }
  if (e.target.closest('[data-drops]')) dropTap();
});
// secret: three quick taps on a drop counter give 10 drops. A single tap still opens the
// paint screen, just a moment later so the next taps land on the same chip.
let dropTaps = 0, dropTapAt = 0, dropGoT;
function dropTap() {
  const now = performance.now();
  dropTaps = now - dropTapAt < 450 ? dropTaps + 1 : 1;
  dropTapAt = now;
  clearTimeout(dropGoT);
  if (dropTaps >= 3) {
    dropTaps = 0;
    S.drops += 10;
    store.save();
    sfx.drop();
    updateDrops(true);
    if (current === 'paint') { toast(t('cheat')); paintHint(); }
    return;
  }
  if (current !== 'paint') dropGoT = setTimeout(() => { sfx.tap(); go('paint'); }, 450);
}

// ------------------------------------------------------------------ hello
function initHello() {
  const input = $('#name-input');
  input.value = S.name;
  $('#hello-form').addEventListener('submit', (e) => {
    e.preventDefault();
    unlockAudio();
    S.name = input.value.trim().slice(0, 16);
    store.save();
    sfx.levelUp();
    go('home');
  });
}
onShow.hello = () => setTimeout(() => $('#name-input').focus({ preventScroll: true }), 400);

// ------------------------------------------------------------------ home
let homeMount = null;
onShow.home = async () => {
  $('#greet-text').textContent = t('greet', S.name);
  updateDrops();
  $('#streak-chip').hidden = S.dayStreak < 2;
  $('#streak-n').textContent = S.dayStreak;
  $('#streak-chip').title = t('streak', S.dayStreak);
  const daily = S.bonusDay !== store.today();
  $('#daily-hint').hidden = !daily;
  if (daily) $('#daily-hint').innerHTML = t('daily', 3);
  // a finished picture hands the easel over to the next unfinished one
  if (store.sceneState(S.current).done) {
    const nextUp = SCENES.find((sc) => store.isUnlocked(sc.id) && !store.sceneState(sc.id).done);
    if (nextUp) { S.current = nextUp.id; store.save(); }
  }
  const meta = sceneMeta(S.current);
  const ss = store.sceneState(meta.id);
  $('#home-scene-title').textContent = name(meta);
  const host = $('#home-scene');
  const ver = `${ss.painted.length}${JSON.stringify(ss.tints)}v${ss.variant || 0}`;
  if (host.dataset.scene !== meta.id || host.dataset.ver !== ver) {
    try {
      homeMount = await mountScene(host, meta, ss);
      host.dataset.scene = meta.id;
      host.dataset.ver = ver;
    } catch (err) { console.error(err); }
  }
  const total = homeMount?.total || 1, done = ss.painted.length;
  $('#home-progress-bar').style.width = `${(done / total) * 100}%`;
  $('#home-progress-text').textContent = ss.done ? t('doneScene') : t('areas', done, total);
};
$('#home-easel .easel-frame').addEventListener('click', () => { sfx.tap(); go('paint'); });
$('#btn-home-paint').addEventListener('click', () => { sfx.tap(); go('paint'); });
$('#btn-play').addEventListener('click', () => { unlockAudio(); sfx.tap(); go('topics'); });
$('#btn-gallery').addEventListener('click', () => { sfx.tap(); go('gallery'); });

// ------------------------------------------------------------------ topics
onShow.topics = () => {
  updateDrops();
  const grid = $('#topic-grid');
  grid.innerHTML = '';
  for (const tp of TOPICS) {
    const b = document.createElement('button');
    b.className = `topic${tp.id === 'sekoitus' ? ' mix' : ''}`;
    b.style.setProperty('--c', tp.color);
    b.style.setProperty('--b', tp.bg);
    const lv = S.levels[tp.id];
    const sub = tp.id === 'sekoitus'
      ? (S.lang === 'en' ? 'A bit of everything' : 'Vähän kaikkea')
      : `${t('level')} ${lv}: ${LEVEL_NAMES[tp.id][lv - 1][S.lang === 'en' ? 1 : 0]}`;
    const stars = tp.id === 'sekoitus' ? '' : `<div class="stars" aria-label="${t('level')} ${lv}/5">${[1, 2, 3, 4, 5].map((i) => `<svg><use href="#i-star${i <= lv ? '' : '-empty'}"/></svg>`).join('')}</div>`;
    b.innerHTML = `<span class="ticon">${tp.icon}</span><span><h3>${name(tp)}</h3><p>${sub}</p>${stars}</span>`;
    b.addEventListener('click', () => { sfx.tap(); startRound(tp.id); });
    grid.append(b);
  }
};

// ------------------------------------------------------------------ quiz
const ROUND = 10;
let R = null;
const owl = $('#quiz-owl');
function mood(m, ms = 900) {
  owl.dataset.mood = 'idle';
  void owl.getBoundingClientRect();
  owl.dataset.mood = m;
  clearTimeout(mood.t);
  if (m !== 'idle') mood.t = setTimeout(() => { owl.dataset.mood = 'idle'; }, ms);
}
const say = (txt) => { $('#quiz-bubble').innerHTML = txt; };

function startRound(topic) {
  R = { topic, asked: 0, pos: 0, dots: Array(ROUND).fill(''), retry: [], seen: new Set(), streak: 0, best: 0, earned: 0,
    first: 0, byTopic: {}, q: null, input: '', tries: 0, busy: false };
  go('quiz');
  say(pick(t('startLines')));
  $('#quiz-drops-n').textContent = '+0';
  nextQuestion();
}

function renderDots() {
  $('#quiz-dots').innerHTML = R.dots.map((d, i) => `<i class="${d}${i === R.pos ? ' now' : ''}"></i>`).join('');
}

function nextQuestion() {
  let q;
  if (R.retry.length && (R.retry[0].due <= R.asked || R.asked >= ROUND)) {
    q = R.retry.shift().q;
    q.isRetry = true;
    say(t('retryLine'));
  } else if (R.asked < ROUND) {
    q = makeQuestion(R.topic, S.levels, S.lang, R.seen);
    R.asked++;
  } else return finishRound();
  R.q = q;
  R.input = '';
  R.tries = 0;
  R.busy = false;
  renderDots();
  const tp = TOPICS.find((x) => x.id === q.topic);
  $('#qtopic').textContent = R.topic === 'sekoitus' ? t('mixTopic', name(tp)) : t('quizTopic', name(tp), q.level);
  $('#qvisual').innerHTML = q.visual || '';
  const prompt = $('#qprompt');
  const hasBox = q.prompt.includes('qbox');
  prompt.innerHTML = q.prompt + (hasBox && q.post ? ` <span class="post">${q.post}</span>` : '');
  prompt.classList.toggle('long', q.prompt.replace(/<[^>]+>/g, '').length > 28);
  $('#qanswer').innerHTML = q.kind === 'num' && !hasBox ? `<span class="qbox"></span>${q.post ? `<span class="post">${q.post}</span>` : ''}` : '';
  $('#qhint').textContent = q.hint || '';
  const card = $('#qcard');
  card.classList.remove('pop', 'right', 'wrong');
  void card.offsetWidth;
  card.classList.add('pop');
  const isChoice = q.kind === 'choice';
  $('#keypad').hidden = isChoice;
  const ch = $('#choices');
  ch.hidden = !isChoice;
  if (isChoice) {
    ch.className = `choices${q.choices.length === 3 ? ' three' : ''}`;
    ch.innerHTML = q.choices.map((c, i) => `<button data-i="${i}">${c}</button>`).join('');
  }
  $('.k-comma').disabled = !q.decimal;
  renderInput();
}

function inputBox() {
  return $('#qprompt .qbox') || $('#qanswer .qbox');
}
function renderInput() {
  const box = inputBox();
  if (!box || R.q.kind !== 'num') return;
  box.textContent = R.input || (R.busy ? '' : '?');
  box.classList.toggle('filled', !!R.input);
  box.classList.toggle('caret', !R.busy);
  if (!R.input && !R.busy) box.textContent = '';
}

function press(k) {
  if (!R || R.busy || R.q.kind !== 'num') return;
  if (k === 'ok') return submit();
  if (k === 'back') R.input = R.input.slice(0, -1);
  else if (k === ',') { if (R.q.decimal && !R.input.includes(',')) R.input = (R.input || '0') + ','; }
  else if (R.input.length < 7) R.input = R.input === '0' ? k : R.input + k;
  sfx.key();
  renderInput();
}

$('#keypad').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) press(b.dataset.k);
});
$('#choices').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && !R.busy) submitChoice(+b.dataset.i, b);
});

function award(n, fromEl) {
  S.drops += n;
  S.totalDrops += n;
  R.earned += n;
  store.save();
  for (let i = 0; i < n; i++) {
    setTimeout(() => fly(fromEl, $('#quiz-drops'), DROP, {
      onEnd: () => { sfx.drop(); $('#quiz-drops-n').textContent = `+${R.earned}`; $('#quiz-drops').classList.remove('bump'); void $('#quiz-drops').offsetWidth; $('#quiz-drops').classList.add('bump'); },
    }), i * 160);
  }
}

function record(ok) {
  const q = R.q;
  if (q.isRetry) return;
  const bt = (R.byTopic[q.topic] ||= { n: 0, ok: 0 });
  bt.n++;
  const firstTry = ok && R.tries === 0;
  if (firstTry) { bt.ok++; R.first++; }
  const st = (S.topicStats[q.topic] ||= { n: 0, ok: 0 });
  st.n++;
  if (firstTry) st.ok++;
  S.totalAnswered++;
  if (ok) S.totalCorrect++;
}

function onCorrect(fromEl) {
  R.busy = true;
  record(true);
  if (R.tries === 0) R.streak++; else R.streak = 0;
  R.best = Math.max(R.best, R.streak);
  R.dots[R.pos] = 'ok' + (R.q.isRetry ? ' retry' : '');
  renderInput();
  $('#qcard').classList.add('right');
  sfx.correct(R.streak);
  buzz(10);
  mood('happy');
  let n = 1;
  if (R.streak > 0 && R.streak % 3 === 0) { n++; say(t('streakBonus', R.streak)); }
  else say(pick(t('good')));
  award(n, $('#qcard'));
  R.pos++;
  setTimeout(nextQuestion, 950);
}

function onWrong(fromEl) {
  const q = R.q;
  // one more try for typed answers
  if (q.kind === 'num' && R.tries === 0) {
    R.tries++;
    sfx.wrong();
    buzz([20, 40, 20]);
    mood('think');
    say(t('tryAgain'));
    const card = $('#qcard');
    card.classList.remove('wrong'); void card.offsetWidth; card.classList.add('wrong');
    R.input = '';
    renderInput();
    return;
  }
  R.busy = true;
  record(false);
  R.streak = 0;
  R.dots[R.pos] = 'miss' + (q.isRetry ? ' retry' : '');
  if (!q.isRetry) {
    R.retry.push({ q, due: R.asked + 2 });
    R.dots.push('retry');
  }
  sfx.wrong();
  buzz([20, 40, 20]);
  mood('think', 1400);
  say(pick(t('oops')));
  $('#fb-title').textContent = t('correctIs', answerText(q).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  if (q.kind === 'choice') $('#fb-title').innerHTML = t('correctIs', answerText(q));
  $('#fb-explain').innerHTML = q.explain || '';
  $('#feedback').hidden = false;
  setTimeout(() => $('#fb-next').focus({ preventScroll: true }), 50);
}
$('#fb-next').addEventListener('click', () => {
  $('#feedback').hidden = true;
  sfx.tap();
  R.pos++;
  nextQuestion();
});

function submit() {
  if (!R.input) {
    const box = inputBox();
    box?.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 250 });
    return;
  }
  if (checkNum(R.q, R.input)) onCorrect(); else onWrong();
}
function submitChoice(i, btn) {
  const ok = i === R.q.answer;
  btn.classList.add(ok ? 'right' : 'wrong');
  if (!ok) $$('#choices button')[R.q.answer]?.classList.add('right');
  ok ? onCorrect(btn) : onWrong(btn);
}

document.addEventListener('keydown', (e) => {
  if (current !== 'quiz' || !R) return;
  if (!$('#feedback').hidden) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#fb-next').click(); }
    return;
  }
  if (document.querySelector('dialog[open]')) return;
  if (R.q?.kind === 'choice') {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= R.q.choices.length) { const b = $$('#choices button')[n - 1]; if (b && !R.busy) submitChoice(n - 1, b); }
    return;
  }
  let k = null;
  if (/^[0-9]$/.test(e.key)) k = e.key;
  else if (e.key === 'Backspace') k = 'back';
  else if (e.key === 'Enter') k = 'ok';
  else if (e.key === ',' || e.key === '.') k = ',';
  if (!k) return;
  e.preventDefault();
  const btn = $(`#keypad [data-k="${k}"]`);
  btn?.classList.add('pressed');
  setTimeout(() => btn?.classList.remove('pressed'), 120);
  press(k);
});

$('#btn-quit').addEventListener('click', async () => {
  sfx.tap();
  if (await confirmDlg(t('quitQ'), t('quitYes'), t('quitNo'))) { R = null; go('home'); }
});

function finishRound() {
  const acc = R.first / ROUND;
  const stars = acc >= 0.9 ? 3 : acc >= 0.65 ? 2 : 1;
  const lines = [{ txt: t('resFirst', R.first, ROUND) }];
  if (R.best >= 3) lines.push({ txt: t('resStreak', R.best) });
  let bonus = 0;
  if (R.first === ROUND) { bonus += 3; lines.push({ txt: t('resPerfect'), up: true }); }
  if (S.bonusDay !== store.today()) { bonus += 3; S.bonusDay = store.today(); lines.push({ txt: t('resDaily', 3), up: true }); }
  // adapt levels per topic
  let levelled = false;
  for (const [tp, r] of Object.entries(R.byTopic)) {
    if (r.n < 3) continue;
    const a = r.ok / r.n;
    const tname = name(TOPICS.find((x) => x.id === tp));
    if (a >= 0.8 && S.levels[tp] < 5) { S.levels[tp]++; lines.push({ txt: t('lvUp', tname, S.levels[tp]), up: true }); levelled = true; }
    else if (a < 0.45 && S.levels[tp] > 1) { S.levels[tp]--; lines.push({ txt: t('lvDown', tname, S.levels[tp]) }); }
  }
  S.drops += bonus;
  S.totalDrops += bonus;
  S.rounds++;
  store.save();
  const earned = R.earned + bonus;
  const topic = R.topic;
  R = null;
  go('results', { stars, earned, lines, levelled, topic });
}

// ------------------------------------------------------------------ results
let lastTopic = 'kerto';
onShow.results = ({ stars, earned, lines, levelled, topic }) => {
  lastTopic = topic;
  $('#res-title').textContent = t(`res${stars}`);
  $('#res-stars').innerHTML = [1, 2, 3].map((i) => `<svg class="${i <= stars ? 'in' : ''}" style="animation-delay:${0.25 + i * 0.22}s"><use href="#i-star${i <= stars ? '' : '-empty'}"/></svg>`).join('');
  $('#res-lines').innerHTML = lines.map((l) => `<li class="${l.up ? 'up' : ''}">${l.txt}</li>`).join('');
  const out = $('#res-drops');
  out.textContent = '0';
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 1100);
    out.textContent = Math.round(earned * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(step);
  };
  setTimeout(() => requestAnimationFrame(step), 300);
  [1, 2, 3].forEach((i) => { if (i <= stars) setTimeout(() => sfx.correct(i * 2), 250 + i * 220); });
  if (levelled) setTimeout(() => sfx.levelUp(), 1200);
  if (stars >= 2) setTimeout(() => confetti({ y: innerHeight * 0.3, count: stars === 3 ? 160 : 90 }), 500);
  const o = $('#res-owl');
  o.dataset.mood = 'idle'; void o.getBoundingClientRect(); o.dataset.mood = 'happy';
};
$('#btn-res-paint').addEventListener('click', () => { sfx.tap(); go('paint'); });
$('#btn-res-again').addEventListener('click', () => { sfx.tap(); startRound(lastTopic); });

// ------------------------------------------------------------------ paint
let P = null; // { meta, ss, ctrl }
const view = { s: 1, x: 0, y: 0 };
const wrap = $('#canvas-wrap');
const stage = $('#stage');

function applyView(animate = false) {
  const r = stage.getBoundingClientRect();
  const maxS = 5;
  view.s = Math.min(maxS, Math.max(1, view.s));
  view.x = Math.min(0, Math.max(r.width - r.width * view.s, view.x));
  view.y = Math.min(0, Math.max(r.height - r.height * view.s, view.y));
  wrap.style.transition = animate ? 'transform .3s cubic-bezier(.2,.9,.3,1)' : 'none';
  wrap.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
}
function zoomAt(cx, cy, factor, animate) {
  const r = stage.getBoundingClientRect();
  const px = cx - r.left, py = cy - r.top;
  const ns = Math.min(5, Math.max(1, view.s * factor));
  const k = ns / view.s;
  view.x = px - (px - view.x) * k;
  view.y = py - (py - view.y) * k;
  view.s = ns;
  applyView(animate);
}
const resetView = (animate) => { view.s = 1; view.x = 0; view.y = 0; applyView(animate); };

// pointer handling: tap = paint, drag = pan (when zoomed), two fingers = pinch
{
  const pts = new Map();
  let start = null, pinch = null, moved = false;
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.zoom-ctrls, .tint-pop')) return;
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; moved = false; }
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, vx: view.x, vy: view.y };
      moved = true;
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) {
      if (e.pointerType === 'mouse' && P?.ctrl) P.ctrl.hover(P.ctrl.hit(e.clientX, e.clientY));
      return;
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = stage.getBoundingClientRect();
      const ns = Math.min(5, Math.max(1, pinch.s * (d / pinch.d)));
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      const k = ns / pinch.s;
      view.s = ns;
      view.x = mx - (pinch.mx - r.left - pinch.vx) * k;
      view.y = my - (pinch.my - r.top - pinch.vy) * k;
      applyView();
    } else if (pts.size === 1 && start) {
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) > 8) moved = true;
      if (moved && view.s > 1) { view.x = start.vx + dx; view.y = start.vy + dy; applyView(); }
    }
  });
  const end = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) {
      if (!moved && e.type === 'pointerup') onPaintTap(e.clientX, e.clientY);
      start = null;
    }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerleave', () => P?.ctrl?.hover(null));
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });
  addEventListener('resize', () => { if (current === 'paint') applyView(); });
}
$('#z-in').addEventListener('click', () => { const r = stage.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.5, true); });
$('#z-out').addEventListener('click', () => { const r = stage.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.5, true); });
$('#z-fit').addEventListener('click', () => resetView(true));

function paintHint() {
  const h = $('#paint-hint');
  if (!P) return;
  if (P.ss.done) h.textContent = t('hintDone');
  else if (S.drops > 0) h.innerHTML = `${t('hintTap')} <span style="white-space:nowrap;display:inline-flex;align-items:center;gap:4px">${t('hintCost')} ${DROP}</span>`;
  else h.textContent = t('hintEmpty');
  const c = P.ctrl;
  $('#paint-progress-bar').style.width = `${(c.count() / c.total) * 100}%`;
  $('#btn-save-img').hidden = !P.ss.done;
  $('#btn-seek').hidden = P.ss.done;
  $('#btn-paint-play').classList.toggle('primary', S.drops === 0 && !P.ss.done);
}

let toastT;
function toast(txt) {
  const el = $('#paint-toast');
  el.textContent = txt;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 1600);
}

onShow.paint = async (opts = {}) => {
  updateDrops();
  hideTint();
  const meta = sceneMeta(opts.scene || S.current);
  if (store.isUnlocked(meta.id)) S.current = meta.id;
  const ss = store.sceneState(meta.id);
  $('#paint-title').textContent = name(meta);
  resetView();
  const host = $('#paint-scene');
  try {
    const ctrl = await mountScene(host, meta, ss);
    P = { meta, ss, ctrl };
    await ctrl.ready;
  } catch (err) {
    console.error(err);
    host.innerHTML = `<p class="muted" style="padding:2rem">${t('soon')}</p>`;
    P = null;
    return;
  }
  paintHint();
  renderTray();
  const idx = SCENES.indexOf(meta);
  if (SCENES[idx + 1]) preload(SCENES[idx + 1]);
};

// chips for the areas still blank — easy targets for tiny areas on a phone
function renderTray() {
  const tray = $('#tray');
  if (!P || P.ss.done) { tray.innerHTML = ''; return; }
  tray.innerHTML = P.ctrl.remaining().map((k) => {
    const g = P.ctrl.groups.get(k);
    return `<button data-key="${k}"><i style="background:${g.colour}"></i>${name(g)}</button>`;
  }).join('');
}
$('#tray').addEventListener('click', (e) => {
  const b = e.target.closest('[data-key]');
  if (!b || !P) return;
  const key = b.dataset.key;
  const o = P.ctrl.groups.get(key);
  const bb = o.bbox || o.g.getBBox();
  const m = P.ctrl.svg.getScreenCTM();
  const pt = new DOMPoint(bb.x + bb.width / 2, bb.y + bb.height / 2).matrixTransform(m);
  onPaintTap(pt.x, pt.y, key);
});

let painting = 0;
async function onPaintTap(cx, cy, forced) {
  if (!P) return;
  if (!$('#tint-pop').hidden) { hideTint(); return; }
  const key = forced || P.ctrl.hit(cx, cy);
  if (!key) return;
  if (P.ctrl.isPainted(key)) { if (!forced) openTint(key, cx, cy); return; }
  if (S.drops <= 0) {
    sfx.nope();
    buzz(30);
    const chip = $('#paint-drops');
    chip.classList.remove('shake'); void chip.offsetWidth; chip.classList.add('shake');
    toast(t('needDrops'));
    paintHint();
    return;
  }
  S.drops--;
  updateDrops(true);
  const g = P.ctrl.groups.get(key);
  const p = P.ctrl.toSvg(cx, cy);
  sfx.paint();
  buzz(8);
  splash(cx, cy, g.colour);
  toast(t('painted', name(g)));
  painting++;
  const pr = P.ctrl.paint(key, p.x, p.y);
  store.save();
  paintHint();
  const chip = $(`#tray [data-key="${key}"]`);
  if (chip) { chip.classList.add('gone'); setTimeout(() => chip.remove(), 400); }
  await pr;
  painting--;
  if (!P.ss.done && P.ctrl.count() === P.ctrl.total && painting === 0) sceneComplete();
}

async function sceneComplete() {
  const { meta, ss } = P;
  ss.done = true;
  const idx = SCENES.indexOf(meta);
  const next = SCENES[idx + 1];
  if (next) S.current = next.id;
  store.save();
  paintHint();
  renderTray();
  sfx.fanfare();
  buzz([30, 60, 30, 60, 80]);
  confetti({ rain: true, count: 180 });
  setTimeout(() => confetti({ count: 140, y: innerHeight * 0.4 }), 300);
  $('#done-title').textContent = t('doneScene');
  $('#done-text').textContent = `${t('doneText', name(meta))} ${next ? t('next', name(next)) : t('allDone')}`;
  const nb = $('#btn-done-next');
  nb.textContent = next ? t('next', name(next)) : t('home');
  const host = $('#done-scene');
  const dlg = $('#dlg-done');
  dlg.showModal();
  try { await mountScene(host, meta, ss); } catch { /* ignore */ }
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'next') {
      if (next) { S.current = next.id; store.save(); go('paint', { scene: next.id }); }
      else go('home');
    }
  }, { once: true });
}

// tints
let tintKey = null;
function openTint(key, cx, cy) {
  tintKey = key;
  const pop = $('#tint-pop');
  const sw = $('#swatches');
  const g = P.ctrl.groups.get(key);
  const cur = P.ss.tints[key] || 0;
  sw.innerHTML = TINTS.map((tn) => `<button data-tint="${tn.id}" aria-pressed="${tn.id === cur}" style="background:${g.colour};filter:${tn.css}" aria-label="${tn.id}"></button>`).join('');
  pop.hidden = false;
  const r = stage.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let x = cx - r.left - pw / 2, y = cy - r.top - ph - 16;
  if (y < 8) y = cy - r.top + 20;
  x = Math.max(8, Math.min(r.width - pw - 8, x));
  y = Math.max(8, Math.min(r.height - ph - 8, y));
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  sfx.tap();
}
function hideTint() { $('#tint-pop').hidden = true; tintKey = null; }
$('#swatches').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tint]');
  if (!b || !tintKey) return;
  P.ctrl.setTint(tintKey, +b.dataset.tint);
  store.save();
  sfx.tint();
  $$('#swatches button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
});

$('#btn-seek').addEventListener('click', () => {
  if (!P) return;
  sfx.tint();
  resetView(true);
  P.ctrl.highlightRemaining();
});
$('#btn-paint-play').addEventListener('click', () => { sfx.tap(); go('topics'); });
$('#btn-paint-back').addEventListener('click', () => { sfx.tap(); go('home'); });
$('#btn-save-img').addEventListener('click', async () => {
  if (!P) return;
  sfx.tap();
  const blob = await P.ctrl.toPNG(2);
  if (!blob) return;
  const file = new File([blob], `kvizit-${P.meta.id}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ files: [file], title: name(P.meta) }); return; } catch { /* fall back */ }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
});

// ------------------------------------------------------------------ gallery
onShow.gallery = async () => {
  const el = $('#gallery');
  el.innerHTML = '';
  for (let i = 0; i < SCENES.length; i++) {
    const meta = SCENES[i];
    const ss = store.sceneState(meta.id);
    const unlocked = store.isUnlocked(meta.id);
    const card = document.createElement(unlocked ? 'button' : 'div');
    card.className = `frame${unlocked ? '' : ' locked'}`;
    const prev = SCENES[i - 1];
    card.innerHTML = `<div class="mat"><div class="pic still"><div class="scene-host"></div>
      ${ss.done ? `<span class="badge">${t('inGallery')}</span>` : ''}
      ${unlocked ? '' : `<div class="lock"><div><svg><use href="#i-lock"/></svg>${t('locked', name(prev))}</div></div>`}
    </div></div><div class="plate">${name(meta)}<small>${ss.done ? `${S.name || ''}` : t('areas', ss.painted.length, '…')}</small></div>`;
    if (unlocked) card.addEventListener('click', () => { sfx.tap(); S.current = meta.id; store.save(); go('paint', { scene: meta.id }); });
    el.append(card);
    mountScene($('.scene-host', card), meta, unlocked ? ss : { painted: [], tints: {} })
      .then((c) => { const sm = $('small', card); if (!ss.done && sm) sm.textContent = t('areas', c.count(), c.total); })
      .catch(() => { $('.scene-host', card).innerHTML = `<p class="muted">${t('soon')}</p>`; });
  }
};

// ------------------------------------------------------------------ dialogs & settings
function confirmDlg(text, yes, no) {
  const d = $('#dlg-confirm');
  $('#confirm-text').textContent = text;
  $('#confirm-yes').textContent = yes;
  $('#confirm-no').textContent = no || '';
  $('#confirm-no').hidden = !no;
  d.showModal();
  return new Promise((res) => d.addEventListener('close', () => res(d.returnValue === 'yes'), { once: true }));
}

function renderLevelEditor() {
  const box = $('#level-editor');
  box.innerHTML = TOPICS.filter((x) => x.id !== 'sekoitus').map((tp) => {
    const st = S.topicStats[tp.id];
    return `<div class="lv-row"><span>${name(tp)}<small>${st ? `${st.ok}/${st.n}` : '–'}</small></span>
      <select data-topic="${tp.id}" aria-label="${name(tp)}">${LEVEL_NAMES[tp.id].map((n, i) => `<option value="${i + 1}" ${S.levels[tp.id] === i + 1 ? 'selected' : ''}>${i + 1}: ${n[S.lang === 'en' ? 1 : 0]}</option>`).join('')}</select></div>`;
  }).join('');
  $('#stats-line').textContent = t('stats', S.rounds, S.totalCorrect, S.totalAnswered);
  const meta = sceneMeta(S.current);
  $('#variant-line').textContent = meta.type === 'vector' ? `${name(meta)}: ${t('variantNow', store.sceneState(meta.id).variant || 0)}` : `${name(meta)}: ${t('regenNo')}`;
  $('#btn-regen').disabled = $('#btn-regen-orig').disabled = meta.type !== 'vector';
}
$('#level-editor').addEventListener('change', (e) => {
  const s = e.target.closest('select');
  if (!s) return;
  S.levels[s.dataset.topic] = +s.value;
  store.save();
});
$('#btn-settings').addEventListener('click', () => {
  sfx.tap();
  $('#set-name').value = S.name;
  $('#set-sound').checked = S.sound;
  renderLevelEditor();
  $('#dlg-settings').showModal();
});
$('#set-name').addEventListener('input', (e) => { S.name = e.target.value.trim().slice(0, 16); store.save(); });
$('#set-sound').addEventListener('change', (e) => { S.sound = e.target.checked; setSound(S.sound); store.save(); if (S.sound) sfx.tap(); });
$('#dlg-settings').addEventListener('close', () => { if (current === 'home') onShow.home(); });
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-lang]');
  if (!b) return;
  S.lang = b.dataset.lang;
  store.save();
  applyStrings();
  renderLevelEditor();
  if (current === 'home') onShow.home();
});
$('#btn-reset-progress').addEventListener('click', async () => {
  $('#dlg-settings').close();
  if (await confirmDlg(t('resetProgressQ'), t('resetProgressYes'), t('no'))) {
    store.resetProgress();
    $('#home-scene').dataset.scene = '';
    updateDrops(true);
    go('home');
  }
});
$('#btn-reset').addEventListener('click', async () => {
  $('#dlg-settings').close();
  if (await confirmDlg(t('resetQ'), t('yes'), t('no'))) {
    const lang = S.lang;
    S = store.reset();
    S.lang = lang;
    store.save();
    $('#home-scene').dataset.scene = '';
    applyStrings();
    go('hello');
  }
});
// test tool: regrow the current picture from a new seed (same areas, so painting progress is kept)
async function setPictureVariant(v) {
  const meta = sceneMeta(S.current);
  if (meta.type !== 'vector') return;
  store.sceneState(meta.id).variant = v;
  store.save();
  renderLevelEditor();
  if (current === 'paint') onShow.paint({ scene: meta.id });
}
$('#btn-regen').addEventListener('click', () => { sfx.tap(); setPictureVariant(1 + Math.floor(Math.random() * 9999)); });
$('#btn-regen-orig').addEventListener('click', () => { sfx.tap(); setPictureVariant(0); });
// close dialogs by tapping the backdrop
$$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

// ------------------------------------------------------------------ boot
// inline the owl so CSS moods/animations can reach its parts (they can't through <use>)
{
  const sym = document.getElementById('owl');
  $$('svg.owl').forEach((o) => { o.innerHTML = sym.innerHTML; });
}
store.touchDay();
setSound(S.sound);
applyStrings();
initHello();
go(S.name || S.rounds ? 'home' : 'hello');
if (S.refunded) {
  confirmDlg(t('refund', S.refunded), t('ok')).then(() => updateDrops(true));
  delete S.refunded;
  store.save();
}
preload(sceneMeta(S.current));
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
// expose for debugging in the console
window.kvizit = { state: () => S, q: () => R?.q, give: (n = 10) => { S.drops += n; store.save(); updateDrops(true); } };
