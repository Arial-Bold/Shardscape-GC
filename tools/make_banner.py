from PIL import Image, ImageDraw, ImageFont
import sys
sys.path.insert(0,'/home/claude/shardart')
S=0.8660254
K=8; W,H=96,32
def font(px):
    f=ImageFont.truetype('Nunito.ttf',int(px*K)); f.set_variation_by_axes([900]); return f
def hexpts(cx,cy,r): return [(cx,cy-r),(cx+S*r,cy-.5*r),(cx+S*r,cy+.5*r),(cx,cy+r),(cx-S*r,cy+.5*r),(cx-S*r,cy-.5*r)]
def markA(d,ox,oy,sc):
    T=lambda p:((ox+p[0]*sc)*K,(oy+p[1]*sc)*K)
    cx,cy,r=120,100,92; y=0
    for t,lc,rc in [(16,'#76571F','#96702A'),(16,'#4B4C50','#5F6066'),(16,'#3A5426','#4C6B30')]:
        a=cy+.5*r+y;b=cy+r+y
        d.polygon([T(p) for p in [(cx-S*r,a),(cx,b),(cx,b+t),(cx-S*r,a+t)]],fill=lc)
        d.polygon([T(p) for p in [(cx,b),(cx+S*r,a),(cx+S*r,a+t),(cx,b+t)]],fill=rc); y+=t
    d.polygon([T(p) for p in hexpts(cx,cy,r)],fill='#D4A74A')
    d.polygon([T(p) for p in hexpts(cx,cy,r*.4)],fill='#E8E3D3')
def grid(d,step):
    for x in range(0,W,step): d.rectangle([x*K,0,x*K+K-1,H*K],fill=(255,255,255,11))
    for y in range(0,H,step): d.rectangle([0,y*K,W*K,y*K+K-1],fill=(255,255,255,11))
def banner(layout):
    im=Image.new('RGBA',(W*K,H*K),'#16201f'); ov=Image.new('RGBA',im.size,(0,0,0,0)); g=ImageDraw.Draw(ov); grid(g,8); im=Image.alpha_composite(im,ov)
    d=ImageDraw.Draw(im)
    mh=29; sc=mh/260; my=(H-mh)/2+.5
    mw=240*sc; gapm=3
    if layout=='two':
        px=13.5; f=font(px)
        tw=max(d.textlength('Shard',font=f),d.textlength('scape',font=f))/K
        mx=(W-(mw+gapm+tw))/2
    else: mx=3
    markA(d,mx,my,sc)
    x0=mx+mw+gapm
    if layout=='one':
        avail=W-x0-2; px=12
        while True:
            f=font(px); w=d.textlength('Shardscape',font=f)/K
            if w<=avail: break
            px-=.25
        asc,desc=f.getmetrics(); bb=d.textbbox((0,0),'Shard',font=f)
        ty=(H*K-(bb[3]-bb[1]))/2-bb[1]
        d.text((x0*K,ty),'Shard',font=f,fill='#FFFFFF'); d.text((x0*K+d.textlength('Shard',font=f),ty),'scape',font=f,fill='#D4A74A')
    else:
        px=13.5; f=font(px)
        while d.textlength('scape',font=f)/K>W-x0-2 or d.textlength('Shard',font=f)/K>W-x0-2: px-=.25; f=font(px)
        b1=d.textbbox((0,0),'Shard',font=f); b2=d.textbbox((0,0),'scape',font=f)
        cap=b1[3]-b1[1]; gap=1.2*K; tot=cap+gap+(b2[3]-b1[1])
        top=(H*K-tot)/2
        d.text((x0*K,top-b1[1]),'Shard',font=f,fill='#FFFFFF')
        d.text((x0*K,top+cap+gap-b1[1]),'scape',font=f,fill='#D4A74A')
    return im.resize((W,H),Image.LANCZOS).convert('RGB')
for L in ['one','two']:
    b=banner(L); b.save('banner_%s.png'%L); b.resize((W*6,H*6),Image.NEAREST).save('banner_%s_6x.png'%L)
