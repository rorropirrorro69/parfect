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
  let holeNo = 0;
  const units = ACADEMY.map((unit, ui) => {
    const holes = unit.lessons.map(l => {
      holeNo++;
      const isDone = !!d[l.id];
      const unlocked = academyUnlocked(u, l.id);
      const isCur = l.id === currentId;
      const state = isDone ? 'done' : isCur ? 'cur' : unlocked ? 'open' : 'lock';
      const side = holeNo % 2 ? 'l' : 'r';
      const sub = isCur ? '¡te toca!' : isDone ? 'completado' : unlocked ? 'disponible' : 'bloqueado';
      return `<div class="ac-hole ${side} ${state}">
        <button class="ac-flag" ${unlocked ? `data-act="lesson-open" data-id="${l.id}"` : 'disabled'} aria-label="Hoyo ${holeNo}: ${esc(l.t)}">
          ${isDone ? '<span class="ac-check">✓</span>' : isCur ? `<span class="ac-ball"></span>` : !unlocked ? '<span class="ac-lk">🔒</span>' : ''}
          ${acFlagSVG()}
          <span class="ac-hnum">${holeNo}</span>
        </button>
        <div class="ac-htx"><b>Hoyo ${holeNo} · ${esc(l.t)}</b><span>${esc(unit.unit)} · ${sub}</span></div>
      </div>`;
    }).join('');
    return `<div class="ac-vuelta">
      <div class="ac-vh" style="--uc:${unit.color}">${golfIcon(unit.icon)} Vuelta ${ui + 1} · ${esc(unit.unit)} <i>${esc(unit.tag)}</i></div>
      <div class="ac-fairway">${holes}</div>
    </div>`;
  }).join('');
  const curLesson = currentId ? academyLesson(currentId) : null;
  const curNo = prog.done + 1;
  return `<div class="ac-top">
      <div class="ac-progwrap"><div class="ac-progbar"><i style="width:${pct}%"></i></div><span>Hoyo ${Math.min(curNo, prog.total)} de ${prog.total}</span></div>
      ${curLesson
      ? `<button class="btn primary big ac-play" data-act="lesson-open" data-id="${currentId}">${golfIcon('flag')} Jugar hoyo ${curNo}: ${esc(curLesson.t)} →</button>`
      : `<p class="note" style="margin:10px 0 0">🏆 ¡Recorriste todo el campo! Eres leyenda de la Academia.</p>`}
    </div>
    ${units}
    ${V.lesson ? vLessonSheet() : ''}`;
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
