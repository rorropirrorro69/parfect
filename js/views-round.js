/* ============ Módulo Ronda: lista, setup, captura (4 toques), resumen, detalle ============ */

function relScore(diff) {
  if (diff <= -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Doble';
  return `+${diff}`;
}

function scCellClass(diff) {
  if (diff <= -2) return 'eagle';
  if (diff === -1) return 'birdie';
  if (diff === 1) return 'bogey';
  if (diff >= 2) return 'doble';
  return '';
}

function scorecard(holes, offset = 0) {
  return `<div class="sc-grid">` + holes.map((h, i) => {
    const d = h.score - h.par;
    return `<div class="sc-cell ${scCellClass(d)}"><div class="h">${offset + i + 1}</div><div class="s">${h.score}</div></div>`;
  }).join('') + `</div>`;
}

/* ---------- Tarjeta de golf en vivo (tabla, se llena hoyo a hoyo) ---------- */
/* marca de golf clásica: círculo=birdie, doble=águila, cuadro=bogey, doble=doble bogey */
function scoreMarker(score, par) {
  if (score == null) return '·';
  const d = score - par;
  const sh = d <= -2 ? 'mk-circ2 mk-under' : d === -1 ? 'mk-circ mk-under' : d === 1 ? 'mk-sq mk-over' : d >= 2 ? 'mk-sq2 mk-over' : '';
  return `<span class="sc-mark ${sh}">${score}</span>`;
}
function scTableCell(score, par, cur) {
  if (score == null) return `<td class="${cur ? 'sc-cur' : ''}">·</td>`;
  const cls = scCellClass(score - par);
  return `<td class="${cls} ${cur ? 'sc-cur' : ''}">${scoreMarker(score, par)}</td>`;
}

/**
 * holesCount, parOf(i)->par, rows = [{name, scoreOf(i)->score|null}], curIdx (resaltar)
 */
function scorecardTable(holesCount, parOf, rows, curIdx, ydsOf) {
  const seg = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
  const has18 = holesCount > 9;
  const sumR = (fn, arr) => { let s = 0, any = false; for (const i of arr) { const v = fn(i); if (v != null) { s += v; any = true; } } return any ? s : ''; };
  // un bloque = una fila de hasta 9 hoyos con su subtotal (no se alarga: 18 hoyos = dos pisos)
  const block = (arr, totLabel) => {
    const head = `<tr class="sc-hrow"><th class="sc-name">Hoyo</th>${arr.map(i => `<th class="${i === curIdx ? 'sc-cur' : ''}">${i + 1}</th>`).join('')}<th class="sc-tt">${totLabel}</th></tr>`;
    const parRow = `<tr class="sc-parrow"><td class="sc-name">Par</td>${arr.map(i => `<td>${parOf(i)}</td>`).join('')}<td class="sc-tt">${sumR(parOf, arr)}</td></tr>`;
    const playerRows = rows.map(r => `<tr><td class="sc-name">${esc(r.name)}</td>${arr.map(i => scTableCell(r.scoreOf(i), parOf(i), i === curIdx)).join('')}<td class="sc-tt">${sumR(r.scoreOf, arr)}</td></tr>`).join('');
    return `<div class="sc-wb"><table class="sc-table sc-w"><thead>${head}</thead><tbody>${parRow}${playerRows}</tbody></table></div>`;
  };
  if (holesCount <= 9) return `<div class="sc-stack">${block(seg(0, holesCount), 'TOT')}</div>`;
  // siempre en grupos de 9 (18 = 2 filas, 27 = 3 filas) — nunca amontonado
  const labels = ['OUT', 'IN', '3ª', '4ª'];
  let blocks = '';
  for (let i = 0, n = 0; i < holesCount; i += 9, n++) {
    blocks += block(seg(i, Math.min(i + 9, holesCount)), labels[n] || 'TOT');
  }
  return `<div class="sc-stack">${blocks}</div>`;
}

/* ---------- Tab Ronda: historial ---------- */
function vRondaTab() {
  const u = cur();
  const rounds = myRounds();
  const cont = S.active && S.active.userId === u.id;
  let html = `<div class="sec-h"><h2>Tus rondas</h2><span class="small muted">${rounds.length} registradas</span></div>`;
  let rows = '';
  if (cont) {
    rows += `<button class="pl-rr pl-rr-live" data-act="resume-round">
      <div class="pl-rr-id"><b>Ronda en curso · ${esc(S.active.course)}</b><span>Hoyo ${S.active.idx + 1} de ${S.active.holesCount} · continuar</span></div>
      <span class="pl-rr-score">→</span>
    </button>`;
  }
  if (!rounds.length && !cont) {
    html += `<div class="card empty"><div class="e-ico">${golfIcon('flag')}</div><h3>Sin rondas todavía</h3><p>Tu primera ronda toma menos de 10 minutos en capturarse — 4 toques por hoyo.</p></div>`;
    return html;
  }
  const myHcp = u.hcp;
  rows += rounds.map(r => vRoundStatCard(r, myHcp)).join('');
  return html + `<div class="rc-list">${rows}</div>`;
}

/* paletas de color que rotan por tarjeta (diferentes diseños) */
const RC_SKINS = [
  { g: 'linear-gradient(120deg,#3f9d54,#1f6b39)', t: 'dark' },
  { g: 'linear-gradient(120deg,#46b0e0,#1f6aa6)', t: 'dark' },
  { g: 'linear-gradient(120deg,#ff7e5f,#a8407a)', t: 'dark' },
  { g: 'linear-gradient(120deg,#2fd6a0,#0f8f74)', t: 'dark' },
  { g: 'linear-gradient(120deg,#f7d04a,#c98a1e)', t: 'light' },
  { g: 'linear-gradient(120deg,#3b2f8a,#10183f)', t: 'dark' },
  { g: 'linear-gradient(120deg,#3aa6a0,#1f5e63)', t: 'dark' },
  { g: 'linear-gradient(120deg,#ff9a8b,#ff6a88)', t: 'dark' },
];
/* logros conseguidos en esa ronda (chips) */
function roundBadges(r, s) {
  const holes = (r.holes || []).filter(Boolean);
  const birdies = holes.filter(x => x.score != null && x.score - x.par <= -1).length;
  const eagles = holes.filter(x => x.score != null && x.score - x.par <= -2).length;
  const per18 = s.holes ? s.score / s.holes * 18 : s.score;
  const b = [];
  if (eagles > 0) b.push('Águila');
  if (s.toPar < 0) b.push('Bajo par'); else if (s.toPar === 0) b.push('En par');
  if (per18 < 80) b.push('Rompiste 80'); else if (per18 < 90) b.push('Rompiste 90'); else if (per18 < 100) b.push('Rompiste 100');
  if (birdies >= 2) b.push(`${birdies} birdies`);
  if (s.penals === 0 && s.holes >= 9) b.push('Sin penales');
  return b.slice(0, 3);
}

/* tira del campo jugado: una celda por hoyo (9 o 18) coloreada por score */
function vHoleStrip(r) {
  const cells = (r.holes || []).map((h, i) => {
    if (!h) return '';
    const d = h.score != null ? h.score - h.par : null;
    const cls = d == null ? 'na' : d <= -1 ? 'u' : d === 0 ? 'p' : d === 1 ? 'o' : 'b';
    return `<span class="rs-h rs-${cls}"><i>${i + 1}</i></span>`;
  }).join('');
  return `<div class="rs-holes"><div class="rs-holes-bar">${cells}</div></div>`;
}

/* mini tarjeta tipo torneo: cada hoyo con su marca círculo/cuadro (monocromo) */
function vTourneyMini(r) {
  const seg = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
  const n = r.holes.length, has18 = n > 9;
  const front = seg(0, Math.min(9, n)), back = has18 ? seg(9, n) : [];
  const row = arr => `<div class="tm-row">${arr.map(i => { const h = r.holes[i]; return `<div class="tm-c"><span class="tm-n">${i + 1}</span><span class="tm-m">${h ? scoreMarker(h.score, h.par) : '·'}</span></div>`; }).join('')}</div>`;
  return `<div class="tm">${row(front)}${has18 ? row(back) : ''}</div>`;
}

/* anillo de progreso para una stat de la tarjeta de ronda */
function rcRing(label, pct, color) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const R = 21, C = 2 * Math.PI * R, off = (C * (1 - p / 100)).toFixed(1);
  return `<div class="rc4-ring">
    <div class="rc4-rwrap">
      <svg viewBox="0 0 52 52"><circle class="rc4-rt" cx="26" cy="26" r="${R}"/><circle class="rc4-rp" cx="26" cy="26" r="${R}" stroke="${color}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off}"/></svg>
      <span class="rc4-rv">${p}<i>%</i></span>
    </div>
    <span class="rc4-rl">${label}</span>
  </div>`;
}
/* mini-hoyo con el recorrido animado de la bola (tee → green) tipo gif */
function holeTrackCard(r, i) {
  const h = r.holes[i]; if (!h) return '';
  const off = r.holeOffset || 0;
  const ch = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].holes : null;
  const src = ch ? ch[(off + i) % ch.length] : null;
  const par = (h.par != null) ? h.par : (src ? src.par : 4);
  const yds = src && src.yds ? src.yds : null;
  const score = h.score;
  const holeNo = off + i + 1;
  const rel = (score != null) ? score - par : null;
  const cls = rel == null ? 'na' : rel <= -1 ? 'u' : rel === 0 ? 'p' : rel === 1 ? 'o' : 'b';
  const n = Math.max(1, Math.min(9, score || par));        // nº de tiros = recorrido de la bola
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const ty = +(110 - (110 - 22) * (k / n)).toFixed(1);
    let tx = 32;
    if (k > 0 && k < n) { const sd = (holeNo * 9 + k * 17) % 100; tx = 21 + (sd % 22); }
    pts.push([+tx.toFixed(1), ty]);
  }
  const d = 'M' + pts.map(p => p.join(' ')).join(' L');
  const dots = pts.slice(1, -1).map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="1.7" fill="#fff" opacity=".92"/>`).join('');
  return `<div class="ht-card">
    <svg class="ht-svg" viewBox="0 0 64 122" aria-hidden="true">
      <rect x="0" y="0" width="64" height="122" rx="12" fill="#4f9a3f"/>
      <path d="M30,118 Q15,82 26,52 Q34,30 32,18" fill="none" stroke="#8fd05f" stroke-width="20" stroke-linecap="round"/>
      <ellipse cx="14" cy="92" rx="8" ry="11" fill="#3f8a36" opacity=".7"/><ellipse cx="52" cy="64" rx="7" ry="10" fill="#3f8a36" opacity=".7"/>
      <ellipse cx="48" cy="98" rx="7" ry="4" fill="#ecd99f"/>
      <rect x="27" y="111" width="10" height="5" rx="2" fill="#d8c486"/>
      <ellipse cx="32" cy="20" rx="15" ry="9" fill="#73c24a"/>
      <g class="ht-flag"><rect x="31.2" y="2" width="1.6" height="18" fill="#e9eef0"/><path d="M32.8 2 L42 5 L32.8 8 Z" fill="#ff5a4d"/></g>
      <circle cx="32" cy="20" r="2" fill="#1f3b14"/>
      <path class="ht-trace" pathLength="100" d="${d}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      <circle class="ht-ball" r="3" fill="url(#g3dBall)" stroke="#cdd5d7" stroke-width=".5" style="offset-path:path('${d}')"/>
    </svg>
    <div class="ht-meta"><b>H${holeNo}</b><span class="ht-pd">Par ${par}${yds ? ` · ${yds}y` : ''}</span><span class="ht-sc ht-${cls}">${score != null ? score : '–'}</span></div>
  </div>`;
}

/* Tarjeta de ronda: encabezado + 3 hoyos con su recorrido (las stats salen al entrar) */
function vRoundStatCard(r, hcp) {
  const s = Stats.roundStats(r);
  const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
  const vibe = roundVibe(s, hcp);
  const holes = (r.holes || []).filter(Boolean);
  const birdies = holes.filter(x => x.score != null && x.score - x.par <= -1).length;
  const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
  const scoreCls = s.toPar <= 0 ? 'good' : s.toPar <= Math.round(s.holes * 0.33) ? 'par' : 'over';
  const off = r.holeOffset || 0;
  const ch = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].holes : null;
  const parOf = i => (r.holes[i] && r.holes[i].par != null) ? r.holes[i].par : (ch && ch[off + i] ? ch[off + i].par : 4);
  const ydsOf = (ch && ch.some(h => h.yds)) ? (i => (ch[off + i] ? ch[off + i].yds : null)) : null;
  const rows = [{ name: 'Tú', scoreOf: i => (r.holes[i] ? r.holes[i].score : null) }];
  const nh = r.holes.length;
  const idxs = [...new Set([0, Math.floor((nh - 1) / 2), nh - 1])];
  return `<button class="rc6" data-act="round-detail" data-id="${r.id}">
    <div class="rc6-head">
      <div class="rc6-id"><b>${esc(course)}${r.partyId ? ` <span class="rc5-party">${golfIcon('flag')}</span>` : ''}</b><span class="rc5-date">${fmtDate(r.date)} · ${s.holes} hoyos · Par ${s.par}</span></div>
      <div class="rc5-score ${scoreCls}">${vibe ? `<i>${vibe.ic}</i>` : ''}<b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
    </div>
    <div class="ht-row">${idxs.map(i => holeTrackCard(r, i)).join('')}</div>
  </button>`;
}

/* ---------- Setup de ronda ---------- */
/* arte del campo seleccionado: sus hoyos con par (par3 azul · par4 lima · par5 oro) */
function courseHolesArt(cid) {
  const c = COURSES[cid]; if (!c) return '';
  const parCls = p => p === 3 ? 'p3' : p === 5 ? 'p5' : 'p4';
  const cells = c.holes.map((h, i) => `<span class="csa-h csa-${parCls(h.par)}"><b>${i + 1}</b><i>${h.par}</i></span>`).join('');
  return `<div class="csa csa-n${c.holes.length}"><div class="csa-grid">${cells}</div></div>`;
}

/* logos reales de los campos (recreados en SVG) */
function courseCrest(cid) {
  const c = COURSES[cid]; if (!c) return '';
  if (cid === 'campestre') {
    let dimples = '';
    for (let row = 0; row < 6; row++) for (let col = 0; col < 7; col++) {
      const x = 36 + col * 7.5, y = 52 + row * 7;
      if (Math.hypot(x - 58, y - 62) < 26 && y > 52) dimples += `<path d="M${x - 2.2} ${y} q2.2 2.4 4.4 0" fill="none" stroke="#cdb24e" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    return `<div class="clogo"><svg viewBox="0 0 124 166" class="clogo-svg" aria-hidden="true">
      <path d="M94 34 A42 42 0 1 0 94 90" fill="none" stroke="#5e8c3f" stroke-width="15" stroke-linecap="round"/>
      <circle cx="58" cy="62" r="30" fill="#ffffff" stroke="#e6dcb4" stroke-width="1"/>
      ${dimples}
      <text x="62" y="132" text-anchor="middle" class="clogo-t1" fill="#5e8c3f">Club Campestre</text>
      <text x="62" y="152" text-anchor="middle" class="clogo-t2" fill="#5e8c3f">Morelia</text>
    </svg></div>`;
  }
  if (cid === 'tresmarias') {
    const tree = (x, h, w) => `<path d="M${x} ${96 - h} q${w} 4 ${w} ${h * 0.45} q0 ${h * 0.55} -${w} ${h * 0.55} q-${w} 0 -${w} -${h * 0.55} q0 -${h * 0.45} ${w} -${h * 0.45} Z" fill="none" stroke="#cdb87a" stroke-width="2.4"/>`;
    return `<div class="clogo"><svg viewBox="0 0 130 130" class="clogo-svg" aria-hidden="true">
      <rect x="6" y="6" width="118" height="118" rx="4" fill="#1f7a3f"/>
      <rect x="6" y="6" width="118" height="118" rx="4" fill="none" stroke="#cdb87a" stroke-width="4"/>
      <path d="M30 96 Q65 86 100 96" fill="none" stroke="#cdb87a" stroke-width="2.4"/>
      ${tree(55, 54, 9)}${tree(70, 60, 10)}${tree(83, 40, 7)}
      <text x="65" y="116" text-anchor="middle" class="clogo-tm" fill="#cdb87a">TRES MARÍAS</text>
    </svg></div>`;
  }
  if (cid === 'altozano') {
    return `<div class="clogo"><svg viewBox="0 0 130 120" class="clogo-svg" aria-hidden="true">
      <path d="M4 78 Q65 56 126 78" fill="none" stroke="#5a9c3f" stroke-width="3"/>
      <ellipse cx="78" cy="46" rx="26" ry="24" fill="#8cc24a"/>
      <ellipse cx="48" cy="42" rx="30" ry="28" fill="#3a7d3a"/>
      <rect x="46" y="58" width="4" height="22" fill="#3a7d3a"/>
      <rect x="76" y="62" width="3.5" height="18" fill="#5a9c3f"/>
      <text x="65" y="100" text-anchor="middle" class="clogo-alt1" fill="#c0651f">Golf</text>
      <text x="65" y="116" text-anchor="middle" class="clogo-alt2" fill="#c0651f">ALTOZANO</text>
    </svg></div>`;
  }
  return `<div class="clogo"><svg viewBox="0 0 120 120" class="clogo-svg"><circle cx="60" cy="55" r="40" fill="none" stroke="#5e8c3f" stroke-width="4"/><text x="60" y="64" text-anchor="middle" class="clogo-t1" fill="#5e8c3f">${esc((c.name[0] || 'G'))}</text></svg></div>`;
}

function vSetup() {
  const cid = V.setupCourseId || 'campestre';
  const tid = V.setupTee || 'blancas';
  const tee = teeById(tid);
  const sname = id => COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
  const totalYds = Math.round(COURSES[cid].holes.reduce((a, h) => a + h.yds, 0) * tee.f);
  const teeCol = { negras: '#23262e', azules: '#3a8fe0', blancas: '#eef2f6', rojas: '#e8483a', amarillas: '#f2c33a' };
  const courseCards = COURSE_ORDER.map(id => {
    const c = COURSES[id];
    const on = cid === id;
    const par = c.holes.reduce((a, h) => a + h.par, 0);
    return `<button class="su-course ${on ? 'on' : ''}" data-act="setup-pick-course" data-c="${id}">
      <span class="su-c-info"><b>${esc(sname(id))}</b><span>${c.holes.length} hoyos · Par ${par} · ${c.approx ? 'aprox' : 'real'}</span></span>
      <span class="su-c-check">${on ? '✓' : ''}</span>
    </button>`;
  }).join('');
  const curPar = COURSES[cid].holes.reduce((a, h) => a + h.par, 0);
  const teeSheet = V.teeSheet ? `<div class="overlay" data-act="tee-cancel"><div class="sheet" data-act="noop">
      <div class="grab"></div>
      <h2>¿De dónde sales?</h2>
      <p class="auth-sub">Elige tu salida en ${esc(sname(cid))}.</p>
      <div class="tee-opts">${TEES.map(t => `<button class="tee-opt ${tid === t.id ? 'on' : ''}" data-act="confirm-tee" data-t="${t.id}">
        <span class="su-tee-dot" style="background:${teeCol[t.id] || '#ccc'}"></span>
        <span class="tee-opt-info"><b>${esc(t.name)}</b><span>${esc(t.sub)} · ${Math.round(COURSES[cid].holes.reduce((a, h) => a + h.yds, 0) * t.f)} yds</span></span>
        <span class="tee-opt-go">→</span>
      </button>`).join('')}</div>
    </div></div>` : '';
  const holesNineBlock = (() => {
    const ro = roundOptions(cid);
    const has18 = ro.opts18.length > 0;          // el campo tiene más de 9 hoyos
    const total = COURSES[cid].holes.length;
    const holes = has18 ? (V.setupHoles || 18) : 9;
    const start = (V.setupStart != null && V.setupStart < total) ? V.setupStart : 0;
    const par = roundPar(cid, start, holes);
    const holesToggle = has18 ? `<div class="su-block">
      <span class="su-lab">Hoyos</span>
      <div class="chips">
        <button class="chip ${holes === 9 ? 'on' : ''}" data-act="setup-holes" data-h="9">9 hoyos</button>
        <button class="chip ${holes === 18 ? 'on' : ''}" data-act="setup-holes" data-h="18">18 hoyos</button>
      </div>
    </div>` : '';
    const startSel = total > 9 ? `<div class="su-block">
      <span class="su-lab">¿En qué hoyo inicias?</span>
      <div class="chips chips-scroll">${Array.from({ length: total }, (_, i) => `<button class="chip ${i === start ? 'on' : ''}" data-act="setup-nine" data-s="${i}">${i + 1}</button>`).join('')}</div>
    </div>` : '';
    return `${holesToggle}${startSel}<p class="su-meta">Jugarás <b class="lime">${holes} hoyos</b> desde el <b class="lime">hoyo ${start + 1}</b> · Par ${par}.</p>`;
  })();
  const whenToggle = `<div class="su-block">
      <span class="su-lab">¿Cuándo juegas?</span>
      <div class="chips">
        <button class="chip on" data-act="setup-when" data-w="ahora">Ahora</button>
        <button class="chip" data-act="party-new">Programar tee time</button>
      </div>
    </div>`;
  const body = `<div class="su-block"><span class="su-lab">Campo</span><div class="su-courses">${courseCards}</div></div>
      ${holesNineBlock}
      <button class="btn primary big su-go" data-act="start-round">${golfIcon('flag')} Comenzar ronda</button>`;
  return `<div class="su-hero2 su-hero-course">
      <div class="su-hero2-txt">
        <span class="su-hero-tag">${golfIcon('flag')} Nueva ronda</span>
        <h1 class="su-hero-h">${esc(sname(cid))}</h1>
        <p class="su-hero-sub">${COURSES[cid].holes.length} hoyos · Par ${curPar} · ${COURSES[cid].approx ? 'aprox' : 'real'}</p>
      </div>
      <div class="su-hero2-art">${courseCrest(cid)}</div>
    </div>
    ${whenToggle}
    ${body}
    <button class="btn su-cancel" data-act="nav" data-view="ronda">Cancelar</button>
    ${typeof vEventComposer === 'function' && V.eventDraft ? vEventComposer(cur()) : ''}
    ${teeSheet}`;
}

/* ---------- Captura de hoyo ---------- */
function chipRow(items, key, current) {
  return `<div class="chips">` + items.map(([v, label]) =>
    `<button class="chip ${String(current) === String(v) ? 'on' : ''}" data-act="h-set" data-k="${key}" data-v="${v}">${label}</button>`
  ).join('') + `</div>`;
}

/* árbol 3D reutilizable (copa + tronco + sombra) */
function capTree(x, y, s) {
  return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><ellipse cx="0" cy="4" rx="10" ry="3.2" fill="#16401c" opacity="0.3"/><rect x="-2.2" y="-5" width="4.4" height="11" rx="1.6" fill="#6b4a2a"/><circle cx="0" cy="-13" r="11.5" fill="#39863a"/><circle cx="-7" cy="-8" r="8.5" fill="#479a44"/><circle cx="7" cy="-9" r="8.5" fill="#479a44"/><circle cx="-3" cy="-17" r="7.5" fill="#57ad50"/><circle cx="4" cy="-15" r="6.5" fill="#57ad50"/></g>`;
}
/* posición de bunkers relativa al centro del green (x,y como fracción de gw,gh) */
const CAP_BPOS = { fl: [-0.78, 0.9], fr: [0.78, 0.9], f: [0, 1.12], l: [-1.08, 0.05], r: [1.08, 0.05], bl: [-0.78, -0.82], br: [0.78, -0.82], b: [0, -1.0] };

/* tiros de campo (sin putts): salida (dirección h.tee + resultado h.teeLie) + approach */
function captureShots(h) {
  const shots = [];
  const par = h.par;
  if (par >= 4 && (h.teeLie || h.tee)) {
    const dir = h.tee === 'izq' ? -1 : h.tee === 'der' ? 1 : 0;
    const lie = h.teeLie || (h.tee === 'fw' ? 'calle' : h.tee === 'penal' ? 'ob' : (h.tee === 'izq' || h.tee === 'der') ? 'rough' : 'calle');
    let side, lk, prog = par === 5 ? 0.34 : 0.52;
    if (lie === 'calle') { side = dir * 0.16; lk = 'fw'; }
    else if (lie === 'ob') { side = (dir || 1) * 0.95; lk = 'water'; prog *= 0.82; }
    else if (lie === 'bunker') { side = (dir || (par % 2 ? 1 : -1)) * 0.92; lk = 'sand'; }
    else { side = (dir || (par % 2 ? 1 : -1)) * 0.74; lk = 'rough'; }
    shots.push({ role: 'tee', prog, side, ok: lie === 'calle', lie: lk });
  }
  if (h.app) {
    if (par === 5 && (h.teeLie || h.tee)) shots.push({ role: 'advance', prog: 0.72, side: 0, ok: true, lie: 'fw' });
    if (h.app === 'gir') shots.push({ role: 'approach', prog: 1, side: 0, ok: true, lie: 'green' });
    else {
      const side = h.app === 'izq' ? -0.55 : h.app === 'der' ? 0.55 : 0;
      const prog = h.app === 'largo' ? 1.12 : h.app === 'corto' ? 0.82 : 1;
      shots.push({ role: 'approach', prog, side, ok: false, lie: 'rough' });
      if (h.upDown != null) shots.push({ role: 'chip', prog: 0.99, side: 0.08, ok: h.upDown === true, lie: 'green', ud: true });
    }
  }
  return shots;
}
/* color de los puntos de tiro: rojo penal/agua, arena bunker, lima el resto */
function shotColor(s) {
  if (s && s.lie === 'water') return '#ff7a6b';
  if (s && s.lie === 'sand') return '#e3c887';
  return '#C7EE54';
}
/* 2º tiro — toma de frente al green: estás en tu lie y le pegas al green (imagen distinta a la salida) */
function approachView(h, chole, G, pf, px) {
  const W = 300, H = 296;
  const parV = chole ? chole.par : h.par;
  const gx = 150, gy = 122;
  let gw = 72, gh = 34;
  if (G) { if (G.sh === 'wide') { gw = 86; gh = 30; } else if (G.sh === 'tall') { gw = 60; gh = 42; } const s = Math.max(0.9, Math.min(1.14, G.d / 33)); gw *= s; gh *= s; }
  gw = Math.min(96, gw); gh = Math.min(46, gh);
  const pin = { x: gx + px * gw * 0.46, y: gy + (0.5 - pf) * gh * 0.85 };
  // bunkers alrededor del green
  const bunkers = (G ? G.bk : []).map(code => { const o = CAP_BPOS[code]; if (!o) return ''; const bx = (gx + o[0] * gw * 1.06).toFixed(0), by = gy + o[1] * gh * 1.06; return `<ellipse cx="${bx}" cy="${(by + 3).toFixed(0)}" rx="${(gw * 0.32).toFixed(0)}" ry="${(gh * 0.4).toFixed(0)}" fill="#16401c" opacity="0.22"/><ellipse cx="${bx}" cy="${by.toFixed(0)}" rx="${(gw * 0.28).toFixed(0)}" ry="${(gh * 0.32).toFixed(0)}" fill="url(#g3dSand)"/>`; }).join('');
  // árboles al fondo (horizonte)
  let trees = ''; [[36, 88, 0.7], [90, 82, 0.55], [212, 82, 0.55], [266, 88, 0.7]].forEach(a => { trees += capTree(a[0], a[1], a[2]); });
  // lie desde donde tiras el approach
  const fromLie = parV === 3 ? 'tee' : parV === 5 ? 'calle' : (h.teeLie || (h.tee === 'fw' ? 'calle' : h.tee ? 'rough' : 'calle'));
  const lieCol = fromLie === 'bunker' ? '#e6d6a3' : fromLie === 'rough' ? '#4e8a3a' : '#6cbd4c';
  const start = { x: 150, y: 250 };
  let land, ok = false;
  if (h.app === 'gir') { land = { x: pin.x, y: pin.y }; ok = true; }
  else if (h.app === 'corto') land = { x: gx - 6, y: gy + gh + 16 };
  else if (h.app === 'largo') land = { x: gx + 4, y: Math.max(40, gy - gh - 14) };
  else if (h.app === 'izq') land = { x: Math.max(24, gx - gw - 12), y: gy + 4 };
  else if (h.app === 'der') land = { x: Math.min(276, gx + gw + 12), y: gy + 4 };
  else { land = { x: pin.x, y: pin.y }; ok = true; }
  const chip = (h.app !== 'gir' && h.upDown != null);
  const arc = (a, b, peak) => `Q${((a.x + b.x) / 2).toFixed(1)},${((a.y + b.y) / 2 - peak).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  let ballPath = `M${start.x},${start.y} ${arc(start, land, 120)}`;
  let shadowPath = `M${start.x},${start.y} L${land.x.toFixed(1)},${land.y.toFixed(1)}`;
  const nodes = [start, land];
  if (chip) { ballPath += ` ${arc(land, pin, 30)}`; shadowPath += ` L${pin.x.toFixed(1)},${pin.y.toFixed(1)}`; nodes.push(pin); }
  const seg = []; let tot = 0;
  for (let i = 1; i < nodes.length; i++) { const l = Math.hypot(nodes[i].x - nodes[i - 1].x, nodes[i].y - nodes[i - 1].y) || 1; seg.push(l); tot += l; }
  const nf = [0]; { let a = 0; for (const l of seg) { a += l; nf.push(a / tot); } }
  const ev = [{ p: 0, d: 0 }]; for (let i = 1; i < nf.length; i++) { ev.push({ p: nf[i], d: 1 }); if (i < nf.length - 1) ev.push({ p: nf[i], d: 0.5 }); } ev.push({ p: 1, d: 0.8 });
  const TT = ev.reduce((a, e) => a + e.d, 0); let ac = 0; const kp = [], kt = []; ev.forEach(e => { ac += e.d; kp.push(e.p.toFixed(3)); kt.push((ac / TT).toFixed(3)); });
  const dur = (1.4 + nodes.length * 0.8).toFixed(1);
  const flagH = 30;
  // fairway que lleva de tu lie hasta el green (gir fairway)
  const fwTop = (gy + gh * 0.55);
  const fairway = `<polygon points="92,266 208,266 ${(gx + gw * 0.52).toFixed(0)},${fwTop.toFixed(0)} ${(gx - gw * 0.52).toFixed(0)},${fwTop.toFixed(0)}" fill="#5fa83f"/>
    <polygon points="118,266 182,266 ${(gx + gw * 0.3).toFixed(0)},${fwTop.toFixed(0)} ${(gx - gw * 0.3).toFixed(0)},${fwTop.toFixed(0)}" fill="#86c860" opacity="0.8"/>`;
  const field = `<rect width="${W}" height="${H}" fill="url(#g3dGrass)"/>
    <rect width="${W}" height="100" fill="url(#capSky)"/>
    ${trees}
    ${fairway}
    ${bunkers}
    <ellipse cx="${gx}" cy="${(gy + gh + 9).toFixed(0)}" rx="${(gw + 6).toFixed(0)}" ry="${(gh * 0.55).toFixed(0)}" fill="#16401c" opacity="0.26"/>
    <ellipse cx="${gx}" cy="${(gy + 11).toFixed(0)}" rx="${gw.toFixed(0)}" ry="${gh.toFixed(0)}" fill="#3a8043"/>
    <ellipse cx="${gx}" cy="${gy.toFixed(0)}" rx="${gw.toFixed(0)}" ry="${gh.toFixed(0)}" fill="#54ad58" stroke="#2f7a38" stroke-width="2"/>
    <ellipse cx="${(gx - gw * 0.26).toFixed(0)}" cy="${(gy - gh * 0.3).toFixed(0)}" rx="${(gw * 0.44).toFixed(0)}" ry="${(gh * 0.34).toFixed(0)}" fill="#79c970" opacity="0.5"/>
    <circle cx="${pin.x.toFixed(0)}" cy="${pin.y.toFixed(0)}" r="4" fill="#08260f"/>
    <line x1="${pin.x.toFixed(0)}" y1="${pin.y.toFixed(0)}" x2="${pin.x.toFixed(0)}" y2="${(pin.y - flagH).toFixed(0)}" stroke="#ffffff" stroke-width="2.2"/><path d="M${pin.x.toFixed(0)},${(pin.y - flagH).toFixed(0)} l14,4 -14,4z" fill="#C7EE54"/>
    <ellipse cx="150" cy="262" rx="92" ry="26" fill="${lieCol}"/>
    <ellipse cx="150" cy="256" rx="56" ry="13" fill="#ffffff" opacity="0.08"/>`;
  const landDot = `<ellipse cx="${land.x.toFixed(0)}" cy="${(land.y + 2).toFixed(0)}" rx="4.4" ry="1.7" fill="#000" opacity="0.2"/><circle cx="${land.x.toFixed(0)}" cy="${land.y.toFixed(0)}" r="4" fill="${ok ? '#C7EE54' : '#e3c887'}" stroke="#16301a" stroke-width="0.8"/>`;
  const ball = `<circle r="6.2" fill="url(#g3dBall)" stroke="#16301a" stroke-width="0.9" style="filter:drop-shadow(0 3px 2px rgba(0,0,0,.4))"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${ballPath}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></circle>`;
  const shadow = `<ellipse rx="5" ry="1.8" fill="#000" opacity="0.2"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${shadowPath}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></ellipse>`;
  return `<div class="cap"><svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tu tiro al green">
    <g clip-path="url(#capClip)">${field}
    <path d="${shadowPath}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="3 5" stroke-linecap="round" opacity="0.85"/>
    ${landDot}${shadow}${ball}</g>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="rgba(20,50,15,0.18)"/>
  </svg></div>`;
}

/* vista de SOLO el green (putting): la bola se coloca según su distancia al pin */
function greenCloseup(h, G, pf, px) {
  const W = 300, H = 296, cx = 150, cy = 164;
  let rx = 112, ry = 80;
  if (G) { if (G.sh === 'wide') { rx = 128; ry = 68; } else if (G.sh === 'tall') { rx = 94; ry = 96; } }
  const pin = { x: cx + px * rx * 0.42, y: cy + (0.5 - pf) * ry * 0.78 };
  const distFrac = { '0-3': 0.18, '3-8': 0.36, '8-20': 0.6, '20+': 0.86 };
  const fr = distFrac[h.dist] != null ? distFrac[h.dist] : 0.45;
  const ball = { x: pin.x - fr * rx * 0.22, y: Math.min(cy + ry * 0.84, pin.y + fr * ry * 0.95) };
  const nPutts = h.putts != null ? Math.max(1, h.putts) : 1;
  const stops = [];
  for (let i = 1; i <= nPutts; i++) { const f = i === nPutts ? 1 : (i === 1 ? 0.8 : 0.8 + 0.16 * (i - 1)); stops.push({ x: ball.x + (pin.x - ball.x) * f, y: ball.y + (pin.y - ball.y) * f }); }
  const pp = [ball, ...stops];
  const seg = []; let tot = 0;
  for (let i = 1; i < pp.length; i++) { const l = Math.hypot(pp[i].x - pp[i - 1].x, pp[i].y - pp[i - 1].y) || 1; seg.push(l); tot += l; }
  const nf = [0]; { let a = 0; for (const l of seg) { a += l; nf.push(a / tot); } }
  const ev = [{ p: 0, d: 0 }]; for (let i = 1; i < nf.length; i++) { ev.push({ p: nf[i], d: 1 }); if (i < nf.length - 1) ev.push({ p: nf[i], d: 0.55 }); } ev.push({ p: 1, d: 0.8 });
  const TT = ev.reduce((a, e) => a + e.d, 0); let ac = 0; const kp = [], kt = []; ev.forEach(e => { ac += e.d; kp.push(e.p.toFixed(3)); kt.push((ac / TT).toFixed(3)); });
  const dur = (1.0 + nPutts * 1.1).toFixed(1);
  const puttPath = `M${ball.x.toFixed(1)},${ball.y.toFixed(1)} ` + stops.map(s => `L${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(' ');
  const bunkers = (G ? G.bk : []).map(code => { const o = CAP_BPOS[code]; if (!o) return ''; const bx = (cx + o[0] * rx * 0.92).toFixed(0), by = cy + o[1] * ry * 0.92; return `<ellipse cx="${bx}" cy="${(by + 3).toFixed(0)}" rx="26" ry="15" fill="#16401c" opacity="0.22"/><ellipse cx="${bx}" cy="${by.toFixed(0)}" rx="24" ry="13" fill="url(#g3dSand)"/>`; }).join('');
  let rings = ''; for (let i = 1; i <= 3; i++) { rings += `<ellipse cx="${pin.x.toFixed(0)}" cy="${pin.y.toFixed(0)}" rx="${(rx * 0.26 * i).toFixed(0)}" ry="${(ry * 0.26 * i).toFixed(0)}" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.16"/>`; }
  const field = `<rect width="${W}" height="${H}" fill="url(#g3dGrass)"/>
    <ellipse cx="${cx}" cy="${(cy + 9).toFixed(0)}" rx="${(rx + 20).toFixed(0)}" ry="${(ry + 18).toFixed(0)}" fill="#3f8f3a" opacity="0.5"/>
    ${bunkers}
    <ellipse cx="${cx}" cy="${(cy + 7).toFixed(0)}" rx="${(rx + 2).toFixed(0)}" ry="${(ry + 2).toFixed(0)}" fill="#16401c" opacity="0.3"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#54ad58" stroke="#2f7a38" stroke-width="2.5"/>
    <ellipse cx="${(cx - rx * 0.24).toFixed(0)}" cy="${(cy - ry * 0.26).toFixed(0)}" rx="${(rx * 0.42).toFixed(0)}" ry="${(ry * 0.34).toFixed(0)}" fill="#79c970" opacity="0.5"/>
    ${rings}
    <circle cx="${pin.x.toFixed(0)}" cy="${pin.y.toFixed(0)}" r="5.5" fill="#08260f"/>
    <line x1="${pin.x.toFixed(0)}" y1="${pin.y.toFixed(0)}" x2="${pin.x.toFixed(0)}" y2="${(pin.y - 42).toFixed(0)}" stroke="#ffffff" stroke-width="2.5"/><path d="M${pin.x.toFixed(0)},${(pin.y - 42).toFixed(0)} l16,5 -16,5z" fill="#C7EE54"/>`;
  const ballEl = `<path d="${puttPath}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="3 5" stroke-linecap="round" opacity="0.9"/>
    <ellipse rx="5" ry="2" fill="#000" opacity="0.2"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${puttPath}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></ellipse>
    <circle r="6" fill="url(#g3dBall)" stroke="#16301a" stroke-width="0.8" style="filter:drop-shadow(0 3px 2px rgba(0,0,0,.4))"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${puttPath}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></circle>`;
  return `<div class="cap"><svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Green y putt">
    <g clip-path="url(#capClip)">${field}${ballEl}</g>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="rgba(20,50,15,0.18)"/>
  </svg></div>`;
}
function captureSchematic(h, chole, noZoom, clean) {
  const shots = captureShots(h);
  const dog = (chole && chole.dog) || 'straight';
  const parV = chole ? chole.par : h.par;
  const par3 = parV === 3;
  const W = 300, H = 296;
  const G = (chole && chole.g) || null;
  const pf = G ? G.pf : 0.5, px = G ? G.px : 0;
  // ¿vista de SOLO el green? (ya estás en green y registras la distancia/putts)
  const last = shots[shots.length - 1];
  const onGreen = !!last && last.lie === 'green';
  if (!clean && onGreen && (h.putts != null || h.dist != null)) return greenCloseup(h, G, pf, px);
  // 2º tiro: toma "de frente al green" (imagen totalmente distinta a la salida)
  if (!clean && h.app) return approachView(h, chole, G, pf, px);

  // ===== proyección en perspectiva (diorama 3D profundo) =====
  const yNear = 270, yFar = 88;
  const dir = dog === 'left' ? -1 : dog === 'right' ? 1 : 0;
  const bend = par3 ? 0 : 52;
  const fy = t => t * (2 - t);
  const scl = t => 1 - 0.66 * fy(t);
  const cxAt = t => 150 + dir * bend * Math.pow(fy(t), 1.45);
  const yAt = t => yNear + (yFar - yNear) * fy(t);
  const fwHalf = t => (par3 ? 58 : 74) * scl(t);
  const proj = (t, side) => ({ x: cxAt(t) + side * fwHalf(t), y: yAt(t) });
  const gpt = proj(1, 0), gx = gpt.x, gy = gpt.y;
  let gw = 30, gh = 13;
  if (G) { if (G.sh === 'wide') { gw = 36; gh = 12; } else if (G.sh === 'tall') { gw = 25; gh = 15; } const s = Math.max(0.85, Math.min(1.16, G.d / 33)); gw *= s; gh *= s; }
  const pin = { x: gx + px * gw * 0.5, y: gy + (0.5 - pf) * gh };

  // fairway en perspectiva (polígonos)
  const STEPS = 16, L = [], R = [], Li = [], Ri = [];
  for (let i = 0; i <= STEPS; i++) { const t = i / STEPS; L.push(proj(t, -1)); R.push(proj(t, 1)); Li.push(proj(t, -0.5)); Ri.push(proj(t, 0.5)); }
  const poly = a => a.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fairPoly = poly(L) + ' ' + poly(R.slice().reverse());
  const fairInPoly = poly(Li) + ' ' + poly(Ri.slice().reverse());

  // árboles a los lados (más chicos al fondo = profundidad)
  let trees = '';
  for (let i = 0; i < 7; i++) { const t = 0.04 + i * 0.135; const s = scl(t) * 1.2; const lp = proj(t, -1.5), rp = proj(t, 1.5); trees += capTree(lp.x, lp.y, s) + capTree(rp.x, rp.y, s); }

  // hazards de agua/arena (de los riesgos del campo)
  const haz = ((chole && chole.risks) || []).filter(r => !G || r.kind === 'water' || r.at === 'drive').map(r => {
    const t = r.at === 'drive' ? 0.5 : 0.9; const p = proj(t, r.side === 'left' ? -1.12 : 1.12); const water = r.kind === 'water'; const sc = scl(t);
    return `<ellipse cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" rx="${((water ? 24 : 17) * sc + 5).toFixed(0)}" ry="${((water ? 13 : 9) * sc + 3).toFixed(0)}" fill="${water ? 'url(#g3dWater)' : 'url(#g3dSand)'}"/>`;
  }).join('');

  // bunkers del green (de la hoja de banderas)
  const bunkers = (G ? G.bk : []).map(code => { const o = CAP_BPOS[code]; if (!o) return ''; const bx = (gx + o[0] * gw * 1.15).toFixed(0), by = gy + o[1] * gh * 1.15; return `<ellipse cx="${bx}" cy="${(by + 2).toFixed(0)}" rx="${(gw * 0.4).toFixed(0)}" ry="${(gh * 0.5).toFixed(0)}" fill="#16401c" opacity="0.22"/><ellipse cx="${bx}" cy="${by.toFixed(0)}" rx="${(gw * 0.36).toFixed(0)}" ry="${(gh * 0.42).toFixed(0)}" fill="url(#g3dSand)"/>`; }).join('');

  const flagH = 22;
  const greenG = `${haz}${bunkers}
    <ellipse cx="${gx.toFixed(0)}" cy="${(gy + 3).toFixed(0)}" rx="${(gw + 1).toFixed(0)}" ry="${(gh + 1).toFixed(0)}" fill="#16401c" opacity="0.3"/>
    <ellipse cx="${gx.toFixed(0)}" cy="${gy.toFixed(0)}" rx="${gw.toFixed(0)}" ry="${gh.toFixed(0)}" fill="#54ad58" stroke="#2f7a38" stroke-width="1.6"/>
    <ellipse cx="${(gx - gw * 0.25).toFixed(0)}" cy="${(gy - gh * 0.28).toFixed(0)}" rx="${(gw * 0.42).toFixed(0)}" ry="${(gh * 0.34).toFixed(0)}" fill="#79c970" opacity="0.55"/>
    <circle cx="${pin.x.toFixed(0)}" cy="${pin.y.toFixed(0)}" r="3.2" fill="#08260f"/>
    <line x1="${pin.x.toFixed(0)}" y1="${pin.y.toFixed(0)}" x2="${pin.x.toFixed(0)}" y2="${(pin.y - flagH).toFixed(0)}" stroke="#ffffff" stroke-width="1.8"/><path d="M${pin.x.toFixed(0)},${(pin.y - flagH).toFixed(0)} l11,3.2 -11,3.2z" fill="#C7EE54"/>`;

  const teeBox = `<ellipse cx="150" cy="${(yNear + 5).toFixed(0)}" rx="20" ry="6" fill="#16401c" opacity="0.18"/><rect x="139" y="${(yNear - 1).toFixed(0)}" width="22" height="7" rx="2.5" fill="#caa15e"/>`;

  const field = `<rect width="${W}" height="${H}" fill="url(#g3dGrass)"/>
    <rect width="${W}" height="${(yFar + 6).toFixed(0)}" fill="url(#capSky)"/>
    <polygon points="${fairPoly}" fill="#5fa83f"/>
    <polygon points="${fairPoly}" fill="none" stroke="#3a7d2c" stroke-width="1.6" opacity="0.45"/>
    <polygon points="${fairInPoly}" fill="#86c860" opacity="0.85"/>
    ${trees}
    ${teeBox}
    ${greenG}`;

  if (clean) {
    let reg = `M${proj(0, 0).x.toFixed(1)},${proj(0, 0).y.toFixed(1)}`;
    for (let i = 1; i <= 8; i++) { const p = proj(i / 8, 0); reg += ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`; }
    return `<div class="cap"><svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Hoyo">
      <g clip-path="url(#capClip)">${field}<path d="${reg}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round" opacity="0.9"/></g>
      <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="rgba(20,50,15,0.18)"/>
    </svg></div>`;
  }

  // vuelo de la bola (arco con sombra)
  const nodePt = s => {
    const t = Math.min(1, s.prog);
    if (s.prog > 1) return { x: gx + s.side * fwHalf(1), y: Math.max(yFar - 30, gy - (s.prog - 1) * 110) };
    return proj(t, s.side);
  };
  // ===== cámara por tiro: salida = toma del hoyo; approach/GIR = la cámara sube al green =====
  const stage = h.app ? 'approach' : 'tee';
  let actShots, startNode;
  if (stage === 'tee') {
    actShots = shots.filter(s => s.role === 'tee');
    startNode = proj(0, 0);
  } else {
    const pre = shots.filter(s => s.role === 'tee' || s.role === 'advance');
    startNode = pre.length ? nodePt(pre[pre.length - 1]) : proj(0, 0);
    actShots = shots.filter(s => s.role === 'approach' || s.role === 'chip');
  }
  const nodes = [startNode, ...actShots.map(nodePt)];
  if (onGreen && nodes.length > 1) nodes[nodes.length - 1] = { x: pin.x, y: pin.y };
  // viewBox: en approach la cámara se acerca al green
  let vbX = 0, vbY = 0, vbW = W, vbH = H, aria = 'Tu salida';
  if (stage === 'approach') {
    vbW = 210; vbH = 207;
    vbX = Math.max(0, Math.min(W - vbW, gx - vbW / 2));
    vbY = Math.max(0, Math.min(H - vbH, yFar - 42));
    aria = 'Tu tiro al green';
  }
  const vb = `${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW} ${vbH}`;

  let shadowPath = `M${nodes[0].x.toFixed(1)},${nodes[0].y.toFixed(1)}`, ballPath = shadowPath;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1], b = nodes[i];
    shadowPath += ` L${b.x.toFixed(1)},${b.y.toFixed(1)}`;
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const peak = Math.max(6, Math.min(62, segLen * 0.34));
    ballPath += ` Q${((a.x + b.x) / 2).toFixed(1)},${((a.y + b.y) / 2 - peak).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }
  // marca de origen (desde dónde tiras) + puntos de caída
  let dots = '';
  if (stage === 'approach') dots += `<ellipse cx="${startNode.x.toFixed(0)}" cy="${(startNode.y + 2).toFixed(0)}" rx="4.2" ry="1.6" fill="#000" opacity="0.18"/><circle cx="${startNode.x.toFixed(0)}" cy="${startNode.y.toFixed(0)}" r="3.4" fill="#fff" stroke="#16301a" stroke-width="0.7" opacity="0.85"/>`;
  actShots.forEach((s, i) => { const q = nodes[i + 1]; dots += `<ellipse cx="${q.x.toFixed(0)}" cy="${(q.y + 2).toFixed(0)}" rx="4" ry="1.6" fill="#000" opacity="0.18"/><circle cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" r="3.6" fill="${shotColor(s)}" stroke="#16301a" stroke-width="0.7"/>`; });

  let ball = '', shadow = '';
  if (nodes.length > 1) {
    const seg = []; let tot = 0;
    for (let i = 1; i < nodes.length; i++) { const l = Math.hypot(nodes[i].x - nodes[i - 1].x, nodes[i].y - nodes[i - 1].y) || 1; seg.push(l); tot += l; }
    const nf = [0]; { let a = 0; for (const l of seg) { a += l; nf.push(a / tot); } }
    const ev = [{ p: 0, d: 0 }]; for (let i = 1; i < nf.length; i++) { ev.push({ p: nf[i], d: 1 }); if (i < nf.length - 1) ev.push({ p: nf[i], d: 0.5 }); } ev.push({ p: 1, d: 0.7 });
    const TT = ev.reduce((a, e) => a + e.d, 0); let ac = 0; const kp = [], kt = []; ev.forEach(e => { ac += e.d; kp.push(e.p.toFixed(3)); kt.push((ac / TT).toFixed(3)); });
    const dur = Math.min(9, 1.1 + (nodes.length - 1) * 1.2).toFixed(1);
    const bs = stage === 'approach' ? 5.4 : 4.6;
    ball = `<circle r="${bs}" fill="url(#g3dBall)" stroke="#16301a" stroke-width="0.8" style="filter:drop-shadow(0 2px 1.4px rgba(0,0,0,.35))"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${ballPath}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></circle>`;
    shadow = `<ellipse rx="4.2" ry="1.6" fill="#000" opacity="0.22"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${shadowPath}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></ellipse>`;
  }

  return `<div class="cap"><svg width="100%" viewBox="${vb}" role="img" aria-label="${aria}">
    <g clip-path="url(#capClip)">
    ${field}
    ${nodes.length > 1 ? `<path d="${shadowPath}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="3 5" stroke-linecap="round" opacity="0.85"/>` : ''}
    ${dots}${shadow}${ball}
    </g>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="rgba(20,50,15,0.18)"/>
  </svg></div>`;
}

/* pasos del registro tipo historia */
function playSteps(h) {
  const s = [];
  if (h.par !== 3) s.push('tee');
  s.push('app');
  if (h.app && h.app !== 'gir') s.push('ud');
  s.push('putts');
  s.push('score');
  return s;
}
function fastDerivedIndex(h, steps) {
  let key;
  if (h.par !== 3 && !(h.teeLie || h.tee)) key = 'tee';
  else if (!h.app) key = 'app';
  else if (h.app !== 'gir' && h.upDown == null) key = 'ud';
  else if (h.putts == null) key = 'putts';
  else key = 'score';
  const i = steps.indexOf(key);
  return i < 0 ? steps.length - 1 : i;
}

/* tracker de tiros del hoyo: limpio, confiable y bonito (reemplaza el mapa del hoyo) */
function holeViz(h, chole, holeNum, teeF) {
  const par = h.par;
  const yds = chole && chole.yds ? Math.round(chole.yds * (teeF || 1)) : null;
  const sugg = (typeof suggestScore === 'function') ? suggestScore(h) : null;
  const score = sugg;
  const rel = score != null ? score - par : null;
  const scoreCls = rel == null ? '' : rel < 0 ? 'good' : rel === 0 ? 'par' : rel <= 1 ? 'over' : 'bad';
  const relLbl = score != null ? (rel === 0 ? 'Par' : rel < 0 ? String(rel) : '+' + rel) : 'Por jugar';
  const lieLbl = { calle: 'Calle', rough: 'Rough', bunker: 'Bunker', ob: 'OB' };
  const appLbl = { gir: 'Green ✓', corto: 'Corto', largo: 'Largo', izq: 'Falló izq', der: 'Falló der' };
  const steps = [];
  if (par !== 3) steps.push({ ic: 'club', label: 'Salida', done: !!(h.teeLie || h.tee), res: h.teeLie ? (lieLbl[h.teeLie] || '') : (h.tee === 'fw' ? 'Calle' : h.tee ? 'Falló' : '') });
  steps.push({ ic: 'green', label: 'Approach', done: !!h.app, res: h.app ? (appLbl[h.app] || '') : '' });
  if (h.app && h.app !== 'gir') steps.push({ ic: 'flag', label: 'Up & down', done: h.upDown != null, res: h.upDown != null ? (h.upDown ? 'Salvado ✓' : 'Chip') : '' });
  steps.push({ ic: 'putter', label: 'Putts', done: h.putts != null, res: h.putts != null ? (h.putts + ' putt' + (h.putts !== 1 ? 's' : '')) : '' });
  const firstPending = steps.findIndex(s => !s.done);
  const track = steps.map((s, i) => {
    const cls = s.done ? 'done' : (i === firstPending ? 'now' : '');
    return `<div class="hv-step ${cls}">
      <span class="hv-dot">${s.done ? '<span class="hv-check">✓</span>' : golfIcon(s.ic)}</span>
      <span class="hv-lab">${s.label}</span>
      <span class="hv-res">${esc(s.res || '·')}</span>
    </div>`;
  }).join('<span class="hv-conn"></span>');
  return `<div class="hv ${scoreCls}">
    <div class="hv-head">
      <div class="hv-info"><span class="hv-hole">Hoyo ${holeNum != null ? holeNum : ''}</span><span class="hv-par">Par ${par}${yds ? ' · ' + yds + ' yds' : ''}</span></div>
      <div class="hv-score"><b>${score != null ? score : '–'}</b><span>${relLbl}</span></div>
    </div>
    <div class="hv-track">${track}</div>
  </div>`;
}

/* coach del hoyo: overall de cómo jugarlo + consejo tiro por tiro */
function vHoleCoach(a, h, holeNo, yds) {
  const par = h.par;
  const agg = Stats.aggregate(myRounds());
  let weak = '';
  if (agg) {
    const issues = [
      ['céntrate en meter la bola en juego desde el tee', 55 - (agg.fwPct || 0)],
      ['apunta al centro del green, no a la bandera', 52 - (agg.girPct || 0)],
      ['asegura el up&down dejando el chip cuesta arriba', 48 - (agg.scrPct || 0)],
      ['el primer putt, déjala a un palo del hoyo', ((agg.putts18 || 30) - 31) * 4],
    ].sort((x, y) => y[1] - x[1]);
    weak = issues[0][0];
  }
  const overall = par <= 3
    ? `Par 3${yds ? ` · ${yds} yds` : ''}. Tiro directo a green: elige el palo que llegue al <b>centro</b> y comprométete con el swing.`
    : par >= 5
      ? `Par 5${yds ? ` · ${yds} yds` : ''}. Drive al centro; si quedas bien, ataca en dos. Si no, deja un <b>wedge cómodo</b> a tu distancia favorita.`
      : `Par 4${yds ? ` · ${yds} yds` : ''}. Prioriza la <b>calle</b> y ataca al lado abierto del green.`;
  const shots = [
    ['Salida', par <= 3 ? 'Tee a la altura justa, swing suave y completo hacia el centro del green.' : 'Driver o híbrido al centro de la calle. Menos club, más fairway.'],
    ['Approach', 'Saca tu distancia exacta y apunta al centro del green, sin dudar.'],
    ['Juego corto', 'Si fallas el green, deja el chip cuesta arriba para subir el siguiente.'],
    ['Putt', 'Lee la caída; el primer putt, a dejarla a un palo.'],
  ];
  const open = V.holeCoachOpen;
  return `<div class="hc">
    <div class="hc-head"><span class="hc-ava">IA</span><div class="hc-htx"><span class="hc-tag">Coach · hoyo ${holeNo}</span><p class="hc-over">${overall}</p></div></div>
    ${weak ? `<p class="hc-weak">Tu prioridad hoy: ${weak}.</p>` : ''}
    <button class="hc-toggle" data-act="hole-coach-toggle">${open ? 'Ocultar tiro por tiro ▴' : 'Ver consejo tiro por tiro ▾'}</button>
    ${open ? `<div class="hc-shots">${shots.map(([t, d]) => `<div class="hc-shot"><b>${t}</b><span>${d}</span></div>`).join('')}</div>` : ''}
  </div>`;
}

function vPlay() {
  const a = S.active;
  if (!a) return vRondaTab();
  if (a.idx >= a.holesCount) return vSummary(a);
  const h = V.hole;
  const chole = (typeof srcHole === 'function') ? srcHole(a, a.idx) : null;
  const holeNo = (a.holeOffset || 0) + a.idx + 1;   // numeración continua (10-18, 19-27, repite en campos de 9)
  const yds = chole && chole.yds ? Math.round(chole.yds * (a.teeF || 1)) : null;
  const sugg = suggestScore(h);
  const score = (V.scoreTouched && h.score != null) ? h.score : sugg;
  const rel = score != null ? score - h.par : null;
  const scoreCls = rel == null ? '' : rel <= -1 ? 'good' : rel === 0 ? 'par' : rel === 1 ? 'over' : 'bad';
  const pct = (a.idx / a.holesCount) * 100;
  const ready = h.putts != null;
  const gir = h.app === 'gir';

  const tile = (k, on, label, sub) => `<button class="hs-tile ic-${k} ${on ? 'on' : ''}" data-act="h-toggle" data-k="${k}">
      <div class="hs-art">${chkScene(k, on)}</div>
      <span class="hs-lab">${label}<small>${sub}</small></span>
      <span class="hs-box">${on ? '✓' : ''}</span>
    </button>`;

  return `<div class="shell no-nav fade-in">
    <div class="play-top">
      <button class="x" data-act="play-exit">✕ Salir</button>
      <span class="label">${esc(a.course)}</span>
      <span class="small muted">${a.idx + 1}/${a.holesCount}</span>
    </div>
    <div class="progress"><i style="width:${pct}%"></i></div>

    <div class="hole-banner hb-scene">
      <div class="hb-sky" aria-hidden="true"><span class="hb-sun"></span><span class="hb-cloud"></span>
        <svg class="hb-green" viewBox="0 0 300 70" preserveAspectRatio="none"><path d="M0,40 Q150,18 300,38 L300,70 L0,70Z" fill="#9fd06a"/><path d="M0,54 Q150,36 300,52 L300,70 L0,70Z" fill="#7cbf52"/><g transform="translate(238 40)"><ellipse cx="0" cy="6" rx="34" ry="9" fill="#6fb045"/><rect x="-1" y="-26" width="2.4" height="30" fill="#cfd6d8"/><path d="M1.4 -26 L16 -21 L1.4 -16 Z" fill="#ff5a4d"/><circle cx="0" cy="6" r="2.2" fill="#2c3b1c"/></g></svg>
      </div>
      <div class="hb-info">
        <span class="hb-course">${esc(a.course)}${a.teeName ? ` · ${esc(a.teeName)}` : ''}</span>
        <div class="hb-head">
          <span class="hb-num">Hoyo ${holeNo}</span>
          <div class="hb-meta"><span class="hb-par">Par ${h.par}</span>${yds ? `<span class="hb-yds">${yds} yds</span>` : ''}</div>
        </div>
      </div>
    </div>
    ${vHoleCoach(a, h, holeNo, yds)}

    ${(() => {
      const steps = playSteps(h);
      const ci = (V.fastStep != null && V.fastStep < steps.length) ? V.fastStep : fastDerivedIndex(h, steps);
      const cur = steps[ci];
      const tabLab = { tee: 'Calle', app: 'Green', ud: 'Up&D', putts: 'Putts', score: 'Score' };
      const ansOf = k => {
        if (k === 'tee') return h.teeLie === 'calle' ? 'Sí' : h.teeLie === 'ob' ? 'OB' : h.teeLie ? 'No' : null;
        if (k === 'app') return h.app === 'gir' ? 'Sí' : h.app ? 'No' : null;
        if (k === 'ud') return h.upDown === true ? 'Sí' : h.upDown === false ? 'No' : null;
        if (k === 'putts') return h.putts != null ? h.putts + 'p' : null;
        if (k === 'score') return score != null ? String(score) : null;
        return null;
      };
      const tabs = steps.map((s, i) => `<button class="wz-tab ${i === ci ? 'on' : ''} ${ansOf(s) != null ? 'ans' : ''}" data-act="fast-tab" data-s="${s}"><span>${tabLab[s]}</span><b>${ansOf(s) || '·'}</b></button>`).join('');
      const yn = (scene, onYes, onNo, yesAttr, noAttr, q, extra) => `
        <h3 class="wz-q">${q}</h3>
        <div class="wz-art">${chkScene(scene, onYes)}</div>
        <div class="wz-yn">
          <button class="wz-opt yes ${onYes ? 'on' : ''}" data-act="fast" ${yesAttr}>Sí</button>
          <button class="wz-opt no ${onNo ? 'on' : ''}" data-act="fast" ${noAttr}>No</button>
        </div>${extra || ''}`;
      const penPill = `<div class="wz-extra"><button class="wz-pen ${h.pen ? 'on' : ''}" data-act="fast-pen">${h.pen ? '✓ ' : ''}Penalti / OB en este hoyo</button></div>`;
      let body;
      if (cur === 'tee') body = yn('fw', h.teeLie === 'calle', !!h.teeLie && h.teeLie !== 'calle' && h.teeLie !== 'ob', 'data-k="tee" data-lie="calle" data-dir="c"', 'data-k="tee" data-lie="rough" data-dir="c"', '¿Pegaste a la calle?', penPill);
      else if (cur === 'app') body = yn('gir', h.app === 'gir', !!h.app && h.app !== 'gir', 'data-k="app" data-v="gir"', 'data-k="app" data-v="miss"', '¿Llegaste al green en regulación?', h.par === 3 ? penPill : '');
      else if (cur === 'ud') body = yn('ud', h.upDown === true, h.upDown === false, 'data-k="ud" data-v="si"', 'data-k="ud" data-v="no"', '¿Salvaste el par? (up &amp; down)');
      else if (cur === 'putts') {
        const opts = h.upDown === true ? [[0, '0'], [1, '1']] : [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']];
        body = `<h3 class="wz-q">¿Cuántos putts?</h3><div class="wz-putts ${opts.length === 2 ? 'wz-putts2' : ''}">${opts.map(([v, l]) => `<button class="wz-putt ${h.putts === v ? 'on' : ''}" data-act="fast" data-k="putts" data-v="${v}">${l}</button>`).join('')}</div>`;
      } else {
        body = `<h3 class="wz-q">Tu score</h3>
          <div class="wz-scorebox ${scoreCls}">
            <span class="sc-num">${score != null ? score : '–'}</span><span class="sc-rel">${score != null ? relScore(score - h.par) : ''}</span>
            <div class="stepper"><button data-act="h-score" data-d="-1">−</button><button data-act="h-score" data-d="1">+</button></div>
          </div>`;
      }
      return `<div class="card wz">
        <div class="wz-tabs">${tabs}</div>
        <div class="wz-body">${body}</div>
        ${ci > 0 ? `<button class="wz-back" data-act="fast-back">← Atrás</button>` : ''}
      </div>`;
    })()}

    <div class="btn-row">
      ${a.idx > 0 ? `<button class="btn" style="flex:0 0 26%" data-act="h-prev">←</button>` : ''}
      <button class="btn primary big" data-act="h-next" ${ready ? '' : 'disabled'}>${a.idx + 1 === a.holesCount ? 'Finalizar ronda ✓' : 'Siguiente hoyo →'}</button>
    </div>

    ${ready ? `<div class="card sc-clean" style="margin-top:18px">
      <span class="label">Tarjeta</span>
      ${scorecardTable(a.holesCount, i => (i === a.idx ? h.par : (a.holes[i] ? a.holes[i].par : parForActive(a, i))), [{ name: cur().name.split(' ')[0], scoreOf: i => (a.holes[i] ? a.holes[i].score : null) }], a.idx)}
    </div>` : ''}
    ${V.confirmExit ? vExitSheet() : ''}
  </div>`;
}

function vExitSheet() {
  return `<div class="overlay" data-act="exit-cancel">
    <div class="sheet" data-act="noop">
      <div class="grab"></div>
      <h2>¿Salir de la ronda?</h2>
      <p class="auth-sub">Tu progreso queda guardado y puedes continuar cuando quieras.</p>
      <button class="btn primary" data-act="play-save-exit">Guardar y salir</button>
      <button class="btn danger" data-act="play-discard">Descartar ronda</button>
      <button class="btn" data-act="exit-cancel">Seguir jugando</button>
    </div>
  </div>`;
}

/* ---------- Resumen de ronda ---------- */
/* análisis completo de la ronda: highlights, mejor/peor hoyo, fortaleza y fuga */
function roundAnalysis(a, s) {
  const holes = (a.holes || []).filter(Boolean);
  if (!holes.length) return '';
  let bird = 0, par = 0, bog = 0, worse = 0, best = null, worst = null;
  holes.forEach((h, i) => { const d = h.score - h.par; if (d <= -1) bird++; else if (d === 0) par++; else if (d === 1) bog++; else worse++; if (best == null || d < best.d) best = { d, n: i + 1 }; if (worst == null || d > worst.d) worst = { d, n: i + 1 }; });
  const u = cur();
  const vibe = roundVibe(s, u.hcp);
  const areas = [
    { k: 'la salida (calles)', v: s.fwTot ? s.fw / s.fwTot : 1 },
    { k: 'los greens (GIR)', v: s.girTot ? s.gir / s.girTot : 1 },
    { k: 'el juego corto', v: s.scrTot ? s.scr / s.scrTot : 1 },
    { k: 'el putt', v: Math.max(0, Math.min(1, (36 - (s.putts * 18 / s.holes)) / 12)) },
  ];
  const weak = [...areas].sort((x, y) => x.v - y.v)[0];
  const strong = [...areas].sort((x, y) => y.v - x.v)[0];
  const verdict = vibe && vibe.k === 'fire' ? { t: 'En fuego', cls: 'fire' }
    : vibe && vibe.k === 'ice' ? { t: 'Ronda fría', cls: 'ice' }
    : { t: 'Ronda sólida', cls: 'ok' };
  const row = (icon, b, sub, cls) => `<div class="ra-row ${cls || ''}"><span class="ra-ic">${golfIcon(icon)}</span><div class="ra-tx"><b>${b}</b><span>${sub}</span></div></div>`;
  const rows = [
    row('bird', `${bird} birdie${bird !== 1 ? 's' : ''} o mejor`, `${par} pares · ${bog} bogeys · ${worse} dobles+`),
    best ? row('medal', `Mejor hoyo · #${best.n}`, relScore(best.d)) : '',
    (worst && worst.d >= 2) ? row('card', `Hoyo más caro · #${worst.n}`, `${relScore(worst.d)} · pasa la página`) : '',
    row('green', `Tu fortaleza · ${strong.k}`, 'sigue así'),
    row('bucket', `Tu fuga · ${weak.k}`, 'practícalo en el Trainer', 'ra-focus'),
  ].filter(Boolean).join('');
  return `<div class="card ra-card">
    <div class="ra-top"><span class="label" style="margin:0">Análisis de tu ronda</span><span class="ra-verdict ${verdict.cls}">${verdict.t}</span></div>
    ${rows}
  </div>`;
}

function vSummary(a) {
  const fake = { holes: a.holes };
  const s = Stats.roundStats(fake);
  const pct = (x, t) => (t ? Math.round((x / t) * 100) + '%' : '—');
  const good = s.toPar <= 2 || (a.holes || []).some(h => h && h.score != null && (h.score - h.par) <= -1);
  const celebrate = good ? ` data-celebrate="sum-${a.startedAt || ''}-${s.score}"` : '';
  return `<div class="shell no-nav fade-in"${celebrate}>
    <div class="play-top"><span></span><span class="label">Resumen de ronda</span><span></span></div>
    <div class="greet" style="text-align:center">
      <p class="hi">${esc(a.course)}</p>
      <h1 style="font-size:54px">${s.score}</h1>
      <p class="hcp">${fmtToPar(s.toPar)} · ${s.holes} hoyos</p>
    </div>
    <div class="grid2">
      ${statCard(pct(s.fw, s.fwTot), 'Fairways', s.fwTot ? (s.fw / s.fwTot) * 100 : 0)}
      ${statCard(pct(s.gir, s.girTot), 'GIR', (s.gir / s.girTot) * 100)}
      ${statCard(pct(s.scr, s.scrTot), 'Up/Down', s.scrTot ? (s.scr / s.scrTot) * 100 : 0)}
      ${statCard(String(s.putts), 'Putts', Stats.clamp(((38 - (s.putts * 18) / s.holes) / 11) * 100, 0, 100))}
    </div>
    ${roundAnalysis(a, s)}
    <div class="card">
      <span class="label">Tarjeta</span>
      ${scorecard(a.holes.slice(0, 9))}
      ${a.holes.length > 9 ? scorecard(a.holes.slice(9), 9) : ''}
    </div>
    <button class="btn primary" data-act="finish-round">Guardar ronda ✓</button>
    <button class="btn" data-act="h-prev">← Corregir último hoyo</button>
  </div>`;
}

/* ---------- Detalle de ronda guardada ---------- */
/* Tarjeta de golf completa: par, yds, score con círculo/cuadro, y FW/GIR/U&D por hoyo */
function vDetailCard(r, parOf, ydsOf) {
  const n = r.holes.length;
  const has18 = n > 9;
  const seg = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
  const front = seg(0, Math.min(9, n)), back = has18 ? seg(9, n) : [];
  const blocks = has18 ? [['Ida', front], ['Vuelta', back]] : [['', front]];
  const dot = v => v == null ? `<span class="dc-dot na"></span>` : `<span class="dc-dot ${v ? 'hit' : 'miss'}"></span>`;
  const sumIf = (fn, arr) => { let s = 0, a = false; for (const i of arr) { const v = fn(i); if (v != null) { s += v; a = true; } } return a ? s : ''; };
  const scoreOf = i => (r.holes[i] ? r.holes[i].score : null);
  const blockHtml = ([lab, arr]) => {
    const cells = (fn, cls) => arr.map(i => `<span class="dcell ${cls || ''}">${fn(i)}</span>`).join('');
    const fwOf = i => { const h = r.holes[i]; return !h ? null : (h.par === 3 ? null : teeIsFairway(h)); };
    const girOf = i => { const h = r.holes[i]; return !h ? null : (h.app === 'gir'); };
    const udOf = i => { const h = r.holes[i]; if (!h || h.app === 'gir') return null; return h.upDown === true; };
    return `<div class="dc-block">
      <div class="dc-grid" style="grid-template-columns:54px repeat(${arr.length},1fr) 40px">
        <span class="dc-rl dc-corner">${lab || 'Hoyo'}</span>${cells(i => i + 1, 'dc-num')}<span class="dc-rl dc-tt">TOT</span>
        <span class="dc-rl">Par</span>${cells(i => parOf(i), 'dc-par')}<span class="dcell dc-tt">${sumIf(parOf, arr)}</span>
        <span class="dc-rl">Score</span>${cells(i => scoreMarker(scoreOf(i), parOf(i)), 'dc-score')}<span class="dcell dc-tt dc-tot">${sumIf(scoreOf, arr)}</span>
        <span class="dc-rl">Calle</span>${cells(i => dot(fwOf(i)))}<span class="dc-rl dc-tt"></span>
        <span class="dc-rl">Green</span>${cells(i => dot(girOf(i)))}<span class="dc-rl dc-tt"></span>
        <span class="dc-rl">Up&down</span>${cells(i => dot(udOf(i)))}<span class="dc-rl dc-tt"></span>
      </div>
    </div>`;
  };
  return `<div class="dc-scroll">${blocks.map(blockHtml).join('')}</div>
    <div class="dc-legend"><span><i class="dc-dot hit"></i> logrado</span><span><i class="dc-dot miss"></i> fallado</span><span><i class="dc-mark mk-circ">3</i> birdie</span><span><i class="dc-mark mk-sq">5</i> bogey</span></div>`;
}

/* clima estimado del campo por hora del día (demo · sin conexión a un servicio real) */
function mockWeather(courseId) {
  const h = new Date().getHours();
  const seed = String(courseId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const t = Math.round(13 + 11 * Math.sin(Math.max(0, Math.min(1, (h - 6) / 13)) * Math.PI) + (seed % 3));
  const cond = (h < 6.5 || h >= 19.5) ? 'Noche despejada' : h < 8.5 ? 'Amanece' : h < 12 ? 'Soleado' : h < 16 ? 'Soleado' : 'Tarde dorada';
  return `${t}° · ${cond}`;
}
/* fase del día por hora y la hora en que se jugó una ronda */
function roundPhase(hr) { return hr < 6.5 ? 'night' : hr < 8.5 ? 'dawn' : hr < 17 ? 'day' : hr < 19.5 ? 'dusk' : 'night'; }
function roundHour(r) {
  if (r && r.time) { const n = parseInt(String(r.time).split(':')[0], 10); if (!isNaN(n)) return n; }
  let h = 0; const sid = String((r && r.id) || '');
  for (let i = 0; i < sid.length; i++) h = (h * 31 + sid.charCodeAt(i)) >>> 0;
  return 7 + (h % 11); // 7–17h estable por ronda cuando no hay hora guardada
}
function rfSky(phase) {
  const night = phase === 'night';
  const stars = night ? Array.from({ length: 12 }, (_, i) => `<span class="rf-star" style="left:${(i * 41 % 94) + 3}%;top:${(i * 27 % 50) + 6}%;animation-delay:${(i % 4) * 0.5}s"></span>`).join('') : '';
  const celest = night ? `<span class="rf-moon"></span>${stars}` : `<span class="rf-sun"></span>`;
  const bird = (st) => `<svg class="rf-bird" style="${st}" viewBox="0 0 24 8" aria-hidden="true"><path d="M1 6 Q6 0 11 5 Q16 0 23 6" fill="none" stroke="rgba(30,45,30,.5)" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  return `<div class="rf-sky" aria-hidden="true">${celest}<span class="rf-cloud c1"></span><span class="rf-cloud c2"></span>${bird('left:16%;top:24%')}${bird('left:58%;top:16%;transform:scale(.7)')}</div>`;
}
function rfCourseSvg() {
  return `<svg class="rf-course" viewBox="0 0 400 90" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0,46 Q120,22 250,40 T400,32 L400,90 L0,90Z" fill="#aedd7c"/>
      <path d="M0,66 Q140,48 280,62 T400,56 L400,90 L0,90Z" fill="#8fc857"/>
      <g transform="translate(330,40)"><ellipse cx="1" cy="2" rx="22" ry="6" fill="#7fbf52"/><rect x="0" y="-22" width="2" height="24" fill="#cfd6d8"/><path d="M2 -22 L13 -18 L2 -14 Z" fill="#ff5a4d"/></g>
      <g transform="translate(42,30)"><rect x="-2" y="8" width="4" height="14" fill="#6b4a2a"/><ellipse cx="0" cy="2" rx="16" ry="14" fill="#3a7d3a"/></g>
      <g transform="translate(88,38)"><rect x="-2" y="6" width="4" height="11" fill="#6b4a2a"/><ellipse cx="0" cy="0" rx="11" ry="10" fill="#479a44"/></g>
    </svg>`;
}
/* escena de resumen con el cielo del momento que se jugó la ronda */
function roundScene(r, s, courseName, justFin) {
  const phase = roundPhase(roundHour(r));
  return `<div class="rf-hero rf-${phase}">
    ${rfSky(phase)}${rfCourseSvg()}
    <div class="rf-info">
      <span class="rf-kicker">${justFin ? '¡Ronda guardada!' : 'Resumen de ronda'}</span>
      <div class="rf-score"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
      <span class="rf-sub">${esc(courseName)} · ${s.holes} hoyos</span>
    </div>
  </div>`;
}
/* tarjeta-escena clicable para el historial (cielo según la hora que se jugó) */
function roundSceneCard(r, rail) {
  const s = Stats.roundStats(r);
  const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
  const phase = roundPhase(roundHour(r));
  return `<button class="rf-hero rf-card ${rail ? 'rf-rail' : ''} rf-${phase}" data-act="round-detail" data-id="${r.id}">
    ${rfSky(phase)}${rfCourseSvg()}
    <div class="rf-info">
      <span class="rf-kicker">${fmtDate(r.date)} · ${s.holes}h</span>
      <div class="rf-score"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
      <span class="rf-sub">${esc(course)}</span>
    </div>
  </button>`;
}

function vRoundDetail() {
  const r = S.rounds.find(x => x.id === V.detail);
  if (!r) return vRondaTab();
  const justFin = V.justFinished === V.detail;
  const s = Stats.roundStats(r);
  const pct = (x, t) => (t ? Math.round((x / t) * 100) + '%' : '—');
  const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId] : null;
  const courseName = course ? course.name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
  const off = r.holeOffset || 0;
  const ch = course ? course.holes : null;
  const chAt = i => ch ? ch[off + i] : null;
  const parOf = i => (r.holes[i] && r.holes[i].par != null) ? r.holes[i].par : (chAt(i) ? chAt(i).par : 4);
  const ydsOf = (ch && ch.some(h => h.yds)) ? (i => (chAt(i) ? chAt(i).yds : null)) : null;
  const totYds = ch ? ch.slice(off, off + r.holes.length).reduce((a, h) => a + (h.yds || 0), 0) : 0;
  const scoreCls = s.toPar <= 0 ? 'good' : s.toPar <= Math.round(s.holes * 0.33) ? 'par' : 'over';
  return `<button class="auth-back" data-act="nav" data-view="ronda">← Tus rondas</button>
    <div class="rd-head">
      <div class="rd-head-l">
        ${justFin ? '<span class="rd-kick">¡Ronda guardada!</span>' : ''}
        <h1 class="rd-course-name">${esc(courseName)}</h1>
        <span class="rd-sub">${fmtDate(r.date)} · ${s.holes} hoyos · Par ${s.par}${course && course.approx ? ' · aprox' : ''}</span>
      </div>
      <div class="rd-score ${scoreCls}"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
    </div>
    <div class="pst-rings rd-scenes">
      ${pstSceneStatic('fw', s.fwTot ? (s.fw / s.fwTot) * 100 : 0, 'Fairways')}
      ${pstSceneStatic('gir', s.girTot ? (s.gir / s.girTot) * 100 : 0, 'GIR')}
      ${pstSceneStatic('ud', s.scrTot ? (s.scr / s.scrTot) * 100 : 0, 'Up & down')}
    </div>
    <div class="card">
      <span class="label">${golfIcon('card')} Tu tarjeta · ${esc(courseName)}</span>
      ${vDetailCard(r, parOf, ydsOf)}
    </div>
    ${roundAnalysis(r, s)}
    <button class="btn danger" data-act="round-delete" data-id="${r.id}">${V.delArm === r.id ? '¿Seguro? Toca otra vez para eliminar' : 'Eliminar esta ronda'}</button>`;
}
