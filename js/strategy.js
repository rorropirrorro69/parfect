/* ============ Estrategia + Simulador por hoyo — multi-campo ============ */

const CAMP_HOLES = [
  { n: 1, par: 5, yds: 503, dog: 'straight', risks: [{ at: 'drive', side: 'right', kind: 'bunker' }], tips: ['Calle amplia; los bunkers de salida están a la derecha.'] },
  { n: 2, par: 5, yds: 550, dog: 'right', risks: [{ at: 'green', side: 'left', kind: 'bunker' }], tips: ['El hoyo más largo; un arroyo cruza antes del green.'] },
  { n: 3, par: 3, yds: 174, dog: 'straight', risks: [{ at: 'green', side: 'left', kind: 'water' }], tips: ['Laguna a la izquierda del green.'] },
  { n: 4, par: 4, yds: 405, dog: 'left', risks: [{ at: 'green', side: 'right', kind: 'bunker' }], tips: ['Dogleg suave a la izquierda.'] },
  { n: 5, par: 3, yds: 201, dog: 'straight', risks: [{ at: 'green', side: 'left', kind: 'bunker' }], tips: ['El par 3 más largo.'] },
  { n: 6, par: 4, yds: 432, dog: 'right', risks: [{ at: 'green', side: 'left', kind: 'bunker' }], tips: ['Par 4 largo; importa estar en calle.'] },
  { n: 7, par: 5, yds: 529, dog: 'left', risks: [{ at: 'green', side: 'right', kind: 'water' }], tips: ['Alcanzable en dos; agua a la derecha del green.'] },
  { n: 8, par: 3, yds: 176, dog: 'straight', risks: [{ at: 'green', side: 'left', kind: 'water' }], tips: ['Agua a la izquierda del green.'] },
  { n: 9, par: 4, yds: 407, dog: 'right', risks: [{ at: 'green', side: 'right', kind: 'bunker' }], tips: ['Hoyo de cierre hacia la casa club.'] },
];
function buildHoles(pars, yards) {
  return pars.map((par, i) => {
    const n = i + 1;
    const dog = par === 3 ? 'straight' : (n % 2 === 0 ? 'right' : 'left');
    const risks = par === 3 ? [{ at: 'green', side: n % 2 ? 'left' : 'right', kind: n % 4 === 0 ? 'water' : 'bunker' }] : [{ at: 'green', side: n % 2 ? 'right' : 'left', kind: 'bunker' }];
    return { n, par, yds: yards[i], dog, risks, tips: [`Par ${par} de ${yards[i]} yds.`] };
  });
}
const TM_PARS = [4, 4, 3, 4, 5, 3, 4, 5, 4, 4, 4, 4, 3, 3, 4, 5, 4, 5];
const TM_YDS = [433, 466, 207, 434, 555, 187, 389, 530, 404, 520, 380, 374, 214, 216, 509, 541, 350, 545];
const ALT_PARS = [4, 5, 4, 4, 3, 5, 3, 4, 4, 4, 4, 3, 4, 3, 4, 5, 4, 5];
const ALT_YDS = ALT_PARS.map(p => p === 3 ? 195 : p === 4 ? 420 : 565);
const COURSES = {
  campestre: { id: 'campestre', name: 'Club Campestre Morelia', sub: '9 hoyos · Par 72', holes: CAMP_HOLES },
  tresmarias: { id: 'tresmarias', name: 'Tres Marías · El Reto', sub: '18 hoyos · Par 72', approx: true, holes: buildHoles(TM_PARS, TM_YDS) },
  altozano: { id: 'altozano', name: 'Altozano Morelia', sub: '18 hoyos · Par 72', approx: true, holes: buildHoles(ALT_PARS, ALT_YDS) },
};
const COURSE_ORDER = ['campestre', 'tresmarias', 'altozano'];

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
  if (hole.par === 3) return bag.slice().sort((a, b) => Math.abs(a.carry - hole.yds) - Math.abs(b.carry - hole.yds)).slice(0, 6).sort((a, b) => b.carry - a.carry);
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
    lands += `<ellipse cx="${q.p[0].toFixed(0)}" cy="${q.p[1].toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="#c9f73e" opacity="0.16" stroke="#c9f73e" stroke-width="1.5" stroke-dasharray="4 4"><animate attributeName="opacity" values="0.1;0.24;0.1" dur="2.2s" repeatCount="indefinite"/></ellipse>
      <text x="${q.p[0].toFixed(0)}" y="${(q.p[1] - ry - 5).toFixed(0)}" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="900" text-anchor="middle">${i === 0 ? q.dist + 'y' : '2°'}</text>`;
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
    <circle r="5" fill="#fff"><animateMotion dur="${(hole.par * 1.1).toFixed(1)}s" repeatCount="indefinite" path="${route}"/><animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.05;0.5;0.85;1" dur="${(hole.par * 1.1).toFixed(1)}s" repeatCount="indefinite"/></circle>
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

/* ============ Simulador TIRO POR TIRO (vive en Parfect Tracker) ============ */
const SIM_LIE_ES = { tee: 'Tee', fw: 'Fairway', rough: 'Rough', bunker: 'Bunker', green: 'Green', holed: 'Embocada' };
const SIM_LIE_F = { tee: 1, fw: 1, rough: 0.82, bunker: 0.6, green: 1 };
function simClubFor(user, dist, lie, isTee, hole) {
  const bag = bagInfo(user);
  if (!bag.length) return null;
  if (isTee && hole.par !== 3 && dist > 235) return bag.slice().sort((a, b) => b.carry - a.carry)[0];
  return bag.slice().sort((a, b) => Math.abs(a.carry - dist) - Math.abs(b.carry - dist))[0];
}
function simInitHole(s) {
  const hole = COURSES[s.courseId].holes[s.holeIdx];
  s.dist = hole.yds; s.lie = 'tee'; s.strokes = 0; s.putts = 0;
  s.gir = false; s.fw = null; s.puttDist = null; s.log = [];
}
function simNewRound(user, course) {
  if (!trackerReadiness().ready) return null;
  const s = { courseId: course.id, holeIdx: 0, card: [], done: false };
  simInitHole(s);
  return s;
}
function simStepPutt(s) {
  const pe = (avgTrackerEff(['Putt 3 ft', 'Putt 5 ft', 'Putt 7 ft']) || 60) / 100;
  s.strokes++; s.putts++;
  const d = s.puttDist || 12;
  const make = Math.max(0.04, Math.min(0.98, pe * (d <= 4 ? 1.35 : d <= 8 ? 0.85 : d <= 15 ? 0.42 : 0.18)));
  if (Math.random() < make || s.putts >= 4) {
    s.log.push({ t: `Putt ${d} ft → ¡adentro!`, ok: true });
    s.lie = 'holed';
  } else {
    const left = Math.max(2, Math.round(d * (0.12 + Math.random() * 0.25)));
    s.puttDist = left;
    s.log.push({ t: `Putt ${d} ft → se queda corto, a ${left} ft`, ok: false });
  }
}
function simStep(s, user) {
  const hole = COURSES[s.courseId].holes[s.holeIdx];
  if (s.lie === 'green') return simStepPutt(s);
  const isTee = s.lie === 'tee';
  const club = simClubFor(user, s.dist, s.lie, isTee, hole);
  const eff = club ? club.eff : 60;
  const good = Math.random() < (eff / 100) * (SIM_LIE_F[s.lie] || 0.85);
  s.strokes++;
  const cname = club ? club.name : 'Palo';
  let carry = Math.round((club ? club.carry : 150) * (0.88 + Math.random() * 0.18));
  if (s.lie === 'rough') carry = Math.round(carry * 0.9);
  if (s.lie === 'bunker') carry = Math.round(carry * 0.82);

  if (carry >= s.dist - 8) {
    if (good) {
      const reg = s.strokes <= (hole.par - 2);
      s.gir = s.gir || reg;
      s.puttDist = reg ? (8 + Math.round(Math.random() * 26)) : (3 + Math.round(Math.random() * 10));
      s.lie = 'green';
      s.log.push({ t: `${cname} → Green${reg ? ' ✓ (GIR)' : ''}, a ${s.puttDist} ft`, ok: true });
    } else {
      const water = (hole.risks || []).some(r => r.kind === 'water');
      if (water && Math.random() < 0.22) {
        s.strokes++;
        s.lie = 'rough'; s.dist = Math.max(8, Math.round(s.dist * 0.3));
        s.log.push({ t: `${cname} → 💧 al agua (+1), dropas a ${s.dist}y`, ok: false });
      } else {
        const miss = ['corto', 'largo', 'a la izq.', 'a la der.'][Math.floor(Math.random() * 4)];
        s.lie = Math.random() < 0.4 ? 'bunker' : 'rough';
        s.dist = Math.max(5, Math.round(8 + Math.random() * 16));
        s.log.push({ t: `${cname} → falló ${miss} (${SIM_LIE_ES[s.lie].toLowerCase()}), a ${s.dist}y`, ok: false });
      }
    }
  } else {
    const adv = good ? carry : Math.round(carry * 0.78);
    s.dist = Math.max(0, s.dist - adv);
    if (isTee && hole.par >= 4) {
      s.fw = good;
      s.lie = good ? 'fw' : (Math.random() < 0.35 ? 'bunker' : 'rough');
      s.log.push({ t: `${cname} → ${good ? 'Fairway ✓' : 'fuera de calle'}, quedan ${s.dist}y`, ok: good });
    } else {
      s.lie = good ? 'fw' : (Math.random() < 0.3 ? 'bunker' : 'rough');
      s.log.push({ t: `${cname} → ${good ? 'buen tiro' : 'no salió bien'}, quedan ${s.dist}y`, ok: good });
    }
  }
}
function simFinishHole(s) {
  const hole = COURSES[s.courseId].holes[s.holeIdx];
  s.card.push({ n: hole.n, par: hole.par, score: s.strokes, putts: s.putts, gir: s.gir, fw: s.fw });
  s.holeIdx++;
  if (s.holeIdx >= COURSES[s.courseId].holes.length) s.done = true;
  else simInitHole(s);
}

function vSimulator() {
  const u = cur();
  const ready = trackerReadiness();
  const course = COURSES[V.courseId] || COURSES.campestre;
  const courseChips = COURSE_ORDER.map(id => `<button class="chip sm ${id === course.id ? 'on' : ''}" data-act="sel-course" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('');
  const head = `<div class="sec-h" style="margin-top:22px"><h2 style="font-size:16px">🎲 Simulador de ronda</h2><span class="small muted">tiro por tiro</span></div>`;

  if (!ready.ready) {
    return head + `<div class="card">
      <p class="note" style="margin-top:0;margin-bottom:10px">Juega una ronda virtual <b class="lime">tiro por tiro</b>: cada golpe cae según tu <b class="lime">efectividad real</b> del Tracker. Primero registra al menos un drill de cada área:</p>
      ${ready.areas.map(a => `<div class="row" style="padding:7px 0"><div class="r-main"><b>${a.v != null ? '✅' : '⬜️'} ${esc(a.label)}</b><span>${esc(a.hint)}</span></div><div class="r-side"><b class="${a.v != null ? 'lime' : 'muted'}">${a.v != null ? a.v + '%' : 'falta'}</b></div></div>`).join('')}
    </div>`;
  }

  const sim = V.sim && V.sim.courseId === course.id ? V.sim : null;

  if (!sim) {
    return head + `<div class="card">
      <div class="chips">${courseChips}</div>
      <p class="note">Simula una ronda completa en <b>${esc(course.name)}</b>. Tú tiras hoyo por hoyo; cada palo cae según tus % del Tracker (salida ${ready.have.fw}% · hierros ${ready.have.gir}% · approach ${ready.have.ud}% · putt ${ready.have.putt}%).</p>
      <button class="btn primary" data-act="sim-start">🏌️ Jugar ronda simulada</button>
    </div>`;
  }

  const totScore = sim.card.reduce((a, h) => a + h.score, 0);
  const totPar = sim.card.reduce((a, h) => a + h.par, 0);

  if (sim.done) {
    const fwT = sim.card.filter(h => h.fw !== null).length, fwH = sim.card.filter(h => h.fw === true).length;
    const girH = sim.card.filter(h => h.gir).length, putts = sim.card.reduce((a, h) => a + h.putts, 0);
    return head + `<div class="card">
      <div class="greet" style="text-align:center;padding-top:6px"><h1 style="font-size:44px">${totScore}</h1><p class="hcp">${fmtToPar(totScore - totPar)} · ${sim.card.length} hoyos</p></div>
      <div class="grid2">
        ${statCard((fwT ? Math.round(fwH / fwT * 100) : 0) + '%', 'Fairways', fwT ? fwH / fwT * 100 : 0)}
        ${statCard(Math.round(girH / sim.card.length * 100) + '%', 'GIR', girH / sim.card.length * 100)}
      </div>
      <p class="note" style="text-align:center">${putts} putts en la ronda</p>
      <div class="card" style="margin-top:12px"><span class="label">Tarjeta simulada</span>
        ${scorecardTable(sim.card.length, i => sim.card[i].par, [{ name: esc(u.name.split(' ')[0]), scoreOf: i => sim.card[i].score }], -1)}
      </div>
      <button class="btn primary" data-act="sim-start">Jugar otra vez</button>
      <button class="btn" data-act="sim-reset">Salir del simulador</button>
    </div>`;
  }

  const hole = course.holes[sim.holeIdx];
  const holed = sim.lie === 'holed';
  const toParNow = sim.card.length ? fmtToPar(totScore - totPar) : 'E';
  const logHtml = sim.log.map(l => `<div class="sim-shot ${l.ok ? 'ok' : 'bad'}">${esc(l.t)}</div>`).join('');
  const holeToPar = sim.strokes - hole.par;

  return head + `<div class="card">
    <div class="ph-head"><div class="r-main" style="flex:1"><b>Hoyo ${hole.n} · Par ${hole.par}</b><span class="muted">${hole.yds} yds · hoyo ${sim.holeIdx + 1}/${course.holes.length}</span></div>
      <div class="r-side"><b style="color:var(--lime)">${totScore || 0}</b><span>${toParNow}</span></div></div>
    <div class="sim-log">${logHtml || '<div class="sim-shot muted">Toca “Tirar” para tu golpe de salida.</div>'}</div>
    ${holed
      ? `<div class="sim-status">✅ Hoyo ${hole.n}: <b>${sim.strokes}</b> (${holeToPar === 0 ? 'par' : holeToPar > 0 ? '+' + holeToPar : holeToPar})</div>
         <button class="btn primary" data-act="sim-shot">${sim.holeIdx + 1 >= course.holes.length ? 'Ver tarjeta final →' : 'Siguiente hoyo →'}</button>`
      : `<div class="sim-status">${SIM_LIE_ES[sim.lie]} · quedan <b>${sim.lie === 'green' ? (sim.puttDist + ' ft') : (sim.dist + ' yds')}</b> · golpe ${sim.strokes + 1}</div>
         <button class="btn primary" data-act="sim-shot">🏌️ Tirar</button>`}
    <button class="btn sm ghost" data-act="sim-reset">Reiniciar</button>
  </div>`;
}

function vStrategy() {
  const u = cur();
  const course = COURSES[V.courseId] || COURSES.campestre;
  if (V.holeIdx >= course.holes.length) V.holeIdx = 0;
  const idx = V.holeIdx || 0, hole = course.holes[idx];
  const reachable = reachableIn2(u, hole);
  const attack = reachable && V.attack2;
  const cands = teeCandidates(u, hole);
  const defaultTee = hole.par === 3 ? cands.slice().sort((a, b) => Math.abs(a.carry - hole.yds) - Math.abs(b.carry - hole.yds))[0] : cands[0];
  const tee = cands.find(c => c.id === V.teeClubId) || defaultTee || null;
  const landings = computeLandings(hole, tee, attack);
  const carry = tee ? tee.carry : null, leave = carry ? Math.max(hole.yds - carry, 0) : null;
  const objs = courseObjectives(course, u.hcp);
  const target = objs[idx], stance = holeStance(hole, u.hcp, reachable);
  const roundTarget = objs.reduce((a, b) => a + b, 0);

  const courseChips = COURSE_ORDER.map(id => `<button class="chip sm ${id === course.id ? 'on' : ''}" data-act="sel-course" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('');
  const holeChips = course.holes.map((h, i) => `<button class="hole-chip ${i === idx ? 'on' : ''}" data-act="sel-hole" data-i="${i}">${h.n}</button>`).join('');
  const teeChips = cands.map(c => `<button class="hole-chip wide ${tee && c.id === tee.id ? 'on' : ''}" data-act="sel-tee" data-id="${c.id}">${esc(c.name.split(' ')[0])}<br><span>${c.carry}y</span></button>`).join('');
  const hazards = (hole.risks || []).map(r => `${r.kind === 'water' ? '💧 Agua' : '🟡 Bunker'} a la ${r.side === 'left' ? 'izquierda' : 'derecha'}${r.at === 'green' ? ' del green' : ' en la zona de caída'}`);
  const teeInfo = !tee ? 'Carga tu bolsa en Perfil → Mis palos.'
    : hole.par === 3 ? (carry >= hole.yds - 5 ? `Con tu ${tee.name} (${carry}y) llegas al green de ${hole.yds}y.` : `Tu ${tee.name} vuela ${carry}y — ~${hole.yds - carry}y corto.`)
      : attack ? `Atacando: salida ${carry}y y vas por el green (~${leave}y) en 2.` : `Salida a ${carry}y; te deja ~${leave}y al green.`;

  return `<div class="sec-h"><h2>Estrategia</h2><span class="small muted">tu plan según tu HCP</span></div>
    <div class="chips" style="margin-top:8px">${courseChips}</div>
    <div class="greet" style="padding-top:10px">
      <p class="hi">${esc(course.name)}${course.approx ? ' · yardas aprox.' : ''}</p>
      <h1 style="font-size:23px">Hoyo ${hole.n} · Par ${hole.par} · ${hole.yds} yds</h1>
      <p class="hcp">Objetivo de ronda (HCP ${fmtHcp(u.hcp)}): ~${roundTarget} golpes</p>
    </div>
    <div class="hole-strip">${holeChips}</div>
    <div class="card" style="padding:12px">${holeSchematic(hole, landings)}</div>

    <div class="card">
      <span class="label">Plan del hoyo</span>
      <div class="grid2" style="margin-top:8px">
        ${statCard(target === hole.par ? 'Par' : target === hole.par + 1 ? 'Bogey' : '+' + (target - hole.par), 'Tu objetivo', 100)}
        <div class="card"><div class="stat-num" style="font-size:20px">${esc(stance.k)}</div><div class="stat-cap">cómo jugarlo</div></div>
      </div>
      <p class="tip" style="margin-top:10px"><b style="color:var(--text)">¿Por qué?</b> ${esc(objectiveWhy(hole, target, u.hcp))}</p>
      <p class="tip">${esc(stance.t)}</p>
    </div>

    <div class="card">
      <span class="label">${hole.par === 3 ? 'Tu tiro al green' : 'Tu salida'} · elige palo</span>
      ${cands.length ? `<div class="hole-strip" style="margin-top:8px">${teeChips}</div>` : ''}
      <p class="tip">${esc(teeInfo)}</p>
      ${reachable ? `<div style="border-top:1px solid var(--line-soft);margin-top:10px;padding-top:12px">
        <button class="chip ${attack ? 'on' : ''}" data-act="toggle-attack">🎯 Atacar el green en 2 ${attack ? '✓' : ''}</button>
        <p class="tip" style="margin-top:8px">${esc(attackWhy(u, hole, attack))}</p>
      </div>` : ''}
    </div>

    <div class="card">
      <span class="label">Data del hoyo</span>
      ${hazards.length ? hazards.map(h => `<p class="tip">${esc(h)}</p>`).join('') : '<p class="tip">Sin obstáculos marcados.</p>'}
      ${(hole.tips || []).map(t => `<p class="tip">${esc(t)}</p>`).join('')}
    </div>
    <p class="note" style="margin-bottom:24px">${course.approx ? 'Pares reales; yardas por hoyo aproximadas.' : 'Par y yardas reales.'} Esquema genérico (no a escala). El <b class="lime">simulador de ronda</b> ahora vive en Tracker.</p>`;
}
