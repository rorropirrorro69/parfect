/* ============ Vista Trofeos: metas + logros ============ */

function vTrophies() {
  const u = cur();
  const list = Trophies.evaluate();
  const unlocked = list.filter(a => a.done).length;
  const goals = Trophies.goals();
  const fmtG = (v, suffix) => (v == null ? '—' : (suffix === '%' ? Math.round(v) + '%' : (Number.isInteger(v) ? v : v.toFixed(1))));

  const goalRows = goals.map(g => {
    const pct = Math.round((g.prog || 0) * 100);
    return `<div class="goal">
      <div class="goal-top">
        <span>${esc(g.label)}</span>
        <span class="${g.met ? 'lime' : 'muted'}">${fmtG(g.cur, g.suffix)} <span class="muted">/ meta ${fmtG(g.target, g.suffix)}</span></span>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }).join('');

  const cards = list.map(a => `<div class="trophy ${a.done ? 'on' : ''}">
    <div class="t-ic">${golfIcon(a.ic, a.done ? 'gi-spin' : '')}</div>
    <div class="t-body">
      <b>${esc(a.t)}</b>
      <span>${esc(a.d)}</span>
      ${!a.done && a.prog > 0 && a.prog < 1 ? `<div class="bar mini"><i style="width:${Math.round(a.prog * 100)}%"></i></div>` : ''}
      ${a.sub ? `<span class="t-sub">${esc(a.sub)}</span>` : ''}
    </div>
    <div class="t-state">${a.done ? '✓' : ''}</div>
  </div>`).join('');

  return `<div class="sec-h"><h2>Trofeos</h2><span class="small muted">${unlocked}/${list.length} logros</span></div>

    <div class="card">
      <span class="label">Tus metas</span>
      <p class="note" style="margin-top:0;margin-bottom:10px">Tu progreso hacia un hándicap de ${fmtHcp(u.goal)}.</p>
      ${goalRows}
    </div>

    <div class="sec-h"><h2 style="font-size:18px">Logros</h2></div>
    <div class="trophy-grid">${cards}</div>
    ${unlocked === 0 ? `<p class="note">Registra rondas y prácticas para empezar a desbloquear logros.</p>` : ''}
  `;
}

/* Solo logros (sin metas) — su propia sección */
/* Aviario: 50 pájaros coleccionables. Cada ronda y cada birdie desbloquea uno. */
const AVIARY = ['Primera ronda', 'Primer hoyo', 'Primer par', 'Primer birdie', 'Romper 120', 'Romper 115', 'Romper 110', 'Romper 105', 'Romper 100', 'Romper 95', 'Romper 90', 'Romper 85', 'Romper 80', 'Romper 75', 'Vuelta en par', 'Bajo par', 'Calles firmes', 'Nueve calles', 'Green en regulación', 'Nueve GIR', 'Up & down', 'Sin tres putts', 'Putt sólido', 'Ronda sin dobles', 'Tres birdies', 'Cinco pares', 'Racha de pares', 'Cazador de birdies', 'Fábrica de pares', 'Maestro de calles', 'Guardián del green', 'Mago del up & down', 'Hechicero del putt', 'Rey del front nine', 'Rey del back nine', 'Remontada', 'Cinco rondas', 'Diez rondas', 'Veinticinco rondas', 'Cincuenta rondas', 'Constancia', 'Hándicap bajando', 'Un dígito', 'Camino a scratch', 'Scratch', 'Récord personal', 'Veterano del campo', 'Rey del campo', 'Leyenda del club', 'Inmortal'];
function aviBird(i, locked) {
  const hue = Math.round(i * 360 / AVIARY.length);
  const body = locked ? '#c4cec2' : `hsl(${hue},66%,57%)`;
  const wing = locked ? '#a9b5a8' : `hsl(${hue},66%,43%)`;
  const beak = locked ? '#b9b0a0' : '#f7a13a';
  const eye = locked ? '#8a958a' : '#10210f';
  const crest = (i % 3 === 0) ? `<path d="M33 6 q2 -5 4.5 -1.5" stroke="${wing}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : '';
  return `<svg viewBox="0 0 50 44" width="100%" height="100%" aria-hidden="true">
    <path d="M9 31 Q0 31 -1 39 Q8 37 14 33 Z" fill="${wing}"/>
    <ellipse cx="23" cy="26" rx="14" ry="11.5" fill="${body}"/>
    <ellipse cx="21" cy="30" rx="9" ry="6" fill="#ffffff" opacity="${locked ? 0 : .22}"/>
    <circle cx="35" cy="16" r="8.5" fill="${body}"/>
    ${crest}
    <path d="M19 24 q-7 -7 0 -15 q5 7 9 12 z" fill="${wing}"/>
    <path d="M43 15 l8 -1.5 -7 5 z" fill="${beak}"/>
    <circle cx="37" cy="14.5" r="1.8" fill="${eye}"/>${locked ? '' : `<circle cx="37.5" cy="14" r=".66" fill="#fff"/>`}
  </svg>`;
}
const AVIARY_DESC = ['Registraste tu primera ronda en PARFECT.', 'Anotaste tu primer hoyo.', 'Hiciste tu primer par.', 'Tu primer birdie. ¡El pájaro de la casa!', 'Bajaste de 120 golpes en 18 hoyos.', 'Bajaste de 115.', 'Bajaste de 110.', 'Bajaste de 105.', 'Rompiste la barrera de los 100. Gran paso.', 'Bajaste de 95.', 'Rompiste 90: ya juegas bogey golf.', 'Bajaste de 85.', 'Rompiste 80: nivel de un dígito a la vista.', 'Bajaste de 75. Élite amateur.', 'Una vuelta completa en par.', 'Terminaste una ronda bajo par.', 'Pegaste muchas calles en una ronda.', 'Nueve fairways en una vuelta.', 'Llegaste a green en regulación.', 'Nueve greens en regulación en una ronda.', 'Salvaste el par desde fuera del green.', 'Una ronda sin tres putts.', '30 putts o menos en 18 hoyos.', 'Ni un doble bogey en toda la vuelta.', 'Tres birdies en una sola ronda.', 'Cinco pares en una ronda.', 'Pares seguidos sin soltar.', 'Acumulaste birdies de sobra.', 'Tu tarjeta está llena de pares.', 'Dominas el tee: calles y más calles.', 'Llegas a green con constancia.', 'Salvas el par una y otra vez.', 'El putter es tu varita.', 'Arrancas fuerte los primeros 9.', 'Cierras fuerte los últimos 9.', 'Le diste la vuelta a una mala salida.', 'Jugaste 5 rondas con PARFECT.', '10 rondas registradas.', '25 rondas. Constancia real.', '50 rondas. Eres de casa.', 'Entrenas y juegas sin parar.', 'Tu hándicap va para abajo.', 'Hándicap de un solo dígito.', 'A un paso del scratch.', 'Hándicap 0. Juegas a la par.', 'Tu mejor ronda hasta hoy.', 'Muchas rondas en las piernas.', 'Domas tu campo de casa.', 'Tu nombre suena en el club.', 'Coleccionaste todo el aviario. Leyenda.'];
function vLogros() {
  const rounds = (typeof myRounds === 'function') ? myRounds() : [];
  const agg = rounds.length ? Stats.aggregate(rounds) : null;
  const birdies = agg ? ((agg.scoreDist.birdie || 0) + (agg.scoreDist.eagle || 0)) : 0;
  const unlocked = Math.min(AVIARY.length, (rounds.length ? 1 : 0) + rounds.length + birdies);
  const cards = AVIARY.map((nm, i) => {
    const on = i < unlocked;
    return `<button class="avi ${on ? 'on' : ''}" data-act="avi-pick" data-i="${i}">
      <div class="avi-ic">${aviBird(i, !on)}</div>
      <span class="avi-nm">${esc(nm)}</span>
      ${on ? '' : '<span class="avi-lock">🔒</span>'}
    </button>`;
  }).join('');
  const pick = V.aviPick;
  const sheet = (pick != null && AVIARY[pick] != null) ? (() => {
    const on = pick < unlocked;
    return `<div class="overlay" data-act="avi-close"><div class="sheet avi-sheet" data-act="noop">
      <div class="grab"></div>
      <div class="avi-sheet-ic ${on ? 'on' : 'off'}">${aviBird(pick, !on)}</div>
      <h2 class="avi-sheet-h">${esc(AVIARY[pick])}</h2>
      <p class="avi-sheet-st ${on ? 'on' : 'off'}">${on ? '✓ Desbloqueado' : '🔒 Bloqueado'}</p>
      <p class="note avi-sheet-desc">${esc(AVIARY_DESC[pick] || '')}</p>
      <p class="small muted avi-sheet-how">${on ? 'Lo conseguiste jugando rondas y haciendo birdies.' : 'Sigue jugando rondas y haciendo birdies para desbloquearlo.'}</p>
      <button class="btn primary" data-act="avi-close">Cerrar</button>
    </div></div>`;
  })() : '';
  return `<div class="sec-h"><h2>Aviario</h2><span class="small muted">${unlocked}/${AVIARY.length} pájaros</span></div>
    <p class="note" style="margin:0 2px 10px">Colecciona pájaros: cada ronda y cada <b>birdie</b> desbloquea uno nuevo. <b>Toca un pájaro</b> para ver qué logro es.</p>
    <div class="avi-grid">${cards}</div>${sheet}`;
}

/* Números clave para llegar a tu meta (según tu HCP objetivo) */
/* Emblema de trofeo mítico (color vía currentColor) */
function mythTrophy() {
  return `<svg viewBox="0 0 64 64" class="myt-svg" aria-hidden="true">
    <g fill="currentColor">
      <path d="M18 14c-6 0-9 4-8 10 1 5 5 8 10 8v-4c-3 0-5-2-5.5-4.5-.6-3 .8-5.5 4.5-5.5z"/>
      <path d="M46 14c6 0 9 4 8 10-1 5-5 8-10 8v-4c3 0 5-2 5.5-4.5.6-3-.8-5.5-4.5-5.5z"/>
      <path d="M19 11h26v11c0 9-6 16-13 16s-13-7-13-16z"/>
      <rect x="29" y="37" width="6" height="8" rx="1.5"/>
      <rect x="22" y="44" width="20" height="4.5" rx="2.2"/>
      <rect x="18" y="49" width="28" height="4.2" rx="2"/>
    </g>
    <path class="myt-star" d="M32 16l2.3 4.6 5.1.8-3.7 3.6.9 5.1-4.6-2.5-4.6 2.5.9-5.1-3.7-3.6 5.1-.8z"/>
  </svg>`;
}
function vKeyTargets(u) {
  const agg = Stats.aggregate(myRounds());
  const goal = u.goal != null ? u.goal : Math.max(0, (u.hcp != null ? u.hcp : 12) - 5);
  const b = Stats.benchFor(goal);
  const c = agg ? { fw: Math.round(agg.fwPct), gir: Math.round(agg.girPct), ud: Math.round(agg.scrPct), putts: Math.round(agg.putts18) } : null;
  const lock = `<svg class="myt-lockic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
  // reparto de score (% de la tarjeta) del jugador vs el HCP meta
  const sd = (agg && agg.scoreDist && agg.scoreDist.total) ? agg.scoreDist : null;
  const pd = sd ? {
    birdie: Math.round((sd.eagle + sd.birdie) / sd.total * 100),
    par: Math.round(sd.par / sd.total * 100),
    bogey: Math.round(sd.bogey / sd.total * 100),
    dbl: Math.round(sd.dbl / sd.total * 100),
  } : null;
  const bd = Stats.distFor(goal);
  const techItems = [
    { name: 'Maestro de Calles', sub: 'Fairways', target: Math.round(b.fwPct), now: c ? c.fw : null, sfx: '%', lower: false },
    { name: 'Guardián del Green', sub: 'Greens en regulación', target: Math.round(b.girPct), now: c ? c.gir : null, sfx: '%', lower: false },
    { name: 'Mago del Up & Down', sub: 'Salvar el par', target: Math.round(b.scrPct), now: c ? c.ud : null, sfx: '%', lower: false },
    { name: 'Hechicero del Putt', sub: 'Putts por ronda', target: Math.round(b.putts18), now: c ? c.putts : null, sfx: '', lower: true },
  ];
  const cardItems = [
    { name: 'Cazador de Birdies', sub: '% birdies o mejor', target: Math.round(bd.birdie), now: pd ? pd.birdie : null, sfx: '%', lower: false },
    { name: 'Fábrica de Pares', sub: '% de pares', target: Math.round(bd.par), now: pd ? pd.par : null, sfx: '%', lower: false },
    { name: 'Cazador de Bogeys', sub: '% de bogeys', target: Math.round(bd.bogey), now: pd ? pd.bogey : null, sfx: '%', lower: true },
    { name: 'Cero Dobles', sub: '% dobles o peor', target: Math.round(bd.dbl), now: pd ? pd.dbl : null, sfx: '%', lower: true },
  ];
  const isOn = it => it.now != null && (it.lower ? it.now <= it.target : it.now >= it.target);
  const render = it => {
    const on = isOn(it);
    let prog = 0;
    if (it.now != null) prog = it.lower ? Math.min(1, it.target / Math.max(1, it.now)) : Math.min(1, it.now / Math.max(1, it.target));
    const stat = on
      ? `<i class="myt-chk">✓</i> Desbloqueado`
      : (it.now != null ? `vas ${it.now}${it.sfx} · meta ${it.target}${it.sfx}` : `meta ${it.target}${it.sfx}`);
    return `<div class="myt ${on ? 'on' : 'off'}">
      ${on ? '' : `<span class="myt-lock">${lock}</span>`}
      <div class="myt-emb">${mythTrophy()}</div>
      <b class="myt-name">${it.name}</b>
      <span class="myt-sub">${it.sub} · meta ${it.target}${it.sfx}</span>
      <div class="myt-bar"><i style="width:${Math.round(prog * 100)}%"></i></div>
      <span class="myt-stat">${stat}</span>
    </div>`;
  };
  const all = techItems.concat(cardItems);
  const onN = all.filter(isOn).length;
  return `<div class="sec-h" style="margin-top:6px"><h2 style="font-size:16px">${golfIcon('trophy')} Trofeos míticos · meta HCP ${fmtHcp(goal)}</h2></div>
    <p class="note" style="margin:0 0 12px">Alcanza los números de un HCP ${fmtHcp(goal)} para desbloquear cada trofeo. Llevas <b>${onN}/${all.length}</b>.</p>
    <span class="myt-grp">Técnica</span>
    <div class="myt-grid">${techItems.map(render).join('')}</div>
    <span class="myt-grp">Tu tarjeta · reparto de score</span>
    <div class="myt-grid">${cardItems.map(render).join('')}</div>`;
}

/* Tabla de referencia: qué stats tiene cada nivel de hándicap */
function vHcpReference(u) {
  const levels = [36, 30, 25, 20, 15, 10, 5, 0];
  const hcp = u && u.hcp != null ? u.hcp : 18, goal = u && u.goal != null ? u.goal : Math.max(0, hcp - 5);
  const near = levels.reduce((a, b) => (Math.abs(b - hcp) < Math.abs(a - hcp) ? b : a), levels[0]);
  const nearGoal = levels.reduce((a, b) => (Math.abs(b - goal) < Math.abs(a - goal) ? b : a), levels[0]);
  const rows = levels.map(h => {
    const b = Stats.benchFor(h);
    const tags = [];
    if (h === near) tags.push('tú');
    if (h === nearGoal) tags.push('meta');
    const cls = h === nearGoal ? 'hcp-goal' : (h === near ? 'hcp-me' : '');
    return `<tr class="${cls}">
      <td class="hcp-h">${h}${tags.length ? ` <span class="hcp-tag">${tags.join('·')}</span>` : ''}</td>
      <td>${Math.round(b.fwPct)}%</td>
      <td>${Math.round(b.girPct)}%</td>
      <td>${Math.round(b.scrPct)}%</td>
      <td>${Math.round(b.putts18)}</td>
    </tr>`;
  }).join('');
  return `<div class="card">
    <span class="label">Estadísticas por hándicap (36 → 0)</span>
    <p class="note" style="margin-top:0;margin-bottom:8px">Calles, greens, up&down y putts que tira cada nivel. Tu fila y tu meta van marcadas.</p>
    <div class="sc-scroll"><table class="sc-table ref-table">
      <thead><tr><th class="sc-name">HCP</th><th>Calles</th><th>GIR</th><th>U/D</th><th>Putts</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>`;
}
