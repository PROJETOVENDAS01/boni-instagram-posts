#!/usr/bin/env python3
"""Amplia pausas entre frases: python3 splice.py audio_in raw_words.json audio_out.wav words_out.json"""
import json, subprocess, sys
src, rawp, outa, outw = sys.argv[1:5]
w = json.load(open(rawp))  # [[texto, inicio, fim], ...]
INS = {'proposta.': 0.55, 'proposta!': 0.45, 'parecido.': 0.2, 'oferece.': 0.45, 'boa.': 0.5, 'boa!': 0.45, 'vida.': 0.15, 'dias.': 0.45, 'indicar.': 0.45}
import numpy as np
_a = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout, dtype=np.int16).astype(np.float32) / 32768
def _db(t):
    seg = _a[int(t * 16000):int((t + 0.01) * 16000)]
    return 20 * np.log10(np.sqrt((seg ** 2).mean() + 1e-12)) if len(seg) else -99
def _cut_point(e):
    """meio da zona de silencio entre a palavra que termina em e e o inicio da proxima (medido no audio)."""
    t = max(e - 0.1, 0.0); ss = None
    while t < e + 1.0:
        if _db(t) < -58:
            if ss is None: ss = t
        else:
            if ss is not None and t - ss >= 0.03:
                return round((ss + t) / 2, 3)   # silencio real encontrado: corta no meio
            ss = None
        t += 0.005
    return round(e + 0.02, 3)
cuts = [(_cut_point(e), INS[t]) for t, s, e in w if t in INS]
print('cortes:', cuts)
sr = 44100; fc = []; labels = []; prev = 0.0; idx = 0
for c, sil in cuts + [(None, 0)]:
    end = c if c is not None else 60
    fc.append(f"[0:a]atrim=start={prev}:end={end},asetpts=PTS-STARTPTS,aresample={sr},aformat=channel_layouts=mono,afade=t=in:d=0.008,areverse,afade=t=in:d=0.008,areverse[s{idx}]"); labels.append(f"[s{idx}]"); idx += 1
    if c is not None:
        fc.append(f"anullsrc=r={sr}:cl=mono,atrim=0:{sil},asetpts=PTS-STARTPTS[z{idx}]"); labels.append(f"[z{idx}]"); idx += 1
    prev = end
fc.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1[out]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-filter_complex', ";".join(fc), '-map', '[out]', '-ar', str(sr), outa], check=True)
res = []
for t, s, e in w:
    ss = sum(sil for c, sil in cuts if c <= s + 1e-6); se = sum(sil for c, sil in cuts if c <= e + 1e-6)
    res.append({'t': t, 's': round(s + ss, 3), 'e': round(e + se, 3)})
json.dump(res, open(outw, 'w'), ensure_ascii=False)
print(res[-1])
