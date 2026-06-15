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

/* tiros de campo (sin putts) — se construyen SOLO con lo que ya registraste */
function captureShots(h) {
  const shots = [];
  const par = h.par;
  if (par >= 4 && h.tee) {
    const side = h.tee === 'izq' ? -0.62 : h.tee === 'der' ? 0.62 : h.tee === 'penal' ? -0.82 : 0;
    const ok = h.tee === 'fw';
    shots.push({ role: 'tee', prog: par === 5 ? 0.33 : 0.5, side, ok, lie: h.tee === 'penal' ? 'water' : (ok ? 'fw' : 'rough') });
  }
  if (h.app) {
    if (par === 5 && h.tee) shots.push({ role: 'advance', prog: 0.72, side: 0, ok: true, lie: 'fw' });
    if (h.app === 'gir') shots.push({ role: 'approach', prog: 1, side: 0, ok: true, lie: 'green' });
    else {
      const side = h.app === 'izq' ? -0.6 : h.app === 'der' ? 0.6 : 0;
      const prog = h.app === 'largo' ? 1.13 : h.app === 'corto' ? 0.82 : 1;
      shots.push({ role: 'approach', prog, side, ok: false, lie: 'rough' });
      if (h.upDown != null) shots.push({ role: 'chip', prog: 0.99, side: 0.1, ok: h.upDown === true, lie: 'green', ud: true });
    }
  }
  return shots;
}
/* un solo color para los tiros (lima); rojo solo para penal/agua */
function shotColor(s) {
  if (s && s.lie === 'water') return '#ff7a6b';
  return '#c9f73e';
}
function captureSchematic(h, chole, noZoom, clean) {
  const shots = captureShots(h);
  const dog = (chole && chole.dog) || 'straight';
  const par3 = (chole ? chole.par : h.par) === 3;
  const W = 300, H = 296, tee = [150, 266];
  const green = dog === 'left' ? [104, 52] : dog === 'right' ? [196, 52] : [150, 50];
  const ctrl = par3 ? [150, 165] : (dog === 'left' ? [198, 158] : dog === 'right' ? [102, 158] : [150, 158]);
  const gx = green[0], gy = green[1], halfW = 50;
  const fair = `M${tee[0]},${tee[1]} Q ${ctrl[0]},${ctrl[1]} ${gx},${gy}`;
  // green real del hoyo (forma + bunkers + pin) si el campo lo trae (Altozano)
  const G = (chole && chole.g) || null;
  let gw = 33, gh = 23;
  if (G) {
    if (G.sh === 'wide') { gw = 40; gh = 19; }
    else if (G.sh === 'tall') { gw = 27; gh = 28; }
    const sc = Math.max(0.85, Math.min(1.16, G.d / 33));
    gw = Math.min(42, gw * sc * 0.94); gh = Math.min(29, gh * sc);
  }
  const pf = G ? G.pf : 0.5, px = G ? G.px : 0;
  const pin = { x: gx + px * gw * 0.55, y: gy + (0.5 - pf) * gh * 1.5 };
  // peligros del campo (agua/arena, sin etiquetas). Con green real, los bunkers del green los pone G.bk
  const haz = ((chole && chole.risks) || []).filter(r => !G || r.at === 'drive' || r.kind === 'water').map(r => {
    let rx, ry;
    if (r.at === 'drive') { rx = bez(0.5, tee[0], ctrl[0], gx) + (r.side === 'left' ? -40 : 40); ry = bez(0.5, tee[1], ctrl[1], gy); }
    else { rx = gx + (r.side === 'left' ? -44 : 44); ry = gy + 10; }
    const water = r.kind === 'water';
    return `<ellipse cx="${rx.toFixed(0)}" cy="${ry.toFixed(0)}" rx="${water ? 22 : 16}" ry="${water ? 13 : 9}" fill="${water ? 'url(#g3dWater)' : 'url(#g3dSand)'}"/>`;
  }).join('');
  // bunkers alrededor del green (posición relativa al green, según hoja de banderas)
  const BPOS = { fl: [-0.72, 0.85], fr: [0.72, 0.85], f: [0, 1.06], l: [-1.04, 0.05], r: [1.04, 0.05], bl: [-0.72, -0.8], br: [0.72, -0.8], b: [0, -0.95] };
  const bunkers = (G ? G.bk : []).map(code => {
    const o = BPOS[code]; if (!o) return '';
    const bx = (gx + o[0] * gw).toFixed(0), by = gy + o[1] * gh;
    return `<ellipse cx="${bx}" cy="${(by + 2).toFixed(0)}" rx="13" ry="8.6" fill="#16401c" opacity="0.24"/><ellipse cx="${bx}" cy="${by.toFixed(0)}" rx="12" ry="7.6" fill="url(#g3dSand)"/>`;
  }).join('');
  // árbol estilizado 3D (copa + tronco + sombra)
  const tree = (x, y, s) => `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><ellipse cx="0" cy="4" rx="10" ry="3.2" fill="#16401c" opacity="0.32"/><rect x="-2.2" y="-5" width="4.4" height="11" rx="1.6" fill="#6b4a2a"/><circle cx="0" cy="-13" r="11.5" fill="#39863a"/><circle cx="-7" cy="-8" r="8.5" fill="#479a44"/><circle cx="7" cy="-9" r="8.5" fill="#479a44"/><circle cx="-3" cy="-17" r="7.5" fill="#57ad50"/><circle cx="4" cy="-15" r="6.5" fill="#57ad50"/></g>`;
  let trees = '';
  for (let i = 0; i < 6; i++) { const ty = 252 - i * 40; const s = 0.42 + (ty / 296) * 0.72; trees += tree(20, ty, s) + tree(280, ty, s); }
  // campo con profundidad (cielo lejano arriba, pasto que aclara al frente, árboles a los lados)
  const green3d = `${haz}${bunkers}
    <ellipse cx="${gx}" cy="${(gy + 5).toFixed(0)}" rx="${(gw + 1).toFixed(0)}" ry="${(gh + 1).toFixed(0)}" fill="#16401c" opacity="0.3"/>
    <ellipse cx="${gx}" cy="${gy}" rx="${gw.toFixed(0)}" ry="${gh.toFixed(0)}" fill="#54ad58" stroke="#2f7a38" stroke-width="2"/>
    <ellipse cx="${(gx - gw * 0.26).toFixed(0)}" cy="${(gy - gh * 0.28).toFixed(0)}" rx="${(gw * 0.44).toFixed(0)}" ry="${(gh * 0.34).toFixed(0)}" fill="#79c970" opacity="0.55"/>
    <circle cx="${pin.x.toFixed(0)}" cy="${pin.y.toFixed(0)}" r="4.6" fill="#08260f"/>
    <line x1="${pin.x.toFixed(0)}" y1="${pin.y.toFixed(0)}" x2="${pin.x.toFixed(0)}" y2="${(pin.y - 24).toFixed(0)}" stroke="#ffffff" stroke-width="2"/><path d="M${pin.x.toFixed(0)},${(pin.y - 24).toFixed(0)} l12,3.6 -12,3.6z" fill="#c9f73e"/>
    <rect x="${tee[0] - 9}" y="${tee[1]}" width="18" height="6" rx="2" fill="#caa15e"/>`;
  const field = `<rect width="${W}" height="${H}" fill="url(#g3dGrass)"/>
    <rect width="${W}" height="72" fill="url(#g3dHorizon)"/>
    ${trees}
    <path d="${fair}" fill="none" stroke="#347029" stroke-width="${par3 ? 52 : 70}" stroke-linecap="round" opacity="0.45"/>
    <path d="${fair}" fill="none" stroke="#86c860" stroke-width="${par3 ? 44 : 60}" stroke-linecap="round"/>
    <path d="${fair}" fill="none" stroke="#a6dd78" stroke-width="${par3 ? 24 : 34}" stroke-linecap="round" opacity="0.55"/>
    ${green3d}`;
  // historial (clean): campo + línea de regulación (sin trazo de tiros)
  if (clean) {
    return `<div class="cap"><svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Hoyo">
      <g clip-path="url(#capClip)">${field}
      <path d="${fair}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="2 7" stroke-linecap="round" opacity="0.92"/></g>
      <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="rgba(20,50,15,0.18)"/>
    </svg></div>`;
  }
  const P = s => {
    const t = Math.min(1, s.prog);
    let x = bez(t, tee[0], ctrl[0], gx), y = bez(t, tee[1], ctrl[1], gy);
    if (s.prog > 1) y = Math.max(16, gy - 24 - (s.prog - 1) * 90);   // "largo": claramente pasado el green (arriba)
    return { x: x + s.side * halfW, y };
  };
  const fpts = shots.map(P);
  const nPutts = h.putts != null ? h.putts : 0;
  const dyOf = { '0-3': 16, '3-8': 26, '8-20': 40, '20+': 56 };
  const lagDy = nPutts > 0 ? (dyOf[h.dist] != null ? dyOf[h.dist] : 28) : 0;
  let lagIdx = -1, lag = { x: pin.x, y: pin.y };
  if (nPutts > 0) {
    lagIdx = shots.findIndex(s => s.lie === 'green');
    lag = { x: pin.x + 2, y: pin.y + lagDy };
    if (lagIdx >= 0) fpts[lagIdx] = { x: lag.x, y: lag.y };
  }
  const pputts = [];
  for (let i = 0; i < nPutts; i++) { const f = (i + 1) / nPutts; pputts.push({ x: lag.x + (pin.x - lag.x) * f, y: lag.y + (pin.y - lag.y) * f }); }
  const pts = [...fpts, ...pputts];
  const lagNode = lagIdx >= 0 ? lagIdx + 1 : (nPutts > 0 ? fpts.length + 1 : -1);
  const seq = shots.concat(Array.from({ length: nPutts }, () => ({ role: 'putt', ok: true })));
  const route = `M${tee[0]},${tee[1]} ` + pts.map(q => `L${q.x.toFixed(0)},${q.y.toFixed(0)}`).join(' ');
  let dots = '';
  pts.forEach((q, i) => { const c = shotColor(seq[i]); dots += `<circle cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" r="3.8" fill="${c}" stroke="#16301a" stroke-width="0.7"/>`; });
  let ball = '', vbAnim = '';
  if (pts.length) {
    const allP = [{ x: tee[0], y: tee[1] }, ...pts], seg = []; let tot = 0;
    for (let i = 1; i < allP.length; i++) { const l = Math.hypot(allP[i].x - allP[i - 1].x, allP[i].y - allP[i - 1].y); seg.push(l); tot += l || 1; }
    const nf = [0]; { let aa = 0; for (const l of seg) { aa += l; nf.push(aa / tot); } }
    const ev = [{ p: 0, d: 0, node: 0 }];
    for (let i = 1; i < nf.length; i++) { ev.push({ p: nf[i], d: 1, node: i }); if (i < nf.length - 1) ev.push({ p: nf[i], d: 0.5 }); }
    ev.push({ p: 1, d: 1 });
    const TT = ev.reduce((a, e) => a + e.d, 0); let ac = 0; const kp = [], kt = []; const nodeT = {};
    ev.forEach(e => { ac += e.d; const t = ac / TT; kp.push(e.p.toFixed(3)); kt.push(t.toFixed(3)); if (e.node != null) nodeT[e.node] = t; });
    const dur = Math.min(9, 1.2 + (nf.length - 1) * 1.25).toFixed(1);
    ball = `<circle r="4.8" fill="url(#g3dBall)" stroke="#16301a" stroke-width="0.8" style="filter:drop-shadow(0 2.5px 1.6px rgba(0,0,0,.4))"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${route}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></circle>`;
    if (!noZoom && nPutts > 0 && lagNode >= 0) {
      const bw = 178, bh = 176;
      const bx = Math.max(0, Math.min(W - bw, gx - bw / 2)).toFixed(0);
      const by = Math.max(0, Math.min(H - bh, gy + lagDy / 2 - bh / 2)).toFixed(0);
      const box = `${bx} ${by} ${bw} ${bh}`;
      const tA = nodeT[lagNode] != null ? nodeT[lagNode] : 0.55;
      let k = [0, Math.max(0.05, tA - 0.03), Math.min(0.9, tA + 0.06), 0.96, 1];
      for (let i = 1; i < k.length; i++) if (k[i] <= k[i - 1]) k[i] = Math.min(1, k[i - 1] + 0.005);
      const vals = `0 0 ${W} ${H};0 0 ${W} ${H};${box};${box};0 0 ${W} ${H}`;
      vbAnim = `<animate attributeName="viewBox" dur="${dur}s" repeatCount="indefinite" values="${vals}" keyTimes="${k.map(x => x.toFixed(3)).join(';')}" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"/>`;
    }
  }
  return `<div class="cap"><svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Vuelo de la bola">
    ${vbAnim}
    <g clip-path="url(#capClip)">
    ${field}
    <path d="${route}" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-dasharray="3 5" stroke-linecap="round" opacity="0.9"/>
    ${dots}${ball}
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
  const ready = h.app && h.putts != null && (h.par === 3 || h.tee);

  const sl = [];
  if (h.par >= 4 && h.tee) sl.push(h.tee === 'fw' ? 'Fairway ✓' : h.tee === 'penal' ? 'OB/Penal' : h.tee === 'izq' ? 'Salida izq' : 'Salida der');
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
      <div class="g-lab"><span class="g-num">1</span><span class="label">Salida</span>${h.tee ? '<span class="g-ok">✓</span>' : ''}</div>
      ${chipRow([['fw', '🏌 Fairway'], ['izq', '← Izq'], ['der', 'Der →'], ['penal', 'Penal']], 'tee', h.tee)}
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
  return `<div class="shell no-nav fade-in">
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
