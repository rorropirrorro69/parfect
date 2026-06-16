/* ============ Parfect Academia: ruta de aprendizaje tipo Duolingo (HCP 36 → 0) ============ */

/* Cada unidad sube de nivel. Cada lección: pasos cortos + 1 quiz para completar. */
const ACADEMY = [
  {
    unit: 'Fundamentos', tag: 'HCP 36+ · empieza aquí', color: '#3a8fe0', icon: 'flag',
    lessons: [
      {
        id: 'f1', t: '¿Qué es el golf?',
        body: ['El objetivo es meter la bola en cada hoyo con la menor cantidad de golpes.', 'Una vuelta normal son 9 o 18 hoyos.', 'Gana quien sume menos golpes en total.'],
        q: { q: '¿Cómo ganas en golf?', opts: ['Con más golpes', 'Con menos golpes', 'Con la bola más lejos'], a: 1 },
      },
      {
        id: 'f2', t: 'Par, birdie y bogey',
        body: ['El "par" es los golpes esperados para un buen jugador en ese hoyo.', 'Birdie = 1 bajo par. Bogey = 1 sobre par.', 'Águila = 2 bajo par. Doble bogey = 2 sobre par.'],
        q: { q: 'Si el par es 4 y haces 3, eso es…', opts: ['Bogey', 'Birdie', 'Águila'], a: 1 },
      },
      {
        id: 'f3', t: 'Los palos de la bolsa',
        body: ['Driver y maderas: para distancia desde el tee.', 'Hierros: para approaches al green.', 'Wedges: golpes cortos y bunkers. Putter: en el green.'],
        q: { q: '¿Qué palo usas en el green?', opts: ['Driver', 'Putter', 'Wedge'], a: 1 },
      },
      {
        id: 'f4', t: 'Etiqueta básica',
        body: ['Juega rápido y deja pasar a grupos más veloces.', 'No hables ni te muevas cuando otro está pegando.', 'Repara tus marcas en el green y rastrilla los bunkers.'],
        q: { q: 'Cuando otro va a pegar, tú…', opts: ['Hablas para animar', 'Te quedas quieto y callado', 'Caminas frente a él'], a: 1 },
      },
    ],
  },
  {
    unit: 'El swing', tag: 'HCP 28–36', color: '#57a83e', icon: 'green',
    lessons: [
      {
        id: 's1', t: 'El grip (agarre)',
        body: ['Toma el palo en los dedos, no en la palma.', 'Las dos manos trabajan juntas como una sola.', 'Ni muy fuerte ni muy suave: presión media.'],
        q: { q: '¿Dónde debe ir el palo en tus manos?', opts: ['En la palma', 'En los dedos', 'En la muñeca'], a: 1 },
      },
      {
        id: 's2', t: 'Postura y alineación',
        body: ['Pies al ancho de hombros, rodillas suaves.', 'Espalda recta inclinada desde la cadera.', 'Hombros y pies apuntan paralelos a tu objetivo.'],
        q: { q: 'Tus pies deben apuntar…', opts: ['A la bandera directo', 'Paralelos a la línea al objetivo', 'Hacia atrás'], a: 1 },
      },
      {
        id: 's3', t: 'Tempo y equilibrio',
        body: ['El swing es un movimiento fluido, no un golpe brusco.', 'Termina en equilibrio sobre el pie delantero.', 'Si te caes, fue demasiada fuerza.'],
        q: { q: '¿Cómo debes terminar el swing?', opts: ['En equilibrio', 'Cayéndote atrás', 'Saltando'], a: 0 },
      },
    ],
  },
  {
    unit: 'Juego corto', tag: 'HCP 20–28', color: '#e0873a', icon: 'bucket',
    lessons: [
      {
        id: 'c1', t: 'El chip',
        body: ['Golpe bajo que rueda hacia el hoyo, cerca del green.', 'Manos adelante de la bola, peso al pie delantero.', 'Piensa en el punto de bote, no en la bandera.'],
        q: { q: 'En el chip controlas la bola por…', opts: ['Su vuelo', 'Su punto de bote y rodado', 'El viento'], a: 1 },
      },
      {
        id: 'c2', t: 'El pitch',
        body: ['Golpe más alto que vuela más y rueda poco.', 'Úsalo para pasar obstáculos cerca del green.', 'Swing más largo y acelerando al impacto.'],
        q: { q: '¿Cuándo usas un pitch?', opts: ['Para que vuele alto y frene', 'Para que ruede mucho', 'Solo en el tee'], a: 0 },
      },
      {
        id: 'c3', t: 'Salir del bunker',
        body: ['Golpea la arena ~5 cm detrás de la bola, no la bola.', 'Cara del wedge abierta y acelera.', 'La arena saca la bola: confía en el golpe.'],
        q: { q: 'En un bunker greenside golpeas…', opts: ['La bola directo', 'La arena detrás de la bola', 'La parte de arriba'], a: 1 },
      },
    ],
  },
  {
    unit: 'Putting', tag: 'HCP 15–20', color: '#3a7fd4', icon: 'putter',
    lessons: [
      {
        id: 'p1', t: 'Leer el green',
        body: ['El green tiene pendientes: la bola sigue la cuesta.', 'Mira desde atrás de la bola hacia el hoyo.', 'Cuesta abajo rueda más; cuesta arriba pega más firme.'],
        q: { q: 'En bajada, la bola…', opts: ['Rueda menos', 'Rueda más', 'No cambia'], a: 1 },
      },
      {
        id: 'p2', t: 'Velocidad > línea',
        body: ['La distancia es lo más importante en putts largos.', 'Tu meta en putts largos: dejarla a menos de 1 m.', 'Así evitas el temido 3-putt.'],
        q: { q: 'En putts largos tu prioridad es…', opts: ['Embocar siempre', 'La velocidad/distancia', 'Pegar fuerte'], a: 1 },
      },
      {
        id: 'p3', t: 'Rutina en putts cortos',
        body: ['Una mirada al hoyo y golpe firme al centro de la copa.', 'No decelera: acelera suave a través de la bola.', 'Confía: los cortos se fallan por dudar.'],
        q: { q: 'Los putts cortos se fallan más por…', opts: ['Pegar muy suave y dudar', 'Mirar mucho', 'Usar putter'], a: 0 },
      },
    ],
  },
  {
    unit: 'Estrategia', tag: 'HCP 8–14', color: '#8a4fc0', icon: 'peak',
    lessons: [
      {
        id: 'e1', t: 'Juega al centro del green',
        body: ['Apunta al centro, no a banderas peligrosas.', 'Un putt de 8 m vale más que un chip desde el bunker.', 'El GIR sube solo con objetivos conservadores.'],
        q: { q: '¿A dónde conviene apuntar el approach?', opts: ['A la bandera siempre', 'Al centro del green', 'Al borde'], a: 1 },
      },
      {
        id: 'e2', t: 'Toma un palo más',
        body: ['La mayoría falla CORTO en los approaches.', 'Calcula con tu golpe promedio, no con tu mejor golpe.', 'Toma un palo más y haz swing al 80%.'],
        q: { q: 'Los amateurs suelen fallar el approach…', opts: ['Largo', 'Corto', 'A la derecha'], a: 1 },
      },
      {
        id: 'e3', t: 'Sal de problemas seguro',
        body: ['Tras un mal golpe, el siguiente lo pones en juego.', 'No intentes el héroe entre los árboles.', 'Un bogey tranquilo es mejor que un doble arriesgado.'],
        q: { q: 'Después de un mal tiro, lo mejor es…', opts: ['Arriesgar el golpe heroico', 'Volver a poner la bola en juego', 'Pegar más fuerte'], a: 1 },
      },
    ],
  },
  {
    unit: 'Nivel élite', tag: 'HCP 0–7', color: '#ef8b3c', icon: 'trophy',
    lessons: [
      {
        id: 'a1', t: 'Controla la trayectoria',
        body: ['Bola atrás en el stance = vuelo más bajo (viento).', 'Bola adelante = vuelo más alto.', 'Saber pegarla baja te salva en días de viento.'],
        q: { q: 'Para pegar más bajo, la bola va…', opts: ['Más atrás en el stance', 'Más adelante', 'Igual'], a: 0 },
      },
      {
        id: 'a2', t: 'Distancias de wedge',
        body: ['Define 3 backswings (8:00, 9:00, 10:00) por wedge.', 'Mide cuánto vuela cada uno: es tu matriz de scoring.', 'Saber tus distancias exactas baja tu score más que pegar lejos.'],
        q: { q: 'La matriz de distancias de wedge sirve para…', opts: ['Pegar más lejos', 'Controlar distancias exactas', 'Putear'], a: 1 },
      },
      {
        id: 'a3', t: 'Hándicap y scoring',
        body: ['El hándicap mide tu nivel: más bajo = mejor.', 'Bajas hándicap eliminando dobles, no haciendo más birdies.', 'Consistencia > golpes espectaculares.'],
        q: { q: 'Para bajar tu hándicap, lo primero es…', opts: ['Hacer más birdies', 'Eliminar los dobles bogeys', 'Pegar más lejos'], a: 1 },
      },
    ],
  },
];

/* lista plana en orden (para bloquear secuencialmente) */
const ACADEMY_FLAT = ACADEMY.reduce((a, u) => a.concat(u.lessons.map(l => l.id)), []);
function academyLesson(id) {
  for (const u of ACADEMY) { const l = u.lessons.find(x => x.id === id); if (l) return l; }
  return null;
}
function academyDone(u) { return (u && u.academy) || {}; }
function academyProgress(u) {
  const d = academyDone(u);
  return { done: ACADEMY_FLAT.filter(id => d[id]).length, total: ACADEMY_FLAT.length };
}
/* ¿está desbloqueada? la primera sí; el resto si la anterior está hecha */
function academyUnlocked(u, id) {
  const i = ACADEMY_FLAT.indexOf(id);
  if (i <= 0) return true;
  return !!academyDone(u)[ACADEMY_FLAT[i - 1]];
}

/* ---------- Ilustración animada por lección (apoyo visual del tema) ---------- */
const LESSON_SCENE = {
  f1: 'hole', f2: 'score', f3: 'bag', f4: 'flag',
  s1: 'grip', s2: 'stance', s3: 'swing',
  c1: 'chip', c2: 'pitch', c3: 'bunker',
  p1: 'read', p2: 'lag', p3: 'putt',
  e1: 'target', e2: 'distance', e3: 'safe',
  a1: 'fly', a2: 'wedge', a3: 'trophy',
};
function acLessonArt(id) { return acScene(LESSON_SCENE[id] || 'flag'); }
function acScene(k) {
  const sky = `<rect x="0" y="0" width="160" height="90" fill="#bfe6f7"/><circle cx="132" cy="20" r="13" fill="#ffe27a"/>`;
  const grass = `<ellipse cx="80" cy="78" rx="78" ry="20" fill="#79b94f"/><ellipse cx="80" cy="72" rx="60" ry="13" fill="#57b15c"/>`;
  const flag = (x, y) => `<g class="la-flag"><rect x="${x - 1}" y="${y - 34}" width="2.4" height="34" rx="1" fill="#e8eef0"/><path class="la-wave" d="M${x + 0.6} ${y - 34} L${x + 17} ${y - 29} L${x + 0.6} ${y - 24} Z" fill="#ff5a4d"/></g>`;
  const cup = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="2.4" fill="#1b3a1f"/>`;
  const ball = (cls, x, y) => `<circle class="la-ball ${cls}" cx="${x}" cy="${y}" r="6" fill="#fff" stroke="#cdd5d7" stroke-width="1"/>`;
  const wrap = inner => `<svg class="la" viewBox="0 0 160 90" role="img" aria-hidden="true">${inner}</svg>`;
  switch (k) {
    case 'hole': return wrap(`${sky}${grass}${cup(98, 70)}${flag(98, 70)}${ball('la-roll', 30, 70)}`);
    case 'putt': return wrap(`${sky}${grass}${cup(104, 70)}${flag(104, 70)}${ball('la-roll2', 38, 70)}`);
    case 'lag': return wrap(`${sky}${grass}${cup(118, 70)}${flag(118, 70)}${ball('la-roll3', 24, 70)}`);
    case 'read': return wrap(`${sky}${grass}<path class="la-arrow" d="M40 74 Q70 60 104 70" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 5" stroke-linecap="round"/>${cup(108, 70)}${flag(108, 70)}${ball('', 40, 74)}`);
    case 'chip': return wrap(`${sky}${grass}${cup(112, 70)}${flag(112, 70)}${ball('la-arc-low', 28, 70)}`);
    case 'pitch': return wrap(`${sky}${grass}${cup(116, 70)}${flag(116, 70)}${ball('la-arc-high', 26, 72)}`);
    case 'fly': return wrap(`${sky}${grass}${flag(132, 72)}<path class="la-trace" d="M24 74 Q70 14 120 60" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round" opacity=".7"/>${ball('la-arc-high', 24, 74)}`);
    case 'bunker': return wrap(`${sky}<ellipse cx="80" cy="74" rx="78" ry="18" fill="#e7cf94"/><ellipse cx="60" cy="74" rx="30" ry="10" fill="#d9bd78"/>${flag(120, 70)}<g class="la-splash"><circle cx="56" cy="64" r="2.4" fill="#efe0b6"/><circle cx="64" cy="58" r="2" fill="#efe0b6"/><circle cx="50" cy="60" r="1.8" fill="#efe0b6"/></g>${ball('la-arc-high', 54, 70)}`);
    case 'grip': return wrap(`${sky}${grass}<g class="la-bob"><rect x="78" y="20" width="5" height="44" rx="2.5" transform="rotate(18 80 42)" fill="#9aa6a8"/><ellipse cx="62" cy="58" rx="11" ry="7" transform="rotate(18 62 58)" fill="#2f6b39"/><ellipse cx="92" cy="34" rx="9" ry="6" fill="#e0a878"/><ellipse cx="86" cy="40" rx="8" ry="6" fill="#c98f5f"/></g>`);
    case 'stance': return wrap(`${sky}${grass}<line class="la-glow" x1="34" y1="76" x2="126" y2="68" stroke="#4fc07a" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>${ball('', 78, 72)}<rect x="60" y="74" width="14" height="3" rx="1.5" fill="#2a3550"/><rect x="86" y="73" width="14" height="3" rx="1.5" fill="#2a3550"/>`);
    case 'swing': return wrap(`${sky}${grass}<g class="la-swing"><rect x="79" y="18" width="5" height="46" rx="2.5" fill="#9aa6a8"/><ellipse cx="82" cy="64" rx="10" ry="6" fill="#2f6b39"/></g>${ball('la-pop', 96, 72)}`);
    case 'bag': return wrap(`${sky}${grass}<g class="la-bob"><g fill="#cdd5d7"><circle cx="66" cy="20" r="5"/><circle cx="80" cy="16" r="5"/><circle cx="94" cy="20" r="5"/></g><rect x="60" y="26" width="40" height="44" rx="8" fill="#3a7fd4"/><rect x="60" y="36" width="40" height="6" fill="#2a5fa6"/><rect x="74" y="44" width="12" height="20" rx="3" fill="#1f4e8a"/></g>`);
    case 'score': return wrap(`${sky}${grass}<g class="la-bob"><circle cx="50" cy="44" r="15" fill="none" stroke="#57b15c" stroke-width="3.5"/><rect x="74" y="32" width="24" height="24" rx="4" fill="none" stroke="#3a7fd4" stroke-width="3.5"/><text x="50" y="49" font-size="14" font-weight="900" fill="#2f6b39" text-anchor="middle">3</text><text x="86" y="50" font-size="14" font-weight="900" fill="#2a5fa6" text-anchor="middle">5</text></g>`);
    case 'target': return wrap(`${sky}${grass}<circle class="la-pulse" cx="100" cy="66" r="22" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/><circle cx="100" cy="66" r="12" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>${flag(100, 66)}${ball('la-arc-high', 26, 72)}`);
    case 'distance': return wrap(`${sky}${grass}${flag(132, 70)}<line class="la-glow" x1="28" y1="74" x2="120" y2="70" stroke="#4fc07a" stroke-width="2.5" stroke-dasharray="5 5"/>${ball('', 28, 74)}`);
    case 'safe': return wrap(`${sky}<path d="M0 60 Q80 44 160 60 L160 90 L0 90 Z" fill="#79b94f"/><path class="la-glow" d="M30 80 Q80 64 120 70" fill="none" stroke="#4fc07a" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>${flag(126, 68)}${ball('', 30, 80)}`);
    case 'wedge': return wrap(`${sky}${grass}<g class="la-bob"><circle cx="80" cy="42" r="22" fill="none" stroke="#cdd5d7" stroke-width="3"/><line class="la-clock" x1="80" y1="42" x2="80" y2="26" stroke="#2a3550" stroke-width="3" stroke-linecap="round"/><circle cx="80" cy="42" r="3" fill="#2a3550"/></g>`);
    case 'trophy': return wrap(`${sky}${grass}<g class="la-bob"><path d="M64 26h32v10c0 9-7 16-16 16s-16-7-16-16z" fill="#f7d04a"/><rect x="76" y="52" width="8" height="9" fill="#c98a1e"/><rect x="66" y="61" width="28" height="5" rx="2" fill="#c98a1e"/></g><circle class="la-spark" cx="56" cy="24" r="2.6" fill="#4fc07a"/><circle class="la-spark2" cx="104" cy="22" r="2.2" fill="#3a7fd4"/>`);
    default: return wrap(`${sky}${grass}${flag(100, 70)}${ball('', 36, 72)}`);
  }
}

/* mini gráfico de hoyo (green + bandera) para los marcadores del campo */
function acFlagSVG() {
  return `<svg class="ac-flagsvg" viewBox="0 0 44 48" aria-hidden="true">
    <ellipse cx="22" cy="38" rx="17" ry="7" fill="#3f9d44"/><ellipse cx="22" cy="36.5" rx="11" ry="4.5" fill="#57b15c"/>
    <ellipse cx="26" cy="36" rx="3" ry="1.4" fill="#16401c"/>
    <rect x="25" y="12" width="2" height="24" rx="1" fill="#cdd6c2"/>
    <path d="M27 12 L40 16 L27 20 Z" fill="#ff5a4d"/>
  </svg>`;
}

/* ---------- Vista: recorrido del campo, hoyo por hoyo ---------- */
function vAcademy() {
  const u = cur();
  const d = academyDone(u);
  const prog = academyProgress(u);
  const pct = Math.round((prog.done / prog.total) * 100);
  const currentId = ACADEMY_FLAT.find(id => !d[id]) || null;
  const off = [0, 44, 66, 44, 0, -44, -66, -44];   // serpentina tipo Duolingo
  let n = 0;
  const units = ACADEMY.map((unit, ui) => {
    const nodes = unit.lessons.map(l => {
      const isDone = !!d[l.id];
      const unlocked = academyUnlocked(u, l.id);
      const isCur = l.id === currentId;
      const state = isDone ? 'done' : isCur ? 'cur' : unlocked ? 'open' : 'lock';
      const dx = off[n % off.length]; n++;
      const ic = isDone ? '<span class="duo-ic chk">✓</span>' : !unlocked ? '<span class="duo-ic lk">🔒</span>' : `<span class="duo-ic">${golfIcon(unit.icon)}</span>`;
      return `<div class="duo-row" style="transform:translateX(${dx}px)">
        ${isCur ? `<span class="duo-start">EMPIEZA</span>` : ''}
        <button class="duo-node ${state}" ${unlocked ? `data-act="lesson-open" data-id="${l.id}"` : 'disabled'} style="--uc:${unit.color}" aria-label="${esc(l.t)}">${ic}</button>
        <span class="duo-cap">${esc(l.t)}</span>
      </div>`;
    }).join('');
    const doneU = unit.lessons.filter(l => d[l.id]).length;
    return `<div class="duo-sec" style="--uc:${unit.color}">
        <div class="duo-sec-tx"><span class="duo-sec-k">Sección ${ui + 1}</span><b>${esc(unit.unit)}</b></div>
        <span class="duo-sec-n">${doneU}/${unit.lessons.length}</span>
      </div>
      <div class="duo-path">${nodes}</div>`;
  }).join('');
  const curLesson = currentId ? academyLesson(currentId) : null;
  const curNo = prog.done + 1;
  const bubble = curLesson
    ? `¡Vamos al hoyo ${curNo}!<br><b>${esc(curLesson.t)}</b>`
    : `🏆 ¡Terminaste el campo!<br><b>Eres leyenda de la Academia.</b>`;
  return `<div class="shell no-nav fade-in acw">
    <svg class="acw-hills" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0,120 Q110,80 210,104 T400,96 L400,200 L0,200 Z" fill="#cfe9a8"/>
      <path d="M0,150 Q120,116 250,138 T400,128 L400,200 L0,200 Z" fill="#a9d877"/>
    </svg>
    <div class="play-top">
      <button class="x" data-act="academia-exit">✕ Salir</button>
      <span class="label">Academia</span>
      <span class="small muted">${Math.min(curNo, prog.total)}/${prog.total}</span>
    </div>
    <div class="acw-guide">
      <div class="acw-bird">${senseiBird('')}</div>
      <div class="acw-bubble">${bubble}</div>
    </div>
    <div class="ac-progwrap acw-prog"><div class="ac-progbar"><i style="width:${pct}%"></i></div><span>${prog.done}/${prog.total} lecciones</span></div>
    ${units}
    ${V.lesson ? vLessonSheet() : ''}
  </div>`;
}

function vLessonSheet() {
  const u = cur();
  const l = academyLesson(V.lesson);
  if (!l) return '';
  const isDone = !!academyDone(u)[l.id];
  const body = l.body.map(b => `<li>${esc(b)}</li>`).join('');
  const showQ = V.lessonQ || isDone;
  const opts = l.q.opts.map((o, i) => {
    let cls = '';
    if (V.lessonPick != null) { if (i === l.q.a) cls = 'right'; else if (i === V.lessonPick) cls = 'wrong'; }
    return `<button class="lq-opt ${cls}" data-act="lesson-answer" data-i="${i}">${esc(o)}</button>`;
  }).join('');
  const answered = V.lessonPick != null;
  const correct = answered && V.lessonPick === l.q.a;
  const holeNo = ACADEMY_FLAT.indexOf(l.id) + 1;
  let nivel = ''; for (const un of ACADEMY) if (un.lessons.some(x => x.id === l.id)) { nivel = un.unit; break; }
  return `<div class="overlay" data-act="lesson-close"><div class="sheet lsheet" data-act="noop">
    <div class="grab"></div>
    <button class="dd2-x" data-act="lesson-close" aria-label="Cerrar">✕</button>
    <span class="ls-tag">${golfIcon('flag')} Hoyo ${holeNo} · ${esc(nivel)}</span>
    <h2 class="ls-h">${esc(l.t)}</h2>
    <div class="ls-art">${acLessonArt(l.id)}</div>
    ${!showQ ? `<ul class="ls-body">${body}</ul>
      <button class="btn primary" data-act="lesson-quiz">Entendido · hacer quiz →</button>` : `
      <ul class="ls-body small-body">${body}</ul>
      <div class="lq">
        <h3 class="lq-q">${esc(l.q.q)}</h3>
        <div class="lq-opts">${opts}</div>
        ${answered ? (correct
        ? `<p class="lq-fb ok">✓ ¡Correcto!</p><button class="btn primary" data-act="lesson-complete" data-id="${l.id}">${isDone ? 'Cerrar' : 'Completar lección ✓'}</button>`
        : `<p class="lq-fb no">Casi. Inténtalo otra vez.</p><button class="btn" data-act="lesson-retry">Reintentar</button>`)
      : ''}
      </div>`}
  </div></div>`;
}
