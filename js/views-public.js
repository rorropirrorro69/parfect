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

/* logo/icono de la app (nuevo) para el hero en 3D */
function appIcon3D() {
  // icono estilo emoji ⛳: bandera roja swallowtail, asta blanca, green con hoyo y bola, cielo
  const flag = 'M88 46 Q126 39 166 58 L150 72 L166 86 Q126 91 88 82 Z';
  return `<svg viewBox="0 0 200 200" class="lp-appicon-svg" aria-hidden="true">
    <defs>
      <linearGradient id="aiBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a4d2f0"/><stop offset="100%" stop-color="#cde8f7"/></linearGradient>
      <linearGradient id="aiFlag" x1="0" y1="0" x2="1" y2=".5"><stop offset="0" stop-color="#ff6159"/><stop offset="100%" stop-color="#df352f"/></linearGradient>
      <radialGradient id="aiGrn" cx="42%" cy="32%" r="66%"><stop offset="0" stop-color="#93da60"/><stop offset="100%" stop-color="#53a23a"/></radialGradient>
      <linearGradient id="aiPole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="55%" stop-color="#eef2f3"/><stop offset="100%" stop-color="#c9d2d4"/></linearGradient>
      <radialGradient id="aiBall" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#ffffff"/><stop offset="100%" stop-color="#dfe7df"/></radialGradient>
      <radialGradient id="aiGloss" cx="30%" cy="10%" r="82%"><stop offset="0" stop-color="rgba(255,255,255,.5)"/><stop offset="46%" stop-color="rgba(255,255,255,.06)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <rect x="6" y="6" width="188" height="188" rx="46" fill="url(#aiBg)"/>
    <!-- green + sombra + hoyo -->
    <ellipse cx="98" cy="170" rx="60" ry="10" fill="#2f6a26" opacity=".2"/>
    <ellipse cx="98" cy="158" rx="66" ry="18" fill="url(#aiGrn)"/>
    <ellipse cx="84" cy="153" rx="12" ry="4.2" fill="#0e2f16"/>
    <!-- asta + finial -->
    <rect x="81.4" y="42" width="5.6" height="113" rx="2.8" fill="url(#aiPole)"/>
    <circle cx="84.2" cy="41" r="6" fill="#eef2f3"/><circle cx="82.3" cy="39.3" r="2.2" fill="#fff"/>
    <!-- bandera roja swallowtail ondeante -->
    <g class="ai-pen">
      <path d="${flag}" fill="url(#aiFlag)"/>
      <path d="M88 46 Q126 39 166 58" fill="none" stroke="#ffb4af" stroke-width="1.7" opacity=".5"/>
    </g>
    <!-- bola de golf -->
    <circle cx="124" cy="151" r="11" fill="url(#aiBall)" stroke="#b9c6bd" stroke-width="1.1"/>
    <g fill="#aab8ad" opacity=".7"><circle cx="120" cy="148" r="1.1"/><circle cx="125" cy="147" r="1.1"/><circle cx="128" cy="151" r="1.1"/><circle cx="122" cy="153" r="1.1"/><circle cx="127" cy="154" r="1.1"/></g>
    <rect x="6" y="6" width="188" height="188" rx="46" fill="url(#aiGloss)"/>
    <rect x="7.5" y="7.5" width="185" height="185" rx="44.5" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>
  </svg>`;
}
/* bandera de golf ⛳ (roja swallowtail, ondea) — para la landing */
function golfFlagSvg(cls) {
  const flag = 'M64 30 Q100 23 140 41 L124 54 L140 67 Q100 71 64 64 Z';
  return `<svg class="gflag ${cls || ''}" viewBox="0 0 152 180" aria-hidden="true">
    <defs>
      <linearGradient id="gfFlag" x1="0" y1="0" x2="1" y2=".5"><stop offset="0" stop-color="#ff6159"/><stop offset="100%" stop-color="#df352f"/></linearGradient>
      <radialGradient id="gfGrn" cx="42%" cy="32%" r="66%"><stop offset="0" stop-color="#93da60"/><stop offset="100%" stop-color="#53a23a"/></radialGradient>
      <linearGradient id="gfPole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="58%" stop-color="#eef2f3"/><stop offset="100%" stop-color="#c9d2d4"/></linearGradient>
    </defs>
    <ellipse cx="70" cy="166" rx="52" ry="10" fill="#1f5a26" opacity=".16"/>
    <ellipse cx="70" cy="159" rx="50" ry="13" fill="url(#gfGrn)"/>
    <ellipse cx="60" cy="154" rx="10.5" ry="3.4" fill="#0f351a"/>
    <rect x="57.4" y="26" width="5.6" height="130" rx="2.8" fill="url(#gfPole)"/>
    <circle cx="60.2" cy="24.4" r="6" fill="#eef2f3"/><circle cx="58.3" cy="22.8" r="2.1" fill="#fff"/>
    <g class="gflag-pen">
      <path d="${flag}" fill="url(#gfFlag)"/>
      <path d="M64 30 Q100 23 140 41" fill="none" stroke="#ffb4af" stroke-width="1.7" opacity=".5"/>
    </g>
    <circle cx="98" cy="153" r="8" fill="#fff" stroke="#bfc8c0" stroke-width="1"/>
    <g fill="#cfd6cf"><circle cx="95" cy="150" r="1"/><circle cx="100" cy="150" r="1"/><circle cx="98" cy="155" r="1"/></g>
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
/* pantalla de carga de PARFECT (splash) dentro del teléfono */
function lpScrLoading() {
  return `<div class="lp-loadscr">
    <div class="lp-load-flag">${golfFlagSvg()}</div>
    <div class="lp-load-word">PARFECT</div>
    <div class="lp-load-tag">Golf Analytics</div>
    <div class="lp-load-bar"><i></i></div>
    <div class="lp-load-foot">Cargando tu juego…</div>
  </div>`;
}
/* primer iPhone: pantalla de inicio (screenshot estático, ya sin el saludo) */
function lpIntroPhone() {
  // solo el screenshot estático (sin overlays que se muevan)
  const scr = `<img class="lp-shotimg" src="assets/shot-inicio.png?v=388" alt="" onload="if(this.naturalWidth){var c=this.parentElement.querySelector('.lp-shotcomp');if(c)c.style.display='none'}else{this.remove()}" onerror="this.remove()">
    <div class="lp-shotcomp">${lpScrStats()}</div>`;
  return lpPhone(scr);
}
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
  return lpReal(`<div class="lps-rhd"><b>Análisis</b><span>10 rondas</span></div>
    <div class="diag-cta" style="margin:0"><span class="diag-cta-ic">${golfIcon('green')}</span><h2 class="diag-cta-h">Tu análisis está listo</h2><p class="diag-cta-p">Cruzamos tus 162 hoyos y 10 rondas para encontrar dónde se te van los golpes y qué entrenar.</p><button class="btn primary big">${golfIcon('flag')} Generar análisis</button></div>`);
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

// rama de laurel reutilizable para los premios (wreath ancho, centro despejado)
function lpLaurel() {
  // puntos a lo largo de la rama izquierda, de abajo hacia arriba: [x, y, rotación, escala]
  const pts = [[28, 106, -60, .78], [20, 91, -48, .98], [15, 73, -34, 1.16], [15, 55, -20, 1.22], [20, 39, -6, 1.12], [29, 25, 10, .95], [41, 15, 26, .78]];
  const leaf = (x, y, r, s) => `<ellipse cx="${x}" cy="${y}" rx="${7.4 * s}" ry="${3 * s}" transform="rotate(${r} ${x} ${y})"/>`;
  const left = pts.map(p => leaf(p[0], p[1], p[2], p[3])).join('');
  const right = pts.map(p => leaf(130 - p[0], p[1], -p[2], p[3])).join('');
  return `<svg class="lp-laurel" viewBox="0 0 130 120" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" opacity=".9">
      <path d="M33 113 C13 93 11 57 25 18"/>
      <path d="M97 113 C117 93 119 57 105 18"/>
    </g>
    <g fill="currentColor">${left}${right}</g>
  </svg>`;
}

function lpAwardBadge(top, big, sub) {
  return `<div class="lp-aw reveal">
    <div class="lp-aw-laurels">${lpLaurel()}<div class="lp-aw-mid"><span class="lp-aw-top">${top}</span><span class="lp-aw-big">${big}</span><span class="lp-aw-sub">${sub}</span></div></div>
  </div>`;
}

function lpAwards() {
  return `<div class="lp-awards">
    ${lpAwardBadge('App Store', 'App of the Year', '2026')}
    ${lpAwardBadge('Google Play', "Editors' Choice", '2026')}
    <div class="lp-aw lp-aw-tp reveal">
      <div class="lp-aw-laurels">${lpLaurel()}<div class="lp-aw-mid"><span class="lp-aw-top">Trustpilot</span><span class="lp-aw-big lp-aw-num">4.9<span class="lp-aw-den">/5</span></span><span class="lp-aw-stars">${lpTpStar()}${lpTpStar()}${lpTpStar()}${lpTpStar()}${lpTpStar()}</span></div></div>
    </div>
  </div>`;
}

// patrocinadores / aliados en scroll infinito (logos; texto por ahora, PNG si los subes a assets/)
function lpSponsors() {
  const brands = [
    ['Campestre Morelia', 'campestre.png', 'sp-serif'],
    ['Tres Marías', 'tresmarias.png', 'sp-serif'],
    ['Altozano', 'altozano.png', ''],
    ['Fed. Mex. de Golf Infantil', 'fmgi.png', 'sp-serif'],
    ['ELECTROLIT', 'electrolit.png', 'sp-bold'],
    ['Titleist', 'titleist.png', 'sp-serif'],
    ['Aeroméxico', 'aeromexico.png', ''],
    ['Mercedes-Benz', 'mercedes.png', 'sp-serif'],
    ['BMW', 'bmw.png', 'sp-bold'],
    ['BYD', 'byd.png', 'sp-bold'],
    ['TaylorMade', 'taylormade.png', 'sp-bold'],
    ['HUBLOT', 'hublot.png', 'sp-serif'],
  ];
  const item = ([name, file, cls]) => `<span class="lp-sp ${cls}"><img src="assets/${file}" alt="${esc(name)}" onload="if(!this.naturalWidth){this.style.display='none';this.nextElementSibling.style.display='inline'}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"><span class="lp-sp-tx">${esc(name)}</span></span>`;
  const set = brands.map(item).join('');
  return `<div class="lp-sponsors reveal">
    <span class="lp-sponsors-lab">Patrocinadores y aliados</span>
    <div class="lp-marquee lp-sp-mq"><div class="lp-mq-track">${set}${set}</div></div>
  </div>`;
}

// opiniones de Trustpilot en scroll infinito
function lpReviews() {
  const stars = `<span class="lp-rv-stars">${[0, 0, 0, 0, 0].map(() => `<span class="rvbox">${lpTpStar()}</span>`).join('')}</span>`;
  const reviews = [
    ['Bajé de 18 a 12 en una temporada. Saber mis números lo cambió todo.', 'Rodrigo M.'],
    ['Por fin entiendo dónde pierdo golpes. El análisis es buenísimo.', 'Andrea G.'],
    ['La uso cada ronda. Registrar es rapidísimo y las stats son adictivas.', 'Diego S.'],
    ['Mi juego corto mejoró con los drills que me sugiere. Recomendada.', 'Mariana R.'],
    ['Mejor que apps que pagué, y se ve increíble. 10/10.', 'Luis F.'],
    ['Los logros me mantienen entrenando. Subí de rango en un mes.', 'Pablo C.'],
  ];
  const card = (q, n) => `<div class="lp-rv">${stars}<p class="lp-rv-q">"${q}"</p><div class="lp-rv-by"><span class="lp-rv-n">${n}</span><span class="lp-rv-src">${lpTpStar()}Trustpilot</span></div></div>`;
  const set = reviews.map(r => card(r[0], r[1])).join('');
  return `<div class="lp-reviews reveal">
    <div class="lp-reviews-hd">${stars}<b>4.9</b> · Excelente · +2,300 reseñas</div>
    <div class="lp-marquee lp-reviews-mq"><div class="lp-mq-track">${set}${set}</div></div>
  </div>`;
}

// florecita de 5 pétalos para adornar
function lpFlowerSvg(petal, core) {
  const petals = [0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="5.4" rx="3.3" ry="5" transform="rotate(${a} 12 12)"/>`).join('');
  return `<svg viewBox="0 0 24 24" class="lp-flsvg" aria-hidden="true"><g fill="${petal}">${petals}</g><circle cx="12" cy="12" r="3.3" fill="${core}"/></svg>`;
}
// capa de adornos para la sección de premios: pájaros + flores
function lpAwardsDeco() {
  return `<div class="lp-aw-deco" aria-hidden="true">
    <span class="awd awd-bird b1">${senseiBird('')}</span>
    <span class="awd awd-bird b2">${senseiBird('')}</span>
    <span class="awd awd-fl f1">${lpFlowerSvg('#ff8fb4', '#ffd34d')}</span>
    <span class="awd awd-fl f2">${lpFlowerSvg('#ffd34d', '#ff8fb4')}</span>
    <span class="awd awd-fl f3">${lpFlowerSvg('#c08bff', '#ffd34d')}</span>
    <span class="awd awd-fl f4">${lpFlowerSvg('#ff8fb4', '#ffffff')}</span>
    <span class="awd awd-fl f5">${lpFlowerSvg('#ffb347', '#fff3c4')}</span>
    <span class="awd awd-fl f6">${lpFlowerSvg('#7fd0ff', '#ffffff')}</span>
  </div>`;
}

/* árbol decorativo para las escenas del club */
function cgTree(x, y, s, c1, c2) { return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2.5" y="-2" width="5" height="16" rx="2" fill="#7a5230"/><circle cx="0" cy="-12" r="13" fill="${c1}"/><circle cx="-9" cy="-4" r="9" fill="${c2}"/><circle cx="9" cy="-5" r="9" fill="${c2}"/></g>`; }
/* escena: tee de salida (panorámica, hora dorada) */
function lpClubTee() {
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" class="lpgal-svg" aria-hidden="true">
    <defs>
      <linearGradient id="cgTeeSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#84cdf2"/><stop offset="55%" stop-color="#cdeaf0"/><stop offset="100%" stop-color="#ffe7c8"/></linearGradient>
      <linearGradient id="cgTeeFair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#73bd4d"/><stop offset="100%" stop-color="#2f7d3a"/></linearGradient>
    </defs>
    <rect width="320" height="200" fill="url(#cgTeeSky)"/>
    <circle cx="246" cy="44" r="27" fill="#fff6dd" opacity=".92"/>
    <path d="M0,94 Q80,68 165,88 T320,82 L320,130 L0,130 Z" fill="#a6d585" opacity=".85"/>
    <path d="M0,110 Q90,92 200,106 T320,100 L320,200 L0,200 Z" fill="#79bd54"/>
    <path d="M118,200 L150,110 L172,110 L214,200 Z" fill="url(#cgTeeFair)"/>
    <g transform="translate(161,108)"><line x1="0" y1="0" x2="0" y2="-13" stroke="#fff" stroke-width="1.4"/><path d="M0,-13 l6,2 -6,2z" fill="#e8392b"/></g>
    ${cgTree(34, 128, 1.5, '#3f9d52', '#2f7d3a')}${cgTree(292, 126, 1.8, '#3f9d52', '#2f7d3a')}${cgTree(70, 120, 1, '#54ad62', '#3a8f46')}${cgTree(258, 118, 1.05, '#54ad62', '#3a8f46')}
    <ellipse cx="160" cy="190" rx="78" ry="15" fill="#3f9447"/>
    <ellipse cx="160" cy="188" rx="78" ry="13" fill="#54ac57"/>
    <circle cx="116" cy="186" r="4.5" fill="#e8392b"/><circle cx="204" cy="186" r="4.5" fill="#e8392b"/>
    <ellipse cx="160" cy="187" rx="6" ry="2" fill="#000" opacity=".12"/>
    <rect x="159.2" y="180" width="1.8" height="7" fill="#cdd6c2"/><circle cx="160" cy="178" r="4.2" fill="#fff"/><circle cx="158.7" cy="176.7" r="1.3" fill="#fff" opacity=".7"/>
  </svg>`;
}
/* escena: green de cerca con bandera roja */
function lpClubGreen() {
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" class="lpgal-svg" aria-hidden="true">
    <defs>
      <linearGradient id="cgGrSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0f2"/><stop offset="100%" stop-color="#d7eef0"/></linearGradient>
      <radialGradient id="cgGreen" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#8ad06a"/><stop offset="70%" stop-color="#4fa64f"/><stop offset="100%" stop-color="#2f7d3a"/></radialGradient>
    </defs>
    <rect width="200" height="200" fill="url(#cgGrSky)"/>
    <path d="M0,66 Q70,48 140,62 T200,58 L200,90 L0,90 Z" fill="#9fcf7e"/>
    ${cgTree(26, 72, 1.2, '#3f9d52', '#2f7d3a')}${cgTree(176, 70, 1.4, '#3f9d52', '#2f7d3a')}
    <ellipse cx="100" cy="138" rx="120" ry="66" fill="#3f9447"/>
    <ellipse cx="100" cy="132" rx="96" ry="52" fill="url(#cgGreen)"/>
    <path d="M40,128 Q100,110 160,128" fill="none" stroke="#6cc471" stroke-width="2" opacity=".55"/>
    <path d="M44,150 Q100,134 156,150" fill="none" stroke="#3a8f46" stroke-width="2" opacity=".4"/>
    <ellipse cx="112" cy="126" rx="6" ry="2.6" fill="#10260f"/>
    <g transform="translate(112,126)"><line x1="0" y1="0" x2="-1" y2="-46" stroke="#eef3e6" stroke-width="2.4"/><path d="M-1,-46 l18,5 -18,5z" fill="#e8392b"/></g>
    <ellipse cx="84" cy="140" rx="5" ry="2" fill="#000" opacity=".14"/><circle cx="84" cy="136" r="5" fill="#fff"/><circle cx="82" cy="134" r="1.6" fill="#fff" opacity=".75"/>
  </svg>`;
}
/* escena: ronda con amigos (siluetas caminando) */
function lpClubFriends() {
  const golfer = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="1" rx="7" ry="2.2" fill="#000" opacity=".15"/><rect x="3" y="-26" width="4" height="18" rx="2" fill="#5a3a1e"/><path d="M-6,-2 Q-7,-20 0,-22 Q7,-20 6,-2 Z" fill="${c}"/><circle cx="0" cy="-27" r="5" fill="#e9c9a3"/><path d="M-5,-29 a5 5 0 0 1 10 0 l2 0 -1 2 -12 0 -1 -2 Z" fill="${c}"/></g>`;
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" class="lpgal-svg" aria-hidden="true">
    <defs><linearGradient id="cgFrSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#83cbf0"/><stop offset="60%" stop-color="#cfeaee"/><stop offset="100%" stop-color="#ffe9cf"/></linearGradient>
      <linearGradient id="cgFrFair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb84a"/><stop offset="100%" stop-color="#9fd06a"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#cgFrSky)"/>
    <circle cx="158" cy="40" r="24" fill="#fff6dd" opacity=".9"/>
    <path d="M0,84 Q70,62 140,80 T200,74 L200,120 L0,120 Z" fill="#9fcf7e"/>
    ${cgTree(22, 96, 1.3, '#3f9d52', '#2f7d3a')}${cgTree(182, 92, 1.5, '#3f9d52', '#2f7d3a')}${cgTree(150, 88, .9, '#54ad62', '#3a8f46')}
    <path d="M40,200 L86,98 L120,98 L180,200 Z" fill="url(#cgFrFair)"/>
    <path d="M86,98 L120,98 L114,118 L92,118 Z" fill="#7cc24a" opacity=".5"/>
    ${golfer(96, 150, 2.1, '#2f6bd0')}${golfer(122, 158, 2.4, '#e8392b')}${golfer(78, 162, 2.6, '#2f7d3a')}
  </svg>`;
}
/* escena: atardecer en el campo con lago */
function lpClubSunset() {
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" class="lpgal-svg" aria-hidden="true">
    <defs>
      <linearGradient id="cgSunSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b3b86"/><stop offset="42%" stop-color="#e8617a"/><stop offset="74%" stop-color="#ffb15a"/><stop offset="100%" stop-color="#ffe0a3"/></linearGradient>
      <linearGradient id="cgSunLake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc16a"/><stop offset="100%" stop-color="#c97a8e"/></linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#cgSunSky)"/>
    <circle cx="100" cy="120" r="34" fill="#fff0b8" opacity=".95"/>
    <circle cx="100" cy="120" r="50" fill="#ffd98a" opacity=".35"/>
    <path d="M0,118 Q60,100 120,114 T200,108 L200,140 L0,140 Z" fill="#6a4a6e" opacity=".55"/>
    <path d="M0,132 Q70,118 140,130 T200,126 L200,150 L0,150 Z" fill="#4a3552"/>
    <rect y="150" width="200" height="50" fill="url(#cgSunLake)"/>
    <ellipse cx="100" cy="150" rx="26" ry="4" fill="#fff0b8" opacity=".8"/>
    <g opacity=".55"><rect x="92" y="154" width="16" height="2" fill="#fff" opacity=".5"/><rect x="86" y="162" width="28" height="2" fill="#fff" opacity=".4"/><rect x="80" y="172" width="40" height="2.5" fill="#fff" opacity=".3"/></g>
    <g transform="translate(150,132)"><line x1="0" y1="0" x2="0" y2="-30" stroke="#2a1f33" stroke-width="2.2"/><path d="M0,-30 l13,4 -13,4z" fill="#e8392b"/></g>
    <ellipse cx="150" cy="133" rx="14" ry="3" fill="#2a1f33"/>
  </svg>`;
}
/* foto del club: usa assets/<file> si existe; si no, muestra la escena ilustrada */
function lpClubShot(file, label, scene, big) {
  return `<figure class="lp-gal-item${big ? ' big' : ''}">
    <span class="lp-gal-ph">${scene}</span>
    <img class="lp-gal-img" src="assets/${file}" alt="${esc(label)}" loading="lazy" onload="if(this.naturalWidth){var p=this.parentElement.querySelector('.lp-gal-ph');if(p)p.style.display='none'}else{this.remove()}" onerror="this.remove()">
    <figcaption class="lp-gal-cap">${esc(label)}</figcaption>
  </figure>`;
}
/* foto vertical para la franja "Tu camino" (real si existe, ilustración si no) */
function lpCaminoShot(file, label, scene) {
  return `<figure class="lp-cmsh"><span class="lp-cmsh-ph">${scene}</span><img class="lp-cmsh-img" src="assets/${file}" alt="${esc(label)}" loading="lazy" onload="if(this.naturalWidth){var p=this.parentElement.querySelector('.lp-cmsh-ph');if(p)p.style.display='none'}else{this.remove()}" onerror="this.remove()"><figcaption class="lp-cmsh-cap">${esc(label)}</figcaption></figure>`;
}
function lpGallery() {
  return `<section class="lp-sec lp-gallery-sec">
    <span class="lp-eyebrow reveal">Vívelo en el campo</span>
    <h2 class="lp-h2 reveal">Torneos que se<br/><span class="lime">viven en grande.</span></h2>
    <p class="lp-lead reveal" style="text-align:center;max-width:34ch;margin:0 auto 16px">Golf de verdad, con tu equipo y los mejores aliados, dentro y fuera del campo.</p>
    <div class="lp-gallery reveal">
      ${lpClubShot('club-1.jpg', 'El gran torneo Montrer', lpClubTee(), true)}
      ${lpClubShot('club-2.jpg', 'Categoría damas', lpClubFriends())}
      ${lpClubShot('club-3.jpg', 'Aliados en el campo', lpClubGreen())}
      ${lpClubShot('club-4.jpg', 'Futuras promesas', lpClubFriends())}
      ${lpClubShot('club-5.jpg', 'Premiación', lpClubSunset())}
    </div>
  </section>`;
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
  // bola de golf voladora (detalle en movimiento)
  const fball = (st) => `<span class="lp-flyb" style="${st}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#c7d0cd" stroke-width="1"/><g fill="#d8dedc"><circle cx="9" cy="9" r="1"/><circle cx="14.5" cy="8.5" r="1"/><circle cx="16" cy="13.5" r="1"/><circle cx="10" cy="14.5" r="1"/><circle cx="14" cy="15" r="1"/></g></svg></span>`;
  // mariposa que aletea (detalle en movimiento)
  const flybug = (st) => `<span class="lp-bug" style="${st}"><svg viewBox="0 0 28 24" aria-hidden="true"><g class="lp-bugw"><path d="M14 12 C6 2 0 6 3 12 C0 18 8 20 14 12 Z" fill="#ffcf5a"/><path d="M14 12 C5 8 2 12 5 16 C3 21 11 20 14 12 Z" fill="#ff9a3b"/></g><g class="lp-bugw r"><path d="M14 12 C22 2 28 6 25 12 C28 18 20 20 14 12 Z" fill="#ffcf5a"/><path d="M14 12 C23 8 26 12 23 16 C25 21 17 20 14 12 Z" fill="#ff9a3b"/></g><rect x="13.1" y="5" width="1.8" height="15" rx="0.9" fill="#3a2a12"/></svg></span>`;
  // abeja que zumba (detalle en movimiento)
  const bee = (st) => `<span class="lp-bee" style="${st}"><svg viewBox="0 0 32 24" aria-hidden="true"><g class="lp-beew"><ellipse cx="12" cy="6" rx="8" ry="4.6" fill="#eaf6ff" opacity=".82"/><ellipse cx="21" cy="6" rx="6.5" ry="3.8" fill="#eaf6ff" opacity=".82"/></g><ellipse cx="17" cy="14" rx="9.5" ry="6.2" fill="#f6c63c"/><path d="M14 9.2 a9 6 0 0 0 0 9.6" stroke="#2b2113" stroke-width="2.4" fill="none"/><path d="M19 8.8 a9 6 0 0 0 0 10.4" stroke="#2b2113" stroke-width="2.4" fill="none"/><circle cx="25.5" cy="13" r="3.6" fill="#2b2113"/><circle cx="26.6" cy="11.8" r="1" fill="#fff"/></svg></span>`;
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
      ${bsil('left:0;top:15%;transform:scale(.5);animation:lpFlyL 74s linear infinite;animation-delay:-10s')}
      ${bsil('left:0;top:24%;transform:scale(.7);animation:lpFlyR 54s linear infinite;animation-delay:-30s')}
      ${fball('left:0;top:30%;animation:lpBallArc 13s ease-in-out infinite')}
      ${fball('left:0;top:46%;transform:scale(.7);animation:lpBallArcR 18s ease-in-out infinite;animation-delay:-7s')}
      ${fball('left:0;top:22%;transform:scale(.85);animation:lpBallArc 22s ease-in-out infinite;animation-delay:-14s')}
      ${fball('left:0;top:60%;transform:scale(.6);animation:lpBallArcR 26s ease-in-out infinite;animation-delay:-3s')}
      ${flybug('left:0;top:38%;animation:lpFlyR 34s linear infinite;animation-delay:-6s')}
      ${flybug('left:0;top:55%;transform:scale(.8);animation:lpFlyL 44s linear infinite;animation-delay:-30s')}
      ${bee('left:0;top:34%;animation:lpFlyR 28s linear infinite;animation-delay:-4s')}
      ${bee('left:0;top:50%;transform:scale(.8);animation:lpFlyL 38s linear infinite;animation-delay:-18s')}
      ${bee('left:0;top:18%;transform:scale(.7);animation:lpFlyR 46s linear infinite;animation-delay:-26s')}
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
        <span class="lp-introflag">${golfFlagSvg()}</span>
        <span class="lp-intro-logo">${pLogo()}</span>
        <span class="lp-intro-tag">Golf Analytics</span>
        <div class="lp-press2">
          <span class="lp-beta">Beta</span>
        </div>
        <div class="lp-intro-cta">
          <div class="lp-stores">${lpStoreBadge()}${lpGooglePlay()}</div>
        </div>
      </div>
    </section>

    <section class="lp-hero2 lp-appstage-sec">
      <div class="lp-loadphone reveal">${lpIntroPhone()}</div>
      <div class="lp-hero-copy reveal">
        <h1 class="lp-title lp-title-stage">Baja tu hándicap<br/><span class="lp-title-grad">con datos.</span></h1>
        <p class="lp-sub">Anota tu ronda en segundos y descubre <b>qué falló y qué practicar</b>. Mejoras tu juego sin adivinar.</p>
        <div class="lp-cta-stack">
          <button class="lp-order lp-cta-main" data-act="go" data-view="signup">${golfIcon('flag')} Crear cuenta gratis</button>
          <button class="lp-cta-login" data-act="go" data-view="login">Ya tengo cuenta · Iniciar sesión</button>
        </div>
        <p class="lp-trust">Gratis para empezar · Tus datos viven en tu dispositivo</p>
      </div>
    </section>

    <section class="lp-sec lp-how">
      <span class="lp-eyebrow reveal">Así de fácil</span>
      <h2 class="lp-h2 reveal">¿Cómo funciona?</h2>
      <p class="lp-lead reveal" style="text-align:center;max-width:34ch;margin:14px auto 20px">No necesitas saber de estadísticas. Tú juegas; PARFECT hace el análisis.</p>
      <div class="lp-how-grid">
        <div class="lp-how-step reveal"><span class="lp-how-n">1</span><div class="lp-how-tx"><h3>Anota tu ronda</h3><p>Toca hoyo por hoyo: dónde cayó tu tiro, si pegaste al green y cuántos putts. Toma segundos.</p></div></div>
        <div class="lp-how-step reveal"><span class="lp-how-n">2</span><div class="lp-how-tx"><h3>Encuentra tus fugas de golpes</h3><p>PARFECT analiza tus rondas y te dice en español claro dónde se te van los golpes.</p></div></div>
        <div class="lp-how-step reveal"><span class="lp-how-n">3</span><div class="lp-how-tx"><h3>Entrenas justo eso</h3><p>Te arma la práctica del día según tu tiempo. Practicas lo que importa y tu hándicap baja.</p></div></div>
      </div>
    </section>

    <section class="lp-sec">
      <span class="lp-eyebrow reveal">La app por dentro</span>
      <h2 class="lp-h2 reveal">Funciones reales,<br/><span class="lime">no promesas.</span></h2>
      <div class="lp-shots">
        <div class="lp-shot reveal">${lpPhoneShot('shot-rondas.png', lpScrRondas())}<div class="lp-shot-tx"><h3>Registra y revisa tus rondas</h3><p>Fairways, greens, up & down y putts hoyo por hoyo. Tu tarjeta completa y tu historial de rondas, siempre a la mano.</p></div></div>
        <div class="lp-shot lp-shot-r reveal">${lpPhoneShot('shot-analisis.png', lpScrCoach())}<div class="lp-shot-tx"><h3>Análisis de tu juego</h3><p>Cruza tus rondas, te explica dónde pierdes golpes y te dice exactamente qué entrenar para bajar tu score.</p></div></div>
        <div class="lp-shot reveal">${lpPhoneShot('shot-logros.png', lpScrLogros())}<div class="lp-shot-tx"><h3>Sube de rango con logros</h3><p>Trofeos míticos por cada meta que alcanzas. Tu progreso, gamificado y claro.</p></div></div>
        <div class="lp-shot lp-shot-r reveal">${lpPhoneShot('shot-social.png', lpScrSocial())}<div class="lp-shot-tx"><h3>Juega con amigos</h3><p>Torneos en vivo, leaderboard y partidas por código. El golf es mejor en bola.</p></div></div>
      </div>
    </section>




    <section class="lp-sec lp-presence">
      <div class="lp-pres-orn" aria-hidden="true">
        <span class="po po-plane">✈️</span>
        <span class="po po-tr">🏆</span>
        <span class="po po-cap">🎓</span>
        <span class="po po-medal">🏅</span>
        <span class="po po-flag">🚩</span>
        <span class="po po-tr2">🏆</span>
      </div>
      <span class="lp-eyebrow reveal">Nuestra visión</span>
      <h2 class="lp-h2 reveal">Del torneo local<br/><span class="lime">a una beca afuera.</span></h2>
      <p class="lp-lead reveal" style="text-align:center;max-width:34ch;margin:0 auto 14px">Para esto nace PARFECT: que el golf juvenil mexicano crezca, compita y llegue más lejos. Esto es lo que queremos construir.</p>
      <div class="lp-journey reveal" aria-hidden="true">
        <svg class="lp-jpath" viewBox="0 0 320 72" preserveAspectRatio="none">
          <defs><linearGradient id="jgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--lime)" stop-opacity=".35"/><stop offset="1" stop-color="var(--lime)"/></linearGradient></defs>
          <path d="M16 58 Q160 -10 304 38" fill="none" stroke="url(#jgrad)" stroke-width="3" stroke-dasharray="1 10" stroke-linecap="round"/>
        </svg>
        <span class="lp-j lp-j-a">🇲🇽<small>Torneo local</small></span>
        <span class="lp-j lp-j-p">✈️</span>
        <span class="lp-j lp-j-b">🎓<small>Beca afuera</small></span>
      </div>
      <div class="lp-presgrid">
        ${[['🏆', 'Torneos que cuentan', 'La meta: que cada torneo sume para el ranking juvenil y posicione a los jugadores.'],
           ['🇲🇽', 'Equipos representativos', 'Que los mejores formen los equipos que representan a México.'],
           ['🎓', 'Becas en el extranjero', 'Dar exposición de los talentos ante universidades y academias de golf.'],
           ['🌱', 'Impulso al talento joven', 'Acercar el juego a más niños y jóvenes y darles herramientas para crecer.']]
          .map(([ic, t, d]) => `<div class="lp-prescard reveal"><span class="lp-presic">${ic}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>
    </section>


    <section class="lp-sec lp-tj">
      <div class="lp-tj-card reveal">
        <span class="lp-tj-eyebrow">⛳ Convocatoria abierta</span>
        <h2 class="lp-tj-h">Torneo PARFECT Juvenil</h2>
        <p class="lp-tj-sub">Buscamos al próximo talento del golf mexicano. Si eres juvenil —o tu hijo lo es— este es tu lugar para competir y que te vean.</p>
        <div class="lp-tj-steps">
          <div class="lp-tj-step"><span class="lp-tj-n">1</span><div class="lp-tj-tx"><b>Síguenos en redes</b><span>@parfect.golf en Instagram</span></div></div>
          <div class="lp-tj-step"><span class="lp-tj-n">2</span><div class="lp-tj-tx"><b>Crea tu cuenta gratis</b><span>Regístrate en la app en 60 segundos</span></div></div>
          <div class="lp-tj-step"><span class="lp-tj-n">3</span><div class="lp-tj-tx"><b>¡Listo, estás dentro!</b><span>Te avisamos fecha y sede</span></div></div>
        </div>
        <div class="lp-tj-cta">
          <button class="lp-order" data-act="go" data-view="signup">Registrarme gratis →</button>
          <a class="lp-tj-ig" href="https://instagram.com/parfect.golf" target="_blank" rel="noopener">Seguir @parfect.golf</a>
        </div>
        <p class="lp-tj-note">Gratis · Sin costo de inscripción · Categorías por edad</p>
      </div>
    </section>

    <section class="lp-sec lpc-sec">
      <span class="lp-eyebrow reveal">PARFECT para clubes</span>
      <h2 class="lp-h2 reveal">Llena tus torneos.<br/><span class="lime">Forma a tu cantera.</span></h2>
      <p class="lp-lead reveal" style="text-align:center;max-width:42ch;margin:14px auto 0">Lleva la vida social de tu campo y el desarrollo juvenil a una sola app, con la marca de tu club.</p>

      <div class="lpc-grid">
        <div class="lpc-card reveal">
          <span class="lpc-num">01</span>
          <h3>Torneos en vivo</h3>
          <p>La vida social del campo, en digital.</p>
          <ul class="lpc-feat">
            <li>Crea torneos en minutos (gross y neto)</li>
            <li>Leaderboard que se actualiza en vivo</li>
            <li>Podio y ganadores automáticos</li>
          </ul>
        </div>
        <div class="lpc-card reveal">
          <span class="lpc-num">02</span>
          <h3>Academia juvenil</h3>
          <p>Impulsa el talento y fideliza familias.</p>
          <ul class="lpc-feat">
            <li>Plan de entrenamiento por juvenil</li>
            <li>Progreso medido y “camino a la beca”</li>
            <li>Reporte automático para los padres</li>
            <li>Ranking de desarrollo del club</li>
          </ul>
        </div>
      </div>

      <div class="lpc-ai reveal">
        <span class="lpc-ai-kick">Automático</span>
        <b class="lpc-ai-h">Reportes listos para enviar</b>
        <p>El reporte de cada torneo y el de cada juvenil para sus papás, generados solos con los datos reales del club.</p>
      </div>

      <div class="lpc-stats">
        <div class="lpc-stat reveal"><b>2</b><span>ganchos: social + cantera</span></div>
        <div class="lpc-stat reveal"><b>0</b><span>hardware requerido</span></div>
        <div class="lpc-stat reveal"><b>100%</b><span>en español</span></div>
        <div class="lpc-stat reveal"><b>Tu</b><span>marca en su espacio</span></div>
      </div>

      <div class="lpc-cta reveal">
        <a class="lp-order" href="mailto:andremacouzetruiz@gmail.com?subject=PARFECT%20para%20mi%20club">Agendar demo para mi club →</a>
        <a class="lpc-deck" href="deck/" target="_blank" rel="noopener">Ver la presentación completa →</a>
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
          <button data-act="demo-account">Probar beta</button>
        </div>
      </div>
    </section>

    <footer class="lp-foot">
      <span class="lp-logo">${pLogo()}</span>
      <span>Tu app para mejorar en el golf y jugar con amigos.</span>
      <span class="lp-foot-links"><a href="legal.html#privacidad">Aviso de privacidad</a> · <a href="legal.html#terminos">Términos</a></span>
    </footer>
    ${chatWidget('lp')}
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
  // reveal interactivo: aparece al entrar y se difumina al salir (en ambos sentidos)
  const io = new IntersectionObserver(es => {
    es.forEach(e => { e.target.classList.toggle('in', e.isIntersecting); });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
  root.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const layers = [...root.querySelectorAll('[data-speed]')];
  const introTop = root.querySelector('.lp-intro-top');
  const introSec = root.querySelector('.lp-intro');
  const ground = root.querySelector('.lp-ground');
  const sky = root.querySelector('.lp-sky2');
  if (ground) ground.style.transformOrigin = '50% 100%';
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
    // al bajar, el campo se va acercando (se agranda desde el piso) y el cielo sube
    const gp = Math.min(1, sy / (innerHeight * 1.5));
    if (ground) ground.style.transform = `translateY(${(gp * 5).toFixed(1)}vh) scale(${(1 + gp * 0.65).toFixed(3)})`;
    if (sky) sky.style.transform = `translateY(${(-gp * 8).toFixed(1)}vh)`;
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

/* botón de Google (solo si la nube está configurada) */
function googleBtn() {
  if (typeof Cloud === 'undefined' || !Cloud.enabled()) return '';
  const g = `<svg class="gico" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>`;
  return `<div class="auth-or"><span>o</span></div>
    <button class="btn gbtn" data-act="google-login">${g}Continuar con Google</button>`;
}

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
        ${googleBtn()}
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
      ${err}
      <button class="btn primary" data-act="signup">Crear cuenta gratis</button>
      ${googleBtn()}
      <p class="auth-legal">Al continuar aceptas el <a href="legal.html#privacidad" target="_blank" rel="noopener">Aviso de privacidad</a> y los <a href="legal.html#terminos" target="_blank" rel="noopener">Términos</a>.</p>
      <p class="auth-alt">¿Ya tienes cuenta? <button data-act="go" data-view="login">Iniciar sesión</button></p>
    </div>
  </div>`;
}
