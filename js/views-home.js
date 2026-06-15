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

/* ---- escenas animadas tipo GIF por estadística (con bandera ondeando, estela y rebote) ---- */
function statScene(kind) {
  const bg = `<rect width="170" height="100" rx="12" fill="#0c130a"/><rect x="0.5" y="0.5" width="169" height="99" rx="12" fill="none" stroke="#16210f"/>`;
  // bandera con asta y banderín que ondea
  const flag = (x, y, h) => {
    h = h || 16; const t = y - h;
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${t}" stroke="#eef3e6" stroke-width="1.4"/><circle cx="${x}" cy="${t}" r="1.2" fill="#eef3e6"/>`
      + `<path fill="#c9f73e"><animate attributeName="d" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" values="M${x} ${t} L${x + 11} ${t + 1.4} L${x} ${t + 5} Z;M${x} ${t} L${x + 11} ${t + 3.8} L${x} ${t + 5} Z;M${x} ${t} L${x + 11} ${t + 1.4} L${x} ${t + 5} Z"/></path>`;
  };
  if (kind === 'fw') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <path d="M68 100 L102 100 L93 32 L77 32 Z" fill="#2f6b39"/><path d="M77 32 L93 32 L92.4 28 L77.6 28 Z" fill="#3a8043"/>
    <path d="M74.6 58 L95.4 58 L94.7 50 L75.3 50 Z" fill="#357a3d" opacity="0.5"/><path d="M72.6 78 L97.4 78 L96.6 70 L73.4 70 Z" fill="#357a3d" opacity="0.38"/>
    <ellipse cx="85" cy="28" rx="16" ry="7.5" fill="#57b15c"/><ellipse cx="85" cy="27" rx="9" ry="3.6" fill="#6cc471" opacity="0.65"/>
    <circle cx="85" cy="26" r="1.8" fill="#06120a"/>${flag(85, 26, 14)}
    <ellipse cx="85" cy="62" rx="2" ry="1" fill="#c9f73e" opacity="0"><animate attributeName="rx" values="2;2;9;12" keyTimes="0;.5;.62;.7" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.8;0" keyTimes="0;.5;.56;.7" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle cx="20" cy="90" r="2" fill="#7c8a70" opacity="0"><animate attributeName="opacity" values="0;.6;0;0" keyTimes="0;.05;.18;1" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="90;83;81;81" keyTimes="0;.07;.18;1" dur="3s" repeatCount="indefinite"/></circle>
    <circle r="2.4" fill="#fff" opacity="0.22"><animateMotion dur="3s" begin="-0.07s" repeatCount="indefinite" path="M16 92 Q 48 -10 85 62" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    <circle r="4" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -10 85 62" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
  </svg>`;
  if (kind === 'gir') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="50" rx="36" ry="19" fill="#2f6b39"/><ellipse cx="85" cy="48" rx="24" ry="11.5" fill="#57b15c"/><ellipse cx="80" cy="45" rx="12" ry="5" fill="#6cc471" opacity="0.5"/>
    <circle cx="85" cy="44" r="2.2" fill="#06120a"/>${flag(85, 44, 15)}
    <ellipse cx="78" cy="50" rx="2" ry="1" fill="#c9f73e" opacity="0"><animate attributeName="rx" values="2;2;8;11" keyTimes="0;.44;.56;.66" dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.8;0" keyTimes="0;.44;.5;.66" dur="3.2s" repeatCount="indefinite"/></ellipse>
    <circle r="3.4" fill="#c9f73e" opacity="0.85"><animateMotion dur="3.2s" begin="1.5s" repeatCount="indefinite" path="M156 92 Q 124 -10 92 50" keyPoints="0;1;1;1" keyTimes="0;.44;.9;1" calcMode="linear"/></circle>
    <circle r="2.3" fill="#fff" opacity="0.2"><animateMotion dur="3.2s" begin="-0.06s" repeatCount="indefinite" path="M14 94 Q 38 -8 78 50" keyPoints="0;1;1;1" keyTimes="0;.44;.9;1" calcMode="linear"/></circle>
    <circle r="3.8" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3.2s" repeatCount="indefinite" path="M14 94 Q 38 -8 78 50" keyPoints="0;1;1;1" keyTimes="0;.44;.9;1" calcMode="linear"/></circle>
  </svg>`;
  if (kind === 'ud') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="106" cy="52" rx="34" ry="16" fill="#2f6b39"/><ellipse cx="106" cy="50" rx="22" ry="10" fill="#57b15c"/><ellipse cx="103" cy="48" rx="11" ry="4" fill="#6cc471" opacity="0.45"/>
    <circle cx="108" cy="46" r="2.2" fill="#06120a"/>${flag(108, 46, 15)}
    <ellipse cx="30" cy="76" rx="20" ry="8" fill="#cdb985"/><ellipse cx="30" cy="74" rx="14" ry="5" fill="#e2d09b" opacity="0.7"/><path d="M18 74 q5 -3 10 -1 q6 2 12 -1" fill="none" stroke="#b9a36a" stroke-width="0.8" opacity="0.6"/>
    <g opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.07;.22;1" dur="3.4s" repeatCount="indefinite"/><circle cx="26" cy="70" r="1.3" fill="#e2d09b"/><circle cx="32" cy="68" r="1.1" fill="#e2d09b"/><circle cx="29" cy="66" r="1" fill="#e2d09b"/><circle cx="35" cy="71" r="1" fill="#e2d09b"/></g>
    <circle cx="108" cy="46" r="3" fill="none" stroke="#c9f73e" stroke-width="1.2" opacity="0"><animate attributeName="r" values="3;3;11" keyTimes="0;.82;.96" dur="3.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.9;0" keyTimes="0;.82;.88;.96" dur="3.4s" repeatCount="indefinite"/></circle>
    <circle r="3.6" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3.4s" repeatCount="indefinite" path="M30 72 Q 64 -6 100 52 L108 46" keyPoints="0;0.85;0.85;1;1" keyTimes="0;.44;.6;.82;1" calcMode="linear"/></circle>
    <text x="100" y="92" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="9.5" font-weight="800" text-anchor="middle" opacity="0">¡Salvado!<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.82;.86;.96;1" dur="3.4s" repeatCount="indefinite"/></text>
  </svg>`;
  if (kind === 'putt') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="54" rx="48" ry="31" fill="#2f6b39"/><ellipse cx="85" cy="54" rx="34" ry="21" fill="#357a3d" opacity="0.5"/><ellipse cx="80" cy="46" rx="16" ry="8" fill="#6cc471" opacity="0.3"/>
    <path d="M85 82 L85 34" stroke="#c9f73e" stroke-width="1" stroke-dasharray="2 4" opacity="0.45"/>
    <ellipse cx="85" cy="34" rx="5" ry="2.4" fill="#000" opacity="0.55"/><circle cx="85" cy="34" r="5" fill="#06120a"/>${flag(85, 34, 16)}
    <circle cx="85" cy="34" r="5" fill="none" stroke="#c9f73e" stroke-width="1.3" opacity="0"><animate attributeName="r" values="5;5;13" keyTimes="0;.7;.86" dur="2.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.7;.76;.86" dur="2.8s" repeatCount="indefinite"/></circle>
    <circle fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="2.8s" repeatCount="indefinite" path="M85 82 L85 34" keyPoints="0;1;1" keyTimes="0;.7;1" calcMode="linear"/><animate attributeName="r" values="3.6;3.6;0;0" keyTimes="0;.68;.74;1" dur="2.8s" repeatCount="indefinite"/></circle>
  </svg>`;
  if (kind === 'par') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="52" rx="36" ry="18" fill="#2f6b39"/><ellipse cx="85" cy="50" rx="23" ry="11" fill="#57b15c"/><ellipse cx="81" cy="47" rx="11" ry="4.5" fill="#6cc471" opacity="0.45"/>
    <circle cx="85" cy="46" r="2.2" fill="#06120a"/>${flag(85, 46, 15)}
    <ellipse cx="80" cy="52" rx="2" ry="1" fill="#c9f73e" opacity="0"><animate attributeName="rx" values="2;2;8;11" keyTimes="0;.44;.56;.66" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.8;0" keyTimes="0;.44;.5;.66" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="3.8" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -10 80 52" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.52;.6;.92;1" dur="3s" repeatCount="indefinite"/>
      <rect x="68" y="18" width="34" height="16" rx="8" fill="#c9f73e"/><text x="85" y="29.4" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="900" letter-spacing="0.5" text-anchor="middle">PAR</text></g>
  </svg>`;
  if (kind === 'drive') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <path d="M0 88 Q 85 80 170 70 L170 100 L0 100 Z" fill="#2f6b39" opacity="0.55"/><path d="M0 92 Q 85 85 170 76" fill="none" stroke="#357a3d" stroke-width="3" opacity="0.4"/>
    <ellipse cx="150" cy="44" rx="15" ry="7" fill="#57b15c"/><ellipse cx="150" cy="43" rx="8" ry="3.2" fill="#6cc471" opacity="0.6"/>${flag(150, 44, 14)}
    <line x1="20" y1="84" x2="20" y2="76" stroke="#6b7a5a" stroke-width="1.4"/><ellipse cx="20" cy="85" rx="6" ry="2" fill="#3a8043"/>
    <ellipse cx="150" cy="50" rx="2" ry="1" fill="#c9f73e" opacity="0"><animate attributeName="rx" values="2;2;9;12" keyTimes="0;.55;.66;.74" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.8;0" keyTimes="0;.55;.6;.74" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="2.2" fill="#fff" opacity="0.22"><animateMotion dur="3s" begin="-0.06s" repeatCount="indefinite" path="M20 76 Q 86 -22 150 50" keyPoints="0;1;1" keyTimes="0;.55;1" calcMode="linear"/></circle>
    <circle r="4" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M20 76 Q 86 -22 150 50" keyPoints="0;1;1" keyTimes="0;.55;1" calcMode="linear"/></circle>
  </svg>`;
  if (kind === 'bird') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="58" rx="36" ry="17" fill="#2f6b39"/><ellipse cx="85" cy="56" rx="23" ry="11" fill="#57b15c"/><ellipse cx="81" cy="53" rx="11" ry="4.5" fill="#6cc471" opacity="0.45"/>
    <circle cx="85" cy="52" r="2.2" fill="#06120a"/>${flag(85, 52, 15)}
    <circle cx="85" cy="52" r="3" fill="none" stroke="#c9f73e" stroke-width="1.2" opacity="0"><animate attributeName="r" values="3;3;11" keyTimes="0;.52;.66" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.52;.58;.66" dur="3s" repeatCount="indefinite"/></circle>
    <circle r="3.6" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 50 -14 85 52" keyPoints="0;1;1;1" keyTimes="0;.5;.92;1" calcMode="linear"/><animate attributeName="r" values="3.6;3.6;0;0" keyTimes="0;.5;.56;1" dur="3s" repeatCount="indefinite"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.56;.62;.92;1" dur="3s" repeatCount="indefinite"/>
      <circle cx="85" cy="24" r="11" fill="#c9f73e"/><text x="85" y="28" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="900" text-anchor="middle">−1</text>
      <path d="M69 19 l1.6 0 M69.8 17.5 l0 1.6" stroke="#c9f73e" stroke-width="1.4" stroke-linecap="round"/><path d="M100 28 l1.6 0 M100.8 26.5 l0 1.6" stroke="#c9f73e" stroke-width="1.4" stroke-linecap="round"/></g>
  </svg>`;
  if (kind === 'score') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <line x1="18" y1="78" x2="152" y2="78" stroke="#16210f" stroke-width="1"/>
    <polyline points="18,30 50,40 82,38 114,55 146,68" fill="none" stroke="#c9f73e" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="200" stroke-dashoffset="200"><animate attributeName="stroke-dashoffset" values="200;0;0" keyTimes="0;.7;1" dur="3s" repeatCount="indefinite"/></polyline>
    <circle cx="146" cy="68" r="3.6" fill="#c9f73e" opacity="0"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.68;.74;1" dur="3s" repeatCount="indefinite"/></circle>
    <path d="M134 80 l12 0 0 -12" fill="none" stroke="#c9f73e" stroke-width="1.6" opacity="0"><animate attributeName="opacity" values="0;0;.9;.9;0" keyTimes="0;.7;.76;.94;1" dur="3s" repeatCount="indefinite"/></path>
  </svg>`;
  if (kind === 'bogey') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="92" cy="50" rx="32" ry="16" fill="#2f6b39"/><ellipse cx="92" cy="48" rx="20" ry="9" fill="#57b15c"/>
    <ellipse cx="40" cy="66" rx="17" ry="7" fill="#274d22"/><path d="M28 66 q5 -4 12 -2 q7 2 12 -2" fill="none" stroke="#1d3a1a" stroke-width="0.8" opacity="0.7"/>
    <circle cx="92" cy="46" r="2.2" fill="#06120a"/>${flag(92, 46, 15)}
    <circle r="3.8" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M150 92 Q 110 -8 40 66" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.52;.6;.92;1" dur="3s" repeatCount="indefinite"/>
      <circle cx="92" cy="22" r="11" fill="#ff9f43"/><text x="92" y="26" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">+1</text></g>
  </svg>`;
  if (kind === 'threeputt') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="54" rx="48" ry="31" fill="#2f6b39"/><ellipse cx="85" cy="54" rx="34" ry="21" fill="#357a3d" opacity="0.5"/><ellipse cx="80" cy="46" rx="15" ry="7" fill="#6cc471" opacity="0.28"/>
    <path d="M85 86 L85 30" stroke="#c9f73e" stroke-width="1" stroke-dasharray="2 4" opacity="0.4"/>
    <circle cx="85" cy="30" r="5" fill="#06120a"/>${flag(85, 30, 16)}
    <circle cx="85" cy="55" r="1.6" fill="#ff9f43" opacity="0.65"/><circle cx="85" cy="42" r="1.6" fill="#ff9f43" opacity="0.65"/>
    <circle r="3.6" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3.6s" repeatCount="indefinite" calcMode="linear" path="M85 86 L85 55 L85 42 L85 30" keyPoints="0;0.554;0.554;0.786;0.786;1;1" keyTimes="0;.26;.4;.55;.68;.84;1"/></circle>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.84;.88;.96;1" dur="3.6s" repeatCount="indefinite"/>
      <circle cx="116" cy="26" r="10" fill="#ff9f43"/><text x="116" y="29.6" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="900" text-anchor="middle">×3</text></g>
  </svg>`;
  return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="85" cy="54" rx="48" ry="31" fill="#2f6b39"/><ellipse cx="85" cy="54" rx="34" ry="21" fill="#357a3d" opacity="0.5"/><ellipse cx="80" cy="46" rx="15" ry="7" fill="#6cc471" opacity="0.28"/>
    <circle cx="85" cy="32" r="5" fill="#06120a"/>${flag(85, 32, 16)}
    <circle cx="85" cy="40" r="12" fill="none" stroke="#c9f73e" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.55"/>
    <circle r="3.6" fill="#fff" stroke="#0a0f08" stroke-width="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M85 86 L85 41" keyPoints="0;1;1" keyTimes="0;.62;1" calcMode="linear"/></circle>
    <text x="85" y="94" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="800" text-anchor="middle" opacity="0">dada<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.62;.68;.96;1" dur="3s" repeatCount="indefinite"/></text>
  </svg>`;
}
/* reel horizontal de stats animadas (scroll automático infinito) */
function statReel(cards) {
  const set = cards.map(([k, v, t, cls, sub]) => `<div class="reel-card${cls ? ' ' + cls : ''}"><div class="reel-scene">${statScene(k)}</div><div class="reel-meta"><b>${v}</b><span>${esc(t)}</span>${sub ? `<span class="reel-sub">${esc(sub)}</span>` : ''}</div></div>`).join('');
  return `<div class="reel"><div class="reel-track">${set}${set}</div></div>`;
}
/* tus estadísticas: gifs animados, en % y sobre 18 hoyos */
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
  const per = (a, b, n) => `${Math.round(a / (b || 1) * n)} de ${n}`;
  const gir18 = Math.round(gir / girTot * 18), miss18 = Math.max(1, 18 - gir18);
  return statReel([
    ['par', pct(sd.par, tot) + '%', 'Pares', '', per(sd.par, tot, 18)],
    ['bird', pct(sd.eagle + sd.birdie, tot) + '%', 'Birdies o mejor', '', per(sd.eagle + sd.birdie, tot, 18)],
    ['bogey', pct(sd.bogey + sd.dbl, tot) + '%', 'Bogeys o peor', 'warn', per(sd.bogey + sd.dbl, tot, 18)],
    ['threeputt', pct(threeP, girTot) + '%', '3-putts', 'warn', per(threeP, girTot, 18)],
    ['gir', pct(gir, girTot) + '%', 'Greens · GIR', '', `${gir18} de 18`],
    ['fw', pct(fw, fwTot) + '%', 'Fairways', '', per(fw, fwTot, 14)],
    ['ud', pct(scr, scrTot) + '%', 'Up & down', '', `${Math.round(pct(scr, scrTot) / 100 * miss18)} de ${miss18}`],
  ]);
}
/* accesos rápidos en scroll infinito */
function vQuickActions() {
  const acts = [
    ['quick-round', 'flag', 'Empezar ronda'],
    ['go-entreno', 'bucket', 'Drills'],
    ['go-diag', 'card', 'Estadísticas'],
    ['go-trofeos', 'trophy', 'Trofeos'],
    ['go-clubs', 'club', 'Mi bolsa'],
    ['profile-open', 'green', 'Mi perfil'],
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
    [fmtToPar(agg.bestToPar), 'Mejor vuelta'],
    [fmtToPar(Math.round(agg.avgToPar)), 'Promedio'],
    [agg.putts18.toFixed(0), 'Putts/ronda'],
  ];
  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:25px">Mis números</h2><span class="small muted">tu juego y tu equipo</span></div>
    <div class="kpi-band">${kpis.map(([v, t]) => `<div class="kpi"><b>${v}</b><span>${t}</span></div>`).join('')}</div>
    <div class="bag-feat">
      <div class="card bag-card"><span class="label">${golfIcon('club')} Carry de driver</span><b class="bag-big">${driverY}<em> yds</em></b></div>
      <div class="card bag-card"><span class="label">${golfIcon('flag')} Tu palo más certero</span><b class="bag-name">${esc(best.name)}</b><span class="bag-sub">${best.e}% de efectividad</span></div>
    </div>
    <div class="sec-h" style="margin-top:16px"><h2 style="font-size:18px">Mi bolsa</h2><span class="small muted">carry y efectividad por palo</span></div>
    <div class="reel bag-reel"><div class="reel-track">${tiles}${tiles}</div></div>`;
}

/* historial: elige campo (3) y tarjeta guardada */
function vLastRound(rounds) {
  // agrupar rondas por campo real (con su diseño/curvas), en orden más reciente primero
  const byCourse = {};
  for (const r of rounds) {
    if (!r.courseId || !COURSES[r.courseId]) continue;
    (byCourse[r.courseId] = byCourse[r.courseId] || []).push(r);
  }
  const available = COURSE_ORDER.filter(id => byCourse[id] && byCourse[id].length);

  // sin campos reales (datos antiguos): mostrar última ronda simple
  if (!available.length) {
    const r = rounds[0];
    if (!r) return '';
    const set = r.holes.map((hh, i) => lrHoleCard(hh, i, null)).join('');
    return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:25px">Historial</h2><span class="small muted">${esc(r.course)} · ${fmtDate(r.date)}</span></div>
      <div class="reel reel-swipe"><div class="reel-track">${set}</div></div>`;
  }

  // campo seleccionado (con fallback al campo de la ronda más reciente)
  const recent = rounds.find(r => r.courseId && COURSES[r.courseId]);
  let cid = (V.homeCid && byCourse[V.homeCid]) ? V.homeCid : (recent ? recent.courseId : available[0]);
  const list = byCourse[cid];
  const r = list.find(x => x.id === V.homeRid) || list[0];
  const courseName = COURSES[cid].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');

  const chips = COURSE_ORDER.map(id => {
    const has = byCourse[id] && byCourse[id].length;
    const name = COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
    return `<button class="chip sm ${id === cid ? 'on' : ''}" data-act="home-course" data-c="${id}"${has ? '' : ' disabled style="opacity:.38"'}>${esc(name)}${has ? ` · ${has}` : ''}</button>`;
  }).join('');

  // historial de tarjetas guardadas de este campo (elige cuál ver)
  const hist = list.map(rr => {
    const ss = Stats.roundStats(rr);
    return `<button class="lr-card ${rr.id === r.id ? 'on' : ''}" data-act="home-round" data-id="${rr.id}">
      <span class="lr-date">${fmtDate(rr.date)}</span><b class="lr-sc">${ss.score}</b><em class="lr-tp">${fmtToPar(ss.toPar)}</em>
    </button>`;
  }).join('');

  const card = (hh, i) => lrHoleCard(hh, i, (COURSES[cid] && COURSES[cid].holes[i]) ? COURSES[cid].holes[i] : null);
  const set = r.holes.map(card).join('');

  return `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:25px">Historial</h2><span class="small muted">elige campo y tarjeta</span></div>
    <div class="chips lr-chips">${chips}</div>
    <div class="card lr-pick">
      <div class="lr-pick-head"><b>${esc(courseName)}</b><span class="small muted">${fmtDate(r.date)} · desliza los hoyos →</span></div>
      <div class="lr-hist">${hist}</div>
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

function vDashboard() {
  const u = cur();
  const rounds = myRounds();
  const agg = Stats.aggregate(rounds);
  const head = `<div class="greet">
    <p class="hi">${greeting()}</p>
    <h1>Hola, ${esc(u.name.split(' ')[0])}!</h1>
    <p class="hcp">Hándicap ${fmtHcp(u.hcp)} · meta ${fmtHcp(u.goal)}</p>
  </div>`;

  if (!agg) {
    return head + `<div class="card empty">
      <div class="e-ico">${golfIcon('flag')}</div>
      <h3>Aquí empieza tu cuaderno de juego</h3>
      <p>Registra una ronda y PARFECT analiza cada tiro: calles, greens, putts y dónde estás ganando o dejando golpes.</p>
      <button class="btn primary" data-act="quick-round">${logoMark(15)} Registrar mi primera ronda</button>
      <button class="btn ghost" data-act="seed-demo">Ver con datos de ejemplo</button>
    </div>`;
  }

  return head + `
    ${vQuickActions()}
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:25px">Tus estadísticas</h2><span class="small muted">% sobre 18 hoyos →</span></div>
    ${vStatReel(rounds, agg)}
    ${vMisNumeros(u, agg)}
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
    <span class="label">${golfIcon('club')} Mi bolsa · carry por palo</span>
    <p class="note" style="margin-top:0;margin-bottom:6px">Define el carry real de cada palo en yardas. Deja en blanco los que no lleves.</p>
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
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">${golfIcon('flag')} Beneficios y aliados</h2></div>
    <div class="card">
      <p class="note" style="margin-top:0;margin-bottom:8px">Próximamente: ofertas exclusivas de clubes, tiendas y profesionales para jugadores PARFECT.</p>
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
      <p class="note">Cuenta local: ${esc(u.email)} · tus datos se guardan solo en este dispositivo.</p>
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
