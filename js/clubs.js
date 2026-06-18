/* ============ Clubes (B2B) · sincronización con Supabase ============
   Capa "espejo" y NO destructiva sobre S.clubs (local-first):
   - pushSoon(club): sube el club (miembros, torneos, academia) a la nube.
   - pull(): trae los clubes donde eres miembro y los MEZCLA en S.clubs
     (nunca borra clubes que solo existen local).
   Si las tablas aún no existen o no hay nube, se auto-desactiva en silencio
   (avail=false) y la app sigue 100% local. Requiere migración 05_clubs.sql. */
const Clubs = (() => {
  let avail = true;   // se apaga si las tablas no existen / sin acceso
  let pulled = false;
  let timer = null;

  function sb() { return (typeof Cloud !== 'undefined' && Cloud.enabled() && Cloud.client) ? Cloud.client() : null; }
  function uid() { return (typeof Cloud !== 'undefined' && Cloud.uid && Cloud.uid()) || (typeof S !== 'undefined' && S.session) || null; }
  const on = () => !!(sb() && avail);

  async function pushClub(c) {
    const db = sb(); if (!db || !avail || !c) return;
    try {
      let r = await db.from('clubs').upsert({ id: c.id, name: c.name, code: c.code, owner_id: String(c.ownerId || uid() || '') });
      if (r.error) throw r.error;
      const ms = (c.members || []).map(m => ({ club_id: c.id, user_id: String(m.userId), name: m.name, role: m.role, hcp: m.hcp != null ? m.hcp : null, category: m.category || null, consent: m.consent || null }));
      if (ms.length) { r = await db.from('club_members').upsert(ms, { onConflict: 'club_id,user_id' }); if (r.error) throw r.error; }
      for (const t of (c.tournaments || [])) {
        r = await db.from('tournaments').upsert({ id: t.id, club_id: c.id, name: t.name, date: t.date || null, holes: t.holes, par: t.par, format: t.format || 'stroke', status: t.status || 'live' });
        if (r.error) throw r.error;
        const ps = (t.players || []).map(p => ({ tournament_id: t.id, club_id: c.id, user_id: String(p.userId), name: p.name, hcp: p.hcp != null ? p.hcp : null, role: p.role || null, category: p.category || null, gross: p.gross != null ? p.gross : null }));
        if (ps.length) { r = await db.from('tournament_players').upsert(ps, { onConflict: 'tournament_id,user_id' }); if (r.error) throw r.error; }
      }
      const ac = c.academy || {};
      const rows = Object.keys(ac).map(jid => ({ club_id: c.id, junior_id: String(jid), plan: ac[jid].plan || [], done: ac[jid].done || {} }));
      if (rows.length) { r = await db.from('academy_plans').upsert(rows, { onConflict: 'club_id,junior_id' }); if (r.error) throw r.error; }
    } catch (e) { avail = false; }
  }
  function pushSoon(c) { if (!on() || !c) return; const club = c; clearTimeout(timer); timer = setTimeout(() => pushClub(club), 1000); }

  async function pull(force) {
    const db = sb(); if (!db || !avail || (pulled && !force)) return;
    const me = uid(); if (!me) return;
    try {
      const mem = await db.from('club_members').select('club_id').eq('user_id', String(me));
      if (mem.error) throw mem.error;
      const ids = [...new Set((mem.data || []).map(r => r.club_id))];
      pulled = true;
      if (!ids.length) return;
      const [cl, ms, tn, tp, ac] = await Promise.all([
        db.from('clubs').select('*').in('id', ids),
        db.from('club_members').select('*').in('club_id', ids),
        db.from('tournaments').select('*').in('club_id', ids),
        db.from('tournament_players').select('*').in('club_id', ids),
        db.from('academy_plans').select('*').in('club_id', ids),
      ]);
      if (cl.error || ms.error || tn.error || tp.error || ac.error) throw (cl.error || ms.error || tn.error || tp.error || ac.error);
      const byClub = {};
      (cl.data || []).forEach(c => byClub[c.id] = { id: c.id, name: c.name, code: c.code, ownerId: c.owner_id, createdAt: c.created_at, members: [], tournaments: [], academy: {} });
      (ms.data || []).forEach(m => { const c = byClub[m.club_id]; if (c) c.members.push({ userId: m.user_id, name: m.name, role: m.role, hcp: m.hcp, category: m.category || undefined, consent: m.consent || undefined }); });
      const tById = {};
      (tn.data || []).forEach(t => { const c = byClub[t.club_id]; if (c) { const o = { id: t.id, name: t.name, date: t.date, holes: t.holes, par: t.par, format: t.format, status: t.status, players: [] }; c.tournaments.push(o); tById[t.id] = o; } });
      (tp.data || []).forEach(p => { const o = tById[p.tournament_id]; if (o) o.players.push({ userId: p.user_id, name: p.name, hcp: p.hcp, role: p.role || undefined, category: p.category || undefined, gross: p.gross }); });
      (ac.data || []).forEach(a => { const c = byClub[a.club_id]; if (c) c.academy[a.junior_id] = { plan: a.plan || [], done: a.done || {} }; });
      // MERGE no destructivo: la nube sobrescribe los clubes que coinciden por id; los locales-only se conservan
      S.clubs = S.clubs || [];
      const map = {}; S.clubs.forEach(c => map[c.id] = c);
      Object.values(byClub).forEach(cc => { map[cc.id] = cc; });
      S.clubs = Object.values(map);
      Store.save(S);
      try { render(); } catch (e) {}
    } catch (e) { avail = false; }
  }

  return { on, pull, pushClub, pushSoon, reset() { pulled = false; } };
})();
