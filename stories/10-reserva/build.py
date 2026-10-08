import sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
from playwright.sync_api import sync_playwright
KIT = Path('/tmp/kt'); AQUI = Path(__file__).resolve().parent; REPO = AQUI.parents[1]
R = {'phone': 'reels/01-beneficio-pme/cenas/1.png', 'chair': 'reels/01-beneficio-pme/cenas/2.png', 'meet': 'reels/01-beneficio-pme/cenas/3.png',
     'hand': 'reels/01-beneficio-pme/cenas/4.png', 'laptop': 'reels/01-beneficio-pme/cenas/5.png', 'maos': 'reels/01-beneficio-pme/cenas/6.png',
     'calc': 'reels/02-reajuste/cenas/2.png', 'comp': 'reels/02-reajuste/cenas/3.png', 'bal': 'reels/02-reajuste/cenas/4.png',
     'cal': 'reels/02-reajuste/cenas/5.png', 'pen': 'reels/02-reajuste/cenas/6.png',
     'calbr': 'reels/03-saude-nao-espera/cenas/1.png', 'clock': 'reels/03-saude-nao-espera/cenas/4.png', 'stet': 'reels/03-saude-nao-espera/cenas/5.png',
     'pasta': 'reels/03-saude-nao-espera/cenas/6.png'}
def grade(chave, tint=.4, brilho=1.0):
    im = Image.open(REPO/R[chave]).convert('RGB')
    im = im.resize((1080, int(im.size[1]*1080/im.size[0])), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5, 50, 2))
    a = np.asarray(im).astype(float)/255; g = a.mean(2, keepdims=True)
    t = a*(1-tint) + (g*np.array([1, .82, .5])*1.1)*tint
    t = np.clip((t**.9)*brilho*np.array([1.04, 1.0, .9]), 0, 1)
    t = np.clip(t + np.random.default_rng(5).normal(0, .012, t.shape), 0, 1)
    dest = AQUI/f'_bg-{chave}.jpg'; Image.fromarray((t*255).astype('uint8')).save(dest, quality=93); return dest.as_uri()
CSS = """
@font-face{font-family:P;font-weight:500;src:url('FONTES/Poppins-Medium.ttf')}
@font-face{font-family:P;font-weight:700;src:url('FONTES/Poppins-Bold.ttf')}
*{margin:0;padding:0;box-sizing:border-box}
.s{width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;font-family:P,sans-serif;color:#fff}
.bg{position:absolute;left:0;top:0;width:1080px}
.ov{position:absolute;inset:0}
.lg{position:absolute;left:50%;top:190px;height:130px;transform:translateX(-50%);mix-blend-mode:lighten;z-index:3}
.gold{background:linear-gradient(100deg,#c98a1a,#ffe27a 45%,#f5b82e 70%,#d98f1a);-webkit-background-clip:text;color:transparent}
.blk{position:absolute;left:80px;right:80px;z-index:3}
.blk::before{content:'';position:absolute;inset:-170px -90px -150px;background:radial-gradient(ellipse at center,rgba(0,0,0,.82) 0%,rgba(0,0,0,.7) 45%,rgba(0,0,0,0) 78%);z-index:-1}
.tag{font-size:30px;font-weight:700;letter-spacing:9px;color:#ffe27a;text-align:center}
.h{margin-top:22px;font-size:88px;font-weight:700;line-height:1.1;text-align:center;text-wrap:balance;text-shadow:0 4px 30px rgba(0,0,0,.7)}
.l{margin:30px auto;width:160px;height:8px;border-radius:5px;background:linear-gradient(90deg,#c98a1a,#ffe27a)}
.p{font-size:38px;font-weight:500;line-height:1.36;color:#f0e6cc;text-align:center;text-shadow:0 2px 16px rgba(0,0,0,.8)}
.btn{display:block;margin:44px auto 0;width:fit-content;padding:28px 66px;border-radius:80px;background:linear-gradient(100deg,#c98a1a,#ffe27a 50%,#e0a12a);color:#1a1205;font-size:42px;font-weight:700}
"""
def tela(bg, gi, corpo):
    return (f'<div class="s"><img class="bg" src="{bg}"><div class="ov" style="background:linear-gradient(180deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.4) 12%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) {gi-14}%,rgba(0,0,0,.88) {gi+14}%,rgba(0,0,0,.97) 100%)"></div>'
            f'<img class="lg" src="MARCA/logo-horizontal.png">{corpo}</div>')
def B(top, tag, h, p='', btn=''):
    return (f'<div class="blk" style="top:{top}px"><div class="tag">{tag}</div><div class="h">{h}</div><div class="l"></div>'
            + (f'<div class="p">{p}</div>' if p else '') + (f'<div class="btn">{btn}</div>' if btn else '') + '</div>')
G = lambda t: f'<span class="gold">{t}</span>'
T = {
 'reserva-dica': ('calc', .9, 88, B(380, 'DICA RÁPIDA', f'Antes de comparar planos, {G("anote isto.")}', 'Quem vai usar e onde você se atende. Com essas duas respostas, a escolha fica bem mais fácil.')),
}
css = CSS.replace('FONTES', (KIT/'fontes').as_uri())
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    for nome, (cena, br, gi, corpo) in T.items():
        h = AQUI/f'_{nome}.html'
        h.write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{tela(grade(cena, brilho=br), gi, corpo).replace("MARCA/", (KIT/"marca").as_uri()+"/")}</body></html>', encoding='utf-8')
        pg.goto(h.as_uri()); pg.wait_for_timeout(500); pg.screenshot(path=str(AQUI/f'{nome}.png'))
    b.close()
print('ok', len(T))
