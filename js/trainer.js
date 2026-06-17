/* ============ Parfect Trainer: motor de diagnóstico de causa raíz ============ */

const Trainer = (() => {

  const DRILLS = {
    driving: [
      { name: 'Gate Drill con alineación', desc: 'Coloca dos palos en el suelo formando un pasillo hacia tu objetivo. Trabaja el start line del drive sin pensar en distancia.', dose: '3 series × 10 bolas', metric: '≥ 7/10 dentro del pasillo', steps: ['Pon dos palos formando un pasillo hacia el objetivo', 'Pega buscando que la bola arranque por el pasillo', 'Ignora la distancia: solo importa la línea de salida'] },
      { name: '14 fairways bajo presión', desc: 'Simula las 14 salidas de una ronda: cada drive a un "fairway" imaginario distinto, cambiando objetivo cada bola. Sin repetir tras un fallo.', dose: '14 bolas, 1 intento c/u', metric: '≥ 8/14 fairways imaginarias', steps: ['Elige 14 objetivos distintos, uno por salida', 'Pega 1 bola a cada uno, sin repetir', 'Cuenta cuántas caen en "calle"'] },
      { name: 'Madera 3 de control', desc: 'Alterna driver y madera 3 al mismo objetivo. Compara dispersión real: te enseña cuándo el driver no paga.', dose: '2 series × 10 (5+5)', metric: 'Dispersión M3 < 60% de la del driver', steps: ['Alterna driver y madera 3 al mismo objetivo', 'Marca dónde cae cada bola', 'Compara la dispersión de las dos'] },
    ],
    approach: [
      { name: 'Escalera de distancias', desc: 'Con el mismo hierro, alterna 3 objetivos a distinta distancia (ej. 110/125/140 m) sin repetir nunca el mismo. Calibra tu distancia real, no la de tu mejor golpe.', dose: '3 series × 9 bolas', metric: '≥ 6/9 a menos de 10 m del objetivo', steps: ['Elige 3 distancias, ej. 110 / 125 / 140 m', 'Con el mismo hierro, alterna las 3 sin repetir', 'Cuenta cuántas caen a menos de 10 m'] },
      { name: 'Sistema de reloj con wedges', desc: 'Define 3 longitudes de backswing (8:00, 9:00, 10:00) y mide cuánto vuela cada una con cada wedge. Anota la matriz: son tus distancias de scoring.', dose: '45 min, 1 vez/semana', metric: 'Matriz completa de 9 distancias', steps: ['Define 3 backswings: 8:00, 9:00 y 10:00', 'Mide cuánto vuela cada uno con cada wedge', 'Anota tu matriz de distancias de scoring'] },
      { name: 'Pin high siempre', desc: 'En el campo: toma un palo MÁS de lo que dicta tu ego y swing al 80%. La mayoría de los amateurs falla corto, casi nunca largo.', dose: 'Próximas 2 rondas', metric: '≥ 50% de approaches pin-high o largos', steps: ['Toma un palo más de lo que crees', 'Haz swing al 80%', 'Apunta al centro del green, no a la bandera'] },
    ],
    short: [
      { name: 'Up & Down Challenge', desc: '10 posiciones aleatorias alrededor del green (rough, fringe, cuesta abajo). Juega cada una hasta embocar. Cuenta golpes totales.', dose: '10 posiciones', metric: '≥ 5/10 up & down logrados', steps: ['Elige 10 posiciones alrededor del green', 'Juega cada una hasta embocar', 'Cuenta cuántos up & down salvaste'] },
      { name: 'Landing spot con toalla', desc: 'Coloca una toalla en el punto de bote ideal y elige el palo según el rodado que necesitas (PW, 9, 8). El chip se controla por el bote, no por el vuelo.', dose: '3 series × 8 chips', metric: '≥ 5/8 botes en la toalla', steps: ['Pon una toalla en el punto de bote ideal', 'Elige el palo según el rodado (PW / 9 / 8)', 'Busca botar la bola en la toalla'] },
      { name: 'Splash de bunker', desc: 'Dibuja una línea en la arena 5 cm detrás de la bola. Golpea la línea, no la bola. Primero sin bola, luego con ella.', dose: '20 swings + 15 bolas', metric: '≥ 10/15 fuera y en green', steps: ['Dibuja una línea 5 cm detrás de la bola', 'Golpea la línea, no la bola', 'Primero sin bola; luego con bola'] },
    ],
    putting: [
      { name: 'Lag putting a círculo de 1 m', desc: 'Desde 10–15 m, imagina un círculo de 1 m alrededor del hoyo. El objetivo no es embocar: es eliminar el 3-putt dejando todo dentro del círculo.', dose: '3 series × 6 putts', metric: '≥ 5/6 dentro del círculo', steps: ['Ponte a 10–15 m del hoyo', 'Imagina un círculo de 1 m alrededor', 'Deja cada putt dentro del círculo'] },
      { name: 'Gate de putter (1 m)', desc: 'Dos tees apenas más anchos que tu putter, a 1 m del hoyo. Si pasas el gate, la bola entra. Automatiza el putt que NUNCA debes fallar.', dose: '3 series × 10', metric: '≥ 9/10 embocados', steps: ['Pon dos tees apenas más anchos que el putter, a 1 m', 'Putea pasando la bola por el gate', 'Repite hasta embocar 9 de 10'] },
      { name: 'Reloj de 1.5 m', desc: '8 putts alrededor del hoyo a 1.5 m (como un reloj). Cada caída distinta. Termina la vuelta sin fallar o empieza de nuevo.', dose: '2 vueltas completas', metric: '≥ 14/16 embocados', steps: ['Pon 8 bolas en reloj a 1.5 m del hoyo', 'Emboca una por una', 'Si fallas, empieza la vuelta otra vez'] },
    ],
  };

  function pctOf(part, obj) {
    const tot = Object.values(obj).reduce((a, b) => a + b, 0);
    return tot ? part / tot : 0;
  }

  function analyze(agg, user) {
    if (!agg) return { readiness: 'none', focus: [] };
    const goal = (user.goal ?? user.hcp ?? 12);
    const bench = Stats.benchFor(goal);
    const focus = [];

    /* ---- Driving ---- */
    {
      const deficit = bench.fwPct - agg.fwPct;
      const lost = Math.max(0, deficit * 0.05) + agg.penals18 * 0.9;
      const m = agg.missTee;
      const pIzq = pctOf(m.izq, { a: m.izq, b: m.der });
      let diag = `Aciertas el ${agg.fwPct.toFixed(0)}% de fairways (referencia para meta ${fmtHcp(goal)}: ${bench.fwPct.toFixed(0)}%).`;
      const tips = [];
      if (m.izq + m.der >= 4 && pIzq >= 0.62) {
        diag += ` Patrón claro: el ${Math.round(pIzq * 100)}% de tus fallos de salida van a la IZQUIERDA — típico de cara cerrada al impacto o path muy in-to-out.`;
        tips.push('Alinéate al lado derecho de la calle y deja que tu vuelo natural regrese la bola al centro.');
      } else if (m.izq + m.der >= 4 && pIzq <= 0.38) {
        diag += ` Patrón claro: el ${Math.round((1 - pIzq) * 100)}% de tus fallos de salida van a la DERECHA — típico de cara abierta o slice.`;
        tips.push('Apunta al lado izquierdo de la calle: tu dispersión natural cae a la derecha.');
      } else {
        tips.push('Tu dispersión es simétrica: en hoyos cerrados elige el palo que garantiza estar en juego, no el más largo.');
      }
      if (agg.penals18 >= 0.8) {
        diag += ` Además pierdes ~${agg.penals18.toFixed(1)} bolas penalizadas por ronda: golpes regalados.`;
        tips.push('Con peligro a un lado del hoyo, sal con madera 3 o híbrido: la distancia que cedes vale menos que el penal.');
      }
      focus.push({ key: 'driving', titulo: 'Driving · Salidas', lost, diag, drills: DRILLS.driving, tips });
    }

    /* ---- Approach / GIR ---- */
    {
      const deficit = bench.girPct - agg.girPct;
      const lost = Math.max(0, deficit * 0.055);
      const m = agg.missApp;
      const tot = m.corto + m.largo + m.izq + m.der;
      const pCorto = tot ? m.corto / tot : 0;
      let diag = `Tu GIR es ${agg.girPct.toFixed(0)}% (referencia: ${bench.girPct.toFixed(0)}%). Cada green que no tomas en regulación te obliga a salvar el par con el juego corto.`;
      const tips = [];
      if (tot >= 5 && pCorto >= 0.45) {
        diag += ` Causa raíz detectada: el ${Math.round(pCorto * 100)}% de tus greens fallados son CORTOS. No es swing — es selección de palo: calculas con tu mejor golpe, no con tu golpe promedio.`;
        tips.push('Toma sistemáticamente un palo más en approaches. La bandera casi nunca está adelante del green.');
      } else if (tot >= 5 && (m.izq + m.der) / tot >= 0.55) {
        diag += ` Tu fallo dominante es lateral (${Math.round(((m.izq + m.der) / tot) * 100)}%): apunta al centro del green e ignora banderas en los bordes.`;
        tips.push('Centro del green siempre. Un putt de 8 m vale más que un chip desde el bunker.');
      } else {
        tips.push('Apunta al centro del green: el GIR sube solo con objetivos más conservadores.');
      }
      focus.push({ key: 'approach', titulo: 'Approach · Hierros', lost, diag, drills: DRILLS.approach, tips });
    }

    /* ---- Juego corto ---- */
    {
      const deficit = bench.scrPct - agg.scrPct;
      const lost = Math.max(0, deficit * 0.05);
      let diag = `Salvas el par el ${agg.scrPct.toFixed(0)}% de las veces que fallas green (referencia: ${bench.scrPct.toFixed(0)}%).`;
      const tips = [];
      if (deficit > 8) {
        diag += ` Aquí hay golpes fáciles: con tu GIR actual juegas ~${Math.round((100 - agg.girPct) / 100 * 18)} hoyos por ronda dependiendo del up/down.`;
        tips.push('Antes de cada chip define el punto de bote, no la bandera.');
        tips.push('Fuera del green, tu palo por defecto debería ser el más rodador que la situación permita.');
      } else {
        tips.push('Tu juego corto sostiene tu score: mantenlo con 20 minutos de chipping por sesión de práctica.');
      }
      focus.push({ key: 'short', titulo: 'Juego corto', lost, diag, drills: DRILLS.short, tips });
    }

    /* ---- Putting ---- */
    {
      const excess = agg.putts18 - bench.putts18;
      const lost = Math.max(0, excess);
      let diag = `Promedias ${agg.putts18.toFixed(1)} putts por ronda (referencia: ${bench.putts18.toFixed(1)}).`;
      const tips = [];
      const corta = agg.puttsByDist['0-2'];
      const cortaPct = corta && corta.n >= 5 ? (corta.one / corta.n) * 100 : null;
      if (agg.threePct > bench.threePct + 3) {
        diag += ` Tu tasa de 3-putt es ${agg.threePct.toFixed(0)}% — el problema no es embocar, es la distancia del primer putt: trabaja lag putting antes que nada.`;
        tips.push('En putts de +8 m tu único objetivo es dejarla a menos de 1 m. Embocar es un bonus.');
      }
      if (cortaPct != null && cortaPct < 82) {
        diag += ` En el rango 0–2 m conviertes solo el ${cortaPct.toFixed(0)}%: ahí se escapan pares que ya tenías ganados.`;
        tips.push('Rutina fija en putts cortos: una mirada al hoyo, golpe firme a la parte de atrás de la copa.');
      }
      if (tips.length === 0) tips.push('Tu putting está en línea con tu meta: protégelo con 2 vueltas del Reloj de 1.5 m por semana.');
      focus.push({ key: 'putting', titulo: 'Putting', lost, diag, drills: DRILLS.putting, tips });
    }

    focus.sort((a, b) => b.lost - a.lost);
    return {
      readiness: agg.rounds < 3 ? 'low' : 'ok',
      focus,
      bench,
      totalLost: focus.reduce((a, f) => a + f.lost, 0),
    };
  }

  return { analyze, DRILLS };
})();
