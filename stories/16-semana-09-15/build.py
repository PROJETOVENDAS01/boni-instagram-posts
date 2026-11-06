from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
from playwright.sync_api import sync_playwright
AQUI = Path(__file__).resolve().parent; REPO = AQUI.parents[1]; KIT = REPO
def grade(arq, fx=.5, tint=.4, brilho=1.0):
    im = Image.open(REPO/'fundos'/f'{arq}.png').convert('RGB')
    w, h = im.size; k = max(1080/w, 1920/h); nw, nh = int(w*k+.5), int(h*k+.5)
    im = im.resize((nw, nh), Image.LANCZOS)
    x = int((nw-1080)*fx); y = int((nh-1920)*.5); im = im.crop((x, y, x+1080, y+1920)).filter(ImageFilter.UnsharpMask(1.5, 50, 2))
    a = np.asarray(im).astype(float)/255; g = a.mean(2, keepdims=True)
    t = a*(1-tint) + (g*np.array([1, .82, .5])*1.1)*tint
    t = np.clip((t**.9)*brilho*np.array([1.04, 1.0, .9]), 0, 1)
    t = np.clip(t + np.random.default_rng(5).normal(0, .012, t.shape), 0, 1)
    dest = AQUI/f'_bg-{arq}.jpg'; Image.fromarray((t*255).astype('uint8')).save(dest, quality=93); return dest.as_uri()
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
.h{margin-top:22px;font-size:84px;font-weight:700;line-height:1.1;text-align:center;text-wrap:balance;text-shadow:0 4px 30px rgba(0,0,0,.7)}
.l{margin:30px auto;width:160px;height:8px;border-radius:5px;background:linear-gradient(90deg,#c98a1a,#ffe27a)}
.p{font-size:38px;font-weight:500;line-height:1.36;color:#f0e6cc;text-align:center;text-shadow:0 2px 16px rgba(0,0,0,.8)}
.btn{display:block;margin:44px auto 0;width:fit-content;padding:28px 66px;border-radius:80px;background:linear-gradient(100deg,#c98a1a,#ffe27a 50%,#e0a12a);color:#1a1205;font-size:42px;font-weight:700}
.av{position:absolute;left:90px;right:90px;bottom:360px;z-index:3;font-size:25px;line-height:1.3;color:#d9cfb5;text-align:center;text-shadow:0 2px 10px #000}
"""
AV = 'Carências, rede e valores variam por operadora e produto.'
def tela(bg, gi, corpo, av):
    return (f'<div class="s"><img class="bg" src="{bg}"><div class="ov" style="background:linear-gradient(180deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.4) 12%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) {gi-14}%,rgba(0,0,0,.88) {gi+14}%,rgba(0,0,0,.97) 100%)"></div>'
            f'<img class="lg" src="MARCA/logo-horizontal.png">{corpo}' + (f'<div class="av">{AV}</div>' if av else '') + '</div>')
def B(top, tag, h, p='', btn=''):
    return (f'<div class="blk" style="top:{top}px"><div class="tag">{tag}</div><div class="h">{h}</div><div class="l"></div>'
            + (f'<div class="p">{p}</div>' if p else '') + (f'<div class="btn">{btn}</div>' if btn else '') + '</div>')
G = lambda t: f'<span class="gold">{t}</span>'

# nome: (fundo, foco-x, brilho, gradiente, corpo, aviso)
WA = 'Me chame no WhatsApp com a palavra'
L = 'Link na bio ↑'
# nome: (fundo, foco-x, brilho, gradiente, corpo, aviso)
T = {
 '01-seg-12h': ('st16-s01', .5, .95, 80, B(330, 'DENTISTA SEM PLANO', f'Quanto custa um ano de {G("dentista?")}', '2 limpezas, 2 restaurações e 1 canal. Hoje 19h30 eu faço a conta no feed.', 'Confira às 19h30'), 0),
 '02-seg-19h45': ('st16-s02', .5, .95, 80, B(330, 'A CONTA', f'Passa de {G("R$ 1.900.")}', f'Valores médios do particular, variam por clínica e região. {WA} DENTE.', L), 1),
 '03-ter-12h': ('st16-s03', .5, .95, 80, B(330, 'MITO OU VERDADE?', f'“MEI não pode ter {G("plano de saúde")} empresarial.”', 'A resposta sai hoje às 19h45.'), 0),
 '04-ter-19h45': ('st16-s04', .5, .95, 80, B(330, 'VERDADE!', f'Pode, a partir de {G("1 vida.")}', f'MEI com CNPJ ativo há 180 dias. O resto varia por operadora. {WA} MEI.', L), 1),
 '05-qua-12h': ('st16-s05', .5, .95, 80, B(330, 'SEU MEI JÁ TEM 180 DIAS?', f'Então já dá para {G("comparar.")}', 'Hoje 19h30 no feed: o que todo MEI precisa saber.', 'Confira às 19h30'), 0),
 '06-qua-19h45': ('st16-s06', .5, .95, 80, B(330, 'DÚVIDA DE MEI?', f'Eu comparo {G("para o seu perfil.")}', f'{WA} MEI ou chame pelo link da bio.', L), 1),
 '07-qui-12h': ('st16-s07', .5, .95, 80, B(330, 'SITUAÇÃO REAL', f'Você foi demitido. E o {G("plano da empresa?")}', 'Em muitos casos, ele acaba junto com o emprego.'), 0),
 '08-qui-19h45': ('st16-s08', .5, .95, 80, B(330, 'PLANO SÓ SEU', f'Para não ficar sem cobertura {G("numa emergência.")}', f'Eu te mostro opções para o seu perfil. {WA} PLANO.', L), 1),
 '09-sex-12h': ('st16-s09', .5, .95, 80, B(330, 'ERRO 1 DE 3', f'Olhar só o {G("preço.")}', 'Cobertura, rede e regras também pesam na conta.'), 0),
 '10-sex-15h30': ('espera-ampulheta', .5, .95, 80, B(330, 'ERRO 2 DE 3', f'Não perguntar a {G("carência.")}', 'Cada cobertura tem o seu prazo e cada operadora, as suas regras.'), 0),
 '11-sex-19h45': ('st16-s11', .5, .95, 80, B(330, 'ERRO 3 DE 3', f'Não conferir a rede {G("perto de você.")}', f'Veja os hospitais e laboratórios que você usa de verdade. {WA} PLANO.', L), 1),
 '12-sab-12h': ('st16-s12', .5, .95, 80, B(330, 'VOCÊ TEM DIPLOMA?', f'Sua profissão pode valer um plano com {G("condições especiais.")}', 'Hoje 19h30 no feed.', 'Confira às 19h30'), 0),
 '13-sab-19h45': ('st16-s13', .5, .95, 80, B(330, 'VERDADE!', f'Normalmente basta a {G("carteira do conselho")} ou o diploma.', f'Eu escolho o plano conforme o seu perfil. {WA} ADESÃO.', L), 1),
 '14-dom-12h': ('st16-s14', .5, .95, 80, B(330, 'MITO OU VERDADE?', f'“Só vale ter plano quando já estou {G("doente.")}”', 'A resposta sai hoje às 19h45.'), 0),
 '15-dom-19h45': ('st16-s15', .5, .95, 80, B(330, 'MITO!', f'Plano feito antes dá mais {G("tranquilidade.")}', f'As carências variam por operadora e produto. Amanhã tem Reel: 7 trocas. {WA} TROCA.', L), 1),
}
css = CSS.replace('FONTES', (KIT/'fontes').as_uri())
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    import os
    ONLY = os.environ.get('ONLY', '').split(',')
    for nome, (f, fx, br, gi, corpo, av) in T.items():
        if ONLY != [''] and nome not in ONLY: continue
        h = AQUI/f'_{nome}.html'
        h.write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{tela(grade(f, fx, brilho=br), gi, corpo, av).replace("MARCA/", (KIT/"marca").as_uri()+"/")}</body></html>', encoding='utf-8')
        pg.goto(h.as_uri()); pg.wait_for_timeout(500); pg.screenshot(path=str(AQUI/f'{nome}.png'))
    b.close()
print('ok', len(T))
