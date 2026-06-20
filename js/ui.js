/* ============ UI helpers: escaping, icons, SVG charts ============ */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ============ i18n (Español / English) + tema (oscuro / claro) ============ */
const I18N = {
  es: {
    greet_morning: 'Buenos días', greet_afternoon: 'Buenas tardes', greet_evening: 'Buenas noches',
    hi: 'Hola', handicap: 'Hándicap', goal: 'meta',
    hcp_label: 'Tu hándicap', rounds: 'Rondas', holes: 'hoyos', recent: 'Rondas recientes', to_go: 'te faltan', goal_reached: '¡meta alcanzada!', start_round: 'Empezar ronda', choose_avatar: 'Elige tu golfista',
    qa_round: 'Empezar ronda', qa_drills: 'Drills', qa_stats: 'Estadísticas', qa_trophies: 'Trofeos', qa_bag: 'Mi bolsa', qa_profile: 'Mi perfil',
    sec_stats: 'Tus estadísticas', sub_stats: '% sobre 18 hoyos →',
    st_fw: 'Fairways', st_gir: 'Greens · GIR', st_ud: 'Up & down', st_putts9: 'Putts · 9 hoyos', st_3putts: '3-putts · 9 hoyos', st_birdie: 'Birdie o mejor', st_par: 'Pares', st_bogey: 'Bogeys', st_double: 'Dobles o peor',
    of: 'de', average: 'promedio',
    sec_numbers: 'Mis números', sub_numbers: 'tu juego y tu equipo',
    best_round: 'Mejor vuelta', average_k: 'Promedio', putts_round: 'Putts/ronda',
    driver_carry: 'Carry de driver', most_accurate: 'Tu palo más certero', accuracy: 'de efectividad',
    sec_bag: 'Mi bolsa', sub_bag: 'carry y efectividad por palo',
    edit: 'Editar', close: 'Cerrar',
    bag_title: 'Mi bolsa · carry por palo', bag_note: 'Define el carry real de cada palo en yardas. Deja en blanco los que no lleves.', bag_save: 'Guardar carries',
    grp_woods: 'Maderas e híbridos', grp_irons: 'Hierros', grp_wedges: 'Wedges',
    sec_practice: 'Entrena', sub_practice: 'toca un drill →', practice_cta: 'Entrenar →',
    nav_home: 'Inicio', nav_round: 'Ronda', nav_trainer: 'Trainer', nav_profile: 'Social',
    settings: 'Configuración', language: 'Idioma', theme: 'Tema', dark: 'Oscuro', light: 'Claro',
    load_demo: 'Cargar datos de ejemplo', wipe: 'Borrar mis rondas y prácticas', wipe_confirm: '¿Seguro? Toca otra vez para borrar', logout: 'Cerrar sesión', local_note: 'Cuenta local · tus datos viven solo en este dispositivo',
    dr_gate: 'Gate drill', dr_ladder: 'Escalera de distancias', dr_ud: 'Up & down', dr_14: '14 calles a presión', dr_splash: 'Splash de bunker', dr_lag: 'Lag putting',
    drd_gate: 'Centra la cara del putter', drd_ladder: 'Controla tus carries', drd_ud: 'Salva el par', drd_14: 'Encuentra la calle', drd_splash: 'Sal de la arena', drd_lag: 'Evita los 3-putts',
    tag_putt: 'Putt', tag_approach: 'Approach', tag_short: 'Juego corto', tag_drive: 'Salida', tag_bunker: 'Bunker', tag_lagputt: 'Putt largo',
    empty_h: 'Aquí empieza tu cuaderno de juego', empty_p: 'Registra una ronda y PARFECT analiza cada tiro: calles, greens, putts y dónde estás ganando o dejando golpes.', empty_cta: 'Registrar mi primera ronda', empty_demo: 'Ver con datos de ejemplo',
  },
  en: {
    greet_morning: 'Good morning', greet_afternoon: 'Good afternoon', greet_evening: 'Good evening',
    hi: 'Hi', handicap: 'Handicap', goal: 'goal',
    hcp_label: 'Your handicap', rounds: 'Rounds', holes: 'holes', recent: 'Recent rounds', to_go: 'to go', goal_reached: 'goal reached!', start_round: 'Start round', choose_avatar: 'Choose your golfer',
    qa_round: 'Start round', qa_drills: 'Drills', qa_stats: 'Stats', qa_trophies: 'Trophies', qa_bag: 'My bag', qa_profile: 'My profile',
    sec_stats: 'Your stats', sub_stats: '% over 18 holes →',
    st_fw: 'Fairways', st_gir: 'Greens · GIR', st_ud: 'Up & down', st_putts9: 'Putts · 9 holes', st_3putts: '3-putts · 9 holes', st_birdie: 'Birdie or better', st_par: 'Pars', st_bogey: 'Bogeys', st_double: 'Doubles or worse',
    of: 'of', average: 'average',
    sec_numbers: 'My numbers', sub_numbers: 'your game & gear',
    best_round: 'Best round', average_k: 'Average', putts_round: 'Putts/round',
    driver_carry: 'Driver carry', most_accurate: 'Your most accurate club', accuracy: 'accuracy',
    sec_bag: 'My bag', sub_bag: 'carry & accuracy per club',
    edit: 'Edit', close: 'Close',
    bag_title: 'My bag · carry per club', bag_note: 'Set the real carry of each club in yards. Leave blank the ones you do not carry.', bag_save: 'Save carries',
    grp_woods: 'Woods & hybrids', grp_irons: 'Irons', grp_wedges: 'Wedges',
    sec_practice: 'Practice', sub_practice: 'tap a drill →', practice_cta: 'Practice →',
    nav_home: 'Home', nav_round: 'Round', nav_trainer: 'Trainer', nav_profile: 'Social',
    settings: 'Settings', language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light',
    load_demo: 'Load sample data', wipe: 'Delete my rounds & practice', wipe_confirm: 'Sure? Tap again to delete', logout: 'Log out', local_note: 'Local account · your data stays on this device only',
    dr_gate: 'Gate drill', dr_ladder: 'Distance ladder', dr_ud: 'Up & down', dr_14: '14 fairways under pressure', dr_splash: 'Bunker splash', dr_lag: 'Lag putting',
    drd_gate: 'Square the putter face', drd_ladder: 'Own your carry distances', drd_ud: 'Save par', drd_14: 'Find the fairway', drd_splash: 'Escape the sand', drd_lag: 'Kill 3-putts',
    tag_putt: 'Putt', tag_approach: 'Approach', tag_short: 'Short game', tag_drive: 'Tee', tag_bunker: 'Bunker', tag_lagputt: 'Long putt',
    empty_h: 'Your game journal starts here', empty_p: 'Log a round and PARFECT breaks down every shot: fairways, greens, putts and where you are gaining or leaking strokes.', empty_cta: 'Log my first round', empty_demo: 'Explore with sample data',
  },
};
function curLang() { return (typeof S !== 'undefined' && S.settings && S.settings.lang) || 'es'; }
function t(k) { const d = I18N[curLang()] || I18N.es; return d[k] != null ? d[k] : (I18N.es[k] != null ? I18N.es[k] : k); }
function curEnv() { return (typeof S !== 'undefined' && S.settings && S.settings.env) || 'dia'; }
function applyTheme() {
  const th = (typeof S !== 'undefined' && S.settings && S.settings.theme) || 'light';
  document.documentElement.setAttribute('data-theme', th);
  document.documentElement.setAttribute('data-env', curEnv());
}

/* sol/luna: se mueven por el cielo según la hora (amanecer→mediodía→atardecer) */
function positionOrb() {
  const orb = document.querySelector('.bg-orb');
  const bg = document.querySelector('.app-bg');
  if (!orb) return;
  // sol fijo arriba a la izquierda, junto al logo PARFECT
  orb.style.left = '5%';
  orb.style.right = 'auto';
  orb.style.top = '2.5%';
  if (bg) {
    bg.classList.remove('dawn', 'dusk', 'night');   // cielo siempre azul (día), igual que la landing
  }
}

/* avatares 3D (monitos) — Fluent Emoji 3D (MIT) */
const AVATARS = [
  'assets/avatars/a1.png', 'assets/avatars/a2.png', 'assets/avatars/a3.png', 'assets/avatars/a4.png', 'assets/avatars/a5.png', 'assets/avatars/a6.png',
  'assets/avatars/wg1.png', 'assets/avatars/wg2.png', 'assets/avatars/wg3.png', 'assets/avatars/wg4.png', 'assets/avatars/wg5.png', 'assets/avatars/wg6.png',
  'assets/avatars/mg1.png', 'assets/avatars/mg2.png', 'assets/avatars/mg3.png', 'assets/avatars/mg4.png', 'assets/avatars/mg5.png', 'assets/avatars/mg6.png',
];
function avatarSrc(u) { let i = (u && u.avatar != null) ? u.avatar : 12; if (i < 6) i = 12 + i; return AVATARS[i] || AVATARS[12]; }

/* ====== Golfista personalizable (SVG): piel, gorra, playera, pantalón, rasgos ====== */
const GOLF_SKIN = ['#f6d0aa', '#eab07c', '#c98f5f', '#9c6b40', '#6f4a2c'];
const GOLF_HAIR = ['#2a1c12', '#5a3a1e', '#a86b2e', '#d8b25a', '#8a8a8a', '#1a1a1a'];
const GOLF_CAP = ['none', '#7cc24a', '#e8483a', '#2a3550', '#3a8fe0', '#f2c33a', '#ffffff', '#16241A'];
const GOLF_SHIRT = ['#7cc24a', '#e8483a', '#3a8fe0', '#ff8a3d', '#9a5cd0', '#2fa36b', '#16241A', '#ffffff'];
const GOLF_PANTS = ['#2a3550', '#5b6470', '#16241A', '#b5651d', '#3f8f3a', '#cdd3da', '#8a3d3d', '#5a3da0'];
const GOLF_FACE = [['normal', 'Normal'], ['glasses', 'Lentes'], ['shades', 'Gafas de sol'], ['beard', 'Barba']];
const GOLF_TYPE = [['hombre', 'Hombre'], ['mujer', 'Mujer'], ['nino', 'Niño'], ['nina', 'Niña']];
const GOLF_DEFAULT = { type: 'hombre', skin: '#f6d0aa', hair: '#2a1c12', cap: 'none', shirt: '#7cc24a', pants: '#2a3550', face: 'normal' };
function golferCfg(u) { return Object.assign({}, GOLF_DEFAULT, (u && u.golfer) || {}); }
function golfAvatarSVG(cfg, cls, fil) {
  const c = Object.assign({}, GOLF_DEFAULT, cfg || {});
  const female = c.type === 'mujer' || c.type === 'nina';
  const kid = c.type === 'nino' || c.type === 'nina';
  const hasCap = c.cap && c.cap !== 'none';
  const hr = kid ? 20.5 : 18.5;               // radio de cabeza
  const beardC = (c.face === 'beard' && !female) ? `<path d="M33 40 Q33 60 50 62 Q67 60 67 40 Q60 51 50 51 Q40 51 33 40Z" fill="${c.hair}"/>` : '';
  let eyes = `<circle cx="43.5" cy="39" r="2.4" fill="#2a2118"/><circle cx="56.5" cy="39" r="2.4" fill="#2a2118"/>`, glasses = '';
  if (c.face === 'glasses') glasses = `<g stroke="#2a2118" stroke-width="1.7" fill="none"><circle cx="43.5" cy="39" r="5.3"/><circle cx="56.5" cy="39" r="5.3"/><line x1="48.8" y1="39" x2="51.2" y2="39"/></g>`;
  if (c.face === 'shades') { eyes = ''; glasses = `<g fill="#15161a"><rect x="36.5" y="36" width="11" height="7.5" rx="2.4"/><rect x="52.5" y="36" width="11" height="7.5" rx="2.4"/><rect x="47" y="38.4" width="6" height="2.4"/></g>`; }
  const cheeks = kid ? `<circle cx="39.5" cy="43.5" r="2.8" fill="#ff8f8f" opacity=".45"/><circle cx="60.5" cy="43.5" r="2.8" fill="#ff8f8f" opacity=".45"/>` : '';
  const lips = female ? `<path d="M45 47 Q50 51 55 47" stroke="#d05a6e" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : `<path d="M44 46.5 Q50 51.5 56 46.5" stroke="#9c5b3b" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  // pelo largo (mujer/niña): mechones laterales detrás de la cabeza, visibles aun con gorra
  const longHair = female ? `<path d="M30 32 Q24 60 33 66 Q37 52 39 44 Q33 36 30 32Z" fill="${c.hair}"/><path d="M70 32 Q76 60 67 66 Q63 52 61 44 Q67 36 70 32Z" fill="${c.hair}"/>` : '';
  const topHair = !hasCap ? (female
    ? `<path d="M30 36 Q28 12 50 12 Q72 12 70 36 Q66 22 50 22 Q34 22 30 36Z" fill="${c.hair}"/>`
    : `<path d="M31 34 Q30 13 50 13 Q70 13 69 34 Q63 23 50 23 Q37 23 31 34Z" fill="${c.hair}"/>`) : '';
  const cap = hasCap ? `<g><path d="M30 31 Q30 9 50 9 Q70 9 70 31 Q50 25 30 31Z" fill="${c.cap}"/><path d="M68 31 Q78 30 80 35 Q74 36 66 34 Z" fill="${c.cap}"/><circle cx="50" cy="11.5" r="2.3" fill="${c.cap}" stroke="rgba(0,0,0,.14)"/></g>` : '';
  const ponytail = (c.type === 'nina') ? `<circle cx="74" cy="30" r="5" fill="${c.hair}"/>` : '';
  const sty = fil ? ` style="filter:${fil}"` : '';
  // niños: cuerpo un poco más corto (piernas + torso) para leer "niño/niña"
  const legY = kid ? 88 : 84, legH = kid ? 23 : 27, shoeY = kid ? 113 : 113;
  return `<svg viewBox="0 0 100 120" class="golfer ${cls || ''}"${sty} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <rect x="40" y="${legY}" width="8" height="${legH}" rx="3.5" fill="${c.pants}"/>
    <rect x="52" y="${legY}" width="8" height="${legH}" rx="3.5" fill="${c.pants}"/>
    <ellipse cx="44" cy="${shoeY}" rx="7" ry="4" fill="#1c1c1c"/>
    <ellipse cx="56" cy="${shoeY}" rx="7" ry="4" fill="#1c1c1c"/>
    <path d="M33 ${kid ? 62 : 60} Q50 ${kid ? 56 : 53} 67 ${kid ? 62 : 60} L70 90 Q50 96 30 90 Z" fill="${c.shirt}"/>
    <rect x="25" y="${kid ? 62 : 60}" width="9" height="${kid ? 24 : 27}" rx="4.5" fill="${c.shirt}"/>
    <rect x="66" y="${kid ? 62 : 60}" width="9" height="${kid ? 24 : 27}" rx="4.5" fill="${c.shirt}"/>
    <circle cx="29.5" cy="${kid ? 85 : 87}" r="4.6" fill="${c.skin}"/>
    <circle cx="70.5" cy="${kid ? 85 : 87}" r="4.6" fill="${c.skin}"/>
    <path d="M44 56 L50 63 L56 56 L54 54 L50 59 L46 54 Z" fill="#ffffff" opacity=".9"/>
    <rect x="46" y="50" width="8" height="9" fill="${c.skin}"/>
    ${ponytail}${longHair}
    <circle cx="31" cy="39" r="3.2" fill="${c.skin}"/><circle cx="69" cy="39" r="3.2" fill="${c.skin}"/>
    <circle cx="50" cy="37" r="${hr}" fill="${c.skin}"/>
    ${beardC}${cheeks}${eyes}${glasses}
    ${lips}
    ${topHair}${cap}
  </svg>`;
}

/* salida: dirección (h.tee: izq/c/der) + resultado (h.teeLie: calle/rough/bunker/ob). Compatibles con datos viejos (h.tee: fw/penal) */
function teeIsFairway(h) { return h.teeLie ? h.teeLie === 'calle' : h.tee === 'fw'; }
function teeIsPenal(h) { return !!h.pen || (h.teeLie ? h.teeLie === 'ob' : h.tee === 'penal'); }
function teeDone(h) { return h.par === 3 ? true : (h.teeLie != null || h.tee != null); }

/* clasifica una ronda 🔥/🧊 por tu score NETO (después del hándicap):
   bajo par neto = fuego, arriba de par neto = hielo */
function roundVibe(s, hcp) {
  if (!s || !s.holes) return null;
  const exp = (Number(hcp) || 18) * (s.holes / 18);   // golpes de hándicap prorrateados
  const net = s.toPar - exp;                            // score neto vs par
  if (net < -0.01) return { k: 'fire', ic: '🔥', t: 'Bajo par' };
  if (net > 0.01) return { k: 'ice', ic: '🧊', t: 'Sobre par' };
  return { k: 'fire', ic: '🔥', t: 'En par' };          // par neto cuenta como fuego
}

/* rango "equivalente" de una ronda: su score a par escalado a 18 → color del rango.
   Una vuelta cerca de par = Leyenda (oro); muy sobre par = Novato (gris). */
function roundRank(s) {
  if (!s || !s.holes) return RANKS[0];
  const h = Math.round((s.toPar || 0) * 18 / Math.max(1, s.holes));
  return RANKS[rankIdx(h)] || RANKS[0];
}

/* Sensei: pájaro mítico (SVG con aura, alas que aletean, destellos) */
function senseiBird(cls) {
  return `<svg class="sbird ${cls || ''}" viewBox="0 0 56 56" aria-hidden="true">
    <defs>
      <radialGradient id="sbGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#7cc24a" stop-opacity=".55"/><stop offset="55%" stop-color="#8a5cd0" stop-opacity=".24"/><stop offset="100%" stop-color="#8a5cd0" stop-opacity="0"/></radialGradient>
      <linearGradient id="sbBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e6ff7a"/><stop offset="48%" stop-color="#46c79a"/><stop offset="100%" stop-color="#9a5cd0"/></linearGradient>
    </defs>
    <circle class="sb-aura" cx="28" cy="28" r="26" fill="url(#sbGlow)"/>
    <path d="M14,34 L4,29 L10,36 L3,39 L13,40 Z" fill="url(#sbBody)" opacity=".85"/>
    <path d="M13,35 Q20,17 38,21 Q45,23 47,19 Q46,33 30,41 Q20,44 13,35 Z" fill="url(#sbBody)"/>
    <path class="sb-wing" d="M24,31 Q30,17 43,19 Q34,24 32,35 Q27,34 24,31 Z" fill="#ffffff" opacity=".3"/>
    <path d="M37,15 Q39,7 45,5 Q42,11 43,16 Z" fill="#7cc24a"/>
    <circle cx="40" cy="20" r="5.2" fill="url(#sbBody)"/>
    <path d="M44,19 L52,18 L45,23 Z" fill="#ffcf5a"/>
    <circle cx="41" cy="19" r="1.3" fill="#0a1408"/>
    <g class="sb-sparks" fill="#fff"><path d="M50,33 l1,3 3,1 -3,1 -1,3 -1,-3 -3,-1 3,-1z"/><circle cx="9" cy="18" r="1.5"/><circle cx="46" cy="38" r="1.1"/></g>
  </svg>`;
}
/* mensaje del sensei según la vista */
function senseiTip(view) {
  const m = {
    inicio: 'Aquí ves tu juego. Toca la <b>P</b> para registrar una ronda. 🥷',
    ronda: 'Tus rondas. Las de <b>fuego 🔥</b> le ganaron a tu hándicap.',
    nueva: 'Elige campo y salidas… y a jugar. ¡Concéntrate!',
    trainer: 'Entrena tu punto débil. Yo te marco qué practicar primero.',
    perfil: 'Tus logros. Toca tu <b>foto</b> arriba para personalizar tu golfista.',
    social: 'Reta a tus amigos en La corta. ¡El que pierde paga! 😏',
  };
  return m[view] || '¡Vamos por tu mejor golf!';
}

/* rango por hándicap 0–36 (golf): tu golfista se tiñe y su aura crece al subir */
const RANKS = [
  { max: 36, n: 'Novato', c: '#9aa6b0', f: 'saturate(.35) brightness(1.08)', aura: 0 },
  { max: 27, n: 'Aficionado', c: '#57a83e', f: 'hue-rotate(95deg) saturate(1.25)', aura: 1 },
  { max: 19, n: 'Competidor', c: '#3a7fd4', f: 'hue-rotate(195deg) saturate(1.35)', aura: 2 },
  { max: 14, n: 'Cazador de pares', c: '#8a4fc0', f: 'hue-rotate(258deg) saturate(1.3)', aura: 3 },
  { max: 7, n: 'Élite', c: '#ef8b3c', f: 'none', aura: 4 },
  { max: 2, n: 'Maestro', c: '#d8423a', f: 'hue-rotate(-26deg) saturate(1.5)', aura: 5 },
  { max: 0, n: 'Leyenda', c: '#f5d33a', f: 'hue-rotate(14deg) saturate(1.45) brightness(1.05)', aura: 6 },
];
function rankIdx(hcp) { const h = Math.round(Number(hcp)); if (isNaN(h)) return 0; let best = 0, bm = Infinity; RANKS.forEach((r, i) => { if (r.max >= h && r.max < bm) { bm = r.max; best = i; } }); return best; }
function rankRange(i) { if (i === RANKS.length - 1) return '0 o menos'; const lo = i + 1 < RANKS.length ? RANKS[i + 1].max + 1 : 0; return lo === RANKS[i].max ? `${lo}` : `${lo}–${RANKS[i].max}`; }
/* outfits: el color de tu golfista (lo elige el jugador; por defecto = color de rango) */
const OUTFITS = [
  { k: 'rank', n: 'Rango', sw: 'rank', f: null },
  { k: 'lime', n: 'Lima', sw: '#7cc24a', f: 'hue-rotate(72deg) saturate(1.4) brightness(1.05)' },
  { k: 'blue', n: 'Azul', sw: '#3a8fe0', f: 'hue-rotate(192deg) saturate(1.35)' },
  { k: 'red', n: 'Rojo', sw: '#e8483a', f: 'hue-rotate(-22deg) saturate(1.55)' },
  { k: 'purple', n: 'Morado', sw: '#9a5cd0', f: 'hue-rotate(255deg) saturate(1.35)' },
  { k: 'teal', n: 'Turquesa', sw: '#23b7a8', f: 'hue-rotate(135deg) saturate(1.3)' },
  { k: 'pink', n: 'Rosa', sw: '#f061b0', f: 'hue-rotate(300deg) saturate(1.35)' },
  { k: 'mono', n: 'Plata', sw: '#b9c2c4', f: 'saturate(.28) brightness(1.08)' },
];
function outfitOf(u) { const k = (u && u.outfit) || 'rank'; return OUTFITS.find(o => o.k === k) || OUTFITS[0]; }
/* fondos de perfil: algunos se desbloquean al subir de rango (min = índice de rango) */
const PROFILE_BGS = [
  { k: 'rank', n: 'Tu rango', min: 0, grad: null },
  { k: 'meadow', n: 'Pradera', min: 0, grad: 'linear-gradient(150deg,#7ec850,#3f8f3a)' },
  { k: 'dawn', n: 'Amanecer', min: 0, grad: 'linear-gradient(150deg,#ffd27a,#ff9e6b 55%,#7ec8e0)' },
  { k: 'ocean', n: 'Océano', min: 1, grad: 'linear-gradient(150deg,#46b0e0,#1f6aa6)' },
  { k: 'sunset', n: 'Atardecer', min: 2, grad: 'linear-gradient(150deg,#ff7e5f,#a8407a)' },
  { k: 'violet', n: 'Violeta', min: 3, grad: 'linear-gradient(150deg,#9a5cd0,#5b2a9a)' },
  { k: 'gold', n: 'Oro', min: 5, grad: 'linear-gradient(150deg,#f7d04a,#c98a1e)' },
  { k: 'galaxy', n: 'Galaxia', min: 6, grad: 'linear-gradient(150deg,#3b2f8a,#10183f)' },
];
function profileBgGrad(u) {
  const k = (u && u.bg) || 'rank';
  const b = PROFILE_BGS.find(x => x.k === k);
  if (!b || k === 'rank' || !b.grad) { const rk = RANKS[rankIdx(u && u.hcp)] || RANKS[0]; return `linear-gradient(150deg, ${rk.c}, #5fa03f)`; }
  return b.grad;
}

/* ====== Diseños de la tarjeta de Inicio (24 skins de golf, a escoger) ====== */
const CARD_SKINS = [
  { k: 'calle', n: 'Calle', t: 'light', g: 'linear-gradient(155deg,#b6e673,#74b352)' },
  { k: 'links', n: 'Links', t: 'light', g: 'linear-gradient(155deg,#d4e391,#9bbf5a)' },
  { k: 'augusta', n: 'Augusta', t: 'dark', g: 'linear-gradient(155deg,#3f9d54,#1f6b39)' },
  { k: 'pebble', n: 'Pebble', t: 'dark', g: 'linear-gradient(155deg,#8fd0e0,#3f7fa0)' },
  { k: 'standrews', n: 'St Andrews', t: 'dark', g: 'linear-gradient(155deg,#a7c191,#5c7d4f)' },
  { k: 'amanecer', n: 'Amanecer', t: 'light', g: 'linear-gradient(150deg,#ffd27a,#ff9e6b 55%,#7ec8e0)' },
  { k: 'atardecer', n: 'Atardecer', t: 'dark', g: 'linear-gradient(150deg,#ff7e5f,#a8407a)' },
  { k: 'oceano', n: 'Océano', t: 'dark', g: 'linear-gradient(150deg,#46b0e0,#1f6aa6)' },
  { k: 'bunker', n: 'Bunker', t: 'light', g: 'linear-gradient(155deg,#f3e0a6,#d9b25e)' },
  { k: 'pradera', n: 'Pradera', t: 'light', g: 'linear-gradient(155deg,#7ec850,#3f8f3a)' },
  { k: 'bosque', n: 'Bosque', t: 'dark', g: 'linear-gradient(155deg,#2f7d4f,#143d2a)' },
  { k: 'lima', n: 'Lima', t: 'light', g: 'linear-gradient(155deg,#e2f783,#a7d83f)' },
  { k: 'esmeralda', n: 'Esmeralda', t: 'dark', g: 'linear-gradient(155deg,#2fd6a0,#0f8f74)' },
  { k: 'tropical', n: 'Tropical', t: 'dark', g: 'linear-gradient(150deg,#2fe0c0,#2f9fd0)' },
  { k: 'desierto', n: 'Desierto', t: 'dark', g: 'linear-gradient(155deg,#e8b07a,#b56b3a)' },
  { k: 'hielo', n: 'Hielo', t: 'light', g: 'linear-gradient(155deg,#e3f1fb,#9fc7e8)' },
  { k: 'tundra', n: 'Tundra', t: 'dark', g: 'linear-gradient(155deg,#c7d6dc,#7e98a3)' },
  { k: 'lava', n: 'Lava', t: 'dark', g: 'linear-gradient(155deg,#ff6a3d,#8f1f1f)' },
  { k: 'coral', n: 'Coral', t: 'dark', g: 'linear-gradient(155deg,#ff9a8b,#ff6a88)' },
  { k: 'niebla', n: 'Niebla', t: 'light', g: 'linear-gradient(155deg,#d3dbd5,#8fa39a)' },
  { k: 'medianoche', n: 'Medianoche', t: 'dark', g: 'linear-gradient(155deg,#2a3b6a,#0d1430)' },
  { k: 'galaxia', n: 'Galaxia', t: 'dark', g: 'linear-gradient(150deg,#3b2f8a,#10183f)' },
  { k: 'oro', n: 'Oro', t: 'light', g: 'linear-gradient(155deg,#f7d04a,#c98a1e)' },
  { k: 'pino', n: 'Pino', t: 'dark', g: 'linear-gradient(155deg,#3aa6a0,#1f5e63)' },
];
function cardSkin(u) {
  const k = (u && u.cardSkin) || 'calle';
  return CARD_SKINS.find(x => x.k === k) || CARD_SKINS[0];
}
function cardSkinGrad(u) { return cardSkin(u).g; }

/* Escena del hoyo para el banner del registro (tee → calle → green con bandera) */
function holeScene(par) {
  const p = par || 4;
  const greenX = p === 3 ? 60 : p >= 5 ? 86 : 74;
  return `<svg viewBox="0 0 120 80" class="hb-svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="hbsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--hb-sky1)"/><stop offset="1" stop-color="var(--hb-sky2)"/></linearGradient></defs>
    <rect width="120" height="80" fill="url(#hbsky)"/>
    <circle cx="100" cy="18" r="9" fill="var(--hb-sun)"/>
    <path d="M0 42 Q34 28 68 40 T120 36 V80 H0 Z" fill="var(--hb-far)"/>
    <path d="M0 54 Q60 42 120 52 V80 H0 Z" fill="var(--hb-grass)"/>
    <path d="M52 80 L68 80 L${greenX - 4} 34 L${greenX - 12} 34 Z" fill="var(--hb-fair)"/>
    <ellipse cx="${greenX}" cy="33" rx="15" ry="5.5" fill="var(--hb-green)" stroke="var(--hb-grass2)" stroke-width="1"/>
    <line x1="${greenX}" y1="33" x2="${greenX}" y2="15" stroke="#1f3a16" stroke-width="1.4"/>
    <path d="M${greenX} 15 L${greenX + 12} 18 L${greenX} 21 Z" fill="var(--hb-flag)"/>
    <circle cx="60" cy="74" r="3" fill="#fff" stroke="var(--hb-grass2)" stroke-width=".7"/>
  </svg>`;
}

/* ====== Mini-escenas 3D de golf por stat (Fairways / GIR / Up&down) ====== */
function pstScene(kind, pct, label, goalPct) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const open = V.statOpen === kind;
  const art = (kind === 'ud') ? udGifScene() : chkScene(kind, true);   // up&down con gif claro; resto = escenas del registro
  const delta = (goalPct != null) ? (p - Math.round(goalPct)) : null;
  const goalHtml = (goalPct != null)
    ? `<span class="psc-goal">meta ${Math.round(goalPct)}% · <em class="${delta >= 0 ? 'up' : 'dn'}">${delta >= 0 ? '+' : ''}${delta}</em></span>`
    : '';
  return `<button class="pst-scene ${open ? 'open' : ''}" data-act="stat-open" data-k="${kind}" style="--p:${p}">
    <div class="psc-art">${art}</div>
    <b class="psc-num">${p}<i>%</i></b>
    <span class="psc-lab">${esc(label)}</span>
    ${goalHtml}
  </button>`;
}
/* misma escena pero sin botón (para usar dentro de las tarjetas de ronda) */
function pstSceneStatic(kind, pct, label) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const art = (kind === 'ud') ? udGifScene() : chkScene(kind, true);   // up&down con gif; fw/gir estáticos
  return `<div class="pst-scene pst-static" style="--p:${p}">
    <div class="psc-art">${art}</div>
    <b class="psc-num">${p}<i>%</i></b>
    <span class="psc-lab">${esc(label)}</span>
  </div>`;
}
/* Up & down claro (gif): la bola sale del rough, hace un chip en arco y cae al hoyo */
function udGifScene() {
  const d = 'M16 46 Q40 2 63 37';
  return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <defs><radialGradient id="ud2g" cx="52%" cy="38%" r="70%"><stop offset="0" stop-color="var(--sc-lit)"/><stop offset="1" stop-color="var(--sc-grass2)"/></radialGradient></defs>
    <ellipse cx="52" cy="49" rx="44" ry="7" fill="var(--sc-dim)"/>
    <ellipse cx="64" cy="38" rx="28" ry="10" fill="url(#ud2g)" stroke="var(--sc-grass2)" stroke-width="1"/>
    <ellipse cx="64" cy="38" rx="3.4" ry="1.5" fill="var(--sc-cup)"/>
    <line x1="64" y1="37" x2="64" y2="11" stroke="var(--sc-cup)" stroke-width="1.5"/><path d="M64 11 L76 14.5 L64 18 Z" fill="var(--sc-flag)"/>
    <path class="ud2-arc" d="${d}" fill="none" stroke="var(--sc-line)" stroke-width="1.5" stroke-dasharray="3 3.5" stroke-linecap="round" opacity=".6"/>
    <circle class="ud2-ball" r="3.2" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".5" style="offset-path:path('${d}')"/>
  </svg>`;
}
/* Fairway que se ilumina: trapezoide en perspectiva que se rellena de luz según % */
function fwScene(p) {
  const topY = 16, botY = 78, h = botY - topY;
  const litY = (botY - h * p / 100).toFixed(1), litH = (h * p / 100).toFixed(1);
  return `<svg viewBox="0 0 100 84" class="psc-svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <clipPath id="fwclip"><path d="M30 78 L70 78 L59 16 L41 16 Z"/></clipPath>
      <linearGradient id="fwlit" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="var(--sc-lit)"/><stop offset="1" stop-color="var(--sc-grass2)"/>
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="80" rx="46" ry="6" fill="var(--sc-shadow)"/>
    <g clip-path="url(#fwclip)">
      <rect x="0" y="0" width="100" height="84" fill="var(--sc-dim)"/>
      <rect x="0" y="${litY}" width="100" height="${litH}" fill="url(#fwlit)" class="psc-fill"/>
      <line x1="50" y1="16" x2="50" y2="78" stroke="var(--sc-line)" stroke-width="1" stroke-dasharray="3 4" opacity=".5"/>
    </g>
    <path d="M30 78 L70 78 L59 16 L41 16 Z" fill="none" stroke="var(--sc-line)" stroke-width="1.4"/>
    <g class="psc-flag"><line x1="50" y1="16" x2="50" y2="5" stroke="var(--sc-cup)" stroke-width="1.6"/>
      <path d="M50 5 L62 8.5 L50 12 Z" fill="var(--sc-flag)"/></g>
    <circle cx="50" cy="74" r="3.2" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".6"/>
  </svg>`;
}
/* Green que crece: óvalo en perspectiva cuyo tamaño/verdor sube con % */
function girScene(p) {
  const sc = 0.34 + 0.66 * Math.sqrt(p / 100);
  const rx = (36 * sc).toFixed(1), ry = (15 * sc).toFixed(1);
  const topY = (50 - ry).toFixed(1);
  return `<svg viewBox="0 0 100 84" class="psc-svg" preserveAspectRatio="xMidYMid meet">
    <defs><radialGradient id="grng" cx="50%" cy="38%" r="70%">
      <stop offset="0" stop-color="var(--sc-lit)"/><stop offset="1" stop-color="var(--sc-grass2)"/>
    </radialGradient></defs>
    <ellipse cx="50" cy="64" rx="44" ry="9" fill="var(--sc-dim)"/>
    <ellipse cx="50" cy="50" rx="37" ry="15.5" fill="none" stroke="var(--sc-line)" stroke-width="1.2" stroke-dasharray="4 4" opacity=".55"/>
    <ellipse class="psc-grow" cx="50" cy="50" rx="${rx}" ry="${ry}" fill="url(#grng)" stroke="var(--sc-grass2)" stroke-width="1"/>
    <g class="psc-flag"><line x1="58" y1="${topY}" x2="58" y2="${(+topY - 22).toFixed(1)}" stroke="var(--sc-cup)" stroke-width="1.6"/>
      <path d="M58 ${(+topY - 22).toFixed(1)} L70 ${(+topY - 18.5).toFixed(1)} L58 ${(+topY - 15).toFixed(1)} Z" fill="var(--sc-flag)"/>
      <ellipse cx="58" cy="${topY}" rx="2.4" ry="1" fill="var(--sc-cup)"/></g>
    <circle cx="42" cy="52" r="3" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".6"/>
  </svg>`;
}
/* Up&down: el hoyo se acerca a la bola conforme sube el % */
function udScene(p) {
  // la bola se acerca al hoyo conforme sube el % (chip salvado)
  const bx = (28 + 22 * p / 100).toFixed(1), by = (58 - 14 * p / 100).toFixed(1);
  return `<svg viewBox="0 0 100 84" class="psc-svg" preserveAspectRatio="xMidYMid meet">
    <defs><radialGradient id="udg" cx="52%" cy="38%" r="70%"><stop offset="0" stop-color="var(--sc-lit)"/><stop offset="1" stop-color="var(--sc-grass2)"/></radialGradient></defs>
    <ellipse cx="50" cy="62" rx="44" ry="10" fill="var(--sc-dim)"/>
    <ellipse cx="55" cy="42" rx="28" ry="12" fill="url(#udg)" stroke="var(--sc-grass2)" stroke-width="1"/>
    <ellipse cx="55" cy="40" rx="2.6" ry="1.1" fill="var(--sc-cup)"/>
    <line x1="55" y1="40" x2="55" y2="18" stroke="var(--sc-cup)" stroke-width="1.6"/>
    <path d="M55 18 L67 21 L55 24 Z" fill="var(--sc-flag)"/>
    <path d="M${bx} ${by} Q ${((+bx + 55) / 2).toFixed(1)} ${(+by - 16).toFixed(1)} 53 41" fill="none" stroke="var(--sc-line)" stroke-width="1.3" stroke-dasharray="2.5 3" opacity=".6"/>
    <circle cx="${bx}" cy="${by}" r="3.3" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".6"/>
  </svg>`;
}
/* "chispa": qué tan encendido va tu golfista según tus jugadas buenas recientes (0..1) */
function golferSpark(u) {
  try {
    const uid = u && u.id;
    const rounds = ((typeof S !== 'undefined' && S.rounds) || []).filter(r => r.userId === uid).slice(-3);
    let good = 0, tot = 0;
    rounds.forEach(r => (r.holes || []).forEach(h => {
      if (!h || h.score == null) return;
      tot++;
      const d = h.score - h.par;
      if (d <= -1) good += 1.4;            // birdie o mejor
      else if (d === 0) good += 1;          // par
      else if (h.upDown === true) good += 0.7; // salvada
      else if (h.app === 'gir') good += 0.4;   // green en regulación
    }));
    if (!tot) return 0;
    return Math.max(0, Math.min(1, good / tot));
  } catch (e) { return 0; }
}
/* color del aura del golfista (lo elige el jugador; 'rank' o 'mono' usan el rango/plata) */
function outfitGlow(u) {
  const k = (u && u.outfit) || 'rank';
  if (k === 'mono') return '#e3eaee';
  const o = OUTFITS.find(x => x.k === k);
  if (!o || o.sw === 'rank') { const r = RANKS[rankIdx(u && u.hcp)] || RANKS[0]; return r.c; }
  return o.sw;
}
function avatarImg(u, cls, lit) {
  if (u && u.avatarEmoji) {
    const col = outfitGlow(u);
    const glow = `drop-shadow(0 0 7px ${col}) drop-shadow(0 0 16px ${col}) drop-shadow(0 4px 5px rgba(20,40,10,.25))`;
    return `<span class="golfer av-emoji ${cls || ''}" aria-hidden="true" style="filter:${glow}">${u.avatarEmoji}</span>`;
  }
  const r = RANKS[rankIdx(u && u.hcp)] || RANKS[0];
  const spark = lit ? 1 : golferSpark(u);
  let fil;
  if (spark < 0.2) {
    // apagado: monito gris (colores naturales desaturados, sin tintes raros)
    fil = 'grayscale(0.92) brightness(1.06) contrast(0.96)';
  } else {
    // encendido: conserva sus colores naturales y gana un aura del color elegido
    const col = outfitGlow(u);
    const base = 1 + r.aura;
    let glow = ` drop-shadow(0 0 ${(3 + spark * base * 1.5).toFixed(0)}px ${col})`;
    if (spark >= 0.7) glow += ` drop-shadow(0 0 ${(6 + spark * base * 1.3).toFixed(0)}px ${col})`;
    const sat = spark < 0.5 ? 'saturate(0.82) ' : '';   // a media chispa todavía se está "prendiendo"
    fil = `${sat}${glow}`.trim();
  }
  const hue = (u && u.avatarHue) ? `hue-rotate(${u.avatarHue}deg) ` : '';
  fil = (hue + (fil || '')).trim();
  return `<img class="golfer ${cls || ''}" src="${avatarSrc(u)}"${fil ? ` style="filter:${fil}"` : ''} alt="" loading="lazy">`;
}
const GOLF_HUES = [{ h: 0, c: '#ff8a3d' }, { h: 25, c: '#ff5a3d' }, { h: 330, c: '#ff5a8a' }, { h: 285, c: '#9a5cd0' }, { h: 210, c: '#3a8fe0' }, { h: 165, c: '#2fa36b' }, { h: 110, c: '#7bbf3a' }, { h: 60, c: '#f2c33a' }];
/* outfits icónicos del golf — preconfigurados (SVG) */
const GOLF_OUTFITS = [
  { k: 'tiger', n: 'Tiger domingo', cfg: { type: 'hombre', skin: '#9c6b40', hair: '#1a1a1a', cap: '#1a1a1a', shirt: '#d11f2a', pants: '#16181c', face: 'normal' } },
  { k: 'vintage', n: 'Vintage', cfg: { type: 'hombre', skin: '#f6d0aa', hair: '#5a3a1e', cap: '#efe2c2', shirt: '#efe2c2', pants: '#7a5a32', face: 'glasses' } },
  { k: 'happy', n: 'Happy Gilmore', cfg: { type: 'hombre', skin: '#f6d0aa', hair: '#a86b2e', cap: 'none', shirt: '#15457a', pants: '#2a3550', face: 'normal' } },
  { k: 'clasico', n: 'Clásico', cfg: { type: 'hombre', skin: '#eab07c', hair: '#2a1c12', cap: '#2a3550', shirt: '#ffffff', pants: '#2a3550', face: 'normal' } },
  { k: 'lima', n: 'Lima', cfg: { type: 'hombre', skin: '#f6d0aa', hair: '#2a1c12', cap: '#16241A', shirt: '#7cc24a', pants: '#16241A', face: 'shades' } },
  { k: 'sky', n: 'Cielo', cfg: { type: 'hombre', skin: '#c98f5f', hair: '#1a1a1a', cap: '#ffffff', shirt: '#3a8fe0', pants: '#16241A', face: 'normal' } },
  { k: 'rosa', n: 'Rosa', cfg: { type: 'mujer', skin: '#eab07c', hair: '#2a1c12', cap: 'none', shirt: '#ff6a88', pants: '#ffffff', face: 'normal' } },
  { k: 'sunset', n: 'Atardecer', cfg: { type: 'mujer', skin: '#9c6b40', hair: '#1a1a1a', cap: 'none', shirt: '#ff8a3d', pants: '#2a3550', face: 'shades' } },
];

/* ============ Íconos de golf (SVG con look 3D + animación sutil) ============ */
const GOLF_ICONS = {
  ball: `<ellipse cx="16" cy="28" rx="8" ry="2" fill="#000" opacity=".28"/><circle cx="16" cy="15" r="11" fill="#cdd5d7"/><circle cx="16" cy="15" r="11" fill="#fff" opacity=".25"/><circle cx="12" cy="11" r="4" fill="#fff" opacity=".85"/><g fill="#aab4b6"><circle cx="16" cy="15" r="1"/><circle cx="20" cy="13" r="1"/><circle cx="20" cy="18" r="1"/><circle cx="13" cy="18" r="1"/><circle cx="16" cy="20" r="1"/></g>`,
  flag: `<ellipse cx="16" cy="28" rx="11" ry="2.6" fill="#2f6b39"/><ellipse cx="16" cy="27.4" rx="7" ry="1.6" fill="#57b15c"/><rect x="14.7" y="5" width="1.8" height="22" rx=".9" fill="#cdd6c2"/><g class="gi-wave" style="transform-origin:15.6px 6px"><path d="M16.2 5 L27 8.6 L16.2 12.2 Z" fill="#7cc24a"/></g><circle cx="15.6" cy="5" r="1.8" fill="#eef3e6"/>`,
  tee: `<ellipse cx="16" cy="29" rx="8" ry="2" fill="#000" opacity=".25"/><circle cx="16" cy="9" r="6.5" fill="#cdd5d7"/><circle cx="13.5" cy="6.5" r="2.2" fill="#fff" opacity=".85"/><path d="M11.5 16 L20.5 16 L17.5 22 L16.8 28 L15.2 28 L14.5 22 Z" fill="#7cc24a"/>`,
  club: `<ellipse cx="17" cy="29" rx="8" ry="2" fill="#000" opacity=".22"/><rect x="14.5" y="4" width="2" height="18" rx="1" fill="#b9c2c4" transform="rotate(8 15.5 13)"/><path d="M9 21 q-1 6 6 6 q7 0 7-5 l-2 0 q0 3 -5 3 q-4 0 -4-4 Z" fill="#9aa6a8"/><ellipse cx="11" cy="22.5" rx="2.4" ry="3.2" fill="#cdd5d7"/>`,
  green: `<ellipse cx="16" cy="18" rx="13" ry="9" fill="#2f6b39"/><ellipse cx="16" cy="17" rx="9" ry="6" fill="#57b15c"/><ellipse cx="16" cy="16.5" rx="4.5" ry="3" fill="#6cc471"/><rect x="15.3" y="4" width="1.5" height="13" rx=".7" fill="#cdd6c2"/><g class="gi-wave" style="transform-origin:16px 5px"><path d="M16.6 4 L24 6.4 L16.6 9 Z" fill="#7cc24a"/></g>`,
  trophy: `<rect x="12" y="23" width="8" height="3" rx="1" fill="#b98a2e"/><rect x="10" y="26" width="12" height="2.6" rx="1.2" fill="#cf9a36"/><path d="M10 6 h12 v5 a6 6 0 0 1 -12 0 Z" fill="#ffcf5a"/><path d="M10 6 h12 v5 a6 6 0 0 1 -12 0 Z" fill="#fff" opacity=".0"/><path d="M10 7 q-4 0 -4 3 q0 4 5 4" fill="none" stroke="#cf9a36" stroke-width="1.6"/><path d="M22 7 q4 0 4 3 q0 4 -5 4" fill="none" stroke="#cf9a36" stroke-width="1.6"/><rect x="15" y="17" width="2" height="6" fill="#cf9a36"/><path class="gi-glint" d="M13 7 l1.5 0 -3 7 -1.5 0 Z" fill="#fff" opacity=".5"/>`,
  medal: `<path d="M11 4 L14 14 L10 14 Z" fill="#5aa9e0"/><path d="M21 4 L22 14 L18 14 Z" fill="#ff7a6b"/><circle cx="16" cy="21" r="8" fill="#ffcf5a"/><circle cx="16" cy="21" r="5.4" fill="#e7b23e"/><path class="gi-glint" d="M13 16 l1.6 0 -4 9 -1.6 0 Z" fill="#fff" opacity=".55"/><path d="M16 17 l1.3 2.7 2.9 .3 -2.2 2 .7 2.9 -2.7 -1.5 -2.7 1.5 .7 -2.9 -2.2 -2 2.9 -.3 Z" fill="#7a5a13"/>`,
  bucket: `<ellipse cx="16" cy="28" rx="9" ry="2" fill="#000" opacity=".22"/><g fill="#cdd5d7"><circle cx="12" cy="11" r="3"/><circle cx="19" cy="10" r="3"/><circle cx="16" cy="13" r="3"/></g><path d="M8 15 h16 l-2 12 a2 2 0 0 1 -2 2 h-8 a2 2 0 0 1 -2 -2 Z" fill="#9aa6a8"/><path d="M9 18 h14" stroke="#7f8b8d" stroke-width="1.4"/>`,
  putter: `<ellipse cx="16" cy="29" rx="8" ry="1.8" fill="#000" opacity=".2"/><rect x="18" y="4" width="2" height="16" rx="1" fill="#b9c2c4"/><rect x="8" y="19" width="13" height="3" rx="1.5" fill="#9aa6a8"/><circle cx="9" cy="26" r="3" fill="#cdd5d7"/><ellipse cx="20" cy="27" rx="5" ry="2" fill="#2f6b39"/><ellipse cx="20" cy="26.6" rx="2.4" ry="1" fill="#0a0f08"/>`,
  card: `<rect x="7" y="6" width="18" height="20" rx="2.5" fill="#e9eef0"/><rect x="7" y="6" width="18" height="5" rx="2.5" fill="#7cc24a"/><g stroke="#9aa6a8" stroke-width="1.4"><path d="M10 15 h12"/><path d="M10 19 h12"/><path d="M10 23 h8"/></g>`,
  bird: `<ellipse cx="16" cy="27" rx="8" ry="2" fill="#000" opacity=".2"/><path d="M6 16 q4 -3 8 -1 q5 -8 12 -7 q-3 3 -3 6 q3 1 3 4 q-5 5 -12 4 q-6 -1 -8 -10 Z" fill="#7cc24a"/><circle cx="22" cy="13" r="1.2" fill="#0a0f08"/><path d="M26 13 l3 -1 -3 -1 Z" fill="#ffcf5a"/>`,
  peak: `<path d="M3 27 L13 9 L17 17 L21 11 L29 27 Z" fill="#3a4a30"/><path d="M13 9 L9.5 16 L16.5 16 Z" fill="#eef3e6"/><rect x="20.5" y="4" width="1.5" height="9" rx=".7" fill="#cdd6c2"/><g class="gi-wave" style="transform-origin:21px 5px"><path d="M21.8 4 L28 6 L21.8 8.4 Z" fill="#7cc24a"/></g>`,
  hand: `<path d="M11 16 V8 a1.6 1.6 0 0 1 3.2 0 v6 m0 -1 V6.5 a1.6 1.6 0 0 1 3.2 0 V14 m0 -1 V7.5 a1.6 1.6 0 0 1 3.2 0 V15 m0 -2 a1.6 1.6 0 0 1 3.2 0 v5 a7 7 0 0 1 -7 7 h-2 a7 7 0 0 1 -6 -4 l-2.5 -4 a1.7 1.7 0 0 1 2.8 -1.8 L11 18 Z" fill="#ddcb8c"/>`,
};
/* ====== Bolsa de golf visual: clubs abanicados según los que tengas ====== */
function golfBagSVG(ids) {
  const list = (ids || []).map(id => (typeof CLUBS !== 'undefined' ? CLUBS.find(c => c.id === id) : null)).filter(Boolean);
  const n = Math.min(list.length, 14);
  const cx = 100, oy = 122, spread = 86;
  let shafts = '';
  for (let i = 0; i < n; i++) {
    const c = list[i];
    const tpos = n > 1 ? i / (n - 1) : 0.5;
    const ang = (-spread / 2 + spread * tpos) * Math.PI / 180;
    const len = 72 + (i % 2) * 9;
    const ex = cx + Math.sin(ang) * len, ey = oy - Math.cos(ang) * len;
    const deg = (ang * 180 / Math.PI).toFixed(0);
    const isWood = c.group === 'largo';
    const col = isWood ? 'var(--bag-wood)' : c.group === 'wedges' ? 'var(--bag-wedge)' : 'var(--bag-iron)';
    shafts += `<line x1="${cx}" y1="${oy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="var(--bag-shaft)" stroke-width="2.3" stroke-linecap="round"/>`;
    shafts += isWood
      ? `<ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="7" ry="5" fill="${col}" transform="rotate(${deg} ${ex.toFixed(1)} ${ey.toFixed(1)})"/>`
      : `<rect x="${(ex - 4.2).toFixed(1)}" y="${(ey - 5.5).toFixed(1)}" width="8.4" height="10" rx="1.8" fill="${col}" transform="rotate(${deg} ${ex.toFixed(1)} ${ey.toFixed(1)})"/>`;
  }
  const bag = `
    <ellipse cx="100" cy="200" rx="44" ry="7" fill="var(--sc-shadow,rgba(20,40,15,.12))"/>
    <path d="M70 122 Q70 113 79 113 L121 113 Q130 113 130 122 L133 190 Q133 198 124 198 L76 198 Q67 198 67 190 Z" fill="var(--bag-body)"/>
    <rect x="74" y="132" width="52" height="32" rx="8" fill="var(--bag-pocket)"/>
    <rect x="84" y="143" width="32" height="5" rx="2.5" fill="var(--bag-line)"/>
    <rect x="84" y="152" width="22" height="4" rx="2" fill="var(--bag-line)"/>
    <path d="M129 126 q17 30 6 66" fill="none" stroke="var(--bag-strap)" stroke-width="5.5" stroke-linecap="round"/>
    <ellipse cx="100" cy="118" rx="33" ry="6.5" fill="var(--bag-rim)"/>
    <ellipse cx="100" cy="117" rx="27" ry="4.5" fill="var(--bag-hole)"/>`;
  return `<svg viewBox="0 24 200 184" class="bag-svg" aria-hidden="true">${shafts}${bag}</svg>`;
}

function heartIcon() { return `<svg class="fdi" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.7 9 2 5.6 5.2 5.1 7.2 4.8 9 5.9 12 8.8c3-2.9 4.8-4 6.8-3.7C22 5.6 23.3 9 22 11.7 19.5 16.4 12 21 12 21z"/></svg>`; }
function commentIcon() { return `<svg class="fdi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.9-5A8 8 0 1 1 21 12z"/></svg>`; }

/* ====== Escenas 3D binarias para el registro de ronda (tócalas para marcar) ====== */
function chkScene(kind, on) {
  if (kind === 'fw') return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <defs><linearGradient id="hsfw" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--sc-lit)"/><stop offset="1" stop-color="var(--sc-grass2)"/></linearGradient></defs>
    <ellipse cx="50" cy="52" rx="38" ry="4.5" fill="var(--sc-shadow)"/>
    <path d="M30 54 L70 54 L60 8 L40 8 Z" fill="${on ? 'url(#hsfw)' : 'var(--sc-dim)'}" stroke="var(--sc-line)" stroke-width="1.1"/>
    <line x1="50" y1="8" x2="50" y2="54" stroke="var(--sc-line)" stroke-width="1" stroke-dasharray="3 4" opacity=".45"/>
    <line x1="50" y1="8" x2="50" y2="2" stroke="var(--sc-cup)" stroke-width="1.3"/><path d="M50 2 L59 4.6 L50 7.2 Z" fill="var(--sc-flag)"/>
    <g class="hs-fly"><circle cx="${on ? 50 : 78}" cy="${on ? 44 : 47}" r="3" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".5"/></g>
  </svg>`;
  if (kind === 'gir') return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <defs><radialGradient id="hsgir" cx="50%" cy="36%" r="70%"><stop offset="0" stop-color="var(--sc-lit)"/><stop offset="1" stop-color="var(--sc-grass2)"/></radialGradient></defs>
    <ellipse cx="50" cy="46" rx="40" ry="8" fill="var(--sc-dim)"/>
    <ellipse cx="50" cy="32" rx="30" ry="12" fill="${on ? 'url(#hsgir)' : 'var(--sc-dim)'}" stroke="var(--sc-grass2)" stroke-width="1"/>
    <line x1="50" y1="24" x2="50" y2="6" stroke="var(--sc-cup)" stroke-width="1.3"/><path d="M50 6 L59 8.6 L50 11.2 Z" fill="var(--sc-flag)"/>
    <ellipse cx="50" cy="24" rx="2" ry=".8" fill="var(--sc-cup)"/>
    <circle cx="${on ? 44 : 50}" cy="${on ? 34 : 50}" r="3" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".5"/>
  </svg>`;
  if (kind === 'ud') {
    const cx = on ? 44 : 72, cy = on ? 42 : 24, cr = on ? 4.6 : 3.4;
    return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
      <ellipse cx="50" cy="48" rx="42" ry="7" fill="var(--sc-dim)"/>
      <path d="M26 42 Q ${((26 + cx) / 2).toFixed(0)} ${(cy + 8).toFixed(0)} ${cx} ${cy}" fill="none" stroke="var(--sc-line)" stroke-width="1.3" stroke-dasharray="2.5 3" opacity=".7"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${cr}" ry="${(cr * 0.42).toFixed(1)}" fill="var(--sc-cup)"/>
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 18}" stroke="var(--sc-cup)" stroke-width="1.3"/><path d="M${cx} ${cy - 18} L${cx + 9} ${cy - 15.4} L${cx} ${cy - 12.8} Z" fill="var(--sc-flag)"/>
      <circle cx="26" cy="42" r="3.2" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".5"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 100 56" class="hs-svg" aria-hidden="true">
    <defs><linearGradient id="hspen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-water1)"/><stop offset="1" stop-color="var(--sc-water2)"/></linearGradient></defs>
    <ellipse cx="48" cy="50" rx="40" ry="5" fill="var(--sc-dim)"/>
    <ellipse cx="${on ? 50 : 38}" cy="40" rx="${on ? 34 : 18}" ry="${on ? 13 : 7}" fill="url(#hspen)" stroke="var(--sc-water2)" stroke-width=".8" opacity="${on ? 1 : .8}"/>
    ${on ? `<ellipse cx="50" cy="40" rx="9" ry="3.4" fill="none" stroke="#fff" stroke-width="1" opacity=".7"/><ellipse cx="50" cy="40" rx="15" ry="5.6" fill="none" stroke="#fff" stroke-width=".8" opacity=".38"/>` : ''}
    <circle cx="${on ? 50 : 80}" cy="${on ? 40 : 45}" r="3" fill="var(--sc-ball)" stroke="var(--sc-line)" stroke-width=".5"/>
  </svg>`;
}

function golfIcon(name, cls = '') {
  const body = GOLF_ICONS[name] || GOLF_ICONS.flag;
  return `<span class="gi ${cls}"><svg viewBox="0 0 32 32" aria-hidden="true">${body}</svg></span>`;
}

/* ============ Birdie · chatbot de ayuda (app + landing) ============ */
const BOT_HELLO = '¡Hola! Soy Birdie, tu asistente de PARFECT. Pregúntame lo que quieras de la app o tu juego.';
const BOT_QUICKS = ['¿Cómo registro una ronda?', '¿Qué es el Análisis IA?', '¿Cómo entreno?', '¿Es gratis?'];
function chatBotIcon() {
  return `<img src="assets/eagle.png" class="chatico" alt="" aria-hidden="true">`;
}
function botReply(text) {
  const t = String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const has = (...ks) => ks.some(k => t.includes(k));
  if (has('hola', 'buenas', 'hey', 'que tal', 'saludos')) return '¡Hola! ¿Te ayudo con tus rondas, tu entrenamiento o cómo funciona PARFECT?';
  if (has('gracias', 'grac')) return '¡De nada! Aquí estoy para lo que necesites. 🏌️';
  if (has('ronda', 'registr', 'tarjeta', 'score', 'anotar', 'apunt')) return 'Para registrar una ronda: toca el botón verde "P" abajo al centro, elige tu campo y anota hoyo por hoyo tus fairways, greens, up & down y putts. Al terminar verás tu resumen y se guarda en tu historial.';
  if (has('analisis', 'ia ', ' ia', 'coach', 'diagnost')) return 'El Análisis IA cruza tus rondas y te dice exactamente dónde pierdes golpes, en orden de prioridad. Con el botón "Entrenar con AI Coach" arma una sesión según tu tiempo y tus puntos débiles.';
  if (has('entren', 'practic', 'sesion', 'drill', 'ejercicio')) return 'En la pestaña Trainer eliges tu tiempo y luego: AI Coach (la IA arma tu sesión) o Entrenamiento libre (cronometra un bastón o un ejercicio de la biblioteca). Al terminar se guarda tu práctica.';
  if (has('academia', 'aprend', 'leccion', 'nivel', 'quiz', 'pregunt')) return 'La Academia tiene 18 niveles tipo trivia para aprender golf paso a paso. Pasa cada nivel para desbloquear el siguiente. La encuentras en la pestaña Trainer → Academia.';
  if (has('amigo', 'social', 'torneo', 'party', 'leaderboard', 'reta')) return 'En Social juegas con amigos: partidas por código, leaderboard en vivo y compartes tu tarjeta. ¡El golf es mejor en bola!';
  if (has('gratis', 'precio', 'cuesta', 'costo', 'pago', 'pagar', 'plan')) return 'PARFECT es gratis para empezar y tus datos viven en tu dispositivo. Solo crea tu cuenta y a jugar.';
  if (has('handicap', 'hcp', 'indice')) return 'PARFECT sigue tu hándicap automáticamente con cada ronda que registras y te muestra tu progreso hacia tu meta.';
  if (has('perfil', 'cuenta', 'avatar', 'foto', 'nombre')) return 'Toca tu avatar arriba a la derecha para personalizar tu perfil: tu golfista, hándicap, meta y campo de casa.';
  if (has('logro', 'trofeo', 'rango', 'meta')) return 'Cada meta que cumples desbloquea logros y trofeos míticos. Los ves en Trainer → Logros.';
  return 'Buena pregunta. Puedo ayudarte con: registrar rondas, el Análisis IA, cómo entrenar, la Academia, jugar con amigos o tu perfil. ¿Cuál te interesa?';
}
function chatScrollBottom() { const b = document.getElementById('chat-body'); if (b) b.scrollTop = b.scrollHeight; }
/* compartir texto (reporte): nativo si se puede, si no al portapapeles */
function shareReport(text) {
  const t = String(text || '').trim(); if (!t) return;
  try {
    if (navigator.share) { navigator.share({ title: 'PARFECT', text: t }).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(t).then(() => { if (typeof celebrate === 'function') celebrate(false, 'Copiado ✓'); }); }
    else if (typeof celebrate === 'function') celebrate(false, 'Listo');
  } catch (e) { if (typeof celebrate === 'function') celebrate(false, 'Listo'); }
}
/* Envía un mensaje de Birdie: usa el AI Coach real (Edge Function) si está
   disponible, con indicador de "escribiendo…"; si no, cae al guion local. */
function sendChat(txt) {
  txt = String(txt || '').trim(); if (!txt) return;
  V.chat = V.chat || { open: true, msgs: [] };
  V.chat.open = true;
  V.chat.msgs.push({ from: 'me', text: txt });
  const focusInput = () => { const i = document.getElementById('chat-text'); if (i) i.focus(); chatScrollBottom(); };
  if (typeof AI !== 'undefined' && AI.on()) {
    const ph = { from: 'bot', text: '', typing: true };
    V.chat.msgs.push(ph);
    render(); setTimeout(focusInput, 40);
    AI.chat(V.chat.msgs).then(res => {
      ph.typing = false;
      ph.text = (res && res.ok && res.text) ? res.text : botReply(txt);
      render(); setTimeout(chatScrollBottom, 40);
    });
  } else {
    V.chat.msgs.push({ from: 'bot', text: botReply(txt) });
    render(); setTimeout(focusInput, 40);
  }
}
function chatWidget(where) {
  const c = V.chat || { open: false, msgs: [] };
  const mount = `chat-mount${where === 'app' ? ' in-app' : ''}`;
  if (!c.open) {
    return `<div class="${mount}"><button class="chat-fab" data-act="chat-open" aria-label="Abrir asistente">${chatBotIcon()}</button></div>`;
  }
  const list = (c.msgs && c.msgs.length ? c.msgs : [{ from: 'bot', text: BOT_HELLO }]);
  const msgs = list.map(m => {
    const inner = m.typing ? '<span class="chat-typing"><i></i><i></i><i></i></span>' : esc(m.text).replace(/\n/g, '<br>');
    return `<div class="chatmsg ${m.from}">${m.from === 'bot' ? `<span class="chatav">${chatBotIcon()}</span>` : ''}<div class="chatbub">${inner}</div></div>`;
  }).join('');
  const quicks = BOT_QUICKS.map(q => `<button class="chatq" data-act="chat-quick" data-q="${esc(q)}">${esc(q)}</button>`).join('');
  return `<div class="${mount} open">
    <div class="chat-panel">
      <div class="chat-head"><span class="chat-head-ava">${chatBotIcon()}</span><div class="chat-head-tx"><b>Birdie</b><span class="chat-on"><i></i> Tu coach con IA · en línea</span></div><button class="chat-x" data-act="chat-close" aria-label="Cerrar">✕</button></div>
      <div class="chat-body" id="chat-body">${msgs}</div>
      <div class="chat-quicks">${quicks}</div>
      <div class="chat-input"><input id="chat-text" type="text" placeholder="Escribe tu pregunta…" autocomplete="off"><button class="chat-send-btn" data-act="chat-send" aria-label="Enviar">➤</button></div>
    </div>
  </div>`;
}

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function fmtHcp(h) {
  if (h == null || isNaN(h)) return '—';
  return h < 0 ? `+${Math.abs(h)}` : `${h}`;
}

function fmtToPar(n) {
  if (n === 0) return 'E';
  return n > 0 ? `+${n}` : `${n}`;
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ---- logo mark (golf flag swoosh) ---- */
/* P icónica de PARFECT (para botones) */
function pMark(size = 18) { return `<span class="p-ico" aria-hidden="true" style="font-size:${size}px">P</span>`; }
function logoMark(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="M8 21V4" stroke="#7cc24a" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M8 4l9 3.5L8 11" fill="#7cc24a"/>
    <path d="M5 21c2-1.4 4.6-1.4 6.6 0" stroke="#7cc24a" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}
/* logo PARFECT (texto normal) */
function pLogo() {
  return `PARFECT`;
}

const ICONS = {
  inicio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>`,
  ronda: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21V4"/><path d="M7 4l10 3.8L7 11.5"/><circle cx="16" cy="19" r="2"/></svg>`,
  trainer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></svg>`,
  social: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c.8-3.2 3.2-5 6.2-5s5.4 1.8 6.2 5"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M16.2 14.6c2.7.2 4.4 1.9 5 4.4"/></svg>`,
  feat_round: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round"><path d="M7 21V4"/><path d="M7 4l10 3.8L7 11.5"/></svg>`,
  feat_stats: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>`,
  feat_ai: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg>`,
  feat_track: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>`,
  perfil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.2-3.6 4.2-5.5 8-5.5s6.8 1.9 8 5.5"/></svg>`,
};

/* ============ Radar chart (6 axes, 0–100) ============ */
function radarSVG(labels, values) {
  const W = 370, H = 300;
  const cx = W / 2, cy = H / 2, R = H / 2 - 46;
  const n = labels.length;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = f => labels.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const poly = values.map((v, i) => pt(i, (R * Math.max(v, 5)) / 100).join(',')).join(' ');
  const axes = labels.map((_, i) => {
    const [x, y] = pt(i, R);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="radar-grid"/>`;
  }).join('');
  const labs = labels.map((l, i) => {
    const [x, y] = pt(i, R + 24);
    let anchor = 'middle';
    if (x < cx - 8) anchor = 'end';
    if (x > cx + 8) anchor = 'start';
    return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" class="radar-label">${esc(l)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Perfil de habilidades">
    ${[0.33, 0.66, 1].map(f => `<polygon points="${ring(f)}" class="radar-grid"/>`).join('')}
    ${axes}
    ${labs}
    <polygon points="${poly}" class="radar-val"/>
    <circle cx="${cx}" cy="${cy}" r="15" class="radar-core"/>
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" class="radar-p">P</text>
  </svg>`;
}

/* ============ Line chart (score evolution) ============ */
function lineSVG(points, { w = 560, h = 130 } = {}) {
  if (!points || points.length < 2) {
    return `<div class="chart-empty">Registra al menos 2 rondas para ver tu evolución.</div>`;
  }
  const pad = 14, padR = 46;
  const min = Math.min(...points), max = Math.max(...points);
  const span = (max - min) || 1;
  const x = i => pad + (i * (w - pad - padR)) / (points.length - 1);
  const y = v => pad + ((v - min) * (h - 2 * pad)) / span;
  const d = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const lastX = x(points.length - 1), lastY = y(points[points.length - 1]);
  const area = `${d} L${lastX.toFixed(1)},${h - 4} L${pad},${h - 4} Z`;
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7cc24a" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#7cc24a" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#lg)"/>
    <path d="${d}" fill="none" stroke="#7cc24a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastX}" cy="${lastY}" r="4.5" fill="#7cc24a"/>
    <text x="${lastX + 9}" y="${lastY + 4}" fill="#7cc24a" font-size="14" font-weight="800" font-family="Inter,system-ui">${fmtToPar(points[points.length - 1])}</text>
  </svg>`;
}

/* ============ Mini horizontal bar row ============ */
function mbar(label, pct, valText) {
  const w = Math.max(0, Math.min(100, pct));
  return `<div class="mbar">
    <span class="mb-lab">${esc(label)}</span>
    <div class="bar"><i style="width:${w}%"></i></div>
    <span class="mb-val">${esc(valText)}</span>
  </div>`;
}

/* ============ Drill art: animaciones SVG que ilustran el ejercicio ============ */
/* colores de las "gifs" según el tema actual (para que siempre combinen) */
function artTheme() {
  const dark = (typeof S !== 'undefined' && S.settings && S.settings.theme === 'dark');
  return dark
    ? { frame: '#141d36', stroke: 'rgba(150,175,255,0.16)', ground: 'rgba(150,175,255,0.12)', cap: '#8A93B2', ballStroke: ' stroke="#0b1020" stroke-width="0.8"' }
    : { frame: '#eef4e2', stroke: 'rgba(40,90,20,0.2)', ground: 'rgba(20,40,10,0.15)', cap: '#6b7a58', ballStroke: ' stroke="#1B2A18" stroke-width="0.8"' };
}
function drillArt(key, light) {
  const W = 320, H = 96;
  const A = artTheme();
  const frameFill = A.frame;
  const frameStroke = A.stroke;
  const groundCol = A.ground;
  const capCol = A.cap;
  const ballStroke = A.ballStroke;
  const frame = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${frameFill}" stroke="${frameStroke}"/>`;
  const ground = `<line x1="16" y1="78" x2="${W - 16}" y2="78" stroke="${groundCol}" stroke-width="1.5"/>`;
  const cap = t => `<text x="16" y="22" fill="${capCol}" font-size="11" font-weight="700" font-family="Inter,system-ui">${t}</text>`;
  const ball = (path, dur) => `<circle r="5" fill="#fff"${ballStroke}>
      <animateMotion dur="${dur}" repeatCount="indefinite" calcMode="linear" path="${path}"/>
      <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.08;0.5;0.85;1" dur="${dur}" repeatCount="indefinite"/>
    </circle>`;
  const flag = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="78" stroke="#7cc24a" stroke-width="2"/><path d="M${x} ${y} l12 4 -12 4z" fill="#7cc24a"/>`;
  const cup = x => `<ellipse cx="${x}" cy="78" rx="8" ry="3" fill="#0a0f06" stroke="#7cc24a" stroke-width="1.5"/>`;

  if (key === 'driving') {
    const p = 'M26 74 Q 160 -14 272 70';
    return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Tiro de salida">
      ${frame}${ground}
      <rect x="22" y="74" width="8" height="6" rx="1" fill="#7c8a70"/>
      <ellipse cx="266" cy="78" rx="46" ry="6" fill="rgba(124,194,74,0.12)" stroke="rgba(124,194,74,0.4)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="${p}" fill="none" stroke="rgba(124,194,74,0.25)" stroke-width="2" stroke-dasharray="3 6"/>
      ${ball(p, '2.6s')}${cap('Tiro de salida a la calle')}
    </svg>`;
  }
  if (key === 'approach') {
    const p = 'M28 74 Q 150 -8 268 70';
    return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Control de distancia">
      ${frame}${ground}
      <ellipse cx="262" cy="78" rx="40" ry="6" fill="rgba(124,194,74,0.10)"/>
      ${flag(268, 30)}
      <path d="${p}" fill="none" stroke="rgba(124,194,74,0.25)" stroke-width="2" stroke-dasharray="3 6"/>
      ${ball(p, '2.4s')}${cap('Approach a bandera')}
    </svg>`;
  }
  if (key === 'short') {
    const p = 'M34 72 Q 120 18 196 66 T 286 78';
    return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Up & down">
      ${frame}${ground}
      <ellipse cx="250" cy="78" rx="56" ry="6" fill="rgba(124,194,74,0.10)"/>
      ${cup(286)}
      <path d="${p}" fill="none" stroke="rgba(124,194,74,0.25)" stroke-width="2" stroke-dasharray="3 6"/>
      ${ball(p, '2.6s')}${cap('Chip y salvar par')}
    </svg>`;
  }
  // putting
  const p = 'M30 70 L286 70';
  return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Putt por el gate">
    ${frame}
    <line x1="16" y1="70" x2="${W - 16}" y2="70" stroke="${groundCol}" stroke-width="1.5"/>
    <line x1="188" y1="58" x2="188" y2="70" stroke="#7cc24a" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="208" y1="58" x2="208" y2="70" stroke="#7cc24a" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="286" cy="70" rx="8" ry="3" fill="#0a0f06" stroke="#7cc24a" stroke-width="1.5"/>
    <path d="${p}" fill="none" stroke="rgba(124,194,74,0.22)" stroke-width="2" stroke-dasharray="3 6"/>
    ${ball(p, '2.2s')}${cap('Putt por el gate')}
  </svg>`;
}

/* escena animada ÚNICA por drill (cae a drillArt por área si no hay específica) */
function drillScene(name, areaKey) {
  const n = (name || '').toLowerCase();
  const W = 320, H = 96, G = 78;
  const A = artTheme();
  const fr = `<rect x="0.5" y="0.5" width="319" height="95" rx="12" fill="${A.frame}" stroke="${A.stroke}"/>`;
  const gr = (y = G) => `<line x1="16" y1="${y}" x2="304" y2="${y}" stroke="${A.ground}" stroke-width="1.5"/>`;
  const cap = t => `<text x="16" y="20" fill="${A.cap}" font-size="10.5" font-weight="700" font-family="Inter,system-ui,sans-serif">${t}</text>`;
  const fl = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${G}" stroke="#7fb52b" stroke-width="2"/><path d="M${x} ${y} l11 3.5 -11 3.5z" fill="#7cc24a"/>`;
  const cp = (x, y = G) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="#0a2e16" stroke="#7fb52b" stroke-width="1.5"/>`;
  const bl = (path, dur, extra = '') => `<circle r="4.5" fill="#fff"${A.ballStroke}>${extra}<animateMotion dur="${dur}" repeatCount="indefinite" calcMode="linear" path="${path}"/><animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;.08;.5;.85;1" dur="${dur}" repeatCount="indefinite"/></circle>`;
  const svg = inner => `<svg viewBox="0 0 ${W} ${H}" class="drill-art" aria-hidden="true">${fr}${inner}</svg>`;

  if (n.includes('gate drill')) return svg(`${gr()}<line x1="74" y1="62" x2="74" y2="${G}" stroke="#7cc24a" stroke-width="3" stroke-linecap="round"/><line x1="100" y1="62" x2="100" y2="${G}" stroke="#7cc24a" stroke-width="3" stroke-linecap="round"/><ellipse cx="272" cy="${G}" rx="28" ry="5" fill="rgba(124,194,74,0.12)"/>${bl('M44 74 Q 170 -10 286 74', '3s')}${cap('Gate de alineación')}`);
  if (n.includes('14 calles')) return svg(`${gr()}<rect x="150" y="71" width="120" height="7" rx="3.5" fill="#2f6b39"/><g stroke="#7cc24a" stroke-width="2"><line x1="180" y1="67" x2="180" y2="74"/><line x1="210" y1="67" x2="210" y2="74"/><line x1="240" y1="67" x2="240" y2="74"/></g>${bl('M34 74 Q 150 -8 210 72', '2.6s')}${cap('14 calles a presión')}`);
  if (n.includes('madera 3')) return svg(`${gr()}<path d="M44 74 Q 150 -12 256 58" fill="none" stroke="rgba(255,120,107,0.3)" stroke-dasharray="3 5"/><path d="M44 74 Q 150 2 256 72" fill="none" stroke="rgba(124,194,74,0.3)" stroke-dasharray="3 5"/>${bl('M44 74 Q 150 -12 256 58', '3s')}<circle r="4" fill="#7cc24a"><animateMotion dur="3s" begin="1.3s" repeatCount="indefinite" calcMode="linear" path="M44 74 Q 150 2 256 72"/></circle>${cap('Driver vs Madera 3')}`);
  if (n.includes('escalera')) return svg(`${gr()}${[120, 200, 268].map((x, i) => `<ellipse cx="${x}" cy="${G}" rx="13" ry="4" fill="rgba(124,194,74,0.12)"/><circle r="4" fill="#fff"><animateMotion dur="3s" begin="${i * 0.6}s" repeatCount="indefinite" calcMode="linear" path="M34 74 Q ${(34 + x) / 2} -6 ${x} 74"/><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.1;.45;.55;1" dur="3s" begin="${i * 0.6}s" repeatCount="indefinite"/></circle>`).join('')}${cap('Escalera de distancias')}`);
  if (n.includes('reloj con wedges')) return svg(`<circle cx="64" cy="50" r="26" fill="none" stroke="rgba(124,194,74,0.28)" stroke-width="2"/><circle cx="64" cy="50" r="2.5" fill="#7cc24a"/><line x1="64" y1="50" x2="64" y2="28" stroke="#7cc24a" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="-35 64 50;-95 64 50;-35 64 50" dur="2.6s" repeatCount="indefinite"/></line>${fl(268, 46)}${bl('M118 60 Q 200 8 260 72', '2.6s')}${cap('Reloj de wedges')}`);
  if (n.includes('pin high')) return svg(`${gr()}${fl(244, 40)}<line x1="120" y1="62" x2="266" y2="62" stroke="rgba(124,194,74,0.25)" stroke-width="1.5" stroke-dasharray="3 5"/>${bl('M34 74 Q 150 -2 232 62', '2.8s')}${cap('Pin high siempre')}`);
  if (n.includes('up & down')) return svg(`${gr()}<ellipse cx="44" cy="76" rx="18" ry="6" fill="#43331a"/>${cp(268)}${fl(268, 46)}${bl('M44 72 Q 140 6 232 70 L260 76', '3.2s')}${cap('Up & down')}`);
  if (n.includes('landing spot')) return svg(`${gr()}<rect x="180" y="70" width="26" height="6" rx="2" fill="#5aa9e0"/>${cp(272)}${fl(272, 46)}${bl('M40 72 Q 120 4 193 70 L266 76', '3.2s')}${cap('Landing spot (toalla)')}`);
  if (n.includes('splash')) return svg(`${gr()}<ellipse cx="64" cy="76" rx="32" ry="8" fill="#ddcb8c"/>${cp(270)}${fl(270, 46)}<g fill="#ddcb8c"><circle cx="58" cy="70" r="1.6"><animate attributeName="cy" values="70;54;72" dur="2.6s" repeatCount="indefinite"/></circle><circle cx="72" cy="70" r="1.4"><animate attributeName="cy" values="70;50;72" dur="2.6s" begin="0.12s" repeatCount="indefinite"/></circle></g>${bl('M64 70 Q 160 2 258 72', '2.6s')}${cap('Splash de bunker')}`);
  if (n.includes('lag putting')) return svg(`${gr()}${cp(252)}<circle cx="252" cy="${G}" r="22" fill="none" stroke="rgba(124,194,74,0.32)" stroke-width="1.2" stroke-dasharray="3 3"/><path d="M40 ${G} L236 ${G}" stroke="rgba(124,194,74,0.18)" stroke-dasharray="3 6"/><circle r="4.5" fill="#fff"><animateMotion dur="3s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;.66;1" path="M40 ${G} L236 ${G}"/></circle>${cap('Lag a círculo de 1 m')}`);
  if (n.includes('gate de putter')) return svg(`${gr(70)}<line x1="190" y1="58" x2="190" y2="70" stroke="#7cc24a" stroke-width="2.5" stroke-linecap="round"/><line x1="210" y1="58" x2="210" y2="70" stroke="#7cc24a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="272" cy="70" rx="8" ry="3" fill="#0a0f06" stroke="#7cc24a" stroke-width="1.5"/><path d="M40 70 L272 70" stroke="rgba(124,194,74,0.2)" stroke-dasharray="3 6"/><circle fill="#fff"><animateMotion dur="2.4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;.72;1" path="M40 70 L272 70"/><animate attributeName="r" values="4.5;4.5;0;0" keyTimes="0;.68;.74;1" dur="2.4s" repeatCount="indefinite"/></circle>${cap('Gate de putter')}`);
  if (n.includes('reloj de 1.5')) {
    const cx = 160, cy = 46, R = 30;
    const dots = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i / 8 * Math.PI * 2; return `<circle cx="${(cx + Math.cos(a) * R).toFixed(0)}" cy="${(cy + Math.sin(a) * R * 0.7).toFixed(0)}" r="2.2" fill="rgba(124,194,74,0.4)"/>`; }).join('');
    return svg(`<ellipse cx="${cx}" cy="${cy}" rx="8" ry="4" fill="#0a0f06" stroke="#7cc24a" stroke-width="1.5"/>${dots}<circle fill="#fff"><animateMotion dur="2.2s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;.6;1" path="M${cx + R} ${cy} L${cx} ${cy}"/><animate attributeName="r" values="4.5;4.5;0;0" keyTimes="0;.56;.62;1" dur="2.2s" repeatCount="indefinite"/></circle>${cap('Reloj de 1.5 m')}`);
  }
  const artMap = { fw: 'driving', gir: 'approach', ud: 'short', putt: 'putting' };
  return drillArt(artMap[areaKey] || areaKey || 'putting');
}

/* mini-escenas animadas para el registro de hoyo (gif: bola a la calle, al green, putt…) */
function regScene(kind) {
  const W = 58, H = 42;
  const ball = (path, dur, extra = '') => `<circle r="3.4" fill="#fff" stroke="#16301a" stroke-width="0.7">${extra}<animateMotion dur="${dur}" repeatCount="indefinite" calcMode="linear" path="${path}"/><animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;.1;.55;.85;1" dur="${dur}" repeatCount="indefinite"/></circle>`;
  const wrap = inner => `<svg viewBox="0 0 ${W} ${H}" class="reg-scene" aria-hidden="true">${inner}</svg>`;
  if (kind === 'fw') return wrap(`<rect x="6" y="38" width="46" height="4" rx="2" fill="rgba(20,40,10,.1)"/><rect x="20" y="27" width="32" height="11" rx="5" fill="#5fa83f"/><rect x="20" y="27" width="32" height="5" rx="2.5" fill="#86c860"/><path d="M5,32 Q28,2 40,29" fill="none" stroke="rgba(20,40,10,.18)" stroke-width="1.4" stroke-dasharray="2 3"/><rect x="3" y="33" width="6" height="3" rx="1" fill="#caa15e"/>${ball('M5,32 Q28,2 40,29', '2.4s')}`);
  if (kind === 'gir') return wrap(`<ellipse cx="42" cy="33" rx="14" ry="6.5" fill="#54ad58"/><ellipse cx="38" cy="31" rx="6" ry="2.6" fill="#79c970" opacity=".6"/><line x1="42" y1="32" x2="42" y2="13" stroke="#2c4a1c" stroke-width="1.7"/><path d="M42,13 l9,2.6 -9,2.6z" fill="#7cc24a"/><path d="M5,34 Q26,-3 42,29" fill="none" stroke="rgba(20,40,10,.18)" stroke-width="1.4" stroke-dasharray="2 3"/>${ball('M5,34 Q26,-3 42,29', '2.4s')}`);
  if (kind === 'ud') return wrap(`<ellipse cx="46" cy="34" rx="10" ry="4.5" fill="#54ad58"/><ellipse cx="46" cy="34" rx="3" ry="1.5" fill="#0a2e16"/><line x1="46" y1="34" x2="46" y2="16" stroke="#2c4a1c" stroke-width="1.6"/><path d="M46,16 l8,2.3 -8,2.3z" fill="#7cc24a"/><ellipse cx="8" cy="36" rx="6" ry="2.4" fill="#5a8a3c"/>${ball('M8,34 Q26,8 42,30 L46,34', '2.8s')}`);
  if (kind === 'pen') return wrap(`<ellipse cx="40" cy="34" rx="15" ry="6.5" fill="url(#g3dWater)"/><ellipse cx="36" cy="32" rx="6" ry="2" fill="#fff" opacity=".25"/><rect x="3" y="33" width="6" height="3" rx="1" fill="#caa15e"/>${ball('M5,32 Q24,4 38,31', '2.4s')}`);
  // putt: rueda y cae al hoyo
  return wrap(`<path d="M8,32 L46,32" stroke="rgba(20,40,10,.18)" stroke-width="1.4" stroke-dasharray="2 3"/><ellipse cx="50" cy="32" rx="6.5" ry="2.6" fill="#0a2e16"/><line x1="50" y1="32" x2="50" y2="14" stroke="#2c4a1c" stroke-width="1.6"/><path d="M50,14 l9,2.6 -9,2.6z" fill="#7cc24a"/><circle r="3.4" fill="#fff" stroke="#16301a" stroke-width="0.7"><animateMotion dur="2.4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;.72;1" path="M8,32 L48,32"/><animate attributeName="r" values="3.4;3.4;0;0" keyTimes="0;.7;.76;1" dur="2.4s" repeatCount="indefinite"/></circle>`);
}

/* stat card with progress bar */
function statCard(value, caption, barPct) {
  const w = Math.max(0, Math.min(100, barPct));
  return `<div class="card">
    <div class="stat-num">${value}</div>
    <div class="stat-cap">${esc(caption)}</div>
    <div class="bar"><i style="width:${w}%"></i></div>
  </div>`;
}
