#!/usr/bin/env python3
# Genera las 9 imagenes de Instagram (1080x1080, RGB, sin alfa) FIELES a la marca real
# de PARFECT: fondo verde-cielo, hero lima, numeros navy, tarjetas blancas, personajes 3D.
import os, math
from PIL import Image, ImageDraw, ImageFont

HERE   = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, '..', '..', 'assets'))
S = 1080

FP='/System/Library/Fonts/Supplemental/'
BLACK  = lambda s: ImageFont.truetype(FP+'Arial Black.ttf', s)
BOLD   = lambda s: ImageFont.truetype(FP+'Arial Bold.ttf', s)
BOLDIT = lambda s: ImageFont.truetype(FP+'Arial Bold Italic.ttf', s)
REG    = lambda s: ImageFont.truetype(FP+'Arial.ttf', s)

INK=(27,42,24); MUT=(111,126,96); LIME=(199,238,84); LIMEINK=(44,58,22)
WHITE=(255,255,255); GREEN=(59,109,17); GOLD=(240,190,70); SIL=(196,205,214); BRZ=(206,140,90)
SKY=[(238,246,223),(225,239,198),(206,229,166)]
HERO=[(158,211,99),(196,233,140)]

def lerp(a,b,t): return tuple(round(a[i]+(b[i]-a[i])*t) for i in range(3))
def vgrad(w,h,stops):
    col=Image.new('RGB',(1,h)); px=col.load(); n=len(stops)-1
    for y in range(h):
        t=y/(h-1); seg=min(int(t*n),n-1); lt=t*n-seg
        px[0,y]=lerp(stops[seg],stops[seg+1],lt)
    return col.resize((w,h))
def rounded_grad(w,h,stops,r):
    g=vgrad(w,h,stops).convert('RGBA')
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle([0,0,w-1,h-1],r,fill=255)
    g.putalpha(m); return g
def paste3d(base,name,cx,cy,size):
    im=Image.open(os.path.join(ASSETS,name)).convert('RGBA')
    r=size/max(im.size); im=im.resize((round(im.width*r),round(im.height*r)))
    base.alpha_composite(im,(round(cx-im.width/2),round(cy-im.height/2)))
def wordmark(d,cx,y,size=40):
    f=BOLDIT(size); txt='PARFECT'; tw=d.textlength(txt,font=f); fl=int(size*0.95)
    px=cx-tw/2-int(size*1.05)
    d.line([(px,y-fl*0.5),(px,y+fl*0.5)],fill=LIMEINK,width=max(3,int(size*0.10)))
    d.polygon([(px,y-fl*0.5),(px+fl*0.7,y-fl*0.30),(px,y-fl*0.10)],fill=LIME)
    d.text((cx+int(size*0.18),y),txt,font=f,fill=LIMEINK,anchor='lm')
def card(base,d,x,y,w,h,r=26,fill=WHITE):
    sh=Image.new('RGBA',(S,S),(0,0,0,0))
    ImageDraw.Draw(sh).rounded_rectangle([x,y+8,x+w,y+h+8],r,fill=(44,58,22,32))
    base.alpha_composite(sh)
    d.rounded_rectangle([x,y,x+w,y+h],r,fill=fill)
def pill(d,cx,y,text,fnt,padx=26,padh=52,fill=LIME,fg=LIMEINK):
    tw=d.textlength(text,font=fnt); w=tw+padx*2
    d.rounded_rectangle([cx-w/2,y,cx+w/2,y+padh],padh/2,fill=fill)
    d.text((cx,y+padh/2),text,font=fnt,fill=fg,anchor='mm')
def base():
    b=vgrad(S,S,SKY).convert('RGBA'); d=ImageDraw.Draw(b); wordmark(d,S//2,60); return b,d
def footer(d,sub='GRATIS · PARA MORELIA PRIMERO'):
    d.text((S//2,1004),'@parfect.golf',font=BOLD(34),fill=INK,anchor='mm')
    d.text((S//2,1044),sub,font=BOLD(20),fill=MUT,anchor='mm')
def fin(b): return b.convert('RGB')

# ---------- POST 1: gancho + radar ----------
def p1():
    b,d=base()
    d.text((S//2,176),'¿SABES DE VERDAD',font=BLACK(66),fill=INK,anchor='mm')
    d.text((S//2,248),'CÓMO JUEGAS?',font=BLACK(66),fill=INK,anchor='mm')
    cx,cy,R=540,650,210
    vals=[0.82,0.55,0.45,0.72,0.5,0.62]; labs=['SALIDA','APPROACH','CHIP','PUTT','GIR','SCRAMBLE']
    def pt(r,i):
        a=math.radians(-90+60*i); return (cx+r*math.cos(a), cy+r*math.sin(a))
    for ring in (R,R*0.66,R*0.33):
        d.polygon([pt(ring,i) for i in range(6)],outline=(176,194,150),width=2)
    for i in range(6): d.line([(cx,cy),pt(R,i)],fill=(176,194,150),width=2)
    ov=Image.new('RGBA',(S,S),(0,0,0,0))
    ImageDraw.Draw(ov).polygon([pt(R*vals[i],i) for i in range(6)],fill=(199,238,84,150))
    b.alpha_composite(ov)
    d.polygon([pt(R*vals[i],i) for i in range(6)],outline=GREEN,width=5)
    for i in range(6):
        x,y=pt(R*vals[i],i); d.ellipse([x-7,y-7,x+7,y+7],fill=GREEN)
    anch=['ma','la','la','md','ra','ra']; off=[(0,-28),(24,0),(24,8),(0,30),(-24,8),(-24,0)]
    for i,(lb,an,o) in enumerate(zip(labs,anch,off)):
        x,y=pt(R+8,i); d.text((x+o[0],y+o[1]),lb,font=BOLD(25),fill=MUT,anchor='mm')
    footer(d); return fin(b)

# ---------- POST 2: dashboard (tus numeros) ----------
def p2():
    b,d=base()
    d.text((S//2,172),'TUS NÚMEROS REALES',font=BLACK(60),fill=INK,anchor='mm')
    hx,hy,hw,hh=70,240,940,300
    b.alpha_composite(rounded_grad(hw,hh,HERO,34),(hx,hy))
    d.text((hx+48,hy+58),'CAZADOR DE PARES',font=BLACK(26),fill=LIMEINK,anchor='lm')
    d.text((hx+40,hy+175),'7',font=BLACK(200),fill=WHITE,anchor='lm')
    d.text((hx+50,hy+262),'Tu hándicap · Campestre',font=BOLD(26),fill=LIMEINK,anchor='lm')
    paste3d(b,'golfer.png',hx+hw-170,hy+hh//2,300)
    for k,(n,u,lbl) in enumerate([('56','%','Fairways'),('51','%','GIR'),('41','%','Up & down')]):
        sx=70+k*325; card(b,d,sx,580,290,250,r=24)
        d.text((sx+34,580+135),n,font=BLACK(84),fill=INK,anchor='lm')
        tw=d.textlength(n,font=BLACK(84)); d.text((sx+34+tw+8,580+150),u,font=BLACK(40),fill=MUT,anchor='lm')
        d.text((sx+34,580+200),lbl,font=BOLD(27),fill=MUT,anchor='lm')
    d.text((S//2,902),'Anota tu ronda en segundos.',font=BOLD(34),fill=INK,anchor='mm')
    footer(d); return fin(b)

# ---------- POST 3: diagnostico ----------
def p3():
    b,d=base()
    d.text((80,168),'DEJA DE PRACTICAR',font=BLACK(64),fill=INK,anchor='lm')
    d.text((80,238),'AL AZAR.',font=BLACK(64),fill=GREEN,anchor='lm')
    card(b,d,70,300,940,560,r=34)
    pill(d,70+230,344,'PRIORIDAD 1 · ENFOQUE',BLACK(22),padh=48)
    d.text((110,470),'Putting',font=BLACK(60),fill=INK,anchor='lm')
    d.text((110,540),'Promedias 32.3 putts/ronda',font=BOLD(28),fill=INK,anchor='lm')
    d.text((110,580),'(referencia: 30.3).',font=BOLD(28),fill=MUT,anchor='lm')
    d.text((110,628),'TU EJERCICIO · 0/3 HOY',font=BLACK(22),fill=MUT,anchor='lm')
    card(b,d,110,656,860,170,r=22,fill=(246,250,236))
    d.text((150,712),'Lag putting a círculo de 1 m',font=BLACK(34),fill=INK,anchor='lm')
    d.text((150,760),'3 series × 6 putts',font=BOLD(25),fill=MUT,anchor='lm')
    d.text((150,795),'Éxito: ≥ 5/6 dentro del círculo',font=BOLD(25),fill=GREEN,anchor='lm')
    d.text((930,760),'Ver →',font=BLACK(30),fill=INK,anchor='rm')
    d.text((S//2,915),'PARFECT te dice qué practicar.',font=BLACK(40),fill=GREEN,anchor='mm')
    footer(d,'STATS + ENTRENADOR IA · GRATIS EN MORELIA'); return fin(b)

# ---------- POST 4: evolucion de score ----------
def p4():
    b,d=base()
    d.text((80,166),'MEJORA CON DATOS,',font=BLACK(58),fill=INK,anchor='lm')
    d.text((80,232),'NO CON CORAZONADAS.',font=BLACK(58),fill=INK,anchor='lm')
    card(b,d,70,300,940,540,r=34)
    d.text((110,360),'TU SCORE · ÚLTIMAS 10 RONDAS',font=BLACK(24),fill=MUT,anchor='lm')
    pill(d,860,372,'−10',BLACK(26),padh=52,fill=LIME);
    scores=[92,90,91,88,89,86,87,84,85,82]
    bx,by,bw,bh=130,440,820,300; smin,smax=min(scores)-1,max(scores)+1
    pts=[(bx+i/(len(scores)-1)*bw, by+(s-smin)/(smax-smin)*bh) for i,s in enumerate(scores)]
    ov=Image.new('RGBA',(S,S),(0,0,0,0)); od=ImageDraw.Draw(ov)
    od.polygon(pts+[(pts[-1][0],by+bh),(pts[0][0],by+bh)],fill=(199,238,84,120))
    b.alpha_composite(ov)
    d.line(pts,fill=GREEN,width=6,joint='curve')
    for x,y in pts: d.ellipse([x-7,y-7,x+7,y+7],fill=GREEN,outline=WHITE,width=2)
    d.text((bx,by+bh+34),'antes',font=BOLD(24),fill=MUT,anchor='lm')
    d.text((bx+bw,by+bh+34),'hoy',font=BOLD(24),fill=GREEN,anchor='rm')
    d.text((S//2,905),'Tu juego, medido ronda a ronda.',font=BOLD(34),fill=INK,anchor='mm')
    footer(d); return fin(b)

# ---------- POST 5: que te falta para bajar a 10 ----------
def p5():
    b,d=base()
    d.text((S//2,176),'¿QUÉ TE FALTA',font=BLACK(64),fill=INK,anchor='mm')
    d.text((S//2,248),'PARA BAJAR A 10?',font=BLACK(64),fill=INK,anchor='mm')
    card(b,d,70,320,940,560,r=34)
    rows=[('Fairways',0.56,0.62,'56% → 62%'),('Greens en regulación',0.51,0.58,'51% → 58%'),
          ('Salvar el par',0.41,0.53,'41% → 53%'),('Putts por ronda',0.40,0.55,'32 → 30')]
    ry=388
    for name,val,goal,txt in rows:
        d.text((120,ry),name,font=BLACK(30),fill=INK,anchor='lm')
        d.text((960,ry),txt,font=BOLD(26),fill=MUT,anchor='rm')
        tx,tw,th=120,840,16; ty=ry+30
        d.rounded_rectangle([tx,ty,tx+tw,ty+th],th/2,fill=(225,233,210))
        d.rounded_rectangle([tx,ty,tx+tw*val,ty+th],th/2,fill=LIME)
        gx=tx+tw*goal; d.line([(gx,ty-6),(gx,ty+th+6)],fill=GREEN,width=4)
        ry+=124
    d.text((S//2,925),'PARFECT te marca el camino.',font=BLACK(38),fill=GREEN,anchor='mm')
    footer(d); return fin(b)

# ---------- POST 6: el dato que te cuesta golpes ----------
def p6():
    b,d=base()
    d.text((S//2,176),'EL DATO QUE TE CUESTA',font=BLACK(54),fill=INK,anchor='mm')
    d.text((S//2,242),'MÁS GOLPES.',font=BLACK(54),fill=INK,anchor='mm')
    card(b,d,70,320,940,470,r=34)
    paste3d(b,'eagle.png',850,470,230)
    d.text((130,500),'41',font=BLACK(220),fill=INK,anchor='lm')
    tw=d.textlength('41',font=BLACK(220)); d.text((130+tw+6,470),'%',font=BLACK(90),fill=MUT,anchor='lm')
    d.text((135,640),'Salvas el par (up & down)',font=BLACK(36),fill=INK,anchor='lm')
    d.text((135,700),'Tu mayor fuga: −2.4 golpes/ronda',font=BOLD(28),fill=GREEN,anchor='lm')
    d.text((S//2,850),'Sabes qué te falla. Lo atacas.',font=BLACK(40),fill=INK,anchor='mm')
    footer(d); return fin(b)

# ---------- POST 7: Parfect Party ----------
def p7():
    b,d=base()
    d.text((S//2,176),'EL QUE PIERDE, PAGA.',font=BLACK(58),fill=INK,anchor='mm')
    d.text((S//2,244),'PARFECT LLEVA LA CUENTA.',font=BLACK(36),fill=GREEN,anchor='mm')
    card(b,d,70,310,940,470,r=34)
    d.text((110,360),'LIGA DE AMIGOS · EN VIVO',font=BLACK(22),fill=MUT,anchor='lm')
    people=[('1','Tú','HCP 7','+1',GOLD,True),('2','Rodrigo','HCP 5','+3',SIL,False),
            ('3','Diego','HCP 8','+10',BRZ,False),('4','Mariana','HCP 14','+16',(225,233,210),False)]
    ry=410
    for rank,name,hcp,sc,bg,me in people:
        if me: d.rounded_rectangle([95,ry-6,985,ry+66],18,fill=(235,247,200))
        d.ellipse([120,ry+2,172,ry+54],fill=bg); d.text((146,ry+28),rank,font=BLACK(28),fill=LIMEINK,anchor='mm')
        d.text((196,ry+16),name,font=BLACK(32),fill=INK,anchor='lm')
        d.text((196,ry+48),hcp,font=BOLD(22),fill=MUT,anchor='lm')
        d.text((960,ry+30),sc,font=BLACK(40),fill=INK,anchor='rm')
        ry+=86
    d.text((S//2,850),'Skins · La corta · Medal · Match',font=BOLD(32),fill=INK,anchor='mm')
    footer(d); return fin(b)

# ---------- POST 8: biblioteca de drills ----------
def p8():
    b,d=base()
    d.text((S//2,176),'50 EJERCICIOS.',font=BLACK(70),fill=INK,anchor='mm')
    d.text((S//2,248),'PARA CADA PARTE DE TU JUEGO.',font=BLACK(36),fill=GREEN,anchor='mm')
    drills=[('Lag putting 1 m','3×6 · ≥5/6'),('Gate de salida','3×10 · ≥7/10'),
            ('Reloj de 1.5 m','2 vueltas · ≥14/16'),('Wedges 3 distancias','30 bolas · ≥18'),
            ('Bunker salida','20 · ≥12 en green'),('Chip a bandera','15 · ≥9 a 1 m')]
    for i,(t,m) in enumerate(drills):
        col=i%2; row=i//2; x=70+col*485; y=330+row*195
        card(b,d,x,y,455,170,r=22)
        d.text((x+34,y+58),t,font=BLACK(32),fill=INK,anchor='lm')
        d.text((x+34,y+108),m,font=BOLD(26),fill=GREEN,anchor='lm')
    d.text((S//2,925),'Cada uno con dosis y métrica de éxito.',font=BOLD(30),fill=INK,anchor='mm')
    footer(d); return fin(b)

# ---------- POST 9: fundadores ----------
def p9():
    b,d=base()
    d.text((S//2,210),'BUSCO',font=BLACK(50),fill=INK,anchor='mm')
    paste3d(b,'golfer.png',215,560,300)
    paste3d(b,'flag.png',865,560,280)
    d.text((S//2,560),'50',font=BLACK(300),fill=INK,anchor='mm')
    d.text((S//2,748),'FUNDADORES',font=BLACK(74),fill=INK,anchor='mm')
    d.text((S//2,820),'EN MORELIA',font=BLACK(74),fill=INK,anchor='mm')
    pill(d,S//2,876,'ESTRENA PARFECT · GRATIS · HOY',BLACK(26),padh=62)
    footer(d,'RORROPIRRORRO69.GITHUB.IO/PARFECT'); return fin(b)

POSTS=[('post1-gancho',p1),('post2-stats',p2),('post3-diagnostico',p3),('post4-evolucion',p4),
       ('post5-handicap',p5),('post6-dato',p6),('post7-party',p7),('post8-drills',p8),('post9-fundadores',p9)]

# limpia svg/png viejos de la version anterior
for old in os.listdir(HERE):
    if old.endswith('.svg') or old in ('post1-stats.png','post2-diagnostico.png','post3-fundadores.png'):
        try: os.remove(os.path.join(HERE,old))
        except: pass

imgs=[]
for name,fn in POSTS:
    im=fn(); im.save(os.path.join(HERE,name+'.png')); imgs.append(im); print('wrote',name+'.png')

# cuadricula 3x3 de preview
g=Image.new('RGB',(S*3+40,S*3+40),(255,255,255))
for i,im in enumerate(imgs):
    g.paste(im,((i%3)*(S+10), (i//3)*(S+10)))
g.resize((g.width//3,g.height//3)).save(os.path.join(HERE,'grid-preview.png'))
print('grid-preview.png listo')
