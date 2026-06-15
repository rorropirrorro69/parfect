/* ============ PARFECT app: estado, router, acciones ============ */

let S = Store.load();
let V = {
  view: S.session ? 'inicio' : 'landing',
  err: null, authVals: null,
  profileOpen: false, wipeArm: false,
  setupHoles: 18, setupCourse: '',
  hole: null, scoreTouched: false, confirmExit: false,
  detail: null, delArm: null,
  trainerTab: 'diag', diag: null, diagBusy: false,
  trackVals: null, trkTab: 'plan', drillLog: null, drillCat: 'fw',
  calY: null, calM: null, calSel: null, calAddType: 'entreno', friendId: null, holeIdx: 0,
  courseId: 'campestre', addFriend: false, teeClubId: null, attack2: false, sim: null,
  partyDraft: null, showMoney: false, partyView: null,
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
  return { par, tee: null, app: null, upDown: null, putts: null, dist: null, score: null };
}

function suggestScore(h) {
  if (h.putts == null || !h.app) return null;
  const penal = h.tee === 'penal' ? 1 : 0;
  if (h.app === 'gir') return Math.max(1, h.par - 2 + h.putts + penal);
  return Math.max(1, h.par - 1 + h.putts + penal); // regulación fallada + chip + putts
}

function loadHole() {
  const a = S.active;
  if (!a || a.idx >= a.holesCount) return;
  const ex = a.holes[a.idx];
  V.hole = ex ? { ...ex } : newHole(Stats.PAR_SEQ[a.idx % 18]);
  V.scoreTouched = !!ex;
  V.confirmExit = false;
}

/* ============ Router ============ */
function App() {
  const u = cur();
  if (!u) {
    if (V.view === 'login' || V.view === 'signup') return vAuth(V.view);
    return vLanding();
  }
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
    strategy: vStrategy,
    trainer: vTrainer,
    social: vSocial,
  }[V.view] || vDashboard;
  return vShell(content());
}

function render() {
  document.getElementById('root').innerHTML = App();
}

/* ============ Acciones ============ */
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
    const u = { id: Store.uid(), name, email, pass: await hashPass(pass), hcp, goal, createdAt: Date.now() };
    S.users.push(u);
    S.session = u.id;
    if (demo) {
      S.rounds.push(...Demo.rounds(u.id));
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
  'profile-open'() { V.profileOpen = true; V.wipeArm = false; render(); },
  'go-trofeos'() { V.profileOpen = false; V.trainerTab = 'logros'; go('trainer'); },
  'profile-close'() { V.profileOpen = false; V.wipeArm = false; render(); },
  'profile-save'() {
    const u = cur();
    u.name = val('p-name') || u.name;
    u.hcp = Math.round(Number(val('p-hcp'))) || 0;
    u.goal = Math.round(Number(val('p-goal'))) || 0;
    V.profileOpen = false; V.diag = null;
    commit();
  },
  'seed-demo'() {
    const u = cur();
    S.rounds.push(...Demo.rounds(u.id));
    S.practices.push(...Demo.practices(u.id));
    V.profileOpen = false; V.diag = null;
    commit();
  },
  'wipe-mine'() {
    if (!V.wipeArm) { V.wipeArm = true; render(); return; }
    S.rounds = S.rounds.filter(r => r.userId !== S.session);
    S.practices = S.practices.filter(p => p.userId !== S.session);
    if (S.active && S.active.userId === S.session) S.active = null;
    V.wipeArm = false; V.profileOpen = false; V.diag = null;
    commit();
  },

  /* ---- rondas ---- */
  'go-setup'() { V.setupCourse = ''; V.setupHoles = 18; go('nueva'); },
  'setup-holes'(d) { V.setupCourse = val('r-course') || V.setupCourse; V.setupHoles = Number(d.n); render(); },
  'setup-course'(d) { V.setupCourse = d.c; render(); },
  'quick-round'() {
    if (S.active && S.active.userId === S.session) { loadHole(); go('play'); }
    else actions['go-setup']();
  },
  'start-round'() {
    const course = val('r-course') || V.setupCourse || 'Mi campo';
    S.active = { userId: S.session, course, holesCount: V.setupHoles || 18, holes: [], idx: 0, startedAt: Date.now() };
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
    if (k === 'par' && v === 3) h.tee = null;
    if (k === 'app' && v === 'gir') h.upDown = null;
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
    const ready = h.app && h.putts != null && (h.par === 3 || h.tee);
    if (!ready) return;
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
    const round = { id: Store.uid(), userId: a.userId, course: a.course, date: today(), holes: a.holes.slice(0, a.holesCount) };
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
  'trainer-tab'(d) { V.trainerTab = d.t; V.err = null; render(); },
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
    V.drillLog = { name: d.name, target: Number(d.target), area: d.area || '', goal: d.goal || '', timer: Number(d.timer) || 20, hits: Number(d.target) };
    render();
  },
  'drill-hit'(d) {
    if (!V.drillLog) return;
    V.drillLog.hits = Math.max(0, Math.min(V.drillLog.target, V.drillLog.hits + Number(d.d)));
    render();
  },
  'drill-close'() { V.drillLog = null; render(); },
  'drill-save'() {
    if (!V.drillLog) return;
    const d = V.drillLog;
    S.practices.push({ id: Store.uid(), userId: S.session, date: today(), area: d.area, drill: d.name, attempts: d.target, hits: d.hits, notes: '' });
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
  'sim-start'() {
    if (!trackerReadiness().ready) { V.trainerTab = 'tracker'; go('trainer'); return; }
    const c = COURSES[V.courseId] || COURSES.campestre;
    V.sim = simNewRound(cur(), c);
    render();
  },
  'sim-shot'() {
    if (!V.sim || V.sim.done) return;
    if (V.sim.lie === 'holed') simFinishHole(V.sim);
    else simStep(V.sim, cur());
    render();
  },
  'sim-reset'() { V.sim = null; render(); },
  'go-estrategia'() { V.trainerTab = 'estrategia'; go('trainer'); },
  'go-stats'() { V.trainerTab = 'stats'; go('trainer'); },
  'go-diag'() { V.trainerTab = 'diag'; go('trainer'); },
  'go-clubs'() { V.profileOpen = false; go('clubs'); },
  'save-clubs'() {
    const u = cur();
    const clubs = {};
    for (const c of CLUBS) {
      const cv = val('club-c-' + c.id);
      if (cv === '' || isNaN(Number(cv))) continue;
      const ev = val('club-e-' + c.id);
      const e = (ev !== '' && !isNaN(Number(ev))) ? Math.max(0, Math.min(100, Math.round(Number(ev)))) : CLUB_EFF_DEFAULT;
      clubs[c.id] = { c: Math.round(Number(cv)), e };
    }
    u.clubs = clubs;
    V.view = 'trainer'; V.trainerTab = 'tracker';
    commit(); window.scrollTo(0, 0);
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
