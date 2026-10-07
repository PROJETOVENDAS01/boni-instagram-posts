#!/usr/bin/env python3
"""Post único 1080x1350 BONI, só tipografia (sem foto nova). Uso: python3 posts/unico.py posts/NN-tema/unico.json"""
import json, sys, html
from pathlib import Path
sys.path.insert(0, '/tmp/kt/modelo')
import carrossel as C
from playwright.sync_api import sync_playwright
RAIZ = C.RAIZ
EXTRA = """
.u{background:radial-gradient(ellipse at 50% 20%,#2a1d07 0%,#0d0a05 52%,#000 100%);color:#fff}
.u .em{position:absolute;left:50%;top:50px;width:250px;height:250px;transform:translateX(-50%);mix-blend-mode:lighten}
.u .tg{position:absolute;top:320px;left:0;right:0;text-align:center;font-size:32px;font-weight:700;letter-spacing:10px;color:#ffe27a}
.u .t{position:absolute;top:390px;left:80px;right:80px;text-align:center}
.u .l1{font-size:72px;font-weight:700;line-height:1.1;color:#fff}
.u .l2{font-size:96px;font-weight:800;line-height:1.05;margin-top:6px}
.u .ln{margin:34px auto;width:170px;height:9px;border-radius:5px;background:linear-gradient(90deg,#c98a1a,#ffe27a)}
.u .sb{font-size:40px;font-weight:500;line-height:1.35;color:#f0e6cc}
.u .cta{position:absolute;bottom:150px;left:0;right:0;text-align:center}
.u .cta .btn{display:inline-block;padding:26px 62px;border-radius:70px;background:linear-gradient(100deg,#c98a1a,#ffe27a 50%,#e0a12a);color:#1a1205;font-size:40px;font-weight:700}
.u .av{position:absolute;bottom:60px;left:60px;right:60px;text-align:center;font-size:22px;color:#a8996d;line-height:1.35}
"""
def main(p):
    jp = Path(p).resolve(); d = json.loads(jp.read_text(encoding='utf-8'))
    e = lambda t: html.escape(t, quote=False)
    body = (f'<section class="s u" id="s1"><img class="em" src="MARCA/emblema.png"><div class="tg">{e(d["tag"])}</div>'
            f'<div class="t"><div class="l1">{e(d["linha1"])}</div><div class="l2 gold">{e(d["linha2"])}</div><div class="ln"></div>'
            f'<div class="sb">{e(d["sub"])}</div></div>'
            f'<div class="cta"><div class="btn">{e(d["cta"])}</div></div>'
            f'<div class="av">Carências, rede e valores variam por operadora e produto.<br>@boniconsultorsaude · T. R. Bonifácio Promoção de Vendas · CNPJ 24.505.726/0001-44</div></section>')
    css = (C.CSS + EXTRA).replace('FONTES', (RAIZ/'fontes').as_uri())
    body = body.replace('MARCA/', (RAIZ/'marca').as_uri()+'/')
    hp = jp.parent/'_unico.html'; hp.write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{body}</body></html>', encoding='utf-8')
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width':1080,'height':1350})
        pg.goto(hp.as_uri()); pg.wait_for_timeout(700); pg.locator('#s1').screenshot(path=str(jp.parent/'slide-1.png')); b.close()
    print('ok')
main(sys.argv[1])
