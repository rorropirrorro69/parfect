/* ============ Shell (header + nav), Dashboard, Perfil ============ */

function navKeyOf(view) {
  if (['ronda', 'nueva', 'detalle'].includes(view)) return 'ronda';
  if (['trainer', 'clubs'].includes(view)) return 'trainer';
  if (['perfil', 'clubs', 'friend'].includes(view)) return 'perfil';
  return 'inicio';
}

function vShell(content) {
  const u = cur();
  const k = navKeyOf(V.view);
  const item = (key, label) =>
    `<button class="nav-item ${k === key ? 'on' : ''}" data-act="nav" data-view="${key}">${ICONS[key]}<span>${label}</span></button>`;
  return `<div class="shell">
    <div class="hdr">
      <span style="width:40px"></span>
      <span class="logo-word">${logoMark(16)} PARFECT</span>
      <button class="avatar-btn" data-act="profile-open" aria-label="Perfil">${esc(initials(u.name))}</button>
    </div>
    <div class="app-content">${content}</div>
    <nav class="nav">
      ${item('inicio', 'Inicio')}
      ${item('ronda', 'Ronda')}
      <button class="nav-p" data-act="quick-round" aria-label="Iniciar ronda">P</button>
      ${item('trainer', 'Trainer')}
      ${item('perfil', 'Perfil')}
    </nav>
    ${V.profileOpen ? vProfile() : ''}
    ${V.drillLog ? vDrillSheet() : ''}
  </div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/* Mini gráfica de tendencia de score (per-18, mejor=arriba) */
function progressChart(data) {
  const W = 300, H = 110, pad = 22;
  const min = Math.min(...data), max = Math.max(...data), span = Math.max(4, max - min);
  const x = i => data.length > 1 ? pad + i * (W - 2 * pad) / (data.length - 1) : W / 2;
  const y = v => pad + (v - min) / span * (H - 2 * pad);
  const pts = data.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(0)},${p[1].toFixed(0)}`).join(' ');
  const dots = pts.map(p => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="3.5" fill="#c9f73e"/>`).join('');
  const sign = v => (v >= 0 ? '+' : '') + v;
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencia de score">
    <path d="${line}" fill="none" stroke="#c9f73e" stroke-width="2.5" stroke-linejoin="round"/>${dots}
    <text x="${pad}" y="14" fill="#7c8a70" font-family="Inter,system-ui" font-size="10">${sign(data[0])} antes</text>
    <text x="${W - pad}" y="14" fill="#c9f73e" font-family="Inter,system-ui" font-size="11" font-weight="800" text-anchor="end">${sign(data[data.length - 1])} última</text>
  </svg>`;
}
function progressCard(u, rounds) {
  const data = rounds.slice(0, 8).reverse().map(r => { const s = Stats.roundStats(r); return Math.round(s.toPar * 18 / s.holes); });
  let chart, trend = '';
  if (data.length >= 2) {
    chart = progressChart(data);
    const half = Math.ceil(data.length / 2);
    const avgE = data.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const avgL = data.slice(-half).reduce((a, b) => a + b, 0) / half;
    const d = Math.round(avgE - avgL);
    trend = d > 0 ? `Vas mejorando: ~<b class="lime">${d}</b> golpes menos que tus primeras rondas.`
      : d < 0 ? `Has subido ~${-d} golpes — toca apretar la práctica.` : `Estable en tus últimas rondas.`;
  } else {
    chart = `<p class="note">Registra 2+ rondas para ver tu tendencia.</p>`;
  }
  const gap = Math.max(0, Math.round(u.hcp - u.goal));
  return `<div class="card">
    <span class="label">${golfIcon('peak')} Seguimiento de progreso</span>
    ${chart}
    ${trend ? `<p class="note" style="margin:8px 0 6px">${trend}</p>` : ''}
    <p class="note" style="margin-bottom:0">HCP ${fmtHcp(u.hcp)} · meta ${fmtHcp(u.goal)}${gap > 0 ? ` · te faltan <b class="lime">${gap}</b> para tu meta` : ' · ¡meta alcanzada!'}</p>
  </div>`;
}

/* Próximos eventos (para Inicio) */
function upcomingCard(u) {
  const tl = todayLocal();
  const up = (u.events || []).filter(e => e.date >= tl && e.type !== 'descanso').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  if (!up.length) return '';
  const rows = up.map(e => `<button class="cal-ev ${e.type}" data-act="cal-goto" data-date="${e.date}" style="width:100%;text-align:left;cursor:pointer">
      <div class="r-main"><b>${esc(e.title || EV_LABEL[e.type])}</b><span>${golfIcon(EV_ICON[e.type])} ${calDateLabel(e.date)}${e.area ? ' · ' + esc(e.area) : ''}</span></div><span class="muted">›</span>
    </button>`).join('');
  return `<div class="card"><span class="label">${golfIcon('card')} Próximos eventos</span>${rows}</div>`;
}

/* ---- escenas animadas tipo GIF por estadística ---- */
function statScene(kind) {
  const bg = `<rect width="170" height="100" rx="12" fill="#0c130a"/><rect x="0.5" y="0.5" width="169" height="99" rx="12" fill="none" stroke="#16210f"/>`;
  const flag = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 16}" stroke="#eef3e6" stroke-width="1.4"/><path d="M${x} ${y - 16} l8 2.4 -8 2.4z" fill="#c9f73e"/>`;
  if (kind === 'fw') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <path d="M72 100 L98 100 L91 34 L79 34 Z" fill="#2f6b39"/><path d="M78 96 L92 96 L88 40 L82 40 Z" fill="#3a8043" opacity="0.5"/>
    <ellipse cx="85" cy="30" rx="16" ry="8" fill="#57b15c"/>${flag(85, 30)}
    <ellipse cx="85" cy="60" rx="3" ry="2" fill="#c9f73e" opacity="0"><animate attributeName="opacity" values="0;0;.8;0" keyTimes="0;.47;.53;1" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="4" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -10 85 60" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
  </svg>`;
  if (kind === 'gir') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="46" rx="30" ry="16" fill="#2f6b39"/><ellipse cx="85" cy="44" rx="20" ry="10" fill="#57b15c"/>
    <circle cx="85" cy="42" r="2.4" fill="#0a0f08"/>${flag(85, 42)}
    <circle r="3.6" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3.2s" repeatCount="indefinite" path="M14 94 Q 38 -8 80 46" keyPoints="0;1;1;1" keyTimes="0;.44;.9;1" calcMode="linear"/></circle>
    <circle r="3.4" fill="#c9f73e" opacity="0.85"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite" path="M156 92 Q 124 -10 90 47" keyPoints="0;1;1;1" keyTimes="0;.44;.9;1" calcMode="linear"/></circle>
  </svg>`;
  if (kind === 'ud') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="102" cy="50" rx="33" ry="16" fill="#2f6b39"/><ellipse cx="102" cy="48" rx="21" ry="10" fill="#57b15c"/>
    <ellipse cx="32" cy="72" rx="16" ry="6" fill="#43331a"/>
    <circle cx="106" cy="46" r="2.6" fill="#0a0f08"/>${flag(106, 46)}
    <circle r="3.6" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3.4s" repeatCount="indefinite" path="M32 70 Q 64 -6 96 50 L106 46" keyPoints="0;0.85;0.85;1;1" keyTimes="0;.44;.6;.82;1" calcMode="linear"/></circle>
    <text x="100" y="90" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="800" text-anchor="middle" opacity="0">¡Salvado!<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.82;.86;.96;1" dur="3.4s" repeatCount="indefinite"/></text>
  </svg>`;
  if (kind === 'putt') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="52" rx="46" ry="30" fill="#2f6b39"/><ellipse cx="85" cy="52" rx="33" ry="21" fill="#3a8043" opacity="0.55"/>
    <path d="M85 80 L85 34" stroke="#c9f73e" stroke-width="1" stroke-dasharray="2 4" opacity="0.5"/>
    <circle cx="85" cy="34" r="5" fill="#0a0f08"/><circle cx="85" cy="34" r="7" fill="none" stroke="#c9f73e" stroke-width="0.8" opacity="0.6"/>${flag(85, 34)}
    <circle fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="2.6s" repeatCount="indefinite" path="M85 80 L85 34" keyPoints="0;1;1" keyTimes="0;.68;1" calcMode="linear"/><animate attributeName="r" values="3.6;3.6;0;0" keyTimes="0;.64;.7;1" dur="2.6s" repeatCount="indefinite"/></circle>
  </svg>`;
  return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="52" rx="48" ry="31" fill="#2f6b39"/><ellipse cx="85" cy="52" rx="34" ry="21" fill="#3a8043" opacity="0.5"/>
    <circle cx="85" cy="30" r="5" fill="#0a0f08"/>${flag(85, 30)}
    <circle cx="85" cy="41" r="11" fill="none" stroke="#c9f73e" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.55"/>
    <circle r="3.6" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M85 84 L85 41" keyPoints="0;1;1" keyTimes="0;.6;1" calcMode="linear"/></circle>
    <text x="85" y="94" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="800" text-anchor="middle" opacity="0">dada<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.6;.66;.96;1" dur="3s" repeatCount="indefinite"/></text>
  </svg>`;
}
/* reel horizontal de stats animadas (scroll automático) */
function vStatReel(rounds, agg) {
  const holes = rounds.flatMap(r => r.holes);
  const onePutt = holes.length ? Math.round(holes.filter(h => h.putts != null && h.putts <= 1).length / holes.length * 100) : 0;
  const noThree = Math.max(0, 100 - Math.round(agg.threePct || 0));
  const cards = [
    ['fw', Math.round(agg.fwPct) + '%', 'Fairways'],
    ['gir', Math.round(agg.girPct) + '%', 'Greens · GIR'],
    ['ud', Math.round(agg.scrPct) + '%', 'Up & down'],
    ['putt', onePutt + '%', 'Putts embocados'],
    ['lag', noThree + '%', 'Sin 3-putt'],
  ];
  const set = cards.map(([k, v, t]) => `<div class="reel-card"><div class="reel-scene">${statScene(k)}</div><div class="reel-meta"><b>${v}</b><span>${esc(t)}</span></div></div>`).join('');
  return `<div class="reel"><div class="reel-track">${set}${set}</div></div>`;
}
/* área (texto del plan) → llave de drillArt */
function areaKey(a) {
  const s = (a || '').toLowerCase();
  if (s.includes('driv') || s.includes('madera') || s.includes('salida')) return 'driving';
  if (s.includes('putt')) return 'putting';
  if (s.includes('corto') || s.includes('wedge') || s.includes('chip') || s.includes('up &')) return 'short';
  return 'approach';
}
/* el entrenamiento que toca: próximo del plan, o el punto débil recomendado */
function nextTraining(u) {
  const tl = todayLocal();
  const ev = (u.events || []).filter(e => e.type === 'entreno' && e.date >= tl).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (ev) return { area: ev.area || 'Entrenamiento', name: ev.title || 'Sesión', date: ev.date, key: areaKey(ev.area) };
  const agg = Stats.aggregate(myRounds());
  if (agg && typeof Trainer !== 'undefined') {
    const f = (Trainer.analyze(agg, u).focus || [])[0];
    if (f) return { area: (typeof FOCUS_LABEL !== 'undefined' && FOCUS_LABEL[f.key]) || f.titulo, name: (f.drills && f.drills[0] && f.drills[0].name) || 'Sesión recomendada', key: f.key, rec: true };
  }
  return null;
}
/* tarjeta "GIF" del entrenamiento/drill que toca (Inicio) */
function vTrainingCard(u) {
  const t = nextTraining(u);
  if (!t) return '';
  const when = t.rec ? 'Recomendado para ti' : (t.date === todayLocal() ? 'Hoy' : 'Próximo · ' + fmtDate(t.date));
  const howTo = { driving: 'alinea a un blanco y manda bolas a la calle imaginaria', approach: 'tira a banderas a distintas distancias buscando el centro del green', short: 'súbela y embócala, o déjala dada (a 1 m)', putting: 'mete putts seguidos por el gate' };
  const target = t.key === 'putting' ? 10 : 7;
  return `<div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">Entrenamiento que toca</h2><span class="small muted">${when}</span></div>
    <button class="card train-card" data-act="drill-open" data-name="${esc(t.name)}" data-target="${target}" data-area="${esc(t.area)}" data-goal="${esc(howTo[t.key] || '')}" data-timer="20">
      <div class="tc-art">${drillScene(t.name, t.key)}</div>
      <div class="tc-row">
        <div class="tc-body"><b>${esc(t.name)}</b><span>${esc(t.area)}${t.rec ? ' · tu mayor fuga de golpes' : ''}</span></div>
        <span class="tc-go">Entrenar →</span>
      </div>
    </button>`;
}

/* última ronda: % de la ronda + reel infinito de sus hoyos tiro por tiro */
function vLastRound(rounds) {
  const r = rounds[0];
  if (!r) return '';
  const s = Stats.roundStats(r);
  const p = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
  const stats = [[p(s.fw, s.fwTot), 'Calles'], [p(s.gir, s.girTot), 'GIR'], [p(s.scr, s.scrTot), 'Up&down'], [String(s.putts), 'Putts']];
  const statRow = `<div class="lr-stats">${stats.map(([v, t]) => `<div><b>${v}</b><span>${t}</span></div>`).join('')}</div>`;
  const card = (hh, i) => {
    const ch = (r.courseId && COURSES[r.courseId] && COURSES[r.courseId].holes[i]) ? COURSES[r.courseId].holes[i] : null;
    const yds = ch && ch.yds ? ` · ${ch.yds}y` : '';
    const stats = [hh.par >= 4 ? (hh.tee === 'fw' ? 'Calle ✓' : 'Calle ✗') : '', hh.app === 'gir' ? 'GIR ✓' : 'GIR ✗', hh.putts != null ? `${hh.putts} putts` : ''].filter(Boolean).join(' · ');
    return `<div class="reel-card"><div class="reel-scene">${captureSchematic(hh, ch)}</div><div class="reel-meta" style="padding:12px 16px 14px"><b style="font-size:22px">Hoyo ${i + 1}</b><span>Par ${hh.par}${yds} · ${hh.score} (${fmtToPar(hh.score - hh.par)})</span><span class="lr-holestats">${stats}</span></div></div>`;
  };
  const set = r.holes.map(card).join('');
  return `<div class="sec-h" style="margin-top:18px"><h2 style="font-size:18px">Tu última ronda</h2><span class="small muted">${esc(r.course)} · ${fmtDate(r.date)}</span></div>
    <div class="card" style="padding:14px">${statRow}<p class="note" style="margin:10px 0 0">${s.score} golpes · ${fmtToPar(s.toPar)} en ${s.holes} hoyos · hoyo por hoyo →</p></div>
    <div class="reel"><div class="reel-track">${set}${set}</div></div>`;
}

/* stats en conjunto (radar + tarjetas) para Perfil */
function vStatsBundle(agg) {
  const radar = Stats.radarOf(agg);
  return `<div class="card"><span class="label">Perfil de habilidades</span><div class="radar-wrap">${radarSVG(radar.labels, radar.values)}</div></div>
    <div class="grid2">
      ${statCard(agg.fwPct.toFixed(0) + '%', 'Fairways', agg.fwPct)}
      ${statCard(agg.girPct.toFixed(0) + '%', 'GIR', agg.girPct)}
      ${statCard(agg.scrPct.toFixed(0) + '%', 'Up/Down', agg.scrPct)}
      ${statCard(agg.putts18.toFixed(0), 'Putts / Ronda', Stats.clamp((38 - agg.putts18) / 11 * 100, 0, 100))}
    </div>`;
}

function vDashboard() {
  const u = cur();
  const rounds = myRounds();
  const agg = Stats.aggregate(rounds);
  const head = `<div class="greet">
    <p class="hi">${greeting()}</p>
    <h1>Hola, ${esc(u.name.split(' ')[0])}!</h1>
    <p class="hcp">HCP: ${fmtHcp(u.hcp)} · Meta ${fmtHcp(u.goal)}</p>
  </div>`;

  if (!agg) {
    return head + `<div class="card empty">
      <div class="e-ico">${golfIcon('flag')}</div>
      <h3>Tu perfil de jugador empieza aquí</h3>
      <p>Registra tu primera ronda — o carga datos de ejemplo para ver PARFECT en acción.</p>
      <button class="btn primary" data-act="quick-round">${logoMark(15)} Registrar mi primera ronda</button>
      <button class="btn ghost" data-act="seed-demo">Cargar datos de ejemplo</button>
    </div>`;
  }

  return head + `
    <div class="sec-h" style="margin-top:2px"><h2 style="font-size:18px">Tu juego en movimiento</h2><span class="small muted">desliza →</span></div>
    ${vStatReel(rounds, agg)}
    ${vRecommendedDrills(u, agg)}
    ${vLastRound(rounds)}`;
}

/* ---- reparto de score: birdies / pares / bogeys… ---- */
function vScoreDist(agg) {
  const d = agg.scoreDist;
  if (!d || !d.total) return '';
  const tot = d.total;
  const cats = [
    { label: 'Birdie o mejor', n: d.eagle + d.birdie, col: 'var(--lime)' },
    { label: 'Par', n: d.par, col: '#57b15c' },
    { label: 'Bogey', n: d.bogey, col: '#ff9f43' },
    { label: 'Doble o peor', n: d.dbl, col: 'var(--danger)' },
  ];
  const pct = n => Math.round((n / tot) * 100);
  const seg = cats.filter(c => c.n > 0).map(c => `<span style="width:${(c.n / tot) * 100}%;background:${c.col}"></span>`).join('');
  const rows = cats.map(c => `<div class="sd-row">
    <span class="sd-dot" style="background:${c.col}"></span>
    <span class="sd-lab">${c.label}</span>
    <span class="sd-pct">${pct(c.n)}%</span>
    <span class="sd-n">${c.n}</span>
  </div>`).join('');
  return `<div class="card">
    <span class="label">Mi juego · ${agg.holesPlayed} hoyos${d.eagle ? ` · ${d.eagle} águila${d.eagle > 1 ? 's' : ''} ${golfIcon('bird')}` : ''}</span>
    <div class="sd-bar">${seg}</div>
    <div class="sd-list">${rows}</div>
  </div>`;
}

/* ---- carry de cada bastón de mi bolsa (editable aquí mismo) ---- */
function vBagEditor(u) {
  const clubs = u.clubs || {};
  const groupName = { largo: 'Maderas e híbridos', hierros: 'Hierros', wedges: 'Wedges' };
  const groupIc = { largo: 'club', hierros: 'tee', wedges: 'green' };
  const sections = ['largo', 'hierros', 'wedges'].map(g => {
    const tiles = CLUBS.filter(c => c.group === g).map(c => {
      const cc = clubC(clubs, c.id);
      return `<div class="carry-tile">
        <input class="carry-in" id="club-c-${c.id}" type="number" inputmode="numeric" placeholder="${CLUB_DEFAULT[c.id]}" value="${cc != null ? cc : ''}">
        <span>${esc(c.name)}</span>
      </div>`;
    }).join('');
    return `<p class="sd-sub">${golfIcon(groupIc[g])} ${groupName[g]}</p><div class="carry-grid">${tiles}</div>`;
  }).join('');
  return `<div class="card">
    <span class="label">${golfIcon('club')} Mi bolsa · carry por bastón</span>
    <p class="note" style="margin-top:0;margin-bottom:6px">Ajusta el carry de cada bastón (en yardas). Deja en blanco los que no uses.</p>
    ${sections}
    <button class="btn primary" data-act="save-clubs" style="margin-top:14px">Guardar carries</button>
  </div>`;
}

/* cabecera grande del perfil: nombre + hándicap + campo de casa */
function vPerfilHero(u) {
  const ini = String(u.name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const home = (u.homeCourse && COURSES[u.homeCourse]) ? COURSES[u.homeCourse] : COURSES.campestre;
  const homeName = home.name.split(' · ')[0];
  const nRounds = myRounds().length;
  return `<div class="card phero">
    <button class="phero-edit" data-act="profile-edit" aria-label="Editar perfil">Editar</button>
    <div class="phero-row">
      <div class="phero-av">${esc(ini)}</div>
      <div class="phero-id">
        <h1 class="phero-name">${esc(u.name)}</h1>
        <p class="phero-course">${golfIcon('flag')} ${esc(homeName)}</p>
      </div>
    </div>
    <div class="phero-stats">
      <div><b>${fmtHcp(u.hcp)}</b><span>Hándicap</span></div>
      <div><b>${fmtHcp(u.goal)}</b><span>Meta</span></div>
      <div><b>${nRounds}</b><span>Rondas</span></div>
    </div>
  </div>`;
}

/* ============ Perfil (página) ============ */
function vPerfil() {
  const u = cur();
  const agg = Stats.aggregate(myRounds());
  return `<div class="sec-h"><h2>Tu perfil</h2></div>
    ${vPerfilHero(u)}
    ${agg ? `<div class="sec-h" style="margin-top:6px"><h2 style="font-size:16px">Mis números</h2></div>${vStatsBundle(agg)}` : ''}
    ${agg ? vScoreDist(agg) : ''}
    ${vBagEditor(u)}
    ${vLogros()}
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">${golfIcon('card')} Calendario</h2></div>
    ${vCalendar()}
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">${golfIcon('flag')} Patrocinadores y ofertas</h2></div>
    <div class="card">
      <p class="note" style="margin-top:0;margin-bottom:8px">Ofertas de aliados (próximamente). Espacio para patrocinadores.</p>
      <div class="club-grid">
        <div class="club-tile"><b>Tu club</b><span class="ct-goal">Reserva tu tee time</span></div>
        <div class="club-tile"><b>Equipo</b><span class="ct-goal">Palos, bolas y más</span></div>
        <div class="club-tile"><b>Clases</b><span class="ct-goal">Encuentra un PRO</span></div>
        <div class="club-tile"><b>Anúnciate</b><span class="ct-goal">Tu marca aquí</span></div>
      </div>
    </div>
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">Configuración</h2></div>
    <div class="card">
      <button class="btn ghost" data-act="seed-demo">Cargar datos de ejemplo</button>
      <button class="btn danger" data-act="wipe-mine">${V.wipeArm ? '¿Seguro? Toca otra vez para borrar tus rondas' : 'Borrar mis rondas y prácticas'}</button>
      <button class="btn" data-act="logout">Cerrar sesión</button>
      <p class="note">Cuenta local: ${esc(u.email)} · Tus datos viven solo en este dispositivo.</p>
    </div>
    ${V.profileOpen ? vProfile() : ''}`;
}

/* ============ Perfil (sheet) ============ */
function vProfile() {
  const u = cur();
  return `<div class="overlay" data-act="profile-close">
    <div class="sheet" data-act="noop">
      <div class="grab"></div>
      <h2>Editar perfil</h2>
      <div class="field"><label>Nombre</label><input id="p-name" value="${esc(u.name)}"></div>
      <div class="field-row">
        <div class="field"><label>Hándicap</label><input id="p-hcp" type="number" step="1" value="${esc(u.hcp)}"></div>
        <div class="field"><label>Meta</label><input id="p-goal" type="number" step="1" value="${esc(u.goal)}"></div>
      </div>
      <div class="field"><label>Campo de casa</label>
        <div class="chips">${COURSE_ORDER.map(id => `<button class="chip sm ${(u.homeCourse || 'campestre') === id ? 'on' : ''}" data-act="prof-campo" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('')}</div>
      </div>
      <button class="btn primary" data-act="profile-save">Guardar cambios</button>
      <button class="btn" data-act="profile-close">Cerrar</button>
    </div>
  </div>`;
}
