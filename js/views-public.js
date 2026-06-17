/* ============ Vistas públicas: Landing + Auth ============ */

/* dimples del balón (rejilla dentro del círculo) */
function ballDimples() {
  let d = '';
  for (let r = -4; r <= 4; r++) for (let c = -4; c <= 4; c++) {
    const x = 100 + c * 19 + (r % 2 ? 9.5 : 0), y = 100 + r * 19;
    if (Math.hypot(x - 100, y - 100) < 80) d += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4.3"/>`;
  }
  return d;
}
function golfBallSVG() {
  return `<svg viewBox="0 0 200 200" class="lp-ballsvg" aria-hidden="true">
    <defs>
      <radialGradient id="bg-ball" cx="37%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffffff"/><stop offset="42%" stop-color="#eef2f3"/>
        <stop offset="76%" stop-color="#a9b3b5"/><stop offset="100%" stop-color="#4c5658"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#bg-ball)"/>
    <g fill="#8b9698" opacity="0.30">${ballDimples()}</g>
    <ellipse cx="70" cy="58" rx="30" ry="20" fill="#fff" opacity="0.55"/>
    <circle cx="100" cy="100" r="89" fill="none" stroke="rgba(124,194,74,0.55)" stroke-width="1.5"/>
  </svg>`;
}

/* tarjetas de drills animados (reel para la landing) */
function lpDrillCards() {
  const drills = [
    ['Gate drill', 'putting', 'Putt', 'Centra la cara de tu putter'],
    ['Escalera de distancias', 'approach', 'Approach', 'Domina tus carries'],
    ['Up & down', 'short', 'Juego corto', 'Salva el par desde cualquier lie'],
    ['14 fairways a presión', 'driving', 'Salida', 'Encuentra la calle bajo presión'],
    ['Splash de bunker', 'short', 'Bunker', 'Sal de la arena al primer intento'],
    ['Lag putting', 'putting', 'Putt largo', 'Acaba con los 3-putts'],
  ];
  return drills.map(([name, area, tag, sub]) => `<div class="reel-card lp-drillcard">
    <div class="reel-scene">${drillScene(name, area)}</div>
    <div class="lp-drillmeta"><span class="lp-drilltag">${tag}</span><b>${esc(name)}</b><p>${esc(sub)}</p></div>
  </div>`).join('');
}

/* gráficos animados (3D) para las tarjetas de la landing */
function lpFeatArt(kind) {
  if (kind === 'round') return `<svg class="lpa" viewBox="0 0 96 78" aria-hidden="true">
    <defs><radialGradient id="lpaGreen" cx="42%" cy="32%" r="72%"><stop offset="0" stop-color="#b6ec74"/><stop offset="1" stop-color="#3f9d44"/></radialGradient></defs>
    <ellipse cx="48" cy="60" rx="40" ry="10" fill="url(#lpaGreen)"/>
    <ellipse cx="58" cy="56" rx="4.5" ry="1.8" fill="#16401c"/>
    <g class="lpa-flag"><line x1="58" y1="55" x2="58" y2="22" stroke="#2a3550" stroke-width="3" stroke-linecap="round"/><path d="M58 22 L79 27 L58 32 Z" fill="#ff5a4d"/></g>
    <circle class="lpa-ball" cx="18" cy="58" r="5.5" fill="#fff" stroke="#cdd5d7" stroke-width="1"/>
  </svg>`;
  if (kind === 'stats') return `<svg class="lpa lpa-app" viewBox="0 0 96 78" aria-hidden="true">
    <defs><linearGradient id="lpaHero2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6e673"/><stop offset="1" stop-color="#74b352"/></linearGradient></defs>
    <rect x="7" y="5" width="82" height="68" rx="11" fill="#ffffff"/>
    <rect x="7" y="5" width="82" height="68" rx="11" fill="none" stroke="#e7eddd" stroke-width="1.2"/>
    <rect x="12" y="10" width="72" height="19" rx="6" fill="url(#lpaHero2)"/>
    <text x="18" y="24.5" font-family="Inter,Arial" font-size="13" font-weight="900" fill="#fff">7</text>
    <rect x="29" y="14" width="32" height="3" rx="1.5" fill="rgba(255,255,255,.7)"/>
    <rect x="29" y="20" width="22" height="3" rx="1.5" fill="rgba(255,255,255,.45)"/>
    <rect x="12" y="34" width="22" height="35" rx="6" fill="#f4f8ee"/>
    <rect x="37" y="34" width="22" height="35" rx="6" fill="#f4f8ee"/>
    <rect x="62" y="34" width="22" height="35" rx="6" fill="#f4f8ee"/>
    <text x="23" y="50" text-anchor="middle" font-family="Inter,Arial" font-size="11" font-weight="900" fill="#1f3d12">60</text>
    <text x="48" y="50" text-anchor="middle" font-family="Inter,Arial" font-size="11" font-weight="900" fill="#1f3d12">52</text>
    <text x="73" y="50" text-anchor="middle" font-family="Inter,Arial" font-size="11" font-weight="900" fill="#1f3d12">49</text>
    <rect x="16" y="59" width="14" height="4" rx="2" fill="#e0e8d6"/>
    <rect x="41" y="59" width="14" height="4" rx="2" fill="#e0e8d6"/>
    <rect x="66" y="59" width="14" height="4" rx="2" fill="#e0e8d6"/>
    <rect class="lpa-fill lpf1" x="16" y="59" width="8.4" height="4" rx="2" fill="#6cc04a"/>
    <rect class="lpa-fill lpf2" x="41" y="59" width="7.3" height="4" rx="2" fill="#46b0e0"/>
    <rect class="lpa-fill lpf3" x="66" y="59" width="6.9" height="4" rx="2" fill="#f0a93a"/>
  </svg>`;
  if (kind === 'ai') return `<svg class="lpa" viewBox="0 0 96 78" aria-hidden="true">
    <circle class="lpa-ring lpar1" cx="48" cy="40" r="27" fill="none" stroke="#46b0e0" stroke-width="3.5"/>
    <circle class="lpa-ring lpar2" cx="48" cy="40" r="17" fill="none" stroke="#46b0e0" stroke-width="3.5"/>
    <circle cx="48" cy="40" r="6.5" fill="#46b0e0"/>
    <circle class="lpa-hit" cx="48" cy="40" r="5.5" fill="#fff" stroke="#cdd5d7" stroke-width="1"/>
  </svg>`;
  return `<svg class="lpa" viewBox="0 0 96 78" aria-hidden="true">
    <g class="lpa-trophy"><path d="M34 22h28v9c0 9-6 16-14 16s-14-7-14-16z" fill="#f7d04a"/><rect x="45" y="47" width="6" height="8" fill="#c98a1e"/><rect x="37" y="55" width="22" height="5" rx="2" fill="#c98a1e"/><path d="M34 25c-6 0-9 3-8 8 1 4 5 6 9 6v-4c-3 0-5-2-5.5-4.5" fill="none" stroke="#f7d04a" stroke-width="3"/><path d="M62 25c6 0 9 3 8 8-1 4-5 6-9 6v-4c3 0 5-2 5.5-4.5" fill="none" stroke="#f7d04a" stroke-width="3"/></g>
    <circle class="lpa-spark lpas1" cx="26" cy="20" r="2.6" fill="#7cc24a"/><circle class="lpa-spark lpas2" cx="71" cy="17" r="2.2" fill="#46b0e0"/><circle class="lpa-spark lpas3" cx="73" cy="42" r="2.6" fill="#ff6a88"/>
  </svg>`;
}

/* maqueta de teléfono con una pantalla REAL de la app (usa los mismos componentes) */
/* chrome de iPhone nuevo: Dynamic Island + botones laterales */
const lpPhoneChrome = `<span class="lp-phone-btn lp-btn-vol"></span><span class="lp-phone-btn lp-btn-pow"></span><span class="lp-phone-island"></span>`;
function lpPhone(scr, cls) {
  return `<div class="lp-phone ${cls || ''}">${lpPhoneChrome}<div class="lp-phone-scr">${scr}</div></div>`;
}
/* teléfono que muestra un screenshot real de assets/ si existe; si no, renderiza el componente */
function lpPhoneShot(imgFile, comp, cls) {
  return `<div class="lp-phone ${cls || ''}">${lpPhoneChrome}<div class="lp-phone-scr">
    <img class="lp-shotimg" src="assets/${imgFile}" alt="" onload="if(this.naturalWidth){var c=this.parentElement.querySelector('.lp-shotcomp');if(c)c.style.display='none'}else{this.remove()}" onerror="this.remove()">
    <div class="lp-shotcomp">${comp}</div>
  </div></div>`;
}
/* pantalla real: renderiza componentes reales de la app, escalados dentro del teléfono */
function lpReal(inner) { return `<div class="lp-realscr"><div class="lp-realwrap">${inner}</div></div>`; }
function lpScrStats() {
  const rings = [['fw', 61, 'Fairways'], ['gir', 53, 'GIR'], ['ud', 51, 'Up & down']]
    .map(([k, p, l]) => (typeof pstSceneStatic === 'function') ? pstSceneStatic(k, p, l) : '').join('');
  const tiles = [['Putts / ronda', '30', 'putter'], ['Birdie o mejor', '8%', 'flag'], ['Bogey o peor', '31%', 'green'], ['Pares', '60%', 'flag']]
    .map((t, i) => `<div class="pst-tile" style="--i:${i}"><span class="pst-th"><span class="pst-ic">${golfIcon(t[2])}</span></span><b class="pst-val">${t[1]}</b><span class="pst-lab">${t[0]}</span></div>`).join('');
  return lpReal(`<div class="pl-hero" style="background:linear-gradient(135deg,#2f6d34,#1c4a23)"><div class="pl-hero-txt"><span class="pl-hero-lab">Demo PARFECT · Élite</span><div class="pl-hero-num">7.2</div><span class="pl-hero-sub">Hándicap · Campestre</span></div></div><div class="pst-rings">${rings}</div><div class="pst-grid">${tiles}</div>`);
}
function lpScrPlay() {
  const tiles = [['fw', true, 'Calle'], ['gir', true, 'Green'], ['ud', false, 'Up & down']]
    .map(([k, on, l]) => `<button class="hs-tile ic-${k} ${on ? 'on' : ''}"><div class="hs-art">${(typeof chkScene === 'function') ? chkScene(k, on) : ''}</div><span class="hs-lab">${l}</span><span class="hs-box">${on ? '✓' : ''}</span></button>`).join('');
  return lpReal(`<div class="lpsr-hb"><span class="lpsr-hb-c">Campestre · Azules</span><div class="lpsr-hb-r"><b>Hoyo 3</b><span>Par 4 · 380 yds</span></div></div><div class="hs-tiles">${tiles}</div>`);
}
function lpScrCoach() {
  return lpReal(`<div class="lps-rhd"><b>Análisis IA</b><span>10 rondas</span></div>
    <div class="diag-cta" style="margin:0"><span class="diag-cta-ic">${golfIcon('green')}</span><h2 class="diag-cta-h">Tu coach IA está listo</h2><p class="diag-cta-p">La IA cruza tus 162 hoyos y 10 rondas para encontrar dónde se te van los golpes y qué entrenar.</p><button class="btn primary big">${golfIcon('flag')} Generar análisis IA</button></div>`);
}
function lpScrRondas() {
  const round = (course, date, score, toPar, fw, gir, ud) => `<div class="lps-rd">
    <div class="lps-rd-top"><div class="lps-rd-info"><b>${course}</b><span>${date}</span></div><div class="lps-rd-sc"><b>${score}</b><small>${toPar}</small></div></div>
    <div class="pst-rings lps-rd-rings">${pstSceneStatic('fw', fw, 'Fairways')}${pstSceneStatic('gir', gir, 'GIR')}${pstSceneStatic('ud', ud, 'Up & down')}</div>
  </div>`;
  return lpReal(`<div class="lps-rhd"><b>Tus rondas</b><span>10 registradas</span></div>${round('Tres Marías', '17 jun · 27 hoyos', '115', '+7', 67, 59, 73)}${round('Campestre', '12 jun · 18 hoyos', '74', '+2', 64, 56, 63)}`);
}
function lpScrLogros() {
  const t = (name, sub, on) => `<div class="lps-troph ${on ? 'on' : ''}"><span class="lps-tr-ic">🏆</span><b>${name}</b><span>${sub}</span></div>`;
  return lpReal(`<div class="lps-rhd"><b>Logros</b><span>🏆 6 / 8</span></div><div class="lps-trophs">${t('Maestro de Fairways', '✓ Desbloqueado', 1)}${t('Guardián del Green', 'vas 57% · meta 58%', 0)}${t('Mago del Up & Down', '✓ Desbloqueado', 1)}${t('Hechicero del Putt', '✓ Desbloqueado', 1)}</div>`);
}
function lpScrSocial() {
  const rows = [['1', 'Rodrigo Pérez', '−4'], ['2', 'Diego Salinas', '−1'], ['3', 'Demo (tú)', '+2', 1], ['4', 'Andrés Gil', '+4'], ['5', 'Mariana Ortiz', '+6']];
  return lpReal(`<div class="lps-rhd"><b>Torneo en juego 🏆</b><span>Termina en 2 días</span></div>
    <div class="lps-board">
      <div class="lps-board-hd"><b>Copa Parfect · Junio</b><span>Campestre</span></div>
      ${rows.map(([pos, name, sc, me]) => `<div class="lps-brow ${me ? 'me' : ''}"><span class="lps-bpos">${pos}</span><span class="lps-bname">${name}</span><span class="lps-bsc ${sc.startsWith('−') ? 'good' : ''}">${sc}</span></div>`).join('')}
    </div>`);
}

/* sellos de credibilidad + logos (slots para imágenes oficiales en assets/) */
function lpTpStar() { return `<svg class="lp-tpstar" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`; }
function lpAward() { return `<svg viewBox="0 0 44 52" class="lp-award-svg" aria-hidden="true"><path d="M14 30 L9 50 L22 43 L35 50 L30 30 Z" fill="#3aa055"/><circle cx="22" cy="19" r="15" fill="#f4c534" stroke="#cc9a16" stroke-width="2"/><circle cx="22" cy="19" r="10.5" fill="none" stroke="#fff" stroke-width="1" opacity=".55"/><path d="M22 11 l2.2 4.5 4.9 .6 -3.6 3.4 .9 4.9 -4.4 -2.3 -4.4 2.3 .9 -4.9 -3.6 -3.4 4.9 -.6 Z" fill="#fff"/></svg>`; }
function lpStoreBadge() { return `<button class="store-badge" data-act="go" data-view="signup" aria-label="Descárgala en App Store"><svg class="sb-ico sb-apple" viewBox="0 0 384 512" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg><span class="sb-tx"><span class="sb-sm">Descárgala en</span><span class="sb-lg">App Store</span></span></button>`; }
function lpGooglePlay() { return `<button class="store-badge" data-act="go" data-view="signup" aria-label="Disponible en Google Play"><svg class="sb-ico gp-ico" viewBox="0 0 24 24" aria-hidden="true"><polygon fill="#00C3FF" points="3,2 13,12 3,12"/><polygon fill="#00E676" points="3,12 13,12 3,22"/><polygon fill="#FF3B30" points="3,2 21,12 13,12"/><polygon fill="#FFCD00" points="3,22 21,12 13,12"/></svg><span class="sb-tx"><span class="sb-sm">Disponible en</span><span class="sb-lg">Google Play</span></span></button>`; }
/* logo oficial: imagen en assets/ con respaldo de texto si falta el archivo */
function lpOrg(file, label, cls) { return `<span class="lp-org ${cls || ''}"><img src="assets/${file}" alt="${esc(label)}" onload="if(!this.naturalWidth){this.style.display='none';this.nextElementSibling.style.display='inline-flex'}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'"><span class="lp-org-fb">${esc(label)}</span></span>`; }
function lpPressItems() {
  return `<span class="lpm lpm-forbes">Forbes</span>
    <span class="lpm lpm-tp">${lpTpStar()}Trustpilot</span>
    <span class="lpm lpm-gd">Golf Digest</span>`;
}
function lpMarqueeItems() {
  return `<span class="lpm lpm-forbes">Forbes</span>
    <span class="lpm lpm-tp">${lpTpStar()}Trustpilot</span>
    <span class="lpm lpm-gd">Golf Digest</span>
    ${lpOrg('fmg.png', 'Federación Mexicana de Golf', 'lpm-org')}
    ${lpOrg('campestre.png', 'Club Campestre Morelia', 'lpm-org')}
    ${lpOrg('tresmarias.png', 'Tres Marías', 'lpm-org')}
    ${lpOrg('altozano.png', 'Altozano', 'lpm-org')}`;
}

function vLanding() {
  const feat = (kind, t, d) => `<div class="lp-feat reveal"><div class="lp-feat-art lpa-${kind}">${lpFeatArt(kind)}</div><h3>${t}</h3><p>${d}</p></div>`;
  // (lpFeatArt definida abajo, a nivel de módulo)
  // cielo gigante que cambia con el reloj del día: amanecer / día / atardecer / noche
  const lpH = new Date().getHours() + new Date().getMinutes() / 60;
  const phase = 'day';           // cielo siempre azul (día)
  const isNight = false;
  const lpTree = (st) => `<div class="lp-tree" style="${st}"><svg viewBox="0 0 90 96"><rect x="41" y="52" width="8" height="40" rx="3" fill="#6b4a2a"/><ellipse cx="45" cy="40" rx="34" ry="30" fill="#3a7d3a"/><ellipse cx="30" cy="46" rx="20" ry="18" fill="#479a44"/><ellipse cx="60" cy="44" rx="20" ry="18" fill="#479a44"/><ellipse cx="45" cy="30" rx="16" ry="14" fill="#57ad50"/></svg></div>`;
  const stars = isNight ? Array.from({ length: 18 }, (_, i) => `<span class="lp-star" style="left:${(i * 37 % 96) + 2}%;top:${(i * 23 % 44) + 3}%;animation-delay:${(i % 5) * 0.5}s"></span>`).join('') : '';
  const celest = isNight ? `<div class="lp-moon"></div>${stars}` : `<div class="lp-sun"></div>`;
  const bsil = (st) => `<svg class="lp-bsil" style="${st}" viewBox="0 0 30 22" aria-hidden="true"><ellipse cx="14" cy="13" rx="9" ry="7" fill="#ff5e9a"/><circle cx="22" cy="8" r="5" fill="#ff5e9a"/><path d="M26 7 l6 -1 l-5 4 Z" fill="#ffb13b"/><circle cx="23" cy="7" r="1.3" fill="#fff"/><circle cx="23.3" cy="7.2" r=".65" fill="#241018"/><path class="lp-bwing" d="M12 11 q-7 -8 -1 -12 q3 6 8 11 Z" fill="#ec4d88"/><path d="M7 17 l-4 3 M10 18 l-3 4" stroke="#ff9a3b" stroke-width="1.3" stroke-linecap="round"/></svg>`;
  const cartSvg = `<svg viewBox="0 0 64 44" aria-hidden="true"><path d="M9 16 L14 6 L39 6 L45 16 Z" fill="#ffffff"/><rect x="12" y="7" width="24" height="9" rx="1" fill="#bfe6f7"/><rect x="6" y="16" width="42" height="13" rx="3" fill="#eef6df"/><rect x="44" y="19" width="15" height="9" rx="2" fill="#a7d36a"/><circle cx="16" cy="32" r="6" fill="#33382f"/><circle cx="38" cy="32" r="6" fill="#33382f"/><circle cx="16" cy="32" r="2.4" fill="#d6dccb"/><circle cx="38" cy="32" r="2.4" fill="#d6dccb"/></svg>`;
  const lpPine = (st) => `<div class="lp-pine" style="${st}"><svg viewBox="0 0 40 64" aria-hidden="true"><rect x="17" y="48" width="6" height="15" rx="2" fill="#6b4a2a"/><polygon points="20,3 33,27 7,27" fill="#3f8f46"/><polygon points="20,15 36,42 4,42" fill="#357d3d"/><polygon points="20,27 38,56 2,56" fill="#2e7036"/></svg></div>`;
  // (carritos, casa club y ardillas retirados — ahora es un paraíso de palmeras)
  // palmera tropical que ondea (paraíso de golf)
  const bgcPalm = (x, y, s, flip, d) => `<g class="bgc-palm" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><ellipse class="bgc-gsh" cx="0" cy="2" rx="9" ry="2.2"/><path class="bgc-ptrunk" d="M-3,0 C-5,-13 3,-25 -2,-39 L2,-39 C6,-25 1,-13 3,0 Z"/><g transform="translate(0 -38)"><g class="bgc-pcrown" style="animation-delay:${d || 0}s"><path class="bgc-pleaf" d="M0,0 Q20,-3 29,9 Q21,0 1,3 Z"/><path class="bgc-pleaf" d="M0,0 Q-20,-3 -29,9 Q-21,0 -1,3 Z"/><path class="bgc-pleaf2" d="M0,-1 Q17,-11 31,-3 Q19,-1 1,3 Z"/><path class="bgc-pleaf2" d="M0,-1 Q-17,-11 -31,-3 Q-19,-1 -1,3 Z"/><path class="bgc-pleaf" d="M0,0 Q11,-15 23,-22 Q15,-9 1,2 Z"/><path class="bgc-pleaf" d="M0,0 Q-11,-15 -23,-22 Q-15,-9 -1,2 Z"/><path class="bgc-pleaf2" d="M-2,1 Q-2,-15 0,-25 Q2,-15 2,1 Z"/><circle class="bgc-pcoco" cx="-2.5" cy="2" r="1.7"/><circle class="bgc-pcoco" cx="2" cy="3" r="1.7"/><circle class="bgc-pcoco" cx="0" cy="0.5" r="1.5"/></g></g></g>`;
  // arbusto con flores tropicales (color en el campo)
  const bgcBush = (x, y, s) => `<g class="bgc-bush" transform="translate(${x} ${y}) scale(${s})"><ellipse class="bgc-bushleaf" cx="0" cy="0" rx="11" ry="6"/><ellipse class="bgc-bushleaf" cx="-6" cy="1" rx="6" ry="4"/><ellipse class="bgc-bushleaf" cx="7" cy="1" rx="6" ry="4"/><circle class="bgc-fl a" cx="-6" cy="-3" r="1.9"/><circle class="bgc-fl b" cx="-1" cy="-5" r="2"/><circle class="bgc-fl c" cx="5" cy="-3.5" r="1.8"/><circle class="bgc-fl b" cx="-3" cy="-1" r="1.5"/><circle class="bgc-fl a" cx="3" cy="-1.5" r="1.6"/><circle class="bgc-fl c" cx="9" cy="-1" r="1.4"/></g>`;
  // jardinera de flores (diseñada, a lo largo del frente del campo)
  const bgcBed = (x, y, s) => `<g class="bgc-bush" transform="translate(${x} ${y}) scale(${s})"><ellipse class="bgc-bushleaf" cx="0" cy="0" rx="22" ry="5.5"/><ellipse class="bgc-bushleaf" cx="-13" cy="1" rx="9" ry="4"/><ellipse class="bgc-bushleaf" cx="13" cy="1" rx="9" ry="4"/><circle class="bgc-fl a" cx="-18" cy="-2.5" r="1.7"/><circle class="bgc-fl b" cx="-13" cy="-4" r="1.8"/><circle class="bgc-fl c" cx="-9" cy="-2" r="1.6"/><circle class="bgc-fl b" cx="-4" cy="-3.6" r="1.7"/><circle class="bgc-fl a" cx="0" cy="-4.6" r="1.9"/><circle class="bgc-fl c" cx="4" cy="-2.4" r="1.6"/><circle class="bgc-fl b" cx="9" cy="-3.6" r="1.7"/><circle class="bgc-fl a" cx="13" cy="-2" r="1.6"/><circle class="bgc-fl c" cx="18" cy="-3" r="1.7"/></g>`;
  const liveG = `${bgcPalm(28, 236, 1.6, false, 0)}${bgcPalm(384, 238, 1.9, true, -1.6)}${bgcPalm(160, 232, 1.15, false, -3)}${bgcBed(70, 234, 1.05)}${bgcBed(232, 237, 1.15)}${bgcBed(322, 233, 1)}${bgcBed(120, 224, .8)}${bgcBed(284, 226, .78)}${bgcBush(40, 226, .8)}${bgcBush(356, 224, .85)}${bgcBush(200, 214, .72)}`;
  const lpFlag = (st, col) => `<div class="lp-cflag" style="${st}"><svg viewBox="0 0 22 30" aria-hidden="true"><ellipse cx="9" cy="27" rx="11" ry="3.4" fill="#7fbf52"/><rect x="9" y="3" width="1.7" height="22" fill="#d2d8da"/><path d="M10.7 3 L20 6.2 L10.7 9.4 Z" fill="${col || '#ff5a4d'}"/></svg></div>`;
  // mismo estilo del fondo de la app (clases bgc-*), exagerado: muchísimos árboles + greens + lagos
  const bgcTree = (x, y, s) => `<g class="bgc-tree" transform="translate(${x} ${y}) scale(${s})"><rect class="bgc-trunk" x="-2" y="-2" width="4" height="14"/><circle class="bgc-leaf" cx="0" cy="-11" r="11"/><circle class="bgc-leaf2" cx="-7" cy="-5" r="8"/><circle class="bgc-leaf2" cx="7" cy="-6" r="8"/></g>`;
  const bgcGreen = (x, y, rx, ry) => `<ellipse class="bgc-green-sh" cx="${x}" cy="${y + 4}" rx="${rx}" ry="${ry}"/><ellipse class="bgc-green" cx="${x}" cy="${y}" rx="${rx}" ry="${ry - 1}"/>`;
  const bgcFlag = (x, y, h) => `<g class="bgc-flag" transform="translate(${x} ${y})"><line x1="0" y1="0" x2="0" y2="-${h || 26}" stroke="#fff" stroke-width="2.2"/><path d="M0,-${h || 26} l13,4 -13,4z" fill="#7cc24a"/><circle cx="0" cy="0" r="2.2" fill="#0a2e16"/></g>`;
  const bgcLake = (x, y, rx, ry) => `<ellipse class="bgc-lake" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/><ellipse class="bgc-lake-sh" cx="${x - 12}" cy="${y - 3}" rx="${Math.round(rx * 0.36)}" ry="3.5"/><g class="bgc-fountain" transform="translate(${x} ${y - 5})"><rect x="-1.4" y="-12" width="2.8" height="14" fill="#9fb0b3"/><path class="bgc-fjet" d="M0,-12 q-9,-12 -16,-3 M0,-12 q9,-12 16,-3 M0,-13 v-9" fill="none" stroke="#cdeefb" stroke-width="2"/><circle class="bgc-fdrop d1" cx="-12" cy="-9" r="1.6" fill="#cdeefb"/><circle class="bgc-fdrop d2" cx="12" cy="-9" r="1.6" fill="#cdeefb"/></g>`;
  const tline = (arr) => arr.map(t => bgcTree(t[0], t[1], t[2])).join('');
  return `<div class="lp lp-ph-${phase}">
    <div class="lp-fixed" aria-hidden="true">
      <div class="lp-sky2">${celest}<span class="lp-icloud i1"></span><span class="lp-icloud i2"></span><span class="lp-icloud i3"></span></div>
      ${bsil('left:0;top:12%;animation:lpFlyR 46s linear infinite')}
      ${bsil('left:0;top:20%;transform:scale(.62);animation:lpFlyL 58s linear infinite;animation-delay:-24s')}
      ${bsil('left:0;top:7%;transform:scale(.8);animation:lpFlyR 66s linear infinite;animation-delay:-42s')}
      <div class="lp-ground">
        <svg class="lp-bgc" viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path class="bgc-far" d="M0,108 Q100,74 200,96 T400,88 L400,240 L0,240 Z"/>
          ${tline([[18, 110, .85], [42, 112, .7], [66, 108, .95], [100, 106, .8], [140, 104, .7], [186, 106, .72], [232, 104, .7], [286, 108, .78], [330, 110, .9], [366, 106, 1.05]])}
          ${bgcFlag(70, 104, 22)}
          <path class="bgc-mid" d="M0,152 Q120,114 240,142 T400,132 L400,240 L0,240 Z"/>
          ${bgcLake(92, 170, 46, 13)}
          ${bgcGreen(300, 148, 38, 13)}${bgcFlag(300, 148, 30)}
          ${bgcGreen(238, 152, 24, 9)}${bgcFlag(238, 152, 22)}
          ${tline([[14, 158, 1.05], [40, 156, .8], [54, 164, .85], [100, 156, .7], [150, 150, .68], [180, 158, .72], [218, 156, .7], [262, 150, .66], [306, 154, .74], [330, 158, .9], [352, 160, 1.2], [386, 156, 1.0]])}
          <ellipse class="bgc-sand" cx="170" cy="190" rx="26" ry="8"/>
          <ellipse class="bgc-sand" cx="64" cy="198" rx="20" ry="7"/>
          <path class="bgc-front" d="M0,202 Q140,172 280,196 T400,192 L400,240 L0,240 Z"/>
          ${bgcLake(330, 206, 40, 11)}
          ${bgcGreen(120, 214, 34, 11)}${bgcFlag(120, 214, 28)}
          <path class="bgc-fair" d="M150,240 Q175,206 230,197 Q300,185 360,150" fill="none" stroke-width="20" stroke-linecap="round"/>
          <path class="bgc-fair" d="M36,240 Q66,206 118,197 Q176,186 214,168" fill="none" stroke-width="16" stroke-linecap="round"/>
          <path class="bgc-fair" d="M250,240 Q262,212 292,202 Q330,190 366,206" fill="none" stroke-width="14" stroke-linecap="round"/>
          <path class="bgc-fair" d="M0,224 Q60,210 120,214 Q190,219 250,210" fill="none" stroke-width="12" stroke-linecap="round"/>
          ${bgcGreen(56, 196, 21, 8)}${bgcFlag(56, 196, 22)}
          ${bgcGreen(348, 172, 19, 7)}${bgcFlag(348, 172, 20)}
          ${bgcGreen(196, 178, 18, 6)}${bgcFlag(196, 178, 18)}
          ${tline([[24, 210, 1.3], [74, 216, 1.05], [120, 220, .95], [140, 224, .9], [210, 216, .7], [252, 224, .95], [300, 220, .95], [338, 222, 1.1], [360, 210, 1.3], [390, 216, 1.1]])}
          ${liveG}
        </svg>
      </div>
    </div>
    <section class="lp-intro">
      <div class="lp-intro-top">
        <span class="lp-intro-logo">${pLogo()}</span>
        <span class="lp-intro-tag">Golf Analytics · IA</span>
        <div class="lp-press2">
          <div class="lp-marquee lp-press-mq"><div class="lp-mq-track">${lpPressItems()}${lpPressItems()}</div></div>
          <div class="lp-stores">${lpStoreBadge()}${lpGooglePlay()}</div>
        </div>
      </div>
    </section>
    <section class="lp-hero2 lp-hero2-clean">
      <div class="lp-hero-copy reveal">
        <h1 class="lp-title">Baja tu hándicap<br/><span class="lime">con datos, no con suerte.</span></h1>
        <p class="lp-sub">Registra cada ronda en segundos. La IA encuentra dónde pierdes golpes y te arma el entrenamiento exacto. Tus números, tu progreso y tu plan — en una sola app.</p>
        <div class="lp-cta-row">
          <button class="lp-order" data-act="go" data-view="signup">Empezar gratis →</button>
          <button class="lp-ghostbtn" data-act="demo-account">Ver demo</button>
        </div>
        <p class="lp-trust">Gratis para empezar · Tus datos viven en tu dispositivo</p>
      </div>
      <div class="lp-heroicon reveal"><div class="lp-appicon3d"><span class="lp-appicon-glow"></span><img class="lp-appicon-img" src="assets/icon-512.png" alt="PARFECT" onerror="this.src='assets/apple-touch-icon.png'"></div></div>
    </section>

    <section class="lp-sec">
      <span class="lp-eyebrow reveal">Cómo funciona</span>
      <h2 class="lp-h2 reveal">De tu tarjeta<br/><span class="lime">a tu mejor golf.</span></h2>
      <div class="lp-flow">
        ${[['01', 'Guarda tu tarjeta', 'Apunta cada hoyo en segundos: salida, green, juego corto y putts. Tu ronda, completa.', 'round'],
           ['02', 'Analízala con IA', 'La inteligencia lee tus rondas y encuentra exactamente dónde se te van los golpes.', 'ai'],
           ['03', 'Entrena inteligente', 'Recibes la sesión que toca: el drill exacto, las reps y el tiempo. Practicas lo justo.', 'stats'],
           ['04', 'Compite y sube', 'Bajas tu hándicap, subes en el ranking y llegas más lejos.', 'trophy']]
          .map(([n, t, d]) => `<div class="lp-flowc reveal"><div class="lp-flowc-top"><span class="lp-flown">${n}</span></div><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>
    </section>

    <section class="lp-sec">
      <span class="lp-eyebrow reveal">La app por dentro</span>
      <h2 class="lp-h2 reveal">Funciones reales,<br/><span class="lime">no promesas.</span></h2>
      <div class="lp-shots">
        <div class="lp-shot reveal">${lpPhoneShot('shot-rondas.png', lpScrRondas())}<div class="lp-shot-tx"><h3>Registra y revisa tus rondas</h3><p>Cada hoyo en segundos. Fairways, greens, up & down y tu tarjeta completa, lista al instante.</p></div></div>
        <div class="lp-shot lp-shot-r reveal">${lpPhoneShot('shot-analisis.png', lpScrCoach())}<div class="lp-shot-tx"><h3>Tu coach IA</h3><p>Cruza tus rondas, encuentra dónde pierdes golpes y te dice exactamente qué entrenar.</p></div></div>
        <div class="lp-shot reveal">${lpPhoneShot('shot-logros.png', lpScrLogros())}<div class="lp-shot-tx"><h3>Sube de rango con logros</h3><p>Trofeos míticos por cada meta que alcanzas. Tu progreso, gamificado y claro.</p></div></div>
        <div class="lp-shot lp-shot-r reveal">${lpPhoneShot('shot-social.png', lpScrSocial())}<div class="lp-shot-tx"><h3>Juega con amigos</h3><p>Torneos en vivo, leaderboard y partidas por código. El golf es mejor en bola.</p></div></div>
      </div>
    </section>


    <section class="lp-sec lp-presence">
      <span class="lp-eyebrow reveal">Tu camino</span>
      <h2 class="lp-h2 reveal">Del torneo local<br/><span class="lime">a una beca afuera.</span></h2>
      <p class="lp-lead reveal" style="text-align:center;max-width:32ch;margin:0 auto 14px">Cada torneo que juegas abre puertas reales para el golfista juvenil mexicano.</p>
      <div class="lp-presgrid">
        ${[['Torneos que cuentan', 'Cada torneo suma para el ranking juvenil nacional. Tus resultados te posicionan.'],
           ['Equipos representativos', 'Los mejores forman los equipos juveniles que representan a México.'],
           ['Becas en el extranjero', 'Exposición ante universidades y academias de golf fuera del país.'],
           ['Patrocinios', 'Conecta con marcas que apuestan por las promesas del golf mexicano.'],
           ['Green fees con descuento', 'Tarifas preferentes en campos aliados para que juegues y compitas más.'],
           ['Tu progreso, medido', 'La IA registra cada ronda y te dice exactamente qué entrenar para subir.']]
          .map(([t, d]) => `<div class="lp-prescard reveal"><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>
      <div class="lp-statrow reveal" style="margin-top:18px">
        <div class="lp-stat"><b>+10</b><span>campos aliados</span></div>
        <div class="lp-stat"><b>+50</b><span>juveniles activos</span></div>
        <div class="lp-stat"><b>+1,200</b><span>hoyos registrados</span></div>
      </div>
    </section>


    <section class="lp-final reveal">
      <div class="lp-finalcard">
        <span class="lp-eyebrow">¿Listo para jugar mejor?</span>
        <h2 class="lp-h2">Tu mejor golf<br/><span class="lime">empieza hoy.</span></h2>
        <p class="lp-lead">Crea tu cuenta gratis. Toma menos de un minuto.</p>
        <button class="lp-order" data-act="go" data-view="signup">Empezar gratis →</button>
        <div class="lp-alt">
          <button data-act="go" data-view="login">Ya tengo cuenta</button>
          <span>·</span>
          <button data-act="demo-account">Ver demo (HCP 7)</button>
        </div>
      </div>
    </section>

    <footer class="lp-foot">
      <span class="lp-logo">${pLogo()}</span>
      <span>Tu app para mejorar en el golf y jugar con amigos. Tus datos viven en tu dispositivo.</span>
    </footer>
  </div>`;
}

/* marca el scroll (pausa marquee/CSS por CSS) para fluidez en móvil */
function setupScrollFlag() {
  if (window.__scrollFlag) return;
  window.__scrollFlag = true;
  let t;
  addEventListener('scroll', () => { document.body.classList.add('is-scrolling'); clearTimeout(t); t = setTimeout(() => document.body.classList.remove('is-scrolling'), 140); }, { passive: true });
}

/* deslizar con el dedo para cambiar de pestaña principal (Inicio · Ronda · Trainer · Social) */
function setupSwipeNav() {
  if (window.__swipeNav) return;
  window.__swipeNav = true;
  const ORDER = ['inicio', 'ronda', 'trainer', 'perfil'];
  const posView = () => ORDER.includes(V.view) ? V.view : (V.view === 'social' ? 'perfil' : null);
  const blocked = el => !!(el && el.closest && el.closest('.scroll, .tabs, .story-row, .reel, .reel-swipe, .cal-grid, .lib-tabs, input, textarea, select, .overlay, .sheet, .hs-tiles, [data-noswipe]'));
  let x0 = 0, y0 = 0, t0 = 0, ok = false;
  addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || !posView() || blocked(e.target)) { ok = false; return; }
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now(); ok = true;
  }, { passive: true });
  addEventListener('touchend', e => {
    if (!ok) return; ok = false;
    const t = e.changedTouches && e.changedTouches[0]; if (!t) return;
    const dx = t.clientX - x0, dy = t.clientY - y0;
    if (Date.now() - t0 > 600 || Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 1.7) return;
    const cur = posView(); if (!cur) return;
    const i = ORDER.indexOf(cur), ni = dx < 0 ? i + 1 : i - 1;
    if (ni < 0 || ni >= ORDER.length || ni === i) return;
    if (typeof go === 'function') go(ORDER[ni]);
  }, { passive: true });
}
/* pausa las animaciones SVG fuera de pantalla (clave en móvil): solo lo visible anima */
function pauseOffscreenSvgs() {
  if (window.__svgIO) window.__svgIO.disconnect();
  const io = new IntersectionObserver(es => es.forEach(e => {
    const s = e.target; try { (e.isIntersecting ? s.unpauseAnimations : s.pauseAnimations).call(s); } catch (err) {}
  }), { rootMargin: '60px' });
  document.querySelectorAll('svg').forEach(s => { try { s.pauseAnimations(); } catch (e) {} io.observe(s); });
  window.__svgIO = io;
}

/* hook post-render: anima la landing + transiciones entre vistas de la app */
function afterRender() {
  if (window.__lpClean) { window.__lpClean(); window.__lpClean = null; }
  const lp = document.querySelector('.lp');
  if (lp) { document.body.classList.remove('in-app'); initLanding(lp); window.__lastView = 'landing'; return; }
  document.body.classList.add('in-app');
  setupScrollFlag();
  setupSwipeNav();
  requestAnimationFrame(pauseOffscreenSvgs);
  // transición de entrada SOLO al cambiar de vista (no en cada re-render por tap)
  const changed = window.__lastView !== V.view;
  window.__lastView = V.view;
  if (changed) {
    const el = document.querySelector('.app-content') || (document.getElementById('root') || {}).firstElementChild;
    if (el) { el.classList.add('view-in'); animateCountUps(el); }
  }
  maybeCelebrate();
}

/* anima números clave contando hacia arriba al entrar a una vista */
function animateCountUps(root) {
  if (!root || (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  root.querySelectorAll('.pl-hero-num, .pl-chip b, .pst-val, .pst-ringnum').forEach(el => {
    if (el.dataset.cupDone) return;
    const raw = (el.textContent || '').trim();
    const m = raw.match(/^(\d+(?:\.\d+)?)(\s*%?)$/);
    if (!m) return;
    const target = parseFloat(m[1]); if (!(target > 0)) return;
    const dec = m[1].includes('.') ? 1 : 0, suf = m[2] || '';
    el.dataset.cupDone = '1';
    const dur = 750, t0 = performance.now();
    el.textContent = (dec ? '0.0' : '0') + suf;
    const step = t => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); const v = target * e; el.textContent = (dec ? v.toFixed(1) : Math.round(v)) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* confeti cuando hay algo que celebrar (marca data-celebrate en la vista) */
function maybeCelebrate() {
  const m = document.querySelector('[data-celebrate]');
  const key = m && m.getAttribute('data-celebrate');
  if (!key || window.__celebrated === key) return;
  window.__celebrated = key;
  if (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cols = ['#7cc24a', '#9ad13e', '#ffd56b', '#ff9f43', '#5aa9e0', '#ffffff'];
  const wrap = document.createElement('div');
  wrap.className = 'confetti';
  let html = '';
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 100, d = 2 + Math.random() * 1.8, delay = Math.random() * 0.6, c = cols[i % cols.length], sway = (Math.random() * 40 - 20).toFixed(0);
    html += `<i style="left:${x.toFixed(1)}%;background:${c};animation:confFall ${d.toFixed(2)}s linear ${delay.toFixed(2)}s forwards;margin-left:${sway}px"></i>`;
  }
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 4200);
}

/* celebración al completar algo (gamificado): check 3D + pájaros/águilas/bolas volando */
function celebrate(big, label) {
  if (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const wrap = document.createElement('div');
  wrap.className = 'celebrate';
  let html = `<div class="cel-check">✓${label ? `<span class="cel-lab">${label}</span>` : ''}</div>`;
  const creatures = big ? ['eagle', 'bird', 'eagle', 'bird', 'bird', 'eagle'] : ['bird', 'bird'];
  creatures.forEach((k, i) => {
    const dir = i % 2, top = 8 + Math.random() * 60, dur = 1.5 + Math.random() * 0.9, delay = Math.random() * 0.5, sz = 30 + Math.random() * 18;
    html += `<img class="cel-fly" src="assets/${k}.png" alt="" style="top:${top.toFixed(0)}%;width:${sz.toFixed(0)}px;animation:${dir ? 'celCrossR' : 'celCrossL'} ${dur.toFixed(2)}s ease-in ${delay.toFixed(2)}s forwards">`;
  });
  const nballs = big ? 7 : 3;
  for (let i = 0; i < nballs; i++) {
    const top = 30 + Math.random() * 50, dur = 1.3 + Math.random() * 0.7, delay = Math.random() * 0.4;
    html += `<span class="cel-ball" style="top:${top.toFixed(0)}%;animation:celBall ${dur.toFixed(2)}s ease-out ${delay.toFixed(2)}s forwards"></span>`;
  }
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), big ? 2600 : 1900);
}
function initLanding(root) {
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  root.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const layers = [...root.querySelectorAll('[data-speed]')];
  const introTop = root.querySelector('.lp-intro-top');
  const introSec = root.querySelector('.lp-intro');
  let mx = 0, my = 0, sy = 0, raf = 0;
  const apply = () => {
    raf = 0;
    for (const el of layers) {
      const sp = parseFloat(el.dataset.speed) || 0;
      el.style.transform = `translate3d(${(mx * sp * 18).toFixed(1)}px, ${(my * sp * 18 - sy * sp * 0.12).toFixed(1)}px, 0)`;
    }
    if (introTop) {
      const range = (introSec ? introSec.offsetHeight : innerHeight * 0.6) * 0.9;   // barrido suave: el texto se va al bajar
      const p = Math.min(1, Math.max(0, sy / Math.max(160, range)));
      introTop.style.opacity = (1 - p * 1.1).toFixed(3);
      introTop.style.transform = `translateY(${(-p * 70).toFixed(1)}px) scale(${(1 - p * 0.05).toFixed(3)})`;
    }
  };
  const sched = () => { if (!raf) raf = requestAnimationFrame(apply); };
  const onScroll = () => { sy = window.scrollY || 0; sched(); };
  const onMove = e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; sched(); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('pointermove', onMove, { passive: true });
  window.__lpClean = () => { removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); io.disconnect(); };
  apply();
}

/* ============ Auth ============ */

function vAuth(mode) {
  const vals = V.authVals || {};
  const err = V.err ? `<p class="form-err">${esc(V.err)}</p>` : '';
  if (mode === 'login') {
    return `<div class="shell no-nav fade-in auth-wrap">
      <button class="auth-back" data-act="go" data-view="landing">← Volver</button>
      <div class="auth-card">
        <h1 class="auth-h">Hola de nuevo</h1>
        <p class="auth-sub">Inicia sesión para seguir construyendo tu perfil de jugador.</p>
        <div class="field"><label>Email</label><input id="f-email" type="email" autocomplete="email" placeholder="tu@email.com" value="${esc(vals.email || '')}"></div>
        <div class="field"><label>Contraseña</label><input id="f-pass" type="password" autocomplete="current-password" placeholder="••••••••"></div>
        ${err}
        <button class="btn primary" data-act="login">Iniciar sesión</button>
        <p class="auth-alt">¿Aún no tienes cuenta? <button data-act="go" data-view="signup">Crear cuenta gratis</button></p>
      </div>
    </div>`;
  }
  return `<div class="shell no-nav fade-in auth-wrap">
    <button class="auth-back" data-act="go" data-view="landing">← Volver</button>
    <div class="auth-card">
      <h1 class="auth-h">Crea tu cuenta</h1>
      <p class="auth-sub">60 segundos y empiezas a registrar. Tus datos se guardan en este dispositivo.</p>
      <div class="field"><label>Nombre</label><input id="f-name" type="text" autocomplete="name" placeholder="¿Cómo te llamamos?" value="${esc(vals.name || '')}"></div>
      <div class="field"><label>Email</label><input id="f-email" type="email" autocomplete="email" placeholder="tu@email.com" value="${esc(vals.email || '')}"></div>
      <div class="field"><label>Contraseña</label><input id="f-pass" type="password" autocomplete="new-password" placeholder="Mínimo 4 caracteres"></div>
      <div class="field-row">
        <div class="field"><label>Hándicap actual</label><input id="f-hcp" type="number" inputmode="decimal" step="1" placeholder="ej. 18" value="${esc(vals.hcp ?? '')}"></div>
        <div class="field"><label>Meta</label><input id="f-goal" type="number" inputmode="decimal" step="1" placeholder="ej. 12" value="${esc(vals.goal ?? '')}"></div>
      </div>
      <label class="check"><input id="f-demo" type="checkbox" ${vals.demo ? 'checked' : ''}> Cargar datos de ejemplo para explorar la app</label>
      ${err}
      <button class="btn primary" data-act="signup">Crear cuenta gratis</button>
      <p class="auth-alt">¿Ya tienes cuenta? <button data-act="go" data-view="login">Iniciar sesión</button></p>
    </div>
  </div>`;
}
