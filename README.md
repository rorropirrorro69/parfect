# PARFECT — Golf Analytics · IA

App completa de analytics y entrenamiento para golf. **Deja de practicar. Empieza a mejorar.**

Diseño dark + verde lima, mobile-first, 100% en español. Sin build step, sin dependencias, sin backend: HTML + CSS + JavaScript vanilla. Los datos viven en `localStorage` del dispositivo, separados por cuenta.

## Cómo correrla

Cualquiera de las dos:

```bash
# Opción A: servidor local (recomendado)
python3 -m http.server 4173 --directory .
# → abre http://localhost:4173

# Opción B: doble clic en index.html (funciona directo desde el archivo)
```

## Módulos

| Módulo | Qué hace |
|---|---|
| **Landing + Auth** | Página de marketing, cuentas locales multi-usuario con contraseña. |
| **Registro de Rondas** | Captura hoyo a hoyo en 4 toques (salida, approach, around-the-green, putts) con score auto-calculado, rondas de 9/18 hoyos, pausa/reanudar, tarjeta con colores. |
| **Avatar Stats** | Fairways, GIR, scrambling, putts/ronda, 3-putt %, putts por GIR, patrones de fallo (tee y approach), putting por distancia, radar de 6 ejes, evolución de score. |
| **Parfect Trainer** | Motor de diagnóstico que compara tus métricas contra benchmarks de tu hándicap meta, detecta la causa raíz (p. ej. "fallas corto el 60% de los greens → selección de palo"), prioriza por golpes/ronda en juego y prescribe drills con dosis y métrica de éxito + estrategia de campo. |
| **Parfect Tracker** | Registro de sesiones de práctica (intentos/aciertos) con % de acierto por área y delta de mejora. |
| **Social** | Leaderboard de cuentas del dispositivo + feed de actividad. |

## Estructura

```
index.html          shell + carga de scripts
css/styles.css      design system (tokens, componentes)
js/ui.js            helpers, iconos, charts SVG (radar, línea, barras)
js/store.js         persistencia localStorage + generador de datos demo
js/stats.js         motor de métricas, agregados, radar, benchmarks por hándicap
js/trainer.js       motor de diagnóstico + biblioteca de drills
js/views-public.js  landing + auth
js/views-home.js    shell, dashboard, perfil
js/views-round.js   flujo de ronda completo
js/views-modules.js Avatar Stats, Trainer, Tracker, Social
js/app.js           estado, router, acciones (event delegation)
```

## Tips

- En el registro o en **Perfil → Cargar datos de ejemplo** puedes poblar la app con 10 rondas y 15 prácticas demo para explorarla.
- El botón **P** central siempre inicia (o continúa) una ronda.
- Nota: la versión anterior del proyecto (React + TS, tema claro) vive en `../parfect-golf-app` y no fue modificada.
