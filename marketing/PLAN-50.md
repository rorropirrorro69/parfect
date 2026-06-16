# PLAN 50 — Playbook de 14 días para los primeros 50 usuarios

> **Objetivo:** 50 golfistas de Morelia que **instalaron PARFECT y registraron ≥1 ronda real**.
> (Instalar no cuenta. Registrar una ronda = sí lo usó = usuario de verdad.)
> **Estrategia:** red cercana (warm) + caballo de Troya **Parfect Party**. Mensaje líder = **datos**.
> **Tu inversión:** alta (plan agresivo). **Hitos:** Día 7 → **25** · Día 14 → **50**.

---

## La idea central (en 20 segundos)
La gente NO instala apps por un post. Instala porque **un amigo se las enseñó en el campo**. Así que el motor de los 50 eres **tú, en persona y por WhatsApp**, con dos palancas:

1. **Pitch de datos 1:1** → "mira lo que te dice de tu juego" (mostrar tu cel con datos demo cargados).
2. **Party como multiplicador** → organiza rondas reales: para unirse a tu Party, **tienen que instalar**. 1 ronda = ~4 usuarios de golpe.

Instagram corre en paralelo, pero su trabajo es **dar legitimidad** ("tienen presencia, esto va en serio"), no traer los 50. No te frustres si IG crece lento: no es ahí donde están tus 50.

---

## ⚠️ Antes de invitar a NADIE — leer esto
La app guarda las cuentas **localmente en cada dispositivo** (no hay login real entre teléfonos todavía, Supabase está vacío). Implicaciones honestas:
- Un usuario que **borra su navegador o cambia de teléfono pierde sus datos.** No lo escondas; di "guárdalo en pantalla de inicio y no borres el navegador".
- **No tienes un panel que cuente los 50 por ti.** Por eso llevamos el conteo a mano en `seguimiento-50.csv`. Cada persona la registras tú.
- *(Para tu OTRA conversación de diseño, no aquí):* conectar **Supabase** = cuentas reales entre dispositivos + poder **contar usuarios de verdad**. Es el upgrade #1 antes de pasar de 50 a 500. La config ya está lista en `js/config.js`, solo faltan las llaves.

---

## Día 0 — Montaje (2–3 h, una sola vez)
Sin esto, cada invitación pierde fuerza. Hazlo todo hoy.

- [ ] **Link corto memorable.** Crea `bit.ly/parfect-golf` (o registra `parfect.golf`) → apunta a la URL real. Que puedas decirlo en voz alta en el campo.
- [ ] **Cuenta de Instagram** `@parfect.golf` con la bio y los assets del kit (`marketing/MENSAJES.md` → sección IG). 3 min.
- [ ] **Carga datos demo en TU teléfono.** Perfil → "Cargar datos de ejemplo". Así, cuando enseñes la app, ya se ve llena de stats y diagnóstico — no vacía. **Esto vende solo.**
- [ ] **Toma 6 capturas** en modo oscuro: radar de stats, diagnóstico IA, scorecard de una ronda, tabla por hándicap, una Party en vivo, evolución de score. Son tu munición de contenido para 2 semanas.
- [ ] **Abre `seguimiento-50.csv`** y vacía ahí los nombres de tus ~20 amigos golfistas más cercanos (tu Tier 1). Tener la lista hace que de verdad les escribas.
- [ ] **Prepara el "kit de instalación"** (cómo agregarla a inicio en iPhone/Android) — copy en `MENSAJES.md`. La fricción #1 es que no sepan instalarla.

---

## Semana 1 — Núcleo caliente (meta: 25 usuarios)

### Días 1–3 · Blitz Tier 1 (los 20 más cercanos) → ~12 usuarios
- Manda el **DM 1:1 personalizado** (`MENSAJES.md` → "WhatsApp 1:1") a tus ~20 amigos golfistas. **Uno por uno, personalizado**, NO copy-paste masivo (se nota y convierte la mitad).
- A cada "sí": mándale el **kit de instalación** y pídele que **registre 1 ronda** (aunque sea de memoria, su última vuelta). Márcalo en el CSV solo cuando registre.
- Regla de oro: **no sueltes el link y ya.** Acompaña hasta que tenga su primera ronda capturada. Una ronda registrada = se queda; un link sin abrir = se pierde.

### Días 3–6 · Primera Parfect Party real → ~4–6 usuarios + ruido
- Organiza una ronda real con un grupo (Campestre/Tres Marías/Altozano). En el tee del 1: *"hoy las cuentas las lleva esta app, métanse a la Party"*. Código de 4 letras, se unen desde su cel = **instalan a fuerza**.
- Al final: enséñales su scorecard y la liquidación automática ("tú le debes 2 a Beto"). Ahí enganchan.
- Pídeles una **foto/story etiquetando el campo y @parfect.golf**.

### Días 5–7 · Grupos de WhatsApp de golf → ~8–12 usuarios
- En tus 2–3 grupos de golf, **post de valor primero** (`MENSAJES.md` → "WhatsApp a grupo"): un dato útil o tu propio diagnóstico, y *luego* el CTA con marco de exclusividad: **"busco 50 fundadores de Morelia para probarla, ¿quién entra?"**.
- El marco **"socio fundador / los primeros 50"** convierte mucho mejor que "descárguenla". La gente entra a algo exclusivo, no a una descarga.

**Cierre de semana 1:** revisa el CSV. ¿Vas en ~25? Si vas corto, el hueco casi siempre es "instalaron pero no registraron ronda" → reescríbeles 1:1 y acompáñalos a su primera ronda.

---

## Semana 2 — Multiplicar y anclar (meta: llegar a 50)

### Días 8–10 · Presencia en el campo → ~8 usuarios
- Habla con el **pro / starter / encargado del torneo** de tu campo principal (`MENSAJES.md` → "Pitch al campo"). Pide 2 cosas: dejar un **QR en el pro shop** y que **mencionen PARFECT en el próximo torneo** ("suban su tarjeta en la app").
- Lleva el QR impreso (apunta al link corto). Un torneo = 20–40 golfistas en un lugar = tu mejor pesca de la quincena.

### Días 9–12 · Bucle de referidos → ~10 usuarios
- A tus primeros ~20 usuarios, pídeles **una** cosa: *"invita a tu foursome del domingo"* (`MENSAJES.md` → "Referido"). Cada uno trae 1–3.
- Activa "comparte tu tarjeta": que suban su scorecard/stats a stories etiquetando @parfect.golf. Cada tarjeta compartida = anuncio gratis frente a otros golfistas.

### Días 11–14 · Segunda y tercera Party + cierre → completa los 50
- Organiza **2 rondas más** con grupos distintos a los de la semana 1 (otros amigos, otra mesa del club). ~8 usuarios más.
- **Empuja a los rezagados:** repasa el CSV, filtra "invitado" sin "registró ronda" y dales el último empujón personal.
- **Día 14:** cuenta los registrados. Celebra los 50 con un post "50 fundadores en Morelia 🎉" — eso mismo se vuelve prueba social para los siguientes 50.

---

## La matemática (por qué 50 es realista)
| Fuente | Alcance | Conversión | Usuarios |
|---|---|---|---|
| Tier 1 (1:1) | ~20 | ~60% | ~12 |
| 3 Parties reales | ~14 | ~85% | ~12 |
| Grupos de WhatsApp | ~150 | ~8% | ~12 |
| Campo / torneo + QR | ~40 | ~20% | ~8 |
| Referidos del foursome | — | — | ~10 |
| **Total** | | | **~54** ✅ |

Hay colchón. El riesgo NO es el alcance — es la **fricción de instalación** y que **registren la primera ronda**. Ahí pones tu energía.

---

## Instagram en paralelo (legitimidad, no adquisición)
3 posts/semana + 2–3 stories. Calendario y captions listos en `MENSAJES.md` → sección IG.
Mezcla: 50% datos · 30% "qué practicar" · 20% Party. Capturas reales en modo oscuro.

---

## Cómo medir (sin backend, a mano)
Tu tablero es `seguimiento-50.csv`. Estados:
`pendiente` → `invitado` → `instalo` → `registro_ronda` (← **este es el que cuenta**) → `activo` (volvió a registrar otra ronda).

**North Star de los 14 días:** 50 en estado `registro_ronda` o mejor.
**Métrica de salud:** cuántos llegan a `activo` (2da ronda). Si muchos se quedan en 1 ronda, el problema es retención/producto, no marketing — y eso es señal para tu conversación de diseño.

---

## Reglas para no quemar tu red
- **Nunca el mismo copy a todos.** Personaliza. Warm mal hecho = spam.
- **Acompaña hasta la primera ronda.** El handoff "aquí está el link, suerte" mata la conversión.
- **Aporta antes de pedir.** En grupos: valor primero, CTA después.
- **Una pedida por persona.** No persigas. Si no entró, déjalo y vuelve cuando tengas algo nuevo que enseñar.
