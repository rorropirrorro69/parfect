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
function scTableCell(score, par, cur) {
  if (score == null) return `<td class="${cur ? 'sc-cur' : ''}">·</td>`;
  const cls = scCellClass(score - par);
  return `<td class="${cls} ${cur ? 'sc-cur' : ''}">${score}</td>`;
}

/**
 * holesCount, parOf(i)->par, rows = [{name, scoreOf(i)->score|null}], curIdx (resaltar)
 */
function scorecardTable(holesCount, parOf, rows, curIdx) {
  const has18 = holesCount > 9;
  const seg = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
  const front = seg(0, Math.min(9, holesCount));
  const back = has18 ? seg(9, holesCount) : [];
  const sumR = (fn, arr) => { let s = 0, any = false; for (const i of arr) { const v = fn(i); if (v != null) { s += v; any = true; } } return any ? s : ''; };
  const all = [...front, ...back];

  const headNums = arr => arr.map(i => `<th class="${i === curIdx ? 'sc-cur' : ''}">${i + 1}</th>`).join('');
  const head = `<tr class="sc-hrow"><th class="sc-name">Hoyo</th>${headNums(front)}${has18 ? '<th class="sc-tt">id</th>' : ''}${headNums(back)}${has18 ? '<th class="sc-tt">vt</th>' : ''}<th class="sc-tt">TOT</th></tr>`;

  const parCells = arr => arr.map(i => `<td>${parOf(i)}</td>`).join('');
  const parRow = `<tr class="sc-parrow"><td class="sc-name">Par</td>${parCells(front)}${has18 ? `<td class="sc-tt">${sumR(parOf, front)}</td>` : ''}${parCells(back)}${has18 ? `<td class="sc-tt">${sumR(parOf, back)}</td>` : ''}<td class="sc-tt">${sumR(parOf, all)}</td></tr>`;

  const playerRows = rows.map(r => {
    const cells = arr => arr.map(i => scTableCell(r.scoreOf(i), parOf(i), i === curIdx)).join('');
    return `<tr><td class="sc-name">${esc(r.name)}</td>${cells(front)}${has18 ? `<td class="sc-tt">${sumR(r.scoreOf, front)}</td>` : ''}${cells(back)}${has18 ? `<td class="sc-tt">${sumR(r.scoreOf, back)}</td>` : ''}<td class="sc-tt">${sumR(r.scoreOf, all)}</td></tr>`;
  }).join('');

  return `<div class="sc-scroll"><table class="sc-table"><thead>${head}</thead><tbody>${parRow}${playerRows}</tbody></table></div>`;
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
  rows += rounds.map(r => {
    const s = Stats.roundStats(r);
    const course = (r.courseId && COURSES[r.courseId]) ? COURSES[r.courseId].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : r.course;
    return `<button class="pl-rr" data-act="round-detail" data-id="${r.id}">
      <div class="pl-rr-id"><b>${esc(course)}${r.partyId ? ' ' + golfIcon('flag') : ''}</b><span>${fmtDate(r.date)} · ${s.holes} hoyos · ${s.putts} putts</span></div>
      <span class="pl-rr-score">${s.score}<em>${fmtToPar(s.toPar)}</em></span>
    </button>`;
  }).join('');
  return html + `<div class="pl-rr-list">${rows}</div>`;
}

/* ---------- Setup de ronda ---------- */
function vSetup() {
  const cid = V.setupCourseId || 'campestre';
  const tid = V.setupTee || 'blancas';
  const tee = teeById(tid);
  const sname = id => COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
  const totalYds = Math.round(COURSES[cid].holes.reduce((a, h) => a + h.yds, 0) * tee.f);
  return `<div class="sec-h"><h2>Nueva ronda</h2></div>
    <div class="card">
      <span class="label">Elige campo</span>
      <div class="chips" style="margin-top:8px">
        ${COURSE_ORDER.map(id => `<button class="chip ${cid === id ? 'on' : ''}" data-act="setup-pick-course" data-c="${id}">${esc(sname(id))}</button>`).join('')}
      </div>
      <p class="note" style="margin:10px 0 0">${esc(COURSES[cid].name)} · ${COURSES[cid].holes.length} hoyos · <b class="lime">pares y yardas reales</b>.</p>
    </div>
    <div class="card">
      <span class="label">Salidas (tees)</span>
      <div class="chips" style="margin-top:8px">
        ${TEES.map(t => `<button class="chip ${tid === t.id ? 'on' : ''}" data-act="setup-pick-tee" data-t="${t.id}">${esc(t.name)}</button>`).join('')}
      </div>
      <p class="note" style="margin:10px 0 0">${esc(tee.name)} · ${esc(tee.sub)} · <b class="lime">${totalYds} yds</b> en total.</p>
    </div>
    <button class="btn primary" data-act="start-round">Comenzar ronda →</button>
    <button class="btn" data-act="nav" data-view="ronda">Cancelar</button>
    <div class="sec-h" style="margin-top:20px"><h2 style="font-size:16px">¿Juegas con amigos?</h2></div>
    ${partyCard()}`;
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
  return '#c9f73e';
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
    <line x1="${pin.x.toFixed(0)}" y1="${pin.y.toFixed(0)}" x2="${pin.x.toFixed(0)}" y2="${(pin.y - flagH).toFixed(0)}" stroke="#ffffff" stroke-width="2.2"/><path d="M${pin.x.toFixed(0)},${(pin.y - flagH).toFixed(0)} l14,4 -14,4z" fill="#c9f73e"/>
    <ellipse cx="150" cy="262" rx="92" ry="26" fill="${lieCol}"/>
    <ellipse cx="150" cy="256" rx="56" ry="13" fill="#ffffff" opacity="0.08"/>`;
  const landDot = `<ellipse cx="${land.x.toFixed(0)}" cy="${(land.y + 2).toFixed(0)}" rx="4.4" ry="1.7" fill="#000" opacity="0.2"/><circle cx="${land.x.toFixed(0)}" cy="${land.y.toFixed(0)}" r="4" fill="${ok ? '#c9f73e' : '#e3c887'}" stroke="#16301a" stroke-width="0.8"/>`;
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
    <line x1="${pin.x.toFixed(0)}" y1="${pin.y.toFixed(0)}" x2="${pin.x.toFixed(0)}" y2="${(pin.y - 42).toFixed(0)}" stroke="#ffffff" stroke-width="2.5"/><path d="M${pin.x.toFixed(0)},${(pin.y - 42).toFixed(0)} l16,5 -16,5z" fill="#c9f73e"/>`;
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
    <line x1="${pin.x.toFixed(0)}" y1="${pin.y.toFixed(0)}" x2="${pin.x.toFixed(0)}" y2="${(pin.y - flagH).toFixed(0)}" stroke="#ffffff" stroke-width="1.8"/><path d="M${pin.x.toFixed(0)},${(pin.y - flagH).toFixed(0)} l11,3.2 -11,3.2z" fill="#c9f73e"/>`;

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

function vPlay() {
  const a = S.active;
  if (!a) return vRondaTab();
  if (a.idx >= a.holesCount) return vSummary(a);
  const h = V.hole;
  const chole = (a.courseId && COURSES[a.courseId] && COURSES[a.courseId].holes[a.idx]) ? COURSES[a.courseId].holes[a.idx] : null;
  const sugg = suggestScore(h);
  const score = V.scoreTouched ? h.score : sugg;
  const pct = (a.idx / a.holesCount) * 100;
  const ready = h.app && h.putts != null && teeDone(h);

  const lieLbl = { calle: 'Calle ✓', rough: 'Rough', bunker: 'Bunker', ob: 'OB/Penal' };
  const dirLbl = { izq: ' izq', der: ' der', c: '' };
  const sl = [];
  if (h.par >= 4 && (h.teeLie || h.tee)) {
    if (h.teeLie) sl.push((lieLbl[h.teeLie] || 'Salida') + (h.teeLie !== 'calle' && dirLbl[h.tee] ? dirLbl[h.tee] : ''));
    else sl.push(h.tee === 'fw' ? 'Calle ✓' : h.tee === 'penal' ? 'OB/Penal' : h.tee === 'izq' ? 'Salida izq' : 'Salida der');
  }
  if (h.app) sl.push(h.app === 'gir' ? 'Green ✓' : h.app === 'corto' ? 'Corto' : h.app === 'largo' ? 'Largo' : h.app === 'izq' ? 'Falló izq' : 'Falló der');
  if (h.app && h.app !== 'gir' && h.upDown != null) sl.push(h.upDown ? 'Up & down ✓' : 'Chip');
  if (h.putts != null) sl.push(h.putts + ' putt' + (h.putts !== 1 ? 's' : ''));

  return `<div class="shell no-nav fade-in">
    <div class="play-top">
      <button class="x" data-act="play-exit">✕ Salir</button>
      <span class="label">${esc(a.course)}</span>
      <span class="small muted">${a.idx + 1}/${a.holesCount}</span>
    </div>
    <div class="progress"><i style="width:${pct}%"></i></div>
    <div class="hole-head">
      <span class="hnum">Hoyo ${a.idx + 1}</span>
      <span class="hof">Par ${h.par}${chole && chole.yds ? ` · ${Math.round(chole.yds * (a.teeF || 1))} yds` : ''}${a.teeName ? ` · ${esc(a.teeName)}` : ''}</span>
    </div>

    <div class="card" style="padding:10px">
      ${captureSchematic(h, chole)}
      <p class="note" style="text-align:center;margin:6px 0 0">${sl.length ? esc(sl.join('  ·  ')) : 'Registra tu hoyo y míralo tiro por tiro.'}</p>
    </div>

    <div class="reg-card">
    ${h.par !== 3 ? `<div class="group">
      <div class="g-lab"><span class="g-num">1</span><span class="label">Salida</span><span class="small muted">¿a dónde fue?</span>${h.teeLie ? '<span class="g-ok">✓</span>' : ''}</div>
      ${chipRow([['izq', '← Izq'], ['c', 'Centro'], ['der', 'Der →']], 'tee', h.tee)}
      <div style="height:8px"></div>
      ${chipRow([['calle', 'Calle ✓'], ['rough', 'Rough'], ['bunker', 'Bunker'], ['ob', 'OB·Penal']], 'teeLie', h.teeLie)}
    </div>` : ''}

    <div class="group">
      <div class="g-lab"><span class="g-num">${h.par !== 3 ? 2 : 1}</span><span class="label">Approach</span>${h.app ? '<span class="g-ok">✓</span>' : ''}</div>
      ${chipRow([['gir', 'GIR ✓'], ['corto', 'Corto'], ['largo', 'Largo'], ['izq', '← Izq'], ['der', 'Der →']], 'app', h.app)}
    </div>

    ${h.app && h.app !== 'gir' ? `<div class="group">
      <div class="g-lab"><span class="g-num">${h.par !== 3 ? 3 : 2}</span><span class="label">Alrededor del green</span><span class="small muted">¿Up & down?</span></div>
      ${chipRow([['si', 'Salvé el par'], ['no', 'No lo salvé']], 'upDown', h.upDown === true ? 'si' : h.upDown === false ? 'no' : null)}
    </div>` : ''}

    <div class="group">
      <div class="g-lab"><span class="g-num">${h.par !== 3 ? (h.app && h.app !== 'gir' ? 4 : 3) : (h.app && h.app !== 'gir' ? 3 : 2)}</span><span class="label">Putts</span>${h.putts != null ? '<span class="g-ok">✓</span>' : ''}</div>
      ${chipRow([[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']], 'putts', h.putts)}
    </div>

    <div class="group">
      <div class="g-lab"><span class="g-num g-num-opt">·</span><span class="label">Distancia 1er putt</span><span class="small muted">opcional</span></div>
      ${chipRow([['0-3', '0–3 ft'], ['3-8', '3–8 ft'], ['8-20', '8–20 ft'], ['20+', '+20 ft']], 'dist', h.dist)}
    </div>
    </div>

    <div class="score-card">
      <div class="sc-lab"><span class="label">Score del hoyo</span><span class="small muted">${score != null ? 'auto · ajústalo' : 'completa los toques'}</span></div>
      <div class="score-row">
        <div class="sc-val">
          <span class="sc-num">${score != null ? score : '–'}</span>
          <span class="sc-rel">${score != null ? relScore(score - h.par) : ''}</span>
        </div>
        <div class="stepper">
          <button data-act="h-score" data-d="-1" ${score == null ? 'disabled' : ''}>−</button>
          <button data-act="h-score" data-d="1" ${score == null ? 'disabled' : ''}>+</button>
        </div>
      </div>
    </div>

    <div class="btn-row">
      ${a.idx > 0 ? `<button class="btn" style="flex:0 0 26%" data-act="h-prev">←</button>` : ''}
      <button class="btn primary big" data-act="h-next" ${ready ? '' : 'disabled'}>
        ${a.idx + 1 === a.holesCount ? 'Finalizar ronda ✓' : 'Siguiente hoyo →'}
      </button>
    </div>

    <div class="card" style="margin-top:18px">
      <span class="label">Tarjeta</span>
      ${scorecardTable(
        a.holesCount,
        i => (i === a.idx ? h.par : (a.holes[i] ? a.holes[i].par : parForActive(a, i))),
        [{ name: cur().name.split(' ')[0], scoreOf: i => (a.holes[i] ? a.holes[i].score : null) }],
        a.idx
      )}
    </div>
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
function vRoundDetail() {
  const r = S.rounds.find(x => x.id === V.detail);
  if (!r) return vRondaTab();
  const s = Stats.roundStats(r);
  const pct = (x, t) => (t ? Math.round((x / t) * 100) + '%' : '—');
  return `<button class="auth-back" data-act="nav" data-view="ronda">← Tus rondas</button>
    <div class="greet">
      <h1 style="font-size:26px">${esc(r.course)}</h1>
      <p class="hcp">${fmtDate(r.date)} · ${s.score} golpes (${fmtToPar(s.toPar)})</p>
    </div>
    <div class="grid2">
      ${statCard(pct(s.fw, s.fwTot), 'Fairways', s.fwTot ? (s.fw / s.fwTot) * 100 : 0)}
      ${statCard(pct(s.gir, s.girTot), 'GIR', (s.gir / s.girTot) * 100)}
      ${statCard(pct(s.scr, s.scrTot), 'Up/Down', s.scrTot ? (s.scr / s.scrTot) * 100 : 0)}
      ${statCard(String(s.putts), 'Putts', Stats.clamp(((38 - (s.putts * 18) / s.holes) / 11) * 100, 0, 100))}
    </div>
    <div class="card">
      <span class="label">Tarjeta</span>
      ${scorecard(r.holes.slice(0, 9))}
      ${r.holes.length > 9 ? scorecard(r.holes.slice(9), 9) : ''}
    </div>
    <button class="btn danger" data-act="round-delete" data-id="${r.id}">${V.delArm === r.id ? '¿Seguro? Toca otra vez para eliminar' : 'Eliminar esta ronda'}</button>`;
}
