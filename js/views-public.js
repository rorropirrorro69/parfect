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
    <circle cx="100" cy="100" r="89" fill="none" stroke="rgba(201,247,62,0.55)" stroke-width="1.5"/>
  </svg>`;
}

/* tarjetas de drills animados (reel para la landing) */
function lpDrillCards() {
  const drills = [
    ['Gate drill', 'putting', 'Putt', 'Centra la cara de tu putter'],
    ['Escalera de distancias', 'approach', 'Approach', 'Domina tus carries'],
    ['Up & down', 'short', 'Juego corto', 'Salva el par desde cualquier lie'],
    ['14 calles a presión', 'driving', 'Salida', 'Encuentra la calle bajo presión'],
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
  if (kind === 'stats') return `<svg class="lpa" viewBox="0 0 96 78" aria-hidden="true">
    <rect class="lpa-bar lpab1" x="20" y="18" width="15" height="46" rx="4" fill="#C7EE54"/>
    <rect class="lpa-bar lpab2" x="41" y="18" width="15" height="46" rx="4" fill="#46b0e0"/>
    <rect class="lpa-bar lpab3" x="62" y="18" width="15" height="46" rx="4" fill="#9a5cd0"/>
    <line x1="14" y1="65" x2="83" y2="65" stroke="#cbd5c0" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
  if (kind === 'ai') return `<svg class="lpa" viewBox="0 0 96 78" aria-hidden="true">
    <circle class="lpa-ring lpar1" cx="48" cy="40" r="27" fill="none" stroke="#46b0e0" stroke-width="3.5"/>
    <circle class="lpa-ring lpar2" cx="48" cy="40" r="17" fill="none" stroke="#46b0e0" stroke-width="3.5"/>
    <circle cx="48" cy="40" r="6.5" fill="#46b0e0"/>
    <circle class="lpa-hit" cx="48" cy="40" r="5.5" fill="#fff" stroke="#cdd5d7" stroke-width="1"/>
  </svg>`;
  return `<svg class="lpa" viewBox="0 0 96 78" aria-hidden="true">
    <g class="lpa-trophy"><path d="M34 22h28v9c0 9-6 16-14 16s-14-7-14-16z" fill="#f7d04a"/><rect x="45" y="47" width="6" height="8" fill="#c98a1e"/><rect x="37" y="55" width="22" height="5" rx="2" fill="#c98a1e"/><path d="M34 25c-6 0-9 3-8 8 1 4 5 6 9 6v-4c-3 0-5-2-5.5-4.5" fill="none" stroke="#f7d04a" stroke-width="3"/><path d="M62 25c6 0 9 3 8 8-1 4-5 6-9 6v-4c3 0 5-2 5.5-4.5" fill="none" stroke="#f7d04a" stroke-width="3"/></g>
    <circle class="lpa-spark lpas1" cx="26" cy="20" r="2.6" fill="#C7EE54"/><circle class="lpa-spark lpas2" cx="71" cy="17" r="2.2" fill="#46b0e0"/><circle class="lpa-spark lpas3" cx="73" cy="42" r="2.6" fill="#ff6a88"/>
  </svg>`;
}

function vLanding() {
  const feat = (kind, t, d) => `<div class="lp-feat reveal"><div class="lp-feat-art lpa-${kind}">${lpFeatArt(kind)}</div><h3>${t}</h3><p>${d}</p></div>`;
  // (lpFeatArt definida abajo, a nivel de módulo)
  return `<div class="lp">
    <div class="lp-life parallax" data-speed="0.22" aria-hidden="true">
      <img class="lp-fbird lpf1" src="assets/bird.png" alt="" />
      <img class="lp-fbird lpf2" src="assets/bird.png" alt="" />
      <div class="lp-tree" aria-hidden="true">
        <svg viewBox="0 0 90 96"><rect x="41" y="52" width="8" height="40" rx="3" fill="#6b4a2a"/><ellipse cx="45" cy="40" rx="34" ry="30" fill="#3a7d3a"/><ellipse cx="30" cy="46" rx="20" ry="18" fill="#479a44"/><ellipse cx="60" cy="44" rx="20" ry="18" fill="#479a44"/><ellipse cx="45" cy="30" rx="16" ry="14" fill="#57ad50"/></svg>
        <img class="lp-perch lpp1" src="assets/bird.png" alt="" />
        <img class="lp-perch lpp2" src="assets/bird.png" alt="" />
      </div>
    </div>
    <header class="lp-nav">
      <span class="lp-logo">${logoMark(18)} PARFECT</span>
      <nav class="lp-links">
        <button data-act="go" data-view="login">Entrar</button>
        <button class="lp-cta-sm" data-act="go" data-view="signup">Empezar</button>
      </nav>
    </header>

    <section class="lp-hero">
      <div class="lp-hero-copy reveal">
        <span class="lp-pill">${logoMark(13)} Golf analytics con IA</span>
        <h1 class="lp-title">Guarda tu tarjeta.<br/><span class="lime">Baja tu hándicap.</span></h1>
        <p class="lp-sub">Registra cada ronda en segundos. La IA encuentra dónde pierdes golpes y te arma el entrenamiento exacto. Y rétate con amigos en La corta.</p>
        <div class="lp-cta-row">
          <button class="lp-order" data-act="go" data-view="signup">Empezar gratis →</button>
          <button class="lp-ghostbtn" data-act="demo-account">Ver demo</button>
        </div>
        <p class="lp-trust">Gratis para empezar · Tus datos viven en tu dispositivo</p>
      </div>

      <div class="lp-stage">
        <div class="lp-glow"></div>
        <div class="lp-golfer-stack parallax" data-speed="0.16">${AVATARS.map((src, i) => `<img class="lp-golfer lpg${i}" src="${src}" alt="${i === 0 ? 'Golfista PARFECT' : ''}" />`).join('')}</div>
        <div class="lp-shadow" aria-hidden="true"></div>
        <div class="lp-fcard lp-fc1 parallax" data-speed="0.7"><span class="lp-fc-k">Hándicap</span><b class="lp-fc-v">12.4 <i>▾</i></b></div>
        <div class="lp-fcard lp-fc2 parallax" data-speed="0.95"><img class="lp-fc-img" src="assets/bird.png" alt="" /><span>¡Birdie!</span></div>
        <div class="lp-fcard lp-fc3 parallax" data-speed="0.5"><span class="lp-fc-k">GIR</span><b class="lp-fc-v lime">64%</b></div>
      </div>
    </section>

    <section class="lp-sec">
      <span class="lp-eyebrow reveal">Cómo funciona</span>
      <h2 class="lp-h2 reveal">De tu tarjeta<br/><span class="lime">a tu mejor golf.</span></h2>
      <div class="lp-flow">
        ${[['01', 'Guarda tu tarjeta', 'Apunta cada hoyo en segundos: salida, green, juego corto y putts. Tu ronda, completa.', ICONS.feat_round],
           ['02', 'Analízala con IA', 'La inteligencia lee tus rondas y encuentra exactamente dónde se te van los golpes.', ICONS.feat_ai],
           ['03', 'Entrena inteligente', 'Recibes la sesión que toca: el drill exacto, las reps y el tiempo. Practicas lo justo.', ICONS.feat_stats],
           ['04', 'Sé mejor', 'Bajas tu hándicap, subes de rango y lo ves en cada número. Tu progreso, claro.', golfIcon('trophy')]]
          .map(([n, t, d, ic]) => `<div class="lp-flowc reveal"><div class="lp-flowc-top"><span class="lp-flown">${n}</span><div class="lp-flowc-ic">${ic}</div></div><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>
    </section>

    <section class="lp-sec">
      <span class="lp-eyebrow reveal">La app</span>
      <h2 class="lp-h2 reveal">Todo para jugar<br/><span class="lime">más inteligente.</span></h2>
      <div class="lp-feats">
        ${[['round', 'Apunta tus rondas', 'Cada hoyo con unos toques. Listo en segundos, sin lápiz ni papel.'],
           ['stats', 'Mira tus números', 'Calles, greens, salvadas y putts, claros. Sabes cómo juegas de verdad.'],
           ['ai', 'Tu entrenador IA', 'Revisa tus rondas, te dice por qué pierdes golpes y arma tus drills.'],
           ['social', 'Juega con amigos', 'Arma una partida con código y lleva La corta en vivo.']]
          .map(([k, t, d]) => feat(k, t, d)).join('')}
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
      <span class="lp-logo">${logoMark(15)} PARFECT</span>
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
  const cols = ['#C7EE54', '#9ad13e', '#ffd56b', '#ff9f43', '#5aa9e0', '#ffffff'];
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
  let mx = 0, my = 0, sy = 0, raf = 0;
  const apply = () => {
    raf = 0;
    for (const el of layers) {
      const sp = parseFloat(el.dataset.speed) || 0;
      el.style.transform = `translate3d(${(mx * sp * 18).toFixed(1)}px, ${(my * sp * 18 - sy * sp * 0.12).toFixed(1)}px, 0)`;
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
