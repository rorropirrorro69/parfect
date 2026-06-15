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
      <span class="label">Juego corto · ${agg.scrPct.toFixed(0)}% up/down</span>
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
  const body = tab === 'diag' ? vDiag() : tab === 'drills' ? vDrillsLibrary() : tab === 'cal' ? vCalendar()
    : tab === 'estrategia' ? vStrategy() : tab === 'stats' ? vStats() : tab === 'logros' ? vTrophies() : vTracker();
  const T = (id, label) => `<button class="tab ${tab === id ? 'on' : ''}" data-act="trainer-tab" data-t="${id}">${label}</button>`;
  return `<div class="sec-h"><h2>Parfect Trainer</h2></div>
    <div class="tabs" style="flex-wrap:wrap">
      ${T('diag', 'Diagnóstico IA')}${T('drills', 'Drills')}${T('tracker', 'Tracker')}${T('cal', 'Calendario')}${T('estrategia', 'Estrategia')}${T('stats', 'Stats')}${T('logros', 'Logros')}
    </div>
    ${body}`;
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
    return `<div class="card empty"><div class="e-ico">🧠</div><h3>Diagnóstico IA</h3>
      <p>La IA cruza tus ${agg.rounds} rondas (${agg.holesPlayed} hoyos) para detectar dónde se van los golpes de más — y qué practicar.</p>
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
        ${f.drills.map(dr => `<div class="drill"><b>${esc(dr.name)}</b>
          ${drillArt(f.key)}
          <p>${esc(dr.desc)}</p>
          <div class="d-meta"><span>📋 ${esc(dr.dose)}</span><span>🎯 ${esc(dr.metric)}</span></div></div>`).join('')}
      ` : ''}
      <p class="label" style="margin-top:14px">Estrategia de campo</p>
      ${f.tips.map(t => `<p class="tip">${esc(t)}</p>`).join('')}
    </div>`).join('') +
    `<button class="btn ghost" data-act="diagnose">↻ Recalcular diagnóstico</button>
     <p class="note">Registra los drills en Parfect Tracker para medir tu progreso real.</p>`;
}

/* ---------- Biblioteca de drills (50) ---------- */
function vDrillsLibrary() {
  const cat = V.drillCat || 'fw';
  const meta = DRILL_CATS.find(c => c.id === cat);
  const list = DRILL_LIBRARY.filter(d => d.cat === cat);
  const chips = DRILL_CATS.map(c => {
    const n = DRILL_LIBRARY.filter(d => d.cat === c.id).length;
    return `<button class="tab ${c.id === cat ? 'on' : ''}" data-act="drill-cat" data-c="${c.id}">${esc(c.label)} <span class="muted">${n}</span></button>`;
  }).join('');
  const cards = list.map(d => `<div class="drill">
    <b>${esc(d.name)}</b>
    <p>${esc(d.desc)}</p>
    <div class="d-meta"><span>📋 ${esc(d.dose)}</span><span>🎯 ${esc(d.metric)}</span></div>
  </div>`).join('');
  return `<p class="note" style="margin-top:14px">${DRILL_LIBRARY.length} ejercicios para cada parte de tu juego. Elige una categoría.</p>
    <div class="tabs" style="flex-wrap:wrap">${chips}</div>
    <div class="card" style="margin-top:14px">
      <span class="label">${esc(meta.label)} · ${list.length} drills</span>
      ${drillArt(meta.art)}
      ${cards}
    </div>`;
}

/* ---------- Parfect Tracker (personalizado por palos) ---------- */
const CLUBS = [
  { id: 'dr', name: 'Driver', group: 'largo', gap: 40 },
  { id: 'w3', name: 'Madera 3', group: 'largo', gap: 40 },
  { id: 'w5', name: 'Madera 5', group: 'largo', gap: 40 },
  { id: 'w7', name: 'Madera 7', group: 'largo', gap: 40 },
  { id: 'h4', name: 'Híbrido 4', group: 'largo', gap: 40 },
  { id: 'h5', name: 'Híbrido 5', group: 'largo', gap: 40 },
  { id: 'h6', name: 'Híbrido 6', group: 'largo', gap: 40 },
  { id: 'i3', name: 'Fierro 3', group: 'hierros', gap: 40 },
  { id: 'i4', name: 'Fierro 4', group: 'hierros', gap: 40 },
  { id: 'i5', name: 'Fierro 5', group: 'hierros', gap: 40 },
  { id: 'i6', name: 'Fierro 6', group: 'hierros', gap: 40 },
  { id: 'i7', name: 'Fierro 7', group: 'hierros', gap: 40 },
  { id: 'i8', name: 'Fierro 8', group: 'hierros', gap: 40 },
  { id: 'i9', name: 'Fierro 9', group: 'hierros', gap: 40 },
  { id: 'pw', name: 'Pitching Wedge', group: 'wedges', gap: 20 },
  { id: 'w50', name: 'Wedge 50', group: 'wedges', gap: 20 },
  { id: 'w52', name: 'Wedge 52', group: 'wedges', gap: 20 },
  { id: 'w54', name: 'Wedge 54', group: 'wedges', gap: 20 },
  { id: 'w56', name: 'Wedge 56', group: 'wedges', gap: 20 },
  { id: 'w58', name: 'Wedge 58', group: 'wedges', gap: 20 },
  { id: 'w60', name: 'Wedge 60', group: 'wedges', gap: 20 },
];
const CLUB_DEFAULT = { dr: 250, w3: 230, w5: 215, w7: 200, h4: 210, h5: 200, h6: 190, i3: 200, i4: 190, i5: 180, i6: 170, i7: 160, i8: 150, i9: 140, pw: 130, w50: 115, w52: 105, w54: 95, w56: 85, w58: 78, w60: 70 };
const DEFAULT_BAG = ['dr', 'w3', 'h4', 'i5', 'i6', 'i7', 'i8', 'i9', 'pw', 'w52', 'w56', 'w60'];
const CLUB_EFF_DEFAULT = 70;
/* clubs[id] puede ser número (carry, formato viejo) o {c:carry, e:efectividad%} */
function clubC(clubs, id) { const v = clubs && clubs[id]; if (v == null) return null; return typeof v === 'number' ? v : (v.c != null ? v.c : null); }
function clubE(clubs, id) { const v = clubs && clubs[id]; if (v != null && typeof v === 'object' && v.e != null) return v.e; return null; }
const GROUP_META = { largo: { cat: 'Juego largo', icon: '🏌️' }, hierros: { cat: 'Hierros', icon: '🎯' }, wedges: { cat: 'Wedges', icon: '⛳' } };

const APPROACH_GROUP = { cat: 'Approach', icon: '🟢', drills: [
  { name: 'Up & down 40 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
  { name: 'Up & down 30 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
  { name: 'Up & down 10 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
] };
const PUTT_GROUP = { cat: 'Putt', icon: '🥅', drills: [
  { name: 'Putt 3 ft', area: 'Putt', goal: 'seguidos', target: 10, timer: 20 },
  { name: 'Putt 5 ft', area: 'Putt', goal: 'seguidos', target: 10, timer: 20 },
  { name: 'Putt 7 ft', area: 'Putt', goal: '', target: 10, timer: 20 },
  { name: 'Putt 10 ft', area: 'Putt', goal: '', target: 10, timer: 20 },
  { name: 'Putt 15 ft', area: 'Putt', goal: 'dejándola a 3 ft (gimme)', target: 10, timer: 20 },
  { name: 'Putt 20 ft', area: 'Putt', goal: 'a distancia de dada', target: 10, timer: 20 },
  { name: 'Putt 30 ft', area: 'Putt', goal: 'a distancia de dada', target: 10, timer: 20 },
] };

/* Construye el plan del jugador según los palos que tenga (o una bolsa por defecto) */
function trackerPlan(u) {
  const clubs = (u && u.clubs) || {};
  const personalized = Object.keys(clubs).some(k => clubs[k] != null);
  const inBag = c => personalized ? clubs[c.id] != null : DEFAULT_BAG.includes(c.id);
  const carry = c => (clubC(clubs, c.id) != null ? clubC(clubs, c.id) : CLUB_DEFAULT[c.id]);
  const drillFor = c => ({ name: c.name, area: GROUP_META[c.group].cat, goal: `${carry(c)} yds, hueco de ${c.gap} yds`, target: 7, timer: 20 });
  const groups = [];
  for (const g of ['largo', 'hierros', 'wedges']) {
    const cs = CLUBS.filter(c => c.group === g && inBag(c));
    if (cs.length) groups.push({ ...GROUP_META[g], drills: cs.map(drillFor) });
  }
  groups.push(APPROACH_GROUP, PUTT_GROUP);
  return { groups, personalized };
}

function vTracker() {
  return `<div class="sec-h"><h2>Parfect Tracker</h2><span class="small muted">tu práctica, medida</span></div>
    ${vTrackerPlan()}
    ${V.drillLog ? vDrillSheet() : ''}`;
}

function vTrackerPlan() {
  const u = cur();
  const plan = trackerPlan(u);
  const list = myPractices();
  const lastOf = name => [...list].reverse().find(p => p.drill === name);
  const banner = plan.personalized
    ? `<p class="note" style="margin-top:14px">Plan basado en tus palos. <button class="lk" data-act="go-clubs">Editar palos →</button></p>`
    : `<div class="card" style="margin-top:14px"><span class="label">Personaliza tu plan 🎒</span>
        <p class="note" style="margin-top:2px">Carga tus palos y distancias (carry) y el plan se arma a tu medida.</p>
        <button class="btn primary" data-act="go-clubs">Cargar mis palos</button></div>`;
  const cats = plan.groups.map(c => {
    const rows = c.drills.map(d => {
      const last = lastOf(d.name);
      const pct = last ? Math.round((last.hits / last.attempts) * 100) : 0;
      const hit = last && last.hits >= d.target;
      return `<button class="row" data-act="drill-open" data-name="${esc(d.name)}" data-target="${d.target}" data-area="${esc(d.area || c.cat)}" data-goal="${esc(d.goal || '')}" data-timer="${d.timer}">
        <div class="r-main"><b>${esc(d.name)}${hit ? ' ✓' : ''}</b><span>${d.target}/${d.target}${d.goal ? ' · ' + esc(d.goal) : ''} · ${d.timer} min</span></div>
        <div class="r-side">${last ? `<b>${last.hits}/${last.attempts}</b><span>${pct}%</span>` : `<span class="muted small">registrar →</span>`}</div>
      </button>`;
    }).join('');
    return `<div class="sec-h" style="margin-top:20px"><h2 style="font-size:16px">${c.icon} ${esc(c.cat)}</h2></div>${rows}`;
  }).join('');
  return `${banner}<p class="note">Toca un drill para registrar tu resultado. La meta es completar la cuenta en 20 min.</p>${cats}`;
}

function vDrillSheet() {
  const d = V.drillLog;
  return `<div class="overlay" data-act="drill-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>${esc(d.name)}</h2>
    <p class="auth-sub">${d.goal ? esc(d.goal) + ' · ' : ''}${d.timer} min · meta ${d.target}/${d.target}</p>
    <div class="score-row" style="margin-top:20px">
      <div class="sc-val"><span class="sc-num">${d.hits}</span><span class="sc-rel">/ ${d.target} aciertos</span></div>
      <div class="stepper">
        <button data-act="drill-hit" data-d="-1">−</button>
        <button data-act="drill-hit" data-d="1">+</button>
      </div>
    </div>
    <button class="btn primary" data-act="drill-save">Guardar resultado</button>
    <button class="btn" data-act="drill-close">Cancelar</button>
  </div></div>`;
}

/* ---------- Editor de palos (perfil) ---------- */
function vClubs() {
  const u = cur();
  const clubs = u.clubs || {};
  const groupName = { largo: 'Maderas e híbridos', hierros: 'Hierros', wedges: 'Wedges' };
  const sections = ['largo', 'hierros', 'wedges'].map(g => {
    const rows = CLUBS.filter(c => c.group === g).map(c => `
      <div class="club-row">
        <label>${esc(c.name)}</label>
        <div class="club-in">
          <input id="club-c-${c.id}" type="number" inputmode="numeric" placeholder="${CLUB_DEFAULT[c.id]}" value="${clubC(clubs, c.id) != null ? clubC(clubs, c.id) : ''}"><span>yds</span>
          <input id="club-e-${c.id}" type="number" inputmode="numeric" min="0" max="100" placeholder="${CLUB_EFF_DEFAULT}" value="${clubE(clubs, c.id) != null ? clubE(clubs, c.id) : ''}" style="width:58px"><span>%</span>
        </div>
      </div>`).join('');
    return `<div class="card"><span class="label">${groupName[g]}</span><p class="note" style="margin-top:0;margin-bottom:6px">Carry (yds) · Efectividad (%)</p>${rows}</div>`;
  }).join('');
  return `<button class="auth-back" data-act="nav" data-view="trainer">← Trainer</button>
    <h1 class="auth-h">Mis palos</h1>
    <p class="auth-sub">Para cada palo que uses: su carry (cuánto vuela) y tu efectividad (qué tan seguido lo pegas bien, 0–100%). Con esto la estrategia recomienda tus tiros. Deja en blanco los que no uses.</p>
    ${sections}
    <button class="btn primary" data-act="save-clubs">Guardar mis palos</button>
    <button class="btn" data-act="nav" data-view="trainer">Cancelar</button>`;
}

/* ---------- Calendario (estilo Apple, mensual) ---------- */
const FOCUS_LABEL = { driving: 'Driving', approach: 'Hierros', short: 'Juego corto', putting: 'Putting' };
const CAL_WD = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const CAL_WD_FULL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const EV_LABEL = { ronda: 'Ronda', entreno: 'Entreno', descanso: 'Descanso' };
const EV_ICON = { ronda: '⛳', entreno: '🛠️', descanso: '😴' };

function isoLocal(d) { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); }
function todayLocal() { return isoLocal(new Date()); }

function calDateLabel(iso) {
  const d = new Date(iso + 'T12:00:00');
  const base = new Date(todayLocal() + 'T12:00:00');
  const diff = Math.round((d - base) / 864e5);
  const rel = diff <= 0 ? 'hoy' : diff === 1 ? 'mañana' : `en ${diff} días`;
  return `${CAL_WD_FULL[(d.getDay() + 6) % 7]} ${d.getDate()} ${d.toLocaleDateString('es-MX', { month: 'short' })} · ${rel}`;
}

/* IA: arma la próxima semana respetando el día de cierre del club */
function generateAIPlan(u) {
  const closedDay = u.closedDay != null ? u.closedDay : 0; // Lun por defecto
  const agg = Stats.aggregate(myRounds());
  let focuses = ['Putting', 'Juego corto', 'Hierros', 'Driving'];
  if (agg) focuses = Trainer.analyze(agg, u).focus.map(f => FOCUS_LABEL[f.key] || f.titulo);
  let rounds = u.roundsPerWeek != null ? u.roundsPerWeek : 1;
  let trains = u.trainPerWeek != null ? u.trainPerWeek : 3;
  const start = new Date(); start.setHours(12, 0, 0, 0);
  const days = []; for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push(d); }
  const open = days.filter(d => ((d.getDay() + 6) % 7) !== closedDay);
  const out = [], used = new Set(); let fi = 0;
  const weekendFirst = [...open].sort((a, b) => (((a.getDay() + 6) % 7) >= 5 ? 0 : 1) - (((b.getDay() + 6) % 7) >= 5 ? 0 : 1));
  for (const d of weekendFirst) { if (rounds <= 0) break; const iso = isoLocal(d); if (used.has(iso)) continue; out.push({ id: Store.uid(), date: iso, type: 'ronda', title: 'Ronda', ai: true }); used.add(iso); rounds--; }
  for (const d of open) { if (trains <= 0) break; const iso = isoLocal(d); if (used.has(iso)) continue; out.push({ id: Store.uid(), date: iso, type: 'entreno', title: focuses[fi % focuses.length], ai: true }); used.add(iso); fi++; trains--; }
  let idx = 0; while (trains > 0 && open.length && idx < 30) { const iso = isoLocal(open[idx % open.length]); out.push({ id: Store.uid(), date: iso, type: 'entreno', title: focuses[fi % focuses.length], ai: true }); fi++; trains--; idx++; }
  return out;
}

function vCalendar() {
  const u = cur();
  const now = new Date();
  if (V.calY == null) { V.calY = now.getFullYear(); V.calM = now.getMonth(); }
  if (!V.calSel) V.calSel = todayLocal();
  const y = V.calY, m = V.calM;
  const closedDay = u.closedDay != null ? u.closedDay : 0;
  const events = u.events || [];
  const byDate = {};
  for (const e of events) (byDate[e.date] = byDate[e.date] || []).push(e);

  const first = new Date(y, m, 1);
  const pad = (first.getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const tl = todayLocal();
  let cells = '';
  for (let i = 0; i < pad; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let day = 1; day <= dim; day++) {
    const iso = isoLocal(new Date(y, m, day));
    const wd = (new Date(y, m, day).getDay() + 6) % 7;
    const dots = (byDate[iso] || []).slice(0, 3).map(e => `<i class="cal-dot ${e.type}"></i>`).join('');
    const cls = [iso === tl ? 'today' : '', iso === V.calSel ? 'sel' : '', wd === closedDay ? 'closed' : ''].join(' ');
    cells += `<button class="cal-cell ${cls}" data-act="cal-day-sel" data-date="${iso}"><span class="cal-n">${day}</span><div class="cal-dots">${dots}</div></button>`;
  }
  const ml = first.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const monthLabel = ml.charAt(0).toUpperCase() + ml.slice(1);

  const selD = new Date(V.calSel + 'T12:00:00');
  const selWd = (selD.getDay() + 6) % 7;
  const selHead = `${CAL_WD_FULL[selWd]} ${selD.getDate()} ${selD.toLocaleDateString('es-MX', { month: 'short' })}`;
  const selEvs = byDate[V.calSel] || [];
  const selList = selEvs.length
    ? selEvs.map(e => `<div class="row">
        <div class="r-main"><b>${EV_ICON[e.type]} ${esc(e.title || EV_LABEL[e.type])}</b><span>${EV_LABEL[e.type]}${e.ai ? ' · sugerido IA' : ''}</span></div>
        <button class="pl-x" data-act="cal-del" data-id="${e.id}">✕</button>
      </div>`).join('')
    : `<p class="note">Sin eventos${selWd === closedDay ? ' · club cerrado' : ''}.</p>`;
  const addType = V.calAddType || 'entreno';
  const typeChips = ['entreno', 'ronda', 'descanso'].map(t => `<button class="chip sm ${addType === t ? 'on' : ''}" data-act="cal-addtype" data-t="${t}">${EV_LABEL[t]}</button>`).join('');

  const upcoming = events.filter(e => e.date >= tl && e.type !== 'descanso').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const agenda = upcoming.length
    ? upcoming.map(e => `<button class="row" data-act="cal-day-sel" data-date="${e.date}">
        <div class="r-main"><b>${EV_ICON[e.type]} ${esc(e.title || EV_LABEL[e.type])}</b><span>${calDateLabel(e.date)}</span></div>
        <span class="muted">›</span>
      </button>`).join('')
    : `<p class="note">Nada agendado. Usa "Planear mi semana" o agrega un evento.</p>`;

  return `
    <div class="card">
      <div class="cal-head">
        <button class="cal-nav" data-act="cal-prev">‹</button>
        <span class="cal-month">${monthLabel}</span>
        <button class="cal-nav" data-act="cal-next">›</button>
      </div>
      <div class="cal-grid">
        ${CAL_WD.map(w => `<div class="cal-wd">${w}</div>`).join('')}
        ${cells}
      </div>
      <div class="cal-legend"><span><i class="cal-dot ronda"></i>Ronda</span><span><i class="cal-dot entreno"></i>Entreno</span><span><i class="cal-dot descanso"></i>Descanso</span></div>
    </div>

    <div class="card">
      <span class="label">${selHead}</span>
      ${selList}
      <div class="chips" style="margin-top:12px">${typeChips}</div>
      <div class="join-row" style="margin-top:10px">
        <input id="cal-title" placeholder="${addType === 'ronda' ? 'Campo' : addType === 'entreno' ? 'Enfoque (ej. Putting)' : 'Nota'}">
        <button class="btn sm primary" data-act="cal-add">Agregar</button>
      </div>
    </div>

    <div class="card">
      <span class="label">Planear con IA</span>
      <p class="note" style="margin-top:0;margin-bottom:8px">Arma tu semana según tu ritmo. El club cierra los ${CAL_WD_FULL[closedDay].toLowerCase()}.</p>
      <div class="ph-head"><div class="r-main" style="flex:1"><b>Entrenamientos</b><span class="muted">por semana</span></div>
        <div class="stepper sm"><button data-act="cal-train" data-d="-1">−</button><span class="pl-score">${u.trainPerWeek != null ? u.trainPerWeek : 3}</span><button data-act="cal-train" data-d="1">+</button></div></div>
      <div class="ph-head" style="margin-top:10px;border-top:1px solid var(--line-soft);padding-top:10px"><div class="r-main" style="flex:1"><b>Rondas</b><span class="muted">por semana</span></div>
        <div class="stepper sm"><button data-act="cal-rounds" data-d="-1">−</button><span class="pl-score">${u.roundsPerWeek != null ? u.roundsPerWeek : 1}</span><button data-act="cal-rounds" data-d="1">+</button></div></div>
      <p class="label" style="margin-top:14px">El club cierra los</p>
      <div class="chips">${CAL_WD_FULL.map((w, i) => `<button class="chip sm ${closedDay === i ? 'on' : ''}" data-act="cal-closed" data-d="${i}">${w}</button>`).join('')}</div>
      <button class="btn primary" data-act="cal-ai" style="margin-top:14px">✨ Planear mi semana</button>
    </div>

    <div class="sec-h"><h2 style="font-size:16px">Próximos eventos</h2></div>
    ${agenda}`;
}

/* ---------- Social ---------- */
function vSocial() {
  const u = cur();
  const players = S.users.map(p => {
    const agg = Stats.aggregate(S.rounds.filter(r => r.userId === p.id));
    return { p, agg };
  }).sort((a, b) => (a.agg ? a.agg.avgToPar : 99) - (b.agg ? b.agg.avgToPar : 99));

  const roundFeed = S.rounds.filter(r => !r.partyId).map(r => {
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
    const ms = p.games && p.games.match ? Party.matchStatus(p) : null;
    let winName = '—';
    if (ms) { winName = ms.leaderWon > ms.runnerWon ? plName(p, ms.leader).split(' ')[0] : 'Empate'; }
    else { const st = Party.standings(p).filter(r => r.holes); winName = st.length ? st[0].name.split(' ')[0] : '—'; }
    return { date: p.date, html: `<button class="row" data-act="party-open" data-id="${p.id}">
      <div class="r-main"><b>🎉 Party en ${esc(p.course)}</b>
      <span>${fmtDate(p.date)} · ${p.players.length} jugadores · código ${esc(p.code)}</span></div>
      <div class="r-side"><b>${esc(winName)}</b><span>ganador</span></div>
    </button>` };
  });
  const feed = [...partyFeed, ...roundFeed].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).map(x => x.html).join('');

  return `<div class="sec-h"><h2>Social</h2></div>
    <div class="card">
      <span class="label">🎉 Parfect Party · juega con amigos</span>
      <p class="small muted" style="margin-top:2px">Medal o Match play. Crea la party, comparte el código y cada quien anota desde su celular.</p>
      ${myActive ? `<button class="btn primary" data-act="party-resume">Continuar party ${esc(act.code)} ${act.status === 'live' ? `· hoyo ${act.idx + 1}` : '· lobby'}</button>`
        : `<button class="btn primary" data-act="party-new">Crear party</button>`}
      <div class="join-row" style="margin-top:12px">
        <input id="join-code" placeholder="Código (ej. K7M2)" maxlength="4" style="text-transform:uppercase">
        <button class="btn sm ghost" data-act="party-join" ${V.joining ? 'disabled' : ''}>${V.joining ? 'Buscando…' : 'Unirse'}</button>
      </div>
      ${V.err ? `<p class="form-err">${esc(V.err)}</p>` : ''}
    </div>
    <div class="card">
      <span class="label">Amigos</span>
      <button class="friend-row" data-act="friend" data-id="${u.id}">
        <span class="avatar-btn" style="width:42px;height:42px;font-size:15px">${esc(initials(u.name))}</span>
        <div class="r-main" style="flex:1"><b>${esc(u.name)} (tú)</b><span>HCP ${fmtHcp(u.hcp)} · tu perfil</span></div>
        <span class="muted">›</span>
      </button>
      ${players.filter(x => x.p.id !== u.id).map(x => `<button class="friend-row" data-act="friend" data-id="${x.p.id}">
        <span class="avatar-btn" style="width:42px;height:42px;font-size:15px;background:var(--lime-faint)">${esc(initials(x.p.name))}</span>
        <div class="r-main" style="flex:1"><b>${esc(x.p.name)}</b><span>HCP ${fmtHcp(x.p.hcp)} · ${x.agg ? x.agg.rounds + ' rondas' : 'sin rondas'}</span></div>
        <div class="r-side"><b>${x.agg ? fmtToPar(Math.round(x.agg.avgToPar)) : '—'}</b><span>prom/18 ›</span></div>
      </button>`).join('')}
      <button class="btn sm ghost" data-act="friend-soon" style="margin-top:12px">➕ Agregar amigo</button>
      <p class="note">Toca a un amigo para ver su perfil y stats. Agregar amigos de otros dispositivos por código/usuario llegará con las cuentas en la nube.</p>
    </div>
    <div class="sec-h"><h2>Actividad</h2></div>
    ${feed || `<div class="card empty"><div class="e-ico">🏆</div><h3>Nada por aquí aún</h3><p>Las rondas guardadas aparecen en este feed.</p></div>`}`;
}

/* ---------- Perfil de un jugador (amigo) ---------- */
function vFriend() {
  const p = S.users.find(x => x.id === V.friendId);
  if (!p) { V.view = 'social'; return vSocial(); }
  const me = p.id === S.session;
  const rounds = S.rounds.filter(r => r.userId === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const agg = Stats.aggregate(rounds);
  const head = `<button class="auth-back" data-act="nav" data-view="social">← Social</button>
    <div class="greet" style="padding-top:6px">
      <div style="display:flex;align-items:center;gap:14px">
        <span class="avatar-btn" style="width:52px;height:52px;font-size:18px">${esc(initials(p.name))}</span>
        <div><h1 style="font-size:26px">${esc(p.name)}${me ? ' (tú)' : ''}</h1>
        <p class="hcp">HCP ${fmtHcp(p.hcp)} · Meta ${fmtHcp(p.goal)}</p></div>
      </div>
    </div>`;
  if (!agg) {
    return head + `<div class="card empty"><div class="e-ico">⛳</div><h3>Sin rondas todavía</h3><p>${me ? 'Aún no registras rondas.' : 'Este jugador aún no tiene rondas.'}</p></div>`;
  }
  const radar = Stats.radarOf(agg);
  return head + `
    <div class="grid2">
      ${statCard(agg.fwPct.toFixed(0) + '%', 'Fairways', agg.fwPct)}
      ${statCard(agg.girPct.toFixed(0) + '%', 'GIR', agg.girPct)}
      ${statCard(agg.scrPct.toFixed(0) + '%', 'Up/Down', agg.scrPct)}
      ${statCard(agg.putts18.toFixed(0), 'Putts / Ronda', Stats.clamp((38 - agg.putts18) / 11 * 100, 0, 100))}
    </div>
    <div class="card">
      <span class="label">Perfil de habilidades</span>
      <div class="radar-wrap">${radarSVG(radar.labels, radar.values)}</div>
    </div>
    <div class="card">
      <span class="label">Tarjetas recientes</span>
      ${rounds.slice(0, 6).map(r => {
        const s = Stats.roundStats(r);
        return `<div class="hist-row" style="cursor:default">
          <div class="r-main"><b>${esc(r.course)}${r.partyId ? ' 🎉' : ''}</b><span>${fmtDate(r.date)} · ${s.holes} hoyos · ${s.putts} putts</span></div>
          <div class="r-side"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
        </div>`;
      }).join('')}
    </div>`;
}
