/* ============ Persistence (localStorage) + demo data ============ */

const Store = (() => {
  const KEY = 'parfect_v1';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        return { users: [], session: null, rounds: [], practices: [], active: null, parties: [], activeParty: null, ...s };
      }
    } catch (e) { /* corrupt state: start clean */ }
    return { users: [], session: null, rounds: [], practices: [], active: null, parties: [], activeParty: null };
  }

  function save(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
  }

  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  return { load, save, uid };
})();

/* ============ Demo data generator ============ */
const Demo = (() => {
  const COURSES = [
    'Newport Beach Golf Course', 'Club de Golf Chapultepec', 'La Loma Golf',
    'El Camaleón Mayakoba', 'Bosque Real CC'
  ];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function makeHole(par, p) {
    const tee = par === 3 ? null
      : (Math.random() < p.fw ? 'fw' : pick(['izq', 'izq', 'der', 'der', 'penal']));
    const penal = tee === 'penal' ? 1 : 0;
    const gir = Math.random() < p.gir;
    const app = gir ? 'gir' : pick(['corto', 'corto', 'corto', 'largo', 'izq', 'der']);
    let putts, upDown = null, score;
    if (gir) {
      const r = Math.random();
      putts = r < 0.14 ? 1 : r < 0.78 ? 2 : 3;
      score = par - 2 + putts + penal;
    } else {
      const saved = Math.random() < p.scr;
      upDown = saved;
      putts = saved ? 1 : (Math.random() < 0.82 ? 2 : 3);
      score = par - 1 + putts + penal;
    }
    const dist = gir
      ? pick(['2-5', '5-10', '5-10', '10+', '10+'])
      : pick(['0-2', '0-2', '0-2', '2-5', '2-5', '5-10']);
    return { par, score, tee, app, upDown, putts, dist };
  }

  function rounds(userId, n = 10) {
    const out = [];
    const now = Date.now();
    for (let i = 0; i < n; i++) {
      const skill = n === 1 ? 1 : i / (n - 1); // oldest → newest, improving
      const p = {
        fw: 0.46 + 0.14 * skill,
        gir: 0.28 + 0.17 * skill,
        scr: 0.34 + 0.26 * skill,
      };
      const holes = Stats.PAR_SEQ.map(par => makeHole(par, p));
      out.push({
        id: Store.uid(),
        userId,
        course: pick(COURSES),
        date: new Date(now - (n - 1 - i) * 8 * 864e5).toISOString().slice(0, 10),
        holes,
      });
    }
    return out;
  }

  function practices(userId) {
    const areas = [
      ['Putting', 'Gate de putter (1 m)', 0.55, 0.85],
      ['Putting', 'Lag putting 10-15 m', 0.45, 0.8],
      ['Wedges', 'Escalera de distancias', 0.4, 0.7],
      ['Driver', 'Gate Drill con alineación', 0.45, 0.65],
      ['Chipping', 'Landing spot', 0.4, 0.72],
    ];
    const out = [];
    const now = Date.now();
    let k = 0;
    for (const [area, drill, lo, hi] of areas) {
      for (let s = 0; s < 3; s++) {
        const t = s / 2;
        const acc = lo + (hi - lo) * t + (Math.random() - 0.5) * 0.08;
        const attempts = 10 + Math.floor(Math.random() * 6) * 2;
        out.push({
          id: Store.uid(),
          userId,
          date: new Date(now - (20 - k * 1.5 - s * 6) * 864e5).toISOString().slice(0, 10),
          area, drill,
          attempts,
          hits: Math.max(0, Math.min(attempts, Math.round(attempts * acc))),
          notes: '',
        });
      }
      k++;
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }

  return { rounds, practices };
})();
