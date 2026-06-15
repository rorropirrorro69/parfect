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
  if (cont) {
    html += `<button class="row" data-act="resume-round">
      <div class="r-main"><b>Ronda en curso · ${esc(S.active.course)}</b><span>Vas en el hoyo ${S.active.idx + 1} de ${S.active.holesCount}</span></div>
      <div class="r-side"><b>→</b><span>continuar</span></div>
    </button>`;
  }
  if (!rounds.length) {
    html += `<div class="card empty"><div class="e-ico">🏌️</div><h3>Sin rondas todavía</h3><p>Tu primera ronda toma menos de 10 minutos en capturarse — 4 toques por hoyo.</p></div>`;
  } else {
    html += rounds.map(r => {
      const s = Stats.roundStats(r);
      return `<button class="row" data-act="round-detail" data-id="${r.id}">
        <div class="r-main"><b>${esc(r.course)}${r.partyId ? ' 🎉' : ''}</b><span>${fmtDate(r.date)} · ${s.holes} hoyos · ${s.putts} putts</span></div>
        <div class="r-side"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
      </button>`;
    }).join('');
  }
  return html;
}

/* ---------- Setup de ronda ---------- */
function vSetup() {
  const cid = V.setupCourseId;
  const n = V.setupHoles || 18;
  const sname = id => COURSES[id].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '');
  return `<div class="sec-h"><h2>Nueva ronda</h2></div>
    <div class="card">
      <div class="field" style="margin-top:0"><label>Campo</label>
        <div class="chips">
          ${COURSE_ORDER.map(id => `<button class="chip ${cid === id ? 'on' : ''}" data-act="setup-pick-course" data-c="${id}">${esc(sname(id))}</button>`).join('')}
          <button class="chip ${!cid ? 'on' : ''}" data-act="setup-pick-course" data-c="">Otro</button>
        </div>
      </div>
      ${cid
        ? `<p class="note" style="margin-top:8px">${esc(COURSES[cid].name)} · ${COURSES[cid].holes.length} hoyos · <b class="lime">pares reales del campo</b>.</p>`
        : `<div class="field"><label>Nombre del campo</label><input id="r-course" placeholder="Nombre del campo" value="${esc(V.setupCourse || '')}"></div>
           <div class="field"><label>Hoyos</label>
             <div class="chips">
               <button class="chip ${n === 9 ? 'on' : ''}" data-act="setup-holes" data-n="9">9 hoyos</button>
               <button class="chip ${n === 18 ? 'on' : ''}" data-act="setup-holes" data-n="18">18 hoyos</button>
             </div>
           </div>
           <p class="note">El par de cada hoyo se ajusta durante la captura.</p>`}
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

/* posiciones de los tiros registrados, para animar el hoyo (consciente del score) */
function captureShots(h, score) {
  const shots = [];
  const par = h.par;
  const putts = h.putts != null ? h.putts : 2;
  const full = (score != null ? Math.max(1, score - putts) : (par === 3 ? 1 : par === 5 ? 3 : 2));
  const missed = !!(h.app && h.app !== 'gir');
  const chip = missed && full >= 2 ? 1 : 0;          // un tiro alrededor del green si falló
  const advance = Math.max(par === 3 ? 0 : 1, full - 1 - chip); // tiros de avance (incluye salida)
  for (let i = 0; i < advance; i++) {
    const prog = advance <= 1 ? 0.48 : 0.34 + i * (0.5 / (advance - 1)); // 0.34 → 0.84
    let side = 0, ok = true, lie = 'fw';
    if (i === 0 && par >= 4 && h.tee) {
      side = h.tee === 'izq' ? -0.62 : h.tee === 'der' ? 0.62 : h.tee === 'penal' ? -0.82 : 0;
      ok = h.tee === 'fw'; lie = h.tee === 'penal' ? 'water' : (ok ? 'fw' : 'rough');
    }
    shots.push({ prog, side, ok, lie });
  }
  if (h.app === 'gir') shots.push({ prog: 1, side: 0, ok: true, lie: 'green' });
  else if (h.app) {
    const side = h.app === 'izq' ? -0.6 : h.app === 'der' ? 0.6 : 0;
    const prog = h.app === 'largo' ? 1.13 : h.app === 'corto' ? 0.82 : 1;   // largo = se pasa del green
    shots.push({ prog, side, ok: false, lie: 'rough' });
    if (chip) shots.push({ prog: 0.99, side: 0.1, ok: h.upDown === true, lie: 'green' });
  }
  for (let i = 0; i < putts; i++) shots.push({ prog: 1, side: (i % 2 ? 0.06 : -0.06), ok: true, lie: 'green' });
  return shots;
}
function captureSchematic(h, score) {
  const shots = captureShots(h, score);
  const W = 300, H = 232, cx = 150, teeY = 200, greenY = 40, span = teeY - greenY, halfW = 68;
  const P = s => ({ x: cx + s.side * halfW, y: teeY - Math.min(1.15, s.prog) * span });
  const pts = shots.map(P);
  const route = `M${cx},${teeY} ` + pts.map(q => `L${q.x.toFixed(0)},${q.y.toFixed(0)}`).join(' ');
  const colOf = s => s.ok ? '#c9f73e' : (s.lie === 'water' ? '#ff7a6b' : '#ff9f43');
  let zones = '', dots = '';
  shots.forEach((s, i) => { if (s.lie === 'green') return; const q = pts[i], c = colOf(s), rx = s.ok ? 14 : 20; zones += `<ellipse cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" rx="${rx}" ry="${(rx * 0.7).toFixed(0)}" fill="${c}" opacity="0.16" stroke="${c}" stroke-width="1.5" stroke-dasharray="4 4"/>`; });
  pts.forEach((q, i) => { dots += `<circle cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" r="4" fill="${colOf(shots[i])}"/>`; });
  let ball = '';
  if (pts.length) {
    const allP = [{ x: cx, y: teeY }, ...pts], seg = []; let tot = 0;
    for (let i = 1; i < allP.length; i++) { const l = Math.hypot(allP[i].x - allP[i - 1].x, allP[i].y - allP[i - 1].y); seg.push(l); tot += l || 1; }
    const nf = [0]; { let aa = 0; for (const l of seg) { aa += l; nf.push(aa / tot); } }
    const ev = [{ p: 0, d: 0 }]; for (let i = 1; i < nf.length; i++) { ev.push({ p: nf[i], d: 1 }); if (i < nf.length - 1) ev.push({ p: nf[i], d: 0.5 }); } ev.push({ p: 1, d: 1 });
    const TT = ev.reduce((a, e) => a + e.d, 0); let ac = 0; const kp = [], kt = []; ev.forEach(e => { ac += e.d; kp.push(e.p.toFixed(3)); kt.push((ac / TT).toFixed(3)); });
    const dur = (0.8 + (nf.length - 1) * 0.9).toFixed(1);
    ball = `<circle r="6" fill="#fff" stroke="#0a0f08" stroke-width="1"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${route}" keyPoints="${kp.join(';')}" keyTimes="${kt.join(';')}" calcMode="linear"/></circle>`;
  }
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tiros del hoyo">
    <rect width="${W}" height="${H}" rx="14" fill="#0a0f08" stroke="#1d2914"/>
    <rect x="${cx - halfW - 4}" y="${greenY - 6}" width="${(halfW + 4) * 2}" height="${teeY - greenY + 14}" rx="${halfW}" fill="#2f6b39"/>
    <rect x="${cx - halfW + 16}" y="${greenY + 10}" width="${(halfW - 16) * 2}" height="${teeY - greenY - 6}" rx="${halfW - 16}" fill="#3a8043" opacity="0.55"/>
    <ellipse cx="${cx}" cy="${greenY}" rx="40" ry="22" fill="#57b15c" stroke="#2f6b39" stroke-width="2"/>
    <circle cx="${cx}" cy="${greenY}" r="3" fill="#0a0f08"/>
    <line x1="${cx}" y1="${greenY}" x2="${cx}" y2="${greenY - 22}" stroke="#eef3e6" stroke-width="2"/><path d="M${cx},${greenY - 22} l11,3 -11,3z" fill="#c9f73e"/>
    ${zones}
    <path d="${route}" fill="none" stroke="#c9f73e" stroke-width="2" stroke-dasharray="3 5"/>
    ${dots}${ball}
    <rect x="${cx - 9}" y="${teeY}" width="18" height="6" rx="2" fill="#9ab07f"/>
  </svg>`;
}

function vPlay() {
  const a = S.active;
  if (!a) return vRondaTab();
  if (a.idx >= a.holesCount) return vSummary(a);
  const h = V.hole;
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
      <span class="hof">Par ${h.par}</span>
    </div>

    <div class="card" style="padding:10px">
      ${captureSchematic(h, score)}
      <p class="note" style="text-align:center;margin:6px 0 0">${sl.length ? esc(sl.join('  ·  ')) : 'Registra tu hoyo y míralo tiro por tiro.'}</p>
    </div>

    <div class="group">
      <div class="g-lab"><span class="label">Par del hoyo</span></div>
      ${chipRow([[3, 'Par 3'], [4, 'Par 4'], [5, 'Par 5']], 'par', h.par)}
    </div>

    ${h.par !== 3 ? `<div class="group">
      <div class="g-lab"><span class="label">1 · Salida</span></div>
      ${chipRow([['fw', 'Fairway'], ['izq', '← Izq'], ['der', 'Der →'], ['penal', 'Penal']], 'tee', h.tee)}
    </div>` : ''}

    <div class="group">
      <div class="g-lab"><span class="label">2 · Approach</span></div>
      ${chipRow([['gir', 'GIR ✓'], ['corto', 'Corto'], ['largo', 'Largo'], ['izq', '← Izq'], ['der', 'Der →']], 'app', h.app)}
    </div>

    ${h.app && h.app !== 'gir' ? `<div class="group">
      <div class="g-lab"><span class="label">3 · Alrededor del green</span><span class="small muted">¿Up & down?</span></div>
      ${chipRow([['si', 'Salvé el par'], ['no', 'No lo salvé']], 'upDown', h.upDown === true ? 'si' : h.upDown === false ? 'no' : null)}
    </div>` : ''}

    <div class="group">
      <div class="g-lab"><span class="label">4 · Putts</span></div>
      ${chipRow([[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']], 'putts', h.putts)}
    </div>

    <div class="group">
      <div class="g-lab"><span class="label">Distancia 1er putt</span><span class="small muted">opcional</span></div>
      ${chipRow([['0-3', '0–3 ft'], ['3-8', '3–8 ft'], ['8-20', '8–20 ft'], ['20+', '+20 ft']], 'dist', h.dist)}
    </div>

    <div class="group">
      <div class="g-lab"><span class="label">Score del hoyo</span><span class="small muted">${score != null ? 'auto · ajústalo si hace falta' : 'completa los toques'}</span></div>
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
      ${a.idx > 0 ? `<button class="btn" style="flex:0 0 30%" data-act="h-prev">←</button>` : ''}
      <button class="btn primary" data-act="h-next" ${ready ? '' : 'disabled'}>
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
