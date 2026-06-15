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

function vLanding() {
  return `<div class="lp">
    <div class="lp-bg">
      <div class="lp-stars lp-stars-a parallax" data-speed="0.12"></div>
      <div class="lp-stars lp-stars-b parallax" data-speed="0.25"></div>
      <div class="lp-aura"></div>
      <div class="lp-grid"></div>
    </div>

    <header class="lp-nav">
      <span class="lp-logo">${logoMark(18)} PARFECT</span>
      <span class="lp-tagline">CERO EXCUSAS &nbsp;·&nbsp; PURO GOLF</span>
      <nav class="lp-links">
        <button data-act="go" data-view="login">ENTRAR</button>
        <button class="lp-cta-sm" data-act="go" data-view="signup">EMPEZAR</button>
      </nav>
    </header>

    <section class="lp-hero">
      <h2 class="lp-ghost" aria-hidden="true">PARFECT</h2>

      <div class="lp-side lp-left">
        <p class="lp-kicker">ENERGÍA PARA TU<br/>MEJOR JUEGO</p>
        <div class="lp-chevs">&gt;&gt;&gt;&gt;&gt;&gt;&gt;</div>
        <button class="lp-order" data-act="go" data-view="signup">EMPEZAR GRATIS</button>
      </div>

      <div class="lp-stage">
        <div class="lp-halo"></div>
        <div class="lp-ball parallax" data-speed="0.5"><div class="lp-ball-i">${golfBallSVG()}</div></div>
        <div class="lp-sat lp-sat1 parallax" data-speed="1.1"><div class="lp-sat-i">${golfIcon('flag')}</div></div>
        <div class="lp-sat lp-sat2 parallax" data-speed="0.85"><div class="lp-sat-i">${golfIcon('tee')}</div></div>
        <div class="lp-sat lp-sat3 parallax" data-speed="1.35"><div class="lp-sat-i">${golfIcon('green')}</div></div>
      </div>

      <div class="lp-side lp-right">
        <p class="lp-desc">REGISTRA CADA HOYO EN SEGUNDOS. LA APP TE DICE DÓNDE PIERDES GOLPES Y QUÉ PRACTICAR PARA BAJAR TU HÁNDICAP.</p>
      </div>

      <div class="lp-flavors">
        <div>REGISTRA TU RONDA</div>
        <div class="on">JUEGA CON AMIGOS</div>
        <div>MEJORA CON IA</div>
      </div>

      <div class="lp-terrain"><svg viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,220 L0,150 L70,118 L150,142 L210,96 L300,128 L380,84 L470,120 L560,82 L660,128 L760,92 L880,134 L980,90 L1080,126 L1180,86 L1290,124 L1380,98 L1440,128 L1440,220 Z" fill="#0a0b0e"/>
        <path d="M0,150 L70,118 L150,142 L210,96 L300,128 L380,84 L470,120 L560,82 L660,128 L760,92 L880,134 L980,90 L1080,126 L1180,86 L1290,124 L1380,98 L1440,128" fill="none" stroke="rgba(201,247,62,0.18)" stroke-width="1.5"/>
      </svg></div>
    </section>

    <section class="lp-sec">
      <span class="lp-eyebrow reveal">LA APP</span>
      <h2 class="lp-h2 reveal">Todo en un<br/><span class="lime">solo lugar.</span></h2>
      <div class="lp-feats">
        ${[[ICONS.feat_round, 'Apunta tus rondas', 'Cada hoyo con unos toques: salida, green, juego corto y putts. Listo en segundos.'],
           [ICONS.feat_stats, 'Mira tus números', 'Calles, greens, salvadas y putts, claros. Sabes cómo juegas de verdad.'],
           [ICONS.feat_ai, 'Tu entrenador IA', 'Revisa tus rondas, te dice por qué pierdes golpes y te arma drills a tu medida.'],
           [ICONS.feat_track, 'Tus prácticas', 'Apunta cada sesión y comprueba si de verdad estás mejorando.'],
           [ICONS.social, 'Juega con amigos', 'Arma una partida con código. Cada quien apunta y la app lleva La corta en vivo.'],
           [golfIcon('trophy'), 'Trofeos y metas', 'Ponte objetivos y desbloquea logros conforme mejoras. Tu progreso, claro.']]
          .map(([ic, t, d]) => `<div class="lp-feat reveal"><div class="lp-feat-ic">${ic}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>
    </section>

    <section class="lp-sec lp-train">
      <span class="lp-eyebrow reveal">ENTRENA CON PROPÓSITO</span>
      <h2 class="lp-h2 reveal">Drills que sí<br/><span class="lime">mueven la aguja.</span></h2>
      <p class="lp-lead reveal">La IA detecta tu mayor fuga de golpes y arma la sesión: el drill, las repeticiones y el cronómetro. Tú solo ejecutas.</p>
      <div class="lp-drillreel reveal"><div class="reel-track">${lpDrillCards()}${lpDrillCards()}</div></div>
      <div class="lp-trainfeat reveal">
        <div class="lp-trainfeat-art">${drillScene('Reloj con wedges', 'approach')}</div>
        <div class="lp-trainfeat-body">
          <span class="lp-eyebrow">TU SESIÓN DE HOY</span>
          <h3>El entrenamiento que toca, ya armado.</h3>
          <p>Cada sesión sale de tus rondas reales: pantalla interactiva, contador de aciertos y temporizador. Entrenas lo justo, no de más.</p>
          <button class="lp-order" data-act="go" data-view="signup">EMPEZAR A ENTRENAR</button>
        </div>
      </div>
    </section>

    <section class="lp-sec">
      <span class="lp-eyebrow reveal">ASÍ DE FÁCIL</span>
      <h2 class="lp-h2 reveal">Tres pasos<br/><span class="lime">y ya.</span></h2>
      <div class="lp-steps">
        ${[['01', 'Apunta tu ronda', 'Cada hoyo en 30 segundos, desde tu celular.'],
           ['02', 'Ve qué fallas', 'La app te dice dónde se te van los golpes.'],
           ['03', 'Practica lo justo', 'Solo lo que te hace falta. Sin perder el tiempo.']]
          .map(([n, t, d]) => `<div class="lp-step reveal"><span class="lp-snum">${n}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}
      </div>
    </section>

    <section class="lp-final reveal">
      <span class="lp-eyebrow">¿LISTO PARA JUGAR MEJOR?</span>
      <h2 class="lp-h2" style="margin-top:12px">Tu mejor golf<br/><span class="lime">empieza hoy.</span></h2>
      <p class="lp-lead">Crea tu cuenta gratis. Toma menos de un minuto.</p>
      <button class="lp-order" data-act="go" data-view="signup">EMPEZAR GRATIS</button>
      <div class="lp-alt">
        <button data-act="go" data-view="login">Ya tengo cuenta</button>
        <span>·</span>
        <button data-act="demo-account">Ver demo (HCP 7)</button>
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
  if (lp) { initLanding(lp); window.__lastView = 'landing'; return; }
  setupScrollFlag();
  requestAnimationFrame(pauseOffscreenSvgs);
  // transición de entrada SOLO al cambiar de vista (no en cada re-render por tap)
  const changed = window.__lastView !== V.view;
  window.__lastView = V.view;
  if (changed) {
    const el = document.querySelector('.app-content') || (document.getElementById('root') || {}).firstElementChild;
    if (el) el.classList.add('view-in');
  }
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
    return `<div class="shell no-nav fade-in">
      <button class="auth-back" data-act="go" data-view="landing">← Volver</button>
      <h1 class="auth-h">Hola de nuevo</h1>
      <p class="auth-sub">Inicia sesión para seguir construyendo tu perfil de jugador.</p>
      <div class="field"><label>Email</label><input id="f-email" type="email" autocomplete="email" placeholder="tu@email.com" value="${esc(vals.email || '')}"></div>
      <div class="field"><label>Contraseña</label><input id="f-pass" type="password" autocomplete="current-password" placeholder="••••••••"></div>
      ${err}
      <button class="btn primary" data-act="login">Iniciar sesión</button>
      <p class="auth-alt">¿Aún no tienes cuenta? <button data-act="go" data-view="signup">Crear cuenta gratis</button></p>
    </div>`;
  }
  return `<div class="shell no-nav fade-in">
    <button class="auth-back" data-act="go" data-view="landing">← Volver</button>
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
  </div>`;
}
