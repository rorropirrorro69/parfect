/* ============ Estrategia + Simulador por hoyo — multi-campo ============ */

/* Club de Golf Campestre Morelia — con sus doglegs y lagunas (pares/yardas tees Azules) */
const CAMP_HOLES = [
  { n: 1, par: 5, yds: 503, dog: 'straight', risks: [{ at: 'drive', side: 'right', kind: 'bunker' }], tips: ['Par 5 amplio para arrancar; bunkers de salida a la derecha.'] },
  { n: 2, par: 5, yds: 550, dog: 'left', risks: [{ at: 'green', side: 'right', kind: 'bunker' }], tips: ['El hoyo más largo (550y); dogleg a la izquierda.'] },
  { n: 3, par: 3, yds: 174, dog: 'straight', risks: [{ at: 'green', side: 'left', kind: 'water' }], tips: ['Par 3 con laguna a la izquierda del green.'] },
  { n: 4, par: 4, yds: 405, dog: 'right', risks: [{ at: 'green', side: 'left', kind: 'bunker' }], tips: ['Dogleg suave a la derecha.'] },
  { n: 5, par: 3, yds: 201, dog: 'straight', risks: [{ at: 'green', side: 'left', kind: 'bunker' }], tips: ['El par 3 más largo (201y).'] },
  { n: 6, par: 4, yds: 432, dog: 'right', risks: [{ at: 'green', side: 'left', kind: 'bunker' }], tips: ['Par 4 largo, dogleg a la derecha; clave estar en calle.'] },
  { n: 7, par: 5, yds: 529, dog: 'left', risks: [{ at: 'green', side: 'right', kind: 'water' }], tips: ['Dogleg izquierda, alcanzable en dos; laguna a la derecha del green.'] },
  { n: 8, par: 3, yds: 176, dog: 'straight', risks: [{ at: 'green', side: 'left', kind: 'water' }], tips: ['Par 3 con laguna a la izquierda; juega al centro.'] },
  { n: 9, par: 4, yds: 407, dog: 'right', risks: [{ at: 'green', side: 'right', kind: 'bunker' }], tips: ['Cierre con dogleg a la derecha hacia la casa club.'] },
];
function buildHoles(pars, yards, dogs) {
  return pars.map((par, i) => {
    const n = i + 1;
    const dog = par === 3 ? 'straight' : ((dogs && dogs[i]) ? dogs[i] : (n % 2 === 0 ? 'right' : 'left'));
    const side = par === 3 ? (n % 2 ? 'left' : 'right')
      : (dog === 'left' ? 'right' : dog === 'right' ? 'left' : (n % 2 ? 'right' : 'left'));
    const kind = par === 3 && n % 4 === 0 ? 'water' : 'bunker';
    return { n, par, yds: yards[i], dog, risks: [{ at: 'green', side, kind }], tips: [`Par ${par} de ${yards[i]} yds.`] };
  });
}
/* Tres Marías tiene 27 hoyos = 3 vueltas (A, B, C). Datos aprox. */
const TM_PARS = [4, 4, 3, 4, 5, 3, 4, 5, 4, /*B*/ 4, 4, 4, 3, 3, 4, 5, 4, 5, /*C*/ 4, 3, 5, 4, 4, 3, 4, 5, 4];
const TM_YDS = [433, 466, 207, 434, 555, 187, 389, 530, 404, /*B*/ 520, 380, 374, 214, 216, 509, 541, 350, 545, /*C*/ 410, 180, 540, 420, 400, 200, 430, 520, 405];
const TM_DOGS = ['left', 'right', 'straight', 'straight', 'left', 'straight', 'left', 'right', 'straight', /*B*/ 'straight', 'left', 'right', 'straight', 'straight', 'left', 'left', 'left', 'right', /*C*/ 'right', 'straight', 'left', 'left', 'right', 'straight', 'right', 'left', 'right'];
const ALT_PARS = [4, 5, 4, 4, 3, 5, 3, 4, 4, 4, 4, 3, 4, 3, 4, 5, 4, 5];
const ALT_YDS = ALT_PARS.map(p => p === 3 ? 195 : p === 4 ? 420 : 565);
const ALT_DOGS = ['left', 'left', 'right', 'left', 'straight', 'right', 'straight', 'left', 'right', 'left', 'right', 'straight', 'right', 'straight', 'right', 'left', 'left', 'left'];
/* Greens reales de Altozano (hoja de banderas viernes/sábado): d=profundidad yds, pf=posición pin frente(0)→fondo(1), px=pin izq(-1)→der(1), sh=forma, bk=bunkers alrededor */
const ALT_GREENS = [
  { d: 31, pf: 0.19, px: 0.0, sh: 'round', bk: ['fl'] },         // 1
  { d: 43, pf: 0.88, px: 0.0, sh: 'tall', bk: ['fl'] },          // 2
  { d: 38, pf: 0.26, px: 0.45, sh: 'wide', bk: ['f', 'fr'] },    // 3
  { d: 28, pf: 0.25, px: 0.45, sh: 'round', bk: ['fl', 'r'] },   // 4
  { d: 26, pf: 0.54, px: 0.0, sh: 'round', bk: ['l', 'f'] },     // 5
  { d: 31, pf: 0.84, px: 0.0, sh: 'round', bk: ['fl'] },         // 6
  { d: 28, pf: 0.5, px: -0.4, sh: 'round', bk: ['fl'] },         // 7
  { d: 31, pf: 0.84, px: 0.4, sh: 'round', bk: ['r'] },          // 8
  { d: 48, pf: 0.21, px: 0.4, sh: 'tall', bk: ['r', 'br'] },     // 9
  { d: 35, pf: 0.4, px: 0.0, sh: 'wide', bk: ['l'] },            // 10
  { d: 43, pf: 0.23, px: 0.0, sh: 'wide', bk: ['fl', 'fr'] },    // 11
  { d: 41, pf: 0.51, px: 0.0, sh: 'tall', bk: ['fl'] },          // 12
  { d: 36, pf: 0.33, px: 0.0, sh: 'round', bk: [] },             // 13
  { d: 23, pf: 0.78, px: -0.4, sh: 'round', bk: [] },            // 14
  { d: 28, pf: 0.18, px: 0.45, sh: 'round', bk: ['bl', 'l'] },   // 15
  { d: 34, pf: 0.85, px: 0.0, sh: 'wide', bk: ['l'] },           // 16
  { d: 22, pf: 0.45, px: 0.0, sh: 'tall', bk: ['bl'] },          // 17
  { d: 27, pf: 0.81, px: 0.4, sh: 'round', bk: ['br'] },         // 18
];
const COURSES = {
  campestre: { id: 'campestre', name: 'Club Campestre Morelia', sub: '9 hoyos · Par 36', holes: CAMP_HOLES, nines: [{ label: 'Vuelta única', start: 0 }] },
  tresmarias: { id: 'tresmarias', name: 'Tres Marías · El Reto', sub: '27 hoyos · 3 vueltas', approx: true, holes: buildHoles(TM_PARS, TM_YDS, TM_DOGS), nines: [{ label: 'Vuelta A', start: 0 }, { label: 'Vuelta B', start: 9 }, { label: 'Vuelta C', start: 18 }] },
  altozano: { id: 'altozano', name: 'Altozano Morelia', sub: '18 hoyos · Par 72', approx: true, holes: buildHoles(ALT_PARS, ALT_YDS, ALT_DOGS).map((h, i) => Object.assign(h, { g: ALT_GREENS[i] })), nines: [{ label: 'Primeros 9', start: 0 }, { label: 'Segundos 9', start: 9 }] },
};
const COURSE_ORDER = ['campestre', 'tresmarias', 'altozano'];

/* opciones de ronda: combinaciones válidas de 9 y 18 hoyos según las vueltas del campo */
function roundOptions(cid) {
  const c = COURSES[cid]; const total = c.holes.length;
  const nines = c.nines || [{ label: '9 hoyos', start: 0 }];
  const nineLabel = start => (nines.find(n => n.start === start) || {}).label || ('Hoyo ' + (start + 1));
  const shortLabel = start => nineLabel(start).replace('Vuelta ', '').replace('Primeros 9', '1ª').replace('Segundos 9', '2ª');
  const opts9 = nines.map(n => ({ holes: 9, start: n.start, label: n.label }));
  const opts18 = [];
  const multi = total > 18;
  for (let i = 0; i + 18 <= total; i += 9) opts18.push({ holes: 18, start: i, label: multi ? `${shortLabel(i)} + ${shortLabel(i + 9)}` : '18 hoyos' });
  return { opts9, opts18, total };
}
/* par total de una ronda (offset + nº de hoyos) en un campo */
function roundPar(cid, start, holes) {
  const hs = COURSES[cid].holes; let p = 0;
  for (let i = 0; i < holes; i++) { const h = hs[start + i]; if (h) p += h.par; }
  return p;
}
/* salidas (tees): factor sobre la yardaja del campo (las yardas base son de campeonato) */
const TEES = [
  { id: 'negras', name: 'Negras', sub: 'Campeonato', f: 1.0 },
  { id: 'azules', name: 'Azules', sub: 'Avanzado', f: 0.92 },
  { id: 'blancas', name: 'Blancas', sub: 'Media', f: 0.85 },
  { id: 'rojas', name: 'Rojas', sub: 'Adelantada', f: 0.74 },
];
const teeById = id => TEES.find(t => t.id === id) || TEES[2];

/* ---- bolsa + efectividad (del Tracker) ---- */
function trackerEff(clubName) {
  const ps = (typeof myPractices === 'function' ? myPractices() : []).filter(p => p.drill === clubName);
  if (!ps.length) return null;
  const last = ps.slice(-3), att = last.reduce((a, p) => a + p.attempts, 0), hit = last.reduce((a, p) => a + p.hits, 0);
  return att ? Math.round((hit / att) * 100) : null;
}
function bagInfo(user) {
  const clubs = (user && user.clubs) || {};
  const personalized = Object.keys(clubs).some(k => clubs[k] != null);
  return CLUBS.map(c => {
    let carry;
    if (personalized) { const cc = clubC(clubs, c.id); if (cc == null) return null; carry = cc; }
    else { if (!DEFAULT_BAG.includes(c.id)) return null; carry = CLUB_DEFAULT[c.id]; }
    const eff = trackerEff(c.name) != null ? trackerEff(c.name) : (clubE(clubs, c.id) != null ? clubE(clubs, c.id) : CLUB_EFF_DEFAULT);
    return { id: c.id, name: c.name, group: c.group, carry, eff };
  }).filter(Boolean);
}
function dispersionYds(eff) { return Math.round(Math.max(12, Math.min(50, 70 - eff * 0.55))); }
function teeCandidates(user, hole) {
  const bag = bagInfo(user);
  if (!bag.length) return [];
  if (hole.par === 3) {
    let pool = hole.yds < 240 ? bag.filter(c => c.id !== 'dr') : bag;   // sin driver en par 3 salvo que sea larguísimo
    if (!pool.length) pool = bag;
    return pool.slice().sort((a, b) => Math.abs(a.carry - hole.yds) - Math.abs(b.carry - hole.yds)).slice(0, 6).sort((a, b) => b.carry - a.carry);
  }
  return bag.filter(c => ['dr', 'w3', 'w5', 'w7', 'h4', 'h5', 'h6', 'i3', 'i4', 'i5'].includes(c.id)).sort((a, b) => b.carry - a.carry);
}
/* ¿alcanzable en 2 en un par 5? (carry de salida + mejor palo no-driver) */
function reachableIn2(user, hole) {
  if (hole.par !== 5) return false;
  const bag = bagInfo(user); if (!bag.length) return false;
  const dr = (bag.find(c => c.id === 'dr') || bag.sort((a, b) => b.carry - a.carry)[0]).carry;
  const second = bag.filter(c => c.id !== 'dr').sort((a, b) => b.carry - a.carry)[0];
  return second && (dr + second.carry) >= hole.yds - 12;
}
function computeLandings(hole, tee, attack) {
  const carry = tee ? tee.carry : CLUB_DEFAULT.dr;
  const disp = dispersionYds(tee ? tee.eff : CLUB_EFF_DEFAULT);
  if (hole.par === 3) return [{ f: Math.max(0.2, Math.min(carry / hole.yds, 0.98)), disp, dist: carry }];
  const f1 = Math.max(0.2, Math.min(carry / hole.yds, hole.par === 5 ? 0.66 : 0.9));
  const ls = [{ f: f1, disp, dist: carry }];
  if (hole.par === 5 && !attack) {
    const f2 = Math.max(f1 + 0.1, Math.min((hole.yds - 100) / hole.yds, 0.9));
    ls.push({ f: f2, disp: Math.max(14, disp - 6), dist: Math.round((f2 - f1) * hole.yds) });
  }
  return ls;
}
function bez(t, a, c, b) { const u = 1 - t; return u * u * a + 2 * u * t * c + t * t * b; }

function holeSchematic(hole, landings) {
  const W = 340, H = 430, par3 = hole.par === 3;
  const green = hole.dog === 'left' ? [120, 100] : hole.dog === 'right' ? [222, 100] : [170, 96];
  const ctrl = par3 ? [170, 250] : (hole.dog === 'left' ? [224, 246] : hole.dog === 'right' ? [118, 246] : [170, 246]);
  const tee = [170, 414], gx = green[0], gy = green[1];
  const fair = `M${tee[0]},${tee[1]} Q ${ctrl[0]},${ctrl[1]} ${gx},${gy}`;
  const pts = landings.map(l => ({ ...l, p: [bez(l.f, tee[0], ctrl[0], gx), bez(l.f, tee[1], ctrl[1], gy)] }));
  const route = `M${tee[0]},${tee[1]} ` + pts.map(q => `L${q.p[0].toFixed(0)},${q.p[1].toFixed(0)}`).join(' ') + ` L${gx},${gy}`;
  // ---- línea de tiempo: la bola vuela tramo a tramo y se detiene en cada caída ----
  const nodePts = [tee, ...pts.map(q => q.p), [gx, gy]];
  const segLen = []; let totLen = 0;
  for (let i = 1; i < nodePts.length; i++) { const l = Math.hypot(nodePts[i][0] - nodePts[i - 1][0], nodePts[i][1] - nodePts[i - 1][1]); segLen.push(l); totLen += l || 1; }
  const nodeFrac = [0]; { let a = 0; for (const l of segLen) { a += l; nodeFrac.push(a / totLen); } }
  const ev = [{ p: 0, d: 0 }];
  for (let i = 1; i < nodeFrac.length; i++) { ev.push({ p: nodeFrac[i], d: 1 }); if (i < nodeFrac.length - 1) ev.push({ p: nodeFrac[i], d: 0.55 }); }
  ev.push({ p: 1, d: 1.1 });
  const totT = ev.reduce((a, e) => a + e.d, 0);
  let accT = 0; const keyP = [], keyT = [];
  ev.forEach(e => { accT += e.d; keyP.push(e.p.toFixed(3)); keyT.push((accT / totT).toFixed(3)); });
  const animDur = (1 + (nodeFrac.length - 1) * 1.25).toFixed(1);
  const arriveT = n => { const idx = keyP.indexOf(nodeFrac[n].toFixed(3)); return idx >= 0 ? Number(keyT[idx]) : (n / (nodeFrac.length - 1)); };
  let risks = '', labels = '';
  (hole.risks || []).forEach(r => {
    let rx, ry;
    if (r.at === 'drive') { const lp = pts[0] ? pts[0].p : [gx, gy]; rx = lp[0] + (r.side === 'left' ? -42 : 42); ry = lp[1]; }
    else { rx = gx + (r.side === 'left' ? -48 : 48); ry = gy + 16; }
    const water = r.kind === 'water';
    risks += `<ellipse cx="${rx.toFixed(0)}" cy="${ry.toFixed(0)}" rx="${water ? 26 : 20}" ry="${water ? 16 : 11}" fill="${water ? '#2f7fa6' : '#ddcb8c'}"/>`;
    labels += `<rect x="${(rx - 24).toFixed(0)}" y="${(ry - (water ? 16 : 11) - 18).toFixed(0)}" width="48" height="15" rx="7.5" fill="${water ? '#16323f' : '#3a2a16'}" stroke="${water ? '#3f96bd' : '#e0a25a'}"/><text x="${rx.toFixed(0)}" y="${(ry - (water ? 16 : 11) - 7).toFixed(0)}" fill="${water ? '#7fc3df' : '#e0a25a'}" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="800" text-anchor="middle">${water ? 'Agua' : 'Bunker'}</text>`;
  });
  let lands = '';
  pts.forEach((q, i) => {
    const rx = Math.max(13, Math.min(32, q.disp * 0.7)), ry = rx * 0.7;
    const t = arriveT(i + 1);
    const tb = Math.max(0.001, t - 0.03).toFixed(3), ta = Math.max(0.002, t).toFixed(3), tm = Math.min(0.999, (t + 1) / 2).toFixed(3);
    lands += `<ellipse cx="${q.p[0].toFixed(0)}" cy="${q.p[1].toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="#c9f73e" stroke="#c9f73e" stroke-width="1.5" stroke-dasharray="4 4" opacity="0"><animate attributeName="opacity" values="0;0;0.26;0.14;0.22" keyTimes="0;${tb};${ta};${tm};1" dur="${animDur}s" repeatCount="indefinite"/></ellipse>
      <text x="${q.p[0].toFixed(0)}" y="${(q.p[1] - ry - 5).toFixed(0)}" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="11.5" font-weight="900" text-anchor="middle" opacity="0">${q.dist}y<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;${tb};${ta};1" dur="${animDur}s" repeatCount="indefinite"/></text>`;
  });
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Esquema hoyo ${hole.n}">
    <rect x="0" y="0" width="${W}" height="${H}" rx="16" fill="#0a0f08" stroke="#1d2914"/>
    <path d="${fair}" fill="none" stroke="#2f6b39" stroke-width="${par3 ? 42 : 62}" stroke-linecap="round"/>
    <path d="${fair}" fill="none" stroke="#3a8043" stroke-width="${par3 ? 22 : 33}" stroke-linecap="round" opacity="0.5"/>
    <ellipse cx="${gx}" cy="${gy}" rx="36" ry="26" fill="#57b15c" stroke="#2f6b39" stroke-width="2"/>
    <circle cx="${gx + 5}" cy="${gy + 1}" r="3" fill="#0a0f08"/>
    <line x1="${gx + 5}" y1="${gy + 1}" x2="${gx + 5}" y2="${gy - 32}" stroke="#eef3e6" stroke-width="2"/>
    <path d="M${gx + 5},${gy - 32} L${gx + 18},${gy - 28} L${gx + 5},${gy - 24} Z" fill="#c9f73e"/>
    ${risks}${lands}
    <path d="${route}" fill="none" stroke="#c9f73e" stroke-width="2.5" stroke-dasharray="3 6"/>
    <circle r="6" fill="#fff" stroke="#0a0f08" stroke-width="1"><animateMotion dur="${animDur}s" repeatCount="indefinite" path="${route}" keyPoints="${keyP.join(';')}" keyTimes="${keyT.join(';')}" calcMode="linear"/></circle>
    ${labels}
    <rect x="161" y="412" width="18" height="7" rx="2" fill="#9ab07f"/><text x="170" y="${H - 5}" fill="#9ab07f" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" text-anchor="middle">TEE</text>
  </svg>`;
}

/* ---- objetivo + stance por hoyo (según tu hándicap) ---- */
function courseObjectives(course, hcp) {
  const holes = course.holes, n = holes.length;
  const overPar = Math.max(0, Math.round((hcp || 0) * n / 18));
  const ranked = holes.map((h, i) => ({ i, d: h.yds - h.par * 70 })).sort((a, b) => b.d - a.d);
  const give = {};
  for (let k = 0; k < overPar; k++) { const idx = ranked[k % n].i; give[idx] = (give[idx] || 0) + 1; }
  return holes.map((h, i) => h.par + (give[i] || 0));
}
function holeStance(hole, hcp, reachable) {
  const water = (hole.risks || []).some(r => r.kind === 'water');
  const driveB = (hole.risks || []).some(r => r.at === 'drive');
  if (hole.par === 5 && reachable && hcp <= 14) return { k: 'Agresivo', t: 'Llegas al green en 2 y el error se castiga poco: vale la pena ir por el birdie/eagle.' };
  if (hole.par === 5 && reachable) return { k: 'Equilibrado', t: 'Llegas en 2 pero con riesgo. Si tu salida queda sólida atácalo; si no, deja un wedge cómodo para el tercer tiro.' };
  if (water) return { k: 'Conservador', t: 'Hay agua cerca del green: apunta al centro y olvida la bandera. El doble bogey aquí nace de buscar el pin.' };
  if (driveB && hcp >= 16) return { k: 'Conservador', t: 'Coloca la salida con madera o híbrido para evitar el bunker: estar en calle vale más que 20 yardas.' };
  if (hole.par === 3 && hole.yds >= 195) return { k: 'Conservador', t: 'Par 3 largo: toma un palo de más, apunta al centro y confía en tu up & down. El bogey es buen score.' };
  return { k: 'Equilibrado', t: 'Hoyo noble: salida a calle y tiro al centro del green, sin heroísmos.' };
}
/* ¿por qué este objetivo (par vs bogey) para tu HCP? */
function objectiveWhy(hole, target, hcp) {
  return (target - hole.par) <= 0
    ? `Tu HCP ${fmtHcp(hcp)} dice que aquí debes anotar par: es un hoyo a tu alcance, no regales golpes.`
    : `Es de los hoyos más difíciles para tu HCP ${fmtHcp(hcp)}: un bogey es buen resultado — no fuerces el par y, sobre todo, evita el doble.`;
}
/* ¿por qué atacar el green en 2 o no? */
function attackWhy(user, hole, attack) {
  const bag = bagInfo(user);
  const second = bag.filter(c => c.id !== 'dr').sort((a, b) => b.carry - a.carry)[0];
  const nm = second ? second.name : 'tu palo más largo';
  const water = (hole.risks || []).some(r => r.kind === 'water');
  if (attack) {
    return water
      ? `Vas por el green en 2 con ${nm} — ojo con el agua: si dudas de la salida, mejor deja un wedge y sube en 3.`
      : `Vas por el green en 2 con ${nm}. Subir en dos te deja putt para eagle y, aunque falles, casi siempre salvas birdie o par.`;
  }
  return water
    ? `Atacar conviene solo si pegas sólido: hay agua de por medio. Lo seguro es subir en 3 y dejar un wedge cómodo.`
    : `Súbete en 2 si la salida queda bien; con ${nm} alcanzas. Si no, juega el lay-up y un wedge a bandera.`;
}

/* ---- simulador de ronda tiro por tiro — SOLO con datos reales del Tracker ---- */
const SIM_FW_CLUBS = ['Driver', 'Madera 3', 'Madera 5', 'Madera 7', 'Híbrido 4', 'Híbrido 5', 'Híbrido 6'];
const SIM_IRON_CLUBS = ['Fierro 3', 'Fierro 4', 'Fierro 5', 'Fierro 6', 'Fierro 7', 'Fierro 8', 'Fierro 9'];
const SIM_UD_DRILLS = ['Up & down 40 yds', 'Up & down 30 yds', 'Up & down 10 yds'];
const SIM_PUTT_DRILLS = ['Putt 3 ft', 'Putt 5 ft', 'Putt 7 ft', 'Putt 10 ft', 'Putt 15 ft'];
function avgTrackerEff(names) {
  const vals = names.map(n => trackerEff(n)).filter(v => v != null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}
/* ¿está el Tracker lo bastante lleno para simular? (una área de cada parte del juego) */
function trackerReadiness() {
  const areas = [
    { key: 'fw', label: 'Juego largo', hint: 'Driver / maderas', v: avgTrackerEff(SIM_FW_CLUBS) },
    { key: 'gir', label: 'Hierros', hint: 'Fierros', v: avgTrackerEff(SIM_IRON_CLUBS) },
    { key: 'ud', label: 'Approach', hint: 'Up & down', v: avgTrackerEff(SIM_UD_DRILLS) },
    { key: 'putt', label: 'Putt', hint: 'Putts cortos', v: avgTrackerEff(SIM_PUTT_DRILLS) },
  ];
  const have = {}; areas.forEach(a => (have[a.key] = a.v));
  return { ready: areas.every(a => a.v != null), areas, have };
}
function playerProbs() {
  const cl = v => Math.max(0, Math.min(1, v));
  const r = trackerReadiness().have;
  const fw = cl((r.fw / 100) * 0.95);
  const gir = cl((r.gir / 100) * 0.72);
  const ud = cl(r.ud / 100);
  const onePutt = cl((r.putt / 100) * 0.32);
  const threePutt = cl(0.20 - onePutt * 0.25);
  return { fw, gir, ud, onePutt, threePutt };
}
function simHole(hole, p) {
  let strokes = 0, fw = null, gir = false, putts;
  if (hole.par >= 4) { strokes++; fw = Math.random() < p.fw; }
  if (hole.par === 3) { strokes++; gir = Math.random() < p.gir * 1.05; }
  else { strokes += (hole.par - 2); gir = Math.random() < p.gir * (fw === false ? 0.7 : 1) * (hole.par === 5 ? 0.95 : 1); }
  if (gir) { const r = Math.random(); putts = r < p.onePutt ? 1 : r > (1 - p.threePutt) ? 3 : 2; strokes += putts; }
  else {
    strokes++;
    const ud = Math.random() < p.ud, r = Math.random();
    putts = ud ? 1 : (r < 0.8 ? 2 : 3); strokes += putts;
    if (Math.random() < (1 - p.fw) * 0.16) strokes++;
  }
  return { n: hole.n, par: hole.par, score: strokes, gir, fw, putts };
}
function simulateRound(user, course) {
  if (!trackerReadiness().ready) return null;
  const p = playerProbs();
  const holes = course.holes.map(h => simHole(h, p));
  const score = holes.reduce((a, h) => a + h.score, 0);
  const par = course.holes.reduce((a, h) => a + h.par, 0);
  const fwTot = holes.filter(h => h.fw !== null).length, fwHit = holes.filter(h => h.fw === true).length;
  return { courseId: course.id, holes, score, par, toPar: score - par, fwHit, fwTot, girHit: holes.filter(h => h.gir).length, girTot: holes.length, putts: holes.reduce((a, h) => a + h.putts, 0) };
}

/* ============ Simulador TIRO POR TIRO — usa las STATS DEL PERFIL ============ */
const SIM_LIE_ES = { tee: 'Tee', fw: 'Fairway', rough: 'Rough', bunker: 'Bunker', green: 'Green', water: 'Penal', holed: 'Embocada' };
function simClubFor(user, dist, lie, isTee, hole) {
  let bag = bagInfo(user);
  if (!isTee) { const nd = bag.filter(c => c.id !== 'dr'); if (nd.length) bag = nd; }  // sin driver fuera del tee
  if (!bag.length) return null;
  if (isTee && hole.par !== 3 && dist > 235) return bag.slice().sort((a, b) => b.carry - a.carry)[0];
  return bag.slice().sort((a, b) => Math.abs(a.carry - dist) - Math.abs(b.carry - dist))[0];
}
/* registra un tiro con su posición de aterrizaje (prog 0=tee..1=green, side -1..1) */
function simPush(s, prog, side, lie, ok, text) {
  s.log.push({ t: text, ok, lie, prog: Math.max(0, Math.min(1.06, prog)), side: Math.max(-1, Math.min(1, side)) });
}
function simInitHole(s) {
  const hole = COURSES[s.courseId].holes[s.holeIdx];
  s.dist = hole.yds; s.lie = 'tee'; s.strokes = 0; s.putts = 0;
  s.gir = false; s.fw = null; s.puttDist = null; s.log = [];
  if (s.shadowPr) s.shadowHole = simAutoHole(s.courseId, s.holeIdx, s.shadowPr);  // jugador objetivo (shadow)
}
/* juega un hoyo completo en automático con unas probabilidades dadas */
function simAutoHole(courseId, holeIdx, pr) {
  const s = { courseId, holeIdx, pr };
  simInitHole(s);
  let g = 0;
  while (s.lie !== 'holed' && g < 40) { simStep(s); g++; }
  return { log: s.log, score: s.strokes, putts: s.putts, gir: s.gir, fw: s.fw };
}
function simDefaultShadowHcp(user) {
  const curHcp = user.hcp != null ? user.hcp : 12;
  return (user.goal != null && user.goal < curHcp) ? user.goal : Math.max(0, curHcp - 6);
}
function simNewRound(user, course, shadowHcp) {
  if (!Stats.aggregate(myRounds())) return null;   // requiere stats del perfil (rondas)
  const goalHcp = shadowHcp != null ? shadowHcp : simDefaultShadowHcp(user);
  const pr = statProbs(user), shPr = hcpProbs(goalHcp);
  const holes = course.holes.map((h, i) => {       // se simula TODA la ronda de una vez
    const me = simAutoHole(course.id, i, pr);
    const sh = simAutoHole(course.id, i, shPr);
    return { n: h.n, par: h.par, score: me.score, putts: me.putts, gir: me.gir, fw: me.fw, log: me.log, shScore: sh.score, shLog: sh.log };
  });
  return { courseId: course.id, shadowGoal: goalHcp, holes, viewHole: 0, done: true };
}
function simStepPutt(s) {
  const pr = s.pr;
  s.strokes++; s.putts++;
  const d = s.puttDist || 12;
  let make = d <= 3 ? 0.93 : d <= 6 ? 0.5 : d <= 12 ? 0.26 : d <= 20 ? 0.12 : 0.05;
  make *= 1 + (0.10 - (pr.threePutt || 0.1));     // putters con pocos 3-putts embocan más
  make = Math.max(0.03, Math.min(0.98, make));
  if (Math.random() < make || s.putts >= 4) {
    s.lie = 'holed';
    simPush(s, 1, (Math.random() - 0.5) * 0.06, 'green', true, `Putt ${d} ft → ¡adentro!`);
  } else {
    const left = Math.max(2, Math.round(d * (0.12 + Math.random() * 0.22)));
    s.puttDist = left;
    simPush(s, 1, (Math.random() - 0.5) * 0.1, 'green', false, `Putt ${d} ft → corto, a ${left} ft`);
  }
}
function simStep(s) {
  const hole = COURSES[s.courseId].holes[s.holeIdx];
  if (s.lie === 'green') return simStepPutt(s);
  const pr = s.pr, user = cur();
  const isTee = s.lie === 'tee';

  /* juego corto (chip/pitch ≤35y) → probabilidad = Up & down del perfil */
  if (!isTee && s.dist <= 35) {
    s.strokes++;
    const ud = Math.random() < pr.ud * (s.lie === 'bunker' ? 0.8 : 1);
    const dleft = s.dist;
    s.puttDist = ud ? (2 + Math.round(Math.random() * 4)) : (8 + Math.round(Math.random() * 18));
    s.lie = 'green'; s.dist = 0;
    simPush(s, 0.99, (Math.random() - 0.5) * 0.18, 'green', ud, `Chip ${dleft}y → ${ud ? 'pegado, a' : 'a'} ${s.puttDist} ft`);
    return;
  }

  const bag = bagInfo(user);
  const maxReach = bag.filter(c => isTee || c.id !== 'dr').reduce((m, c) => Math.max(m, c.carry), 0);
  const goForGreen = s.dist <= 230 && maxReach >= s.dist - 8;

  if (goForGreen) {
    /* aproximación al green → probabilidad = GIR del perfil (ajustada por lie) */
    const club = simClubFor(user, s.dist, s.lie, isTee, hole);
    const cname = club ? club.name : 'Palo';
    s.strokes++;
    const lieAdj = (s.lie === 'fw' || s.lie === 'tee') ? 1 : s.lie === 'rough' ? 0.8 : 0.62;
    const pGreen = (isTee && hole.par === 3 ? pr.gir * 1.05 : pr.gir) * lieAdj;
    if (Math.random() < Math.min(0.97, pGreen)) {
      const reg = s.strokes <= hole.par - 2;
      s.gir = s.gir || reg;
      s.puttDist = reg ? (10 + Math.round(Math.random() * 26)) : (4 + Math.round(Math.random() * 8));
      s.lie = 'green'; s.dist = 0;
      simPush(s, 1, (Math.random() - 0.5) * 0.22, 'green', true, `${cname} → Green${reg ? ' ✓ (GIR)' : ''}, a ${s.puttDist} ft`);
    } else {
      const water = (hole.risks || []).some(r => r.kind === 'water');
      const dir = ['corto', 'largo', 'izq', 'der'][Math.floor(Math.random() * 4)];
      const side = dir === 'izq' ? -0.72 : dir === 'der' ? 0.72 : (Math.random() - 0.5) * 0.4;
      if (water && Math.random() < 0.2) {
        s.strokes++; s.lie = 'rough'; s.dist = Math.max(10, Math.round(s.dist * 0.35));
        simPush(s, 1 - s.dist / hole.yds, side, 'water', false, `${cname} → al agua (+1), dropas a ${s.dist}y`);
      } else {
        s.lie = Math.random() < 0.4 ? 'bunker' : 'rough';
        s.dist = Math.max(6, Math.round(10 + Math.random() * 18));
        const prog = dir === 'largo' ? 1.03 : 1 - s.dist / hole.yds;
        simPush(s, prog, side, s.lie, false, `${cname} → falló ${dir} (${SIM_LIE_ES[s.lie].toLowerCase()}), a ${s.dist}y`);
      }
    }
  } else {
    /* salida (par4/5) o lay-up para dejar ~100y → probabilidad = Fairways del perfil */
    const layTarget = (isTee && hole.par >= 4) ? null : Math.max(60, s.dist - 100);
    const club = layTarget == null ? simClubFor(user, s.dist, true, true, hole) : bestClubForDist(user, layTarget, true);
    const cname = club ? club.name : 'Palo';
    let carry = Math.round((club ? club.carry : 200) * (0.9 + Math.random() * 0.14));
    if (s.lie === 'rough') carry = Math.round(carry * 0.9);
    if (s.lie === 'bunker') carry = Math.round(carry * 0.82);
    s.strokes++;
    const good = isTee ? (Math.random() < pr.fw) : (Math.random() < pr.fw * 0.55 + 0.35);
    const adv = good ? carry : Math.round(carry * 0.82);
    s.dist = Math.max(0, s.dist - adv);
    if (isTee && hole.par >= 4) s.fw = good;
    s.lie = good ? 'fw' : (Math.random() < 0.35 ? 'bunker' : 'rough');
    const prog = 1 - s.dist / hole.yds;
    const side = good ? (Math.random() - 0.5) * 0.3 : (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.3);
    const lbl = (isTee && hole.par >= 4) ? (good ? 'Fairway ✓' : 'fuera de calle') : (good ? 'buen lay-up' : 'lay-up corto');
    simPush(s, prog, side, s.lie, good, `${cname} → ${lbl}, quedan ${s.dist}y`);
  }
}
function simFinishHole(s) {
  const hole = COURSES[s.courseId].holes[s.holeIdx];
  s.card.push({ n: hole.n, par: hole.par, score: s.strokes, putts: s.putts, gir: s.gir, fw: s.fw });
  if (s.shadowHole) s.shadowCard.push(s.shadowHole.score);
  s.holeIdx++;
  if (s.holeIdx >= COURSES[s.courseId].holes.length) s.done = true;
  else simInitHole(s);
}

/* esquema del hoyo con la zona de aterrizaje de cada tiro (+ ruta del shadow) */
function simSchematic(hole, shots, shadowShots) {
  const W = 300, H = 430, cx = 150, teeY = 392, greenY = 70, span = teeY - greenY, halfW = 62;
  const P = sh => ({ x: cx + sh.side * halfW, y: teeY - Math.min(1.06, sh.prog) * span });
  const pts = shots.map(P);
  const route = `M${cx},${teeY} ` + pts.map(q => `L${q.x.toFixed(0)},${q.y.toFixed(0)}`).join(' ');
  const colOf = sh => sh.ok ? '#c9f73e' : (sh.lie === 'water' ? '#2f7fa6' : '#ff9f43');
  let zones = '', dots = '';
  shots.forEach((sh, i) => {
    if (sh.lie === 'green') return;
    const q = pts[i], rx = sh.ok ? 15 : 24, c = colOf(sh);
    zones += `<ellipse cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" rx="${rx}" ry="${(rx * 0.7).toFixed(0)}" fill="${c}" opacity="0.15" stroke="${c}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  });
  pts.forEach((q, i) => {
    dots += `<circle cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" r="4" fill="${colOf(shots[i])}"/><text x="${q.x.toFixed(0)}" y="${(q.y - 9).toFixed(0)}" fill="#eef3e6" font-family="Inter,system-ui" font-size="10" font-weight="800" text-anchor="middle">${i + 1}</text>`;
  });
  // pelota que vuela tiro por tiro (vuelo + pausa en cada caída), en bucle
  let ball = '';
  if (pts.length) {
    const allP = [{ x: cx, y: teeY }, ...pts];
    const seg = []; let tot = 0;
    for (let i = 1; i < allP.length; i++) { const l = Math.hypot(allP[i].x - allP[i - 1].x, allP[i].y - allP[i - 1].y); seg.push(l); tot += l || 1; }
    const nf = [0]; { let a = 0; for (const l of seg) { a += l; nf.push(a / tot); } }
    const ev = [{ p: 0, d: 0 }];
    for (let i = 1; i < nf.length; i++) { ev.push({ p: nf[i], d: 1 }); if (i < nf.length - 1) ev.push({ p: nf[i], d: 0.5 }); }
    ev.push({ p: 1, d: 1 });
    const TT = ev.reduce((a, e) => a + e.d, 0); let ac = 0; const kp = [], kt = [];
    ev.forEach(e => { ac += e.d; kp.push(e.p.toFixed(3)); kt.push((ac / TT).toFixed(3)); });
    const dur = (1 + (nf.length - 1) * 1.1).toFixed(1);
    ball = `<circle r="6" fill="#fff" stroke="#0a0f08" stroke-width="1"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${route}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></circle>`;
  }
  let shadowG = '';
  const sh2 = (shadowShots || []).map(P);
  if (sh2.length) {
    shadowG = `<path d="M${cx},${teeY} ${sh2.map(q => `L${q.x.toFixed(0)},${q.y.toFixed(0)}`).join(' ')}" fill="none" stroke="#6db3ff" stroke-width="1.6" stroke-dasharray="2 6" opacity="0.55"/>`
      + sh2.map(q => `<circle cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" r="3" fill="none" stroke="#6db3ff" stroke-width="1.4" opacity="0.7"/>`).join('');
  }
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tiros del hoyo ${hole.n}">
    <rect width="${W}" height="${H}" rx="16" fill="#0a0f08" stroke="#1d2914"/>
    <rect x="${cx - halfW - 4}" y="${greenY - 6}" width="${(halfW + 4) * 2}" height="${teeY - greenY + 14}" rx="${halfW}" fill="#2f6b39"/>
    <rect x="${cx - halfW + 14}" y="${greenY}" width="${(halfW - 14) * 2}" height="${teeY - greenY}" rx="${halfW - 14}" fill="#3a8043" opacity="0.45"/>
    <ellipse cx="${cx}" cy="${greenY}" rx="40" ry="27" fill="#57b15c" stroke="#2f6b39" stroke-width="2"/>
    <circle cx="${cx}" cy="${greenY}" r="3" fill="#0a0f08"/>
    <line x1="${cx}" y1="${greenY}" x2="${cx}" y2="${greenY - 30}" stroke="#eef3e6" stroke-width="2"/>
    <path d="M${cx},${greenY - 30} l13,4 -13,4z" fill="#c9f73e"/>
    ${shadowG}
    ${zones}
    <path d="${route}" fill="none" stroke="#c9f73e" stroke-width="2" stroke-dasharray="3 5"/>
    ${dots}${ball}
    <rect x="${cx - 9}" y="${teeY}" width="18" height="7" rx="2" fill="#9ab07f"/>
    <text x="${cx}" y="${teeY + 22}" fill="#9ab07f" font-family="Inter,system-ui" font-size="10" font-weight="700" text-anchor="middle">TEE</text>
  </svg>`;
}

function vSimulator() {
  const u = cur();
  const agg = Stats.aggregate(myRounds());
  const course = COURSES[V.courseId] || COURSES.campestre;
  const curHcp = u.hcp != null ? u.hcp : 12;
  const goalHcp = V.shadowHcp != null ? V.shadowHcp : simDefaultShadowHcp(u);

  if (!agg) {
    return `<div class="card empty"><div class="e-ico">${golfIcon('ball')}</div><h3>Necesitas tus stats</h3>
      <p>El simulador juega con tus <b class="lime">fairways, GIR, up&down y putts</b> del perfil. Registra al menos una ronda.</p>
      <button class="btn primary" data-act="quick-round">Registrar ronda</button>
      <button class="btn ghost" data-act="seed-demo">Cargar datos de ejemplo</button></div>`;
  }

  const pr = statProbs(u);
  const tp = Math.round((pr.threePutt != null ? pr.threePutt : 0.1) * 100);
  const courseChips = COURSE_ORDER.map(id => `<button class="chip sm ${id === course.id ? 'on' : ''}" data-act="sel-course" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('');
  const sim = V.sim && V.sim.courseId === course.id ? V.sim : null;

  if (!sim) {
    const shadowOpts = [...new Set([u.goal, 5, 3, 0].filter(v => v != null && v <= curHcp))].sort((a, b) => b - a);
    const optsFinal = shadowOpts.length ? shadowOpts : [Math.max(0, curHcp - 3)];
    const shadowChips = optsFinal.map(h => `<button class="chip sm ${h === goalHcp ? 'on' : ''}" data-act="sim-shadow" data-h="${h}">${h === 0 ? 'Scratch' : 'HCP ' + h}</button>`).join('');
    return `<div class="card">
      <div class="chips">${courseChips}</div>
      <p class="note">Juega una ronda virtual en <b>${esc(course.name)}</b>, tiro por tiro. Cada golpe cae según tus stats del perfil, y compites contra tu <b style="color:#6db3ff">Shadow</b> (tu yo objetivo).</p>
      <div class="grid2">
        ${statCard(Math.round(pr.fw * 100) + '%', 'Fairways', pr.fw * 100)}
        ${statCard(Math.round(pr.gir * 100) + '%', 'GIR', pr.gir * 100)}
        ${statCard(Math.round(pr.ud * 100) + '%', 'Up & down', pr.ud * 100)}
        ${statCard(tp + '%', '3-putts', 100 - tp)}
      </div>
      <p class="note" style="margin:14px 0 6px"><b style="color:#6db3ff">Nivel de tu Shadow</b> (a quién quieres llegar):</p>
      <div class="chips">${shadowChips}</div>
      <button class="btn primary" data-act="sim-start" style="margin-top:14px">${golfIcon('club')} Jugar vs Shadow (${goalHcp === 0 ? 'Scratch' : 'HCP ' + goalHcp})</button>
    </div>`;
  }

  // ---- ronda ya simulada completa: resumen + navegador tiro por tiro ----
  const me = sim.holes;
  const meTot = me.reduce((a, h) => a + h.score, 0);
  const shTot = me.reduce((a, h) => a + h.shScore, 0);
  const parTot = course.holes.reduce((a, h) => a + h.par, 0);
  const fwT = me.filter(h => h.fw !== null).length, fwH = me.filter(h => h.fw === true).length;
  const girH = me.filter(h => h.gir).length, putts = me.reduce((a, h) => a + h.putts, 0);
  const diff = meTot - shTot;
  const vh = Math.min(sim.viewHole || 0, me.length - 1);
  const H = me[vh], hole = course.holes[vh];
  const hTP = H.score - hole.par;
  const holeChips = me.map((h, i) => `<button class="hole-chip ${i === vh ? 'on' : ''}" data-act="sim-hole" data-i="${i}">${h.n}</button>`).join('');
  const logHtml = H.log.map(l => `<div class="sim-shot ${l.ok ? 'ok' : 'bad'}">${esc(l.t)}</div>`).join('');

  return `<div class="sec-h"><h2>${golfIcon('ball')} Simulador de ronda</h2><span class="small muted">ronda completa</span></div>
    <div class="card">
      <div class="greet" style="text-align:center;padding-top:6px"><h1 style="font-size:46px">${meTot}</h1><p class="hcp">${fmtToPar(meTot - parTot)} · ${me.length} hoyos</p></div>
      <div class="sim-vs"><span>Tú <b>${meTot}</b></span><span class="muted">vs</span><span style="color:#6db3ff">Shadow HCP ${sim.shadowGoal} <b>${shTot}</b></span></div>
      <p class="note" style="text-align:center;margin-top:4px">${diff <= 0 ? '¡Le ganaste o empataste a tu Shadow!' : `Tu Shadow te sacó <b class="lime">${diff}</b> golpe${diff > 1 ? 's' : ''} — ese es el camino.`}</p>
      <div class="grid2" style="margin-top:8px">
        ${statCard((fwT ? Math.round(fwH / fwT * 100) : 0) + '%', 'Fairways', fwT ? fwH / fwT * 100 : 0)}
        ${statCard(Math.round(girH / me.length * 100) + '%', 'GIR', girH / me.length * 100)}
      </div>
      <p class="note" style="text-align:center">${putts} putts en la ronda</p>
    </div>

    <div class="sec-h" style="margin-top:16px"><h2 style="font-size:16px">Tu ronda tiro por tiro</h2><span class="small muted">elige un hoyo</span></div>
    <div class="hole-strip">${holeChips}</div>
    <div class="card" style="padding-bottom:8px">
      <div class="ph-head"><div class="r-main" style="flex:1"><b>Hoyo ${hole.n} · Par ${hole.par}</b><span class="muted">${hole.yds} yds · hoyo ${vh + 1}/${me.length}</span></div>
        <div class="r-side"><b style="color:var(--lime-ink)">${H.score}</b><span>${hTP === 0 ? 'par' : hTP > 0 ? '+' + hTP : hTP}</span></div></div>
      <div class="sim-vs" style="margin-top:8px"><span>Tú ${H.score}</span><span style="color:#6db3ff">Shadow ${H.shScore}</span></div>
      <div style="margin-top:6px">${simSchematic(hole, H.log, H.shLog)}</div>
    </div>
    <div class="card"><span class="label">Tiros del hoyo ${hole.n}</span>
      <div class="sim-log">${logHtml}</div>
    </div>
    <div class="card"><span class="label">Tarjeta · Tú vs Shadow</span>
      ${scorecardTable(me.length, i => me[i].par, [
        { name: esc(u.name.split(' ')[0]), scoreOf: i => me[i].score },
        { name: 'Shadow', scoreOf: i => me[i].shScore }
      ], -1)}
    </div>
    <button class="btn primary" data-act="sim-start">Jugar otra vez</button>
    <button class="btn" data-act="sim-reset">Salir</button>`;
}

/* ---- objetivo realista por % del jugador + plan de mejora semanal ---- */
/* probabilidades de un jugador de un HCP dado (para el shadow / fallback) */
function hcpProbs(h) {
  const cl = v => Math.max(0.02, Math.min(0.98, v));
  const pg = Math.min(2.35, 1.82 + h * 0.012);
  return {
    fw: cl(0.62 - h * 0.012), gir: cl(0.6 - h * 0.022), ud: cl(0.55 - h * 0.011),
    puttsGIR: pg, threePutt: cl(0.05 + h * 0.006), onePutt: cl((2.1 - pg) * 0.7), from: 'hcp'
  };
}
function statProbs(user) {
  const cl = v => Math.max(0.02, Math.min(0.98, v));
  const agg = Stats.aggregate(myRounds());
  if (agg) {
    const pg = Math.max(1.55, Math.min(2.4, agg.puttsPerGir || 2));
    return {
      fw: cl(agg.fwPct / 100), gir: cl(agg.girPct / 100), ud: cl(agg.scrPct / 100),
      puttsGIR: pg, threePutt: cl((agg.threePct != null ? agg.threePct : 10) / 100),
      onePutt: cl((2.1 - pg) * 0.7), from: 'stats'
    };
  }
  return hcpProbs(user.hcp != null ? user.hcp : 18);
}
function weeklyPlan(user) {
  const agg = Stats.aggregate(myRounds());
  if (!agg) return null;
  const cand = [
    { label: 'Fairways', val: agg.fwPct, good: 62, step: 6, dir: 1 },
    { label: 'GIR', val: agg.girPct, good: 52, step: 6, dir: 1 },
    { label: 'Up & down', val: agg.scrPct, good: 52, step: 7, dir: 1 },
    { label: '3-putts', val: agg.threePct, good: 8, step: 4, dir: -1 },
  ];
  cand.forEach(c => c.gap = c.dir > 0 ? c.good - c.val : c.val - c.good);
  const weak = cand.filter(c => c.gap > 1).sort((a, b) => b.gap - a.gap).slice(0, 2);
  return {
    avg: agg.avgScore18,
    items: weak.map(c => ({
      label: c.label, from: Math.round(c.val),
      to: c.dir > 0 ? Math.min(c.good, Math.round(c.val + c.step)) : Math.max(c.good, Math.round(c.val - c.step))
    }))
  };
}
function goalProbs(user) {
  const pr = statProbs(user), wp = weeklyPlan(user);
  if (!wp) return pr;
  const g = Object.assign({}, pr);
  wp.items.forEach(it => {
    if (it.label === 'Fairways') g.fw = it.to / 100;
    if (it.label === 'GIR') g.gir = it.to / 100;
    if (it.label === 'Up & down') g.ud = it.to / 100;
    if (it.label === '3-putts') g.puttsGIR = Math.max(1.55, pr.puttsGIR - 0.08);
  });
  return g;
}
/* valor esperado de golpes en el hoyo dadas tus probabilidades */
function expectedHole(hole, pr) {
  const P = hole.par, reg = P - 2;
  const scoreGIR = reg + pr.puttsGIR;
  const scoreMiss = reg + 1 + pr.ud * 1 + (1 - pr.ud) * 2.25;
  let e = pr.gir * scoreGIR + (1 - pr.gir) * scoreMiss;
  if (P >= 4) e += (1 - pr.fw) * 0.22;
  if (P === 5) e -= 0.04;
  return e;
}
/* reparte un total objetivo entre los hoyos según su dificultad esperada */
function realisticTargets(course, prGoal, total) {
  const exp = course.holes.map(h => expectedHole(h, prGoal));
  const sum = exp.reduce((a, b) => a + b, 0);
  const tot = total != null ? total : Math.round(sum);
  const scaled = exp.map(e => e * (tot / sum));
  const targets = scaled.map(x => Math.floor(x));
  let rem = tot - targets.reduce((a, b) => a + b, 0);
  scaled.map((x, i) => ({ i, f: x - Math.floor(x) })).sort((a, b) => b.f - a.f).forEach(o => { if (rem > 0) { targets[o.i]++; rem--; } });
  course.holes.forEach((h, i) => { targets[i] = Math.max(h.par - 1, Math.min(h.par + 3, targets[i])); });
  return { targets, total: targets.reduce((a, b) => a + b, 0), par: course.holes.reduce((a, h) => a + h.par, 0) };
}
/* palo con mejor % para una distancia (control + efectividad) */
function bestClubForDist(user, dist, noDriver) {
  let bag = bagInfo(user);
  if (noDriver) bag = bag.filter(c => c.id !== 'dr');
  if (!bag.length) return null;
  const near = bag.filter(c => Math.abs(c.carry - dist) <= 18 && c.carry >= dist - 14);
  if (near.length) return near.sort((a, b) => b.eff - a.eff || Math.abs(a.carry - dist) - Math.abs(b.carry - dist))[0];
  const reach = bag.filter(c => c.carry >= dist - 8);
  return (reach.length ? reach : bag).slice().sort((a, b) => Math.abs(a.carry - dist) - Math.abs(b.carry - dist) || b.eff - a.eff)[0];
}
/* secuencia ideal de tiros (se ajusta al palo de salida elegido) */
function idealPath(user, hole, tee, attack) {
  const shots = [];
  if (hole.par === 3) {
    const c = tee || bestClubForDist(user, hole.yds, false);
    shots.push({ club: c, carry: c ? c.carry : hole.yds, leaves: 0, to: 'green' });
  } else {
    const t = tee || (hole.yds > 240 ? bagInfo(user).slice().sort((a, b) => b.carry - a.carry)[0] : bestClubForDist(user, hole.yds, false));
    const tc = t ? t.carry : 235;
    let rem = Math.max(0, hole.yds - tc);
    shots.push({ club: t, carry: tc, leaves: rem, to: rem <= 5 ? 'green' : 'la calle' });
    if (hole.par === 4) {
      if (rem > 5) { const c2 = bestClubForDist(user, rem, true); shots.push({ club: c2, carry: c2 ? c2.carry : rem, leaves: 0, to: 'green' }); }
    } else if (attack && rem > 5) {
      const c2 = bestClubForDist(user, rem, true); shots.push({ club: c2, carry: c2 ? c2.carry : rem, leaves: 0, to: 'green' });
    } else {
      let lay = rem - 100;
      if (lay > 30) { const c2 = bestClubForDist(user, lay, true); const cc = c2 ? c2.carry : lay; rem = Math.max(0, rem - cc); shots.push({ club: c2, carry: cc, leaves: rem, to: 'la calle' }); }
      const c3 = bestClubForDist(user, rem, true); shots.push({ club: c3, carry: c3 ? c3.carry : rem, leaves: 0, to: 'green' });
    }
  }
  return { shots, idealScore: shots.length + 2 };
}
function realisticWhy(hole, target, pr) {
  const gir = Math.round(pr.gir * 100), ud = Math.round(pr.ud * 100);
  const d = target - hole.par;
  if (d <= 0) return `Das green ~${gir}% y este hoyo entra en tu rango: ve por el par.`;
  return `Tu green es ~${gir}% y up&down ~${ud}%, así que lo realista aquí es ${target}: date chance de ${d >= 2 ? 'un doble' : '1 bogey'} y recupéralo en los hoyos fáciles. No fuerces el milagro.`;
}

/* OBJETIVOS → solo los números objetivo de la semana (vive en Inicio, sin curso) */
function objetivosCard(u) {
  const agg = Stats.aggregate(myRounds());
  const pr = goalProbs(u);
  const N = 18, driveHoles = 14;            // ronda estándar de 18 (14 hoyos con salida)
  const fwT = Math.round(pr.fw * driveHoles);
  const girT = Math.round(pr.gir * N);
  const udPct = Math.round(pr.ud * 100);
  const puttsT = agg ? Math.round(agg.putts18 * 0.96) : 34;
  const scoreT = agg ? Math.round(agg.avgScore18 - 2) : null;
  return `<div class="card">
      <span class="label">${golfIcon('green')} Tu objetivo de esta semana</span>
      ${scoreT != null ? `<div class="greet" style="text-align:center;padding-top:4px"><h1 style="font-size:40px">${scoreT}</h1><p class="hcp">${fmtToPar(scoreT - 72)} · meta de score (18)</p></div>` : ''}
      <div class="grid2" style="margin-top:6px">
        ${statCard(`${fwT}/${driveHoles}`, 'Fairways', pr.fw * 100)}
        ${statCard(`${girT}/${N}`, 'Greens (GIR)', pr.gir * 100)}
        ${statCard(`${udPct}%`, 'Up & down', pr.ud * 100)}
        ${statCard(`≤${puttsT}`, 'Putts', 72)}
      </div>
      <p class="note" style="margin-bottom:0">Pega <b class="lime">${fwT} de ${driveHoles}</b> calles y <b class="lime">${girT} de ${N}</b> greens, salva el ${udPct}% y deja los putts en ${puttsT}.</p>
    </div>`;
}

/* ENTRENAMIENTO → campaña de misiones a lograr + práctica + drills */
function vEntreno() {
  const u = cur();
  const agg = Stats.aggregate(myRounds());
  const practices = (typeof myPractices === 'function' ? myPractices() : []);
  const pc = practices.length;
  const driverP = practices.filter(p => p.drill === 'Driver').length;
  const clubsSet = !!(u.clubs && Object.keys(u.clubs).some(k => u.clubs[k] != null));
  const pr = goalProbs(u);
  const fwG = Math.round(pr.fw * 100), girG = Math.round(pr.gir * 100), udG = Math.round(pr.ud * 100);
  const fw = agg ? agg.fwPct : 0, gir = agg ? agg.girPct : 0, ud = agg ? agg.scrPct : 0, threeP = agg ? agg.threePct : 99;
  const cl = v => Math.max(0, Math.min(1, v));
  const M = [
    { ic: 'club', t: 'Arma tu bolsa', d: 'Carga tus palos y distancias en tu perfil', prog: clubsSet ? 1 : 0, done: clubsSet },
    { ic: 'card', t: 'Primeras 5 prácticas', d: `Registra 5 sesiones · ${Math.min(5, pc)}/5`, prog: cl(pc / 5), done: pc >= 5 },
    { ic: 'club', t: 'Domina tu salida', d: `3 prácticas de Driver · ${Math.min(3, driverP)}/3`, prog: cl(driverP / 3), done: driverP >= 3 },
    { ic: 'tee', t: `Calles al ${fwG}%`, d: `Tus fairways: ${Math.round(fw)}% → ${fwG}%`, prog: cl(fw / Math.max(1, fwG)), done: fw >= fwG },
    { ic: 'green', t: `Greens al ${girG}%`, d: `Tu GIR: ${Math.round(gir)}% → ${girG}%`, prog: cl(gir / Math.max(1, girG)), done: gir >= girG },
    { ic: 'flag', t: `Up & down al ${udG}%`, d: `Tu juego corto: ${Math.round(ud)}% → ${udG}%`, prog: cl(ud / Math.max(1, udG)), done: ud >= udG },
    { ic: 'putter', t: 'Putt sólido', d: `Baja tus 3-putts a ≤10% · hoy ${Math.round(threeP)}%`, prog: cl(10 / Math.max(1, threeP)), done: threeP <= 10 },
  ];
  const doneCount = M.filter(x => x.done).length;
  const activeIdx = M.findIndex(x => !x.done);
  const rows = M.map((x, i) => {
    const st = x.done ? 'done' : (i === activeIdx ? 'active' : 'todo');
    return `<div class="mission ${st}">
      <div class="m-ic">${x.done ? '✓' : golfIcon(x.ic)}</div>
      <div class="m-body"><b>${esc(x.t)}${i === activeIdx ? ' <span class="m-tag">ahora</span>' : ''}</b><span>${esc(x.d)}</span>
        ${!x.done ? `<div class="bar mini" style="margin-top:6px"><i style="width:${Math.round(x.prog * 100)}%"></i></div>` : ''}
      </div>
    </div>`;
  }).join('');
  return `<div class="sec-h"><h2>Tu campaña</h2><span class="small muted">${doneCount}/${M.length} misiones</span></div>
    <div class="card">
      <span class="label">${golfIcon('flag')} Misiones de mejora</span>
      <p class="note" style="margin-top:0;margin-bottom:10px">Completa misiones para llegar a tu objetivo. Cada una te acerca a tu meta.</p>
      <div class="bar" style="margin-bottom:12px"><i style="width:${Math.round(doneCount / M.length * 100)}%"></i></div>
      <div class="mission-list">${rows}</div>
    </div>
    ${vTracker()}
    <div class="sec-h" style="margin-top:20px"><h2 style="font-size:18px">Biblioteca de drills</h2></div>
    ${vDrillsLibrary()}`;
}

/* CAMPOS → camino ideal por hoyo, analizable por hándicap */
/* ayuda para conseguir la calle (hoyo + tu patrón de fallo + tu bolsa) */
function fairwayTip(hole, agg, u, bench, teeClub) {
  if (hole.par === 3) return `Par 3: es tiro directo al green. Con tu bolsa${teeClub ? ` el palo es ${teeClub.name} (~${teeClub.carry}y)` : ''}; comprométete al centro.`;
  const fw = agg ? Math.round(agg.fwPct) : null;
  const miss = agg ? (agg.missTee.izq === agg.missTee.der ? null : (agg.missTee.izq > agg.missTee.der ? 'izq' : 'der')) : null;
  let s = hole.dog === 'left' ? 'Dogleg a la izquierda: línea segura por el centro-derecha.'
    : hole.dog === 'right' ? 'Dogleg a la derecha: juega al centro-izquierda.'
      : 'Calle recta: fija un blanco en el centro y apúntale.';
  if (teeClub) s += ` Con ${teeClub.name} (~${teeClub.carry}y, ${teeClub.eff}% acierto)${fw != null && fw < 55 ? ' priorizas control' : ''}.`;
  if (hole.dog === 'left') s += ' Un draw (de derecha a izquierda) acompaña el dogleg.';
  else if (hole.dog === 'right') s += ' Un fade (de izquierda a derecha) acompaña el dogleg.';
  if (fw != null) s += ` Vas ${fw}% de calles${miss ? `, fallas a la ${miss === 'izq' ? 'izquierda' : 'derecha'} (apunta al lado contrario)` : ''}${bench ? ` · meta HCP ${bench.hcp}: ${Math.round(bench.fwPct)}%` : ''}.`;
  return s;
}
/* mejor palo de approach que NO se pasa del green (carry ≤ distancia) */
function approachClubNoOver(u, dist) {
  let bag = bagInfo(u).filter(c => c.id !== 'dr');
  if (!bag.length) bag = bagInfo(u);
  if (!bag.length) return null;
  const under = bag.filter(c => c.carry <= dist + 6).sort((a, b) => b.carry - a.carry);
  return under.length ? under[0] : bag.slice().sort((a, b) => a.carry - b.carry)[0];
}
/* plan de golpes según el palo de salida elegido (carry real + sin pasarse) */
function strategyPlan(u, hole, teeClub) {
  const carry = teeClub ? teeClub.carry : ((bestClubForDist(u, hole.yds, false) || {}).carry || 235);
  const steps = [];
  if (hole.par === 3) { steps.push({ club: teeClub, dist: carry, to: 'green', leaves: 0 }); return steps; }
  let rem = Math.max(0, hole.yds - carry);
  steps.push({ club: teeClub, dist: carry, to: rem <= 8 ? 'green' : 'calle', leaves: rem });
  if (rem <= 8) return steps;
  const bag = bagInfo(u).filter(c => c.id !== 'dr');
  const longest = bag.length ? bag.slice().sort((a, b) => b.carry - a.carry)[0].carry : 200;
  if (rem > longest + 8) {
    const lay = approachClubNoOver(u, rem - 100);
    const lc = lay ? lay.carry : rem - 100;
    rem = Math.max(45, rem - lc);
    steps.push({ club: lay, dist: lc, to: 'calle', leaves: rem, layup: true });
  }
  const appr = approachClubNoOver(u, rem);
  steps.push({ club: appr, dist: appr ? appr.carry : rem, to: 'green', leaves: 0, approach: true });
  return steps;
}
/* ayuda para conseguir green en regulación (+ palo de tu bolsa) */
function girTip(hole, agg, u, bench, apprClub) {
  const r = (hole.risks || []).find(x => x.at === 'green');
  const gir = agg ? Math.round(agg.girPct) : null;
  let s = r ? `${r.kind === 'water' ? 'Agua' : 'Bunker'} ${r.side === 'left' ? 'a la izquierda' : 'a la derecha'} del green: apunta al lado contrario y al centro.`
    : 'Green sin peligros marcados: apunta al centro.';
  if (apprClub) s += ` El tiro al green pide ~${apprClub.carry}y: tu ${apprClub.name} es el palo.`;
  if (agg) {
    const ma = agg.missApp, short = (ma.corto || 0) >= (ma.largo || 0);
    s += ` Sueles quedarte ${short ? 'corto: toma un palo más' : 'largo: toma un palo menos'} y juega al centro (vas ${gir}% de GIR${bench ? `, meta ${Math.round(bench.girPct)}%` : ''}).`;
  }
  return s;
}
/* objetivo realista del hoyo según tus stats + rumbo al hándicap meta */
function objectiveTip(hole, u, bench) {
  let exp = hole.par + 1;
  try { exp = expectedHole(hole, statProbs(u)); } catch (e) {}
  const tgt = Math.round(exp), d = tgt - hole.par;
  const lab = d <= 0 ? 'par o mejor' : d === 1 ? 'bogey' : `+${d}`;
  const goalTxt = bench ? ` Cada calle y green que sumes te acerca a HCP ${bench.hcp}.` : '';
  return `Apunta a ${tgt} (${lab}). ${d <= 0 ? 'Entra en tu rango: ve por el par sin arriesgar.' : `Un ${lab} aquí es buen número; juega seguro y recupera en los fáciles.`}${goalTxt}`;
}

/* qué hacer en el 2º tiro según dónde quedó la salida */
function secondShotRec(hole, lie, apprClub) {
  const club = apprClub ? apprClub.name : 'tu hierro';
  if (hole.par === 3) return 'Par 3: ya estás en (o cerca de) green. Si fallaste, pásate a "si fallas el green".';
  if (lie === 'fw') return `Calle limpia: ataca con ${club} al centro del green. Tienes la lie para comprometerte al tiro.`;
  if (lie === 'izq' || lie === 'der') return `Rough ${lie === 'izq' ? 'izquierdo' : 'derecho'}: si la lie está limpia, un palo más y al CENTRO del green (sin spin no para). Si está enterrada, no seas héroe: saca a la calle con un hierro medio y juega el siguiente cómodo.`;
  return 'Penal / OB: dropa y saca a la calle con un hierro 7-8; juega el green en el siguiente y firma bogey. Evitar el doble es ganar.';
}
/* qué tiro de juego corto jugar según dónde fallaste el green */
function shortGameRec(miss) {
  if (miss === 'corto') return 'Corto del green: chip-and-run con PW o 9 — bótala pronto sobre el green y deja que ruede como un putt hacia el hoyo.';
  if (miss === 'largo') return 'Te pasaste: flop / lob (58-60°), cara abierta y acelera suave para que suba, frene rápido y se quede cerca.';
  if (miss === 'bunker') return 'Bunker: splash — golpea 5 cm detrás de la bola con la cara abierta y TERMINA el swing. Prioridad: sacarla al green.';
  return `Falló a la ${miss === 'izq' ? 'izquierda' : 'derecha'}: pitch o chip al centro del green; no busques el pin, deja la bola dada (a 1 m) y salva con un putt.`;
}

/* Estrategia por hoyo (random + stats) + historias de hoyos pasados tiro por tiro */
function vEstrategia() {
  const u = cur();
  const agg = Stats.aggregate(myRounds());
  const cid = (V.stratCid && COURSES[V.stratCid]) ? V.stratCid : 'campestre';
  const course = COURSES[cid];
  let idx = V.stratIdx; if (idx == null || idx >= course.holes.length) idx = 0;
  const hole = course.holes[idx];
  const sName = course.name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
  const bench = Stats.benchFor(u.goal != null ? u.goal : Math.max(0, (u.hcp != null ? u.hcp : 12) - 5));
  const teeCands = teeCandidates(u, hole);
  const selTee = teeCands.find(c => c.id === V.stratTeeId) || teeCands[0] || null;
  const landings = computeLandings(hole, selTee, false);
  const plan = strategyPlan(u, hole, selTee);
  const teeClub = selTee;
  const apprStep = plan.find(s => s.approach) || plan[plan.length - 1];
  const apprClub = apprStep ? apprStep.club : null;
  const lie = V.stratLie || 'fw';
  const miss = V.stratMiss || null;
  const maxEff = teeCands.reduce((m, c) => Math.max(m, c.eff || 0), 0);
  const courseChips = COURSE_ORDER.map(id => `<button class="chip sm ${id === cid ? 'on' : ''}" data-act="strat-course" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('');
  const holeChips = course.holes.map((h, i) => `<button class="hole-chip ${i === idx ? 'on' : ''}" data-act="strat-hole" data-i="${i}">${h.n}</button>`).join('');
  const tip = (icon, title, text) => `<div class="strat-tip"><span class="strat-ic">${golfIcon(icon)}</span><div><b>${title}</b><p>${esc(text)}</p></div></div>`;
  const teeChips = teeCands.length
    ? teeCands.map(c => `<button class="chip sm ${selTee && c.id === selTee.id ? 'on' : ''}" data-act="strat-tee" data-c="${c.id}">${esc(c.name)} · ${c.carry}y · ${c.eff}%${c.eff === maxEff && maxEff > 0 ? ' ★' : ''}</button>`).join('')
    : `<p class="note" style="margin:0">Carga tus bastones en Perfil para ver el plan con tu bolsa.</p>`;
  const planRows = plan.map((s, i) => {
    const nm = s.club ? s.club.name : '—';
    const eff = s.club ? ` · ${s.club.eff}%` : '';
    const lab = i === 0 ? (hole.par === 3 ? 'Tiro al green' : 'Salida') : s.layup ? 'Layup' : 'Al green';
    const sub = s.to === 'green' ? 'llega al green sin pasarte' : `cae a ~${s.dist}y, te deja ${s.leaves}y`;
    return `<div class="path-row"><span class="path-n">${i + 1}</span><div class="r-main"><b>${esc(lab)}: ${esc(nm)} (~${s.dist}y${eff})</b><span>${sub}</span></div></div>`;
  }).join('');

  return `<div class="sec-h" style="margin-top:4px"><h2 style="font-size:18px">Estrategia por hoyo</h2><span class="small muted">con tu bolsa</span></div>
    <div class="chips" style="margin-top:6px">${courseChips}</div>
    <button class="btn sm ghost" data-act="strat-random" style="margin-top:8px">${golfIcon('ball')} Hoyo al azar</button>
    <div class="hole-strip" style="margin-top:8px">${holeChips}</div>
    <div class="card" style="padding:12px">${holeSchematic(hole, landings)}</div>
    <div class="card">
      <span class="label">${esc(sName)} · Hoyo ${hole.n} · Par ${hole.par} · ${hole.yds}y</span>
      <span class="label" style="margin-top:12px;display:block">${hole.par === 3 ? 'Elige tu palo' : 'Elige tu salida'} <span class="muted" style="text-transform:none;letter-spacing:0">· ★ = más preciso</span></span>
      <div class="chips" style="margin-top:6px">${teeChips}</div>
      <span class="label" style="margin-top:14px;display:block">Plan</span>
      <div class="path-list" style="margin-top:6px">${planRows}
        <div class="path-row"><span class="path-n">P</span><div class="r-main"><b>2 putts</b><span>para anotar tu objetivo</span></div></div>
      </div>
      <div class="strat-tips" style="margin-top:14px">
        ${tip('tee', 'Conseguir la calle', fairwayTip(hole, agg, u, bench, teeClub))}
        ${tip('green', 'Conseguir el green (GIR)', girTip(hole, agg, u, bench, apprClub))}
        ${tip('flag', 'Objetivo · rumbo a tu meta', objectiveTip(hole, u, bench))}
      </div>
    </div>
    <div class="card">
      <span class="label">¿Dónde quedó tu salida?</span>
      <div class="chips" style="margin-top:6px">${[['fw', 'Fairway'], ['izq', '← Izq'], ['der', 'Der →'], ['penal', 'Penal']].map(([v, l]) => `<button class="chip sm ${lie === v ? 'on' : ''}" data-act="strat-lie" data-v="${v}">${l}</button>`).join('')}</div>
      <p class="tip" style="margin-top:10px"><b style="color:var(--text)">2º tiro:</b> ${esc(secondShotRec(hole, lie, apprClub))}</p>
      <span class="label" style="margin-top:16px;display:block">Si fallas el green…</span>
      <div class="chips" style="margin-top:6px">${[['corto', 'Corto'], ['largo', 'Largo'], ['izq', '← Izq'], ['der', 'Der →'], ['bunker', 'Bunker']].map(([v, l]) => `<button class="chip sm ${miss === v ? 'on' : ''}" data-act="strat-miss" data-v="${v}">${l}</button>`).join('')}</div>
      <p class="tip" style="margin-top:10px"><b style="color:var(--text)">Juego corto:</b> ${miss ? esc(shortGameRec(miss)) : 'Elige dónde quedó la bola para ver qué tiro jugar.'}</p>
    </div>`;
}

function vCampos() {
  const u = cur();
  const course = COURSES[V.courseId] || COURSES.campestre;
  if (V.holeIdx >= course.holes.length) V.holeIdx = 0;
  const idx = V.holeIdx || 0, hole = course.holes[idx];
  const reachable = reachableIn2(u, hole);
  const attack = reachable && V.attack2;
  const analyzeHcp = V.camposHcp != null ? V.camposHcp : (u.hcp != null ? u.hcp : 12);
  const pr = hcpProbs(analyzeHcp);
  const rt = realisticTargets(course, pr);
  const target = rt.targets[idx];
  const stance = holeStance(hole, analyzeHcp, reachable);
  const ideal = idealPath(u, hole, null, attack);
  const teeClub = ideal.shots[0] ? ideal.shots[0].club : null;
  const landings = computeLandings(hole, teeClub, attack);

  const relTarget = t => { const d = t - hole.par; return d === 0 ? 'Par' : d === 1 ? 'Bogey' : d === -1 ? 'Birdie' : d > 0 ? '+' + d : String(d); };
  const courseChips = COURSE_ORDER.map(id => `<button class="chip sm ${id === course.id ? 'on' : ''}" data-act="sel-course" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('');
  const holeChips = course.holes.map((h, i) => `<button class="hole-chip ${i === idx ? 'on' : ''}" data-act="sel-hole" data-i="${i}">${h.n}</button>`).join('');
  const shotRows = ideal.shots.map((s, i) => {
    const nm = s.club ? s.club.name : '—';
    const eff = s.club ? ` · ${s.club.eff}%` : '';
    const leaveTxt = s.to === 'green' ? '→ al green' : `→ deja ${s.leaves}y en ${s.to}`;
    return `<div class="path-row"><span class="path-n">${i + 1}</span><div class="r-main"><b>${esc(nm)}${eff}</b><span>vuela ~${s.carry}y ${leaveTxt}</span></div></div>`;
  }).join('');
  const hset = new Map();
  hset.set(u.hcp != null ? u.hcp : 12, `Tú · ${fmtHcp(u.hcp != null ? u.hcp : 12)}`);
  [0, 5, 10, 15, 20].forEach(h => { if (!hset.has(h)) hset.set(h, h === 0 ? 'Scratch' : 'HCP ' + h); });
  const hcpChips = [...hset.keys()].sort((a, b) => a - b).map(h => `<button class="chip sm ${h === analyzeHcp ? 'on' : ''}" data-act="campos-hcp" data-h="${h}">${esc(hset.get(h))}</button>`).join('');

  return `<div class="sec-h"><h2>Campos</h2><span class="small muted">camino ideal por hoyo</span></div>
    <div class="chips" style="margin-top:8px">${courseChips}</div>
    <div class="card">
      <span class="label">Analiza el track de un hándicap</span>
      <div class="chips" style="margin-top:6px">${hcpChips}</div>
      <p class="note" style="margin-bottom:0">Objetivo de ronda para ${analyzeHcp === 0 ? 'scratch' : 'HCP ' + analyzeHcp} en ${esc(course.name.split(' · ')[0].replace('Club ', ''))}: <b class="lime">${rt.total}</b> (${fmtToPar(rt.total - rt.par)}).</p>
    </div>

    <div class="hole-strip">${holeChips}</div>
    <div class="card" style="padding:12px">${holeSchematic(hole, landings)}</div>

    <div class="card">
      <span class="label">Hoyo ${hole.n} · Par ${hole.par} · ${hole.yds}y</span>
      <div class="path-list" style="margin-top:8px">${shotRows}
        <div class="path-row"><span class="path-n">P</span><div class="r-main"><b>2 putts</b><span>para anotar ${ideal.idealScore}</span></div></div>
      </div>
      <div class="grid2" style="margin-top:12px">
        ${statCard(relTarget(target), 'Objetivo realista', 100)}
        <div class="card"><div class="stat-num" style="font-size:20px">${esc(stance.k)}</div><div class="stat-cap">cómo jugarlo</div></div>
      </div>
      <p class="tip" style="margin-top:10px"><b style="color:var(--text)">La IA dice:</b> ${esc(realisticWhy(hole, target, pr))}</p>
      <p class="tip">${esc(stance.t)}</p>
      ${reachable ? `<div style="border-top:1px solid var(--line-soft);margin-top:10px;padding-top:12px">
        <button class="chip ${attack ? 'on' : ''}" data-act="toggle-attack">${golfIcon('green')} Atacar el green en 2 ${attack ? '✓' : ''}</button>
        <p class="tip" style="margin-top:8px">${esc(attackWhy(u, hole, attack))}</p>
      </div>` : ''}
    </div>
    ${vHcpReference(u)}
    <p class="note" style="margin-bottom:24px">${course.approx ? 'Pares reales; yardas por hoyo aproximadas.' : 'Par y yardas reales.'} Esquema genérico (no a escala).</p>`;
}
