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
      <button class="avatar-btn" data-act="profile-open" aria-label="Tu perfil">${avatarImg(u)}</button>
    </div>
    <div class="app-content">${content}</div>
    <nav class="nav">
      ${item('inicio', t('nav_home'))}
      ${item('ronda', t('nav_round'))}
      <button class="nav-p" data-act="quick-round" aria-label="${esc(t('qa_round'))}">P</button>
      ${item('trainer', t('nav_trainer'))}
      ${item('perfil', t('nav_profile'))}
    </nav>
    ${V.profileOpen ? vProfile() : ''}
    ${V.drillDetail ? vDrillDetail() : ''}
    ${V.drillLog ? vDrillSheet() : ''}
    ${V.bagEdit ? vBagSheet() : ''}
  </div>`;
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

/* ---- escenas animadas tipo GIF 3D por estadística (gradientes, sombras, profundidad) ---- */
function statScene(kind) {
  const bg = `<rect width="170" height="100" rx="12" fill="url(#g3dSky)"/><rect x="0.5" y="0.5" width="169" height="99" rx="12" fill="none" stroke="#1b2a14"/>`;
  // bandera con asta y banderín que ondea
  const flag = (x, y, h) => {
    h = h || 16; const t = y - h;
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${t}" stroke="#eef3e6" stroke-width="1.4"/><circle cx="${x}" cy="${t}" r="1.3" fill="#eef3e6"/>`
      + `<path fill="#c9f73e"><animate attributeName="d" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" values="M${x} ${t} L${x + 11} ${t + 1.4} L${x} ${t + 5} Z;M${x} ${t} L${x + 11} ${t + 3.8} L${x} ${t + 5} Z;M${x} ${t} L${x + 11} ${t + 1.4} L${x} ${t + 5} Z"/></path>`;
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
    <ellipse cx="85" cy="66" rx="2" ry="0.9" fill="#c9f73e" opacity="0"><animate attributeName="rx" values="2;2;10;13" keyTimes="0;.5;.62;.7" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.5;.56;.7" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="4.4" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -8 85 66" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    ${okBadge(85, 22, '3s')}
  </svg>`;
  if (kind === 'gir') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 58, 43, 20)}
    <circle cx="85" cy="52" r="2.2" fill="#06120a"/>${flag(85, 52, 16)}
    <ellipse cx="83" cy="60" rx="2" ry="0.9" fill="#c9f73e" opacity="0"><animate attributeName="rx" values="2;2;10;13" keyTimes="0;.5;.62;.7" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.5;.56;.7" dur="3s" repeatCount="indefinite"/></ellipse>
    <circle r="4.4" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M16 92 Q 48 -10 83 60" keyPoints="0;1;1;1" keyTimes="0;.5;.9;1" calcMode="linear"/></circle>
    ${okBadge(85, 22, '3s')}
  </svg>`;
  if (kind === 'ud') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    <ellipse cx="28" cy="82" rx="24" ry="10" fill="#13301a"/><ellipse cx="24" cy="79" rx="13" ry="4" fill="#1d4528" opacity="0.7"/>
    ${green3d(114, 58, 27, 13)}
    <circle cx="114" cy="53" r="2" fill="#06120a"/>${flag(114, 53, 15)}
    <path d="M30 76 Q 72 -6 106 58" fill="none" stroke="#c9f73e" stroke-width="1.6" stroke-dasharray="2 5" opacity="0.5"/>
    <circle r="4.2" ${ball}><animateMotion dur="3.2s" repeatCount="indefinite" path="M30 76 Q 72 -6 106 58 L114 53" keyPoints="0;0.85;0.85;1;1" keyTimes="0;.5;.64;.85;1" calcMode="linear"/></circle>
    ${okBadge(114, 24, '3.2s')}
  </svg>`;
  if (kind === 'putt') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 58, 50, 28)}
    <path d="M85 80 L85 40" stroke="#06120a" stroke-width="1" stroke-dasharray="2 4" opacity="0.3"/>
    <ellipse cx="85" cy="41" rx="6" ry="2.8" fill="#04100a"/><ellipse cx="85" cy="40" rx="5" ry="2.3" fill="#0c1c11"/>${flag(85, 39, 16)}
    <ellipse cx="85" cy="41" rx="6" ry="2.8" fill="none" stroke="#c9f73e" stroke-width="1.2" opacity="0"><animate attributeName="rx" values="6;6;15" keyTimes="0;.74;.88" dur="2.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.74;.8;.88" dur="2.8s" repeatCount="indefinite"/></ellipse>
    <g><animateTransform attributeName="transform" type="translate" values="0 7;0 7;0 -2;0 1;0 1" keyTimes="0;.06;.16;.24;1" dur="2.8s" repeatCount="indefinite"/>
      <rect x="84.1" y="60" width="1.9" height="22" rx="0.9" fill="#cdd5d7"/><rect x="75" y="82" width="20" height="4.4" rx="2.2" fill="#9aa6a8"/><rect x="75" y="82" width="20" height="1.6" rx="0.8" fill="#e9eef0" opacity="0.6"/></g>
    <circle ${ball}><animateMotion dur="2.8s" repeatCount="indefinite" path="M85 78 L85 41" keyPoints="0;0;1;1" keyTimes="0;.2;.76;1" calcMode="linear"/><animate attributeName="r" values="4.2;4.2;4.2;0;0" keyTimes="0;.2;.74;.8;1" dur="2.8s" repeatCount="indefinite"/></circle>
  </svg>`;
  if (kind === 'par') return `<svg viewBox="0 0 170 100" class="rscene" aria-hidden="true">${bg}
    ${green3d(85, 52, 36, 17)}
    <circle cx="85" cy="46" r="2" fill="#06120a"/>${flag(85, 46, 15)}
    <ellipse cx="80" cy="53" rx="2" ry="0.9" fill="#c9f73e" opacity="0"><animate attributeName="rx" values="2;2;9;12" keyTimes="0;.44;.56;.66" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.44;.5;.66" dur="3s" repeatCount="indefinite"/></ellipse>
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
        <path fill="#c9f73e"><animate attributeName="d" dur="0.42s" repeatCount="indefinite" values="M-5 -0.6 Q -1 -8 2.4 -0.6 Q 5.8 -8 9.4 -0.6 Q 5.8 -3 2.4 -2 Q -1 -3 -5 -0.6 Z;M-5 -0.6 Q -1 5 2.4 -0.6 Q 5.8 5 9.4 -0.6 Q 5.8 1 2.4 0.6 Q -1 1 -5 -0.6 Z;M-5 -0.6 Q -1 -8 2.4 -0.6 Q 5.8 -8 9.4 -0.6 Q 5.8 -3 2.4 -2 Q -1 -3 -5 -0.6 Z"/></path>
      </g>
    </g>
    <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.5;.58;.9;1" dur="5s" repeatCount="indefinite"/>
      <circle cx="85" cy="30" r="12" fill="url(#g3dLime)"/><text x="85" y="34.4" fill="#0a0f06" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="900" text-anchor="middle">−1</text>
      <path d="M67 24 l1.8 0 M67.9 22.2 l0 1.8" stroke="#c9f73e" stroke-width="1.5" stroke-linecap="round"/><path d="M101 35 l1.8 0 M101.9 33.2 l0 1.8" stroke="#c9f73e" stroke-width="1.5" stroke-linecap="round"/></g>
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
    <circle cx="85" cy="40" r="12" fill="none" stroke="#c9f73e" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.55"/>
    <circle r="4" ${ball}><animateMotion dur="3s" repeatCount="indefinite" path="M85 86 L85 41" keyPoints="0;1;1" keyTimes="0;.62;1" calcMode="linear"/></circle>
    <text x="85" y="94" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="800" text-anchor="middle" opacity="0">dada<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.62;.68;.96;1" dur="3s" repeatCount="indefinite"/></text>
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
    ['14 calles a presión', 'driving', 'tag_drive', 'dr_14', 'drd_14', 7],
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
  const rows = list.map(r => {
    const s = Stats.roundStats(r);
    const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
    return `<button class="pl-rr" data-act="round-detail" data-id="${r.id}">
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
  const head = `<div class="greet">
    <p class="hi">${greeting()}</p>
    <h1>${t('hi')}, ${esc(u.name.split(' ')[0])}!</h1>
  </div>`;

  if (!agg) {
    return head + `<div class="card empty">
      <div class="e-ico">${golfIcon('flag')}</div>
      <h3>${t('empty_h')}</h3>
      <p>${t('empty_p')}</p>
      <button class="btn primary" data-act="quick-round">${logoMark(15)} ${t('empty_cta')}</button>
      <button class="btn ghost" data-act="seed-demo">${t('empty_demo')}</button>
    </div>`;
  }

  return head + `
    ${vPlayerCard(u, agg)}
    ${vRecentRounds(rounds)}`;
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
  const groupName = { largo: t('grp_woods'), hierros: t('grp_irons'), wedges: t('grp_wedges') };
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
    <span class="label">${golfIcon('club')} ${t('bag_title')}</span>
    <p class="note" style="margin-top:0;margin-bottom:6px">${t('bag_note')}</p>
    ${sections}
    <button class="btn primary" data-act="save-clubs" style="margin-top:14px">${t('bag_save')}</button>
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
  const curAv = (u && u.avatar != null) ? u.avatar : 0;
  const personas = AVATARS.map((src, i) => `<button class="cre-av${i === curAv ? ' on' : ''}" data-act="set-avatar" data-i="${i}"><img src="${src}" alt="Golfista ${i + 1}" loading="lazy"></button>`).join('');
  const outfits = OUTFITS.map(o => {
    const sw = o.sw === 'rank' ? `background:conic-gradient(${RANKS.map(r => r.c).join(',')})` : `background:${o.sw}`;
    return `<button class="cre-sw${curOutfit === o.k ? ' on' : ''}" data-act="set-outfit" data-k="${o.k}" title="${o.n}"><span style="${sw}"></span></button>`;
  }).join('');
  const bgs = PROFILE_BGS.map(b => {
    const locked = idx < b.min;
    const grad = b.grad || `linear-gradient(150deg, ${RANKS[idx].c}, #5fa03f)`;
    return `<button class="cre-bg${curBg === b.k ? ' on' : ''}${locked ? ' lock' : ''}" ${locked ? '' : `data-act="set-pbg" data-k="${b.k}"`} title="${b.n}"><span style="background:${grad}"></span><em>${locked ? '🔒 ' + RANKS[b.min].n : b.n}</em></button>`;
  }).join('');
  const steps = RANKS.map((r, i) => `<div class="rank-step${i === idx ? ' on' : ''}${i < idx ? ' done' : ''}">
      <span class="rank-dot" style="background:${r.c}"></span>
      <div class="rank-meta"><b>${r.n}</b><span>HCP ${rankRange(i)}</span></div>
      ${i === idx ? '<span class="rank-now">aquí</span>' : ''}
    </div>`).join('');
  return `<div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">Crea tu golfista</h2><span class="small muted">hazlo tuyo</span></div>
    <div class="card cre-card">
      <div class="cre-preview" style="background:${profileBgGrad(u)}">${avatarImg(u, 'cre-hero', true)}<span class="cre-rank">${RANKS[idx].n}</span></div>
      <div class="cre-grp"><span class="cre-lab">Golfista</span><div class="cre-row">${personas}</div></div>
      <div class="cre-grp"><span class="cre-lab">Aura</span><div class="cre-row cre-sws">${outfits}</div></div>
      <div class="cre-grp"><span class="cre-lab">Fondo de perfil</span><div class="cre-row cre-bgs">${bgs}</div></div>
      <p class="note" style="margin:10px 2px 0">Tu golfista está apagado (gris) y <b>se enciende</b> con tus buenas jugadas; brilla más fuerte con cada rango que subes. Algunos fondos se desbloquean al mejorar tu hándicap.</p>
    </div>
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
  let statsHtml;
  if (agg) {
    const rings = [
      ['Fairways', agg.fwPct, 'tee'],
      ['GIR', agg.girPct, 'green'],
      ['Up & down', agg.scrPct, 'flag'],
    ].map(r => pstRing(r[0], r[1], r[2])).join('');
    const parPct = Math.round((sd.par || 0) / tot * 100);
    const tiles = [
      ['Putts / ronda', agg.putts18.toFixed(0), `<span class="pst-ic">${golfIcon('putter')}</span>`],
      ['3-putts / ronda', threeP, `<span class="pst-ic">${golfIcon('bucket')}</span>`],
      ['Birdies', String(sd.birdie), `<img src="assets/bird.png" class="pst-img" alt="">`],
      ['Águilas', String(sd.eagle), `<img src="assets/eagle.png" class="pst-img" alt="">`],
      ['Pares', parPct + '%', `<span class="pst-ic">${golfIcon('flag')}</span>`],
      ['Mejor vuelta', fmtToPar(agg.bestToPar), `<span class="pst-ic">${golfIcon('trophy')}</span>`],
    ].map(t => `<div class="pst-tile"><span class="pst-th">${t[2]}</span><b class="pst-val">${t[1]}</b><span class="pst-lab">${t[0]}</span></div>`).join('');
    statsHtml = `<div class="pst-rings">${rings}</div><div class="pst-grid">${tiles}</div>`;
  } else {
    statsHtml = `<div class="card pl-empty"><span class="pl-empty-ic">${golfIcon('flag')}</span><b>Aún sin estadísticas</b><p>Registra tu primera ronda y aquí verás tus fairways, greens, putts y más.</p><button class="btn primary" data-act="quick-round">Registrar ronda →</button></div>`;
  }
  return `<div class="pl-hero" style="background:${profileBgGrad(u)}">
      <div class="pl-hero-txt">
        <span class="pl-hero-lab">${esc(u.name)} · ${rk.n}</span>
        <div class="pl-hero-num">${fmtHcp(u.hcp)}</div>
        <span class="pl-hero-sub">${t('hcp_label')} · ${esc(homeName)}</span>
      </div>
      ${avatarImg(u, 'pl-hero-av')}
    </div>
    ${statsHtml}`;
}

/* anillo de progreso para una stat % */
function pstRing(label, pct, icon) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const R = 26, C = 2 * Math.PI * R, off = (C * (1 - p / 100)).toFixed(1);
  return `<div class="pst-ring">
    <div class="pst-ringsvg">
      <svg viewBox="0 0 64 64"><circle class="pst-track" cx="32" cy="32" r="${R}"/><circle class="pst-prog" cx="32" cy="32" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off}"/></svg>
      <span class="pst-ringval">${p}<i>%</i></span>
    </div>
    <span class="pst-ringlab">${esc(label)}</span>
  </div>`;
}

/* ============ Perfil (página) ============ */
function vPerfil() {
  const u = cur();
  return `<div class="sec-h"><h2>Tu perfil</h2></div>
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
    ${vLogros()}
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:16px">${t('settings')}</h2></div>
    <div class="card">
      <div class="set-row"><span class="set-lab">${t('language')}</span><div class="chips">
        <button class="chip sm ${curLang() === 'es' ? 'on' : ''}" data-act="set-lang" data-v="es">Español</button>
        <button class="chip sm ${curLang() === 'en' ? 'on' : ''}" data-act="set-lang" data-v="en">English</button></div></div>
      <div class="set-row" style="margin-top:12px"><span class="set-lab">${t('theme')}</span><div class="chips">
        <button class="chip sm ${(S.settings && S.settings.theme) === 'light' ? '' : 'on'}" data-act="set-theme" data-v="dark">${golfIcon('peak')} ${t('dark')}</button>
        <button class="chip sm ${(S.settings && S.settings.theme) === 'light' ? 'on' : ''}" data-act="set-theme" data-v="light">${t('light')}</button></div></div>
      <hr class="set-div">
      <p class="set-lab" style="margin-bottom:9px">Respaldo de tus datos</p>
      <div class="bk-row">
        <button class="btn ghost" data-act="export-data">⬇ Exportar copia</button>
        <button class="btn ghost" data-act="import-data">⬆ Importar copia</button>
      </div>
      <input type="file" id="import-file" accept="application/json,.json" style="display:none" onchange="parfectImport(this)">
      <p class="note">Tus datos viven en este dispositivo. Exporta una copia cada tanto para no perderlos.</p>
      <hr class="set-div">
      <button class="btn ghost" data-act="seed-demo">${t('load_demo')}</button>
      <button class="btn danger" data-act="wipe-mine">${V.wipeArm ? t('wipe_confirm') : t('wipe')}</button>
      <button class="btn" data-act="logout">${t('logout')}</button>
      <p class="note">${t('local_note')} · ${esc(u.email)}</p>
    </div>`;
}

/* ============ Bienvenida / onboarding (primer ingreso) ============ */
function vOnboard() {
  const u = cur();
  return `<div class="onb">
    <div class="onb-top">
      <span class="lp-logo">${logoMark(18)} PARFECT</span>
      <button class="onb-skip" data-act="finish-onboard">Saltar</button>
    </div>
    <div class="onb-body">
      <h1 class="onb-h1">¡Bienvenido,<br/><span class="lime">${esc((u.name || '').split(' ')[0])}</span>!</h1>
      <p class="onb-sub">Crea tu golfista y dinos cómo juegas. Toma 1 minuto y lo cambias cuando quieras.</p>
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
