import json,re
segs=[("A Amil",0.33,0.76),("tá com",0.85,1.10),("cinquenta",1.19,1.74),("por cento",1.83,2.42),("de desconto",2.51,2.94),("na primeira e na segunda mensalidade!",3.06,4.21),
("É no plano pelo CNPJ,",4.69,6.04),("a partir de",6.39,6.88),("duas vidas,",6.96,7.52),("inclusive pra MEI.",7.86,8.63),
("E ainda",9.17,9.47),("tem Amil Resgate e odonto grátis em todos os planos.",9.56,11.53),
("Mas é por tempo limitado.",11.74,12.54),("Me chama que eu faço",12.95,14.04),("a sua cotação agora.",14.39,16.33)]
w=lambda t:len(re.sub(r'\W','',t))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words50.json","w"),ensure_ascii=False)
print([(o["t"],o["s"]) for o in out if re.search(r'Amil|odonto|todos|CNPJ|duas|MEI|tempo',o["t"])])
