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

/* ====== Quiz tipo Preguntados: 10 preguntas por hoyo ====== */
const ACADEMY_QUIZ = [
  { unit: 'Fundamentos', color: '#3a8fe0', icon: 'flag', tag: 'Lo básico del golf', qs: [
    { q: '¿Cómo ganas en golf?', opts: ['Con más golpes', 'Con menos golpes', 'Pegando más lejos', 'Con más hoyos'], a: 1 },
    { q: 'Si el par es 4 y haces 3, eso es…', opts: ['Bogey', 'Birdie', 'Águila', 'Par'], a: 1 },
    { q: 'Un "bogey" es…', opts: ['1 bajo par', '1 sobre par', '2 bajo par', 'El par'], a: 1 },
    { q: '¿Qué palo usas dentro del green?', opts: ['Driver', 'Putter', 'Wedge', 'Híbrido'], a: 1 },
    { q: 'Una vuelta normal de golf son…', opts: ['5 o 10 hoyos', '9 o 18 hoyos', '12 hoyos', '20 hoyos'], a: 1 },
    { q: '¿Cuándo te quedas quieto y callado?', opts: ['Siempre', 'Cuando otro va a pegar', 'En el tee', 'Nunca'], a: 1 },
    { q: '"Águila" (eagle) es…', opts: ['1 bajo par', '2 bajo par', '2 sobre par', 'Igual al par'], a: 1 },
    { q: 'El "tee" es…', opts: ['El green', 'Donde empiezas el hoyo', 'El hoyo', 'Un bunker'], a: 1 },
    { q: 'Reparar tu marca y rastrillar el bunker es…', opts: ['Opcional', 'Buena etiqueta', 'Solo en torneos', 'Trampa'], a: 1 },
    { q: 'El hándicap mide…', opts: ['Tu fuerza', 'Tu nivel de juego', 'Tu edad', 'Tu equipo'], a: 1 },
  ] },
  { unit: 'El swing', color: '#57a83e', icon: 'green', tag: 'Tu mecánica', qs: [
    { q: '¿Dónde debe ir el palo en tus manos?', opts: ['En la palma', 'En los dedos', 'En la muñeca', 'En el puño'], a: 1 },
    { q: 'Tus pies deben apuntar…', opts: ['A la bandera directo', 'Paralelos a la línea al objetivo', 'Hacia atrás', 'A la derecha'], a: 1 },
    { q: '¿Cómo debes terminar el swing?', opts: ['En equilibrio', 'Cayéndote atrás', 'Saltando', 'De puntas'], a: 0 },
    { q: 'La presión del grip ideal es…', opts: ['Muy fuerte', 'Media', 'Muy suave', 'Solo una mano'], a: 1 },
    { q: 'Los pies van separados…', opts: ['Muy juntos', 'Al ancho de hombros', 'Lo más abierto posible', 'No importa'], a: 1 },
    { q: 'El swing es un movimiento…', opts: ['Brusco y fuerte', 'Fluido', 'A tirones', 'Solo de brazos'], a: 1 },
    { q: 'La espalda se inclina desde…', opts: ['La cintura encorvada', 'La cadera', 'Las rodillas', 'El cuello'], a: 1 },
    { q: 'Si te caes hacia atrás al terminar, fue…', opts: ['Perfecto', 'Demasiada fuerza', 'Poco grip', 'El viento'], a: 1 },
    { q: 'Las dos manos en el grip trabajan…', opts: ['Por separado', 'Como una sola unidad', 'Solo la derecha', 'Solo la izquierda'], a: 1 },
    { q: 'Para más consistencia, prioriza…', opts: ['Pegar al máximo', 'Buen contacto y tempo', 'Cambiar de palo', 'Cerrar los ojos'], a: 1 },
  ] },
  { unit: 'Juego corto', color: '#e0873a', icon: 'bucket', tag: 'Chip, pitch y bunker', qs: [
    { q: 'En el chip controlas la bola por…', opts: ['Su vuelo', 'Su bote y rodado', 'El viento', 'El sonido'], a: 1 },
    { q: '¿Cuándo usas un pitch?', opts: ['Para que vuele alto y frene', 'Para que ruede mucho', 'Solo en el tee', 'En el green'], a: 0 },
    { q: 'En un bunker greenside golpeas…', opts: ['La bola directo', 'La arena detrás de la bola', 'Por arriba', 'El borde'], a: 1 },
    { q: 'En el chip, las manos van…', opts: ['Detrás de la bola', 'Adelante de la bola', 'Muy altas', 'Sueltas'], a: 1 },
    { q: 'El peso en el chip va…', opts: ['Al pie de atrás', 'Al pie delantero', 'Centrado y quieto', 'En los talones'], a: 1 },
    { q: 'Para pasar un obstáculo cerca del green usas…', opts: ['Driver', 'Pitch', 'Putter', 'Hierro 4'], a: 1 },
    { q: 'En el chip piensas en…', opts: ['La bandera', 'El punto de bote', 'El cielo', 'Tus pies'], a: 1 },
    { q: 'El pitch vuela ___ y rueda ___', opts: ['poco / mucho', 'más / poco', 'nada / nada', 'igual / igual'], a: 1 },
    { q: 'En bunker, el swing es…', opts: ['Corto y frenado', 'Largo y acelerando', 'Sin seguir', 'Solo muñeca'], a: 1 },
    { q: 'El juego corto baja tu score porque…', opts: ['Suma distancia', 'Salva pares', 'Pega más lejos', 'No sirve'], a: 1 },
  ] },
  { unit: 'Putting', color: '#3a7fd4', icon: 'putter', tag: 'En el green', qs: [
    { q: 'En bajada, la bola…', opts: ['Rueda menos', 'Rueda más', 'No cambia', 'Se detiene'], a: 1 },
    { q: 'En putts largos tu prioridad es…', opts: ['Embocar siempre', 'La velocidad/distancia', 'Pegar fuerte', 'El grip'], a: 1 },
    { q: 'Los putts cortos se fallan más por…', opts: ['Dudar y pegar suave', 'Mirar mucho', 'Usar putter', 'El clima'], a: 0 },
    { q: '"Leer" el green es ver…', opts: ['La distancia al hoyo', 'La pendiente y el quiebre', 'El par', 'El viento'], a: 1 },
    { q: 'Para que entren más cortos, hay que…', opts: ['Pegar firme y decidido', 'Pegar suavecito', 'Cerrar los ojos', 'Mirar el hoyo'], a: 0 },
    { q: 'En cuesta arriba la bola rueda…', opts: ['Más', 'Menos', 'Igual', 'Para atrás'], a: 1 },
    { q: 'Un buen objetivo en putt largo es dejarla…', opts: ['Lejísimos', 'A 1 m (distancia de dar)', 'Pasada 5 m', 'Corta 5 m'], a: 1 },
    { q: 'La cara del putter al impacto debe ir…', opts: ['Abierta', 'Cuadrada a la línea', 'Cerrada', 'Hacia arriba'], a: 1 },
    { q: 'El ritmo del putt ideal es…', opts: ['Atrás corto, adelante largo', 'Parejo como péndulo', 'Solo muñeca', 'A golpes'], a: 1 },
    { q: 'Los 3-putts se evitan con…', opts: ['Mejor primera distancia', 'Pegar fuerte', 'Putter nuevo', 'Más práctica de driver'], a: 0 },
  ] },
  { unit: 'Estrategia', color: '#8a4fc0', icon: 'peak', tag: 'Jugar inteligente', qs: [
    { q: '¿A dónde conviene apuntar el approach?', opts: ['A la bandera siempre', 'Al centro del green', 'Al borde', 'Al bunker'], a: 1 },
    { q: 'Los amateurs suelen fallar el approach…', opts: ['Largo', 'Corto', 'A la derecha', 'Nunca'], a: 1 },
    { q: 'Tras un mal tiro, lo mejor es…', opts: ['El golpe heroico', 'Volver a poner en juego', 'Pegar más fuerte', 'Rendirte'], a: 1 },
    { q: 'Calculas la distancia con tu golpe…', opts: ['Máximo', 'Promedio', 'Más corto', 'De suerte'], a: 1 },
    { q: 'Off the tee, prioriza…', opts: ['Máxima distancia', 'Dejar la bola en juego', 'Pegar al agua', 'Driver siempre'], a: 1 },
    { q: 'Si hay agua a la derecha, apunta…', opts: ['Al agua', 'Al lado seguro (izq.)', 'Directo a bandera', 'No importa'], a: 1 },
    { q: 'Lo que más sube el score son…', opts: ['Los pares', 'Los dobles bogeys o peor', 'Los birdies', 'Los bogeys'], a: 1 },
    { q: 'En viento de frente conviene…', opts: ['Pegar más fuerte', 'Tomar más palo y swing suave', 'Bola más alta', 'Más loft'], a: 1 },
    { q: 'Bandera pegada al bunker: apunta…', opts: ['A la bandera', 'Al centro/zona ancha', 'Al bunker', 'Corto'], a: 1 },
    { q: 'Jugar inteligente significa…', opts: ['Arriesgar siempre', 'Elegir el % alto', 'Pegar al límite', 'Ir a bandera'], a: 1 },
  ] },
  { unit: 'Nivel élite', color: '#ef8b3c', icon: 'trophy', tag: 'Afinar para bajar HCP', qs: [
    { q: 'Para pegar más bajo, la bola va…', opts: ['Más atrás en el stance', 'Más adelante', 'Igual', 'Sobre el tee'], a: 0 },
    { q: 'La matriz de distancias de wedge sirve para…', opts: ['Pegar más lejos', 'Controlar distancias exactas', 'Putear', 'Driver'], a: 1 },
    { q: 'Para bajar tu hándicap, lo primero es…', opts: ['Más birdies', 'Eliminar dobles bogeys', 'Pegar más lejos', 'Cambiar palos'], a: 1 },
    { q: 'Defines backswings de wedge a las…', opts: ['8:00 / 9:00 / 10:00', '12:00 siempre', '6:00', 'Al azar'], a: 0 },
    { q: 'El stat que más correlaciona con bajo score es…', opts: ['Distancia de drive', 'Greens en regulación', 'Putts con suerte', 'Marca de palos'], a: 1 },
    { q: 'Practicar con propósito significa…', opts: ['Pegar bolas sin pensar', 'Drills con meta y medición', 'Solo driver', 'Solo en el campo'], a: 1 },
    { q: 'Para más velocidad de cabeza de palo…', opts: ['Tensar los brazos', 'Entrenar overspeed y secuencia', 'Grip más fuerte', 'Bola nueva'], a: 1 },
    { q: 'El "scoring" de verdad ocurre…', opts: ['Desde el tee', 'Dentro de 100 m', 'En el driving', 'En el carrito'], a: 1 },
    { q: 'Registrar tus rondas te ayuda a…', opts: ['Presumir', 'Ver dónde pierdes golpes', 'Nada', 'Pegar más'], a: 1 },
    { q: 'La mentalidad élite tras un error es…', opts: ['Enojarte', 'Siguiente golpe, plan claro', 'Rendirte', 'Arriesgar todo'], a: 1 },
  ] },
];
/* 18 niveles (secciones) que reusan los 6 bancos temáticos de preguntas */
const ACADEMY_N = 18;
const ACADEMY_POOL = ACADEMY_QUIZ.reduce((a, h) => a.concat(h.qs), []);
function levelMeta(i) { return ACADEMY_QUIZ[i % ACADEMY_QUIZ.length]; }
function levelQs(i) {
  // 10 preguntas estables por nivel: barajado con semilla del índice del nivel
  const pool = ACADEMY_POOL.slice();
  let s = (i + 3) * 2654435761 % 2147483647;
  for (let k = pool.length - 1; k > 0; k--) { s = (s * 48271) % 2147483647; const j = s % (k + 1); [pool[k], pool[j]] = [pool[j], pool[k]]; }
  return pool.slice(0, 10);
}
function quizBest(u, i) { return ((u && u.acQuiz) || {})[i] || 0; }
function quizUnlocked(u, i) { return i === 0 || quizBest(u, i - 1) >= 7; }
function quizProgress(u) { let done = 0; for (let i = 0; i < ACADEMY_N; i++) if (quizBest(u, i) >= 7) done++; return { done, total: ACADEMY_N }; }

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
    case 'stance': return wrap(`${sky}${grass}<line class="la-glow" x1="34" y1="76" x2="126" y2="68" stroke="#7cc24a" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>${ball('', 78, 72)}<rect x="60" y="74" width="14" height="3" rx="1.5" fill="#2a3550"/><rect x="86" y="73" width="14" height="3" rx="1.5" fill="#2a3550"/>`);
    case 'swing': return wrap(`${sky}${grass}<g class="la-swing"><rect x="79" y="18" width="5" height="46" rx="2.5" fill="#9aa6a8"/><ellipse cx="82" cy="64" rx="10" ry="6" fill="#2f6b39"/></g>${ball('la-pop', 96, 72)}`);
    case 'bag': return wrap(`${sky}${grass}<g class="la-bob"><g fill="#cdd5d7"><circle cx="66" cy="20" r="5"/><circle cx="80" cy="16" r="5"/><circle cx="94" cy="20" r="5"/></g><rect x="60" y="26" width="40" height="44" rx="8" fill="#3a7fd4"/><rect x="60" y="36" width="40" height="6" fill="#2a5fa6"/><rect x="74" y="44" width="12" height="20" rx="3" fill="#1f4e8a"/></g>`);
    case 'score': return wrap(`${sky}${grass}<g class="la-bob"><circle cx="50" cy="44" r="15" fill="none" stroke="#57b15c" stroke-width="3.5"/><rect x="74" y="32" width="24" height="24" rx="4" fill="none" stroke="#3a7fd4" stroke-width="3.5"/><text x="50" y="49" font-size="14" font-weight="900" fill="#2f6b39" text-anchor="middle">3</text><text x="86" y="50" font-size="14" font-weight="900" fill="#2a5fa6" text-anchor="middle">5</text></g>`);
    case 'target': return wrap(`${sky}${grass}<circle class="la-pulse" cx="100" cy="66" r="22" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/><circle cx="100" cy="66" r="12" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>${flag(100, 66)}${ball('la-arc-high', 26, 72)}`);
    case 'distance': return wrap(`${sky}${grass}${flag(132, 70)}<line class="la-glow" x1="28" y1="74" x2="120" y2="70" stroke="#7cc24a" stroke-width="2.5" stroke-dasharray="5 5"/>${ball('', 28, 74)}`);
    case 'safe': return wrap(`${sky}<path d="M0 60 Q80 44 160 60 L160 90 L0 90 Z" fill="#79b94f"/><path class="la-glow" d="M30 80 Q80 64 120 70" fill="none" stroke="#7cc24a" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>${flag(126, 68)}${ball('', 30, 80)}`);
    case 'wedge': return wrap(`${sky}${grass}<g class="la-bob"><circle cx="80" cy="42" r="22" fill="none" stroke="#cdd5d7" stroke-width="3"/><line class="la-clock" x1="80" y1="42" x2="80" y2="26" stroke="#2a3550" stroke-width="3" stroke-linecap="round"/><circle cx="80" cy="42" r="3" fill="#2a3550"/></g>`);
    case 'trophy': return wrap(`${sky}${grass}<g class="la-bob"><path d="M64 26h32v10c0 9-7 16-16 16s-16-7-16-16z" fill="#f7d04a"/><rect x="76" y="52" width="8" height="9" fill="#c98a1e"/><rect x="66" y="61" width="28" height="5" rx="2" fill="#c98a1e"/></g><circle class="la-spark" cx="56" cy="24" r="2.6" fill="#7cc24a"/><circle class="la-spark2" cx="104" cy="22" r="2.2" fill="#3a7fd4"/>`);
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
/* cuerpo de la academia (guía + progreso + ruta serpentina) — reutilizable en pantalla y en la sección de Trainer */
function vAcademyBody(u) {
  const prog = quizProgress(u);
  const pct = Math.round((prog.done / prog.total) * 100);
  let curIdx = -1; for (let i = 0; i < ACADEMY_N; i++) { if (quizBest(u, i) < 7) { curIdx = i; break; } }
  const squares = Array.from({ length: ACADEMY_N }, (_, i) => {
    const m = levelMeta(i);
    const best = quizBest(u, i);
    const unlocked = quizUnlocked(u, i);
    const passed = best >= 7;
    const isCur = i === curIdx;
    const state = passed ? 'done' : isCur ? 'cur' : unlocked ? 'open' : 'lock';
    const ic = passed ? '✓' : !unlocked ? '🔒' : `<span class="aqs-gi">${golfIcon(m.icon)}</span>`;
    return `<button class="aqs-sq ${state}" ${unlocked ? `data-act="quiz-open" data-i="${i}"` : 'disabled'} style="--uc:${m.color}" aria-label="Nivel ${i + 1} · ${esc(m.unit)}">
      <span class="aqs-no">${i + 1}</span>
      <span class="aqs-ic">${ic}</span>
      ${isCur ? '<span class="aqs-play">JUGAR</span>' : best ? `<span class="aqs-best">${best}/10</span>` : ''}
    </button>`;
  }).join('');
  const bubble = curIdx >= 0
    ? `¡Nivel ${curIdx + 1}!<br><b>${esc(levelMeta(curIdx).unit)}</b> · 10 preguntas`
    : `🏆 ¡Campo completo!<br><b>Eres leyenda de la Academia.</b>`;
  return `<div class="acw-guide nobird">
      <div class="acw-bubble">${bubble}</div>
    </div>
    <div class="ac-progwrap acw-prog"><div class="ac-progbar"><i style="width:${pct}%"></i></div><span>${prog.done}/${prog.total} niveles</span></div>
    <div class="aqs-grid">${squares}</div>`;
}

function vAcademy() {
  const u = cur();
  const prog = academyProgress(u);
  const curNo = Math.min(prog.done + 1, prog.total);
  return `<div class="shell no-nav fade-in acw">
    <svg class="acw-hills" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0,120 Q110,80 210,104 T400,96 L400,200 L0,200 Z" fill="#cfe9a8"/>
      <path d="M0,150 Q120,116 250,138 T400,128 L400,200 L0,200 Z" fill="#a9d877"/>
    </svg>
    <div class="play-top">
      <button class="x" data-act="academia-exit">✕ Salir</button>
      <span class="label">Academia</span>
      <span class="small muted">${curNo}/${prog.total}</span>
    </div>
    ${vAcademyBody(u)}
    ${V.quiz ? vQuizSheet() : ''}
  </div>`;
}

/* Quiz tipo Preguntados: 10 preguntas, opciones 2×2, feedback inmediato, score y resultado */
function vQuizSheet() {
  const u = cur();
  const q = V.quiz; if (!q) return '';
  const hole = levelMeta(q.i); if (!hole) return '';
  const qs = levelQs(q.i);
  const total = qs.length;
  if (q.done) {
    const passed = q.score >= 7;
    const hasNext = q.i + 1 < ACADEMY_N;
    return `<div class="overlay overlay-top" data-act="quiz-close"><div class="sheet aq-sheet aq-result" data-act="noop" style="--uc:${hole.color}">
      <div class="aq-res-ring ${passed ? 'pass' : ''}"><div class="aq-res-ic">${passed ? '🏆' : '🎯'}</div></div>
      <h2 class="aq-res-h">${passed ? '¡Nivel superado!' : '¡Casi lo logras!'}</h2>
      <div class="aq-res-score">${q.score}<span>/${total}</span></div>
      <div class="aq-res-stars">${[0, 1, 2].map(s => `<span class="${q.score >= [5, 7, 9][s] ? 'on' : ''}">★</span>`).join('')}</div>
      <p class="aq-res-sub">${passed ? (hasNext ? '¡Desbloqueaste el siguiente nivel! 🔓' : '¡Completaste los 18 niveles! 🏆') : 'Necesitas 7/10 para pasar. ¡Vuelve a intentarlo!'}</p>
      <div class="aq-res-btns">
        <button class="btn primary big" data-act="quiz-retry">↺ Jugar de nuevo</button>
        ${passed && hasNext ? `<button class="btn big" data-act="quiz-next-hole">Siguiente hoyo →</button>` : `<button class="btn" data-act="quiz-close">Salir</button>`}
      </div>
    </div></div>`;
  }
  const item = qs[q.order[q.qi]];
  const letters = ['A', 'B', 'C', 'D'];
  const answered = q.picked != null;
  const correct = answered && q.picked === item.a;
  const opts = item.opts.map((o, i) => {
    let cls = '';
    if (answered) { if (i === item.a) cls = 'right'; else if (i === q.picked) cls = 'wrong'; else cls = 'dim'; }
    const badge = answered ? (i === item.a ? '✓' : (i === q.picked ? '✕' : letters[i])) : letters[i];
    return `<button class="aq-opt ${cls}" ${q.picked == null ? `data-act="quiz-pick" data-i="${i}"` : ''}><span class="aq-let">${badge}</span><span class="aq-otx">${esc(o)}</span></button>`;
  }).join('');
  const dots = Array.from({ length: total }, (_, k) => `<span class="aq-dot ${k < q.qi ? 'done' : k === q.qi ? 'cur' : ''}"></span>`).join('');
  return `<div class="overlay overlay-top" data-act="quiz-close"><div class="sheet aq-sheet" data-act="noop" style="--uc:${hole.color}">
    <div class="aq-top">
      <span class="aq-tag">${golfIcon(hole.icon)} Nivel ${q.i + 1} · ${esc(hole.unit)}</span>
      <span class="aq-pts">${q.score}<b>✓</b></span>
      <button class="aq-x" data-act="quiz-close" aria-label="Cerrar">✕</button>
    </div>
    <div class="aq-dots">${dots}</div>
    <span class="aq-count">Pregunta ${q.qi + 1} de ${total}</span>
    <h2 class="aq-q">${esc(item.q)}</h2>
    <div class="aq-opts">${opts}</div>
    ${answered ? `<div class="aq-fb ${correct ? 'ok' : 'no'}">${correct ? '✓ ¡Correcto!' : '✗ Respuesta: ' + esc(item.opts[item.a])}</div>
      <button class="btn primary big" data-act="quiz-advance">${q.qi + 1 < total ? 'Siguiente →' : 'Ver resultado →'}</button>` : ''}
  </div></div>`;
}
