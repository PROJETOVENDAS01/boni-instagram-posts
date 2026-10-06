import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]/'modelo'))
from PIL import Image, ImageFilter
import numpy as np
from playwright.sync_api import sync_playwright
RAIZ = Path(__file__).resolve().parents[2]; AQUI = Path(__file__).resolve().parent

def grade(nome, dy=0, tint=.35, brilho=1.0):
    im = Image.open(RAIZ/'fundos'/f'{nome}.png').convert('RGB')
    im = im.resize((1080, int(im.size[1]*1080/im.size[0])), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5, 50, 2))
    a = np.asarray(im).astype(float)/255
    g = a.mean(2, keepdims=True)
    t = a*(1-tint) + (g*np.array([1, .82, .5])*1.1)*tint
    t = np.clip((t**.9)*brilho*np.array([1.04, 1.0, .9]), 0, 1)
    t = np.clip(t + np.random.default_rng(5).normal(0, .012, t.shape), 0, 1)
    if dy:
        y = np.arange(t.shape[0])[:, None]; lim = t.shape[0]-dy
        m = np.clip((lim-y)/380, 0, 1)[:, :, None]; t = t*m
    dest = AQUI/f'_bg-{nome}.jpg'; Image.fromarray((t*255).astype('uint8')).save(dest, quality=93); return dest.as_uri()

CSS = """
@font-face{font-family:P;font-weight:500;src:url('FONTES/Poppins-Medium.ttf')}
@font-face{font-family:P;font-weight:700;src:url('FONTES/Poppins-Bold.ttf')}
*{margin:0;padding:0;box-sizing:border-box}
.s{width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;font-family:P,sans-serif;color:#fff}
.bg{position:absolute;left:0;width:1080px}
.ov{position:absolute;inset:0}
.lg{position:absolute;left:50%;top:190px;height:130px;transform:translateX(-50%);mix-blend-mode:lighten;z-index:3}
.gold{background:linear-gradient(100deg,#c98a1a,#ffe27a 45%,#f5b82e 70%,#d98f1a);-webkit-background-clip:text;color:transparent}
.blk{position:absolute;left:80px;right:80px;z-index:3}
.blk::before{content:'';position:absolute;inset:-170px -90px -150px;background:radial-gradient(ellipse at center,rgba(0,0,0,.82) 0%,rgba(0,0,0,.7) 45%,rgba(0,0,0,0) 78%);z-index:-1}
.tag{font-size:30px;font-weight:700;letter-spacing:9px;color:#ffe27a;text-align:center}
.h{margin-top:22px;font-size:88px;font-weight:700;line-height:1.1;text-align:center;text-wrap:balance;text-shadow:0 4px 30px rgba(0,0,0,.7)}
.l{margin:30px auto;width:160px;height:8px;border-radius:5px;background:linear-gradient(90deg,#c98a1a,#ffe27a)}
.p{font-size:38px;font-weight:500;line-height:1.36;color:#f0e6cc;text-align:center;text-shadow:0 2px 16px rgba(0,0,0,.8)}
.chips{display:flex;gap:14px;justify-content:center;margin-top:38px}
.chip{padding:16px 26px;border-radius:60px;font-size:30px;font-weight:700;color:#ffe27a;box-shadow:inset 0 0 0 3px #c98a1a;background:rgba(20,14,4,.75)}
.btn{display:block;margin:44px auto 0;width:fit-content;padding:28px 66px;border-radius:80px;background:linear-gradient(100deg,#c98a1a,#ffe27a 50%,#e0a12a);color:#1a1205;font-size:42px;font-weight:700}
"""
def tela(bg, dy, grad_ini, corpo):
    return (f'<div class="s"><img class="bg" style="top:{-dy}px" src="{bg}">'
            f'<div class="ov" style="background:linear-gradient(180deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.4) 12%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) {grad_ini-14}%,rgba(0,0,0,.88) {grad_ini+14}%,rgba(0,0,0,.97) 100%)"></div>'
            f'<img class="lg" src="MARCA/logo-horizontal.png">{corpo}</div>')

telas = {
 'quarta-bastidor': tela(grade('story-pme-analise', tint=0.4, brilho=1.12), 0, 88,
   '<div class="blk" style="top:360px"><div class="tag">BASTIDORES</div><div class="h">Antes de indicar, <span class="gold">eu comparo.</span></div><div class="l"></div><div class="p">Cada perfil pede uma análise diferente. O plano certo é o que cabe no seu perfil.</div></div>'),
 'quarta-caixinha': tela(grade('story-conversa', tint=0.4, brilho=0.8), 0, 80,
   '<div class="blk" style="top:330px"><div class="tag">CAIXA DE PERGUNTAS</div><div class="h">Qual a sua dúvida sobre <span class="gold">plano de saúde?</span></div><div class="l"></div><div class="p">Pergunte na caixinha abaixo. Eu respondo aqui nos próximos dias.</div></div>'),
 'quinta-resposta': tela(grade('story-conversa-2', tint=0.4, brilho=0.8), 0, 80,
   '<div class="blk" style="top:330px"><div class="tag">VOCÊ PERGUNTOU</div><div class="h">Vou responder <span class="gold">sua dúvida.</span></div><div class="l"></div><div class="p">Veja a resposta nos próximos stories.</div></div>'),
 'quinta-feed': tela(grade('story-mei-loja', tint=0.4, brilho=1.12), 0, 88,
   '<div class="blk" style="top:340px"><div class="tag">NO FEED AGORA</div><div class="h">Plano de saúde para <span class="gold">MEI</span></div><div class="l"></div><div class="p">Acabou de sair o carrossel. Passe os slides e tire suas dúvidas.</div><div class="btn">Confira no feed</div></div>'),
 'sexta-1': tela(grade('story-mei-prazo', tint=0.4, brilho=0.8), 0, 88,
   '<div class="blk" style="top:380px"><div class="tag">DICA RÁPIDA · 1/3</div><div class="h">Tem MEI? <span class="gold">Anote o prazo.</span></div><div class="l"></div><div class="p">Um detalhe simples evita atraso na hora de contratar.</div></div>'),
 'sexta-2': tela(grade('story-mito-padaria', tint=0.4, brilho=1.12), 0, 88,
   '<div class="blk" style="top:380px"><div class="tag">DICA RÁPIDA · 2/3</div><div class="h">CNPJ ativo há <span class="gold">180 dias.</span></div><div class="l"></div><div class="p">Para contratar plano de saúde como MEI, o CNPJ precisa estar ativo há 180 dias. Outras condições variam por operadora.</div></div>'),
 'sexta-3': tela(grade('story-mei-mesa', tint=0.4, brilho=1.12), 0, 88,
   '<div class="blk" style="top:340px"><div class="tag">DICA RÁPIDA · 3/3</div><div class="h">Tem mais no <span class="gold">carrossel.</span></div><div class="l"></div><div class="p">Veja o post completo no feed e me chame no WhatsApp com a palavra MEI.</div><div class="btn">Fale comigo no link da bio</div></div>'),
 'sabado-enquete': tela(grade('story-familia', tint=0.4, brilho=0.8), 0, 78,
   '<div class="blk" style="top:330px"><div class="tag">ENQUETE</div><div class="h">Você tem plano <span class="gold">de saúde hoje?</span></div><div class="l"></div><div class="p">Vote abaixo. Depois eu conto o que vem por aí.</div></div>'),
 'sabado-feed': tela(grade('story-duv-copart', tint=0.4, brilho=1.12), 0, 88,
   '<div class="blk" style="top:340px"><div class="tag">NO FEED AGORA</div><div class="h">Coparticipação: <span class="gold">vale a pena?</span></div><div class="l"></div><div class="p">Entenda como funciona antes de decidir.</div><div class="btn">Confira no feed</div></div>'),
 'domingo-leve': tela(grade('story-pf-varanda', tint=0.4, brilho=0.8), 0, 88,
   '<div class="blk" style="top:340px"><div class="tag">BOM DOMINGO</div><div class="h">Segunda tem <span class="gold">mais dica.</span></div><div class="l"></div><div class="p">Dúvida sobre plano de saúde? Me chame pelo link da bio.</div></div>'),
}
css = CSS.replace('FONTES', (RAIZ/'fontes').as_uri())
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    for nome, corpo in telas.items():
        h = AQUI/f'_{nome}.html'
        h.write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{corpo.replace("MARCA/", (RAIZ/"marca").as_uri()+"/")}</body></html>', encoding='utf-8')
        pg.goto(h.as_uri()); pg.wait_for_timeout(600); pg.screenshot(path=str(AQUI/f'{nome}.png'))
    b.close()
print('ok')
