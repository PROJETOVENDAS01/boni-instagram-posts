#!/usr/bin/env python3
"""Render do Reel BONI 01 - Beneficio PME (1080x1920, 30fps).
Cenas (cenas/1..6.png) com Ken Burns + transicoes, legenda que acende palavra por palavra,
tela final com CTA. Uso: python3 render.py [--preview]"""
import json, math, subprocess, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = '/home/claude/brand/kit/boni-instagram'
W, H, FPS = 1080, 1920, 30
GOLD = (245, 184, 0)
GOLD_L = (255, 214, 92)
PREVIEW = '--preview' in sys.argv

sys.path.insert(0, HERE)
import timing
words = timing.WORDS
DUR = timing.DUR
FB = f'{KIT}/fontes/Poppins-Bold.ttf'
FM = f'{KIT}/fontes/Poppins-Medium.ttf'

# ---------- cenas ----------
BOUNDS = timing.BOUNDS  # inicio de cada cena
END_START = timing.END_START
TR = 0.42  # duracao das transicoes
KINDS = ['flash', 'push', 'glitch', 'wipe', 'zoom', 'whip']  # transicao que ENTRA em cada cena (1..6) e no cartao

def load_scene(i):
    im = Image.open(f'{HERE}/cenas/{i}.png').convert('RGB')
    s = max(W * 1.25 / im.width, H * 1.25 / im.height)
    return im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)

SC = [load_scene(i) for i in range(1, 7)]

# vinheta + tom dourado
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
vig = 1 - 0.55 * (((xx - W / 2) / (W / 1.1)) ** 2 + ((yy - H / 2) / (H / 1.05)) ** 2)
vig = np.clip(vig, 0.25, 1)[..., None]
rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 5.0, (H, W, 1)).astype(np.float32) for _ in range(4)]

def kb(i, t_local, dur):
    """frame Ken Burns da cena i (0..5) no tempo local."""
    im = SC[i]
    p = min(max(t_local / max(dur, 0.01), 0), 1)
    z = 1.0 + 0.16 * p if i % 2 == 0 else 1.16 - 0.16 * p
    base_w, base_h = im.width, im.height
    # centro desloca levemente
    dx = (0.5 + (0.04 if i % 3 == 0 else -0.04) * (p - 0.5)) * base_w
    dy = (0.5 + (0.03 if i % 2 else -0.03) * (p - 0.5)) * base_h
    cw, ch = base_w / 1.25 / z, base_h / 1.25 / z
    box = (dx - cw / 2, dy - ch / 2, dx + cw / 2, dy + ch / 2)
    fr = im.resize((W, H), Image.BILINEAR, box=box)
    a = np.asarray(fr, dtype=np.float32)
    # grade: escurece, aquece
    a = a * np.array([1.0, 0.95, 0.85], dtype=np.float32) * 0.88
    a = a * vig
    return a

def scene_at(t):
    """retorna (indice, t_local, duracao) da cena ativa em t."""
    for i in range(6):
        end = BOUNDS[i + 1] if i < 5 else END_START
        if BOUNDS[i] <= t < end or (i == 5 and t >= BOUNDS[5]):
            return i, t - BOUNDS[i], end - BOUNDS[i]
    return 5, t - BOUNDS[5], END_START - BOUNDS[5]

def ease(x):
    x = min(max(x, 0), 1)
    return x * x * (3 - 2 * x)

# ---------- cartao final ----------
def end_card_base():
    a = np.zeros((H, W, 3), np.float32)
    # brilho dourado suave
    d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - 760) / H) ** 2)
    glow = np.clip(1 - d * 2.6, 0, 1) ** 2
    a += glow[..., None] * np.array([70, 48, 0], np.float32)
    # usa a cena 6 muito escurecida ao fundo
    bg = kb(5, 3.0, 3.0) * 0.10
    a = a + bg
    return a

END_BASE = None

def make_end_layer():
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    logo = Image.open(f'{KIT}/marca/emblema.png').convert('RGB')
    # emblema com fundo preto -> usa luminosidade como alfa
    lg = logo.resize((300, 300), Image.LANCZOS)
    arr = np.asarray(lg, dtype=np.float32)
    lum = np.clip(arr.max(axis=2) / 255 * 1.6, 0, 1)
    rgba = np.dstack([arr, lum * 255]).astype(np.uint8)
    img.alpha_composite(Image.fromarray(rgba, 'RGBA'), (W // 2 - 150, 330))
    f1 = ImageFont.truetype(FM, 46)
    d.text((W // 2, 700), 'PLANO DE SAÚDE EMPRESARIAL', font=f1, fill=(255, 255, 255, 230), anchor='mm')
    f2 = ImageFont.truetype(FB, 64)
    d.text((W // 2, 800), 'Comente', font=f2, fill=(255, 255, 255, 255), anchor='mm')
    return img

def make_end_button():
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FB, 54)
    bw, bh = 520, 118
    x0, y0 = (W - bw) // 2, 1390
    d.rounded_rectangle((x0, y0, x0 + bw, y0 + bh), radius=59, fill=GOLD + (255,))
    tw = d.textlength('Link na bio', font=f)
    tx = (W - (tw + 62)) / 2
    cy = y0 + bh // 2
    d.text((tx, cy + 2), 'Link na bio', font=f, fill=(10, 10, 10, 255), anchor='lm')
    ax = tx + tw + 30
    d.rectangle((ax - 4, cy - 6, ax + 4, cy + 24), fill=(10, 10, 10, 255))
    d.polygon([(ax, cy - 26), (ax - 20, cy - 2), (ax + 20, cy - 2)], fill=(10, 10, 10, 255))
    fa = ImageFont.truetype(FM, 27)
    d.text((W // 2, 1540), 'Carências, rede e valores variam por operadora e produto.',
           font=fa, fill=(255, 255, 255, 190), anchor='mm')
    return img

def make_pme_layer():
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FB, 230)
    # glow
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(g).text((W // 2, 985), 'PME', font=f, fill=GOLD + (255,), anchor='mm')
    glow = g.filter(ImageFilter.GaussianBlur(28))
    img.alpha_composite(glow)
    img.alpha_composite(g)
    return img

END_LAYER = make_end_layer()
END_BTN = make_end_button()
END_PME = make_pme_layer()

def rgba_over(a, layer, alpha=1.0, dy=0, scale=1.0):
    """compoe layer RGBA (PIL) sobre array float a."""
    if scale != 1.0:
        nw, nh = int(layer.width * scale), int(layer.height * scale)
        l2 = layer.resize((nw, nh), Image.BILINEAR)
        cx, cy = W // 2, 985
        tmp = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        tmp.paste(l2, (int(cx - cx * scale), int(cy - cy * scale) + int(dy)))
        layer = tmp
    elif dy:
        tmp = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        tmp.paste(layer, (0, int(dy)))
        layer = tmp
    la = np.asarray(layer, dtype=np.float32)
    al = (la[..., 3:4] / 255.0) * alpha
    return a * (1 - al) + la[..., :3] * al

# ---------- kinetic text ----------
KIN = {}
def kin_layer(txt, size, y):
    key = (txt, size, y)
    if key not in KIN:
        g = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(g)
        f = ImageFont.truetype(FB, size)
        d.text((W // 2, y), txt, font=f, fill=GOLD_L + (255,), anchor='mm')
        glow = g.filter(ImageFilter.GaussianBlur(22))
        out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        out.alpha_composite(glow)
        out.alpha_composite(g)
        KIN[key] = out
    return KIN[key]

KINETIC = timing.KINETIC

def apply_kinetic(a, t):
    for txt, size, y, s, e in KINETIC:
        if s <= t <= e + 0.25:
            k = ease((t - s) / 0.28)
            out = 1 - ease((t - e) / 0.25) if t > e else 1
            sc = 0.6 + 0.4 * k
            layer = kin_layer(txt, size, y)
            # escala em torno do ponto (W/2, y)
            nw, nh = int(W * sc), int(H * sc)
            l2 = layer.resize((nw, nh), Image.BILINEAR)
            tmp = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            tmp.paste(l2, (int(W / 2 - (W / 2) * sc), int(y - y * sc)))
            la = np.asarray(tmp, dtype=np.float32)
            al = la[..., 3:4] / 255.0 * k * out
            a = a * (1 - al) + la[..., :3] * al
    return a

# ---------- legenda ----------
def chunks():
    out, cur = [], []
    for w in words:
        cur.append(w)
        if w['t'][-1] in '.,' or len(cur) >= 4:
            out.append(cur); cur = []
    if cur: out.append(cur)
    return out

CH = chunks()
CAP_Y = 1250
FCAP = ImageFont.truetype(FB, 76)
CACHE = {}

def cap_layer(ci, active):
    key = (ci, active)
    if key in CACHE: return CACHE[key]
    ws = CH[ci]
    texts = [w['t'].rstrip('.,').upper() for w in ws]
    tmpd = ImageDraw.Draw(Image.new('RGBA', (10, 10)))
    sp = 26
    wd = [tmpd.textlength(t, font=FCAP) for t in texts]
    total = sum(wd) + sp * (len(texts) - 1)
    # quebra em 2 linhas se muito largo
    lines = [list(range(len(texts)))]
    if total > 860:
        mid = (len(texts) + 1) // 2
        lines = [list(range(0, mid)), list(range(mid, len(texts)))]
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer); ds = ImageDraw.Draw(shadow)
    ly = CAP_Y - (len(lines) - 1) * 50
    for li, idxs in enumerate(lines):
        lw = sum(wd[i] for i in idxs) + sp * (len(idxs) - 1)
        x = (W - lw) / 2
        for i in idxs:
            if i < active: col = (255, 255, 255, 255)
            elif i == active: col = GOLD + (255,)
            else: col = (255, 255, 255, 95)
            ds.text((x + 3, ly + 5), texts[i], font=FCAP, fill=(0, 0, 0, 230), anchor='lm')
            d.text((x, ly), texts[i], font=FCAP, fill=col, anchor='lm')
            x += wd[i] + sp
        ly += 100
    sh = shadow.filter(ImageFilter.GaussianBlur(10))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.alpha_composite(sh); out.alpha_composite(sh); out.alpha_composite(layer)
    arr = np.asarray(out, dtype=np.float32)
    CACHE[key] = arr
    return arr

def caption(a, t):
    for ci, ws in enumerate(CH):
        s, e = ws[0]['s'] - 0.05, ws[-1]['e'] + 0.18
        if s <= t <= e:
            act = 0
            for i, w in enumerate(ws):
                if t >= w['s'] - 0.02: act = i
            arr = cap_layer(ci, act)
            fin = ease((t - s) / 0.14)
            fout = 1 - ease((t - (e - 0.1)) / 0.1)
            al = arr[..., 3:4] / 255.0 * min(fin, fout)
            if fin < 1:
                shift = int((1 - fin) * 26)
                arr2 = np.roll(arr, shift, axis=0)
                al = arr2[..., 3:4] / 255.0 * fin
                return a * (1 - al) + arr2[..., :3] * al
            return a * (1 - al) + arr[..., :3] * al
    return a

# ---------- logo topo ----------
LOGO = None
def logo_layer():
    lg = Image.open(f'{KIT}/marca/logo-horizontal.png').convert('RGB')
    s = 330 / lg.width
    lg = lg.resize((330, int(lg.height * s)), Image.LANCZOS)
    arr = np.asarray(lg, dtype=np.float32)
    lum = np.clip(arr.max(axis=2) / 255 * 1.7, 0, 1)
    rgba = np.dstack([arr, lum * 255]).astype(np.uint8)
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    img.alpha_composite(Image.fromarray(rgba, 'RGBA'), ((W - lg.width) // 2, 300))
    return np.asarray(img, dtype=np.float32)
LOGO = logo_layer()

# ---------- transicoes ----------
def transition(A, B, p, kind, seed):
    p = ease(p)
    if kind == 'flash':
        # zoom rapido em A, flash dourado no meio, B entra
        f = 1 - abs(p - 0.5) * 2
        mix = A * (1 - p) + B * p
        flash = np.array([255, 190, 40], np.float32) * (f ** 2) * 0.95
        return np.clip(mix + flash, 0, 255)
    if kind == 'push':
        off = int(p * H)
        out = np.empty_like(A)
        out[:H - off] = A[off:]
        out[H - off:] = B[:off]
        edge = max(H - off - 3, 0)
        out[edge:edge + 6] = np.array(GOLD, np.float32)
        return out
    if kind == 'glitch':
        out = (A * (1 - p) + B * p) if p > 0.5 else A.copy()
        r = np.random.default_rng(seed + int(p * 20))
        for _ in range(14):
            y0 = int(r.integers(0, H - 80)); hh = int(r.integers(20, 110)); sh = int(r.integers(-90, 90))
            out[y0:y0 + hh] = np.roll(out[y0:y0 + hh], sh, axis=1)
        sh = int(26 * math.sin(p * math.pi))
        out[..., 0] = np.roll(out[..., 0], sh, axis=1)
        out[..., 2] = np.roll(out[..., 2], -sh, axis=1)
        return np.clip(out, 0, 255)
    if kind == 'wipe':
        # varredura diagonal com barra dourada
        d = (xx / W * 0.45 + yy / H * 0.55)
        thr = p * 1.25 - 0.12
        m = (d < thr)[..., None]
        out = np.where(m, B, A)
        band = (np.abs(d - thr) < 0.012)[..., None]
        return np.where(band, np.array(GOLD, np.float32), out)
    if kind == 'zoom':
        # A cresce e some, B chega de dentro
        s = 1 + p * 0.5
        ia = Image.fromarray(np.clip(A, 0, 255).astype(np.uint8)).resize((int(W * s), int(H * s)), Image.BILINEAR)
        x0, y0 = (ia.width - W) // 2, (ia.height - H) // 2
        a2 = np.asarray(ia.crop((x0, y0, x0 + W, y0 + H)), dtype=np.float32)
        return np.clip(a2 * (1 - p) + B * p, 0, 255)
    if kind == 'whip':
        off = int(p * W)
        out = np.empty_like(A)
        out[:, :W - off] = A[:, off:]
        out[:, W - off:] = B[:, :off]
        # blur horizontal barato
        k = max(1, int(30 * math.sin(p * math.pi)))
        if k > 1:
            c = np.cumsum(out, axis=1)
            c = np.concatenate([np.zeros((H, 1, 3), np.float32), c], axis=1)
            idx = np.arange(W)
            lo = np.clip(idx - k, 0, W); hi = np.clip(idx + k, 0, W)
            out = (c[:, hi] - c[:, lo]) / (hi - lo)[None, :, None]
        return out
    return B

def frame_for(t):
    # fundo de cena ou cartao
    # transicoes centradas em cada fronteira
    bounds = BOUNDS[1:] + []  # fronteiras: BOUNDS[1..5] e END_START
    bnd = list(BOUNDS[1:]) + [END_START]
    cur = None
    for bi, b in enumerate(bnd):
        if b - TR / 2 <= t < b + TR / 2:
            p = (t - (b - TR / 2)) / TR
            kind = KINDS[bi]
            if bi < 5:
                A = kb(bi, t - BOUNDS[bi], bnd[bi] - BOUNDS[bi] if bi < 5 else 3)
                B = kb(bi + 1, max(t - BOUNDS[bi + 1], 0), (bnd[bi + 1] if bi + 1 < 6 else END_START) - BOUNDS[bi + 1] if bi + 1 < 6 else 3)
            else:
                A = kb(5, t - BOUNDS[5], END_START - BOUNDS[5])
                B = end_bg(t)
            cur = transition(A, B, p, kind, bi * 100)
            break
    if cur is None:
        if t >= END_START + TR / 2:
            cur = end_bg(t)
        else:
            i, tl, du = scene_at(t)
            cur = kb(i, tl, du)
    return cur

def end_bg(t):
    global END_BASE
    if END_BASE is None:
        END_BASE = end_card_base()
    a = END_BASE.copy()
    k = ease((t - END_START) / 0.6)
    a = rgba_over(a, END_LAYER, alpha=k)
    # PME pop
    kp = ease((t - (END_START + 0.35)) / 0.35)
    if kp > 0:
        a = rgba_over(a, END_PME, alpha=kp, scale=0.7 + 0.3 * kp)
    kb2 = ease((t - (END_START + 1.0)) / 0.4)
    if kb2 > 0:
        a = rgba_over(a, END_BTN, alpha=kb2, dy=(1 - kb2) * 40)
    return a

def full_frame(t):
    a = frame_for(t)
    # grain
    a = a + GRAIN[int(t * FPS) % 4]
    # logo topo (nas cenas, nao no cartao final)
    if t < END_START - 0.2:
        la = LOGO[..., 3:4] / 255.0 * 0.9 * ease(t / 0.5)
        a = a * (1 - la) + LOGO[..., :3] * la
    a = apply_kinetic(a, t)
    a = caption(a, t)
    return np.clip(a, 0, 255).astype(np.uint8)

def main():
    out = f'{HERE}/reel-mudo.mp4'
    n = int(DUR * FPS)
    if PREVIEW:
        os.makedirs(f'{HERE}/prev', exist_ok=True)
        for tt in [0.8, 3.56, 6.0, 9.2, 15.9, 18.5, 22.0, 27.0, 29.5]:
            Image.fromarray(full_frame(tt)).save(f'{HERE}/prev/f_{tt:05.2f}.png')
        return
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(n):
        pr.stdin.write(full_frame(i / FPS).tobytes())
        if i % 60 == 0: print(i, '/', n, flush=True)
    pr.stdin.close(); pr.wait()

if __name__ == '__main__':
    main()
