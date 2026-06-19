/* ============ Shell (header + nav), Dashboard, Perfil ============ */

function navKeyOf(view) {
  if (['ronda', 'nueva', 'detalle'].includes(view)) return 'ronda';
  if (['trainer', 'clubs'].includes(view)) return 'trainer';
  if (['perfil', 'clubs', 'friend', 'feedcard', 'social', 'club', 'club-tourn', 'club-academy'].includes(view)) return 'perfil';
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
      <span class="logo-word">${pLogo()}</span>
      <button class="avatar-btn" data-act="profile-edit" aria-label="Personaliza tu perfil">${avatarImg(u)}</button>
    </div>
    <div class="app-content">${content}</div>
    <nav class="nav">
      ${item('inicio', t('nav_home'))}
      ${item('ronda', t('nav_round'))}
      <button class="nav-p" data-act="quick-round" aria-label="${esc(t('qa_round'))}"><span class="navp-p">P</span></button>
      ${item('trainer', t('nav_trainer'))}
      ${item('perfil', t('nav_profile'))}
    </nav>
    ${V.profileOpen ? vProfile() : ''}
    ${V.cardPicker ? vCardPicker() : ''}
    ${V.drillDetail ? vDrillDetail() : ''}
    ${V.bagEdit ? vBagSheet() : ''}
    ${chatWidget('app')}
  </div>`;
}

/* Sensei pájaro mítico que te acompaña en toda la app */
function vSenseiCompanion() {
  const open = V.senseiOpen !== false;
  return `<div class="sensei-fab ${open ? 'open' : ''}">
    ${open ? `<div class="sensei-fab-bubble"><b>Sensei</b><p>${senseiTip(V.view)}</p></div>` : ''}
    <button class="sensei-fab-btn" data-act="sensei-toggle" aria-label="Sensei">${senseiBird()}</button>
  </div>`;
}

/* clima discreto (demo, por hora del día) en Inicio */
function weatherChip() {
  const h = new Date().getHours();
  const tC = Math.round(21 + 4 * Math.sin(Math.max(0, Math.min(1, (h - 6) / 12)) * Math.PI));
  const cond = h < 12 ? 'Soleado' : h < 17 ? 'Despejado' : 'Soleado';
  const ic = `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4.4" fill="#ffce3a"/><g stroke="#ffce3a" stroke-width="1.6" stroke-linecap="round"><line x1="10" y1="1.5" x2="10" y2="3.4"/><line x1="10" y1="16.6" x2="10" y2="18.5"/><line x1="1.5" y1="10" x2="3.4" y2="10"/><line x1="16.6" y1="10" x2="18.5" y2="10"/><line x1="4" y1="4" x2="5.4" y2="5.4"/><line x1="14.6" y1="14.6" x2="16" y2="16"/><line x1="16" y1="4" x2="14.6" y2="5.4"/><line x1="5.4" y1="14.6" x2="4" y2="16"/></g></svg>`;
  return `<div class="wx" title="Clima estimado"><span class="wx-ic">${ic}</span><div class="wx-tx"><b>${tC}°</b><span>${cond} · Morelia</span></div></div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return t('greet_morning');
  if (h < 20) return t('greet_afternoon');
  return t('greet_evening');
}

/* Mini gráfica de tendencia de score (per-18, mejor=arriba) */
function progressChart(data) {
  const W = 300, H = 110, pad = 22;
  const min = Math.min(...data), max = Math.max(...data), span = Math.max(4, max - min);
  const x = i => data.length > 1 ? pad + i * (W - 2 * pad) / (data.length - 1) : W / 2;
  const y = v => pad + (v - min) / span * (H - 2 * pad);
  const pts = data.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(0)},${p[1].toFixed(0)}`).join(' ');
  const dots = pts.map(p => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="3.5" fill="#7cc24a"/>`).join('');
  const sign = v => (v >= 0 ? '+' : '') + v;
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencia de score">
    <path d="${line}" fill="none" stroke="#7cc24a" stroke-width="2.5" stroke-linejoin="round"/>${dots}
    <text x="${pad}" y="14" fill="#7c8a70" font-family="Inter,system-ui" font-size="10">${sign(data[0])} antes</text>
    <text x="${W - pad}" y="14" fill="#7cc24a" font-family="Inter,system-ui" font-size="11" font-weight="800" text-anchor="end">${sign(data[data.length - 1])} última</text>
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

/* Próximos eventos confirmados (lo que el usuario marcó Apuntarme/Confirmar) */
function upcomingCard(u) {
  const tl = todayLocal();
  const up = (u.events || []).filter(e => e.joined && e.date >= tl).sort((a, b) => a.date.localeCompare(b.date));
  if (!up.length) return '';
  const rows = up.map(e => `<button class="cal-ev ${e.type}" data-act="cal-goto" data-date="${e.date}" style="width:100%;text-align:left;cursor:pointer">
      <div class="r-main"><b>${esc(e.title || EV_LABEL[e.type])}</b><span>${golfIcon(EV_ICON[e.type])} ${calDateLabel(e.date)}${e.area ? ' · ' + esc(e.area) : ''}</span></div><span class="muted">›</span>
    </button>`).join('');
  return `<div class="card" style="margin-top:14px"><span class="label">${golfIcon('card')} Tus eventos confirmados</span>${rows}<p class="note" style="margin:6px 0 0">Ya están en tu <b class="lime">calendario</b>.</p></div>`;
}

/* Convierte una fecha "28 jun" / "24 jun · 9:00" en ISO (próxima ocurrencia) */
function parseUpDate(s) {
  const M = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
  const m = (s || '').toLowerCase().match(/(\d{1,2})\s+([a-záé]+)/);
  if (!m) return null;
  const day = +m[1], mon = M[m[2].slice(0, 3)];
  if (mon == null) return null;
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  let dt = new Date(t0.getFullYear(), mon, day);
  if (dt < t0) dt = new Date(t0.getFullYear() + 1, mon, day);
  return isoLocal(dt);
}
/* Crea el evento de calendario a partir de un próximo torneo/clase */
function upEventToCal(x) {
  const date = parseUpDate(x.date);
  if (!date) return null;
  return { id: 'up-' + (Store.uid ? Store.uid() : Date.now()), date, type: x.type === 'clase' ? 'entreno' : 'ronda', title: x.name, area: (x.course || '').split('·').pop().trim(), joined: x.name };
}

/* ---- escenas animadas tipo GIF 3D por estadística (gradientes, sombras, profundidad) ---- */
function statScene(kind) {
  const bg = `<rect width="170" height="100" rx="12" fill="url(#g3dSky)"/><rect x="0.5" y="0.5" width="169" height="99" rx="12" fill="none" stroke="#1b2a14"/>`;
  // bandera con asta y banderín que ondea
  const flag = (x, y, h) => {
    h = h || 16; const t = y - h;
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${t}" stroke="#eef3e6" stroke-width="1.4"/><circle cx="${x}" cy="${t}" r="1.3" fill="#eef3e6"/>`
      + `<path fill="#7cc24a"><animate attributeName="d" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" values="M${x} ${t} L${x + 11} ${t + 1.4} L${x} ${t + 5} Z;M${x} ${t} L${x + 11} ${t + 3.8} L${x} ${t + 5} Z;M${x} ${t} L${x + 11} ${t + 1.4} L${x} ${t + 5} Z"/></path>`;
  };
  // green elevado en 3D (plataforma con lado oscuro + brillo cenital)
  const green3d = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${(cy + ry * 0.5).toFixed(1)}" rx="${rx}" ry="${ry}" fill="#16461f"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#g3dGreenTop)"/><ellipse cx="${(cx - rx * 0.3).toFixed(1)}" cy="${(cy - ry * 0.32).toFixed(1)}" rx="${(rx * 0.52).toFixed(1)}" ry="${(ry * 0.42).toFixed(1)}" fill="#aef0a4" opacity="0.28"/>`;
  // pelota 3D (esfera con gradiente)
  const ball = `fill="url(#g3dBall)" stroke="#5a6668" stroke-width="0.3"`;
  // insignia de palomita ✓ (logrado) que aparece
  const okBadge = (cx, cy, dur) => `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.55;.63;.92;1" dur="${dur}" repeatCount="indefinite"/><circle cx="${cx}" cy="${cy}" r="11" fill="url(#g3dLime)"/><path d="M${cx - 4.6} ${cy + 0.4} l3.3 3.4 6.6 -7.6" stroke="#0a1206" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  if (kind === 'fw') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <rect x="0" y="36" width="170" height="64" fill="#13301a"/>
    <path d="M62 100 L108 100 L95 36 L75 36 Z" fill="url(#g3dFair)"/>
    <path d="M75 36 L95 36 L94 32 L76 32 Z" fill="#4ca055"/>
    <path d="M71 66 L99 66 L98 60 L72 60 Z" fill="#2a6531" opacity="0.4"/><path d="M67 86 L103 86 L102 80 L68 80 Z" fill="#2a6531" opacity="0.32"/>
    <ellipse cx="85" cy="66" rx="2" ry="0.9" fill="#7cc24a" opacity="0"><animate attributeName="rx" values="2;2;10;13" keyTimes="0;.5;.62;.7" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.5;.56;.7" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="4.4" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -8 85 66" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    ${okBadge(85, 22, '3s')}
  </svg>`;
  if (kind === 'gir') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 58, 43, 20)}
    <circle cx="85" cy="52" r="2.2" fill="#06120a"/>${flag(85, 52, 16)}
    <ellipse cx="83" cy="60" rx="2" ry="0.9" fill="#7cc24a" opacity="0"><animate attributeName="rx" values="2;2;10;13" keyTimes="0;.5;.62;.7" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.5;.56;.7" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="4.4" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -10 83 60" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    ${okBadge(85, 22, '3s')}
  </svg>`;
  if (kind === 'ud') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="28" cy="82" rx="24" ry="10" fill="#13301a"/><ellipse cx="24" cy="79" rx="13" ry="4" fill="#1d4528" opacity="0.7"/>
    ${green3d(114, 58, 27, 13)}
    <circle cx="114" cy="53" r="2" fill="#06120a"/>${flag(114, 53, 15)}
    <path d="M30 76 Q 72 -6 106 58" fill="none" stroke="#7cc24a" stroke-width="1.6" stroke-dasharray="2 5" opacity="0.5"/>
    <circle r="4.2" ${ball}><animateMotion dur="3.2s" repeatCount="indefinite" path="M30 76 Q 72 -6 106 58 L114 53" keyPoints="0;0.85;0.85;1;1" keyTimes="0;.5;.64;.85;1" calcMode="linear"/></circle>
    ${okBadge(114, 24, '3.2s')}
  </svg>`;
  if (kind === 'putt') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 58, 50, 28)}
    <path d="M85 80 L85 40" stroke="#06120a" stroke-width="1" stroke-dasharray="2 4" opacity="0.3"/>
    <ellipse cx="85" cy="41" rx="6" ry="2.8" fill="#04100a"/><ellipse cx="85" cy="40" rx="5" ry="2.3" fill="#0c1c11"/>${flag(85, 39, 16)}
    <ellipse cx="85" cy="41" rx="6" ry="2.8" fill="none" stroke="#7cc24a" stroke-width="1.2" opacity="0"><animate attributeName="rx" values="6;6;15" keyTimes="0;.74;.88" dur="2.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.74;.8;.88" dur="2.8s" repeatCount="indefinite"/></ellipse>
    <g><animateTransform attributeName="transform" type="translate" values="0 7;0 7;0 -2;0 1;0 1" keyTimes="0;.06;.16;.24;1" dur="2.8s" repeatCount="indefinite"/>
      <rect x="84.1" y="60" width="1.9" height="22" rx="0.9" fill="#cdd5d7"/><rect x="75" y="82" width="20" height="4.4" rx="2.2" fill="#9aa6a8"/><rect x="75" y="82" width="20" height="1.6" rx="0.8" fill="#e9eef0" opacity="0.6"/></g>
    <circle ${ball}><animateMotion dur="2.8s" repeatCount="indefinite" path="M85 78 L85 41" keyPoints="0;0;1;1" keyTimes="0;.2;.76;1" calcMode="linear"/><animate attributeName="r" values="4.2;4.2;4.2;0;0" keyTimes="0;.2;.74;.8;1" dur="2.8s" repeatCount="indefinite"/></circle>
  </svg>`;
  if (kind === 'par') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 52, 36, 17)}
    <circle cx="85" cy="46" r="2" fill="#06120a"/>${flag(85, 46, 15)}
    <ellipse cx="80" cy="53" rx="2" ry="0.9" fill="#7cc24a" opacity="0"><animate attributeName="rx" values="2;2;9;12" keyTimes="0;.44;.56;.66" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.44;.5;.66" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="4.2" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -12 80 53" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.52;.6;.92;1" dur="3s" repeatCount="indefinite"/>
      <rect x="68" y="17" width="34" height="17" rx="8.5" fill="url(#g3dLime)"/><text x="85" y="29" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="900" letter-spacing="0.5" text-anchor="middle">PAR</text></g>
  </svg>`;
  if (kind === 'bird') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="36" cy="22" rx="15" ry="4" fill="#ffffff" opacity="0.055"/><ellipse cx="128" cy="30" rx="17" ry="4.5" fill="#ffffff" opacity="0.045"/>
    ${green3d(85, 66, 33, 15)}
    <circle cx="85" cy="61" r="1.8" fill="#06120a"/>${flag(85, 61, 14)}
    <g><animateMotion dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" path="M-26 32 Q 50 10 92 26 Q 134 42 198 14"/>
      <g transform="scale(1.25)">
        <ellipse cx="0" cy="0" rx="4.4" ry="2.1" fill="#11220c"/><circle cx="3.8" cy="-1.1" r="1.8" fill="#11220c"/><path d="M5.4 -1.6 l3.4 -0.5 -3.4 1.7 z" fill="#ffcf5a"/>
        <path fill="#7cc24a"><animate attributeName="d" dur="0.42s" repeatCount="indefinite" values="M-5 -0.6 Q -1 -8 2.4 -0.6 Q 5.8 -8 9.4 -0.6 Q 5.8 -3 2.4 -2 Q -1 -3 -5 -0.6 Z;M-5 -0.6 Q -1 5 2.4 -0.6 Q 5.8 5 9.4 -0.6 Q 5.8 1 2.4 0.6 Q -1 1 -5 -0.6 Z;M-5 -0.6 Q -1 -8 2.4 -0.6 Q 5.8 -8 9.4 -0.6 Q 5.8 -3 2.4 -2 Q -1 -3 -5 -0.6 Z"/></path>
      </g>
    </g>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.5;.58;.9;1" dur="5s" repeatCount="indefinite"/>
      <circle cx="85" cy="30" r="12" fill="url(#g3dLime)"/><text x="85" y="34.4" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="900" text-anchor="middle">−1</text>
      <path d="M67 24 l1.8 0 M67.9 22.2 l0 1.8" stroke="#7cc24a" stroke-width="1.5" stroke-linecap="round"/><path d="M101 35 l1.8 0 M101.9 33.2 l0 1.8" stroke="#7cc24a" stroke-width="1.5" stroke-linecap="round"/></g>
  </svg>`;
  if (kind === 'bogey') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(95, 50, 30, 14)}
    <ellipse cx="40" cy="68" rx="18" ry="7" fill="#16331a"/><ellipse cx="40" cy="66" rx="16" ry="6" fill="#274d22"/><path d="M28 66 q5 -4 12 -2 q7 2 12 -2" fill="none" stroke="#19341a" stroke-width="0.9" opacity="0.7"/>
    <circle cx="95" cy="45" r="2" fill="#06120a"/>${flag(95, 45, 15)}
    <circle r="4.2" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M150 92 Q 110 -10 40 66" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.52;.6;.92;1" dur="3s" repeatCount="indefinite"/>
      <circle cx="95" cy="22" r="11" fill="#ff9f43"/><text x="95" y="26" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">+1</text></g>
  </svg>`;
  if (kind === 'double') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(112, 52, 26, 12)}
    <circle cx="112" cy="47" r="1.8" fill="#06120a"/>${flag(112, 47, 14)}
    <ellipse cx="44" cy="70" rx="26" ry="11" fill="#0b2a38"/><ellipse cx="44" cy="68" rx="24" ry="10" fill="url(#g3dWater)"/><ellipse cx="40" cy="64" rx="13" ry="4" fill="#cdeefb" opacity="0.3"/>
    <path d="M24 70 q6 -2 12 0 t12 0" fill="none" stroke="#cdeefb" stroke-width="0.8" opacity="0.45"><animate attributeName="opacity" values="0.45;0.18;0.45" dur="2.2s" repeatCount="indefinite"/></path>
    <g opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.58;.74;1" dur="3.2s" repeatCount="indefinite"/><circle cx="44" cy="62" r="1.7" fill="#e4f5fc"/><circle cx="50" cy="60" r="1.3" fill="#e4f5fc"/><circle cx="38" cy="60" r="1.3" fill="#e4f5fc"/></g>
    <circle r="4.2" ${ball}><animateMotion dur="3.2s" repeatCount="indefinite" path="M150 90 Q 108 -10 44 64" keyPoints="0;1;1;1" keyTimes="0;.56;.9;1" calcMode="linear"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.55;.6;1" dur="3.2s" repeatCount="indefinite"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.6;.68;.92;1" dur="3.2s" repeatCount="indefinite"/>
      <circle cx="112" cy="24" r="11" fill="#ff7a6b"/><text x="112" y="28" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">+2</text></g>
  </svg>`;
  if (kind === 'threeputt') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 56, 50, 30)}
    <path d="M85 86 L85 32" stroke="#06120a" stroke-width="1" stroke-dasharray="2 4" opacity="0.35"/>
    <ellipse cx="85" cy="33" rx="5.5" ry="2.6" fill="#04100a"/><ellipse cx="85" cy="32" rx="4.6" ry="2.1" fill="#0c1c11"/>${flag(85, 31, 16)}
    <circle cx="85" cy="56" r="1.6" fill="#ff9f43" opacity="0.7"/><circle cx="85" cy="43" r="1.6" fill="#ff9f43" opacity="0.7"/>
    <circle r="4" ${ball}><animateMotion dur="3.6s" repeatCount="indefinite" calcMode="linear" path="M85 86 L85 56 L85 43 L85 32" keyPoints="0;0.55;0.55;0.79;0.79;1;1" keyTimes="0;.26;.4;.55;.68;.84;1"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.84;.88;.96;1" dur="3.6s" repeatCount="indefinite"/>
      <circle cx="116" cy="26" r="10" fill="#ff9f43"/><text x="116" y="29.6" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="900" text-anchor="middle">×3</text></g>
  </svg>`;
  return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 56, 48, 29)}
    <circle cx="85" cy="32" r="5" fill="#06120a"/>${flag(85, 32, 16)}
    <circle cx="85" cy="40" r="12" fill="none" stroke="#7cc24a" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.55"/>
    <circle r="4" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M85 86 L85 41" keyPoints="0;1;1" keyTimes="0;.62;1" calcMode="linear"/></circle>
    <text x="85" y="94" fill="#7cc24a" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="800" text-anchor="middle" opacity="0">dada<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.62;.68;.96;1" dur="3s" repeatCount="indefinite"/></text>
  </svg>`;
}
/* reel horizontal de stats animadas (scroll automático infinito) */
function statReel(cards) {
  const set = cards.map(([k, v, t, cls, sub]) => `<div class="reel-card${cls ? ' ' + cls : ''}"><div class="reel-scene">${statScene(k)}</div><div class="reel-meta"><b>${v}</b><span>${esc(t)}</span>${sub ? `<span class="reel-sub">${esc(sub)}</span>` : ''}</div></div>`).join('');
  return `<div class="reel"><div class="reel-track">${set}${set}</div></div>`;
}
/* tus estadísticas: gifs 3D — orden: fairway, gir, up&down, putts/9, 3putts, birdie%, par%, bogey%, doble% */
function vStatReel(rounds, agg) {
  const rs = rounds.map(Stats.roundStats);
  const sum = f => rs.reduce((a, r) => a + f(r), 0);
  const sd = agg.scoreDist || { total: 0, eagle: 0, birdie: 0, par: 0, bogey: 0, dbl: 0 };
  const tot = sd.total || 1;
  const fw = sum(r => r.fw), fwTot = sum(r => r.fwTot);
  const gir = sum(r => r.gir), girTot = sum(r => r.girTot) || 1;
  const scr = sum(r => r.scr), scrTot = sum(r => r.scrTot);
  const threeP = sum(r => r.threeP);
  const pct = (a, b) => Math.round(a / (b || 1) * 100);
  const per = (a, b, n) => `${Math.round(a / (b || 1) * n)} ${t('of')} ${n}`;
  const gir18 = Math.round(gir / girTot * 18), miss18 = Math.max(1, 18 - gir18);
  const putts9 = Math.round(agg.putts18 / 2);
  const threePer9 = (threeP / girTot * 9).toFixed(1);
  return statReel([
    ['fw', pct(fw, fwTot) + '%', t('st_fw'), '', per(fw, fwTot, 14)],
    ['gir', pct(gir, girTot) + '%', t('st_gir'), '', `${gir18} ${t('of')} 18`],
    ['ud', pct(scr, scrTot) + '%', t('st_ud'), '', `${Math.round(pct(scr, scrTot) / 100 * miss18)} ${t('of')} ${miss18}`],
    ['putt', String(putts9), t('st_putts9'), '', t('average')],
    ['threeputt', threePer9, t('st_3putts'), 'warn', t('average')],
    ['bird', pct(sd.eagle + sd.birdie, tot) + '%', t('st_birdie'), '', per(sd.eagle + sd.birdie, tot, 18)],
    ['par', pct(sd.par, tot) + '%', t('st_par'), '', per(sd.par, tot, 18)],
    ['bogey', pct(sd.bogey, tot) + '%', t('st_bogey'), 'warn', per(sd.bogey, tot, 18)],
    ['double', pct(sd.dbl, tot) + '%', t('st_double'), 'warn', per(sd.dbl, tot, 18)],
  ]);
}
/* accesos rápidos en scroll infinito */
function vQuickActions() {
  const acts = [
    ['quick-round', 'flag', t('qa_round')],
    ['go-entreno', 'bucket', t('qa_drills')],
    ['go-diag', 'card', t('qa_stats')],
    ['go-trofeos', 'trophy', t('qa_trophies')],
    ['go-clubs', 'club', t('qa_bag')],
    ['profile-open', 'green', t('qa_profile')],
  ];
  const b = ([act, ic, label]) => `<button class="qa" data-act="${act}">${golfIcon(ic)}<span>${esc(label)}</span></button>`;
  const set = acts.map(b).join('');
  return `<div class="reel qa-reel"><div class="reel-track">${set}${set}</div></div>`;
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

/* tarjeta simple de hoyo: solo la imagen del trazo con el texto encima */
function lrHoleCard(hh, i, ch) {
  const yds = ch && ch.yds ? ` · ${ch.yds}y` : '';
  const tp = fmtToPar(hh.score - hh.par);
  return `<div class="reel-card lr-simple"><div class="reel-scene lr-scene">${captureSchematic(hh, ch, true, true)}
    <div class="lr-cap"><span class="lr-cap-l"><b>Hoyo ${i + 1}</b>Par ${hh.par}${yds}</span><span class="lr-cap-s">${hh.score}<em>${tp}</em></span></div>
  </div></div>`;
}

/* mis números: KPIs de juego + mi bolsa (carry y efectividad por bastón) */
function vMisNumeros(u, agg) {
  const clubs = u.clubs || {};
  const carry = id => (clubC(clubs, id) != null ? clubC(clubs, id) : CLUB_DEFAULT[id]);
  const eff = id => { const e = clubE(clubs, id); return e != null ? e : CLUB_EFF_DEFAULT; };
  const hasBag = clubs && Object.keys(clubs).length;
  const ids = (hasBag ? CLUBS.filter(c => clubs[c.id] != null).map(c => c.id) : DEFAULT_BAG).filter(id => CLUB_DEFAULT[id] != null);
  const items = ids.map(id => ({ id, name: (CLUBS.find(c => c.id === id) || {}).name || id, y: carry(id), e: eff(id) }));
  const byCarry = items.slice().sort((a, b) => b.y - a.y);
  const driverY = carry('dr');
  // el palo con el que eres más certero (más efectivo); a igualdad, el más corto (más fiable)
  const best = items.slice().sort((a, b) => b.e - a.e || a.y - b.y)[0] || { name: 'Driver', e: CLUB_EFF_DEFAULT };
  const tiles = byCarry.map(c => `<div class="bag-tile${c.id === 'dr' ? ' dr' : ''}"><b>${c.y}<i>y</i></b><span>${esc(c.name)}</span><u>${c.e}%</u></div>`).join('');
  const kpis = [
    [fmtToPar(agg.bestToPar), t('best_round')],
    [fmtToPar(Math.round(agg.avgToPar)), t('average_k')],
    [agg.putts18.toFixed(0), t('putts_round')],
  ];
  return `<div class="kpi-band" style="margin-top:22px">${kpis.map(([v, lab]) => `<div class="kpi"><b>${v}</b><span>${lab}</span></div>`).join('')}</div>
    <div class="bag-feat">
      <div class="card bag-card"><span class="label">${golfIcon('club')} ${t('driver_carry')}</span><b class="bag-big">${driverY}<em> yds</em></b></div>
      <div class="card bag-card"><span class="label">${golfIcon('flag')} ${t('most_accurate')}</span><b class="bag-name">${esc(best.name)}</b><span class="bag-sub">${best.e}% ${t('accuracy')}</span></div>
    </div>
    <div class="sec-h" style="margin-top:16px"><h2 style="font-size:18px">${t('sec_bag')}</h2><button class="sec-edit" data-act="bag-edit">${t('edit')} →</button></div>
    <div class="reel bag-reel"><div class="reel-track">${tiles}${tiles}</div></div>`;
}

/* drills / entrenamiento en reel (después de Mi bolsa) */
function vDrillsHome() {
  const drills = [
    ['Gate drill', 'putting', 'tag_putt', 'dr_gate', 'drd_gate', 10],
    ['Escalera de distancias', 'approach', 'tag_approach', 'dr_ladder', 'drd_ladder', 7],
    ['Up & down', 'short', 'tag_short', 'dr_ud', 'drd_ud', 7],
    ['14 fairways a presión', 'driving', 'tag_drive', 'dr_14', 'drd_14', 7],
    ['Splash de bunker', 'short', 'tag_bunker', 'dr_splash', 'drd_splash', 7],
    ['Lag putting', 'putting', 'tag_lagputt', 'dr_lag', 'drd_lag', 10],
  ];
  const card = ([scene, area, tagK, nameK, descK, target]) => `<button class="reel-card dh-card" data-act="drill-open" data-name="${esc(t(nameK))}" data-target="${target}" data-area="${esc(t(tagK))}" data-goal="${esc(t(descK))}" data-timer="20">
    <div class="reel-scene">${drillScene(scene, area)}</div>
    <div class="dh-meta"><span class="dh-tag">${esc(t(tagK))}</span><b>${esc(t(nameK))}</b><span class="dh-desc">${esc(t(descK))}</span><span class="dh-go">${t('practice_cta')}</span></div>
  </button>`;
  const set = drills.map(card).join('');
  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:25px">${t('sec_practice')}</h2><span class="small muted">${t('sub_practice')}</span></div>
    <div class="reel dh-reel"><div class="reel-track">${set}${set}</div></div>`;
}

/* historial: solo el último campo jugado, marca su score y muestra sus hoyos */
function vLastRound(rounds) {
  const r = rounds.find(x => x.courseId && COURSES[x.courseId]) || rounds[0];
  if (!r) return '';
  const cid = (r.courseId && COURSES[r.courseId]) ? r.courseId : null;
  const courseName = cid ? COURSES[cid].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
  const s = Stats.roundStats(r);
  const set = r.holes.map((hh, i) => hh ? lrHoleCard(hh, i, (cid && COURSES[cid].holes[i]) ? COURSES[cid].holes[i] : null) : '').join('');
  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:25px">Historial</h2><span class="small muted">tu última ronda →</span></div>
    <div class="card lr-last">
      <div class="lr-last-id"><b>${esc(courseName)}</b><span class="small muted">${fmtDate(r.date)} · desliza los hoyos →</span></div>
      <span class="lr-last-score">${s.score}<em>${fmtToPar(s.toPar)}</em></span>
    </div>
    <div class="reel reel-swipe"><div class="reel-track">${set}</div></div>`;
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

/* héroe: escena divertida (cielo, nubes, pájaro, bola, árboles) + hándicap + golfista 3D */
function vHcpHero(u) {
  const gap = Math.max(0, Math.round(u.hcp - u.goal));
  const sub = gap > 0 ? `${t('goal')} ${fmtHcp(u.goal)} · ${t('to_go')} ${gap}` : t('goal_reached');
  return `<div class="pl-hero">
    <div class="pl-hero-txt">
      <span class="pl-hero-lab">${t('hcp_label')}</span>
      <div class="pl-hero-num">${fmtHcp(u.hcp)}</div>
      <span class="pl-hero-sub">${sub}</span>
    </div>
    ${avatarImg(u, 'pl-hero-av')}
  </div>`;
}

/* tres números clave: rondas · putts · GIR */
function vKeyStats(agg) {
  const tiles = [
    [String(agg.rounds), t('rounds')],
    [agg.putts18.toFixed(0), t('putts_round')],
    [Math.round(agg.girPct) + '%', 'GIR'],
  ];
  return `<div class="pl-chips">${tiles.map(([v, l]) => `<div class="pl-chip"><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;
}

/* rondas recientes (tarjetas redondeadas tocables) */
function vRecentRounds(rounds) {
  const list = rounds.slice(0, 6);
  const hcp = cur().hcp;
  const rows = list.map(r => {
    const s = Stats.roundStats(r);
    const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
    const vibe = roundVibe(s, hcp);
    return `<button class="pl-rr ${vibe ? 'vibe-' + vibe.k : ''}" data-act="round-detail" data-id="${r.id}">
      ${vibe ? `<span class="rr-vibe">${vibe.ic}</span>` : ''}
      <div class="pl-rr-id"><b>${esc(course)}</b><span>${fmtDate(r.date)} · ${r.holes.length} ${t('holes')}</span></div>
      <span class="pl-rr-score">${s.score}<em>${fmtToPar(s.toPar)}</em></span>
    </button>`;
  }).join('');
  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:20px">${t('recent')}</h2></div><div class="pl-rr-list">${rows}</div>`;
}

function vDashboard() {
  const u = cur();
  const rounds = myRounds();
  const agg = Stats.aggregate(rounds);
  const head = `<div class="greet greet-row">
    <h1 class="greet-h">${greeting()}, ${esc(u.name.split(' ')[0])}</h1>
    ${weatherChip()}
  </div>`;

  if (!agg) {
    return `<div class="dash">${head}<div class="card empty">
      <div class="e-ico">${golfIcon('flag')}</div>
      <h3>${t('empty_h')}</h3>
      <p>${t('empty_p')}</p>
      <button class="btn primary" data-act="quick-round">${logoMark(15)} ${t('empty_cta')}</button>
      <button class="btn ghost" data-act="seed-demo">${t('empty_demo')}</button>
    </div></div>`;
  }

  return `<div class="dash">${head}
    ${vPlayerCard(u, agg)}
    ${rounds.length ? vRecentStrip(rounds) : ''}</div>`;
}

/* acceso a la Academia desde Inicio (hasta abajo) */
function vHomeLearn() {
  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:16px">Aprende y entrena</h2></div>
    <button class="ac-launch" data-act="academia-start">
      <div class="ac-launch-bird">${senseiBird('')}</div>
      <div class="ac-launch-tx">
        <b>Academia de golf</b>
        <span>Recorre el campo hoyo por hoyo con tu guía. De 0 a élite.</span>
      </div>
      <span class="ac-launch-go">Jugar →</span>
    </button>`;
}

/* Tira horizontal con tus últimas rondas (scroll) */
function vRecentStrip(rounds) {
  const u = cur();
  const list = rounds.slice(0, 10);
  const cards = list.map(r => {
    const s = Stats.roundStats(r);
    const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
    const vibe = roundVibe(s, u.hcp);
    const cls = s.toPar <= 0 ? 'good' : s.toPar <= Math.round(s.holes * 0.33) ? 'par' : 'over';
    return `<button class="rs-card rs-${cls}" data-act="round-detail" data-id="${r.id}">
      ${vibe ? `<span class="rs-vibe">${vibe.ic}</span>` : ''}
      <span class="rs-date">${fmtDate(r.date)}</span>
      <span class="rs-score">${s.score}</span>
      <span class="rs-par">${fmtToPar(s.toPar)}</span>
      <span class="rs-course">${esc(course)} · ${r.holes.length}h</span>
    </button>`;
  }).join('');
  return `<div class="sec-h lr-h"><h2>Últimas rondas</h2>${rounds.length > 10 ? `<button class="sec-link" data-act="nav" data-view="ronda">Ver todas →</button>` : ''}</div>
    <div class="rs-strip">${cards}</div>`;
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
  const hasSet = Object.keys(clubs).some(k => clubs[k] != null);
  const ids = hasSet ? CLUBS.filter(c => clubs[c.id] != null).map(c => c.id) : DEFAULT_BAG.slice();
  const inBag = id => ids.includes(id);
  const groups = [['largo', 'Maderas e híbridos', 'club'], ['hierros', 'Hierros', 'tee'], ['wedges', 'Wedges', 'green']];
  const sections = groups.map(([g, label, ic]) => {
    const tiles = CLUBS.filter(c => c.group === g).map(c => {
      const on = inBag(c.id);
      const carry = clubC(clubs, c.id);
      const cv = carry != null ? carry : CLUB_DEFAULT[c.id];
      return on
        ? `<div class="bgc-tile on">
            <button class="bgc-x" data-act="bag-toggle" data-id="${c.id}" aria-label="Quitar">×</button>
            <span class="bgc-nm">${esc(c.name)}</span>
            <span class="bgc-carry"><input id="club-c-${c.id}" class="bgc-in" type="number" inputmode="numeric" value="${cv}"><i>yds</i></span>
          </div>`
        : `<button class="bgc-tile off" data-act="bag-toggle" data-id="${c.id}"><span class="bgc-plus">+</span><span class="bgc-nm">${esc(c.name)}</span></button>`;
    }).join('');
    return `<p class="bgc-grp">${golfIcon(ic)} ${label}</p><div class="bgc-grid">${tiles}</div>`;
  }).join('');
  return `<div class="card">
    <div class="bag-visual">
      ${golfBagSVG(ids)}
      <div class="bag-count"><b>${ids.length}</b><span>de 14 palos</span></div>
    </div>
    <p class="note" style="margin:0 0 10px">Toca un palo para meterlo o sacarlo de tu bolsa. Ajusta las yardas de los que tengas.</p>
    ${sections}
    <button class="btn primary" data-act="save-clubs" style="margin-top:14px">Guardar distancias</button>
  </div>`;
}

/* hoja para editar la bolsa desde Inicio */
function vBagSheet() {
  return `<div class="overlay" data-act="bag-close">
    <div class="sheet" data-act="noop">
      <div class="grab"></div>
      <h2>${t('sec_bag')}</h2>
      ${vBagEditor(cur())}
      <button class="btn" data-act="bag-close">${t('close')}</button>
    </div>
  </div>`;
}

/* cabecera del perfil: golfista 3D grande + nombre + hándicap (estilo playful) */
function vPerfilHero(u) {
  const home = (u.homeCourse && COURSES[u.homeCourse]) ? COURSES[u.homeCourse] : COURSES.campestre;
  const homeName = home.name.split(' · ')[0];
  const nRounds = myRounds().length;
  return `<div class="pl-phero">
    <button class="pl-phero-edit" data-act="profile-edit" aria-label="Editar perfil">${t('edit')}</button>
    <img class="pl-phero-av" src="${avatarSrc(u)}" alt="" loading="lazy">
    <h1 class="pl-phero-name">${esc(u.name)}</h1>
    <p class="pl-phero-sub">${t('handicap')} ${fmtHcp(u.hcp)} · ${esc(homeName)}</p>
    <div class="pl-phero-stats">
      <div><b>${fmtHcp(u.hcp)}</b><span>${t('handicap')}</span></div>
      <div><b>${fmtHcp(u.goal)}</b><span>${t('goal')}</span></div>
      <div><b>${nRounds}</b><span>${t('rounds')}</span></div>
    </div>
  </div>`;
}

/* estadísticas animadas del perfil: gifs + pájaro/águila reales */
function statGifCard(kind, val, label, cls) {
  return `<div class="reel-card${cls ? ' ' + cls : ''}"><div class="reel-scene">${statScene(kind)}</div><div class="reel-meta"><b>${val}</b><span>${esc(label)}</span></div></div>`;
}
function creatureCard(src, val, label, which) {
  return `<div class="reel-card"><div class="reel-scene fly-scene fly-${which}"><img class="fly" src="${src}" alt="" loading="lazy"></div><div class="reel-meta"><b>${val}</b><span>${esc(label)}</span></div></div>`;
}
function vPerfilStats(agg, rounds) {
  const sd = agg.scoreDist || { total: 0, eagle: 0, birdie: 0, par: 0, bogey: 0, dbl: 0 };
  const tot = sd.total || 1;
  const rs = rounds.map(Stats.roundStats);
  const sum = f => rs.reduce((a, r) => a + f(r), 0);
  const fw = sum(r => r.fw), fwTot = sum(r => r.fwTot);
  const gir = sum(r => r.gir), girTot = sum(r => r.girTot) || 1;
  const scr = sum(r => r.scr), scrTot = sum(r => r.scrTot);
  const p = (a, b) => Math.round(a / (b || 1) * 100);
  const cards = [
    creatureCard('assets/eagle.png', String(sd.eagle), 'Águilas', 'eagle'),
    creatureCard('assets/bird.png', String(sd.birdie), 'Birdies', 'bird'),
    statGifCard('par', p(sd.par, tot) + '%', 'Pares'),
    statGifCard('bogey', p(sd.bogey + sd.dbl, tot) + '%', 'Bogeys o peor', 'warn'),
    statGifCard('fw', p(fw, fwTot) + '%', 'Fairways'),
    statGifCard('gir', p(gir, girTot) + '%', 'Greens · GIR'),
    statGifCard('ud', p(scr, scrTot) + '%', 'Up & down'),
    statGifCard('putt', Math.round(agg.putts18 / 2) + '', 'Putts · 9 hoyos'),
  ].join('');
  return `<div class="reel"><div class="reel-track">${cards}${cards}</div></div>`;
}

/* escalafón de rango por hándicap (0–36): tu aura crece al subir */
/* creador de golfista: persona + outfit + fondo de perfil (algunos por rango) */
function vAvatarCreator(u) {
  const idx = rankIdx(u.hcp);
  const curOutfit = (u && u.outfit) || 'rank';
  const curBg = (u && u.bg) || 'rank';
  let avSex = u.avatarSex, avSkin = u.avatarSkin;
  if (avSex == null || avSex === 'n') { const a = (u && u.avatar) || 0; avSex = (a >= 6 && a < 12) ? 'w' : 'm'; avSkin = a % 6; }
  const avBase = avSex === 'w' ? 6 : 12;
  const sexRow = [['m', 'Hombre'], ['w', 'Mujer']].map(([k, l]) => `<button class="cre-sex ${avSex === k ? 'on' : ''}" data-act="set-sex" data-s="${k}">${l}</button>`).join('');
  const outfits = OUTFITS.map(o => {
    const sw = o.sw === 'rank' ? `background:conic-gradient(${RANKS.map(r => r.c).join(',')})` : `background:${o.sw}`;
    return `<button class="cre-sw${curOutfit === o.k ? ' on' : ''}" data-act="set-outfit" data-k="${o.k}" title="${o.n}"><span style="${sw}"></span></button>`;
  }).join('');
  const curHue = (u && u.avatarHue) || 0;
  const hueRow = GOLF_HUES.map(g => `<button class="cre-gcolor${curHue === g.h ? ' on' : ''}" data-act="set-avhue" data-h="${g.h}" title="Color de outfit"><span style="display:block;width:100%;height:100%;border-radius:50%;background:${g.c}"></span></button>`).join('');
  const curEmoji = (u && u.avatarEmoji) || '';
  const AV_EMOJIS = [
    // Golf (todo lo que hay)
    '🏌️', '🏌️‍♂️', '🏌️‍♀️', '⛳', '🏆', '🥇', '🏅',
    // Personas (mix balanceado)
    '👦', '👧', '👨', '👩', '👴', '👵', '🧔', '👱‍♀️', '🧕',
    // Personajes
    '🥷', '🧑‍🚀', '🦸', '🦹', '🧙', '🕵️', '🧑‍🍳', '🤠', '🤖', '👽',
    // Animales
    '🦈', '🐯', '🦁', '🦅', '🐺', '🦊', '🐼', '🐉', '🦄', '🐧', '🦂', '🐢',
    // Vibes
    '🔥', '⭐', '⚡', '💎', '👑', '🎯', '🚀', '🌟'
  ];
  const emojiRow = `<button class="cre-emoji cre-emoji-def ${!curEmoji ? 'on' : ''}" data-act="set-avemoji" data-e="" title="Golfista"><img src="${avatarSrc(u)}" alt=""></button>`
    + AV_EMOJIS.map(e => `<button class="cre-emoji ${curEmoji === e ? 'on' : ''}" data-act="set-avemoji" data-e="${e}">${e}</button>`).join('');
  const steps = RANKS.map((r, i) => `<div class="rank-step${i === idx ? ' on' : ''}${i < idx ? ' done' : ''}">
      <span class="rank-dot" style="background:${r.c}"></span>
      <div class="rank-meta"><b>${r.n}</b><span>HCP ${rankRange(i)}</span></div>
      ${i === idx ? '<span class="rank-now">aquí</span>' : ''}
    </div>`).join('');
  const curSkin = (u.cardSkin || 'calle');
  const skins = CARD_SKINS.map(s => `<button class="cre-skin${s.k === curSkin ? ' on' : ''}" data-act="set-skin" data-k="${s.k}" title="${s.n}"><span style="background:${s.g}">${s.k === curSkin ? '✓' : ''}</span></button>`).join('');
  return `<div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">Crea tu golfista</h2><span class="small muted">hazlo tuyo</span></div>
    <div class="card cre-card">
      <div class="cre-preview cre-preview-plain">${avatarImg(u, 'cre-hero', true)}<span class="cre-rank">${RANKS[idx].n}</span></div>
      <div class="cre-grp"><span class="cre-lab">Escoge tu personaje</span><div class="cre-row cre-emojis">${emojiRow}</div></div>
      <div class="cre-grp"><span class="cre-lab">Aura</span><div class="cre-row cre-sws">${outfits}</div></div>
      <p class="note" style="margin:10px 2px 0">Tu golfista está apagado (gris) y <b>se enciende</b> con tus buenas jugadas; brilla más fuerte con cada rango que subes.</p>
    </div>
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">Diseño de tu tarjeta de inicio</h2><span class="small muted">${CARD_SKINS.length} estilos</span></div>
    <div class="card"><div class="cre-skins">${skins}</div></div>
    <div class="rank-ladder" style="margin-top:12px">${steps}</div>`;
}
function vAvatarPicker(u) { return vAvatarCreator(u); }

/* tarjeta de jugador estilo Pokémon: avatar + hándicap (HP) + stats (ataques) */
function vPlayerCard(u, agg) {
  const home = (u.homeCourse && COURSES[u.homeCourse]) ? COURSES[u.homeCourse] : COURSES.campestre;
  const homeName = home.name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
  const sd = (agg && agg.scoreDist) || { total: 0, birdie: 0, eagle: 0, par: 0, bogey: 0, dbl: 0 };
  const tot = sd.total || 1;
  const rs = myRounds().map(Stats.roundStats);
  const holesTot = rs.reduce((a, r) => a + r.holes, 0) || 1;
  const threeP = (rs.reduce((a, r) => a + r.threeP, 0) / holesTot * 18).toFixed(1);
  const rk = RANKS[rankIdx(u.hcp)];
  const goal = (u.goal ?? u.hcp ?? 12);
  const bench = (typeof Stats !== 'undefined' && Stats.benchFor) ? Stats.benchFor(goal) : null;
  let statsHtml;
  if (agg) {
    const rings = [
      pstScene('fw', agg.fwPct, 'Fairways', bench && bench.fwPct),
      pstScene('gir', agg.girPct, 'GIR', bench && bench.girPct),
      pstScene('ud', agg.scrPct, 'Up & down', bench && bench.scrPct),
    ].join('');
    const parPct = Math.round((sd.par || 0) / tot * 100);
    const birdiePct = Math.round(((sd.birdie || 0) + (sd.eagle || 0)) / tot * 100);
    const bogeyPct = Math.round(((sd.bogey || 0) + (sd.dbl || 0)) / tot * 100);
    const statIcon = {
      putt: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="16.5" cy="14.6" rx="4.4" ry="1.8" fill="#1f3a16"/><circle class="si-ball" cx="7.5" cy="13.4" r="4" fill="url(#g3dBall)" stroke="#cdd6cf" stroke-width=".5"/></svg>`,
      three: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="9.5" ry="4" fill="url(#g3dGrass)"/><circle class="si-tb1" cx="8" cy="15.2" r="1.8" fill="url(#g3dBall)"/><circle class="si-tb2" cx="12.4" cy="16.6" r="1.8" fill="url(#g3dBall)"/><circle class="si-tb3" cx="16" cy="14.8" r="1.8" fill="url(#g3dBall)"/></svg>`,
      birdie: `<img src="assets/eagle.png" class="si-img si-soar" alt="" aria-hidden="true">`,
      bogey: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="#e0873a" stroke-width="2.2"/><path class="si-arrow" d="M12 16.5 V8.5 M9 11.5 l3-3 3 3" fill="none" stroke="#e0873a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      par: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="19" rx="8" ry="2.2" fill="url(#g3dGrass)"/><path d="M9 19 V5.5" stroke="#2f3a16" stroke-width="2" stroke-linecap="round"/><path class="si-flagw" d="M9 5.5 L17.5 8.2 L9 10.9 Z" fill="#ff5a4d"/></svg>`,
      best: `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="si-star" d="M12 3 l2.6 5.3 5.9.9 -4.3 4.1 1 5.8 -5.2-2.7 -5.2 2.7 1-5.8 -4.3-4.1 5.9-.9z" fill="#f8cf4a" stroke="#e0a92a" stroke-width="1" stroke-linejoin="round"/></svg>`,
    };
    const tiles = [
      ['Putts / ronda', agg.putts18.toFixed(0), `<span class="pst-ic">${statIcon.putt}</span>`],
      ['3-putts / ronda', threeP, `<span class="pst-ic">${statIcon.three}</span>`],
      ['Birdie o mejor', birdiePct + '%', `<span class="pst-ic">${statIcon.birdie}</span>`],
      ['Bogey o peor', bogeyPct + '%', `<span class="pst-ic">${statIcon.bogey}</span>`],
      ['Pares', parPct + '%', `<span class="pst-ic">${statIcon.par}</span>`],
      ['Mejor vuelta', fmtToPar(agg.bestToPar), `<span class="pst-ic">${statIcon.best}</span>`],
    ].map((t, i) => `<div class="pst-tile" style="--i:${i}"><span class="pst-th">${t[2]}</span><b class="pst-val">${t[1]}</b><span class="pst-lab">${t[0]}</span></div>`).join('');
    statsHtml = `<div class="pst-rings">${rings}</div><div class="pst-grid">${tiles}</div>`;
  } else {
    statsHtml = `<div class="card pl-empty"><span class="pl-empty-ic">${golfIcon('flag')}</span><b>Aún sin estadísticas</b><p>Registra tu primera ronda y aquí verás tus fairways, greens, putts y más.</p><button class="btn primary" data-act="quick-round">Registrar ronda →</button></div>`;
  }
  const sk = cardSkin(u);
  return `<div class="pl-hero skin-${sk.t}" style="background:${sk.g}">
      <div class="pl-hero-txt">
        <span class="pl-hero-lab">${esc(u.name)} · ${rk.n}</span>
        <div class="pl-hero-num">${fmtHcp(u.hcp)}</div>
        <span class="pl-hero-sub">${t('hcp_label')} · ${esc(homeName)}</span>
      </div>
      ${avatarImg(u, 'pl-hero-av')}
    </div>
    ${statsHtml}`;
}

/* Selector de diseños de tarjeta (24 skins) */
function vCardPicker() {
  const u = cur();
  const cur_k = (u.cardSkin || 'calle');
  const cells = CARD_SKINS.map(s => `<button class="cps-cell ${s.k === cur_k ? 'on' : ''}" data-act="set-skin" data-k="${s.k}">
      <span class="cps-sw skin-${s.t}" style="background:${s.g}">${s.k === cur_k ? '<i class="cps-chk">✓</i>' : ''}</span>
      <span class="cps-nm">${s.n}</span>
    </button>`).join('');
  return `<div class="overlay panel-ov" data-act="card-picker-close">
    <div class="panel" data-act="noop">
      <div class="panel-head">
        <h2>Diseño de tarjeta</h2>
        <button class="panel-x" data-act="card-picker-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="panel-body">
        <p class="cps-sub">Elige el look de tu tarjeta de inicio · ${CARD_SKINS.length} diseños.</p>
        <div class="cps-grid">${cells}</div>
      </div>
    </div>
  </div>`;
}

/* anillo de progreso para una stat % */
function pstRing(label, pct, icon) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const R = 26, C = 2 * Math.PI * R, off = (C * (1 - p / 100)).toFixed(1);
  return `<div class="pst-ring">
    <div class="pst-ringsvg">
      <svg viewBox="0 0 64 64"><circle class="pst-track" cx="32" cy="32" r="${R}"/><circle class="pst-prog" cx="32" cy="32" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off}"/></svg>
      <span class="pst-ringval"><b class="pst-ringnum">${p}</b><i>%</i></span>
    </div>
    <span class="pst-ringlab">${esc(label)}</span>
  </div>`;
}

/* ============ Perfil (página) ============ */
/* Posts de amigos (sembrados — sin backend) */
const FRIENDS_FEED = [
  { id: 'f3', name: 'Rodrigo Pérez', av: 3, hcp: 5, course: 'Campestre', holes: 18, score: 75, toPar: 3, fw: 72, gir: 67, putts: 29, when: 'hace 2 h', cmt: 5, likes: 24, cap: 'Tres birdies seguidos en los hoyos 5 al 7. Día redondo.', top: { by: 'Diego', txt: 'Crack absoluto, te alcanzo el finde.' } },
  { id: 'f1', name: 'Diego Salinas', av: 1, hcp: 8, course: 'Tres Marías', holes: 18, score: 82, toPar: 10, fw: 61, gir: 50, putts: 31, when: 'hace 4 h', cmt: 3, likes: 12, cap: 'Por fin rompí 85. El putt cayó hoy.', top: { by: 'Mariana', txt: 'Ese putt del 18 estuvo brutal.' } },
  { id: 'f2', name: 'Mariana Ortiz', av: 2, hcp: 14, course: 'Altozano', holes: 9, score: 44, toPar: 8, fw: 55, gir: 33, putts: 17, when: 'hace 6 h', cmt: 1, likes: 6, cap: 'Vientos pesados en la trasera nueve.', top: { by: 'Andrés', txt: 'Igual aguantaste bien el viento.' } },
  { id: 'f5', name: 'Andrés Gil', av: 5, hcp: 11, course: 'Altozano', holes: 18, score: 88, toPar: 16, fw: 50, gir: 44, putts: 33, when: 'ayer', cmt: 2, likes: 9, cap: 'El bunker del 14 me tiene de cliente.', top: { by: 'Rodrigo', txt: 'Jaja ese bunker es trampa segura.' } },
  { id: 'f4', name: 'Sofía Lara', av: 4, hcp: 19, course: 'Tres Marías', holes: 18, score: 95, toPar: 23, fw: 44, gir: 22, putts: 36, when: 'ayer', cmt: 4, likes: 7, cap: 'Salí a jugar aunque no estaba fina. Vale la pena igual.', top: { by: 'Sofía', txt: 'Esa actitud es la que cuenta.' } },
];

/* tira de tarjeta compacta con scroll horizontal (no ocupa alto) */
function scoreStrip(n, parOf, scoreOf) {
  let cells = '';
  for (let i = 0; i < n; i++) {
    const par = parOf(i), sc = scoreOf(i);
    const d = (sc != null && par != null) ? sc - par : null;
    const cls = d == null ? '' : d <= -2 ? 'eagle' : d === -1 ? 'birdie' : d === 0 ? 'par' : d === 1 ? 'bogey' : 'over';
    cells += `<div class="ss-cell ${cls}"><span class="ss-h">${i + 1}</span><span class="ss-s">${sc != null ? sc : '–'}</span><span class="ss-p">${par != null ? par : ''}</span></div>`;
  }
  return `<div class="ss-strip">${cells}</div>`;
}
/* tarjeta plausible y estable para los posts del feed sin datos hoyo-por-hoyo */
function feedScorecard(p) {
  const n = p.holes || 18;
  const parTpl = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5];
  const pars = []; let parSum = 0;
  for (let i = 0; i < n; i++) { pars.push(parTpl[i % 18]); parSum += parTpl[i % 18]; }
  const scores = pars.slice();
  let rem = (p.score || parSum) - parSum;
  let seed = 0; for (const c of String(p.id || p.name || 'x')) seed += c.charCodeAt(0);
  const order = pars.map((_, i) => i).sort((a, b) => ((seed * (a + 7)) % 17) - ((seed * (b + 7)) % 17));
  let k = 0;
  while (rem !== 0 && k < n * 6) {
    const idx = order[k % n];
    if (rem > 0) { scores[idx] += 1; rem -= 1; }
    else if (scores[idx] > pars[idx] - 1) { scores[idx] -= 1; rem += 1; }
    k++;
  }
  return (typeof scorecardTable === 'function') ? scorecardTable(n, i => pars[i], [{ name: '', scoreOf: i => scores[i] }], -1, null) : scoreStrip(n, i => pars[i], i => scores[i]);
}
/* Detalle de una publicación del feed (la "tarjeta" del amigo): ronda + scorecard + comentarios */
function vFeedCard() {
  const p = (FRIENDS_FEED || []).find(x => x.id === V.feedCard);
  if (!p) { V.view = 'social'; return vSocial(); }
  const u = cur();
  const likes = u.likes || {};
  const liked = !!likes[p.id];
  const ln = (p.likes || 0) + (liked ? 1 : 0);
  const scoreCls = p.toPar <= 0 ? 'good' : p.toPar <= Math.round(p.holes * 0.33) ? 'par' : 'over';
  return `<button class="auth-back" data-act="nav" data-view="social">← Feed de amigos</button>
    <div class="fd-card fd-card-full">
      <div class="fd-head"><span class="fd-avwrap"><img class="fd-av golfer" src="${AVATARS[p.av] || AVATARS[0]}" alt="" loading="lazy"></span>
        <div class="fd-who"><b>${esc(p.name)}</b><span>HCP ${fmtHcp(p.hcp)} · ${esc(p.when)}</span></div></div>
      <div class="fd-round">
        <div class="fd-course"><b>${esc(p.course)}</b><span>${p.holes} hoyos</span></div>
        <div class="fd-score ${scoreCls}"><b>${p.score}</b><span>${fmtToPar(p.toPar)}</span></div>
      </div>
      <div class="fd-stats">
        <span><b>${p.fw}%</b> fairways</span><span><b>${p.gir}%</b> GIR</span><span><b>${p.putts}</b> putts</span>
      </div>
      <div class="fd-scard"><span class="fd-scard-lab">${golfIcon('card')} Tarjeta</span>${feedScorecard(p)}</div>
      ${p.cap ? `<p class="fd-cap fd-cap-btm">${esc(p.cap)}</p>` : ''}
    </div>
    <div class="fd-social fd-social-full">
      <div class="fd-actions">
        <button class="fd-like ${liked ? 'on' : ''}" data-act="feed-like" data-id="${p.id}">${heartIcon()}<span>${ln}</span></button>
        <span class="fd-cmt">${commentIcon()}<span>${p.cmt || 0}</span></span>
      </div>
      <div class="sec-h" style="margin-top:6px"><h2 style="font-size:15px">Comentarios</h2></div>
      ${p.top ? `<div class="fd-topc"><b>${esc(p.top.by)}</b> ${esc(p.top.txt)}</div>` : `<p class="note" style="margin:0">Aún sin comentarios. Sé el primero.</p>`}
    </div>`;
}
/* tiempo relativo en español a partir de un timestamp ISO (created_at) */
function fmtWhen(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime(); if (isNaN(t)) return '';
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return 'hace ' + min + ' min';
  const hr = Math.floor(min / 60);
  if (hr < 24) return 'hace ' + hr + ' h';
  const d = Math.floor(hr / 24);
  if (d === 1) return 'ayer';
  if (d < 7) return 'hace ' + d + ' días';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

/* tarjeta del feed REAL (post de Supabase con su snapshot) */
function feedCardReal(p, u) {
  const holesN = p.holes_count || (p.holes ? p.holes.length : 18);
  const scoreCls = p.to_par <= 0 ? 'good' : p.to_par <= Math.round(holesN * 0.33) ? 'par' : 'over';
  const name = p.mine ? u.name : ((p.author && p.author.name) || 'Jugador');
  const avIdx = (p.author && p.author.avatar) || 0;
  const av = p.mine ? avatarImg(u, 'fd-av') : `<img class="fd-av golfer" src="${AVATARS[avIdx] || AVATARS[0]}" alt="" loading="lazy">`;
  const when = fmtWhen(p.created_at);
  const sub = p.mine ? 'Tú · ' + when
    : ((p.author && p.author.hcp != null ? 'HCP ' + fmtHcp(p.author.hcp) + ' · ' : '') + when);
  const parOf = i => (p.holes && p.holes[i] && p.holes[i].par != null) ? p.holes[i].par : 4;
  const card = (typeof scorecardTable === 'function')
    ? scorecardTable(holesN, parOf, [{ name: name.split(' ')[0], scoreOf: i => (p.holes && p.holes[i] ? p.holes[i].score : null) }], -1, null)
    : '';
  return `<div class="fd-card">
      <div class="fd-head"><span class="fd-avwrap">${av}</span>
        <div class="fd-who"><b>${esc(name)}${p.mine ? ' <span class="fd-you">tú</span>' : ''}</b><span>${esc(sub)}</span></div></div>
      ${p.caption ? `<p class="fd-cap">${esc(p.caption)}</p>` : ''}
      ${p.media ? `<div class="fd-media">${p.media.type === 'video' ? `<video src="${p.media.src}" controls playsinline preload="metadata"></video>` : `<img src="${p.media.src}" alt="" loading="lazy">`}</div>` : ''}
      <div class="fd-round">
        <div class="fd-course"><b>${esc(p.course || '')}</b><span>${holesN} hoyos</span></div>
        <div class="fd-score ${scoreCls}"><b>${p.score}</b><span>${fmtToPar(p.to_par)}</span></div>
      </div>
      <div class="fd-stats">
        <span><b>${p.fw}%</b> fairways</span><span><b>${p.gir}%</b> GIR</span><span><b>${p.putts}</b> putts</span>
      </div>
      <div class="fd-scard"><span class="fd-scard-lab">${golfIcon('card')} Tarjeta</span>${card}</div>
      <div class="fd-actions">
        <button class="fd-like ${p.liked ? 'on' : ''}" data-act="feed-like" data-id="${esc(p.id)}">${heartIcon()}<span>${p.likeCount || 0}</span></button>
        <button class="fd-cmt" data-act="feed-comments" data-id="${esc(p.id)}">${commentIcon()}<span>${p.commentCount || 0}</span></button>
      </div>
    </div>`;
}

/* Perfil de un jugador real: su nombre/avatar/hcp + sus rondas compartidas (posts) */
function vFriendReal(uid) {
  const u = cur();
  const all = (typeof Feed !== 'undefined') ? Feed.state().posts : [];
  const theirs = all.filter(p => p.user_id === uid);
  const me = uid === S.session;
  const prof = me ? { name: u.name, avatar: u.avatar || 0, hcp: u.hcp } : (theirs[0] && theirs[0].author) || { name: 'Jugador', avatar: 0, hcp: null };
  const head = `<button class="auth-back" data-act="nav" data-view="social">← Social</button>
    <div class="greet" style="padding-top:6px">
      <div style="display:flex;align-items:center;gap:14px">
        <span style="flex:0 0 auto;width:56px;height:56px"><img class="golfer" src="${AVATARS[prof.avatar || 0] || AVATARS[0]}" alt="" loading="lazy" style="width:56px;height:56px;border-radius:50%;object-fit:contain"></span>
        <div><h1 style="font-size:26px">${esc(prof.name)}${me ? ' (tú)' : ''}</h1>
        ${prof.hcp != null ? `<p class="hcp">HCP ${fmtHcp(prof.hcp)}</p>` : ''}</div>
      </div>
    </div>`;
  if (!theirs.length) return head + `<div class="card empty"><div class="e-ico">${golfIcon('flag')}</div><h3>Sin rondas compartidas</h3><p>${me ? 'Aún no compartes rondas en el feed.' : 'Este jugador aún no comparte rondas.'}</p></div>`;
  return head + `<div class="sec-h" style="margin-top:14px"><h2 style="font-size:18px">Rondas compartidas</h2></div>
    <div class="fd-list">${theirs.map(p => feedCardReal(p, u)).join('')}</div>`;
}

/* hoja de comentarios reales de un post */
function vCommentsSheet(postId) {
  const u = cur();
  const list = (typeof Feed !== 'undefined') ? Feed.comments(postId) : null;
  const avEl = cm => `<img class="golfer" src="${AVATARS[(cm.mine ? (u.avatar || 0) : ((cm.author && cm.author.avatar) || 0))] || AVATARS[0]}" alt="" loading="lazy" style="width:34px;height:34px;border-radius:50%;object-fit:contain">`;
  const rows = list == null
    ? `<p class="note" style="margin:6px 2px">Cargando comentarios…</p>`
    : (list.length
      ? list.map(cm => `<div style="display:flex;gap:10px;align-items:flex-start">
          <span style="flex:0 0 auto;width:34px;height:34px">${avEl(cm)}</span>
          <div style="flex:1;min-width:0"><b>${esc(cm.mine ? u.name : (cm.author && cm.author.name) || 'Jugador')}</b> <span class="note" style="font-size:12px">${esc(fmtWhen(cm.created_at))}</span><p style="margin:2px 0 0;word-wrap:break-word">${esc(cm.text)}</p></div>
          ${cm.mine ? `<button class="ev-del" data-act="comment-del" data-p="${esc(postId)}" data-id="${esc(cm.id)}" aria-label="Borrar">✕</button>` : ''}
        </div>`).join('')
      : `<p class="note" style="margin:6px 2px">Sé el primero en comentar.</p>`);
  return `<div class="overlay" data-act="comments-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Comentarios</h2>
    <div style="max-height:46vh;overflow:auto;display:flex;flex-direction:column;gap:14px;margin:8px 0 4px">${rows}</div>
    <div class="field"><textarea id="cm-text" rows="2" placeholder="Escribe un comentario…"></textarea></div>
    <button class="btn primary" data-act="comment-post" data-p="${esc(postId)}" ${V.commentBusy ? 'disabled' : ''}>${V.commentBusy ? 'Publicando…' : 'Comentar'}</button>
    <button class="btn" data-act="comments-close">Cerrar</button>
  </div></div>`;
}

function vSocialFeed() {
  const u = cur();
  // ---- modo nube: feed real desde Supabase ----
  if (typeof Feed !== 'undefined' && Feed.on()) {
    Feed.ensure();
    const st = Feed.state();
    if (st.posts.length) {
      const body = st.posts.map(p => feedCardReal(p, u)).join('');
      return `<div class="sec-h" style="margin-top:6px"><h2>Feed de amigos</h2></div>
        <div class="fd-list">${body}</div>
        ${V.shareDraft ? vShareComposer(u) : ''}
        ${V.commentsFor ? vCommentsSheet(V.commentsFor) : ''}`;
    }
    // si aún no hay rondas en la nube, cae al feed demo (diseño de antes)
  }
  // ---- modo local (sin nube): feed demo, como antes ----
  const likes = u.likes || {};
  const shared = u.shared || [];
  const sname = c => (c && COURSES[c]) ? COURSES[c].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : c;
  const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
  const myPosts = myRounds().filter(r => shared.includes(r.id)).map(r => {
    const s = Stats.roundStats(r);
    const off = r.holeOffset || 0;
    const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId] : null;
    const ch = course ? course.holes : null;
    const parOf = i => (r.holes[i] && r.holes[i].par != null) ? r.holes[i].par : (ch && ch[off + i] ? ch[off + i].par : 4);
    const card = (typeof scorecardTable === 'function') ? scorecardTable(s.holes, parOf, [{ name: '', scoreOf: i => (r.holes[i] ? r.holes[i].score : null) }], -1, null) : scoreStrip(s.holes, parOf, i => (r.holes[i] ? r.holes[i].score : null));
    return { id: 'me-' + r.id, mine: true, name: u.name, course: r.courseId ? sname(r.courseId) : r.course, holes: s.holes, score: s.score, toPar: s.toPar, fw: pct(s.fw, s.fwTot), gir: pct(s.gir, s.girTot), putts: s.putts, when: fmtDate(r.date), cmt: 0, likes: 0, cap: r.caption || '', media: r.media || null, card };
  });
  const feed = [...myPosts, ...FRIENDS_FEED];
  const cards = feed.map(p => {
    const liked = !!likes[p.id];
    const ln = (p.likes || 0) + (liked ? 1 : 0);
    const scoreCls = p.toPar <= 0 ? 'good' : p.toPar <= Math.round(p.holes * 0.33) ? 'par' : 'over';
    const av = p.mine ? avatarImg(u, 'fd-av') : `<img class="fd-av golfer" src="${AVATARS[p.av] || AVATARS[0]}" alt="" loading="lazy">`;
    const headInner = `<span class="fd-avwrap">${av}</span>
        <div class="fd-who"><b>${esc(p.name)}${p.mine ? ' <span class="fd-you">tú</span>' : ''}</b><span>${p.mine ? 'Tú · ' + p.when : 'HCP ' + fmtHcp(p.hcp) + ' · ' + p.when}</span></div>`;
    const head = `<button class="fd-head fd-link" data-act="feed-card" data-id="${esc(p.id)}">${headInner}<span class="fd-go">›</span></button>`;
    return `<div class="fd-card">
      ${head}
      ${p.media ? `<div class="fd-media">${p.media.type === 'video' ? `<video src="${p.media.src}" controls playsinline preload="metadata"></video>` : `<img src="${p.media.src}" alt="" loading="lazy">`}</div>` : ''}
      <div class="fd-round fd-tap" data-act="feed-card" data-id="${esc(p.id)}">
        <div class="fd-course"><b>${esc(p.course)}</b><span>${p.holes} hoyos</span></div>
        <div class="fd-score ${scoreCls}"><b>${p.score}</b><span>${fmtToPar(p.toPar)}</span></div>
      </div>
      <div class="fd-stats">
        <span><b>${p.fw}%</b> fairways</span><span><b>${p.gir}%</b> GIR</span><span><b>${p.putts}</b> putts</span>
      </div>
      <div class="fd-scard fd-tap" data-act="feed-card" data-id="${esc(p.id)}"><span class="fd-scard-lab">${golfIcon('card')} Tarjeta</span>${p.mine ? (p.card || '') : feedScorecard(p)}</div>
      ${p.cap ? `<p class="fd-cap fd-cap-btm">${esc(p.cap)}</p>` : ''}
      <div class="fd-actions">
        <button class="fd-like ${liked ? 'on' : ''}" data-act="feed-like" data-id="${p.id}">${heartIcon()}<span>${ln}</span></button>
        <span class="fd-cmt">${commentIcon()}<span>${p.cmt || 0}</span></span>
      </div>
      ${p.top ? `<div class="fd-topc"><b>${esc(p.top.by)}</b> ${esc(p.top.txt)}</div>` : ''}
    </div>`;
  }).join('');
  return `<div class="sec-h" style="margin-top:6px"><h2>Feed de amigos</h2></div>
    <div class="fd-list">${cards}</div>
    ${V.shareDraft ? vShareComposer(u) : ''}`;
}

/* Composer para compartir una ronda con caption + foto/video */
function vShareComposer(u) {
  const d = V.shareDraft;
  const rs = myRounds();
  if (!rs.length) return '';
  const sname = c => (c && COURSES[c]) ? COURSES[c].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : c;
  const rChips = rs.slice(0, 6).map(r => {
    const s = Stats.roundStats(r);
    return `<button class="chip sm ${d.roundId === r.id ? 'on' : ''}" data-act="share-pick" data-id="${r.id}">${esc(r.courseId ? sname(r.courseId) : r.course)} · ${s.score} · ${fmtDate(r.date)}</button>`;
  }).join('');
  const m = d.media;
  return `<div class="overlay" data-act="share-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Compartir ronda</h2>
    <p class="auth-sub">Elige la ronda, escribe algo y súbele una foto o video.</p>
    <div class="field"><label>Ronda</label><div class="chips" style="flex-wrap:wrap">${rChips}</div></div>
    <div class="field"><label>¿Qué tal estuvo?</label><textarea id="share-cap" rows="2" placeholder="Ej. ¡Por fin rompí 80!">${esc(d.caption || '')}</textarea></div>
    <label class="share-up">
      <input type="file" accept="image/*,video/*" style="display:none" onchange="parfectShareMedia(this)">
      ${m ? (m.type === 'video' ? `<video src="${m.src}" class="share-prev" muted></video>` : `<img src="${m.src}" class="share-prev" alt="">`) : `<span class="share-uptx">${golfIcon('card')} Toca para subir foto o video</span>`}
    </label>
    ${m ? `<button class="btn ghost sm" data-act="share-clearmedia">Quitar ${m.type === 'video' ? 'video' : 'foto'}</button>` : ''}
    ${V.shareErr ? `<p class="form-err">${esc(V.shareErr)}</p>` : ''}
    <button class="btn primary" data-act="share-post" ${V.shareBusy ? 'disabled' : ''}>${V.shareBusy ? 'Publicando…' : 'Publicar en el feed'}</button>
    <button class="btn" data-act="share-close">Cancelar</button>
  </div></div>`;
}

/* tabla de tu liga de amigos (mejor ronda de la semana, normalizada a 18) */
function socialLeaders(u) {
  // ---- modo nube: mejor ronda de la semana de cada usuario que publicó ----
  if (typeof Feed !== 'undefined' && Feed.on()) {
    const now = Date.now(), week = 7 * 864e5;
    const best = {};
    for (const p of Feed.state().posts) {
      const ts = p.created_at ? new Date(p.created_at).getTime() : now;
      if (now - ts > week) continue;
      const holes = p.holes_count || 18;
      const toPar18 = Math.round((p.to_par || 0) / holes * 18);
      const me = p.user_id === S.session;
      const entry = {
        id: p.user_id, me,
        name: me ? u.name : (p.author && p.author.name) || 'Jugador',
        av: me ? (u.avatar || 0) : (p.author && p.author.avatar) || 0,
        hcp: me ? u.hcp : (p.author && p.author.hcp),
        toPar18, score: p.score,
      };
      if (!best[p.user_id] || toPar18 < best[p.user_id].toPar18) best[p.user_id] = entry;
    }
    const cloudLead = Object.values(best).sort((a, b) => a.toPar18 - b.toPar18);
    if (cloudLead.length) return cloudLead;
    // si aún no hay datos en la nube, cae al demo (diseño de antes)
  }
  // ---- modo local: demo ----
  const mine = myRounds();
  const e = FRIENDS_FEED.map(f => ({ id: f.id, name: f.name, av: f.av, hcp: f.hcp, toPar18: Math.round(f.toPar / f.holes * 18), score: f.score }));
  if (mine.length) {
    const s = Stats.roundStats(mine[0]);
    e.push({ me: true, name: u.name, hcp: u.hcp, toPar18: Math.round(s.toPar / Math.max(1, s.holes) * 18), score: s.score });
  }
  return e.sort((a, b) => a.toPar18 - b.toPar18);
}

/* fila de historias: quién está jugando */
function vStories(u) {
  const me = `<div class="story me"><span class="story-ring">${avatarImg(u, 'story-img')}</span><span class="story-nm">Tú</span></div>`;
  // ---- modo nube: historias de quienes han publicado en el feed ----
  if (typeof Feed !== 'undefined' && Feed.on()) {
    Feed.ensure();
    const seen = new Set([S.session]);
    const others = [];
    for (const p of Feed.state().posts) { if (!seen.has(p.user_id)) { seen.add(p.user_id); others.push(p); } }
    const oCells = others.map(p => `<button class="story story-link" data-act="friend" data-id="${esc(p.user_id)}">
      <span class="story-ring"><img class="story-img golfer" src="${AVATARS[(p.author && p.author.avatar) || 0] || AVATARS[0]}" alt="" loading="lazy"></span>
      <span class="story-nm">${esc(((p.author && p.author.name) || 'Jugador').split(' ')[0])}</span></button>`).join('');
    if (others.length) { const cells = me + oCells; return `<div class="story-row"><div class="story-track">${cells}${cells}</div></div>`; }
    // si nadie ha publicado en la nube, cae al demo (diseño de antes)
  }
  // ---- modo local: demo ----
  const cells = me + FRIENDS_FEED.map(f => `<button class="story story-link" data-act="friend" data-id="${esc(f.id)}">
      <span class="story-ring"><img class="story-img golfer" src="${AVATARS[f.av] || AVATARS[0]}" alt="" loading="lazy"></span>
      <span class="story-nm">${esc(f.name.split(' ')[0])}</span></button>`).join('');
  return `<div class="story-row"><div class="story-track">${cells}${cells}</div></div>`;
}

/* liga de amigos: ranking */
function vRanking(u) {
  const lead = socialLeaders(u);
  if (typeof Feed !== 'undefined' && Feed.on() && !lead.length) {
    return `<div class="sec-h"><h2>Liga de amigos</h2></div>
      <div class="rk-card"><p class="note" style="margin:8px 2px">Aún no hay rondas compartidas esta semana. Comparte la tuya para entrar al ranking.</p></div>`;
  }
  const myPos = lead.findIndex(e => e.me) + 1;
  const rows = lead.map((e, i) => {
    const pos = i + 1;
    const av = e.me ? avatarImg(u, 'rk-img') : `<img class="rk-img golfer" src="${AVATARS[e.av] || AVATARS[0]}" alt="" loading="lazy">`;
    const inner = `<span class="rk-pos ${pos <= 3 ? 'top' + pos : ''}">${pos}</span>
      <span class="rk-av">${av}</span>
      <div class="rk-info"><b>${esc(e.me ? e.name.split(' ')[0] + ' (tú)' : e.name)}</b><span>HCP ${fmtHcp(e.hcp)}</span></div>
      <span class="rk-score ${e.toPar18 <= 0 ? 'good' : ''}">${e.toPar18 > 0 ? '+' : ''}${e.toPar18}</span>`;
    return e.me
      ? `<div class="rk-row me">${inner}</div>`
      : `<button class="rk-row rk-link" data-act="friend" data-id="${esc(e.id || '')}">${inner}<span class="rk-go">›</span></button>`;
  }).join('');
  return `<div class="sec-h"><h2>Liga de amigos</h2>${myPos ? `<span class="small muted">vas #${myPos} de ${lead.length}</span>` : ''}</div>
    <div class="rk-card">${rows}<p class="rk-foot">Mejor ronda de la semana · ajustada a 18 hoyos</p></div>`;
}

/* Torneo (sembrado — sin backend) */
const TOURNAMENT = {
  active: {
    name: 'Copa Parfect · Junio', course: 'Campestre', ends: 'Termina en 2 días',
    leaders: [
      { name: 'Rodrigo Pérez', av: 3, score: -4 },
      { name: 'Diego Salinas', av: 1, score: -1 },
      { me: true, score: 2 },
      { name: 'Andrés Gil', av: 5, score: 4 },
      { name: 'Mariana Ortiz', av: 2, score: 6 },
      { name: 'Sofía Lara', av: 4, score: 9 },
    ],
  },
  upcoming: [
    { type: 'torneo', name: 'Torneo Aniversario', course: 'Tres Marías', date: '28 jun' },
    { type: 'clase', name: 'Clase: Wedges 50–90 m', course: 'Coach Hugo · Campestre', date: '24 jun · 9:00' },
    { type: 'torneo', name: 'Match Play Amigos', course: 'Altozano', date: '5 jul' },
    { type: 'clase', name: 'Clase: Putting & lag', course: 'Coach Hugo · Campestre', date: '1 jul · 17:30' },
  ],
};
function vTorneo(u) {
  // Mismo diseño (tablero demo + próximos eventos); en la nube se añaden los eventos reales.
  const t = TOURNAMENT.active;
  const rows = t.leaders.slice().sort((a, b) => a.score - b.score).map((p, i) => {
    const pos = i + 1;
    const av = p.me ? avatarImg(u, 'tr-img') : `<img class="tr-img golfer" src="${AVATARS[p.av] || AVATARS[0]}" alt="" loading="lazy">`;
    return `<div class="tr-row ${p.me ? 'me' : ''}">
      <span class="tr-pos ${pos <= 3 ? 'top' + pos : ''}">${pos}</span>
      <span class="tr-av">${av}</span>
      <div class="tr-info"><b>${p.me ? esc(u.name.split(' ')[0]) + ' (tú)' : esc(p.name)}</b></div>
      <span class="tr-score ${p.score <= 0 ? 'good' : ''}">${fmtToPar(p.score)}</span>
    </div>`;
  }).join('');
  const joined = u.joinedEvents || {};
  const ups = TOURNAMENT.upcoming.map(x => {
    const clase = x.type === 'clase';
    const isJoined = !!joined[x.name];
    return `<div class="tr-up ${clase ? 'is-clase' : ''}">
      <span class="tr-up-ic">${golfIcon(clase ? 'medal' : 'flag')}</span>
      <div class="tr-up-info"><b>${esc(x.name)}</b><span>${esc(x.course)} · ${esc(x.date)}</span></div>
      <button class="tr-up-btn ${isJoined ? 'on' : ''}" data-act="ev-join-up" data-n="${esc(x.name)}">${isJoined ? '✓ ' + (clase ? 'Confirmado' : 'Apuntado') : (clase ? 'Confirmar' : 'Apuntarme')}</button>
    </div>`;
  }).join('');
  return `<div class="sec-h"><h2>Torneo en juego ${golfIcon('trophy')}</h2><span class="small muted">${t.ends}</span></div>
    <div class="tr-card">
      <div class="tr-head"><b>${esc(t.name)}</b><span>${esc(t.course)}</span></div>
      <div class="tr-board">${rows}</div>
    </div>
    <div class="sec-h" style="margin-top:20px"><h2 style="font-size:18px">Próximos eventos</h2><button class="sec-link" data-act="event-new">+ Crear evento</button></div>
    ${vEventsList(u)}
    <div class="tr-ups">${ups}</div>
    ${upcomingCard(u)}
    ${V.eventDraft ? vEventComposer(u) : ''}`;
}

const EV_MODE = { casual: 'Casual', medal: 'Medal', match: 'Match play', corta: 'La corta' };
function evCourseName(c) { return (c && COURSES[c]) ? COURSES[c].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : (c || ''); }
function vEventsList(u) {
  // ---- modo nube: tablón de eventos reales (self-RSVP) ----
  if (typeof Events !== 'undefined' && Events.on()) {
    Events.ensure();
    const st = Events.state();
    if (!st.events.length) return '';
    return st.events.map(e => {
      const avs = e.goingPeople.slice(0, 8).map(p => `<span class="ev-inv st-yes" title="${esc(p.name)}">${esc(initials(p.name))}</span>`).join('');
      const going = e.goingCount;
      const goBtn = `<button class="tr-up-btn ${e.myStatus === 'going' ? 'on' : ''}" data-act="event-rsvp" data-id="${esc(e.id)}" data-s="going">${e.myStatus === 'going' ? '✓ Voy' : 'Voy'}</button>`;
      return `<div class="ev-card">
        <div class="ev-top"><span class="ev-mode">${EV_MODE[e.mode] || e.mode}</span>${e.mine ? `<button class="ev-del" data-act="event-del" data-id="${esc(e.id)}" aria-label="Borrar">✕</button>` : ''}</div>
        <b class="ev-name">${esc(e.name)}</b>
        <span class="ev-meta">${golfIcon('flag')} ${esc(evCourseName(e.course_id))} · ${esc(e.date)}${e.time ? ' · ' + esc(e.time) : ''}</span>
        <span class="ev-meta" style="opacity:.7">Organiza ${esc(e.mine ? 'tú' : (e.host && e.host.name) || 'Jugador')}</span>
        ${avs ? `<div class="ev-invs">${avs}</div>` : ''}
        <div class="ev-rsvp-row">${goBtn}<span class="ev-conf">${going} ${going === 1 ? 'va' : 'van'}</span></div>
      </div>`;
    }).join('');
  }
  // ---- modo local (demo) ----
  const evs = S.events || [];
  if (!evs.length) return '';
  return evs.map(e => {
    const yes = e.invitees.filter(i => i.status === 'yes').length;
    const inv = e.invitees.map(i => `<button class="ev-inv st-${i.status}" data-act="event-rsvp" data-id="${e.id}" data-n="${esc(i.name)}" title="${esc(i.name)} · ${i.status === 'yes' ? 'va' : i.status === 'no' ? 'no va' : 'pendiente'}">${esc(initials(i.name))}</button>`).join('');
    return `<div class="ev-card">
      <div class="ev-top"><span class="ev-mode">${EV_MODE[e.mode] || e.mode}</span><button class="ev-del" data-act="event-del" data-id="${e.id}" aria-label="Borrar">✕</button></div>
      <b class="ev-name">${esc(e.name)}</b>
      <span class="ev-meta">${golfIcon('flag')} ${esc(evCourseName(e.courseId))} · ${esc(e.date)}${e.time ? ' · ' + esc(e.time) : ''}</span>
      ${e.invitees.length ? `<div class="ev-invs">${inv}</div><span class="ev-conf">${yes}/${e.invitees.length} confirmaron · toca un amigo para marcar</span>` : `<span class="ev-conf">Sin invitados</span>`}
    </div>`;
  }).join('');
}
function vEventComposer(u) {
  const d = V.eventDraft;
  const courseChips = COURSE_ORDER.map(id => `<button class="chip sm ${d.courseId === id ? 'on' : ''}" data-act="event-course" data-c="${id}">${esc(evCourseName(id))}</button>`).join('');
  const modeChips = Object.entries(EV_MODE).map(([k, l]) => `<button class="chip sm ${d.mode === k ? 'on' : ''}" data-act="event-mode" data-m="${k}">${l}</button>`).join('');
  const cloud = (typeof Events !== 'undefined' && Events.on());
  const friends = FRIENDS_FEED.map(f => `<button class="chip sm ${d.invitees.includes(f.name) ? 'on' : ''}" data-act="event-invite" data-n="${esc(f.name)}">${d.invitees.includes(f.name) ? '✓ ' : ''}${esc(f.name.split(' ')[0])}</button>`).join('');
  return `<div class="overlay" data-act="event-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Crear evento</h2>
    <p class="auth-sub">${cloud ? 'Organiza una jugada. Aparece en el tablón y cada quien confirma su lugar para cuadrar el tee time.' : 'Organiza una jugada e invita a tus amigos. Cada quien confirma su lugar para cuadrar el tee time.'}</p>
    <div class="field"><label>Nombre</label><input id="ev-name" placeholder="Ej. Domingo en Campestre" value="${esc(d.name || '')}"></div>
    <div class="field"><label>Campo</label><div class="chips">${courseChips}</div></div>
    <div class="cz-form2">
      <div class="field"><label>Día</label><input id="ev-date" type="date" value="${esc(d.date)}"></div>
      <div class="field"><label>Tee time</label><input id="ev-time" type="time" value="${esc(d.time)}"></div>
    </div>
    <div class="field"><label>Modalidad</label><div class="chips">${modeChips}</div></div>
    ${cloud ? '' : `<div class="field"><label>Invitar amigos</label><div class="chips" style="flex-wrap:wrap">${friends}</div></div>`}
    ${V.err ? `<p class="form-err">${esc(V.err)}</p>` : ''}
    <button class="btn primary" data-act="event-create" ${V.eventBusy ? 'disabled' : ''}>${V.eventBusy ? 'Creando…' : (cloud ? 'Crear evento' : 'Crear e invitar')}</button>
    <button class="btn" data-act="event-close">Cancelar</button>
  </div></div>`;
}

function vPerfil() {
  const u = cur();
  return `${vStories(u)}
    ${vTorneo(u)}
    ${vRanking(u)}
    ${vSocialFeed()}
    ${vClubEntry(u)}`;
}

/* ============ Club (B2B): multi-tenant local-first, listo para Supabase ============ */
const CLUB_ROLE_LABEL = { admin: 'Administrador', coach: 'Coach', member: 'Miembro', junior: 'Juvenil', parent: 'Padre/Madre' };
function myClub() { const u = cur(); if (!u) return null; return (S.clubs || []).find(c => (c.members || []).some(m => m.userId === u.id)) || null; }
function clubRole(c, u) { u = u || cur(); const m = c && (c.members || []).find(x => x.userId === (u && u.id)); return m ? m.role : null; }
function clubInitials(n) { return (typeof initials === 'function') ? initials(n) : String(n || '?').slice(0, 2).toUpperCase(); }

/* tarjeta de acceso al club dentro del hub social */
function vClubEntry(u) {
  const c = myClub();
  if (c) {
    const n = (c.members || []).length;
    return `<button class="club-entry has" data-act="nav" data-view="club">
      <span class="club-entry-ic">${golfIcon('flag')}</span>
      <div class="club-entry-tx"><b>${esc(c.name)}</b><span>${n} miembro${n === 1 ? '' : 's'} · ${CLUB_ROLE_LABEL[clubRole(c, u)] || 'miembro'}</span></div>
      <span class="club-entry-go">›</span></button>`;
  }
  return `<button class="club-entry" data-act="nav" data-view="club">
    <span class="club-entry-ic">${golfIcon('flag')}</span>
    <div class="club-entry-tx"><b>¿Eres de un club?</b><span>Llévalo a PARFECT: torneos y cantera juvenil</span></div>
    <span class="club-entry-go">›</span></button>`;
}

/* vista principal del Club */
function vClub() {
  const u = cur(); if (!u) return '';
  const c = myClub();
  if (V.clubCreating) {
    return `<div class="sec-h"><h2>Crear tu club</h2><button class="sec-link" data-act="club-create-cancel">Cancelar</button></div>
      <div class="card">
        <div class="field"><label>Nombre del club</label><input id="club-name" placeholder="Ej. Club Campestre Morelia" value="${esc(V.clubDraftName || '')}"></div>
        <p class="note" style="margin-top:8px">Serás el administrador. Generaremos un código para invitar a tus socios y juveniles.</p>
        <button class="btn primary big" data-act="club-create" style="margin-top:8px">Crear club ${golfIcon('flag')}</button>
        ${V.clubErr ? `<p class="note err">${esc(V.clubErr)}</p>` : ''}
      </div>`;
  }
  if (!c) {
    return `<div class="sec-h"><h2>Tu club</h2></div>
      <div class="card club-intro">
        <span class="club-bigic">${golfIcon('flag')}</span>
        <h3>Lleva tu club a PARFECT</h3>
        <p class="note">Corre torneos con leaderboard en vivo e impulsa a tus juveniles. Crea el club de tu campo o únete con un código.</p>
        <button class="btn primary big" data-act="club-create-open">Crear un club</button>
        <div class="club-join">
          <input id="club-code" placeholder="CÓDIGO" maxlength="6" autocomplete="off" style="text-transform:uppercase">
          <button class="btn" data-act="club-join">Unirme</button>
        </div>
        ${V.clubErr ? `<p class="note err">${esc(V.clubErr)}</p>` : ''}
      </div>`;
  }
  const role = clubRole(c, u);
  const isStaff = role === 'admin' || role === 'coach';
  const members = c.members || [];
  const juniors = members.filter(m => m.role === 'junior').length;
  const nameOf = id => { const x = members.find(m => m.userId === id); return x ? (x.name || '').split(' ')[0] : ''; };
  const subOf = m => {
    if (m.role === 'parent' && m.parentOf) return 'Padre/Madre · de ' + esc(nameOf(m.parentOf));
    if (m.role === 'junior') return 'Juvenil' + (m.category ? ' · ' + esc(m.category) : '');
    return (CLUB_ROLE_LABEL[m.role] || m.role) + (m.hcp != null ? ' · HCP ' + fmtHcp(m.hcp) : '');
  };
  const roster = members.map(m => {
    const inner = `<span class="cl-mem-av" style="--ci:${(m.name || '').length % 6}">${clubInitials(m.name)}</span>
      <div class="cl-mem-tx"><b>${esc(m.name)}${m.userId === u.id ? ' <span class="cl-you">tú</span>' : ''}</b><span>${subOf(m)}</span></div>
      ${m.role === 'junior' ? `<span class="cl-badge jr">JR</span>` : ''}`;
    return (isStaff && m.role !== 'admin')
      ? `<button class="cl-mem cl-mem-btn" data-act="member-edit" data-id="${esc(m.userId)}">${inner}<span class="cl-mem-go">›</span></button>`
      : `<div class="cl-mem">${inner}</div>`;
  }).join('');
  return `<div class="sec-h"><h2>${esc(c.name)}</h2><span class="small muted">${members.length} miembros</span></div>
    <div class="card cl-hub">
      <div class="cl-hubtop"><span class="cl-role">${CLUB_ROLE_LABEL[role] || role}</span>${isStaff ? `<span class="cl-code">Código <b>${esc(c.code)}</b></span>` : ''}</div>
      <div class="cl-actions">
        <button class="cl-tile" data-act="club-tourns-open">${golfIcon('trophy')}<span>Torneos</span><i>${(c.tournaments || []).length || 'crear'} ${(c.tournaments || []).length === 1 ? 'torneo' : 'torneos'}</i></button>
        <button class="cl-tile" data-act="club-academy-open">${golfIcon('flag')}<span>Academia juvenil</span><i>${juniors} juveniles</i></button>
      </div>
      ${isStaff ? `<button class="cl-invite-btn" data-act="club-invite">${golfIcon('card')} Invitar por código / QR</button><button class="cl-invite-btn" data-act="club-plans">${golfIcon('trophy')} Plan del club</button>` : ''}
    </div>
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:18px">Miembros</h2>${isStaff ? `<button class="sec-link" data-act="member-new">+ Agregar</button>` : ''}</div>
    <div class="card cl-roster">${roster}</div>
    <button class="btn ghost" data-act="club-leave" style="margin-top:12px">Salir del club</button>
    ${V.inviteOpen ? vInviteSheet(c) : ''}
    ${V.memberEdit ? vMemberSheet(c) : ''}`;
}
function vMemberSheet(c) {
  const d = V.memberEdit; const isNew = !d.userId || d.isNew;
  const juniors = (c.members || []).filter(m => m.role === 'junior' && m.userId !== d.userId);
  const roles = [['member', 'Miembro'], ['coach', 'Coach'], ['junior', 'Juvenil'], ['parent', 'Padre/Madre']];
  return `<div class="overlay" data-act="member-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>${isNew ? 'Agregar miembro' : 'Editar miembro'}</h2>
    <div class="field"><label>Nombre</label><input id="mem-name" placeholder="Nombre completo" value="${esc(d.name || '')}"></div>
    <div class="field"><label>Rol</label><div class="chips">${roles.map(r => `<button class="chip sm ${d.role === r[0] ? 'on' : ''}" data-act="member-role" data-r="${r[0]}">${r[1]}</button>`).join('')}</div></div>
    ${d.role === 'junior' ? `<div class="field"><label>Categoría</label><input id="mem-cat" placeholder="Ej. Sub-14" value="${esc(d.category || '')}"></div>` : ''}
    ${d.role !== 'junior' ? `<div class="field"><label>Hándicap</label><input id="mem-hcp" type="number" step="1" value="${d.hcp != null ? esc(d.hcp) : ''}"></div>` : ''}
    ${d.role === 'parent' ? `<div class="field"><label>Hijo/a en el club</label><div class="chips">${juniors.length ? juniors.map(j => `<button class="chip sm ${d.parentOf === j.userId ? 'on' : ''}" data-act="member-parent" data-id="${esc(j.userId)}">${esc((j.name || '').split(' ')[0])}</button>`).join('') : '<span class="note">Agrega primero juveniles</span>'}</div></div>` : ''}
    <button class="btn primary big" data-act="member-save" style="margin-top:6px">${isNew ? 'Agregar al club' : 'Guardar'}</button>
    ${!isNew ? `<button class="btn ghost" data-act="member-remove" style="margin-top:8px">Quitar del club</button>` : ''}
    ${V.memberErr ? `<p class="note err">${esc(V.memberErr)}</p>` : ''}
  </div></div>`;
}
function vClubPlans() {
  const c = myClub();
  const tiers = [
    { n: 'Club', p: '$1,490', per: '/mes', f: ['Hasta 150 miembros', 'Torneos con leaderboard en vivo', 'Academia juvenil + reportes', 'Soporte por correo'], hot: false },
    { n: 'Club Pro', p: '$2,990', per: '/mes', f: ['Miembros ilimitados', 'Todo lo de Club', 'Patrocinios por torneo (ingreso compartido)', 'Panel de talento y becas', 'Onboarding dedicado'], hot: true },
  ];
  return `<div class="sec-h"><button class="sec-link" data-act="club-back">← ${esc(c ? c.name : 'Club')}</button></div>
    <div class="sec-h" style="margin-top:2px"><h2>Plan del club</h2></div>
    <p class="note" style="margin:0 2px 12px">Lleva tu club a PARFECT. Cancela cuando quieras.</p>
    <div class="plan-list">${tiers.map(t => `<div class="plan-card ${t.hot ? 'hot' : ''}">
      ${t.hot ? '<span class="plan-tag">Recomendado</span>' : ''}
      <b class="plan-name">${t.n}</b><div class="plan-price">${t.p}<span>${t.per}</span></div>
      <ul class="plan-f">${t.f.map(x => `<li>✓ ${esc(x)}</li>`).join('')}</ul>
      <button class="btn ${t.hot ? 'primary' : ''} big" data-act="club-plan-pick" data-n="${esc(t.n)}">Activar ${esc(t.n)}</button>
    </div>`).join('')}</div>
    <p class="note" style="text-align:center;margin-top:10px">El cobro se conecta con la cuenta de pagos del club. Te contactamos para activarlo.</p>`;
}
function vInviteSheet(c) {
  const url = location.origin + location.pathname + '?club=' + c.code;
  const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=' + encodeURIComponent(url);
  return `<div class="overlay" data-act="club-invite-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Invitar al club</h2>
    <p class="auth-sub">Comparte el código o el QR. Tus socios y juveniles se unen en segundos.</p>
    <div class="inv-qr"><img src="${qr}" alt="QR" onerror="this.style.display='none'"></div>
    <div class="inv-code">Código del club<b>${esc(c.code)}</b></div>
    <button class="btn primary big" data-act="club-invite-share">Compartir invitación →</button>
  </div></div>`;
}

/* ============ Torneos del club + leaderboard en vivo ============ */
const TRN_STATUS = { open: 'Inscripción', live: 'En juego', done: 'Finalizado' };
function clubIsStaff(c, u) { const r = clubRole(c, u); return r === 'admin' || r === 'coach'; }
function tournLeaderboard(t, net) {
  const rows = (t.players || []).map(p => {
    const has = p.gross != null;
    const ph = Math.round((p.hcp || 0) * t.holes / 18);
    return { ...p, has, net: has ? p.gross - ph : null, toPar: has ? p.gross - t.par : null };
  });
  rows.sort((a, b) => { if (a.has !== b.has) return a.has ? -1 : 1; if (!a.has) return 0; return (net ? (a.net - b.net) : (a.gross - b.gross)) || (a.gross - b.gross); });
  return rows;
}
function vClubTourn() {
  const u = cur(); const c = myClub(); if (!c) return vClub();
  if (V.tournCreating) return vTournCreate(c);
  if (V.tournId) { const t = (c.tournaments || []).find(x => x.id === V.tournId); if (t) return vTournDetail(c, t, u); V.tournId = null; }
  const staff = clubIsStaff(c, u);
  const ts = (c.tournaments || []).slice().reverse();
  const cards = ts.length ? ts.map(t => {
    const lb = tournLeaderboard(t, true); const top = lb[0]; const played = lb.filter(r => r.has).length;
    return `<button class="trn-card" data-act="tourn-open" data-id="${t.id}">
      <div class="trn-card-top"><b>${esc(t.name)}</b><span class="trn-status ${t.status}">${TRN_STATUS[t.status] || t.status}</span></div>
      <span class="trn-meta">${golfIcon('flag')} ${t.holes} hoyos · ${esc(t.date || 's/f')} · ${played}/${(t.players || []).length} con score</span>
      ${top && top.has ? `<span class="trn-leader">${golfIcon('trophy')} Lidera ${esc((top.name || '').split(' ')[0])} · neto ${top.net}</span>` : ''}
    </button>`;
  }).join('') : `<p class="note" style="margin:8px 2px">Aún no hay torneos. ${staff ? 'Crea el primero para tu club.' : 'Tu club aún no crea torneos.'}</p>`;
  return `<div class="sec-h"><button class="sec-link" data-act="club-back">← ${esc(c.name)}</button></div>
    <div class="sec-h" style="margin-top:2px"><h2>Torneos</h2>${staff ? `<button class="sec-link" data-act="tourn-new">+ Crear</button>` : ''}</div>
    <div class="trn-list">${cards}</div>`;
}
function vTournCreate(c) {
  const d = V.tournDraft || { holes: 18 };
  return `<div class="sec-h"><h2>Crear torneo</h2><button class="sec-link" data-act="tourn-create-cancel">Cancelar</button></div>
    <div class="card">
      <div class="field"><label>Nombre</label><input id="trn-name" placeholder="Ej. Copa Campestre · Junio" value="${esc(d.name || '')}"></div>
      <div class="field"><label>Fecha</label><input id="trn-date" type="date" value="${esc(d.date || '')}"></div>
      <div class="field"><label>Hoyos</label><div class="chips">${[9, 18].map(h => `<button class="chip sm ${(d.holes || 18) === h ? 'on' : ''}" data-act="tourn-holes" data-h="${h}">${h} hoyos</button>`).join('')}</div></div>
      <div class="field"><label>Patrocinadores <span class="muted">(opcional, separa con comas)</span></label><input id="trn-sponsors" placeholder="Ej. Mercedes-Benz, Titleist" value="${esc(d.sponsors || '')}"></div>
      <p class="note">Formato: <b>Stroke play</b> (gross y neto). Se inscriben los miembros del club; tú capturas sus scores y el leaderboard se ordena solo.</p>
      <button class="btn primary big" data-act="tourn-create">Crear torneo ${golfIcon('trophy')}</button>
      ${V.tournErr ? `<p class="note err">${esc(V.tournErr)}</p>` : ''}
    </div>`;
}
function vTournDetail(c, t, u) {
  const staff = clubIsStaff(c, u);
  const net = V.tournNet !== false;
  const lb = tournLeaderboard(t, net);
  const rows = lb.map((r, i) => {
    const pos = r.has ? (i + 1) : '–';
    const main = r.has ? (net ? r.net : r.gross) : '–';
    const sub = r.has ? (net ? `gross ${r.gross} · ${fmtToPar(r.toPar)}` : `neto ${r.net}`) : 'sin score';
    return `<div class="trn-row ${r.userId === u.id ? 'me' : ''}">
      <span class="trn-pos ${r.has && i < 3 ? 'top' + (i + 1) : ''}">${pos}</span>
      <span class="trn-av" style="--ci:${(r.name || '').length % 6}">${clubInitials(r.name)}</span>
      <div class="trn-info"><b>${esc(r.name)}${r.role === 'junior' ? ' <span class="cl-badge jr">JR</span>' : ''}</b><span>${sub}</span></div>
      <span class="trn-score ${r.has && r.toPar <= 0 ? 'good' : ''}">${main}</span>
    </div>`;
  }).join('');
  return `<div class="sec-h"><button class="sec-link" data-act="tourn-back">← Torneos</button></div>
    <div class="card trn-head2">
      <div class="trn-h2top"><b>${esc(t.name)}</b><span class="trn-status ${t.status}">${TRN_STATUS[t.status]}</span></div>
      <span class="trn-meta">${t.holes} hoyos · Par ${t.par} · ${esc(t.date || 's/f')}</span>
      <div class="trn-toggle"><button class="chip sm ${net ? 'on' : ''}" data-act="tourn-metric" data-m="net">Neto</button><button class="chip sm ${!net ? 'on' : ''}" data-act="tourn-metric" data-m="gross">Gross</button></div>
      ${(t.sponsors && t.sponsors.length) ? `<div class="trn-sponsors"><span>Patrocinan</span>${t.sponsors.map(s => `<span class="trn-spon">${esc(s)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="card trn-board">${rows || '<p class="note">Sin jugadores inscritos.</p>'}</div>
    ${staff ? `<button class="btn primary" data-act="tourn-capture" style="margin-top:12px">${golfIcon('card')} Capturar scores</button>` : ''}
    ${(staff && lb.some(r => r.has)) ? `<button class="btn ${(typeof AI !== 'undefined' && AI.on()) ? 'ghost' : 'primary'}" data-act="tourn-report-ai" style="margin-top:8px">${(typeof AI !== 'undefined' && AI.on()) ? '✨ Reporte del torneo con IA' : `${golfIcon('trophy')} Compartir resultados`}</button>` : ''}
    ${V.tournCapture ? vTournCapture(t) : ''}
    ${V.tournReportOpen ? vTournReportSheet(t) : ''}`;
}
function vTournReportSheet(t) {
  const r = V.tournReport || {};
  const body = r.loading
    ? `<p class="aiq-birdie-load" style="justify-content:center">Birdie está redactando<span class="chat-typing"><i></i><i></i><i></i></span></p>`
    : `<p>${esc(r.text || '').replace(/\n/g, '<br>')}</p>`;
  return `<div class="overlay" data-act="tourn-report-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Reporte del torneo</h2>
    <p class="auth-sub">Redactado por Birdie · ${esc((t && t.name) || r.name || '')}.</p>
    <div class="jr-report-box">${body}</div>
    ${r.text ? `<button class="btn primary big" data-act="tourn-report-share" style="margin-top:12px">Compartir con el club →</button>` : ''}
  </div></div>`;
}
function vTournCapture(t) {
  const rows = (t.players || []).map(p => `<div class="cap-row"><span class="cap-nm">${esc(p.name)}</span><input class="cap-in" id="cap-${esc(p.userId)}" type="number" inputmode="numeric" placeholder="–" value="${p.gross != null ? p.gross : ''}"></div>`).join('');
  return `<div class="overlay" data-act="tourn-capture-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Capturar scores</h2>
    <p class="auth-sub">Score total (gross) de cada jugador. El neto se calcula con su hándicap.</p>
    <div class="cap-list">${rows}</div>
    <button class="btn primary big" data-act="tourn-save">Guardar leaderboard</button>
  </div></div>`;
}

/* ============ Academia juvenil del club ============ */
function jrData(c, id) { return (c.academy && c.academy[id]) || { plan: [], done: {} }; }
function vClubAcademy() {
  const u = cur(); const c = myClub(); if (!c) return vClub();
  if (V.jrId) { const m = (c.members || []).find(x => x.userId === V.jrId && x.role === 'junior'); if (m) return vJuniorDetail(c, m, u); V.jrId = null; }
  const jrs = (c.members || []).filter(m => m.role === 'junior');
  const ranked = jrs.slice().sort((a, b) => (a.hcp != null ? a.hcp : 99) - (b.hcp != null ? b.hcp : 99));
  const cards = ranked.length ? ranked.map((m, i) => {
    const d = jrData(c, m.userId); const N = (d.plan || []).length; const done = (d.plan || []).filter(x => d.done && d.done[x]).length; const pct = N ? Math.round(done / N * 100) : 0;
    return `<button class="jr-card" data-act="jr-open" data-id="${esc(m.userId)}">
      <span class="jr-rk ${i < 3 ? 'top' + (i + 1) : ''}">${i + 1}</span>
      <span class="trn-av" style="--ci:${(m.name || '').length % 6}">${clubInitials(m.name)}</span>
      <div class="jr-info"><b>${esc(m.name)}</b><span>${esc(m.category || 'Juvenil')} · HCP ${fmtHcp(m.hcp)}</span><span class="jr-bar"><i style="width:${pct}%"></i></span></div>
      <span class="jr-pct">${N ? pct + '%' : '—'}</span>
    </button>`;
  }).join('') : `<p class="note" style="margin:8px 2px">Aún no hay juveniles en el club. Agrégalos al roster con rol Juvenil.</p>`;
  return `<div class="sec-h"><button class="sec-link" data-act="club-back">← ${esc(c.name)}</button></div>
    <div class="sec-h" style="margin-top:2px"><h2>Academia juvenil</h2><span class="small muted">${jrs.length} juveniles</span></div>
    <p class="note" style="margin:0 2px 10px">Ranking de desarrollo · camino a la beca</p>
    <div class="jr-list">${cards}</div>`;
}
function vJuniorDetail(c, m, u) {
  const staff = clubIsStaff(c, u);
  const d = jrData(c, m.userId);
  const plan = d.plan || []; const N = plan.length; const done = plan.filter(x => d.done && d.done[x]).length; const pct = N ? Math.round(done / N * 100) : 0;
  const hitos = [
    { t: 'Plan de entrenamiento asignado', ok: N > 0 },
    { t: 'Plan de la semana completado', ok: N > 0 && done >= N },
    { t: 'Hándicap meta (bajo 12)', ok: (m.hcp != null && m.hcp < 12) },
    { t: 'Top 3 en torneo del club', ok: !!d.podium },
  ];
  const hd = hitos.filter(h => h.ok).length;
  const planRows = N ? plan.map(name => {
    const isDone = !!(d.done && d.done[name]);
    return `<div class="jr-drill ${isDone ? 'done' : ''}"><button class="jr-chk" ${staff ? `data-act="jr-drill-done" data-name="${esc(name)}"` : 'disabled'}>${isDone ? '✓' : ''}</button><span class="jr-dname">${esc(name)}</span></div>`;
  }).join('') : `<p class="note" style="margin:6px 2px">Sin plan asignado todavía.</p>`;
  return `<div class="sec-h"><button class="sec-link" data-act="jr-back">← Academia</button></div>
    <div class="card jr-head"><span class="trn-av lg" style="--ci:${(m.name || '').length % 6}">${clubInitials(m.name)}</span><div class="jr-headtx"><b>${esc(m.name)}</b><span>${esc(m.category || 'Juvenil')} · HCP ${fmtHcp(m.hcp)}</span></div></div>
    <div class="card">
      <div class="jr-prog-h"><span class="label" style="margin:0">Plan de entrenamiento</span>${staff ? `<button class="sec-link" data-act="jr-plan-open">${N ? 'Editar' : 'Asignar'}</button>` : ''}</div>
      ${N ? `<div class="jr-bigbar"><i style="width:${pct}%"></i></div><p class="note" style="margin:6px 0 4px">${done}/${N} completados</p>` : ''}
      <div class="jr-drills">${planRows}</div>
    </div>
    <div class="card">
      <span class="label">${golfIcon('flag')} Camino a la beca <span class="jr-hcount">${hd}/${hitos.length}</span></span>
      <div class="jr-hitos">${hitos.map(h => `<div class="jr-hito ${h.ok ? 'ok' : ''}"><span class="jr-hito-ic">${h.ok ? '✓' : '○'}</span>${esc(h.t)}</div>`).join('')}</div>
    </div>
    <div class="card cons-card ${m.consent ? 'ok' : ''}">
      <span class="label">${golfIcon('hand')} Consentimiento de los padres</span>
      ${m.consent
      ? `<p class="note" style="margin:4px 0 0">✓ Autorizado por <b>${esc(m.consent.by)}</b> · ${esc(m.consent.date)}</p>`
      : `<p class="note" style="margin:4px 0 10px">Pendiente. Requerido para procesar los datos del menor.</p>${staff ? `<button class="btn" data-act="jr-consent-open">Registrar consentimiento</button>` : ''}`}
    </div>
    <div class="card">
      <span class="label">${golfIcon('card')} Reporte para padres</span>
      <p class="note" style="margin:4px 0 10px">${esc((m.name || '').split(' ')[0])} lleva <b>${done}/${N || 0}</b> ejercicios y <b>${hd}/${hitos.length}</b> hitos rumbo a la beca.</p>
      ${m.consent
      ? `<div class="jr-rep-btns">${(typeof AI !== 'undefined' && AI.on()) ? `<button class="btn primary" data-act="jr-report-ai" data-id="${esc(m.userId)}">✨ Redactar con IA</button>` : ''}<button class="btn ${(typeof AI !== 'undefined' && AI.on()) ? 'ghost' : 'primary'}" data-act="jr-report" data-id="${esc(m.userId)}">Compartir resumen →</button></div>`
      : `<button class="btn" disabled>Falta el consentimiento de los padres</button>`}
    </div>
    ${V.consentOpen ? vConsentSheet(m) : ''}
    ${V.jrPlanOpen ? vJrPlanSheet(c, m) : ''}
    ${V.jrReportOpen ? vJrReportSheet() : ''}`;
}
function vJrReportSheet() {
  const r = V.jrReport || {};
  const body = r.loading
    ? `<p class="aiq-birdie-load" style="justify-content:center">Birdie está redactando<span class="chat-typing"><i></i><i></i><i></i></span></p>`
    : `<p>${esc(r.text || '').replace(/\n/g, '<br>')}</p>`;
  return `<div class="overlay" data-act="jr-report-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Reporte para padres</h2>
    <p class="auth-sub">Redactado por Birdie con el progreso de ${esc((r.name || '').split(' ')[0])}.</p>
    <div class="jr-report-box">${body}</div>
    ${r.text ? `<button class="btn primary big" data-act="jr-report-share" style="margin-top:12px">Compartir con los padres →</button>` : ''}
  </div></div>`;
}
function vConsentSheet(m) {
  const nm = (m.name || '').split(' ')[0];
  return `<div class="overlay" data-act="jr-consent-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Consentimiento de los padres</h2>
    <p class="auth-sub">Para ${esc(nm)} (menor) necesitamos la autorización de su padre, madre o tutor.</p>
    <div class="field"><label>Nombre del padre / madre / tutor</label><input id="consent-name" placeholder="Nombre completo" value="${esc(V.consentName || '')}"></div>
    <label class="cons-check"><input type="checkbox" id="consent-ok"> Autorizo a PARFECT y al club a registrar el progreso de ${esc(nm)} con fines de su desarrollo deportivo.</label>
    <button class="btn primary big" data-act="jr-consent-save" style="margin-top:12px">Registrar consentimiento</button>
    ${V.consentErr ? `<p class="note err">${esc(V.consentErr)}</p>` : ''}
  </div></div>`;
}
function vJrPlanSheet(c, m) {
  const cat = (V.libCat && DRILL_CATS.some(x => x.id === V.libCat)) ? V.libCat : DRILL_CATS[0].id;
  const pick = V.jrPlanPick || [];
  const tabs = DRILL_CATS.map(x => `<button class="lib-tab ${x.id === cat ? 'on' : ''}" data-act="jr-plan-cat" data-c="${x.id}">${esc(x.label)}</button>`).join('');
  const list = DRILL_LIBRARY.filter(x => x.cat === cat).map(dr => {
    const on = pick.includes(dr.name);
    return `<div class="splib-item ${on ? 'on' : ''}" data-act="jr-plan-toggle" data-name="${esc(dr.name)}" role="button" tabindex="0"><span class="splib-chk">${on ? '✓' : '+'}</span><span class="splib-tx"><b>${esc(dr.name)}</b><span>${esc(dr.desc)}</span></span></div>`;
  }).join('');
  return `<div class="overlay" data-act="jr-plan-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>Plan para ${esc((m.name || '').split(' ')[0])}</h2>
    <p class="auth-sub">Elige los ejercicios de su plan${pick.length ? ' · ' + pick.length + ' elegidos' : ''}.</p>
    <div class="lib-tabs">${tabs}</div>
    <div class="splib-list">${list}</div>
    <button class="btn primary big" data-act="jr-plan-save">Guardar plan (${pick.length})</button>
  </div></div>`;
}

/* ============ Bienvenida / onboarding (primer ingreso) ============ */
function vOnboard() {
  const u = cur();
  return `<div class="onb">
    <div class="onb-top">
      <span class="lp-logo">${pLogo()}</span>
      <button class="onb-skip" data-act="finish-onboard">Saltar</button>
    </div>
    <div class="onb-body">
      <h1 class="onb-h1">¡Bienvenido,<br/><span class="lime">${esc((u.name || '').split(' ')[0])}</span>!</h1>
      <p class="onb-sub">Crea tu golfista y dinos cómo juegas. Toma 1 minuto y lo cambias cuando quieras.</p>
      <div class="onb-intro">
        <div class="onb-bird">${senseiBird('')}</div>
        <b class="onb-intro-h">¿Nuevo en el golf?</b>
        <p>Te enseñamos cómo funciona y por qué PARFECT te hace mejor: registra tus rondas, la IA encuentra tus fallas y entrenas justo lo que toca.</p>
        <button class="btn primary" data-act="onboard-academy">${golfIcon('flag')} Aprende a jugar · tour rápido →</button>
        <span class="onb-or">o arma tu perfil aquí abajo ↓</span>
      </div>
      ${vAvatarCreator(u)}
      <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">Cómo juegas</h2></div>
      <div class="card">
        <div class="field-row">
          <div class="field"><label>Hándicap</label><input id="p-hcp" type="number" step="1" value="${esc(u.hcp)}"></div>
          <div class="field"><label>Meta</label><input id="p-goal" type="number" step="1" value="${esc(u.goal)}"></div>
        </div>
        <div class="field"><label>Campo de casa</label>
          <div class="chips">${COURSE_ORDER.map(id => `<button class="chip sm ${(u.homeCourse || 'campestre') === id ? 'on' : ''}" data-act="prof-campo" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('')}</div>
        </div>
      </div>
      <div class="sec-h" style="margin-top:22px"><h2 style="font-size:16px">Cómo usar PARFECT</h2></div>
      <div class="onb-steps">
        ${[
          ['flag', 'Registra tu ronda', 'Anota fairways, greens, up & down y putts hoyo por hoyo con el botón P.'],
          ['green', 'La IA te analiza', 'En Análisis IA verás exactamente dónde pierdes golpes y qué priorizar.'],
          ['bucket', 'Entrena lo que toca', 'El AI Coach arma tu sesión según tu tiempo; o entrena libre con la biblioteca.'],
          ['trophy', 'Sube de rango', 'Cada meta cumplida desbloquea logros y baja tu hándicap.'],
        ].map((s, i) => `<div class="onb-step"><span class="onb-stepn">${i + 1}</span><span class="onb-stepic">${golfIcon(s[0])}</span><div class="onb-steptx"><b>${s[1]}</b><span>${s[2]}</span></div></div>`).join('')}
      </div>
      <button class="btn primary big" data-act="finish-onboard" style="margin-top:18px">Empezar a jugar →</button>
    </div>
  </div>`;
}

/* ============ Perfil · panel de ajustes (datos + golfista + bolsa + config) ============ */
function vProfile() {
  const u = cur();
  return `<div class="overlay panel-ov" data-act="profile-close">
    <div class="panel" data-act="noop">
      <div class="panel-head">
        <h2>Personaliza tu perfil</h2>
        <button class="panel-x" data-act="profile-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="panel-body">
        ${vAvatarCreator(u)}
        <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">Tus datos</h2></div>
        <div class="card">
          <div class="field"><label>Nombre</label><input id="p-name" value="${esc(u.name)}"></div>
          <div class="field-row">
            <div class="field"><label>Hándicap</label><input id="p-hcp" type="number" step="1" value="${esc(u.hcp)}"></div>
            <div class="field"><label>Meta</label><input id="p-goal" type="number" step="1" value="${esc(u.goal)}"></div>
          </div>
          <div class="field"><label>Campo de casa</label>
            <div class="chips">${COURSE_ORDER.map(id => `<button class="chip sm ${(u.homeCourse || 'campestre') === id ? 'on' : ''}" data-act="prof-campo" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('')}</div>
          </div>
          <button class="btn primary" data-act="profile-save">Guardar cambios</button>
        </div>
        <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">${t('sec_bag')}</h2></div>
        ${vBagEditor(u)}
        <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">${t('settings')}</h2></div>
        <div class="card">
          <div class="set-row"><span class="set-lab">${t('language')}</span><div class="chips">
            <button class="chip sm ${curLang() === 'es' ? 'on' : ''}" data-act="set-lang" data-v="es">Español</button>
            <button class="chip sm ${curLang() === 'en' ? 'on' : ''}" data-act="set-lang" data-v="en">English</button></div></div>
          <div class="set-row" style="margin-top:12px"><span class="set-lab">${t('theme')}</span><div class="chips">
            <button class="chip sm ${(S.settings && S.settings.theme) === 'light' ? '' : 'on'}" data-act="set-theme" data-v="dark">${golfIcon('peak')} ${t('dark')}</button>
            <button class="chip sm ${(S.settings && S.settings.theme) === 'light' ? 'on' : ''}" data-act="set-theme" data-v="light">${t('light')}</button></div></div>
          <div class="set-row" style="margin-top:12px"><span class="set-lab">Entorno del campo</span><div class="chips" style="flex-wrap:wrap">
            ${[['dia', '🏖️ Playa día'], ['amanecer', '🌅 Amanecer'], ['atardecer', '🌇 Atardecer'], ['noche', '🌙 Noche']].map(([e, l]) => `<button class="chip sm ${curEnv() === e ? 'on' : ''}" data-act="set-env" data-e="${e}">${l}</button>`).join('')}
          </div></div>
          <hr class="set-div">
          <p class="set-lab" style="margin-bottom:9px">Respaldo de tus datos</p>
          <div class="bk-row">
            <button class="btn ghost" data-act="export-data">⬇ Exportar copia</button>
            <button class="btn ghost" data-act="import-data">⬆ Importar copia</button>
          </div>
          <input type="file" id="import-file" accept="application/json,.json" style="display:none" onchange="parfectImport(this)">
          <p class="note">Tus datos viven en este dispositivo. Exporta una copia cada tanto para no perderlos si cambias de teléfono o limpias el navegador.</p>
          <hr class="set-div">
          <button class="btn ghost" data-act="seed-demo">${t('load_demo')}</button>
          <button class="btn danger" data-act="wipe-mine">${V.wipeArm ? t('wipe_confirm') : t('wipe')}</button>
          <button class="btn" data-act="logout">${t('logout')}</button>
          <p class="note">${t('local_note')} · ${esc(u.email)}</p>
        </div>
      </div>
    </div>
  </div>`;
}
