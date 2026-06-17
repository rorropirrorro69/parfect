/* ============ Nube (Supabase): auth + respaldo de datos ============
   Capa "espejo": Supabase es la fuente de verdad en la nube, pero la app
   sigue trabajando contra S (localStorage). Al entrar, el usuario de la nube
   se vuelca a S.users/S.rounds/S.practices usando el uuid como id, así el
   resto de la app no cambia. En cada commit() se sube (debounced).

   Si PARFECT_CONFIG está vacío → Cloud.enabled() === false y la app corre
   100% local, exactamente como antes. */

const Cloud = (() => {
  const cfg = (typeof window !== 'undefined' && window.PARFECT_CONFIG) || {};
  const ON = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
                typeof window !== 'undefined' && window.supabase && window.supabase.createClient);

  let sb = null;
  if (ON) {
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }

  let currentUid = null;   // uid de la sesión en la nube (null si local-only)
  let hydrated = false;    // ya bajamos datos al menos una vez esta sesión
  let pushTimer = null;

  const enabled = () => ON;
  const safeRender = () => { try { render(); } catch (e) {} };

  /* ---- mapeos nube <-> local ---- */
  const CORE = ['id', 'name', 'email', 'hcp', 'goal', 'pass', 'cloud'];

  function extraOf(u) {
    const extra = {};
    for (const k in u) if (!CORE.includes(k)) extra[k] = u[k];
    return extra;
  }

  function toLocalUser(authUser, prof) {
    const extra = (prof && prof.extra) || {};
    return {
      id: authUser.id,
      email: authUser.email || (prof && prof.email) || '',
      name: (prof && prof.name) || extra.name || 'Jugador',
      hcp: prof ? prof.hcp : 18,
      goal: prof ? prof.goal : 13,
      ...extra,
      onboarded: extra.onboarded != null ? extra.onboarded : true,
      cloud: true,
    };
  }

  const roundToRow = (r, uid) => ({
    id: r.id, user_id: uid,
    course_id: r.courseId || null, course: r.course || null,
    date: r.date || null, holes: r.holes || [],
    caption: r.caption || null, party_id: r.partyId || null,
  });
  const rowToRound = (row) => ({
    id: row.id, userId: row.user_id,
    courseId: row.course_id || undefined, course: row.course || '',
    date: row.date, holes: row.holes || [],
    caption: row.caption || '',
  });

  const practiceToRow = (p, uid) => ({
    id: p.id, user_id: uid, date: p.date || null,
    area: p.area || null, drill: p.drill || null,
    attempts: p.attempts || 0, hits: p.hits || 0, notes: p.notes || null,
  });
  const rowToPractice = (row) => ({
    id: row.id, userId: row.user_id, date: row.date,
    area: row.area || '', drill: row.drill || '',
    attempts: row.attempts || 0, hits: row.hits || 0, notes: row.notes || '',
  });

  /* ---- local helpers ---- */
  function upsertLocalUser(u) {
    const i = S.users.findIndex(x => x.id === u.id);
    if (i >= 0) S.users[i] = { ...S.users[i], ...u }; else S.users.push(u);
  }

  function ensureLocalUser(authUser) {
    if (!S.users.find(x => x.id === authUser.id)) {
      upsertLocalUser({ id: authUser.id, email: authUser.email || '', name: 'Jugador', hcp: 18, goal: 13, onboarded: true, cloud: true });
    }
  }

  /* ---- traer todo del usuario a S (refresca; nunca borra si falla la red) ---- */
  async function hydrate(authUser) {
    const uid = authUser.id;
    const [pr, rr, pp] = await Promise.all([
      sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
      sb.from('rounds').select('*').eq('user_id', uid),
      sb.from('practices').select('*').eq('user_id', uid),
    ]);
    if (pr.error || rr.error || pp.error) throw (pr.error || rr.error || pp.error);

    upsertLocalUser(toLocalUser(authUser, pr.data));
    S.rounds = S.rounds.filter(r => r.userId !== uid).concat((rr.data || []).map(rowToRound));
    S.practices = S.practices.filter(p => p.userId !== uid).concat((pp.data || []).map(rowToPractice));
    S.session = uid;
    currentUid = uid;
    hydrated = true;
    Store.save(S);
  }

  /* ---- subir el snapshot del usuario actual (upsert; sin borrados aquí) ---- */
  async function push() {
    if (!ON || !currentUid || currentUid !== S.session || !hydrated) return;
    const uid = S.session;
    const u = S.users.find(x => x.id === uid);
    if (!u) return;
    try {
      await sb.from('profiles').upsert({
        id: uid, name: u.name || 'Jugador',
        hcp: u.hcp != null ? u.hcp : 18, goal: u.goal != null ? u.goal : 13,
        email: u.email || null, extra: extraOf(u),
      });
      const rs = S.rounds.filter(r => r.userId === uid).map(r => roundToRow(r, uid));
      if (rs.length) await sb.from('rounds').upsert(rs);
      const ps = S.practices.filter(p => p.userId === uid).map(p => practiceToRow(p, uid));
      if (ps.length) await sb.from('practices').upsert(ps);
    } catch (e) { /* offline: localStorage manda, reintenta en el próximo commit/boot */ }
  }

  function pushSoon() {
    if (!ON || !currentUid) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 1200);
  }

  /* ---- borrados explícitos (los engancha app.js en sus puntos de borrado) ---- */
  async function remove(table, id) {
    if (!ON || !currentUid) return;
    try { await sb.from(table).delete().eq('id', id).eq('user_id', currentUid); } catch (e) {}
  }
  async function wipeMine() {
    if (!ON || !currentUid) return;
    try {
      await sb.from('rounds').delete().eq('user_id', currentUid);
      await sb.from('practices').delete().eq('user_id', currentUid);
    } catch (e) {}
  }

  /* ---- errores de auth en español ---- */
  function mapErr(error) {
    const m = (error && error.message || '').toLowerCase();
    if (m.includes('invalid login')) return 'Email o contraseña incorrectos.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese email.';
    if (m.includes('email not confirmed')) return 'Confirma tu correo antes de entrar (revisa tu bandeja).';
    if (m.includes('password')) return 'La contraseña no cumple los requisitos.';
    if (m.includes('network') || m.includes('fetch')) return 'Sin conexión. Revisa tu internet e inténtalo otra vez.';
    return (error && error.message) || 'No se pudo completar. Inténtalo de nuevo.';
  }

  /* ---- API pública usada por app.js ---- */
  async function signIn(email, pass) {
    if (!ON) return { ok: false, msg: 'Nube no configurada.' };
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return { ok: false, msg: mapErr(error) };
    try { await hydrate(data.user); } catch (e) { ensureLocalUser(data.user); S.session = data.user.id; currentUid = data.user.id; hydrated = true; }
    return { ok: true };
  }

  async function signUp({ name, email, pass, hcp, goal, demo }) {
    if (!ON) return { ok: false, msg: 'Nube no configurada.' };
    const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { name } } });
    if (error) return { ok: false, msg: mapErr(error) };
    if (!data.session) return { ok: true, needsConfirm: true }; // proyecto pide confirmar email
    const uid = data.user.id;
    currentUid = uid; hydrated = true; S.session = uid;
    upsertLocalUser({ id: uid, email, name, hcp, goal, onboarded: !!demo, cloud: true });
    if (demo && typeof Demo !== 'undefined') {
      S.rounds.push(...Demo.realRounds(uid, 8));
      S.practices.push(...Demo.practices(uid));
    }
    Store.save(S);
    await push(); // crea profile (hcp/goal/extra) + sube demo
    return { ok: true };
  }

  async function signOut() {
    currentUid = null; hydrated = false;
    if (ON) { try { await sb.auth.signOut(); } catch (e) {} }
  }

  /* ---- al arrancar: restaura sesión cacheada (funciona offline) y refresca ---- */
  async function restore() {
    if (!ON) return;
    try {
      const { data } = await sb.auth.getSession();
      const session = data && data.session;
      if (session && session.user) {
        currentUid = session.user.id;
        S.session = session.user.id;
        ensureLocalUser(session.user); // muestra la app ya con datos locales
        safeRender();
        try { await hydrate(session.user); safeRender(); } catch (e) { hydrated = true; }
      }
      sb.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') { currentUid = null; hydrated = false; }
      });
    } catch (e) {}
  }

  return { enabled, restore, signIn, signUp, signOut, pushSoon, push, remove, wipeMine };
})();
