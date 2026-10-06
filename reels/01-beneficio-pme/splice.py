#!/usr/bin/env python3
"""Amplia pausas entre frases: python3 splice.py audio_in raw_words.json audio_out.wav words_out.json"""
import json, subprocess, sys
src, rawp, outa, outw = sys.argv[1:5]
w = json.load(open(rawp))  # [[texto, inicio, fim], ...]
INS = {'proposta.': 0.55, 'parecido.': 0.25, 'oferece.': 0.5, 'boa.': 0.5, 'vida.': 0.2, 'dias.': 0.5, 'indicar.': 0.5}
cuts = [(round(e + 0.06, 3), INS[t]) for t, s, e in w if t in INS]
sr = 44100; fc = []; labels = []; prev = 0.0; idx = 0
for c, sil in cuts + [(None, 0)]:
    end = c if c is not None else 60
    fc.append(f"[0:a]atrim=start={prev}:end={end},asetpts=PTS-STARTPTS,aresample={sr},aformat=channel_layouts=mono[s{idx}]"); labels.append(f"[s{idx}]"); idx += 1
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
