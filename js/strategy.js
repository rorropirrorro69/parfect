/* ============ Estrategia de campo (beta) — piloto Tres Marías hoyo 1 ============
   Datos factuales (par/yardas, scorecard público) + recreación representativa del hoyo.
   La zona de aterrizaje se calcula con la dispersión real del jugador. */

const TM_COURSE = { name: 'Tres Marías', sub: 'El Reto · Morelia' };
const TM_HOLES = [
  { n: 1, par: 4, yds: 433 }, { n: 2, par: 4, yds: 466 }, { n: 3, par: 3, yds: 207 },
  { n: 4, par: 4, yds: 434 }, { n: 5, par: 5, yds: 555 }, { n: 6, par: 3, yds: 187 },
  { n: 7, par: 4, yds: 389 }, { n: 8, par: 5, yds: 530 }, { n: 9, par: 4, yds: 404 },
  { n: 10, par: 4, yds: 520 }, { n: 11, par: 4, yds: 380 }, { n: 12, par: 4, yds: 374 },
  { n: 13, par: 3, yds: 214 }, { n: 14, par: 3, yds: 216 }, { n: 15, par: 4, yds: 509 },
  { n: 16, par: 5, yds: 541 }, { n: 17, par: 4, yds: 350 }, { n: 18, par: 5, yds: 545 },
];

/* Recomendación según la dispersión del jugador (hoyo 1: par 4, dogleg suave a la izq,
   bunker de calle a la derecha de la zona de aterrizaje). */
function strategyRecommend(hole, user, agg) {
  const carry = (user.clubs && user.clubs.dr) || 250;
  const fw = agg ? agg.fwPct : 50;
  const width = Math.round(Math.max(22, Math.min(62, 60 - (fw - 35) * 0.9))); // dispersión lateral total (yds)
  const m = (agg && agg.missTee) || { izq: 0, der: 0 };
  const bias = m.der > m.izq * 1.2 ? 'der' : m.izq > m.der * 1.2 ? 'izq' : 'centro';

  let club, landing, reason, aim;
  if (width >= 46 && bias === 'der') {
    club = 'Híbrido'; landing = carry - 38;
    reason = `Tu dispersión (~${width} yds) y tu tendencia a la derecha meten el bunker de calle en juego. Sal corto y a la izquierda.`;
    aim = 'Centro-izquierda';
  } else if (hole.yds - carry < 70) {
    club = 'Madera 3'; landing = carry - 30;
    reason = `Con driver te quedaría un approach demasiado corto. Una madera deja distancia de wedge cómoda.`;
    aim = 'Centro';
  } else {
    club = 'Driver'; landing = carry;
    reason = `Tu dispersión cabe en la calle. El driver te deja un approach de hierro corto.`;
    aim = bias === 'der' ? 'Centro-izquierda' : bias === 'izq' ? 'Centro-derecha' : 'Centro';
  }
  const leave = Math.max(hole.yds - landing, 0);
  return { club, landing, leave, reason, aim, width, bias, carry };
}

/* SVG en perspectiva del hoyo (representativo) con la zona de aterrizaje del jugador */
function holeStrategySVG(hole, rec) {
  const W = 360, H = 470;
  const topY = 120, botY = 446, span = hole.yds;
  const yFor = yds => botY - Math.min(yds / span, 0.86) * (botY - topY);
  const cx = 196 + (rec.bias === 'der' ? 22 : rec.bias === 'izq' ? -22 : 0);
  const ly = yFor(rec.landing);
  const lrx = Math.max(26, Math.min(58, rec.width * 1.0));
  const lry = lrx * 0.6;
  const recRoute = `M180,442 L${cx.toFixed(0)},${ly.toFixed(0)} L128,108`;
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Estrategia del hoyo ${hole.n}">
    <rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="#0a0f08" stroke="#1d2914"/>
    <polygon points="160,442 150,330 158,250 210,175 300,135 310,150 250,235 240,330 230,442" fill="#2f6b39" stroke="#41924d" stroke-width="2"/>
    <ellipse cx="232" cy="248" rx="30" ry="17" fill="#ddcb8c"/>
    <ellipse cx="158" cy="120" rx="22" ry="13" fill="#ddcb8c"/>
    <ellipse cx="128" cy="103" rx="50" ry="34" fill="#57b15c" stroke="#2f6b39" stroke-width="2"/>
    <circle cx="135" cy="106" r="3.2" fill="#0a0f08"/>
    <line x1="135" y1="106" x2="135" y2="66" stroke="#eef3e6" stroke-width="2"/>
    <path d="M135,66 L151,71 L135,76 Z" fill="#c9f73e"/>
    <ellipse cx="${cx}" cy="${ly.toFixed(0)}" rx="${(lrx + 14).toFixed(0)}" ry="${(lry + 10).toFixed(0)}" fill="#c9f73e" opacity="0.08"/>
    <path d="M180,442 L300,250 L128,108" fill="none" stroke="#e0a25a" stroke-width="2" stroke-dasharray="2 7" opacity="0.7"/>
    <path d="${recRoute}" fill="none" stroke="#c9f73e" stroke-width="3" stroke-dasharray="3 6"/>
    <ellipse cx="${cx}" cy="${ly.toFixed(0)}" rx="${lrx.toFixed(0)}" ry="${lry.toFixed(0)}" fill="#c9f73e" opacity="0.16" stroke="#c9f73e" stroke-width="1.5" stroke-dasharray="4 4">
      <animate attributeName="opacity" values="0.10;0.24;0.10" dur="2.4s" repeatCount="indefinite"/>
    </ellipse>
    <circle r="5.5" fill="#ffffff">
      <animateMotion dur="3.2s" repeatCount="indefinite" path="${recRoute}"/>
      <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.06;0.5;0.85;1" dur="3.2s" repeatCount="indefinite"/>
    </circle>
    <rect x="168" y="440" width="22" height="8" rx="2" fill="#9ab07f"/>
    <text x="179" y="463" fill="#9ab07f" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">TEE</text>
    <rect x="${(cx - 52).toFixed(0)}" y="${(ly - lry - 26).toFixed(0)}" width="104" height="22" rx="11" fill="#c9f73e"/>
    <text x="${cx}" y="${(ly - lry - 11).toFixed(0)}" fill="#0a0f08" font-family="Inter,system-ui,sans-serif" font-size="11.5" font-weight="800" text-anchor="middle">Tu zona ideal</text>
    <rect x="236" y="230" width="74" height="20" rx="10" fill="#3a2a16" stroke="#e0a25a"/>
    <text x="273" y="244" fill="#e0a25a" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">Bunker</text>
  </svg>`;
}

function vStrategy() {
  const u = cur();
  const agg = Stats.aggregate(myRounds());
  const hole = TM_HOLES[0];
  const rec = strategyRecommend(hole, u, agg);
  return `<button class="auth-back" data-act="nav" data-view="inicio">← Inicio</button>
    <div class="greet" style="padding-top:6px">
      <p class="hi">${esc(TM_COURSE.name)} · ${esc(TM_COURSE.sub)}</p>
      <h1 style="font-size:26px">Hoyo ${hole.n}</h1>
      <p class="hcp">Par ${hole.par} · ${hole.yds} yds</p>
    </div>
    <div class="card" style="padding:12px">
      ${holeStrategySVG(hole, rec)}
    </div>
    <div class="card">
      <span class="prio">Recomendado</span>
      <h3 style="margin-top:12px;font-size:19px;font-weight:900">${esc(rec.club)} · apunta ${esc(rec.aim.toLowerCase())}</h3>
      <p style="font-size:14px;margin-top:8px">${esc(rec.reason)}</p>
      <div class="grid2" style="margin-top:12px">
        <div><div class="stat-num" style="font-size:22px">${rec.leave}</div><div class="stat-cap">yds a green</div></div>
        <div><div class="stat-num" style="font-size:22px">~${rec.width}</div><div class="stat-cap">tu dispersión (yds)</div></div>
      </div>
    </div>
    <div class="card">
      <span class="label">Cómo se lee</span>
      <p class="tip">La línea <b class="lime">verde</b> es tu ruta recomendada; la <b style="color:var(--danger)">ámbar</b> es la agresiva (más riesgo).</p>
      <p class="tip">El óvalo verde es dónde caen tus tiros según tu % de calles; por eso evita el bunker de la derecha.</p>
    </div>
    <p class="note" style="margin-bottom:24px">Recreación representativa del hoyo (par y yardas reales del scorecard de Tres Marías). No es un levantamiento topográfico exacto; la forma se afina con imagen satelital. La estrategia se calcula con tu dispersión real.</p>`;
}
