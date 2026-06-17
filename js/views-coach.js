/* ============ Parfect Coach: portal de clubes (alumno ↔ coach) ============ */

function clubInit() { S.club = S.club || { classes: [], notes: [] }; return S.club; }

/* Alumnos del club: cuentas reales en el dispositivo + alumnos demo del club */
const COACH_DEMO_STUDENTS = [
  { id: 'st_ana', name: 'Ana Rivera', hcp: 24 },
  { id: 'st_luis', name: 'Luis Méndez', hcp: 16 },
  { id: 'st_sofia', name: 'Sofía Cano', hcp: 12 },
  { id: 'st_diego', name: 'Diego Torres', hcp: 30 },
  { id: 'st_caro', name: 'Caro Ruiz', hcp: 8 },
];
function clubStudents() {
  const me = cur();
  const accts = S.users.filter(u => !me || u.id !== me.id).map(u => ({ id: u.id, name: u.name, hcp: u.hcp, account: true }));
  return accts.concat(COACH_DEMO_STUDENTS);
}
function studentStats(st) {
  if (st.account) {
    const agg = Stats.aggregate(S.rounds.filter(r => r.userId === st.id));
    if (agg) return { fw: Math.round(agg.fwPct), gir: Math.round(agg.girPct), ud: Math.round(agg.scrPct), putts: Math.round(agg.putts18), rounds: agg.rounds };
  }
  const b = Stats.benchFor(st.hcp);
  const seed = [...st.name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const j = (n, amt) => Math.round(n + ((seed % 7) - 3) * amt);
  return { fw: j(b.fwPct, 1), gir: j(b.girPct, 1), ud: j(b.scrPct, 1), putts: Math.round(b.putts18), rounds: 5 + (seed % 8) };
}
function studentClasses(id) { return clubInit().classes.filter(c => c.studentId === id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)); }
function studentNotes(id) { return clubInit().notes.filter(n => n.studentId === id).sort((a, b) => b.date.localeCompare(a.date)); }

/* ---------- Vista principal ---------- */
function vCoach() {
  const u = cur();
  const isCoach = !!u.isCoach;
  return `<div class="cz-top">
      <p class="note" style="margin:6px 0 12px">${isCoach ? 'Modo coach activo. Gestiona a tus alumnos: stats, clases y comentarios.' : 'Tus clases y comentarios de tu coach. Si eres entrenador, activa el modo coach en tu perfil.'}</p>
    </div>
    ${isCoach ? vCoachPanel(u) : vStudentPanel(u)}`;
}

/* ---------- Vista ALUMNO ---------- */
function vStudentPanel(u) {
  const real = studentClasses(u.id);
  const notes = studentNotes(u.id);
  // ejemplos ilustrativos si aún no tienes nada de tu coach
  const sample = real.length ? real : [
    { coach: 'Coach Hugo', date: addDays(today(), 2), time: '09:00', title: 'Clase de wedges (50–90 m)', demo: true },
    { coach: 'Coach Hugo', date: addDays(today(), 6), time: '17:30', title: 'Putting: lag y cortos', demo: true },
  ];
  const sNotes = notes.length ? notes : [
    { coach: 'Coach Hugo', date: today(), text: 'Buen avance en el green. Esta semana enfócate en el primer putt: déjala a 1 m.', demo: true },
  ];
  const clsCards = sample.map(c => `<div class="cz-class ${c.demo ? 'demo' : ''}">
    <div class="cz-date"><b>${czDay(c.date)}</b><span>${czMon(c.date)}</span></div>
    <div class="cz-cinfo"><b>${esc(c.title)}</b><span>${esc(c.time)} · ${esc(c.coach)}${c.demo ? ' · ejemplo' : ''}</span></div>
    <span class="cz-cgo">${golfIcon('flag')}</span>
  </div>`).join('');
  const noteCards = sNotes.map(n => `<div class="cz-note ${n.demo ? 'demo' : ''}">
    <div class="cz-navatar">${initials(n.coach)}</div>
    <div class="cz-ntx"><b>${esc(n.coach)} <i>${fmtDate(n.date)}</i></b><p>${esc(n.text)}</p></div>
  </div>`).join('');
  return `<div class="card cz-coachcard">
      <div class="cz-cc-ic">${golfIcon('medal')}</div>
      <div><b>Coach Hugo Beltrán</b><span>Club Campestre Morelia · PGA México</span></div>
    </div>
    <div class="sec-h" style="margin-top:20px"><h2 style="font-size:16px">${golfIcon('flag')} Próximas clases</h2></div>
    <div class="cz-classes">${clsCards}</div>
    <div class="sec-h" style="margin-top:20px"><h2 style="font-size:16px">${golfIcon('card')} Comentarios del profe</h2></div>
    <div class="cz-notes">${noteCards}</div>
    ${!real.length ? `<p class="note" style="margin-top:10px">Cuando tu coach use el modo entrenador, sus clases y comentarios aparecerán aquí.</p>` : ''}`;
}

/* ---------- Vista COACH ---------- */
function vCoachPanel(u) {
  const students = clubStudents();
  const sel = V.coachStudent && students.find(s => s.id === V.coachStudent);
  if (sel) return vCoachStudent(sel);
  const rows = students.map(st => {
    const s = studentStats(st);
    return `<button class="cz-srow" data-act="coach-pick" data-id="${esc(st.id)}">
      <span class="cz-sav">${initials(st.name)}</span>
      <div class="cz-sinfo"><b>${esc(st.name)}</b><span>HCP ${fmtHcp(st.hcp)} · ${s.rounds} rondas${st.account ? ' · cuenta' : ''}</span></div>
      <div class="cz-smini"><span>GIR<b>${s.gir}%</b></span><span>Putts<b>${s.putts}</b></span></div>
      <span class="cz-sgo">→</span>
    </button>`;
  }).join('');
  return `<div class="sec-h" style="margin-top:4px"><h2 style="font-size:16px">${golfIcon('flag')} Tus alumnos</h2><span class="small muted">${students.length}</span></div>
    <div class="cz-roster">${rows}</div>`;
}

function vCoachStudent(st) {
  const s = studentStats(st);
  const b = Stats.benchFor(st.hcp);
  const cls = studentClasses(st.id);
  const notes = studentNotes(st.id);
  const stat = (lab, val, target, lower) => {
    const ok = lower ? val <= target : val >= target;
    return `<div class="cz-stat ${ok ? 'ok' : ''}"><span>${lab}</span><b>${val}${lab === 'Putts' ? '' : '%'}</b><i>meta ${target}${lab === 'Putts' ? '' : '%'}</i></div>`;
  };
  const clsList = cls.length ? cls.map(c => `<div class="cz-class"><div class="cz-date"><b>${czDay(c.date)}</b><span>${czMon(c.date)}</span></div><div class="cz-cinfo"><b>${esc(c.title)}</b><span>${esc(c.time)}</span></div></div>`).join('') : `<p class="note" style="margin:0">Sin clases agendadas.</p>`;
  const noteList = notes.length ? notes.map(n => `<div class="cz-note"><div class="cz-navatar">${initials(n.coach)}</div><div class="cz-ntx"><b>${esc(n.coach)} <i>${fmtDate(n.date)}</i></b><p>${esc(n.text)}</p></div></div>`).join('') : `<p class="note" style="margin:0">Aún no le dejas comentarios.</p>`;
  return `<button class="auth-back" data-act="coach-back">← Alumnos</button>
    <div class="card cz-coachcard">
      <div class="cz-cc-ic">${initials(st.name)}</div>
      <div><b>${esc(st.name)}</b><span>HCP ${fmtHcp(st.hcp)} · ${s.rounds} rondas</span></div>
    </div>
    <div class="sec-h" style="margin-top:16px"><h2 style="font-size:15px">Sus stats vs su nivel</h2></div>
    <div class="cz-stats">
      ${stat('Fairways', s.fw, Math.round(b.fwPct), false)}
      ${stat('GIR', s.gir, Math.round(b.girPct), false)}
      ${stat('Up&D', s.ud, Math.round(b.scrPct), false)}
      ${stat('Putts', s.putts, Math.round(b.putts18), true)}
    </div>
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:15px">${golfIcon('flag')} Agendar clase</h2></div>
    <div class="card">
      <div class="field"><label>Tema de la clase</label><input id="cz-ctitle" placeholder="Ej. Wedges 50–90 m"></div>
      <div class="cz-form2">
        <div class="field"><label>Fecha</label><input id="cz-cdate" type="date" value="${addDays(today(), 1)}"></div>
        <div class="field"><label>Hora</label><input id="cz-ctime" type="time" value="09:00"></div>
      </div>
      <button class="btn primary" data-act="coach-add-class" data-id="${esc(st.id)}">Agendar clase</button>
    </div>
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:15px">${golfIcon('card')} Dejar comentario</h2></div>
    <div class="card">
      <div class="field"><label>Comentario para ${esc(st.name.split(' ')[0])}</label><textarea id="cz-note" rows="2" placeholder="Qué trabajar esta semana…"></textarea></div>
      <button class="btn primary" data-act="coach-add-note" data-id="${esc(st.id)}">Enviar comentario</button>
    </div>
    <div class="sec-h" style="margin-top:18px"><h2 style="font-size:15px">Clases agendadas</h2></div>
    <div class="cz-classes">${clsList}</div>
    <div class="sec-h" style="margin-top:16px"><h2 style="font-size:15px">Comentarios</h2></div>
    <div class="cz-notes">${noteList}</div>`;
}

/* helpers de fecha cortos */
function addDays(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function czDay(iso) { return iso.slice(8, 10); }
function czMon(iso) { return ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][Number(iso.slice(5, 7)) - 1] || ''; }
