import json,re
segs=[("Desde 2011 eu ajudo gente do Rio a escolher plano de saúde.",0.31,3.64),("E sabe o que eu mais escuto?",4.04,5.07),
("Eu não entendo nada de plano.",5.80,7.02),("Tudo bem.",7.48,7.81),("Você não precisa entender.",8.39,9.42),
("Eu comparo as operadoras por você,",9.92,11.31),("olho rede,",11.79,12.34),("carência e o que cabe no seu bolso,",12.53,14.17),
("e te explico tudo do jeito simples.",14.53,16.07),("Pra você,",16.95,17.49),("pra sua família ou pra sua empresa,",17.65,19.23),("até MEI.",19.38,19.85),
("Comenta",20.34,20.71),("PLANO,",20.85,21.16),("ou chama no link da bio.",21.47,22.54)]
ALT={'2011':'doismileonze','MEI.':'meii'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words14.json","w"),ensure_ascii=False)
print(len(out))
