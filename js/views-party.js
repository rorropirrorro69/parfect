/* ============ Parfect Party: setup, lobby, juego en vivo, liquidación ============ */

const activeParty = () => S.parties.find(p => p.id === S.activeParty) || null;

/** Commit que además versiona y publica la party a los demás dispositivos */
function pcommit(p) {
  if (p) { p.rev = (p.rev || 0) + 1; p.ts = Date.now(); }
  commit();
  if (p) Sync.publish(p);
}

function syncBadge() {
  if (!Sync.available()) return '';
  const st = Sync.status();
  const txt = st === 'on' ? 'en vivo' : st === 'connecting' ? 'conectando…' : 'sin conexión';
  return `<span class="sync-badge ${st === 'on' ? 'on' : ''}">● ${txt}</span>`;
}
const partyById = id => S.parties.find(p => p.id === id) || null;
const plName = (party, pid) => {
  const pl = party.players.find(x => x.pid === pid);
  return pl ? pl.name : '—';
};

/* ---------- Setup ---------- */
function vPartySetup() {
  const d = V.partyDraft;
  const cid = d.courseId || 'campestre';
  const sname = id => COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
  const selGames = Object.keys(d.games).filter(k => d.games[k] && ['medal', 'match', 'corta'].includes(k));
  const courseCards = COURSE_ORDER.map(id => {
    const c = COURSES[id]; const on = cid === id; const nh = Math.min(c.holes.length, 18); const par = c.holes.slice(0, nh).reduce((a, h) => a + h.par, 0);
    return `<button class="su-course ${on ? 'on' : ''}" data-act="pd-pick-course" data-c="${id}">
      <span class="su-c-info"><b>${esc(sname(id))}</b><span>${nh} hoyos · Par ${par}</span></span>
      <span class="su-c-check">${on ? '✓' : ''}</span>
    </button>`;
  }).join('');
  const gmeta = { medal: { ic: 'trophy', tag: 'Clásico' }, match: { ic: 'flag', tag: 'Hoyo a hoyo' }, corta: { ic: 'card', tag: 'Por unidad' } };
  const gameCards = Object.entries(Party.GAMES).filter(([k]) => ['medal', 'match', 'corta'].includes(k)).map(([k, g]) => `
    <button class="pg-card ${d.games[k] ? 'on' : ''}" data-act="pd-game" data-g="${k}">
      <span class="pg-ic">${golfIcon(gmeta[k].ic)}</span>
      <div class="pg-tx"><b>${g.name} <i class="pg-tag">${gmeta[k].tag}</i></b><p>${g.desc}</p></div>
      <span class="pg-check">${d.games[k] ? '✓' : ''}</span>
    </button>`).join('');
  const gLabel = { medal: 'Medal', match: 'Match play', corta: 'La corta' };
  const boteDesc = (g, v) => !v ? 'Solo por honor' : g === 'corta' ? `$${v} por unidad de diferencia` : g === 'match' ? `$${v} · el que pierde paga` : `$${v} al ganador`;
  const boteRows = selGames.map(g => {
    const v = (d.stakes && d.stakes[g]) || 0;
    return `<div class="bote-row">
      <div class="bote-row-l"><b>${gLabel[g]}</b><span>${boteDesc(g, v)}</span></div>
      <div class="su-stakestep"><button data-act="pd-bote-adj" data-g="${g}" data-d="-1" aria-label="Menos">−</button><b>${v ? '$' + v : 'Honor'}</b><button data-act="pd-bote-adj" data-g="${g}" data-d="1" aria-label="Más">+</button></div>
    </div>`;
  }).join('');
  return `<div class="shell no-nav fade-in">
    <button class="auth-back" data-act="nav" data-view="social">← Social</button>
    <div class="su-hero2 party-hero su-hero-course">
      <div class="su-hero2-txt">
        <span class="su-hero-tag">${golfIcon('flag')} Programar tee time</span>
        <h1 class="su-hero-h">Tu tee time con amigos</h1>
        <p class="su-hero-sub">${esc(sname(cid))} · ${Math.min(COURSES[cid].holes.length, 18)} hoyos</p>
      </div>
      <div class="su-hero2-art">${courseCrest(cid)}</div>
    </div>
    <div class="su-block">
      <span class="su-lab">Día y hora del tee time</span>
      <div class="tt-row">
        <input class="tt-in" type="date" value="${esc(d.date || '')}" oninput="V.partyDraft.date=this.value">
        <input class="tt-in" type="time" value="${esc(d.time || '08:00')}" oninput="V.partyDraft.time=this.value">
      </div>
    </div>
    <div class="su-block">
      <span class="su-lab">Campo</span>
      <div class="su-courses">${courseCards}</div>
    </div>
    <div class="su-block">
      <span class="su-lab">Juego de la party · elige uno o varios</span>
      <div class="party-games">${gameCards}</div>
    </div>
    ${selGames.length ? `<div class="su-block">
      <span class="su-lab">Bote por modalidad (opcional)</span>
      <div class="bote-list">${boteRows}</div>
      <p class="su-meta">Cada modalidad lleva su propio bote, separado. Se liquida solo al terminar y puedes pagar con <b class="lime">Apple Pay</b>.</p>
    </div>
    <div class="su-block">
      <span class="su-lab">Ventajas por hándicap</span>
      <button class="pg-card net-card ${d.useNet ? 'on' : ''}" data-act="pd-net">
        <span class="pg-ic">${golfIcon('medal')}</span>
        <div class="pg-tx"><b>Confirmar ventajas (net)</b><p>Da golpes de ventaja por jugador según su hándicap. Medal, Match y La corta se juegan con score neto. Ajustas los golpes de cada quien en el lobby.</p></div>
        <span class="pg-check">${d.useNet ? '✓' : ''}</span>
      </button>
    </div>` : ''}
    <button class="btn primary big su-go" data-act="party-create" ${selGames.length ? '' : 'disabled'}>${golfIcon('flag')} ${selGames.length ? 'Programar tee time →' : 'Elige al menos un juego'}</button>
  </div>`;
}

/* bote de una modalidad (con respaldo al monto único de parties viejas) */
function partyStake(p, g) { return p && p.stakes ? (Number(p.stakes[g]) || 0) : (Number(p && p.stake) || 0); }
function partyAnyBote(p) { return (p && p.stakes && Object.values(p.stakes).some(v => v > 0)) || Number(p && p.stake) > 0; }

/* Panel del bote — cada modalidad con su monto, arriba al comenzar */
function vBetPanel(p) {
  const games = Object.entries(p.games).filter(([, v]) => v).map(([k]) => k);
  const chip = k => { const v = partyStake(p, k); return `<span class="bet-chip">${esc(Party.GAMES[k].name)}${v ? ` · $${v}` : ''}</span>`; };
  return `<div class="bet-panel">
    <div class="bet-head"><span class="bet-tag">${golfIcon('card')} El bote por modalidad</span><span class="bet-players">${p.players.length} jugador${p.players.length !== 1 ? 'es' : ''}</span></div>
    <div class="bet-games">${games.length ? games.map(chip).join('') : '<span class="bet-chip">Sin juego</span>'}</div>
    <p class="bet-note">${golfIcon('flag')} Tee time ${fmtDate(p.date)}${p.time ? ` · ${esc(p.time)}` : ''}</p>
    ${partyAnyBote(p) ? `<p class="bet-note">Cada modalidad lleva su propio bote · se liquida al final con Apple Pay.</p>` : `<p class="bet-note">Sin bote — se juega por honor y para presumir.</p>`}
  </div>`;
}

/* ---------- Lobby ---------- */
function vPartyLobby() {
  const p = activeParty();
  if (!p || p.status === 'cancelled') { S.activeParty = null; V.view = 'social'; return vShell(vSocial()); }
  const u = cur();
  const inAccounts = new Set(p.players.map(x => x.userId).filter(Boolean));
  const otherAccounts = S.users.filter(x => !inAccounts.has(x.id));
  const gamesOn = Object.entries(p.games).filter(([, v]) => v).map(([k]) => Party.GAMES[k].name);
  return `<div class="shell no-nav fade-in">
    <button class="auth-back" data-act="party-exit">← Guardar y salir</button>
    <h1 class="auth-h">Lobby de la party</h1>
    ${vBetPanel(p)}
    <div class="code-box">
      <span class="label">Código para unirse</span> ${syncBadge()}
      <div class="code">${esc(p.code)}</div>
      <p class="note" style="text-align:center">Tus amigos abren PARFECT en su teléfono → Social → "Unirse con código".</p>
    </div>
    <div class="card">
      <span class="label">${esc(p.course)} · ${p.holesCount} hoyos</span>
      <p class="small muted">${gamesOn.join(' · ') || 'Sin juego seleccionado'}</p>
    </div>
    <div class="card">
      <span class="label">Jugadores (${p.players.length})</span>
      ${p.players.map(pl => `<div class="pl-row">
        <span class="rank">${esc(initials(pl.name))}</span>
        <div class="r-main" style="flex:1"><b>${esc(pl.name)}${pl.userId === u.id ? ' (tú)' : ''}</b>
          <span>${pl.device && pl.device !== DEVICE_ID ? 'Otro dispositivo' : pl.userId ? 'Cuenta del dispositivo' : 'Invitado'}${pl.pid === p.hostPid ? ' · organiza' : ''}</span></div>
        ${p.useNet ? `<div class="stepper sm">
          <button data-act="party-strokes" data-pid="${pl.pid}" data-d="-1">−</button>
          <span class="pl-score" style="font-size:16px">${pl.strokes || 0}</span>
          <button data-act="party-strokes" data-pid="${pl.pid}" data-d="1">+</button>
        </div>` : ''}
        ${pl.pid !== p.hostPid ? `<button class="pl-x" data-act="party-remove" data-pid="${pl.pid}">✕</button>` : ''}
      </div>`).join('')}
      ${p.useNet ? `<p class="note">Los números son golpes de ventaja (hándicap de juego) por jugador.</p>` : ''}
      ${otherAccounts.length ? `<p class="note" style="margin-bottom:6px">Añadir cuentas de este dispositivo:</p>
        <div class="chips">${otherAccounts.map(a => `<button class="chip sm" data-act="party-add-account" data-id="${a.id}">+ ${esc(a.name.split(' ')[0])}</button>`).join('')}</div>` : ''}
      <div class="field" style="margin-top:12px"><label>Invitado sin cuenta</label>
        <div class="join-row">
          <input id="pa-guest" placeholder="Nombre del invitado">
          <button class="btn sm ghost" data-act="party-add-guest">Añadir</button>
        </div></div>
    </div>
    ${V.err ? `<p class="form-err">${esc(V.err)}</p>` : ''}
    <button class="btn primary" data-act="party-start" ${p.players.length >= 2 ? '' : 'disabled'}>
      ${p.players.length >= 2 ? 'Comenzar party →' : 'Se necesitan al menos 2 jugadores'}</button>
    <button class="btn danger" data-act="party-cancel">${V.delArm === p.id ? '¿Seguro? Toca otra vez para cancelar' : 'Cancelar party'}</button>
  </div>`;
}

/* ---------- Juego en vivo ---------- */
/* fila de chips para captura por jugador (formato ronda solo) */
function pchipRow(items, key, current, pid) {
  return `<div class="chips">` + items.map(([v, label]) =>
    `<button class="chip ${String(current) === String(v) ? 'on' : ''}" data-act="pa-cap" data-k="${key}" data-pid="${pid}" data-v="${v}">${label}</button>`
  ).join('') + `</div>`;
}
/* objeto de captura por jugador en un hoyo (mismo formato que la ronda solo) */
function pcap(h, pid, par) {
  h.cap = h.cap || {};
  if (!h.cap[pid]) h.cap[pid] = { par, tee: null, app: null, upDown: null, putts: null, dist: null, score: null, touched: false };
  h.cap[pid].par = par;
  return h.cap[pid];
}
/* sincroniza la captura del jugador hacia las estructuras que leen los juegos */
function psync(h, pid) {
  const c = h.cap[pid];
  const auto = suggestScore(c);
  c.score = (c.touched && c.score != null) ? c.score : (auto != null ? auto : c.par);
  h.scores[pid] = c.score;
  h.putts = h.putts || {};
  if (c.putts != null) h.putts[pid] = c.putts;
  const setArr = (arr, on) => { const a = h[arr] = h[arr] || []; const i = a.indexOf(pid); if (on && i < 0) a.push(pid); else if (!on && i >= 0) a.splice(i, 1); };
  setArr('fw', c.tee === 'fw');
  setArr('gir', c.app === 'gir');
  setArr('ud', c.upDown === true);
}

/* marcador de La corta siempre visible en el room */
function vCortaBar(p, idx) {
  if (!p.games.corta) return '';
  const net = Party.unidades(p, idx);
  const order = p.players.slice().sort((a, b) => net[b.pid] - net[a.pid]);
  const stake = p.stake || 0;
  const cells = order.map((pl, i) => {
    const u = net[pl.pid];
    const lead = i === 0 && u > 0;
    return `<div class="c2-cell ${lead ? 'lead' : ''} ${u > 0 ? 'up' : u < 0 ? 'dn' : ''}">
      ${lead ? `<span class="c2-crown">${golfIcon('trophy')}</span>` : ''}
      <span class="c2-nm">${esc(pl.name.split(' ')[0])}</span>
      <b class="c2-u">${u > 0 ? '+' : ''}${u}</b>
      ${stake ? `<span class="c2-m">${u >= 0 ? '+' : '−'}$${Math.abs(u * stake)}</span>` : ''}
    </div>`;
  }).join('');
  return `<div class="corta2">
    <div class="corta2-h"><span class="corta2-t">${golfIcon('card')} La corta${stake ? ` · $${stake}/u` : ''}</span><button class="corta2-more" data-act="pa-money">Tabla →</button></div>
    <div class="corta2-row">${cells}</div>
  </div>`;
}

/* ---- Propiedad por dispositivo: cada quien controla su(s) jugador(es) ---- */
function pMyPlayers(p) { return p.players.filter(pl => !pl.device || pl.device === DEVICE_ID); }
function pIsMine(p, pid) { const pl = p.players.find(x => x.pid === pid); return !!pl && (!pl.device || pl.device === DEVICE_ID); }
function pScoreOf(h, pl) {
  const cc = h.cap && h.cap[pl.pid];
  if (cc) { const sg = suggestScore(cc); return cc.touched ? cc.score : sg; }
  return h.scores[pl.pid] != null ? h.scores[pl.pid] : null;
}

/* pajaritos volando para el resumen del hoyo (motion) */
function birdSky() {
  const b = (cls, d) => `<svg class="hs-bird ${cls}" style="animation-delay:${d}s" viewBox="0 0 24 12"><path d="M2 8 Q6 2 11 7 Q16 2 22 8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
  return b('b1', 0) + b('b2', 1.1) + b('b3', 2.3);
}

/* Por qué cada jugador sumó/restó en La corta este hoyo (desglose) */
function pHoleReasons(p, idx, pid) {
  const h = p.holes[idx];
  const played = p.players.filter(pl => h.scores[pl.pid] != null).map(pl => pl.pid);
  const r = [];
  const s = h.scores[pid];
  if (s != null) { const d = s - h.par; if (d <= -2) r.push({ t: 'Águila', good: true }); else if (d === -1) r.push({ t: 'Birdie', good: true }); }
  if (s != null && played.length >= 2) {
    const min = Math.min(...played.map(x => h.scores[x]));
    if (s === min && played.filter(x => h.scores[x] === min).length === 1) r.push({ t: 'Ganó el hoyo', good: true });
  }
  if ((h.sandy || []).includes(pid)) r.push({ t: 'Sandy', good: true });
  if ((h.holeout || []).includes(pid)) r.push({ t: 'Hole-out', good: true });
  const lp = (h.longputt && !Array.isArray(h.longputt)) ? (h.longputt[pid] || 0) : 0;
  if (lp) r.push({ t: lp > 1 ? `Bandera ×${lp}` : 'Bandera', good: true });
  if (h.reg && !Array.isArray(h.reg)) {
    const regs = played.map(x => [x, h.reg[x] || 0]).filter(([, v]) => v > 0);
    if (regs.length) { const min = Math.min(...regs.map(([, v]) => v)); const who = regs.filter(([, v]) => v === min); if (who.length === 1 && who[0][0] === pid) r.push({ t: 'Más cerca', good: true }); }
  }
  if ((h.threeputt || []).includes(pid)) r.push({ t: '3 putts', good: false });
  if ((h.espanol || []).includes(pid)) r.push({ t: 'Español', good: false });
  return r;
}

/* Resumen del hoyo: cómo quedó la apuesta + desglose + Continuar */
function vHoleSummary(p, idx) {
  const h = p.holes[idx];
  const before = Party.unidades(p, idx);
  const after = Party.unidades(p, idx + 1);
  const stake = p.stake || 0;
  const last = idx + 1 === p.holesCount;
  const rows = p.players.map(pl => ({
    pl, score: h.scores[pl.pid],
    delta: (after[pl.pid] || 0) - (before[pl.pid] || 0),
    total: after[pl.pid] || 0,
    reasons: p.games.corta ? pHoleReasons(p, idx, pl.pid) : [],
  })).sort((a, b) => (b.score != null) - (a.score != null) || (b.delta - a.delta) || ((a.score || 99) - (b.score || 99)));
  const badge = sc => sc == null ? '' : (sc - h.par <= -2 ? 'eagle' : sc - h.par === -1 ? 'bird' : sc - h.par === 0 ? 'par' : sc - h.par === 1 ? 'bog' : 'dbl');
  const list = rows.map(r => {
    const reasons = r.reasons.map(x => `<span class="hs-rea ${x.good ? 'g' : 'b'}">${x.good ? '+' : '−'} ${esc(x.t)}</span>`).join('');
    const side = p.games.corta
      ? `<div class="hs-side"><b class="hs-delta ${r.delta > 0 ? 'up' : r.delta < 0 ? 'dn' : 'ze'}">${r.delta > 0 ? '+' : ''}${r.delta}</b><span class="hs-tot">va ${r.total > 0 ? '+' : ''}${r.total}${stake ? ` · ${r.total >= 0 ? '+' : '−'}$${Math.abs(r.total * stake)}` : ''}</span></div>`
      : '';
    return `<div class="hs-row">
      <span class="hs-bdg ${badge(r.score)}">${r.score != null ? r.score : '–'}</span>
      <div class="hs-mid"><b>${esc(r.pl.name.split(' ')[0])}</b><span class="hs-rel">${r.score != null ? relScore(r.score - h.par) : 'sin score'}</span>${reasons ? `<div class="hs-reas">${reasons}</div>` : ''}</div>
      ${side}
    </div>`;
  }).join('');
  let statusLine = '';
  if (p.games.match) { const msx = Party.matchStatus(p, idx + 1); if (msx) statusLine = msx.is2p ? (msx.up === 0 ? 'Match igualado' : `${esc(plName(p, msx.leader).split(' ')[0])} ${msx.decided ? 'gana' : 'va'} ${msx.text}`) : msx.text; }
  else if (p.games.medal && !p.games.corta) { const stt = Party.standings(p, idx + 1).filter(x => x.holes); if (stt.length) statusLine = `${esc(stt[0].name.split(' ')[0])} lidera ${fmtToPar(stt[0].toPar)}`; }
  return `<div class="card hs-card pop3d">
    <div class="hs-birds">${birdSky()}</div>
    <div class="hs-head"><span class="hs-h">${golfIcon('flag')} Hoyo ${idx + 1} cerrado</span><span class="hs-par">Par ${h.par}</span></div>
    <p class="hs-sub">${p.games.corta ? `${golfIcon('card')} Así quedó La corta este hoyo` : 'Resultado del hoyo'}</p>
    <div class="hs-list">${list}</div>
    ${statusLine ? `<p class="hs-status">${statusLine}</p>` : ''}
    ${(() => { const pend = p.players.filter(pl => h.scores[pl.pid] == null); return pend.length ? `<p class="hs-status" style="opacity:.8">${esc(pend.map(pl => pl.name.split(' ')[0]).join(', '))} sigue${pend.length > 1 ? 'n' : ''} registrando · avanza a tu ritmo</p>` : ''; })()}
    <button class="btn primary big hs-go" data-act="${last ? 'pa-finish' : 'pa-next'}">${last ? 'Finalizar party →' : 'Continuar al hoyo ' + (idx + 2) + ' →'}</button>
    <button class="hs-edit" data-act="pa-edit-hole">← Corregir mi hoyo</button>
  </div>`;
}

/* Tarjeta de solo-lectura del hoyo de un amigo (lo controla él) */
function pReadOnlyCard(p, h, pid) {
  const c = (h.cap && h.cap[pid]) || {};
  const score = pScoreOf(h, p.players.find(x => x.pid === pid));
  const done = h.done && h.done[pid];
  const pill = (lab, val) => `<div class="ro-pill"><span>${lab}</span><b>${val}</b></div>`;
  const tee = c.tee === 'fw' ? 'Calle' : c.tee === 'penal' ? 'OB' : c.tee ? 'Falló' : '—';
  const app = c.app === 'gir' ? 'GIR' : c.app ? 'Falló' : '—';
  const ud = c.upDown === true ? 'Sí' : c.upDown === false ? 'No' : '—';
  return `<div class="card ro-card">
    <div class="ro-head"><div class="ro-who">${avatarImg(p.players.find(x => x.pid === pid), 'mini')}<b>${esc(plName(p, pid).split(' ')[0])}</b></div>
      <span class="ro-state ${done ? 'done' : ''}">${done ? '✓ Terminó' : '⏺ Registrando…'}</span></div>
    <div class="ro-grid">${h.par >= 4 ? pill('Calle', tee) : ''}${pill('Green', app)}${c.app && c.app !== 'gir' ? pill('Up&D', ud) : ''}${pill('Putts', c.putts != null ? c.putts : '—')}${pill('Score', score != null ? score : '—')}</div>
    <p class="ro-note">Solo ${esc(plName(p, pid).split(' ')[0])} puede editar su hoyo desde su teléfono.</p>
  </div>`;
}

/* hoyo actual de ESTE dispositivo: cada quien avanza a su ritmo (no espera a los demás) */
function pCurIdx(p) {
  if (V.pIdx == null || V.pIdx < 0 || V.pIdx >= p.holesCount) {
    V.pIdx = Math.min(Math.max(0, p.idx || 0), p.holesCount - 1);
  }
  if (!p.holes[V.pIdx]) p.holes[V.pIdx] = makeHoleForParty(p, V.pIdx);
  return V.pIdx;
}

function vPartyLive() {
  const p = activeParty();
  if (!p || p.status === 'cancelled') { S.activeParty = null; V.view = 'social'; return vShell(vSocial()); }
  if (p.status === 'done') { V.partyView = p.id; return vPartyDone(); }
  p.idx = pCurIdx(p);   // hoyo local de este dispositivo
  if (V.pSeenIdx !== p.idx) { V.pWizStep = null; V.pSeenIdx = p.idx; }
  const h = p.holes[p.idx];
  h.done = h.done || {};
  const chole = partyHole(p, p.idx);
  const ms = p.games.match ? Party.matchStatus(p, p.idx) : null;
  const last = p.idx + 1 === p.holesCount;

  const myPlayers = pMyPlayers(p);
  const doneCount = p.players.filter(pl => h.done[pl.pid]).length;
  const allDone = doneCount === p.players.length;
  const myAllDone = myPlayers.length > 0 && myPlayers.every(pl => h.done[pl.pid]);
  const pendingNames = p.players.filter(pl => !h.done[pl.pid]).map(pl => pl.name.split(' ')[0]);

  let ap = (V.capPid && p.players.some(x => x.pid === V.capPid)) ? V.capPid : (myPlayers[0] || p.players[0]).pid;
  const apl = p.players.find(x => x.pid === ap);
  const mine = pIsMine(p, ap);
  const scoreOf = pl => pScoreOf(h, pl);

  const header = `<div class="shell no-nav fade-in">
    <div class="play-top">
      <button class="x" data-act="party-exit">✕ Salir</button>
      <span class="label">Party ${esc(p.code)} ${syncBadge()}</span>
      <span class="small muted">${p.idx + 1}/${p.holesCount}</span>
    </div>
    <div class="progress"><i style="width:${(p.idx / p.holesCount) * 100}%"></i></div>
    <div class="hole-head"><span class="hnum">Hoyo ${p.idx + 1}</span>
      <span class="hof">Par ${h.par}${chole && chole.yds ? ` · ${chole.yds} yds` : ''}${ms ? ` · ${ms.text}` : ''}</span></div>
    ${vCortaBar(p, p.idx)}`;

  /* selector de jugadores: ✓ listo / 👁 ver al amigo */
  const playerChips = `<div class="group">
      <div class="g-lab"><span class="label">Jugadores</span><span class="small muted">${doneCount}/${p.players.length} listos</span></div>
      <div class="chips pa-players">${p.players.map(pl => {
    const isDone = !!h.done[pl.pid]; const own = pIsMine(p, pl.pid); const sc = scoreOf(pl);
    return `<button class="chip ${pl.pid === ap ? 'on' : ''} ${isDone ? 'pdone' : ''}" data-act="pa-player" data-pid="${pl.pid}">${isDone ? '✓ ' : own ? '' : '👁 '}${esc(pl.name.split(' ')[0])}${sc != null && (isDone || !own) ? ` · ${sc}` : own ? ' (tú)' : ''}</button>`;
  }).join('')}</div>
    </div>`;

  /* barra de progreso de "listos" */
  const progressBar = `<div class="pa-prog">
      <div class="pa-prog-bar"><i style="width:${(doneCount / p.players.length) * 100}%"></i></div>
      <span>${myAllDone && !allDone ? `Esperando a ${pendingNames.join(', ')}…` : `${doneCount} de ${p.players.length} terminaron${pendingNames.length ? ' · faltan ' + pendingNames.join(', ') : ''}`}</span>
    </div>`;

  /* ---- modo RESUMEN (cuando TÚ terminas tu hoyo; no esperas a los demás) ---- */
  if (myAllDone) {
    return `${header}
    ${vHoleSummary(p, p.idx)}
    <div class="card" style="margin-top:14px">
      <span class="label">Tarjeta</span>
      ${scorecardTable(p.holesCount,
      i => (p.holes[i] ? p.holes[i].par : (partyHole(p, i) ? partyHole(p, i).par : Stats.PAR_SEQ[i % 18])),
      p.players.map(pl => ({ name: pl.name.split(' ')[0], scoreOf: i => (p.holes[i] ? p.holes[i].scores[pl.pid] : null) })),
      p.idx)}
    </div>
    ${V.showMoney ? `<div class="overlay" data-act="pa-money-close"><div class="sheet" data-act="noop">
      <div class="grab"></div><h2>${golfIcon('card')} Tabla en vivo</h2>
      ${p.games.corta ? vCortaBar(p, p.idx) : ''}${vPartyTable(p, p.idx)}
      <button class="btn" data-act="pa-money-close">Cerrar</button>
    </div></div>` : ''}
  </div>`;
  }

  /* ---- modo CAPTURA ---- */
  const curScore = scoreOf(apl);
  const curDone = !!h.done[ap];
  let capBody;
  if (!mine) {
    capBody = pReadOnlyCard(p, h, ap);
  } else {
    const c = pcap(h, ap, h.par);
    const sugg = suggestScore(c);
    const score = c.touched ? c.score : sugg;
    const has = (k) => (h[k] || []).includes(ap);
    const reg = (h.reg && h.reg[ap]) || 0;
    const lpv = (h.longputt && h.longputt[ap]) || 0;
    const gir = c.app === 'gir';
    const scoreCls = score == null ? '' : (score - h.par <= -1 ? 'good' : score - h.par === 0 ? 'par' : score - h.par === 1 ? 'over' : 'bad');
    const nm = esc(apl.name.split(' ')[0]);
    const steps = partySteps(c, h.par);
    const curK = (V.pWizStep && steps.includes(V.pWizStep)) ? V.pWizStep : partyDerived(c, h.par);
    const tabLab = { tee: 'Calle', app: 'Green', ud: 'Up&D', putts: 'Putts', score: 'Score' };
    const ansOf = k => k === 'tee' ? (c.tee === 'fw' ? 'Sí' : c.tee === 'penal' ? 'OB' : c.tee ? 'No' : null)
      : k === 'app' ? (c.app === 'gir' ? 'Sí' : c.app ? 'No' : null)
        : k === 'ud' ? (c.upDown === true ? 'Sí' : c.upDown === false ? 'No' : null)
          : k === 'putts' ? (c.putts != null ? c.putts + 'p' : null)
            : (score != null ? String(score) : null);
    const tabs = steps.map(s => `<button class="wz-tab ${s === curK ? 'on' : ''} ${ansOf(s) != null ? 'ans' : ''}" data-act="pa-wiz-tab" data-s="${s}"><span>${tabLab[s]}</span><b>${ansOf(s) || '·'}</b></button>`).join('');
    const yn = (scene, onYes, onNo, yesAttr, noAttr, q, extra) => `<h3 class="wz-q">${q}</h3><div class="wz-art">${chkScene(scene, onYes)}</div><div class="wz-yn"><button class="wz-opt yes ${onYes ? 'on' : ''}" data-act="pa-fast" ${yesAttr}>Sí</button><button class="wz-opt no ${onNo ? 'on' : ''}" data-act="pa-fast" ${noAttr}>No</button></div>${extra || ''}`;
    const penPill = `<div class="wz-extra"><button class="wz-pen ${c.tee === 'penal' ? 'on' : ''}" data-act="pa-pen" data-pid="${ap}">${c.tee === 'penal' ? '✓ ' : ''}Penalti / OB</button></div>`;
    let body;
    if (curK === 'tee') body = yn('fw', c.tee === 'fw', !!c.tee && c.tee !== 'fw' && c.tee !== 'penal', `data-pid="${ap}" data-k="tee" data-v="fw"`, `data-pid="${ap}" data-k="tee" data-v="rough"`, `¿${nm} pegó a la calle?`, penPill);
    else if (curK === 'app') body = yn('gir', gir, !!c.app && !gir, `data-pid="${ap}" data-k="app" data-v="gir"`, `data-pid="${ap}" data-k="app" data-v="miss"`, '¿Green en regulación?', h.par === 3 ? penPill : '');
    else if (curK === 'ud') body = yn('ud', c.upDown === true, c.upDown === false, `data-pid="${ap}" data-k="ud" data-v="si"`, `data-pid="${ap}" data-k="ud" data-v="no"`, '¿Salvó el par? (up &amp; down)');
    else if (curK === 'putts') { const opts = c.upDown === true ? [[0, '0'], [1, '1']] : [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']]; body = `<h3 class="wz-q">¿Cuántos putts?</h3><div class="wz-putts ${opts.length === 2 ? 'wz-putts2' : ''}">${opts.map(([v, l]) => `<button class="wz-putt ${c.putts === v ? 'on' : ''}" data-act="pa-fast" data-pid="${ap}" data-k="putts" data-v="${v}">${l}</button>`).join('')}</div>`; }
    else body = `<h3 class="wz-q">Score de ${nm}</h3><div class="wz-scorebox ${scoreCls}"><span class="sc-num">${score != null ? score : '–'}</span><span class="sc-rel">${score != null ? relScore(score - h.par) : ''}</span><div class="stepper"><button data-act="pa-cap-score" data-pid="${ap}" data-d="-1">−</button><button data-act="pa-cap-score" data-pid="${ap}" data-d="1">+</button></div></div>`;
    const ci = steps.indexOf(curK);
    capBody = `<div class="card wz">
      <div class="wz-tabs">${tabs}</div>
      <div class="wz-body">${body}</div>
      ${ci > 0 ? `<button class="wz-back" data-act="pa-wiz-back">← Atrás</button>` : ''}
    </div>
    ${p.games.corta ? `<div class="card cx">
      <span class="label">La corta · extras de ${nm}</span>
      <div class="cx-grid">
        <button class="cx-btn ${has('sandy') ? 'on' : ''}" data-act="pa-sandy" data-pid="${ap}"><span class="cx-lab">Sandy</span><span class="cx-val pos">+1</span></button>
        <button class="cx-btn ${has('holeout') ? 'on' : ''}" data-act="pa-holeout" data-pid="${ap}"><span class="cx-lab">Hole-out</span><span class="cx-val pos">+1</span></button>
        <div class="cx-step"><span class="cx-lab">Más cerca <i>reg</i></span><div class="cx-ctrl"><button class="ph-pbtn" data-act="pa-reg" data-pid="${ap}" data-d="-1">−</button><b>${reg || 0}</b><button class="ph-pbtn" data-act="pa-reg" data-pid="${ap}" data-d="1">+</button></div></div>
        <div class="cx-step"><span class="cx-lab">Banderas <i>putt largo</i></span><div class="cx-ctrl"><button class="ph-pbtn" data-act="pa-longputt" data-pid="${ap}" data-d="-1">−</button><b>${lpv}</b><button class="ph-pbtn" data-act="pa-longputt" data-pid="${ap}" data-d="1">+</button></div></div>
        <button class="cx-btn neg ${has('threeputt') ? 'on' : ''}" data-act="pa-3putt" data-pid="${ap}"><span class="cx-lab">3-putt</span><span class="cx-val neg">−1</span></button>
        <button class="cx-btn neg ${has('espanol') ? 'on' : ''}" data-act="pa-espanol" data-pid="${ap}"><span class="cx-lab">Español</span><span class="cx-val neg">−1</span></button>
      </div>
    </div>` : ''}`;
  }

  const readyBlock = mine
    ? `<button class="btn primary big pa-ready ${curDone ? 'is-done' : ''}" data-act="pa-ready" data-pid="${ap}" ${curScore == null ? 'disabled' : ''}>${curDone ? '✓ Terminaste · toca para editar' : (curScore == null ? 'Registra tu score para terminar' : 'Terminé mi hoyo ✓')}</button>`
    : `<div class="pa-watch">${golfIcon('flag')} Viendo a <b>${esc(apl.name.split(' ')[0])}</b> · él controla su registro</div>`;

  return `${header}
    ${playerChips}
    ${capBody}
    ${readyBlock}
    ${progressBar}
    <button class="btn ghost" data-act="pa-money">${golfIcon('card')} Ver tabla</button>
    ${p.idx > 0 ? `<button class="pa-prevlink" data-act="pa-prev">← Hoyo anterior</button>` : ''}
    <div class="card" style="margin-top:14px">
      <span class="label">Tarjeta</span>
      ${scorecardTable(p.holesCount,
    i => (p.holes[i] ? p.holes[i].par : (partyHole(p, i) ? partyHole(p, i).par : Stats.PAR_SEQ[i % 18])),
    p.players.map(pl => ({ name: pl.name.split(' ')[0], scoreOf: i => (p.holes[i] ? p.holes[i].scores[pl.pid] : null) })),
    p.idx)}
    </div>
    ${V.showMoney ? `<div class="overlay" data-act="pa-money-close"><div class="sheet" data-act="noop">
      <div class="grab"></div><h2>${golfIcon('card')} Tabla en vivo</h2>
      ${p.games.corta ? vCortaBar(p, p.idx) : ''}${vPartyTable(p, p.idx)}
      <button class="btn" data-act="pa-money-close">Seguir jugando</button>
    </div></div>` : ''}
  </div>`;
}

/* ---------- Tabla de posiciones (Medal / Match) ---------- */
function vPartyTable(p, limit) {
  let out = '';
  if (p.games.corta) {
    const net = Party.unidades(p, limit);
    const stake = Number(p.stake) || 0;
    const order = p.players.slice().sort((a, b) => net[b.pid] - net[a.pid]);
    out += `<div class="sec-h" style="margin-top:4px"><h2 style="font-size:15px">La corta</h2><span class="small muted">${stake ? `$${stake} por unidad` : 'cada quien vs cada quien'}</span></div>`;
    out += order.map((pl, i) => {
      const u = net[pl.pid];
      return `<div class="pl-row">
      <span class="rank">${i + 1}</span>
      <div class="r-main" style="flex:1"><b>${esc(pl.name)}</b>${stake ? `<span>${u >= 0 ? 'cobra' : 'paga'} $${Math.abs(u * stake)}</span>` : ''}</div>
      <div class="r-side"><b style="color:${u >= 0 ? '#3aa055' : 'var(--danger)'}">${u >= 0 ? '+' : ''}${u}</b><span>unidades</span></div>
    </div>`;
    }).join('');
  }
  if (p.games.match) {
    const ms = Party.matchStatus(p, limit);
    const order = p.players.slice().sort((a, b) => ms.won[b.pid] - ms.won[a.pid]);
    out += `<div class="sec-h" style="margin-top:14px"><h2 style="font-size:15px">Match play</h2></div>`;
    if (ms.is2p) out += ms.up === 0
      ? `<p class="tip">Match igualado tras ${ms.played} hoyos.</p>`
      : `<p class="tip"><b>${esc(plName(p, ms.leader).split(' ')[0])}</b> ${ms.decided ? `gana ${ms.text}` : `va ${ms.text}`} (${ms.wa}–${ms.wb})</p>`;
    out += order.map((pl, i) => `<div class="pl-row">
      <span class="rank">${ms.won[pl.pid] > 0 ? i + 1 : '–'}</span>
      <div class="r-main" style="flex:1"><b>${esc(pl.name)}</b><span>${ms.played} hoyos</span></div>
      <div class="r-side"><b>${ms.won[pl.pid]}</b><span>ganados</span></div>
    </div>`).join('');
  }
  if (p.games.medal || (!p.games.match && !p.games.corta)) {
    const st = Party.standings(p, limit);
    out += `<div class="sec-h" style="margin-top:14px"><h2 style="font-size:15px">Medal</h2></div>`;
    out += st.map((r, i) => `<div class="pl-row">
      <span class="rank">${r.holes ? i + 1 : '–'}</span>
      <div class="r-main" style="flex:1"><b>${esc(r.name)}</b><span>${r.holes ? `${r.holes} hoyos${p.useNet ? ` · bruto ${r.gross}` : ''}` : 'sin scores'}</span></div>
      <div class="r-side"><b>${r.holes ? r.shown : '—'}</b><span>${r.holes ? fmtToPar(r.toPar) : ''}</span></div>
    </div>`).join('');
  }
  return out;
}

function vPartyDone() {
  const p = partyById(V.partyView) || activeParty();
  if (!p) { V.view = 'social'; return vShell(vSocial()); }
  const st = Party.standings(p);
  const ms = p.games.match ? Party.matchStatus(p) : null;
  let winnerPid = null, sub = '';
  if (ms && ms.leaderWon > ms.runnerWon) {
    winnerPid = ms.leader;
    sub = ms.is2p ? `gana el match ${ms.text} (${ms.wa}–${ms.wb})` : `gana con ${ms.leaderWon} hoyos`;
  } else if (ms) {
    sub = 'match empatado';
  } else if (p.games.corta && !p.games.medal) {
    const net = Party.unidades(p);
    const order = p.players.slice().sort((a, b) => net[b.pid] - net[a.pid]);
    if (order.length && (!order[1] || net[order[0].pid] !== net[order[1].pid])) { winnerPid = order[0].pid; sub = `gana La corta con +${net[order[0].pid]}`; }
    else sub = 'empate en La corta';
  } else {
    const played = st.filter(r => r.holes);
    if (played.length && !(played[1] && played[1].toPar === played[0].toPar)) { winnerPid = played[0].pid; sub = `gana en Medal con ${fmtToPar(played[0].toPar)}`; }
    else if (played.length) sub = 'empate en el primer lugar';
  }
  const winName = winnerPid ? plName(p, winnerPid).split(' ')[0] : '—';
  return `<div class="shell no-nav fade-in">
    <div class="play-top"><span></span><span class="label">Party ${esc(p.code)} · final</span><span></span></div>
    <div class="greet" style="text-align:center">
      <p class="hi">${esc(p.course)} · ${fmtDate(p.date)}</p>
      <h1 style="font-size:34px">${golfIcon('trophy')} ${esc(winName)}</h1>
      <p class="hcp">${esc(sub)}</p>
    </div>
    <div class="card">${vPartyTable(p, p.holes.length)}</div>
    ${partyAnyBote(p) ? `<div class="card pay-card">
      <span class="label">${golfIcon('card')} Liquidar el bote</span>
      ${vPartySettle(p)}
      ${V.paid ? `<div class="pay-done">Pago enviado ✓ <span>demo</span></div>`
        : `<button class="applepay-btn" data-act="party-applepay"><span class="ap-logo">${appleMark()}</span> Pay · Pagar bote</button>`}
      <p class="su-meta" style="text-align:center;margin-top:8px">Pago seguro entre amigos. Cada quien liquida su parte.</p>
    </div>` : ''}
    <button class="btn primary" data-act="party-close-done">Listo ✓</button>
  </div>`;
}

/* mini logo de Apple para el botón de pago */
function appleMark() {
  return `<svg viewBox="0 0 16 18" width="13" height="15" aria-hidden="true"><path fill="currentColor" d="M13.1 13.6c-.3.7-.6 1.3-1.1 1.9-.6.8-1.1 1.4-1.6 1.7-.5.3-1 .5-1.5.5-.4 0-.9-.1-1.5-.3-.6-.2-1.1-.3-1.5-.3-.5 0-1 .1-1.6.3-.6.2-1 .3-1.4.3-.5 0-1-.2-1.5-.5-.5-.4-1-1-1.6-1.8C1.7 14.3 1 12.5 1 10.7c0-1.1.3-2.1.8-2.9.4-.6.9-1.1 1.6-1.5.6-.3 1.3-.5 2-.5.4 0 1 .1 1.7.4.7.2 1.1.4 1.3.4.1 0 .6-.2 1.5-.5.8-.3 1.5-.4 2.1-.3 1.5.1 2.7.7 3.4 1.8-1.4.8-2 2-2 3.5 0 1.2.4 2.1 1.3 2.9.4.4.8.6 1.3.8-.1.3-.2.6-.4.9zM10.6 1.2c0 .8-.3 1.6-.9 2.3-.7.8-1.6 1.3-2.5 1.2 0-.1 0-.2 0-.3 0-.8.3-1.6.9-2.3.3-.4.7-.6 1.2-.9.5-.2.9-.3 1.3-.4 0 .1 0 .3 0 .4z"/></svg>`;
}

/* desglose de quién cobra / paga (se adapta a la modalidad) */
function settleRow(name, money) {
  return `<div class="settle-row"><b>${esc(name)}</b><span class="settle-amt ${money >= 0 ? 'pos' : 'neg'}">${money >= 0 ? `cobra $${money}` : `paga $${Math.abs(money)}`}</span></div>`;
}
function vPartySettle(p) {
  if (!partyAnyBote(p)) return '';
  const led = Party.ledger(p);                 // suma el bote de cada modalidad (separados)
  return p.players.slice().sort((a, b) => (led.net[b.pid] || 0) - (led.net[a.pid] || 0))
    .map(pl => settleRow(plName(p, pl.pid).split(' ')[0], Math.round(led.net[pl.pid] || 0))).join('');
}

/* ---------- Acciones ---------- */
function partyHole(p, i) { return (p.courseId && COURSES[p.courseId] && COURSES[p.courseId].holes[i]) ? COURSES[p.courseId].holes[i] : null; }
function makeHoleForParty(p, i) {
  const ch = partyHole(p, i);
  const par = ch ? ch.par : Stats.PAR_SEQ[i % 18];
  return { par, scores: {}, putts: {}, cap: {}, done: {}, fw: [], gir: [], ud: [], sandy: [], holeout: [], threeputt: [], espanol: [], reg: {}, longputt: {} };
}

/* pasos del wizard de party (por jugador) */
function partySteps(c, par) {
  const s = []; if (par >= 4) s.push('tee'); s.push('app');
  if (c.app && c.app !== 'gir') s.push('ud');
  s.push('putts'); s.push('score'); return s;
}
function partyDerived(c, par) {
  if (par >= 4 && !c.tee) return 'tee';
  if (!c.app) return 'app';
  if (c.app !== 'gir' && c.upDown == null) return 'ud';
  if (c.putts == null) return 'putts';
  return 'score';
}

const partyActions = {
  'party-new'() {
    V.partyDraft = { courseId: 'campestre', date: new Date().toISOString().slice(0, 10), time: '08:00', useNet: false, stakes: { medal: 0, match: 0, corta: 0 }, games: { corta: false, skins: false, larga: false, gogo: false, birdie: false, medal: true, nassau: false, match: false } };
    go('party-setup');
  },
  'pd-bote-adj'(d) { const s = V.partyDraft.stakes || (V.partyDraft.stakes = { medal: 0, match: 0, corta: 0 }); s[d.g] = Math.max(0, Math.min(5000, (Number(s[d.g]) || 0) + Number(d.d) * 5)); render(); },
  'pd-pick-course'(d) { if (COURSES[d.c]) V.partyDraft.courseId = d.c; render(); },
  'pd-game'(d) { V.partyDraft.games[d.g] = !V.partyDraft.games[d.g]; render(); },   // multi-selección
  'pd-net'() { V.partyDraft.useNet = !V.partyDraft.useNet; render(); },
  'pd-stake'(d) { V.partyDraft.stake = Number(d.v) || 0; render(); },
  'pd-bet'(d) { V.partyDraft.stake = d.v === '1' ? (V.partyDraft.stake > 0 ? V.partyDraft.stake : 20) : 0; render(); },
  'pd-stake-adj'(d) { const cur = V.partyDraft.stake > 0 ? V.partyDraft.stake : 20; V.partyDraft.stake = Math.max(5, Math.min(2000, cur + Number(d.d) * 5)); render(); },
  'party-applepay'() { V.paid = true; render(); },
  'party-create'() {
    const d = V.partyDraft;
    const u = cur();
    const hostPid = Store.uid();
    const cid = (d.courseId && COURSES[d.courseId]) ? d.courseId : 'campestre';
    const party = {
      id: Store.uid(),
      code: Party.newCode(S.parties.map(x => x.code)),
      date: d.date || new Date().toISOString().slice(0, 10),
      time: d.time || '08:00',
      hostUserId: u.id, hostPid,
      course: COURSES[cid].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''),
      courseId: cid,
      holesCount: Math.min(COURSES[cid].holes.length, 18),
      games: { ...d.games },
      useNet: !!d.useNet,
      stakes: { ...(d.stakes || {}) },
      stake: Number((d.stakes && d.stakes.corta) || 0),
      players: [{ pid: hostPid, name: u.name, userId: u.id, strokes: 0, device: DEVICE_ID }],
      holes: [], idx: 0,
      status: 'setup',
      rev: 0, ts: Date.now(),
    };
    S.parties.push(party);
    S.activeParty = party.id;
    V.view = 'party-lobby'; V.err = null;
    pcommit(party); window.scrollTo(0, 0);
  },
  'party-add-account'(d) {
    const p = activeParty(); const a = S.users.find(x => x.id === d.id);
    if (!p || !a) return;
    p.players.push({ pid: Store.uid(), name: a.name, userId: a.id, strokes: 0, device: DEVICE_ID });
    pcommit(p);
  },
  'party-add-guest'() {
    const p = activeParty(); const name = val('pa-guest');
    if (!p) return;
    if (!name) { V.err = 'Escribe el nombre del invitado.'; render(); return; }
    p.players.push({ pid: Store.uid(), name, userId: null, strokes: 0, device: DEVICE_ID });
    V.err = null;
    pcommit(p);
  },
  'party-remove'(d) {
    const p = activeParty(); if (!p) return;
    p.players = p.players.filter(x => x.pid !== d.pid);
    pcommit(p);
  },
  'party-strokes'(d) {
    const p = activeParty(); if (!p) return;
    const pl = p.players.find(x => x.pid === d.pid); if (!pl) return;
    pl.strokes = Math.max(0, Math.min(36, (pl.strokes || 0) + Number(d.d)));
    pcommit(p);
  },
  'party-join'() {
    const code = val('join-code').toUpperCase().trim();
    if (!code) { V.err = 'Escribe el código de la party.'; render(); return; }
    const u = cur();
    const enter = (p) => {
      let mine = p.players.find(x => x.userId === u.id && x.device === DEVICE_ID) || p.players.find(x => x.userId === u.id && !x.device);
      if (!mine) {
        mine = { pid: Store.uid(), name: u.name, userId: u.id, strokes: 0, device: DEVICE_ID };
        p.players.push(mine);
      }
      S.activeParty = p.id;
      V.capPid = mine.pid; V.pIdx = null;
      Sync.watch(p.code);
      V.err = null; V.joining = false; V.view = p.status === 'live' ? 'party-live' : 'party-lobby';
      pcommit(p); window.scrollTo(0, 0);
    };
    const local = S.parties.find(x => x.code === code && x.status !== 'done' && x.status !== 'cancelled');
    if (local) { enter(local); return; }
    if (!Sync.available()) { V.err = 'No hay ninguna party activa con ese código en este dispositivo.'; render(); return; }
    V.joining = true; V.err = null; render();
    Sync.joinRemote(code, (remote) => {
      V.joining = false;
      if (!remote || remote.status === 'done' || remote.status === 'cancelled') {
        V.err = 'No se encontró una party activa con ese código. Revisa el código y que el organizador tenga conexión.';
        render(); return;
      }
      let p = S.parties.find(x => x.code === remote.code);
      if (p) Object.assign(p, remote); else { S.parties.push(remote); p = remote; }
      enter(p);
    });
  },
  'party-start'() {
    const p = activeParty();
    if (!p || p.players.length < 2) return;
    p.status = 'live';
    if (!p.holes.length) p.holes.push(makeHoleForParty(p, 0));
    V.capPid = p.players[0].pid; V.pIdx = 0;
    V.view = 'party-live';
    pcommit(p); window.scrollTo(0, 0);
  },
  'party-resume'() {
    const p = activeParty(); if (!p) return;
    V.pIdx = null;   // re-toma tu hoyo local al volver
    Sync.watch(p.code);
    V.view = p.status === 'live' ? 'party-live' : 'party-lobby';
    render(); window.scrollTo(0, 0);
  },
  'party-cancel'() {
    const p = activeParty(); if (!p) return;
    if (V.delArm !== p.id) { V.delArm = p.id; render(); return; }
    p.status = 'cancelled'; p.rev = (p.rev || 0) + 1; p.ts = Date.now();
    Sync.publish(p);
    S.parties = S.parties.filter(x => x.id !== p.id);
    S.activeParty = null; V.delArm = null; V.view = 'social';
    commit();
  },
  'party-exit'() { V.showMoney = false; V.pIdx = null; go('social'); },

  'pa-player'(d) { V.capPid = d.pid; V.pWizStep = null; render(); window.scrollTo(0, 0); },
  'pa-fast'(d) {
    const p = activeParty(); const h = p.holes[p.idx]; const c = pcap(h, d.pid, h.par);
    const k = d.k;
    if (k === 'tee') c.tee = d.v;
    else if (k === 'app') { c.app = d.v; if (d.v === 'gir') c.upDown = null; }
    else if (k === 'ud') c.upDown = (d.v === 'si');
    else if (k === 'putts') c.putts = Number(d.v);
    V.pWizStep = null; psync(h, d.pid); pcommit(p);
  },
  'pa-pen'(d) { const p = activeParty(); const h = p.holes[p.idx]; const c = pcap(h, d.pid, h.par); c.tee = (c.tee === 'penal') ? null : 'penal'; psync(h, d.pid); pcommit(p); },
  'pa-wiz-tab'(d) { V.pWizStep = d.s; render(); },
  'pa-wiz-back'() {
    const p = activeParty(); const h = p.holes[p.idx];
    const ap = (V.capPid && p.players.some(x => x.pid === V.capPid)) ? V.capPid : p.players[0].pid;
    const c = pcap(h, ap, h.par); const steps = partySteps(c, h.par);
    const curK = (V.pWizStep && steps.includes(V.pWizStep)) ? V.pWizStep : partyDerived(c, h.par);
    const i = steps.indexOf(curK); V.pWizStep = steps[Math.max(0, i - 1)]; render();
  },
  'pa-cap'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    const c = pcap(h, d.pid, h.par);
    const k = d.k; let v = d.v;
    if (k === 'putts') v = Number(v);
    if (k === 'upDown') v = (v === 'si');
    c[k] = (k !== 'upDown' && String(c[k]) === String(v)) ? null : v;   // re-toca = limpiar
    psync(h, d.pid);
    pcommit(p);
  },
  'pa-cap-score'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    const c = pcap(h, d.pid, h.par);
    const base = c.score != null ? c.score : (suggestScore(c) != null ? suggestScore(c) : h.par);
    c.touched = true;
    c.score = Math.max(1, base + Number(d.d));
    h.scores[d.pid] = c.score;
    pcommit(p);
  },
  'pa-score'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.scores[d.pid] = Math.max(1, (h.scores[d.pid] ?? h.par) + Number(d.d));
    pcommit(p);
  },
  'pa-fw'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.fw = h.fw || [];
    h.fw = h.fw.includes(d.pid) ? h.fw.filter(x => x !== d.pid) : [...h.fw, d.pid];
    pcommit(p);
  },
  'pa-gir'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.gir = h.gir || [];
    h.gir = h.gir.includes(d.pid) ? h.gir.filter(x => x !== d.pid) : [...h.gir, d.pid];
    if (h.gir.includes(d.pid)) h.ud = (h.ud || []).filter(x => x !== d.pid); // GIR ⇒ no up/down
    pcommit(p);
  },
  'pa-ud'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.ud = h.ud || [];
    h.ud = h.ud.includes(d.pid) ? h.ud.filter(x => x !== d.pid) : [...h.ud, d.pid];
    pcommit(p);
  },
  'pa-putts'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.putts = h.putts || {};
    const cur = h.putts[d.pid] != null ? h.putts[d.pid] : 2;
    h.putts[d.pid] = Math.max(0, Math.min(6, cur + Number(d.d)));
    pcommit(p);
  },
  'pa-sandy'(d) { const p = activeParty(); const h = p.holes[p.idx]; h.sandy = h.sandy || []; h.sandy = h.sandy.includes(d.pid) ? h.sandy.filter(x => x !== d.pid) : [...h.sandy, d.pid]; pcommit(p); },
  'pa-holeout'(d) { const p = activeParty(); const h = p.holes[p.idx]; h.holeout = h.holeout || []; h.holeout = h.holeout.includes(d.pid) ? h.holeout.filter(x => x !== d.pid) : [...h.holeout, d.pid]; pcommit(p); },
  'pa-reg'(d) { const p = activeParty(); const h = p.holes[p.idx]; if (!h.reg || Array.isArray(h.reg)) h.reg = {}; const c = h.reg[d.pid] || 0; h.reg[d.pid] = Math.max(0, Math.min(p.players.length, c + Number(d.d))); pcommit(p); },
  'pa-longputt'(d) { const p = activeParty(); const h = p.holes[p.idx]; if (!h.longputt || Array.isArray(h.longputt)) h.longputt = {}; const c = h.longputt[d.pid] || 0; h.longputt[d.pid] = Math.max(0, Math.min(9, c + Number(d.d))); pcommit(p); },
  'pa-3putt'(d) { const p = activeParty(); const h = p.holes[p.idx]; h.threeputt = h.threeputt || []; h.threeputt = h.threeputt.includes(d.pid) ? h.threeputt.filter(x => x !== d.pid) : [...h.threeputt, d.pid]; pcommit(p); },
  'pa-espanol'(d) { const p = activeParty(); const h = p.holes[p.idx]; h.espanol = h.espanol || []; h.espanol = h.espanol.includes(d.pid) ? h.espanol.filter(x => x !== d.pid) : [...h.espanol, d.pid]; pcommit(p); },
  'pa-ready'(d) {
    const p = activeParty(); const h = p.holes[pCurIdx(p)]; h.done = h.done || {};
    if (!pIsMine(p, d.pid)) return;
    if (h.done[d.pid]) { delete h.done[d.pid]; pcommit(p); return; }   // toca de nuevo = editar
    const c = pcap(h, d.pid, h.par); psync(h, d.pid);                  // fija score sugerido
    if (pScoreOf(h, p.players.find(x => x.pid === d.pid)) == null) return;
    h.done[d.pid] = true;
    const next = pMyPlayers(p).find(pl => !h.done[pl.pid]);            // salta al siguiente jugador mío
    if (next) { V.capPid = next.pid; V.pWizStep = null; }
    pcommit(p); window.scrollTo(0, 0);
  },
  'pa-edit-hole'() {
    const p = activeParty(); const h = p.holes[pCurIdx(p)]; h.done = h.done || {};
    pMyPlayers(p).forEach(pl => { delete h.done[pl.pid]; });
    V.capPid = (pMyPlayers(p)[0] || p.players[0]).pid; V.pWizStep = null;
    pcommit(p); window.scrollTo(0, 0);
  },
  'pa-next'() {
    const p = activeParty();
    const ci = pCurIdx(p);
    if (ci + 1 >= p.holesCount) return;
    V.pIdx = ci + 1;   // avanza SOLO tu hoyo local (los demás siguen a su ritmo)
    if (!p.holes[V.pIdx]) p.holes[V.pIdx] = makeHoleForParty(p, V.pIdx);
    V.capPid = (pMyPlayers(p)[0] || p.players[0]).pid; V.pWizStep = null;
    pcommit(p); window.scrollTo(0, 0);
  },
  'pa-prev'() { const p = activeParty(); const ci = pCurIdx(p); if (ci > 0) { V.pIdx = ci - 1; V.capPid = (pMyPlayers(p)[0] || p.players[0]).pid; V.pWizStep = null; render(); window.scrollTo(0, 0); } },
  'pa-money'() { V.showMoney = true; render(); },
  'pa-money-close'() { V.showMoney = false; render(); },
  'pa-finish'() {
    const p = activeParty();
    p.status = 'done';
    savePartyRounds(p);
    V.partyView = p.id; V.showMoney = false; V.view = 'party-done';
    pcommit(p); window.scrollTo(0, 0);
  },
  'party-open'(d) { V.partyView = d.id; savePartyRounds(partyById(d.id)); go('party-done'); },
  'party-close-done'() {
    if (S.activeParty && partyById(S.activeParty)?.status === 'done') S.activeParty = null;
    V.partyView = null; V.view = 'social';
    commit();
  },
};

/* ---- Cuenta demo: HCP 7 + entrenamiento + 5 rondas solo + 5 con amigos ---- */
function buildDemoParty(hostUser, friendNames, cid, k) {
  const course = COURSES[cid];
  const hostPid = Store.uid();
  const players = [{ pid: hostPid, name: hostUser.name, userId: hostUser.id, strokes: 0 }];
  friendNames.forEach(fn => players.push({ pid: Store.uid(), name: fn, strokes: 0 }));
  const holes = course.holes.slice(0, 18).map(ch => {
    const par = ch.par;
    const hole = { par, scores: {}, putts: {}, fw: [], gir: [], ud: [], sandy: [], holeout: [], threeputt: [], espanol: [], reg: {}, longputt: {} };
    let rank = 1;
    players.forEach(pl => {
      const skill = pl.userId ? 0.62 : 0.40 + Math.random() * 0.22;
      const gir = Math.random() < (0.40 + 0.18 * skill);
      const fw = par !== 3 && Math.random() < (0.55 + 0.12 * skill);
      let putts, score;
      if (gir) { putts = Math.random() < 0.2 ? 1 : 2; score = par - 2 + putts; }
      else { const saved = Math.random() < (0.40 + 0.22 * skill); putts = saved ? 1 : 2; score = par - 1 + putts; if (!saved && Math.random() < 0.22) score += 1; }
      hole.scores[pl.pid] = Math.max(2, score);
      hole.putts[pl.pid] = putts;
      if (fw) hole.fw.push(pl.pid);
      if (gir) { hole.gir.push(pl.pid); hole.reg[pl.pid] = rank++; }
      else if (putts <= 1) hole.ud.push(pl.pid);
      if (putts >= 3) hole.threeputt.push(pl.pid);
      if (!gir && putts <= 1 && Math.random() < 0.35) hole.sandy.push(pl.pid);
    });
    return hole;
  });
  return {
    id: Store.uid(), code: Party.newCode(S.parties.map(x => x.code)),
    date: new Date(Date.now() - (5 - k) * 5 * 864e5).toISOString().slice(0, 10),
    hostUserId: hostUser.id, hostPid,
    course: course.name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''),
    courseId: cid, holesCount: holes.length,
    games: { corta: true, medal: true, match: false }, useNet: false,
    players, holes, idx: holes.length - 1, status: 'done', rev: 0, ts: Date.now(),
  };
}
function seedDemoAccount() {
  // limpia cuentas demo previas y sus datos
  const oldIds = new Set(S.users.filter(u => /@parfect\.golf$/.test(u.email || '')).map(u => u.id));
  S.users = S.users.filter(u => !oldIds.has(u.id));
  S.rounds = S.rounds.filter(r => !oldIds.has(r.userId));
  S.practices = S.practices.filter(pr => !oldIds.has(pr.userId));
  S.parties = S.parties.filter(pt => pt.hostUserId == null || !oldIds.has(pt.hostUserId));

  const uid = Store.uid();
  const bag = {}; ['dr', 'w3', 'h4', 'i5', 'i6', 'i7', 'i8', 'i9', 'pw', 'w52', 'w56', 'w60'].forEach(id => bag[id] = { c: CLUB_DEFAULT[id], e: 70 });
  const user = { id: uid, name: 'Demo PARFECT', email: 'demo@parfect.golf', pass: '', hcp: 7, goal: 3, homeCourse: 'campestre', clubs: bag, createdAt: Date.now() };
  S.users.push(user);
  S.session = uid;

  S.practices.push(...Demo.practices(uid));
  S.rounds.push(...Demo.realRounds(uid, 5));

  const friends = ['Beto', 'Caro', 'Diego', 'Lalo', 'Memo', 'Nico'];
  for (let k = 0; k < 5; k++) {
    const cid = COURSE_ORDER[k % COURSE_ORDER.length];
    const party = buildDemoParty(user, [friends[k % friends.length], friends[(k + 3) % friends.length]], cid, k);
    S.parties.push(party);
    savePartyRounds(party);
  }
  V.view = 'inicio'; V.profileOpen = false; V.err = null;
  commit(); window.scrollTo(0, 0);
}

/* Construye una ronda (formato perfil) a partir de los datos de la party para un jugador */
function buildRoundFromParty(party, pid) {
  const holes = party.holes.slice(0, party.holesCount)
    .filter(h => h.scores[pid] != null)
    .map(h => {
      const gir = (h.gir || []).includes(pid);
      return {
        par: h.par,
        score: h.scores[pid],
        tee: h.par === 3 ? null : ((h.fw || []).includes(pid) ? 'fw' : 'izq'),
        app: gir ? 'gir' : 'corto',
        upDown: gir ? null : (h.ud || []).includes(pid),
        putts: (h.putts && h.putts[pid] != null) ? h.putts[pid] : 2,
        dist: null,
      };
    });
  return { id: Store.uid(), userId: null, partyId: party.id, course: party.course, date: party.date, holes };
}

/* Guarda en el perfil la ronda de cada jugador con cuenta en este dispositivo (idempotente) */
function savePartyRounds(party) {
  if (!party || party.status !== 'done') return;
  let added = false;
  for (const pl of party.players) {
    if (!pl.userId) continue;                                   // invitados sin cuenta no tienen perfil
    if (!S.users.some(u => u.id === pl.userId)) continue;       // cuenta no existe en este dispositivo
    if (S.rounds.some(r => r.partyId === party.id && r.userId === pl.userId)) continue; // ya guardada
    const round = buildRoundFromParty(party, pl.pid);
    if (!round.holes.length) continue;
    round.userId = pl.userId;
    S.rounds.push(round);
    added = true;
  }
  if (added) { Store.save(S); if (typeof Cloud !== 'undefined' && Cloud.enabled()) Cloud.pushSoon(); }
}
