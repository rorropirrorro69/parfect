/* ============ Analítica de PARFECT (eventos a Supabase) ============
   Registra eventos clave (app_open, signup, round_saved, party_round) para medir
   usuarios, rondas, activos y retención. Solo el dueño puede leerlos (RLS).
   No-op si la nube no está configurada o si la tabla `events` aún no existe. */
const Analytics = (() => {
  const TBL = 'analytics_events';
  const client = () => (typeof Cloud !== 'undefined' && Cloud.enabled() && typeof Cloud.client === 'function') ? Cloud.client() : null;

  function track(name, props) {
    const c = client(); if (!c || !name) return;
    try {
      const uid = (typeof Cloud.uid === 'function' && Cloud.uid()) || null;
      const row = { user_id: uid, name, props: props || {} };
      const r = c.from(TBL).insert(row);
      if (r && typeof r.then === 'function') r.then(() => {}, () => {});   // silencioso (tabla puede no existir aún)
    } catch (e) {}
  }

  /* resumen para el dashboard del dueño (RLS deja leer solo a André) */
  async function summary(days) {
    const c = client(); if (!c) return { error: 'nube no configurada' };
    days = days || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    try {
      const evP = c.from(TBL).select('name,user_id,created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(8000);
      const usrP = c.from('public_profiles').select('id', { count: 'exact', head: true });
      const [ev, usr] = await Promise.all([evP, usrP]);
      if (ev.error) return { error: ev.error.message || 'sin acceso (¿corriste la migración 06_analytics.sql?)' };
      return { events: ev.data || [], users: (usr && usr.count) || 0 };
    } catch (e) { return { error: e.message || String(e) }; }
  }

  return { track, summary };
})();
