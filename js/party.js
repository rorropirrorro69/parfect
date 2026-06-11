/* ============ Parfect Party: juegos de apuesta y cuentas ============ */

const Party = (() => {

  const GAMES = {
    skins:  { name: 'Skins',    desc: 'El score más bajo del hoyo (sin empate) gana 1 unidad de cada uno. Los empates acumulan al siguiente.' },
    corta:  { name: 'La corta', desc: 'En cada par 3, el que quede más cerca de bandera cobra 1 unidad de cada uno.' },
    larga:  { name: 'La larga', desc: 'En cada par 5, el drive más largo cobra 1 unidad de cada uno.' },
    gogo:   { name: 'Gogos',    desc: 'Salvar el par fuera de green (up & down) cobra 1 unidad de cada uno.' },
    birdie: { name: 'Birdies',  desc: 'Cada birdie cobra 1 unidad de cada uno; el águila cobra 2.' },
    medal:  { name: 'Medal',    desc: 'Al final, el score total más bajo (sin empate) cobra 2 unidades de cada uno.' },
  };

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
    const stake = Number(party.stake) || 0;

    const pay = (winner, units, label, hole, pool = pids) => {
      const rivals = pool.filter(p => p !== winner);
      for (const p of rivals) { net[p] -= units * stake; net[winner] += units * stake; }
      events.push({ hole, label, winner, amount: units * stake * rivals.length });
    };

    let carry = 0;
    party.holes.slice(0, limit).forEach((h, i) => {
      const played = pids.filter(p => h.scores[p] != null);
      if (played.length < 2) return;

      if (party.games.skins) {
        const min = Math.min(...played.map(p => h.scores[p]));
        const winners = played.filter(p => h.scores[p] === min);
        if (winners.length === 1) {
          pay(winners[0], 1 + carry, carry ? `Skin (+${carry} acumuladas)` : 'Skin', i + 1, played);
          carry = 0;
        } else {
          carry++;
        }
      }
      if (party.games.corta && h.par === 3 && h.corta && played.includes(h.corta)) pay(h.corta, 1, 'La corta', i + 1, played);
      if (party.games.larga && h.par === 5 && h.larga && played.includes(h.larga)) pay(h.larga, 1, 'La larga', i + 1, played);
      if (party.games.gogo) for (const p of (h.gogos || [])) if (played.includes(p)) pay(p, 1, 'Gogo', i + 1, played);
      if (party.games.birdie) {
        for (const p of played) {
          const d = h.scores[p] - h.par;
          if (d === -1) pay(p, 1, 'Birdie', i + 1, played);
          else if (d <= -2) pay(p, 2, 'Águila', i + 1, played);
        }
      }
    });

    if (party.games.medal && party.status === 'done') {
      const t = totals(party);
      const active = pids.filter(p => t[p].holes > 0);
      if (active.length >= 2) {
        const min = Math.min(...active.map(p => t[p].score));
        const winners = active.filter(p => t[p].score === min);
        if (winners.length === 1) pay(winners[0], 2, 'Medal (total)', null, active);
      }
    }

    return { net, events, carry };
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

  return { GAMES, newCode, totals, ledger, settle };
})();

function fmtMoney(n) {
  const v = Math.round(n * 100) / 100;
  return (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('es-MX', { maximumFractionDigits: 0 });
}
