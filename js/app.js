/* ============ PARFECT app: estado, router, acciones ============ */

let S = Store.load();
S.settings = S.settings || { lang: 'es', theme: 'light' };
let V = {
  view: S.session ? 'inicio' : 'landing',
  err: null, authVals: null,
  profileOpen: false, wipeArm: false,
  setupCourseId: null, setupTee: 'blancas',
  hole: null, scoreTouched: false, confirmExit: false,
  detail: null, delArm: null,
  trainerTab: 'diag', diag: null, diagBusy: false,
  trackVals: null, trkTab: 'plan', drillLog: null, drillCat: 'fw',
  calY: null, calM: null, calSel: null, calAddType: 'entreno', friendId: null, holeIdx: 0,
  courseId: 'campestre', addFriend: false, teeClubId: null, attack2: false, sim: null, shadowHcp: null, camposHcp: null,
  partyDraft: null, showMoney: false, partyView: null, capPid: null,
  stratCid: null, stratIdx: null, stratTeeId: null, stratLie: 'fw', stratMiss: null, histRound: null, histHole: null,
  homeCid: null, homeRid: null, bagEdit: false,
};

const cur = () => S.users.find(u => u.id === S.session) || null;
const myRounds = () => S.rounds.filter(r => r.userId === S.session).sort((a, b) => b.date.localeCompare(a.date));
const myPractices = () => S.practices.filter(p => p.userId === S.session).sort((a, b) => a.date.localeCompare(b.date));
const today = () => new Date().toISOString().slice(0, 10);
const val = id => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');

function commit() { Store.save(S); render(); }
function go(view) { V.view = view; V.err = null; render(); window.scrollTo(0, 0); }

async function hashPass(pass) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('parfect·' + pass));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return btoa(pass); // contexto sin crypto.subtle: comportamiento anterior
  }
}

function newHole(par) {
  return { par, tee: null, teeLie: null, app: null, upDown: null, putts: null, dist: null, score: null };
}

function suggestScore(h) {
  if (h.putts == null) return null;
  const penal = (teeIsPenal(h) || h.pen) ? 1 : 0;
  if (h.app === 'gir') return Math.max(1, h.par - 2 + h.putts + penal);
  return Math.max(1, h.par - 1 + h.putts + penal); // sin GIR = chip/approach + putts
}

function parForActive(a, idx) {
  if (a && a.courseId && typeof COURSES !== 'undefined' && COURSES[a.courseId] && COURSES[a.courseId].holes[idx]) return COURSES[a.courseId].holes[idx].par;
  return Stats.PAR_SEQ[idx % 18];
}
function loadHole() {
  const a = S.active;
  if (!a || a.idx >= a.holesCount) return;
  const ex = a.holes[a.idx];
  V.hole = ex ? { ...ex } : newHole(parForActive(a, a.idx));
  V.scoreTouched = !!ex;
  V.confirmExit = false;
  V.fastStep = null;
}

/* ============ Router ============ */
/* importar copia de respaldo (exportada con export-data) */
function parfectImport(input) {
  const file = input && input.files && input.files[0];
  input.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!d || d.app !== 'parfect' || !d.user || !d.user.id) { alert('Ese archivo no es una copia válida de PARFECT.'); return; }
      const i = S.users.findIndex(x => x.id === d.user.id || (x.email && x.email === d.user.email));
      if (i >= 0) S.users[i] = d.user; else S.users.push(d.user);
      const uid = d.user.id;
      S.rounds = S.rounds.filter(r => r.userId !== uid).concat((d.rounds || []).map(r => ({ ...r, userId: uid })));
      S.practices = S.practices.filter(p => p.userId !== uid).concat((d.practices || []).map(p => ({ ...p, userId: uid })));
      if (d.settings) S.settings = d.settings;
      S.session = uid;
      V.profileOpen = false; V.view = 'inicio';
      commit(); window.scrollTo(0, 0);
      const n = (d.rounds || []).length;
      alert(`¡Listo! Se restauraron tus datos (${n} ronda${n === 1 ? '' : 's'}).`);
    } catch (e) { alert('No se pudo leer la copia: ' + e.message); }
  };
  reader.readAsText(file);
}

function App() {
  const u = cur();
  if (!u) {
    if (V.view === 'login' || V.view === 'signup') return vAuth(V.view);
    return vLanding();
  }
  if (u.onboarded === false) return vOnboard();
  if (V.view === 'play') {
    if (!S.active || S.active.userId !== u.id) { V.view = 'ronda'; }
    else return vPlay();
  }
  if (V.view === 'party-setup') return V.partyDraft ? vPartySetup() : (V.view = 'social', vShell(vSocial()));
  if (V.view === 'party-lobby') return vPartyLobby();
  if (V.view === 'party-live') return vPartyLive();
  if (V.view === 'party-done') return vPartyDone();
  const content = {
    inicio: vDashboard,
    ronda: vRondaTab,
    nueva: vSetup,
    detalle: vRoundDetail,
    stats: vStats,
    trofeos: vTrophies,
    clubs: vClubs,
    friend: vFriend,
    trainer: vTrainer,
    perfil: vPerfil,
  }[V.view] || vDashboard;
  return vShell(content());
}

function render() {
  if (typeof applyTheme === 'function') applyTheme();
  document.getElementById('root').innerHTML = App();
  if (typeof positionOrb === 'function') positionOrb();
  if (typeof afterRender === 'function') afterRender();
}

/* ============ Acciones ============ */
let drillInt = null;
function stopDrillTimer() { if (drillInt) { clearInterval(drillInt); drillInt = null; } }
const actions = {
  noop() {},

  go(d) { go(d.view); },
  nav(d) { V.delArm = null; V.wipeArm = false; V.profileOpen = false; go(d.view); },

  /* ---- auth ---- */
  async login() {
    const email = val('f-email').toLowerCase();
    const pass = document.getElementById('f-pass').value;
    V.authVals = { email };
    const u = S.users.find(x => x.email === email);
    const h = await hashPass(pass);
    let ok = !!u && u.pass === h;
    if (!ok && u) {
      // migración: cuentas creadas antes del hash SHA-256
      let legacy = null;
      try { legacy = btoa(pass); } catch (e) {}
      if (legacy && u.pass === legacy) { u.pass = h; ok = true; }
    }
    if (!ok) { V.err = 'Email o contraseña incorrectos.'; render(); return; }
    S.session = u.id;
    V.authVals = null; V.err = null; V.view = 'inicio'; V.diag = null;
    commit(); window.scrollTo(0, 0);
  },

  async signup() {
    const name = val('f-name');
    const email = val('f-email').toLowerCase();
    const pass = document.getElementById('f-pass').value;
    const hcpRaw = val('f-hcp'), goalRaw = val('f-goal');
    const demo = document.getElementById('f-demo').checked;
    V.authVals = { name, email, hcp: hcpRaw, goal: goalRaw, demo };
    if (!name) { V.err = 'Dinos tu nombre.'; render(); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { V.err = 'Ese email no parece válido.'; render(); return; }
    if (pass.length < 4) { V.err = 'La contraseña necesita al menos 4 caracteres.'; render(); return; }
    if (S.users.some(x => x.email === email)) { V.err = 'Ya existe una cuenta con ese email en este dispositivo.'; render(); return; }
    const hcp = hcpRaw === '' ? 18 : Math.round(Number(hcpRaw));
    const goal = goalRaw === '' ? Math.max(hcp - 5, 0) : Math.round(Number(goalRaw));
    const u = { id: Store.uid(), name, email, pass: await hashPass(pass), hcp, goal, createdAt: Date.now(), onboarded: demo ? true : false };
    S.users.push(u);
    S.session = u.id;
    if (demo) {
      S.rounds.push(...Demo.realRounds(u.id, 8));
      S.practices.push(...Demo.practices(u.id));
    }
    V.authVals = null; V.err = null; V.view = 'inicio'; V.diag = null;
    commit(); window.scrollTo(0, 0);
  },

  logout() {
    S.session = null;
    V.profileOpen = false; V.view = 'landing'; V.diag = null;
    commit(); window.scrollTo(0, 0);
  },

  /* ---- perfil ---- */
  'profile-open'() { V.wipeArm = false; go('perfil'); },
  'profile-edit'() { V.profileOpen = true; render(); },
  'go-trofeos'() { V.profileOpen = false; V.trainerTab = 'logros'; go('trainer'); },
  'profile-close'() { V.profileOpen = false; V.wipeArm = false; render(); },
  'prof-campo'(d) {
    const u = cur();
    const n = val('p-name'); if (n) u.name = n;
    const h = val('p-hcp'); if (h !== '') u.hcp = Math.round(Number(h));
    const g = val('p-goal'); if (g !== '') u.goal = Math.round(Number(g));
    u.homeCourse = d.c;
    commit();
  },
  'export-data'() {
    const u = cur(); if (!u) return;
    const data = { app: 'parfect', v: 1, exportedAt: new Date().toISOString(), user: u, rounds: myRounds(), practices: myPractices(), settings: S.settings };
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `parfect-${(u.name || 'jugador').replace(/\s+/g, '-').toLowerCase()}-${today()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) { alert('No se pudo exportar: ' + e.message); }
  },
  'import-data'() { const el = document.getElementById('import-file'); if (el) el.click(); },
  'finish-onboard'() {
    const u = cur(); if (!u) return;
    const n = val('p-name'); if (n) u.name = n;
    const h = val('p-hcp'); if (h !== '') u.hcp = Math.round(Number(h)) || u.hcp;
    const g = val('p-goal'); if (g !== '') u.goal = Math.round(Number(g));
    u.onboarded = true;
    V.view = 'inicio';
    commit(); window.scrollTo(0, 0);
  },
  'profile-save'() {
    const u = cur();
    u.name = val('p-name') || u.name;
    u.hcp = Math.round(Number(val('p-hcp'))) || 0;
    u.goal = Math.round(Number(val('p-goal'))) || 0;
    V.diag = null;
    commit();
  },
  'seed-demo'() {
    const u = cur();
    S.rounds.push(...Demo.realRounds(u.id, 8));
    S.practices.push(...Demo.practices(u.id));
    V.profileOpen = false; V.diag = null;
    commit();
  },
  'demo-account'() { seedDemoAccount(); },
  'wipe-mine'() {
    if (!V.wipeArm) { V.wipeArm = true; render(); return; }
    S.rounds = S.rounds.filter(r => r.userId !== S.session);
    S.practices = S.practices.filter(p => p.userId !== S.session);
    if (S.active && S.active.userId === S.session) S.active = null;
    V.wipeArm = false; V.profileOpen = false; V.diag = null;
    commit();
  },

  /* ---- rondas ---- */
  'go-setup'() { V.setupCourseId = (V.setupCourseId && COURSES[V.setupCourseId]) ? V.setupCourseId : 'campestre'; go('nueva'); },
  'setup-pick-course'(d) { if (COURSES[d.c]) V.setupCourseId = d.c; render(); },
  'setup-pick-tee'(d) { if (TEES.some(t => t.id === d.t)) V.setupTee = d.t; render(); },
  'strat-course'(d) { if (COURSES[d.c]) { V.stratCid = d.c; V.stratIdx = 0; V.stratTeeId = null; } render(); },
  'strat-hole'(d) { V.stratIdx = Number(d.i); V.stratTeeId = null; render(); },
  'strat-random'() { const c = COURSE_ORDER[Math.floor(Math.random() * COURSE_ORDER.length)]; V.stratCid = c; V.stratIdx = Math.floor(Math.random() * COURSES[c].holes.length); V.stratTeeId = null; render(); },
  'strat-tee'(d) { V.stratTeeId = d.c; render(); },
  'strat-lie'(d) { V.stratLie = d.v; render(); },
  'strat-miss'(d) { V.stratMiss = d.v; render(); },
  'hist-round'(d) { V.histRound = d.id; V.histHole = 0; render(); },
  'hist-hole'(d) { V.histHole = Number(d.i); render(); },
  'home-course'(d) { if (COURSES[d.c]) { V.homeCid = d.c; V.homeRid = null; } render(); },
  'home-round'(d) { V.homeRid = d.id; render(); },
  'set-lang'(d) { S.settings = S.settings || {}; S.settings.lang = d.v === 'en' ? 'en' : 'es'; commit(); },
  'set-theme'(d) { S.settings = S.settings || {}; S.settings.theme = d.v === 'light' ? 'light' : 'dark'; commit(); },
  'bag-edit'() { V.bagEdit = true; render(); },
  'bag-close'() { V.bagEdit = false; render(); },
  'set-avatar'(d) { const u = cur(); if (u) { u.avatar = Number(d.i) || 0; commit(); } },
  'set-outfit'(d) { const u = cur(); if (u) { u.outfit = d.k || 'rank'; commit(); } },
  'set-pbg'(d) { const u = cur(); if (u && PROFILE_BGS.some(b => b.k === d.k && rankIdx(u.hcp) >= b.min)) { u.bg = d.k; commit(); } },
  'stat-pop'(d, el) {
    if (!el) return;
    el.classList.remove('tapped'); void el.offsetWidth; el.classList.add('tapped');
    el.querySelectorAll('.pip.on').forEach(p => { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; });
  },
  'quick-round'() {
    if (S.active && S.active.userId === S.session) { loadHole(); go('play'); }
    else actions['go-setup']();
  },
  'start-round'() {
    const cid = (V.setupCourseId && COURSES[V.setupCourseId]) ? V.setupCourseId : 'campestre';
    const course = COURSES[cid].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
    const holesCount = COURSES[cid].holes.length;
    const tee = teeById(V.setupTee);
    S.active = { userId: S.session, course, courseId: cid, holesCount, holes: [], idx: 0, startedAt: Date.now(), teeId: tee.id, teeName: tee.name, teeF: tee.f };
    loadHole();
    V.view = 'play';
    commit(); window.scrollTo(0, 0);
  },
  'resume-round'() { loadHole(); go('play'); },

  'h-set'(d) {
    const h = V.hole;
    const k = d.k;
    let v = d.v;
    if (k === 'par' || k === 'putts') v = Number(v);
    if (k === 'upDown') v = v === 'si';
    // toggle off para campos opcionales
    if ((k === 'dist' && h.dist === v) || (k === 'upDown' && h.upDown === v)) v = null;
    h[k] = v;
    if (k === 'par' && v === 3) { h.tee = null; h.teeLie = null; }
    if (k === 'app' && v === 'gir') h.upDown = null;
    // si eliges el resultado de la salida sin dirección, asume centro
    if (k === 'teeLie' && v && !h.tee) h.tee = 'c';
    // up & down salvado = chip + 1 putt → llena los putts en automático
    if (k === 'upDown' && v === true) h.putts = 1;
    render();
  },
  'h-toggle'(d) {
    const h = V.hole; if (!h) return;
    if (d.k === 'fw') { h.tee = 'c'; h.teeLie = h.teeLie === 'calle' ? 'rough' : 'calle'; }
    else if (d.k === 'gir') { h.app = h.app === 'gir' ? 'corto' : 'gir'; if (h.app === 'gir') h.upDown = null; }
    else if (d.k === 'ud') { h.upDown = !(h.upDown === true); }
    else if (d.k === 'pen') { h.pen = !h.pen; }
    render();
  },
  'fast'(d) {
    const h = V.hole; if (!h) return;
    const k = d.k;
    if (k === 'tee') { h.teeLie = d.lie; h.tee = d.dir || 'c'; }
    else if (k === 'app') { h.app = d.v; if (d.v === 'gir') h.upDown = null; }
    else if (k === 'ud') { h.upDown = (d.v === 'si'); if (h.upDown) h.putts = 1; }
    else if (k === 'putts') { h.putts = Number(d.v); }
    V.fastStep = null; // re-deriva el paso → auto-avanza al siguiente
    render();
  },
  'fast-back'() {
    const h = V.hole; if (!h) return;
    const steps = playSteps(h);
    const ci = (V.fastStep != null) ? V.fastStep : fastDerivedIndex(h, steps);
    V.fastStep = Math.max(0, ci - 1);
    render();
  },
  'h-score'(d) {
    const h = V.hole;
    const eff = V.scoreTouched ? h.score : suggestScore(h);
    if (eff == null) return;
    h.score = Math.max(1, eff + Number(d.d));
    V.scoreTouched = true;
    render();
  },
  'h-next'() {
    const a = S.active, h = V.hole;
    if (h.putts == null) return;
    // casillas sin marcar = no logrado (finaliza el registro de la tarjeta)
    if (h.app == null) h.app = 'corto';
    if (h.par >= 4 && h.teeLie == null) h.teeLie = 'rough';
    const score = V.scoreTouched && h.score != null ? h.score : suggestScore(h);
    const done = { ...h, score };
    done.upDown = done.app !== 'gir' ? (done.upDown != null ? done.upDown : score <= done.par) : null;
    a.holes[a.idx] = done;
    a.idx++;
    if (a.idx < a.holesCount) loadHole();
    V.diag = null;
    commit(); window.scrollTo(0, 0);
  },
  'h-prev'() {
    const a = S.active;
    if (a.idx === 0) return;
    a.idx--;
    loadHole();
    commit(); window.scrollTo(0, 0);
  },
  'play-exit'() { V.confirmExit = true; render(); },
  'exit-cancel'() { V.confirmExit = false; render(); },
  'play-save-exit'() { V.confirmExit = false; go('inicio'); },
  'play-discard'() {
    S.active = null;
    V.confirmExit = false; V.view = 'ronda';
    commit(); window.scrollTo(0, 0);
  },
  'finish-round'() {
    const a = S.active;
    const round = { id: Store.uid(), userId: a.userId, course: a.course, courseId: a.courseId, date: today(), holes: a.holes.slice(0, a.holesCount) };
    S.rounds.push(round);
    S.active = null;
    V.diag = null; V.detail = round.id; V.view = 'detalle';
    commit(); window.scrollTo(0, 0);
  },
  'round-detail'(d) { V.detail = d.id; V.delArm = null; go('detalle'); },
  'round-delete'(d) {
    if (V.delArm !== d.id) { V.delArm = d.id; render(); return; }
    S.rounds = S.rounds.filter(r => r.id !== d.id);
    V.delArm = null; V.diag = null; V.view = 'ronda';
    commit();
  },

  /* ---- trainer / tracker ---- */
  'trainer-tab'(d) { V.trainerTab = d.t; V.err = null; if (d.t === 'cal') ensureWeekPlan(cur()); render(); },
  diagnose() {
    V.diagBusy = true; V.diag = null;
    render();
    setTimeout(() => {
      V.diagBusy = false;
      V.diag = Trainer.analyze(Stats.aggregate(myRounds()), cur());
      render();
      window.scrollTo(0, 0);
    }, 700);
  },
  'trk-tab'(d) { V.trkTab = d.t; V.err = null; render(); },
  'drill-cat'(d) { V.drillCat = d.c; render(); },
  'drill-open'(d) {
    const drill = (typeof DRILL_LIBRARY !== 'undefined') ? DRILL_LIBRARY.find(x => x.name === d.name) : null;
    if (drill) { V.drillDetail = drill; render(); return; }
    // fallback (datos sueltos)
    const timer = Number(d.timer) || 20;
    V.drillLog = { name: d.name, target: Number(d.target) || 7, area: d.area || '', goal: d.goal || '', desc: d.desc || '', timer, streak: 0, best: 0, secs: timer * 60, running: false };
    render();
  },
  'drill-start'() {
    const drill = V.drillDetail; if (!drill) return;
    const timer = 20, target = drill.cat === 'putt' ? 10 : 7;
    const area = (typeof DRILL_CATS !== 'undefined' && (DRILL_CATS.find(c => c.id === drill.cat) || {}).label) || '';
    V.drillLog = { name: drill.name, target, area, goal: drill.metric || '', desc: drill.desc || '', timer, streak: 0, best: 0, secs: timer * 60, running: false };
    V.drillDetail = null;
    render();
  },
  'drill-close-detail'() { V.drillDetail = null; render(); },
  'drill-hit'() {
    if (!V.drillLog) return;
    const d = V.drillLog;
    d.streak = Math.min(d.target, d.streak + 1);
    if (d.streak > d.best) d.best = d.streak;
    render();
  },
  'drill-miss'() { if (!V.drillLog) return; V.drillLog.streak = 0; render(); },
  'drill-timer-toggle'() {
    if (!V.drillLog) return;
    stopDrillTimer();
    if (V.drillLog.running) { V.drillLog.running = false; render(); return; }
    if (V.drillLog.secs <= 0) V.drillLog.secs = V.drillLog.timer * 60;
    V.drillLog.running = true; render();
    drillInt = setInterval(() => {
      if (!V.drillLog || !V.drillLog.running) { stopDrillTimer(); return; }
      V.drillLog.secs--;
      if (V.drillLog.secs <= 0) { V.drillLog.secs = 0; V.drillLog.running = false; stopDrillTimer(); render(); return; }
      const el = document.getElementById('drill-time');
      if (el) el.textContent = String(Math.floor(V.drillLog.secs / 60)).padStart(2, '0') + ':' + String(V.drillLog.secs % 60).padStart(2, '0');
    }, 1000);
  },
  'drill-timer-reset'() { if (!V.drillLog) return; stopDrillTimer(); V.drillLog.secs = V.drillLog.timer * 60; V.drillLog.running = false; render(); },
  'drill-close'() { stopDrillTimer(); V.drillLog = null; render(); },
  'drill-save'() {
    if (!V.drillLog) return;
    stopDrillTimer();
    const d = V.drillLog;
    S.practices.push({ id: Store.uid(), userId: S.session, date: today(), area: d.area, drill: d.name, attempts: d.target, hits: d.best, notes: '' });
    V.drillLog = null;
    commit();
  },
  friend(d) { V.friendId = d.id; go('friend'); },
  'friend-soon'() { alert('Agregar amigos de otros dispositivos llegará con las cuentas en la nube (backend). Por ahora puedes invitarlos a una Party con el código.'); },
  'cal-train'(d) { const u = cur(); u.trainPerWeek = Stats.clamp((u.trainPerWeek != null ? u.trainPerWeek : 3) + Number(d.d), 0, 14); commit(); },
  'cal-rounds'(d) { const u = cur(); u.roundsPerWeek = Stats.clamp((u.roundsPerWeek != null ? u.roundsPerWeek : 1) + Number(d.d), 0, 7); commit(); },
  'cal-prev'() { if (--V.calM < 0) { V.calM = 11; V.calY--; } render(); },
  'cal-next'() { if (++V.calM > 11) { V.calM = 0; V.calY++; } render(); },
  'cal-day-sel'(d) { V.calSel = d.date; render(); window.scrollTo(0, document.querySelector('.cal-grid') ? 0 : 0); },
  'cal-goto'(d) { V.calSel = d.date; const dd = new Date(d.date + 'T12:00:00'); V.calY = dd.getFullYear(); V.calM = dd.getMonth(); go('social'); },
  'cal-addtype'(d) { V.calAddType = d.t; render(); },
  'cal-closed'(d) { const u = cur(); u.closedDay = Number(d.d); commit(); },
  'cal-add'() {
    const u = cur();
    const type = V.calAddType || 'entreno';
    const title = val('cal-title');
    u.events = u.events || [];
    u.events.push({ id: Store.uid(), date: V.calSel, type, title: title || EV_LABEL[type], ai: false });
    commit();
  },
  'cal-ai'() {
    const u = cur();
    const tl = todayLocal();
    u.events = (u.events || []).filter(e => !(e.ai && e.date >= tl));
    u.events.push(...generateAIPlan(u));
    commit();
  },
  'cal-del'(d) {
    const u = cur();
    u.events = (u.events || []).filter(e => e.id !== d.id);
    commit();
  },
  'sel-hole'(d) { V.holeIdx = Number(d.i); V.teeClubId = null; V.attack2 = false; render(); window.scrollTo(0, 0); },
  'sel-course'(d) { V.courseId = d.c; V.holeIdx = 0; V.teeClubId = null; V.attack2 = false; V.sim = null; render(); window.scrollTo(0, 0); },
  'sel-tee'(d) { V.teeClubId = d.id; render(); },
  'toggle-attack'() { V.attack2 = !V.attack2; render(); },
  'go-sim'() { V.profileOpen = false; V.trainerTab = 'simulador'; go('trainer'); },
  'sim-shadow'(d) { V.shadowHcp = Number(d.h); render(); },
  'campos-hcp'(d) { V.camposHcp = Number(d.h); render(); },
  'go-campos'() { V.profileOpen = false; V.trainerTab = 'campos'; go('trainer'); },
  'sim-start'() {
    const c = COURSES[V.courseId] || COURSES.campestre;
    V.sim = simNewRound(cur(), c, V.shadowHcp);
    V.trainerTab = 'simulador'; V.view = 'trainer';
    render();
  },
  'sim-hole'(d) { if (V.sim) { V.sim.viewHole = Number(d.i); render(); window.scrollTo(0, 0); } },
  'sim-reset'() { V.sim = null; render(); },
  'go-estrategia'() { V.trainerTab = 'estrategia'; go('trainer'); },
  'go-stats'() { V.trainerTab = 'diag'; go('trainer'); },
  'go-diag'() { V.trainerTab = 'diag'; go('trainer'); },
  'go-entreno'() { V.trainerTab = 'entreno'; go('trainer'); },
  'go-clubs'() { V.profileOpen = false; go('clubs'); },
  'save-clubs'() {
    const u = cur();
    const clubs = {};
    for (const c of CLUBS) {
      const cv = val('club-c-' + c.id);
      if (cv === '' || isNaN(Number(cv))) continue;
      const evEl = document.getElementById('club-e-' + c.id);
      let e;
      if (evEl) { const ev = evEl.value.trim(); e = (ev !== '' && !isNaN(Number(ev))) ? Math.max(0, Math.min(100, Math.round(Number(ev)))) : CLUB_EFF_DEFAULT; }
      else { const prev = clubE(u.clubs, c.id); e = prev != null ? prev : CLUB_EFF_DEFAULT; }
      clubs[c.id] = { c: Math.round(Number(cv)), e };
    }
    u.clubs = clubs;
    V.bagEdit = false;
    if (V.view === 'clubs') V.view = 'perfil';
    commit();
  },
  'practice-add'() {
    const area = val('t-area'), drill = val('t-drill');
    const att = Number(val('t-att')), hits = Number(val('t-hits'));
    V.trackVals = { area, drill, att: val('t-att'), hits: val('t-hits') };
    if (!att || att < 1) { V.err = 'Indica cuántos intentos hiciste.'; render(); return; }
    if (isNaN(hits) || hits < 0 || hits > att) { V.err = 'Los aciertos deben estar entre 0 y los intentos.'; render(); return; }
    S.practices.push({ id: Store.uid(), userId: S.session, date: today(), area, drill, attempts: att, hits, notes: '' });
    V.trackVals = null; V.err = null;
    commit();
  },
};

Object.assign(actions, partyActions);

/* ============ Delegación de eventos ============ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = actions[el.dataset.act];
  if (fn) fn(el.dataset, el);
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || cur()) return;
  if (V.view === 'login') { e.preventDefault(); actions.login(); }
  else if (V.view === 'signup' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); actions.signup(); }
});

render();

/* ---- arranque: sync de party activa + service worker (solo producción) ---- */
(() => {
  const p = S.parties.find(x => x.id === S.activeParty);
  if (p && p.status !== 'done' && p.status !== 'cancelled') Sync.watch(p.code);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
