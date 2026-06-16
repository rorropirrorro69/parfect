#!/usr/bin/env python3
# Genera los posts de Instagram de PARFECT FIELES al design system real de la app:
# fondo verde-cielo claro, hero con degradado lima, numeros navy enormes, tarjetas
# blancas redondeadas, wordmark italico, y los personajes 3D reales embebidos.
import base64, os

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, '..', '..', 'assets'))

def data_uri(name):
    with open(os.path.join(ASSETS, name), 'rb') as f:
        b = base64.b64encode(f.read()).decode('ascii')
    return 'data:image/png;base64,' + b

GOLFER = data_uri('golfer.png')
FLAG   = data_uri('flag.png')
TROPHY = data_uri('trophy.png')

# ---- Tokens reales (tema claro / diurno) ----
INK   = '#1B2A18'   # texto principal (verde-navy oscuro)
INK2  = '#283022'   # wordmark
MUT   = '#6f7e60'   # muted
LIME  = '#C7EE54'   # acento lima
LIMEINK = '#2c3a16' # texto sobre lima
FONT  = "Inter,'Helvetica Neue',Arial,sans-serif"

DEFS = (
  '<defs>'
  '<style>@import url("https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;0,800;0,900;1,800;1,900&amp;display=swap");</style>'
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
  '<stop offset="0%" stop-color="#eef6df"/><stop offset="52%" stop-color="#e1efc6"/><stop offset="100%" stop-color="#d2e7ac"/>'
  '</linearGradient>'
  '<linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">'
  '<stop offset="0%" stop-color="#9ed363"/><stop offset="100%" stop-color="#c2e88a"/>'
  '</linearGradient>'
  '<radialGradient id="heroglow" cx="78%" cy="40%" r="55%">'
  '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>'
  '</radialGradient>'
  '</defs>'
)

def head(w=1080, h=1080):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{w}" height="{h}" viewBox="0 0 {w} {h}">{DEFS}'
            f'<rect width="{w}" height="{h}" fill="url(#sky)"/>')

def wordmark(cx, y):
    # banderita lima + PARFECT en italica
    fx = cx - 150
    return (
      f'<g transform="translate({fx},{y-26})">'
      f'<line x1="0" y1="0" x2="0" y2="30" stroke="{INK2}" stroke-width="4" stroke-linecap="round"/>'
      f'<path d="M0,1 L26,8 L0,16 Z" fill="{LIME}"/>'
      f'</g>'
      f'<text x="{cx+18}" y="{y}" text-anchor="middle" font-family="{FONT}" font-style="italic" '
      f'font-weight="900" font-size="32" letter-spacing="6" fill="{INK2}">PARFECT</text>'
    )

def card(x, y, w, h, rx=28, fill='#ffffff'):
    # tarjeta blanca con sombra suave (rect difuso detras)
    return (
      f'<rect x="{x}" y="{y+8}" width="{w}" height="{h}" rx="{rx}" fill="#2c3a16" opacity="0.08"/>'
      f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="rgba(40,60,20,0.08)" stroke-width="1.5"/>'
    )

def pill(x, y, text, w):
    return (
      f'<rect x="{x}" y="{y}" width="{w}" height="50" rx="25" fill="{LIME}"/>'
      f'<text x="{x+w/2}" y="{y+33}" text-anchor="middle" font-family="{FONT}" font-weight="900" '
      f'font-size="22" letter-spacing="2" fill="{LIMEINK}">{text}</text>'
    )

def footer(svg, link=None):
    svg += (f'<text x="540" y="1004" text-anchor="middle" font-family="{FONT}" font-weight="900" '
            f'font-size="32" letter-spacing="1" fill="{INK}">@parfect.golf</text>')
    sub = link or 'GRATIS · PARA MORELIA PRIMERO'
    svg += (f'<text x="540" y="1044" text-anchor="middle" font-family="{FONT}" font-weight="800" '
            f'font-size="20" letter-spacing="5" fill="{MUT}">{sub}</text>')
    return svg

# ============ POST 1 — Data hero (dashboard real) ============
def post1():
    s = head()
    s += wordmark(540, 96)
    s += (f'<text x="540" y="208" text-anchor="middle" font-family="{FONT}" font-weight="900" '
          f'font-size="70" letter-spacing="-0.5" fill="{INK}">¿SABES DE VERDAD</text>')
    s += (f'<text x="540" y="284" text-anchor="middle" font-family="{FONT}" font-weight="900" '
          f'font-size="70" letter-spacing="-0.5" fill="{INK}">CÓMO JUEGAS?</text>')
    # hero card lima con golfista + handicap
    s += f'<rect x="70" y="338" width="940" height="300" rx="34" fill="url(#hero)"/>'
    s += f'<rect x="70" y="338" width="940" height="300" rx="34" fill="url(#heroglow)"/>'
    s += (f'<text x="118" y="404" font-family="{FONT}" font-weight="900" font-size="24" '
          f'letter-spacing="2" fill="{LIMEINK}">CAZADOR DE PARES</text>')
    s += (f'<text x="110" y="560" font-family="{FONT}" font-weight="900" font-size="170" fill="#ffffff">7</text>')
    s += (f'<text x="120" y="610" font-family="{FONT}" font-weight="800" font-size="26" '
          f'fill="{LIMEINK}">Tu hándicap · Campestre</text>')
    s += f'<image href="{GOLFER}" xlink:href="{GOLFER}" x="690" y="345" width="300" height="300" preserveAspectRatio="xMidYMid meet"/>'
    # 3 tarjetas de stats
    stats = [('56','%','Fairways'), ('51','%','GIR'), ('41','%','Up &amp; down')]
    cx = 70
    for n, u, lbl in stats:
        s += card(cx, 672, 290, 256, rx=26)
        s += (f'<text x="{cx+34}" y="812" font-family="{FONT}" font-weight="900" font-size="84" fill="{INK}">{n}'
              f'<tspan font-size="40" fill="{MUT}">{u}</tspan></text>')
        s += (f'<text x="{cx+34}" y="862" font-family="{FONT}" font-weight="800" font-size="28" fill="{MUT}">{lbl}</text>')
        cx += 325
    s = footer(s)
    return s + '</svg>'

# ============ POST 2 — Diagnóstico IA ============
def post2():
    s = head()
    s += wordmark(540, 96)
    s += (f'<text x="80" y="206" font-family="{FONT}" font-weight="900" font-size="68" '
          f'letter-spacing="-0.5" fill="{INK}">DEJA DE PRACTICAR</text>')
    s += (f'<text x="80" y="282" font-family="{FONT}" font-weight="900" font-size="68" '
          f'letter-spacing="-0.5" fill="{INK}">AL AZAR.</text>')
    s += card(70, 330, 940, 560, rx=34)
    s += pill(110, 372, 'PRIORIDAD 1 · ENFOQUE', 420)
    s += (f'<text x="110" y="488" font-family="{FONT}" font-weight="900" font-size="62" fill="{INK}">Putting</text>')
    s += (f'<text x="110" y="545" font-family="{FONT}" font-weight="800" font-size="30" fill="{INK}">'
          f'Promedias 32.3 putts por ronda <tspan fill="{MUT}">(ref. 30.3).</tspan></text>')
    s += (f'<text x="110" y="612" font-family="{FONT}" font-weight="900" font-size="22" '
          f'letter-spacing="3" fill="{MUT}">TU EJERCICIO · 0/3 HOY</text>')
    # drill sub-card
    s += card(110, 636, 860, 210, rx=24, fill='#f6faec')
    s += (f'<text x="150" y="704" font-family="{FONT}" font-weight="900" font-size="38" fill="{INK}">Lag putting a círculo de 1 m</text>')
    s += (f'<text x="150" y="752" font-family="{FONT}" font-weight="800" font-size="26" fill="{MUT}">3 series × 6 putts</text>')
    s += (f'<text x="150" y="794" font-family="{FONT}" font-weight="800" font-size="26" fill="#3b6d11">Éxito: ≥ 5/6 dentro del círculo</text>')
    s += (f'<text x="930" y="752" text-anchor="end" font-family="{FONT}" font-weight="900" font-size="30" fill="{INK}">Ver →</text>')
    s += (f'<text x="540" y="952" text-anchor="middle" font-family="{FONT}" font-weight="900" font-size="40" '
          f'letter-spacing="1" fill="#3b6d11">PARFECT te dice qué practicar.</text>')
    s = footer(s, 'STATS + ENTRENADOR IA · GRATIS EN MORELIA')
    return s + '</svg>'

# ============ POST 3 — 50 fundadores ============
def post3():
    s = head()
    s += wordmark(540, 100)
    s += (f'<text x="540" y="226" text-anchor="middle" font-family="{FONT}" font-weight="900" '
          f'font-size="50" letter-spacing="10" fill="{INK}">BUSCO</text>')
    # golfista izq, bandera der flanqueando el 50
    s += f'<image href="{GOLFER}" xlink:href="{GOLFER}" x="70" y="300" width="280" height="280" preserveAspectRatio="xMidYMid meet"/>'
    s += f'<image href="{FLAG}" xlink:href="{FLAG}" x="740" y="320" width="270" height="270" preserveAspectRatio="xMidYMid meet"/>'
    s += (f'<text x="540" y="560" text-anchor="middle" font-family="{FONT}" font-weight="900" '
          f'font-size="300" letter-spacing="-8" fill="{INK}">50</text>')
    s += (f'<text x="540" y="710" text-anchor="middle" font-family="{FONT}" font-weight="900" '
          f'font-size="74" letter-spacing="2" fill="{INK}">FUNDADORES</text>')
    s += (f'<text x="540" y="790" text-anchor="middle" font-family="{FONT}" font-weight="900" '
          f'font-size="74" letter-spacing="2" fill="{INK}">EN MORELIA</text>')
    s += pill(540-260, 838, 'ESTRENA PARFECT · GRATIS · HOY', 520)
    s = footer(s, 'RORROPIRRORRO69.GITHUB.IO/PARFECT')
    return s + '</svg>'

for name, fn in [('post1-stats', post1), ('post2-diagnostico', post2), ('post3-fundadores', post3)]:
    with open(os.path.join(HERE, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(fn())
    print('wrote', name + '.svg')
