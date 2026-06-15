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
      <span class="badge">⛳ Golf más fácil</span>
      <h1 class="land-h1">Juega golf.<br/><span class="lime">Mejora de verdad.</span></h1>
      <p class="land-sub">Apunta cada hoyo en segundos. La app te muestra en qué fallas y qué practicar para bajar tu hándicap. ¿Juegas con amigos? Ella lleva la cuenta sola.</p>
      <button class="btn primary" data-act="go" data-view="signup">Crear mi cuenta gratis</button>
      <button class="btn ghost" data-act="go" data-view="login">Ya tengo cuenta</button>
      <div class="mini-stats">
        <div class="mini-stat"><b>Fácil</b><span>4 toques por hoyo</span></div>
        <div class="mini-stat"><b>Con amigos</b><span>y torneos</span></div>
        <div class="mini-stat"><b>Gratis</b><span>en tu celular</span></div>
      </div>
    </div>

    <div class="land-sec">
      <h2 class="land-h2">Todo en un<br/>solo lugar</h2>
      <p class="land-lead">Seis cosas simples para jugar mejor.</p>

      <div class="card feat">
        <div class="f-ico">${ICONS.feat_round}</div>
        <h3>Apunta tus rondas</h3>
        <p>Anota cada hoyo con unos toques: salida, tiro al green, juego corto y putts. Listo en segundos.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">${ICONS.feat_stats}</div>
        <h3>Mira tus números</h3>
        <p>Calles, greens, salvadas y putts, claros y fáciles de leer. Sabes cómo juegas de verdad.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">${ICONS.feat_ai}</div>
        <h3>Tu entrenador</h3>
        <p>Revisa tus rondas, te dice por qué pierdes golpes y te arma ejercicios hechos para ti.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">${ICONS.feat_track}</div>
        <h3>Tus prácticas</h3>
        <p>Apunta cada práctica y comprueba si de verdad estás mejorando, semana con semana.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">${ICONS.social}</div>
        <h3>Juega con amigos 🎉</h3>
        <p>Arma una partida con un código. Cada quien apunta desde su celular y la app lleva la cuenta en vivo. Perfecto para torneos.</p>
      </div>
      <div class="card feat">
        <div class="f-ico">🏆</div>
        <h3>Trofeos y metas</h3>
        <p>Ponte objetivos y desbloquea logros conforme mejoras. Tu progreso, claro y motivante.</p>
      </div>
    </div>

    <div class="land-sec">
      <h2 class="land-h2">Así de fácil</h2>
      <p class="land-lead">Tres pasos y ya.</p>
      <div class="step">
        <span class="s-num">01</span>
        <div><h3>Apunta tu ronda</h3><p>Cada hoyo en 30 segundos, desde tu celular.</p></div>
      </div>
      <div class="step">
        <span class="s-num">02</span>
        <div><h3>Ve qué fallas</h3><p>La app te dice dónde se te van los golpes.</p></div>
      </div>
      <div class="step">
        <span class="s-num">03</span>
        <div><h3>Practica lo justo</h3><p>Solo lo que te hace falta. Sin perder el tiempo.</p></div>
      </div>
    </div>

    <div class="land-cta">
      <span class="label">¿Listo para jugar mejor?</span>
      <h2 class="land-h2" style="margin-top:10px">Tu mejor golf<br/><span class="lime">empieza hoy.</span></h2>
      <p class="land-lead">Crea tu cuenta gratis. Toma menos de un minuto.</p>
      <button class="btn primary" data-act="go" data-view="signup">Empezar gratis</button>
    </div>

    <div class="land-foot">
      <span class="logo-word">${logoMark(15)} PARFECT</span>
      Tu app para mejorar en el golf y jugar con amigos.<br/>
      Tus datos se guardan en tu dispositivo.
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
