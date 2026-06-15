/* ============ Vista Trofeos: metas + logros ============ */

function vTrophies() {
  const u = cur();
  const list = Trophies.evaluate();
  const unlocked = list.filter(a => a.done).length;
  const goals = Trophies.goals();
  const fmtG = (v, suffix) => (v == null ? '—' : (suffix === '%' ? Math.round(v) + '%' : (Number.isInteger(v) ? v : v.toFixed(1))));

  const goalRows = goals.map(g => {
    const pct = Math.round((g.prog || 0) * 100);
    return `<div class="goal">
      <div class="goal-top">
        <span>${esc(g.label)}</span>
        <span class="${g.met ? 'lime' : 'muted'}">${fmtG(g.cur, g.suffix)} <span class="muted">/ meta ${fmtG(g.target, g.suffix)}</span></span>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }).join('');

  const cards = list.map(a => `<div class="trophy ${a.done ? 'on' : ''}">
    <div class="t-ic">${a.ic}</div>
    <div class="t-body">
      <b>${esc(a.t)}</b>
      <span>${esc(a.d)}</span>
      ${!a.done && a.prog > 0 && a.prog < 1 ? `<div class="bar mini"><i style="width:${Math.round(a.prog * 100)}%"></i></div>` : ''}
      ${a.sub ? `<span class="t-sub">${esc(a.sub)}</span>` : ''}
    </div>
    <div class="t-state">${a.done ? '✓' : ''}</div>
  </div>`).join('');

  return `<div class="sec-h"><h2>Trofeos</h2><span class="small muted">${unlocked}/${list.length} logros</span></div>

    <div class="card">
      <span class="label">Tus metas</span>
      <p class="note" style="margin-top:0;margin-bottom:10px">Tu progreso hacia un hándicap de ${fmtHcp(u.goal)}.</p>
      ${goalRows}
    </div>

    <div class="sec-h"><h2 style="font-size:18px">Logros</h2></div>
    <div class="trophy-grid">${cards}</div>
    ${unlocked === 0 ? `<p class="note">Registra rondas y prácticas para empezar a desbloquear logros.</p>` : ''}
  `;
}
