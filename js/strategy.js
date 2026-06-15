/* ============ Plan de juego por hoyo (sin mapa) — Club Campestre Morelia ============
   Datos reales del scorecard del club (par/yardas, 9 hoyos · par 72).
   Recomendación calculada con la dispersión real del jugador y su bolsa de palos.
   Sin dibujo del hoyo: no se puede recrear con precisión, así que damos el plan en datos. */

const CAMP_COURSE = { name: 'Club Campestre Morelia', sub: '9 hoyos · Par 72 · plano' };

const CAMP_HOLES = [
  { n: 1, par: 5, yds: 503, dog: 'straight', hazard: 'bunker-right', desc: 'Par 5 largo y plano; calle amplia.',
    tips: ['Driver al centro-izquierda: los bunkers de calle quedan a la derecha.', 'Solo los pegadores llegan en dos; si no, deja un wedge cómodo de tercer golpe.'] },
  { n: 2, par: 5, yds: 550, dog: 'right', hazard: 'bunker-left', desc: 'El par 5 más largo; un arroyo cruza antes del green.',
    tips: ['Prioriza calle, no distancia: es el hoyo más largo.', 'El arroyo cruza antes del green — si no llegas en dos, deja el tercer golpe corto del agua.'] },
  { n: 3, par: 3, yds: 174, dog: 'straight', hazard: 'water-left', desc: 'Par 3 corto con laguna a la izquierda del green.',
    tips: ['Apunta al centro-derecha del green; la laguna castiga la izquierda.', 'Fallar a la derecha (al bunker) se salva mejor que mojar la bola.'] },
  { n: 4, par: 4, yds: 405, dog: 'left', hazard: 'bunker-right', desc: 'Dogleg suave a la izquierda.',
    tips: ['Coloca el drive en el centro; deja approach de hierro medio.'] },
  { n: 5, par: 3, yds: 201, dog: 'straight', hazard: 'bunker-left', desc: 'El par 3 más largo; toma palo de más.',
    tips: ['Es largo: toma un palo más y juega al centro del green.'] },
  { n: 6, par: 4, yds: 432, dog: 'right', hazard: 'bunker-left', desc: 'Par 4 largo; coloca el drive.',
    tips: ['Par 4 exigente: prioriza estar en calle para atacar el green.'] },
  { n: 7, par: 5, yds: 529, dog: 'left', hazard: 'water-right', desc: 'Par 5 alcanzable en dos si pegas recto.',
    tips: ['Si pegas recto, es alcanzable en dos; ojo con el agua a la derecha.'] },
  { n: 8, par: 3, yds: 176, dog: 'straight', hazard: 'water-left', desc: 'Par 3 sobre el agua a la izquierda.',
    tips: ['Apunta al centro-derecha; el agua castiga el lado izquierdo.'] },
  { n: 9, par: 4, yds: 407, dog: 'right', hazard: 'bunker-right', desc: 'Par 4 de cierre hacia la casa club.',
    tips: ['Hoyo de cierre: deja la bola en calle y ataca el green al centro.'] },
];

function clubForDistance(user, yds) {
  const clubs = (user && user.clubs) || {};
  const bag = (typeof CLUBS !== 'undefined' ? CLUBS : []).map(c => ({ name: c.name, carry: clubs[c.id] != null ? clubs[c.id] : CLUB_DEFAULT[c.id] }))
    .filter(c => c.carry);
  if (!bag.length) return null;
  bag.sort((a, b) => Math.abs(a.carry - yds) - Math.abs(b.carry - yds));
  return bag[0];
}

function strategyRecommend(hole, user, agg) {
  const fw = agg ? agg.fwPct : 50;
  const width = Math.round(Math.max(20, Math.min(60, 60 - (fw - 35) * 0.9)));
  const m = (agg && agg.missTee) || { izq: 0, der: 0 };
  const bias = m.der > m.izq * 1.2 ? 'der' : m.izq > m.der * 1.2 ? 'izq' : 'centro';
  const hz = hole.hazard || '';

  if (hole.par === 3) {
    const club = clubForDistance(user, hole.yds);
    let aim = 'Centro del green';
    if (hz.includes('right')) aim = 'Centro-izquierda';
    if (hz.includes('left')) aim = 'Centro-derecha';
    const reason = hz.includes('water')
      ? `Par 3 de ${hole.yds} yds. Apunta al centro: el agua castiga el lado ${hz.includes('right') ? 'derecho' : 'izquierdo'}.`
      : `Par 3 de ${hole.yds} yds. Apunta al centro del green y juega a dos putts.`;
    return { par3: true, club: club ? club.name : 'Hierro', leave: hole.yds, aim, reason, width, bias };
  }

  const carry = (user.clubs && user.clubs.dr) || (typeof CLUB_DEFAULT !== 'undefined' ? CLUB_DEFAULT.dr : 250);
  const dl = hole.dog;
  let club, landing, aim, reason;
  const tight = width >= 46 && ((dl === 'left' && bias === 'der') || (dl === 'right' && bias === 'izq'));
  if (tight) {
    club = 'Madera 3'; landing = carry - 35;
    aim = dl === 'left' ? 'Lado interior izquierdo' : 'Lado interior derecho';
    reason = `Tu dispersión (~${width} yds) no perdona en este dogleg. Coloca la salida con madera al lado interior.`;
  } else {
    club = 'Driver'; landing = carry;
    aim = bias === 'der' ? 'Centro-izquierda' : bias === 'izq' ? 'Centro-derecha' : 'Centro de la calle';
    reason = hole.yds >= 480
      ? `Par ${hole.par} de ${hole.yds} yds. Saca distancia con el driver; te quedará un segundo golpe largo.`
      : `Tu dispersión cabe en la calle. Driver y tendrás un approach corto.`;
  }
  const leave = Math.max(hole.yds - landing, 0);
  const approach = clubForDistance(user, leave);
  return { par3: false, club, landing, leave, aim, reason, width, bias, approach: approach ? approach.name : null };
}

function hazardAvoid(hole) {
  const hz = hole.hazard || '';
  const side = hz.includes('left') ? 'izquierda' : hz.includes('right') ? 'derecha' : null;
  if (!side) return null;
  const safe = side === 'izquierda' ? 'derecha' : 'izquierda';
  const what = hz.includes('water') ? 'Agua' : 'Bunker';
  return `${what} a la ${side}${hole.par === 3 ? ' del green' : ' de la zona de caída'} — si dudas, falla a la ${safe}.`;
}

function vStrategy() {
  const u = cur();
  const agg = Stats.aggregate(myRounds());
  const idx = V.holeIdx || 0;
  const hole = CAMP_HOLES[idx];
  const rec = strategyRecommend(hole, u, agg);
  const chips = CAMP_HOLES.map((h, i) => `<button class="hole-chip ${i === idx ? 'on' : ''}" data-act="sel-hole" data-i="${i}">${h.n}</button>`).join('');
  const av = hazardAvoid(hole);
  const tips = hole.tips && hole.tips.length ? hole.tips : [hole.desc];

  return `<button class="auth-back" data-act="nav" data-view="inicio">← Inicio</button>
    <div class="greet" style="padding-top:6px">
      <p class="hi">${esc(CAMP_COURSE.name)}</p>
      <h1 style="font-size:24px">Hoyo ${hole.n} · Par ${hole.par}</h1>
      <p class="hcp">${hole.yds} yds (azules) · ${esc(CAMP_COURSE.sub)}</p>
    </div>
    <div class="hole-strip">${chips}</div>

    <div class="card">
      <span class="prio">${rec.par3 ? 'Tiro al green' : 'Salida recomendada'}</span>
      <h3 style="margin-top:12px;font-size:22px;font-weight:900">${esc(rec.club)}</h3>
      <p class="hcp" style="font-size:14px;margin-top:2px">Apunta ${esc(rec.aim.toLowerCase())}</p>
      <p style="font-size:14px;margin-top:10px">${esc(rec.reason)}</p>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="stat-num" style="font-size:26px">${rec.par3 ? hole.yds : rec.leave}</div>
        <div class="stat-cap">${rec.par3 ? 'yds al green' : 'yds a green (2°)'}</div>
        ${!rec.par3 && rec.approach ? `<p class="note" style="margin-top:6px">Approach: ${esc(rec.approach)}</p>` : ''}
      </div>
      <div class="card">
        <div class="stat-num" style="font-size:26px">~${rec.width}</div>
        <div class="stat-cap">tu dispersión (yds)</div>
      </div>
    </div>

    ${av ? `<div class="card"><span class="label">⚠️ Dónde no fallar</span><p style="font-size:14px;margin-top:6px">${esc(av)}</p></div>` : ''}

    <div class="card">
      <span class="label">Plan del hoyo</span>
      ${tips.map(t => `<p class="tip">${esc(t)}</p>`).join('')}
    </div>

    <p class="note" style="margin-bottom:24px">Plan basado en el par y las yardas reales del Campestre y en tu dispersión. Sin mapa del hoyo (no se puede recrear con precisión exacta).</p>`;
}
