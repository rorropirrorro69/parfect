/* ============ Portal de Coach real (Supabase) ============
   Relación alumno↔coach con consentimiento (coach_students) y notas privadas
   (coach_notes). Un coach con relación ACTIVA puede leer las rondas de su alumno
   (acceso consentido por RLS). Activo solo con Cloud.enabled(). */
const Coach = (() => {
  const on = () => (typeof Cloud !== 'undefined' && Cloud.enabled());
  const sb = () => (typeof Cloud !== 'undefined' && Cloud.client) ? Cloud.client() : null;
  const myId = () => (typeof S !== 'undefined' ? S.session : null);
  const safeRender = () => { try { render(); } catch (e) {} };

  let links = [];        // relaciones que me involucran, con `other` (perfil de la otra parte)
  let coaches = [];      // directorio de coaches (public_profiles is_coach)
  let loaded = false, loading = false, lastLoad = 0;
  const notesCache = {};   // 'coachId|studentId' -> [notas]
  const roundsCache = {};  // studentId -> [rondas]

  const pairKey = (coachId, studentId) => coachId + '|' + studentId;

  function state() { return { links, coaches, loaded, loading }; }
  function myCoaches() { return links.filter(l => !l.iAmCoach && l.status === 'active'); }
  function myStudents() { return links.filter(l => l.iAmCoach && l.status === 'active'); }
  function incomingRequests() { return links.filter(l => l.status === 'pending' && l.requested_by !== myId()); }
  function outgoingRequests() { return links.filter(l => l.status === 'pending' && l.requested_by === myId()); }
  function linkWith(otherId) { return links.find(l => l.otherId === otherId); }

  async function load(force) {
    const c = sb(); if (!on() || !c || loading) return;
    if (loaded && !force) return;
    loading = true;
    try {
      const uid = myId();
      const { data: rows } = await c.from('coach_students').select('*').or(`coach_id.eq.${uid},student_id.eq.${uid}`);
      const list = rows || [];
      const otherIds = [...new Set(list.map(r => r.coach_id === uid ? r.student_id : r.coach_id))];
      const people = {};
      if (otherIds.length) { const { data: pp } = await c.from('public_profiles').select('*').in('id', otherIds); (pp || []).forEach(p => { people[p.id] = p; }); }
      links = list.map(r => {
        const otherId = r.coach_id === uid ? r.student_id : r.coach_id;
        return { ...r, iAmCoach: r.coach_id === uid, otherId, other: people[otherId] || { id: otherId, name: 'Jugador', avatar: 0, hcp: null } };
      });
      const { data: cd } = await c.from('public_profiles').select('*').eq('is_coach', true);
      coaches = (cd || []).filter(p => p.id !== uid);
      loaded = true; lastLoad = Date.now();
    } catch (e) { /* offline */ }
    loading = false;
    safeRender();
  }

  function ensure() {
    if (!on() || loading) return;
    if (!loaded) { load(false); return; }
    if (Date.now() - lastLoad > 60000) load(true);
  }

  /* ---- relación ---- */
  async function request(coachId, studentId) {
    const c = sb(); if (!on() || !c) return { ok: false };
    const { error } = await c.from('coach_students').insert({ coach_id: coachId, student_id: studentId, status: 'pending', requested_by: myId() });
    if (error) return { ok: false, msg: 'No se pudo enviar la solicitud.' };
    await load(true); return { ok: true };
  }
  async function accept(coachId, studentId) {
    const c = sb(); if (!on() || !c) return;
    try { await c.from('coach_students').update({ status: 'active' }).eq('coach_id', coachId).eq('student_id', studentId); await load(true); } catch (e) {}
  }
  async function remove(coachId, studentId) {
    const c = sb(); if (!on() || !c) return;
    try { await c.from('coach_students').delete().eq('coach_id', coachId).eq('student_id', studentId); await load(true); } catch (e) {}
  }

  /* ---- notas (por par coach|alumno) ---- */
  function notesFor(coachId, studentId) { return notesCache[pairKey(coachId, studentId)] || null; }
  async function loadNotes(coachId, studentId) {
    const c = sb(); if (!on() || !c) return;
    try {
      const { data } = await c.from('coach_notes').select('*').eq('coach_id', coachId).eq('student_id', studentId).order('created_at', { ascending: false });
      notesCache[pairKey(coachId, studentId)] = data || [];
      safeRender();
    } catch (e) {}
  }
  async function addNote(studentId, text) {
    const c = sb(); if (!on() || !c) return { ok: false };
    const t = (text || '').trim(); if (!t) return { ok: false };
    const uid = myId();
    const { error } = await c.from('coach_notes').insert({ id: 'n_' + Store.uid(), coach_id: uid, student_id: studentId, text: t });
    if (error) return { ok: false, msg: 'No se pudo enviar (¿la relación sigue activa?).' };
    await loadNotes(uid, studentId);
    return { ok: true };
  }
  async function deleteNote(coachId, studentId, noteId) {
    const c = sb(); if (!on() || !c) return;
    try { await c.from('coach_notes').delete().eq('id', noteId); await loadNotes(coachId, studentId); } catch (e) {}
  }

  /* ---- rondas del alumno (acceso consentido) → stats ---- */
  function studentRounds(studentId) { return roundsCache[studentId] || null; }
  async function loadStudentRounds(studentId) {
    const c = sb(); if (!on() || !c) return;
    try {
      const { data } = await c.from('rounds').select('*').eq('user_id', studentId);
      roundsCache[studentId] = (data || []).map(row => ({
        id: row.id, userId: row.user_id, course: row.course || '',
        courseId: row.course_id || undefined, date: row.date, holes: row.holes || [],
      }));
      safeRender();
    } catch (e) {}
  }

  return {
    on, state, ensure, load,
    myCoaches, myStudents, incomingRequests, outgoingRequests, linkWith,
    request, accept, remove,
    notesFor, loadNotes, addNote, deleteNote,
    studentRounds, loadStudentRounds,
  };
})();
