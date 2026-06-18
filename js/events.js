/* ============ Eventos reales (Supabase): events + event_rsvp ============
   Activo SOLO con Cloud.enabled(). Tablón comunitario: cualquier usuario con
   sesión ve los eventos próximos; cada quien confirma SU lugar (self-RSVP).
   El anfitrión crea/borra su evento y queda 'going' automáticamente.
   Si la nube está apagada, el módulo no se usa y los eventos siguen locales. */
const Events = (() => {
  const on = () => (typeof Cloud !== 'undefined' && Cloud.enabled());
  const sb = () => (typeof Cloud !== 'undefined' && Cloud.client) ? Cloud.client() : null;
  const myId = () => (typeof S !== 'undefined' ? S.session : null);
  const safeRender = () => { try { render(); } catch (e) {} };

  let events = [];
  let loaded = false, loading = false, lastLoad = 0;

  function state() { return { events, loaded, loading }; }

  async function load(force) {
    const c = sb();
    if (!on() || !c || loading) return;
    if (loaded && !force) return;
    loading = true;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: rows, error } = await c.from('events')
        .select('*').gte('date', today).order('date', { ascending: true }).limit(50);
      if (error) throw error;
      const list = rows || [];
      const ids = list.map(e => e.id);
      const hostIds = list.map(e => e.host_user_id);
      let rsvpRows = [];
      if (ids.length) {
        const { data: rv } = await c.from('event_rsvp').select('event_id,user_id,status').in('event_id', ids);
        rsvpRows = rv || [];
      }
      // perfiles de anfitriones + de quienes confirmaron (para nombre/avatar)
      const wantIds = [...new Set(hostIds.concat(rsvpRows.map(r => r.user_id)))];
      const people = {};
      if (wantIds.length) {
        const { data: profs } = await c.from('public_profiles').select('*').in('id', wantIds);
        (profs || []).forEach(p => { people[p.id] = p; });
      }
      events = list.map(e => {
        const mine = rsvpRows.filter(r => r.event_id === e.id);
        const going = mine.filter(r => r.status === 'going').map(r => people[r.user_id] || { name: 'Jugador', avatar: 0 });
        const myRsvp = mine.find(r => r.user_id === myId());
        return {
          ...e,
          host: people[e.host_user_id] || { name: 'Jugador', avatar: 0 },
          goingPeople: going,
          goingCount: going.length,
          myStatus: myRsvp ? myRsvp.status : null,
          mine: e.host_user_id === myId(),
        };
      });
      loaded = true; lastLoad = Date.now();
    } catch (e) { /* offline: conserva cache */ }
    loading = false;
    safeRender();
  }

  function ensure() {
    if (!on() || loading) return;
    if (!loaded) { load(false); return; }
    if (Date.now() - lastLoad > 60000) load(true);
  }

  /* Confirmar / quitar mi lugar. Tocar el mismo estado = lo quita (toggle). */
  async function setRsvp(eventId, status) {
    const c = sb(); if (!on() || !c) return;
    const ev = events.find(e => e.id === eventId); if (!ev) return;
    const prev = ev.myStatus;
    ev.myStatus = (status === prev) ? null : status; // optimista
    safeRender();
    try {
      if (ev.myStatus === null) await c.from('event_rsvp').delete().eq('event_id', eventId).eq('user_id', myId());
      else await c.from('event_rsvp').upsert({ event_id: eventId, user_id: myId(), status: ev.myStatus });
      await load(true);
    } catch (e) { ev.myStatus = prev; safeRender(); }
  }

  async function createEvent(d) {
    const c = sb(); if (!on() || !c) return { ok: false, msg: 'Nube no disponible.' };
    const uid = myId(); if (!uid) return { ok: false, msg: 'Sesión no lista.' };
    const id = 'e_' + Store.uid();
    const ins = await c.from('events').insert({ id, host_user_id: uid, name: d.name, course_id: d.courseId, date: d.date, time: d.time, mode: d.mode });
    if (ins.error) return { ok: false, msg: 'No se pudo crear el evento.' };
    try { await c.from('event_rsvp').insert({ event_id: id, user_id: uid, status: 'going' }); } catch (e) {} // anfitrión va
    await load(true);
    return { ok: true };
  }

  async function deleteEvent(eventId) {
    const c = sb(); if (!on() || !c) return;
    events = events.filter(e => e.id !== eventId); // optimista
    safeRender();
    try { await c.from('events').delete().eq('id', eventId); await load(true); } catch (e) {}
  }

  return { on, state, ensure, load, setRsvp, createEvent, deleteEvent };
})();
