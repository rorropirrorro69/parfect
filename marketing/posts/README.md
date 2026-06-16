# Posts de Instagram — imágenes listas

PNG 1080×1080, **fieles al design system real de la app** (fondo verde-cielo claro,
hero con degradado lima `#C7EE54`, números navy `#1B2A18`, tarjetas blancas redondeadas,
wordmark itálico y los **personajes 3D reales** golfista/bandera embebidos).

| Imagen | Pilar | Caption (en `../MENSAJES.md`) |
|---|---|---|
| `post1-stats.png` | Datos | *"¿Sabes de verdad cómo juegas?"* — réplica del dashboard (hándicap 7 + 56/51/41) |
| `post2-diagnostico.png` | Entrenador IA | *"Deja de practicar al azar."* — Prioridad 1: Putting + drill |
| `post3-fundadores.png` | CTA | *"Busco 50 fundadores en Morelia."* + golfista y bandera 3D |

## De dónde salió el look
Se construyó mirando la app **en vivo** (no el kit viejo, que estaba en negro y ya no aplica):
fondo diurno, hero lima, personajes 3D, Inter, esquinas de 18px. Ver tokens en `../MARCA.md` §8.

## Aún mejor: capturas reales
Tus pantallas reales son contenido de primera (dashboard, Liga de amigos, diagnóstico,
trofeos). Con los datos demo cargados, abre la app y captura directo para stories.

## Editar / regenerar
Los SVG se generan con un script que **incrusta tus PNG reales** (`assets/golfer.png`, etc.):
```bash
cd ~/claude/parfect/marketing/posts
python3 _build_posts.py                      # regenera los .svg
qlmanage -t -s 1080 -o . post1-stats.svg && mv -f post1-stats.svg.png post1-stats.png
```
Edita textos/datos en `_build_posts.py` y vuelve a correr.

## Notas
- Datos ilustrativos (7, 56%, 32.3 putts…). Cámbialos en `_build_posts.py` por los tuyos reales.
- Tipografía del render: si esta Mac no tiene Inter instalada, cae a Helvetica (casi idéntica).
