#!/usr/bin/env python3
"""Alinha palavras do roteiro ao audio: sentencas coladas nas pausas detectadas, palavras por peso. Uso: align.py pasta"""
import sys, re, json, subprocess
d = sys.argv[1]
wav = f'{d}/narracao_final.wav'
dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',wav]))
out = subprocess.run(['ffmpeg','-i',wav,'-af','silencedetect=noise=-35dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]
du = [float(x) for x in re.findall(r'silence_duration: ([\d.]+)',out)]
sil = list(zip(st, [s+x for s,x in zip(st,du)]))
t0 = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
tend = sil[-1][0] if sil and sil[-1][1] >= dur-0.05 else dur
sil = [s for s in sil if s[0] > t0+0.05 and s[1] < tend-0.05]
text = open(f'{d}/roteiro.txt').read().replace('\n',' ')
sents = [s.strip() for s in re.findall(r'[^.?!]+[.?!]', text)]
w = lambda t: len(re.sub(r'\W','',t))+2
sw = [sum(w(x) for x in s.split()) for s in sents]
tot = sum(sw)
bounds=[t0]; cum=0; used=set()
for i in range(len(sents)-1):
    cum += sw[i]
    pred = t0 + (tend-t0)*cum/tot
    c = [(abs((a+b)/2-pred)-2.5*(b-a),j) for j,(a,b) in enumerate(sil) if j not in used and abs((a+b)/2-pred) < 1.3]
    if c:
        j = min(c)[1]; used.add(j); bounds.append(sil[j])
    else:
        bounds.append((pred-0.1,pred+0.1))
words=[]
for i,s in enumerate(sents):
    a = bounds[i] if i==0 else bounds[i][1]
    b = tend if i==len(sents)-1 else bounds[i+1][0]
    a = t0 if i==0 else a
    ws = s.split(); ww=[w(x) for x in ws]; T=sum(ww); t=a
    for x,k in zip(ws,ww):
        e = t+(b-a)*k/T
        words.append({'t':x,'s':round(t,2),'e':round(e-0.04,2)}); t=e
json.dump(words,open(f'{d}/words.json','w'),ensure_ascii=False)
print(d, round(dur,2), len(words), 'palavras;', 'sentencas', len(sents), 'pausas usadas', len(used))
for i,s in enumerate(sents): print(' ', round([x for x in words if True][sum(len(q.split()) for q in sents[:i])]['s'],2), s)
