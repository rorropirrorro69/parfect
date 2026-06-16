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
    nav_home: 'Inicio', nav_round: 'Ronda', nav_trainer: 'Trainer', nav_profile: 'Perfil',
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
    nav_home: 'Home', nav_round: 'Round', nav_trainer: 'Trainer', nav_profile: 'Profile',
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
function applyTheme() {
  const th = (typeof S !== 'undefined' && S.settings && S.settings.theme) || 'light';
  document.documentElement.setAttribute('data-theme', th);
}

/* sol/luna: se mueven por el cielo según la hora (amanecer→mediodía→atardecer) */
function positionOrb() {
  const orb = document.querySelector('.bg-orb');
  const bg = document.querySelector('.app-bg');
  if (!orb) return;
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  const f = Math.min(1, Math.max(0, (h - 6) / 14));      // 0 a las 6:00, 1 a las 20:00
  const elev = Math.sin(f * Math.PI);                     // 0 en extremos, 1 al mediodía
  orb.style.left = (6 + f * 84).toFixed(1) + '%';
  orb.style.right = 'auto';
  orb.style.top = (30 - elev * 25).toFixed(1) + '%';
  if (bg) {
    bg.classList.remove('dawn', 'dusk');
    if (h >= 5.5 && h < 8.5) bg.classList.add('dawn');
    else if (h >= 17 && h < 20.5) bg.classList.add('dusk');
  }
}

/* avatares 3D (monitos) — Fluent Emoji 3D (MIT) */
const AVATARS = ['assets/avatars/a1.png', 'assets/avatars/a2.png', 'assets/avatars/a3.png', 'assets/avatars/a4.png', 'assets/avatars/a5.png', 'assets/avatars/a6.png'];
function avatarSrc(u) { const i = (u && u.avatar != null) ? u.avatar : 0; return AVATARS[i] || AVATARS[0]; }

/* salida: dirección (h.tee: izq/c/der) + resultado (h.teeLie: calle/rough/bunker/ob). Compatibles con datos viejos (h.tee: fw/penal) */
function teeIsFairway(h) { return h.teeLie ? h.teeLie === 'calle' : h.tee === 'fw'; }
function teeIsPenal(h) { return !!h.pen || (h.teeLie ? h.teeLie === 'ob' : h.tee === 'penal'); }
function teeDone(h) { return h.par === 3 ? true : (h.teeLie != null || h.tee != null); }

/* rango por hándicap 0–36 (golf): tu golfista se tiñe y su aura crece al subir */
const RANKS = [
  { max: 36, n: 'Novato', c: '#9aa6b0', f: 'saturate(.35) brightness(1.08)', aura: 0 },
  { max: 27, n: 'Aficionado', c: '#57a83e', f: 'hue-rotate(95deg) saturate(1.25)', aura: 1 },
  { max: 18, n: 'Competidor', c: '#3a7fd4', f: 'hue-rotate(195deg) saturate(1.35)', aura: 2 },
  { max: 12, n: 'Cazador de pares', c: '#8a4fc0', f: 'hue-rotate(258deg) saturate(1.3)', aura: 3 },
  { max: 6, n: 'Élite', c: '#ef8b3c', f: 'none', aura: 4 },
  { max: 2, n: 'Maestro', c: '#d8423a', f: 'hue-rotate(-26deg) saturate(1.5)', aura: 5 },
  { max: 0, n: 'Leyenda', c: '#f5d33a', f: 'hue-rotate(14deg) saturate(1.45) brightness(1.05)', aura: 6 },
];
function rankIdx(hcp) { const h = Math.round(Number(hcp)); if (isNaN(h)) return 0; let best = 0, bm = Infinity; RANKS.forEach((r, i) => { if (r.max >= h && r.max < bm) { bm = r.max; best = i; } }); return best; }
function rankRange(i) { const lo = i + 1 < RANKS.length ? RANKS[i + 1].max + 1 : 0; return lo === RANKS[i].max ? `${lo}` : `${lo}–${RANKS[i].max}`; }
/* outfits: el color de tu golfista (lo elige el jugador; por defecto = color de rango) */
const OUTFITS = [
  { k: 'rank', n: 'Rango', sw: 'rank', f: null },
  { k: 'lime', n: 'Lima', sw: '#c9f73e', f: 'hue-rotate(72deg) saturate(1.4) brightness(1.05)' },
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
  return `<img class="golfer ${cls || ''}" src="${avatarSrc(u)}"${fil ? ` style="filter:${fil}"` : ''} alt="" loading="lazy">`;
}

/* ============ Íconos de golf (SVG con look 3D + animación sutil) ============ */
const GOLF_ICONS = {
  ball: `<ellipse cx="16" cy="28" rx="8" ry="2" fill="#000" opacity=".28"/><circle cx="16" cy="15" r="11" fill="#cdd5d7"/><circle cx="16" cy="15" r="11" fill="#fff" opacity=".25"/><circle cx="12" cy="11" r="4" fill="#fff" opacity=".85"/><g fill="#aab4b6"><circle cx="16" cy="15" r="1"/><circle cx="20" cy="13" r="1"/><circle cx="20" cy="18" r="1"/><circle cx="13" cy="18" r="1"/><circle cx="16" cy="20" r="1"/></g>`,
  flag: `<ellipse cx="16" cy="28" rx="11" ry="2.6" fill="#2f6b39"/><ellipse cx="16" cy="27.4" rx="7" ry="1.6" fill="#57b15c"/><rect x="14.7" y="5" width="1.8" height="22" rx=".9" fill="#cdd6c2"/><g class="gi-wave" style="transform-origin:15.6px 6px"><path d="M16.2 5 L27 8.6 L16.2 12.2 Z" fill="#c9f73e"/></g><circle cx="15.6" cy="5" r="1.8" fill="#eef3e6"/>`,
  tee: `<ellipse cx="16" cy="29" rx="8" ry="2" fill="#000" opacity=".25"/><circle cx="16" cy="9" r="6.5" fill="#cdd5d7"/><circle cx="13.5" cy="6.5" r="2.2" fill="#fff" opacity=".85"/><path d="M11.5 16 L20.5 16 L17.5 22 L16.8 28 L15.2 28 L14.5 22 Z" fill="#c9f73e"/>`,
  club: `<ellipse cx="17" cy="29" rx="8" ry="2" fill="#000" opacity=".22"/><rect x="14.5" y="4" width="2" height="18" rx="1" fill="#b9c2c4" transform="rotate(8 15.5 13)"/><path d="M9 21 q-1 6 6 6 q7 0 7-5 l-2 0 q0 3 -5 3 q-4 0 -4-4 Z" fill="#9aa6a8"/><ellipse cx="11" cy="22.5" rx="2.4" ry="3.2" fill="#cdd5d7"/>`,
  green: `<ellipse cx="16" cy="18" rx="13" ry="9" fill="#2f6b39"/><ellipse cx="16" cy="17" rx="9" ry="6" fill="#57b15c"/><ellipse cx="16" cy="16.5" rx="4.5" ry="3" fill="#6cc471"/><rect x="15.3" y="4" width="1.5" height="13" rx=".7" fill="#cdd6c2"/><g class="gi-wave" style="transform-origin:16px 5px"><path d="M16.6 4 L24 6.4 L16.6 9 Z" fill="#c9f73e"/></g>`,
  trophy: `<rect x="12" y="23" width="8" height="3" rx="1" fill="#b98a2e"/><rect x="10" y="26" width="12" height="2.6" rx="1.2" fill="#cf9a36"/><path d="M10 6 h12 v5 a6 6 0 0 1 -12 0 Z" fill="#ffcf5a"/><path d="M10 6 h12 v5 a6 6 0 0 1 -12 0 Z" fill="#fff" opacity=".0"/><path d="M10 7 q-4 0 -4 3 q0 4 5 4" fill="none" stroke="#cf9a36" stroke-width="1.6"/><path d="M22 7 q4 0 4 3 q0 4 -5 4" fill="none" stroke="#cf9a36" stroke-width="1.6"/><rect x="15" y="17" width="2" height="6" fill="#cf9a36"/><path class="gi-glint" d="M13 7 l1.5 0 -3 7 -1.5 0 Z" fill="#fff" opacity=".5"/>`,
  medal: `<path d="M11 4 L14 14 L10 14 Z" fill="#5aa9e0"/><path d="M21 4 L22 14 L18 14 Z" fill="#ff7a6b"/><circle cx="16" cy="21" r="8" fill="#ffcf5a"/><circle cx="16" cy="21" r="5.4" fill="#e7b23e"/><path class="gi-glint" d="M13 16 l1.6 0 -4 9 -1.6 0 Z" fill="#fff" opacity=".55"/><path d="M16 17 l1.3 2.7 2.9 .3 -2.2 2 .7 2.9 -2.7 -1.5 -2.7 1.5 .7 -2.9 -2.2 -2 2.9 -.3 Z" fill="#7a5a13"/>`,
  bucket: `<ellipse cx="16" cy="28" rx="9" ry="2" fill="#000" opacity=".22"/><g fill="#cdd5d7"><circle cx="12" cy="11" r="3"/><circle cx="19" cy="10" r="3"/><circle cx="16" cy="13" r="3"/></g><path d="M8 15 h16 l-2 12 a2 2 0 0 1 -2 2 h-8 a2 2 0 0 1 -2 -2 Z" fill="#9aa6a8"/><path d="M9 18 h14" stroke="#7f8b8d" stroke-width="1.4"/>`,
  putter: `<ellipse cx="16" cy="29" rx="8" ry="1.8" fill="#000" opacity=".2"/><rect x="18" y="4" width="2" height="16" rx="1" fill="#b9c2c4"/><rect x="8" y="19" width="13" height="3" rx="1.5" fill="#9aa6a8"/><circle cx="9" cy="26" r="3" fill="#cdd5d7"/><ellipse cx="20" cy="27" rx="5" ry="2" fill="#2f6b39"/><ellipse cx="20" cy="26.6" rx="2.4" ry="1" fill="#0a0f08"/>`,
  card: `<rect x="7" y="6" width="18" height="20" rx="2.5" fill="#e9eef0"/><rect x="7" y="6" width="18" height="5" rx="2.5" fill="#c9f73e"/><g stroke="#9aa6a8" stroke-width="1.4"><path d="M10 15 h12"/><path d="M10 19 h12"/><path d="M10 23 h8"/></g>`,
  bird: `<ellipse cx="16" cy="27" rx="8" ry="2" fill="#000" opacity=".2"/><path d="M6 16 q4 -3 8 -1 q5 -8 12 -7 q-3 3 -3 6 q3 1 3 4 q-5 5 -12 4 q-6 -1 -8 -10 Z" fill="#c9f73e"/><circle cx="22" cy="13" r="1.2" fill="#0a0f08"/><path d="M26 13 l3 -1 -3 -1 Z" fill="#ffcf5a"/>`,
  peak: `<path d="M3 27 L13 9 L17 17 L21 11 L29 27 Z" fill="#3a4a30"/><path d="M13 9 L9.5 16 L16.5 16 Z" fill="#eef3e6"/><rect x="20.5" y="4" width="1.5" height="9" rx=".7" fill="#cdd6c2"/><g class="gi-wave" style="transform-origin:21px 5px"><path d="M21.8 4 L28 6 L21.8 8.4 Z" fill="#c9f73e"/></g>`,
  hand: `<path d="M11 16 V8 a1.6 1.6 0 0 1 3.2 0 v6 m0 -1 V6.5 a1.6 1.6 0 0 1 3.2 0 V14 m0 -1 V7.5 a1.6 1.6 0 0 1 3.2 0 V15 m0 -2 a1.6 1.6 0 0 1 3.2 0 v5 a7 7 0 0 1 -7 7 h-2 a7 7 0 0 1 -6 -4 l-2.5 -4 a1.7 1.7 0 0 1 2.8 -1.8 L11 18 Z" fill="#ddcb8c"/>`,
};
function golfIcon(name, cls = '') {
  const body = GOLF_ICONS[name] || GOLF_ICONS.flag;
  return `<span class="gi ${cls}"><svg viewBox="0 0 32 32" aria-hidden="true">${body}</svg></span>`;
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
function logoMark(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="M8 21V4" stroke="#c9f73e" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M8 4l9 3.5L8 11" fill="#c9f73e"/>
    <path d="M5 21c2-1.4 4.6-1.4 6.6 0" stroke="#c9f73e" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
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
        <stop offset="0%" stop-color="#c9f73e" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#c9f73e" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#lg)"/>
    <path d="${d}" fill="none" stroke="#c9f73e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastX}" cy="${lastY}" r="4.5" fill="#c9f73e"/>
    <text x="${lastX + 9}" y="${lastY + 4}" fill="#c9f73e" font-size="14" font-weight="800" font-family="Inter,system-ui">${fmtToPar(points[points.length - 1])}</text>
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
  const flag = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="78" stroke="#c9f73e" stroke-width="2"/><path d="M${x} ${y} l12 4 -12 4z" fill="#c9f73e"/>`;
  const cup = x => `<ellipse cx="${x}" cy="78" rx="8" ry="3" fill="#0a0f06" stroke="#c9f73e" stroke-width="1.5"/>`;

  if (key === 'driving') {
    const p = 'M26 74 Q 160 -14 272 70';
    return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Tiro de salida">
      ${frame}${ground}
      <rect x="22" y="74" width="8" height="6" rx="1" fill="#7c8a70"/>
      <ellipse cx="266" cy="78" rx="46" ry="6" fill="rgba(201,247,62,0.12)" stroke="rgba(201,247,62,0.4)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="${p}" fill="none" stroke="rgba(201,247,62,0.25)" stroke-width="2" stroke-dasharray="3 6"/>
      ${ball(p, '2.6s')}${cap('Tiro de salida a la calle')}
    </svg>`;
  }
  if (key === 'approach') {
    const p = 'M28 74 Q 150 -8 268 70';
    return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Control de distancia">
      ${frame}${ground}
      <ellipse cx="262" cy="78" rx="40" ry="6" fill="rgba(201,247,62,0.10)"/>
      ${flag(268, 30)}
      <path d="${p}" fill="none" stroke="rgba(201,247,62,0.25)" stroke-width="2" stroke-dasharray="3 6"/>
      ${ball(p, '2.4s')}${cap('Approach a bandera')}
    </svg>`;
  }
  if (key === 'short') {
    const p = 'M34 72 Q 120 18 196 66 T 286 78';
    return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Up & down">
      ${frame}${ground}
      <ellipse cx="250" cy="78" rx="56" ry="6" fill="rgba(201,247,62,0.10)"/>
      ${cup(286)}
      <path d="${p}" fill="none" stroke="rgba(201,247,62,0.25)" stroke-width="2" stroke-dasharray="3 6"/>
      ${ball(p, '2.6s')}${cap('Chip y salvar par')}
    </svg>`;
  }
  // putting
  const p = 'M30 70 L286 70';
  return `<svg viewBox="0 0 ${W} ${H}" class="drill-art" role="img" aria-label="Putt por el gate">
    ${frame}
    <line x1="16" y1="70" x2="${W - 16}" y2="70" stroke="${groundCol}" stroke-width="1.5"/>
    <line x1="188" y1="58" x2="188" y2="70" stroke="#c9f73e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="208" y1="58" x2="208" y2="70" stroke="#c9f73e" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="286" cy="70" rx="8" ry="3" fill="#0a0f06" stroke="#c9f73e" stroke-width="1.5"/>
    <path d="${p}" fill="none" stroke="rgba(201,247,62,0.22)" stroke-width="2" stroke-dasharray="3 6"/>
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
  const fl = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${G}" stroke="#7fb52b" stroke-width="2"/><path d="M${x} ${y} l11 3.5 -11 3.5z" fill="#c9f73e"/>`;
  const cp = (x, y = G) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="#0a2e16" stroke="#7fb52b" stroke-width="1.5"/>`;
  const bl = (path, dur, extra = '') => `<circle r="4.5" fill="#fff"${A.ballStroke}>${extra}<animateMotion dur="${dur}" repeatCount="indefinite" calcMode="linear" path="${path}"/><animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;.08;.5;.85;1" dur="${dur}" repeatCount="indefinite"/></circle>`;
  const svg = inner => `<svg viewBox="0 0 ${W} ${H}" class="drill-art" aria-hidden="true">${fr}${inner}</svg>`;

  if (n.includes('gate drill')) return svg(`${gr()}<line x1="74" y1="62" x2="74" y2="${G}" stroke="#c9f73e" stroke-width="3" stroke-linecap="round"/><line x1="100" y1="62" x2="100" y2="${G}" stroke="#c9f73e" stroke-width="3" stroke-linecap="round"/><ellipse cx="272" cy="${G}" rx="28" ry="5" fill="rgba(201,247,62,0.12)"/>${bl('M44 74 Q 170 -10 286 74', '3s')}${cap('Gate de alineación')}`);
  if (n.includes('14 calles')) return svg(`${gr()}<rect x="150" y="71" width="120" height="7" rx="3.5" fill="#2f6b39"/><g stroke="#c9f73e" stroke-width="2"><line x1="180" y1="67" x2="180" y2="74"/><line x1="210" y1="67" x2="210" y2="74"/><line x1="240" y1="67" x2="240" y2="74"/></g>${bl('M34 74 Q 150 -8 210 72', '2.6s')}${cap('14 calles a presión')}`);
  if (n.includes('madera 3')) return svg(`${gr()}<path d="M44 74 Q 150 -12 256 58" fill="none" stroke="rgba(255,120,107,0.3)" stroke-dasharray="3 5"/><path d="M44 74 Q 150 2 256 72" fill="none" stroke="rgba(201,247,62,0.3)" stroke-dasharray="3 5"/>${bl('M44 74 Q 150 -12 256 58', '3s')}<circle r="4" fill="#c9f73e"><animateMotion dur="3s" begin="1.3s" repeatCount="indefinite" calcMode="linear" path="M44 74 Q 150 2 256 72"/></circle>${cap('Driver vs Madera 3')}`);
  if (n.includes('escalera')) return svg(`${gr()}${[120, 200, 268].map((x, i) => `<ellipse cx="${x}" cy="${G}" rx="13" ry="4" fill="rgba(201,247,62,0.12)"/><circle r="4" fill="#fff"><animateMotion dur="3s" begin="${i * 0.6}s" repeatCount="indefinite" calcMode="linear" path="M34 74 Q ${(34 + x) / 2} -6 ${x} 74"/><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.1;.45;.55;1" dur="3s" begin="${i * 0.6}s" repeatCount="indefinite"/></circle>`).join('')}${cap('Escalera de distancias')}`);
  if (n.includes('reloj con wedges')) return svg(`<circle cx="64" cy="50" r="26" fill="none" stroke="rgba(201,247,62,0.28)" stroke-width="2"/><circle cx="64" cy="50" r="2.5" fill="#c9f73e"/><line x1="64" y1="50" x2="64" y2="28" stroke="#c9f73e" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="-35 64 50;-95 64 50;-35 64 50" dur="2.6s" repeatCount="indefinite"/></line>${fl(268, 46)}${bl('M118 60 Q 200 8 260 72', '2.6s')}${cap('Reloj de wedges')}`);
  if (n.includes('pin high')) return svg(`${gr()}${fl(244, 40)}<line x1="120" y1="62" x2="266" y2="62" stroke="rgba(201,247,62,0.25)" stroke-width="1.5" stroke-dasharray="3 5"/>${bl('M34 74 Q 150 -2 232 62', '2.8s')}${cap('Pin high siempre')}`);
  if (n.includes('up & down')) return svg(`${gr()}<ellipse cx="44" cy="76" rx="18" ry="6" fill="#43331a"/>${cp(268)}${fl(268, 46)}${bl('M44 72 Q 140 6 232 70 L260 76', '3.2s')}${cap('Up & down')}`);
  if (n.includes('landing spot')) return svg(`${gr()}<rect x="180" y="70" width="26" height="6" rx="2" fill="#5aa9e0"/>${cp(272)}${fl(272, 46)}${bl('M40 72 Q 120 4 193 70 L266 76', '3.2s')}${cap('Landing spot (toalla)')}`);
  if (n.includes('splash')) return svg(`${gr()}<ellipse cx="64" cy="76" rx="32" ry="8" fill="#ddcb8c"/>${cp(270)}${fl(270, 46)}<g fill="#ddcb8c"><circle cx="58" cy="70" r="1.6"><animate attributeName="cy" values="70;54;72" dur="2.6s" repeatCount="indefinite"/></circle><circle cx="72" cy="70" r="1.4"><animate attributeName="cy" values="70;50;72" dur="2.6s" begin="0.12s" repeatCount="indefinite"/></circle></g>${bl('M64 70 Q 160 2 258 72', '2.6s')}${cap('Splash de bunker')}`);
  if (n.includes('lag putting')) return svg(`${gr()}${cp(252)}<circle cx="252" cy="${G}" r="22" fill="none" stroke="rgba(201,247,62,0.32)" stroke-width="1.2" stroke-dasharray="3 3"/><path d="M40 ${G} L236 ${G}" stroke="rgba(201,247,62,0.18)" stroke-dasharray="3 6"/><circle r="4.5" fill="#fff"><animateMotion dur="3s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;.66;1" path="M40 ${G} L236 ${G}"/></circle>${cap('Lag a círculo de 1 m')}`);
  if (n.includes('gate de putter')) return svg(`${gr(70)}<line x1="190" y1="58" x2="190" y2="70" stroke="#c9f73e" stroke-width="2.5" stroke-linecap="round"/><line x1="210" y1="58" x2="210" y2="70" stroke="#c9f73e" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="272" cy="70" rx="8" ry="3" fill="#0a0f06" stroke="#c9f73e" stroke-width="1.5"/><path d="M40 70 L272 70" stroke="rgba(201,247,62,0.2)" stroke-dasharray="3 6"/><circle fill="#fff"><animateMotion dur="2.4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;.72;1" path="M40 70 L272 70"/><animate attributeName="r" values="4.5;4.5;0;0" keyTimes="0;.68;.74;1" dur="2.4s" repeatCount="indefinite"/></circle>${cap('Gate de putter')}`);
  if (n.includes('reloj de 1.5')) {
    const cx = 160, cy = 46, R = 30;
    const dots = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i / 8 * Math.PI * 2; return `<circle cx="${(cx + Math.cos(a) * R).toFixed(0)}" cy="${(cy + Math.sin(a) * R * 0.7).toFixed(0)}" r="2.2" fill="rgba(201,247,62,0.4)"/>`; }).join('');
    return svg(`<ellipse cx="${cx}" cy="${cy}" rx="8" ry="4" fill="#0a0f06" stroke="#c9f73e" stroke-width="1.5"/>${dots}<circle fill="#fff"><animateMotion dur="2.2s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;.6;1" path="M${cx + R} ${cy} L${cx} ${cy}"/><animate attributeName="r" values="4.5;4.5;0;0" keyTimes="0;.56;.62;1" dur="2.2s" repeatCount="indefinite"/></circle>${cap('Reloj de 1.5 m')}`);
  }
  return drillArt(areaKey || 'putting');
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
