/* ============ Parfect Party: setup, lobby, juego en vivo, liquidación ============ */

const activeParty = () => S.parties.find(p => p.id === S.activeParty) || null;
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
    <p class="auth-sub">Configura la jugada, comparte el código y a apostar.</p>
    <div class="card">
      <div class="field" style="margin-top:0"><label>Campo</label>
        <input id="pd-course" placeholder="Nombre del campo" value="${esc(d.course)}"></div>
      <div class="field"><label>Hoyos</label>
        <div class="chips">
          <button class="chip ${d.holes === 9 ? 'on' : ''}" data-act="pd-holes" data-n="9">9 hoyos</button>
          <button class="chip ${d.holes === 18 ? 'on' : ''}" data-act="pd-holes" data-n="18">18 hoyos</button>
        </div></div>
      <div class="field"><label>Apuesta por unidad (MXN)</label>
        <input id="pd-stake" type="number" min="0" inputmode="numeric" value="${esc(d.stake)}"></div>
    </div>
    <div class="card">
      <span class="label">Juegos de la party</span>
      ${Object.entries(Party.GAMES).map(([k, g]) => `
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
  if (!p) { V.view = 'social'; return vShell(vSocial()); }
  const u = cur();
  const inAccounts = new Set(p.players.map(x => x.userId).filter(Boolean));
  const otherAccounts = S.users.filter(x => !inAccounts.has(x.id));
  const gamesOn = Object.entries(p.games).filter(([, v]) => v).map(([k]) => Party.GAMES[k].name);
  return `<div class="shell no-nav fade-in">
    <button class="auth-back" data-act="party-exit">← Guardar y salir</button>
    <h1 class="auth-h">Lobby de la party</h1>
    <div class="code-box">
      <span class="label">Código para unirse</span>
      <div class="code">${esc(p.code)}</div>
      <p class="note" style="text-align:center">Tus amigos entran a Social → "Unirse con código" en su cuenta.</p>
    </div>
    <div class="card">
      <span class="label">${esc(p.course)} · ${p.holesCount} hoyos · $${esc(p.stake)}/unidad</span>
      <p class="small muted">${gamesOn.join(' · ') || 'Sin juegos seleccionados'}</p>
    </div>
    <div class="card">
      <span class="label">Jugadores (${p.players.length})</span>
      ${p.players.map(pl => `<div class="pl-row">
        <span class="rank">${esc(initials(pl.name))}</span>
        <div class="r-main" style="flex:1"><b>${esc(pl.name)}${pl.userId === u.id ? ' (tú)' : ''}</b>
          <span>${pl.userId ? 'Cuenta del dispositivo' : 'Invitado'}${pl.pid === p.hostPid ? ' · organiza' : ''}</span></div>
        ${pl.pid !== p.hostPid ? `<button class="pl-x" data-act="party-remove" data-pid="${pl.pid}">✕</button>` : ''}
      </div>`).join('')}
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
  if (!p) { V.view = 'social'; return vShell(vSocial()); }
  const h = p.holes[p.idx];
  const { net, carry } = Party.ledger(p, p.idx);
  const last = p.idx + 1 === p.holesCount;
  return `<div class="shell no-nav fade-in">
    <div class="play-top">
      <button class="x" data-act="party-exit">✕ Salir</button>
      <span class="label">Party ${esc(p.code)} · ${esc(p.course)}</span>
      <span class="small muted">${p.idx + 1}/${p.holesCount}</span>
    </div>
    <div class="progress"><i style="width:${(p.idx / p.holesCount) * 100}%"></i></div>
    <div class="hole-head"><span class="hnum">Hoyo ${p.idx + 1}</span>
      <span class="hof">${p.games.skins && carry ? `🔥 ${carry} skin${carry > 1 ? 's' : ''} acumulada${carry > 1 ? 's' : ''}` : ''}</span></div>

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
        return `<div class="pl-row">
          <span class="rank">${esc(initials(pl.name))}</span>
          <div class="r-main" style="flex:1"><b>${esc(pl.name.split(' ')[0])}</b>
            <span class="${net[pl.pid] > 0 ? 'lime' : ''}" style="${net[pl.pid] < 0 ? 'color:var(--danger)' : ''}">${fmtMoney(net[pl.pid])}</span></div>
          <span class="pl-rel ${d < 0 ? 'lime' : ''}">${d === 0 ? 'PAR' : d > 0 ? `+${d}` : d}</span>
          <div class="stepper sm">
            <button data-act="pa-score" data-pid="${pl.pid}" data-d="-1">−</button>
            <span class="pl-score">${s}</span>
            <button data-act="pa-score" data-pid="${pl.pid}" data-d="1">+</button>
          </div>
        </div>`;
      }).join('')}
    </div>

    ${p.games.corta && h.par === 3 ? `<div class="group">
      <div class="g-lab"><span class="label">🎯 La corta</span><span class="small muted">¿quién quedó más cerca?</span></div>
      <div class="chips">${p.players.map(pl =>
        `<button class="chip sm ${h.corta === pl.pid ? 'on' : ''}" data-act="pa-corta" data-pid="${pl.pid}">${esc(pl.name.split(' ')[0])}</button>`).join('')}</div>
    </div>` : ''}

    ${p.games.larga && h.par === 5 ? `<div class="group">
      <div class="g-lab"><span class="label">🚀 La larga</span><span class="small muted">drive más largo</span></div>
      <div class="chips">${p.players.map(pl =>
        `<button class="chip sm ${h.larga === pl.pid ? 'on' : ''}" data-act="pa-larga" data-pid="${pl.pid}">${esc(pl.name.split(' ')[0])}</button>`).join('')}</div>
    </div>` : ''}

    ${p.games.gogo ? `<div class="group">
      <div class="g-lab"><span class="label">⛳ Gogos</span><span class="small muted">salvó par fuera de green</span></div>
      <div class="chips">${p.players.map(pl =>
        `<button class="chip sm ${(h.gogos || []).includes(pl.pid) ? 'on' : ''}" data-act="pa-gogo" data-pid="${pl.pid}">${esc(pl.name.split(' ')[0])}</button>`).join('')}</div>
    </div>` : ''}

    ${p.games.birdie ? `<p class="note">Los birdies y águilas cobran solos según el score.</p>` : ''}

    <button class="btn ghost" data-act="pa-money">💰 Ver cuentas de la party</button>
    <div class="btn-row">
      ${p.idx > 0 ? `<button class="btn" style="flex:0 0 30%" data-act="pa-prev">←</button>` : ''}
      <button class="btn primary" data-act="${last ? 'pa-finish' : 'pa-next'}">${last ? 'Finalizar party 🏁' : 'Siguiente hoyo →'}</button>
    </div>
    ${V.showMoney ? vPartyMoney(p, false) : ''}
  </div>`;
}

/* ---------- Cuentas (sheet en vivo / pantalla final) ---------- */
function vPartyMoney(p, done) {
  const { net, events, carry } = Party.ledger(p, done ? p.holes.length : p.idx);
  const t = Party.totals(p);
  const order = [...p.players].sort((a, b) => net[b.pid] - net[a.pid]);
  const rows = order.map((pl, i) => `<div class="pl-row">
    <span class="rank">${i + 1}</span>
    <div class="r-main" style="flex:1"><b>${esc(pl.name)}</b>
      <span>${t[pl.pid].holes ? `${t[pl.pid].score} golpes (${fmtToPar(t[pl.pid].toPar)}) · ${t[pl.pid].holes} hoyos` : 'sin scores'}</span></div>
    <b class="${net[pl.pid] > 0.005 ? 'lime' : ''}" style="font-size:17px;${net[pl.pid] < -0.005 ? 'color:var(--danger)' : ''}">${fmtMoney(net[pl.pid])}</b>
  </div>`).join('');
  const evs = events.slice(-8).reverse().map(e =>
    `<p class="tip">${e.hole ? `H${e.hole} · ` : ''}${esc(e.label)}: <b>${esc(plName(p, e.winner).split(' ')[0])}</b> cobra ${fmtMoney(e.amount)}</p>`).join('');

  if (!done) {
    return `<div class="overlay" data-act="pa-money-close"><div class="sheet" data-act="noop">
      <div class="grab"></div><h2>💰 Cuentas en vivo</h2>
      ${rows}
      ${carry ? `<p class="note">🔥 ${carry} skin(s) acumuladas en juego.</p>` : ''}
      ${evs ? `<p class="label" style="margin-top:16px">Últimos cobros</p>${evs}` : '<p class="note">Aún no hay cobros.</p>'}
      <button class="btn" data-act="pa-money-close">Seguir jugando</button>
    </div></div>`;
  }
  const tx = Party.settle(net);
  return `${rows}
    ${tx.length ? `<p class="label" style="margin-top:18px">Liquidación</p>` +
      tx.map(x => `<div class="settle-row"><b>${esc(plName(p, x.from).split(' ')[0])}</b> le paga <b class="lime">${fmtMoney(x.amount)}</b> a <b>${esc(plName(p, x.to).split(' ')[0])}</b></div>`).join('')
      : '<p class="note" style="margin-top:14px">Cuentas parejas: nadie debe nada. 🤝</p>'}
    ${evs ? `<p class="label" style="margin-top:18px">Historial de cobros</p>${evs}` : ''}`;
}

function vPartyDone() {
  const p = partyById(V.partyView) || activeParty();
  if (!p) { V.view = 'social'; return vShell(vSocial()); }
  const { net } = Party.ledger(p);
  const top = [...p.players].sort((a, b) => net[b.pid] - net[a.pid])[0];
  return `<div class="shell no-nav fade-in">
    <div class="play-top"><span></span><span class="label">Party ${esc(p.code)} · final</span><span></span></div>
    <div class="greet" style="text-align:center">
      <p class="hi">${esc(p.course)} · ${fmtDate(p.date)}</p>
      <h1 style="font-size:34px">🏆 ${esc(top ? top.name.split(' ')[0] : '—')}</h1>
      <p class="hcp">se lleva la party ${net[top?.pid] > 0 ? `(${fmtMoney(net[top.pid])})` : ''}</p>
    </div>
    <div class="card">${vPartyMoney(p, true)}</div>
    <button class="btn primary" data-act="party-close-done">Listo ✓</button>
  </div>`;
}

/* ---------- Acciones ---------- */
function makeHoleForParty(p, i) {
  const par = Stats.PAR_SEQ[i % 18];
  return { par, scores: Object.fromEntries(p.players.map(pl => [pl.pid, par])), corta: null, larga: null, gogos: [] };
}

const partyActions = {
  'party-new'() {
    V.partyDraft = { course: '', holes: 18, stake: '50', games: { skins: true, corta: true, larga: true, gogo: true, birdie: true, medal: false } };
    go('party-setup');
  },
  'pd-holes'(d) { V.partyDraft.course = val('pd-course'); V.partyDraft.stake = val('pd-stake'); V.partyDraft.holes = Number(d.n); render(); },
  'pd-game'(d) { V.partyDraft.course = val('pd-course'); V.partyDraft.stake = val('pd-stake'); V.partyDraft.games[d.g] = !V.partyDraft.games[d.g]; render(); },
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
      stake: Number(val('pd-stake') || d.stake) || 0,
      games: { ...d.games },
      players: [{ pid: hostPid, name: u.name, userId: u.id }],
      holes: [], idx: 0,
      status: 'setup',
    };
    S.parties.push(party);
    S.activeParty = party.id;
    V.view = 'party-lobby'; V.err = null;
    commit(); window.scrollTo(0, 0);
  },
  'party-add-account'(d) {
    const p = activeParty(); const a = S.users.find(x => x.id === d.id);
    if (!p || !a) return;
    p.players.push({ pid: Store.uid(), name: a.name, userId: a.id });
    commit();
  },
  'party-add-guest'() {
    const p = activeParty(); const name = val('pa-guest');
    if (!p) return;
    if (!name) { V.err = 'Escribe el nombre del invitado.'; render(); return; }
    p.players.push({ pid: Store.uid(), name, userId: null });
    V.err = null;
    commit();
  },
  'party-remove'(d) {
    const p = activeParty(); if (!p) return;
    p.players = p.players.filter(x => x.pid !== d.pid);
    commit();
  },
  'party-join'() {
    const code = val('join-code').toUpperCase();
    const p = S.parties.find(x => x.code === code && x.status !== 'done');
    if (!p) { V.err = 'No hay ninguna party activa con ese código en este dispositivo.'; render(); return; }
    const u = cur();
    if (!p.players.some(x => x.userId === u.id)) p.players.push({ pid: Store.uid(), name: u.name, userId: u.id });
    S.activeParty = p.id;
    V.err = null; V.view = p.status === 'live' ? 'party-live' : 'party-lobby';
    commit(); window.scrollTo(0, 0);
  },
  'party-start'() {
    const p = activeParty();
    if (!p || p.players.length < 2) return;
    p.status = 'live';
    if (!p.holes.length) p.holes.push(makeHoleForParty(p, 0));
    V.view = 'party-live';
    commit(); window.scrollTo(0, 0);
  },
  'party-resume'() {
    const p = activeParty(); if (!p) return;
    V.view = p.status === 'live' ? 'party-live' : 'party-lobby';
    render(); window.scrollTo(0, 0);
  },
  'party-cancel'() {
    const p = activeParty(); if (!p) return;
    if (V.delArm !== p.id) { V.delArm = p.id; render(); return; }
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
    if (par !== 3) h.corta = null;
    if (par !== 5) h.larga = null;
    commit();
  },
  'pa-score'(d) {
    const p = activeParty(); const h = p.holes[p.idx];
    h.scores[d.pid] = Math.max(1, (h.scores[d.pid] ?? h.par) + Number(d.d));
    commit();
  },
  'pa-corta'(d) { const h = activeParty().holes[activeParty().idx]; h.corta = h.corta === d.pid ? null : d.pid; commit(); },
  'pa-larga'(d) { const h = activeParty().holes[activeParty().idx]; h.larga = h.larga === d.pid ? null : d.pid; commit(); },
  'pa-gogo'(d) {
    const h = activeParty().holes[activeParty().idx];
    h.gogos = h.gogos || [];
    h.gogos = h.gogos.includes(d.pid) ? h.gogos.filter(x => x !== d.pid) : [...h.gogos, d.pid];
    commit();
  },
  'pa-next'() {
    const p = activeParty();
    if (p.idx + 1 >= p.holesCount) return;
    p.idx++;
    if (!p.holes[p.idx]) p.holes[p.idx] = makeHoleForParty(p, p.idx);
    commit(); window.scrollTo(0, 0);
  },
  'pa-prev'() { const p = activeParty(); if (p.idx > 0) { p.idx--; commit(); window.scrollTo(0, 0); } },
  'pa-money'() { V.showMoney = true; render(); },
  'pa-money-close'() { V.showMoney = false; render(); },
  'pa-finish'() {
    const p = activeParty();
    p.status = 'done';
    V.partyView = p.id; V.showMoney = false; V.view = 'party-done';
    commit(); window.scrollTo(0, 0);
  },
  'party-open'(d) { V.partyView = d.id; go('party-done'); },
  'party-close-done'() {
    if (S.activeParty && partyById(S.activeParty)?.status === 'done') S.activeParty = null;
    V.partyView = null; V.view = 'social';
    commit();
  },
};
