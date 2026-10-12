#!/usr/bin/env python3
"""Post de foto BONI 1080x1350 com um visual do banco (fotos/avatar). Uso: python3 posts/foto.py posts/NN-tema/foto.json"""
import json, sys, html
from pathlib import Path
from playwright.sync_api import sync_playwright
RAIZ = Path(__file__).resolve().parents[1]
CSS = """
@font-face{font-family:P;font-weight:500;src:url('FONTES/Poppins-Medium.ttf')}
@font-face{font-family:P;font-weight:700;src:url('FONTES/Poppins-Bold.ttf')}
*{margin:0;padding:0;box-sizing:border-box}
.s{width:1080px;height:1350px;position:relative;overflow:hidden;background:#000;font-family:P,sans-serif;color:#fff}
.bg{position:absolute;left:0;top:-YYpx;width:1080px;filter:sepia(.25) saturate(1.1) brightness(.92) contrast(1.06)}
.ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 18%,rgba(0,0,0,0) 46%,rgba(0,0,0,.88) 68%,#000 100%)}
.lg{position:absolute;left:56px;top:46px;height:80px;mix-blend-mode:lighten}
.gold{background:linear-gradient(100deg,#c98a1a,#ffe27a 45%,#f5b82e 70%,#d98f1a);-webkit-background-clip:text;color:transparent}
.blk{position:absolute;left:70px;right:70px;bottom:205px}
.tg{display:flex;align-items:center;gap:14px;font-size:28px;font-weight:700;letter-spacing:8px;color:#ffe27a}
.h{margin-top:14px;font-size:76px;font-weight:700;line-height:1.08}
.ln{margin:24px 0;width:150px;height:8px;border-radius:5px;background:linear-gradient(90deg,#c98a1a,#ffe27a)}
.p{font-size:34px;font-weight:500;line-height:1.38;color:#f0e6cc}
.btn{position:absolute;left:70px;bottom:100px;padding:20px 48px;border-radius:60px;background:linear-gradient(100deg,#c98a1a,#ffe27a 50%,#e0a12a);color:#1a1205;font-size:34px;font-weight:700}
.av{position:absolute;right:56px;bottom:112px;width:420px;text-align:right;font-size:19px;color:#a8996d;line-height:1.35}
"""
def main(p):
    jp = Path(p).resolve(); d = json.loads(jp.read_text(encoding='utf-8')); e = lambda t: html.escape(t, quote=False)
    fita = ('<svg width="34" height="44" viewBox="0 0 34 44"><path d="M17 2c-9 0-12 9-6 18L2 40l8 2 7-14 7 14 8-2-9-20c6-9 3-18-6-18z" fill="#3b7bd6" stroke="#ffe27a" stroke-width="2"/></svg>' if d.get('fita') else '')
    body = (f'<section class="s" id="s1"><img class="bg" src="{(RAIZ/d["foto"]).as_uri()}"><div class="ov"></div>'
            f'<img class="lg" src="{(RAIZ/"marca/logo-horizontal.png").as_uri()}">'
            f'<div class="blk"><div class="tg">{fita}{e(d["tag"])}</div><div class="h">{e(d["l1"])} <span class="gold">{e(d["l2"])}</span></div><div class="ln"></div><div class="p">{e(d["sub"])}</div></div>'
            f'<div class="btn">{e(d["cta"])}</div><div class="av">{e(d.get("aviso","Carências, rede e valores variam por operadora e produto."))}</div></section>')
    css = CSS.replace('YY', str(d.get('y', 120))).replace('FONTES', (RAIZ/'fontes').as_uri())
    hp = jp.parent/'_foto.html'; hp.write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{body}</body></html>', encoding='utf-8')
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1350})
        pg.goto(hp.as_uri()); pg.wait_for_timeout(600); pg.locator('#s1').screenshot(path=str(jp.parent/'slide-1.png')); b.close()
    print('ok')
main(sys.argv[1])
