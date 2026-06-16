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
    const c = COURSES[id]; const on = cid === id; const par = c.holes.reduce((a, h) => a + h.par, 0);
    return `<button class="su-course ${on ? 'on' : ''}" data-act="pd-pick-course" data-c="${id}">
      <span class="su-c-ic">${golfIcon('flag')}</span>
      <span class="su-c-info"><b>${esc(sname(id))}</b><span>${c.holes.length} hoyos · Par ${par}</span></span>
      <span class="su-c-check">${on ? '✓' : ''}</span>
    </button>`;
  }).join('');
  const gmeta = { medal: { ic: 'trophy', tag: 'Clásico' }, match: { ic: 'flag', tag: 'Hoyo a hoyo' }, corta: { ic: 'card', tag: 'Apuesta' } };
  const gameCards = Object.entries(Party.GAMES).filter(([k]) => ['medal', 'match', 'corta'].includes(k)).map(([k, g]) => `
    <button class="pg-card ${d.games[k] ? 'on' : ''}" data-act="pd-game" data-g="${k}">
      <span class="pg-ic">${golfIcon(gmeta[k].ic)}</span>
      <div class="pg-tx"><b>${g.name} <i class="pg-tag">${gmeta[k].tag}</i></b><p>${g.desc}</p></div>
      <span class="pg-check">${d.games[k] ? '✓' : ''}</span>
    </button>`).join('');
  const stakeChips = [0, 10, 20, 50, 100].map(v => `<button class="chip ${(d.stake || 0) === v ? 'on' : ''}" data-act="pd-stake" data-v="${v}">${v === 0 ? 'Sin dinero' : '$' + v}</button>`).join('');
  return `<div class="shell no-nav fade-in">
    <button class="auth-back" data-act="nav" data-view="social">← Social</button>
    <div class="su-hero2 party-hero su-hero-course">
      <div class="su-hero2-txt">
        <span class="su-hero-tag">${golfIcon('flag')} Nueva party</span>
        <h1 class="su-hero-h">Juega con amigos</h1>
        <p class="su-hero-sub">${esc(sname(cid))} · ${COURSES[cid].holes.length} hoyos</p>
      </div>
      <div class="su-hero2-art">${courseHolesArt(cid)}</div>
    </div>
    <div class="su-block">
      <span class="su-lab">Campo</span>
      <div class="su-courses">${courseCards}</div>
    </div>
    <div class="su-block">
      <span class="su-lab">Juego de la party · elige uno o varios</span>
      <div class="party-games">${gameCards}</div>
    </div>
    <div class="su-block">
      <span class="su-lab">Apuesta por unidad</span>
      <div class="chips">${stakeChips}</div>
      ${(d.stake || 0) > 0 ? `<p class="su-meta">El que pierde paga <b class="lime">$${d.stake}</b> por cada unidad de diferencia · se liquida al final.</p>` : `<p class="su-meta">Sin dinero — solo por honor y presumir.</p>`}
    </div>
    <div class="su-block">
      <button class="pg-card net-card ${d.useNet ? 'on' : ''}" data-act="pd-net">
        <span class="pg-ic">${golfIcon('medal')}</span>
        <div class="pg-tx"><b>Jugar con hándicap (net)</b><p>Golpes de ventaja por jugador. Medal y Match se juegan con score neto.</p></div>
        <span class="pg-check">${d.useNet ? '✓' : ''}</span>
      </button>
    </div>
    <button class="btn primary big su-go" data-act="party-create" ${selGames.length ? '' : 'disabled'}>${golfIcon('flag')} ${selGames.length ? 'Crear party y código →' : 'Elige al menos un juego'}</button>
  </div>`;
}

/* Panel de apuesta/corta — estilizado (verde fosfo), arriba al comenzar */
function vBetPanel(p) {
  const stake = Number(p.stake) || 0;
  const games = Object.entries(p.games).filter(([, v]) => v).map(([k]) => Party.GAMES[k].name);
  return `<div class="bet-panel">
    <div class="bet-head"><span class="bet-tag">${golfIcon('card')} La apuesta</span><span class="bet-players">${p.players.length} jugador${p.players.length !== 1 ? 'es' : ''}</span></div>
    <div class="bet-amt">${stake ? `$${stake}` : 'Honor'}<i>${stake ? '/ unidad' : 'sin dinero'}</i></div>
    <div class="bet-games">${(games.length ? games : ['Sin juego']).map(g => `<span class="bet-chip">${esc(g)}</span>`).join('')}</div>
    ${stake ? `<p class="bet-note">El que pierde paga $${stake} por cada unidad de diferencia · se liquida al final.</p>` : `<p class="bet-note">Sin dinero — se juega por honor y para presumir.</p>`}
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

function vPartyLive() {
  const p = activeParty();
  if (!p || p.status === 'cancelled') { S.activeParty = null; V.view = 'social'; return vShell(vSocial()); }
  if (p.status === 'done') { V.partyView = p.id; return vPartyDone(); }
  const h = p.holes[p.idx];
  const chole = partyHole(p, p.idx);
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
      <span class="hof">Par ${h.par}${chole && chole.yds ? ` · ${chole.yds} yds` : ''}${ms ? ` · ${ms.text}` : ''}</span></div>
    ${vCortaBar(p, p.idx)}

    ${(() => {
      const ap = (V.capPid && p.players.some(x => x.pid === V.capPid)) ? V.capPid : p.players[0].pid;
      const apl = p.players.find(x => x.pid === ap);
      const c = pcap(h, ap, h.par);
      const sugg = suggestScore(c);
      const score = c.touched ? c.score : sugg;
      const scoreOf = pl => { const cc = h.cap && h.cap[pl.pid]; if (!cc) return null; const sg = suggestScore(cc); return cc.touched ? cc.score : sg; };
      const filled = pl => scoreOf(pl) != null;
      const has = (k) => (h[k] || []).includes(ap);
      const reg = (h.reg && h.reg[ap]) || 0;
      const lpv = (h.longputt && h.longputt[ap]) || 0;
      const net = p.games.corta ? Party.unidades(p, p.idx + 1)[ap] : null;
      const bdg = score != null ? (score - h.par <= -2 ? 'Águila' : score - h.par === -1 ? 'Birdie' : '') : '';
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
      return `
    <div class="group">
      <div class="g-lab"><span class="label">Jugador</span><span class="small muted">cada quien llena su hoyo</span></div>
      <div class="chips">${p.players.map(pl => `<button class="chip ${pl.pid === ap ? 'on' : ''}" data-act="pa-player" data-pid="${pl.pid}">${filled(pl) ? '✓ ' : ''}${esc(pl.name.split(' ')[0])}${scoreOf(pl) != null ? ` · ${scoreOf(pl)}` : ''}</button>`).join('')}</div>
    </div>

    <div class="card wz">
      <div class="wz-tabs">${tabs}</div>
      <div class="wz-body">${body}</div>
      ${ci > 0 ? `<button class="wz-back" data-act="pa-wiz-back">← Atrás</button>` : ''}
    </div>

    ${p.games.corta ? `<div class="card cx">
      <span class="label">La corta · extras de ${esc(apl.name.split(' ')[0])}</span>
      <div class="cx-grid">
        <button class="cx-btn ${has('sandy') ? 'on' : ''}" data-act="pa-sandy" data-pid="${ap}"><span class="cx-lab">Sandy</span><span class="cx-val pos">+1</span></button>
        <button class="cx-btn ${has('holeout') ? 'on' : ''}" data-act="pa-holeout" data-pid="${ap}"><span class="cx-lab">Hole-out</span><span class="cx-val pos">+1</span></button>
        <div class="cx-step"><span class="cx-lab">Más cerca <i>reg</i></span><div class="cx-ctrl"><button class="ph-pbtn" data-act="pa-reg" data-pid="${ap}" data-d="-1">−</button><b>${reg || 0}</b><button class="ph-pbtn" data-act="pa-reg" data-pid="${ap}" data-d="1">+</button></div></div>
        <div class="cx-step"><span class="cx-lab">Banderas <i>putt largo</i></span><div class="cx-ctrl"><button class="ph-pbtn" data-act="pa-longputt" data-pid="${ap}" data-d="-1">−</button><b>${lpv}</b><button class="ph-pbtn" data-act="pa-longputt" data-pid="${ap}" data-d="1">+</button></div></div>
        <button class="cx-btn neg ${has('threeputt') ? 'on' : ''}" data-act="pa-3putt" data-pid="${ap}"><span class="cx-lab">3-putt</span><span class="cx-val neg">−1</span></button>
        <button class="cx-btn neg ${has('espanol') ? 'on' : ''}" data-act="pa-espanol" data-pid="${ap}"><span class="cx-lab">Español</span><span class="cx-val neg">−1</span></button>
      </div>
    </div>` : ''}`;
    })()}

    <button class="btn ghost" data-act="pa-money">${golfIcon('card')} Ver tabla</button>
    <div class="btn-row">
      ${p.idx > 0 ? `<button class="btn" style="flex:0 0 30%" data-act="pa-prev">←</button>` : ''}
      <button class="btn primary" data-act="${last ? 'pa-finish' : 'pa-next'}">${last ? 'Finalizar party' : 'Siguiente hoyo →'}</button>
    </div>

    <div class="card" style="margin-top:18px">
      <span class="label">Tarjeta</span>
      ${scorecardTable(
        p.holesCount,
        i => (p.holes[i] ? p.holes[i].par : (partyHole(p, i) ? partyHole(p, i).par : Stats.PAR_SEQ[i % 18])),
        p.players.map(pl => ({ name: pl.name.split(' ')[0], scoreOf: i => (p.holes[i] ? p.holes[i].scores[pl.pid] : null) })),
        p.idx
      )}
    </div>
    ${V.showMoney ? `<div class="overlay" data-act="pa-money-close"><div class="sheet" data-act="noop">
      <div class="grab"></div><h2>${golfIcon('card')} Tabla en vivo</h2>
      ${p.games.corta ? vCortaBar(p, p.idx) : ''}
      ${vPartyTable(p, p.idx)}
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
    <button class="btn primary" data-act="party-close-done">Listo ✓</button>
  </div>`;
}

/* ---------- Acciones ---------- */
function partyHole(p, i) { return (p.courseId && COURSES[p.courseId] && COURSES[p.courseId].holes[i]) ? COURSES[p.courseId].holes[i] : null; }
function makeHoleForParty(p, i) {
  const ch = partyHole(p, i);
  const par = ch ? ch.par : Stats.PAR_SEQ[i % 18];
  return { par, scores: {}, putts: {}, cap: {}, fw: [], gir: [], ud: [], sandy: [], holeout: [], threeputt: [], espanol: [], reg: {}, longputt: {} };
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
    V.partyDraft = { courseId: 'campestre', useNet: false, stake: 20, games: { corta: false, skins: false, larga: false, gogo: false, birdie: false, medal: true, nassau: false, match: false } };
    go('party-setup');
  },
  'pd-pick-course'(d) { if (COURSES[d.c]) V.partyDraft.courseId = d.c; render(); },
  'pd-game'(d) { V.partyDraft.games[d.g] = !V.partyDraft.games[d.g]; render(); },   // multi-selección
  'pd-net'() { V.partyDraft.useNet = !V.partyDraft.useNet; render(); },
  'pd-stake'(d) { V.partyDraft.stake = Number(d.v) || 0; render(); },
  'party-create'() {
    const d = V.partyDraft;
    const u = cur();
    const hostPid = Store.uid();
    const cid = (d.courseId && COURSES[d.courseId]) ? d.courseId : 'campestre';
    const party = {
      id: Store.uid(),
      code: Party.newCode(S.parties.map(x => x.code)),
      date: new Date().toISOString().slice(0, 10),
      hostUserId: u.id, hostPid,
      course: COURSES[cid].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''),
      courseId: cid,
      holesCount: COURSES[cid].holes.length,
      games: { ...d.games },
      useNet: !!d.useNet,
      stake: Number(d.stake) || 0,
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
    V.capPid = p.players[0].pid;
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
  'pa-next'() {
    const p = activeParty();
    if (p.idx + 1 >= p.holesCount) return;
    p.idx++;
    if (!p.holes[p.idx]) p.holes[p.idx] = makeHoleForParty(p, p.idx);
    V.capPid = p.players[0].pid; V.pWizStep = null;
    pcommit(p); window.scrollTo(0, 0);
  },
  'pa-prev'() { const p = activeParty(); if (p.idx > 0) { p.idx--; V.capPid = p.players[0].pid; V.pWizStep = null; pcommit(p); window.scrollTo(0, 0); } },
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
  const holes = course.holes.map(ch => {
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
    courseId: cid, holesCount: course.holes.length,
    games: { corta: true, medal: true, match: false }, useNet: false,
    players, holes, idx: course.holes.length - 1, status: 'done', rev: 0, ts: Date.now(),
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
  if (added) Store.save(S);
}
