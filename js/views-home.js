/* ============ Shell (header + nav), Dashboard, Perfil ============ */

function navKeyOf(view) {
  if (['ronda', 'nueva', 'detalle'].includes(view)) return 'ronda';
  if (view === 'trainer') return 'trainer';
  if (view === 'social') return 'social';
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
    <div class="fade-in">${content}</div>
    <nav class="nav">
      ${item('inicio', 'Inicio')}
      ${item('ronda', 'Ronda')}
      <button class="nav-p" data-act="quick-round" aria-label="Iniciar ronda">P</button>
      ${item('trainer', 'Trainer')}
      ${item('social', 'Social')}
    </nav>
    ${V.profileOpen ? vProfile() : ''}
  </div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
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
      <div class="e-ico">⛳</div>
      <h3>Tu perfil de jugador empieza aquí</h3>
      <p>Registra tu primera ronda — o carga datos de ejemplo para ver PARFECT en acción.</p>
      <button class="btn primary" data-act="quick-round">${logoMark(15)} Registrar mi primera ronda</button>
      <button class="btn ghost" data-act="seed-demo">Cargar datos de ejemplo</button>
    </div>`;
  }

  const radar = Stats.radarOf(agg);
  const cont = S.active && S.active.userId === u.id;
  return head + `
    <div class="card">
      <span class="label">Perfil de habilidades</span>
      <div class="radar-wrap">${radarSVG(radar.labels, radar.values)}</div>
    </div>
    <div class="grid2">
      ${statCard(agg.fwPct.toFixed(0) + '%', 'Fairways', agg.fwPct)}
      ${statCard(agg.girPct.toFixed(0) + '%', 'GIR', agg.girPct)}
      ${statCard(agg.scrPct.toFixed(0) + '%', 'Up/Down', agg.scrPct)}
      ${statCard(agg.putts18.toFixed(0), 'Putts / Ronda', Stats.clamp((38 - agg.putts18) / 11 * 100, 0, 100))}
    </div>
    <div class="card">
      <span class="label">Historial de tarjetas</span>
      ${rounds.slice(0, 5).map(r => {
        const s = Stats.roundStats(r);
        return `<button class="hist-row" data-act="round-detail" data-id="${r.id}">
          <div class="r-main"><b>${esc(r.course)}</b><span>${fmtDate(r.date)} · ${s.holes} hoyos · ${s.putts} putts</span></div>
          <div class="r-side"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
        </button>`;
      }).join('')}
      <div class="avg-strip">
        <div><b>${agg.avgScore18.toFixed(1)}</b><span>Score prom.</span></div>
        <div><b>${agg.putts18.toFixed(1)}</b><span>Putts prom.</span></div>
        <div><b>${agg.fwPct.toFixed(0)}%</b><span>FW prom.</span></div>
        <div><b>${agg.girPct.toFixed(0)}%</b><span>GIR prom.</span></div>
      </div>
      <button class="btn sm ghost" data-act="nav" data-view="ronda" style="margin-top:14px">Ver todas las tarjetas →</button>
    </div>
    <button class="btn ghost" data-act="quick-round">${logoMark(15)} ${cont ? `Continuar ronda · hoyo ${S.active.idx + 1}` : 'Iniciar ronda'}</button>
    <div class="btn-row">
      <button class="btn" data-act="nav" data-view="stats">Avatar Stats →</button>
      <button class="btn" data-act="nav" data-view="trofeos">🏆 Trofeos</button>
    </div>
  `;
}

/* ============ Perfil (sheet) ============ */
function vProfile() {
  const u = cur();
  return `<div class="overlay" data-act="profile-close">
    <div class="sheet" data-act="noop">
      <div class="grab"></div>
      <h2>Tu perfil</h2>
      <div class="field"><label>Nombre</label><input id="p-name" value="${esc(u.name)}"></div>
      <div class="field-row">
        <div class="field"><label>Hándicap</label><input id="p-hcp" type="number" step="1" value="${esc(u.hcp)}"></div>
        <div class="field"><label>Meta</label><input id="p-goal" type="number" step="1" value="${esc(u.goal)}"></div>
      </div>
      <button class="btn primary" data-act="profile-save">Guardar cambios</button>
      <button class="btn" data-act="go-trofeos">🏆 Ver mis trofeos</button>
      <button class="btn ghost" data-act="seed-demo">Cargar datos de ejemplo</button>
      <button class="btn danger" data-act="wipe-mine">${V.wipeArm ? '¿Seguro? Toca otra vez para borrar tus rondas' : 'Borrar mis rondas y prácticas'}</button>
      <button class="btn" data-act="logout">Cerrar sesión</button>
      <p class="note">Cuenta local: ${esc(u.email)} · Tus datos viven solo en este dispositivo.</p>
    </div>
  </div>`;
}
