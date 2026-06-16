# Posts de Instagram — imágenes listas

PNG 1080×1080 (formato cuadrado de feed), en marca PARFECT (negro `#070b06` + lima `#c9f73e`).
El `.svg` es el editable; el `.png` es el que subes a Instagram.

| Imagen | Pilar | Caption (en `../MENSAJES.md`) |
|---|---|---|
| `post1-radar.png` | Datos | Post 1 — radar de 6 ejes: *"¿Sabes de verdad cómo juegas?"* |
| `post2-diagnostico.png` | Entrenador IA | Post 2 — diagnóstico: *"Fallaste corto el 60% de tus greens."* |
| `post3-fundadores.png` | CTA | Post 9 — *"Busco 50 fundadores en Morelia."* |

## Notas
- Los **datos son ilustrativos** (radar, 60%, drill). Cuando termines el rediseño, lo ideal es
  reemplazar estas con **capturas reales** de tu app en modo oscuro — convierten aún mejor.
- Tipografía del mockup: Helvetica/Arial Black (Inter no está instalada en esta Mac). La marca
  real usa **Inter**; el look pesado/mayúsculas se mantiene casi idéntico.

## Regenerar un PNG tras editar el SVG
```bash
cd ~/claude/parfect/marketing/posts
qlmanage -t -s 1080 -o . post1-radar.svg && mv -f post1-radar.svg.png post1-radar.png
```
