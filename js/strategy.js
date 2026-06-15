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
  if (hole.par === 5 && reachable && hcp <= 14) return { k: 'Agresivo', t: 'Puedes ir por el green en 2 si pegas sólido.' };
  if (water) return { k: 'Conservador', t: 'Apunta lejos del agua; el centro del green basta.' };
  if (driveB && hcp >= 16) return { k: 'Conservador', t: 'Coloca la salida; prioriza estar en calle.' };
  if (hole.par === 3 && hole.yds >= 195) return { k: 'Conservador', t: 'Par 3 largo: toma palo de más y al centro.' };
  return { k: 'Equilibrado', t: 'Juego estándar: calle y centro del green.' };
}

/* ---- simulador de ronda tiro por tiro (probabilidades por palo) ---- */
function playerProbs(user, agg) {
  const cl = v => Math.max(0, Math.min(1, v));
  const bag = bagInfo(user);
  const dr = bag.find(c => c.id === 'dr');
  const irons = bag.filter(c => ['i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'w3', 'h4', 'h5', 'h6'].includes(c.id));
  const avgIron = irons.length ? irons.reduce((a, c) => a + c.eff, 0) / irons.length : 70;
  const fw = cl(((dr ? dr.eff : 65) / 100) * 0.95);
  const gir = cl((avgIron / 100) * 0.72);
  const ud = cl((trackerEff('Up & down 30 yds') || trackerEff('Up & down 40 yds') || (agg ? agg.scrPct : 40)) / 100);
  const onePutt = cl(((trackerEff('Putt 5 ft') || trackerEff('Putt 3 ft') || 55) / 100) * 0.32);
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
  const p = playerProbs(user, Stats.aggregate(myRounds()));
  const holes = course.holes.map(h => simHole(h, p));
  const score = holes.reduce((a, h) => a + h.score, 0);
  const par = course.holes.reduce((a, h) => a + h.par, 0);
  const fwTot = holes.filter(h => h.fw !== null).length, fwHit = holes.filter(h => h.fw === true).length;
  return { courseId: course.id, holes, score, par, toPar: score - par, fwHit, fwTot, girHit: holes.filter(h => h.gir).length, girTot: holes.length, putts: holes.reduce((a, h) => a + h.putts, 0) };
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
  const sim = V.simResult && V.simResult.courseId === course.id ? V.simResult : null;

  return `<div class="sec-h"><h2>Estrategia</h2><span class="small muted">objetivo y track según tu HCP</span></div>
    <div class="chips" style="margin-top:8px">${courseChips}</div>
    <div class="greet" style="padding-top:10px">
      <p class="hi">${esc(course.name)}${course.approx ? ' · yardas aprox.' : ''}</p>
      <h1 style="font-size:23px">Hoyo ${hole.n} · Par ${hole.par} · ${hole.yds} yds</h1>
      <p class="hcp">Tu objetivo de ronda (HCP ${fmtHcp(u.hcp)}): ~${roundTarget} golpes</p>
    </div>
    <div class="hole-strip">${holeChips}</div>
    <div class="card" style="padding:12px">${holeSchematic(hole, landings)}</div>

    <div class="grid2">
      ${statCard(target === hole.par ? 'Par' : target === hole.par + 1 ? 'Bogey' : '+' + (target - hole.par), 'Tu objetivo aquí', 100)}
      <div class="card"><div class="stat-num" style="font-size:20px">${esc(stance.k)}</div><div class="stat-cap">cómo jugarlo</div></div>
    </div>
    <p class="tip" style="margin-top:8px">${esc(stance.t)}</p>

    <div class="card">
      <span class="label">${hole.par === 3 ? 'Tu tiro al green' : 'Tu salida'} · elige palo</span>
      ${cands.length ? `<div class="hole-strip" style="margin-top:8px">${teeChips}</div>` : ''}
      ${reachable ? `<button class="chip ${attack ? 'on' : ''}" data-act="toggle-attack" style="margin-top:10px">🎯 Atacar el green en 2 ${attack ? '✓' : ''}</button>` : ''}
      <p class="tip">${esc(teeInfo)}</p>
    </div>

    <div class="card">
      <span class="label">Data del hoyo</span>
      ${hazards.length ? hazards.map(h => `<p class="tip">${esc(h)}</p>`).join('') : '<p class="tip">Sin obstáculos marcados.</p>'}
      ${(hole.tips || []).map(t => `<p class="tip">${esc(t)}</p>`).join('')}
    </div>

    <div class="card">
      <span class="label">🎲 Simulador de ronda</span>
      <p class="note" style="margin-top:0;margin-bottom:8px">Juega ${course.holes.length} hoyos tiro por tiro con tus % de acierto por palo y genera tu tarjeta.</p>
      <button class="btn primary" data-act="sim-run">${sim ? 'Simular otra vez' : 'Simular mi ronda aquí'}</button>
      ${sim ? `
        <div class="greet" style="text-align:center;padding-top:12px"><h1 style="font-size:40px">${sim.score}</h1><p class="hcp">${fmtToPar(sim.toPar)} · ${sim.holes.length} hoyos</p></div>
        <div class="grid2">
          ${statCard((sim.fwTot ? Math.round(sim.fwHit / sim.fwTot * 100) : 0) + '%', 'Fairways', sim.fwTot ? sim.fwHit / sim.fwTot * 100 : 0)}
          ${statCard(Math.round(sim.girHit / sim.girTot * 100) + '%', 'GIR', sim.girHit / sim.girTot * 100)}
        </div>
        <div class="card" style="margin-top:12px"><span class="label">Tarjeta simulada</span>
          ${scorecardTable(course.holes.length, i => course.holes[i].par, [{ name: esc(u.name.split(' ')[0]), scoreOf: i => sim.holes[i].score }], -1)}
        </div>
        <p class="note">Simulación basada en tu efectividad por palo (Tracker / Mis palos). Cada simulación varía, como en el golf real.</p>
      ` : ''}
    </div>
    <p class="note" style="margin-bottom:24px">${course.approx ? 'Pares reales; yardas por hoyo aproximadas.' : 'Par y yardas reales.'} Esquema genérico (no a escala).</p>`;
}
