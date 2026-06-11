/* ============ Avatar Stats, Parfect Trainer (+Tracker), Social ============ */

/* ---------- Avatar Stats ---------- */
function vStats() {
  const rounds = myRounds();
  const agg = Stats.aggregate(rounds);
  if (!agg) {
    return `<div class="sec-h"><h2>Avatar Stats</h2></div>
      <div class="card empty"><div class="e-ico">📊</div><h3>Sin datos todavía</h3>
      <p>Registra rondas para construir tu avatar de jugador.</p>
      <button class="btn primary" data-act="quick-round">Registrar ronda</button></div>`;
  }
  const radar = Stats.radarOf(agg);
  const mt = agg.missTee, ma = agg.missApp;
  const teeTot = mt.izq + mt.der + mt.penal || 1;
  const appTot = ma.corto + ma.largo + ma.izq + ma.der || 1;
  const bands = [['0-2', '0–2 m'], ['2-5', '2–5 m'], ['5-10', '5–10 m'], ['10+', '+10 m']];

  return `<div class="sec-h"><h2>Avatar Stats</h2><span class="small muted">${agg.rounds} rondas</span></div>

    <div class="grid2">
      ${statCard(agg.avgScore18.toFixed(1), 'Score promedio (18)', Stats.clamp(((110 - agg.avgScore18) / 40) * 100, 0, 100))}
      ${statCard(agg.bestScore != null ? String(agg.bestScore) : fmtToPar(agg.bestToPar), 'Mejor ronda', 100)}
    </div>

    <div class="card">
      <span class="label">Perfil de habilidades</span>
      <div class="radar-wrap">${radarSVG(radar.labels, radar.values)}</div>
    </div>

    <div class="card">
      <span class="label">Salida · ${agg.fwPct.toFixed(0)}% fairways</span>
      <div class="bar"><i style="width:${agg.fwPct}%"></i></div>
      <p class="note" style="margin-bottom:2px">Patrón de fallo del tee</p>
      ${mbar('← Izq', (mt.izq / teeTot) * 100, String(mt.izq))}
      ${mbar('Der →', (mt.der / teeTot) * 100, String(mt.der))}
      ${mbar('Penal', (mt.penal / teeTot) * 100, String(mt.penal))}
    </div>

    <div class="card">
      <span class="label">Approach · ${agg.girPct.toFixed(0)}% GIR</span>
      <div class="bar"><i style="width:${agg.girPct}%"></i></div>
      <p class="note" style="margin-bottom:2px">Dónde fallas los greens</p>
      ${mbar('Corto', (ma.corto / appTot) * 100, String(ma.corto))}
      ${mbar('Largo', (ma.largo / appTot) * 100, String(ma.largo))}
      ${mbar('← Izq', (ma.izq / appTot) * 100, String(ma.izq))}
      ${mbar('Der →', (ma.der / appTot) * 100, String(ma.der))}
    </div>

    <div class="card">
      <span class="label">Juego corto · ${agg.scrPct.toFixed(0)}% scrambling</span>
      <div class="bar"><i style="width:${agg.scrPct}%"></i></div>
      <p class="note">% de veces que salvas el par cuando fallas el green.</p>
    </div>

    <div class="card">
      <span class="label">Putting · ${agg.putts18.toFixed(1)} putts/ronda</span>
      <div class="grid2" style="margin-top:4px">
        <div><div class="stat-num" style="font-size:24px">${agg.threePct.toFixed(0)}%</div><div class="stat-cap">3-putts</div></div>
        <div><div class="stat-num" style="font-size:24px">${agg.puttsPerGir.toFixed(2)}</div><div class="stat-cap">Putts por GIR</div></div>
      </div>
      <p class="note" style="margin-bottom:2px">1-putt % por distancia del primer putt</p>
      ${bands.map(([k, lab]) => {
        const b = agg.puttsByDist[k];
        const p = b.n ? (b.one / b.n) * 100 : 0;
        return mbar(lab, p, b.n ? p.toFixed(0) + '%' : '—');
      }).join('')}
    </div>`;
}

/* ---------- Parfect Trainer ---------- */
function vTrainer() {
  const tab = V.trainerTab || 'diag';
  return `<div class="sec-h"><h2>Parfect Trainer</h2></div>
    <div class="tabs">
      <button class="tab ${tab === 'diag' ? 'on' : ''}" data-act="trainer-tab" data-t="diag">Diagnóstico IA</button>
      <button class="tab ${tab === 'tracker' ? 'on' : ''}" data-act="trainer-tab" data-t="tracker">Parfect Tracker</button>
    </div>
    ${tab === 'diag' ? vDiag() : vTracker()}`;
}

function vDiag() {
  const agg = Stats.aggregate(myRounds());
  if (!agg) {
    return `<div class="card empty"><div class="e-ico">🧠</div><h3>La IA necesita datos</h3>
      <p>Registra al menos una ronda y Parfect Trainer encontrará dónde se van tus golpes.</p>
      <button class="btn primary" data-act="quick-round">Registrar ronda</button></div>`;
  }
  if (V.diagBusy) {
    return `<div class="card empty"><div class="e-ico">🧠</div><h3>Analizando tus patrones…</h3>
      <p>Correlacionando ${agg.holesPlayed} hoyos, ${agg.rounds} rondas y 12+ métricas.</p></div>`;
  }
  if (!V.diag) {
    return `<div class="card empty"><div class="e-ico">🧠</div><h3>Diagnóstico de causa raíz</h3>
      <p>La IA cruza tus ${agg.rounds} rondas (${agg.holesPlayed} hoyos) para detectar exactamente dónde se van los golpes de más — y qué practicar.</p>
      <button class="btn primary" data-act="diagnose">Generar diagnóstico IA</button></div>`;
  }
  const d = V.diag;
  const warn = d.readiness === 'low'
    ? `<p class="note">⚠️ Con menos de 3 rondas el diagnóstico es preliminar. Cada ronda nueva lo afina.</p>` : '';
  return warn + d.focus.map((f, i) => `
    <div class="card">
      <span class="prio ${i > 0 ? 'p2' : ''}">${i === 0 ? 'Prioridad 1 · enfoque' : `Prioridad ${i + 1}`}</span>
      <h3 style="margin-top:12px;font-size:17px;font-weight:900">${esc(f.titulo)}</h3>
      <p class="small muted" style="margin-top:4px">~${f.lost.toFixed(1)} golpes/ronda en juego</p>
      <p style="font-size:14px;margin-top:10px">${esc(f.diag)}</p>
      ${i < 2 ? `
        <p class="label" style="margin-top:16px">Prescripción de drills</p>
        ${f.drills.map(dr => `<div class="drill"><b>${esc(dr.name)}</b><p>${esc(dr.desc)}</p>
          <div class="d-meta"><span>📋 ${esc(dr.dose)}</span><span>🎯 ${esc(dr.metric)}</span></div></div>`).join('')}
      ` : ''}
      <p class="label" style="margin-top:14px">Estrategia de campo</p>
      ${f.tips.map(t => `<p class="tip">${esc(t)}</p>`).join('')}
    </div>`).join('') +
    `<button class="btn ghost" data-act="diagnose">↻ Recalcular diagnóstico</button>
     <p class="note">Registra los drills en Parfect Tracker para medir tu progreso real.</p>`;
}

/* ---------- Parfect Tracker ---------- */
const AREAS = ['Driver', 'Hierros', 'Wedges', 'Chipping', 'Bunker', 'Putting'];

function vTracker() {
  const list = myPractices();
  const vals = V.trackVals || {};
  const byArea = {};
  for (const p of list) {
    (byArea[p.area] = byArea[p.area] || []).push(p);
  }
  const areaCards = Object.entries(byArea).map(([area, ps]) => {
    const acc = ps.reduce((a, p) => a + p.hits, 0) / Math.max(1, ps.reduce((a, p) => a + p.attempts, 0)) * 100;
    const half = Math.floor(ps.length / 2);
    let delta = '';
    if (ps.length >= 2) {
      const f = arr => arr.reduce((a, p) => a + p.hits, 0) / Math.max(1, arr.reduce((a, p) => a + p.attempts, 0)) * 100;
      const dd = f(ps.slice(half)) - f(ps.slice(0, half));
      delta = ` · ${dd >= 0 ? '▲' : '▼'} ${Math.abs(dd).toFixed(0)} pts`;
    }
    return `<div class="card">
      <span class="label">${esc(area)} · ${ps.length} sesiones${delta}</span>
      <div class="bar"><i style="width:${acc}%"></i></div>
      <p class="note">${acc.toFixed(0)}% de acierto acumulado</p>
    </div>`;
  }).join('');

  return `<div class="card">
      <span class="label">Registrar sesión de práctica</span>
      <div class="field" style="margin-top:4px"><label>Área</label>
        <select id="t-area">${AREAS.map(a => `<option ${vals.area === a ? 'selected' : ''}>${a}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Drill</label><input id="t-drill" placeholder="ej. Gate de putter (1 m)" value="${esc(vals.drill || '')}"></div>
      <div class="field-row">
        <div class="field"><label>Intentos</label><input id="t-att" type="number" min="1" inputmode="numeric" placeholder="10" value="${esc(vals.att || '')}"></div>
        <div class="field"><label>Aciertos</label><input id="t-hits" type="number" min="0" inputmode="numeric" placeholder="7" value="${esc(vals.hits || '')}"></div>
      </div>
      ${V.err ? `<p class="form-err">${esc(V.err)}</p>` : ''}
      <button class="btn primary" data-act="practice-add">Guardar sesión</button>
    </div>
    ${areaCards}
    ${list.length ? `<div class="sec-h"><h2>Historial</h2><span class="small muted">${list.length} sesiones</span></div>` +
      [...list].reverse().slice(0, 12).map(p => `
      <div class="row">
        <div class="r-main"><b>${esc(p.drill || p.area)}</b><span>${esc(p.area)} · ${fmtDate(p.date)}</span></div>
        <div class="r-side"><b>${Math.round((p.hits / Math.max(1, p.attempts)) * 100)}%</b><span>${p.hits}/${p.attempts}</span></div>
      </div>`).join('')
    : `<div class="card empty"><div class="e-ico">📈</div><h3>Cuantifica tu práctica</h3><p>Registra cada drill con intentos y aciertos: la única forma de saber si de verdad estás mejorando.</p></div>`}`;
}

/* ---------- Social ---------- */
function vSocial() {
  const u = cur();
  const players = S.users.map(p => {
    const agg = Stats.aggregate(S.rounds.filter(r => r.userId === p.id));
    return { p, agg };
  }).sort((a, b) => (a.agg ? a.agg.avgToPar : 99) - (b.agg ? b.agg.avgToPar : 99));

  const roundFeed = S.rounds.map(r => {
    const owner = S.users.find(x => x.id === r.userId);
    const s = Stats.roundStats(r);
    const fwP = s.fwTot ? Math.round((s.fw / s.fwTot) * 100) : 0;
    return { date: r.date, html: `<div class="row">
      <div class="r-main"><b>${esc(owner ? owner.name : '—')}${owner && owner.id === u.id ? ' (tú)' : ''} jugó ${esc(r.course)}</b>
      <span>${fmtDate(r.date)} · FW ${fwP}% · ${s.putts} putts</span></div>
      <div class="r-side"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
    </div>` };
  });

  const act = activeParty();
  const myActive = act && (act.hostUserId === u.id || act.players.some(x => x.userId === u.id));
  const partyFeed = S.parties.filter(p => p.status === 'done').map(p => {
    const { net } = Party.ledger(p);
    const top = [...p.players].sort((a, b) => net[b.pid] - net[a.pid])[0];
    return { date: p.date, html: `<button class="row" data-act="party-open" data-id="${p.id}">
      <div class="r-main"><b>🎉 Party en ${esc(p.course)}</b>
      <span>${fmtDate(p.date)} · ${p.players.length} jugadores · código ${esc(p.code)}</span></div>
      <div class="r-side"><b>${esc(top ? top.name.split(' ')[0] : '—')}</b><span>${top && net[top.pid] > 0 ? fmtMoney(net[top.pid]) : 'ganador'}</span></div>
    </button>` };
  });
  const feed = [...partyFeed, ...roundFeed].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).map(x => x.html).join('');

  return `<div class="sec-h"><h2>Social</h2></div>
    <div class="card">
      <span class="label">🎉 Parfect Party · juega y apuesta</span>
      <p class="small muted" style="margin-top:2px">Skins, La corta, La larga, Gogos, Birdies y Medal. Crea la party, comparte el código y las cuentas se llevan solas.</p>
      ${myActive ? `<button class="btn primary" data-act="party-resume">Continuar party ${esc(act.code)} ${act.status === 'live' ? `· hoyo ${act.idx + 1}` : '· lobby'}</button>`
        : `<button class="btn primary" data-act="party-new">Crear party</button>`}
      <div class="join-row" style="margin-top:12px">
        <input id="join-code" placeholder="Código (ej. K7M2)" maxlength="4" style="text-transform:uppercase">
        <button class="btn sm ghost" data-act="party-join">Unirse</button>
      </div>
      ${V.err ? `<p class="form-err">${esc(V.err)}</p>` : ''}
    </div>
    <div class="card">
      <span class="label">Leaderboard · este dispositivo</span>
      ${players.map((x, i) => `<div class="row" style="border:none;background:transparent;padding:10px 0;margin-top:0">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="rank">${i + 1}</span>
          <div class="r-main"><b>${esc(x.p.name)}${x.p.id === u.id ? ' (tú)' : ''}</b>
          <span>HCP ${fmtHcp(x.p.hcp)} · ${x.agg ? x.agg.rounds + ' rondas' : 'sin rondas'}</span></div>
        </div>
        <div class="r-side"><b>${x.agg ? fmtToPar(Math.round(x.agg.avgToPar)) : '—'}</b><span>prom/18</span></div>
      </div>`).join('')}
      <p class="note">Crea más cuentas en este dispositivo para competir cara a cara.</p>
    </div>
    <div class="sec-h"><h2>Actividad</h2></div>
    ${feed || `<div class="card empty"><div class="e-ico">🏆</div><h3>Nada por aquí aún</h3><p>Las rondas guardadas aparecen en este feed.</p></div>`}`;
}
