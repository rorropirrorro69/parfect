/* ============ Parfect Party: juegos de apuesta y cuentas ============ */

const Party = (() => {

  const GAMES = {
    corta:  { name: 'La corta', desc: 'Cada quien vs cada quien. Ganar el hoyo +1, birdie +1, águila +2, sandy +1, más cerca en regulación +1, hole-out +1, putt largo +1; 3-putt −1, español (doble del par) −1. Todo se cobra a cada rival y se acumula.' },
    skins:  { name: 'Skins',    desc: 'El score más bajo del hoyo (sin empate) gana 1 unidad de cada uno. Los empates acumulan al siguiente.' },
    larga:  { name: 'La larga', desc: 'En cada par 5, el drive más largo cobra 1 unidad de cada uno.' },
    gogo:   { name: 'Gogos',    desc: 'Salvar el par fuera de green (up & down) cobra 1 unidad de cada uno.' },
    birdie: { name: 'Birdies',  desc: 'Cada birdie cobra 1 unidad de cada uno; el águila cobra 2.' },
    medal:  { name: 'Medal',    desc: 'Stroke play: gana quien termine con el score total más bajo.' },
    nassau: { name: 'Nassau',   desc: 'Ida, vuelta y total: cada tramo lo cobra el score más bajo (1 unidad de cada uno).' },
    match:  { name: 'Match play', desc: 'Hoyo a hoyo: el score más bajo del hoyo (sin empate) cobra 1 unidad de cada rival. 2 o más jugadores.' },
  };

  /** Bonos (+) y castigos (−) de un jugador en un hoyo, para La corta */
  function unidadesHole(h, pid) {
    let bonus = 0, penalty = 0;
    const s = h.scores[pid];
    if (s != null) { const d = s - h.par; if (d <= -2) bonus += 2; else if (d === -1) bonus += 1; } // águila/birdie (del score)
    if ((h.sandy || []).includes(pid)) bonus += 1;                   // sandy
    if ((h.holeout || []).includes(pid)) bonus += 1;                 // hole-out
    if (h.longputt && !Array.isArray(h.longputt) && h.longputt[pid]) bonus += h.longputt[pid]; // putt largo: +1 por bandera
    if ((h.threeputt || []).includes(pid)) penalty += 1;            // 3-putt
    if ((h.espanol || []).includes(pid)) penalty += 1;             // español (doble del par)
    return { bonus, penalty };
  }
  /* rango de regulación (1 = más cerca); sin marcar = lejos */
  function regRank(h, pid) { return (h.reg && h.reg[pid]) ? h.reg[pid] : 99; }

  /** La corta por parejas: total de cada jugador (suma cero) */
  function unidades(party, limit = party.holes.length) {
    const pids = party.players.map(p => p.pid);
    const net = {}; pids.forEach(p => { net[p] = 0; });
    const sc = (h, i, pid) => h.scores[pid] - alloc(party, pid, i);
    party.holes.slice(0, limit).forEach((h, i) => {
      const played = pids.filter(p => h.scores[p] != null);
      if (played.length < 2) return;
      const info = {}; played.forEach(p => { info[p] = unidadesHole(h, p); });
      for (let a = 0; a < played.length; a++) {
        for (let b = a + 1; b < played.length; b++) {
          const pa = played[a], pb = played[b];
          const sa = sc(h, i, pa), sb = sc(h, i, pb);
          let delta = 0;
          if (sa < sb) delta += 1; else if (sb < sa) delta -= 1;     // ganar el hoyo
          delta += (info[pa].bonus - info[pb].bonus);                // bonos vs rival
          delta += (info[pb].penalty - info[pa].penalty);            // castigos
          const ra = regRank(h, pa), rb = regRank(h, pb);            // más cerca en regulación
          if (ra < rb) delta += 1; else if (rb < ra) delta -= 1;
          net[pa] += delta; net[pb] -= delta;
        }
      }
    });
    return net;
  }

  /** Puntos de La corta que gana un jugador en un hoyo (solo lo bueno suma) */
  function cortaHolePoints(h, pid) {
    let pts = 0;
    if (h.scores[pid] != null) {
      const d = h.scores[pid] - h.par;       // birdie/águila por score bruto
      if (d <= -2) pts += 4; else if (d === -1) pts += 2;
    }
    if ((h.sandy || []).includes(pid)) pts += 1;
    if ((h.holeout || []).includes(pid)) pts += 1;
    return pts;
  }

  /** Golpes de ventaja del jugador en el hoyo i (reparto uniforme de sus strokes) */
  function alloc(party, pid, i) {
    if (!party.useNet) return 0;
    const pl = party.players.find(x => x.pid === pid);
    const st = (pl && pl.strokes) || 0;
    const n = party.holesCount || 18;
    return Math.floor(st / n) + (i < st % n ? 1 : 0);
  }

  // sin caracteres confusos (0/O, 1/I/L)
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  function newCode(existing = []) {
    let code;
    do {
      code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
    } while (existing.includes(code));
    return code;
  }

  function totals(party) {
    const out = {};
    for (const pl of party.players) {
      let score = 0, par = 0, holes = 0;
      for (const h of party.holes) {
        const s = h.scores[pl.pid];
        if (s != null) { score += s; par += h.par; holes++; }
      }
      out[pl.pid] = { score, par, holes, toPar: score - par };
    }
    return out;
  }

  /** Cuentas: net $ por jugador + eventos + skins acumuladas.
      `limit` = nº de hoyos a considerar (en vivo: solo los completados). */
  function ledger(party, limit = party.holes.length) {
    const pids = party.players.map(p => p.pid);
    const net = {};
    pids.forEach(p => { net[p] = 0; });
    const events = [];
    // bote separado por modalidad (con respaldo al monto único de parties viejas)
    const stakeOf = g => party.stakes ? (Number(party.stakes[g]) || 0) : (Number(party.stake) || 0);

    const pay = (winner, units, label, hole, pool, game) => {
      pool = pool || pids;
      const stake = stakeOf(game);
      const rivals = pool.filter(p => p !== winner);
      for (const p of rivals) { net[p] -= units * stake; net[winner] += units * stake; }
      events.push({ hole, label, winner, amount: units * stake * rivals.length });
    };

    // score del hoyo (neto si la party usa hándicap)
    const sc = (h, i, pid) => h.scores[pid] - alloc(party, pid, i);

    const cortaPts = {};
    pids.forEach(p => { cortaPts[p] = 0; });

    let carry = 0;
    party.holes.slice(0, limit).forEach((h, i) => {
      const played = pids.filter(p => h.scores[p] != null);
      if (played.length < 2) return;

      if (party.games.skins) {
        const min = Math.min(...played.map(p => sc(h, i, p)));
        const winners = played.filter(p => sc(h, i, p) === min);
        if (winners.length === 1) {
          pay(winners[0], 1 + carry, carry ? `Skin (+${carry} acumuladas)` : 'Skin', i + 1, played, 'skins');
          carry = 0;
        } else {
          carry++;
        }
      }
      if (party.games.corta) {
        for (const p of played) {
          const pts = cortaHolePoints(h, p);
          if (pts > 0) { cortaPts[p] += pts; events.push({ hole: i + 1, label: 'La corta', winner: p, pts }); }
        }
      }
      if (party.games.larga && h.par === 5 && h.larga && played.includes(h.larga)) pay(h.larga, 1, 'La larga', i + 1, played, 'larga');
      if (party.games.gogo) for (const p of (h.gogos || [])) if (played.includes(p)) pay(p, 1, 'Gogo', i + 1, played, 'gogo');
      if (party.games.birdie) {
        for (const p of played) {
          const d = h.scores[p] - h.par;
          if (d === -1) pay(p, 1, 'Birdie', i + 1, played, 'birdie');
          else if (d <= -2) pay(p, 2, 'Águila', i + 1, played, 'birdie');
        }
      }
      if (party.games.match) {                                   // Match play POR HOYO: el más bajo (sin empate) cobra 1 de cada quien
        const min = Math.min(...played.map(p => sc(h, i, p)));
        const winners = played.filter(p => sc(h, i, p) === min);
        if (winners.length === 1) pay(winners[0], 1, 'Match · hoyo ' + (i + 1), i + 1, played, 'match');
      }
    });

    // La corta se liquida con el total de unidades de cada quien (cada-vs-cada, suma cero).
    // Misma cuenta que se muestra en el marcador y el panel: dinero = unidades × bote.
    if (party.games.corta) {
      const cstake = stakeOf('corta');
      const u = unidades(party, limit);
      for (const p of pids) net[p] += (u[p] || 0) * cstake;
    }

    // Medal / Nassau / Match: provisional en vivo (hoyos jugados), final al terminar
    {
      const netSum = (pid, from, to) => {
        let s = 0, n = 0, expected = 0;
        party.holes.slice(from, Math.min(to, limit)).forEach((h, k) => {
          expected++;
          if (h.scores[pid] != null) { s += sc(h, from + k, pid); n++; }
        });
        return (n > 0 && n === expected) ? s : null;   // medal/nassau: SOLO tarjeta completa del tramo (comparación justa)
      };
      const segWinner = (from, to) => {
        const sums = pids.map(p => [p, netSum(p, from, to)]).filter(([, s]) => s != null);
        if (sums.length < 2) return null;
        const min = Math.min(...sums.map(([, s]) => s));
        const winners = sums.filter(([, s]) => s === min);
        return winners.length === 1 ? { winner: winners[0][0], pool: sums.map(([p]) => p) } : null;
      };

      if (party.games.medal) {
        const w = segWinner(0, party.holes.length);
        if (w) pay(w.winner, 2, 'Medal (total)', null, w.pool, 'medal');
      }

      if (party.games.nassau) {
        const segs = party.holesCount >= 18
          ? [['Nassau · ida', 0, 9], ['Nassau · vuelta', 9, 18], ['Nassau · total', 0, 18]]
          : [['Nassau', 0, party.holes.length]];
        for (const [label, from, to] of segs) {
          const w = segWinner(from, to);
          if (w) pay(w.winner, 1, label, null, w.pool, 'nassau');
        }
      }

    }

    return { net, events, carry, cortaPts };
  }

  /** Tabla de posiciones por score (neto si la party usa hándicap) */
  function standings(party, limit = party.holes.length) {
    const rows = party.players.map(pl => {
      let gross = 0, net = 0, par = 0, n = 0;
      party.holes.slice(0, limit).forEach((h, i) => {
        if (h.scores[pl.pid] != null) {
          gross += h.scores[pl.pid];
          net += h.scores[pl.pid] - alloc(party, pl.pid, i);
          par += h.par; n++;
        }
      });
      const shown = party.useNet ? net : gross;
      return { pid: pl.pid, name: pl.name, gross, net, par, holes: n, shown, toPar: shown - par };
    });
    rows.sort((a, b) => (b.holes > 0) - (a.holes > 0) || a.toPar - b.toPar);
    return rows;
  }

  /** Estado de Match play (2+ jugadores): hoyos ganados por cada quien */
  function matchStatus(party, limit = party.holes.length) {
    const pids = party.players.map(p => p.pid);
    if (pids.length < 2) return null;
    const nameOf = pid => { const pl = party.players.find(x => x.pid === pid); return pl ? pl.name.split(' ')[0] : '—'; };
    const won = {}; pids.forEach(p => { won[p] = 0; });
    let played = 0;
    party.holes.slice(0, limit).forEach((h, i) => {
      const scored = pids.filter(p => h.scores[p] != null);
      if (scored.length < 2) return;
      played++;
      let best = Infinity, count = 0, bestPid = null;
      for (const p of scored) {
        const s = h.scores[p] - alloc(party, p, i);
        if (s < best) { best = s; count = 1; bestPid = p; }
        else if (s === best) count++;
      }
      if (count === 1) won[bestPid]++;
    });
    const remaining = (party.holesCount || party.holes.length) - played;
    const order = pids.slice().sort((x, y) => won[y] - won[x]);
    const leader = order[0];
    const leaderWon = won[leader];
    const runnerWon = order[1] ? won[order[1]] : 0;
    const is2p = pids.length === 2;
    let text, decided = false, up = 0, wa = 0, wb = 0;
    if (is2p) {
      wa = won[pids[0]]; wb = won[pids[1]]; up = wa - wb;
      if (up === 0) text = played ? 'Igualados' : '—';
      else {
        const diff = Math.abs(up);
        if (diff > remaining) { text = `${diff}&${remaining}`; decided = true; }
        else text = `${diff} arriba`;
      }
    } else {
      const lead = leaderWon - runnerWon;
      if (leaderWon === 0) text = played ? 'Sin ganador aún' : '—';
      else if (lead === 0) text = `Empate arriba (${leaderWon})`;
      else { text = `${nameOf(leader)} +${lead}`; if (lead > remaining) decided = true; }
    }
    return { is2p, won, leader, leaderWon, runnerWon, played, remaining, text, decided, up, wa, wb, a: pids[0], b: pids[1] };
  }

  /** Quién paga a quién (greedy) */
  function settle(net) {
    const debt = Object.entries(net).filter(([, v]) => v < -0.005).map(([p, v]) => ({ p, v: -v })).sort((a, b) => b.v - a.v);
    const cred = Object.entries(net).filter(([, v]) => v > 0.005).map(([p, v]) => ({ p, v })).sort((a, b) => b.v - a.v);
    const tx = [];
    let i = 0, j = 0;
    while (i < debt.length && j < cred.length) {
      const m = Math.min(debt[i].v, cred[j].v);
      tx.push({ from: debt[i].p, to: cred[j].p, amount: m });
      debt[i].v -= m; cred[j].v -= m;
      if (debt[i].v < 0.005) i++;
      if (cred[j].v < 0.005) j++;
    }
    return tx;
  }

  return { GAMES, newCode, totals, ledger, settle, cortaHolePoints, standings, matchStatus, unidades, unidadesHole };
})();

function fmtMoney(n) {
  const v = Math.round(n * 100) / 100;
  return (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('es-MX', { maximumFractionDigits: 0 });
}
