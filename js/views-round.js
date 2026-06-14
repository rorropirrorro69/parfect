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
  html += `<button class="btn primary" data-act="go-setup">${logoMark(15)} Nueva ronda</button>`;
  if (!rounds.length) {
    html += `<div class="card empty"><div class="e-ico">🏌️</div><h3>Sin rondas todavía</h3><p>Tu primera ronda toma menos de 10 minutos en capturarse — 4 toques por hoyo.</p></div>`;
  } else {
    html += rounds.map(r => {
      const s = Stats.roundStats(r);
      return `<button class="row" data-act="round-detail" data-id="${r.id}">
        <div class="r-main"><b>${esc(r.course)}</b><span>${fmtDate(r.date)} · ${s.holes} hoyos · ${s.putts} putts</span></div>
        <div class="r-side"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
      </button>`;
    }).join('');
  }
  return html;
}

/* ---------- Setup de ronda ---------- */
function vSetup() {
  const recent = [...new Set(myRounds().map(r => r.course))].slice(0, 3);
  const n = V.setupHoles || 18;
  return `<div class="sec-h"><h2>Nueva ronda</h2></div>
    <div class="card">
      <div class="field" style="margin-top:0"><label>Campo</label>
        <input id="r-course" placeholder="Nombre del campo" value="${esc(V.setupCourse || '')}">
      </div>
      ${recent.length ? `<div class="chips" style="margin-top:10px">${recent.map(c =>
        `<button class="chip sm" data-act="setup-course" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
      <div class="field"><label>Hoyos</label>
        <div class="chips">
          <button class="chip ${n === 9 ? 'on' : ''}" data-act="setup-holes" data-n="9">9 hoyos</button>
          <button class="chip ${n === 18 ? 'on' : ''}" data-act="setup-holes" data-n="18">18 hoyos</button>
        </div>
      </div>
      <p class="note">El par de cada hoyo se ajusta durante la captura (secuencia estándar par 72 por defecto).</p>
    </div>
    <button class="btn primary" data-act="start-round">Comenzar ronda →</button>
    <button class="btn" data-act="nav" data-view="ronda">Cancelar</button>`;
}

/* ---------- Captura de hoyo ---------- */
function chipRow(items, key, current) {
  return `<div class="chips">` + items.map(([v, label]) =>
    `<button class="chip ${String(current) === String(v) ? 'on' : ''}" data-act="h-set" data-k="${key}" data-v="${v}">${label}</button>`
  ).join('') + `</div>`;
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
      ${chipRow([['0-2', '0–2 m'], ['2-5', '2–5 m'], ['5-10', '5–10 m'], ['10+', '+10 m']], 'dist', h.dist)}
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
        i => (i === a.idx ? h.par : (a.holes[i] ? a.holes[i].par : Stats.PAR_SEQ[i % 18])),
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
