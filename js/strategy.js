/* ============ Estrategia por hoyo — multi-campo ============
   Esquema GENÉRICO (no a escala) con zonas de riesgo y la ruta del hoyo.
   Tiros por par: 3 en par 5, 2 en par 4, 1 en par 3.
   Interactivo: eliges el palo de salida y la zona de caída del 1er tiro se mueve
   a la distancia de ese palo (con tu dispersión, que sale del Tracker / Mis palos). */

const CAMP_HOLES = [
  { n: 1, par: 5, yds: 503, dog: 'straight', risks: [{ at: 'drive', side: 'right', kind: 'bunker' }], tips: ['Calle amplia; los bunkers de salida están a la derecha.', 'Si no llegas en dos, deja un wedge cómodo.'] },
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
    const risks = par === 3
      ? [{ at: 'green', side: n % 2 ? 'left' : 'right', kind: n % 4 === 0 ? 'water' : 'bunker' }]
      : [{ at: 'green', side: n % 2 ? 'right' : 'left', kind: 'bunker' }];
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

/* ---- bolsa + efectividad (efectividad sale del Tracker) ---- */
function trackerEff(clubName) {
  const ps = (typeof myPractices === 'function' ? myPractices() : []).filter(p => p.drill === clubName);
  if (!ps.length) return null;
  const last = ps.slice(-3);
  const att = last.reduce((a, p) => a + p.attempts, 0), hit = last.reduce((a, p) => a + p.hits, 0);
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

/* palos candidatos para el tiro de salida del hoyo */
function teeCandidates(user, hole) {
  const bag = bagInfo(user);
  if (!bag.length) return [];
  if (hole.par === 3) return bag.slice().sort((a, b) => Math.abs(a.carry - hole.yds) - Math.abs(b.carry - hole.yds)).slice(0, 6).sort((a, b) => b.carry - a.carry);
  return bag.filter(c => ['dr', 'w3', 'w5', 'w7', 'h4', 'h5', 'h6', 'i3', 'i4', 'i5'].includes(c.id)).sort((a, b) => b.carry - a.carry);
}

function computeLandings(hole, tee) {
  const carry = tee ? tee.carry : CLUB_DEFAULT.dr;
  const disp = dispersionYds(tee ? tee.eff : CLUB_EFF_DEFAULT);
  if (hole.par === 3) {
    return [{ f: Math.max(0.2, Math.min(carry / hole.yds, 0.98)), disp, dist: carry }];
  }
  const f1 = Math.max(0.2, Math.min(carry / hole.yds, hole.par === 5 ? 0.66 : 0.9));
  const ls = [{ f: f1, disp, dist: carry }];
  if (hole.par === 5) {
    const f2 = Math.max(f1 + 0.1, Math.min((hole.yds - 100) / hole.yds, 0.9));
    ls.push({ f: f2, disp: Math.max(14, disp - 6), dist: Math.round((f2 - f1) * hole.yds) });
  }
  return ls;
}

function bez(t, a, c, b) { const u = 1 - t; return u * u * a + 2 * u * t * c + t * t * b; }

function holeSchematic(hole, landings) {
  const W = 340, H = 458, par3 = hole.par === 3;
  const green = hole.dog === 'left' ? [120, 106] : hole.dog === 'right' ? [222, 106] : [170, 100];
  const ctrl = par3 ? [170, 270] : (hole.dog === 'left' ? [224, 262] : hole.dog === 'right' ? [118, 262] : [170, 262]);
  const tee = [170, 442], gx = green[0], gy = green[1];
  const fair = `M${tee[0]},${tee[1]} Q ${ctrl[0]},${ctrl[1]} ${gx},${gy}`;
  const pts = landings.map(l => ({ ...l, p: [bez(l.f, tee[0], ctrl[0], gx), bez(l.f, tee[1], ctrl[1], gy)] }));
  const route = `M${tee[0]},${tee[1]} ` + pts.map(q => `L${q.p[0].toFixed(0)},${q.p[1].toFixed(0)}`).join(' ') + ` L${gx},${gy}`;

  let risks = '', labels = '';
  (hole.risks || []).forEach(r => {
    let rx, ry;
    if (r.at === 'drive') { const lp = pts[0] ? pts[0].p : [gx, gy]; rx = lp[0] + (r.side === 'left' ? -42 : 42); ry = lp[1]; }
    else { rx = gx + (r.side === 'left' ? -48 : 48); ry = gy + 18; }
    const water = r.kind === 'water';
    risks += `<ellipse cx="${rx.toFixed(0)}" cy="${ry.toFixed(0)}" rx="${water ? 27 : 21}" ry="${water ? 17 : 12}" fill="${water ? '#2f7fa6' : '#ddcb8c'}"/>`;
    labels += `<rect x="${(rx - 25).toFixed(0)}" y="${(ry - (water ? 17 : 12) - 19).toFixed(0)}" width="50" height="16" rx="8" fill="${water ? '#16323f' : '#3a2a16'}" stroke="${water ? '#3f96bd' : '#e0a25a'}"/><text x="${rx.toFixed(0)}" y="${(ry - (water ? 17 : 12) - 7).toFixed(0)}" fill="${water ? '#7fc3df' : '#e0a25a'}" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="800" text-anchor="middle">${water ? 'Agua' : 'Bunker'}</text>`;
  });
  let lands = '';
  pts.forEach((q, i) => {
    const rx = Math.max(14, Math.min(34, q.disp * 0.7)), ry = rx * 0.7;
    lands += `<ellipse cx="${q.p[0].toFixed(0)}" cy="${q.p[1].toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="#c9f73e" opacity="0.16" stroke="#c9f73e" stroke-width="1.5" stroke-dasharray="4 4"><animate attributeName="opacity" values="0.1;0.24;0.1" dur="2.2s" repeatCount="indefinite"/></ellipse>
      <text x="${q.p[0].toFixed(0)}" y="${(q.p[1] - ry - 5).toFixed(0)}" fill="#c9f73e" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="900" text-anchor="middle">${i === 0 ? q.dist + 'y' : '2°'}</text>`;
  });

  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Esquema hoyo ${hole.n}">
    <rect x="0" y="0" width="${W}" height="${H}" rx="16" fill="#0a0f08" stroke="#1d2914"/>
    <path d="${fair}" fill="none" stroke="#2f6b39" stroke-width="${par3 ? 42 : 64}" stroke-linecap="round"/>
    <path d="${fair}" fill="none" stroke="#3a8043" stroke-width="${par3 ? 22 : 34}" stroke-linecap="round" opacity="0.5"/>
    <ellipse cx="${gx}" cy="${gy}" rx="38" ry="27" fill="#57b15c" stroke="#2f6b39" stroke-width="2"/>
    <circle cx="${gx + 5}" cy="${gy + 1}" r="3" fill="#0a0f08"/>
    <line x1="${gx + 5}" y1="${gy + 1}" x2="${gx + 5}" y2="${gy - 34}" stroke="#eef3e6" stroke-width="2"/>
    <path d="M${gx + 5},${gy - 34} L${gx + 19},${gy - 30} L${gx + 5},${gy - 26} Z" fill="#c9f73e"/>
    ${risks}${lands}
    <path d="${route}" fill="none" stroke="#c9f73e" stroke-width="2.5" stroke-dasharray="3 6"/>
    <circle r="5" fill="#fff"><animateMotion dur="${(hole.par * 1.1).toFixed(1)}s" repeatCount="indefinite" path="${route}"/><animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.05;0.5;0.85;1" dur="${(hole.par * 1.1).toFixed(1)}s" repeatCount="indefinite"/></circle>
    ${labels}
    <rect x="161" y="440" width="18" height="7" rx="2" fill="#9ab07f"/><text x="170" y="${H - 5}" fill="#9ab07f" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" text-anchor="middle">TEE</text>
  </svg>`;
}

function vStrategy() {
  const u = cur();
  const course = COURSES[V.courseId] || COURSES.campestre;
  if (V.holeIdx >= course.holes.length) V.holeIdx = 0;
  const hole = course.holes[V.holeIdx || 0];
  const cands = teeCandidates(u, hole);
  let tee = cands.find(c => c.id === V.teeClubId) || cands[0] || null;
  const landings = computeLandings(hole, tee);
  const carry = tee ? tee.carry : null;
  const leave = carry ? Math.max(hole.yds - carry, 0) : null;

  const courseChips = COURSE_ORDER.map(id => `<button class="chip sm ${id === course.id ? 'on' : ''}" data-act="sel-course" data-c="${id}">${esc(COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', ''))}</button>`).join('');
  const holeChips = course.holes.map((h, i) => `<button class="hole-chip ${i === (V.holeIdx || 0) ? 'on' : ''}" data-act="sel-hole" data-i="${i}">${h.n}</button>`).join('');
  const teeChips = cands.map(c => `<button class="hole-chip wide ${tee && c.id === tee.id ? 'on' : ''}" data-act="sel-tee" data-id="${c.id}">${esc(c.name.split(' ')[0])}<br><span>${c.carry}y</span></button>`).join('');
  const hazards = (hole.risks || []).map(r => `${r.kind === 'water' ? '💧 Agua' : '🟡 Bunker'} a la ${r.side === 'left' ? 'izquierda' : 'derecha'}${r.at === 'green' ? ' del green' : ' en la zona de caída'}`);
  const teeLabel = hole.par === 3 ? 'Tu tiro al green' : 'Tu salida';
  const teeInfo = !tee ? 'Carga tu bolsa en Perfil → Mis palos para mover las zonas.'
    : hole.par === 3
      ? (carry >= hole.yds - 5 ? `Con tu ${tee.name} (${carry}y) llegas al green de ${hole.yds}y.` : `Tu ${tee.name} vuela ${carry}y — te quedas ~${hole.yds - carry}y corto del green.`)
      : `Con tu ${tee.name} (${carry}y) la salida cae a ${carry}y y te deja ~${leave}y al green.`;

  return `<div class="sec-h"><h2>Estrategia</h2><span class="small muted">ajusta tu salida</span></div>
    <div class="chips" style="margin-top:8px">${courseChips}</div>
    <div class="greet" style="padding-top:10px">
      <p class="hi">${esc(course.name)}${course.approx ? ' · yardas aprox.' : ''}</p>
      <h1 style="font-size:23px">Hoyo ${hole.n} · Par ${hole.par} · ${hole.yds} yds</h1>
    </div>
    <div class="hole-strip">${holeChips}</div>
    <div class="card" style="padding:12px">${holeSchematic(hole, landings)}</div>
    <p class="small muted" style="margin-top:-4px">Esquema genérico (no a escala). La zona ① se mueve según el palo de salida que elijas.</p>

    <div class="card">
      <span class="label">${teeLabel} · elige palo</span>
      ${cands.length ? `<div class="hole-strip" style="margin-top:8px">${teeChips}</div>` : ''}
      <p class="tip">${esc(teeInfo)}</p>
    </div>

    <div class="card">
      <span class="label">Data del hoyo</span>
      <p class="tip">${hole.par === 3 ? '1 tiro al green' : hole.par === 4 ? '2 tiros: salida y approach' : '3 tiros: salida, avance y approach'}.</p>
      ${hazards.length ? hazards.map(h => `<p class="tip">${esc(h)}</p>`).join('') : '<p class="tip">Sin obstáculos marcados.</p>'}
      ${(hole.tips || []).map(t => `<p class="tip">${esc(t)}</p>`).join('')}
    </div>
    <p class="note" style="margin-bottom:24px">${course.approx ? 'Pares reales; yardas por hoyo aproximadas.' : 'Par y yardas reales.'} Tu dispersión sale del Tracker / Mis palos.</p>`;
}
