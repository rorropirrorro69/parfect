/* ============ Feed social real (Supabase): posts, likes, comentarios ============
   Activo SOLO con Cloud.enabled(). Cachea los posts en memoria y re-renderiza.
   Nunca lee las rondas privadas de otros: cada post trae su propio snapshot
   (curso/score/stats/hoyos), así el feed se pinta leyendo solo la tabla `posts`.
   Si la nube está apagada, esta capa no se usa y el feed sigue en modo demo. */
const Feed = (() => {
  const on = () => (typeof Cloud !== 'undefined' && Cloud.enabled());
  const sb = () => (typeof Cloud !== 'undefined' && Cloud.client) ? Cloud.client() : null;
  const myId = () => (typeof S !== 'undefined' ? S.session : null);
  const safeRender = () => { try { render(); } catch (e) {} };

  let posts = [];
  let loaded = false, loading = false, lastLoad = 0;

  function state() { return { posts, loaded, loading }; }

  async function load(force) {
    const c = sb();
    if (!on() || !c || loading) return;
    if (loaded && !force) return;
    loading = true;
    try {
      const { data: rows, error } = await c.from('posts')
        .select('*').order('created_at', { ascending: false }).limit(60);
      if (error) throw error;
      const list = rows || [];
      const authorIds = [...new Set(list.map(p => p.user_id))];
      const postIds = list.map(p => p.id);
      const authors = {}, likeCount = {}, commentCount = {}, mineLikes = new Set();
      if (authorIds.length) {
        const { data: profs } = await c.from('public_profiles').select('*').in('id', authorIds);
        (profs || []).forEach(p => { authors[p.id] = p; });
      }
      if (postIds.length) {
        const { data: lk } = await c.from('likes').select('post_id,user_id').in('post_id', postIds);
        (lk || []).forEach(l => { likeCount[l.post_id] = (likeCount[l.post_id] || 0) + 1; if (l.user_id === myId()) mineLikes.add(l.post_id); });
        const { data: cm } = await c.from('comments').select('post_id').in('post_id', postIds);
        (cm || []).forEach(x => { commentCount[x.post_id] = (commentCount[x.post_id] || 0) + 1; });
      }
      posts = list.map(p => ({
        ...p,
        author: authors[p.user_id] || { name: 'Jugador', avatar: 0, hcp: null },
        likeCount: likeCount[p.id] || 0,
        commentCount: commentCount[p.id] || 0,
        liked: mineLikes.has(p.id),
        mine: p.user_id === myId(),
      }));
      loaded = true; lastLoad = Date.now();
    } catch (e) { /* offline: conserva lo que haya en cache */ }
    loading = false;
    safeRender();
  }

  /* Se llama desde la vista social. Carga la 1ª vez y refresca si está viejo (>60s). */
  function ensure() {
    if (!on() || loading) return;
    if (!loaded) { load(false); return; }
    if (Date.now() - lastLoad > 60000) load(true);
  }

  async function toggleLike(postId) {
    const c = sb(); if (!on() || !c) return;
    const p = posts.find(x => x.id === postId); if (!p) return;
    const nowLiked = !p.liked;
    p.liked = nowLiked; p.likeCount += nowLiked ? 1 : -1;   // optimista
    safeRender();
    try {
      if (nowLiked) await c.from('likes').insert({ post_id: postId, user_id: myId() });
      else await c.from('likes').delete().eq('post_id', postId).eq('user_id', myId());
    } catch (e) { p.liked = !nowLiked; p.likeCount += nowLiked ? -1 : 1; safeRender(); } // revierte
  }

  /* Sube media (si hay) a Storage y crea/actualiza el post con el snapshot de la ronda.
     `upload` = { blob, type:'image'|'video', ext, mime } preparado por parfectShareMedia. */
  async function createPost(round, caption, upload) {
    const c = sb(); if (!on() || !c) return { ok: false, msg: 'Nube no disponible.' };
    const uid = myId(); if (!uid || !round) return { ok: false, msg: 'Sesión no lista.' };
    let media = null;
    if (upload && upload.blob) {
      const ext = upload.ext || (upload.type === 'video' ? 'mp4' : 'jpg');
      const path = uid + '/' + round.id + '_' + Date.now() + '.' + ext;
      const up = await c.storage.from('round-media').upload(path, upload.blob, { contentType: upload.mime, upsert: true });
      if (up.error) return { ok: false, msg: 'No se pudo subir la foto/video.' };
      const pub = c.storage.from('round-media').getPublicUrl(path);
      media = { type: upload.type, src: pub.data.publicUrl };
    } else if (round.media && round.media.src && !String(round.media.src).startsWith('data:')) {
      media = round.media; // ya era URL de Storage
    }
    const s = Stats.roundStats(round);
    const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
    const sname = cid => (cid && typeof COURSES !== 'undefined' && COURSES[cid])
      ? COURSES[cid].name.split(' · ')[0].replace('Club ', '').replace(' Morelia', '') : cid;
    const row = {
      id: 'p_' + round.id,                 // 1 post por ronda → re-compartir = upsert (sin duplicados)
      user_id: uid, round_id: round.id,
      caption: (caption || '').trim() || null, media,
      course: round.courseId ? sname(round.courseId) : (round.course || ''),
      holes_count: s.holes, score: s.score, to_par: s.toPar,
      fw: pct(s.fw, s.fwTot), gir: pct(s.gir, s.girTot), putts: s.putts,
      holes: (round.holes || []).map(h => ({ par: h.par, score: h.score })),
    };
    const { error } = await c.from('posts').upsert(row);
    if (error) return { ok: false, msg: 'No se pudo publicar.' };
    await load(true); // refresca el feed con autor/contadores consistentes
    return { ok: true, media };
  }

  /* ---- comentarios (se cargan por post, bajo demanda) ---- */
  const commentsCache = {};   // postId -> [{id,user_id,author,text,created_at,mine}]
  const commentsBusy = {};

  function comments(postId) { return commentsCache[postId] || null; }

  async function loadComments(postId) {
    const c = sb(); if (!on() || !c || commentsBusy[postId]) return;
    commentsBusy[postId] = true;
    try {
      const { data: rows } = await c.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
      const list = rows || [];
      const ids = [...new Set(list.map(x => x.user_id))];
      const people = {};
      if (ids.length) { const { data: profs } = await c.from('public_profiles').select('*').in('id', ids); (profs || []).forEach(p => { people[p.id] = p; }); }
      commentsCache[postId] = list.map(x => ({ ...x, author: people[x.user_id] || { name: 'Jugador', avatar: 0 }, mine: x.user_id === myId() }));
      const p = posts.find(x => x.id === postId); if (p) p.commentCount = list.length; // reconcilia el contador
    } catch (e) { /* offline */ }
    commentsBusy[postId] = false;
    safeRender();
  }

  async function addComment(postId, text) {
    const c = sb(); if (!on() || !c) return { ok: false };
    const t = (text || '').trim(); if (!t) return { ok: false };
    const { error } = await c.from('comments').insert({ id: 'c_' + Store.uid(), post_id: postId, user_id: myId(), text: t });
    if (error) return { ok: false, msg: 'No se pudo comentar.' };
    await loadComments(postId);
    return { ok: true };
  }

  async function deleteComment(postId, commentId) {
    const c = sb(); if (!on() || !c) return;
    try { await c.from('comments').delete().eq('id', commentId); await loadComments(postId); } catch (e) {}
  }

  return { on, state, ensure, load, toggleLike, createPost, comments, loadComments, addComment, deleteComment };
})();
