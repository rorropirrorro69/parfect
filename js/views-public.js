/* ============ Vistas públicas: Landing + Auth ============ */

function vLanding() {
  return `<div class="shell no-nav fade-in">
    <div class="land-top">
      <span class="logo-word" style="font-weight:900;font-style:italic;letter-spacing:.18em;color:var(--lime);display:flex;align-items:center;gap:7px;font-size:15px">${logoMark(17)} PARFECT</span>
      <div class="links">
        <button class="btn sm ghost" data-act="go" data-view="login">Iniciar sesión</button>
        <button class="btn sm primary" data-act="go" data-view="signup">Empezar gratis</button>
      </div>
    </div>

    <div class="land-hero">
      <span class="badge">⛳ Golf Analytics · IA</span>
      <h1 class="land-h1">Deja de practicar.<br/><span class="lime">Empieza a mejorar.</span></h1>
      <p class="land-sub">PARFECT correlaciona cada métrica de tu juego para darte diagnósticos de causa raíz, prescripción de drills y estrategia personalizada.</p>
      <button class="btn primary" data-act="go" data-view="signup">Crear cuenta gratis</button>
      <button class="btn ghost" data-act="go" data-view="login">Ya tengo cuenta</button>
      <div class="mini-stats">
        <div class="mini-stat"><b>4 toques</b><span>por hoyo</span></div>
        <div class="mini-stat"><b>12+</b><span>métricas</span></div>
        <div class="mini-stat"><b>IA</b><span>diagnóstico</span></div>
      </div>
    </div>

    <div class="land-sec">
      <h2 class="land-h2">Todo lo que necesitas<br/>para bajar tu hándicap</h2>
      <p class="land-lead">Cuatro módulos integrados que convierten datos en mejoras reales en el campo.</p>

      <div class="card feat">
        <div class="f-ico">${ICONS.feat_round}</div>
        <h3>Registro de Rondas</h3>
        <p>Captura hoyo a hoyo con solo 4 toques. Tee, approach, around-the-green y putting — todo en segundos.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">${ICONS.feat_stats}</div>
        <h3>Avatar Stats</h3>
        <p>Métricas correlacionadas: fairways, GIR, scrambling, putting por distancia. Conoce tu juego con precisión quirúrgica.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">${ICONS.feat_ai}</div>
        <h3>Parfect Trainer</h3>
        <p>IA que analiza tus patrones de fallo reales y genera diagnósticos, drills y estrategia de campo personalizados.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">${ICONS.feat_track}</div>
        <h3>Parfect Tracker</h3>
        <p>Registra cada sesión de práctica con métricas de acierto y patrón de dispersión para cuantificar tu mejora.</p>
      </div>
    </div>

    <div class="land-sec">
      <h2 class="land-h2">Cómo funciona</h2>
      <p class="land-lead">Tres pasos para transformar tus datos en resultados.</p>
      <div class="step">
        <span class="s-num">01</span>
        <div><h3>Registra tu ronda</h3><p>Captura cada hoyo en menos de 30 segundos con nuestro formulario optimizado para móvil.</p></div>
      </div>
      <div class="step">
        <span class="s-num">02</span>
        <div><h3>Analiza tus patrones</h3><p>Avatar Stats correlaciona tus métricas y detecta exactamente dónde se van los golpes de más.</p></div>
      </div>
      <div class="step">
        <span class="s-num">03</span>
        <div><h3>Practica lo correcto</h3><p>Parfect Trainer genera drills específicos para tus fallas reales. No más práctica genérica.</p></div>
      </div>
    </div>

    <div class="land-cta">
      <span class="label">¿Listo para jugar tu mejor golf?</span>
      <h2 class="land-h2" style="margin-top:10px">Tu hándicap<br/><span class="lime">te está esperando.</span></h2>
      <p class="land-lead">Crea tu cuenta gratis y empieza a construir tu perfil de jugador hoy.</p>
      <button class="btn primary" data-act="go" data-view="signup">Empezar ahora</button>
    </div>

    <div class="land-foot">
      <span class="logo-word">${logoMark(15)} PARFECT</span>
      Tu plataforma de analytics y entrenamiento para golf.<br/>
      Tus datos viven en este dispositivo. Sin servidores, sin trackers.
    </div>
  </div>`;
}

/* ============ Auth ============ */

function vAuth(mode) {
  const vals = V.authVals || {};
  const err = V.err ? `<p class="form-err">${esc(V.err)}</p>` : '';
  if (mode === 'login') {
    return `<div class="shell no-nav fade-in">
      <button class="auth-back" data-act="go" data-view="landing">← Volver</button>
      <h1 class="auth-h">Hola de nuevo 👋</h1>
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
