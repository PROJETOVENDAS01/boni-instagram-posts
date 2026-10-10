from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
from playwright.sync_api import sync_playwright
KIT = Path('/tmp/kt'); AQUI = Path(__file__).resolve().parent; REPO = AQUI.parents[1]
def grade(arq, fx=.5, tint=.4, brilho=1.0):
    im = Image.open(REPO/'fundos'/f'{arq}.png').convert('RGB')
    w, h = im.size; nw = int(w*1920/h)
    im = im.resize((nw, 1920), Image.LANCZOS)
    x = int((nw-1080)*fx); im = im.crop((x, 0, x+1080, 1920)).filter(ImageFilter.UnsharpMask(1.5, 50, 2))
    a = np.asarray(im).astype(float)/255; g = a.mean(2, keepdims=True)
    t = a*(1-tint) + (g*np.array([1, .82, .5])*1.1)*tint
    t = np.clip((t**.9)*brilho*np.array([1.04, 1.0, .9]), 0, 1)
    t = np.clip(t + np.random.default_rng(5).normal(0, .012, t.shape), 0, 1)
    dest = AQUI/f'_bg-{arq}-{int(fx*100)}.jpg'; Image.fromarray((t*255).astype('uint8')).save(dest, quality=93); return dest.as_uri()
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
WA = 'Me chame no WhatsApp com a palavra'
# nome: (fundo, foco-x, brilho, gradiente, corpo, aviso)
T = {
 'seg-dica': ('agenda-data-circulada', .3, .9, 80, B(330, 'DICA RÁPIDA', f'Carência é o {G("tempo de espera.")}', f'Cada plano tem os seus prazos, e em alguns casos dá para buscar condições melhores. {WA} CARÊNCIA.', 'Link na bio ↑'), 1),
 'seg-feed': ('prev-envelopes-exames', .4, 1.0, 88, B(340, 'NO FEED AGORA', f'Exame de rotina: {G("quais e quando?")}', 'Passe os slides e salve.', 'Confira no feed'), 0),
 'ter-gestante': ('gestante-maos-barriga', .75, .9, 78, B(330, 'QUEM PLANEJA TER FILHOS', f'Plano {G("antes")} da gravidez.', f'Para o parto pelo plano, a carência pode chegar a 300 dias. Entrar grávida pode deixar o parto de fora. {WA} GESTANTE.', 'Link na bio ↑'), 1),
 'ter-reel': ('saude-outubro-rosa', .5, 1.0, 88, B(340, 'REEL NO AR', f'Outubro Rosa acaba. {G("O cuidado não.")}', 'Acabou de sair no feed.', 'Assista no feed'), 0),
 'qua-demissao': ('demissao-caixa-mesa', .4, .95, 80, B(330, 'E SE EU FOR DEMITIDO?', f'O plano da empresa {G("vai embora")} com o emprego.', f'Ter um plano só seu dá mais segurança numa emergência. {WA} PLANO.', 'Link na bio ↑'), 1),
 'qua-feed': ('mente-janela-chuva', .5, 1.0, 88, B(340, 'NO FEED AGORA', f'Saúde mental {G("também é saúde.")}', 'Um assunto que merece cuidado. Confira no feed.', 'Confira no feed'), 0),
 'qui-dica': ('pme-notebook-cafe', .3, .95, 80, B(330, 'DICA PARA MEI', f'MEI pode ter plano {G("empresarial.")}', f'O plano PME é a partir de 1 vida. Para MEI, o CNPJ precisa estar ativo há 180 dias. Outras condições variam por operadora. {WA} MEI.', 'Link na bio ↑'), 1),
 'qui-feed': ('prev-organizador-semanal', .6, 1.0, 88, B(340, 'NO FEED AGORA', f'Rastreio: {G("descobrir cedo")} faz diferença.', 'Confira no feed.', 'Confira no feed'), 0),
 'sex-dica': ('protecao-guarda-chuva', .35, .95, 80, B(330, 'DICA RÁPIDA', f'Plano é como um {G("guarda-chuva.")}', f'Você contrata antes da chuva. Quando o imprevisto chega, ele já está lá. {WA} PLANO.', 'Link na bio ↑'), 1),
 'sex-feed': ('prev-frutas-agua', .5, 1.0, 88, B(340, 'NO FEED AGORA', f'Obesidade não é {G("falta de força de vontade.")}', 'Confira no feed.', 'Confira no feed'), 0),
 'sab-dica': ('decisao-porta-entreaberta', .55, .9, 80, B(330, '3 PERGUNTAS ANTES DE ASSINAR', f'Carência? Rede? {G("Reajuste?")}', f'Pergunte tudo e peça por escrito. {WA} PERGUNTAS.', 'Link na bio ↑'), 1),
 'sab-cena': ('pessoas-familia-silhueta-janela', .6, 1.0, 82, B(330, 'CENA DO DIA A DIA', f'Cuidar de quem você ama {G("começa antes.")}', 'Pensar no plano antes da emergência é cuidar da família.'), 1),
 'dom-feed': ('prev-fita-balanca', .45, 1.0, 88, B(340, 'NO FEED AGORA', f'Diabetes pode não dar {G("sintoma no começo.")}', 'Confira no feed.', 'Confira no feed'), 0),
 'dom-leve': ('mente-cha-amanhecer', .6, .95, 88, B(340, 'BOA SEMANA', f'Segunda tem {G("mais dica.")}', 'Dúvida sobre plano de saúde? Me chame pelo link da bio.'), 0),
}
css = CSS.replace('FONTES', (KIT/'fontes').as_uri())
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    for nome, (f, fx, br, gi, corpo, av) in T.items():
        h = AQUI/f'_{nome}.html'
        h.write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{tela(grade(f, fx, brilho=br), gi, corpo, av).replace("MARCA/", (KIT/"marca").as_uri()+"/")}</body></html>', encoding='utf-8')
        pg.goto(h.as_uri()); pg.wait_for_timeout(500); pg.screenshot(path=str(AQUI/f'{nome}.png'))
    b.close()
print('ok', len(T))
