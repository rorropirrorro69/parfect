/* ============ Avatar Stats, Parfect Trainer (+Tracker), Social ============ */

/* ---------- Avatar Stats ---------- */
function vStats() {
  const rounds = myRounds();
  const agg = Stats.aggregate(rounds);
  if (!agg) {
    return `<div class="sec-h"><h2>Avatar Stats</h2></div>
      <div class="card empty"><div class="e-ico">${golfIcon('card')}</div><h3>Sin datos todavía</h3>
      <p>Registra rondas para construir tu avatar de jugador.</p>
      <button class="btn primary" data-act="quick-round">Registrar ronda</button></div>`;
  }
  const radar = Stats.radarOf(agg);
  const mt = agg.missTee, ma = agg.missApp;
  const teeTot = mt.izq + mt.der + mt.penal || 1;
  const appTot = ma.corto + ma.largo + ma.izq + ma.der || 1;
  const bands = [['0-3', '0–3 ft'], ['3-8', '3–8 ft'], ['8-20', '8–20 ft'], ['20+', '+20 ft']];

  return `<div class="sec-h"><h2>Avatar Stats</h2><span class="small muted">${agg.rounds} rondas</span></div>

    <div class="grid2">
      ${statCard(agg.avgScore18.toFixed(1), 'Score promedio (18)', Stats.clamp(((110 - agg.avgScore18) / 40) * 100, 0, 100))}
      ${statCard(agg.bestScore != null ? String(agg.bestScore) : fmtToPar(agg.bestToPar), 'Mejor ronda', 100)}
    </div>

    ${progressCard(cur(), rounds)}

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

/* reel de ejercicios recomendados según tus puntos débiles */
function vRecommendedDrills(u, agg) {
  if (!agg || typeof Trainer === 'undefined') return '';
  const focus = Trainer.analyze(agg, u).focus || [];
  if (!focus.length) return '';
  const recs = [];
  focus.slice(0, 3).forEach(f => (f.drills || []).slice(0, 2).forEach(d => recs.push({ key: f.key, area: FOCUS_LABEL[f.key] || f.titulo, name: d.name, desc: d.desc || '', target: f.key === 'putting' ? 10 : 7 })));
  if (!recs.length) return '';
  const cards = recs.map(d => `<button class="reel-card dr-card" data-act="drill-open" data-name="${esc(d.name)}" data-target="${d.target}" data-area="${esc(d.area)}" data-goal="" data-desc="${esc(d.desc)}" data-timer="20">
    <div class="dr-scene">${drillScene(d.name, d.key)}</div>
    <div class="reel-meta" style="padding:12px 14px 14px"><b style="font-size:14.5px">${esc(d.name)}</b><span>${esc(d.area)} · Entrenar →</span></div>
  </button>`).join('');
  return `<div class="sec-h" style="margin-top:2px"><h2 style="font-size:16px">Ejercicios recomendados</h2><span class="small muted">para tu meta</span></div>
    <div class="reel"><div class="reel-track">${cards}${cards}</div></div>`;
}

/* ---------- Parfect Trainer ---------- */
function vSensei(tab) {
  const agg = Stats.aggregate(myRounds());
  let msg;
  if (tab === 'entreno') msg = 'Elige tu sesión de hoy y domina <b>un drill a la vez</b>. La maestría es repetición. 🥷';
  else if (tab === 'objetivos') msg = 'Estas son tus metas. Vamos <b>una por una</b> — constancia sobre intensidad.';
  else if (!agg) msg = 'Soy tu sensei. Registra una ronda y te diré <b>dónde ganar golpes</b>.';
  else if (V.diag) msg = `Tu enfoque: <b>${esc((V.diag.focus[0] || {}).titulo || 'tu juego')}</b>. Entrénalo y baja golpes.`;
  else msg = 'Genera tu <b>diagnóstico</b> y te marco exactamente qué practicar primero.';
  return `<div class="sensei">
    <div class="sensei-av">${avatarImg(cur(), 'sensei-img', true)}<span class="sensei-badge">🥷</span></div>
    <div class="sensei-bubble"><b class="sensei-name">Sensei</b><p>${msg}</p></div>
  </div>`;
}
/* 4 áreas del juego con su nivel (0-100) y golpes por ganar, desde tus stats */
function trainerAreas(agg) {
  return [
    { cat: 'fw', label: 'Salida · Fairways', level: agg.fwPct, val: Math.round(agg.fwPct) + '%', gain: Math.max(0, (62 - agg.fwPct) / 100 * 2) },
    { cat: 'gir', label: 'Hierros al green · GIR', level: agg.girPct, val: Math.round(agg.girPct) + '%', gain: Math.max(0, (60 - agg.girPct) / 100 * 4) },
    { cat: 'ud', label: 'Juego corto · Up & down', level: agg.scrPct, val: Math.round(agg.scrPct) + '%', gain: Math.max(0, (55 - agg.scrPct) / 100 * 3) },
    { cat: 'putt', label: 'Putt', level: Math.max(0, Math.min(100, (36 - agg.putts18) / 12 * 100)), val: agg.putts18.toFixed(0) + ' putts', gain: Math.max(0, (agg.putts18 - 30) * 0.8) },
  ];
}
/* Sección 1: el sensei dice qué entrenar + el enfoque por stats */
function vTrainerPlan(agg) {
  const areas = trainerAreas(agg).sort((a, b) => a.level - b.level);
  const focus = areas[0];
  const drill = DRILL_LIBRARY.find(d => d.cat === focus.cat) || DRILL_LIBRARY[0];
  const focusName = focus.label.includes('·') ? focus.label.split('·')[1].trim() : focus.label;
  const cards = areas.map((a, i) => {
    const lv = a.level >= 60 ? 'strong' : a.level >= 40 ? 'mid' : 'weak';
    return `<button class="tr-area ${i === 0 ? 'focus' : ''}" data-act="train-area" data-c="${a.cat}">
      <span class="tr-rank ${lv}">${i + 1}</span>
      <div class="tr-area-mid">
        <div class="tr-area-top"><b>${a.label}</b><span>${a.val}</span></div>
        <div class="tr-bar ${lv}"><i style="width:${Math.round(a.level)}%"></i></div>
        <span class="tr-area-meta">${a.gain >= 0.3 ? `~${a.gain.toFixed(1)} golpes por ganar` : (i === 0 ? 'tu enfoque de hoy' : 'sólido · mantenlo')}</span>
      </div>
      <span class="tr-area-go">→</span>
    </button>`;
  }).join('');
  return `<div class="sensei tr-sensei">
      <div class="tr-sensei-av">${senseiBird()}</div>
      <div class="sensei-bubble"><b class="sensei-name">Sensei</b><p>Tu mayor fuga es <b>${esc(focusName)}</b>. Hoy entrena <b>${esc(drill.name)}</b> y baja golpes.</p></div>
    </div>
    <button class="btn primary big" data-act="drill-open" data-name="${esc(drill.name)}" style="margin-top:12px">Ver ejercicio de hoy →</button>
    <div class="sec-h" style="margin-top:20px"><h2 style="font-size:16px">Dónde ganar golpes</h2><span class="small muted">toca un área</span></div>
    <div class="tr-areas">${cards}</div>`;
}
/* Coach IA en vivo: lee tus stats actuales y te dice qué priorizar (en práctica y en campo) */
function vCoachLive(ctx, h) {
  const agg = Stats.aggregate(myRounds());
  if (!agg) {
    return `<div class="coach-live"><span class="cl-ava">IA</span><div class="cl-body"><span class="cl-tag">Coach en vivo</span><b>Aún te estoy conociendo</b><p>Registra tu primera ronda y empiezo a leerte en tiempo real.</p></div></div>`;
  }
  const issues = [
    { lab: 'Salidas', sev: 55 - (agg.fwPct || 0), tip: 'Tus salidas son tu mayor fuga. Hoy: 20 tiros buscando centrar la fairway, no distancia.', ctip: 'Menos club y apunta al centro — la fairway vale más que 15 yardas.' },
    { lab: 'Approach', sev: 52 - (agg.girPct || 0), tip: 'Pierdes greens. Practica wedges a 50 / 75 / 100 m hasta dejarla a 3 m.', ctip: 'Apunta al centro del green, no a la bandera.' },
    { lab: 'Juego corto', sev: 48 - (agg.scrPct || 0), tip: 'Tu up&down está bajo. 15 min de chips a un solo objetivo.', ctip: 'Si fallas el green, deja el chip cuesta arriba para subir el siguiente.' },
    { lab: 'Putt', sev: ((agg.putts18 || 30) - 31) * 4, tip: 'Putts de más. Trabaja lag-putt: 10 bolas a 8, 10 y 12 m.', ctip: 'En putts largos prioriza dejarla cerca, no meterla.' },
    { lab: 'Penales', sev: ((agg.penals18 || 0) - 1.5) * 7, tip: 'Los penales te cuestan golpes. Practica salida segura con híbrido.', ctip: 'En hoyos con OB, sal con híbrido y juega al centro.' },
  ].sort((a, b) => b.sev - a.sev);
  const top = issues[0];
  if (ctx === 'course') {
    return `<div class="coach-live cl-course"><span class="cl-ava">IA</span><div class="cl-body"><span class="cl-tag">Coach en vivo · ${top.lab}</span><p>${top.ctip}</p></div></div>`;
  }
  return `<div class="coach-live"><span class="cl-ava">IA</span><div class="cl-body"><span class="cl-tag">Coach en vivo</span><b>${top.lab}: tu prioridad ahora</b><p>${top.tip}</p></div></div>`;
}

/* Mini calendario: solo la próxima semana, para saber qué toca */
function vWeekStrip() {
  const u = cur();
  if (typeof ensureWeekPlan === 'function') ensureWeekPlan(u);
  const byDate = {};
  for (const e of (u.events || [])) (byDate[e.date] = byDate[e.date] || []).push(e);
  const dn = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const base = new Date();
  const cells = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(base); dt.setDate(base.getDate() + i);
    const iso = isoLocal(dt);
    const wd = (dt.getDay() + 6) % 7;
    const evs = byDate[iso] || [];
    const main = evs[0];
    const lab = main ? (main.title || EV_LABEL[main.type] || '').split(' ')[0] : 'Libre';
    return `<button class="wk-cell ${i === 0 ? 'today' : ''}" data-act="nav" data-view="social">
      <span class="wk-wd">${dn[wd]}</span>
      <span class="wk-num">${dt.getDate()}</span>
      <span class="wk-dots">${evs.slice(0, 3).map(e => `<i class="cal-dot ${e.type}"></i>`).join('') || '<i class="wk-empty"></i>'}</span>
      <span class="wk-lab">${esc(lab)}</span>
    </button>`;
  }).join('');
  return `<div class="card wk-card"><div class="wk-head"><span class="label" style="margin:0">Tu próxima semana</span><button class="sec-link" data-act="nav" data-view="social">Ver mes →</button></div><div class="wk-strip">${cells}</div></div>`;
}

/* ============ PARFECT Tracker: curso de drills por palo (genera desde tus carrys) ============ */
function trackerDrills(u) {
  const bag = (u && u.clubs) || {};
  const carry = id => (typeof clubC === 'function') ? clubC(bag, id) : (bag[id] && bag[id].c);
  const clubDrill = c => ({ key: 'c_' + c.id, name: c.name, reps: 7, kind: 'carry', carry: carry(c.id), gap: c.gap, goal: `Carry de ${carry(c.id)} yds en un gap de ${c.gap} yds · 7/7` });
  const has = c => carry(c.id) != null;
  const long = CLUBS.filter(c => c.group === 'largo' && has(c)).map(clubDrill);
  const irons = CLUBS.filter(c => c.group === 'hierros' && has(c)).map(clubDrill);
  const wedges = CLUBS.filter(c => c.group === 'wedges' && has(c)).map(clubDrill);
  const approach = [40, 30, 10].map(d => ({ key: 'app_' + d, name: 'Up & down ' + d + ' yds', reps: 7, kind: 'updown', dist: d, goal: `7/7 up & downs desde ${d} yds al azar` }));
  const puttDefs = [[3, 'desde 3 pies, en línea'], [5, 'desde 5 pies, en línea'], [7, 'desde 7 pies'], [10, 'desde 10 pies'], [15, 'dejándola a 3 pies (gimme) desde 15 pies'], [20, 'dadas desde 20 pies'], [30, 'dadas desde 30 pies']];
  const putt = puttDefs.map(([f, txt]) => ({ key: 'p_' + f, name: f + ' pies', reps: 10, kind: 'putt', feet: f, goal: '10/10 ' + txt }));
  return [['Long game', long], ['Fierros', irons], ['Wedges', wedges], ['Approach', approach], ['Putt', putt]];
}
/* Avatar Stats: resumen de números (de tus rondas) arriba del Tracker */
function avatarStatsBlock(u) {
  const rounds = (typeof myRounds === 'function') ? myRounds() : [];
  const agg = (rounds.length && typeof Stats !== 'undefined' && Stats.aggregate) ? Stats.aggregate(rounds) : null;
  const head = `<div class="sec-h"><h2 style="font-size:15px">${golfIcon('trophy')} Tus números</h2><span class="small muted">${rounds.length} ronda${rounds.length === 1 ? '' : 's'}</span></div>`;
  if (!agg) return head + `<div class="card"><p class="note" style="margin:6px 2px">Registra una ronda para ver tu score, fairways, GIR, putts y reparto de score.</p></div>`;
  const tile = (big, lab) => `<div style="text-align:center;padding:11px 6px;background:var(--card2);border-radius:14px"><b style="font-size:22px;font-weight:900;display:block;letter-spacing:-.02em">${big}</b><span style="font-size:11px;color:var(--muted);font-weight:700">${lab}</span></div>`;
  const grid = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
    ${tile(fmtHcp(u.hcp), 'Hándicap')}${tile(Math.round(agg.fwPct) + '%', 'Fairways')}${tile(Math.round(agg.girPct) + '%', 'GIR')}
    ${tile(Math.round(agg.scrPct) + '%', 'Up & down')}${tile(agg.putts18.toFixed(1), 'Putts/ronda')}${tile(Math.round(agg.threePct) + '%', '3 putts')}
  </div>`;
  const sd = agg.scoreDist, t = sd.total || 1, p = n => Math.round(n / t * 100);
  const segs = [['Águila+', sd.eagle, '#2f8f4f'], ['Birdie', sd.birdie, '#54b85a'], ['Par', sd.par, '#7cc24a'], ['Bogey', sd.bogey, '#e0a23a'], ['Doble+', sd.dbl, '#e0653a']];
  const bar = `<div style="display:flex;height:16px;border-radius:8px;overflow:hidden;margin-top:4px;background:var(--line)">${segs.map(s => s[1] ? `<div style="width:${p(s[1])}%;background:${s[2]}"></div>` : '').join('')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:7px">${segs.map(s => `<span style="font-size:11px;color:var(--muted)"><b style="color:var(--text)">${p(s[1])}%</b> ${s[0]}</span>`).join('')}</div>`;
  return head + `<div class="card">${grid}<span class="label" style="margin-top:12px;display:block">Reparto de score</span>${bar}</div>`;
}
const TRK_CAT_IC = { 'Long game': 'club', 'Fierros': 'tee', 'Wedges': 'green', 'Approach': 'bucket', 'Putt': 'putter' };
function trkHits(e, reps) { return e ? (e.hits != null ? Math.max(0, Math.min(reps, e.hits)) : (e.pct != null ? Math.round(e.pct / 100 * reps) : 0)) : 0; }
/* Diagrama visual del ejercicio (para que se entienda de un vistazo) */
function drillVisual(d) {
  if (d.kind === 'putt') {
    return `<svg class="trk-viz" viewBox="0 0 320 96" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width="320" height="96" rx="12" fill="#cdeccb"/>
      <text x="160" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="#3a5230">${d.feet} pies · en línea</text>
      <line x1="46" y1="66" x2="272" y2="66" stroke="#8aa07f" stroke-width="2.5" stroke-dasharray="4 6"/>
      <circle cx="46" cy="66" r="7" fill="#fff" stroke="#b9c4b4"/>
      <circle cx="278" cy="66" r="7" fill="#243018"/>
      <rect x="278" y="38" width="3" height="28" fill="#c23a2a"/><path d="M281 40 l13 5 -13 5 z" fill="#e0653a"/>
    </svg>`;
  }
  if (d.kind === 'updown') {
    return `<svg class="trk-viz" viewBox="0 0 320 96" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width="320" height="96" rx="12" fill="#dff0d8"/>
      <text x="160" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="#7a5a1f">chip &amp; putt · ${d.dist} yds</text>
      <ellipse cx="244" cy="76" rx="66" ry="14" fill="#7cc24a"/>
      <path d="M36 80 Q150 22 236 68" fill="none" stroke="#e0a23a" stroke-width="3" stroke-dasharray="5 5"/>
      <circle cx="36" cy="80" r="6" fill="#fff" stroke="#b9c4b4"/>
      <circle cx="244" cy="72" r="5" fill="#243018"/>
      <rect x="244" y="44" width="3" height="28" fill="#c23a2a"/><path d="M247 46 l13 5 -13 5 z" fill="#e0653a"/>
    </svg>`;
  }
  return `<svg class="trk-viz" viewBox="0 0 320 96" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <rect width="320" height="96" rx="12" fill="#dff0d8"/>
    <text x="160" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="#2f6b32">carry ${d.carry} y · gap ±${d.gap}</text>
    <path d="M28 80 Q160 14 296 80" fill="none" stroke="#54b85a" stroke-width="3" stroke-dasharray="5 5"/>
    <ellipse cx="296" cy="81" rx="24" ry="6" fill="#3f9f4a" opacity=".5"/>
    <circle cx="28" cy="80" r="6" fill="#fff" stroke="#b9c4b4"/>
  </svg>`;
}
function vCourse(u) {
  const log = (u && u.tracker) || {};
  const anyBag = Object.keys((u && u.clubs) || {}).length;
  if (!anyBag) return `<div class="card"><p class="note" style="margin:6px 2px">Primero llena tu <b>bolsa</b> (carrys) en tu perfil — con eso genero tus drills.</p></div>`;
  const groups = trackerDrills(u).filter(([t, arr]) => arr.length);
  const drillCard = d => {
    const hits = trkHits(log[d.key], d.reps);
    const done = hits >= d.reps;
    const pct = Math.round(hits / d.reps * 100);
    const tmRun = V.trkTimer && V.trkTimer.key === d.key && V.trkTimer.running;
    return `<div class="trk-card ${done ? 'trk-done' : ''}">
      ${drillVisual(d)}
      <div class="trk-top">
        <div class="trk-info"><b>${esc(d.name)}</b><span>${esc(d.goal)}</span></div>
        ${done ? '<span class="trk-chk">✓</span>' : ''}
      </div>
      <div class="trk-controls">
        <div class="trk-rep">
          <button class="trk-step" data-act="trk-set" data-k="${d.key}" data-reps="${d.reps}" data-d="-1" aria-label="Menos">−</button>
          <span class="trk-cnt"><b>${hits}</b><i>/${d.reps}</i></span>
          <button class="trk-step" data-act="trk-set" data-k="${d.key}" data-reps="${d.reps}" data-d="1" aria-label="Más">+</button>
        </div>
        <button class="chip sm trk-tm ${tmRun ? 'on' : ''}" data-act="trk-timer" data-k="${d.key}" id="trktm-${d.key}">⏱ ${tmRun ? fmtClock(V.trkTimer.left) : '20 min'}</button>
      </div>
      <div class="trk-pbar"><i style="width:${pct}%"></i></div>
    </div>`;
  };
  const all = groups.flatMap(([t, arr]) => arr);
  const total = all.length;
  const doneTotal = all.filter(d => trkHits(log[d.key], d.reps) >= d.reps).length;
  const pct = total ? Math.round(doneTotal / total * 100) : 0;
  const activeCat = V.trkCat !== undefined ? V.trkCat : (groups[0] && groups[0][0]);
  const blocks = groups.map(([title, arr]) => {
    const on = activeCat === title;
    const doneN = arr.filter(d => trkHits(log[d.key], d.reps) >= d.reps).length;
    return `<button class="trk-cat ${on ? 'on' : ''}" data-act="trk-cat" data-c="${esc(title)}">
        <span class="trk-cat-ic">${golfIcon(TRK_CAT_IC[title] || 'flag')}</span>
        <span class="trk-cat-tx"><b>${esc(title)}</b><span>${arr.length} ejercicio${arr.length === 1 ? '' : 's'} · ${doneN}/${arr.length} ✓</span></span>
        <span class="trk-cat-go">${on ? '▾' : '▸'}</span>
      </button>${on ? `<div class="trk-drills">${arr.map(drillCard).join('')}</div>` : ''}`;
  }).join('');
  return `<div class="card trk-prog">
      <div class="trk-prog-top"><span class="label" style="margin:0">${golfIcon('bucket')} Tu progreso</span><b class="trk-prog-pct">${pct}%</b></div>
      <div class="trk-pbar big"><i style="width:${pct}%"></i></div>
      <span class="small muted">${doneTotal}/${total} ejercicios completos</span>
      <p class="note" style="margin:12px 2px 8px">Elige <b>qué quieres entrenar</b> y registra tus reps (ej. 7/7).</p>
      <div class="trk-cats">${blocks}</div>
      <button class="btn primary trk-finish" data-act="trk-finish">${golfIcon('flag')} Terminar y guardar entrenamiento</button>
      ${V.trkSaved === today() ? `<p class="trk-saved">✓ Entrenamiento guardado en tu historial</p>` : (V.trkMsg ? `<p class="form-err" style="margin:8px 2px 0;text-align:center">${esc(V.trkMsg)}</p>` : '')}
    </div>`;
}

/* ============ Camino: progreso gamificado (Romper 100 / 90 / 80…) ============ */
const MILESTONES = [120, 110, 100, 95, 90, 85, 80, 75, 72];
function bestScore18(rounds) {
  let best = null;
  (rounds || []).forEach(r => { const s = Stats.roundStats(r); if (s && s.holes >= 9) { const eq = Math.round(s.score / s.holes * 18); if (best == null || eq < best) best = eq; } });
  return best;
}
function vCamino(u) {
  const rounds = (typeof myRounds === 'function') ? myRounds() : [];
  const best = bestScore18(rounds);
  const items = MILESTONES.map(m => ({ m, label: m <= 72 ? 'Par o mejor (72)' : 'Romper ' + m, broken: best != null && best < m }));
  const nextIdx = items.findIndex(x => !x.broken);
  const next = nextIdx >= 0 ? items[nextIdx] : null;
  const doneN = items.filter(x => x.broken).length;
  const need = m => Math.max(1, best - (m - 1));
  const hero = `<div class="card" style="text-align:center">
    <span class="label" style="justify-content:center">${golfIcon('peak')} Tu camino</span>
    ${best != null ? `<div style="font-size:13px;color:var(--muted);margin-top:8px">Tu mejor ronda (18 hoyos)</div><div style="font-size:40px;font-weight:900;letter-spacing:-.03em;line-height:1">${best}</div>` : `<p class="note" style="margin:8px 2px">Registra una ronda para arrancar tu camino y desbloquear metas.</p>`}
    ${next ? `<div style="margin-top:10px;font-size:15px;font-weight:800">Próxima meta: <span style="color:var(--lime-ink)">${next.label}</span></div>${best != null ? `<div style="font-size:12.5px;color:var(--muted);margin-top:2px">Te faltan <b>${need(next.m)}</b> golpe${need(next.m) === 1 ? '' : 's'}</div>` : ''}` : `<div style="margin-top:10px;font-weight:800">¡Rompiste todas las metas! 🏆</div>`}
    <div style="margin-top:8px;font-size:12px;color:var(--muted)">${doneN}/${items.length} metas logradas</div>
  </div>`;
  const ladder = items.map((x, i) => {
    const isNext = i === nextIdx; const st = x.broken ? 'done' : isNext ? 'now' : 'lock';
    const ic = x.broken ? '✓' : isNext ? '★' : '🔒';
    const sub = x.broken ? 'Logrado' : isNext ? (best != null ? `Te faltan ${need(x.m)} golpes` : 'Tu primera meta') : 'Bloqueado';
    return `<div class="ms-row ${st}">
      <span class="ms-dot ${st}">${ic}</span>
      <div class="ms-tx"><b>${x.label}</b><span>${sub}</span></div>
      ${isNext ? `<button class="chip sm" data-act="trainer-tab" data-t="plan">Mi plan →</button>` : ''}
    </div>`;
  }).join('');
  return hero + `<div class="ms-ladder" style="margin-top:12px">${ladder}</div>`;
}

function vTrainer() {
  const u = cur();
  let tab = V.trainerTab;
  if (tab === 'plan' || tab === 'coach') tab = 'diag';            // alias heredados
  if (tab === 'tracker' || tab === 'camino' || tab === 'objetivos') tab = 'logros';
  tab = ['diag', 'entreno', 'logros'].includes(tab) ? tab : 'diag';
  const showHist = (!V.planStep || V.planStep === 'time') && !V.sessionRun && !V.sessionSummary;
  const body = tab === 'entreno' ? (vSessionPlanner() + (showHist ? (`<div style="margin-top:18px"></div>` + vCourse(u) + vTrainHistory()) : ''))
    : tab === 'logros' ? vLogros()
      : vDiag();
  const T = (id, label) => `<button class="tab ${tab === id ? 'on' : ''}" data-act="trainer-tab" data-t="${id}">${label}</button>`;
  return `<div class="sec-h"><h2>Parfect Trainer</h2></div>
    <div class="tabs scroll">${T('diag', 'Análisis IA')}${T('entreno', 'Entreno')}${T('logros', 'Logros')}</div>
    ${body}`;
}

/* Parfect Trainer · data-driven (sin IA): insights, trainings, estrategia y metas
   derivados de tu % por palo (Tracker) + tus rondas. Instantáneo, siempre disponible. */
function vDataDriven(u, agg) {
  const tr = (u && u.tracker) || {};
  const bag = (u && u.clubs) || {};
  const carry = id => (typeof clubC === 'function') ? clubC(bag, id) : (bag[id] && bag[id].c);
  const drillPct = e => e ? (e.pct != null ? e.pct : (e.reps ? Math.round(e.hits / e.reps * 100) : null)) : null;
  const ins = [];
  CLUBS.forEach(c => { const e = tr['c_' + c.id]; const pct = drillPct(e); if (pct != null && carry(c.id) != null && pct < 70) ins.push({ sev: 100 - pct, txt: `Baja precisión en ${c.name} (${pct}%)`, drill: { name: c.name, goal: `${carry(c.id)} yds en su gap` } }); });
  if (agg) {
    if (agg.fwPct < 50) ins.push({ sev: 62 - agg.fwPct, txt: `Pocos fairways (${Math.round(agg.fwPct)}%)`, drill: { name: 'Driver', goal: '7/7 en un gap de 40 yds' } });
    if (agg.girPct < 40) ins.push({ sev: 52 - agg.girPct, txt: `Pocos greens en regulación (${Math.round(agg.girPct)}%)`, drill: { name: 'Fierros', goal: '7/7 a tu carry, gap 40' } });
    if (agg.putts18 > 32) ins.push({ sev: (agg.putts18 - 30) * 9, txt: `Muchos putts (${agg.putts18.toFixed(1)}/ronda)`, drill: { name: 'Putt corto', goal: '10/10 desde 3 y 5 pies' } });
    if (agg.threePct > 10) ins.push({ sev: agg.threePct + 6, txt: `3-putts altos (${Math.round(agg.threePct)}%)`, drill: { name: 'Putt largo', goal: 'dadas desde 20 y 30 pies' } });
    if (agg.scrPct < 45) ins.push({ sev: 52 - agg.scrPct, txt: `Up & down bajo (${Math.round(agg.scrPct)}%)`, drill: { name: 'Approach', goal: 'up & down 10 y 30 yds' } });
  }
  ins.sort((a, b) => b.sev - a.sev);
  const top = ins.slice(0, 3);
  const accs = CLUBS.map(c => { const p = drillPct(tr['c_' + c.id]); return p != null ? { name: c.name, pct: p, group: c.group } : null; }).filter(Boolean);
  const strat = [];
  if (accs.length) {
    const best = accs.slice().sort((a, b) => b.pct - a.pct)[0];
    strat.push(`Confía en tu ${best.name} (${best.pct}%) para colocar la bola.`);
    const worst = accs.filter(a => a.group === 'largo').sort((a, b) => a.pct - b.pct)[0];
    if (worst && worst.pct < 65) strat.push(`En hoyos angostos evita ${worst.name} (${worst.pct}%); usa un palo más certero.`);
  }
  if (agg && agg.girPct < 42) strat.push('Apunta al centro del green, no a la bandera: sube tu GIR.');
  if (agg && agg.scrPct < 45) strat.push('Cuando falles green, deja el chip cuesta arriba para salvar el par.');
  const goals = [];
  if (agg) {
    if (isFinite(agg.fwPct)) goals.push(['Fairways', Math.round(agg.fwPct) + '%', Math.min(78, Math.round(agg.fwPct) + 8) + '%']);
    if (isFinite(agg.girPct)) goals.push(['GIR', Math.round(agg.girPct) + '%', Math.min(68, Math.round(agg.girPct) + 8) + '%']);
    if (isFinite(agg.putts18)) goals.push(['Putts / ronda', agg.putts18.toFixed(1), Math.max(28, agg.putts18 - 1.5).toFixed(1)]);
  }
  const row = t => `<div style="font-size:13.5px;padding:5px 0;border-top:1px solid var(--line-soft,var(--line))">${t}</div>`;
  const cardInsights = top.length
    ? `<div class="card"><span class="label">⚠️ Dónde pierdes golpes</span>${top.map(i => row('• ' + esc(i.txt))).join('')}</div>
       <div class="card"><span class="label">${golfIcon('bucket')} Qué entrenar</span>${top.map(i => row(`${golfIcon('flag')} <b>${esc(i.drill.name)}</b> — ${esc(i.drill.goal)}`)).join('')}</div>`
    : `<div class="card"><p class="note" style="margin:6px 2px">Registra tus drills (Tracker) y unas rondas para que detecte tus fugas de golpes.</p></div>`;
  const cardStrat = strat.length ? `<div class="card"><span class="label">${golfIcon('peak')} Estrategia en el campo</span>${strat.map(s => row('• ' + esc(s))).join('')}</div>` : '';
  const cardGoals = goals.length ? `<div class="card"><span class="label">${golfIcon('trophy')} Tus metas</span>${goals.map(g => `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-top:1px solid var(--line-soft,var(--line))"><b style="font-size:13.5px">${g[0]}</b><span style="font-size:13.5px;color:var(--muted)">${g[1]} → <b class="lime" style="color:var(--lime-ink)">${g[2]}</b></span></div>`).join('')}</div>` : '';
  return `<div class="sec-h" style="margin-top:6px"><h2 style="font-size:16px">${golfIcon('green')} Tu plan según tus datos</h2></div>${cardInsights}${cardStrat}${cardGoals}`;
}
function vDiag() {
  const agg = Stats.aggregate(myRounds());
  if (!agg) {
    return `<div class="card empty"><div class="e-ico">${golfIcon('green')}</div><h3>La IA necesita datos</h3>
      <p>Registra al menos una ronda y Parfect Trainer encontrará dónde se van tus golpes.</p>
      <button class="btn primary" data-act="quick-round">Registrar ronda</button></div>`;
  }
  if (V.diagBusy) {
    return `<div class="card empty"><div class="e-ico">${golfIcon('green')}</div><h3>Analizando tus patrones…</h3>
      <p>Correlacionando ${agg.holesPlayed} hoyos, ${agg.rounds} rondas y 12+ métricas.</p></div>`;
  }
  if (!V.diag) {
    return `<div class="sec-h" style="margin-top:6px"><h2 style="font-size:18px">Análisis IA</h2><span class="small muted">${agg.rounds} rondas</span></div>
      <div class="diag-cta">
        <span class="diag-cta-ic">${golfIcon('green')}</span>
        <h2 class="diag-cta-h">Tu coach IA está listo</h2>
        <p class="diag-cta-p">La IA cruza tus ${agg.holesPlayed} hoyos y ${agg.rounds} ronda${agg.rounds === 1 ? '' : 's'} para encontrar dónde se te van los golpes y qué entrenar.</p>
        <button class="btn primary big" data-act="diagnose">${golfIcon('flag')} Generar análisis IA</button>
      </div>`;
  }
  const d = V.diag;
  const done = (cur() || {}).drillsDone || {};
  const td = today();
  const warn = d.readiness === 'low'
    ? `<p class="note">Con menos de 3 rondas el diagnóstico es preliminar. Cada ronda nueva lo afina.</p>` : '';
  const FOCUS_IC = { driving: 'flag', approach: 'green', short: 'bucket', putting: 'putter' };
  const FOCUS_PC = { driving: '#3a8fe0', approach: '#57a83e', short: '#e0873a', putting: '#3a7fd4' };
  const top = d.focus[0] || {};
  const cards = d.focus.map((f, i) => {
    const parts = String(f.diag).split('. ').map(s => s.trim()).filter(Boolean);
    const lead = parts[0] ? parts[0].replace(/\.$/, '') + '.' : '';
    const ic = FOCUS_IC[f.key] || 'green';
    const pc = FOCUS_PC[f.key] || '#57a83e';
    const drills = (f.drills || []).slice(0, i === 0 ? 3 : 2);
    const doneN = drills.filter(dr => done[dr.name] === td).length;
    const rows = drills.map(dr => {
      const isDone = done[dr.name] === td;
      return `<div class="aiq-drow ${isDone ? 'done' : ''}">
        <span class="aiq-dchk">${isDone ? '✓' : ''}</span>
        <div class="aiq-dtx"><b>${esc(dr.name)}</b><span>${esc(dr.dose)} · ${esc(dr.metric)}</span></div>
      </div>`;
    }).join('');
    return `<div class="aiq-card" style="--pc:${pc}">
      <div class="aiq-head">
        <span class="aiq-rank">${i + 1}</span>
        <div class="aiq-htx"><span class="aiq-plab">${i === 0 ? 'Tu enfoque #1' : 'Prioridad ' + (i + 1)}</span><b>${esc(f.titulo)}</b></div>
        <span class="aiq-ic">${golfIcon(ic)}</span>
      </div>
      <p class="aiq-diag">${esc(lead)}</p>
      <div class="aiq-drills"><span class="aiq-drilllab">Qué entrenar ${drills.length ? `<i>${doneN}/${drills.length} hoy</i>` : ''}</span>${rows}</div>
    </div>`;
  }).join('');
  const ai = V.diagAI;
  const birdieCard = ai ? `<div class="aiq-birdie">
       <span class="aiq-birdie-ava">${chatBotIcon()}</span>
       <div class="aiq-birdie-tx">
         <span class="aiq-birdie-lab">Birdie · tu coach IA</span>
         ${ai.loading
            ? `<p class="aiq-birdie-load">Leyendo tus rondas<span class="chat-typing"><i></i><i></i><i></i></span></p>`
            : `<p>${esc(ai.text).replace(/\n/g, '<br>')}</p>`}
       </div>
     </div>` : '';
  return warn +
    `<div class="aiq-hero">
       <span class="aiq-hero-ava">${golfIcon('flag')}</span>
       <div class="aiq-hero-tx"><span class="aiq-hero-lab">Análisis IA · ${agg.rounds} ronda${agg.rounds === 1 ? '' : 's'}</span><b class="aiq-hero-h">Tu enfoque ahora: ${esc((top.titulo || 'tu juego').split('·')[0].trim())}</b><p class="aiq-hero-p">${d.focus.length} prioridades para bajar golpes, ordenadas por impacto.</p></div>
     </div>
     ${birdieCard}
     <div class="aiq-list">${cards}</div>
     <button class="btn primary big" data-act="diag-aicoach" style="margin-top:14px">${golfIcon('flag')} Entrenar este plan con AI Coach →</button>
     <p class="note" style="text-align:center;margin-top:8px">El AI Coach arma tu sesión según tu tiempo y estas prioridades.</p>
     <button class="btn ghost" data-act="diagnose" style="margin-top:6px">↺ Recalcular diagnóstico</button>`;
}

/* ---------- Sesión recomendada (por tu punto débil) ---------- */
function vTrainFeatured() {
  const agg = Stats.aggregate(myRounds());
  let cat = 'fw';
  if (agg) {
    const sc = {
      fw: agg.fwPct, gir: agg.girPct, ud: agg.scrPct,
      putt: Math.max(0, Math.min(100, (36 - agg.putts18) / 12 * 100)),
    };
    cat = Object.entries(sc).sort((a, b) => a[1] - b[1])[0][0];
  }
  const lab = { fw: 'tus salidas', gir: 'tus hierros al green', ud: 'tu juego corto', putt: 'tu putt' }[cat];
  const drill = DRILL_LIBRARY.find(d => d.cat === cat) || DRILL_LIBRARY[0];
  return `<div class="tr-feat">
    <span class="tr-feat-tag">${golfIcon('green')} Tu sesión de hoy</span>
    <h3 class="tr-feat-name">${esc(drill.name)}</h3>
    <p class="tr-feat-why">${agg ? `Tu mayor fuga está en <b>${lab}</b>. Empieza por aquí.` : 'Arranca con un fundamento clave. Registra rondas y te recomiendo según tus números.'}</p>
    <button class="btn primary" data-act="drill-open" data-name="${esc(drill.name)}">Ver ejercicio →</button>
  </div>`;
}

/* ---------- Biblioteca de drills (50) — tarjetas profesionales ---------- */
function vDrillsLibrary() {
  const cat = V.drillCat || 'fw';
  const list = DRILL_LIBRARY.filter(d => d.cat === cat);
  const chips = DRILL_CATS.map(c => {
    const n = DRILL_LIBRARY.filter(d => d.cat === c.id).length;
    return `<button class="tab ${c.id === cat ? 'on' : ''}" data-act="drill-cat" data-c="${c.id}">${esc(c.label)} <span class="muted">${n}</span></button>`;
  }).join('');
  const done = (cur() || {}).drillsDone || {};
  const td = today();
  const items = list.map(d => {
    const isDone = done[d.name] === td;
    return `<button class="dlc ${isDone ? 'done' : ''}" data-act="drill-open" data-name="${esc(d.name)}">
      <span class="dlc-check">${isDone ? '✓' : ''}</span>
      <div class="dlc-info">
        <b>${esc(d.name)}</b>
        <p class="dlc-desc">${esc(d.desc)}</p>
        <div class="dlc-meta"><span>${golfIcon('bucket')} ${esc(d.dose)}</span><span>${golfIcon('green')} ${esc(d.metric)}</span></div>
      </div>
      <span class="dlc-go">${isDone ? 'Hecho' : 'Ver →'}</span>
    </button>`;
  }).join('');
  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:18px">Biblioteca de drills</h2><span class="small muted">${DRILL_LIBRARY.length} ejercicios</span></div>
    <div class="tabs scroll">${chips}</div>
    <div class="dlc-list">${items}</div>`;
}

/* ---------- Detalle de drill: imagen + pasos + meta + entrenar ---------- */
const DRILL_CAT_META = { fw: { c: '#3f9d44', s: 'fw' }, gir: { c: '#2fa36b', s: 'gir' }, ud: { c: '#e0873a', s: 'ud' }, putt: { c: '#3a8fe0', s: 'ud' } };
function vDrillDetail() {
  const d = V.drillDetail; if (!d) return '';
  const catLab = (DRILL_CATS.find(c => c.id === d.cat) || {}).label || 'Práctica';
  const cm = DRILL_CAT_META[d.cat] || { c: '#3f9d44', s: 'fw' };
  const short = s => { let t = String(s).split('. ')[0].trim(); if (t.length > 46) t = t.split(/[,;]/)[0].trim(); return t.replace(/\.$/, ''); };
  const steps = (d.steps || []).map((s, i) => `<li class="dd2-step"><span class="dd2-n">${i + 1}</span><span class="dd2-stext">${esc(short(s))}</span></li>`).join('');
  const doneToday = ((cur() || {}).drillsDone || {})[d.name] === today();
  const fromDiag = V.drillFrom === 'diag';
  const cta = fromDiag
    ? `<button class="btn primary big" data-act="drill-go-entreno">${golfIcon('flag')} Entrenar este ejercicio →</button>`
    : `<button class="btn primary big" data-act="drill-done">${doneToday ? 'Entrenado hoy ✓ · marcar otra vez' : 'Listo, lo entrené ✓'}</button>`;
  return `<div class="overlay overlay-top" data-act="drill-close-detail">
    <div class="sheet dd2" data-act="noop">
      <div class="dd2-top">
        <span class="dd2-cat">${esc(catLab)}</span>
        <button class="dd2-x" data-act="drill-close-detail" aria-label="Cerrar">✕</button>
      </div>
      <div class="card sp-card sr-card dd2-headcard">
        <div class="sr-now"><span class="sr-scene">${drillScene(cm.s)}</span><div class="sr-nowtx"><b>${esc(d.name)}</b><span>${esc(d.dose || catLab)}</span></div></div>
      </div>
      <div class="dd2-goals">
        <div class="dd2-goal"><span>Dosis</span><b>${esc(d.dose)}</b></div>
        <div class="dd2-goal"><span>Meta</span><b>${esc(d.metric)}</b></div>
      </div>
      <h3 class="dd2-h3">Cómo hacerlo</h3>
      <ol class="dd2-steps">${steps}</ol>
      ${cta}
    </div>
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
const GROUP_META = { largo: { cat: 'Juego largo', icon: 'club' }, hierros: { cat: 'Hierros', icon: 'tee' }, wedges: { cat: 'Wedges', icon: 'green' } };

const APPROACH_GROUP = { cat: 'Approach', icon: 'green', drills: [
  { name: 'Up & down 40 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
  { name: 'Up & down 30 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
  { name: 'Up & down 10 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
] };
const PUTT_GROUP = { cat: 'Putt', icon: 'putter', drills: [
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

/* Tabla de objetivo por hándicap: cuántas bolas seguidas (de 7) mete cada nivel */
function vTrainObjectives(u) {
  const levels = [0, 5, 10, 15, 20, 25];
  const near = levels.reduce((a, b) => Math.abs(b - u.hcp) < Math.abs(a - u.hcp) ? b : a, levels[0]);
  const nearGoal = levels.reduce((a, b) => Math.abs(b - u.goal) < Math.abs(a - u.goal) ? b : a, levels[0]);
  const makes = h => Math.max(1, Math.min(7, 7 - Math.round(h / 5)));
  const rows = levels.map(h => {
    const tags = [];
    if (h === near) tags.push('tú');
    if (h === nearGoal) tags.push('meta');
    const cls = h === nearGoal ? 'hcp-goal' : (h === near ? 'hcp-me' : '');
    return `<tr class="${cls}">
      <td class="hcp-h">${h}${tags.length ? ` <span class="hcp-tag">${tags.join('·')}</span>` : ''}</td>
      <td><b class="lime">${makes(h)}/7</b> seguidas</td>
    </tr>`;
  }).join('');
  return `<div class="card">
    <span class="label">${golfIcon('green')} Objetivo por hándicap</span>
    <p class="note" style="margin-top:0;margin-bottom:8px">Cuántas bolas <b class="lime">seguidas (de 7)</b> mete cada nivel en los drills. Apunta a las de tu meta.</p>
    <div class="sc-scroll"><table class="sc-table ref-table">
      <thead><tr><th class="sc-name">HCP</th><th>Bolas seguidas</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>`;
}

function vTracker() {
  return `<div class="sec-h"><h2>Práctica</h2><span class="small muted">tu práctica, medida</span></div>
    ${vTrackerPlan()}`;
}

/* ---------- Planificador de sesión: acomoda tus drills en el tiempo que tengas ---------- */
const SP_AREAS = {
  driving: { label: 'Salida', icon: 'flag' },
  approach: { label: 'Hierros', icon: 'green' },
  short: { label: 'Juego corto', icon: 'bucket' },
  putting: { label: 'Putting', icon: 'putter' },
};
const spFmtMin = m => m >= 60 ? (m % 60 ? (m / 60).toFixed(1) : (m / 60)) + ' h' : m + ' min';
function spDrill(k) { const d = (typeof Trainer !== 'undefined' && Trainer.DRILLS && Trainer.DRILLS[k]) ? Trainer.DRILLS[k] : null; return d && d[0] ? d[0].name : null; }

function spSceneFor(lab) { return ({ 'Salida': 'fw', 'Driving': 'fw', 'Hierros': 'gir', 'Juego corto': 'ud', 'Putting': 'putt' })[lab] || 'fw'; }

/* Historial de entrenamientos pasados */
function thIcon(area) {
  const a = String(area || '').toLowerCase();
  if (/putt/.test(a)) return 'putter';
  if (/salida|fairway|driver|madera|hibrido|híbrido/.test(a)) return 'flag';
  if (/corto|wedge|up|approach|bunker/.test(a)) return 'bucket';
  if (/green|hierro|gir/.test(a)) return 'green';
  return 'bucket';
}
function vTrainHistory() {
  const list = (typeof myPractices === 'function') ? myPractices().slice().reverse() : ((S.practices || []).filter(p => p.userId === S.session).slice().reverse());
  if (!list.length) {
    return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:18px">Historial de entrenamientos</h2></div>
      <div class="card empty" style="padding:22px 16px"><div class="e-ico">${golfIcon('bucket')}</div><p class="note" style="margin:0">Aún no entrenas. Arma tu sesión y aquí verás tu historial.</p></div>`;
  }
  const totalMin = list.reduce((a, p) => a + (Number(p.minutes) || 0), 0);
  const items = list.slice(0, 15).map(p => {
    const min = Number(p.minutes) || 0;
    return `<div class="th-item">
      <span class="th-ic">${golfIcon(thIcon(p.area || p.drill))}</span>
      <div class="th-tx"><b>${esc(p.drill || 'Entrenamiento')}</b><span>${fmtDate(p.date)}${p.area ? ' · ' + esc(p.area) : ''}</span></div>
      <span class="th-min">${min ? min + ' min' : '✓'}</span>
    </div>`;
  }).join('');
  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:18px">Historial de entrenamientos</h2><span class="small muted">${list.length} sesión${list.length === 1 ? '' : 'es'}</span></div>
    <div class="card th-card">
      <div class="th-sum"><div class="th-sumc"><b>${list.length}</b><span>sesiones</span></div><div class="th-sumc"><b>${totalMin}</b><span>min totales</span></div></div>
      <div class="th-list">${items}</div>
    </div>`;
}

function vSessionSummary() {
  const s = V.sessionSummary || { mins: 0, areas: [], count: 0, completed: true };
  return `<div class="card sp-card sr-card sess-sum">
    <div class="sumcheck">✓</div>
    <h2 class="sumtitle">${s.completed ? '¡Sesión completa!' : 'Sesión guardada'}</h2>
    <p class="sumsub">Buen trabajo. Tu práctica quedó registrada en tu progreso.</p>
    <div class="sumstats">
      <div class="sumstat"><b>${s.mins}</b><span>min entrenados</span></div>
      <div class="sumstat"><b>${s.count || (s.areas || []).length}</b><span>áreas</span></div>
    </div>
    ${(s.areas && s.areas.length) ? `<div class="sumareas">${s.areas.map(a => `<span class="sumchip">${esc(a)}</span>`).join('')}</div>` : ''}
    <button class="btn primary big" data-act="sess-sum-home" style="margin-top:16px">${golfIcon('flag')} Volver al inicio →</button>
  </div>`;
}

function vSessionPlanner() {
  const u = cur();
  if (V.sessionSummary) return vSessionSummary();
  const agg = Stats.aggregate(myRounds());
  const step = ['mode', 'areas', 'plan', 'free', 'freelib', 'lib', 'aisum'].includes(V.planStep) ? V.planStep : 'time';
  const T = V.sessionMin || 60;

  if (step === 'time') {
    return `<div class="card sp-card sp-card-time">
      <div class="sp-phase">Paso 1 de 2</div>
      <h2 class="sp-q">${golfIcon('flag')} ¿Cuánto tiempo tienes para entrenar?</h2>
      <div class="sp-timeopts">${[30, 60, 90, 120].map(m => `<button class="sp-timeb ${T === m ? 'on' : ''}" data-act="plan-time" data-m="${m}"><b>${spFmtMin(m)}</b><span>${m <= 30 ? 'rápida' : m <= 60 ? 'estándar' : m <= 90 ? 'completa' : 'intensa'}</span></button>`).join('')}</div>
    </div>`;
  }
  if (step === 'mode') {
    return `<div class="card sp-card">
      <div class="sp-phase">Paso 2 de 2 · ${spFmtMin(T)}</div>
      <h2 class="sp-q">¿Cómo armamos tu sesión?</h2>
      <button class="sp-modecard" data-act="plan-mode" data-m="ai"><span class="sp-modeic">${golfIcon('flag')}</span><div><b>AI Coach</b><span>La IA reparte el tiempo priorizando tus puntos débiles.</span></div></button>
      <button class="sp-modecard" data-act="plan-mode" data-m="free"><span class="sp-modeic">${golfIcon('putter')}</span><div><b>Entrenamiento libre</b><span>Cronometra un bastón o un ejercicio de la biblioteca a tu ritmo.</span></div></button>
      <button class="sp-back" data-act="plan-reset">← Cambiar tiempo</button>
    </div>`;
  }
  if (step === 'aisum') {
    const dg = V.diag || (agg && typeof Trainer !== 'undefined' ? Trainer.analyze(agg, u) : null);
    const focus = (dg && dg.focus) || [];
    const PC = { driving: '#3a8fe0', approach: '#57a83e', short: '#e0873a', putting: '#3a7fd4' };
    const items = focus.slice(0, 4).map((f, i) => {
      const parts = String(f.diag || '').split('. ').map(s => s.trim()).filter(Boolean);
      let lead = parts[0] ? parts[0].replace(/\.$/, '') + '.' : '';
      lead = lead.replace(/referencia para meta/gi, 'meta objetivo').replace(/referencia/gi, 'meta objetivo');
      return `<div class="aisum-row" style="--pc:${PC[f.key] || '#57a83e'}">
        <span class="aisum-n">${i + 1}</span>
        <div class="aisum-tx"><b>${esc(f.titulo)}</b>${lead ? `<span>${esc(lead)}</span>` : ''}</div>
      </div>`;
    }).join('');
    return `<div class="card sp-card">
      <div class="sp-phase">AI Coach · ${spFmtMin(T)}</div>
      <h2 class="sp-q">${golfIcon('flag')} Tu diagnóstico</h2>
      <p class="sp-libhint">${agg ? `Esto encontró la IA en tus ${agg.rounds} ronda${agg.rounds === 1 ? '' : 's'}. Repartirá tu tiempo según estas prioridades.` : 'Aún sin datos: la IA usará un plan balanceado.'}</p>
      <div class="aisum-list">${items || '<p class="note" style="margin:0">Registra una ronda para un diagnóstico personalizado.</p>'}</div>
      <button class="btn primary big" data-act="plan-aisum-go" style="margin-top:14px">Armar mi sesión (${spFmtMin(T)}) →</button>
      <button class="sp-back" data-act="plan-reset">← Cambiar tiempo</button>
    </div>`;
  }
  if (step === 'lib') {
    const cat = (V.libCat && DRILL_CATS.some(c => c.id === V.libCat)) ? V.libCat : DRILL_CATS[0].id;
    const pick = V.libPick || [];
    const per = pick.length ? Math.max(4, Math.round(T / pick.length)) : 0;
    const tabs = DRILL_CATS.map(c => `<button class="lib-tab ${c.id === cat ? 'on' : ''}" data-act="plan-lib-cat" data-c="${c.id}">${esc(c.label)}</button>`).join('');
    const drills = DRILL_LIBRARY.filter(d => d.cat === cat);
    const list = drills.map(d => {
      const on = pick.includes(d.name);
      return `<div class="splib-item ${on ? 'on' : ''}" data-act="plan-lib-toggle" data-name="${esc(d.name)}" role="button" tabindex="0">
        <span class="splib-chk">${on ? '✓' : '+'}</span>
        <span class="splib-tx"><b>${esc(d.name)}</b><span>${esc(d.desc)}</span></span>
        <button class="splib-eye" data-act="drill-open" data-name="${esc(d.name)}" aria-label="Ver ejercicio">👁</button>
      </div>`;
    }).join('');
    return `<div class="card sp-card">
      <div class="sp-phase">Paso 2 de 2 · ${spFmtMin(T)} · biblioteca</div>
      <h2 class="sp-q">Elige tus ejercicios</h2>
      <p class="sp-libhint">${pick.length ? `${pick.length} elegido${pick.length > 1 ? 's' : ''} · ~${per} min c/u` : 'Toca los drills que quieras meter a tu sesión'}</p>
      <div class="lib-tabs">${tabs}</div>
      <div class="splib-list">${list}</div>
      <button class="btn primary big" data-act="plan-build" ${pick.length ? '' : 'disabled'} style="margin-top:10px">Armar sesión (${pick.length}) →</button>
      <button class="sp-back" data-act="plan-mode-back">← Atrás</button>
    </div>`;
  }
  if (step === 'free') {
    const t = V.freeTimer || { secs: 0, running: false };
    const fd = V.freeDrill;
    const clubs = ['Driver', 'Maderas', 'Híbridos', 'Hierros', 'Wedges', 'Putter', 'Juego corto'];
    const chips = clubs.map(c => `<button class="chip sm ${(!fd && V.freeClub === c) ? 'on' : ''}" data-act="free-club" data-c="${esc(c)}">${c}</button>`).join('');
    const sceneKey = fd ? (({ fw: 'fw', gir: 'gir', ud: 'ud', putt: 'putt' })[fd.cat] || 'ud')
      : (({ 'Driver': 'fw', 'Maderas': 'fw', 'Híbridos': 'fw', 'Hierros': 'gir', 'Wedges': 'ud', 'Juego corto': 'ud', 'Putter': 'putt' })[V.freeClub] || 'fw');
    const targetName = fd ? fd.name : (V.freeClub || '');
    const sub = fd ? (fd.dose || 'ejercicio de la biblioteca') : (V.freeClub ? 'cronometrando' : 'elige qué entrenar');
    const canStart = !!(fd || V.freeClub);
    return `<div class="card sp-card">
      <div class="sp-phase">Entrenamiento libre</div>
      <h2 class="sp-q">${golfIcon('putter')} ¿Qué entrenas?</h2>
      <div class="chips" style="flex-wrap:wrap;margin-bottom:10px">${chips}</div>
      <button class="sp-libpick ${fd ? 'on' : ''}" data-act="free-lib-open">${golfIcon('card')} <span class="sp-libpick-tx">${fd ? esc(fd.name) : 'Elegir un ejercicio de la biblioteca'}</span><span class="sp-libpick-go">${fd ? 'cambiar' : '→'}</span></button>
      <div class="sr-now" style="margin-top:14px"><span class="sr-scene">${drillScene(sceneKey)}</span><div class="sr-nowtx"><b>${targetName ? esc(targetName) : 'Entrenamiento libre'}</b><span>${esc(sub)}</span></div></div>
      <div class="sr-clock" id="free-clock">${fmtClock(t.secs)}</div>
      <div class="ddt2-ctrls" style="margin-top:14px">
        ${t.running ? `<button class="btn" data-act="free-pause">⏸ Pausar</button>` : `<button class="btn primary" data-act="free-start" ${canStart ? '' : 'disabled'}>${t.secs > 0 ? 'Reanudar' : 'Iniciar'} ▶</button>`}
        <button class="btn ghost" data-act="free-reset">↺</button>
      </div>
      <button class="btn primary" data-act="free-finish" ${t.secs > 0 && canStart ? '' : 'disabled'} style="margin-top:10px">Terminar y guardar</button>
      <button class="sp-back" data-act="plan-reset">← Salir</button>
    </div>`;
  }
  if (step === 'freelib') {
    const cat = (V.libCat && DRILL_CATS.some(c => c.id === V.libCat)) ? V.libCat : DRILL_CATS[0].id;
    const tabs = DRILL_CATS.map(c => `<button class="lib-tab ${c.id === cat ? 'on' : ''}" data-act="free-lib-cat" data-c="${c.id}">${esc(c.label)}</button>`).join('');
    const drills = DRILL_LIBRARY.filter(d => d.cat === cat);
    const list = drills.map(d => {
      const on = V.freeDrill && V.freeDrill.name === d.name;
      return `<div class="splib-item ${on ? 'on' : ''}" data-act="free-lib-pick" data-name="${esc(d.name)}" role="button" tabindex="0">
        <span class="splib-chk">${on ? '✓' : '+'}</span>
        <span class="splib-tx"><b>${esc(d.name)}</b><span>${esc(d.desc)}</span></span>
        <button class="splib-eye" data-act="drill-open" data-name="${esc(d.name)}" aria-label="Ver ejercicio">👁</button>
      </div>`;
    }).join('');
    return `<div class="card sp-card">
      <div class="sp-phase">Entrenamiento libre · biblioteca</div>
      <h2 class="sp-q">Elige un ejercicio</h2>
      <p class="sp-libhint">Toca el ejercicio que quieras entrenar a tu ritmo.</p>
      <div class="lib-tabs">${tabs}</div>
      <div class="splib-list">${list}</div>
      <button class="sp-back" data-act="free-lib-back">← Atrás</button>
    </div>`;
  }
  if (step === 'areas') {
    const sel = (V.planAreas && V.planAreas.length) ? V.planAreas : ['driving', 'approach', 'short', 'putting'];
    const areas = Object.keys(SP_AREAS).map(k => `<button class="sp-areab ${sel.includes(k) ? 'on' : ''}" data-act="plan-area" data-k="${k}"><span class="sp-areaic">${golfIcon(SP_AREAS[k].icon)}</span>${SP_AREAS[k].label}${sel.includes(k) ? ' ✓' : ''}</button>`).join('');
    return `<div class="card sp-card">
      <div class="sp-phase">${spFmtMin(T)} · tú eliges</div>
      <h2 class="sp-q">¿Qué quieres entrenar?</h2>
      <div class="sp-areas">${areas}</div>
      <button class="btn primary" data-act="plan-build" ${sel.length ? '' : 'disabled'}>Armar mi sesión →</button>
      <button class="sp-back" data-act="plan-mode-back">← Atrás</button>
    </div>`;
  }
  // step plan: si hay sesión guiada corriendo, muéstrala; si no, la línea de tiempo + botón
  if (V.sessionRun) return vSessionRunner();
  const ai = V.planMode !== 'me';
  const blocks = buildSessionBlocks(u, agg, T, V.planMode, V.planAreas);
  const sceneFor = spSceneFor;
  let clock = 0;
  const segs = blocks.map((b, bi) => {
    const from = clock; clock += b.min;
    return `<div class="spt-node ${b.warm ? 'warm' : ''}" data-act="session-run-start" data-idx="${bi}" role="button" tabindex="0" aria-label="Empezar ${esc(b.label)}">
      <span class="spt-scene">${drillScene(sceneFor(b.label))}<span class="spt-playic">▶</span></span>
      <div class="spt-card">
        <div class="spt-top"><b>${esc(b.label)}</b><span class="spt-time">${from}–${clock}'</span></div>
        ${b.drill ? `<button class="spt-drill" data-act="drill-open" data-name="${esc(b.drill)}">${golfIcon('green')} ${esc(b.drill)} →</button>` : `<span class="spt-note">Calienta progresivo: wedge → hierros → driver</span>`}
        <div class="spt-len"><span class="spt-track"><i style="width:${Math.round(b.min / T * 100)}%"></i></span><span class="spt-min">${b.min} min</span></div>
      </div></div>`;
  }).join('');
  return `<div class="card sp-card">
    <div class="sp-head"><span class="label">${golfIcon('flag')} Tu sesión · ${spFmtMin(T)}</span><span class="sp-total">${ai ? 'IA' : 'tú eliges'} · ${blocks.length} bloques</span></div>
    <div class="spt">${segs}</div>
    <button class="btn primary big" data-act="session-run-start" style="margin-top:6px">▶ Iniciar sesión guiada</button>
    <button class="btn ghost" data-act="plan-reset" style="margin-top:8px">↺ Nueva sesión</button>
    ${ai && !agg ? `<p class="note" style="margin-top:10px">Registra una ronda para que la IA ajuste el plan a tus debilidades reales.</p>` : ''}
  </div>`;
}

/* arma los bloques de la sesión (calentamiento + áreas), usado por la línea de tiempo y el runner */
function buildSessionBlocks(u, agg, T, mode, areas) {
  if (mode === 'lib') {
    const picked = (V.libPick || []).map(n => DRILL_LIBRARY.find(d => d.name === n)).filter(Boolean);
    if (!picked.length) return [];
    const per = Math.max(4, Math.round(T / picked.length));
    const cl = { fw: 'Salida', gir: 'Hierros', ud: 'Juego corto', putt: 'Putting' };
    const ci = { fw: 'flag', gir: 'green', ud: 'bucket', putt: 'putter' };
    const bl = picked.map(d => ({ label: cl[d.cat] || 'Drill', icon: ci[d.cat] || 'green', drill: d.name, min: per }));
    const sum = bl.reduce((a, b) => a + b.min, 0);
    bl[bl.length - 1].min = Math.max(4, bl[bl.length - 1].min + (T - sum));
    return bl;
  }
  const warm = Math.max(5, Math.round(T * 0.12));
  const rem = T - warm;
  let blocks;
  if (mode !== 'me') {
    let focus = agg ? Trainer.analyze(agg, u).focus.slice(0, 4) : [];
    if (!focus.length) focus = Object.keys(SP_AREAS).map(k => ({ key: k, titulo: SP_AREAS[k].label, lost: 1, drills: [] }));
    const totalLost = focus.reduce((a, f) => a + Math.max(0.25, f.lost), 0);
    blocks = focus.map(f => ({ label: (SP_AREAS[f.key] || {}).label || f.titulo, icon: (SP_AREAS[f.key] || {}).icon || 'green', drill: (f.drills && f.drills[0]) ? f.drills[0].name : spDrill(f.key), min: Math.max(6, Math.round(rem * Math.max(0.25, f.lost) / totalLost)) }));
  } else {
    const sel = (areas && areas.length) ? areas : ['driving', 'approach', 'short', 'putting'];
    const per = Math.max(6, Math.round(rem / sel.length));
    blocks = sel.map(k => ({ label: SP_AREAS[k].label, icon: SP_AREAS[k].icon, drill: spDrill(k), min: per }));
  }
  const sum = blocks.reduce((a, b) => a + b.min, 0);
  if (blocks.length) blocks[blocks.length - 1].min = Math.max(5, blocks[blocks.length - 1].min + (rem - sum));
  return [{ label: 'Calentamiento', icon: 'bucket', drill: null, min: warm, warm: true }, ...blocks];
}

/* sesión guiada en curso: bloque actual + cuenta regresiva + pitidos al cambiar */
function vSessionRunner() {
  const r = V.sessionRun; const b = r.blocks[r.idx]; const next = r.blocks[r.idx + 1];
  const tot = b.min * 60; const pct = Math.round(100 * (1 - r.left / tot));
  return `<div class="card sp-card sr-card">
    <div class="sp-phase">Sesión en curso · bloque ${r.idx + 1} de ${r.blocks.length}</div>
    <div class="sr-now"><span class="sr-scene">${drillScene(spSceneFor(b.label))}</span><div class="sr-nowtx"><b>${esc(b.label)}</b>${b.drill ? `<button class="sr-drill" data-act="drill-open" data-name="${esc(b.drill)}">${esc(b.drill)} →</button>` : `<span>Calienta progresivo</span>`}</div></div>
    <div class="sr-clock" id="sr-clock">${fmtClock(r.left)}</div>
    <div class="sr-bar"><i id="sr-bar" style="width:${pct}%"></i></div>
    <p class="sr-next">${next ? 'Sigue: ' + esc(next.label) + ' · ' + next.min + ' min' : '¡Último bloque!'}</p>
    <div class="ddt2-ctrls">
      ${r.running ? `<button class="btn" data-act="session-run-pause">⏸ Pausar</button>` : `<button class="btn primary" data-act="session-run-resume">Reanudar ▶</button>`}
      <button class="btn ghost" data-act="session-run-skip" aria-label="Saltar bloque">⏭</button>
    </div>
    <button class="sp-back" data-act="session-run-stop">Terminar sesión</button>
  </div>`;
}

/* dibujo de fairway (fairway) más claro y nítido para la biblioteca */
function lbFwScene() {
  return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <ellipse cx="50" cy="52" rx="36" ry="4" fill="#cfe3b6"/>
    <path d="M34 54 L66 54 L57 12 L43 12 Z" fill="#7cbf52"/>
    <path d="M43 12 L57 12 L56 8 L44 8 Z" fill="#5aa641"/>
    <path d="M41 32 L59 32" stroke="#5aa641" stroke-width="1" opacity=".4"/>
    <line x1="50" y1="10" x2="50" y2="2" stroke="#cfd6d8" stroke-width="1.4"/><path d="M50 2 L60 5 L50 8 Z" fill="#ff5a4d"/>
    <circle cx="50" cy="46" r="3" fill="#fff" stroke="#5a6668" stroke-width=".5"/>
  </svg>`;
}
/* dibujo de green (GIR) más claro y nítido para la biblioteca */
function lbGirScene() {
  return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <ellipse cx="50" cy="41" rx="40" ry="12" fill="#cfe3b6"/>
    <ellipse cx="50" cy="34" rx="34" ry="13" fill="#7cbf52"/>
    <ellipse cx="48" cy="31" rx="22" ry="8" fill="#8fd06a"/>
    <ellipse cx="56" cy="29" rx="3" ry="1.4" fill="#0c1c11"/>
    <line x1="56" y1="29" x2="56" y2="8" stroke="#cfd6d8" stroke-width="1.4"/><path d="M56 8 L67 11 L56 14 Z" fill="#ff5a4d"/>
    <circle cx="42" cy="33" r="3" fill="#fff" stroke="#5a6668" stroke-width=".5"/>
  </svg>`;
}
/* dibujo de putt (mismo estilo que las escenas de Inicio) */
function lbPuttScene() {
  return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <ellipse cx="50" cy="46" rx="42" ry="8" fill="var(--sc-dim,#cfe3b6)"/>
    <ellipse cx="50" cy="33" rx="34" ry="15" fill="var(--sc-grass2,#7cbf52)"/>
    <ellipse cx="58" cy="28" rx="3.4" ry="1.6" fill="#0c1c11"/>
    <line x1="58" y1="28" x2="58" y2="9" stroke="var(--sc-cup,#cfd6d8)" stroke-width="1.4"/><path d="M58 9 L68 12 L58 15 Z" fill="var(--sc-flag,#ff5a4d)"/>
    <path d="M40 40 Q49 33 56 28" fill="none" stroke="#fff" stroke-width="1.3" stroke-dasharray="2.5 3" opacity=".75"/>
    <circle cx="40" cy="40" r="3.2" fill="var(--sc-ball,#fff)" stroke="#5a6668" stroke-width=".5"/>
  </svg>`;
}
/* dibujo de up & down claro y estático (sin gif) */
function lbUdScene() {
  return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <ellipse cx="54" cy="46" rx="42" ry="7" fill="#cfe3b6"/>
    <ellipse cx="64" cy="36" rx="27" ry="11" fill="#7cbf52"/>
    <ellipse cx="62" cy="33" rx="17" ry="6" fill="#8fd06a"/>
    <ellipse cx="65" cy="34" rx="3" ry="1.4" fill="#0c1c11"/>
    <line x1="65" y1="34" x2="65" y2="12" stroke="#cfd6d8" stroke-width="1.4"/><path d="M65 12 L75 15 L65 18 Z" fill="#ff5a4d"/>
    <path d="M22 44 Q44 4 61 33" fill="none" stroke="#9fc77f" stroke-width="1.3" stroke-dasharray="2.5 3" opacity=".85"/>
    <circle cx="22" cy="44" r="3.2" fill="#fff" stroke="#5a6668" stroke-width=".5"/>
  </svg>`;
}
/* escena 3D estática clara para timers/drills (no gif, no fondo negro) */
function drillScene(kind) {
  if (kind === 'gir') return lbGirScene();
  if (kind === 'ud') return lbUdScene();
  if (kind === 'putt') return lbPuttScene();
  return lbFwScene();
}

function vBiblioteca() {
  const done = (cur() || {}).drillsDone || {};
  const td = today();
  const AREA = { fw: { c: '#3f9d44', ic: 'flag' }, gir: { c: '#2fa36b', ic: 'green' }, ud: { c: '#e0873a', ic: 'bucket' }, putt: { c: '#3a8fe0', ic: 'putter' } };
  const cat = (V.drillCat && DRILL_CATS.some(c => c.id === V.drillCat)) ? V.drillCat : DRILL_CATS[0].id;
  const tabs = DRILL_CATS.map(c => {
    const a = AREA[c.id] || AREA.fw;
    const n = DRILL_LIBRARY.filter(d => d.cat === c.id).length;
    return `<button class="lib-tab ${c.id === cat ? 'on' : ''}" data-act="drill-cat" data-c="${c.id}" style="--lib:${a.c}"><span class="lib-tab-ic">${golfIcon(a.ic)}</span>${esc(c.label)}<span class="lib-tab-n">${n}</span></button>`;
  }).join('');
  const drills = DRILL_LIBRARY.filter(d => d.cat === cat);
  const LV = ['Básico', 'Intermedio', 'Avanzado'];
  const band = Math.max(1, Math.ceil(drills.length / 3));
  // mismos dibujos que Inicio: fairway, green, up&down (+ putt)
  const scene = (cat === 'fw') ? lbFwScene()
    : (cat === 'gir') ? lbGirScene()
      : (cat === 'ud') ? lbUdScene()
        : (cat === 'putt') ? lbPuttScene()
          : (typeof chkScene === 'function') ? chkScene(cat, true) : '';
  const doneCount = drills.filter(d => done[d.name]).length;
  const items = drills.map((d, i) => {
    const isDone = !!done[d.name];   // queda palomeado de forma permanente (registrado)
    const lvl = LV[Math.min(2, Math.floor(i / band))];
    return `<button class="lbd ${isDone ? 'done' : ''}" data-act="drill-open" data-name="${esc(d.name)}">
      <span class="lbd-scene">${scene}</span>
      <div class="lbd-main">
        <div class="lbd-top"><b class="lbd-name">${esc(d.name)}</b>${isDone ? '<span class="lbd-done">✓</span>' : ''}</div>
        <p class="lbd-desc">${esc(d.desc)}</p>
        <div class="lbd-chips"><span class="lbd-chip">${esc(lvl)}</span><span class="lbd-chip">${esc(d.dose)}</span></div>
      </div>
      <span class="lbd-go">›</span></button>`;
  }).join('');
  return `<div class="sec-h" style="margin-top:18px"><h2 style="font-size:18px">Biblioteca de drills</h2><span class="small muted">${doneCount ? `<span class="lib-done-n">✓ ${doneCount}</span> · ` : ''}${drills.length} ejercicios</span></div>
    <div class="lib-tabs">${tabs}</div>
    <div class="lbd-list">${items}</div>`;
}
/* pestaña Academia: tarjeta de lanzamiento a la ruta inmersiva */
function vAcademyLaunch() {
  if (typeof vAcademyBody !== 'function') return '';
  return `<div class="acw-inline">${vAcademyBody(cur())}</div>${V.quiz ? vQuizSheet() : ''}`;
}

function vTrackerPlan() {
  const u = cur();
  const plan = trackerPlan(u);
  const list = myPractices();
  const done = (cur() || {}).drillsDone || {};
  const td = today();
  const bestOf = name => list.filter(p => p.drill === name).reduce((m, p) => Math.max(m, p.hits || 0), 0);
  const cats = plan.groups.map(c => {
    const tiles = c.drills.map(d => {
      const best = bestOf(d.name);
      const hit = best >= d.target || done[d.name] === td;
      return `<button class="dlc ${hit ? 'done' : ''}" data-act="drill-open" data-name="${esc(d.name)}" data-target="${d.target}" data-area="${esc(d.area || c.cat)}" data-goal="${esc(d.goal || '')}" data-timer="${d.timer}">
        <span class="dlc-check">${hit ? '✓' : ''}</span>
        <div class="dlc-info">
          <b>${esc(d.name)}</b>
          <p class="dlc-desc">${esc(d.goal || ('Práctica de ' + c.cat.toLowerCase()))}</p>
          <div class="dlc-meta"><span>${golfIcon('bucket')} meta ${d.target} seguidas</span><span>${golfIcon('green')} ${best ? 'mejor ' + best + '/' + d.target : esc(c.cat)}</span></div>
        </div>
        <span class="dlc-go">${hit ? 'Hecho' : 'Ver →'}</span>
      </button>`;
    }).join('');
    return `<div class="sec-h" style="margin-top:18px"><h2 style="font-size:15px">${golfIcon(c.icon)} ${esc(c.cat)}</h2></div><div class="dlc-list">${tiles}</div>`;
  }).join('');
  return `<div class="sec-h" style="margin-top:24px"><h2 style="font-size:18px">${golfIcon('flag')} Entrenamientos Parfect</h2><span class="small muted">por área</span></div>
    <p class="note" style="margin-top:2px">Elige el bastón o área que quieras entrenar y dale para empezar.</p>${cats}`;
}

function vDrillSheet() {
  const d = V.drillLog;
  const secs = d.secs != null ? d.secs : d.timer * 60;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
  const full = d.timer * 60;
  const streak = d.streak || 0, best = d.best || 0;
  const done = streak >= d.target;
  const pct = Math.min(100, Math.round(streak / d.target * 100));
  const timeUp = secs <= 0;
  return `<div class="overlay" data-act="drill-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>${esc(d.name)}</h2>
    ${d.desc ? `<p class="auth-sub" style="margin-bottom:6px">${esc(d.desc)}</p>` : ''}
    <p class="auth-sub">Mete <b style="color:var(--text)">${d.target} seguidas</b>${d.goal ? ' · ' + esc(d.goal) : ''} antes de que acabe el timer. Si fallas, vuelves a 0.</p>

    ${(() => {
      const e = full > 0 ? Math.max(0, Math.min(1, (full - secs) / full)) : 0;
      const left = (8 + e * 84).toFixed(1);
      const top = (82 - Math.sin(e * Math.PI) * 66).toFixed(1);
      const hint = d.running ? '❚❚ Pausar' : (timeUp ? '🌙 ¡Se acabó!' : (secs < full ? '▶ Reanudar' : '▶ Iniciar'));
      return `<div class="suntimer ${d.running ? 'run' : ''} ${timeUp ? 'up' : ''}">
      <button class="st-sky" data-act="drill-timer-toggle" aria-label="${d.running ? 'Pausar' : 'Iniciar'} timer">
        <span class="st-sun" id="drill-sun" style="left:${left}%;top:${top}%"></span>
        <svg class="st-hills" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true"><path d="M0,50 L0,34 Q40,20 80,30 T160,26 T200,32 L200,50 Z" fill="#3f8f3a" opacity="0.9"/><path d="M0,50 L0,42 Q50,30 110,38 T200,40 L200,50 Z" fill="#2f7a38"/></svg>
        <span class="st-flag">${golfIcon('flag')}</span>
        <span class="st-mid"><span class="st-time" id="drill-time">${mm}:${ss}</span><span class="st-hint">${hint}</span></span>
      </button>
      <button class="dtimer-reset" data-act="drill-timer-reset">↻ Reiniciar timer</button>
    </div>`;
    })()}

    <div class="drill-count">
      <div class="dc-num ${done ? 'done' : ''}">${streak}<span>/ ${d.target} seguidas</span></div>
      <div class="bar" style="margin-top:12px"><i style="width:${pct}%"></i></div>
      <p class="note" style="margin:8px 0 0">${done ? '¡Objetivo logrado!' : `Mejor racha: ${best}/${d.target}`}</p>
    </div>

    <button class="btn primary drill-tap" data-act="drill-hit">✓ Metió</button>
    <button class="btn danger" data-act="drill-miss" style="margin-top:8px">Falló · vuelve a 0</button>

    <button class="btn primary" data-act="drill-save" style="margin-top:16px">Guardar resultado</button>
    <button class="btn" data-act="drill-close">Cancelar</button>
  </div></div>`;
}

/* ---------- Editor de palos (perfil) ---------- */
function vClubs() {
  const u = cur();
  const clubs = u.clubs || {};
  const groupName = { largo: 'Maderas e híbridos', hierros: 'Hierros', wedges: 'Wedges' };
  const sections = ['largo', 'hierros', 'wedges'].map(g => {
    const rows = CLUBS.filter(c => c.group === g).map(c => {
      const cc = clubC(clubs, c.id);
      return `<div class="club-row">
        <label>${esc(c.name)}</label>
        <div class="club-in">
          <input id="club-c-${c.id}" type="number" inputmode="numeric" placeholder="${CLUB_DEFAULT[c.id]}" value="${cc != null ? cc : ''}"><span>yds</span>
        </div>
      </div>`;
    }).join('');
    return `<div class="card"><span class="label">${golfIcon(GROUP_META[g].icon)} ${groupName[g]}</span><p class="note" style="margin-top:0;margin-bottom:6px">Carry de cada bastón (cuánto vuela, en yardas).</p>${rows}</div>`;
  }).join('');
  return `<button class="auth-back" data-act="nav" data-view="perfil">← Perfil</button>
    <h1 class="auth-h">Mis bastones</h1>
    <p class="auth-sub">Anota el carry de cada bastón que uses. Deja en blanco los que no tengas.</p>
    ${sections}
    <button class="btn primary" data-act="save-clubs">Guardar mis bastones</button>
    <button class="btn" data-act="nav" data-view="perfil">Cancelar</button>`;
}

/* ---------- Calendario (estilo Apple, mensual) ---------- */
const FOCUS_LABEL = { driving: 'Driving', approach: 'Hierros', short: 'Juego corto', putting: 'Putting' };
const CAL_WD = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const CAL_WD_FULL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const EV_LABEL = { ronda: 'Ronda', entreno: 'Entreno', descanso: 'Descanso' };
const EV_ICON = { ronda: 'flag', entreno: 'bucket', descanso: 'green' };

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
  // drills concretos priorizados por la debilidad del perfil (diagnóstico)
  let plan = [];
  if (agg) Trainer.analyze(agg, u).focus.forEach(f => (f.drills || []).forEach(d => plan.push({ area: FOCUS_LABEL[f.key] || f.titulo, name: d.name })));
  if (!plan.length) plan = [
    { area: 'Putting', name: 'Reloj de 1.5 m' },
    { area: 'Juego corto', name: 'Up & Down Challenge' },
    { area: 'Hierros', name: 'Escalera de distancias' },
    { area: 'Driving', name: 'Gate Drill con alineación' },
  ];
  const rounds = u.roundsPerWeek != null ? u.roundsPerWeek : 5;
  const trains = u.trainPerWeek != null ? u.trainPerWeek : 5;
  const start = new Date(); start.setHours(12, 0, 0, 0);
  const days = []; for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push(d); }
  const openDays = days.filter(d => ((d.getDay() + 6) % 7) !== closedDay);
  if (!openDays.length) return [];
  const out = [];
  const weekendFirst = [...openDays].sort((a, b) => (((a.getDay() + 6) % 7) >= 5 ? 0 : 1) - (((b.getDay() + 6) % 7) >= 5 ? 0 : 1));
  for (let r = 0; r < rounds; r++) out.push({ id: Store.uid(), date: isoLocal(weekendFirst[r % weekendFirst.length]), type: 'ronda', title: 'Ronda', ai: true });
  for (let t = 0; t < trains; t++) { const p = plan[t % plan.length]; out.push({ id: Store.uid(), date: isoLocal(openDays[t % openDays.length]), type: 'entreno', title: p.name, area: p.area, ai: true }); }
  return out;
}
/* Carga el plan de la semana automáticamente si no hay nada agendado por la IA */
function ensureWeekPlan(u) {
  const tl = todayLocal();
  if ((u.events || []).some(e => e.ai && e.date >= tl)) return;
  u.events = (u.events || []).filter(e => !(e.ai && e.date >= tl));
  u.events.push(...generateAIPlan(u));
  Store.save(S);
}

function vCalendar() {
  const u = cur();
  ensureWeekPlan(u);
  if (!V.calSel) V.calSel = todayLocal();
  const closedDay = u.closedDay != null ? u.closedDay : 0;
  const events = u.events || [];
  const byDate = {};
  for (const e of events) (byDate[e.date] = byDate[e.date] || []).push(e);
  const tl = todayLocal();

  // cuadrícula de mes (formato calendario normal)
  const now = new Date();
  if (V.calY == null) { V.calY = now.getFullYear(); V.calM = now.getMonth(); }
  const y = V.calY, m = V.calM;
  const first = new Date(y, m, 1);
  const pad = (first.getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < pad; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let day = 1; day <= dim; day++) {
    const iso = isoLocal(new Date(y, m, day));
    const wd = (new Date(y, m, day).getDay() + 6) % 7;
    const dots = (byDate[iso] || []).slice(0, 3).map(e => `<i class="cal-dot ${e.type}"></i>`).join('');
    const cls = [iso === tl ? 'today' : '', iso === V.calSel ? 'sel' : '', wd === closedDay ? 'closed' : ''].join(' ').trim();
    cells += `<button class="cal-cell ${cls}" data-act="cal-day-sel" data-date="${iso}"><span class="cal-n">${day}</span><div class="cal-dots">${dots}</div></button>`;
  }
  const ml = first.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const monthLabel = ml.charAt(0).toUpperCase() + ml.slice(1);

  const selD = new Date(V.calSel + 'T12:00:00');
  const selWd = (selD.getDay() + 6) % 7;
  const selHead = `${CAL_WD_FULL[selWd]} ${selD.getDate()} de ${selD.toLocaleDateString('es-MX', { month: 'long' })}`;
  const selRel = calDateLabel(V.calSel).split('·').pop().trim();
  const selEvs = byDate[V.calSel] || [];
  const selList = selEvs.length
    ? selEvs.map(e => `<div class="cal-ev ${e.type}">
        <div class="r-main"><b>${esc(e.title || EV_LABEL[e.type])}</b><span>${golfIcon(EV_ICON[e.type])} ${EV_LABEL[e.type]}${e.area ? ' · ' + esc(e.area) : ''}${e.ai ? ' · IA' : ''}</span></div>
        <button class="pl-x" data-act="cal-del" data-id="${e.id}" aria-label="Eliminar">✕</button>
      </div>`).join('')
    : `<p class="note" style="margin:8px 0 0">Sin nada agendado${selWd === closedDay ? ' · el club cierra este día' : ''}.</p>`;
  const addType = V.calAddType || 'entreno';
  const typeChips = ['entreno', 'ronda', 'descanso'].map(t => `<button class="chip sm ${addType === t ? 'on' : ''}" data-act="cal-addtype" data-t="${t}">${golfIcon(EV_ICON[t])} ${EV_LABEL[t]}</button>`).join('');

  return `
    <div class="card">
      <div class="cal-head">
        <button class="cal-nav" data-act="cal-prev" aria-label="Mes anterior">‹</button>
        <span class="cal-month">${monthLabel}</span>
        <button class="cal-nav" data-act="cal-next" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-grid">
        ${CAL_WD.map(w => `<div class="cal-wd">${w}</div>`).join('')}
        ${cells}
      </div>
      <div class="cal-legend">
        <span><i class="cal-dot ronda"></i>Ronda</span>
        <span><i class="cal-dot entreno"></i>Entreno</span>
        <span><i class="cal-dot descanso"></i>Descanso</span>
        <span><i class="cal-sw-closed"></i>Cerrado</span>
      </div>
    </div>

    <div class="card">
      <div class="cal-day-head"><span class="label" style="margin:0">${selHead}</span><span class="cal-rel">${esc(selRel)}</span></div>
      ${selList}
      <div style="border-top:1px solid var(--line-soft);margin-top:14px;padding-top:12px">
        <span class="label">Agregar al día</span>
        <div class="chips" style="margin-top:6px">${typeChips}</div>
        <div class="join-row" style="margin-top:10px">
          <input id="cal-title" placeholder="${addType === 'ronda' ? 'Campo (ej. Campestre)' : addType === 'entreno' ? 'Enfoque (ej. Putting)' : 'Nota'}">
          <button class="btn sm primary" data-act="cal-add">Agregar</button>
        </div>
      </div>
    </div>
    <p class="note" style="margin-bottom:24px">Tu semana se carga sola con 5 entrenos y 5 jugadas. Para cambiar el ritmo o el día de cierre, ve a tu <b class="lime">Perfil</b>.</p>`;
}

/* ---------- Social ---------- */
/* Tarjeta de Parfect Party (vive en Iniciar ronda) */
function partyCard() {
  const u = cur();
  const act = activeParty();
  const myActive = act && (act.hostUserId === u.id || act.players.some(x => x.userId === u.id));
  return `<div class="card">
      <span class="label">${golfIcon('flag')} Tee time con amigos</span>
      <p class="small muted" style="margin-top:2px">Programa el tee time, elige la modalidad (Medal, Match o La corta) y comparte el código. Cada quien anota desde su celular.</p>
      ${myActive ? `<button class="btn primary" data-act="party-resume">Continuar ${esc(act.code)} ${act.status === 'live' ? `· hoyo ${act.idx + 1}` : '· lobby'}</button>`
        : `<button class="btn primary" data-act="party-new">Programar tee time</button>`}
      <div class="join-row" style="margin-top:12px">
        <input id="join-code" placeholder="Código (ej. K7M2)" maxlength="4" style="text-transform:uppercase">
        <button class="btn sm ghost" data-act="party-join" ${V.joining ? 'disabled' : ''}>${V.joining ? 'Buscando…' : 'Unirse'}</button>
      </div>
      ${V.err ? `<p class="form-err">${esc(V.err)}</p>` : ''}
    </div>`;
}

/* La sección Social = el hub con liga de amigos, feed de amigos, torneo (sin calendario) */
function vSocial() { return (typeof vPerfil === 'function') ? vPerfil() : ''; }

/* ---------- Perfil de un jugador (amigo) ---------- */
function vFriend() {
  // ---- modo nube: perfil de un usuario real (uid uuid con guiones) ----
  if (typeof Feed !== 'undefined' && Feed.on() && V.friendId && V.friendId.indexOf('-') >= 0 && typeof vFriendReal === 'function') {
    return vFriendReal(V.friendId);
  }
  const ff = (typeof FRIENDS_FEED !== 'undefined' ? FRIENDS_FEED : []).find(x => x.id === V.friendId);
  if (ff) return vFriendFeed(ff);
  const af = ((cur() && cur().friends) || []).find(x => x.id === V.friendId);
  if (af) {
    return `<button class="auth-back" data-act="nav" data-view="social">← Social</button>
      <div class="greet" style="padding-top:6px">
        <div style="display:flex;align-items:center;gap:14px">
          <span style="flex:0 0 auto;width:56px;height:56px"><img class="golfer" src="${AVATARS[af.av || 0] || AVATARS[0]}" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:contain;background:var(--lime-faint)"></span>
          <div><h1 style="font-size:26px">${esc(af.name)}</h1><p class="hcp">HCP ${fmtHcp(af.hcp)}</p></div>
        </div>
      </div>
      <div class="card empty"><div class="e-ico">${golfIcon('flag')}</div><h3>Amigo de tu liga</h3><p>Lo agregaste tú. Invítalo a la app por WhatsApp para ver sus rondas reales aquí.</p></div>
      <button class="btn ghost" data-act="friend-del" data-id="${esc(af.id)}" style="width:100%;margin-top:4px">Quitar de mi liga</button>`;
  }
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
    return head + `<div class="card empty"><div class="e-ico">${golfIcon('flag')}</div><h3>Sin rondas todavía</h3><p>${me ? 'Aún no registras rondas.' : 'Este jugador aún no tiene rondas.'}</p></div>`;
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
          <div class="r-main"><b>${esc(r.course)}${r.partyId ? ' ' + golfIcon('flag') : ''}</b><span>${fmtDate(r.date)} · ${s.holes} hoyos · ${s.putts} putts</span></div>
          <div class="r-side"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
        </div>`;
      }).join('')}
    </div>`;
}

/* Perfil de un amigo del feed — mismas stats y diseño que Inicio (datos simulados de FRIENDS_FEED) */
function vFriendFeed(f) {
  const putts18 = Math.round(f.putts / f.holes * 18);
  const toPar18 = Math.round(f.toPar / f.holes * 18);
  const scrPct = (typeof Stats !== 'undefined' && Stats.benchFor) ? Math.round(Stats.benchFor(f.hcp).scrPct) : 50;
  const threePct = (typeof Stats !== 'undefined' && Stats.benchFor) ? Stats.benchFor(f.hcp).threePct : 6;
  const threeP = (threePct / 100 * 18).toFixed(1);
  const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const birdiePct = cl(Math.round(11 - f.hcp * 0.5), 0, 16);
  const bogeyPct = cl(Math.round(20 + f.hcp * 1.7), 10, 78);
  const parPct = cl(100 - birdiePct - bogeyPct, 4, 90);
  const rk = (typeof RANKS !== 'undefined' && typeof rankIdx === 'function') ? RANKS[rankIdx(f.hcp)] : null;
  const rings = [
    pstSceneStatic('fw', f.fw, 'Fairways'),
    pstSceneStatic('gir', f.gir, 'GIR'),
    pstSceneStatic('ud', scrPct, 'Up & down'),
  ].join('');
  const tiles = [
    ['Putts / ronda', String(putts18), `<span class="pst-ic">${golfIcon('putter')}</span>`],
    ['3-putts / ronda', threeP, `<span class="pst-ic">${golfIcon('bucket')}</span>`],
    ['Birdie o mejor', birdiePct + '%', `<img src="assets/eagle.png" class="pst-img" alt="">`],
    ['Bogey o peor', bogeyPct + '%', `<span class="pst-ic pst-bogey"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="3.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span>`],
    ['Pares', parPct + '%', `<span class="pst-ic">${golfIcon('flag')}</span>`],
    ['Última (a par)', fmtToPar(toPar18), `<span class="pst-ic">${golfIcon('trophy')}</span>`],
  ].map((t, i) => `<div class="pst-tile" style="--i:${i}"><span class="pst-th">${t[2]}</span><b class="pst-val">${t[1]}</b><span class="pst-lab">${t[0]}</span></div>`).join('');
  return `<button class="auth-back" data-act="nav" data-view="social">← Social</button>
    <div class="pl-hero" style="background:linear-gradient(135deg,#2f6d34,#1c4a23)">
      <div class="pl-hero-txt">
        <span class="pl-hero-lab">${esc(f.name)}${rk ? ' · ' + rk.n : ''}</span>
        <div class="pl-hero-num">${fmtHcp(f.hcp)}</div>
        <span class="pl-hero-sub">Hándicap · ${esc(f.course)}</span>
      </div>
      <span class="pl-hero-av golfer"><img class="golfer" src="${AVATARS[f.av] || AVATARS[0]}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:contain"></span>
    </div>
    <div class="pst-rings">${rings}</div>
    <div class="pst-grid">${tiles}</div>
    <div class="card" style="margin-top:16px">
      <span class="label">Última ronda · ${esc(f.when)}</span>
      <div class="hist-row" style="cursor:default">
        <div class="r-main"><b>${esc(f.course)}</b><span>${f.holes} hoyos · ${f.putts} putts · ${f.fw}% FW · ${f.gir}% GIR</span></div>
        <div class="r-side"><b>${f.score}</b><span>${fmtToPar(f.toPar)}</span></div>
      </div>
      ${f.cap ? `<p class="note" style="margin:10px 0 0">“${esc(f.cap)}”</p>` : ''}
    </div>
    <button class="btn primary" data-act="event-new" style="margin-top:14px">${golfIcon('flag')} Invitar a jugar</button>`;
}
