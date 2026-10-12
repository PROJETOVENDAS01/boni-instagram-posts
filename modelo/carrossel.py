#!/usr/bin/env python3
"""Gera um carrossel BONI (1080x1350) a partir de um arquivo JSON.
Uso:  python3 modelo/carrossel.py posts/02-5-motivos/carrossel.json
Saída: PNGs numerados na mesma pasta do JSON (slide-1.png, slide-2.png, ...).
Requer: pip install playwright && playwright install chromium
"""
import json, sys, os, html
from pathlib import Path
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent  # pasta boni-instagram

def preparar_fundo(nome, x0, destino, brilho=1.0, modo='recorte'):
    """Recorta a foto 16:9 em 4:5 (x0 = posição 0..1 da janela), aplica tom dourado,
    contraste cinematográfico, nitidez e grão. Salva JPG 1080x1350 em destino."""
    from PIL import Image, ImageFilter
    import numpy as np
    im = Image.open(RAIZ/'fundos'/f'{nome}.png').convert('RGB')
    W, H = im.size; cw = int(H*4/5); xs = int((W-cw)*x0)
    if modo == 'topo':
        h2 = 980; w2 = int(W*h2/H); xs2 = int((w2-1080)*x0)
        r = im.resize((w2, h2), Image.LANCZOS).crop((xs2, 0, xs2+1080, h2))
        c = Image.new('RGB', (1080, 1350), (0, 0, 0)); c.paste(r, (0, 0))
        a0 = np.asarray(c).astype(float)
        fade = np.clip((h2-np.arange(1350))/340, 0, 1)[:, None, None]
        c = Image.fromarray((a0*fade).astype('uint8'))
    else:
        c = im.crop((xs, 0, xs+cw, H)).resize((1080, 1350), Image.LANCZOS)
    c = c.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
    a = np.asarray(c).astype(float)/255
    g = a.mean(2, keepdims=True)
    t = g*np.array([1.0, .80, .42])*.5 + a*.5
    t = np.clip((t**.82)*1.3*brilho, 0, 1)
    rng = np.random.default_rng(7)
    t = np.clip(t + rng.normal(0, .018, t.shape), 0, 1)
    Image.fromarray((t*255).astype('uint8')).save(destino, quality=93)


GRAD = ('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c98a1a"/>'
        '<stop offset=".5" stop-color="#ffe27a"/><stop offset="1" stop-color="#e0a12a"/></linearGradient></defs>')
S = 'fill="none" stroke="#e8b84a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"'
ICONES = {
 'relogio': f'<circle cx="50" cy="50" r="38"/><path d="M50 26 V50 L68 62"/>',
 'cruz': f'<circle cx="50" cy="50" r="38"/><path d="M50 30 V70 M30 50 H70"/>',
 'pino': f'<path d="M50 90 C28 62 20 50 20 38 C20 22 34 10 50 10 C66 10 80 22 80 38 C80 50 72 62 50 90 Z"/><circle cx="50" cy="38" r="11"/>',
 'coracao': f'<path d="M50 88 C20 66 10 50 10 34 C10 20 20 12 32 12 C40 12 46 16 50 22 C54 16 60 12 68 12 C80 12 90 20 90 34 C90 50 80 66 50 88 Z"/><path d="M26 46 H40 L46 34 L54 58 L60 46 H74"/>',
 'calendario': f'<rect x="14" y="20" width="72" height="68" rx="10"/><path d="M14 40 H86 M34 10 V28 M66 10 V28"/><path d="M34 62 L46 74 L68 52"/>',
 'check': f'<circle cx="50" cy="50" r="38"/><path d="M32 52 L45 65 L70 36"/>',
 'documento': f'<path d="M24 10 H62 L80 28 V90 H24 Z"/><path d="M62 10 V28 H80 M36 50 H68 M36 64 H68 M36 78 H56"/>',
 'predio': f'<path d="M24 90 V10 H76 V90 Z"/><path d="M36 26 H44 M56 26 H64 M36 44 H44 M56 44 H64 M36 62 H44 M56 62 H64 M42 90 V76 H58 V90"/>',
 'loja': f'<path d="M10 40 L18 12 H82 L90 40 Z"/><path d="M16 46 V90 H84 V46"/><path d="M40 90 V66 H60 V90"/>',
 'pessoa': f'<circle cx="50" cy="30" r="17"/><path d="M14 90 C14 62 30 52 50 52 C70 52 86 62 86 90"/>',
 'grupo': f'<circle cx="50" cy="28" r="14"/><path d="M26 82 C26 58 36 50 50 50 C64 50 74 58 74 82"/><circle cx="16" cy="42" r="9"/><circle cx="84" cy="42" r="9"/>',
 'escudo': f'<path d="M50 6 L88 20 V50 C88 74 70 88 50 96 C30 88 12 74 12 50 V20 Z"/><path d="M34 50 L46 62 L68 38"/>',
 'pergunta': f'<circle cx="50" cy="50" r="38"/><path d="M38 40 C38 24 64 24 64 40 C64 52 50 52 50 62"/><circle cx="50" cy="76" r="2" fill="#e8b84a"/>',
 'balao': f'<path d="M10 16 H90 V68 H44 L24 88 V68 H10 Z"/><circle cx="32" cy="42" r="3" fill="#e8b84a"/><circle cx="50" cy="42" r="3" fill="#e8b84a"/><circle cx="68" cy="42" r="3" fill="#e8b84a"/>',
 'lupa': f'<circle cx="42" cy="42" r="28"/><path d="M62 62 L88 88"/>',
 'dinheiro': f'<circle cx="50" cy="50" r="38"/><path d="M50 26 V74 M62 38 C62 30 38 30 38 42 C38 54 62 46 62 58 C62 70 38 70 38 62"/>',
}

CSS = """
@font-face{font-family:'Poppins';font-weight:500;src:url('FONTES/Poppins-Medium.ttf')}
@font-face{font-family:'Poppins';font-weight:400;src:url('FONTES/Poppins-Regular.ttf')}
@font-face{font-family:'Poppins';font-weight:600;src:url('FONTES/Poppins-Bold.ttf')}
@font-face{font-family:'Poppins';font-weight:700;src:url('FONTES/Poppins-Bold.ttf')}
@font-face{font-family:'Poppins';font-weight:800;src:url('FONTES/Poppins-Bold.ttf')}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#222;font-family:'Poppins',sans-serif}
.s{width:1080px;height:1350px;position:relative;overflow:hidden}
.dark{background:radial-gradient(ellipse at 50% 18%,#2a1d07 0%,#0d0a05 48%,#000 100%);color:#fff}
.light{background:radial-gradient(ellipse at 20% 0%,#fffdf8 0%,#f4eee2 60%,#ece3d0 100%);color:#17140d;display:flex;flex-direction:column;padding:190px 70px 0}
.gold{background:linear-gradient(100deg,#c98a1a 0%,#ffe27a 45%,#f5b82e 70%,#d98f1a 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.goldd{background:linear-gradient(100deg,#8a5a08 0%,#d9a02a 50%,#9a6a0e 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.foot{position:absolute;left:70px;right:70px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font-size:23px;letter-spacing:.5px}
.foot b{font-weight:600}.dark .foot{color:#cdbb8c}.light .foot{color:#6b5a30}.pg{font-weight:600}
.bar{position:absolute;left:70px;right:70px;bottom:112px;height:2px;background:linear-gradient(90deg,transparent,#c98a1a,transparent);opacity:.7}
.c1 .em{position:absolute;left:50%;top:70px;width:560px;height:560px;transform:translateX(-50%);mix-blend-mode:lighten}
.c1 .t{position:absolute;left:70px;right:70px;top:650px;text-align:center}
.c1 .n{font-size:260px;line-height:.9;font-weight:800}
.c1 .m{font-size:78px;font-weight:700;line-height:1.05;letter-spacing:2px;margin-top:6px}
.c1 .m.long{font-size:70px;line-height:1.1;margin-top:0}
.c1 .p{font-size:50px;font-weight:500;line-height:1.2;margin-top:26px;color:#f0e6cc}
.c1 .sw{position:absolute;bottom:130px;left:0;right:0;text-align:center;font-size:30px;letter-spacing:6px;color:#ffe27a;font-weight:600}
.num{position:absolute;right:50px;top:20px;font-size:420px;font-weight:800;line-height:1;opacity:.16}
.ic{width:170px;height:170px;border-radius:38px;background:linear-gradient(145deg,#1a1308,#000);display:flex;align-items:center;justify-content:center;box-shadow:0 18px 40px rgba(120,80,10,.28),inset 0 0 0 3px #c98a1a;flex:none}
.ic svg{width:100px;height:100px}
.tag{margin-top:70px;font-size:32px;font-weight:600;letter-spacing:9px}
.h{margin-top:22px;font-size:104px;font-weight:800;line-height:1.04}
.hl{margin:48px 0 44px;width:170px;height:9px;border-radius:5px;background:linear-gradient(90deg,#c98a1a,#ffe27a)}
.b{font-size:52px;line-height:1.36;font-weight:500;color:#2c261a;padding-right:20px}
.b.small{font-size:46px}
.c7 .ph{position:absolute;left:50%;top:150px;width:460px;height:460px;transform:translateX(-50%);border-radius:36px;overflow:hidden;box-shadow:0 0 0 4px #c98a1a,0 0 70px rgba(255,190,60,.35)}
.c7 .ph img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}
.c7 .nm{position:absolute;top:640px;left:0;right:0;text-align:center;font-size:30px;letter-spacing:2px;color:#e8d9aa}
.c7 .nm b{color:#fff;font-size:38px;font-weight:700;display:block;letter-spacing:1px}
.c7 .q{position:absolute;top:745px;left:70px;right:70px;text-align:center;font-size:62px;font-weight:800;line-height:1.1}
.c7 .tx{position:absolute;top:915px;left:80px;right:80px;text-align:center;font-size:33px;line-height:1.38;color:#f0e6cc;font-weight:500}
.c7 .tx em{font-style:normal;color:#ffe27a;font-weight:700}
.c7 .btn{position:absolute;top:1120px;left:50%;transform:translateX(-50%);padding:24px 54px;border-radius:70px;background:linear-gradient(100deg,#c98a1a,#ffe27a 50%,#e0a12a);color:#1a1205;font-size:36px;font-weight:700;white-space:nowrap}
.c7 .leg{position:absolute;bottom:50px;left:60px;right:60px;text-align:center;font-size:20px;color:#a8996d;line-height:1.35}
.f{background:#000;color:#fff}
.f .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.f .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,.05) 20%,rgba(0,0,0,.15) 38%,rgba(0,0,0,.86) 58%,rgba(0,0,0,.97) 100%)}
.f .lg{position:absolute;left:60px;top:46px;height:84px;mix-blend-mode:lighten}
.f .ct{text-shadow:0 2px 12px #000;position:absolute;right:64px;top:70px;font-size:26px;font-weight:600;letter-spacing:5px;color:#ffe27a}
.f .ct i{font-style:normal;color:#8c7a4a}
.f .blk{position:absolute;left:70px;right:70px;bottom:150px}
.f .chip{display:flex;align-items:center;gap:22px}
.f .ci{width:92px;height:92px;border-radius:26px;background:rgba(10,8,4,.62);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2.5px #c98a1a}
.f .ci svg{width:54px;height:54px}
.f .tg{font-size:30px;font-weight:600;letter-spacing:9px}
.f .h{margin-top:26px;text-wrap:balance;font-size:92px;font-weight:800;line-height:1.04;text-shadow:0 4px 30px rgba(0,0,0,.6)}
.f .hl{margin:34px 0 32px;width:150px;height:8px;border-radius:5px;background:linear-gradient(90deg,#c98a1a,#ffe27a)}
.f .b{font-size:41px;line-height:1.38;font-weight:500;color:#eadfc2;padding:0;max-width:900px}
.f .b.small{font-size:38px}
.f .ft{position:absolute;left:70px;right:70px;bottom:56px;display:flex;justify-content:space-between;align-items:center;font-size:24px;letter-spacing:1px;color:#cdbb8c;font-weight:600}
.f .ft .sw{color:#ffe27a;letter-spacing:6px}
.f.cv .blk{bottom:170px;text-align:left}
.f.cv .n{font-size:330px;line-height:.82;font-weight:800;letter-spacing:-6px}
.f.cv .m{font-size:104px;font-weight:800;line-height:1.02;letter-spacing:2px;margin-top:14px}
.f.cv .p{font-size:50px;font-weight:500;line-height:1.2;margin-top:22px;color:#f0e6cc}
"""

def esc(t): return html.escape(t, quote=False)

def montar(d):
    marca = d.get('marca', 'BONI · Consultoria em Planos de Saúde')
    n = len(d['lamina']) + 2
    ph = lambda i: f'<div class="bar"></div><div class="foot"><span>{esc(marca)}</span><span class="pg">{i}/{n}</span></div>'
    cv = d['capa']
    grande = (f'<div class="n gold"' + (f' style="font-size:{int(1300/len(cv["grande"]))}px"' if len(cv["grande"])>4 else '') + f'>{esc(cv["grande"])}</div>') if cv.get('grande') else ''
    cls = 'm gold' + ('' if cv.get('grande') else ' long')
    usar = bool(d.get('capa', {}).get('fundo'))
    pasta = Path(d['_dir'])
    def foto(spec):
        f = spec['fundo']; dest = pasta/f'_fundo-{f["arquivo"]}.jpg'
        preparar_fundo(f['arquivo'], f.get('x', .5), dest, f.get('brilho', 1.0), f.get('modo', 'recorte'))
        return dest.as_uri()
    # optional operator logo on the cover (path relative to the repo root), on a light glass plate
    def logo(spec):
        if not spec.get('logo'): return ''
        return (f'<div style="display:inline-block;padding:18px 28px;margin-bottom:26px;border-radius:22px;background:rgba(255,255,255,.92);border:3px solid #F5B800">'
                f'<img src="{(RAIZ/spec["logo"]).as_uri()}" style="height:{spec.get("logo_h",90)}px;display:block"></div>')
    def topo(i): return (f'<img class="lg" src="MARCA/logo-horizontal.png">'
                         f'<div class="ct">{i-1:02d} <i>/ {n-2:02d}</i></div>' if 1 < i < n else '<img class="lg" src="MARCA/logo-horizontal.png">')
    rodape = lambda: '<div class="ft"><span>@boniconsultorsaude</span><span class="sw">ARRASTE &nbsp;→</span></div>'
    if usar:
        out = [f'<section class="s f cv" id="s1"><img class="bg" src="{foto(cv)}"><div class="ov" style="background:linear-gradient(180deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,0) 22%)"></div>{topo(1)}'
               f'<div class="blk">{logo(cv)}{grande}<div class="{cls}">{esc(cv["destaque"])}</div><div class="p">{esc(cv["sub"])}</div></div>{rodape()}</section>']
    else:
      out = [f'<section class="s dark c1" id="s1"><img class="em" src="MARCA/emblema.png">'
           f'<div class="t">{grande}<div class="{cls}">{esc(cv["destaque"])}</div>'
           f'<div class="p">{esc(cv["sub"])}</div></div><div class="sw">ARRASTE &nbsp;→</div>{ph(1)}</section>']
    for i, l in enumerate(d['lamina'], 2):
        ico = ICONES[l.get('icone', 'check')]
        num = f'<div class="num goldd">{i-1}</div>' if d.get('numerar', True) else ''
        tag = esc(l.get('rotulo', f'PONTO 0{i-1}'))
        small = ' small' if len(l['texto']) > 140 else ''
        if usar and l.get('fundo'):
            out.append(f'<section class="s f" id="s{i}"><img class="bg" src="{foto(l)}"><div class="ov"></div>{topo(i)}'
                       f'<div class="blk"><div class="chip"><div class="ci"><svg viewBox="0 0 100 100" {S}>{GRAD}{ico}</svg></div><div class="tg gold">{tag}</div></div>'
                       f'<div class="h">{esc(l["titulo"])}</div><div class="hl"></div><div class="b{small}">{esc(l["texto"])}</div></div>{rodape()}</section>')
            continue
        out.append(f'<section class="s light" id="s{i}">{num}<div class="ic"><svg viewBox="0 0 100 100" {S}>{GRAD}{ico}</svg></div>'
                   f'<div class="tag goldd">{tag}</div><div class="h">{esc(l["titulo"])}</div><div class="hl"></div>'
                   f'<div class="b{small}">{esc(l["texto"])}</div>{ph(i)}</section>')
    f = d['final']
    out.append(f'<section class="s dark c7" id="s{n}"><img class="lg" style="position:absolute;left:60px;top:46px;height:84px;mix-blend-mode:lighten" src="MARCA/logo-horizontal.png"><div class="ph"><img src="{f.get("foto","FOTOS/foto-boni-01.jpg")}"></div>'
               f'<div class="nm"><b>Thiago Boni</b>Consultor de planos de saúde · RJ</div>'
               f'<div class="q gold">{esc(f["pergunta"])}</div><div class="tx">{f["texto_html"]}</div>'
               f'<div class="btn">Link na bio ↑</div>'
               f'<div class="leg">{f["aviso"]}<br>T. R. Bonifácio Promoção de Vendas · CNPJ 24.505.726/0001-44 · Corretora intermediária</div></section>')
    return n, out

def main(json_path):
    jp = Path(json_path).resolve(); d = json.loads(jp.read_text(encoding='utf-8')); d['_dir'] = str(jp.parent)
    n, secs = montar(d)
    css = CSS.replace('FONTES', (RAIZ/'fontes').as_uri())
    body = ''.join(secs).replace('MARCA/', (RAIZ/'marca').as_uri()+'/')
    body = body.replace('FOTOS/', (RAIZ/'fotos').as_uri()+'/')
    page = f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{body}</body></html>'
    hp = jp.parent/'_carrossel.html'; hp.write_text(page, encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width':1080,'height':1350})
        pg.goto(hp.as_uri()); pg.wait_for_timeout(800)
        for i in range(1, n+1):
            pg.locator(f'#s{i}').screenshot(path=str(jp.parent/f'slide-{i}.png'))
        b.close()
    print(f'ok: {n} lâminas em {jp.parent}')

if __name__ == '__main__':
    main(sys.argv[1])
