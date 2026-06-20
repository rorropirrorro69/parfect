/* ============ PARFECT app: estado, router, acciones ============ */

/* Compartir confiable: hoja nativa (iOS/Android) y, si no, WhatsApp.
   window.open('_blank') se bloquea como popup en PWA/iOS standalone, por eso
   navegamos la pestaña actual como respaldo (abre la app de WhatsApp igual). */
function shareWA(text, url) {
  const full = url ? (text + ' ' + url) : text;
  if (navigator.share) {
    navigator.share(url ? { text, url } : { text }).catch(() => {});
    return;
  }
  const wa = 'https://wa.me/?text=' + encodeURIComponent(full);
  let w = null;
  try { w = window.open(wa, '_blank'); } catch (e) {}
  if (!w) location.href = wa;   // respaldo: navega (no se bloquea)
}

let S = Store.load();
S.settings = S.settings || { lang: 'es', theme: 'light' };
let V = {
  view: S.session ? 'inicio' : 'landing',
  err: null, authVals: null,
  profileOpen: false, wipeArm: false,
  setupCourseId: null, setupTee: 'blancas', setupHoles: 18, setupStart: 0, setupWhen: 'ahora',
  hole: null, scoreTouched: false, confirmExit: false,
  detail: null, delArm: null,
  trainerTab: 'diag', diag: null, diagBusy: false, sessionMin: 60, planStep: 'time', planMode: 'ai', planAreas: ['driving', 'approach', 'short', 'putting'],
  trackVals: null, trkTab: 'plan', drillLog: null, drillCat: 'fw',
  calY: null, calM: null, calSel: null, calAddType: 'entreno', friendId: null, holeIdx: 0,
  courseId: 'campestre', addFriend: false, teeClubId: null, attack2: false, sim: null, shadowHcp: null, camposHcp: null,
  partyDraft: null, showMoney: false, partyView: null, capPid: null, onbStep: 0,
  stratCid: null, stratIdx: null, stratTeeId: null, stratLie: 'fw', stratMiss: null, histRound: null, histHole: null,
  homeCid: null, homeRid: null, bagEdit: false,
};

const cur = () => S.users.find(u => u.id === S.session) || null;
const isDemoUser = (u) => !!(u && /@parfect\.golf$/.test(u.email || ''));   // amigos demo solo para la cuenta demo
const myRounds = () => S.rounds.filter(r => r.userId === S.session).sort((a, b) => b.date.localeCompare(a.date));
const myPractices = () => S.practices.filter(p => p.userId === S.session).sort((a, b) => a.date.localeCompare(b.date));
const today = () => new Date().toISOString().slice(0, 10);
const val = id => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');

function commit() { Store.save(S); render(); if (typeof Cloud !== 'undefined' && Cloud.enabled()) Cloud.pushSoon(); if (typeof Clubs !== 'undefined' && Clubs.on() && typeof myClub === 'function') { const _c = myClub(); if (_c) Clubs.pushSoon(_c); } }
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

/* hoyo de origen en el campo para el índice de juego (respeta la vuelta; da la vuelta si el campo es de 9) */
function srcHole(a, idx) {
  if (!a || !a.courseId || typeof COURSES === 'undefined' || !COURSES[a.courseId]) return null;
  const hs = COURSES[a.courseId].holes; const n = hs.length;
  return hs[((a.holeOffset || 0) + idx) % n] || null;
}
function parForActive(a, idx) {
  const h = srcHole(a, idx);
  if (h) return h.par;
  return Stats.PAR_SEQ[((a && a.holeOffset || 0) + idx) % 18];
}
function loadHole() {
  const a = S.active;
  if (!a || a.idx >= a.holesCount) return;
  const ex = a.holes[a.idx];
  V.hole = ex ? { ...ex } : newHole(parForActive(a, a.idx));
  V.scoreTouched = !!ex;
  V.confirmExit = false;
  V.fastStep = null;
  V.wizStep = null;
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

/* sube foto/video para compartir una ronda (comprime imágenes, limita video).
   Con nube activa guarda además el blob a subir a Storage en V.shareDraft.upload. */
function parfectShareMedia(input) {
  const file = input && input.files && input.files[0];
  input.value = '';
  if (!file || !V.shareDraft) return;
  V.shareDraft.caption = (document.getElementById('share-cap') || {}).value || V.shareDraft.caption;
  V.shareErr = null;
  V.shareDraft.upload = null;
  const cloud = (typeof Cloud !== 'undefined' && Cloud.enabled());
  if (/^video\//.test(file.type)) {
    const maxV = cloud ? 50 * 1024 * 1024 : 2.6 * 1024 * 1024;
    if (file.size > maxV) { V.shareErr = cloud ? 'El video pesa demasiado (máx 50 MB). Sube un clip más corto.' : 'El video pesa mucho para guardarlo aquí (máx ~2.5 MB). Sube un clip más corto o una foto.'; render(); return; }
    if (cloud) {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      V.shareDraft.upload = { blob: file, type: 'video', ext: /^(mp4|mov|m4v|webm)$/.test(ext) ? ext : 'mp4', mime: file.type || 'video/mp4' };
    }
    const fr = new FileReader();
    fr.onload = () => { V.shareDraft.media = { type: 'video', src: fr.result }; render(); };
    fr.readAsDataURL(file);
    return;
  }
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 1000; let w = img.width, h = img.height;
      if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
      else if (h >= w && h > max) { w = Math.round(w * max / h); h = max; }
      try {
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
        V.shareDraft.media = { type: 'image', src: cv.toDataURL('image/jpeg', 0.72) };
        if (cloud && cv.toBlob) cv.toBlob(b => { if (b) V.shareDraft.upload = { blob: b, type: 'image', ext: 'jpg', mime: 'image/jpeg' }; }, 'image/jpeg', 0.72);
        render();
      } catch (e) {
        V.shareDraft.media = { type: 'image', src: fr.result };
        if (cloud) V.shareDraft.upload = { blob: file, type: 'image', ext: 'jpg', mime: file.type || 'image/jpeg' };
        render();
      }
    };
    img.onerror = () => {
      V.shareDraft.media = { type: 'image', src: fr.result };
      if (cloud) V.shareDraft.upload = { blob: file, type: 'image', ext: 'jpg', mime: file.type || 'image/jpeg' };
      render();
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
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
  if (V.view === 'academia') return vAcademy();
  const content = {
    inicio: vDashboard,
    ronda: vRondaTab,
    nueva: vSetup,
    detalle: vRoundDetail,
    stats: vStats,
    trofeos: vTrophies,
    clubs: vClubs,
    friend: vFriend,
    feedcard: vFeedCard,
    trainer: vTrainer,
    perfil: vPerfil,
    social: vSocial,
    club: vClub,
    'club-tourn': vClubTourn,
    'club-academy': vClubAcademy,
    'club-plans': vClubPlans,
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
function stopDrillTimer() { if (drillInt) { clearInterval(drillInt); drillInt = null; } if (V._tid) { clearInterval(V._tid); V._tid = null; } }
function fmtClock(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
/* pitido(s) para la sesión guiada (Web Audio, sin assets) */
function srBeep(n) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ac = window.__ac || (window.__ac = new AC()); if (ac.state === 'suspended') ac.resume();
    for (let i = 0; i < (n || 1); i++) {
      const o = ac.createOscillator(), g = ac.createGain(); o.connect(g); g.connect(ac.destination);
      o.type = 'sine'; o.frequency.value = 880; const t = ac.currentTime + i * 0.28;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.start(t); o.stop(t + 0.22);
    }
  } catch (e) {}
}
/* corre la sesión guiada: cuenta regresiva por bloque, pita y avanza al cambiar */
function srStartInterval() {
  clearInterval(V._srtid);
  V._srtid = setInterval(() => {
    const r = V.sessionRun; if (!r || !r.running) { clearInterval(V._srtid); return; }
    r.left--;
    if (r.left <= 0) {
      srBeep(1); r.idx++;
      if (r.idx >= r.blocks.length) { srFinish(true); return; }
      r.left = r.blocks[r.idx].min * 60; render(); return;
    }
    const el = document.getElementById('sr-clock'); if (!el) { clearInterval(V._srtid); return; }
    el.textContent = fmtClock(r.left);
    const bar = document.getElementById('sr-bar'); if (bar) { const tot = r.blocks[r.idx].min * 60; bar.style.width = (100 * (1 - r.left / tot)).toFixed(1) + '%'; }
  }, 1000);
}
/* termina la sesión guiada: guarda, marca drills, muestra resumen */
function srFinish(completed) {
  const r = V.sessionRun; if (!r) return;
  clearInterval(V._srtid);
  let mins = 0;
  if (completed) mins = r.blocks.reduce((a, b) => a + b.min, 0);
  else { for (let i = 0; i < r.idx && i < r.blocks.length; i++) mins += r.blocks[i].min; if (r.idx < r.blocks.length) mins += Math.max(0, Math.round((r.blocks[r.idx].min * 60 - r.left) / 60)); }
  mins = Math.max(1, mins);
  const u = cur();
  const areas = [...new Set(r.blocks.filter(b => !b.warm).map(b => b.label))];
  S.practices = S.practices || [];
  S.practices.push({ id: Store.uid(), userId: S.session, date: today(), drill: 'Sesión guiada · ' + (areas.join(', ') || 'entrenamiento'), area: areas[0] || 'Sesión', minutes: mins, notes: 'sesion' });
  if (u) { u.drillsDone = u.drillsDone || {}; r.blocks.forEach((b, i) => { if (b.drill && (completed || i < r.idx)) u.drillsDone[b.drill] = today(); }); }
  V.sessionSummary = { mins, areas, count: areas.length, completed };
  V.sessionRun = null;
  try { srBeep(2); } catch (e) {}
  if (typeof celebrate === 'function') celebrate(completed, completed ? '¡Sesión completa!' : 'Sesión guardada ✓');
  commit(); window.scrollTo(0, 0);
}
const actions = {
  noop() {},

  go(d) { go(d.view); },
  nav(d) { V.delArm = null; V.wipeArm = false; V.profileOpen = false; V.sessionSummary = null; if (typeof Clubs !== 'undefined' && /^club/.test(d.view || '')) Clubs.pull(); go(d.view); },

  /* ---- Birdie chatbot ---- */
  'chat-open'() { V.chat = V.chat || { open: false, msgs: [] }; V.chat.open = true; if (!V.chat.msgs.length) V.chat.msgs.push({ from: 'bot', text: BOT_HELLO }); render(); setTimeout(() => { const i = document.getElementById('chat-text'); if (i) i.focus(); chatScrollBottom(); }, 40); },
  'chat-close'() { if (V.chat) V.chat.open = false; render(); },
  'chat-send'() { const el = document.getElementById('chat-text'); sendChat(el ? el.value.trim() : ''); },
  'chat-quick'(d) { sendChat(d.q || ''); },

  /* ---- Club (B2B) ---- */
  'club-create-open'() { V.clubCreating = true; V.clubErr = null; render(); window.scrollTo(0, 0); },
  'club-create-cancel'() { V.clubCreating = false; V.clubErr = null; render(); },
  'club-create'() {
    const u = cur(); if (!u) return;
    const name = (document.getElementById('club-name') || {}).value;
    const nm = (name || '').trim();
    if (!nm) { V.clubErr = 'Ponle nombre a tu club.'; render(); return; }
    S.clubs = S.clubs || [];
    let code; do { code = Math.random().toString(36).slice(2, 7).toUpperCase(); } while (S.clubs.some(c => c.code === code));
    const seed = [
      { userId: 'seed-coach', name: 'Coach Hugo', role: 'coach', hcp: 3 },
      { userId: 'seed-j1', name: 'Mateo Ríos', role: 'junior', hcp: 18, category: 'Sub-14' },
      { userId: 'seed-j2', name: 'Renata Gil', role: 'junior', hcp: 22, category: 'Sub-12' },
      { userId: 'seed-m1', name: 'Andrés Soto', role: 'member', hcp: 9 },
    ];
    S.clubs.push({ id: Store.uid(), name: nm, code, ownerId: u.id, createdAt: Date.now(), members: [{ userId: u.id, name: u.name, role: 'admin', hcp: u.hcp }, ...seed] });
    V.clubCreating = false; V.clubErr = null; V.clubDraftName = ''; commit();
  },
  'club-join'() {
    const u = cur(); if (!u) return;
    const code = ((document.getElementById('club-code') || {}).value || '').trim().toUpperCase();
    if (!code) { V.clubErr = 'Escribe el código del club.'; render(); return; }
    const c = (S.clubs || []).find(x => x.code === code);
    if (!c) { V.clubErr = 'No encontramos ese código en este dispositivo. Con la nube se conecta a cualquier club.'; render(); return; }
    if (!c.members.some(m => m.userId === u.id)) c.members.push({ userId: u.id, name: u.name, role: 'member', hcp: u.hcp });
    V.clubErr = null; commit();
  },
  'club-leave'() {
    const u = cur(); const c = myClub();
    if (c) { c.members = (c.members || []).filter(m => m.userId !== u.id); if (!c.members.length) S.clubs = (S.clubs || []).filter(x => x.id !== c.id); }
    commit();
  },
  'club-plans'() { V.view = 'club-plans'; render(); window.scrollTo(0, 0); },
  'club-plan-pick'(d) { if (typeof celebrate === 'function') celebrate(true, 'Plan ' + (d.n || '') + ' · te contactamos para activarlo'); },
  /* ---- gestión de roster ---- */
  'member-new'() { V.memberEdit = { isNew: true, name: '', role: 'member', hcp: null, category: '', parentOf: null }; V.memberErr = null; render(); },
  'member-edit'(d) { const c = myClub(); const m = c && (c.members || []).find(x => x.userId === d.id); if (!m) return; V.memberEdit = { userId: m.userId, name: m.name, role: m.role, hcp: m.hcp, category: m.category || '', parentOf: m.parentOf || null }; V.memberErr = null; render(); },
  'member-close'() { V.memberEdit = null; V.memberErr = null; render(); },
  'member-role'(d) { const e = V.memberEdit; if (!e) return; const nm = document.getElementById('mem-name'); if (nm) e.name = nm.value; const hc = document.getElementById('mem-hcp'); if (hc && hc.value !== '') e.hcp = Number(hc.value); const ca = document.getElementById('mem-cat'); if (ca) e.category = ca.value; e.role = d.r; render(); },
  'member-parent'(d) { const e = V.memberEdit; if (!e) return; const nm = document.getElementById('mem-name'); if (nm) e.name = nm.value; e.parentOf = (e.parentOf === d.id) ? null : d.id; render(); },
  'member-save'() {
    const c = myClub(); const d = V.memberEdit; if (!c || !d) return;
    const name = ((document.getElementById('mem-name') || {}).value || '').trim();
    if (!name) { V.memberErr = 'Escribe el nombre.'; render(); return; }
    const catEl = document.getElementById('mem-cat'); const hcpEl = document.getElementById('mem-hcp');
    const category = d.role === 'junior' ? ((catEl && catEl.value || '').trim() || null) : null;
    const hcp = d.role !== 'junior' && hcpEl && hcpEl.value !== '' ? Number(hcpEl.value) : (d.role === 'junior' ? (d.hcp != null ? d.hcp : 20) : d.hcp);
    const parentOf = d.role === 'parent' ? (d.parentOf || null) : null;
    c.members = c.members || [];
    if (d.isNew || !d.userId) {
      c.members.push({ userId: Store.uid(), name, role: d.role, hcp: hcp != null ? hcp : null, category, parentOf });
    } else {
      const m = c.members.find(x => x.userId === d.userId);
      if (m) { m.name = name; m.role = d.role; m.hcp = hcp != null ? hcp : m.hcp; m.category = category; m.parentOf = parentOf; }
    }
    V.memberEdit = null; V.memberErr = null; commit();
  },
  'member-remove'() {
    const c = myClub(); const d = V.memberEdit; if (!c || !d || !d.userId) return;
    c.members = (c.members || []).filter(m => m.userId !== d.userId);
    V.memberEdit = null; commit();
  },
  'club-invite'() { V.inviteOpen = true; render(); },
  'club-invite-close'() { V.inviteOpen = false; render(); },
  'club-invite-share'() {
    const c = myClub(); if (!c) return;
    const url = location.origin + location.pathname + '?club=' + c.code;
    const txt = `Únete a ${c.name} en PARFECT con el código ${c.code}\n${url}`;
    try {
      if (navigator.share) navigator.share({ title: 'Únete a ' + c.name, text: txt, url }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => { if (typeof celebrate === 'function') celebrate(false, 'Invitación copiada ✓'); });
      else if (typeof celebrate === 'function') celebrate(false, 'Código: ' + c.code);
    } catch (e) { if (typeof celebrate === 'function') celebrate(false, 'Código: ' + c.code); }
  },
  'club-back'() { V.view = 'club'; V.tournId = null; V.tournCreating = false; V.tournCapture = false; render(); window.scrollTo(0, 0); },

  /* ---- Torneos del club ---- */
  'club-tourns-open'() { V.tournId = null; V.tournCreating = false; V.tournCapture = false; V.view = 'club-tourn'; render(); window.scrollTo(0, 0); },
  'tourn-new'() { V.tournCreating = true; V.tournDraft = { holes: 18 }; V.tournErr = null; render(); window.scrollTo(0, 0); },
  'tourn-create-cancel'() { V.tournCreating = false; V.tournErr = null; render(); },
  'tourn-holes'(d) { V.tournDraft = V.tournDraft || {}; V.tournDraft.holes = Number(d.h) || 18; render(); },
  'tourn-create'() {
    const c = myClub(); if (!c) return;
    const name = ((document.getElementById('trn-name') || {}).value || '').trim();
    const date = (document.getElementById('trn-date') || {}).value || '';
    const holes = (V.tournDraft && V.tournDraft.holes) || 18;
    if (!name) { V.tournErr = 'Ponle nombre al torneo.'; render(); return; }
    const par = holes === 9 ? 36 : 72;
    const sponsors = ((document.getElementById('trn-sponsors') || {}).value || '').split(',').map(s => s.trim()).filter(Boolean);
    const players = (c.members || []).map(m => {
      const ph = Math.round((m.hcp != null ? m.hcp : 12) * holes / 18);
      const gross = par + ph + Math.round(Math.random() * 6 - 2);
      return { userId: m.userId, name: m.name, hcp: m.hcp, role: m.role, category: m.category, gross };
    });
    c.tournaments = c.tournaments || [];
    const id = Store.uid();
    c.tournaments.push({ id, name, date, holes, par, format: 'stroke', status: 'live', sponsors, players, createdAt: Date.now() });
    V.tournCreating = false; V.tournErr = null; V.tournId = id; commit();
  },
  'tourn-open'(d) { V.tournId = d.id; V.tournCapture = false; render(); window.scrollTo(0, 0); },
  'tourn-back'() { V.tournId = null; V.tournCapture = false; render(); window.scrollTo(0, 0); },
  'tourn-metric'(d) { V.tournNet = d.m === 'net'; render(); },
  'tourn-capture'() { V.tournCapture = true; render(); },
  'tourn-capture-close'() { V.tournCapture = false; render(); },
  'tourn-save'() {
    const c = myClub(); const t = c && (c.tournaments || []).find(x => x.id === V.tournId); if (!t) return;
    (t.players || []).forEach(p => { const el = document.getElementById('cap-' + p.userId); if (el) { const v = (el.value || '').trim(); const n = Number(v); p.gross = (v === '' || isNaN(n) || n < t.holes || n > 200) ? (v === '' ? null : p.gross) : n; } });
    V.tournCapture = false; commit();
  },
  'tourn-report-ai'() {
    const c = myClub(); const t = c && (c.tournaments || []).find(x => x.id === V.tournId); if (!t) return;
    const lb = tournLeaderboard(t, true).filter(r => r.has);
    if (!lb.length) { if (typeof celebrate === 'function') celebrate(false, 'Captura al menos un score primero'); return; }
    if (typeof AI === 'undefined' || !AI.on()) { actions['tourn-report'](); return; }
    V.tournReportOpen = true; V.tournReport = { name: t.name, loading: true }; render();
    const top = lb.slice(0, 5).map((r, i) => `${i + 1}. ${r.name}${r.role === 'junior' ? ' (juvenil)' : ''} — neto ${r.net}, gross ${r.gross} (${r.toPar >= 0 ? '+' : ''}${r.toPar})`).join('\n');
    const stats = [
      `Torneo: ${t.name}`,
      `Formato: stroke play · ${t.holes} hoyos · par ${t.par}${t.date ? ` · ${t.date}` : ''}`,
      `Club: ${c.name}`,
      `Jugadores con score: ${lb.length} de ${(t.players || []).length}`,
      (t.sponsors && t.sponsors.length) ? `Patrocinadores: ${t.sponsors.join(', ')}` : '',
      `Tabla (neto):\n${top}`,
    ].filter(Boolean).join('\n');
    const prompt = 'Eres el anfitrión del torneo del club. Escribe un resumen breve (un párrafo de 4 a 6 frases) para compartir con los miembros: felicita al ganador por neto, menciona 1 o 2 actuaciones destacadas (incluye a algún juvenil si aparece bien ubicado), y cierra agradeciendo a los patrocinadores si los hay. Tono festivo y cálido, en español de México. No inventes nombres ni números que no estén en los datos. Solo el párrafo.';
    AI.chat([{ from: 'me', text: prompt }], { stats }).then(res => {
      if (res && res.ok && res.text) { V.tournReport = { name: t.name, text: res.text }; render(); }
      else { V.tournReportOpen = false; V.tournReport = null; render(); actions['tourn-report'](); }
    });
  },
  'tourn-report'() {
    const c = myClub(); const t = c && (c.tournaments || []).find(x => x.id === V.tournId); if (!t) return;
    const lb = tournLeaderboard(t, true).filter(r => r.has);
    if (!lb.length) { if (typeof celebrate === 'function') celebrate(false, 'Captura al menos un score primero'); return; }
    const top = lb.slice(0, 3).map((r, i) => `${i + 1}. ${r.name} — neto ${r.net} (gross ${r.gross})`).join('\n');
    const txt = `🏆 ${t.name} · ${c.name}\n${t.holes} hoyos · par ${t.par}${t.date ? ` · ${t.date}` : ''}\n\n${top}${(t.sponsors && t.sponsors.length) ? `\n\nGracias a ${t.sponsors.join(', ')}` : ''}`;
    shareReport(txt);
  },
  'tourn-report-close'() { V.tournReportOpen = false; render(); },
  'tourn-report-share'() { const t = V.tournReport && V.tournReport.text; if (t) shareReport(t); },

  /* ---- Academia juvenil ---- */
  'club-academy-open'() { V.jrId = null; V.jrPlanOpen = false; V.view = 'club-academy'; render(); window.scrollTo(0, 0); },
  'jr-open'(d) { V.jrId = d.id; V.jrPlanOpen = false; render(); window.scrollTo(0, 0); },
  'jr-back'() { V.jrId = null; V.jrPlanOpen = false; render(); window.scrollTo(0, 0); },
  'jr-plan-open'() { const c = myClub(); const cur2 = c && c.academy && c.academy[V.jrId]; V.jrPlanPick = (cur2 && cur2.plan) ? cur2.plan.slice() : ((c && jrData(c, V.jrId).plan) || []).slice(); V.libCat = V.libCat || DRILL_CATS[0].id; V.jrPlanOpen = true; render(); },
  'jr-plan-cat'(d) { V.libCat = d.c; render(); },
  'jr-plan-toggle'(d) { V.jrPlanPick = V.jrPlanPick || []; const i = V.jrPlanPick.indexOf(d.name); if (i >= 0) V.jrPlanPick.splice(i, 1); else V.jrPlanPick.push(d.name); render(); },
  'jr-plan-close'() { V.jrPlanOpen = false; render(); },
  'jr-plan-save'() {
    const c = myClub(); if (!c || !V.jrId) return;
    c.academy = c.academy || {}; c.academy[V.jrId] = c.academy[V.jrId] || { plan: [], done: {} };
    c.academy[V.jrId].plan = (V.jrPlanPick || []).slice();
    // limpia "done" de drills que ya no están en el plan
    const keep = {}; (c.academy[V.jrId].plan).forEach(n => { if (c.academy[V.jrId].done && c.academy[V.jrId].done[n]) keep[n] = true; });
    c.academy[V.jrId].done = keep;
    V.jrPlanOpen = false; commit();
  },
  'jr-drill-done'(d) {
    const c = myClub(); if (!c || !V.jrId) return;
    c.academy = c.academy || {}; c.academy[V.jrId] = c.academy[V.jrId] || { plan: [], done: {} };
    const done = c.academy[V.jrId].done = c.academy[V.jrId].done || {};
    if (done[d.name]) delete done[d.name]; else done[d.name] = true;
    commit();
  },
  'jr-consent-open'() { V.consentOpen = true; V.consentErr = null; V.consentName = ''; render(); },
  'jr-consent-close'() { V.consentOpen = false; V.consentErr = null; render(); },
  'jr-consent-save'() {
    const c = myClub(); const m = c && (c.members || []).find(x => x.userId === V.jrId); if (!m) return;
    const name = ((document.getElementById('consent-name') || {}).value || '').trim();
    const okBox = (document.getElementById('consent-ok') || {}).checked;
    if (!name) { V.consentErr = 'Escribe el nombre del padre o tutor.'; render(); return; }
    if (!okBox) { V.consentErr = 'Marca la casilla de autorización.'; render(); return; }
    m.consent = { by: name, date: today() };
    V.consentOpen = false; V.consentErr = null; commit();
  },
  'jr-report'(d) {
    const c = myClub(); const m = c && (c.members || []).find(x => x.userId === d.id); if (!m) return;
    if (!m.consent) { if (typeof celebrate === 'function') celebrate(false, 'Falta el consentimiento de los padres'); return; }
    const dd = jrData(c, m.userId); const N = (dd.plan || []).length; const done = (dd.plan || []).filter(x => dd.done && dd.done[x]).length;
    const txt = `PARFECT · Reporte de ${m.name} (${m.category || 'Juvenil'})\nClub: ${c.name}\nHándicap: ${fmtHcp(m.hcp)}\nPlan: ${done}/${N} ejercicios completados\n¡Vamos por la beca!`;
    try {
      if (navigator.share) { navigator.share({ title: 'Reporte PARFECT', text: txt }).catch(() => {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(() => { if (typeof celebrate === 'function') celebrate(false, 'Reporte copiado ✓'); }); }
      else if (typeof celebrate === 'function') celebrate(false, 'Reporte listo');
    } catch (e) { if (typeof celebrate === 'function') celebrate(false, 'Reporte listo'); }
  },
  'jr-report-ai'(d) {
    const c = myClub(); const m = c && (c.members || []).find(x => x.userId === d.id); if (!m) return;
    if (!m.consent) { if (typeof celebrate === 'function') celebrate(false, 'Falta el consentimiento de los padres'); return; }
    if (typeof AI === 'undefined' || !AI.on()) { actions['jr-report'](d); return; }
    V.jrReportOpen = true; V.jrReport = { name: m.name, loading: true }; render();
    const dd = jrData(c, m.userId); const N = (dd.plan || []).length; const done = (dd.plan || []).filter(x => dd.done && dd.done[x]).length;
    const hd = [N > 0, N > 0 && done >= N, (m.hcp != null && m.hcp < 12), !!dd.podium].filter(Boolean).length;
    const stats = [
      `Jugador: ${m.name} (${m.category || 'Juvenil'})`,
      `Club: ${c.name}`,
      `Hándicap: ${fmtHcp(m.hcp)}`,
      `Plan de entrenamiento: ${done}/${N} ejercicios completados`,
      `Hitos camino a la beca: ${hd}/4`,
      (dd.plan && dd.plan.length) ? `Ejercicios del plan: ${dd.plan.join(', ')}` : '',
    ].filter(Boolean).join('\n');
    const nm = (m.name || '').split(' ')[0];
    const prompt = `Eres el coach de la academia juvenil del club. Escribe un reporte breve (un solo párrafo de 4 a 6 frases) para los papás de ${nm} sobre su progreso. Tono cálido, claro y profesional, hablándoles de usted. Menciona su avance en el plan, una fortaleza, qué va a trabajar, y cierra con una frase de aliento sobre su desarrollo rumbo a una beca. No inventes números que no estén en los datos. Solo el párrafo.`;
    AI.chat([{ from: 'me', text: prompt }], { stats }).then(res => {
      if (res && res.ok && res.text) { V.jrReport = { name: m.name, text: res.text }; render(); }
      else { V.jrReportOpen = false; V.jrReport = null; render(); actions['jr-report'](d); }
    });
  },
  'jr-report-close'() { V.jrReportOpen = false; render(); },
  'jr-report-share'() {
    const t = V.jrReport && V.jrReport.text; if (!t) return;
    try {
      if (navigator.share) { navigator.share({ title: 'Reporte PARFECT', text: t }).catch(() => {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(t).then(() => { if (typeof celebrate === 'function') celebrate(false, 'Reporte copiado ✓'); }); }
      else if (typeof celebrate === 'function') celebrate(false, 'Reporte listo');
    } catch (e) { if (typeof celebrate === 'function') celebrate(false, 'Reporte listo'); }
  },

  /* ---- auth ---- */
  async 'google-login'() {
    if (typeof Cloud === 'undefined' || !Cloud.enabled()) { V.err = 'El inicio con Google aún no está configurado.'; render(); return; }
    V.err = null;
    const res = await Cloud.signInWithGoogle();
    if (!res.ok) { V.err = res.msg || 'No se pudo conectar con Google.'; render(); }
    // si ok, el navegador redirige a Google y vuelve con la sesión iniciada
  },
  async login() {
    const email = val('f-email').toLowerCase();
    const pass = document.getElementById('f-pass').value;
    V.authVals = { email };
    // ---- nube activa: autentica contra Supabase ----
    if (typeof Cloud !== 'undefined' && Cloud.enabled()) {
      const res = await Cloud.signIn(email, pass);
      if (!res.ok) { V.err = res.msg; render(); return; }
      V.authVals = null; V.err = null; V.view = 'inicio'; V.diag = null;
      commit(); window.scrollTo(0, 0); return;
    }
    // ---- modo local (sin nube configurada) ----
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
    const hcp = hcpRaw === '' ? 18 : Math.round(Number(hcpRaw));
    const goal = goalRaw === '' ? Math.max(hcp - 5, 0) : Math.round(Number(goalRaw));
    // ---- nube activa: crea la cuenta en Supabase ----
    if (typeof Cloud !== 'undefined' && Cloud.enabled()) {
      const res = await Cloud.signUp({ name, email, pass, hcp, goal, demo });
      if (!res.ok) { V.err = res.msg; render(); return; }
      if (res.needsConfirm) { V.authVals = null; V.err = 'Te enviamos un correo para confirmar tu cuenta. Confírmalo y luego inicia sesión.'; V.view = 'login'; render(); window.scrollTo(0, 0); return; }
      V.authVals = null; V.err = null; V.view = 'inicio'; V.diag = null;
      commit(); window.scrollTo(0, 0); return;
    }
    // ---- modo local (sin nube configurada) ----
    if (S.users.some(x => x.email === email)) { V.err = 'Ya existe una cuenta con ese email en este dispositivo.'; render(); return; }
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
    if (typeof Cloud !== 'undefined' && Cloud.enabled()) Cloud.signOut();
    S.session = null;
    V.profileOpen = false; V.view = 'landing'; V.diag = null;
    commit(); window.scrollTo(0, 0);
  },

  /* ---- perfil ---- */
  'profile-open'() { V.wipeArm = false; go('perfil'); },
  'profile-edit'() { V.profileOpen = true; render(); },
  'feed-like'(d) {
    if (typeof Feed !== 'undefined' && Feed.on()) { Feed.toggleLike(d.id); return; }
    const u = cur(); if (!u) return; u.likes = u.likes || {}; if (u.likes[d.id]) delete u.likes[d.id]; else u.likes[d.id] = true; commit();
  },
  'feed-comments'(d) {
    if (!(typeof Feed !== 'undefined' && Feed.on())) return;
    V.commentsFor = d.id; V.commentBusy = false;
    Feed.loadComments(d.id);
    render();
  },
  'comments-close'() { V.commentsFor = null; V.commentBusy = false; render(); },
  async 'comment-post'(d) {
    const t = ((document.getElementById('cm-text') || {}).value || '').trim();
    if (!t || V.commentBusy) return;
    V.commentBusy = true; render();
    await Feed.addComment(d.p, t);
    V.commentBusy = false; render();
  },
  'comment-del'(d) { if (typeof Feed !== 'undefined' && Feed.on()) Feed.deleteComment(d.p, d.id); },
  'share-round'() {
    const u = cur(); if (!u) return;
    const rs = myRounds();
    if (!rs.length) return;
    u.shared = u.shared || [];
    const last = rs[0].id;
    if (!u.shared.includes(last)) u.shared.unshift(last);
    if (typeof celebrate === 'function') celebrate(false, '¡Ronda compartida!');
    commit();
  },
  'share-open'(d) {
    const rs = myRounds();
    if (!rs.length) { alert('Primero registra una ronda para compartirla.'); return; }
    const r0 = (d && d.id && rs.find(x => x.id === d.id)) || rs[0];
    V.shareDraft = { roundId: r0.id, caption: r0.caption || '', media: r0.media || null, upload: null }; V.shareErr = null; render();
  },
  'share-pick'(d) { if (V.shareDraft) { V.shareDraft.caption = (document.getElementById('share-cap') || {}).value || V.shareDraft.caption; V.shareDraft.roundId = d.id; } render(); },
  'share-clearmedia'() { if (V.shareDraft) { V.shareDraft.caption = (document.getElementById('share-cap') || {}).value || V.shareDraft.caption; V.shareDraft.media = null; V.shareDraft.upload = null; } render(); },
  'share-close'() { V.shareDraft = null; V.shareErr = null; render(); },
  async 'share-post'() {
    const u = cur(); const d = V.shareDraft; if (!u || !d) return;
    d.caption = (document.getElementById('share-cap') || {}).value || d.caption;
    const r = myRounds().find(x => x.id === d.roundId);
    if (!r) { V.shareDraft = null; render(); return; }

    // ---- modo nube: sube media a Storage + crea el post real ----
    if (typeof Feed !== 'undefined' && Feed.on()) {
      V.shareBusy = true; V.shareErr = null; render();
      try { if (Cloud.push) await Cloud.push(); } catch (e) {}   // asegura que la ronda exista en la nube (FK del post)
      const res = await Feed.createPost(r, d.caption, d.upload);
      V.shareBusy = false;
      if (!res.ok) { V.shareErr = res.msg; render(); return; }
      if (res.media) r.media = res.media;                         // guarda la URL en la ronda (se sincroniza)
      r.caption = (d.caption || '').trim();
      u.shared = u.shared || []; if (!u.shared.includes(r.id)) u.shared.unshift(r.id);
      V.shareDraft = null; V.shareErr = null;
      if (typeof celebrate === 'function') celebrate(false, '¡Ronda compartida!');
      commit();
      return;
    }

    // ---- modo local (sin nube) ----
    const pc = r.caption, pm = r.media;
    r.caption = (d.caption || '').trim(); r.media = d.media || null;
    try { Store.save(S); }
    catch (e) { r.caption = pc; r.media = pm; V.shareErr = 'No se pudo guardar (espacio lleno). Prueba con una foto más ligera o sin video.'; render(); return; }
    u.shared = u.shared || []; if (!u.shared.includes(r.id)) u.shared.unshift(r.id);
    V.shareDraft = null; V.shareErr = null;
    if (typeof celebrate === 'function') celebrate(false, '¡Ronda compartida!');
    commit();
  },
  'card-picker'() { V.cardPicker = true; render(); },
  'card-picker-close'() { V.cardPicker = false; render(); },
  'set-skin'(d) { const u = cur(); if (u && CARD_SKINS.some(s => s.k === d.k)) { u.cardSkin = d.k; commit(); } },
  'stat-open'(d) { V.statOpen = (V.statOpen === d.k) ? null : d.k; render(); },
  'go-trofeos'() { V.profileOpen = false; V.trainerTab = 'objetivos'; go('trainer'); },
  'event-new'() { V.eventDraft = { name: '', courseId: 'campestre', date: (typeof addDays === 'function' ? addDays(today(), 3) : today()), time: '09:00', mode: 'casual', invitees: [] }; V.err = null; render(); },
  'event-capName'() { if (V.eventDraft) V.eventDraft.name = (document.getElementById('ev-name') || {}).value || V.eventDraft.name; },
  'event-course'(d) { actions['event-capName'](); if (V.eventDraft && COURSES[d.c]) V.eventDraft.courseId = d.c; render(); },
  'event-mode'(d) { actions['event-capName'](); if (V.eventDraft) V.eventDraft.mode = d.m; render(); },
  'event-invite'(d) { actions['event-capName'](); if (!V.eventDraft) return; const a = V.eventDraft.invitees; const i = a.indexOf(d.n); if (i >= 0) a.splice(i, 1); else a.push(d.n); render(); },
  async 'event-create'() {
    const d = V.eventDraft; if (!d) return;
    const name = ((document.getElementById('ev-name') || {}).value || d.name || '').trim();
    const date = (document.getElementById('ev-date') || {}).value || d.date;
    const time = (document.getElementById('ev-time') || {}).value || d.time;
    if (!name) { V.err = 'Ponle un nombre al evento.'; render(); return; }
    // ---- modo nube: evento real en el tablón ----
    if (typeof Events !== 'undefined' && Events.on()) {
      V.eventBusy = true; V.err = null; render();
      const res = await Events.createEvent({ name, courseId: d.courseId, date, time, mode: d.mode });
      V.eventBusy = false;
      if (!res.ok) { V.err = res.msg; render(); return; }
      V.eventDraft = null;
      if (typeof celebrate === 'function') celebrate(false, '¡Evento creado!');
      render();
      return;
    }
    // ---- modo local (demo) ----
    const avOf = n => { const f = (typeof FRIENDS_FEED !== 'undefined') ? FRIENDS_FEED.find(x => x.name === n) : null; return f ? f.av : 0; };
    S.events = S.events || [];
    S.events.unshift({ id: Store.uid(), name, courseId: d.courseId, date, time, mode: d.mode, host: (cur() || {}).name, invitees: d.invitees.map(n => ({ name: n, av: avOf(n), status: 'pending' })) });
    V.eventDraft = null; V.err = null;
    if (typeof celebrate === 'function') celebrate(false, '¡Evento creado!');
    commit();
  },
  'event-close'() { V.eventDraft = null; V.err = null; render(); },
  'event-rsvp'(d) {
    if (typeof Events !== 'undefined' && Events.on()) { Events.setRsvp(d.id, d.s || 'going'); return; }
    const e = (S.events || []).find(x => x.id === d.id); if (!e) return;
    const inv = e.invitees.find(x => x.name === d.n); if (!inv) return;
    inv.status = inv.status === 'pending' ? 'yes' : inv.status === 'yes' ? 'no' : 'pending';
    commit();
  },
  'event-del'(d) {
    if (typeof Events !== 'undefined' && Events.on()) { Events.deleteEvent(d.id); return; }
    S.events = (S.events || []).filter(x => x.id !== d.id); commit();
  },
  'ev-join-up'(d) {
    const u = cur(); if (!u) return;
    u.joinedEvents = u.joinedEvents || {}; u.events = u.events || [];
    const was = !!u.joinedEvents[d.n];
    if (was) {
      delete u.joinedEvents[d.n];
      u.events = u.events.filter(e => e.joined !== d.n);
    } else {
      u.joinedEvents[d.n] = true;
      const x = (typeof TOURNAMENT !== 'undefined' ? TOURNAMENT.upcoming : []).find(e => e.name === d.n);
      if (x && typeof upEventToCal === 'function' && !u.events.some(e => e.joined === d.n)) {
        const ev = upEventToCal(x); if (ev) u.events.push(ev);
      }
      if (typeof celebrate === 'function') celebrate(false, '¡Listo! Lo agregué a tu calendario');
    }
    commit();
  },
  'academia-start'() { V.profileOpen = false; V.lesson = null; V.view = 'academia'; render(); window.scrollTo(0, 0); },
  'onboard-academy'() { const u = cur(); if (u) u.onboarded = true; V.lesson = null; V.view = 'academia'; commit(); window.scrollTo(0, 0); },
  'academia-exit'() { V.lesson = null; V.trainerTab = 'academia'; V.view = 'trainer'; render(); window.scrollTo(0, 0); },
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
  'onb-next'() { onbSaveStep(); V.onbStep = (V.onbStep || 0) + 1; commit(); window.scrollTo(0, 0); },
  'onb-back'() { V.onbStep = Math.max(0, (V.onbStep || 0) - 1); render(); window.scrollTo(0, 0); },
  'finish-onboard'() {
    const u = cur(); if (!u) return;
    onbSaveStep();
    u.onboarded = true; V.onbStep = 0;
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
    if (typeof Cloud !== 'undefined' && Cloud.enabled()) Cloud.wipeMine();
    V.wipeArm = false; V.profileOpen = false; V.diag = null;
    commit();
  },

  /* ---- rondas ---- */
  'go-setup'() { V.setupCourseId = (V.setupCourseId && COURSES[V.setupCourseId]) ? V.setupCourseId : 'campestre'; const total = COURSES[V.setupCourseId].holes.length; V.setupHoles = total >= 18 ? 18 : 9; V.setupStart = 0; V.joining = false; V.err = null; go('nueva'); },
  'setup-pick-course'(d) {
    if (COURSES[d.c]) V.setupCourseId = d.c;
    const total = COURSES[V.setupCourseId].holes.length;
    V.setupHoles = total >= 18 ? 18 : 9;   // default por campo
    V.setupStart = 0;
    render();
  },
  'setup-when'(d) { V.setupWhen = d.w === 'prog' ? 'prog' : 'ahora'; render(); window.scrollTo(0, 0); },
  'setup-holes'(d) { V.setupHoles = Number(d.h) === 9 ? 9 : 18; render(); },
  'setup-nine'(d) { V.setupStart = Number(d.s) || 0; render(); },
  'setup-start-adj'(d) {
    const cid = (V.setupCourseId && COURSES[V.setupCourseId]) ? V.setupCourseId : 'campestre';
    const total = COURSES[cid].holes.length;
    if (d && d.d === 'reset') V.setupStart = 0;
    else V.setupStart = (((V.setupStart || 0) + (Number(d.d) || 0)) % total + total) % total;
    render();
  },
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
  'set-env'(d) { S.settings = S.settings || {}; S.settings.env = ['dia', 'amanecer', 'atardecer', 'noche'].includes(d.e) ? d.e : 'dia'; commit(); },
  'bag-edit'() { V.bagEdit = true; render(); },
  'bag-toggle'(d) {
    const u = cur(); if (!u) return;
    let clubs = (u.clubs && Object.keys(u.clubs).some(k => u.clubs[k] != null)) ? Object.assign({}, u.clubs) : {};
    if (!Object.keys(clubs).length) DEFAULT_BAG.forEach(id => { clubs[id] = { c: CLUB_DEFAULT[id], e: CLUB_EFF_DEFAULT }; });
    if (clubs[d.id] != null) {
      if (Object.keys(clubs).length <= 1) return;
      delete clubs[d.id];
    } else {
      if (Object.keys(clubs).length >= 14) return;
      clubs[d.id] = { c: CLUB_DEFAULT[d.id], e: CLUB_EFF_DEFAULT };
    }
    u.clubs = clubs; commit();
  },
  'bag-close'() { V.bagEdit = false; render(); },
  'set-sex'(d) { const u = cur(); if (!u) return; u.avatarSex = d.s === 'w' ? 'w' : 'm'; u.avatarHue = 0; const b = u.avatarSex === 'w' ? 6 : 12; u.avatar = b + (u.avatarSkin || 0); u.golfer = null; commit(); },
  'set-avskin'(d) { const u = cur(); if (!u) return; if (!u.avatarSex || u.avatarSex === 'n') u.avatarSex = 'm'; u.avatarSkin = Math.max(0, Math.min(5, Number(d.i) || 0)); u.avatarHue = 0; const b = u.avatarSex === 'w' ? 6 : 12; u.avatar = b + u.avatarSkin; u.golfer = null; commit(); },
  'set-avhue'(d) { const u = cur(); if (!u) return; u.avatarHue = Number(d.h) || 0; commit(); },
  'set-avemoji'(d) { const u = cur(); if (!u) return; u.avatarEmoji = d.e ? d.e : null; commit(); },
  'hole-coach-toggle'() { V.holeCoachOpen = !V.holeCoachOpen; render(); },
  'set-avatar'(d) { const u = cur(); if (u) { u.avatar = Number(d.i) || 0; u.golfer = null; commit(); } },
  'set-hue'(d) { const u = cur(); if (u) { u.avatarHue = Number(d.h) || 0; u.golfer = null; commit(); } },
  'golfer-custom'() { const u = cur(); if (u && !u.golfer) { u.golfer = Object.assign({}, GOLF_DEFAULT); commit(); } },
  'gset'(d) { const u = cur(); if (!u) return; u.golfer = Object.assign({}, GOLF_DEFAULT, u.golfer); u.golfer[d.k] = d.v; commit(); },
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
  'start-round'() { V.teeSheet = true; render(); },
  'tee-cancel'() { V.teeSheet = false; render(); },
  'confirm-tee'(d) {
    if (d && d.t) V.setupTee = d.t;
    const cid = (V.setupCourseId && COURSES[V.setupCourseId]) ? V.setupCourseId : 'campestre';
    const course = COURSES[cid].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
    const total = COURSES[cid].holes.length;
    const holesCount = (V.setupHoles === 9) ? 9 : 18;   // 9 o 18 (los campos de 9 repiten vuelta)
    const holeOffset = (((V.setupStart || 0) % total) + total) % total;   // empieza en cualquier hoyo (da la vuelta)
    const tee = teeById(V.setupTee);
    S.active = { userId: S.session, course, courseId: cid, holesCount, holeOffset, holes: [], idx: 0, startedAt: Date.now(), teeId: tee.id, teeName: tee.name, teeF: tee.f };
    V.teeSheet = false;
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
    if (k === 'tee') { h.teeLie = d.lie; h.tee = d.dir || 'c'; if (d.lie !== 'ob') h.pen = false; if (d.lie === 'ob') h.pen = true; }
    else if (k === 'app') { h.app = d.v; if (d.v === 'gir') h.upDown = null; }
    else if (k === 'ud') { h.upDown = (d.v === 'si'); }   // luego pregunta 1 o 0 putts
    else if (k === 'putts') { h.putts = Number(d.v); }
    V.fastStep = null; // re-deriva el paso → auto-avanza al siguiente
    render();
  },
  'fast-pen'() { const h = V.hole; if (!h) return; h.pen = !h.pen; if (h.pen && (h.teeLie == null)) { h.teeLie = 'ob'; h.tee = 'c'; } render(); },
  'fast-tab'(d) { const h = V.hole; if (!h) return; const steps = playSteps(h); const i = steps.indexOf(d.s); if (i >= 0) V.fastStep = i; render(); },
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
    const rel = score - h.par;
    if (a.idx + 1 < a.holesCount && typeof celebrate === 'function') {
      if (rel <= -2) celebrate(true, '¡Águila!');
      else if (rel === -1) celebrate(true, '¡Birdie!');
      else if (rel === 0) celebrate(false, '¡Par!');
      else celebrate(false);
    }
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
  'extend-nine'() {
    const a = S.active; if (!a) return;
    a.holesCount = 18;            // continúa con los otros 9 (hoyo 10 = idx 9, da la vuelta si el campo es de 9)
    if (a.idx < 9) a.idx = 9;
    loadHole();
    V.view = 'play';
    commit(); window.scrollTo(0, 0);
  },
  'finish-round'() {
    const a = S.active;
    const round = { id: Store.uid(), userId: a.userId, course: a.course, courseId: a.courseId, holeOffset: a.holeOffset || 0, date: today(), time: new Date().toTimeString().slice(0, 5), holes: a.holes.slice(0, a.holesCount) };
    S.rounds.push(round);
    S.active = null;
    V.diag = null; V.detail = round.id; V.view = 'detalle'; V.justFinished = round.id;
    V.roundAI = null;
    if (typeof AI !== 'undefined' && AI.on()) {
      V.roundAI = { id: round.id, loading: true };
      const cName = (round.courseId && COURSES[round.courseId]) ? COURSES[round.courseId].name : (round.course || '');
      AI.roundComment(Stats.roundStats(round), cName).then(res => {
        V.roundAI = (res && res.ok && res.text) ? { id: round.id, text: res.text } : null;
        render();
      });
    }
    commit(); window.scrollTo(0, 0);
  },
  'round-detail'(d) { V.detail = d.id; V.delArm = null; V.justFinished = null; V.roundAI = null; go('detalle'); },
  'round-ai'(d) {
    const r = S.rounds.find(x => x.id === d.id); if (!r || typeof AI === 'undefined' || !AI.on()) return;
    V.roundAI = { id: r.id, loading: true }; render();
    const cName = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].name : (r.course || '');
    AI.roundComment(Stats.roundStats(r), cName).then(res => {
      V.roundAI = (res && res.ok && res.text) ? { id: r.id, text: res.text } : { id: r.id, fail: true };
      render();
    });
  },
  'round-delete'(d) {
    if (V.delArm !== d.id) { V.delArm = d.id; render(); return; }
    S.rounds = S.rounds.filter(r => r.id !== d.id);
    if (typeof Cloud !== 'undefined' && Cloud.enabled()) Cloud.remove('rounds', d.id);
    V.delArm = null; V.diag = null; V.view = 'ronda';
    commit();
  },

  /* ---- trainer / tracker ---- */
  'trainer-tab'(d) { V.trainerTab = d.t; V.err = null; V.planSkipMode = false; if (d.t === 'cal') ensureWeekPlan(cur()); render(); },
  diagnose() {
    V.diagBusy = true; V.diag = null; V.diagAI = null;
    render();
    setTimeout(() => {
      V.diagBusy = false;
      V.diag = Trainer.analyze(Stats.aggregate(myRounds()), cur());
      if (typeof AI !== 'undefined' && AI.on()) {
        V.diagAI = { loading: true };
        AI.coachNarrative().then(res => {
          V.diagAI = (res && res.ok && res.text) ? { text: res.text } : null;
          render();
        });
      }
      render();
      window.scrollTo(0, 0);
    }, 700);
  },
  'trk-tab'(d) { V.trkTab = d.t; V.err = null; render(); },
  'drill-cat'(d) { V.drillCat = d.c; render(); },
  'drill-go-entreno'() {
    V.drillDetail = null; V.drillFrom = null;
    V.view = 'trainer'; V.trainerTab = 'entreno';
    V.planStep = undefined; V.sessionRun = null;
    render(); window.scrollTo(0, 0);
  },
  'diag-aicoach'() {
    V.view = 'trainer'; V.trainerTab = 'entreno';
    V.planMode = 'ai'; V.planStep = 'time'; V.planSkipMode = true;
    V.drillDetail = null; V.drillFrom = null; V.sessionRun = null;
    render(); window.scrollTo(0, 0);
  },
  'drill-open'(d) {
    stopDrillTimer();
    V.drillFrom = d.from || null;
    V.timer = { left: 300, total: 300, running: false };
    const drill = (typeof DRILL_LIBRARY !== 'undefined') ? DRILL_LIBRARY.find(x => x.name === d.name) : null;
    if (drill) { V.drillDetail = drill; render(); return; }
    // drill de diagnóstico (motor Trainer): trae sus propios pasos personalizados
    if (typeof Trainer !== 'undefined' && Trainer.DRILLS) {
      const catMap = { driving: 'fw', approach: 'gir', short: 'ud', putting: 'putt' };
      for (const k of Object.keys(Trainer.DRILLS)) {
        const t = Trainer.DRILLS[k].find(x => x.name === d.name);
        if (t) {
          V.drillDetail = { name: t.name, cat: catMap[k] || '', desc: t.desc || '', dose: t.dose || 'Práctica', metric: t.metric || '', steps: t.steps || [] };
          render(); return;
        }
      }
    }
    // práctica de bastón/área (no está en la biblioteca): detalle simple
    const club = d.name || 'este palo';
    const meta = Number(d.target) || 7;
    V.drillDetail = {
      name: d.name, cat: '', desc: d.goal || ('Práctica enfocada en tu ' + club + '.'),
      dose: d.area || 'Práctica', metric: 'meta ' + meta + ' seguidas',
      steps: [
        'Calienta y haz tu rutina completa con el ' + club,
        'Elige un objetivo y pega 1 bola buscando contacto sólido',
        'Lleva ' + meta + ' golpes buenos seguidos; si fallas, reinicia la cuenta',
      ],
    };
    render();
  },
  'timer-set'(d) { if (!V.timer) V.timer = {}; stopDrillTimer(); const s = Number(d.s) || 300; V.timer = { left: s, total: s, running: false }; render(); },
  'timer-adjust'(d) { stopDrillTimer(); const cur = (V.timer && V.timer.total) || 300; const total = Math.max(60, Math.min(3600, cur + Number(d.d) * 60)); V.timer = { left: total, total, running: false }; render(); },
  'session-min'(d) { V.sessionMin = Number(d.m) || 60; render(); },
  'plan-time'(d) { V.sessionMin = Number(d.m) || 60; if (V.planSkipMode && V.planMode === 'ai') { V.planStep = 'aisum'; V.planSkipMode = false; } else { V.planStep = 'mode'; } render(); window.scrollTo(0, 0); },
  'plan-aisum-go'() { V.planStep = 'plan'; render(); window.scrollTo(0, 0); },
  'plan-mode'(d) { V.planMode = d.m; if (d.m === 'me') V.planStep = 'areas'; else if (d.m === 'lib') { V.planStep = 'lib'; V.libPick = V.libPick || []; } else if (d.m === 'free') { V.planStep = 'free'; V.freeTimer = { secs: 0, running: false }; V.freeDrill = null; } else V.planStep = 'aisum'; render(); window.scrollTo(0, 0); },
  'plan-lib-cat'(d) { V.libCat = d.c; render(); },
  'plan-lib-toggle'(d) { V.libPick = V.libPick || []; const i = V.libPick.indexOf(d.name); if (i >= 0) V.libPick.splice(i, 1); else V.libPick.push(d.name); render(); },
  'session-run-start'(d) {
    const u = cur(); if (!u) return;
    const blocks = buildSessionBlocks(u, Stats.aggregate(myRounds()), V.sessionMin || 60, V.planMode, V.planAreas);
    if (!blocks.length) return;
    let idx = parseInt(d && d.idx, 10); if (isNaN(idx)) idx = 0;
    idx = Math.max(0, Math.min(blocks.length - 1, idx));
    V.sessionRun = { blocks, idx, left: blocks[idx].min * 60, running: true };
    srBeep(1); srStartInterval(); render(); window.scrollTo(0, 0);
  },
  'session-run-pause'() { clearInterval(V._srtid); if (V.sessionRun) V.sessionRun.running = false; render(); },
  'session-run-resume'() { if (V.sessionRun) { V.sessionRun.running = true; srStartInterval(); render(); } },
  'session-run-skip'() {
    const r = V.sessionRun; if (!r) return;
    srBeep(1); r.idx++;
    if (r.idx >= r.blocks.length) { srFinish(true); return; }
    r.left = r.blocks[r.idx].min * 60; render();
  },
  'session-run-stop'() { srFinish(false); },
  'sess-sum-home'() { V.sessionSummary = null; V.planStep = undefined; go('inicio'); },
  'free-club'(d) { V.freeClub = d.c; V.freeDrill = null; render(); },
  'free-lib-open'() { V.libCat = V.libCat || DRILL_CATS[0].id; V.planStep = 'freelib'; render(); window.scrollTo(0, 0); },
  'free-lib-cat'(d) { V.libCat = d.c; render(); },
  'free-lib-pick'(d) { const dr = (typeof DRILL_LIBRARY !== 'undefined') ? DRILL_LIBRARY.find(x => x.name === d.name) : null; if (dr) { V.freeDrill = dr; V.freeClub = null; } V.planStep = 'free'; render(); window.scrollTo(0, 0); },
  'free-lib-back'() { V.planStep = 'free'; render(); window.scrollTo(0, 0); },
  'free-start'() {
    if (!V.freeClub && !V.freeDrill) return;
    if (!V.freeTimer) V.freeTimer = { secs: 0, running: false };
    if (V.freeTimer.running) return;
    V.freeTimer.running = true; render();
    clearInterval(V._ftid);
    V._ftid = setInterval(() => {
      if (!V.freeTimer) { clearInterval(V._ftid); return; }
      V.freeTimer.secs++;
      const el = document.getElementById('free-clock');
      if (!el) { clearInterval(V._ftid); return; }
      el.textContent = fmtClock(V.freeTimer.secs);
    }, 1000);
  },
  'free-pause'() { clearInterval(V._ftid); if (V.freeTimer) V.freeTimer.running = false; render(); },
  'free-reset'() { clearInterval(V._ftid); V.freeTimer = { secs: 0, running: false }; render(); },
  'free-finish'() {
    clearInterval(V._ftid);
    const t = V.freeTimer || { secs: 0 }; const u = cur();
    if (!u || t.secs < 1) { V.freeTimer = { secs: 0, running: false }; render(); return; }
    const mins = Math.max(1, Math.round(t.secs / 60));
    const fd = V.freeDrill;
    const label = fd ? fd.name : (V.freeClub || 'Práctica libre');
    const area = fd ? ((DRILL_CATS.find(c => c.id === fd.cat) || {}).label || 'Práctica') : (V.freeClub || 'Libre');
    if (fd) { u.drillsDone = u.drillsDone || {}; u.drillsDone[fd.name] = today(); }
    S.practices = S.practices || [];
    S.practices.push({ id: Store.uid(), userId: S.session, date: today(), drill: 'Entrenamiento libre · ' + label, area, minutes: mins, notes: 'libre' });
    V.freeTimer = { secs: 0, running: false }; V.freeDrill = null; V.planStep = 'time';
    if (typeof celebrate === 'function') celebrate(false, mins + ' min de ' + label + ' ✓');
    commit();
  },
  'plan-mode-back'() { V.planStep = 'mode'; render(); },
  'plan-area'(d) { V.planAreas = (V.planAreas && V.planAreas.length) ? V.planAreas : ['driving', 'approach', 'short', 'putting']; const i = V.planAreas.indexOf(d.k); if (i >= 0) V.planAreas.splice(i, 1); else V.planAreas.push(d.k); render(); },
  'plan-build'() { V.planStep = 'plan'; render(); window.scrollTo(0, 0); },
  'plan-reset'() { V.planStep = 'time'; V.planSkipMode = false; render(); window.scrollTo(0, 0); },
  'lesson-open'(d) { const u = cur(); if (!u || !academyUnlocked(u, d.id)) return; V.lesson = d.id; V.lessonQ = false; V.lessonPick = null; render(); },
  'lesson-quiz'() { V.lessonQ = true; V.lessonPick = null; render(); },
  'lesson-answer'(d) { V.lessonPick = Number(d.i); render(); },
  'lesson-retry'() { V.lessonPick = null; render(); },
  'lesson-complete'(d) {
    const u = cur(); if (!u) return;
    u.academy = u.academy || {};
    const wasDone = !!u.academy[d.id];
    u.academy[d.id] = true;
    V.lesson = null; V.lessonQ = false; V.lessonPick = null;
    if (!wasDone && typeof celebrate === 'function') celebrate(true, '¡Lección completada!');
    commit();
  },
  'lesson-close'() { V.lesson = null; V.lessonQ = false; V.lessonPick = null; render(); },
  /* ---- Quiz tipo Preguntados de la Academia ---- */
  'quiz-open'(d) {
    const u = cur(); const i = Number(d.i);
    if (!u || typeof quizUnlocked !== 'function' || !quizUnlocked(u, i)) return;
    const n = (typeof levelQs === 'function') ? levelQs(i).length : 10;
    const order = Array.from({ length: n }, (_, k) => k);
    for (let k = n - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
    V.quiz = { i, qi: 0, score: 0, picked: null, order, done: false };
    render();
  },
  'quiz-pick'(d) {
    const q = V.quiz; if (!q || q.picked != null) return;
    const item = levelQs(q.i)[q.order[q.qi]];
    q.picked = Number(d.i);
    if (q.picked === item.a) q.score++;
    render();
  },
  'quiz-advance'() {
    const q = V.quiz; if (!q || q.picked == null) return;
    const total = levelQs(q.i).length;
    if (q.qi + 1 < total) { q.qi++; q.picked = null; render(); return; }
    // terminado
    q.done = true;
    const u = cur();
    if (u) {
      u.acQuiz = u.acQuiz || {};
      const prev = u.acQuiz[q.i] || 0;
      const passedNow = q.score >= 7 && prev < 7;
      if (q.score > prev) u.acQuiz[q.i] = q.score;
      commit();
      if (passedNow && typeof celebrate === 'function') celebrate(q.score >= 9, '¡Hoyo superado!');
      else render();
    } else render();
  },
  'quiz-retry'() { const q = V.quiz; if (q) actions['quiz-open']({ i: q.i }); },
  'quiz-next-hole'() { const q = V.quiz; if (q) actions['quiz-open']({ i: q.i + 1 }); },
  'quiz-close'() { V.quiz = null; render(); },
  'coach-mode'(d) { const u = cur(); if (u) u.isCoach = d.c === '1'; V.coachStudent = null; commit(); },
  'coach-pick'(d) {
    V.coachStudent = d.id;
    if (typeof Coach !== 'undefined' && Coach.on()) { Coach.loadStudentRounds(d.id); Coach.loadNotes(S.session, d.id); }
    render(); window.scrollTo(0, 0);
  },
  'coach-back'() { V.coachStudent = null; render(); window.scrollTo(0, 0); },
  'coach-add-class'(d) {
    clubInit(); const title = val('cz-ctitle'); const date = val('cz-cdate'); const time = val('cz-ctime');
    if (!title || !date) { alert('Pon al menos el tema y la fecha de la clase.'); return; }
    S.club.classes.push({ id: Store.uid(), studentId: d.id, coach: cur().name, date, time: time || '09:00', title });
    commit();
  },
  async 'coach-add-note'(d) {
    const text = val('cz-note');
    if (!text) { alert('Escribe el comentario.'); return; }
    if (typeof Coach !== 'undefined' && Coach.on()) {
      V.coachBusy = true; render();
      const res = await Coach.addNote(d.id, text);
      V.coachBusy = false;
      if (!res.ok) { alert(res.msg || 'No se pudo enviar.'); render(); return; }
      const ta = document.getElementById('cz-note'); if (ta) ta.value = '';
      render(); return;
    }
    clubInit();
    S.club.notes.push({ id: Store.uid(), studentId: d.id, coach: cur().name, date: today(), text });
    commit();
  },
  'coach-del-note'(d) { if (typeof Coach !== 'undefined' && Coach.on()) Coach.deleteNote(S.session, d.s, d.n); },
  async 'coach-request'(d) {
    if (!(typeof Coach !== 'undefined' && Coach.on())) return;
    const res = await Coach.request(d.c, S.session);
    if (!res.ok) { alert(res.msg || 'No se pudo enviar.'); return; }
    if (typeof celebrate === 'function') celebrate(false, 'Solicitud enviada');
  },
  'coach-accept'(d) { if (typeof Coach !== 'undefined' && Coach.on()) Coach.accept(d.c, d.s); },
  'coach-decline'(d) { if (typeof Coach !== 'undefined' && Coach.on()) Coach.remove(d.c, d.s); },
  'coach-remove'(d) { if (typeof Coach !== 'undefined' && Coach.on()) { V.coachStudent = null; Coach.remove(d.c, d.s); } },
  'timer-start'() {
    if (!V.timer || V.timer.running || V.timer.left <= 0) return;
    V.timer.running = true; render();
    V._tid = setInterval(() => {
      if (!V.timer) { stopDrillTimer(); return; }
      V.timer.left = Math.max(0, V.timer.left - 1);
      const el = document.getElementById('dd-timer');
      if (!el) { stopDrillTimer(); return; }
      el.textContent = fmtClock(V.timer.left);
      const bar = document.getElementById('dd-bar');
      if (bar) bar.style.width = (100 * (1 - (V.timer.left / (V.timer.total || 1)))).toFixed(1) + '%';
      if (V.timer.left <= 0) { stopDrillTimer(); V.timer.running = false; if (typeof celebrate === 'function') celebrate(false, '¡Tiempo! Bien entrenado'); render(); }
    }, 1000);
  },
  'timer-pause'() { stopDrillTimer(); if (V.timer) V.timer.running = false; render(); },
  'timer-reset'() { stopDrillTimer(); if (V.timer) { V.timer.left = V.timer.total; V.timer.running = false; } render(); },
  'drill-start'() {
    const drill = V.drillDetail; if (!drill) return;
    const timer = 20, target = drill.cat === 'putt' ? 10 : 7;
    const area = (typeof DRILL_CATS !== 'undefined' && (DRILL_CATS.find(c => c.id === drill.cat) || {}).label) || '';
    V.drillLog = { name: drill.name, target, area, goal: drill.metric || '', desc: drill.desc || '', timer, streak: 0, best: 0, secs: timer * 60, running: false };
    V.drillDetail = null;
    render();
  },
  'drill-close-detail'() { stopDrillTimer(); V.drillDetail = null; V.drillFrom = null; render(); },
  'drill-done'() {
    stopDrillTimer();
    const d = V.drillDetail; V.drillDetail = null;
    if (d) {
      S.practices.push({ id: Store.uid(), userId: S.session, date: today(), drill: d.name, area: (DRILL_CATS.find(c => c.id === d.cat) || {}).label || '', notes: 'entrenado' });
      const u = cur(); if (u) { u.drillsDone = u.drillsDone || {}; u.drillsDone[d.name] = today(); }
    }
    if (typeof celebrate === 'function') celebrate(false, '¡Bien hecho!');
    commit();
  },
  'sensei-toggle'() { V.senseiOpen = V.senseiOpen === false; render(); },
  'train-area'(d) { V.drillCat = d.c; V.trainerTab = 'drills'; render(); window.scrollTo(0, 0); },
  'drill-hit'() {
    if (!V.drillLog) return;
    const d = V.drillLog;
    const wasDone = d.streak >= d.target;
    d.streak = Math.min(d.target, d.streak + 1);
    if (d.streak > d.best) d.best = d.streak;
    if (!wasDone && d.streak === d.target && typeof celebrate === 'function') celebrate(true, '¡Logrado!');
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
      const sun = document.getElementById('drill-sun'), full = V.drillLog.timer * 60;
      if (sun && full > 0) { const e = (full - V.drillLog.secs) / full; sun.style.left = (8 + e * 84).toFixed(1) + '%'; sun.style.top = (82 - Math.sin(e * Math.PI) * 66).toFixed(1) + '%'; }
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
  'feed-card'(d) {
    const id = d.id || '';
    if (id.indexOf('me-') === 0) { V.detail = id.slice(3); V.delArm = null; V.justFinished = null; V.roundAI = null; go('detalle'); return; }
    V.feedCard = id; go('feedcard');
  },
  'friend-soon'() { alert('Agregar amigos de otros dispositivos llegará con las cuentas en la nube (backend). Por ahora puedes invitarlos a una Party con el código.'); },
  'invite-wa'() {
    const u = cur();
    const link = 'https://parfectapp.github.io/parfect/' + (u && u.id ? '?ref=' + encodeURIComponent(u.id) : '');
    const msg = `¡Juega golf conmigo en PARFECT! 🏌️⛳️ Anota tus rondas, mídete con tus amigos y la IA te dice qué mejorar. Únete con mi link:`;
    shareWA(msg, link);
  },
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
  if (e.key !== 'Enter') return;
  if (e.target && e.target.id === 'chat-text') { e.preventDefault(); actions['chat-send'](); return; }
  if (cur()) return;
  if (V.view === 'login') { e.preventDefault(); actions.login(); }
  else if (V.view === 'signup' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); actions.signup(); }
});

render();

/* ---- arranque: sync de party activa + service worker (solo producción) ---- */
(() => {
  if (typeof Cloud !== 'undefined' && Cloud.enabled()) Cloud.restore();
  const p = S.parties.find(x => x.id === S.activeParty);
  if (p && p.status !== 'done' && p.status !== 'cancelled') Sync.watch(p.code);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
