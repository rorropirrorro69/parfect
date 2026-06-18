#!/usr/bin/env python3
# Genera frames verticales 4K (2160x3840, 9:16) para un video de TikTok de PARFECT,
# fieles a la marca real (fondo verde-cielo, hero lima, numeros navy, personajes 3D),
# + un manifest (path + escala por frame) que codifica el encoder Swift a MP4.
import os, math
from PIL import Image, ImageDraw, ImageFont

HERE   = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, '..', '..', 'assets'))
FRAMES = os.path.join(HERE, 'frames')
os.makedirs(FRAMES, exist_ok=True)

W, H = 2160, 3840
FPS, HOLD, XF = 30, 78, 15   # 2.6s por escena, 0.5s de transicion

# ---- fuentes (macOS) ----
FP = '/System/Library/Fonts/Supplemental/'
def font(name, size): return ImageFont.truetype(FP + name, size)
BLACK   = lambda s: font('Arial Black.ttf', s)
BOLD    = lambda s: font('Arial Bold.ttf', s)
BOLDIT  = lambda s: font('Arial Bold Italic.ttf', s)
REG     = lambda s: font('Arial.ttf', s)

# ---- colores ----
INK=(27,42,24); MUT=(111,126,96); LIME=(199,238,84); LIMEINK=(44,58,22)
WHITE=(255,255,255); GREEN=(59,109,17)
SKY=[(238,246,223),(225,239,198),(206,229,166)]
HERO=[(158,211,99),(196,233,140)]

def lerp(a,b,t): return tuple(round(a[i]+(b[i]-a[i])*t) for i in range(3))

def vgrad(w,h,stops):
    col=Image.new('RGB',(1,h)); px=col.load()
    n=len(stops)-1
    for y in range(h):
        t=y/(h-1); seg=min(int(t*n),n-1); lt=t*n-seg
        px[0,y]=lerp(stops[seg],stops[seg+1],lt)
    return col.resize((w,h))

def rounded_grad(w,h,stops,radius):
    g=vgrad(w,h,stops).convert('RGBA')
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle([0,0,w-1,h-1],radius,fill=255)
    g.putalpha(m); return g

def paste3d(base, name, cx, cy, size):
    im=Image.open(os.path.join(ASSETS,name)).convert('RGBA')
    r=size/max(im.size); im=im.resize((round(im.width*r),round(im.height*r)))
    base.alpha_composite(im,(round(cx-im.width/2),round(cy-im.height/2)))

def wordmark(d, base, cx, y, scale=1.0):
    s=int(96*scale); fl=int(s*0.95)
    txt='PARFECT'; f=BOLDIT(s)
    tw=d.textlength(txt,font=f)
    # banderita lima a la izquierda del texto
    px=cx - tw/2 - int(s*1.05)
    d.line([(px,y-fl*0.5),(px,y+fl*0.5)], fill=LIMEINK, width=max(4,int(s*0.10)))
    d.polygon([(px,y-fl*0.5),(px+fl*0.7,y-fl*0.30),(px,y-fl*0.10)], fill=LIME)
    d.text((cx+int(s*0.18), y), txt, font=f, fill=LIMEINK, anchor='lm')

def card(base, d, x,y,w,h,radius=44, fill=WHITE):
    sh=Image.new('RGBA',(W,H),(0,0,0,0))
    ImageDraw.Draw(sh).rounded_rectangle([x,y+16,x+w,y+h+16],radius,fill=(44,58,22,40))
    base.alpha_composite(sh)
    d.rounded_rectangle([x,y,x+w,y+h],radius,fill=fill)

def pill(d,cx,y,text,fnt,padx=46,padh=104):
    tw=d.textlength(text,font=fnt); w=tw+padx*2
    d.rounded_rectangle([cx-w/2,y,cx+w/2,y+padh],padh/2,fill=LIME)
    d.text((cx,y+padh/2),text,font=fnt,fill=LIMEINK,anchor='mm')

def new_scene():
    base=vgrad(W,H,SKY).convert('RGBA')
    return base, ImageDraw.Draw(base)

# ============ Escenas ============
def scene_intro():
    b,d=new_scene()
    wordmark(d,b,W//2,560,scale=2.4)
    d.text((W//2,1180),'Deja de practicar.',font=BLACK(132),fill=INK,anchor='mm')
    d.text((W//2,1340),'Empieza a mejorar.',font=BLACK(132),fill=GREEN,anchor='mm')
    paste3d(b,'golfer.png',W//2,2380,1320)
    d.text((W//2,3280),'@parfect.golf',font=BOLD(96),fill=INK,anchor='mm')
    return b.convert('RGB')

def scene_hook():
    b,d=new_scene()
    wordmark(d,b,W//2,300)
    for i,t in enumerate(['¿SABES DE','VERDAD CÓMO','JUEGAS?']):
        d.text((W//2,820+i*230),t,font=BLACK(200),fill=INK,anchor='mm')
    paste3d(b,'golfer.png',W//2,2250,1150)
    pill(d,W//2,3120,'TUS NÚMEROS REALES',BLACK(70))
    return b.convert('RGB')

def scene_stats():
    b,d=new_scene()
    wordmark(d,b,W//2,300)
    d.text((W//2,640),'TUS NÚMEROS REALES',font=BLACK(118),fill=INK,anchor='mm')
    # hero lima
    hx,hy,hw,hh=120,760,1920,760
    b.alpha_composite(rounded_grad(hw,hh,HERO,56),(hx,hy))
    d.text((hx+90,hy+120),'CAZADOR DE PARES',font=BLACK(64),fill=LIMEINK,anchor='lm')
    d.text((hx+70,hy+430),'7',font=BLACK(520),fill=WHITE,anchor='lm')
    d.text((hx+95,hy+660),'Tu hándicap · Campestre',font=BOLD(60),fill=LIMEINK,anchor='lm')
    paste3d(b,'golfer.png',hx+hw-360,hy+hh//2,760)
    # 3 stat cards
    stats=[('56','%','Fairways'),('51','%','GIR'),('41','%','Up & down')]
    cw=600; gap=30; sx=120
    for n,u,lbl in stats:
        card(b,d,sx,1620,cw,560,radius=40)
        d.text((sx+60,1620+300),n,font=BLACK(190),fill=INK,anchor='lm')
        tw=d.textlength(n,font=BLACK(190))
        d.text((sx+60+tw+14,1620+330),u,font=BLACK(90),fill=MUT,anchor='lm')
        d.text((sx+60,1620+440),lbl,font=BOLD(60),fill=MUT,anchor='lm')
        sx+=cw+gap
    # 2 stat cards
    duo=[('32','Putts / ronda'),('10%','Birdie o mejor')]
    cw2=945; sx=120
    for n,lbl in duo:
        card(b,d,sx,2240,cw2,470,radius=40)
        d.text((sx+60,2240+250),n,font=BLACK(170),fill=INK,anchor='lm')
        d.text((sx+60,2240+370),lbl,font=BOLD(58),fill=MUT,anchor='lm')
        sx+=cw2+30
    d.text((W//2,3120),'Anota tu ronda en segundos.',font=BOLD(82),fill=INK,anchor='mm')
    return b.convert('RGB')

def scene_diag():
    b,d=new_scene()
    wordmark(d,b,W//2,300)
    d.text((W//2,640),'DEJA DE PRACTICAR',font=BLACK(150),fill=INK,anchor='mm')
    d.text((W//2,820),'AL AZAR.',font=BLACK(150),fill=GREEN,anchor='mm')
    card(b,d,120,1000,1920,1640,radius=56)
    pill(d,120+470,1080,'PRIORIDAD 1 · ENFOQUE',BLACK(62))
    d.text((210,1380),'Putting',font=BLACK(150),fill=INK,anchor='lm')
    d.text((210,1560),'Promedias 32.3 putts/ronda',font=BOLD(72),fill=INK,anchor='lm')
    d.text((210,1660),'(referencia: 30.3).',font=BOLD(72),fill=MUT,anchor='lm')
    d.text((210,1800),'TU EJERCICIO · 0/3 HOY',font=BLACK(54),fill=MUT,anchor='lm')
    # inner drill card
    card(b,d,210,1870,1740,560,radius=40,fill=(246,250,236))
    d.text((290,2010),'Lag putting a círculo de 1 m',font=BLACK(80),fill=INK,anchor='lm')
    d.text((290,2150),'3 series × 6 putts',font=BOLD(62),fill=MUT,anchor='lm')
    d.text((290,2270),'Éxito: ≥ 5/6 dentro del círculo',font=BOLD(62),fill=GREEN,anchor='lm')
    d.text((1870,2150),'Ver →',font=BLACK(72),fill=INK,anchor='rm')
    d.text((W//2,2880),'PARFECT te dice qué practicar.',font=BLACK(96),fill=GREEN,anchor='mm')
    d.text((W//2,3240),'@parfect.golf',font=BOLD(90),fill=INK,anchor='mm')
    return b.convert('RGB')

def scene_cta():
    b,d=new_scene()
    wordmark(d,b,W//2,360)
    d.text((W//2,760),'BUSCO',font=BLACK(150),fill=INK,anchor='mm')
    paste3d(b,'golfer.png',430,1560,880)
    paste3d(b,'flag.png',1730,1560,820)
    d.text((W//2,1560),'50',font=BLACK(900),fill=INK,anchor='mm')
    d.text((W//2,2240),'FUNDADORES',font=BLACK(200),fill=INK,anchor='mm')
    d.text((W//2,2440),'EN MORELIA',font=BLACK(200),fill=INK,anchor='mm')
    pill(d,W//2,2680,'ESTRENA PARFECT · GRATIS · HOY',BLACK(64),padh=128)
    d.text((W//2,3060),'@parfect.golf',font=BOLD(104),fill=INK,anchor='mm')
    d.text((W//2,3200),'parfectgolf.github.io',font=BOLD(54),fill=MUT,anchor='mm')
    return b.convert('RGB')

SCENES=[('intro',scene_intro),('hook',scene_hook),('stats',scene_stats),
        ('diag',scene_diag),('cta',scene_cta)]

def smooth(t): return t*t*(3-2*t)

print('rendering scenes...')
imgs=[]
for name,fn in SCENES:
    im=fn(); p=os.path.join(FRAMES,f'{name}.png'); im.save(p); imgs.append((name,im,p)); print(' ',name)

print('rendering crossfades...')
xf_paths=[]
for i in range(len(imgs)-1):
    a=imgs[i][1]; bm=imgs[i+1][1]; seq=[]
    for k in range(XF):
        t=smooth((k+1)/(XF+1))
        blended=Image.blend(a,bm,t)
        p=os.path.join(FRAMES,f'xf{i}_{k:02d}.png'); blended.save(p); seq.append(p)
    xf_paths.append(seq)

# ---- manifest: path + escala (Ken Burns suave por escena) ----
lines=[]
for i,(name,im,p) in enumerate(imgs):
    for f in range(HOLD):
        s=1.0+0.030*smooth(f/(HOLD-1))
        lines.append(f'{p} {s:.4f}')
    if i < len(xf_paths):
        for xp in xf_paths[i]:
            lines.append(f'{xp} 1.0000')
with open(os.path.join(HERE,'manifest.txt'),'w') as f:
    f.write('\n'.join(lines))
print(f'frames totales: {len(lines)}  (~{len(lines)/FPS:.1f}s)')
print('manifest.txt listo')
