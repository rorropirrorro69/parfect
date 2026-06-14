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
  return `<div class="shell no-nav fade-in">
    <button class="auth-back" data-act="nav" data-view="social">← Social</button>
    <h1 class="auth-h">Nueva party 🎉</h1>
    <p class="auth-sub">Configura el juego, comparte el código y a jugar.</p>
    <div class="card">
      <div class="field" style="margin-top:0"><label>Campo</label>
        <input id="pd-course" placeholder="Nombre del campo" value="${esc(d.course)}"></div>
      <div class="field"><label>Hoyos</label>
        <div class="chips">
          <button class="chip ${d.holes === 9 ? 'on' : ''}" data-act="pd-holes" data-n="9">9 hoyos</button>
          <button class="chip ${d.holes === 18 ? 'on' : ''}" data-act="pd-holes" data-n="18">18 hoyos</button>
        </div></div>
      <button class="game-row ${d.useNet ? 'on' : ''}" data-act="pd-net" style="border-bottom:none">
        <div class="g-main"><b>Jugar con hándicap (net)</b>
        <p>Asigna golpes de ventaja por jugador en el lobby. Medal y Match se juegan con score neto.</p></div>
        <span class="g-check">${d.useNet ? '✓' : ''}</span>
      </button>
    </div>
    <div class="card">
      <span class="label">Juego de la party</span>
      ${Object.entries(Party.GAMES).filter(([k]) => k === 'medal' || k === 'match').map(([k, g]) => `
        <button class="game-row ${d.games[k] ? 'on' : ''}" data-act="pd-game" data-g="${k}">
          <div class="g-main"><b>${g.name}</b><p>${g.desc}</p></div>
          <span class="g-check">${d.games[k] ? '✓' : ''}</span>
        </button>`).join('')}
    </div>
    <button class="btn primary" data-act="party-create">Crear party y generar código →</button>
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
          <span>${pl.device && pl.device !== DEVICE_ID ? 'Otro dispositivo 📱' : pl.userId ? 'Cuenta del dispositivo' : 'Invitado'}${pl.pid === p.hostPid ? ' · organiza' : ''}</span></div>
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
function vPartyLive() {
  const p = activeParty();
  if (!p || p.status === 'cancelled') { S.activeParty = null; V.view = 'social'; return vShell(vSocial()); }
  if (p.status === 'done') { V.partyView = p.id; return vPartyDone(); }
  const h = p.holes[p.idx];
  const st = Party.standings(p, p.idx);
  const toParOf = {}; st.forEach(r => { toParOf[r.pid] = r; });
  const ms = p.games.match ? Party.matchStatus(p, p.idx) : null;
  const last = p.idx + 1 === p.holesCount;
  return `<div class="shell no-nav fade-in">
    <div class="play-top">
      <button class="x" data-act="party-exit">✕ Salir</button>
      <span class="label">Party ${esc(p.code)} ${syncBadge()}</span>
      <span class="small muted">${p.idx + 1}/${p.holesCount}</span>
    </div>
    <div class="progress"><i style="width:${(p.idx / p.holesCount) * 100}%"></i></div>
    <div class="hole-head"><span class="hnum">Hoyo ${p.idx + 1}</span>
      <span class="hof">${ms ? `Match: ${ms.text}` : (p.games.medal ? 'Medal' : '')}</span></div>

    <div class="group">
      <div class="g-lab"><span class="label">Par del hoyo</span></div>
      <div class="chips">${[3, 4, 5].map(n =>
        `<button class="chip ${h.par === n ? 'on' : ''}" data-act="pa-par" data-v="${n}">Par ${n}</button>`).join('')}</div>
    </div>

    <div class="group">
      <div class="g-lab"><span class="label">Scores</span><span class="small muted">prellenado al par</span></div>
      ${p.players.map(pl => {
        const s = h.scores[pl.pid] ?? h.par;
        const d = s - h.par;
        const r = toParOf[pl.pid];
        const tot = r && r.holes ? `Total ${fmtToPar(r.toPar)}` : 'Sin hoyos';
        return `<div class="pl-row">
          <span class="rank">${esc(initials(pl.name))}</span>
          <div class="r-main" style="flex:1"><b>${esc(pl.name.split(' ')[0])}</b>
            <span class="muted">${tot}${p.useNet && (pl.strokes || 0) ? ` · ${pl.strokes} golpes` : ''}</span></div>
          <span class="pl-rel ${d < 0 ? 'lime' : ''}">${d === 0 ? 'PAR' : d > 0 ? `+${d}` : d}</span>
          <div class="stepper sm">
            <button data-act="pa-score" data-pid="${pl.pid}" data-d="-1">−</button>
            <span class="pl-score">${s}</span>
            <button data-act="pa-score" data-pid="${pl.pid}" data-d="1">+</button>
          </div>
        </div>`;
      }).join('')}
    </div>

    <button class="btn ghost" data-act="pa-money">📋 Ver tabla</button>
    <div class="btn-row">
      ${p.idx > 0 ? `<button class="btn" style="flex:0 0 30%" data-act="pa-prev">←</button>` : ''}
      <button class="btn primary" data-act="${last ? 'pa-finish' : 'pa-next'}">${last ? 'Finalizar party 🏁' : 'Siguiente hoyo →'}</button>
    </div>

    <div class="card" style="margin-top:18px">
      <span class="label">Tarjeta</span>
      ${scorecardTable(
        p.holesCount,
        i => (p.holes[i] ? p.holes[i].par : Stats.PAR_SEQ[i % 18]),
        p.players.map(pl => ({ name: pl.name.split(' ')[0], scoreOf: i => (p.holes[i] ? p.holes[i].scores[pl.pid] : null) })),
        p.idx
      )}
    </div>
    ${V.showMoney ? `<div class="overlay" data-act="pa-money-close"><div class="sheet" data-act="noop">
      <div class="grab"></div><h2>📋 Tabla en vivo</h2>
      ${vPartyTable(p, p.idx)}
      <button class="btn" data-act="pa-money-close">Seguir jugando</button>
    </div></div>` : ''}
  </div>`;
}

/* ---------- Tabla de posiciones (Medal / Match) ---------- */
function vPartyTable(p, limit) {
  if (p.games.match) {
    const ms = Party.matchStatus(p, limit);
    const order = p.players.slice().sort((a, b) => ms.won[b.pid] - ms.won[a.pid]);
    const rows = order.map((pl, i) => `<div class="pl-row">
      <span class="rank">${ms.won[pl.pid] > 0 ? i + 1 : '–'}</span>
      <div class="r-main" style="flex:1"><b>${esc(pl.name)}</b><span>${ms.played} hoyos jugados</span></div>
      <div class="r-side"><b>${ms.won[pl.pid]}</b><span>ganados</span></div>
    </div>`).join('');
    let head;
    if (ms.is2p) {
      head = ms.up === 0
        ? `<p class="tip">Match igualado tras ${ms.played} hoyos.</p>`
        : `<p class="tip"><b>${esc(plName(p, ms.leader).split(' ')[0])}</b> ${ms.decided ? `gana ${ms.text}` : `va ${ms.text}`} (${ms.wa}–${ms.wb})</p>`;
    } else {
      head = `<p class="note">Match play — gana quien gane más hoyos (score más bajo del hoyo).</p>`;
    }
    return head + rows;
  }
  const st = Party.standings(p, limit);
  const rows = st.map((r, i) => `<div class="pl-row">
    <span class="rank">${r.holes ? i + 1 : '–'}</span>
    <div class="r-main" style="flex:1"><b>${esc(r.name)}</b>
      <span>${r.holes ? `${r.holes} hoyos${p.useNet ? ` · bruto ${r.gross}` : ''}` : 'sin scores'}</span></div>
    <div class="r-side"><b>${r.holes ? r.shown : '—'}</b><span>${r.holes ? fmtToPar(r.toPar) : ''}</span></div>
  </div>`).join('');
  return `<p class="note">Medal — gana el score total más bajo${p.useNet ? ' (neto)' : ''}.</p>` + rows;
}

function vPartyDone() {
  const p = partyById(V.partyView) || activeParty();
  if (!p) { V.view = 'social'; return vShell(vSocial()); }
  const st = Party.standings(p);
  const ms = p.games.match ? Party.matchStatus(p) : null;
  let winnerPid = null, sub = '';
  if (ms) {
    if (ms.leaderWon > ms.runnerWon) {
      winnerPid = ms.leader;
      sub = ms.is2p ? `gana el match ${ms.text} (${ms.wa}–${ms.wb})` : `gana con ${ms.leaderWon} hoyos`;
    } else sub = 'match empatado 🤝';
  } else {
    const played = st.filter(r => r.holes);
    if (played.length && !(played[1] && played[1].toPar === played[0].toPar)) { winnerPid = played[0].pid; sub = `gana en Medal con ${fmtToPar(played[0].toPar)}`; }
    else if (played.length) sub = 'empate en el primer lugar 🤝';
  }
  const winName = winnerPid ? plName(p, winnerPid).split(' ')[0] : '—';
  return `<div class="shell no-nav fade-in">
    <div class="play-top"><span></span><span class="label">Party ${esc(p.code)} · final</span><span></span></div>
    <div class="greet" style="text-align:center">
      <p class="hi">${esc(p.course)} · ${fmtDate(p.date)}</p>
      <h1 style="font-size:34px">🏆 ${esc(winName)}</h1>
      <p class="hcp">${esc(sub)}</p>
    </div>
    <div class="card">${vPartyTable(p, p.holes.length)}</div>
    <button class="btn primary" data-act="party-close-done">Listo ✓</button>
  </div>`;
}

/* ---------- Acciones ---------- */
function makeHoleForParty(p, i) {
  const par = Stats.PAR_SEQ[i % 18];
  return { par, scores: Object.fromEntries(p.players.map(pl => [pl.pid, par])), larga: null, gogos: [], gir: [] };
}

const partyActions = {
  'party-new'() {
    V.partyDraft = { course: '', holes: 18, useNet: false, games: { corta: false, skins: false, larga: false, gogo: false, birdie: false, medal: true, nassau: false, match: false } };
    go('party-setup');
  },
  'pd-holes'(d) { V.partyDraft.course = val('pd-course'); V.partyDraft.holes = Number(d.n); render(); },
  'pd-game'(d) {
    V.partyDraft.course = val('pd-course');
    // Medal y Match son excluyentes: elegir uno apaga el otro
    const on = !V.partyDraft.games[d.g];
    V.partyDraft.games.medal = false; V.partyDraft.games.match = false;
    V.partyDraft.games[d.g] = on;
    render();
  },
  'pd-net'() { V.partyDraft.course = val('pd-course'); V.partyDraft.useNet = !V.partyDraft.useNet; render(); },
  'party-create'() {
    const d = V.partyDraft;
    const u = cur();
    const hostPid = Store.uid();
    const party = {
      id: Store.uid(),
      code: Party.newCode(S.parties.map(x => x.code)),
      date: new Date().toISOString().slice(0, 10),
      hostUserId: u.id, hostPid,
      course: val('pd-course') || d.course || 'Mi campo',
      holesCount: d.holes,
      games: { ...d.games },
      useNet: !!d.useNet,
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
      if (!p.players.some(x => x.userId === u.id && x.device === DEVICE_ID) && !p.players.some(x => x.userId === u.id && !x.device)) {
        p.players.push({ pid: Store.uid(), name: u.name, userId: u.id, strokes: 0, device: DEVICE_ID });
      }
      S.activeParty = p.id;
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
    V.view = 'party-live';
    pcommit(p); window.scrollTo(0, 0);
  },
  'party-resume'() {
    const p = activeParty(); if (!p) return;
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
  'party-exit'() { V.showMoney = false; go('social'); },

  'pa-par'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    const old = h.par; const par = Number(d.v);
    h.par = par;
    for (const pid of Object.keys(h.scores)) if (h.scores[pid] === old) h.scores[pid] = par;
    if (par !== 5) h.larga = null;
    pcommit(p);
  },
  'pa-score'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.scores[d.pid] = Math.max(1, (h.scores[d.pid] ?? h.par) + Number(d.d));
    pcommit(p);
  },
  'pa-larga'(d) { const p = activeParty(); const h = p.holes[p.idx]; h.larga = h.larga === d.pid ? null : d.pid; pcommit(p); },
  'pa-gir'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.gir = h.gir || [];
    h.gir = h.gir.includes(d.pid) ? h.gir.filter(x => x !== d.pid) : [...h.gir, d.pid];
    pcommit(p);
  },
  'pa-gogo'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.gogos = h.gogos || [];
    h.gogos = h.gogos.includes(d.pid) ? h.gogos.filter(x => x !== d.pid) : [...h.gogos, d.pid];
    pcommit(p);
  },
  'pa-next'() {
    const p = activeParty();
    if (p.idx + 1 >= p.holesCount) return;
    p.idx++;
    if (!p.holes[p.idx]) p.holes[p.idx] = makeHoleForParty(p, p.idx);
    pcommit(p); window.scrollTo(0, 0);
  },
  'pa-prev'() { const p = activeParty(); if (p.idx > 0) { p.idx--; pcommit(p); window.scrollTo(0, 0); } },
  'pa-money'() { V.showMoney = true; render(); },
  'pa-money-close'() { V.showMoney = false; render(); },
  'pa-finish'() {
    const p = activeParty();
    p.status = 'done';
    V.partyView = p.id; V.showMoney = false; V.view = 'party-done';
    pcommit(p); window.scrollTo(0, 0);
  },
  'party-open'(d) { V.partyView = d.id; go('party-done'); },
  'party-close-done'() {
    if (S.activeParty && partyById(S.activeParty)?.status === 'done') S.activeParty = null;
    V.partyView = null; V.view = 'social';
    commit();
  },
};
