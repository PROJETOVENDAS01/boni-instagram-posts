#!/usr/bin/env python3
"""Mixa narracao + trilha (estendida) + impactos suaves nos cortes. Uso: python3 build_audio.py"""
import numpy as np, wave, subprocess, os, sys
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
import timing as T
sr = 44100; dur = T.DUR
out = np.zeros(int(sr * (dur + 1)), np.float32)
rng = np.random.default_rng(3)
def hit(t0, d=0.45):
    n = int(sr * d); tt = np.arange(n) / sr
    sub = np.sin(2 * np.pi * (62 - 24 * tt / d) * tt) * np.exp(-tt * 8) * 0.55
    x = rng.normal(0, 1, n).astype(np.float32); y = np.zeros(n, np.float32); s = 0
    for i in range(n):
        s += 0.012 * (x[i] - s); y[i] = s
    swell = y * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * 14 * 0.10
    i0 = max(int(t0 * sr - 0.05 * sr), 0); seg = sub + swell
    out[i0:i0 + n] += seg[:len(out) - i0]
for t in list(T.BOUNDS[1:]) + [T.END_START]: hit(t)
w = wave.open(f'{H}/fx.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
# trilha estendida: musica + final (a partir de 12s) com crossfade de 3s
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{H}/musica_a.mp3', '-i', f'{H}/musica_a.mp3', '-filter_complex',
    '[1:a]atrim=start=11,asetpts=PTS-STARTPTS[b];[0:a][b]acrossfade=d=3:c1=tri:c2=tri[m]', '-map', '[m]', f'{H}/musica_longa.wav'], check=True)
fade_st = dur - 2.0
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{H}/narracao_final.wav', '-i', f'{H}/musica_longa.wav', '-i', f'{H}/fx.wav',
    '-filter_complex',
    f'[0:a]apad=whole_dur={dur},volume=1.15,asplit=2[v1][v2];'
    f'[1:a]atrim=0:{dur},volume=0.28,afade=t=in:d=0.6,afade=t=out:st={fade_st}:d=2[m];'
    '[2:a]volume=0.5[f];'
    '[m][v1]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=300[md];'
    '[v2][md][f]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95[a]',
    '-map', '[a]', '-t', str(dur), '-c:a', 'aac', '-b:a', '192k', f'{H}/mix.m4a'], check=True)
print('ok', dur)
