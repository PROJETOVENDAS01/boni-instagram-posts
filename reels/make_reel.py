#!/usr/bin/env python3
"""Uso: make_reel.py <pasta> [--preview]. Le <pasta>/config.json + words.json, gera timing.py, cenas, render, audio, mux, capa."""
import sys, os, json, subprocess, shutil
import numpy as np
from PIL import Image, ImageFilter
D = os.path.abspath(sys.argv[1]); R = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(R)
cfg = json.load(open(f'{D}/config.json')); words = json.load(open(f'{D}/words.json'))
def find(phrase, occ=0):
    toks = phrase.split(); n = 0
    for i in range(len(words)):
        if [w['t'] for w in words[i:i+len(toks)]] == toks:
            if n == occ: return i
            n += 1
    raise SystemExit('nao achei: ' + phrase)
starts = [0 if k == 0 else find(p) for k, p in enumerate(cfg['starts'])]
end_i = find(cfg['end'])
kin = []
for txt, size, y, a, b in cfg['kinetic']:
    ia = find(a); ib = find(b) + len(b.split()) - 1
    kin.append((txt, size, y, words[ia]['s'] - 0.05, words[ib]['e'] + 0.1))
t = f"""import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{{_h}}/words.json'))
BOUNDS = [0.0] + {[round(words[i]['s'] - 0.17, 2) for i in starts[1:]]}
END_START = {round(words[end_i]['s'] - 0.2, 2)}
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = {kin!r}
END_TAG = {cfg['end_tag']!r}
KEYWORD = {cfg['keyword']!r}
FOOT1 = {cfg['foot1']!r}
"""
open(f'{D}/timing.py', 'w').write(t)
os.makedirs(f'{D}/cenas', exist_ok=True)
for k, (f, fx) in enumerate(cfg['cenas'], 1):
    im = Image.open(f'{REPO}/fundos/{f}.png').convert('RGB'); w, h = im.size
    nw = int(w * 2736 / h); im = im.resize((nw, 2736), Image.LANCZOS)
    x = int((nw - 1536) * fx); im = im.crop((x, 0, x + 1536, 2736)).filter(ImageFilter.UnsharpMask(2, 60, 2))
    im.save(f'{D}/cenas/{k}.png')
if not os.path.exists(f'{D}/musica_b.mp3'): shutil.copy(f'{R}/07-outubro-rosa/musica_b.mp3', f'{D}/musica_b.mp3')
shutil.copy(f'{R}/07-outubro-rosa/build_audio.py', f'{D}/build_audio.py')
if '--preview' in sys.argv:
    subprocess.run(['python3', f'{R}/render_generic.py', D, '--preview'], check=True); sys.exit()
subprocess.run(['python3', f'{R}/render_generic.py', D], check=True, stdout=open(f'{D}/render.log', 'w'))
subprocess.run(['python3', f'{D}/build_audio.py'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{D}/reel-mudo.mp4', '-i', f'{D}/mix.m4a', '-map', '0:v', '-map', '1:a',
                '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', '-shortest', f'{D}/reel-final.mp4'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '0.9', '-i', f'{D}/reel-final.mp4', '-frames:v', '1', '-q:v', '3', f'{D}/capa.jpg'], check=True)
print('pronto', D)
