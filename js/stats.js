/* ============ Metrics engine: per-round + aggregate + radar + benchmarks ============ */

const Stats = (() => {
  const PAR_SEQ = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5];
  const DIST_BANDS = ['0-2', '2-5', '5-10', '10+'];

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sum = arr => arr.reduce((a, x) => a + x, 0);
  const scale = (v, lo, hi) => clamp(((v - lo) / (hi - lo)) * 100, 4, 100);

  function roundStats(round) {
    const h = round.holes;
    const par = sum(h.map(x => x.par));
    const score = sum(h.map(x => x.score));
    const teeHoles = h.filter(x => x.tee);
    const fw = teeHoles.filter(x => x.tee === 'fw').length;
    const gir = h.filter(x => x.app === 'gir').length;
    const putts = sum(h.map(x => x.putts));
    const missG = h.filter(x => x.app && x.app !== 'gir');
    const scr = missG.filter(x => x.score <= x.par).length;
    const threeP = h.filter(x => x.putts >= 3).length;
    const penals = h.filter(x => x.tee === 'penal').length;
    return {
      holes: h.length, par, score, toPar: score - par,
      fw, fwTot: teeHoles.length,
      gir, girTot: h.length,
      putts, threeP, penals,
      scr, scrTot: missG.length,
    };
  }

  function aggregate(rounds) {
    if (!rounds || !rounds.length) return null;
    const rs = rounds.map(roundStats);
    const holes = rounds.flatMap(r => r.holes);
    const f = (a, b) => (b > 0 ? (a / b) * 100 : 0);

    const fwTot = sum(rs.map(r => r.fwTot));
    const girTot = sum(rs.map(r => r.girTot));
    const scrTot = sum(rs.map(r => r.scrTot));

    // normalize per-18 so 9-hole rounds compare
    const per18 = rs.map(r => ({ score: (r.score * 18) / r.holes, toPar: (r.toPar * 18) / r.holes, putts: (r.putts * 18) / r.holes, penals: (r.penals * 18) / r.holes }));

    const sorted = rounds.map((r, i) => ({ r, s: rs[i] }))
      .sort((a, b) => a.r.date.localeCompare(b.r.date));
    const series = sorted.map(x => Math.round((x.s.toPar * 18) / x.s.holes));

    const missTee = { izq: 0, der: 0, penal: 0 };
    const missApp = { corto: 0, largo: 0, izq: 0, der: 0 };
    for (const h of holes) {
      if (h.tee && h.tee !== 'fw') missTee[h.tee] = (missTee[h.tee] || 0) + 1;
      if (h.app && h.app !== 'gir') missApp[h.app] = (missApp[h.app] || 0) + 1;
    }

    const puttsByDist = {};
    for (const band of DIST_BANDS) puttsByDist[band] = { n: 0, one: 0, three: 0 };
    for (const h of holes) {
      if (h.dist && puttsByDist[h.dist]) {
        const b = puttsByDist[h.dist];
        b.n++;
        if (h.putts <= 1) b.one++;
        if (h.putts >= 3) b.three++;
      }
    }

    const girHoles = holes.filter(h => h.app === 'gir');
    const puttsPerGir = girHoles.length ? sum(girHoles.map(h => h.putts)) / girHoles.length : 0;

    const avgToPar = sum(per18.map(p => p.toPar)) / per18.length;
    const sd = Math.sqrt(sum(per18.map(p => (p.toPar - avgToPar) ** 2)) / per18.length);

    const full = rs.filter(r => r.holes === 18);

    return {
      rounds: rounds.length,
      holesPlayed: holes.length,
      fwPct: f(sum(rs.map(r => r.fw)), fwTot),
      girPct: f(sum(rs.map(r => r.gir)), girTot),
      scrPct: f(sum(rs.map(r => r.scr)), scrTot),
      putts18: sum(per18.map(p => p.putts)) / per18.length,
      threePct: f(sum(rs.map(r => r.threeP)), sum(rs.map(r => r.girTot))),
      penals18: sum(per18.map(p => p.penals)) / per18.length,
      avgScore18: sum(per18.map(p => p.score)) / per18.length,
      avgToPar,
      bestScore: full.length ? Math.min(...full.map(r => r.score)) : null,
      bestToPar: Math.min(...rs.map(r => Math.round((r.toPar * 18) / r.holes))),
      consistency: sd,
      series,
      missTee, missApp, puttsByDist, puttsPerGir,
    };
  }

  /* Radar: 6 ejes 0–100 contra rangos amateur→élite */
  function radarOf(agg) {
    const labels = ['Driving', 'GIR%', 'Scramb.', 'Putting', 'Prox.', 'Consist.'];
    if (!agg) return { labels, values: [5, 5, 5, 5, 5, 5] };
    const values = [
      scale(agg.fwPct, 30, 75),
      scale(agg.girPct, 12, 68),
      scale(agg.scrPct, 15, 65),
      scale(38 - agg.putts18, 0, 11),          // 38 putts → 0, 27 → 100
      scale(2.35 - agg.puttsPerGir, 0, 0.75),  // 2.35 ppGIR → 0, 1.6 → 100
      scale(13 - agg.consistency, 1, 11),      // sd 12 → ~0, sd 2 → 100
    ];
    return { labels, values: values.map(v => Math.round(v)) };
  }

  /* Benchmarks por hándicap (aprox. tour de datos amateur) */
  function benchFor(hcp) {
    const h = clamp(Number(hcp) || 0, -3, 28);
    return {
      hcp: h,
      fwPct: clamp(60 - 0.65 * h, 35, 65),
      girPct: clamp(64 - 2.1 * h, 8, 70),
      scrPct: clamp(58 - 1.8 * h, 12, 62),
      putts18: clamp(29.5 + 0.25 * h, 28, 37),
      threePct: clamp(4 + 0.55 * h, 2, 22),
    };
  }

  return { PAR_SEQ, DIST_BANDS, roundStats, aggregate, radarOf, benchFor, clamp };
})();
