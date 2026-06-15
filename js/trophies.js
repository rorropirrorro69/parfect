/* ============ Trofeos: logros y metas, calculados del perfil del jugador ============ */

const Trophies = (() => {

  function context() {
    const rounds = myRounds();
    const rs = rounds.map(Stats.roundStats);
    const agg = Stats.aggregate(rounds);
    const practices = myPractices();
    const u = cur();
    const myParties = S.parties.filter(p => p.status === 'done' && p.players.some(pl => pl.userId === u.id));
    const partiesWon = myParties.filter(p => {
      const isMine = pid => (p.players.find(pl => pl.pid === pid) || {}).userId === u.id;
      if (p.games && p.games.match) {
        const ms = Party.matchStatus(p);
        return ms && ms.leaderWon > ms.runnerWon && isMine(ms.leader);
      }
      const st = Party.standings(p).filter(r => r.holes);
      if (!st.length || (st[1] && st[1].toPar === st[0].toPar)) return false;
      return isMine(st[0].pid);
    }).length;

    const anyHole = fn => rounds.some(r => r.holes.some(fn));
    const bestNorm = rs.length ? Math.min(...rs.map(r => (r.score * 18) / r.holes)) : null;
    const maxFw = rs.reduce((m, r) => Math.max(m, r.fwTot ? (r.fw / r.fwTot) * 100 : 0), 0);
    const maxGir = rs.reduce((m, r) => Math.max(m, r.girTot ? (r.gir / r.girTot) * 100 : 0), 0);
    const minPutts = rs.length ? Math.min(...rs.map(r => (r.putts * 18) / r.holes)) : null;
    const maxUd = rs.reduce((m, r) => Math.max(m, r.scrTot ? (r.scr / r.scrTot) * 100 : 0), 0);

    return {
      u, agg, n: rounds.length, np: practices.length,
      birdie: anyHole(h => h.score - h.par === -1),
      eagle: anyHole(h => h.score - h.par <= -2),
      bestNorm, maxFw, maxGir, minPutts, maxUd,
      bajoPar: rs.some(r => r.toPar <= 0),
      perfectDrill: practices.some(p => p.attempts > 0 && p.hits >= p.attempts),
      partiesPlayed: myParties.length, partiesWon,
    };
  }

  const count = (have, need, sub) => ({ done: have >= need, prog: Math.min(1, have / need), sub: sub || `${Math.min(have, need)}/${need}` });
  const flag = (ok, sub) => ({ done: ok, prog: ok ? 1 : 0, sub: sub || '' });

  const LIST = [
    { id: 'first', ic: '⛳', t: 'Primera ronda', d: 'Registra tu primera ronda', test: c => count(c.n, 1) },
    { id: 'r5', ic: '📋', t: 'Constante', d: 'Registra 5 rondas', test: c => count(c.n, 5) },
    { id: 'r25', ic: '🏌️', t: 'Veterano', d: 'Registra 25 rondas', test: c => count(c.n, 25) },
    { id: 'birdie', ic: '🐦', t: 'Primer birdie', d: 'Haz tu primer birdie', test: c => flag(c.birdie) },
    { id: 'eagle', ic: '🦅', t: 'Caza águilas', d: 'Haz un eagle o mejor', test: c => flag(c.eagle) },
    { id: 'b90', ic: '9️⃣', t: 'Rompe 90', d: 'Termina 18 hoyos bajo 90', test: c => flag(c.bestNorm != null && c.bestNorm < 90, c.bestNorm != null ? `mejor ${Math.round(c.bestNorm)}` : '—') },
    { id: 'b80', ic: '8️⃣', t: 'Rompe 80', d: 'Termina 18 hoyos bajo 80', test: c => flag(c.bestNorm != null && c.bestNorm < 80, c.bestNorm != null ? `mejor ${Math.round(c.bestNorm)}` : '—') },
    { id: 'par', ic: '🎯', t: 'Bajo par', d: 'Termina una ronda en par o menos', test: c => flag(c.bajoPar) },
    { id: 'fw', ic: '🛣️', t: 'Pegador', d: '60%+ de calles en una ronda', test: c => flag(c.maxFw >= 60, `mejor ${Math.round(c.maxFw)}%`) },
    { id: 'gir', ic: '🟢', t: 'Francotirador', d: '55%+ de greens en una ronda', test: c => flag(c.maxGir >= 55, `mejor ${Math.round(c.maxGir)}%`) },
    { id: 'putt', ic: '🥅', t: 'Putt frío', d: '30 o menos putts en una ronda', test: c => flag(c.minPutts != null && c.minPutts <= 30, c.minPutts != null ? `mejor ${Math.round(c.minPutts)}` : '—') },
    { id: 'ud', ic: '✋', t: 'Manos mágicas', d: '60%+ de up/down en una ronda', test: c => flag(c.maxUd >= 60, `mejor ${Math.round(c.maxUd)}%`) },
    { id: 'prac', ic: '🛠️', t: 'Practicón', d: 'Registra 10 prácticas', test: c => count(c.np, 10) },
    { id: 'drill', ic: '💯', t: 'Drill perfecto', d: 'Completa un drill al 100%', test: c => flag(c.perfectDrill) },
    { id: 'party', ic: '🎉', t: 'Fiestero', d: 'Juega 3 parties', test: c => count(c.partiesPlayed, 3) },
    { id: 'champ', ic: '🏆', t: 'Campeón', d: 'Gana una party', test: c => count(c.partiesWon, 1) },
    { id: 'meta', ic: '🚀', t: 'Meta cumplida', d: 'Llega a tu hándicap meta', test: c => flag(c.u && c.u.hcp <= c.u.goal, c.u ? `HCP ${fmtHcp(c.u.hcp)} · meta ${fmtHcp(c.u.goal)}` : '') },
  ];

  function evaluate() {
    const c = context();
    return LIST.map(a => ({ ...a, ...a.test(c) }));
  }

  /* Metas de temporada: progreso hacia el hándicap meta y sus referencias */
  function goals() {
    const u = cur();
    const agg = Stats.aggregate(myRounds());
    const b = Stats.benchFor(u.goal);
    const mk = (label, cur, target, lower, suffix) => {
      if (cur == null) return { label, cur: null, target, suffix };
      const prog = lower ? Stats.clamp(target / Math.max(cur, 0.01), 0, 1) : Stats.clamp(cur / target, 0, 1);
      const met = lower ? cur <= target : cur >= target;
      return { label, cur, target, suffix: suffix || '', prog: met ? 1 : prog, met };
    };
    return [
      mk('Hándicap', u.hcp, u.goal, true, ''),
      mk('Calles', agg ? agg.fwPct : null, b.fwPct, false, '%'),
      mk('Greens (GIR)', agg ? agg.girPct : null, b.girPct, false, '%'),
      mk('Up/Down', agg ? agg.scrPct : null, b.scrPct, false, '%'),
      mk('Putts/ronda', agg ? agg.putts18 : null, b.putts18, true, ''),
    ];
  }

  return { evaluate, goals };
})();
